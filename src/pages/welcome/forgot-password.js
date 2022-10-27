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
    UikSelect,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader
} from '../../@uik';
import './Forgot.sass'
import AlertInline, {AlertInlineType} from "../../components/shared/AlertInline/AlertInline";
import {setPageTitle} from "../../config/redux/Reducers";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import Logo from "../../components/shared/Logo";
import {Trans} from "react-i18next";
import Constants from "../../config/Constant";
import storageService from "../../services/storage";
import i18next from "../../config/i18n";
import {CredentialUtils} from "../../utils/credential";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {Label} from "reactstrap";
import AvPassword from "../../components/shared/form/AvPassword/AvPassword";
import phoneCodeModel from "../../../public/data/phone-code";
import {ValidateUtils} from "../../utils/validate";
import {NavigationPath} from "../../config/NavigationPath.js";

class ForgotPassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            isWrongEmail: false,
            passwordInputType: 'password',
            passwordInputShowIcon: 'eye',
            isSuccess: false,
            phoneCode: '+84'
        }
        this.onFormChange = this.onFormChange.bind(this);
        this.onForgot = this.onForgot.bind(this);
        this.toggleShowPassword = this.toggleShowPassword.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this)
        this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - Forgot password'));
    }

    componentDidMount() {
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
            [event.target.name]: event.target.value,
            isWrongEmail: false
        });
    }

    onForgot(event) {
        this.setState({
            isLoading: true
        });

        event.preventDefault();
        let requestForgot;
        if (ValidateUtils.isPhone(this.state.username)) {
            requestForgot = Authenticate.forgotPhone(this.state.phoneCode, this.state.username);
        } else {
            requestForgot = Authenticate.forgotEmail(this.state.username);
        }

        requestForgot
            .then(() => {
                    this.setState({
                        isWrongEmail: false,
                        isSuccess: true
                    })
                },
                () => {
                    this.setState({
                        isWrongEmail: true,
                        isSuccess: false
                    })
                });
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

    changePhoneCode(phoneCode) {
        this.setState({
            phoneCode: phoneCode
        })
    }

    userNameValidate(value, ctx, input, cb) {
        ValidateUtils.userNameValidate(i18next, value, ctx, input, cb);
    }

    render() {
        if (this.state.isSuccess) {
            return <Redirect to={{
                pathname: '/reset',
                state: {
                    password: this.state.password,
                    username: this.state.username,
                    phoneCode: this.state.phoneCode,
                    isStaff: this.props.isStaff
                }
            }}/>
        }
        return (
            <div className="forgot-page-wrapper">
                <div className="forgot-widget">
                    <UikWidget>
                        <UikWidgetHeader className="login-widget__formHeader">
                            <p><Logo height={39}/></p>
                            <p>
                                <Trans i18nKey="welcome.forgotPassword.title">
                                    New password
                                </Trans>
                            </p>
                        </UikWidgetHeader>
                        <UikWidgetContent>
                            <AvForm onValidSubmit={this.onForgot}>
                                <UikFormInputGroup>
                                    <div className={"form-group phone-code"}>
                                        <label><Trans i18nKey="login.countryCode">
                                            Country Code
                                        </Trans></label>
                                        <UikSelect
                                            defaultValue={this.state.phoneCode}
                                            options={phoneCodeModel.map((dataRow) => {
                                                return (
                                                    {
                                                        value: dataRow.code,
                                                        label: (
                                                            <div className={'phone-option'}>
                                                                <div>{dataRow.name}</div>
                                                                <div>
                                                                    {dataRow.code}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                )
                                            })}
                                            onChange={(item) => this.changePhoneCode(item.value)}
                                        />
                                    </div>
                                    <Label className={"gs-frm-control__title"}>
                                        <Trans i18nKey="login.emailOrPhone">
                                            EMAIL or phone
                                        </Trans>
                                    </Label>
                                    <AvField
                                        className={"input-field__hint"}
                                        name="username"
                                        value={this.state.username}
                                        validate={{
                                            required: {
                                                value: true,
                                                errorMessage: i18next.t('common.validation.required')
                                            },
                                            maxLength: {
                                                value: 150,
                                                errorMessage: i18next.t("common.validation.char.max.length", {x: 150})
                                            },
                                            async: this.userNameValidate
                                        }}
                                        // placeholder={i18next.t('welcome.wizard.step1.email.hint')}
                                        onChange={this.onFormChange}
                                    />
                                    <AlertInline
                                        type={AlertInlineType.ERROR}
                                        text={i18next.t('page.forgotPassword.emailNotFound')}
                                        hidden={!this.state.isWrongEmail}
                                        nonIcon={true}
                                        textAlign="left"
                                        className="m-0 p-0"
                                    />
                                    <div className="login-widget__inputPasswordWrapper">
                                        <AvPassword
                                            viewable
                                            className="input-field__hint"
                                            name="password"
                                            label={i18next.t("welcome.forgotPassword.title")}
                                            value={this.state.password}
                                            validate={{
                                                required: {
                                                    value: true,
                                                    errorMessage: i18next.t('common.validation.required')
                                                },
                                                pattern: {
                                                    value: Constants.PASSWORD_PATTERN,
                                                    errorMessage: i18next.t('common.validation.invalid.password.format')
                                                }
                                            }}
                                            onChange={this.onFormChange}
                                        />
                                    </div>
                                    <UikButton
                                        primary
                                        type="submit"
                                        className="login-widget__btnSubmit"
                                    >
                                        <Trans i18nKey="welcome.forgotPassword.btn.continue">
                                            Continue
                                        </Trans>
                                    </UikButton>
                                    <UikHeadlineDesc/>
                                </UikFormInputGroup>
                            </AvForm>
                        </UikWidgetContent>
                    </UikWidget>
                </div>
                {!this.state.isLoading &&
                <div className="forgot-widget__linkWrapper">
                    <div className="forgot-widget__linkItem forgot-widget__linkItem--left">
                        <Link to={NavigationPath.login}
                            className="forgot-widget__changeLanguage-english forgot-widget__changeLanguage forgot-widget__changeLanguage-selected">
                            <Trans i18nKey="common.btn.back" />
                        </Link>
                    </div>
                    <div className="forgot-widget__linkItem forgot-widget__linkItem--right">
                            <span
                                onClick={() => this.changeLanguage(Constants.LanguageKey.ENGLISH)}
                                className={"forgot-widget__changeLanguage-english forgot-widget__changeLanguage " + (this.state.isEnglish ? "forgot-widget__changeLanguage-selected" : "forgot-widget__changeLanguage-unselected")}>
                                <Trans i18nKey="common.txt.english">
                                    English
                                </Trans>
                            </span>

                        <span
                            onClick={() => this.changeLanguage(Constants.LanguageKey.VIETNAMESE)}
                            className={'forgot-widget__changeLanguage ' +
                            (this.state.isEnglish ? 'forgot-widget__changeLanguage-unselected' : 'forgot-widget__changeLanguage-selected')}>
                                <Trans i18nKey="common.txt.vietnamese">
                                    Vietnamese
                                </Trans>
                            </span>
                    </div>
                </div>}
            </div>
        )
    }
}

export default connect()(ForgotPassword);
