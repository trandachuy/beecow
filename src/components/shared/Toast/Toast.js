/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 17/03/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/

import React, {Component} from "react";
import './Toast.sass'

class Toast extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isPlay: false
        }
    }

    playToast(){
        this.setState({isPlay : true});

        setTimeout(() => { 
            this.setState({isPlay : false});
        }, this.props.endTime);
    }

    render() {
        return (
            <div className="snackbar-wrapper">
                <div className={this.state.isPlay ? 'snackbar show' : 'snackbar fadeout'}>
                    {this.props.content}
                </div>
            </div>
        )
    }
}


export default Toast
