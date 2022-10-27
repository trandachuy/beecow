import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersFilter.sass';
import {UikSelect, UikTabContainer, UikTabItem} from "../../../../@uik";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import i18next from "i18next";
import storeService from "../../../../services/StoreService";
import {AnalyticsOrdersContextServive} from "../context/AnalyticsOrdersContextService";
import {AgencyService} from "../../../../services/AgencyService";
import {BillingInfoService} from "../../../../services/BillingInfoService";

const AnalyticsOrdersFilter = props => {
    const {state, dispatch} = useContext(AnalyticsOrdersContext.context);
    const [stBranches, setStBranches] = useState([{
        value: AnalyticsOrdersContext.BRANCH_OPTIONS.ALL,
        label: i18next.t("page.analytics.order.filter.branch.all")
    }]);
    const [stStaffs, setStStaffs] = useState([{
        value: AnalyticsOrdersContext.STAFF_OPTIONS.ALL,
        label: i18next.t("page.cashbook.filter.createdBy.all")
    }]);

    const changeTab = (value) => {
        if (value === AnalyticsOrdersContext.FILTER_OPTIONS.ALL) {
            dispatch(AnalyticsOrdersContext.actions.setFilterSaleChannel(AnalyticsOrdersContext.SALE_CHANNEL_OPTIONS.ALL));
            dispatch(AnalyticsOrdersContext.actions.setFilterBranch(AnalyticsOrdersContext.BRANCH_OPTIONS.ALL));
            dispatch(AnalyticsOrdersContext.actions.setFilterPlatform(AnalyticsOrdersContext.PLATFORM_OPTIONS.ALL));
            dispatch(AnalyticsOrdersContext.actions.setFilterStaffName(AnalyticsOrdersContext.STAFF_OPTIONS.ALL));
        }
        dispatch(AnalyticsOrdersContext.actions.setFilterTab(value));
    };

    const changeSaleChannel = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setFilterSaleChannel(value));
    };

    const changeBranch = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setFilterBranch(value));
    };

    const changePlatform = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setFilterPlatform(value));
    };
    
    const changeStaffName = (value) => {
        dispatch(AnalyticsOrdersContext.actions.setFilterStaffName(value));
    };

    useEffect(() => {
        AnalyticsOrdersContextServive.updateRevenueTrend(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueSummary(state, dispatch);
        AnalyticsOrdersContextServive.updateRevenueByGroupLocation(state, dispatch);
        AnalyticsOrdersContextServive.updateTopSalesByItem(state, dispatch);
        AnalyticsOrdersContextServive.updateTopSalesByInStoreStaff(state, dispatch);
    }, [state.filterSaleChannel, state.filterBranch, state.filterPlatform, state.filterStaffName]);

    useEffect(() => {
        BillingInfoService.getAllStaffs()
            .then(staffs=>{
                setStStaffs(state=>{
                    const staffList = staffs.map(staff=>{
                        return {
                            value: staff,
                            label: staff === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : staff
                        }
                    })
                    return [...state,...staffList]
                })
            })
    }, []);

    useEffect(() => {
        let branches = stBranches;
        storeService.getFullStoreBranches()
            .then((resp) => {
                const result = resp.data || [];
                const branch = result.map(b => {
                    return {value: b.id, label: b.name};
                });
                branches = branches.concat(branch);
                setStBranches(branches);
            });
    }, []);

    return (
        <>
            <div className={"col-md-10"}>
                <UikTabContainer className={"p-0"}>
                    {[  {
                        value: AnalyticsOrdersContext.FILTER_OPTIONS.ALL,
                        label: i18next.t("page.analytics.order.filter.all")
                    },
                        {
                            value: AnalyticsOrdersContext.FILTER_OPTIONS.SALE_CHANNEL,
                            label: i18next.t("page.analytics.order.filter.saleChannel")
                        },
                        {
                            value: AnalyticsOrdersContext.FILTER_OPTIONS.BRANCH,
                            label: i18next.t("page.analytics.order.filter.branch")
                        },
                        {
                            value: AnalyticsOrdersContext.FILTER_OPTIONS.PLATFORM,
                            label: i18next.t("page.analytics.order.filter.platform")
                        },
                        {
                            value: AnalyticsOrdersContext.FILTER_OPTIONS.STAFF,
                            label: i18next.t("page.analytics.order.filter.Staff")
                        },
                    ].map((option) => {
                        return (
                            <UikTabItem key={option.value}
                                        active={state.filterTab === option.value}
                                        onClick={() => changeTab(option.value)}>
                                {option.label}
                            </UikTabItem>
                        );
                    })}
                </UikTabContainer>
            </div>
            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.ALL &&
            <UikSelect
                defaultValue={AnalyticsOrdersContext.FILTER_OPTIONS.ALL}
                className="col-md-2 gs-atm--disable"
                options={[{
                    value: AnalyticsOrdersContext.FILTER_OPTIONS.ALL,
                    label: i18next.t("page.analytics.order.filter.all")
                }]}
            />
            }
            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.SALE_CHANNEL &&
            <UikSelect
                className="col-md-2"
                value={[{value: state.filterSaleChannel}]}
                options={[{
                    value: AnalyticsOrdersContext.SALE_CHANNEL_OPTIONS.ALL,
                    label: i18next.t("page.analytics.order.filter.saleChannel.all")
                },
                    {
                        value: AnalyticsOrdersContext.SALE_CHANNEL_OPTIONS.GOSELL,
                        label: AgencyService.getDashboardName()
                    },
                    {
                        value: AnalyticsOrdersContext.SALE_CHANNEL_OPTIONS.GOMUA,
                        label: 'GOMUA'
                    },
                    {
                        value: AnalyticsOrdersContext.SALE_CHANNEL_OPTIONS.SHOPEE,
                        label: 'SHOPEE'
                    },
                    {
                        value: AnalyticsOrdersContext.SALE_CHANNEL_OPTIONS.LAZADA,
                        label: 'LAZADA'
                    }
                ]}
                onChange={(item) => changeSaleChannel(item.value)}
            />
            }
            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.BRANCH &&
            <UikSelect
                className="col-md-2"
                value={[{value: state.filterBranch}]}
                options={stBranches}
                onChange={(item) => changeBranch(item.value)}
            />
            }
            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.PLATFORM &&
            <UikSelect
                className="col-md-2"
                value={[{value: state.filterPlatform}]}
                options={[
                    {
                        value: AnalyticsOrdersContext.PLATFORM_OPTIONS.ALL,
                        label: i18next.t("page.analytics.order.filter.platform.all")
                    },
                    {
                        value: AnalyticsOrdersContext.PLATFORM_OPTIONS.APP,
                        label: i18next.t("page.analytics.order.filter.platform.app")
                    },
                    {
                        value: AnalyticsOrdersContext.PLATFORM_OPTIONS.WEB,
                        label: 'Website'
                    },
                    {
                        value: AnalyticsOrdersContext.PLATFORM_OPTIONS.IN_STORE,
                        label: i18next.t("page.analytics.order.filter.platform.instore")
                    },
                    {
                        value: AnalyticsOrdersContext.PLATFORM_OPTIONS.GOSOCIAL,
                        label: 'Gosocial'
                    }
                ]}
                onChange={(item) => changePlatform(item.value)}
            />
            }
            {state.filterTab === AnalyticsOrdersContext.FILTER_OPTIONS.STAFF &&
            <UikSelect
                className="col-md-2"
                value={[{value: state.filterStaffName}]}
                options={stStaffs}
                onChange={(item) => changeStaffName(item.value)}
            />
            }
        </>
    )
};

AnalyticsOrdersFilter.propTypes = {

};

export default AnalyticsOrdersFilter;
