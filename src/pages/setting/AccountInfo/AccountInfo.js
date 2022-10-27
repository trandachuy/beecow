import React, {Component} from 'react';
import i18next from "i18next";
import './AccountInfo.sass'
import {Trans} from "react-i18next";
import {UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {GSLayoutCol6, GSLayoutRow} from "../../../components/layout/GSLayout/GSLayout";
import Label from "reactstrap/es/Label";
import {cancelablePromise} from "../../../utils/promise";
import accountService from "../../../services/AccountService";
import {GSToast} from "../../../utils/gs-toast";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {TokenUtils} from "../../../utils/token";
import {FormValidate} from "../../../config/form-validate";

class AccountInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isFetching: true,
            firstName: "",
            lastName: "",
            phoneNumber: "",
            account: null,
            email: "",
            isSaving: false
        };

        this.handleValidChangeAccount = this.handleValidChangeAccount.bind(this);

    }

    componentDidMount() {
        this.pmGetAccount = cancelablePromise(accountService.getAccount());

        this.pmGetAccount.promise
            .then(result => {
                const accountInfo = result;
                this.setState({
                    isFetching: false,
                    // Account info
                    account: accountInfo,
                    email: accountInfo && accountInfo.email ? accountInfo.email : '',
                    firstName: accountInfo && accountInfo.firstName ? accountInfo.firstName : '',
                    lastName: accountInfo && accountInfo.lastName ? accountInfo.lastName : '',
                    phoneNumber: accountInfo && accountInfo.mobile && accountInfo.mobile.phoneNumber && accountInfo.mobile.phoneNumber ? accountInfo.mobile.phoneNumber : '',
                });
            }).catch(() => {});
    }

    componentWillUnmount() {
        if (this.pmGetAccount) this.pmGetAccount.cancel();
        if (this.pmChangeAccount) this.pmChangeAccount.cancel();
    }

    handleValidChangeAccount(e, v) {
        this.setState({
            isSaving: true
        });

        // console.log(v)

        let account = {
            firstName: v.firstName,
            lastName: v.lastName,
        };

        // update email / phone
        if (TokenUtils.getValue('sub').includes('@')) { // => email
            account.mobile = {
                countryCode: this.state.account.mobile? this.state.account.mobile.countryCode:'+84',
                phoneNumber: v.phoneNumber
            }
        } else {
            account.email = v.email
        }

        this.pmChangeAccount = cancelablePromise(accountService.updateAccount(account));
        this.pmChangeAccount.promise
            .then(result => {
                this.setState({
                    account: result,
                    email: result && result.email ? result.email : '',
                    firstName: result && result.firstName ? result.firstName : '',
                    lastName: result && result.lastName ? result.lastName : '',
                    phoneNumber: result && result.mobile && result.mobile.phoneNumber && result.mobile.phoneNumber ? result.mobile.phoneNumber : ''
                });
                this.setState({
                    isSaving: false
                });
                GSToast.success(i18next.t("page.setting.accountInfo.success"));
            })
            .catch(e => {
                GSToast.commonError();
                this.setState({
                    isSaving: false
                });
            })
    }


    render() {
        return (
            <GSContentContainer className="account__information"
                                isLoading={this.state.isFetching}
                                isSaving={this.state.isSaving}
                                loadingClassName="my-5"
            >
                <UikWidget className="gs-widget">
                    <UikWidgetHeader className="gs-widget__header">
                        <Trans i18nKey="page.setting.accountInfo.title">
                            Account Info
                        </Trans>
                    </UikWidgetHeader>

                    <UikWidgetContent className="gs-widget__content">
                        <AvForm onValidSubmit={this.handleValidChangeAccount}>
                            <button ref={el => this.refSubmitChangeAccount = el} hidden/>
                            <GSLayoutRow>
                                <GSLayoutCol6>
                                    <AvField
                                        name="firstName"
                                        label={i18next.t("page.setting.accountInfo.firstName")}
                                        value={this.state.firstName}
                                        validate={{
                                            pattern: {
                                                value: /^[^0-9!@#$%^&*()<>?:"{}+_/.,';\]\[=\\\-|]*$/,
                                                errorMessage: i18next.t("common.validation.character")
                                            },
                                            minLength: {
                                                value: 3,
                                                errorMessage: i18next.t('common.validation.char.min.length', {x: 1})
                                            },
                                            maxLength: {
                                                value: 60,
                                                errorMessage: i18next.t('common.validation.char.max.length', {x: 60})
                                            }
                                        }}
                                    />
                                </GSLayoutCol6>
                                <GSLayoutCol6>
                                    <AvField
                                        name="lastName"
                                        label={i18next.t("page.setting.accountInfo.lastName")}
                                        value={this.state.lastName}
                                        validate={{
                                            pattern: {
                                                value: /^[^0-9!@#$%^&*()<>?:"{}+_/.,';\]\[=\\\-|]*$/,
                                                errorMessage: i18next.t("common.validation.character")
                                            },
                                            minLength: {
                                                value: 3,
                                                errorMessage: i18next.t('common.validation.char.min.length', {x: 1})
                                            },
                                            maxLength: {
                                                value: 60,
                                                errorMessage: i18next.t('common.validation.char.max.length', {x: 60})
                                            }
                                        }}
                                    />
                                </GSLayoutCol6>
                            </GSLayoutRow>

                            <GSLayoutRow>
                                <GSLayoutCol6>
                                    <AvField
                                        name="email"
                                        value={this.state.email ? this.state.email : ''}
                                        className={TokenUtils.getValue('sub').includes('@')? "gs-atm--disable":''}
                                        label={i18next.t("page.setting.accountInfo.email")}
                                        validate={{
                                            ...FormValidate.email()
                                        }}
                                    />
                                </GSLayoutCol6>

                                <GSLayoutCol6>
                                    <Label for="firstName" className="gs-frm-input__label">
                                        <Trans i18nKey="page.setting.accountInfo.phone"/>
                                    </Label>
                                    <AvField
                                        name="phoneNumber"
                                        value={this.state.phoneNumber}
                                        className={!TokenUtils.getValue('sub').includes('@')? "gs-atm--disable":''}
                                        validate={{
                                            maxLength: {
                                                value: 20,
                                                errorMessage: i18next.t('common.validation.char.max.length', {x: 20})
                                            }
                                        }}
                                    />
                                </GSLayoutCol6>
                            </GSLayoutRow>
                        </AvForm>
                    </UikWidgetContent>
                    <UikWidgetContent className="gs-widget__content">
                        <GSButton primary className="setting_btn_save" onClick={
                            () => this.refSubmitChangeAccount.click()
                        }>
                            <Trans i18nKey="common.btn.save"/>
                        </GSButton>
                    </UikWidgetContent>
                </UikWidget>
            </GSContentContainer>
        )
    }
}

export default AccountInfo;
