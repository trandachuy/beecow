/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/12/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import GSLayoutContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSLayoutContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSLayoutContentBody from "../../../components/layout/contentBody/GSContentBody";
import {UikAvatar, UikSelect, UikWidgetTable} from "../../../@uik"
import GSLayoutContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import {GSLayoutCol12, GSLayoutCol3, GSLayoutRow} from "../../../components/layout/GSLayout/GSLayout";
import GSCard from "../../../components/layout/GSCard/GSCard";
import './AnalyticsReservations.sass'
import i18next from "i18next";
import {CurrencyUtils, NumberUtils} from "../../../utils/number-format";
import CountUp from 'react-countup';
import {Bar} from "react-chartjs-2";
import moment from "moment";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {Trans} from "react-i18next";
import beehiveService from "../../../services/BeehiveService";
import Constants from "../../../config/Constant";
import GSTooltip, {GSTooltipIcon} from "../../../components/shared/GSTooltip/GSTooltip";
import {AnalyticsType} from "../../../models/AnalyticsTypeEnum";

class AnalyticsReservations extends Component {

    state = {
        totalProducts: 0,
        soldQuantity: 0,
        avgOrderValue: 0,
        pendingRevenue: 0,
        totalOrders: 0,
        totalRevenue: 0,
        isFetching: true,
        chartData: null,
        chartOptions: null,
        topProduct: [],
        recentOrder: [],
        isChangeType: true
    }

    constructor(props) {
        super(props);

        this.renderCountUp = this.renderCountUp.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.onDateRangeChange = this.onDateRangeChange.bind(this);
        this.createEmptyChart = this.createEmptyChart.bind(this);
    }




    renderCountUp(number) {
        let decimal, suffix = '', precision
        const B = 1000000000
        const M = 1000000
        const K = 1000
        if (number >= B) {
            decimal = number / B
            suffix = 'B'
        } else {
            if (number >= M) { // M case
                decimal = number / M
                suffix = i18next.language === 'vi'? 'Tr':'M'
            } else {
                if (number >= K) { // K case
                    decimal = number / K
                    suffix = 'K'
                } else {
                    decimal = number
                }
            }
        }
        if (Number.isInteger(decimal)) {
            precision = 0
        } else {
            precision = 1
        }
        decimal = NumberUtils.toFixed(decimal, precision)
        return (
            <CountUp
                key={number}
                start={0}
                end={Number.parseFloat(decimal)}
                delay={0}
                suffix={suffix}
                decimals={precision}
                decimal="."
                separator=","
                redraw={true}
            >
                {({ countUpRef }) => (
                    <b className="uik-avatar__name" ref={countUpRef}>
                    </b>
                )}
            </CountUp>
        )
    }

    render() {
        return (
            <GSLayoutContentContainer className="analytics-reservations" isLoading={this.state.isFetching} minWidthFitContent>
                <GSLayoutContentHeader title={i18next.t("page.analytics.reservations.title")}>
                    <GSLayoutContentHeaderRightEl>
                        {this.state.isChangeType &&
                        <span className="spinner-border spinner-border-sm text-secondary mr-2" role="status"/>
                        }
                        <UikSelect
                            onChange={this.onDateRangeChange}
                            defaultValue={ChartRange.TODAY}
                            position="bottomRight"
                            options={ [
                                {
                                    value: ChartRange.TODAY,
                                    label: i18next.t("page.dashboard.chart.range.today"),
                                },
                                {
                                    value: ChartRange.YESTERDAY,
                                    label: i18next.t("page.dashboard.chart.range.yesterday"),
                                },
                                {
                                    value: ChartRange.THIS_WEEK,
                                    label: i18next.t("page.dashboard.chart.range.thisWeek"),
                                },
                                {
                                    value: ChartRange.LAST_WEEK,
                                    label: i18next.t("page.dashboard.chart.range.lastWeek"),
                                },
                                {
                                    value: ChartRange.THIS_MONTH,
                                    label: i18next.t("page.dashboard.chart.range.thisMonth"),
                                },
                                {
                                    value: ChartRange.LAST_MONTH,
                                    label: i18next.t("page.dashboard.chart.range.lastMonth"),
                                },
                                {
                                    value: ChartRange.ALL_TIME,
                                    label: i18next.t("page.dashboard.chart.range.allTime"),
                                },
                            ] }
                        />
                    </GSLayoutContentHeaderRightEl>
                </GSLayoutContentHeader>
                <GSLayoutContentBody size={GSLayoutContentBody.size.MAX}>
                    {/*4 CARD*/}
                    <GSLayoutRow marginTop marginBottom>
                        {/*TOTAL SERVICE*/}
                        <GSLayoutCol3>
                            <GSCard className="dashboard-ava-card">
                                <span className="card-title">
                                    {i18next.t("page.analytics.reservations.totalServices")}
                                </span>
                                <GSTooltip message={i18next.t("page.analytics.reservations.totalServicesHint")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                                <UikAvatar
                                    highlighted
                                    imgUrl={'/assets/images/analytics-reservations/icon-totalservices.svg'}
                                    name={this.renderCountUp(this.state.totalProducts)}
                                />
                            </GSCard>
                        </GSLayoutCol3>

                        {/*COMPLETED SERVICES*/}
                        <GSLayoutCol3>
                            <GSCard className="dashboard-ava-card">
                                <span className="card-title">
                                    {i18next.t("page.analytics.reservations.completedServices")}
                                </span>
                                <GSTooltip message={i18next.t("page.analytics.reservations.completedServicesHint")}  icon={GSTooltipIcon.INFO_CIRCLE}/>
                                <UikAvatar
                                    highlighted
                                    imgUrl={'/assets/images/analytics-reservations/icon-booking-completed.svg'}
                                    name={this.renderCountUp(this.state.soldQuantity)}
                                />
                            </GSCard>
                        </GSLayoutCol3>

                        {/*AVG*/}
                        <GSLayoutCol3>
                            <GSCard className="dashboard-ava-card">
                                <span className="card-title">
                                    {i18next.t("page.analytics.reservations.avgValue")}
                                </span>
                                <GSTooltip message={i18next.t("page.analytics.reservations.avgValueHint")}  icon={GSTooltipIcon.INFO_CIRCLE}/>
                                <UikAvatar
                                    highlighted
                                    imgUrl={"/assets/images/analytics-reservations/icon-AvgReservation.svg"}
                                    name={this.renderCountUp(this.state.avgOrderValue)}
                                />
                            </GSCard>
                        </GSLayoutCol3>

                        {/*PENDING REVENUE*/}
                        <GSLayoutCol3>
                            <GSCard className="dashboard-ava-card">
                                <span className="card-title">
                                    {i18next.t("page.analytics.reservations.pendingRevenue")}
                                </span>
                                <GSTooltip message={i18next.t("page.analytics.reservations.pendingRevenueHint")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                                <UikAvatar
                                    highlighted
                                    imgUrl={"/assets/images/analytics-reservations/icon-totalservices.svg"}
                                    name={this.renderCountUp(this.state.pendingRevenue)}
                                />
                            </GSCard>
                        </GSLayoutCol3>

                    </GSLayoutRow>
                    {/*CHART*/}
                    <GSLayoutRow>
                        <GSLayoutCol12>
                            <GSCard className="dashboard__card-chart">
                                <div className="gs-atm__flex-row--center gs-atm__flex-align-items--center">
                                    <UikAvatar className="dashboard-ava-card--non-ava"
                                               highlighted
                                        // imgUrl={"/assets/images/dashboard/pending_revenue.svg"}
                                               textTop={i18next.t("page.analytics.reservations.chart.totalReservations")}
                                               name={this.renderCountUp(this.state.totalOrders)}
                                    />
                                    <div className="divider"/>
                                    <UikAvatar  className="dashboard-ava-card--non-ava"
                                                highlighted
                                        // imgUrl={"/assets/images/dashboard/pending_revenue.svg"}
                                                textTop={i18next.t("page.analytics.reservations.chart.totalRevenue")}
                                                name={this.renderCountUp(this.state.totalRevenue)}
                                    />
                                </div>
                                {/*CHART*/}
                                <Bar
                                    data={this.state.chartData}
                                    options={this.state.chartOptions}
                                />
                            </GSCard>
                        </GSLayoutCol12>
                    </GSLayoutRow>
                    {/*TOP AND RECENT*/}
                    <GSLayoutRow>
                        <GSLayoutCol12>
                            <GSWidget>
                                <GSWidgetHeader>
                                    <Trans i18nKey="page.analytics.reservations.table.recentReservations"/>
                                </GSWidgetHeader>
                                <GSWidgetContent>
                                    <UikWidgetTable>
                                        <thead>
                                        <tr>
                                            <th>
                                                <Trans i18nKey="page.dashboard.table.fullName"/>
                                            </th>
                                            <th>
                                                <Trans i18nKey="page.analytics.reservations.table.reservationsId"/>
                                            </th>
                                            <th>
                                                <Trans i18nKey="page.dashboard.table.total"/>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.recentOrder.map( (order, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <b>
                                                            {order.buyerName}
                                                        </b>
                                                    </td>
                                                    <td>
                                                        {'#'+order.id}
                                                    </td>
                                                    <td>
                                                        {CurrencyUtils.formatMoneyByCurrency(
                                                            order.total,
                                                            order.currency
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </UikWidgetTable>
                                </GSWidgetContent>
                            </GSWidget>
                        </GSLayoutCol12>
                    </GSLayoutRow>
                </GSLayoutContentBody>
            </GSLayoutContentContainer>
        );
    }

    componentDidMount() {
        this.fetchData(ChartRange.TODAY)
    }

    onDateRangeChange(item) {
        this.fetchData(item.value)
    }

    createEmptyChart() {
        let orderLabel = i18next.t("page.analytics.reservations.chart.totalReservations");
        let revenueLabel = i18next.t("page.analytics.reservations.chart.totalRevenue");


        const data ={
            datasets: [
                {
                    label: revenueLabel,
                    data: [],
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
                    data: [],
                    backgroundColor: '#556CE7',
                    yAxisID: 'order-axis'
                }
            ]
        }

        const options = {
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
                            }
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
        };



        this.setState({
            totalProducts: 0,
            soldQuantity: 0,
            avgOrderValue: 0,
            pendingRevenue: 0,
            totalOrders: 0,
            totalRevenue: 0,
            isFetching: false,
            isChangeType: false,
            chartData: data,
            chartOptions: options,
            topProduct: [],
            recentOrder: []
        })
    }

    fetchData(dateRange) {

        this.setState({
            isChangeType: true
        })

        this.pmFetchData = beehiveService.getAnalyticsInfo(dateRange, AnalyticsType.BOOKING)
        this.pmFetchData
            .then( result => {
                let orderLabel = i18next.t("page.analytics.reservations.chart.totalReservations");
                let revenueLabel = i18next.t("page.analytics.reservations.chart.totalRevenue");


                let chartData = result.chartData


                const data ={
                    datasets: [
                        {
                            label: revenueLabel,
                            data: chartData.map( chartValue => {return chartValue.totalRevenue}),
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
                            data: chartData.map( chartValue => {return chartValue.totalOrders}),
                            backgroundColor: '#556CE7',
                            yAxisID: 'order-axis'
                        }
                    ]
                }

                const options = {
                    scales: {
                        xAxes: [{
                            labels: chartData.map( chartValue => {
                                switch (dateRange) {
                                    case Constants.DashBoardChartType.TODAY:
                                    case Constants.DashBoardChartType.YESTERDAY:
                                        return moment(chartValue.timestamp).format('HH') + ':00'
                                    case Constants.DashBoardChartType.THIS_WEEK:
                                    case Constants.DashBoardChartType.LAST_WEEK:
                                        return moment(chartValue.timestamp).format('DD/MM')
                                    case Constants.DashBoardChartType.LAST_MONTH:
                                    case Constants.DashBoardChartType.THIS_MONTH:
                                        return moment(chartValue.timestamp).format('DD/MM')
                                    case Constants.DashBoardChartType.ALL_TIME:
                                        return moment(chartValue.timestamp).format('MM/YYYY')
                                    default:
                                        return moment(chartValue.timestamp).format('MM/YYYY')
                                }}
                            ),
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
                                    }
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
                };



                this.setState({
                    totalProducts: result.totalProducts,
                    soldQuantity: result.soldQuantity,
                    avgOrderValue: Math.round(result.avgOrderValue),
                    pendingRevenue: result.pendingRevenue,
                    totalOrders: result.totalOrders,
                    totalRevenue: result.totalRevenue,
                    isFetching: false,
                    isChangeType: false,
                    chartData: data,
                    chartOptions: options,
                    topProduct: result.topProducts,
                    recentOrder: result.recentOrders
                })
            })
            .catch(e => {
                this.createEmptyChart()
            })
    }

    componentWillUnmount() {
        // if (this.pmFetchData) this.pmFetchData.cancel()
    }
}

const ChartRange = {
    TODAY: 'TODAY',
    YESTERDAY: 'YESTERDAY',
    THIS_WEEK: 'THIS_WEEK',
    LAST_WEEK: 'LAST_WEEK',
    THIS_MONTH: 'THIS_MONTH',
    LAST_MONTH: 'LAST_MONTH',
    ALL_TIME: 'ALL_TIME'
}

AnalyticsReservations.propTypes = {};

export default AnalyticsReservations;
