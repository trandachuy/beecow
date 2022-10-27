/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useReducer, useState} from 'react';
import './LiveChatConversation.sass'
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {FETCH_MODE, LiveChatConversationContext} from "./context/LiveChatConversationContext";
import LiveChatChatList from "./chat-list/LiveChatChatList";
import LiveChatChatBox from "./chat-box/LiveChatChatBox";
import LiveChatCustomerDetails from "./customer-details/LiveChatCustomerDetails";
import {CredentialUtils} from "../../../utils/credential";
import {LiveChatService} from "../../../services/LiveChatService";
import facebookService from "../../../services/FacebookService";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {useInputIdle} from "../../../utils/hooks/useInputIdle";


const LiveChatConversation = props => {
    const [state, dispatch] = useReducer(LiveChatConversationContext.reducer, LiveChatConversationContext.initState);
    const [stIsFetchingPage, setStIsFetchingPage] = useState(true);
    // const refWebhookConnection = useRef(null);
    const [stIsShowCustomerDetail, setStIsShowCustomerDetail] = useState(false);
    const isInputIdle = useInputIdle(state.idleTimeoutInSecond)

    // switch fetch mode
    useEffect(() => {
        if (isInputIdle) {
            LiveChatService.webhookDisconnect(state, dispatch)
            LiveChatService.switchToIntervalMode(dispatch)
        } else {
            LiveChatService.webhookConnect(CredentialUtils.getStoreId(), dispatch)
            LiveChatService.switchToRealTimeMode(dispatch)
        }
    }, [isInputIdle]);



    useEffect(() => {
        // check token from server
        facebookService.getRequestToUseChatOldVersion()
            .then(result => {
                // have request
                if(result.usingStatus === 'APPROVED'){
                    // check token
                    const currentPageId = CredentialUtils.getLiveChatPageId()
                    const currentPageToken = CredentialUtils.getLiveChatPageAccessToken()
                    // if token is different with previous token -> set new pageId and pageToken
                    if (result.pageId !== currentPageId || result['pageToken'] !== currentPageToken) {
                        CredentialUtils.setLiveChatPageId(result['pageId'])
                        CredentialUtils.setLiveChatPageAccessToken(result['pageToken'])
                        CredentialUtils.setLiveChatAppSecretProof(result['appSecretProof'])
                    }
                }else if(result.usingStatus === 'WAITING_FOR_APPROVE'){
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO)
                }

        }).catch(e => {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO)
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
            LiveChatService.webhookConnect(CredentialUtils.getStoreId(), dispatch);
        }
        return () => {
            if (state.webhookConnection) {
                LiveChatService.webhookDisconnect(state, dispatch)
            }
        };
    }, [state.webhookConnection, state.fetchMode]);


    const onToggleCustomerDetail = () => {
        setStIsShowCustomerDetail(!stIsShowCustomerDetail)
    }

    return (
        <LiveChatConversationContext.provider value={{state, dispatch}}>
            <GSContentContainer className="live-chat-conversation" isLoading={stIsFetchingPage}>
                <GSContentBody size={GSContentBody.size.MAX} className="live-chat-conversation__body">
                    <LiveChatChatList className="live-chat-conversation__chat-list"/>
                    <LiveChatChatBox className="live-chat-conversation__chat-box"
                                     onToggleCustomerDetail={onToggleCustomerDetail}

                    />
                    <LiveChatCustomerDetails className="live-chat-conversation__customer-details"
                                             history={props.history}
                                             isShow={stIsShowCustomerDetail}
                                             onToggleCustomerDetail={onToggleCustomerDetail}
                    />
                </GSContentBody>
            </GSContentContainer>
        </LiveChatConversationContext.provider>

    );
};

LiveChatConversation.propTypes = {

};

export default LiveChatConversation;
