/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import ReactDOMServer from "react-dom/server";
import ProductListBarcodePrinterA4Template from "./ProductListBarcodePrintA4Template";
import ProductListBarcodePrinter70mm22mmTemplate from "./ProductListBarcodePrint70mm22mmTemplate";

const PAPER_SIZE_TEMPLATES = {
    A4_38MM_21MM: {
        pageSize: 'a4',
        canvasStyle: 'width: 38mm;height: 10mm;padding-left: 2mm;padding-right: 2mm',
        bodyPrintStyle: 'margin: 0 !important;display: block;',
        bodyStyle: 'padding: 0 10mm 12mm 10mm; margin: 0 auto;width: 210mm; display: flex; flex-direction: column; align-items: center;',
        value: 'A4_38MM_21MM'
    },
    A2_75IN_0_87IN: {
        pageSize: '70mm 22mm',
        canvasStyle: 'width: 35mm;height: 7mm;padding-left: 2mm;padding-right: 2mm',
        bodyPrintStyle: 'margin: 0 !important;display: block;',
        bodyStyle: 'padding: 0; margin: 0 auto;width: 70mm; display: flex; flex-direction: column; align-items: center;',
        value: 'A2_75IN_0_87IN'
    }
}

export const ProductListBarcodePrinterTemplateHTML = (stSelectedList, stPageSize) => {
    let body, options;
    switch (stPageSize.value) {
        case "A4_38MM_21MM":
            body = ReactDOMServer.renderToString(<ProductListBarcodePrinterA4Template productList={stSelectedList}/>)
            options = PAPER_SIZE_TEMPLATES.A4_38MM_21MM
            break
        case "A2_75IN_0_87IN":
            body = ReactDOMServer.renderToString(<ProductListBarcodePrinter70mm22mmTemplate productList={stSelectedList}/>)
            options = PAPER_SIZE_TEMPLATES.A2_75IN_0_87IN
            break
        default:
            body = ''
    }

    const template = `
        <html>
            <head>
                <meta charSet="utf-8"/>
                <title>Barcode printer</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/barcodes/JsBarcode.code128.min.js"></script>
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
                </style>
            </head>
            <body style="${options.bodyStyle}">
                ${body}
                <script type="text/javascript">
                    JsBarcode(".barcode").init();
                    window.print();
                </script>
            </body>

            </html>
        `
    return template
}
