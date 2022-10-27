/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import './CollectionConditionsZone.sass'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {AvForm, AvRadio, AvRadioGroup} from "availity-reactstrap-validation";
import i18next from "../../../../config/i18n";
import CollectionConditionsConfigRow, {ConditionOperands} from "./ConditionRow/CollectionConditionsConfigRow";
import Constants from '../../../../config/Constant'

export const ConditionTypes = {
    ALL: 'ALL',
    ANY: 'ANY'
}

export const Conditions = {
    CONTAINS: 'ALL',
    IS_EQUAL_TO: 'IS_EQUAL_TO',
    STARTS_WITH: 'STARTS_WITH',
    END_WITH: 'END_WITH',
}

const BlankCondition = {
    conditionField: 'PRODUCT_NAME',
    operand: ConditionOperands[0].value,
    values: [{
        value: ''
    }]
}

const MAXIMUM_CONDITION = 10

const CollectionConditionsConfig = props => {

    const [stDraftConditions, setStDraftConditions] = useState(props.value.conditions);

    const switchByItemType = (product, service) => {
        if (props.itemType === Constants.COLLECTION_ITEM_TYPE.PRODUCT) {
            return product
        } else {
            return service
        }
    }

    const ConditionFields = () => {
        let Fields = [{
            value: "PRODUCT_NAME",
            label: i18next.t(switchByItemType("page.collection.automated.by.productTitle.product","page.collection.automated.by.productTitle.service")),
        },
        {
            value: "PRODUCT_PRICE",
            label: i18next.t(switchByItemType("page.collection.automated.by.productPrice.product","page.collection.automated.by.productPrice.service")),
        }];
        if (props.itemType === Constants.COLLECTION_ITEM_TYPE.SERVICE) {
            Fields.splice(1, 1);
        }
        return Fields;
    }

    useEffect(() => {
        if (props.value.conditions.length === 0) {
            // add default
            setStDraftConditions([BlankCondition])
        }
    }, [])

    useEffect(() => {
        onChange(props.value.conditionType, stDraftConditions)
    }, [stDraftConditions])



    const onChange = (conditionType, conditions) => {
        props.onChange({
            conditionType: conditionType,
            conditions: conditions
        })
    }

    const onChangeConditionType = (e) => {
        e.persist()
        const value = e.currentTarget.value
        onChange(value, props.value.conditions)
    }

    const onClickAddNew = (e) => {
        e.preventDefault()
        setStDraftConditions([...stDraftConditions, BlankCondition])
    }

    const onRemove = (index) => {
        stDraftConditions.splice(index, 1)
        setStDraftConditions([...stDraftConditions])
    }

    const onChangeConditionRow = (cond, index) => {
        stDraftConditions[index] = cond
        setStDraftConditions([...stDraftConditions])
    }

    return (
        <div className="collection-conditions-zone">
            <div className="automated-config__header">
                <h3>
                    <GSTrans t={"page.collection.automated.conditions"}/>
                </h3>
                <GSButton default icon={<i className="btn-addproduct__icon"/>} onClick={onClickAddNew}
                    disabled={stDraftConditions.length >= MAXIMUM_CONDITION}
                    >
                    <GSTrans t={"page.collection.automated.addMoreCondition"}/>
                </GSButton>
            </div>
            <div className="automated-config__condition-type">
                <span>
                    <GSTrans t={switchByItemType("page.collection.automated.productMustMatch.product","page.collection.automated.productMustMatch.service")}/>
                </span>
                <span className="automated-config__radio-wrapper">
                    <AvForm>
                        <AvRadioGroup
                            name="conditionType"
                            inline
                            value={props.value.conditionType}>
                            <AvRadio
                                customInput
                                label={i18next.t("page.collection.automated.allConditions")}
                                value={ConditionTypes.ALL}
                                onClick={onChangeConditionType}
                            />
                            <AvRadio
                                customInput
                                label={i18next.t("page.collection.automated.anyConditions")}
                                value={ConditionTypes.ANY}
                                onClick={onChangeConditionType}
                            />
                        </AvRadioGroup>
                    </AvForm>
                </span>
            </div>
            <div className="automated-config__condition-list">
                {stDraftConditions.map( (cond, index) => {
                    return (
                        <CollectionConditionsConfigRow 
                            key={cond.conditionField+cond.operand+cond.values[0].value+index}
                            condition={cond}
                            removable={index !== 0}
                            onRemove={() => onRemove(index)}
                            onChange={(cond) => onChangeConditionRow(cond, index)}
                            itemType={props.itemType}
                            ConditionFields={ConditionFields()}
                        />
                    )
                })}
            </div>
        </div>
    );
};

CollectionConditionsConfig.propTypes = {
    value: PropTypes.shape({
        conditionType: PropTypes.oneOf(Object.values(ConditionTypes)),
        conditions: PropTypes.arrayOf( PropTypes.shape({
            conditionField: PropTypes.string,
            operand: PropTypes.string,
            values: PropTypes.arrayOf( PropTypes.shape({
                value: PropTypes.string
            }))
        }))
    }),
    onChange: PropTypes.func,
    itemType: PropTypes.string,
};

export default CollectionConditionsConfig;
