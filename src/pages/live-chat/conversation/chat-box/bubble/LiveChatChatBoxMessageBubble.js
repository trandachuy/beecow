/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import './LiveChatChatBoxMessageBubble.sass'
import PropTypes from 'prop-types';
import {DateTimeUtils} from "../../../../../utils/date-time";
import moment from "moment";
import Emoji from 'react-emoji-render'

const LiveChatChatBoxMessageBubble = props => {

    const chat = props.data
    const messaging = JSON.parse(chat.messageObject);
    // const message = messaging.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, '<a href="$&">$&</a>')
    
    const formatContent = (position) => {
        return (
            <>
                {/*NORMAL TEXT*/}
                {messaging.text &&
                    <div className={"live-chat-chat-box-message-bubble__blank-mess-" + position}>
                        <Emoji text={messaging.text}/>
                    </div>
                }
                {/*STICKER*/}
                {messaging.sticker &&
                    <img src={messaging.sticker} alt="sticker" className="ml-3 mr-3" style={{maxHeight: '100px'}}/>
                }

                {/*IMAGE VIDEO FILES*/}
                {messaging.attachments &&
                    <div>
                        {messaging.attachments.map(attachment => {
                            //{/*IMAGE*/}
                            if (attachment.type === 'image') {
                                return (
                                    <a href={attachment.payload.url} target="_blank" key={attachment.payload.url}>
                                        <img src={attachment.payload.url}
                                             alt="sticker"
                                             className="ml-3 mr-3 message-image"
                                        />
                                    </a>

                                )
                            }

                            // VIDEO
                            if (attachment.type === 'video') {
                                return (
                                    <video src={attachment.payload.url}
                                           //width={attachment.video_data.width}
                                           controls
                                           className="ml-3 mr-3"
                                           style={{
                                               maxWidth: '400px'
                                           }}
                                    />
                                )
                            }

                            // AUDIO
                            if (attachment.type === 'audio') {
                                return (
                                    <audio src={attachment.payload.url}
                                           //width={attachment.video_data.width}
                                           controls
                                           className="ml-3 mr-3"
                                           style={{
                                            border: '1px solid gray',
                                            borderRadius: '99999px',
                                        }}
                                    />
                                )
                            }

                            // FILE
                            if (attachment.type === 'file') {
                                const nameFilePure = attachment.payload.url.split('?')[0];
                                const nameFile = nameFilePure.split('/');
                                return (
                                    <div className="d-flex align-items-end">
                                        {position === 'left' &&
                                        <div className="live-chat-chat-box-message-bubble__triangle-left"
                                                style={{
                                                    opacity: isShowAvatar()? '1':'0'
                                                }}
                                        />}
                                        <div className={"live-chat-chat-box-message-bubble__blank-mess-" + position}>
                                            <a href={attachment.payload.url} target="_blank" style={{
                                                color: 'inherit',
                                                textDecoration: 'underline'
                                            }}>
                                                {nameFile[nameFile.length - 1]}
                                            </a>
                                        </div>
                                        {position === 'right' &&
                                        <div className="live-chat-chat-box-message-bubble__triangle-right"
                                                style={{
                                                    opacity: isShowAvatar()? '1':'0'
                                                }}
                                        />}
                                    </div>
                                )
                                

                            }
                        })}
                    </div>
                }
            </>
        )
    }

    const isShowAvatar = () => {
        // if has no next message -> show
        if (!props.nextMessage) {
            return true
        }
        // if next message has a same from id and sent time < 60s -> hide
        if (chat.senderPage === props.nextMessage.senderPage) {
            // next created_time - current created_time
            const timeDiff = moment(props.nextMessage.messageTime).diff(chat.messageTime, 'seconds')
            if (timeDiff < 60) {
                return false
            }
        }
        return true
    }


    return (
        <div>
            {/*// message from customer*/}
            {props.mainSenderId !== chat.senderPage &&
                <div className={["live-chat-chat-box-message-bubble live-chat-chat-box-message-bubble--left"].join(' ')}>
                    <img alt="sender-ava"
                         src={props.customerAvatar}
                         className="live-chat-chat-box-message-bubble__avatar"
                         style={{
                             opacity: isShowAvatar()? '1':'0'
                         }}
                    />
                    {!messaging.text  &&
                    <div className="live-chat-chat-box-message-bubble__triangle-left"
                         style={{
                             opacity: isShowAvatar()? '1':'0'
                         }}
                    />}
                    {formatContent('left')}
                </div>
            }
            {/*// message from page*/}
            {props.mainSenderId === chat.senderPage &&
                <div  className={["live-chat-chat-box-message-bubble live-chat-chat-box-message-bubble--right"].join(' ')}>
                    {formatContent('right')}
                   {messaging.text &&
                   <div className="live-chat-chat-box-message-bubble__triangle-right"
                        style={{
                            opacity: isShowAvatar()? '1':'0'
                        }}
                   />}
                    {<img alt="sender-ava"
                          src={props.pageAvatar}
                          className="live-chat-chat-box-message-bubble__avatar"
                          style={{
                              opacity: isShowAvatar() && props.pageAvatar? '1':'0'
                          }}
                    />}
                </div>
            }
            {isShowAvatar() &&
            <div className={["live-chat-chat-box-message-bubble__time",
                isShowAvatar()? 'mb-3': 'mb-1',
                props.mainSenderId !== chat.senderPage? "live-chat-chat-box-message-bubble__time--left": "live-chat-chat-box-message-bubble__time--right"].join(' ')}>
                {DateTimeUtils.formatFromNow(chat.messageTime)}
            </div>}
        </div>
    );
};

LiveChatChatBoxMessageBubble.propTypes = {
    mainSenderId: PropTypes.string,
    customerAvatar: PropTypes.string,
    pageAvatar: PropTypes.string,
    nextMessage: PropTypes.any,
    data: PropTypes.shape({
        id: PropTypes.string,
        message: PropTypes.string,
        from: PropTypes.shape({
            name: PropTypes.string,
            id: PropTypes.string,
            email: PropTypes.string,
        }),
        created_time: PropTypes.string,
        sticker: PropTypes.string,
        attachments: PropTypes.shape({
            data: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string,
                mime_type: PropTypes.string,
                name: PropTypes.string,
                size: PropTypes.number,
                file_url: PropTypes.string,
                image_data: PropTypes.shape({
                    width: PropTypes.number,
                    height: PropTypes.number,
                    max_width: PropTypes.number,
                    max_height: PropTypes.number,
                    url: PropTypes.string,
                    preview_url: PropTypes.string,
                    image_type: PropTypes.number,
                    render_as_sticker: PropTypes.bool,
                }),
            }),),
        }),
    })
};

export default LiveChatChatBoxMessageBubble;
