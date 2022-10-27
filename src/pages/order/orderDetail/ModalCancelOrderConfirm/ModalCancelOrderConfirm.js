/*******************************************************************************
 * Copyright 2022 (C) Mediastep Software Inc.
 *
 * Created on : 10/06/2022
 * Author: An Hoang <an.hoang.nguyen@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Trans} from "react-i18next";
import './ModalCancelOrderConfirm.sass'
import {OrderService} from "../../../../services/OrderService";
import Constants from "../../../../config/Constant";
import i18next from "i18next";
import {AvField, AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation"
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";
import {FormValidate} from "../../../../config/form-validate";
import style from "../../../affiliate/commission/CouponEditor.module.sass";
import {CommissionTypeEnum} from "../../../../models/CommissionTypeEnum";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {Currency, CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {BCOrderService} from "../../../../services/BCOrderService";
import * as accounting from "accounting-js";

const REFUND_ORDER_TYPE = {
    REFUND_NOW: 'REFUND_NOW',
    REFUND_LATER: 'REFUND_LATER',
}

const CURRENCY_REFUND = {
    CURRENCY_USD: Currency.USD
}

class ModalCancelOrderConfirm extends Component {

    state = {
        isOpen: false,
        onRedirect: false,
        isLoading: false,
        refundType: REFUND_ORDER_TYPE.REFUND_NOW,
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
            refundType: REFUND_ORDER_TYPE.REFUND_NOW,
            refundAmount: 0,
            errorAmount: false
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

        OrderService.setOrderStatus(this.props.siteCode,
            this.props.order.orderInfo.orderId,
            Constants.ORDER_STATUS_CANCELLED, {reason: v.reason})
            .then( result => {
                if (this.state.refundType === REFUND_ORDER_TYPE.REFUND_NOW && this.props.paymentMethod === Constants.ORDER_PAYMENT_METHOD_PAYPAL){
                        BCOrderService.refundOrderPaypal(request)
                            .then(result => {
                                this.setState({
                                    isLoading: false
                                })
                                if (this.props.okCallback) {
                                    this.props.okCallback()
                                }
                                GSToast.success("page.order.detail.refundOrder.success", true)
                            })
                            .catch(e => {
                                this.setState({
                                    isLoading: false
                                })
                                if (this.props.okCallback) {
                                    this.props.okCallback()
                                }
                                GSToast.error("page.order.detail.refundOrder.failed", true)
                            })
                }
                GSToast.success("page.order.detail.cancelOrder.success", true)
                this.setState({
                    isLoading: false
                })

                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                    this.onClose()
                }
            )
            .catch( e => {
                GSToast.error("page.order.detail.cancelOrder.failed", true)
                this.setState({
                    isLoading: false
                })
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                this.onClose()
            })
    }

    onRadioSelect(e) {
        if (e.target.value === REFUND_ORDER_TYPE.REFUND_LATER){
            this.setState({
                refundAmount: this.state.maxRefund,
                errorAmount: false
            })
        }
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
                    <Modal isOpen={this.state.isOpen} toggle={this.onClose} className="modal-dialog-centered modal-cancel-order-confirm model-mw-300px">
                        <ModalHeader toggle={this.onClose}>
                            <Trans i18nKey="page.order.detail.cancelOrder.confirmation"/>
                        </ModalHeader>
                        <ModalBody>
                            <div className="ready-to-ship-confirm__message">
                                <Trans i18nKey="page.order.detail.cancelOrder.message"/>
                            </div>
                            <AvForm onValidSubmit={this.handleValidSubmit} autoComplete="off">
                                <button hidden ref={el => this.refSubmit = el}/>
                                <div className="input-reason">
                                    <AvField
                                        name="reason"
                                        placeholder={i18next.t("page.order.detail.cancel.reason")}
                                        validate={{
                                        required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                        maxLength: {value: 200, errorMessage: i18next.t("common.validation.char.max.length", {x: 200})}
                                    }}/>
                                </div>
                                {this.props.paymentMethod === Constants.ORDER_PAYMENT_METHOD_PAYPAL && this.props.refundStatus !== 'REFUNDED' && this.props.transactionId?.length > 0  &&
                                    <div className='refund-order'>
                                    <span className='title-refund-order'>{i18next.t("page.order.detail.cancel.refundOrder")}</span>
                                    <AvRadioGroup
                                        name='refund-order-type'
                                        className={["gs-frm-radio"].join(" ")}
                                        inline
                                        defaultValue={REFUND_ORDER_TYPE.REFUND_NOW}
                                    >
                                        <AvRadio
                                            customInput
                                            className={style.customRadio}
                                            label={i18next.t(
                                                "page.order.detail.cancel.refundNow"
                                            )}
                                            value={
                                                REFUND_ORDER_TYPE.REFUND_NOW
                                            }
                                            onClick={(e) =>
                                                this.onRadioSelect(
                                                    e
                                                )
                                            }
                                        />
                                        <AvRadio
                                            customInput
                                            className={style.customRadio}
                                            label={i18next.t(
                                                "page.order.detail.cancel.refundLater"
                                            )}
                                            value={
                                                REFUND_ORDER_TYPE.REFUND_LATER
                                            }
                                            onClick={(e) =>
                                                this.onRadioSelect(
                                                    e
                                                )
                                            }
                                        />
                                    </AvRadioGroup>
                                    {this.state.refundType === REFUND_ORDER_TYPE.REFUND_NOW &&
                                    <>
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
                                    </>
                                    }
                                </div>
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

ModalCancelOrderConfirm.propTypes = {
    siteCode: PropTypes.oneOf([Constants.SITE_CODE_LAZADA,
        Constants.SITE_CODE_SHOPEE,
        Constants.SITE_CODE_GOSELL,
        Constants.SITE_CODE_BEECOW]),
    order: PropTypes.object,
    exchangeRate: PropTypes.number,
    refundStatus: PropTypes.string,
    transactionId: PropTypes.string,
    isPaid: PropTypes.bool,
    paymentMethod: PropTypes.string,
    okCallback: PropTypes.func
}

export default ModalCancelOrderConfirm;
