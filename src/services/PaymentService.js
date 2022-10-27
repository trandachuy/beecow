/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import apiClient from '../config/api';
import Constants from '../config/Constant';
import {CredentialUtils} from '../utils/credential';
import {GSToast} from "../utils/gs-toast";

class PaymentService {

    getPaypalConnectUrl() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise ( (resolve, reject) => {
            apiClient.get(`/${Constants.PAYMENT_SERVICE}/api/shop-connect/url/${storeId}`)
                .then( result => {
                    resolve(result.data)
                })
                .catch( e => reject(e))
        })
    }

    updatePaymentPaypal(data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise ( (resolve, reject) => {
            apiClient.put(`/${Constants.PAYMENT_SERVICE}/api/shop-connect/paypal/${storeId}`, {...data, storeId})
                .then( result => {
                    resolve(result.data)
                })
                .catch( e => {
                    if (e.response?.data?.errorKey) {
                        switch (e.response?.data?.errorKey) {
                            case 'merchant.merchantId.invalid':
                                GSToast.error(`page.setting.shippingAndPayment.paypal.error.${e.response.data.errorKey}`, true)
                                break;
                            case 'merchant.account.limited':
                                GSToast.warning(`page.setting.shippingAndPayment.paypal.error.${e.response.data.errorKey}`, true)
                                break;
                            case 'merchant.email.unconfirmed':
                                GSToast.warning(`page.setting.shippingAndPayment.paypal.error.${e.response.data.errorKey}`, true)
                                break;
                            case 'merchant.oauth.invalid':
                                GSToast.error(`page.setting.shippingAndPayment.paypal.error.${e.response.data.errorKey}`, true)
                                break;
                            default:
                                GSToast.commonError(e)
                        }
                    }
                    else {
                        GSToast.commonError(e);
                    }
                    reject(e)
                })
        })
    }

    updateExchangeRatePaypal(exchangeRate) {
        const storeId = CredentialUtils.getStoreId();
        const currency = "USD";
        return new Promise ( (resolve, reject) => {
            apiClient.put(`/${Constants.PAYMENT_SERVICE}/api/shop-connect/exchange/${storeId}`, {exchangeRate, storeId, currency})
                .then( result => {
                    resolve(result.data)
                })
                .catch( e => reject(e))
        })
    }

    getExchangeRatePaypal() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise ( (resolve, reject) => {
            apiClient.get(`/${Constants.PAYMENT_SERVICE}/api/shop-connect/exchange/${storeId}`)
                .then( result => {
                    resolve(result.data)
                })
                .catch( e => reject(e))
        })
    }

    getPaymentPayPal(orderId, siteCode) {
        const allowSiteCode = [Constants.SITE_CODE_GOMUA, Constants.SITE_CODE_BEECOW, Constants.SITE_CODE_GOSELL]

        if (siteCode && !allowSiteCode.includes(siteCode)) {
            return
        }

        return new Promise ( (resolve, reject) => {
            apiClient.get(`/${Constants.PAYMENT_SERVICE}/api/payment-paypal/${orderId}`)
                .then( result => {
                    resolve(result.data)
                })
                .catch( e => {
                    resolve({}) // return empty object to avoid crash page
                })
        })
    }

    getShopConnect() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${Constants.PAYMENT_SERVICE}/api/shop-connect/paypal/${storeId}`)
                .then(
                    result => resolve(result.data),
                    error => reject()
                )
        });
    }

    getDataConfigPaymentMomo() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${Constants.PAYMENT_SERVICE}/api/payment-momos/store/${storeId}`)
                .then(
                    result => resolve(result.data),
                )
                .catch( e => reject(e))
        });
    }

    createDataConfigPaymentMomo(request) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.PAYMENT_SERVICE}/api/payment-momos`, request)
                .then(
                    result => resolve(result.data),
                )
                .catch( e => reject(e))
        });
    }

    updateDataConfigPaymentMomo(request) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.PAYMENT_SERVICE}/api/payment-momos`, request)
                .then(
                    result => resolve(result.data),
                )
                .catch( e => reject(e))
        });
    }

}

const paymentService = new PaymentService();
export default paymentService;
