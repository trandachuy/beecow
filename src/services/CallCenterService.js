import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";
import apiClient from "../config/api";
import {PaymentUtils} from "../utils/payment-utils";

class CallCenterService {
    getVhtExtensions() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/omi-extensions/store/${storeId}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }

    getVhtExtensionShopOwner() {
        const storeId = CredentialUtils.getStoreId();
        let userId = CredentialUtils.getStoreOwnerId();
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/user-extensions/store/${storeId}/user-id/${userId}`)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        });
    }

    getVhtExtensionById(id) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/omi-extensions/${id}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }

    updateVhtExtensionForUser(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.CALL_CENTER_SERVICE}/api/user-extensions/grant-extension`, data)
                .then(result => {
                    resolve(result);
                }, (e) => reject(e));
        })
    }

    removeExtensionForUser(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.CALL_CENTER_SERVICE}/api/user-extensions/un-grant-extension`, data)
                .then(result => {
                    resolve(result);
                }, (e) => reject(e));
        })
    }

    getCallCenterPrice() {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/omi-packages/prices`)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    addOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/order-packages/add/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    upgradeOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/order-packages/upgrade/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    renewOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/order-packages/renew/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    getListCallBy() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/call-histories/${storeId}/list-call-by`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }

    /**
     *
     * @param {CallCenterHistoriesRequestBodyModel} params
     * @returns {Promise<unknown>}
     */
    getCallCenterHistories(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/call-histories`, {params: params})
                .then(result => {
                    if (result.data) {
                        resolve(result);
                    }
                }, (e) => reject(e));
        })
    }

    /**
     *
     * @param {CallCenterHistoriesRequestBodyModel} params
     * @returns {Promise<CallHistoryIncludeNote>}
     */
    getCallCenterHistoriesWithNote(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/call-histories-include-note`, {params: params})
                .then(result => {
                    if (result.data) {
                        resolve(result);
                    }
                }, (e) => reject(e));
        })
    }

    enableCallCenter(phone) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/vht-accounts`, {
                storeId: storeId,
                phone: phone
            })
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }

    getInfoCallCenterByStore() {
        return new Promise(((resolve, reject) => {
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/omi-accounts/extension/authenticate`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        }))
    }

    createCallHistory(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/call-histories`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    updateCallHistory(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.CALL_CENTER_SERVICE}/api/call-histories`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    assignCustomerToCall(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.CALL_CENTER_SERVICE}/api/call-histories/assign-customer`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     * Create note for history call
     * @param {CallHistoryNoteRequestModel} requestBody
     */
    sendCallHistoryNote(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise(((resolve, reject) => {
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/call-history-notes/${storeId}`, requestBody)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        }))
    }

    getDetailOmiAccountPackage() {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.CALL_CENTER_SERVICE}/api/omi-accounts/detail-package/${storeId}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }


    recheckTenantActive() {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/omi-accounts/re-check-tenant-account/active?storeId=${storeId}`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }

    getReturnAmount(data) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.CALL_CENTER_SERVICE}/api/omi-accounts/get-return-amount/${storeId}`, data)
                .then(result => {
                    if (result.data) {
                        resolve(result.data);
                    }
                }, (e) => reject(e));
        })
    }
}

const callCenterService = new CallCenterService();
export default callCenterService;
