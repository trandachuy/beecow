/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import apiClient from '../config/api'
import Constants from "../config/Constant";
import storageService from "./storage";

const getListCollection = (params) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/list/${storeId}`, {params: params})
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const getListCollectionWithKeyword = (page, size, keyword, itemType) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/search/${storeId}`,
            {params: {
                page: page,
                size: size,
                searchText: keyword,
                itemType: itemType
                }})
            .then( result => {
                if (result.data) {
                    resolve(result)
                }
            }, (e) => reject(e))
    })
}

const createCollection = (collectionRequest) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    collectionRequest.bcStoreId = storeId;
    return new Promise( (resolve, reject) => {
        let timeOut = setTimeout( () => {
            reject('timeOut')
        }, 30000)
        apiClient.post(`/${Constants.ITEM_SERVICE}/api/collections/create/${storeId}`, collectionRequest)
            .then( result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const updateCollection = (collectionRequest) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    collectionRequest.bcStoreId = storeId;
    return new Promise( (resolve, reject) => {
        let timeOut = setTimeout( () => {
            reject('timeOut')
        }, 30000)
        apiClient.put(`/${Constants.ITEM_SERVICE}/api/collections/edit/${storeId}`, collectionRequest)
            .then( result => {
                clearTimeout(timeOut)
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const getCollectionDetail = (collectionId) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/${collectionId}`)
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const getCollectionDetailForEdit = (collectionId) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    const initLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/detail/${storeId}/${collectionId}?langKey=${initLanguage}`)
            .then( result => {
                if (result.data) {
                    result.data.lstProduct = result.data.lstProduct.filter(item => !!item.id)
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
};

const removeCollection = (collectionId) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    return new Promise( (resolve, reject) => {
        let timeOut = setTimeout( () => {
            reject('timeOut')
        }, 30000)
        apiClient.delete(`/${Constants.ITEM_SERVICE}/api/collections/delete/${storeId}/${collectionId}`)
            .then( result => {
                clearTimeout(timeOut)
                resolve(result)
            }, (e) => reject(e))
    })
};

const getCollectionsByBcStoreId = (params) =>{
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections`, {params: params})
            .then( result => {
                if (result.data) {
                    resolve(result.data)
                }
            }, (e) => reject(e))
    })
}

const getCollectionDetailWithHandleError = (collectionId) => {
    const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
    return new Promise( (resolve, reject) => {
        apiClient.get(`/${Constants.ITEM_SERVICE}/api/collections/${collectionId}`)
            .then( result => {
                    resolve(result.data)
          
            }, (e) => reject(e))
    })
};

export const CollectionService = {
    createCollection,
    updateCollection,
    getCollectionDetail,
    removeCollection,
    getCollectionsByBcStoreId,
    getListCollection,
    getCollectionDetailForEdit,
    getListCollectionWithKeyword,
    getCollectionDetailWithHandleError
};
