/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/11/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import jwtDecode from 'jwt-decode';
import {CredentialUtils} from "./credential";
import {Level1Path, Level2Path, NAV_PATH} from '../components/layout/navigation/Navigation';
import {PACKAGE_FEATURE_CODES} from "../config/package-features";
import {STAFF_PERMISSIONS} from "../config/staff-permissions";
import {ROLES} from "../config/user-roles";
import storageService from "../services/storage";
import moment from "moment";
import Constants from "../config/Constant";
import {RouterPermissions} from "../config/router-permissions";

let cachedToken = {
    token: '',
    decoded: ''
};

const getAuthRoles = () => {
    const jwtD = decode();
    return jwtD.auth.split(',');
};

const isHasRole = (role) => {
    const roleList = getAuthRoles();
    return roleList.includes(role);
};

const isHasAnyStaffPermission = (permissionList) => {
    let pList = getStaffPermissions();
    pList = pList.filter(permission => permissionList.includes(permission));
    return pList.length > 0;
};

const isHasStaffPermission = (permission) => {
    const pList = getStaffPermissions();
    return pList.includes(permission);
};

const isHasAllStaffPermission = (permissionList) => {
    let pList = getStaffPermissions();
    pList = pList.filter(permission => permissionList.includes(permission));
    return pList.length === permissionList.length;
};

const getStaffPermissions = () => {
    const jwtD = decode();
    return jwtD.staffPermission && isHasRole(ROLES.ROLE_GOSELL_STAFF) ? jwtD.staffPermission.split(',') : [];
};

const getPermissionByRoute = (route) => {
    const [_, level1, level2] = route.split('/');

    switch ('/' + level1) {
        case Level1Path.PATH_PRODUCT:
            if ('/' + level2 === Level2Path.PATH_PURCHASE_ORDER) {
                return STAFF_PERMISSIONS.PURCHASE_ORDER;
            }
        case Level1Path.PATH_COLLECTION:
        case Level1Path.PATH_REVIEW_PRODUCT:
        case Level1Path.PATH_INVENTORY:
            return STAFF_PERMISSIONS.PRODUCTS;
        case Level1Path.PATH_SERVICE:
        case Level1Path.PATH_COLLECTION_SERVICE:
            return STAFF_PERMISSIONS.SERVICES;
        case Level1Path.PATH_ORDER:
            return STAFF_PERMISSIONS.ORDERS;
        case Level1Path.PATH_RESERVATION:
            return STAFF_PERMISSIONS.RESERVATIONS;
        case Level1Path.PATH_ANALYTIC:
            return STAFF_PERMISSIONS.ANALYTICS;
        case Level1Path.PATH_MARKETING:
        case Level1Path.PATH_AFFILIATE:
            return STAFF_PERMISSIONS.MARKETING;
        case Level1Path.PATH_CHANNEL:
        case Level1Path.PATH_THEME:
            return STAFF_PERMISSIONS.SALES_CHANNELS;
        case Level1Path.PATH_SETTING:
            return STAFF_PERMISSIONS.SETTING;
        case Level1Path.PATH_DISCOUNTS:
        case Level1Path.PATH_FLASH_SALE:
        case Level1Path.PATH_FLASHSALES:
            return STAFF_PERMISSIONS.DISCOUNT;
        case Level1Path.PATH_CUSTOMERS:
            return STAFF_PERMISSIONS.CUSTOMERS;
        case Level1Path.PATH_LIVE_CHAT:
        case Level1Path.PATH_GOSOCIAL:
            return STAFF_PERMISSIONS.LIVE_CHAT;
        case Level1Path.PATH_CALL_CENTER:
            return STAFF_PERMISSIONS.CALL_CENTER;
        case Level1Path.PATH_CASHBOOK:
            return STAFF_PERMISSIONS.CASHBOOK_SERVICE
        case Level1Path.PATH_SUPPLIER:
            return STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT
        case Level1Path.PATH_HOME:
            return null;
        default:
            return null;
    }
};

const isAllowForRoute = (route) => {
    const permissions = getStaffPermissions();
    const requiredPermission = getPermissionByRoute(route);
    if (requiredPermission) { // => if this route required permission -> check
        return permissions.includes(requiredPermission);
    }
    return true;
};

const decode = () => {
    try {
        if (CredentialUtils.getAccessToken() !== cachedToken.token) {
            const decoded = jwtDecode(CredentialUtils.getAccessToken());
            cachedToken = {
                token: CredentialUtils.getAccessToken(),
                decoded: decoded
            };
            // console.log(cachedToken.decoded)
            return decoded;
        } else {
            // console.log(cachedToken.decoded)
            return cachedToken.decoded;
        }
    } catch (e) {
        return {
            auth: '',
            staffPermission: ''
        };
    }
};

const getPackageFeatures = () => {
    const {features} = decode();
    return features;
};


const FREE_TIER = ["0100", "0102", "0181", "0104", "0107", "0108", "0113", "0129", "0130", "0131", "0256", "0257", "0258", "0259", "0260", "0261", "0262", "0263", "0264", "0265", "0266", "0267", "0268", "0269", "0270", "0271", "0273", "0285", "0286"];
const WEB = ["0100", "0101", "0102", "0103", "0104", "0105", "0106", "0107", "0108", "0109", "0110", "0111", "0112", "0113", "0115", "0116", "0117", "0118", "0119", "0121", "0124", "0125", "0126", "0127", "0128", "0129", "0130", "0131", "0132", "0133", "0134", "0135", "0136", "0137", "0138", "0139", "0140", "0141", "0142", "0147", "0148", "0149", "0150", "0151", "0152", "0153", "0154", "0155", "0156", "0157", "0158", "0159", "0160", "0161", "0162", "0163", "0164", "0165", "0167", "0168", "0170", "0171", "0172", "0173", "0178", "0179", "0180", "0181", "0182", "0183", "0184", "0185", "0186", "0187", "0188", "0190", "0191", "0192", "0194", "0195", "0196", "0197", "0198", "0199", "0200", "0201", "0202", "0203", "0204", "0206", "0207", "0209", "0210", "0211", "0212", "0213", "0214", "0215", "0216", "0217", "0218", "0219", "0220", "0221", "0223", "0224", "0226", "0227", "0228", "0229", "0230", "0231", "0232", "0233", "0234", "0235", "0237", "0238", "0241", "0242", "0243", "0244", "0245", "0246", "0247", "0249", "0250", "0251", "0252", "0253", "0255", "0256", "0257", "0258", "0259", "0260", "0261", "0262", "0263", "0264", "0265", "0266", "0267", "0268", "0269", "0270", "0271", "0272", "0273", "0274", "0275", "0276", "0277", "0278", "0279", "0280", "0281", "0282", "0283", "0284", "0285", "0286", "0288", "0289", "0290", "0291"];
const APP = ["0100", "0101", "0102", "0104", "0105", "0106", "0107", "0108", "0109", "0110", "0111", "0112", "0113", "0115", "0116", "0117", "0118", "0119", "0122", "0124", "0125", "0126", "0127", "0128", "0129", "0130", "0131", "0132", "0133", "0134", "0135", "0136", "0137", "0138", "0139", "0140", "0141", "0142", "0143", "0144", "0145", "0146", "0147", "0148", "0149", "0150", "0151", "0152", "0153", "0154", "0155", "0156", "0157", "0158", "0159", "0160", "0161", "0162", "0163", "0164", "0165", "0166", "0167", "0168", "0170", "0171", "0172", "0173", "0174", "0175", "0176", "0177", "0178", "0179", "0180", "0181", "0182", "0183", "0184", "0185", "0186", "0189", "0192", "0193", "0196", "0197", "0198", "0199", "0200", "0201", "0202", "0205", "0208", "0209", "0210", "0211", "0212", "0213", "0217", "0218", "0219", "0222", "0224", "0225", "0228", "0229", "0230", "0231", "0232", "0233", "0236", "0237", "0238", "0239", "0240", "0241", "0242", "0243", "0244", "0245", "0247", "0248", "0249", "0251", "0252", "0254", "0255", "0256", "0257", "0258", "0259", "0260", "0261", "0262", "0263", "0264", "0265", "0266", "0267", "0268", "0269", "0270", "0271", "0272", "0273", "0274", "0275", "0276", "0277", "0278", "0279", "0280", "0281", "0282", "0283", "0284", "0285", "0286", "0288", "0290", "0291"];
const INSTORE = ["0270", "0272", "0273", "0279", "0280", "0100", "0101", "0102", "0104", "0106", "0107", "0108", "0113", "0114", "0115", "0116", "0117", "0118", "0119", "0123", "0124", "0125", "0126", "0128", "0129", "0130", "0131", "0132", "0133", "0134", "0135", "0136", "0141", "0142", "0147", "0151", "0152", "0153", "0154", "0155", "0156", "0157", "0158", "0159", "0160", "0162", "0163", "0164", "0165", "0167", "0168", "0181", "0182", "0251", "0252", "0256", "0257", "0258", "0259", "0260", "0261", "0262", "0263", "0264", "0265", "0266", "0267", "0268", "0269", "0271", "0278", "0281", "0285", "0286", "0289", "0290", "0291", "0111"];
const hasAnyPackageFeatures = (packageFeatures) => {
    let {features} = decode();
    // const features = INSTORE
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa') {
        if (storageService.getFromLocalStorage('qaPackage')) {
            const qaPackage = storageService.getFromLocalStorage('qaPackage');
            switch (qaPackage) {
                case 'FREE_TIER':
                    features = FREE_TIER;
                    break;
                case 'WEB_APP':
                    features = [...WEB, ...APP];
                    break;
                case 'WEB':
                    features = WEB;
                    break;
                case 'APP':
                    features = APP;
                    break;
                case 'IN_STORE':
                    features = INSTORE;
                    break;
                default:
                    break;
            }
        }
    }


    if (features && packageFeatures) {
        for (const featureNeedToCheck of packageFeatures) {
            if (features.includes(featureNeedToCheck)) {
                return true;
            }
        }
    }
    return false;
};

const hasAllPackageFeatures = (packageFeatures) => {
    let {features} = decode();
    // const features = INSTORE
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa') {
        if (storageService.getFromLocalStorage('qaPackage')) {
            const qaPackage = storageService.getFromLocalStorage('qaPackage');
            switch (qaPackage) {
                case 'FREE_TIER':
                    features = FREE_TIER;
                    break;
                case 'WEB':
                    features = WEB;
                    break;
                case 'APP':
                    features = APP;
                    break;
                case 'IN_STORE':
                    features = INSTORE;
                    break;
                default:
                    break;
            }
        }
    }

    if (features && packageFeatures) {
        for (const featureNeedToCheck of packageFeatures) {
            if (!features.includes(featureNeedToCheck)) {
                return false;
            }
        }
    }
    return true;
};

const getAllPackagePermissionByRoute = (route) => {
    switch (route) {
        // COLLECTIONS SERVICE
        case NAV_PATH.collectionsService:
        case NAV_PATH.collectionServiceCreate + '/:itemType':
        case NAV_PATH.collectionServiceEdit + "/:itemType/:itemId":
            return [PACKAGE_FEATURE_CODES.FEATURE_0110, PACKAGE_FEATURE_CODES.FEATURE_0111];
        default:
            return undefined;
    }
};

const getPackagePermissionByRoute = (route) => {
   return RouterPermissions(route)
};

const onlyFreePackage = () => {
    // get feature from the token
    let {features} = decode();
    if (!features) return false;

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339)) {
        // only package free
        return true;
    }
    return false;
};

const onlyFreeOrLeadPackage = () => {
    // get feature from the token
    let {features} = decode();
    if (!features) return false;

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)) {
        // only package free
        return true;
    }
    return false;
};

const onlyFreeOrLeadOrSocialPackage = () => {
    // get feature from the token
    let {features} = decode();
    if (!features) return false;

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)) {
        // only package free
        return true;
    }
    return false;
};

const onlyLeadPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)) {
        // only package lead
        return true;
    }
    return false;
};

const onlyLeadOrSocialPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (
        !features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)
        && (features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339) || features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE))
    ) {
        // onlyLeadorSocialPackage
        return true;
    }
    return false;
};

const onlyPosPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339)) {
        // only package lead
        return true;
    }
    return false;
};

const isCheckPosPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (!features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)) {
        return true;
    }
    return false;
};

const onlyAppPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339)) {
        // only package lead
        return true;
    }
    return false;
};

const onlySocialPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (!features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339)) {
        // only package social
        return true;
    }
    return false;
};


const onlyPosOrLeadPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (
        !features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)
        && (features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE) || features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339))
    ) {
        // onlyPosOrLeadPackage
        return true;
    }
    return false;
};

const onlyPosOrLeadOrSocialPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (
        !features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && !features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
        && (features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE) || features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339) || features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE))
    ) {
        // onlyPosOrLeadPackage
        return true;
    }
    return false;
};

const onlyWebOrPosOrLeadOrAppPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (
        !features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE)
        && (features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE) || features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339) || features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE) || features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE))
    ) {
        return true;
    }
    return false;
};

const onlyPosOrLeadOrAppOrSocialPackage = () => {
    // get feature from the token
    let {features} = decode();

    if (
        !features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        && (features.includes(PACKAGE_FEATURE_CODES.POS_PACKAGE) || features.includes(PACKAGE_FEATURE_CODES.FEATURE_0339) || features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE) || features.includes(PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE))
    ) {
        return true;
    }
    return false;
};

const onlyWebOrAppPackage = () => {
    // get feature from the token
    let {features} = decode();

    if ( features.includes(PACKAGE_FEATURE_CODES.WEB_PACKAGE)
        || features.includes(PACKAGE_FEATURE_CODES.APP_PACKAGE)
    ) {
        return true;
    }
    return false;
};

const hasExpiredPackage = (inDays) => {
    const {nextExpiryPackageTime} = decode();
    if (nextExpiryPackageTime) {
        const daysLeft = moment(nextExpiryPackageTime * 1000).diff(moment(new Date()), 'days');
        if (daysLeft <= inDays) {
            return true;
        }
        return false;
    }
};

const hasValidPackage = () => {
    const {nextExpiryPackageTime} = decode();
    return moment(nextExpiryPackageTime * 1000).isAfter(moment(new Date()));
}

const getValue = (key) => {
    const tokenData = decode();
    return tokenData[key];
};

const getSalePitchByRouteOnlyFreePackage = (route) => {
    let code = {
        isShow: false,
        hasClose: true
    };
    const permissionList = getPackagePermissionByRoute(route);
    const hasPermission = hasAnyPackageFeatures(permissionList);
    switch (route) {
        // HOME
        case NAV_PATH.home:
            return code;
        // LIVE CHAT
        case NAV_PATH.liveChat.ROOT:
        case NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO:
        case NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO:
        case NAV_PATH.liveChat.PATH_LIVE_CHAT_CONFIGURATION:
        case NAV_PATH.goSocial.ROOT:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_CONVERSATION:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_CONFIGURATION:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION:
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        // PRODUCTS
        case NAV_PATH.products:
        case NAV_PATH.productCreate:
        case NAV_PATH.productEdit + "/:itemId":
            return code;
        // SERVICES
        case NAV_PATH.services:
        case NAV_PATH.serviceCreate:
        case NAV_PATH.serviceEdit + "/:itemId":
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        // COLLECTIONS
        case NAV_PATH.collections:
        case NAV_PATH.collectionCreate + '/:itemType':
        case NAV_PATH.collectionEdit + "/:itemType/:itemId":
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        case NAV_PATH.collectionsService:
        case NAV_PATH.collectionServiceCreate + '/:itemType':
        case NAV_PATH.collectionServiceEdit + "/:itemType/:itemId":
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // PRODUCT REVIEW
        case NAV_PATH.reviewProduct:
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // ORDER
        case NAV_PATH.orders:
        case NAV_PATH.orderDetail + '/:siteCode/:orderId':
        case NAV_PATH.orderPrint + '/:siteCode/:orderId':
        case NAV_PATH.orderPrintReceipt + '/:siteCode/:orderId':
            return code;
        case NAV_PATH.orderInStorePurchase:
            return code;
        // RESERVATION
        case NAV_PATH.reservations:
        case NAV_PATH.reservationDetail + '/:reservationId':
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // DISCOUNT
        case NAV_PATH.discounts:
        case NAV_PATH.discounts.DISCOUNTS_CREATE + '/:discountsType':
        case NAV_PATH.discounts.DISCOUNTS_DETAIL + "/:discountsType/:itemId":
        case NAV_PATH.discounts.DISCOUNTS_EDIT + "/:discountsType/:itemId":
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // CUSTOMER
        case NAV_PATH.customers.ROOT:
        case NAV_PATH.customers.CUSTOMERS_LIST:
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        case NAV_PATH.customers.CUSTOMERS_EDIT + '/:customerId/:userId/:saleChannel':
            return code;
        case NAV_PATH.customers.SEGMENT_LIST:
        case NAV_PATH.customers.SEGMENT_CREATE:
        case NAV_PATH.customers.SEGMENT_EDIT + '/:segmentId':
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // ANALYTICS
        case NAV_PATH.analytics.ROOT:
        case NAV_PATH.analytics.ORDERS:
        case NAV_PATH.analytics.RESERVATIONS:
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // MARKETING
        case NAV_PATH.marketing.ROOT:
        case NAV_PATH.marketing.LANDING_PAGE:
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        //BUY LINK
        case NAV_PATH.marketing.BUY_LINK_INTRO:
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        case NAV_PATH.marketing.LANDING_PAGE_CREATE:
        case NAV_PATH.marketing.AUTOMATED_ADS:
            return code;
        case NAV_PATH.marketing.NOTIFICATION:
        case NAV_PATH.marketing.NOTIFICATION_INTRO:
        case NAV_PATH.marketing.NOTIFICATION_DETAIL + '/:notificationId':
        case NAV_PATH.marketing.NOTIFICATION_EMAIL_CREATE:
        case NAV_PATH.marketing.NOTIFICATION_PUSH_CREATE:
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        case NAV_PATH.marketing.LOYALTY_LIST:
        case NAV_PATH.marketing.LOYALTY_EDIT + "/:itemId":
        case NAV_PATH.marketing.LOYALTY_CREATE:
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        // MARKETING -> EMAIL
        case NAV_PATH.marketing.EMAIL:
            return {
                isShow: onlyFreePackage(),
                hasClose: false
            };
        case NAV_PATH.marketing.GOOGLE_SHOPPING:
            return {
                isShow: false
            };
        case NAV_PATH.marketing.GOOGLE_ANALYTICS:
        case NAV_PATH.marketing.FACEBOOK_PIXEL:
            return {
                isShow: true,
                hasClose: false //hasPermission || false
            };
        case NAV_PATH.customization:
        case NAV_PATH.customizationDesign:
            return code;
        case NAV_PATH.pages:
        case NAV_PATH.pagesCreate:
        case NAV_PATH.pagesEdit + "/:itemId":
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        case NAV_PATH.customPages:
        case NAV_PATH.createCustomPage:
        case NAV_PATH.editCustomPage + "/:itemId":
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        case NAV_PATH.menu:
        case NAV_PATH.menuAdd:
        case NAV_PATH.menuEdit:
            return {
                isShow: true,
                hasClose: hasPermission || false
            };
        case NAV_PATH.domains:
            return {
                isShow: true,
                hasClose: true
            };
        // SHOPEE - LAZADA - BEECOW
        case NAV_PATH.shopeeAccount:
        case NAV_PATH.shopeeProduct:
        case NAV_PATH.shopeeProduct + "/:itemId":
        case NAV_PATH.shopeeEditProduct + "/:itemId":
        case NAV_PATH.lazadaAccount:
        case NAV_PATH.lazadaProduct:
        case NAV_PATH.beecowAccount:
            return code;
        // SETTING & UPGRADE
        case NAV_PATH.settings:
        case NAV_PATH.settingsPlans:
        case NAV_PATH.paymentCallback:
        case NAV_PATH.upgradeInChannel:
            return code;
        default:
            return code;
    }

};

const getSalePitchByRouteMoreThanFreePackage = (route) => {
    const isOldGoSocialMenu = CredentialUtils.getIsOldGoSocialMenu()

    switch (route) {
        // LIVE CHAT
        case NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO:
        case NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO:
        case NAV_PATH.liveChat.PATH_LIVE_CHAT_CONFIGURATION:
        case NAV_PATH.goSocial.ROOT:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_CONVERSATION:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_CONFIGURATION:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO:
        case NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION:
            return {
                isShow: isOldGoSocialMenu ? onlyLeadPackage() : onlyWebOrPosOrLeadOrAppPackage(),
                hasClose: false
            }
        // COLLECTIONS
        case NAV_PATH.collections:
        case NAV_PATH.collectionCreate + '/:itemType':
        case NAV_PATH.collectionEdit + "/:itemType/:itemId":
            return {
                isShow: onlyLeadPackage(),
                hasClose: false
            };
        // PRODUCT REVIEW
        case NAV_PATH.reviewProduct:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // SERVICES
        case NAV_PATH.services:
        case NAV_PATH.serviceCreate:
        case NAV_PATH.serviceEdit + "/:itemId":
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // SERVICE COLLECTION
        case NAV_PATH.collectionsService:
        case NAV_PATH.collectionServiceCreate + '/:itemType':
        case NAV_PATH.collectionServiceEdit + "/:itemType/:itemId":
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // RESERVATION
        case NAV_PATH.reservations:
        case NAV_PATH.reservationDetail + '/:reservationId':
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // DISCOUNT
        case NAV_PATH.discounts:
        case NAV_PATH.discounts.DISCOUNTS_CREATE + '/:discountsType':
        case NAV_PATH.discounts.DISCOUNTS_DETAIL + "/:discountsType/:itemId":
        case NAV_PATH.discounts.DISCOUNTS_EDIT + "/:discountsType/:itemId":
            return {
                isShow: onlyLeadOrSocialPackage(),
                hasClose: false
            };
        // FLASH SALE
        case NAV_PATH.discounts.FLASHSALE_INTRO:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // ANALYTICS
        case NAV_PATH.analytics.ROOT:
            return {
                isShow: onlyLeadPackage(),
                hasClose: false
            };
        // ANALYTICS ORDER
        case NAV_PATH.analytics.ORDERS:
            return {
                isShow: onlyLeadPackage(),
                hasClose: false
            };
        // ANALYTICS RESERVATIONS
        case NAV_PATH.analytics.RESERVATIONS:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // MARKETING -> LOYALTY
        case NAV_PATH.marketing.LOYALTY_LIST:
        case NAV_PATH.marketing.LOYALTY_EDIT + "/:itemId":
        case NAV_PATH.marketing.LOYALTY_CREATE:
            return {
                isShow: onlyLeadOrSocialPackage(),
                hasClose: false
            };
        // MARKETING -> EMAIL
        case NAV_PATH.marketing.EMAIL:
            return {
                isShow: onlyFreePackage(),
                hasClose: false
            };
        case NAV_PATH.pages:
        case NAV_PATH.pagesCreate:
        case NAV_PATH.pagesEdit + "/:itemId":
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // CUSTOM PAGES
        case NAV_PATH.customPages:
        case NAV_PATH.createCustomPage:
        case NAV_PATH.editCustomPage + "/:itemId":
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // BLOG
        case NAV_PATH.blog:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // CUSTOMIZATION -> MENU
        case NAV_PATH.menu:
        case NAV_PATH.menuAdd:
        case NAV_PATH.menuEdit:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        // CUSTOMIZATION -> PREFERENCES
        case NAV_PATH.marketing.GOOGLE_SHOPPING:
            return {
                isShow: onlyPosOrLeadOrAppOrSocialPackage(),
                hasClose: false
            };
        case NAV_PATH.marketing.GOOGLE_ANALYTICS:
        case NAV_PATH.marketing.FACEBOOK_PIXEL:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            };
        case NAV_PATH.domains:
            return {
                isShow: onlyPosOrLeadOrSocialPackage(),
                hasClose: false
            }
        case NAV_PATH.domains:
            return {
                isShow: onlyAppPackage(),
                hasClose: true
            }
        // BUY LINK
        case NAV_PATH.marketing.BUY_LINK_INTRO:
            return {
                isShow: onlyPosOrLeadOrAppOrSocialPackage(),
                hasClose: false
            }
        default:
            return undefined;
    }

};

const hasThemingPermission = (isActive = false) => {
    return (!isActive) ? hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0293]) : isActive;
};

const getDisplayName = () => {
    return decode().displayName;
};

const isStaff = () => {
    return isHasRole(ROLES.ROLE_GOSELL_STAFF);
};

const hasThemeEnginePermission = (masterThemeId) => {
    if (masterThemeId === Constants.DEFAULT_MASTER_THEME_ID) {
        return true
    }

    const {WEB_PACKAGE, APP_PACKAGE} = PACKAGE_FEATURE_CODES

    return hasAnyPackageFeatures([WEB_PACKAGE, APP_PACKAGE])
}

export const TokenUtils = {
    getAuthRoles,
    getStaffPermissions,
    isHasAnyStaffPermission,
    isHasRole,
    isHasStaffPermission,
    isAllowForRoute,
    isHasAllStaffPermission,
    hasAnyPackageFeatures,
    hasAllPackageFeatures,
    getPackagePermissionByRoute,
    getAllPackagePermissionByRoute,
    hasExpiredPackage,
    getPackageFeatures,
    getValue,
    getSalePitchByRouteOnlyFreePackage,
    hasThemingPermission,
    onlyFreePackage,
    getSalePitchByRouteMoreThanFreePackage,
    getDisplayName,
    isStaff,
    onlyFreeOrLeadPackage,
    hasThemeEnginePermission,
    hasValidPackage,
    onlyFreeOrLeadOrSocialPackage,
    onlyWebOrAppPackage,
    isCheckPosPackage
};
