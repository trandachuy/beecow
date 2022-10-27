/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {UikCheckbox} from "../../../../../@uik";
import './ProductListBarcodePrinterProductRow.sass'
import {SCREENS_ENUM} from "../ProductListBarcodePrinter";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import AvFieldCurrency from "../../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {FormValidate} from "../../../../../config/form-validate";
import Constants from "../../../../../config/Constant";
import GSImg from "../../../../../components/shared/GSImg/GSImg";

const ProductListBarcodePrinterProductRow = props => {
    // console.log('re-render', props.product.id)

    const onCheck  = () => {
        if (props.screen === SCREENS_ENUM.SEARCH_RESULT) {
            if (!props.checked) {
                props.onSelect(props.product)
            } else {
                props.onDeselect(props.product)
            }
        }

    }

    const onUpdateQuantity = (e) => {
        const value = e.currentTarget.value
        if (parseInt(value) <= 1000) {
            props.onUpdate( {
                ...product,
                quantity: value
            })
        }

    }

    const renderModelName = () => {
        if (props.product.modelLabel) {
            const labelList = props.product.modelLabel.split('|')
            const nameList = props.product.modelName.split('|')
            const result = []
            for (const labelIndex in labelList) {
                if (labelList[labelIndex] === Constants.DEPOSIT_CODE.CODE && nameList[labelIndex] !== Constants.DEPOSIT_CODE.FULL) {
                    result.push(`${nameList[labelIndex]}`)
                } else if (labelList[labelIndex] === Constants.DEPOSIT_CODE.CODE && nameList[labelIndex] === Constants.DEPOSIT_CODE.FULL) {

                } else{
                    result.push(`${labelList[labelIndex]}: ${nameList[labelIndex]}`)
                }
            }
            return result.join(' - ')
        }
    }

    const {product} = props
    return (
        <div className={["d-flex align-items-center product-list-barcode-printer-product-row py-2", props.className, props.screen === SCREENS_ENUM.SEARCH_RESULT? 'gsa-hover--gray cursor--pointer':''].join(' ')} onClick={onCheck}>
            {props.screen === SCREENS_ENUM.SEARCH_RESULT &&
                <UikCheckbox
                    defaultChecked={props.checked}
                    style={{
                        marginLeft: '.5rem'
                    }}
                    key={product.id + '-' + props.checked}
                />
            }
            {props.screen === SCREENS_ENUM.INSERTED_LIST &&
                <GSActionButton icon={GSActionButtonIcons.DELETE}
                                onClick={() => props.onDeselect(product)}
                                style={{
                                    marginLeft: '.75rem',
                                    marginRight: '.5rem'
                                }}
                />
            }
            <GSImg src={product.itemImage}
                 width={56}
                 height={56}
                 alt="product"
                 className="mr-2"
            />
            <div className="d-flex flex-column flex-grow-1 text-left product-content">
                <h6 className="m-0 product-list-barcode-printer-product-row__product-name">{product.itemName}</h6>
                <span className="font-size-14px color-gray">{renderModelName()}</span>
                <code className="font-size-14px color-gray">{product.barcode}</code>
            </div>
            {props.screen === SCREENS_ENUM.SEARCH_RESULT &&
                <div className='text-capitalize'>{product.conversionUnitName ? product.conversionUnitName: '-'}</div>
            }
            {props.screen === SCREENS_ENUM.INSERTED_LIST &&
                <>
                    <AvFieldCurrency name={`quantity-${product.barcode}`}
                                     parentClassName="product-list-barcode-printer-product-row__quantity-input"
                                     value={props.product.quantity}
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.maxValue(1_000, true),
                                         ...FormValidate.minValue(1)
                                     }}
                                     onBlur={onUpdateQuantity}
                    />
                </>
            }
        </div>
    );
};

ProductListBarcodePrinterProductRow.propTypes = {
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
    checked: PropTypes.bool,
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onUpdate: PropTypes.func,
    screen: PropTypes.oneOf(['SEARCH_RESULT','INSERTED_LIST'])
};

const areEqual = (prev, next) => {
    // console.log('=======================')
    // console.log(prev, next)
    // console.log('is equal ', prev.product.id === next.product.id && prev.checked === next.checked && prev.product.quantity == next.product.quantity)
    return prev.product.id === next.product.id && prev.checked === next.checked && prev.product.quantity == next.product.quantity
}

export default React.memo(ProductListBarcodePrinterProductRow, areEqual);
