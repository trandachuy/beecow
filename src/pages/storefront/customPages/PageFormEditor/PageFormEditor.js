/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from 'react';
import _ from 'lodash';
import {UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../../@uik'
import {AvField, AvForm} from 'availity-reactstrap-validation';
import moment from 'moment';
import '../../../../../sass/ui/_gswidget.sass'
import '../../../../../sass/ui/_gsfrm.sass'
import Label from 'reactstrap/es/Label';
import './PageFormEditor.sass'
import {AlertInlineType} from '../../../../components/shared/AlertInline/AlertInline';
import customPageService from '../../../../services/CustomPageService';
import {Trans} from 'react-i18next';
import i18next from '../../../../config/i18n';
import AlertModal, {AlertModalType} from '../../../../components/shared/AlertModal/AlertModal';
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader';
import {StoreLogoModel} from '../../../../components/shared/model/StoreLogoModel';
import Constants from '../../../../config/Constant';
import {Redirect} from 'react-router-dom';
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal';
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader';
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody';
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer';
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen';
import {RouteUtils} from '../../../../utils/route';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import GSEditor from '../../../../components/shared/GSEditor/GSEditor';
import storageService from '../../../../services/storage';
import {CredentialUtils} from '../../../../utils/credential';
import ImageUploader, {ImageUploadType} from '../../../../components/shared/form/ImageUploader/ImageUploader';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {ImageUtils} from '../../../../utils/image';
import mediaService, {MediaServiceDomain} from '../../../../services/MediaService';
import {GSToast} from '../../../../utils/gs-toast';
import SEOEditor from '../../../seo/SEOEditor';
import {ValidateUtils} from '../../../../utils/validate';
import {ThemeEngineService} from '../../../../services/ThemeEngineService';
import storeService from '../../../../services/StoreService';
import TranslateModal from '../../../../components/shared/productsModal/TranslateModal';
import {ItemUtils} from '../../../../utils/item-utils'
import HocSEOEditor from '../../../seo/hoc/HocSEOEditor'

export const PageFormEditorMode = {
    ADD_NEW: 'addNew',
    EDIT: 'edit'
}
export default class PageFormEditor extends React.Component {
    SIZE_PER_PAGE = 10

    IMAGE_FILE_SIZE = 10

    constructor(props) {
        super(props)
        this.state = {
            id : null,
            title : '',
            url: '',
            rawContent: '',
            authorName: "",
            status: '',
            lstTemplate: [
                {
                    value : 0,
                    label : "Blank page"
                }
            ],
            hasTemplate: false,
            isSaving: false,
            onRedirect: false,
            isValid: true,
            isLoadingTemplate: false,
            isShowSeo: false,
            refPrefixURLWidth: 340,
            thumbnail: {
                file: undefined,
                data: undefined,
                isExist: false
            },
            stActiveTheme: null,
            languages: [],
            selectedCustomPageLang: {
                langCode: '',
                title: '',
                rawContent: '',
                seoTitle: '',
                seoDescription: '',
                seoKeyword: '',
                seoUrl: ''
            },
            customPageLanguages: [],
            saveButtonStyle: {
                marginRight: '0.5rem',
                marginLeft: '0.5rem'
            },
        }
        this.storeInfo = {
            name: CredentialUtils.getStoreName(),
            url: CredentialUtils.getStoreUrl()
        }
        this.refPrefixURL = React.createRef();
        this.handleOnSaveSubmit = this.handleOnSaveSubmit.bind(this)
        this.handleOnCancel = this.handleOnCancel.bind(this)
        this.redirectToPageList = this.redirectToPageList.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this)
        this.onFormChange = this.onFormChange.bind(this);
        this.nameOnBlur = this.nameOnBlur.bind(this);
        this.changeTemplate = this.changeTemplate.bind(this);
        this.onThumbnailUploaded = this.onThumbnailUploaded.bind(this);
        this.onRemoveThumbnail = this.onRemoveThumbnail.bind(this);
        // flag
        this.isCheckValidOnly = false
        this.submitRequest = this.submitRequest.bind(this);
        this.buildSEOUrl = this.buildSEOUrl.bind(this);
        this.handleLanguageSubmitted = this.handleLanguageSubmitted.bind(this);
        this.handleLanguageChanged = this.handleLanguageChanged.bind(this);

        this.refSEOUrl = React.createRef()
        this.refTranslateSEOUrl = React.createRef()
    }
    componentDidMount() {
        // get template
        /* pageService.getTemplates().then(res => {
            let lstTemplate = [];
            res.data.forEach(template => {
                lstTemplate.push({
                    value : template.id,
                    label : template.name
                })
            })
            if(lstTemplate.length > 0){
                this.setState({
                    lstTemplate : lstTemplate,
                    hasTemplate: true
                })
            }
        }); */
        // check edit
        const {item} = this.props;
        const { id, title, url, rawContent, authorName, status, seoUrl, seoTitle, seoDescription, seoKeyword } = item || {};
        this.setState({
            selectedCustomPageLang: { rawContent, title, seoUrl, seoDescription, seoKeyword, seoTitle }
        });
        if (this.props.mode === PageFormEditorMode.EDIT && _.isInteger(id)) {
            const hasImage = this.props.item.imageUrl? true:false;
            const imageModel = (hasImage)? ImageUtils.mapImageUrlToImageModel(this.props.item.imageUrl): undefined;
            this.setState({
                id,
                title,
                url,
                rawContent,
                authorName,
                status,
                thumbnail: {
                    file: undefined,
                    data:  imageModel? new StoreLogoModel(imageModel) : undefined,
                    isExist: hasImage
                }
            })
        }
        // calculate the width of the url prefix
        /* this.setState({
            refPrefixURLWidth : this.refPrefixURL.current.clientWidth
        }) */
        this.getStoreThemeActive();
        this.getLanguages();
        this.loadPageLanguages();
    }
    getStoreThemeActive() {
        ThemeEngineService.getStoreThemesByStoreId()
            .then((storeThemes) => {
                const activeThemeIndex = storeThemes? storeThemes.findIndex(theme => theme.published): -1;
                if (activeThemeIndex !== -1) {
                    this.setState({stActiveTheme: storeThemes[activeThemeIndex]});
                }
            })
            .catch(() => {
                this.setState({stActiveTheme: null});
            })
            .finally(() => {
            })
    }
    getLanguages() {
        storeService.getListLanguages()
        .then(resp => {
            this.setState({
                languages: resp || []
            })
            const isShow = resp.length > 1;
            this.checkButtonTranslate(isShow);
        })
        .catch(() => GSToast.commonError())
    }
    loadPageLanguages() {
        if (this.props.mode === PageFormEditorMode.ADD_NEW) {
            return;
        }
        const pageId = this.props.item.id;
        if(!pageId) return;
        customPageService.loadListLanguageByPageId(pageId)
        .then(data => {
            this.setState({customPageLanguages: data});
        })
        .catch(e => GSToast.commonError())
    }
    changeTemplate(pageId){
        this.setState({
            isLoadingTemplate : true
        })
        customPageService.getTemplateDetail(pageId).then( res =>{
            this.setState({
                content : res.data.content,
                isLoadingTemplate : false
            })
        }).catch( e =>{
            this.setState({
                isLoadingTemplate : false
            })
        })
    }
    onFormChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    // redirect to collection if OK on confirm modal
    renderRedirect() {
        if (this.state.onRedirect) return <Redirect to={NAV_PATH.customPages} />
    }
    // redirect to collection if remove this collection
    redirectToPageList() {
        this.setState({
            onRedirect: true
        })
    }

    nameOnBlur(){
        let link = ItemUtils.changeNameToLink(this.state.title);
        this.setState({
            url : link
        })
    }
    // cancel button
    handleOnCancel(e) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            okCallback: () => {
                this.setState({
                    onRedirect: true
                })
            }
        })
    }
    // delete button
    onClickRemove(e) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.custom.page.edit.remove.hint'),
            okCallback: () => {
                customPageService.deletePage(this.state.id)
                    .then(result => {
                        this.alertModal.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t('component.custom.page.edit.remove.success'),
                            closeCallback: this.redirectToPageList
                        })
                    }, e => {
                        this.alertModal.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t('component.custom.page.edit.remove.failed'),
                            closeCallback: this.redirectToPageList
                        })
                    })
            }
        })
    }
    submitRequest(requestBody) {
        if(this.props.mode === PageFormEditorMode.ADD_NEW){
            customPageService.createCustomPage(requestBody).then(result => {
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    messages: i18next.t("component.custom.page.addNew.success.title"),
                    closeCallback: () => {
                        this.setState( {onRedirect : true},() => {
                            RouteUtils.linkTo(this.props, NAV_PATH.customPages);
                        });
                    }
                })
            }).catch(e => {
                let message = i18next.t("component.custom.page.addNew.failed.title");
                if(e.response.status === 400 && e.response.data && e.response.data.error === "DUPLICATED_URL"){
                    message = i18next.t("component.custom.page.form.error.duplicated_url");
                }
                // has error when creating data
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: message,
                    closeCallback: () => {
                        this.setState({
                            isSaving: false
                        })
                    }
                })
            });
        }else if(this.props.mode === PageFormEditorMode.EDIT){
            requestBody.id = this.state.id;
            customPageService.updatePage(requestBody).then(result => {
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    messages: i18next.t("component.custom.page.edit.success.title"),
                    closeCallback: () => {
                        this.setState( {onRedirect : true},() => {
                            RouteUtils.linkTo(this.props, NAV_PATH.customPages);
                        });
                    }
                })
            }).catch(e => {
                let message = i18next.t("component.custom.page.addNew.failed.title");
                if(e.response.status === 400 && e.response.data && e.response.data.error === "DUPLICATED_URL"){
                    message = i18next.t("component.custom.page.form.error.duplicated_url");
                }
                // has error when creating data
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: message,
                    closeCallback: () => {
                        this.setState({
                            isSaving: false
                        })
                    }
                })
            });
        }
    }
    // save button
    async handleOnSaveSubmit(event, values) {
        const isSEOUrlValidRes = this.refSEOUrl.current && await this.refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const seo = {
            seoTitle: values.seoTitle? values.seoTitle: undefined,
            seoDescription: values.seoDescription? values.seoDescription: undefined,
            seoUrl: values.seoUrl? ItemUtils.changeNameToLink(values.seoUrl): undefined,
            seoKeyword: values.seoKeywords? values.seoKeywords: undefined,
        }
        if (this.state.isSaving)
            return
        this.setState({
            isValid: true,
            isSaving: true
        })
                //----------------------------------------//
                // data submit
                //----------------------------------------//
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        let submitdata = {
            ...this.props.item,
            title : this.state.title,
            url: this.state.url,
            rawContent: values.rawContent,
            storeId : storeId,
            status: "PUBLISH",
            ...seo
        }
        // check image
        if (this.state.thumbnail.file) {
            mediaService.uploadFileWithDomain(this.state.thumbnail.file, MediaServiceDomain.GENERAL)
                .then( result => {
                    this.submitRequest({
                        ...submitdata,
                        imageUrl: ImageUtils.getImageFromImageModel(result)
                    })
                })
                .catch(e => {
                    GSToast.commonError()
                })
        } else {
             this.submitRequest(submitdata)
        }
    }

    checkButtonTranslate(isShow) {
        let buttonStyle = {
            marginRight: '0.5rem',
            marginLeft: 'auto'
        }
        if(isShow === true && this.props.mode === PageFormEditorMode.EDIT) {
            buttonStyle = {
                marginRight: '0.5rem',
                marginLeft: '0.5rem'
            }
        }
        this.setState({saveButtonStyle: buttonStyle})
    }

    renderHeader() {
        return (
            <GSContentHeader className="page-toolbar"
                title={i18next.t("component.custom.page.addNew.title")}
                subTitle={i18next.t("component.storefront.page.add.page")}>

                <div className="group-btn">
                    {/* BUTTON TRANSLATE */}
                    { this.props.mode === PageFormEditorMode.EDIT && this.renderTranslateInformationModal() }
                    {/* BUTTON SAVE */}
                    <GSButton success
                        disabled={this.state.title.length === 0}
                        className={"btn-save"}
                        style={this.state.saveButtonStyle}
                        onClick={() => this.refBtnSubmitForm.click()}>
                        <span className="spinner-border spinner-border-sm" role="status" hidden={!this.state.isSaving}>
                        </span>
                        <Trans i18nKey={this.state.isSaving ? 'common.btn.saving' : 'common.btn.save'} className="sr-only">
                            Save
                        </Trans>
                    </GSButton>
                    {/*BTN CANCEL*/}
                    <GSButton secondary outline marginRight hidden={this.state.isSaving}
                        onClick={this.handleOnCancel}>
                        <Trans i18nKey="common.btn.cancel">
                            Cancel
                        </Trans>
                    </GSButton>
                    {/*BTN DELETE*/}
                    {
                        this.props.mode === PageFormEditorMode.EDIT &&
                        <GSButton danger outline marginRight hidden={this.state.isSaving}
                            onClick={this.onClickRemove}>
                            <i className="icon-delete"></i>
                        </GSButton>
                    }
                </div>
            </GSContentHeader>
        )
    }
    onThumbnailUploaded(files) {
        const file = files[0];
        if (file) {
            this.setState({
                thumbnail: {
                    file: file,
                    data: undefined,
                    isExist: true
                }
            })
        }
    }
    onRemoveThumbnail() {
        this.setState({
            thumbnail: {
                file: undefined,
                data: undefined,
                isExist: false
            }
        })
    }
    buildSEOUrl() {
        const prefix = `${this.storeInfo.url}.${process.env.STOREFRONT_DOMAIN}/page/`
        return prefix + this.state.url
    }
    toggleShowMore() {
        this.setState({
            isShowSeo: true
        });
    }
    handleCustomize(id) {
        /* let url = generatePath(NAV_PATH.themeEngine.making, {
            themeId: id,
            themeType: ThemeEngineConstants.THEME_TYPE.STORE
        });
        var params = new URLSearchParams({"pageType": PAGE_TYPE.CUSTOM, "pageId": this.state.id});
        url += "?" + params.toString();
        window.open(url, '_blank'); */
        const sUrl = this.state.url + "-p" + this.state.id ;
        storeService.getSfFullDomain().then((data) => {
            const url = "https://"+ data +"/page/"+ sUrl;
            window.open(url, '_blank');
        })
    }
    getPageLanguage(formValues) {
        const selectedLangCode = this.state.selectedCustomPageLang.langCode;
        const {informationName, informationDescription, seoTitle, seoDescription, seoKeywords, seoUrl} = formValues;
        let pageLang = {
            rawContent: informationDescription,
            title: informationName,
            seoUrl: ItemUtils.changeNameToLink(seoUrl),
            seoDescription: seoDescription,
            seoKeyword: seoKeywords,
            seoTitle: seoTitle,
            langCode: selectedLangCode,
            pageId: this.props.item.id
        };
        return pageLang;
    }
    handleLanguageChanged(lang, preChangeValues) {
        const prevLangCode = this.state.selectedCustomPageLang.langCode;
        if(prevLangCode) {
            const index = this.state.customPageLanguages.findIndex(l => l.langCode === prevLangCode);
            let pageLang = this.getPageLanguage(preChangeValues);
            if(index > -1) {
                this.state.customPageLanguages.splice(index, 1, pageLang);
            } else {
                this.state.customPageLanguages.push(pageLang);
            }
        }
        else {
            this.setState({
                selectedCustomPageLang: { ...this.state.selectedCustomPageLang, langCode: lang.langCode }
            });
        }
        const selectedLang = this.state.customPageLanguages.find(l => l.langCode === lang.langCode)


        if (selectedLang) {
            this.setState({ selectedCustomPageLang: selectedLang });
        }
    }
    async handleLanguageSubmitted(values) {
        const isSEOUrlValidRes = this.refTranslateSEOUrl.current && await this.refTranslateSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        const langCode = this.state.selectedCustomPageLang.langCode;
        let pageLang = this.getPageLanguage(values);
        const index = this.state.customPageLanguages.findIndex(l => l.langCode === langCode);
        if(index > -1) {
            this.state.customPageLanguages.splice(index, 1, pageLang);
        } else {
            this.state.customPageLanguages.push(pageLang);
        }
        customPageService.updateCustomPageLanguage(this.state.customPageLanguages)
        .then(() => GSToast.commonUpdate())
        .catch(() => GSToast.commonError())
    }
    renderTranslateInformationModal() {
        const {langCode, rawContent, seoTitle, seoDescription, seoKeyword, seoUrl, title} = this.state.selectedCustomPageLang

        return (
            <TranslateModal
                buttonTranslateStyle={ { marginLeft: 'auto' } }
                onDataFormSubmit={ this.handleLanguageSubmitted }
                onDataLanguageChange={ this.handleLanguageChanged }>
                <TranslateModal.Information
                    name={ title }
                    description={ rawContent }
                    controller={ {
                        hasName: true
                    } }
                    onNameChange={e => {
                        const title =  e.currentTarget.value

                        this.setState(state => ({
                            selectedCustomPageLang: {
                                ...state.selectedCustomPageLang,
                                title
                            }
                        }))
                    }}
                />
                <TranslateModal.SEO
                    ref={ this.refTranslateSEOUrl }
                    langKey={ langCode }
                    seoUrl={ seoUrl }
                    seoTitle={ seoTitle }
                    seoDescription={ seoDescription }
                    seoKeywords={ seoKeyword }
                    isShowUrl={ true }
                    seoLinkType={ Constants.SEO_DATA_TYPE.PAGE }
                    seoLinkData={ this.state.id }
                    postfix={ this.state.id ? `-p${ this.state.id }` : '' }
                    itemName={ title }
                    assignDefaultValue={ false }
                    enableLetterOrNumberOrHyphen={ false }
                />
            </TranslateModal>
        )
    }

    render() {
        return (
            <GSContentContainer confirmWhenRedirect confirmWhen={!this.state.onRedirect} className="page-form__container">
                {(this.state.isSaving || this.state.isLoadingTemplate) && <LoadingScreen />}
                {this.renderRedirect()}
                {this.renderHeader()}
                <GSContentBody className="custom-page-container">
                    <AvForm onValidSubmit={this.handleOnSaveSubmit} autoComplete="off" className="custom-page-editor">
                        <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden />
                        {!this.state.isValid &&
                            <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                                <Trans i18nKey="component.product.edit.invalidate" />
                            </div>
                        }
                        {/*Page INFO*/}
                        <UikWidget className={"gs-widget "}>
                            <GSWidgetHeader className="widget__header widget__header--text-align-right"
                                rightEl={
                                        this.props.mode === PageFormEditorMode.EDIT &&
                                        <span hidden={!this.state.stActiveTheme} disabled={(this.state.id && this.state.id > 0)? "":"disabled"} className="gsa-hover--fadeOut pointer"
                                            onClick={() => {
                                                if(this.state.stActiveTheme && (this.state.id && this.state.id > 0)) {
                                                    this.handleCustomize(this.state.stActiveTheme.id);
                                                }
                                            }}>
                                        <img src="/assets/images/icon-view.png" width="16" alt="view-page-btn" style={{verticalAlign: 'baseline',filter: "contrast(175%) brightness(3%)"}}/>
                                        <span className="pl-2">
                                            <GSTrans t={'component.custom.page.form.group.view'}/>
                                        </span>
                                    </span>
                                }>
                                <span className="text-uppercase">
                                    <GSTrans t={'component.custom.page.form.group.general'}/>
                                </span>
                            </GSWidgetHeader>
                            <UikWidgetContent className={this.state.isSaving ? 'gs-atm--disable widget-content-baseline-header' : 'widget-content-baseline-header'}>
                                <Label for={'name'} className="gs-frm-control__title">
                                    {i18next.t("component.custom.page.form.name")}
                                </Label>
                                <AvField
                                    name={'title'}
                                    value={this.state.title}
                                    validate={{
                                        required: {
                                            value: true,
                                            errorMessage: i18next.t('common.validation.required')
                                        },
                                        maxLength: {
                                            value: 165,
                                            errorMessage: i18next.t("common.validation.char.max.length", {x: 165})
                                        }
                                    }}
                                    onChange={this.onFormChange}
                                    onBlur={this.nameOnBlur}
                                />
                                {/* PAGE URL  */}
                                {/*
                                <Label for={'url'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.custom.page.form.url">
                                        URL
                                    </Trans>
                                </Label>
                                <Label for={'url'} className="url-prefix">{`https://${this.storeInfo.url}.${process.env.STOREFRONT_DOMAIN}/page/` + this.state.url}</Label>
                                <div className="page-url__group">
                                    <span ref={this.refPrefixURL} className="page-prefix">{`https://${this.storeInfo.url}.${process.env.STOREFRONT_DOMAIN}/page/`}</span>
                                    <AvField
                                        style={{
                                            paddingLeft : this.state.refPrefixURLWidth + 10
                                        }}
                                        className="page-url"
                                        name={'url'}
                                        value={this.state.url}
                                        validate={{
                                            required: {
                                                value: true,
                                                errorMessage: i18next.t('common.validation.required')
                                            },
                                            pattern: {
                                                value: '^[A-Za-z0-9-]+$',
                                                errorMessage: i18next.t('common.validation.number.and.character.and.hyphen')
                                            },
                                            maxLength: {
                                                value: 165,
                                                errorMessage: i18next.t("common.validation.char.max.length", {x: 165})
                                            }
                                        }}
                                        onChange={this.onFormChange}
                                    />
                                </div>
                                */}
                                {/*IMAGE*/}
                                {/*
                                <div className="row mb-3">
                                    <div className="col-md-4 col-12 pl-0 d-flex flex-column align-items-start">
                                        <Label className="gs-frm-control__title">
                                            <GSTrans t="page.storeFront.pages.mobileThumbnail"/>
                                        </Label>
                                        <span className="color-gray">
                                            1000 x 1000px (JPEG/PNG file)
                                        </span>
                                    </div>
                                    <div className="col-md-4 col-12 d-flex justify-content-md-start justify-content-center align-items-center my-3 my-md-0">
                                        {!this.state.thumbnail && !this.state.pageImageUrl &&
                                            <GSButtonUpload onUploaded={this.onThumbnailUploaded}
                                                            multiple={false}
                                                            maxImageSizeByMB={10}
                                                            accept={[ImageUploadType.JPEG, ImageUploadType.PNG]}
                                            />
                                        }
                                        {(this.state.thumbnail || this.state.pageImageUrl) &&
                                            <>
                                                <span>
                                                    {ImageUtils.ellipsisFileName(this.state.thumbnail? this.state.thumbnail.name: this.state.pageImageUrl, 20)}
                                                </span>
                                                <GSActionButton icon={GSActionButtonIcons.DELETE}
                                                                onClick={this.onRemoveThumbnail}
                                                                marginLeft
                                                                />
                                            </>
                                        }
                                    </div>
                                    <div className="col-md-4 col-12 d-flex justify-content-md-start justify-content-center align-items-center pr-md-0">
                                        <GSImg src={this.state.thumbnail? this.state.thumbnail: this.state.pageImageUrl}
                                               height={60}
                                        />
                                    </div>
                                </div> */}

                                <div className="content-title__group">
                                    <Label for={'content'} className="gs-frm-control__title">
                                        <Trans i18nKey="component.custom.page.form.content">
                                            Content
                                        </Trans>
                                    </Label>
                                    {/*
                                    <UikSelect
                                        defaultValue={""}
                                        options={ this.state.lstTemplate }
                                        placeholder={i18next.t('component.custom.page.form.content.template')}
                                        className="select-template__drop"
                                        onChange={(item) => this.changeTemplate(item.value)}
                                        disabled={!this.state.hasTemplate}
                                    />
                                    */}
                                </div>
                                <GSEditor
                                    name={'rawContent'}
                                    value={this.state.rawContent}
                                    isRequired={false}
                                    minLength={0}
                                    maxLength={500000}
                                    heightMin={500}
                                />
                            </UikWidgetContent>
                        </UikWidget>
                        {/*SEO*/}
                        <HocSEOEditor ref={ this.refSEOUrl }
                                      langKey={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE) }
                                      type={ Constants.SEO_DATA_TYPE.PAGE }
                                      data={ this.state.id }>
                            <SEOEditor
                                className={ 'custom-page-form__seo-content' }
                                defaultValue={ {
                                    seoKeywords: ValidateUtils.defaultValue('seoKeyword', '', this.props),
                                    seoDescription: ValidateUtils.defaultValue('seoDescription', '', this.props),
                                    seoTitle: ValidateUtils.defaultValue('seoTitle', '', this.props),
                                    seoUrl: ValidateUtils.defaultValue('seoUrl', '', this.props)
                                } }
                                maxLength={ {
                                    seoTitle: 200,
                                    seoDescription: 325,
                                    seoKeywords: 325,
                                    seoUrl: 200
                                } }
                                prefix="page/"
                                middleSlug={ ItemUtils.changeNameToLink(this.state.title || '') }
                                postfix={ this.state.id ? `-p${ this.state.id }` : '' }
                                isShowCollapse={ true }
                                assignDefaultValue={ false }
                                enableLetterOrNumberOrHyphen={ false }
                            />
                        </HocSEOEditor>
                    </AvForm>
                    {/*Page INFO*/}
                    <div className="page-form__information">
                        <UikWidget className={"gs-widget setting-element"}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right text-uppercase'}>
                                <Trans i18nKey="component.custom.page.form.group.image">
                                    Feature Image
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent>
                                <div className="image-setting">
                                    <div className="image-widget__container">
                                        {(this.state.thumbnail.isExist) &&
                                            <ImageView
                                                key={"IMAGE_FEATURE"}
                                                src={this.state.thumbnail}
                                                onRemoveCallback={() => this.onRemoveThumbnail()}
                                                imageType={"IMAGE_FEATURE"}/>
                                        }

                                        {(!this.state.thumbnail.isExist) &&
                                        <span className="image-widget__image-item image-widget__image-item--no-border">
                                            <ImageUploader
                                                accept={[ImageUploadType.JPEG, ImageUploadType.PNG]}
                                                multiple={false}
                                                text="Add photo"
                                                maximumFileSizeByMB={this.IMAGE_FILE_SIZE}
                                                onChangeCallback={(files) => this.onThumbnailUploaded(files)} />
                                        </span>}
                                        <FontAwesomeIcon icon={"upload"}/>
                                        <span className="image-upload-description">{i18next.t('component.custom.page.image.upload.desc')}</span>
                                        <span className="image-description">{i18next.t('component.custom.page.image.upload.dimension')}</span>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <UikWidget className={"gs-widget setting-element"}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right text-uppercase'}>
                                <Trans i18nKey="component.custom.page.form.group.status">
                                    Status
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className="widget-content-baseline-header widget-content_status d-flex flex-md-column">
                                <div className="row mb-1">
                                    <div className="col-md-7 pl-0">
                                                    <img src="/assets/images/writer.svg"
                                                        alt="writer"
                                                        width="20px"
                                                        className="vertical-align-baseline pr-2"/>
                                        <Label>
                                            {i18next.t('component.custom.page.form.status.author')}:
                                        </Label>
                                    </div>
                                    <div className="col-md-5 pl-0">
                                        <Label>
                                                    {this.state.authorName}
                                        </Label>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-md-7 pl-0">
                                                    <img src="/assets/images/status.svg"
                                                        alt="writer"
                                                        width="20px"
                                                        className="vertical-align-baseline pr-2"/>
                                        <Label>
                                            {i18next.t('component.custom.page.form.status.info')}:
                                        </Label>
                                    </div>
                                    <div className="col-md-5 pl-0">
                                        <Label>
                                                    {this.state.status? i18next.t(`component.custom.page.filter.status.${(this.state.status).toLowerCase()}`):``}
                                        </Label>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-md-7 pl-0">
                                                    <img src="/assets/images/created-date.svg"
                                                        alt="writer"
                                                        width="20px"
                                                        className="vertical-align-baseline pr-2"/>
                                        <Label>
                                            {i18next.t('component.custom.page.form.status.date.created')}:
                                        </Label>
                                    </div>
                                    <div className="col-md-5 pl-0">
                                        <Label>
                                                    {this.props.item? moment(this.props.item.createdDate).format('DD-MM-YYYY'):""}
                                        </Label>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-md-7 pl-0">
                                                    <img src="/assets/images/last-modified.svg"
                                                        alt="writer"
                                                        width="20px"
                                                        className="vertical-align-baseline pr-2"/>
                                        <Label>
                                            {i18next.t('component.custom.page.form.status.date.lasted')}:
                                        </Label>
                                    </div>
                                    <div className="col-md-5 pl-0">
                                        <Label>
                                                    {this.props.item? moment(this.props.item.lastModifiedDate).format('DD-MM-YYYY'):""}
                                        </Label>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                    </div>
                </GSContentBody>
                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
            </GSContentContainer>
        )
    }
}
class ImageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            o9n: 1,
            imageObj: null
        }
        this.createImageObject = this.createImageObject.bind(this)
        this.onRemoveCallback = this.props.onRemoveCallback
    }
    componentDidMount() {
        this.createImageObject()
    }
    createImageObject() {
        let src = this.props.src
        if(src.isExist){
            if (src.data && src.data.urlPrefix) {
                this.setState({
                    imageObj : ImageUtils.getImageFromImageModel(src.data)
                })
            } else {
                ImageUtils.getOrientation(src.file, (o9n => {
                    this.setState({
                        o9n: o9n,
                        imageObj: URL.createObjectURL(src.file)
                    })
                }))
            }
        }
    }
    render() {
        return (
            <div className={'image-view image-widget__image-item'}>
                <a className="image-widget__btn-remove" onClick={() => { this.onRemoveCallback(this.props.imageType) }}>
                    <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                </a>
                <img className={"photo " + 'photo--o9n-' + this.state.o9n}
                    width="180px"
                    height="180px"
                    src={this.state.imageObj} />
            </div>
        )
    }
}
