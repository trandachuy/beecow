import {BillingInfoService} from "../../../../services/BillingInfoService";
import {
    AnalyticsOrdersContext,
    BRANCH_OPTIONS,
    GROUP_OPTIONS,
    PLATFORM_OPTIONS,
    SALE_CHANNEL_OPTIONS
} from "./AnalyticsOrdersContext";
import moment from 'moment';
import storageService from "../../../../services/storage";
import Constants from "../../../../config/Constant";

const updateRevenueTrend = (state, dispatch) => {
    BillingInfoService.getRevenueTrend(getOptions(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setRevenueDataSet(result.data));
    });
};

const updateRevenueSummary = (state, dispatch) => {
    BillingInfoService.getRevenueSummary(getOptions(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setRevenueSummary({
            revenue: result.data.revenue,
            productCost: result.data.cost,
            shippingFee: result.data.shippingFee,
            discountAmount: result.data.discountAmount,
            profit: result.data.profit,
            grossProfit: result.data.grossProfit,
            averageOrderValue: result.data.averageOrderValue,
            totalOrders: result.data.totalOrders,
            deliveredOrders: result.data.deliveredOrders,
            cancelledOrders: result.data.cancelledOrders,
            processingOrders: result.data.processingOrders
        }));
    });
};

const updateAllRevenue = (state, dispatch) => {
    BillingInfoService.getAllRevenue(getOptionsByGroup(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setAllRevenueDataSet({
            saleChannel: result.data.revenueChannel ? result.data.revenueChannel : 0,
            branch: result.data.revenueBranch ? result.data.revenueBranch : 0,
            platform: result.data.revenuePlatform ? result.data.revenuePlatform : 0,
            staff: result.data.revenueStaff ? result.data.revenueStaff : 0
        }));
    });
};

const updateRevenueByGroupBranch = (state, dispatch) => {
    BillingInfoService.getRevenueByGroup(GROUP_OPTIONS.BRANCH, getOptionsByGroup(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setBranchDataSet(result.data));
    });
};

const updateRevenueByGroupLocation = (state, dispatch) => {
    BillingInfoService.getRevenueByGroup(GROUP_OPTIONS.LOCATION, getOptions(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setLocationDataSet(result.data));
    });
};

const updateRevenueByGroupSaleChannel = (state, dispatch) => {
    BillingInfoService.getRevenueByGroup(GROUP_OPTIONS.CHANNEL, getOptionsByGroup(state)).then(result => {
        let shopee = result.data.find(x => x.groupLabel.toUpperCase() === SALE_CHANNEL_OPTIONS.SHOPEE.toUpperCase());
        let gomua = result.data.find(x => x.groupLabel.toUpperCase() === SALE_CHANNEL_OPTIONS.GOMUA.toUpperCase());
        let lazada = result.data.find(x => x.groupLabel.toUpperCase() === SALE_CHANNEL_OPTIONS.LAZADA.toUpperCase());
        let gosell = result.data.find(x => x.groupLabel.toUpperCase() === SALE_CHANNEL_OPTIONS.GOSELL.toUpperCase());
        dispatch(AnalyticsOrdersContext.actions.setSaleChannelDataSet({
            shopee: shopee ? shopee.revenue : 0,
            gomua: gomua ? gomua.revenue : 0,
            lazada: lazada ? lazada.revenue : 0,
            gosell: gosell ? gosell.revenue : 0,
            shopeePercentage: shopee ? shopee.percentage : 0,
            gomuaPercentage: gomua ? gomua.percentage : 0,
            lazadaPercentage: lazada ? lazada.percentage : 0,
            gosellPercentage: gosell ? gosell.percentage : 0
        }));
    });
};

const updateRevenueByGroupPlatform = (state, dispatch) => {
    BillingInfoService.getRevenueByGroup(GROUP_OPTIONS.PLATFORM, getOptionsByGroup(state)).then(result => {
        let app = result.data.find(x => x.groupLabel === PLATFORM_OPTIONS.APP);
        let web = result.data.find(x => x.groupLabel === PLATFORM_OPTIONS.WEB);
        let instore = result.data.find(x => x.groupLabel === PLATFORM_OPTIONS.IN_STORE);
        let gosocial = result.data.find(x => x.groupLabel === PLATFORM_OPTIONS.GOSOCIAL);
        dispatch(AnalyticsOrdersContext.actions.setPlatformDataSet({
            app: app ? app.revenue : 0,
            web: web ? web.revenue : 0,
            instore: instore ? instore.revenue : 0,
            gosocial: gosocial ? gosocial.revenue : 0,
            webPercentage: web ? web.percentage : 0,
            appPercentage: app ? app.percentage : 0,
            instorePercentage: instore ? instore.percentage : 0,
            gosocialPercentage: gosocial ? gosocial.percentage : 0
        }));
    });
};

const updateRevenueByGroupStaff = (state, dispatch) => {
    BillingInfoService.getRevenueByGroup(GROUP_OPTIONS.STAFF, getOptionsByGroup(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setStaffDataSet(result.data));
    });
};

const updateTopSalesByInStoreStaff = (state, dispatch) => {
    BillingInfoService.getTopSalesByInStoreStaff(getOptions(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setTopSalesStaffDataSet(result));
    });
};

const updateTopSalesByItem = (state, dispatch) => {
    BillingInfoService.getTopSalesByItem(getOptions(state)).then(result => {
        dispatch(AnalyticsOrdersContext.actions.setTopSellingProductDataSet(result));
    });
}

const getOptionsByGroup = (state) => {
    const {from, to} = getRangeDate(state);
    return {
        storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
        from: from,
        to: to,
        orderStatus: state.filterOrderStatusTab,
        paymentMethod: state.filterPaymentMethod
    };
};

const getOptions = (state) => {
    const {from, to} = getRangeDate(state);
    return {
        storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
        from: from,
        to: to,
        platform: state.filterPlatform !== PLATFORM_OPTIONS.ALL ? state.filterPlatform : null,
        channel: state.filterSaleChannel !== SALE_CHANNEL_OPTIONS.ALL ? state.filterSaleChannel : null,
        branchId: state.filterBranch !== BRANCH_OPTIONS.ALL ? state.filterBranch : null,
        orderStatus: state.filterOrderStatusTab,
        paymentMethod: state.filterPaymentMethod,
        staffName: state.filterStaffName !== BRANCH_OPTIONS.ALL ? state.filterStaffName : null,
    };
};

const getRangeDateText = (state) => {
    switch (state.timeFrame) {
        case AnalyticsOrdersContext.TIME_FRAMES.TODAY:
            return moment().format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.YESTERDAY:
            return moment().subtract(1, 'days').format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_7_DAYS:
            return moment().subtract(7, 'days').format("DD-MM-YYYY") + " - " + moment().format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_30_DAYS:
            return moment().subtract(30, 'days').format("DD-MM-YYYY") + " - " + moment().format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_WEEK:
            return moment().subtract(1, 'week').startOf('isoWeek').format("DD-MM-YYYY") + " - "
                + moment().subtract(1, 'week').endOf('isoWeek').format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_MONTH:
            return moment().subtract(1, 'months').startOf('month').format("DD-MM-YYYY") + " - "
                + moment().subtract(1, 'months').endOf('month').format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.THIS_WEEK:
            return moment().startOf('isoWeek').format("DD-MM-YYYY") + " - " + moment().endOf('isoWeek').format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.THIS_MONTH:
            return moment().startOf('month').format("DD-MM-YYYY") + " - " + moment().endOf('month').format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.THIS_YEAR:
            return moment().startOf('year').format("DD-MM-YYYY") + " - " + moment().endOf('year').format("DD-MM-YYYY");
        case AnalyticsOrdersContext.TIME_FRAMES.CUSTOM:
            return moment(state.customStartDate, AnalyticsOrdersContext.UI_DATE_FORMAT).format("DD-MM-YYYY") + " - "
                + moment(state.customEndDate, AnalyticsOrdersContext.UI_DATE_FORMAT).format("DD-MM-YYYY");
    }
};

const getRangeDate = (state) => {
    switch (state.timeFrame) {
        case AnalyticsOrdersContext.TIME_FRAMES.TODAY:
            return {
                from: moment().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().endOf('day').format("YYYY-MM-DDTHH:mm:ssZ")
            };
        case AnalyticsOrdersContext.TIME_FRAMES.YESTERDAY:
            return {
                from: moment().subtract(1, 'days').startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().subtract(1, 'days').endOf('day').format("YYYY-MM-DDTHH:mm:ssZ")
            };
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_7_DAYS:
            return {
                from: moment().subtract(7, 'days').startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().endOf('day').format("YYYY-MM-DDTHH:mm:ssZ")
            };
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_30_DAYS:
            return {
                from: moment().subtract(30, 'days').startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().endOf('day').format("YYYY-MM-DDTHH:mm:ssZ")
            };
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_WEEK:
            return {
                from: moment().subtract(1, 'week').startOf('isoWeek').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().subtract(1, 'week').endOf('isoWeek').format("YYYY-MM-DDTHH:mm:ssZ"),
            };
        case AnalyticsOrdersContext.TIME_FRAMES.LAST_MONTH:
            return {
                from: moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().subtract(1, 'months').endOf('month').format("YYYY-MM-DDTHH:mm:ssZ"),
            };
        case AnalyticsOrdersContext.TIME_FRAMES.THIS_WEEK:
            return {
                from: moment().startOf('isoWeek').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().endOf('isoWeek').format("YYYY-MM-DDTHH:mm:ssZ"),
            };
        case AnalyticsOrdersContext.TIME_FRAMES.THIS_MONTH:
            return {
                from: moment().startOf('month').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().endOf('month').format("YYYY-MM-DDTHH:mm:ssZ"),
            };
        case AnalyticsOrdersContext.TIME_FRAMES.THIS_YEAR:
            return {
                from: moment().startOf('year').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment().endOf('year').format("YYYY-MM-DDTHH:mm:ssZ"),
            };
        case AnalyticsOrdersContext.TIME_FRAMES.CUSTOM:
            return {
                from: moment(state.customStartDate, AnalyticsOrdersContext.UI_DATE_FORMAT).startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
                to: moment(state.customEndDate, AnalyticsOrdersContext.UI_DATE_FORMAT).endOf('day').format("YYYY-MM-DDTHH:mm:ssZ")
            };
    }
};

const getPercentageText = (percentage) => {
    return `(${percentage > 0.001 ? percentage : '< 0.001'}%)`;
};

export const AnalyticsOrdersContextServive = {
    updateRevenueTrend,
    updateRevenueSummary,
    updateAllRevenue,
    updateRevenueByGroupBranch,
    updateRevenueByGroupSaleChannel,
    updateRevenueByGroupPlatform,
    updateRevenueByGroupStaff,
    getRangeDate,
    getPercentageText,
    getRangeDateText,
    updateRevenueByGroupLocation,
    updateTopSalesByInStoreStaff,
    updateTopSalesByItem,
};
