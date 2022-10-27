/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useImperativeHandle, useRef} from 'react'
import ReactToPrint from 'react-to-print'
import GSButton from '../../../../../components/shared/GSButton/GSButton'
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans'
import {CurrencyUtils, NumberUtils} from '../../../../../utils/number-format'
import './PrintTemplateA4.sass'
import {OrderInStorePurchaseContextService} from '../../context/OrderInStorePurchaseContextService'
import * as _ from 'lodash'
import {any, array, number, string} from 'prop-types'
import storageService from '../../../../../services/storage'
import Constants from '../../../../../config/Constant'
import moment from 'moment'
import {OrderInStorePurchaseContext} from '../../context/OrderInStorePurchaseContext'
import {WindowUtils} from '../../../../../utils/download'
import ReactDOMServer from 'react-dom/server'
import i18next from 'i18next'
import {CredentialUtils} from '../../../../../utils/credential'
import {TokenUtils} from '../../../../../utils/token'
import {PACKAGE_FEATURE_CODES} from '../../../../../config/package-features'

const PrintTemplateA4 = React.forwardRef((props, ref) => {
    const refTemplate = useRef(null)
    const refPrint = useRef(null)

    const isEnabled = props.productList.filter(p => p.checked).length > 0

    useImperativeHandle(
        ref,
        () => ({
            onPrint
        })
    )

    const onPrint = () => {
        const htmlTemplate = OrderReceiptPrinterTemplate(props)
        WindowUtils.openFileInNewTab(htmlTemplate)
    }

    return (
        <div {...props}>
            <ReactToPrint
                trigger={() => (
                    <GSButton default disabled={!isEnabled}>
                        <GSTrans t="page.order.detail.btn.print"/>
                    </GSButton>
                )}
                content={() => refTemplate.current}
                ref={refPrint}
            />
            <div style={{visibility: 'hidden', width: 0}}>
                <Template ref={refTemplate} {...props}/>
            </div>
        </div>
    )
})

const OrderReceiptPrinterTemplate = (props) => {
    const body = ReactDOMServer.renderToString(<Template {...props}/>)
    const options = {
        pageSize: 'a4',
        canvasStyle: 'width: 38mm;height: 10mm;padding-left: 2mm;padding-right: 2mm',
        bodyPrintStyle: 'margin: 1mm !important;display: block;-webkit-print-color-adjust: exact;',
        bodyStyle: 'padding: 0 10mm 12mm 10mm; margin: 0 auto;width: 210mm; display: flex; flex-direction: column; align-items: center;'
    }

    const template = `
        <html>
            <head>
                <meta charSet="utf-8"/>
                <title>Barcode printer</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/barcodes/JsBarcode.code128.min.js"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"></link>
                <style>
                    @page {
                        size: ${options.pageSize};
                    }
                    * {
                        box-sizing: border-box;
                    }
                    canvas {
                        ${options.canvasStyle}
                    }
                    @media print {
                        body {
                            ${options.bodyPrintStyle}
                        }                    
                    }
                    .print-template-a4 .page-header {
                      /*position: fixed;*/
                      /*top: 0;*/
                      /*width: 90%;*/
                    }
                    .print-template-a4 .page-header-wrapper {
                      display: flex;
                      flex-direction: column;
                      width: 100%;
                      padding-bottom: 10px;
                    }
                    .print-template-a4 .page-header-content {
                      display: flex;
                      align-items: center;
                      width: 100%;
                    }
                    .print-template-a4 .page-header .indicator {
                      width: 100%;
                      height: 3px;
                      background-color: rgba(0, 0, 0, 0.5);
                      margin-top: 10px;
                    }
                    .print-template-a4 .page-header .indicator::after {
                      content: "";
                      width: 100%;
                      height: 1px;
                      display: inline-block;
                      background-color: rgba(0, 0, 0, 0.5);
                      margin-top: 5px;
                    }
                    .print-template-a4 .table-information tr td {
                      width: fit-content;
                      padding: 5px 10px 0 0;
                      border: none;
                      vertical-align: baseline;
                    }
                    .print-template-a4 .table-information tr td.title {
                      white-space: pre;
                    }
                    .print-template-a4 .product-list table {
                      table-layout: fixed;
                    }
                    .print-template-a4 .product-list table thead {
                    }
                    .print-template-a4 .product-list table td, .print-template-a4 .product-list table th {
                      padding: 0.5rem 0.5rem;
                      font-size: 16px;
                      border: none;
                    }
                    .print-template-a4 .product-list table .border-0 td {
                      padding: 0.2rem 0.5rem;
                    }
                    .print-template-a4 .product-list table th {
                      background-color: rgba(0, 0, 0, 0.05);
                      text-transform: uppercase;
                      font-weight: bold;
                    }
                    .print-template-a4 .product-list table tr {
                      border-bottom: 1px dashed #DADADA;
                    }
                    .line-clamp-3 {
                      display: -webkit-box;
                      -webkit-line-clamp: 3;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                    }
                    .text-overflow-ellipsis {
                      text-overflow: ellipsis;
                    }
                    .font-size-_8rem {
                      font-size: .8rem !important;
                    }
                    .font-size-_6rem {
                      font-size: .8rem !important
                    }
                    .vertical-align-baseline {
                        vertical-align: baseline
                    }
                    .infomation{
                        text-align: center;
                        font-size: 1em;
                        color: #6B6B6B;
                        font-weight: normal;
                        font-style: italic;
                        width: 80%;
                        margin: 0 auto;
                    }
                    .point-indicator {
                        border-top: 1px dashed #DADADA;
                    }
                    .page-info-store span {
                        font-weight: 700;
                        line-height: 16px;
                        color: #000000;
                    }
                    .page-header-info span {
                        font-weight: 400;
                        line-height: 14px;
                        color: #000000;
                    }
                    .page-header-info .icon-dash::before{
                        content: '-';
                        padding: 0 10px;
                    }
                    .page-header-info .info-store-left {
                        width: 50%;
                        line-height: 20px;
                    }
                    .page-header-info .info-store-right {
                        width: 50%;
                    }
                    .table-information {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        grid-column-gap: 2rem;
                    }
                    .border-dashed {
                        border-bottom: 1px dashed #DADADA;
                    }
                    .text-used-point {
                        font-style: italic;
                        font-size: 14px;
                        text-transform: lowercase;
                        color: #9EA0A5;
                    }
                </style>
            </head>
            <body style="${options.bodyStyle}">
                ${body}
                <script type="text/javascript">
                    window.print();
                </script>
            </body>

            </html>
        `
    return template
}

class Template extends React.Component {

    constructor(props) {
        super(props)

        this.isShowCustomerInformation = this.isShowCustomerInformation.bind(this)
        this.renderDeliveryName = this.renderDeliveryName.bind(this)
        this.removeAccents = this.removeAccents.bind(this)
        this.calculatePayableAmount = this.calculatePayableAmount.bind(this)
    }

    renderPromotionPrice(product) {
        if (product.wholeSale) {
            return CurrencyUtils.formatMoneyByCurrency(-product.wholeSale.discountAmount, product.currency)
        }
        if (product.promotion) {
            return CurrencyUtils.formatMoneyByCurrency(-product.promotion.couponItem.promoAmount, product.currency)
        }
        return CurrencyUtils.formatMoneyByCurrency(0, product.currency)
    }

    renderTotalPrice(product) {
        const orgPrice = product.price * product.quantity
        return CurrencyUtils.formatMoneyByCurrency(orgPrice, CurrencyUtils.getLocalStorageSymbol())
    }

    isShowCustomerInformation() {
        const {shippingInfo} = this.props

        return shippingInfo && (!_.isEmpty(shippingInfo.contactName)
            || !_.isEmpty(shippingInfo.phoneNumber)
            || !_.isEmpty(shippingInfo.email)
            || !_.isEmpty(shippingInfo.address)
            || !_.isEmpty(shippingInfo.wardName)
            || !_.isEmpty(shippingInfo.districtName)
            || !_.isEmpty(shippingInfo.cityName))
    }

    getTranslateOption() {
        return {
            lng: this.props.langCode,
            fallbackLng: ['vi']
        }
    }

    renderDeliveryName(deliveryName) {
        if (deliveryName === 'selfdelivery') {
            return i18next.t('page.order.detail.information.shippingMethod.self', this.getTranslateOption())
        } else if (deliveryName === 'ahamove_truck') {
            return i18next.t('page.order.detail.information.shippingMethod.AHAMOVE_TRUCK', this.getTranslateOption())
        } else if (deliveryName === 'ahamove_bike') {
            return i18next.t('page.order.detail.information.shippingMethod.AHAMOVE_BIKE', this.getTranslateOption())
        }
        return deliveryName
    }

    removeAccents(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    }

    calculateChangeAmount(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, paidAmount, discountOption) {
        let changePrice = 0;
        const getTotalPrice = OrderInStorePurchaseContextService.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption)
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
        const {
            orderId,
            orderDate,
            storeInfo,
            user,
            staffName,
            spendingPoint,
            pointAmount,
            earningPoint,
            shippingInfo,
            productList,
            promotion,
            membership,
            discountOption,
            paymentMethod,
            taxAmount,
            note,
            debtAmount,
            checkDebtAmount,
            paidAmount,
            customerDebtAmount,
            discountedShippingFee,
            orderStatus
        } = this.props

        return (
            <div className="d-flex flex-column w-100 print-template-a4">
                {/*HEADER*/}
                <div className="page-header">
                    <div className="page-header-wrapper">
                        <div className="page-header-content">
                            <div style={{width: '30%'}}>
                                <img
                                    src={storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE)}
                                    alt={`logo-${storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME)}`}
                                    width="auto"
                                    height="50px"
                                />
                            </div>
                            <h5 className="text-uppercase font-size-2rem font-weight-bold m-auto">
                                {i18next.t('page.order.create.print.receipt', this.getTranslateOption())}
                            </h5>
                            <div style={{width: '30%'}} className="text-right">
                                <b>
                                    {i18next.t('page.order.create.print.orderId', this.getTranslateOption())}:
                                </b>
                                &nbsp;#{orderId}
                            </div>
                        </div>
                        <div className="page-info-store m-auto pb-2">
                            <span>{storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME)}</span>
                        </div>
                        <div className="page-header-info d-flex justify-content-center align-items-center">
                            <span className="address info-store-left">{storeInfo.storeAddress
                                ? storeInfo.storeAddress.split('\n').map((text, key) => {
                                    return (<React.Fragment key={`${text}-${key}`}>
                                        {text}
                                        <br/>
                                    </React.Fragment>)
                                })
                                : ''}</span>
                            <div className="info-store-right">
                                <div className="d-flex align-items-center">
                                    <span className="title icon-dash">
                                        {i18next.t('page.order.create.print.receiptInfo.tel', this.getTranslateOption())}:
                                    </span>
                                    <span className='ml-1'>{storeInfo.storePhone}</span>
                                </div>
                                {TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE]) &&
                                <>
                                    <div className="mt-2 d-flex align-items-center">
                                        <span className="title icon-dash">
                                        {i18next.t('page.order.create.print.receiptInfo.website', this.getTranslateOption())}:
                                    </span>
                                        <span className='ml-1'>{
                                            !storeInfo.customDomain ?
                                                `https://${storeInfo.storeUrl}.${storeInfo.storeDomain}`
                                                :
                                                `https://${storeInfo.customDomain}`
                                        }</span>
                                    </div>
                                </>
                                }
                            </div>
                        </div>
                        <div className="indicator"></div>
                    </div>
                </div>

                {/*RECEIPT INFORMATION*/}
                <div className="table-information">
                    {/*<tbody>*/}
                    <div className="info-left">
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title font-weight-bold">
                                {i18next.t('page.order.create.print.receiptInfo.customer', this.getTranslateOption())}:
                            </span>
                            <span className="font-weight-bold">{user.name}</span>
                        </div>
                        <div className="d-flex justify-content-between pb-2 border-dashed">
                            <span className="title">
                                    {i18next.t('page.order.create.print.receiptInfo.phone', this.getTranslateOption())}:
                                </span>
                            <span>{user.phone}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1 mt-2">
                            <span className="title font-weight-bold">
                                {i18next.t('page.order.create.print.receiptInfo.recipient', this.getTranslateOption())}:
                            </span>
                            <span className="font-weight-bold">{shippingInfo.contactName}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                {i18next.t('page.order.create.print.receiptInfo.phone', this.getTranslateOption())}:
                            </span>
                            <span>{shippingInfo.phone}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title" style={{
                                width: '30%'
                            }}>
                                {i18next.t('page.order.create.print.receiptInfo.address', this.getTranslateOption())}:
                            </span>
                            <span>{
                                (shippingInfo.address || '') + (shippingInfo.wardName || '') + (shippingInfo.districtName || '') + (shippingInfo.cityName || '')
                            }</span>
                        </div>
                    </div>
                    <div className="info-right">
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title font-weight-bold">
                                {i18next.t('page.order.create.print.receiptInfo.staff', this.getTranslateOption())}:
                            </span>
                            <span className="line-clamp-3 font-weight-bold">{
                                staffName === '[shop0wner]' ? i18next.t(`page.order.detail.information.shopOwner`, this.getTranslateOption()) : staffName
                            }</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                {i18next.t('page.order.create.print.receiptInfo.orderDate', this.getTranslateOption())}:
                            </span>
                            <span>{moment(orderDate || moment.now()).format('HH:mm DD/MM/YYYY')}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                {i18next.t('page.order.create.print.receiptInfo.shippingMethod', this.getTranslateOption())}:
                            </span>
                            <span>{
                                shippingInfo.deliveryName
                                    ? this.renderDeliveryName(shippingInfo.deliveryName)
                                    : i18next.t(`page.order.create.print.shippingMethod.${shippingInfo.method}`, this.getTranslateOption())
                            }</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                    {i18next.t('page.order.create.print.receiptInfo.paymentMethod', this.getTranslateOption())}:
                                </span>
                            <span>{i18next.t(`page.order.create.print.paymentMethod.${paymentMethod}`, this.getTranslateOption())}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="title" style={{
                                width: '30%'
                            }}>
                                {i18next.t('page.order.create.print.receiptInfo.note', this.getTranslateOption())}:
                            </span>
                            <span className="line-clamp-5">{note}</span>
                        </div>
                    </div>
                </div>

                {/*PRODUCT LIST*/}
                <div className="w-100 mt-4 mb-2 product-list">
                    <table className="w-100">
                        <colgroup>
                            <col width="5%"/>
                            <col width="35%"/>
                            <col width="20%"/>
                            <col width="20%"/>
                            <col width="20%"/>
                        </colgroup>
                        <thead>
                        <tr>
                            <th>
                                {i18next.t('productList.tbheader.no', this.getTranslateOption())}
                            </th>
                            <th>
                                {i18next.t('productList.tbheader.productName', this.getTranslateOption())}
                            </th>
                            <th>
                                {i18next.t('productList.tbheader.unitPrice', this.getTranslateOption())}
                            </th>
                            <th>
                                {i18next.t('component.product.addNew.unit.title')}
                            </th>
                            <th className="text-right">
                                {i18next.t('page.order.create.cart.table.priceTotal', this.getTranslateOption())}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            productList.slice().sort((pervious, current) => {
                                let compa = 0
                                if (this.removeAccents(pervious.name.trim().toLowerCase()) > this.removeAccents(current.name.trim().toLowerCase()))
                                    compa = 1
                                else if (this.removeAccents(pervious.name.trim().toLowerCase()) < this.removeAccents(current.name.trim().toLowerCase()))
                                    compa = -1
                                return compa
                            }).filter(p => p.checked).map((product, index) => {
                                return (
                                    <tr key={product.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <span className="text-overflow-ellipsis">{product.name}</span>
                                            <span>{
                                                product.variationName && (
                                                    ' (' + (product.variationName || '').split('|')
                                                        .filter(v => v !== Constants.DEPOSIT_CODE.FULL).join('/') + ')'
                                                )
                                            }</span>
                                            {product.modelName && <span>{product.modelName}</span>}
                                        </td>
                                        <td>
                                            {NumberUtils.formatThousand(product.quantity)} x {CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol())}
                                        </td>
                                        {product.conversionUnitName ?
                                        <td>
                                            {product.conversionUnitName}
                                        </td> :
                                        <td></td>
                                        }
                                        <td className="text-right">
                                            {this.renderTotalPrice(product)}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        {/*PRICE INFORMATION*/}
                        <tr className="border-0">
                            <td colSpan={2}></td>
                            <td className="text-uppercase">
                                {i18next.t('page.order.instorePurchase.print.kpos.product.subTotal', this.getTranslateOption())}:
                            </td>
                            <td></td>
                            <td className="text-right">{
                                CurrencyUtils.formatMoneyByCurrency(
                                    OrderInStorePurchaseContextService.calculateSubTotalPrice(productList),
                                    CurrencyUtils.getLocalStorageSymbol()
                                )
                            }</td>
                        </tr>
                        {taxAmount != null && !isNaN(taxAmount) &&
                        <tr className="border-0">
                            <td colSpan={2}></td>
                            <td className="text-uppercase">
                                {i18next.t('page.order.instorePurchase.print.kpos.product.VAT', this.getTranslateOption())}:
                            </td>
                            <td></td>
                            <td className="text-right">{
                                CurrencyUtils.formatMoneyByCurrency(taxAmount, CurrencyUtils.getLocalStorageSymbol())
                            }</td>
                        </tr>
                        }
                        {/*REDEEM POINTS*/}
                        <tr className="border-0">
                            <td colSpan={2}></td>
                            <td colSpan={2} className="text-uppercase">
                                <span>{`${i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints', this.getTranslateOption())}`}</span>
                                <span
                                    className="text-used-point">({`${i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints.used', {
                                    ...this.getTranslateOption(),
                                    point: spendingPoint ? CurrencyUtils.formatThousand(spendingPoint) : 0
                                })}:`})
                                </span>
                            </td>
                            <td className="vertical-align-baseline text-right">-{CurrencyUtils.formatMoneyByCurrency(pointAmount || 0, CurrencyUtils.getLocalStorageSymbol())}</td>
                        </tr>
                        {
                            OrderInStorePurchaseContextService.calculateDiscountAmount(productList, promotion, membership, discountOption) > 0 &&
                            <tr className="border-0">
                                <td colSpan={2}></td>
                                <td className="text-uppercase">
                                    {i18next.t('page.order.instorePurchase.print.kpos.product.discount', this.getTranslateOption())}:
                                </td>
                                <td></td>
                                <td className="text-right">- {CurrencyUtils.formatMoneyByCurrency(
                                    OrderInStorePurchaseContextService.calculateDiscountAmount(productList, promotion, membership, discountOption),
                                    CurrencyUtils.getLocalStorageSymbol()
                                )}</td>
                            </tr>
                        }
                        <tr className="border-0">
                            <td colSpan={2}></td>
                            <td className="text-uppercase">
                                {i18next.t('page.order.instorePurchase.print.kpos.product.shippingFee', this.getTranslateOption())}:
                            </td>
                            <td></td>
                            <td className="vertical-align-baseline text-right">
                                {discountedShippingFee !== undefined &&
                                <>
                                    {/*show base fee*/}
                                    {(shippingInfo && shippingInfo.amount !== discountedShippingFee) &&
                                    <>
                                        <del>{
                                            CurrencyUtils.formatMoneyByCurrency(shippingInfo.amount, CurrencyUtils.getLocalStorageSymbol())
                                        }</del>
                                        <br/>
                                    </>
                                    }
                                    {CurrencyUtils.formatMoneyByCurrency(discountedShippingFee, CurrencyUtils.getLocalStorageSymbol())}
                                </>
                                }
                                {discountedShippingFee === undefined &&
                                CurrencyUtils.formatMoneyByCurrency(shippingInfo ? shippingInfo.amount : 0,
                                    CurrencyUtils.getLocalStorageSymbol())
                                }
                            </td>
                        </tr>
                        <tr className="border-0" style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className="font-weight-bold font-size-1_3rem">
                                {i18next.t('page.order.instorePurchase.print.kpos.product.total', this.getTranslateOption())}:
                            </td>
                            <td></td>
                            <td className="vertical-align-baseline text-right font-weight-bold font-size-1_3rem">{
                                CurrencyUtils.formatMoneyByCurrency(
                                    OrderInStorePurchaseContextService.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption),
                                    CurrencyUtils.getLocalStorageSymbol()
                                )
                            }</td>
                        </tr>
                        {paymentMethod === 'CASH' &&
                        <>
                            <tr className="border-0">
                                <td colSpan={2}></td>
                                <td className="text-uppercase">
                                    {i18next.t('page.order.instorePurchase.print.kpos.product.receivedAmount', this.getTranslateOption())}:
                                </td>
                                <td></td>
                                <td className="vertical-align-baseline text-right">{
                                    CurrencyUtils.formatMoneyByCurrency(paidAmount, CurrencyUtils.getLocalStorageSymbol())
                                }</td>
                            </tr>
                            <tr className="border-0">
                                <td colSpan={2}></td>
                                <td className="text-uppercase">
                                    {i18next.t('page.order.instorePurchase.print.kpos.product.changeAmount', this.getTranslateOption())}:
                                </td>
                                <td></td>
                                <td className="vertical-align-baseline text-right">
                                    {this.calculateChangeAmount(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, paidAmount, discountOption)}
                                </td>
                            </tr>
                        </>
                        }
                        {!isNaN(checkDebtAmount) &&
                        <>
                            <tr className="border-0">
                                <td colSpan={2}></td>
                                <td className="text-uppercase point-indicator">
                                    {i18next.t('page.order.instorePurchase.print.kpos.product.orderRemainingDebt', this.getTranslateOption())}:
                                </td>
                                <td className="point-indicator"></td>
                                <td className="vertical-align-baseline point-indicator text-right">{
                                    CurrencyUtils.formatMoneyByCurrency(debtAmount, CurrencyUtils.getLocalStorageSymbol())
                                }</td>
                            </tr>
                            <tr className="border-0">
                                <td colSpan={2}></td>
                                <td className="text-uppercase">
                                    {i18next.t('page.order.instorePurchase.print.kpos.product.customerDebt', this.getTranslateOption())}:
                                </td>
                                <td></td>
                                <td className="vertical-align-baseline text-right">{
                                    CurrencyUtils.formatMoneyByCurrency(customerDebtAmount, CurrencyUtils.getLocalStorageSymbol())
                                }</td>
                            </tr>
                        </>
                        }

                        {/*PAYABLE AMOUNT*/}
                        <tr className="border-0">
                            <td colSpan={2}></td>
                            <td className="text-uppercase">
                                {i18next.t('page.order.instorePurchase.print.kpos.payableAmount', this.getTranslateOption())}:
                            </td>
                            <td></td>
                            <td className="vertical-align-baseline text-right">
                                {this.calculatePayableAmount(customerDebtAmount,
                                    OrderInStorePurchaseContextService.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption),
                                    orderStatus)}
                            </td>
                        </tr>


                        {/*EARNED POINTS*/}
                        <tr className="border-0">
                            <td colSpan={2}></td>
                            <td className="text-uppercase point-indicator">
                                {i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints', this.getTranslateOption())}:
                            </td>
                            <td className="point-indicator"></td>
                            <td className="vertical-align-baseline point-indicator text-right">{
                                i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints.point', {
                                    ...this.getTranslateOption(),
                                    point: earningPoint ? CurrencyUtils.formatThousand(earningPoint) : 0
                                })
                            }</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="infomation">
                    {CredentialUtils.getValueInfoOrder()}
                </div>

                {/*FOOTER*/}
                <div className="footer">
                    <div
                        className="d-flex p-0 justify-content-center align-items-center text-center font-weight-bold">
                        {i18next.t('page.order.instorePurchase.print.kpos.product.thankyou', this.getTranslateOption())}
                    </div>
                    <div
                        className="d-flex p-0 align-items-center justify-content-center font-size-_8rem text-wrap">
                        {i18next.t('page.order.instorePurchase.print.kpos.product.powered', this.getTranslateOption())}
                    </div>
                </div>
            </div>
        )
    }
}

Template.contextType = OrderInStorePurchaseContext.context

PrintTemplateA4.defaultProps = {
    productList: [],
    debtAmount: 0,
    paidAmount: 0,
    customerDebtAmount: 0,
}

PrintTemplateA4.propTypes = {
    shippingInfo: any,
    productList: array,
    promotion: any,
    membership: any,
    paymentMethod: string,
    debtAmount: number,
    paidAmount: number,
    customerDebtAmount: number,
    discountedShippingFee: number,
    orderStatus: string
}

export default PrintTemplateA4
