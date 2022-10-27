import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";
import {CredentialUtils} from "../utils/credential";


/**
 * @typedef {Object} AppConfigModel
 * @property {Number} id
 * @property {Number} storeId
 * @property {String} clientId
 * @property {String} clientSecretKey
 * @property {Boolean} enabledLogin
 */

/**
 * @typedef {Object} PixelConfigModel
 * @property {Number} id
 * @property {Number} appId
 * @property {String} pixelId
 * @property {Number} shopId
 * @property {Boolean} appUse
 */

class FacebookService {

    getStoreCreditInfo() {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-credits/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    requestToUseAutomaticAds() {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)

        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/store-credits/request-use-ad/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    doSubscription(packageId, paymentMethod) {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        const langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY)

        return new Promise((resolve, reject) => {
            const body = {
                "locale": langKey,
                "packageNumber": packageId,
                "paymentMethod": paymentMethod,
                "storeId": storeId
            };
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/subscript/${storeId}`, body)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    markOrderHasMappingWithVnPay(orderId, status) {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        const langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY)
        const body = {
            "status": status,
            "locale": langKey
        }
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/subscript/mark_order_with_vnpayorcod/${storeId}/${orderId}`, body)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    checkBuyingCredit() {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/subscript/check_status/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    updateDailyBudget(data) {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/targeting/campaigns/update_daily_budget/${storeId}`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    requestPermission(params) {
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/fb-page/permission?pageId=${params.pageId}&permittedTask=${params.permittedTask}&fbAccount=${params.fbAccount}&pageName=${params.pageName}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getRecentCreditHistory() {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/order_package/get_10_order_history/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getCurrentBalance() {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-credits/get-ballance//${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getCurrentCampaign(datePreset) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/insights/ad-campaigns/store-Ids/${storeId}/date-presets/${datePreset}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    enableTargeting(params) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/targeting/campaigns/enable`,{params: params})
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    saveChatConfig(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/chat-configs`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    updateChatConfig(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/chat-configs`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    switchFbChat(data){
        data.isDeleted = !data.isDeleted
        this.updateChatConfig(data);

    }
    getChatConfigByStoreId(){
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/chat-configs`, {params: {storeId: storeId}})
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    requestToUseChat(data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/store-chats/${storeId}`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getRequestToUseChat() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-chats/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getRequestToUseChatOldVersion() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-chats/get-for-old-version/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getRequestToPageChat(usingStatus = 'APPROVED') {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-chats/store/${storeId}?usingStatus=${usingStatus}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    /**
     * Get pixel config
     * @return {Promise<PixelConfigModel>}
     */
    getPixelId() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/shop-pixels/shop/${storeId}`)
                .then(result => resolve(result.data))
                .catch(() => resolve(null))
        });
    }

    updatePixelId(data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/shop-pixels/update-pixel-id/${storeId}`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    updateAppId(data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/shop-pixels/update-app-id/${storeId}`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    /**
     * Create app config
     * @param {AppConfigModel} request
     */
    createAppConfig(request) {
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/app-configs`, request)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    /**
     * Update app config
     * @param {AppConfigModel} request
     */
    updateAppConfig(request) {
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/app-configs`, request)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    /**
     * Get app config
     * @return {Promise<AppConfigModel>}
     */
    getAppConfig() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/app-configs/store/${storeId}`)
                .then(result => resolve(result.data))
                .catch(() => resolve(null))
        })
    }

    /**
     * @typedef {{
     *  id: Number,
     *  appSecretProof: String,
     *  createdDate: String,
     *  pageId: String,
     *  pageName: String,
     *  pageToken: String,
     *  pageUrl: String,
     *  storeId: Number,
     *  usingStatus: String
     * }} StoreChatModel
     */
    /**
     * getConnectedPageList
     * @return {Promise<StoreChatModel[]>}
     */
    getSavedPageList() {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-chats/store/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    /**
     * Add page to connection list
     * @return {Promise<unknown>}
     */
    addPageToConnectionList(shortUserToken, userId) {
        return new Promise( (resolve, reject) => {
            const bcStoreId = CredentialUtils.getStoreId()
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/store-chats/create`, {
                shortUserToken, userId, bcStoreId
            })
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    claimPages(pageIds, options) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/store-chats/store/${storeId}/claim`, pageIds, {
                params: options
            })
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    unClaimPages(pageIds) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/store-chats/store/${storeId}/unclaim`, pageIds)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    getAllNoteFb(customerId, page = 0, size = 10) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.FACEBOOK_SERVICE}/api/note-fbs/${customerId}/${storeId}`,
                    {
                        params: {
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

    updateNoteFb(data) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/note-fbs`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    createNoteFb(data) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/note-fbs`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    deleteNoteFb(id) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.delete(`${Constants.FACEBOOK_SERVICE}/api/note-fbs/${id}`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    getFBUser(psid) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/customer-fb-infos/store/${storeId}/fb-user/${psid}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    assignFBUser(psid, data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/customer-fb-infos/store/${storeId}/fb-user/${psid}/assign`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    unAssignFBUser(psid) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/customer-fb-infos/store/${storeId}/fb-user/${psid}/un-assign`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    loadAssignedStaffByFbUser() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.FACEBOOK_SERVICE}/api/customer-fb-infos/assigned-staff/${storeId}`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    filterFbUserByAssignedStaff(staffIds, isUnassigned) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.FACEBOOK_SERVICE}/api/customer-fb-infos/filter/${storeId}?unassigned=${isUnassigned}`, [...staffIds])
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     * @typedef {{
     *  id: Number,
     *  storeId: Number,
     *  fbUserId: String,
     *  fbName: String,
     *  fbAvatar: String,
     *  isLogged: Boolean,
     * }} StoreConfigModel
     */
    /**
     * getConnectedPageList
     * @return {Promise<StoreConfigModel[]>}
     */
    getStoreConfig() {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-configs/store/${storeId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    logout() {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/store-configs/store/${storeId}/logout`)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    checkExpiredMessages(sellerPage, fbConversationIds) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/check-message/${storeId}/expire`, {
                params: {
                    sellerPage,
                    fbConversationIds
                }
            })
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }


    getListAutomationByStore(queryParams, page = 0, size = 100) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.FACEBOOK_SERVICE}/api/automated-campaigns/search`,
                    {
                        params: {
                            ...queryParams,
                            page,
                            size,
                            storeId
                        },
                    }
                )
                .then((result) => {
                    const totalElements = result.headers["x-total-count"] || 0;
                    resolve({ data: result.data, totalCount: totalElements });
                }, reject);
        });
    }

    createAutomation(data) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/automated-campaigns`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    getDetailAutomation(id) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/automated-campaigns/detail/${storeId}/${id}`)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    deleteAutomation(id) {
        return new Promise( (resolve, reject) => {
            apiClient.delete(`${Constants.FACEBOOK_SERVICE}/api/automated-campaigns/${id}`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    updateAutomation(data) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`${Constants.FACEBOOK_SERVICE}/api/automated-campaigns`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    /**
     * @typedef {{
     *  postId: String,
     *  after: String,
     *  limit: Number,
     * }} PostSearchRequest
     *
     * Get Fb post of page
     * @param pageId
     * @param {PostSearchRequest} options
     * @returns {Promise<unknown>}
     */
    getFbPosts(pageId, options) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${ Constants.FACEBOOK_SERVICE }/api/fb-posts/store/${ storeId }/page/${ pageId }`, {
                params: options
            })
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getListBroadcastByStore(queryParams, page = 0, size = 100) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.FACEBOOK_SERVICE}/api/broadcasts/search`,
                    {
                        params: {
                            ...queryParams,
                            page,
                            size,
                            storeId
                        },
                    }
                )
                .then((result) => {
                    const totalElements = result.headers["x-total-count"] || 0;
                    resolve({ data: result.data, totalCount: totalElements });
                }, reject);
        });
    }

    deleteBroadcast(id) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.delete(`${Constants.FACEBOOK_SERVICE}/api/broadcasts/${storeId}/${id}`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    createBroadcast(data) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.FACEBOOK_SERVICE}/api/broadcasts`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    editBroadcast(data) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.FACEBOOK_SERVICE}/api/broadcasts`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    getDetailBroadcast(id) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/broadcasts/detail/${storeId}/${id}`)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    fbUserBySegment(pageId, params) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/broadcasts/count-fb-user-by-segment/${storeId}/${pageId}`, {params})
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }
}



const facebookService = new FacebookService();
export default facebookService;
