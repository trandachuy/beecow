/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/05/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikCheckbox} from '../../../../../@uik'
import './ProductRow.sass'
import Constants from "../../../../../config/Constant";
import {CurrencyUtils} from "../../../../../utils/number-format";
import {ImageUtils} from "../../../../../utils/image";

class ProductRow extends Component {

    constructor(props) {
        super(props);

        //this.renderPrice = this.renderPrice.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.getVariableLabel = this.getVariableLabel.bind(this);
    }


    // renderPrice() {
    //     // if has variants
    //     if (this.props.data.models && this.props.data.models.length > 0) {
    //         let currentModel
    //         let minPrice = this.props.data.models[0].newPrice
    //         let maxPrice = this.props.data.models[0].newPrice
    //         for (let i = 1; i < this.props.data.models.length; i++) {
    //             currentModel = this.props.data.models[i]
    //             minPrice = currentModel.newPrice < minPrice? currentModel.newPrice:minPrice
    //             maxPrice = currentModel.newPrice > maxPrice? currentModel.newPrice:maxPrice
    //         }
    //         return (
    //             <span className="gs-atm__flex-col--flex-center gs-atm__flex-align-items--end">
    //                 <span>{CurrencyUtils.formatMoneyByCurrency(minPrice, this.props.data.currency)}</span>
    //                 <span>{CurrencyUtils.formatMoneyByCurrency(maxPrice, this.props.data.currency)}</span>
    //             </span>
    //         )
    //     } else { // has no variants
    //         // show product price
    //         return (
    //             <span>
    //                 {CurrencyUtils.formatMoneyByCurrency(this.props.data.newPrice, this.props.data.currency)}
    //             </span>
    //         )
    //     }
    // }

    getVariableLabel(orgName) {
        if (!orgName) {
            return
        }

        return orgName.split('|').filter(name => name !== Constants.DEPOSIT_CODE.FULL).join(' | ')
    }

    render() {
        return (
            <UikCheckbox
                defaultChecked={this.props.isExist}
                className="select-collection-row"
                onClick={(e) => this.onSelect(this.props.data, e)}
                label={
                    <>
                        {this.props.data.itemImage &&
                            <img alt="product-image" className="product-image" src={ImageUtils.getImageFromImageModel(ImageUtils.mapImageUrlToImageModel(this.props.data.itemImage))}/>
                        }
                        <div className="product-name">
                            <div className='name'>{this.props.data.itemName}</div>
                            <div className='model'>{this.getVariableLabel(this.props.data.modelName)}</div>
                        </div>
                        <div className='product-price'>
                            <span>{CurrencyUtils.formatMoneyByCurrency(this.props.data.price, this.props.data.currency)}</span>
                        </div>
                    </>
                }
                name="rgroup"
            />
        );
    }

    onSelect(product, e) {
        let checked = e.target.checked;
        // check
        this.props.onSelect(product, checked)
    }
}

ProductRow.propTypes = {
        data: PropTypes.object,
    onSelect: PropTypes.func
};

export default ProductRow;
