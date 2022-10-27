/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/03/2019
 * Author: Kun <hai.hoang.nguyen@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import Authenticate from '../../services/authenticate';
import {
    UikButton,
    UikFormInputGroup,
    UikHeadlineDesc,
    UikInput,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader
} from '../../@uik';

import './Forgot.sass'
import AlertInline, {AlertInlineType} from "../../components/shared/AlertInline/AlertInline";
import Loading from "../../components/shared/Loading/Loading";
import {setPageTitle} from "../../config/redux/Reducers";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {NAV_PATH} from "../../components/layout/navigation/Navigation";
import Logo from "../../components/shared/Logo";
import {GSToast} from "../../utils/gs-toast";
import GSTrans from "../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import {ValidateUtils} from "../../utils/validate";
import {NavigationPath} from "../../config/NavigationPath.js";

class ResetPassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            isWrongCode: false,
            newPasswordMatchedCurrentPassword: false,
            isSuccess : false,
            password: props.location.state.password,
            username: props.location.state.username,
            phoneCode: props.location.state.phoneCode
        };
        this.onFormChange = this.onFormChange.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onResend = this.onResend.bind(this);
        this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - Reset password'));
    }

    onFormChange(event) {
        this.setState({
            [event.target.name]: event.target.value.trim()
        });
    }

    onResend(e) {
        e.preventDefault()

        let requestForgot;
        if (ValidateUtils.isPhone(this.state.username)) {
            requestForgot = Authenticate.forgotPhone(this.state.phoneCode, this.state.username);
        } else {
            requestForgot = Authenticate.forgotEmail(this.state.username);
        }

        requestForgot
            .then(() => {
                    GSToast.success("login.forgetPassword.emailWasSent", true)
                },
                () => {
                });
    }

    onReset(event) {
        this.setState({
            isLoading: true
        });

        event.preventDefault();
        Authenticate.reset(this.state.key, this.state.password)
            .then((response) => {
                if (response && response.warnings && response.warnings.length > 0) {
                    response.email && this.setState({email: response.email});
                    response.phone && this.setState({phone: response.phone});
                    if (this.props.location.state.isStaff) {
                        this.setState({ handlePreStaffLogin: true });
                    } else if (!response.store) {
                        this.setState({from: NAV_PATH.wizard + '/2', warnings: response.warnings});
                    }
                    else {
                        this.setState({from: NAV_PATH.wizard + '/2', warnings: response.warnings, storeId: response.store.id});
                    }
                }
                this.setState({
                    isWrongCode: false,
                    isSuccess : true
                })
            })
            .catch((e) => {
                console.error(e)
                this.setState({
                    isWrongCode: false,
                    newPasswordMatchedCurrentPassword: false,
                    isSuccess : false,
                    isLoading: false
                })
                if (e.response.status === 404 || e.response.status === 406 || e.response.status === 410) {
                    this.setState({
                        isWrongCode: true,
                    })
                }
                else if (e.response.status === 409) {
                    this.setState({
                        newPasswordMatchedCurrentPassword: true
                    })
                }
            });

    }

    render() {
        if (this.state.isSuccess) {
            if (this.state.handlePreStaffLogin) {
                return <Redirect to={{
                    pathname: "/login",
                    state: {
                        email: this.state.email,
                        phone: this.state.phone,
                        password: this.state.password,
                        shouldHandlePreStaffLogin: true
                    }
                }} />;
            }
            let redirectUrl = this.state.from ? this.state.from : NavigationPath.home;
            return <Redirect to={{
                pathname: redirectUrl,
                state: {
                    storeId: this.state.storeId,
                    warnings: this.state.warnings,
                    email: this.state.email,
                    phone: this.state.phone
                }
            }}/>
        }
        return (
            <div className="login-page-wrapper">
                <div  className="login-widget">
                    <UikWidget>
                        <UikWidgetHeader className="login-widget__formHeader">
                            <p><Logo height={58}/></p>
                            <GSTrans t="login.forgetPassword.title"/>
                        </UikWidgetHeader>
                        <UikWidgetContent>
                            <Loading hidden={!this.state.isLoading}/>
                            <form method="post" onSubmit={this.onReset} hidden={this.state.isLoading} className="reset-frm">
                                <a className="btn-resend" href="#" onClick={this.onResend}>
                                    <GSTrans t="login.forgetPassword.resend"/>
                                </a>
                                <UikFormInputGroup>
                                    <UikInput
                                        label={i18next.t("login.forgetPassword.code")}
                                        required
                                        type="tel"
                                        maxLength ="6"
                                        name="key"
                                        onChange={this.onFormChange}
                                    />
                                    <AlertInline
                                        type={AlertInlineType.ERROR}
                                        text={i18next.t('page.forgotPassword.incorrectConfirmationCode')}
                                        hidden={!this.state.isWrongCode}/>
                                    <AlertInline
                                        type={AlertInlineType.ERROR}
                                        text={i18next.t('page.setting.resetPassword.error.newPasswordMatchedCurrentPassword')}
                                        hidden={!this.state.newPasswordMatchedCurrentPassword}/>
                                    <UikButton
                                        success
                                        type="submit"
                                        className="login-widget__btnSubmit"
                                    >
                                       <GSTrans t="login.forgetPassword.confirm"/>
                                    </UikButton>
                                    <UikHeadlineDesc/>
                                </UikFormInputGroup>
                            </form>
                        </UikWidgetContent>
                    </UikWidget>
                </div>
            </div>
        )
    }
}

export default connect()(ResetPassword);
