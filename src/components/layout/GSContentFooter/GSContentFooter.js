/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/06/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './GSContentFooter.sass'

class GSContentFooter extends Component {
    render() {
        const {className, ...other} = this.props
        return (
            <div className={['gs-content-footer', className].join(' ')} {...other}>
                {this.props.children}
            </div>
        );
    }
}

GSContentFooter.propTypes = {};

export default GSContentFooter;
