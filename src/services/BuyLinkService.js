import apiClient from "../config/api";
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const updateBuyLink = (data) => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise( (resolve, reject) => {
        apiClient.put(`${Constants.ORDER_BC_SERVICE}/api/buy-link/${storeId}`, data)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}


const removeBuyLink = (id) => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise( (resolve, reject) => {
        apiClient.delete(`${Constants.ORDER_BC_SERVICE}/api/buy-link/${storeId}/${id}`)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}


/**
 *
 * @param {GsBuyLinkModel} params
 * @return {Promise<unknown>}
 */
const createBuyLink = (data) => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/buy-link/${storeId}`, data)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}


const getBuyLink = (options) => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/buy-link/${storeId}`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};


const getBuyLinkByLinkId = (buylinkId) => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/buy-link/${storeId}/${buylinkId}`)
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};


export const BuyLinkService = {
    getBuyLink,
    createBuyLink,
    removeBuyLink,
    updateBuyLink,
    getBuyLinkByLinkId
}
