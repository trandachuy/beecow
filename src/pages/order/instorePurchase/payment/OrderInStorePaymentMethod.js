/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext} from 'react';
import './OrderInStorePaymentMethod.sass'
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {UikFormInputGroup, UikRadio} from '../../../../@uik'
import {OrderInStorePurchaseContext} from "../context/OrderInStorePurchaseContext";
import Constants from "../../../../config/Constant";

const OrderInStorePaymentMethod = props => {
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);

    const onClickChoosePaymentMethod = (paymentMethod) => {
        dispatch(OrderInStorePurchaseContext.actions.setPaymentMethod(paymentMethod))
    }

    const onBlurMPOSCode = (e) => {
        const value = e.currentTarget.value
        if (value) {
            dispatch(OrderInStorePurchaseContext.actions.setMPOSCode(value))
        }

    }

    return (
        <GSWidget className="order-in-store-payment-method">
            <GSWidgetContent className={state.productList.filter(p => p.checked).length === 0? 'gs-atm--disable':''}>
                <div className="row">
                    <div className="col-3 order-in-store-payment-method__title p-0 d-flex align-items-center">
                        <h6 className="mb-0">
                            <GSTrans t="page.setting.shippingAndPayment.payment"/>
                        </h6>
                    </div>

                    <div className="col-9 order-in-store-payment-method__options-container p-0 pl-3">
                        <UikFormInputGroup className="order-in-store-payment-method__radio-group">
                            <UikRadio
                                label={
                                    <div className="order-in-store-payment-method__radio-label">
                                        <img src="/assets/images/payment_method/icon-COD.svg" alt='cash'/>
                                        <GSTrans t="page.order.create.payment.cash"/>
                                    </div>
                                }
                                name="payment-method-group"
                                checked={state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_CASH}
                                onClick={() => onClickChoosePaymentMethod(Constants.ORDER_PAYMENT_METHOD_CASH)}
                            />
                            <UikRadio
                                label={
                                    <div className="order-in-store-payment-method__radio-label">
                                        <img src="/assets/images/payment_method/icon-bank-transfer.svg" alt='cash'/>
                                        <GSTrans t="page.order.create.payment.bankTransfer"/>
                                    </div>
                                }
                                name="payment-method-group"
                                checked={state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER}
                                onClick={() => onClickChoosePaymentMethod(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)}
                            />
                            <UikRadio
                                label={
                                    <>
                                       {state.paymentMethod !== Constants.ORDER_PAYMENT_METHOD_MPOS &&
                                       <div className="order-in-store-payment-method__radio-label">
                                            <img src="/assets/images/payment_method/icon-COD.svg" alt='cash'/>
                                            <GSTrans t="page.order.create.print.paymentMethod.MPOS"/>
                                        </div>}
                                        {state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_MPOS &&
                                            <div>
                                                <label className="gs-frm-control__title mb-1">
                                                    <GSTrans t="page.order.create.payment.mposCode"/>
                                                </label>
                                                <input max={100}
                                                       className="form-control order-in-store-payment-method__input-mpos-code"
                                                       onBlur={onBlurMPOSCode}
                                                       id="instoreposcode"
                                                />
                                            </div>
                                        }
                                    </>
                                }
                                name="payment-method-group"
                                checked={state.paymentMethod === Constants.ORDER_PAYMENT_METHOD_MPOS}
                                onClick={() => onClickChoosePaymentMethod(Constants.ORDER_PAYMENT_METHOD_MPOS)}
                            />
                        </UikFormInputGroup>
                    </div>
                </div>
            </GSWidgetContent>
        </GSWidget>
    );
};

OrderInStorePaymentMethod.propTypes = {

};

export default OrderInStorePaymentMethod;
