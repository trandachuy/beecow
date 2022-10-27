import React, {useContext, useEffect, useReducer, useRef, useState} from "react";
import './AnalyticsOrdersStaff.sass';
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {Pie} from "react-chartjs-2";
import i18next from "i18next";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";
import _ from "lodash";
import {CurrencyUtils} from "../../../../utils/number-format";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {UikWidgetTable} from "../../../../@uik";
import {Trans} from "react-i18next";
import Modal from "reactstrap/es/Modal";

const BRANCH_COLOR = ["#FE0013", "#FF9725", "#FFCF2F", "#70C429", "#0E9629", "#14AEB0", "#131ED7", "#7D22F9", "#B61BD3", "#D815AE", "#6C6C6B"]

const AnalyticsOrdersStaff = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const refChart = useRef(null);
    const [stLegend, setStLegend] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [stData, stSetData] = useState({
        labels: [],
        datasets: [{
            backgroundColor: [],
            data: []
        }]

    });
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [stOpenModal, setStOpenModal] = useState(false)

    useEffect(() => {
        loadStaffData();
    }, [state.staffDataSet]);

    useEffect(() => {
        let labels = [];
        let backgroundColor = [];
        let data = [];
        let length = state.staffDataSet.length;
        if (length > 10) {
            let firstGroup = state.staffDataSet.slice(0, 10);
            let secondGroup = state.staffDataSet.slice(10, state.staffDataSet.length);
            let totalOther = 0;
            let totalPercent = 0;
            for (let record of secondGroup) {
                totalOther += record.revenue;
                totalPercent += record.percentage;
            }
            labels = firstGroup.map(x => { return `${x.groupLabel === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : x.groupLabel} ${CurrencyUtils.formatMoneyByCurrency(x.revenue, state.currency)} ${AnalyticsOrdersContextServive.getPercentageText(x.percentage)}`; });
            labels.push(i18next.t("page.analytics.order.branch.revenue.other") + ` (${totalPercent})`);
            backgroundColor = BRANCH_COLOR.slice(0, 11);
            data = firstGroup.map(x => { return x.revenue; });
            data.push(totalOther);
        } else {
            labels = state.staffDataSet.map(x => { return `${x.groupLabel === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : x.groupLabel} ${CurrencyUtils.formatMoneyByCurrency(x.revenue, state.currency)} ${AnalyticsOrdersContextServive.getPercentageText(x.percentage)}`; });
            backgroundColor = BRANCH_COLOR.slice(0, state.staffDataSet.length);
            data = state.staffDataSet.map(x => { return x.revenue; });
        }
        stSetData({
            labels: splitLabelTooLong(labels),
            datasets: [{
                backgroundColor: backgroundColor,
                data: data
            }]

        });

    }, [state.staffDataSet]);

    useEffect(() => {
        setTimeout(function() { setStLegend(generateLegend()); }, 1000);
    }, [stData]);

    const generateLegend = () => {
        if(refChart === null || refChart.current === null) return null;
        return refChart.current.chartInstance.generateLegend();
    };

    const splitLabelTooLong = (labels) => {
        let result = [];
        for (const label of labels) {
            if (label.length < 35) {
                result.push(label);
            } else if (label.length < 70) {
                let parts = label.split(" ");
                let lines = _.chunk(parts, _.ceil(parts.length / 2));
                result.push([lines[0].join(" "), lines[1].join(" ")]);
            } else {
                let parts = label.split(" ");
                let lines = _.chunk(parts, _.ceil(parts.length / 3));
                result.push([lines[0].join(" "), lines[1].join(" "), lines[2].join(" ")]);
            }
        }
        return result;
    };

    const handleLegendClick = (datasetIndex) => {
        let meta = refChart.current.chartInstance.getDatasetMeta(0).data[datasetIndex];
        meta.hidden = !meta.hidden;
        refChart.current.chartInstance.update(); // re-draw chart to hide dataset
        let legend = _.cloneDeep(stLegend);
        legend[datasetIndex].textDecoration = meta.hidden ? 'line-through' : 'none';
        setStLegend(legend);
        forceUpdate({}); // re-draw component to update legend styles
    };

    const legendCallback = (chart) => {
        let legends = [];
        for (let i = 0; i < chart.data.labels.length; i++) {
            const label = chart.data.labels[i];
            legends.push({
                backgroundColor: chart.data.datasets[0].backgroundColor[i],
                label: typeof label === "string" ? label : label.join("<br>"),
                textDecoration: 'none'
            });
        }
        return legends;
    };

    const loadStaffData = () => {
        const data = state.staffDataSet || [];
        setStaffData(data);
    };

    const showDetail = () => {
        setStOpenModal(true);
    }

    const hideDetail = () => {
        setStOpenModal(false);
    };


    return (
        <>
            <GSWidget className="m-0">
                <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE} rightEl={
                    <div style={{
                        "color": "blue",
                        "cursor": "pointer",
                        "visibility": "unset"
                    }} onClick={showDetail}>
                        <GSTrans t='page.analytics.order.location.revenue.view.detail'/>
                    </div>
                }>
                    <div className={"text-uppercase"}>
                        <GSTrans t={"page.analytics.order.staff.revenue.title"} />
                    </div>
                </GSWidgetHeader>
                <GSWidgetContent>
                    <div className={"d-flex flex-wrap justify-content-center"}>
                        <AnalyticsOrdersEmptyData isEmptyData={state.staffDataSet.length <= 0}>
                            <div className={'d-flex flex-wrap justify-content-center'} style={{width: 'calc(100% - 250px)'}}>
                                <Pie ref={refChart}
                                     data={stData}
                                     options={{
                                         responsive: true,
                                         legend: {
                                             display: false
                                         },
                                         legendCallback: legendCallback
                                     }}
                                />
                            </div>
                            <div className={'d-flex gs-atm__flex-align-items--center'} style={{maxWidth: '250px'}}>
                                <ul className={'color-gray'} style={{listStyleType: 'none'}}>
                                    {stLegend && stLegend.map((item, index) => {
                                        return (
                                            <li key={index} style={{display: 'flex'}} onClick={() => handleLegendClick(index)}>
                                                <div style={{
                                                    backgroundColor: item.backgroundColor,
                                                    width: '45px',
                                                    height: '10px',
                                                    marginRight: '5px',
                                                    marginTop: '5px'
                                                }}>
                                                </div>
                                                <div dangerouslySetInnerHTML={{ __html: item.label }} style={{
                                                    textDecoration: item.textDecoration
                                                }}></div>
                                            </li>);
                                    })}
                                </ul>
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
                    <GSTrans t='page.analytics.order.staff.revenue.title'/>
                </ModalHeader>
                <ModalBody>
                    <UikWidgetTable>
                        <thead>
                        <tr>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.location.revenue.staff.name"/>
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
                        {staffData.map((staffName, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <b>
                                            {staffName.groupLabel === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : staffName.groupLabel}
                                        </b>
                                    </td>
                                    <td>
                                        {CurrencyUtils.formatMoneyByCurrency(staffName.revenue, state.currency)}
                                    </td>
                                    <td>
                                        {AnalyticsOrdersContextServive.getPercentageText(staffName.percentage)}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </UikWidgetTable>
                </ModalBody>
            </Modal>
        </>
    )
};

AnalyticsOrdersStaff.propTypes = {

};

export default AnalyticsOrdersStaff;
