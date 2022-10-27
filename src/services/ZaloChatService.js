import {CredentialUtils} from "../utils/credential";
import axios from "axios";
import {ZaloChatUtils} from "../pages/live-chat/zalo/ZaloChatUtils";
import {ZaloChatConversationContext} from "../pages/live-chat/zalo/conversation/context/ZaloChatConversationContext";
import {FETCH_MODE} from "../pages/live-chat/conversation/context/LiveChatConversationContext";
/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const defaultOptions = {
    baseURL: 'https://openapi.zalo.me/v2.0/oa/'
};
const ZALO = {
    client: axios.create(defaultOptions)
};

const convertIdNumberToStr = (response) => {
    return response.replace(/(_id":)([0-9]*?)(,)/gs, '_id":"$2",')
}

const getListConversation = (offset = 0, count = 10) => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getZaloPageAccessToken()

        ZALO.client.get('listrecentchat', {
            params: {
                access_token: pageToken,
                data: {
                    offset,
                    count
                }
            }
        }).then(result => {
            if (result.request.response) {
                const response = result.request.response.replace(/(_id":)([0-9]*?)(,)/gs, '_id":"$2",')
                resolve(JSON.parse(response))
            }
        }).catch(reject)
    })
}

const getMessagesOfConversation = (userId, offset = 0, count = 10) => {
    return new Promise( (resolve, reject) => {
        const token = CredentialUtils.getZaloPageAccessToken()
        ZALO.client.get(`conversation?data=%7B%22offset%22%3A${offset}%2C%22user_id%22%3A${userId}%2C%22count%22%3A${count}%7D`, {
            params: {
                access_token: token,
            }
        }).then(result => {
            const response = convertIdNumberToStr(result.request.response)
            resolve(JSON.parse(response))
        })
            .catch(reject)
    })
}

const getUserProfile = (userId) => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getLiveChatPageAccessToken()

        ZALO.client.get(`getprofile`, {params: {
            access_token: pageToken,
        }})
            .then(result => {
                resolve(result.data)
            })
    })
}



const sendMessageToUser = (userId, messageKey = 'text', messageValue) => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getZaloPageAccessToken()

        ZALO.client.post(`message`, {
            message: {
                [messageKey]: messageValue
            },
            recipient: {
                user_id: userId,
            }
        }, {
            params: {
                access_token: pageToken,
            }
        })
            .then(result => {
                resolve(result.data)
            })
    })
}

const webhookConnect = (storeId, subscribeFunc, context) => {
    // let socket = new SockJS(process.env.API_BASE_URL + '/zaloservices/ws');
    let socket = new SockJS(process.env.ZALO_WEBSOCKET_BASE_URL);
    let stompClient = Stomp.over(socket);
        stompClient.connect(
            {},
            () => {
                console.log('Connected!');
                console.log('>>>>>>>>>>> dispatch set connection')
                if (context) { // gosocial
                    subscribeFunc(context.actions.webhookConnection(stompClient));
                } else { // old zalo chat
                    subscribeFunc(ZaloChatConversationContext.actions.webhookConnection(stompClient));
                }
                webhookSubscribe(stompClient, storeId, subscribeFunc, context)
            },
            (error) => {
                console.error("Lost connection: " + error);
                console.log("Reconnect in 5 seconds");
                const timeoutId = setTimeout(() =>{
                    console.log("Reconnecting...");
                    webhookConnect(storeId, subscribeFunc, context);
                }, 5000);
                subscribeFunc(context.actions.setWebhookReconnectId(timeoutId))
            }
        );
        stompClient.reconnect_delay = 5000;
}

const webhookDisconnect = (state, dispatch, context) => {
    if (state.webhookConnection) {
        state.webhookConnection.disconnect()
        if (context) {
            dispatch(context.actions.disconnectWebhook())
        } else {
            dispatch(ZaloChatConversationContext.actions.disconnectWebhook())
        }
    }
}

const webhookSubscribe = (connection, storeId, subscribeFunc, context) => {
    connection.subscribe(`/messenger/store/${storeId}`, (messaging) => {
        /**
         * @type {ChatHistoryDTO}
         */
        let event = JSON.parse(messaging.body);
        // Receive msg from FB User
        if (event.mid) {
            console.log('wh event', event)
            if (context) { // gosocial
                subscribeFunc(context.actions.evtMsgFromSender(event))
            } else { // old zalo chat
                subscribeFunc(ZaloChatConversationContext.actions.evtMsgFromSender(event))
            }
        } else {

            if (context) { // gosocial
                subscribeFunc(context.actions.evtFromSender(event))
            }
        }
    });
}

const uploadAndSendImageToUser = (userId, file) => {
    return new Promise( (resolve, reject) => {
        ZaloChatService.uploadImage(file)
            .then(imageObj => {
                const attachment_id = imageObj.data.attachment_id
                ZaloChatService.sendImageToUser(userId, attachment_id)
                    .then(result => {
                        if (result.error) {
                            reject(result)
                        } else {
                            resolve()
                        }
                    })
                    .catch(reject)
            })
            .catch(reject)
    })
}

const uploadAndSendFileToUser = (userId, file) => {
    return new Promise( (resolve, reject) => {
        ZaloChatService.updateFile(file)
            .then(fileResponse => {
                const fileToken = fileResponse.data.token
                ZaloChatService.sendFileToUser(userId, fileToken)
                    .then(result => {
                        if (result.error) {
                            reject(result)
                        } else {
                            resolve()
                        }
                    })
                    .catch(reject)
            })
            .catch(reject)
    })
}

const sendImageToUser = (userId, attachmentId) => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getZaloPageAccessToken()

        ZALO.client.post('message', {
            "recipient": {
                "user_id": userId
            },
            "message": {
                "attachment": {
                    "payload": {
                        "elements": [
                            {
                                "media_type": "image",
                                "attachment_id": attachmentId
                            }
                        ],
                        "template_type": "media"
                    },
                    "type": "template"
                }
            }
        }, {
            params: {
                access_token: pageToken
            }
        })
            .then(result => {
                resolve(result.data)
            })
    })
}


const sendFileToUser = (userId, fileToken) => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getZaloPageAccessToken()

        ZALO.client.post('message', {
            "recipient": {
                "user_id": userId
            },
            "message": {
                "attachment": {
                    "payload": {
                        "token": fileToken
                    },
                    "type": "file"
                }
            }
        }, {
            params: {
                access_token: pageToken
            }
        })
            .then(result => {
                resolve(result.data)
            })
    })
}

const findIndexOfSenderInConversations = (conversations, senderId) => {
    if (conversations && senderId && conversations.length && conversations.length > 0) {
        return conversations.findIndex((value) => {
            if (value.senders && value.senders.data) {
                for (let sender of value.senders.data) {
                    if (sender.id === senderId) {
                        return value;
                    }
                }
            }
        });
    }
}

const searchConversationByUserName = (keyword) => {
    return new Promise( async (resolve, reject) => {
        const result = []
        for (let offset = 0; offset <= 80; offset+=10) {
            const res = await getListConversation(offset, 10)
            if (res.error) reject(res)
            if (res.data.length === 0) break;
            result.push(...res.data)
        }

        resolve(result.filter(c => {
            const dName = ZaloChatUtils.getClientInfoFromConversation(c).displayName
            return dName.toLowerCase().includes(keyword.toLowerCase())
        }))
    })
}

const uploadImage = (file) => {
    return new Promise( (resolve, reject) => {
        let dataForm = new FormData()
        dataForm.append('file', file)

        const pageToken = CredentialUtils.getZaloPageAccessToken()
        ZALO.client.post('upload/image', dataForm, {
            params: {
                access_token: pageToken
            }
        })
            .then(result => {
                resolve(result.data)
            })
    })
}

const updateFile = (file) => {
    return new Promise( (resolve, reject) => {
        let dataForm = new FormData()
        dataForm.append('file', file)

        const pageToken = CredentialUtils.getZaloPageAccessToken()
        ZALO.client.post('upload/file', dataForm, {
            params: {
                access_token: pageToken
            }
        })
            .then(result => {
                resolve(result.data)
            })
    })
}

const switchToIntervalMode = (dispatch) => {
    dispatch(ZaloChatConversationContext.actions.setFetchMode(FETCH_MODE.INTERVAL))
}
const switchToRealTimeMode = (dispatch) => {
    dispatch(ZaloChatConversationContext.actions.setFetchMode(FETCH_MODE.REALTIME))
}

/**
 * @typedef {{
 *     oa_id: Number,
 *     description: String,
 *     name: String,
 *     avatar: String,
 *     cover: String,
 *     is_verified: Boolean
 * }} ZaloOADetailModel
 *
 * Get OA detail
 * @return {Promise<ZaloOADetailModel>}
 */
const getOADetail = () => {
    return new Promise( (resolve, reject) => {
        const pageToken = CredentialUtils.getZaloPageAccessToken()

        ZALO.client.get(`getoa`, {
            params: {
                access_token: pageToken,
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


export const ZaloChatService = {
    getListConversation,
    getMessagesOfConversation,
    sendMessageToUser,
    sendImageToUser,
    sendFileToUser,
    uploadAndSendImageToUser,
    uploadAndSendFileToUser,
    webhookConnect,
    webhookSubscribe,
    getUserProfile,
    findIndexOfSenderInConversations,
    searchConversationByUserName,
    uploadImage,
    updateFile,
    webhookDisconnect,
    switchToIntervalMode,
    switchToRealTimeMode,
    getOADetail
}
