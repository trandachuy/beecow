import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersTimeFrame.sass';
import {cn} from "../../../../utils/class-name";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import i18next from "i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from 'moment';
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSDateRangePicker from "../../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";
import {BillingInfoService} from "../../../../services/BillingInfoService";

const AnalyticsOrdersTimeFrame = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const [stLastSeenDate, setStLastSeenDate] = useState(null);
    const [stLastSeenStatus, setStLastSeenStatus] = useState(null);
    const [stPrevStatus, setStPrevStatus] = useState(null);
    const [stTicker, setStTicker] = useState(moment.now());

    const changeTimeFrame = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setCustomTimeFrame(null, null, value));
    };

    const fetchAllNewData = () => {
        AnalyticsOrdersContextServive.updateRevenueTrend(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueSummary(state, dispatch);
        AnalyticsOrdersContextServive.updateAllRevenue(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupBranch(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupPlatform(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupStaff(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupSaleChannel(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupLocation(state, dispatch);
        AnalyticsOrdersContextServive.updateTopSalesByInStoreStaff(state, dispatch);
        AnalyticsOrdersContextServive.updateTopSalesByItem(state, dispatch);
    };

    useEffect(() => {
        fetchAllNewData();
        let rangeDateText = AnalyticsOrdersContextServive.getRangeDateText(state);
        dispatch(AnalyticsOrdersContext.actions.setRangeDateText(rangeDateText));
    }, [state.timeFrame, state.customStartDate, state.customEndDate]);

    const filterByDate = (event, picker) => {
        let customStartDate = picker.startDate.format(AnalyticsOrdersContext.UI_DATE_FORMAT);
        let customEndDate = picker.endDate.format(AnalyticsOrdersContext.UI_DATE_FORMAT);
        dispatch(AnalyticsOrdersContext.actions.setCustomTimeFrame(customStartDate, customEndDate, AnalyticsOrdersContext.TIME_FRAMES.CUSTOM));
    };

    const clearDate = (event, picker) => {
        picker.startDate = moment();
        picker.endDate = moment();
        dispatch(AnalyticsOrdersContext.actions.setCustomTimeFrame(null, null, AnalyticsOrdersContext.TIME_FRAMES.TODAY));
    };

    const getInputTextDate = () => {
        if (state.customStartDate != null) {
            return state.customStartDate + ' - ' + state.customEndDate;
        } else {
            return i18next.t("page.analytics.order.time.frame.custom_date");
        }
    };

    const handleRefresh = (e) => {
        e.preventDefault();
        updateLastSyncInfo();
    };

    useEffect(() => {
        BillingInfoService.getLastSeenInfo().then(getInfo => {
            setStLastSeenDate(parseLastUpdatedDate(getInfo.data.lastUpdatedDate));
            setStLastSeenStatus(getInfo.data.status);
            if (stPrevStatus != null && stPrevStatus !== getInfo.data.status) {
                fetchAllNewData();
            }
            setStPrevStatus(getInfo.data.status);
        });
    }, [stTicker]);

    useEffect(() => {
        const stGetStatusInterval = setInterval(() => {
            setStTicker(moment.now());
        }, 10000);
        return () => clearInterval(stGetStatusInterval);
    }, []);

    const updateLastSyncInfo = () => {
        BillingInfoService.getLastSeenInfo().then(getInfo => {
            if (getInfo.data.status !== 'RUNNING') {
                BillingInfoService.updateLastSeenInfo().then(updateInfo => {
                    setStLastSeenDate(parseLastUpdatedDate(updateInfo.data.lastUpdatedDate));
                    setStLastSeenStatus(updateInfo.data.status);
                    setStPrevStatus(updateInfo.data.status);
                });
            } else {
                setStLastSeenDate(parseLastUpdatedDate(getInfo.data.lastUpdatedDate));
                setStLastSeenStatus(getInfo.data.status);
            }
        });
    };

    const parseLastUpdatedDate = (lastUpdatedDate) => {
        return lastUpdatedDate ? moment(lastUpdatedDate, "YYYY-MM-DDTHH:mm:ssZ").format('HH:mm DD/MM/YYYY') : "";
    }

    return (
        <div className="col-12 col-sm-12 col-md-12">
            <div className={"time-frame-wrapper"}>
                <GSWidget className="m-0">
                    <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE} rightEl={
                        <div>
                            <span className="spinner-border spinner-border-sm mr-2" role="status"
                                  hidden={stLastSeenStatus !== 'RUNNING'}></span>
                            <span className={stLastSeenStatus !== 'RUNNING' ? "" : "color-gray"}>
                                <span className={"font-weight-bold"}><GSTrans
                                    t={"page.analytics.order.time.frame.lastSeen"}/></span> : {stLastSeenDate}</span>
                            <span className={"pl-3"}><a
                                className={stLastSeenStatus !== 'RUNNING' ? "" : "link-not-active"} href='#'
                                onClick={handleRefresh}><GSTrans
                                t='page.analytics.order.time.frame.refresh'/></a></span>
                        </div>
                    }>
                        <div>
                            <GSTrans t={"page.analytics.order.time.frame.title"}/>
                        </div>
                    </GSWidgetHeader>
                    <GSWidgetContent>
                        <div className={"d-flex flex-wrap"}>
                            {[
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.TODAY,
                                    label: i18next.t("page.analytics.order.time.frame.today")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.YESTERDAY,
                                    label: i18next.t("page.analytics.order.time.frame.yesterday")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.LAST_7_DAYS,
                                    label: i18next.t("page.analytics.order.time.frame.last_7_days")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.LAST_30_DAYS,
                                    label: i18next.t("page.analytics.order.time.frame.last_30_days")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.LAST_WEEK,
                                    label: i18next.t("page.analytics.order.time.frame.last_week")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.LAST_MONTH,
                                    label: i18next.t("page.analytics.order.time.frame.last_month")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.THIS_WEEK,
                                    label: i18next.t("page.analytics.order.time.frame.this_week")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.THIS_MONTH,
                                    label: i18next.t("page.analytics.order.time.frame.this_month")
                                },
                                {
                                    value: AnalyticsOrdersContext.TIME_FRAMES.THIS_YEAR,
                                    label: i18next.t("page.analytics.order.time.frame.this_year")
                                }
                            ].map(x => {
                                return (
                                    <div key={x.value}
                                         className={cn("section__filter-optional",
                                             {
                                                 "selected": state.timeFrame === x.value,
                                                 "link-not-active": stLastSeenStatus === 'RUNNING'
                                             })}
                                         onClick={() => changeTimeFrame(x.value)}>
                                        {x.label}
                                    </div>
                                );
                            })}
                            <div className={"d-flex date-range-picker"}>
                                <GSDateRangePicker
                                    maxDate={moment()}
                                    minimumNights={0}
                                    onApply={filterByDate}
                                    onCancel={clearDate}
                                    containerClass={`position-relative pr-0 pr-sm-2 ${stLastSeenStatus === 'RUNNING' ? "link-not-active" : ""}`}
                                    containerStyles={{
                                        display: 'inline-block',
                                        width: '240px',
                                    }}
                                >
                                    <input type="text"
                                           value={getInputTextDate() === 'null - null' ? i18next.t("page.analytics.order.time.frame.custom_date") : getInputTextDate()}
                                           className="form-control"
                                    />
                                    <FontAwesomeIcon icon={['far', 'calendar-alt']} color="#939393" style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '.6rem'
                                    }}/>
                                </GSDateRangePicker>
                            </div>
                        </div>
                    </GSWidgetContent>
                </GSWidget>
            </div>
        </div>
    );
};

AnalyticsOrdersTimeFrame.propTypes = {};

export default AnalyticsOrdersTimeFrame;
