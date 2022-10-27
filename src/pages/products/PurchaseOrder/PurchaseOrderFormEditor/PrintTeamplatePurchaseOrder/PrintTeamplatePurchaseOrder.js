/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useImperativeHandle, useRef} from 'react';
import ReactToPrint from "react-to-print";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import './PrintTeamplatePurchaseOrder.sass';
import * as _ from 'lodash';
import {any, array, string} from "prop-types";
import storageService from "../../../../../services/storage";
import Constants from "../../../../../config/Constant";
import moment from "moment";
import {WindowUtils} from "../../../../../utils/download";
import ReactDOMServer from "react-dom/server";
import i18next from "i18next";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";

const PrintTemplateA4 = React.forwardRef((props, ref) => {
    const refTemplate = useRef(null);
    const refPrint = useRef(null);

    const isEnabled = props.productList.filter(p => p.checked).length > 0;

    useImperativeHandle(
        ref,
        () => ({
            onPrint
        }),
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
    );
});

const OrderReceiptPrinterTemplate = (props) => {
    const body = ReactDOMServer.renderToString(<Template {...props}/>);
    const options = {
        pageSize: 'a4',
        canvasStyle: 'width: 38mm;height: 10mm;padding-left: 2mm;padding-right: 2mm',
        bodyPrintStyle: 'margin: 0 !important;display: block;-webkit-print-color-adjust: exact;',
        bodyStyle: 'padding: 0 10mm 12mm 10mm; margin: 0 auto;width: 210mm; display: flex; flex-direction: column; align-items: center;',
        value: 'A4_38MM_21MM'
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
                      padding-bottom: 20px;
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
                    .print-template-a4 .product-list table th {
                      background-color: rgba(0, 0, 0, 0.05);
                      text-transform: uppercase;
                      font-weight: bold;
                    }
                    .print-template-a4 .product-list table tr {
                      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    }
                    .line-clamp-3 {
                      display: -webkit-box;
                      -webkit-line-clamp: 3;
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                    }
                    .text-overflow-ellipsis {
                      white-space: nowrap;
                      overflow: hidden;
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
        super(props);
    }

    getCreatedDate(orderDate){
        if (!orderDate.length) {
            return
        }

        const timeline = orderDate.find(timeline => timeline.status === 'ORDER')

        if (!timeline) {
            return
        }

        return moment(timeline.createdDate).format('HH:mm DD/MM/YYYY')
    }

    renderTotalPrice(products) {
        const orgPrice = products.importPrice * products.quantity
        return CurrencyUtils.formatMoneyVND(orgPrice)
    }

    calculateSubTotalPrice(_productList) {
        const productList = _.cloneDeep(_productList);
        let sum = 0;
        for (const product of productList) {
            sum += product.importPrice * product.quantity;
        }
        return sum;
    }

    calculateSubTotalQuantity(_productList) {
        const productList = _.cloneDeep(_productList);
        let sum = 0;
        for (const product of productList) {
            sum += product.quantity;
        }
        return sum;
    }

    calculateSubTotalDiscount(discount, productList){
        const productItems = _.cloneDeep(productList);
        const subTotal = this.calculateSubTotalPrice(productItems)
        let totalDiscount = 0;

        if (!_.isEmpty(discount)) {
            if (discount.type == 'PERCENTAGE') {
                totalDiscount = subTotal * +(discount.value) / 100
            } else {
                totalDiscount = +(discount.value)
            }
        }

        return totalDiscount
    }

    calculateTotalTax(productList, listTax){
        const totalTax = productList
            .filter(prod => prod.taxSettingId !== undefined && prod.taxSettingId !== null)
            .reduce((acc, curr) => {
                const tax = listTax.find(tax => tax.value === curr.taxSettingId);
                if (tax) {
                    return acc + (curr.quantity * curr.importPrice * tax.rate / 100)
                }
                return 0;
            }, 0);
        return totalTax;
    }

    calculateTotalPrice(productList, discount, listTax, cost) {
        const productItems = _.cloneDeep(productList);
        const discountTotal = this.calculateSubTotalDiscount(discount, productItems);
        const subTotal = this.calculateSubTotalPrice(productItems);
        const vat = this.calculateTotalTax(productList, listTax)

        const result = subTotal - discountTotal + cost + vat;
        return result;
    }

    getTranslateOption() {
        return {
            lng: this.props.langCode,
            fallbackLng: ['vi']
        }
    }

    render() {
        const {
            orderId,
            orderDate,
            storeInfo,
            user,
            productList,
            cost,
            discount,
            listTax,
            note
        } = this.props

        return (
            <div className="d-flex flex-column w-100 print-template-a4">
                {/*HEADER*/}
                <div className="page-header">
                    <div className='page-header-wrapper'>
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
                                {i18next.t('component.navigation.product.purchaseOrder', this.getTranslateOption())}
                            </h5>
                            <div style={{width: '30%'}} className='text-right'>
                                <span>
                                <b>
                                    {i18next.t('page.order.create.print.orderId', this.getTranslateOption())}:
                                </b>
                                    &nbsp;#{orderId}
                                </span>
                                <br/>
                                <span>
                                <b>
                                    {i18next.t('page.order.create.print.receiptInfo.orderDate', this.getTranslateOption())}:
                                </b>
                                    {this.getCreatedDate(orderDate) || moment(moment.now()).format('HH:mm DD/MM/YYYY')}
                                </span>
                            </div>
                        </div>
                        <div className='indicator'></div>
                    </div>
                </div>

                {/*RECEIPT INFORMATION*/}
                <table className='table-information'>
                    <colgroup>
                        <col width="15%"/>
                        <col width="35%"/>
                        <col width="15%"/>
                        <col width="35%"/>
                    </colgroup>
                    <tbody>
                    <tr>
                        <td className='title font-weight-bold'>
                            {i18next.t('page.order.create.print.receiptInfo.store', this.getTranslateOption())}:
                        </td>
                        <td><span className='line-clamp-3'>{
                            storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME)
                        }</span></td>
                        <td className='title font-weight-bold'>
                            {i18next.t('component.supplier.list.table.name', this.getTranslateOption())}:
                        </td>
                        <td>{user[0] && user[0].name}</td>
                    </tr>
                    <tr>
                        <td className='title font-weight-bold'>
                            {i18next.t('page.order.create.print.receiptInfo.phone', this.getTranslateOption())}:
                        </td>
                        <td>{storeInfo.storePhone}</td>
                    </tr>
                    <tr>
                        <td className='title font-weight-bold'>
                            {i18next.t('page.order.create.print.receiptInfo.address', this.getTranslateOption())}:
                        </td>
                        <td><span className='line-clamp-3'>{storeInfo.storeAddress
                            ? storeInfo.storeAddress.split("\n").map((text, key) => {
                                return (<React.Fragment key={`${text}-${key}`}>
                                    {text}
                                    <br/>
                                </React.Fragment>);
                            })
                            : ""}</span></td>
                        <td className='title font-weight-bold'>
                            {i18next.t('component.supplier.list.table.code', this.getTranslateOption())}:
                        </td>
                        <td>{user[0] && user[0].code}</td>
                    </tr>

                    <tr>
                        <td className='title font-weight-bold'>
                            {i18next.t('page.order.create.print.receiptInfo.website', this.getTranslateOption())}:
                        </td>
                        <td><span className='line-clamp-3'>{
                            !storeInfo.customDomain ?
                                storeInfo.storeDomain
                                :
                                storeInfo.customDomain
                        }</span></td>
                        <td className='title font-weight-bold'>
                            {i18next.t('component.supplier.list.table.phoneSupplier', this.getTranslateOption())}:
                        </td>
                        <td>{user[0] && user[0].phoneNumber}</td>
                    </tr>
                    <tr>
                        <td className='title font-weight-bold'>
                            {i18next.t('page.setting.accountInfo.email', this.getTranslateOption())}:
                        </td>
                        <td>{storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_EMAIL)}</td>
                    </tr>
                    </tbody>
                </table>

                {/*PRODUCT LIST*/}
                <div className="w-100 mt-4 product-list">
                    <table className="w-100">
                        <colgroup>
                            <col width="7%"/>
                            <col width="53%"/>
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
                                {i18next.t('page.order.create.cart.table.priceTotal', this.getTranslateOption())}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            productList && productList.map((product) => {
                              return product.map((products, index)=>{
                                    return (
                                        <tr key={products.itemId}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span>{products.itemName}</span>
                                                {products.modelName && <span
                                                    className='font-size-_8rem'>({products.modelName.split('|').filter(n => n !== Constants.DEPOSIT_CODE.FULL).join(' | ')})</span>}
                                            </td>
                                            <td>
                                                {NumberUtils.formatThousand(products.quantity)} x {NumberUtils.formatThousand(products.importPrice)}
                                            </td>
                                            <td>
                                                {this.renderTotalPrice(products)}
                                            </td>
                                        </tr>
                                    )
                                })
                            })
                        }
                        {/*QUANTITY*/}
                        <tr className='border-0' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className='font-weight-bold'>
                                {i18next.t('page.order.list.group.quantity', this.getTranslateOption())}:
                            </td>
                            <td>
                                {NumberUtils.formatThousand(this.calculateSubTotalQuantity(productList[0]))}
                                &nbsp;
                                <GSTrans t='page.purchaseOrderFormEditor.table.total.summary.product'/>
                            </td>
                        </tr>
                        {/*SUBTOTAL*/}
                        <tr className='border-0' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className='font-weight-bold'>
                                {i18next.t('page.order.instorePurchase.print.kpos.product.subTotal', this.getTranslateOption())}:
                            </td>
                            <td>{CurrencyUtils.formatMoneyByCurrency(
                                this.calculateSubTotalPrice(productList[0]),
                                CurrencySymbol.VND
                            )}</td>
                        </tr>
                        {/*TOTAL TAX*/}
                        <tr className='border-0' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className='font-weight-bold'>
                                {i18next.t('page.setting.VAT.titleBox', this.getTranslateOption())}:
                            </td>
                            <td>{CurrencyUtils.formatMoneyByCurrency(
                                this.calculateTotalTax(productList[0], listTax[0]),
                                CurrencySymbol.VND)}</td>
                        </tr>
                        {/*PROMOTION*/}

                        <tr className='border-0' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className='font-weight-bold'>
                                {i18next.t('component.navigation.promotion.discount', this.getTranslateOption())}:
                            </td>
                            <td>{CurrencyUtils.formatMoneyByCurrency(
                                this.calculateSubTotalDiscount(discount, productList[0]),
                                CurrencySymbol.VND)}</td>
                        </tr>
                        {/*COST*/}
                        <tr className='border-0' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className='font-weight-bold'>
                                {i18next.t('page.purchaseOrderFormEditor.table.summary.cost', this.getTranslateOption())}:
                            </td>
                            <td>{CurrencyUtils.formatMoneyVND(cost)}</td>
                        </tr>
                        <tr className='border-0' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                            <td colSpan={2}></td>
                            <td className='font-weight-bold'>
                                {i18next.t('page.order.instorePurchase.print.kpos.product.total', this.getTranslateOption())}:
                            </td>
                            <td className='vertical-align-baseline'>{CurrencyUtils.formatMoneyByCurrency(
                                this.calculateTotalPrice(
                                    productList[0],
                                    discount,
                                    listTax[0],
                                    cost
                                ),
                                CurrencySymbol.VND
                            )}</td>
                        </tr>

                        </tbody>
                    </table>
                </div>

                {/*FOOTER*/}
                <div className='mt-2'>
                    <div
                        className="font-weight-bold">
                        {i18next.t('page.order.detail.noteFromBuyer', this.getTranslateOption())}
                    </div>
                    <div
                        className="">
                        <span>{note}</span>
                    </div>
                </div>
            </div>
        );
    }
}

PrintTemplateA4.defaultProps = {
    productList: [],
}

PrintTemplateA4.propTypes = {
    productList: array,
    promotion: any
};

export default PrintTemplateA4;
