/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/10/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React from 'react';
import PropTypes from 'prop-types';
import {FacebookApp} from "../../config/FacebookApp";
import {Trans} from "react-i18next";
import {FacebookLogin} from "react-facebook-login-component";

const GSFacebookLogin = props => {
    return (
        <FacebookLogin socialId={FacebookApp.id}
                       language="en_US"
                       scope="email"
                       responseHandler={props.onResponseFacebook}
                       xfbml={true}
                       fields={FacebookApp.fields}
                       version="v3.0"
                       className={props.className}
                       buttonText={props.customButton}
                       onClick={props.openFacebook}
        />
    );
};

// const GSFacebookLogin = props => {
//     return (
//         <FacebookLogin appId={FacebookApp.id}
//                        callback={props.onResponseFacebook}
//                        autoLoad={false}
//                        fields={FacebookApp.fields}
//                        xfbml={true}
//                        onClick={props.openFacebook}
//                        render={props.customButton}
//         />
//     );
// };

GSFacebookLogin.propTypes = {
    className: PropTypes.string,
    customButton: PropTypes.any,
    openFacebook: PropTypes.func,
    onResponseFacebook: PropTypes.func
};

export default GSFacebookLogin;

export const DefaultButtonText = () => {
    return (
        <span className='uik-btn__content'>
           <Trans i18nKey="login.loginBy">
               Đăng nhập bằng
           </Trans>&nbsp;<span style={{fontWeight: 'bold'}}>Facebook</span>
       </span>
    );
};

export const DefaultFacebookLoginClass = 'uik-btn__base uik-btn__primary uik-btn__isExpanded login-widget__btnSubmitFaceBook';
