import React, {useContext, useEffect, useRef, useState} from "react";
import './AnalyticsOrdersCustomerLocation.sass';

import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import i18next from "i18next";
import {Doughnut} from "react-chartjs-2";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {CurrencyUtils} from "../../../../utils/number-format";
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {UikWidgetTable} from "../../../../@uik";
import {Trans} from "react-i18next";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";

const AnalyticsOrdersCustomerLocation = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);

    const LIMIT = 10;
    const refChart = useRef();
    /* //original colors
    const COLORS = ["#FF0013","#FF9725","#FFCF2F","#70C429","#0E9629","#14AEB0","#131ED7","#7D22F9","#B61BD3","#D815AE","#6C6C6B"] 
    */
    const PRIMARY_COLORS = ["rgb(255 0 19)","rgb(255 151 37)","rgb(255 207 47)","rgb(112 196 41)","rgb(14 150 41)","rgb(20 174 176)","rgb(19 30 215)","rgb(125 34 249)","rgb(182 27 211)","rgb(216 21 174)","rgb(108 108 107)"]
    const LIGHTER_COLORS = ["rgb(255 0 19 / 84%)","rgb(255 151 37 / 84%)","rgb(255 207 47 / 84%)","rgb(112 196 41 / 84%)","rgb(14 150 41 / 84%)","rgb(20 174 176 / 84%)","rgb(19 30 215 / 84%)","rgb(125 34 249 / 84%)","rgb(182 27 211 / 84%)","rgb(216 21 174 / 84%)","rgb(108 108 107 / 84%)"]
    const [options, setOptions] = useState({
        legend: {
            display: true,
            position: 'right',
            align: 'center',
            fullWidth: true
        },
        responsive: true,
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    const labelTootip = data.labels[tooltipItem.index];
                    if(!labelTootip || labelTootip.length === 0) {
                        return "";
                    }
                    const lastSpace = labelTootip.lastIndexOf(' ');
                    const tooltip = labelTootip.substr(0, lastSpace > -1? lastSpace: 0);
                    return tooltip;
                }
            }
        }
    })
    const [stDatasets, setStDatasets] = useState({
        labels: [],
        datasets: [{
            backgroundColor: [],
            hoverBackgroundColor: [],
            data: []
        }]
    })
    const [legends, setLegends] = useState([])
    const [stOpenModal, setStOpenModal] = useState(false)
    const [locationData, setLocationData] = useState([])

    useEffect(() => {
        loadLocationData();
    }, [state.locationDataSet]);

    useEffect(() => {
        buildChartData();
    }, [locationData]);

    const buildChartData = () => {
        let labels = [];
        let displayLegends = [];
        let datasets = {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        };
        const size = locationData ? locationData.length : 0;
        if (size > LIMIT) {
            let firstGroup = locationData.slice(0, LIMIT);
            let secondGroup = locationData.slice(LIMIT, locationData.length);
            let totalPercentage = 0;
            let totalRevenue = 0;
            for (let record of secondGroup) {
                totalPercentage += record.percentage;
                totalRevenue += record.revenue;
            }
            datasets.backgroundColor = LIGHTER_COLORS.slice(0, LIMIT + 1);
            datasets.hoverBackgroundColor = PRIMARY_COLORS.slice(0, LIMIT + 1);
            datasets.data = firstGroup.map(x => { return x.revenue; });
            labels = firstGroup.map(x => { 
                return `${x.groupLabel} ${CurrencyUtils.formatMoneyByCurrency(x.revenue, state.currency)} ${AnalyticsOrdersContextServive.getPercentageText(x.percentage)}`;
            });
            displayLegends = firstGroup.map(x => { 
                return {label: x.groupLabel,revenue: x.revenue,percentage: x.percentage, size: (`${x.groupLabel}|${x.revenue}|(${x.percentage})`.length)}; 
            });
            labels.push(`${i18next.t("page.analytics.order.location.revenue.other")} ${CurrencyUtils.formatMoneyByCurrency(totalRevenue, state.currency)} (${totalPercentage}%)`);
            displayLegends.push({label: i18next.t("page.analytics.order.location.revenue.other"),revenue: totalRevenue,percentage: totalPercentage})
            datasets.data.push(totalRevenue);
        } else {
            datasets.backgroundColor = LIGHTER_COLORS.slice(0, locationData.length);
            datasets.hoverBackgroundColor = PRIMARY_COLORS.slice(0, locationData.length);
            datasets.data = locationData.map(x => { return x.revenue; });
            labels = locationData.map(x => {
                return `${x.groupLabel} ${CurrencyUtils.formatMoneyByCurrency(x.revenue, state.currency)} ${AnalyticsOrdersContextServive.getPercentageText(x.percentage)}`;
            });
            displayLegends = locationData.map(x => { 
                return {label: x.groupLabel,revenue: x.revenue,percentage: x.percentage, size: (`${x.groupLabel}|${x.revenue}|(${x.percentage})`.length)}; 
            });
        }

        setLegends(displayLegends);
        setStDatasets({
            labels: labels,
            datasets: [datasets]
        });
    };

    const loadLocationData = () => {
        const data = state.locationDataSet || [];
        setLocationData(data);
    };

    const onClickDataset = (data) => {
    };

    const onClickElement = (data) => {
    };

    const onClickElements = (data) => {
    };

    const showDetail = () => {
        setStOpenModal(true);
    }

    const hideDetail = () => {
        setStOpenModal(false);
    };

    return (
        <>
            <GSWidget>
                <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE} rightEl={
                    <div style={{
                        "color": "blue",
                        "cursor": "pointer",
                        "visibility": `${locationData.length === 0? "hidden": "unset"}`
                    }} onClick={showDetail}>
                        <GSTrans t='page.analytics.order.location.revenue.view.detail'/>
                    </div>
                }>
                    <div className={"text-uppercase"}>
                        <GSTrans t={"page.analytics.order.filter.location"}/>
                    </div>
                </GSWidgetHeader>
                <GSWidgetContent>
                    <div className={"d-flex flex-wrap justify-content-center"}>
                        <AnalyticsOrdersEmptyData isEmptyData={locationData.length <= 0}>
                            <div className={'d-flex'} style={{width: '80%'}}>
                                <Doughnut
                                    ref={refChart}
                                    data={stDatasets}
                                    options={options}
                                    getDatasetAtEvent={onClickDataset}
                                    getElementAtEvent={onClickElement}
                                    getElementsAtEvent={onClickElements}
                                />
                            </div>
                        </AnalyticsOrdersEmptyData>
                    </div>
                </GSWidgetContent>
            </GSWidget>
            <Modal isOpen={stOpenModal} className={"alert-modal modal-dialog-scrollable"} centered={true} fade={false} size={"md"}>
                <ModalHeader toggle={hideDetail} close={(<button className="close"
                                                                 style={{
                                                                     top: '0',
                                                                     right: '0',
                                                                     margin: '0',
                                                                     color: 'black',
                                                                     fontSize: '2em',
                                                                     padding: '0 0.4em',
                                                                 }}
                                                                 onClick={hideDetail}>&times;</button>)}>
                    <GSTrans t='page.analytics.order.location.revenue.modal.title'/>
                </ModalHeader>
                <ModalBody>
                    <UikWidgetTable>
                        <thead>
                        <tr>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.location.revenue.branch.name"/>
                            </th>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.location.revenue.revenue"/>
                            </th>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.location.revenue.percent"/>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {locationData.map((location, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <b>
                                            {location.groupLabel}
                                        </b>
                                    </td>
                                    <td>
                                        {CurrencyUtils.formatMoneyByCurrency(location.revenue, state.currency)}
                                    </td>
                                    <td>
                                        {AnalyticsOrdersContextServive.getPercentageText(location.percentage)}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </UikWidgetTable>
                </ModalBody>
            </Modal>
        </>
    );
};

AnalyticsOrdersCustomerLocation.propTypes = {};

export default AnalyticsOrdersCustomerLocation;
