/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import './InventoryHistory.sass'
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import {UikSelect} from "../../../../@uik";
import {InventoryEnum} from "../InventoryEnum";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {ItemService} from "../../../../services/ItemService";
import {DateTimeUtils} from "../../../../utils/date-time";
import {NumberUtils} from "../../../../utils/number-format";
import {Link} from "react-router-dom";
import GSPagination from "../../../../components/shared/GSPagination/GSPagination";
import GSWidgetLoadingContent from "../../../../components/shared/GSWidgetLoadingContent/GSWidgetLoadingContent";
import {cn} from "../../../../utils/class-name";
import GSContentHeaderTitleWithExtraTag
    from "../../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSDateRangePicker from "../../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import storeService from "../../../../services/StoreService";
import {ImageUtils} from "../../../../utils/image";
import {ItemUtils} from "../../../../utils/item-utils";
import ConversionHoverButton from '../../../../components/shared/ConversionHoverButton/ConversionHoverButton'

const SIZE_PER_PAGE = 100
const OPERATOR = {
    SYSTEM: "system",
    SHOPEE: "SHOPEE"
}
const InventoryHistory = props => {
    const refSearchInput = useRef(null);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [stSearchParams, setStSearchParams] = useState({
        search: undefined,
        operator: undefined,
        action: undefined,
        fromTime: undefined,
        toTime: undefined,
        searchBy: undefined,
        branchIds: undefined
    })
    const [stItemList, setStItemList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stOperatorList, setStOperatorList] = useState([]);
    const [stBranchList, setStBranchList] = useState([{
        label: i18next.t`component.product.edit.toolbar.branch.all`,
        value: 'all'
    }]);
    const [stConversions, setStConversions] = useState([])
    useEffect(() => {
       ItemService.getInventoryHistoryOperatorList()
           .then(operatorList => {
               setStOperatorList(operatorList)
           })
        storeService.getFullStoreBranches(0, 9999)
            .then(pageRes => {
                setStBranchList(prevState => [...prevState, ...pageRes.data.map(b => ({label: b.name, value: b.id}))])
            })
    }, []);

    useEffect(() => {
        fetchData(0)
    }, [stBranchList])


    const updateSearchParams = (param, value) => {
        setStSearchParams(state => ({
            ...state,
            [param]: value
        }))
    }

    useEffect(() => {
        fetchData()
    }, [stPaging.page]);

    useEffect(() => {
        fetchData(0)
    }, [stSearchParams])


    const fetchData = (page) => {
        setStIsFetching(true)
        const searchParams = {...stSearchParams}

        if (!searchParams.branchIds || searchParams.branchIds === "all") {
            searchParams.branchIds = stBranchList.map(b => b.value).join(',').replace(/all(,|)/g, '');
        }
        if (searchParams.branchIds) {
            ItemService.getInventoryHistory(searchParams, page || stPaging.page, SIZE_PER_PAGE)
                .then(res => {
                    setStPaging({
                        page: page === undefined ? stPaging.page : page,
                        totalItem: res.totalItem
                    })
                    setStItemList(res.data)
                    setStIsFetching(false)
                })
        }
    }

    const onChangeFilter = (value, name) => {
        updateSearchParams(name, value === 'all'? undefined:value)
    }

    const filterByDate = (event, picker) => {
        const fromTime = picker.startDate.format('YYYY-MM-DD') + 'T00:00:00.000Z';
        const toTime = picker.endDate.format('YYYY-MM-DD') + 'T23:59:59.000Z';
        setStSearchParams(state => ({
            ...state,
            fromTime, toTime
        }))
    }


    const clearDate = (event, picker) => {
        setStSearchParams(state => ({
            ...state,
            fromTime: undefined,
            toTime: undefined
        }))
    }

    const renderTimePickerText = () => {
        if (stSearchParams.fromTime != null) {
            return moment.utc(stSearchParams.fromTime).format('DD-MM-YYYY') + ' - ' + moment.utc(stSearchParams.toTime).format('DD-MM-YYYY') ;
        } else {
            return i18next.t("component.order.all.time");
        }
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
    }

    const resolveAction = (action, actionType) => {
        let lang = ''
        switch (action) {
            case InventoryEnum.ACTIONS.CHANGE_STOCK:
                lang = "page.inventory.history.changeStock"
                break;
            case InventoryEnum.ACTIONS.SET_STOCK:
                lang = "page.inventory.history.setStock"
                break;
            case InventoryEnum.ACTIONS.RETURN:
                lang = "page.inventory.history.return"
                break;
            case InventoryEnum.ACTIONS.GOODS_IN_TRANSACTION:
            case InventoryEnum.ACTIONS.GOODS_IN_TRANSACTION_MG:
                lang = "page.inventory.history.inTransaction"
                break;
            case InventoryEnum.ACTIONS.GOODS_DELIVERED:
            case InventoryEnum.ACTIONS.GOODS_DELIVERED_MG:
                lang = "page.inventory.history.delivered"
                break;
            case InventoryEnum.ACTIONS.TRANSFER_IN:
                lang = "page.inventory.history.transfer_in"
                if('FROM_TRANSFER_AFFILIATE_IN' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_in"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_OUT:
                lang = "page.inventory.history.transfer_out"
                if('FROM_TRANSFER_AFFILIATE_OUT' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_out"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_IN_GOING:
                lang = "page.inventory.history.transfer_in_going"
                if('FROM_TRANSFER_AFFILIATE_IN' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_in_going"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_OUT_GOING:
                lang = "page.inventory.history.transfer_out_going"
                if('FROM_TRANSFER_AFFILIATE_OUT' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_out_going"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_IN_RECEIVED:
                lang = "page.inventory.history.transfer_in_received"
                if('FROM_TRANSFER_AFFILIATE_IN' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_in_received"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_OUT_DELIVERED:
                lang = "page.inventory.history.transfer_out_delivered"
                if('FROM_TRANSFER_AFFILIATE_OUT' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_out_delivered"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_IN_CANCELED:
                lang = "page.inventory.history.transfer_in_canceled"
                if('FROM_TRANSFER_AFFILIATE_RESTOCK' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_in_canceled"
                }
                break;
            case InventoryEnum.ACTIONS.TRANSFER_OUT_CANCELED:
                lang = "page.inventory.history.transfer_out_canceled"
                if('FROM_TRANSFER_AFFILIATE_RESTOCK' === actionType){
                    lang = "page.inventory.history.transfer_affiliate_out_canceled"
                }
                break;
            case InventoryEnum.ACTIONS.PURCHASE_ORDER:
                lang = "page.inventory.history.PURCHASE_ORDER"
                break;
            case InventoryEnum.ACTIONS.PURCHASE_ORDER_CANCELED:
                lang = "page.inventory.history.PURCHASE_ORDER_CANCELED"
                break;
            case InventoryEnum.ACTIONS.PURCHASE_ORDER_RECEIVED:
                lang = "page.inventory.history.PURCHASE_ORDER_RECEIVED"
                break;
            case InventoryEnum.ACTIONS.RETURN_ORDER_RECEIVED:
                lang = "page.inventory.history.return_order_received"
                break;
            case InventoryEnum.ACTIONS.EDIT_ORDER:
                lang = "page.inventory.history.edit_order"
                break;
        }
        return i18next.t(lang)
    }

    const handleConversionHover = (itemModelId, quantity) => {
        setStConversions([])
        ItemService.getConversionUnitItemByItemModelId(itemModelId, quantity)
            .then(conversions => setStConversions(conversions?.conversionItemList))
    }

    const renderOrderId = (item) => {
        if (!item.orderId) {
            return '-'
        }

        /*GOSELL ORDER*/
        if (item.operator.toUpperCase() !== OPERATOR.SHOPEE
            && !item.inventoryType.toUpperCase().startsWith('TRANSFER')
            && !item.inventoryType.toUpperCase().startsWith('PURCHASE_ORDER')
            && !item.inventoryType.toUpperCase().startsWith('RETURN_ORDER_RECEIVED')
        ) {
            return <Link to={ NAV_PATH.orderDetail + '/gosell/' + item.orderId }>
                #{ item.orderId }
            </Link>
        }

        /*SHOPEE ORDER*/
        if (item.operator.toUpperCase() === OPERATOR.SHOPEE) {
            return <Link to={ NAV_PATH.orderDetail + '/shopee/' + item.orderId }>
                #{ item.orderId }
            </Link>
        }

        /*TRANSFER ORDER*/
        /*TRANSFER BRANCH ORDER*/
        if (item.inventoryType.toUpperCase().startsWith('TRANSFER')
            && ('FROM_TRANSFER_IN' === item.actionType
                || 'FROM_TRANSFER_OUT' === item.actionType
                || 'FROM_TRANSFER_RESTOCK' === item.actionType
                && InventoryEnum.ACTIONS.TRANSFER_OUT_CANCELED === item.inventoryType)) {
            return <Link to={ NAV_PATH.transferStockWizard + '/' + item.orderId.replace('CH', '') }>
                #{ item.orderId }
            </Link>
        }

        /*TRANSFER PARTNER ORDER*/
        if (item.inventoryType.toUpperCase().startsWith('TRANSFER')
            && ('FROM_TRANSFER_AFFILIATE_OUT' === item.actionType
                || 'FROM_TRANSFER_AFFILIATE_RESTOCK' === item.actionType
                && InventoryEnum.ACTIONS.TRANSFER_OUT_CANCELED === item.inventoryType)) {
            return <Link to={ NAV_PATH.partnerTransferStockWizard + '/' + item.orderId.replace('CH', '') }>
                #{ item.orderId }
            </Link>
        }

        /* GOODS IMPORT*/
        if (item.inventoryType.toUpperCase().startsWith('PURCHASE_ORDER')) {
            return <Link to={ NAV_PATH.purchaseOrderWizard + '/' + item.orderId.replace('PO', '') }>
                #{ item.orderId }
            </Link>
        }

        /* RETURN ORDER */
        if (item.inventoryType.toUpperCase().startsWith('RETURN_ORDER_RECEIVED')) {
            let returnOrderId = item.orderId.split("-");
            return <Link to={ NAV_PATH.returnOrderWizard + '/' + returnOrderId[1] }>
                #{ returnOrderId[0] }
            </Link>
        }

        return '-'
    }

    return (
        <GSContentContainer className="inventory_history" minWidthFitContent>
            <GSContentHeader
                             backLinkText={i18next.t("page.inventory.history.backToList")}
                             backLinkTo={NAV_PATH.inventory}
                             title={
                                 <GSContentHeaderTitleWithExtraTag title={i18next.t("page.inventory.btn.inventoryHistory")}
                                                                   extra={stPaging.totalItem}
                                 />
                             }
            >
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX} className="d-flex flex-column" style={{height: stItemList.length === 0 || stIsFetching? '100%':'unset'}}>

                <GSWidget className="h-100 flex-grow-1 ">
                    <GSWidgetContent className=" d-flex flex-column h-100" >
                        <section className={cn("box-filter-inventory", {
                                'user-disabled': stIsFetching
                        })}>
                            <div className="d-flex align-items-center box-filter-left">
                                <GSSearchInput
                                    liveSearchOnMS={500}
                                    ref={refSearchInput}
                                    placeholder={i18next.t(
                                        "page.inventory.history.searchProductByNameOrBarCode"
                                    )}
                                    style={{
                                        width: "300px",
                                        height: '38px'
                                    }}
                                    onSearch={(value) => updateSearchParams('search', value)}
                                />
                            </div>

                            <div className='box-filter-right'>
                                <GSDateRangePicker
                                                 className='filter-date'
                                                 minimumNights={0}
                                                 onApply={filterByDate}
                                                 onCancel={clearDate}
                                                 containerClass="position-relative"
                                                   containerStyles={{
                                                       display: 'inline-block',
                                                       width: '160px'
                                                   }}

                                >
                                    <input type="text"
                                           value={renderTimePickerText()}
                                           className="form-control"
                                    />
                                    <FontAwesomeIcon  icon={['far', 'calendar-alt']} color="#939393" style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '.8rem'
                                    }}/>
                                </GSDateRangePicker>
                                {/*BRANCH*/}
                                <UikSelect
                                    style={{
                                        width: '150px'
                                    }}
                                    position="top-right"
                                    className="filter-branch"
                                    defaultValue={'all'}
                                    options={ stBranchList }
                                    onChange={ (item) => onChangeFilter(item.value, 'branchIds')}
                                />
                                {/*OPERATOR*/}
                                <UikSelect
                                    style={{
                                        width: '150px'
                                    }}
                                    position="top-right"
                                    className="filter-operator"
                                    defaultValue={stSearchParams.operator || 'all'}
                                    key={'staff-' + (stSearchParams.operator || 'all')}
                                    onChange={({value}) => onChangeFilter(value, 'operator')}
                                    options={[
                                        {
                                            value: "all",
                                            label: i18next.t("page.inventory.history.filter.allStaff"),
                                        },
                                        ...stOperatorList.map(operator => ({
                                            value: operator,
                                            label: operator === 'system'? i18next.t("page.inventory.history.filter.system"):operator
                                        }))
                                    ]}
                                />

                                <UikSelect
                                    style={{
                                        width: '150px',
                                    }}
                                    className="filter-action"
                                    position="top-right"
                                    defaultValue={stSearchParams.action || 'all'}
                                    key={'action-' + (stSearchParams.action || 'all')}
                                    onChange={({value}) => onChangeFilter(value, 'action')}
                                    options={[
                                        {
                                            value: "all",
                                            label: i18next.t("page.inventory.history.filter.allAction"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.CHANGE_STOCK,
                                            label: i18next.t("page.inventory.history.changeStock"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.SET_STOCK,
                                            label: i18next.t("page.inventory.history.setStock"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.RETURN,
                                            label: i18next.t("page.inventory.history.return"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.GOODS_IN_TRANSACTION,
                                            label: i18next.t("page.inventory.history.inTransaction"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.GOODS_DELIVERED,
                                            label: i18next.t("page.inventory.history.delivered"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.EDIT_ORDER,
                                            label: i18next.t("page.inventory.history.editOrder"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.RETURN_ORDER_RECEIVED,
                                            label: i18next.t("page.inventory.history.returnOrder"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.PURCHASE_ORDER,
                                            label: i18next.t("page.inventory.history.purchaseOrder"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.PURCHASE_ORDER_RECEIVED,
                                            label: i18next.t("page.inventory.history.purchaseOrderReceived"),
                                        },
                                        {
                                            value: InventoryEnum.ACTIONS.PURCHASE_ORDER_CANCELED,
                                            label: i18next.t("page.inventory.history.purchaseOrderCanceled"),
                                        }
                                    ]}
                                />
                            </div>

                        </section>
                        {stItemList.length > 0 && !stIsFetching &&
                        <section className="inventory-history-list">
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t={"page.inventory.history.thumbnail"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.name"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.stockChange"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.remainingStock"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.action"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.transactionNumber"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.staff"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.inventory.history.time"}/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {stItemList.map(item => {
                                    return (
                                        <tr key={item.invenId}>
                                            <td>
                                                {
                                                    item.urlPrefix &&
                                                    <img alt="item" src={
                                                        ImageUtils.getImageFromImageModel(item)} style={{
                                                        width: '3rem',
                                                        height: '3rem'
                                                    }}/>
                                                }
                                                
                                                {
                                                    !item.urlPrefix &&
                                                    <img src={"/assets/images/default_image.png"}
                                                         style={{
                                                             width: '3rem',
                                                             height: '3rem'
                                                         }}/>
                                                }
                                            </td>
                                            <td>
                                                <div className="overflow-hidden text-overflow-ellipsis white-space-nowrap"
                                                    style={{
                                                        maxWidth: '20rem'
                                                    }}>
                                                    <strong>
                                                        {ItemUtils.escape100Percent(item.productName)}
                                                    </strong>
                                                </div>
                                                <div className="color-gray overflow-hidden text-overflow-ellipsis white-space-nowrap"
                                                    style={{
                                                        maxWidth: '20rem'
                                                    }}>
                                                    <span>
                                                        {ItemUtils.escape100Percent(item.variationName)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-left">
                                                {item.stockChange !== undefined? NumberUtils.formatThousand(item.stockChange):'-' }
                                            </td>
                                            <td className="text-left">
                                                {item.remainingStock !== undefined? NumberUtils.formatThousand(item.remainingStock) : '-'}
                                                <ConversionHoverButton
                                                    hidden={ !item.hasConversion }
                                                    conversions={ stConversions }
                                                    onHover={ () => handleConversionHover(item.id, item.remainingStock) }
                                                >
                                                    <tbody>
                                                        {
                                                            stConversions.map(({ unitName, quantity }, index) => (
                                                                <tr key={ index }>
                                                                    <td>{ unitName }</td>
                                                                    <td>{ NumberUtils.formatThousandFixed(quantity, 2) }</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </ConversionHoverButton>
                                            </td>
                                            <td>
                                                {resolveAction(item.inventoryType, item.actionType)}
                                            </td>
                                            <td className="text-left">
                                                {renderOrderId(item)}
                                            </td>
                                            <td>
                                                {item.operator.toLowerCase() === 'system' ? i18next.t("page.inventory.history.filter.system") : item.operator}
                                            </td>
                                            <td className="gsa-white-space--nowrap">
                                                {DateTimeUtils.formatDDMMYYYY_HHMM(item.time)}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </GSTable>
                            <GSPagination totalItem={stPaging.totalItem}
                                          currentPage={stPaging.page + 1}
                                          onChangePage={onChangePage}
                                          pageSize={SIZE_PER_PAGE}
                            />
                        </section>}



                        {stItemList.length === 0 && !stIsFetching &&
                        <GSWidgetEmptyContent className="flex-grow-1"
                                               iconSrc="/assets/images/icon-Empty.svg"
                                               text={i18next.t("common.noResultFound")}
                                               mode="horizontal"
                        />}

                        {stIsFetching &&
                            <GSWidgetLoadingContent/>
                        }

                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
    );
};

InventoryHistory.propTypes = {

};

export default InventoryHistory;
