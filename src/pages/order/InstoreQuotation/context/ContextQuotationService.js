import {BCOrderService} from "../../../../services/BCOrderService";
import {QuotationInStoreRequestBuilder} from "../QuotationInStoreRequestBuilder";
import {METHOD, ContextQuotation} from "./ContextQuotation";
import {GSToast} from "../../../../utils/gs-toast";
import _ from 'lodash';
import {CouponTypeEnum} from "../../../../models/CouponTypeEnum";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/

/**
 * Update discount for promotion only
 * @param state
 * @param dispatch
 * @param productList
 */
const dispatchUpdateDiscountForNoneUser = (state, dispatch, productList) => {
    if (state.promotion) {
        BCOrderService.checkPromotionCode(productList.filter(p => p.checked).map(
            QuotationInStoreRequestBuilder.createPromotionItems
        ), state.promotion.couponCode, state.user.userId)
            .then(result => { // has promotion
                dispatch(ContextQuotation.actions.clearMembership());
                dispatch(ContextQuotation.actions.applyPromotionCode(result));
            })
            .catch(e => { // has no promotion
                if (state.promotion.couponCode) { // has previous
                    dispatch(ContextQuotation.actions.clearPromotionCode());
                }
                if (e && e.response && e.response.data && e.response.data.message) {
                    GSToast.error(e.response.data.message);
                } else {
                    GSToast.error("page.order.create.cart.promotionCode.invalid", true);
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
const dispatchUpdateDiscountForUser = (state, dispatch, productList) => {
    const {userId} = state.user;
    BCOrderService.checkWholeSale(productList.filter(p => p.checked).map(
        QuotationInStoreRequestBuilder.createPromotionItems
    ), userId)
        .then(async (result) => {
            // clear first
            if (state.productList.filter(p => !!p.wholeSale).length > 0) {
                dispatch(ContextQuotation.actions.clearWholeSale());
            }

            if (result.length > 0) { // => have wholesale
                // clear promotion and loyalty first
                dispatch(ContextQuotation.actions.clearPromotionCode());
                dispatch(ContextQuotation.actions.clearMembership());
                // apply wholesale
                dispatch(ContextQuotation.actions.applyWholeSale(result));
            } else { // => have no wholesale
                // apply normal promotion first
                if (state.promotion) {
                    dispatchUpdateDiscountForNoneUser(state, dispatch, productList);
                }
                // if (state.discountOption?.discount) {
                //     dispatch(ContextQuotation.actions.clearMembership());
                // }

                // if have no promotion or promotion is FREE_SHIPPING -> check membership
                if (!state.discountOption?.discount && (!state.promotion || (state.promotion && state.promotion.couponType === CouponTypeEnum.FREE_SHIPPING))) {
                    let membership = await BCOrderService.checkMembership(productList.filter(p => p.checked), userId)
                    if (membership && membership.enabledBenefit) {
                        dispatch(ContextQuotation.actions.applyMembership(membership))
                    }
                }


            }
        });
};

const dispatchUpdateProductList = (state, dispatch, productList) => {
    /*  If have user [ check ] -> wholesale -> membership -> promotion
        If have no user -> promotion

     */


    if (state.user && state.user.userId && state.user.userId !== -1) { // => check wholesale
        dispatchUpdateDiscountForUser(state, dispatch, productList);


    } else {
        if (state.productList.filter(p => !!p.wholeSale).length > 0) {
            dispatch(ContextQuotation.actions.clearWholeSale());
        }
        if (state.membership) {
            dispatch(ContextQuotation.actions.clearMembership());
        }
        dispatchUpdateDiscountForNoneUser(state, dispatch, productList);
    }
    BCOrderService.checkVAT(productList.filter(p => p.checked).map(
        QuotationInStoreRequestBuilder.createVATItems
    )).then(vatRes => {
        const totalVATAmount = vatRes.totalVATAmount || 0
        dispatch(ContextQuotation.actions.setTotalVATAmount(totalVATAmount))
    })
};


const calculateDiscountAmount = (_productList, promotion, membership) => {
    const productList = _.cloneDeep(_productList).filter(p => p.checked);
    let sum = 0;
    for (const product of productList) {
        const discountAmount = product.wholeSale ? product.wholeSale.discountAmount : product.promotion ? product.promotion.couponItem.promoAmount : 0;
        sum += discountAmount
    }

    // check membership
    if (membership && membership.enabledBenefit
        && ( (!promotion) || (promotion.couponType == CouponTypeEnum.FREE_SHIPPING)) ) {
        sum += membership.promoAmount;
    }

    return sum;
}

const calculateSubTotalPrice = (_productList, shippingInfo, promotion) => {
    const productList = _.cloneDeep(_productList).filter(p => p.checked);
    let sum = 0;
    for (const product of productList) {
        sum += product.price * product.quantity;
    }

    return sum + calculateShippingFee(shippingInfo, promotion);
};

const calculateTotalPrice = (productList, shippingInfo, promotion, membership, vat) => {
    const discountTotal = calculateDiscountAmount(productList, promotion, membership);
    const subTotal = calculateSubTotalPrice(productList, shippingInfo, promotion);
    const vatAmount = calculateVAT(vat)
    return subTotal - discountTotal + vatAmount;
}

const calculateVAT = (vat) => {
    return vat
}
const calculateShippingFee = (shippingInfo, promotion) => {
    if (!_.isEmpty(shippingInfo) && shippingInfo.method !== METHOD.IN_STORE) {
        if (promotion && promotion.couponType === CouponTypeEnum.FREE_SHIPPING) {
            if (promotion.feeShippingValue) {
                let feeShippingValue = parseInt(promotion.feeShippingValue);
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

export const ContextQuotationService = {
    dispatchUpdateProductList,
    dispatchUpdateDiscountForNoneUser,
    dispatchUpdateDiscountForUser,
    calculateSubTotalPrice,
    calculateTotalPrice,
    calculateDiscountAmount,
    calculateVAT,
};
