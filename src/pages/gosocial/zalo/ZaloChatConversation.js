import './ZaloChatConversation.sass'
import React, {useContext, useEffect, useMemo, useReducer, useRef, useState} from 'react'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import {Trans} from 'react-i18next'
import {UikInput} from '../../../@uik'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {CredentialUtils} from '../../../utils/credential'
import {GSToast} from '../../../utils/gs-toast'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import OrderInZalo from './OrderInZalo/OrderInZalo'
import {RouteUtils} from '../../../utils/route'
import AssignStaff from '../assign-staff/AssignStaff'
import zaloService from '../../../services/ZaloService'
import {OrderInZaloContext} from './context/OrderInZaloContext'
import {NavigationPath} from '../../../config/NavigationPath'
import {ZaloChatService} from '../../../services/ZaloChatService'
import {FETCH_MODE} from '../../live-chat/conversation/context/LiveChatConversationContext'
import {ZaloChatUtils} from '../../live-chat/zalo/ZaloChatUtils'
import _, {debounce} from 'lodash'
import GSSocialTag from '../../../components/shared/GSSocialTag/GSSocialTag'
import beehiveService from '../../../services/BeehiveService'
import i18next from 'i18next'
import Loading, {LoadingStyle} from '../../../components/shared/Loading/Loading'
import GoSocialChatBoxFooter from './GoSocialChatBoxFooter/GoSocialChatBoxFooter.jsx'
import ZaloChatListRow from "./ChatConversation/ZaloChatListRow";
import ZaloChatBoxMessage from "./ChatConversation/ZaloChatBoxMessage";
import ContentLoader, {List} from "react-content-loader"
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import FilterStaffZalo from "./FilterStaffZalo/FilterStaffZalo";

const CHAT_LIST_SIZE_PER_PAGE = 10
const CHAT_BOX_SIZE_PER_PAGE = 10
const INTERVAL_CHAT_LIST_FETCHING_TIME_IN_SECOND = 10
const IDLE_CHAT_LIST_TIMEOUT_IN_SECOND = 10
const ZaloChatConversation = props => {
    const refChatBoxFooter = useRef(null);

    const [state, dispatch] = useReducer(OrderInZaloContext.reducer, OrderInZaloContext.initState)
    const [stShowOrder, setStShowOrder] = useState(false)
    const [stDefaultPageChat, setStDefaultPageChat] = useState(false)
    const [stListPageChat, setStListPageChat] = useState([])
    const [stSelectPageChat, setStSelectPageChat] = useState([0])
    const [heightContent, setHeightContent] = useState(0)
    const elementRef = useRef(null)
    const [stAssignStaffId, setStAssignStaffId] = useState()
    const [stAssignStaffName, setStAssignStaffName] = useState()
    const [stAssignedTags, setStAssignedTags] = useState([])
    const [stTags, setStTags] = useState([])
    const [stAssignedStaff, setStAssignedStaff] = useState([])
    const [stTagStatus, setStTagStatus] = useState({})

    const refInputSearch = useRef(null);
    const [stIsSearch, setStIsSearch] = useState(false);
    const [stSearchResult, setStSearchResult] = useState([]);

    // for chat list
    const [stChatListFetchMode, setStChatListFetchMode] = useState(FETCH_MODE.REALTIME)
    const fetchIntervalHandler = useRef(null)
    const [stChatListCanLoadMore, setStChatListCanLoadMore] = useState(false)
    const [stChatListIsLoadMore, setStChatListIsLoadMore] = useState(false)
    const [stChatListPage, setStChatListPage] = useState(0)
    const [stConversationResponse, setStConversationResponse] = useState([])
    const [stUpdateConversation, setStUpdateConversation] = useState({
        hasFilter: false,
        filterConversation: []
    })
    const [getSearchUserListCondition, setSearchUserListCondition] = useState({
        staffAssigned: [],
        tagIds: [],
        unassigned: false,
        untagged: false
    })
    const [stUnReadUserCount, setStUnReadUserCount] = useState(0);
    const [stChatListIsFetching, setStChatListIsFetching] = useState(false);

    // for chat conversation
    const [stChatBoxCanLoadMore, setStChatBoxCanLoadMore] = useState(false);
    const [stChatBoxIsFetching, setStChatBoxIsFetching] = useState(true);
    const [stChatBoxIsFetchingMore, setStChatBoxIsFetchingMore] = useState(false);
    const [stChatBoxPage, setStChatBoxPage] = useState(0);
    const [stChatBoxMessageList, setStChatBoxMessageList] = useState([]);
    const [stChatBoxMessageStatus, setStChatBoxMessageStatus] = useState(null);

    // INIT CONFIG
    useEffect(() => {
        loadAllSocialTag()
        loadAssignedStaffByZaloUsers()
        loadAllSocialTagStatus()
        setHeightWidgetContent()
        getRequestToPageChat()
        const isExistGoSocial = CredentialUtils.getIsExistGoSocial()

        if (!isExistGoSocial) {
            RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO)
        }
    }, [])

    useEffect(() => {
        setStAssignedTags([])
        loadAssignedTag()
        loadAssignedStaff();
    }, [state.zaloUserId])

    useEffect(() => {
        if (!getSearchUserListCondition.tagIds.length && !getSearchUserListCondition.staffAssigned.length && !getSearchUserListCondition.unassigned && !getSearchUserListCondition.untagged) {
            return
        }

        fetchListConversation()
    }, [getSearchUserListCondition.tagIds, getSearchUserListCondition.staffAssigned])

    const fetchListConversation = () => {
        setStIsSearch(true)
        zaloService.filterZaloUserByAssigned(
            getSearchUserListCondition.tagIds,
            getSearchUserListCondition.staffAssigned,
            getSearchUserListCondition.unassigned,
            getSearchUserListCondition.untagged
        )
            .then(zaloUsers => {
                const zuIds = zaloUsers.map(zu => zu.zaloUserId)
                setStUpdateConversation({
                    hasFilter: true,
                    filterConversation: zuIds
                })
             })
            .finally(() => {
                setStIsSearch(false)
            })
    }

    const loadAssignedStaff = async () => {
        try {
            if (!state.zaloUserId) return
            const data = await zaloService.getZaloUser(state.zaloUserId);
            setStAssignStaffId(data.staffId);
            setStAssignStaffName(data.staffName);
        } catch (error) {
            setStAssignStaffId(undefined);
            setStAssignStaffName('');
        }
    }

    // ===============================
    // CHAT LIST
    // ===============================
    useEffect(() => {
        if (state.zaloOAUserDetail && state.zaloOAUserDetail['oa_id']) {
            fetchConversationList(0, CHAT_LIST_SIZE_PER_PAGE, true) // first load
            fetchUnReadUserCount()
        }
    }, [state.zaloOAUserDetail])

    useEffect(() => {
        if (stChatListFetchMode === FETCH_MODE.INTERVAL) {
            fetchIntervalHandler.current = setInterval(() => fetchConversationList(0, CHAT_LIST_SIZE_PER_PAGE),
                INTERVAL_CHAT_LIST_FETCHING_TIME_IN_SECOND * 1000)
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
    }, [stChatListFetchMode])

    /**
     * Update chat list when has new message income
     */
    useEffect(() => {
        if (state.newMessage) {
            const newUserId = state.newMessage.userPage
            // update conversation
            /**
             * @type {ChatHistoryRecentVM[]}
             */
            const chatList = _.cloneDeep(stConversationResponse)


            let newMessageInList = chatList.find(c => c.userPage === newUserId)

            if (newMessageInList) { // new message from user in chat list
                newMessageInList.messageTime = state.newMessage.messageTime
                newMessageInList.messageObject = state.newMessage.messageObject
                newMessageInList.isSellerSend = state.newMessage.isSellerSend
                newMessageInList.isSellerRead = state.newMessage.isSellerRead
                if (!state.currentConversation || state.currentConversation.userPage !== newMessageInList.userPage) {
                    newMessageInList.oaUnread = (newMessageInList.oaUnread || 0) + 1
                }
                chatList.sort((a, b) => b.messageTime - a.messageTime)
                setStConversationResponse(chatList)
            } else {  // new message from user outside the chat list
                setStChatListPage(0)
                setStChatListCanLoadMore(true)
                fetchConversationList(0, CHAT_LIST_SIZE_PER_PAGE)
            }

            // update unread
            if (state.currentConversation && state.currentConversation.userPage === newUserId) {
                // current conversation -> don't update
            } else {
                fetchUnReadUserCount()
            }
        }
    }, [state.newMessage])

    useEffect(() => {
        if (window.SockJS && window.Stomp && !state.webhookConnection && stChatListFetchMode === FETCH_MODE.REALTIME) {
            ZaloChatService.webhookConnect(CredentialUtils.getStoreId(), dispatch, OrderInZaloContext);
        }
        return () => {
            if (state.webhookConnection) {
                ZaloChatService.webhookDisconnect(state, dispatch, OrderInZaloContext)
            }
            dispatch(OrderInZaloContext.actions.clearWebhookReconnection())
        }
    }, [state.webhookConnection, stChatListFetchMode])

    // ===============================
    // CHAT CONVERSATION
    // ===============================
    useEffect(() => {
        setStChatBoxCanLoadMore(false)
        if (state.currentConversation) {
            setStChatBoxIsFetching(true)
            refChatBoxFooter.current.reset()

            // reset page
            setStChatBoxPage(0)

            fetchChatBoxMessages()

            // update unread
            const chatList = _.cloneDeep(stConversationResponse)
            let current = chatList.find(c => c.userPage === state.currentConversation.userPage)
            current.oaUnread = 0
            setStConversationResponse(chatList)
        }
        return () => {

        }
    }, [state.currentConversation])

    // MESSAGE EVENT
    useEffect(() => {
        /**
         * @type {ChatHistoryDTO}
         */
        const evt = state.evtMsgFromSender
        if (evt) {
            if (state.currentConversation && state.currentConversation.userPage === evt.userPage) { // -> opening chat box
                appendNewMessageWithFullContent(evt)
            } else { // -> another user
                dispatch(OrderInZaloContext.actions.setNewMessage(evt))
            }
        }

    }, [state.evtMsgFromSender])


    // ANOTHER EVENT
    useEffect(() => {
        const evt = state.evtFromSender
        if (evt) {
            switch (evt.event_name) {
                case 'user_seen_message':
                    const userId = evt.recipient.id
                    if (state.currentConversation && state.currentConversation.userPage === userId) { // -> opening chat box
                        setStChatBoxMessageStatus('seen')
                    }
                    const chatList = _.cloneDeep(stConversationResponse)
                    let newMessageInList = chatList.find(c => c.userPage === userId)
                    if (newMessageInList) { // new message from user in chat list
                        newMessageInList.isUserRead = true
                        setStConversationResponse(chatList)
                    }
                    break
            }

        }
    }, [state.evtFromSender])

    const appendNewMessageWithFullContent = (msg) => {
        dispatch(OrderInZaloContext.actions.setNewMessage(msg))
        setStChatBoxMessageList(state => [msg, ...state])
    }


    const fetchChatBoxMessages = () => {
        const clientId = state.currentConversation.userPage
        const oaId = state.zaloOAUserDetail['oa_id']
        zaloService.getConversationDetail(oaId, clientId, true, 0, CHAT_BOX_SIZE_PER_PAGE)
            .then(({data, totalCount}) => {
                setStChatBoxMessageList(data)
                setStChatBoxIsFetching(false)
                setStChatBoxCanLoadMore(data.length > 0 && data.filter(c => c.isFirstMsg).length === 0)
                fetchUnReadUserCount()
            })
    }

    const fetchUnReadUserCount = () => {
        const oaId = state.zaloOAUserDetail['oa_id']
        zaloService.countUnReadUser(oaId)
            .then(setStUnReadUserCount)
    }


    const fetchConversationList = (page, size, loading = false) => {
        if (loading) {
            setStChatListIsFetching(true)
        }
        zaloService.getRecentChatList(state.zaloOAUserDetail['oa_id'], undefined, page, size)
            .then(({data, totalCount}) => {
                setStConversationResponse(data)
                setStChatListCanLoadMore((page * size) + data.length < totalCount)
            })
            .finally(() => {
                setStChatListIsFetching(false)
            })
    }

    const setHeightWidgetContent = () => {
        const heightHeader = elementRef.current.clientHeight
        const heightContainer = window.innerHeight
        const heightContent = heightContainer - heightHeader - 77
        setHeightContent(heightContent)
    }

    const getRequestToPageChat = () => {
        // check token from server
        zaloService.getStoreChatConfig()
            .then(store => {
                if (store.status === 'EXPIRED_REFRESH_TOKEN') {
                    RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO)
                    return;
                }
                // get OA detail
                zaloService.getOADetail(store.oaId)
                    .then(detail => {
                        dispatch(OrderInZaloContext.actions.setZaloOAUserDetail(detail))
                    })
                    .catch( e => {
                        if (e.data.error === -224) {
                            GSToast.warning(i18next.t("common.api.zalo.failed"))
                        } else {
                            handleExpiredError(e)
                        }
                    })
            }).catch(e => {
            RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO)
        })
    }

    const showOrder = (isShow) => {
        setStShowOrder(isShow)
    }

    const assignCallback = (data) => {
        zaloService.assignZaloUser(state.zaloUserId, {
            staffId: data.id,
            staffIsSeller: data.staffIsSeller,
            staffName: data.name
        }).then(() => {
            setStAssignStaffId(data.id)
            setStAssignStaffName(data.name)
            loadAssignedStaffByZaloUsers();
        })
    }

    const unAssignCallback = () => {
        zaloService.unAssignZaloUser(state.zaloUserId).then(() => {
            setStAssignStaffId(undefined)
            setStAssignStaffName(undefined)
            loadAssignedStaffByZaloUsers();
        })
    }

    const loadAllSocialTagStatus = async () => {
        try {
            const status = await beehiveService.getAllTagByListZaloUser()
            setStTagStatus(status)
        } catch (error) {
            console.error(error)
        }
    }

    const loadAllSocialTag = async () => {
        try {
            const tags = await beehiveService.getAllZaloSocialTag()
            setStTags(tags)
        } catch (error) {
            console.error(error)
        }
    }

    const loadAssignedTag = async () => {
        try {
            if (!state.zaloUserId) return
            const assignedTags = await beehiveService.getAssignedTagByZaloUser(state.zaloUserId)
            const assigned = (assignedTags) ? assignedTags.map(t => t.zaloUserTagInfoId) : []
            setStAssignedTags(assigned)
        } catch (error) {
            console.error(error)
        }
    }

    const saveSocialTag = async (tag) => {
        const result = await beehiveService.saveZaloSocialTag(tag)
        return result
    }

    const deleteSocialTag = async (tagId) => {
        const result = await beehiveService.deleteZaloSocialTag(tagId)
        return result
    }

    const assignTag = async (tagId) => {
        const zaloUserTag = {
            zaloTagInfoId: tagId,
            zaloUser: state.zaloUserId
        }
        const result = await beehiveService.assignTagByZaloUser(zaloUserTag)
        debounce(loadAllSocialTagStatus, 300)
        return result
    }

    const revokeTag = async (tagId) => {
        const zaloUserTag = {
            zaloTagInfoId: tagId,
            zaloUser: state.zaloUserId
        }
        const result = await beehiveService.revokeTagByZaloUser(zaloUserTag)
        loadAllSocialTagStatus();
        return result
    }

    const loadAssignedStaffByZaloUsers = async () => {
        try {
            const data = await zaloService.loadAssignedStaffByZaloUser()
            setStAssignedStaff(data)
        } catch (error) {
            console.error(error)
        }
    }

    const onFilterStaffAssigned = async ({ staffs, unassigned }) => {
        try {
            staffs = staffs || [];
            if (staffs.length === 0 && unassigned === false) {
                //reset user list
                setStUpdateConversation({
                    hasFilter: false,
                    filterConversation: []
                })
                return
            } else {
                setSearchUserListCondition(current => ({
                    ...current,
                    staffAssigned: staffs,
                    unassigned: unassigned ? true : false
                }))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const onFilterTagsAssigned = async ({ tags, untagged }) => {
        try {
            tags = tags || [];
            if (tags.length === 0 && untagged === false) {
                // filter list of user chat empty
                setStUpdateConversation({
                    hasFilter: false,
                    filterConversation: []
                })
                return
            } else {
                setSearchUserListCondition(current => ({
                    ...current,
                    tagIds: tags,
                    untagged: untagged ? true : false
                }))
            }
        } catch (error) {
            console.error(error)
        }
    }

    /**
     *
     * @param {ChatHistoryRecentVM} conversation
     */
    const onClickConversation = (conversation) => {
        closeSearchResult()
        if (state.currentConversation &&
            state.currentConversation.userPage === conversation.userPage) {
            // -> if it is current then ignore
            return
        }
        dispatch(OrderInZaloContext.actions.changeCurrentConversation(conversation))
        setStChatBoxMessageStatus(conversation.isUserRead? 'seen':'received')
    }

    const handleExpiredError = (e) => {
         if (e.response?.data?.detail === 'refresh token expired' || e.response?.data === 'refresh token expired') {
            RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO)
        } else {
            GSToast.commonError()
        }
    }

    const onSendText = (message) => {
        const requestBody = {
            message: {
                text: message
            },
            recipient: {
                user_id: state.zaloUserId,
            }
        }

        zaloService.sendMessage(state.zaloOAUserDetail['oa_id'], requestBody)
            .then((response) => {
                if (response.error === -221) {
                    GSToast.error("page.gosocial.zalo.oaNeedToVerify", true)
                } else {
                    refChatBoxFooter.current.reset()
                    setStChatBoxMessageStatus('received')
                }
            })
            .catch(handleExpiredError)
    }



    const onSendImage = (imageFile) => {
        refChatBoxFooter.current.startSending()
        zaloService.uploadToZaloServer(state.zaloOAUserDetail['oa_id'], imageFile, 'IMAGE')
            .then(response => {
                const attachmentId = response.attachment_id

                const requestBody = {
                    "recipient": {
                        "user_id": state.zaloUserId
                    },
                    "message": {
                        "attachment": {
                            "payload": {
                                "elements": [
                                    {
                                        "media_type": "image",
                                        "attachment_id": attachmentId
                                    }
                                ],
                                "template_type": "media"
                            },
                            "type": "template"
                        }
                    }
                }

                zaloService.sendMessage(state.zaloOAUserDetail['oa_id'], requestBody)
                    .then((sendMsgResponse) => {
                        if (sendMsgResponse.error === -221) {
                            GSToast.error("page.gosocial.zalo.oaNeedToVerify", true)
                        } else {
                            refChatBoxFooter.current.reset()
                            setStChatBoxMessageStatus('received')
                        }
                    })
                    .catch(handleExpiredError)
                    .finally(refChatBoxFooter.current.reset)

            })
            .finally(refChatBoxFooter.current.reset)
    }

    const onSendFile = (file) => {
        refChatBoxFooter.current.startSending()
        zaloService.uploadToZaloServer(state.zaloOAUserDetail['oa_id'], file, 'FILE')
            .then(response => {
                const token = response.token

                const requestBody = {
                    "recipient": {
                        "user_id": state.zaloUserId
                    },
                    "message": {
                        "attachment": {
                            "payload": {
                                "token": token
                            },
                            "type": "file"
                        }
                    }
                }

                zaloService.sendMessage(state.zaloOAUserDetail['oa_id'], requestBody)
                    .then((sendMsgResponse) => {
                        if (sendMsgResponse.error === -221) {
                            GSToast.error("page.gosocial.zalo.oaNeedToVerify", true)
                        } else {
                            refChatBoxFooter.current.reset()
                            setStChatBoxMessageStatus('received')
                        }
                    })
                    .catch(handleExpiredError)
                    .finally(refChatBoxFooter.current.reset)

            })
            .finally(refChatBoxFooter.current.reset)
    }

    const onChatListScroll = (event) => {
        const obj = event.currentTarget
        if (!stChatListIsLoadMore && (obj.scrollTop >= (obj.scrollHeight - obj.offsetHeight)) && stChatListCanLoadMore) {
            setStChatListIsLoadMore(true)

            zaloService.getRecentChatList(state.zaloOAUserDetail['oa_id'], undefined, (stChatListPage + 1), CHAT_LIST_SIZE_PER_PAGE)
                .then(({data, totalCount}) => {
                    setStConversationResponse(state=>[...state,...data])
                    setStChatListCanLoadMore((stChatListPage * CHAT_LIST_SIZE_PER_PAGE) + data.length < totalCount)
                    setStChatListIsLoadMore(false)
                    setStChatListPage(page => page + 1)
                })

        }
    }

    const onChatBoxScroll = (event) => {
        const obj = event.currentTarget
        if (!stChatBoxIsFetchingMore && ((Math.floor(obj.scrollTop)-5) <= (obj.offsetHeight - obj.scrollHeight)) && stChatBoxCanLoadMore) {

            if (state.currentConversation) {
                setStChatBoxIsFetchingMore(true)
                const userId = state.currentConversation.userPage
                const oaId = state.zaloOAUserDetail['oa_id']

                // fetch data page
                zaloService.getConversationDetail(oaId, userId, false, (stChatBoxPage + 1), CHAT_BOX_SIZE_PER_PAGE)
                    .then(({data, totalCount}) => {
                        setStChatBoxMessageList(state => [...state, ...data])
                        setStChatBoxCanLoadMore(data.length > 0 && data.filter(c => c.isFirstMsg).length === 0)
                        setStChatBoxIsFetchingMore(false)
                        setStChatBoxPage(page => page + 1)
                    })
            }

        }
    }

    const onKeyDownSearch = (event) => {
        const keyword = event.currentTarget.value
        if (event.key === 'Enter') {
            if (keyword) {
                zaloService.getRecentChatList(state.zaloOAUserDetail['oa_id'], keyword, 0, CHAT_LIST_SIZE_PER_PAGE)
                    .then(({data, totalCount}) => {
                        setStSearchResult(data)
                        setStIsSearch(true)
                        setStChatListCanLoadMore(data.length < totalCount)
                    })
            } else {
                closeSearchResult()
            }

        }
    }

    const closeSearchResult = () => {
        refInputSearch.current.setValue('')
        setStIsSearch(false)
        setStSearchResult([])
    }


    return <>
        <OrderInZaloContext.provider value={{ state: state, dispatch }}>
            <GSContentContainer className="zalo_messenger">
                <GSContentBody className="zalo_body" size={GSContentBody.size.MAX}>
                    <div className="widget_header" ref={elementRef}>
                        {state.zaloOAUserDetail &&
                        <div className="page-selector">
                            <div className="page-selector__button">
                                <span className="page-selector__button__label d-flex align-items-center">
                                    <img src={state.zaloOAUserDetail.avatar} width="30" height="30" />
                                    {state.zaloOAUserDetail.name}
                                </span>
                            </div>
                        </div>
                        }
                    </div>

                    <div className="widget_content" style={{ height: heightContent }}>
                        <div className={stShowOrder ? 'box_list show_order' : 'box_list'}>
                            {/*SEARCH*/}
                            <div className="search-box__wrapper m-2">
                                <UikInput
                                    defaultValue=""
                                    onKeyDown={onKeyDownSearch}
                                    ref={refInputSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search" />
                                    )}
                                    placeholder={i18next.t("page.livechat.conversation.chatlist.searchByName")}
                                />
                            </div>

                            <div className="groupIcon">
                                <div className="mr-2 ml-2 d-flex justify-content-between align-items-center cursor--default">
                                    <div className="iconMess">
                                        <img src="/assets/images/icon_mess_fb.png" />
                                        <p className="messenger">
                                            <Trans i18nKey="social.facebook.title.messenger" />
                                        </p>
                                        {stUnReadUserCount > 0 &&
                                            <p className='total-mess'>
                                                {stUnReadUserCount}
                                            </p>
                                        }
                                    </div>
                                    <div className="icon-setting-chat">
                                        {/*<div className="icon-mail-chat">*/}
                                        {/*    <img src="/assets/images/icon_mail_fb.png" />*/}
                                        {/*</div>*/}
                                        <div className="filter-assigned-staff">
                                            <FilterStaffZalo
                                                conversation={stConversationResponse}
                                                staffs={stAssignedStaff}
                                                tags={ stTagStatus }
                                                onFilterStaff={onFilterStaffAssigned}
                                                onFilterTags={onFilterTagsAssigned}>
                                            </FilterStaffZalo>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*LIST CHAT*/}
                            <div className="list_chat pt-2" onScroll={onChatListScroll}>

                                {stChatListIsFetching &&
                                    <>
                                        {[1,2,3,4].map(i => <ContentLoader
                                            speed={2}
                                            width={280}
                                            height={70}
                                            viewBox="0 0 280 70"
                                            backgroundColor="#f3f3f3"
                                            foregroundColor="#ecebeb"
                                            {...props}
                                        >
                                            <rect x="55" y="15" rx="3" ry="3" width="88" height="15"/>
                                            <rect x="55" y="35" rx="3" ry="3" width="52" height="13"/>
                                            <circle cx="25" cy="35" r="20"/>
                                        </ContentLoader>)}
                                    </>
                                }

                                {/*RECENT CHAT*/}
                                {!stIsSearch && stUpdateConversation && stConversationResponse.map(
                                    /**
                                     * @param {ChatHistoryRecentVM} conversation
                                     */
                                    conversation =>
                                    <ZaloChatListRow conversation={conversation}
                                                     onClickConversation={onClickConversation}
                                                     stUpdateConversation={stUpdateConversation}
                                                     tagStatus={stTagStatus}
                                                     key={conversation.mid + '-' + conversation.messageTime + '-' + conversation.oaUnread + '-' + conversation.isSellerSend}
                                    />
                                )}
                                {/*SEARCH RESULT*/}
                                {stIsSearch && stSearchResult.map(conversation =>
                                    <ZaloChatListRow conversation={conversation}
                                                     onClickConversation={onClickConversation}
                                                     stUpdateConversation={stUpdateConversation}
                                                     tagStatus={stTagStatus}
                                                     key={conversation.mid + '-' + conversation.messageTime + '-' + conversation.oaUnread + '-' + conversation.isSellerSend}

                                    />
                                )}
                                {stChatListIsLoadMore &&
                                <div className="live-chat-chat-list__load-more d-flex justify-content-center">
                                    <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                                </div>
                                }
                            </div>
                        </div>

                        <div className={stShowOrder ? 'box_chat showOrder' : 'box_chat'}>
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
                            {state.currentConversation &&
                                <>
                                    <div className="chat_header">
                                        <div className="chat_left">
                                            <div className="chat_image">
                                                <img
                                                    src={state.currentConversation.userAvatar}
                                                    width="40" height="40"  alt="user-avatar"/>

                                            </div>
                                            <div className="chat_name">
                                                <p className="name">
                                                    {state.currentConversation.userDisplayName}
                                                </p>
                                                <p className='status'>
                                                    {
                                                        stChatBoxMessageStatus && i18next.t(`page.gosocial.chat.${stChatBoxMessageStatus}`)
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="chat_right">
                                            <AssignStaff assignCallback={assignCallback} unAssignCallback={unAssignCallback}
                                                         assignStaffId={stAssignStaffId} assignStaffName={stAssignStaffName} />
                                            {/*<img src="/assets/images/icon_mail_fb.png" />*/}
                                        </div>
                                    </div>

                                    <div className="chat_content" onScroll={onChatBoxScroll}>
                                        <div className="messages flex-column-reverse d-flex">
                                            {stChatBoxIsFetching &&
                                                <>
                                                    <ContentLoader viewBox="0 0 446 160" height={160} width={446} {...props}>
                                                        <circle cx="19" cy="25" r="16" />
                                                        <rect x="39" y="12" rx="5" ry="5" width="220" height="10" />
                                                        <rect x="40" y="29" rx="5" ry="5" width="220" height="10" />
                                                        <circle cx="420" cy="71" r="16" />
                                                        <rect x="179" y="76" rx="5" ry="5" width="220" height="10" />
                                                        <rect x="179" y="58" rx="5" ry="5" width="220" height="10" />
                                                        <circle cx="21" cy="117" r="16" />
                                                        <rect x="45" y="104" rx="5" ry="5" width="220" height="10" />
                                                        <rect x="45" y="122" rx="5" ry="5" width="220" height="10" />
                                                    </ContentLoader>
                                                    <ContentLoader viewBox="0 0 446 160" height={160} width={446} {...props}>
                                                        <circle cx="19" cy="25" r="16" />
                                                        <rect x="39" y="12" rx="5" ry="5" width="220" height="10" />
                                                        <rect x="40" y="29" rx="5" ry="5" width="220" height="10" />
                                                        <circle cx="420" cy="71" r="16" />
                                                        <rect x="179" y="76" rx="5" ry="5" width="220" height="10" />
                                                        <rect x="179" y="58" rx="5" ry="5" width="220" height="10" />
                                                        <circle cx="21" cy="117" r="16" />
                                                        <rect x="45" y="104" rx="5" ry="5" width="220" height="10" />
                                                        <rect x="45" y="122" rx="5" ry="5" width="220" height="10" />
                                                    </ContentLoader>
                                                </>


                                            }


                                            {!stChatBoxIsFetching && stChatBoxMessageList.map(
                                                /**
                                                 * @param {ChatHistoryDTO} message
                                                 * @param index
                                                 */
                                                (message, index) => {
                                                return (
                                                    <ZaloChatBoxMessage
                                                        data={message}
                                                        key={message.mid + '_'+ message.messageTime}
                                                        nextMessage={stChatBoxMessageList[index-1]}
                                                        userAvatar={state.currentConversation.userAvatar}
                                                    />
                                                )
                                            })
                                            }
                                            {stChatBoxIsFetchingMore &&
                                                <div className="d-flex justify-content-center live-chat-chat-box__loading mt-3">
                                                    <Loading style={LoadingStyle.ELLIPSIS_GREY}
                                                    />
                                                </div>
                                            }
                                        </div>

                                    </div>

                                    {(!stChatBoxIsFetching && state.zaloUserId) && <div className="message-add-tag">
                                        <GSSocialTag
                                            hasOpenOrder={stShowOrder}
                                            assignedTags={stAssignedTags}
                                            tags={stTags}
                                            service={{
                                                save: saveSocialTag,
                                                remove: deleteSocialTag,
                                                assign: assignTag,
                                                revoke: revokeTag
                                            }}>
                                        </GSSocialTag>
                                    </div>
                                    }

                                    <GoSocialChatBoxFooter
                                        ref={refChatBoxFooter}
                                        onSendImage={onSendImage}
                                        onSendText={onSendText}
                                        onSendFile={onSendFile}
                                    />
                                </>

                            }
                        </div>
                        <div className={stShowOrder ? 'box_info showOrder' : 'box_info'}>
                            <OrderInZalo
                                showOrder={showOrder}
                                heightContent={heightContent}
                            />
                        </div>
                    </div>
                </GSContentBody>
            </GSContentContainer>
        </OrderInZaloContext.provider>
    </>
}

ZaloChatConversation.defaultProps = {}

ZaloChatConversation.propTypes = {}



export default ZaloChatConversation
