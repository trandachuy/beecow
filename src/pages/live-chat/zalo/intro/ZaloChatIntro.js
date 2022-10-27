/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {Redirect} from "react-router-dom";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {CredentialUtils} from "../../../../utils/credential";
import zaloService from "../../../../services/ZaloService";
import './ZaloChatIntro.sass'
import {RouteUtils} from "../../../../utils/route";

const REQUEST_STATUS = {
    NOT_REQUEST: 'NOT_REQUEST',
    WATING_FOR_APPROVE: 'WATING_FOR_APPROVE',
    APPROVED: 'APPROVED',
}

const ZaloChatIntro = props => {
    const refSubmit = useRef(null);
    const refShowComfirm = useRef(null);

    const [stPageUrl, setStPageUrl] = useState('');
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stIsRequested, setStIsRequested] = useState(REQUEST_STATUS.NOT_REQUEST);

    useEffect( () => {
        setStIsProcessing(true)

        zaloService.getStoreChatConfig()
            .then(store => {
                setStIsProcessing(false)

                const {oaId, accessToken} = store

                CredentialUtils.setZaloPageId(oaId)
                CredentialUtils.setZaloPageAccessToken(accessToken)
                setStIsRequested(REQUEST_STATUS.APPROVED)

        }).catch(e => {
            setStIsProcessing(false)
            setStIsRequested(REQUEST_STATUS.NOT_REQUEST)
            // if(e.response.status !== 404){
            //     GSToast.commonError()
            // }
        })

    },[])

    const onClickBtnAuthen = () => {

        // open zalo authenticate
        zaloService.requestPermission()
            .then(result => {
                // redirect to conversations
                RouteUtils.redirectWithoutReload(props, NAV_PATH.liveChat.PATH_ZALO_CHAT_CONVERSATION)
            })
            .catch(e => {
                GSToast.commonError()
            })
    }

    const handleValidSubmit = (event, value) => {
        setStIsProcessing(true)

        const requestBody = {
            fbPageUrl: value.pageURL
        }

        zaloService.requestToUseChat(requestBody).then(res => {
            setStIsProcessing(false)

            // show popup here
            refShowComfirm.current.openModal({
                type: AlertModalType.ALERT_TYPE_OK,
                messages: (<GSTrans t="page.livechat.intro.page.modal.request_success">
                    Authentication in progress. Our team will contact you within <strong>24 hours</strong> to assist you.
                </GSTrans>),
                closeCallback: () => {
                    setStIsRequested(REQUEST_STATUS.WATING_FOR_APPROVE)
                }
            })

        }).catch( e => {
            setStIsProcessing(false)
            GSToast.commonError()
        })
    }

    const RenderRequest = () => {
        if (stIsRequested === REQUEST_STATUS.APPROVED) {
            let path = NAV_PATH.liveChat.PATH_ZALO_CHAT_CONVERSATION;
            return <Redirect to={{pathname: path}}/>;
        } else {
            return <GSContentContainer className="zalo-chat-intro" isLoading={stIsProcessing}>
                <AlertModal ref={refShowComfirm}/>
                <GSContentBody size={GSContentBody.size.LARGE} className="notification-intro__body">
                    <div className="row mb-4">
                        <div className="col-12 col-md-6 notification-intro__left-col">
                            <div className="notification-intro__title">
                                Zalo ID
                            </div>
                            <div className="notification-intro__description">
                                <GSTrans t="page.gosocial.fb.intro.message.zalo" values={{xxx:CredentialUtils.textStoreXxxOrGo()}}/>
                                <a href="https://oa.zalo.me/" target="_blank" rel="noopener noreferrer" >https://oa.zalo.me</a>
                            </div>

                            {
                                stIsRequested === REQUEST_STATUS.NOT_REQUEST &&
                                <>
                                    <div>
                                        <GSButton success onClick={onClickBtnAuthen}>
                                            <GSTrans t={"page.livechat.intro.btn.authenticate"}/>
                                        </GSButton>
                                    </div>
                                </>
                            }

                            {
                                stIsRequested === REQUEST_STATUS.WATING_FOR_APPROVE &&
                                <b>
                                    <GSTrans t="page.livechat.intro.page.modal.request_success">
                                        Authentification in progress. Our team will contact you within 24 hours to assist
                                        you.
                                    </GSTrans>
                                </b>
                            }

                        </div>
                        <div className="col-12 col-md-6 notification-intro__right-col">
                            <div className="notification-intro__background">

                            </div>
                        </div>
                    </div>
                </GSContentBody>

                {/*<GSLearnMoreFooter text={i18next.t("title.[/live-chat/intro]")}*/}
                {/*                   linkTo={'https://www.notion.so/b380a122895843258f4df9eb98a739ca'}*/}
                {/*                   marginTop marginBottom/>*/}
            </GSContentContainer>
        }
    }

    return (
        <>
            <RenderRequest/>
        </>
    );
};

ZaloChatIntro.propTypes = {

};

export default ZaloChatIntro;
