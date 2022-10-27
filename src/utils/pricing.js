/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const calculateDiscount = (orgPrice, newPrice) => {
    let rawDiscount = (orgPrice - newPrice) / orgPrice * 100;
    return roundPercentNum(rawDiscount);
}

const roundPercentNum = (rawNumber) => {
    let roundedNumber = 0;
    if (0 < rawNumber && rawNumber < 1) {
        roundedNumber = 1;
    } else if (99 < rawNumber && rawNumber < 100) {
        roundedNumber = 99;
    } else {
        roundedNumber = Math.round(rawNumber);
    }
    return roundedNumber || 0;
}

export const PricingUtils = {
    calculateDiscount,
    roundPercentNum
}