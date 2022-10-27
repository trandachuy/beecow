import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import {Label, Modal} from 'reactstrap';
import ModalHeader from 'reactstrap/es/ModalHeader';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {UikCheckbox, UikWidgetTable} from '../../../../@uik';
import {METHOD, OrderInStorePurchaseContext} from '../context/OrderInStorePurchaseContext';
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format';
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency';
import {CurrencySymbol} from '../../../../components/shared/form/CryStrapInput/CryStrapInput';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {FormValidate} from '../../../../config/form-validate';
import './OrderInStorePurchaseComplete.sass';
import {ItemService} from '../../../../services/ItemService';
import {OrderService} from '../../../../services/OrderService';
import {GSToast} from '../../../../utils/gs-toast';
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen';
import {OrderInStorePurchaseContextService} from '../context/OrderInStorePurchaseContextService';
import storage from '../../../../services/storage';
import Constants from '../../../../config/Constant';
import {RouteUtils} from '../../../../utils/route';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import AlertModal, {AlertModalType} from '../../../../components/shared/AlertModal/AlertModal';
import GSComponentTooltip, {GSComponentTooltipPlacement} from '../../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import i18next from '../../../../config/i18n';
import storeService from '../../../../services/StoreService';
import catalogService from '../../../../services/CatalogService';
import {cancelablePromise} from '../../../../utils/promise';
import {CouponTypeEnum} from '../../../../models/CouponTypeEnum';
import beehiveService from '../../../../services/BeehiveService';
import OrderInStorePoint from './point/OrderInStorePoint';
import {ItemUtils} from '../../../../utils/item-utils';
import NumberFormat from 'react-number-format';
import OrderInstoreDiscount from './discount/OrderInstoreDiscount';
import Shipping from './../shipping/Shipping';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {OrderInStorePurchaseRecoil} from '../recoil/OrderInStorePurchaseRecoil';
import accountService from '../../../../services/AccountService';
import {CredentialUtils} from '../../../../utils/credential';
import {BCOrderService} from '../../../../services/BCOrderService';
import storageService from '../../../../services/storage';
import Printer from '../../orderPrint/template/Printer'
import OrderA4HTML from '../../orderPrint/template/OrderA4HTML'
import OrderA4Template from '../../orderPrint/template/OrderA4Template';
import OrderKPosHTML from '../../orderPrint/template/OrderKPosHTML'
import OrderKPosTemplate from '../../orderPrint/template/OrderKPosTemplate'
import moment from 'moment';
import {AddressUtils} from '../../../../utils/address-utils'
import GSSelectPrintSizeModal from '../../../../components/shared/GSSelectPrintSizeModal/GSSelectPrintSizeModal'
import {TokenUtils} from '../../../../utils/token'
import {ROLES} from '../../../../config/user-roles'
import useDebounceEffect from '../../../../utils/hooks/useDebounceEffect'
import {formatNumber} from 'accounting-js'

export const KEY_PRINT_A4 = 'A4';
export const KEY_PRINT_K57 = 'K57';
export const KEY_PRINT_K80 = 'K80';

const STORE_SYMBOL_CODE = CredentialUtils.getStoreCurrencySymbol()

const OrderInStorePurchaseComplete = (props) => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const { state, dispatch } = useContext(OrderInStorePurchaseContext.context);
    const [stIsShowModal, setStIsShowModal] = useState(false);
    const refSubmitBtn = useRef(null);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stOutOfStockProductList, setStOutOfStockProductList] = useState([]);
    const [stIsShowCompletedModal, setStIsShowCompletedModal] = useState(false);
    const [stIsShowNotEnghtModal, setStIsShowNotEnghtModal] = useState(false);
    const [stCompletedOrder, setStCompletedOrder] = useState(null);
    const [stIsShowShippingModal, setStIsShowShippingModal] = useState(false);
    const [stApplyNotEnough, setStApplyNotEnough] = useState(false);
    const [stReceivedAmount, setStReceivedAmount] = useState(0);
    const [isTogglePrintSizeModal, setIsTogglePrintSizeModal] = useState(false);
    const [stPrintEnabled, setPrintEnabled] = useState(false);
    const [stCustomContent, setCustomContent] = useState([]);
    const [stSelectedLanguage, setSelectedLanguage] = useState('vi');
    const [stInformation, setInformation] = useState('');
    const [stPrintSize, setPrintSize] = useState(KEY_PRINT_K80);
    const refShowConfirm = useRef(null);
    const refPrintReceiptRef = useRef(null);
    const [stNameStaff, setStNameStaff] = useState()
    const loyaltySetting = useRecoilValue(OrderInStorePurchaseRecoil.loyaltySettingState)
    const storeBranch = useRecoilValue(OrderInStorePurchaseRecoil.storeBranchState)
    const deleteOrder = useSetRecoilState(OrderInStorePurchaseRecoil.deleteOrderSelector)
    const currentOrderIndex = useRecoilValue(OrderInStorePurchaseRecoil.currentOrderIndexState)
    const orderList = useRecoilValue(OrderInStorePurchaseRecoil.orderListState)
    const [posScannerState, setPosScannerState] = useRecoilState(OrderInStorePurchaseRecoil.posScannerState)

    useEffect(() => {
        getNameStaff();

        storeService.getStorefrontInfo(CredentialUtils.getStoreId())
            .then(storeInfo => {
                dispatch(OrderInStorePurchaseContext.actions.setStoreInfo({
                    customDomain: storeInfo.webFullUrl
                }))
            })
        handlePrintReceipt(CredentialUtils.getPrintSizeData(GSSelectPrintSizeModal.LOCAL_STORAGE_KEY.POS))
    }, []);

    useLayoutEffect(() => {
        setIsTogglePrintSizeModal(state.isShowModalPrint)
    }, [state.isShowModalPrint])

    useDebounceEffect(() => {
        if (!storeBranch?.value) {
            return
        }
        findPickUpAddress();
    }, 100, [storeBranch]);

    useEffect(() => {
        if (!CredentialUtils.getUserId()) {
            return
        }

        getNameStaff();
    }, [CredentialUtils.getUserId()])

    // total,payment change -> reset received amount
    useLayoutEffect(() => {
        const total = OrderInStorePurchaseContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountOption)
        let formatTotal = 0
        if (STORE_SYMBOL_CODE === 'đ') {
            formatTotal = total
        } else {
            formatTotal = NumberUtils.formatThousandFixed(total, 2)
        }
        dispatch(OrderInStorePurchaseContext.actions.setReceivedAmount(formatTotal))
    }, [state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.paymentMethod, state.discountOption]);

    const buildAddress = (address, wardCode, districtCode, cityCode, countryCode, optionalFields = {
        address2: '',
        city: '',
        zipCode: ''
    }) => {
        return AddressUtils.buildAddressWithCountry(address, districtCode, wardCode, cityCode, countryCode, {
            fullAddress: true
        }, optionalFields)
    }

    const findPickUpAddress = () => {
        const branchId = storeBranch.value

        storeService.getStoreBranchById(branchId)
            .then(branch => {
                return buildAddress(branch.address, branch.ward, branch.district, branch.city, branch.countryCode, {
                    address2: branch.address2,
                    city: branch.cityName,
                    zipCode: branch.zipCode
                })
                    .then(fullAddress => ({
                        ...branch,
                        fullAddress
                    }))
            })
            .then(({fullAddress, phoneNumberFirst}) => {
                dispatch(OrderInStorePurchaseContext.actions.setStoreInfo({
                    storeAddress: fullAddress,
                    storePhone: phoneNumberFirst
                }))
            })
    }

    const onClickCloseChangeStockModal = (e) => {
        // setStIsShowModal(false)
    }

    const isEnabled = state.productList.filter(p => p.checked).length > 0

    const onSubmitQuantityModal = (e, values) => {
        const buildRequest = (values) => {
            let productList = []
            for (const [productId, index] of Object.entries(values).filter(entry => !entry[0].includes('currentStock-'))) {
                const currentStock = values[`currentStock-${ productId }`]
                const [itemId, modelId] = productId.split('-')
                productList.push({
                    itemId,
                    modelId,
                    type: 'SET',
                    stock: values[productId],
                    currentStock: currentStock || 0,
                    branchId: storeBranch ? storeBranch.value : null,
                    actionType: 'FROM_UPDATE_AT_INSTORE_PURCHASE'
                })
            }
            return productList
        }
        setStIsSaving(true)
        const requestBody = buildRequest(values)
        ItemService.updateInStoreProductQuantity(requestBody)
            .then(result => {
                GSToast.commonUpdate()
                // setStIsShowModal(false)
            })
            .catch(e => {
                GSToast.commonError()
            })
            .finally(() => {
                setStIsSaving(false)
            })
    }

    const updateReceivedAmount = (event) => {
        let amount = parseFloat(event.floatValue)
        if (amount < 0) {
            amount = 0
        }
        if (state.paymentMethod !== Constants.ORDER_PAYMENT_METHOD_CASH) {
            const total = OrderInStorePurchaseContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountOption)
            if (amount > total) { // pay exceed purchased amount
                amount = total
                GSToast.warning('page.order.instorePurchase.errorExceedPurchaseAmount', true)
            }
        }
        dispatch(OrderInStorePurchaseContext.actions.setReceivedAmount(amount))

    }

    const calculateChangeAmount = () => {
        if (state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_CASH) {
            const total = CredentialUtils.getStoreCurrencySymbol() === Constants.CURRENCY.VND.SYMBOL ? getTotalPrice() :
                +(NumberUtils.formatThousandFixed(getTotalPrice(),2,true))
            const received = state.receivedAmount
            const changeAmount =CredentialUtils.getStoreCurrencySymbol() === Constants.CURRENCY.VND.SYMBOL ? 
                received - total : parseFloat(received - total).toFixed(2)
            return changeAmount > 0? changeAmount:0
        }
        return 0
    }

    const isInValid = () => {

        // error
        let errors = {}
        let hasError = false

        // check data required
        const shipping = state.shippingInfo
        const user = state.user
        const product = state.productList

        // check service id
        if (!shipping.serviceId) {
            errors.serviceId = true;
            hasError = true
        }

        // check required field
        if (shipping.method === 'DELIVERY') {
            // check when dilivery
            if (!user.name) {
                errors.name = true;
                hasError = true
            }

            if (!user.phone) {
                errors.phone = 'common.validation.required';
                hasError = true
            } else if (user.phone.length < 8 || user.phone.length > 15) {
                errors.phone = 'common.validation.invalid.phone';
                hasError = true
            } else if (!(/^[+\d](?:.*\d)?$/.test(user.phone))) {
                errors.phone = 'common.validation.invalid.phone';
                hasError = true
            } else {
                errors.phone = '';
            }

            if (!shipping.address) {
                errors.address = true;
                hasError = true
            }
            if (!shipping.city) {
                errors.city = true;
                hasError = true
            }
            if (!shipping.district) {
                errors.district = true;
                hasError = true
            }

            if (shipping.option === 'AUTO_FILL') {
                if (!shipping.length) {
                    errors.length = true;
                    hasError = true
                }
                if (!shipping.width) {
                    errors.width = true;
                    hasError = true
                }
                if (!shipping.height) {
                    errors.height = true;
                    hasError = true
                }
                if (!shipping.weight) {
                    errors.weight = true;
                    hasError = true
                }
            }
        }

        dispatch(OrderInStorePurchaseContext.actions.setErrors(errors))

        if (state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_MPOS && !state.mposCode) {
            hasError = true

            // show alert
            refShowConfirm.current.openModal({
                type: AlertModalType.ALERT_TYPE_DANGER,
                messages: i18next.t('page.order.create.complete.pos_confirm'),
                modalTitle: i18next.t('page.order.create.complete.pos_confirm_title'),
                closeCallback: () => {
                }
            })

            document.getElementById('instoreposcode').focus()
        }

        if (loyaltySetting.isUsePointEnabled && state.errorPointMessage !== '') {
            hasError = true;
        }

        return hasError;
    }

    const createOrder = () => {

        // validate the data here
        if (isInValid() && state.shippingInfo.countryCode === Constants.CountryCode.VIETNAM) {
            return;
        }

        let totalPrice = getTotalPrice();
        if (state.receivedAmount < totalPrice) {
            setStIsShowNotEnghtModal(true);
            return
        }

        // Validate if total amount has exceeded the limit
        if (totalPrice > Constants.VALIDATIONS.ORDER.MAX_TOTAL_AMOUNT) {
            GSToast.error(i18next.t('page.order.checkout.totalAmountExceeded', {
                totalAmount: totalPrice,
                maxTotalAmount: Constants.VALIDATIONS.ORDER.MAX_TOTAL_AMOUNT,
                currencySymbol: CredentialUtils.getStoreCurrencySymbol()
            }));
            return;
        }

        const shipping = state.shippingInfo
        // need user info to delivery
        if (shipping.method === 'DELIVERY') {
            if (!state.buyerId && !state.user.name) {
                refShowConfirm.current.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: (<GSTrans t="page.order.create.complete.user_confirm">
                        Missing customer information.<br/>Customer information is required for shipping. Please select
                        "Guest checkout" or "Add customer" to complete this order.
                    </GSTrans>),
                    closeCallback: () => {
                    }
                })
                return;
            }
        }

        // valid case
        createOrderMain()
    }

    const setNote = (e, value) => {
        dispatch(OrderInStorePurchaseContext.actions.setNote(e.target.value))
    }

    const onClickGoToDetail = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.orderDetail + `/gosell/${ stCompletedOrder.orderInfo.orderId }`)
    }

    const onClickStayHere = () => {
        dispatch(OrderInStorePurchaseContext.actions.reset())
        setStIsShowCompletedModal(false)
    }

    const updateCustomerBranch = async (branchId, customerId) => {
        await beehiveService.updateCustomerBranch(branchId, customerId);
    }

    const createOrderMain = () => {
        // in case everything is ok
        const shippingInfo = state.shippingInfo
        const user = state.user
        let products = state.productList.filter(p => p.checked).map(pro => {
            return { itemId: pro.itemId, modelId: pro.modelId, quantity: pro.quantity, imeiSerial: pro.imeiSerial }
        })
        let selfDeliveryFeeDiscount = null;
        let couponType = state.promotion?.couponType
        if (shippingInfo && shippingInfo.method !== METHOD.IN_STORE && state.promotion && state.promotion.couponType === CouponTypeEnum.FREE_SHIPPING) {
            if (state.promotion.feeShippingValue && parseInt(state.promotion.feeShippingValue) <= shippingInfo.selfDeliveryFee) {
                selfDeliveryFeeDiscount = parseInt(state.promotion.feeShippingValue);
            } else {
                selfDeliveryFeeDiscount = shippingInfo.selfDeliveryFee;
            }
        }

        //input branch id to card items
        products = products.map(p => {
            p.branchId = storeBranch ? storeBranch.value : 0;
            return p;
        })

        const directDiscount = OrderInStorePurchaseContextService.calculateDirectDiscount(state.productList, state.discountOption)
            + (
                state.isUsedDelivery
                    ? state.shippingInfo.selfDeliveryFee - OrderInStorePurchaseContextService.calculateShippingFee(state.shippingInfo, state.promotion)
                    : 0
            )

        const request = {
            buyerId: state.buyerId !== -1 ? state.buyerId : undefined,
            profileId: state.profileId,
            guest: state.user ? state.user.guest : undefined,
            cartItemVMs: products,
            checkNoDimension: false,
            deliveryInfo: {
                contactName: user.name ? user.name : undefined,
                email: user.email ? user.email : undefined,
                phoneNumber: user.phone ? user.phone : undefined,
                address: shippingInfo.address,
                address2: shippingInfo.address2,
                wardCode: shippingInfo.ward,
                districtCode: shippingInfo?.district,
                locationCode: shippingInfo.city,
                countryCode: shippingInfo.countryCode,
                city: shippingInfo.outsideCity,
                zipCode: shippingInfo.zipCode
            },
            deliveryServiceId: shippingInfo.serviceId,
            langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
            sellerNote: state.note,
            note: state.note,
            paymentCode: state.mposCode,
            paymentMethod: state.paymentMethod,
            storeId: storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
            platform: 'WEB',
            weight: shippingInfo.weight,
            width: shippingInfo.width,
            length: shippingInfo.length,
            height: shippingInfo.height,
            selfDeliveryFee: shippingInfo.selfDeliveryFee,
            coupons: state.promotion && state.promotion.couponCode ? [state.promotion.couponCode] : [],
            selfDeliveryFeeDiscount: selfDeliveryFeeDiscount,
            couponType: couponType,
            branchId: storeBranch ? storeBranch.value : null,
            usePoint: loyaltySetting.isUsePointEnabled && state.usePoint > 0 ? state.usePoint : null,
            receivedAmount: state.receivedAmount,
            directDiscount: directDiscount || null,
            customerId: state.profileId,
        }

        var _pParnertCode = CredentialUtils.ROLE.RESELLER.getPartnerCode()
        if(_pParnertCode){ request.partnerCode = _pParnertCode}
        
        setStReceivedAmount(state.receivedAmount)

        setStIsSaving(true)
        OrderService.createOrder(request)
            .then(resRaw => {
                // after complete -> show toast and close current tab
                GSToast.success('page.order.instorePurchase.createdSuccessfully', true)
                BCOrderService.getOrderDetail(resRaw.id).then(async res => {
                    dispatch(OrderInStorePurchaseContext.actions.setOrderId(res.orderInfo.orderId));
                    if (stPrintEnabled) {
                        // SET PRINT ENABLED POS
                        const data = CredentialUtils.getPrintSizeData(GSSelectPrintSizeModal.LOCAL_STORAGE_KEY.POS)

                        handlePrintReceipt(data)
                            .then(() => refPrintReceiptRef.current.print())
                            .catch(e => console.error(e))
                    }
                    setStCompletedOrder(res)
                    const branchId = request.branchId ? request.branchId : null;
                    const customerId = request && request.profileId ? request.profileId : null;
                    if (branchId && customerId) {
                        await updateCustomerBranch(branchId, customerId);
                    }

                    const onReset = () => {
                        if (currentOrderIndex !== 0 || orderList.length > 1) {
                            deleteOrder(currentOrderIndex)
                        } else {
                            dispatch(OrderInStorePurchaseContext.actions.reset())
                        }
                        // re-enable scanner
                        if (posScannerState.shouldScannerActivated) {
                            setPosScannerState(state => ({
                                ...state,
                                scannerState: true,
                                customerScannerState: false
                            }))
                        }
                    }

                    if (stPrintEnabled) {
                        setTimeout(onReset, 1000) // wait for printer is ready
                    } else {
                        onReset()
                    }
                })
            })
            .catch(e => {

                let hasErrorPhone = false
                if (e.response.data && e.response.data.fieldErrors && e.response.data.fieldErrors.length > 0) {
                    for (const errors of e.response.data.fieldErrors) {
                        if (errors.field === 'deliveryInfo.phoneNumber' && errors.message === 'Pattern') {
                            hasErrorPhone = true
                        }
                    }
                }

                if (hasErrorPhone) {
                    dispatch(OrderInStorePurchaseContext.actions.setErrors({ phone: 'common.validation.invalid.phone' }))
                    return;
                }

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
                            dispatch(OrderInStorePurchaseContext.actions.modifyProduct(item))
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
                        setStOutOfStockProductList(outOfStockItemList);

                        OrderInStorePurchaseContextService.dispatchUpdateOutOfStockProduct(state, dispatch, outOfStockItemList, state.productList, storeBranch)
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

                        dispatch(OrderInStorePurchaseContext.actions.setInsufficientErrorGroup(insufficientGroup))
                        GSToast.error('page.order.instorePurchase.productInsufficientStock', true)
                        return
                    }
                    return
                }

                if (e.response.data.params?.param0?.isTranslate) {
                    GSToast.error(e.response.data.message)
                    return
                }

                switch (e.response.data.message) {
                    case 'error.loyalty.point.exceed.available':
                    case 'error.loyalty.point.exceed.order.value':
                        GSToast.error(i18next.t('page.order.instorePurchase.usePointExceed', { point: e.response.data.params.param0 }))
                        break
                    case 'error.dataConflictError':
                        GSToast.error('page.order.instorePurchase.purchaseExceed', true)
                        break
                    case 'error.order.mismatch.imei.quantity':
                        dispatch(OrderInStorePurchaseContext.actions.checkErrorIMEI(true))
                        GSToast.error('component.managedInventoryPOSModal.updateStock.error.quantity', true)
                        break
                    case 'error.order.invalid.imei':
                        dispatch(OrderInStorePurchaseContext.actions.checkErrorIMEI(true))
                        GSToast.error('component.managedInventoryPOSModal.updateStock.error.sold', true)
                        break
                    case 'error.accessDenied.branch.inactive':
                        GSToast.error('page.order.instorePurchase.branchInactive', true)
                        break
                    default:
                        GSToast.commonError()
                }
            })
            .finally(() => {
                setStIsSaving(false)
            })
    }

    const onChangePayment = (event) => {
        const paymentMethod = event.currentTarget.value
        dispatch(OrderInStorePurchaseContext.actions.setPaymentMethod(paymentMethod))
    }

    const getTotalPrice = () => {
        const total = OrderInStorePurchaseContextService.calculateTotalPrice(state.productList, state.shippingInfo, state.promotion, state.membership, state.totalVATAmount, state.pointAmount, state.discountOption)
        return CredentialUtils.getStoreCurrencySymbol() === Constants.CURRENCY.VND.SYMBOL ? +(total) :
            +(NumberUtils.formatThousandFixed(total,2,true))
    }

    const onBlurMPOSCode = (e) => {
        const value = e.currentTarget.value
        if (value) {
            dispatch(OrderInStorePurchaseContext.actions.setMPOSCode(value))
        }
    }

    const openShippingInfoPopup = (e) => {

        // set delivery or not
        dispatch(OrderInStorePurchaseContext.actions.setUsedDelivery(e.currentTarget.checked))

        if (e.currentTarget.checked) {
            // used delivery
            if (!state.serviceId || state.serviceId === 75) {
                dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({
                    method: OrderInStorePurchaseContext.METHOD.DELIVERY,
                    serviceId: 14
                }))
            } else {
                dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({ method: OrderInStorePurchaseContext.METHOD.DELIVERY }))
            }

            // open modal
            setStIsShowShippingModal(true)

        } else {
            // instore not used delivery
            dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({
                method: OrderInStorePurchaseContext.METHOD.IN_STORE,
                serviceId: 75
            }))
        }
    }

    const openShippingInfoPopupByEdit = () => {
        // open modal
        setStIsShowShippingModal(true)
    }

    const closeShippingInfoPopup = (type) => {

        if ('CANCEL' === type) {
            // uncheck the delivery
            dispatch(OrderInStorePurchaseContext.actions.setUsedDelivery(false))
            // instore not used delivery
            dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({
                method: OrderInStorePurchaseContext.METHOD.IN_STORE,
                serviceId: 75
            }))
        }
        setStIsShowShippingModal(false)
        setStApplyNotEnough(true)
    }

    const handleApplyNotEnough = () => {
        createOrderMain()
        setStIsShowNotEnghtModal(false)
    }
    const handleCloseNotEnough = () => {
        setStIsShowNotEnghtModal(false)
    }

    const getTranslateOption = () => {
        return {
            lng: stSelectedLanguage,
            fallbackLng: ['vi']
        }
    }

    const getNameStaff = () => {
        const isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)
        if (isStaff) {
            accountService.getUserById(CredentialUtils.getUserId())
                .then((result) => {
                    setStNameStaff(result.displayName)
                })
                .catch(() => GSToast.commonError())
        } else {
            setStNameStaff(i18next.t('page.order.detail.information.shopOwner', getTranslateOption()))
        }
    }

    const handleDisplayFormatDigits = (number) => {
        let decimal = 0
        let precision = 0
        if (CurrencyUtils.isCurrencyInput(currency)) {
            decimal = '6'
            precision = 2
        }
        number = NumberUtils.formatThousandFixed(number, decimal, true)
        if (number.indexOf('.') > 0) {
            precision = String(number).split('.')[1]?.length
            if (precision < 3) {
                precision = 2
            } else {
                if (precision > 6) precision = 6
            }
        }
        return CurrencyUtils.formatMoneyByCurrencyWithPrecision(number, currency, precision)
    }
    
    const handlePrintReceipt = (data) => {
        if (!data) {
            return Promise.reject("Print data is empty")
        }
        
        return AddressUtils.buildAddressWithCountry(
            state.shippingInfo.address,
            state.shippingInfo.district,
            state.shippingInfo.ward,
            state.shippingInfo.city,
            state.shippingInfo.countryCode,
            {
                langCode: data.languageSelect
            },
            {
                address2: state.shippingInfo.address2,
                city: state.shippingInfo.outsideCity,
                zipCode: state.shippingInfo.zipCode
            })
            .then(address => {
                dispatch(
                    OrderInStorePurchaseContext.actions.setShippingInfo({
                        fullAddress: address
                    })
                );
                setIsTogglePrintSizeModal(false)
                setPrintSize(data.printSizeRadioGroup)
                setSelectedLanguage(data.languageSelect)
                setInformation(data.additionalInformation)
                setPrintEnabled(data.printEnabled)
                setCustomContent({
                    ...data,
                    receiveAmount: true
                })
                dispatch(OrderInStorePurchaseContext.actions.showModalPrintComplete(false));
            })
    }

    const getShippingInfoForPrint = () => {
        return {
            ...state.shippingInfo,
            contactName: state.user.name,
            phone: state.user.phone,
            address: state.shippingInfo.fullAddress
        }
    }

    const getProductListForPrint = () => {
        return state.productList.map(p => {

            return {
                ...p,
                totalPrice: p.price * p.quantity,
                checked: true
            }
        })
    }

    const togglePrintReceiptModal = () => {
        if (isTogglePrintSizeModal) {
            setIsTogglePrintSizeModal(false)
            dispatch(OrderInStorePurchaseContext.actions.showModalPrintComplete(false));
            return
        }
    }

        return (
        <>
            {stIsSaving && <LoadingScreen zIndex={1051} />}
            <AlertModal ref={refShowConfirm} />
            <GSSelectPrintSizeModal
                printA4Template
                isToggle={isTogglePrintSizeModal}
                selectedLanguage={stSelectedLanguage}
                config={{
                    showCustomContent: true,
                    saveLocalStorage: true,
                    localStorageKey: GSSelectPrintSizeModal.LOCAL_STORAGE_KEY.POS
                }}
                onClose={togglePrintReceiptModal}
                onPrint={handlePrintReceipt}/>
            <Printer
                ref={ refPrintReceiptRef }
                printType={ Printer.PRINT_TYPE.NEW_TAB }
                printSize={ stPrintSize }
            >
                <OrderA4HTML>
                    <OrderA4Template
                        orderId={ state.orderId }
                        orderDate={ moment() }
                        storeInfo={ state.storeInfo }
                        user={ state.user }
                        staffName={ stNameStaff }
                        spendingPoint={ state.usePoint }
                        pointAmount={ state.pointAmount }
                        earningPoint={ state.earnPoint }
                        shippingInfo={ getShippingInfoForPrint() }
                        channel={ Constants.SITE_CODE_GOSELL }
                        productList={ getProductListForPrint() }
                        paymentMethod={ state.paymentMethod }
                        taxAmount={ state.totalVATAmount }
                        note={ state.note }
                        debt={ {
                            debtAmount: OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                                getProductListForPrint(),
                                getShippingInfoForPrint(),
                                state.promotion,
                                state.membership,
                                state.totalVATAmount,
                                state.pointAmount,
                                state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery)
                            ,
                            customerDebtAmount: OrderInStorePurchaseContextService.calculateCustomerDebtAmount(OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                                getProductListForPrint(),
                                getShippingInfoForPrint(),
                                state.promotion,
                                state.membership,
                                state.totalVATAmount,
                                state.pointAmount,
                                state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery), state.customerSummary?.debtAmount),
                            isShow: !isNaN(OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                                getProductListForPrint(),
                                getShippingInfoForPrint(),
                                state.promotion,
                                state.membership,
                                state.totalVATAmount,
                                state.pointAmount,
                                state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery))
                        } }
                        paidAmount={ stReceivedAmount }

                        subTotal={ OrderInStorePurchaseContextService.calculateSubTotalPrice(getProductListForPrint()) }
                        discountAmount={ OrderInStorePurchaseContextService.calculateDiscountAmount(
                            getProductListForPrint(),
                            state.promotion,
                            state.membership,
                            state.discountOption
                        ) }
                        discountedShippingFee={ OrderInStorePurchaseContextService.calculateShippingFee(getShippingInfoForPrint(), state.promotion) }
                        totalPrice={ OrderInStorePurchaseContextService.calculateTotalPrice(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            state.discountOption
                        ) }
                        changeAmount={ OrderInStorePurchaseContextService.calculateChangeAmount(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            stReceivedAmount,
                            state.discountOption
                        ) }
                        payableAmount={ OrderInStorePurchaseContextService.calculatePayableAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            state.discountOption
                        ), OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            state.discountOption
                        ), stReceivedAmount, state.isUsedDelivery), state.customerSummary?.debtAmount, state.isUsedDelivery) }
                        langCode={ stSelectedLanguage }
                        customContent={ stCustomContent }
                        information={ stInformation }
                        isUsedDelivery = { state.isUsedDelivery }
                    />
                </OrderA4HTML>
                <OrderKPosHTML>
                    <OrderKPosTemplate
                        orderId={ state.orderId }
                        orderDate={ moment() }
                        storeInfo={ state.storeInfo }
                        user={ state.user }
                        staffName={ stNameStaff }
                        spendingPoint={ state.usePoint }
                        pointAmount={ state.pointAmount }
                        earningPoint={ state.earnPoint }
                        shippingInfo={ getShippingInfoForPrint() }
                        channel={ Constants.SITE_CODE_GOSELL }
                        productList={ getProductListForPrint() }
                        paymentMethod={ state.paymentMethod }
                        taxAmount={ state.totalVATAmount }
                        note={ state.note }
                        debt={ {
                            debtAmount: OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                                getProductListForPrint(),
                                getShippingInfoForPrint(),
                                state.promotion,
                                state.membership,
                                state.totalVATAmount,
                                state.pointAmount,
                                state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery),
                            customerDebtAmount: OrderInStorePurchaseContextService.calculateCustomerDebtAmount(OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                                getProductListForPrint(),
                                getShippingInfoForPrint(),
                                state.promotion,
                                state.membership,
                                state.totalVATAmount,
                                state.pointAmount,
                                state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery), state.customerSummary?.debtAmount),
                            isShow: !isNaN(OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                                getProductListForPrint(),
                                getShippingInfoForPrint(),
                                state.promotion,
                                state.membership,
                                state.totalVATAmount,
                                state.pointAmount,
                                state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery))
                        } }
                        paidAmount={ stReceivedAmount }
                        subTotal={ OrderInStorePurchaseContextService.calculateSubTotalPrice(getProductListForPrint()) }
                        discountAmount={ OrderInStorePurchaseContextService.calculateDiscountAmount(
                            getProductListForPrint(),
                            state.promotion,
                            state.membership,
                            state.discountOption
                        ) }
                        discountedShippingFee={ OrderInStorePurchaseContextService.calculateShippingFee(getShippingInfoForPrint(), state.promotion) }
                        totalPrice={ OrderInStorePurchaseContextService.calculateTotalPrice(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            state.discountOption
                        ) }
                        changeAmount={ OrderInStorePurchaseContextService.calculateChangeAmount(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            stReceivedAmount,
                            state.discountOption
                        ) }
                        payableAmount={ OrderInStorePurchaseContextService.calculatePayableAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            state.discountOption
                            ), OrderInStorePurchaseContextService.calculateDebtAmount(OrderInStorePurchaseContextService.calculateTotalPrice(
                            getProductListForPrint(),
                            getShippingInfoForPrint(),
                            state.promotion,
                            state.membership,
                            state.totalVATAmount,
                            state.pointAmount,
                            state.discountOption
                            ), stReceivedAmount, state.isUsedDelivery),
                            state.customerSummary?.debtAmount,
                            state.isUsedDelivery) }
                        langCode={ stSelectedLanguage }
                        customContent={ stCustomContent }
                        information={ stInformation }
                        isUsedDelivery = { state.isUsedDelivery }
                    />
                </OrderKPosHTML>
            </Printer>

            {/*NOT ENOUGH MODAL*/ }
            <Modal isOpen={ stIsShowNotEnghtModal }>
                <ModalHeader className="color-green">
                    <GSTrans t="page.order.instorePurchase.amountIsNotEnough"/>
                </ModalHeader>
                <ModalBody>
                    <GSTrans t="page.order.instorePurchase.amountIsNotEnough.body"/>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline marginRight
                              onClick={ handleCloseNotEnough }
                    >
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success
                              onClick={ handleApplyNotEnough }
                    >
                        <GSTrans t="component.order.date.range.apply"/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            {/*COMPLETED MODAL*/ }
            <Modal isOpen={ stIsShowCompletedModal }>
                <ModalHeader className="color-green">
                    <GSTrans t="page.order.instorePurchase.createdSuccessfully"/>
                </ModalHeader>
                <ModalBody>
                    <GSTrans t="page.order.instorePurchase.chooseNextAction"/>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ onClickGoToDetail }>
                        <GSTrans t="page.order.instorePurchase.goToDetail"/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ onClickStayHere }>
                        <GSTrans t="page.order.instorePurchase.createNewOrder"/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            {/*SHIPPING MODAL*/ }
            <Shipping modalHandle={ closeShippingInfoPopup } isOpen={ stIsShowShippingModal }/>

            {/*ADJUST STOCK MODAL*/ }
            <Modal isOpen={ stIsShowModal }
                   className="order-in-store-purchase-complete order-in-store-purchase-complete__quantity-modal">
                <ModalHeader>
                    <h6 className="mb-1">
                        <GSTrans t="page.order.create.complete.quantityModal.title"/>
                    </h6>
                    <p className="font-size-14px color-gray">
                        <GSTrans t="page.order.create.complete.quantityModal.subTitle"/>
                    </p>
                </ModalHeader>
                <ModalBody className="mt-0 pt-0">
                    <AvForm onValidSubmit={ onSubmitQuantityModal }
                            className="order-in-store-purchase-complete__product-form gs-atm__scrollbar-1">
                        <button ref={ refSubmitBtn } hidden/>
                        <UikWidgetTable className="order-in-store-purchase-complete__product-table">
                            <thead>
                            <tr>
                                <th>
                                    <GSTrans t="page.order.create.complete.quantityModal.table.productName"/>
                                </th>
                                <th>
                                    <GSTrans t="page.order.create.complete.quantityModal.table.pricePerProduct"/>
                                </th>
                                <th>
                                    <GSTrans t="page.order.create.complete.quantityModal.table.stock"/>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            { stOutOfStockProductList.map(product => {
                                return (
                                    <tr key={ product.id }>
                                        <td>
                                            <div>
                                                <h6 className="mb-0 order-in-store-purchase-complete__table-product-name">
                                                    { product.name }
                                                </h6>
                                                { product.modelName &&
                                                <p className="color-gray font-size-14px mb-0">
                                                    { ItemUtils.escape100Percent(product.modelName) }
                                                </p>
                                                }
                                            </div>
                                        </td>
                                        <td className="text-center">
                                                <span className="color-gray">
                                                    { CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol()) }
                                                </span>
                                        </td>
                                        <td>
                                            <AvFieldCurrency name={ product.id + '' }
                                                             unit={ CurrencySymbol.NONE }
                                                             validate={ {
                                                                 ...FormValidate.required(),
                                                                 ...FormValidate.minValue(1),
                                                                 ...FormValidate.maxValue(1_000_000, true)
                                                             } }
                                                             value={ product.quantity }
                                                             parentClassName="order-in-store-purchase-complete__input-stock"

                                            />
                                            <AvField name={ 'currentStock-' + product.id + '' }
                                                     defaultValue={ product.quantity }
                                                     hidden
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                            }
                            </tbody>
                        </UikWidgetTable>
                    </AvForm>
                </ModalBody>
                <ModalFooter>
                    <GSButton secondary outline marginRight onClick={ onClickCloseChangeStockModal }>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success onClick={ () => refSubmitBtn.current.click() }>
                        <GSTrans t="component.order.date.range.apply"/>
                    </GSButton>
                </ModalFooter>
            </Modal>

            <GSWidget className="order-in-store-purchase-complete flex-grow-1">
                <GSWidgetContent className=" d-flex flex-column w-100 font-size-1_1rem h-100">
                    {/*SUBTOTAL*/ }
                    <div
                        className="d-flex justify-content-between align-items-center mt-2 font-weight-500 font-size-1_2rem">
                        <div className="d-flex flex-column">
                            <span>
                                <GSTrans t={ 'page.order.detail.items.subTotal' }/>
                            </span>
                            <span className="font-size-12px">
                                <GSTrans t={ 'page.instore.summary.productCount' } values={ {
                                    x: NumberUtils.formatThousand(
                                        OrderInStorePurchaseContextService.countProductList(state.productList)
                                    )
                                } }/>
                            </span>
                        </div>
                        <span className="align-self-baseline">
                            { CurrencyUtils.formatMoneyByCurrency(
                                OrderInStorePurchaseContextService.calculateSubTotalPrice(state.productList),
                                CurrencyUtils.getLocalStorageSymbol()
                            ) }
                        </span>
                    </div>
                    <hr className="order-pos__subtotal-hr"/>
                    {/*VAT*/ }
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>VAT</span>
                        <span>
                            { handleDisplayFormatDigits(OrderInStorePurchaseContextService.calculateVAT(state.totalVATAmount)) }
                        </span>
                    </div>
                    {/*POINT*/ }
                    <OrderInStorePoint/>
                    {/*DISCOUNT*/ }
                    <OrderInstoreDiscount/>

                    {/*DELIVERY*/ }
                    <div className="delivery-group-info d-flex justify-content-between align-items-center mb-3">
                        <span>
                            <UikCheckbox
                                onClick={ openShippingInfoPopup }
                                checked={ state.isUsedDelivery }/>
                            <GSTrans t={ 'page.order.create.print.shippingMethod.DELIVERY' }/>
                            { state.isUsedDelivery &&
                            // add the tooltip here
                            <GSComponentTooltip
                                placement={ GSComponentTooltipPlacement.BOTTOM }
                                interactive
                                style={ {
                                    display: 'inline'
                                } }
                                html={
                                    <GSTrans t="page.order.instorePurchase.tooltip.edit.delivery">
                                        Update delivery
                                    </GSTrans>
                                }>
                                <img onClick={ openShippingInfoPopupByEdit } className="edit-icon"
                                     src={ '/assets/images/icon-edit-2.svg' } alt=""/>
                            </GSComponentTooltip>
                            }

                        </span>

                        { state.isUsedDelivery &&
                        <span>{ CurrencyUtils.formatMoneyByCurrency(state.shippingInfo.selfDeliveryFee, CurrencyUtils.getLocalStorageSymbol()) }</span>
                        }

                        { !state.isUsedDelivery &&
                        <span>{ CurrencyUtils.formatMoneyByCurrency(0, CurrencyUtils.getLocalStorageSymbol()) }</span>
                        }


                    </div>

                    {/*TOTAL*/ }
                    <div
                        className="d-flex justify-content-between align-items-center mb-3 font-size-1_4rem font-weight-500 ">
                        <span>
                            <GSTrans t="page.instore.summary.total"/>
                        </span>
                        <span>
                            { CurrencyUtils.formatMoneyByCurrency(
                                getTotalPrice(),
                                CurrencyUtils.getLocalStorageSymbol()
                            ) }
                        </span>
                    </div>

                    {/*AMOUNT RECEIVED*/ }
                    <div className="d-flex justify-content-between align-items-center mt-3 mb-3 ">
                        <div className="d-flex flex-column">
                            <GSTrans t="page.instore.summary.received"/>
                            <select value={ state.paymentMethod }
                                    onChange={ onChangePayment }
                                    className="color-blue cursor--pointer font-size-12px order-pos__payment-select">
                                <option value={ Constants.ORDER_PAYMENT_METHOD_CASH }>
                                    { i18next.t('page.order.create.payment.cash') }
                                </option>
                                <option value={ Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER }>
                                    { i18next.t('page.order.create.payment.bankTransfer') }
                                </option>
                                <option value={ Constants.ORDER_PAYMENT_METHOD_MPOS }>
                                    { i18next.t('page.order.create.print.paymentMethod.MPOS') }
                                </option>
                            </select>
                            { state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_MPOS &&
                            <input maxLength={ 100 }
                                   className="order-pos__input-mpos-code"
                                   onBlur={ onBlurMPOSCode }
                                   placeholder={ i18next.t('page.order.create.payment.mposCode') }
                                   key={ 'mpos-code-' + state.paymentMethod } // => reset when change payment method
                            />
                            }
                        </div>

                        <span className="align-self-baseline">
                            <NumberFormat
                                thousandSeparator={ ',' }
                                className="text-right order-pos__received-input"
                                value={ state.receivedAmount }
                                onValueChange={ updateReceivedAmount }
                                prefix={ CurrencyUtils.getLocalStorageSymbol() !== Constants.CURRENCY.VND.SYMBOL ? CurrencyUtils.getLocalStorageSymbol() : '' }
                                suffix={ CurrencyUtils.getLocalStorageSymbol() === Constants.CURRENCY.VND.SYMBOL ? CurrencyUtils.getLocalStorageSymbol() : '' }
                                precision={ CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2' }
                                decimalScale={ CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2 }
                            />
                        </span>
                    </div>

                    <hr className="order-pos__subtotal-hr"/>

                    {/*CHANGE*/ }
                    <div className="d-flex justify-content-between align-items-center mb-2 ">
                        <span>
                            <GSTrans t="page.instore.summary.change"/>
                        </span>
                        <span>
                            { CurrencyUtils.formatMoneyByCurrency(
                                calculateChangeAmount()
                                , CurrencyUtils.getLocalStorageSymbol()) }
                        </span>
                    </div>


                    {/*NOTE*/ }
                    <div className="d-flex flex-column justify-content-between mb-2 mt-auto">
                        <Label className="mb-0"><GSTrans t="page.order.create.complete.note"/></Label>
                        <input
                            placeholder={ i18next.t(
                                'page.order.create.complete.inputNote'
                            ) }
                            className="order-pos__note-input"
                            onBlur={ (e, value) => setNote(e, value) }
                            defaultValue={ state.note }
                            key={ state.note }
                            maxLength={ 500 }
                        />
                    </div>

                    { loyaltySetting.enabledPoint && state.user.userId && !(state.user.guest > 0) &&
                    <div className="mb-2 mt-auto">
                        { state.earnPoint > 0 && <>
                            <img src="https://dm4fv4ltmsvz0.cloudfront.net/storefront-images/point/money.png"
                                 alt={ 'coin' }
                                 className="mr-2"
                                 width="21px"
                            />
                            <GSTrans t="page.order.create.cart.loyaltyPoint" values={ {
                                points: NumberUtils.formatThousand(state.earnPoint)
                            } }
                            >
                                0<strong className="color-red">1</strong>2
                            </GSTrans>
                        </>
                        }
                        { state.earnPoint <= 0 && state.missingAmount > 0 &&
                        <GSTrans t="page.order.create.cart.loyaltyPoint.buyMore" values={ {
                            missingAmount: CurrencyUtils.formatMoneyByCurrency(state.missingAmount, CurrencyUtils.getLocalStorageSymbol()),
                            points: NumberUtils.formatThousand(state.ratePoint)
                        } }
                        >
                            0<strong className="color-red">1</strong>2<strong className="color-red">3</strong>
                        </GSTrans>
                        }
                    </div> }

                    <GSButton success
                              size="large"
                              className="text-uppercase w-100 mt-2 order-pos__btn-create-order"
                              onClick={ createOrder }
                              disabled={ !isEnabled }>
                        <GSTrans t="page.setting.plans.step3.icon.title"/>
                    </GSButton>
                </GSWidgetContent>
            </GSWidget>
        </>
    );
};

OrderInStorePurchaseComplete.propTypes = {};

export default OrderInStorePurchaseComplete;
