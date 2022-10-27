/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 30/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import GSContentContainer from "../../components/layout/contentContainer/GSContentContainer";

class BlankContent extends Component {
    onRetry() {
        window.location.reload()
    }
    render() {
        return (
            <GSContentContainer isLoading={true} isRetry={this.props.isRetry} onRetry={this.onRetry }>

            </GSContentContainer>
        );
    }
}

BlankContent.defaultProps = {
    isRetry: false
}

BlankContent.propTypes = {
    isRetry: PropTypes.bool,
};

export default BlankContent;
