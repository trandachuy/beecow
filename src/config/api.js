import axios from 'axios';
import Constant from './Constant';
import authenticate from '../services/authenticate';
import storageService from '../services/storage';
import {NAV_PATH} from '../components/layout/navigation/Navigation';
import Cookies from 'js-cookie';
import Qs from 'qs'

const setupAuthenticationHeader = request => {
    if (!request.headers['Content-Type']) {
        request.headers['Content-Type'] = 'application/json; text/plain';
    }
    if (!request.headers['Accept']) {
        request.headers['Accept'] = 'application/json, text/plain, application/stream+json';
    }
    const ati = Cookies.get('_ati');
    if (ati) {
        request.headers['ati'] = ati;
    }
    if (!request.headers['Time-Zone']) {
        try {
            request.headers['Time-Zone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (error) {
            request.headers['Time-Zone'] = 'UTC';
        }
    }


    setAuthorizationHeader(request)
    return request;
};

// Store requests
const sourceRequest = {};

const setupCancelRequest = request => {
    // Store or update application token
    const axiosSource = getCancelTokenSource();
    sourceRequest[request.url] = { cancel: axiosSource.cancel };
    request.cancelToken = axiosSource.token;

    return request;
}

const getCancelTokenSource = () => {
    return axios.CancelToken.source()
}

const setAuthorizationHeader = (axiosConfig) => {
    const token = sessionStorage.getItem(Constant.STORAGE_KEY_ACCESS_TOKEN) || localStorage.getItem(Constant.STORAGE_KEY_ACCESS_TOKEN);
    axiosConfig.headers.Authorization = token ? `Bearer ${ token }` : '';
}

const recallApi = config => {
    return new Promise(function (resolve, reject) {
        setAuthorizationHeader(config);

        return axios.request(config)
            .then((...args) => {
                config.success && config.success(...args)
                resolve(args);
            })
            .catch((...args) => {
                config.error && config.error(...args)
                reject(args);
            });
    })
}

const recallApis = configs => {
    if (!configs.length) {
        return Promise.resolve()
    }

    return Promise.any(configs.map(s => recallApi(s)))
}

let refreshing = false;
let unauthorizedApiConfigs = [];

const handleUnauthorizedError = (error) => {
    if (error.isSkipXHR) {
        return Promise.reject(error);
    }
    if (error.request?.message === 'Network Error') {
        window.location.href = NAV_PATH.error;
        return;
    }

    const originalRequestConfig = error.response?.config;

    if (error.response?.status === Constant.HTTP_STATUS_BAD_GATEWAY) {
        window.location.href = NAV_PATH.error;
        return
    }

    if (error.response?.status === Constant.HTTP_STATUS_UNAUTHORIZED && originalRequestConfig.url.indexOf('authenticate') === -1) {
        unauthorizedApiConfigs.push(originalRequestConfig)

        if (!refreshing) {
            refreshing = true;

            return authenticate.refreshJwt(storageService.get(Constant.STORAGE_KEY_REFRESH_TOKEN))
                .then(() => recallApis(unauthorizedApiConfigs), () => {
                    if (originalRequestConfig.url.indexOf('authenticate') === -1) {
                        storageService.removeAll();
                        window.location.href = NAV_PATH.login;
                    }
                })
                .finally(() => {
                    unauthorizedApiConfigs = []
                    refreshing = false
                });
        }
    }

    return Promise.reject(error);
};

const REQUEST_METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    PATCH: 'patch',
    HEAD: 'head',
    DELETE: 'delete'
}

const apiClient = () => {
    const defaultOptions = {
        baseURL: process.env.API_BASE_URL,
        paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' })
    };

    // Create instance
    let instance = axios.create(defaultOptions);
    instance.defaults.timeout = 60 * 2 * 1_000;

    // Setup request interceptors
    instance.interceptors.request.use(setupAuthenticationHeader);
    instance.interceptors.request.use(setupCancelRequest);

    // Handle Unauthorized error
    instance.interceptors.response.use((response) => response, handleUnauthorizedError);

    return instance;
};

const withRefreshToken = apiClient => {
    const ALLOWED_CONFIG_KEYS = ['headers', 'paramsSerializer', 'responseType']
    const doPromise = (method, url, data, _config) => {
        return new Promise(function (resolve, reject) {
            let config = {
                success: resolve,
                error: function (error) {
                    const originalRequestConfig = error.response?.config;

                    if (error.response?.status === Constant.HTTP_STATUS_UNAUTHORIZED && originalRequestConfig.url.indexOf('authenticate') === -1) {
                        return
                    }

                    reject(error);
                }
            }

            for (let key of ALLOWED_CONFIG_KEYS) {
                config = {
                    ..._config,
                    ...config,
                    ..._.pick(data, key)
                }
            }

            apiClient({
                method,
                url,
                data: _.isObject(data) && !_.isArray(data) && !(data instanceof FormData) ? _.omit(data, 'params') : data,
                params: _.isObject(data) && !_.isArray(data) && !(data instanceof FormData) ? _.pick(data, 'params')?.params : undefined,
                ...config
            })
                .then(config.success)
                .catch(config.error)
        })
    }

    Object.values(REQUEST_METHOD).forEach(method => {
        apiClient[method] = (url, data, config) => doPromise(method, url, data, config)
    })

    return apiClient
}

export default withRefreshToken(apiClient());
