import './LanguagesPlansStep1.sass';
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import React, {useEffect, useState} from 'react';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import {Trans} from "react-i18next";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import Constants from "../../../../config/Constant";
import {UikFormInputGroup, UikRadio, UikWidget, UikWidgetContent} from "../../../../@uik";
import {BroadcastChannelUtil} from "../../../../utils/BroadcastChannel";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import moment from "moment";
import {CredentialUtils} from "../../../../utils/credential";
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import i18n from '../../../../config/i18n';
import storeService from "../../../../services/StoreService";
import {PaymentUtils} from "../../../../utils/payment-utils";

const PAYMENT_TAB = {
    ONLINE: 'online',
    BANK_TRANSFER: 'bankTransfer'
};
const BANK_TRANSFER_EXP_DAYS = 3;
const currentOnlineMethod = PaymentUtils.getPaymentObj().online.currentOnlineMethod;

const LanguagesPlansStep1 = props => {
    const MIN_DURATION = moment().add(1, 'years')
    const [stAllowOnline, setStAllowOnline] = useState(true);
    const [stCurrentPaymentTab, setCurrentPaymentTab] = useState(PAYMENT_TAB.ONLINE);
    const [stOnlineMethod, setStOnlineMethod] = useState(currentOnlineMethod);
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stDurationYear, setStDurationYear] = useState(MIN_DURATION.year());
    const [stPackagePrices, setStPackagePrices] = useState([]);
    const [stRenewDetail, setStRenewDetail] = useState();
    const [stPackageId, setStPackageId] = useState();
    const [stSubTotalAmount, setStSubTotalAmount] = useState(0);
    const [stVATAmount, setStVATAmount] = useState(0);
    const [stTotalAmount, setStTotalAmount] = useState(0);
    const [stExpiryDate, setStExpiryDate] = useState(moment())
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stShowUpgradeMessage, setStShowUpgradeMessage] = useState(true);
    const [stIsUpgrade, setStIsUpgrade] = useState(true);

    useEffect(() => {
        fetchPricingAndOrder();
    }, []);

    useEffect(() => {
        if (!stRenewDetail || !stRenewDetail.expiryDate) {
            return
        }
        const currentExpired = moment.unix(stRenewDetail.expiryDate).isAfter(moment()) ? moment.unix(stRenewDetail.expiryDate) : moment();
        setStExpiryDate(currentExpired)
        setStDurationYear(currentExpired.year() + 1)
    }, [stRenewDetail])

    useEffect(() => {
        updatePrice();
    }, [stDurationYear, stPackagePrices, stExpiryDate])

    const fetchPricingAndOrder = () => {
        const promises = [
            storeService.getPackagePrice({
                channel: Constants.PACKAGE_PRICE_CHANNEL.MULTI_LANGUAGE,
                currencyCode: CurrencyUtils.getLocalStorageCountry() === 'VN' ? 'VND' : 'USD'
            }),
            storeService.getActiveOrderPackageByStoreId({
                channel: Constants.PACKAGE_PRICE_CHANNEL.MULTI_LANGUAGE
            })
        ]

        Promise.all(promises)
            .then(([packagePrice, activeOrder]) => {
                setStRenewDetail(activeOrder);
                setStPackagePrices(packagePrice);
            })
    }

    const updatePrice = () => {
        if (!stPackagePrices || !stPackagePrices.length) {
            return;
        }

        const packagePrice = stPackagePrices[0].packagePrice
        const packagePriceId = stPackagePrices[0].id
        const purchaseYearNumber = moment().year(stDurationYear).diff(stExpiryDate, 'years')
        const subTotalPrice = packagePrice * purchaseYearNumber;
        const vat = CurrencyUtils.getLocalStorageCountry() === 'VN' ? Math.ceil(subTotalPrice / 10) : NumberUtils.formatThousandFixed(subTotalPrice / 10,  2)
        const totalPrice = subTotalPrice + parseFloat(vat)

        setStPackageId(packagePriceId)
        setStSubTotalAmount(subTotalPrice)
        setStVATAmount(totalPrice <= 0 ? 0 : vat)
        setStTotalAmount(totalPrice);
    }

    const switchPaymentTab = (paymentTab) => {
        setCurrentPaymentTab(paymentTab);
    };

    const onSelectedOnlineMethod = (payment) => {
        setStOnlineMethod(payment);
    };

    const renderPaymentMethod = () => {
        let paymentOptions = [];

        for (let [index, payment] of props.paymentObj.online.methods.entries()) {
            if (payment === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === stOnlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img src="/assets/images/setting_plans/payment_methods/visa.svg"
                                               alt="logo-visa"/>
                                          <img src="/assets/images/setting_plans/payment_methods/mastercard.svg"
                                               alt="logo-mastercard"/>
                                          <img src="/assets/images/setting_plans/payment_methods/jcb.png"
                                               alt="logo-jcb"/>
                                      </div>
                                  )
                              }
                              onClick={() => onSelectedOnlineMethod(payment)}
                    />
                );
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === stOnlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img src="/assets/images/setting_plans/payment_methods/atm.png"
                                               alt="logo-atm"/>
                                      </div>
                                  )
                              }
                              onClick={() => onSelectedOnlineMethod(payment)}
                    />
                );
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_ZALO) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === stOnlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className={'zalo'} src="/assets/images/payment_method/zalopay.png"
                                               alt="logo-zalopay"/>
                                      </div>
                                  )
                              }
                              onClick={() => onSelectedOnlineMethod(payment)}
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_MOMO) {
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === stOnlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className={'momo'} src="/assets/images/payment_method/momo.png"/>
                                      </div>
                                  )
                              }
                              onClick={() => onSelectedOnlineMethod(payment)}
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_PAYPAL){
                paymentOptions.push(
                    <UikRadio key={index}
                              name="paymentMethod"
                              defaultChecked={payment === stOnlineMethod}
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className="payment__method-image"
                                               src={"/assets/images/payment_method/paypal.svg"}
                                          />
                                      </div>
                                  )
                              }
                              onClick={() => onSelectedOnlineMethod(payment)}
                    />
                )
            }

        }

        return (
            <UikFormInputGroup direction="horizontal">
                {paymentOptions}
            </UikFormInputGroup>
        )
    };

    const onPaymentOnline = () => {
        const paymentMethod = stOnlineMethod;
        let winRef = window.open('about:blank', '_blank');
        onPayment(paymentMethod)
            .then(value => {
                if (value.paymentUrl) {
                    winRef.location = value.paymentUrl;

                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_MULTI_LANGUAGE_LISTENER);
                    this.channel.onmessage = (evt) => {
                        const result = evt.data;
                        switch (result.event) {
                            case 'success':
                                onPaymentCompleted({
                                    total: result.amount,
                                    paymentMethod: stOnlineMethod,
                                    orderId: result.orderId
                                });
                                break;
                            case 'fail':
                                onPaymentInCompleted();
                                break;
                            default:
                        }
                    }
                }
            })
            .catch(onPaymentInCompleted)
            .finally(() => setStIsProcessing(false))
    };

    const onPaymentBankTransfer = () => {
        onPayment(Constants.ORDER_PAYMENT_METHOD_COD)
            .then(value => {
                onPaymentCompleted({
                    total: value.totalAmount,
                    paymentMethod: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
                    orderId: value.id,
                    currency: value.currencySymbol
                })
            })
            .catch(onPaymentInCompleted)
            .finally(() => setStIsProcessing(false))
    };

    const onPayment = (paymentMethod) => {
        let data = {
            storeId: CredentialUtils.getStoreId(),
            userId: CredentialUtils.getUserId(),
            packageId: stPackageId,
            year: moment(stExpiryDate).year(stDurationYear).diff(moment(stExpiryDate), 'years'),
            currencyCode: CredentialUtils.getStoreCountryCode() === 'VN' ? 'VND' : 'USD',
            paymentMethod: paymentMethod,
            quantity: 1,
            channel: Constants.ORDER_PACKAGE_CHANNEL.MULTI_LANGUAGE
        };
        let request;

        if (!stRenewDetail) {
            //ADD
            request = storeService.addOrderPackage
        } else {
            //RENEW
            request = storeService.renewOrderPackage
        }
        return new Promise((resolve, reject) => request(data).then(resolve, reject));
    };

    const onPaymentCompleted = (data) => {
        data = {
            ...data,
            expiredDate: moment(stExpiryDate).set('year', stDurationYear).format('DD/MM/YYYY')
        };
        if (stRenewDetail) {
            data = {
                ...data,
            }
        }
        if (props.onPaymentCompleted) {
            props.onPaymentCompleted(data)
        }
    };

    const onPaymentInCompleted = () => {
        if (props.onPaymentInCompleted) {
            props.onPaymentInCompleted()
        }
    };

    const changeDuration = (e) => {
        const newYear = parseInt(e.currentTarget.value)

        if (newYear > 9999) {
            return;
        }
        setStDurationYear(newYear);
    };

    const blurDuration = (e) => {
        const yearNow = stExpiryDate.year();
        const value = e.currentTarget.value;
        if (value === '' || value < stExpiryDate.year()) {
            setStDurationYear(stExpiryDate.year());
        } else if (value > yearNow + 5) {
            setStDurationYear(stExpiryDate.year() + 1);
        }
    };

    return (
        <>
            {stIsFetching && <LoadingScreen/>}
            <div className="languages-plans-step1 gs-ani__fade-in">
                <div className="plan-info mb-5">
                    <div className="plan-info__price-selector d-mobile-none d-desktop-flex">
                        <table className={'table'}>
                            <colgroup>
                                <col style={{width: '25%'}}/>
                                <col style={{width: '25%'}}/>
                                <col style={{width: '25%'}}/>
                                <col style={{width: '25%'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th><Trans i18nKey="languages.page.plans.step1.head.plans"/></th>
                                <th><Trans i18nKey="languages.page.plans.step1.head.price"/></th>
                                <th><Trans i18nKey="languages.page.plans.step1.head.duration"/></th>
                                <th><Trans i18nKey="languages.page.plans.step1.head.totalPrice"/></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><GSTrans t='languages.page.plans.step1.plan.title'/></td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {stPackagePrices[0] ? CurrencyUtils.formatMoneyByCurrency(stPackagePrices[0].packagePrice, stPackagePrices[0].currency):  CurrencyUtils.formatMoneyByCurrency(0, CurrencyUtils.getLocalStorageSymbol() === 'đ' ? 'đ' : '$')}
                                    </div>
                                </td>
                                <td>
                                    <div className='input-date'>
                                        <span className={'date-prefix'}>{stExpiryDate.format('DD/MM/')}</span>
                                        <input className='text-center'
                                               type='number'
                                               min={stExpiryDate.year() + 1}
                                               max={stExpiryDate.year() + 5}
                                               value={stDurationYear}
                                               onChange={changeDuration}
                                               onBlur={blurDuration}/>
                                    </div>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="remove-border-right">
                                    <span hidden={stShowUpgradeMessage} className="warning-message">
                                        {i18n.t((stIsUpgrade) ? "page.call.center.plans.step1.shopee.upgrade.title" : "page.call.center.plans.step1.shopee.renewing.title")}
                                    </span>
                                </td>
                                <td className='text-right text-uppercase text-gray remove-border-left'>
                                    <GSTrans t='languages.page.plans.step1.vat'>
                                        VAT <small className='font-weight-bold'>(10%)</small>
                                    </GSTrans>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stVATAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}
                                    </div>
                                </td>
                            </tr>
                            <tr className='font-size-16px'>
                                <td colSpan={3} className='text-right text-uppercase'><Trans
                                    i18nKey="page.call.center.plans.step1.total"/></td>
                                <td className='text-blue'>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/*MOBILE*/}
                    <div className="plan-info__price-selector d-mobile-flex d-desktop-none">
                        <UikWidget className="gs-widget">
                            <UikWidgetContent className="gs-widget__content">
                                <div className="setting__account">
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="shopee.page.plans.step1.head.plans"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                       <GSTrans t='shopee.page.plans.step1.plan.title'/>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="languages.page.plans.step1.head.price"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                                      {stPackagePrices[0] ? CurrencyUtils.formatMoneyByCurrency(stPackagePrices[0].packagePrice, stPackagePrices[0].currency) :  CurrencyUtils.formatMoneyByCurrency(0, CurrencyUtils.getLocalStorageSymbol()  === 'đ' ? 'đ' : '$')}
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="shopee.page.plans.step1.head.duration"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                            <div className='input-date w-100'>
                                                <span
                                                    className={'date-prefix'}>{stExpiryDate.format('DD/MM/')}</span>
                                                <input type='number'
                                                       min={stExpiryDate.year() + 1}
                                                       max={stExpiryDate.year() + 5}
                                                       value={stDurationYear}
                                                       onChange={changeDuration}
                                                       onBlur={blurDuration}/>
                                            </div>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="shopee.page.plans.step1.head.totalPrice"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            {CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}
                                        </span>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <div className="detail-block">
                            <span hidden={stShowUpgradeMessage} className="warning-message"
                                  style={{marginBottom: "1rem", width: "100%"}}>
                                <GSTrans
                                    t={(stIsUpgrade) ? "page.call.center.plans.step1.shopee.upgrade.title" : "page.call.center.plans.step1.shopee.renewing.title"}>
                                </GSTrans>
                            </span>
                            <br/>
                            <span className='text-uppercase font-bold text-gray'>
                                <GSTrans t='page.call.center.plans.step1.subTotal.vat'>
                                    VAT <small className='font-weight-bold'>(10%)</small>
                                </GSTrans>
                                :&nbsp;
                            </span>
                            <span className='font-bold'>
                                {CurrencyUtils.formatMoneyByCurrency(stVATAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}
                            </span>
                        </div>
                        <div className="detail-block font-size-16px font-bold">
                            <span className='text-uppercase'><Trans
                                i18nKey="page.call.center.plans.step1.total"/>: </span>
                            <span className='text-blue'>{CurrencyUtils.formatMoneyByCurrency(stTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}</span>
                        </div>
                    </div>
                </div>
                <div className="widget__title">
                    <GSTrans t="page.call.center.plans.step1.paymentMethod.title"/>
                </div>
                <GSWidget className="m-0">
                    <GSWidgetHeader bg={GSWidgetHeader.TYPE.WHITE}>
                        <div className="btn-group mb-2 mt-2">
                            <button
                                className={['btn', stCurrentPaymentTab === PAYMENT_TAB.ONLINE ? 'btn-secondary' : 'btn-outline-secondary'].join(' ')}
                                onClick={() => switchPaymentTab(PAYMENT_TAB.ONLINE)}>
                                <span className="d-desktop-inline d-mobile-none">
                                    <Trans i18nKey="page.setting.plans.step2.onlinePayment"/>
                                </span>
                                <span className="d-desktop-none d-mobile-inline">
                                    <Trans i18nKey="page.setting.plans.step2.onlinePayment.mobile"/>
                                </span>
                            </button>
                            <button
                                style={CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM ? {cursor:'default'} : {}}
                                className={['btn', stCurrentPaymentTab === PAYMENT_TAB.BANK_TRANSFER ? 'btn-secondary' : 'btn-outline-secondary'].join(' ')}
                                onClick={() => switchPaymentTab(PAYMENT_TAB.BANK_TRANSFER)}>
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

                        {/*ONLINE PAYMENT*/}
                        {stCurrentPaymentTab === PAYMENT_TAB.ONLINE &&
                        <div className="online-payment mb-2 mt-2">
                            <div className="online-payment__selector">
                                {renderPaymentMethod()}
                            </div>
                        </div>
                        }

                        {/*BANK TRANSFER*/}
                        {stCurrentPaymentTab === PAYMENT_TAB.BANK_TRANSFER &&
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
                            {CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM &&
                            <div className="bank-transfer__info">
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                    {props.paymentObj.bankTransfer.accountOwner}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                    {props.paymentObj.bankTransfer.accountNumber}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                    {props.paymentObj.bankTransfer.bank}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                    {props.paymentObj.bankTransfer.branch}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                    {props.paymentObj.bankTransfer.content}
                                </p>
                            </div>}
                            {CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM &&
                            <div className="bank-transfer__info">
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.bankName"/>
                                    {props.paymentObj.bankTransferNonVn.bankName}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.swiftCode"/>
                                    {props.paymentObj.bankTransferNonVn.swiftCode}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountHolderName"/>
                                    {props.paymentObj.bankTransferNonVn.accountHolderName}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumberNonVn"/>
                                    {props.paymentObj.bankTransferNonVn.accountNumber}
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                    {props.paymentObj.bankTransfer.content}
                                </p>
                            </div>}
                        </div>}
                    </GSWidgetContent>
                </GSWidget>

                <div
                    className="d-flex justify-content-md-between justify-content-center flex-md-row flex-column-reverse align-items-md-center mt-4">
                    <div className="d-flex justify-content-center flex-grow-1">
                        <GSButton success
                                  className="btn-pay"
                                  disabled={stIsProcessing}
                                  onClick={() => {
                                      setStIsProcessing(true);
                                      if (stCurrentPaymentTab === PAYMENT_TAB.ONLINE) { // online
                                          onPaymentOnline()
                                      }
                                      if (stCurrentPaymentTab === PAYMENT_TAB.BANK_TRANSFER) { // bank transfer
                                          onPaymentBankTransfer()
                                      }
                                  }
                                  }
                        >
                            <Trans i18nKey="page.setting.plans.step2.btn.pay"/>
                        </GSButton>
                    </div>
                </div>

            </div>
        </>
    )
};

export default withRouter(LanguagesPlansStep1);

LanguagesPlansStep1.propTypes = {
    onPaymentCompleted: PropTypes.func,
    onPaymentInCompleted: PropTypes.func,
    paymentObj: PropTypes.object,
    renewId: PropTypes.number
};
