/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 19/03/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react'
import {AvField} from 'availity-reactstrap-validation'
import './CountableAvField.sass'
import PropTypes from 'prop-types'
import i18next from 'i18next'

export default class AvFieldCountable extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            textLength: this.props.value ? this.props.value.length : 0
        }

        this.counterPos = this.props.counterPosition
        if (!this.counterPos) {
            this.counterPos = CounterPosition.TOP_RIGHT
        }

        switch (this.counterPos) {
            case CounterPosition.TOP_RIGHT:
                this.counterClassName = 'counter__wrapper--top-right'
                break
            case CounterPosition.BOTTOM_RIGHT:
                this.counterClassName = 'counter__wrapper--bottom-right'
                break
        }


        this.onInput = this.onInput.bind(this)
        this.getValidate = this.getValidate.bind(this)
    }

    componentDidUpdate(prevProps) {
        if (this.props.value && this.props.value !== prevProps.value) {
            this.setState({
                textLength: this.props.value.length
            })
        }
    }


    onInput(e, v) {
        if (this.props.disable) {
            return
        }

        this.setState({
            textLength: v.length
        })
    }

    getValidate() {
        let validate = {
            ...this.props.validate
        }

        if (this.props.isRequired) {
            validate = {
                ...validate,
                required: {
                    value: true,
                    errorMessage: i18next.t('common.validation.required')
                }
            }
        }

        if (_.isNumber(this.props.minLength)) {
            validate = {
                ...validate,
                minLength: {
                    value: this.props.minLength,
                    errorMessage: i18next.t('common.validation.char.min.length', { x: this.props.minLength })
                }
            }
        }

        if (_.isNumber(this.props.maxLength)) {
            validate = {
                ...validate,
                maxLength: {
                    value: this.props.maxLength,
                    errorMessage: i18next.t('common.validation.char.max.length', { x: this.props.maxLength })
                }
            }
        }

        return validate
    }

    render() {
        return (
            <div className={['field__wrapper', this.props.disable ? 'field__wrapper--disable' : '', this.props.classNameWrapper].join(' ')}
                 hidden={this.props.hidden}>
                <span className={'counter__wrapper ' + this.counterClassName}>
                    {this.state.textLength}/{this.props.maxLength}
                </span>
                <AvField onInput={this.onInput}
                         className={this.props.className}
                         name={this.props.name}
                         label={this.props.label}
                         type={this.props.type}
                         value={this.props.value}
                         onKeyPress={this.props.onKeyPress ? this.props.onKeyPress : null}
                         placeholder={this.props.placeholder ? this.props.placeholder : ''}
                         rows={this.props.rows}
                         tabIndex={this.props.tabIndex}
                         {...this.props}
                         validate={this.getValidate()}/>

            </div>
        )
    }
}

AvFieldCountable.defaultProps = {
    hidden: false
}

AvFieldCountable.propTypes = {
    classNameWrapper: PropTypes.string,
    className: PropTypes.string,
    counterPosition: PropTypes.string,
    errorMessage: PropTypes.string,
    isRequired: PropTypes.bool,
    label: PropTypes.any,
    maxLength: PropTypes.number,
    minLength: PropTypes.number,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onKeyPress: PropTypes.any,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    type: PropTypes.any,
    validate: PropTypes.object,
    value: PropTypes.string,
    hidden: PropTypes.bool,
    tabIndex: PropTypes.number,
    disable: PropTypes.bool
}

export const CounterPosition = {
    TOP_RIGHT: 'topLeft',
    BOTTOM_RIGHT: 'bottomRight'
}
