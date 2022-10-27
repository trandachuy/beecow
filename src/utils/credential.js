/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 26/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import storageService from "../services/storage";
import Constants from "../config/Constant";
import {AgencyService} from "../services/AgencyService";
import {TokenUtils} from "./token";
import {ROLES} from "../config/user-roles";
import {AffiliateConstant} from "../pages/affiliate/context/AffiliateConstant";

const getStoreId = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID)
}
const setStoreId = (storeId) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_ID, storeId)
}
const getInitialLanguage = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE)
}
const setInitialLanguage = (language) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE, language)
}
const getUserId = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_USER_ID)
}
const setUserId = (userId) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_USER_ID, userId)
}
const getStoreUrl = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_URL)
}

const getStoreUrlByENV = (protocol = true) => {
    return `${protocol ? 'https://' : ''}${getStoreUrl()}.${process.env.STOREFRONT_DOMAIN}`
}

const setStoreUrl = (storeUrl) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_URL, storeUrl)
}
const getStoreImage = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE)
}
const setStoreImage = (storeImage) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE, storeImage)
}
const getLangKey = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY)
}
const setLangKey = (langKey) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_LANG_KEY, langKey)
}
const getPackageId = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_PLAN_ID)
}
const setPackageId = (packageId) => {
    return storageService.setToSessionStorage(Constants.STORAGE_KEY_PLAN_ID, packageId)
}
const getPackageName = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_PLAN_NAME)
}
const setPackageName = (packageName) => {
    return storageService.setToSessionStorage(Constants.STORAGE_KEY_PLAN_NAME, packageName)
}
const getExpiredTimeInMS = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_EXP_DATE)
}
const setExpiredTimeInMS = (expTime) => {
    return storageService.setToSessionStorage(Constants.STORAGE_KEY_EXP_DATE, expTime)
}
const getExpiredId = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_EXP_ID)
}
const getRegTime = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_PLAN_REG_DATE)
}
const setRegTime = (regTime) => {
    return storageService.setToSessionStorage(Constants.STORAGE_KEY_PLAN_REG_DATE, regTime)
}
const getShopeeStoreId = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_SHOPEE_SHOP_ID)
}
const setShopeeStoreId = (shopId) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_SHOPEE_SHOP_ID, shopId)
}
const getLazadaStoreId = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_LAZADA_ID)
}
const getStoreName = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME)
}
const setStoreName = (storeName) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_NAME, storeName)
}
const getStorePhone = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_PHONE)
}
const setStorePhone = (storePhone) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_PHONE, storePhone)
}
const getStoreAddress = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS)
}
const setStoreAddress = (storeAddress) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS, storeAddress)
}
const getPackageType = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_PLAN_TYPE)
}
const setPackageType = (packageType) => {
    return storageService.setToSessionStorage(Constants.STORAGE_KEY_PLAN_TYPE, packageType)
}

const getLazadaToken = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_LAZADA_TOKEN)
}

const setIsWizard = (stt) => {
    return storageService.setToLocalStorage(Constants.IS_WIZARD, stt)
}
const getIsWizard = () => {
    return storageService.getFromLocalStorage(Constants.IS_WIZARD) === 'true'
}

const getAccessToken = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_ACCESS_TOKEN)
}

const getStoreFull = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_FULL)
}

const getIsExploredNotification = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_IS_EXPLORED_NOTIFICATION)
}
const setIsExploredNotification = (isExplored) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_IS_EXPLORED_NOTIFICATION, isExplored)
}

const getIsExploredBuyLink = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_IS_EXPLORED_BUY_LINK)
}
const setIsExploredBuyLink = (isExplored) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_IS_EXPLORED_BUY_LINK, isExplored)
}

const getIsExploredFlashSale = _ => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_IS_EXPLORED_FLASH_SALE);
}
const setIsExploredFlashSale = isExplored => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_IS_EXPLORED_FLASH_SALE, isExplored);
}

const setStoreOwnerId = (id) => {
    storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_OWNER_ID, id)
}

const getStoreOwnerId = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_OWNER_ID)
}

const getLiveChatPageId = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_ID)
}

const setLiveChatPageId = (pageId) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_ID, pageId)
}

const getLiveChatAppSecretProof = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_LIVE_CHAT_APP_SECRET_PROOF)
}

const setLiveChatAppSecretProof = (appSecretProof) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_LIVE_CHAT_APP_SECRET_PROOF, appSecretProof)
}

const getLiveChatPageAccessToken = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_TOKEN)
}

const setZaloPageId = (pageId) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_ZALO_CHAT_PAGE_ID, pageId)
}

const getZaloPageId = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_ZALO_CHAT_PAGE_ID)
}

const setZaloPageAccessToken = (token) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_ZALO_CHAT_PAGE_TOKEN, token)
}
const getZaloPageAccessToken = () => {
    return storageService.getFromSessionStorage(Constants.STORAGE_KEY_ZALO_CHAT_PAGE_TOKEN)
}

const setLiveChatPageAccessToken = (token) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_LIVE_CHAT_PAGE_TOKEN, token)
}

const setCurrentPlans = (data) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_CURRENT_PLANS, JSON.stringify(data));
}

const getCurrentPlans = () => {
    let currentPlans;

    try {
        currentPlans = JSON.parse(storageService.getFromSessionStorage(Constants.STORAGE_KEY_CURRENT_PLANS))
    } catch (e) {
    }

    return currentPlans;
}

const setThemeEngine = (data) => {
    storageService.setToLocalStorage(Constants.USE_NEW_THEME_ENGINE, JSON.stringify(data));
}

const getThemeEngine = () => {
    let isUseNewTheme;

    try {
        isUseNewTheme = JSON.parse(storageService.getFromLocalStorage(Constants.USE_NEW_THEME_ENGINE)) === true
    } catch (e) {
    }

    return isUseNewTheme;
}

const setTikiShopAccount = (data) => {
    storageService.setToSessionStorage(Constants.STORAGE_KEY_TIKI, JSON.stringify(data));
}

const getTikiShopAccount = () => {
    let shopAccount;

    try {
        shopAccount = JSON.parse(storageService.getFromSessionStorage(Constants.STORAGE_KEY_TIKI))
    } catch (e) {
    }

    return shopAccount;
}

const setOmiCallData = (data) => {
    storageService.setToLocalStorage(Constants.OMI_CALL.DATA, JSON.stringify(data));
}

const getOmiCallData = () => {
    let data

    try {
        data = JSON.parse(storageService.getFromLocalStorage(Constants.OMI_CALL.DATA))
    } catch (e) {
    }

    return data;
}

const getOmiCallEnabled = () => {
    const omiCallData = getOmiCallData()

    return !!omiCallData && omiCallData.status === Constants.OMI_CALL.STATUS.ACTIVE
}

const getOmiCallExpired = () => {
    const omiCallData = getOmiCallData()

    return !!omiCallData && omiCallData.status === Constants.OMI_CALL.STATUS.EXPIRED
}

const getOmiCallAwaitApprove = () => {
    const omiCallData = getOmiCallData()

    return !!omiCallData && omiCallData.status === Constants.OMI_CALL.STATUS.AWAIT_APPROVE
}

const getOmiCallRenewing = () => {
    const omiCallData = getOmiCallData()

    return !!omiCallData && omiCallData.status === Constants.OMI_CALL.STATUS.RENEWING
}

const getOmiCallExtension = () => {
    let data = getOmiCallData()

    return data ? data.username : null
}

const getStoreFullUrl = () => {
    return `https://${getStoreUrl()}.${AgencyService.getStorefrontDomain()}`
}

const setStoreDefaultBranch = (branchId) => {
    storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_DEFAULT_BRANCH, branchId);
}

const getStoreDefaultBranch = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_DEFAULT_BRANCH);
}

const setDontShowDefaultBranch = (state) => {
    storageService.setToLocalStorage(Constants.STORAGE_KEY_DONT_SHOW_CHOOSE_DEFAULT_BRANCH, state);
}

const getDontShowDefaultBranch = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_DONT_SHOW_CHOOSE_DEFAULT_BRANCH) === 'true';
}
const getStoreEmail =()=>{
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_EMAIL)
}
const setStoreEmail=(storeEmail)=>{
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_EMAIL, storeEmail)
}

const getShopeeSyncPart = () => {
    let partStr = storageService.getFromSessionStorage(Constants.STORAGE_KEY_SHOPEE_SYNC_PARTS)
    if (partStr) {
        return partStr.split(",")
    }
    if (partStr === "") return []
    return null
}
const setShopeeSyncPart = (parts) => {
    return storageService.setToSessionStorage(Constants.STORAGE_KEY_SHOPEE_SYNC_PARTS, parts.join(","))
}

const setPublishedTheme = (isPublished) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_PUBLISHED_THEME, isPublished)
}
const getPublishedTheme = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_PUBLISHED_THEME) === 'true';
}

const setCheckedOrder = (isChecked) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_CHECKED_ORDER, isChecked)
}
const getCheckedOrder = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_CHECKED_ORDER) === 'true';
}

const setSelectOrder = (isSelected) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_SELECTED_ORDER, isSelected)
}
const getSelectOrder = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_SELECTED_ORDER) || Constants.PAGE_SIZE.A4
}

const setValueInfoOrder = (value) => {
    return storageService.setToLocalStorage(Constants.STORAGE_KEY_INFORMATION_ORDER, value)
}
const getValueInfoOrder = () => {
    return storageService.getFromLocalStorage(Constants.STORAGE_KEY_INFORMATION_ORDER);
}

const setShowSupportChat = (state) => {
    storageService.setToLocalStorage(Constants.SUPPORT_CHAT.SHOW_SUPPORT_CHAT, state);
}

const getShowSupportChat = () => {
    return storageService.getFromLocalStorage(Constants.SUPPORT_CHAT.SHOW_SUPPORT_CHAT);
}

const setUseNewGoSocial = (state) => {
    storageService.setToLocalStorage(Constants.USE_NEW_GOSOCIAL, state);
}

const getUseNewGoSocial = () => {
    return storageService.getFromLocalStorage(Constants.USE_NEW_GOSOCIAL) === 'true';
}

const setIsOldGoSocialMenu = (state) => {
    storageService.setToLocalStorage(Constants.IS_OLD_GOSOCIAL_MENU, state);
}

const getIsOldGoSocialMenu = () => {
    return storageService.getFromLocalStorage(Constants.IS_OLD_GOSOCIAL_MENU) === 'true';
}

const setIsExistGoSocial = (state) => {
    storageService.setToLocalStorage(Constants.IS_EXIST_GOSOCIAL, state);
}

/**
 * @deprecated using STORE_COUNTRY_CODE instead
 */
const setCountryCode  = (state) => {
    setStoreCountryCode(state)
}

/**
 * @deprecated using STORE_CURRENCY_CODE instead
 */
const setCurrencyCode  = (state) => {
    setStoreCurrencyCode(state)
}

/**
 * @deprecated using STORE_CURRENCY_SYMBOL instead
 */
const setSymbol  = (state) => {
    setStoreCurrencySymbol(state)
}

const getIsExistGoSocial = () => {
    return storageService.getFromLocalStorage(Constants.IS_EXIST_GOSOCIAL) === 'true';
}

const setFbChatLogin = (state) => {
    storageService.setToLocalStorage(Constants.FB_CHAT_LOGIN, JSON.stringify(state));
}

const getCurrencyCode = () => {
    return storageService.getFromLocalStorage(Constants.STORE_CURRENCY_CODE);
}

const checkStoreVND = () => {
    return getCurrencyCode() === "VND";
}

const getFbChatLogin = () => {
    let storeConfig

    try {
        storeConfig = JSON.parse(storageService.getFromLocalStorage(Constants.FB_CHAT_LOGIN));
    } catch (e) {}

    return storeConfig
}

const getStoreCountryCode = () => {
    return storageService.getFromLocalStorage(Constants.STORE_COUNTRY_CODE)
}

const setStoreCountryCode = (countryCode) => {
    return storageService.setToLocalStorage(Constants.STORE_COUNTRY_CODE, countryCode)
}

const getStoreCurrencyCode = () => {
    return storageService.getFromLocalStorage(Constants.STORE_CURRENCY_CODE)
}

const setStoreCurrencyCode = (currencyCode) => {
    return storageService.setToLocalStorage(Constants.STORE_CURRENCY_CODE, currencyCode)
}

const getStoreCurrencySymbol = () => {
    return storageService.getFromLocalStorage(Constants.STORE_CURRENCY_SYMBOL)
}

const setStoreCurrencySymbol = (currencySymbol) => {
    return storageService.setToLocalStorage(Constants.STORE_CURRENCY_SYMBOL, currencySymbol)
}

const isStoreXxxOrGoSell = () => {
    let isCheck = false
    switch (AgencyService.getRefCode()){
        case Constants.TERAAPP:
            return isCheck = true
            break
        default:
            return isCheck
    }
}

const textStoreXxxOrGo = () => {
    let isCheck = 'GO'
    switch (AgencyService.getRefCode()){
        case Constants.TERAAPP:
            return isCheck = 'TERA'
            break
        default:
            return isCheck
    }
}

const textStoreXxxOrGoSell = () => {
    let isCheck = 'GoSell'
    switch (AgencyService.getRefCode()){
        case Constants.TERAAPP:
            return isCheck = 'TERA'
            break
        default:
            return isCheck
    }
}

const textStoreReplaceGoToXXX = (value) => {
    const regex = /go/ig;
    switch (AgencyService.getRefCode()){
        case Constants.TERAAPP:
            return value.replaceAll(regex, 'TERA')
            break
        default:
            return value
    }
}

const setPrintSizeData = (key, data) => {
    storageService.setToLocalStorage(Constants.PRINT_SIZE_DATA + '_' + key, JSON.stringify(data));
}

const getPrintSizeData = key => {
    let data

    try {
        data = JSON.parse(storageService.getFromLocalStorage(Constants.PRINT_SIZE_DATA + '_' + key));
    } catch (e) {}

    return data
}

const setOrderColumnSetting = (value) => {
    storageService.setToLocalStorage(Constants.STORAGE_KEY_ORDER_COLUMN_SETTING, JSON.stringify(value))
}

const getOrderColumnSetting = () => {
    let data

    try {
        data = JSON.parse(storageService.getFromLocalStorage(Constants.STORAGE_KEY_ORDER_COLUMN_SETTING));
    } catch (e) {}

    return data
}

const ROLE = {
    RESELLER: {
        isReSeller: () => {
            return TokenUtils.isHasRole(ROLES.ROLE_PARTNER_RESELLER)
        },
        isActive: () => {
            return ROLE.RESELLER.hasPartnerPackage() && ROLE.RESELLER.getPartnerEnabled() && ROLE.RESELLER.getPartnerStatus() === AffiliateConstant.STATUS.ACTIVATED
        },
        hasPartnerPackage: () => { // true | false  - reseller package of seller was expired or not
            return TokenUtils.getValue('hasPartnerPackage')
        },
        getPartnerEnabled: () => { // true | false - reseller package was turn on / off by seller
            return TokenUtils.getValue('partnerEnabled')
        },
        getPartnerStatus: () => { // ACTIVATED | DEACTIVATED | PENDING | REJECTED
            return TokenUtils.getValue('partnerStatus')
        },
        getPartnerId: () => {
            return TokenUtils.getValue('partnerId')
        },
        getPartnerCode: () => {
            return TokenUtils.getValue('partnerCode')
        },
        allowUpdatedPrice: () => {
            return TokenUtils.getValue('allowUpdatePrice')
        },
        getFromStoreName: () => {
            return storageService.getFromSessionStorage(Constants.STORAGE_KEY_RESELLER_FROM_STORE_NAME)
        },
        setFromStoreName: (fromStoreName) => {
            return storageService.setToSessionStorage(Constants.STORAGE_KEY_RESELLER_FROM_STORE_NAME, fromStoreName)
        },
        getFromStoreId: () => {
            return storageService.getFromSessionStorage(Constants.STORAGE_KEY_RESELLER_FROM_STORE_ID)
        },
        setFromStoreId: (fromStoreName) => {
            return storageService.setToSessionStorage(Constants.STORAGE_KEY_RESELLER_FROM_STORE_ID, fromStoreName)
        }
    }
}

const convertVie = str => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    str = str.replace(/ + /g," ");
    str = str.trim();
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
}

export const CredentialUtils = {
    ROLE,
    getStoreEmail,
    setStoreEmail,
    getStoreId,
    getUserId,
    getExpiredId,
    getExpiredTimeInMS,
    getPackageName,
    getPackageId,
    getLangKey,
    getStoreImage,
    getStoreUrl,
    getRegTime,
    getShopeeStoreId,
    setShopeeStoreId,
    getLazadaStoreId,
    getStoreName,
    setLangKey,
    setStoreName,
    setStoreUrl,
    setStoreImage,
    setStoreId,
    setExpiredTimeInMS,
    setPackageId,
    setPackageName,
    setPackageType,
    setRegTime,
    getPackageType,
    getLazadaToken,
    setUserId,
    setIsWizard,
    getIsWizard,
    getAccessToken,
    getStoreFull,
    getIsExploredNotification,
    setIsExploredNotification,
    getIsExploredBuyLink,
    setIsExploredBuyLink,
    setIsExploredFlashSale,
    getIsExploredFlashSale,
    getStoreOwnerId,
    setStoreOwnerId,
    setLiveChatPageAccessToken,
    setLiveChatPageId,
    getLiveChatPageAccessToken,
    getLiveChatPageId,
    getStoreUrlByENV,
    getZaloPageAccessToken,
    setZaloPageAccessToken,
    getZaloPageId,
    setZaloPageId,
    getStorePhone,
    setStorePhone,
    getStoreAddress,
    setStoreAddress,
    setCurrentPlans,
    getCurrentPlans,
    setTikiShopAccount,
    getTikiShopAccount,
    setOmiCallData,
    getOmiCallData,
    getOmiCallEnabled,
    getOmiCallExpired,
    getOmiCallAwaitApprove,
    getOmiCallRenewing,
    getOmiCallExtension,
    getStoreFullUrl,
    setStoreDefaultBranch,
    getStoreDefaultBranch,
    getDontShowDefaultBranch,
    setDontShowDefaultBranch,
    getLiveChatAppSecretProof,
    setLiveChatAppSecretProof,
    getShopeeSyncPart,
    setShopeeSyncPart,
    setInitialLanguage,
    getInitialLanguage,
    setPublishedTheme,
    getPublishedTheme,
    setCheckedOrder,
    getCheckedOrder,
    setSelectOrder,
    getSelectOrder,
    setShowSupportChat,
    getShowSupportChat,
    setUseNewGoSocial,
    getUseNewGoSocial,
    setIsOldGoSocialMenu,
    getIsOldGoSocialMenu,
    setIsExistGoSocial,
    setCountryCode,
    setCurrencyCode,
    setSymbol,
    getIsExistGoSocial,
    setFbChatLogin,
    getFbChatLogin,
    setValueInfoOrder,
    getValueInfoOrder,
    getCurrencyCode,
    checkStoreVND,
    getStoreCountryCode,
    setStoreCountryCode,
    getStoreCurrencyCode,
    setStoreCurrencyCode,
    getStoreCurrencySymbol,
    setStoreCurrencySymbol,
    setThemeEngine,
    getThemeEngine,
    isStoreXxxOrGoSell,
    textStoreXxxOrGo,
    textStoreXxxOrGoSell,
    setPrintSizeData,
    getPrintSizeData,
    convertVie,
    setOrderColumnSetting,
    getOrderColumnSetting,
    textStoreReplaceGoToXXX
    
}
