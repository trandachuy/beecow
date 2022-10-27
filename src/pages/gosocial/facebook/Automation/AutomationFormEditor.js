import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import './AutomationFormEditor.sass'
import {Link} from 'react-router-dom'
import {Trans} from 'react-i18next'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import i18next from 'i18next'
import {NAV_PATH} from '../../../../components/layout/navigation/AffiliateNavigation'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import GSContentHeaderRightEl
    from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen'
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import {FormValidate} from '../../../../config/form-validate'
import {UikCheckbox, UikSelect, UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../../@uik'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import facebookService from '../../../../services/FacebookService'
import style from '../../../customers/Edit/CustomerEditor.module.sass'
import ConfirmModal, {ConfirmModalUtils} from '../../../../components/shared/ConfirmModal/ConfirmModal'
import SelectFbPostModal from '../../../../components/shared/SelectFbPostModal/SelectFbPostModal'
import GSTable from '../../../../components/shared/GSTable/GSTable'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import moment from 'moment'
import {RouteUtils} from '../../../../utils/route'
import AddButtonModal from "./AddButtonModal"
import Constants from "../../../../config/Constant";
import AutomationProductModal from "./AutomationProductModal";
import mediaService from "../../../../services/MediaService";
import {GSToast} from "../../../../utils/gs-toast";
import {CurrencyUtils} from "../../../../utils/number-format";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTagsSpace from "../../../../components/shared/form/GSTags/GSTagsSpace";
import {CredentialUtils} from "../../../../utils/credential";
import {AgencyService} from "../../../../services/AgencyService";


const SelectPostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 65%;
  border: 1px solid #D6D6D6;
  border-radius: 5px;
`
const SelectPostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
`
const SelectedLabel = styled.div`
  text-transform: uppercase;
  font-weight: 500;
  font-size: 12px;
`
const TableWrapper = styled.div`
  tr {
    th {
      background: #F7F7F7;
      color: black;
    }

    td, th {
      flex-basis: auto !important;
      flex-grow: 0;
    }

    td:nth-child(1),
    th:nth-child(1) {
      flex-basis: 15% !important;
    }

    td:nth-child(2),
    th:nth-child(2) {
      flex-grow: 10 !important;
      flex-basis: 5% !important;
    }

    td:nth-child(3),
    th:nth-child(3) {
      flex-basis: 20% !important;
    }

    td:nth-child(4),
    th:nth-child(4) {
      flex-basis: 5% !important;
    }
  }

  label {
    margin-top: 0;
  }
`
const TableBody = styled.tbody`
  max-height: 369px;
  overflow-y: auto;
`
const PostAction = styled.div`
  display: flex;
  
  img:first-child {
    margin-right: 25px;
  }
`

const TIME_TYPE = {
    IMMEDIATELY: 'IMMEDIATELY',
    SECONDS: 'SECONDS',
    MINUTES: 'MINUTES',
    HOURS: 'HOURS'
}

const CONSTANTS_AUTOMATION_MODE = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}

const CAMPAIGN_STATUS = {
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT'
}

const REPLY_IN_MESSENGER_STATUS = {
    ADD_TEXT: 'TEXT',
    ADD_IMAGE: 'IMAGE',
    ADD_PRODUCT: 'PRODUCT'
}

const DEFAULT_PAGE_VALUE = 'SELECTPAGE'

const AutomationFormEditor = props => {

    const refSaveForm = useRef()
    const refChangePage = useRef()
    const refChangeImage = useRef([])
    const refDeleteComponentModal = useRef()

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [stIsLoading, setStIsLoading] = useState(false)
    const [stToggle, setStToggle] = useState(false)
    const [stPageFbList, setStPageFbList] = useState([
        { label: i18next.t('page.gochat.facebook.automation.editor.selectPage'), value: DEFAULT_PAGE_VALUE }
    ])
    const [stDefaultPageFb, setStDefaultPageFb] = useState(
        { label: i18next.t('page.gochat.facebook.automation.editor.selectPage'), value: DEFAULT_PAGE_VALUE })
    const [stDefaultSelectTime, setStDefaultSelectTime] = useState({
        value: TIME_TYPE.IMMEDIATELY
    })
    const [stDefaultTime, setStDefaultTime] = useState(1)
    const [stCampaignName, setStCampaignName] = useState('')
    const [stTags, setStTags] = useState([])
    const [stEditorMode, setStEditorMode] = useState(CONSTANTS_AUTOMATION_MODE.CREATE)
    const [stCampaignStatus, setStCampaignStatus] = useState(false)
    const [stSwitchCampaignStatus, setStSwitchCampaignStatus] = useState(false)
    const [stErrorAutomation, setStErrorAutomation] = useState({
        errorPageFb: true,
        errorCampaignName: true,
        errorPost: true
    })
    const [stIdAutomation, setStIdAutomation] = useState(null)
    const [stSelectPostModalToggle, setStSelectPostModalToggle] = useState(false)
    const [stSelectedPosts, setStSelectedPosts] = useState([])
    const [stImage, setStImage] = useState(null)
    const [stListComponentReplyInMessenger, setStListComponentReplyInMessenger] = useState([
        {
            componentType: REPLY_IN_MESSENGER_STATUS.ADD_TEXT,
            error:false,
            textComponent: {
                textContent: i18next.t('page.gochat.facebook.automation.replyInMessenger.inputText'),
                buttons: []
            },
            imageComponent: null,
            products:null,
            isButton: false
        }
    ])
    const [stShowProductModal, setStShowProductModal] = useState(false)
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stIndexComponent, setStIndexComponent] = useState(-1)
    const [stIsResponseInComment, setStIsResponseInComment] = useState(false)
    const [stCommentContent , setStCommentContent ] = useState(i18next.t('page.gochat.facebook.automation.respondToComment.description'))
    const [stStoreConfig , setStStoreConfig ] = useState("")
    const [stIsAddItem, setStIsAddItem] = useState(false)
    const [stIsRemoveClassActive, setStIsRemoveClassActive] = useState(false)
    

    const SELECT_TIME = useMemo(() => [
        {
            label: i18next.t`page.gochat.facebook.automation.editor.filter.IMMEDIATELY`,
            value: TIME_TYPE.IMMEDIATELY
        },
        {
            label: i18next.t`page.gochat.facebook.automation.editor.filter.SECONDS`,
            value: TIME_TYPE.SECONDS
        },
        {
            label: i18next.t`page.gochat.facebook.automation.editor.filter.MINUTES`,
            value: TIME_TYPE.MINUTES
        },
        {
            label: i18next.t`page.gochat.facebook.automation.editor.filter.HOURS`,
            value: TIME_TYPE.HOURS
        }
    ], [])
    const [stOnScrollMessenger, setStOnScrollMessenger] = useState(0)
    const [stProductIndex, setStProductIndex] = useState({
        index: null,
        productIndex: null
    })

    useEffect(() => {
        fetchRequestToPageChat()
        fetchDetailAutomation()
    }, [])

    const fetchRequestToPageChat = () => {
        facebookService.getRequestToPageChat().then(pageFbList => {
            pageFbList.sort((pervious, current)=>{
                let compa = 0;
                if (pervious.pageName > current.pageName)
                    compa = 1;
                else if (pervious.pageName < current.pageName)
                    compa = -1;
                return compa;
            })
            setStPageFbList(prevState => [...prevState, ...pageFbList.map(b => (
                {
                label: b.pageName,
                value: b.pageId,
                avatar: b.avatar,
                id: b.id
            }))])
        })
    }

    const fetchDetailAutomation = () => {
        const path = props.match?.path
        const id = props.match?.params?.id

        if (path.includes(NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION_EDIT)) {
            setStEditorMode(CONSTANTS_AUTOMATION_MODE.EDIT)

            facebookService.getDetailAutomation(id)
                .then(result => {
                    if (result.automatedCampaignKeyword != null) {
                        setStTags(() => {
                            return result.automatedCampaignKeyword.map(a => ({
                                label: a.keywordContent,
                                value: a.keywordContent
                            }))
                        })
                    }
                    setStIdAutomation(result.id)
                    setStCampaignName(result.campaignName)
                    if(result?.timeValue){
                        setStDefaultTime(result?.timeValue)
                    }
                    setStDefaultSelectTime({
                        value: result.timeType
                    })
                    setStCampaignStatus(result.status === 'ACTIVE' ? true : false)
                    setStIsResponseInComment(result.isResponseInComment)
                    setStStoreConfig(result.storeConfig)
                    setStCommentContent(result.commentContent)

                    const listComponent = result.automatedCampaignComponent.map(component=>{
                        if(component.componentType === REPLY_IN_MESSENGER_STATUS.ADD_TEXT){
                            if(component.textComponent?.textContent === ""){
                               component.error = true
                            }

                            if(component.textComponent?.buttons.length > 0){
                                component.isButton = true
                            }else {
                                component.isButton = false
                            }
                        }
                        if(component.componentType === REPLY_IN_MESSENGER_STATUS.ADD_IMAGE){
                            if(!component.imageComponent.path){
                                component.error = true
                                component.imageComponent = null
                            }
                        }
                        if(component.componentType === REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT){
                            component.products = component.products.map(p=>{
                                if(p.buttons.length > 0){
                                    p.isButton = true
                                }else {
                                    p.isButton = false
                                }
                                return p
                            })
                        }
                        return component
                    })


                    setStListComponentReplyInMessenger(listComponent.sort((a, b)=>{
                        return a.index - b.index
                    }))

                    if(result.storeChat){
                        setStDefaultPageFb({
                            label: result.storeChat?.pageName,
                            value: result.storeChat?.pageId,
                            avatar: result.storeChat?.avatar,
                            id: result.storeChat?.id
                        })
                    }else {
                        setStDefaultPageFb({
                            label: i18next.t('page.gochat.facebook.automation.editor.selectPage'),
                            value: DEFAULT_PAGE_VALUE
                        })
                    }

                    setStSelectedPosts(result.campaignPosts)

                    if (result.campaignName !== '') {
                        setStErrorAutomation(error => ({
                            ...error,
                            errorCampaignName: false
                        }))
                    }
                    if (result?.storeChat?.pageId !== DEFAULT_PAGE_VALUE || !result?.storeChat) {
                        setStErrorAutomation(error => ({
                            ...error,
                            errorPageFb: false
                        }))
                    }
                    if (result.campaignPosts.length > 0) {
                        setStErrorAutomation(error => ({
                            ...error,
                            errorPost: false
                        }))
                    }
                })

        }else {
            facebookService.getStoreConfig().then(storeConfig => {
                setStStoreConfig(storeConfig)
            })
        }
    }


    const handleSubmitSave = (event, value) => {
        const automatedCampaignKeyword = []

        stTags.forEach(tag => automatedCampaignKeyword.push({ keywordContent: tag.value }))

        const data = {
            storeId: CredentialUtils.getStoreId(),
            pageId: stDefaultPageFb.value === DEFAULT_PAGE_VALUE ? null : stDefaultPageFb.value,
            campaignName: stCampaignName,
            timeValue: stDefaultSelectTime.value == TIME_TYPE.IMMEDIATELY ? null : +(value?.time),
            timeType: stDefaultSelectTime.value,
            status: stCampaignStatus ? CAMPAIGN_STATUS.ACTIVE : CAMPAIGN_STATUS.DRAFT,
            automatedCampaignKeyword: automatedCampaignKeyword,
            storeChatId: stDefaultPageFb.id,
            campaignPosts: stSelectedPosts,
            automatedCampaignComponent:stListComponentReplyInMessenger,
            isResponseInComment: stIsResponseInComment,
            storeConfig:stStoreConfig,
            commentContent:stCommentContent
        }

        data.automatedCampaignComponent.map((component,index)=>{
            component.index = index
        })

        if (stEditorMode == CONSTANTS_AUTOMATION_MODE.CREATE) {
            facebookService.createAutomation(data)
                .then((note) => {
                    GSToast.commonCreate()
                    props.history.push(NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION)
                })
                .catch(error => {
                    GSToast.commonError()
                })
                .finally(() => {
                })
            return
        }

        data.id = value.id
        facebookService.updateAutomation(data)
            .then((note) => {
                GSToast.commonUpdate()
                fetchDetailAutomation()
                setStSwitchCampaignStatus(false)
                setStIsRemoveClassActive(false)
            })
            .catch(error => {
                GSToast.commonError()
            })
            .finally(() => {
            })


    }

    const handleToggle = () => {
        setStToggle(toggle => !toggle)
    }

    const onChangePage = (page) => {

        if(stEditorMode === CONSTANTS_AUTOMATION_MODE.CREATE){
            setStSelectedPosts([])
        }

        if (stEditorMode == CONSTANTS_AUTOMATION_MODE.EDIT && stDefaultPageFb.value != page.value) {
            ConfirmModalUtils.openModal(refChangePage, {
                messages: <><p>{ i18next.t(`page.gochat.facebook.automation.edit.modal.description`) }</p>
                    <p>{ i18next.t(`page.gochat.facebook.automation.edit.modal.description2`) }</p>
                </>,
                modalTitle: i18next.t`page.affiliate.list.deleteConfirmText`,
                okCallback: () => {
                    setStDefaultPageFb(page)
                    setStSelectedPosts([])
                    setStErrorAutomation(error => ({
                        ...error,
                        errorPost: true
                    }))

                    if (page.value === DEFAULT_PAGE_VALUE) {
                        setStErrorAutomation(error => ({
                            ...error,
                            errorPageFb: true
                        }))

                    } else {
                        setStErrorAutomation(error => ({
                            ...error,
                            errorPageFb: false
                        }))
                    }
                }
            })
            return
        }

        if (page.value === DEFAULT_PAGE_VALUE) {
            setStErrorAutomation(error => ({
                ...error,
                errorPageFb: true
            }))

        } else {
            setStErrorAutomation(error => ({
                ...error,
                errorPageFb: false
            }))
        }
        setStDefaultPageFb(page)
    }

    const onChangeTime = (event) => {
        const value = event.value

        setStDefaultSelectTime({
            value: value
        })

    }

    const onChangeTags = (value) => {
        setStTags(value)
    }

    const toggleOnOrOff = (e) => {
        setStSwitchCampaignStatus(true)
        if (!stSwitchCampaignStatus){
            setStIsRemoveClassActive(true)   
        }
        const checkListProductError = stListComponentReplyInMessenger.filter(product=>product.error === true)
        const checkButtonError = stListComponentReplyInMessenger.filter(product => product.isButton === false)
        const checkButtonErrorInProductList = stListComponentReplyInMessenger.filter(product => {
            const isCheckButton = product.products?.filter(p => !p.isButton)
            return product.products?.length > 0 ?  isCheckButton?.length > 0 : false
        })

        if (e.target.checked && !stErrorAutomation.errorCampaignName
            && !stErrorAutomation.errorPageFb
            && !stErrorAutomation.errorPost
            && stListComponentReplyInMessenger.length > 0
            && checkListProductError.length === 0
            && !(stDefaultTime == 0 || stDefaultTime == "")
            && checkButtonError.length === 0
            && checkButtonErrorInProductList.length === 0
        ) {
            setStCampaignStatus(true)
            refSaveForm.current.submit()
            return
        }
        if(!e.target.checked){
            refSaveForm.current.submit()
        }
        setStCampaignStatus(false)
    }

    const handleSavePosts = posts => {
        setStSelectedPosts(posts)
        setStSelectPostModalToggle(false)


        if (posts.length > 0) {
            setStErrorAutomation(error => ({
                ...error,
                errorPost: false
            }))
            return;
        }

        setStErrorAutomation(error => ({
            ...error,
            errorPost: true
        }))

    }

    const handleDeleteSelectedPost = postId => {
        setStSelectedPosts(posts => {
            if (posts.filter(p => p.postId !== postId).length === 0) {
                setStErrorAutomation(error => ({
                    ...error,
                    errorPost: true
                }))
            }
            return posts.filter(p => p.postId !== postId)
        })
    }


    const handleAddComponentReplyInMessenger = (status) =>{
        if(stListComponentReplyInMessenger.length < 10){
            switch (status) {
                case REPLY_IN_MESSENGER_STATUS.ADD_TEXT:
                    const dataAddText = {
                        componentType: REPLY_IN_MESSENGER_STATUS.ADD_TEXT,
                        error:false,
                        textComponent: {
                            textContent: i18next.t('page.gochat.facebook.automation.replyInMessenger.inputText'),
                            buttons: []
                        },
                        imageComponent: null,
                        products:null,
                        isButton:false
                    }

                    setStListComponentReplyInMessenger(lcrim => [dataAddText,...lcrim])
                    break
                case REPLY_IN_MESSENGER_STATUS.ADD_IMAGE:
                    const dataAddImage = {
                        componentType:REPLY_IN_MESSENGER_STATUS.ADD_IMAGE,
                        error: true,
                        imageComponent: null,
                        textComponent: null,
                        products:null,
                        isButton:true
                    }

                    setStListComponentReplyInMessenger(lcrim => [dataAddImage,...lcrim])
                    break
                case REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT:
                    const dataAddProduct = {
                        componentType: REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT,
                        products:[],
                        textComponent: null,
                        imageComponent: null,
                        url:`https://${CredentialUtils.getStoreUrl()}.${AgencyService.getStorefrontDomain()}`,
                        isButton:true
                    }
                    setStIsAddItem(false)
                    setStListComponentReplyInMessenger(lcrim => [dataAddProduct,...lcrim])
                    break
            }
        }
    }

    const hanleChangeValueComponent = (e,index) =>{
        const value = e.target.value

        if (value === ""){
            setStListComponentReplyInMessenger(lcrim=>{
                lcrim[index].error = true
                return lcrim
            })
        }else {
            setStListComponentReplyInMessenger(lcrim=>{
                lcrim[index].error = false
                return lcrim
            })
        }


        setStListComponentReplyInMessenger(lcrim=>{
            lcrim[index].textComponent.textContent = value
            return lcrim
        })
        forceUpdate()

    }

    const hanleChangeCommentContent = (e) =>{
        const value = e.target.value
        setStCommentContent(value)


    }

    const getDataAddButton = (data,index,productIndex,status) =>{
        setStIsRemoveClassActive(false)
        setStProductIndex({
            index,
            productIndex
        })
        if (status === REPLY_IN_MESSENGER_STATUS.ADD_TEXT){
            setStListComponentReplyInMessenger(lcrim=>{
                lcrim[index].textComponent.buttons = data
                lcrim[index].isButton = data.length > 0
                return lcrim
            })
            forceUpdate()
            return
        }

        setStListComponentReplyInMessenger(lcrim=>{
            lcrim[index].products[productIndex].buttons = data
            lcrim[index].products[productIndex].isButton = data.length > 0
            return lcrim
        })
        forceUpdate()
    }

    const onImageChange =(e,index) => {
        if (e.target.files && e.target.files[0]) {
            let img = e.target.files[0];
            setStImage(URL.createObjectURL(img))
            mediaService.uploadFileWithDomain(img, 'ITEM')
                .then(result=>{
                    setStListComponentReplyInMessenger(lcrim=>{
                        lcrim[index].imageComponent = result
                        lcrim[index].error = false
                        return lcrim
                    })
                    forceUpdate()
                })
        }
    };

    const handleProductModalClose = (type,products) => {
        setStShowProductModal(false)
        // add new
        if (stIndexComponent == -1 && ((type,products?.length === 0) || (!type))) {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim.shift()
                return lcrim
            })
            setStSelectedProducts([])
            setStIndexComponent(-1)
            return
        }

        // added
        if (stIndexComponent != -1 && ((type,products?.length === 0) || (!type, products?.length === 0))) {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim.splice(stIndexComponent,1)
                return lcrim
            })
            setStSelectedProducts([])
            setStIndexComponent(-1)
            return
        }

        if(!type){
            setStSelectedProducts([])
            setStIndexComponent(-1)
            return;
        }

        if (stSelectedProducts.length > 0){
            setStListComponentReplyInMessenger(lcrim=>{
                let idsProductNew = new Set(lcrim[stIndexComponent].products.map(p => p.modelId !== '' ? p.modelId : p.itemId));
                let mergedNew = products.filter(p => !idsProductNew.has(p.modelId !== '' ? p.modelId : p.itemId)).map(item => {
                    return { itemId: item.itemId, modelId: item.modelId, productDetail: item, isButton: false }
                })
                let idsProductOld = new Set(products.map(p => p.modelId !== '' ? p.modelId : p.itemId));
                let mergedOld = lcrim[stIndexComponent].products.filter(p => idsProductOld.has(p.modelId !== '' ? p.modelId : p.itemId))
                lcrim[stIndexComponent].products = [...mergedOld, ...mergedNew]
                return lcrim
            })
        }else {
            setStListComponentReplyInMessenger(lcrim=>{
                lcrim[0].products = products.map(item=> {
                    return {itemId: item.itemId,modelId: item.modelId, productDetail: item, isButton: false}
                })
                return lcrim
            })
        }
        setStIndexComponent(-1)
        setStSelectedProducts([])
    }

    const hanleAddProduct = (e,index) =>{
        setStSelectedProducts(_.cloneDeep(stListComponentReplyInMessenger[index].products.map(p=>{return p.productDetail})))
        setStShowProductModal(true)
        setStIndexComponent(index)
        setStIsAddItem(true)
    }

    const hanleDeleteProduct = (e,index,modelId,itemId) =>{
        setStListComponentReplyInMessenger(lcrim=>{
            lcrim[index].products = lcrim[index].products.filter(id => modelId ? id.modelId !== modelId : id.itemId !== itemId)
            if(lcrim[index].products.length === 0){
                setStListComponentReplyInMessenger(lcrim => {
                    lcrim.splice(index,1)
                    return lcrim
                })
            }
            return lcrim
        })
        forceUpdate()
    }

    const handleDeleteComponent = (e,index) =>{

        ConfirmModalUtils.openModal(refDeleteComponentModal, {
            messages: <><p>{i18next.t('page.gochat.facebook.automation.replyInMessenger.delete.component')}</p></>,
            modalTitle: i18next.t`page.affiliate.list.deleteConfirmText`,
            modalBtnOk: i18next.t('common.btn.delete'),
            okCallback: () => {
                setStListComponentReplyInMessenger(lcrim => {
                    lcrim.splice(index,1)
                    return lcrim
                })
                forceUpdate()
            }
        })
    }

    const handleMoveComponent = (e,to) =>{
        setStListComponentReplyInMessenger(lcrim => {
            let temp = lcrim[0];
            lcrim[0] = lcrim[to];
            lcrim[to] = temp;
            return lcrim
        })
        forceUpdate()
    }

    const handleChangeTime = (e) =>{
        const value = e.currentTarget.value
        setStDefaultTime(value)


    }

    const onScrollMessenger = (event) => {
        const obj = event.currentTarget
        setStOnScrollMessenger(obj.scrollTop)
        setStIsRemoveClassActive(false)
    }

    const renderHeader = () => {
        switch (stEditorMode) {
            case CONSTANTS_AUTOMATION_MODE.CREATE:
                return (
                    <>
                        <div className="automation-form-header">
                            <div className="title">
                                <Link to={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION }
                                      className="color-gray mb-2 d-block text-capitalize">
                                    &#8592; <GSTrans t="page.gochat.facebook.automation.editor.backToAutomation"/>
                                </Link>
                                <h5 className="gs-page-title">
                                    {
                                        <GSTrans t="page.gochat.facebook.automation.editor.createCampaign"/>
                                    }
                                </h5>
                            </div>

                        </div>

                        <GSContentHeaderRightEl>
                            <div className="gss-content-header--action-btn">
                                <div className="gss-content-header--action-btn--group">
                                    <UikToggle
                                        checked={ stCampaignStatus }
                                        className="m-0 p-0"
                                        onChange={ (e) => toggleOnOrOff(e) }
                                    />
                                    {/*BTN SAVE*/ }
                                    <GSButton onClick={ (e) => {
                                        e.preventDefault()
                                        refSaveForm.current.submit()
                                    } } success className="btn-save" marginRight style={ { marginLeft: 'auto' } }>
                                        <Trans i18nKey={ 'common.btn.save' } className="sr-only">
                                            Save
                                        </Trans>
                                    </GSButton>
                                </div>
                            </div>
                        </GSContentHeaderRightEl>
                    </>
                )


            case CONSTANTS_AUTOMATION_MODE.EDIT:
                return (
                    <>
                        <div className="automation-form-header">
                            <div className="title">
                                <Link to={ NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION }
                                      className="color-gray mb-2 d-block text-capitalize">
                                    &#8592; <GSTrans t="page.gochat.facebook.automation.editor.backToAutomation"/>
                                </Link>
                                <h5 className="gs-page-title">
                                    {
                                        <GSTrans t="page.gochat.facebook.automation.editor.editCampaign"/>
                                    }
                                </h5>
                            </div>

                        </div>

                        <GSContentHeaderRightEl>
                            <div className="gss-content-header--action-btn">
                                <div className="gss-content-header--action-btn--group">
                                    <UikToggle
                                        checked={ stCampaignStatus }
                                        className="m-0 p-0"
                                        onChange={ (e) => toggleOnOrOff(e) }
                                    />
                                    {/*BTN SAVE*/ }
                                    <GSButton disabled={stCampaignStatus} onClick={ (e) => {
                                        e.preventDefault()
                                        refSaveForm.current.submit()
                                    } } success className="btn-save" marginRight style={ { marginLeft: 'auto' } }>
                                        <Trans i18nKey={ 'common.btn.save' } className="sr-only">
                                            Save
                                        </Trans>
                                    </GSButton>
                                </div>
                            </div>
                        </GSContentHeaderRightEl>
                    </>
                )

            default:
                return (<></>)

        }
    }


    const renderTime = () => {

        switch (stDefaultSelectTime.value) {
            case TIME_TYPE.SECONDS:
                return (
                    <AvField
                        name="time"
                        type={ 'number' }
                        className="input-field__hint"
                        validate={ {
                            ...FormValidate.required(),
                            ...FormValidate.minValue(1),
                            ...FormValidate.maxValue(86400)

                        } }
                        value={ stDefaultTime }
                        disabled={ stCampaignStatus }
                        onBlur={handleChangeTime}
                    />
                )
                break
            case TIME_TYPE.MINUTES:
                return (
                    <AvField
                        name="time"
                        type={ 'number' }
                        className="input-field__hint"
                        validate={ {
                            ...FormValidate.required(),
                            ...FormValidate.minValue(1),
                            ...FormValidate.maxValue(1440)

                        } }
                        value={ stDefaultTime }
                        disabled={ stCampaignStatus }
                        onBlur={handleChangeTime}
                    />
                )
                break
            case TIME_TYPE.HOURS:
                return (
                    <AvField
                        name="time"
                        type={ 'number' }
                        className="input-field__hint"
                        validate={ {
                            ...FormValidate.required(),
                            ...FormValidate.minValue(1),
                            ...FormValidate.maxValue(24)

                        } }
                        value={ stDefaultTime }
                        disabled={ stCampaignStatus }
                        onBlur={handleChangeTime}
                    />
                )
                break
        }
    }

    const renderComponentReplyInMessenger = (value,index) => {
        switch (value.componentType) {
            case REPLY_IN_MESSENGER_STATUS.ADD_TEXT:
                return(
                    <div className="container">
                        {!stCampaignStatus &&
                        <div className="action">
                            <i onClick={e=>handleMoveComponent(e,index)}></i>
                            <i onClick={e=>handleDeleteComponent(e,index)}></i>
                        </div>
                        }

                        <div className="content-add-text">
                            {value.error &&

                            <GSComponentTooltip
                                className="error"
                                placement={GSComponentTooltipPlacement.TOP}
                                interactive
                                style={{
                                    width: "fit-content",
                                    display: "inline"
                                }}
                                html={
                                    <GSTrans t="page.gochat.facebook.automation.replyInMessenger.error.characters"></GSTrans>
                                }
                            >
                                <img className="" src="/assets/images/vector-error.png"/>
                            </GSComponentTooltip>

                            }

                            <textarea className={value.error ? "form-control form-control-error" : "form-control"} rows="2" name="text"
                                      value={value.textComponent.textContent}
                                      onChange={e => hanleChangeValueComponent(e,index)}
                                      maxlength="640"
                                      required
                                      disabled={stCampaignStatus}
                            >
                            </textarea>
                            <AddButtonModal
                                submitButton={getDataAddButton}
                                index={index}
                                listButton={value?.textComponent?.buttons}
                                status={REPLY_IN_MESSENGER_STATUS.ADD_TEXT}
                                campaignStatus={stCampaignStatus}
                                isButton={value.isButton}
                                switchCampaignStatus={stSwitchCampaignStatus}
                                onScrollMessenger={stOnScrollMessenger}
                                type={'text'}
                            />
                        </div>
                    </div>
                )
                break
            case REPLY_IN_MESSENGER_STATUS.ADD_IMAGE:
                return (
                    <div className="container">
                        {!stCampaignStatus &&
                            <div className="action">
                                <i onClick={e=>handleMoveComponent(e,index)}></i>
                                <i onClick={e=>handleDeleteComponent(e,index)}></i>
                            </div>
                        }
                        <div className={!value.imageComponent && value.error ? "content-add-image content-add-image-error pb-5 pt-5" : "content-add-image"}>
                            {value.error &&
                            <img className="error" src="/assets/images/vector-error.png"/>

                            }
                            {value.imageComponent &&
                                <img onClick={()=>!stCampaignStatus && refChangeImage.current[index].click()}
                                     className={stCampaignStatus ? "show-img" : "show-img cursor--pointer"}
                                src={`${value.imageComponent?.path}/${value.imageComponent?.name}.${value.imageComponent?.extension}`} />
                            }
                            <div className={!value.imageComponent ? "custom-file" : "custom-file d-none"}>
                                {!value.imageComponent &&
                                    <div onClick={()=>refChangeImage.current[index].click()}>
                                        <img src="/assets/images/default_image_fb.png"/>
                                        <p className="m-0">{i18next.t('page.gochat.facebook.automation.replyInMessenger.image')}</p>
                                    </div>
                                }
                                <input ref={el => refChangeImage.current[index] = el} type="file" className="custom-file-input d-none"
                                       id="customFile" name="image" onChange={e=>onImageChange(e,index)}/>
                            </div>
                        </div>
                    </div>
                )
                break
            case REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT:
                return (
                   <>
                       {value.products.length > 0 &&
                       <div className="container">
                           {!stCampaignStatus &&
                           <div className="action">
                               <i onClick={e=>handleMoveComponent(e,index)}></i>
                               <i onClick={e=>handleDeleteComponent(e,index)}></i>
                           </div>
                           }
                           <div className="content-add-product w-100">
                               <div className="row">
                                   <div className="col-md-12">
                                       <div id={`custCarousel-${index}`} className="carousel slide"
                                            data-ride="carousel" align="center">
                                           <div className="carousel-inner" key={value.products}>
                                               {value.products.map((product,productIndex)=>{
                                                   if (stIsRemoveClassActive){
                                                       const removeClassActive = document.querySelectorAll('.hide-active')
                                                       const addClassActive = document.querySelectorAll('.carousel-item')
                                                       for (let i = 0; i < removeClassActive.length; i++) {
                                                           removeClassActive[i].classList.remove('active');
                                                       }
                                                       if (addClassActive[value.products.findIndex(i => i.isButton === false)]) {
                                                           addClassActive[value.products.findIndex(i => i.isButton === false)].classList.add('active');
                                                       }
                                                   }
                                                   return (
                                                       <div key={ productIndex }
                                                            className={ (stSwitchCampaignStatus ?
                                                                stIsRemoveClassActive ?
                                                                    value.products.findIndex(i => i.isButton === false) === productIndex ? 'carousel-item active' : 'carousel-item hide-active' :
                                                                    (stProductIndex.index === index && stProductIndex.productIndex === productIndex) ? 'carousel-item active' : 'carousel-item'
                                                                : productIndex === 0 ? 'carousel-item active' : 'carousel-item') }>
                                                           <div className="box-product">

                                                               <div className="box-image">
                                                                   {!stCampaignStatus &&
                                                                   <i onClick={e=>hanleDeleteProduct(e,index,product.modelId,product.itemId)}></i>
                                                                   }
                                                                   <GSImg src={product?.productDetail?.itemImage}/>
                                                               </div>
                                                               <div className="content">
                                                                   <p className="title line-clamp-2">{product?.productDetail?.itemName}</p>
                                                                   <p className="price">
                                                                       {CurrencyUtils.formatMoneyByCurrency(
                                                                           product?.productDetail?.price,
                                                                           product?.productDetail?.currency
                                                                       )}
                                                                   </p>
                                                                   <div className="color-size">
                                                                       {product.productDetail?.modelLabel?.split('|').length > 0 &&
                                                                       <>
                                                                           {product.productDetail?.modelLabel.split('|').map((label,index)=>{
                                                                               if(label === "[d3p0s1t]"){
                                                                                   return (
                                                                                       <>
                                                                                           <p>{product.productDetail?.modelName.split('|')[index]}</p>
                                                                                           <span> | </span>
                                                                                       </>
                                                                                   )
                                                                               }
                                                                               return(
                                                                                   <>
                                                                                       <p>{label}: {product.productDetail?.modelName.split('|')[index]}</p>
                                                                                       <span> | </span>
                                                                                   </>
                                                                               )
                                                                           })}
                                                                       </>
                                                                       }

                                                                       {product.productDetail?.modelLabel?.split('|').length === 0 &&
                                                                       <>
                                                                           <p className="color">{product.productDetail?.modelLabel}: {product.productDetail?.modelName}</p>
                                                                           <span>|</span>
                                                                           <p className="size">{product.productDetail?.modelLabel}: {product.productDetail?.modelName}</p>
                                                                       </>
                                                                       }
                                                                   </div>
                                                                   <p className="url">{`${CredentialUtils.getStoreUrl()}.${AgencyService.getStorefrontDomain()}`}</p>

                                                               </div>
                                                           </div>
                                                           <AddButtonModal
                                                               submitButton={getDataAddButton}
                                                               index={index}
                                                               productIndex={productIndex}
                                                               listButton={product?.buttons}
                                                               status={REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT}
                                                               campaignStatus={stCampaignStatus}
                                                               isButton={ product?.isButton }
                                                               switchCampaignStatus={ stSwitchCampaignStatus }
                                                               type={'product'}
                                                               onScrollMessenger={stOnScrollMessenger}
                                                           />
                                                       </div>
                                                   )
                                               })}
                                           </div>
                                           <a className="carousel-control-prev" href={`#custCarousel-${index}`} data-slide="prev">
                                               <img src={"/assets/images/automation/automation-left-opacity.png"}
                                                    onMouseOver={e=>(e.currentTarget.src = "/assets/images/automation/automation-left-no-opacity.png")}
                                                    onMouseOut={e=>(e.currentTarget.src = "/assets/images/automation/automation-left-opacity.png")} />
                                           </a>
                                           {stEditorMode === CONSTANTS_AUTOMATION_MODE.EDIT && stCampaignStatus &&
                                           <a className="carousel-control-next" href={`#custCarousel-${index}`} data-slide="next">
                                               <a className="carousel-control-prev" href={`#custCarousel-${index}`} data-slide="prev">
                                                   <img src={"/assets/images/automation/automation-left-opacity.png"}
                                                        onMouseOver={e=>(e.currentTarget.src = "/assets/images/automation/automation-left-no-opacity.png")}
                                                        onMouseOut={e=>(e.currentTarget.src = "/assets/images/automation/automation-left-opacity.png")} />
                                               </a>
                                           </a>
                                           }

                                           {!stCampaignStatus &&
                                           <a className="carousel-control-next" onClick={(e)=>hanleAddProduct(e,index)}>
                                               <img src={"/assets/images/automation/automation-plus-circle-grey.png"}
                                                    onMouseOver={e=>(e.currentTarget.src = "/assets/images/automation/automation-plus-circle-blue.png")}
                                                    onMouseOut={e=>(e.currentTarget.src = "/assets/images/automation/automation-plus-circle-grey.png")} />

                                           </a>
                                           }
                                           <ol className="carousel-indicators list-inline">
                                               {value.products.map((product,productIndex)=>{
                                                   return (
                                                       <li key={productIndex} className={productIndex===0 ? "list-inline-item active" : "list-inline-item"}><a
                                                           id={`carousel-selector-${productIndex}`}
                                                           className="selected"
                                                           data-slide-to={productIndex}
                                                           data-target={`#custCarousel-${index}`}>
                                                           <img src={ product.productDetail?.itemImage }
                                                                className={stSwitchCampaignStatus && !product.isButton ? "img-fluid error" : "img-fluid"}/> </a>
                                                       </li>
                                                   )
                                               })}
                                           </ol>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                       }
                   </>

                )
                break
        }
    }


    return (
        <GSContentContainer minWidthFitContent className="automation-form-editor">
            <ConfirmModal ref={refDeleteComponentModal} modalClass={"delete-component-reply-in-messenger"}/>
            {stShowProductModal &&
                <AutomationProductModal
                    productSelectedList={stSelectedProducts}
                    onClose={handleProductModalClose}
                    type={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                    showSearchOption={true}
                    campaignStatus={stCampaignStatus}
                    isAddItem={stIsAddItem}
                />
            }
            { stIsLoading &&
            <LoadingScreen zIndex={ 9999 }/>
            }
            <ConfirmModal ref={ refChangePage } modalClass={ 'modal-change-page-automation' }/>
            <SelectFbPostModal
                toggle={ stSelectPostModalToggle }
                pageId={ stDefaultPageFb?.value === DEFAULT_PAGE_VALUE ? null : stDefaultPageFb?.value }
                defaultValue={ stSelectedPosts }
                onToggle={ () => setStSelectPostModalToggle(false) }
                onSave={ handleSavePosts }
            />
            <GSContentHeader>
                { renderHeader() }
            </GSContentHeader>
            <AvForm ref={ refSaveForm } onValidSubmit={ handleSubmitSave } autoComplete="off" className="w-100">
                <GSContentBody size={ GSContentBody.size.MAX }
                               className="automation-form-editor__body-desktop d-desktop-flex">
                    <div className="row w-100 ">
                        {/*campaign settings*/ }
                        <UikWidget className="gs-widget automation-information">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.gochat.facebook.automation.editor.campaignSettings"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">
                                {
                                    stEditorMode == CONSTANTS_AUTOMATION_MODE.EDIT &&
                                    <AvField
                                        name={ 'id' }
                                        className="d-none"
                                        type={ 'text' }
                                        value={ stIdAutomation }
                                    />
                                }

                                <div className="row col-sm-12 p-0 box-form-group">
                                    <div className="form-group">
                                        <label>{i18next.t('page.gochat.facebook.automation.filter.page')}</label>
                                        <div className="box-page-selector">
                                            <Dropdown
                                                className={ stSwitchCampaignStatus && stErrorAutomation.errorPageFb
                                                    ? 'page-selector validation-error' : 'page-selector' }
                                                isOpen={ stToggle }
                                                toggle={ handleToggle }
                                            >
                                                <DropdownToggle
                                                    disabled={ stCampaignStatus }
                                                    className={ ['page-selector__button'].join(' ') } caret>
                                            <span className="page-selector__button__label d-flex align-items-center">
                                                { stDefaultPageFb?.avatar &&
                                                <img src={ stDefaultPageFb.avatar } width="30" height="30"/>
                                                }
                                                { stDefaultPageFb.label }

                                            </span>
                                                </DropdownToggle>
                                                <DropdownMenu className="page-selector__dropdown">
                                                    {
                                                        stPageFbList.map((item, index) => (
                                                            <DropdownItem
                                                                className="collection-selector__dropdown__item line-clamp-2"
                                                                key={ index }
                                                                onClick={ () => onChangePage(item) }
                                                            >
                                                                { item?.avatar &&
                                                                <img src={ item.avatar } width="30" height="30"/> }
                                                                { item.label }
                                                            </DropdownItem>
                                                        ))
                                                    }
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <p className="m-0"></p>
                                        <div className="form-group-error">
                                            { stSwitchCampaignStatus && stErrorAutomation.errorPageFb &&
                                            <span
                                                className="error">{ i18next.t('page.gochat.facebook.automation.error.selectPage') }</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="row col-sm-12 p-0 box-form-group">
                                    <AvField
                                        label={ `${ i18next.t('page.gochat.facebook.automation.campaignName') }` }
                                        name="campaignName"
                                        type={ 'text' }
                                        className={ stSwitchCampaignStatus && stErrorAutomation.errorCampaignName
                                            ? 'input-field__hint validation-error' : 'input-field__hint' }
                                        placeholder={ `${ i18next.t('page.gochat.facebook.automation.campaignName') }` }
                                        validate={ {
                                            ...FormValidate.maxLength(50)
                                        } }
                                        disabled={ stCampaignStatus }
                                        onChange={ e => {
                                            setStCampaignName(e.target.value)
                                            if (e.target.value === '') {
                                                setStErrorAutomation(error => ({
                                                    ...error,
                                                    errorCampaignName: true
                                                }))
                                                return
                                            }
                                            setStErrorAutomation(error => ({
                                                ...error,
                                                errorCampaignName: false
                                            }))
                                        } }
                                        value={ stCampaignName }
                                    />


                                    <div className="form-group">
                                        <p className="m-0"></p>
                                        <div className="form-group-error">
                                            { stSwitchCampaignStatus && stErrorAutomation.errorCampaignName &&
                                            <span
                                                className="error">{ i18next.t('page.gochat.facebook.automation.error.campaignName') }</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="row col-sm-12 p-0">
                                    <div className={stCampaignStatus ? "form-group align-items-start post-active" : "form-group align-items-start"}>
                                        <label><GSTrans t="page.gochat.facebook.automation.selectPost.title"/></label>
                                        {
                                            !stSelectedPosts.length && <div className=
                                                                                {stSwitchCampaignStatus && stErrorAutomation.errorPost ? "select-post validation-error" : "select-post"}>
                                                <p><GSTrans t="page.gochat.facebook.automation.selectPost.content"/></p>
                                                <button type="button" className="btn"
                                                        onClick={ () => setStSelectPostModalToggle(true) }>
                                                    <GSTrans t="page.gochat.facebook.automation.selectPost.button"/>
                                                </button>
                                            </div>
                                        }
                                        {
                                            !!stSelectedPosts.length &&
                                            <SelectPostWrapper className="select-post-responsive">
                                                <SelectPostHeader>
                                                    <SelectedLabel>
                                                        <GSTrans t="component.selectFbPostModal.selected"
                                                                 values={ { x: stSelectedPosts.length } }/>
                                                    </SelectedLabel>
                                                    <button type="button" disabled={stCampaignStatus} className="btn select-post-button"
                                                            onClick={ () => setStSelectPostModalToggle(true) }>
                                                        <GSTrans t="page.gochat.facebook.automation.selectPost.button"/>
                                                    </button>
                                                </SelectPostHeader>
                                                <div className="table table-header-fix">
                                                    <TableWrapper>
                                                        <GSTable>
                                                            <thead>
                                                            <tr>
                                                                <th className="white-space-nowrap">
                                                                    <GSTrans
                                                                        t="component.selectFbPostModal.header.postName"/>
                                                                </th>
                                                                <th></th>
                                                                <th className="white-space-nowrap">
                                                                    <GSTrans
                                                                        t="component.selectFbPostModal.header.time"/>
                                                                </th>
                                                                <th className="white-space-nowrap">
                                                                    <GSTrans
                                                                        t="component.selectFbPostModal.header.action"/>
                                                                </th>
                                                            </tr>
                                                            </thead>
                                                            <TableBody>
                                                                {
                                                                    stSelectedPosts.map(({
                                                                                             postId,
                                                                                             message,
                                                                                             full_picture,
                                                                                             created_time,
                                                                                             permalink_url
                                                                                         }) => (
                                                                        <tr key={ postId }>
                                                                            <td>
                                                                                <GSImg src={ full_picture } width={ 61 }
                                                                                       height={ 61 } alt="post"/>
                                                                            </td>
                                                                            <td>
                                                                                <span className="line-clamp-2">{ message }</span>
                                                                            </td>
                                                                            <td className='white-space-nowrap'>
                                                                                { moment(created_time).format('HH:mm') }
                                                                                <br/>
                                                                                { moment(created_time).format('DD-MM-YYYY') }
                                                                            </td>
                                                                            <td>
                                                                                <PostAction>
                                                                                    <GSImg
                                                                                        className="cursor--pointer"
                                                                                        src="/assets/images/select_fb_post_modal/icon_external.png"
                                                                                        alt="external"
                                                                                        onClick={ () => RouteUtils.openNewTab(permalink_url) }
                                                                                    />
                                                                                    <GSImg
                                                                                        style={stCampaignStatus ? {opacity:"0.5", cursor:"default"} : {}}
                                                                                        className="cursor--pointer"
                                                                                        src="/assets/images/icon-delete.png"
                                                                                        alt="delete"
                                                                                        onClick={ () => !stCampaignStatus && handleDeleteSelectedPost(postId) }
                                                                                    />
                                                                                </PostAction>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }
                                                            </TableBody>
                                                        </GSTable>
                                                    </TableWrapper>
                                                </div>
                                            </SelectPostWrapper>
                                        }
                                    </div>

                                    <div className="form-group">
                                        <p className="m-0"></p>
                                        <div className="form-group-error">
                                            { stSwitchCampaignStatus && stErrorAutomation.errorPost &&
                                            <span
                                                className="error m-0">{ i18next.t('page.gochat.facebook.automation.error.selectPost') }</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="row col-sm-12 p-0">

                                    <div className="select-time">
                                        <label>{ i18next.t('page.flashSale.create.time.header') }</label>
                                        <div className="box-time">
                                            { renderTime() }

                                            <div className="w-100 time">
                                                <UikSelect
                                                    className="w-100"
                                                    value={ [stDefaultSelectTime] }
                                                    options={ SELECT_TIME.map(item => (
                                                        {
                                                            value: item.value,
                                                            label: item.label
                                                        }
                                                    )) }
                                                    onChange={ e => onChangeTime(e) }
                                                    disabled={ stCampaignStatus }
                                                />
                                                { stCampaignStatus &&
                                                <div className="disabled">{
                                                    i18next.t('page.gochat.facebook.automation.editor.filter.' + stDefaultSelectTime.value) }</div> }
                                            </div>

                                        </div>
                                    </div>
                                    {stDefaultSelectTime.value !== SELECT_TIME[0].value &&
                                    <div className="form-group">
                                        <label></label>
                                        <p className="notice">
                                            <span>{ i18next.t('common.txt.notice') }: </span>{ i18next.t('page.gochat.facebook.automation.editor.notice.autoResponse') }
                                        </p>
                                    </div>
                                    }
                                </div>

                                <div className="row col-sm-12 p-0" key={ stIdAutomation }>
                                    <div className="form-group">
                                        <label className="gs-frm-input__label">
                                            <GSTrans t={ 'page.gochat.facebook.automation.keyword' }/>
                                        </label>
                                        <div className="box-gs-tags">
                                            <GSTagsSpace
                                                placeholder={ i18next.t('page.gochat.facebook.automation.editor.notice.inputKeywords') }
                                                className={ style.gsTag }
                                                onChange={ onChangeTags }
                                                defaultValue={ stTags }
                                                maxLength={ 30 }
                                                disabled={ stCampaignStatus }
                                                maxItemTextLength={100}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label></label>
                                        <p className="notice">
                                            <span>{ i18next.t('common.txt.notice') }: </span>{ i18next.t('page.gochat.facebook.automation.editor.notice.autoResponse2') }
                                        </p>
                                    </div>

                                </div>

                            </UikWidgetContent>
                        </UikWidget>

                        {/*auto response*/ }
                        <UikWidget className="gs-widget automation-information">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.gochat.facebook.automation.editor.filter.autoResponse"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">


                                <div className="row col-sm-12 p-0">
                                    <div className="form-group">
                                        <label></label>
                                        <div className={stCampaignStatus ? "reply-in-messenger disable" : "reply-in-messenger"}>
                                            <h3>{i18next.t('page.gochat.facebook.automation.replyInMessenger')}</h3>
                                            <div className="box-reply-in-messenger" key={stListComponentReplyInMessenger}
                                                 // onScroll={ onScrollMessenger }
                                            >
                                                {
                                                    stListComponentReplyInMessenger.map((value,index)=>{
                                                        return (
                                                            <div key={index}>
                                                                {renderComponentReplyInMessenger(value,index)}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <p className="m-0"></p>
                                        <div className="form-group-error">
                                            { stSwitchCampaignStatus && stListComponentReplyInMessenger.length === 0 &&
                                            <span
                                                className="error m-0">{i18next.t('page.gochat.facebook.automation.replyInMessenger.please.add.campaign')}</span>
                                            }
                                        </div>
                                    </div>
                                </div>


                                <div className="row col-sm-12 p-0">
                                    <div className="form-group">
                                        <label></label>
                                        <div className="box-button-add">
                                            <div className={stCampaignStatus ? "button-add disabled" : stListComponentReplyInMessenger.length === 10  ? "button-add disabled" : "button-add"}
                                                 onClick={()=>!stCampaignStatus && handleAddComponentReplyInMessenger(REPLY_IN_MESSENGER_STATUS.ADD_TEXT)}>
                                                <img src="/assets/images/icon-add-text.png"/>
                                                <div>+ {i18next.t('page.gochat.facebook.automation.replyInMessenger.addText')}</div>
                                            </div>

                                            <div className={stCampaignStatus ? "button-add disabled" :stListComponentReplyInMessenger.length === 10  ? "button-add disabled" : "button-add"}
                                                 onClick={()=>!stCampaignStatus && handleAddComponentReplyInMessenger(REPLY_IN_MESSENGER_STATUS.ADD_IMAGE)}>
                                                <img src="/assets/images/icon-add-img.png"/>
                                                <div>+ {i18next.t('page.gochat.facebook.automation.replyInMessenger.addImage')}</div>
                                            </div>

                                            <div className={stCampaignStatus ? "button-add disabled" : stListComponentReplyInMessenger.length === 10  ? "button-add disabled" : "button-add"}
                                                 onClick={()=>{
                                                if(!stCampaignStatus){
                                                    handleAddComponentReplyInMessenger(REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT)
                                                    setStShowProductModal(true)
                                                }
                                            }}>
                                                <img src="/assets/images/icon-add-product.png"/>
                                                <div>+ {i18next.t('page.gochat.facebook.automation.replyInMessenger.addProduct')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label></label>
                                        <div className="box-button-add text-center" style={{color:"#919192",fontSize: "0.81rem"}}>
                                            {i18next.t('page.gochat.facebook.automation.replyInMessenger.error')}
                                        </div>
                                    </div>
                                </div>

                                <div className="row col-sm-12 p-0">
                                    <div className="form-group">
                                        <label></label>
                                        <div className="respond-to-comment">
                                            <div className="box-checkbox">
                                                <UikCheckbox
                                                    className="custom-check-box m-0"
                                                    name={ 'checkbox' }
                                                    onChange={e=>setStIsResponseInComment(e.target.checked)}
                                                    disabled={stCampaignStatus}
                                                    checked={stIsResponseInComment}

                                                />
                                                <p>{i18next.t('page.gochat.facebook.automation.respondToComment')}</p>
                                            </div>

                                            <div className="box-full-name" style={stCampaignStatus ? {backgroundColor:"#f8f8f8"} : {}}>
                                                <div onClick={e=>e.preventDefault()} className="btn">{stDefaultPageFb?.label}</div>
                                                <textarea
                                                    rows="3" name="text"
                                                    value={stCommentContent}
                                                    onChange={e => hanleChangeCommentContent(e)}
                                                    maxLength="5000"
                                                    disabled={stCampaignStatus}
                                                >
                                                </textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label></label>
                                        <p className="m-0 this-comment"
                                           style={ { fontSize: '0.8rem', color: '#919192'} }>
                                            { i18next.t('page.gochat.facebook.automation.editor.notice.thisComment') }
                                        </p>
                                    </div>

                                    <div className="form-group">
                                        <label></label>
                                        <p className="notice">
                                            <span>{i18next.t('common.txt.notice')}:</span>
                                            <div>{ i18next.t('page.gochat.facebook.automation.editor.notice.autoResponse') }</div>
                                            <div>{ i18next.t('page.gochat.facebook.automation.editor.notice.facebookStrictly') }</div>
                                            <div>{ i18next.t('page.gochat.facebook.automation.editor.notice.thisMeans') }</div>
                                        </p>
                                    </div>
                                </div>


                            </UikWidgetContent>
                        </UikWidget>

                    </div>

                </GSContentBody>
            </AvForm>

        </GSContentContainer>
    )
}

AutomationFormEditor.defaultProps = {}

AutomationFormEditor.propTypes = {}


export default AutomationFormEditor
