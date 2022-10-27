/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import {UikSelect, UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../../@uik'
import {AvField, AvForm} from 'availity-reactstrap-validation';

import '../../../../../sass/ui/_gswidget.sass'
import '../../../../../sass/ui/_gsfrm.sass'
import Label from "reactstrap/es/Label";
import './PageFormEditor.sass'
import {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import pageService from "../../../../services/PageService";
import {Trans} from "react-i18next";
import i18next from "../../../../config/i18n";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import Constants from "../../../../config/Constant";
import {Redirect} from "react-router-dom";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {RouteUtils} from "../../../../utils/route";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSEditor from "../../../../components/shared/GSEditor/GSEditor";
import storageService from "../../../../services/storage";
import {CredentialUtils} from "../../../../utils/credential";
import GSButtonUpload from "../../../../components/shared/GSButtonUpload/GSButtonUpload";
import {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import {ImageUtils} from "../../../../utils/image";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {GSToast} from "../../../../utils/gs-toast";
import SEOEditor from "../../../seo/SEOEditor";
import {ValidateUtils} from "../../../../utils/validate";
import {ItemUtils} from '../../../../utils/item-utils'

export const PageFormEditorMode = {
    ADD_NEW: 'addNew',
    EDIT: 'edit'
}

export default class PageFormEditor extends React.Component {

    SIZE_PER_PAGE = 10

    constructor(props) {
        super(props)

        this.state = {
            id : null,
            name : '',
            url: '',
            content: '',

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

            refPrefixURLWidth: 340,
            thumbnail: null,
            pageImageUrl: null
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
    }

    componentDidMount() {
        // get template
        pageService.getTemplates().then(res => {
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
        });


        // check edit
        if (this.props.mode === PageFormEditorMode.EDIT) {
            this.setState({
                id: this.props.item.id,
                name: this.props.item.name,
                url: this.props.item.url,
                content: this.props.item.content,
                pageImageUrl: this.props.item.pageImageUrl
            })
        }

        // calculate the width of the url prefix
        this.setState({
            refPrefixURLWidth : this.refPrefixURL.current.clientWidth
        })
    }

    changeTemplate(pageId){

        this.setState({
            isLoadingTemplate : true
        })

        pageService.getTemplateDetail(pageId).then( res =>{
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
        if (this.state.onRedirect) return <Redirect to={NAV_PATH.pages} />
    }

    // redirect to collection if remove this collection
    redirectToPageList() {
        this.setState({
            onRedirect: true
        })
    }

    // change the name to link
    changeNameToLink(str){
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        str = str.replace(/\W+/g, ' ');
        str = str.replace(/\s/g, '-');
        return str.toLowerCase();
    }

    nameOnBlur(){
        let link = ItemUtils.changeNameToLink(this.state.name);
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
            messages: i18next.t('component.page.edit.remove.hint'),
            okCallback: () => {
                pageService.deletePage(this.state.id)
                    .then(result => {
                        this.alertModal.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t('component.page.edit.remove.success'),
                            closeCallback: this.redirectToPageList
                        })
                    }, e => {
                        this.alertModal.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t('component.page.edit.remove.failed'),
                            closeCallback: this.redirectToPageList
                        })
                    })
            }
        })
    }

    submitRequest(requestBody) {
        if(this.props.mode === PageFormEditorMode.ADD_NEW){
            pageService.createPage(requestBody).then(result => {

                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    messages: i18next.t("component.page.addNew.success.title"),
                    closeCallback: () => {
                        this.setState( {onRedirect : true},() => {
                            RouteUtils.linkTo(this.props, NAV_PATH.pages);
                        });
                    }
                })

            }).catch(e => {
                let message = i18next.t("component.page.addNew.failed.title");
                if(e.response.status === 400 && e.response.data && e.response.data.error === "DUPLICATED_URL"){
                    message = i18next.t("component.page.form.error.duplicated_url");
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

            pageService.updatePage(requestBody).then(result => {

                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    messages: i18next.t("component.page.edit.success.title"),
                    closeCallback: () => {
                        this.setState( {onRedirect : true},() => {
                            RouteUtils.linkTo(this.props, NAV_PATH.pages);
                        });
                    }
                })

            }).catch(e => {
                let message = i18next.t("component.page.addNew.failed.title");
                if(e.response.status === 400 && e.response.data && e.response.data.error === "DUPLICATED_URL"){
                    message = i18next.t("component.page.form.error.duplicated_url");
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
    handleOnSaveSubmit(event, values) {

        const seo = {
            seoTitle: values.seoTitle? values.seoTitle: undefined,
            seoDescription: values.seoDescription? values.seoDescription: undefined,
            seoUrl: values.seoUrl? values.seoUrl: undefined,
            seoKeywords: values.seoKeywords? values.seoKeywords: undefined,
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
            name : this.state.name,
            url: this.state.url,
            content: values.content,
            sellerId : storeId,
            ...seo
        }

        // check image
        if (this.state.thumbnail) {
            mediaService.uploadFileWithDomain(this.state.thumbnail, MediaServiceDomain.GENERAL)
                .then( result => {
                    this.submitRequest({
                        ...submitdata,
                        pageImageUrl: ImageUtils.getImageFromImageModel(result)
                    })
                })
                .catch(e => {
                    GSToast.commonError()
                })
                .finally( () => {

                })
        } else {
             this.submitRequest(submitdata)
        }





    }

    renderHeader() {
                return (
                    <GSContentHeader className="page-toolbar"
                        title={i18next.t("component.page.addNew.title")}
                        subTitle={i18next.t("component.storefront.page.add.page")}>
                    
                        {/* {
                            this.props.mode === PageFormEditorMode.ADD_NEW &&
                            <h5 className="gs-page-title">
                                <Trans i18nKey="component.page.addNew.title">
                                    Add Page
                                </Trans>
                            </h5>
                        } 
                        {
                            this.props.mode === PageFormEditorMode.EDIT &&
                            <h5 className="gs-page-title product-name">
                                {this.state.name}
                            </h5>
                        } */}
                        {/*BTN SAVE*/}
                        <div className="group-btn">
                            <GSButton success
                                    disabled={this.state.name.length === 0}
                                className={"btn-save"}
                                style={{ marginLeft: 'auto' }}
                                onClick={() => this.refBtnSubmitForm.click()}>
                                <span className="spinner-border spinner-border-sm" role="status" hidden={!this.state.isSaving}>

                                </span>
                                <Trans i18nKey={this.state.isSaving ? 'common.btn.saving' : 'common.btn.save'} className="sr-only">
                                    Save
                                </Trans>
                            </GSButton>
                            {/*BTN CANCEL*/}
                            <GSButton secondary outline marginLeft hidden={this.state.isSaving}
                                onClick={this.handleOnCancel}>
                                <Trans i18nKey="common.btn.cancel">
                                    Cancel
                                </Trans>
                            </GSButton>
                            {/*BTN DELETE*/}
                            {
                                this.props.mode === PageFormEditorMode.EDIT &&
                                <GSButton danger outline marginLeft hidden={this.state.isSaving}
                                    onClick={this.onClickRemove}>
                                    <i className="icon-delete"></i>
                                </GSButton>
                            }
                        </div>

                    </GSContentHeader>
                )
    }

    onThumbnailUploaded(files) {
        const file = files[0]
        if (file) {
            this.setState({
                thumbnail: file
            })
        }
    }

    onRemoveThumbnail() {
        this.setState({
            thumbnail: null,
            pageImageUrl: null
        })
    }

    buildSEOUrl() {
        const prefix = `${this.storeInfo.url}.${process.env.STOREFRONT_DOMAIN}/page/`
        return prefix + this.state.url
    }

    render() {
        return (
            <GSContentContainer confirmWhenRedirect confirmWhen={!this.state.onRedirect} className="page-form__container">
                {(this.state.isSaving || this.state.isLoadingTemplate) && <LoadingScreen />}
                {this.renderRedirect()}
                {this.renderHeader()}
                <GSContentBody size={GSContentBody.size.LARGE}>
                    <AvForm onValidSubmit={this.handleOnSaveSubmit} autoComplete="off">
                        <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden />

                        {!this.state.isValid &&
                            <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                                <Trans i18nKey="component.product.edit.invalidate" />
                            </div>
                        }

                        {/*Page INFO*/}
                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                <Trans i18nKey="component.page.form.group.general">
                                Page detail
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className={'widget__content '}
                                className={this.state.isSaving ? 'gs-atm--disable' : ''}>

                                <Label for={'name'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.page.form.name">
                                    Page title
                                    </Trans>
                                </Label>
                                <AvField
                                    name={'name'}
                                    value={this.state.name}
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

                                <Label for={'url'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.page.form.url">
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

                                {/*IMAGE*/}
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
                                </div>

                                <div className="content-title__group">
                                    <Label for={'content'} className="gs-frm-control__title">
                                        <Trans i18nKey="component.page.form.content">
                                            Content
                                        </Trans>
                                    </Label>

                                    <UikSelect
                                        defaultValue={""}
                                        options={ this.state.lstTemplate }
                                        placeholder={i18next.t('component.page.form.content.template')}
                                        className="select-template__drop"
                                        onChange={(item) => this.changeTemplate(item.value)}
                                        disabled={!this.state.hasTemplate}
                                    />
                                </div>
                                <GSEditor
                                    name={'content'}
                                    value={this.state.content}
                                    isRequired={false}
                                    minLength={0}
                                    maxLength={100000}
                                    heightMin={500}
                                />
                            </UikWidgetContent>
                        </UikWidget>

                        {/*SEO*/}
                        <SEOEditor isShowUrl={false}
                            defaultValue={{
                                seoKeywords: ValidateUtils.defaultValue('seoKeywords', '', this.props),
                                seoDescription: ValidateUtils.defaultValue('seoDescription', '', this.props),
                                seoTitle: ValidateUtils.defaultValue('seoTitle', '', this.props),
                                seoUrl: this.buildSEOUrl()
                            }}
                                   assignDefaultValue={false}
                        />
                    </AvForm>
                </GSContentBody>
                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />

           
                
            </GSContentContainer>

        )
    }

}

