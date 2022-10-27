import './PurchaseOrderManagement.sass'
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Redirect, withRouter} from "react-router-dom";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import {UikInput} from '../../../@uik'
import React, {useEffect, useMemo, useState} from 'react';
import {Trans} from "react-i18next";
import {ItemService} from "../../../services/ItemService";
import i18next from "i18next";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSDateRangePicker from "../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import GSMegaFilter from "../../../components/shared/GSMegaFilter/GSMegaFilter";
import GSMegaFilterRowSelect from "../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelect";
import GSMegaFilterRowTag from "../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowTag";
import GSMegaMobileFilter from "../../../components/shared/GSMegaFilter/GSMegaMobileFilter";
import './PurchaseOrderConstants';
import {PurchaseOrderConstants} from "./PurchaseOrderConstants";
import storeService from "../../../services/StoreService";
import moment from "moment";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import {RouteUtils} from "../../../utils/route";

const PurchaseOrderManagement = props => {
    const SIZE_PER_PAGE = 20
    const currentDate = new Date();
    const last30DaysDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30);
    const [itemList, setItemList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [redirectTo, setRedirectTo] = useState('');
    const [isRedirect, setIsRedirect]  = useState(false);
    const [isFetching, setFetching] = useState(false);
    const [stTransferBranchPair, setStTransferBranchPair] = useState({
        origin: undefined,
        destination: undefined
    });
    const [stBranchIds, setStBranchIds] = useState([]);
    const [stBranchList, setStBranchList] = useState([{
        label: i18next.t`component.product.edit.toolbar.branch.all`,
        value: 'ALL'
    }]);

    const [stStaffList, setStStaffList] = useState([
        {label: i18next.t('page.order.list.filter.allStaff'), value: 'ALL'},
    ]);

    const [stSupplierList, setStSupplierList] = useState([{
        label: i18next.t`component.purchase.order.list.filter.supplier.all`,
        value: 'ALL'
    }]);

    const [stSearchParams, setStSearchParams] = useState({
        keyword: '',
        destinationBranchId: 'ALL',
        createdBy: 'ALL',
        status: 'ALL',
        supplierId: 'ALL',
        createdFrom: last30DaysDate,
        createdTo: currentDate,
    })

    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [stPicker, setStPicker] = useState({
        fromDate: undefined,
        toDate: undefined
    })

    const STATUS_OPTIONS = useMemo(() => [
        {
            label: i18next.t`component.custom.page.filter.status.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`component.purchase.order.list.status.ORDER`,
            value: PurchaseOrderConstants.STATUS.ORDER
        },
        {
            label: i18next.t`component.purchase.order.list.status.IN_PROGRESS`,
            value: PurchaseOrderConstants.STATUS.IN_PROGRESS
        },
        {
            label: i18next.t`component.purchase.order.list.status.COMPLETED`,
            value: PurchaseOrderConstants.STATUS.COMPLETED
        },
        {
            label: i18next.t`component.purchase.order.list.status.CANCELLED`,
            value: PurchaseOrderConstants.STATUS.CANCELLED
        }
    ], [])

    const INVENTORY_OPTIONS = useMemo(() => [
        {
            label: i18next.t`component.custom.page.filter.status.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`component.purchase.order.list.inventory.WAITING_FOR_IMPORT`,
            value: PurchaseOrderConstants.INVENTORY.WAITING_FOR_IMPORT
        },
        {
            label: i18next.t`component.purchase.order.list.inventory.GOODS_IMPORTED`,
            value: PurchaseOrderConstants.INVENTORY.GOODS_IMPORTED
        },
        {
            label: i18next.t`component.purchase.order.list.inventory.IMPORT_CANCELED`,
            value: PurchaseOrderConstants.INVENTORY.IMPORT_CANCELLED
        }
    ], [])

    useEffect(() => {
        fetchBranchList()
        fetchStaffList()
        fetchSupplierList()
    }, []);

    useEffect(() => {
        fetchData()
    }, [stPaging.page]);

    useEffect(() => {
        fetchData(0)
    }, [stSearchParams, stBranchIds])

    const filterByDate = (event, picker) => {
        const fromDate = picker.startDate;
        const toDate = picker.endDate;
        picker.startDate = moment()
        picker.endDate = moment()
        setStSearchParams(state => ({
            ...state,
            createdFrom: fromDate,
            createdTo: toDate
        }))
    }


    const clearDate = (event, picker) => {
        setStSearchParams(state => ({
            ...state,
            createdFrom: undefined,
            createdTo: undefined
        }))
        setStPicker(state => ({
            fromDate: undefined,
            toDate: undefined
        }))
        picker.startDate = moment()
        picker.endDate = moment()
    }

    const getBranchExclude = (excludedBranchId) => {
        if (excludedBranchId && excludedBranchId !== 'ALL') {
            return stBranchList.filter(branchObj => branchObj.value !== excludedBranchId)
        }
        return stBranchList
    }

    const updateTransferBranch = (branchId, target) => {
        setStTransferBranchPair(state => ({
            ...state,
            [target]: branchId
        }))
    }

    const onMegaFilterChange = (values) => {
        setStSearchParams({
            ...stSearchParams,
            ...values
        })
    }

    const fetchBranchList = () => {
        storeService.getFullStoreBranches()
            .then(pageRes => {
                let branchList = pageRes.data.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1
                    : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0))
                    .map(b => ({label: b.name, value: b.id}))
                setStBranchList(prevState => [...prevState, ...branchList])
                setStBranchIds(branchList.map(x => x.value));
            })
    }

    const fetchSupplierList = () => {
        const param = {
            sort: 'name,asc'
        }
        ItemService.fetchDashboardSupplier(param)
            .then(pageRes => {
                setStSupplierList(prevState => [...prevState, ...pageRes.data.map(b => ({label: b.name, value: b.id}))])
            })
    }

    const fetchStaffList =() => {
        storeService.getAllStoreStaffs(0, Number.MAX_SAFE_INTEGER, null, 'id,desc')
            .then(staffList => {
                const staffListSorted = staffList.data.sort((a, b) => a.name.toLocaleUpperCase() < b.name.toLocaleUpperCase() ? -1 : 1) || [];
                let result = [...stStaffList];
                staffListSorted.forEach(staff => {
                    result.push({value: staff.name, label: staff.name});
                });
                result.splice(1, 0, {value: '[shop0wner]', label: i18next.t('page.order.detail.information.shopOwner')})
                setStStaffList(result)
            })
    }

    const fetchData = (page) => {
        setFetching(true)
        const requestParams = buildRequest()
        if (requestParams.destinationBranchId === 'ALL') {
            if (stBranchIds.length <= 0) {
                return;
            } else {
                requestParams.destinationBranchId = stBranchIds;
            }
        }

        ItemService.fetchPurchaseOrder(requestParams, page || stPaging.page, SIZE_PER_PAGE)
            .then(res => {
                setItemList(res.data)
                setStPaging({
                    page: page === undefined ? stPaging.page : page,
                    totalItem: res.total
                })
                setTotalPage(Math.ceil(res.total / SIZE_PER_PAGE))
            })
            .finally(() => {
                setFetching(false)
            })
    }

    const renderOrderStatus = (status) => {
        let statusRendered;

        if(status === PurchaseOrderConstants.STATUS.ORDER){
            statusRendered = i18next.t('component.purchase.order.list.status.ORDER')
        } else if(status === PurchaseOrderConstants.STATUS.IN_PROGRESS){
            statusRendered = i18next.t('component.purchase.order.list.status.IN_PROGRESS')
        } else if(status === PurchaseOrderConstants.STATUS.COMPLETED){
            statusRendered = i18next.t('page.reservation.detail.completed')
        } else if(status === PurchaseOrderConstants.STATUS.CANCELLED){
            statusRendered = i18next.t('component.purchase.order.list.status.CANCELLED')
        }

        return (
            <span>
                {statusRendered}
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

    const buildRequest = () => {
        const request = {
            ...stSearchParams
        }
        for (let requestKey in request) {
            if (requestKey !== 'destinationBranchId' && request[requestKey] === 'ALL') {
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

    const onInputSearch = (e) => {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            setStSearchParams({
                ...stSearchParams,
                keyword: value
            })
            e.preventDefault()
        }, 500)
    }

    const renderOrderCreatedBy = (inStoreCreatedBy) => {
        if (inStoreCreatedBy === '[shop0wner]') {
            return i18next.t('page.order.detail.information.shopOwner')
        } else {
            return inStoreCreatedBy;
        }
    }

    const headerList = [
            i18next.t("component.purchase.order.list.table.id"),
            i18next.t("component.purchase.order.list.table.supplier.name"),
            i18next.t("component.purchase.order.list.table.branch"),
            i18next.t("component.purchase.order.list.table.status"),
            i18next.t("component.purchase.order.list.table.inventory"),
            i18next.t("component.purchase.order.list.table.amount"),
            i18next.t("component.purchase.order.list.table.staffCreated"),
            i18next.t("component.purchase.order.list.table.createdTime")
    ]

    const mobileHeaderList = [
        i18next.t("component.purchase.order.list.table.id"),
        i18next.t("component.purchase.order.list.table.status"),
        i18next.t("component.purchase.order.list.table.inventory"),
        i18next.t("component.purchase.order.list.table.amount")
    ]

    return (
        <GSContentContainer minWidthFitContent className="purchase-order-list-page">
            {isRedirect &&
            <Redirect to={redirectTo}/>
            }
            <GSContentHeader title={
                <GSContentHeaderTitleWithExtraTag
                    title={i18next.t("component.purchase.order.management")}
                    extra={stPaging.totalItem}
                />
            }
            >
                <GSContentHeaderRightEl>
                    <GSButton success linkTo={NAV_PATH.purchaseOrderCreate}>
                        <GSTrans t="component.purchase.order.list.btn.createNew"/>
                    </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX}
                           className="purchase-order-list__body-desktop d-mobile-none d-desktop-flex">
                {/*SUPPLIER LIST*/}
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
                                <UikInput
                                    key={stSearchParams.keyword}
                                    defaultValue={stSearchParams.keyword}
                                    autoFocus={stSearchParams.keyword.length > 0 ? true : false}
                                    onChange={onInputSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("component.purchase.order.list.search")}
                                />
                            </span>
                            <div className="ml-auto d-flex">
                                <GSDateRangePicker minimumNights={0}
                                                   onApply={filterByDate}
                                                   onCancel={clearDate}
                                                   maxDate={moment()}
                                                   containerStyles={{
                                                       width: '220px',
                                                       marginRight: '.5rem'
                                                   }}
                                                   fromDate={stSearchParams.createdFrom ? new Date(stSearchParams.createdFrom) : undefined}
                                                   toDate={stSearchParams.createdTo ? new Date(stSearchParams.createdTo) : undefined}
                                                   resultToString
                                                   opens={"left"}
                                                   readOnly
                                />


                                <GSMegaFilter onSubmit={onMegaFilterChange} size="medium">
                                    <GSMegaFilterRowSelect name="destinationBranchId"
                                                           i18Key="page.transfer.stock.list.destination"
                                                           defaultValue={stSearchParams.destinationBranchId}
                                                           options={getBranchExclude(stTransferBranchPair.origin)}
                                                           ignoreCountValue={'ALL'}
                                                           onChange={(branchId) => updateTransferBranch(branchId, "destination")}
                                    />
                                    <GSMegaFilterRowSelect name="supplierId"
                                                           i18Key="component.purchase.order.list.filter.supplier"
                                                           defaultValue={stSearchParams.supplierId}
                                                           options={stSupplierList}
                                                           ignoreCountValue={'ALL'}
                                    />
                                    <GSMegaFilterRowSelect name="createdBy"
                                                           i18Key="page.transfer.stock.list.createdBy"
                                                           defaultValue={stSearchParams.createdBy}
                                                           options={stStaffList}
                                                           ignoreCountValue={'ALL'}
                                    />
                                    <GSMegaFilterRowTag name="status"
                                                        i18Key="component.custom.page.table.header.status"
                                                        options={STATUS_OPTIONS}
                                                        defaultValue={stSearchParams.status}
                                                        ignoreCountValue={'ALL'}

                                    />
                                </GSMegaFilter>
                            </div>
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
                                                    <div className="gs-table-body-item">
                                                        <GSFakeLink onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + dataRow.id)}>
                                                            <strong>{dataRow.purchaseId}</strong>
                                                        </GSFakeLink>
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {dataRow.supplierName}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {dataRow.branchName}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {renderOrderStatus(dataRow.status)}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {renderOrderInventory(dataRow.status)}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {dataRow.amount? dataRow.amount.toLocaleString("vi"): ""}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {renderOrderCreatedBy(dataRow.staffCreated)}
                                                    </div>
                                                    <div className="gs-table-body-item">
                                                        {moment(dataRow.createdTime).format('DD-MM-YYYY')}
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    )
                                })
                                }
                            </PagingTable>

                            {itemList.length === 0 && !isFetching &&
                                <div
                                    className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                    <div style={{textAlign: "center"}}>
                                        <img src="/assets/images/icon-purchase-order-empty.png"/>
                                        {' '}
                                        <span style={{display: "block", paddingTop: "12px"}}>
                                        <Trans i18nKey="component.purchase.order.list.table.empty"/>
                                    </span>
                                    </div>
                                </div>
                            }
                        </>
                        }
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
            <GSContentBody size={GSContentBody.size.MAX}
                           className="purchase-order-list__body-mobile d-mobile-flex d-desktop-none">
                {/*SUPPLIER LIST*/}
                <GSWidget>
                    <GSWidgetContent className="purchase-order-list-widget">
                        {isFetching &&
                        <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                        }
                        <div
                            className={"n-filter-container--mobile d-mobile-flex d-desktop-none " + (isFetching ? 'gs-atm--disable' : '')}>
                            {/*SEARCH*/}
                            <div className="row">
                                <div className="col-12 col-sm-12">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                    <UikInput
                                        key={stSearchParams.keyword}
                                        defaultValue={stSearchParams.keyword}
                                        autoFocus={stSearchParams.keyword.length > 0 ? true : false}
                                        onChange={onInputSearch}
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        placeholder={i18next.t("component.purchase.order.list.search")}
                                    />
                                        <div style={{marginBottom: '10px'}}></div>
                                </span>
                                    <div className="ml-auto d-flex">
                                        <GSDateRangePicker minimumNights={0}
                                                           onApply={filterByDate}
                                                           onCancel={clearDate}
                                                           containerStyles={{
                                                               width: '80%',
                                                               marginRight: '.5rem',
                                                           }}
                                                           fromDate={stSearchParams.createdFrom ? new Date(stSearchParams.createdFrom) : undefined}
                                                           toDate={stSearchParams.createdTo ? new Date(stSearchParams.createdTo) : undefined}
                                                           resultToString
                                                           opens={"left"}
                                                           readOnly
                                        />
                                        <div style={{paddingRight: '5%'}}/>
                                        <GSMegaMobileFilter onSubmit={onMegaFilterChange} size="small">
                                            <GSMegaFilterRowSelect name="destinationBranchId"
                                                                   i18Key="page.transfer.stock.list.destination"
                                                                   defaultValue={stSearchParams.destinationBranchId}
                                                                   options={getBranchExclude(stTransferBranchPair.origin)}
                                                                   ignoreCountValue={'ALL'}
                                                                   onChange={(branchId) => updateTransferBranch(branchId, "destination")}
                                            />
                                            <GSMegaFilterRowSelect name="supplierId"
                                                                   i18Key="component.purchase.order.list.filter.supplier"
                                                                   defaultValue={stSearchParams.supplierId}
                                                                   options={stSupplierList}
                                                                   ignoreCountValue={'ALL'}
                                            />
                                            <GSMegaFilterRowSelect name="createdBy"
                                                                   i18Key="page.transfer.stock.list.createdBy"
                                                                   defaultValue={stSearchParams.createdBy}
                                                                   options={stStaffList}
                                                                   ignoreCountValue={'ALL'}
                                            />
                                            <GSMegaFilterRowTag name="status"
                                                                i18Key="component.custom.page.table.header.status"
                                                                options={STATUS_OPTIONS}
                                                                defaultValue={stSearchParams.status}
                                                                ignoreCountValue={'ALL'}

                                            />
                                        </GSMegaMobileFilter>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {!isFetching &&
                        <>
                            <PagingTable
                                headers={mobileHeaderList}
                                totalPage={totalPage}
                                maxShowedPage={10}
                                currentPage={currentPage}
                                onChangePage={onChangePage}
                                totalItems={stPaging.totalItem}
                                className="m-paging d-mobile-flex d-desktop-none">
                                <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">
                                    {
                                        itemList.map((dataRow, index) => {
                                            return (
                                                <div key={dataRow.id}
                                                     className="m-review-row gsa-hover--gray"
                                                     // onClick={() => onCollapseOrExpand(dataRow.id)}
                                                    >
                                                    <div className="m-review-row__short">
                                                        <div className="m-review__info">
                                                            <GSFakeLink onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + dataRow.id)}>
                                                                <strong>{dataRow.purchaseId}</strong>
                                                            </GSFakeLink>
                                                        </div>
                                                      <div className="m-review__info">
                                                          {renderOrderStatus(dataRow.status)}
                                                        </div>
                                                        <div className="m-review__info">
                                                            {renderOrderInventory(dataRow.status)}
                                                        </div>
                                                        <div className="m-review__info">
                                                            {dataRow.amount? dataRow.amount.toLocaleString("vi"): ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
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
            <AlertModal ref={(el) => {
                this.alertModal = el
            }}/>
            <ConfirmModal ref={(el) => {
                this.refConfirmModal = el
            }}/>
        </GSContentContainer>
    )
}

PurchaseOrderManagement.defaultProps = {

}

PurchaseOrderManagement.propTypes = {

}

export default withRouter(PurchaseOrderManagement)
