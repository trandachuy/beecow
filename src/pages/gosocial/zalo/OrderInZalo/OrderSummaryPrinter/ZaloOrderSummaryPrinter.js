import './ZaloOrderSummaryPrinter.sass'
import React, {useImperativeHandle, useRef} from 'react'
import GSImg from '../../../../../components/shared/GSImg/GSImg'
import i18next from 'i18next'
import {CurrencyUtils, NumberUtils} from '../../../../../utils/number-format'
import {CredentialUtils} from '../../../../../utils/credential'
import ReactDOMServer from 'react-dom/server'
import {WindowUtils} from '../../../../../utils/download'
import {arrayOf, func, number, oneOf, shape, string} from 'prop-types'
import {useReactToPrint} from 'react-to-print'
import MediaService, {MediaServiceDomain} from '../../../../../services/MediaService'
import {GSToast} from '../../../../../utils/gs-toast'
import {v4 as uuidv4} from 'uuid'
import {ImageUtils} from '../../../../../utils/image'
import moment from 'moment'

const PRINT_TYPE = {
    CURRENT_TAB: 'CURRENT_TAB',
    NEW_TAB: 'NEW_TAB',
    UPLOADED_URL: 'UPLOADED_URL'
}

const ZaloOrderSummaryPrinter = React.forwardRef((props, ref) => {
    const {printType, onUploadedUrl} = props

    const refTemplate = useRef(null)

    useImperativeHandle(
        ref,
        () => ({
            print
        })
    )

    const handlePrint = useReactToPrint({
        content: () => refTemplate.current
    })

    const print = () => {
        switch (printType) {
            case PRINT_TYPE.CURRENT_TAB:
                handlePrint()
                return

            case PRINT_TYPE.NEW_TAB:
                WindowUtils.openFileInNewTab(ZaloOrderSummaryTemplate(props))
                return

            case PRINT_TYPE.UPLOADED_URL:
                const file = new File([new Blob([ZaloOrderSummaryTemplate(props)])], uuidv4(), {type: 'text/html'})

                MediaService.uploadFileWithDomain(file, MediaServiceDomain.FILE)
                    .then(res => {
                        try {
                            onUploadedUrl(ImageUtils.getFileUrlFromFileModel(res))
                        } catch (e) {

                        }
                    })
                    .catch(e => {
                        onUploadedUrl('')
                        console.error('Cannot upload zalo order summary file, ' + e)
                        GSToast.commonError()
                    })
        }
    }

    return (
        <div hidden {...props}>
            <ZaloOrderSummaryTemplateBody ref={refTemplate} {...props} />
        </div>
    )
})

const ZaloOrderSummaryTemplate = props => {
    const {printType} = props
    const body = ReactDOMServer.renderToString(<ZaloOrderSummaryTemplateBody {...props} />)
    const options = {
        pageSize: 'a4',
        canvasStyle: 'width: 38mm;height: 10mm;padding-left: 2mm;padding-right: 2mm',
        bodyPrintStyle: 'margin: 0 !important;display: block;-webkit-print-color-adjust: exact;',
        bodyStyle: 'padding: 0 10mm 12mm 10mm; margin: 0 auto;width: 210mm; display: flex; flex-direction: column; align-items: center;',
        value: 'A4_38MM_21MM'
    }
    const printScript = printType !== PRINT_TYPE.UPLOADED_URL
        ? `<script type="text/javascript">
            window.print();
        </script>`
        : ''

    const template = `
        <html>
            <head>
                <meta charSet="utf-8"/>
                <title>Order Summary</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"/>
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
                        .zalo-order-summary-template .table table th {
                            background-color: #F6F6F6 !important;
                        }
                        .zalo-order-summary-template .table table .footer td {
                            background-color: #F6F6F6 !important;
                        }
                    }
                    .zalo-order-summary-template {
                         background-color: #FFFFFF;
                         font-size: 12px;
                    }
                     .zalo-order-summary-template .header {
                         display: flex;
                    }
                     .zalo-order-summary-template .header .user-info {
                         display: flex;
                         align-items: center;
                         padding: 28px 30px;
                         background-color: #F0F0F0;
                         width: 40%;
                    }
                     .zalo-order-summary-template .header .user-info .avatar {
                         border-radius: 39px;
                         overflow: hidden;
                    }
                     .zalo-order-summary-template .header .user-info .user-name {
                         margin-left: 24px;
                         font-weight: 500;
                         font-size: 15px;
                    }
                     .zalo-order-summary-template .header .indicator {
                         border-top: 55px solid #F0F0F0;
                         border-left: 35px solid #F0F0F0;
                         border-right: 35px solid #FFFFFF;
                         border-bottom: 55px solid #FFFFFF;
                    }
                     .zalo-order-summary-template .header .order-summary {
                         display: flex;
                         flex-direction: column;
                         padding: 19px 28px;
                         justify-content: center;
                         margin-left: auto;
                    }
                     .zalo-order-summary-template .header .order-summary .title {
                         font-weight: bold;
                         font-size: 25px;
                         text-transform: uppercase;
                    }
                     .zalo-order-summary-template .header .order-summary .order-info {
                         display: flex;
                         justify-content: space-between;
                         padding-left: 20px;
                    }
                     .zalo-order-summary-template .header .order-summary .order-info:first-child {
                         margin-top: 16px;
                    }
                     .zalo-order-summary-template .header .order-summary .order-info .label {
                         font-weight: 500;
                    }
                     .zalo-order-summary-template .summary {
                         display: flex;
                         padding: 30px 30px 0 30px;
                    }
                     .zalo-order-summary-template .summary .info {
                         width: calc(100% / 3);
                         padding: 0 23px;
                    }
                     .zalo-order-summary-template .summary .info .title {
                         font-weight: bold;
                         font-size: 13px;
                         text-transform: uppercase;
                         width: 100%;
                         white-space: pre;
                         border-bottom: 1px solid #E4E4E4;
                         padding-bottom: 8px;
                    }
                     .zalo-order-summary-template .summary .info .value {
                         margin-top: 10px;
                    }
                     .zalo-order-summary-template .table {
                         padding: 30px;
                         margin-bottom: 0;
                    }
                     .zalo-order-summary-template .table table {
                         width: 100%;
                    }
                     .zalo-order-summary-template .table table th {
                         text-transform: uppercase;
                         font-weight: bold;
                         background-color: #F6F6F6;
                         white-space: pre;
                    }
                     .zalo-order-summary-template .table table .model {
                         color: #9D9D9D;
                         margin-top: 8px;
                         display: block;
                    }
                     .zalo-order-summary-template .table table .footer td {
                         border-top: none !important;
                         white-space: pre;
                         background-color: #F6F6F6;
                    }
                     .zalo-order-summary-template .table table .footer.sub-total {
                         font-weight: 500;
                    }
                     .zalo-order-summary-template .table table .footer.total {
                         font-weight: 500;
                         font-size: 20px;
                    }
                    .text-overflow-ellipsis {
                         text-overflow: ellipsis
                         white-space: nowrap
                         overflow: hidden
                         display: block
                    }
                    .line-clamp-2 {
                         display: -webkit-box
                         -webkit-line-clamp: 2
                         -webkit-box-orient: vertical
                         overflow: hidden
                    }
                </style>
            </head>
            <body style="${options.bodyStyle}">
                ${body}
                ${printScript}
            </body>
            </html>
        `
    return template
}

const ZaloOrderSummaryTemplateBody = React.forwardRef((props, ref) => {
    const {data} = props
    const {
        orderId,
        sellerName,
        sellerImage,
        buyerName,
        buyerPhone,
        shippingAddress,
        paymentMethod,
        note,
        productList,
        subTotal,
        vat,
        discount,
        shipping,
        total
    } = data

    const getTranslateOption = () => {
        return {
            lng: CredentialUtils.getLangKey(),
            fallbackLng: ['vi']
        }
    }

    return (
        <div className="zalo-order-summary-template" ref={ref}>
            <div className="header">
                <div className="user-info">
                    <img
                        src={sellerImage || 'https://dm4fv4ltmsvz0.cloudfront.net/storefront-images/default_image2.png'}
                        className="avatar" width={49} height={49} alt="avatar"/>
                    <span className="user-name text-overflow-ellipsis">{sellerName}</span>
                </div>
                <div className="indicator"/>
                <div className="order-summary">
                    <span
                        className="title">{i18next.t('component.zaloOrderSummaryTemplate.orderSummary', getTranslateOption())}</span>
                    <div className="order-info">
                        <span
                            className="label">{i18next.t('component.zaloOrderSummaryTemplate.orderId', getTranslateOption())}:</span>
                        <span>#{orderId}</span>
                    </div>
                    <div className="order-info">
                        <span
                            className="label">{i18next.t('component.zaloOrderSummaryTemplate.orderDate', getTranslateOption())}:</span>
                        <span>{moment().format('HH:mm DD/MM/YYYY')}</span>
                    </div>
                </div>
            </div>
            <div className="summary">
                <div className="info">
                    <div
                        className="title">{i18next.t('component.zaloOrderSummaryTemplate.shippingAddress', getTranslateOption())}</div>
                    <div className="value">{buyerName}</div>
                    <div className="value">{buyerPhone}</div>
                    <div className="value">{shippingAddress}</div>
                </div>
                <div className="info">
                    <div
                        className="title">{i18next.t('component.zaloOrderSummaryTemplate.paymentMethod', getTranslateOption())}</div>
                    <div
                        className="value">{i18next.t(`page.order.detail.information.paymentMethod.${paymentMethod}`, getTranslateOption())}</div>
                </div>
                <div className="info">
                    <div
                        className="title">{i18next.t('component.zaloOrderSummaryTemplate.note', getTranslateOption())}</div>
                    <div className="value">{note}</div>
                </div>
            </div>
            <div className="table">
                <table>
                    <colgroup>
                        <col width="5%"/>
                        <col width="50%"/>
                        <col width="15%"/>
                        <col width="15%"/>
                        <col width="15%"/>
                    </colgroup>
                    <thead>
                    <tr>
                        <th>
                            {i18next.t('component.zaloOrderSummaryTemplate.table.no', getTranslateOption())}
                        </th>
                        <th>
                            {i18next.t('component.zaloOrderSummaryTemplate.table.productName', getTranslateOption())}
                        </th>
                        <th>
                            {i18next.t('component.zaloOrderSummaryTemplate.table.price', getTranslateOption())}
                        </th>
                        <th>
                            {i18next.t('component.zaloOrderSummaryTemplate.table.quantity', getTranslateOption())}
                        </th>
                        <th className="text-right">
                            {i18next.t('component.zaloOrderSummaryTemplate.table.total', getTranslateOption())}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        productList.map((p, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>
                                    <span
                                        className="line-clamp-2">{p.name}</span>
                                    <span className="model">{p.modelName}</span>
                                </td>
                                <td className="text-right">
                                    {CurrencyUtils.formatMoneyByCurrency(p.newPrice, CurrencyUtils.getLocalStorageSymbol())}
                                </td>
                                <td>
                                    {NumberUtils.formatThousand(p.quantity)}
                                </td>
                                <td className="text-right">
                                    {CurrencyUtils.formatMoneyByCurrency((p.newPrice * p.quantity), CurrencyUtils.getLocalStorageSymbol())}
                                </td>
                            </tr>
                        ))
                    }
                    <tr className="footer sub-total">
                        <td colSpan={2}></td>
                        <td colSpan={2}>{i18next.t('component.zaloOrderSummaryTemplate.table.subTotal', {
                            ...getTranslateOption(),
                            n: productList.length
                        })}</td>
                        <td className="text-right">{CurrencyUtils.formatMoneyByCurrency(subTotal, CurrencyUtils.getLocalStorageSymbol())}</td>
                    </tr>
                    <tr className="footer">
                        <td colSpan={2}></td>
                        <td colSpan={2}>VAT</td>
                        <td className="text-right">{CurrencyUtils.formatMoneyByCurrency(vat, CurrencyUtils.getLocalStorageSymbol())}</td>
                    </tr>
                    <tr className="footer">
                        <td colSpan={2}></td>
                        <td colSpan={2}>{i18next.t('component.zaloOrderSummaryTemplate.table.discount', getTranslateOption())}</td>
                        <td className="text-right">{CurrencyUtils.formatMoneyByCurrency(discount, CurrencyUtils.getLocalStorageSymbol())}</td>
                    </tr>
                    <tr className="footer">
                        <td colSpan={2}></td>
                        <td colSpan={2}>{i18next.t('component.zaloOrderSummaryTemplate.table.shipping', getTranslateOption())}</td>
                        <td className="text-right">{CurrencyUtils.formatMoneyByCurrency(shipping, CurrencyUtils.getLocalStorageSymbol())}</td>
                    </tr>
                    <tr className="footer total">
                        <td colSpan={2}></td>
                        <td colSpan={2}>{i18next.t('component.zaloOrderSummaryTemplate.table.total', getTranslateOption())}</td>
                        <td className="text-right">{CurrencyUtils.formatMoneyByCurrency(total, CurrencyUtils.getLocalStorageSymbol())}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
})

ZaloOrderSummaryPrinter.defaultProps = {
    printType: PRINT_TYPE.CURRENT_TAB,
    data: {
        productList: []
    },
    onUploadedUrl: function () {
    }
}

ZaloOrderSummaryPrinter.propTypes = {
    printType: oneOf(Object.values(PRINT_TYPE)),
    data: shape({
        orderId: number,
        sellerName: string,
        sellerImage: string,
        buyerName: string,
        buyerPhone: string,
        shippingAddress: string,
        paymentMethod: string,
        note: string,
        productList: arrayOf(shape({
            name: string,
            modelName: string,
            newPrice: number,
            quantity: number
        })),
        subTotal: number,
        vat: number,
        discount: number,
        shipping: number,
        total: number
    }),
    onUploadedUrl: func
}

ZaloOrderSummaryPrinter.PRINT_TYPE = PRINT_TYPE

export default ZaloOrderSummaryPrinter