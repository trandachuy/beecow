/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react';
import authenticate from '../../services/authenticate';
import {
    UikButton,
    UikDivider,
    UikFormInputGroup,
    UikHeadlineDesc,
    UikInput,
    UikSelect,
    UikWidget,
    UikWidgetContent,
    UikWidgetHeader
} from '../../@uik';
import {Trans} from "react-i18next";

import './Login.sass'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import AlertInline, {AlertInlineType} from "../../components/shared/AlertInline/AlertInline";
import Loading, {LoadingStyle} from "../../components/shared/Loading/Loading";
import {setPageTitle, setRequireMoreFields} from "../../config/redux/Reducers";
import {connect} from "react-redux";
import {Link, Redirect} from "react-router-dom";
import Logo from "../../components/shared/Logo";
import {NAV_PATH} from "../../components/layout/navigation/Navigation";
import i18next from 'i18next';
import storageService from "../../services/storage";
import Constants from "../../config/Constant";
import {CredentialUtils} from "../../utils/credential";
import GSButton from "../../components/shared/GSButton/GSButton";
import GSFacebookLogin, {DefaultButtonText, DefaultFacebookLoginClass} from "../../components/shared/GSFacebookLogin";
import {AgencyService} from "../../services/AgencyService";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../config/form-validate";
import phoneCodeModel from "../../../public/data/phone-code.json";
import {ValidateUtils} from "../../utils/validate";
import * as queryString from "query-string";
import {FormGroup, Modal, ModalBody, ModalHeader} from "reactstrap";
import {GSToast} from "../../utils/gs-toast";
import GSTab, {createItem} from "../../components/shared/form/GSTab/GSTab";
import storeService from "../../services/StoreService";
import {ImageUtils} from "../../utils/image";
import _ from 'lodash';
import {NavigationPath} from "../../config/NavigationPath.js";
import AlertModal, {AlertModalType} from '../../components/shared/AlertModal/AlertModal';

const TAB = {
    ADMIN: 'ADMIN',
    STAFF: 'STAFF'
}

class Login extends Component {

    constructor(props) {
        super(props);
        this.refAlert = null;
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
            isEnglish: false,
            isFacebookOpen: false,
            phoneCode: '+84',
            isModalLoading: false,
            modalActivate: false,
            modalMessage: '',
            activeTab: TAB.ADMIN,
            url: undefined,
            preStaffLogin: false,
            shouldHandlePreStaffLogin: props.location.state ? props.location.state.shouldHandlePreStaffLogin : null
        };
        this.onFormChange = this.onFormChange.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.toggleShowPassword = this.toggleShowPassword.bind(this);
        this.doHandleLoginResponse = this.doHandleLoginResponse.bind(this);
        this.openFacebook = this.openFacebook.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
        this.userNameValidate = this.userNameValidate.bind(this);
        this.onModalSubmit = this.onModalSubmit.bind(this);
        this.onModalChange = this.onModalChange.bind(this);
        this.resendCode = this.resendCode.bind(this);
        this.staffChooseStore = this.staffChooseStore.bind(this);
        this.onResponsePreStaffLogin = this.onResponsePreStaffLogin.bind(this);
        this.doHandleLoginFail = this.doHandleLoginFail.bind(this);
        this.onResponsePostStaffLoginFail = this.onResponsePostStaffLoginFail.bind(this);

        // Store 'from' param into session storage, and use in last step
        const queryParams = queryString.parse(window.location.search);
        if (queryParams.domain) {
            storageService.setToSessionStorage(Constants.STORAGE_KEY_DOMAIN, queryParams.domain);
        }
    }

    componentDidMount() {
        // Get language from local storage. set default en if any
        let languageKey = storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
        if (languageKey === null || languageKey === "") {
            languageKey = Constants.LanguageKey.VIETNAMESE
            CredentialUtils.setLangKey(languageKey)
        }
        this.setState({isEnglish: languageKey !== Constants.LanguageKey.VIETNAMESE});

        if (this.state.shouldHandlePreStaffLogin) {
            const {email, password} = this.props.location.state;
            const value = {
                username: email,
                password,
            };
            authenticate.preStaffLogin(email, password, true)
            .then(() => this.onResponsePreStaffLogin())
            .catch(reason => this.doHandleLoginFail(reason));
        }
    }

    componentDidUpdate() {
        this.props.dispatch(setPageTitle(AgencyService.getDashboardName() + ' - Login'));
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
        i18next.changeLanguage(langKey).then(r => {})
        CredentialUtils.setLangKey(langKey)
    }

    changePhoneCode(phoneCode) {
        this.setState({
            phoneCode: phoneCode
        })
    }

    onFormChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onLogin(event, value) {
        this.setState({
            isLoading: true
        });

        event.preventDefault();

        if (this.state.activeTab === TAB.STAFF) {
            authenticate.preStaffLogin(this.state.username, this.state.password, this.state.rememberMe)
                .then(() => this.onResponsePreStaffLogin())
                .catch(reason => this.doHandleLoginFail(reason));
        }
        else if (ValidateUtils.isPhone(value.username)) {
            this.doHandleLoginResponse(authenticate.loginPhone(this.state.phoneCode, value.username, value.password, this.state.rememberMe));
        }
        else {
            this.doHandleLoginResponse(authenticate.loginEmail(value.username, value.password, this.state.rememberMe));
        }
    }

    openFacebook() {
        this.setState({isFacebookOpen: true});
    }

    onResponseFacebook = (response) => {
        if (response.accessToken) {
            this.doHandleLoginResponse(authenticate.loginFacebook(response.accessToken, this.state.isEnglish ? Constants.LanguageKey.ENGLISH : Constants.LanguageKey.VIETNAMESE));
        } else {
            this.setState({isLoading: false})
            this.setState({isFacebookOpen: false});
        }
    };

    onResponsePreStaffLogin() {
        this.setState({
            preStaffLogin: true
        }, () => {
            storeService.getAllStoreStaffByUser()
                .then(data => {
                    this.onResponsePostStaffLogin(data);
                })
                .catch(reason => {
                    this.onResponsePostStaffLoginFail(reason)
                })
        });
    }

    onResponsePostStaffLoginFail(failReason) {
        console.error("login staff has an error: "+ failReason);
        if(this.refAlert) {
            this.refAlert.openModal({
                type: AlertModalType.ALERT_TYPE_OK,
                modalTitle: i18next.t('common.txt.confirm.modal.title'),
                messages: i18next.t('common.validation.staff.none.role'),
                modalBtn: i18next.t('common.txt.alert.modal.logout'),
                closeCallback: function() {
                    storageService.removeSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT);
                    window.location.href = '/logout';
                }
            });
        }
    }

    onResponsePostStaffLogin(response) {
        if (_.size(response) === 1) {
            this.doHandleLoginResponse(authenticate.switchToStaffOfStore(response[0].id));
        }
        else {
            this.setState({
                storeStaffs: response,
                isLoading: false
            })
        }
    }

    doHandleLoginResponse(loginRequest) {
        loginRequest.then((response) => {
                if (response && response.warnings && response.warnings.length > 0) {
                    if (response.warnings.findIndex(el => el === 'accountVerifyRequired') > -1) {
                        this.setState({modalActivate: true});
                    }
                    else {
                        let requireMoreFields = [];
                        response.email && this.setState({email: response.email}, () => requireMoreFields = [...requireMoreFields, 'contactNumber']);
                        response.phone && this.setState({phone: response.phone}, () => requireMoreFields = [...requireMoreFields, 'email']);
                        this.props.dispatch(setRequireMoreFields(requireMoreFields));
                        if (!response.store) {
                            this.setState({
                                isSuccess: true,
                                from: NAV_PATH.wizard + '/2', warnings: response.warnings
                            });
                        } else {
                            this.setState({
                                isSuccess: true,
                                from: NAV_PATH.wizard + '/2',
                                warnings: response.warnings,
                                storeId: response.store.id
                            });
                        }
                    }
                }
                else {
                    this.setState({isSuccess: true});
                }
                this.setState({
                    isLoading: false,
                    isFacebookOpen: false,
                    shouldHandlePreStaffLogin: false,
                })
            })
            .catch(reason => {
                this.doHandleLoginFail(reason);
            })
    }

    doHandleLoginFail(failReason) {
        console.error('ERROR: ' + failReason);
        let failKey = failReason.response.data &&
        (failReason.response.data.message === 'Only PRODUCT store can login for GoSell, DEAL store does not support' || failReason.response.data.message === 'COMPANY cannot login for GoSell')
            ? 'login.login.notsupport' : 'login.login.fail';
        this.setState({
            isLoginFailed: true,
            isLoading: false,
            isFacebookOpen: false,
            failReason: failKey
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

    userNameValidate(value, ctx, input, cb) {
        ValidateUtils.userNameValidate(i18next, value, ctx, input, cb);
    }

    // modal change
    onModalChange(event) {
        this.setState({
            [event.target.name]: event.target.value.trim()
        });
    }

    // modal submit
    onModalSubmit() {
        this.setState({modalMessage: ''});
        this.setState({isModalLoading: true});
        // this.doHandleLoginResponse(authenticate.verifyAccount(this.state.verifyCode))
        authenticate.verifyAccount(this.state.verifyCode)
            .then(response => {

                // close modal
                this.setState({isModalLoading: false});

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
                    isLoading: false,
                    isFacebookOpen: false
                })

            }).catch(e => {
                if (e.response.status === 404) {
                    // wrong verify code
                    this.setState({modalMessage: <Trans i18nKey={'welcome.wizard.step1.modal.invalidCode'}/>});
                } else if (e.response.status === 410) {
                    // wrong verify code
                    this.setState({modalMessage: <Trans i18nKey={'welcome.wizard.step1.modal.expiredCode'}/>});
                }

                this.setState({isModalLoading: false});
            });
    }

    // resend code on modal
    resendCode(event) {
        event.preventDefault();
        authenticate.resendVerifyCode()
            .then(() => GSToast.success("login.modal.verify.resend.success", true));
    }

    staffChooseStore(storeId) {
        this.setState({isLoading: true}, () => this.doHandleLoginResponse(authenticate.switchToStaffOfStore(storeId)));
    }

    renderVerifyModal() {
        return (
            <div>
                <Modal
                    wrapClassName="login-verify-modal__wrapper--modal"
                    contentClassName=""
                    isOpen={this.state.modalActivate}
                >
                    <ModalHeader>
                        <Trans i18nKey="login.modal.verify.title">
                            Two factor authentication
                        </Trans>
                    </ModalHeader>
                    <ModalBody>
                        <AvForm onSubmit={this.onModalSubmit}>
                            <Loading hidden={!this.state.isModalLoading}
                                     style={LoadingStyle.DUAL_RING_GREY}
                                     className="p-3"
                            />
                            {!this.state.isModalLoading &&
                            <>
                                <div className="suggest-1">
                                    <Trans i18nKey="login.modal.verify.content">
                                        Mã xác thực đã được gửi đến email của bạn
                                    </Trans>
                                </div>
                                {/*<div className="email">*/}
                                {/*    {this.state.email}*/}
                                {/*</div>*/}
                                <div className="otp-input">
                                    <FormGroup className="otp-input__text">
                                        <AvField
                                            name="verifyCode"
                                            placeholder={<Trans i18nKey={'welcome.wizard.step1.modal.input.hint'}/>}
                                            onChange={this.onModalChange}
                                            validate={{
                                                ...FormValidate.maxLength(6)
                                            }}
                                        />
                                    </FormGroup>
                                    {this.state.modalMessage &&
                                    <AlertInline
                                        text={this.state.modalMessage}
                                        type="error"
                                        nonIcon
                                    />
                                    }
                                </div>
                                <div className="otp-button">
                                    <UikButton
                                        type="submit"
                                        className="btn-confirm"
                                        transparent="true"
                                        primary
                                    >
                                        <Trans i18nKey="welcome.wizard.step1.modal.button">
                                            Xác thực và đăng nhập
                                        </Trans>
                                    </UikButton>
                                </div>
                                <div className="resend-otp">
                                    <Trans i18nKey="welcome.wizard.step1.modal.resend">
                                        Tôi không nhận được mã xác thực. <a href="#" onClick={this.resendCode}>Gửi
                                        lại</a>
                                    </Trans>
                                </div>
                            </>}
                        </AvForm>
                    </ModalBody>
                </Modal>
            </div>
        )
    }

    render() {
        if (this.state.isSuccess && Boolean(this.state.shouldHandlePreStaffLogin) === false) {
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
                <div className={this.state.isFacebookOpen ? "login-widget gs-atm--disable" : "login-widget"}>
                    <UikWidget>
                        <UikWidgetHeader className="login-widget__formHeader">
                            <p><Logo height={58}/></p>
                            <p style={{marginBottom: 0}}><Trans i18nKey="login.welcome">
                                Chào mừng trở lại, hãy đăng nhập bên dưới
                            </Trans></p>
                            <p style={{marginBottom: 0, fontSize: 0.9 + 'rem', color: '#9EA0A5'}}><Trans i18nKey="login.beecow">You can
                                use <span style={{color: '#1f1f57'}}>Beecow</span> to login</Trans></p>
                        </UikWidgetHeader>
                        <GSTab items={
                                    [
                                        createItem(<Trans i18nKey={"login.as.admin"}/>, TAB.ADMIN),
                                        createItem(<Trans i18nKey={"login.as.staff"}/>, TAB.STAFF),
                                    ]
                                }
                               defaultActive={TAB.ADMIN}
                               active={this.state.activeTab}
                               itemMaxWidth={true}
                               onChangeTab={(tabValue) => this.setState({activeTab: tabValue})}
                               className={'login-widget__tab'}
                               hidden={this.state.preStaffLogin}
                        />
                        {this.state.activeTab === TAB.ADMIN && !this.state.shouldHandlePreStaffLogin && <UikWidgetContent className="login-widget__formBody">
                            <Loading hidden={!this.state.isLoading} style={LoadingStyle.DUAL_RING_GREY}/>
                            <AvForm method="post" onValidSubmit={this.onLogin} hidden={this.state.isLoading}>

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
                                    <AvField
                                        label={<Trans i18nKey={'login.emailOrPhone'}/>}
                                        name={"username"}
                                        maxLength={150}
                                        validate={{
                                            ...FormValidate.required(),
                                            async: this.userNameValidate
                                        }}
                                    />
                                    <div className="login-widget__inputPasswordWrapper">
                                        <Link to={NAV_PATH.forgot}
                                              className="login-widget__forgotPassword login-widget__linkItem--right">
                                            <Trans i18nKey="welcome.wizard.step1.forgotPassword">
                                                Quên mật khẩu
                                            </Trans>
                                        </Link>

                                        <AvField
                                            label={<Trans i18nKey={'welcome.wizard.step1.password'}/>}
                                            type={this.state.passwordInputType}
                                            name={"password"}
                                            maxLength={50}
                                            validate={{
                                                ...FormValidate.required()
                                            }}
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
                                        text={<Trans i18nKey={this.state.failReason}/>}
                                        hidden={!this.state.isLoginFailed}/>
                                </UikFormInputGroup>
                            </AvForm>
                            <div className="divider-section" hidden={this.state.isLoading}>
                                <UikDivider margin className="divider-left"/>
                                <span className="divider-center">
                                    <Trans i18nKey="login.login.title">
                                        Đăng nhập với tài khoản mạng xã hội
                                    </Trans>
                                </span>
                                <UikDivider margin className="divider-right"/>
                            </div>
                            {!this.state.isLoading &&
                            <GSFacebookLogin
                                className={DefaultFacebookLoginClass}
                                customButton={<DefaultButtonText/>}
                                openFacebook={this.openFacebook}
                                onResponseFacebook={this.onResponseFacebook}
                            />}
                        </UikWidgetContent>}
                        {(this.state.activeTab === TAB.STAFF && !this.state.preStaffLogin) && <UikWidgetContent className="login-widget__formBody">
                            <Loading hidden={!this.state.isLoading} style={LoadingStyle.DUAL_RING_GREY}/>
                            <form method="post" onSubmit={this.onLogin} hidden={this.state.isLoading}>
                                <UikFormInputGroup>
                                    <UikInput
                                        label={<Trans i18nKey={'welcome.wizard.step1.email'}/>}
                                        // placeholder="me@janlosert.com"
                                        type="email"
                                        name="username"
                                        onChange={this.onFormChange}
                                        maxLength={150}
                                    />
                                    <div className="login-widget__inputPasswordWrapper">
                                        <Link to={NavigationPath.staffForgot} className="login-widget__forgotPassword login-widget__linkItem--right">
                                            <Trans i18nKey="welcome.wizard.step1.forgotPassword">
                                                Quên mật khẩu
                                            </Trans>
                                        </Link>
                                        <UikInput
                                            label={<Trans i18nKey={'welcome.wizard.step1.password'}/>}
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
                                        text={<Trans i18nKey={this.state.failReason}/>}
                                        hidden={!this.state.isLoginFailed}/>
                                </UikFormInputGroup>
                            </form>
                        </UikWidgetContent>}
                        {(this.state.preStaffLogin && !this.state.isLoading) && <div className={'container-fluid px-0'}>
                            {!!this.state.storeStaffs && this.state.storeStaffs.map(store => (
                                <a className={'row py-3 border-bottom cursor--pointer'} key={store.id}
                                   onClick={() => this.staffChooseStore(store.id)}>
                                    <div className={'col-5 pr-2 text-center'}>
                                        <span className='d-inline-block vertical-align-middle h-100'></span><img src={ImageUtils.getImageFromImageModel(store.storeImage, 50)}/>
                                    </div>
                                    <div className={'col-7 pl-2 text-left'}>
                                        <div className={'row'}>
                                            <div className={'col-12 font-weight-bold font-size-1_5em'}>{store.name}</div>
                                            <div className={'col-12 font-weight-bold font-size-1em color-gray text-overflow-ellipsis overflow-hidden'} >{store.url}</div>
                                        </div>
                                    </div>
                                    <div className={'clearfix'}/>
                                </a>
                            ))}
                        </div>}
                    </UikWidget>
                    {!this.state.isLoading &&
                    <div className="login-widget__linkWrapper">
                        <div className="login-widget__linkItem login-widget__linkItem--left">
                            <span className="login-widget__txtDontHaveAccount">
                                <Trans i18nKey="login.login.nothaveaccount">
                                    Don't have an account?
                                </Trans>
                            </span>
                            <Link to={NAV_PATH.wizard + '/1'}
                                  className="login-widget__signUp">
                                <Trans i18nKey="welcome.wizard.step1.signUp">
                                    Sign up
                                </Trans>
                            </Link>
                        </div>
                        <div className="login-widget__linkItem login-widget__linkItem--right">
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

                {/* 2FA form */}
                {this.renderVerifyModal()}
                {/* alert model */}
                <AlertModal ref={(el) => {
                    this.refAlert = el
                }}/>
            </div>
        )
    }
}

export default connect()(Login);
