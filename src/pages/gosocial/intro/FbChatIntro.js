/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import './FbChatIntro.sass'
import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import facebookService from "../../../services/FacebookService";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import i18next from "i18next";
import GSImg from "../../../components/shared/GSImg/GSImg";
import {CredentialUtils} from "../../../utils/credential";
import {RouteUtils} from "../../../utils/route";
import {NavigationPath} from "../../../config/NavigationPath";
import {AgencyService} from '../../../services/AgencyService'

const REQUEST_STATUS = {
    NOT_REQUEST: 'NOT_REQUEST',
    WATING_FOR_APPROVE: 'WATING_FOR_APPROVE',
    APPROVED: 'APPROVED',
}

/**
 * pages_messaging: subscribe webhook for messaging
 * pages_manage_metadata: get all subscribe webhook of a page
 * pages_read_engagement: get content posted by your Page. Get names, PSIDs, and profile pictures of your Page followers. Get metadata about your Page.
 * page_manage_posts: publish a post, photo, or video to your Page. Update a post, photo, or video on your Page. Delete a post, photo, or video on your Page.
 * pages_read_user_content: get user generated content on your Page. Get posts that your Page is tagged in. Delete comments posted by users on your Page.
 * pages_manage_engagement: publish a post, photo, or video to your Page. Update a post, photo, or video on your Page. Delete a post, photo, or video on your Page.
 * pages_user_locale: get locale of user profile
 * pages_user_timezone: get timezone of user profile
 * pages_user_gender: get gender of user profile
 */
export const PERMISSION_SCOPE_REQUEST = ''
    + 'public_profile,'
    + 'email,'
    + 'pages_show_list,'
    + 'pages_messaging,'
    + 'pages_manage_metadata,'
    + 'pages_read_engagement,'
    + 'pages_manage_posts,'
    + 'pages_read_user_content,'
    + 'pages_manage_engagement,'
    // + 'pages_user_locale,'
    // + 'pages_user_timezone,'
    // + 'pages_user_gender'

const FbChatIntro = props => {
    const refShowComfirm = useRef(null);

    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stIsSaving, setStIsSaving] = useState(false);

    const handleSavedPages = (pageList) => {
        RouteUtils.redirectWithoutReload(props, NavigationPath.goSocial.PATH_GOSOCIAL_CONFIGURATION)
    }

    useEffect(() => {
        setStIsProcessing(true)

        const isExistGoSocial = CredentialUtils.getIsExistGoSocial()

        if (isExistGoSocial) {
            const isFbChatLogin = CredentialUtils.getFbChatLogin()?.isLogged

            if (isFbChatLogin) {
                facebookService.getSavedPageList()
                    .then(handleSavedPages)
                    .finally(() => setStIsProcessing(false))
            } else {
                setStIsProcessing(false)
            }
        } else {
            const isOldGoSocialMenu = CredentialUtils.getIsOldGoSocialMenu()

            if (isOldGoSocialMenu) {
                RouteUtils.toNotFound(props)
                return
            }

            setStIsProcessing(false)
        }
    }, [])

    const onClickConnect = () => {
        window.FB.login(function (response) {
            if (response.status === 'connected') {
                const token = response.authResponse.accessToken
                const userID = response.authResponse.userID
                obtainsFacebookPages(token, userID)
            }
        }, {
            scope: PERMISSION_SCOPE_REQUEST
        });
    }

    const obtainsFacebookPages = (accessToken, fbUserId) => {
        setStIsSaving(true)
        facebookService.addPageToConnectionList(accessToken, fbUserId)
            .then(handleSavedPages)
            .finally(() => {
                setStIsSaving(false)
            })
    }

    return (
        <GSContentContainer className="fb-chat-intro" isLoading={stIsProcessing} isSaving={stIsSaving}>
            <AlertModal ref={refShowComfirm}/>
            <GSContentBody size={GSContentBody.size.LARGE} className="notification-intro__body">
                <div className="row mb-4">
                    <div className="col-12 col-md-6 notification-intro__left-col">
                        <div className="notification-intro__title">
                            <GSTrans t='page.gosocial.fb.intro.header' values={{x:CredentialUtils.textStoreXxxOrGo()}}/>
                        </div>
                        <div className="notification-intro__description">
                            <GSTrans t="page.gosocial.fb.intro.message" values={{x:CredentialUtils.textStoreXxxOrGo()}}/>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.gosocial.fb.intro.content1",{provider:AgencyService.getDashboardName()})}</p>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.gosocial.fb.intro.content2")}</p>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.gosocial.fb.intro.content3")}</p>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.gosocial.fb.intro.content4")}</p>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.gosocial.fb.intro.content5")}</p>
                        </div>
                        <div className='btn-connect' onClick={onClickConnect}>
                            <GSImg src='/assets/images/gosocial/fb.svg'/>
                            <span className='ml-3'><GSTrans t='page.gosocial.fb.intro.connect'/></span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 notification-intro__right-col">
                        <div className="notification-intro__background"/>
                    </div>
                </div>
            </GSContentBody>
            
            <GSLearnMoreFooter text={i18next.t("title.[/live-chat/facebook/intro]")}
                               linkTo={'https://huongdan.gosell.vn/faq_category/gochat-goweb/'}
                               marginTop marginBottom/>
        </GSContentContainer>
    );
};

FbChatIntro.propTypes = {};

export default FbChatIntro;
