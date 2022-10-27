

const getClientIdFromConversation = (profile) => {
    if (profile.src === 1) { // from is customer
        return profile.from_id
    } else { // src === 1 -> to is customer
        return profile.to_id
    }
}

const getClientNameFromConversation = (profile) => {
    if (profile.src === 1) { // from is customer
        return profile.from_display_name
    } else { // src === 1 -> to is customer
        return profile.to_display_name
    }
}

const getClientInfoFromConversation = (conversation) => {
    if (conversation.src === 1) {
        return {
            avatar: conversation.from_avatar,
            displayName: conversation.from_display_name,
            id: conversation.from_id
        }
    } else {

        return {
            avatar: conversation.to_avatar,
            displayName: conversation.to_display_name,
            id: conversation.to_id
        }
    }
}

const getClientAvatarFromConversation = (profile) => {
    if (profile.src === 1) { // from is customer
        return profile.from_avatar
    } else { // src === 1 -> to is customer
        return profile.to_avatar
    }
}

const getOAAvatarFromConversation = (conversation) => {
    if (conversation.src === 0) {
        return conversation.from_avatar
    } else {
        return conversation.to_avatar
    }
}

const getOAInfoFromConversation = (conversation) => {
    if (conversation.src === 0) {
        return {
            avatar: conversation.from_avatar,
            displayName: conversation.from_display_name,
            id: conversation.from_id
        }
    } else {

        return {
            avatar: conversation.to_avatar,
            displayName: conversation.to_display_name,
            id: conversation.to_id
        }
    }
}

/**
 * @param  {ChatHistoryDTO} evt
 * */
const evtMsgToMessage = (evt, postfix = {}) => {
    switch (evt.msgType) {
        case 'text':
            if (evt.isSellerSend) {
                return {
                    src: 0,
                    type: 'text',
                    message: evt.messageObject.text,
                    message_id: evt.mid,
                    time: evt.messageTime,
                    from_id: evt.recipientPage,
                    to_id: evt.senderPage,
                    ...postfix
                }
            } else {
                return {
                    src: 1,
                    type: 'text',
                    message: evt.messageObject.text,
                    message_id: evt.mid,
                    time: evt.messageTime,
                    from_id: evt.senderPage,
                    to_id: evt.recipientPage,
                    ...postfix
                }
            }
            break
        case 'sticker':
            if (evt.isSellerSend) {
                return {
                    src: 0,
                    type: 'sticker',
                    message_id: evt.messageObject.msg_id,
                    time: evt.messageTime,
                    thumb: evt.messageObject.attachments[0].payload.thumbnail,
                    url: evt.messageObject.attachments[0].payload.url,
                    from_id: evt.recipientPage,
                    to_id: evt.senderPage,
                    ...postfix
                }
            } else {
                return {
                    src: 1,
                    type: 'sticker',
                    message_id: evt.messageObject.msg_id,
                    time: evt.messageTime,
                    thumb: evt.messageObject.attachments[0].payload.thumbnail,
                    url: evt.messageObject.attachments[0].payload.url,
                    from_id: evt.senderPage,
                    to_id: evt.recipientPage,
                    ...postfix
                }
            }
            break
        case 'image':
            if (evt.isSellerSend) {
                return {
                    src: 0,
                    type: 'photo',
                    message_id: evt.messageObject.msg_id,
                    time: evt.messageTime,
                    thumb: evt.messageObject.attachments[0].payload.thumbnail,
                    url: evt.messageObject.attachments[0].payload.url,
                    from_id: evt.recipientPage,
                    to_id: evt.senderPage,
                    ...postfix
                }
            } else {
                return {
                    src: 1,
                    type: 'photo',
                    message_id: evt.messageObject.msg_id,
                    time: evt.messageTime,
                    thumb: evt.messageObject.attachments[0].payload.thumbnail,
                    url: evt.messageObject.attachments[0].payload.url,
                    from_id: evt.senderPage,
                    to_id: evt.recipientPage,
                    ...postfix
                }
            }
            break

    }
}

export const ZaloChatUtils = {
    getClientIdFromConversation,
    getClientAvatarFromConversation,
    getOAAvatarFromConversation,
    getOAInfoFromConversation,
    getClientInfoFromConversation,
    evtMsgToMessage,
    getClientNameFromConversation
}
