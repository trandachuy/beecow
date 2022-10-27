import './CashbookList.sass'
import React, {useContext, useEffect, useState} from 'react'
import {CashbookContext} from '../../context/CashbookContext'
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent'
import {UikInput} from '../../../../@uik'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import i18next from 'i18next'
import GSTable from '../../../../components/shared/GSTable/GSTable'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import moment from 'moment'
import {CurrencyUtils} from '../../../../utils/number-format'
import GSWidgetEmptyContent from '../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent'
import GSPagination from '../../../../components/shared/GSPagination/GSPagination'
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget'
import {CashbookContextService} from '../../context/CashbookContextService'
import {CASHBOOK_TYPE, PAYMENT_METHOD, SENDER_RECIPIENT_GROUP, UI_DATE_FORMAT} from '../../context/CashbookConstants'
import CashbookReceiptPaymentModal from '../modal/CashbookReceiptPaymentModal'
import cashbookService from '../../../../services/CashbookService'
import {GSToast} from '../../../../utils/gs-toast'
import i18n from "i18next";

const CashbookList = props => {
    const { state, dispatch } = useContext(CashbookContext.context)

    const [stReceiptPaymentModal, setStReceiptPaymentModal] = useState({
        modal: false,
        type: CashbookReceiptPaymentModal.TYPE.RECEIPT,
        defaultValue: {}
    })

    const handleSearch = _.debounce(keyword => {
        dispatch(CashbookContext.actions.setPaging({
            keyword: keyword.trim()
        }))
    }, 500)

    const handleChangePage = page => {
        dispatch(CashbookContext.actions.setPaging({
            page: page - 1
        }))
    }

    const handleSelectCashbook = (cash) => {
        const {
            id,
            transactionCode,
            type,
            groupType,
            customerId,
            customerName,
            supplierId,
            supplierName,
            staffId,
            staffName,
            otherGroupId,
            otherGroupName,
            sourceType,
            paymentMethod,
            branchId,
            branchName,
            amount,
            note,
            forAccounting,
            isAuto,
            orderId,
            returnOrderId,
            orderType
        } = cash
        let senderRecipientId, senderRecipientName

        switch (groupType) {
            case SENDER_RECIPIENT_GROUP.CUSTOMER:
                senderRecipientId = customerId
                senderRecipientName = customerName
                break

            case SENDER_RECIPIENT_GROUP.SUPPLIER:
                senderRecipientId = supplierId
                senderRecipientName = supplierName
                break

            case SENDER_RECIPIENT_GROUP.STAFF:
                senderRecipientId = staffId
                senderRecipientName = staffName
                break

            case SENDER_RECIPIENT_GROUP.OTHERS:
                senderRecipientId = otherGroupId
                senderRecipientName = otherGroupName
                break
        }

        setStReceiptPaymentModal({
            modal: true,
            type: type,
            defaultValue: {
                id,
                transactionCode,
                senderRecipientGroup: groupType,
                senderRecipientId,
                senderRecipientName,
                revenueType: sourceType,
                expenseType: sourceType,
                paymentMethod,
                branchId,
                branchName,
                amount,
                note,
                accounting: forAccounting,
                isAuto,
                orderId,
                returnOrderId,
                orderType
            }
        })
    }

    const handleReceiptPaymentSave = ({ id, accounting }) => {
        cashbookService.updateCashBookForStore({
            id,
            forAccounting: accounting
        })
            .then(() => {
                setStReceiptPaymentModal({
                    modal: false,
                    defaultValue: {}
                })
                CashbookContextService.updateCashbookList(state, dispatch)
                CashbookContextService.updateCashbookSummary(state, dispatch)
                GSToast.commonUpdate()
            })
            .catch(() => GSToast.commonError())
    }

    const renderRevenueExpenseType = (cash, columnType) => {
        if (cash.type !== columnType) {
            return '-'
        }

        if (columnType === CASHBOOK_TYPE.RECEIPT) {
            return i18next.t(`page.cashbook.filter.revenueType.${cash.sourceType.toLowerCase()}`)
        }

        return i18next.t(`page.cashbook.filter.expenseType.${cash.sourceType.toLowerCase()}`)
    }

    const getCreatedByName = (createdByName) => {
        return createdByName === '[shop0wner]'
            ? i18n.t('page.order.detail.information.shopOwner')
            : createdByName
    };

    return (
        <>
            <CashbookReceiptPaymentModal
                modal={ stReceiptPaymentModal.modal }
                type={ stReceiptPaymentModal.type }
                mode={ CashbookReceiptPaymentModal.MODE.UPDATE }
                defaultValue={ stReceiptPaymentModal.defaultValue }
                toggle={ () => setStReceiptPaymentModal({
                    modal: false
                }) }
                onSave={ handleReceiptPaymentSave }
            />
            <GSWidget className="cashbook-list flex-grow-1 d-flex flex-column mb-0 mt-0">
                <GSWidgetContent className="d-flex flex-column flex-grow-1">
                    {/*SEARCH*/ }
                    <div className="d-flex mb-2 mb-md-0">
                        <UikInput
                            icon={
                                <FontAwesomeIcon icon="search"/>
                            }
                            iconPosition="left"
                            placeholder={ i18next.t(
                                'common.input.searchBy',
                                {
                                    by: i18next.t(
                                        `page.cashbook.list.searchBy.transactionCode`
                                    )
                                }
                            ) }
                            onChange={ e => handleSearch(e.currentTarget.value || '') }
                            style={ {
                                width: '20em',
                                height: '38px'
                            } }
                        />
                    </div>

                    {/*DATA TABLE*/ }
                    <div className="table">
                        <GSTable>
                            <thead>
                            <tr>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.transactionCode"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.dateCreated"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.branch"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.revenueType"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.expenseType"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.senderRecipient"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.createdBy"/>
                                </th>
                                <th>
                                    <GSTrans t="page.cashbook.list.header.amount"/>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                state.cashbookList && state.cashbookList.map(cash => (
                                    <tr
                                        key={ cash.id }
                                    >
                                        <td className="transaction-code" onClick={ () => handleSelectCashbook(cash) }>
                                            { cash.transactionCode }
                                        </td>
                                        <td>
                                            { moment(cash.createdDate).format(UI_DATE_FORMAT)}
                                        </td>
                                        <td>
                                            <span className="line-clamp-2">{ cash.branchName }</span>
                                        </td>
                                        <td>
                                            { renderRevenueExpenseType(cash, CASHBOOK_TYPE.RECEIPT) }
                                        </td>
                                        <td>
                                            { renderRevenueExpenseType(cash, CASHBOOK_TYPE.PAYMENT) }
                                        </td>
                                        <td>
                                            { cash.customerName || cash.supplierName || cash.staffName || cash.otherGroupName }
                                        </td>
                                        <td>
                                            { getCreatedByName(cash.createdByName) }
                                        </td>
                                        <td>
                                            { CurrencyUtils.formatMoneyByCurrency(cash.amount, state.currency) }
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </GSTable>

                        {
                            state.cashbookList && !state.cashbookList.length && (
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/cashbook/cashbook_empty.svg"
                                    text={ i18next.t(
                                        'page.cashbook.list.empty'
                                    ) }
                                    className="flex-grow-1"
                                />
                            )
                        }

                        <GSPagination
                            totalItem={ state.paging.total }
                            currentPage={ state.paging.page + 1 }
                            onChangePage={ handleChangePage }
                            pageSize={ state.paging.size }
                        />
                    </div>
                </GSWidgetContent>
            </GSWidget>
        </>
    )
}

CashbookList.defaultProps = {}

CashbookList.propTypes = {}

export default CashbookList
