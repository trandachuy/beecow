/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React from "react";
import {ContextUtils} from "../../../../utils/context";
import _ from 'lodash';
import Constants from "../../../../config/Constant";
import storageService from "../../../../services/storage";
import {AgencyService} from "../../../../services/AgencyService";
import {ItemService} from "../../../../services/ItemService";

export const METHOD = {
    IN_STORE : "IN_STORE",
    DELIVERY : "DELIVERY"
}

const OPTION = {
    AUTO_FILL : "AUTO_FILL",
    SELF_FILL : "SELF_FILL"
}

const initState = {
    orderId: "",
    productList: [],
    countProductInCart:0,
    promotion: '',
    paymentMethod: Constants.ORDER_PAYMENT_METHOD_CASH,
    buyerInfo: {},
    user: {
        userId: undefined,
        name: undefined,
        email: undefined,
        phone: undefined
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
        ward: '',
        district: '',
        city: '',
        cityName: '',
        districtName: '',
        wardName: ''
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
    printPageSize: "A4",
    printEnabled: false,
    membership: undefined,
    storeInfo: {
        storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
        storeDomain: AgencyService.getStorefrontDomain(),
        storeUrl: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_URL),
        storeImage: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE),
        storeName: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
        storePhone: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_PHONE),
        storeAddress: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS),
    },
    storeBranch: undefined,
    totalVATAmount: 0
}

const context = React.createContext(initState)

const actions = {
    setTotalVATAmount: (totalVatAmount) => ContextUtils.createAction('SET_TOTAL_VAT_AMOUNT', totalVatAmount),
    countProduct:(countTemp)=>ContextUtils.createAction('COUNT_PRODUCT',countTemp),
    addNewProduct: (product) => ContextUtils.createAction('ADD_NEW_PRODUCT', product),
    removeProduct: (productId) => ContextUtils.createAction('REMOVE_PRODUCT', productId),
    checkToggleProduct: (productId) => ContextUtils.createAction('CHECK_TOGGLE', productId),
    checkAllProduct: () => ContextUtils.createAction('CHECK_ALL_TOGGLE_PRODUCT', true),
    uncheckAllProduct: () => ContextUtils.createAction('CHECK_ALL_TOGGLE_PRODUCT', false),
    modifyProduct: (product) => ContextUtils.createAction('MODIFY_PRODUCT', product),
    applyMembership: (membershipDTO) => ContextUtils.createAction('APPLY_MEMBERSHIP', membershipDTO),
    clearMembership: () => ContextUtils.createAction('CLEAR_MEMBERSHIP'),
    applyPromotionCode: (promotionResponse) => ContextUtils.createAction('APPLY_PROMOTION_CODE', promotionResponse),
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
    getStoreInfo: () => ContextUtils.createAction('GET_STORE_INFO'),
    setStoreInfo: (storeInfo) => ContextUtils.createAction('SET_STORE_INFO', storeInfo),
    setOrderId: (orderId) => ContextUtils.createAction('SET_ORDER_ID', orderId),
    setPrintSizePage: (sizePage) => ContextUtils.createAction('SET_PRINT_SIZE_PAGE', sizePage),
    getStoreBranch: () => ContextUtils.createAction('GET_STORE_BRANCH'),
    setStoreBranch: (storeBranch) => ContextUtils.createAction('SET_STORE_BRANCH', storeBranch)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_TOTAL_VAT_AMOUNT': {
            return {
                ...state,
                totalVATAmount: action.payload
            }
        }
        case 'COUNT_PRODUCT':{
            return{
                ...state,
                countProductInCart:action.payload
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
            return {
                ...initState
            }
        }
        case 'ADD_NEW_PRODUCT': {
            const productNewList = _.cloneDeep(state.productList).filter(p => p.id !== action.payload)
            // check duplicate
            const productResponse = action.payload
            // console.log(productResponse)
            ItemService.fetch(productResponse.itemId).then(async result =>{
                if(!result.hasModel){
                    productResponse.remainItem=result.totalItem

                }
                else{
                    result.models.map(model=>{
                        if(model.id==Number (productResponse.modelId)){
                            productResponse.remainItem=model.totalItem
     

                        }
                    })
                }
            })
            // productResponse.remainItem=remainAProduct
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
        case 'REMOVE_PRODUCT':
            const productNewList = _.cloneDeep(state.productList).filter(p => p.id !== action.payload)
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
            for (const couponItem of promotion.couponItems) {
                let productIndex = _.findIndex(productNewList, p => {
                    if (couponItem.modelId) {
                        return p.id === couponItem.itemId + '-' + couponItem.modelId
                    }
                    return p.id == couponItem.itemId
                })
                if (productIndex > -1) {
                    productNewList[productIndex].promotion = {
                        couponId: promotion.couponId,
                        couponCode: promotion.couponCode,
                        couponType: promotion.couponType,
                        freeShipping: promotion.freeShipping,
                        couponItem: couponItem,
                    }
                }
            }
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
        default:
            return state;
    }
}

export const ContextQuotation = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
    METHOD,
    OPTION
}
