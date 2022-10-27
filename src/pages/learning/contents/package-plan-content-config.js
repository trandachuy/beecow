import {
    assetPrefix as ASSETS_PREFIX_TIER,
    STEPS_CONTENT as STEPS_CONTENT_TIER,
    STEPS_LIST as STEPS_LIST_TIER,
} from "./learning-plan-tier";

import {
    assetPrefix as ASSETS_PREFIX_WP,
    STEPS_CONTENT as STEPS_CONTENT_WP,
    STEPS_LIST as STEPS_LIST_WP,
} from "./learning-plan-web-product";

import {
    assetPrefix as ASSETS_PREFIX_WS,
    STEPS_CONTENT as STEPS_CONTENT_WS,
    STEPS_LIST as STEPS_LIST_WS,
} from "./learning-plan-web-service";

import {
    assetPrefix as ASSETS_PREFIX_AS,
    STEPS_CONTENT as STEPS_CONTENT_AS,
    STEPS_LIST as STEPS_LIST_AS,
} from "./learning-plan-app-service";

import {
    assetPrefix as ASSETS_PREFIX_AP,
    STEPS_CONTENT as STEPS_CONTENT_AP,
    STEPS_LIST as STEPS_LIST_AP,
} from "./learning-plan-app-product";

import {
    assetPrefix as ASSETS_PREFIX_IS,
    STEPS_CONTENT as STEPS_CONTENT_IS,
    STEPS_LIST as STEPS_LIST_IS,
} from "./learning-plan-instore";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/03/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

export const PACKAGE_PLANS = {
    FREE_TIER: {
        STEPS_CONTENT: STEPS_CONTENT_TIER,
        STEPS_LIST: STEPS_LIST_TIER,
        ASSETS_PREFIX: ASSETS_PREFIX_TIER,
    },
    WEB_PRODUCT: {
        STEPS_CONTENT: STEPS_CONTENT_WP,
        STEPS_LIST: STEPS_LIST_WP,
        ASSETS_PREFIX: ASSETS_PREFIX_WP,
    },
    WEB_SERVICE: {
        STEPS_CONTENT: STEPS_CONTENT_WS,
        STEPS_LIST: STEPS_LIST_WS,
        ASSETS_PREFIX: ASSETS_PREFIX_WS,
    },
    APP_PRODUCT: {
        STEPS_CONTENT: STEPS_CONTENT_AP,
        STEPS_LIST: STEPS_LIST_AP,
        ASSETS_PREFIX: ASSETS_PREFIX_AP,
    },
    APP_SERVICE: {
        STEPS_CONTENT: STEPS_CONTENT_AS,
        STEPS_LIST: STEPS_LIST_AS,
        ASSETS_PREFIX: ASSETS_PREFIX_AS,
    },
    IN_STORE: {
        STEPS_CONTENT: STEPS_CONTENT_IS,
        STEPS_LIST: STEPS_LIST_IS,
        ASSETS_PREFIX: ASSETS_PREFIX_IS,
    },
}
