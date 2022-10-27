/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import './AutomaticAdsAnalytic.sass'
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {UikSelect} from '../../../../@uik'
import i18next from "i18next";
import GSTooltip, {GSTooltipIcon} from "../../../../components/shared/GSTooltip/GSTooltip";
import {Bar} from "react-chartjs-2";
import {cancelablePromise} from "../../../../utils/promise";
import facebookService from "../../../../services/FacebookService";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import {animated, config, useSpring} from 'react-spring'
import {useScroll} from "react-use-gesture";

let orderLabel = i18next.t("page.dashboard.chart.totalOrder");
let revenueLabel = i18next.t("page.dashboard.chart.totalRevenue");


const DateRangeOptions = [
    {
        value: 'today',
        label: i18next.t("page.automaticAds.analytics.range.today"),
    },
    {
        value: 'yesterday',
        label: i18next.t("page.automaticAds.analytics.range.yesterday"),
    },
    {
        value: 'this_month',
        label: i18next.t("page.automaticAds.analytics.range.thisMonth"),
    },
    {
        value: 'last_month',
        label: i18next.t("page.automaticAds.analytics.range.lastMonth"),
    },
    {
        value: 'this_quarter',
        label: i18next.t("page.automaticAds.analytics.range.thisQuarter"),
    },
    {
        value: 'last_3d',
        label: i18next.t("page.automaticAds.analytics.range.lastXDays", {days:3}),
    },
    {
        value: 'last_7d',
        label: i18next.t("page.automaticAds.analytics.range.lastXDays", {days:7}),
    },
    {
        value: 'last_14d',
        label: i18next.t("page.automaticAds.analytics.range.lastXDays", {days:14}),
    },
    {
        value: 'last_28d',
        label: i18next.t("page.automaticAds.analytics.range.lastXDays", {days:28}),
    },
    {
        value: 'last_30d',
        label: i18next.t("page.automaticAds.analytics.range.lastXDays", {days:30}),
    },
    {
        value: 'last_90d',
        label: i18next.t("page.automaticAds.analytics.range.lastXDays", {days:90}),
    },
    {
        value: 'last_week_mon_sun',
        label: i18next.t("page.automaticAds.analytics.range.lastWeekMS"),
    },
    {
        value: 'last_week_sun_sat',
        label: i18next.t("page.automaticAds.analytics.range.lastWeekSS"),
    },
    {
        value: 'last_quarter',
        label: i18next.t("page.automaticAds.analytics.range.lastQuarter"),
    },
    {
        value: 'last_year',
        label: i18next.t("page.automaticAds.analytics.range.lastYear"),
    },
    {
        value: 'this_week_mon_today',
        label: i18next.t("page.automaticAds.analytics.range.thisWeekMT"),
    },
    {
        value: 'this_week_sun_today',
        label: i18next.t("page.automaticAds.analytics.range.thisWeekST"),
    },
    {
        value: 'this_year',
        label: i18next.t("page.automaticAds.analytics.range.thisYear"),
    }
]

const CHART_OPTION_DEFAULT =  {
    scales: {
    xAxes: [{
        labels: [],
        gridLines: {
            display: false
        },
        maxBarThickness: 30,
        minBarLength: 15
    }],
        yAxes: [
        {
            id: 'order-axis',
            type: 'linear',
            position: 'left',
            ticks: {
                beginAtZero: true,
                callback: (value, index, values) => {
                    return NumberUtils.formatThousandBreak(value,0);
                },
                precision: 0
            },
            gridLines: {
                display: 'none'
            },
            scaleLabel: {
                display: true,
                labelString: orderLabel,
                fontSize: 16
            }
        },
        {
            id: 'revenue-axis',
            type: 'linear',
            position: 'right',
            ticks: {
                beginAtZero: true,
                callback: (value, index, values) => {
                    return NumberUtils.formatThousandBreak(value,0);
                }
            },
            gridLines: {
                display: 'none'
            },
            scaleLabel: {
                display: true,
                labelString: revenueLabel,
                fontSize: 16
            }
        }
    ]
},
legend: {
    display: true,
        position: 'bottom'
},
tooltips: {
    titleFontSize: 16,
        callbacks: {
        label: (tooltipItem, data) => {
            let label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
                label += ': ';
            }
            label += CurrencyUtils.formatThousand(tooltipItem.yLabel)
            return label
        }
    }
},
layout: {
    padding: {
        left: 20,
            right: 20,
            top: 50,
            bottom: 50
    }
}
}

const AutomaticAdsAnalytic = props => {

    const [stDateRage, setStDateRage] = useState(DateRangeOptions[0]);
    const [stChartData, setStChartData] = useState([]);
    const [stChartOptions, setStChartOptions] = useState([]);
    const [stCardValue, setStCardValue] = useState({
        clicks: 0,
        impressions: 0,
        spend: 0,
        cr: 0,
        totalOrder: 0,
        totalRevenue: 0
    });


    const [stLoading, setStLoading] = useState(true);

    const spCardValue = useSpring({
        config: {
            ...config.molasses,
            duration: 750
        },
        to: {
            ...stCardValue
        },
    })

    useEffect(() => {
        setStLoading(true)
        const pmCurrentCampaign = cancelablePromise(facebookService.getCurrentCampaign(
            stDateRage.value.toUpperCase()
        ))
        pmCurrentCampaign.promise
            .then( result => {
                // const data = result.data[0]
                const rawData = result.data



                let sumClick = 0
                let sumImpression = 0
                let sumSpend = 0
                let sumOrder = 0
                let sumRevenue = 0
                let dataSetOrder = []
                let dataSetRevenue = []
                let dataSetIndex = []

                for (const item of rawData) {
                    // chart data

                    if (item.clicks) {
                        sumClick += parseInt(item.clicks)
                    }
                    if (item.impressions) {
                        sumImpression += parseInt(item.impressions)
                    }
                    if (item.spend) {
                        sumSpend += parseInt(item.spend)
                    }
                    dataSetIndex.push(item.hourly_stats_aggregated_by_audience_time_zone? item.hourly_stats_aggregated_by_audience_time_zone:item.date_start)
                    if (item.actions) {
                        sumOrder += item.actions.length
                        let revenue = 0
                        for (const action of item.actions) {
                            revenue += parseInt(action.value)
                        }
                        sumRevenue = revenue
                        dataSetOrder.push(item.actions.length)
                        dataSetRevenue.push(revenue)
                    } else {
                        dataSetOrder.push(0)
                        dataSetRevenue.push(0)
                    }
                }

                let cr = Math.ceil(sumOrder/sumClick)


                const data = {
                    clicks: sumClick,
                    impressions: sumImpression,
                    spend: sumSpend,
                    cr: isNaN(cr)? 0:cr,
                    totalOrder: sumOrder,
                    totalRevenue: sumRevenue
                }

                // chart data

                //
                // for (let i = 0; i < 30; i++) {
                //     dataSetOrder.push( Math.ceil(Math.random() * 1_000_000_000))
                //     dataSetRevenue.push( Math.ceil(Math.random() * 1_000_000_000))
                //     dataSetIndex.push()
                // }

                // console.log(dataSetOrder, dataSetRevenue)

                const chartData = {
                    datasets: [
                        {
                            label: revenueLabel,
                            data: dataSetRevenue,
                            backgroundColor: '#FF8D00',
                            pointBorderWidth: 5,
                            pointHoverBorderWidth: 5,
                            borderColor: '#FF8D00',
                            type: 'line',
                            fill: false,
                            lineTension: 0,
                            yAxisID: 'revenue-axis'
                        },
                        {
                            label: orderLabel,
                            data: dataSetOrder,
                            backgroundColor: '#556CE7',
                            yAxisID: 'order-axis'
                        }
                    ]
                }

                const chartOption = {
                    scales: {
                        xAxes: [{
                            labels: dataSetIndex,
                            gridLines: {
                                display: false
                            },
                            maxBarThickness: 30,
                            minBarLength: 15
                        }],
                        yAxes: [
                            {
                                id: 'order-axis',
                                type: 'linear',
                                position: 'left',
                                ticks: {
                                    beginAtZero: true,
                                    callback: (value, index, values) => {
                                        return NumberUtils.formatThousandBreak(value,0);
                                    },
                                    precision: 0
                                },
                                gridLines: {
                                    display: 'none'
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: orderLabel,
                                    fontSize: 16
                                }
                            },
                            {
                                id: 'revenue-axis',
                                type: 'linear',
                                position: 'right',
                                ticks: {
                                    beginAtZero: true,
                                    callback: (value, index, values) => {
                                        return NumberUtils.formatThousandBreak(value,0);
                                    }
                                },
                                gridLines: {
                                    display: 'none'
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: revenueLabel,
                                    fontSize: 16
                                }
                            }
                        ]
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltips: {
                        titleFontSize: 16,
                        callbacks: {
                            label: (tooltipItem, data) => {
                                let label = data.datasets[tooltipItem.datasetIndex].label || '';

                                if (label) {
                                    label += ': ';
                                }
                                label += CurrencyUtils.formatThousand(tooltipItem.yLabel)
                                return label
                            }
                        }
                    },
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 50,
                            bottom: 50
                        }
                    }
                }

                setStChartOptions(chartOption)
                setStChartData(chartData)

                setStCardValue({
                    ...stCardValue,
                    ...data
                })
                setStLoading(false)
            })
            .catch(e => {
                // console.log(e)
                setStLoading(false)
                // GSToast.commonError()
                // GSToast.error(e)
            })

        return () => {
            pmCurrentCampaign.cancel()
        };
    }, [stDateRage]);

    const bind = useScroll(({down, delta}) => {
        // console.log(down, delta)
    })

    return (
        <GSWidgetContent className="automatic-ads-analytic">
            <div className="automatic-ads-analytic__header">
                <h3 className="automatic-ads-analytic__header-title">
                    <GSTrans t={"page.automaticAds.analytics.campaignPerformance"}/>
                </h3>
                <div className="gs-atm__flex-row--center gs-atm__flex-align-items--center position-relative">
                    {stLoading && <div className="spinner-border spinner-border-sm text-primary" role="status"/>}
                    <UikSelect
                        placeholder="Action"
                        options={DateRangeOptions}
                        position={'bottomRight'}
                        value={[stDateRage]}
                        style={{
                            width: '150px'
                        }}
                        onChange={ (e) => {
                            setStDateRage(e)
                        }}
                    />
                </div>
            </div>
            <div className="automatic-ads-analytic__body">
                <div className="row chart-card-wrapper">
                    {/*SPENDING*/}
                    <div className="col-sm-12 col-lg-3 col-md-3 col-xl-3 chart-card">
                        <div className="chart-card__title">
                            <GSTrans t={"page.automaticAds.analytics.spending"}/>
                            <GSTooltip message={i18next.t("page.automaticAds.analytics.spending.toolTips")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                        </div>
                        <animated.div className="chart-card__value">
                            {/*{CurrencyUtils.formatMoneyVND(spSpend.number)}*/}
                            {spCardValue.spend.interpolate(x =>
                                NumberUtils.formatThousandBreak(x.toFixed(0), 2)
                            )}
                        </animated.div>
                    </div>
                    {/*IMPRESSION*/}
                    <div className="col-sm-12  col-lg-3 col-md-3 col-xl-3  chart-card">
                        <div className="chart-card__title">
                            <GSTrans t={"page.automaticAds.analytics.impressions"}/>
                            <GSTooltip message={i18next.t("page.automaticAds.analytics.impressions.toolTips")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                        </div>
                        <animated.div className="chart-card__value">
                            {spCardValue.impressions.interpolate(x =>
                                NumberUtils.formatThousandBreak(x.toFixed(0), 2)
                            )}
                        </animated.div>
                    </div>
                    {/*CLICKS*/}
                    <div className="col-sm-12  col-lg-3 col-md-3 col-xl-3  chart-card">
                        <div className="chart-card__title">
                            <GSTrans t={"page.automaticAds.analytics.clicks"}/>
                            <GSTooltip message={i18next.t("page.automaticAds.analytics.clicks.toolTips")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                        </div>
                        <animated.div className="chart-card__value">
                            {/*{CurrencyUtils.formatThousand(stCardValue.clicks)}*/}
                            {spCardValue.clicks.interpolate(x =>
                                NumberUtils.formatThousandBreak(x.toFixed(0), 2)
                            )}
                        </animated.div>
                    </div>
                    {/*CR*/}
                    <div className="col-sm-12  col-lg-3 col-md-3 col-xl-3  chart-card">
                        <div className="chart-card__title">
                            <GSTrans t={"page.automaticAds.analytics.CR"}/>
                            <GSTooltip message={i18next.t("page.automaticAds.analytics.CR.toolTips")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                        </div>
                        <animated.div className="chart-card__value">
                            {/*{stCardValue.cr + '%'}*/}
                            {spCardValue.cr.interpolate(x =>
                                x.toFixed(0) + '%'
                            )}
                        </animated.div>
                    </div>
                </div>
                {/*CHART*/}
                <div className="row">
                    <div className="col-12">
                            <div className="chart-info-wrapper">
                                {/*TOTAL ORDER*/}
                                <div className="chart-card chart-card--total">
                                    <div className="chart-card__title">
                                        <GSTrans t={"page.automaticAds.analytics.totalOrders"}/>
                                    </div>
                                    <animated.div className="chart-card--total__value">
                                        {spCardValue.totalOrder.interpolate(x =>
                                            NumberUtils.formatThousandBreak(x.toFixed(0), 2)
                                        )}
                                    </animated.div>
                                </div>
                                {/*TOTAL REVENUE*/}
                                <div className="chart-card chart-card--total">
                                    <div className="chart-card__title">
                                        <GSTrans t={"page.automaticAds.analytics.totalRevenue"}/>
                                    </div>
                                    <animated.div className="chart-card--total__value">
                                        {spCardValue.totalRevenue.interpolate(x =>
                                            NumberUtils.formatThousandBreak(x.toFixed(0), 2)
                                        )}
                                    </animated.div>
                                </div>
                            </div>
                            {/*CHART*/}
                            <Bar
                                data={stChartData}
                                options={stChartOptions}
                            />
                    </div>
                </div>
            </div>
        </GSWidgetContent>
    );
};

AutomaticAdsAnalytic.propTypes = {};

export default AutomaticAdsAnalytic;
