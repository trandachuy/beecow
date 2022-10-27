/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {UikInput} from "../../../../../@uik";
import {AvField} from "availity-reactstrap-validation";
import i18next from "../../../../../config/i18n";
import './CollectionConditionsConfigRow.sass'
import {CredentialUtils} from '../../../../../utils/credential'
import Constants from '../../../../../config/Constant'
import {CurrencyUtils} from '../../../../../utils/number-format'
import AvFieldCurrency from '../../../../../components/shared/AvFieldCurrency/AvFieldCurrency'


export const ConditionOperands = [
	{
		value: 'CONTAINS',
		label: "page.collection.automated.conditions.contains",
	},
	{
		value: 'IS_EQUAL_TO',
		label: "page.collection.automated.conditions.isEqualTo",
	},
	{
		value: 'STARTS_WITH',
		label: "page.collection.automated.conditions.startsWith",
	},
	{
		value: 'ENDS_WITH',
		label: "page.collection.automated.conditions.endWith",
	}
]

export const PriceConditionOperands = [
	{
		value: 'GREATER_THAN',
		label: "page.collection.automated.conditions.greaterThan",
	},
	{
		value: 'LESS_THAN',
		label: "page.collection.automated.conditions.lessThan",
	},
	{
		value: 'IS_EQUAL_TO',
		label: "page.collection.automated.conditions.equalWith",
	}
]

const CollectionConditionsConfigRow = props => {

	const PRODUCT_NAME = "PRODUCT_NAME";
	const PRODUCT_PRICE = "PRODUCT_PRICE";
	const MIN_PRICE = 0;
	const MAX_PRICE = 99999999999;

	const [stErrorMessage, setStErrorMessage] = useState("");
	const [conditionFields, setConditionFields] = useState(props.ConditionFields);
	const [conditionOperands, setConditionOperands] = useState([]);
	const [conditionFieldValue, setConditionFieldValue] = useState(props.condition.conditionField);
	const [conditionOperandValue, setConditionOperandValue] = useState(props.condition.operand);
	const [conditionValue, setConditionValue] = useState(props.condition.values[0].value);

	const updateOperands = (name) => {
		const fieldName = name || conditionFieldValue;
		if(fieldName === PRODUCT_PRICE) {
			//operands for product price
			setConditionOperands(PriceConditionOperands);
		} else {
			setConditionOperands(ConditionOperands);
		}
	}

	useEffect(() => {
		validate(conditionValue);
		updateOperands();
	}, [conditionOperands]);

	const onRemove = () => {
		props.onRemove(props.condition)
	}
	
	const onChangeConditionField = (event) => {
		const value = event.target.value;
		const operandValue = (value === PRODUCT_PRICE)? PriceConditionOperands[0].value: ConditionOperands[0].value;
		updateOperands(value);
		setConditionFieldValue(value);
		setConditionOperandValue(operandValue);
		setTimeout(() => {
			props.onChange({
				...props.condition,
				conditionField: value,
				operand: operandValue
			})
		}, 10);
	}

	const onChangeOperand = (event) => {
		setConditionOperandValue(event.target.value);
		props.onChange({
            ...props.condition,
            operand: event.target.value
        })
	}

	const validate = (val) => {
		if(val === undefined) return;
		//clear error message by default
		setStErrorMessage('');
		//used in product and service collection
		//validation for product name
		if(props.condition.conditionField === PRODUCT_PRICE) {
			if(!(/^[0-9]+(.[0-9]+)?$/.test(val))) {
				setStErrorMessage(i18next.t("common.validation.number.format"))
			} else if(parseFloat(val) < MIN_PRICE) {
				setStErrorMessage(i18next.t("common.validation.number.min.value", {x: MIN_PRICE}))
			} else if(parseFloat(val) > MAX_PRICE) {
				setStErrorMessage(i18next.t("common.validation.number.max.value", {x: MAX_PRICE}))
			}
		} else {
			if (val.trim() === '') {
				setStErrorMessage(i18next.t("common.validation.required"))
			} else {
				if (val.length < 3) {
					setStErrorMessage(i18next.t("common.validation.char.min.length", {x: 3}))
				} else if (val.length > 100) {
					setStErrorMessage(i18next.t("common.validation.char.max.length", {x: 100}))
				}
			}
		}
	}

	const onChangeValue = (e) => {
		const val = e.currentTarget.value;
		props.onChange({
            ...props.condition,
            values: [{
				value: val
			}]
        })
		validate(val);
	}

	return (
		<div className="collection-conditions-config-row row">
			{/*FIELD*/}
			<div className="col-md-4 col-5 long-text">
				<AvField type="select"
						name="conditionField"
						value={conditionFieldValue}
						onChange={onChangeConditionField}>
					{conditionFields.map(item => {
						return (
						<option value={item.value}>
							{i18next.t(item.label)}
						</option>)
					})}
				</AvField>
			</div>
			{/*OPERATOR*/}
			<div className="col-md-4 col-5">
				<AvField type="select"
						name="conditionOperand"
						value={conditionOperandValue}
						onChange={onChangeOperand}>
					{conditionOperands.map(item => {
						return (
						<option value={item.value}>
							{i18next.t(item.label)}
						</option>)
					})}
				</AvField>
			</div>
			{/*VALUE*/}
			<div className="col-md-3 col-10">
				<UikInput
					defaultValue={conditionValue}
					errorMessage={stErrorMessage}
					onBlur={onChangeValue}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
						}
					}}
				/>
			</div>
			{/*ACTION*/}
			<div className="col-md-1  col-2 action">
				{props.removable && <i className="remove-button" onClick={onRemove}/>}
			</div>
	</div>
	);
};

CollectionConditionsConfigRow.defaultProps = {
	condition: {
		conditionField: 'PRODUCT_NAME',
		operand: ConditionOperands[0].value,
		values: [{
			value: ''
		}]
	},
	removable: true,
}

CollectionConditionsConfigRow.propTypes = {
	condition: PropTypes.shape({
		conditionField: PropTypes.string,
		operand: PropTypes.string,
		values: PropTypes.arrayOf( PropTypes.shape({
			value: PropTypes.string
		}))
	}),
	removable: PropTypes.bool,
	onRemove: PropTypes.func,
	itemType: PropTypes.string,
	ConditionFields: PropTypes.array,
};

export default CollectionConditionsConfigRow;
