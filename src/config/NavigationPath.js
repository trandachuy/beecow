/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */



/**** Common path ****/
const PATH_HOME = '/home';
const PATH_API_DOCS = '/api-docs';
const PATH_DASHBOARD = '/dashboard';
const PATH_LIST = '/list';
const PATH_CREATE = '/create';
const PATH_EDIT = '/edit';
const PATH_ACCOUNT = '/account';
const PATH_SHOPEE_PLAN = '/plans';
const PATH_ACCOUNT_INTRO = '/intro';
const PATH_ACCOUNT_INFORMATION = '/information';
const PATH_SETTINGS = '/settings';
const PATH_ACCOUNT_MANAGEMENT = '/management';
const PATH_SYNC = '/sync';
const PATH_PRODUCT = '/product';
const PATH_SUPPLIER = '/supplier';
const PATH_LINK_PRODUCTS = '/link-products';
const PATH_SERVICE = '/service';
const PATH_EDIT_PRODUCT = '/edit_product';
const PATH_COLLECTION = '/collection';
const PATH_COLLECTION_SERVICE = '/collection_service';
const PATH_REVIEW_PRODUCT = '/review_product';
const PATH_ORDER = '/order';
const PATH_PARTNER = '/partner';
const PATH_COMMISSION = '/commission';
const PATH_PAYOUT = '/payout';
const PATH_RESERVATION = '/reservation';
const PATH_CHANNEL = '/channel';
const PATH_LAZADA = '/lazada';
const PATH_SHOPEE = '/shopee';
const PATH_TIKI = '/tiki';
const PATH_BEECOW = '/gomua';
const PATH_STOREFRONT = '/storefront';
const PATH_ANALYTIC = '/analytics';
const PATH_MARKETING = '/marketing';
const PATH_SETTING = '/setting';
const PATH_SETTING_PLANS = '/setting/plans';
const PATH_SETTING_LANGUAGES_PLANS = '/setting/languages/plans';
const PATH_SETTING_CALL_CENTER_PLANS = '/setting/call-center/plans';
const PATH_SETTING_BRANCH_PLANS = '/setting/branch/plans';
const PATH_SETTING_AFFILIATE_PLANS = '/setting/affiliate/plans/:serviceType';
const PATH_LOGIN = '/login';
const PATH_STAFF_LOGIN = '/staff/login';
const PATH_FORGOT = '/forgot';
const PATH_STAFF_FORGOT = '/staff/forgot';
const PATH_RESET = '/reset';
const PATH_CUSTOMIZATION = '/customization';
const PATH_CUSTOMIZATION_THEME = '/customization-theme';
const PATH_PAGE = '/page';
const PATH_CUSTOM_PAGE = '/custom-page';
const PATH_MENU = '/menu';
const PATH_DESIGN = '/design';
const PATH_INFO = '/info';
const PATH_NAVIGATION = '/navigation';
const PATH_DOMAIN = '/domain';
const PATH_PREFERENCE = '/preference';
const PATH_WIZARD = '/wizard';
const PATH_NOT_FOUND = '/404';
const PATH_INTERNAL_ERROR = '/500';
const PATH_LOGOUT = '/logout';
const PATH_REDIRECT = '/redirect';
const PATH_DETAIL = '/detail';
const PATH_PRINT = '/print';
const LAZADA_SHIPPING_LABEL = '/print-lazada-shipping-label';
const PATH_PRINT_RECEIPT = '/print-receipt';
const PATH_PAYMENT_CALLBACK = '/payment/callback';
const PATH_PAYMENT_CALLBACK_EPAY = '/payment/epay-callback';
const PATH_PAYMENT_CALLBACK_CHAIPAY = '/payment/chaipay-callback';
const PATH_UPGRADE = '/upgrade';
const PATH_ITEMS = '/items';
const PATH_ITEM_ID = '/:itemId';
const PATH_MODEL_ITEM_ID = '/:modelItemId';
const PATH_DISCOUNTS = '/discounts';
const PATH_FLASH_SALE = '/flash-sale';
const PATH_FLASH_SALE_TIME = '/flash-sale/time';
const PATH_FLASHSALES = '/flashsales';
const PATH_COUPONS = '/coupons';
const PATH_CUSTOMERS = '/customers';
const PATH_COMMUNICATION = '/communication'
const PATH_LOYALTY = '/loyalty';
const PATH_BUY_LINK = '/buy-link';
const PATH_LIVE_CHAT = '/live-chat'
const PATH_GOSOCIAL = '/gosocial'
const PATH_THEME = '/theme'
const PATH_INTRO = '/intro'
const PATH_INSTORE_PURCHASE = '/instore-purchase'
const PATH_INSTORE_QUOTATION = '/instore-quotation'
const PATH_BARCODE = '/bar-code'
const PATH_LANDING_PAGE = '/landing-page';
const PATH_GOOGLE_ANALYTICS = '/google-analytics';
const PATH_GOOGLE_SHOPPING = '/google-shopping';
const PATH_FACEBOOK_PIXEL = '/facebook-pixel';
const PATH_LOYALTY_POINT = '/loyalty-point';
const PATH_FACEBOOK = '/facebook';
const PATH_ZALO = '/zalo';
const PATH_CONVERSATION = '/conversations';
const PATH_VARIATION_DETAIL = '/variation-detail';
const PATH_CALL_CENTER = '/call-center';
const PATH_HISTORY = '/history';
const PATH_TRACKING = '/tracking';
const PATH_INVENTORY = '/inventory';
const PATH_EMAIL = '/email';
const PATH_CONFIGURATION = '/configuration';
const PATH_AUTOMATION = '/automation';
const PATH_MANAGEMENT = '/management'
const PATH_LIBRARY = '/library'
const PATH_PREVIEW = '/preview/:themeId'
const PATH_BLOG = '/blog/article'
const PATH_CATEGORY = '/category'
const PATH_TRANSFER = '/transfer';
const PATH_PARTNER_TRANSFER = '/transfer/partner';
const PATH_PURCHASE_ORDER = '/purchase-order';
const PATH_GOOGLE_TAG_MANAGER = '/google-tag-manager'
const PATH_AFFILIATE = '/affiliate'
const PATH_CASHBOOK = '/cashbook';
const PATH_PAYPAL_CONNECT = '/paypal/connector';
const PATH_WHOLESALE_PRICE = '/wholesale-price';
const PATH_RETURN_ORDER = '/return-order';
const PATH_CONVERSION_UNIT = '/conversion-unit';
const PATH_UNIT_CONVERSION = '/conversion-unit';
const PATH_VARIATION = '/variation'
const PATH_DOWNLOAD_FILE = '/download'
const PATH_BROADCAST = '/broadcast'

export const NavigationLevel1Path = {
    PATH_HOME,
    PATH_PRODUCT,
    PATH_LINK_PRODUCTS,
    PATH_INVENTORY,
    PATH_ORDER,
    PATH_RESERVATION,
    PATH_DISCOUNTS,
    PATH_CUSTOMERS,
    PATH_ANALYTIC,
    PATH_MARKETING,
    PATH_CHANNEL,
    PATH_SETTING,
    PATH_SERVICE,
    PATH_COLLECTION,
    PATH_COLLECTION_SERVICE,
    PATH_LIVE_CHAT,
    PATH_GOSOCIAL,
    PATH_REVIEW_PRODUCT,
    PATH_CALL_CENTER,
    PATH_SUPPLIER,
    PATH_AFFILIATE,
    PATH_CASHBOOK,
    PATH_FLASH_SALE,
    PATH_FLASHSALES,
    PATH_THEME,
    PATH_API_DOCS
}

export const NavigationLevel2Path = {
    PATH_PURCHASE_ORDER
}

/**** Product path ****/
const PATH_PRODUCT_LIST = PATH_PRODUCT + PATH_LIST;
const PATH_PRODUCT_CREATE = PATH_PRODUCT + PATH_CREATE;
const PATH_PRODUCT_EDIT = PATH_PRODUCT + PATH_EDIT;
const PATH_PRODUCT_PRINT_BARCODE = PATH_PRODUCT + PATH_BARCODE + PATH_PRINT;
const PATH_VARIATION_DETAIL_EDIT = PATH_PRODUCT + PATH_ITEM_ID + PATH_VARIATION_DETAIL + PATH_MODEL_ITEM_ID + PATH_EDIT;
const PATH_PRODUCT_INVENTORY = PATH_INVENTORY + PATH_LIST;
const PATH_INVENTORY_HISTORY = PATH_INVENTORY + PATH_HISTORY;
const PATH_INVENTORY_TRACKING = PATH_INVENTORY + PATH_TRACKING;
const PATH_PRODUCT_TRANSFER_LIST = PATH_PRODUCT + PATH_TRANSFER + PATH_LIST;
const PATH_PRODUCT_PURCHASE_ORDER = PATH_PRODUCT + PATH_PURCHASE_ORDER + PATH_LIST;
const PATH_PRODUCT_TRANSFER_CREATE = PATH_PRODUCT + PATH_TRANSFER + PATH_CREATE;
const PATH_PRODUCT_TRANSFER_EDIT = PATH_PRODUCT + PATH_TRANSFER + PATH_EDIT;
const PATH_PRODUCT_TRANSFER_WIZARD = PATH_PRODUCT + PATH_TRANSFER + PATH_WIZARD;
const PATH_PRODUCT_PURCHASE_ORDER_CREATE = PATH_PRODUCT + PATH_PURCHASE_ORDER + PATH_CREATE;
const PATH_PRODUCT_PURCHASE_ORDER_EDIT = PATH_PRODUCT + PATH_PURCHASE_ORDER + PATH_EDIT;
const PATH_PRODUCT_PURCHASE_ORDER_WIZARD = PATH_PRODUCT + PATH_PURCHASE_ORDER + PATH_WIZARD;
const PATH_EDIT_WHOLESALE_PRICE = PATH_PRODUCT + PATH_WHOLESALE_PRICE + PATH_EDIT;
const PATH_PRODUCT_WHOLESALE_PRICE_CREATE = PATH_PRODUCT + PATH_WHOLESALE_PRICE + PATH_CREATE;
const PATH_PRODUCT_WHOLESALE_PRICE = PATH_PRODUCT + PATH_WHOLESALE_PRICE;
const PATH_PRODUCT_UNIT_CONVERSION = PATH_PRODUCT + PATH_CONVERSION_UNIT;
const PATH_PRODUCT_UNIT_CONVERSION_CREATE = PATH_PRODUCT + PATH_CONVERSION_UNIT + PATH_CREATE;
const PATH_PRODUCT_UNIT_CONVERSION_EDIT = PATH_PRODUCT + PATH_CONVERSION_UNIT + PATH_EDIT;
const PATH_PRODUCT_UNIT_CONVERSION_VARIATION = PATH_PRODUCT + PATH_UNIT_CONVERSION + PATH_VARIATION;
const PATH_PRODUCT_UNIT_CONVERSION_VARIATION_CREATE = PATH_PRODUCT + PATH_UNIT_CONVERSION + PATH_VARIATION +PATH_CREATE;
const PATH_PRODUCT_UNIT_CONVERSION_VARIATION_EDIT = PATH_PRODUCT + PATH_UNIT_CONVERSION + PATH_VARIATION + PATH_EDIT;

// Supplier path
const PATH_SUPPLIER_CREAT=PATH_SUPPLIER + PATH_CREATE
const PATH_SUPPLIER_EDIT=PATH_SUPPLIER + PATH_EDIT
/**** Live chat path ****/
const PATH_LIVE_CHAT_INTRO = PATH_LIVE_CHAT + PATH_FACEBOOK + PATH_INTRO
const PATH_LIVE_CHAT_CONVERSATION = PATH_LIVE_CHAT + PATH_FACEBOOK + PATH_CONVERSATION
const PATH_ZALO_CHAT_INTRO = PATH_LIVE_CHAT + PATH_ZALO + PATH_INTRO
const PATH_ZALO_CHAT_CONVERSATION = PATH_LIVE_CHAT + PATH_ZALO + PATH_CONVERSATION
const PATH_ZALO_CHAT_RESOLVE_TOKEN = PATH_LIVE_CHAT + PATH_ZALO + '/resolve-token';
const PATH_LIVE_CHAT_CONFIGURATION = PATH_LIVE_CHAT + PATH_CONFIGURATION;

/**** GoSocial path ****/
const PATH_GOSOCIAL_INTRO = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_INTRO
const PATH_GOSOCIAL_CONVERSATION = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_CONVERSATION
const PATH_GOSOCIAL_CONFIGURATION = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_CONFIGURATION;
const PATH_GOSOCIAL_AUTOMATION = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_AUTOMATION;
const PATH_GOSOCIAL_AUTOMATION_EDIT = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_AUTOMATION + PATH_EDIT;
const PATH_GOSOCIAL_AUTOMATION_CREATE = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_AUTOMATION + PATH_CREATE;
const PATH_GOSOCIAL_ZALO_CHAT_INTRO = PATH_GOSOCIAL + PATH_ZALO + PATH_INTRO
const PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION = PATH_GOSOCIAL + PATH_ZALO + PATH_CONVERSATION;
const PATH_GOSOCIAL_BROADCAST = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_BROADCAST;
const PATH_GOSOCIAL_BROADCAST_EDIT = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_BROADCAST + PATH_EDIT;
const PATH_GOSOCIAL_BROADCAST_CREATE = PATH_GOSOCIAL + PATH_FACEBOOK + PATH_BROADCAST + PATH_CREATE;

/**** Theme path ****/
const PATH_THEME_MAKING = PATH_THEME + "/theme-making/:themeId/:themeType"

/**** Service path ****/
const PATH_SERVICE_LIST = PATH_SERVICE + PATH_LIST;
const PATH_SERVICE_CREATE = PATH_SERVICE + PATH_CREATE;
const PATH_SERVICE_EDIT = PATH_SERVICE + PATH_EDIT;

/**** Collection path ****/
const PATH_COLLECTION_LIST = PATH_COLLECTION + PATH_LIST;
const PATH_COLLECTION_CREATE = PATH_COLLECTION + PATH_CREATE + PATH_PRODUCT;
const PATH_COLLECTION_EDIT = PATH_COLLECTION + PATH_EDIT;

/**** Collection service path ****/
const PATH_COLLECTION_SERVICE_LIST = PATH_COLLECTION_SERVICE + PATH_LIST;
const PATH_COLLECTION_SERVICE_CREATE = PATH_COLLECTION_SERVICE + PATH_CREATE;
const PATH_COLLECTION_SERVICE_EDIT = PATH_COLLECTION_SERVICE + PATH_EDIT;

/**** Review product */
const PATH_REVIEW_PRODUCT_LIST = PATH_REVIEW_PRODUCT + PATH_LIST;

/**** Supplier */
const PATH_SUPPLIER_LIST = PATH_SUPPLIER + PATH_LIST;

/**** Order path ****/
const PATH_ORDER_LIST = PATH_ORDER + PATH_LIST;
const PATH_ORDER_DETAIL = PATH_ORDER + PATH_DETAIL;
const PATH_ORDER_PRINT = PATH_ORDER + PATH_PRINT;
const PATH_PRINT_LAZADA_SHIPPING_LABEL = PATH_ORDER + LAZADA_SHIPPING_LABEL;
const PATH_ORDER_PRINT_RECEIPT = PATH_ORDER + PATH_PRINT_RECEIPT;
const PATH_ORDER_CREATE = PATH_ORDER + PATH_CREATE;
const PATH_ORDER_EDIT = PATH_ORDER + PATH_EDIT;
const PATH_ORDER_INSTORE_PURCHASE = PATH_ORDER + PATH_INSTORE_PURCHASE;
const PATH_QUOTATION = PATH_ORDER + PATH_INSTORE_QUOTATION
const PATH_RETURN_ORDER_LIST = PATH_ORDER + PATH_RETURN_ORDER + PATH_LIST;
const PATH_RETURN_ORDER_WIZARD = PATH_ORDER + PATH_RETURN_ORDER + PATH_WIZARD;
const PATH_RETURN_ORDER_CREATE = PATH_ORDER + PATH_RETURN_ORDER + PATH_CREATE;
const PATH_RETURN_ORDER_EDIT = PATH_ORDER + PATH_RETURN_ORDER + PATH_EDIT;
/**** reservation path ****/
const PATH_RESERVATION_LIST = PATH_RESERVATION + PATH_LIST;
const PATH_RESERVATION_DETAIL = PATH_RESERVATION + PATH_DETAIL;
const PATH_AFFILIATE_INFO = PATH_AFFILIATE + PATH_INFO;
const PATH_AFFILIATE_ORDER = PATH_AFFILIATE + PATH_ORDER;
const PATH_AFFILIATE_PARTNER = PATH_AFFILIATE + PATH_PARTNER;
const PATH_AFFILIATE_INVENTORY = PATH_AFFILIATE + PATH_INVENTORY;
const PATH_AFFILIATE_COMMISSION = PATH_AFFILIATE + PATH_COMMISSION;
const PATH_AFFILIATE_COMMISSION_CREATE = PATH_AFFILIATE + PATH_COMMISSION + PATH_CREATE;
const PATH_AFFILIATE_COMMISSION_EDIT = PATH_AFFILIATE + PATH_COMMISSION + PATH_EDIT;
const PATH_AFFILIATE_PAYOUT = PATH_AFFILIATE + PATH_PAYOUT;
const PATH_AFFILIATE_SETTING = PATH_AFFILIATE + PATH_SETTING;
const PATH_AFFILIATE_INTRO = PATH_AFFILIATE + PATH_INTRO;
const PATH_AFFILIATE_PARTNER_CREATE = PATH_AFFILIATE_PARTNER + PATH_CREATE;
const PATH_AFFILIATE_PARTNER_EDIT = PATH_AFFILIATE_PARTNER + PATH_EDIT;
const PATH_AFFILIATE_NOT_FOUND = PATH_AFFILIATE + PATH_NOT_FOUND;
const PATH_AFFILIATE_PRODUCT_TRANSFER_LIST = PATH_AFFILIATE + PATH_PARTNER_TRANSFER + PATH_LIST;
const PATH_AFFILIATE_PRODUCT_TRANSFER_WIZARD = PATH_AFFILIATE + PATH_PARTNER_TRANSFER + PATH_WIZARD;
const PATH_AFFILIATE_PRODUCT_TRANSFER_CREATE = PATH_AFFILIATE + PATH_PARTNER_TRANSFER + PATH_CREATE;
const PATH_AFFILIATE_PRODUCT_TRANSFER_EDIT = PATH_AFFILIATE + PATH_PARTNER_TRANSFER + PATH_EDIT;

/**** discount path ****/
const PATHS_PROMOTIONS = {
    ROOT: PATH_DISCOUNTS + PATH_LIST,
    DISCOUNTS_LIST: PATH_DISCOUNTS + PATH_LIST,
    DISCOUNTS_DETAIL: PATH_DISCOUNTS + PATH_DETAIL,
    DISCOUNTS_CREATE: PATH_DISCOUNTS + PATH_CREATE,
    DISCOUNTS_EDIT: PATH_DISCOUNTS + PATH_EDIT,
    FLASHSALE_INTRO: PATH_FLASHSALES + PATH_INTRO,
}

/**** flash sale path ****/
const PATH_FlASH_SALE_LIST = PATH_FLASH_SALE + PATH_LIST
const PATH_CREATE_FLASH_SALE_CAMPAIGN = PATH_FLASH_SALE + PATH_CREATE
const PATH_EDIT_FLASH_SALE_CAMPAIGN = PATH_FLASH_SALE + PATH_EDIT + '/:campaignId'
const PATH_FLASH_SALE_TIME_LIST = PATH_FLASH_SALE_TIME + PATH_LIST

/**** Marketing ****/
const PATH_AUTOMATIC_ADS = PATH_MARKETING + "/automaticads";
const PATH_NOTIFICATION = PATH_MARKETING + "/notification";
const PATH_NOTIFICATION_PUSH = '/push'
const PATH_NOTIFICATION_EMAIL = '/email'
const PATHS_MARKETING = {
    ROOT: PATH_MARKETING,
    AUTOMATED_ADS: PATH_AUTOMATIC_ADS,
    COMMUNICATION_INTRO: PATH_MARKETING + PATH_COMMUNICATION + PATH_INFO,
    LOYALTY: PATH_MARKETING + PATH_LOYALTY,
    LOYALTY_LIST: PATH_MARKETING + PATH_LOYALTY + PATH_LIST,
    LOYALTY_CREATE: PATH_MARKETING + PATH_LOYALTY + PATH_CREATE,
    LOYALTY_EDIT: PATH_MARKETING + PATH_LOYALTY + PATH_EDIT,
    BUY_LINK: PATH_MARKETING + PATH_BUY_LINK + PATH_LIST,
    BUY_LINK_INTRO: PATH_MARKETING + PATH_BUY_LINK + PATH_INFO,
    NOTIFICATION: PATH_NOTIFICATION,
    NOTIFICATION_INTRO: PATH_NOTIFICATION + PATH_INFO,
    NOTIFICATION_PUSH_CREATE: PATH_NOTIFICATION + PATH_NOTIFICATION_PUSH + PATH_CREATE,
    NOTIFICATION_PUSH_EDIT: PATH_NOTIFICATION + PATH_NOTIFICATION_PUSH + PATH_EDIT,
    NOTIFICATION_EMAIL_CREATE: PATH_NOTIFICATION + PATH_NOTIFICATION_EMAIL + PATH_CREATE,
    NOTIFICATION_DETAIL: PATH_NOTIFICATION + PATH_DETAIL,
    LANDING_PAGE: PATH_MARKETING + PATH_LANDING_PAGE + PATH_LIST,
    LANDING_PAGE_EDIT: PATH_MARKETING + PATH_LANDING_PAGE + PATH_EDIT,
    LANDING_PAGE_DETAIL: PATH_MARKETING + PATH_LANDING_PAGE + PATH_DETAIL,
    LANDING_PAGE_CREATE: PATH_MARKETING + PATH_LANDING_PAGE + PATH_CREATE,
    EMAIL: PATH_MARKETING + PATH_EMAIL + PATH_LIST,
    EMAIL_CREATE: PATH_MARKETING + PATH_EMAIL + PATH_CREATE,
    EMAIL_EDIT: PATH_MARKETING + PATH_EMAIL + PATH_EDIT,
    GOOGLE_ANALYTICS: PATH_MARKETING + PATH_GOOGLE_ANALYTICS,
    GOOGLE_SHOPPING: PATH_MARKETING + PATH_GOOGLE_SHOPPING,
    FACEBOOK_PIXEL: PATH_MARKETING + PATH_FACEBOOK_PIXEL,
    LOYALTY_POINT: PATH_MARKETING + PATH_LOYALTY_POINT,
    LOYALTY_POINT_INTRO: PATH_MARKETING + PATH_LOYALTY_POINT + PATH_INTRO,
    LOYALTY_POINT_SETTING: PATH_MARKETING + PATH_LOYALTY_POINT + PATH_SETTING,
    GOOGLE_TAG_MANAGER: PATH_MARKETING + PATH_GOOGLE_TAG_MANAGER
};

const PATHS_SETTING = {
    ROOT: PATH_SETTING,
    SHIPPING_PAYMENT: PATH_SETTING + '?tabId=2',
    BANK_INFO: PATH_SETTING + '?tabId=3'
};

/**** Analytics ****/
const PATHS_ANALYTICS = {
    ROOT: PATH_ANALYTIC,
    ORDERS: PATH_ANALYTIC + PATH_ORDER,
    RESERVATIONS: PATH_ANALYTIC + PATH_RESERVATION
}

/**** Customers ****/
const PATH_ALL_CUSTOMERS = '/all-customers'
const PATH_SEGMENTS = '/segments'

const PATHS_CUSTOMERS = {
    ROOT: PATH_CUSTOMERS,
    CUSTOMERS_LIST: PATH_CUSTOMERS + PATH_ALL_CUSTOMERS + PATH_LIST,
    CUSTOMERS_EDIT: PATH_CUSTOMERS + PATH_ALL_CUSTOMERS + PATH_EDIT,
    SEGMENT_LIST: PATH_CUSTOMERS + PATH_SEGMENTS + PATH_LIST,
    SEGMENT_CREATE: PATH_CUSTOMERS + PATH_SEGMENTS + PATH_CREATE,
    SEGMENT_EDIT: PATH_CUSTOMERS + PATH_SEGMENTS + PATH_EDIT
}

/**** Channel path ****/
/** Storefront **/
const PATH_CHANNEL_STOREFRONT = PATH_CHANNEL + PATH_STOREFRONT;
const PATH_CHANNEL_STOREFRONT_CUSTOMIZATION = PATH_CHANNEL_STOREFRONT + PATH_CUSTOMIZATION;
const PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_THEME = PATH_CHANNEL_STOREFRONT + PATH_CUSTOMIZATION_THEME;
const PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_DESIGN = PATH_CHANNEL_STOREFRONT + PATH_CUSTOMIZATION + PATH_DESIGN;
const PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_INFO = PATH_CHANNEL_STOREFRONT + PATH_CUSTOMIZATION + PATH_INFO;
const PATH_CHANNEL_STOREFRONT__CUSTOM_PAGE = PATH_CHANNEL_STOREFRONT + PATH_CUSTOM_PAGE;
const PATH_CHANNEL_STOREFRONT_CREATE_CUSTOM_PAGE = PATH_CHANNEL_STOREFRONT + PATH_CUSTOM_PAGE + PATH_CREATE;
const PATH_CHANNEL_STOREFRONT_EDIT_CUSTOM_PAGE = PATH_CHANNEL_STOREFRONT + PATH_CUSTOM_PAGE + PATH_EDIT;
const PATH_CHANNEL_STOREFRONT_PAGE = PATH_CHANNEL_STOREFRONT + PATH_PAGE;
const PATH_CHANNEL_STOREFRONT_PAGE_CREATE = PATH_CHANNEL_STOREFRONT + PATH_PAGE + PATH_CREATE;
const PATH_CHANNEL_STOREFRONT_PAGE_EDIT = PATH_CHANNEL_STOREFRONT + PATH_PAGE + PATH_EDIT;
const PATH_CHANNEL_STOREFRONT_MENU = PATH_CHANNEL_STOREFRONT + PATH_MENU;
const PATH_CHANNEL_STOREFRONT_MENU_CREATE = PATH_CHANNEL_STOREFRONT + PATH_MENU + PATH_CREATE;
const PATH_CHANNEL_STOREFRONT_MENU_EDIT = PATH_CHANNEL_STOREFRONT + PATH_MENU + PATH_ITEM_ID + PATH_EDIT;
const PATH_CHANNEL_STOREFRONT_NAVIGATION = PATH_CHANNEL_STOREFRONT + PATH_NAVIGATION;
const PATH_CHANNEL_STOREFRONT_DOMAIN = PATH_CHANNEL_STOREFRONT + PATH_DOMAIN;
const PATH_CHANNEL_STOREFRONT_PREFERENCE = PATH_CHANNEL_STOREFRONT + PATH_PREFERENCE;
const PATH_CHANNEL_STOREFRONT_BLOG = PATH_CHANNEL_STOREFRONT + PATH_BLOG
const PATH_CHANNEL_STOREFRONT_BLOG_LIST = PATH_CHANNEL_STOREFRONT + PATH_BLOG + PATH_LIST;
const PATH_CHANNEL_STOREFRONT_BLOG_CREATE = PATH_CHANNEL_STOREFRONT + PATH_BLOG + PATH_CREATE;
const PATH_CHANNEL_STOREFRONT_BLOG_EDIT = PATH_CHANNEL_STOREFRONT + PATH_BLOG + PATH_EDIT;
const PATH_CHANNEL_STOREFRONT_BLOG_CATEGORY = PATH_CHANNEL_STOREFRONT_BLOG + PATH_CATEGORY + PATH_MANAGEMENT;
const PATH_CHANNEL_STOREFRONT_BLOG_CATEGORY_CREATE = PATH_CHANNEL_STOREFRONT_BLOG + PATH_CATEGORY + PATH_CREATE;
const PATH_CHANNEL_STOREFRONT_BLOG_CATEGORY_EDIT = PATH_CHANNEL_STOREFRONT_BLOG + PATH_CATEGORY + PATH_EDIT;


/** Lazada **/
const PATH_CHANNEL_LAZADA = PATH_CHANNEL + PATH_LAZADA;
const PATH_CHANNEL_LAZADA_ACCOUNT = PATH_CHANNEL_LAZADA + PATH_ACCOUNT;
const PATH_CHANNEL_LAZADA_PRODUCT = PATH_CHANNEL_LAZADA + PATH_PRODUCT;
const PATH_CHANNEL_LAZADA_PRODUCT_SYNC = PATH_CHANNEL_LAZADA + PATH_PRODUCT + PATH_SYNC;
const PATH_CHANNEL_LAZADA_PRODUCT_EDIT = PATH_CHANNEL_LAZADA + PATH_PRODUCT_EDIT;
/** Shopee **/
const PATH_CHANNEL_SHOPEE = PATH_CHANNEL + PATH_SHOPEE;
const PATH_CHANNEL_SHOPEE_ACCOUNT = PATH_CHANNEL_SHOPEE + PATH_ACCOUNT;
const PATH_CHANNEL_SHOPEE_PLAN = PATH_CHANNEL_SHOPEE + PATH_SHOPEE_PLAN;
const PATH_CHANNEL_SHOPEE_ACCOUNT_INTRO = PATH_CHANNEL_SHOPEE_ACCOUNT + PATH_ACCOUNT_INTRO;
const PATH_CHANNEL_SHOPEE_ACCOUNT_INFORMATION = PATH_CHANNEL_SHOPEE_ACCOUNT + PATH_ACCOUNT_INFORMATION;
const PATH_CHANNEL_SHOPEE_ACCOUNT_MANAGEMENT = PATH_CHANNEL_SHOPEE_ACCOUNT + PATH_ACCOUNT_MANAGEMENT;
const PATH_CHANNEL_SHOPEE_SETTINGS = PATH_CHANNEL_SHOPEE + PATH_SETTINGS;
const PATH_CHANNEL_SHOPEE_PRODUCT = PATH_CHANNEL_SHOPEE + PATH_PRODUCT;
const PATH_CHANNEL_SHOPEE_LINK_PRODUCTS = PATH_CHANNEL_SHOPEE + PATH_LINK_PRODUCTS;
const PATH_CHANNEL_SHOPEE_EDIT_PRODUCT = PATH_CHANNEL_SHOPEE + PATH_EDIT_PRODUCT;
const PATH_CHANNEL_SHOPEE_PRODUCT_SYNC = PATH_CHANNEL_SHOPEE + PATH_PRODUCT + PATH_SYNC;
const PATH_CHANNEL_SHOPEE_PRODUCT_LIST = PATH_CHANNEL_SHOPEE + PATH_PRODUCT + PATH_LIST;
/** Tiki **/
const PATH_CHANNEL_TIKI = PATH_CHANNEL + PATH_TIKI;
const PATH_CHANNEL_TIKI_ACCOUNT = PATH_CHANNEL_TIKI + PATH_ACCOUNT;
const PATH_CHANNEL_TIKI_PRODUCT = PATH_CHANNEL_TIKI + PATH_PRODUCT;
const PATH_CHANNEL_TIKI_EDIT_PRODUCT = PATH_CHANNEL_TIKI + PATH_EDIT_PRODUCT;
const PATH_CHANNEL_TIKI_PRODUCT_SYNC = PATH_CHANNEL_TIKI + PATH_PRODUCT + PATH_SYNC;
const PATH_CHANNEL_TIKI_RESOLVE_CODE = PATH_CHANNEL_TIKI + '/resolve-code';
/** Beecow **/
const PATH_CHANNEL_BEECOW = PATH_CHANNEL + PATH_BEECOW
const PATH_CHANNEL_BEECOW_ACCOUNT = PATH_CHANNEL_BEECOW + PATH_ACCOUNT
const PATH_SETTING_PAYPAL_CONNECTOR = PATH_SETTING + PATH_PAYPAL_CONNECT;

/** upgrade **/
const PATH_UPGRADE_IN_CHANNEL = PATH_UPGRADE + PATH_CHANNEL;


/** Call center**/
const PATH_CALL_CENTER_INTRO = PATH_CALL_CENTER + PATH_INTRO;
const PATH_CALL_CENTER_HISTORY_LIST = PATH_CALL_CENTER + PATH_HISTORY;

/** Theme engine **/
const PATH_THEME_MANAGEMENT = PATH_THEME + PATH_MANAGEMENT;
const PATH_THEME_LIBRARY = PATH_THEME + PATH_LIBRARY;
const PATH_THEME_PREVIEW = PATH_THEME + PATH_PREVIEW;

/** Cashbook **/
const PATH_CASHBOOK_MANAGEMENT = PATH_CASHBOOK + PATH_MANAGEMENT;

export const NavigationPath = {
    home: PATH_HOME,
    apiDocs: PATH_API_DOCS,
    dashboard: PATH_DASHBOARD,
    products: PATH_PRODUCT_LIST,
    productCreate: PATH_PRODUCT_CREATE,
    productWholeSaleCreate: PATH_PRODUCT_WHOLESALE_PRICE_CREATE,
    productWholeSaleEdit: PATH_EDIT_WHOLESALE_PRICE,
    productWholeSale: PATH_PRODUCT_WHOLESALE_PRICE,
    productEdit: PATH_PRODUCT_EDIT,
    variationDetailEdit: PATH_VARIATION_DETAIL_EDIT,
    productPrintBarCode: PATH_PRODUCT_PRINT_BARCODE,
    supplierCreate: PATH_SUPPLIER_CREAT,
    supplierEdit: PATH_SUPPLIER_EDIT,
    productConversionUnit: PATH_PRODUCT_UNIT_CONVERSION,
    productConversionUnitCreate: PATH_PRODUCT_UNIT_CONVERSION_CREATE,
    productConversionUnitEdit: PATH_PRODUCT_UNIT_CONVERSION_EDIT,
    productConversionUnitVariation: PATH_PRODUCT_UNIT_CONVERSION_VARIATION,
    productConversionUnitVariationCreate: PATH_PRODUCT_UNIT_CONVERSION_VARIATION_CREATE,
    productConversionUnitVariationEdit: PATH_PRODUCT_UNIT_CONVERSION_VARIATION_EDIT,

    liveChat: {
        ROOT: PATH_LIVE_CHAT,
        PATH_LIVE_CHAT_CONVERSATION,
        PATH_LIVE_CHAT_INTRO,
        PATH_ZALO_CHAT_INTRO,
        PATH_ZALO_CHAT_CONVERSATION,
        PATH_ZALO_CHAT_RESOLVE_TOKEN,
        PATH_LIVE_CHAT_CONFIGURATION,
        PATH_FACEBOOK
    },

    goSocial: {
        ROOT: PATH_GOSOCIAL,
        PATH_GOSOCIAL_INTRO,
        PATH_GOSOCIAL_CONVERSATION,
        PATH_GOSOCIAL_CONFIGURATION,
        PATH_GOSOCIAL_ZALO_CHAT_INTRO,
        PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION,
        PATH_GOSOCIAL_AUTOMATION,
        PATH_GOSOCIAL_AUTOMATION_EDIT,
        PATH_GOSOCIAL_AUTOMATION_CREATE,
        PATH_GOSOCIAL_BROADCAST,
        PATH_GOSOCIAL_BROADCAST_EDIT,
        PATH_GOSOCIAL_BROADCAST_CREATE
    },

    theme: {
        ROOT: PATH_THEME,
        PATH_THEME_MAKING
    },

    saleChannel: {
        ROOT: PATH_CHANNEL,
        storefront: {
            ROOT: PATH_CHANNEL_STOREFRONT,
            preferences: PATH_CHANNEL_STOREFRONT_PREFERENCE
        }
    },

    services: PATH_SERVICE_LIST,
    serviceCreate: PATH_SERVICE_CREATE,
    serviceEdit: PATH_SERVICE_EDIT,

    reviewProduct: PATH_REVIEW_PRODUCT_LIST,
    supplier: PATH_SUPPLIER_LIST,

    collections: PATH_COLLECTION_LIST,
    collectionCreate: PATH_COLLECTION_CREATE,
    collectionEdit: PATH_COLLECTION_EDIT,
    collectionsService: PATH_COLLECTION_SERVICE_LIST,
    collectionServiceCreate: PATH_COLLECTION_SERVICE_CREATE,
    collectionServiceEdit: PATH_COLLECTION_SERVICE_EDIT,
    orders: PATH_ORDER_LIST,
    orderDetail: PATH_ORDER_DETAIL,
    orderEdit: PATH_ORDER_EDIT,
    orderPrint: PATH_ORDER_PRINT,
    printLazadaShippingLabel: PATH_PRINT_LAZADA_SHIPPING_LABEL,
    orderPrintReceipt: PATH_ORDER_PRINT_RECEIPT,
    orderInStorePurchase: PATH_ORDER_INSTORE_PURCHASE,
    returnOderList: PATH_RETURN_ORDER_LIST,
    returnOrderWizard: PATH_RETURN_ORDER_WIZARD,
    returnOderCreate: PATH_RETURN_ORDER_CREATE,
    returnOderEdit: PATH_RETURN_ORDER_EDIT,
    affiliate: PATH_AFFILIATE,
    affiliateIntro: PATH_AFFILIATE_INTRO,
    affiliateInfo: PATH_AFFILIATE_INFO,
    affiliateCommission: PATH_AFFILIATE_COMMISSION,
    affiliateCommissionCreate: PATH_AFFILIATE_COMMISSION_CREATE,
    affiliateCommissionEdit: PATH_AFFILIATE_COMMISSION_EDIT,
    affiliateOrder: PATH_AFFILIATE_ORDER,
    affiliateInventory: PATH_AFFILIATE_INVENTORY,
    affiliatePartner: PATH_AFFILIATE_PARTNER,
    affiliatePartnerCreate: PATH_AFFILIATE_PARTNER_CREATE,
    affiliatePayout: PATH_AFFILIATE_PAYOUT,
    affiliateSetting: PATH_AFFILIATE_SETTING,
    affiliatePartnerEdit: PATH_AFFILIATE_PARTNER_EDIT,
    affiliateNotFound: PATH_AFFILIATE_NOT_FOUND,
    orderCreate: PATH_ORDER_CREATE,
    quotation: PATH_QUOTATION,
    reservations: PATH_RESERVATION_LIST,
    reservationDetail: PATH_RESERVATION_DETAIL,
    analytics: {...PATHS_ANALYTICS},
    // marketing: PATH_AUTOMATIC_ADS,
    automaticads: PATH_AUTOMATIC_ADS,

    flashSale: PATH_FlASH_SALE_LIST,
    createFlashSaleCampaign: PATH_CREATE_FLASH_SALE_CAMPAIGN,
    flashSaleTime: PATH_FLASH_SALE_TIME_LIST,
    editFlashSaleCampaign: PATH_EDIT_FLASH_SALE_CAMPAIGN,

    discounts: {...PATHS_PROMOTIONS},
    marketing: {...PATHS_MARKETING},
    storefront: PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_THEME,
    customization: PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_THEME,
    customizationDesign: PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_DESIGN,
    customizationInfo: PATH_CHANNEL_STOREFRONT_CUSTOMIZATION_INFO,
    customPages: PATH_CHANNEL_STOREFRONT__CUSTOM_PAGE,
    createCustomPage: PATH_CHANNEL_STOREFRONT_CREATE_CUSTOM_PAGE,
    editCustomPage: PATH_CHANNEL_STOREFRONT_EDIT_CUSTOM_PAGE,
    pages: PATH_CHANNEL_STOREFRONT_PAGE,
    pagesCreate: PATH_CHANNEL_STOREFRONT_PAGE_CREATE,
    pagesEdit: PATH_CHANNEL_STOREFRONT_PAGE_EDIT,
    menu: PATH_CHANNEL_STOREFRONT_MENU,
    menuAdd: PATH_CHANNEL_STOREFRONT_MENU_CREATE,
    menuEdit: PATH_CHANNEL_STOREFRONT_MENU_EDIT,
    navigations: PATH_CHANNEL_STOREFRONT_NAVIGATION,
    domains: PATH_CHANNEL_STOREFRONT_DOMAIN,
    settings: PATH_SETTING,
    settingsPlans: PATH_SETTING_PLANS,
    settingsLanguagesPlans: PATH_SETTING_LANGUAGES_PLANS,
    settingsCallCenterPlans: PATH_SETTING_CALL_CENTER_PLANS,
    settingsBranchPlans: PATH_SETTING_BRANCH_PLANS,
    settingsAffiliatePlans: PATH_SETTING_AFFILIATE_PLANS,
    settingPaypal: PATH_SETTING_PAYPAL_CONNECTOR,
    beecow: PATH_CHANNEL_BEECOW_ACCOUNT,
    beecowAccount: PATH_CHANNEL_BEECOW_ACCOUNT,
    shopee: PATH_CHANNEL_SHOPEE_ACCOUNT,
    shopeePlans: PATH_CHANNEL_SHOPEE_PLAN,
    shopeeAccount: PATH_CHANNEL_SHOPEE_ACCOUNT,
    shopeeAccountIntro: PATH_CHANNEL_SHOPEE_ACCOUNT_INTRO,
    shopeeAccountInformation: PATH_CHANNEL_SHOPEE_ACCOUNT_INFORMATION,
    shopeeAccountManagement: PATH_CHANNEL_SHOPEE_ACCOUNT_MANAGEMENT,
    shopeeSettings: PATH_CHANNEL_SHOPEE_SETTINGS,
    shopeeProduct: PATH_CHANNEL_SHOPEE_PRODUCT,
    shopeeLinkProducts: PATH_CHANNEL_SHOPEE_LINK_PRODUCTS,
    shopeeEditProduct: PATH_CHANNEL_SHOPEE_EDIT_PRODUCT,
    shopeeProductSync: PATH_CHANNEL_SHOPEE_PRODUCT_SYNC,
    shopeeProductList: PATH_CHANNEL_SHOPEE_PRODUCT_LIST,
    lazada: PATH_CHANNEL_LAZADA_ACCOUNT,
    lazadaAccount: PATH_CHANNEL_LAZADA_ACCOUNT,
    lazadaProduct: PATH_CHANNEL_LAZADA_PRODUCT,
    lazadaProductEdit: PATH_CHANNEL_LAZADA_PRODUCT_EDIT,
    lazadaProductSync: PATH_CHANNEL_LAZADA_PRODUCT_SYNC,
    tiki: PATH_CHANNEL_TIKI_ACCOUNT,
    tikiAccount: PATH_CHANNEL_TIKI_ACCOUNT,
    tikiProduct: PATH_CHANNEL_TIKI_PRODUCT,
    tikiEditProduct: PATH_CHANNEL_TIKI_EDIT_PRODUCT,
    tikiProductSync: PATH_CHANNEL_TIKI_PRODUCT_SYNC,
    tikiResolveCode: PATH_CHANNEL_TIKI_RESOLVE_CODE,
    login: PATH_LOGIN,
    staffLogin: PATH_STAFF_LOGIN,
    forgot: PATH_FORGOT,
    staffForgot: PATH_STAFF_FORGOT,
    reset: PATH_RESET,
    wizard: PATH_WIZARD,
    notFound: PATH_NOT_FOUND,
    error: PATH_INTERNAL_ERROR,
    logout: PATH_LOGOUT,
    redirect: PATH_REDIRECT,
    paymentCallback: PATH_PAYMENT_CALLBACK,
    paymentCallbackEpay: PATH_PAYMENT_CALLBACK_EPAY,
    paymentCallbackChaiPay: PATH_PAYMENT_CALLBACK_CHAIPAY,
    upgradeInChannel: PATH_UPGRADE_IN_CHANNEL,
    setting: {...PATHS_SETTING},
    customers: {...PATHS_CUSTOMERS},
    variationDetail: PATH_VARIATION_DETAIL,
    product: PATH_PRODUCT,
    linkProducts: PATH_LINK_PRODUCTS,
    callCenter: {
        ROOT: PATH_CALL_CENTER_HISTORY_LIST,
        PATH_CALL_CENTER_INTRO,
        PATH_CALL_CENTER_HISTORY_LIST
    },
    inventory: PATH_PRODUCT_INVENTORY,
    inventoryHistory: PATH_INVENTORY_HISTORY,
    inventoryTracking: PATH_INVENTORY_TRACKING,
    transferStock: PATH_PRODUCT_TRANSFER_LIST,
    partnerTransferStock: PATH_AFFILIATE_PRODUCT_TRANSFER_LIST,
    purchaseOrder: PATH_PRODUCT_PURCHASE_ORDER,
    themeEngine: {
        management: PATH_THEME_MANAGEMENT,
        library: PATH_THEME_LIBRARY,
        making: PATH_THEME_MAKING,
        preview: PATH_THEME_PREVIEW,
    },
    previewLandingPage: PATH_MARKETING + PATH_LANDING_PAGE + PATH_PREVIEW,
    blog: PATH_CHANNEL_STOREFRONT_BLOG_LIST,
    articleCreate: PATH_CHANNEL_STOREFRONT_BLOG_CREATE,
    articleEdit: PATH_CHANNEL_STOREFRONT_BLOG_EDIT,
    blogCategoryManagement: PATH_CHANNEL_STOREFRONT_BLOG_CATEGORY,
    blogCategoryCreate: PATH_CHANNEL_STOREFRONT_BLOG_CATEGORY_CREATE,
    blogCategoryEdit: PATH_CHANNEL_STOREFRONT_BLOG_CATEGORY_EDIT,
    loyaltyPointIntro: PATHS_MARKETING.LOYALTY_POINT_INTRO,
    loyaltyPointSetting: PATHS_MARKETING.LOYALTY_POINT_SETTING,
    transferStockEdit: PATH_PRODUCT_TRANSFER_EDIT,
    transferStockCreate: PATH_PRODUCT_TRANSFER_CREATE,
    partnerTransferStockEdit: PATH_AFFILIATE_PRODUCT_TRANSFER_EDIT,
    partnerTransferStockCreate: PATH_AFFILIATE_PRODUCT_TRANSFER_CREATE,
    transferStockWizard: PATH_PRODUCT_TRANSFER_WIZARD,
    partnerTransferStockWizard: PATH_AFFILIATE_PRODUCT_TRANSFER_WIZARD,
    purchaseOrderEdit: PATH_PRODUCT_PURCHASE_ORDER_EDIT,
    purchaseOrderCreate: PATH_PRODUCT_PURCHASE_ORDER_CREATE,
    purchaseOrderWizard: PATH_PRODUCT_PURCHASE_ORDER_WIZARD,
    cashbook: {
        management: PATH_CASHBOOK_MANAGEMENT
    },
    downloadFile: PATH_DOWNLOAD_FILE
};


export const NavigationKey = {
    home: 'home',
    apiDocs: 'api-docs',
    dashboard: 'dashboard',
    products: {
        product: 'product_product',
        productCollection: 'product_collection',
        reviewProduct: 'review_product',
        inventory: "product_inventory",
        transferStock: "product_transfer_stock",
        supplier: "supplier",
        orderPurchase: "product_purchase_order"
    },
    services: {
        service: 'product_service',
        serviceCollection: 'service_collection'
    },
    liveChat: {
        intro: 'live-chat_intro',
        conversation: 'live-chat_conversation',
        facebook: 'live-chat-fb',
        zalo: 'live-chat-zl',
        configuration: 'live-chat-configuration',
        facebookChat: 'facebook_chat'
    },

    goSocial: {
        intro: 'gosocial_intro',
        zalo: 'gosocial_zalo',
        facebook: {
            conversation: 'gosocial_conversation',
            configuration: 'gosocial-configuration',
            automation: 'gosocial-automation',
            broadcast: 'gosocial-broadcast',
        },
        zaloConversation: 'gosocial_zalo_conversation',
    },

    theme: {
        making: 'making-theme'
    },

    productProduct: 'product_product',
    productService: 'product_service',
    inventory: 'product_inventory',
    transferStock: "product_transfer_stock",
    purchaseOrder: "product_purchase_order",
    productCollection: 'product_collection',
    serviceCollection: 'service_collection',
    reviewProduct: 'review_product',
    supplier: 'supplier',
    orders:{
        order: 'orders',
        inStorePurchase: 'orderInStorePurchase',
        quotation: 'quotation',
        returnOrder: 'returnOrder'
    },

    reservations: 'reservations',
    promotion: {
        discounts: 'discounts',
        flashSale: 'flashSale',
    },
    createFlashSaleCampaign: 'createFlashSaleCampaign',
    analytics: {
        orders: 'analytics_orders',
        reservations: 'analytics_reservations'
    },
    marketing: {
        automaticAds: 'automaticsAds',
        notification: 'notification',
        loyaltyProgram: 'loyalty-program',
        landingPage: 'landing-page',
        buyLink: 'buy-link',
        email: 'email',
        googleAnalytics: 'google-analytics',
        googleShopping: 'google-shopping',
        facebookPixel: 'facebook-pixel',
        loyaltyPoint: 'loyalty-point',
        googleTagManager: 'google-tag-manager',
        affiliate: 'affiliate',
    },
    customers: {
        customers: 'customers',
        segments: 'segments'
    },
    shopee: [
        'shopee-account-management', 'shopee-account', 'shopee-account-information', 'shopee-product', 'shopee-link-products', 'shopee-plans', 'shopee-account-intro', 'shopee-settings'
    ],
    lazada: [
        'lazada-account', 'lazada-product'
    ],
    tiki: [
        'tiki-account', 'tiki-product'
    ],
    beecow: [
        'beecow-account'
    ],
    customization: 'customization',
    pages: 'pages',
    menu: 'menu',
    customPages: "custom-pages",
    menuAdd: 'menu-add',
    menuEdit: 'menu-edit',
    navigations: 'navigations',
    domains: 'domains',
    preferences: 'preferences',
    storefront: {
        customization: 'customization',
        pages: 'pages',
        menu: 'menu',
        menuAdd: 'menu-add',
        menuEdit: 'menu-edit',
        navigations: 'navigations',
        domains: 'domains',
        preferences: 'preferences',
        blog: 'blog',
        articleEdit: 'article-edit',
        articleCreate: 'article-create',
        customPages: 'customPages',
        blogCategory: 'blog-category',
        blogCategoryCreate: 'create-blog-category',
        blogCategoryEdit: 'edit-blog-category',
    },
    settings: 'settings',
    settingPaypal: 'setting-paypal',
    shopeePlans: 'shopee-plans',
    shopeeLinkProducts: 'shopee-link-products',
    shopeeAccount: 'shopee-account',
    shopeeAccountIntro: 'shopee-account-intro',
    shopeeAccountInformation: 'shopee-account-information',
    shopeeAccountManagement: 'shopee-account-management',
    shopeeSettings: 'shopee-settings',
    shopeeProduct: 'shopee-product',
    lazadaAccount: 'lazada-account',
    lazadaProduct: 'lazada-product',
    tikiAccount: 'tiki-account',
    tikiProduct: 'tiki-product',
    tikiResolveCode: 'tiki-resolve-code',
    beecowAccount: 'beecow-account',
    callCenter: {
        intro: 'call-center_intro',
        callHistory: 'call-center_history'
    },
    themeEngine: {
        management: 'theme-management',
        library: 'theme-library',
        preview: 'theme-preview',
    },
    languagesPlans: 'settings-languages-plans',
    previewLandingPage: 'preview-landing-page',
    affiliate: {
        affiliate: 'affiliate',
        affiliateInfo: 'affiliate-info',
        affiliateIntro: 'affiliate-intro',
    },
    affiliateCommission: {
        affiliateCommission: 'affiliate-commission',
        affiliateCommissionCreate: 'affiliate-commission-create',
        affiliateCommissionEdit: 'affiliate-commission-edit',
    },
    affiliateOrder: {
        affiliateOrder: 'affiliate-order',
    },
    affiliateInventory: {
        affiliateInventory:'affiliate-inventory',
        affiliateTransferGoods:'affiliate-transfer-goods',
    },
    affiliatePartner: {
        affiliatePartner: 'affiliate-partner',
        affiliatePartnerCreate: 'affiliate-partner-create',
        affiliatePartnerEdit: 'affiliate-partner-edit'
    },
    affiliatePayout: {
        affiliatePayout: 'affiliate-payout'
    },
    affiliateSetting: {
        affiliateSetting: 'affiliate-setting'
    },
    cashbook: {
        management: 'cashbook-management'
    }
};
