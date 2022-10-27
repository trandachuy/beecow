/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import facebookService from "../../../services/FacebookService";
import {GSToast} from "../../../utils/gs-toast";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import i18next from "i18next";
import './LiveChatIntro.sass'
import {Label} from 'reactstrap';
import {Redirect} from "react-router-dom";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {CredentialUtils} from "../../../utils/credential";
import {AgencyService} from "../../../services/AgencyService";

const REQUEST_STATUS = {
    NOT_REQUEST: 'NOT_REQUEST',
    WATING_FOR_APPROVE: 'WATING_FOR_APPROVE',
    APPROVED: 'APPROVED',
}

const LiveChatIntro = props => {
    const refSubmit = useRef(null);
    const refShowComfirm = useRef(null);

    const [stPageUrl, setStPageUrl] = useState('');
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stIsRequested, setStIsRequested] = useState(REQUEST_STATUS.NOT_REQUEST);

    useEffect( () => {
        setStIsProcessing(true)

        facebookService.getRequestToUseChatOldVersion().then(result => {
            setStIsProcessing(false)


            if(result.usingStatus === 'APPROVED'){
                CredentialUtils.setLiveChatPageId(result['pageId'])
                CredentialUtils.setLiveChatPageAccessToken(result['pageToken'])
                CredentialUtils.setLiveChatAppSecretProof(result['appSecretProof'])
                setStIsRequested(REQUEST_STATUS.APPROVED)
            }else if(result.usingStatus === 'WAITING_FOR_APPROVE'){
                setStIsRequested(REQUEST_STATUS.WATING_FOR_APPROVE)
            }

        }).catch(e => {
            setStIsProcessing(false)
            setStIsRequested(REQUEST_STATUS.NOT_REQUEST)
            // if(e.response.status !== 404){
            //     GSToast.commonError()
            // }
        })

    },[])

    const onClickBtnAuthen = () => {
        refSubmit.current.click()
    }

    const handleValidSubmit = (event, value) => {
        setStIsProcessing(true)

        const requestBody = {
            fbPageUrl: value.pageURL
        }

        facebookService.requestToUseChat(requestBody).then(res => {
            setStIsProcessing(false)

            // show popup here
            refShowComfirm.current.openModal({
                type: AlertModalType.ALERT_TYPE_OK,
                messages: (<GSTrans t="page.livechat.intro.page.modal.request_success">
                    Authentification in progress. Our team will contact you within <strong>24 hours</strong> to assist you.
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
            let path = NAV_PATH.liveChat.PATH_LIVE_CHAT_CONVERSATION;
            return <Redirect to={{pathname: path}}/>;
        } else {
            return <GSContentContainer className="live-chat-intro" isLoading={stIsProcessing}>
                <AlertModal ref={refShowComfirm}/>
                <GSContentBody size={GSContentBody.size.LARGE} className="notification-intro__body">
                    <div className="row mb-4">
                        <div className="col-12 col-md-6 notification-intro__left-col">
                            <div className="notification-intro__title">
                                Facebook
                            </div>
                            <div className="notification-intro__description">
                                <GSTrans t="page.livechat.intro.message" values={{provider: AgencyService.getDashboardName(),xxx: CredentialUtils.textStoreXxxOrGo()}}/>
                            </div>

                            {
                                stIsRequested === REQUEST_STATUS.NOT_REQUEST &&
                                <>
                                    <div className="notification-intro__description">
                                        <GSTrans t="page.livechat.intro.page.description"/>
                                    </div>
                                    <div className="request-page__url">
                                        <Label className="gs-frm-input__label">
                                            <GSTrans t="page.livechat.intro.page.title"/>
                                        </Label>
                                        <AvForm onValidSubmit={handleValidSubmit}>
                                            <button ref={refSubmit} hidden/>
                                            <AvField
                                                name={'pageURL'}
                                                className="input-page__url"
                                                value={stPageUrl}
                                                validate={{
                                                    required: {
                                                        value: true,
                                                        errorMessage: i18next.t('common.validation.required')
                                                    }
                                                }}
                                                placeholder={"https://www.facebook.com/your-shop-246457583455"}
                                            />
                                        </AvForm>
                                    </div>
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

                <GSLearnMoreFooter text={i18next.t("title.[/live-chat/facebook/intro]")}
                                   linkTo={'https://huongdan.gosell.vn/faq_category/gochat-goweb/'}
                                   marginTop marginBottom/>
            </GSContentContainer>
        }
    }

    return (
        <>
            <RenderRequest/>
        </>
    );
};

LiveChatIntro.propTypes = {

};

export default LiveChatIntro;
