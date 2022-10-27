/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 04/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import * as accounting from 'accounting-js';
import i18next from "i18next";
import Constants from "../config/Constant";
import {CredentialUtils} from "./credential";

const currencyTable = {
"XAF": "FCFA",
"GMD": "D",
"GEL": "ლ",
"GTQ": "Q",
"GNF": "FG",
"GYD": "$",
"HTG": "G",
"HNL": "L",
"HKD": "$",
"HUF": "Ft",
"ISK": "kr",
"INR": "₹",
"IDR": "Rp",
"IRR": "﷼",
"IQD": "د.ع",
"JMD": "J$",
"JPY": "¥",
"JOD": "ا.د",
"KZT": "лв",
"KES": "KSh",
"KGS": "лв",
"LAK": "₭",
"LBP": "£",
"LSL": "L",
"LRD": "$",
"LYD": "د.ل",
"MOP": "$",
"MKD": "ден",
"MGA": "Ar",
"MWK": "MK",
"MYR": "RM",
"MVR": "Rf",
"MUR": "₨",
"MXN": "$",
"MDL": "L",
"MNT": "₮",
"MZN": "MT",
"MMK": "K",
"NAD": "$",
"NPR": "₨",
"NIO": "C$",
"NGN": "₦",
"OMR": ".ع.ر",
"PKR": "₨",
"ILS": "₪",
"PAB": "B/.",
"PGK": "K",
"PYG": "₲",
"PEN": "S/.",
"PHP": "₱",
"PLN": "zł",
"CUC": "$",
"DZD": "دج",
"AOA": "Kz",
"ARS": "$",
"AZN": "m",
"BDT": "৳",
"BOB": "Bs.",
"BRL": "R$",
"CAD": "$",
"CLP": "$",
"CNY": "¥",
"COP": "$",
"CRC": "₡",
"CZK": "Kč",
"DOP": "$",
"EGP": "ج.م",
"ETB": "Nkf",
"GHS": "GH₵",
"DKK": "Kr.",
"SVC": "₡",
"AFN": "؋",
"ALL": "Lek",
"AMD": "֏",
"BSD": "B$",
"BHD": ".د.ب",
"BWP": "P",
"BND": "B$",
"BGN": "Лв.",
"BIF": "FBu",
"KHR": "KHR",
"CVE": "$",
"KYD": "$",
"KMF": "CF",
"CDF": "FC",
"DJF": "Fdj",
"ERN": "Nfk",
"FJD": "FJ$",
"QAR": "ق.ر",
"RON": "lei",
"RUB": "₽",
"RWF": "FRw",
"SAR": "﷼",
"RSD": "din",
"SCR": "SRe",
"SLL": "Le",
"SGD": "$",
"SOS": "Sh.so.",
"ZAR": "R",
"KRW": "₩",
"SSP": "£",
"LKR": "Rs",
"SDG": ".س.ج",
"SRD": "$",
"NOK": "kr",
"SZL": "E",
"SEK": "kr",
"CHF": "CHf",
"SYP": "LS",
"TWD": "$",
"TJS": "SM",
"TZS": "TSh",
"THB": "฿",
"XOF": "CFA",
"NZD": "$",
"TTD": "$",
"TND": "ت.د",
"TRY": "₺",
"TMT": "T",
"AUD": "$",
"UGX": "USh",
"UAH": "₴",
"AED": "إ.د",
"GBP": "£",
"UZS": "лв",
"EUR": "€",
"VND": "₫",
"USD": "$",
"XPF": "₣",
"MAD": "MAD",
"YER": "﷼",
}

const unitFormat = (postFix) => {
    return {
        symbol: postFix,
        thousand: ',',
        decimal: '.',
        precision: isCurrencySymbol(postFix) ? 0 : 2,
        format: isCurrencySymbol(postFix)  ? "%v%s" : "%s%v"
    }
}

const isCurrencySymbol = (symbol) =>{
    return symbol === '' || symbol === Constants.CURRENCY.VND.SYMBOL
}


const formatMoneyVND = (number) => {
    if (isNaN(number)) {
        number = 0
    }
    return accounting.formatMoney(number, unitFormat('₫'))
}

const formatMoney = (number) => {
    if (isNaN(number)) {
        number = 0
    }
    return accounting.formatMoney(number, unitFormat(''))
}

const formatMoneyByCurrency = (number, currency) => {
    if (isNaN(number)) number = 0
    if (currency === 'VND') currency = 'đ'
    number = formatThousandFixed(number, 2,true)
    return accounting.formatMoney(number, unitFormat(currency))
}

const formatMoneyByCurrencyWithPrecision = (number, currency, precision) => {
    const opts = {
        symbol: currency,
        thousand: ',',
        precision: precision,
        format: "%s%v"
    }

    if (isNaN(number)) {
        number = 0
    }
    if(currency !== Constants.CURRENCY.VND.SYMBOL && currency !== Constants.CURRENCY.VND.SYMBOL2){
        opts.symbol = currency
        opts.format = "%s%v"
    }else{
        opts.symbol = Constants.CURRENCY.VND.SYMBOL
        opts.precision = 0
        opts.format = "%v%s"
    }
    return accounting.formatMoney(number, opts)
}

/**
 * @description Format number to thousands
 *              Examples:
 *              1000 -> 1,000
 *              10000 -> 10,000
 *              1000000 -> 1,000,000
 */
const formatThousand = (number,unit='') => {
    
    return accounting.formatMoney(number, unitFormat(unit))
}

/**
 * @description Format number to thousands character
 *              Examples:
 *              1000 -> 1K
 *              10000 -> 10K
 *              1000000 -> 1M | 1Tr
 */
const formatThousandBreak = (number, precision = 0, isShowSuffix = true) => {
    if (number == 0) return 0
    if (number < 1000) return number
    let locate = i18next.language
    let decimal
    const M = 1000000
    const K = 1000
    const Msuffix = locate === 'vi'? 'Tr':'M'
    let unitFormat = {
        thousand: ',',
        precision: precision,
        decimal: '.',
        format: "%v%s",
        symbol:''
    }
    if (number >= M) { // M case
        decimal = number / M
        unitFormat.symbol = Msuffix
    } else {
        if (number >= K) { // K case
            decimal = number / K
            unitFormat.symbol = 'K'
        } else {
            decimal = number
        }
    }
    return accounting.formatNumber(decimal, unitFormat) + (isShowSuffix? unitFormat.symbol:'')
}

/**
 * @description Format number to thousands and fix to precision
 *              Examples:
 *              1000.1111 2 -> 1,000.11
 *              10000.6666 2 -> 10,000.66
 *              1000000 -> 1,000,000
 */
const formatThousandFixed = (number, precision, noThousandBreak) => {
    return _.flow(
        _.partialRight(truncateNumberDecimal, precision),
        _.partialRight(accounting.formatNumber, {
            thousand: noThousandBreak ? '': ',',
            precision: precision,
            decimal: '.'
        }),
        removeZeroTrailing
    )(number)
}

const toFixed = (number, precision) => {
    return accounting.toFixed(number, precision)
}

const truncateNumberDecimal = (number, precision) => {
    return String(number).replace(RegExp(`(\\d+\\.?\\d{0,${ precision }})\\d*$`, 'g'), '$1')
}

const removeZeroTrailing = (number) => {
    const countryCode = getLocalStorageCountry()

    if (countryCode === 'VN'){
        return String(number).replace(/((\.\d*?[1-9])|\.)0+$/g, '$2')
    } else {
        return String(number)
    }
}

/**
 * @deprecated using CredentialUtils.getStoreCountryCode() instead
 */
const getLocalStorageCountry = () =>{
    return CredentialUtils.getStoreCountryCode()
}

/**
 * @deprecated using CredentialUtils.getStoreCurrencyCode() instead
 */
const getLocalStorageCurrency = () =>{
    return CredentialUtils.getStoreCurrencyCode()
}

/**
 * @deprecated using CredentialUtils.getStoreCurrencySymbol() instead
 */
const getLocalStorageSymbol = () =>{
    return CredentialUtils.getStoreCurrencySymbol()
}

const isPosition = (position) =>{
    return  position === Constants.CURRENCY.VND.SYMBOL || position === Constants.CURRENCY.VND.SYMBOL2 ? 'right' : 'left'
}

const isCurrencyInput = (position) => {
    return  position !== Constants.CURRENCY.VND.SYMBOL && position !== Constants.CURRENCY.VND.SYMBOL2
}

const formatTwoDecimal = (number) => {
    return number = Math.floor(number * 100) / 100
}

const formatNegativeToInteger  = (number) =>{
    return Math.abs(+(number))
}

const formatPrecisionByCurrency = (number) => {
    if (CredentialUtils.getCurrencyCode() === "VND") {
        return formatThousandFixed(Math.round(number), 0, true);
    } else {
        return formatThousandFixed(formatTwoDecimal(number), 2, true);
    }
}

const  formatDigitMoneyByCustom = (number = 0, currency = getLocalStorageSymbol(), precision = 0) => {
    if(precision !== 0) number = NumberUtils.formatThousandFixed(number, precision, true)
    return formatMoneyByCurrencyWithPrecision(number, currency, precision)
    
}

export const CurrencyUtils = {
    formatMoneyVND,
    formatMoneyByCurrency,
    formatThousand,
    formatMoney,
    getLocalStorageCountry,
    getLocalStorageCurrency,
    getLocalStorageSymbol,
    formatMoneyByCurrencyWithPrecision,
    isPosition,
    isCurrencyInput,
    formatNegativeToInteger,
    formatDigitMoneyByCustom
}

export const NumberUtils = {
    formatThousandBreak,
    formatThousand,
    formatThousandFixed,
    toFixed,
    formatTwoDecimal,
    formatPrecisionByCurrency
}
