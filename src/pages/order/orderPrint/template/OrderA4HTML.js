import ReactDOMServer from 'react-dom/server'
import React from 'react'
import Constants from '../../../../config/Constant'
// eslint-disable-next-line import/no-webpack-loader-syntax
import styles from '!raw-loader!sass-loader!./OrderA4Template.sass'

const OrderA4HTML = props => {
    const { children } = props

    const options = {
        pageSize: 'a4',
        canvasStyle: 'width: 38mm;height: 10mm;padding-left: 2mm;padding-right: 2mm',
        bodyPrintStyle: 'margin: 0 !important;display: block;-webkit-print-color-adjust: exact;',
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
                        size: ${ options.printSize };
                    }
                    * {
                        box-sizing: border-box;
                    }
                    canvas {
                        ${ options.canvasStyle }
                    }
                    @media print {
                        body {
                            ${ options.bodyPrintStyle }
                        }
                    }
                    ${ styles }
                </style>
            </head>
            <body style="${ options.bodyStyle }">
                ${ ReactDOMServer.renderToString(children) }
                <script type="text/javascript">
                    window.print();
                </script>
            </body>
            </html>
        `

    return template
}

OrderA4HTML.sizes = [Constants.PAGE_SIZE.A4]

export default OrderA4HTML
