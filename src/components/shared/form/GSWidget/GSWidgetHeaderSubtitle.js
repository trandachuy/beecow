/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";

class GSWidgetHeaderSubtitle extends Component {
    render() {
        return (
            <span className={"gs-widget__header-sub-title " + this.props.className}>
                {this.props.children}
            </span>
        );
    }
}

GSWidgetHeaderSubtitle.propTypes = {
    className: PropTypes.string
};

export default GSWidgetHeaderSubtitle;
