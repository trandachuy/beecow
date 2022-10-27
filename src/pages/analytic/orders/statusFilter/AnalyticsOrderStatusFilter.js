import React, {useContext, useEffect} from "react";
import './AnalyticsOrderStatusFilter.sass';
import {UikTabContainer, UikTabItem} from "../../../../@uik";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import i18next from "i18next";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";

const AnalyticsOrderStatusFilter = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);

    const changeTab = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setFilterOrderStatusTab(value));
    };

    useEffect(() => {
        AnalyticsOrdersContextServive.updateAllRevenue(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueTrend(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueSummary(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupLocation(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupBranch(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupPlatform(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupStaff(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupSaleChannel(state, dispatch);
        AnalyticsOrdersContextServive.updateTopSalesByItem(state, dispatch);
        AnalyticsOrdersContextServive.updateTopSalesByInStoreStaff(state, dispatch);
    }, [state.filterOrderStatusTab]);

    return (
        <>
            <span><GSTrans t='page.analytics.orderStatus.title'/></span>
            <UikTabContainer className={"p-0"}>
                {[
                    {
                        value: AnalyticsOrdersContext.ORDER_STATUS_OPTIONS.NEW,
                        label: i18next.t("page.analytics.orderStatus.filter.new")
                    },
                    {
                        value: AnalyticsOrdersContext.ORDER_STATUS_OPTIONS.DELIVERED,
                        label: i18next.t("page.analytics.orderStatus.filter.delivered")
                    },
                    {
                        value: AnalyticsOrdersContext.ORDER_STATUS_OPTIONS.CANCELLED,
                        label: i18next.t("page.analytics.orderStatus.filter.cancelled")
                    }
                ].map((option) => {
                    return (
                        <UikTabItem key={option.value}
                                    active={state.filterOrderStatusTab === option.value}
                                    onClick={() => changeTab(option.value)}>
                            {option.label}
                        </UikTabItem>
                    );
                })}
            </UikTabContainer>
        </>
    )
};

AnalyticsOrderStatusFilter.propTypes = {};

export default AnalyticsOrderStatusFilter;
