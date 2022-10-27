/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useReducer, useState} from 'react';
import './ZaloChatConversation.sass'
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import {ZaloChatConversationContext} from "./context/ZaloChatConversationContext";
import ZaloChatChatList from "./chat-list/ZaloChatChatList";
// import ZaloChatChatBox from "./chat-box/ZaloChatChatBox";
// import ZaloChatCustomerDetails from "./customer-details/ZaloChatCustomerDetails";
import {CredentialUtils} from "../../../../utils/credential";
import ZaloChatChatBox from "./chat-box/ZaloChatChatBox";
import ZaloChatCustomerDetails from "./customer-details/ZaloChatCustomerDetails";
import {RouteUtils} from "../../../../utils/route";
import zaloService from "../../../../services/ZaloService";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {ZaloChatService} from "../../../../services/ZaloChatService";
import {useInputIdle} from "../../../../utils/hooks/useInputIdle";
import {FETCH_MODE} from "../../conversation/context/LiveChatConversationContext";


const ZaloChatConversation = props => {
    const [state, dispatch] = useReducer(ZaloChatConversationContext.reducer, ZaloChatConversationContext.initState);
    const [stIsFetchingPage, setStIsFetchingPage] = useState(true);
    const [stIsShowCustomerDetail, setStIsShowCustomerDetail] = useState(false);
    const isInputIdle = useInputIdle(state.idleTimeoutInSecond)

    // switch fetch mode
    useEffect(() => {
        if (isInputIdle) {
            ZaloChatService.webhookDisconnect(state, dispatch)
            ZaloChatService.switchToIntervalMode(dispatch)
        } else {
            ZaloChatService.webhookConnect(CredentialUtils.getStoreId(), dispatch)
            ZaloChatService.switchToRealTimeMode(dispatch)
        }
    }, [isInputIdle]);

    useEffect(() => {
        // check token from server
        zaloService.getStoreChatConfig()
            .then(store => {
                // check token
                const currentPageId = CredentialUtils.getZaloPageId()
                const currentPageToken = CredentialUtils.getZaloPageAccessToken()
                // if token is different with previous token -> set new pageId and pageToken
                if (store.oaId !== currentPageId || store.accessToken !== currentPageToken) {
                    CredentialUtils.setZaloPageId(store.oaId)
                    CredentialUtils.setZaloPageAccessToken(store.accessToken)
                }
        }).catch(e => {
            RouteUtils.linkTo(props, NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO)
        })

        setTimeout(() => {
            setStIsFetchingPage(false)
        }, 300)
        return () => {
            // clearInterval(ticker)
        }
    }, []);

    useEffect(() => {
        if (window.SockJS && window.Stomp && !state.webhookConnection && state.fetchMode === FETCH_MODE.REALTIME) {
            ZaloChatService.webhookConnect(CredentialUtils.getStoreId(), dispatch);
        }
        return () => {
            if (state.webhookConnection) {
                ZaloChatService.webhookDisconnect(state, dispatch)
            }
        };
    }, [state.webhookConnection, state.fetchMode]);

    const onToggleCustomerDetail = () => {
        setStIsShowCustomerDetail(!stIsShowCustomerDetail)
    }

    return (
        <ZaloChatConversationContext.provider value={{state, dispatch}}>
            <GSContentContainer className="live-chat-conversation" isLoading={stIsFetchingPage}>
                <GSContentBody size={GSContentBody.size.MAX} className="live-chat-conversation__body">
                    <ZaloChatChatList className="live-chat-conversation__chat-list"/>
                    <ZaloChatChatBox className="live-chat-conversation__chat-box"
                                     onToggleCustomerDetail={onToggleCustomerDetail}

                    />
                    <ZaloChatCustomerDetails className="live-chat-conversation__customer-details"
                                             history={props.history}
                                             isShow={stIsShowCustomerDetail}
                                             onToggleCustomerDetail={onToggleCustomerDetail}
                    />
                </GSContentBody>
            </GSContentContainer>
        </ZaloChatConversationContext.provider>

    );
};

ZaloChatConversation.propTypes = {

};

export default ZaloChatConversation;
