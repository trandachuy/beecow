import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersRevenueSummary.sass';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import i18next from "i18next";
import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";
import AnimatedNumber from '../../../../components/shared/AnimatedNumber/AnimatedNumber'
import Constants from "../../../../config/Constant";

const AnalyticsOrdersRevenueSummary = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);

    const convertData = (revenueSummary) => {
        return [
            {
                value: revenueSummary.revenue,
                label: i18next.t("page.analytics.order.revenue.summary.revenue"),
                hint: i18next.t("page.analytics.order.hint.revenue")
            },
            {
                value: revenueSummary.totalOrders,
                label: i18next.t("page.analytics.order.revenue.summary.total.order"),
                isNumber: true
            },
            {
                value: revenueSummary.productCost,
                label: i18next.t("page.analytics.order.revenue.summary.product.cost"),
                hint: i18next.t("page.analytics.order.hint.productCost")
            },
            {
                value: revenueSummary.shippingFee,
                label: i18next.t("page.analytics.order.revenue.summary.shipping.fee"),
                hint: i18next.t("page.analytics.order.hint.shippingFee")
            },
            {
                value: revenueSummary.discountAmount,
                label: i18next.t("page.analytics.order.revenue.summary.discount.amount"),
                hint: i18next.t("page.analytics.order.hint.discountAmount")
            },
            {
                value: revenueSummary.profit,
                label: i18next.t("page.analytics.order.revenue.summary.profit"),
                hint: i18next.t("page.analytics.order.hint.profit")
            },
            {
                value: revenueSummary.grossProfit,
                label: i18next.t("page.analytics.order.revenue.summary.gross.profit"),
                hint: i18next.t("page.analytics.order.hint.grossProfit")
            },
            {
                value: revenueSummary.averageOrderValue,
                label: i18next.t("page.analytics.order.revenue.summary.average.order.value"),
                hint: i18next.t("page.analytics.order.hint.avgOrderValue")
            },
        ]
    };

    const [stRevenueSummaries, setStRevenueSummaries] = useState(convertData(state.revenueSummary));
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    useEffect(() => {
        setStRevenueSummaries(convertData(state.revenueSummary))
    }, [state.revenueSummary]);

    useEffect(() => {
        if(state.currency !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])

    return (
        <>
        {
            stRevenueSummaries.map((x,index) => {
                return (
                    <div key={index} className={"col-6 col-md-3 order-revenue-summary"}>
                        <GSWidget>
                            <GSWidgetContent>
                                <div className={"title text-uppercase font-weight-bold pb-3 color-gray"}>
                                    {x.label}
                                    {
                                        !!x.hint && <GSTooltip message={x.hint} placement={GSTooltip.PLACEMENT.BOTTOM}/>
                                    }
                                </div>
                                <div className="detail">
                                    <span className="number font-weight-bold font-size-18">
                                    <AnimatedNumber
                                        currency={ state.currency } 
                                        hiddenCurrency={x.isNumber?true:false}
                                        precision={stDefaultPrecision}
                                    >
                                        { x.value }
                                    </AnimatedNumber>
                                    </span>
                                </div>
                            </GSWidgetContent>
                        </GSWidget>
                    </div>
                )
            })
        }
        </>
    )
};

AnalyticsOrdersRevenueSummary.propTypes = {

};

export default AnalyticsOrdersRevenueSummary;
