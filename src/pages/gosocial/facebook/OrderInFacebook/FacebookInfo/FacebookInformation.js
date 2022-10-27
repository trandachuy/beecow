import React, {useContext, useEffect, useRef, useState} from 'react'
import {Trans} from 'react-i18next';
import GSButton from '../../../../../components/shared/GSButton/GSButton';
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans';
import './FacebookInformation.sass'
import GSComponentTooltip, {
    GSComponentTooltipPlacement
} from '../../../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import {OrderService} from '../../../../../services/OrderService';
import storage from '../../../../../services/storage';
import i18next from 'i18next';
import Constants from '../../../../../config/Constant';
import beehiveService from '../../../../../services/BeehiveService';
import BeehiveService from '../../../../../services/BeehiveService';
import {ImageUtils} from '../../../../../utils/image';
import {BCOrderService} from '../../../../../services/BCOrderService';
import {GSToast} from '../../../../../utils/gs-toast';
import PinCustomer from '../../../customer/PinCustomer';
import LoadingScreen from '../../../../../components/shared/LoadingScreen/LoadingScreen';
import facebookService from '../../../../../services/FacebookService';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {FormValidate} from '../../../../../config/form-validate';
import moment from 'moment';
import NoteFacebook from '../../../note/NoteFacebook';
import ConfirmModal, {ConfirmModalUtils} from '../../../../../components/shared/ConfirmModal/ConfirmModal';
import {CurrencyUtils} from '../../../../../utils/number-format';
import GSOrderStatusTag from '../../../../../components/shared/GSOrderStatusTag/GSOrderStatusTag';
import OrderListGosocial from '../../../order/OrderListGosocial';
import {NAV_PATH} from '../../../../../components/layout/navigation/Navigation';
import {GoSocialUtils} from '../../../GoSocialUtils';
import {DateTimeUtils} from '../../../../../utils/date-time';
import {LiveChatService} from '../../../../../services/LiveChatService';
import {CredentialUtils} from '../../../../../utils/credential';
import {ZipCodeUtils} from '../../../../../utils/zipcode';
import {FbMessengerContext} from '../../context/FbMessengerContext';
import {OrderInFacebookContextService} from '../../context/OrderInFacebookContextService';
import {AddressUtils} from '../../../../../utils/address-utils'

const PAYMENT_METHOD = [
    {
        value: Constants.ORDER_PAYMENT_METHOD_COD,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_COD),
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER),
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_ZALO,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_ZALO),
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_MOMO,
        label: i18next.t("page.order.detail.information.paymentMethod." + Constants.ORDER_PAYMENT_METHOD_MOMO),
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
    COD:'COD'
}

const OPTION_SHOW = {
    INFO: 'INFO',
    ADDRESS: 'ADDRESS',
    NOTE:'NOTE',
    ORDER:'ORDER'
}

const defaultDeliveryServiceId = 14

const FacebookInformation = props => {
    const refClickIsOpenNote = useRef();
    const refDeteleNoteModal = useRef()
    const refOutsideClick = useRef(null)

    const { state, dispatch } = useContext(FbMessengerContext.context);
    const [stShowOrder, setStShowOrder] = useState(false);
    const [stOptionShow, setStOptionShow] = useState(OPTION_SHOW.INFO);
    const [stErrorAddress, setStErrorAddress] = useState(false);
    const [stPaymentMethod, setStPaymentMethod] = useState(PAYMENT_METHOD[0].value);
    const [stPaymentRadio, setStPaymentRadio] = useState(PAYMENT_RADIO.COD);
    const [stAvatarObj, setStAvatarObj] = useState(null);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stNoteList, setStNoteList] = useState([]);
    const [stIsEditNote, setStIsEditNote] = useState(null);
    const [stIsOpenNote, setStIsOpenNote] = useState(false);
    const [stOrderList, setStOrderList] = useState([]);
    const [stFacebookUserList,setStFacebookUserList] = useState([]);
    const [stErroNote, setStErroNote] = useState(false);
    const [prefillData, setPrefillData]= useState({
        name: '',
        gender: ''
    });
    const [customerSummary, setCustomerSummary] = useState({})
    const [stShippingMethodSelected, setStShippingMethodSelected] = useState(SHIPPING_DEFAULT_METHOD)
    const [stShippingMethodList, setStShippingMethodList] = useState([])
    const [stShippingCodeSelected, setStShippingCodeSelected] = useState(defaultDeliveryServiceId)
    const [stFetchCalcShippingFee, setStFetchCalcShippingFee] = useState(false)
    const [isResetCalcShippingFee, setIsResetCalcShippingFee] = useState(false)
    const [isLoadingCalcShipping, setIsLoadingCalcShipping] = useState(false)
    const [isEnabledShippingMethod, setIsEnabledShippingMethod] = useState(false)

    useEffect(() => {
        if(props.closeOrder === false){
            setStShowOrder(props.closeOrder)
            setStOptionShow(OPTION_SHOW.INFO)
        }
    }, [props.closeOrder])

    useEffect(() => {
        getPinCustomerProfile()
        setStErrorAddress(false);
        if (state.currentConversation?.senders?.data[0]) {
            setPrefillData({
                name: state.currentConversation?.senders?.data[0]?.name,
                gender: state.currentConversation?.senders?.data[0]?.gender
            })
        } else {
            setPrefillData({
                name: '',
                gender: ''
            })
        }
    }, [props.customerProfile, state.fbUserId])

    useEffect(() => {
        getPinCustomerProfile();
    }, [])

    useEffect(() => {
        fetchCustomerSummary()
    }, [state.profileId])

    useEffect(() => {
        fetchNoteList(state.profileId,0,2)
    }, [state.profileId])

    useEffect(() => {
        fetchOrderList(state.user.userId,0,3)
    }, [state.user.userId])


    useEffect(() => {
        const index = stFacebookUserList.findIndex(userId => userId.fbUserId == state.fbUserId)
        if(index == -1){
            handleCancelOrder()
        }else {
            dispatch(FbMessengerContext.actions.setState(stFacebookUserList[index].state))
        }
    },[state.fbUserId])

    useEffect(() => {
        const data = {
            fbUserId: state.fbUserId,
            state: state,
        };
        let facebookUserList = [data, ...stFacebookUserList];
        const index = facebookUserList.findIndex(
            (userId) => userId.fbUserId == state.fbUserId
        );
        if (index != -1) {
            facebookUserList[index].state = state;
            setStFacebookUserList(facebookUserList);
        }
    }, [
        state.fbUserId,
        state.profileId,
        state.productList,
        state.note,
        state.shippingInfo,
        state.discountInfo,
        state.paymentMethod,
        state.paymentType,
        state.noteSeller,
        state.totalVATAmount,
    ])

    useEffect(() => {
        dispatch(FbMessengerContext.actions.setOpenOrder(stShowOrder));
        return () => {
        }
    }, [stShowOrder])

    useEffect(() => {
        if (
            !state.fbUserId ||
            !stShowOrder ||
            !state.profileId
        )
            return;
        if(isEnabledShippingMethod) setIsEnabledShippingMethod(false)
        if (stShippingCodeSelected !== defaultDeliveryServiceId || state.productList.length === 0) {
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

    const fetchNoteList = (profileId,page,size) => {
         if(profileId){
             facebookService.getAllNoteFb(profileId,page,size).then(noteList => {
                 setStNoteList(noteList)
             }).catch(() => {
                 setStNoteList([])
             })
         }else {
             setStNoteList([])
         }
    }

    const fetchOrderList = (buyerId,page,size) => {
        if(buyerId){
            BCOrderService.getCustomerOrderList(buyerId,
                page,
                size,
                undefined,
                "gosell",
                'lastModifiedDate,desc'
            )
                .then(result => {
                    setStOrderList(result)
                })
                .catch(()=>{
                    setStOrderList([])
                })
        }else {
            setStOrderList([])
        }

    }

    const sendFacebookOrderReceipt = async (order) => {
        const {
            orderInfo,
            customerInfo,
            billingInfo,
            shippingInfo,
            storeBranch,
            items
        } = order
        // about request body: https://developers.facebook.com/docs/messenger-platform/reference/templates/receipt

        const {address, wardName, districtName, cityName} = await AddressUtils.buildAddress(
            shippingInfo.address1,
            shippingInfo.district,
            shippingInfo.ward,
            shippingInfo.country, {
                langCode: CredentialUtils.getLangKey(),
                fullAddress: false
            })

        console.log(shippingInfo)

        let attachment = {
            type: 'template',
            payload: {
                template_type: 'receipt',
                recipient_name: 'receipt',
                order_number: `${orderInfo.orderId}`,
                currency: orderInfo.currency === 'đ'? 'VND':orderInfo.currency,
                payment_method: i18next.t(`page.order.detail.information.paymentMethod.${orderInfo.paymentMethod}`),
                order_url: '',
                timestamp: Math.round(Date.parse(orderInfo.createDate) / 1000),
                address: {
                    street_1: address + ', ' + wardName,
                    city: shippingInfo.countryCode === Constants.CountryCode.VIETNAM ?  districtName : shippingInfo.outSideCity,
                    postal_code:shippingInfo.countryCode === Constants.CountryCode.VIETNAM ?
                        ZipCodeUtils.getByGosellCityCode(shippingInfo.country) : shippingInfo.zipCode,
                    state:shippingInfo.countryCode === Constants.CountryCode.VIETNAM ? cityName : shippingInfo.stateCode,
                    country: shippingInfo.country.substring(0, 2)
                },
                summary: {
                    subtotal: orderInfo.subTotal,
                    shipping_cost: orderInfo.shippingFee || 0,
                    total_tax: orderInfo.totalTaxAmount || 0,
                    total_cost: orderInfo.totalPrice
                },
                // item list
                elements: items.map(orderItem => {
                    return {
                        title: orderItem.name,
                        subtitle: orderItem.variationName || '',
                        quantity: orderItem.quantity,
                        price: orderItem.price,
                        currency: orderItem.currency === 'đ'? 'VND':orderItem.currency,
                        image_url: orderItem.imageUrl
                    }
                })
            }
        }

        // add discount
        if (getTotalDiscount() > 0) {
            attachment.payload.adjustments = [
                {
                    name: i18next.t('page.order.detail.items.discount'),
                    amount: getTotalDiscount()
                }
            ]
        }

        console.log('lalala')

        LiveChatService.sendMessageToUser(
            state.fbUserId, // recipient id
            'attachment',
            attachment,
            state.fbUserDetail.pageId // page id
        )
            .then(orderResponse => {
                dispatch(FbMessengerContext.actions.setNewOrderResponse(orderResponse))

                LiveChatService.markReadAConversation(state.currentConversation.fbConversationId, 1).then(res => {}).catch(error => {})

            })
            .catch()
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

        if (state.profileId === undefined || (state.address.address === "" || Object.keys(state.address).length === 0)){
            setStErrorAddress(true)
            return
        }
        let products = state.productList.filter(p => p.checked).map(pro =>
        {
            return {
                itemId: pro.itemId,
                modelId: pro.modelId || undefined,
                quantity: +(pro.quantity),
                langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
                branchId: props.storeBranch?.value
        } })

        setStIsFetching(true)

        const data = {
            branchId: props.storeBranch?.value,
            buyerId: state.user.userId ? state.user.userId : undefined,
            profileId: state.profileId ? state.profileId : undefined,
            paymentType:state.paymentType,
            guest: state.user? state.user.guest:undefined,
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
            deliveryServiceId: stShippingCodeSelected,
            directDiscount: getTotalDiscount(),
            langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
            note: state.note,
            paymentMethod: state.paymentMethod,
            platform: "WEB",
            receivedAmount: state.paymentType === PAYMENT_RADIO.COD ? 0 :  state.receivedAmount,
            selfDeliveryFee: state.shippingInfo.amount,
            storeId: +(storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
            weight: state.shippingInfo.weight,
            width: state.shippingInfo.width,
            length: state.shippingInfo.length,
            height: state.shippingInfo.height,
        }

        OrderService.checkoutGoSocial(data).then((orderRaw) => {
            GSToast.commonCreate();
            handleClearShippingMethod()
            BCOrderService.getOrderDetail(orderRaw.id).then(order => {
                dispatch(FbMessengerContext.actions.setUserId({
                    userId: +(order.customerInfo.userId),
                }));

                setStIsFetching(false)
                dispatch(FbMessengerContext.actions.resetOrder());
                handleOpenOrder()
                fetchOrderList(order.customerInfo.userId,0,3)

                // send receipt to facebook
                sendFacebookOrderReceipt(order)
                    .then()
            })
        }).catch(e=>{
            setStIsFetching(false)
            // remainingQuantity
            if (e.response.data && e.response.data.params && e.response.data.params.itemErrors && e.response.data.params.itemErrors.length > 0) {

                const deletedItemListFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.notFound' || res.message === 'error.item.deleted')
                const outStockProductFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.item.outOfStock');
                const quantityInvalidFromResponse = e.response.data.params.itemErrors.filter(res => res.message === 'error.order.orderItems.quantity.invalid');
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
                        dispatch(FbMessengerContext.actions.modifyProduct(item))
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

                    OrderInFacebookContextService.dispatchUpdateOutOfStockProduct(state, dispatch, outOfStockItemList, state.productList, products[0].branchId)
                    GSToast.error('page.order.create.complete.quantityModal.subTitle', true)
                    return
                }

                // check invalid
                if (quantityInvalidFromResponse.length > 0) {
                    GSToast.error('page.order.instorePurchase.productInvalidQuantity', true);
                    return;
                }

                // check insufficent stock
                if (insufficientStockFromResponse.length > 0) {
                    const insufficientGroup = insufficientStockFromResponse.map(i => i.params.itemModelIds)

                    dispatch(FbMessengerContext.actions.setInsufficientErrorGroup(insufficientGroup))
                    GSToast.error('page.order.instorePurchase.productInsufficientStock', true)
                    return
                }
                return
            }else {
                // if has change Deactivate -> check outstock
                if (e.response.data.message === "error.item.outOfStock") {
                    GSToast.error('page.order.create.complete.quantityModal.subTitle', true)
                    return
                }

                // check payment
                if (e.response.data.message === "error.order.updateDeliveryInfo.codNotAllowed") {
                    GSToast.error(i18next.t("common.api.failed"))
                    return
                }
            }
        }).finally(() => {
            setStIsFetching(false)

        })
    }

    const getTotalDiscount = () => {
        return OrderInFacebookContextService.calculateDiscountAmount(state.productList, state.discountInfo)
    }

    const handleOpenOrder = () => {
        setStShowOrder(show => !show)
        props.showOrder()
        handleCloseNote()
    }

    const handleCancelOrder = () => {
        dispatch(FbMessengerContext.actions.resetOrder());
        setStPaymentMethod(PAYMENT_METHOD[0].value)
        setStErrorAddress(false)
        setStPaymentRadio(PAYMENT_RADIO.COD)
    }

    const handleOpenAddress = () => {
        setStOptionShow(OPTION_SHOW.ADDRESS)
        setStErrorAddress(false)
        handleCloseNote()
    }

    const handleOpenNoteFacebook = () => {
        setStOptionShow(OPTION_SHOW.NOTE)
    }

    const handleOpenOrderFacebook = () => {
        setStOptionShow(OPTION_SHOW.ORDER)
    }

    const handleChangeNote = _.debounce(value => {
        dispatch(FbMessengerContext.actions.setNote(value))
    }, 300)

    const handleChangeNoteSeller = e => {
        dispatch(
            FbMessengerContext.actions.setNoteSeller(e.target.value)
        );
    }

    const handleChangePayment = e => {
        if(e.target.value !== PAYMENT_RADIO.COD  && stShippingCodeSelected !== defaultDeliveryServiceId) {
            GSToast.error('message.reset.shipping.option.due.to.shopping.cart.change', true)
            handleClearShippingMethod()
        }
        dispatch(
            FbMessengerContext.actions.setPaymentMethod(e.target.value)
        );
        setStPaymentMethod(e.target.value)
    }

    const handleRemoveProfileId = () => {
        dispatch(FbMessengerContext.actions.setProfileId(undefined));
    }

    const getPinCustomerProfile = () => {
        if (state.fbUserId && state.fbUserId !== '') {
            setStOptionShow(OPTION_SHOW.INFO);
            beehiveService.getCustomerProfilePinWithSocialUser(Constants.GO_CHAT_TYPE.FACEBOOK, state.fbUserId).then(full => {
                dispatch(FbMessengerContext.actions.setUser({
                    userId: full.userId,
                    name: full.fullName,
                    email: full.email,
                    phone: full.phone,
                    guest: full.guest
                }));
                dispatch(FbMessengerContext.actions.setProfileId(full.id));
                dispatch(FbMessengerContext.actions.setAddress(full.customerAddress));

                if (full.userId && full.userId !== 'undefined' && ([Constants.SaleChannels.BEECOW, Constants.SaleChannels.GOSELL, Constants.SaleChannels.GOMUA].includes(full.saleChannel))) {
                    BCOrderService.getCustomerAvatar(full.userId)
                        .then(result => {
                            setStAvatarObj(result)
                        })
                }
            }, () => {
                dispatch(FbMessengerContext.actions.setUser({
                    userId: undefined,
                    name: undefined,
                    email: undefined,
                    phone: undefined,
                    guest: false
                }));
                dispatch(FbMessengerContext.actions.setProfileId(undefined));
                dispatch(FbMessengerContext.actions.setAddress({}));
            })
        }
    }

    const getNoteFacebook = (callback) => {
        if(callback){
            setStOptionShow(OPTION_SHOW.INFO);
        }else {
            fetchNoteList(state.profileId,0,2)
        }
    }

    const getOrderFacebook = () => {
        setStOptionShow(OPTION_SHOW.INFO);
    }

    const handlePayInAdvance = (e) => {
        dispatch(FbMessengerContext.actions.setPaymentType(e.target.value))
        if (e.target.value === PAYMENT_RADIO.PAY_IN_ADVANCE &&
            stPaymentMethod === Constants.ORDER_PAYMENT_METHOD_COD) {
            dispatch(FbMessengerContext.actions.setPaymentMethod(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER))
        }
        if((e.target.value !== PAYMENT_RADIO.COD ||  stPaymentMethod !== Constants.ORDER_PAYMENT_METHOD_COD) && stShippingCodeSelected !== defaultDeliveryServiceId){
            handleClearShippingMethod()
            GSToast.error('message.reset.shipping.option.due.to.shopping.cart.change', true)
        }

    }

    const isEnabled = state.productList.filter(p => p.checked).length > 0

    const handleValidSubmitNote = (event, value) => {

        setStIsFetching(true)
        const dataNote = {
            profileId: state.profileId,
            storeId: +(storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)),
            note: value.note
        }

        facebookService.createNoteFb(dataNote)
            .then((note) => {
            dispatch(
                FbMessengerContext.actions.setNoteSeller("")
            );
            fetchNoteList(note.profileId,0,2)
            refClickIsOpenNote.current.click()
            GSToast.commonCreate()
        })
            .catch(error => {
                if (error.response.data.message === "error.maximum.note"){
                    setStErroNote(true)
                }
            }).finally(() => {
            setStIsFetching(false)
        })
    }

    const handleValidSubmitEditNote = (event, value) => {
        setStIsFetching(true)

        facebookService.updateNoteFb(value).then((note) => {
            fetchNoteList(note.profileId,0,2)
            setStIsEditNote(null)
            GSToast.commonUpdate()
        }).finally(() => {
            setStIsFetching(false)
        })
    }

    const handleDeleteNote = (id,profileId) => {
        ConfirmModalUtils.openModal(refDeteleNoteModal, {
            messages: <>
                <p className="">{i18next.t("gosocial.facebook.conversations.delete.modal.text")}</p>
            </>,
            modalTitle: i18next.t`common.txt.confirm.modal.title`,
            okCallback: () => {
                setStIsFetching(true)
                facebookService.deleteNoteFb(id)
                    .then(() => {
                        fetchNoteList(profileId,0,2)
                        setStIsEditNote(null)
                        GSToast.commonDelete()

                    }).finally(() => setStIsFetching(false))
            },
        })
    }

    const handleIsOpenNote = () => {
        if (state.profileId == undefined || (state.address == null || Object.keys(state.address).length === 0)){
            setStErrorAddress(true)
            return
        }
        setStErroNote(false)

        if(stIsOpenNote){
            setTimeout(()=> {
                setStIsOpenNote(isOpen=> !isOpen)
            },300)
        }else {
            setStIsOpenNote(isOpen=> !isOpen)
        }
    }

    const handleCloseNote = () => {
        setStIsOpenNote(false)
    }

    const onClickOrderRow = (orderId, orderType, channel) => {
        let url = NAV_PATH.orderDetail + `/${channel}/` + orderId
        let win = window.open(url, '_blank');
        win.focus();
    }

    const handleOpenDetailCustomer = () => {
        if (state.profileId && customerSummary.saleChannel) {
            window.open(NAV_PATH.customers.CUSTOMERS_EDIT + `/${state.profileId}/${state.user.userId}/${customerSummary.saleChannel}`)
        }
    }

    const handleClearShippingMethod = () => {
        setIsResetCalcShippingFee(true)
        // setIsLoadingCalcShipping(true)
        setStShippingMethodList([])
        setStShippingMethodSelected({})
        setStShippingCodeSelected(defaultDeliveryServiceId)
        dispatch(FbMessengerContext.actions.setShippingInfo({ amount: 0 }));
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
        let totalPrice = OrderInFacebookContextService.calculateSubTotalPrice(state.productList)
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
        if(state.paymentType === PAYMENT_RADIO.COD && stPaymentMethod === Constants.ORDER_PAYMENT_METHOD_COD ){
            if (state.profileId === undefined || (state.address.address === "" || Object.keys(state.address).length === 0)){
                setStErrorAddress(true)
                return
            }else if(state.productList.length ===  0){
                GSToast.error("page.gosocial.table.product.text", true);
            }
        }

        if(!state.profileId || !stShowOrder) return
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
        let codeSelected = defaultDeliveryServiceId
        let shippingMethodSelected = SHIPPING_DEFAULT_METHOD
        if( shipping.providerName !== 'SELF_DELIVERY'){
            let getShippingMethodSelected = stShippingMethodList.find(r => r.providerName === shipping.providerName)
            codeSelected = getShippingMethodSelected.data[0].deliveryService.id
            fee = getShippingMethodSelected.data[0].fee
            shippingMethodSelected = getShippingMethodSelected
        }
        setStShippingMethodSelected(shippingMethodSelected)
        setStShippingCodeSelected(codeSelected)
        dispatch(FbMessengerContext.actions.setShippingInfo({ amount: +(fee) }))
    }

    const handleChangeShippingCodeSelected  = (event, fee) => {
        if(!event) return
        setStShippingCodeSelected(event.target.value)
        if(!fee) return
        dispatch(FbMessengerContext.actions.setShippingInfo({ amount: +(fee) }))
    }

    const renderInfo = () => {
        return(
            <>
                {stIsFetching &&
                <LoadingScreen zIndex={9999}/>
                }
                <ConfirmModal ref={refDeteleNoteModal} modalClass={"delete-note-facebook-modal"}/>
                <div className='profile'>
                    <div className='mr-2 ml-2 d-flex align-items-center'>
                        <div className='profile_image'>
                            <div className={'textAvatar'}
                                 style={{
                                     backgroundImage: `url(${ImageUtils.getImageFromImageModel(stAvatarObj, 60)})`
                                 }}>
                                {!stAvatarObj && GoSocialUtils.renderAvatarName(state?.profileId ? state?.user.name : state?.fbUserName)}
                            </div>
                        </div>
                        <div className='profile_name'>
                            <div className='box_name show-profile mb-1' onClick={handleOpenDetailCustomer}>
                                <p className='name'>{state.profileId ? state.user.name : state.fbUserName}</p>
                            </div>
                            {state.profileId && <p className='number mb-1'>{state.user.phone}</p>}
                            {!state.profileId &&
                                <span className='type'>{i18next.t('common.btn.new')}</span>
                            }
                            {state.profileId && state.user.guest &&
                                <span className='type contact'>{i18next.t("page.livechat.customer.details.search.user_type.contact")}</span>
                            }
                            {state.profileId && !state.user.guest &&
                                <span className='type account'>{i18next.t("page.livechat.customer.details.search.user_type.member")}</span>
                            }
                            {state.profileId && customerSummary && customerSummary.debtAmount !== null && (
                                <div>
                                    <b>{i18next.t('page.customers.edit.debt.title')}: &nbsp;</b>
                                    <span className="color-blue">
                                        {CurrencyUtils.formatMoneyByCurrency(customerSummary.debtAmount,CurrencyUtils.getLocalStorageSymbol())}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {state.fbUserId &&
                        <div className='profile_edit mt-2 cursor--pointer'>
                            <img src="/assets/images/icon_edit_fb.png" onClick={() => handleOpenAddress()} alt=''/>
                        </div>
                    }
                </div>
                <div id="accordion">
                    {!stShowOrder &&
                    <>
                        <div className="card">
                            <div className={state.fbUserId ? "card-header cursor--pointer" : "card-header"} onClick={state.fbUserId ? handleOpenAddress : undefined}>
                                <div className='box_card'>
                                    <img src="/assets/images/icon_location_fb.png" alt=''/>
                                    <a className="card-link">
                                        <Trans i18nKey="page.customers.edit.address"/>
                                    </a>
                                </div>
                                {state.fbUserId &&
                                    <img src="/assets/images/icon_accordion_fb.png" className="hover-add" alt=''/>
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
                                state.fbUserId ? "card-header cursor--pointer" : "card-header"}
                                 onClick={state.fbUserId && stOrderList.length === 0 ? handleOpenOrder : stOrderList?.total >= 4 ? handleOpenOrderFacebook : undefined}>
                                <div className='box_card'>
                                    <img className="" src="/assets/images/icon_cart_fb.png" alt='' />
                                    <a className="card-link" >
                                        <Trans i18nKey="progress.bar.step.newOrder"/>{stOrderList?.total > 0 && `(${stOrderList?.total})`}
                                    </a>
                                </div>
                                {state.fbUserId &&
                                <img className="hover-add" src="/assets/images/icon_accordion_fb.png" alt=''/>
                                }
                            </div>

                            <div className='box_card facebook-info-order'>
                                {
                                    stOrderList?.data?.map(order => {
                                        return(
                                            <div className="d-flex justify-content-between align-items-center mb-2" key={order.id}>
                                                <div className="id-time">
                                                    <p className="cursor--pointer" onClick={() => onClickOrderRow(order.id, order.orderType, order.channel)}>{order.id}</p>
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
                                                                            text={i18next.t(`page.order.detail.information.orderStatus.${order.status}`)}/>
                                                        }
                                                        {
                                                            order.orderType === 'BOOKING' &&
                                                            <GSOrderStatusTag status={order.status}
                                                                              text={i18next.t(`page.order.detail.information.reservationStatus.${order.status}`)}/>
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    stOrderList?.total >= 4 &&
                                    <div onClick={handleOpenOrderFacebook} className="view-more-facebook w-100 d-flex justify-content-center">{i18next.t('common.btn.viewmore')}</div>
                                }
                            </div>
                        </div>
                        <div className="card">
                            <div className={state.fbUserId ? "card-header cursor--pointer" : "card-header"}
                                 ref={refClickIsOpenNote} onClick={handleIsOpenNote}
                                 data-toggle={state.fbUserId && state.profileId && Object.keys(state.address).length != 0 && "collapse"}
                                 href={(state.fbUserId && state.profileId && Object.keys(state.address).length != 0) ? "#collapseThree" : undefined}>
                                <div className='box_card'>
                                    <img  src="/assets/images/icon_note_fb.png" alt=''/>
                                    <a className="card-link">
                                        <Trans i18nKey="page.transfer.stock.list.note"/>{stNoteList?.totalCount > 0 && `(${stNoteList?.totalCount})`}
                                    </a>
                                </div>
                                {state.fbUserId &&
                                <>
                                    <i src="/assets/images/icon_accordion_fb.png" ></i>
                                    <img className="hover-add" src="/assets/images/icon_accordion_fb.png" alt=''/>
                                </>
                                }
                            </div>
                            {!stIsOpenNote &&
                            <div className='box_card facebook-info-note'>
                                {
                                    stNoteList?.data?.map((itemNote) => {
                                        return(
                                            <div key={itemNote.id} className="facebook-info-note-list">

                                                {stIsEditNote !== itemNote.id &&
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
                                                        <div className='actions btn-group__action'>
                                                            <i onClick={() => setStIsEditNote(itemNote.id)} className="action-button first-button"></i>
                                                            <i onClick={() => handleDeleteNote(itemNote.id,itemNote.profileId)} className="action-button lastest-button"></i>
                                                        </div>
                                                    </div>
                                                </>
                                                }
                                                { stIsEditNote == itemNote.id &&
                                                <>
                                                    <AvForm onValidSubmit={handleValidSubmitEditNote} autoComplete="off">
                                                        <div className="pl-2 pr-2 w-100">
                                                            <AvField
                                                                className="d-none"
                                                                name={"id"}
                                                                value={itemNote.id}
                                                            />
                                                            <AvField
                                                                className="d-none"
                                                                name={"profileId"}
                                                                value={itemNote.profileId}
                                                            />
                                                            <AvField
                                                                className="d-none"
                                                                name={"storeId"}
                                                                value={itemNote.storeId}
                                                            />
                                                            <AvField
                                                                name={"note"}
                                                                type={"textarea"}
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
                                                                    }
                                                                    }>
                                                                <GSTrans t={"common.btn.cancel"}/>
                                                            </GSButton>
                                                            <GSButton marginLeft success>
                                                                <GSTrans t={"common.btn.save"}/>
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
                                    <div onClick={handleOpenNoteFacebook} className="view-more-facebook w-100 d-flex justify-content-center">{i18next.t('common.btn.viewmore')}</div>
                                }
                            </div>
                            }
                            {state.fbUserId &&
                                <div id="collapseThree" className="collapse" data-parent="#accordion">
                                    <div className="card-body">
                                        <AvForm onValidSubmit={handleValidSubmitNote} autoComplete="off">
                                            <div className="pl-2 pr-2 w-100">
                                                <AvField
                                                    name={"note"}
                                                    type={"textarea"}
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
                                                <GSButton default buttonType="button" data-toggle="collapse" href="#collapseThree"
                                                        onClick={e =>
                                                            {
                                                                e.preventDefault()
                                                                handleIsOpenNote()
                                                            }
                                                        }>
                                                    <GSTrans t={"common.btn.cancel"}/>
                                                </GSButton>
                                                <GSButton marginLeft success>
                                                    <GSTrans t={"common.btn.save"}/>
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
                                    <div className='box_card'>
                                        <img src="/assets/images/icon_location_fb.png" alt="" />
                                        <a className="card-link">
                                            <Trans i18nKey="page.customers.edit.address"/>
                                        </a>
                                    </div>
                                    {
                                        Object.keys(state.address).length === 0 &&
                                        <img src="/assets/images/icon_accordion_fb.png" className="cursor--pointer"
                                            onClick={handleOpenAddress}
                                            alt=""
                                        />
                                    }
                                    {
                                        Object.keys(state.address).length > 0 &&
                                        <img src="/assets/images/icon_edit_fb.png" className="cursor--pointer"
                                            onClick={handleOpenAddress}
                                            alt=""
                                        />
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
                                <div className="card-header flex-column">
                                    <div className='box_card float-left w-100 pb-2'>
                                        <img src="/assets/images/icon_note_fb.png" alt=''/>
                                        <a className="card-link" href="#collapseThree">
                                            <Trans i18nKey="page.transfer.stock.list.note"/>
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
                                    <div className='box_card float-left w-100 mb-2'>
                                        <img src="/assets/images/PaymentMethod.svg" alt=''/>
                                        <span className="card-link">
                                            <Trans i18nKey="page.orderList.orderDetail.modalPayment.method"/>
                                        </span>
                                    </div>
                                    <select className="form-control select" id="paymentMethod" name="paymentMethod"
                                            value={state.paymentMethod}
                                            onChange={e => handleChangePayment(e)}
                                    >
                                        {
                                            PAYMENT_METHOD.map((payment,index) => {
                                                return(
                                                    <option
                                                        key={payment.value}
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

                                                        <GSTrans i18nKey={'page.gochat.facebook.conversations.PayInAdvance.tooltip'}/>
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
                                                        <GSTrans i18nKey={'page.gochat.facebook.conversations.PayLater.tooltip'} />
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
                                    <div className='box_card float-left w-100 pb-2'>
                                        <img src="/assets/images/ShippingMethod.svg" alt=""/>
                                        <span className="card-link">
                                            <Trans i18nKey="page.gochat.facebook.conversations.ShippingMethod"/>
                                        </span>
                                    </div>
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
                                                    onClick={() => handleChangeShippingMethod(SHIPPING_DEFAULT_METHOD)}
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
                                                                onClick={() => handleChangeShippingMethod(shipping)}
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
                <div className='create_order d-flex align-items-end'>
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
                                      className="text-uppercase w-100 order-pos__btn-create-order"
                                      onClick={handleOpenOrder}
                                      disabled={state.fbUserId ? false : true}
                        >
                            <GSTrans t="page.gochat.facebook.conversations.CreateOrder" />
                        </GSButton>
                    }

                </div>
            </>
        )
    }

    const renderAddress = () => {
        return(
            <>
                {state.fbUserId && <PinCustomer socialUserId={state.fbUserId}
                                                customerProfileId={state.profileId}
                                                type={Constants.GO_CHAT_TYPE.FACEBOOK}
                                                callback={getPinCustomerProfile}
                                                preFillData={prefillData}
                                                removeProfileId={handleRemoveProfileId}
                />
                }
            </>
        )
    }

    const renderNoteFacebook = () => {
        return(
            <NoteFacebook
                callback={getNoteFacebook}
                profileId={state.profileId}
            />
        )
    }

    const renderOrderFacebook = () => {
        return(
            <OrderListGosocial
                callback={getOrderFacebook}
                userId={state.user.userId}
            />
        )
    }

    const renderOptionShow = () => {
        switch(stOptionShow) {
            case OPTION_SHOW.INFO:   return renderInfo();
            case OPTION_SHOW.ADDRESS:   return renderAddress();
            case OPTION_SHOW.NOTE:   return renderNoteFacebook();
            case OPTION_SHOW.ORDER:   return renderOrderFacebook();
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
            {renderOptionShow()}
        </>
    )
}

FacebookInformation.defaultProps = {}

FacebookInformation.propTypes = {}

export default FacebookInformation
