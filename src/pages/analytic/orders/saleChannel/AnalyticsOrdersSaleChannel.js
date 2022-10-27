import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersSaleChannel.sass';
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import {Pie} from "react-chartjs-2";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";
import {AgencyService} from "../../../../services/AgencyService";

const AnalyticsOrdersSaleChannel = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const [stHasData, setStHasData] = useState(false);

    const convertData = (saleChannelDataSet) => {
        return {
            labels: [`${AgencyService.getDashboardName()} ${AnalyticsOrdersContextServive.getPercentageText(saleChannelDataSet.gosellPercentage)}`,
                `GOMUA ${AnalyticsOrdersContextServive.getPercentageText(saleChannelDataSet.gomuaPercentage)}`,
                `SHOPEE ${AnalyticsOrdersContextServive.getPercentageText(saleChannelDataSet.shopeePercentage)}`,
                `LAZADA ${AnalyticsOrdersContextServive.getPercentageText(saleChannelDataSet.lazadaPercentage)}`],
            datasets: [{
                backgroundColor: [
                    "#322E7A",
                    "#F89725",
                    "#F4561D",
                    "#0517AA"
                ],
                data: [saleChannelDataSet.gosell, saleChannelDataSet.gomua, saleChannelDataSet.shopee, saleChannelDataSet.lazada]
            }]
        };
    };

    const [stData, stSetData] = useState(null);
    useEffect(() => {
        if (state.saleChannelDataSet.gosell !== 0 || state.saleChannelDataSet.gomua !== 0
            || state.saleChannelDataSet.shopee !== 0 || state.saleChannelDataSet.lazada !== 0) {
            setStHasData(true);
            stSetData(convertData(state.saleChannelDataSet));
        } else {
            setStHasData(false);
        }
    }, [state.saleChannelDataSet]);

    return (
        <GSWidget className="m-0">
            <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE}>
                <div className={"text-uppercase"}>
                    <GSTrans t={"page.analytics.order.channel.revenue.title"} />
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

AnalyticsOrdersSaleChannel.propTypes = {

};

export default AnalyticsOrdersSaleChannel;
