/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {CurrencyUtils} from "../../../../../utils/number-format";
import _ from 'lodash'


class ProductListBarcodePrinterA4Template extends Component {


    render() {
        const barcodeList = []

        this.props.productList.forEach(product => {
            const quantity = parseInt(product.quantity)
            Array.from(Array(quantity), (p, index) => {
                barcodeList.push(<BarcodeSticker product={product} key={product.id + '-' + index}/>)
            })
        })
        const barcodeChunk = _.chunk(barcodeList, 65)

        const pages = []
        let index = 0
        for (const barcodeChunkItem of barcodeChunk) {
            pages.push(
                <div key={'page-'+index} style={{
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

    const renderModelName = () => {
        const NAME_SIZE = 20
        if (product.modelName.length <= NAME_SIZE) return product.modelName

        const [var1, var2] = product.modelName.split('|')



        if (!var2) {
            return var1.substring(0, NAME_SIZE)
        } else {
            let tempName = var1.substring(0, NAME_SIZE/2) + '|' + var2.substring(0, NAME_SIZE/2)
            if (var1.length > var2.length) {
                return var1.substring(0, 10 + (NAME_SIZE - tempName.length)) + '|' + var2.substring(0, 10)
            } else {
                return var1.substring(0, 10) + '|' + var2.substring(0, 10 +  (NAME_SIZE - tempName.length))
            }
        }
    }

    const {product} = props
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
            // border: '1px solid gray',
        }}>
            <span style={{
                fontWeight: '500',
                // whiteSpace: 'pre',
                // overflow: 'hidden',
                maxHeight: '10px',
                overflowY: 'hidden'
            }}>
                {product.itemName.substring(0, 25)}
            </span>
            {product.modelName &&
                <span className="product-list-barcode-printer-template__model-name">
                    {renderModelName()}
                </span>
            }
            <canvas className="barcode"
                 jsbarcode-format="auto"
                 jsbarcode-fontsize="13"
                 jsbarcode-height="40"
                 jsbarcode-margintop="0"
                 jsbarcode-marginbottom="0"
                 jsbarcode-marginright="0"
                 jsbarcode-marginleft="0"
                 jsbarcode-value={product.barcode}
            >
            </canvas>
            <span style={{
                marginTop: 'auto',
                marginBottom: '1mm'
            }}>
                {CurrencyUtils.formatMoneyByCurrency(product.price, product.currency)}
            </span>
        </div>
    )
}

BarcodeSticker.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.any,
        modelId: PropTypes.string,
        itemName: PropTypes.string,
        modelName: PropTypes.string,
        modelLabel: PropTypes.string,
        itemImage: PropTypes.string,
        quantity: PropTypes.any,
        barcode: PropTypes.string,
        newPrice: PropTypes.number,
        currency: PropTypes.string,
    }),
}



ProductListBarcodePrinterA4Template.propTypes = {
    productList: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.any,
        modelId: PropTypes.string,
        itemName: PropTypes.string,
        modelName: PropTypes.string,
        modelLabel: PropTypes.string,
        itemImage: PropTypes.string,
        quantity: PropTypes.any,
        barcode: PropTypes.string,
        newPrice: PropTypes.number,
        currency: PropTypes.string,
    }),),
};

export default ProductListBarcodePrinterA4Template;