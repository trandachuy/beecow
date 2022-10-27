import {NavigationPath} from "./NavigationPath";

const Constants = {
    STORAGE_KEY_OTA: "seeOTA",
    STORAGE_KEY_STORE_ID: "storeId",
    STORAGE_KEY_INITIAL_LANGUAGE: "initialLanguage",
    STORAGE_KEY_STORE_FULL: "storeFull",
    STORAGE_KEY_STORE_DOMAIN: "storeDomain",
    STORAGE_KEY_USER_ID: "userId",
    STORAGE_KEY_ACCESS_TOKEN: "accessToken",
    STORAGE_KEY_REFRESH_TOKEN: "refreshToken",
    STORAGE_KEY_LANG_KEY: "langKey",
    STORAGE_KEY_SHOPEE: "shopee",
    STORAGE_KEY_SHOPEE_BRANCH_ID: "shopeeBranchId",
    STORAGE_KEY_SHOPEE_ID: "shopeeId",
    STORAGE_KEY_SHOPEE_SHOP_ID: "shopeeShopId",
    STORAGE_KEY_IS_EXPLORED_NOTIFICATION: "isExporedNotification",
    STORAGE_KEY_IS_EXPLORED_BUY_LINK: "isExporedBuyLink",
    STORAGE_KEY_IS_EXPLORED_FLASH_SALE: "isExporedFlashSale",
    STORAGE_KEY_STORE_OWNER_ID: "storeOwnerId",
    STORAGE_KEY_LIVE_CHAT_PAGE_ID: "liveChatPageId",
    STORAGE_KEY_LIVE_CHAT_APP_SECRET_PROOF: "appSecretProof",
    STORAGE_KEY_LIVE_CHAT_PAGE_TOKEN: "liveChatPageToken",
    STORAGE_KEY_ZALO_CHAT_PAGE_ID: "zaloPageId",
    STORAGE_KEY_ZALO_CHAT_PAGE_TOKEN: "zaloPageToken",
    STORAGE_KEY_PUBLISHED_THEME: "publishedTheme",
    STORAGE_KEY_CHECKED_ORDER: "checkOrder",
    STORAGE_KEY_SELECTED_ORDER: "selectOrder",
    STORAGE_KEY_INFORMATION_ORDER: "informationPrintOrder",
    STORAGE_KEY_LAZADA_ID: "lazadaId",
    STORAGE_KEY_LAZADA_TOKEN: "lazadaToken",
    STORAGE_KEY_EXP_DATE: "expTime",
    STORAGE_KEY_PLAN_TYPE: "packageType",
    STORAGE_KEY_PLAN_NAME: "packageName",
    STORAGE_KEY_PLAN_ID: "packageId",
    STORAGE_KEY_EXP_ID: "expiredId",
    STORAGE_KEY_PLAN_REG_DATE: "regTime",
    STORAGE_KEY_CURRENT_PLANS: "currentPlans",
    STORAGE_KEY_TIKI: "tiki",
    STORAGE_KEY_STORE_DEFAULT_BRANCH: "defaultBranchId",
    STORAGE_KEY_DONT_SHOW_CHOOSE_DEFAULT_BRANCH: "dontShowDefaultBranch",
    STORAGE_KEY_LOYALTY_POINT_SETTING: "loyaltyPointSetting",
    STORAGE_KEY_STORE_NAME: "storeName",
    STORAGE_KEY_STORE_URL: "storeUrl",
    STORAGE_KEY_STORE_IMAGE: "storeImage",
    STORAGE_KEY_STORE_PHONE: "storePhone",
    STORAGE_KEY_STORE_ADDRESS: "storeAddress",
    STORAGE_KEY_STORE_EMAIL: "storeEmail",
    STORAGE_KEY_SHOPEE_SYNC_PARTS: "shopeeSyncParts",
    STORAGE_KEY_LAST_SUPPORT_OLD_ENGINE_DATE: "lastSupportOldEngineDate",

    STORAGE_KEY_REF_CODE: "refCode",
    STORAGE_KEY_SIGNUP_STORE: "signupStore",
    STORAGE_KEY_SIGNUP_WARNING_FLAG: "signupWarningFlag",
    STORAGE_KEY_PRINT_DATA_PRODUCT_BARCODE: "printDataProductBarCode",
    STORAGE_KEY_DOMAIN: "domain",
    STORAGE_KEY_FORCE_ACTIVATE: "forceActivate",
    STORAGE_KEY_RECONNECT_SHOPEE_SHOP_ID: "reconnectShopeeShopId",
    STORAGE_KEY_RECONNECT_SHOPEE_SHOP_NAME: "reconnectShopeeShopName",
    STORAGE_KEY_RECONNECT_SHOPEE_BRANCH_ID: "reconnectShopeeBranchId",

    STORAGE_KEY_FORCE_LOGOUT: "fL",
    STORAGE_KEY_FORCE_LOGOUT_REASON_PASSWORD_CHANGED: "fLRpwdc",
    STORAGE_KEY_FORCE_LOGOUT_REASON_RESELLER_EXPIRED: "fLRre",
    STORAGE_KEY_FORCE_LOGOUT_MSG: "fLm",
    STORAGE_KEY_RESELLER_FROM_STORE_NAME: "resellerFromStoreName",
    STORAGE_KEY_RESELLER_FROM_STORE_ID: "resellerFromStoreId",
    STORAGE_KEY_PAYPAL_LINK: "paypalLink",
    STORAGE_KEY_ORDER_COLUMN_SETTING: 'orderColumnSetting',
    STORAGE_KEY_CUSTOMER_COLUMN_SETTING: 'customerColumnSetting',

    HTTP_STATUS_BAD_REQUEST: 400,
    HTTP_STATUS_UNAUTHORIZED: 401,
    HTTP_STATUS_NOT_FOUND: 404,
    HTTP_STATUS_SERVER_ERROR: 500,
    HTTP_STATUS_BAD_GATEWAY: 502,
    HTTP_STATUS_SUCCESS: [200, 201],
    APP_NAME: process.env.APP_NAME,

    AFFILIATE_SERVICE: "affiliateservice",
    STORE_SERVICE: "storeservice",
    CATALOG_SERVICE: "catalogservices",
    BEEHIVE_SERVICE: "beehiveservices",
    MEDIA_SERVICE: "mediaservices",
    ITEM_SERVICE: "itemservice",
    LAZADA_SERVICE: "lazadaservices",
    ORDER_BC_SERVICE: "orderservices2",
    SHOPEE_SERVICE: "shopeeservices",
    USER_SERVICE: "userservices",
    FACEBOOK_SERVICE: "facebookservices",
    ZALO_SERVICE: "zaloservices",
    TIKI_SERVICE: "tikiservices",
    THEME_SERVICE: "themeservices",
    SSR_STOREFRONT: "ssrstorefront",
    CALL_CENTER_SERVICE: "callcenterservices",
    MAIL_SERVICE: "mailservice",
    BILLING_INFO_SERVICE: "billinginfoservices",
    CASHBOOK_SERVICE: "cashbookservice",
    PAYMENT_SERVICE: "paymentservices",

    IMAGE_TYPE_PNG: "image/png",
    IMAGE_TYPE_JPEG: "image/jpeg",

    URL_TYPE_YOUTUBE_VIDEO: "YOUTUBE_VIDEO",
    URL_TYPE_FACEBOOK: "FACEBOOK",
    URL_TYPE_INSTAGRAM: "INSTAGRAM",
    URL_TYPE_VIBER: "VIBER",
    URL_TYPE_ADDRESS_PAGE: "ADDRESS_PAGE",

    YOUTUBE_URL_VIDEO_PATTERN:
        /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
    YOUTUBE_URL_PATTERN: "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+",
    HTTP_PREFIX_PATTERN: /^http:\/\//,
    HTTPS_PREFIX_PATTERN: /^https:\/\//,
    HTTP_PREFIX: "http://",
    EXTEND_URL_PATTERN: "^[A-Za-z0-9./:?=%_&+-]+$",
    CATALOG_TYPE_PRODUCT: "PRODUCT",
    LANGUAGE_VI: "vi",

    SLASHES: "/",
    IMAGE_JPG_EXT: ".jpg",

    SITE_CODE_SHOPEE: "SHOPEE",
    SITE_CODE_LAZADA: "LAZADA",
    SITE_CODE_BEECOW: "BEECOW",
    SITE_CODE_GOSELL: "GOSELL",
    SITE_CODE_GOMUA: "GOMUA",

    AUTHOR_TYPE_USER: "USER",
    AUTHOR_TYPE_STORE: "STORE",

    RESERVATION_STATUS_COMPLETED: "COMPLETED",
    RESERVATION_STATUS_CANCELLED: "CANCELLED",

    ORDER_STATUS_PENDING: "PENDING",
    ORDER_STATUS_DELIVERED: "DELIVERED",
    ORDER_STATUS_CANCELLED: "CANCELLED",
    ORDER_STATUS_TO_SHIP: "TO_SHIP",
    ORDER_STATUS_SHIPPED: "SHIPPED",
    ORDER_STATUS_RETURNED: "RETURNED",
    ORDER_STATUS_WAITING_FOR_PICKUP: "WAITING_FOR_PICKUP",
    ORDER_STATUS_IN_CANCEL: "IN_CANCEL",

    ORDER_STATUS_LIST: [
        "PENDING",
        "TO_SHIP",
        "WAITING_FOR_PICKUP",
        "IN_CANCEL",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
    ],

    PRODUCT_STATUS_LIST: ["ACTIVE", "INACTIVE", "ERROR"],

    PRODUCT_CHANNEL_LIST: ["SHOPEE", "LAZADA"],

    PRODUCT_PLATFORM_LIST: ["WEB", "APP", "IN_STORE", "IN_GOSOCIAL", "NONE"],

    DEFAULT_PAYMENT_METHOD: ["VISA", "ATM", "COD", "ZALO", "MOMO"],
    ORDER_PAYMENT_METHOD_COD: "COD",
    ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD_SERVICE: "CREDIT_DEBIT_CARD",
    ORDER_PAYMENT_METHOD: "PAYMENT_METHOD",
    ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD: "VISA",
    ORDER_PAYMENT_METHOD_INSTALLMENT: "INSTALLMENT",
    ORDER_PAYMENT_METHOD_ONLINE_BANKING: "ATM",
    ORDER_PAYMENT_METHOD_CYBERSOURCE: "CYBERSOURCE",
    ORDER_PAYMENT_METHOD_AIRPAY_CREDIT_CARD: "AIRPAY_CREDIT_CARD",
    ORDER_PAYMENT_METHOD_BANK_TRANSFER: "BANK_TRANSFER",
    ORDER_PAYMENT_METHOD_SHOPEE_WALLET: "SHOPEE_WALLET",
    ORDER_PAYMENT_METHOD_BUYER_SELLER_SELF_ARRANGE: "BUYER_SELLER_SELF_ARRANGE",
    ORDER_PAYMENT_METHOD_FREE: "FREE",
    ORDER_PAYMENT_METHOD_CASH: "CASH",
    ORDER_PAYMENT_METHOD_MPOS: "POS",
    ORDER_PAYMENT_METHOD_ONLINE_BANKING_SERVICE: "ONLINE_BANKING",
    ORDER_PAYMENT_METHOD_ZALO: "ZALO",
    ORDER_PAYMENT_METHOD_MOMO: "MOMO",
    ORDER_PAYMENT_METHOD_PAYPAL: "PAYPAL",
    ORDER_PAYMENT_METHOD_DEBT: "DEBT",
    ORDER_PAYMENT_OPTION_PRODUCT: "PRODUCT",
    ORDER_PAYMENT_OPTION_SERVICE: "SERVICE",
    ORDER_VISA_ATM_OPTION_SERVICE: "VISA_ATM",
    ORDER_PAYMENT_OPTION_DISPLAY_BUTTON_PAYPAL: "DISPLAY_BUTTON_PAYPAL",

    SHOPEE_ORDER_CANCEL_REASON_OUT_OF_STOCK: "OUT_OF_STOCK",
    SHOPEE_ORDER_CANCEL_REASON_CUSTOMER_REQUEST: "CUSTOMER_REQUEST",
    SHOPEE_ORDER_CANCEL_REASON_UNDELIVERABLE_AREA: "UNDELIVERABLE_AREA",
    SHOPEE_ORDER_CANCEL_REASON_COD_NOT_SUPPORTED: "COD_NOT_SUPPORTED",

    LAZADA_ORDER_CANCEL_REASON_OUT_OF_STOCK: 15,
    LAZADA_ORDER_CANCEL_REASON_WRONG_PRICE: 21,
    LAZADA_ORDER_CANCEL_REASON_OUT_OF_STOCK_TEXT:
        "page.order.detail.cancelOrder.lazada.outOfStock",
    LAZADA_ORDER_CANCEL_REASON_WRONG_PRICE_TEXT:
        "page.order.detail.cancelOrder.lazada.wrongPrice",

    CHANNEL_PAYMENT_LISTENER: "gosell-dashboard-payment",

    CHANNEL_PAYMENT_CALL_CENTER_LISTENER: "gosell-payment-call-center",

    CHANNEL_PAYMENT_BRANCH_LISTENER: "gosell-payment-branch",

    CHANNEL_PAYMENT_BUYING_FACEBOOK_CREDIT_LISTENER:
        "gosell-buying-facebook-credit-payment",

    CHANNEL_PAYMENT_SHOPEE_ACCOUNT_LISTENER: "gosell-payment-shopee-account",

    CHANNEL_PAYMENT_MULTI_LANGUAGE_LISTENER: "gosell-payment-multi-language",

    CHANNEL_PAYMENT_AFFILIATE_DROP_SHIP_LISTENER: "gosell-payment-affiliate-drop-ship",

    CHANNEL_PAYMENT_AFFILIATE_RESELLER_LISTENER: "gosell-payment-affiliate-reseller",

    CHANNEL_PRODUCT_DETAIL: "gosell-product-detail",

    IS_WIZARD: "isWizard",

    N1_000: 1000,
    N10_000: 10000,
    N100_000: 100000,
    N1_000_000: 1000000,
    N10_000_000: 10000000,
    N100_000_000: 100000000,
    N1_000_000_000: 1000000000,

    N0: 0,
    N120_000_000: 120000000,
    N999_999: 999999,

    StoreUrlType: {
        FACEBOOK: "FACEBOOK",
        YOUTUBE_CHANNEL: "YOUTUBE_CHANNEL",
        YOUTUBE_VIDEO: "YOUTUBE_VIDEO",
        TWITTER: "TWITTER",
        INSTAGRAM: "INSTAGRAM",
        VIBER: "VIBER",
        ADDRESS_PAGE: "ADDRESS_PAGE",
        POLICY_PAGE: "POLICY_PAGE",
        OTHER_PAGE: "OTHER_PAGE",
        STOREFRONT: "STOREFRONT",
    },

    SaleChannels: {
        SHOPEE: "SHOPEE",
        LAZADA: "LAZADA",
        GOSELL: "GOSELL",
        BEECOW: "BEECOW",
        LANDING_PAGE: "LANDING_PAGE",
        GOMUA: "GOMUA",
        TIKI: "TIKI",
        CONTACT_FORM: "CONTACT_FORM",
        IMPORTED: "IMPORTED",
    },

    Gender: {
        MALE: "MALE",
        FEMALE: "FEMALE",
    },

    DashBoardChartType: {
        TODAY: "TODAY",
        YESTERDAY: "YESTERDAY",
        THIS_WEEK: "THIS_WEEK",
        LAST_WEEK: "LAST_WEEK",
        THIS_MONTH: "THIS_MONTH",
        LAST_MONTH: "LAST_MONTH",
        ALL_TIME: "ALL_TIME",
    },

    SaleChannelId: {
        SHOPEE: "1002",
        LAZADA: "1001",
        TIKI: "1003",
    },

    CountryCode: {
        VIETNAM: "VN",
        US: 'US'
    },

    LanguageKey: {
        VIETNAMESE: "vi",
        ENGLISH: "en",
    },

    LogisticCode: {
        Shopee: {
            VIETTEL_POST: 50010,
            GIAO_HANG_NHANH: 50011,
            GIAO_HANG_TIET_KIEM: 50012,
            DELIVERY_NOW: 50014,
            VNPOST_NHANH: 50015,
            VNPOST: 50013,
            VNPOST_TIET_KIEM: 50016,
            JT_EXPRESS: 50018,
            STANDARD_EXPRESS: 50007,
        },
        Common: {
            GIAO_HANG_NHANH: "giaohangnhanh",
            GIAO_HANG_TIET_KIEM: "giaohangtietkiem",
            VNPOST: "vnpost",
            SELF_DELIVERY: "selfdelivery",
            AHAMOVE: "ahamove_bike",
            AHAMOVE_TRUCK: "ahamove_truck",
        },
        Province: {
            LIST_SHOW_ADDRESS_LEVEL_4:["VN-35"],
        },
    },

    AccountStatus: {
        ACTIVATED: "Activated",
        EXPIRED: "Expired",
    },

    AccountType: {
        EMAIL: "EMAIL",
        FACEBOOK: "FACEBOOK",
    },

    Package: {
        TRIAL: 3,
        BASIC: 1,
        PREMIUM: 2,
    },

    PackageType: {
        PAID: "PAID",
        TRIAL: "TRIAL",
    },

    ListingWebsite: {
        PRODUCT: "product",
        SERVICE: "service",
        ACTION: {
            DISABLED: 0,
            PRODUCT_ENABLED: 1,
            SERIVCE_ENABLED: 2,
            BOTH_ENABLED: 3,
        },
    },

    UrlRefs: {
        LEARN_MORE_CUSTOMIZATION: "http://bit.ly/tuychinhcuahanggosell",
        LEARN_MORE_ADD_BANK_ACCOUNT: "http://bit.ly/themtaikhoannganhang",
        LEARN_MORE_ACCOUNT_SETTING: "http://bit.ly/caidattaikhoangosell",
        LEARN_MORE_CUSTOM_DOMAIN:
            "https://huongdan.gosell.vn/faq_category/cai-dat-ten-mien/",
        LEARN_MORE_AUTHENTICATE_LAZADA: "http://bit.ly/ketnoilazadagosell",
        LEARN_MORE_AUTHENTICATE_SHOPEE:
            "https://www.gosell.vn/multiple-shopee.html",
        LEARN_MORE_CUSTOM_MENU:
            "https://huongdan.gosell.vn/faq_category/danh-muc-goweb/",
        LEARN_MORE_COLLECTION:
            "https://huongdan.gosell.vn/faq_category/bo-suu-tap-goweb/",
        LEARN_MORE_PAGE: "https://huongdan.gosell.vn/faq_category/trang-goweb/",
        LEARN_MORE_MARKETING_AUTOMATIC_ADS:
            "http://bit.ly/quang-cao-tu-dong-gosell",
        LEARN_MORE_FIND_FACEBOOK_ID:
            "https://huongdan.gosell.vn/faq_category/gochat-goweb/",
        LEARN_MORE_AFFILIATE:
            "https://www.gosell.vn/affiliate-program.html",
    },
    PASSWORD_PATTERN:
        "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!\"#$%&'()*+,\\-.\\/:;<=>?@[\\]^_`{|}~])[A-Za-z\\d!\"#$%&'()*+,\\-.\\/:;<=>?@[\\]^_`{|}~]{8,}$",
    NUMBER_AND_CHARACTER_PATTERN: "^[A-Za-z0-9]+$",
    DeliveryNames: {
        SELF_DELIVERY: "selfdelivery",
    },

    STOREFRONT_DEFAULT: "storefront_default",
    DEFAULT_COLOR: [
        "880000",
        "00307E",
        "075800",
        "C85B00",
        "E94F6A",
        "82026E",
        "00807B",
        "E3AB00",
        "151515",
    ],

    ITEM_TYPE: {
        BUSINESS_PRODUCT: "BUSINESS_PRODUCT",
        SERVICE: "SERVICE",
    },
    SIZE_PER_PAGE: 20,
    PROVINCE_CODES: {
        AN_GIANG: "VN-44",
        BA_RIA_VUNG_TAU: "VN-43",
        BAC_CAN: "VN-53",
        BAC_GIANG: "VN-54",
        BAC_LIEU: "VN-55",
        BAC_NINH: "VN-56",
        BEN_TRE: "VN-50",
        BINH_DINH: "VN-31",
        BINH_DUONG: "VN-57",
        BINH_PHUOC: "VN-58",
        BINH_THUAN: "VN-40",
        CA_MAU: "VN-59",
        CAN_THO: "VN-CT",
        CAO_BANG: "VN-04",
        DA_NANG: "VN-DN",
        DAK_LAK: "VN-33",
        DAK_NONG: "VN-72",
        DIEN_BIEN: "VN-71",
        DONG_NAI: "VN-39",
        DONG_THAP: "VN-45",
        GIA_LAI: "VN-30",
        HA_GIANG: "VN-03",
        HA_NAM: "VN-63",
        HA_NOI: "VN-HN",
        HA_TINH: "VN-23",
        HAI_DUONG: "VN-61",
        HAI_PHONG: "VN-HP",
        HAU_GIANG: "VN-73",
        HO_CHI_MINH: "VN-SG",
        HOA_BINH: "VN-14",
        HUNG_YEN: "VN-66",
        KHANH_HOA: "VN-34",
        KIEN_GIANG: "VN-47",
        KON_TUM: "VN-28",
        LAI_CHAU: "VN-01",
        LAM_DONG: "VN-35",
        LANG_SON: "VN-09",
        LAO_CAI: "VN-02",
        LONG_AN: "VN-41",
        NAM_DINH: "VN-67",
        NGHE_AN: "VN-22",
        NINH_BINH: "VN-18",
        NINH_THUAN: "VN-36",
        OTHERS: "VN-OTHER",
        PHU_THO: "VN-68",
        PHU_YEN: "VN-32",
        QUANG_BINH: "VN-24",
        QUANG_NAM: "VN-27",
        QUANG_NGAI: "VN-29",
        QUANG_NINH: "VN-13",
        QUANG_TRI: "VN-25",
        SOC_TRANG: "VN-52",
        SON_LA: "VN-05",
        TAY_NINH: "VN-37",
        THAI_BINH: "VN-20",
        THAI_NGUYEN: "VN-69",
        THANH_HOA: "VN-21",
        THUA_THIEN_HUE: "VN-26",
        TIEN_GIANG: "VN-46",
        TRA_VINH: "VN-51",
        TUYEN_QUANG: "VN-07",
        VINH_LONG: "VN-49",
        VINH_PHUC: "VN-70",
        YEN_BAI: "VN-06",
    },
    DEPOSIT_CODE: {
        CODE: "[d3p0s1t]",
        FULL: "[100P3rc3nt]",
    },

    CALL_CENTER: {
        ROOT: "ROOT",
        ACTIVE: 3,
        PENDING: 1,
        FAILED: 2,
        STATE: "CALL_CENTER_STATE",
        AWAIT_APPROVE: "CALL_CENTER_AWAIT_APPROVE",
    },

    OMI_CALL: {
        DATA: "OMI_CALL_DATA",
        STATUS: {
            AWAIT_APPROVE: "SETTING_UP",
            EXPIRED: "EXPIRED",
            ACTIVE: "ACTIVE",
            RENEWING: "RENEWING",
        },
    },

    EXTENSION_STATUS: {
        ACTIVE: "ACTIVE",
        EXPIRED: "EXPIRED",
    },

    EXTENSION_TYPE: {
        LIMITED: "LIMITED",
        UNLIMITED: "UNLIMITED",
    },

    CALL_STATE: {
        SUCCESSFUL: "SUCCESSFUL",
        DECLINED: "DECLINED",
        NON_SUCCESSFUL: "NON_SUCCESSFUL",
    },

    CALL_TYPE: {
        OUTBOUND: "OUTBOUND",
        INBOUND: "INBOUND",
    },

    VHT_STATE: {
        REQUESTED: "REQUESTED",
        ACTIVE: "ACTIVE",
        BLOCKED: "BLOCKED",
        ERROR: "ERROR",
    },

    SUPPORT_CHAT: {
        SHOW_SUPPORT_CHAT: "showSupportChat",
    },

    USE_NEW_GOSOCIAL: 'useNewGoSocial',

    IS_OLD_GOSOCIAL_MENU: 'isOldGoSocialMenu',
    IS_EXIST_GOSOCIAL: 'isExistGoSocial',
    FB_CHAT_LOGIN: 'fbChatLogin',

    ORDER_PRINT_CONFIG: "orderPrintConfig",

    SUB_PUB_TOPIC: {
        TOUR: {
            CREATE_PRODUCT_SUCCESS: "CREATE_PRODUCT_SUCCESS",
            PING_CREATE_PRODUCT: {
                TOUR_START: "START_CREATE_PRODUCT",
                TOUR_PENDING: "PENDING_CREATE_PRODUCT",
                TOUR_ESCAPE: "ESCAPE_CREATE_PRODUCT",
                TOUR_RUNNING: "RUNNING_CREATE_PRODUCT",
                TOUR_COMPLETE: "COMPLETE_CREATE_PRODUCT",
            },
        },
        CALL_CENTER: {
            REGISTER: "ON_REGISTER",
            CHANGE_STATE: "ON_CHANGE_STATE",
            ACCEPT_CALL: "ON_ACCEPT_CALL",
            INCOMING_CALL: "ON_INCOMING_CALL",
            OTHER_ACCEPT_CALL: "ON_OTHER_ACCEPT_CALL",
            END_CALL: "ON_END_CALL",
            PING: "ON_PING",
        },
    },

    VALIDATIONS: {
        ORDER: {
            MAX_TOTAL_AMOUNT: 1_000_000_000_000 // Limit of column in DB
        },
        PRODUCT: {
            MAX_PRICE: 99_999_999_999,
            MIN_PRICE: 1_000,
            MIN_PRICE_OUTSIDE:0,
            MAX_QUANTITY: 100_000
        },
        SERVICE: {
            MAX_PRICE: 99_999_999_999,
            MIN_PRICE: 1_000,
            MIN_PRICE_OUTSIDE: 0,
            MIN_PRICE_VALUE: 1000,
        },
        SHIPPING: {
            MAX_FEE: 100_000_000,
        },
    },

    DEPOSIT: {
        PERCENT_100: "[100P3rc3nt]",
        DEPOSIT_CODE: "[d3p0s1t]",
    },
    DATETIME_PICKER_LOCATE: {
        VI: {
            daysOfWeek: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
            monthNames: [
                "Tháng 1",
                "Tháng 2",
                "Tháng 3",
                "Tháng 4",
                "Tháng 5",
                "Tháng 6",
                "Tháng 7",
                "Tháng 8",
                "Tháng 9",
                "Tháng 10",
                "Tháng 11",
                "Tháng 12",
            ],
        },
        EN: {
            daysOfWeek: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNames: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ],
        },
    },
    USE_NEW_THEME_ENGINE: "useNewThemeEngine",
    DEFAULT_MASTER_THEME_ID: 1111,
    CALL_CENTER_PLAN_ID: 100,
    LAST_ACCESS_DATE: "lastAccessDate",

    ORDER_PACKAGE_TYPE: {
        CHANGE: "CHANGE",
        RENEW: "RENEW",
        TRIAL: "TRIAL",
        ADD: "ADD",
        FREE: "FREE",
    },

    PRODUCT_VARIATION_EDITOR_MODE: {
        DEPOSIT: "DEPOSIT",
        VARIATION: "VARIATION",
    },

    UTILITY: {
        ORDER_CONFIRM_MODAL_SWITCH_BRANCH_NOT_SHOW:
            "ConfirmModalSwitchBranchNotShow",
    },
    SYSTEM_SETTING_NAME: {
        THEME_COLOR: "THEME_COLOR",
        SUPPORT_LANGUAGE: "SUPPORT_LANGUAGE",
    },
    PACKAGE_PRICE_CHANNEL: {
        BRANCH: "BRANCH",
        MULTI_LANGUAGE: "MULTI_LANGUAGE",
    },
    ORDER_PACKAGE_CHANNEL: {
        BRANCH: "BRANCH",
        MULTI_LANGUAGE: "MULTI_LANGUAGE",
    },
    TRANSFER_STATUS: {
        READY_FOR_TRANSPORT: "READY_FOR_TRANSPORT",
        DELIVERING: "DELIVERING",
        RECEIVED: "RECEIVED",
        CANCELLED: "CANCELLED",
    },
    Z_INDEX_SYSTEM: {
        MODAL: 1050,
        LOADING_OVERLAY: 2000,
        TOP: 9999,
    },
    TRANSFER_STAGE: {
        READY_FOR_TRANSPORT: 2,
        DELIVERING: 3,
        RECEIVED: 4,
        CANCELLED: 5,
    },
    TRANSFER_STEP: ["transfer", "ready", "delivering", "received", "cancelled"],

    STORE_DOMAIN: {
        GOMUA: "gomua.vn",
    },

    EXCLUDE_PATHS: {
        EXCLUDE_PATHS: ["/404"],
        EXCLUDE_REFRESH_TOKEN_PATHS: [
            NavigationPath.notFound,
            NavigationPath.error,
            NavigationPath.login,
            NavigationPath.logout,
            `${NavigationPath.redirect}/signup`,
            `${NavigationPath.redirect}/login`,
            `${NavigationPath.wizard}/1`,
            `${NavigationPath.wizard}/2`,
            `${NavigationPath.wizard}/3`,
            `${NavigationPath.wizard}/4`,
            `${NavigationPath.wizard}/5`,
            `${NavigationPath.wizard}/6`,
            `${NavigationPath.wizard}/payment`,
            NavigationPath.lazadaAccount,
            NavigationPath.paymentCallback,
            NavigationPath.paymentCallbackEpay,
        ],
        EXCLUDE_GO_FREE_MODAL_PATHS: [
            "/404",
            NavigationPath.notFound,
            NavigationPath.error,
            NavigationPath.login,
            NavigationPath.logout,
            `${NavigationPath.redirect}/signup`,
            `${NavigationPath.redirect}/login`,
            `${NavigationPath.wizard}/1`,
            `${NavigationPath.wizard}/2`,
            `${NavigationPath.wizard}/3`,
            `${NavigationPath.wizard}/4`,
            `${NavigationPath.wizard}/5`,
            `${NavigationPath.wizard}/6`,
            `${NavigationPath.wizard}/payment`,
            NavigationPath.paymentCallback,
            NavigationPath.paymentCallbackEpay,
        ]
    },

    PURCHASE_ORDER_STATUS: {
        ORDER: "ORDER",
        IN_PROGRESS: "IN_PROGRESS",
        COMPLETED: "COMPLETED",
        CANCELLED: "CANCELLED",
    },
    PURCHASE_ORDER_DISCOUNT_TYPE: {
        VALUE: "VALUE",
        PERCENTAGE: "PERCENTAGE",
    },
    PURCHASE_ORDER_MODE: {
        CREATE: "CREATE",
        EDIT: "EDIT",
        WIZARD: "WIZARD",
    },

    RETURN_ORDER_STATUS: {
        CREATED: "CREATED",
        IN_PROGRESS: "IN_PROGRESS",
        COMPLETED: "COMPLETED",
        CANCELLED: "CANCELLED",
    },

    RETURN_ORDER_MODE: {
        WIZARD: "WIZARD",
        CREATE: "CREATE",
        EDIT: "EDIT"
    },

    RETURN_ORDER_STAGE: {
        CREATED: 1,
        IN_PROGRESS: 2,
        COMPLETED: 3,
        CANCELLED: 4,
    },

    RETURN_ORDER_STEP: ["created", "in_progress", "completed", "cancelled"],

    AFFILIATE_MODE: {
        CREATE: "CREATE",
        EDIT: "EDIT",
    },

    PURCHASE_ORDER_STAGE: {
        ORDER: 1,
        IN_PROGRESS: 2,
        COMPLETED: 3,
        CANCELLED: 4,
    },
    PURCHASE_ORDER_STEP: ["order", "in_progress", "completed", "cancelled"],
    PACKAGE_PLAN_STEP: {
        GOSELL: ["choosePlan", "choosePayment", "completed"],
        SHOPEE: ["choosePayment", "completed"],
        CALL_CENTER: ["choosePayment", "completed"],
        BRANCH: ["choosePayment", "completed"],
        LANGUAGE: ["choosePayment", "completed"],
        AFFILIATE: ["choosePayment", "completed"],
    },
    AFFILIATE_SERVICE_TYPE: {
        DROP_SHIP: "DROP_SHIP",
        RESELLER: "RESELLER",
    },
    AFFILIATE_PARTNER_TYPE: {
        DROP_SHIP: "DROP_SHIP",
        RESELLER: "RESELLER",
    },
    CURRENCY: {
        VND: {
            SYMBOL: "đ",
            SYMBOL2: "₫",
            CODE: "VND",
            COUNTRY:"VN"
        },
        USD: {
            SYMBOL: "$",
            CODE: 'USD'
        }
    },
    TRANSFER_HANDLING_STATUS: {
        CREATING_ITEM: 'CREATING_ITEM',
        ERROR: 'ERROR',
        DONE: 'DONE'
    },
    GO_CHAT_TYPE: {
        FACEBOOK: 'FACEBOOK',
        ZALO: 'ZALO'
    },
    TRANSFER_TYPE: {
        BRANCH: 'BRANCH',
        PARTNER: 'PARTNER'
    },
    SHOW_MODAL_TURN_OF_GO_FREE: "showModalTurnOfGoFree",
    INVENTORY_MANAGE_TYPE: {
        PRODUCT: 'PRODUCT',
        IMEI_SERIAL_NUMBER: 'IMEI_SERIAL_NUMBER'
    },
    ITEM_MODE_CODE_STATUS: {
        AVAILABLE: 'AVAILABLE',
        TRANSFERRING: 'TRANSFERRING',
        SOLD: 'SOLD'
    },
    BRANCH_STATUS: {
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
        EXPIRED_ACTIVE: 'EXPIRED_ACTIVE',
        EXPIRED_INACTIVE: 'EXPIRED_INACTIVE'
    },
    PAY_TYPE: {
        PAID: 'PAID',
        UNPAID: 'UNPAID',
        PARTIAL: 'PARTIAL'
    },

    SHOPEE_INTERVAL_TIME_VALUE: 60000,

    PLATFORMS: {
        INSTORE_PURCHASE: 'INSTORE_PURCHASE',
        GO_SOCIAL: 'GO_SOCIAL'
    },

    SALE_CHANNEL_LIST: ["GOSELL","BEECOW","SHOPEE","LAZADA"],

    DISCOUNT_OPTION: {
        DISCOUNT_CODE: 'DISCOUNT_CODE',
        DISCOUNT_AMOUNT: 'DISCOUNT_AMOUNT',
        DISCOUNT_PERCENT: 'DISCOUNT_PERCENT'
    },

    STORE_CURRENCY_CODE: 'currencyCode',
    STORE_CURRENCY_SYMBOL: 'symbol',
    STORE_COUNTRY_CODE: 'countryCode',

    SEO_DATA_TYPE: {
        BUSINESS_PRODUCT: 'BUSINESS_PRODUCT',
        SERVICE: 'SERVICE',
        COLLECTION_PRODUCT: 'COLLECTION_PRODUCT',
        COLLECTION_SERVICE: 'COLLECTION_SERVICE',
        BLOG: 'BLOG',
        ARTICLE: 'ARTICLE',
        PAGE: 'PAGE',
        LANDING_PAGE: 'LANDING_PAGE'
    },

    COLLECTION_ITEM_TYPE: {
        PRODUCT: "PRODUCT",
        SERVICE: "SERVICE",
    },

    FONTS: [
        {value: "", label: ""},
        {value: "CormorantGaramond", label: "Cormorant Garamond"},
        {value: "DancingScript", label: "Dancing Script"},
        {value: "EBGaramond", label: "EB Garamond"},
        {value: "JosefinSans", label: "Josefin Sans"},
        {value: "LibreBodoni", label: "Libre Bodoni"},
        {value: "Literata", label: "Literata"},
        {value: "Montserrat", label: "Montserrat"},
        {value: "MontserratAlternates", label: "Montserrat Alternates"},
        {value: "NotoSerifDisplay", label: "Noto Serif Display"},
        {value: "Nunito", label: "Nunito"},
        {value: "OpenSans", label: "Open Sans"},
        {value: "Oswald", label: "Oswald"},
        {value: "Petrona", label: "Petrona"},
        {value: "PlayfairDisplay", label: "Playfair Display"},
        {value: "Roboto", label: "Roboto"},
        {value: "SourceSansPro", label: "Source Sans Pro"},
        {value: "Vollkorn", label: "Vollkorn"},
        // {value: "RobotoCondensed", label: "Roboto Condensed"},
        // {value: "Lobster", label: "Lobster"},
        // {value: "OldStandardTT", label: "Old Standard TT"},
    ],
    PAGE_SIZE: {
        A4: 'A4',
        K57: 'K57',
        K80: 'K80'
    },

    TERAAPP: 'TERAAPP',

    TYPE_PRODUCT_MODAL: {
        FLASH_SALE: "FLASH_SALE"
    },
    PRINT_SIZE_DATA: 'PRINT_SIZE_DATA',
    PRINT_SIZE_DATA_LOCAL_STORAGE_KEY: {
        ORDER_LIST: 'ORDER_LIST',
        ORDER_DETAIL: 'ORDER_DETAIL',
        POS: 'POS'
    },

    OPTION_API_URL_ADDRESS: {
        getShippingAddress: "getShippingAddress",
        getAddressCustomer: "getAddressCustomer"
    },
};

export default Constants;
