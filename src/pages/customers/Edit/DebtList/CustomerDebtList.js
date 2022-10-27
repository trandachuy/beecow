/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import {UikInput, UikWidgetTable} from '../../../../@uik'
import PropTypes from 'prop-types'
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import i18next from "i18next";
import {DateTimeUtils} from "../../../../utils/date-time";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './CustomerDebtList.sass'
import cashbookService from "../../../../services/CashbookService";
import {RouteUtils} from "../../../../utils/route";
import {Link} from "react-router-dom";
import {NavigationPath} from "../../../../config/NavigationPath";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import {GSToast} from "../../../../utils/gs-toast";
import CustomerCashbookReceiptModal from "./Modal/CustomerCashbookReceiptModal";
import _ from "lodash";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";

const SIZE_PER_PAGE = 50
const CASHBOOK_SOURCE_TYPE = {
    PAYMENT_FOR_ORDER: 'PAYMENT_FOR_ORDER',
    DEBT_COLLECTION_FROM_CUSTOMER: 'DEBT_COLLECTION_FROM_CUSTOMER',
}
const CustomerDebtList = props => {
    const {currency, ...others} = props
    const [stDebtList, setStDebtList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [stFilterConfig, setStFilterConfig] = useState({
        keyword: ''
    });
    const [stReceiptPaymentModal, setStReceiptPaymentModal] = useState({
        isOpen: false,
        cashbook: null
    })
    const [stSaving, setStSaving] = useState(false);

    useEffect(() => {
        fetchData()

        return () => {
        };
    }, [stFilterConfig, stPaging.currentPage]);

    const selectCashbook = (cashbook) => {
        setStReceiptPaymentModal({
            isOpen: true,
            cashbook: cashbook
        })
    }

    const fetchData = () => {
        cashbookService.getCustomerCashbookList(props.customerId,
            stPaging.currentPage - 1,
            SIZE_PER_PAGE,
            stFilterConfig.keyword || undefined)
            .then(({data, totalItem}) => {
                setStDebtList(data)
                setStPaging({
                    ...stPaging,
                    totalPage: Math.ceil(totalItem / SIZE_PER_PAGE),
                    totalItem: totalItem
                })
            })
            .finally(() => {
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


    /**
     * onClickCashbookRow
     * @param {CashBookDTO} cashbook
     */
    const onClickCashbookRow = (cashbook) => {
        if (cashbook.sourceType === CASHBOOK_SOURCE_TYPE.PAYMENT_FOR_ORDER) { // order
            RouteUtils.openNewTab(NavigationPath.orderDetail + '/gosell/' + cashbook.orderId)
        } else { // cashbook record
            selectCashbook(cashbook)
        }
    }

    /**
     * renderCashBookType
     * @param {CashBookDTO} cashbook
     */
    const renderCashBookType=(cashbook)=>{
        if (cashbook.sourceType === CASHBOOK_SOURCE_TYPE.PAYMENT_FOR_ORDER) { // order
            return i18next.t("page.cashbook.filter.revenueType.payment_for_order")
        } else { // cashbook record
            return i18next.t("page.cashbook.filter.revenueType.debt_collection_from_customer")
        }
    }

    /**
     * renderCashBookTransaction
     * @param {CashBookDTO} cashbook
     */
    const renderCashBookTransactionCode= (cashbook) => {
        if (cashbook.sourceType === CASHBOOK_SOURCE_TYPE.PAYMENT_FOR_ORDER) { // order
            return (
                <Link to={NavigationPath.orderDetail + '/gosell/' + cashbook.orderId}
                      className="gs-fake-link"
                      target="_blank"
                      onClick={(e) => {e.preventDefault()}}
                >
                    {cashbook.orderId}
                </Link>
            )
        } else { // cashbook record
            return <GSFakeLink>{cashbook.transactionCode}</GSFakeLink>
        }
    }

    const handleReceiptPaymentSave = ({ id, forAccounting }) => {
        setStSaving(true)
        cashbookService.updateCashBookForStore({
            id,
            forAccounting
        })
            .then(() => {
                onCloseCashbookModal()

                // update list
                const debtList = _.clone(stDebtList)
                let changedDebt = debtList.find(debt => debt.id === id)
                changedDebt.forAccounting = forAccounting
                setStDebtList(debtList)

                GSToast.commonUpdate()
            })
            .catch(() => GSToast.commonError())
            .finally(() => setStSaving(false))
    }

    const onCloseCashbookModal = () => {
        setStReceiptPaymentModal(state => ({
            ...state,
            isOpen: false,
            cashbook: null,
        }))
    }

    return (
        <div className="customer-debt-list">
            {stSaving && <LoadingScreen zIndex={9999}/>}
            {stReceiptPaymentModal.cashbook &&
                <CustomerCashbookReceiptModal
                isOpen={stReceiptPaymentModal.isOpen}
                onClose={onCloseCashbookModal}
                cashbook={stReceiptPaymentModal.cashbook}
                onSave={handleReceiptPaymentSave}
            />}

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
                        placeholder={i18next.t("page.customers.edit.debt.search")}
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
                            placeholder={i18next.t("page.customers.edit.debt.search")}
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
                        {i18next.t( "page.customers.edit.debt.table.transactionCode")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.debt.table.dateCreated")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.debt.table.transactionType")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.debt.table.amountChange")}
                    </th>
                    <th>
                        {i18next.t( "page.customers.edit.debt.title")}
                    </th>
                </tr>
                </thead>
                <tbody>
                {stDebtList.map(
                    /**
                     * @param {CashBookDTO} cashbook
                     * @return {JSX.Element}
                     */
                    cashbook => {
                    return (
                        <tr key={cashbook.id} className="cursor--pointer gsa-hover--gray" onClick={() => onClickCashbookRow(cashbook)}>
                            <td>
                                {renderCashBookTransactionCode(cashbook)}
                            </td>
                            <td>
                                {DateTimeUtils.formatDDMMYYY(cashbook.createdDate)}
                            </td>
                            <td>
                                {renderCashBookType(cashbook)}
                            </td>
                            <td>
                                {CurrencyUtils.formatMoneyByCurrency(cashbook.amountChange, currency)}
                            </td>
                            <td>
                                {CurrencyUtils.formatMoneyByCurrency(cashbook.debt, currency)}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </UikWidgetTable>}

            {/*MOBILE*/}
            <section className="gs-mobile-list-container d-mobile-block d-desktop-none">
                {!stIsFetching && stDebtList.map(cashbook => (
                    <div className="gs-mobile-list__row" key={'m'+cashbook.id}  onClick={() => onClickCashbookRow(cashbook)}>
                        <div className="left-col">
                            <span>
                                {renderCashBookTransactionCode(cashbook)}
                            </span>
                            <span className="display-name">
                                {renderCashBookType(cashbook)}
                            </span>
                        </div>
                        <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                            <div className="gs-atm__flex-col--flex-center gs-atm__flex-align-items--end">
                                <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                                    {CurrencyUtils.formatMoneyByCurrency(cashbook.amountChange, currency)}
                                </div>
                                <div className="payment-method">
                                    {CurrencyUtils.formatMoneyByCurrency(cashbook.debt, currency)}
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
                totalItems={stDebtList.length}
            />

            {stDebtList.length === 0 && !stIsFetching &&
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

CustomerDebtList.propTypes = {
    customerId: PropTypes.any,
    userId: PropTypes.any,
    currency: PropTypes.string
};

export default CustomerDebtList;
