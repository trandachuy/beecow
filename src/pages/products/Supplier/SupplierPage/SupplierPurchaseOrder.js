import '../SupplierPage/SupplierPurchaseOrder.sass'
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import '../../../../../sass/ui/_gswidget.sass'
import '../../../../../sass/ui/_gsfrm.sass'
import {UikInput} from '../../../../@uik'
import React, {useEffect, useState} from 'react';
import {Trans} from "react-i18next";
import {ItemService} from "../../../../services/ItemService";
import i18next from "i18next";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import moment from "moment";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import {RouteUtils} from "../../../../utils/route";
import {PurchaseOrderConstants} from "../../PurchaseOrder/PurchaseOrderConstants";
import GSStatusTag from "../../../../components/shared/GSStatusTag/GSStatusTag";
import PurchaseOrderStatusTag from "./PurchaseOrderStatusTag";

const SupplierPurchaseOrder = props => {
    const SIZE_PER_PAGE = 5
    const [itemList, setItemList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [isFetching, setFetching] = useState(false);

    const [stSearchParams, setStSearchParams] = useState({
        searchBy: 'id',
        purchaseId: undefined,
        supplierId: props.supplierId
    })

    const [stIsFetching, setStIsFetching] = useState(false);

    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });

    useEffect(() => {
        fetchData()
    }, [stPaging.page]);

    useEffect(() => {
        fetchData(0)
    }, [stSearchParams])

    const fetchData = (page) => {
        setStIsFetching(true)
        const requestParams = buildRequest()
        ItemService.fetchPurchaseOrder(requestParams, page || stPaging.page, SIZE_PER_PAGE)
            .then(res => {
                setItemList(res.data)
                setStPaging({
                    page: page === undefined? stPaging.page:page,
                    totalItem: res.total
                })
                setTotalPage(Math.ceil(res.total/SIZE_PER_PAGE))
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }

    const buildRequest = () => {
        const request = {
            ...stSearchParams
        }
        for (let requestKey in request) {
            if (request[requestKey] === 'ALL') {
                delete request[requestKey]
            }
        }
        return request
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
        setCurrentPage(page)
    }

    const onSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            setStSearchParams({
                ...stSearchParams,
                purchaseId: e.currentTarget.value
            })
            e.preventDefault()
        }
    }

    const headerList = [
            i18next.t("component.purchase.order.list.table.id"),
            i18next.t("component.purchase.order.list.table.status"),
            i18next.t("component.purchase.order.list.table.inventory"),
            i18next.t("component.purchase.order.list.table.amount"),
            i18next.t("component.purchase.order.list.table.branch"),
            i18next.t("component.purchase.order.list.table.dateCreated"),
            i18next.t("component.purchase.order.list.table.lastModified")
    ]

    const renderOrderStatus = (status) => {
        let text;
        let applyClass;

        if(status === PurchaseOrderConstants.STATUS.ORDER){
            text = i18next.t('component.purchase.order.list.status.ORDER')
            applyClass = "order"
            return <PurchaseOrderStatusTag tagStyle={PurchaseOrderStatusTag.STYLE.ORDER} text={text}/>
        } else if(status === PurchaseOrderConstants.STATUS.IN_PROGRESS){
            text = i18next.t('component.purchase.order.list.status.IN_PROGRESS')
            applyClass = "in-progress"
            return <PurchaseOrderStatusTag tagStyle={PurchaseOrderStatusTag.STYLE.IN_PROGRESS} text={text}/>
        } else if(status === PurchaseOrderConstants.STATUS.COMPLETED){
            text = i18next.t('page.reservation.detail.completed')
            applyClass = "completed"
            return <PurchaseOrderStatusTag tagStyle={PurchaseOrderStatusTag.STYLE.COMPLETED} text={text}/>
        } else if(status === PurchaseOrderConstants.STATUS.CANCELLED){
            text = i18next.t('component.purchase.order.list.status.CANCELLED')
            applyClass = "cancelled"
            return <PurchaseOrderStatusTag tagStyle={PurchaseOrderStatusTag.STYLE.CANCELLED} text={text}/>
        }

        return (
            <span className={"status-box " + applyClass}>
                {text}
            </span>
        )
    }

    const renderOrderInventory = (status) => {
        let inventory;

        if(status === PurchaseOrderConstants.STATUS.ORDER){
            inventory = i18next.t('component.purchase.order.list.inventory.WAITING_FOR_IMPORT')

        } else if(status === PurchaseOrderConstants.STATUS.IN_PROGRESS){
            inventory = i18next.t('component.purchase.order.list.inventory.WAITING_FOR_IMPORT')

        } else if(status === PurchaseOrderConstants.STATUS.COMPLETED){
            inventory = i18next.t('component.purchase.order.list.inventory.GOODS_IMPORTED')

        } else if(status === PurchaseOrderConstants.STATUS.CANCELLED){
            inventory = i18next.t('component.purchase.order.list.inventory.IMPORT_CANCELED')
        }

        return (
                <span>{inventory}</span>
        )
    }

    return (
            <GSContentBody size={GSContentBody.size.MAX}
                           className="purchase-order-list__body-desktop d-mobile-none d-desktop-flex">
                {/*PURCHASE LIST*/}

                <GSWidget>
                    <GSWidgetContent className="purchase-order-list-widget">
                        {isFetching &&
                        <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                        }
                        <div
                            className={"n-filter-container d-mobile-none d-desktop-flex " + (isFetching ? 'gs-atm--disable' : '')}>
                            {/*SEARCH*/}
                            <span style={{
                                marginRight: 'auto'
                            }} className="gs-search-box__wrapper">
                                <h5>{i18next.t("component.supplier.purchase.order.title")}</h5>
                                <UikInput
                                    onKeyPress={onSearchKeyPress}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("component.purchase.order.list.search.id")}
                                />
                            </span>
                        </div>
                        {!isFetching &&
                        <>
                            <PagingTable
                                headers={headerList}
                                totalPage={totalPage}
                                maxShowedPage={10}
                                currentPage={currentPage}
                                onChangePage={onChangePage}
                                totalItems={stPaging.totalItem}
                                hidePagingEmpty
                                className="d-mobile-none d-desktop-flex"
                            >
                                {itemList.map((dataRow, index) => {
                                    return (
                                        <>
                                            <section
                                                key={index + "_" + dataRow.id}
                                                className="gs-table-body-items gsa-hover--gray"
                                                // onClick={() => this.onCollapseOrExpand(dataRow.id)}
                                            >
                                                <div className="shortest-row">
                                                    <div className="gs-table-body-item id">
                                                        <GSFakeLink onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + dataRow.id)}>
                                                            <strong>{dataRow.purchaseId}</strong>
                                                        </GSFakeLink>
                                                    </div>
                                                    <div className="gs-table-body-item status">
                                                        {renderOrderStatus(dataRow.status)}
                                                    </div>
                                                    <div className="gs-table-body-item inventory">
                                                        {renderOrderInventory(dataRow.status)}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {dataRow.amount && dataRow.amount.toLocaleString("vi")}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {dataRow.branchName}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {moment(dataRow.createdTime).format('DD-MM-YYYY')}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {moment(dataRow.lastModifiedDate).format('DD-MM-YYYY')}
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    )
                                })
                                }
                            </PagingTable>

                            {itemList.length === 0 &&
                            <div
                                className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                <div style={{textAlign:"center"}}>
                                    <img src="/assets/images/icon-purchase-order-empty.png"/>
                                    {' '}
                                    <span style={{display:"block", paddingTop:"12px"}}>
                                        <Trans i18nKey="component.purchase.order.list.table.empty"/>
                                    </span>
                                </div>
                            </div>}
                        </>
                        }
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
    )
}

SupplierPurchaseOrder.defaultProps = {

}

SupplierPurchaseOrder.propTypes = {

}

export default SupplierPurchaseOrder