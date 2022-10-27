/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 8/1/2020
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import store from "../config/redux/ReduxStore";

const getDashboardName = (defaultName) => {
    return store.getState().agencyName || defaultName || process.env.APP_NAME
};

const getZaloAppId = (defaultAppId) => {
    return store.getState().agencyZaloApp || defaultAppId
};

const getStorefrontDomain = () => {
    return store.getState().agencyDomain || process.env.STOREFRONT_DOMAIN;
};

const getWhiteLogo = () => {
    return store.getState().whiteLogo ? store.getState().whiteLogo : store.getState().logo;
}

const getBlueLogo = () => {
    return store.getState().logo;
}

const getRefCode = () => {
    return store.getState().refCode;
};

export const AgencyService = {
    getDashboardName,
    getZaloAppId,
    getStorefrontDomain,
    getWhiteLogo,
    getBlueLogo,
    getRefCode
};
