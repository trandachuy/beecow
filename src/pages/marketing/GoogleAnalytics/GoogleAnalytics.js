/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/01/2019
 * Author: Long Phan <email: dai.mai@mediastep.com>
 */

import React, {useEffect, useState} from 'react';
import './GoogleAnalytics.sass'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import GSButton from '../../../components/shared/GSButton/GSButton';
import {Trans} from 'react-i18next';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';

import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import i18next from 'i18next';
import {UikWidget, UikWidgetContent} from '../../../@uik'
import {AvField, AvForm} from 'availity-reactstrap-validation';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import GSContentFooter from '../../../components/layout/GSContentFooter/GSContentFooter';
import storeService from '../../../services/StoreService'
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {GSToast} from "../../../utils/gs-toast";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";

const GoogleAnalytics = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [onRedirect, setOnRedirect] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [gaCode, setGaCode] = useState('');

    useEffect(() => {
        if (!isSaving) {
            let promiseArr = [];
            promiseArr.push(storeService.getGACode());

            Promise.all(promiseArr).then(res => {
                const storeRes = res[0];
                setGaCode(storeRes.gaCode);
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            })
        }
    }, [isSaving]);

    const handleOnSaveSubmit = (event, errors, values) => {
        if (isSaving) return;
        let promiseArr = [];
        // save the GA first
        promiseArr.push(storeService.updateGACode({gaCode: values.gaCode}));

        // execute
        setIsSaving(true);
        Promise.all(promiseArr).then(() => {
            setIsSaving(false);
            openDialog(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t("common.message.update.successfully"))
        }).catch(() => {
            setIsSaving(false);
            GSToast.commonError()
        })
    };
    const openDialog = (type, message) => {
        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                setIsSaving(false);
                setOnRedirect(true);
            }
        })
    };
    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect} className="google-analytics" isSaving={isSaving}>
            {isLoading && <LoadingScreen/>}
            <GSContentHeader size={GSContentBody.size.LARGE} className="preference-header"
                             title={i18next.t("component.storefont.preference.ga.title")}>
                <HintPopupVideo title={'Google analytics'} category={'GOOGLE_ANALYTICS'}/>
                <GSButton success className="btn-save" onClick={() => this.refBtnSubmitForm.click()}>
                    <Trans i18nKey="common.btn.save" className="sr-only">Save</Trans>
                </GSButton>
            </GSContentHeader>

            <GSContentBody className="preference-content-body" size={GSContentBody.size.LARGE}>
                <AvForm onSubmit={(event, error, values) => handleOnSaveSubmit(event, error, values)}>
                    <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>

                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title title-customize">
                            <h3><Trans i18nKey="component.storefont.preference.ga.title">Google Analytics</Trans></h3>
                            <div style={{color: "#9EA0A5"}}>
                                <Trans i18nKey="component.storefont.preference.ga.more">
                                </Trans>
                            </div>
                        </section>
                        <UikWidgetContent className="preference-content-detail">
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0255]}
                                              wrapperDisplay={"block"}
                            >
                                <AvField
                                    label={<Trans i18nKey="component.storefont.preference.ga.code">Google Analytics Code
                                        - WEB</Trans>}
                                    name={'gaCode'}
                                    value={gaCode}
                                />
                            </PrivateComponent>
                        </UikWidgetContent>
                    </UikWidget>


                </AvForm>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
            </GSContentBody>
            <GSContentFooter>

            </GSContentFooter>
        </GSContentContainer>
    )
}

export default GoogleAnalytics;
