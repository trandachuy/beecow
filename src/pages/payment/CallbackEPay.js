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

export const VNPTEPayRedirectParams = {
    TRX_ID : "trxId",
    MER_ID : "merId",
    MER_TRX_ID : "merTrxId",
    RESULT_CD : "resultCd",
    INVOICE_NO : "invoiceNo",
    AMOUNT : "amount",
    CURRENCY : "currency",
    GOODS_NM : "goodsNm",
    PAY_TYPE : "payType",
    DOMESTIC_TOKEN : "domesticToken",
    MERCHANT_TOKEN : "merchantToken",
    TRANS_DT : "transDt",
    TRANS_TM : "transTm",
    BUYER_FIRST_NM : "buyerFirstNm",
    BUYER_LAST_NM : "buyerLastNm",
    TIME_STAMP : "timeStamp",
    INSTMNT_TYPE : "instmntType",
    INSTMNT_MON : "instmntMon",
    CARD_NO : "cardNo",
    BANK_ID : "bankId",
    BANK_NAME : "bankName",
    VA_NUMBER : "vaNumber",
    MER_TEMP_01 : "mer_temp01",
    MER_TEMP_02 : "mer_temp02",
    START_DT : "startDt",
    END_DT : "endDt",
    PAY_TOKEN : "payToken",
    USER_ID : "userId",
    ISSUE_BANK_NAME : "issueBankName",
    CARD_TYPE : "cardType",
    SUBAPPID : "subappid",
    DESCRIPTION: "description"
}

class CallbackEPay extends Component {

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
                case "7": // vnpay
                case "0": // vnpay
                case "00_000": // epay
                    return PaymentResultCodeEnum.SUCCESS;
                case "200":
                case "24":
                    return PaymentResultCodeEnum.CANCELLED;
                default:
                    return PaymentResultCodeEnum.FAILURE;
            }
    }

    getOrderId(orderInfo) {
        orderInfo = orderInfo.replace(/GoSellPackageOrderFacebookCredit|GoSellPackageOrder|GoSellVhtOrder|GoSellBranchOrder|GoSellAccountOrder|GoSellMultiLanguageOrder|GoSellAffiliateOrderReseller|GoSellAffiliateOrderDropship/gi, '')
        return orderInfo
    }

    componentDidMount() {
        this.countdown = setInterval(() => {
            const responseCode = this.mapEPayResultCodeToPaymentResultCode(this.state[VNPTEPayRedirectParams.RESULT_CD]);
            if (this.state.count > 0) {
                this.setState(prevState => {
                    return {count: prevState.count - 1}
                })
            }
            else {

                let orderInfo = this.state[VNPTEPayRedirectParams.DESCRIPTION]
                const amount = +this.state[VNPTEPayRedirectParams.AMOUNT]
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
        const responseCode = this.mapEPayResultCodeToPaymentResultCode(this.state[VNPTEPayRedirectParams.RESULT_CD]);
        const amount = this.state[VNPTEPayRedirectParams.AMOUNT];
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

CallbackEPay.propTypes = {
    channel: PropTypes.instanceOf(BroadcastChannel)
};

export default CallbackEPay;
