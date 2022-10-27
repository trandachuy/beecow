import React, {useCallback, useEffect, useRef, useState} from 'react'
import './BroadcastFormEditor.sass'
import {Link} from 'react-router-dom'
import {Trans} from 'react-i18next'
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'
import i18next from 'i18next'
import {UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../../../@uik'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import facebookService from '../../../../../services/FacebookService';
import {NavigationPath as NAV_PATH} from '../../../../../config/NavigationPath';
import {CredentialUtils} from '../../../../../utils/credential';
import ConfirmModal, {ConfirmModalUtils} from '../../../../../components/shared/ConfirmModal/ConfirmModal';
import {AgencyService} from '../../../../../services/AgencyService';
import mediaService from '../../../../../services/MediaService';
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans';
import GSContentHeaderRightEl
    from '../../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import GSButton from '../../../../../components/shared/GSButton/GSButton';
import GSComponentTooltip, {GSComponentTooltipPlacement} from '../../../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import AddButtonModal from './AddButtonModal';
import {CurrencyUtils} from '../../../../../utils/number-format';
import GSContentContainer from '../../../../../components/layout/contentContainer/GSContentContainer';
import BroadcastProductModal from './BroadcastProductModal';
import LoadingScreen from '../../../../../components/shared/LoadingScreen/LoadingScreen';
import GSContentHeader from '../../../../../components/layout/contentHeader/GSContentHeader';
import GSContentBody from '../../../../../components/layout/contentBody/GSContentBody';
import GSImg from '../../../../../components/shared/GSImg/GSImg';
import Constants from '../../../../../config/Constant';
import {FormValidate} from '../../../../../config/form-validate';
import CustomerSegmentUserModal
    from '../../../../../components/shared/CustomerSegmentUserModal/CustomerSegmentUserModal';
import moment from 'moment';
import GSDateRangePicker from '../../../../../components/shared/GSDateRangePicker/GSDateRangePicker';
import {DateTimeUtils} from '../../../../../utils/date-time';
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from '../../../../../components/shared/GSTooltip/GSTooltip';
import {GSToast} from '../../../../../utils/gs-toast';
import beehiveService from '../../../../../services/BeehiveService';

const CONSTANTS_BROADCAST_MODE = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}

const REPLY_IN_MESSENGER_STATUS = {
    ADD_TEXT: 'TEXT',
    ADD_IMAGE: 'IMAGE',
    ADD_PRODUCT: 'PRODUCT'
}

const SCHEDULE_TIME_TYPE = {
    SEND_NOW: 'SEND_NOW',
    SCHEDULE_TIME: 'SCHEDULE_TIME'
}

const SENDING_STATUS = {
    SENT: 'SENT',
    SCHEDULED: 'SCHEDULED',
    NOT_SEND: 'NOT_SEND'
}

const CAMPAIGN_STATUS = {
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT'
}

const DEFAULT_PAGE_VALUE = 'SELECTPAGE'

const BroadcastFormEditor = props => {

    const refSaveForm = useRef()
    const refChangePage = useRef()
    const refChangeImage = useRef([])
    const refDeleteComponentModal = useRef()
    const messengerOnTop = useRef()

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [stIsLoading, setStIsLoading] = useState(false)
    const [stToggle, setStToggle] = useState(false)
    const [stPageFbList, setStPageFbList] = useState([
        { label: i18next.t('page.facebook.broadcast.detail.selectPage'), value: DEFAULT_PAGE_VALUE }
    ])
    const [stEditorMode, setStEditorMode] = useState(CONSTANTS_BROADCAST_MODE.CREATE)
    const [stCampaignStatus, setStCampaignStatus] = useState(false)
    const [stSwitchCampaignStatus, setStSwitchCampaignStatus] = useState(false)
    const [stErrorBroadcast, setStErrorBroadcast] = useState({
        errorPageFb: true,
        errorCampaignName: true,
        errorCustomerSegment: true,
        errorScheduleTime: true
    })
    const [stIdBroadcast, setStIdBroadcast] = useState(null)
    const [stImage, setStImage] = useState(null)
    const [stShowProductModal, setStShowProductModal] = useState(false)
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stIndexComponent, setStIndexComponent] = useState(-1)
    const [stIsAddItem, setStIsAddItem] = useState(false)
    const [stIsShowCustomerModal, setStIsShowCustomerModal] = useState(false)
    const [stAddSegmentError, setStAddSegmentError] = useState(false)
    const [stListComponentReplyInMessenger, setStListComponentReplyInMessenger] = useState([
        {
            componentType: REPLY_IN_MESSENGER_STATUS.ADD_TEXT,
            error: false,
            textComponent: {
                textContent: i18next.t('page.facebook.broadcast.replyInMessenger.inputText'),
                buttons: []
            },
            imageComponent: null,
            products: null,
            isButton: false
        }
    ])
    const [stData, setStData] = useState({
        defaultPageFb: {
            label: i18next.t('page.facebook.broadcast.detail.selectPage'),
            value: DEFAULT_PAGE_VALUE
        },
        campaignName: '',
        selectedCustomerList: [],
        totalUser: 0,
        totalFbUser: 0,
        scheduleTimeType: SCHEDULE_TIME_TYPE.SEND_NOW,
        scheduleTime: DateTimeUtils.flatTo(moment(moment.now()).add(30, 'minutes'), DateTimeUtils.UNIT.MINUTE),
        lstBroadcastSegment: [],
        sendingStatus: ''
    })

    const [stOnScrollMessenger, setStOnScrollMessenger] = useState(0)
    const [stIsRemoveClassActive, setStIsRemoveClassActive] = useState(false)
    const [stProductIndex, setStProductIndex] = useState({
        index: null,
        productIndex: null
    })


    useEffect(() => {
        fetchRequestToPageChat()
        fetchDetailBroadcast()
    }, [])

    const fetchRequestToPageChat = () => {
        facebookService.getRequestToPageChat().then(pageFbList => {
            pageFbList.sort((pervious, current) => {
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

    const fetchDetailBroadcast = () => {
        const path = props.match?.path
        const id = props.match?.params?.id

        if (path.includes(NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_EDIT)) {
            setStEditorMode(CONSTANTS_BROADCAST_MODE.EDIT)
            setStIsLoading(true)
            facebookService.getDetailBroadcast(id)
                .then(result => {
                    setStIdBroadcast(result.id)
                    setStData(state => ({
                        ...state,
                        defaultPageFb: {
                            label: i18next.t('page.facebook.broadcast.detail.selectPage'),
                            value: DEFAULT_PAGE_VALUE
                        },
                        campaignName: result.campaignName,
                        scheduleTimeType: _.isEmpty(result?.scheduleTime) ? SCHEDULE_TIME_TYPE.SEND_NOW : SCHEDULE_TIME_TYPE.SCHEDULE_TIME,
                        scheduleTime: _.isEmpty(result?.scheduleTime) ?
                            DateTimeUtils.flatTo(moment(moment.now()).add(30, 'minutes'), DateTimeUtils.UNIT.MINUTE) :
                            DateTimeUtils.flatTo(moment(result?.scheduleTime), DateTimeUtils.UNIT.MINUTE),
                        lstBroadcastSegment: result.lstBroadcastSegment,
                        sendingStatus: result.sendingStatus
                    }))
                    setStCampaignStatus(result.status === 'ACTIVE' ? true : false)

                    if (result.lstBroadcastSegment.length > 0 && !(_.isEmpty(result.pageId))) {
                        facebookService.fbUserBySegment(result.pageId, { lstSegmentId: result.lstBroadcastSegment.map(segment => segment.segmentId).join(',') })
                            .then(result => {
                                const totalFbUser = result.reduce((previousValue, currentValue) => {
                                    previousValue += currentValue.totalFbUser
                                    return previousValue
                                }, 0)

                                setStData(state => ({
                                    ...state,
                                    totalFbUser: totalFbUser
                                }))
                            })
                    }

                    if (result.lstBroadcastSegment.length > 0) {
                        beehiveService.userBySegment({ lstSegmentId: result.lstBroadcastSegment.map(segment => segment.segmentId).join(',') })
                            .then(result => {
                                const userCount = result.reduce((previousValue, currentValue) => {
                                    previousValue += currentValue.userCount
                                    return previousValue
                                }, 0)

                                setStData(state => ({
                                    ...state,
                                    selectedCustomerList: result.map(segment => {
                                        return { id: segment.id, totalCustomer: segment.userCount, name: segment.name }
                                    }),
                                    totalUser: userCount
                                }))
                            })
                    }


                    if (result.storeChat) {
                        setStData(state => ({
                            ...state,
                            defaultPageFb: {
                                label: result.storeChat?.pageName,
                                value: result.storeChat?.pageId,
                                avatar: result.storeChat?.avatar,
                                id: result.storeChat?.id
                            }
                        }))
                    } else {
                        setStData(state => ({
                            ...state,
                            defaultPageFb: {
                                label: i18next.t('page.facebook.broadcast.detail.selectPage'),
                                value: DEFAULT_PAGE_VALUE
                            }
                        }))
                    }
                    const listComponent = result.lstBroadcastComponent.map(component => {
                        if (component.componentType === REPLY_IN_MESSENGER_STATUS.ADD_TEXT) {
                            if (component.textComponent?.textContent === '') {
                                component.error = true
                            }

                            if (component.textComponent?.buttons.length > 0) {
                                component.isButton = true
                            } else {
                                component.isButton = false
                            }
                        }
                        if (component.componentType === REPLY_IN_MESSENGER_STATUS.ADD_IMAGE) {
                            if (!component?.imageComponent?.path) {
                                component.error = true
                                component.imageComponent = null
                            }
                        }
                        if (component.componentType === REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT) {
                            component.products = component.products.map(p => {
                                if (p.buttons.length > 0) {
                                    p.isButton = true
                                } else {
                                    p.isButton = false
                                }
                                return p
                            })
                        }
                        return component
                    })


                    setStListComponentReplyInMessenger(listComponent.sort((a, b) => {
                        return a.index - b.index
                    }))

                    if (result.campaignName !== '') {
                        setStErrorBroadcast(error => ({
                            ...error,
                            errorCampaignName: false
                        }))
                    }
                    if (result?.storeChat?.pageId !== DEFAULT_PAGE_VALUE || !result?.storeChat) {
                        setStErrorBroadcast(error => ({
                            ...error,
                            errorPageFb: false
                        }))
                    }

                    if (result?.lstBroadcastSegment?.length > 0) {
                        setStErrorBroadcast(error => ({
                            ...error,
                            errorCustomerSegment: false
                        }))
                    }

                    if (_.isEmpty(result?.scheduleTime) || result?.scheduleTime) {
                        setStErrorBroadcast(error => ({
                            ...error,
                            errorScheduleTime: false
                        }))
                    }
                })
                .finally(() => {
                    setStIsLoading(false)
                })

        }
    }

    const handleSubmitSave = (event, value) => {

        const data = {
            storeId: CredentialUtils.getStoreId(),
            status: stCampaignStatus ? CAMPAIGN_STATUS.ACTIVE : CAMPAIGN_STATUS.DRAFT,
            storeChatId: stData.defaultPageFb.id,
            pageId: stData.defaultPageFb.value === DEFAULT_PAGE_VALUE ? null : stData.defaultPageFb.value,
            campaignName: stData.campaignName,
            lstSegmentId: stData.selectedCustomerList.map(segment => segment.id),
            scheduleTime: stData.scheduleTimeType === SCHEDULE_TIME_TYPE.SEND_NOW ? null : moment.utc(stData.scheduleTime).toISOString(),
            lstBroadcastComponent: stListComponentReplyInMessenger
        }

        data.lstBroadcastComponent.map((component, index) => {
            component.index = index
        })

        setStIsLoading(true)

        if (stEditorMode == CONSTANTS_BROADCAST_MODE.CREATE) {
            facebookService.createBroadcast(data)
                .then((result) => {
                    GSToast.commonCreate()
                    props.history.push(NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST)
                })
                .catch(error => {
                    if (error.response.data.message === 'Schedule time must be in future') {
                        setStErrorBroadcast(error => ({
                            ...error,
                            errorScheduleTime: true
                        }))
                        GSToast.error('page.facebook.broadcast.replyInMessenger.error.scheduleTime', true)
                        return
                    }
                    GSToast.commonError()
                })
                .finally(() => {
                    setStIsLoading(false)
                })
            return
        }

        data.id = value.id
        data.lstBroadcastSegment = stData.lstBroadcastSegment
        facebookService.editBroadcast(data)
            .then((note) => {
                GSToast.commonUpdate()
                fetchDetailBroadcast()
                setStSwitchCampaignStatus(false)
                setStIsRemoveClassActive(false)
            })
            .catch(error => {
                setStCampaignStatus(false)
                if (error.response.data.message === 'Schedule time must be in future') {
                    setStErrorBroadcast(error => ({
                        ...error,
                        errorScheduleTime: true
                    }))
                    GSToast.error('page.facebook.broadcast.replyInMessenger.error.scheduleTime', true)
                    return
                }
                GSToast.commonError()
            })
            .finally(() => {
                setStIsLoading(false)
            })

    }

    const handleToggle = () => {
        setStToggle(toggle => !toggle)
    }

    const onChangePage = (page) => {

        if (page.value === DEFAULT_PAGE_VALUE) {
            setStErrorBroadcast(error => ({
                ...error,
                errorPageFb: true
            }))

        } else {
            setStErrorBroadcast(error => ({
                ...error,
                errorPageFb: false
            }))
        }
        setStData(state => {
            return {
                ...state,
                defaultPageFb: page
            }
        })
        if (page.value !== DEFAULT_PAGE_VALUE) {
            facebookService.fbUserBySegment(page.value, { lstSegmentId: stData.selectedCustomerList.map(segment => segment.id).join(',') })
                .then(result => {
                    const totalFbUser = result.reduce((previousValue, currentValue) => {
                        previousValue += currentValue.totalFbUser
                        return previousValue
                    }, 0)

                    setStData(state => ({
                        ...state,
                        totalFbUser
                    }))
                })
        } else {
            setStData(state => ({
                ...state,
                totalFbUser: 0
            }))
        }
    }

    const toggleOnOrOff = (e) => {
        setStSwitchCampaignStatus(true)
        if (!stSwitchCampaignStatus) {
            setStIsRemoveClassActive(true)
        }
        const checkListProductError = stListComponentReplyInMessenger.filter(product => product.error === true)
        const checkButtonError = stListComponentReplyInMessenger.filter(product => product.isButton === false)
        const checkButtonErrorInProductList = stListComponentReplyInMessenger.filter(product => {
            const isCheckButton = product.products?.filter(p => !p.isButton)
            return product.products?.length > 0 ? isCheckButton?.length > 0 : false
        })

        if (e.target.checked && !stErrorBroadcast.errorCampaignName
            && !stErrorBroadcast.errorPageFb
            && !stErrorBroadcast.errorCustomerSegment
            && stData.totalFbUser > 0
            && (stData.scheduleTimeType === SCHEDULE_TIME_TYPE.SEND_NOW || !stErrorBroadcast.errorScheduleTime)
            && stListComponentReplyInMessenger.length > 0
            && checkListProductError.length === 0
            && checkButtonError.length === 0
            && checkButtonErrorInProductList.length === 0
        ) {
            setStCampaignStatus(true)
            refSaveForm.current.submit()
            return
        }
        if (!e.target.checked) {
            refSaveForm.current.submit()
        }
        setStCampaignStatus(false)

        if (stData.scheduleTimeType === SCHEDULE_TIME_TYPE.SCHEDULE_TIME &&
            DateTimeUtils.flatTo(stData.scheduleTime, DateTimeUtils.UNIT.MINUTE) < DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)) {
            setStErrorBroadcast(error => ({
                ...error,
                errorScheduleTime: true
            }))
        } else {
            setStErrorBroadcast(error => ({
                ...error,
                errorScheduleTime: false
            }))
        }
        if (!stData.defaultPageFb.value || stData.defaultPageFb.value === DEFAULT_PAGE_VALUE) {
            setStErrorBroadcast(error => ({
                ...error,
                errorPageFb: true
            }))
        }
    }

    const handleAddComponentReplyInMessenger = (status) => {
        if (stListComponentReplyInMessenger.length < 10) {
            switch (status) {
                case REPLY_IN_MESSENGER_STATUS.ADD_TEXT:
                    const dataAddText = {
                        componentType: REPLY_IN_MESSENGER_STATUS.ADD_TEXT,
                        error: false,
                        textComponent: {
                            textContent: i18next.t('page.facebook.broadcast.replyInMessenger.inputText'),
                            buttons: []
                        },
                        imageComponent: null,
                        products: null,
                        isButton: false
                    }

                    setStListComponentReplyInMessenger(lcrim => [dataAddText, ...lcrim])
                    break
                case REPLY_IN_MESSENGER_STATUS.ADD_IMAGE:
                    const dataAddImage = {
                        componentType: REPLY_IN_MESSENGER_STATUS.ADD_IMAGE,
                        error: true,
                        imageComponent: null,
                        textComponent: null,
                        products: null,
                        isButton: true
                    }

                    setStListComponentReplyInMessenger(lcrim => [dataAddImage, ...lcrim])
                    break
                case REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT:
                    const dataAddProduct = {
                        componentType: REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT,
                        products: [],
                        textComponent: null,
                        imageComponent: null,
                        url: `https://${ CredentialUtils.getStoreUrl() }.${ AgencyService.getStorefrontDomain() }`,
                        isButton: true
                    }
                    setStIsAddItem(false)
                    setStListComponentReplyInMessenger(lcrim => [dataAddProduct, ...lcrim])
                    break
            }
        }
    }

    const hanleChangeValueComponent = (e, index) => {
        const value = e.target.value

        if (value === '') {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim[index].error = true
                return lcrim
            })
        } else {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim[index].error = false
                return lcrim
            })
        }


        setStListComponentReplyInMessenger(lcrim => {
            lcrim[index].textComponent.textContent = value
            return lcrim
        })
        forceUpdate()

    }

    const getDataAddButton = (data, index, productIndex, status) => {
        setStIsRemoveClassActive(false)
        setStProductIndex({
            index,
            productIndex
        })
        if (status === REPLY_IN_MESSENGER_STATUS.ADD_TEXT) {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim[index].textComponent.buttons = data
                lcrim[index].isButton = data.length > 0
                return lcrim
            })
            forceUpdate()
            return
        }

        setStListComponentReplyInMessenger(lcrim => {
            lcrim[index].products[productIndex].buttons = data
            lcrim[index].products[productIndex].isButton = data.length > 0
            return lcrim
        })
        forceUpdate()
    }

    const onImageChange = (e, index) => {
        if (e.target.files && e.target.files[0]) {
            let img = e.target.files[0];
            setStImage(URL.createObjectURL(img))
            setStIsLoading(true)
            mediaService.uploadFileWithDomain(img, 'ITEM')
                .then(result => {
                    setStListComponentReplyInMessenger(lcrim => {
                        lcrim[index].imageComponent = result
                        lcrim[index].error = false
                        return lcrim
                    })
                    forceUpdate()
                })
                .finally(() => {
                    setStIsLoading(false)
                })
        }
    };

    const handleProductModalClose = (type, products) => {
        setStShowProductModal(false)
        // add new
        if (stIndexComponent == -1 && ((type, products?.length === 0) || (!type))) {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim.shift()
                return lcrim
            })
            setStSelectedProducts([])
            setStIndexComponent(-1)
            return
        }

        // added
        if (stIndexComponent != -1 && ((type, products?.length === 0) || (!type, products?.length === 0))) {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim.splice(stIndexComponent, 1)
                return lcrim
            })
            setStSelectedProducts([])
            setStIndexComponent(-1)
            return
        }

        if (!type) {
            setStSelectedProducts([])
            setStIndexComponent(-1)
            return;
        }

        if (stSelectedProducts.length > 0) {
            setStListComponentReplyInMessenger(lcrim => {
                let idsProductNew = new Set(lcrim[stIndexComponent].products.map(p => p.modelId !== '' ? p.modelId : p.itemId));
                let mergedNew = products.filter(p => !idsProductNew.has(p.modelId !== '' ? p.modelId : p.itemId)).map(item => {
                    return { itemId: item.itemId, modelId: item.modelId, productDetail: item, isButton: false }
                })
                let idsProductOld = new Set(products.map(p => p.modelId !== '' ? p.modelId : p.itemId));
                let mergedOld = lcrim[stIndexComponent].products.filter(p => idsProductOld.has(p.modelId !== '' ? p.modelId : p.itemId))
                lcrim[stIndexComponent].products = [...mergedOld, ...mergedNew]
                return lcrim
            })
        } else {
            setStListComponentReplyInMessenger(lcrim => {
                lcrim[0].products = products.map(item => {
                    return { ...item, itemId: item.itemId, modelId: item.modelId, productDetail: item, isButton: false }
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

    const hanleDeleteProduct = (e, index, modelId, itemId) => {
        setStListComponentReplyInMessenger(lcrim => {
            lcrim[index].products = lcrim[index].products.filter(id => modelId ? id.modelId !== modelId : id.itemId !== itemId)
            if (lcrim[index].products.length === 0) {
                setStListComponentReplyInMessenger(lcrim => {
                    lcrim.splice(index, 1)
                    return lcrim
                })
            }
            return lcrim
        })
        forceUpdate()
    }

    const handleDeleteComponent = (e, index) => {

        ConfirmModalUtils.openModal(refDeleteComponentModal, {
            messages: <><p>{ i18next.t('page.gochat.facebook.automation.replyInMessenger.delete.component') }</p></>,
            modalTitle: i18next.t`page.affiliate.list.deleteConfirmText`,
            modalBtnOk: i18next.t('common.btn.delete'),
            okCallback: () => {
                setStListComponentReplyInMessenger(lcrim => {
                    lcrim.splice(index, 1)
                    return lcrim
                })
                forceUpdate()
            }
        })
    }

    const handleMoveComponent = (e, to) => {
        setStListComponentReplyInMessenger(lcrim => {
            let temp = lcrim[0];
            lcrim[0] = lcrim[to];
            lcrim[to] = temp;
            return lcrim
        })
        messengerOnTop.current.scrollTo(0, 0)
        forceUpdate()
    }

    const onCloseCustomerSegment = (customerSegment) => {
        setStAddSegmentError(true)
        if (customerSegment) {
            const totalUser = customerSegment.reduce((previousValue, currentValue) => {
                previousValue += currentValue.totalCustomer
                return previousValue
            }, 0)

            if (stData.defaultPageFb.value !== DEFAULT_PAGE_VALUE) {
                facebookService.fbUserBySegment(stData.defaultPageFb.value, { lstSegmentId: customerSegment.map(segment => segment.id).join(',') })
                    .then(result => {
                        const totalFbUser = result.reduce((previousValue, currentValue) => {
                            previousValue += currentValue.totalFbUser
                            return previousValue
                        }, 0)

                        setStData(state => ({
                            ...state,
                            totalFbUser
                        }))
                    })
            }


            setStData(state => ({
                ...state,
                totalUser
            }))
            setStData(state => ({
                ...state,
                selectedCustomerList: customerSegment
            }))

            if (customerSegment.length > 0) {
                setStErrorBroadcast(error => ({
                    ...error,
                    errorCustomerSegment: false
                }))
            } else {
                setStErrorBroadcast(error => ({
                    ...error,
                    errorCustomerSegment: true
                }))
            }
            setStIsShowCustomerModal(false);
            return
        }
        setStErrorBroadcast(error => ({
            ...error,
            errorCustomerSegment: true
        }))
        setStIsShowCustomerModal(false);
    };

    const onChangeScheduleTimeType = (e) => {
        e.persist()
        const value = e.currentTarget.value
        setStData(state => {
            return {
                ...state,
                scheduleTimeType: value
            }
        })
    }

    const handleDateTimePicker = (event, picker) => {
        const dateTime = picker.startDate
        if (dateTime) {
            setStData(state => {
                return {
                    ...state,
                    scheduleTime: DateTimeUtils.flatTo(dateTime, DateTimeUtils.UNIT.MINUTE)
                }
            })

            if (stData.scheduleTimeType === SCHEDULE_TIME_TYPE.SCHEDULE_TIME &&
                DateTimeUtils.flatTo(dateTime, DateTimeUtils.UNIT.MINUTE) < DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)) {
                setStErrorBroadcast(error => ({
                    ...error,
                    errorScheduleTime: true
                }))
            } else {
                setStErrorBroadcast(error => ({
                    ...error,
                    errorScheduleTime: false
                }))
            }
        }
    }

    const renderHeader = () => {
        switch (stEditorMode) {
            case CONSTANTS_BROADCAST_MODE.CREATE:
                return (
                    <>
                        <div className="automation-form-header">
                            <div className="title">
                                <Link to={ NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST }
                                      className="color-gray mb-2 d-block text-capitalize">
                                    &#8592; <GSTrans t="page.facebook.broadcast.detail.BackCampaignManagement"/>
                                </Link>
                                <h5 className="gs-page-title">
                                    {
                                        <GSTrans t="page.facebook.broadcast.detail.CreateBroadcast"/>
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


            case CONSTANTS_BROADCAST_MODE.EDIT:
                return (
                    <>
                        <div className="automation-form-header">
                            <div className="title">
                                <Link to={ NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST }
                                      className="color-gray mb-2 d-block text-capitalize">
                                    &#8592; <GSTrans t="page.facebook.broadcast.detail.BackCampaignManagement"/>
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
                                        disabled={ stData.sendingStatus === SENDING_STATUS.SENT }
                                        checked={ stCampaignStatus }
                                        className="m-0 p-0"
                                        onChange={ (e) => toggleOnOrOff(e) }
                                    />
                                    {/*BTN SAVE*/ }
                                    <GSButton disabled={ stCampaignStatus } onClick={ (e) => {
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

    const renderComponentReplyInMessenger = (value, index) => {
        switch (value.componentType) {
            case REPLY_IN_MESSENGER_STATUS.ADD_TEXT:
                return (
                    <div className="container">
                        { !stCampaignStatus &&
                        <div className="action">
                            <i onClick={ e => handleMoveComponent(e, index) }></i>
                            <i onClick={ e => handleDeleteComponent(e, index) }></i>
                        </div>
                        }

                        <div className="content-add-text">
                            { value.error &&

                            <GSComponentTooltip
                                className="error"
                                placement={ GSComponentTooltipPlacement.TOP }
                                interactive
                                style={ {
                                    width: 'fit-content',
                                    display: 'inline'
                                } }
                                html={
                                    <GSTrans
                                        t="page.gochat.facebook.automation.replyInMessenger.error.characters"></GSTrans>
                                }
                            >
                                <img className="" src="/assets/images/vector-error.png"/>
                            </GSComponentTooltip>

                            }

                            <textarea className={ value.error ? 'form-control form-control-error' : 'form-control' }
                                      rows="2" name="text"
                                      value={ value.textComponent.textContent }
                                      onChange={ e => hanleChangeValueComponent(e, index) }
                                      maxlength="640"
                                      required
                                      disabled={ stCampaignStatus }
                            >
                            </textarea>
                            <AddButtonModal
                                submitButton={ getDataAddButton }
                                index={ index }
                                listButton={ value?.textComponent?.buttons }
                                status={ REPLY_IN_MESSENGER_STATUS.ADD_TEXT }
                                campaignStatus={ stCampaignStatus }
                                isButton={ value.isButton }
                                switchCampaignStatus={ stSwitchCampaignStatus }
                                onScrollMessenger={ stOnScrollMessenger }
                                type={ 'text' }
                            />
                        </div>
                    </div>
                )
                break
            case REPLY_IN_MESSENGER_STATUS.ADD_IMAGE:
                return (
                    <div className="container">
                        { !stCampaignStatus &&
                        <div className="action">
                            <i onClick={ e => handleMoveComponent(e, index) }></i>
                            <i onClick={ e => handleDeleteComponent(e, index) }></i>
                        </div>
                        }
                        <div
                            className={ !value.imageComponent && value.error ? 'content-add-image content-add-image-error pb-5 pt-5' : 'content-add-image' }>
                            { value.error &&
                            <img className="error" src="/assets/images/vector-error.png"/>

                            }
                            { value.imageComponent &&
                            <img onClick={ () => !stCampaignStatus && refChangeImage.current[index].click() }
                                 className={ stCampaignStatus ? 'show-img' : 'show-img cursor--pointer' }
                                 src={ `${ value.imageComponent?.path }/${ value.imageComponent?.name }.${ value.imageComponent?.extension }` }/>
                            }
                            <div className={ !value.imageComponent ? 'custom-file' : 'custom-file d-none' }>
                                { !value.imageComponent &&
                                <div onClick={ () => refChangeImage.current[index].click() }>
                                    <img src="/assets/images/default_image_fb.png"/>
                                    <p className="m-0">{ i18next.t('page.gochat.facebook.automation.replyInMessenger.image') }</p>
                                </div>
                                }
                                <input ref={ el => refChangeImage.current[index] = el } type="file"
                                       className="custom-file-input d-none"
                                       id="customFile" name="image" onChange={ e => onImageChange(e, index) }/>
                            </div>
                        </div>
                    </div>
                )
                break
            case REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT:
                return (
                    <>
                        { value.products.length > 0 &&
                        <div className="container">
                            { !stCampaignStatus &&
                            <div className="action">
                                <i onClick={ e => handleMoveComponent(e, index) }></i>
                                <i onClick={ e => handleDeleteComponent(e, index) }></i>
                            </div>
                            }
                            <div className="content-add-product w-100">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div id={ `custCarousel-${ index }` } className="carousel slide"
                                             data-ride="carousel" align="center">
                                            <div className="carousel-inner" key={ value.products }>
                                                { value.products.map((product, productIndex) => {
                                                    if (stIsRemoveClassActive) {
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
                                                                    { !stCampaignStatus &&
                                                                    <i onClick={ e => hanleDeleteProduct(e, index, product.modelId, product.itemId) }></i>
                                                                    }
                                                                    <GSImg src={ product?.productDetail?.itemImage }/>
                                                                </div>
                                                                <div className="content">
                                                                    <p className="title line-clamp-2">{ product?.productDetail?.itemName }</p>
                                                                    <p className="price">
                                                                        { CurrencyUtils.formatMoneyByCurrency(
                                                                            product?.productDetail?.price,
                                                                            product?.productDetail?.currency
                                                                        ) }
                                                                    </p>
                                                                    <div className="color-size">
                                                                        { product.productDetail?.modelLabel?.split('|').length > 0 &&
                                                                        <>
                                                                            { product.productDetail?.modelLabel.split('|').map((label, index) => {
                                                                                if (label === '[d3p0s1t]') {
                                                                                    return (
                                                                                        <>
                                                                                            <p>{ product.productDetail?.modelName.split('|')[index] }</p>
                                                                                            <span> | </span>
                                                                                        </>
                                                                                    )
                                                                                }
                                                                                return (
                                                                                    <>
                                                                                        <p>{ label }: { product.productDetail?.modelName.split('|')[index] }</p>
                                                                                        <span> | </span>
                                                                                    </>
                                                                                )
                                                                            }) }
                                                                        </>
                                                                        }

                                                                        { product.productDetail?.modelLabel?.split('|').length === 0 &&
                                                                        <>
                                                                            <p className="color">{ product.productDetail?.modelLabel }: { product.productDetail?.modelName }</p>
                                                                            <span>|</span>
                                                                            <p className="size">{ product.productDetail?.modelLabel }: { product.productDetail?.modelName }</p>
                                                                        </>
                                                                        }
                                                                    </div>
                                                                    <p className="url">{ `${ CredentialUtils.getStoreUrl() }.${ AgencyService.getStorefrontDomain() }` }</p>

                                                                </div>
                                                            </div>
                                                            <AddButtonModal
                                                                submitButton={ getDataAddButton }
                                                                index={ index }
                                                                productIndex={ productIndex }
                                                                listButton={ product?.buttons }
                                                                status={ REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT }
                                                                campaignStatus={ stCampaignStatus }
                                                                isButton={ product?.isButton }
                                                                switchCampaignStatus={ stSwitchCampaignStatus }
                                                                type={ 'product' }
                                                                onScrollMessenger={ stOnScrollMessenger }
                                                            />
                                                        </div>
                                                    )
                                                }) }
                                            </div>
                                            <a className="carousel-control-prev" href={ `#custCarousel-${ index }` }
                                               data-slide="prev">
                                                <img src={ '/assets/images/automation/automation-left-opacity.png' }
                                                     onMouseOver={ e => (e.currentTarget.src = '/assets/images/automation/automation-left-no-opacity.png') }
                                                     onMouseOut={ e => (e.currentTarget.src = '/assets/images/automation/automation-left-opacity.png') }/>
                                            </a>
                                            { stEditorMode === CONSTANTS_BROADCAST_MODE.EDIT && stCampaignStatus &&
                                            <a className="carousel-control-next" href={ `#custCarousel-${ index }` }
                                               data-slide="next">
                                                <a className="carousel-control-prev" href={ `#custCarousel-${ index }` }
                                                   data-slide="prev">
                                                    <img src={ '/assets/images/automation/automation-left-opacity.png' }
                                                         onMouseOver={ e => (e.currentTarget.src = '/assets/images/automation/automation-left-no-opacity.png') }
                                                         onMouseOut={ e => (e.currentTarget.src = '/assets/images/automation/automation-left-opacity.png') }/>
                                                </a>
                                            </a>
                                            }

                                            { !stCampaignStatus &&
                                            <a className="carousel-control-next"
                                               onClick={ (e) => hanleAddProduct(e, index) }>
                                                <img src={ '/assets/images/automation/automation-plus-circle-grey.png' }
                                                     onMouseOver={ e => (e.currentTarget.src = '/assets/images/automation/automation-plus-circle-blue.png') }
                                                     onMouseOut={ e => (e.currentTarget.src = '/assets/images/automation/automation-plus-circle-grey.png') }/>

                                            </a>
                                            }
                                            <ol className="carousel-indicators list-inline">
                                                { value.products.map((product, productIndex) => {
                                                    return (
                                                        <li key={ productIndex }
                                                            className={ productIndex === 0 ? 'list-inline-item active' : 'list-inline-item' }>
                                                            <a
                                                                id={ `carousel-selector-${ productIndex }` }
                                                                className="selected"
                                                                data-slide-to={ productIndex }
                                                                data-target={ `#custCarousel-${ index }` }>
                                                                <img src={ product.productDetail?.itemImage }
                                                                     className={ stSwitchCampaignStatus && !product.isButton ? 'img-fluid error' : 'img-fluid' }/>
                                                            </a>
                                                        </li>
                                                    )
                                                }) }
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

    const onScrollMessenger = (event) => {
        const obj = event.currentTarget
        setStOnScrollMessenger(obj.scrollTop)
        setStIsRemoveClassActive(false)
    }

    return (
        <GSContentContainer minWidthFitContent className="broadcast-form-editor">
            <ConfirmModal ref={ refDeleteComponentModal } modalClass={ 'delete-component-reply-in-messenger' }/>
            { stShowProductModal &&
            <BroadcastProductModal
                productSelectedList={ stSelectedProducts }
                onClose={ handleProductModalClose }
                type={ Constants.ITEM_TYPE.BUSINESS_PRODUCT }
                showSearchOption={ true }
                campaignStatus={ stCampaignStatus }
                isAddItem={ stIsAddItem }
            />
            }
            { stIsShowCustomerModal && (
                <CustomerSegmentUserModal
                    onClose={ onCloseCustomerSegment }
                    selectedItems={ stData.selectedCustomerList }
                />
            ) }
            { stIsLoading &&
            <LoadingScreen zIndex={ 9999 }/>
            }
            <ConfirmModal ref={ refChangePage } modalClass={ 'modal-change-page-broadcast' }/>
            <GSContentHeader>
                { renderHeader() }
            </GSContentHeader>
            <AvForm ref={ refSaveForm } onValidSubmit={ handleSubmitSave } autoComplete="off" className="w-100">
                <GSContentBody size={ GSContentBody.size.MAX }
                               className="broadcast-form-editor__body-desktop d-desktop-flex">
                    <div className="row w-100 ">
                        {/*campaign settings*/ }
                        <UikWidget className="gs-widget broadcast-information">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.gochat.facebook.automation.editor.campaignSettings"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">
                                {
                                    stEditorMode == CONSTANTS_BROADCAST_MODE.EDIT &&
                                    <AvField
                                        name={ 'id' }
                                        className="d-none"
                                        type={ 'text' }
                                        value={ stIdBroadcast }
                                    />
                                }

                                <div className="row col-sm-12 p-0 box-form-group">
                                    <div className="form-group">
                                        <label>{ i18next.t('page.gochat.facebook.automation.filter.page') }</label>
                                        <div className="box-page-selector">
                                            <Dropdown
                                                className={ stSwitchCampaignStatus && stErrorBroadcast.errorPageFb
                                                    ? 'page-selector validation-error' : 'page-selector' }
                                                isOpen={ stToggle }
                                                toggle={ handleToggle }
                                            >
                                                <DropdownToggle
                                                    disabled={ stCampaignStatus }
                                                    className={ ['page-selector__button'].join(' ') } caret>
                                            <span className="page-selector__button__label d-flex align-items-center">
                                                { stData.defaultPageFb?.avatar &&
                                                <img src={ stData.defaultPageFb.avatar } width="30" height="30"/>
                                                }
                                                { stData.defaultPageFb.label }

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
                                            { stSwitchCampaignStatus && stErrorBroadcast.errorPageFb &&
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
                                        className={ stSwitchCampaignStatus && stErrorBroadcast.errorCampaignName
                                            ? 'input-field__hint validation-error' : 'input-field__hint' }
                                        placeholder={ `${ i18next.t('page.gochat.facebook.automation.campaignName') }` }
                                        validate={ {
                                            ...FormValidate.maxLength(150)
                                        } }
                                        disabled={ stCampaignStatus }
                                        onChange={ e => {
                                            setStData(state => {
                                                return {
                                                    ...state,
                                                    campaignName: e.target.value
                                                }
                                            })
                                            if (e.target.value === '') {
                                                setStErrorBroadcast(error => ({
                                                    ...error,
                                                    errorCampaignName: true
                                                }))
                                                return
                                            }
                                            setStErrorBroadcast(error => ({
                                                ...error,
                                                errorCampaignName: false
                                            }))
                                        } }
                                        value={ stData.campaignName }
                                    />


                                    <div className="form-group">
                                        <p className="m-0"></p>
                                        <div className="form-group-error">
                                            { stSwitchCampaignStatus && stErrorBroadcast.errorCampaignName &&
                                            <span
                                                className="error">{ i18next.t('page.gochat.facebook.automation.error.campaignName') }</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="row col-sm-12 p-0 box-form-group segment">
                                    {/*Segment*/ }
                                    <div className="form-group">
                                        <label>{ i18next.t('page.facebook.broadcast.detail.segment') }</label>
                                        <div className="box-page-selector">
                                            <div className={ 'customer-segment' }>
                                                { stData.selectedCustomerList.length === 0 &&
                                                <div>
                                                    <p className={ stCampaignStatus ? 'segment__hint add-segment mb-0' : 'add-segment mb-0' }
                                                       onClick={ () => {
                                                           if (!stCampaignStatus) {
                                                               setStIsShowCustomerModal(true)
                                                           }
                                                       } }>{ i18next.t('page.facebook.broadcast.detail.addSegment') }</p>

                                                    { stSwitchCampaignStatus && stErrorBroadcast.errorCustomerSegment &&
                                                    <p style={ { fontSize: '11px' } }
                                                       className="add-segment-error mb-0">{ i18next.t('page.facebook.broadcast.detail.pleaseSelectFacebook') }</p>
                                                    }
                                                </div>
                                                }

                                                { stData.selectedCustomerList.length > 0 &&
                                                <div className="d-flex flex-column">
                                                    <div className="d-flex">
                                                        <p className={ stCampaignStatus ? 'segment__hint add-segment mb-0' : 'add-segment mb-0' }
                                                           onClick={ () => {
                                                               if (!stCampaignStatus) {
                                                                   setStIsShowCustomerModal(true)
                                                               }
                                                           } }>{ i18next.t('page.facebook.broadcast.detail.editSegment') }</p>
                                                        <span className="ml-2">
                                                           { i18next.t('page.facebook.broadcast.detail.selectedUser', {
                                                               x: [...new Map(stData.selectedCustomerList.map(b => [JSON.stringify(b), b])).values()].length,
                                                               y: stData.totalUser
                                                           }) }
                                                       </span>
                                                    </div>
                                                    {
                                                        stData.totalFbUser > 0 &&
                                                        <span style={ {
                                                            fontSize: '11px',
                                                            color: '#989899'
                                                        } }>{ i18next.t('page.facebook.broadcast.detail.found', {
                                                            x: stData.totalFbUser,
                                                            y: [...new Map(stData.selectedCustomerList.map(b => [JSON.stringify(b), b])).values()].length
                                                        }) }</span>
                                                    }
                                                    { stData.defaultPageFb.value !== DEFAULT_PAGE_VALUE && stData.totalFbUser === 0 &&
                                                    <p style={ { fontSize: '11px' } }
                                                       className="add-segment-error mb-0">
                                                        { i18next.t('page.facebook.broadcast.detail.NoFacebook') }
                                                    </p>
                                                    }
                                                </div>
                                                }
                                                {/*Check error no select page Fb*/ }
                                                { stData.selectedCustomerList.length > 0 && stAddSegmentError && stErrorBroadcast.errorPageFb &&
                                                <p style={ { fontSize: '11px' } } className="add-segment-error mb-0">
                                                    { i18next.t('page.facebook.broadcast.detail.NoFacebook2') }
                                                </p>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row col-sm-12 p-0 box-form-group schedule-time-type">
                                    {/*Schedule*/ }
                                    <div className="form-group">
                                        <label>{ i18next.t('page.facebook.broadcast.detail.schedule') }</label>
                                        <div className="box-page-selector">
                                            <AvRadioGroup
                                                name="scheduleTimeType"
                                                inline
                                                value={ stData.scheduleTimeType }>
                                                <AvRadio
                                                    disabled={ stCampaignStatus }
                                                    customInput
                                                    label={ i18next.t('page.facebook.broadcast.detail.sendNow') }
                                                    value={ SCHEDULE_TIME_TYPE.SEND_NOW }
                                                    onClick={ onChangeScheduleTimeType }
                                                />
                                                <AvRadio
                                                    disabled={ stCampaignStatus }
                                                    customInput
                                                    label={ i18next.t('page.facebook.broadcast.detail.scheduleTime') }
                                                    value={ SCHEDULE_TIME_TYPE.SCHEDULE_TIME }
                                                    onClick={ onChangeScheduleTimeType }
                                                />
                                                { stData.scheduleTimeType === SCHEDULE_TIME_TYPE.SCHEDULE_TIME &&
                                                <div>
                                                    <GSDateRangePicker
                                                        disabled={ stCampaignStatus }
                                                        className={ stSwitchCampaignStatus && stErrorBroadcast.errorScheduleTime ? 'error-broadcast' : '' }
                                                        readOnly
                                                        singleDatePicker
                                                        fromDate={ stData.scheduleTime }
                                                        timePicker
                                                        onApply={ handleDateTimePicker }
                                                        minDate={ moment(moment.now()).add(30, 'minutes') }
                                                        timePicker24Hour
                                                    >
                                                    </GSDateRangePicker>
                                                    { stSwitchCampaignStatus && stErrorBroadcast.errorScheduleTime &&
                                                    <span className="error ml-4 mt-1">
                                                        { i18next.t('page.facebook.broadcast.replyInMessenger.error.scheduleTime') }
                                                    </span>
                                                    }
                                                </div>
                                                }
                                            </AvRadioGroup>
                                        </div>
                                    </div>
                                </div>


                            </UikWidgetContent>
                        </UikWidget>

                        {/*auto response*/ }
                        <UikWidget className="gs-widget broadcast-information">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.facebook.broadcast.detail.messageContent"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">


                                <div className="row col-sm-12 p-0">
                                    <div className="form-group">
                                        <label></label>
                                        <div
                                            className={ stCampaignStatus ? 'reply-in-messenger disable' : 'reply-in-messenger' }>
                                            <h3>{ i18next.t('page.gochat.facebook.automation.replyInMessenger') }</h3>
                                            <div ref={ messengerOnTop } className="box-reply-in-messenger"
                                                 key={ stListComponentReplyInMessenger }
                                                 // onScroll={ onScrollMessenger }
                                            >
                                                {
                                                    stListComponentReplyInMessenger.map((value, index) => {
                                                        return (
                                                            <div key={ index }>
                                                                { renderComponentReplyInMessenger(value, index) }
                                                            </div>
                                                        )
                                                    })
                                                }

                                                <div className="form-group-error">
                                                    { stSwitchCampaignStatus && stListComponentReplyInMessenger.length === 0 &&
                                                    <span
                                                        className="error m-0">{ i18next.t('page.facebook.broadcast.detail.pleaseAddMessage') }</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <div className="row col-sm-12 p-0">
                                    <div className="form-group">
                                        <label></label>
                                        <div className="box-button-add">
                                            <div
                                                className={ stCampaignStatus ? 'button-add disabled' : stListComponentReplyInMessenger.length === 10 ? 'button-add disabled' : 'button-add' }
                                                onClick={ () => !stCampaignStatus && handleAddComponentReplyInMessenger(REPLY_IN_MESSENGER_STATUS.ADD_TEXT) }>
                                                <img src="/assets/images/icon-add-text.png"/>
                                                <div>+ { i18next.t('page.gochat.facebook.automation.replyInMessenger.addText') }</div>
                                            </div>

                                            <div
                                                className={ stCampaignStatus ? 'button-add disabled' : stListComponentReplyInMessenger.length === 10 ? 'button-add disabled' : 'button-add' }
                                                onClick={ () => !stCampaignStatus && handleAddComponentReplyInMessenger(REPLY_IN_MESSENGER_STATUS.ADD_IMAGE) }>
                                                <img src="/assets/images/icon-add-img.png"/>
                                                <div>+ { i18next.t('page.gochat.facebook.automation.replyInMessenger.addImage') }</div>
                                            </div>

                                            <div
                                                className={ stCampaignStatus ? 'button-add disabled' : stListComponentReplyInMessenger.length === 10 ? 'button-add disabled' : 'button-add' }
                                                onClick={ () => {
                                                    if (!stCampaignStatus) {
                                                        handleAddComponentReplyInMessenger(REPLY_IN_MESSENGER_STATUS.ADD_PRODUCT)
                                                        setStShowProductModal(true)
                                                    }
                                                } }>
                                                <img src="/assets/images/icon-add-product.png"/>
                                                <div>+ { i18next.t('page.gochat.facebook.automation.replyInMessenger.addProduct') }</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label></label>
                                        <div className="box-button-add text-center"
                                             style={ { color: '#919192', fontSize: '0.81rem' } }>
                                            { i18next.t('page.gochat.facebook.automation.replyInMessenger.error') }
                                        </div>
                                    </div>
                                </div>


                                <div className="row col-sm-12 p-0">
                                    <div className="form-group">
                                        <label></label>
                                        <div className="box-button-add broadcast-note">
                                            <span><span
                                                className="font-weight-bold">{ i18next.t('common.txt.notice') }</span>: { i18next.t('page.facebook.broadcast.detail.note') }<GSTooltip
                                                message={ i18next.t('page.facebook.broadcast.detail.note.tooltip') }
                                                icon={ GSTooltipIcon.QUESTION_CIRCLE }
                                                placement={ GSTooltipPlacement.BOTTOM }/></span>
                                        </div>
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

BroadcastFormEditor.defaultProps = {}

BroadcastFormEditor.propTypes = {}


export default BroadcastFormEditor
