import './BranchPlansStep1.sass'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import React, {useEffect, useState} from 'react'
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader'
import {Trans} from 'react-i18next'
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import Constants from '../../../../config/Constant'
import {UikFormInputGroup, UikRadio, UikWidget, UikWidgetContent} from '../../../../@uik'
import {BroadcastChannelUtil} from '../../../../utils/BroadcastChannel'
import {GSToast} from '../../../../utils/gs-toast'
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format'
import moment from 'moment'
import {CredentialUtils} from '../../../../utils/credential'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import {withRouter} from 'react-router-dom'
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen'
import storeService from '../../../../services/StoreService'
import i18next from 'i18next'
import {PaymentUtils} from "../../../../utils/payment-utils";

const PAYMENT_TAB = {
    ONLINE: 'online',
    BANK_TRANSFER: 'bankTransfer'
}
const BANK_TRANSFER_EXP_DAYS = 3
const currentOnlineMethod = PaymentUtils.getPaymentObj().online.currentOnlineMethod;

const BranchPlansStep1 = props => {
    const MIN_DURATION = moment().add(1, 'years')
    const [stCurrentPaymentTab, setCurrentPaymentTab] = useState(PAYMENT_TAB.ONLINE)
    const [stOnlineMethod, setStOnlineMethod] = useState(currentOnlineMethod)
    const [stIsProcessing, setStIsProcessing] = useState(false)
    const [stBranchQuantity, setStBranchQuantity] = useState()
    const [stDurationYear, setStDurationYear] = useState(MIN_DURATION.year())
    const [stPackagePrices, setStPackagePrices] = useState([])
    const [stRenewDetail, setStRenewDetail] = useState()
    const [stPackageId, setStPackageId] = useState()
    const [stBranchAmount, setStBranchAmount] = useState(0)
    const [stSubTotalAmount, setStSubTotalAmount] = useState(0)
    const [stVATAmount, setStVATAmount] = useState(0)
    const [stTotalAmount, setStTotalAmount] = useState(0)
    const [stDesktopBranchQtyToggle, setStDesktopBranchQtyToggle] = useState(false)
    const [stMobileBranchQtyToggle, setStMobileBranchQtyToggle] = useState(false)
    const [stBranchNumber, setStBranchNumber] = useState([])
    const [stUnusedExtPlan, setStUnusedExtPlan] = useState(0)
    const [stOrgRemainingAmount, setStOrgRemainingAmount] = useState(0)
    const [stExpiryDate, setStExpiryDate] = useState(moment())
    const [stMinExpiryDate, setStMinExpiryDate] = useState(MIN_DURATION)
    const [stIsFetching, setStIsFetching] = useState(false)

    useEffect(() => {
        fetchPricingAndOrder()
        return () => {
            if (this.channel) {
                this.channel.close()
            }
        }
    }, [])

    useEffect(() => {
        hasUpgradePackage()
    }, [stRenewDetail, stBranchQuantity])

    useEffect(() => {
        updatePrice()
    }, [stBranchQuantity, stDurationYear, stPackagePrices, stExpiryDate, stUnusedExtPlan, stRenewDetail])

    useEffect(() => {
        if (!stBranchQuantity || !stRenewDetail) {
            return
        }

        const vat = Math.ceil(stSubTotalAmount / 10)

        if (stOrgRemainingAmount > (stSubTotalAmount + vat)) {
            setStUnusedExtPlan(stSubTotalAmount + vat)
        } else {
            setStUnusedExtPlan(stOrgRemainingAmount)
        }

        if (stBranchQuantity === stRenewDetail.numberPackage) {
            setStUnusedExtPlan(0)
        }
    }, [stSubTotalAmount, stOrgRemainingAmount])

    const fetchPricingAndOrder = async () => {
        try {
            const orderDetail = await storeService.getActiveOrderPackageByStoreId({
                channel: Constants.PACKAGE_PRICE_CHANNEL.BRANCH
            })
            const lastOrderDetail = await storeService.getLastOrderOfStoreBranch({
                channel: Constants.PACKAGE_PRICE_CHANNEL.BRANCH
            })
            const pricePlans = await storeService.getPackagePrice({
                channel: Constants.PACKAGE_PRICE_CHANNEL.BRANCH,
                currencyCode: CurrencyUtils.getLocalStorageCountry() === 'VN' ? 'VND' : 'USD'
            })
            setStRenewDetail(orderDetail)
            setStPackagePrices(pricePlans)

            //in case: expired branch
            const numberPackage = lastOrderDetail?.numberPackage || 1
            let cookedBranchNumber = pricePlans.filter(({branchNumber}) => branchNumber).map(({branchNumber}) => branchNumber)

            cookedBranchNumber = [
                ...cookedBranchNumber,
                ..._.range(cookedBranchNumber.length + 1, 1001)
            ]

            if (!orderDetail) {
                setStBranchQuantity(numberPackage)
                if (numberPackage > 1) {
                    cookedBranchNumber = cookedBranchNumber.slice(numberPackage - 1)
                }
            } else {
                setStBranchQuantity(orderDetail.numberPackage)
            }


            if (orderDetail && !moment.unix(orderDetail.expiryDate).isBefore(moment())) {
                //not expired
                cookedBranchNumber = cookedBranchNumber.slice(numberPackage - 1)

                if (cookedBranchNumber.length) {
                    setStBranchQuantity(cookedBranchNumber[0])
                }
            }

            setStBranchNumber(cookedBranchNumber)
        } catch (e) {
            GSToast.commonError()
        }
    }

    const hasUpgradePackage = () => {
        if (!stRenewDetail || !stBranchQuantity) {
            return
        }

        const isExpired = moment.unix(stRenewDetail.expiryDate).isBefore(moment())

        if (isExpired) {
            //RENEW
            return
        }

        if (stBranchQuantity === stRenewDetail.numberPackage) {
            //not expiry
            setStDurationYear(moment.unix(stRenewDetail.expiryDate).year() + 1)
            setStExpiryDate(moment.unix(stRenewDetail.expiryDate))
            setStMinExpiryDate(moment.unix(stRenewDetail.expiryDate).add(1, 'years'))
            setStUnusedExtPlan(0)
        } else {
            setStDurationYear(moment().year() + 1)
            setStExpiryDate(moment())
            setStMinExpiryDate(moment().add(1, 'years'))
        }
        storeService.getRemainingAmountByStoreId({
            channel: Constants.PACKAGE_PRICE_CHANNEL.BRANCH,
            currencyCode: CredentialUtils.getCurrencyCode() === Constants.CURRENCY.VND.CODE ? Constants.CURRENCY.VND.CODE : Constants.CURRENCY.USD.CODE
        }).then(returnAmount => {
            setStOrgRemainingAmount(Math.abs(returnAmount))
        })
    }

    const getPackagePriceByQuantity = () => {
        let packagePrice = stPackagePrices.find(({branchNumber}) => branchNumber === stBranchQuantity)

        if (!packagePrice) {
            packagePrice = stPackagePrices.find(({branchNumber}) => branchNumber === 0)
        }

        return packagePrice
    }

    const updatePrice = () => {
        if (!stPackagePrices || !stPackagePrices.length || !stBranchQuantity) {
            return
        }

        const numberPackage = stRenewDetail ? stRenewDetail.numberPackage : 1
        const packagePrice = getPackagePriceByQuantity()
        let currentExpired = stRenewDetail && stRenewDetail.expiryDate && moment.unix(stRenewDetail.expiryDate).isAfter(moment()) && stBranchQuantity === numberPackage ? moment.unix(stRenewDetail.expiryDate) : moment()
        const purchaseYearNumber = stDurationYear - currentExpired.year()
        let branchPlanPrice

        if (packagePrice.branchNumber === 0) {
            branchPlanPrice = packagePrice.pricePerBranch * stBranchQuantity
        } else {
            branchPlanPrice = packagePrice.packagePrice
        }

        const subTotalPrice = (branchPlanPrice * purchaseYearNumber)
        const vat = CurrencyUtils.getLocalStorageCountry() === 'VN' ? Math.ceil(subTotalPrice / 10) : NumberUtils.formatThousandFixed(subTotalPrice / 10,  2)
        const totalPrice = ((subTotalPrice + parseFloat(vat)) > stUnusedExtPlan || packagePrice.branchNumber === numberPackage) ? (subTotalPrice + parseFloat(vat) - stUnusedExtPlan) : 0

        setStPackageId(packagePrice.id)
        setStBranchAmount(branchPlanPrice)
        setStSubTotalAmount(subTotalPrice)
        setStVATAmount(totalPrice <= 0 ? 0 : vat)
        setStTotalAmount(totalPrice)
    }

    const switchPaymentTab = (paymentTab) => {
        setCurrentPaymentTab(paymentTab)
    }

    const onSelectedOnlineMethod = (payment) => {
        setStOnlineMethod(payment)
    }

    const renderPaymentMethod = () => {
        let paymentOptions = []

        for (let [index, payment] of props.paymentObj.online.methods.entries()) {
            if (payment === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD) {
                paymentOptions.push(
                    <UikRadio key={ index }
                              name="paymentMethod"
                              defaultChecked={ payment === stOnlineMethod }
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img src="/assets/images/setting_plans/payment_methods/visa.svg"/>
                                          <img src="/assets/images/setting_plans/payment_methods/mastercard.svg"/>
                                          <img src="/assets/images/setting_plans/payment_methods/jcb.png"/>
                                      </div>
                                  )
                              }
                              onClick={ () => onSelectedOnlineMethod(payment) }
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING) {
                paymentOptions.push(
                    <UikRadio key={ index }
                              name="paymentMethod"
                              defaultChecked={ payment === stOnlineMethod }
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img src="/assets/images/setting_plans/payment_methods/atm.png"/>
                                      </div>
                                  )
                              }
                              onClick={ () => onSelectedOnlineMethod(payment) }
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_ZALO) {
                paymentOptions.push(
                    <UikRadio key={ index }
                              name="paymentMethod"
                              defaultChecked={ payment === stOnlineMethod }
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className={ 'zalo' } src="/assets/images/payment_method/zalopay.png"/>
                                      </div>
                                  )
                              }
                              onClick={ () => onSelectedOnlineMethod(payment) }
                    />
                )
            }
            if (payment === Constants.ORDER_PAYMENT_METHOD_MOMO) {
                paymentOptions.push(
                    <UikRadio key={ index }
                              name="paymentMethod"
                              defaultChecked={ payment === stOnlineMethod }
                              label={
                                  (
                                      <div className="online-payment__credit-img-list">
                                          <img className={ 'zalo' } src="/assets/images/payment_method/momo.png"/>
                                      </div>
                                  )
                              }
                              onClick={ () => onSelectedOnlineMethod(payment) }
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
                { paymentOptions }
            </UikFormInputGroup>
        )
    }

    const onPaymentOnline = () => {
        const paymentMethod = stOnlineMethod
        let winRef = window.open('about:blank', '_blank')
        onPayment(paymentMethod)
            .then(value => {
                if (value.paymentUrl) {
                    winRef.location = value.paymentUrl

                    this.channel = BroadcastChannelUtil.createBroadcastChannel(Constants.CHANNEL_PAYMENT_BRANCH_LISTENER)
                    this.channel.onmessage = (evt) => {
                        const result = evt.data
                        switch (result.event) {
                            case 'success':
                                onPaymentCompleted({
                                    total: result.amount,
                                    paymentMethod: stOnlineMethod,
                                    orderId: result.orderId
                                })
                                break
                            case 'fail':
                                onPaymentInCompleted()
                                break
                            default:
                        }
                    }
                }
            })
            .catch(onPaymentInCompleted)
            .finally(() => setStIsProcessing(false))
    }

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
    }

    const onPayment = (paymentMethod) => {
        let data = {
            storeId: CredentialUtils.getStoreId(),
            userId: CredentialUtils.getUserId(),
            packageId: stPackageId,
            year: moment(stExpiryDate).year(stDurationYear).diff(moment(stExpiryDate), 'years'),
            currencyCode: CredentialUtils.getStoreCountryCode() === 'VN' ? 'VND' : 'USD',
            paymentMethod: paymentMethod,
            quantity: stBranchQuantity,
            channel: Constants.ORDER_PACKAGE_CHANNEL.BRANCH
        }
        let request

        if (!stRenewDetail) {
            //ADD
            request = storeService.addOrderPackage
        } else if (stBranchQuantity === stRenewDetail.numberPackage) {
            //RENEW
            request = storeService.renewOrderPackage
        } else {
            //UPGRADE
            request = storeService.upgradeOrderPackage
        }
        return new Promise((resolve, reject) => request(data).then(resolve, reject))
    }

    const onPaymentCompleted = (data) => {
        if (stBranchQuantity) {
            data = {
                ...data,
                expiredDate: moment(stExpiryDate).set('year', stDurationYear).format('DD/MM/YYYY')
            }
        }
        if (stRenewDetail) {
            data = {
                ...data,
                renewExtension: i18next.t('page.branch.plans.step1.branch')
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
    }

    const changeQuantity = (value) => {
        setStBranchQuantity(value)
    }

    const changeDuration = (e) => {
        const newYear = parseInt(e.currentTarget.value)

        if (newYear > 9999) {
            return
        }
        setStDurationYear(newYear)
    }

    const blurDuration = (e) => {
        const value = e.currentTarget.value
        if (value === '' || value < stMinExpiryDate.year()) {
            setStDurationYear(stMinExpiryDate.year())
        }
    }

    return (
        <>
            { stIsFetching && <LoadingScreen/> }
            <div className="branch-plans-step1 gs-ani__fade-in">
                <div className="plan-info mb-5">
                    <div className="plan-info__price-selector d-mobile-none d-desktop-flex">
                        <table className={ 'table' }>
                            <colgroup>
                                <col style={ { width: '20%' } }/>
                                <col style={ { width: '20%' } }/>
                                <col style={ { width: '20%' } }/>
                                <col style={ { width: '20%' } }/>
                                <col style={ { width: '20%' } }/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th><Trans i18nKey="page.branch.plans.step1.head.plans"/></th>
                                <th><Trans i18nKey="page.branch.plans.step1.head.quantity"/></th>
                                <th><Trans i18nKey="page.branch.plans.step1.head.price"/></th>
                                <th><Trans i18nKey="page.branch.plans.step1.head.duration"/></th>
                                <th><Trans i18nKey="page.branch.plans.step1.head.totalPrice"/></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><GSTrans t="page.branch.plans.step1.plan.title"/></td>
                                <td>
                                    <Dropdown className="quantity-dropdown"
                                              isOpen={ stDesktopBranchQtyToggle }
                                              toggle={ () => setStDesktopBranchQtyToggle(toggle => !toggle) }>
                                        <DropdownToggle caret>
                                            <span className="extension-number">{ stBranchQuantity }</span>
                                        </DropdownToggle>
                                        <DropdownMenu className="extension-number__dropdown">
                                            {
                                                stBranchNumber.map((value, index) => (
                                                    <DropdownItem
                                                        key={ index }
                                                        onClick={ () => changeQuantity(value) }
                                                        active={ value === stBranchQuantity }
                                                    >
                                                        { value }
                                                    </DropdownItem>
                                                ))
                                            }
                                        </DropdownMenu>
                                    </Dropdown>
                                </td>
                                <td>
                                    <div className="calculate-pricing">
                                        { CurrencyUtils.formatMoneyByCurrency(stBranchAmount,stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                    </div>
                                </td>
                                <td>
                                    <div className="input-date">
                                        <span className={ 'date-prefix' }>{ stExpiryDate.format('DD/MM/') }</span>
                                        <input className="text-center"
                                               type="number"
                                               min={ stMinExpiryDate.year() }
                                               max={ stMinExpiryDate.year() + 5 }
                                               value={ stDurationYear }
                                               onChange={ changeDuration }
                                               onBlur={ blurDuration }/>
                                    </div>
                                </td>
                                <td>
                                    <div className="calculate-pricing">
                                        { CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                    </div>
                                </td>
                            </tr>
                            <tr hidden={ !stUnusedExtPlan }>
                                <td colSpan={ 4 }
                                    className="text-right text-gray">
                                    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan"/>
                                </td>
                                <td>
                                    <div className="calculate-pricing">
                                        -{ CurrencyUtils.formatMoneyByCurrency(stUnusedExtPlan, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={ 4 }
                                    className="text-right text-uppercase text-gray">
                                    <GSTrans t="page.call.center.plans.step1.subTotal.vat">
                                        VAT <small className="font-weight-bold">(10%)</small>
                                    </GSTrans>
                                </td>
                                <td>
                                    <div className="calculate-pricing">
                                        { CurrencyUtils.formatMoneyByCurrency(stVATAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                    </div>
                                </td>
                            </tr>
                            <tr className="font-size-16px">
                                <td colSpan={ 4 } className="text-right text-uppercase"><Trans
                                    i18nKey="page.call.center.plans.step1.total"/></td>
                                <td className="text-blue">
                                    <div className="calculate-pricing">
                                        { CurrencyUtils.formatMoneyByCurrency(stTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/*MOBILE*/ }
                    <div className="plan-info__price-selector d-mobile-flex d-desktop-none">
                        <UikWidget className="gs-widget">
                            <UikWidgetContent className="gs-widget__content">
                                <div className="setting__account">
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.branch.plans.step1.head.plans"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                       <GSTrans t="page.branch.plans.step1.plan.title"/>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.branch.plans.step1.head.quantity"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                        <Dropdown isOpen={ stMobileBranchQtyToggle }
                                                  toggle={ () => setStMobileBranchQtyToggle(toggle => !toggle) }>
                                            <DropdownToggle caret>
                                                <span className="extension-number">{ stBranchQuantity }</span>
                                            </DropdownToggle>
                                            <DropdownMenu className="extension-number__dropdown">
                                                {
                                                    stBranchNumber.map((value, index) => (
                                                        <DropdownItem
                                                            key={ index }
                                                            onClick={ () => changeQuantity(value) }
                                                            active={ value === stBranchQuantity }
                                                        >
                                                            { value }
                                                        </DropdownItem>
                                                    ))
                                                }
                                            </DropdownMenu>
                                        </Dropdown>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.branch.plans.step1.head.price"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            { CurrencyUtils.formatMoneyByCurrency(stBranchAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.branch.plans.step1.head.duration"/>:&nbsp;
                                        </span>
                                        <span className="account__line2">
                                            <div className="input-date w-100">
                                                <span
                                                    className={ 'date-prefix' }>{ stExpiryDate.format('DD/MM/') }</span>
                                                <input type="number"
                                                       min={ stMinExpiryDate.year() }
                                                       max={ stMinExpiryDate.year() + 5 }
                                                       value={ stDurationYear }
                                                       onChange={ changeDuration }
                                                       onBlur={ blurDuration }/>
                                            </div>
                                        </span>
                                    </div>
                                    <div className="account__block">
                                        <span className="gs-frm-input__label">
                                            <Trans i18nKey="page.branch.plans.step1.head.totalPrice"/>:&nbsp;
                                        </span>
                                        <span className="account__line2 font-bold">
                                            { CurrencyUtils.formatMoneyByCurrency(stSubTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }
                                        </span>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <div className="detail-block mb-0" hidden={ !stUnusedExtPlan }>
                            <div hidden={ !stUnusedExtPlan }>
                                <span className="text-uppercase font-bold text-gray float-left">
                                    <Trans i18nKey="page.call.center.plans.step1.unusedExtPlan"/>:&nbsp;
                                </span>
                                <span
                                    className={ 'font-bold' }>-{ CurrencyUtils.formatMoneyByCurrency(stUnusedExtPlan, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }</span>
                            </div>
                        </div>
                        <div className="detail-block">
                            <span className="text-uppercase font-bold text-gray">
                                <GSTrans t="page.call.center.plans.step1.subTotal.vat">
                                    VAT <small className="font-weight-bold">(10%)</small>
                                </GSTrans>
                                :&nbsp;
                            </span>
                            <span
                                className="font-bold">{ CurrencyUtils.formatMoneyByCurrency(Math.ceil(stVATAmount), stPackagePrices[0] ? stPackagePrices[0].currency : 'đ') }</span>
                        </div>
                        <div className="detail-block font-size-16px font-bold">
                            <span className="text-uppercase"><Trans
                                i18nKey="page.call.center.plans.step1.total"/>: </span>
                            <span className="text-blue">{ CurrencyUtils.formatMoneyByCurrency(stTotalAmount, stPackagePrices[0] ? stPackagePrices[0].currency : 'đ')}</span>
                        </div>
                    </div>
                </div>
                <div className="widget__title">
                    <GSTrans t="page.call.center.plans.step1.paymentMethod.title"/>
                </div>
                <GSWidget className="m-0">
                    <GSWidgetHeader bg={ GSWidgetHeader.TYPE.WHITE }>
                        <div className="btn-group mb-2 mt-2">
                            <button
                                className={ ['btn', stCurrentPaymentTab === PAYMENT_TAB.ONLINE ? 'btn-secondary' : 'btn-outline-secondary'].join(' ') }
                                onClick={ () => switchPaymentTab(PAYMENT_TAB.ONLINE) }>
                                <span className="d-desktop-inline d-mobile-none">
                                    <Trans i18nKey="page.setting.plans.step2.onlinePayment"/>
                                </span>
                                <span className="d-desktop-none d-mobile-inline">
                                    <Trans i18nKey="page.setting.plans.step2.onlinePayment.mobile"/>
                                </span>
                            </button>

                            <button
                                style={CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM ? {cursor:'default'} : {}}
                                className={ ['btn', stCurrentPaymentTab === PAYMENT_TAB.BANK_TRANSFER ? 'btn-secondary' : 'btn-outline-secondary'].join(' ') }
                                onClick={ () => switchPaymentTab(PAYMENT_TAB.BANK_TRANSFER) }>
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

                        {/*ONLINE PAYMENT*/ }
                        { stCurrentPaymentTab === PAYMENT_TAB.ONLINE &&
                        <div className="online-payment mb-2 mt-2">
                            <div className="online-payment__selector">
                                { renderPaymentMethod() }
                            </div>
                        </div>
                        }

                        {/*BANK TRANSFER*/ }
                        { stCurrentPaymentTab === PAYMENT_TAB.BANK_TRANSFER &&
                        <div className="bank-transfer mb-2 mt-2">
                            <div className="bank-transfer__requirement">
                                <img src="/assets/images/setting_plans/icon-alert.svg"/>
                                <div className="bank-transfer__req-content-wrapper">
                                    <span className="bank-transfer__req-title">
                                        <GSTrans t="page.setting.plans.step2.bankTransfer.req.title"/>
                                    </span>
                                    <span className="bank-transfer__req-content">
                                        <GSTrans t="page.setting.plans.step2.bankTransfer.req.content" values={ {
                                            days: BANK_TRANSFER_EXP_DAYS
                                        } }/>
                                    </span>
                                </div>
                            </div>
                            {CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM &&
                            <div className="bank-transfer__info">
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                    { props.paymentObj.bankTransfer.accountOwner }
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                    { props.paymentObj.bankTransfer.accountNumber }
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                    { props.paymentObj.bankTransfer.bank }
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                    { props.paymentObj.bankTransfer.branch }
                                </p>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                    { props.paymentObj.bankTransfer.content }
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
                        </div> }
                    </GSWidgetContent>
                </GSWidget>

                <div
                    className="d-flex justify-content-md-between justify-content-center flex-md-row flex-column-reverse align-items-md-center mt-4">
                    <div className="d-flex justify-content-center flex-grow-1">
                        <GSButton success
                                  className="btn-pay"
                                  disabled={ stIsProcessing }
                                  onClick={ () => {
                                      setStIsProcessing(true)
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
}

export default withRouter(BranchPlansStep1)

BranchPlansStep1.propTypes = {
    onPaymentCompleted: PropTypes.func,
    onPaymentInCompleted: PropTypes.func,
    paymentObj: PropTypes.object,
    renewId: PropTypes.number
}
