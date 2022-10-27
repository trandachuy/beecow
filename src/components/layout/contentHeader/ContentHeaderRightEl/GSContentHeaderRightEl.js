/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './GSContentHeaderRightEl.sass'

/**
 * Use GSContentHeader[rightEl] instead
 * @deprecated
 */
class GSContentHeaderRightEl extends Component {
    render() {
        return (
            <div style={{marginLeft: 'auto'}} className={['gs-content-header-right-el', this.props.className? this.props.className:''].join(' ')}>
                {this.props.children}
            </div>
        );
    }
}

GSContentHeaderRightEl.propTypes = {
    className: PropTypes.string
};

/**
 * @deprecated
 */
export default GSContentHeaderRightEl;
