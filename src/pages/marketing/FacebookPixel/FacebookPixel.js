/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/01/2019
 * Author: Long Phan <email: dai.mai@mediastep.com>
 */

import React, {useEffect, useState} from 'react';
import './FacebookPixel.sass';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import GSButton from '../../../components/shared/GSButton/GSButton';
import {Trans} from 'react-i18next';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';

import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import i18next from 'i18next';
import {UikWidget, UikWidgetContent} from '../../../@uik';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import facebookService from '../../../services/FacebookService';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import GSContentFooter from '../../../components/layout/GSContentFooter/GSContentFooter';
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {GSToast} from "../../../utils/gs-toast";
import {TokenUtils} from "../../../utils/token";
import {FormValidate} from "../../../config/form-validate";

const FacebookPixel = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [onRedirect, setOnRedirect] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [pixelId, setPixelId] = useState('');
    const [fbAppId, setFbAppId] = useState('');
    const [stFbAppConfig, setStFbAppConfig] = useState(null);

    useEffect(() => {
        if (!isSaving) {
            let promiseArr = [];
            promiseArr.push(facebookService.getPixelId());
            promiseArr.push(facebookService.getAppConfig())

            Promise.all(promiseArr).then(res => {
                const [fbRes2, fbAppConfig] = res;
                if (fbRes2) {
                    setPixelId(fbRes2.pixelId);
                    setFbAppId(fbRes2.appId);
                }

                if (fbAppConfig && fbAppConfig.enabledLogin && fbAppConfig.clientId) {
                    setStFbAppConfig(fbAppConfig)
                }

                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }, [isSaving]);

    const handleOnSaveSubmit = (event, errors, values) => {
        if (errors.length > 0) return;
        if (isSaving) return;

        let promiseArr = [];

        // update pixelId
        if (TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0253])) {
            promiseArr.push(facebookService.updatePixelId({pixelId: values.fbPixelId}));
        }
        if (TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0254])) {
            promiseArr.push(facebookService.updateAppId({appId: values.fbAppId}));
        }

        if (promiseArr.length > 0) {
            // execute
            setIsSaving(true);
            Promise.all(promiseArr).then(() => {
                openDialog(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t("common.message.update.successfully"));
            }).catch(() => {
                setIsSaving(false);
                GSToast.commonError();
            });
        }
    };

    const openDialog = (type, message) => {
        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                setIsSaving(false);
                setOnRedirect(true);
            }
        });
    };

    const customValidateAppId = (value, ctx, input, cb) => {
        /**
         * @type {AppConfigModel}
         */
        const fbAppConfig = stFbAppConfig
        if (fbAppConfig && value) { // has pixel config
            if (value !== fbAppConfig.clientId) {
                cb(i18next.t('page.marketing.pixel.appIdMustIsTheSameLoginAppId', {appId: fbAppConfig.clientId}))
            }
        }
        cb(true)
    }


    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect} className="facebook-pixel"
                            isSaving={isSaving}>
            {isLoading && <LoadingScreen/>}
            <GSContentHeader size={GSContentBody.size.LARGE} className="preference-header"
                             title={i18next.t("component.storefont.preference.pixel.title")}>
                <GSButton success className="btn-save" onClick={() => this.refBtnSubmitForm.click()}>
                    <Trans i18nKey="common.btn.save" className="sr-only">Save</Trans>
                </GSButton>
            </GSContentHeader>

            <GSContentBody className="preference-content-body" size={GSContentBody.size.LARGE}>
                <AvForm onSubmit={(event, error, values) => handleOnSaveSubmit(event, error, values)} autoComplete="off">
                    <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>

                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title title-customize">
                            <h3><Trans i18nKey="component.storefont.preference.pixel.title">Facebook Pixel</Trans></h3>
                            <div style={{color: "#9EA0A5"}}>
                                <Trans i18nKey="component.storefont.preference.pixel.more">
                                </Trans>
                            </div>
                        </section>
                        <UikWidgetContent className={'preference-content-detail'}>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0253]}
                                              wrapperDisplay={"block"}
                            >
                                <AvField
                                    name={'fbPixelId'}
                                    value={pixelId}
                                    label={<Trans i18nKey="component.storefont.preference.pixel.id">Facebook Pixel
                                        ID</Trans>}>
                                </AvField>
                            </PrivateComponent>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0254]}
                                              wrapperDisplay={"block"}
                            >
                                <AvField
                                    name={'fbAppId'}
                                    value={fbAppId}
                                    label={<Trans i18nKey="component.storefont.preference.app.id">Facebook App
                                        ID</Trans>}
                                    validate={{
                                        ...FormValidate.async(customValidateAppId)
                                    }}
                                >
                                </AvField>
                            </PrivateComponent>

                        </UikWidgetContent>
                    </UikWidget>

                </AvForm>
                <AlertModal ref={(el) => {
                    this.alertModal = el;
                }}/>
            </GSContentBody>
            <GSContentFooter>

            </GSContentFooter>
        </GSContentContainer>
    );
};

export default FacebookPixel;
