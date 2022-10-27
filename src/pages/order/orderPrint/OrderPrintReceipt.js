/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/

import React from 'react';
import './orderPrintReceipt.sass';
import i18next from 'i18next';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';
import {Trans} from 'react-i18next';
import moment from 'moment';
import {CurrencyUtils} from '../../../utils/number-format';
import authenticate from '../../../services/authenticate';
import {OrderService} from '../../../services/OrderService';
import {BCOrderService} from '../../../services/BCOrderService';
import Constants from '../../../config/Constant';
import {OrderDetailUtils} from '../../../utils/order-detail-utils';
import {CurrencySymbol} from '../../../components/shared/form/CryStrapInput/CryStrapInput';
import {AddressUtils} from '../../../utils/address-utils'

export default class OrderPrintReceipt extends React.Component {
    _isMounted = false;
    state = {
        isFetching: true,
        orderObj: null,
        orderObj2: null
    };

    constructor(props) {
        super(props);
        this.buildDiscountPrice = this.buildDiscountPrice.bind(this);
        this.calcDiscountPrice = this.calcDiscountPrice.bind(this);
        this.checkDiscountInLine = this.checkDiscountInLine.bind(this);
        this.getTotalOfDiscount = this.getTotalOfDiscount.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.storeId = authenticate.getStoreId();
        let {siteCode, orderId} = this.props.match.params;
        siteCode = siteCode.toUpperCase();

        Promise.all([OrderService.getOrderDetail(siteCode, orderId), BCOrderService.getBcOrderDetail(orderId)])
            .then( results => {
                if (this._isMounted) {
                    //===================OBJ1=====================//
                    this.setState({
                        orderObj: results[0]
                    })

                    //===================OBJ2=====================//
                    const result2 = results[1]
                    this.buildAddress('shippingAddress',
                        result2.deliveryInfo["address"],
                        result2.deliveryInfo["districtCode"],
                        result2.deliveryInfo["wardCode"],
                        result2.deliveryInfo["locationCode"]
                    );

                    this.buildAddress('pickupAddress',
                        result2.pickUpAddress["address"],
                        result2.pickUpAddress["districtCode"],
                        result2.pickUpAddress["wardCode"],
                        result2.pickUpAddress["locationCode"]
                    );

                    this.currency = result2.currency;
                    this.setState({
                        orderObj2: result2,
                        isFetching: false,
                        siteCode: siteCode
                    });

                    setTimeout(function () {
                        window.print();
                    }, 1000);
                }
                
            })
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    renderDeliveryName(deliveryName) {
        if (deliveryName === 'selfdelivery') {
            return i18next.t("page.order.detail.information.shippingMethod.self")
        }else if(deliveryName === 'ahamove_truck'){
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_TRUCK")
        }else if(deliveryName === 'ahamove_bike'){
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_BIKE")
        }
        return deliveryName
    }

    buildAddress(field, address, districtCode, wardCode, cityCode) {
        return AddressUtils.buildAddress(address, districtCode, wardCode, cityCode)
            .then(address => {
                const newState = {
                    [field]: address
                }

                this.setState(newState)

                return newState
            })
    }

    buildDiscountPrice() {
        if (this.state.orderObj.orderInfo.discount && (this.state.orderObj.orderInfo.discount.discountId || this.state.orderObj.orderInfo.discount.discountType === 'WHOLE_SALE')) { // => use gosell discount code
            return CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.discount.totalDiscount, this.currency)
        } else {
            return CurrencyUtils.formatMoneyByCurrency(this.calcDiscountPrice(), this.currency); // default discount
        }
    }

    calcDiscountPrice() {
        let sumOrg = 0, sumDiscount = 0;
        for (let items of this.state.orderObj.items) {
            sumOrg += items.orgPrice;
            sumDiscount += items.price
        }
        return sumOrg - sumDiscount
    }

    checkDiscountInLine(item) {
        const itemId = item.itemId + "_" + item.variationId
        let promotionAmount = 0;

        // if have coupon
        if(this.state.orderObj2.gsOrderCoupons && this.state.orderObj2.gsOrderCoupons.length > 0){
            this.state.orderObj2.gsOrderCoupons.forEach(element => {
                const itemIdT = element.itemId + "_" + element.modelId 
                if(itemId === itemIdT){
                    promotionAmount = element.promoAmount
                }
            });
        }else if(this.state.orderObj2.gsOrderWholesales && this.state.orderObj2.gsOrderWholesales.length > 0){
            this.state.orderObj2.gsOrderWholesales.forEach(element => {
                const itemIdT = element.itemId + "_" + element.modelId 
                if(itemId === itemIdT){
                    promotionAmount = element.promoAmount
                }
            });
        }

        return promotionAmount; 
    }

    getTotalOfDiscount() {
        let promotionAmount = 0;

        // if have coupon
        if(this.state.orderObj2.gsOrderCoupons && this.state.orderObj2.gsOrderCoupons.length > 0){
            this.state.orderObj2.gsOrderCoupons.forEach(element => {
                promotionAmount += element.promoAmount
            });
        }else if(this.state.orderObj2.gsOrderWholesales && this.state.orderObj2.gsOrderWholesales.length > 0){
            this.state.orderObj2.gsOrderWholesales.forEach(element => {
                promotionAmount += element.promoAmount
            });
        }

        return promotionAmount;
    }

    render() {
        return(
            <>
                {this.state.isLoadingScreen &&
                <LoadingScreen/>}
                
                <GSContentContainer className="order-print-receipt-page" isLoading={this.state.isFetching}>
                    { (this.state.orderObj!== null && this.state.orderObj2!== null) &&
                    <GSContentBody size={GSContentBody.size.MEDIUM}>
                        <div className="row head-line">
                            <div className="col-6">
                                <div>
                                    <span className="title text-upper-case"><Trans i18nKey={"page.order.print.orderCode"}/></span>
                                    <span className="content">
                                        #{this.state.orderObj.orderInfo.orderId}
                                    </span>
                                </div>
                                <div>
                                    <span className="title text-upper-case"><Trans i18nKey={"page.order.print.createdDate"}/></span>
                                    <span className="content">
                                        {moment(this.state.orderObj.orderInfo.createdDate).format('DD/MM/YYYY hh:mm')}
                                    </span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div>
                                    <span className="title text-upper-case"><Trans i18nKey={"page.order.print.shipping_method"}/></span>
                                    <span className="content">
                                        {
                                            this.state.orderObj.orderInfo.deliveryName && 
                                            this.renderDeliveryName(this.state.orderObj.orderInfo.deliveryName)
                                        }
                                        {
                                            (!this.state.orderObj.orderInfo.deliveryName  && !this.state.orderObj.shippingInfo.address1)
                                            && i18next.t('page.order.create.print.shippingMethod.IN_STORE')
                                        }
                                    </span>
                                </div>
                                <div>
                                    <span className="title text-upper-case"><Trans i18nKey={"page.order.print.payment_method"}/></span>
                                    <span className="content">
                                        <Trans i18nKey={"page.order.detail.information.paymentMethod." + this.state.orderObj.orderInfo.paymentMethod}/>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-6">
                                <div className="seller-name with__background pal-10" style={{backgroundColor: "#cbcccb"}}>
                                    <Trans i18nKey="page.order.print.seller"/> {this.state.orderObj2.seller.displayName}
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="buyer-name with__background pal-10">
                                    <Trans i18nKey="page.order.print.customer"/>  {this.state.orderObj2.deliveryInfo.contactName}
                                </div>
                            </div>
                        </div>

                        {/* PHONE */}
                        <div className="row">
                            <div className="col-6">
                                <div className="row">
                                    <div className="col-4 pal-10 title">
                                        <Trans i18nKey="page.order.print.phone"/>
                                    </div>
                                    <div className="col-8 ">
                                        {this.state.orderObj2.seller.contactNumber}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="row">
                                    <div className="col-4 pal-10 title">
                                        <Trans i18nKey="page.order.print.phone"/>
                                    </div>
                                    <div className="col-8">
                                        {this.state.orderObj2.deliveryInfo.phoneNumber}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="row mar-b-20">
                            <div className="col-6">
                                <div className="row">
                                    <div className="col-4 pal-10 title">
                                        <Trans i18nKey="page.order.print.address"/>
                                    </div>
                                    <div className="col-8">
                                        {this.state.pickupAddress}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="row">
                                    <div className="col-4 pal-10 title">
                                        <Trans i18nKey="page.order.print.address"/>
                                    </div>
                                    <div className="col-8">
                                        {(!this.state.orderObj.orderInfo.deliveryName  && !this.state.orderObj.shippingInfo.address1) ? "" : this.state.shippingAddress}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4 pal-10 title">
                                        <Trans i18nKey="page.order.print.email"/>
                                    </div>
                                    <div className="col-8">
                                        {this.state.orderObj2.deliveryInfo.email}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4 pal-10 title">
                                        <Trans i18nKey="page.order.print.note"/>
                                    </div>
                                    <div className="col-8">
                                        {this.state.orderObj2.note}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ITEM LIST */}
                        {/* <div className="row">
                            <div className="col-4 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.product_name"/></div>
                            <div className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.product_price"/></div>
                            <div className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.product_dis_price"/></div>
                            <div className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.quantity"/></div>
                            <div className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.price_total"/></div>
                        </div> */}
                        <table style={{width : "100%"}} className="order-print-break">
                            <thead>
                                <tr className="row">
                                    
                                        <td className="col-6 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.product_name"/></td>
                                        <td className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.product_price"/></td>
                                        <td className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.quantity"/></td>
                                        <td className="col-2 with__background text-upper-case header"><Trans i18nKey="page.order.print.table.price_total"/></td>
                                    
                                </tr>
                                </thead>
                            <tbody>
                                {this.state.orderObj.items.map( (item, index) => {
                                    // const discount = this.checkDiscountInLine(item)
                                    return (
                                            <tr className="row item-row">
                                            
                                                    <td className="col-6 body">
                                                        <div className="product-name">
                                                            <span className="name">{item.name}</span>
                                                            <span className="variation">{item.variationName ? item.variationName.replace('|' + Constants.DEPOSIT_CODE.FULL, '').split('|').join(' / ') : ''}</span>
                                                        </div>
                                                    </td>
                                                    <td className="col-2 text-center body">{CurrencyUtils.formatMoneyByCurrency(item.price, this.currency)}</td>
                                                    <td className="col-2 text-center body">{CurrencyUtils.formatThousand(item.quantity)}</td>
                                                    <td className="col-2 text-center body">{CurrencyUtils.formatMoneyByCurrency(item.price * item.quantity, this.currency) }</td>
                                            
                                            </tr>
                                    )}
                                )}
                            </tbody>
                        </table>

                        <div className="row with__background mar-t-30 order-print-break">
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-8 text-right title text-upper-case">
                                        {/* <Trans i18nKey="page.order.print.summary.subtotal"/> */}
                                        <Trans i18nKey="page.order.detail.items.subTotal"/>
                                    </div>
                                    <div className="col-4 text-right par-10">
                                        {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.subTotal - this.getTotalOfDiscount(), this.currency) }
                                    </div>
                                </div>
                            </div>
                            {   (this.state.orderObj.orderInfo.discount
                                                && this.state.orderObj.orderInfo.discount.discountId
                                                && this.state.orderObj.orderInfo.discount.discountType === "COUPON") &&
                                <div className="col-12">
                                <div className="row">
                                    <div className="col-8 text-right title text-upper-case">
                                        <Trans i18nKey="component.discount.label.coupon"/>
                                    </div>
                                    <div className="col-4 text-right par-10">
                                        <div>{this.state.orderObj.orderInfo.discount.discountCode}</div>     
                                    </div>
                                </div>
                                </div>
                            }
                            {OrderDetailUtils.calcOrderDiscount(this.state.orderObj) > 0 &&
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-8 text-right title text-upper-case">
                                        <Trans i18nKey="page.order.detail.items.discount"/>
                                        {this.state.orderObj.orderInfo.discount.discountType === 'WHOLE_SALE' && ` (${i18next.t("component.discount.label.wholesale")})`}
                                    </div>
                                    <div className="col-4 text-right par-10">
                                        {'- '}{CurrencyUtils.formatMoneyByCurrency(OrderDetailUtils.calcOrderDiscount(this.state.orderObj), CurrencySymbol.VND)}
                                    </div>
                                </div>
                            </div>
                            }
                            {/*SHIPPING FEE*/}
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-8 text-right title text-upper-case">
                                        {/* <Trans i18nKey="page.order.print.summary.shipping"/> */}
                                        <Trans i18nKey="page.order.detail.items.shippingFee"/>
                                    </div>
                                    <div className="col-4 text-right par-10">
                                        { this.state.orderObj.orderInfo.shippingFee < this.state.orderObj.orderInfo.originalShippingFee &&
                                            <span className={'shipping-fee-original'}>{CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.originalShippingFee, this.currency)}</span>
                                        }
                                        {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.shippingFee, this.currency)}
                                    </div>
                                </div>
                            </div>
                            {/*TOTAL*/}
                            <div className="col-12 total-amount">
                                <div className="row">
                                    <div className="col-8 text-right title text-upper-case">
                                        {/* <Trans i18nKey="page.order.print.summary.total_amount"/> */}
                                        <Trans i18nKey="page.order.detail.items.total"/>
                                    </div>
                                    <div className="col-4 text-right par-10">
                                        {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.totalPrice, this.currency)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                        


                    </GSContentBody>}
                </GSContentContainer>
            </>
        )
    }
}
