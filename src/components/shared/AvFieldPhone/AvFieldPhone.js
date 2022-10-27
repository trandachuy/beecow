import React, {useEffect, useRef, useState} from 'react';
import {AvField, AvGroup} from 'availity-reactstrap-validation'
import {CurrencySymbol} from "../form/CryStrapInput/CryStrapInput";
import PropTypes from "prop-types";
import style from './AvFieldPhone.module.sass';
import {Label} from "reactstrap";
import NumberFormat from 'react-number-format';
import GSButton from "../GSButton/GSButton";
import jquery from 'jquery'

const AvFieldPhone = props => {
    const refAvField = useRef(null);
    const [stAvValue, setStAvValue] = useState(props.value);

    const {
        value,
        stepper,
        step,
        prefix,
        suffix,
        className,
        unit,
        label,
        onChange,
        parentClassName,
        onBlur,
        numberFormatProps,
        onKeyPress,
        onValueKeyPressChange,
        disabled,
        flag,
        ...other
    } = props
    useEffect(() => {
        setStAvValue(props.value)
    }, [props.value])


    const handleOnKeyPress = (e) => {
        if (flag !== 1) {
            if (e.key === '.') {
                e.preventDefault()
            }
        }
        if (onKeyPress) {
            onKeyPress(e)
        }
    }

    const onStepUp = (e) => {
        e.preventDefault()
        let value = stAvValue;
        if (!value) {
            value = 0
        }
        setStAvValue(parseInt(value) + parseInt(step))
        if (onChange) {
            onChange({
                currentTarget: {
                    name: props.name,
                    value: parseInt(value) + parseInt(step)
                }
            })
        }
    }

    const onStepDown = (e) => {
        e.preventDefault()
        let value = stAvValue;
        if (!value) {
            value = 0
        }
        setStAvValue(parseInt(value) - parseInt(step))
        if (onChange) {
            onChange({
                currentTarget: {
                    name: props.name,
                    value: parseInt(value) - parseInt(step)
                }
            })
        }
    }

    return (
        <AvGroup className={stepper ? 'd-flex' : ''}>
            {label && <Label className="gs-frm-input__label">{label}</Label>}
            {
                stepper && <GSButton className={[style.stepper, style.stepperDown].join(' ')} onClick={onStepDown}><i
                    className="fa fa-minus" aria-hidden="true"></i></GSButton>
            }
            <div className={[style.AvFieldPhoneWrapper, props.parentClassName].join(' ')} style={stepper ? {width: '168px', 'margin-bottom': '-1rem'} : {}}>
                <NumberFormat
                    disabled={disabled}
                    className={[style.currencyInput, unit !== CurrencySymbol.NONE ? style.paddingLeft : ''].join(' ')}
                    onKeyDown={ (e) => {
                        e.key === 'Enter' && e.preventDefault()
                    } }
                    onValueChange={values => {
                        let value = values.formattedValue !== undefined && values.formattedValue !== '' ? values.formattedValue : ''
                        if (onValueKeyPressChange) {
                            onValueKeyPressChange({
                                currentTarget: {
                                    name: props.name,
                                    value: value
                                }
                            })
                        }
                        setStAvValue(value)
                    }}
                    value={stAvValue}
                    onKeyPress={handleOnKeyPress}
                    allowLeadingZeros={false}
                    onBlur={() => {
                        let value = stAvValue
                        //value = value !== undefined && value !== '' ? (typeof value === 'string' ? value.split(thousandSeparator).join('') : value) : ''

                        if (onChange) {
                            onChange({
                                currentTarget: {
                                    name: props.name,
                                    value: value
                                }
                            })
                        }
                        if (onBlur) {
                            onBlur({
                                currentTarget: {
                                    name: props.name,
                                    value: value
                                }
                            })
                        }
                        //Blur avfield to validate value, NOT REMOVE
                        jquery('#' + props.name).focus().blur()
                    }}
                    {...numberFormatProps}
                />
                <div className={style.fieldWrapper}>
                    <span className={style.unit}>{unit}</span>
                    <AvField {...other}
                            value={stAvValue === 0 ? '0' : stAvValue}
                            onChange={onChange}
                            disabled={disabled}
                            className={[
                                className, style.avInput,
                                unit !== CurrencySymbol.NONE ? style.paddingLeft : '',
                                stepper ? style.borderRadius0 : ''
                            ].join(' ')}
                            ref={refAvField}
                            style={{
                                userSelect: 'none'
                            }}
                            tabIndex={-1}
                    />
                </div>
            </div>
            {
                stepper && <GSButton className={[style.stepper, style.stepperUp].join(' ')} onClick={onStepUp}><i
                    className="fa fa-plus" aria-hidden="true"></i></GSButton>
            }
        </AvGroup>
    );
};

AvFieldPhone.defaultProps = {
    unit: CurrencySymbol.NONE,
    stepper: false,
    step: 1,
}

AvFieldPhone.propTypes = {
    unit: PropTypes.object,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
    validate: PropTypes.any,
    className: PropTypes.string,
    parentClassName: PropTypes.string,
    numberFormatProps: PropTypes.object,
    stepper: PropTypes.bool,
    step: PropTypes.number,
    onKeyPress: PropTypes.func,
    onValueKeyPressChange: PropTypes.func,
    disabled: PropTypes.bool,
};
 
export default AvFieldPhone;

 
 
 