/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikRadio} from '../../../../@uik'
import {ImageUtils} from "../../../../utils/image";
import {CurrencyUtils} from "../../../../utils/number-format";
import './SelectSyncProductRow.sass'
import {Trans} from "react-i18next";

class SelectSyncProductRow extends Component {

    constructor(props) {
        super(props);

        this.renderPrice = this.renderPrice.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }


    renderPrice() {
        // if has variants
        if (this.props.data.models && this.props.data.models.length > 0) {
            let currentModel
            let minPrice = this.props.data.models[0].newPrice
            let maxPrice = this.props.data.models[0].newPrice
            for (let i = 1; i < this.props.data.models.length; i++) {
                currentModel = this.props.data.models[i]
                minPrice = currentModel.newPrice < minPrice? currentModel.newPrice:minPrice
                maxPrice = currentModel.newPrice > maxPrice? currentModel.newPrice:maxPrice
            }
            return (
                <span className="gs-atm__flex-col--flex-center gs-atm__flex-align-items--end">
                    <span>{CurrencyUtils.formatMoneyByCurrency(minPrice, this.props.data.currency)}</span>
                    <span>{CurrencyUtils.formatMoneyByCurrency(maxPrice, this.props.data.currency)}</span>
                </span>
            )
        } else { // has no variants
            // show product price
            return (
                <span>
                    {CurrencyUtils.formatMoneyByCurrency(this.props.data.newPrice, this.props.data.currency)}
                </span>
            )
        }
    }

    render() {
        return (
            <UikRadio
                defaultChecked={this.props.isExist}
                className="select-sync-product-row"
                onClick={() => this.onSelect(this.props.data)}
                label={
                    <>
                        {this.props.data.images &&
                            <img alt="product-image" className="product-image" src={ImageUtils.getImageFromImageModel(this.props.data.images[0], 50)}/>
                        }
                        <div className="product-detail-text-line">
                           <span className="product-name">
                               {this.props.data.name}
                           </span>
                                <div hidden={this.props.notShowVariant} className="product-detail-text-line__right">
                                    <span className="product-variant">
                                        <Trans i18nKey="page.shopee.product.selectProduct.variant" values={{
                                            x: this.props.data.hasModel ? this.props.data.models.length : 0
                                        }}/>
                                   </span>
                                        <span className="product-price">
                                       {this.renderPrice()}
                                   </span>
                            </div>
                        </div>
                    </>
                }
                name="rgroup"
            />
        );
    }

    onSelect(product) {
        this.props.onSelect(product)
    }
}

SelectSyncProductRow.propTypes = {
        data: PropTypes.object,
    onSelect: PropTypes.func
};

export default SelectSyncProductRow;
