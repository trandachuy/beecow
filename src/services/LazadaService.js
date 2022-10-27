import apiClient from '../config/api';
import Constants from "../config/Constant";
import { CredentialUtils } from '../utils/credential';
import storeService from "./storage";

const authorization = (params) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/authorize`, {params: params})
            .then(result => {
                if (result.data) {
                    storeService.setToLocalStorage(Constants.STORAGE_KEY_LAZADA_TOKEN, result.data);
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getCountryUserInfo = (params) =>{
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/client/countries`, {params: params})
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getSellerInfo = (params) =>{
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/seller`, {params: params})
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const connectSeller = (params) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/seller/connect`, {params: params})
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const deactivatedAccount = (params) =>{
    return new Promise((resolve, reject) => {
        apiClient.delete(`/${Constants.LAZADA_SERVICE}/api/client`, {params: params})
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getAccountByBcStoreId = (bcStoreId) =>{
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/client/stores/${bcStoreId}`)
            .then(result => {
                if (result.data) {
                    storeService.setToLocalStorage(Constants.STORAGE_KEY_LAZADA_TOKEN, result.data.accessToken);
                    if(result.data.sellerId)
                        storeService.setToLocalStorage(Constants.STORAGE_KEY_LAZADA_ID, result.data.sellerId);
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getOrderDetailWithUpdate = (orderId) => {
    const storeId = storeService.get('storeId');
    return new Promise( (resolve, reject) => {
        if (!storeId) {
            reject('storeIdNotFound')
        }
        apiClient.put(`/${Constants.LAZADA_SERVICE}/api/orders/${storeId}/details/${orderId}`)
            .then( result => {                  
                resolve(result.data)
            })
            .catch( reject )
    })
};

const getOrderDetail = (orderId) => {
    const storeId = storeService.get('storeId');
    return new Promise( (resolve, reject) => {
        if (!storeId) {
            reject('storeIdNotFound')
        }
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/orders/${storeId}/details/${orderId}`)
            .then( result => {                  
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
};

const cancelOrder = (bcStoreId, orderId, reasonId, reasonDetail) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`/${Constants.LAZADA_SERVICE}/api/orders/${bcStoreId}/cancel/${orderId}/${reasonId}/${reasonDetail}`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
};

const confirmOrder = (bcStoreId, orderId) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`/${Constants.LAZADA_SERVICE}/api/orders/${bcStoreId}/mark-order-ready-to-ship/${orderId}`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}

const getProducts = (params) =>{
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/products`,{params: params})
            .then( result => {
                if (result.data) {
                    resolve(result)
                }
            })
            .catch( reject )
    })
}
const fetchProducts = (params) =>{
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/products/fetch`,{params: params})
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
} 
const fetchOrders = (bcStoreId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/orders/${bcStoreId}/refresh-all`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}

const getProductById = (productId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/products/${productId}`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}
const getCategoryAttributes = (categoryId, params) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/categories/${categoryId}/attributes`, {params: params})
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}

const syncProduct = (params, data) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`/${Constants.LAZADA_SERVICE}/api/products/sync`, data, {params: params})
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}
const uploadImage = (params, data) =>{
    let formData = new FormData();
  
    data.forEach(item =>{
        formData.append('files', item, item.name);
    })
  
    return new Promise( (resolve, reject) => {
        apiClient.post(`/${Constants.LAZADA_SERVICE}/api/image/upload`, formData, {params: params})
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            
            .catch(reject)
    })
}

const getProductFetchStatus = () =>{
    const storeId = storeService.get('storeId');
    return new Promise( (resolve, reject) => {
        if (!storeId) {
            reject('storeIdNotFound')
        }
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/products/${storeId}/fetch_status`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}

const fetchAndSyncToBC = (overwrite, token) => {
    const storeId = storeService.get('storeId');
    return new Promise( (resolve, reject) => {
        if (!storeId) {
            reject('storeIdNotFound')
        }
        apiClient.post(`/${Constants.LAZADA_SERVICE}/api/products/${storeId}/fetch_and_sync?overwrite=${overwrite}&accessToken=${token}`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch( reject )
    })
}

const getDashboardOrder = (storeId, options) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/orders/${storeId}/paging`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const downloadShippingDocument = (data) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.LAZADA_SERVICE}/api/logistic/shipping-label`, data)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const disconnectLazada = () =>{
    const storeId = CredentialUtils.getStoreId();
    return new Promise((resolve, reject) => {
        apiClient.delete(`/${Constants.LAZADA_SERVICE}/api/client/disconnect/${storeId}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getCustomerSummary = (customerId) =>{
    return new Promise( (resolve, reject) => {
        const storeId = storeService.get('storeId');
        apiClient.get(`/${Constants.LAZADA_SERVICE}/api/customer_order/${storeId}/summary?username=${customerId}`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            })
            .catch(e => {
                reject(e);
            });
    });
};

export const lazadaService = {
    authorization,
    getCountryUserInfo,
    getSellerInfo,
    deactivatedAccount,
    connectSeller,
    getAccountByBcStoreId,
    getOrderDetail,
    getOrderDetailWithUpdate,
    cancelOrder,
    confirmOrder,
    getProducts,
    fetchProducts,
    fetchOrders,
    getProductById,
    getCategoryAttributes,
    syncProduct,
    uploadImage,
    getProductFetchStatus,
    fetchAndSyncToBC,
    getDashboardOrder,
    downloadShippingDocument,
    disconnectLazada,
    getCustomerSummary
};

