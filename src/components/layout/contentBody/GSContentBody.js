/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class GSContentBody extends Component {
    render() {
        const {className, centerChildren, ...other} = this.props
        return (
            <div className={["gs-page-content gs-page-content--" + this.props.size, className, centerChildren? 'gs-atm__flex-row--center gs-atm__flex-align-items--center gsa-flex-grow--1':''].join(' ')} {...other}>
                {this.props.children}
            </div>
        )
    }
}

GSContentBody.size = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    EXTRA: 'extra',
    MAX: 'max'
}

GSContentBody.propTypes = {
  size: PropTypes.oneOf(Object.values(GSContentBody.size)).isRequired,
    className: PropTypes.string,
    centerChildren: PropTypes.bool
}
