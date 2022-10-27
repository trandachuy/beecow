import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersTopSalesStaff.sass';
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSDropDownButton, {GSDropdownItem} from "../../../../components/shared/GSButton/DropDown/GSDropdownButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSLetterImg from "../../../../components/shared/GSLetterImage/GSLetterImg";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import {AnalyticsOrdersContext} from "../context/AnalyticsOrdersContext";
import i18n from "i18next";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import _ from 'lodash';
import GSComponentTooltip from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";

const SORT_BY = {
    HIGHEST_TO_LOWEST: {
        label: i18n.t('page.analytics.order.all.topSalesStaff.order.highestToLowest'),
        value: 'desc'
    },
    LOWEST_TO_HIGHEST: {
        label: i18n.t('page.analytics.order.all.topSalesStaff.order.lowestToHighest'),
        value: 'asc'
    },
}
const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const AnalyticsOrdersTopSalesStaff = props => {
    const {state} = useContext(AnalyticsOrdersContext.context);

    const [stSort, setStSort] = useState(SORT_BY.HIGHEST_TO_LOWEST);
    const [stData, setStData] = useState([]);
    const [stSortToggle, setStSortToggle] = useState(false)

    useEffect(() => {
        setStSortToggle(toggle => !toggle)
        setStData(getSortedStaffDataSet());
    }, [state.topSalesStaffDataSet, stSort]);

    const getSortedStaffDataSet = () => {
        return _.orderBy(state.topSalesStaffDataSet, 'revenue', stSort.value)
    };

    const getStaffName = (staff) => {
        return staff.staffName === '[shop0wner]'
            ? i18n.t('page.order.detail.information.shopOwner')
            : staff.staffName
    };

    const renderTopSalesStaffTable = () => {
        return (
            <table>
                <tbody>
                {
                    stData.map((staff, index) => (
                        <tr key={staff.id + '-' + index}>
                            <td>
                                <div className='d-flex align-items-center mt-2 mb-2'>
                                    <GSLetterImg fullName={getStaffName(staff)} width={40} height={40} alt='staff'
                                                 className='avatar'/>
                                    <div className='d-flex flex-column ml-3'>
                                        <GSComponentTooltip style={{display: 'flex'}}
                                                            disabled={getStaffName(staff).length < 31}
                                                            message={getStaffName(staff)}>
                                            <span className='row-staff-name'>{getStaffName(staff)}</span>
                                        </GSComponentTooltip>
                                        <span className='row-staff-order'>
                                    <GSTrans t='page.analytics.order.all.topSalesStaff.staffOrder' values={{
                                        orderNumber: NumberUtils.formatThousand(staff.sales)
                                    }}/>
                                </span>
                                    </div>
                                </div>
                            </td>
                            <td className='text-right font-weight-500'>
                                {CurrencyUtils.formatMoneyByCurrency(staff.revenue, STORE_CURRENCY_SYMBOL)}
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        )
    }

    return (
        <GSWidget>
            <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE} rightEl={
                <GSDropDownButton key={stSortToggle} className='top-sales-staff__dropdown' button={
                    ({onClick}) => (
                        <div className='font-weight-500' onClick={onClick}>
                            <span>{stSort.label}</span>
                            &nbsp;
                            <i className="fa fa-angle-down ml-auto mt-auto mb-auto" aria-hidden="true"></i>
                        </div>
                    )
                }>
                    <GSDropdownItem onClick={() => setStSort(SORT_BY.HIGHEST_TO_LOWEST)}>
                        <span>{SORT_BY.HIGHEST_TO_LOWEST.label}</span>
                    </GSDropdownItem>
                    <GSDropdownItem onClick={() => setStSort(SORT_BY.LOWEST_TO_HIGHEST)}>
                        <span>{SORT_BY.LOWEST_TO_HIGHEST.label}</span>
                    </GSDropdownItem>
                </GSDropDownButton>
            }>
                <div className="text-uppercase">
                    <GSTrans t="page.analytics.order.all.topSalesStaff.title"/>
                </div>
            </GSWidgetHeader>
            <GSWidgetContent>
                <div className="top-sales-staff__table">
                    <AnalyticsOrdersEmptyData isEmptyData={stData.length <= 0}>
                        {renderTopSalesStaffTable()}
                    </AnalyticsOrdersEmptyData>
                </div>
            </GSWidgetContent>
        </GSWidget>
    )
};

AnalyticsOrdersTopSalesStaff.propTypes = {};

export default AnalyticsOrdersTopSalesStaff;
