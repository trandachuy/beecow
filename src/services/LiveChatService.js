import {CredentialUtils} from "../utils/credential";
import {FETCH_MODE,LiveChatConversationContext} from "../pages/live-chat/conversation/context/LiveChatConversationContext";
import apiClient from '../config/api';
import Constants from "../config/Constant";
import storageService from "./storage";
import { DateTimeUtils } from "../utils/date-time";
import {FETCH_MODE_TYPE,FbMessengerContext} from "../pages/gosocial/facebook/context/FbMessengerContext";

// const getListConversation = (after, keyword, limit = 20) => {
//     let postFix = `?limit=${limit}`
//     if(keyword){postFix += `&keyword=${keyword}`}
//     if(after){postFix += `&after=${after}`}
//     const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
//     return new Promise((resolve, reject) => {
//         apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/find-conversion/${storeId}${postFix}`)
//             .then(result => resolve(result.data))
//             .catch(reject)
//     });
// }

const getListConversation = (after, fields = 'senders,unread_count,updated_time,snippet', limit = undefined) => {
    return new Promise( (resolve, reject) => {
        const pageId = CredentialUtils.getLiveChatPageId()
        const pageToken = CredentialUtils.getLiveChatPageAccessToken()
        const appSecretProof = CredentialUtils.getLiveChatAppSecretProof()
        FB.api(`/${pageId}/conversations`, 'get', {
            access_token: pageToken,
            fields: fields,
            after: after,
            limit: limit
        }, resolve)
    })
}

const getListConversationForNew = (after, keyword, sellerPageId, limit = 20, staffAssigned, tagIds) => {
    let postFix = `?limit=${limit}`
    if(keyword){postFix += `&keyword=${keyword}`}
    if(after){postFix += `&after=${after}`}
    if(staffAssigned && staffAssigned.length > 0){postFix += `&staffAssigned=${staffAssigned}`}
    if(tagIds && tagIds.length > 0){postFix += `&tagIds=${tagIds}`}
    const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/find-conversion/${storeId}${postFix}&sellerPage=${sellerPageId}`)
            .then(result => resolve(result.data))
            .catch(reject)
    });
}

const getMessagesOfConversation = (sellerPage, conversationId, after, limit = 20) => {
    let postFix = `?limit=${limit}&sellerPage=${sellerPage}`
    if(after){postFix += `&after=${after}`}
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/find-message/${storeId}${postFix}&fbConversationId=${conversationId}`)
            .then(result => resolve(result.data))
            .catch(reject)
    })
}

const getMessagesById = (messageId) => {
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/find-message/${storeId}/${messageId}`)
            .then(result => resolve(result.data))
            .catch(reject)
    })
}

const getUserPicture = (userId) => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getLiveChatPageAccessToken()
        FB.api(`/${userId}/picture?redirect=false`, 'get', {
            access_token: pageToken        
        }, resolve)
    })
}

const getUserPictureNew = (psid, isSeller) => {
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/store-chats/get-user-picture/${storeId}?psid=${psid}&isSeller=${isSeller}`)
            .then(result => resolve(result.data))
            .catch(reject)
    })
}

const sendImageToUser = (userId, imageUrl) => {
    return new Promise( (resolve, reject) => {
        const pageId = CredentialUtils.getLiveChatPageId()
        const pageToken = CredentialUtils.getLiveChatPageAccessToken()
        const appSecretProof = CredentialUtils.getLiveChatAppSecretProof()

        FB.api(`/${pageId}/messages`, 'post', {
            access_token: pageToken,
            appsecret_proof: appSecretProof,
            message: {
                attachment: {
                    type: 'image',
                    payload: {
                        url: imageUrl,
                    }
                }
            },
            recipient: {
                id: userId,
            },
        }, resolve)
    })
}

const sendMessageToUser = (userId, messageKey = 'text', messageValue, fbPageId) => {
    const pageId = fbPageId || CredentialUtils.getLiveChatPageId()
    const body = {
                    message: {
                        [messageKey]: messageValue
                    },
                    recipient: {
                        id: userId,
                    }
                };

    return new Promise( (resolve, reject) => {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/send-message/${storeId}`, {
            sellerPageId: pageId,
            userPageId: userId,
            message: JSON.stringify(body)
        }).then(result => resolve(result.data)).catch(reject)
    })
}

const searchConversationByUserNameOld = (keyword) => {
    return new Promise( (resolve, reject) => {
        getListConversation(undefined, 'senders', 200)
            .then(converationList => {
                const searchResult = converationList.data.filter(conversation => conversation.senders.data[0].name.toLowerCase().includes(keyword.toLowerCase()))
                resolve(searchResult)
            })
    })
}

const getUserProfile = (userId, fields = '') => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getLiveChatPageAccessToken()
        const appSecretProof = CredentialUtils.getLiveChatAppSecretProof()

        FB.api(`/${userId}`, 'get', {
            access_token: pageToken,
            appsecret_proof: appSecretProof,
            fields: fields
        }, resolve)
    })
}

const getPagePicture = () => {
    return new Promise( (resolve, reject) => {
        const pageId = CredentialUtils.getLiveChatPageId()
        const pageToken = CredentialUtils.getLiveChatPageAccessToken()

        FB.api(`/${pageId}/picture?redirect=false`, 'get', {
            access_token: pageToken
        }, resolve)
    })
}

const webhookDisconnect = (state, dispatch) => {
    if (state.webhookConnection) {
        state.webhookConnection.disconnect()
        dispatch(LiveChatConversationContext.actions.disconnectWebhook())
    }
}

const webhookConnect = (storeId, dispatch) => {
        let socket = new SockJS(process.env.FB_WEBSOCKET_BASE_URL);
        let stompClient = Stomp.over(socket);
        stompClient.connect(
            {},
            () => {
                console.log('Connected!');
                dispatch(LiveChatConversationContext.actions.webhookConnection(stompClient));
                webhookSubscribe(stompClient, storeId, dispatch)
            },
            (error) => {
                console.error("Lost connection: " + error);
            }
        );
        stompClient.reconnect_delay = 5000
}

const webhookSubscribe = (connection, storeId, dispatch) => {
    connection.subscribe(`/messenger/store/${storeId}`, (messaging) => {
        let event = JSON.parse(messaging.body);

        // Receive msg from FB User
        //if (event.message) {
            dispatch(LiveChatConversationContext.actions.evtMsgFromSender({senderId: event.userPage, messageId: event.mid, timestamp: event.messageTime, messageObject: event}))
        //}
    });
}

const findIndexOfSenderInConversations = (conversations, senderId) => {
    if (conversations && senderId && conversations.length && conversations.length > 0) {
        return conversations.findIndex((value) => {
            if (value.senders && value.senders.data) {
                for (let sender of value.senders.data) {
                    if (sender.psid === senderId) {
                        return value;
                    }
                }
            }
        });
    }
}

const searchConversationByUserName = (keyword) => {
    return new Promise( (resolve, reject) => {
        getListConversation(undefined, keyword, 200)
            .then(converationList => {
                const searchResult = converationList.data.filter(conversation => conversation.senders.data[0].name.toLowerCase().includes(keyword.toLowerCase()))
                resolve(searchResult)
            })
    })
}

const switchToIntervalMode = (dispatch) => {
    dispatch(LiveChatConversationContext.actions.setFetchMode(FETCH_MODE.INTERVAL))
}
const switchToRealTimeMode = (dispatch) => {
    dispatch(LiveChatConversationContext.actions.setFetchMode(FETCH_MODE.REALTIME))
}


///////////////////////////////////////////////////////////////////////
//////////////////////////FOR NEW SOCIAL CHAT ////////////////////////
///////////////////////////////////////////////////////////////////////
const getConversationDetail = (sellerPageId, conversationId) => {
    const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
    return new Promise((resolve, reject) => {
        apiClient.get(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/find-conversion-detail/${storeId}?sellerPage=${sellerPageId}&gsConversationId=${conversationId}`)
            .then(result => resolve(result.data))
            .catch(reject)
    });
}

const sendFBMessageCommon = (messageType, value, userPageId, sellerPageId) => {
    // messageType = <text|image|video|audio|file>
    let body = {};
    if("text" === messageType){
        body = {
            message: {
                text: value
            },
            recipient: {
                id: userPageId
            }
        };
    }else {
        body = {
            message: {
                attachment: {
                    type: messageType,
                    payload: {
                        attachment_id: value
                    }
                }
            },
            recipient: {
                id: userPageId
            }
        };
    }

    return new Promise( (resolve, reject) => {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/send-message/${storeId}`, {
            sellerPageId: sellerPageId,
            userPageId: userPageId,
            message: JSON.stringify(body),
            messageType: messageType,
            attachmentId: value
        }).then(result => resolve(result.data)).catch(reject)
    })
}

const markReadAConversation = (conversationId, unreadNumber = 0) => {
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID)
        apiClient.post(`${Constants.FACEBOOK_SERVICE}/api/fb-chat/mark-read-conversation/${storeId}?fbConversationId=${conversationId}&unreadNumber=${unreadNumber}`, {})
        .then(result => resolve(result.data)).catch(reject)
    })
}

const switchToIntervalModeNew = (dispatch) => {
    dispatch(FbMessengerContext.actions.setFetchMode(FETCH_MODE_TYPE.INTERVAL))
}
const switchToRealTimeModeNew = (dispatch) => {
    dispatch(FbMessengerContext.actions.setFetchMode(FETCH_MODE_TYPE.REALTIME))
}

const webhookDisconnectNew = (state, dispatch) => {
    if (state.webhookConnection) {
        let webHookClone = _.cloneDeep(state.webhookConnection)
        webHookClone.disconnect();
        dispatch(FbMessengerContext.actions.disconnectWebhook(null))
    }
}

const webhookConnectNew = (storeId, dispatch) => {
        let socket = new SockJS(process.env.FB_WEBSOCKET_BASE_URL);
        let stompClient = Stomp.over(socket);
        stompClient.reconnect_delay = 5000
        stompClient.connect(
            {},
            () => {
                console.log('Connected!');
                webhookSubscribeNew(stompClient, storeId, dispatch)
                dispatch(FbMessengerContext.actions.webhookConnection(stompClient));
            },
            (error) => {
                console.error("Lost connection: " + error);
            }
        );
        
}

const webhookSubscribeNew = (connection, storeId, dispatch) => {
    connection.subscribe(`/messenger/store/${storeId}`, (messaging) => {
        let event = JSON.parse(messaging.body);
        dispatch(FbMessengerContext.actions.evtMsgFromSender({
            senderId: event.userPage, 
            messageId: event.mid, 
            timestamp: event.messageTime, 
            messageObject: event}))
    });
}


export const LiveChatService = {
    getUserPicture,
    searchConversationByUserNameOld,
    getUserProfile,
    getPagePicture,
    sendImageToUser,
    getListConversation,
    getListConversationForNew,
    getUserPictureNew,
    getMessagesOfConversation,
    sendMessageToUser,
    getMessagesById,
    webhookConnect,
    webhookSubscribe,
    findIndexOfSenderInConversations,
    searchConversationByUserName,
    webhookDisconnect,
    switchToIntervalMode,
    switchToRealTimeMode,
    sendFBMessageCommon,
    webhookConnectNew,
    webhookSubscribeNew,
    webhookDisconnectNew,
    switchToIntervalModeNew,
    switchToRealTimeModeNew,
    markReadAConversation,
    getConversationDetail
}
