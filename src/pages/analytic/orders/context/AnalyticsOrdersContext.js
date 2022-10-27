import React from "react";
import {ContextUtils} from "../../../../utils/context";
import { CurrencyUtils } from "../../../../utils/number-format";

export const UI_DATE_FORMAT = "DD-MM-YYYY";

export const GROUP_OPTIONS = {
    CHANNEL: "channel",
    BRANCH: "branch",
    PLATFORM: "platform",
    LOCATION: "location",
    STAFF: "staff"
};

export const FILTER_OPTIONS = {
    ALL: "ALL",
    SALE_CHANNEL: "SALE_CHANNEL",
    BRANCH: "BRANCH",
    PLATFORM: "PLATFORM",
    STAFF: "STAFF"
};

export const PAYMENT_METHOD_OPTIONS = {
    ALL: "ALL",
    COD: "COD",
    CASH: "CASH",
    VISA_ATM: "VISA_ATM",
    BANK_TRANSFER: "BANK_TRANSFER"
};

export const ORDER_STATUS_OPTIONS = {
    NEW: 'new',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const SALE_CHANNEL_OPTIONS = {
    ALL: "ALL",
    GOSELL: "GOSELL",
    GOMUA: "BEECOW",
    SHOPEE: "SHOPEE",
    LAZADA: "LAZADA"
};

export const BRANCH_OPTIONS = {
    ALL: "ALL"
};

export const STAFF_OPTIONS = {
    ALL: "ALL"
};

export const PLATFORM_OPTIONS = {
    ALL: "ALL",
    APP: "APP",
    WEB: "WEB",
    IN_STORE: "Instore Purchase",
    GOSOCIAL: "Gosocial"
};

export const TIME_FRAMES = {
    TODAY: 'TODAY',
    YESTERDAY: 'YESTERDAY',
    LAST_7_DAYS: 'LAST_7_DAYS',
    LAST_30_DAYS: 'LAST_30_DAYS',
    LAST_WEEK: 'LAST_WEEK',
    LAST_MONTH: 'LAST_MONTH',
    THIS_WEEK: 'THIS_WEEK',
    THIS_MONTH: 'THIS_MONTH',
    THIS_YEAR: 'THIS_YEAR',
    CUSTOM: 'CUSTOM'
};

const initState = {
    currency: CurrencyUtils.getLocalStorageSymbol(),
    filterTab: FILTER_OPTIONS.ALL,
    filterOrderStatusTab: ORDER_STATUS_OPTIONS.NEW,
    filterSaleChannel: SALE_CHANNEL_OPTIONS.ALL,
    filterBranch: BRANCH_OPTIONS.ALL,
    filterPlatform: PLATFORM_OPTIONS.ALL,
    filterPaymentMethod: PAYMENT_METHOD_OPTIONS.ALL,
    filterStaffName: STAFF_OPTIONS.ALL,
    timeFrame: TIME_FRAMES.TODAY,
    customStartDate: null,
    customEndDate: null,
    rangeDateText: null,
    revenueSummary: {
        revenue: 0,
        productCost: 0,
        shippingFee: 0,
        discountAmount: 0,
        profit: 0,
        grossProfit: 0,
        averageOrderValue: 0,
        totalOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        processingOrders: 0
    },
    revenueDataSet: [],
    allRevenue: {
        saleChannel: 0,
        branch: 0,
        platform: 0,
        staff:0
    },
    customerLocationDataSet: [],
    saleChannelDataSet: {
        shopee: 0,
        shopeePercentage: 0,
        gomua: 0,
        gomuaPercentage: 0,
        lazada: 0,
        lazadaPercentage: 0,
        gosell: 0,
        gosellPercentage: 0
    },
    branchDataSet: [],
    platformDataSet: {
        web: 0,
        webPercentage: 0,
        app: 0,
        appPercentage: 0,
        instore: 0,
        instorePercentage: 0
    },
    topSellingProduct: [],
    topSalesStaff: [],
    locationDataSet: [],
    topSalesStaffDataSet: [],
    topSellingProductDataSet: [],
    staffDataSet:[]
};

const context = React.createContext(initState);

const actions = {
    setFilterTab: (filterTab) => ContextUtils.createAction('SET_FILTER_TAB', filterTab),
    setFilterOrderStatusTab: (filterTab) => ContextUtils.createAction('SET_FILTER_ORDER_STATUS_TAB', filterTab),
    setFilterSaleChannel: (filterSaleChannel) => ContextUtils.createAction('SET_FILTER_SALE_CHANNEL', filterSaleChannel),
    setFilterBranch: (filterBranch) => ContextUtils.createAction('SET_FILTER_BRANCH', filterBranch),
    setFilterPlatform: (filterPlatform) => ContextUtils.createAction('SET_FILTER_PLATFORM', filterPlatform),
    setFilterPaymentMethod: (filterPaymentMethod) => ContextUtils.createAction('SET_FILTER_PAYMENT_METHOD', filterPaymentMethod),
    setFilterStaffName: (filterStaffName) => ContextUtils.createAction('SET_FILTER_STAFF_NAME', filterStaffName),
    setCustomTimeFrame: (customStartDate, customEndDate, timeFrame) => ContextUtils.createAction('SET_CUSTOM_TIME_FRAME', {
        customStartDate, customEndDate, timeFrame
    }),
    setRevenueDataSet: (data) => ContextUtils.createAction('SET_REVENUE_TREND_DATASET', data),
    setRevenueSummary: (data) => ContextUtils.createAction('SET_REVENUE_SUMMARY', data),
    setBranchDataSet: (data) => ContextUtils.createAction('SET_BRANCH_DATASET', data),
    setSaleChannelDataSet: (data) => ContextUtils.createAction('SET_SALE_CHANNEL_DATASET', data),
    setPlatformDataSet: (data) => ContextUtils.createAction('SET_PLATFORM_DATASET', data),
    setStaffDataSet: (data) => ContextUtils.createAction('SET_STAFF_DATASET', data),
    setLocationDataSet: (data) => ContextUtils.createAction('SET_LOCATION_DATASET', data),
    setTopSellingProductDataSet: (data) => ContextUtils.createAction('SET_TOP_SELLING_PRODUCT_DATASET', data),
    setTopSalesStaffDataSet: (data) => ContextUtils.createAction('SET_TOP_SALES_STAFF_DATASET', data),
    setAllRevenueDataSet: (data) => ContextUtils.createAction('SET_ALL_REVENUE_DATASET', data),
    setRangeDateText: (data) => ContextUtils.createAction('SET_RANGE_DATE_TEXT', data)
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_FILTER_TAB': {
            return {
                ...state,
                filterTab: action.payload
            };
        }
        case 'SET_FILTER_ORDER_STATUS_TAB': {
            return {
                ...state,
                filterOrderStatusTab: action.payload
            };
        }
        case 'SET_FILTER_SALE_CHANNEL': {
            return {
                ...state,
                filterSaleChannel: action.payload
            };
        }
        case 'SET_FILTER_BRANCH': {
            return {
                ...state,
                filterBranch: action.payload
            };
        }
        case 'SET_FILTER_PLATFORM': {
            return {
                ...state,
                filterPlatform: action.payload
            };
        }
        case 'SET_FILTER_STAFF_NAME': {
            return {
                ...state,
                filterStaffName: action.payload
            };
        }
        case 'SET_FILTER_PAYMENT_METHOD': {
            return {
                ...state,
                filterPaymentMethod: action.payload
            };
        }
        case 'SET_CUSTOM_TIME_FRAME': {
            const {customStartDate, customEndDate, timeFrame} = action.payload;
            return {
                ...state,
                customStartDate: customStartDate,
                customEndDate: customEndDate,
                timeFrame: timeFrame
            };
        }
        case 'SET_REVENUE_TREND_DATASET': {
            return {
                ...state,
                revenueDataSet: action.payload
            };
        }
        case 'SET_REVENUE_SUMMARY': {
            return {
                ...state,
                revenueSummary: action.payload
            };
        }
        case 'SET_BRANCH_DATASET': {
            return {
                ...state,
                branchDataSet: action.payload
            };
        }
        case 'SET_SALE_CHANNEL_DATASET': {
            return {
                ...state,
                saleChannelDataSet: action.payload
            };
        }
        case 'SET_PLATFORM_DATASET': {
            return {
                ...state,
                platformDataSet: action.payload
            };
        }
        case 'SET_STAFF_DATASET': {
            return {
                ...state,
                staffDataSet: action.payload
            };
        }
        case 'SET_LOCATION_DATASET': {
            return {
                ...state,
                locationDataSet: action.payload
            };
        }
        case 'SET_TOP_SALES_STAFF_DATASET': {
            return {
                ...state,
                topSalesStaffDataSet: action.payload
            };
        }
        case 'SET_TOP_SELLING_PRODUCT_DATASET': {
            return {
                ...state,
                topSellingProductDataSet: action.payload
            };
        }
        case 'SET_ALL_REVENUE_DATASET': {
            return {
                ...state,
                allRevenue: action.payload
            };
        }
        case 'SET_RANGE_DATE_TEXT': {
            return {
                ...state,
                rangeDateText: action.payload
            };
        }
    }
};

export const AnalyticsOrdersContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
    FILTER_OPTIONS,
    ORDER_STATUS_OPTIONS,
    SALE_CHANNEL_OPTIONS,
    PLATFORM_OPTIONS,
    TIME_FRAMES,
    BRANCH_OPTIONS,
    STAFF_OPTIONS,
    UI_DATE_FORMAT,
    GROUP_OPTIONS,
    PAYMENT_METHOD_OPTIONS
};


