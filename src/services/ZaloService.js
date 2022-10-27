import apiClient from '../config/api';
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";
import {NAV_PATH} from "../components/layout/navigation/Navigation";
import {AgencyService} from "./AgencyService";
import {NavigationPath} from "../config/NavigationPath";

class ZaloService {


    switchFbChat(data){
        data.isDeleted = !data.isDeleted
        this.updateChatConfig(data);

    }
    getChatConfigByStoreId() {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/chat-configs`, {params: {storeId: storeId}})
                .then(result => resolve(result.data))
                .catch(reject)
        });
    };

    requestToUseChat(data) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.ZALO_SERVICE}/api/store-chats/${storeId}`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }


    storeAccessToken(appId, accessToken, oaId) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.post(`${Constants.ZALO_SERVICE}/api/store-chats`, {
                appId, accessToken, oaId, storeId

            })
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    redeemAccessToken(code, oaId) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`${Constants.ZALO_SERVICE}/api/oauth/v4/redeem-access-token`, {
                code, oaId
            }, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(response => {
                    resolve(response.data)
                })
                .catch(reject)
        })
    }

    requestPermission() {
        const redeemAccessTokenRef = this.redeemAccessToken
         return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/oauth/v4/permission-url-request`, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(response => {
                    const zaloUrl = response.data
                    const win = window.open(zaloUrl, "GoChat permission request")

                    const wListener = (event) => {
                        const origin  = window.location.protocol + '//' + window.location.host
                        if (event.origin === origin && event.data?.type === 'zalo-resolve-token') {  // same domain
                            const {code, oaId} = event.data
                            redeemAccessTokenRef(code, oaId)
                                .then(resolve)
                                .catch(e => {
                                    reject({
                                        ...e,
                                        code,
                                        oaId
                                    })
                                })
                        }
                    }

                    window.addEventListener("message", wListener, false);

                    const timer = setInterval(function() {
                        if (win.closed) {
                            clearInterval(timer);
                            window.removeEventListener('message', wListener)
                        }
                    }, 500);
                })
        })
    }

    getAppId() {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/zalo-sdk/configuration-properties`)
                .then(result => {
                    resolve({appID: AgencyService.getZaloAppId(result.data.appID)})
                })
                .catch(reject)
        })
    }

    getStoreChatConfig() {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.ZALO_SERVICE}/api/store-chats/store/${storeId}`)
                .then(result => {
                    const store = result.data[0]
                    if (store) {
                        resolve(store)
                    } else{
                        reject('hasNoToken')
                    }
                })
                .catch(reject)
        })
    }

    clearAccessToken(oaId) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            const oaID = oaId || CredentialUtils.getZaloPageId()
            apiClient.delete(`${Constants.ZALO_SERVICE}/api/store-chats/store/${storeId}/${oaID}`)
                .then(resolve)
                .catch(reject)
        })
    }



    saveChatConfig(data) {
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.ZALO_SERVICE}/api/chat-configs`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    updateChatConfig(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`${Constants.ZALO_SERVICE}/api/chat-configs`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    getZaloUser(zaloUserId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.ZALO_SERVICE}/api/zalo-users/store/${storeId}/zalo-user/${zaloUserId}`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    assignZaloUser(zaloUserId, data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.ZALO_SERVICE}/api/zalo-users/store/${storeId}/zalo-user/${zaloUserId}/assign`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    unAssignZaloUser(zaloUserId) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`${Constants.ZALO_SERVICE}/api/zalo-users/store/${storeId}/zalo-user/${zaloUserId}/un-assign`)
                .then(result => resolve(result.data))
                .catch(reject)
        });
    }

    loadAssignedStaffByZaloUser() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.ZALO_SERVICE}/api/zalo-users/assigned-staff/${storeId}`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    filterZaloUserByAssignedStaff(staffIds, isUnassigned) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.ZALO_SERVICE}/api/zalo-users/filter/${storeId}?unassigned=${isUnassigned}`, [...staffIds])
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    filterZaloUserByAssigned(tagIds, staffIds, isUnassigned, untagged) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.ZALO_SERVICE}/api/zalo-users/filter-v2/${storeId}?unassigned=${isUnassigned}&staffIds=${staffIds}&tagIds=${tagIds}&untagged=${untagged}`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    createNoteZalo(data) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`${Constants.ZALO_SERVICE}/api/zalo-notes`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    getAllNoteZalo(profileId, page = 0, size = 10) {
        const storeId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient
                .get(
                    `/${Constants.ZALO_SERVICE}/api/zalo-notes/${profileId}/${storeId}`,
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



    updateNoteZalo(data) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`${Constants.ZALO_SERVICE}/api/zalo-notes`, data)
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    deleteNoteZalo(id) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId();
            apiClient.delete(`${Constants.ZALO_SERVICE}/api/zalo-notes/${id}`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    /**
     * @typedef {{
     *     attachment_id: String,
     *     token: String
     * }} ZaloUploadResponse
     */
    /**
     * Upload file to Zalo server
     * https://developers.zalo.me/docs/api/official-account-api/upload-hinh-anh/upload-hinh-anh-post-5091
     * @param oaId
     * @param file
     * @param {'IMAGE'|'GIF'|'FILE'} fileType
     * @return {Promise<ZaloUploadResponse>}
     */
    uploadToZaloServer(oaId, file, fileType) {
        return new Promise( (resolve, reject) => {
            let dataForm = new FormData()
            dataForm.append('file', file)

            apiClient.post(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/upload/${fileType}`, dataForm, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(result => {
                    if (result.data.message === 'Success') {
                        resolve(result.data.data)
                    } else {
                        reject(result)
                    }
                })
                .catch(reject)
        })
    }

    /**
     * Send message to user
     * https://developers.zalo.me/docs/api/official-account-api/gui-tin-va-thong-bao-qua-oa/cac-loai-tin-va-dinh-dang-duoc-ho-tro-post-5077
     * @param oaId
     * @param messageRequest
     */
    sendMessage(oaId, messageRequest) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/send`, messageRequest, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    /**
     * @typedef {{
     *     oa_id: String,
     *     description: String,
     *     name: String,
     *     avatar: String,
     *     cover: String,
     *     is_verified: Boolean
     * }} ZaloOADetailModel
     * /
    /**
     * Get OA Detail
     * https://developers.zalo.me/docs/api/official-account-api/quan-ly-thong-tin-official-account/lay-thong-tin-official-account-post-5135
     * @param oaId
     * @return Promise<ZaloOADetailModel>
     */
    getOADetail(oaId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/detail`, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(result => {
                    result = this.keepRawId(result)
                    if (result.data.message === 'Success') {
                        resolve(result.data.data)
                    } else {
                        reject(result)
                    }
                })
                .catch(reject)
        })
    }


    /** @typedef {Object} ZaloUserProfileDTO
     * @property {String} address
     * @property {String} avatar
     * @property {String} avatar120
     * @property {String} avatar240
     * @property {String} city
     * @property {String} displayName
     * @property {String} displayNameUnAccent
     * @property {String} district
     * @property {Number} id
     * @property {String} name
     * @property {String} phone
     * @property {Number} userGender
     * @property {String} userId
     * @property {String} userIdByApp
     * @property {String} ward
     */
    /**
     * Get user profile detail
     * @param userId
     * @param oaId
     * @return Promise<ZaloUserProfileDTO>
     */
    getUserProfile(userId, oaId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/user-profile/${userId}`, {
                params: {
                    storeId: CredentialUtils.getStoreId(),
                    oaId: oaId
                }
            })
                .then(result => {
                    result = this.keepRawId(result)
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    /** @typedef {Object} ChatHistoryRecentVM
     * @property {String} conversationId
     * @property {String} eventName
     * @property {Number} id
     * @property {Boolean} isOrderSummary
     * @property {Boolean} isSellerRead
     * @property {Boolean} isSellerSend
     * @property {Boolean} isUserRead
     * @property {ZaloMessageObject} messageObject
     * @property {Number} messageTime
     * @property {String} mid
     * @property {Number} oaUnread
     * @property {Number} orderSummaryId
     * @property {String} rawResponse
     * @property {String} recipientPage
     * @property {String} sellerPage
     * @property {String} senderPage
     * @property {Number} storeId
     * @property {String} userAvatar
     * @property {String} userDisplayName
     * @property {String} userPage
     * @property {String} msgType
     */

    /**
     * @typedef {{
     *     text: String,
     *     msg_id: String,
     *     attachments: {
     *          payload: {
     *                 thumbnail: String,
     *                 url: String,
     *                 description: String,
     *                 id: String,
     *                 coordinates: {
     *                     latitude: String,
     *                     longitude: String,
     *                 },
     *                 size: String,
     *                 name: String,
     *                 checksum: String,
     *                 type: String,
     *                 url: String
     *          },
     *          type: String
     *     }[]
     * }} ZaloMessageObject
     */

    /**
     * Get recent chat list
     * @param oaId
     * @param keyword
     * @param page
     * @param size
     * @return Promise<{
     *     data: ChatHistoryRecentVM[],
     *     totalCount: Number
     * }>
     */
    getRecentChatList(oaId, keyword, page, size) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/recent`, {
                params: {
                    storeId: CredentialUtils.getStoreId(),
                    keyword,
                    page,
                    size
                }
            })
                .then(result => {
                    result = this.keepRawId(result)
                    resolve({
                        totalCount: parseInt(result.headers['x-total-count']),
                        data: result.data
                    })
                })
                .catch(reject)
        })
    }

    /**
     * @typedef {Object} ChatHistoryDTO
     * @property {String} conversationId
     * @property {String} eventName
     * @property {Number} id
     * @property {Boolean} isOrderSummary
     * @property {Boolean} isSellerRead
     * @property {Boolean} isSellerSend
     * @property {Boolean} isUserRead
     * @property {ZaloMessageObject} messageObject
     * @property {Number} messageTime
     * @property {String} mid
     * @property {Number} orderSummaryId
     * @property {String} rawResponse
     * @property {String} recipientPage
     * @property {String} sellerPage
     * @property {String} senderPage
     * @property {Number} storeId
     * @property {String} userPage
     * @property {String} msgType
     * @property {Boolean} isFirstMsg
     * @property {Boolean} isFromApi
     */
    /**
     * Get conversation detail
     * @param oaId
     * @param userId
     * @param markAllOaAsRead
     * @param page
     * @param size
     * @return Promise<{{
     *     data: ChatHistoryDTO[],
     *     totalCount: Number
     * }}>
     */
    getConversationDetail(oaId, userId, markAllOaAsRead = false, page, size) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/conversation/${userId}`, {
                params: {
                    storeId: CredentialUtils.getStoreId(),
                    markAllOaAsRead,
                    page,
                    size
                }
            })
                .then(result => {
                    result = this.keepRawId(result)
                    resolve({
                        totalCount: parseInt(result.headers['x-total-count']),
                        data: result.data
                    })
                })
                .catch(reject)
        })
    }

    /**
     * countUnReadMessage
     * @param oaId
     * @return {Promise<Number>}
     */
    countUnReadMessage(oaId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/unread/msg/count`, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }


    /**
     * countUnReadUser
     * @param oaId
     * @return {Promise<Number>}
     */
    countUnReadUser(oaId) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`${Constants.ZALO_SERVICE}/api/chat/oa/${oaId}/unread/user/count`, {
                params: {
                    storeId: CredentialUtils.getStoreId()
                }
            })
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    keepRawId(result) {
        if (result.request.response) {
            let response = result.request.response.replace(/(_id":)([0-9]*?)(,)/gs, '_id":"$2",')
            response = response.replace(/(sellerPage":)([0-9]*?)(,)/gs, 'sellerPage":"$2",')
            response = response.replace(/(userPage":)([0-9]*?)(,)/gs, 'userPage":"$2",')
            response = response.replace(/(senderPage":)([0-9]*?)(,)/gs, 'senderPage":"$2",')
            response = response.replace(/(userPage":)([0-9]*?)(,)/gs, 'userPage":"$2",')
            response = response.replace(/(recipientPage":)([0-9]*?)(,)/gs, 'recipientPage":"$2",')
            return {
                ...result,
                data: JSON.parse(response)
            }
        }
        return result
    }

}



const zaloService = new ZaloService();
export default zaloService;
