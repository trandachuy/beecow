/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './LiveChatChatBox.sass'
import PropTypes from "prop-types";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {FETCH_MODE, LiveChatConversationContext} from "../context/LiveChatConversationContext";
import ContentLoader from "react-content-loader";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import {LiveChatService} from "../../../../services/LiveChatService";
import LiveChatChatBoxMessageBubble from "./bubble/LiveChatChatBoxMessageBubble";
import {CredentialUtils} from "../../../../utils/credential";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import LiveChatEmojiSelector from "./emoji/LiveChatEmojiSelector";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import {ImageUtils} from "../../../../utils/image";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {GSToast} from "../../../../utils/gs-toast";
import {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import _ from 'lodash'

export const getAvatar = (response) => {
    if (response.data && response.data.url) {
        return response.data.url
    }
    return "/assets/images/go-chat-default-avatar.png";
}


const LiveChatChatBox = props => {
    const refInputMessage = useRef(null);
    const refInputFile = useRef(null);
    const {state, dispatch}  = useContext(LiveChatConversationContext.context);
    const [isFetching, setIsFetching] = useState(true);
    const [stCustomerAvatar, setStAvatar] = useState('');
    const [stIsShowEmoji, setStIsShowEmoji] = useState(false);
    const [stLocation, setStLocation] = useState(i18next.t('page.livechat.conversation.chatlist.unknow'));
    const [stMessages, setStMessages] = useState({
        data: [],
        paging: {}
    });
    const [stLoadingMore, setStLoadingMore] = useState(false);
    const [stSendMessageProgress, setStSendMessageProgress] = useState('0');
    const [stSenders, setStSenders] = useState(null);
    const [stPageAvatar, setStPageAvatar] = useState(null);
    const [stFile, setStFile] = useState(null);
    const mainSenderId = CredentialUtils.getLiveChatPageId()
    const [stIsSending, setStIsSending] = useState(false);
    const fetchIntervalHandler = useRef(null);


    useEffect(() => {
        if (state.fetchMode === FETCH_MODE.INTERVAL) {
            fetchIntervalHandler.current = setInterval(fetchMessages, state.intervalFetchingTimeInSecond * 1000)
        } else {
            if (fetchIntervalHandler.current) {
                clearInterval(fetchIntervalHandler.current)
            }
        }
        return () => {
            if (fetchIntervalHandler.current) {
                clearInterval(fetchIntervalHandler.current)
            }
        };
    }, [state.fetchMode]);


    useEffect(() => {

        if (state.evtMsgFromSender && state.currentConversation && state.currentConversation.senders.data[0].psid === state.evtMsgFromSender.senderId) {
            appendNewMessage(state.evtMsgFromSender.messageObject, false)
        }

    }, [state.evtMsgFromSender]);

    useEffect(() => {
        LiveChatService.getPagePicture()
            .then(result => {
                setStPageAvatar(getAvatar(result))
            })
    }, [])

    useEffect(() => {
        setStLoadingMore(false)
        if (state.currentConversation) {
            setIsFetching(true)
            setStIsShowEmoji(false)
            refInputMessage.current.value = ''
            const sender = state.currentConversation.senders.data[0]
            setStSenders(state.currentConversation.senders.data)
            LiveChatService.getUserPicture(sender.id)
                .then(picture => {
                    setStAvatar(getAvatar(picture))
                    fetchMessages()
                })
        }
        return () => {

        };
    }, [state.currentConversation]);

    const fetchMessages = () => {
        if (state.currentConversation) {
            LiveChatService.getMessagesOfConversation(CredentialUtils.getLiveChatPageId(), state.currentConversation.id)
                .then(messagesObj => {
                    setStMessages(messagesObj)
                    setIsFetching(false)
                })
        }
    }

    const onClickLoadMore = () => {
        setStLoadingMore(true)
        LiveChatService.getMessagesOfConversation(CredentialUtils.getLiveChatPageId(), state.currentConversation.id, stMessages.paging.cursors.after)
            .then(messageObj => {
                setStMessages({
                    data: [...stMessages.data, ...messageObj.data],
                    paging: messageObj.paging
                })
                setStLoadingMore(false)
            })
    }

    const sendTextMessage = (message) => {
        if (message) {
            setStIsSending(true)
            setStIsShowEmoji(false)
            setStSendMessageProgress('50')
            // LiveChatService.sendMessageToUser(stSenders[0].id, 'text', message)
            //     .then(result => {
            //         if (result.error) {
            //             setStSendMessageProgress('100-failed')
            //         } else {
            //             refInputMessage.current.value = ''
            //             setStSendMessageProgress('75')
            //             appendNewMessage(result)
            //         }

            //         setTimeout(() => {
            //             setStIsSending(false)
            //             setStSendMessageProgress('0')
            //         }, 700)
            //     })

            LiveChatService.sendFBMessageCommon('text', message, stSenders[0].id, CredentialUtils.getLiveChatPageId()).then(result => {
                if (result.error) {
                    setStSendMessageProgress('100-failed')
                } else {
                    refInputMessage.current.value = ''
                    setStSendMessageProgress('75')
                    appendNewMessage(result)
                }

                setTimeout(() => {
                    setStIsSending(false)
                    setStSendMessageProgress('0')
                }, 700)
            })
        }
    }

    const appendNewMessage = (message, withLoading = true) => {
        // append at top of list
        setStMessages({
            ...stMessages,
            data: [message, ...stMessages.data]
        })
        if (withLoading) setStSendMessageProgress('100-done')

        // LiveChatService.getMessagesById(messageId)
        //     .then(message => {
        //         setStMessages({
        //             ...stMessages,
        //             data: [message, ...stMessages.data]
        //         })
        //         if (withLoading) setStSendMessageProgress('100-done')
        //     })
    }

    const sendFileMessage = (file) => {
        setStIsSending(true)
        const user = state.currentConversation.senders.data[0]
        setStSendMessageProgress('25')
        mediaService.uploadFileWithDomain(file, MediaServiceDomain.GENERAL)
            .then(imageObj => {
                const url = imageObj.urlPrefix + '/' + imageObj.id + '.jpg'
                setStSendMessageProgress('50')
                LiveChatService.sendFBMessageCommon('image', url, stSenders[0].id, CredentialUtils.getLiveChatPageId())
                    .then(result => {
                        if (result.error) {
                            setStSendMessageProgress('100-failed')
                        } else {
                            setStSendMessageProgress('75')
                            setStFile(null)
                            refInputFile.current.value = null
                            appendNewMessage(result)
                        }

                        setTimeout(() => {
                            setStIsSending(false)
                            setStSendMessageProgress('0')
                        }, 700)
                    })
            })
    }

    const onKeyDownInputMessage = (event) => {
        if (event.key === 'Enter') {
            const message = event.currentTarget.value
            sendTextMessage(message)
        }
    }

    const toggleEmoji = () => {
        setStIsShowEmoji(!stIsShowEmoji)
    }

    const onClickSend = () => {
        if (stFile) {
            sendFileMessage(stFile)
        } else { // => send Message
            const message = refInputMessage.current.value
            sendTextMessage(message)
        }

    }

    const onSelectEmoji = (emoji) => {
        refInputMessage.current.value = refInputMessage.current.value + emoji
    }


    const onChangeFile = (event) => {
        const file = event.currentTarget.files[0]
        if (file) {
            if ( [ImageUploadType.JPEG, ImageUploadType.PNG].includes(file.type)) { // => correct

            } else {
                GSToast.error(i18next.t("component.product.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }

            const sizeByByte = file.size
            if (sizeByByte / 1024 / 1024 <= 1) {
                setStFile(file)
            } else {
                GSToast.error(i18next.t("common.validation.editor.image.size", {x: 2}))
            }
        }
    }

    const splitMessages = (messageList) => {
        // some message from fb have both of message and attachments. So we split it to two messages
        const clonedList = _.cloneDeep(messageList)
        for (const [index, message] of clonedList.entries()) {
            if (message.message && message.attachments) {
                const attachmentMessage = _.cloneDeep(message)
                attachmentMessage.id = attachmentMessage.id + '_attachments'
                delete attachmentMessage.message
                delete message.attachments
                clonedList.splice(index, 0, attachmentMessage)  // => insert new object to index
            }
        }
        return clonedList;
    }


    const {className, ...other} = props
    return (
        <div className={["live-chat-chat-box", className ].join(' ')} {...other}>
            {!state.currentConversation &&
                <div className="live-chat-chat-box__blank-page">
                    <span className="live-chat-chat-box__title">
                        <GSTrans t={'page.livechat.conversation.chatbox.conversations'}/>
                    </span>
                    <span className="live-chat-chat-box__sub-title">
                        <GSTrans t={'page.livechat.conversation.chatbox.conversationHint'}/>
                    </span>
                    <div className="live-chat-chat-box__message-container--blank">
                        <div className="live-chat-chat-box__blank-mess-wrapper">
                            <div className="live-chat-chat-box__blank-avatar"/>
                            <div className="live-chat-chat-box__triangle-left"/>
                            <div className="live-chat-chat-box__blank-mess-left" style={{
                                width: '70%',
                                height: '80px'
                            }}/>
                        </div>

                        <div className="live-chat-chat-box__blank-mess-wrapper justify-content-end">
                            <div className="live-chat-chat-box__blank-mess-right" style={{
                                width: '35%',
                                height: '27px'
                            }}/>
                            <div className="live-chat-chat-box__triangle-right"/>
                            <div className="live-chat-chat-box__blank-avatar"/>
                        </div>

                        <div className="live-chat-chat-box__blank-mess-wrapper">
                            <div className="live-chat-chat-box__blank-avatar"/>
                            <div className="live-chat-chat-box__triangle-left"/>
                            <div className="live-chat-chat-box__blank-mess-left" style={{
                                width: '60%',
                                height: '27px'
                            }}/>
                        </div>

                        <div className="live-chat-chat-box__blank-mess-wrapper justify-content-end">
                            <div className="live-chat-chat-box__blank-mess-right" style={{
                                width: '45%',
                                height: '60px'
                            }}/>
                            <div className="live-chat-chat-box__triangle-right"/>
                            <div className="live-chat-chat-box__blank-avatar"/>
                        </div>
                    </div>

                </div>
            }
            {state.currentConversation && <>
                <div className="live-chat-chat-box__header">
                    <div className="live-chat-chat-box__user-profile">
                        {isFetching &&
                        <ContentLoader
                            height={45}
                            width={150}
                            speed={1}
                            primaryColor="#f3f3f3"
                            secondaryColor="#ecebeb"
                            style={{
                                width: '150px',
                                height: '45px'
                            }}
                        >
                            <rect x="552" y="-53" rx="10" ry="10" width="117" height="6" />
                            <circle cx="22" cy="22" r="22" />
                            <rect x="50" y="2" rx="5" ry="5" width="100" height="15" />
                            <rect x="50" y="30" rx="5" ry="5" width="80" height="12" />
                        </ContentLoader>}
                        {!isFetching &&
                            <div className="d-flex align-items-center">
                                <a>
                                    <img src={stCustomerAvatar} alt='avatar' className="live-chat-chat-box__user-picture"/>
                                </a>
                                <div className="d-flex flex-column justify-content-between ml-2" style={{height: '100%'}}>
                                    <b>{state.currentConversation.senders.data[0].name}</b>
                                    <span style={{color: '#6B6C6F', opacity: 0}}>{stLocation}</span>
                                </div>
                            </div>
                        }
                    </div>
                    <GSComponentTooltip message={i18next.t('page.livechat.conversation.chatbox.viewCustomerDetails')}
                                        placement={GSComponentTooltipPlacement.LEFT}>
                        <div className="live-chat-chat-box__btn live-chat-chat-box__btn-view-customer"
                            onClick={props.onToggleCustomerDetail}
                        >
                        </div>
                    </GSComponentTooltip>

                </div>
                <div className="live-chat-chat-box__body">
                    <div className={"live-chat-chat-box__emoji-wrapper " + (stIsShowEmoji? 'live-chat-chat-box__emoji-wrapper--open':'live-chat-chat-box__emoji-wrapper--close')}>
                        <LiveChatEmojiSelector
                            onSelect={onSelectEmoji}
                        />
                    </div>
                    {isFetching &&
                        <div className="d-flex align-items-center justify-content-center" style={{height: '100%'}}>
                            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                        </div>
                            }
                    {!isFetching &&
                    <div className="live-chat-chat-box__message-container gs-atm__scrollbar-1">

                        {splitMessages(stMessages.data).map((message, index) => {
                            return (
                                <LiveChatChatBoxMessageBubble
                                    data={message}
                                    key={message.id}
                                    customerAvatar={stCustomerAvatar}
                                    pageAvatar={stPageAvatar}
                                    mainSenderId={mainSenderId}
                                    nextMessage={stMessages.data[index-1]}
                                />
                            )
                        })}
                        {stMessages.paging.next &&
                            <>
                                {!stLoadingMore &&
                                    <div className="live-chat-chat-box__btn-load-more mt-3" onClick={onClickLoadMore}>
                                        <GSTrans t={'page.livechat.conversation.chatbox.loadMore'}/>
                                    </div>
                                }
                                {stLoadingMore &&
                                    <div className="d-flex justify-content-center live-chat-chat-box__loading mt-3">
                                        <Loading style={LoadingStyle.ELLIPSIS_GREY}
                                        />
                                    </div>
                                }
                            </>
                        }
                    </div>}

                </div>
                <div className="live-chat-chat-box__send-messages-loading-bar">
                    <div className={["live-chat-chat-box__send-messages-progress", 'live-chat-chat-box__send-messages-progress--' + stSendMessageProgress].join(' ')}>

                    </div>
                </div>
                <div className={["live-chat-chat-box__footer", isFetching || stIsSending? 'gs-atm--disable':''].join(' ')}>
                    <i className="live-chat-chat-box__btn live-chat-chat-box__btn-send-emoji mr-3"
                       onClick={toggleEmoji}
                    />
                    <div className="flex-grow-1 d-flex align-items-center">
                        {!stFile &&
                        <input placeholder={i18next.t('page.livechat.conversation.chatbox.typeAMessage')}
                               className="live-chat-chat-box__input-message"
                               maxLength="2000"
                               onKeyDown={onKeyDownInputMessage}
                               ref={refInputMessage}
                               onFocus={() => {
                                   if (stIsShowEmoji) {
                                       setStIsShowEmoji(false)
                                   }
                               }}
                        />}
                        {stFile && <GSActionButton icon={GSActionButtonIcons.CLOSE} width="1rem" onClick={() => {
                            setStFile(null)
                            refInputFile.current.value = null
                        }}/>}
                        {stFile &&
                        <div className="ml-3" style={{marginRight: 'auto'}}>
                            {ImageUtils.ellipsisFileName(stFile.name, 30)}
                        </div>
                        }
                    </div>
                    <div className="live-chat-chat-box__input-action-buttons d-flex align-items-center">
                        <input type="file"
                               ref={refInputFile}
                               accept="image/png, image/jpeg"
                               onChange={onChangeFile}
                        />
                        <i className="live-chat-chat-box__btn live-chat-chat-box__btn-send-image ml-3"
                            onClick={() => refInputFile.current.click()}
                        />
                        <i className="live-chat-chat-box__btn live-chat-chat-box__btn-send ml-3"
                           onClick={onClickSend}
                        />
                    </div>
                </div>
            </>}
        </div>
    );
};

LiveChatChatBox.propTypes = {
    className: PropTypes.string,
    onToggleCustomerDetail: PropTypes.func,
    onInteraction: PropTypes.func,
};

export default LiveChatChatBox;
