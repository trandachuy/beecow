/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/05/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikCheckbox} from '../../../../@uik'
import {ImageUtils} from "../../../../utils/image";
import './ProductNoVariationRow.sass'
import {CurrencyUtils} from "../../../../utils/number-format";

class ProductNoVariationRow extends Component {

    constructor(props) {
        super(props);

        //this.renderPrice = this.renderPrice.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    render() {
        return (
            <tr className={['cursor--pointer',this.props.className].join(' ')}>
                <td className='col-4 pl-3'>
                    <div className='d-flex flex-row justify-content-start'>
                        <UikCheckbox
                            defaultChecked={this.props.isExist}
                            className="product-checkbox mr-2 mt-3"
                            onClick={(e) => this.onSelect(this.props.data, e)}
                            label=""
                            name="rgroup"
                        />
                        {this.props.data.images &&
                            <img
                                className="product-image"
                                alt=""
                                src={
                                this.props.data.images.length
                                    ? ImageUtils.getImageFromImageModel(this.props.data.images[0], 50)
                                    : '/assets/images/default_image.png'
                            }/>
                        }
                        <img alt="" className="product-image" 
                            src={
                            !!this.props.data.image ? ImageUtils.getImageFromImageModel(this.props.data.image, 50) : '/assets/images/default_image.png'
                            }
                        />
                        <div className="product-name line-clamp-2">{this.props.data.name}</div>
                    </div>
                    
                </td>
                <td className='col-2'>
                    <div>{this.props.data.conversionUnitName ? this.props.data.conversionUnitName : '-'}</div>
                </td>
                <td className='col-2'>
                    <div className="product-price">
                        {
                           !isNaN(this.props.data.costPrice) ?
                           CurrencyUtils.formatMoneyByCurrency(this.props.data.costPrice, this.props.data.currency)
                           : CurrencyUtils.formatMoneyByCurrency(0, this.props.data.currency)
                        }
                    </div>
                </td>
                <td className='col-2'>
                    <div className="product-price">{CurrencyUtils.formatMoneyByCurrency(this.props.data.orgPrice, this.props.data.currency)}</div>
                </td>
                <td className='col-2'>
                    <div className="product-price">{CurrencyUtils.formatMoneyByCurrency(this.props.data.newPrice, this.props.data.currency)}</div>
                </td>
                {/*BH-11950 because of BH-11672*/}
                {/*still keep old logic just in case*/}
            </tr>
        );
    }

    onSelect(product, e) {
        let checked = e.target.checked;
        // check
        this.props.onSelect(product, checked)
    }
}

ProductNoVariationRow.propTypes = {
    data: PropTypes.object,
    onSelect: PropTypes.func
};

export default ProductNoVariationRow;
