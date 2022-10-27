/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import CouponEditor from "../Editor/CouponEditor"
import WholeSaleEditor from "../Editor/WholeSaleEditor"
import {CurrencyUtils} from "../../../../utils/number-format";

export const DiscountEditorMode = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}

export const DISCOUNT_TYPES = {
    // new enum
    PROMOTION_PRODUCT: 'COUPON',
    PROMOTION_SERVICE: 'COUPON_SERVICE',
    WHOLESALE_PRODUCT: 'WHOLE_SALE',
    WHOLESALE_SERVICE: 'WHOLE_SALE_SERVICE',
}

const DiscountEditor = props => {

    const {mode, discountType, ...other} = props

    // old enum

    switch (props.discountType) {
        case DISCOUNT_TYPES.WHOLESALE_SERVICE:
        case DISCOUNT_TYPES.WHOLESALE_PRODUCT:
            return <WholeSaleEditor mode={props.mode} type={discountType} {...other}/>
        case DISCOUNT_TYPES.PROMOTION_PRODUCT:
        case DISCOUNT_TYPES.PROMOTION_SERVICE:
            return <CouponEditor mode={props.mode} type={discountType} {...other}/>
        default:
            return null
    }
    
};

DiscountEditor.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
}

DiscountEditor.propTypes = {
    mode: PropTypes.oneOf(Object.values(DiscountEditorMode)),
    currency: PropTypes.string
};

export default DiscountEditor;
