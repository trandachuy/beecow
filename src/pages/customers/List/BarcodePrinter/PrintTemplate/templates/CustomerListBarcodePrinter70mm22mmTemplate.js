import React, {Component} from "react";
import _ from "lodash";
import {CurrencyUtils} from "../../../../../../utils/number-format";
import PropTypes from "prop-types";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

class CustomerListBarcodePrinter70mm22mmTemplate extends Component {


    render() {
        const barcodeList = []

        this.props.customerList.forEach(customer => {
            barcodeList.push(<BarcodeSticker customer={customer} key={customer.id}/>)
        })
        const barcodeChunk = _.chunk(barcodeList, 2)

        const pages = []
        let index = 0
        for (const barcodeChunkItem of barcodeChunk) {
            pages.push(
                <div key={'page-'+index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '70mm',
                    paddingTop: '1mm',
                    pageBreakBefore: 'always',
                    height: '21.25mm'
                }}>
                    {barcodeChunkItem}
                </div>
            )
            index++;
        }

        return (
            <div>
                {pages}
            </div>
        );
    }
}

const BarcodeSticker = (props) => {


    const {customer} = props
    return (
        <div style={{
            padding: '2mm 2mm 1mm 2mm',
            width: '35mm',
            height: '21.25mm',
            fontSize: '6pt',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: '7pt',
            fontFamily: 'sans-serif',
            justifyContent: 'center'
        }}>
            <span style={{
                fontWeight: '500',
                maxHeight: '10px',
                overflowY: 'hidden'
            }}>
                {customer.fullName.substring(0, 25).toUpperCase()}
            </span>
            <canvas className="barcode"
                    jsbarcode-format="auto"
                    jsbarcode-fontsize="13"
                    jsbarcode-height="100"
                    jsbarcode-margintop="0"
                    jsbarcode-marginbottom="0"
                    jsbarcode-marginright="0"
                    jsbarcode-marginleft="0"
                    jsbarcode-displayvalue="false"
                    jsbarcode-value={customer.id}
            >
            </canvas>
            <code style={{fontSize: '6pt'}}>{customer.id}</code>
        </div>
    )
}

BarcodeSticker.propTypes = {
    customer: PropTypes.shape({
        id: PropTypes.any,
        fullName: PropTypes.string,
    }),
}



CustomerListBarcodePrinter70mm22mmTemplate.propTypes = {
    customerList: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.any,
        fullName: PropTypes.string,
    }),),
};

export default CustomerListBarcodePrinter70mm22mmTemplate;