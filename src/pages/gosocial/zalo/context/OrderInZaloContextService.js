import {BCOrderService} from '../../../../services/BCOrderService'
import {OrderInZaloContext} from './OrderInZaloContext'
import {GSToast} from '../../../../utils/gs-toast'
import _ from 'lodash'
import {CouponTypeEnum} from '../../../../models/CouponTypeEnum'
import {CredentialUtils} from '../../../../utils/credential'
import {OrderInZaloRequestBuilder} from '../OrderInZaloRequestBuilder'
import i18next from 'i18next'
import zaloService from '../../../../services/ZaloService';
import {AddressUtils} from '../../../../utils/address-utils'

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
/**
 * @typedef {Object} ProductModel
 * @property {String} barcode
 * @property {Number} branchId
 * @property {String} checked
 * @property {String} currency
 * @property {String} dateSelected
 * @property {String} id
 * @property {String} image
 * @property {String} itemId
 * @property {String} itemImage
 * @property {String} itemStock
 * @property {String} modelId
 * @property {String} modelStock
 * @property {String} name
 * @property {String} price
 * @property {Number} quantity

 */

const calculateLoyaltyEarnPoint = (state, dispatch, productList, userId, coupon, loyaltySetting, storeBranch) => {
    if (loyaltySetting.enabledPoint && userId) {

        BCOrderService.calculateLoyaltyEarnPoint({
            storeId: CredentialUtils.getStoreId(),
            langKey: CredentialUtils.getLangKey(),
            platform: 'IN_STORE',
            userId: userId,
            earnPointType: 'IN_STORE',
            coupon: coupon,
            usePoint: loyaltySetting.isUsePointEnabled && state.usePoint > 0 && state.usePoint <= state.maxUsePoint ? state.usePoint : null,
            earnPointItems: productList.filter(p => p.checked).map(product => ({
                itemId: product.itemId,
                modelId: !_.isEmpty(product.modelId) ? product.modelId : null,
                price: product.price,
                quantity: product.quantity,
                branchId: storeBranch.value,
                wholesalePricingId: product.wholesalePricingId
            }))
        })
            .then(result => {
                dispatch(OrderInZaloContext.actions.setLoyaltyPoint({
                    earnPoint: parseInt(result.earnPoint),
                    missingAmount: result.earnPoint === 0 ? result.itemPoints[0].missingAmount : 0,
                    ratePoint: result.earnPoint === 0 ? result.itemPoints[0].ratePoint : 0
                }))
            })
            .catch(() => {
                GSToast.error(i18next.t('common.api.failed'))
            })
    }
}

/**
 * Update discount for promotion only
 * @param state
 * @param dispatch
 * @param productList
 */
const dispatchUpdateDiscountForNoneUser = (state, dispatch, productList) => {
    if (state.promotion) {
        BCOrderService.checkPromotionCode(productList.filter(p => p.checked).map(
            OrderInZaloRequestBuilder.createPromotionItems
        ), state.promotion.couponCode, state.user.userId)
            .then(result => { // has promotion
                dispatch(OrderInZaloContext.actions.clearMembership())
                dispatch(OrderInZaloContext.actions.applyPromotionCode(result))
            })
            .catch(e => { // has no promotion
                if (state.promotion.couponCode) { // has previous
                    dispatch(OrderInZaloContext.actions.clearPromotionCode())
                }
                if (e && e.response && e.response.data && e.response.data.message) {
                    GSToast.error(e.response.data.message)
                } else {
                    GSToast.error('page.order.create.cart.promotionCode.invalid', true)
                }
            })
    }
}

/**
 * Update discount for wholesale, loyalty programs, promotion
 * @param state
 * @param dispatch
 * @param productList
 */
const dispatchUpdateDiscountForUser = (state, dispatch, productList, storeBranch) => {
    const { userId } = state.user
    BCOrderService.checkWholeSale(productList.filter(p => p.checked).map(
        OrderInZaloRequestBuilder.createPromotionItems
    ), userId)
        .then(async (result) => {
            // clear first
            if (state.productList.filter(p => !!p.wholeSale).length > 0) {
                dispatch(OrderInZaloContext.actions.clearWholeSale())
            }

            if (result.length > 0) { // => have wholesale
                // clear promotion and loyalty first
                dispatch(OrderInZaloContext.actions.clearPromotionCode())
                dispatch(OrderInZaloContext.actions.clearMembership())
                // apply wholesale
                dispatch(OrderInZaloContext.actions.applyWholeSale(result))

            } else { // => have no wholesale
                throw 'Wholesale not found'
            }
        })
        .catch(async e => {

            if (state.promotion) {
                dispatchUpdateDiscountForNoneUser(state, dispatch, productList)
            }

            // if have no promotion or promotion is FREE_SHIPPING -> check membership
            if (!_.isEmpty(productList) && (!state.promotion || (state.promotion && state.promotion.couponType === CouponTypeEnum.FREE_SHIPPING))) {
                const storeBranchId = storeBranch.value
                try {
                    let membership = await BCOrderService.checkMembership(productList.filter(p => p.checked), userId, storeBranchId)
                    if (membership && membership.enabledBenefit) {
                        dispatch(OrderInZaloContext.actions.applyMembership(membership))
                    }
                } catch (e) {

                }
            }

        })
}

/**
 *
 * @param state
 * @param dispatch
 * @param {ProductModel[]} outOfStockProductList
 * @param {ProductModel[]} productList
 */
const dispatchUpdateOutOfStockProduct = (state, dispatch, outOfStockProductList, productList, storeBranch) => {
    // quantity in outOfStockProduct is remaining stock
    // update quantity to itemStock
    let updateProductList = _.cloneDeep(productList)
    for (let product of updateProductList) {
        const outOfStockProduct = outOfStockProductList.find(({ id }) => id === product.id)
        if (outOfStockProduct) {
            product.itemStock = outOfStockProduct.quantity
        }
        dispatch(OrderInZaloContext.actions.modifyProduct(product))
    }

    dispatchUpdateProductList(state, dispatch, updateProductList, storeBranch)
}

const dispatchUpdateProductList = _.debounce((state, dispatch, productList, storeBranch) => {
    /*  If have user [ check ] -> wholesale -> membership -> promotion
        If have no user -> promotion

     */
    if (_.isEmpty(productList)) {
        dispatch(OrderInZaloContext.actions.clearEarnPoint())
    }

    if (state.user && state.user.userId && state.user.userId !== -1) { // => check wholesale
        dispatchUpdateDiscountForUser(state, dispatch, productList, storeBranch)


    } else {
        if (state.productList.filter(p => !!p.wholeSale).length > 0) {
            dispatch(OrderInZaloContext.actions.clearWholeSale())
        }
        if (state.membership) {
            dispatch(OrderInZaloContext.actions.clearMembership())
        }
        dispatchUpdateDiscountForNoneUser(state, dispatch, productList)
    }

    // VAT
    if (productList.filter(p => p.checked).length > 0) {
        BCOrderService.checkVAT(productList.filter(p => p.checked).map(
            OrderInZaloRequestBuilder.createVATItems
        )).then(vatRes => {
            const totalVATAmount = vatRes.totalVATAmount || 0
            dispatch(OrderInZaloContext.actions.setTotalVATAmount(totalVATAmount))
        })
    } else {
        // reset VAT
        dispatch(OrderInZaloContext.actions.setTotalVATAmount(0))
    }

}, 100);


const calculateDiscountAmount = (productList, discount) => {
    const subTotal = calculateSubTotalPrice(productList)

    if (discount?.method == 'VALUE') {
        return discount?.amount > subTotal ? subTotal : discount?.amount
    } else {
        return (discount?.amount / 100) * calculateSubTotalPrice(productList)
    }
}

const calculateSubTotalPrice = (_productList) => {
    const productList = _.cloneDeep(_productList).filter(p => p.checked)
    let sum = 0
    for (const product of productList) {
        sum += product.price * product.quantity
    }

    return sum
}

const calculateMaxUsePoint = (productList, shippingInfo, promotion, membership, vat, availablePoint, exchangeAmount) => {
    const preTotalPrice = calculatePreTotalPrice(productList, shippingInfo, promotion, membership, vat)
    let maxPointOrder = _.floor(preTotalPrice / exchangeAmount, 0)
    return (maxPointOrder > availablePoint) ? availablePoint : maxPointOrder
}

const calculatePreTotalPrice = (productList, shippingInfo, promotion, membership, vat, discount) => {
    const discountTotal = calculateDiscountAmount(productList, discount)
    const subTotal = calculateSubTotalPrice(productList)
    const vatAmount = calculateVAT(vat)
    const shippingFee = calculateShippingFee(shippingInfo, promotion)

    return subTotal - discountTotal + vatAmount + shippingFee
}

const calculateTotalPrice = (productList, shippingInfo, promotion, membership, vat, pointAmount, discount) => {
    const preTotalPrice = calculatePreTotalPrice(productList, shippingInfo, promotion, membership, vat, discount)
    return preTotalPrice - (pointAmount || 0)
}
const calculateVAT = (vat) => {
    return vat || 0
}


const calculateShippingFee = (shippingInfo, promotion) => {
    if (!_.isEmpty(shippingInfo)) {
        return shippingInfo.amount
    } else {
        return 0
    }
}

/**
 * @param {InStoreProduct[]} productList
 * @return {*}
 */
const countProductList = (productList) => {
    return productList.map(product => parseInt(product.quantity)).reduce((sum, next) => sum + next, 0)
}

const sendOrderSummaryMessage = (state, dispatch, fileUrl) => {
    const clientId = state.currentConversation.userPage
    const oaId = state.zaloOAUserDetail['oa_id']
    const OAAccountAvatar = state.zaloOAUserDetail.avatar
    const messageValue = {
        'type': 'template',
        'payload': {
            'template_type': 'list',
            'elements': [
                {
                    'title': i18next.t('component.orderSummaryTemplate.title', { orderId: state.orderId }),
                    'subtitle': i18next.t('component.orderSummaryTemplate.subtitle'),
                    'image_url': 'https://dm4fv4ltmsvz0.cloudfront.net/storefront-images/zalo-order-summary.png',
                    'default_action': {
                        'type': 'oa.open.url',
                        'url': fileUrl
                    }
                },
                {
                    'title': i18next.t('component.orderSummaryTemplate.viewMore'),
                    'image_url': OAAccountAvatar,
                    'default_action': {
                        'type': 'oa.open.url',
                        'url': fileUrl
                    }
                }
            ]
        }
    }

    const requestBody = {
        message: {
            attachment: messageValue
        },
        recipient: {
            user_id: clientId,
        }
    }

    return zaloService.sendMessage(oaId, requestBody)
        .catch(() => {
            console.error('Error when send summary order message')
            GSToast.commonError()
        })
}

const updateShippingInfo = (state, dispatch, shippingInfo) => {
    return AddressUtils.buildAddress(shippingInfo.address1, shippingInfo.district, shippingInfo.ward, shippingInfo.country, {fullAddress: false})
        .then(addressObj => {
            dispatch(OrderInZaloContext.actions.setShippingInfo({
                ...shippingInfo,
                ...addressObj
            }))
        })
}

export const OrderInZaloContextService = {
    dispatchUpdateProductList,
    dispatchUpdateDiscountForNoneUser,
    dispatchUpdateDiscountForUser,
    dispatchUpdateOutOfStockProduct,
    calculateSubTotalPrice,
    calculateTotalPrice,
    calculateDiscountAmount,
    calculateVAT,
    calculateLoyaltyEarnPoint,
    calculateMaxUsePoint,
    countProductList,
    calculateShippingFee,
    sendOrderSummaryMessage,
    updateShippingInfo
}
