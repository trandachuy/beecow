/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react';
import authenticate from '../../../services/authenticate';
import {
    UikFormInputGroup,
    UikHeadlineDesc,
    UikInput,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader
} from '../../../@uik';
import {Trans} from "react-i18next";

import './StaffLogin.sass'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import {setPageTitle} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import Logo from "../../../components/shared/Logo";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import i18next from 'i18next';
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import {CredentialUtils} from "../../../utils/credential";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {AgencyService} from "../../../services/AgencyService";


class StaffLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            rememberMe: true,
            passwordInputType: 'password',
            passwordInputShowIcon: 'eye',
            isLoginFailed: false,
            failReason: undefined,
            isLoading: false,
            from: props.location.state ? props.location.state.from : null,
            isSuccess: !!authenticate.getCredential(),
            storeId: '',
            warning: '',
            isEnglish: false
        };
        this.onFormChange = this.onFormChange.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.toggleShowPassword = this.toggleShowPassword.bind(this);
        this.doHandleLoginResponse = this.doHandleLoginResponse.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.dispatch(setPageTitle(AgencyService.getDashboardName() + ' - Login'));
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        this.setState({storeId: params.get('sid')});
    
        // Get language from local storage. set default en if any
        let languageKey = storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
        if (languageKey === null || languageKey === "") {
            languageKey = Constants.LanguageKey.VIETNAMESE
            CredentialUtils.setLangKey(languageKey)
        }
        if (languageKey === Constants.LanguageKey.VIETNAMESE) {
            this.setState({
                isEnglish: false
            })
        } else {
            this.setState({
                isEnglish: true
            })
        }
    }

    changeLanguage(langKey) {
        if (langKey === Constants.LanguageKey.VIETNAMESE) {
            this.setState({
                isEnglish: false
            })
        } else {
            this.setState({
                isEnglish: true
            })
        }
        i18next.changeLanguage(langKey)
        CredentialUtils.setLangKey(langKey)
    }

    onFormChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onLogin(event) {
        this.setState({
            isLoading: true
        });

        event.preventDefault();

        this.doHandleLoginResponse(authenticate.staffLogin(this.state.username, this.state.password, this.state.storeId, this.state.rememberMe));
    }

    doHandleLoginResponse(loginRequest) {
        loginRequest
            .then((response) => {
                if (response && response.warnings && response.warnings.length > 0) {
                    response.email && this.setState({email: response.email});
                    response.phone && this.setState({phone: response.phone});
                    if (!response.store) {
                        this.setState({from: NAV_PATH.wizard + '/2', warnings: response.warnings});
                    } else {
                        this.setState({
                            from: NAV_PATH.wizard + '/2',
                            warnings: response.warnings,
                            storeId: response.store.id
                        });
                    }

                }
                this.setState({isSuccess: true});
                this.setState({
                    isLoading: false
                })
            })
            .catch(reason => {
                console.error('ERROR: ' + reason);
                let failKey = reason.response.data &&
                    (reason.response.data.message === 'Only PRODUCT store can login for GoSell, DEAL store does not support' || reason.response.data.message === 'COMPANY cannot login for GoSell')
                    ? 'login.login.notsupport' : 'login.login.fail';
                this.setState({
                    isLoginFailed: true,
                    isLoading: false,
                    failReason: failKey
                })
            })
    }

    toggleShowPassword() {
        let type, icon;
        if (this.state.passwordInputType === 'password') {
            type = 'text';
            icon = 'eye-slash'
        } else {
            type = 'password';
            icon = 'eye'
        }
        this.setState({
            passwordInputType: type,
            passwordInputShowIcon: icon
        })
    }

    render() {
        if (this.state.isSuccess) {
            let redirectUrl = this.state.from ? this.state.from : NAV_PATH.home;
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
                <div className={"login-widget"}>
                    <UikWidget>
                        <UikWidgetHeader className="login-widget__formHeader">
                            <p><Logo height={58}/></p>
                            <p style={{marginBottom: 0}}><Trans i18nKey="login.welcome">
                                Chào mừng trở lại, hãy đăng nhập bên dưới
                            </Trans></p>
                            <p style={{marginBottom: 0, fontSize: 0.9 + 'rem', color: '#9EA0A5'}}><Trans i18nKey="login.beecow">You can
                                use <span style={{color: '#1f1f57'}}>Beecow</span> to login</Trans></p>
                        </UikWidgetHeader>
                        <UikWidgetContent className="login-widget__formBody">
                            <Loading hidden={!this.state.isLoading} style={LoadingStyle.DUAL_RING_GREY}/>
                            <form method="post" onSubmit={this.onLogin} hidden={this.state.isLoading}>

                                <UikFormInputGroup>
                                    <UikInput
                                        label={i18next.t('welcome.wizard.step1.email')}
                                        // placeholder="me@janlosert.com"
                                        type="email"
                                        name="username"
                                        onChange={this.onFormChange}
                                        maxLength={150}
                                    />
                                    <div className="login-widget__inputPasswordWrapper">
                                        <UikInput
                                            label={i18next.t('welcome.wizard.step1.password')}
                                            type={this.state.passwordInputType}
                                            name="password"
                                            onChange={this.onFormChange}
                                            maxLength={50}
                                        />
                                        <FontAwesomeIcon
                                            onClick={this.toggleShowPassword}
                                            className="login-widget__btnShowPassword"
                                            icon={this.state.passwordInputShowIcon}/>
                                    </div>
                                    <GSButton
                                        success
                                        // className="login-widget__btnSubmit"
                                    >
                                        <Trans i18nKey="welcome.wizard.step1.signIn">
                                            Đăng nhập
                                        </Trans>
                                    </GSButton>
                                    <UikHeadlineDesc/>
                                    <AlertInline
                                        type={AlertInlineType.ERROR}
                                        text={i18next.t(this.state.failReason)}
                                        hidden={!this.state.isLoginFailed}/>
                                </UikFormInputGroup>
                            </form>
                        </UikWidgetContent>
                    </UikWidget>
                    {!this.state.isLoading &&
                    <div className="login-widget__linkWrapper">
                        <div className="login-widget__linkItem ">
                            <span
                                onClick={() => this.changeLanguage(Constants.LanguageKey.ENGLISH)}
                                className={"login-widget__changeLanguage-english login-widget__changeLanguage " + (this.state.isEnglish ? "login-widget__changeLanguage-selected" : "login-widget__changeLanguage-unselected")}>
                                <Trans i18nKey="common.txt.english">
                                    English
                                </Trans>
                            </span>

                            <span
                                onClick={() => this.changeLanguage(Constants.LanguageKey.VIETNAMESE)}
                                className={'login-widget__changeLanguage ' +
                                (this.state.isEnglish ? 'login-widget__changeLanguage-unselected' : 'login-widget__changeLanguage-selected')}>
                                <Trans i18nKey="common.txt.vietnamese">
                                    Vietnamese
                                </Trans>
                            </span>
                        </div>
                    </div>}
                </div>
            </div>
        )
    }
}

export default connect()(StaffLogin);
