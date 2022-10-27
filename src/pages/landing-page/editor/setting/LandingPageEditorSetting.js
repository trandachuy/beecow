import React, {useContext, useEffect, useRef, useState, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18next from 'i18next';
import {FormValidate} from '../../../../config/form-validate';
import {LANDING_PAGE_DOMAIN_OPTIONS, LANDING_PAGE_SUB_DOMAIN_OPTIONS} from '../LandingPageEditor';
import {LandingPageEditorContext} from '../context/LandingPageEditorContext';
import './LandingPageEditorSetting.sass'
import PrivateComponent from '../../../../components/shared/PrivateComponent/PrivateComponent';
import {PACKAGE_FEATURE_CODES} from '../../../../config/package-features';
import Modal from 'reactstrap/es/Modal';
import ModalHeader from 'reactstrap/es/ModalHeader';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import {cn} from '../../../../utils/class-name';
import {TokenUtils} from '../../../../utils/token';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {ThemeService} from './../../../../services/ThemeService';
import {Col, Row} from 'reactstrap';
import GSImg from '../../../../components/shared/GSImg/GSImg';
import {GSToast} from '../../../../utils/gs-toast';
import GSPagination from './../../../../components/shared/table/GSPagination/GSPagination';
import BackgroundPicker from '../../../theme/theme-making/sub-element-editor/shared/BackgroundPicker';
import {generatePath} from 'react-router-dom';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import {ThemeEngineService} from '../../../../services/ThemeEngineService'
import storageService from '../../../../services/storage'
import Constants from '../../../../config/Constant'

export const LANDING_PAGE_SUB_DOMAIN = process.env.GOSELL_LANDING_PAGE

const LandingPageEditorSetting = React.forwardRef((props, ref) => {
    const refButtonCustomDomain = useRef(null);
    const {state, dispatch} = useContext(LandingPageEditorContext.context);
    const [stShowDomainModal, setStShowDomainModal] = useState(false);
    const [stShowInstructionModal, setStShowInstructionModal] = useState(false);
    const [showModalTenplates, setShowModalTemplates] = useState(false)

    const [stIsFetching, setStIsFetching] = useState(true)
    const [listTheme, setListThemes] = useState([])

    const [stPaging, setStPaging] = useState({
        total: 0,
        page: 0,
        size: 6,
    })
    const [stClassName, setStClassName] = useState('')
    const [stError, setStError] = useState()

    useImperativeHandle(ref, () => ({
        isValid
    }))

    useEffect(() => {
        ThemeService.getAllLandingPage(0, 1000).then(result => {
            setStPaging(paging => ({
                ...paging,
                total: result.length
            }))
        })

    }, []);
    useEffect(() => {
        // reset free domain if switch
        // if (state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE) {
        //     dispatch(LandingPageEditorContext.actions.setDomainValue(''))
        // }
    }, [state.setting.domainType]);

    useEffect(() => {
        if (showModalTenplates == true) {
            fetchData()
        }
    }, [stPaging.page, showModalTenplates])



    const onChangeDomainSelector = (e) => {
        const {value} = e.currentTarget
        if (value === LANDING_PAGE_DOMAIN_OPTIONS.INSTRUCTION) {
            const current = state.setting.domainType
            setStShowInstructionModal(true)
            return
        }

        dispatch(LandingPageEditorContext.actions.setDomainType(value))
        if (value === LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM) {
            // clear domainValue
            dispatch(LandingPageEditorContext.actions.setDomainValue(''))
            setStShowDomainModal(true)
        }
        setStError()
    }

    const editTheme = (item) => {
        dispatch(LandingPageEditorContext.actions.setCurrentTemplate(item))
        // select the first part
        dispatch(LandingPageEditorContext.actions.setCurrentTemplateHtmlId(item.thumbnail[0].htmlId))
        // set content for preview
        dispatch(LandingPageEditorContext.actions.setContentHtml(item.content))
        setShowModalTemplates(!showModalTenplates)
    }

    const fetchData = () => {
        setStIsFetching(true)
        let listTemp = [];
        ThemeService.getAllLandingPage(stPaging.page, stPaging.size)
            .then(response => {
                response.map((item) => {
                    item.thumbnail = JSON.parse(item.thumbnail)
                    listTemp.push(item)
                })
                setListThemes(listTemp)
            })
            .catch(() => GSToast.error())

    }

    const handlePaging = (page) => {
        setStPaging(paging => ({
            ...paging,
            page: page
        }))
    }

    const handleCategory = () => {

    }

    const onChangeSubDomainSelector = e => {
        const {value} = e.currentTarget
        dispatch(LandingPageEditorContext.actions.setSubDomainType(value))
    }

    const onSubmitCustomDomain = (event, value) => {
        const {customDomain} = value
        dispatch(LandingPageEditorContext.actions.setCustomDomain(customDomain))
        setStShowDomainModal(false)
    }

    const onCancelCustomDomain = (e) => {
        if (!state.setting.customDomain) { // if custom domain is empty -> switch to free domain
            dispatch(LandingPageEditorContext.actions.setDomainType(LANDING_PAGE_DOMAIN_OPTIONS.FREE))
        }
        setStShowDomainModal(false)
    }

    const isValid = () => {
        return validateDomainValue(state.setting.domainValue)
    }

    const validateDomainValue = value => {
        return ThemeEngineService.validateSeoLink(value, {
            langKey: storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE),
            type: Constants.SEO_DATA_TYPE.LANDING_PAGE,
            data: state.id
        })
            .then(() => Promise.resolve(true))
            .catch(e => {
                const errorKey = e?.response?.data?.errorKey
                const params = e?.response?.data?.params

                setStError({
                    errorKey,
                    params
                })

                return Promise.resolve(false)
            })
    }

    const onBlurDomainValue = e => {
        const {value} = e.currentTarget

        setStError()

        validateDomainValue(value)
            .then(() => dispatch(LandingPageEditorContext.actions.setDomainValue(value)))
    }

    const onChangeTemplate = e => {
        const {value} = e
        const selectedTemplate = props.templateList.find(temp => temp.id === value)
        dispatch(LandingPageEditorContext.actions.setCurrentTemplate(selectedTemplate))
        // select the first part
        dispatch(LandingPageEditorContext.actions.setCurrentTemplateHtmlId(selectedTemplate.thumbnail[0].htmlId))
        // set content for preview
        dispatch(LandingPageEditorContext.actions.setContentHtml(selectedTemplate.content))
    }

    const onClickChangeTemplateHtmlId = (htmlId, hasSetting) => {
        dispatch(LandingPageEditorContext.actions.setCurrentTemplateHtmlId(htmlId))
        dispatch(LandingPageEditorContext.actions.setPopupHasSetting(hasSetting))
    }

    const onClickOkInstructionModal = () => {
        setStShowInstructionModal(false)
        setStShowDomainModal(true)
        dispatch(LandingPageEditorContext.actions.setDomainType(LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM))
    }

    const onChangeTitle = (e) => {
        const {value} = e.currentTarget
        dispatch(LandingPageEditorContext.actions.setTitle(value))
    }

    const onChangeDescription = (e) => {
        const {value} = e.currentTarget
        dispatch(LandingPageEditorContext.actions.setDescription(value))
    }

    const onChangeCustomerTag = e => {
        const {value} = e.currentTarget
        dispatch(LandingPageEditorContext.actions.setCustomerTag(value))
    }

    const onClickCloseSetting = e => {
        dispatch(LandingPageEditorContext.actions.toggleSetting())
    }

    const onChangeSettingFields = e => {
        const {name: fieldName, value} = e.currentTarget
        dispatch(LandingPageEditorContext.actions.setSettingField(fieldName, value))
    }
    const handleThumbnail=(thumbnail)=>{
        dispatch(LandingPageEditorContext.actions.setSeoThumbnail(thumbnail))
    }
    const handlePreviewLandingPage = (id) => {
        window.open(generatePath(NAV_PATH.previewLandingPage, {themeId: id}), "_blank")
    }

    return (
        <>
            <Modal className="popup-themes" isOpen={showModalTenplates}>
                <ModalHeader className="popup-themes__title">
                    <p>
                        <GSTrans>{i18next.t("page.landingPage.editor.chooseTemplate")}</GSTrans>
                    </p>
                    <GSImg  height={24}
                            className="cursor--pointer"
                            src="/assets/images/icon-close.svg"
                            onClick={()=>setShowModalTemplates(!showModalTenplates)}/>
                </ModalHeader>
                <ModalBody>
                    <Row className='mt-3'>{
                        stIsFetching?(
                            listTheme.map(theme=>{
                            return <Col md={4} key={theme.id} className='theme-library-template__item'>
                                <div className='position-relative'>
                                    <div className={'theme-library-template__item-img-fluid'} style={{backgroundImage: `url(${theme.thumbnail[0].thumbnail})`}}>
                                        {/*<GSImg src={theme.thumbnail[0].thumbnail} alt='master theme' className={'img-thumbnail'}*/}
                                        {/*/>*/}
                                    </div>
                                    <span className='font-weight-bold mt-auto d-block font-size-16px text-left'>{theme.name}</span>

                                    <div className='theme-library-template__item__actions'>
                                        <GSButton success onClick={(item)=>{
                                            setStClassName('show')
                                            editTheme(theme)}} >
                                            <GSTrans t={"page.themeEngine.library.button.edit"}/>
                                        </GSButton>
                                        <GSButton className='ml-2' onClick={() => handlePreviewLandingPage(theme.id)}>
                                            <GSTrans t={"page.themeEngine.library.button.view"}/>
                                        </GSButton>
                                    </div>
                                </div>
                            </Col>

                        })):(null)}
                    </Row>
                    <Row className='mt-3 justify-content-center'>
                        <GSPagination
                            totalPage={(stPaging.total%stPaging.size!=0)?(parseInt(stPaging.total/stPaging.size)+1):
                                (parseInt(stPaging.total/stPaging.size))}
                            totalItem={stPaging.total}
                            currentPage={stPaging.page}
                            pageSize={stPaging.size}
                            onChangePage={handlePaging}
                        >
                        </GSPagination>
                    </Row>

                </ModalBody>
                <ModalFooter>

                </ModalFooter>
            </Modal>
            {/*CUSTOM DOMAIN INSTRUCTION*/}
            <Modal isOpen={stShowInstructionModal} modalClassName="landing-page-editor-setting__instruction-modal">
                <ModalHeader>
                    <GSTrans t="page.landingPage.editor.setupDomainInstruction"/>
                    <p style={{
                        fontSize: '1rem',
                        fontWeight: 'normal'
                    }}>
                        <GSTrans t="page.landingPage.editor.configureYourDomainBeforePublish"/>
                    </p>

                </ModalHeader>
                <ModalBody>
                    <img width="100%"
                         src={`/assets/images/custom_domain_${i18next.language}.png`}
                         alt="instruction"
                         />
                </ModalBody>
                <ModalFooter>
                    <GSButton success onClick={onClickOkInstructionModal}>
                        <GSTrans t={"common.btn.ok"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            {/*SET CUSTOM DOMAIN*/}
            <Modal isOpen={stShowDomainModal}>
                <ModalHeader>
                    <GSTrans t="page.landingPage.domain.customDomain"/>

                </ModalHeader>

                    <ModalBody>
                        <AvForm onValidSubmit={onSubmitCustomDomain} autoComplete="off">
                            <button hidden ref={refButtonCustomDomain}>submit</button>
                            <AvField name="customDomain"
                                    placeholder={i18next.t("page.landingPage.editor.customDomainHint")}
                                     // label={i18next.t("page.landingPage.editor.customDomain")}
                                     defaultValue={state.setting.customDomain}
                                     validate={{
                                         ...FormValidate.pattern.domain,
                                         ...FormValidate.required(),

                                     }}
                            />
                        </AvForm>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton secondary outline onClick={onCancelCustomDomain}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success marginLeft onClick={() => refButtonCustomDomain.current.click()}>
                            <GSTrans t={"common.btn.ok"}/>
                        </GSButton>
                    </ModalFooter>
            </Modal>
            <div className="landing-page-editor-setting">
                <h5 className="mb-0 text-center landing-page-editor-setting__title">
                    <GSTrans t="page.landingPage.editor.setting"/>
                    <span onClick={onClickCloseSetting}>
                         <FontAwesomeIcon icon={'chevron-left'}/>
                    </span>
                </h5>
                <hr className="landing-page-editor-setting__hr--first"/>
                <div className="landing-page-editor__setting-form">
                    <AvForm  autoComplete="off">

                        {/*TITLE*/}
                        <AvField name="title"
                                 label={i18next.t("page.landingPage.editor.title")}
                                 placeholder={i18next.t("page.landingPage.editor.titlePlaceHolder")}
                                 validate={{
                                     ...FormValidate.required(),
                                     ...FormValidate.maxLength(255)
                                 }}
                                 onBlur={onChangeTitle}
                                 value={state.setting.title}
                        />

                        {/*DESCRIPTION*/}
                        <AvField name="description"
                                 type="textarea"
                                 label={i18next.t("page.landingPage.editor.description")}
                                 placeholder={i18next.t("page.landingPage.editor.descriptionPlaceHolder")}
                                 onBlur={onChangeDescription}
                                 value={state.setting.description}
                                 validate={{
                                     ...FormValidate.maxLength(255)
                                 }}
                        />

                        <hr/>

                        {/*CHOOSE TEMPLATE*/}
                        <div className="landing-page-editor-setting__template-selector">
                            {/*<AvField type="select"*/}
                            {/*         name="template-selector"*/}
                            {/*         label={i18next.t('page.landingPage.editor.pageTemplate')}*/}
                            {/*>*/}
                            {/*</AvField>*/}
                            <label className="gs-frm-input__label">
                                {i18next.t('page.landingPage.editor.pageTemplate')}
                            </label>
                            {/*<UikSelect*/}
                            {/*    className="landing-page-editor__page-template-selector"*/}
                            {/*    position="bottomRight"*/}
                            {/*    placeholder={i18next.t( "page.landingPage.editor.chooseTemplate")}*/}
                            {/*    options={props.templateList.map(template => {*/}
                            {/*        return {*/}
                            {/*            value: template.id,*/}
                            {/*            label: <TemplateOption thumbnail={template.thumbnail[0].thumbnail} tName={template.name}/>*/}
                            {/*        }*/}
                            {/*    })}*/}
                            {/*    defaultValue={state.setting.currentTemplate.id}*/}
                            {/*    onChange={onChangeTemplate}*/}
                            {/*    key={state.setting.currentTemplate.id}*/}
                            {/*/>*/}
                            <GSButton
                                className="landing-page-editor__page-template-selector"
                                position="bottomRight"
                                onClick={(e)=> {
                                    e.preventDefault() // avoid trigger on avform validation
                                    setShowModalTemplates(!showModalTenplates)
                                }}
                            >{i18next.t( "page.landingPage.editor.chooseTemplate")}</GSButton>


                        </div>


                        {/*TEMPLATE CONTENT*/}
                        {state.setting.currentTemplate &&
                            <div className={"landing-page-editor-setting__template-part-container "+stClassName}>
                                {
                                    state.setting.currentTemplate.thumbnail.map(thumbnail => {
                                        return (
                                            <div className={cn(
                                                "landing-page-editor-setting__template-part",
                                                {selected: state.setting.currentTemplateHtmlId === thumbnail.htmlId}
                                                )}
                                                onClick={() => onClickChangeTemplateHtmlId(thumbnail.htmlId, thumbnail.hasSetting)}
                                                 key={thumbnail.htmlId}
                                            >
                                                <img src={thumbnail.thumbnail}
                                                     alt={thumbnail.htmlId}
                                                />
                                                <span>{thumbnail.title}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }


                        <hr/>

                        {/*DOMAIN*/}
                        <div className="landing-page-editor__domain-selector">
                            <AvField type="select"
                                     name="domain-selector"
                                     label={i18next.t('page.landingPage.editor.domain')}
                                     value={state.setting.domainType}
                                     onChange={onChangeDomainSelector}
                                     className="text-center"
                            >
                                <option value={LANDING_PAGE_DOMAIN_OPTIONS.FREE}>
                                    {i18next.t('page.landingPage.domain.freeDomain')}
                                </option>
                                <option value={LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM} disabled={
                                    !TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0329])}>
                                    {i18next.t('page.landingPage.domain.customDomain')}
                                </option>
                                <option value={LANDING_PAGE_DOMAIN_OPTIONS.INSTRUCTION} disabled={
                                    !TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0329])
                                }>
                                    {i18next.t('page.landingPage.editor.setupDomainInstruction')}
                                </option>
                            </AvField>
                        </div>

                        {state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.FREE &&
                        <div className="landing-page-editor__domain-value-sub">
                            {/*SUBDOMAIN*/}
                            <AvField type="select"
                                     name="sub-domain-selector"
                                     value={state.setting.subDomainType}
                                     onChange={onChangeSubDomainSelector}
                                     hidden
                            >
                                <option value={LANDING_PAGE_SUB_DOMAIN_OPTIONS.LANDING_GOSELL}>
                                    {LANDING_PAGE_SUB_DOMAIN + '/'}
                                </option>
                                {/*<option value={LANDING_PAGE_SUB_DOMAIN_OPTIONS.SF_WEB}>*/}
                                {/*    {CredentialUtils.getStoreUrlByENV(false) + '/'}*/}
                                {/*</option>*/}
                            </AvField>
                            <span className="pt-2">
                                 {LANDING_PAGE_SUB_DOMAIN + '/'}
                            </span>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0103]}
                                checkPackageFeature={ state.setting.subDomainType === LANDING_PAGE_SUB_DOMAIN_OPTIONS.SF_WEB }
                            >
                                <AvField name="domain-value-sub"
                                         validate={{
                                             ...FormValidate.pattern.letterOrNumberOrHyphen(),
                                             ...FormValidate.withCondition(
                                                 state.setting.subDomainType === LANDING_PAGE_SUB_DOMAIN_OPTIONS.LANDING_GOSELL,
                                                 FormValidate.required()
                                             ),
                                             ...FormValidate.maxLength(150)
                                         } }
                                         value={ state.setting.domainValue }
                                         onBlur={ onBlurDomainValue }
                                />
                            </PrivateComponent>
                        </div>
                        }

                        {/*CUSTOM DOMAIN*/}
                        {state.setting.domainType === LANDING_PAGE_DOMAIN_OPTIONS.CUSTOM &&
                            <div className="landing-page-editor-setting__domain-custom">
                                {state.setting.customDomain &&
                                    <span className="p-2 cursor--pointer" onClick={() => setStShowDomainModal(true)}>
                                        {state.setting.customDomain + '/'}
                                    </span>
                                }
                                <AvField name="domain-value-custom"
                                         onBlur={ onBlurDomainValue }
                                         value={ state.setting.domainValue }
                                />
                            </div>
                        }

                        {
                            stError && <span className="error">
                                        <GSTrans t={ `component.landingPage.error.${ stError.errorKey }` }
                                                 values={ { params: stError.params } }/>
                                    </span>
                        }

                        <hr/>
                        {/*CUSTOMER tag*/}
                        <div className="landing-page-editor-setting__customer-tag-wrapper">
                            <AvField name="customer-tag"
                                     label={i18next.t('page.landingPage.editor.customerTag')}
                                     placeholder={i18next.t("page.landingPage.editor.customerTagIdHint")}
                                     onBlur={onChangeCustomerTag}
                                     value={state.setting.customerTag}
                                     validate={{
                                         ...FormValidate.maxLength(20),
                                         ...FormValidate.pattern.letterOrNumber()
                                     }}
                                     size={state.setting.customerTag.length}
                                     className={cn("landing-page-editor-setting__customer-tag",
                                         "landing-page-editor-setting__customer-tag" + (state.setting.customerTag? '--tagged':'--empty')
                                     )}
                            />
                        </div>

                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0339]}>
                            {/*FACEBOOK ID*/}
                            <AvField name="fbId"
                                     label={i18next.t('page.landingPage.editor.fbId')}
                                     placeholder={i18next.t("page.landingPage.editor.fbIdHint")}
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.fbId}
                                     onChange={onChangeSettingFields}
                            />

                            {/*GOOGLE ID*/}
                            <AvField name="ggId"
                                     label={i18next.t('page.landingPage.editor.ggId')}
                                     placeholder={i18next.t("page.landingPage.editor.ggIdHint")}
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.ggId}
                                     onChange={onChangeSettingFields}
                            />

                            {/*FACEBOOK CHAT ID*/}
                            <AvField name="fbChatId"
                                     label={i18next.t('page.landingPage.editor.fbChatId')}
                                     placeholder={i18next.t("page.landingPage.editor.fbChatIdHint")}
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.fbChatId}
                                     onChange={onChangeSettingFields}
                            />

                            {/*ZALO CHAT ID*/}
                            <AvField name="zlChatId"
                                     label={i18next.t('page.landingPage.editor.zlChatId')}
                                     placeholder={i18next.t("page.landingPage.editor.zlChatIdHint")}
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.zlChatId}
                                     onChange={onChangeSettingFields}
                            />
                      
                            {/*SEO THUMBNAIL*/}
                            <div className="seo-thumbnail">
                                <label className="title-seo-thumbnail">THUMBNAIL</label>
                                {   state.setting.seoThumbnail&&
                                    <BackgroundPicker
                                        defaultValue={state.setting.seoThumbnail}
                                        onChange={handleThumbnail}/>
                                }
                                {
                                    !state.setting.seoThumbnail&&
                                    <BackgroundPicker
                                        defaultValue={'/assets/images/default_image2.png'}
                                        onChange={handleThumbnail}/>
                                }
                            </div>

                            <hr/>
                        
                            {/*SEO Title*/}
                            <AvField name="seoTitle"
                                     label={i18next.t("component.seoEditor.seoTitle")}
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.seoTitle}
                                     onChange={onChangeSettingFields}
                            />

                            {/*SEO Description*/}
                            <AvField name="seoDescription"
                                     label={i18next.t("component.seoEditor.seoDescription")}
                                     type="textarea"
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.seoDescription}
                                     onChange={onChangeSettingFields}
                            />
                            
                            {/*SEO Keyword*/}
                            <AvField name="seoKeywords"
                                     label={i18next.t("component.seoEditor.seoKeywords")}
                                     validate={{
                                         ...FormValidate.maxLength(250)
                                     }}
                                     value={state.setting.seoKeywords}
                                     onChange={onChangeSettingFields}
                            />
                        </PrivateComponent>



                    </AvForm>
                </div>
            </div>
        </>
    );
});


const TemplateOption = ({thumbnail, tName}) => {
    return (
        <div className="landing-page-editor-setting__template-option d-flex flex-column justify-content-center p-2">
            <img src={thumbnail} width="100%" alt="thumbnail"/>
            <span className="text-center landing-page-editor-setting__template-option-title">{tName}</span>
        </div>
    )
}


LandingPageEditorSetting.propTypes = {
    templateList: PropTypes.arrayOf(PropTypes.shape({
        content: PropTypes.string,
        createdBy: PropTypes.string,
        createdDate: PropTypes.string,
        description: PropTypes.string,
        id: PropTypes.number,
        lastModifiedBy: PropTypes.string,
        lastModifiedDate: PropTypes.string,
        name: PropTypes.string,
        pageId: PropTypes.string,
        thumbnail: PropTypes.arrayOf(
            PropTypes.shape({
                thumbnail: PropTypes.string,
                htmlId: PropTypes.string,
                title: PropTypes.string,
            }),
        ),
    }))
};

export default LandingPageEditorSetting;
