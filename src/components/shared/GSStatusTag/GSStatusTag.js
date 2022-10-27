/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/06/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './GSStatusTag.sass'

class GSStatusTag extends Component {



    render() {
        const {className, tagStyle, text, border, ...other} = this.props
        return (
            <span className={['gs-status-tag', className, tagStyle? tagStyle:'gs-tag-light', border? '':'gs-status-tag--no-border'].join(' ')} {...other}
            >
                {text? text:this.props.children}
            </span>
        );
    }
}

GSStatusTag.STYLE = {
    PRIMARY: 'gs-tag-primary',
    SECONDARY: 'gs-tag-secondary',
    SUCCESS: 'gs-tag-success',
    DANGER: 'gs-tag-danger',
    WARNING: 'gs-tag-warning',
    INFO: 'gs-tag-info',
    LIGHT: 'gs-tag-light',
    DARK: 'gs-tag-dark',
    ACTIVE: 'gs-tag-active'
}

GSStatusTag.defaultProps = {
    border: false
}

GSStatusTag.propTypes = {
  className: PropTypes.string,
  tagStyle: PropTypes.oneOf(Object.values(GSStatusTag.STYLE)),
  text: PropTypes.any,
    border: PropTypes.bool,
}

export default GSStatusTag;
