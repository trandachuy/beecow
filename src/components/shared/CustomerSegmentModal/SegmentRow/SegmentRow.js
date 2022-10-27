import React from 'react';
import PropTypes from 'prop-types';
import GSTrans from "../../GSTrans/GSTrans";
import {CurrencyUtils} from "../../../../utils/number-format";
import {UikCheckbox} from "../../../../@uik";
import "./SegmentRow.sass"

const SegmentRow = (props) => {

    const onSelect = (product, e) => {
        let checked = e.target.checked;
        props.onSelect(product, checked)
    };

    return (
        <>
            <UikCheckbox
                defaultChecked={props.isExist}
                className="select-segment-row__discount"
                onClick={(e) => onSelect(props.data, e)}
                label={
                    <>
                        <div className="segment-name">
                            <span>{props.data.name}</span>
                        </div>
                        <div className="segment-number">
                            <span><GSTrans t="page.marketing.discounts.coupons.customer_segment_modal.countUser" values={{total: CurrencyUtils.formatThousand(props.data.userCount)}}/></span>
                        </div>
                    </>
                }
                name="rgroup"
            />
        </>
    )
};

SegmentRow.propTypes = {
    data: PropTypes.object,
    onSelect: PropTypes.func,
    isExist: PropTypes.any
};

export default SegmentRow;
