import React, {Component} from 'react';
import i18next from "i18next";
import './ResetPasswordSetting.sass'
import {Trans} from "react-i18next";
import {UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import {AvForm} from "availity-reactstrap-validation";
import {GSLayoutCol12, GSLayoutCol6, GSLayoutRow} from "../../../components/layout/GSLayout/GSLayout";
import {cancelablePromise} from "../../../utils/promise";
import accountService from "../../../services/AccountService";
import {GSToast} from "../../../utils/gs-toast";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import AvPassword from "../../../components/shared/form/AvPassword/AvPassword";
import Constants from "../../../config/Constant";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import GSButton from "../../../components/shared/GSButton/GSButton";


class ResetPasswordSetting extends Component {

    constructor(props) {
        super(props);

        this.state = {
            account: null,
            errConfirm: '',
            wrongCurrentPassword: false,
            newPasswordMatchedCurrentPassword: false,
            isPasswordRequired: false,
            isPasswordMatch: true,
        };

        this.handleValidResetPassword = this.handleValidResetPassword.bind(this);
        this.onClickSaveResetPassword = this.onClickSaveResetPassword.bind(this);
        this.renderResetPasswordErrorMessage = this.renderResetPasswordErrorMessage.bind(this);
    }

    componentDidMount() {
        this.pmGetAccount = cancelablePromise(accountService.getAccount());

        this.pmGetAccount.promise
            .then(result => {
                this.setState({
                    // Account info
                    account: result,
                });
            })
            .catch(() => {});
    }

    componentWillUnmount() {
        if (this.pmGetAccount) this.pmGetAccount.cancel();
        if (this.pmChangePassword) this.pmChangePassword.cancel();
    }

    renderResetPasswordErrorMessage() {
        if (!this.state.isPasswordRequired) {
            if (!this.state.isPasswordMatch) {
                return (<AlertInline text={i18next.t("page.setting.resetPassword.passwordNotMatch")}
                                     type={AlertInlineType.ERROR} nonIcon
                />)
            } else if (this.state.wrongCurrentPassword) {
                return (<AlertInline text={i18next.t("page.setting.resetPassword.error.wrongCurrentPassword")}
                                     type={AlertInlineType.ERROR} nonIcon
                />)
            } else if (this.state.newPasswordMatchedCurrentPassword) {
                return (
                    <AlertInline text={i18next.t("page.setting.resetPassword.error.newPasswordMatchedCurrentPassword")}
                                 type={AlertInlineType.ERROR} nonIcon
                    />)
            }
        }

    }

    onClickSaveResetPassword() {
        this.refSubmitResetPassword.click()
    }


    handleValidResetPassword(e, v) {
        // reset error msg
        this.setState({
            isPasswordRequired: false,
        })

        const {currentPassword, confirmPassword, newPassword} = v;
        if (currentPassword !== '' || confirmPassword !== '' || newPassword !== '') { // => save mode
            if (currentPassword === '' || confirmPassword === '' || newPassword === '') {
                // all fields is required
                this.setState({
                    isPasswordRequired: true
                })

            } else {
                // all fields has already filled
                if (newPassword !== confirmPassword) {
                    this.setState({
                        isPasswordMatch: false
                    })
                } else {
                    // everything is ok
                    this.setState({
                        isSaving: true,
                        isPasswordMatch: true
                    })

                    this.pmChangePassword = cancelablePromise(accountService.changePassword({
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    }));
                    this.pmChangePassword.promise
                        .then(result => {
                            this.setState({
                                isSaving: false,
                                wrongCurrentPassword: false,
                                newPasswordMatchedCurrentPassword: false,
                            });
                            if (this.form) {
                                this.form.reset();
                            }
                            GSToast.success(i18next.t("page.setting.resetPassword.passwordChangeSuccessful"));
                        })
                        .catch(e => {
                            this.setState({
                                isSaving: false,
                                wrongCurrentPassword: false,
                                newPasswordMatchedCurrentPassword: false
                            })

                            if (e.response.status === 406) {
                                this.setState({
                                    wrongCurrentPassword: true,
                                    newPasswordMatchedCurrentPassword: false
                                })
                            } else if (e.response.status === 409) {
                                this.setState({
                                    wrongCurrentPassword: false,
                                    newPasswordMatchedCurrentPassword: true
                                })
                            }
                        })
                }
            }
        }
    }

    validate = _.debounce((value, ctx, input, cb) => {

        // cancel pending 'network call'
        clearTimeout(this.timeout);

        // simulate network call
        this.timeout = setTimeout(() => {
            cb(value === 'valid' || value === '');
        }, 500);

    }, 300);

    render() {
        return (
            <GSContentContainer className="reset-password__information">
                <UikWidget
                    className={"gs-widget " + (this.state.account && this.state.account.accountType === Constants.AccountType.FACEBOOK ? "gs-atm--disable" : "")}>
                    <UikWidgetHeader className="gs-widget__header">
                        <Trans i18nKey="page.setting.resetPassword.title">
                            Reset Password
                        </Trans>
                    </UikWidgetHeader>

                    <UikWidgetContent className="gs-widget__content">
                        <AvForm onValidSubmit={this.handleValidResetPassword} ref={el => this.form = el}>
                            <button ref={el => this.refSubmitResetPassword = el} hidden/>
                            <GSLayoutRow>
                                <GSLayoutCol6>
                                    {/*Current Password*/}

                                    <div className="password__input_new_password_container">
                                        <AvPassword
                                            name="currentPassword"
                                            label={i18next.t("page.setting.resetPassword.currentPassword")}
                                            viewable
                                            validate={{
                                                required: {
                                                    value: this.state.isPasswordRequired,
                                                    errorMessage: i18next.t('common.validation.required')
                                                }
                                            }}
                                        />
                                    </div>
                                </GSLayoutCol6>

                                <GSLayoutCol6>
                                    {/*New Password*/}
                                    <AvPassword
                                        name="newPassword"
                                        label={i18next.t("page.setting.resetPassword.newPassword")}
                                        viewable
                                        validate={{
                                            required: {
                                                value: this.state.isPasswordRequired,
                                                errorMessage: i18next.t('common.validation.required')
                                            },
                                            pattern: {
                                                value: Constants.PASSWORD_PATTERN,
                                                errorMessage: i18next.t('common.validation.invalid.password.format')
                                            }
                                        }}
                                    />

                                    {/*Confirm Password*/}
                                    <AvPassword
                                        name="confirmPassword"
                                        label={i18next.t("page.setting.resetPassword.confirmPassword")}
                                        viewable
                                        validate={{
                                            required: {
                                                value: this.state.isPasswordRequired,
                                                errorMessage: i18next.t('common.validation.required')
                                            },
                                            pattern: {
                                                value: Constants.PASSWORD_PATTERN,
                                                errorMessage: i18next.t('common.validation.invalid.password.format')
                                            }
                                        }}
                                    />

                                </GSLayoutCol6>
                                <GSLayoutCol12>
                                    {this.renderResetPasswordErrorMessage()}
                                </GSLayoutCol12>
                            </GSLayoutRow>
                        </AvForm>
                    </UikWidgetContent>
                    <UikWidgetContent className="gs-widget__content">
                        <GSButton primary className=" setting_btn_save"
                                   onClick={this.onClickSaveResetPassword}>
                            <Trans i18nKey="common.btn.save"/>
                        </GSButton>
                    </UikWidgetContent>
                </UikWidget>
            </GSContentContainer>
        )
    }
}

export default ResetPasswordSetting;
