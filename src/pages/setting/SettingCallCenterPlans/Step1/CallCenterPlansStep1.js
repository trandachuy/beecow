import './CallCenterPlansStep1.sass';
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
import callCenterService from "../../../../services/CallCenterService";
import {GSToast} from "../../../../utils/gs-toast";
import {CurrencyUtils} from "../../../../utils/number-format";
import moment from "moment";
import {CredentialUtils} from "../../../../utils/credential";
import PropTypes from 'prop-types';
import _ from "lodash";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {TokenUtils} from "../../../../utils/token";
import {RouteUtils} from "../../../../utils/route";
import { withRouter } from "react-router-dom";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import i18next from "i18next";
import catalogService from "../../../../services/CatalogService";
import {PaymentUtils} from "../../../../utils/payment-utils";

const PAYMENT_TAB = {
    ONLINE: 'online',
    BANK_TRANSFER: 'bankTransfer'
};
const BANK_TRANSFER_EXP_DAYS = 3;
const EXTENSION_NUMBER = [5, 10, 20, 30, ..._.range(31, 1001)]
const currentOnlineMethod = PaymentUtils.getPaymentObj().online.currentOnlineMethod;

const CallCenterPlansStep1 = props => {
    const MIN_DURATION = moment().add(1, 'years')
    const [stCurrentPaymentTab, setCurrentPaymentTab] = useState(PAYMENT_TAB.ONLINE);
    const [stOnlineMethod, setStOnlineMethod] = useState(currentOnlineMethod);
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stExtensionQuantity, setStExtensionQuantity] = useState();
    const [stDurationYear, setStDurationYear] = useState(MIN_DURATION.year());
    const [stIsBoughtVoiceRecord, setStIsBoughtVoiceRecord] = useState(false);
    const [stVoiceRecordPackage, setStVoiceRecordPackage] = useState({
        voicePrice: 0,
        extensionPrice: 0,
        currency: Constants.CURRENCY.VND.SYMBOL
    });
    const [stRenewDetail, setStRenewDetail] = useState();
    const [stPackageId, setStPackageId] = useState();
    const [stPackageName, setStPackageName] = useState();
    const [stExtensionAmount, setStExtensionAmount] = useState(0);
    const [stSubTotalAmount, setStSubTotalAmount] = useState(0);
    const [stTotalAmount, setStTotalAmount] = useState(0);
    const [stDesktopExtensionQtyToggle, setStDesktopExtensionQtyToggle] = useState(false)
    const [stMobileExtensionQtyToggle, setStMobileExtensionQtyToggle] = useState(false)
    const [stExtensionNumber, setStExtensionNumber] = useState(EXTENSION_NUMBER)
    const [stUnusedExtPrice, setStUnusedExtPrice] = useState(0)
    const [stOrgRemainingAmount, setStOrgRemainingAmount] = useState(0)
    const [stExpiryDate, setStExpiryDate] = useState(moment())
    const [stMinExpiryDate, setStMinExpiryDate] = useState(MIN_DURATION)
    const [stIsHiddenUpgrading, setStIsHiddenUpgrading] = useState(false)
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stSetupLicensePricing, setStSetupLicensePricing] = useState(2000000)

    useEffect(() => {
        if (TokenUtils.onlyFreePackage() || CredentialUtils.getOmiCallRenewing()) {
            RouteUtils.toNotFound(props)
        }

        getCallCenterPrice();
        getVhtExtensionById();

        return () => {
            if (this.channel) {
                this.channel.close();
            }
        }
    }, []);

    useEffect(() => {
        if (!stRenewDetail) {
            return
        }

        if (!moment(stRenewDetail.expiredTime).isBefore(moment())) {
            //not expired
            const newExtensionNumber = EXTENSION_NUMBER.filter(number => {
                return number >= stRenewDetail.extension.length
            })

            if (newExtensionNumber.length) {
                setStExtensionQuantity(newExtensionNumber[0])
            }
            setStExtensionNumber(newExtensionNumber)
        } else {
            setStExtensionQuantity(stRenewDetail.extension.length)
        }
    }, [stRenewDetail])

    useEffect(() => {
        if (!stRenewDetail || !stExtensionQuantity) {
            return
        }

        const isExpired = moment(stRenewDetail.expiredTime).isBefore(moment())

        if (isExpired) {
            //RENEW
            return
        }

        if (stExtensionQuantity === stRenewDetail.extension.length) {
            //RENEW DURATION
            setStDurationYear(moment(stRenewDetail.expiredTime).year() + 1)
            setStExpiryDate(moment(stRenewDetail.expiredTime))
            setStMinExpiryDate(moment(stRenewDetail.expiredTime).add(1, 'years'))
            setStUnusedExtPrice(0)
        } else {
            //UPGRADE PLAN
            setStDurationYear(moment().year() + 1)
            setStExpiryDate(moment())
            setStMinExpiryDate(moment().add(1, 'years'))

            callCenterService.getReturnAmount({
                newPackageId: stPackageId,
                year: stDurationYear - moment().year()
            })
                .then(({returnAmount}) => {
                    setStOrgRemainingAmount(Math.abs(returnAmount))
                })
        }
    }, [stRenewDetail, stExtensionQuantity])

    const getExtensionPriceByQuantity = (quantity) => {
        if (!stVoiceRecordPackage || !stVoiceRecordPackage.extensionPrice.length) {
            return {}
        }

        const extensionPrice = stVoiceRecordPackage.extensionPrice.find(extension => extension.staffNumber === quantity)

        if (extensionPrice) {
            return extensionPrice
        }

        return stVoiceRecordPackage.extensionPrice.find(extension => extension.staffNumber === 0)
    }

    useEffect(() => {
        if (!stVoiceRecordPackage || !stVoiceRecordPackage.extensionPrice.length) {
            return
        }

        const extensionPrice = getExtensionPriceByQuantity(stExtensionQuantity)
        const purchaseMonthNumber = moment(stExpiryDate).year(stDurationYear).diff(moment(stExpiryDate), 'months')
        const setupLicensePrice = !stIsBoughtVoiceRecord ? stVoiceRecordPackage.voicePrice : 0
        const upgradeFee = stRenewDetail && stExtensionQuantity !== stRenewDetail.extension.length ? extensionPrice.gosellSetupFee : 0
        const extensionPlanPrice = extensionPrice.gosellPricePerExtension * stExtensionQuantity * purchaseMonthNumber
        const vat = stVoiceRecordPackage.currency === Constants.CURRENCY.VND.SYMBOL ? 
            Math.ceil((setupLicensePrice + extensionPlanPrice + upgradeFee - stUnusedExtPrice) / 10) :
            (setupLicensePrice + extensionPlanPrice + upgradeFee - stUnusedExtPrice) / 10

        setStPackageId(extensionPrice.id)
        setStPackageName(extensionPrice.packageCode)
        setStExtensionAmount(extensionPlanPrice)
        setStSubTotalAmount(setupLicensePrice + extensionPlanPrice + upgradeFee - stUnusedExtPrice)
        setStTotalAmount(setupLicensePrice + extensionPlanPrice + upgradeFee - stUnusedExtPrice + vat)
    }, [stIsBoughtVoiceRecord, stExtensionQuantity, stDurationYear, stVoiceRecordPackage, stExpiryDate, stUnusedExtPrice, stRenewDetail])

    useEffect(() => {
        if (!stExtensionQuantity || !stRenewDetail || stExtensionQuantity === stRenewDetail.extension.length) {
            return
        }

        const upgradeFee = stRenewDetail && stExtensionQuantity !== stRenewDetail.extension.length ? getExtensionPriceByQuantity(stExtensionQuantity).gosellSetupFee : 0

        if (stOrgRemainingAmount > (stExtensionAmount + upgradeFee)) {
            setStUnusedExtPrice(stExtensionAmount + upgradeFee)
        } else {
            setStUnusedExtPrice(stOrgRemainingAmount)
        }
    }, [stExtensionAmount, stOrgRemainingAmount, stVoiceRecordPackage, stExtensionQuantity, stRenewDetail])

    const getVhtExtensionById = () => {
        callCenterService.getDetailOmiAccountPackage()
            .then(result => {
                if (result.packageId) {
                    setStIsBoughtVoiceRecord(true)
                    setStRenewDetail(result);
                } else {
                    setStIsBoughtVoiceRecord(false)
                    setStExtensionQuantity(EXTENSION_NUMBER[0])
                }
            })
            .catch(() => {
                GSToast.commonError();
            })
    };

    const getCallCenterPrice = () => {
        callCenterService.getCallCenterPrice()
            .then(result => {
                if (CredentialUtils.getStoreCurrencyCode() !== 'VN'){
                    catalogService.exchangeRateVN(CredentialUtils.getStoreCurrencyCode())
                        .then(exchangeRate=>{
                            setStVoiceRecordPackage({
                                extensionPrice: result,
                                voicePrice: exchangeRate.exchangeRateVN * stSetupLicensePricing,
                                currency: result[0].currency
                            });
                        })
                    return
                }
                
                setStVoiceRecordPackage({
                    extensionPrice: result,
                    voicePrice: stSetupLicensePricing,
                    currency: result[0].currency
                });
            })
            .catch(() => {
                GSToast.commonError();
            })
    };

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
                                          <img src="/assets/images/setting_plans/payment_methods/visa.svg"/>
                                          <img src="/assets/images/setting_plans/payment_methods/mastercard.svg"/>
                                          <img src="/assets/images/setting_plans/payment_methods/jcb.png"/>
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
                                          <img src="/assets/images/setting_plans/payment_methods/atm.png"/>
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
                                          <img className={'zalo'} src="/assets/images/payment_method/zalopay.png"/>
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

                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_CALL_CENTER_LISTENER);
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
                    orderId: value.id
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
            currency: '₫',
            paymentMethod: paymentMethod,
            quantity: stExtensionQuantity
        };
        let request;

        if (!stRenewDetail) {
            //ADD
            request = callCenterService.addOrderPackage
        } else if (stExtensionQuantity === stRenewDetail.extension.length || moment(stRenewDetail.expiredTime).isBefore(moment())) {
            //RENEW
            request = callCenterService.renewOrderPackage
        } else {
            //UPGRADE
            request = callCenterService.upgradeOrderPackage
        }
        return new Promise((resolve, reject) => request(data).then(resolve, reject));

    };

    const onPaymentCompleted = (data) => {
        data = {
            ...data,
            packageName: i18next.t('page.setting.callCenter.title'),
            currency: stVoiceRecordPackage.currency
        };
        if (stExtensionQuantity) {
            data = {
                ...data,
                expiredDate: moment(stExpiryDate).set('year', stDurationYear).format('DD/MM/YYYY')
            };
        }
        if (!stIsBoughtVoiceRecord) {
            data = {
                ...data,
                voicePrice: stVoiceRecordPackage.voicePrice
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

    const changeQuantity = (value) => {
        setStExtensionQuantity(value);
    };

    const changeDuration = (e) => {
        const newYear = parseInt(e.currentTarget.value)

        if (newYear > 9999) {
            return;
        }
        setStDurationYear(newYear);
    };

    const blurDuration = (e) => {
        const value = e.currentTarget.value;
        if (value === '' || value < stMinExpiryDate.year()) {
            setStDurationYear(stMinExpiryDate.year());
        } else if (value > stMinExpiryDate.year() + 5) {
            setStDurationYear(stMinExpiryDate.year() + 5);
        }
    };

    return (
        <>
            {stIsFetching && <LoadingScreen/>}
            <div className="call-center-plans-step1 gs-ani__fade-in">
                <div className="plan-info mb-5">
                    <div className="plan-info__price-selector d-mobile-none d-desktop-flex">
                        <table className={'table'}>
                            <colgroup>
                                <col style={{width: '20%'}}/>
                                {!stIsHiddenUpgrading && <col style={{width: '15%'}}/>}
                                <col style={{width: '10%'}}/>
                                <col style={{width: '15%'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th><Trans i18nKey="page.call.center.plans.step1.head.plans"/></th>
                                {!stIsHiddenUpgrading &&
                                <th><Trans i18nKey="page.call.center.plans.step1.head.quantity"/></th>}
                                <th><Trans i18nKey="page.call.center.plans.step1.head.duration"/></th>
                                <th><Trans i18nKey="page.call.center.plans.step1.head.price"/></th>
                            </tr>
                            </thead>
                            <tbody>
                            {!stIsBoughtVoiceRecord &&
                            <tr>
                                <td>
                                    <Trans i18nKey="page.call.center.plans.step1.setupLicence">
                                        Call Center Setting Up License <small className='font-weight-bold'>(One-Time
                                        Payment)</small>
                                    </Trans>
                                </td>
                                <td>-</td>
                                <td>-</td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stVoiceRecordPackage.voicePrice,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            }
                            <tr>
                                <td>
                                    <GSTrans t={`page.call.center.plans.step1.plan.${stPackageName}.title`}>
                                        GoCALL Start <small className='font-weight-bold'>(Maximum: 5 extensions)</small>
                                    </GSTrans>
                                </td>
                                {!stIsHiddenUpgrading && <td>
                                    <Dropdown className='quantity-dropdown'
                                              isOpen={stDesktopExtensionQtyToggle}
                                              toggle={() => setStDesktopExtensionQtyToggle(toggle => !toggle)}>
                                        <DropdownToggle caret>
                                            <span className='extension-number'>{stExtensionQuantity}</span>
                                        </DropdownToggle>
                                        <DropdownMenu className='extension-number__dropdown'>
                                            {
                                                stExtensionNumber.map((value, index) => (
                                                    <DropdownItem
                                                        key={index}
                                                        onClick={() => changeQuantity(value)}
                                                        active={value === stExtensionQuantity}
                                                    >
                                                        {value}
                                                    </DropdownItem>
                                                ))
                                            }
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>}
                                <td>
                                    <div className='input-date'>
                                        <span className={'date-prefix'}>{stExpiryDate.format('DD/MM/')}</span>
                                        <input className='text-center'
                                               type='number'
                                               min={stMinExpiryDate.year()}
                                               max={stMinExpiryDate.year() + 5}
                                               value={stDurationYear}
                                               onChange={changeDuration}
                                               onBlur={blurDuration}/>
                                    </div>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stExtensionAmount,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            <tr hidden={!stRenewDetail || stExtensionQuantity === stRenewDetail.extension.length}>
                                <td colSpan={stIsHiddenUpgrading ? 2 : 3}
                                    className='text-right text-gray'>
                                    <Trans i18nKey="page.call.center.plans.step1.upgradeFee"/>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(getExtensionPriceByQuantity(stExtensionQuantity).gosellSetupFee,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            <tr hidden={!stUnusedExtPrice}>
                                <td colSpan={stIsHiddenUpgrading ? 2 : 3}
                                    className='text-right text-gray'>
                                    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan"/>
                                    {/*<small className='font-weight-bold'><br/>*/}
                                    {/*    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan.exclude"/>*/}
                                    {/*</small>*/}
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        -{CurrencyUtils.formatMoneyByCurrency(stUnusedExtPrice,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={stIsHiddenUpgrading ? 2 : 3}
                                    className='text-right text-gray'>
                                    <GSTrans t='page.call.center.plans.step1.subTotal'/>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={stIsHiddenUpgrading ? 2 : 3}
                                    className='text-right text-uppercase text-gray'>
                                    <GSTrans t='page.call.center.plans.step1.subTotal.vat'>
                                        VAT <small className='font-weight-bold'>(10%)</small>
                                    </GSTrans>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stVoiceRecordPackage.currency === Constants.CURRENCY.VND.SYMBOL ? Math.ceil(stSubTotalAmount / 10) : stSubTotalAmount / 10,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            <tr className='font-size-16px'>
                                <td colSpan={stIsHiddenUpgrading ? 2 : 3} className='text-right text-uppercase'><Trans
                                    i18nKey="page.call.center.plans.step1.total"/></td>
                                <td className='text-blue'>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stTotalAmount,stVoiceRecordPackage.currency)}
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/*MOBILE*/}
                    <div className="plan-info__price-selector d-mobile-flex d-desktop-none">
                        {!stIsBoughtVoiceRecord &&
                        <UikWidget className="gs-widget">
                            <UikWidgetContent className="gs-widget__content">
                                <div className="setting__account">
                                    <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.plans"/>:&nbsp;
                                    </span>
                                        <span className="account__line2">
                                        <Trans i18nKey="page.call.center.plans.step1.setupLicence">
                                            Call Center Setting Up License <small>(One-Time Payment)</small>
                                        </Trans>
                                    </span>
                                    </div>
                                    {!stIsHiddenUpgrading && <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.quantity"/>:&nbsp;
                                    </span>
                                        <span className="account__line2">
                                        -
                                    </span>
                                    </div>}
                                    <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.duration"/>:&nbsp;
                                    </span>
                                        <span className="account__line2">
                                        -
                                    </span>
                                    </div>
                                    <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.price"/>:&nbsp;
                                    </span>
                                        <span className="account__line2 font-bold">
                                        {CurrencyUtils.formatMoneyByCurrency(stVoiceRecordPackage.voicePrice,stVoiceRecordPackage.currency)}
                                    </span>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        }

                        <UikWidget className="gs-widget">
                            <UikWidgetContent className="gs-widget__content">
                                <div className="setting__account">
                                    <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.extension"/>:&nbsp;
                                    </span>
                                        <span className="account__line2">
                                       <GSTrans t={`page.call.center.plans.step1.plan.${stPackageName}.title`}>
                                            GoCALL Start <small>(Maximum: 5 extensions)</small>
                                       </GSTrans>
                                    </span>
                                    </div>
                                    {!stIsHiddenUpgrading && <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.quantity"/>:&nbsp;
                                    </span>
                                        <span className="account__line2">
                                        <Dropdown isOpen={stMobileExtensionQtyToggle}
                                                  toggle={() => setStMobileExtensionQtyToggle(toggle => !toggle)}>
                                            <DropdownToggle caret>
                                                <span className='extension-number'>{stExtensionQuantity}</span>
                                            </DropdownToggle>
                                            <DropdownMenu className='extension-number__dropdown'>
                                                {
                                                    stExtensionNumber.map((value, index) => (
                                                        <DropdownItem
                                                            key={index}
                                                            onClick={() => changeQuantity(value)}
                                                            active={value === stExtensionQuantity}
                                                        >
                                                            {value}
                                                        </DropdownItem>
                                                    ))
                                                }
                                            </DropdownMenu>
                                        </Dropdown>
                                    </span>
                                    </div>}
                                    <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.duration"/>:&nbsp;
                                    </span>
                                        <span className="account__line2">
                                        <div className='input-date w-100'>
                                            <span
                                                className={'date-prefix'}>{stExpiryDate.format('DD/MM/')}</span>
                                            <input type='number'
                                                   min={stMinExpiryDate.year()}
                                                   max={stMinExpiryDate.year() + 5}
                                                   value={stDurationYear}
                                                   onChange={changeDuration}
                                                   onBlur={blurDuration}/>
                                        </div>
                                    </span>
                                    </div>
                                    <div className="account__block">
                                    <span className="gs-frm-input__label">
                                        <Trans i18nKey="page.call.center.plans.step1.head.price"/>:&nbsp;
                                    </span>
                                        <span className="account__line2 font-bold">
                                        {CurrencyUtils.formatMoneyByCurrency(stExtensionAmount,stVoiceRecordPackage.currency)}
                                    </span>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <div className="detail-block mb-0"
                             hidden={(!stRenewDetail || stExtensionQuantity === stRenewDetail.extension.length) && !stUnusedExtPrice}>
                            <div hidden={!stRenewDetail || stExtensionQuantity === stRenewDetail.extension.length}>
                                <span className='text-uppercase font-bold text-gray float-left'>
                                    <Trans i18nKey="page.call.center.plans.step1.upgradeFee"/>:&nbsp;
                                </span>
                                <span
                                    className={'font-bold'}>{CurrencyUtils.formatMoneyByCurrency(getExtensionPriceByQuantity(stExtensionQuantity).gosellSetupFee,stVoiceRecordPackage.currency)}</span>
                            </div>
                            <div hidden={!stUnusedExtPrice}>
                                <span className='text-uppercase font-bold text-gray float-left'>
                                    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan"/>:&nbsp;
                                    {/*<small className='font-weight-bold'><br/><Trans*/}
                                    {/*    i18nKey="page.call.center.plans.step1.unusedExtPlan.exclude"/></small>*/}
                                </span>
                                <span className={'font-bold'}>-{CurrencyUtils.formatMoneyByCurrency(stUnusedExtPrice,stVoiceRecordPackage.currency)}</span>
                            </div>
                        </div>
                        <div className="detail-block">
                            <span className='text-uppercase font-bold text-gray'>
                                <Trans i18nKey="page.call.center.plans.step1.subTotal"/>:&nbsp;</span>
                            <span className='font-bold'>{CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount,stVoiceRecordPackage.currency)}</span>
                            <br/>
                            <span className='text-uppercase font-bold text-gray'>
                                <GSTrans t='page.call.center.plans.step1.subTotal.vat'>
                                    VAT <small className='font-weight-bold'>(10%)</small>
                                </GSTrans>
                                :&nbsp;
                            </span>
                            <span
                                className='font-bold'>{CurrencyUtils.formatMoneyByCurrency(Math.ceil(stSubTotalAmount / 10),stVoiceRecordPackage.currency)}</span>
                        </div>
                        <div className="detail-block font-size-16px font-bold">
                        <span className='text-uppercase'><Trans
                            i18nKey="page.call.center.plans.step1.total"/>: </span>
                            <span className='text-blue'>{CurrencyUtils.formatMoneyByCurrency(stTotalAmount,stVoiceRecordPackage.currency)}</span>
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

                        {/*// TAB CONTENT*/}

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

export default withRouter(CallCenterPlansStep1);

CallCenterPlansStep1.propTypes = {
    onPaymentCompleted: PropTypes.func,
    onPaymentInCompleted: PropTypes.func,
    paymentObj: PropTypes.object,
    renewId: PropTypes.number
};
