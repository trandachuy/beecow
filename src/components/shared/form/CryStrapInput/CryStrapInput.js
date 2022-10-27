/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 20/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React from "react"
import './CryStrapInput.sass'
import PropTypes from 'prop-types';
import i18next from 'i18next'
import accounting from 'accounting-js'
import NumberFormat from 'react-number-format';
import Constants from "../../../../config/Constant";
import GSContentContainer from "../../../layout/contentContainer/GSContentContainer";

/**
 * @deprecated Use AvFieldCurrency instead
 */
export default class CryStrapInput extends React.Component {

    constructor(props) {
        super(props)

        this.defaultError = 'This field is invalid'

        this.state = {
            isValid: true,
            value: this.props.default_value? this.props.default_value:'0',
            errMessage: this.defaultError,
        }
        this.max = this.props.max_length
        this.min = this.props.min_length
        this.minV = this.props.min_value
        this.maxV = this.props.max_value
        this.lengthErrorMessage = this.props.length_error_message
        this.valueErrorMessage = this.props.value_error_message

        this.onInputChange = this.onInputChange.bind(this)
        this.checkRequired = this.checkRequired.bind(this)
        this.setInvalid = this.setInvalid.bind(this)
        this.getValue = this.getValue.bind(this)
        this.isValid = this.isValid.bind(this)
        this.onBlurInput = this.onBlurInput.bind(this)
        this.isInputUnitOutside = this.isInputUnitOutside.bind(this)

        this.unitFormat = {
            symbol: this.props.unit,
            thousand: ',',
            precision:this.props.unit === '' || this.props.unit === Constants.CURRENCY.VND.SYMBOL || 
            this.props.unit === Constants.CURRENCY.VND.SYMBOL2 ? 0 : 2,
            format: this.props.unit === '' || this.props.unit === Constants.CURRENCY.VND.SYMBOL || 
            this.props.unit === Constants.CURRENCY.VND.SYMBOL2 ? "%v%s" : '%s%v',
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.max = this.props.max_length
        this.min = this.props.min_length
        this.minV = this.props.min_value
        this.maxV = this.props.max_value
        
        this.lengthErrorMessage = this.props.length_error_message
        this.valueErrorMessage = this.props.value_error_message
        if (prevProps.default_value !== this.props.default_value && (!isNaN(prevProps.default_value) && !isNaN(this.props.default_value))) {
            // if (this.props.on_change_callback) this.props.on_change_callback(this.props.default_value)
            this.setState({
                value: this.props.default_value
            })
        }
    }

    isValid() {
        let e = this.state.value +''
        let length = e.split(',').join('').length
        let value = parseFloat(e.split(',').join(''))

        if (!this.props.required && e === '') {
            return true
        }

        if (isNaN(value)) {
            this.setInvalid(e, this.getErrorMessage(this.props.err_min_value, i18next.t(
                "common.validation.number.min.value",
                {
                    x: accounting.formatMoney(this.minV, this.unitFormat)
                }
            )))
            return false
        }

        // check length
        if (this.max && length > this.max) {
            this.setInvalid(e, this.lengthErrorMessage)
            return false
        }

        if (this.min && length < this.min) {
            this.setInvalid(e, this.lengthErrorMessage)
            return false
        }

        // check value
        if (this.maxV != undefined && value > this.isInputUnitOutside(this.maxV,this.props.unit)) {
            this.setInvalid(e, this.getErrorMessage(this.props.err_max_value, i18next.t(
                "common.validation.number.max.value",
                {
                    x: accounting.formatMoney(this.maxV, this.unitFormat)
                }
            )))
            return false
        }

        if (this.minV != undefined && value < this.isInputUnitOutside(this.minV,this.props.unit)) {
            this.setInvalid(e, this.getErrorMessage(this.props.err_min_value, i18next.t(
                "common.validation.number.min.value",
                {
                    x: accounting.formatMoney(this.minV, this.unitFormat)
                }
            )))
            return false
        }

        this.setState({isValid: true})

        return this.state.isValid
    }

    getValue() {
        let value = this.state.value + ''
        if (value.includes(',')) {
            return parseInt(value.split(',').join(''))
        }
        return parseInt(value)
    }

    getErrorMessage(message, defaultMessage) {
        if (message) {
            return message
        } else {
            return defaultMessage
        }
    }

    onBlurInput(e) {
        if (this.props.disable) {
            return
        }

        e = String(this.state.value)
        let value
        if (e === '') {
            value = e;
        }
        else {
            value = parseInt(e.split(',').join(''))
        }
        if (this.props.on_blur) {
            this.props.on_blur(value)
        }
    }


    onInputChange(values) {
        if (this.props.disable) {
            return
        }

        let e = values.formattedValue;
        let length = e.split(',').join('').length
        let value =this.props.unit === Constants.CURRENCY.VND.SYMBOL ? parseInt(e.split(',').join('')) : parseFloat(e.split(',').join('')).toFixed(2)

        if ( e === '') {
            this.setState({
                value: e
            })

            if(!this.props.required){
                this.setState({
                    isValid: true
                })
            }

            if (this.props.on_change_callback) {
                this.props.on_change_callback(e)
            }
            return
        }

        if (this.props.on_change_callback) {
            this.props.on_change_callback(value)
        }

        if (isNaN(value)) {
            this.setInvalid(e, this.getErrorMessage(this.props.err_min_value, i18next.t(
                "common.validation.number.min.value",
                {
                    x: this.minV? accounting.formatMoney(this.minV, this.unitFormat):0
                }
            )))
            return
        }

        // check length
        if (this.max && length > this.max) {
            this.setInvalid(e, this.lengthErrorMessage)
            return
        }

        if (this.min && length < this.min) {
            this.setInvalid(e, this.lengthErrorMessage)
            return
        }

        // check value
        if (this.maxV != undefined && value > this.isInputUnitOutside(this.maxV,this.props.unit)) {
            this.setInvalid(e, this.getErrorMessage(this.props.err_max_value, i18next.t(
                "common.validation.number.max.value",
                {
                    x: accounting.formatMoney(this.maxV, this.unitFormat)
                }
            )))
            return
        }

        if (this.minV != undefined && value < this.isInputUnitOutside(this.minV,this.props.unit)) {
            this.setInvalid(e, this.getErrorMessage(this.props.err_min_value, i18next.t(
                "common.validation.number.min.value",
                {
                    x: accounting.formatMoney(this.minV, this.unitFormat)
                }
            )))
            return
        }

        // return

        if (!this.state.isValid) {
            this.setState({
                isValid: true,
                value: e
            })

            if (this.props.on_valid_callback) {
                this.props.on_valid_callback(true)
            }
        }


        if (this.state.isValid) {
            this.setState({
                value: e
            })
        }


    }

    setInvalid(value, message) {
        if (message) {
            this.setState({
                isValid: false,
                value: value,
                errMessage: message
            })
        } else {
            this.setState({
                isValid: false,
                value: value,
                errMessage: this.defaultError
            })
        }
        if (this.props.on_valid_callback) {
            this.props.on_valid_callback(false)
        }
    }


    checkRequired() {
        if (!this.props.required) {
            return true
        } else {
            this.setState({
                isValid: false
            })
            return false
        }
    }
    
    isInputUnitOutside(value,symbol) {
        if(symbol === CurrencySymbol.VND){
            return value
        }else {
            return parseFloat(value)
        }
    }

    render() {
        let propsToChild = {
            thousandSeparator: this.props.thousandSeparator,
            precision: this.props.precision,
            decimalScale: this.props.decimalScale
        }
        const {className, ...other} = this.props;
        
        return(
            <div className={["crystrapinput__wrapper", className, this.props.disable ? 'crystrapinput__wrapper--disable': ''].join(' ')} {...other}>
            <div className={"crystrapinput " + this.props.className}>
                <div className={'input-group ' +  ((this.state.isValid && !this.props.custom_err)? 'cur-input--not-error':'cur-input--error') }>
                    {this.props.unit !== CurrencySymbol.NONE && this.props.position === 'left' &&
                    <div className="input-group-append" style={{margin:"1px"}}>
                        <span className="input-group-text">{this.props.unit}</span>
                    </div>
                    }
                    <NumberFormat 
                        {...propsToChild}
                        tabIndex={this.props.tabIndex}
                        className={'form-control cur-input ' + (this.props.unit !== CurrencySymbol.NONE ?
                            this.props.unit === CurrencySymbol.VND ? 'cur-input--unit' : '' :'cur-input--non-unit')}
                        onValueChange={this.onInputChange} 
                        defaultValue={this.state.value} 
                        onBlur={this.onBlurInput}
                    />
                    {this.props.unit !== CurrencySymbol.NONE && (this.props.position === '' || this.props.position === 'right') &&
                        <div className="input-group-append">
                            <span className="input-group-text">{this.props.unit}</span>
                        </div>
                    }
                </div>
            </div>
            <div className="crystrapinput__error-message" hidden={this.state.isValid}>
                {this.state.errMessage}
            </div>
            </div>
        )
    }

    componentDidMount() {
        if (this.props.checkValidOnLoad) {
            this.isValid()
        }
    }


}


export const CurrencySymbol = {
    VND: 'đ',
    USD: '$',
    CM: 'cm',
    G: 'g',
    KG: 'kg',
    NONE: ''
}

export const Currency = {
    VND: 'VND',
    USD: 'USD',
    CM: 'CM',
    G: 'G',
    KG: 'KG',
    NONE: ''
}

export const NumericSymbol = {
    PERCENTAGE: '%'
}

CryStrapInput.defaultProps = {
    position:'',
    precision:0
}

CryStrapInput.propTypes = {
    max_length: PropTypes.number,
    min_length: PropTypes.number,
    length_error_message: PropTypes.string,
    unit: PropTypes.string,
    max_value: PropTypes.number,
    err_max_value: PropTypes.string,
    min_value: PropTypes.number,
    err_min_value: PropTypes.string,
    value_error_message: PropTypes.string,
    default_value: PropTypes.number,
    on_change_callback: PropTypes.func,
    on_valid_callback: PropTypes.func,
    on_blur: PropTypes.func,
    thousandSeparator: PropTypes.string,
    precision: PropTypes.any,
    checkValidOnLoad: PropTypes.bool,
    tabIndex: PropTypes.number,
    disable: PropTypes.bool,
    custom_err: PropTypes.any,
    position: PropTypes.string,
    decimalScale: PropTypes.number,
}

