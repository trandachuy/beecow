import './CustomerCashbookReceiptModal.sass'
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import ModalBody from 'reactstrap/es/ModalBody'
import Modal from 'reactstrap/es/Modal'
import PropTypes from 'prop-types'
import ModalHeader from 'reactstrap/es/ModalHeader'
import Row from 'reactstrap/es/Row'
import Col from 'reactstrap/es/Col'
import {UikCheckbox, UikSelect} from '../../../../../@uik'
import {AvForm, AvField} from 'availity-reactstrap-validation'
import ModalFooter from 'reactstrap/es/ModalFooter'
import i18next from 'i18next'
import GSAlertModal, {GSAlertModalType} from "../../../../../components/shared/GSAlertModal/GSAlertModal";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import AvFieldCurrency from "../../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import AvFieldCountable from "../../../../../components/shared/form/CountableAvField/AvFieldCountable";
import {NavigationPath} from "../../../../../config/NavigationPath";
import cashbookService from "../../../../../services/CashbookService";
import {CashbookContextService} from "../../../../cashbook/context/CashbookContextService";
import {GSToast} from "../../../../../utils/gs-toast";
import { CurrencyUtils } from '../../../../../utils/number-format'

const CustomerCashbookReceiptModal = props => {
    /**
     * @type {CashBookDTO}
     */
    const cashbook = props.cashbook

    const refAlertModal = useRef()
    const [stForAccounting, setStForAccounting] = useState(cashbook.forAccounting);




    const handleSave = () => {
        props.onSave({
            id: cashbook.id,
            forAccounting: stForAccounting
        })
    }


    const handleCancel = () => {
        // check change
        if (stForAccounting !== cashbook.forAccounting) {
            refAlertModal.current.openModal({
                type: GSAlertModalType.ALERT_TYPE_SUCCESS,
                messages: i18next.t('component.product.addNew.cancelHint'),
                acceptCallback: props.onClose,
                modalCloseBtn: i18next.t('common.btn.cancel'),
                modalAcceptBtn: i18next.t('common.btn.ok')
            })
        } else {
            props.onClose()
        }
    }


    return (
        <>
            <GSAlertModal ref={ refAlertModal }/>
            <Modal isOpen={ props.isOpen } toggle={ handleCancel }
                   className="cashbook-receipt-payment-modal" backdrop="static"
                   keyboard={ false }>
                <ModalHeader toggle={ handleCancel } className="header">
                    {cashbook.transactionCode}
                </ModalHeader>
                <ModalBody className="body">
                    <AvForm>
                        <Row>
                            <Col sm={ 6 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.senderGroup"/>
                                </span>
                                <AvField
                                    name="sender-recipient-group"
                                    value={i18next.t('page.cashbook.filter.senderRecipientGroup.customer')}
                                    className="user-event-disabled"
                                />
                            </Col>
                            <Col sm={ 6 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.senderName"/>
                                </span>
                                <AvField
                                    name="customer-name"
                                    value={cashbook.customerName}
                                    className="user-event-disabled"
                                />

                            </Col>
                        </Row>
                        <Row>
                            <Col sm={ 6 }>
                                 <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.revenueType"/>
                                </span>
                                <AvField
                                    name="customer-name"
                                    value= {i18next.t('page.cashbook.filter.revenueType.' + cashbook.sourceType.toLocaleLowerCase())}
                                    className="user-event-disabled"
                                />
                            </Col>
                            <Col sm={ 6 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.branch"/>
                                </span>
                                <AvField
                                    name="branch-name"
                                    value= {cashbook.branchName}
                                    className="user-event-disabled"
                                />
                            </Col>
                        </Row>
                        <div className="indicator"/>
                        <Row>
                            <Col sm={ 6 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.amount"/>
                                </span>
                                <AvFieldCurrency
                                    parentClassName="user-event-disabled"
                                    name="amount"
                                    unit={CurrencyUtils.getLocalStorageSymbol()}
                                    value={cashbook.amount}
                                    position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
                                    precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2}
                                />
                            </Col>
                            <Col sm={ 6 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.paymentMethod"/>
                                </span>
                                <AvField
                                    name="payment-method"
                                    value= {cashbook.paymentMethod && i18next.t(`page.cashbook.filter.paymentMethod.${cashbook.paymentMethod.toLowerCase()}`)}
                                    className="user-event-disabled"

                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={ 12 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.note"/>
                                </span>
                                <AvFieldCountable
                                    className="user-event-disabled"
                                    name="note"
                                    type="textarea"
                                    rows={ 3 }
                                    maxLength={ 100 }
                                    defaultValue={ cashbook.note }
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={ 12 }>
                                <UikCheckbox
                                    name="accounting"
                                    label={ i18next.t('page.cashbook.receiptPaymentModal.accounting') }
                                    onChange={ e => setStForAccounting(e.currentTarget.checked) }
                                    color="blue"
                                    checked={stForAccounting}
                                    />
                                {
                                    (cashbook.isAuto && cashbook.orderId) && <div className="comment">
                                        <GSTrans t="page.cashbook.receiptPaymentModal.comment"/>&nbsp;
                                        <a href={NavigationPath.orderDetail + '/gosell/' + cashbook.orderId}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                        >
                                            <GSTrans t="page.cashbook.receiptPaymentModal.viewOriginal"/>
                                        </a>
                                    </div>
                                }
                            </Col>
                        </Row>
                    </AvForm>
                </ModalBody>
                <ModalFooter className="footer">
                    <GSButton onClick={ handleCancel }>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success onClick={ handleSave } disabled={stForAccounting === cashbook.forAccounting}>
                        <GSTrans t="common.btn.save"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        </>
    )
}

CustomerCashbookReceiptModal.defaultProps = {

}

CustomerCashbookReceiptModal.propTypes = {
    onSave: PropTypes.func,
    isOpen: PropTypes.bool,
    cashbook: PropTypes.object,
}


export default CustomerCashbookReceiptModal