/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import i18next from "i18next";
import {CurrencyUtils} from "../utils/number-format";
import _ from 'lodash'
import {CurrencySymbol} from "../components/shared/form/CryStrapInput/CryStrapInput";
import Constants from "./Constant";
import {CredentialUtils} from "../utils/credential";


/**
 * Make this field required
 * @param errMessage
 * @return {{required: {errorMessage: string, value: boolean}}}
 */
const required = (errMessage = "common.validation.required") => {
    return {
        required: {
            value: true,
            errorMessage: i18next.t(errMessage)
        }
    }
}

const maxLength = (max,thousandFormat = false, errMessage = "common.validation.char.max.length") => {
    return {
        maxLength: {
            value: max,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(max):max})
        }
    }
}

const minLength = (min,thousandFormat = false, errMessage = "common.validation.char.min.length") => {
    return {
        minLength: {
            value: min,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(min):min})
        }
    }
}

const minValue = (min, thousandFormat = false, errMessage = "common.validation.number.min.value", symbol = '') => {
    return {
        min: {
            value: min,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(min,symbol):min})
        }
    }
}

const minMaxValue = (min, max, thousandFormat = false, errMessage = "page.orders.returnOrder.detail.minMax",symbol = '') => {
    return {
        min: {
            value: min,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(min,symbol):min,y:CurrencyUtils.formatThousand(max,symbol)})
        }
    }
}

const maxValue = (max, thousandFormat = false, errMessage = "common.validation.number.max.value", symbol = '') => {

    return {
        max: {
            value: max,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(max, symbol):max})
        }
    }
}

const maxMinValue = (max,min, thousandFormat = false, errMessage = "page.orders.returnOrder.detail.minMax",symbol = '') => {

    return {
        max: {
            value: max,
            errorMessage: i18next.t(errMessage, {y:thousandFormat? CurrencyUtils.formatThousand(max,symbol):max,x:CurrencyUtils.formatThousand(min,symbol)})
        }
    }
}

const maxValueMoney = (max,currency = Constants.CURRENCY.VND.SYMBOL, thousandFormat = false, errMessage = "common.validation.number.max.value") => {

    return {
        max: {
            value: max,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(max):CurrencyUtils.formatMoneyByCurrency(max, currency)})
        }
    }
}

const maxValueAvailableStock = (max, thousandFormat = false, errMessage = "common.validation.number.max.availableStock") => {

    return {
        max: {
            value: max,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(max):max})
        }
    }
}

const maxValueQuantityExceed = (max, thousandFormat = false, errMessage = "common.validation.number.max.quantityExceed") => {

    return {
        max: {
            value: max,
            errorMessage: i18next.t(errMessage, {x:thousandFormat? CurrencyUtils.formatThousand(max):max})
        }
    }
}

const minMaxValueMoney = (min, max, currency = Constants.CURRENCY.VND.SYMBOL, thousandFormat = false, errMessage = "page.orders.returnOrder.detail.minimum.currency") => {
    let minValue = min
    let maxValue = max
    if(thousandFormat){
        minValue = CurrencyUtils.formatThousand(min)
        maxValue = CurrencyUtils.formatThousand(maxValue)
    }else{
        minValue = CurrencyUtils.formatMoneyByCurrency(min, currency)
        minValue = CurrencyUtils.formatMoneyByCurrency(max, currency)
    }
    return {
        min: {
            value: min,
            errorMessage: i18next.t(errMessage, {x: minValue, y: maxValue, z: currency })
        }
    }
}

const email = (errMessage =  "common.validation.email") => {
    return {
        email: {
            value: true,
            errorMessage: i18next.t(errMessage)
        }
    }
}

const number = (errMessage =  "common.validation.number.format") => {
    return {
        number: {
            value: true,
            errorMessage: i18next.t(errMessage)
        }
    }
}

const integerNumber = (errMessage =  "common.validation.number.int.format") => {
    return customPattern('^[0-9]+$', errMessage)
}

const integerNumberVATOfStore = (errMessage =  "common.validation.number.int.format") => {
    if (CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM) {
        return customPattern('^[0-9]+$', errMessage)
    }
}

const customPattern = (pattern, errMessage= "common.validation.fields.invalid") => {
    return async((value, ctx, input, cb) => {
        if (!value || (value + '').match(pattern)) {
            cb(true)
        } else {
            cb(i18next.t(errMessage))
        }
    })
}

const phoneNumber =(errMessage = "widget.phonenumber.validate.invalid")=>{
    return customPattern(
        '^[0-9]{10,13}$',
        errMessage
    )
}

const letterNumberPattern = (errMessage = "common.validation.number.and.character") => {
    return customPattern(
        '^[A-Za-z0-9]+$',
        errMessage
    )
}

const numberOrEnterPattern = (errMessage = "common.validation.number.format") => {
    return customPattern(
        '^[0-9\n]+$',
        errMessage
    )
}

const numberOrEnterOrPlusPattern = (errMessage = "common.validation.number.format") => {
    return customPattern(
        '^[0-9\n\+]+$',
        errMessage
    )
}

const letterNumberHyphenPattern = (errMessage = "common.validation.number.and.character.and.hyphen") => {
    return customPattern(
        '^[A-Za-z0-9-]+$',
        errMessage
    )
}
const letterNumberHyphenOrDotPattern = (errMessage = "common.validation.number.and.character.and.hyphen.and.dot") => {
    return customPattern(
        '^[A-Za-z0-9-.]*$',
        errMessage
    )
}

const letterPattern = (errMessage = 'common.validation.character') => {
    return customPattern(
        /^[^0-9!@#$%^&*()<>?:"{}+_/.,';\]\[=\\\-|]*$/,
        errMessage
    )
}

/**
 * Toggle validate by condition
 * @param condition
 * @param validate
 * @return {{}|*}
 */
const withCondition = (condition, validate) => {
    if (condition) {
        return validate
    } else {
        return {}
    }
}

const async = (fn, debounceTime = 300) => {
    return {
        async: _.debounce(fn, debounceTime)
    }
}

const match = (matchedFieldName, errMessage = "common.validation.fields.invalid") => {
    return {
        match: {
            value: matchedFieldName,
            errorMessage: i18next.t(errMessage)
        }
    }
}

const maxChecked = (maxOptions, thousandFormat = true,  errMessage = "common.validation.max.checked") => {
    return maxValue(maxOptions, thousandFormat, errMessage)
}

const minChecked = (minOptions, thousandFormat = true,  errMessage = "common.validation.min.checked") => {
    return minValue(minOptions, thousandFormat, errMessage)
}


const step = (step, errMessage = "common.validation.fields.invalid") => {
    return {
        step: {
            value: step,
            errorMessage: i18next.t(errMessage)
        }
    }
}


export const FormValidate = {
    required,
    minLength,
    maxLength,
    maxValue,
    minValue,
    email,
    number,
    withCondition,
    async,
    match,
    maxChecked,
    minChecked,
    step,
    integerNumber,
    integerNumberVATOfStore,
    maxValueMoney,
    minMaxValueMoney,
    maxValueAvailableStock,
    maxValueQuantityExceed,
    minMaxValue,
    maxMinValue,
    pattern: {
        custom: customPattern,
        letter: letterPattern,
        letterOrNumber: letterNumberPattern,
        phoneNumber : phoneNumber,
        letterOrNumberOrHyphen: letterNumberHyphenPattern,
        letterOrNumberOrHyphenOrDot: letterNumberHyphenOrDotPattern,
        numberOrEnter: numberOrEnterPattern,
        numberOrEnterOrPlus: numberOrEnterOrPlusPattern,
        domain: customPattern('^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$', 'page.landingPage.editor.save.invalidDomain')
    }
}
