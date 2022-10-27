import React from "react";
import {ContextUtils} from "../../../../../utils/context";
import {FETCH_MODE} from "../../../conversation/context/LiveChatConversationContext";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
const initState = {
    currentConversation: null,
    secondsTick: false,
    evtMsgFromSender: null,
    isChangedCustomerProfile: false,
    webhookConnection: null,
    isAddNewCustomer: false,
    newMessage: null,
    fetchMode: FETCH_MODE.REALTIME,
    intervalFetchingTimeInSecond: 10,
    idleTimeoutInSecond: 10,
};
const context = React.createContext({})

const actions = {
    changeCurrentConversation: (conversation) => {
        return ContextUtils.createAction('CHANGE_CURRENT_CONVERSATION', conversation)
    },
    secondsTick: () => {
        return ContextUtils.createAction('SECONDS_TICK')
    },
    evtMsgFromSender: (message) => {
        return ContextUtils.createAction('EVT_MSG_FROM_SENDER', message)
    },
    changeCustomerProfileInfo: (isChangedCustomerProfile) => {
        return ContextUtils.createAction('CHANGE_CUSTOMER_PROFILE_INFO', isChangedCustomerProfile)
    },
    webhookConnection: (connection) => {
        return ContextUtils.createAction('WEBHOOK_CONNECTION', connection)
    },
    addNewCustomer: (isAddNewCustomer) => {

        return ContextUtils.createAction('ADD_NEW_CUSTOMER', isAddNewCustomer)
    },
    setNewMessage: (message) => {
        return ContextUtils.createAction('SET_NEW_MESSAGE', message)
    },
    disconnectWebhook: () => {
        return ContextUtils.createAction('DISCONNECT_WEBHOOK')
    },
    setFetchMode: (fetchMode) => ContextUtils.createAction('SET_FETCH_MODE', fetchMode)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_FETCH_MODE':
            return {
                ...state,
                fetchMode: action.payload
            }
        case 'DISCONNECT_WEBHOOK':
            return {
                ...state,
                webhookConnection: null
            }
        case 'SET_NEW_MESSAGE':
            return {
                ...state,
                newMessage: action.payload
            }
        case 'CHANGE_CURRENT_CONVERSATION':
            return {
                ...state,
                currentConversation: action.payload
            };
        case 'SECONDS_TICK':
            return {
                ...state,
                secondsTick: !state.secondsTick
            };
        case 'EVT_MSG_FROM_SENDER':
            return {
                ...state,
                evtMsgFromSender: action.payload
            };
        case 'CHANGE_CUSTOMER_PROFILE_INFO':
            return {
                ...state,
                isChangedCustomerProfile: action.payload
            };
        case 'WEBHOOK_CONNECTION':
            return {
                ...state,
                webhookConnection: action.payload
            };
        case 'ADD_NEW_CUSTOMER':
            return {
                ...state,
                isAddNewCustomer: action.payload
            }
        default:
            return state
    }
}

export const ZaloChatConversationContext = {
    context,
    provider: context.Provider,
    reducer,
    actions,
    initState
}
