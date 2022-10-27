/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './LiveChatChatList.sass'
import PropTypes from "prop-types";
import {LiveChatService} from "../../../../services/LiveChatService";
import moment from "moment";
import {DateTimeUtils} from "../../../../utils/date-time";
import {FETCH_MODE, LiveChatConversationContext} from "../context/LiveChatConversationContext";
import i18next from "i18next";
import ContentLoader from "react-content-loader";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import Emoji from 'react-emoji-render'
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {GSToast} from "../../../../utils/gs-toast";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {getAvatar} from "../chat-box/LiveChatChatBox";

// dai.beehive@yopmail.com
// 123456
const LiveChatChatList = props => {
    const {state, dispatch} = useContext(LiveChatConversationContext.context)
    const [stIsLoadMore, setStIsLoadMore] = useState(false);
    const refInputSearch = useRef(null);
    const [stIsSearch, setStIsSearch] = useState(false);
    const [stSearchResult, setStSearchResult] = useState([]);
    const fetchIntervalHandler = useRef(null);


    const [stConversationResponse, setStConversationResponse] = useState({
        data: [],
        paging: {}
    });

    useEffect(() => {
        if (state.fetchMode === FETCH_MODE.INTERVAL) {
                fetchIntervalHandler.current = setInterval(fetchListConversation, state.intervalFetchingTimeInSecond * 1000)
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

        LiveChatService.getListConversation()
            .then(result => {
                if (result.error) {
                    GSToast.error(result.error.message);
                } else {
                    setStConversationResponse(result);
                }
            })

    }, []);

    useEffect(() => {
        let curConversations = [...stConversationResponse.data];
        if (state.evtMsgFromSender && curConversations.length > 0) {
            // Try to obtain index of current sender in list
            let found = LiveChatService.findIndexOfSenderInConversations(curConversations, state.evtMsgFromSender.senderId);
            if (found > 0) {
                // Move the "second" and below found index of sender to top of list
                let move = curConversations.splice(found, 1)[0];
                move.updated_time = state.evtMsgFromSender.timestamp;
                curConversations.unshift(move);
                setStConversationResponse({...stConversationResponse, data: curConversations});
            }
            else if (found === 0) {
                let selected = curConversations[found];
                selected.updated_time = state.evtMsgFromSender.timestamp;
                setStConversationResponse({...stConversationResponse, data: curConversations});
            }
            else if (found === -1) {
                // New conversation, just reload list
                fetchListConversation()
            }
        }
    }, [state.evtMsgFromSender]);

    const fetchListConversation = () => {
        LiveChatService.getListConversation()
            .then(result => {
                setStConversationResponse(result)
            })
    }

    const onKeyDownSearch = (event) => {
        const keyword = event.currentTarget.value
        if (event.key === 'Enter') {
            if (keyword) {
                LiveChatService.searchConversationByUserName(keyword)
                    .then(result => {
                        setStSearchResult(result)
                        setStIsSearch(true)
                    })
            } else {
                closeSearchResult()
            }

        }
    }

    const closeSearchResult = () => {
        refInputSearch.current.value = ''
        setStIsSearch(false)
        setStSearchResult([])
    }

    const onScroll = (event) => {
        const obj = event.currentTarget
        // => scroll to bottom and is not fetching
        // console.log(obj.scrollTop)
        // console.log((obj.scrollHeight - obj.offsetHeight))
        if (!stIsLoadMore && (obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight))) {
            setStIsLoadMore(true)
            if (stConversationResponse.paging.next) { // => have page
                LiveChatService.getListConversation(stConversationResponse.paging.cursors.after)
                    .then(result => {
                        setStConversationResponse({
                            ...result,
                            data: [...stConversationResponse.data, ...result.data]
                        })
                        setStIsLoadMore(false)
                    })
            }
        }
    }


    const {className, ...other} = props
    return (
        <div className={["live-chat-chat-list", className].join(' ')} {...other}>
            <div className="live-chat-chat-list__search-bar">
                <input className="form-control"
                    placeholder={i18next.t("page.livechat.conversation.chatlist.searchByName")}
                       onKeyDown={onKeyDownSearch}
                       ref={refInputSearch}
                />
            </div>
            <div className="live-chat-chat-list__list-container gs-atm__scrollbar-1" onScroll={onScroll}>
                {!stIsSearch &&
                <>
                    {
                        stConversationResponse.data.map((conversation, index) => {
                            return (
                                <Conversation
                                    key={conversation.id}
                                    data={conversation}
                                />
                            )
                        })
                    }
                    {stIsLoadMore &&
                        <div className="live-chat-chat-list__load-more d-flex justify-content-center">
                            <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                        </div>
                    }
                </>}
                {stIsSearch &&
                    <>
                        {stSearchResult.map((conversation, index) => {
                            return (
                                <Conversation
                                    key={conversation.id}
                                    data={conversation}
                                    isSearchResult={true}
                                    onClick={closeSearchResult}
                                />
                            )
                        })}
                        {stSearchResult.length === 0 &&
                            <GSWidgetEmptyContent
                                iconSrc={'/assets/images/icom-empty-customerdetails.svg'}
                                text={i18next.t("common.noResultFound")}
                                className="live-chat-chat-list__search-empty"
                            />
                        }
                    </>
                }
            </div>
        </div>
    );
};


LiveChatChatList.propTypes = {
    className: PropTypes.string,
};

export default LiveChatChatList;


const Conversation = (props) => {
    const refShowConfirm = useRef(null);
    const [stAvatar, setStAvatar] = useState(null);
    const [stLocation, setStLocation] = useState(i18next.t('page.livechat.conversation.chatlist.unknow'));
    const {state, dispatch} = useContext(LiveChatConversationContext.context);
    const [stTicker, setStTicker] = useState(moment.now());

    const user = props.data.senders.data[0];
    useEffect(() => {
        LiveChatService.getUserPicture(user.id)
            .then(result => {
                setStAvatar(getAvatar(result))
            });
        const ticker = setInterval(() => {
            setStTicker(moment.now())
        }, 10000);
        return () => {
            clearInterval(ticker)
        }
    }, []);


    const setActiveConversation = () => {
        if (state.currentConversation && state.currentConversation.id === props.data.id) {
            return 'live-chat-chat-list__conversation--active'
        }
        return ''
    };

    const onClickConversation = () => {
        if (state.currentConversation && state.currentConversation.id === props.data.id) {
            // -> if it is current then ignore
            return
        }
        if (state.isChangedCustomerProfile) {
            refShowConfirm.current.openModal({
                messages: (<GSTrans t="page.livechat.customer.details.leave.without.save">
                    <strong>Do you want to proceed?</strong> All unsaved data will be lost.
                </GSTrans>),
                okCallback: () => {
                    dispatch(LiveChatConversationContext.actions.changeCustomerProfileInfo(false));
                    newConversation();
                }
            })
        } else if (state.isAddNewCustomer) {
            refShowConfirm.current.openModal({
                messages: (<GSTrans t="page.livechat.customer.details.add.leave.without.save">
                    Customer information are not saved. <strong>Do you want to leave without saving?</strong>
                </GSTrans>),
                okCallback: () => {
                    dispatch(LiveChatConversationContext.actions.addNewCustomer(false));
                    newConversation();
                }
            })
        } else {
            newConversation();
        }
    };

    const newConversation = () => {
        dispatch(LiveChatConversationContext.actions.changeCurrentConversation(props.data))
        if (props.onClick) {
            props.onClick()
        }
    };

    const handleTitleMessage = (message) => {
        // get first 2 word (split by space) 
        let returnMessage = '';
        const totalMessage = message.split(' ');

        if(totalMessage.length ===1){
            returnMessage = totalMessage[0];
        }if(totalMessage.length >= 2){
            returnMessage = totalMessage[0] + ' ' + totalMessage[1];
        }

        if(returnMessage.length > 15){
            returnMessage = returnMessage.substring(0, 15);
        }
        return returnMessage + '...';
    }

    const formatContent = (messageObject) => {

        return (
            <Emoji text={handleTitleMessage(messageObject)}/>
        )

        const messaging = JSON.parse(messageObject)
        return (
            <>
                {/*NORMAL TEXT*/}
                {messaging.text &&
                    <Emoji text={handleTitleMessage(messaging.text)}/>
                }
                {/*STICKER*/}
                {messaging.sticker &&
                    <img src={messaging.sticker} alt="sticker" className="ml-3 mr-3" style={{maxHeight: '20px'}}/>
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
                                             className="message-image"
                                             style={{maxHeight: '20px'}}
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
                                           style={{
                                            maxHeight: "20px",
                                            maxWidth: "100px"
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
                                           style={{
                                            border: '1px solid gray',
                                            borderRadius: '99999px',
                                            maxHeight: "20px",
                                            maxWidth: "100px"
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
                                        <div>
                                            <a href={attachment.payload.url} target="_blank" style={{
                                                color: 'inherit',
                                                textDecoration: 'underline'
                                            }}>
                                                {handleTitleMessage(nameFile[nameFile.length - 1])}
                                            </a>
                                        </div>
                                    
                                    </div>
                                )
                            }
                        })}
                    </div>
                }
            </>
        )
    }

    return (
        <>
        <ConfirmModal ref={refShowConfirm}/>
        <div className={["live-chat-chat-list__conversation", props.className, setActiveConversation()].join(' ')}
            onClick={onClickConversation}
        >
            {stAvatar &&
             <img src={stAvatar} alt="ava" className="conversation__avatar"/>
            }
            {!stAvatar &&
            <ContentLoader
                height={45}
                width={45}
                speed={1}
                primaryColor="#f3f3f3"
                secondaryColor="#ecebeb"
                style={{
                    width: '45px',
                    height: '45px'
                }}
            >
                <circle cx="22" cy="22" r="22" />
            </ContentLoader>
            }
            <div className="ml-2 d-flex flex-column justify-content-between conversation__info-wrapper">
                <span className="conversation__user-name"
                    style={{
                        width: props.isSearchResult? '200px': '100px',
                        paddingTop: props.isSearchResult? '.8rem': '0'
                    }}
                >{user.name}</span>
                
                {formatContent(props.data.snippet)}
                
            </div>
            {!props.isSearchResult &&
                <div className="d-flex flex-column justify-content-between align-items-end conversation__time-wrapper">
                    <span className="conversation__time"
                          key={stTicker}>
                        {DateTimeUtils.formatFromNow(props.data.updated_time)}
                    </span>
                    {props.data.unread_count > 0 &&
                        <span className="conversation__unread-count" hidden={true}>
                            {props.data.unread_count > 9? '9+':props.data.unread_count}
                        </span>
                    }
                    {!props.data.unread_count &&
                        <span> </span>
                    }
                </div>
            }
        </div>
        </>
    )
};

Conversation.propTypes = {
    className: PropTypes.string,
    isSearchResult: PropTypes.bool,
    data: PropTypes.shape({
        senders: PropTypes.shape({
            data: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                email: PropTypes.string,
                id: PropTypes.string,
            }),)
        }),
        snippet: PropTypes.string,
        unread_count: PropTypes.number,
        id: PropTypes.string,
        updated_time: PropTypes.string,
    }),
    onClick: PropTypes.func,
};
