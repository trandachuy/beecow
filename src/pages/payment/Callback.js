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
import {CredentialUtils} from "../../utils/credential";

class Callback extends Component {

    channel;
    countdown;

    constructor(props) {
        super(props);
        const queryParams = queryString.parse(window.location.search);
        this.state = queryParams;
        if (process.env.MODE === 'DEBUG') {
            this.state.count = 15;
        } else {
            this.state.count = 0;
        }
    }

    getOrderId(orderInfo) {
        orderInfo = orderInfo.replace(/GoSellPackageOrderFacebookCredit|GoSellPackageOrder|GoSellVhtOrder|GoSellBranchOrder|GoSellAccountOrder|GoSellMultiLanguageOrder|GoSellAffiliateOrderReseller|GoSellAffiliateOrderDropship/gi, '')
        return orderInfo
    }

    getStatus(){
        const responseCode = this.state.vnp_ResponseCode || this.state.resultCode;

        const paypalSuccessCode = responseCode == '0';
        const paypalCancelCode = responseCode == '200';

        const vnpaySucessCode = responseCode == '00' || responseCode == '07';
        const vnpayCancelCode = responseCode == '24';

        return paypalSuccessCode || vnpaySucessCode ? 'success' : vnpayCancelCode || paypalCancelCode ? 'cancel' : 'fail';
    }

    componentDidMount() {
        this.countdown = setInterval(() => {
            if (this.state.count > 0) {
                this.setState(prevState => {
                    return {count: prevState.count - 1}
                })
            }
            else {
                const status = this.getStatus();
                const currencySymbol = CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM ? 'đ' : '$'
                let orderInfo = this.state.vnp_OrderInfo || this.state.itemName
                const amount = +this.state.vnp_Amount / 100 || +this.state.amount[0]
                const orderId = +this.getOrderId(orderInfo)

                const message = {
                    'event': status,
                    'amount': amount, // VNPay required
                    'orderId': orderId, // Get order package ID
                    'symbol': currencySymbol
                }

                if(orderInfo.indexOf('GoSellPackageOrderFacebookCredit') > -1){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_BUYING_FACEBOOK_CREDIT_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.indexOf('GoSellPackageOrder') > -1){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.indexOf('GoSellVhtOrder') > -1){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_CALL_CENTER_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.indexOf('GoSellBranchOrder') > -1){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_BRANCH_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellAccountOrder')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_SHOPEE_ACCOUNT_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.indexOf('GoSellMultiLanguageOrder') > -1){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_MULTI_LANGUAGE_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellAffiliateOrderReseller')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_AFFILIATE_RESELLER_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                } else if(orderInfo.includes('GoSellAffiliateOrderDropship')){
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_AFFILIATE_DROP_SHIP_LISTENER);
                    this.channel.postMessage(message);
                    this.channel.close();
                    window.close();
                }
            }
        }, 1000);
    }

    render() {
        const responseCode = +this.state.vnp_ResponseCode;
        const amount = this.state.vnp_Amount;
        return (
            process.env.MODE !== 'DEBUG' ? <></> :
            responseCode === 0 || responseCode === 7 ?
                <>
                    <p style={{fontSize: 69}}>🏦</p><p>Tien ve: {amount / 100}</p>
                    <p>Close after {this.state.count} second</p>
                </>
            :
            responseCode === 24 ?
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

Callback.propTypes = {
    channel: PropTypes.instanceOf(BroadcastChannel)
};

export default Callback;
