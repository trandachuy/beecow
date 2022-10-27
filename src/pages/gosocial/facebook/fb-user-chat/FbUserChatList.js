import React, {useContext, useEffect, useRef, useState} from 'react'
import './FbUserChatList.sass'
import PropTypes from 'prop-types'
import {LiveChatService} from '../../../../services/LiveChatService'
import facebookService from '../../../../services/FacebookService'
import {DateTimeUtils} from '../../../../utils/date-time'
import {FbMessengerContext, FETCH_MODE_TYPE} from '../context/FbMessengerContext'
import i18next from 'i18next'
import Loading, {LoadingStyle} from '../../../../components/shared/Loading/Loading'
import Emoji from 'react-emoji-render'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import {UikInput} from '../../../../@uik'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import FilterStaff from '../filter-staff/FilterStaff'
import {Trans} from 'react-i18next'
import beehiveService from '../../../../services/BeehiveService'
import GSSocialTagStatus from '../../../../components/shared/GSSocialTag/GSSocialTagStatus'
import _ from 'lodash'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import ThemeEngineUtils from '../../../theme/theme-making/ThemeEngineUtils'

const FbUserChatList = props => {
    const { state, dispatch } = useContext(FbMessengerContext.context)

    const [stIsLoadMore, setStIsLoadMore] = useState(false)
    const [stIsSearch, setStIsSearch] = useState(false)
    const [stAssignedStaff, setStAssignedStaff] = useState(props.assignedStaff)
    const [stAssignedTags, setStAssignedTags] = useState(props.assignedTags)
    const [stTagStatus, setStTagStatus] = useState({})
    const [getSearchUserListCondition, setSearchUserListCondition] = useState({
        pageId: undefined,
        keyword: undefined,
        limit: 20,
        after: undefined,
        staffAssigned: [],
        tagIds: [],
        action: 'search'
    })
    const [stConversationResponse, setStConversationResponse] = useState({
        data: [],
        after: null
    })
    const [stExpireConversations, setStExpireConversations] = useState([])

    const refInputSearch = useRef(null)
    const fetchIntervalHandler = useRef(null)

    useEffect(() => {
        if (state.fetchMode === FETCH_MODE_TYPE.INTERVAL) {
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
        }
    }, [state.fetchMode])

    useEffect(() => {
        loadAllSocialTagStatus()
    }, [])

    useEffect(() => {
        setStAssignedStaff(props.assignedStaff)
        setStAssignedTags(props.assignedTags)
    }, [props.assignedStaff, props.assignedTags])

    useEffect(() => {
        // seller change page -> reset all keyword search
        const pageId = state.fbUserDetail?.pageId

        if (!pageId) {
            return
        }

        setSearchUserListCondition(current => ({
            ...current,
            pageId: pageId,
            keyword: undefined,
            after: undefined,
            action: 'search'
        }))
    }, [state.fbUserDetail.pageId])

    useEffect(() => {
        if (!getSearchUserListCondition.pageId && !getSearchUserListCondition.keyword && !getSearchUserListCondition.after && !getSearchUserListCondition.staffAssigned.length && !getSearchUserListCondition.tagIds.length) {
            return
        }

        fetchListConversation()
    }, [getSearchUserListCondition.pageId, getSearchUserListCondition.keyword, getSearchUserListCondition.after, getSearchUserListCondition.staffAssigned, getSearchUserListCondition.tagIds])

    useEffect(() => {
        if (!stConversationResponse.data.length) {
            return
        }

        calculateUnreadConversationNumber(stConversationResponse.data)

        const fbConversationIds = stConversationResponse.data.map(res => res.fbConversationId)
        const expireConversationIds = stExpireConversations.map(c => c.fbConversationId)
        const loadMoreFbConversationIds = _.differenceBy(fbConversationIds, expireConversationIds)

        if (!loadMoreFbConversationIds.length) {
            return
        }

        facebookService.checkExpiredMessages(state.fbUserDetail.pageId, loadMoreFbConversationIds)
            .then(expireMessages => {
                if (!expireMessages.length) {
                    return
                }

                const expiredConversations = stConversationResponse.data.map(res => expireMessages.find(m => m.fbConversationId === res.fbConversationId) || stExpireConversations.find(m => m.fbConversationId === res.fbConversationId))

                setStExpireConversations(expiredConversations)
            })
    }, [stConversationResponse.data])


    useEffect(() => {

        let curConversations = _.cloneDeep([...stConversationResponse.data])
        if (state.evtMsgFromSender && curConversations.length > 0) {
            // Try to obtain index of current sender in list
            let found = curConversations.findIndex(conversation => conversation.gsConversationId === state.evtMsgFromSender.messageObject.conversationId)

            // check if seller is reading the message in this current conversation
            let isReading = false

            if (state.currentConversation && state.currentConversation.gsConversationId) {
                isReading = (state.currentConversation.gsConversationId === state.evtMsgFromSender.messageObject.conversationId) ? true : false
            }

            if (found > 0) {
                // Move the "second" and below found index of sender to top of list
                let move = curConversations.splice(found, 1)[0]

                if (isReading) {
                    // if seller is reading this conversation
                    move.unread_count = 0
                } else {
                    // recalculate the unread message
                    move.unread_count += 1
                }

                move.updated_time = state.evtMsgFromSender.timestamp
                move.snippet = state.evtMsgFromSender.messageObject

                curConversations.unshift(move)
                setStConversationResponse(current => ({
                    ...current,
                    data: curConversations
                }))

                if (isReading) {
                    LiveChatService.markReadAConversation(state.currentConversation.fbConversationId, 1)
                }

            } else if (found === 0) {
                // if it is the first position -> don't move
                let selected = curConversations[found]

                if (isReading) {
                    // if seller is reading this conversation
                    selected.unread_count = 0
                } else {
                    // recalculate the unread message
                    selected.unread_count += 1
                }

                selected.updated_time = state.evtMsgFromSender.timestamp
                selected.snippet = state.evtMsgFromSender.messageObject
                setStConversationResponse(current => ({
                    ...current,
                    data: curConversations
                }))

                if (isReading) {
                    LiveChatService.markReadAConversation(state.currentConversation.fbConversationId, 1)
                }

            } else if (found === -1) {
                LiveChatService.getConversationDetail(
                    state.fbUserDetail.pageId,
                    state.evtMsgFromSender.messageObject.conversationId)
                    .then(res => {
                        setStConversationResponse(current => {
                            current.data.unshift(res)

                            return {
                                ...current,
                                data: current.data
                            }
                        })
                    }).catch(error => {
                    // do nothing
                })
            }
        }else if(state.evtMsgFromSender){
            // in case the first conversation
            setStIsSearch(true)
            LiveChatService.getListConversationForNew(
                getSearchUserListCondition.after,
                getSearchUserListCondition.keyword,
                getSearchUserListCondition.pageId,
                getSearchUserListCondition.limit,
                getSearchUserListCondition.staffAssigned,
                getSearchUserListCondition.tagIds
            )
                .then(result => {
                    setStConversationResponse(result)
                })
                .finally(() => {
                    setStIsSearch(false)
                    setStIsLoadMore(false)
                })
        }

    }, [state.evtMsgFromSender])

    const loadAllSocialTagStatus = async () => {
        try {
            const status = await beehiveService.getAllTagByListfbUser()
            setStTagStatus(status)
        } catch (error) {
            console.error(error)
        }
    }

    const onFilterStaffAssigned = async ({ staffs, unassigned}) => {
        staffs = staffs || []
        if (staffs.length === 0 && unassigned === false) {
            // filter list of user chat empty
            setSearchUserListCondition(current => ({
                ...current,
                staffAssigned: []
            }))
        } else {
            setSearchUserListCondition(current => ({
                ...current,
                staffAssigned: unassigned ? [...staffs, 0] : staffs
            }))
        }
    }
    const onFilterTagsAssigned = async ({ tags, unassigned}) => {
        tags = tags || []
        if (tags.length === 0 && unassigned === false) {
            // filter list of user chat empty
            setSearchUserListCondition(current => ({
                ...current,
                tagIds: []
            }))
        } else {
            setSearchUserListCondition(current => ({
                ...current,
                tagIds: unassigned ? [...tags, 0] : tags
            }))
        }
    }

    const fetchListConversation = () => {
        if ('search' === getSearchUserListCondition.action) {
            // search case
            setStIsSearch(true)
            LiveChatService.getListConversationForNew(
                getSearchUserListCondition.after,
                getSearchUserListCondition.keyword,
                getSearchUserListCondition.pageId,
                getSearchUserListCondition.limit,
                getSearchUserListCondition.staffAssigned,
                getSearchUserListCondition.tagIds
            )
                .then(result => {
                    setStConversationResponse(result)
                })
                .finally(() => {
                    setStIsSearch(false)
                    setStIsLoadMore(false)
                })

        } else if ('scroll' === getSearchUserListCondition.action) {
            // scroll case
            setStIsLoadMore(true)
            LiveChatService.getListConversationForNew(
                stConversationResponse.after,
                stConversationResponse.keyword,
                getSearchUserListCondition.pageId,
                getSearchUserListCondition.limit,
                getSearchUserListCondition.staffAssigned,
                getSearchUserListCondition.tagIds
            )
                .then(result => {
                    setStConversationResponse(current => ({
                        ...result,
                        data: [...current.data, ...result.data]
                    }))
                })
                .finally(() => {
                    setStIsSearch(false)
                    setStIsLoadMore(false)
                })
        }
    }

    const onKeyDownSearch = (event) => {
        const keyword = event.currentTarget.value
        if (event.key === 'Enter') {
            if (!keyword) {
                refInputSearch.current.value = ''
            }

            setSearchUserListCondition(current => ({
                ...current,
                keyword: keyword,
                action: 'search'
            }))
        }
    }

    const onScrollUserChatList = (event) => {
        const obj = event.currentTarget
        // => scroll to bottom and is not fetching
        if (!stIsLoadMore && (obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight))) {
            if (stConversationResponse.after) { // => have page
                setStIsLoadMore(true)
                setSearchUserListCondition(current => ({
                    ...current,
                    after: stConversationResponse.after,
                    action: 'scroll'
                }))
            }
        }
    }

    const onClickConversation = (conversation) => {
        dispatch(FbMessengerContext.actions.changeCurrentConversation(conversation))

        const hasUpdate = stConversationResponse.data.findIndex(con => con.fbConversationId === conversation.fbConversationId && con.unread_count > 0)

        if (hasUpdate > -1) {
            // mark as read here
            LiveChatService.markReadAConversation(conversation.fbConversationId, stConversationResponse.data[hasUpdate].unread_count)
                .then(res => {

                    // set unread for this conversation in to 0
                    let lstConversation = _.cloneDeep(stConversationResponse.data)
                    lstConversation[hasUpdate].unread_count = 0

                    // set list conversation again
                    setStConversationResponse(current => ({
                        ...current,
                        data: lstConversation
                    }))
                })
                .catch(error => {
                    // no nothing here
                })
        }
    }

    const handleAvatar = (url) => {
        if (url) {
            return url
        }
        return '/assets/images/go-chat-default-avatar.png'
    }

    const calculateUnreadConversationNumber = (lstConversation) => {
        if (lstConversation && lstConversation.length > 0) {
            const number = lstConversation.filter(conversation => conversation.unread_count > 0).length
            dispatch(FbMessengerContext.actions.setUnreadConversationNumber(number))
        } else {
            dispatch(FbMessengerContext.actions.setUnreadConversationNumber(0))
        }
    }

    const handleTitleMessage = (message) => {
        // get first 2 word (split by space) 
        let returnMessage = ''
        const totalMessage = message.split(' ')

        if (totalMessage.length === 1) {
            returnMessage = totalMessage[0]
        }
        if (totalMessage.length >= 2) {
            returnMessage = totalMessage[0] + ' ' + totalMessage[1]
        }

        if (returnMessage.length > 15) {
            returnMessage = returnMessage.substring(0, 15)
        }
        return returnMessage + '...'
    }

    const formatSnippetContent = (messageObject) => {
        const messaging = ThemeEngineUtils.parseString(messageObject)

        return (
            <>
                {/*NORMAL TEXT*/ }
                { messaging.text &&
                <Emoji text={ handleTitleMessage(messaging.text) }/>
                }
                {/*STICKER*/ }
                { messaging.sticker &&
                <img src={ messaging.sticker } alt="sticker" className="ml-3 mr-3" style={ { maxHeight: '20px' } }/>
                }

                {/*IMAGE VIDEO FILES*/ }
                { messaging.attachments &&
                <div>
                    { messaging.attachments.map(attachment => {
                        //{/*IMAGE*/}
                        if (attachment.type === 'image') {
                            return (
                                <a href={ attachment.payload.url } target="_blank" key={ attachment.payload.url }>
                                    <img src={ attachment.payload.url }
                                         alt="sticker"
                                         className="message-image"
                                         style={ { maxHeight: '20px' } }
                                    />
                                </a>

                            )
                        }

                        // VIDEO
                        if (attachment.type === 'video') {
                            return (
                                <video src={ attachment.payload.url }
                                    //width={attachment.video_data.width}
                                       controls
                                       style={ {
                                           maxHeight: '20px',
                                           maxWidth: '100px'
                                       } }
                                />
                            )
                        }

                        // AUDIO
                        if (attachment.type === 'audio') {
                            return (
                                <audio src={ attachment.payload.url }
                                    //width={attachment.video_data.width}
                                       controls
                                       style={ {
                                           border: '1px solid gray',
                                           borderRadius: '99999px',
                                           maxHeight: '20px',
                                           maxWidth: '100px'
                                       } }
                                />
                            )
                        }

                        // FILE
                        if (attachment.type === 'file') {
                            const nameFilePure = attachment.payload.url.split('?')[0]
                            const nameFile = nameFilePure.split('/')
                            return (
                                <div className="d-flex align-items-end">
                                    <div>
                                        <a href={ attachment.payload.url } target="_blank" style={ {
                                            color: 'inherit',
                                            textDecoration: 'underline'
                                        } }>
                                            { handleTitleMessage(nameFile[nameFile.length - 1]) }
                                        </a>
                                    </div>

                                </div>
                            )
                        }
                    }) }
                </div>
                }
            </>
        )
    }


    return (

        <div className={ props.showOrder ? 'box_list show_order ' : 'box_list' }>
            {/*SEARCH*/ }
            <div className="search-box__wrapper m-2">
                <UikInput
                    defaultValue=""
                    onKeyDown={ onKeyDownSearch }
                    ref={ refInputSearch }
                    icon={ (
                        <FontAwesomeIcon icon="search"/>
                    ) }
                    placeholder={ i18next.t('page.livechat.conversation.chatlist.searchByName') }
                />
            </div>

            <div className="groupIcon">
                <div className="mr-2 ml-2 d-flex justify-content-between align-items-center cursor--default">
                    <div className="iconMess">
                        <img src="/assets/images/icon_mess_fb.png"/>
                        <p className="messenger">
                            <Trans i18nKey="social.facebook.title.messenger"/>
                        </p>
                        {
                            state.unreadConversationNumber > 0 && <p className="total-mess">
                                { state.unreadConversationNumber >= 10 ? '9+' : state.unreadConversationNumber }
                            </p>
                        }
                    </div>
                    <div className="d-flex position-relative">
                        {/*<div className='iconMail'>*/ }
                        {/*    <img src="/assets/images/icon_mail_fb.png"/>*/ }
                        {/*</div>*/ }
                        <FilterStaff
                            staffs={ stAssignedStaff }
                            onFilterStaff={ onFilterStaffAssigned }
                            onFilterTags={ onFilterTagsAssigned }>
                        </FilterStaff>
                    </div>
                </div>
            </div>

            {/*LIST CHAT*/ }
            <div className="list_chat pt-2" onScroll={ onScrollUserChatList }>
                { !stIsSearch &&
                <>
                    { stConversationResponse.data.map((conversation, i) => {
                        let profile = conversation.senders.data[0]
                        const isRead = conversation.unread_count === 0 ? true : false
                        const isActive = state.currentConversation?.gsConversationId === conversation.gsConversationId

                        return (
                            <div key={ conversation.gsConversationId }
                                 className={ ['list-item-chat', isRead ? 'read' : '', isActive ? 'active' : ''].join(' ') }
                                 onClick={ () => onClickConversation(conversation) }>
                                <div className="grid_chat p-2">
                                    <div className="item_info">
                                        <div className="item_image">
                                            <img src={ handleAvatar(profile.profile_pic) } width="40" height="40"/>
                                            { conversation.unread_count > 0 &&
                                            <span
                                                className="unread_message">{ conversation.unread_count >= 10 ? '9+' : conversation.unread_count }</span>
                                            }
                                        </div>
                                        <div className="item_name">
                                            <p className="name">{ profile.name }</p>
                                            <p className="description">
                                                { conversation.src === 1 &&
                                                <span className="color-gray font-size-12px mr-1">
                                                                        <FontAwesomeIcon icon="reply"/>
                                                                    </span>
                                                }
                                                { formatSnippetContent(conversation.snippet.messageObject) }
                                            </p>
                                            { stTagStatus && stTagStatus[profile.id] && <div className="tag-status">
                                                <GSSocialTagStatus status={ stTagStatus[profile.id] }/>
                                            </div> }
                                        </div>
                                    </div>
                                    <div className="item_date">
                                                        <span className="conversation__time">
                                                            { DateTimeUtils.formatFromNow(conversation.snippet.messageTime) }
                                                        </span>
                                        {
                                            stExpireConversations[i]?.expired &&
                                            <GSImg src="/assets/images/icon_warning_fb.png" alt="warning"/>
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    }) }

                    { stConversationResponse.data.length === 0 &&
                    <div className="text-center">
                        <GSTrans t="common.noResultFound"/>
                    </div>
                    }
                </>
                }

                {
                    (stIsLoadMore || stIsSearch) &&
                    <div className="fb-chat-list__load-more d-flex justify-content-center">
                        <Loading style={ LoadingStyle.ELLIPSIS_GREY }/>
                    </div>
                }
            </div>
        </div>
    )
}


FbUserChatList.propTypes = {
    className: PropTypes.string,
    showOrder: PropTypes.bool
}

export default FbUserChatList
