import React, {Component} from 'react';
import {setPageTitle, setRegisterInfo, setRequireMoreFields} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import _ from "lodash";
import {Trans} from "react-i18next";
import {FormGroup, Label, Modal, ModalBody, ModalHeader} from 'reactstrap';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18next from "../../../config/i18n";
import {UikButton, UikDivider, UikSelect} from '../../../@uik';

import authenticate from "../../../services/authenticate";
import StepBar from "./StepBar";
import './Step1.sass'
import Constants from "../../../config/Constant";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {Link, Redirect} from "react-router-dom";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import Toast from "../../../components/shared/Toast/Toast";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import storageService from '../../../services/storage';
import {CredentialUtils} from "../../../utils/credential";
import Logo from "../../../components/shared/Logo";
import AvPassword from "../../../components/shared/form/AvPassword/AvPassword";
import * as queryString from "query-string";
import GSFacebookLogin, {
    DefaultButtonText,
    DefaultFacebookLoginClass
} from "../../../components/shared/GSFacebookLogin";
import {FormValidate} from "../../../config/form-validate";
import {AgencyService} from "../../../services/AgencyService";
import phoneCodeModel from "../../../../public/data/phone-code.json";
import {ValidateUtils} from "../../../utils/validate";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";

class Step1 extends Component {

    currentStep = 1;
    validate;
    refCodeParam;

    constructor(props) {
        super(props);

        //get path params
        const {pkgId, expId} = props.match.params
        if (pkgId && expId) {
            this.props.dispatch(setRegisterInfo({
                pkgId: parseInt(pkgId),
                expId: parseInt(expId)
            }))
        }

        // Get refCode query param
        const queryParams = queryString.parse(window.location.search);
        this.refCodeParam = queryParams.ref;

        // Store 'from' param into session storage, and use in last step
        if (queryParams.domain) {
            storageService.setToSessionStorage(Constants.STORAGE_KEY_DOMAIN, queryParams.domain);
        }

        this.onSignup = this.onSignup.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.closeModalActivate = this.closeModalActivate.bind(this);
        this.onModalChange = this.onModalChange.bind(this);
        this.onModalSubmit = this.onModalSubmit.bind(this);
        this.resendCode = this.resendCode.bind(this);
        this.doHandleLoginResponse = this.doHandleLoginResponse.bind(this);
        this.onResponseFacebook = this.onResponseFacebook.bind(this);
        this.openFacebook = this.openFacebook.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this)

        this.state = {
            email: '',
            password: '',
            phone: '',
            username: '',
            nextStep: this.currentStep,
            modalActivate: false,
            verifyCode: '',
            message: '',
            isValidEmail: true,
            isValidUsername: true,
            fromBeecow: false,

            isLoading: false,
            isModalLoading: false,
            isFacebookOpen: false,

            storeId: '',
            warning: '',

            isTheFirstLoad: true,

            isEnglish: false,
            refCode: this.refCodeParam,

            phoneCode: '+84',
            countryCode: 'VN'
        };
        // this.validateEmailExist = this.validateEmailExist.bind(this);
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

        this.setState({isTheFirstLoad: false});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.dispatch(setPageTitle(AgencyService.getDashboardName() + ' - Register'));
    }

    componentWillUnmount() {
        if (this.state.refCode) {
            storageService.setToSessionStorage(Constants.STORAGE_KEY_REF_CODE, this.state.refCode);
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

    userNameValidate(value, ctx, input, cb) {
        ValidateUtils.userNameValidate(i18next, value, ctx, input, cb);
    }

    // validateEmailExist(value, ctx, input, cb) {
    //     cb(this.state.isValidEmail ? true :
    //         this.state.fromBeecow ?
    //             i18next.t('welcome.wizard.step1.error.account.exist.beecow')
    //             :
    //             i18next.t('welcome.wizard.step1.error.account.exist'))
    // }

    // main form change
    changePhoneCode(phoneCode,countryCode) {
        this.setState({
            phoneCode: phoneCode,
            countryCode
        })
    }

    onFormChange(event) {
        event.target.name === 'email' && this.setState({
            isValidEmail: true
        });
        event.target.name === 'username' && this.setState({
            isValidUsername: true
        })
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    // main form submit
    onSignup(event) {
        event.preventDefault();

        // if have 1 empty
        // if (_.isEmpty(this.state.email)
        //     || _.isEmpty(this.state.password)
        //     || _.isEmpty(this.state.phone)) {
        //     return;
        // }
        if (_.isEmpty(this.state.username) || _.isEmpty(this.state.password)) {
            return;
        }

        // loading
        this.setState({isLoading: true});

        // clear errors
        // this.setState({isValidEmail: true});
        this.setState({isValidUsername: true});
        this.setState({message: ''});

        let request;
        if (ValidateUtils.isPhone(this.state.username)) {
            this.setState({phone: this.state.username});
            request = authenticate.signUpPhone(this.state.phoneCode, this.state.username, this.state.password, "", this.state.isEnglish ? Constants.LanguageKey.ENGLISH : Constants.LanguageKey.VIETNAMESE)
            this.props.dispatch(setRequireMoreFields(['email']));
        } else {
            this.setState({email: this.state.username});
            request = authenticate.signUpEmail(this.state.username, this.state.password, "", this.state.isEnglish ? Constants.LanguageKey.ENGLISH : Constants.LanguageKey.VIETNAMESE)
            this.props.dispatch(setRequireMoreFields(['contactNumber']));
        }

        // handle register
        request.then((result) => {

                // open the modal con confirm code
                this.setState({modalActivate: true});

                // loading
                this.setState({isLoading: false});

            }).catch(e => {
                if (e.response.data.message === 'warn.user.loginExists.notBeehive') {
                    //alert("Account just exist on Beecow");
                    this.setState({
                        isValidEmail: false,
                        fromBeecow: true
                    });
                } else if (e.response.data.message === 'error.user.loginExists' || e.response.data.message === 'error.user.mobileExists' || e.response.data.message === 'error.user.emailExists') {
                    //alert("Account just exist on Beecow");
                    this.setState({
                        isValidEmail: false,
                        fromBeecow: false
                    });
                }

                // loading
                this.setState({isLoading: false});
            });
    }

    closeModalActivate() {
        this.setState({
                modalActivate: false
            },
            () => {
                storageService.removeLocalStorage(Constants.STORAGE_KEY_REFRESH_TOKEN);
                storageService.removeLocalStorage(Constants.STORAGE_KEY_ACCESS_TOKEN);
                storageService.removeLocalStorage(Constants.STORAGE_KEY_USER_ID);
                if (this.state.closeCallback) {
                    this.state.closeCallback()
                }
            });
    }

    // modal change
    onModalChange(event) {
        this.setState({
            [event.target.name]: event.target.value.trim()
        });
    }

    // modal submit
    onModalSubmit(event) {
        this.setState({message: ''});
        this.setState({isModalLoading: true});

        authenticate.activate(storageService.get(Constants.STORAGE_KEY_USER_ID), this.state.verifyCode)
            .then(response => {

                // users don't have store
                this.setState({
                    warnings: response.warnings
                });

                // close modal
                this.setState({isModalLoading: false});

                // move to next step
                this.setState({nextStep: NAV_PATH.wizard + '/2'});

            })
            .catch(e => {
                if (e.response.status === 404) {
                    // wrong verify code
                    this.setState({message: i18next.t('welcome.wizard.step1.modal.invalidCode')});
                } else if (e.response.status === 410) {
                    // wrong verify code
                    this.setState({message: i18next.t('welcome.wizard.step1.modal.expiredCode')});
                }

                this.setState({isModalLoading: false});
            });
    }

    // resend code on modal
    resendCode(event) {
        event.preventDefault();
        authenticate.resendActivationCode(storageService.get(Constants.STORAGE_KEY_USER_ID))
            .then(response => {
                this.callToast.playToast();
            });
    }

    openFacebook() {
        this.setState({isFacebookOpen: true});
    }

    // Receive response from facebook
    onResponseFacebook(response) {
        this.setState({isLoading: true});
        if (response.accessToken) {
            this.doHandleLoginResponse(authenticate.loginFacebook(response.accessToken, this.state.isEnglish ? Constants.LanguageKey.ENGLISH : Constants.LanguageKey.VIETNAMESE));
        } else {
            this.setState({isLoading: false});
            this.setState({isFacebookOpen: false});
        }
    }

    // handle response of Facebook
    doHandleLoginResponse(loginRequest) {
        loginRequest
            .then((response) => {
                if (response && response.warnings && response.warnings.length > 0) {
                    response.email && this.setState({email: response.email});
                    response.phone && this.setState({phone: response.phone});
                    if (!response.store) {
                        this.setState({warnings: response.warnings});
                    } else {
                        this.setState({
                            warnings: response.warnings,
                            storeId: response.store.id
                        });
                    }

                    // move to next step
                    this.setState({nextStep: NAV_PATH.wizard + '/2'});
                }
                else {
                    // Navigate to Home
                    this.setState({nextStep: NAV_PATH.home});
                }

                this.setState({isLoading: false});
                this.setState({isFacebookOpen: false});
            })
            .catch(reason => {
                console.error('ERROR: ' + reason);
                this.setState({isLoading: false});
                this.setState({isFacebookOpen: false});
            })
    }

    render() {
        if (this.state.nextStep !== this.currentStep) {
            let path = this.state.nextStep;
            return <Redirect to={{
                pathname: path,
                state: {
                    storeId: this.state.storeId,
                    warnings: this.state.warnings,
                    email: this.state.email,
                    phone: this.state.phone,
                    phoneCode:this.state.phoneCode,
                    countryCode:this.state.countryCode
                }
            }}/>
        }

        if (storageService.get(Constants.STORAGE_KEY_ACCESS_TOKEN) && this.state.isTheFirstLoad) {
            // For reload page
            let path = NAV_PATH.home;
            return <Redirect to={{
                pathname: path
            }}/>
        }

        return (
            <div>
                {/*Signup form*/}
                <div className="step1-page__wrapper">
                    <div className="step-page__container">
                        <div className="beehive-logo">
                            <Logo height={58}/>
                        </div>
                        <StepBar
                            step="1"
                            title={i18next.t('welcome.wizard.step1.title')}
                        />
                        <div className="step-page__content">
                            <Loading hidden={!this.state.isLoading} style={LoadingStyle.DUAL_RING_GREY}/>
                            {!this.state.isLoading &&
                            <>
                            <AvForm onValidSubmit={this.onSignup}
                                    className={this.state.isFacebookOpen ? "gs-atm--disable" : ""}
                                    autoComplete="off"
                            >
                                <FormGroup className={"input-field phone-code"}>
                                    <label>
                                        <Trans i18nKey="login.countryCode">Country Code</Trans>
                                    </label>
                                    <UikSelect
                                        defaultValue={this.state.phoneCode}
                                        options={phoneCodeModel.map((dataRow) => {
                                            return (
                                                {
                                                    countryCode: dataRow.countryCode,
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
                                        onChange={(item) => this.changePhoneCode(item.value,item.countryCode)}
                                    />
                                </FormGroup>
                                <AvField
                                    className={'input-field'}
                                    label={i18next.t('login.emailOrPhone')}
                                    name={"username"}
                                    maxLength={150}
                                    value={this.state.email}
                                    validate={{
                                        ...FormValidate.required(),
                                        async: this.userNameValidate
                                    }}
                                    onChange={this.onFormChange}
                                />
                                {/*<FormGroup className="input-field">*/}
                                {/*    <Label className={"gs-frm-control__title"}>*/}
                                {/*        <Trans i18nKey="welcome.wizard.step1.email">*/}
                                {/*            EMAIL*/}
                                {/*        </Trans>*/}
                                {/*    </Label>*/}
                                {/*    <AvField*/}
                                {/*        type="email"*/}
                                {/*        className={"input-field__hint"}*/}
                                {/*        name="email"*/}
                                {/*        value={this.state.email}*/}
                                {/*        validate={{*/}
                                {/*            required: {*/}
                                {/*                value: true,*/}
                                {/*                errorMessage: i18next.t('common.validation.required')*/}
                                {/*            },*/}
                                {/*            email: {*/}
                                {/*                value: true,*/}
                                {/*                errorMessage: i18next.t('common.validation.invalid.email')*/}
                                {/*            },*/}
                                {/*            maxLength: {*/}
                                {/*                value: 150,*/}
                                {/*                errorMessage: i18next.t("common.validation.char.max.length", {x: 150})*/}
                                {/*            }*/}
                                {/*        }}*/}
                                {/*        onChange={this.onFormChange}*/}
                                {/*    />*/}
                                {/*</FormGroup>*/}
                                <FormGroup className="input-field">
                                    <AvPassword
                                        viewable
                                        className="input-field__hint"
                                        name="password"
                                        label={i18next.t("welcome.wizard.step1.password")}
                                        value={this.state.password}
                                        validate={{
                                            pattern: {
                                                value: Constants.PASSWORD_PATTERN,
                                                errorMessage: i18next.t('common.validation.invalid.password.format')
                                            },
                                            ...FormValidate.required()
                                        }}
                                        onChange={this.onFormChange}
                                    />
                                </FormGroup>
                                {/*<FormGroup className="input-field">*/}
                                {/*    <Label className={"gs-frm-control__title"}>*/}
                                {/*        <Trans i18nKey="welcome.wizard.step1.phone">*/}
                                {/*            PHONE*/}
                                {/*        </Trans>*/}
                                {/*    </Label>*/}
                                {/*    <AvField*/}
                                {/*        className="input-field__hint"*/}
                                {/*        name="phone"*/}
                                {/*        value={this.state.phone}*/}
                                {/*        validate={{*/}
                                {/*            required: {*/}
                                {/*                value: true,*/}
                                {/*                errorMessage: i18next.t('common.validation.required')*/}
                                {/*            },*/}
                                {/*            pattern: {*/}
                                {/*                value: /^[0-9]*$/,*/}
                                {/*                errorMessage: i18next.t('common.validation.number.format')*/}
                                {/*            },*/}
                                {/*            maxLength: {*/}
                                {/*                value: 15,*/}
                                {/*                errorMessage: i18next.t("common.validation.char.max.length", {x: 15})*/}
                                {/*            },*/}
                                {/*            minLength: {*/}
                                {/*                value: 8,*/}
                                {/*                errorMessage: i18next.t("common.validation.char.min.length", {x: 8})*/}
                                {/*            }*/}
                                {/*        }}*/}
                                {/*        onChange={this.onFormChange}*/}
                                {/*    />*/}
                                {/*</FormGroup>*/}
                                {!this.refCodeParam && <FormGroup className="input-field">
                                    <Label className={"gs-frm-control__title"}>
                                        <Trans i18nKey="welcome.wizard.step1.refCode">
                                            PHONE<span style={{'textTransform': 'none', 'fontWeight': 'normal'}}>option</span>
                                        </Trans>
                                    </Label>
                                    <AvField
                                        className="input-field__hint"
                                        name="refCode"
                                        value={this.state.refCode}
                                        validate={{
                                            maxLength: {
                                                value: 50,
                                                errorMessage: i18next.t("common.validation.char.max.length", {x: 50})
                                            }
                                        }}
                                        onChange={this.onFormChange}
                                    />
                                </FormGroup>}

                                <div className="policy-in">
                                    <GSTrans i18nKey="welcome.wizard.step1.policyIn" values={{provider: AgencyService.getDashboardName()}}>
                                        By continue , you agree to BEEHIVE's <a className="policy-in__href"
                                                                                href="https://www.gosell.vn/dieu-khoan-chung-va-chinh-sach-bao-mat.html"
                                                                                target="_blank">Privacy Policy and terms of Service</a>
                                    </GSTrans>
                                </div>

                                <UikButton
                                    type="submit"
                                    className="btn-create"
                                    iconRight
                                    transparent="true"
                                    primary
                                    onClick={this.handleModal}
                                >
                                    <Trans i18nKey="welcome.wizard.step1.signUp">
                                        Sign Up
                                    </Trans>
                                </UikButton>
                                {this.state.isValidEmail ? true :
                                    this.state.fromBeecow ?
                                        <AlertInline type={AlertInlineType.ERROR} text={i18next.t('welcome.wizard.step1.error.account.exist.beecow')}/>
                                        :
                                        <AlertInline type={AlertInlineType.ERROR}  text={i18next.t('welcome.wizard.step1.error.account.exist')}/>}
                                <div className="divider-section" hidden={this.state.isLoading}>
                                    <UikDivider margin className="divider-left"/>
                                    <span className="divider-center">
                                        <Trans i18nKey="welcome.wizard.step1.signUpWithSocialNetworks">
                                            Sign up with social networks
                                        </Trans>
                                    </span>
                                    <UikDivider margin className="divider-right"/>
                                </div>
                                <div className="btn-facebook">
                                    <GSFacebookLogin
                                        className={DefaultFacebookLoginClass}
                                        customButton={<DefaultButtonText/>}
                                        openFacebook={this.openFacebook}
                                        onResponseFacebook={this.onResponseFacebook}
                                    />
                                </div>
                            </AvForm>
                            </>}
                        </div>
                    </div>
                    {!this.state.isLoading &&
                    <div className="sign-up-widget__linkWrapper">
                        <div className="sign-up-widget__linkItem sign-up-widget__linkItem--left">
                            <span className="sign-up-widget__txtAlreadyAccount">
                                <Trans i18nKey="login.login.alreadyHaveAnAccount">
                                    Already have an account?
                                </Trans>
                            </span>
                            <Link to={NAV_PATH.login}
                                  className="sign-up--widget__signIn">
                                <Trans i18nKey="welcome.wizard.step1.signIn">
                                    Sign In
                                </Trans>
                            </Link>
                        </div>
                        <div className="sign-up-widget__linkItem sign-up-widget__linkItem--right">
                            <span
                                onClick={() => this.changeLanguage(Constants.LanguageKey.ENGLISH)}
                                className={"cursor--pointer sign-up-widget__changeLanguage-english sign-up-widget__changeLanguage " + (this.state.isEnglish ? "sign-up-widget__changeLanguage-selected" : "sign-up-widget__changeLanguage-unselected")}>
                                <Trans i18nKey="common.txt.english">
                                    English
                                </Trans>
                            </span>

                            <span
                                onClick={() => this.changeLanguage(Constants.LanguageKey.VIETNAMESE)}
                                className={'cursor--pointer sign-up-widget__changeLanguage ' +
                                (this.state.isEnglish ? 'sign-up-widget__changeLanguage-unseAvFieldlected' : 'sign-up-widget__changeLanguage-selected')}>
                                <Trans i18nKey="common.txt.vietnamese">
                                    Vietnamese
                                </Trans>
                            </span>
                        </div>
                    </div>}
                </div>

                {/*Activate form*/}

                <div>

                    <Modal
                        wrapClassName="step1-modal__wrapper--modal"
                        contentClassName=""
                        isOpen={this.state.modalActivate}
                    >
                        <ModalHeader toggle={this.closeModalActivate}>
                            <Trans i18nKey="welcome.wizard.step1.modal.title">
                                Xác thực tài khoản
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
                                        <Trans i18nKey="welcome.wizard.step1.modal.suggest1">
                                            Mã xác thực đã được gửi đến email của bạn
                                        </Trans>
                                    </div>
                                    <div className="email">
                                        {this.state.email}
                                    </div>
                                    <div className="otp-input">
                                        <FormGroup className="otp-input__text">
                                            <AvField
                                                name="verifyCode"
                                                placeholder={i18next.t('welcome.wizard.step1.modal.input.hint')}
                                                onChange={this.onModalChange}
                                                validate={{
                                                    maxLength: {
                                                        value: 6,
                                                        errorMessage: i18next.t("common.validation.char.max.length", {x: 6})
                                                    }
                                                }}
                                            />
                                        </FormGroup>
                                        {this.state.message &&
                                        <AlertInline
                                            text={this.state.message}
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
                    <Toast endTime="4000" content={i18next.t('welcome.wizard.step1.modal.resend.success')}
                           ref={(el) => {
                               this.callToast = el
                           }}/>
                </div>
            </div>
        );
    }
}

export default connect()(Step1);

