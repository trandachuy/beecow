/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 06/10/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext} from "react";
import {OrderInZaloContext} from "../context/OrderInZaloContext";
import i18n from "../../../../config/i18n";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSSocialTagStatus from "../../../../components/shared/GSSocialTag/GSSocialTagStatus";
import {DateTimeUtils} from "../../../../utils/date-time";
import PropTypes from "prop-types";



const ZaloChatListRow = (props) => {
    const { state, dispatch } = useContext(OrderInZaloContext.context)
    /**
     * @type {ChatHistoryRecentVM}
     */
    const conversation = props.conversation

    const resolveMessage = () => {
        const data = props.conversation
        let message = data.messageObject.text
        if (data.msgType !== 'text' && data.msgType) {
            message = i18n.t('component.zalo.chat.messageType.' + data.msgType.toUpperCase())
        }

        return message
    }

    if(props.stUpdateConversation.hasFilter
        && props.stUpdateConversation.filterConversation
        && props.stUpdateConversation.filterConversation.indexOf(conversation.userPage) === -1) {
        return null;
    }

    const isCurrent = !!(state.currentConversation && state.currentConversation.userPage === conversation.userPage)
    const hasUnRead = !!(conversation.oaUnread && conversation.oaUnread > 0)

    return (
        
        <div className={isCurrent? 'list-item-chat active':'list-item-chat'} onClick={() => props.onClickConversation(conversation)}>
            <div className='grid_chat p-2'>
                <div className='item_info'>
                    <div className='item_image'>
                        <img src={conversation.userAvatar} width="40" height="40"/>
                        {(hasUnRead && !isCurrent) &&
                            <p className='total-description'>
                                {conversation.oaUnread > 9 ? '9+' : conversation.oaUnread}
                            </p>
                        }
                    </div>
                    <div className='item_name'>
                        <p className='name' style={{
                            fontWeight: hasUnRead? 'bold':'normal'
                        }}>
                            {conversation.userDisplayName}
                        </p>
                        <p className='description' style={{
                            fontWeight: hasUnRead? 'bold':'normal'
                        }}>
                            {conversation.isSellerSend &&
                                <span className="color-gray font-size-12px mr-1">
                                    <FontAwesomeIcon icon='reply'/>
                                </span>
                            }
                            {resolveMessage()}
                        </p>
                        {props.tagStatus && props.tagStatus[conversation.userPage] && <div className="tag-status">
                            <GSSocialTagStatus status={props.tagStatus[conversation.userPage]} />
                        </div>}
                    </div>
                </div>
                <div className='item_date align-self-start'>
                    <span className="conversation__time" style={{
                        fontWeight: hasUnRead? 'bold':'normal'
                    }}>
                        {DateTimeUtils.formatTimeOrDay(conversation.messageTime)}
                    </span>
                </div>
            </div>
        </div>
    )
}

ZaloChatListRow.propTypes = {
    conversation: PropTypes.object,
    onClickConversation: PropTypes.func,
    tagStatus: PropTypes.any,
    stUpdateConversation: PropTypes.any,
}


export default ZaloChatListRow
