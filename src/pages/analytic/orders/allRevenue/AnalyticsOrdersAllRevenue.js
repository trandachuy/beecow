import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersAllRevenue.sass';
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import {CurrencyUtils} from "../../../../utils/number-format";
import i18next from "i18next";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";

const AnalyticsOrdersAllRevenue = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const [stHasData, setStHasData] = useState(false);

    const convertData = (allRevenue) => {
        return [
            {
                value: CurrencyUtils.formatMoneyByCurrency(allRevenue.saleChannel, state.currency),
                label: i18next.t("page.analytics.order.filter.saleChannel"),
                icon: "icon-sale-channel"
            },
            {
                value: CurrencyUtils.formatMoneyByCurrency(allRevenue.branch, state.currency),
                label: i18next.t("page.analytics.order.filter.branch"),
                icon: "icon-branch"
            },
            {
                value: CurrencyUtils.formatMoneyByCurrency(allRevenue.platform, state.currency),
                label: i18next.t("page.analytics.order.filter.platform"),
                icon: "icon-platform"
            },
            {
                value: CurrencyUtils.formatMoneyByCurrency(allRevenue.staff, state.currency),
                label: i18next.t("page.analytics.order.filter.Staff"),
                icon: "icon-platform"
            }
        ];
    };

    const [stAllRevenues, setStAllRevenues] = useState([]);

    useEffect(() => {
        if (state.allRevenue.saleChannel !== 0 || state.allRevenue.branch !== 0 || state.allRevenue.platform !== 0 || state.allRevenue.staff !== 0) {
            setStHasData(true);
            setStAllRevenues(convertData(state.allRevenue));
        } else {
            setStHasData(false);
        }
    }, [state.allRevenue]);

    return (
        <GSWidget>
            <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE}>
                <div className={"text-uppercase"}>
                    <GSTrans t={"page.analytics.order.all.revenue.title"}/>
                </div>
            </GSWidgetHeader>
            <GSWidgetContent>
                <div className={"d-flex flex-wrap justify-content-center"}>
                    <AnalyticsOrdersEmptyData isEmptyData={!stHasData}>
                        {
                            stAllRevenues.map((x, index) => {
                                return (
                                    <div key={index} className={"col-md-3 all-revenue-wrapper"}>
                                        <GSWidget key={index}>
                                            <GSWidgetContent
                                                className={"d-flex flex-column justify-content-center align-items-center"}>
                                                <div className="revenue-icon">
                                                    <i className={x.icon}></i>
                                                </div>
                                                <div className="revenue-detail">
                                                <span className="number">
                                                    {x.value}
                                                </span>
                                                </div>
                                                <div className="title text-uppercase">
                                                    {x.label}
                                                </div>
                                            </GSWidgetContent>
                                        </GSWidget>
                                    </div>
                                );
                            })
                        }
                    </AnalyticsOrdersEmptyData>
                </div>
            </GSWidgetContent>
        </GSWidget>
    );
};

AnalyticsOrdersAllRevenue.propTypes = {};

export default AnalyticsOrdersAllRevenue;
