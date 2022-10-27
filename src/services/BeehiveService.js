import apiClient from '../config/api';
import Constants from '../config/Constant';
import colorService from './ColorService';
import storeService from './StoreService';
import {ItemService} from './ItemService';
import authenticate from './authenticate';
import i18next from 'i18next';
import storageService from './storage';
import {CredentialUtils} from '../utils/credential';
import shopeeService from './ShopeeService';
import {AnalyticsType} from '../models/AnalyticsTypeEnum';
import {PaymentUtils} from '../utils/payment-utils';
import {lazadaService} from './LazadaService';

class BeehiveService {

    getMobileConfig(storeId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/mobile-configs/shop/validation?shopId=${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    createMobileConfig(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/mobile-configs`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    updateMobileConfig(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/mobile-configs`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    buildWebSsr(storeId) {
        return new Promise(() => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/mobile-configs/build-ssr/${ storeId }`)
                .catch(e => {
                    console.error(e);
                });
        });
    }

    getDashboardOrder(storeId, options) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/orders/gosell-store/${ storeId }`, { params: options })
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    exportDashboardOrder(storeId, options) {
        let opts = { ...options } || {};
        opts.langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/orders/gosell-store/export/${ storeId }`, {
                headers:
                    {
                        'Content-Disposition': 'attachment; filename=order.xlsx',
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                responseType: 'arraybuffer',
                params: opts
            })
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    exportDashboardOrder2(requestBody) {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/orders/gosell-store/export-by-list-id/${ storeId }?sendMail=true`, requestBody)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    initDefaultConfig(store) {
        alert('Beecow shop 1st login GoSell. Will navigate to 10 mins wizard');
        let getThemeColor = colorService.getColors({});
        let getStoreInfo = storeService.getStoreInfo(store.id);
        Promise.all([getThemeColor, getStoreInfo])
            .then(values => {
                let themeColor = values[0];
                let storeInfo = values[1];
                let defaultMobileConfig = {
                    bundleId: 'com.mediastep.' + storeInfo.url,
                    shopId: storeInfo.id,
                    shopName: storeInfo.name,
                    colorPrimary: themeColor[0].primary,
                    colorSecondary: themeColor[0].secondary
                };
                let createDefaultMobileConfig = beehiveService.createMobileConfig(defaultMobileConfig);
                let migrateMappingItems = ItemService.migrateMappingItem(storeInfo.id);
                let addUserDomain = authenticate.addBeehiveDomain(storeInfo.ownerId);
                Promise.all([createDefaultMobileConfig, migrateMappingItems, addUserDomain])
                    .then(value => console.info(value))
                    .catch(reason => console.error(reason));
            })
            .catch(reason => console.error(reason));

        ItemService.createMenuDefault(store.id).then(res => {
        }).catch(error => {
        });
    }

    getAllPlans() {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject('timeOut'), 30000)
            const langKey = CredentialUtils.getLangKey()
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/plan/info?langKey=${ langKey }`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getCurrentPlan() {
        return new Promise((resolve, reject) => {
            const userId = CredentialUtils.getStoreOwnerId()
            const langKey = CredentialUtils.getLangKey()
            const langKeyFromI18n = i18next.language
            if (!langKeyFromI18n) {
                i18next.changeLanguage(langKey)
            }
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/user-features/user-ids?langKey=${ langKey }&userId=${ userId }`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getCurrentPlanList() {
        return new Promise((resolve, reject) => {
            const userId = CredentialUtils.getStoreOwnerId()
            const langKey = CredentialUtils.getLangKey()
            const langKeyFromI18n = i18next.language
            if (!langKeyFromI18n) {
                i18next.changeLanguage(langKey)
            }
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/user-features/user-ids/${ userId }?langKey=${ langKey }`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getAnalyticsInfo(dateRange, type = AnalyticsType.PRODUCT) {
        return new Promise((resolve, reject) => {
            const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/orders/gosell-dashboard/${ storeId }/${ dateRange }`, {
                params: {
                    type: type
                }
            })
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    doSubscription(packageId, expiredId, paymentMethod, userId, langKey) {
        return new Promise((resolve, reject) => {
            const body = {
                'expiredId': expiredId,
                'locale': langKey,
                'packageId': packageId,
                'paymentMethod': paymentMethod,
                'userId': userId,
                'storeId': storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
            };
            let paymentProvider = PaymentUtils.getPaymentProvider(paymentMethod);
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/subscript/add/${ paymentProvider }`, body)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    doRenew(packageId, expiredId, paymentMethod, userId, langKey) {
        return new Promise((resolve, reject) => {
            const body = {
                'packageId': packageId,
                'expiredId': expiredId,
                'locale': langKey,
                'paymentMethod': paymentMethod,
                'userId': userId,
                'storeId': storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
            };
            let paymentProvider = PaymentUtils.getPaymentProvider(paymentMethod);
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/subscript/renew/${ paymentProvider }`, body)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getExpiredPackage(expiredId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/package-expireds/${ expiredId }`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getSFAndMBBuildStatus() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/mobile-configs/shop/validation?shopId=${ storeId }`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getPermission() {
        return new Promise((resolve, reject) => {
            const userId = CredentialUtils.getStoreOwnerId()
            const langKey = CredentialUtils.getLangKey()
            const langKeyFromI18n = i18next.language
            if (!langKeyFromI18n) {
                i18next.changeLanguage(langKey)
            }
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/package_feature/${ userId }`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(reject)
        })
    }

    getCustomerList(page, size, keyword = undefined, saleChannel = undefined, sort = undefined,
                    extra = undefined, branchIds = '', ignoreBranch = false,
                    partnerIds = undefined, responsibleStaffUserIds = undefined, searchField = undefined, langKey) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            const defaultLangKey = CredentialUtils.getLangKey() || Constants.LanguageKey.VIETNAMESE;
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/${ storeId }/v2`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword,
                    saleChannel: saleChannel,
                    sort,
                    ...extra,
                    branchIds: branchIds,
                    ignoreBranch: ignoreBranch,
                    partnerIds,
                    responsibleStaffUserIds,
                    searchField,
                    langKey: langKey || defaultLangKey
                }
            }).then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                })
            }).catch(reject)
        })
    }

    getCustomersForPOS(keyword = undefined, pageNumber = 0, pageSize = 10) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/store/${ storeId }/POS`, {
                params: {
                    withPaging: true,
                    page: pageNumber,
                    size: pageSize,
                    keyword: keyword
                }
            }).then(result => {
                resolve(result.data)
            }).catch(reject)
        })
    }

    exportCustomerList(keyword = undefined, saleChannel = undefined, sort = undefined, extra = undefined) {
        const langKey = CredentialUtils.getLangKey();
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/export/${ storeId }`, {
                headers:
                    {
                        'Content-Disposition': 'attachment; filename=customer.xlsx',
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                responseType: 'arraybuffer',
                params: {
                    keyword: keyword,
                    saleChannel: saleChannel,
                    langKey: langKey,
                    ...extra
                }
            }).then(result => {
                resolve(result)
            }).catch(reject)
        })
    }

    importCustomerList(file, staffUserId = null) {
        let dataForm = new FormData()
        dataForm.append('file', file)

        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            const params = staffUserId ? `?staffUserId=${ staffUserId }` : ''
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/${ storeId }/upload${ params }`, dataForm)
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    importCustomerListExcel(file, staffUserId = null, branchIds) {
        let dataForm = new FormData();
        dataForm.append('file', file);
        dataForm.append('branchIds', branchIds);

        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            const params = staffUserId ? `?staffUserId=${ staffUserId }` : ''
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/${ storeId }/import-excel${ params }`, dataForm)
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    getCustomerDetail(customerId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/detail/${ storeId }/${ customerId }`)
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    getCustomerSummary(customerId, saleChannel, GScustomerId) {
        return new Promise((resolve, reject) => {
            switch (saleChannel.toUpperCase()) {
                case Constants.SaleChannels.SHOPEE:
                    shopeeService.getCustomerSummary(customerId)
                        .then(resolve, reject)
                    break
                case Constants.SaleChannels.LAZADA:
                    lazadaService.getCustomerSummary(customerId)
                        .then(resolve, reject)
                    break
                case Constants.SaleChannels.IMPORTED:
                case Constants.SaleChannels.CONTACT_FORM:
                case Constants.SaleChannels.BEECOW:
                case Constants.SaleChannels.GOSELL:
                case Constants.SaleChannels.LANDING_PAGE:
                    this.customerSummary(GScustomerId, saleChannel)
                        .then(resolve, reject)
                    break
                default:
                    resolve(null)
            }
        })
    }

    updateCustomerDetail(requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/edit/${ storeId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    createCustomerDetail(requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/create/${ storeId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    createCustomerDetailInStore(requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/create-instore/${ storeId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    createUserAndCustomerDetail(requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/create-user/${ storeId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    createUserPOSProfile(requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/POS/${ storeId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    createCustomerProfileSocialChat(type, requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/social-chat/store/${ storeId }/type/${ type }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getCustomerProfileSocialChat(id) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/social-chat/store/${ storeId }/profile/${ id }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getCustomerProfilePinWithSocialUser(type, socialUserId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/social-chat/store/${ storeId }/type/${ type }/user/${ socialUserId }/pin`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    unPinSocialUserWithCustomerProfile(type, socialUserId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.delete(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/social-chat/store/${ storeId }/type/${ type }/user/${ socialUserId }/un-pin`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getAllCustomerTags() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/tags/storeId/${ storeId }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    saveSegment(requestBody) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/segments/create/${ storeId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    updateSegment(requestBody, segmentId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`${ Constants.BEEHIVE_SERVICE }/api/segments/edit/${ storeId }/${ segmentId }`, requestBody)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getSegment(segmentId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/segments/detail/${ storeId }/${ segmentId }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    checkMembership(segmentId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/memberships/segments/${ segmentId }`, {
                params: {
                    sellerId: storeId
                }
            })
                .then(result => resolve(result.data))
                .catch(reject)

        })
    }

    /**
     *
     * @param keyword
     * @param status
     * @param type SEND_NOW|SCHEDULED
     * @param page
     * @param size
     * @returns {Promise<unknown>}
     */
    getListMkNotificationCampaigns(keyword, status, type, page, size) {
        return new Promise((resolve, reject) => {
            let queryParmas = 'sort=createdDate,desc';
            if (keyword) {
                queryParmas += `&name.contains=${ keyword }`;
            }
            if (status) {
                queryParmas += `&status.equals=${ status }`;
            }
            if (type) {
                switch (type) {
                    case 'SEND_NOW':
                        queryParmas += `&sendingTime.specified=false&event.specified=false`;
                        break
                    case 'SCHEDULED':
                        queryParmas += `&sendingTime.specified=true`;
                        break
                    case 'EVENT':
                        queryParmas += `&event.specified=true`
                }
            }
            if (page) {
                queryParmas += `&page=${ page }`;
            }
            if (size) {
                queryParmas += `&size=${ size }`;
            }
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications?${ queryParmas }`)
                .then(response => resolve(response))
                .catch(reject)
        });
    }

    getMKNotificationProgressStream(campaignId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications/${ campaignId }/progress/stream`)
                .then(response => resolve(response.data))
                .catch(reject);
        });
    }

    getMKNotificationProgress(campaignId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications/${ campaignId }/progress`)
                .then(response => resolve(response.data))
                .catch(reject);
        });
    }

    getListSegmentWithKeyword(params) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/segments/store/${ storeId }`,
                {
                    params: params
                })
                .then(result => {
                    if (result.data) {
                        resolve(result)
                    }
                }, (e) => reject(e))
        })
    }

    createMarketingNotification(requestBody) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications`, requestBody)
                .then(result => {
                    if (result.data) {
                        resolve(result)
                    }
                }, (e) => reject(e))
        })
    }

    updateMarketingNotification(requestBody) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications`, requestBody)
                .then(result => {
                    if (result.data) {
                        resolve(result)
                    }
                }, (e) => reject(e))
        })
    }

    updateMarketingNotificationStatus(notificationId, status) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications/${ notificationId }/status/${ status }?storeId=${ storeId }`)
                .then(result => {
                    resolve(result)
                }, (e) => reject(e))
        })
    }

    deleteMarketingNotification(notificationId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications/${ storeId }/${ notificationId }`)
                .then(result => {
                    resolve(result)
                }, (e) => reject(e))
        })
    }

    getMemberships(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/memberships`, { params: params })
                .then(result => {
                    if (result.data) {
                        resolve(result)
                    }
                }, (e) => reject(e))
        })
    }

    getMembershipById(membershipId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/memberships/${ membershipId }`)
                .then(result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                }, (e) => reject(e))
        })
    }

    saveMemberShip(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/memberships`, data)
                .then(result => {
                    if (result.data) {
                        resolve(result)
                    }
                }, (e) => reject(e))
        })

    }

    updateMemberShip(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/memberships`, data)
                .then(result => {
                    if (result.data) {
                    }
                    resolve(result)
                }, (e) => reject(e))
        })
    }


    saveMemberShips(data) {
        const sellerId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/memberships/saves?sellerId=${ sellerId }`, data)
                .then(result => {
                    resolve(result)
                    if (result.data) {
                    }
                }, (e) => reject(e))
        })
    }

    getMemberShipByCustomerId(userId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/memberships/level`, {
                params: {
                    sellerId: storeId,
                    customerId: userId
                }
            })
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getMembershipOfCustomer(customerId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/memberships/${ storeId }/${ customerId }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    removeMembershipById(membershipId) {
        const sellerId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/memberships/${ membershipId }`, { params: { sellerId: sellerId } })
                .then(result => {
                    resolve(result)
                }, (e) => reject(e))
        })
    }

    getSegmentByCustomerId(customerId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/segments/${ storeId }/${ customerId }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    deleteSegment(segmentId) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/segments/delete/${ storeId }/${ segmentId }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getMKNotificationDetail(notificationId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/marketing-notifications/${ notificationId }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    calculateRedundance(params) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/subscript/redundancy`, params)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    linkFacebookUserToCustomerProfile(profileId, fbUserId, pinType) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/link-with-facebook/${ storeId }/${ profileId }?fbUserId=${ fbUserId }&pinType=${ pinType }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    linkZaloUserToCustomerProfile(profileId, zlUserId, pinType) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/link-with-zalo/${ storeId }/${ profileId }?zaloUserId=${ zlUserId }&pinType=${ pinType }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getUserLinkWithCustomerProfile(fbUserId) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/check-user-link-with-facebook/${ storeId }?fbUserId=${ fbUserId }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getZaloUserLinkWithCustomerProfile(zaloUserId) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/check-user-link-with-zalo/${ storeId }?zaloId=${ zaloUserId }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getRelatedOrder(profileId, params) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/orders/gosell-store-related/${ storeId }/${ profileId }`, { params: params })
                .then(result => {
                    resolve(result)
                }, (e) => reject(e))
        })
    }

    getAgencyCode() {
        return storageService.getFromLocalStorage('AGENCY_CODE') || process.env.AGENCY_CODE;
    }

    getAgencyInfo(agencyCode) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/agencies/code/${ agencyCode }`)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        });
    }

    activeTheTierPackage(data) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/user-features/send-mail-tier-package/${ storeId }/`, data)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    getSystemRecommends() {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/recommendations?storeId.equals=${ storeId }&sort=createdDate,desc`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(err => reject(err));
        });
    }

    deleteSystemRecommend(id) {
        return new Promise((resolve, reject) => {
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/recommendations/${ id }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(err => reject(err));
        });
    }

    filterTagsByContext(search) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/tags/suggest?search=${ search }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(err => reject(err));
        });
    }

    getCustomerListByPhone(page, size, keyword = undefined) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/phone/${ storeId }`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword
                }
            }).then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                })
            }).catch(reject)
        })
    }

    searchCustomerByID(page, size, keyword) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();

            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/id/${ storeId }`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword
                }
            }).then(result => {
                resolve({
                    data: result.data,
                    headers: result.headers
                })
            }).catch(reject)
        })
    }

    searchCustomerByName(page, size, keyword, options) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();

            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/name/${ storeId }`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword,
                    ...options
                }
            }).then(result => {
                resolve({
                    data: result.data,
                    headers: result.headers
                })
            }).catch(reject)
        })
    }

    getCustomerDefineStatus() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer/status/${ storeId }`)
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    updateCustomerDefineStatus(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/customer/status/edit/${ storeId }`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     *
     * @param {{
     *     title?: string,
     *     content?: string,
     *     featuredText?: string,
     *     imageUrl: string,
     *     author: number,
     *     status: string,
     *     seoTitle: string,
     *     seoDescription: string,
     *     seoKeywords: string,
     *     seoUrl: string,
     * }} data
     */
    createBlogArticle(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/blog-articles`, { ...data, storeId })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     *
     * @param {{
     *     id: number,
     *     title: string,
     *     content: string,
     *     featuredText: string,
     *     imageUrl: string,
     *     author: number,
     *     status: string,
     *     seoTitle: string,
     *     seoDescription: string,
     *     seoKeywords: string,
     *     seoUrl: string,
     * }} data
     */
    updateBlogArticle(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/blog-articles`, { ...data, storeId })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getBlogArticleList(searchParams, page, size) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-articles`, {
                params: {
                    ...searchParams,
                    'storeId.equals': storeId,
                    'deleted.equals': false,
                    page, size
                }
            })
                .then(result => {
                    resolve({
                        totalItem: parseInt(result.headers['x-total-count']),
                        data: result.data.content
                    })
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getBlogArticle(articleId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-articles/${ articleId }`, {
                params: {
                    storeId
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

    getBlogArticleAvailableAuthor() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();

            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-articles/available-authors/${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    deleteBlogArticle(articleId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/blog-articles/${ articleId }`,
                {
                    params: {
                        storeId
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

    createBlogCategory(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories`, { ...data, storeId })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    updateBlogCategory(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories`, { ...data, storeId })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getBlogCategories(page, size) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories`, {
                params: {
                    storeId,
                    page: page || 0,
                    size: size || 2000,
                    sort: 'createdDate,desc'
                }
            })
                .then(result => {
                    resolve(result.data.content);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    getBlogCategoryById(categoryId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories/${ categoryId }?storeId=${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getBlogCategoriesOrderByCreatedDesc(page, size) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories`,
                {
                    params: {
                        storeId,
                        page,
                        size,
                        sort: 'createdDate,desc'
                    }
                })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    deleteBlogCategoryById(categoryId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories/${ categoryId }?storeId=${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getAllCategoryByFilter(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-categories?storeId=${ storeId }`, {
                params: data
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    deleteCustomerProfileList(ids) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/multiple-delete/${ storeId }`, {
                params: {
                    ids
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

    getProfileImportTemplate() {
        return new Promise((resolve, reject) => {
            const langKey = CredentialUtils.getLangKey();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/import-template?langKey=${ langKey }`, {
                headers:
                    {
                        'Content-Disposition': 'attachment; filename=template.xlsx',
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                responseType: 'arraybuffer'
            })
                .then(result => {
                    resolve(result.data)
                }).catch(reject)
        })
    }

    findOrderPackagesByType(type, options = {}) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/order-packages/store/${ storeId }`, {
                params: {
                    type,
                    ...options
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

    getAvailableFeaturesOfUser() {
        const userId = CredentialUtils.getStoreOwnerId()

        if (!userId) {
            return Promise.reject()
        }

        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/package_feature/${ userId }/code`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    updateLastAccessOfStore() {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/last-access-dates/dashboard`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    updateCustomerBranch(branchId = '', customerId = '') {
        const storeId = CredentialUtils.getStoreId();

        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/customer-branch/update/${ storeId }`, {
                storeId,
                branchId,
                customerId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSystemSettingByName(name) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/system-settings/name/${ name }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    /**
     * getCategoryLanguages
     * @param {Number} cateId
     * @return {Promise<BlogCategoryLanguageDTOModel[]>}
     */
    getCategoryLanguages(cateId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/blog-category-languages/category-id/${ cateId }/${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     * getCategoryLanguages
     * @param {BlogCategoryLanguageDTOModel[]} blogCategoryLanguageList
     * @return {Promise<BlogCategoryLanguageDTOModel[]>}
     */
    updateCategoryLanguages(blogCategoryLanguageList) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/blog-category-languages/${ storeId }`, blogCategoryLanguageList)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     * getLoyaltyPointSettingByStore
     * @returns {Promise<LoyaltyPointSettingDTOModel>}
     */
    getLoyaltyPointSettingByStore() {
        const storeId = CredentialUtils.getStoreId();

        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/loyalty-point-settings/store/${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    activeLoyaltyPointOfStore() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/loyalty-point-settings/store/${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    updateLoyaltyPointOfStore(clearPoint, setting) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/loyalty-point-settings/store/${ storeId }`, {
                clearPoint,
                settingData: setting
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(reject);
        });
    }

    getShowLoyaltyPointFlag(storeId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/loyalty-point-settings/store/${ storeId }/show-point`)
                .then(result => resolve(result.data), reject);
        })
    }

    getCustomerProfileByGosellUserId(userId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/${ storeId }/${ userId }/GOSELL`)
                .then(result => resolve(result.data), reject);
        })
    }

    getCustomerProfile(userId, saleChannel) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/${ storeId }/${ userId }/${ saleChannel }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getOrdersDebtSummary(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/debt-amount/summary`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    checkPhoneNumber(phoneNumber, countryCode) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/checkPhoneNumber/${ storeId }?phone=${ phoneNumber }&countryCode=${ countryCode }`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getCustomerAddress(id) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/customer-addresses/customer-profile/${ id }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    checkExistPackage(packageId) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/user-features/store/${ storeId }/exist`, {
                params: {
                    packageId
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

    //facebook tag

    getAllTagByListfbUser(fbUsers) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/store/${ storeId }?id=${ fbUsers }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAssignedFbTagByCustomerId(customerId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/customer-profile/${ storeId }/${ customerId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAssignedTagByfbUser(fbUser) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/${ storeId }/${ fbUser }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    assignTagByfbUser(fbUserTag) {
        const fbPageId = localStorage.getItem(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_ID)
        const { fbUser, fbTagInfoId } = fbUserTag;
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/assign/${ storeId }`, {
                fbUser,
                fbTagInfoId,
                fbPageId,
                storeId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    revokeTagByfbUser(fbUserTag) {
        const { fbUser, fbTagInfoId } = fbUserTag;
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/revoke/${ storeId }`, {
                fbUser,
                fbTagInfoId,
                storeId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    revokeFbTagByCustomerId(customerId, tagId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/customer-profile/revoke/${ storeId }/${ customerId }/${ tagId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAllFbSocialTag() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/fb-tag-infos/store/${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    saveFbSocialTag(tag) {
        const { id, tagName, tagColor, isShow } = tag;
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/fb-tag-infos/${ storeId }`, {
                id,
                tagName,
                tagColor,
                isShow,
                storeId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    deleteFbSocialTag(tagId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/fb-tag-infos/${ storeId }/${ tagId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    //zalo tag

    getAllTagByListZaloUser(fbUsers) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-user-tag/store/${ storeId }?id=${ fbUsers }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAllFbUserTagByStore() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/fb-user-tag/store/${ storeId }/v2`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAssignedTagByZaloUser(fbUser) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-user-tag/${ storeId }/${ fbUser }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAssignedZaloTagByCustomerId(customerId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-user-tag/customer-profile/${ storeId }/${ customerId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    assignTagByZaloUser(zaloUserTag) {
        const { zaloUser, zaloTagInfoId } = zaloUserTag;
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-user-tag/assign/${ storeId }`, {
                zaloUser,
                zaloTagInfoId,
                storeId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    revokeTagByZaloUser(zaloUserTag) {
        const { zaloUser, zaloTagInfoId } = zaloUserTag;
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-user-tag/revoke/${ storeId }`, {
                zaloUser,
                zaloTagInfoId,
                storeId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    revokeZaloTagByCustomerId(customerId, tagId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-user-tag/customer-profile/revoke/${ storeId }/${ customerId }/${ tagId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAllZaloSocialTag() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-tag-infos/store/${ storeId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    saveZaloSocialTag(tag) {
        const { id, tagName, tagColor, isShow } = tag;
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-tag-infos/${ storeId }`, {
                id,
                tagName,
                tagColor,
                isShow,
                storeId
            })
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    deleteZaloSocialTag(tagId) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.delete(`/${ Constants.BEEHIVE_SERVICE }/api/zalo-tag-infos/${ storeId }/${ tagId }`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getListSegmentUser(params) {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        return new Promise((resolve, reject) => {
            apiClient.get(`/${ Constants.BEEHIVE_SERVICE }/api/segment/store/${ storeId }`,
                {
                    params: params
                })
                .then(result => {
                    if (result.data) {
                        resolve(result)
                    }
                }, (e) => reject(e))
        })
    }

    userBySegment(params) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/segment/store/${ storeId }/find-by-ids`, { params })
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    assignCustomerToPartner(data) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/update-partner/${ storeId }`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    assignCustomerToStaff(data) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/bulk-assign-customer-to-a-staff/${ storeId }`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getShippingAddress(page, size, keyword = undefined) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/orders/full-shipping-address/${ storeId }`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword
                }
            }).then(result => {
                resolve({
                    data: result.data.content,
                    total: result.data.content.length
                })
            }).catch(reject)
        })
    }

    getAddressCustomer(page, size, keyword = undefined) {
        return new Promise((resolve, reject) => {
            const langKey = CredentialUtils.getLangKey();
            const storeId = CredentialUtils.getStoreId();
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/suggestion/customer-address/${ storeId }`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword,
                    langKey
                }
            }).then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                })
            }).catch(reject)
        })
    }

    getMembershipNameByCustomerids(customerIds) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.post(`/${ Constants.BEEHIVE_SERVICE }/api/memberships/membership-name-by-customer-ids/${ storeId }`, customerIds)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    confirmPaymentForUser(paymentHistory) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.post(`${ Constants.BEEHIVE_SERVICE }/api/customer-profiles/pay-debt/${ storeId }`, paymentHistory)
                .then(res => {
                    resolve(res.data)
                })
                .catch(reject)
        })
    }

    customerSummary(customerId, saleChannel) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${ Constants.BEEHIVE_SERVICE }/api/summary/${ storeId }`, {
                params: {
                    customerId,
                    saleChannel
                }
            })
                .then(res => {
                    resolve(res.data)
                })
                .catch(reject)
        })
    }

}


const beehiveService = new BeehiveService();
export default beehiveService;
