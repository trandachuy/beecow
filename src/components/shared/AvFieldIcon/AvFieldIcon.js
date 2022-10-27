/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import style from './AvFieldIcon.module.sass'
import {AvFeedback, AvGroup, AvInput} from 'availity-reactstrap-validation'
import Label from "reactstrap/es/Label";

const AvFieldIcon = props => {

    let iconClassName = style.iconRight
    let inputClassName = style.avInputWrapperRight
    const {label, icon, iconPosition, className, ...other} = props
    if (iconPosition) {
        switch (iconPosition) {
            case AvFieldIconPosition.RIGHT:
                iconClassName = style.iconRight
                inputClassName = style.avInputWrapperRight
                break
            case AvFieldIconPosition.LEFT:
                iconClassName = style.iconLeft
                inputClassName = style.avInputWrapperLeft
                break
        }
    }

    return (
        <AvGroup >
           {label && <Label className="gs-frm-input__label">{label}</Label>}
            <div className={[style.avInputWrapper, inputClassName].join(' ')}>
                <span className={[style.icon, iconClassName].join(' ')}>
                    {icon}
                </span>
                <AvInput {...other} className={[className, style.inputFormControl].join(' ')}/>
            </div>
            <AvFeedback/>
        </AvGroup>
    );
};

export const AvFieldIconPosition = {
    LEFT: 'left',
    RIGHT: 'right'
}

AvFieldIcon.propTypes = {
    icon: PropTypes.any,
    iconPosition: PropTypes.oneOf(Object.values(AvFieldIconPosition))
};

export default AvFieldIcon;
