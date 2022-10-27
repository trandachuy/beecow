/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/5/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as queryString from 'query-string';
import Constants from "../../config/Constant";
import {BroadcastChannelUtil} from "../../utils/BroadcastChannel";
import {PaymentResultCodeEnum} from "./PaymentResultCodeEnum";

export const ChaiPayRedirectParams = {
    STATUS_CODE: 'status_code'
}

class CallbackChaiPay extends Component {

    channel;
    countdown;

    constructor(props) {
        super(props);
        const queryParams = queryString.parse(window.location.search);
        this.state = queryParams;
        if (process.env.MODE === 'DEBUG') {
            this.state.count = 30;
        } else {
            this.state.count = 0;
        }
    }

    mapEPayResultCodeToPaymentResultCode(resultCode) {
            switch (resultCode) {
                case "2000":
                    return PaymentResultCodeEnum.SUCCESS;
                default:
                    return PaymentResultCodeEnum.FAILURE;
            }
    }

    getOrderId(orderInfo) {
        orderInfo = orderInfo.replace(/GoSellPackageOrderFacebookCredit|GoSellPackageOrder|GoSellVhtOrder|GoSellBranchOrder|GoSellAccountOrder|GoSellMultiLanguageOrder/gi, '')
        return orderInfo
    }

    componentDidMount() {
        this.countdown = setInterval(() => {
            const responseCode = this.mapEPayResultCodeToPaymentResultCode(this.state[ChaiPayRedirectParams.STATUS_CODE]);
            if (this.state.count > 0) {
                this.setState(prevState => {
                    return {count: prevState.count - 1}
                })
            }
            else {

                let orderInfo = this.state[ChaiPayRedirectParams.DESCRIPTION]
                const amount = +this.state[ChaiPayRedirectParams.AMOUNT]
                const orderId = +this.getOrderId(orderInfo)

                const message = {
                    'event': responseCode === PaymentResultCodeEnum.SUCCESS ? 'success' : responseCode === PaymentResultCodeEnum.CANCELLED ? 'cancel' : 'fail',
                    'amount': amount, // VNPay required
                    'orderId': orderId // Get order package ID
                }

                if(orderInfo.includes('GoSellPackageOrderFacebookCredit')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_BUYING_FACEBOOK_CREDIT_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellPackageOrder')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellVhtOrder')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_CALL_CENTER_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellBranchOrder')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_BRANCH_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellAccountOrder')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_SHOPEE_ACCOUNT_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellMultiLanguageOrder')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_MULTI_LANGUAGE_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                }

                
            }
        }, 1000);
    }

    render() {
        const responseCode = this.mapEPayResultCodeToPaymentResultCode(this.state[ChaiPayRedirectParams.STATUS_CODE]);
        const amount = this.state[ChaiPayRedirectParams.AMOUNT];
        return (
            process.env.MODE !== 'DEBUG' ? <></> :
            responseCode === PaymentResultCodeEnum.SUCCESS ?
                <>
                    <p style={{fontSize: 69}}>🏦</p><p>Tien ve: {amount / 100}</p>
                    <p>Close after {this.state.count} second</p>
                </>
            :
                responseCode === PaymentResultCodeEnum.CANCELLED ?
                <>
                    <p style={{fontSize: 69}}>😞</p><p>Huy bo</p>
                    <p>Close after {this.state.count} second</p>
                </>
            :
                <>
                    <p style={{fontSize: 69}}>💸</p><p>That bai</p>
                    <p>Close after {this.state.count} second</p>
                </>


        );
    }
}

CallbackChaiPay.propTypes = {
    channel: PropTypes.instanceOf(BroadcastChannel)
};

export default CallbackChaiPay;
