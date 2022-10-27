/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikFormInputGroup, UikRadio} from '../../../../@uik';
import {Trans} from 'react-i18next';
import './SettingPlansStep2.sass';
import {CurrencyUtils} from '../../../../utils/number-format';
import Constants from '../../../../config/Constant';
import beehiveService from '../../../../services/BeehiveService';
import storageService from '../../../../services/storage';
import {BroadcastChannelUtil} from '../../../../utils/BroadcastChannel';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import {GSToast} from '../../../../utils/gs-toast';
import {CredentialUtils} from '../../../../utils/credential';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import GSFakeLink from '../../../../components/shared/GSFakeLink/GSFakeLink';

const PAYMENT_TAB = {
    ONLINE: 'online',
    BANK_TRANSFER: 'bankTransfer'
}

const BANK_TRANSFER_EXP_DAYS = 3

class SettingPlansStep2 extends Component {
    LINK_TO_BANK_TRANSFER = '/bank'
    LINK_TO_ONLINE_PAYMENT = '/online-payment'

    /*
        selectedPricingPlan:
            1. 1 months
            2. 12 months
            3. 24 month
        */

    PLAN_60M = 4
    PLAN_24M = 3
    PLAN_12M = 2
    PLAN_1M = 1

    state = {
        selectedOption: 0,
        isBankTransferTabShow: false,
        isBankTransferFadeOut: false,
        isOnlinePaymentTabShow: true,
        isOnlinePaymentFadeOut: true,
        currentPackage: 0,
        onlineMethod: CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM ?
            Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD : Constants.ORDER_PAYMENT_METHOD_PAYPAL,
        currentPaymentTab: PAYMENT_TAB.ONLINE,
        isProcessing: false,

        remainDays: 0,
        reduceAmount: 0,
        allowOnline: true,
        isGetCurrentPlanCompleted: false,
        currentPlanIdList: []

    }

    channel;

    constructor(props) {
        super(props);

        this.formatMoney = this.formatMoney.bind(this);
        this.onSelected = this.onSelected.bind(this);
        this.renderPlanVatTax = this.renderPlanVatTax.bind(this);
        this.renderPaymentMethod = this.renderPaymentMethod.bind(this);
        this.onPaymentCompleted = this.onPaymentCompleted.bind(this);
        this.toggleOnlinePayment = this.toggleOnlinePayment.bind(this);
        this.toggleBankTransfer = this.toggleBankTransfer.bind(this);
        this.onPaymentInCompleted = this.onPaymentInCompleted.bind(this);
        this.onPaymentBankTransfer = this.onPaymentBankTransfer.bind(this);
        this.onSelectedOnlineMethod = this.onSelectedOnlineMethod.bind(this);
        this.onPaymentOnline = this.onPaymentOnline.bind(this);
        this.findMonthByExpiredId = this.findMonthByExpiredId.bind(this);
        this.renderExpiredSelector = this.renderExpiredSelector.bind(this);
        this.switchPaymentTab = this.switchPaymentTab.bind(this);
        this.getCalculationRedundance = this.getCalculationRedundance.bind(this)
    }

    getCalculationRedundance(expiredId) {

        if (CredentialUtils.getIsWizard()) {
            return;
        }

        const request = {
            expiredId: expiredId,
            locale: storageService.get(Constants.STORAGE_KEY_LANG_KEY),
            packageId: this.props.selectedPlan.id,
            paymentMethod: "COD",
            userId: CredentialUtils.getStoreOwnerId()
        }

        beehiveService.calculateRedundance(request).then(result => {
            this.setState({
                remainDays: result.remainDays ? result.remainDays : 0,
                reduceAmount: result.reduceAmount
            })

            // check tab payment method when the money change
            const totalPay = this.props.selectedPlan[`tp${expiredId}`] - result.reduceAmount
            if (totalPay < 50000) {
                // Bank transfer only
                this.setState({
                    onlineMethod: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
                    currentPaymentTab: PAYMENT_TAB.BANK_TRANSFER,
                    allowOnline: false
                })
            } else {
                // enable online payment method
                this.setState({
                    onlineMethod: Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
                    allowOnline: true
                })
            }

        }).catch(e => {
            GSToast.commonError()
        })
    }


    formatMoney(money) {
        return CurrencyUtils.formatMoneyByCurrency(money, this.props.selectedPlan.currency)
    }

    renderPlanVatTax() {

        return (
            <div className="plan-calculation">
                <div className="calculation-row summary">
                    <div className="calculation-left font-bold">
                        <Trans i18nKey="page.setting.plans.step2.summary.title"></Trans>
                    </div>
                    <div className="calculation-right color-purple font-bold upper-all">
                        {this.props.selectedPlan.name}
                    </div>
                </div>
                <div className="calculation-row new-plan">
                    <div className="calculation-left color-grey">
                        <Trans i18nKey="page.setting.plans.step2.summary.subtotal"></Trans>
                    </div>
                    <div className="calculation-right">
                        {
                            this.formatMoney(this.props.selectedPlan[`sub${this.state.selectedOption}`])
                        }
                    </div>
                </div>
                <div className="calculation-row redundance">
                    <div className="calculation-left">
                        <div className="color-grey">
                            <Trans
                                i18nKey="page.setting.plans.step2.summary.vat">VAT</Trans>&nbsp;(<span>{this.props.selectedPlan[`vatrate${this.state.selectedOption}`] * 100}%</span>)
                        </div>
                    </div>
                    <div className="calculation-right">
                        {
                            this.formatMoney(this.props.selectedPlan[`vat${this.state.selectedOption}`])
                        }
                    </div>
                </div>
                <div className="calculation-row total">
                    <div className="calculation-left font-bold">
                        <div><Trans i18nKey="page.setting.plans.step2.summary.total"></Trans></div>
                    </div>
                    <div className="calculation-right font-bold color-purple">
                        {
                            this.formatMoney(this.props.selectedPlan[`tp${this.state.selectedOption}`] - this.state.reduceAmount > 0
                                ? this.props.selectedPlan[`tp${this.state.selectedOption}`] - this.state.reduceAmount
                                : 0)
                        }
                    </div>
                </div>
            </div>

        )
    }

    renderPaymentMethod() {
        let paymentOptions = []

        for (let [index, payment] of this.props.paymentObj.online.methods.entries()) {
            if (payment === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === this.state.onlineMethod}
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
                              defaultChecked={payment === this.state.onlineMethod}
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
            if (payment === Constants.ORDER_PAYMENT_METHOD_ZALO) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === this.state.onlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className={'zalo'} src="/assets/images/payment_method/zalopay.png"/>
                                      </div>
                                  )
                              }
                              onClick={() => this.onSelectedOnlineMethod(payment)}
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_MOMO) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === this.state.onlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className={'momo'} src="/assets/images/payment_method/momo.png"/>
                                      </div>
                                  )
                              }
                              onClick={() => this.onSelectedOnlineMethod(payment)}
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_PAYPAL){
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === this.state.onlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className="payment__method-image"
                                               src={"/assets/images/payment_method/paypal.svg"}
                                               alt={'paypal'}
                                               height={'25'}
                                          />
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

    findMonthByExpiredId(expiredId) {
        const pricingPlans = this.props.dataObj.pricingPlans
        return pricingPlans.filter(plan => plan.expiredId === expiredId).map(plan2 => plan2.month)
    }

    renderExpiredSelector() {
        const expiredList = this.props.dataObj.pricingPlans
        let expList = []
        for (let [index, exp] of expiredList.entries()) {
            const months = this.findMonthByExpiredId(exp.expiredId)
            const currency = this.props.selectedPlan.currency

            expList.push(
                <UikRadio
                    key={index}
                    defaultChecked={this.props.selectedPricingPlan === exp.expiredId}
                    name="pricing"
                    onClick={() => this.onSelected(exp.expiredId)}
                    className={"gs-atm__padding--1em plan-info__price-option "
                    + (this.state.selectedOption === exp.expiredId ? '' : 'plan-info__price-option--unchecked')}
                    label={(
                        <Trans i18nKey="page.setting.plans.step2.options.months"
                               values={{
                                   price: CurrencyUtils.formatMoneyByCurrency(
                                       this.props.selectedPlan[`p${exp.expiredId}`],
                                       currency),
                                   tPrice: CurrencyUtils.formatMoneyByCurrency(
                                       this.props.selectedPlan[`sub${exp.expiredId}`],
                                       currency),
                                   month: months
                               }}>
                        </Trans>
                    )}
                />
            )
        }

        return expList
    }

    render() {

        return (
            <div className="setting-plans-step2 gs-ani__fade-in">
                {/*{this.state.isProcessing && <LoadingScreen/>}*/}
                <div className="widget__title">
                    <GSTrans t="page.setting.plans.step2.title.1"/>
                </div>
                {

                    // <div className="mobile-plan-info__plan-image gs-atm__border--radius d-mobile-block d-desktop-none">
                    //     <div className="mobile-plan-card__title-block">
                    //         {this.renderPlanImage('m', this.props.selectedPlan.name)}
                    //     </div>
                    // </div>
                }

                <div className="plan-info mb-5 flex-column flex-md-row">
                    <div className="plan-info__price-selector gs-atm__border--radius">
                        <UikFormInputGroup>

                            {this.renderExpiredSelector()}

                        </UikFormInputGroup>
                    </div>

                    <div
                        className="plan-info__plan-image gs-atm__border--radius d-mobile-block d-desktop-block ml-0 ml-md-3">
                        <div className="plan-card__title-block">
                            {this.renderPlanVatTax()}
                        </div>
                    </div>

                </div>
                <div className="widget__title">
                    <GSTrans t="page.setting.plans.step2.title.2"/>
                </div>
                <GSWidget className="m-0">
                    <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE}>
                        <div className="btn-group mb-2 mt-2">
                            <button
                                className={['btn', this.state.currentPaymentTab === PAYMENT_TAB.ONLINE ? 'btn-secondary' : 'btn-outline-secondary'].join(' ')}
                                onClick={() => this.switchPaymentTab(PAYMENT_TAB.ONLINE)}>
                                <span className="d-desktop-inline d-mobile-none">
                                    <Trans i18nKey="page.setting.plans.step2.onlinePayment"/>
                                </span>
                                    <span className="d-desktop-none d-mobile-inline">
                                    <Trans i18nKey="page.setting.plans.step2.onlinePayment.mobile"/>
                                </span>
                                </button>

                            <button
                                style={CredentialUtils.getStoreCountryCode() !== Constants.CountryCode.VIETNAM ? {cursor:'default'} : {}}
                                className={['btn', this.state.currentPaymentTab === PAYMENT_TAB.BANK_TRANSFER ? 'btn-secondary' : 'btn-outline-secondary'].join(' ')}
                                onClick={() => this.switchPaymentTab(PAYMENT_TAB.BANK_TRANSFER)}>
                                <span className="d-desktop-inline d-mobile-none">
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer"/>
                                </span>
                                <span className="d-desktop-none d-mobile-inline">
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.mobile"/>
                                </span>
                            </button>
                        </div>
                    </GSWidgetHeader>

                    <GSWidgetContent>

                        {/*// TAB CONTENT*/}

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
                                <img src="/assets/images/setting_plans/icon-alert.svg"/>
                                <div className="bank-transfer__req-content-wrapper">
                                    <span className="bank-transfer__req-title">
                                        <GSTrans t="page.setting.plans.step2.bankTransfer.req.title"/>
                                    </span>
                                    <span className="bank-transfer__req-content">
                                        <GSTrans t="page.setting.plans.step2.bankTransfer.req.content" values={{
                                            days: BANK_TRANSFER_EXP_DAYS
                                        }}/>
                                    </span>
                                </div>
                            </div>
                            {CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM &&
                            <div className="bank-transfer__info">
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                    {this.props.paymentObj.bankTransfer.accountOwner}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                    {this.props.paymentObj.bankTransfer.accountNumber}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                    {this.props.paymentObj.bankTransfer.bank}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                    {this.props.paymentObj.bankTransfer.branch}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                    {this.props.paymentObj.bankTransfer.content}
                                </p>
                            </div>
                            }
                            {CredentialUtils.getStoreCountryCode() !== Constants.CountryCode.VIETNAM &&
                            <div className="bank-transfer__info">
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.bankName"/>
                                    {this.props.paymentObj.bankTransferNonVn.bankName}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.swiftCode"/>
                                    {this.props.paymentObj.bankTransferNonVn.swiftCode}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountHolderName"/>
                                    {this.props.paymentObj.bankTransferNonVn.accountHolderName}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumberNonVn"/>
                                    {this.props.paymentObj.bankTransferNonVn.accountNumber}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                    {this.props.paymentObj.bankTransferNonVn.content}
                                </p>
                            </div>
                            }
                            {/*<UikButton success Component={Link} to={this.LINK_TO_BANK_TRANSFER} target="_blank">*/}
                            {/*    <Trans i18nKey="page.setting.plans.step2.btn.pay"/>*/}
                            {/*</UikButton>*/}

                        </div>}
                    </GSWidgetContent>
                </GSWidget>

                <div
                    className="d-flex justify-content-md-between justify-content-center flex-md-row flex-column-reverse align-items-md-center  mt-4">
                    <GSFakeLink onClick={this.props.onBack} style={{color: 'gray'}}
                                className="mt-2 mt-md-0 align-self-center align-self-md-auto">
                        <FontAwesomeIcon
                            className="btn-back__icon"
                            icon="arrow-alt-circle-left"
                        />
                        {' '}
                        <GSTrans t="common.btn.back"/>
                    </GSFakeLink>
                    <div className="d-flex justify-content-center flex-grow-1">
                        <GSButton success
                                  disabled={!this.state.isGetCurrentPlanCompleted}
                                  className="btn-pay"
                                  onClick={() => {
                                      this.setState({
                                          isProcessing: true
                                      })
                                      if (this.state.currentPaymentTab === PAYMENT_TAB.ONLINE) { // online
                                          this.onPaymentOnline(
                                              this.props.selectedPlan.id,
                                              this.state.selectedOption
                                          )
                                      }
                                      if (this.state.currentPaymentTab === PAYMENT_TAB.BANK_TRANSFER) { // bank transfer
                                          this.onPaymentBankTransfer(
                                              this.props.selectedPlan.id,
                                              this.state.selectedOption)
                                      }
                                  }
                                  }
                        >
                            <Trans i18nKey="page.setting.plans.step2.btn.pay"/>
                        </GSButton>
                    </div>


                </div>
            </div>
        );
    }

    switchPaymentTab(paymentTab) {
        this.setState({
            currentPaymentTab: paymentTab
        })
    }

    toggleBankTransfer() {
        setTimeout(() => {

        }, 500)
        this.setState({
            isBankTransferTabShow: !this.state.isBankTransferTabShow
        })
    }

    toggleOnlinePayment() {
        this.setState({
            isOnlinePaymentTabShow: !this.state.isOnlinePaymentTabShow
        })
    }

    componentWillUnmount() {
        if (this.channel) {
            this.channel.close();
        }
    }

    componentDidMount() {
        this.setState({
            selectedOption: this.props.selectedPricingPlan,
            currentPackage: storageService.get(Constants.STORAGE_KEY_PLAN_ID)
        });

        beehiveService.getCurrentPlanList()
            .then(packageList => {
                const packageListId = packageList.map(p => p['userFeature'].packageId)
                this.setState({
                    currentPlanIdList: packageListId
                })
            })
            .catch(e => {

            })
            .finally(() => {
                this.setState({
                    isGetCurrentPlanCompleted: true
                })
            })

        //this.getCalculationRedundance(this.props.selectedPricingPlan);
    }

    onSelected(option) {
        this.setState({
            selectedOption: option
        })
        //this.getCalculationRedundance(option);
    }

    /*

     */
    onPaymentCompleted(paymentInfo) {
        if (this.props.onPaymentCompleted) {
            this.props.onPaymentCompleted(paymentInfo)
        }
    }

    onPaymentInCompleted() {
        if (this.props.onPaymentInCompleted) {
            this.props.onPaymentInCompleted()
        }
    }

    onSelectedOnlineMethod(payment) {
        this.setState({onlineMethod: payment});
    }

    onPaymentBankTransfer(packageId, expiredId) {
        this.onPayment(packageId, expiredId, Constants.ORDER_PAYMENT_METHOD_COD)
            .then(value => this.onPaymentCompleted({
                total: value.totalAmount,
                currency: value.symbol,
                plan: this.findMonthByExpiredId(this.state.selectedOption),
                paymentMethod: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
                success: true,
                orderId: value.id
            }))
            .catch(this.onPaymentInCompleted)
    }

    onPaymentOnline(packageId, expiredId) {
        const paymentMethod = this.state.onlineMethod;
        let winRef = window.open('about:blank', '_blank');
        this.onPayment(packageId, expiredId, paymentMethod)
            .then(value => {
                if (value.paymentUrl) {
                    winRef.location = value.paymentUrl;
                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_LISTENER);
                    this.channel.onmessage = (evt) => {
                        const result = evt.data;
                        switch (result.event) {
                            case 'success':
                                this.onPaymentCompleted({
                                    total: result.amount,
                                    currency: result.symbol,
                                    plan: this.findMonthByExpiredId(this.state.selectedOption),
                                    paymentMethod: this.state.onlineMethod,
                                    success: true,
                                    orderId: result.orderId
                                });
                                break;
                            case 'fail':
                                this.onPaymentCompleted({
                                    plan: this.state.selectedOption,
                                    success: false
                                });
                                break;
                            default:
                        }
                    }
                }
            })
            .catch(this.onPaymentInCompleted)
    }

    openPopupWindow(url, title, w, h) {
        var left = (window.screen.width / 2) - (w / 2);
        var top = (window.height / 2) - (h / 2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }

    onPayment(packageId, expiredId, paymentMethod) {
        const userId = CredentialUtils.getStoreOwnerId()
        const langKey = storageService.get(Constants.STORAGE_KEY_LANG_KEY);
        let request;


        if (this.state.currentPlanIdList.includes(packageId)) {
            request = beehiveService.doRenew(packageId, expiredId, paymentMethod, userId, langKey);
        } else {
            request = beehiveService.doSubscription(packageId, expiredId, paymentMethod, userId, langKey);
        }
        return new Promise((resolve, reject) => request.then(resolve, reject));

    }
}

SettingPlansStep2.propTypes = {
    dataObj: PropTypes.object,
    selectedPlan: PropTypes.object,
    paymentObj: PropTypes.object,
    onPaymentCompleted: PropTypes.func,
    selectedPricingPlan: PropTypes.number,
    currentPlan: PropTypes.shape({
        id: PropTypes.number,
        level: PropTypes.number,
        name: PropTypes.string,
    }),
    onBack: PropTypes.func,
};

export default SettingPlansStep2;
