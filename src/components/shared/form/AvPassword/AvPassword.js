/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import {AvField} from 'availity-reactstrap-validation'
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './AvPassword.sass'

class AvPassword extends Component {

    state = {
        type: 'password',
        icon: 'eye'
    }

    constructor(props) {
        super(props);
        this.toggleShowCurrentPassword = this.toggleShowCurrentPassword.bind(this);
    }


    toggleShowCurrentPassword() {
        let type, icon
        if (this.state.type === 'password') {
            type = 'text';
            icon = 'eye-slash'
        } else {
            type = 'password';
            icon = 'eye'
        }

        this.setState({
            type: type,
            icon: icon
        })
    }

    render() {
        const {viewable, ...other} = this.props
        return (
            <div className={['av-password','gsa__relative', this.props.className].join(' ')}>
                <AvField type={this.state.type} {...other} >

                </AvField>
                {viewable &&
                <FontAwesomeIcon
                    onClick={this.toggleShowCurrentPassword}
                    icon={this.state.icon}
                    className="av-password__ic_eye"/>
                }
            </div>
        );
    }
}

AvPassword.propTypes = {
    viewable: PropTypes.bool,
};

export default AvPassword;
