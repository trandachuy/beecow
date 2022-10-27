import apiClient from "../config/api";
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";
import beehiveService from "./BeehiveService";
import {PaymentUtils} from "../utils/payment-utils";

/**
 * @typedef {Object} AffiliateCommissionModel
 * @property {Number} id
 * @property {String} type
 * @property {Number} totalPartner
 * @property {Number} storeId
 * @property {Number} rate
 * @property {String} name
 * @property {Number[]} collectionItemIds
 * @property {{
 *     collectionId: Number,
 *     itemId: Number,
 *     modelId: Number,
 * }[]} items
 */

/**
 * @typedef {Object} SettingModel
 * @property {Number} id
 * @property {Number} storeId
 * @property {Number} cookieExpiryTime,
 * @property {Boolean} autoApproveOrder,
 * @property {Boolean} autoApproveOrderDropship,
 * @property {Boolean} autoApproveOrderDropshipAllOrder,
 * @property {Boolean} autoApproveOrderDropshipDeliveredOrder,
 * @property {Boolean} autoApproveOrderReseller,
 * @property {Boolean} autoApproveOrderReseller,
 * @property {Boolean} autoApproveOrderReseller,
 * @property {Boolean} notifyNewPartner,
 * @property {Boolean} notifyNewOrder,
 * @property {Boolean} notifyNewOrderDropship,
 * @property {Boolean} notifyNewOrderReseller,
 * @property {Boolean} updateProductChange,
 * @property {Boolean} updateProductChangePrice,
 * @property {Boolean} updateProductChangeInfo
 */

class AffiliateService {
    getActiveOrderPackageByStoreId(serviceType, currencyCode) {
        const storeId = CredentialUtils.getStoreId();

        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/order-packages/get-last-active-package/${storeId}`,
                    {
                        params: {
                            serviceType,
                            currencyCode: currencyCode
                        },
                    }
                )
                .then((result) => {
                    resolve(result.data);
                }, reject);
        });
    }

    getLastOrderOfStoreAffiliate(serviceType, currencyCode) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/order-packages/get-last-package/${storeId}`,
                    {
                        params: {
                            serviceType,
                            currencyCode: currencyCode
                        },
                    }
                )
                .then((result) => {
                    resolve(result.data);
                }, reject);
        });
    }

    getPackagePrice(params) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/${Constants.AFFILIATE_SERVICE}/api/service-prices`, {
                    params,
                })
                .then((result) => {
                    resolve(result.data);
                }, reject);
        });
    }

    addOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/order-packages/add/${paymentProvider}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    upgradeOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/order-packages/upgrade/${paymentProvider}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    renewOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/order-packages/renew/${paymentProvider}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    getRemainingAmountByStoreId(serviceType, currencyCode) {
        const storeId = CredentialUtils.getStoreId();

        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/order-packages/remaining-amount/${storeId}`,
                    {
                        params: {
                            serviceType,
                            currencyCode: currencyCode
                        },
                    }
                )
                .then((result) => {
                    resolve(result.data);
                }, reject);
        });
    }

    getListPartnerByStore(queryParams, page = 0, size = 100) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}`,
                    {
                        params: {
                            ...queryParams,
                            page,
                            size,
                        },
                    }
                )
                .then((result) => {
                    const totalElements = result.headers["x-total-count"] || 0;
                    resolve({ data: result.data, totalCount: totalElements });
                }, reject);
        });
    }

    createPartnerByStore(data) {
        const storeId = CredentialUtils.getStoreId();
        const langKey = CredentialUtils.getInitialLanguage();
        const agencyCode = beehiveService.getAgencyCode();

        return new Promise((resolve, reject) => {
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}`,
                    { ...data, langKey: langKey, agencyCode: agencyCode },
                    {
                        params: {
                            langKey: langKey,
                            agencyCode: agencyCode,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    updatePartnerByStore(data) {
        const storeId = CredentialUtils.getStoreId();
        const langKey = CredentialUtils.getInitialLanguage();
        const agencyCode = beehiveService.getAgencyCode();

        return new Promise((resolve, reject) => {
            apiClient
                .put(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}`,
                    { ...data, langKey: langKey, agencyCode: agencyCode },
                    {
                        params: {
                            langKey: langKey,
                            agencyCode: agencyCode,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    createCommission(data) {
        return new Promise((resolve, reject) => {
            apiClient
                .post(`/${Constants.AFFILIATE_SERVICE}/api/commissions/`, data)
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    getCommissionById(id) {
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/${Constants.AFFILIATE_SERVICE}/api/commissions/${id}`)
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    getAllCommissionsByStore(page = 0, size = 100, sort) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/commissions/store/${storeId}`,
                    {
                        params: { page, size, sort },
                    }
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    }

    updateCommission(data) {
        return new Promise((resolve, reject) => {
            apiClient
                .put(
                    `/${Constants.AFFILIATE_SERVICE}/api/commissions/${data.id}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    deleteCommission = (id) => {
        return new Promise((resolve, reject) => {
            apiClient
                .delete(`/${Constants.AFFILIATE_SERVICE}/api/commissions/${id}`)
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    getAllStoreAffiliatesOfStore = (options) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(`/${Constants.AFFILIATE_SERVICE}/api/store-affiliates/${storeId}`, {
                    params: options
                })
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPartnerById = (partnerId) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}/pid/${partnerId}`
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    checkPartnerCode = (code) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}/code/${code}`
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    rejectPartner(partnerId) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .put(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}/reject/${partnerId}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    approvePartner(partnerId, data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .put(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}/approve/${partnerId}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    activatePartner = (partnerType) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/package/${partnerType}/${storeId}`
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPayoutHistories = (page, size, options) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/payouts-history/store/${storeId}`,
                    {
                        params: {
                            page,
                            size,
                            ...options,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    getTotalPaidAmountOfPayoutHistory = (options) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/payouts-history-statistic/store/${storeId}`,
                    {
                        params: {
                            ...options,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPayoutInformation = (page, size, options) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/payouts-info/store/${storeId}`,
                    {
                        params: {
                            page,
                            size,
                            ...options,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPayoutStatistic = (page, size, options) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/payouts-statistic/store/${storeId}`,
                    {
                        params: {
                            page,
                            size,
                            ...options,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    getOrder = (requestParams) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/orders/store/${storeId}`,
                    {
                        params: requestParams,
                    }
                )
                .then(
                    (result) => {
                        resolve({
                            data: result.data,
                            total: parseInt(result.headers["x-total-count"]),
                        });
                    },
                    (e) => reject(e)
                );
        });
    };

    getTotalRevenueByOrders = (requestParams) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/orders/store/${storeId}/total-revenue`,
                    {
                        params: requestParams,
                    }
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    approveOrRejectOrder(data) {
        const storeId = CredentialUtils.getStoreId();
        data.langKey = CredentialUtils.getInitialLanguage();
        return new Promise((resolve, reject) => {
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/orders/multiple-approve-or-reject/${storeId}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    getMultipleActionList = () => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/multiple-action-progresses/${storeId}`
                )
                .then(
                    (result) => {
                        resolve(result);
                    },
                    (e) => reject(e)
                );
        });
    };

    removeExpiredMultipleActionList() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/multiple-action-progresses/remove-expired/${storeId}`,
                    {}
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    importPayment = (file) => {
        let dataForm = new FormData();
        dataForm.append("file", file);

        return new Promise((resolve, reject) => {
            const langKey = CredentialUtils.getLangKey();
            const storeId = CredentialUtils.getStoreId();
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/partner-payment-infos/import-payment/${storeId}?langKey=${langKey}`,
                    dataForm
                )
                .then((result) => {
                    resolve(result.data);
                })
                .catch(reject);
        });
    };

    getPaymentImportTemplate = () => {
        return new Promise((resolve, reject) => {
            const langKey = CredentialUtils.getLangKey();
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partner-payment-infos/import-template?langKey=${langKey}`,
                    {
                        headers: {
                            "Content-Disposition":
                                "attachment; filename=template.xlsx",
                            "Content-Type":
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        },
                        responseType: "arraybuffer",
                    }
                )
                .then((result) => {
                    resolve(result.data);
                })
                .catch(reject);
        });
    };

    checkCommissionsConflict(data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/commissions/conflict/${storeId}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    exportPayoutToExcel(fromDate, toDate, searchKeywords) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/payouts/export/${storeId}`,
                    {
                        headers: {
                            "Content-Disposition":
                                "attachment; filename=payout.xlsx",
                            "Content-Type":
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        },
                        responseType: "arraybuffer",
                        params: {
                            langKey: CredentialUtils.getLangKey(),
                            fromDate,
                            toDate,
                            searchKeywords,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    exportResellerOrderReport(fromDate, toDate) {
        const storeId = CredentialUtils.ROLE.RESELLER.getFromStoreId();
        const partnerId = CredentialUtils.ROLE.RESELLER.getPartnerId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/statistic/reseller/order-payout/store/${storeId}/partner/${partnerId}/export/XLSX`,
                    {
                        headers: {
                            "Content-Disposition":
                                "attachment; filename=order-payout.xlsx",
                            "Content-Type":
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        },
                        responseType: "arraybuffer",
                        params: {
                            langKey: CredentialUtils.getLangKey(),
                            fromDate,
                            toDate,
                        },
                    }
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }

    getPartnerSetting = () => {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${Constants.AFFILIATE_SERVICE}/api/partner-settings/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    updateStatus = (partnerType, enabled) => {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`/${Constants.AFFILIATE_SERVICE}/api/partner-settings/${storeId}/${partnerType}`, null, {
                params: {
                    enabled
                }
            })
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    getAllPartnerOfStore = (options) => {
        const _options = {
            page: 0,
            size: 9999,
            ...options
        }

        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${Constants.AFFILIATE_SERVICE}/api/partners/${storeId}`, {
                params: _options
            })
                .then(result => {
                    resolve(result)
                }).catch(reject)
        })
    }


    getCommissionsByStoreIdAndPartnerId = (partnerId) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/commissions/store/${storeId}/partner/${partnerId}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPartnerInformationByType = (partnerType) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners-info/partner/${storeId}/${partnerType}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPartnerOrderInformationByType = (partnerType) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners-info/order/${storeId}/${partnerType}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPartnerCommissionInformationByType = (partnerType) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners-info/commission/${storeId}/${partnerType}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    getPartnerByResellerStoreIdAndType = (resellerStoreId, partnerType) => {
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/resellerStoreId/${resellerStoreId}/type/${partnerType}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    /**
     * getItemCommissionList
     * @param resellerItemId
     * @return {Promise<AffiliateCommissionModel[]>}
     */
    getCommissionListByItemId = (resellerItemId) => {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const partnerId = CredentialUtils.ROLE.RESELLER.getPartnerId()
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/commissions/store/${storeId}/partner/${partnerId}/item/${resellerItemId}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    /**
     * get setting by store
     * @return {Promise<SettingModel>}
     */
    getSettingByStore = () => {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient
                .get(
                    `/${Constants.AFFILIATE_SERVICE}/api/settings/store/${storeId}`
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    };

    /**
     * update setting
     * @return {Promise<SettingModel>}
     */
    updateSetting = (setting) => {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.AFFILIATE_SERVICE}/api/settings`, setting)
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    getPartnerNameByListId = (data) => {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .post(
                    `/${Constants.AFFILIATE_SERVICE}/api/partners/get-name/${storeId}`,
                    data
                )
                .then(
                    (result) => {
                        resolve(result.data);
                    },
                    (e) => reject(e)
                );
        });
    }
}

const affiliateService = new AffiliateService();
export default affiliateService;