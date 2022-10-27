import React, {useCallback, useEffect, useRef, useState} from 'react'
import './ReturnOrderFormEditor.sass'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import Constants from '../../../config/Constant'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import {Link} from 'react-router-dom'
import {NAV_PATH} from '../../../components/layout/navigation/Navigation'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import i18next from 'i18next'
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../components/shared/GSButton/GSButton'
import {Trans} from 'react-i18next'
import GSProgressBar from '../../../components/shared/GSProgressBar/GSProgressBar'
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetHeader from '../../../components/shared/form/GSWidget/GSWidgetHeader'
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent'
import GSTable from '../../../components/shared/GSTable/GSTable'
import GSFakeLink from '../../../components/shared/GSFakeLink/GSFakeLink'
import {RouteUtils} from '../../../utils/route'
import GSImg from '../../../components/shared/GSImg/GSImg'
import {FormValidate} from '../../../config/form-validate'
import {BCOrderService} from '../../../services/BCOrderService'
import moment from 'moment'
import {CurrencyUtils} from '../../../utils/number-format'
import beehiveService from '../../../services/BeehiveService'
import {UikCheckbox, UikSelect} from '../../../@uik'
import GSComponentTooltip, {GSComponentTooltipPlacement} from '../../../components/shared/GSComponentTooltip/GSComponentTooltip'
import {GSToast} from '../../../utils/gs-toast'
import GSDropdownAction from '../../../components/shared/GSDropdownAction/GSDropdownAction'
import {TokenUtils} from '../../../utils/token'
import storeService from '../../../services/StoreService'
import ManageInventoryReturnOrderModal from './ManageInventoryReturnOrderModal/ManageInventoryReturnOrderModal'
import GSDateRangePicker from '../../../components/shared/GSDateRangePicker/GSDateRangePicker'
import AvFieldCountable from '../../../components/shared/form/CountableAvField/AvFieldCountable'
import {DateTimeUtils} from '../../../utils/date-time'
import ReturnOrderHistoryModal from './ReturnOrderHistoryModal/ReturnOrderHistoryModal'
import GSModalCancelNote from "../../../components/shared/GSModalCancelNote/GSModalCancelNote";
import ConfirmPaymentModal from "../../../components/shared/ConfirmPaymentModal/ConfirmPaymentModal";
import {CredentialUtils} from "../../../utils/credential";
import ConfirmModal, {ConfirmModalUtils} from "../../../components/shared/ConfirmModal/ConfirmModal";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {ImageUtils} from "../../../utils/image";
import Constant from "../../../config/Constant";
import PropTypes from "prop-types";

const HEADER = {
    SKU: i18next.t('page.orders.returnOrder.table.SKU'),
    PRODUCT_NAME: i18next.t('page.orders.returnOrder.table.productName'),
    QUANTITY: i18next.t('page.orders.returnOrder.table.returnQuantity'),
    UNIT: i18next.t('page.transfer.stock.table.column.unit'),
    ORDERED_PRICE: i18next.t('page.orders.returnOrder.table.orderedPrice'),
    TOTAL: i18next.t('page.orders.returnOrder.table.total')
}

const PAYMENT_METHOD = [
    {
        value: Constants.ORDER_PAYMENT_METHOD,
        label: i18next.t('page.order.detail.information.paymentMethod')
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_CASH,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_CASH)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_ZALO,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_ZALO)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_MOMO,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_MOMO)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_PAYPAL,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_PAYPAL)
    }
]

const VALIDATE_INPUT = {
    MIN: 0,
}

const ReturnOrderFormEditor = props => {
    const {currency, ...others} = props
    const returnOrderId = props.match?.params?.id
    const bcOrderId = props.match?.params?.orderId

    const [, updateState] = useState()
    const [stShowLoading, setStShowLoading] = useState(false)
    const [stIsSaving, setStIsSaving] = useState(false)
    const [stIsEdited, setStIsEdited] = useState(false)
    const [stEditorMode, setStEditorMode] = useState(Constants.RETURN_ORDER_MODE.CREATE)
    const [stReturnOrder, setStReturnOrder] = useState()
    const [stTimelines, setStTimelines] = useState([])
    const [stOrderDetail, setStOrderDetail] = useState({})
    const [stCustomerProfile, setStCustomerProfile] = useState({})
    const [stReceivedGood, setStReceivedGood] = useState(false)
    const [stNote, setStNote] = useState('')
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stPaymentMethod, setStPaymentMethod] = useState(Constants.ORDER_PAYMENT_METHOD)
    const [stController, setStController] = useState({})
    const [stDropdownActionToggle, setStDropdownActionToggle] = useState(false)
    const [stStoreBranches, setStStoreBranches] = useState([])
    const [stSelectedReturnBranch, setStSelectedReturnBranch] = useState({ value: undefined, label: undefined })
    const [stIsOpenManagedInventoryModal, setStIsOpenManagedInventoryModal] = useState(false)
    const [stDataImeiModal, setStDataImeiModal] = useState({})
    const [stDefaultImeiModal, setStDefaultImeiModal] = useState([])
    const [stListImeiError, setStListImeiError] = useState([])
    const [stDate, setStDate] = useState(DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE))
    const [stShowModalReturnOrderHistory, setStShowModalReturnOrderHistory] = useState(false)
    const [orderProcessingHistory, setOrderProcessingHistory] = useState([])
    const [stIsToggleCancelModal, setStIsToggleCancelModal] = useState(false)
    const [stModalPaymentConfirmation, setStModalPaymentConfirmation] = useState(false)
    const [stListPaymentHistory, setStListPaymentHistory] = useState([])
    const [stCheckDownUp, setStCheckDownUp] = useState('')
    const [stStatus, setStStatus] = useState('')
    const [stIsModaIMEI, setStIsModaIMEI] = useState(false)
    const [stListModaIMEI, setStListModaIMEI] = useState([])
    const [stShowListImeiReturnOrder, setStShowListImeiReturnOrder] = useState({})
    const [stLoadingScreen, setStLoadingScreen] = useState(true)
    const [stDebtAmount, setStDebtAmount] = useState(0);

    const forceUpdate = useCallback(() => updateState({}), [])

    const refForm = useRef(null)
    const refCompleteModal = useRef(null)

    useEffect(() => {
        fetchDataReturnOrder()
    }, [])

    const fetchCustomerSummary = (userId,siteCode) =>{
        if(userId){
            BCOrderService.getCustomerSummary(userId, siteCode)
                .then((result)=> {
                    setStDebtAmount(result?.debtAmount)
                })
        }
    }


    const fetchReturnOrderProcessingHistory = () =>{
        setStShowModalReturnOrderHistory(true)
        BCOrderService.getReturnOrderProcessingHistory(returnOrderId).then(returnProcessingHistory=>{
            if(returnProcessingHistory) {
                setOrderProcessingHistory(returnProcessingHistory)

            }
        })
    }

    const fetchDataPaymentHistories = () =>{
        BCOrderService.getReturnPaymentHistories(returnOrderId).then(result=>{
            setStListPaymentHistory(result)
        })
    }


    const fetchDataReturnOrder = () =>{
        const path = props.match?.path
        const promises = []
        let checkModeCreate = true

        if (TokenUtils.isStaff()) {
            promises.push(storeService.getListActiveBranchOfStaff())
        } else {
            promises.push(storeService.getStoreBranches())
        }

        if (path.includes(NAV_PATH.returnOrderWizard) || path.includes(NAV_PATH.returnOderEdit)) {
            fetchDataPaymentHistories()
            promises.push(BCOrderService.getReturnedOrder(returnOrderId))

            if (path.includes(NAV_PATH.returnOrderWizard)) {
                setStEditorMode(Constants.RETURN_ORDER_MODE.WIZARD)
                checkModeCreate = false
            } else if (path.includes(NAV_PATH.returnOderEdit)) {
                setStEditorMode(Constants.RETURN_ORDER_MODE.EDIT)
                checkModeCreate = false
            }
        }

        Promise.all(promises)
            .then(([storeBranches, returnOrder]) => {
                const params = {
                    excludeReturnIds: returnOrder ? [returnOrder.id] : undefined
                }

                Promise.all([
                    BCOrderService.getOrderDetail(returnOrder?.bcOrderId || bcOrderId),
                    BCOrderService.getReturnItemsMaxQuantityByOrderId(returnOrder?.bcOrderId || bcOrderId, params),
                    BCOrderService.getImeiReturnOrder(returnOrder?.bcOrderId || bcOrderId)
                ])
                    .then(([order, returnItemsMaxQuantity, ImeiReturnOrder]) => {
                        
                        if (checkModeCreate && !(order.orderInfo.status === Constant.ORDER_STATUS_DELIVERED
                            && (!(order.orderInfo.shippingMethod === Constant.DeliveryNames.SELF_DELIVERY) ||
                                !(order.orderInfo.inStore === 'INSTORE_PURCHASE')))){
                            RouteUtils.redirectWithoutReload(props, NAV_PATH.notFound)
                            return;
                        }
                        if (!order) {
                            return
                        }
                        fetchCustomerSummary(order.customerInfo.userId, order.orderInfo.channel)
                        if(order.customerInfo.userId && (order.orderInfo.inStore === Constants.PLATFORMS.INSTORE_PURCHASE ||
                            order.orderInfo.inStore === Constants.PLATFORMS.GO_SOCIAL)){
                            fetchCustomerProfile(order)   
                        }
                        
                        if (returnOrder) {
                            setStReceivedGood(returnOrder?.restock)
                            setStReturnOrder(returnOrder)
                            setStSelectedProducts(returnOrder.returnOrderItemList.map(i => {
                                if(i.quantity > 0){
                                    return({
                                        ...i,
                                        maxQuantity: getMaxQuantity(returnItemsMaxQuantity, i.itemId, i.modelId),
                                        variationName:order.items.find(item => i.modalId ? i.modalId == item.modalId : i.itemId == item.itemId).variationName,
                                        isShow: true
                                    })
                                }else {
                                    return({
                                        ...i,
                                        maxQuantity: getMaxQuantity(returnItemsMaxQuantity, i.itemId, i.modelId),
                                        variationName:order.items.find(item => i.modalId ? i.modalId == item.modalId : i.itemId == item.itemId).variationName,
                                        isShow: false
                                    })
                                }
                            }))
                            setStTimelines([
                                {
                                    status: Constants.RETURN_ORDER_STATUS.CREATED,
                                    createdDate: returnOrder.createdDate
                                },
                                ...returnOrder.timelines
                            ])
                            setStShowListImeiReturnOrder(ImeiReturnOrder)

                            const defaultImeiModal = returnOrder.returnOrderItemList.map(defaultImei=>{
                                return {
                                    itemId:defaultImei.itemId,
                                    modalId:defaultImei.modalId,
                                    imeiSerial:defaultImei.returnOrderItemImeiList.map(imei=>{return imei.imeiSerial})
                                }
                            })
                            setStDefaultImeiModal(defaultImeiModal)

                        } else {
                            setStDefaultImeiModal(order.items.map(i => ({
                                itemId:i.itemId,
                                modalId:i.modalId,
                                imeiSerial: []
                            })))

                            setStSelectedProducts(order.items.map(i => ({
                                ...i,
                                modelId: i.variationId,
                                quantity: 0,
                                maxQuantity: getMaxQuantity(returnItemsMaxQuantity, i.itemId, i.variationId),
                                isShow: true
                            })))
                        }

                        const formattedBranches = storeBranches.filter(branch=> branch.branchStatus === Constants.BRANCH_STATUS.ACTIVE).map(branch => ({
                            id: branch.id,
                            label: branch.name,
                            value: branch.id,
                            isDefault: branch.isDefault
                        }))
                        setStSelectedReturnBranch(returnOrder ? { value: parseInt(returnOrder.returnBranchId), label: returnOrder.returnBranchName }
                            : { value: order.storeBranch.id, label: order.storeBranch.name })
                        setStStoreBranches(formattedBranches)
                        setStOrderDetail(order)
                            
                    })
            })
            .finally(() => {
                setStLoadingScreen(false)
                setStShowLoading(false)
            })

    }

    useEffect(() => {
        if (!stReturnOrder) {
            return
        }

        setStNote(stReturnOrder.note)
        setStSelectedProducts(stReturnOrder.returnOrderItemList)
        setStController({
            showOrderStatus: stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD,
            hiddenChangeOrder: stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.IN_PROGRESS || stReturnOrder?.restock,
            hiddenCancelOrder: stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.IN_PROGRESS,
            preventChangeBranch: stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD
                || stReturnOrder?.status === Constants.RETURN_ORDER_STATUS.COMPLETED
                || stReturnOrder?.status === Constants.RETURN_ORDER_STATUS.CANCELLED,
            preventChangeProductQuantity: stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD
                || stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.IN_PROGRESS,
            preventChangeReceiveGoods: stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD
                || stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.IN_PROGRESS,
            preventChangeNote: stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD
        })
    }, [stReturnOrder])


    const fetchCustomerProfile = (order) => {
        const saleChannel = [...Constants.SALE_CHANNEL_LIST]
        const onFetch = () => Promise.resolve()
            .then(() => {
                if (!saleChannel.length) {
                    return
                }

                return beehiveService.getCustomerProfile(order.customerInfo.userId, saleChannel.shift())
            })
            .then(customer => {
                setStCustomerProfile(customer)
            })
            .catch(() => onFetch())

        onFetch()
    }
    

    const getMaxQuantity = (returnItemsMaxQuantity, itemId, modelId) => {
        return returnItemsMaxQuantity[itemId + (modelId ? '_' + modelId : '')] || 0
    }

    const handleSave = () => {
        refForm.current.submit()
    }

    const handleOnValidSubmit = (e, data) => {

        const orderItemList = stOrderDetail.items.map(item => {
            return {
                id: stReturnOrder?.returnOrderItemList.find(prod => prod.modelId ? prod.modelId === item.modelId : prod.itemId === item.itemId)?.id || null,
                parentId: item.parentId,
                conversionUnitItem: item.conversionUnitItemId ? {
                    id: item.conversionUnitItemId ,
                } : null,
                itemId: item.itemId,
                name: item.name,
                modelId: item.variationId,
                modelName: item.modelName,
                modelLabel: item.modelLabel,
                quantity: item.variationId ? stSelectedProducts.find(quantity => quantity.modelId === item.variationId).quantity
                    : stSelectedProducts.find(quantity => quantity.itemId === item.itemId).quantity,
                price: item.price,
                orgPrice: item.orgPrice,
                currency: item.currency,
                returnOrderId: returnOrderId,
                inventoryManageType: item.inventoryManageType,
                sku: item.sku,
                returnOrderItemImeiList: item.inventoryManageType === 'PRODUCT' ? [] :
                    stDefaultImeiModal.find(i => item.modalId ? i.modalId == item.modalId : i.itemId == item.itemId)?.imeiSerial.map(imeiSerial => {
                    return {
                        imeiSerial
                    }
                }) || []
            }
        })

        const paymentHistoryList = () =>{
            let paymentHistoryList = []
            if(stEditorMode === Constants.RETURN_ORDER_MODE.CREATE && stPaymentMethod !== PAYMENT_METHOD[0].value){
                paymentHistoryList = [{
                    paymentMethod: stPaymentMethod,
                    paymentAmount: +(data.paymentAmount),
                    note: data.notePaymentHistory,
                    createDated: moment.utc(stDate).toISOString()

                }]
            }
            return paymentHistoryList;
        }

        const request = {
            bcOrderId: stReturnOrder?.bcOrderId || bcOrderId,
            customerId: stOrderDetail.customerInfo.userId,
            customerName: stOrderDetail.customerInfo.name,
            storeId: CredentialUtils.getStoreId(),
            restock:stReceivedGood,
            returnBranchId: stSelectedReturnBranch.value,
            returnBranchName: stSelectedReturnBranch.label,
            note: stNote,
            totalRefund: getTotal(),
            currency: stOrderDetail.orderInfo.currency,
            returnOrderItemList: orderItemList,
            returnPaymentHistoryList: paymentHistoryList(),
        }

        if (getQuantity() === 0) {
            GSToast.error('page.orders.returnOrder.table.pleaseSelect', true)
            return
        }

        // check quantity imei
        let checkError = false
        let listErrorId = []
        stSelectedProducts.map(sp => {
            if (sp.quantity !== stDefaultImeiModal.find(imei => sp.modalId ? imei.modalId == sp.modalId : imei.itemId == sp.itemId)?.imeiSerial.length &&
                sp.inventoryManageType === 'IMEI_SERIAL_NUMBER'
            ) {
                checkError = true
                listErrorId.push(sp.id)
            }
        })

        if (checkError) {
            setStListImeiError(listErrorId)
            GSToast.error('page.orders.returnOrder.table.NumberOfSelected', true)
            return;
        }

        setStIsSaving(true)
        if (stEditorMode === Constants.RETURN_ORDER_MODE.CREATE){
            BCOrderService.createReturnOrder(request)
                .then(() => {
                    setStIsEdited(false)
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOderList)
                    GSToast.commonCreate()
                })
                .catch(error => {
                    if(error.response.data.message === 'Please select IMEI/Serial Number'){
                        GSToast.error('page.order.detail.confirm.imei.not.select',true)
                        return
                    }
                    GSToast.commonError()
                })
                .finally(() => setStIsSaving(false))
        }else if(stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD) {
            delete request.returnPaymentHistoryList
            request.id = returnOrderId
            request.returnOrderId = stReturnOrder.returnOrderId
            if (stStatus != ''){
                request.status = stStatus
            }
            fetchEditReturnOrders(request,false)

        }else {
            //EDIT
            delete request.returnPaymentHistoryList
            request.status = Constants.RETURN_ORDER_STATUS.IN_PROGRESS
            request.id = returnOrderId
            request.returnOrderId = stReturnOrder.returnOrderId

            fetchEditReturnOrders(request,true)

        }
    }

    const fetchEditReturnOrders = (request,redirect) =>{
        BCOrderService.editReturnOrders(request)
            .then(() => {
                setStIsEdited(false)
                fetchDataReturnOrder()
                GSToast.commonUpdate()
                if(redirect){
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOrderWizard + '/' + returnOrderId)
                }
            })
            .catch(error => {
                GSToast.commonError()
            })
            .finally(() => setStIsSaving(false))
    }

    const handleCancel = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOderList)
    }

    const handleCancelEdit = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOrderWizard + `/${ returnOrderId }`)
    }

    const getProductTotalRow = ({ itemId, modelId, quantity }) => {
        const price = stOrderDetail.items?.find(p => p.itemId === itemId && p.variationId === modelId)?.price || 0
        return CurrencyUtils.formatMoneyByCurrency(price * quantity, currency)
    }

    const handleChangeQuantity = (e, id) => {
        if (stController.preventChangeProductQuantity) {
            return
        }

        const quantity = +(e.target.value)
        const index = stSelectedProducts.findIndex(qt => qt.id === id)

        if (index != -1) {
            setStSelectedProducts(state => {
                state[index].quantity = quantity < 0 ? 0 : quantity
                return state
            })
        }
        setStListImeiError([])

        forceUpdate()
        setStIsEdited(true)
    }

    const getQuantity = () => {
        if (stSelectedProducts.length > 0) {
            return stSelectedProducts.reduce((acc, obj) => {
                return acc + obj.quantity
            }, 0)
        }
    }

    const getTotal = () => {
        if (stSelectedProducts.length > 0) {
            return stSelectedProducts.reduce((acc, obj) => {
                return acc + (obj.quantity * obj.price)
            }, 0)
        }
    }

    const onClickOrderRow = (orderId, channel) => {
        let url = NAV_PATH.orderDetail + `/${ channel }/` + orderId
        RouteUtils.openNewTab(url)
    }

    const onClickCustomerInformation = (customerProfile) => {
        if(Object.keys(customerProfile).length === 0){
            return
        }
        let url = `${ NAV_PATH.customers.CUSTOMERS_EDIT }/${ customerProfile.id }/${ customerProfile.userId }/${ customerProfile.saleChannel }`
        RouteUtils.openNewTab(url)
    }

    const handleReceivedGoods = (e) => {
        if (stController.preventChangeReceiveGoods) {
            return
        }
        if(e.target.checked === false){
            setStReceivedGood(e.target.checked)
            setStListImeiError([])
            return;
        }

        let checkError = false
        let listErrorId = []
        stSelectedProducts.map(sp => {
            if (sp.quantity !== stDefaultImeiModal.find(imei => sp.modalId ? imei.modalId == sp.modalId : imei.itemId == sp.itemId)?.imeiSerial.length &&
            sp.inventoryManageType === 'IMEI_SERIAL_NUMBER'
            ) {
                checkError = true
                listErrorId.push(sp.id)
            }
        })

        if (checkError) {
            setStListImeiError(listErrorId)
            GSToast.error('page.orders.returnOrder.table.NumberOfSelected', true)
        } else {
            setStReceivedGood(e.target.checked)
        }
        setStIsEdited(true)
    }

    const handleDropdownActionChange = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOderEdit + '/' + returnOrderId)
    }

    const handleDropdownActionCancel = () => {
        return setStIsToggleCancelModal(true)
    }

    const fetchCompleteModal = (title) =>{
        ConfirmModalUtils.openModal(refCompleteModal, {
            messages: <>
                <p className="reject-description"><GSTrans t={title} /></p>
            </>,
            modalTitle: i18next.t`common.txt.confirm.modal.title`,
            okCallback: () => {
                setStStatus(Constants.RETURN_ORDER_STATUS.COMPLETED)
                refForm.current.submit()
            },
        })
    }

    const handleComplete = (e) => {
        e.preventDefault()
        const total = getTotal()
        if ((stListPaymentHistory?.paidAmount < total) && stReturnOrder?.restock === false){
            return fetchCompleteModal('page.orders.returnOrder.detail.complete.content')
        }
        if (stReturnOrder?.restock === false){
            return fetchCompleteModal('page.orders.returnOrder.detail.complete.content2')
        }
        if (stListPaymentHistory?.paidAmount < total){
            return fetchCompleteModal('page.orders.returnOrder.detail.complete.content3')
        }

        setStStatus(Constants.RETURN_ORDER_STATUS.COMPLETED)
        refForm.current.submit()
    }

    const handleChangeBranch = (branch) => {
        if (stController.preventChangeBranch) {
            return
        }

        if (stSelectedReturnBranch.value === branch.value) {
            return
        }

        setStSelectedReturnBranch(branch)
        setStIsEdited(true)
    }

    const handleStockImeiModal = (prod) => {
        setStIsOpenManagedInventoryModal(true)

        if(stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT){
            stShowListImeiReturnOrder[prod.modalId ? `${prod.itemId}_${prod.modalId}` : prod.itemId].map(imei=>{
                if(prod.returnOrderItemImeiList.findIndex(checkImei=>checkImei.imeiSerial ===imei ) == -1){
                    prod.returnOrderItemImeiList.push({imeiSerial:imei})
                }
            })
        }

        setStDataImeiModal(prod)
    }

    const handleManagedInventoryCallback = () => {
        setStIsOpenManagedInventoryModal(false)
        setStListImeiError([])
    }

    const selectImeiModalSave = (imeiSerial, itemId, modalId) => {
        const index = stDefaultImeiModal.findIndex(i => modalId ? i.modalId == modalId : i.itemId == itemId)
        if (index == -1) {
            setStDefaultImeiModal(state => [...state, { itemId, modalId, imeiSerial: imeiSerial }])
        } else {
            setStDefaultImeiModal(state => {
                state[index].imeiSerial = imeiSerial
                return state
            })
        }
        setStIsOpenManagedInventoryModal(false)
        setStListImeiError([])
    }

    const handleDateTimePicker = (event, picker) => {
        const dateTime = picker.startDate
        if (dateTime) {
            setStDate(DateTimeUtils.flatTo(dateTime, DateTimeUtils.UNIT.MINUTE))
        }
    }


    const handleConfirmPayment = (data) =>{
        const request = {
            returnOrderId,
            storeId: CredentialUtils.getStoreId(),
            paymentMethod: data.paymentMethod,
            paymentAmount: +(data.paymentAmount),
            note: data.note,
            createDated: moment.utc(stDate).toISOString()

        }

        BCOrderService.createReturnPaymentHistories(request)
            .then(()=>{
                fetchDataPaymentHistories()
                GSToast.commonUpdate()
            }).catch(e=>{
            GSToast.error()
        })


        togglePaymentConfirmation()
    }

    const togglePaymentConfirmation = () =>{
        setStModalPaymentConfirmation(state=>!state)
    }

    const checkDownUp = (check) => {
        if (stCheckDownUp === check) {
            setStCheckDownUp('')
            return
        }

        setStCheckDownUp(check)
    }

    const toggleCancelModal = () => {
        setStIsToggleCancelModal(state => !state)
    }

    const handleCancelModal = (data) =>{
        setStNote(data.note)
        setStStatus(Constants.RETURN_ORDER_STATUS.CANCELLED)
        setStIsToggleCancelModal(false)
        refForm.current.submit()
    }

    const renderSummaryRows = () => {
        return (
            <div className="pt-3 pb-3" style={ { backgroundColor: '#F9F9F9' } }>
                <div className="custom-row">
                    <td colSpan={ 3 }/>
                    <td className="gs-table-body-item vertical-align-baseline">
                        <div
                            className="d-flex h-100 align-items-center ml-xl-4">
                            <GSTrans t="page.orders.returnOrder.table.quantity"/>
                        </div>
                    </td>
                    <td>
                        <div className="text-right">
                            <GSTrans t="page.orders.returnOrder.table.product" values={ { x: getQuantity() } }/>
                        </div>
                    </td>
                </div>

                <div className="custom-row">
                    <td colSpan={ 3 }/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-bold">
                        <div
                            className="d-flex h-100 align-items-center ml-xl-4">
                            <GSTrans t="page.orders.returnOrder.table.totalReturnAmount"/>
                        </div>
                    </td>
                    <td>
                        <div className="text-right font-weight-bold">
                            { CurrencyUtils.formatMoneyByCurrency(getTotal(), currency) }
                        </div>
                    </td>
                </div>
            </div>
        )
    }

    const renderButtonAddMode = () => {
        return (
            <>
                <GSButton
                    success
                    onClick={ handleSave }
                >
                    <Trans i18nKey="common.btn.save" className="sr-only">
                        Save
                    </Trans>
                </GSButton>

                <GSButton
                    success outline
                    marginLeft
                    onClick={ handleCancel }
                >
                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                        Cancel
                    </Trans>
                </GSButton>
            </>
        )
    }

    const renderButtonWizardMode = () => {
        return !!stReturnOrder
            && stReturnOrder.status === Constants.RETURN_ORDER_STATUS.IN_PROGRESS
            && <GSButton success onClick={ handleComplete }>
                <Trans i18nKey="common.btn.complete" className="sr-only">
                    Complete
                </Trans>
            </GSButton>
    }

    const renderButtonEditMode = () => {
        return (
            <>
                <GSButton
                    success
                    onClick={ handleSave }
                >
                    <Trans i18nKey="common.btn.save" className="sr-only">
                        Save
                    </Trans>
                </GSButton>
                <GSButton
                    success outline marginLeft
                    onClick={ handleCancelEdit }
                >
                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                        Cancel
                    </Trans>
                </GSButton>
            </>
        )
    }

    const renderHeader = () => {
        return (
            <div className="return-order-form-header">
                <div className="title">
                    <p onClick={()=>{
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOderList)
                    }} className="color-gray mb-2 d-block text-capitalize cursor--pointer">
                        &#8592; <GSTrans t="page.orders.returnOrder.backToReturnOrders"/>
                    </p>
                    { renderTitle() }
                </div>

                <GSProgressBar
                    key={ stReturnOrder?.status }
                    currentStep={
                        stReturnOrder
                            ? stReturnOrder.status === Constants.RETURN_ORDER_STATUS.CANCELLED
                            ? Constants.RETURN_ORDER_STAGE[stReturnOrder.statusAtCancel]
                            : Constants.RETURN_ORDER_STAGE[stReturnOrder.status]
                            : 1
                    }
                    isCancelledStage={ stReturnOrder?.status === Constants.RETURN_ORDER_STATUS.CANCELLED }
                    cancelledRemovableStage={ Constants.RETURN_ORDER_STAGE.COMPLETED }
                    steps={ Constants.RETURN_ORDER_STEP }
                    timelines={ stTimelines }
                    replacers={ [{
                        step: Constants.RETURN_ORDER_STATUS.CREATED,
                        label: i18next.t('page.orders.returnOrder.ProgressBar.create'),
                        isReplace: !stReturnOrder
                    }, {
                        step: Constants.RETURN_ORDER_STATUS.IN_PROGRESS,
                        label: i18next.t('page.orders.returnOrder.ProgressBar.inProgress'),
                        isReplace: true
                    }, {
                        step: Constants.RETURN_ORDER_STATUS.COMPLETED,
                        label: i18next.t('page.orders.returnOrder.ProgressBar.completed'),
                        isReplace: true
                    }] }
                />

                <GSContentHeaderRightEl className="d-flex">
                    { stEditorMode === Constants.RETURN_ORDER_MODE.CREATE && renderButtonAddMode() }
                    { stEditorMode === Constants.RETURN_ORDER_MODE.WIZARD && renderButtonWizardMode() }
                    { stEditorMode === Constants.RETURN_ORDER_MODE.EDIT && renderButtonEditMode() }
                </GSContentHeaderRightEl>
            </div>
        )
    }

    const renderTitle = () => {
        switch (stEditorMode) {
            case Constants.RETURN_ORDER_MODE.CREATE:
                return <h5 className="gs-page-title">
                    {
                        i18next.t('page.orders.returnOrder.title.create', { x: bcOrderId })
                    }
                </h5>

            case Constants.RETURN_ORDER_MODE.EDIT:
                return <h5 className="gs-page-title">
                    {
                        i18next.t('page.orders.returnOrder.title.edit', { x: stReturnOrder?.returnOrderId })
                    }
                </h5>

            case Constants.RETURN_ORDER_MODE.WIZARD:
                return <>
                    <h5 className="gs-page-title">
                        {
                            stReturnOrder?.returnOrderId
                        }
                    </h5>
                    
                    { stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.COMPLETED &&
                    stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.CANCELLED && 
                    <GSDropdownAction
                        className="w-fit-content"
                        toggle={ stDropdownActionToggle }
                        onToggle={ toggle => setStDropdownActionToggle(toggle) }
                        actions={ [{
                            label: i18next.t('common.btn.change'),
                            hidden: stController.hiddenChangeOrder,
                            onAction: handleDropdownActionChange
                        }, {
                            label: i18next.t('page.purchaseOrderFormEditor.header.action.cancel'),
                            hidden: stController.hiddenCancelOrder,
                            onAction: handleDropdownActionCancel
                        }] }
                    />
                    }
                </>
        }
    }

    const renderProductRow = (prod) => {
        return <tr className="background-color-white" key={prod.itemId + '_' + prod.modelId}>
            <td className="gs-table-body-item">
                <div className="col-data">
                    <GSFakeLink
                        onClick={ () => RouteUtils.openNewTab(NAV_PATH.productEdit + '/' + prod.itemId) }>{ prod.sku || '_' }</GSFakeLink>
                </div>
            </td>

            <td className="gs-table-body-item">
                <div className="d-flex align-items-center">
                    <div className="product-image">
                        <GSImg src={ ImageUtils.getImageFromImageModel(prod.itemImageDto, 70) || prod.imageUrl } width={ 70 } height={ 70 }/>
                    </div>
                    <div className="d-flex flex-column ml-3">
                        <span className="product-name">{ prod.name }</span>
                        { prod.variationName &&
                        <span className="font-size-_8rem white-space-pre">
                            { prod.variationName.replace('|' + Constants.DEPOSIT_CODE.FULL, '') }
                        </span>
                        }
                    </div>
                </div>
            </td>

            <td className="gs-table-body-item">
                <div className="col-data quantity d-flex flex-column">
                    {
                        stController.preventChangeProductQuantity
                            ?
                            <>
                                <span>{ prod.quantity }</span>
                                { prod.inventoryManageType && prod.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER &&
                                    <a style={{ fontSize: '10px' }} href="javascript:void(0)"
                                       onClick={()=>handleIsModalIMEI(prod.returnOrderItemImeiList)}
                                    ><img width="10px" className="mr-1" src="/assets/images/Vector.png"/>
                                        <GSTrans t='page.order.detail.confirm.modal.imei.selected' values={{
                                            curr: prod.returnOrderItemImeiList.length
                                        }}/>
                                    </a>
                                }
                            </>
                            : <>
                                <div className="d-flex align-items-center">
                                    <AvField
                                        name={ `quantity-${ prod.id }` }
                                        validate={ {
                                            ...FormValidate.required(),
                                            ...FormValidate.minMaxValue(stEditorMode === Constants.RETURN_ORDER_MODE.EDIT ? 1 : '0',prod.maxQuantity),
                                            ...FormValidate.maxMinValue(prod.maxQuantity,stEditorMode === Constants.RETURN_ORDER_MODE.EDIT ? 1 : '0', true, 'page.orders.returnOrder.detail.minMax')
                                        } }
                                        value={ String(prod.quantity) }
                                        type="number"
                                        onChange={ e => handleChangeQuantity(e, prod.id) }
                                    />
                                    <span className="pl-2 d-flex"><span className="mr-1">/</span>{ prod.maxQuantity }</span>
                                </div>

                                { prod.inventoryManageType && prod.inventoryManageType != 'PRODUCT' &&

                                <a className="d-flex align-items-center mt-2"
                                   style={ stListImeiError.findIndex(id => id === prod.id) != -1 ? {
                                       fontSize: '10px',
                                       color: '#DB1B1B'
                                   } : { fontSize: '10px' } }
                                   href="javascript:void(0)"
                                   onClick={ () => handleStockImeiModal(prod) }>
                                    { stDefaultImeiModal.find(i => prod.modalId ? i.modalId == prod.modalId : i.itemId == prod.itemId)?.imeiSerial.length === 0 ?
                                        prod.quantity > 0 && <><img
                                            width="10px" className="mr-1" src="/assets/images/Vector.png"/> <GSTrans t="page.order.detail.confirm.imei.not.select"/></> :
                                        <>
                                            <img
                                                width="10px" className="mr-1" src="/assets/images/Vector.png"/> <GSTrans t="page.order.detail.confirm.imei.selected" values={ {
                                            curr: stDefaultImeiModal.find(i => prod.modalId ? i.modalId == prod.modalId : i.itemId == prod.itemId)?.imeiSerial.length || 0,
                                            max: prod.quantity
                                        } }/>
                                        </> }
                                </a>
                                }
                            </>
                    }
                </div>
            </td>
            <td className="gs-table-body-item">
                <div className="col-data justify-content-center">
                    {prod.conversionUnitName || prod.conversionUnitItem?.conversionUnitName || '-'}
                </div>
            </td>
            <td className="gs-table-body-item">
                <div className="col-data justify-content-center">
                    { CurrencyUtils.formatMoneyByCurrency(prod.price, currency) }
                </div>
            </td>
            <td className="gs-table-body-item">
                <div key={ prod } className="col-data justify-content-end">
                    { getProductTotalRow(prod) }
                </div>
            </td>
        </tr>
    }

    const renderProductInformation = () => {
        return <GSWidget className="product-list">
            <GSWidgetHeader className="title"
                            title={ i18next.t('page.orders.returnOrder.ProgressBar.productInformation') }/>

            {/*PRODUCT LIST*/ }
            <GSWidgetContent className="d-flex flex-column">
                {
                    <div className="table">
                        <GSTable>
                            <colgroup>
                                <col style={ { width: '15%' } }/>
                                <col style={ { width: '30%' } }/>
                                <col style={ { width: '15%' } }/>
                                <col style={ { width: '20%' } }/>
                                <col style={ { width: '20%' } }/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>{ HEADER.SKU }</th>
                                <th>{ HEADER.PRODUCT_NAME }</th>
                                <th className="text-center">{ HEADER.QUANTITY }</th>
                                <th className="text-center">{ HEADER.UNIT }</th>
                                <th className="text-center">{ HEADER.ORDERED_PRICE }</th>
                                <th>{ HEADER.TOTAL }</th>
                            </tr>
                            </thead>
                            <tbody>
                            {

                                stSelectedProducts.map(prod => (
                                       prod.isShow && renderProductRow(prod)
                                ))
                            }
                            </tbody>
                        </GSTable>
                    </div>
                }
                {
                    renderSummaryRows()
                }
                {/*<div className="error">{ stProductListError }</div>*/ }
            </GSWidgetContent>
            {/*END PRODUCT LIST*/ }
        </GSWidget>
    }

    const renderReceiveGoods = () => {
        if (stReturnOrder?.restock) {
            return <>
                <img src="/assets/images/return_order/receive_goods_checked.png" alt="receive_goods_checked"/>
                <span className="restock checked">{ i18next.t('page.orders.returnOrder.goodsReceived') }</span>
            </>
        }

        return <>

            {stEditorMode === Constants.RETURN_ORDER_MODE.CREATE ?
                <UikCheckbox
                    className="custom-check-box m-0"
                    disabled={ stController.preventChangeReceiveGoods }
                    checked={ stReceivedGood }
                    name="receivedGoods"
                    onChange={ (e) => handleReceivedGoods(e) }
                /> :
                <GSComponentTooltip
                    placement={ GSComponentTooltipPlacement.BOTTOM }
                    interactiveD
                    style={ {
                        display: 'inline'
                    } }
                    html={
                        <GSTrans
                            t="page.orders.returnOrder.checkingConfirm"
                        >
                        </GSTrans>
                    }>
                    <UikCheckbox
                        className="custom-check-box m-0"
                        disabled={ stController.preventChangeReceiveGoods }
                        checked={ stReceivedGood }
                        name="receivedGoods"
                        onChange={ (e) => handleReceivedGoods(e) }
                    />
                </GSComponentTooltip>
            }


            <span>{ i18next.t('page.orders.returnOrder.goodsReceived') }</span>
            <GSComponentTooltip
                placement={ GSComponentTooltipPlacement.BOTTOM }
                interactive
                style={ {
                    display: 'inline'
                } }
                html={
                    <GSTrans
                        t="page.orders.returnOrder.checkingConfirm"
                    >
                    </GSTrans>
                }>
                <img src="/assets/images/emojione_warning.png" alt="emojione_warning"/>
            </GSComponentTooltip>
        </>
    }


    const renderOrderCreatedBy = (inStoreCreatedBy) => {
        if (inStoreCreatedBy === '[shop0wner]') {
            return i18next.t('page.order.detail.information.shopOwner')
        } else {
            return inStoreCreatedBy;
        }
    }

    const renderEditPaymentHistory = () =>{
        return (
            <GSWidgetContent>

                <div className="payment-history">
                    <div>
                        <img src="/assets/images/icon-refund.png" alt="icon-refund"/>
                        <span>{ i18next.t('page.orders.returnOrder.refund') }</span>
                    </div>
                    {stListPaymentHistory?.refundableAmount !== 0 && stReturnOrder?.status !== Constants.RETURN_ORDER_STATUS.CANCELLED &&
                        <GSButton
                            success
                            onClick={ (e) => {
                                e.preventDefault()
                                setStModalPaymentConfirmation(true)
                            } }
                        >
                            <Trans i18nKey="page.orderList.orderDetail.btn.confirmPayment" className="sr-only">
                                Save
                            </Trans>
                        </GSButton>
                    }
                </div>
                <hr className="mt-0"/>
                <div className="content-payment-history d-flex justify-content-between pb-3">
                    <div>
                        <p className="m-0">
                            {i18next.t('page.orders.returnOrder.detail.refundableAmount')}: <span>{CurrencyUtils.formatMoneyByCurrency(stListPaymentHistory?.refundableAmount, currency)}</span>
                            </p>
                    </div>

                    <div>
                        <p className="m-0">{i18next.t('page.orders.returnOrder.detail.paidAmount')}: <span>{CurrencyUtils.formatMoneyByCurrency(stListPaymentHistory?.paidAmount, currency)}</span></p>
                    </div>

                </div>

                <div className='payment-history-info'>


                    <h3 className='title mt-2'>{i18next.t('page.orderList.orderDetail.paymentHistory')}</h3>


                    <div id="accordion">

                        {
                            stListPaymentHistory?.returnPaymentHistoryDTOList?.map((item, index) => {
                                return (
                                    <div key={index}>
                                        <div className=" row justify-content-between">
                                            <p className="font-weight-500 cursor--pointer align-items-center d-flex"
                                               data-toggle="collapse"
                                               href={`#paymentHistory-${index}`}
                                               onClick={() => checkDownUp(`paymentHistory-${index}`)}>
                                                <div
                                                    className={stListPaymentHistory.returnPaymentHistoryDTOList.length === index + 1 ? '' : 'img-check-payment'}>
                                                    <img src="/assets/images/icon-check.png"
                                                        style={{
                                                            width: '13px',
                                                            marginRight: '5px'
                                                        }}
                                                        alt=""
                                                    />
                                                    <div></div>
                                                </div>
                                                <p className="m-0 payable-successfully">{i18next.t('page.orders.returnOrders.payableSuccessfully',
                                                    {x: CurrencyUtils.formatMoneyByCurrency(item.paymentAmount, currency)})}
                                                </p>
                                                {stCheckDownUp !== `paymentHistory-${index}` &&
                                                <i className="fa fa-caret-down ml-1"></i>}
                                                {stCheckDownUp === `paymentHistory-${index}` &&
                                                <i className="fa fa-caret-up ml-1"></i>}
                                            </p>


                                            <p className='payment-history-date'>
                                                {moment(item.createdDate).format('DD-MM-YYYY HH:mm')}
                                            </p>
                                        </div>


                                        <div id={`paymentHistory-${index}`}
                                             className={stListPaymentHistory.returnPaymentHistoryDTOList.length === index + 1 ? 'collapse payment-history-column' : 'collapse payment-history-column payment-history-line'}
                                             data-parent="#accordion">
                                            <div>
                                                <div className='row d-flex'>
                                                    <p>
                                                        {i18next.t('page.orders.returnOrder.detail.payment.history.refundAmount')}:
                                                    </p>
                                                    <p className='ml-5'>
                                                        {CurrencyUtils.formatMoneyByCurrency(item.paymentAmount, currency)}
                                                    </p>
                                                </div>

                                                <div className='row d-flex'>
                                                    <p>
                                                        {i18next.t('page.orders.returnOrders.refundMethod')}:
                                                    </p>
                                                    <p className='ml-5'>
                                                        <Trans i18nKey={"page.order.detail.information.paymentMethod." + item.paymentMethod}/>
                                                    </p>
                                                </div>

                                                <div className='row d-flex'>
                                                    <p>
                                                        {i18next.t('page.orders.returnOrders.confirmedBy')}:
                                                    </p>
                                                    <p className='ml-5'>
                                                        {renderOrderCreatedBy(item.paymentReceivedBy)}
                                                    </p>
                                                </div>

                                                <div className='payment-history-note'>
                                                    <p className="title">
                                                        {i18next.t('page.orderList.orderDetail.modalPayment.note')}:
                                                    </p>
                                                    <p className="description">
                                                        {item.note || "-"}
                                                    </p>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }


                    </div>


                </div>


            </GSWidgetContent>
        )
    }

    const renderPaymentHistory = () => {
        return (
            <GSWidgetContent>
                <div className="payment-history">
                    <div>
                        <img src="/assets/images/icon-refund.png" alt="icon-refund"/>
                        <span>{ i18next.t('page.orders.returnOrder.refund') }</span>
                    </div>
                    <UikSelect
                        position="top-right"
                        className="dropdown-box"
                        defaultValue={ stPaymentMethod }
                        options={
                            PAYMENT_METHOD
                        }
                        onChange={ (item) => {
                            setStPaymentMethod(item.value)
                            setStIsEdited(true)
                        } }
                    />
                </div>

                {
                    stPaymentMethod !== PAYMENT_METHOD[0].value &&
                    <div className="content-payment-history">
                        <div className="box-row-2">
                            <AvFieldCurrency
                                label={ i18next.t('page.orderList.orderDetail.modalPayment.amount') }
                                name="paymentAmount"
                                unit={currency}
                                value={getTotal()}
                                validate={ {
                                    ...FormValidate.required(),
                                    ...FormValidate.minMaxValueMoney(VALIDATE_INPUT.MIN, getTotal(), currency,'page.orders.returnOrder.detail.minimum.currency'),
                                    ...FormValidate.maxValueMoney(getTotal(), currency)
                                } }
                                parentClassName="return-order-currency"
                                position={CurrencyUtils.isPosition(currency)}
                                precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                            />

                            <div className="payment-history-date">
                                <p>
                                    { i18next.t('page.orderList.orderDetail.modalPayment.date') }
                                </p>

                                <GSDateRangePicker
                                    readOnly
                                    singleDatePicker
                                    fromDate={ stDate }
                                    timePicker
                                    onApply={ handleDateTimePicker }
                                    minDate={ stOrderDetail.orderInfo?.createDate && moment(stOrderDetail.orderInfo?.createDate) }
                                    maxDate={ moment(moment.now()).set({ h: 0, m: 0, ms: 0 }) }
                                    timePicker24Hour
                                    opens={ 'top' }
                                    drops={ 'up' }
                                >
                                </GSDateRangePicker>
                            </div>
                        </div>

                        <div style={ { width: '48%' } }>
                            <AvFieldCountable
                                label={ i18next.t('page.orderList.orderDetail.modalPayment.note') }
                                name={ 'notePaymentHistory' }
                                isRequired={ false }
                                type={ 'textarea' }
                                minLength={ 0 }
                                maxLength={ 150 }
                                rows={ 3 }
                            />
                        </div>

                    </div>
                }

            </GSWidgetContent>
        )
    }

    const renderPaymentStatus = (orderInfo) => {
        if (!orderInfo) {
            return
        }

        if ((orderInfo.paid && !orderInfo.isInStore) || (orderInfo.paid && orderInfo.isInStore && orderInfo.payType === Constants.PAY_TYPE.PAID)) {
            return <Trans i18nKey="page.order.detail.items.paid"/>
        }

        return <Trans i18nKey="page.order.detail.items.unpaid"/>
    }

    const renderOrderInformation = (orderInfo) => {
        return (
            <div className="d-flex flex-column box-order-info-group">
                {
                    stController.showOrderStatus && <div className="order-info-group">
                        <div
                            className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.status') }</div>
                        <div className="order-information__right-value">
                        <span className={stReturnOrder?.status === Constants.RETURN_ORDER_STATUS.CANCELLED ? "status cancelled" : "status"}>
                            <GSTrans
                                t={ `progress.bar.purchase.order.step.${ (stReturnOrder?.status || '').toLowerCase() }` }/>
                        </span>
                        </div>
                    </div>
                }
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.orderID') }</div>
                    <div className="order-information__right-value cursor--pointer" style={ { color: '#1E69D5' } }
                         onClick={ () => onClickOrderRow(orderInfo.orderId, orderInfo.channel) }>
                        { orderInfo?.orderId }
                    </div>
                </div>
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.orderDate') }</div>
                    <div className="order-information__right-value">
                        { moment(orderInfo?.createDate).format('DD-MM-YYYY') }
                    </div>
                </div>
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.paymentStatus') }</div>
                    <div className="order-information__right-value">
                        { renderPaymentStatus(orderInfo) }
                    </div>
                </div>
                { orderInfo?.debtAmount >= 0 &&
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.orderDebt') }</div>
                    <div className="order-information__right-value">
                        {CurrencyUtils.formatMoneyByCurrency(orderInfo.debtAmount, currency)}
                    </div>
                </div>
                }
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.discountAmount') }</div>
                    <div className="order-information__right-value">
                        { CurrencyUtils.formatMoneyByCurrency(orderInfo?.discount?.totalDiscount, currency) }
                    </div>
                </div>
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.orderInformation.earnedPoint') }</div>
                    <div className="order-information__right-value">
                        { orderInfo?.loyaltyPoint || 0 } {i18next.t('page.orders.returnOrder.orderInformation.points')}
                    </div>
                </div>
                <div className="order-info-group">
                    <div
                        className="order-information__left-label d-flex align-items-center">{ i18next.t('page.orders.returnOrder.orderInformation.branch') }</div>
                    <div className="order-information__right-value w-100">
                        {
                            stController.preventChangeBranch
                                ? stReturnOrder?.returnBranchName
                                : <UikSelect
                                    key={ stStoreBranches + '_' + stSelectedReturnBranch.value }
                                    className="w-100"
                                    defaultValue={stSelectedReturnBranch.value }
                                    options={ stStoreBranches }
                                    placeholder={ i18next.t('page.marketing.discounts.coupons.create.applicableBranch.select') }
                                    onChange={ handleChangeBranch }
                                />
                        }
                    </div>
                </div>
            </div>
        )
    }

    const renderCustomerInformation = (customerInfo) => {
        return (
            <div className="d-flex flex-column box-order-info-group">
                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.customerInformation.name') }</div>
                    <div className="order-information__right-value" style={Object.keys(stCustomerProfile).length === 0 ? {} : { color: '#1E69D5',cursor:'pointer' } }
                         onClick={ () => onClickCustomerInformation(stCustomerProfile) }>
                        { customerInfo?.name }
                    </div>
                </div>

                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.orders.returnOrder.customerInformation.phoneNumber') }</div>
                    <div className="order-information__right-value">
                        { customerInfo?.phone }
                    </div>
                </div>

                <div className="order-info-group">
                    <div
                        className="order-information__left-label">{ i18next.t('page.customers.debt') }</div>
                    <div className="order-information__right-value">
                        { CurrencyUtils.formatMoneyByCurrency(stDebtAmount, currency) }
                    </div>
                </div>
            </div>
        )
    }

    const renderNote = () => {
        return <div className="d-flex flex-column box-order-info-group">
            <div className="order-info-group note">
                <AvField
                    disabled={ stController.preventChangeNote }
                    name="note"
                    type="textarea"
                    rows={ 3 }
                    wrap="hard"
                    maxLength="150"
                    value={ stNote }
                    onChange={ (e) => {
                        setStNote(e.target.value)
                        setStIsEdited(true)
                    } }
                />
            </div>
        </div>
    }
    const showReturnOrderHistory = () => {
        fetchReturnOrderProcessingHistory()

    }
    const onCloseOrderHistoryModal = () => {
        setStShowModalReturnOrderHistory(state => !state)
    }

    const handleIsModalIMEI = (listImei) =>{
        setStListModaIMEI(listImei)
        setStIsModaIMEI(state => !state)
    }

    const renderModalIMEI = () => {
        return (
            <Modal isOpen={stIsModaIMEI} toggle={handleIsModalIMEI} className="modaIMEI-order-detail">
                <ModalHeader toggle={()=>handleIsModalIMEI([])}>{i18next.t("page.affiliate.partner.sold")}</ModalHeader>
                <ModalBody>
                    {stListModaIMEI.length > 0 && stListModaIMEI?.map((itemIMEI,index)=>{
                        return(
                            <>
                                <div key={index} className="itemIMEI">
                                    {itemIMEI.imeiSerial}
                                </div>
                            </>
                        )
                    })}
                </ModalBody>
            </Modal>
        )
    }

    return (
        <>
            <GSContentContainer confirmWhenRedirect
                                confirmWhen={ stIsEdited && stEditorMode !== Constants.RETURN_ORDER_MODE.WIZARD }
                                isSaving={ stIsSaving }
                                isLoading={ stShowLoading }
                                className="return-order-form-editor"
            >
                {renderModalIMEI()}
                {stLoadingScreen && <LoadingScreen />}


                <GSModalCancelNote
                    isToggle={stIsToggleCancelModal}
                    onClose={toggleCancelModal}
                    onSubmitData={handleCancelModal}
                    text={stListPaymentHistory?.paidAmount > 0 ? i18next.t('page.orders.returnOrder.detail.complete.content4') 
                        : i18next.t('page.orders.returnOrder.detail.areYouSure')}
                    title={i18next.t('common.txt.confirm.modal.title')}
                    placeholderNote={i18next.t('page.order.create.complete.inputNote')}
                    maxLength={150}
                />

                <ConfirmModal ref={refCompleteModal} modalClass={"complete-return-order-modal"}/>

                <ManageInventoryReturnOrderModal
                    isOpenModal={ stIsOpenManagedInventoryModal }
                    name={ stDataImeiModal?.name }
                    modelName={ stDataImeiModal?.variationName }
                    itemId={ stDataImeiModal?.itemId }
                    modalId={ stDataImeiModal?.modalId }
                    quantity={ stSelectedProducts.find(qt => qt.id === stDataImeiModal?.id)?.quantity }
                    defaultCodes={ stDefaultImeiModal.find(i => stDataImeiModal.modalId ? i.modalId == stDataImeiModal.modalId : i.itemId == stDataImeiModal.itemId)?.imeiSerial || [] }
                    codes={stDataImeiModal?.orderItemIMEIs || stDataImeiModal?.returnOrderItemImeiList || [] }
                    cancelCallback={ handleManagedInventoryCallback }
                    saveCallback={ selectImeiModalSave }/>


                <ConfirmPaymentModal
                    toggle={ stModalPaymentConfirmation }
                    orderId={ returnOrderId }
                    debtAmount={ stListPaymentHistory?.refundableAmount }
                    onConfirm={ handleConfirmPayment }
                    onClose={ togglePaymentConfirmation }
                    currency={currency}
                />
                <GSContentHeader>
                    { renderHeader() }
                </GSContentHeader>
                <GSContentBody size={ GSContentBody.size.MAX }>
                    <AvForm ref={ refForm } onValidSubmit={ handleOnValidSubmit } autoComplete="off"
                            className="content-wrapper">
                        <div className="product-list-wrapper">

                            { renderProductInformation() }

                            <GSWidget className="received-goods">
                                <GSWidgetContent>
                                    { renderReceiveGoods() }
                                </GSWidgetContent>
                            </GSWidget>

                            <GSWidget className="payment-method">
                                {stEditorMode === Constants.RETURN_ORDER_MODE.CREATE && renderPaymentHistory() }
                                {stEditorMode !== Constants.RETURN_ORDER_MODE.CREATE && renderEditPaymentHistory() }
                            </GSWidget>

                        </div>

                        <div className="order-information-wrapper">
                            <GSWidget className="order-information">
                                <GSWidgetHeader
                                    title={ i18next.t('page.orders.returnOrder.orderInformation') }/>
                                <GSWidgetContent>
                                    { renderOrderInformation(stOrderDetail.orderInfo) }
                                </GSWidgetContent>
                            </GSWidget>
                        </div>

                        <div className="customer-information-wrapper">
                            <GSWidget className="customer-information">
                                <GSWidgetHeader
                                    title={ i18next.t('page.orders.returnOrder.customerInformation') }/>
                                <GSWidgetContent>
                                    { renderCustomerInformation(stOrderDetail.customerInfo) }
                                </GSWidgetContent>
                            </GSWidget>
                        </div>

                        <div className="note-wrapper">
                            <GSWidget className="note">
                                <GSWidgetHeader
                                    title={ i18next.t('page.purchaseOrderFormEditor.note.header') }/>
                                <GSWidgetContent>
                                    { renderNote() }
                                </GSWidgetContent>
                            </GSWidget>
                        </div>
                        {stEditorMode !== Constants.RETURN_ORDER_MODE.CREATE && (
                            <div className="return-order-history-wrapper">
                                <GSWidget className="return-order-history">
                                    <GSWidgetContent>
                                        <GSFakeLink onClick={()=> showReturnOrderHistory()}>
                                            <GSTrans className="font-weight-bold" t='page.orders.returnOrder.return.history'/>
                                        </GSFakeLink>
                                    </GSWidgetContent>
                                </GSWidget>
                            </div>
                        )}


                    </AvForm>
                </GSContentBody>
            </GSContentContainer>
            <ReturnOrderHistoryModal
                orderProcessingHistory={orderProcessingHistory}
                isOpenModal={stShowModalReturnOrderHistory}
                onCancel={()=> onCloseOrderHistoryModal()}
            />
        </>
    )
}

ReturnOrderFormEditor.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
}

ReturnOrderFormEditor.propTypes = {
    currency: PropTypes.string
}

export default ReturnOrderFormEditor
