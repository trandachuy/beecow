/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import CouponDetail from "../Detail/CouponDetail"
import WholeSaleDetail from "../Detail/WholeSaleDetail"
import {DISCOUNT_TYPES} from "../DiscountEditor/Editor/DiscountEditor";
import PropTypes from "prop-types";
import { CurrencyUtils } from '../../../utils/number-format';

const DiscountDetail = props => {

    const {...other} = props
    const {discountsType} = props.match.params

    switch (discountsType) {
        case DISCOUNT_TYPES.WHOLESALE_PRODUCT:
            case DISCOUNT_TYPES.WHOLESALE_SERVICE:
            return <WholeSaleDetail itemId={props.match.params.itemId} {...other}/>
        case DISCOUNT_TYPES.PROMOTION_PRODUCT:
        case DISCOUNT_TYPES.PROMOTION_SERVICE:
            return <CouponDetail itemId={props.match.params.itemId} type={discountsType} {...other} />
        default:
            return null
    }
};

DiscountDetail.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
};

DiscountDetail.propTypes = {
    children: PropTypes.any,
    couponId: PropTypes.any,
    mode: PropTypes.any,
    type: PropTypes.string,
    currency: PropTypes.string
};

export default DiscountDetail;
