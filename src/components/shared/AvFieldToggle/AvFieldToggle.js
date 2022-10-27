/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/11/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import './AvFieldToggle.sass'
import {UikToggle} from '../../../@uik'
import {AvFeedback, AvGroup, AvInput} from 'availity-reactstrap-validation'

const AvFieldToggle = props => {
    const [stChecked, setStChecked] = useState(props.checked);


    const toggle =  (event) => {
        const newStatus = event.currentTarget.checked
        let allowChange = true
        if (props.allowChange) {
            allowChange = props.allowChange(newStatus)
        }
        if (allowChange) {
            if (props.onChange) {
                props.onChange(newStatus)
            }
            setStChecked(newStatus)
        } else {
            event.preventDefault()
        }
    }

    const {onChange, checked, label, validate, name, allowChange, className, ...other} = props
    return (
        <AvGroup {...other} className={['av-field-toggle', className].join(' ')}>
            <UikToggle
                label={props.label}
                defaultChecked={stChecked}
                onClick={toggle}
            >
            </UikToggle>
            <AvInput type="text" name={props.name}
                    value={stChecked}
                     hidden
            />
            <AvFeedback>feedback</AvFeedback>
        </AvGroup>

    );
};

AvFieldToggle.defaultProps = {
    checked: false
}

AvFieldToggle.propTypes = {
  checked: PropTypes.bool,
  label: PropTypes.string,
  validate: PropTypes.any,
    name: PropTypes.string.isRequired,
    allowChange: PropTypes.func,
    onChange: PropTypes.func,
    className: PropTypes.string,
}

export default AvFieldToggle;
