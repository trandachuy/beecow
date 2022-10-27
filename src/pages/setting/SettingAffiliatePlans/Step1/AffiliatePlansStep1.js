import "./AffiliatePlansStep1.sass";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import React, {useEffect, useState} from "react";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import {Trans} from "react-i18next";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import Constants from "../../../../config/Constant";
import {
    UikFormInputGroup,
    UikRadio,
    UikWidget,
    UikWidgetContent,
} from "../../../../@uik";
import {BroadcastChannelUtil} from "../../../../utils/BroadcastChannel";
import {GSToast} from "../../../../utils/gs-toast";
import {CurrencyUtils, NumberUtils} from "../../../../utils/number-format";
import {PaymentUtils} from "../../../../utils/payment-utils";
import moment from "moment";
import {CredentialUtils} from "../../../../utils/credential";
import PropTypes from "prop-types";
import _ from "lodash";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from "reactstrap";
import {withRouter} from "react-router-dom";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import affiliateService from "../../../../services/AffiliateService";

const PAYMENT_TAB = {
    ONLINE: "online",
    BANK_TRANSFER: "bankTransfer",
};
const BANK_TRANSFER_EXP_DAYS = 3;
const AFFILIATE_NUMBER = {
    DROP_SHIP: [50, 100, 200, 500, ..._.range(1000, 10001, 50)],
    RESELLER: []
}
const storeCurrencyCode = CurrencyUtils.getLocalStorageCurrency()
const storeSymbolCode = CurrencyUtils.getLocalStorageSymbol()
const currentOnlineMethod = PaymentUtils.getPaymentObj().online.currentOnlineMethod;

const AffiliatePlansStep1 = props => {
    const MIN_DURATION = moment().add(1, 'years')
    const serviceType = props.match.params.serviceType
    const [stCurrentPaymentTab, setCurrentPaymentTab] = useState(PAYMENT_TAB.ONLINE);
    const [stOnlineMethod, setStOnlineMethod] = useState(currentOnlineMethod);
    const [stIsProcessing, setStIsProcessing] = useState(false);
    const [stAffiliateQuantity, setStAffiliateQuantity] = useState();
    const [stDurationYear, setStDurationYear] = useState(MIN_DURATION.year());
    const [stPackagePrices, setStPackagePrices] = useState([]);
    const [stRenewDetail, setStRenewDetail] = useState();
    const [stLastRenewDetail, setStLastRenewDetail] = useState();
    const [stStoreAffiliate, setStStoreAffiliate] = useState();
    const [stPackageId, setStPackageId] = useState();
    const [stAffiliateAmount, setStAffiliateAmount] = useState(0);
    const [stSubTotalAmount, setStSubTotalAmount] = useState(0);
    const [stVATAmount, setStVATAmount] = useState(0);
    const [stTotalAmount, setStTotalAmount] = useState(0);
    const [stDesktopAffiliateQtyToggle, setStDesktopAffiliateQtyToggle] = useState(false)
    const [stMobileAffiliateQtyToggle, setStMobileAffiliateQtyToggle] = useState(false)
    const [stAffiliateNumber, setStAffiliateNumber] = useState(AFFILIATE_NUMBER[serviceType])
    const [stUnusedExtPlan, setStUnusedExtPlan] = useState(0)
    const [stOrgRemainingAmount, setStOrgRemainingAmount] = useState(0)
    const [stExpiryDate, setStExpiryDate] = useState(moment())
    const [stMinExpiryDate, setStMinExpiryDate] = useState(MIN_DURATION)
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stDefaultSymbol, setStDefaultSymbol] = useState(storeSymbolCode)
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    useEffect(() => {
        if(CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM){
            setStDefaultSymbol(Constants.CURRENCY.USD.SYMBOL)
        }
        fetchPricingAndOrder(serviceType);
        return () => {
            if (this.channel) {
                this.channel.close();
            }
        }
    }, []);

    useEffect(() => {
        hasUpgradePackage();
    }, [stRenewDetail, stAffiliateQuantity, stStoreAffiliate])

    useEffect(() => {
        updatePrice();
    }, [stAffiliateQuantity, stDurationYear, stPackagePrices, stExpiryDate, stUnusedExtPlan, stRenewDetail, stStoreAffiliate])

    useEffect(() => {
        if (!stAffiliateQuantity || !stRenewDetail) {
            return
        }
        if (stOrgRemainingAmount > stSubTotalAmount) {
            setStUnusedExtPlan(stSubTotalAmount)
        } else {
            setStUnusedExtPlan(stOrgRemainingAmount)
        }

        if (stAffiliateQuantity === stRenewDetail.numberOfService) {
            setStUnusedExtPlan(0);
        }
    }, [stSubTotalAmount, stOrgRemainingAmount])

    useEffect(() => {
        if(storeSymbolCode !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])


    const getPackagePriceByQuantity = () => {
        let packagePrice = stPackagePrices.find(({numberOfService}) => numberOfService === stAffiliateQuantity)

        if (!packagePrice) {
            packagePrice = stPackagePrices.find(({numberOfService}) => numberOfService === 0)
        }

        return packagePrice
    }
    
    const getAffiliatePricingIdByNumber = (number, serviceType) => {
        if (!number) {
            return
        }

        if (serviceType === Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP) {
            switch (number) {
                case 50:
                    return 7
                case 100:
                    return 8
                case 200:
                    return 9
                case 500:
                    return 10
                case 1000:
                    return 11
                default:
                    return 12
            }
        } else {
            return getPackagePriceByQuantity()?.id
        }
    }

    const getCurrencyCode = () => {
        let defaultCode = storeCurrencyCode;
        if(CredentialUtils.getStoreCountryCode() !== Constants.CountryCode.VIETNAM){
            defaultCode = Constants.CURRENCY.USD.CODE
        }else{
            defaultCode = Constants.CURRENCY.VND.CODE
        }
        return defaultCode
    }
    
    const handleFetchPricingAndOrder = {
        DROP_SHIP: (orderDetail, lastOrderDetail, pricePlans, storeAffiliate) => {
            setStRenewDetail(orderDetail)
            setStPackagePrices(pricePlans)
            setStLastRenewDetail(lastOrderDetail)

            if (storeAffiliate.length) {
                setStStoreAffiliate(storeAffiliate[0])
            }

            if (!orderDetail) {
                setStAffiliateQuantity(lastOrderDetail?.numberOfService || AFFILIATE_NUMBER[serviceType][0])
            } else {
                setStAffiliateQuantity(orderDetail.numberOfService);
            }

            if (lastOrderDetail) {
                const newAffiliateNumber = AFFILIATE_NUMBER[serviceType].filter(number => {
                    if (lastOrderDetail.servicePriceId === 6 || lastOrderDetail.servicePriceId === 12) {
                        return number >= lastOrderDetail.numberOfService
                    } else {
                        return getAffiliatePricingIdByNumber(number, serviceType) >= lastOrderDetail.servicePriceId
                    }
                })
                setStAffiliateNumber(newAffiliateNumber)
            }
        },
        RESELLER: (orderDetail, lastOrderDetail, pricePlans, storeAffiliate) => {
            setStRenewDetail(orderDetail)
            setStPackagePrices(pricePlans)
            setStLastRenewDetail(lastOrderDetail)

            if (storeAffiliate.length) {
                setStStoreAffiliate(storeAffiliate[0])
            }

            const numberPackage = lastOrderDetail?.numberOfService || 1
            let cookedAffiliateNumber = pricePlans.filter(({numberOfService}) => numberOfService).map(({numberOfService}) => numberOfService)

            cookedAffiliateNumber = [
                ...cookedAffiliateNumber,
                ..._.range(cookedAffiliateNumber.length + 1, 1001)
            ]
            
            if (!orderDetail) {
                setStAffiliateQuantity(numberPackage)
                if (numberPackage > 1) {
                    cookedAffiliateNumber = cookedAffiliateNumber.slice(numberPackage - 1)
                }
            } else {
                setStAffiliateQuantity(orderDetail.numberOfService);
            }

            if (lastOrderDetail) {
                cookedAffiliateNumber = cookedAffiliateNumber.slice(numberPackage - 1)

                if (cookedAffiliateNumber.length) {
                    setStAffiliateQuantity(cookedAffiliateNumber[0])
                }
            }

            setStAffiliateNumber(cookedAffiliateNumber)
        },
    }

    const fetchPricingAndOrder = async (serviceType) => {
        Promise.all([
            affiliateService.getActiveOrderPackageByStoreId(serviceType, getCurrencyCode()),
            affiliateService.getLastOrderOfStoreAffiliate(serviceType, getCurrencyCode()),
            affiliateService.getPackagePrice({type: serviceType, currencyCode: getCurrencyCode()}),
            affiliateService.getAllStoreAffiliatesOfStore({type: serviceType}),
        ])
            .then(([orderDetail, lastOrderDetail, pricePlans, storeAffiliate]) => {
                handleFetchPricingAndOrder[serviceType](orderDetail, lastOrderDetail, pricePlans, storeAffiliate)
            })
            .catch(() => GSToast.commonError())
    }

    const hasUpgradePackage = () => {
        if (!stRenewDetail || !stAffiliateQuantity || !stStoreAffiliate) {
            return
        }

        const expiryDate = moment(stStoreAffiliate.expiryTime)
        const isExpired = expiryDate.isBefore(moment())

        if (isExpired) {
            //RENEW
            return
        }

        if (stAffiliateQuantity === stRenewDetail.numberOfService) {
            setStDurationYear(expiryDate.year() + 1)
            setStExpiryDate(expiryDate)
            setStMinExpiryDate(moment(expiryDate).add(1, 'years'))
            setStUnusedExtPlan(0)
        } else {
            setStDurationYear(moment().year() + 1)
            setStExpiryDate(moment())
            setStMinExpiryDate(moment().add(1, 'years'));

            affiliateService.getRemainingAmountByStoreId(serviceType, storeCurrencyCode).then(({returnAmount}) => {
                setStOrgRemainingAmount(Math.abs(returnAmount))
            })
        }
    }

    const updatePrice = () => {
        if (!stPackagePrices || !stPackagePrices.length || !stAffiliateQuantity) {
            return
        }

        const numberPackage = stRenewDetail ? stRenewDetail.numberOfService : (serviceType == Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP ? AFFILIATE_NUMBER[serviceType][0] : 1);
        const packagePriceId = getAffiliatePricingIdByNumber(stAffiliateQuantity, serviceType)
        const packagePrice = stPackagePrices.find(pkgPrice => pkgPrice.id === packagePriceId)
        const expiryDate = moment(stStoreAffiliate?.expiryTime)
        const currentExpired = stRenewDetail && expiryDate.isAfter(moment()) && stAffiliateQuantity === numberPackage
            ? expiryDate
            : moment();
        const purchaseYearNumber = stDurationYear - currentExpired.year()
        let affiliatePlanPrice

        if (!packagePrice.numberOfService) {
            affiliatePlanPrice = packagePrice.price * stAffiliateQuantity * 12
        } else {
            affiliatePlanPrice = packagePrice.yearPrice
        }

        const subTotalPrice = (affiliatePlanPrice * purchaseYearNumber);
        const vat = parseFloat(subTotalPrice / 10);
        let totalPrice = 0;
        let getUnusedExtPlan = NumberUtils.formatTwoDecimal(stUnusedExtPlan)
        if(subTotalPrice > stOrgRemainingAmount || packagePrice.numberOfService === numberPackage){
           // fix representation error or roundoff error
            totalPrice = (parseFloat(subTotalPrice)*10 + vat*10 - parseFloat(getUnusedExtPlan)*10)/10
        }
        setStPackageId(packagePrice.id)
        setStAffiliateAmount(affiliatePlanPrice)
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
                                        <img src="/assets/images/setting_plans/payment_methods/visa.svg" alt=""/>
                                        <img src="/assets/images/setting_plans/payment_methods/mastercard.svg" alt=""/>
                                        <img src="/assets/images/setting_plans/payment_methods/jcb.png" alt=""/>
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
                                          <img src="/assets/images/setting_plans/payment_methods/atm.png" alt=""/>
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
                                        <img className={'zalo'} src="/assets/images/payment_method/zalopay.png" alt=""/>
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
                                    <img className={'zalo'} src="/assets/images/payment_method/momo.png" alt=""/>
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
                                               alt={'paypal'}
                                               height={'25'}
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

                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants[`CHANNEL_PAYMENT_AFFILIATE_${serviceType}_LISTENER`]);
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
            currency: getCurrencyCode(),
            paymentMethod: paymentMethod,
            quantity: stAffiliateQuantity,
        };
        let request;
        const isExpired = !stRenewDetail && !!stLastRenewDetail

        if (!stRenewDetail && !stLastRenewDetail) {
            //The first buy affiliate
            request = affiliateService.addOrderPackage(data)
        } else if (stAffiliateQuantity === stRenewDetail.numberOfService || isExpired) {
            //Renew active or expired affiliate
            request = affiliateService.renewOrderPackage(data)
        } else {
            //Upgrade affiliate
            request = affiliateService.upgradeOrderPackage(data)
        }
        return new Promise((resolve, reject) => request.then(resolve, reject));
    };

    const onPaymentCompleted = (data) => {
        data = {
            ...data,
            currency: getCurrencyCode(),
            serviceType
        }
        if (stAffiliateQuantity) {
            data = {
                ...data,
                expiredDate: moment(stExpiryDate).year(stDurationYear).format('DD/MM/YYYY')
            }
        }
        if (props.onPaymentCompleted) {
            props.onPaymentCompleted(data)
        }
    }

    const onPaymentInCompleted = () => {
        if (props.onPaymentInCompleted) {
            props.onPaymentInCompleted()
        }
    };

    const changeQuantity = (value) => {
        setStAffiliateQuantity(value);
    };

    const changeDuration = (e) => {
        const newYear = parseInt(e.currentTarget.value)

        if (newYear > 9999) {
            return;
        }
        setStDurationYear(newYear);
    };

    const blurDuration = (e) => {
        const value = e.currentTarget.value
        if (value === '' || value < stMinExpiryDate.year()) {
            setStDurationYear(stMinExpiryDate.year())
        }
    };

    return (
        <>
            {stIsFetching && <LoadingScreen/>}
            <div className="affiliate-plans-step1 gs-ani__fade-in">
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
                                <th><Trans i18nKey="page.affiliate.plans.step1.head.plans"/></th>
                                <th><Trans i18nKey="page.affiliate.plans.step1.head.quantity"/></th>
                                <th><Trans i18nKey="page.affiliate.plans.step1.head.price"/></th>
                                <th><Trans i18nKey="page.affiliate.plans.step1.head.duration"/></th>
                                <th><Trans i18nKey="page.affiliate.plans.step1.head.totalPrice"/></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><GSTrans t={`page.affiliate.plans.step1.title.${serviceType}`}/></td>
                                <td>
                                    <Dropdown className='quantity-dropdown'
                                              isOpen={stDesktopAffiliateQtyToggle}
                                              toggle={() => setStDesktopAffiliateQtyToggle(toggle => !toggle)}>
                                        <DropdownToggle caret>
                                            <span className='extension-number'>{stAffiliateQuantity}</span>
                                        </DropdownToggle>
                                        <DropdownMenu className='extension-number__dropdown'>
                                            {
                                                stAffiliateNumber.map((value, index) => (
                                                    <DropdownItem
                                                        key={index}
                                                        onClick={() => changeQuantity(value)}
                                                        active={value === stAffiliateQuantity}
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
                                        {CurrencyUtils.formatDigitMoneyByCustom(stAffiliateAmount, stDefaultSymbol, stDefaultPrecision)}
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
                                        {CurrencyUtils.formatDigitMoneyByCustom(stSubTotalAmount, stDefaultSymbol, stDefaultPrecision)}
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
                                        -{CurrencyUtils.formatDigitMoneyByCustom(stUnusedExtPlan, stDefaultSymbol, stDefaultPrecision)}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4}
                                    className='text-right text-uppercase text-gray'>
                                    <GSTrans t='page.call.center.plans.step1.subTotal.vat'>
                                        VAT <small className='font-weight-bold'>(10%)</small>
                                    </GSTrans>
                                </td>
                                <td>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatDigitMoneyByCustom(stVATAmount, stDefaultSymbol, stDefaultPrecision)}
                                    </div>
                                </td>
                            </tr>
                            <tr className='font-size-16px'>
                                <td colSpan={4} className='text-right text-uppercase'><Trans
                                    i18nKey="page.call.center.plans.step1.total"/></td>
                                <td className='text-blue'>
                                    <div className='calculate-pricing'>
                                        {CurrencyUtils.formatDigitMoneyByCustom(stTotalAmount, stDefaultSymbol, stDefaultPrecision)}
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
                                            <Trans i18nKey="page.affiliate.plans.step1.head.plans"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                       <GSTrans t='page.affiliate.plans.step1.plan.title'/>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.affiliate.plans.step1.head.quantity"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                        <Dropdown isOpen={stMobileAffiliateQtyToggle}
                                                  toggle={() => setStMobileAffiliateQtyToggle(toggle => !toggle)}>
                                            <DropdownToggle caret>
                                                <span className='extension-number'>{stAffiliateQuantity}</span>
                                            </DropdownToggle>
                                            <DropdownMenu className='extension-number__dropdown'>
                                                {
                                                    stAffiliateNumber.map((value, index) => (
                                                        <DropdownItem
                                                            key={index}
                                                            onClick={() => changeQuantity(value)}
                                                            active={value === stAffiliateQuantity}
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
                                            <Trans i18nKey="page.affiliate.plans.step1.head.price"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            {CurrencyUtils.formatDigitMoneyByCustom(stAffiliateAmount, stDefaultSymbol, stDefaultPrecision)}
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.affiliate.plans.step1.head.duration"/>:&nbsp;
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
                                            <Trans i18nKey="page.affiliate.plans.step1.head.totalPrice"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            {CurrencyUtils.formatDigitMoneyByCustom(stSubTotalAmount, stDefaultSymbol, stDefaultPrecision)}
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
                                <span className={'font-bold'}>-{CurrencyUtils.formatDigitMoneyByCustom(stUnusedExtPlan, stDefaultSymbol, stDefaultPrecision)}</span>
                            </div>
                        </div>
                        <div className="detail-block">
                            <span className='text-uppercase font-bold text-gray'>
                                <GSTrans t='page.call.center.plans.step1.subTotal.vat'>
                                    VAT <small className='font-weight-bold'>(10%)</small>
                                </GSTrans>
                                :&nbsp;
                            </span>
                            <span
                                className='font-bold'>{CurrencyUtils.formatDigitMoneyByCustom(stVATAmount, stDefaultSymbol, stDefaultPrecision)}</span>
                        </div>
                        <div className="detail-block font-size-16px font-bold">
                            <span className='text-uppercase'><Trans
                                i18nKey="page.call.center.plans.step1.total"/>: </span>
                            <span className='text-blue'>{CurrencyUtils.formatDigitMoneyByCustom(stTotalAmount, stDefaultSymbol, stDefaultPrecision)}</span>
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
                                <img src="/assets/images/setting_plans/icon-alert.svg" alt=""/>
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
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.affiliate"/>
                                    {props.paymentObj.bankTransfer.affiliate}
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

export default withRouter(AffiliatePlansStep1);

AffiliatePlansStep1.propTypes = {
    onPaymentCompleted: PropTypes.func,
    onPaymentInCompleted: PropTypes.func,
    paymentObj: PropTypes.object,
    renewId: PropTypes.number
};
