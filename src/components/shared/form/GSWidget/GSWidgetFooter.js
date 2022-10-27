/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import './GSWidget.sass'

const GSWidgetFooter = props => {
    const {className, ...other} = props
    return (
        <div className={["widget__footer", className].join(' ')} {...other}>
            {props.children}
        </div>
    );
};

GSWidgetFooter.propTypes = {
    className: PropTypes.string,
};

export default GSWidgetFooter;
