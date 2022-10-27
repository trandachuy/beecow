import React, {useContext, useEffect, useReducer, useRef, useState} from "react";
import './AnalyticsOrdersBranch.sass';
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {Pie} from "react-chartjs-2";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import i18next from "i18next";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {Trans} from "react-i18next";
import {UikWidgetTable} from "../../../../@uik";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import _ from 'lodash';
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";

const BRANCH_COLOR = ["#FE0013", "#FF9725", "#FFCF2F", "#70C429", "#0E9629", "#14AEB0", "#131ED7", "#7D22F9", "#B61BD3", "#D815AE", "#6C6C6B"]

const AnalyticsOrdersBranch = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const refChart = useRef(null);
    const [stLegend, setStLegend] = useState([]);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const [stData, stSetData] = useState({
        labels: [],
        datasets: [{
            backgroundColor: [],
            data: []
        }]

    });

    const [stIsShowModal, setStIsShowModal] = useState(false);

    useEffect(() => {
        let labels = [];
        let backgroundColor = [];
        let data = [];
        let length = state.branchDataSet.length;
        if (length > 10) {
            let firstGroup = state.branchDataSet.slice(0, 10);
            let secondGroup = state.branchDataSet.slice(10, state.branchDataSet.length);
            let totalOther = 0;
            let totalPercent = 0;
            for (let record of secondGroup) {
                totalOther += record.revenue;
                totalPercent += record.percentage;
            }
            labels = firstGroup.map(x => { return `${x.groupLabel} ${AnalyticsOrdersContextServive.getPercentageText(x.percentage)}`; });
            labels.push(i18next.t("page.analytics.order.branch.revenue.other") + ` (${totalPercent})`);
            backgroundColor = BRANCH_COLOR.slice(0, 11);
            data = firstGroup.map(x => { return x.revenue; });
            data.push(totalOther);
        } else {
            labels = state.branchDataSet.map(x => { return `${x.groupLabel} ${AnalyticsOrdersContextServive.getPercentageText(x.percentage)}`; });
            backgroundColor = BRANCH_COLOR.slice(0, state.branchDataSet.length);
            data = state.branchDataSet.map(x => { return x.revenue; });
        }
        stSetData({
            labels: splitLabelTooLong(labels),
            datasets: [{
                backgroundColor: backgroundColor,
                data: data
            }]

        });

    }, [state.branchDataSet]);

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

    const openDetailModal = (e) => {
        e.preventDefault();
        setStIsShowModal(true);
    };

    const hideDetailModal = (e) => {
        e.preventDefault();
        setStIsShowModal(false);
    };

    const closeBtn = (<button className="close" style={{
        top: '0',
        right: '0',
        margin: '0',
        color: 'black',
        fontSize: '2em',
        padding: '0 0.4em',
    }} onClick={hideDetailModal}>&times;</button>);

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

    const handleLegendClick = (datasetIndex) => {
        let meta = refChart.current.chartInstance.getDatasetMeta(0).data[datasetIndex];
        meta.hidden = !meta.hidden;
        refChart.current.chartInstance.update(); // re-draw chart to hide dataset
        let legend = _.cloneDeep(stLegend);
        legend[datasetIndex].textDecoration = meta.hidden ? 'line-through' : 'none';
        setStLegend(legend);
        forceUpdate({}); // re-draw component to update legend styles
    };

    return (
        <GSWidget className="m-0">
            <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE} rightEl={ state.branchDataSet.length ?
                <a href='#' onClick={openDetailModal}><GSTrans t='page.analytics.order.branch.revenue.view.detail'/></a>
                : ""
            }>
                <div className={"text-uppercase"}>
                    <GSTrans t={"page.analytics.order.branch.revenue.modal.title"} />
                </div>
            </GSWidgetHeader>
            <GSWidgetContent>
                <div className={"d-flex flex-wrap justify-content-center"}>
                    <AnalyticsOrdersEmptyData isEmptyData={state.branchDataSet.length <= 0}>
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
            <Modal isOpen={stIsShowModal} className={"alert-modal"} centered={true} fade={false} size={"md"}>
                <ModalHeader toggle={hideDetailModal} close={closeBtn}>
                    <GSTrans t='page.analytics.order.branch.revenue.modal.title'/>
                </ModalHeader>
                <ModalBody>
                    <UikWidgetTable>
                        <thead>
                        <tr>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.branch.revenue.branch.name"/>
                            </th>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.branch.revenue.revenue"/>
                            </th>
                            <th className={"text-uppercase"}>
                                <Trans i18nKey="page.analytics.order.branch.revenue.percent"/>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {state.branchDataSet.map( (branch, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <b>
                                            {branch.groupLabel}
                                        </b>
                                    </td>
                                    <td>
                                        {branch.revenue}
                                    </td>
                                    <td>
                                        {branch.percentage + '%'}
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </UikWidgetTable>
                </ModalBody>
            </Modal>
        </GSWidget>
    )
};

AnalyticsOrdersBranch.propTypes = {

};

export default AnalyticsOrdersBranch;
