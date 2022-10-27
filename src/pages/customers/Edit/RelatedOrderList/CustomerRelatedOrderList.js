/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import {UikInput, UikTag, UikWidgetTable} from '../../../../@uik'
import PropTypes from 'prop-types'
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import i18next from "i18next";
import {DateTimeUtils} from "../../../../utils/date-time";
import GSOrderStatusTag from "../../../../components/shared/GSOrderStatusTag/GSOrderStatusTag";
import {CurrencyUtils} from "../../../../utils/number-format";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import './CustomerRelatedOrderList.sass'
import beehiveService from '../../../../services/BeehiveService';
import {GSToast} from '../../../../utils/gs-toast';

const SIZE_PER_PAGE = 50
const CustomerRelatedOrderList = props => {
    const {currency, ...others} = props
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
        fetchData()
        return () => {
        };
    }, [stFilterConfig, stPaging.currentPage]);

    const fetchData = () => {
        setStIsFetching(true)

        beehiveService.getRelatedOrder(props.customerId, {
            size: SIZE_PER_PAGE,
            page: stPaging.currentPage - 1,
            search: stFilterConfig.keyword
        }).then(res => {
            const data = res.data
            const total = parseInt(res.headers['x-total-count'])
            setStOrderList(data)

            setStPaging({
                ...stPaging,
                totalPage: Math.ceil(total / SIZE_PER_PAGE),
                totalItem: total
            })

            setStIsFetching(false)
        }).catch(e => {
            GSToast.commonError()
            setStIsFetching(false)
        })
    }

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            currentPage: pageNumber
        })
    }

    const onKeyPressSearch = (e) => {
        if (e.key === 'Enter') {
            setStFilterConfig({
                ...stFilterConfig,
                keyword: e.currentTarget.value
            })
            setStPaging({
                ...stPaging,
                currentPage: 1
            })
            e.preventDefault()
        }
    }

    const onClickOrderRow = (orderId, orderType, saleChannel) => {
        const resolveSaleChannel = (saleChannel) => {
            saleChannel = saleChannel.toLowerCase()
            if (saleChannel === 'landing_page') {
                return 'gosell'
            }
            if (saleChannel === 'beecow') {
                return 'gomua'
            }
            return saleChannel
        }
        if (props.openOrderNewTab) {
            let url
            if (orderType === 'BOOKING') {
                url = NAV_PATH.reservationDetail + '/' + orderId
            } else {
                    url = NAV_PATH.orderDetail + '/' + resolveSaleChannel(saleChannel) + '/' + orderId
            }
            let win = window.open(url, '_blank');
            win.focus();
        } else {
            if ('BOOKING' === orderType) {
                RouteUtils.linkTo(props, NAV_PATH.reservationDetail + '/' + orderId)
            } else {
                RouteUtils.linkTo(props, NAV_PATH.orderDetail + '/' + resolveSaleChannel(saleChannel)  + '/' + orderId)
            }
        }
    }

    const renderChannel = (channel) => {
        const beecowToGoMua = (cn) => {
            if (cn === 'BEECOW') {
                return 'GOMUA'
            }
            return cn
        }

        let className = 'gs-status-tag ';
        switch (channel) {
            case "GOSELL":
                className += 'gs-status-tag--gosell';
                break;
            case "BEECOW":
                className += 'gs-status-tag--beecow';
                break;
            case "LAZADA":
                className += 'gs-status-tag--lazada';
                break;
            case "SHOPEE":
                className += 'gs-status-tag--shopee';
                break;
            default:
        }
        return (
            <UikTag fill className={className}>
                <b>{beecowToGoMua(channel)}</b>
            </UikTag>
        )
    }


    return (
        <div className="customer-related-order-list">
            {/*DESKTOP HEADER*/}
            <section className={"d-mobile-none d-desktop-flex " + (stIsFetching? 'gs-atm--disable':'')}>
                {/*SEARCH*/}
                <span style={{marginRight: 'auto'}}
                      className="search-box__wrapper">
                    <UikInput
                        onKeyPress={onKeyPressSearch}
                        icon={(
                            <FontAwesomeIcon icon="search"/>
                        )}
                        placeholder={i18next.t("page.customers.edit.searchByOrderNumber")}
                    />
                </span>
            </section>
            {/*MOBILE filter*/}
            <section className={"m-filter d-mobile-flex d-desktop-none " + (stIsFetching? 'gs-atm--disable':'')}>
                {/*SEARCH*/}
                <div className="row">
                   <span style={{marginRight: 'auto'}}
                         className="gs-search-box__wrapper col-12 gsa-mt--1e gsa-mb--1e">
                        <UikInput
                            onKeyPress={onKeyPressSearch}
                            icon={(
                                <FontAwesomeIcon icon="search"/>
                            )}
                            placeholder={i18next.t("page.customers.edit.searchByOrderNumber")}
                        />
                    </span>
                </div>
            </section>
            {/*DESKTOP TABLE*/}
            {!stIsFetching &&
            <UikWidgetTable className="d-mobile-none d-desktop-table gsa-mt--1e">
                <thead>
                <tr>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.number")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.phone")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.channel")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.status")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.total")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.method")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.related_order.date")}
                    </th>
                </tr>
                </thead>
                <tbody>
                {stOrderList.map(order => {
                    return (
                        <tr key={order.id} className="cursor--pointer gsa-hover--gray" onClick={() => onClickOrderRow(order.id, order.orderType, order.channel)}>
                            <td>
                                {order.id}
                            </td>
                            <td>
                                {order.phone}
                            </td>
                            <td>
                                {renderChannel(order.channel)}
                            </td>
                            <td>
                                {
                                    order.orderType === 'PRODUCT' &&
                                    <GSOrderStatusTag status={order.status}
                                                  text={i18next.t(`page.order.detail.information.orderStatus.${order.status}`)}/>
                                }

                                {
                                    order.orderType === 'BOOKING' &&
                                    <GSOrderStatusTag status={order.status}
                                                  text={i18next.t(`page.order.detail.information.reservationStatus.${order.status}`)}/>
                                }
                            </td>
                            <td>
                                {CurrencyUtils.formatMoneyByCurrency(order.total, currency)}
                            </td>
                            <td>
                                {order.paymentMethod != null ? i18next.t('page.order.detail.information.paymentMethod.' + order.paymentMethod) : ""}
                            </td>
                            <td>
                                {DateTimeUtils.formatDDMMYYY(order.createdDate)}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </UikWidgetTable>}

            {/*MOBILE*/}
            <section className="gs-mobile-list-container d-mobile-block d-desktop-none">
                {!stIsFetching && stOrderList.map(order => (
                    <div className="gs-mobile-list__row" key={'m'+order.id}  onClick={() => onClickOrderRow(order.id, order.orderType, order.channel)}>
                        <div className="left-col">
                            <span>
                                {order.id}
                            </span>
                            <span className="display-name">
                                {order.buyerName}
                            </span>
                        </div>
                        <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                            <div className="gs-atm__flex-col--flex-center gs-atm__flex-align-items--end">
                                <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                                    <GSOrderStatusTag status={order.status}/>
                                    {CurrencyUtils.formatMoneyByCurrency(order.total, order.currency)}
                                </div>
                                <div className="payment-method">
                                    <GSTrans t={`page.order.detail.information.paymentMethod.${order.paymentMethod}`}/>
                                </div>
                            </div>
                            <FontAwesomeIcon icon="chevron-right" style={{marginLeft: '1em'}} color="gray"/>
                        </div>
                    </div>
                ))
                }
            </section>

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
                totalItems={stOrderList.length}
            />

            {stOrderList.length === 0 && !stIsFetching &&
            <GSWidgetEmptyContent
                iconSrc="/assets/images/icon-Empty.svg"
                text={stFilterConfig.keyword?
                    i18next.t("common.noResultFound")
                    :
                    i18next.t("page.order.list.table.empty.text")
                }/>
            }
        </div>
    );
};

CustomerRelatedOrderList.propTypes = {
    customerId: PropTypes.any,
    userId: PropTypes.any,
    saleChannel: PropTypes.string,
    openOrderNewTab: PropTypes.bool,
    currency: PropTypes.string
};

export default CustomerRelatedOrderList;
