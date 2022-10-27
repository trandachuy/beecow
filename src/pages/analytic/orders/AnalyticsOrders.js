import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import React, {useReducer} from "react";
import i18next from "i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import {AnalyticsOrdersContext} from "./context/AnalyticsOrdersContext";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import AnalyticsOrdersFilter from "./filter/AnalyticsOrdersFilter";
import './AnalyticsOrders.sass';
import AnalyticsOrdersTimeFrame from "./timeFrame/AnalyticsOrdersTimeFrame";
import AnalyticsOrdersRevenueSummary from "./revenueSummary/AnalyticsOrdersRevenueSummary";
import AnalyticsOrdersRevenueChart from "./revenueChart/AnalyticsOrdersRevenueChart";
import AnalyticsOrdersAllRevenue from "./allRevenue/AnalyticsOrdersAllRevenue";
import AnalyticsOrdersSaleChannel from "./saleChannel/AnalyticsOrdersSaleChannel";
import AnalyticsOrdersBranch from "./branch/AnalyticsOrdersBranch";
import AnalyticsOrdersPlatform from "./platform/AnalyticsOrdersPlatform";
import AnalyticsOrdersCustomerLocation from "./customerLocation/AnalyticsOrdersCustomerLocation";
import AnalyticsOrdersTopSellingProduct from "./topSellingProduct/AnalyticsOrdersTopSellingProduct";
import AnalyticsOrdersTopSalesStaff from "./topSalesStaff/AnalyticsOrdersTopSalesStaff";
import AnalyticsOrderStatusFilter from "./statusFilter/AnalyticsOrderStatusFilter";
import AnalyticsPaymentMethodFilter from "./paymentMethodFilter/AnalyticsPaymentMethodFilter";
import AnalyticsOrdersStaff from "./staff/AnalyticsOrdersStaff";


const AnalyticsOrders = props => {

    const [state, dispatch] = useReducer(AnalyticsOrdersContext.reducer, AnalyticsOrdersContext.initState);

    return (
        <GSContentContainer className="analytics-orders">
            <GSContentHeader title={i18next.t("page.analytics.orders.title")}/>
            <AnalyticsOrdersContext.provider value={{state, dispatch}}>
                <GSContentBody size={GSContentBody.size.MAX}>
                    <div className="row p-0 mb-3">
                        <AnalyticsOrdersFilter/>
                    </div>
                    <div className="row p-0 mb-3">
                        <AnalyticsOrdersTimeFrame/>
                    </div>
                    <div className="row p-0 mb-3">
                        <div className='col-md-8 d-flex align-items-center font-weight-500'>
                            <AnalyticsOrderStatusFilter/>
                        </div>
                        <div className='col-md-4 d-flex align-items-center font-weight-500 justify-content-end
                        payment-method-container'>
                            <AnalyticsPaymentMethodFilter/>
                        </div>
                    </div>
                    <div className="row p-0">
                        <AnalyticsOrdersRevenueSummary/>
                    </div>
                    <div className="row p-0 mb-3">
                        <AnalyticsOrdersRevenueChart/>
                    </div>
                    <div className="row p-0">
                        <div className="col-12 col-sm-12 col-md-8">
                            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.ALL &&
                                <AnalyticsOrdersAllRevenue/>
                            }
                            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.SALE_CHANNEL &&
                                <AnalyticsOrdersSaleChannel/>
                            }
                            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.BRANCH &&
                                <AnalyticsOrdersBranch/>
                            }
                            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.PLATFORM &&
                                <AnalyticsOrdersPlatform/>
                            }
                            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.STAFF &&
                                <AnalyticsOrdersStaff/>
                            }
                            <AnalyticsOrdersCustomerLocation/>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4">
                            <AnalyticsOrdersTopSellingProduct/>
                            <AnalyticsOrdersTopSalesStaff/>
                        </div>
                    </div>
                </GSContentBody>
            </AnalyticsOrdersContext.provider>
        </GSContentContainer>
    );
};

AnalyticsOrders.propTypes = {};

export default AnalyticsOrders;
