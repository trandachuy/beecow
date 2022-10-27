import React, {useContext, useEffect, useRef, useState} from 'react';
import PropTypes, {func} from 'prop-types';
import './LandingPageEditorLivePreview.sass'
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {LandingPageEditorContext} from "../context/LandingPageEditorContext";
import {
    LANDING_PAGE_DOMAIN_OPTIONS,
    LANDING_PAGE_EDITOR_MODE,
    LANDING_PAGE_SUB_DOMAIN_OPTIONS
} from "../LandingPageEditor";
import {LANDING_PAGE_SUB_DOMAIN} from "../setting/LandingPageEditorSetting";
import {CredentialUtils} from "../../../../utils/credential";
import LandingPageEditorLivePreviewHtmlParser from "./html-parser/LandingPageEditorLivePreviewHtmlParser";
import {LANDING_PAGE_ENUM} from "../../enum/LandingPageEnum";
import {cn} from "../../../../utils/class-name";
import i18next from "i18next";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import {ThemeService} from "../../../../services/ThemeService";
import $ from "jquery";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {ImageUtils} from "../../../../utils/image";
import cheerio from 'cheerio'
import {GSToast} from "../../../../utils/gs-toast";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {withRouter} from "react-router-dom";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import Modal from "reactstrap/es/Modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSStatusTag from "../../../../components/shared/GSStatusTag/GSStatusTag";
import {ColorUtils} from "../../../../utils/color";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {v4 as uuidv4} from 'uuid';

const LandingPageEditorLivePreview = props => {
    const refOkModal = useRef(false);

    const {state, dispatch} = useContext(LandingPageEditorContext.context);

    const [stShowSaveMessage, setStShowSaveMessage] = useState('');
    const [stShowPublishedModal, setStShowPublishedModal] = useState(false);
    const refConfirmModal = useRef(null);
    const [stSeoThumbnail,setStSeoThumbnail]=useState('');

    const setPreviewMode = (mode) => {
        dispatch(LandingPageEditorContext.actions.setPreviewMode(mode))
    }

    const resolveUrl = () => {
        const protocol = 'https://'
        const {domainType, domainValue, customDomain, subDomainType} = state.setting

        // console.log(domainType, subDomainType, domainValue)
        // free domain
        if (domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE) {
            if (!subDomainType || subDomainType === LANDING_PAGE_SUB_DOMAIN_OPTIONS.LANDING_GOSELL) {
                if (state.id) {
                    return protocol + LANDING_PAGE_SUB_DOMAIN + '/' + domainValue + `-p${state.id}`
                }
                return protocol + LANDING_PAGE_SUB_DOMAIN + '/' + domainValue
            }
            if (subDomainType === LANDING_PAGE_SUB_DOMAIN_OPTIONS.SF_WEB) {
                return protocol + CredentialUtils.getStoreUrlByENV(false) + domainValue
            }
        }

        // custom domain
        if (domainType === LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM) {
            return protocol + customDomain + (domainValue? '/' + domainValue:domainValue) + '.html'
        }
    }

    const resolvePublishButtonText = () => {
        if (state.status === LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT) {
            return (
                <div className="landing-page-editor-live-preview__btn-pl landing-page-editor-live-preview__btn--publish"
                    onClick={() => onClickPublic(state.status)}
                >
                    { i18next.t('page.landingPage.editor.button.publish')}
                </div>
            )
        } else {
            return (
                <div className="landing-page-editor-live-preview__btn-pl landing-page-editor-live-preview__btn--draft"
                     onClick={() => onClickPublic(state.status)}
                >
                    {   i18next.t('page.landingPage.editor.button.deactivate')}
                </div>
            )

        }
    }

    const resolvePageStatus = () => {
        switch (state.status) {
            case LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT:
                return i18next.t('page.landingPage.editor.status.draft')
            case LANDING_PAGE_ENUM.PAGE_STATUS.PUBLISH:
                return i18next.t('page.landingPage.editor.status.published')
        }
    }

    const buildRequest = async () => {
        //add seo thumbnail
        var imageThumbnail;
        if(stSeoThumbnail!=state.setting.seoThumbnail){
            await convertBlobURLToFile(state.setting.seoThumbnail).then(file => {
                if(file.type){
                    return mediaService.uploadFileWithDomain(file, MediaServiceDomain.GENERAL)
                }
            }).catch(e=>{
                imageThumbnail=state.setting.seoThumbnail;
                console.error(e)})
                .then(imgModel => {
                    if(imgModel){
                        imageThumbnail=ImageUtils.getImageFromImageModel(imgModel);
                        dispatch(LandingPageEditorContext.actions.setSeoThumbnail(imageThumbnail))
                        setStSeoThumbnail(imageThumbnail);
                    }
                })
        }
        else{
            imageThumbnail=state.setting.seoThumbnail;
        }
        const body = $("#ldp-live-preview__iframe").contents().find("body")
        // console.log(body.html())
        // xmlMode will remove wrapper
        let cQuery = cheerio.load(body.html());
        // console.log(cQuery.html())

        // remove editor style
        cQuery('style').remove();

        // revert modal status
        cQuery('[gspopup]').toggleClass('modal fade')

        // remove hidden part
        const parts = state.setting.currentTemplate.thumbnail
        for (const {htmlId} of parts) {
            cQuery(`#${htmlId}`).removeAttr('hidden')
        }

        // set storeId
        cQuery('#storeId').val(CredentialUtils.getStoreId())

        // set filter
        cQuery('#primaryColorFilter').val(ColorUtils.hexToFilter(state.primaryColor))

        // remove .selected
        cQuery('.gs-selected').each( (index, cp) => {
            cQuery(cp).removeClass('gs-selected')
        })

        let contentHtml = cQuery('body').html()

        // upload image to s3
        const imagePool = state.imagePool
        for (const {file, tUrl} of imagePool) {
            // ignore removed file
            if (!contentHtml.includes(tUrl)) continue
            // upload to s3

            const imgRes = await mediaService.uploadFileWithDomain(file, MediaServiceDomain.GENERAL)
            const imageUrl = ImageUtils.getImageFromImageModel(imgRes)

            contentHtml = contentHtml.replace(tUrl, imageUrl)
        }
        let request = {
            id: state.id,
            contentHtml: contentHtml,
            customerTag: state.setting.customerTag,
            description: state.setting.description,
            status: LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT, // <=== landing page always draft when click save
            storeId: CredentialUtils.getStoreId(),
            templateId: state.setting.currentTemplate.id,
            title: state.setting.title,
            domainType: state.setting.domainType,
            primaryColor: state.primaryColor,
            fbPixelId: state.setting.fbId,
            ggAnalyticsId:state.setting.ggId,
            seoThumbnail:imageThumbnail,
            seoTitle: state.setting.seoTitle,
            seoDescription: state.setting.seoDescription,
            seoKeywords: state.setting.seoKeywords,
            popupMainShow: state.popupSettingShow,
            popupMainTime: state.popupSettingTime,
            fbChatId: state.setting.fbChatId,
            zlChatId: state.setting.zlChatId
        }

        // create domain
        if (state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE) {
            request = {
                ...request,
                slug: state.setting.domainValue,
                freeDomainType: state.setting.subDomainType
            }
        }
        if (state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM) {
            request = {
                ...request,
                slug: state.setting.domainValue,
                domain: state.setting.customDomain
            }
        }

        //
        return request;
    }

    const validate = async () => {

        const check = async () => {
            if (!state.setting.title) {
                setStShowSaveMessage(i18next.t('page.landingPage.editor.save.errorMessage.title'))
                return false
            }
            if (state.setting.title.length > 300) {
                setStShowSaveMessage(i18next.t('page.landingPage.editor.save.errorMessage.titleLength'))
                return false
            }

            const isSEOUrlValidRes = props.isValid && await props.isValid()

            if (!isSEOUrlValidRes) {
                setStShowSaveMessage(i18next.t('page.landingPage.editor.save.invalidDomain'))
                return false
            }
            if (state.setting.domainValue && state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE) {
                const patt = new RegExp(/^[A-Za-z0-9-]+$/)
                if (!patt.test(state.setting.domainValue)) {
                    setStShowSaveMessage(i18next.t('page.landingPage.editor.save.invalidDomain'))
                    return false
                }
            }

            if (state.setting.customerTag) {
                const patt = new RegExp(/^[A-Za-z0-9]+$/)
                if (!patt.test(state.setting.customerTag)) {
                    setStShowSaveMessage(i18next.t('page.landingPage.editor.save.errorMessage.invalidCustomerTag'))
                    return false
                }
            }

            if(state.popupSettingShow){
                const patt = new RegExp(/^[0-9]+$/)
                if (!patt.test(state.popupSettingTime)) {
                    setStShowSaveMessage(i18next.t('page.landingPage.editor.save.errorMessage.invalidSecondTime'))
                    return false
                }

                if(state.popupSettingTime < 3 || state.popupSettingTime > 90){
                    setStShowSaveMessage(i18next.t('page.landingPage.editor.save.errorMessage.invalidSecondTime'))
                    return false
                }
            }
            return true
        }

        let result = await check()


        // expand setting pane
        if (result === false && !state.isShowSetting) {
            dispatch(LandingPageEditorContext.actions.toggleSetting())
        }

        return result
    }


    const startSaveAndPublishTask = async () => {
        setStShowSaveMessage('')
        // check validate
        if (! await validate()) return
        if (!state.setting.domainValue && state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE) {
            setStShowSaveMessage(i18next.t('page.landingPage.editor.save.emptyDomain'))
            return
        }

        dispatch(LandingPageEditorContext.actions.setSaving(true))
        let requestBody = await buildRequest();
        if (props.mode === LANDING_PAGE_EDITOR_MODE.CREATE) {
            try {
                const result = await ThemeService.createLandingPage(requestBody)
                dispatch(LandingPageEditorContext.actions.setSaving(false))
                GSToast.success('page.landingPage.editor.save.successful', true)
                const id = result.id
                dispatch(LandingPageEditorContext.actions.setId(id))

                const resPublish = await ThemeService.publishLandingPage({
                    storeId: CredentialUtils.getStoreId(),
                    id: id
                })

                dispatch(LandingPageEditorContext.actions.setStatus(resPublish.status))
                dispatch(LandingPageEditorContext.actions.setSaving(false))

                setStShowPublishedModal(true)
            }catch (e) {
                if (e.response.data.errorKey === 'domain.and.slug.dublicate') {
                    refOkModal.current.openModal({
                        messages: i18next.t('page.landingPage.editor.duplicateCustomDomain'),
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        closeCallback: () => dispatch(LandingPageEditorContext.actions.setSaving(false))
                    })

                } else {
                    GSToast.commonError()
                }
            }
        } else { // => EDIT MODE
            try {
                const result = await ThemeService.updateLandingPage(requestBody)

                const resPublish = await ThemeService.publishLandingPage({
                    storeId: CredentialUtils.getStoreId(),
                    id: result.id
                })
                dispatch(LandingPageEditorContext.actions.setStatus(resPublish.status))
                dispatch(LandingPageEditorContext.actions.setSaving(false))
                setStShowPublishedModal(true)
            } catch (e) {
                if (e.response.data.errorKey === 'domain.and.slug.dublicate') {
                    refOkModal.current.openModal({
                        messages: i18next.t('page.landingPage.editor.duplicateCustomDomain'),
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        closeCallback: () => dispatch(LandingPageEditorContext.actions.setSaving(false))
                    })
                } else {
                    GSToast.commonError()
                }

            }
        }
    }


    const startSaveTask = async () => {
        setStShowSaveMessage('')
        // validate
        if (! await validate()) return
        dispatch(LandingPageEditorContext.actions.setSaving(true))
        let requestBody = await buildRequest();
        if (props.mode === LANDING_PAGE_EDITOR_MODE.CREATE) {
            ThemeService.createLandingPage(requestBody)
                .then(result => {
                    dispatch(LandingPageEditorContext.actions.setSaving(false))
                    GSToast.success('page.landingPage.editor.save.successful', true)
                    const id = result.id
                    // redirect to edit page
                    dispatch(LandingPageEditorContext.actions.setConfirmWhenRedirect(false))
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.LANDING_PAGE_EDIT +'/' + id);
                })
                .catch(e => {
                    GSToast.commonError()
                })
        } else {
            ThemeService.updateLandingPage(requestBody)
                .then(result => {
                    dispatch(LandingPageEditorContext.actions.setStatus(result.status))
                    dispatch(LandingPageEditorContext.actions.setSaving(false))
                    GSToast.success('page.landingPage.editor.save.update.successful', true)
                })
                .catch(e => {
                    GSToast.commonError()
                })
        }

    }
    const convertBlobURLToFile = (URL) => {
        return fetch(URL)
            .then(r => r.blob())
            .then(blobFile => {
                const [, extension] = blobFile.type.split('/')

                return new File([blobFile], uuidv4() + '.' + extension, {type: blobFile.type})
            })
    }
    const onClickSave = async () => {

        // mediaService.uploadFileWithDomain(state.setting.thumbnail, MediaServiceDomain.GENERAL)
        //     .then(result=>console.log(result));
        if (state.status === LANDING_PAGE_ENUM.PAGE_STATUS.PUBLISH) {

            refConfirmModal.current.openModal({
                messages: i18next.t('page.landingPage.editor.modal.saveWhenPublish'),
                okCallback: async () => {
                    await startUnPublishTask(false)
                    await startSaveTask()
                }
            })
        } else {
            await startSaveTask()
        }
    }

    const onClickCancel = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.LANDING_PAGE)
    }

    const startUnPublishTask = async (toast = true) => {
        dispatch(LandingPageEditorContext.actions.setSaving(true))
        try {
            const res = await ThemeService.draftLandingPage({
                storeId: CredentialUtils.getStoreId(),
                id: state.id
            })
            // update new status
            dispatch(LandingPageEditorContext.actions.setStatus(res.status))
            dispatch(LandingPageEditorContext.actions.setSaving(false))
            if (toast) GSToast.commonUpdate()
        } catch (e) {
            dispatch(LandingPageEditorContext.actions.setSaving(false))
            GSToast.commonError()

        }
    }


    const onClickPublic = (currentStatus) => {
        switch (currentStatus) {

            case LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT: // change from DRAFT to PUBLISH
                refConfirmModal.current.openModal({
                    messages: i18next.t('page.landingPage.editor.modal.publishConfirm'),
                    okCallback: async () => {

                        await startSaveAndPublishTask()
                    }
                })
                break
            case LANDING_PAGE_ENUM.PAGE_STATUS.PUBLISH: // change from PUBLISH to DRAFT
                refConfirmModal.current.openModal({
                    messages: i18next.t('page.landingPage.editor.modal.deactivateConfirm'),
                    okCallback: async () => {
                        await startUnPublishTask()
                    }
                })
                break
        }
    }

    const onClickViewSite = () => {
        window.open(resolveUrl(), '_blank')
    }

    const onClickDonePublish = () => {
        if (props.mode === LANDING_PAGE_EDITOR_MODE.CREATE) {
            // redirect to edit page
            dispatch(LandingPageEditorContext.actions.setConfirmWhenRedirect(false))
            setTimeout(() => {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.LANDING_PAGE_EDIT +'/' + state.id);
            }, 300)

        } else {
            setStShowPublishedModal(false)
        }
    }

    const onCopy = () => {
        const copyText = document.getElementById("url-hidden");

        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        document.execCommand("copy");

        GSToast.success('page.landingPage.editor.modal.btn.copied', true)
    }

    const onClickSetting = () => {
        dispatch(LandingPageEditorContext.actions.toggleSetting())
    }

    const renderStatus = () => {


        switch (state.status) {
            case LANDING_PAGE_ENUM.PAGE_STATUS.DRAFT:
                return <GSStatusTag
                    text={i18next.t('page.landingPage.editor.status.draft')}
                    className="landing-page-editor-live-preview__status"
                />
            case LANDING_PAGE_ENUM.PAGE_STATUS.PUBLISH:
                return <GSStatusTag
                    tagStyle={GSStatusTag.STYLE.SUCCESS}
                    text={i18next.t('page.landingPage.editor.status.published')}
                    className="landing-page-editor-live-preview__status"
                />
        }
    }

    return (
        <>
            <AlertModal ref={refOkModal}/>
            <Modal isOpen={stShowPublishedModal}>
                <ModalHeader>
                    <GSTrans t={"welcome.wizard.step6.title"}/>
                    <h6>
                        <GSTrans t={"page.landingPage.editor.modal.published"}/>
                    </h6>
                </ModalHeader>
                <ModalBody className="pb-2">
                    <code className="flex-grow-1 landing-page-editor-live-preview__modal-url-preview">
                        <span className="mr-2 cursor--pointer landing-page-editor-live-preview__modal-btn-copy"
                            title={i18next.t('page.landingPage.editor.modal.btn.copy')}
                              onClick={onCopy}
                        >
                            <FontAwesomeIcon icon={'copy'}/>
                        </span>
                        <input value={resolveUrl(state.id)} style={{
                            color: '#979797',
                            display: 'flex',
                            alignItems: 'center',
                            outline: 'none',
                            border: 'unset',
                            backgroundColor: 'unset',
                            fontFamily: 'monospace',
                            width: '100%',
                            minWidth: '400px'
                        }}
                            disabled
                        />
                    </code>
                    <input value={resolveUrl(state.id)} id="url-hidden" style={{
                        height: 0,
                        opacity: 0
                    }}/>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline onClick={onClickViewSite}>
                        <GSTrans t={"page.landingPage.editor.modal.btn.viewSite"}/>
                    </GSButton>
                    <GSButton success marginLeft onClick={onClickDonePublish}>
                        <GSTrans t={"common.btn.done"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
            <ConfirmModal ref={refConfirmModal}/>
            <section className="d-flex flex-column h-100">
            <div className="d-flex justify-content-end align-items-center mb-2">
                <GSButton secondary
                          outline
                          onClick={onClickSetting}
                          className={"landing-page-editor-live-preview__btn-setting landing-page-editor-live-preview__btn-setting--" + (state.isShowSetting? 'hide':'show')}
                          style={{
                    marginRight: 'auto',
                    minWidth: 'unset'
                }}>
                    <FontAwesomeIcon icon={"cog"}/>
                </GSButton>
                {stShowSaveMessage &&
                <AlertInline type={AlertInlineType.ERROR}
                            text={stShowSaveMessage}
                             nonIcon
                             textAlign={"right"}
                             className="landing-page-editor-live-preview__error-message"
                />}
                <GSButton marginLeft success disabled={!state.contentHtml} onClick={onClickSave}>
                    <GSTrans t="common.btn.save"/>
                </GSButton>
                <GSButton secondary outline marginLeft onClick={onClickCancel}>
                    <GSTrans t="common.btn.cancel"/>
                </GSButton>
            </div>
            <div className="landing-page-editor-live-preview gsa-border-color--gray flex-grow-1 d-flex flex-column">
                <div>
                    <div>
                        <span className="pl-3" style={{
                            fontSize: '1.5rem',
                            lineHeight: 1,
                            color: '#979797'
                        }}>
                            &#9900;&#9900;&#9900;
                        </span>
                    </div>
                    <div className="landing-page-editor-live-preview__address-bar">
                        <div className="landing-page-editor-live-preview__address d-flex">
                            {renderStatus()}
                            <b>|</b>
                            <input value={resolveUrl()}
                                   className="flex-grow-1 landing-page-editor-live-preview__url"
                                   disabled
                            />
                        </div>

                        {resolvePublishButtonText()}

                        <GSButton className={cn("landing-page-editor-live-preview__btn-mode",
                                {'selected': state.previewMode === LANDING_PAGE_ENUM.PREVIEW_MODE.WEB}
                            )}
                                  marginLeft
                                  onClick={() => setPreviewMode(LANDING_PAGE_ENUM.PREVIEW_MODE.WEB)}
                        >
                            <img src="/assets/images/theme/icon-website.svg" alt="desktop"/>
                        </GSButton>
                        <GSButton className={cn("landing-page-editor-live-preview__btn-mode",
                            {'selected': state.previewMode === LANDING_PAGE_ENUM.PREVIEW_MODE.MOBILE}
                        )}
                                  marginLeft
                                  onClick={() => setPreviewMode(LANDING_PAGE_ENUM.PREVIEW_MODE.MOBILE)}
                        >
                            <img src="/assets/images/theme/icon-mobile.svg" alt="mobile"/>
                        </GSButton>


                    </div>
                </div>

                <hr className="m-0"/>
                <LandingPageEditorLivePreviewHtmlParser html={state.contentHtml}
                                                        previewMode={state.previewMode}
                                                        currentHtmlId={state.setting.currentTemplateHtmlId}
                                                        editMode={props.mode}
                />
            </div>
        </section>
        </>
    );
};

LandingPageEditorLivePreview.defaultProps = {
    isValid: function () {
    }
}

LandingPageEditorLivePreview.propTypes = {
    mode: PropTypes.string,
    isValid: func
};

export default withRouter(LandingPageEditorLivePreview);
