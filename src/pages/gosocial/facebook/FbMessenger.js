import React, {useEffect, useReducer, useState, useRef} from 'react';
import './FbMessenger.sass'
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {FETCH_MODE_TYPE, FbMessengerContext} from "./context/FbMessengerContext";
import FbUserChatList from "./fb-user-chat/FbUserChatList";
import FbChatBox from "./fb-chat-box/FbChatBox";
import OrderInFacebook from "./OrderInFacebook/OrderInFacebook";
import FbSellerPage from "./fb-seller-page/FbSellerPage";
import {CredentialUtils} from "../../../utils/credential";
import {LiveChatService} from "../../../services/LiveChatService";
import facebookService from "../../../services/FacebookService";
import {GSToast} from "../../../utils/gs-toast";
import {useWebSocket} from "../../../utils/hooks/useWebSocket";
import beehiveService from "../../../services/BeehiveService";
import Constants from "../../../config/Constant";


const FbMessenger = props => {
    const [state, dispatch] = useReducer(FbMessengerContext.reducer, FbMessengerContext.initState);
    const [stIsFetchingPage, setStIsFetchingPage] = useState(false);
    const [stIsShowCustomerDetail, setStIsShowCustomerDetail] = useState(false);

    const [stListPageChat, setStListPageChat] = useState([]);
    const [getListAssignedStaff, setListAssignedStaff] = useState([]);
    const [getListAssignedTags, setListAssignedTags] = useState([]);

    const [heightContent, setHeightContent] = useState(0);
    const elementRef = useRef(null);
    const [stShowOrder, setStShowOrder] = useState(false);

    const[getIsGettingPageChat, setIsGettingPageChat] = useState(true);
    const[getIsGettingAssignedStaff, setIsGettingAssignedStaff] = useState(true);

    // WEBSOCKET
    const [wsConnect, wsSubscribe, wsDisconnect] = useWebSocket(process.env.FB_WEBSOCKET_BASE_URL, 5000)

    useEffect(() => {
        // request get page chat
        getRequestToPageChat();

        // reqest get assign staff

        getAssignedStaff();
        getAssignedTags();
    }, []);

    useEffect(() => {
        // only calculate the height when load done all data
        if(getIsGettingPageChat === false && getIsGettingAssignedStaff === false){
            setHeightWidgetContent();
        }
    }, [getIsGettingPageChat, getIsGettingAssignedStaff]);


    useEffect(() => {
        if (state.fetchMode === FETCH_MODE_TYPE.REALTIME) {
            wsConnect()
                .then(() => {
                    wsSubscribe(`/messenger/store/${CredentialUtils.getStoreId()}`, msg => {
                        let event = JSON.parse(msg.body);
                        dispatch(FbMessengerContext.actions.evtMsgFromSender({
                            senderId: event.userPage,
                            messageId: event.mid,
                            timestamp: event.messageTime,
                            messageObject: event}))
                    })
                })

        }
        return () => {
            wsDisconnect()
        };
    }, [state.fetchMode]);

    const setHeightWidgetContent = () => {
        const heightHeader = elementRef.current.clientHeight;
        const heightContainer = window.innerHeight;
        const heightContent = heightContainer - heightHeader - 77;
        setHeightContent(heightContent)
    }

    const getRequestToPageChat = () => {
        facebookService.getRequestToPageChat().then((result) => {
            setStListPageChat(result)
            setIsGettingPageChat(false)

            // set default page chat
            if(result && result.length > 0){
                dispatch(FbMessengerContext.actions.setfbUserDetail(result[0]))
                localStorage.setItem(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_ID, result[0].pageId);
            }
        }).catch((error) => {
            GSToast.commonError()
            setIsGettingPageChat(false)
        })
    }

    const getAssignedStaff = () => {
        facebookService.loadAssignedStaffByFbUser().then(res => {
            setListAssignedStaff(res);
            setIsGettingAssignedStaff(false)
        }).catch(error => {
            GSToast.commonError()
            setIsGettingAssignedStaff(false)
        })
    }

    const getAssignedTags = async () => {
        try {
            const data = await beehiveService.getAllFbUserTagByStore()
            setListAssignedTags(data)
        } catch (error) {
            console.error(error)
        }
    }

    const loadAssignedStaffByFbUsers = async () => {
        try {
            const data = await facebookService.loadAssignedStaffByFbUser()
            setListAssignedStaff(data)
        } catch (error) {
            console.error(error)
        }
    }

    const showOrder = () =>{
        setStShowOrder(isShow=>!isShow)
    }

    const onToggleCustomerDetail = () => {
        setStIsShowCustomerDetail(!stIsShowCustomerDetail)
    }

    return (
        <FbMessengerContext.provider value={{state, dispatch}}>
            <GSContentContainer className="facebook_messenger" isLoading={stIsFetchingPage}>
                <GSContentBody size={GSContentBody.size.MAX} className="facebook_body">
                    {getIsGettingPageChat === false && getIsGettingAssignedStaff === false &&
                        <>
                            {/* SELLER SELECT PAGE HERE */}
                            <div className="widget_header" ref={elementRef} >
                                <FbSellerPage className="fb-seller-page" listPageChat={stListPageChat}/>
                            </div>
                            
                            <div className="widget_content" style={{height : heightContent }}>
                                {/* USER LIST */}
                                <FbUserChatList 
                                    assignedStaff={getListAssignedStaff}
                                    assignedTags={getListAssignedTags}
                                    showOrder = {stShowOrder}
                                />


                                {/* CHAT BOX HERE */}
                                <FbChatBox className="fb-conversation__chat-box"
                                                loadListAssignedStaff={loadAssignedStaffByFbUsers}
                                                onToggleCustomerDetail={onToggleCustomerDetail}/>

                                {/* ORDER AND CUSTOMER HERE */}
                                <div className={stShowOrder ? "box_info showOrder" : "box_info"}>
                                    <OrderInFacebook
                                        showOrder = {showOrder}
                                        heightContent = {heightContent}
                                    />
                                </div>
                            </div>
                        </>
                    }
                </GSContentBody>
            </GSContentContainer>
        </FbMessengerContext.provider>

    );
};

FbMessenger.propTypes = {

};

export default FbMessenger;
