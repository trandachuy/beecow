/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {AvForm, AvField} from 'availity-reactstrap-validation'
import AvFieldCountable from "../../../../../components/shared/form/CountableAvField/AvFieldCountable";
import GSTooltip from "../../../../../components/shared/GSTooltip/GSTooltip";
import i18n from "i18next";
import {TokenUtils} from "../../../../../utils/token";
import {UikSelect} from "../../../../../@uik";
import i18next from "i18next";
import AvFieldCurrency from "../../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {FormValidate} from "../../../../../config/form-validate";
import {CurrencySymbol} from "../../../../../components/shared/form/CryStrapInput/CryStrapInput";
import styled from "styled-components";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import {CredentialUtils} from "../../../../../utils/credential";
import AlertInline, {AlertInlineType} from "../../../../../components/shared/AlertInline/AlertInline";
import * as Styled from './ShippingRuleEditorModal.styled'
import Constants from '../../../../../config/Constant';


const CONDITION = {
    BASE_ON_PRODUCT_WEIGHT: 'BASE_ON_PRODUCT_WEIGHT',
    BASE_ON_TOTAL_ORDER_AMOUNT: 'BASE_ON_TOTAL_ORDER_AMOUNT'
}

const ShippingRuleEditorModal = props => {
    const {currency, ...others} = props
    const refSubmitBtn = useRef(null);
    const conditionOptions = useMemo(() => [
        {
            label: i18next.t('page.setting.shippingAndPayment.rule.baseOnTotalAmount'),
            value: CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT
        },
        {
            label: i18next.t('page.setting.shippingAndPayment.rule.baseOnWeight'),
            value: CONDITION.BASE_ON_PRODUCT_WEIGHT
        }
    ], []);

    const [stCondition, setStCondition] = useState(CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT);

    useEffect(() => {
        if (props.mode === ShippingRuleEditorModal.MODE.ADD) {
            setStCondition(props.editRule?.validCondition || CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT)
        } else {
            setStCondition(props.editRule.rule.condition)
        }
    }, [props.editRule]);

    const onChangeCondition = ({value}) => {
        setStCondition(value)
    }

    const handleValidSubmit = (event, values) => {
        if (props.editRule.validCondition && props.editRule.validCondition !== stCondition) {
            return
        }
        /**
         * @type {ShippingRuleDTO}
         */
        const shippingRule = {
            storeId: CredentialUtils.getStoreId(),
            condition: stCondition,
            fromRange: stCondition === CONDITION.BASE_ON_PRODUCT_WEIGHT? values['rule-from-range-weight']:values['rule-from-range-amount'],
            toRange: stCondition === CONDITION.BASE_ON_PRODUCT_WEIGHT? values['rule-to-range-weight']:values['rule-to-range-amount'],
            shippingFee: values['shippingFee'],
            conditionUnit: stCondition === CONDITION.BASE_ON_PRODUCT_WEIGHT? 'GRAM': currency,
            name: values['rule-name'],
        }

        props.onDone({
            locationIndex: props.editRule?.locationIndex,
            mode: props.mode,
            rule: shippingRule,
            ruleIndex: props.editRule?.ruleIndex
        })
    }

    const onClose = () => {
        props.onClose()
    }


    return (
        <Styled.ModalWrapper>
            <Modal isOpen={props.isOpen} className="modal-v2">
                <ModalHeader toggle={props.onClose}>
                    {props.mode === ShippingRuleEditorModal.MODE.ADD && <GSTrans t="page.setting.shippingAndPayment.rule.addNew"/>}
                    {props.mode === ShippingRuleEditorModal.MODE.EDIT && <GSTrans t="page.setting.shippingAndPayment.rule.edit"/>}
                </ModalHeader>
                <ModalBody>
                    <AvForm onValidSubmit={handleValidSubmit} onSubmit={console.log} autoComplete="off" >
                        <button hidden ref={refSubmitBtn}>submit</button>
                        <label className="gs-frm-input__label">
                            <GSTrans t="page.setting.shippingAndPayment.rule.name"/>
                            <GSTooltip placement={GSTooltip.PLACEMENT.BOTTOM_LEFT} html={
                                <GSTrans t="page.setting.shippingAndPayment.rule.hint1">
                                    Customer will see this <strong>Name</strong> and <strong>Shipping Fee</strong> when they purchase at online store.
                                </GSTrans>
                            }/>
                        </label>
                        <Styled.AvFieldCountableWrapper>
                            <AvFieldCountable
                                name="rule-name"
                                maxLength="150"
                                minLength="150"
                                isRequired
                                validate={ {
                                    ...FormValidate.required(),
                                    ...FormValidate.minLength(3),
                                    ...FormValidate.maxLength(150)
                                } }
                                className='rule-name'
                                value={ props.mode === ShippingRuleEditorModal.MODE.EDIT ? props.editRule.rule.name : '' }
                            />
                        </Styled.AvFieldCountableWrapper>

                        <label className="gs-frm-input__label">
                            <GSTrans t="page.setting.shippingAndPayment.rule.condition"/>
                        </label>
                        <Styled.ConditionDropDownWrapper>
                            <UikSelect
                                position="bottomRight"
                                options={conditionOptions}
                                value={[{value: stCondition}]}
                                style={{
                                    width: '100%'
                                }}
                                onChange={onChangeCondition}
                            />
                            {(props.editRule?.validCondition && props.editRule?.validCondition !== stCondition) &&
                                <div style={{paddingTop: 4}}>
                                    <AlertInline type={AlertInlineType.ERROR} padding={false} textAlign="left"
                                                 text={i18next.t('page.setting.shippingAndPayment.rule.hint2')}
                                                 nonIcon
                                    />
                                </div>
                            }
                            {stCondition === CONDITION.BASE_ON_PRODUCT_WEIGHT &&
                                <Styled.WeightWarnBox>
                                    <em>
                                        <GSTrans t="page.setting.shippingAndPayment.rule.notice">
                                            <strong>0</strong>1
                                        </GSTrans>
                                    </em>
                                </Styled.WeightWarnBox>
                            }

                        </Styled.ConditionDropDownWrapper>

                        <hr/>

                        {/*RANGE AMOUNT*/}
                        <Styled.RangeWrapper hidden={stCondition !== CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT}>
                            <label className="gs-frm-input__label">
                                <GSTrans t="page.setting.shippingAndPayment.rule.totalAmountRange"/>
                            </label>
                            <div className="row">
                                <div className="col-12 col-md-6 p-0 pl-md-0 pr-md-2">
                                    <AvFieldCurrency
                                        parentClassName="w-100"
                                        name="rule-from-range-amount"
                                        validate={{
                                            ...FormValidate.withCondition(stCondition === CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT, FormValidate.required()),
                                            ...FormValidate.minValue(0),
                                            ...FormValidate.maxValue(99_999_999_999, true),
                                        }}
                                        unit={currency}
                                        value={props.mode === ShippingRuleEditorModal.MODE.EDIT &&
                                        props.editRule.rule.condition === CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT? props.editRule.rule.fromRange:''}
                                        position={CurrencyUtils.isPosition(currency)}
                                        precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                        decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                    />
                                </div>

                                <div className="col-12 col-md-6 p-0 pr-md-0 pl-md-2">
                                    <AvFieldCurrency
                                        name="rule-to-range-amount"
                                        parentClassName="w-100"
                                        placeholder={i18next.t('page.setting.shippingAndPayment.rule.table.condition.noLimit')}
                                        unit={currency}
                                        validate={{
                                            ...FormValidate.maxValue(99_999_999_999, true),
                                            ...FormValidate.async((value, ctx, input, cb) => {
                                                const min = parseFloat(ctx['rule-from-range-amount'] || 0)
                                                if (value && parseFloat(value) < min) {
                                                    cb(i18next.t('common.validation.number.min.value',
                                                        {x:NumberUtils.formatThousandFixed(min, CurrencyUtils.isCurrencyInput(currency) ? 2 : 0)}))
                                                } else {
                                                    cb(true)
                                                }
                                            })
                                        }}
                                        value={props.mode === ShippingRuleEditorModal.MODE.EDIT &&
                                        props.editRule.rule.condition === CONDITION.BASE_ON_TOTAL_ORDER_AMOUNT? props.editRule.rule.toRange:''}
                                        position={CurrencyUtils.isPosition(currency)}
                                        precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                        decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                    />
                                </div>

                            </div>
                        </Styled.RangeWrapper>


                        {/*RANGE WEIGHT*/}
                        <Styled.RangeWrapper hidden={stCondition !== CONDITION.BASE_ON_PRODUCT_WEIGHT}>
                            <label className="gs-frm-input__label">
                                <GSTrans t="page.setting.shippingAndPayment.rule.weightRange"/>
                            </label>
                            <div className="row">

                                <div className="col-12 col-md-6 p-0 pl-md-0 pr-md-2">

                                    <AvFieldCurrency
                                        parentClassName="w-100"
                                        name="rule-from-range-weight"
                                        validate={{
                                            ...FormValidate.withCondition(stCondition === CONDITION.BASE_ON_PRODUCT_WEIGHT, FormValidate.required()),
                                            ...FormValidate.minValue(0),
                                            ...FormValidate.maxValue(99_999_999_999, true),
                                            ...FormValidate.integerNumber()
                                        }}
                                        unit={CurrencySymbol.G}
                                        value={props.mode === ShippingRuleEditorModal.MODE.EDIT &&
                                        props.editRule.rule.condition === CONDITION.BASE_ON_PRODUCT_WEIGHT? props.editRule.rule.fromRange:''}
                                    />
                                </div>

                                <div className="col-12 col-md-6 p-0 pr-md-0 pl-md-2">
                                    <AvFieldCurrency
                                        parentClassName="w-100"
                                        name="rule-to-range-weight"
                                        unit={CurrencySymbol.G}
                                        placeholder={i18next.t('page.setting.shippingAndPayment.rule.table.condition.noLimit')}
                                        validate={{
                                            ...FormValidate.maxValue(99_999_999_999, true),
                                            ...FormValidate.integerNumber(),
                                            ...FormValidate.async((value, ctx, input, cb) => {
                                                const min = parseInt(ctx['rule-from-range-weight'] || 0)
                                                if (value && parseInt(value) < min) {
                                                    cb(i18next.t('common.validation.number.min.value',
                                                        {x:CurrencyUtils.formatThousand(min)}))
                                                } else {
                                                    cb(true)
                                                }
                                            })
                                        }}
                                        value={props.mode === ShippingRuleEditorModal.MODE.EDIT &&
                                        props.editRule.rule.condition === CONDITION.BASE_ON_PRODUCT_WEIGHT? props.editRule.rule.toRange:''}
                                    />
                                </div>


                            </div>
                        </Styled.RangeWrapper>

                        <label className="gs-frm-input__label">
                            <GSTrans t="page.order.detail.items.shippingFee"/>
                        </label>
                        <div className="row">
                            <div className="col-12 col-md-6 p-0 pl-md-0 pr-md-2">
                                <AvFieldCurrency
                                    parentClassName="w-100"
                                    name="shippingFee"
                                    unit={currency}
                                    validate={{
                                        ...FormValidate.required(),
                                        ...FormValidate.minValue(0),
                                        ...FormValidate.maxValue(99_999_999_999, true)
                                    }}
                                    value={props.mode === ShippingRuleEditorModal.MODE.EDIT? props.editRule.rule.shippingFee:''}
                                    position={CurrencyUtils.isPosition(currency)}
                                    precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                />
                            </div>
                        </div>

                    </AvForm>
                </ModalBody>
                <ModalFooter className="modal-footer-with-border d-flex justify-content-end" style={{
                    paddingTop: '1rem !important',
                    borderTop: '1px solid #DDE0E9 !important'
                }}>
                    <GSButton secondary outline onClick={onClose}>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton success marginLeft onClick={() => refSubmitBtn.current.click()}>
                        <GSTrans t="common.btn.save"/>
                    </GSButton>
                </ModalFooter>
            </Modal>

        </Styled.ModalWrapper>
    );
};

ShippingRuleEditorModal.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
};

ShippingRuleEditorModal.propTypes = {
    isOpen: PropTypes.bool,
    mode: PropTypes.string,
    onClose: PropTypes.func,
    onDone: PropTypes.func,
    locationList: PropTypes.array,
    editRule: PropTypes.shape({
        locationIndex: PropTypes.number,
        validCondition: PropTypes.string,
        rule: PropTypes.object,
        ruleIndex: PropTypes.number,
    }),
    currency: PropTypes.string,
};

ShippingRuleEditorModal.MODE = {
    ADD: 'ADD',
    EDIT: 'EDIT'
}

export default ShippingRuleEditorModal;
