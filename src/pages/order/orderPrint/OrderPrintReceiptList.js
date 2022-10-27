/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/

import React, {useImperativeHandle, useRef} from 'react';
import './OrderPrintReceiptList.sass';
import i18next from 'i18next';
import moment from 'moment';
import {CurrencyUtils, NumberUtils} from '../../../utils/number-format';
import {OrderDetailUtils} from '../../../utils/order-detail-utils';
import ReactToPrint from 'react-to-print';
import GSButton from '../../../components/shared/GSButton/GSButton';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import {any, oneOf, string} from 'prop-types';
import {KEY_PRINT_A4, KEY_PRINT_K57, KEY_PRINT_K80} from '../instorePurchase/complete/OrderInStorePurchaseComplete';
import storageService from '../../../services/storage';
import Constants from '../../../config/Constant';
import _ from 'lodash';
import {CredentialUtils} from '../../../utils/credential';
import {TokenUtils} from '../../../utils/token';
import {PACKAGE_FEATURE_CODES} from '../../../config/package-features';
import {OrderInStorePurchaseContextService} from '../instorePurchase/context/OrderInStorePurchaseContextService';

const PrintListOrderKPOS = React.forwardRef((props, ref) => {

    const refTemplate = useRef(null);
    const refPrint = useRef(null);

    useImperativeHandle(ref, () => ({
        firePrintOrder
    }));

    const firePrintOrder = () => {
        // refPrint.current.handleClick();
    };

    return (
        <div { ...props }>
            <ReactToPrint
                removeAfterPrint
                trigger={ () => (
                    <GSButton style={ { display: 'none' } }>
                        <GSTrans t="page.order.detail.btn.print"/>
                    </GSButton>
                ) }
                pageStyle={ `@media print { @page { size: ${ props.printPageSize.replace(
                    'K',
                    ''
                ) }mm auto;} html, body { -webkit-print-color-adjust: exact;} }` }
                content={ () => refTemplate.current }
                ref={ refPrint }
            />
            <div style={ { display: 'none' } }>
                {
                    [KEY_PRINT_K57, KEY_PRINT_K80].includes(props.printPageSize) &&
                    <PrintTemplateKPOSList ref={ refTemplate } { ...props } />
                }
                {
                    [KEY_PRINT_A4].includes(props.printPageSize) &&
                    <PrintTemplateA4List ref={ refTemplate } { ...props } />
                }
            </div>
        </div>
    );
});

class PrintTemplateKPOSList extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.isPromotion = false;
        this.state = {
            defaultLanguage: 'vi'
        }
        this.removeAccents = this.removeAccents.bind(this);
        this.calculatePayableAmount = this.calculatePayableAmount.bind(this);
    }

    componentDidMount() {
        this._isMounted = true
        const initialLanguage = storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE);
        if (initialLanguage) {
            this.setState({
                defaultLanguage: initialLanguage
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    buildAddress(address, wardCode, districtCode, cityCode) {
        if (!address) {
            return ''
        }

        const cities = this.props.catalog;
        let addressInfo = [address];
        const city = cities.find((city) => city.code === cityCode) || { inCountry: null, districts: [] };
        const district = city.districts.find((district) => district.code === districtCode) || {
            inCountry: null,
            wards: []
        };
        const ward = district.wards.find((ward) => ward.code === wardCode) || { inCountry: null };
        addressInfo.push(ward.inCountry);
        addressInfo.push(district.inCountry);
        addressInfo.push(city.inCountry);
        return addressInfo.filter(v => v !== null).join(', ');
    }

    renderDeliveryName(deliveryName, langCode) {
        if (!deliveryName) return '';
        if (deliveryName.search(/selfdelivery/i) > -1) {
            return this.trans('page.order.detail.information.shippingMethod.self', langCode);
        } else if (deliveryName.search(/ahamove_truck/i) > -1) {
            return this.trans(
                'page.order.detail.information.shippingMethod.AHAMOVE_TRUCK', langCode
            );
        } else if (deliveryName.search(/ahamove_bike/i) > -1) {
            return this.trans(
                'page.order.detail.information.shippingMethod.AHAMOVE_BIKE', langCode
            );
        }
        return deliveryName;
    }

    renderTotalPrice(product) {
        const orgPrice = product.price * product.quantity;
        return CurrencyUtils.formatMoneyByCurrency(orgPrice, CurrencyUtils.getLocalStorageSymbol());
    }

    calculateSubTotalPrice(_productList) {
        const productList = _.cloneDeep(_productList);
        let sum = 0;
        for (const product of productList) {
            sum += product.price * product.quantity;
        }

        return sum;
    }

    calculateVAT(vat) {
        return vat || 0;
    }

    calculateDiscountAmount(_productList, promotion, membership) {
        const productList = _.cloneDeep(_productList);
        let sum = 0;
        for (const product of productList) {
            const discountAmount = product.wholeSale
                ? product.wholeSale.discountAmount
                : product.promotion
                    ? product.promotion.couponItem.promoAmount
                    : 0;
            sum += discountAmount;
        }

        const order = {
            orderInfo: {
                membershipInfo: membership,
                discount: promotion
            },
            items: []
        };
        const discount = OrderDetailUtils.calcOrderDiscount(order);

        const result = (sum += discount);
        return result || 0;
    }

    calculateTotalPrice(productList, shippingFee, promotion, membership, vat) {
        const productItems = _.cloneDeep(productList);
        const discountTotal = OrderInStorePurchaseContextService.calculateDiscountAmount(productList, promotion, membership);
        const subTotal = this.calculateSubTotalPrice(productItems);
        const vatAmount = this.calculateVAT(vat);

        const result = subTotal - discountTotal + vatAmount + shippingFee;
        return result;
    }

    trans(key, langCode) {
        return i18next.t(key, { lng: langCode, fallbackLng: [this.state.defaultLanguage] });
    }

    removeAccents(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    }

    calculateChangeAmount(productList, shippingInfo, promotion, membership, taxAmount, paidAmount) {
        let changePrice = 0;
        const getTotalPrice = this.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount)
        if (paidAmount < getTotalPrice) {
            changePrice = 0
        } else {
            changePrice = paidAmount - getTotalPrice
        }
        return CurrencyUtils.formatMoneyByCurrency(changePrice > 0 ? changePrice : 0, CurrencyUtils.getLocalStorageSymbol())
    }

    calculatePayableAmount(customerDebtAmount, totalPrice, orderStatus) {
        if (orderStatus === Constants.ORDER_STATUS_DELIVERED ||
            orderStatus === Constants.ORDER_STATUS_RETURNED ||
            orderStatus === Constants.ORDER_STATUS_CANCELLED) {
            return CurrencyUtils.formatMoneyByCurrency(customerDebtAmount, CurrencyUtils.getLocalStorageSymbol())
        } else {
            return CurrencyUtils.formatMoneyByCurrency((customerDebtAmount + totalPrice), CurrencyUtils.getLocalStorageSymbol())
        }
    }

    render() {
        const { printPageSize, storeInfo, orderList, langCode, customDomain } = this.props;

        return (
            <>
                {
                    orderList.map((order) => {
                        const { customerInfo, shippingInfo, storeBranch, items, orderInfo } = order;

                        orderInfo.receivedAmount ||= 0

                        return (
                            <div
                                className={ `order-print-page-size_ order-print-page-size_${ printPageSize }` }
                            >
                                <div
                                    className="d-flex flex-column align-top w-100 vh-100 order-in-store-purchase-printer">
                                    {/*HEADER STORE INFO*/ }
                                    <div className="d-flex p-0 mt-0 flex-column align-items-center">
                                        <img
                                            src={ storeInfo.storeImage }
                                            alt={ `logo ${ storeInfo.storeName }` }
                                            width="auto"
                                            height="30px"
                                        />
                                        <h1 className="text-uppercase text-decoration-underline text-center mt-2">
                                            { storeInfo.storeName || '' }
                                        </h1>
                                    </div>
                                    <div>
                                        <div className="pl-2 mt-0">
                                            <div
                                                className="row">{ `${ storeBranch.phoneNumberFirst || storeInfo.storePhone || '' }` }</div>
                                            <div className="row text-break">
                                                { this.buildAddress(storeBranch.address, storeBranch.ward, storeBranch.district, storeBranch.city) }
                                            </div>
                                        </div>
                                    </div>
                                    { !_.isEmpty(customerInfo) && (
                                        <>
                                            <div className="d-flex p-0 justify-content-center align-items-center">
                                                <hr
                                                    style={ {
                                                        border: '1.5px solid #000',
                                                        width: '60%',
                                                        'text-align': 'center'
                                                    } }
                                                />
                                            </div>
                                            {/*CUSTOMER INFO*/ }
                                            <div className="d-flex p-0 w-100 align-items-start font-size-_8rem">
                                                <div className="col-12 p-0 mt-2">
                                                    <div className="row ">
                                                        { `${ this.trans(
                                                            'page.order.instorePurchase.print.kpos.customer.name', langCode
                                                        ) }: ${ customerInfo.name || '' }` }
                                                    </div>
                                                    <div className="row">
                                                        { `${ this.trans(
                                                            'page.order.instorePurchase.print.kpos.customer.phone', langCode
                                                        ) }: ${ customerInfo.phone || '' }` }
                                                    </div>
                                                    <div className="row">
                                                        { `${ this.trans('page.order.instorePurchase.print.kpos.customer.address', langCode) }: 
                          ${ this.buildAddress(shippingInfo.address1, shippingInfo.ward, shippingInfo.district, shippingInfo.country) }` }
                                                    </div>
                                                    <div className="row text-justify text-wrap">
                                                        { `${ this.trans(
                                                            'page.order.instorePurchase.print.kpos.customer.note', langCode
                                                        ) }: ${ orderInfo.note || '' }` }
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) }
                                    <div className="d-flex justify-content-center align-items-center">
                                        <hr
                                            style={ {
                                                border: '1.5px solid #000',
                                                width: '60%',
                                                'text-align': 'center'
                                            } }
                                        />
                                    </div>
                                    {/*PRODUCT LIST*/ }
                                    <div
                                        className="d-flex mb-4 justify-content-center align-items-center font-weight-bold text-center text-uppercase">
                                        <h1 style={ { fontSize: '1.5rem' } }>
                                            { this.trans('page.order.instorePurchase.print.kpos.receipt.title', langCode) }
                                        </h1>
                                    </div>
                                    <table
                                        style={ { color: '#000000', fontSize: '13px !important' } }
                                    >
                                        <tr style={ { borderBottom: '1px solid black' } }>
                                            <th
                                                className=" p-0 text-left text-uppercase font-size-_8rem"
                                                style={ { backgroundColor: '#FFFFFF', borderRight: '0' } }
                                            >
                                                { this.trans('page.order.instorePurchase.print.kpos.product.name', langCode) }
                                            </th>
                                            <th
                                                className="p-0 text-right text-uppercase  font-size-_8rem"
                                                style={ { backgroundColor: '#FFFFFF', borderLeft: '0' } }
                                            >
                                                { this.trans(
                                                    'page.order.instorePurchase.print.kpos.product.priceTotal', langCode
                                                ) }
                                            </th>
                                        </tr>
                                        <tbody>
                                        { items.sort((pervious, current) => {
                                            let compa = 0;
                                            if (this.removeAccents(pervious.name.trim().toLowerCase()) > this.removeAccents(current.name.trim().toLowerCase()))
                                                compa = 1;
                                            else if (this.removeAccents(pervious.name.trim().toLowerCase()) < this.removeAccents(current.name.trim().toLowerCase()))
                                                compa = -1;
                                            return compa;
                                        }).map((product) => {
                                            return (
                                                <tr
                                                    key={ product.id }
                                                    className=" pt-2 pb-2"
                                                    style={ { fontSize: '13px' } }
                                                >
                                                    <td className="col-md-5 pl-0 text-left  font-size-_8rem">
                                                        <div>{ product.name + (!!product.variationName && ` (${ product.variationName.split('|').filter(v => v !== Constants.DEPOSIT.PERCENT_100).join(', ') })`) }</div>
                                                        <div className="mt-2">
                                                            { NumberUtils.formatThousand(product.quantity) }{ ' ' }
                                                            { ' x ' }{ ' ' }
                                                            { CurrencyUtils.formatMoneyByCurrency(
                                                                product.price,
                                                                CurrencyUtils.getLocalStorageSymbol()
                                                            ) }
                                                        </div>
                                                    </td>
                                                    <td className="col-md-3 pr-0 text-right  font-size-_8rem">
                                                        { this.renderTotalPrice(product) }
                                                    </td>
                                                </tr>
                                            );
                                        }) }
                                        </tbody>
                                    </table>
                                    {/*SUBTOTAL PRICE*/ }
                                    <div className="d-flex p-0 mb-2 justify-content-center align-items-center">
                                        <hr style={ { border: '1.5px solid #000', width: '100%' } }/>
                                    </div>
                                    <div className="d-flex p-0 justify-content-between align-items-center">
                                        <div
                                            className="pl-0 text-left text-uppercase font-weight-bold  font-size-_8rem">
                                            { `${ this.trans(
                                                'page.order.instorePurchase.print.kpos.product.subTotal', langCode
                                            ) }:` }
                                        </div>
                                        <div className=" pr-0 text-right text-uppercase font-weight-bold">
                                            { CurrencyUtils.formatMoneyByCurrency(
                                                this.calculateSubTotalPrice(items),
                                                CurrencyUtils.getLocalStorageSymbol()
                                            ) }
                                        </div>
                                    </div>
                                    { OrderInStorePurchaseContextService.calculateDiscountAmount(items, orderInfo.discount, orderInfo.membershipInfo) > 0 && (
                                        <div className="d-flex p-0 justify-content-between align-items-center">
                                            <div className="pl-0 text-left text-uppercase font-weight-bold">
                                                { `${ this.trans('page.order.detail.items.discount', langCode) }:` }
                                            </div>
                                            <div className="pr-0 text-right text-uppercase font-weight-bold">
                                                { '- ' }
                                                { CurrencyUtils.formatMoneyByCurrency(
                                                    OrderInStorePurchaseContextService.calculateDiscountAmount(items, orderInfo.discount, orderInfo.membershipInfo),
                                                    CurrencyUtils.getLocalStorageSymbol()
                                                ) }
                                            </div>
                                        </div>
                                    ) }
                                    {/*VAT*/ }
                                    { orderInfo.totalTaxAmount != null && !isNaN(orderInfo.totalTaxAmount) && (
                                        <div className="d-flex p-0 justify-content-between align-items-start">
                                            <div className="col-3 pl-0 text-left text-uppercase font-weight-bold">
                                                { `${ this.trans(
                                                    'page.order.instorePurchase.print.kpos.product.VAT', langCode
                                                ) }:` }
                                            </div>
                                            <div className=" pr-0 text-right text-uppercase font-weight-bold">
                                                { CurrencyUtils.formatMoneyByCurrency(
                                                    orderInfo.totalTaxAmount,
                                                    CurrencyUtils.getLocalStorageSymbol()
                                                ) }
                                            </div>
                                        </div>
                                    ) }
                                    <div className="d-flex p-0 justify-content-between align-items-start">
                                        <div className="pl-0 text-left text-uppercase font-weight-bold">
                                            { `${ this.trans(
                                                'page.order.instorePurchase.print.kpos.product.shippingFee', langCode
                                            ) }:` }
                                        </div>
                                        <div className=" pr-0 text-right text-uppercase font-weight-bold">
                                            { CurrencyUtils.formatMoneyByCurrency(
                                                orderInfo?.shippingFee || 0,
                                                CurrencyUtils.getLocalStorageSymbol()
                                            ) }
                                        </div>
                                    </div>
                                    <div className="d-flex p-0 mb-2 justify-content-center align-items-center">
                                        <hr style={ { border: '1.5px solid #000', width: '100%' } }/>
                                    </div>
                                    {/*TOTAL PRICE*/ }
                                    <div className="d-flex p-0 mb-2 justify-content-between align-items-center">
                                        <div className=" pl-0 text-left text-uppercase font-weight-bold ">
                                            { `${ this.trans(
                                                'page.order.instorePurchase.print.kpos.product.total', langCode
                                            ) }:` }
                                        </div>
                                        <div className="pr-0 text-right text-uppercase font-weight-bold">
                                            { CurrencyUtils.formatMoneyByCurrency(
                                                this.calculateTotalPrice(
                                                    items,
                                                    orderInfo?.shippingFee || 0,
                                                    orderInfo.discount,
                                                    orderInfo.membershipInfo,
                                                    orderInfo.totalTaxAmount
                                                ),
                                                CurrencyUtils.getLocalStorageSymbol()
                                            ) }
                                        </div>
                                    </div>

                                    { orderInfo.paymentMethod === 'CASH' &&
                                        <>
                                            <div className="point-indicator"/>

                                            <div
                                                className="d-flex p-0 justify-content-between align-items-center font-size-_7rem">
                                                <div className="pl-0 text-left text-uppercase font-weight-500">
                                                    {
                                                        this.trans('page.order.instorePurchase.print.kpos.product.receivedAmount', langCode)
                                                    }:
                                                </div>
                                                <div className="pr-0 text-right">
                                                    { CurrencyUtils.formatMoneyByCurrency(orderInfo.receivedAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                                </div>
                                            </div>

                                            <div
                                                className="d-flex p-0 justify-content-between align-items-center font-size-_7rem">
                                                <div className="pl-0 text-left text-uppercase font-weight-500">
                                                    {
                                                        this.trans('page.order.instorePurchase.print.kpos.product.changeAmount', langCode)
                                                    }:
                                                </div>
                                                <div className="pr-0 text-right">
                                                    { this.calculateChangeAmount(
                                                        items,
                                                        orderInfo?.shippingFee || 0,
                                                        orderInfo.discount,
                                                        orderInfo.membershipInfo,
                                                        orderInfo.totalTaxAmount,
                                                        orderInfo.receivedAmount) }
                                                </div>
                                            </div>
                                        </>
                                    }

                                    {/*CUSTOMER DEBT AMOUNT*/ }
                                    { !isNaN(customerInfo.debtAmount) &&
                                        <>
                                            <div className="point-indicator"/>

                                            <div
                                                className="d-flex p-0 justify-content-between align-items-center font-size-_7rem">
                                                <div className="pl-0 text-left text-uppercase font-weight-500">
                                                    {
                                                        this.trans('page.order.instorePurchase.print.kpos.product.orderRemainingDebt', langCode)
                                                    }:
                                                </div>
                                                <div className="pr-0 text-right">
                                                    { CurrencyUtils.formatMoneyByCurrency(orderInfo.debtAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                                </div>
                                            </div>

                                            <div
                                                className="d-flex p-0 justify-content-between align-items-center font-size-_7rem">
                                                <div className="pl-0 text-left text-uppercase font-weight-500">
                                                    {
                                                        this.trans('page.order.instorePurchase.print.kpos.product.customerDebt', langCode)
                                                    }:
                                                </div>
                                                <div className="pr-0 text-right">
                                                    { CurrencyUtils.formatMoneyByCurrency(customerInfo.debtAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                                </div>
                                            </div>
                                        </>
                                    }

                                    {/*PAYABLE AMOUNT*/ }
                                    <div className="d-flex p-0 mb-2 justify-content-between align-items-center">
                                        <div className=" pl-0 text-left text-uppercase font-weight-bold ">
                                            { `${ this.trans(
                                                'page.order.instorePurchase.print.kpos.payableAmount', langCode
                                            ) }:` }
                                        </div>
                                        <div className="pr-0 text-right text-uppercase font-weight-bold">
                                            { this.calculatePayableAmount(customerInfo.debtAmount,
                                                this.calculateTotalPrice(
                                                    items,
                                                    orderInfo?.shippingFee || 0,
                                                    orderInfo.discount.totalDiscount,
                                                    orderInfo.membershipInfo,
                                                    orderInfo.totalTaxAmount
                                                ),
                                                orderInfo.status) }
                                        </div>
                                    </div>

                                    <div className="point-indicator"/>

                                    {/*SHIPPING*/ }
                                    <div
                                        className="d-flex p-0 align-items-start  font-size-_8rem justify-content-between align-items-center">
                                        <div className="pl-0">
                                            { `${ this.trans(
                                                'page.order.instorePurchase.print.kpos.product.shippingMethod', langCode
                                            ) }:` }
                                        </div>
                                        <div className=" pl-0">
                                            {
                                                orderInfo.deliveryName &&
                                                this.renderDeliveryName(orderInfo.deliveryName, langCode)
                                            }
                                            {
                                                (!orderInfo.deliveryName && orderInfo.channel !== Constants.SITE_CODE_SHOPEE) &&
                                                this.trans('page.order.create.print.shippingMethod.inStore', langCode)
                                            }
                                            {
                                                (!orderInfo.deliveryName && orderInfo.channel === Constants.SITE_CODE_SHOPEE) && '-'
                                            }
                                        </div>
                                    </div>
                                    {/*PAYMENT*/ }
                                    <div
                                        className="d-flex p-0  justify-content-between align-items-center  font-size-_8rem">
                                        <div className="pl-0">
                                            { `${ this.trans(
                                                'page.order.instorePurchase.print.kpos.product.paymentMethod', langCode
                                            ) }:` }
                                        </div>
                                        <div className="pl-0">
                                            { this.trans(`page.order.create.print.paymentMethod.${ orderInfo.paymentMethod }`, langCode) }
                                        </div>
                                    </div>
                                    {/*DISCOUNT*/ }
                                    { orderInfo.discount && orderInfo.discount.discountCode ? (
                                        <div
                                            className="d-flex p-0 justify-content-between align-items-center font-size-_8rem">
                                            <div className=" pl-0">
                                                { `${ this.trans(
                                                    'page.order.instorePurchase.print.kpos.product.discount', langCode
                                                ) }:` }
                                            </div>
                                            <div className="pl-0">{ orderInfo.discount.discountCode }</div>
                                        </div>
                                    ) : (
                                        <></>
                                    ) }
                                    {/*ORDER INFO*/ }
                                    <div
                                        className="d-flex p-0  justify-content-between align-items-center font-size-_8rem">
                                        <div className="pl-0">
                                            { `${ this.trans('page.order.instorePurchase.print.kpos.product.date', langCode) }: ${ moment(moment.now()).format(' DD/MM/YYYY | HH:mm') }` }
                                        </div>
                                    </div>
                                    <div
                                        className="d-flex p-0 justify-content-between align-items-center font-size-_8rem">
                                        { <div className="pl-0 pr-2">
                                            { `${ this.trans('page.order.instorePurchase.print.kpos.product.orderId', langCode) }: #${ orderInfo.orderId }` }
                                        </div> }
                                    </div>
                                    <div className="infomation">
                                        { CredentialUtils.getValueInfoOrder() }
                                    </div>
                                    {/*FOOTER THANK YOU*/ }
                                    { TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE]) &&
                                        <div
                                            className="d-flex mt-4 justify-content-center align-items-center font-size-_8rem text-wrap">
                                            { !customDomain
                                                ? `https://${ storeInfo.storeUrl }.${ storeInfo.storeDomain }`
                                                : `https://${ customDomain }`
                                            }
                                        </div>
                                    }

                                    <div
                                        className="d-flex p-0 justify-content-center align-items-center text-center font-size-_8rem text-wrap">
                                        { `${ this.trans(
                                            'page.order.instorePurchase.print.kpos.product.thankyou', langCode
                                        ) }` }
                                    </div>
                                    <div
                                        className="d-flex p-0 align-items-center justify-content-center  font-size-_8rem text-wrap">
                                        { `${ this.trans(
                                            'page.order.instorePurchase.print.kpos.product.powered', langCode
                                        ) }` }
                                    </div>
                                </div>
                                <p style={ { pageBreakBefore: 'always' } }/>
                            </div>
                        );
                    })
                }
            </>
        )
    }
}

class PrintTemplateA4List extends React.Component {
    constructor() {
        super()
    }

    render() {
        return null
    }
}

PrintListOrderKPOS
    .defaultProps = {
    printPageSize: KEY_PRINT_K57,
    storeInfo: {},
    orderList: [],
    catalog: [],
    langCode: 'vi',
    customDomain: ''
}

PrintListOrderKPOS
    .propTypes = {
    printPageSize: oneOf([KEY_PRINT_K57, KEY_PRINT_K80]),
    storeInfo: any,
    orderList: any,
    catalog: any,
    langCode: string,
    customDomain: string
};

export default PrintListOrderKPOS;
