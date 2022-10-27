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
import './ProductRow.sass'

class SelectServiceRow extends Component {

    constructor(props) {
        super(props);

        //this.renderPrice = this.renderPrice.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    render() {
        return (
            <UikCheckbox
                defaultChecked={this.props.isExist}
                className="select-collection-row"
                onClick={(e) => this.onSelect(this.props.data, e)}
                label={
                    <>
                        {this.props.data.images &&
                            <img alt="product-image" className="product-image" src={ImageUtils.getImageFromImageModel(this.props.data.images[0], 50)}/>
                        }
                        <div className="product-name">
                           <span>
                               {this.props.data.name}
                           </span>
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

SelectServiceRow.propTypes = {
        data: PropTypes.object,
    onSelect: PropTypes.func
};

export default SelectServiceRow;
