/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import './ZaloChatBoxMessageBubble.sass'
import PropTypes from 'prop-types';
import {DateTimeUtils} from "../../../../../../utils/date-time";
import moment from "moment";
import Emoji from 'react-emoji-render'
import {ZaloChatUtils} from "../../../ZaloChatUtils";
import {ZaloChatEnum} from "../../../ZaloChatEnum";

const ZaloChatBoxMessageBubble = props => {

    const isFromClient = () => {
        return props.data.src === 1
    }

    const isFromOA = () => {
        return props.data.src === 0
    }

    const resolveStickerUrl = () => {
        return props.data.url.replace('https://api.zalo.me/', 'https://api.zaloapp.com/')
    }

    const isShowTriangle = () => {
        switch (props.data.type) {
            case ZaloChatEnum.MESSAGE_TYPE.TEXT:
                return true
            default:
                return false
        }
    }



    // const message = props.data.message.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, '<a href="$&">$&</a>')
    const formatContent = (position) => {
        return (
            <>
                {/*NORMAL TEXT*/}
                {props.data.type === ZaloChatEnum.MESSAGE_TYPE.TEXT &&
                    <div className={"live-chat-chat-box-message-bubble__blank-mess-" + position}>
                        <Emoji text={props.data.message}/>
                    </div>
                }
                {/*STICKER*/}
                {props.data.type === ZaloChatEnum.MESSAGE_TYPE.STICKER &&
                    <img src={resolveStickerUrl()} alt="sticker" className="ml-3 mr-3" style={{maxHeight: '100px'}}/>
                }

                {/*LINK*/}
                {props.data.type === ZaloChatEnum.MESSAGE_TYPE.LINK && props.data.links.map(linkObj => {
                    try {
                        const description = JSON.parse(linkObj.description)
                        if (description.phone) {
                            return (
                                <a href={linkObj.url +'/'+ description.phone} rel="noreferrer noopener" target="_blank" className={"live-chat-chat-box-message-bubble__link live-chat-chat-box-message-bubble__blank-mess-" + position}>
                                    <img src={linkObj.thumb}/>
                                    <b className="d-block">{linkObj.title}</b>
                                    <span>{description.phone}</span>
                                </a>
                            )
                        }
                    } catch (e) { // => external link
                        return (
                            <a href={linkObj.url} rel="noreferrer noopener" target="_blank" className={"live-chat-chat-box-message-bubble__link live-chat-chat-box-message-bubble__blank-mess-" + position}>
                                <img src={linkObj.thumb}/>
                                <p>{linkObj.title}</p>
                            </a>
                        )
                    }


                })
                }

                {/*PHOTO*/}
                {props.data.type === ZaloChatEnum.MESSAGE_TYPE.PHOTO &&
                    <a href={props.data.url} target="_blank">
                        <img src={props.data.thumb}
                             alt="sticker"
                             className="ml-3 mr-3 message-image"
                        />
                    </a>
                }


            </>
        )
    }

    const isShowAvatar = () => {
        // if has no next message -> show
        if (!props.nextMessage) {
            return true
        }
        // if next message has a same src and sent time < 60s -> hide
        if (props.data.src === props.nextMessage.src) {
            // next created_time - current created_time
            const timeDiff = moment(props.nextMessage.time).diff(props.data.time, 'seconds')
            if (timeDiff < 60) {
                return false
            }
        }
        return true
    }

    const clientInfo = ZaloChatUtils.getClientInfoFromConversation(props.data)
    const oaInfo = ZaloChatUtils.getOAInfoFromConversation(props.data)
    return (
        <div>
            {/*// message from client*/}
            {props.data.src === 1 &&
                <div className={["live-chat-chat-box-message-bubble live-chat-chat-box-message-bubble--left"].join(' ')}>
                    <img alt="sender-ava"
                         src={clientInfo.avatar}
                         className="live-chat-chat-box-message-bubble__avatar"
                         style={{
                             opacity: isShowAvatar()? '1':'0'
                         }}
                    />
                    {isShowTriangle() &&
                        <div className="live-chat-chat-box-message-bubble__triangle-left"
                              style={{
                                  opacity: isShowAvatar() ? '1' : '0'
                              }}
                        />
                    }
                    {formatContent('left')}
                </div>
            }
            {/*// message from oa*/}
            {props.data.src === 0 &&
                <div  className={["live-chat-chat-box-message-bubble live-chat-chat-box-message-bubble--right"].join(' ')}>
                    {formatContent('right')}
                    {isShowTriangle() &&
                        <div className="live-chat-chat-box-message-bubble__triangle-right"
                              style={{
                                  opacity: isShowAvatar() ? '1' : '0'
                              }}
                        />
                    }
                    {<img alt="sender-ava"
                          src={oaInfo.avatar}
                          className="live-chat-chat-box-message-bubble__avatar"
                          style={{
                              opacity: isShowAvatar() && oaInfo.avatar? '1':'0'
                          }}
                    />}
                </div>
            }
            {isShowAvatar() &&
            <div className={["live-chat-chat-box-message-bubble__time",
                isShowAvatar()? 'mb-3': 'mb-1',
                isFromClient() ? "live-chat-chat-box-message-bubble__time--left": "live-chat-chat-box-message-bubble__time--right"].join(' ')}>
                {DateTimeUtils.formatFromNow(props.data.time)}
            </div>}
        </div>
    );
};

ZaloChatBoxMessageBubble.propTypes = {
    mainSenderId: PropTypes.string,
    customerAvatar: PropTypes.string,
    pageAvatar: PropTypes.string,
    nextMessage: PropTypes.any,
    data: PropTypes.shape({
        msg_id: PropTypes.string,
        src: PropTypes.number,
        time: PropTypes.number,
        type: PropTypes.string,
        message: PropTypes.string,
        links: PropTypes.arrayOf(PropTypes.shape({
            description: PropTypes.string,
            thumb: PropTypes.string,
            title: PropTypes.string,
            url: PropTypes.string,
        }).isRequired,),
        thumb: PropTypes.string,
        url: PropTypes.string,
        description: PropTypes.string,
        from_id: PropTypes.string,
        to_id: PropTypes.string,
        from_display_name: PropTypes.string,
        from_avatar: PropTypes.string,
        to_display_name: PropTypes.string,
        to_avatar: PropTypes.string,
        location: PropTypes.string
    })
};

export default ZaloChatBoxMessageBubble;
