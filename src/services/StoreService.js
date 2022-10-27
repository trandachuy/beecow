import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";
import {CredentialUtils} from "../utils/credential";
import _ from 'lodash';
import {PaymentUtils} from "../utils/payment-utils";

class StoreService {

    getStoreInfo() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()

            if (!storeId) {
                return Promise.reject()
            }

            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/${storeId}`)
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

    getStorefrontInfo(storeId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/shop-infos/stores/${storeId}/clientTypes/WEB`)
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

    createStorefrontInfo(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/shop-infos/stores`, data)
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

    updateStorefrontInfo(data) {
        return new Promise((resolve, reject) => {
            // Must have ROLE_STORE to update this info
            apiClient.put(`/${Constants.STORE_SERVICE}/api/shop-infos/stores`, data)
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

    updateStoreInfo(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/stores/open`, data)
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

    openStoreInfo(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/stores/open`, data)
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

    /**
     * url is not duplicated when status 404 comes
     * ok when duplicated
     *
     * @param {*} url
     */
    getStoreByURL(url){
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store/${url}`)
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

    checkUrlExistOrNot(url, isExist = true) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store/check-url?isExist=${isExist}&url=${url}`)
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

    getPageAddressByStoreId(storeId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/pageaddress`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    updateSubDomain(subDomain) {
        return new Promise( ( resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/stores/sub-domains`, {
                subDomain: subDomain
            })
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    updateNewDomain(domain, id) {

        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-urls`, {
                id: id,
                storeId: parseInt(storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
                url: domain,
                urlType: "STOREFRONT"
            })
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    postNewDomain(domain) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/store-urls`, {
                storeId: parseInt(storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
                url: domain,
                urlType: "STOREFRONT"
            })
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    getStoreUrl(urlType) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-urls/stores/${storeId}/urlTypes/${urlType}`)
            .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
            })
    }

    getBankInfo() {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/bank`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    updateBankInform(requestBody) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/bank-informs`, requestBody)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    createBankInform(requestBody) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/bank-informs`, requestBody)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    getLogos() {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-logos/stores/${storeId}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    removeNewDomain(id) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.delete(`/${Constants.STORE_SERVICE}/api/store-urls/store-ids/${storeId}/url-ids/${id}`)
                .then( result => {
                    // if (result.data) {
                        resolve(result)
                    // }
                }, (e) => reject(e))
        })
    }

    getCheckoutInfo() {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/checkout`)
                .then( result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    updateCheckoutInfo(enable) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/checkout?enableGuestCheckout=${enable}`)
                .then( result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getDeliveryProvider(includedSelfDelivery = true) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/delivery-providers/storeId/${storeId}`, {
                params: {
                    includedSelfDelivery
                }
            })
                .then( result => {
                    resolve(result.data)
                }, reject)
        })
    }



    updateDeliveryProviderList(requestBody) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/delivery-providers/list`, requestBody)
                .then( result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getStaffPermissions() {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/staff-permissions`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getStaffs(isEnabledCC, page = 0, size = Number.MAX_SAFE_INTEGER, sort = 'id,desc') {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-staffs/store/${storeId}?isEnabledCC=${isEnabledCC}&page=${page}&size=${size}&sort=${sort}`)
                .then(result => {
                    resolve(result)
                }, reject)
        })
    }

    getStaffsForGoChat(options) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-staffs/gochat/store/${storeId}`, {params: options})
                .then(result => {
                    resolve(result)
                }, reject)
        })
    }

    getStaffByUserOfStore(userId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-staffs/store/${storeId}/user/${userId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getAllStoreStaffs(page, size, isActive, sort) {
        const storeId = CredentialUtils.getStoreId()
        const activeValue = isActive ? '&' + isActive : ''
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-staffs/find/${storeId}?page=${page}&size=${size}&sort=${sort}` + activeValue)
                .then(result => {
                    resolve(result)
                }, reject)
        })
    }

    createStaff(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/store-staffs/store/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateStaff(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-staffs/store/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    deleteStaff(staffId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.delete(`/${Constants.STORE_SERVICE}/api/store-staffs/store/${storeId}/${staffId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getGACode() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/store-ga-code/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateGACode(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/stores/store-ga-code/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getStoreGuide() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-guides/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateStoreGuide(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-guides/process/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateStoreGuideEnabled(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-guides/enabled/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateStoreListingWebsite(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-listing-webs/${storeId}`, requestBody)
            .then(result => {
                resolve(result.data)
            }, reject)
        })
    }

    getStoreListingWebsite() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-listing-webs/${storeId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
        })
    }

    getStoreMinistry() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/ministry-logos/storeId/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    /**
     * Update ministry
     * @param {MinistryModel} requestBody
     */
    updateStoreMinistry(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/ministry-logos`, {
                ...requestBody,
                storeId
            })
                .then( result => {
                    resolve(result)
                })
                .catch(reject)
        })
    }

    /**
     * show support chat
     * @returns {Promise<unknown>}
     */
    showSupportChat() {
        const storeId = CredentialUtils.getStoreId()
        return apiClient.put(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/showSupportChat`)
    }

    getGVTag() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/store-gv-tag/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateGVTag(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/stores/store-gv-tag/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getAllStoreStaffByUser() {
        const userId = CredentialUtils.getUserId();
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-staffs/user/${userId}`)
                .then(result => resolve(result.data), reject)
        });
    }

    getSfFullDomain() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-urls/stores/${storeId}/domains`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getPackagePrice(params) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/package-prices/prices`, {
                params
            })
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getActiveOrderPackageByStoreId(params) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/order-packages/active-order/${storeId}`, {
                params
            })
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getRemainingAmountByStoreId(options) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/order-packages/remaining-amount/${storeId}`, {
                params: options
            })
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getStoreBranchById(id) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/${id}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getAllStoreBranch(page = 0, size = 100, branchType = "") {
        let params = {page, size};
        if(branchType.length > 0) {
            params = {page, size, branchType};
        }
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/list/${storeId}`, {params: params})
                .then(result => {
                    resolve(result)
                }, reject)
        })
    }

    /**
     * @description Get store branches that filtered by staff
     * @return {Promise<unknown>}
     */
    getFullStoreBranches() {
        const storeId = CredentialUtils.getStoreId()
        let params = { storeId, page: 0, size: 1000 };

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/full`, { params: params })
                .then(result => { resolve(result) }, reject)
        })
    }

    /**
     * @description Get all store branches without filter
     * @param page
     * @param size
     * @param branchType
     * @return {Promise<unknown>}
     */
    getStoreBranches(storeId, options = {}) {
        const {branchType} = options;
        const _storeId = storeId || CredentialUtils.getStoreId()

        if (branchType) {
            options = {
                page: 0,
                size: 9999,
                ...options
            };
        }
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store/branches/${_storeId}`, {params: options})
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getDefaultBranch() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/default/${storeId}`)
                .then(result => { resolve(result.data) }, reject);
        });
    }

    createStoreBranch(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/store-branch/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateStoreBranch(requestBody) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-branch/${storeId}`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    changeStatusStoreBranch(id, branchStatus) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-branch/setting-status/${storeId}/${id}?status=${branchStatus}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    addOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.STORE_SERVICE}/api/order-packages/add/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    upgradeOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.STORE_SERVICE}/api/order-packages/upgrade/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    renewOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.STORE_SERVICE}/api/order-packages/renew/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    getLastOrderOfStoreBranch() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/order/latest/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getActiveStoreBranches(page = 0, size = 1000) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/active/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    checkBranchCode(code = "", id = "") {
        const storeId = CredentialUtils.getStoreId()
        const params = `?code=${code}&id=${id}`;
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/code/${storeId}${params}`)
            .then(result => {
                const httpStatus = result.status;
                if(httpStatus === 409) {
                    reject(httpStatus);
                }
                resolve(httpStatus)
            }, reject)
        })
    }

    getActiveBranchByStaffId(staffId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/staff/${staffId}/active-branch`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getListActiveBranchOfStaff() {
        const storeId = CredentialUtils.getStoreId();
        const userId = CredentialUtils.getUserId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/${storeId}/user/${userId}/active-branch`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    addTaxSettings(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/tax-settings`, data)
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

    getListVAT() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/tax-settings/store/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    checkStaffPermissionOnBranch(branchId, isActive) {
        const params = _.isBoolean(isActive)? `?active=${isActive}`:'';
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-branch/staff/${storeId}/branch/${branchId}${params}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    changeStatusVAT(tax_id) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/tax-settings/${tax_id}/default`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    changeStatusCheckedVAT() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/showTax`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getStatusShowTax() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/stores/${storeId}/showTax`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    deleteVAT(tax_id) {
        return new Promise( (resolve, reject) => {
            apiClient.delete(`/${Constants.STORE_SERVICE}/api/tax-settings/${tax_id}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getListLanguages() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-language/store/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getAllAddedLanguages() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-language/store/${storeId}/all`)
                .then(result => resolve(result.data), reject);
        });
    }

    publishLanguage(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-language/publish`, data)
                .then(resolve)
                .catch(err => reject(err.message));
        });
    }

    createLanguage(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/store-language/create`, data)
                .then(result => resolve(result.data), reject)
        });
    }

    deleteLanguage(storeId, storeLangId) {
        return new Promise((resolve, reject) => {
            apiClient.delete(`/${Constants.STORE_SERVICE}/api/store-language/store/${storeId}/${storeLangId}`)
                .then(resolve)
                .catch(err => reject(err.message));
        });
    }

    getActiveBuyLanguages() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/order-packages/active-order/${storeId}?channel=${Constants.ORDER_PACKAGE_CHANNEL.MULTI_LANGUAGE}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getLanguages(options) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-language/store/${storeId}`, {
                params: options
            })
                .then(result => {
                    // sorted by id to show oldest item first
                    resolve(result.data.sort((a, b) => a.id - b.id));
                }, reject)
        })
    }

    getStoreInfoLanguagesByStoreId() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-info-languages/store/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getStoreInfoLanguage(langId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-info-languages/${langId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    upsertStoreInfoLanguage(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-info-languages`, data)
                .then(resolve)
                .catch(err => reject(err.message));
        });
    }

    getInitialLanguage(storeId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-language/store/${storeId}?hasInitial=true`)
                .then(result => {
                    resolve(result.data[0]) // 1 shop should only have 1 initial lang
                }, reject)
        })
    }

    updateDefaultStoreLanguage(storeId, storeLangId) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-language/store/${storeId}/default`, storeLangId)
                .then(result => resolve(result.data), reject);
        });
    }

    getDefaultStoreLanguage(storeId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.STORE_SERVICE}/api/store-language/store/${storeId}/default`)
                .then(result => resolve(result.data), reject);
        })
    }

    getCopyLanguageInProgress() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/get-copy-progress/store/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getBoughtPackagesByStoreId(channel) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/order-packages/stores/${storeId}?channel=${channel}`)
                .then(result => resolve(result.data), reject);
        });
    }

    getAllGoogleTagManager(){
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/google-tag-managers/store/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateGoogleTagManager(requestBody) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/google-tag-managers`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    createGoogleTagManager(requestBody) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.STORE_SERVICE}/api/google-tag-managers`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getCurrencyUSD(enabledPaypal){
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-multiple-currencies/store/${storeId}/self-rate-amount?currency=USD&enabledPaypal=${enabledPaypal}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateCurrencyUSD(amount){
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-multiple-currencies/store/${storeId}/self-rate-amount?baseCurrency=VND&toCurrency=USD&baseAmount=${amount}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getMultipleCurrency(){
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-multiple-currencies/store/${storeId}?withRate=true`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    updateMultipleCurrency(requestBody) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/store-multiple-currencies`, requestBody)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getMultipleCurrencyWithRateFalse(){
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-multiple-currencies/store/${storeId}?withRate=false`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }



    /** @typedef {object} ShippingRuleDTO
     * @property {string} condition
     * @property {string} conditionUnit
     * @property {string} countryCode
     * @property {number} deliveryProviderId
     * @property {number} fromRange
     * @property {number} id
     * @property {string} name
     * @property {number} shippingFee
     * @property {number} storeId
     * @property {number} toRange
     */

    /**
     *
     * @return {Promise<ShippingRuleDTO[]>}
     */
    getSelfDeliveryRules() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/shipping-rules/store/${storeId}`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }



    /** @typedef {object} SelfDeliverySettingVM
     * @property {string[]} allowedCountryCodeList
     * @property {string} allowedLocationCodes
     * @property {string[]} allowedLocations
     * @property {string} createdBy
     * @property {string} createdDate
     * @property {boolean} enabled
     * @property {number} id
     * @property {string} lastModifiedBy
     * @property {string} lastModifiedDate
     * @property {string} providerName
     * @property {number} shippingFeeInsideCity
     * @property {number} shippingFeeOutsideCity
     * @property {ShippingRuleDTO[]} shippingRuleList
     * @property {number} storeId
     */
    /**
     * getSelfDeliveryShippingLocation
     * @return {Promise<SelfDeliverySummaryVM[]>}
     */
    getSelfDeliveryShippingLocation(withRule) {

        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/delivery-providers/self-delivery/detail/storeId/${storeId}`, {
                params: {
                    withRule
                }
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    /** @typedef {object} SelfDeliverySummaryVM
     * @property {boolean} enabled
     * @property {number} locationCount
     * @property {number} rateCount
     * @property {number} storeId
     */


    /**
     * getSelfDeliverySetting
     * @return {Promise<SelfDeliverySummaryVM>}
     */
    getSelfDeliverySetting() {

        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/delivery-providers/self-delivery/storeId/${storeId}`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    /**
     * updateSelfDeliverySetting
     * @param {SelfDeliverySummaryVM} request
     * @return {Promise<SelfDeliverySummaryVM>}
     */
    updateSelfDeliverySetting(request) {

        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/delivery-providers/self-delivery/storeId/${storeId}`, request)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    /**
     * @typedef {object} SelfDeliveryProviderUpdateVM
     * @property {SelfDeliverySummaryVM[]} deliveryList
     * @property {number} storeId
     */
    /**
     *
     * @param {SelfDeliveryProviderUpdateVM} request
     * @return {Promise<unknown>}
     */
    updateSelfDeliveryLocation(request) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.STORE_SERVICE}/api/delivery-providers/self-delivery/list`, request)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getStoreCountry() {
        const storeId = CredentialUtils.getStoreId()

        if (!storeId) {
            return Promise.reject()
        }

        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.STORE_SERVICE}/api/store-country/${storeId}`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

const storeService = new StoreService();
export default storeService;
