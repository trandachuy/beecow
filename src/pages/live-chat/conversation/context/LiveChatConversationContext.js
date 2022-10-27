import React from "react";
import {ContextUtils} from "../../../../utils/context";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

export const FETCH_MODE = {
    REALTIME: 'REALTIME',
    INTERVAL: 'INTERVAL'
}

const initState = {
    currentConversation: null,
    secondsTick: false,
    evtMsgFromSender: null,
    isChangedCustomerProfile: false,
    webhookConnection: null,
    isAddNewCustomer: false,
    idleStartTime: Date.now(),
    fetchMode: FETCH_MODE.REALTIME,
    intervalFetchingTimeInSecond: 60 * 5,
    idleTimeoutInSecond: 60 * 30,
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
    disconnectWebhook: () => {
        return ContextUtils.createAction('DISCONNECT_WEBHOOK')
    },
    addNewCustomer: (isAddNewCustomer) => {
        return ContextUtils.createAction('ADD_NEW_CUSTOMER', isAddNewCustomer)
    },
    setFetchMode: (fetchMode) => ContextUtils.createAction('SET_FETCH_MODE', fetchMode)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'DISCONNECT_WEBHOOK':
            return {
                ...state,
                webhookConnection: null
            }
        case 'CHANGE_CURRENT_CONVERSATION':
            return {
                ...state,
                currentConversation: action.payload
            };
        case 'SECONDS_TICK':
            return {
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
        case 'SET_FETCH_MODE':
            return {
                ...state,
                fetchMode: action.payload
            }
    }
}

export const LiveChatConversationContext = {
    context,
    provider: context.Provider,
    reducer,
    actions,
    initState
}
