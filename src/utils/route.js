/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import {NAV_PATH} from '../components/layout/navigation/Navigation';
import {generatePath} from 'react-router-dom';

/**
 * @deprecated
 * @description use <b>redirectWithoutReload</b> instead
 */
const linkTo = (props, url, params) => {
    process.env.NODE_ENV === 'development' && console.debug("RedirectWithoutReload", new Error().stack);
    props.history.push(generatePath(url, params))
}

const redirectWithoutReloadHasPathParams = (props, url) => {
    process.env.NODE_ENV === 'development' && console.debug("redirectWithoutReloadHasPathParams", new Error().stack);
    props.history.push(generatePath(url, getPathParams(props, url)))
}

const redirectCurrentWithoutReload = (props, url, params) => {
    process.env.NODE_ENV === 'development' && console.debug("redirectCurrentWithoutReload", new Error().stack);
    props.history.replace(generatePath(url, params))
}

/**
 * @deprecated
 * @description use <b>redirectWithReload</b> instead
 */
const redirectTo = (href, params) => {
    window.location.href = generatePath(href, params)
}

/**
 * @deprecated
 * @description use <b>redirectWithoutReloadWithData</b> instead
 */
const linkToWithObject = (props, url, data, params) =>{
    props.history.push(generatePath(url, params), data);
}

const getSearchParams = (locationSearch) => {
    return decodeURI(window.location.search)
        .replace('?', '')
        .split('&')
        .map(param => param.split('='))
        .reduce((values, [ key, value ]) => {
            values[ key ] = value
            return values
        }, {})
}

/**
 * Get path param object of url
 * @param props.location.pathname, ex: '/channel/storefront/page/edit/123'
 * @param url, ex: '/channel/storefront/custom-page/edit/:itemId'
 * @returns {*}, ex: {'itemId': '123'}
 */
const getPathParams = (props, url) => {
    return url
        .split('/')
        .map((param, index) => {
            const params = param.split(':')

            if (params.length > 1) {
                return {
                    index,
                    paramKey: params[1]
                }
            }
        })
        .reduce((values, param) => {
            if (!param) {
                return values
            }

            const { index, paramKey } = param
            const paramValue = props.location.pathname.split('/')[index]

            if (paramValue) {
                values[paramKey] = paramValue
            }

            return values
        }, {})
}

const toNotFound = (props) => {
    try {
        const foundPath = props.location.pathname.search(/^\/affiliate/gi);

        if (foundPath > -1) {
            redirectCurrentWithoutReload(props, NAV_PATH.affiliateNotFound)
            return;
        }
    } catch (e) {}

    redirectCurrentWithoutReload(props, NAV_PATH.notFound)
}

const openNewTab = (url) => {
    window.open(url, '_blank')
}

const open = (url) => {
    window.open(url)
}

const reload = () => {
    window.location.reload();
}


export const RouteUtils = {
    /**
     * @deprecated
     */
    linkTo,
    /**
     * @deprecated
     */
    redirectTo,
    /**
     * @deprecated
     */
    linkToWithObject,
    redirectWithoutReload: linkTo,
    redirectWithoutReloadHasPathParams,
    redirectCurrentWithoutReload,
    redirectWithoutReloadWithData: linkToWithObject,
    redirectWithReload: redirectTo,
    getSearchParams,
    getPathParams,
    toNotFound,
    openNewTab,
    open,
    reload
}
