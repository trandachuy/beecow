/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 27/08/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import './GSAlertBox.sass'

export const AlertType = {
    PRIMARY: 'PRIMARY'
}

const GSAlertBox = props => {
    const {iconSrc, className, style, type, content, ...rest} = props
    return (
        <div className={"gs-alert-box " + props.className} style={{
            padding: props.padding,
            ...style
        }} {...rest}>
            {iconSrc &&
                <img className="gs-alert-box__icon" src={iconSrc} alt='alert'/>
            }
            <div className="gs-alert-box__content">
                {props.children}

            </div>
        </div>
    );
};

GSAlertBox.defaultProps = {
    padding: '14px'
}

GSAlertBox.propTypes = {
    className: PropTypes.any,
    iconSrc: PropTypes.string,
    type: PropTypes.string,
    style: PropTypes.any,
    padding: PropTypes.string,
};

export default GSAlertBox;
