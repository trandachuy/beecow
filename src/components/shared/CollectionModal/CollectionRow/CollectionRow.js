/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/05/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikCheckbox} from '../../../../@uik'
import {CurrencyUtils} from "../../../../utils/number-format";
import './CollectionRow.sass'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import Constants from "../../../../config/Constant";

class CollectionRow extends Component {

    constructor(props) {
        super(props);

        this.onSelect = this.onSelect.bind(this);
    }

    render() {
        return (
            <UikCheckbox
                defaultChecked={this.props.isExist}
                className="select-collection-row__discount"
                onClick={(e) => this.onSelect(this.props.data, e)}
                label={
                    <>
                       <div className="product-name">
                            <span>{this.props.data.name}</span>
                        </div>
                        <div className="product-number">
                            <span><GSTrans t={this.props.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT? "productList.countProduct":"serviceList.countService" }

                                           values={{total: CurrencyUtils.formatThousand(this.props.data.productNumber)}}/></span>
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

CollectionRow.propTypes = {
        data: PropTypes.object,
    onSelect: PropTypes.func,
    itemType: PropTypes.string,
};

export default CollectionRow;
