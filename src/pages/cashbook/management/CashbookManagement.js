import './CashbookManagement.sass'
import React, {useEffect, useReducer, useState} from 'react'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import i18next from 'i18next'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import {CashbookContext} from '../context/CashbookContext'
import GSContentHeaderTitleWithExtraTag
    from '../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag'
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import GSButton from '../../../components/shared/GSButton/GSButton'
import CashbookSummary from './summary/CashbookSummary'
import CashbookList from './list/CashbookList'
import CashbookFilter from './filter/CashbookFilter'
import CashbookReceiptPaymentModal from './modal/CashbookReceiptPaymentModal'
import {CashbookContextService} from '../context/CashbookContextService'
import cashbookService from '../../../services/CashbookService'
import {SENDER_RECIPIENT_GROUP} from '../context/CashbookConstants'
import {CredentialUtils} from '../../../utils/credential'
import {GSToast} from '../../../utils/gs-toast'

const CashbookManagement = props => {
    const [state, dispatch] = useReducer(CashbookContext.reducer, CashbookContext.initState)

    const [stReceiptPaymentModal, setStReceiptPaymentModal] = useState({
        modal: false,
        type: CashbookReceiptPaymentModal.TYPE.RECEIPT
    })

    useEffect(() => {
        CashbookContextService.updateFilterBranches(state, dispatch)
        CashbookContextService.updateFilterStaffs(state, dispatch)
    }, [])

    useEffect(() => {
        CashbookContextService.updateCashbookList(state, dispatch)
        CashbookContextService.updateCashbookSummary(state, dispatch)
    }, [state.filter, state.paging.keyword, state.paging.page, state.customStartDate, state.customEndDate])

    const handleCreateReceipt = () => {
        setStReceiptPaymentModal({
            modal: true,
            type: CashbookReceiptPaymentModal.TYPE.RECEIPT
        })
    }

    const handleCreatePayment = () => {
        setStReceiptPaymentModal({
            modal: true,
            type: CashbookReceiptPaymentModal.TYPE.PAYMENT
        })
    }

    const handleReceiptPaymentSave = (data) => {
        const {
            senderRecipientGroup,
            senderRecipientId,
            senderRecipientName,
            revenueType,
            expenseType,
            paymentMethod,
            branchId,
            branchName,
            amount,
            note,
            accounting
        } = data
        const requestBody = {
            amount: amount,
            branchId: branchId,
            branchName: branchName,
            forAccounting: accounting,
            groupType: senderRecipientGroup,
            note: note,
            paymentMethod: paymentMethod,
            sourceType: revenueType || expenseType,
            storeId: CredentialUtils.getStoreId(),
            type: stReceiptPaymentModal.type
        }

        switch (senderRecipientGroup) {
            case SENDER_RECIPIENT_GROUP.CUSTOMER:
                requestBody.customerId = senderRecipientId
                requestBody.customerName = senderRecipientName
                break

            case SENDER_RECIPIENT_GROUP.SUPPLIER:
                requestBody.supplierId = senderRecipientId
                requestBody.supplierName = senderRecipientName
                break

            case SENDER_RECIPIENT_GROUP.STAFF:
                requestBody.staffId = senderRecipientId
                requestBody.staffName = senderRecipientName
                break

            case SENDER_RECIPIENT_GROUP.OTHERS:
                requestBody.otherGroupId = senderRecipientId
                requestBody.otherGroupName = senderRecipientName
                break
        }

        cashbookService.createCashBookForStore(requestBody)
            .then(() => {
                setStReceiptPaymentModal({
                    modal: false
                })
                CashbookContextService.updateCashbookList(state, dispatch)
                CashbookContextService.updateCashbookSummary(state, dispatch)
                GSToast.success(`page.cashbook.${stReceiptPaymentModal.type.toLowerCase()}.create.success`, true)
            })
            .catch(() => GSToast.commonError())
    }

    return (
        <GSContentContainer className="cashbook-management">
            <GSContentHeader
                title={
                    <GSContentHeaderTitleWithExtraTag
                        title={ i18next.t('page.cashbook.title') }
                        extra={ state.paging.total }
                    />
                }>
                <GSContentHeaderRightEl className="d-flex">
                    <GSButton success onClick={ handleCreateReceipt }><GSTrans
                        t="page.cashbook.button.createReceipt"/></GSButton>
                    <GSButton success onClick={ handleCreatePayment } className="ml-3"><GSTrans
                        t="page.cashbook.button.createPayment"/></GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <CashbookContext.provider value={ { state, dispatch } }>
                <CashbookReceiptPaymentModal
                    modal={ stReceiptPaymentModal.modal }
                    type={ stReceiptPaymentModal.type }
                    toggle={ () => setStReceiptPaymentModal({
                        modal: false
                    }) }
                    onSave={ handleReceiptPaymentSave }
                />
                <GSContentBody size={ GSContentBody.size.MAX }>
                    <div className="row p-0">
                        <CashbookFilter/>
                    </div>
                    <div className="row p-0">
                        <CashbookSummary/>
                    </div>
                    <div className="row p-0">
                        <CashbookList/>
                    </div>
                </GSContentBody>
            </CashbookContext.provider>
        </GSContentContainer>
    )
}

CashbookManagement.defaultProps = {}

CashbookManagement.propTypes = {}

export default CashbookManagement