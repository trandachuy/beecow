/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 02/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import './SegmentConditionRow.sass'
import {selectorMapping, selectorTree, valueMapping} from "./ConditionComponents/SegmentRowConditionComponents";
import ProductModal from "../../../products/CollectionSelectProductModal/ProductModal";
import Constants from "../../../../config/Constant";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {FormValidate} from "../../../../config/form-validate";
import {AvField} from "availity-reactstrap-validation";

const getSelector = (level, selectorStr) => {
    if (selectorStr) {
        const selectorList = selectorStr.split('_')
        return selectorList[level-1]
    } else { // => default
        switch (level) {
            case 1:
                return 'Customer Data'
            case 2:
                return 'Registration date'
            case 3:
                return 'is'
            default:
                return null
        }
    }
}

const SegmentConditionRow = props => {

    const [stSelector1, setStSelector1] = useState(getSelector(1, props.selectorStr));
    const [stSelector2, setStSelector2] = useState(getSelector(2, props.selectorStr));
    const [stSelector3, setStSelector3] = useState(getSelector(3, props.selectorStr));
    const [getValueExpiredTime, setValueExpiredTime] = useState(props.expiredTimeValue ? props.expiredTimeValue : 'ALL');
    const [stValue, setStValue] = useState(props.value);

    const handleRootChange = (e) => {
        const value = e.currentTarget.value
        setStSelector1(value)
        const value2 = selectorTree[value][0]
        setStSelector2(value2)
        setStSelector3(selectorTree[value2][0])

        setStValue(undefined)

        // change expired value here
        setValueExpiredTime('ALL');
    }
    const handleSelector1Change = (e) => {
        const value = e.currentTarget.value
        setStSelector2(value)
        setStSelector3(selectorTree[value][0])

        setStValue(undefined)

        // change expired value here
        setValueExpiredTime('ALL');

    }
    const handleSelector2Change = (e) => {
        const value = e.currentTarget.value
        setStSelector3(value)
    }

    const handleOnValueChange = (e) => {
        setStValue(e.currentTarget.value)
    }

    const handleOnValueExpiredTimeChange = (e) => {
        setValueExpiredTime(e.currentTarget.value)
    }

    const handleOnRemove = () => {
        if (props.onRemove) props.onRemove(props.rowKey)
    }

    return (
        <div className="segment-condition-row row">
                <div className="col-11 selector-wrapper">
                    <div className="row">
                        <div className="col-6 col-sm-6 col-md-3">
                            {/*Selector0*/}
                            {selectorMapping('root', stSelector1, props.rowKey, handleRootChange)}
                        </div>
                        {
                            stSelector1 === 'Purchased Product' && <div className="col-6 col-sm-6 col-md-3 mt-2 ml-3">
                                {<SelectProductCustom value={stValue} rowKey={props.rowKey} onChange={handleOnValueChange}/>}
                            </div>
                        }
                        <div className="col-6 col-sm-6 col-md-3">
                            {/*Selector1*/}
                            {selectorMapping(stSelector1, stSelector2, props.rowKey, handleSelector1Change)}
                        </div>
                        <div className="col-6 col-sm-6 col-md-2">
                            {/*Selector2*/}
                            {selectorMapping(stSelector2, stSelector3, props.rowKey, handleSelector2Change)}
                        </div>
                        <div className="col-6 col-sm-6 col-md-2">
                            {/*Value*/}
                            {valueMapping(stSelector2, stValue, props.rowKey, handleOnValueChange)}
                        </div>
                        <div className="col-6 col-sm-6 col-md-2">
                            {/*Selector expired time // only show when total order or total purchase*/}
                            {
                                (stSelector2 === 'Total Order Number' || stSelector2 === 'Total Purchase Amount') &&
                                selectorMapping('Expired Time', getValueExpiredTime, props.rowKey + '_value_expired_time', handleOnValueExpiredTimeChange)
                            }
                        </div>
                    </div>
                </div>
                <div className="btn-remove-wrapper col-1">
                    {props.removable && <i className="btn-remove" onClick={handleOnRemove}/>}
                </div>
        </div>
    );
};

const SelectProductCustom = props => {
    const {value, rowKey, onChange} = props

    const [stToggle, setStToggle] = useState(false)

    const handleProductModalClose = products => {
        setStToggle(false)

        if (products === null) {
            return
        }

        onChange({currentTarget: {value: products.map(p => p.id).join(',')}})
    }

    return (
        <>
            {
                stToggle && <ProductModal
                    productSelectedList={value ? value.split(',').map(v => ({id: v})) : []}
                    onClose={handleProductModalClose}
                    type={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                    max={200}
                />
            }
            {
                _.isEmpty(value)
                    ? <GSFakeLink className='font-weight-500' onClick={() => setStToggle(toggle => !toggle)}>
                        <GSTrans t='page.customers.segments.purchasedProduct.selectProduct'/>
                    </GSFakeLink>
                    : <span>
                        <span className='font-weight-500'>
                            <GSTrans t='page.customers.segments.purchasedProduct.selected' values={{x: value.split(',').length}}/>
                            .&nbsp;
                        </span>
                        <GSFakeLink className='font-italic font-weight-500' onClick={() => setStToggle(toggle => !toggle)}>
                            <GSTrans t='common.btn.edit'/>
                        </GSFakeLink>
                    </span>
            }
            <AvField
                hidden
                name={'row_' + rowKey + '_value'}
                value={value}
                validate={{
                    ...FormValidate.required()
                }}
            />
        </>
    )
}

SegmentConditionRow.propTypes = {
    selectorStr: PropTypes.string,
    value: PropTypes.array,
    rowKey: PropTypes.any,
    onRemove: PropTypes.func,
    removable: PropTypes.bool,
};

export default SegmentConditionRow;
