import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {oneOf} from 'prop-types'
import Constants from '../../../../config/Constant'
// eslint-disable-next-line import/no-webpack-loader-syntax
import styles from '!raw-loader!sass-loader!./OrderKPosTemplate.sass'

const OrderKPosHTML = props => {
    const { printSize, children } = props

    const width = `${ printSize.replace('K', '') }mm`
    const options = {
        bodyPrintStyle: `-webkit-print-color-adjust: exact;`,
        bodyStyle: `width: ${ width };`
    }
    const template = `
        <html>
            <head>
                <meta charSet="utf-8"/>
                <title>Barcode printer</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/barcodes/JsBarcode.code128.min.js"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"></link>
                <style>
                    @media print {
                        @page {
                            size: ${ width } auto;
                        } 
                        html, body {
                            ${ options.bodyPrintStyle }
                        }                    
                    }
                    ${ styles }
                </style>
            </head>
            <body style="${ options.bodyStyle }">
                ${ ReactDOMServer.renderToString(React.cloneElement(children, { ...children.props, printSize })) }
                <script type="text/javascript">
                    window.print();
                </script>
            </body>
            </html>
        `

    return template
}

OrderKPosHTML.sizes = [Constants.PAGE_SIZE.K80, Constants.PAGE_SIZE.K57]

OrderKPosHTML.defaultProps = {
    printSize: Constants.PAGE_SIZE.K80
}

OrderKPosHTML.propTypes = {
    printSize: oneOf([Constants.PAGE_SIZE.K80, Constants.PAGE_SIZE.K57])
}

export default OrderKPosHTML
