import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersRevenueChart.sass';
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import GSCard from "../../../../components/layout/GSCard/GSCard";
import {UikAvatar} from "../../../../@uik";
import i18next from "i18next";
import {Bar} from "react-chartjs-2";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import moment from "moment";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";

const AnalyticsOrdersRevenueChart = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const [stTotalOrders, setStTotalOrders] = useState(0);
    const [stTotalRevenues, setStTotalRevenues] = useState(0);

    const [stData, setStData] = useState();
    const [stOptions, setStOptions] = useState();

    useEffect(() => {
        setStData({
            datasets: [
                {
                    label: i18next.t("page.dashboard.chart.totalRevenue"),
                    data: state.revenueDataSet.map(chartValue => {
                        return chartValue.revenue
                    }),
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
                    label: i18next.t("page.dashboard.chart.totalOrder"),
                    data: state.revenueDataSet.map(chartValue => {
                        return chartValue.totalOrders
                    }),
                    backgroundColor: '#556CE7',
                    pointBorderWidth: 5,
                    pointHoverBorderWidth: 5,
                    borderColor: '#556CE7',
                    type: 'line',
                    fill: false,
                    lineTension: 0,
                    yAxisID: 'order-axis'
                }
            ]
        });
        setStOptions({
            scales: {
                xAxes: [{
                    labels: state.revenueDataSet.map(chartValue => {
                            switch (state.timeFrame) {
                                case AnalyticsOrdersContext.TIME_FRAMES.TODAY:
                                case AnalyticsOrdersContext.TIME_FRAMES.YESTERDAY:
                                    return moment(chartValue.timeTick).format('HH') + ':00';
                                case AnalyticsOrdersContext.TIME_FRAMES.LAST_7_DAYS:
                                case AnalyticsOrdersContext.TIME_FRAMES.LAST_30_DAYS:
                                case AnalyticsOrdersContext.TIME_FRAMES.LAST_WEEK:
                                case AnalyticsOrdersContext.TIME_FRAMES.LAST_MONTH:
                                case AnalyticsOrdersContext.TIME_FRAMES.THIS_WEEK:
                                case AnalyticsOrdersContext.TIME_FRAMES.THIS_MONTH:
                                    return moment(chartValue.timeTick).format('DD/MM');
                                case AnalyticsOrdersContext.TIME_FRAMES.THIS_YEAR:
                                    return moment(chartValue.timeTick).format('MM/YYYY');
                                case AnalyticsOrdersContext.TIME_FRAMES.CUSTOM:
                                    let days = moment(state.customEndDate, 'DD-MM-YYYY').diff(moment(state.customStartDate, 'DD-MM-YYYY'), 'days');
                                    if (days === 0) {
                                        return moment(chartValue.timeTick).format('DD/MM/YYYY');
                                    } else if (days === 1) {
                                        return moment(chartValue.timeTick).format('HH') + ':00';
                                    } else if (days >= 2 && days <= 31) {
                                        return moment(chartValue.timeTick).format('DD/MM');
                                    } else if (days >= 32 && days <= 365) {
                                        return moment(chartValue.timeTick).format('MM/YYYY');
                                    } else if (days > 365) {
                                        return moment(chartValue.timeTick).format('YYYY');
                                    }
                            }
                        }
                    ),
                    gridLines: {
                        display: false
                    },
                    maxBarThickness: 30,
                    minBarLength: 15
                }],
                yAxes: [
                    {
                        id: 'revenue-axis',
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                            callback: (value) => {
                                return NumberUtils.formatThousandBreak(value, 0);
                            }
                        },
                        gridLines: {
                            display: 'none'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: i18next.t("page.dashboard.chart.totalRevenue"),
                            fontSize: 16
                        }
                    },
                    {
                        id: 'order-axis',
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                            callback: (value) => {
                                return NumberUtils.formatThousandBreak(value, 0);
                            }
                        },
                        gridLines: {
                            display: 'none'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: i18next.t("page.dashboard.chart.totalOrder"),
                            fontSize: 16
                        }
                    }
                ]
            },
            legend: {
                display: true,
                position: 'top'
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
        });

        let totalOrders = 0;
        let totalRevenues = 0;
        for (let record of state.revenueDataSet) {
            totalOrders += record.totalOrders;
            totalRevenues += record.revenue;
        }
        setStTotalOrders(totalOrders);
        setStTotalRevenues(totalRevenues);
    }, [state.revenueDataSet]);


    return (
        <div className="col-12 col-sm-12 col-md-12 order-revenue-trend">
            <GSWidget className="m-0">
                <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE} rightEl={<span className={"color-gray"}>({state.rangeDateText})</span>}>
                    <div className={"text-uppercase"}>
                        <GSTrans t={"page.analytics.order.all.revenue.trend"} />
                    </div>
                </GSWidgetHeader>
                <GSWidgetContent className={"p-0"}>
                    <GSCard className="dashboard__card-chart">
                        <div className="gs-atm__flex-row--space-between gs-atm__flex-align-items--center">
                            <UikAvatar  className="dashboard-ava-card--non-ava"
                                        highlighted
                                        textTop={i18next.t("page.dashboard.chart.totalRevenue")}
                                        name={CurrencyUtils.formatMoneyByCurrency(stTotalRevenues, state.currency)}
                            />
                            <div className="divider"/>
                            <UikAvatar className="dashboard-ava-card--non-ava"
                                       highlighted
                                       textTop={i18next.t("page.dashboard.chart.totalOrder")}
                                       name={NumberUtils.formatThousand(stTotalOrders)}
                            />
                        </div>
                        {/*CHART*/}
                        <Bar
                            data={stData}
                            options={stOptions}
                        />
                    </GSCard>
                </GSWidgetContent>
            </GSWidget>
        </div>
    )
};

AnalyticsOrdersRevenueChart.propTypes = {

};

export default AnalyticsOrdersRevenueChart;
