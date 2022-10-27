/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import apiClient from '../config/api';
import storeService from "./StoreService";

const SERVICE_PREFIX = 'catalogservices/api/terms';
const PRODUCT_METADATA = 'productCatalogType:PRODUCT';

const getCategoryTree = () => {
    return new Promise ( (resolve, reject) => {
        apiClient.get(`${SERVICE_PREFIX}/tree?taxonomy=product-catalog`)
            .then( result => {
                resolve(result.data)
            })
            .catch( e => reject(e))
    })

}

const getCategoryByLevel = (level) => {
    return new Promise ( (resolve, reject) => {
        apiClient.get(`${SERVICE_PREFIX}?metadata=${PRODUCT_METADATA}&taxonomy=product-catalog&level=${level}`)
            .then( result => {
                resolve(result.data)
            })
            .catch( e => reject(e))
    })
}

const getChildByParentId = (parentId) => {
    return new Promise ( (resolve, reject) => {
        apiClient.get(`${SERVICE_PREFIX}?taxonomy=product-catalog&parentId=${parentId}`)
            .then( result => {
                resolve(result.data)
            })
            .catch( e => reject(e))
    })
}

const getOneById = (id) => {
    return new Promise ( (resolve, reject) => {
        apiClient.get(`${SERVICE_PREFIX}/${id}`)
            .then( result => {
                resolve(result.data)
            })
            .catch( e => reject(e))
    })
}

const getCategoriesByStore = (storeId) => {
    return new Promise( (resolve, reject) => {
        storeService.getStoreInfo(storeId)
            .then( result => {
                let categoryIds = result.categoryIds
                apiClient.get(`${SERVICE_PREFIX}?metadata=${PRODUCT_METADATA}&taxonomy=product-catalog&ids=${categoryIds}`)
                    .then( resultCate => {
                        if (resultCate.length === 0) {
                            reject(null)
                        }
                        resolve(resultCate.data)
                    }, (e) => reject(e))
            }, (e) => reject(e))

    })
}

const getCategoryByLevel0productOnly = () => {
    return new Promise ( (resolve, reject) => {
        apiClient.get(`${SERVICE_PREFIX}?metadata=${PRODUCT_METADATA}&taxonomy=product-catalog&level=${0}`)
            .then( result => {
                resolve(result.data)
            })
            .catch( e => reject(e))
    })
}


export const CategoryService = {
    getCategoriesByStore,
    getCategoryTree,
    getCategoryByLevel,
    getChildByParentId,
    getOneById,
    getCategoryByLevel0productOnly
}
