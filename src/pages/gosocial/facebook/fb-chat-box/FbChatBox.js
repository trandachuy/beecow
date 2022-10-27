import React, {useContext, useEffect, useRef, useState} from 'react';
import './FbChatBox.sass'
import PropTypes from "prop-types";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {FETCH_MODE_TYPE, FbMessengerContext} from "../context/FbMessengerContext";
import ContentLoader from "react-content-loader";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import {LiveChatService} from "../../../../services/LiveChatService";
import facebookService from "../../../../services/FacebookService";
import FbChatBoxMessageBubble from "./bubble/FbChatBoxMessageBubble";
import {CredentialUtils} from "../../../../utils/credential";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import FbEmojiSelector from "./emoji/FbEmojiSelector";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import {ImageUtils} from "../../../../utils/image";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {GSToast} from "../../../../utils/gs-toast";
import {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import _ from 'lodash'
import AssignStaff from "../../assign-staff/AssignStaff";
import GSSocialTag from '../../../../components/shared/GSSocialTag/GSSocialTag'
import GoSocialChatBoxFooter from "../../zalo/GoSocialChatBoxFooter/GoSocialChatBoxFooter.jsx";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import beehiveService from '../../../../services/BeehiveService';
import {DateTimeUtils} from '../../../../utils/date-time'



const FbChatBox = props => {
    const refChatBoxFooter = useRef(null);
    const refInputFile = useRef(null);
    const {state, dispatch}  = useContext(FbMessengerContext.context);
    const [isFetching, setIsFetching] = useState(true);
    const [stIsShowEmoji, setStIsShowEmoji] = useState(false);
    const [stLocation, setStLocation] = useState(i18next.t('page.livechat.conversation.chatlist.unknow'));
    const [stMessages, setStMessages] = useState({
        data: [],
        paging: {}
    });
    const [stLoadingMore, setStLoadingMore] = useState(false);
    const [stSendMessageProgress, setStSendMessageProgress] = useState('0');
    const [getIsChangeConversation, setIsChangeConversation] = useState(false);
    
    const [stFile, setStFile] = useState(null);
    const [stIsSending, setStIsSending] = useState(false);
    const fetchIntervalHandler = useRef(null);

    const [stAssignStaffId, setStAssignStaffId] = useState();
    const [stAssignStaffName, setStAssignStaffName] = useState();

    const [stCustomerAvatar, setStAvatar] = useState('');
    const [stSenders, setStSenders] = useState(null);


    const [stAssignedTags, setStAssignedTags] = useState([])
    const [stTags, setStTags] = useState([])
    const [stAssignedStaff, setStAssignedStaff] = useState([]);
    const [stShowOrder, setStShowOrder] = useState(false)
    const [stExpired, setStExpired] = useState(false)

    useEffect(() => {
        loadAllSocialTag();
        if (state.fetchMode === FETCH_MODE_TYPE.INTERVAL) {
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
        if (state.newOrderResponse) {
            appendNewMessage(state.newOrderResponse)
            dispatch(FbMessengerContext.actions.clearNewOrderResponse())
        }
    }, [state.newOrderResponse])


    useEffect(() => {
        facebookService.getFBUser(state.fbUserId).then(data => {
            setStAssignStaffId(data.staffId);
            setStAssignStaffName(data.staffName);
        });
        //setStAssignedTags([]);
        loadAssignedTag()
    }, [state.fbUserId])

    useEffect(() => {
        setStLoadingMore(false)
        if (state.currentConversation) {
            setIsChangeConversation(true)
            setIsFetching(true)
            setStIsShowEmoji(false)
            if(refChatBoxFooter && refChatBoxFooter.current){
                refChatBoxFooter.current.value = ''
            }
            const sender = state.currentConversation.senders.data[0]
            setStSenders(sender)
            setStAvatar(sender.profile_pic ? sender.profile_pic : "/assets/images/go-chat-default-avatar.png")
            fetchMessages()
        }
        return () => {};
    }, [state.currentConversation]);

    useEffect(() => {
        setStShowOrder(state.hasOpenOrder)
        return () => {
        }
    }, [state.hasOpenOrder])

    const fetchMessages = () => {
        if (state.currentConversation) {
            Promise.all([
                LiveChatService.getMessagesOfConversation(state.fbUserDetail.pageId, state.currentConversation.fbConversationId),
                facebookService.checkExpiredMessages(state.fbUserDetail.pageId, [state.currentConversation.fbConversationId])
            ])
                .then(([messagesObj, expireMessages]) => {
                    setStMessages(messagesObj)
                    setIsFetching(false)
                    setIsChangeConversation(false)

                    if (expireMessages.length) {
                        setStExpired(expireMessages[0].expired)
                    }
                }).catch(error => {
                    setIsChangeConversation(false)
                })
        }
    }

    const getAvatar = (response) => {
        if (response.data && response.data.url) {
            return response.data.url
        }
        return "/assets/images/go-chat-default-avatar.png";
    }

    const onClickLoadMore = () => {
        setStLoadingMore(true)
        LiveChatService.getMessagesOfConversation(state.fbUserDetail.pageId, state.currentConversation.fbConversationId, stMessages.paging.cursors.after)
            .then(messageObj => {
                setStMessages({
                    data: [...stMessages.data, ...messageObj.data],
                    paging: messageObj.paging
                })
                setStLoadingMore(false)
            })
    }



    const appendNewMessage = (message, withLoading = true) => {
        // append at top of list
        setStMessages({
            ...stMessages,
            data: [message, ...stMessages.data]
        })
        if (withLoading) setStSendMessageProgress('100-done')
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

    const assignCallback = (data) => {
        facebookService.assignFBUser(state.fbUserId, {
            staffId: data.id,
            staffIsSeller: data.staffIsSeller,
            staffName: data.name
        }).then(() => {
            setStAssignStaffId(data.id);
            setStAssignStaffName(data.name);
            props.loadListAssignedStaff();
        })
    }

    const unAssignCallback = () => {
        facebookService.unAssignFBUser(state.fbUserId).then(() => {
            setStAssignStaffId(undefined);
            setStAssignStaffName(undefined);
            props.loadListAssignedStaff();
        })
    }

    const loadAllSocialTag = async () => {
        try {
            const tags = await beehiveService.getAllFbSocialTag()
            setStTags(tags)
        } catch (error) {
            console.error(error);
        }
    }

    const loadAssignedTag = async () => {
        try {
            if(!state.fbUserId) return;
            const assignedTags = await beehiveService.getAssignedTagByfbUser(state.fbUserId);
            const assigned = (assignedTags)? assignedTags.map(t => t.fbUserTagInfoId):[];
            setStAssignedTags(assigned);
        } catch (error) {
            console.error(error);
        }
    }

    const onSendText = (message) => {
        if (message) {
            setStIsSending(true)
            setStIsShowEmoji(false)
            setStSendMessageProgress('50')

            LiveChatService.sendFBMessageCommon('text', message, stSenders.id, state.fbUserDetail.pageId)
                .then(result => {
                    if (result.error) {
                        setStSendMessageProgress('100-failed')
                    } else {
                        refChatBoxFooter.current.value = ''
                        setStSendMessageProgress('75')
                        appendNewMessage(result)
                    }

                    // mark read
                    LiveChatService.markReadAConversation(state.currentConversation.fbConversationId, 1).then(res => {}).catch(error => {})

                    setTimeout(() => {
                        setStIsSending(false)
                        setStSendMessageProgress('0')
                    }, 700)
                })
        }
        // reset after send completed
        refChatBoxFooter.current.reset()
    }

    const onSendFileCommon = (file, type) => {
        setStIsSending(true)
        setStSendMessageProgress('25')

        let domain = MediaServiceDomain.FILE;
        if("image" === type){
            domain = MediaServiceDomain.GENERAL;
        }
        
        mediaService.uploadFileWithDomain(file, domain)
            .then(imageObj => {
                const url = imageObj.urlPrefix + '/' + imageObj.name + '.' + imageObj.extension
                setStSendMessageProgress('50')
                LiveChatService.sendFBMessageCommon(type, url, stSenders.id, state.fbUserDetail.pageId).then(result => {
                    if (result.error) {
                        setStSendMessageProgress('100-failed')
                    } else {
                        setStSendMessageProgress('75')
                        setStFile(null)
                        refChatBoxFooter.current.value = null
                        appendNewMessage(result)
                    }

                    // mark read
                    LiveChatService.markReadAConversation(state.currentConversation.fbConversationId, 1).then(res => {}).catch(error => {})

                    setTimeout(() => {
                        setStIsSending(false)
                        setStSendMessageProgress('0')
                    }, 700)
                })
            })
    }

    const onSendImage = (file) => {
        onSendFileCommon(file, "image");
        // reset after send completed
        refChatBoxFooter.current.reset()
    }

    const onSendFile = (file) => {
        onSendFileCommon(file, "file")
        // reset after send completed
        refChatBoxFooter.current.reset()
    }


    const saveSocialTag = async (tag) => {
        const result  = await beehiveService.saveFbSocialTag(tag);
        return result;
    }

    const deleteSocialTag = async (tagId) => {
        const result  = await beehiveService.deleteFbSocialTag(tagId);
        return result;
    }

    const assignTag = async (tagId) => {
        const fbUserTag = {
            fbTagInfoId: tagId,
            fbUser: state.fbUserId
        };
        return await beehiveService.assignTagByfbUser(fbUserTag);
    }

    const revokeTag = async (tagId) => {
        const fbUserTag = {
            fbTagInfoId: tagId,
            fbUser: state.fbUserId
        };
        return await beehiveService.revokeTagByfbUser(fbUserTag);
    }
    
    const handleCallBackApi = () =>{
        loadAllSocialTag()
    }

    return (
      
        

        <div className="box_chat">

                {getIsChangeConversation && <ContentLoader
                    height={45}
                    width={150}
                    speed={1}
                    primaryColor="#f3f3f3"
                    secondaryColor="#ecebeb"
                    style={{
                        width: '300px',
                        height: '100px'
                    }}
                >
                    <rect x="552" y="-53" rx="10" ry="10" width="117" height="6" />
                    <circle cx="22" cy="22" r="22" />
                    <rect x="50" y="2" rx="5" ry="5" width="100" height="15" />
                    <rect x="50" y="30" rx="5" ry="5" width="80" height="12" />
                </ContentLoader>}

                    {!getIsChangeConversation && 
                    <>
                        {stSenders  &&
                            <div className='chat_header'>
                                <div className='chat_left'>
                                    <div className='chat_image'>
                                        <img src={stCustomerAvatar} width="40" height="40"/>
                                        <span className='ignore'></span>
                                    </div>
                                    <div className='chat_name'>
                                        <p className='name'>{stSenders.name}</p>
                                        <p className='status'>Seen</p>
                                    </div>
                                </div>

                                <div className='chat_right'>
                                    <AssignStaff assignCallback={assignCallback} unAssignCallback={unAssignCallback}
                                                assignStaffId={stAssignStaffId} assignStaffName={stAssignStaffName}/>
                                    {/*<img className='icon-mail-fb' src="/assets/images/icon_mail_fb.png"/>*/}
                                </div>
                            </div>
                        }

                        <div className='chat_content'>
                            <div className="messages flex-column-reverse d-flex">
                                {splitMessages(stMessages.data).map((message, index) => {
                                    return (
                                            <FbChatBoxMessageBubble
                                                data={message}
                                                key={message.mid}
                                                customerAvatar={stCustomerAvatar}
                                                nextMessage={stMessages.data[index-1]}
                                            />
                                        )
                                    })
                                }
                                {stMessages.paging?.cursors?.after &&
                                <>
                                    {!stLoadingMore &&
                                    <GSFakeLink className="text-center d-block" onClick={onClickLoadMore}>
                                        <GSTrans t={'page.livechat.conversation.chatbox.loadMore'}/>
                                    </GSFakeLink>
                                    }
                                    {stLoadingMore &&
                                    <div className="d-flex justify-content-center live-chat-chat-box__loading mt-3">
                                        <Loading style={LoadingStyle.ELLIPSIS_GREY}
                                        />
                                    </div>
                                    }
                                </>
                                }

                            </div>

                        </div>
                        

                        <div hidden={state.fbUserId? false: true} className="message-add-tag">
                            <GSSocialTag
                                key={state.fbUserDetail.pageId +"-"+ state.fbUserDetail.id}
                                hasOpenOrder={stShowOrder}
                                assignedTags={stAssignedTags}
                                tags={stTags}
                                service={{
                                    save: saveSocialTag,
                                    remove: deleteSocialTag,
                                    assign: assignTag,
                                    revoke: revokeTag
                                }}
                                callBackApi={handleCallBackApi}
                            >
                            </GSSocialTag>
                        </div>

                        <GoSocialChatBoxFooter
                            key={stExpired}
                            ref={refChatBoxFooter}
                            expired={stExpired}
                            onSendImage={onSendImage}
                            onSendText={onSendText}
                            onSendFile={onSendFile}
                        />
                    </>
}
        </div>
     

    );
};

FbChatBox.propTypes = {
    className: PropTypes.string,
    onToggleCustomerDetail: PropTypes.func,
    onInteraction: PropTypes.func,
    loadListAssignedStaff: PropTypes.func,
};

export default FbChatBox;
