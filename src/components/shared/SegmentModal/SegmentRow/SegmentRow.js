/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/04/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {UikCheckbox} from '../../../../@uik'
import {CurrencyUtils} from "../../../../utils/number-format";
import './SegmentRow.sass'
import GSTrans from "../../GSTrans/GSTrans";

const SegmentRow = (props) =>{

    const onSelect = (product, e) => {
        let checked = e.target.checked;
        // check
        props.onSelect(product, checked)
    }
    return (
        <UikCheckbox
            defaultChecked={props.isExist}
            className="select-segment-row__discount"
            onClick={(e) => onSelect(this.props.data, e)}
            label={
                <>
                   <div className="segment-name">
                        <span>{props.data.name}</span>
                    </div>
                    <div className="segment-number">
                        <span><GSTrans t="productList.countProduct" values={{total: CurrencyUtils.formatThousand(props.data.productNumber)}}/></span>
                    </div>
                </>
            }
            name="rgroup"
        />
    );
}
SegmentRow.propTypes = {
    data: PropTypes.object,
    onSelect: PropTypes.func
};

export default SegmentRow;
