/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/05/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './ProductRow.sass'
import Constants from '../../../../../config/Constant';

class ProductRow extends Component {

    constructor(props) {
        super(props);

        //this.renderPrice = this.renderPrice.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.getVariableLabel = this.getVariableLabel.bind(this);
    }

    getVariableLabel(orgName) {
        if (!orgName) {
            return
        }

        return orgName.split('|').filter(name => name !== Constants.DEPOSIT_CODE.FULL).join(' | ')
    }

    render() {
        return (
            <div className="select-collection-row">
                <input className="input-select-collection" type="radio" id={this.props.data.id} name="age" value={this.props.data.id} onClick={(e) => this.onSelect(this.props.data, e)}/>
                <div className="product-name">
                    <div className='name'>{this.props.data.name}</div>
                    <div className='model'>{this.getVariableLabel(this.props.data.partnerCode)}</div>
                </div>
            </div>
        );
    }

    onSelect(product, e) {
        this.props.onSelect(product)
    }
}

ProductRow.propTypes = {
        data: PropTypes.object,
    onSelect: PropTypes.func
};

export default ProductRow;
