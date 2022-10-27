import apiClient from "../config/api";
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";


const getAllRevenue = (options) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/revenue/split`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getRevenueTrend = (options) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/revenue/trend`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getRevenueSummary = (options) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/summary`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getRevenueByGroup = (group, options) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/revenue/group/${group}`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};


const getLastSeenInfo = () => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/sync`)
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const updateLastSeenInfo = () => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.BILLING_INFO_SERVICE}/api/store/sync`)
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getTopSalesByInStoreStaff = (options) => {
    const storeId = CredentialUtils.getStoreId();

    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/top/staff`, {
            params: {
                storeId,
                ...options
            }
        })
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getTopSalesByItem = (options) => {
    const storeId = CredentialUtils.getStoreId();

    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/store/top/item`, {
            params: {
                storeId,
                ...options
            }
        })
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getAllStaffs = () => {
    const storeId = CredentialUtils.getStoreId();

    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.BILLING_INFO_SERVICE}/api/all-staffs/${storeId}/search`)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
};

export const BillingInfoService = {
    getRevenueTrend,
    getRevenueSummary,
    getRevenueByGroup,
    getLastSeenInfo,
    updateLastSeenInfo,
    getTopSalesByInStoreStaff,
    getAllRevenue,
    getTopSalesByItem,
    getAllStaffs
};
