/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/01/2019
 * Author: Long Phan <email: dai.mai@mediastep.com>
 */

import React, {useEffect, useState} from 'react';
import './LiveChatConfiguration.sass'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import GSButton from '../../../components/shared/GSButton/GSButton';
import {Trans} from 'react-i18next';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';

import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import i18next from 'i18next';
import {UikToggle, UikWidget, UikWidgetContent} from '../../../@uik'
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {CredentialUtils} from '../../../utils/credential';
import AvFieldCountable from '../../../components/shared/form/CountableAvField/AvFieldCountable';
import facebookService from '../../../services/FacebookService';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import GSContentFooter from '../../../components/layout/GSContentFooter/GSContentFooter';
import Constants from '../../../config/Constant';
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import {GSToast} from "../../../utils/gs-toast";
import zaloService, {ZaloService} from "../../../services/ZaloService";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {cn} from "../../../utils/class-name";
import {FormValidate} from "../../../config/form-validate";
import CheckoutInfo from "../../setting/CheckoutInfo/CheckoutInfo";
import ListingWebsite from "../../setting/ListingWebsite/ListtingWebsite";
import MultipleCurrency from "../../setting/MultipleCurrency/multipleCurrency";

const LiveChatConfiguration = (props) => {
    const defaultFbChat = {
        pageId: undefined,
        storeId: CredentialUtils.getStoreId(),
        welcomeText: undefined,
        isDeleted: false
    };
    const defaultZaloChat = {
        pageId: undefined,
        storeId: CredentialUtils.getStoreId(),
        welcomeText: undefined,
        isDeleted: false
    };
    const [isSaving, setIsSaving] = useState(false);
    const [fbChat, setFbChat] = useState(defaultFbChat);
    const [zaloChat, setZaloChat] = useState(defaultZaloChat);
    const [fbLoginState, setFbLoginState] = useState({
        id: null,
        storeId: null,
        clientId: null,
        clientSecretKey: null,
        enabledLogin: null
    });
    const [isEnable, setIsEnable] = useState(false);
    const [isEnableZalo, setIsEnableZalo] = useState(false);
    const [onRedirect, setOnRedirect] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [stIsShowBelongingAnotherError, setStIsShowBelongingAnotherError] = useState(false);
    const [stIsShowBelongingAnotherErrorZalo, setStIsShowBelongingAnotherErrorZalo] = useState(false);
    const [stIsShowFbClientIdWarningMessage, setStIsShowFbClientIdWarningMessage] = useState(false);
    const [stPixelConfig, setStPixelConfig] = useState(null);

    useEffect(() => {
        if (!isSaving) {
            let promiseArr = []
            promiseArr.push(facebookService.getChatConfigByStoreId());
            promiseArr.push(zaloService.getChatConfigByStoreId());
            promiseArr.push(facebookService.getAppConfig());
            promiseArr.push(facebookService.getPixelId());

            Promise.all(promiseArr).then(res => {
                const [fbRes, zaloRes, fbAppConfigRes, pixelConfigRes] = res

                if (fbRes.length > 0) {
                    setResponseData(fbRes[0])
                }

                if (zaloRes.length > 0) {
                    setResponseDataZalo(zaloRes[0])
                }

                if (fbAppConfigRes) {
                    setFbLoginState(fbAppConfigRes)
                }

                if (pixelConfigRes) {
                    setStPixelConfig(pixelConfigRes)
                }

                setIsLoading(false);

            }).catch(() => {
                setIsLoading(false);
            })
        }
    }, [isSaving])



    const handleOnSaveSubmit = (event, errors, values) => {
        // validate
        if (fbLoginState.enabledLogin && (errors.includes('clientId') || errors.includes('clientSecretKey'))) {
            return
        }
        if (isSaving) return;

        let fbChatConfig = defaultFbChat;
        fbChatConfig.pageId = values.pageId ? values.pageId.replace(/\s/g, "") : "";//remove whiteSpace
        fbChatConfig.welcomeText = values.welcomeText ? values.welcomeText.trim() : ""
        fbChatConfig.isDeleted = !isEnable;

        if (isEnable) {
            if (!fbChatConfig.pageId || fbChatConfig.pageId.length > 50 || !fbChatConfig.welcomeText || fbChatConfig.welcomeText.length > 80) {
                return;
            }
        }

        let zaloChatConfig = defaultZaloChat;
        zaloChatConfig.pageId = values.pageIdZalo ? values.pageIdZalo.replace(/\s/g, "") : "";//remove whiteSpace
        zaloChatConfig.welcomeText = values.welcomeTextZalo ? values.welcomeTextZalo.trim() : ""
        zaloChatConfig.isDeleted = !isEnableZalo;

        if (isEnableZalo) {
            if (!zaloChatConfig.pageId || zaloChatConfig.pageId.length > 50 || !zaloChatConfig.welcomeText || zaloChatConfig.welcomeText.length > 80) {
                return;
            }
        }

        let promiseArr = [];

        // save facebook page
        if (fbChat.id) {
            fbChatConfig.id = fbChat.id;
            promiseArr.push(facebookService.updateChatConfig(fbChatConfig))
        } else {
            promiseArr.push(facebookService.saveChatConfig(fbChatConfig))
        }

        // save zalo page
        if (zaloChat.id) {
            zaloChatConfig.id = zaloChat.id;
            promiseArr.push(zaloService.updateChatConfig(zaloChatConfig))
        } else {
            promiseArr.push(zaloService.saveChatConfig(zaloChatConfig))
        }

        // save fb app config
        /**
         * @type {AppConfigModel}
         */
        const fbAppConfigRequest = {
            clientId: values.clientId || undefined,
            clientSecretKey: values.clientSecretKey || undefined,
            enabledLogin: fbLoginState.enabledLogin,
            storeId: CredentialUtils.getStoreId()
        }
        if (fbLoginState.id) {
            fbAppConfigRequest.id = fbLoginState.id
            promiseArr.push(facebookService.updateAppConfig(fbAppConfigRequest))
        } else {
            promiseArr.push(facebookService.createAppConfig(fbAppConfigRequest))
        }

        // execute
        setIsSaving(true);
        Promise.all(promiseArr).then(() => {
            setIsSaving(false);
            openDialog(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t("common.message.update.successfully"))
        }).catch(e => {
            if (e.response && e.response.data.errorKey === 'belonging.another') {
                setStIsShowBelongingAnotherError(true)
            }
            if (e.response && e.response.data.errorKey === 'belonging.another.zalo') {
                setStIsShowBelongingAnotherErrorZalo(true)
            }
            setIsSaving(false);
            GSToast.commonError()
        })


    }
    const enable = (e) => {
        setIsEnable(!isEnable);
        setOnRedirect(false);
    };

    const enableZalo = (e) => {
        setIsEnableZalo(!isEnableZalo);
        setOnRedirect(false);
    };

    const toggleFacebookLogin = (e) => {
        setFbLoginState(state => ({
            ...state,
            enabledLogin: !state.enabledLogin
        }))
        setOnRedirect(false);
    };

    const setResponseData = (data) => {
        setFbChat(data);
        setIsEnable(!data.isDeleted)
        setIsSaving(false)
    };

    const setResponseDataZalo = (data) => {
        setZaloChat(data);
        setIsEnableZalo(!data.isDeleted)
        setIsSaving(false)
    }

    const openDialog = (type, message) => {
        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                setIsSaving(false);
                setOnRedirect(true);
            }
        })
    }

    const customValidateClientId = (value, ctx, input, cb) => {
        /**
         * @type {PixelConfigModel}
         */
        const pixelConfig = stPixelConfig
        let isError = false
        if (pixelConfig && pixelConfig.appId && value) { // has pixel config
            if (value !== pixelConfig.appId) {
                cb(i18next.t('page.preference.fb.mustIsTheSamePixelId', {appId: pixelConfig.appId}))
                isError = true
            }
        }
        cb(true)

        if (!isError && fbLoginState.clientId && value && fbLoginState.clientId !== value) {
            setStIsShowFbClientIdWarningMessage(true)
        } else {
            setStIsShowFbClientIdWarningMessage(false)
        }
    }

    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect} className="live-chat-configuration"
                            isSaving={isSaving}>
            {isLoading && <LoadingScreen/>}
            <GSContentHeader size={GSContentBody.size.LARGE} className="preference-header"
                             title={i18next.t("component.navigation.liveChat.configuration")}>
                <GSButton success className="btn-save" onClick={() => this.refBtnSubmitForm.click()}>
                    <Trans i18nKey="common.btn.save" className="sr-only">Save</Trans>
                </GSButton>
            </GSContentHeader>
            {/*FACEBOOK CHAT*/}
            <GSContentBody className="preference-content-body" size={GSContentBody.size.LARGE}>
                <AvForm onSubmit={(event, error, values) => handleOnSaveSubmit(event, error, values)} autoComplete="off">
                    <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>
                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                      wrapperDisplay={"block"}
                    >
                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title title-customize">
                            <div className="title-with-button">
                                <h3><Trans i18nKey="component.storefont.preference.title">Messenger Chat Bubble</Trans>
                                </h3>
                                <UikToggle checked={isEnable} onChange={(e) => enable(e)}/>
                            </div>
                            <div style={{color: "#9EA0A5"}}>
                                <Trans i18nKey="component.storefont.preference.more">
                                </Trans>
                            </div>

                        </section>
                        <UikWidgetContent
                            className={['preference-content-detail', !isEnable ? "invisible" : ""].join(' ')}>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0106]}
                                              wrapperDisplay={"block"}
                            >
                                <AvField name={'pageId'} value={fbChat.pageId}
                                         label={<Trans i18nKey="component.storefont.preference.facebook.page.id">Facebook
                                             page id</Trans>}
                                         validate={{
                                             ...props.validate,
                                             required: {
                                                 value: true,
                                                 errorMessage: i18next.t("common.validation.required")
                                             },
                                             maxLength: {
                                                 value: 50,
                                                 errorMessage: i18next.t("common.validation.char.max.length", {x: 50})
                                             }
                                         }}>
                                </AvField>
                                {stIsShowBelongingAnotherError &&
                                <AlertInline type={AlertInlineType.ERROR}
                                             textAlign={'left'}
                                             nonIcon
                                             text={i18next.t('page.preference.fb.belongingAnotherError')}
                                             className="p-0 pb-2"
                                />
                                }
                                <AvFieldCountable
                                    label={<Trans i18nKey="component.storefont.preference.facebook.welcome.text">Welcome
                                        Text</Trans>}
                                    name={'welcomeText'}
                                    type={'textarea'}
                                    isRequired={true}
                                    minLength={0}
                                    maxLength={80}
                                    rows={3}
                                    value={fbChat.welcomeText}
                                />
                            </PrivateComponent>
                        </UikWidgetContent>
                    </UikWidget>
                    {/*ZALO CHAT*/}
                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title title-customize">
                            <div className="title-with-button">
                                <h3><Trans i18nKey="component.storefont.preference.zalo.title">Zalo Chat Bubble</Trans>
                                </h3>
                                <UikToggle checked={isEnableZalo} onChange={(e) => enableZalo(e)}/>
                            </div>
                            <div style={{color: "#9EA0A5"}}>
                                <Trans i18nKey="component.storefont.preference.zalo.more">
                                </Trans>
                            </div>

                        </section>
                        <UikWidgetContent
                            className={['preference-content-detail', !isEnableZalo ? "invisible" : ""].join(' ')}>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0106]}
                                              wrapperDisplay={"block"}
                            >
                                <AvField name={'pageIdZalo'} value={zaloChat.pageId}
                                         label={<Trans i18nKey="component.storefont.preference.zalo.id">Zalo id</Trans>}
                                         validate={{
                                             ...props.validate,
                                             required: {
                                                 value: true,
                                                 errorMessage: i18next.t("common.validation.required")
                                             },
                                             maxLength: {
                                                 value: 50,
                                                 errorMessage: i18next.t("common.validation.char.max.length", {x: 50})
                                             }
                                         }}>
                                </AvField>
                                {stIsShowBelongingAnotherErrorZalo &&
                                <AlertInline type={AlertInlineType.ERROR}
                                             textAlign={'left'}
                                             nonIcon
                                             text={i18next.t('page.preference.zalo.belongingAnotherError')}
                                             className="p-0 pb-2"
                                />
                                }
                                <AvFieldCountable
                                    label={<Trans i18nKey="component.storefont.preference.zalo.welcome.text">Welcome
                                        Text</Trans>}
                                    name={'welcomeTextZalo'}
                                    type={'input'}
                                    isRequired={true}
                                    minLength={0}
                                    maxLength={80}
                                    rows={3}
                                    value={zaloChat.welcomeText}
                                />
                            </PrivateComponent>
                        </UikWidgetContent>
                    </UikWidget>

                    {/*FACEBOOK LOGIN*/}
                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title title-customize">
                            <div className="title-with-button">
                                <h3><GSTrans t="page.storeFront.preferences.enableFacebookLogin"/></h3>
                                <UikToggle checked={fbLoginState.enabledLogin} onChange={toggleFacebookLogin}/>
                            </div>
                            <div style={{color: "#9EA0A5"}}>
                                <GSTrans t="page.storeFront.preferences.facebookLoginHint"/>
                            </div>

                        </section>
                        <UikWidgetContent
                            className={cn('preference-content-detail', {'invisible': !fbLoginState.enabledLogin})}>
                            {/*<PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0106]}*/}
                            {/*                  wrapperDisplay={"block"}*/}
                            {/*>*/}
                            <AvField name={'clientId'} value={fbLoginState.clientId}
                                     label={<>
                                         <GSTrans t="page.storeFront.preferences.clientId"/>

                                     </>}
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.maxLength(100),
                                         ...FormValidate.async(customValidateClientId)

                                     }}
                            >
                            </AvField>
                            {stIsShowFbClientIdWarningMessage &&
                                <AlertInline textAlign="left"
                                             type={AlertInlineType.WARN}
                                             padding={false}
                                             style={{
                                                 marginTop: '-12px',
                                                 marginBottom: '1rem'
                                             }}
                                             text={i18next.t('page.storeFront.preferences.clientIdWarning')}
                                />
                            }


                            <AvField name={'clientSecretKey'} value={fbLoginState.clientSecretKey}
                                     label={i18next.t('page.storeFront.preferences.clientSecretKey')}
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.maxLength(100),
                                     }}>
                            </AvField>
                            {/*</PrivateComponent>*/}
                        </UikWidgetContent>
                    </UikWidget>
                    </PrivateComponent>

                    {/*CHECK OUT*/}
                    <CheckoutInfo/>

                    {/*Multiple Currency*/}
                    <MultipleCurrency/>
                    
                    {/*LISTING WEBSITE*/}
                    <ListingWebsite/>

                </AvForm>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
            </GSContentBody>
            <GSContentFooter>
                <GSLearnMoreFooter
                    text={i18next.t("component.storefont.preference.facebook.learn.more")}
                    linkTo={Constants.UrlRefs.LEARN_MORE_FIND_FACEBOOK_ID}/>
            </GSContentFooter>
        </GSContentContainer>
    )
}

export default LiveChatConfiguration;
