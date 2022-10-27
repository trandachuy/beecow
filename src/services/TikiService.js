import apiClient from '../config/api';
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";
import storageService from "./storage";
import i18next from "i18next";

class TikiService {

    storeAuthorization(clientId, code, scope, state, redirectUri) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()

            apiClient.post(`${Constants.TIKI_SERVICE}/api/store-oauths/store/authorization`, {
                storeId,
                code,
                scope,
                state,
                redirectUri,
                clientId
            })
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    getShopAccounts() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()

            apiClient.get(`${Constants.TIKI_SERVICE}/api/store-oauths/store/${storeId}/authorization`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    syncProduct(overwrite) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.post(`${Constants.TIKI_SERVICE}/api/items/syn-to-bc/${storeId}/${sid}?overwrite=${overwrite}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getProductSyncStatus() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.get(`/${Constants.TIKI_SERVICE}/api/items/check-fetching-synching/${storeId}/${sid}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getProducts(params) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.get(`/${Constants.TIKI_SERVICE}/api/items/${storeId}/${sid}`, {params: params})
                .then(result => {
                    resolve({
                        data: result.data,
                        total: parseInt(result.headers['x-total-count'])
                    });
                })
                .catch(e => reject(e))
        })
    }

    getCategories(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.TIKI_SERVICE}/api/categories`, {params})
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => reject(e))
        })
    }

    getAttributes(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.TIKI_SERVICE}/api/attributes`, {params})
                .then(res => resolve(res.data))
                .catch(reject)
        })
    }

    syncNewProduct(newProduct) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.post(`${Constants.TIKI_SERVICE}/api/items/${storeId}/${sid}/sync-new-item`, newProduct)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    syncUpdateProduct(updateProduct) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.post(`${Constants.TIKI_SERVICE}/api/items/${storeId}/${sid}/sync-update-item`, updateProduct)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getAllSuppliers() {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.TIKI_SERVICE}/api/suppliers`)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    hasUpdateProductStatus() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.post(`/${Constants.TIKI_SERVICE}/api/items/${storeId}/${sid}/has-waiting-product`)
                .then(result => {
                    if (result) {
                        resolve(result.data)
                    }
                })
                .catch(e => reject(e))
        })
    }

    updateProductStatus() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.post(`/${Constants.TIKI_SERVICE}/api/items/${storeId}/${sid}/update-waiting-product`)
                .then(result => {
                    if (result) {
                        resolve(result.data)
                    }
                })
                .catch(e => reject(e))
        })
    }

    getItemDetailForSyncUpdate(itemId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.get(`/${Constants.TIKI_SERVICE}/api/items/${storeId}/${sid}/${itemId}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const sid = CredentialUtils.getTikiShopAccount().tkSid

            apiClient.delete(`${Constants.TIKI_SERVICE}/api/store-oauths/store/authorization`, {
                data: {
                    storeId,
                    sid
                }
            }).then(result => {
                if (result.status === 204) {
                    resolve(result);
                }
            }, (e) => reject(e));
        })
    }
}

const tikiService = new TikiService();
export default tikiService;
