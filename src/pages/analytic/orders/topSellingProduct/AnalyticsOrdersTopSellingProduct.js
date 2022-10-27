import React, {useContext, useEffect, useState} from "react";
import './AnalyticsOrdersTopSellingProduct.sass';
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSDropDownButton, {GSDropdownItem} from "../../../../components/shared/GSButton/DropDown/GSDropdownButton";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import Constants from "../../../../config/Constant";
import i18n from "i18next";
import {AnalyticsOrdersContext, SALE_CHANNEL_OPTIONS} from "../context/AnalyticsOrdersContext";
import AnalyticsOrdersEmptyData from "../common/AnalyticsOrdersEmptyData";
import {NumberUtils} from "../../../../utils/number-format";
import _ from "lodash";
import {ImageUtils} from "../../../../utils/image";
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

const AnalyticsOrdersTopSellingProduct = props => {
    const {state} = useContext(AnalyticsOrdersContext.context);

    const [stSort, setStSort] = useState(SORT_BY.HIGHEST_TO_LOWEST)
    const [stData, setStData] = useState([]);
    const [stSortToggle, setStSortToggle] = useState(false)

    useEffect(() => {
        setStSortToggle(toggle => !toggle)
        setStData(getSortedStaffDataSet());
    }, [state.topSellingProductDataSet, stSort]);

    const getSortedStaffDataSet = () => {
        return _.orderBy(state.topSellingProductDataSet, 'sales', stSort.value)
    };

    const getVariableLabel = (orgName) => {
        if (!orgName) {
            return
        }

        return orgName.split('|').filter(name => name !== Constants.DEPOSIT_CODE.FULL).map(name => _.upperFirst(name)).join(' | ')
    }

    const renderChannelIcon = (channel) => {
        switch (channel) {
            case SALE_CHANNEL_OPTIONS.GOSELL:
                return (
                    <GSImg src='/assets/images/sale_channels/icon-gosell-active.svg' width={30} height={30} alt='gosell'/>
                )

            case SALE_CHANNEL_OPTIONS.LAZADA:
                return (
                    <GSImg src='/assets/images/sale_channels/icon-lazada-active.svg' width={30} height={30} alt='lazada'/>
                )

            case SALE_CHANNEL_OPTIONS.SHOPEE:
                return (
                    <GSImg src='/assets/images/sale_channels/icon-shopee-active.svg' width={30} height={30} alt='shopee'/>
                )

            case SALE_CHANNEL_OPTIONS.GOMUA:
                return (
                    <GSImg src='/assets/images/sale_channels/icon-beecow-active.svg' width={30} height={30} alt='gomua'/>
                )
        }
    }

    const renderTopSellingProductTable = () => {
        return (
            <table>
                <thead>
                <tr>
                    <th colspan="2"><GSTrans t='page.analytics.order.all.topSellingProduct.productName'>Product name</GSTrans></th>
                    <th className='text-center'>
                        <GSTrans t='page.analytics.order.all.topSellingProduct.numberOfSales'>Number of sales</GSTrans>
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    stData.map((product, index) => (
                        <tr key={product.id + '-' + index}>
                            <td>
                                <div className='d-flex align-items-center mt-2'>
                                    <GSImg
                                        className='image'
                                        src={ImageUtils.getImageFromImageModel(product.image)}
                                        alt='Product'
                                        width={40}
                                        height={40}
                                    />
                                    <div className='d-flex flex-column ml-3'>
                                        <GSComponentTooltip style={{display: 'flex'}}
                                                            disabled={product.productName.length < 31}
                                                            message={product.productName}>
                                            <span className='row-product-name' data-id={product.id}>{product.productName}</span>
                                        </GSComponentTooltip>
                                        <span className='row-product-variable'>{
                                            getVariableLabel(product.variationName)
                                        }</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {renderChannelIcon(product.channel)}
                            </td>
                            <td className='text-center font-weight-500'>
                                {NumberUtils.formatThousand(product.sales)}
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
                <GSDropDownButton key={stSortToggle} className='top-selling-product__dropdown' button={
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
                    <GSTrans t="page.analytics.order.all.topSellingProduct.title"/>
                </div>
            </GSWidgetHeader>
            <GSWidgetContent>
                <div className="top-selling-product__table">
                    <AnalyticsOrdersEmptyData isEmptyData={state.topSellingProductDataSet.length <= 0}>
                        {renderTopSellingProductTable()}
                    </AnalyticsOrdersEmptyData>
                </div>
            </GSWidgetContent>
        </GSWidget>
    )
}

AnalyticsOrdersTopSellingProduct.propTypes = {};

export default AnalyticsOrdersTopSellingProduct;
