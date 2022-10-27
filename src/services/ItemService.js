/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";
import {CredentialUtils} from "../utils/credential";
import qs from 'qs';
import PubSub from 'pubsub-js';
import moment from "moment";
import React from "react";

const create = (itemRequest) => {
    return new Promise((resolve, reject) => {
        let timeOut = setTimeout(() => {
            reject('timeOut')
        }, 30000)
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/items?fromSource=DASHBOARD`, itemRequest)
            .then(result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                    PubSub.publish(Constants.SUB_PUB_TOPIC.TOUR.CREATE_PRODUCT_SUCCESS, Constants.SUB_PUB_TOPIC.TOUR.CREATE_PRODUCT_SUCCESS);
                }
            }, (e) => reject(e))
    })
};

const fetch = (itemId) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/beehive-items/${itemId}?langKey=${initLanguage}`)
            .then(result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const update = (itemRequest) => {
    return new Promise((resolve, reject) => {
        let timeOut = setTimeout(() => {
            reject('timeOut')
        }, 30000)
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items?fromSource=DASHBOARD`, itemRequest)
            .then(result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const remove = (itemId) => {
    return new Promise((resolve, reject) => {
        let timeOut = setTimeout(() => {
            reject('timeOut')
        }, 30000)
        apiClient.delete(`/${Constants.ITEM_SERVICE}/api/items/${itemId}`)
            .then(result => {
                clearTimeout(timeOut)
                resolve(result)
            }, (e) => reject(e))
    })
};

const migrateMappingItem = (storeId) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/mapping-items/${storeId}/migrate`)
            .then(result => {
                resolve(result)
            }, (e) => reject(e))
    })
}

const createMenuDefault = (storeId) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/menus/create-default-menu/${storeId}`)
            .then(result => {
                resolve(result)
            }, (e) => reject(e))
    })
}

const fetchDashboardItems = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/store/dashboard/${storeId}/items-v2?langKey=${initLanguage}`, {
            params: params,
            paramsSerializer: params => {
                return qs.stringify(params, {indices: false})
            }
        })
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const fetchDashboardServices = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/store/dashboard/${storeId}/service?langKey=${initLanguage}`, {params: params})
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const getUnSyncProduct = (channelId, page, sizePerPage, keyword) => {
    const userId = CredentialUtils.getStoreOwnerId()
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    const keywordParam = keyword ? `&keyword=${keyword}` : ''
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/${userId}/unsync/${storeId}?channelId=${channelId}&page=${page}&size=${sizePerPage}&sort=id%2Cdesc${keywordParam}`)
            .then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                });
            }, (e) => reject(e))
    })
}

const getCollectionsList = (itemType) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/list/${storeId}?page=0&size=${5000}&itemType=${itemType}&langKey=${initLanguage}`)
            .then(result => {
                resolve({
                    data: result.data.lstCollection,
                    total: result.data.totalItem
                });
            }, (e) => reject(e))
    })
}

const getSimpleCollectionsList = (itemType) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/simple/list/${storeId}?itemType=${itemType}&langKey=${initLanguage}`)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const getCollectionsByItemId = (itemId) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/products/${itemId}?langKey=${initLanguage}`)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const createCollectionForItemId = (itemId, collectionList) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/collections/product_create/${storeId}/${itemId}`, collectionList)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const createService = (data) => {
    return new Promise((resolve, reject) => {
        let timeOut = setTimeout(() => {
            reject('timeOut')
        }, 30000)
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/service/items`, data)
            .then(result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const updateService = (data) => {
    return new Promise((resolve, reject) => {
        let timeOut = setTimeout(() => {
            reject('timeOut')
        }, 30000)
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/service/items`, data)
            .then(result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const checkIsDepositItem = (itemId) => {
    return new Promise((resolve, reject) => {
        let timeOut = setTimeout(() => {
            reject('timeOut')
        }, 30000)
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-is-deposit/item-ids/${itemId}`)
            .then(result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
}

const fetchDashboardReview = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-reviews/store/${storeId}?langKey=${initLanguage}`, {
            params: params
        })
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const fetchItemReviewEnableStatus = (data) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/item-review-visible/store/${storeId}`, data)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const setItemReviewEnableStatusForItem = (data) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/item-reviews/availability`, data)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const fetchStoreReviewEnableStatus = () => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/store-item-reviews/store/${storeId}`)
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const setReviewEnableStatusForStore = (data) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/store-item-reviews`, data)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const fetchDashboardSupplier = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.ITEM_SERVICE}/api/suppliers/store/${storeId}?langKey=${initLanguage}`, {
                params: params
            })
                .then(result => {
                    resolve(result);
                }, (e) => reject(e))
        })
}

const searchSupplier = (page, size, sort, keyword) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/suppliers/store/${storeId}/supplier`, {
            params: {
                page: page,
                size: size,
                sort: sort,
                nameOrCode: keyword
            }
        })
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const searchSupplierByName = (page, size, sort, keyword) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/suppliers/store/${storeId}/supplier/name`, {
            params: {
                page,
                size,
                sort,
                keyword
            }
        })
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const fetchPurchaseOrder = (queryParams, page, size) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/purchase-orders/store-id/${storeId}`, {
            params: {
                ...queryParams,
                page, size,
                sort: 'id,desc'
            }
        })
            .then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                });
            }, reject)
    })
}

const searchPurchaseOrder = (queryParams, page, size) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/purchase-orders/store-id/${storeId}/search`, {
            params: {
                ...queryParams,
                page, size,
                sort: 'id,desc'
            }
        })
            .then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                });
            }, reject)
    })
}

const getProductSuggestionByName = (page, size, searchType = 'PRODUCT_NAME', keyword, ignoreDeposit = false, branchId = '', options) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/store/${storeId}/item-model/suggestion?langKey=${initLanguage}`, {
            params: {
                page: page,
                size: size,
                searchType: searchType,
                keyword: _.trim(keyword),
                ignoreDeposit: ignoreDeposit,
                branchId,
                ...options
            }
        })
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

/*
    productList: [
        {
            itemId
            modelId
            quantity
        }
    ]
 */
const updateInStoreProductQuantity = (productList) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/instore/update-quantity`, productList)
            .then(result => {
                resolve(result);
            }, (e) => reject(e))
    })
}

const getItemByItemId = (itemId) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/full/${itemId}?langKey=${initLanguage}`)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const uploadImagesForProduct = (data, itemId) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/item-images/add-image/${storeId}/${itemId}`, data)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const updateModelItem = (item) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/item-model/${storeId}`, item)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const updateStatusModelItem = (modelId, status) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/item-model/change-status/${storeId}/${modelId}?status=${status}`)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const getItemModelById = (id) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-model/${storeId}/${id}?langKey=${initLanguage}`)
            .then(result => {
                resolve(result.data);
            }, (e) => reject(e))
    })
}

const fetchInventoryItems = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/inventory-summary/${storeId}/items?langKey=${initLanguage}`,
            {
                params: params,
                paramsSerializer: params => {
                    return qs.stringify(params, {indices: false})
                }
            })
            .then((result) => {
                resolve(result);
            }, (e) => reject(e))
    })
};

const getInventory = (itemId, modelId = undefined) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/inventories-view?langKey=${initLanguage}`, {
            params: {
                itemId, modelId
            }
        })
            .then(result => {
                resolve(result.data)
            })
            .catch(reject)
    })
}

/**
 * @param {UpdateStockRequestBodyModel} requestBody
 */
const updateInventory = (requestBody) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/inventories/${storeId}`, {
            ...requestBody
        })
            .then(result => {
                resolve(result.data)
            })
            .catch(reject)
    })
}

const exportProducts = (data = []) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/items/gss-export/${storeId}`, data)
            .then(result => {
                resolve(result)
            }).catch(reject)
    })
}

const exportProductsAllExcel = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const langKey = CredentialUtils.getLangKey();
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/export-gosell-excel/${storeId}?langKey=${langKey}`, {
            params: params,
            paramsSerializer: params => {
                return qs.stringify(params, {indices: false})
            },
            headers:
                {
                    'Content-Disposition': "attachment; filename=template.xlsx",
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
            responseType: 'arraybuffer',
        })
            .then(result => {
                resolve(result)
            }).catch(reject)
    })
}

const exportProductsAllCSV = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const langKey = CredentialUtils.getLangKey();
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/export-gosell-csv/${storeId}?langKey=${langKey}`, {
            params: params,
            paramsSerializer: params => {
                return qs.stringify(params, {indices: false})
            },
        })
            .then(result => {
                resolve(result)
            }).catch(reject)
    })
}

const exportWholesalePrice = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const langKey = CredentialUtils.getLangKey();
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/export/${storeId}?langKey=${langKey}`, {
            params: params,
            paramsSerializer: params => {
                return qs.stringify(params, {indices: false})
            },
            headers:
                {
                    'Content-Disposition': "attachment; filename=template.xlsx",
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
            responseType: 'arraybuffer',
        })
            .then(result => {
                resolve(result)
            }).catch(reject)
    })
}

const getInventoryHistory = (requestParams, page, size) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/inventory-search/${storeId}?langKey=${initLanguage}`, {
            params: {
                ...requestParams,
                page, size
            }
        })
            .then(result => {
                resolve({
                    totalItem: parseInt(result.headers['x-total-count']),
                    data: result.data
                })
            })
            .catch(reject)
    })
}

const getInventoryHistoryOperatorList = () => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/inventory-search/find-operators/${storeId}`)
            .then(result => {
                resolve(result.data)
            })
            .catch(reject)
    })
}

const getAllMenus = () => {
    const storeId = CredentialUtils.getStoreId()

    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/menus?sellerId=${storeId}`)
            .then(result => {
                resolve(result.data)
            })
            .catch(reject)
    })
}

const importItemList = (file, branchIds) => {
    let dataForm = new FormData()
    dataForm.append('file', file)
    dataForm.append('branchId', branchIds);

    return new Promise((resolve, reject) => {
        const langKey = CredentialUtils.getLangKey();
        const storeId = CredentialUtils.getStoreId();
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/items/import-gosell/${storeId}?langKey=${langKey}`, dataForm)
            .then(result => {
                resolve(result.data)
            }).catch(reject)
    })
}

const importWholesalePriceList = (file, branchIds) => {
    let dataForm = new FormData()
    dataForm.append('file', file)
    dataForm.append('branchId', branchIds);

    return new Promise((resolve, reject) => {
        const langKey = CredentialUtils.getLangKey();
        const storeId = CredentialUtils.getStoreId();
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/items/import-wholesale-price/${storeId}?langKey=${langKey}`, dataForm)
            .then(result => {
                resolve(result.data)
            }).catch(reject)
    })
}

const getItemImportTemplate = () => {

    return new Promise((resolve, reject) => {
        const langKey = CredentialUtils.getLangKey();
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/get-import-item-template?langKey=${langKey}`, {
            headers:
                {
                    'Content-Disposition': "attachment; filename=template.xlsx",
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
            responseType: 'arraybuffer',
        })
            .then(result => {
                resolve(result.data)
            }).catch(reject)
    })
}

const getWholesalePriceTemplate = () => {

    return new Promise((resolve, reject) => {
        const langKey = CredentialUtils.getLangKey();
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/get-wholesale-price-template?langKey=${langKey}`, {
            headers:
                {
                    'Content-Disposition': "attachment; filename=template.xlsx",
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
            responseType: 'arraybuffer',
        })
            .then(result => {
                resolve(result.data)
            }).catch(reject)
    })
}

const migrateToNewCustomPage = () => {
    return new Promise((resolve, reject) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/store/${CredentialUtils.getStoreId()}/pages/migrate`)
            .then(resolve)
            .catch(reject);
    });
}

const getItemListByIdList = (ids) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/by-list-id?langKey=${initLanguage}`, {
            params: {
                ids
            }
        })
            .then(res => resolve(res.data))
            .catch(reject);
    });
}

/**
 *
 * @param requestParams
 * @returns {Promise<unknown>}
 */
const getInventorySummaryBranchesDetail = ({itemId, modelId}) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
        apiClient.get(`${Constants.ITEM_SERVICE}/api/inventory-summary-branches/detail/${storeId}?langKey=${initLanguage}`, {
            params: {
                itemId, modelId
            }
        })
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    }))
}

/**
 * @param {UpdateInventoryStockRequestModel} request
 */
const updateInventoryStock = (request) => {
    return new Promise(((resolve, reject) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/inventory-summary/update-inventory-page`, request)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    }))
}

/**
 * Get flash sale time of store
 * @param itemId
 * @param modelId
 * @returns {Promise<List<FlashSaleTimeModel>>}
 */
const getFlashSaleTimeOfStore = (page, sizePerPage) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        let query = '?'

        if (page || page == 0) {
            query = query.concat('page=' + page)

            if (sizePerPage) {
                query = query.concat('&size=' + sizePerPage)
            }
        }

        apiClient.get(`${Constants.ITEM_SERVICE}/api/flash-sale-time/store/${storeId}${query}`)
            .then(res => {
                resolve({
                    data: res.data,
                    total: parseInt(res.headers['x-total-count'])
                });
            })
            .catch(reject)
    }))
}

/**
 * Add new flash sale time
 * @param {FlashSaleTimeModel} data
 * @returns {Promise<FlashSaleTimeModel>}
 */
const addFlashSaleTime = (data) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/flash-sale-time`, data)
            .then(result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

/**
 * Delete flash sale time by ID
 * @param id flash sale time
 * @returns {Promise<unknown>}
 */
const deleteFlashSaleTime = (id) => {
    return new Promise((resolve, reject) => {
        apiClient.delete(`/${Constants.ITEM_SERVICE}/api/flash-sale-time/${id}`)
            .then(result => {
                resolve(result)
            }, (e) => reject(e))
    })
};

/**
 * Create campaign
 * @param data
 * @returns {Promise<unknown>}
 */
const createCampaign = (data) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/campaigns/${storeId}`, data)
            .then(result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

/**
 * Edit campaign
 * @param data
 * @returns {Promise<unknown>}
 */
const editCampaign = (data) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/campaigns/${storeId}`, data)
            .then(result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

/**
 * Get flash sale campaigns of store
 * @param itemId
 * @param modelId
 * @returns {Promise<List<FlashSaleTimeModel>>}
 */
const getFlashSaleCampaigns = (page, sizePerPage, options) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
        let query = '?'

        if (page || page == 0) {
            query = query.concat('page=' + page)

            if (sizePerPage) {
                query = query.concat('&size=' + sizePerPage)
            }
            if (options.fromTime) {
                query = query.concat('&fromTime=' + options.fromTime)
            }
            if (options.toTime) {
                query = query.concat('&toTime=' + options.toTime)
            }
            if (options.sort) {
                query = query.concat('&sort=' + options.sort)
            }
            if (options.status) {
                query = query.concat('&status=' + options.status)
            }

            query = query.concat('&langKey=' + initLanguage)
        }

        apiClient.get(`${Constants.ITEM_SERVICE}/api/campaigns/search/${storeId}${query}`)
            .then(res => {
                resolve({
                    data: res.data,
                    total: parseInt(res.headers['x-total-count'])
                });
            })
            .catch(reject)
    }))
}

/**
 * Get flash sale campaign detail
 * @param itemId
 * @param modelId
 * @returns {Promise<List<FlashSaleTimeModel>>}
 */
const getFlashSaleCampaignDetail = (campaignId) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);

        apiClient.get(`${Constants.ITEM_SERVICE}/api/campaigns/${campaignId}?storeId=${storeId}&langKey=${initLanguage}`)
            .then(res => {
                if (res.data) {
                    resolve(res.data)
                }
            })
            .catch(reject)
    }))
}
/**
 * Check existed item barcode
 * @param barcodeList
 * @return {Promise<ItemBarcodeVMModel[]|Error>}
 */
const checkExistedItemByBarcodeList = (barcodeList) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/existed/barcode/${storeId}`, {
            params: {
                barcodeList
            }
        })
            .then(res => resolve(res.data))
            .catch(reject)
    }))
}

const getItemByBarcode = (barcode) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/barcode/${barcode}/${storeId}?langKey=${initLanguage}`, {
        })
            .then(res => resolve(res.data))
            .catch(reject)
    }))
}

const getFlashSaleDate = () => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()

        apiClient.get(`${Constants.ITEM_SERVICE}/api/campaigns/time-frame/${storeId}`)
            .then(res => {
                if (res.data) {
                    const result = res.data.reduce((dates, timeFrame) => {
                        const startTime = moment(Date.parse(timeFrame.startTime)).startOf("day");
                        if (_.findIndex(dates, date => startTime.isSame(date)) === -1) {
                            dates.push(startTime);
                        }
                        return dates;
                    }, []);
                    resolve(result);
                }
            })
            .catch(reject)
    }))
}

const endCampaign = (campaignId) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()

        apiClient.post(`${Constants.ITEM_SERVICE}/api/campaigns/end-early/${campaignId}?storeId=${storeId}`)
            .then(res => {
                if (res.data) {
                    resolve(res.data)
                }
            })
            .catch(reject)
    }))
}

const deleteCampaign = (campaignId) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()

        apiClient.delete(`${Constants.ITEM_SERVICE}/api/campaigns/delete/${campaignId}?storeId=${storeId}`)
            .then(resolve)
            .catch(reject)
    }))
}

const searchItemCanLinkToShopeeItem = (keyword, variationNum, options) => {
    return new Promise(((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/can-link-shopee`, {
            params: {
                storeId,
                langKey: initLanguage,
                name: keyword,
                variationNum,
                ...options
            }
        })
            .then(res => {
                const totalItem = parseInt(res.headers['x-total-count'])

                if (res.data) {
                    resolve(res.data);
                }
            })
            .catch(reject)
    }))
}

const deletedProductItemId = (ids) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/delete/${storeId}`, ids)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

const changeStatusBulkOfItems = (data, status) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/status`, {storeId, itemIds:data, status})
            .then(resolve)
            .catch(reject);
    });
}

const updateTaxBulkOfItems = (itemIds, taxId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/tax`, {
            storeId,
            itemIds,
            taxId
        })
            .then(resolve)
            .catch(reject);
    });
}

const updateShowOutOfStock = (itemIds, productRadioGroup) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/showOutOfStock`, {
            storeId,
            itemIds,
            showOutOfStock:productRadioGroup
        })
            .then(resolve)
            .catch(reject);
    });
}

const updateMultiplePlatformProduct = (itemIds, platform) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/platform`, {
            storeId,
            itemIds,
            onApp:platform.onApp,
            onWeb:platform.onWeb,
            inStore:platform.inStore,
            inGosocial:platform.inGosocial
        })
            .then(resolve)
            .catch(reject);
    });
}

const deletedClearStockId = (ids, deleteShopee) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/items/reset-stock-to-zero/${storeId}?deleteShopee=${deleteShopee}`, ids)
            .then(result => {
                if (result.data) {
                    resolve(result.data);
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

function getGsVariationByBcItemId(bcItemId) {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/can-link-shopee/variations/${bcItemId}?langKey=${initLanguage}`)
            .then(result => resolve(result.data))
            .catch(e => reject(e));
    });
}

function getStatusOfResttingStock() {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/get-status-reset-stock-to-zero/${storeId}`)
            .then(result => resolve(result.data))
            .catch(e => reject(e));
    });
}

function updateItemLanguage(data) {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/item-languages`,data)
            .then(result => resolve(result.data), reject);
    });
}


function updateBulkOfItemModelLanguages(data) {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/item-model-languages/bulk`,data)
            .then(result => resolve(result.data), reject);
    });
}



/**
 * @param menuId
 * @return {Promise<MenuItemLanguageDTOModel[]>}
 */
const getMenuItemLanguagesByMenuId = (menuId) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ITEM_SERVICE}/api/menu-item-languages/menu-id/${menuId}/${storeId}?langKey=${initLanguage}`)
            .then(result => resolve(result.data))
            .catch(reject)
    })
}

/**
 * @param {MenuItemLanguageDTOModel[]} menuItemLanguageDTOList
 * @return {Promise<MenuItemLanguageDTOModel[]>}
 */
const updateMenuItemLanguages = (menuItemLanguageDTOList) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.put(`${Constants.ITEM_SERVICE}/api/menu-item-languages/${storeId}`, menuItemLanguageDTOList)
            .then(result => resolve(result.data))
            .catch(reject)
    })
}

const getLanguagesByCollectionId = (collectionId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collection-languages/collection/${collectionId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const upsertCollectionLanguage = (body) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/collection-languages`,body)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getItemModelLanguage = (modelId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-model-languages/model/${modelId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const upsertItemModelLanguage = (body) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/item-model-languages`,body)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getLanguagesByItemId=(itemId)=>{
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-languages/item/${itemId}`)
            .then(result=>{
                resolve(result.data);
            },reject)
    })
}

/**
 *
 * @param {CreateTransferModel} data
 * @returns {Promise<unknown>}
 */
const createTransfer = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/transfers/create`, data)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 *
 * @param {CreateTransferModel} data
 * @returns {Promise<unknown>}
 */
const createAffiliateTransfer = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/affiliate-transfers/create`, data)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 *
 * @param {CreateTransferModel} data
 * @returns {Promise<unknown>}
 */
const updateTransfer = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/transfers/update`, data)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 *
 * @param {CreateTransferModel} data
 * @returns {Promise<unknown>}
 */
const updateAffiliateTransfer = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/affiliate-transfers/update`, data)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Get transfer list
 * @param {TransferQueryParams} queryParams
 * @return Promise<{data: TransferDTO[], total: number}>
 */
const getTransferList = (queryParams, page, size) => {
    return new Promise((resolve,reject)=>{
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/transfers/store/${storeId}`, {
            params: {
                ...queryParams,
                page, size,
                sort: 'id,desc'
            }
        })
            .then(result=>{
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                });
            },reject)
    })
}

/**
 * Get transfer by id
 * @param {number} transferId
 * @return Promise<{TransferDTO}>
 */
const getTransferById = (transferId, options = {}) => {
    const storeId = CredentialUtils.getStoreId()
    const langKey = CredentialUtils.getInitialLanguage();
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/transfers/detail/${storeId}/${transferId}`, {
            params: {
                langKey,
                ...options
            }
        })
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * cancel transfer by id
 * @param {number} transferId
 * @param {string} note
 * @return Promise<{TransferDTO}>
 */
 const cancelTransferById = (transferId, reason = "") => {
    const storeId = CredentialUtils.getStoreId()
    const transfer = {id: transferId, storeId: storeId, note: reason};
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/transfers/cancel`, transfer)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * cancel transfer by id
 * @param {number} transferId
 * @param {string} note
 * @return Promise<{TransferDTO}>
 */
const cancelAffiliateTransferById = (transferId, reason = "") => {
    const storeId = CredentialUtils.getStoreId()
    const transfer = {id: transferId, storeId: storeId, note: reason};
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/affiliate-transfers/cancel`, transfer)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * move to delivery action of transfer
 * @param {number} transferId
 * @return Promise<{TransferDTO}>
 */
 const transferShipGoods = (transferId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/transfers/ship/${storeId}/${transferId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * move to delivery action of transfer
 * @param {number} transferId
 * @return Promise<{TransferDTO}>
 */
const transferAffiliateShipGoods = (transferId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/affiliate-transfers/ship/${storeId}/${transferId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * completed transfer
 * @param {number} transferId
 * @return Promise<{TransferDTO}>
 */
 const transferReceivedGoods = (transferId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/transfers/receive/${storeId}/${transferId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * completed transfer
 * @param {number} transferId
 * @return Promise<{TransferDTO}>
 */
const transferAffiliateReceivedGoods = (transferId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/affiliate-transfers/receive/${storeId}/${transferId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * @description Get transfer history
 * @return Promise<{data: TransferHistoryDTO[]}>
 * @param transferId
 */
 const getTransferHistory = (transferId) => {
    return new Promise((resolve,reject)=>{
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/transfer/histories/${storeId}/${transferId}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

/**
 * @description Get transfer available staff
 * @return {Promise<StoreStaffDTO[]>}
 */
const getTransferAvailableStaff = () => {
    return new Promise((resolve,reject)=>{
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/transfers/available-staffs/${storeId}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}


/**
 * @description Get Collection-product
 * @return {Promise<CollectionProductDTO[]>}
 * @param collectionId
 */
const getCollectionById = (collectionId) => {
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collection-products/collection/${collectionId}?langKey=${initLanguage}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

const createSupplier = (data) => {
    return new Promise((resolve,reject)=>{
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/suppliers`,data)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

const getSupplier = (id) => {
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/suppliers/${id}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

const updateSupplier=(data)=>{
    return new Promise((resolve,reject)=>{
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/suppliers`,data)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

const deleteSupplier=(id)=>{
    return new Promise((resolve,reject)=>{
        apiClient.delete(`/${Constants.ITEM_SERVICE}/api/suppliers/status/${id}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

const getSupplierByNameOrCode=(storeId,option,codeOrName)=>{
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/suppliers/store/${storeId}/existed?searchType=${option}&searchValue=${codeOrName}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}



/**
 * Get item progress list of store
 * @param
 * @returns {Promise<ItemProgressHandling[]>}
 */
const getListProgressItem=()=>{
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-progress-handlings/${storeId}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

/**
 * Get multiple item inventory
 * @param ids
 * @returns {Promise<InventoryMultipleItemResponse>}
 */
const getMultipleItemInventory = (ids) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/get-multiple-item-inventory/${storeId}`, {
                params: {
                    ids
                }
            })
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getListPriceByMultipleItem = (ids) => {
    return new Promise ((rs, rj) => {
        const storeId = CredentialUtils.getStoreId()
        const langKey = CredentialUtils.getLangKey();
        apiClient.get(`${Constants.ITEM_SERVICE}/api/items/multiple-item-price/${storeId}?langKey=${langKey}`, {
            params: {
                ids
            }
        })
        .then(result => {
            rs(result.data)
        }, rj)
    })
}
const updateListPriceByMultipleItem = (request) => {
    return new Promise ((resolve, reject)=> {
        const storeId = CredentialUtils.getStoreId()
        const langKey = CredentialUtils.getLangKey();
        apiClient.put(`${Constants.ITEM_SERVICE}/api/items/multiple-item-price/${storeId}?langKey=${langKey}`, request)
        .then(result => {
            resolve(result.data)
        }, reject)
    })

}

/**
 * Get multiple item inventory
 * @param ids
 * @returns {Promise<InventoryMultipleItemResponse>}
 */
const updateMultipleItemInventory = (request) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.put(`${Constants.ITEM_SERVICE}/api/items/update-multiple-item-inventory/${storeId}`, request)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Get histories of purchase order
 * @param purchaseOrderId
 * @returns {Promise<PurchaseOrderHistoryDTO>}
 */
const getPurchaseOrderHistory = (purchaseOrderId) => {
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/purchase-order-histories/purchase-order/${purchaseOrderId}`)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}

/**
 * Check purchase ID of purchase order exist
 * @param purchaseId
 * @returns {Promise<Boolean>}
 */
const checkExistPurchaseOrderId = (purchaseId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/purchase-orders/purchase-id/check-existence`, {
            params: {
                purchaseId,
                storeId
            }
        })
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Get purchase order
 * @param {number} orderId
 * @returns {Promise<PurchaseOrderDTO>}
 */
const getPurchaseOrderById = (orderId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/purchase-orders/${orderId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Create purchase order
 * @param {PurchaseOrderDTO} data
 * @returns {Promise<PurchaseOrderDTO>}
 */
const createPurchaseOrder = (data) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/purchase-orders`, data)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Update purchase order
 * @param {PurchaseOrderDTO} data
 * @returns {Promise<PurchaseOrderDTO>}
 */
const updatePurchaseOrder = (data) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/purchase-orders`, data)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Approve purchase order
 * @param {number} purchaseOrderId
 * @returns {Promise<PurchaseOrderDTO>}
 */
const approvePurchaseOrder = (purchaseOrderId) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.put(`/${ Constants.ITEM_SERVICE }/api/purchase-orders/approve/${ storeId }/${ purchaseOrderId }`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Complete purchase order
 * @param {number} purchaseOrderId
 * @returns {Promise<PurchaseOrderDTO>}
 */
const completePurchaseOrder = (purchaseOrderId) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.put(`/${ Constants.ITEM_SERVICE }/api/purchase-orders/receive/${ storeId }/${ purchaseOrderId }`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

/**
 * Cancel purchase order
 * @param {number} purchaseOrderId
 * @param {string} note
 * @returns {Promise<PurchaseOrderDTO>}
 */
const cancelPurchaseOrder = (purchaseOrderId, note) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/purchase-orders/cancel/${storeId}/${purchaseOrderId}`, {
            note
        })
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getPartnerProductInventory = (page, size, options) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient
            .get(
                `/${ Constants.ITEM_SERVICE }/api/partner-inventory/store/${ storeId }`, {
                    params: {
                        page,
                        size, ...options
                    }
                })
            .then((result) => {
                resolve(result)
            }, (e) => reject(e))
    });
};

const getCommissionRateOfItemModel = (resellerStoreId, itemId, modelId) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient
            .get(
                `/${ Constants.ITEM_SERVICE }/api/commissions/store/${ storeId }/item/${ itemId }`, {
                    params: {
                        modelId,
                        resellerStoreId
                    }
                })
            .then(rs => resolve(rs.data))
            .catch(reject)
    })
}

const getCommissionRateOfItemModels = (resellerStoreId, itemModelIds) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient
            .get(
                `/${ Constants.ITEM_SERVICE }/api/commissions/store/${ storeId }/item`, {
                    params: {
                        itemModelIds,
                        resellerStoreId
                    }
                })
            .then(rs => resolve(rs.data))
            .catch(reject)
    })
}

const searchItemModelCodeForStore = (params) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient
            .get(
                `/${ Constants.ITEM_SERVICE }/api/item-model-codes/store/${ storeId }/search`, {
                    params: params
                })
            .then(rs => resolve(rs))
            .catch(reject)
    })
}

const checkValidCode = (itemId, code) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${ Constants.ITEM_SERVICE }/api/item-model-codes/item/${ itemId }/check-code`, code)
            .then(result => {
                resolve(result.data)
            }, (e) => reject(e))
    })
}

/** @typedef {object} ItemModelCodeDTO
 * @property {number} branchId
 * @property {string} code
 * @property {number} id
 * @property {number} itemId
 * @property {number} modelId
 * @property {string} status
 */

/** @typedef {object} ItemModelCodeQueryParams
 * @property {number[]} branchIds
 * @property {number} itemId
 * @property {number} modelId
 * @property {string} status
 */


/**
 *
 * @param {ItemModelCodeQueryParams} requestParams
 * @param page
 * @param size
 * @return {Promise<{data: ItemModelCodeDTO[], total: Number}>}
 */
const getInventoryTrackingIMEIList  = (requestParams, page, size) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/item-model-codes/store/${storeId}`, {
            params: {
                ...requestParams,
                page, size
            }
        })
            .then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                });
            }, (e) => reject(e))
    })
}

/**
 *
 * @param {number[]} requestParams
 * @returns {Promise<unknown>}
 */
const getCodeByItemModelIds = (itemModelIds, status) => {
    return new Promise(((resolve, reject) => {
        apiClient.get(`${ Constants.ITEM_SERVICE }/api/item-model-codes/item-model`, {
            params: {
                itemModelIds,
                status
            }
        })
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    }))
}

/**
 *
 * @param {ItemModelCodeDTO[]} requestParams
 * @returns {Promise<unknown>}
 */
const upsertItemModelCode = (itemModelCodeDTOS) => {
    return new Promise(((resolve, reject) => {
        apiClient.put(`${ Constants.ITEM_SERVICE }/api/item-model-codes`, {
            params: {
                itemModelCodeDTOS
            }
        })
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    }))
}

const getAllWholesalePrice = (itemId, page) => {
    return new Promise ((rs, rj) => {
        const langKey = CredentialUtils.getLangKey();
        apiClient.get(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/edit/${itemId}?langKey=${langKey}`, {
            params: {
                page: page,
                size:100
            }
        })
        .then(result => {
            rs(result.data)
        }, rj)
    })
}

const updateWholeSalePrice = (request) => {
    return new Promise ((resolve, reject)=> {

        const langKey = CredentialUtils.getLangKey();
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing?langKey=${langKey}`, request)
        .then(result => {
            resolve(result.data)
        }, reject)
    })

}

const getWholeSalePriceByModel = (itemId, itemModelIds, page) => {
    return new Promise ((rs, rj) => {
         apiClient.get(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/edit/model/${itemId}`,{
            params:{
                page: page,
                size: 100,
                itemModelIds: itemModelIds
            }
        })
        .then(result => {
            rs(result.data)
        }, rj)
    })

}

const deleteWholeSalePriceByModel = (itemId, itemModelIds) => {
    return new Promise ((rs, rj) => {
         apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/delete/model/${itemId}/${itemModelIds}`, )
        .then(result => {
            rs(result.data)
        }, rj)
    })

}
const deleteWholesalePriceByListModel = (itemId, listModels) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/delete/list-model/${itemId}`, listModels)
       .then(result => {
           rs(result.data)
       }, rj)
   })
}

const deleteAllWholeSalePrices = (itemId) => {
    return new Promise ((rs, rj) => {
        const langKey = CredentialUtils.getLangKey();
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/delete/${itemId}`)
        .then(result => {
            rs(result.data)
        }, rj)
    })

}

const updateVariationByGroupItemModel = (request) => {
    return new Promise ((rs, rj) => {
        const langKey = CredentialUtils.getLangKey();
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/update/model?langKey=${langKey}`, request)
        .then(result => {
            rs(result.data)
        }, rj)
    })
}

const deleteWholesalePricingByVariation = (request) => {
    return new Promise ((rs, rj)=> {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/update/model-from-detail`, request)
        .then(result => {
            rs(result.data)
        }, rj)
    })
}

const getAllItemModelCode = (itemId) => {
    return new Promise ((rs, rj) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ITEM_SERVICE}/api/item-model-codes/store/${storeId}/item/${itemId}?status=AVAILABLE`)
            .then(result => {
                rs(result.data)
            }, rj)
    })
}

const listWholesalePrice = (request) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/calculate-sale-price-list`,request)
            .then(result => {
                rs(result.data)
            }, rj)
    })
}
const checkFlashSaleOfProduct = (itemId) => {
    return new Promise ((rs, rj)=> {
        apiClient.get(`${Constants.ITEM_SERVICE}/api/campaigns/product/${itemId}/check/`)
        .then(result => {
            rs(result.data)
        }, rj)
    })
}
const checkMaxSellingPriceForWholesale = (request) => {
    return new Promise ((rs, rj)=> {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/wholesale-pricing/check-max-price`, request)
        .then(result => {
            rs(result.data)
        }, rj)
    })
}
const getListUnitConversion=(page, size, request)=>{
    return new Promise((resolve,reject)=>{
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/item/conversion-units/search?page=${page}&size=${size}`, request)
            .then(result=>{
                resolve(result.data)
            },reject)
    })
}
const createUnitConversion = (name) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/item/conversion-units`, name)
            .then(result => {
                rs(result.data)
            }, rj)
    })

}

const deleteUnitConversion = (id) => {
    return new Promise ((rs, rj) => {
        apiClient.delete(`${Constants.ITEM_SERVICE}/api/item/conversion-units/${id}`)
            .then(result => {
                rs(result.data)
            }, rj)
    })
}

const getConversionUnitItemByItemModelId = (itemModelId, quantity) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${ Constants.ITEM_SERVICE }/api/conversion-unit-items/itemModel/${ itemModelId }`, {
            params: { quantity }
        })
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getAllConversionUnits = (itemId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${ Constants.ITEM_SERVICE }/api/conversion-unit-items/edit/${ itemId }`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getAllTotalConversionUnits = (itemId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${ Constants.ITEM_SERVICE }/api/conversion-unit-items/edit/${ itemId }?isLoadAll=false`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const getConversionUnitByModel = (itemId, modelId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${ Constants.ITEM_SERVICE }/api/conversion-unit-items/edit/model/${ itemId }?modelId=${modelId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const editConversionUnitItem = (request) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/conversion-unit-items`, request)
        .then(result => {
            rs(result.data)
        }, rj)
    })
}

const getConversionUnitItemByItemId = (itemId, branchId) => {
    let url = `/${ Constants.ITEM_SERVICE }/api/conversion-unit-items/item/${ itemId }`
    if (branchId) {
        url += `?branchId=${branchId}`
    }
    return new Promise((resolve, reject) => {
        apiClient.get(url)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const checkConversionUnit = (id) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${ Constants.ITEM_SERVICE }/api/item/conversion-units/check-unit-is-used/${id}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}
// END

const deleteConversionUnitByVariation = (itemId, listModels) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/conversion-unit-items/delete/list-model/${ itemId }`, listModels)
        .then(result => {
            rs(result.data)
        }, rj)
    })
}
const getStockOrderEdit = (itemModelIds,branchId) => {
    return new Promise ((resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/items/remaining?itemModelIds=${itemModelIds}&branchId=${branchId}`)
            .then((result) => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    })
}
const deleteAllConversionUnitList = (itemId) => {
    return new Promise ((resolve, reject) => {
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/conversion-unit-items/delete/${itemId}`)
            .then((result) => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    })
}
const deleteVariationByModel = (itemId, itemModelIds) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/conversion-unit-items/delete/model/${itemId}/${itemModelIds}`, )
            .then(result => {
                rs(result.data)
            }, rj)
    })

}
const updateVariationByModel = (request) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/conversion-unit-items/update/model`, request)
            .then(result => {
                rs(result.data)
            }, rj)
    })

}
const updateVariationByModelNoConversionUnit = (request) => {
    return new Promise ((rs, rj) => {
        apiClient.post(`${Constants.ITEM_SERVICE}/api/conversion-unit-items/draft/model-list`, request)
            .then(result => {
                rs(result.data)
            }, rj)
    })

}

export const ItemService = {
    create,
    fetch,
    update,
    remove,
    migrateMappingItem,
    fetchDashboardItems,
    fetchDashboardServices,
    getUnSyncProduct,
    getCollectionsList,
    getCollectionsByItemId,
    createCollectionForItemId,
    createService,
    updateService,
    checkIsDepositItem,
    fetchDashboardReview,
    fetchDashboardSupplier,
    searchSupplier,
    searchSupplierByName,
    fetchPurchaseOrder,
    searchPurchaseOrder,
    getProductSuggestionByName,
    updateInStoreProductQuantity,
    getItemByItemId,
    uploadImagesForProduct,
    updateModelItem,
    updateStatusModelItem,
    getItemModelById,
    fetchInventoryItems,
    getInventory,
    updateInventory,
    exportProducts,
    exportProductsAllExcel,
    exportProductsAllCSV,
    exportWholesalePrice,
    getInventoryHistory,
    getInventoryHistoryOperatorList,
    getAllMenus,
    importItemList,
    importWholesalePriceList,
    getItemImportTemplate,
    getWholesalePriceTemplate,
    createMenuDefault,
    migrateToNewCustomPage,
    getItemListByIdList,
    getInventorySummaryBranchesDetail,
    updateInventoryStock,
    getFlashSaleTimeOfStore,
    addFlashSaleTime,
    deleteFlashSaleTime,
    createCampaign,
    editCampaign,
    getFlashSaleCampaigns,
    getFlashSaleCampaignDetail,
    checkExistedItemByBarcodeList,
    getItemByBarcode,
    getFlashSaleDate,
    endCampaign,
    deleteCampaign,
    searchItemCanLinkToShopeeItem,
    deletedProductItemId,
    deletedClearStockId,
    getGsVariationByBcItemId,
    getStatusOfResttingStock,
    changeStatusBulkOfItems,
    getMenuItemLanguagesByMenuId,
    getLanguagesByCollectionId,
    upsertCollectionLanguage,
    updateMenuItemLanguages,
    updateItemLanguage,
    updateBulkOfItemModelLanguages,
    getItemModelLanguage,
    upsertItemModelLanguage,
    getLanguagesByItemId,
    updateTaxBulkOfItems,
    createTransfer,
    createAffiliateTransfer,
    updateTransfer,
    updateAffiliateTransfer,
    getTransferList,
    getTransferById,
    cancelTransferById,
    cancelAffiliateTransferById,
    transferShipGoods,
    transferAffiliateShipGoods,
    transferReceivedGoods,
    transferAffiliateReceivedGoods,
    getTransferHistory,
    getTransferAvailableStaff,
    getCollectionById,
    updateShowOutOfStock,
    updateMultiplePlatformProduct,
    getSimpleCollectionsList,
    createSupplier,
    getSupplier,
    updateSupplier,
    deleteSupplier,
    getMultipleItemInventory,
    updateMultipleItemInventory,
    getListProgressItem,
    getSupplierByNameOrCode,
    getPurchaseOrderHistory,
    checkExistPurchaseOrderId,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    approvePurchaseOrder,
    completePurchaseOrder,
    cancelPurchaseOrder,
    getPartnerProductInventory,
    fetchItemReviewEnableStatus,
    setItemReviewEnableStatusForItem,
    fetchStoreReviewEnableStatus,
    setReviewEnableStatusForStore,
    getCommissionRateOfItemModel,
    getCommissionRateOfItemModels,
    searchItemModelCodeForStore,
    checkValidCode,
    getInventoryTrackingIMEIList,
    getCodeByItemModelIds,
    upsertItemModelCode,
    getListPriceByMultipleItem,
    updateListPriceByMultipleItem,
    getAllWholesalePrice,
    getWholeSalePriceByModel,
    updateWholeSalePrice,
    deleteWholeSalePriceByModel,
    deleteWholesalePriceByListModel,
    deleteAllWholeSalePrices,
    updateVariationByGroupItemModel,
    deleteWholesalePricingByVariation,
    getAllItemModelCode,
    listWholesalePrice,
    checkFlashSaleOfProduct,
    checkMaxSellingPriceForWholesale,
    getListUnitConversion,
    createUnitConversion,
    getConversionUnitItemByItemModelId,
    getAllConversionUnits,
    editConversionUnitItem,
    getConversionUnitItemByItemId,
    deleteUnitConversion,
    deleteConversionUnitByVariation,
    getStockOrderEdit,
    deleteAllConversionUnitList,
    checkConversionUnit,
    deleteVariationByModel,
    updateVariationByModel,
    updateVariationByModelNoConversionUnit,
    getConversionUnitByModel,
    getAllTotalConversionUnits
};
