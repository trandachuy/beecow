/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 11/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UikWidget} from '../../../../@uik'

class GSWidget extends Component {
    render() {
        const {className, ...other} = this.props
        return (
            <UikWidget className={["gs-widget", className].join(' ')} {...other}>
                {this.props.children}
            </UikWidget>
        );
    }
}

GSWidget.propTypes = {
    className: PropTypes.string
};

export default GSWidget;
