import React, {Component} from 'react';
import i18next from "i18next";
import './BankAccountInformation.sass'
import {Trans} from "react-i18next";
import {UikWidgetHeader} from "../../../@uik";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {AvField, AvForm} from 'availity-reactstrap-validation'
import {GSLayoutCol6, GSLayoutRow} from "../../../components/layout/GSLayout/GSLayout";
//import bankData from '../../../../public/data/bank-data'
import storeService from "../../../services/StoreService";
import {cancelablePromise} from "../../../utils/promise";
import catalogService from "../../../services/CatalogService";
import Constants from "../../../config/Constant";
import {CredentialUtils} from "../../../utils/credential";
import {GSToast} from "../../../utils/gs-toast";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {SettingContext} from "../Setting";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import * as _ from "lodash";
import {BCOrderService} from "../../../services/BCOrderService";
import {FormValidate} from "../../../config/form-validate";

class BankAccountInformation extends Component {
    state = {
        bankList: [],
        cityList: [],
        countryList: [],
        isFetching: true,
        bankInfo: null,
        isSaving: false,
        checkBankTransferMethod: false,
        countryCode: 'VN'
    }

    constructor(props) {
        super(props);

        this.handleValidSave = this.handleValidSave.bind(this);
    }

    componentDidMount() {
        // fetch bank info
        this.pmBankInfo = storeService.getBankInfo()
        this.pmCities = catalogService.getCitesOfCountry(Constants.CountryCode.VIETNAM)
        this.pmBankData = catalogService.getListBankInfo()
        this.pmCountryList = catalogService.getCountries()

            this.pmFetching = cancelablePromise(Promise.all([this.pmBankInfo, this.pmCities, this.pmBankData, this.pmCountryList]))
            this.pmFetching.promise
            .then(result => {
                const bankInfo = result[0]
                const cities = result[1]
                const bankData = result[2]
                const countryList = result[3]

                if (bankInfo.length === 0) { // have no bank info

                }
                this.setState({
                    cityList: cities,
                    bankList: bankData,
                    bankInfo: bankInfo.length === 1 ? bankInfo[0] : null,
                    countryList: countryList,
                    isFetching: false,
                    countryCode: bankInfo.length === 1 ? bankInfo[0].countryCode : 'VN'
                })
            })
            .catch(() => {
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.value.isOpenByBankTransfer !== this.props.value.isOpenByBankTransfer) {
            this.setState({
                checkBankTransferMethod: this.props.value.isOpenByBankTransfer
            })
        }
    }

    componentWillUnmount() {
        if (this.pmFetching) this.pmFetching.cancel()
    }

    renderInsideAddressForm() {
        const bankInfo = this.state.bankInfo;
        return(
            <>
                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            name="nameInside"
                            label={i18next.t("page.setting.bankAccountInfo.fullName")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.minLength(3),
                                ...FormValidate.maxLength(60)
                            }}
                            value={bankInfo ? bankInfo.name : ''}
                        />
                    </GSLayoutCol6>

                    <GSLayoutCol6>
                        <AvField
                            type="number"
                            name="idCard"
                            label={i18next.t("page.setting.bankAccountInfo.taxCode")}
                            validate={{
                                pattern: {
                                    value: /^[0-9]*$/,
                                    errorMessage: i18next.t("common.validation.number.format")
                                },
                                minLength: {
                                    value: 3,
                                    errorMessage: i18next.t('common.validation.char.min.length', {x: 3})
                                },
                                maxLength: {
                                    value: 50,
                                    errorMessage: i18next.t('common.validation.char.max.length', {x: 50})
                                }
                            }}
                            value={bankInfo ? bankInfo.idCard : ''}
                        />
                    </GSLayoutCol6>
                </GSLayoutRow>

                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            name="nameHolderInside"
                            label={i18next.t("page.setting.bankAccountInfo.bankAccount")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.minLength(3),
                                ...FormValidate.maxLength(60)
                            }}
                            value={bankInfo ? bankInfo.nameHolder : ''}
                        />
                    </GSLayoutCol6>

                    <GSLayoutCol6>
                        <AvField
                            type="number"
                            name="accountNumberInside"
                            label={i18next.t("page.setting.bankAccountInfo.bankAccountNumber")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.minLength(3),
                                ...FormValidate.maxLength(20)
                            }}
                            value={bankInfo ? bankInfo.accountNumber : ''}
                        />
                    </GSLayoutCol6>
                </GSLayoutRow>

                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            type="select"
                            name="bankId"
                            label={i18next.t("page.setting.bankAccountInfo.bankName")}
                            value={bankInfo ? bankInfo.bankId : ''}
                            validate={{
                                    ...FormValidate.required()
                            }}>
                            <option value={""}>
                                {i18next.t(
                                    "page.setting.bankAccountInfo.bankName.select"
                                )}
                            </option>
                            {this.state.bankList.map(bank => {
                                return (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.bankName}
                                    </option>
                                )
                            })}
                        </AvField>

                    </GSLayoutCol6>

                    <GSLayoutCol6>
                        <AvField
                            type="select"
                            name="region"
                            label={i18next.t("page.setting.bankAccountInfo.cityProvince")}
                            value={bankInfo ? bankInfo.region : ''}
                            validate={{
                                ...FormValidate.required()
                            }}>
                            <option value={""}>
                                {i18next.t(
                                    "page.setting.bankAccountInfo.cityProvince.select"
                                )}
                            </option>
                            {this.state.cityList.map(city => {
                                return (
                                    <option key={city.code} value={city.code}>
                                        {i18next.language === 'vi' ? city.inCountry : city.outCountry}
                                    </option>
                                )
                            })}
                        </AvField>
                    </GSLayoutCol6>
                </GSLayoutRow>

                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            name="branchName"
                            label={i18next.t("page.setting.bankAccountInfo.branchName")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.minLength(3),
                                ...FormValidate.maxLength(20)
                            }}
                            value={bankInfo ? bankInfo.branchName : ''}
                        />
                    </GSLayoutCol6>
                </GSLayoutRow>
            </>
        )
    }

    renderOutsideAddressForm() {
        const bankInfo = this.state.bankInfo;

        return(
            <>
                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            name="nameOutside"
                            label={i18next.t("page.setting.bankAccountInfo.fullName")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.minLength(3),
                                ...FormValidate.maxLength(60)
                            }}
                            value={bankInfo ? bankInfo.name : ''}
                        />
                    </GSLayoutCol6>
                    <GSLayoutCol6>
                        <AvField
                            name="bankName"
                            label={i18next.t("page.setting.bankAccountInfo.bankName")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(250)
                            }}
                            value={bankInfo ? bankInfo.bankName : ''}
                        />
                    </GSLayoutCol6>
                </GSLayoutRow>
                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            type="number"
                            name="accountNumberOutside"
                            label={i18next.t("page.setting.bankAccountInfo.accountNumber")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(100)
                            }}
                            value={bankInfo ? bankInfo.accountNumber : ''}
                        />
                    </GSLayoutCol6>
                    <GSLayoutCol6>
                        <AvField
                            name="nameHolderOutside"
                            label={i18next.t("page.setting.bankAccountInfo.accountName")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(150)
                            }}
                            value={bankInfo ? bankInfo.nameHolder : ''}
                        />
                    </GSLayoutCol6>
                </GSLayoutRow>
                <GSLayoutRow>
                    <GSLayoutCol6>
                        <AvField
                            name="swiftCode"
                            label={i18next.t("page.setting.bankAccountInfo.swiftCode")}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(65)
                            }}
                            value={bankInfo ? bankInfo.swiftCode : ''}
                        />
                    </GSLayoutCol6>
                    {this.state.countryCode === 'US' &&
                        <GSLayoutCol6>
                            <AvField
                                type="number"
                                name="routingNumber"
                                label={i18next.t("page.setting.bankAccountInfo.routingNumber")}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(100)
                                }}
                                value={bankInfo ? bankInfo.routingNumber : ''}
                            />
                        </GSLayoutCol6>
                    }
                </GSLayoutRow>
            </>
        )
    }

    render() {
        const bankInfo = this.state.bankInfo;
        return (
            <>
            <ConfirmModal ref={(el) => { this.refConfirmModal = el }}/>
            <GSContentContainer className="banking__account_information" isLoading={this.state.isFetching}
                                isSaving={this.state.isSaving}>
                {this.state.bankList.length > 0 && this.state.cityList.length > 0 && this.state.countryList.length > 0 &&
                    <GSWidget>
                        <UikWidgetHeader className="gs-widget__header">
                            <Trans i18nKey="page.setting.bankAccountInfo.title1">
                                Bank Account Information
                            </Trans>
                        </UikWidgetHeader>
                        <GSWidgetContent>
                            <AvForm onValidSubmit={this.handleValidSave}>
                                <button ref={el => this.refSubmit = el} hidden/>
                                <GSLayoutRow>
                                    <GSLayoutCol6>
                                        <AvField
                                            type="select"
                                            name="countryCode"
                                            label={i18next.t("page.setting.bankAccountInfo.country")}
                                            value={this.state.countryCode}
                                            onChange={(e) => {
                                            this.setState({
                                                countryCode: e.target.value
                                                })
                                            }}>
                                            {this.state.countryList.map(country =>
                                                (
                                                    <option key={country.code} value={country.code}>
                                                        {country.outCountry}
                                                    </option>
                                                )
                                            )}
                                        </AvField>
                                    </GSLayoutCol6>
                                </GSLayoutRow>
                                {this.state.countryCode === 'VN' && this.renderInsideAddressForm()}
                                {this.state.countryCode !== 'VN' && this.renderOutsideAddressForm()}
                            </AvForm>
                            <GSLayoutRow>
                                <GSButton primary style={{marginLeft: '15px'}}
                                           onClick={() => this.refSubmit.click()}>
                                    <Trans i18nKey="page.setting.bankAccountInfo.btn.save">
                                        Save
                                    </Trans>
                                </GSButton>
                            </GSLayoutRow>

                        </GSWidgetContent>
                    </GSWidget>}
            </GSContentContainer>
            </>
        )
    }

    handleValidSave(e, v) {
        this.setState({
            isSaving: true
        })

        const requestBody = {
            "countryCode": v.countryCode,
            "accountNumber": this.state.countryCode === 'VN' ? v.accountNumberInside : v.accountNumberOutside,
            "bankId": v.bankId,
            "branchName": v.branchName,
            "idCard": v.idCard,
            "name": this.state.countryCode === 'VN' ? v.nameInside : v.nameOutside,
            "nameHolder": this.state.countryCode === 'VN' ? v.nameHolderInside : v.nameHolderOutside,
            "region": v.region,
            "routingNumber": v.routingNumber || "",
            "swiftCode": v.swiftCode ? v.swiftCode.trim() : "",
            "bankName": v.bankName || "",
            "storeId": CredentialUtils.getStoreId(),
        }

        if (this.state.bankInfo) { // => update
            requestBody.id = this.state.bankInfo.id
            storeService.updateBankInform(requestBody)
                .then(result => {
                    this.setState({
                        bankInfo: result,
                        isSaving: false
                    });
                    GSToast.success(i18next.t("page.setting.bankAccountInfo.success"))
                })
                .catch(e => {
                    GSToast.commonError();
                    this.setState({
                        isSaving: false
                    })
                })
        } else { // create new
            storeService.createBankInform(requestBody)
                .then(result => {
                    this.setState({
                        isSaving: false,
                        bankInfo: result
                    });
                    if (this.state.checkBankTransferMethod) {
                        this.showEnableBankTransfer();
                    } else {
                        GSToast.success(i18next.t("page.setting.bankAccountInfo.success"));
                        this.props.value.setResetPaymentMethods(true);
                    }
                })
                .catch(e => {
                    GSToast.commonError()
                })
        }

    }

    showEnableBankTransfer() {
        this.refConfirmModal.openModal({
            messages: <GSTrans t={'page.setting.shippingAndPayment.bankTransfer.fullCondition'}>
                a<b>a</b>
            </GSTrans>,
            okCallback: () => {
                BCOrderService.getPaymentSetting().then(result => {
                    let paymentMethods = [...Constants.DEFAULT_PAYMENT_METHOD];
                    if (result && !_.isEmpty(result.paymentCode)) {
                        paymentMethods = result.paymentCode.split(",");
                    }
                    paymentMethods.push(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER);
                    BCOrderService.savePaymentSetting({paymentCode: paymentMethods.join(",")})
                        .then(() => {
                            GSToast.success('page.setting.shippingAndPayment.bankTransfer.enabledSuccess', true);
                            this.props.value.setResetPaymentMethods(true);
                        })
                        .catch((e) => {
                            if (e.response.data.message === 'error.accessDenied'){
                                GSToast.error('page.setting.error.youDontPermissionFeature',true)
                                return
                            }
                            GSToast.error('page.setting.shippingAndPayment.bankTransfer.enabledError', true);
                        })
                }).catch(() => {
                });
            },
            cancelCallback: () => {
                this.props.value.setResetPaymentMethods(true);
            }
        });
    }
}

const WithContext = (Component) => {
    return (props) => (
        <SettingContext.Consumer>
            {value =>  <Component {...props} value={value} />}
        </SettingContext.Consumer>
    )
}


export default WithContext(BankAccountInformation);
