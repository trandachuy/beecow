import React, {Component} from "react";
import _ from "lodash";
import PropTypes from "prop-types";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on :
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
class CustomerListBarcodePrinterTemplate extends Component {

    render() {
        const barcodeList = []

        this.props.customerList.forEach(customer => {
            barcodeList.push(<BarcodeSticker customer={customer} key={customer.id}/>)
        })
        const barcodeChunk = _.chunk(barcodeList, 65)

        const pages = []
        let index = 0
        for (const barcodeChunkItem of barcodeChunk) {
            pages.push(
                <div key={'page-' + index} style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    width: '190mm',
                    pageBreakBefore: 'always',
                    paddingTop: '12mm'
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
            padding: '1mm',
            width: '38mm',
            height: '21mm',
            fontSize: '8pt',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: '8pt',
            textAlign: 'center',
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

CustomerListBarcodePrinterTemplate.propTypes = {
    customerList: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.any,
        fullName: PropTypes.string,
    }),),
};

export default CustomerListBarcodePrinterTemplate
