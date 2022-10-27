/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef} from 'react';
import ReactToPrint from "react-to-print";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {OrderInStorePurchaseContext} from "../../context/OrderInStorePurchaseContext";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import moment from 'moment'
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import './OrderInStorePurchasePrinter.sass'
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {OrderInStorePurchaseContextService} from "../../context/OrderInStorePurchaseContextService";
import * as _ from 'lodash';

const OrderInStorePurchasePrinter = props => {
    const refTemplate = useRef(null);
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);

    const isEnabled = state.productList.filter(p => p.checked).length > 0;

    useEffect(() => {
        dispatch(OrderInStorePurchaseContext.actions.setBuyerInfo(state.shippingInfo));
    }, [state.shippingInfo]);

    return (
        <div {...props}>
            <ReactToPrint
                trigger={() => (
                    <GSButton default disabled={!isEnabled}>
                        <GSTrans t="page.order.detail.btn.print"/>
                    </GSButton>
                )}
                content={() => refTemplate.current}
            />
            <div style={{display: 'none'}}>
                <Template ref={refTemplate}/>
            </div>
        </div>
    );
};

class Template extends React.Component {

    constructor() {
        super();

        this.renderSubTotal = this.renderSubTotal.bind(this);
        this.isShowCustomerInformation = this.isShowCustomerInformation.bind(this);
    }

    renderPromotionPrice(product) {
        if (product.wholeSale) {
            return CurrencyUtils.formatMoneyByCurrency(-product.wholeSale.discountAmount, product.currency)
        }
        if (product.promotion) {
            return CurrencyUtils.formatMoneyByCurrency(-product.promotion.couponItem.promoAmount, product.currency)
        }
        return CurrencyUtils.formatMoneyByCurrency(0, product.currency)
    }

    renderTotalPrice(product) {
        const orgPrice = product.price * product.quantity
        if (product.wholeSale) {
            return CurrencyUtils.formatMoneyByCurrency(orgPrice-product.wholeSale.discountAmount, product.currency)
        }
        if (product.promotion) {
            return CurrencyUtils.formatMoneyByCurrency(orgPrice-product.promotion.couponItem.promoAmount, product.currency)
        }
        return CurrencyUtils.formatMoneyByCurrency(orgPrice, product.currency)
    }

    isShowCustomerInformation() {
        return this.context.state.buyerInfo && (!_.isEmpty(this.context.state.buyerInfo.contactName)
            || !_.isEmpty(this.context.state.buyerInfo.phoneNumber)
            || !_.isEmpty(this.context.state.buyerInfo.email)
            || !_.isEmpty(this.context.state.buyerInfo.address)
            || !_.isEmpty(this.context.state.buyerInfo.wardName)
            || !_.isEmpty(this.context.state.buyerInfo.districtName)
            || !_.isEmpty(this.context.state.buyerInfo.cityName));
    }

    renderSubTotal() {

    }

    render() {
        return (
            <div className="d-flex flex-column p-5 w-100 order-in-store-purchase-printer">
                {/*HEADER*/}
                <div className="d-flex align-items-center justify-content-between">
                    <h5 className="text-uppercase text-decoration-underline">
                        <GSTrans t="page.order.create.print.orderSummary"/>
                    </h5>
                    <div>
                        <b>
                            <GSTrans t="page.order.create.print.date"/>:
                        </b>
                        {moment(moment.now()).format(' DD/MM/YYYY | HH:mm')}
                    </div>

                </div>
                {/*PRODUCT LIST*/}
                <div className="w-100 mt-4">
                    <table className="w-100">
                        <thead>
                            <tr>
                                <th>
                                    <GSTrans t="productList.tbheader.productName"/>
                                </th>
                                <th>
                                    <GSTrans t="productList.tbheader.price"/>
                                </th>
                                <th>
                                    <GSTrans t="page.dashboard.table.quantity"/>
                                </th>
                                <th>
                                    <GSTrans t={"page.order.create.cart.table.promotion"}/>
                                </th>
                                <th>
                                    <GSTrans t={"page.order.create.cart.table.priceTotal"}/>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.context.state.productList.filter(p => p.checked).map(product => {
                            return (
                                <tr key={product.id} style={{borderBottom: '1px solid lightgray'}}>
                                    <td>
                                        <div className="d-flex justify-content-start align-items-center">
                                            <img src={product.image}
                                                 alt="product-thumbnail"
                                                 style={{
                                                     width: '4rem',
                                                     height: '4rem'
                                                 }}
                                            />
                                            <div className="ml-3">
                                                <h6 className="order-in-store-purchase-cart-product-list__product-name">
                                                    {product.name}
                                                </h6>
                                                {product.modelName &&
                                                <span>{product.modelName}</span>
                                                }
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-weight-bold text-center">
                                        {CurrencyUtils.formatMoneyByCurrency(product.price, product.currency)}
                                    </td>
                                    <td className="font-weight-bold text-center">
                                        {NumberUtils.formatThousand(product.quantity)}
                                    </td>
                                    <td className="font-weight-bold text-center">
                                        {this.renderPromotionPrice(product)}
                                    </td>
                                    <td className="font-weight-bold text-center">
                                        {this.renderTotalPrice(product)}
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                    {this.context.state.promotion &&
                        <div className="text-right mt-4">
                            <h6 className="d-inline font-weight-bold">
                                <GSTrans t="page.order.create.cart.promotionCode"/>
                            </h6>
                            <span className="font-size-16px text-uppercase background-color-lightgray px-5 py-2 ml-3">
                                {this.context.state.promotion.couponCode}
                            </span>
                        </div>
                    }
                </div>
                {/*CUSTOMER INFO*/}
                {this.isShowCustomerInformation() && <div className=" mt-5">
                    <h5 className="text-uppercase">
                        <GSTrans t="page.order.create.print.customerInformation"/>
                    </h5>
                    <div className="row p-0 mt-4">
                        {!_.isEmpty(this.context.state.buyerInfo.contactName) && <div className="col-4 pl-0">
                            <h6>
                                <GSTrans t="page.setting.accountInfo.fullName"/>
                            </h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.contactName}
                            </p>
                        </div>
                        }
                        {!_.isEmpty(this.context.state.buyerInfo.phoneNumber) && <div className="col-4">
                            <h6>
                                <GSTrans t="page.reservation.detail.phone_number"/>
                            </h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.phoneNumber}
                            </p>
                        </div>
                        }
                        {!_.isEmpty(this.context.state.buyerInfo.email) && <div className="col-4 pr-0">
                            <h6>Email</h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.email}
                            </p>
                        </div>
                        }
                    </div>
                    <div className="row p-0 mt-4">
                        {!_.isEmpty(this.context.state.buyerInfo.address) && <div className="col-3 pl-0">
                            <h6>
                                <GSTrans t="page.order.detail.billingAddress.address"/>
                            </h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.address}
                            </p>
                        </div>
                        }
                        {!_.isEmpty(this.context.state.buyerInfo.wardName) && <div className="col-3">
                            <h6>
                                <GSTrans t="common.txt.street.ward"/>
                            </h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.wardName}
                            </p>
                        </div>
                        }
                        {!_.isEmpty(this.context.state.buyerInfo.districtName) && <div className="col-3">
                            <h6>
                                <GSTrans t="common.txt.street.district"/>
                            </h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.districtName}
                            </p>
                        </div>
                        }
                        {!_.isEmpty(this.context.state.buyerInfo.cityName) && <div className="col-3 pr-0">
                            <h6>
                                <GSTrans t="page.setting.bankInfo.cityProvince"/>
                            </h6>
                            <p className="order-in-store-purchase-printer__gray-field">
                                {this.context.state.buyerInfo.cityName}
                            </p>
                        </div>
                        }
                    </div>
                </div>
                }
                {/*PAYMENT*/}
                <div className="row mt-5 p-0">
                    <div className="col-3 pl-0">
                        <h5 className="text-uppercase">
                            <GSTrans t="page.order.create.print.paymentMethod"/>
                        </h5>
                    </div>
                    <div className="col-9 pr-0 font-size-16px">
                        <GSTrans t={`page.order.create.print.paymentMethod.${this.context.state.paymentMethod}`}/>
                    </div>
                </div>
                {/*SHIPPING*/}
                <div className="row mt-2 p-0">
                    <div className="col-3 pl-0">
                        <h5 className="text-uppercase">
                            <GSTrans t="page.order.create.print.shippingMethod"/>
                        </h5>
                    </div>
                    <div className="col-9 pr-0 font-size-16px">
                        <GSTrans t={`page.order.create.print.shippingMethod.${this.context.state.shippingInfo.method}`}/>
                    </div>
                </div>
                {/*TOTAL PRICE*/}
                <div className="background-color-lightgray text-right p-3 mt-5 font-size-16px">
                    <div className="row mb-3">
                        <div className="col-9 text-right text-uppercase pl-0 font-weight-bold">
                            <GSTrans t="page.order.create.print.subTotalOrdersAmount"/>:
                        </div>
                        <div className="col-3 text-right pr-0">
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInStorePurchaseContextService.calculateSubTotalPrice(this.context.state.productList),
                                CurrencySymbol.VND
                            )}
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-9 text-right text-uppercase pl-0 font-weight-bold">
                            <GSTrans t="page.setting.shippingAndPayment.shippingFee"/>:
                        </div>
                        <div className="col-3 text-right pr-0">
                            {CurrencyUtils.formatMoneyByCurrency(this.context.state.shippingInfo? this.context.state.shippingInfo.amount:0, CurrencySymbol.VND)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9 text-right text-uppercase pl-0 font-weight-bold">
                            <GSTrans t="page.order.create.print.totalAmount"/>:
                        </div>
                        <div className="col-3 text-right pr-0 font-weight-bold">
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInStorePurchaseContextService.calculateTotalPrice(this.context.state),
                                CurrencySymbol.VND)
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Template.contextType = OrderInStorePurchaseContext.context



OrderInStorePurchasePrinter.propTypes = {

};

export default OrderInStorePurchasePrinter;
