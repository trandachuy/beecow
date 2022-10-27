/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './ZaloChatChatList.sass'
import PropTypes from "prop-types";
import moment from "moment";
import {DateTimeUtils} from "../../../../../utils/date-time";
import {ZaloChatConversationContext} from "../context/ZaloChatConversationContext";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../../../../../components/shared/Loading/Loading";
import GSWidgetEmptyContent from "../../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import ConfirmModal from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {ZaloChatService} from "../../../../../services/ZaloChatService";
import {ZaloChatEnum} from "../../ZaloChatEnum";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ZaloChatUtils} from "../../ZaloChatUtils";
import zaloService from "../../../../../services/ZaloService";
import {RouteUtils} from "../../../../../utils/route";
import {NAV_PATH} from "../../../../../components/layout/navigation/Navigation";
import {withRouter} from "react-router-dom";
import _ from 'lodash'
import {FETCH_MODE} from "../../../conversation/context/LiveChatConversationContext";
import {NavigationPath} from "../../../../../config/NavigationPath";

// dai.beehive@yopmail.com
// 123456
const SIZE_PER_PAGE = 10
const INVALID_ACCESS_TOKEN = -216
const ZaloChatChatList = props => {
    const {state, dispatch} = useContext(ZaloChatConversationContext.context)
    const [stIsLoadMore, setStIsLoadMore] = useState(false);
    const refInputSearch = useRef(null);
    const [stIsSearch, setStIsSearch] = useState(false);
    const [stSearchResult, setStSearchResult] = useState([]);
    const [stCanloadMore, setStCanloadMore] = useState(false);
    const [stPage, setStPage] = useState(0);
    const fetchIntervalHandler = useRef(null);


    const [stConversationResponse, setStConversationResponse] = useState({
        data: []
    });

    useEffect(() => {
        if (state.fetchMode === FETCH_MODE.INTERVAL) {
            fetchIntervalHandler.current = setInterval(() => fetchConversationList(0, SIZE_PER_PAGE), state.intervalFetchingTimeInSecond * 1000)
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
        if (state.newMessage) {
            const newId = ZaloChatUtils.getClientIdFromConversation(state.newMessage)
            // update conversation
            const chatList = _.cloneDeep(stConversationResponse.data)
            let found = false
            for (const [index, c] of Object.entries(chatList)) {
                const id = ZaloChatUtils.getClientIdFromConversation(c)
                if (id !== newId) continue
                // remove old data
                chatList[index].message = undefined
                chatList[index].url = undefined
                chatList[index].thumb = undefined
                chatList[index].message_id = undefined

                // merge message
                chatList[index] = {
                    ...chatList[index],
                    ...state.newMessage
                }
            found = true
                break
            }

            if (found) { // previous user
                chatList.sort((a, b) => b.time - a.time)
                setStConversationResponse({
                    data: chatList
                })
            } else { // new user -> reload list
                // reset
                setStPage(0)
                setStCanloadMore(true)
                fetchConversationList(0, SIZE_PER_PAGE)
            }

        }
    }, [state.newMessage])

    useEffect(() => {
        fetchConversationList(0, SIZE_PER_PAGE)
    }, []);

    useEffect(() => {
        let curConversations = [...stConversationResponse.data];
        if (state.evtMsgFromSender && curConversations.length > 0) {
            // Try to obtain index of current sender in list
            let found = ZaloChatService.findIndexOfSenderInConversations(curConversations, state.evtMsgFromSender.senderId);
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
                ZaloChatService.getListConversation()
                    .then(result => {
                        setStConversationResponse(result)
                        handleTokenExpired(result)
                    })
            }
        }
    }, [state.evtMsgFromSender]);

    const handleTokenExpired = (response) => {
        if (response.error === INVALID_ACCESS_TOKEN) {
            zaloService.clearAccessToken()
                .then(result => {
                    RouteUtils.redirectWithoutReload(props, NavigationPath.liveChat.PATH_ZALO_CHAT_INTRO)
                })
        }
    }


    const fetchConversationList = (page, size) => {
        ZaloChatService.getListConversation(page * size,  size)
            .then(result => {
                if (result.error) {
                    handleTokenExpired(result)
                } else {
                    setStConversationResponse(result);
                    if (result.data.length === size) {
                        setStCanloadMore(true)
                    } else {
                        setStCanloadMore(false)
                    }
                }
            })
            .catch(e => {

            })
    }

    const onKeyDownSearch = (event) => {
        const keyword = event.currentTarget.value
        if (event.key === 'Enter') {
            if (keyword) {
                ZaloChatService.searchConversationByUserName(keyword)
                    .then(result => {
                        setStSearchResult(result)
                        setStIsSearch(true)
                    })
                    .catch(e => {
                        handleTokenExpired(e)
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
        if (!stIsLoadMore && (obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight)) && stCanloadMore) {
            setStIsLoadMore(true)
            ZaloChatService.getListConversation((stPage + 1) * SIZE_PER_PAGE, SIZE_PER_PAGE)
                .then(result => {
                    setStConversationResponse({
                        ...result,
                        data: [...stConversationResponse.data, ...result.data]
                    })
                    if (result.data.length === SIZE_PER_PAGE) {
                        setStCanloadMore(true)
                    } else {
                        setStCanloadMore(false)
                    }
                    setStIsLoadMore(false)
                    setStPage(page => page + 1)
                    handleTokenExpired(result)
                })
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
                                    key={ZaloChatUtils.getClientIdFromConversation(conversation) + '_' + conversation.time}
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


ZaloChatChatList.propTypes = {
    className: PropTypes.string,
};

export default withRouter(ZaloChatChatList);


const Conversation = (props) => {
    const refShowConfirm = useRef(null);
    const {state, dispatch} = useContext(ZaloChatConversationContext.context);
    const [stTicker, setStTicker] = useState(moment.now());

    const renderSnippet = () => {
        let snippet = null
        switch (props.data.type) {
            case ZaloChatEnum.MESSAGE_TYPE.TEXT:
                snippet = props.data.message
                break
            case ZaloChatEnum.MESSAGE_TYPE.PHOTO:
            case ZaloChatEnum.MESSAGE_TYPE.STICKER:
                snippet = `[${i18next.t(`page.gochat.zalochat.mType.${props.data.type}`)}]`
                break
        }

        if (snippet) {
            if (props.data.src === 0) {
                return (
                    <>
                        <span className="color-gray font-size-12px mr-1">
                            <FontAwesomeIcon icon='reply'/>
                        </span>
                        {snippet}
                    </>
                )
            }
            return snippet
        }
        return null
    }

    const setActiveConversation = () => {
        if (state.currentConversation &&
            ZaloChatUtils.getClientIdFromConversation(state.currentConversation) === ZaloChatUtils.getClientIdFromConversation(props.data)) {
            return 'live-chat-chat-list__conversation--active'
        }
        return ''
    };

    const onClickConversation = () => {
        if (state.currentConversation &&
            ZaloChatUtils.getClientIdFromConversation(state.currentConversation) === ZaloChatUtils.getClientIdFromConversation(props.data)) {
            // -> if it is current then ignore
            return
        }
        if (state.isChangedCustomerProfile) {
            refShowConfirm.current.openModal({
                messages: (<GSTrans t="page.livechat.customer.details.leave.without.save">
                    <strong>Do you want to proceed?</strong> All unsaved data will be lost.
                </GSTrans>),
                okCallback: () => {
                    dispatch(ZaloChatConversationContext.actions.changeCustomerProfileInfo(false));
                    newConversation();
                }
            })
        } else if (state.isAddNewCustomer) {
            refShowConfirm.current.openModal({
                messages: (<GSTrans t="page.livechat.customer.details.add.leave.without.save">
                    Customer information are not saved. <strong>Do you want to leave without saving?</strong>
                </GSTrans>),
                okCallback: () => {
                    dispatch(ZaloChatConversationContext.actions.addNewCustomer(false));
                    newConversation();
                }
            })
        } else {
            newConversation();
        }
    };

    const newConversation = () => {
        dispatch(ZaloChatConversationContext.actions.changeCurrentConversation(props.data))
        if (props.onClick) {
            props.onClick()
        }
    };

    const resolveProfile = () => {
        if (props.data.src === 1) { // from is customer
            return {
                avatar: props.data.from_avatar,
                displayName: props.data.from_display_name,
                id: props.data.from_id

            }
        } else { // src === 1 -> to is customer
            return {

                avatar: props.data.to_avatar,
                displayName: props.data.to_display_name,
                id: props.data.to_id
            }
        }
    }

    const {avatar, displayName, id} = resolveProfile()
    return (
        <>
            <ConfirmModal ref={refShowConfirm}/>
            <div className={["live-chat-chat-list__conversation", props.className, setActiveConversation()].join(' ')}
                 onClick={onClickConversation}
            >
                <img src={avatar} alt="ava" className="conversation__avatar"/>
                <div className="ml-2 d-flex flex-column justify-content-between conversation__info-wrapper">
                <span className="conversation__user-name"
                      style={{
                          width: props.isSearchResult? '200px': '100px',
                          paddingTop: props.isSearchResult? '.8rem': '0'
                      }}
                >
                    {displayName}
                </span>
                    {/*SNIPPET*/}
                    <span className="conversation__location">
                    {!props.isSearchResult && renderSnippet()}
                    </span>
                </div>
                {!props.isSearchResult &&
                <div className="d-flex flex-column justify-content-between align-items-end conversation__time-wrapper">
                    <span className="conversation__time"
                          key={stTicker}>
                        {DateTimeUtils.formatFromNow(props.data.time)}
                    </span>
                    {/*{props.data.unread_count > 0 &&*/}
                    {/*<span className="conversation__unread-count" hidden={true}>*/}
                    {/*        {props.data.unread_count > 9? '9+':props.data.unread_count}*/}
                    {/*    </span>*/}
                    {/*}*/}
                    {/*{!props.data.unread_count &&*/}
                    <span> </span>
                    {/*}*/}
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
        from_avatar: PropTypes.string,
        from_display_name: PropTypes.string,
        from_id: PropTypes.string,
        message: PropTypes.string,
        message_id: PropTypes.string,
        src: PropTypes.number,
        time: PropTypes.number,
        to_avatar: PropTypes.string,
        to_display_name: PropTypes.string,
        to_id: PropTypes.string,
        type: PropTypes.string
    }),
    onClick: PropTypes.func,
};
