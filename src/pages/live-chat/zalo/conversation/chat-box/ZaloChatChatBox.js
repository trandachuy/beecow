/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './ZaloChatChatBox.sass'
import PropTypes from "prop-types";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {ZaloChatConversationContext} from "../context/ZaloChatConversationContext";
import ContentLoader from "react-content-loader";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import ZaloChatBoxMessageBubble from "./bubble/ZaloChatBoxMessageBubble";
import Loading, {LoadingStyle} from "../../../../../components/shared/Loading/Loading";
// import LiveChatEmojiSelector from "./emoji/LiveChatEmojiSelector";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import {ImageUtils} from "../../../../../utils/image";
import {GSToast} from "../../../../../utils/gs-toast";
import {ImageUploadType} from "../../../../../components/shared/form/ImageUploader/ImageUploader";
import _ from 'lodash'
import {ZaloChatService} from "../../../../../services/ZaloChatService";
import {ZaloChatUtils} from "../../ZaloChatUtils";
import {ZaloChatEnum} from "../../ZaloChatEnum";
import LiveChatEmojiSelector from "../../../conversation/chat-box/emoji/LiveChatEmojiSelector";
import {FETCH_MODE} from "../../../conversation/context/LiveChatConversationContext";

const SIZE_PER_PAGE = 10
const ZaloChatChatBox = props => {
    const refInputMessage = useRef(null);
    const refInputFile = useRef(null);
    const refMessageContainer = useRef(null);
    const {state, dispatch}  = useContext(ZaloChatConversationContext.context);
    const [isFetching, setIsFetching] = useState(true);
    const [stCustomerAvatar, setStAvatar] = useState('');
    const [stIsShowEmoji, setStIsShowEmoji] = useState(false);
    const [stLocation, setStLocation] = useState(i18next.t('page.livechat.conversation.chatlist.unknow'));
    const [stMessages, setStMessages] = useState({
        data: [],
    });
    const [stLoadingMore, setStLoadingMore] = useState(false);
    const [stSendMessageProgress, setStSendMessageProgress] = useState('0');
    const [stSenders, setStSenders] = useState(null);
    const [stPageAvatar, setStPageAvatar] = useState(null);
    const [stFile, setStFile] = useState(null);
    const [stIsSending, setStIsSending] = useState(false);
    const [stCanLoadMore, setStCanLoadMore] = useState(false);
    const [stPage, setStPage] = useState(0);
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
        /**
         * @type {ChatHistoryDTO}
         */
        const evt = state.evtMsgFromSender

        // if (state.evtMsgFromSender && state.currentConversation.senders.data[0].id === state.evtMsgFromSender.senderId) {
        //     appendNewMessage(state.evtMsgFromSender.messageId, false)
        // }
        if (evt) {
            if (state.currentConversation) { // -> opening chat box
                const clientInfo = ZaloChatUtils.getClientInfoFromConversation(state.currentConversation)
                const oaInfo = ZaloChatUtils.getOAInfoFromConversation(state.currentConversation)
                if (evt.userPage === clientInfo.id) { // -> current user send to OA
                    const evtInfo = ZaloChatUtils.evtMsgToMessage(evt, {
                        from_display_name: clientInfo.displayName,
                        from_id: clientInfo.id,
                        from_avatar: clientInfo.avatar,
                        to_id: oaInfo.id,
                        to_display_name: oaInfo.displayName,
                        to_avatar: oaInfo.avatar})
                    appendNewMessageWithFullContent(evtInfo, false)
                } else {
                    if (evt.sender.id === oaInfo.id && evt.recipient.id === clientInfo.id) {  // -> OA send to current user
                        const evtInfo = ZaloChatUtils.evtMsgToMessage(evt, {
                            from_display_name: oaInfo.displayName,
                            from_avatar: oaInfo.avatar,
                            to_display_name: clientInfo.displayName,
                            to_avatar: clientInfo.avatar})
                        appendNewMessageWithFullContent(evtInfo, false)
                    } else {    // -> another user
                        const msg = ZaloChatUtils.evtMsgToMessage(evt)
                        dispatch(ZaloChatConversationContext.actions.setNewMessage(msg, {
                            from_id: evt.recipient
                        }))
                    }

                }
            } else { //
                const msg = ZaloChatUtils.evtMsgToMessage(evt)
                dispatch(ZaloChatConversationContext.actions.setNewMessage(msg))
            }


        }

    }, [state.evtMsgFromSender]);

    // useEffect(() => {
    //     // => scroll to bottom
    //     if (state.currentConversation) {
    //         refMessageContainer.current.scrollIntoView({ behavior: 'smooth' })
    //     }
    // }, [state.newMessage])

    useEffect(() => {
        setStLoadingMore(false)
        if (state.currentConversation) {
            setIsFetching(true)
            setStIsShowEmoji(false)
            refInputMessage.current.value = ''
            setStAvatar(ZaloChatUtils.getClientAvatarFromConversation(state.currentConversation))
            const oaAvatar = ZaloChatUtils.getOAAvatarFromConversation(state.currentConversation)
            setStPageAvatar(oaAvatar)

            // reset page
            setStPage(0)

            fetchMessages()
        }
        return () => {

        };
    }, [state.currentConversation]);

    const messagesFilter = (messages) => {
        return messages.filter(m => {
            return Object.values(ZaloChatEnum.MESSAGE_TYPE).includes(m.type)
        })
    }

    const fetchMessages = () => {
        const clientId = ZaloChatUtils.getClientIdFromConversation(state.currentConversation)
        ZaloChatService.getMessagesOfConversation(clientId, 0 , SIZE_PER_PAGE)
            .then(messagesObj => {
                messagesObj.data = messagesFilter(messagesObj.data)
                setStMessages(messagesObj)
                setIsFetching(false)
                setStCanLoadMore(messagesObj.data.length === SIZE_PER_PAGE)
            })
    }

    const onClickLoadMore = () => {
        setStLoadingMore(true)
        const clientId = ZaloChatUtils.getClientIdFromConversation(state.currentConversation)
        ZaloChatService.getMessagesOfConversation(clientId, (stPage + 1) * SIZE_PER_PAGE, SIZE_PER_PAGE)
            .then(messageObj => {
                setStMessages(messages => ({
                    data: [...messages.data, ...messageObj.data]
                }))
                setStCanLoadMore(messageObj.data.length === SIZE_PER_PAGE)
                setStLoadingMore(false)
                setStPage(page => page + 1)
            })
    }

    const sendTextMessage = (message) => {
        if (message) {
            setStIsSending(true)
            setStIsShowEmoji(false)
            setStSendMessageProgress('50')
            const clientId = ZaloChatUtils.getClientIdFromConversation(state.currentConversation)
            ZaloChatService.sendMessageToUser(clientId, 'text', message)
                .then(result => {
                    if (result.error) {
                        setStSendMessageProgress('100-failed')
                        switch (result.error) {
                            case -20109:
                                GSToast.error('page.gochat.zalochat.error.20109', true)
                        }
                    } else {
                        refInputMessage.current.value = ''
                        setStSendMessageProgress('75')
                        // appendNewMessage(result.data['message_id'])
                        setStSendMessageProgress('100-done')
                    }
                    setTimeout(() => {
                        setStIsSending(false)
                        setStSendMessageProgress('0')
                    }, 700)
                })
        }
    }

    const appendNewMessageWithFullContent = (msg) => {
        dispatch(ZaloChatConversationContext.actions.setNewMessage(msg))
        setStMessages({
            ...stMessages,
            data: [msg, ...stMessages.data]
        })
    }

    const appendNewMessage = (messageId, withLoading = true) => {
        // append at top of list
        const clientId = ZaloChatUtils.getClientIdFromConversation(state.currentConversation)

        ZaloChatService.getMessagesOfConversation(clientId, 0, 10)
            .then(messages => {
                const newMessages = messages.data.find(m => m.message_id === messageId)
                if ( newMessages) {
                    setStMessages({
                        ...stMessages,
                        data: [newMessages, ...stMessages.data]
                    })
                    dispatch(ZaloChatConversationContext.actions.setNewMessage(newMessages))
                    if (withLoading) setStSendMessageProgress('100-done')
                }
            })


    }

    const sendFileMessage = (file) => {
        const clientId = ZaloChatUtils.getClientIdFromConversation(state.currentConversation)
        setStIsSending(true)
        setStSendMessageProgress('25')
        ZaloChatService.uploadImage(file)
            .then(imageObj => {
                const attachment_id = imageObj.data.attachment_id
                ZaloChatService.sendImageToUser(clientId, attachment_id)
                    .then(result => {
                        if (result.error) {
                            setStSendMessageProgress('100-failed')
                            switch (result.error) {
                                case -20109:
                                    GSToast.error('page.gochat.zalochat.error.20109', true)
                            }
                        } else {
                            setStSendMessageProgress('75')
                            setStFile(null)
                            refInputFile.current.value = null
                            setStSendMessageProgress('100-done')

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
                                    <b>{ZaloChatUtils.getClientInfoFromConversation(state.currentConversation).displayName}</b>
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
                    <div className="live-chat-chat-box__message-container gs-atm__scrollbar-1" ref={refMessageContainer}>

                        {stMessages.data.map((message, index) => {
                            return (
                                <ZaloChatBoxMessageBubble
                                    data={message}
                                    key={message.message_id + '_'+ message.time}
                                    nextMessage={stMessages.data[index-1]}
                                />
                            )
                        })
                        }
                        {stCanLoadMore &&
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

ZaloChatChatBox.propTypes = {
    className: PropTypes.string,
    onToggleCustomerDetail: PropTypes.func,
};

export default ZaloChatChatBox;
