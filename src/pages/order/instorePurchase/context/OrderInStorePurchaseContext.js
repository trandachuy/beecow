/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {ContextUtils} from "../../../../utils/context";
import _ from 'lodash';
import Constants from "../../../../config/Constant";
import storageService from "../../../../services/storage";
import {AgencyService} from "../../../../services/AgencyService";
import {CredentialUtils} from "../../../../utils/credential";
import {ItemUtils} from '../../../../utils/item-utils'
import {CurrencyUtils} from "../../../../utils/number-format";

/**
 * @typedef {Object} InStoreProduct
 * @property {String} barcode
 * @property {Number} branchId
 * @property {Boolean} checked
 * @property {String} currency
 * @property {Number} id
 * @property {String} image
 * @property {String} itemId
 * @property {String} itemImage
 * @property {String} itemName
 * @property {Number} itemStock
 * @property {Number} modelId
 * @property {String} modelLabel
 * @property {String} modelName
 * @property {Number} modelStock
 * @property {String} name
 * @property {Number} price
 * @property {Number} quantity
 */


export const METHOD = {
    IN_STORE : "IN_STORE",
    DELIVERY : "DELIVERY"
}

const OPTION = {
    AUTO_FILL : "AUTO_FILL",
    SELF_FILL : "SELF_FILL"
}

const COUNTRY_CODE_DEFAULT = CurrencyUtils.getLocalStorageCountry()

const initState = {
    // scannerState:true,
    // shouldScannerActivated:true,
    // shouldCustomerScannerActivated:true,
    // customerScannerState: false,
    orderId: "",
    productList: [],
    promotion: '',
    paymentMethod: Constants.ORDER_PAYMENT_METHOD_CASH,
    buyerInfo: {},
    user: {
        userId: undefined,
        name: undefined,
        customerName: undefined,
        email: undefined,
        phone: undefined,
        customerPhone: undefined,
        availablePoint: 0
    },
    shippingInfo: {
        method : METHOD.IN_STORE,
        option : OPTION.SELF_FILL,
        serviceId: 75,
        selfDeliveryFee: 0,
        autoDeliveryFee: 0,
        amount: 0,
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        address: '',
        address2:'',
        ward: '',
        district: '',
        city: '',
        countryCode: COUNTRY_CODE_DEFAULT,
        zipCode: '',
        outsideCity:'',
    },
    mposCode: '',
    processing: false,
    note: '',
    errors: {
        name: false,
        phone: '',
        address: false,
        city: false,
        district: false,
        length: false,
        width: false,
        height: false,
        weight: false,
        provider: false,
        option: false,
        serviceId: false
    },
    searchProductText: '',
    searchUserText: '',
    printPageSize: CredentialUtils.getSelectOrder() || "A4",
    printEnabled: CredentialUtils.getCheckedOrder() ||  false,
    membership: undefined,
    storeInfo: {
        storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
        storeDomain: AgencyService.getStorefrontDomain(),
        storeUrl: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_URL),
        storeImage: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE),
        storeName: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
        storePhone: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_PHONE),
        storeAddress: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS),
        customDomain: '',
    },
    totalVATAmount: 0,
    maxUsePoint: 0,
    pointAmount: 0,
    earnPoint: 0,
    missingAmount: 0,
    ratePoint: 0,
    usePoint: 0,
    errorPointMessage: "",
    receivedAmount: 0,
    isNotFound: undefined,
    barcodeScanned: undefined,
    isUsedDelivery: false,
    isCustomerNotFound: undefined,
    customerBarcodeScanned: undefined,
    errorIMEI: false,
    checkWholeSalePrice: false,
    insufficientErrorGroup: [],
    discountOption: {
        percent: null,
        discount: null,
        type: Constants.DISCOUNT_OPTION.DISCOUNT_CODE
    },
    customerSummary: undefined,
    storeBranch: undefined,
    isShowModalPrint: false
}

const context = React.createContext(initState)

const actions = {
    setState: (state) => ContextUtils.createAction('SET_STATE', state),
    barCodeNotFound: (isNotFound) => ContextUtils.createAction('BAR_CODE_NOT_FOUND', isNotFound),
    barcodeScanned: (barcodeScanned) => ContextUtils.createAction('BAR_CODE_NOT_FOUND', barcodeScanned),
    setTotalVATAmount: (totalVatAmount) => ContextUtils.createAction('SET_TOTAL_VAT_AMOUNT', totalVatAmount),
    addNewProduct: (product) => ContextUtils.createAction('ADD_NEW_PRODUCT', product),
    removeProduct: (productId) => ContextUtils.createAction('REMOVE_PRODUCT', productId),
    updateProductHasWholeSalePrice: (product) => ContextUtils.createAction('UPDATE_PRODUCT_HAS_WHOSALEPRICE', product),
    updateProductHasWholeSalePriceChangeBuyerId: (product) => ContextUtils.createAction('UPDATE_PRODUCT_HAS_WHOSALEPRICE_CHANGE_BUYERID', product),
    checkToggleProduct: (productId) => ContextUtils.createAction('CHECK_TOGGLE', productId),
    checkAllProduct: () => ContextUtils.createAction('CHECK_ALL_TOGGLE_PRODUCT', true),
    uncheckAllProduct: () => ContextUtils.createAction('CHECK_ALL_TOGGLE_PRODUCT', false),
    modifyProduct: (product) => ContextUtils.createAction('MODIFY_PRODUCT', product),
    applyMembership: (membershipDTO) => ContextUtils.createAction('APPLY_MEMBERSHIP', membershipDTO),
    clearMembership: () => ContextUtils.createAction('CLEAR_MEMBERSHIP'),
    applyPromotionCode: (promotionResponse) => ContextUtils.createAction('APPLY_PROMOTION_CODE', promotionResponse),
    applyDiscountCode: (discountOption) => ContextUtils.createAction('APPLY_DISCOUNT_CODE', discountOption),
    applyPromotionCodeAndUpdateProduct: (promotionResponse, product) => ContextUtils.createAction('APPLY_PROMOTION_CODE_AND_UPDATE_PRODUCT', {promotionResponse, product}),
    clearPromotionCode: () => ContextUtils.createAction('CLEAR_PROMOTION_CODE'),
    applyWholeSale: (wholeSaleResponse) => ContextUtils.createAction('APPLY_WHOLESALE', wholeSaleResponse),
    clearWholeSale: () => ContextUtils.createAction('CLEAR_WHOLESALE'),
    setPaymentMethod: (paymentMethod) => ContextUtils.createAction('SET_PAYMENT_METHOD', paymentMethod),
    setShippingInfo: (shippingInfo) => ContextUtils.createAction('SET_SHIPPING_INFO', shippingInfo),
    setMPOSCode: (mposCode) => ContextUtils.createAction('SET_MPOS_CODE', mposCode),
    setProcessing: (processing) => ContextUtils.createAction('SET_PROCESSING', processing),
    setNote: (note) => ContextUtils.createAction('SET_NOTE', note),
    setErrors: (errors) => ContextUtils.createAction('SET_ERRORS', errors),
    setBuyerId: (buyerId) => ContextUtils.createAction('SET_BUYER_ID', buyerId),
    setProfileId: (profileId) => ContextUtils.createAction('SET_PROFILE_ID', profileId),
    setBuyerInfo: (buyerInfo) => ContextUtils.createAction('SET_BUYER_INFO', buyerInfo),
    setUser: (user) => ContextUtils.createAction('SET_USER', user),
    setSearchProductText: (text) => ContextUtils.createAction('SET_SEARCH_PRODUCT_TEXT', text),
    setSearchUserText: (text) => ContextUtils.createAction('SET_SEARCH_USER_TEXT', text),
    reset: () => ContextUtils.createAction('RESET'),
    resetShippingInfo: () => ContextUtils.createAction('RESETSHIPPINGINFO'),
    getStoreInfo: () => ContextUtils.createAction('GET_STORE_INFO'),
    setStoreInfo: (storeInfo) => ContextUtils.createAction('SET_STORE_INFO', storeInfo),
    setOrderId: (orderId) => ContextUtils.createAction('SET_ORDER_ID', orderId),
    setPrintSizePage: (sizePage) => ContextUtils.createAction('SET_PRINT_SIZE_PAGE', sizePage),
    setLoyaltyPoint: (pointValue) => ContextUtils.createAction('SET_LOYALTY_POINT', pointValue),
    setPointAmount: (pointAmount) => ContextUtils.createAction('SET_POINT_AMOUNT', pointAmount),
    setMaxUsePoint: (maxUsePoint) => ContextUtils.createAction('SET_MAX_USE_POINT', maxUsePoint),
    setUsePoint: (usePoint) => ContextUtils.createAction('SET_USE_POINT', usePoint),
    setErrorPointMessage: (errorPointMessage) => ContextUtils.createAction('SET_ERROR_POINT_MESSAGE', errorPointMessage),
    setReceivedAmount: (amount) => ContextUtils.createAction('SET_RECEIVED_AMOUNT', amount),
    setUsedDelivery: (delivery) => ContextUtils.createAction('SET_USED_DELIVERY', delivery),
    // setShouldActiveScanner:(shouldActive)=>ContextUtils.createAction('SET_SHOULD_SCANNER', shouldActive),
    // setShouldCustomerScannerActivated:(shouldActive)=>ContextUtils.createAction('SET_SHOULD_CUSTOMER_SCANNER', shouldActive),
    // setScannerState:(scannerState)=>ContextUtils.createAction('SET_SCANNER_STATE', scannerState),
    // setCustomerScannerState:(customerScannerState)=>ContextUtils.createAction('SET_CUSTOMER_SCANNER_STATE', customerScannerState),
    setPrintEnable: (status) => ContextUtils.createAction('SET_PRINT_STATUS', status),
    clearEarnPoint: () => ContextUtils.createAction('CLEAR_EARN_POINT'),
    sortProductListBySelectedDate: () => ContextUtils.createAction('SORT_PRODUCT_LIST_BY_SELECTED_DATE'),
    customerBarcodeNotFound: (isCustomerNotFound) => ContextUtils.createAction('CUSTOMER_NOT_FOUND', isCustomerNotFound),
    customerBarcodeScanned: (customerBarcodeScanned) => ContextUtils.createAction('CUSTOMER_NOT_FOUND', customerBarcodeScanned),
    setProductIMEI: (data) => ContextUtils.createAction('SET_PRODUCT_IMEI', data),
    checkErrorIMEI: (errorImei) => ContextUtils.createAction('CHECK_ERROR_IMEI', errorImei),
    setInsufficientErrorGroup: (data) => ContextUtils.createAction('SET_INSUFFICIENT_ERROR_GROUP', data),
    clearInsufficientErrorGroup: (data) => ContextUtils.createAction('CLEAR_INSUFFICIENT_ERROR_GROUP', data),
    setCustomerSummary: (data) => ContextUtils.createAction('SET_CUSTOMER_SUMMARY', data),
    getStoreBranch: () => ContextUtils.createAction('GET_STORE_BRANCH'),
    setStoreBranch: (storeBranch) => ContextUtils.createAction('SET_STORE_BRANCH', storeBranch),
    showModalPrintComplete: (isShowModalPrint) => ContextUtils.createAction('SHOW_MODAL_PRINT_COMPLETE', isShowModalPrint)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SORT_PRODUCT_LIST_BY_SELECTED_DATE': {
            let productList = [...state.productList]
            productList = productList.sort(function (a, b) {
                return a.dateSelected - b.dateSelected
            })
            return {
                ...state,
                productList
            }
        }
        case 'SET_STATE': {
            return action.payload
        }
        case 'CLEAR_EARN_POINT': {
            return {
                ...state,
                earnPoint: 0,
                missingAmount: 0
            }
        }
        case 'SET_PRINT_STATUS': {
            return {
                ...state,
                printEnabled: action.payload
            }
        }
        case 'SET_SCANNER_STATE': {
                return {
                    ...state,
                    scannerState: action.payload
                }
            }
        case 'SET_CUSTOMER_SCANNER_STATE': {
            return {
                ...state,
                customerScannerState: action.payload
            }
        }

        case 'SET_SHOULD_SCANNER': {
            return {
                ...state,
                shouldScannerActivated: action.payload
            }
        }


        case 'SET_SHOULD_CUSTOMER_SCANNER': {
                return {
                    ...state,
                    shouldCustomerScannerActivated:action.payload
                }

        }

        case 'SET_RECEIVED_AMOUNT': {
            return {
                ...state,
                receivedAmount: action.payload
            }
        }

        case 'SET_ERROR_POINT_MESSAGE': {
            return {
                ...state,
                errorPointMessage: action.payload
            }
        }

        case 'BAR_CODE_NOT_FOUND':{
            return {
                ...state,
                isNotFound: action.payload,
                barcodeScanned: action.payload
            }
        }

        case 'CUSTOMER_NOT_FOUND':{
            return {
                ...state,
                isCustomerNotFound: action.payload,
                customerBarcodeScanned: action.payload
            }
        }

        case 'SET_USE_POINT': {
            return {
                ...state,
                usePoint: action.payload
            }
        }
        case 'SET_POINT_AMOUNT': {
            return {
                ...state,
                pointAmount: action.payload
            }
        }
        case 'SET_MAX_USE_POINT': {
            return {
                ...state,
                maxUsePoint: action.payload
            }
        }
        case 'SET_LOYALTY_POINT': {
            return {
                ...state,
                earnPoint: action.payload.earnPoint,
                missingAmount: action.payload.missingAmount,
                ratePoint: action.payload.ratePoint
            }
        }
        case 'SET_TOTAL_VAT_AMOUNT': {
            return {
                ...state,
                totalVATAmount: action.payload
            }
        }
        case 'SET_PRINT_SIZE_PAGE': {
            return {
                ...state,
                printPageSize: action.payload
            }
        }
        case 'SET_SEARCH_PRODUCT_TEXT': {
            return {
                ...state,
                searchProductText: action.payload
            }
        }
        case 'SET_SEARCH_USER_TEXT': {
            return {
                ...state,
                searchUserText: action.payload
            }
        }
        case 'RESET': {
            const {storeInfo,  enabledPoint} = state;
            return {
                ...initState,
                enabledPoint: enabledPoint,
                storeInfo: {...storeInfo},
            }
        }
        case 'RESETSHIPPINGINFO': {
            return {
                ...state,
                shippingInfo: initState.shippingInfo,

            }
        }
        case 'ADD_NEW_PRODUCT': {
            const productNewList = _.cloneDeep(state.productList).filter(p => p.id !== action.payload)
            // check duplicate
            const productResponse = action.payload
            const duplicateProduct = productNewList.filter(p => p.id === productResponse.id)[0]
            if (duplicateProduct) { // => if duplicate -> increase quantity
                const orgQuantity = duplicateProduct.quantity
                duplicateProduct.quantity = parseInt(duplicateProduct.quantity) + 1
                duplicateProduct.quantity = duplicateProduct.quantity < 1? orgQuantity:duplicateProduct.quantity
            } else { // => if not duplicate -> create new
                productNewList.unshift(productResponse)
            }
            return {
                ...state,
                productList: productNewList
            }
        }

        case 'UPDATE_PRODUCT_HAS_WHOSALEPRICE': {
            let productNewList = [];

            if (typeof action.payload === 'object'){
                productNewList = state.productList.map(product=>
                    product.id.split('-').join('_') == action.payload.itemModelIds ?
                    { ...product, price:action.payload.price, orgPrice:action.payload.orgPrice, salePercent:action.payload.salePercent,wholesalePricingId:action.payload.id, isWhosalePrice: true } : product)
            }else {
                productNewList = state.productList.map(product=> product.id == action.payload ?
                    { ...product, price:product.orgPrice ? product.orgPrice : product.price, salePercent: 0, wholesalePricingId: null, isWhosalePrice: false } : product)
            }

            return {
                ...state,
                productList: productNewList,
                checkWholeSalePrice: !state.checkWholeSalePrice
            }
        }
        
        case 'UPDATE_PRODUCT_HAS_WHOSALEPRICE_CHANGE_BUYERID': {
            const {productList,wholeSalePrice} = action.payload
            let productNewList = _.cloneDeep(state.productList);
           
            if (wholeSalePrice.length > 0){
                wholeSalePrice.forEach(wsr=>{
                    const index = state.productList.findIndex(p=>p.id.split('-').join('_') === wsr.itemModelIds)
                    if (index !== -1){
                        productNewList[index] = { ...productNewList[index], price:wsr.price, orgPrice:wsr.orgPrice, salePercent:wsr.salePercent,wholesalePricingId:wsr.id, isWhosalePrice: true }
                    }
                })   
            }else {
                    productNewList = state.productList.map(product=> ({ ...product, price:product.orgPrice ? product.orgPrice : product.price, salePercent: 0, wholesalePricingId: null, isWhosalePrice: false }))
            }
            return {
                ...state,
                productList: productNewList,
                checkWholeSalePrice: !state.checkWholeSalePrice
            }
        }

        case 'REMOVE_PRODUCT':
            const productNewList = _.cloneDeep(state.productList).filter(p => p.id !== action.payload)
            if(productNewList.length === 0){
                return {
                    ...state,
                    discountOption: {
                        percent: null,
                        discount: null,
                        type: Constants.DISCOUNT_OPTION.DISCOUNT_CODE
                    },
                    productList: productNewList
                }
            }
            return {
                ...state,
                productList: productNewList
            }
        case 'CHECK_TOGGLE': {
            const productId = action.payload
            const productNewList = _.cloneDeep(state.productList)
            const productObj = productNewList.filter(p => p.id === productId)[0]
            productObj.checked = !productObj.checked
            return {
                ...state,
                productList: productNewList
            }
        }
        case 'CHECK_ALL_TOGGLE_PRODUCT': {
            const productNewList = _.cloneDeep(state.productList)
            productNewList.map(p => {
                p.checked = action.payload
                return p
            })
            return {
                ...state,
                productList: productNewList
            }
        }
        case 'MODIFY_PRODUCT': {
            const productNewList = _.cloneDeep(state.productList)
            let index = _.findIndex(productNewList, (p => p.id === action.payload.id))
            // if quantity is invalid -> reset previous value
            const orgQuantity = productNewList[index].quantity
            productNewList[index] = action.payload
            productNewList[index].quantity = productNewList[index].quantity < 1? orgQuantity:productNewList[index].quantity
            return {
                ...state,
                productList: productNewList
            }
        }
        case 'APPLY_MEMBERSHIP': {
          const membership = action.payload
            return {
              ...state, membership: membership
            }
        }
        case 'CLEAR_MEMBERSHIP': {
            return {
              ...state, membership: undefined
            }
        }
        case 'APPLY_PROMOTION_CODE': {
            const promotion = action.payload
            const productNewList = _.cloneDeep(state.productList)

            productNewList.forEach(p => {
                const couponItem = promotion.couponItems.find(({ itemId, modelId }) => {
                    const id = itemId + (modelId ? ('-' + modelId) : '')

                    return p.id === id
                })

                if (couponItem) {
                    p.promotion = {
                        couponId: promotion.couponId,
                        couponCode: promotion.couponCode,
                        couponType: promotion.couponType,
                        freeShipping: promotion.freeShipping,
                        couponItem: couponItem
                    }
                } else {
                    p.promotion = undefined
                }
            })

            return {
                ...state,
                promotion: action.payload,
                productList: productNewList
            }
        }
        case 'CLEAR_WHOLESALE': {
            const productNewList = _.cloneDeep(state.productList).map(p => ({
                ...p,
                wholeSale: undefined
            }))
            return {
                ...state,
                productList: productNewList
            }
        }
        case 'APPLY_WHOLESALE': {
            const wholeSaleResponse = action.payload

            const productNewList = _.cloneDeep(state.productList)
            for (const wholeSale of wholeSaleResponse) {
                let productIndex = _.findIndex(productNewList, p => {
                    if (wholeSale.modelId) {
                        return p.id === wholeSale.itemId + '-' + wholeSale.modelId
                    }
                    return p.id == wholeSale.itemId
                })
                if (productIndex > -1) {
                    productNewList[productIndex].wholeSale = wholeSale
                }
            }
            return {
                ...state,
                productList: productNewList
            }
        }
        case 'CLEAR_PROMOTION_CODE': {
            const productNewList = _.cloneDeep(state.productList).map(p => {
                delete p.promotion
                return p
            })
            return {
                ...state,
                promotion: null,
                productList: productNewList
            }
        }
        case 'SET_MPOS_CODE': {
            return {
                ...state,
                mposCode: action.payload
            }
        }
        case 'SET_PAYMENT_METHOD': {
            return {
                ...state,
                paymentMethod: action.payload
            }
        }
        case 'SET_SHIPPING_INFO': {
            return {
                ...state,
                shippingInfo: {
                    ...state.shippingInfo,
                    ...action.payload,
                    // amount: action.payload.method && action.payload.method === METHOD.IN_STORE? 0:state.shippingInfo.autoDeliveryFee
                }
            }
        }
        case 'SET_ERRORS': {
            return {
                ...state,
                errors: {...state.errors, ...action.payload}
            }
        }
        case 'SET_PROCESSING': {
            return {
                ...state,
                processing: action.payload
            }
        }
        case 'SET_NOTE': {
            return {
                ...state,
                note: action.payload
            }
        }
        case 'APPLY_PROMOTION_CODE_AND_UPDATE_PRODUCT': {
            const {promotionResponse, product} = action.payload
            // update product first
            const productNewList = _.cloneDeep(state.productList)
            let index = _.findIndex(productNewList, (p => p.id === action.payload.id))
            productNewList[index] = product
            // apply promotion
            for (const couponItem of promotionResponse.couponItems) {
                let productIndex = _.findIndex(productNewList, p => {
                    if (couponItem.modelId) {
                        return p.id === couponItem.itemId + '-' + couponItem.modelId
                    }
                    return p.id == couponItem.itemId
                })
                if (productIndex > -1) {
                    productNewList[productIndex].promotion = {
                        couponId: promotionResponse.couponId,
                        couponCode: promotionResponse.couponCode,
                        couponType: promotionResponse.couponType,
                        freeShipping: promotionResponse.freeShipping,
                        couponItem: couponItem,
                    }
                }
            }
            return {
                ...state,
                promotion: promotionResponse,
                productList: productNewList
            }
        }
        case 'SET_BUYER_ID': {
            return {
                ...state,
                user: {
                    ...state.user,
                    userId: action.payload
                },
                buyerId: action.payload
            }
        }
        case 'SET_PROFILE_ID': {
            return {
                ...state,
                profileId: action.payload
            }
        }
        case 'SET_BUYER_INFO': {
            return {
                ...state,
                buyerInfo: {...state.buyerInfo, ...action.payload}
            }
        }
        case 'SET_USER': {
            return {
                ...state,
                user: {...state.user, ...action.payload}
            }
        }
        case 'GET_STORE_INFO': {
            return {
                ...state,
                storeInfo:{...state.storeInfo, ...action.payload}
            }
        }
        case 'SET_STORE_INFO': {
            return {
                ...state,
                storeInfo: {
                    ...state.storeInfo,
                    ...action.payload,
                }
            }
        }
        case 'SET_ORDER_ID': {
            return {
                ...state,
                orderId: action.payload
            }
        }
        case 'GET_STORE_BRANCH': {
            return {
                ...state,
                storeBranch:{...state.storeBranch, ...action.payload}
            }
        }
        case 'SET_STORE_BRANCH': {
            return {
                ...state,
                storeBranch: {
                    ...state.storeBranch,
                    ...action.payload,
                }
            }
        }
        case 'SHOW_MODAL_PRINT_COMPLETE': {
            return {
                ...state,
                isShowModalPrint: action.payload
            }
        }
        case 'SET_USED_DELIVERY': {
            return {
                ...state,
                isUsedDelivery: action.payload
            }
        }
        case 'SET_PRODUCT_IMEI': {
            const productNewList = _.cloneDeep(state.productList)
            let index = _.findIndex(productNewList, (p => p.id === action.payload.id))
            productNewList[index].imeiSerial = action.payload.imeiSerial
            return {
                ...state,
                productList: productNewList
            }
        }
        case 'CHECK_ERROR_IMEI': {
            return {
                ...state,
                errorIMEI: action.payload
            }
        }
        case 'SET_INSUFFICIENT_ERROR_GROUP': {
            return {
                ...state,
                insufficientErrorGroup: action.payload
            }
        }
        case 'CLEAR_INSUFFICIENT_ERROR_GROUP': {
            const id = ItemUtils.computeItemModelIdV2(action.payload.itemId, action.payload.modelId)
            return {
                ...state,
                insufficientErrorGroup: state.insufficientErrorGroup.filter(i => !i.includes(id))
            }
        }
        case 'APPLY_DISCOUNT_CODE': {
            const discount = action.payload
            const productList = action.payload.discount ? state.productList.map(p=>({
                ...p,
                discountCode:true
            })) : state.productList.map(p=>({
                ...p,
                discountCode:false
            }))
            return {
                ...state,
                productList,
                discountOption: {
                    percent: discount.percent,
                    discount: discount.discount,
                    type: discount.type
                }
            }
        }
        case 'SET_CUSTOMER_SUMMARY': {
            return {
                ...state,
                customerSummary: action.payload
            }
        }
        default:
            return state;
    }
}

export const OrderInStorePurchaseContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
    METHOD,
    OPTION
}
