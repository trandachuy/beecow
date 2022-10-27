/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import moment from 'moment'
import {CredentialUtils} from "./credential";

const formatDDMMYYY = (dateTime) => {
    return moment(dateTime).format('DD-MM-YYYY')
}

const formatYYYYMMDD = (dateTime) => {
    return moment(dateTime).format('YYYY-MM-DD')
}

const formatDDMMYYYY_HHMM = (dateTime, delimiter = '-') => {
    return moment(dateTime).format(`DD${delimiter}MM${delimiter}YYYY HH:mm`)
}

const formatHHmma = (dateTime) => {
    return moment(dateTime).format('hh:mm a')
}

const formatHHmm = (dateTime) => {
    return moment(dateTime).format('HH:mm')
}

const formatFromNow = (dateTime, fallBackFormat = 'DD/MM/YYYY') => {
    const langKey = CredentialUtils.getLangKey()
    const hours = moment(moment.now()).diff(dateTime, 'hours')
    if (hours < 48) {
        return moment(dateTime).locale(langKey).fromNow()
    }
    return moment(dateTime).locale(langKey).format(fallBackFormat)
}

const isNotExceedTime = (dateTime, numberOfTime, unix) => {
    const offset = moment(moment.now()).diff(dateTime, unix)

    return offset < numberOfTime
}

/**
 * Reset to ZERO from unit
 * @description example 12:10:05.00  flatTo 'm' -> 12:10:00.000
 * @param {moment.Moment} moment
 * @param {'h'|'m'|'s'} unit
 */
const flatTo = (moment, unit) => {
    switch (unit) {
        case "h":
            return moment.set({
                m: 0,
                s: 0,
                ms: 0
            })
        case "m":
            return moment.set({
                s: 0,
                ms: 0
            })
        case "s":
            return moment.set({
                ms: 0
            })
        default:
            return moment
    }
}
const formatTimeOrDay = (timestamp) => {
    const today = moment()
    const inputTime = moment.unix(Math.round(timestamp/1000))

    if (today.format('DDMMYYYY') === inputTime.format('DDMMYYYY')) { // same day -> return time
        return inputTime.format('HH:mm')
    }
    return inputTime.format('DD/MM')
}

const formatTimeOrDateTime = (timestamp) => {
    const today = moment()
    const inputTime = moment.unix(Math.round(timestamp/1000))

    if (today.format('DDMMYYYY') === inputTime.format('DDMMYYYY')) { // same day -> return time
        return inputTime.format('HH:mm')
    }
    return inputTime.format('HH:mm DD/MM/YYYY')
}

const UNIT = {
    MINUTE: 'm',
    HOUR: 'h',
    SECOND: 's'
}

export const DateTimeUtils = {
    formatDDMMYYY,
    formatYYYYMMDD,
    formatDDMMYYYY_HHMM,
    formatHHmm,
    formatFromNow,
    formatHHmma,
    flatTo,
    formatTimeOrDay,
    formatTimeOrDateTime,
    isNotExceedTime,
    UNIT
}
