/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 21/02/2022
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */
import './ConfirmPaymentModal.sass'

import React, {useEffect, useRef, useState} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import GSDateRangePicker from '../GSDateRangePicker/GSDateRangePicker'
import moment from 'moment'
import {UikSelect} from '../../../@uik'
import {FormValidate} from '../../../config/form-validate'
import AvFieldCountable from '../form/CountableAvField/AvFieldCountable'
import GSButton from '../GSButton/GSButton'
import GSTrans from '../GSTrans/GSTrans'
import {bool, func, number, oneOf, string} from 'prop-types'
import Constants from '../../../config/Constant'
import {DateTimeUtils} from '../../../utils/date-time'
import AvFieldCurrency from '../AvFieldCurrency/AvFieldCurrency'
import {CurrencyUtils, NumberUtils} from '../../../utils/number-format'
import {CredentialUtils} from "../../../utils/credential";

const PAYMENT_METHODS = [
    {
        value: Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_CASH,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_CASH)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_ZALO,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_ZALO)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_MOMO,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_MOMO)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_PAYPAL,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_PAYPAL)
    }
]

const VALIDATE_INPUT = {
    MIN: 0.01,
}

const ConfirmPaymentModal = props => {
    const {currency, ...others} = props
    const { toggle, orderId, orderCreatedDate, paymentMethod, debtAmount, showPS, onConfirm, onClose } = props

    const [stData, setStData] = useState({
        createdDate: DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE),
        paymentMethod: paymentMethod
    })

    useEffect(() => {
        if (!toggle) {
            return
        }

        setStData(data => ({
            ...data,
            createdDate: DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)
        }))
    }, [toggle])

    const refForm = useRef()

    useEffect(() => {
        if (!paymentMethod) {
            return
        }

        handlePaymentMethod(paymentMethod)
    }, [paymentMethod])

    const handleDateTimePicker = (event, picker) => {
        const dateTime = picker.startDate
        if (dateTime) {
            setStData(data => ({
                ...data,
                createdDate: DateTimeUtils.flatTo(dateTime, DateTimeUtils.UNIT.MINUTE)
            }))
        }
    }

    const handlePaymentMethod = (value) => {
        setStData(data => ({ ...data, paymentMethod: value }))
    }

    const handleConfirm = (event, values) => {
        if (values.paymentAmount <= 0) {
            return
        }

        onConfirm({
            ...stData,
            createdDate: moment.utc(stData.createdDate).toISOString(),
            paymentAmount: values.paymentAmount,
            note: values.note
        })
    }

    return (
        <Modal isOpen={ toggle } toggle={ onClose }
               className="confirmation-payment-modal">
            <ModalHeader toggle={ onClose }>
                {
                    orderId
                        ? <GSTrans t="component.confirmPaymentModal.orderTitle" values={ { orderId: orderId } }/>
                        : <GSTrans t="component.confirmPaymentModal.title"/>
                }
            </ModalHeader>
            <ModalBody>
                <AvForm ref={ refForm } onValidSubmit={ handleConfirm }>
                    <div className="payment-history-date">
                        <p>
                            { i18next.t('page.orderList.orderDetail.modalPayment.date') }
                        </p>

                        <GSDateRangePicker
                            readOnly
                            singleDatePicker
                            fromDate={ stData.createdDate }
                            timePicker
                            onApply={ handleDateTimePicker }
                            minDate={ orderCreatedDate && moment(orderCreatedDate) }
                            maxDate={ moment(moment.now()).set({ h: 0, m: 0, ms: 0 }) }
                            timePicker24Hour
                        >
                        </GSDateRangePicker>
                    </div>

                    <UikSelect
                        label={ i18next.t('page.orderList.orderDetail.modalPayment.method') }
                        className="dropdown-box"
                        defaultValue={ paymentMethod }
                        options={ PAYMENT_METHODS }
                        onChange={ ({ value }) => handlePaymentMethod(value) }
                    />

                    <AvFieldCurrency
                        parentClassName="w-100"
                        label={ i18next.t('page.orderList.orderDetail.modalPayment.amount') }
                        name="paymentAmount"
                        type="number"
                        value={currency === Constants.CURRENCY.VND.SYMBOL ?
                            parseInt(debtAmount) : NumberUtils.formatThousandFixed(debtAmount,2)}
                        unit={ currency }
                        validate={ {
                            ...FormValidate.required(),
                            ...FormValidate.minValue(VALIDATE_INPUT.MIN, false, 
                                'page.orderList.orderDetail.modalPayment.amount.minValue.validation',CredentialUtils.getStoreCountryCode()),
                            ...FormValidate.withCondition(
                                _.isNumber(debtAmount),
                                FormValidate.maxValueMoney(debtAmount,CurrencyUtils.getLocalStorageSymbol())
                            )
                        } }
                        position={CurrencyUtils.isPosition(currency)}
                        precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                        decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                    />

                    <AvFieldCountable
                        label={ i18next.t('page.orderList.orderDetail.modalPayment.note') }
                        name={ 'note' }
                        isRequired={ false }
                        type={ 'textarea' }
                        minLength={ 0 }
                        maxLength={ 150 }
                        rows={ 3 }
                    />
                </AvForm>
                {
                    showPS && <div className="ps-wrapper">
                    <span>
                        <GSTrans t="component.confirmPaymentModal.ps"/>
                    </span>
                    </div>
                }
            </ModalBody>
            <ModalFooter>
                <GSButton default onClick={ onClose }>
                    <GSTrans t={ 'common.btn.cancel' }/>
                </GSButton>
                <GSButton success marginLeft onClick={ () => refForm.current.submit() }>
                    <GSTrans t={ 'common.btn.add' }/>
                </GSButton>
            </ModalFooter>
        </Modal>
    )
}

ConfirmPaymentModal.defaultProps = {
    toggle: false,
    paymentMethod: Constants.ORDER_PAYMENT_METHOD_CASH,
    showPS: false,
    onConfirm: function () {
    },
    onClose: function () {
    }
}

ConfirmPaymentModal.propTypes = {
    toggle: bool,
    orderId: string,
    orderCreatedDate: string,
    paymentMethod: oneOf([
        Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
        Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
        Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
        Constants.ORDER_PAYMENT_METHOD_CASH,
        Constants.ORDER_PAYMENT_METHOD_ZALO,
        Constants.ORDER_PAYMENT_METHOD_MOMO
    ]),
    debtAmount: number,
    showPS: bool,
    onConfirm: func,
    onClose: func,
    currency: string
}

export default ConfirmPaymentModal