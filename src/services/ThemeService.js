import apiClient from "../config/api";
import Constants from "../config/Constant";
import storageService from "./storage";
import {CredentialUtils} from "../utils/credential";

const fetchListByStore = (storeId, params) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/themes/store/${storeId}`, {params: params})
            .then(result => {
                if (result.data) {
                    resolve({
                        data: result.data,
                        total: parseInt(result.headers['x-total-count'])
                    });
                }
            }, (e) => reject(e))
    })
};


const getActiveThemeOfStore = (storeId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/store-themes/active/store/${storeId}`)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const getThemeDetail = (themeId) => {
    const langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/themes/${themeId}/name?lang=${langKey}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e))
    })
};

const getThemeDetailForEdit = (themeId) => {
    const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
    const langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY)
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/store/${storeId}/themes/${themeId}/components?langKey=${langKey}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e))
    })
};

const saveTheme = (data) => {
    const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
    const langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY)
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.THEME_SERVICE}/api/store/${storeId}/themes/structure?langKey=${langKey}`,data)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e))
    })
};

const getThemeDefault = () => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/themes/getDefaultTheme`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e))
    })
};

const getAllLandingPageTemplate = (stPage = 0, stSize = 9999) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/landing-page-templates`, {
            params: {
                page: stPage,
                size: stSize
            }
        })
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e))
    })
}

const getLandingPageTemplate = (id) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/landing-page-templates/${id}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e))
    })
}

const getLandingPageByStore = (params) => {
    return new Promise(((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/landing-pages`,{params: params})
            .then(result => {
                if (result.data) {
                    resolve(result);
                }
            }, (e) => reject(e));
    }))
}

const getLandingPageById = (id) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise(((resolve, reject) => {
        apiClient.get(`/${Constants.THEME_SERVICE}/api/landing-pages/${storeId}/${id}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e));
    }))
}

const createLandingPage = (requestBody) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise(((resolve, reject) => {
        apiClient.post(`/${Constants.THEME_SERVICE}/api/landing-pages/${storeId}`, requestBody)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e));
    }))
}


const updateLandingPage = (requestBody) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise(((resolve, reject) => {
        apiClient.put(`/${Constants.THEME_SERVICE}/api/landing-pages/${storeId}`, requestBody)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e));
    }))
}

const publishLandingPage = (params) => {
    return new Promise(((resolve, reject) => {
        apiClient.post(`/${Constants.THEME_SERVICE}/api/landing-pages/publish/${params.storeId}/${params.id}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e));
    }))
}

const draftLandingPage = (params) => {
    return new Promise(((resolve, reject) => {
        apiClient.post(`/${Constants.THEME_SERVICE}/api/landing-pages/un-publish/${params.storeId}/${params.id}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e));
    }))
}
const deleteLandingPage = (params) => {
    return new Promise(((resolve, reject) => {
        apiClient.delete(`/${Constants.THEME_SERVICE}/api/landing-pages/store/${params.storeId}/delete/${params.id}`)
            .then(result => {
                if(result.status === 204) {
                    resolve(result);
                }
            }, (e) => reject(e));
    }))
}

const cloneLandingPage = (params) => {
    return new Promise(((resolve, reject) => {
        apiClient.post(`/${Constants.THEME_SERVICE}/api/landing-pages/store/${params.storeId}/clone/${params.id}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            }, (e) => reject(e));
    }))
}

const multiDeleteLandingPage = (params) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise(((resolve, reject) => {
        apiClient.post(`/${Constants.THEME_SERVICE}/api/landing-pages/store/${storeId}/multi-delete`,params)
            .then(result => {
                if(result.status === 204) {
                    resolve(result);
                }
            }, (e) => reject(e));
    }))
}

export const ThemeService = {
    fetchListByStore,
    getActiveThemeOfStore,
    getThemeDetailForEdit,
    saveTheme,
    getThemeDetail,
    getThemeDefault,
    getAllLandingPage: getAllLandingPageTemplate,
    getLandingPageByStore,
    createLandingPage,
    getLandingPageById,
    updateLandingPage,
    publishLandingPage,
    cloneLandingPage,
    draftLandingPage,
    deleteLandingPage,
    multiDeleteLandingPage,
    getLandingPageTemplate,
}
