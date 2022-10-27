/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/01/2019
 * Author: Long Phan <email: dai.mai@mediastep.com>
 */

import React, {useEffect, useState} from 'react';
import './GoogleShopping.sass';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import GSButton from '../../../components/shared/GSButton/GSButton';
import {Trans} from 'react-i18next';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';

import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import i18next from 'i18next';
import {UikWidget, UikWidgetContent} from '../../../@uik';
import {AvForm} from 'availity-reactstrap-validation';
import AvFieldCountable from '../../../components/shared/form/CountableAvField/AvFieldCountable';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import storeService from '../../../services/StoreService';
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {GSToast} from "../../../utils/gs-toast";
import {ZaloService} from "../../../services/ZaloService";
import {ItemService} from '../../../services/ItemService';
import ModalItemSelection from './ModalItemSelection/ModalItemSelection';
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import GSSocialTagStatus from '../../../components/shared/GSSocialTag/GSSocialTagStatus';
import GSSocialStaffFilter from '../../gosocial/zalo/FilterStaffZalo/FilterStaffZalo';

const GoogleShopping = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [gvVerify, setGvVerify] = useState({htmlTag: ""});
    const [onRedirect, setOnRedirect] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [stLoadingExportAll, setStLoadingExportAll] = useState(false);
    const [stLoadingExportSpecify, setStLoadingExportSpecify] = useState(false);
    const [stOpenSelectItem, setStOpenSelectItem] = useState(false);

    useEffect(() => {
        if (!isSaving) {
            let promiseArr = [];
            promiseArr.push(storeService.getGVTag());

            Promise.all(promiseArr).then(res => {
                const gvTag = res[0];
                setGvVerify({htmlTag: gvTag});
                setIsLoading(false);
            }).catch(e => {
                setIsLoading(false);
            });
        }
    }, [isSaving]);

    const handleOnSaveSubmit = (event, errors, values) => {
        if (isSaving) return;
        storeService.updateGVTag(values.gvHtmlTag).then(() => {
            setIsSaving(false);
            openDialog(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t("common.message.update.successfully"));
        }).catch((hr) => {
            const {detail} = hr.response.data;
            const msgKey = detail || "common.api.failed";
            setIsSaving(false);
            GSToast.error(msgKey, true);
        });
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

    const onExportAll = () => {
        setStLoadingExportAll(true);
        setIsLoading(true);
        //export all products for gg smart shopping format
        ItemService.exportProducts().then((result) => {
            const fileName = (new Date()).toJSON().replace(/-|:|\./gi,"").slice(0, -1) + ".rss";
            let blob = new Blob([result.data], {"type":"text/xml"});
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function() { URL.revokeObjectURL(link.href); }, 1500); 
        }).catch((e) => {
            console.log(e);
            GSToast.commonError();
        }).finally(() => {
            setStLoadingExportAll(false);
            setIsLoading(false);
        });
    }

    const onExportSpecify = (items) => {
        console.debug(items);
        const values = items.map(item => {
            let modelId = (item.modelId && item.modelId.length > 0)? ("-" +item.modelId):"";
            return (item.itemId + modelId);
        })
        setStOpenSelectItem(false);
        setStLoadingExportSpecify(true);
        setIsLoading(true);
        //export all products for gg smart shopping format
        ItemService.exportProducts(values).then((result) => {
            const fileName = (new Date()).toJSON().replace(/-|:|\./gi,"").slice(0, -1) + ".rss";
            let blob = new Blob([result.data], {"type":"text/xml"});
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function() { URL.revokeObjectURL(link.href); }, 1500); 
        }).catch((e) => {
            console.log(e);
            GSToast.commonError();
        }).finally(() => {
            setStLoadingExportSpecify(false);
            setIsLoading(false);
        });
    }

    const toggleSelectItemModal = () => {
        setStOpenSelectItem(!stOpenSelectItem);
    }

    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect} className="google-shopping"
                            isSaving={isSaving}>
            {isLoading && <LoadingScreen/>}
            <GSContentHeader size={GSContentBody.size.LARGE} className="preference-header"
                             title={i18next.t("component.navigation.googleShopping")}>
                <HintPopupVideo title={'Google shopping'} category={'GOOGLE_SHOPPING'}/>

            </GSContentHeader>
            <GSContentBody className="preference-content-body" size={GSContentBody.size.LARGE}>
                <AvForm onSubmit={(event, error, values) => handleOnSaveSubmit(event, error, values)}>
                    <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>

                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title title-customize">
                            <h3><Trans i18nKey="component.storefont.preference.gv.title">Verify website</Trans>
                            </h3>
                            <div style={{color: "#9EA0A5"}}>
                                <Trans i18nKey="component.storefont.preference.gv.more">
                                    Field to insert the html tag
                                </Trans>
                            </div>
                        </section>
                        <UikWidgetContent className="preference-content-detail">
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0353]}
                                              wrapperDisplay={"block"}>
                                <AvFieldCountable
                                    label={i18next.t("component.storefont.preference.gv.tag")}
                                    placeholder={i18next.t("component.storefont.preference.gv.hint")}
                                    name={'gvHtmlTag'}
                                    type={'input'}
                                    isRequired={false}
                                    minLength={0}
                                    maxLength={100}
                                    rows={1}
                                    value={gvVerify.htmlTag}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' ||
                                            e.which === 13 ||
                                            e.keyCode === 13) {
                                            e.preventDefault();
                                            return;
                                        }
                                    }}
                                />
                            </PrivateComponent>
                        </UikWidgetContent>
                        <section className="preference-content-footer">
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0353]}
                                            wrapperDisplay={"block"}>
                                <GSButton success marginLeft className="btn-save" onClick={() => this.refBtnSubmitForm.click()}>
                                    <Trans i18nKey="common.btn.save" className="sr-only">Save</Trans>
                                </GSButton>
                            </PrivateComponent>
                        </section>
                    </UikWidget>
                </AvForm>
                <AlertModal ref={(el) => {
                    this.alertModal = el;
                }}/>
            </GSContentBody>

            <GSContentBody className="preference-content-body" size={GSContentBody.size.LARGE}>
                <AvForm onSubmit={(event, error, values) => {}}>
                    <UikWidget className={"gs-widget "}>
                        <section className="preference-content-title-wrapper preference-content-action">
                            <section className="preference-content-title title-customize">
                                <h3><Trans i18nKey="component.storefont.preference.gss.export.title">Export product</Trans>
                                </h3>
                                <div style={{color: "#9EA0A5"}}>
                                    <Trans i18nKey="component.storefont.preference.gss.export.more">
                                        Export product for Google Shopping Ads
                                    </Trans>
                                </div>
                            </section>
                            <section className="preference-content-title">
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0353]}
                                                wrapperDisplay={"block"}>
                                    <GSButton success outline marginLeft className="btn-save" 
                                        onClick={(e) => {
                                            if(stLoadingExportAll) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }
                                            onExportAll();
                                        }}>
                                        <span className="spinner-border spinner-border-sm" role="status" hidden={!stLoadingExportAll}>
                                            <span class="sr-only">Loading...</span>
                                        </span>
                                        <Trans i18nKey={stLoadingExportAll? 
                                            'component.storefont.preference.gss.export.button.loading' 
                                            :'component.storefont.preference.gss.export.button.all'} className="sr-only">
                                            All products
                                        </Trans>
                                    </GSButton>
                                    <GSButton success outline marginLeft className="btn-save"
                                        onClick={(e) => {
                                            if(stLoadingExportSpecify) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }
                                            toggleSelectItemModal();
                                        }}>
                                        <span className="spinner-border spinner-border-sm" role="status" hidden={!stLoadingExportSpecify}>
                                            <span class="sr-only">Loading...</span>
                                        </span>
                                        <Trans i18nKey={stLoadingExportSpecify? 
                                            'component.storefont.preference.gss.export.button.loading' 
                                            :"component.storefont.preference.gss.export.button.specific"} className="sr-only">
                                            Specific product
                                        </Trans>
                                    </GSButton>
                                </PrivateComponent>
                            </section>
                        </section>
                        {/*<section>*/}
                        {/*    <GSSocialStaffFilter>*/}

                        {/*    </GSSocialStaffFilter>*/}
                        {/*</section>*/}
                    </UikWidget>
                </AvForm>
            </GSContentBody>
            <ModalItemSelection isOpen={stOpenSelectItem} doExport={onExportSpecify} onClose={toggleSelectItemModal}></ModalItemSelection>
        </GSContentContainer>
    );
};

export default GoogleShopping;
