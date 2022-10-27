/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Loading, {LoadingStyle} from "../Loading/Loading";
import './LoadingScreen.sass'
import Constants from "@config/Constant";

class   LoadingScreen extends Component {

    render() {
        return (
            <div className="loading-screen"
            style={{
                zIndex: this.props.zIndex
            }}>
                <Loading style={this.props.loadingStyle? this.props.loadingStyle:LoadingStyle.ELLIPSIS}/>
            </div>
        );
    }
}

LoadingScreen.defaultValue = {
    zIndex: Constants.Z_INDEX_SYSTEM.LOADING_OVERLAY
}

LoadingScreen.propTypes = {
    loadingStyle: PropTypes.string,
    zIndex: PropTypes.number,
};

export default LoadingScreen;
