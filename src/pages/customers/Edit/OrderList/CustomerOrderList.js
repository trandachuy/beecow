/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import {UikInput, UikWidgetTable} from '../../../../@uik'
import PropTypes from 'prop-types'
import PagingTable from '../../../../components/shared/table/PagingTable/PagingTable';
import i18next from 'i18next';
import Constants from '../../../../config/Constant';
import shopeeService from '../../../../services/ShopeeService';
import {DateTimeUtils} from '../../../../utils/date-time';
import GSOrderStatusTag from '../../../../components/shared/GSOrderStatusTag/GSOrderStatusTag';
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format';
import Loading, {LoadingStyle} from '../../../../components/shared/Loading/Loading';
import GSWidgetEmptyContent from '../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {RouteUtils} from '../../../../utils/route';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import './CustomerOrderList.sass'
import {BCOrderService} from '../../../../services/BCOrderService';

const SIZE_PER_PAGE = 50

const CustomerOrderList = props => {
    const { currency, ...others } = props
    const [stOrderList, setStOrderList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [stFilterConfig, setStFilterConfig] = useState({
        keyword: ''
    });

    useEffect(() => {
        if (props.userId && props.userId !== 'undefined') {
            fetchData()
        } else {
            setStIsFetching(false)
        }
        return () => {
        };
    }, [stFilterConfig, stPaging.currentPage]);

    const fetchData = () => {
        setStIsFetching(true)
        switch (props.saleChannel.toUpperCase()) {
            case Constants.SaleChannels.SHOPEE:

                shopeeService.getCustomerOrderList(props.userId,
                    stPaging.currentPage - 1,
                    SIZE_PER_PAGE,
                    stFilterConfig.keyword ? stFilterConfig.keyword : undefined,
                    'updateTime,desc')
                    .then(result => {
                        setStOrderList(result.data)
                        // setStOrderList([])
                        setStPaging({
                            ...stPaging,
                            totalPage: Math.ceil(result.total / SIZE_PER_PAGE),
                            totalItem: result.total
                        })
                        setStIsFetching(false)
                    })

                break
            case Constants.SaleChannels.IMPORTED:
            case Constants.SaleChannels.LAZADA:
            case Constants.SaleChannels.CONTACT_FORM:
            case Constants.SaleChannels.GOSELL:
            case Constants.SaleChannels.BEECOW:
            case Constants.SaleChannels.GOMUA:
            case Constants.SaleChannels.LANDING_PAGE:
                fetchDataCommon()
                break
            default: 
                fetchDataCommon()
        }
    }

    const fetchDataCommon = () => {
        if (props.userId) {
            let channelArr = [Constants.SaleChannels.IMPORTED, Constants.SaleChannels.LAZADA, Constants.SaleChannels.CONTACT_FORM, Constants.SaleChannels.LANDING_PAGE]
            BCOrderService.getCustomerOrderList(props.userId,
                stPaging.currentPage - 1,
                SIZE_PER_PAGE,
                stFilterConfig.keyword ? stFilterConfig.keyword : undefined,
                props.saleChannel === Constants.SaleChannels.GOMUA ? Constants.SaleChannels.BEECOW :
                    (channelArr.includes(props.saleChannel) ? [Constants.SaleChannels.BEECOW, Constants.SaleChannels.GOSELL].join(',') : props.saleChannel),
                'lastModifiedDate,desc'
            )
                .then(result => {
                    setStOrderList(result.data)
                    // setStOrderList([])
                    setStPaging({
                        ...stPaging,
                        totalPage: Math.ceil(result.total / SIZE_PER_PAGE),
                        totalItem: result.total
                    })
                    setStIsFetching(false)
                })
                .catch(err => {
                    console.log(err)
                    setStIsFetching(false)
                })
                .finally(() => setStIsFetching(false))
        } else {
            setStIsFetching(false);
        }
    }

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            currentPage: pageNumber
        })
    }

    const onInputSearch = (e) => {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout(() => {
            setStFilterConfig({
                ...stFilterConfig,
                keyword: value
            })
            setStPaging({
                ...stPaging,
                currentPage: 1
            })
            e.preventDefault()
        }, 1000)
    }

    const onClickOrderRow = (orderChannel, orderId, orderType) => {
        if (props.openOrderNewTab) {
            let url
            if (orderType === 'BOOKING') {
                url = NAV_PATH.reservationDetail + '/' + orderId
            } else {
                if (orderChannel.toLowerCase() === 'beecow') {
                    url = NAV_PATH.orderDetail + '/gomua/' + orderId

                } else {
                    url = NAV_PATH.orderDetail + '/' + orderChannel.toLowerCase() + '/' + orderId
                }
            }
            let win = window.open(url, '_blank');
            win.focus();
        } else {
            if ('BOOKING' === orderType) {
                RouteUtils.linkTo(props, NAV_PATH.reservationDetail + '/' + orderId)
            } else {
                let url
                if (props.saleChannel.toLowerCase() === 'beecow') {
                    url = NAV_PATH.orderDetail + '/gomua/' + orderId

                } else {
                    url = NAV_PATH.orderDetail + '/' + props.saleChannel.toLowerCase() + '/' + orderId
                }
                RouteUtils.linkTo(props, url)
            }
        }
    }
    const exportPaymentStatus = (order) => {
        const isInStore = order.inStore == 'TRUE'

        if ((isInStore && order.payType == 'PAID') || (!isInStore && order.isPaid)) {
            return i18next.t('page.customerList.table.paymentStatus.paid')
        }
        if ((order.payType == 'PARTIAL') || (!isInStore && (!order.isPaid && order.debtAmount != 0))) {
            return i18next.t('page.customerList.table.paymentStatus.partialPayment')
        }
        return i18next.t('page.customerList.table.paymentStatus.unpaid')
    }

    return (
        <div className="customer-order-list">
            {/*DESKTOP HEADER*/ }
            <section className={ 'd-mobile-none d-desktop-flex ' + (stIsFetching ? 'gs-atm--disable' : '') }>
                {/*SEARCH*/ }
                <span style={ { marginRight: 'auto' } }
                      className="search-box__wrapper">
                    <UikInput
                        key={ stFilterConfig.keyword }
                        defaultValue={ stFilterConfig.keyword }
                        onChange={ onInputSearch }
                        icon={ (
                            <FontAwesomeIcon icon="search"/>
                        ) }
                        placeholder={ i18next.t('page.customers.edit.searchByOrderNumber') }
                    />
                </span>
            </section>
            {/*MOBILE filter*/ }
            <section className={ 'm-filter d-mobile-flex d-desktop-none ' + (stIsFetching ? 'gs-atm--disable' : '') }>
                {/*SEARCH*/ }
                <div className="row">
                   <span style={ { marginRight: 'auto' } }
                         className="gs-search-box__wrapper col-12 gsa-mt--1e gsa-mb--1e">
                        <UikInput
                            key={ stFilterConfig.keyword }
                            defaultValue={ stFilterConfig.keyword }
                            onChange={ onInputSearch }
                            icon={ (
                                <FontAwesomeIcon icon="search"/>
                            ) }
                            placeholder={ i18next.t('page.customers.edit.searchByOrderNumber') }
                        />
                    </span>
                </div>
            </section>
            {/*DESKTOP TABLE*/ }
            { !stIsFetching &&
                <UikWidgetTable className="d-mobile-none d-desktop-table gsa-mt--1e">
                    <thead>
                    <tr>
                        <th>
                            { i18next.t('page.customers.edit.orderNumber') }
                        </th>
                        <th>
                            { i18next.t('page.customers.edit.orderDate') }
                        </th>
                        <th>
                            { i18next.t('page.customers.edit.paymentStatus') }
                        </th>
                        <th>
                            { i18next.t('page.customers.edit.status') }
                        </th>
                        <th>
                            { i18next.t('page.customers.edit.quantity') }
                        </th>
                        <th>
                            { i18next.t('page.customers.edit.subtotal') }
                        </th>
                        <th>
                            { i18next.t('page.customers.edit.total') }
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    { stOrderList.map(order => {
                        return (
                            <tr key={ order.id } className="cursor--pointer gsa-hover--gray"
                                onClick={ () => onClickOrderRow(order.channel, order.id, order.orderType) }>
                                <td>
                                    { order.id }
                                </td>
                                <td>
                                    { DateTimeUtils.formatDDMMYYY(order.createdDate) }
                                </td>
                                <td>
                                    { exportPaymentStatus(order) }
                                </td>
                                <td>
                                    {
                                        order.orderType === 'PRODUCT' &&
                                        <GSOrderStatusTag status={ order.status }
                                                          text={ i18next.t(`page.order.detail.information.orderStatus.${ order.status }`) }/>
                                    }
                                    {
                                        order.orderType === 'BOOKING' &&
                                        <GSOrderStatusTag status={ order.status } text={ i18next.t(`page.order.detail.information.reservationStatus.${ order.status }`) }/>
                                    }
                                </td>
                                <td>
                                    { NumberUtils.formatThousand(order.itemsCount) }
                                </td>
                                <td>
                                    { CurrencyUtils.formatMoneyByCurrency(order.subTotal, currency) }
                                </td>
                                <td>
                                    { CurrencyUtils.formatMoneyByCurrency(order.total, currency) }
                                </td>
                            </tr>
                        )
                    }) }
                    </tbody>
                </UikWidgetTable> }

            {/*MOBILE*/ }
            <section className="gs-mobile-list-container d-mobile-block d-desktop-none">
                { !stIsFetching && stOrderList.map(order => (
                    <div className="gs-mobile-list__row" key={ 'm' + order.id }
                         onClick={ () => onClickOrderRow(order.channel, order.id) }>
                        <div className="left-col">
                            <span>
                                { order.id }
                            </span>
                            <span className="display-name">
                                { order.buyerName }
                            </span>
                        </div>
                        <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                            <div className="gs-atm__flex-col--flex-center gs-atm__flex-align-items--end">
                                <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                                    <GSOrderStatusTag status={ order.status }/>
                                    { CurrencyUtils.formatMoneyByCurrency(order.total, currency) }
                                </div>
                                <div className="payment-method">
                                    <GSTrans
                                        t={ `page.order.detail.information.paymentMethod.${ order.paymentMethod }` }/>
                                </div>
                            </div>
                            <FontAwesomeIcon icon="chevron-right" style={ { marginLeft: '1em' } } color="gray"/>
                        </div>
                    </div>
                ))
                }
            </section>

            { stIsFetching &&
                <Loading style={ LoadingStyle.DUAL_RING_GREY }
                         className="loading-list"
                />
            }
            <PagingTable
                totalPage={ stPaging.totalPage }
                maxShowedPage={ 1 }
                currentPage={ stPaging.currentPage }
                onChangePage={ onChangePage }
                totalItems={ stOrderList.length }
            />
            { stOrderList.length === 0 && !stIsFetching &&
                <GSWidgetEmptyContent
                    iconSrc="/assets/images/icon-Empty.svg"
                    text={ stFilterConfig.keyword ?
                        i18next.t('common.noResultFound')
                        :
                        i18next.t('page.order.list.table.empty.text')
                    }/>
            }
        </div>
    );
}

CustomerOrderList.propTypes = {
    customerId: PropTypes.any,
    userId: PropTypes.any,
    saleChannel: PropTypes.string,
    openOrderNewTab: PropTypes.bool,
    currency: PropTypes.string
};

export default CustomerOrderList;
