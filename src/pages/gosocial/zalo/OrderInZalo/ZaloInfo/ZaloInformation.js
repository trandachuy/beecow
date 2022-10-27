import React, {useContext, useEffect, useRef, useState} from 'react'
import {Trans} from 'react-i18next'
import GSButton from '../../../../../components/shared/GSButton/GSButton'
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans'
import './ZaloInformation.sass'
import GSComponentTooltip, {GSComponentTooltipPlacement} from '../../../../../components/shared/GSComponentTooltip/GSComponentTooltip'
import {OrderInZaloContext} from '../../context/OrderInZaloContext'
import {OrderService} from '../../../../../services/OrderService'
import storage from '../../../../../services/storage'
import i18next from 'i18next'
import Constants from '../../../../../config/Constant'
import PinCustomer from '../../../customer/PinCustomer'
import beehiveService from '../../../../../services/BeehiveService'
import BeehiveService from '../../../../../services/BeehiveService'
import {ImageUtils} from '../../../../../utils/image'
import {BCOrderService} from '../../../../../services/BCOrderService'
import LoadingScreen from '../../../../../components/shared/LoadingScreen/LoadingScreen'
import {OrderInZaloContextService} from '../../context/OrderInZaloContextService'
import {GSToast} from '../../../../../utils/gs-toast'
import ZaloOrderSummaryPrinter from '../OrderSummaryPrinter/ZaloOrderSummaryPrinter'
import moment from 'moment'
import {CurrencyUtils} from '../../../../../utils/number-format'
import GSOrderStatusTag from '../../../../../components/shared/GSOrderStatusTag/GSOrderStatusTag'
import {NAV_PATH} from '../../../../../components/layout/navigation/Navigation'
import OrderListGosocial from '../../../order/OrderListGosocial'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import {FormValidate} from '../../../../../config/form-validate'
import ConfirmModal, {ConfirmModalUtils} from '../../../../../components/shared/ConfirmModal/ConfirmModal'
import NoteZalo from '../../../note/NoteZalo'
import zaloService from "../../../../../services/ZaloService";
import {GoSocialUtils} from "../../../GoSocialUtils";
import {DateTimeUtils} from "../../../../../utils/date-time";
import {CredentialUtils} from "../../../../../utils/credential";

const PAYMENT_METHOD = [
    {
        value: Constants.ORDER_PAYMENT_METHOD_COD,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_COD)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)
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
        value: Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD),
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING),
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_PAYPAL,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_PAYPAL),
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_CASH,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_CASH),
    }

]

const SHIPPING_DEFAULT_METHOD = {
    name: i18next.t("page.setting.shippingAndPayment.selfDelivery"),
    providerName: 'SELF_DELIVERY',
    id: 14
}

const PAYMENT_RADIO = {
    PAY_IN_ADVANCE: 'PAY_IN_ADVANCE',
    COD: 'COD'
}

const OPTION_SHOW = {
    INFO: 'INFO',
    ADDRESS: 'ADDRESS',
    ORDER: 'ORDER'
}

const defaultDeliveryServiceId = 14

const ZaloInformation = props => {
    const { state, dispatch } = useContext(OrderInZaloContext.context)

    const [stShowOrder, setStShowOrder] = useState(false)
    const [stErrorAddress, setStErrorAddress] = useState(false)
    const [stPaymentMethod, setStPaymentMethod] = useState(PAYMENT_METHOD[0].value)
    const [stPaymentRadio, setStPaymentRadio] = useState(PAYMENT_RADIO.COD)
    const [stAvatarObj, setStAvatarObj] = useState(null)
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stOptionShow, setStOptionShow] = useState(OPTION_SHOW.INFO)
    const [stOrderList, setStOrderList] = useState([])
    const [stNoteList, setStNoteList] = useState([])
    const [stIsEditNote, setStIsEditNote] = useState(null)
    const [stIsOpenNote, setStIsOpenNote] = useState(false)
    const [stZaloUserList,setStZaloUserList] = useState([])
    const [stZaloUserProfile, setStZaloUserProfile] = useState(null);
    const [stZaloUserAlreadySendInformationRequest, setStZaloUserAlreadySendInformationRequest] = useState(true);
    const [stErroNote, setStErroNote] = useState(false);
    const [customerSummary, setCustomerSummary] = useState({})
    const [stShippingMethodSelected, setStShippingMethodSelected] = useState(SHIPPING_DEFAULT_METHOD)
    const [stShippingMethodList, setStShippingMethodList] = useState([])
    const [stShippingCodeSelected, setStShippingCodeSelected] = useState(defaultDeliveryServiceId)
    const [stFetchCalcShippingFee, setStFetchCalcShippingFee] = useState(false)
    const [isResetCalcShippingFee, setIsResetCalcShippingFee] = useState(false)
    const [isLoadingCalcShipping, setIsLoadingCalcShipping] = useState(false)
    const [isEnabledShippingMethod, setIsEnabledShippingMethod] = useState(false)

    const refOrderPrinter = useRef(null)
    const refClickIsOpenNote = useRef(null)
    const refDeleteNoteModal = useRef(null)
    const refOutsideClick = useRef(null)

    useEffect(() => {
        setStShowOrder(props.closeOrder)
        setStOptionShow(OPTION_SHOW.INFO)
    }, [props.closeOrder])

    useEffect(() => {
        getPinCustomerProfile()
        setStErrorAddress(false)
    }, [props.customerProfile, state.zaloUserId])

    useEffect(() => {
        fetchCustomerSummary()
    }, [state.profileId])

    useEffect(() => {
        getPinCustomerProfile()
    }, [])

    useEffect(() => {
        fetchNoteList(state.profileId, 0, 2)
    }, [state.profileId])

    useEffect(() => {
        fetchOrderList(state.user.userId, 0, 3)
    }, [state.user.userId])


    useEffect(() => {
        const index = stZaloUserList.findIndex(userId => userId.zaloUserId == state.zaloUserId)
        if(index == -1){
            handleCancelOrder()
        }else {
            dispatch(OrderInZaloContext.actions.setState(stZaloUserList[index].state))
        }
    },[state.zaloUserId])

    useEffect(() => {
        if (state.zaloUserId && !state.profileId) {
            zaloService.getUserProfile(state.zaloUserId, state.zaloOAUserDetail['oa_id'])
                .then(userProfile => {
                    setStZaloUserProfile(userProfile)
                    setStZaloUserAlreadySendInformationRequest(!!userProfile.phone)
                })
        }
    }, [state.zaloUserId, state.profileId])

    useEffect(() => {
        const data = {
            zaloUserId:state.zaloUserId,
            state:state
        }
        let zaloUserList = [data,...stZaloUserList]
        const index = zaloUserList.findIndex(userId => userId.zaloUserId == state.zaloUserId)
        if (index != -1){
            zaloUserList[index].state = state
            setStZaloUserList(zaloUserList)
        }

    },[
        state.zaloUserId,
        state.profileId,
        state.productList,
        state.note,
        state.shippingInfo,
        state.discountInfo,
        state.paymentMethod,
        state.paymentType,
        state.noteSeller,
        state.totalVATAmount
    ])

    useEffect(() => {
        if (
            !state.zaloUserId ||
            !stShowOrder ||
            !state.profileId
        )
            return;
        if (stShippingCodeSelected !== defaultDeliveryServiceId || state.productList.length === 0) {
            if(isEnabledShippingMethod) setIsEnabledShippingMethod(false)
            handleClearShippingMethod()
            if(stShippingCodeSelected === defaultDeliveryServiceId) return
            GSToast.error('message.reset.shipping.option.due.to.shopping.cart.change', true)
        }
    }, [props.subTotalPrice, state.productList])

    useEffect(() => {
        if(isEnabledShippingMethod) setIsEnabledShippingMethod(false)
        if (stShippingCodeSelected !== defaultDeliveryServiceId) {
            handleClearShippingMethod()
            GSToast.error('message.reset.shipping.option.due.to.shopping.cart.change', true)
        }
    }, [state.address, props.storeBranch])

    useEffect(() => {
        if (!props.defaultDeliveryServiceId) return;
        props.defaultDeliveryServiceId(stShippingCodeSelected);
    }, [stShippingCodeSelected])

    const fetchCustomerSummary = () => {
        BeehiveService.getCustomerDetail(state.profileId).then(detail => {
            if (detail.userId) {
                BCOrderService.getCustomerSummary(detail.userId, detail.saleChannel).then(summary => {
                        setCustomerSummary({...summary, saleChannel: detail.saleChannel});
                    }, () => {
                        setCustomerSummary({ saleChannel: detail.saleChannel })
                    }
                )
            } else {
                setCustomerSummary({ saleChannel: detail.saleChannel })
            }
        }, () => {
            setCustomerSummary({})
        })
    }

    const fetchNoteList = (profileID, page, size) => {
        if(profileID){
            zaloService.getAllNoteZalo(profileID, page, size)
                .then(noteList => {
                    setStNoteList(noteList)
                })
                .catch(() => {
                    setStNoteList([])
                })
        }else {
            setStNoteList([])
        }
    }

    const fetchOrderList = (buyerId, page, size) => {
        if(buyerId){
            BCOrderService.getCustomerOrderList(buyerId,
                page,
                size,
                undefined,
                'gosell',
                'lastModifiedDate,desc'
            )
                .then(result => {
                    setStOrderList(result)
                })
                .catch(() => {
                    setStOrderList([])
                })
        }else {
            setStOrderList([])
        }
    }

    const handleCreateOrder = () => {
        let totalPrice = props.getTotalPrice();
        // Validate if total amount has exceeded the limit
        if (totalPrice > Constants.VALIDATIONS.ORDER.MAX_TOTAL_AMOUNT) {
            GSToast.error(i18next.t('page.order.checkout.totalAmountExceeded', {
                totalAmount: totalPrice,
                maxTotalAmount: Constants.VALIDATIONS.ORDER.MAX_TOTAL_AMOUNT,
                currencySymbol: CredentialUtils.getStoreCurrencySymbol()
            }));
            return;
        }

        if (state.profileId == undefined || (state.address.address === "" || Object.keys(state.address).length === 0)) {
            setStErrorAddress(true)
            return
        }

        let products = state.productList.filter(p => p.checked).map(pro => {
            return {
                itemId: pro.itemId,
                modelId: pro.modelId || undefined,
                quantity: +(pro.quantity),
                langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
                branchId: props.storeBranch?.value
            }
        })

        setStIsFetching(true)
        const data = {
            branchId: props.storeBranch?.value,
            buyerId: state.user.userId ? state.user.userId : undefined,
            profileId: state.profileId ? state.profileId : undefined,
            paymentType: state.paymentType,
            guest: state.user ? state.user.guest : undefined,
            cartItemVMs: products,
            deliveryInfo: {
                address: state.address.address,
                districtCode: state.address.districtCode,
                email: state.user.email,
                locationCode: state.address.locationCode,
                phoneNumber: state.user.phone,
                wardCode: state.address.wardCode,
                contactName: state.user.name,
                countryCode: state.address.countryCode,
                address2:state.address.address2,
                city: state.address.city,
                zipCode: state.address.zipCode,
                province: state.address.province
            },
            deliveryServiceId: 14,
            directDiscount: getTotalDiscount(),
            langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
            note: state.note,
            paymentMethod: state.paymentMethod,
            platform: 'WEB',
            receivedAmount: state.paymentType === PAYMENT_RADIO.COD ? 0 :  state.receivedAmount,
            selfDeliveryFee: state.shippingInfo.amount,
            storeId: +(storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
            weight: state.shippingInfo.weight,
            width: state.shippingInfo.width,
            length: state.shippingInfo.length,
            height: state.shippingInfo.height
        }

        OrderService.checkoutGoSocial(data)
            .then(orderRaw => {
                GSToast.commonCreate()
                handleClearShippingMethod()
                BCOrderService.getOrderDetail(orderRaw.id).then(order => {
                    dispatch(OrderInZaloContext.actions.setUserId({
                        userId: +(order.customerInfo.userId),
                    }));

                    dispatch(OrderInZaloContext.actions.setOrderId(order.orderInfo.orderId))
                    fetchOrderList(order.customerInfo.userId, 0, 3)
                    handleOpenOrder()

                    //Will RESET after print order summary
                    OrderInZaloContextService.updateShippingInfo(state, dispatch, order.shippingInfo)
                        .finally(() => refOrderPrinter.current.print())
                })
            })
            .catch(e => {
                // remainingQuantity
                if (e.response.data && e.response.data.params && e.response.data.params.itemErrors && e.response.data.params.itemErrors.length > 0) {
                    const deletedItemListFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.notFound' || res.message === 'error.item.deleted')
                    const outStockProductFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.outOfStock')
                    const quantityInvalidFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.order.orderItems.quantity.invalid')
                    const insufficientStockFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.insufficientStock');

                    // first: detect deleted product
                    if (deletedItemListFromResponse.length > 0) {
                        let deletedItemList = []

                        for (const deletedItem of deletedItemListFromResponse) {
                            const matchedItems = state.productList.filter(product => {
                                const detail = deletedItem.params
                                return product.checked && detail.itemId === product.itemId
                            })
                            if (matchedItems.length > 0) {
                                matchedItems.forEach(item => {
                                    deletedItemList.push({
                                        ...item,
                                        deleted: true
                                    })
                                })

                            }
                        }
                        deletedItemList.forEach(item => {
                            dispatch(OrderInZaloContext.actions.modifyProduct(item))
                        })
                        GSToast.error('page.order.instorePurchase.productHasBeenDeletedWarning', true)
                        return
                    }

                    // if has no deleted product -> check outstock
                    if (outStockProductFromResponse.length > 0) {
                        let outOfStockItemList = []
                        for (const product of state.productList.filter(p => p.checked)) {
                            const outStockProduct = outStockProductFromResponse.find(p => {
                                const detail = p.params
                                if (detail.modelId) {
                                    return detail.itemId == product.itemId && detail.modelId == product.modelId
                                } else {
                                    return detail.itemId == product.itemId
                                }
                            })
                            if (outStockProduct) {
                                outOfStockItemList.push({
                                    ...product,
                                    quantity: outStockProduct.params.remainingQuantity
                                })
                            }
                        }

                        OrderInZaloContextService.dispatchUpdateOutOfStockProduct(state, dispatch, outOfStockItemList, state.productList, products[0].branchId)
                        GSToast.error('page.order.create.complete.quantityModal.subTitle', true)
                        return
                    }

                    // check invalid
                    if (quantityInvalidFromResponse.length > 0) {
                        GSToast.error('page.order.instorePurchase.productInvalidQuantity', true)
                        return
                    }

                    // check insufficent stock
                    if (insufficientStockFromResponse.length > 0) {
                        const insufficientGroup = insufficientStockFromResponse.map(i => i.params.itemModelIds)

                        dispatch(OrderInZaloContext.actions.setInsufficientErrorGroup(insufficientGroup))
                        GSToast.error('page.order.instorePurchase.productInsufficientStock', true)
                        return
                    }

                    return
                }else {
                    if (e.response.data.message === "error.item.outOfStock") {
                        GSToast.error('page.order.create.complete.quantityModal.subTitle', true)
                        return
                    }
                }
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }

    const getTotalDiscount = () => {
        return OrderInZaloContextService.calculateDiscountAmount(state.productList, state.discountInfo)
    }

    const handleOpenOrder = () => {
        setStShowOrder(show => !show)
        props.showOrder(!stShowOrder)
        handleCloseNote()
        handleClearShippingMethod()
    }

    const handleCancelOrder = () => {
        dispatch(OrderInZaloContext.actions.resetOrder())
        setStErrorAddress(false)
        setStPaymentRadio(PAYMENT_RADIO.COD)
    }

    const handleOpenAddress = () => {
        setStOptionShow(OPTION_SHOW.ADDRESS)
        setStErrorAddress(false)
        handleCloseNote()
    }

    const handleChangeNote = _.debounce(value => {
        dispatch(OrderInZaloContext.actions.setNote(value))
    }, 300)

    const handleChangeNoteSeller = e => {
        dispatch(
            OrderInZaloContext.actions.setNoteSeller(e.target.value)
        )
    }

    const handleChangePayment = e => {
        if(e.target.value !== PAYMENT_RADIO.COD  && stShippingCodeSelected !== defaultDeliveryServiceId) {
            GSToast.error('message.reset.shipping.option.due.to.shopping.cart.change', true)
            handleClearShippingMethod()
        }
        dispatch(
            OrderInZaloContext.actions.setPaymentMethod(e.target.value)
        )
        setStPaymentMethod(e.target.value)
    }

    const handleUploadedUrl = fileUrl => {
        OrderInZaloContextService.sendOrderSummaryMessage(state, dispatch, fileUrl)
            .finally(() => {
                dispatch(OrderInZaloContext.actions.resetOrder())
            })
    }

    const handleOpenDetailCustomer = () => {
        if (state.profileId && customerSummary.saleChannel) {
            window.open(NAV_PATH.customers.CUSTOMERS_EDIT + `/${state.profileId}/${state.user.userId}/${customerSummary.saleChannel}`)
        }
    }

    const handleRemoveProfileId =()=>{
        dispatch(OrderInZaloContext.actions.setProfileId(undefined))
    }

    const getPinCustomerProfile = () => {
        if (state.zaloUserId && state.zaloUserId !== '') {
            setStOptionShow(OPTION_SHOW.INFO)
            beehiveService.getCustomerProfilePinWithSocialUser(Constants.GO_CHAT_TYPE.ZALO, state.zaloUserId).then(full => {
                dispatch(OrderInZaloContext.actions.setUser({
                    userId: full.userId,
                    name: full.fullName,
                    email: full.email,
                    phone: full.phone,
                    guest: full.guest
                }))
                dispatch(OrderInZaloContext.actions.setProfileId(full.id))
                dispatch(OrderInZaloContext.actions.setAddress(full.customerAddress))

                if (full.userId && full.userId !== 'undefined' && ([Constants.SaleChannels.BEECOW, Constants.SaleChannels.GOSELL, Constants.SaleChannels.GOMUA].includes(full.saleChannel))) {
                    BCOrderService.getCustomerAvatar(full.userId)
                        .then(result => {
                            setStAvatarObj(result)
                        })
                }
            }, () => {
                dispatch(OrderInZaloContext.actions.setUser({
                    userId: undefined,
                    name: undefined,
                    email: undefined,
                    phone: undefined,
                    guest: false
                }))
                dispatch(OrderInZaloContext.actions.setProfileId(undefined))
                dispatch(OrderInZaloContext.actions.setAddress({}))
            })
        }
    }

    const handlePayInAdvance = (e) => {
        dispatch(OrderInZaloContext.actions.setPaymentType(e.target.value))
        if (e.target.value === PAYMENT_RADIO.PAY_IN_ADVANCE &&
            stPaymentMethod === Constants.ORDER_PAYMENT_METHOD_COD) {
            dispatch(OrderInZaloContext.actions.setPaymentMethod(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER))
        }
        if((e.target.value !== PAYMENT_RADIO.COD ||  stPaymentMethod !== Constants.ORDER_PAYMENT_METHOD_COD) && stShippingCodeSelected !== defaultDeliveryServiceId){
            handleClearShippingMethod()
            GSToast.error('message.reset.shipping.option.due.to.shopping.cart.change', true)
        }
    }

    const isEnabled = state.productList.filter(p => p.checked).length > 0;

    const onClickOrderRow = (orderId, orderType, channel) => {
        let url = NAV_PATH.orderDetail + `/${channel}/` + orderId
        let win = window.open(url, '_blank')
        win.focus()
    }

    const handleOpenOrderFacebook = () => {
        setStOptionShow(OPTION_SHOW.ORDER)
    }

    const getOrderZalo = () => {
        setStOptionShow(OPTION_SHOW.INFO)
    }

    const handleIsOpenNote = () => {
        if (state.profileId === undefined || (state.address == null || Object.keys(state.address).length === 0)){
            setStErrorAddress(true)
            return
        }
        setStErroNote(false)
        if (stIsOpenNote) {
            setTimeout(() => {
                setStIsOpenNote(isOpen => !isOpen)
            }, 300)
        } else {
            setStIsOpenNote(isOpen => !isOpen)
        }
    }

    const handleCloseNote = () =>{
        setStIsOpenNote(false)
    }

    const handleValidSubmitEditNote = (event, value) => {
        if (state.address == null || Object.keys(state.address).length === 0) {
            setStErrorAddress(true)
            return
        }

        setStIsFetching(true)

        zaloService.updateNoteZalo(value).then((note) => {
            fetchNoteList(note.profileId, 0, 2)
            setStIsEditNote(null)
            GSToast.commonUpdate()
        }).finally(() => {
            setStIsFetching(false)
        })
    }

    const handleDeleteNote = (id, profileId) => {
        ConfirmModalUtils.openModal(refDeleteNoteModal, {
            messages: <>
                <p className="">{i18next.t('gosocial.facebook.conversations.delete.modal.text')}</p>
            </>,
            modalTitle: i18next.t`common.txt.confirm.modal.title`,
            okCallback: () => {
                setStIsFetching(true)
                zaloService.deleteNoteZalo(id)
                    .then(() => {
                        fetchNoteList(profileId, 0, 2)
                        setStIsEditNote(null)
                        GSToast.commonDelete()

                    }).finally(() => setStIsFetching(false))
            }
        })
    }

    const handleValidSubmitNote = (event, value) => {
        setStIsFetching(true)
        const dataNote = {
            createdDate:new Date(),
            profileId: state.profileId,
            storeId: +(storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
            note: value.note
        }

        zaloService.createNoteZalo(dataNote).then((note) => {
            dispatch(
                OrderInZaloContext.actions.setNoteSeller("")
            );
            fetchNoteList(state.profileId, 0, 2)
            refClickIsOpenNote.current.click()
            GSToast.commonCreate()
        })
            .catch(error => {
                if (error.response.data.message === "error.maximum.note"){
                    setStErroNote(true)
                }
            })
            .finally(() => {
            setStIsFetching(false)
        })
    }

    const handleOpenNoteFacebook = () => {
        setStOptionShow(OPTION_SHOW.NOTE)
    }

    const getNoteZalo = (callback) => {
        if (callback) {
            setStOptionShow(OPTION_SHOW.INFO)
        } else {
            fetchNoteList(state.profileId, 0, 2)
        }
    }


    function onSendZaloUserInfoRequest() {
        const oaId = state.zaloOAUserDetail['oa_id']

        const requestBody = {
            "recipient": {
                "user_id": state.zaloUserId
            },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "request_user_info",
                        "elements": [{
                            "title": state.zaloOAUserDetail.name,
                            "subtitle": "Đang yêu cầu thông tin từ bạn",
                            "image_url": "http://oa-wg-stc.zdn.vn/oa/customer/images/fillform.jpg"
                        }]
                    }
                }
            }
        }

        zaloService.sendMessage(oaId, requestBody)
            .then(() => {
                setStZaloUserAlreadySendInformationRequest(true)
            })
    }
    const handleClearShippingMethod = () => {
        setIsResetCalcShippingFee(true)
        // setIsLoadingCalcShipping(true)
        setStShippingMethodList([])
        setStShippingMethodSelected({})
        setStShippingCodeSelected(defaultDeliveryServiceId)
        dispatch(OrderInZaloContext.actions.setShippingInfo({ amount: 0 }));
    }

    const handleGroupProviderShipping = (data) => {
        const getGroupShipping = data.reduce(function (r, a) {
            r[a.deliveryService.providerName] = r[a.deliveryService.providerName] || [];
            r[a.deliveryService.providerName].push(a);
            return r;
          }, Object.create(null))
        let lstData = []
        Object.keys(getGroupShipping).forEach(function (key) {
            lstData.push({
                providerName: key,
                data: getGroupShipping[key]
            })
        });
        return lstData
    }

    const getTotalWeightProductList = (data) => {
        let sum = 0
        data.forEach(item => { sum += item.weight });
        return sum
    }

    const calcShippingPlanFee = () => {
        let totalWeight = getTotalWeightProductList(state.productList)
        const totalPrice = OrderInZaloContextService.calculateSubTotalPrice(state.productList)
        const storeId = CredentialUtils.getStoreId()
        const request = {
            deliveryAddress: {
                locationCode: state.address?.locationCode,
                districtCode: state.address?.districtCode ,
                wardCode: state.address?.wardCode
            },
            packageInfo: {
                length: 10,
                width: 10,
                height: 10,
                weight: totalWeight? totalWeight : 0,
                totalPrice: totalPrice
            },
            storeId: storeId,
            branchId: props.storeBranch?.value,
            onlySelfDelivery: false
        }
        setIsLoadingCalcShipping(true)
        BCOrderService.calcShippingPlanFree(request)
        .then(data => {
            setIsLoadingCalcShipping(false)
            // setIsResetCalcShippingFee(true)
            if(!data) return
            let getList = handleGroupProviderShipping(data)
            if(!getList) return
            setStShippingMethodList(getList)
        })
        .catch(err => {
            console.log(err)
            setIsLoadingCalcShipping(false)
        })
        .finally(() => {
            // setIsResetCalcShippingFee(true)
            // setIsLoadingCalcShipping(false)
            setStFetchCalcShippingFee(true)
        })
    }

    const handleFetchShippingMethod = () => {
        if(state.productList.length ===  0 || !state.profileId || !stShowOrder) return
        if(!stFetchCalcShippingFee || isResetCalcShippingFee){
            if(state.paymentType === PAYMENT_RADIO.COD && stPaymentMethod === Constants.ORDER_PAYMENT_METHOD_COD && stShippingCodeSelected === defaultDeliveryServiceId){
                calcShippingPlanFee()
            }
        }
        setIsEnabledShippingMethod(state => !state)
    }

    const handleChangeShippingMethod = (shipping) => {
        setIsEnabledShippingMethod(false)
        if(state.productList.length ===  0) return
        let fee  = 0
        if( shipping.providerName !== 'SELF_DELIVERY'){
            let getShippingMethodSelected = stShippingMethodList.find(r => r.providerName === shipping.providerName)
            let codeShipping = getShippingMethodSelected.data[0].deliveryService.id
            fee = getShippingMethodSelected.data[0].fee
            setStShippingMethodSelected(getShippingMethodSelected)
            setStShippingCodeSelected(codeShipping)

        }else{
            setStShippingCodeSelected(defaultDeliveryServiceId)
            setStShippingMethodSelected(SHIPPING_DEFAULT_METHOD)
        }
        dispatch(OrderInZaloContext.actions.setShippingInfo({ amount: +(fee) }))
    }

    const handleChangeShippingCodeSelected  = (event, fee) => {
        if(!event) return
        setStShippingCodeSelected(event.target.value)
        if(!fee) return
        dispatch(OrderInZaloContext.actions.setShippingInfo({ amount: +(fee) }))
    }

    const renderInfo = () => {
        return (
            <>
                {stIsFetching &&
                <LoadingScreen zIndex={9999} />
                }
                <ConfirmModal ref={refDeleteNoteModal} modalClass={'delete-note-facebook-modal'} />
                <div className="profile">
                    <div>
                        <div className="mr-2 ml-2 d-flex align-items-center">
                            <div className="profile_image">
                                <div className={'textAvatar'}
                                     style={{
                                         backgroundImage: `url(${ImageUtils.getImageFromImageModel(stAvatarObj, 60)})`,
                                         fontSize: '2rem'
                                     }}>
                                    {!stAvatarObj && GoSocialUtils.renderAvatarName(state?.profileId && state?.user?.name ? state?.user?.name : state?.zaloUserName)}
                                </div>
                            </div>
                            <div className="profile_name">
                                <div className="box_name show-profile mb-1" onClick={handleOpenDetailCustomer}>
                                    <p className="name">{state.profileId ? state.user.name : state.zaloUserName}</p>
                                </div>
                                {state.profileId && <p className="number mb-1">{state.user.phone}</p>}
                                {!state.profileId &&
                                <span className="type">{i18next.t('common.btn.new')}</span>
                                }
                                {state.profileId && state.user.guest &&
                                <span
                                    className="type contact">{i18next.t('page.livechat.customer.details.search.user_type.contact')}</span>
                                }
                                {state.profileId && !state.user.guest &&
                                <span
                                    className="type account">{i18next.t('page.livechat.customer.details.search.user_type.member')}</span>
                                }
                                {state.profileId && customerSummary && customerSummary.debtAmount !== null &&(
                                    <div>
                                        <b>{i18next.t('page.customers.edit.debt.title')}: &nbsp;</b>
                                        <span className="color-blue">{CurrencyUtils.formatMoneyByCurrency(customerSummary.debtAmount,CurrencyUtils.getLocalStorageSymbol())}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/*MAKE A INFORMATION REQUEST*/}
                        {/*{!state.profileId && !stZaloUserAlreadySendInformationRequest &&*/}
                        {/*    <div className="mt-3 d-flex justify-content-center align-items-center">*/}
                        {/*        <GSButton primary outline size="small" onClick={onSendZaloUserInfoRequest}>*/}
                        {/*            Send a request*/}
                        {/*        </GSButton>*/}
                        {/*    </div>*/}
                        {/*}*/}
                    </div>

                    {state.zaloUserId &&
                        <div className="profile_edit mt-2 cursor--pointer">
                            <img src="/assets/images/icon_edit_fb.png" onClick={handleOpenAddress} alt=''/>
                        </div>
                    }
                </div>
                <div id="accordion">
                    {!stShowOrder &&
                    <>
                        <div className="card">
                            <div className={state.zaloUserId ? "card-header cursor--pointer" : "card-header"} onClick={state.zaloUserId && handleOpenAddress}>
                                <div className="box_card">
                                    <img src="/assets/images/icon_location_fb.png" alt='' />
                                    <a className="card-link">
                                        <Trans i18nKey="page.customers.edit.address" />
                                    </a>
                                </div>
                                {
                                    state.zaloUserId &&
                                    <img src="/assets/images/icon_accordion_fb.png" className="hover-add" alt='' />
                                }

                            </div>
                            {stErrorAddress &&
                            <p className="error-address ml-4"
                               style={{color: '#DA1919', fontSize: '12px'}}
                            >{i18next.t('page.gosocial.note.error')}</p>
                            }

                            {state.address?.address && state.profileId &&
                            <p className="error-address ml-4"
                               style={{color: '#000000', fontSize: '13px'}}
                            >{state.address.address}
                            </p>
                            }
                        </div>
                        <div className="card">
                            <div className={stOrderList.length > 0 ?
                                stOrderList?.total >= 4 ? "card-header cursor--pointer" : "card-header" :
                                state.zaloUserId ? "card-header cursor--pointer" : "card-header"}
                                 onClick={state.zaloUserId && stOrderList.length === 0 ? handleOpenOrder : stOrderList?.total >= 4 && handleOpenOrderFacebook}>
                                <div className="box_card">
                                    <img className="" src="/assets/images/icon_cart_fb.png" alt='' />
                                    <a className="card-link">
                                        <Trans
                                            i18nKey="progress.bar.step.newOrder" />{stOrderList?.total > 0 && `(${stOrderList?.total})`}
                                    </a>
                                </div>
                                {
                                    state.zaloUserId &&
                                    <img className="cursor--pointer hover-add" src="/assets/images/icon_accordion_fb.png" alt=''/>
                                }
                            </div>
                            <div className="box_card zalo-info-order">
                                {
                                    stOrderList?.data?.map(order => {
                                        return (
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="id-time">
                                                    <p className="cursor--pointer"
                                                       onClick={() => onClickOrderRow(order.id, order.orderType, order.channel)}>{order.id}</p>
                                                    <span>
                                                        {DateTimeUtils.formatFromNow(order.createdDate)}
                                                    </span>
                                                </div>
                                                <div className="total-status">
                                                    <p>
                                                        {CurrencyUtils.formatMoneyByCurrency(
                                                            order.total,
                                                            CurrencyUtils.getLocalStorageSymbol()
                                                        )}
                                                    </p>
                                                    <span>
                                                          {
                                                              order.orderType === 'PRODUCT' &&
                                                              <GSOrderStatusTag status={order.status}
                                                                                text={i18next.t(`page.order.detail.information.orderStatus.${order.status}`)} />
                                                          }

                                                        {
                                                            order.orderType === 'BOOKING' &&
                                                            <GSOrderStatusTag status={order.status}
                                                                              text={i18next.t(`page.order.detail.information.reservationStatus.${order.status}`)} />
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    stOrderList?.total >= 4 &&
                                    <div onClick={handleOpenOrderFacebook}
                                         className="view-more-zalo w-100 d-flex justify-content-center">{i18next.t('common.btn.viewmore')}</div>
                                }
                            </div>

                        </div>
                        <div className="card">
                            <div ref={refClickIsOpenNote} className={state.zaloUserId ? "card-header cursor--pointer" : "card-header"} onClick={handleIsOpenNote}
                                 data-toggle={state.zaloUserId && state.profileId && Object.keys(state.address).length != 0 && "collapse"}
                                 href={state.zaloUserId && state.profileId && Object.keys(state.address).length != 0 && "#collapseThree"}
                            >
                                <div className="box_card">
                                    <img src="/assets/images/icon_note_fb.png" alt='' />
                                    <a  className="card-link" data-toggle="collapse" href="#collapseThree">
                                        <Trans
                                            i18nKey="page.transfer.stock.list.note" />{stNoteList?.totalCount > 0 && `(${stNoteList?.totalCount})`}
                                    </a>
                                </div>
                                {
                                    state.zaloUserId &&
                                    <>
                                        <i
                                            src="/assets/images/icon_accordion_fb.png"></i>
                                        <img className="cursor--pointer hover-add" src="/assets/images/icon_accordion_fb.png" alt='' />
                                    </>
                                }
                            </div>
                            {!stIsOpenNote &&
                            <div className="box_card zalo-info-note">
                                {
                                    stNoteList?.data?.map((itemNote) => {
                                        return (
                                            <div key={itemNote.id} className="zalo-info-note-list">

                                                {stIsEditNote != itemNote.id &&
                                                <>
                                                    <p>{itemNote.note}</p>
                                                    <div className="d-flex justify-content-between">
                                                        <div className="article-meta">
                                                    <span className="article-author">
                                                        {itemNote.staffName === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : itemNote.staffName}
                                                    </span>
                                                            <span className="article-publish pl-3">
                                                        {moment(itemNote.createdDate).format('HH:mm')}
                                                                |
                                                                {moment(itemNote.createdDate).format('DD/MM/YYYY')}
                                                    </span>
                                                        </div>
                                                        <div className="actions btn-group__action">
                                                            <i onClick={() => setStIsEditNote(itemNote.id)}
                                                               className="action-button first-button"></i>
                                                            <i onClick={() => handleDeleteNote(itemNote.id, itemNote.profileId)}
                                                               className="action-button lastest-button"></i>
                                                        </div>
                                                    </div>
                                                </>
                                                }

                                                {stIsEditNote == itemNote.id &&
                                                <>
                                                    <AvForm onValidSubmit={handleValidSubmitEditNote}
                                                            autoComplete="off">
                                                        <div className="pl-2 pr-2 w-100">
                                                            <AvField
                                                                className="d-none"
                                                                name={'createdDate'}
                                                                value={new Date()}
                                                            />
                                                            <AvField
                                                                className="d-none"
                                                                name={'id'}
                                                                value={itemNote.id}
                                                            />
                                                            <AvField
                                                                className="d-none"
                                                                name={'profileId'}
                                                                value={itemNote.profileId}
                                                            />
                                                            <AvField
                                                                className="d-none"
                                                                name={'storeId'}
                                                                value={itemNote.storeId}
                                                            />
                                                            <AvField
                                                                name={'note'}
                                                                type={'textarea'}
                                                                validate={{
                                                                    ...FormValidate.required(),
                                                                    ...FormValidate.maxLength(300, true)
                                                                }}
                                                                value={itemNote.note}
                                                            />
                                                        </div>
                                                        <div className={'d-flex justify-content-end mb-2'}>
                                                            <GSButton default buttonType="button"
                                                                    onClick={e => {
                                                                        e.preventDefault()
                                                                        setStIsEditNote(null)
                                                                    }}
                                                                    >
                                                                <GSTrans t={'common.btn.cancel'} />
                                                            </GSButton>
                                                            <GSButton marginLeft success>
                                                                <GSTrans t={'common.btn.save'} />
                                                            </GSButton>
                                                        </div>
                                                    </AvForm>
                                                </>
                                                }


                                            </div>
                                        )
                                    })
                                }
                                {
                                    stNoteList?.totalCount >= 3 &&
                                    <div onClick={handleOpenNoteFacebook}
                                         className="view-more-zalo w-100 d-flex justify-content-center">{i18next.t('common.btn.viewmore')}</div>
                                }

                            </div>
                            }

                            {state.zaloUserId &&
                                <div id="collapseThree" className="collapse" data-parent="#accordion">
                                    <div className="card-body">
                                        <AvForm onValidSubmit={handleValidSubmitNote} autoComplete="off">
                                            <div className="pl-2 pr-2 w-100">
                                                <AvField
                                                    name={'note'}
                                                    type={'textarea'}
                                                    validate={{
                                                        ...FormValidate.required(),
                                                        ...FormValidate.maxLength(300, true)
                                                    }}
                                                    onChange={e => handleChangeNoteSeller(e)}
                                                    value={state.noteSeller}
                                                />
                                            </div>
                                            { stErroNote &&
                                            <p className="errorNote">{i18next.t("page.gosocial.error.note")}</p>
                                            }
                                            <div className={'d-flex justify-content-end mb-2'}>
                                                <GSButton default buttonType="button" data-toggle="collapse"
                                                        href="#collapseThree"
                                                        onClick={e => {
                                                            e.preventDefault()
                                                            handleIsOpenNote()
                                                        }}
                                                        >
                                                    <GSTrans t={'common.btn.cancel'} />
                                                </GSButton>
                                                <GSButton marginLeft success>
                                                    <GSTrans t={'common.btn.save'} />
                                                </GSButton>
                                            </div>
                                        </AvForm>
                                    </div>
                                </div>
                            }
                        </div>
                    </>
                    }

                    {
                        stShowOrder &&
                        <>
                            <div className="card">
                                <div className="card-header">
                                    <div className="box_card">
                                        <img src="/assets/images/icon_location_fb.png" alt='' />
                                        <a className="card-link">
                                            <Trans i18nKey="page.customers.edit.address" />
                                        </a>
                                    </div>
                                    {
                                        Object.keys(state.address).length === 0 &&
                                        <img src="/assets/images/icon_accordion_fb.png" className="cursor--pointer"
                                            onClick={handleOpenAddress}
                                            alt=''
                                        />
                                    }
                                    {
                                        Object.keys(state.address).length > 0 &&
                                        <img src="/assets/images/icon_edit_fb.png" className="cursor--pointer"
                                            onClick={handleOpenAddress}
                                            alt=''
                                        />
                                    }
                                </div>

                                {stErrorAddress &&
                                <p className="error-address ml-4"
                                   style={{ color: '#DA1919', fontSize: '12px' }}
                                >{i18next.t('page.gosocial.note.error')}</p>
                                }

                                {state.address?.address && state.profileId &&
                                <p className="error-address ml-4"
                                   style={{ color: '#000000', fontSize: '13px' }}
                                >{state.address.address}
                                </p>
                                }


                            </div>
                            <div className="card">
                                <div className="card-header flex-column">
                                    <div className="box_card float-left w-100 pb-2">
                                        <img src="/assets/images/icon_note_fb.png" alt='' />
                                        <a className="card-link" href="#collapseThree">
                                            <Trans i18nKey="page.transfer.stock.list.note" />
                                        </a>
                                    </div>
                                    <textarea className="form-control" rows="2" name="note" maxLength={500}
                                              onChange={e => handleChangeNote(e.target.value)}
                                              defaultValue={state.note}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header flex-column">
                                    <div className="box_card float-left w-100 mb-2">
                                        <img src="/assets/images/PaymentMethod.svg" alt='' />
                                        <span className="card-link">
                                            <Trans i18nKey="page.orderList.orderDetail.modalPayment.method" />
                                        </span>
                                    </div>
                                    <select className="form-control select" id="paymentMethod" name="paymentMethod"
                                            value={state.paymentMethod}
                                            onChange={e => handleChangePayment(e)}
                                    >
                                        {
                                            PAYMENT_METHOD.map((payment, index) => {
                                                return (
                                                    <option
                                                        disabled={state.paymentType === PAYMENT_RADIO.PAY_IN_ADVANCE && index == 0}
                                                        value={payment.value}>{payment.label}</option>
                                                )
                                            })
                                        }
                                    </select>

                                    <div className="d-flex float-left w-100 mt-4">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio"
                                                   name={PAYMENT_RADIO.PAY_IN_ADVANCE}
                                                   id={PAYMENT_RADIO.PAY_IN_ADVANCE}
                                                   value={PAYMENT_RADIO.PAY_IN_ADVANCE}
                                                   onChange={e => handlePayInAdvance(e)}
                                                   checked={state.paymentType == PAYMENT_RADIO.PAY_IN_ADVANCE}
                                            />
                                            <label className="form-check-label" htmlFor="exampleRadios1">
                                                {i18next.t('page.gochat.facebook.conversations.PayInAdvance')}
                                            </label>

                                            <div className="form-check-tooltip">
                                                <GSComponentTooltip
                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                    interactive
                                                    style={{
                                                        display: 'inline'
                                                    }}
                                                    html={

                                                        <GSTrans
                                                            i18nKey={'page.gochat.facebook.conversations.PayInAdvance.tooltip'} />
                                                    }>
                                                    <span>!</span>
                                                </GSComponentTooltip>
                                            </div>
                                        </div>
                                        <div className="form-check ml-5">
                                            <input className="form-check-input" type="radio"
                                                   name={PAYMENT_RADIO.PAY_IN_ADVANCE}
                                                   id={PAYMENT_RADIO.PAY_IN_ADVANCE}
                                                   value={PAYMENT_RADIO.COD}
                                                   checked={state.paymentType == PAYMENT_RADIO.COD}
                                                   onChange={e => handlePayInAdvance(e)}
                                            />
                                            <label className="form-check-label" htmlFor="exampleRadios2">
                                                {i18next.t('page.gochat.facebook.conversations.PayLater')}
                                            </label>

                                            <div className="form-check-tooltip">
                                                <GSComponentTooltip
                                                    placement={GSComponentTooltipPlacement.BOTTOM}
                                                    interactive
                                                    style={{
                                                        display: 'inline'
                                                    }}
                                                    html={

                                                        <GSTrans
                                                            i18nKey={'page.gochat.facebook.conversations.PayLater.tooltip'} />
                                                    }>
                                                    <span>!</span>
                                                </GSComponentTooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header flex-column">
                                    <div className="box_card float-left w-100 pb-2">
                                        <img src="/assets/images/ShippingMethod.svg" alt="" />
                                        <a className="card-link" href="#collapseThree">
                                            <Trans i18nKey="page.gochat.facebook.conversations.ShippingMethod" />
                                        </a>
                                    </div>
                                    {/* ADD THIRD_PARTY SHIPPING */}
                                    <div className="w-100 custom-dropdown">
                                        <div
                                            className='dropdown-selected'
                                            onClick = {() => handleFetchShippingMethod()}
                                        >
                                            {stShippingMethodSelected.providerName ? i18next.t(`page.shipping.method.${stShippingMethodSelected.providerName}`):i18next.t("page.setting.shippingAndPayment.selfDelivery")}
                                        </div>
                                        {
                                            isEnabledShippingMethod && <div className="dropdown-list" ref={refOutsideClick}>
                                                <div
                                                    className='dropdown-item cursor--pointer'
                                                    onClick = {() => handleChangeShippingMethod(SHIPPING_DEFAULT_METHOD)}

                                                >
                                                    {i18next.t("page.setting.shippingAndPayment.selfDelivery")}
                                                </div>
                                                {isLoadingCalcShipping && <div className='dropdown-item text-center'>
                                                    <span className="spinner-border spinner-border-sm" role="status" hidden={!isLoadingCalcShipping}></span>
                                                </div>}
                                                {stShippingMethodList?.map((shipping, inx) => {
                                                        return(
                                                            <div
                                                                className='dropdown-item cursor--pointer'
                                                                key={inx}
                                                                value={shipping.providerName}
                                                                onClick = {() => handleChangeShippingMethod(shipping)}
                                                            >
                                                                {i18next.t(`page.shipping.method.${shipping.providerName}`)}
                                                            </div>
                                                        )
                                                    })
                                                }
                                        </div>
                                        }
                                    </div>
                                    {stShippingMethodSelected && (
                                        <div className='box_card float-left w-100 mt-3 d-flex flex-column text-medium'>
                                            {stShippingMethodSelected.data?.map((item, idx) => {
                                                return (
                                                    <div key={idx} className="row w-100">
                                                        <div className="form-check col-8">
                                                            <input className="form-check-input" type="radio"
                                                                name={i18next.t(`shipping-item-${item.deliveryService?.providerName}`)}
                                                                id={item.deliveryService?.id}
                                                                value={item.deliveryService?.id}
                                                                onChange={e => handleChangeShippingCodeSelected(e, item.fee)}
                                                                checked={stShippingCodeSelected == item.deliveryService?.id}
                                                            />
                                                            <label className="form-check-label" htmlFor={`${item.deliveryService?.id}`}>
                                                                {i18next.t(`page.shipping.method.${item.deliveryService?.providerName}`)} {item.deliveryService?.deliveryTime} {i18next.t(`page.shipping.method.deliveryTimeUnit.${item.deliveryService?.deliveryTimeUnit}`)}
                                                            </label>
                                                        </div>
                                                        <p className="col-4 text-right text-danger font-weight-500 pr-0">
                                                            {CurrencyUtils.formatMoneyByCurrency(item.fee, CurrencyUtils.getLocalStorageSymbol())}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    }
                </div>
                <div className="create_order d-flex align-items-end">
                    {
                        stShowOrder ?
                            <>
                                <GSButton className="text-uppercase" secondary outline onClick={handleCancelOrder}>
                                    <Trans i18nKey="common.btn.cancel">
                                        Cancel
                                    </Trans>
                                </GSButton>

                                <GSButton success
                                          className="text-uppercase w-100 mt-2 ml-2"
                                          onClick={handleCreateOrder}
                                          disabled={!isEnabled}
                                >
                                    <GSTrans t="page.gochat.facebook.conversations.CreateOrder" />
                                </GSButton>
                            </>
                            :
                            <GSButton success
                                      size="large"
                                      className="text-uppercase w-100 mt-2 order-pos__btn-create-order"
                                      onClick={handleOpenOrder}
                                      disabled={state.zaloUserId ? false : true}

                            >
                                <GSTrans t="page.gochat.facebook.conversations.CreateOrder" />
                            </GSButton>
                    }

                </div>
            </>
        )
    }

    const renderAddress = () => {
        return (
            <>
                {state.zaloUserId && <PinCustomer socialUserId={state.zaloUserId}
                                                  customerProfileId={state.profileId}
                                                  type={Constants.GO_CHAT_TYPE.ZALO}
                                                  callback={getPinCustomerProfile}
                                                  preFillData={stZaloUserProfile}
                                                  removeProfileId={handleRemoveProfileId}
                />
                }
            </>
        )
    }

    const renderOrderZalo = () => {
        return (
            <OrderListGosocial
                callback={getOrderZalo}
                userId={state.user.userId}
            />
        )
    }

    const renderNoteZalo = () => {
        return (
            <NoteZalo
                callback={getNoteZalo}
                profileId={state.profileId}
            />
        )
    }

    const renderOptionShow = () => {
        switch (stOptionShow) {
            case OPTION_SHOW.INFO:
                return renderInfo()
            case OPTION_SHOW.ADDRESS:
                return renderAddress()
            case OPTION_SHOW.ORDER:
                return renderOrderZalo()
            case OPTION_SHOW.NOTE:
                return renderNoteZalo()
        }
    }

    const useOutsideClick = (ref, callback) => {
        const handleClick = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                callback();
            }
        };

        useEffect(() => {
            document.addEventListener("click", handleClick);

            return () => {
                document.removeEventListener("click", handleClick);
            };
        });
    };

    useOutsideClick(refOutsideClick, () => {
        if(isEnabledShippingMethod){
            setIsEnabledShippingMethod(false)
        }
    });

    return (
        <>
            <ZaloOrderSummaryPrinter
                ref={refOrderPrinter}
                printType={ZaloOrderSummaryPrinter.PRINT_TYPE.UPLOADED_URL}
                data={{
                    orderId: state.orderId,
                    sellerName: state.storeInfo.storeName,
                    sellerImage: state.storeInfo.storeImage,
                    buyerName: state.buyerInfo.contactName,
                    buyerPhone: state.buyerInfo.phoneNumber,
                    shippingAddress: [state.shippingInfo.address, state.shippingInfo.wardName, state.shippingInfo.districtName, state.shippingInfo.cityName].join(', '),
                    paymentMethod: state.paymentMethod,
                    note: state.note,
                    productList: state.productList.map(({name, modelName, price, quantity}) => ({
                        name,
                        modelName,
                        newPrice: price,
                        quantity
                    })),
                    subTotal: OrderInZaloContextService.calculateSubTotalPrice(state.productList),
                    vat: OrderInZaloContextService.calculateVAT(state.totalVATAmount),
                    discount: OrderInZaloContextService.calculateDiscountAmount(state.productList, state.discountInfo),
                    shipping: state.shippingInfo.amount,
                    total: OrderInZaloContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountInfo)
                }}
                onUploadedUrl={handleUploadedUrl}
            />
            {renderOptionShow()}
        </>
    )
}

ZaloInformation.defaultProps = {}

ZaloInformation.propTypes = {}

export default ZaloInformation
