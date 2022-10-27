/*******************************************************************************
 * Copyright 2022 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2022
 * Author: An Hoang <an.hoang.nguyen@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import './ReturnOrderList.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {UikFormInputGroup, UikInput, UikRadio, UikSelect} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import {OrderService} from "../../../services/OrderService";
import moment from 'moment';
import * as queryString from 'query-string';
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import {Trans} from "react-i18next";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import CreateModal from "./CreateModal/CreateModal";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";

const SIZE_PER_PAGE = 100

const ReturnOrderList = props => {
    const param = queryString.parse(props.location.search)

    const [stIsFetching, setStIsFetching] = useState(true);
    const [stReturnOrderList, setStReturnOrderList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [searchType, setSearchType] = useState([
        {value : 'ORDER_ID', label : i18next.t('page.orders.returnOrder.list.search_type.ORDER_ID')},
        {value : 'RETURN_ORDER_ID', label : i18next.t('page.orders.returnOrder.list.search_type.RETURN_ORDER_ID')},
        {value : 'CUSTOMER_NAME', label : i18next.t('page.orders.returnOrder.list.search_type.CUSTOMER_NAME')},
    ]);
    const [stFilterConfig, setStFilterConfig] = useState({
        status: (param && param.status) ? param.status : 'ALL',
        keyword: '',
        searchType: 'ORDER_ID'
    });
    const refTimeout = useRef(null);
    const [stCreateModal, setStCreateModal] = useState(false);



    useEffect(() => {
        fetchData()
    }, [stFilterConfig, stPaging.currentPage]);

    /////////////////////////////////////////////////////////COMMON//////////////////////////////////////////////////////////
    const fetchData = () => {
        setStIsFetching(true)
            OrderService.getListReturnOrder({
                page: stPaging.currentPage - 1,
                size: SIZE_PER_PAGE,
                searchKeyword: stFilterConfig.keyword,
                searchType: stFilterConfig.searchType === 'ALL' ? null : stFilterConfig.searchType,
            })
            .then(result => {
                const totalItem = parseInt(result.headers['x-total-count'])

                setStReturnOrderList(result.data)

                setStPaging({
                    ...stPaging,
                    totalPage: Math.ceil(totalItem / SIZE_PER_PAGE),
                    totalItem: totalItem
                })
                setStIsFetching(false)

            })
            .catch(e => {
                setStIsFetching(false)
            })
    }

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            currentPage: pageNumber
        })
    }

    const changeSearchTypeValue = (value) => {
        setStFilterConfig({
            ...stFilterConfig,
            searchType : value
        })
    }

    /////////////////////////////////////////////////////////DESKTOP//////////////////////////////////////////////////////////
    const onKeyPressSearch = (e) => {
        clearTimeout(refTimeout.current)
        const data = e.currentTarget.value;
        refTimeout.current = setTimeout( () => {
            setStFilterConfig({
                ...stFilterConfig,
                keyword: data
            })
            setStPaging({
                ...stPaging,
                currentPage: 1
            })
        }, 500)
    }

    const renderOrderStatus = (status) => {
        let text;

        if(status === 'IN_PROGRESS'){
            text = i18next.t('page.orders.returnOrder.list.status.IN_PROGRESS')
        } else if(status === 'COMPLETED'){
            text = i18next.t('page.orders.returnOrder.list.status.COMPLETED')
        } else if(status === 'CANCELLED'){
            text = i18next.t('page.orders.returnOrder.list.status.CANCELLED')
        }

        return (
            <span>
                {text}
            </span>
        )
    }

    const renderRestock = (restock) => {
        let text;

        if(restock == true){
            text = i18next.t('common.btn.yes')
        } else if(restock == false){
            text = i18next.t('common.btn.no')
        } else if(restock == null){
            text = '-'
        }

        return (
            <span>
                {text}
            </span>
        )
    }

    const renderRefundStatus = (re_status) => {
        let text;

        if(re_status === 'REFUNDED'){
            text = i18next.t('page.orders.returnOrder.list.status.REFUNDED')
        } else if(re_status === 'PARTIAL_REFUNDED'){
            text = i18next.t('page.orders.returnOrder.list.status.PARTIAL_REFUNDED')
        } else if(re_status === 'NOT_REFUND'){
            text = i18next.t('page.orders.returnOrder.list.status.NOT_REFUND')
        } else if(re_status == null){
            text = '-'
        }

        return (
            <span>
                {text}
            </span>
        )
    }

    const CallbackCreateModal = (isModal) =>{
        setStCreateModal(isModal)
    }
    const handleToPageCreateReturnOrder = (bcOrderId) =>{
        RouteUtils.redirectWithoutReload(props, NAV_PATH.returnOderCreate + `/order/${bcOrderId}`)
    }

    const renderToReturnOrderDetail = (id, wizard) => {
        const returnOrderWizard = NAV_PATH.returnOrderWizard + `/${ id }`;
        const orderDetailWizard = `/order/detail/gosell/${id}`;
        if (wizard == true){
            RouteUtils.openNewTab(orderDetailWizard)
        } else {
            RouteUtils.linkTo(props, returnOrderWizard)
        }
    }

    return (
        <>
            {/* MAIN CONTAINER */}
            <GSContentContainer className="return-order-list">
                <CreateModal
                    callback={CallbackCreateModal}
                    isModal={stCreateModal}
                    toPageCreateReturnOrder={handleToPageCreateReturnOrder}

                />
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t('page.orders.returnOrder.list.title')}
                        extra= {stPaging.totalItem}/>
                }>
                    <GSContentHeaderRightEl>
                        <GSButton success onClick={() => setStCreateModal(true)}>
                            <Trans i18nKey="page.orders.returnOrder.create.title" className="sr-only">
                                Create Return Order
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className="return-order-list__body">
                    <GSWidget>
                        <GSWidgetContent>
                            {/*DESKTOP*/}
                            <section className={"return-order-list__filter-container d-mobile-none d-desktop-flex " + (stIsFetching? 'gs-atm--disable':'')}>
                                {/*SEARCH*/}
                                <span>
                                <UikInput
                                    maxLength={50}
                                    onChange={onKeyPressSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={
                                        i18next.t(`page.orders.returnOrder.list.search_type.${stFilterConfig.searchType}_hint`)
                                    }
                                />
                            </span>

                                <span className="gs-search-box__wrapper">
                            <UikSelect
                                defaultValue={stFilterConfig.searchType}
                                options={ searchType }
                                onChange={ (item) => changeSearchTypeValue(item.value)}
                            />
                            </span>

                            </section>
                            <section className="customer-list__list-container d-mobile-none d-desktop-table">
                                {!stIsFetching &&
                                <PagingTable
                                    headers={[
                                        i18next.t('page.orders.returnOrder.list.return_id'),
                                        i18next.t('page.orders.returnOrder.list.order_id'),
                                        i18next.t('page.orders.returnOrder.list.status'),
                                        i18next.t('page.orders.returnOrder.list.customer'),
                                        i18next.t('page.orders.returnOrder.list.restock'),
                                        i18next.t('page.orders.returnOrder.list.refund_status'),
                                        i18next.t('page.orders.returnOrder.list.branch'),
                                        i18next.t('page.orders.returnOrder.list.create_date'),
                                        i18next.t('page.orders.returnOrder.list.staff'),
                                    ]}
                                    currentPage={stPaging.currentPage}
                                    totalPage={stPaging.totalPage}
                                    maxShowedPage={10}
                                    totalItems={stPaging.totalItem}
                                    onChangePage={onChangePage}
                                    hidePagingEmpty
                                    className="d-mobile-none d-desktop-block"
                                >
                                    {stReturnOrderList.map(item => {
                                        return (
                                            <section key={item.id} className="gs-table-body-items cursor--pointer gsa-hover--gray" >
                                                <div className="gs-table-body-item return_id" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <span>{item.returnOrderId}</span>
                                                </div>
                                                <div className="gs-table-body-item bcOrderId">
                                                    <div className="full-name" onClick={() => renderToReturnOrderDetail(item.bcOrderId, true)}>{item.bcOrderId}</div>
                                                </div>
                                                <div className="gs-table-body-item status" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <div className="full-name">{renderOrderStatus(item.status)}</div>
                                                </div>
                                                <div className="gs-table-body-item customer-name" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <div className="full-name">{item.customerName}</div>
                                                </div>

                                                <div className="gs-table-body-item restock" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <div className="full-name">{renderRestock(item.restock)}</div>
                                                </div>
                                                <div className="gs-table-body-item refund_status" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <div className="full-name">{renderRefundStatus(item.refundStatus)}</div>
                                                </div>
                                                <div className="gs-table-body-item branch" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <div className="full-name">{item.returnBranchName == null ? '-' : item.returnBranchName}</div>
                                                </div>
                                                <div className="gs-table-body-item create-date" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    {moment(item.createdDate).utc().format("DD-MM-YYYY")}
                                                </div>
                                                <div className="gs-table-body-item staff" onClick={() => renderToReturnOrderDetail(item.id, false)}>
                                                    <div className="full-name">{item.createdBy == '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : item.createdBy}</div>
                                                </div>
                                            </section>
                                        )
                                    })}
                                </PagingTable>}
                            </section>


                            {/*MOBILE*/}
                            <section className={"return-order-list__filter-container--mobile d-mobile-flex d-desktop-none " + (stIsFetching? 'gs-atm--disable':'')}>
                                {/*SEARCH*/}
                                <div className="row">
                                    <div className="col-8 col-sm-8 pr-0">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                        <UikInput
                                            maxLength={50}
                                            onKeyPress={onKeyPressSearch}
                                            icon={(
                                                <FontAwesomeIcon icon="search"/>
                                            )}
                                            placeholder={i18next.t(`page.orders.returnOrder.list.search_type.${stFilterConfig.searchType}_hint`)}
                                        />
                                    </span>
                                    </div>
                                    <div className="col-4 col-sm-4">
                                        <span style={{marginRight: 'auto'}} className="gs-search-box__wrapper">
                                        <UikSelect
                                            defaultValue={stFilterConfig.searchType}
                                            options={ searchType }
                                            onChange={ (item) => changeSearchTypeValue(item.value)}
                                        />
                                    </span>
                                    </div>
                                </div>
                            </section>
                            {stReturnOrderList.length > 0 && !stIsFetching &&
                            <section className="gs-mobile-list-container d-mobile-flex d-desktop-none">
                                <PagingTable
                                    headers={[
                                        i18next.t('page.orders.returnOrder.list.return_id'),
                                        i18next.t('page.orders.returnOrder.list.order_id'),
                                        i18next.t('page.orders.returnOrder.list.status'),
                                        i18next.t('page.orders.returnOrder.list.customer'),
                                        i18next.t('page.orders.returnOrder.list.restock'),
                                        i18next.t('page.orders.returnOrder.list.refund_status'),
                                        i18next.t('page.orders.returnOrder.list.branch'),
                                        i18next.t('page.orders.returnOrder.list.create_date'),
                                        i18next.t('page.orders.returnOrder.list.staff'),
                                    ]}
                                    currentPage={stPaging.currentPage}
                                    totalPage={stPaging.totalPage}
                                    maxShowedPage={10}
                                    totalItems={stPaging.totalItem}
                                    onChangePage={onChangePage}
                                    hidePagingEmpty
                                    className="d-mobile-block d-desktop-none"
                                >
                                    {stReturnOrderList.map(item => {
                                        return (
                                            <section key={item.id}  className="gs-table-body-items cursor--pointer gsa-hover--gray"
                                                     onClick={() => renderToReturnOrderDetail(item.id)} >
                                                <div className="gs-table-body-item return_id">
                                                    <span>{item.returnOrderId}</span>
                                                </div>
                                                <div className="gs-table-body-item bcOrderId">
                                                    <div className="full-name">{item.bcOrderId}</div>
                                                </div>
                                                <div className="gs-table-body-item status">
                                                    <div className="full-name">{renderOrderStatus(item.status)}</div>
                                                </div>
                                                <div className="gs-table-body-item customer-name">
                                                    <div className="full-name">{item.customerName}</div>
                                                </div>

                                                <div className="gs-table-body-item restock">
                                                    <div className="full-name">{renderRestock(item.restock)}</div>
                                                </div>
                                                <div className="gs-table-body-item refund_status">
                                                    <div className="full-name">{renderRefundStatus(item.refundStatus)}</div>
                                                </div>
                                                <div className="gs-table-body-item branch">
                                                    <div className="full-name">{item.returnBranchName}</div>
                                                </div>
                                                <div className="gs-table-body-item create-date">
                                                    {moment(item.createdDate).utc().format("DD-MM-YYYY")}
                                                </div>
                                                <div className="gs-table-body-item staff">
                                                    <div className="full-name">{item.createdBy == '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner') : item.createdBy}</div>
                                                </div>
                                            </section>
                                        )
                                    })}
                                </PagingTable>
                            </section>}
                            {stIsFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}
                                     className="loading-list"
                            />
                            }

                            <PagingTable
                                totalPage={stPaging.totalPage}
                                maxShowedPage={1}
                                currentPage={stPaging.currentPage}
                                onChangePage={onChangePage}
                                totalItems={stReturnOrderList.length}
                                className="m-paging d-mobile-flex d-desktop-none"
                            />

                            {stReturnOrderList.length === 0 && !stIsFetching &&
                            <GSWidgetEmptyContent
                                iconSrc="/assets/images/icon-Empty.svg"
                                text={stFilterConfig.keyword? i18next.t("common.noResultFound"):i18next.t("page.orders.returnOrder.list.no_data")}/>
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
        </>
    );
};

ReturnOrderList.propTypes = {

};

export default ReturnOrderList;
