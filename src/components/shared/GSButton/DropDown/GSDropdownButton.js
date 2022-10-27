/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {UikDropdown, UikDropdownItem} from '../../../../@uik'

const GSDropDownButton = props => {
    const {button, position, ...other} = props
    return (
        <UikDropdown
            DisplayComponent={button}
            position={position}
            {...other}
        >
            {props.children}
        </UikDropdown>
    );
};


GSDropDownButton.POSITION = {
    TOP_LEFT: 'topLeft',
    TOP_RIGHT: 'topRight',
    BOTTOM_LEFT: 'bottomLeft',
    BOTTOM_RIGHT: 'bottomRight'
}

GSDropDownButton.defaultProps = {
    position: GSDropDownButton.POSITION.BOTTOM_RIGHT
}


GSDropDownButton.propTypes = {
    button: PropTypes.any.isRequired,
    position: PropTypes.oneOf(Object.values(GSDropDownButton.POSITION))
};


export const GSDropdownItem = props => {
    return (
        <UikDropdownItem {...props} style={{
            padding: "0 .5rem",
            width: "100%"
        }}>
            {props.children}
        </UikDropdownItem>
    );
};

export default GSDropDownButton;
