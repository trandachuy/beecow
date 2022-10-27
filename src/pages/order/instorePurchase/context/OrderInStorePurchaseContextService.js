import {BCOrderService} from '../../../../services/BCOrderService';
import {OrderInStorePurchaseRequestBuilder} from '../OrderInStorePurchaseRequestBuilder';
import {METHOD, OrderInStorePurchaseContext} from './OrderInStorePurchaseContext';
import {GSToast} from '../../../../utils/gs-toast';
import _ from 'lodash';
import {CouponTypeEnum} from '../../../../models/CouponTypeEnum';
import {OrderDetailUtils} from '../../../../utils/order-detail-utils';
import {CredentialUtils} from '../../../../utils/credential';
import i18next from '../../../products/SelectServiceModal/ServiceModal';
import Constants from '../../../../config/Constant';
import {ContextQuotation} from '../../InstoreQuotation/context/ContextQuotation';
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format'

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
            })),
            directDiscount: calculateDirectDiscount(productList, state.discountOption)
        })
            .then(result => {
                dispatch(OrderInStorePurchaseContext.actions.setLoyaltyPoint({
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
            OrderInStorePurchaseRequestBuilder.createPromotionItems
        ), state.promotion.couponCode, state.user.userId)
            .then(result => { // has promotion
                dispatch(OrderInStorePurchaseContext.actions.clearMembership());
                dispatch(OrderInStorePurchaseContext.actions.applyPromotionCode(result));
            })
            .catch(e => { // has no promotion
                if (state.promotion.couponCode) { // has previous
                    dispatch(OrderInStorePurchaseContext.actions.clearPromotionCode());
                }
                if (e && e.response && e.response.data && e.response.data.message) {
                    GSToast.error(e.response.data.message);
                } else {
                    GSToast.error('page.order.create.cart.promotionCode.invalid', true);
                }
            });
    }
};

/**
 * Update discount for wholesale, loyalty programs, promotion
 * @param state
 * @param dispatch
 * @param productList
 */
const dispatchUpdateDiscountForUser = (state, dispatch, productList, storeBranch) => {
    const { userId } = state.user;
    dispatch(OrderInStorePurchaseContext.actions.setProcessing(true));
    BCOrderService.checkWholeSale(productList.filter(p => p.checked).map(
        OrderInStorePurchaseRequestBuilder.createPromotionItems
    ), userId)
        .then(async (result) => {
            // clear first
            if (state.productList.filter(p => !!p.wholeSale).length > 0) {
                dispatch(OrderInStorePurchaseContext.actions.clearWholeSale());
            }

            if (state.discountOption?.discount) {
                dispatch(OrderInStorePurchaseContext.actions.clearMembership());
                dispatch(ContextQuotation.actions.clearPromotionCode())
                return
            }

            if (result.length > 0) { // => have wholesale
                // clear promotion and loyalty first
                dispatch(OrderInStorePurchaseContext.actions.clearPromotionCode());
                dispatch(OrderInStorePurchaseContext.actions.clearMembership());
                dispatch(
                    OrderInStorePurchaseContext.actions.applyDiscountCode({
                        discount: null,
                        type: Constants.DISCOUNT_OPTION.DISCOUNT_CODE
                    })
                )
                // apply wholesale
                dispatch(OrderInStorePurchaseContext.actions.applyWholeSale(result));

            } else { // => have no wholesale
                throw 'Wholesale not found'
            }
        })
        .catch(async e => {

            if (state.promotion) {
                dispatchUpdateDiscountForNoneUser(state, dispatch, productList);
            }

            // if have no promotion or promotion is FREE_SHIPPING -> check membership
            if (!_.isEmpty(productList) && (!state.promotion || (state.promotion && state.promotion.couponType === CouponTypeEnum.FREE_SHIPPING))) {
                const storeBranchId = storeBranch.value
                try {
                    let membership = await BCOrderService.checkMembership(productList.filter(p => p.checked), userId, storeBranchId)
                    if (membership && membership.enabledBenefit) {
                        dispatch(OrderInStorePurchaseContext.actions.applyMembership(membership))
                    }
                } catch (e) {

                }
            }

        })
        .finally(() => dispatch(OrderInStorePurchaseContext.actions.setProcessing(false)));
};

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
        dispatch(OrderInStorePurchaseContext.actions.modifyProduct(product))
    }

    dispatchUpdateProductList(state, dispatch, updateProductList, storeBranch)
}

const dispatchUpdateProductList = _.debounce((state, dispatch, productList, storeBranch) => {
    /*  If have user [ check ] -> wholesale -> membership -> promotion
        If have no user -> promotion

     */
    if (_.isEmpty(productList)) {
        dispatch(OrderInStorePurchaseContext.actions.clearEarnPoint());
    }

    if (state.user && state.user.userId && state.user.userId !== -1) { // => check wholesale
        dispatchUpdateDiscountForUser(state, dispatch, productList, storeBranch);
    } else {
        if (state.productList.filter(p => !!p.wholeSale).length > 0) {
            dispatch(OrderInStorePurchaseContext.actions.clearWholeSale());
        }
        if (state.membership) {
            dispatch(OrderInStorePurchaseContext.actions.clearMembership());
        }
        dispatchUpdateDiscountForNoneUser(state, dispatch, productList);
    }

    // VAT
    if (productList.filter(p => p.checked).length > 0) {
        BCOrderService.checkVAT(productList.filter(p => p.checked).map(
            OrderInStorePurchaseRequestBuilder.createVATItems
        )).then(vatRes => {
            const totalVATAmount = vatRes.totalVATAmount || 0
            dispatch(OrderInStorePurchaseContext.actions.setTotalVATAmount(totalVATAmount))
        })
    } else {
        // reset VAT
        dispatch(OrderInStorePurchaseContext.actions.setTotalVATAmount(0))
    }

}, 100);

const calculateDiscountAmount = (_productList, promotion, membership, discountOption) => {
    let totalDiscount = 0;
    const productList = _.cloneDeep(_productList).filter(p => p.checked);
    for (const product of productList) {
        const discountAmount = product.wholeSale ? product.wholeSale.discountAmount : product.promotion ? product.promotion.couponItem.promoAmount : 0;
        totalDiscount += discountAmount
    }

    const order = {
        orderInfo: {
            membershipInfo: membership,
            discount: promotion,
            totalDiscount: totalDiscount,
            discountAmount: totalDiscount,
            discountOption: +(discountOption?.discount),
            subTotal: calculateSubTotalPrice(productList)
        },
        items: []
    }

    return OrderDetailUtils.calcOrderDiscount(order)
}

const calculateDirectDiscount = (_productList, discountOption) => {
    const order = {
        orderInfo: {
            discountOption: +(discountOption?.discount),
            subTotal: calculateSubTotalPrice(_productList)
        },
        items: []
    }

    return OrderDetailUtils.calcOrderDiscount(order)
}

const calculateSubTotalPrice = (_productList) => {
    const productList = _.cloneDeep(_productList).filter(p => p.checked);
    let sum = 0;
    for (const product of productList) {
        sum += product.price * product.quantity;
    }

    return sum
};

const calculateMaxUsePoint = (productList, shippingInfo, promotion, membership, vat, availablePoint, exchangeAmount) => {
    const preTotalPrice = calculatePreTotalPrice(productList, shippingInfo, promotion, membership, vat);
    let maxPointOrder = _.floor(preTotalPrice / exchangeAmount, 0);
    return (maxPointOrder > availablePoint) ? availablePoint : maxPointOrder;
}

const calculatePreTotalPrice = (productList, shippingInfo, promotion, membership, vat, discountOption) => {
    const discountTotal = calculateDiscountAmount(productList, promotion, membership, discountOption);
    const subTotal = calculateSubTotalPrice(productList);
    const vatAmount = calculateVAT(vat)
    const shippingFee = calculateShippingFee(shippingInfo, promotion)
    return subTotal - discountTotal + vatAmount + shippingFee;
}

const calculateTotalPrice = (productList, shippingInfo, promotion, membership, vat, pointAmount, discountOption) => {
    const preTotalPrice = calculatePreTotalPrice(productList, shippingInfo, promotion, membership, vat, discountOption);
    const totalPrice = parseFloat(preTotalPrice - (pointAmount || 0))
    return totalPrice > 0 ? totalPrice : 0;
}

const getTotalPrice = (state) => {
    const { productList, shippingInfo, promotion, membership, totalVATAmount, pointAmount } = state
    return calculateTotalPrice(productList, shippingInfo, promotion, membership, totalVATAmount, pointAmount)
}

const calculateVAT = (vat) => {
    return vat || 0
}

const calculateShippingFee = (shippingInfo, promotion) => {
    if (!_.isEmpty(shippingInfo) && shippingInfo.method !== METHOD.IN_STORE) {
        if (promotion && promotion.couponType === CouponTypeEnum.FREE_SHIPPING) {
            if (promotion.feeShippingValue) {
                let feeShippingValue = parseFloat(promotion.feeShippingValue);
                return feeShippingValue >= shippingInfo.amount ? 0 : (shippingInfo.amount - feeShippingValue);
            } else {
                return 0;
            }
        } else {
            return shippingInfo.amount;
        }
    } else {
        return 0;
    }
};

const calculateChangeAmount = (productList, shippingInfo, promotion, membership, taxAmount, pointAmount, paidAmount, discountOption) => {
    const totalPrice = NumberUtils.formatThousandFixed(calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption),2,true)

    const changeAmount =CredentialUtils.getStoreCurrencySymbol() === Constants.CURRENCY.VND.SYMBOL ?
        paidAmount - totalPrice : parseFloat(paidAmount - totalPrice).toFixed(2)

    return paidAmount < totalPrice ? 0 : changeAmount
}

/**
 * @param {InStoreProduct[]} productList
 * @return {*}
 */
const countProductList = (productList) => {
    return productList.map(product => parseInt(product.quantity)).reduce((sum, next) => sum + next, 0)
}

const calculatePayableAmount = (totalPrice, orderDebt, customerDebtAmount = 0, isUsedDelivery) => {
    if (!customerDebtAmount) customerDebtAmount = 0
    if (isUsedDelivery) {
        return totalPrice + orderDebt + customerDebtAmount
    } else {
        return orderDebt + customerDebtAmount
    }
}

const calculateDebtAmount = (totalPrice, paidAmount, isUsedDelivery) => {
    if (isUsedDelivery) {
        return 0 - paidAmount
    } else {
        if (paidAmount > totalPrice){
            return 0
        } else {
            return totalPrice - paidAmount
        }
    }
}

const calculateCustomerDebtAmount = (debtAmount, customerDebtAmount) => {
    if (!customerDebtAmount) customerDebtAmount = 0
    return debtAmount + customerDebtAmount
}

export const OrderInStorePurchaseContextService = {
    dispatchUpdateProductList,
    dispatchUpdateDiscountForNoneUser,
    dispatchUpdateDiscountForUser,
    dispatchUpdateOutOfStockProduct,
    calculateSubTotalPrice,
    calculateTotalPrice,
    calculateDiscountAmount,
    calculateDirectDiscount,
    calculateVAT,
    calculateLoyaltyEarnPoint,
    calculateMaxUsePoint,
    countProductList,
    calculateShippingFee,
    calculateChangeAmount,
    getTotalPrice,
    calculatePayableAmount,
    calculateDebtAmount,
    calculateCustomerDebtAmount
};
