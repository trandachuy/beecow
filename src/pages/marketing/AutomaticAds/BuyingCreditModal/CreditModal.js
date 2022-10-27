/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/07/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";

import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";

import GSTrans from "../../../../components/shared/GSTrans/GSTrans";

import './CreditModal.sass'
import {Trans} from "react-i18next";
import facebookService from "../../../../services/FacebookService";
import i18next from "i18next";
import {UikFormInputGroup, UikRadio} from '../../../../@uik'
import Constants from "../../../../config/Constant";
import {BroadcastChannelUtil} from "../../../../utils/BroadcastChannel";
import {GSToast} from '../../../../utils/gs-toast';
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {CurrencyUtils} from "../../../../utils/number-format";
import {AgencyService} from "../../../../services/AgencyService";


const PAYMENT_TAB = {
    ONLINE: 'online',
    BANK_TRANSFER: 'bankTransfer'
}

const BANK_TRANSFER_EXP_DAYS = 3
class CreditModal extends Component {

    state = {
        currentPaymentTab: PAYMENT_TAB.ONLINE,
        onlineMethod: Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
        packagePriceType : 1,
        isProcessing: false,

        paymentObj : {
            bankTransfer: {
                accountOwner: 'CÔNG TY TNHH MEDIASTEP SOFWARE VIỆT NAM',
                accountNumber: '04201015009138',
                bank: 'Maritime Bank',
                branch: 'Đô Thành',
                content: `${i18next.t('page.order.list.group.orderId')} - ${i18next.language === 'vi'? 'Số điện thoại của bạn':'Your phone number'}`
            },
            bankTransferNonVn: {
                bankName: 'Joint Stock Commercial Bank for Foreign Trade of Vietnam',
                swiftCode: 'BFTVVNVX',
                accountHolderName: 'CTY TNHH MEDIASTEP SOFTWARE VIET NAM',
                accountNumber: '0331370480531',
                content: `${i18next.t('page.order.list.group.orderId')} - ${i18next.language === 'vi'? 'Số điện thoại của bạn':'Your phone number'}`
            },
            online: {
                methods: [Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING, Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD]
            }
        }
    }

    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.switchPaymentTab = this.switchPaymentTab.bind(this);
        this.renderPaymentMethod = this.renderPaymentMethod.bind(this);
        this.selectPackagePrice = this.selectPackagePrice.bind(this);
        this.onPaymentOnline = this.onPaymentOnline.bind(this);
        this.onPaymentBankTransfer = this.onPaymentBankTransfer.bind(this);
        this.onPaymentInCompleted = this.onPaymentInCompleted.bind(this);
        this.onSelectedOnlineMethod = this.onSelectedOnlineMethod.bind(this);
        this.onPaymentCompleted = this.onPaymentCompleted.bind(this);
    }

    

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onClose(action) {

        if(action === 'done'){
            this.setState({
                isProcessing: true
            })

            if (this.state.currentPaymentTab === PAYMENT_TAB.ONLINE) { // online
                this.onPaymentOnline(this.state.packagePriceType)
            }

            if (this.state.currentPaymentTab === PAYMENT_TAB.BANK_TRANSFER) { // bank transfer
                this.onPaymentBankTransfer(this.state.packagePriceType)
            }

        }else if(action === 'cancel'){
            this.props.onClose();
        }
        
    }

    switchPaymentTab(paymentTab) {
        this.setState({
            currentPaymentTab: paymentTab
        })
    }

    selectPackagePrice(packageType){
        this.setState({
            packagePriceType: packageType
        })
    }

    onSelectedOnlineMethod(payment) {
        this.setState({onlineMethod: payment});
    }

    onPaymentOnline(packageId) {
        const paymentMethod = this.state.onlineMethod;
        this.onPayment(packageId, paymentMethod)
            .then(value => {
                if (value.paymentUrl) {
                    window.open(value.paymentUrl, '_blank');
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_BUYING_FACEBOOK_CREDIT_LISTENER);
                    this.channel.onmessage = (evt) => {
                        const result = evt.data;
                        switch (result.event) {
                            case 'success':
                                this.onPaymentCompleted({
                                    total: result.amount,
                                    currency: '₫',
                                    paymentMethod: this.state.onlineMethod,
                                    success: true,
                                    orderId: result.orderId
                                });

                                // mark this order to DB
                                facebookService.markOrderHasMappingWithVnPay(result.orderId, 'success').then(res =>{
                                    this.props.onClose(true);
                                }).catch( e =>{
                                    this.props.onClose(true);
                                })

                                break;

                            case 'cancel' :
                                // mark this order to DB
                                facebookService.markOrderHasMappingWithVnPay(result.orderId, 'cancel').then(res =>{
                                    this.props.onClose(true);
                                }).catch( e =>{
                                    this.props.onClose(true);
                                })

                                break;

                            case 'fail':
                                this.onPaymentCompleted({
                                    success: false
                                });
                                GSToast.commonError();
                                break;
                            default:
                        }
                    }
                }
            })
            .catch(this.onPaymentInCompleted)
    }

    onPaymentBankTransfer(packageId) {
        this.onPayment(packageId, Constants.ORDER_PAYMENT_METHOD_COD)
            .then(value => {

                this.onPaymentCompleted({
                    total: value.totalAmount,
                    currency: '₫',
                    paymentMethod: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
                    success: true,
                    orderId: value.id
                })

                this.props.onClose(true);
                
                GSToast.success(i18next.t('component.automatic_ads.buying_credit.modal.top_up_success'))

            }).catch(this.onPaymentInCompleted)
    }

    onPayment(packageId, paymentMethod) {
        let request = facebookService.doSubscription(packageId, paymentMethod);
        return new Promise((resolve, reject) => request.then(resolve, reject));

    }

    onPaymentCompleted(paymentInfo) {
        // if (this.props.onPaymentCompleted) {
        //     this.props.onPaymentCompleted(paymentInfo)
        // }
    }

    onPaymentInCompleted() {
        // if (this.props.onPaymentInCompleted) {
        //     this.props.onPaymentInCompleted()
        // }
    }

    //-------------------//
    /* Render the layout */
    //-------------------//
    renderPaymentMethod() {
        let paymentOptions = []

        for (let [index, payment] of this.state.paymentObj.online.methods.entries()) {
            if (payment === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment===this.state.onlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img src="/assets/images/setting_plans/payment_methods/visa.svg"/>
                                          <img src="/assets/images/setting_plans/payment_methods/mastercard.svg"/>
                                          <img src="/assets/images/setting_plans/payment_methods/jcb.png"/>
                                      </div>
                                  )
                              }
                              onClick={() => this.onSelectedOnlineMethod(payment)}
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment===this.state.onlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img src="/assets/images/setting_plans/payment_methods/atm.png"/>
                                      </div>
                                  )
                              }
                              onClick={() => this.onSelectedOnlineMethod(payment)}
                    />
                )
            }
        }

        return (
            <UikFormInputGroup direction="horizontal">
                {paymentOptions}
            </UikFormInputGroup>
        )
    }

    render() {
        return (
 
               <Modal isOpen={this.props.showCreditModal} className="buying-credit-modal">
                    <ModalHeader className="credit-header">
                        <div className="header-title">
                            <Trans i18nKey="component.automatic_ads.buying_credit.modal.top_up_credit">
                                Top Up Credit
                            </Trans>
                        </div>
                        <div className="header-sub__title">
                            <Trans i18nKey="component.automatic_ads.buying_credit.modal.subtitle">
                                You can use top-up amount in variety of services on Gosell
                            </Trans>
                        </div>
                        <i 
                            className="btn-close__icon"
                            onClick={() => this.onClose('cancel')}
                        ></i>
                    </ModalHeader>
                    <ModalBody>
                        {/* Current Balance */}
                        <div className="current-balance">
                            <Trans i18nKey="component.automatic_ads.buying_credit.modal.currnet_balance">
                                Current Balance
                            </Trans>{': ' + CurrencyUtils.formatThousand(this.props.dailyBudget) + 'đ'} 
                        </div>

                        {/* Choose Package */}
                        <div className="choose-package">
                            <div className="choose-title">
                                1. <Trans i18nKey="component.automatic_ads.buying_credit.modal.choose_package">
                                        Choose Package
                                    </Trans>
                            </div>
                            <div className="package_price">
                                <span className={this.state.packagePriceType == 1 ? 'choose' : 'un-choose'} onClick={() => this.selectPackagePrice(1)} >5,000,000</span>
                                <span className={this.state.packagePriceType == 2 ? 'choose' : 'un-choose'} onClick={() => this.selectPackagePrice(2)} >10,000,000</span>
                                <span className={this.state.packagePriceType == 3 ? 'choose' : 'un-choose'} onClick={() => this.selectPackagePrice(3)} >20,000,000</span>
                            </div>
                        </div>
                        

                        {/* Choose payment method */}
                        <div className="choose-payment__method">
                            <div className="choose-title">
                                2. <Trans i18nKey="component.automatic_ads.buying_credit.modal.payment_method">
                                        Choose Payment Method
                                    </Trans>
                            </div>
                            <GSWidget className="m-0">
                                <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE}>
                                    <div className="btn-group mb-2 mt-2">
                                        <button className={['btn', this.state.currentPaymentTab === PAYMENT_TAB.ONLINE? 'btn-secondary':'btn-outline-secondary'].join(' ')}
                                                onClick={() => this.switchPaymentTab(PAYMENT_TAB.ONLINE)}>
                                            <Trans i18nKey="component.automatic_ads.buying_credit.modal.payment_online"/>
                                        </button>
                                        <button className={['btn', this.state.currentPaymentTab === PAYMENT_TAB.BANK_TRANSFER? 'btn-secondary':'btn-outline-secondary'].join(' ')}
                                                onClick={() => this.switchPaymentTab(PAYMENT_TAB.BANK_TRANSFER)}>
                                            <Trans i18nKey="component.automatic_ads.buying_credit.modal.bank_transfer"/>
                                        </button>
                                    </div>
                                </GSWidgetHeader>
                                <GSWidgetContent>
                                    {/*ONLINE PAYMENT*/}
                                    {this.state.currentPaymentTab === PAYMENT_TAB.ONLINE &&
                                    <div className="online-payment mb-2 mt-2">
                                        <div className="online-payment__selector">
                                            {this.renderPaymentMethod()}
                                        </div>
                                    </div>
                                    }
                                    {/*BANK TRANSFER*/}
                                    {this.state.currentPaymentTab === PAYMENT_TAB.BANK_TRANSFER &&
                                    <div className="bank-transfer mb-2 mt-2">
                                        <div className="bank-transfer__requirement">
                                            <img src="/assets/images/icon-information.svg"/>
                                            <div className="bank-transfer__req-content-wrapper">
                                                <span className="bank-transfer__req-title">
                                                    <GSTrans t="component.automatic_ads.buying_credit.modal.notice"/>
                                                </span>
                                                <span className="bank-transfer__req-content">
                                                    <GSTrans t="component.automatic_ads.buying_credit.modal.notice_content"/>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bank-transfer__info">
                                            <p>
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                                {this.state.paymentObj.bankTransfer.accountOwner}
                                            </p>
                                            <p>
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                                {this.state.paymentObj.bankTransfer.accountNumber}
                                            </p>
                                            <p>
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                                {this.state.paymentObj.bankTransfer.bank}
                                            </p>
                                            <p>
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                                {this.state.paymentObj.bankTransfer.branch}
                                            </p>
                                            <p>
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                                {this.state.paymentObj.bankTransfer.content}
                                            </p>
                                        </div>
                                    </div>}
                                </GSWidgetContent>
                            </GSWidget>
                        </div>

                        <div className="gs-atm__flex-row--flex-end credit-btn__group">
                            {/* <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => this.onClose('cancel')}>
                                <Trans i18nKey="common.btn.cancel"
                            />
                            </button> */}
                            <GSButton secondary outline onClick={() => this.onClose('cancel')}>
                                <Trans i18nKey="common.btn.cancel" >
                                    Cancel
                                </Trans>
                            </GSButton>
                            <GSButton success marginLeft onClick={() => this.onClose('done')}>
                                <Trans i18nKey="common.btn.done" >
                                    Done
                                </Trans>
                            </GSButton>
                            {/* <UikButton 
                                success 
                                className={"ml-3"}
                                onClick={() => this.onClose('done')}
                            >
                                <Trans i18nKey="common.btn.done"/>
                            </UikButton> */}
                        </div>
                    </ModalBody>
            </Modal>
        );
    }
}


/**
 * onClose: callback function when modal is closed
 * editLinkPrefix: redirect link to edit page when choose product
 */
CreditModal.propTypes = {
    onClose: PropTypes.func
};

export default CreditModal;
