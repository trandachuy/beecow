import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersPlatform.sass';
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {Pie} from "react-chartjs-2";
import i18next from "i18next";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";

const AnalyticsOrdersPlatform = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const [stHasData, setStHasData] = useState(false);

    const convertData = (platformDataSet) => {
        let labels = [];
        let backgroundColor = [];
        let data = [];

        if (platformDataSet.web > 0) {
            labels.push(`Website ${AnalyticsOrdersContextServive.getPercentageText(platformDataSet.webPercentage)}`);
            backgroundColor.push("#24B24B");
            data.push(platformDataSet.web);
        }

        if (platformDataSet.app > 0) {
            labels.push(i18next.t("page.analytics.order.filter.platform.app") + ` ${AnalyticsOrdersContextServive.getPercentageText(platformDataSet.appPercentage)}`);
            backgroundColor.push("#D43335");
            data.push(platformDataSet.app);
        }

        if (platformDataSet.instore > 0) {
            labels.push(i18next.t("page.analytics.order.filter.platform.instore") + ` ${AnalyticsOrdersContextServive.getPercentageText(platformDataSet.instorePercentage)}`);
            backgroundColor.push("#FAA627");
            data.push(platformDataSet.instore);
        }

        if (platformDataSet.gosocial > 0) {
            labels.push(`Gosocial ${AnalyticsOrdersContextServive.getPercentageText(platformDataSet.gosocialPercentage)}`);
            backgroundColor.push("#3A5EA6");
            data.push(platformDataSet.gosocial);
        }

        return {
            labels: labels,
            datasets: [{
                backgroundColor: backgroundColor,
                data: data
            }]
        };
    };

    const [stData, stSetData] = useState(convertData(state.platformDataSet));
    useEffect(() => {
        if (state.platformDataSet.web !== 0 || state.platformDataSet.app !== 0
            || state.platformDataSet.instore !== 0) {
            setStHasData(true);
            stSetData(convertData(state.platformDataSet));
        } else {
            setStHasData(false);
        }
    }, [state.platformDataSet]);

    return (
        <GSWidget className="m-0">
            <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE}>
                <div className={"text-uppercase"}>
                    <GSTrans t={"page.analytics.order.platform.revenue.title"} />
                </div>
            </GSWidgetHeader>
            <GSWidgetContent>
                <div className={"d-flex flex-wrap justify-content-center"}>
                    <AnalyticsOrdersEmptyData isEmptyData={!stHasData}>
                        <div className={'d-flex'} style={{width: '80%'}}>
                            <Pie
                                data={stData}
                                options={{
                                    responsive: true,
                                    legend: {
                                        display: true,
                                        position: 'right'
                                    }
                                }}
                            />
                        </div>
                    </AnalyticsOrdersEmptyData>
                </div>
            </GSWidgetContent>
        </GSWidget>
    )
};

AnalyticsOrdersPlatform.propTypes = {

};

export default AnalyticsOrdersPlatform;
