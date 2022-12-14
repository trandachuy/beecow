import './ShopeePlansStep1.sass';
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
import {GSToast} from "../../../../utils/gs-toast";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import moment from "moment";
import {CredentialUtils} from "../../../../utils/credential";
import PropTypes from 'prop-types';
import _ from "lodash";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import { withRouter } from "react-router-dom";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import i18next from "i18next";
import shopeeService from "../../../../services/ShopeeService";
import i18n from '../../../../config/i18n';
import {PaymentUtils} from "../../../../utils/payment-utils";

const PAYMENT_TAB = {
    ONLINE: 'online',
    BANK_TRANSFER: 'bankTransfer'
};
const BANK_TRANSFER_EXP_DAYS = 3;
const SHOPEE_NUMBER = [1, 3, 5, 10, 15, ..._.range(16, 1001)]
const getPricingIdByNumber = (number) => {
    if (!number) {
        return
    }

    switch (number) {
        case 1:
            return 1
        case 3:
            return 2
        case 5:
            return 3
        case 10:
            return 4
        case 15:
            return 5
        default:
            return 6
    }
}
const currentOnlineMethod = PaymentUtils.getPaymentObj().online.currentOnlineMethod;

const ShopeePlansStep1 = props => {
    const MIN_DURATION = moment().add(1, 'years')
    const [stCurrentPaymentTab, setCurrentPaymentTab] = useState(PAYMENT_TAB.ONLINE);
    const [stOnlineMethod, setStOnlineMethod] = useState(currentOnlineMethod);
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stShopeeQuantity, setStShopeeQuantity] = useState();
    const [stDurationYear, setStDurationYear] = useState(MIN_DURATION.year());
    const [stPackagePrices, setStPackagePrices] = useState([]);
    const [stRenewDetail, setStRenewDetail] = useState();
    const [stPackageId, setStPackageId] = useState();
    const [stShopeeAmount, setStShopeeAmount] = useState(0);
    const [stSubTotalAmount, setStSubTotalAmount] = useState(0);
    const [stVATAmount, setStVATAmount] = useState(0);
    const [stTotalAmount, setStTotalAmount] = useState(0);
    const [stDesktopShopeeQtyToggle, setStDesktopShopeeQtyToggle] = useState(false)
    const [stMobileShopeeQtyToggle, setStMobileShopeeQtyToggle] = useState(false)
    const [stShopeeNumber, setStShopeeNumber] = useState(SHOPEE_NUMBER)
    const [stUnusedExtPlan, setStUnusedExtPlan] = useState(0)
    const [stOrgRemainingAmount, setStOrgRemainingAmount] = useState(0)
    const [stExpiryDate, setStExpiryDate] = useState(moment())
    const [stMinExpiryDate, setStMinExpiryDate] = useState(MIN_DURATION)
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stShowUpgradeMessage, setStShowUpgradeMessage] = useState(true);
    const [stIsUpgrade, setStIsUpgrade] = useState(true);

    useEffect(() => {
        fetchPricingAndOrder();
        return () => {
        }
    }, []);

    useEffect(() => {
        hasUpgradePackage();
    }, [stRenewDetail, stShopeeQuantity])

    useEffect(() => {
        updatePrice();
    }, [stShopeeQuantity, stDurationYear, stPackagePrices, stExpiryDate, stUnusedExtPlan, stRenewDetail])

    useEffect(() => {
        if (!stShopeeQuantity || !stRenewDetail) {
            return
        }
        if(stOrgRemainingAmount > stSubTotalAmount) {
            setStUnusedExtPlan(stSubTotalAmount)    
        } else {
            setStUnusedExtPlan(stOrgRemainingAmount)
        }

        if(stShopeeQuantity === stRenewDetail.numberPackage) {
            setStUnusedExtPlan(0);
        }
    }, [stSubTotalAmount, stOrgRemainingAmount])

    const fetchPricingAndOrder = async () => {
        try {
            const currencyCode = CurrencyUtils.getLocalStorageCountry() === 'VN' ? 'VND' : 'USD'
            const pricePlans = await shopeeService.getPackagePrice(currencyCode);
            const orderDetail = await shopeeService.getActiveOrderPackageByStoreId();
            const lastOrderDetail = await shopeeService.getLastOrderByStoreId();
            setStRenewDetail(orderDetail);
            setStPackagePrices(pricePlans);
            
            
            //in case: expired shopee
            const numberPackage = (lastOrderDetail && lastOrderDetail.numberPackage)? (lastOrderDetail.numberPackage):1;
            if (!orderDetail) {
                setStShopeeQuantity(numberPackage);
                if(lastOrderDetail && numberPackage > 1) {
                    const newShopeeNumber = SHOPEE_NUMBER.filter(number => {
                        if (lastOrderDetail.boughtPackage === 6) {
                            return number >= lastOrderDetail.numberPackage
                        } else {
                            return getPricingIdByNumber(number) >= lastOrderDetail.boughtPackage
                        }
                    })
                    setStShopeeNumber(newShopeeNumber)
                }
            } else {
                setStShopeeQuantity(orderDetail.numberPackage);
            }
            preparePricingPlan(orderDetail);
        } catch(e) {
            GSToast.commonError();
        }
    }

    const preparePricingPlan = async (orderDetail) => {
        if (orderDetail && !moment.unix(orderDetail.expiryDate).isBefore(moment())) {
            //not expired
            const newShopeeNumber = SHOPEE_NUMBER.filter(number => {
                if (orderDetail.boughtPackage === 6) {
                    return number >= orderDetail.numberPackage
                } else {
                    return getPricingIdByNumber(number) >= orderDetail.boughtPackage
                }
            })

            if (newShopeeNumber.length > 0) {
                setStShopeeQuantity(newShopeeNumber[0])
            }
            setStShopeeNumber(newShopeeNumber)
        }
    }

    const hasUpgradePackage = () => {
        if (!stRenewDetail || !stShopeeQuantity) {
            return
        }

        const isExpired = moment.unix(stRenewDetail.expiryDate).isBefore(moment())

        if (isExpired) {
            //RENEW
            return
        }

        if (stShopeeQuantity === stRenewDetail.numberPackage) {
            //not expiry
            setStExpiryDate(moment.unix(stRenewDetail.expiryDate))
            setStDurationYear(moment.unix(stRenewDetail.expiryDate).year() + 1)
            setStMinExpiryDate(moment.unix(stRenewDetail.expiryDate).add(1, 'years'))
            setStUnusedExtPlan(0)
        } else {
            setStDurationYear(moment().year() + 1)
            setStExpiryDate(moment())
            setStMinExpiryDate(moment().add(1, 'years'));
        }

        shopeeService.getRemainingAmountByStoreId().then(returnAmount => {
            setStOrgRemainingAmount(Math.abs(returnAmount))
        })
    }

    const updatePrice = () => {
        if(!stRenewDetail) {
            setStShowUpgradeMessage(false);
        }
        if (!stPackagePrices || !stShopeeQuantity) {
            return;
        }

        const numberPackage = stRenewDetail? stRenewDetail.numberPackage: 1;
        const packagePriceId = getPricingIdByNumber(stShopeeQuantity)
        const packagePrice = stPackagePrices.find(pkgPrice => pkgPrice.id === packagePriceId)
        let currentExpired = stRenewDetail && stRenewDetail.expiryDate && moment.unix(stRenewDetail.expiryDate).isAfter(moment()) && stShopeeQuantity === numberPackage? moment.unix(stRenewDetail.expiryDate): moment();
        const purchaseYearNumber = stDurationYear - currentExpired.year()
        const isRenewCurrentPackage = stRenewDetail? (packagePrice.accountNumber === numberPackage): false;
        let shopeePlanPrice

        if (packagePrice.accountNumber === 0) {
            shopeePlanPrice = packagePrice.pricePerAccount * stShopeeQuantity
        } else {
            shopeePlanPrice = packagePrice.packagePrice
        }

        const subTotalPrice = (shopeePlanPrice * purchaseYearNumber);
        const vat = CurrencyUtils.getLocalStorageCountry() === 'VN' ? Math.ceil(subTotalPrice / 10) : NumberUtils.formatThousandFixed(subTotalPrice / 10,  2)
        const totalPrice = (subTotalPrice > stOrgRemainingAmount || packagePrice.accountNumber === numberPackage) ? (subTotalPrice + parseFloat(vat) - stUnusedExtPlan):0;
        if(isRenewCurrentPackage) {
            setStIsUpgrade(false);
        } else {
            setStIsUpgrade(true);
        }

        setStPackageId(packagePrice.id)
        setStShopeeAmount(shopeePlanPrice)
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
                                        <img src="/assets/images/setting_plans/payment_methods/visa.svg" alt="logo-visa"/>
                                        <img src="/assets/images/setting_plans/payment_methods/mastercard.svg" alt="logo-mastercard"/>
                                        <img src="/assets/images/setting_plans/payment_methods/jcb.png" alt="logo-jcb"/>
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
                                          <img src="/assets/images/setting_plans/payment_methods/atm.png" alt="logo-atm"/>
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
                                          <img className={'zalo'} src="/assets/images/payment_method/zalopay.png" alt="logo-zalopay"/>
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

                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_SHOPEE_ACCOUNT_LISTENER);
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
            quantity: stShopeeQuantity
        };
        let request;

        if (!stRenewDetail) {
            //ADD
            request = shopeeService.addOrderPackage
        } else if (stShopeeQuantity === stRenewDetail.numberPackage) {
            //RENEW
            request = shopeeService.renewOrderPackage
        } else {
            //UPGRADE
            request = shopeeService.upgradeOrderPackage
        }
        return new Promise((resolve, reject) => request(data).then(resolve, reject));
    };

    const onPaymentCompleted = (data) => {
        if (stShopeeQuantity) {
            data = {
                ...data,
                expiredDate: moment(stExpiryDate).year(stDurationYear).format('DD/MM/YYYY')
            };
        }
        if (stRenewDetail) {
            data = {
                ...data,
                renewExtension: i18next.t('shopee.page.plans.step1.title')
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
        setStShopeeQuantity(value);
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
            setStDurationYear(stMinExpiryDate.year() + 1);
        }
    };

    return (
        <>
            {stIsFetching && <LoadingScreen/>}
            <div className="shopee-plans-step1 gs-ani__fade-in">
                <div className="plan-info mb-5">
                    <div className="plan-info__price-selector d-mobile-none d-desktop-flex">
                        <table className={'table'}>
                            <colgroup>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '20%'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th><Trans i18nKey="shopee.page.plans.step1.head.plans"/></th>
                                <th><Trans i18nKey="shopee.page.plans.step1.head.quantity"/></th>
                                <th><Trans i18nKey="shopee.page.plans.step1.head.price"/></th>
                                <th><Trans i18nKey="shopee.page.plans.step1.head.duration"/></th>
                                <th><Trans i18nKey="shopee.page.plans.step1.head.totalPrice"/></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><GSTrans t='shopee.page.plans.step1.plan.title'/></td>
                                <td>
                                    <Dropdown className='quantity-dropdown'
                                              isOpen={stDesktopShopeeQtyToggle}
                                              toggle={() => setStDesktopShopeeQtyToggle(toggle => !toggle)}>
                                        <DropdownToggle caret>
                                            <span className='extension-number'>{stShopeeQuantity}</span>
                                        </DropdownToggle>
                                        <DropdownMenu className='extension-number__dropdown'>
                                            {
                                                stShopeeNumber.map((value, index) => (
                                                    <DropdownItem
                                                        key={index}
                                                        onClick={() => changeQuantity(value)}
                                                        active={value === stShopeeQuantity}
                                                    >
                                                        {value}
                                                    </DropdownItem>
                                                ))
                                            }
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stShopeeAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
                                    </div>
                                </td>
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
                                        {CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
                                    </div>
                                </td>
                            </tr>
                            <tr hidden={!stUnusedExtPlan}>
                                <td colSpan={4}
                                    className='text-right text-gray'>
                                    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan"/>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        -{CurrencyUtils.formatMoneyByCurrency(stUnusedExtPlan, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="remove-border-right">
                                    <span hidden={stShowUpgradeMessage} className="warning-message">
                                        {i18n.t((stIsUpgrade)? "page.call.center.plans.step1.shopee.upgrade.title":"page.call.center.plans.step1.shopee.renewing.title")}
                                    </span>
                                </td>
                                <td colSpan={2} className='text-right text-uppercase text-gray remove-border-left'>
                                    <GSTrans t='page.call.center.plans.step1.subTotal.vat'>
                                        VAT <small className='font-weight-bold'>(10%)</small>
                                    </GSTrans>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stVATAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
                                    </div>
                                </td>
                            </tr>
                            <tr className='font-size-16px'>
                                <td colSpan={4} className='text-right text-uppercase'><Trans
                                    i18nKey="page.call.center.plans.step1.total"/></td>
                                <td className='text-blue'>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatMoneyByCurrency(stTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
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
                                            <Trans i18nKey="shopee.page.plans.step1.head.quantity"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                        <Dropdown isOpen={stMobileShopeeQtyToggle}
                                                  toggle={() => setStMobileShopeeQtyToggle(toggle => !toggle)}>
                                            <DropdownToggle caret>
                                                <span className='extension-number'>{stShopeeQuantity}</span>
                                            </DropdownToggle>
                                            <DropdownMenu className='extension-number__dropdown'>
                                                {
                                                    stShopeeNumber.map((value, index) => (
                                                        <DropdownItem
                                                            key={index}
                                                            onClick={() => changeQuantity(value)}
                                                            active={value === stShopeeQuantity}
                                                        >
                                                            {value}
                                                        </DropdownItem>
                                                    ))
                                                }
                                            </DropdownMenu>
                                        </Dropdown>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="shopee.page.plans.step1.head.price"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            {CurrencyUtils.formatMoneyByCurrency(stShopeeAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
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
                                            <Trans i18nKey="shopee.page.plans.step1.head.totalPrice"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            {CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
                                        </span>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <div className="detail-block mb-0" hidden={!stUnusedExtPlan}>
                            <div hidden={!stUnusedExtPlan}>
                                <span className='text-uppercase font-bold text-gray float-left'>
                                    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan"/>:&nbsp;
                                </span>
                                <span className={'font-bold'}>-{CurrencyUtils.formatMoneyByCurrency(stUnusedExtPlan, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}</span>
                            </div>
                        </div>
                        <div className="detail-block">
                            <span hidden={stShowUpgradeMessage} className="warning-message" 
                                style={{marginBottom: "1rem", width: "100%"}}>
                                <GSTrans t={(stIsUpgrade)? "page.call.center.plans.step1.shopee.upgrade.title":"page.call.center.plans.step1.shopee.renewing.title"}>
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
                                {CurrencyUtils.formatMoneyByCurrency(stVATAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}
                            </span>
                        </div>
                        <div className="detail-block font-size-16px font-bold">
                            <span className='text-uppercase'><Trans
                                i18nKey="page.call.center.plans.step1.total"/>: </span>
                            <span className='text-blue'>{CurrencyUtils.formatMoneyByCurrency(stTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : '??')}</span>
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
                            </div>
                            }

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

export default withRouter(ShopeePlansStep1);

ShopeePlansStep1.propTypes = {
    onPaymentCompleted: PropTypes.func,
    onPaymentInCompleted: PropTypes.func,
    paymentObj: PropTypes.object,
    renewId: PropTypes.number
};
