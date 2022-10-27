/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import './GSFakeLink.sass'
import PropTypes from 'prop-types'

const GSFakeLink = props => {
    const {className, onClick, ...other} = props
    return (
        <span className={["gs-fake-link", className].join(' ')} {...other} onClick={onClick}>{props.children}</span>
    );
};

GSFakeLink.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default GSFakeLink;
