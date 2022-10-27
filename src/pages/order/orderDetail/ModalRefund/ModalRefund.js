/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 18/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Trans} from "react-i18next";
import './ModalRefund.sass'
import i18next from "i18next";
import {AvField, AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation"
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {Currency, CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {BCOrderService} from "../../../../services/BCOrderService";
import * as accounting from "accounting-js";

const CURRENCY_REFUND = {
    CURRENCY_USD: Currency.USD
}

class ModalRefund extends Component {

    state = {
        isOpen: false,
        onRedirect: false,
        isLoading: false,
        refundAmount: 0,
        maxRefund: 0,
        errorAmount: false
    }

    constructor(props) {
        super(props)

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.onRadioSelect = this.onRadioSelect.bind(this);
        this.onChangeRefundAmount = this.onChangeRefundAmount.bind(this);
    }

    onOpen() {
        const orgTotal = this.props.order.orderInfo.orgTotalPrice || 0
        const totalOrder = orgTotal / this.props.exchangeRate
        const maxRefund = NumberUtils.formatThousandFixed(totalOrder - this.props.order.orderInfo.refundedAmount, 2)

        this.setState({
            isOpen: true,
            refundAmount: maxRefund,
            maxRefund: maxRefund
        })
    }

    onClose() {
        this.setState({
            isOpen: false,
            errorAmount: false,
            refundAmount: 0
        })
    }

    onSubmit() {
        this.refSubmit.click()
    }

    handleValidSubmit(e, v) {
        this.setState({
            isOpen: false,
            isLoading: true
        })

        const request = {
            orderId : this.props.order.orderInfo.orderId,
            amount: this.state.refundAmount,
            currency: CURRENCY_REFUND.CURRENCY_USD
        }

        BCOrderService.refundOrderPaypal(request)
            .then(result => {
                this.onClose()
                this.setState({
                    isLoading: false
                })
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                GSToast.success("page.order.detail.refundOrder.success", true)
            })
            .catch(e => {
                this.onClose()
                this.setState({
                    isLoading: false
                })
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                GSToast.error("page.order.detail.refundOrder.failed", true)
            })
    }

    onRadioSelect(e) {
        this.setState({
            refundType: e.target.value
        })
    }

    onChangeRefundAmount(e){
        const valueAmount = e.currentTarget.value
        this.setState({
            refundAmount: valueAmount,
            errorAmount: false
        })
        if (valueAmount == 0 || valueAmount < 0 || parseFloat(valueAmount) > parseFloat(this.state.maxRefund)){
            this.setState({
                errorAmount: true
            })
        }
    }

    render() {
        return (
            <>
                {this.state.isLoading ?
                <LoadingScreen/>
                :
                    <Modal isOpen={this.state.isOpen} toggle={this.onClose} className="modal-dialog-centered modal-refund model-mw-300px">
                        <ModalHeader toggle={this.onClose}>
                            <Trans i18nKey="page.order.detail.cancelOrder.refund"/>
                        </ModalHeader>
                        <ModalBody>
                            <span className='title-refund-order'>{i18next.t("page.order.detail.cancel.refundAmount")}</span>
                            <AvForm onValidSubmit={this.handleValidSubmit} autoComplete="off">
                                <button hidden ref={el => this.refSubmit = el}/>
                                    <AvFieldCurrency
                                        className={this.state.errorAmount ? 'border-error' : ''}
                                        name="refundAmount"
                                        unit={CurrencySymbol.USD}
                                        value={this.state.refundAmount}
                                        onChange={e => this.onChangeRefundAmount(e)}
                                        parentClassName="refund-amount"
                                        position={CurrencyUtils.isPosition(CurrencySymbol.USD)}
                                        precision={CurrencyUtils.isCurrencyInput(CurrencySymbol.USD) && '2'}
                                        decimalScale={CurrencyUtils.isCurrencyInput(CurrencySymbol.USD) && 2}
                                    />
                                    {this.state.errorAmount &&
                                    <div
                                        className='invalid-feedback-error'>{i18next.t("page.order.detail.cancel.validationAmount", {total: this.state.maxRefund})}</div>
                                    }
                            </AvForm>
                        </ModalBody>
                        <ModalFooter className="ready-to-ship-confirm__btn-wrapper gs-modal__footer--no-top-border">
                            <GSButton secondary outline onClick={this.onClose}>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>
                            <GSButton success marginLeft onClick={this.onSubmit} disabled={this.state.errorAmount}>
                                <Trans i18nKey="common.btn.confirm"/>
                            </GSButton>
                        </ModalFooter>
                    </Modal>}
            </>
        );
    }
}

ModalRefund.propTypes = {
    order: PropTypes.object,
    exchangeRate: PropTypes.number,
    okCallback: PropTypes.func
}

export default ModalRefund;
