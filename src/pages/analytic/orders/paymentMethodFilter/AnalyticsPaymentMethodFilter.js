import React, {useContext, useEffect} from "react";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import './AnalyticsPaymentMethodFilter.sass';
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {UikSelect} from "../../../../@uik";
import i18next from "i18next";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";


const AnalyticsPaymentMethodFilter = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);

    const changePaymentMethod = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setFilterPaymentMethod(value));
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
    }, [state.filterPaymentMethod]);

    return (
        <>
            <div className={'mr-1'}>
                <GSTrans t="page.order.detail.information.paymentMethod"/>
            </div>
            <div style={{
                width: '200px'
            }}>
                <UikSelect
                    defaultValue={AnalyticsOrdersContext.PAYMENT_METHOD_OPTIONS.ALL}
                    className={'w-100'}
                    value={[{value: state.filterPaymentMethod}]}
                    options={[{
                        value: AnalyticsOrdersContext.PAYMENT_METHOD_OPTIONS.ALL,
                        label: i18next.t("page.analytics.order.filter.all")
                    },
                        {
                            value: AnalyticsOrdersContext.PAYMENT_METHOD_OPTIONS.COD,
                            label: i18next.t("page.analytics.order.filter.payment.method.cod")
                        },
                        {
                            value: AnalyticsOrdersContext.PAYMENT_METHOD_OPTIONS.CASH,
                            label: i18next.t("page.analytics.order.filter.payment.method.cash")
                        },
                        {
                            value: AnalyticsOrdersContext.PAYMENT_METHOD_OPTIONS.VISA_ATM,
                            label: i18next.t("page.analytics.order.filter.payment.method.visa.atm")
                        },
                        {
                            value: AnalyticsOrdersContext.PAYMENT_METHOD_OPTIONS.BANK_TRANSFER,
                            label: i18next.t("page.analytics.order.filter.payment.method.bt")
                        }]}
                    onChange={(item) => changePaymentMethod(item.value)}
                />
            </div>
        </>
    )
}

AnalyticsPaymentMethodFilter.propTypes = {};

export default AnalyticsPaymentMethodFilter;
