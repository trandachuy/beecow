/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import './SettingPlansStep3.sass';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";
import {CurrencyUtils} from "../../../../utils/number-format";
import {Link, withRouter} from "react-router-dom";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import i18next from 'i18next';
import Constants from "../../../../config/Constant";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {AgencyService} from "../../../../services/AgencyService";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import storageService from "../../../../services/storage";
import authenticate from "../../../../services/authenticate";

class SettingPlansStep3 extends Component {


    /*
    selectedPricingPlan:
        1. 24 months
        2. 12 months
        3. 1 month
    */

    PLAN_24M = 1
    PLAN_12M = 2
    PLAN_1M = 3

    constructor(props) {
        super(props);

        this.renderPlanImage = this.renderPlanImage.bind(this);
        this.showAlertModal = this.showAlertModal.bind(this);
    }


    renderPlanImage() {
        return null
        // if (this.props.selectedPlan.image) {
        //     return (
        //         <img className="plan-card__image" src={ImageUtils.getImageFromImageModel(this.props.cardInfo.image)} />
        //     )
        // } else {
        //     return <img className="plan-card__image" src={`/assets/images/setting_plans/pkg_${this.props.selectedPlan.id}_icon.svg`}/>
        //
        //     // switch (this.props.selectedPlan.level) {
        //     //     case 1:
        //     //         return <img className="plan-card__image" src="/assets/images/setting_plans/basic_icon.svg" />
        //     //     case 2:
        //     //         return <img className="plan-card__image" src="/assets/images/setting_plans/advance_icon.svg" />
        //     // }
        // }
    }

    showAlertModal() {
        this.refAlertModal.openModal({
            type: AlertModalType.ALERT_TYPE_SUCCESS,
            messages: <GSTrans t={'page.setting.plans.step3.logoutWarning'}>Please Log out from your account in order to
                let the system activate new features.<br/>Features will be enabled when logged back in.</GSTrans>,
            closeCallback: () => RouteUtils.redirectWithoutReload(this.props, NAV_PATH.logout),
        })
    }

    handleCheckRefreshToken(e) {
        e.preventDefault()
        const refreshToken = storageService.get(Constants.STORAGE_KEY_REFRESH_TOKEN);
        authenticate.refreshJwt(refreshToken).then(() => {
            RouteUtils.redirectTo(NAV_PATH.home)
        }).catch(() => {
            RouteUtils.redirectTo(NAV_PATH.login)
        });
    }

    render() {
        return (
            <>
                <AlertModal ref={el => this.refAlertModal = el}
                            zIndex={1001}
                            btnText={i18next.t("component.logout.label.logout")}
                />
                {this.props.billObj.paymentMethod !== Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                <div className="setting-plans-step3 setting-plans-step3__overlay" onClick={this.showAlertModal}>

                </div>
                }
                <div className="setting-plans-step3">
                    <div className="mobile-plan-info__plan-image gs-atm__border--radius d-mobile-block d-desktop-none">
                        <div className="mobile-plan-card__title-block">
                            {this.renderPlanImage()}
                            <h6 className="mobile-plan-card__title">{this.props.selectedPlan.name}</h6>
                        </div>
                    </div>
                    {/*DESKTOP*/}
                    <div className="plan-info d-mobile-none d-desktop-flex">
                        <div className="contact-info gs-atm__border--radius">
                            {/*SUCCESSFUL CASE*/}
                            {this.props.billObj.success && true &&
                            <div className="contact-info__description">
                                {this.props.billObj.paymentMethod !== Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                                <h3>
                                    <GSTrans i18nKey="page.setting.plans.step3.thanksForUsing" values={
                                        {
                                            provider: AgencyService.getDashboardName()
                                        }
                                    }/>
                                    <br/>
                                    <GSTrans i18nKey="page.setting.plans.step3.paymentSuccessful"/>
                                </h3>}

                                {this.props.billObj.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                                <h3>
                                    <GSTrans t="page.setting.plans.step3.bankTransfer" values={
                                        {
                                            planName: this.props.selectedPlan.name,
                                            provider: AgencyService.getDashboardName()
                                        }
                                    }/>
                                </h3>}
                                {/*/ DETAILS*/}
                                <div className="details-container">
                                    {/*DESKTOP*/}
                                    <table className="d-tablet-none d-desktop-exclude-tablet-block">

                                        <tbody>
                                        <tr>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.orderId"/>
                                            </td>
                                            <td className="value">
                                                {this.props.billObj.orderId}
                                            </td>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.duration"/>
                                            </td>
                                            <td className="gsa-width-100 value">
                                                <GSTrans t="page.setting.plans.step1.planDetail.monthsWValue" values={{
                                                    month: this.props.billObj.plan
                                                }}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.serviceName"/>
                                            </td>
                                            <td className="value">
                                                {this.props.selectedPlan.name}
                                            </td>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.paymentMethod"/>
                                            </td>
                                            <td className="gsa-width-100 value">
                                                {i18next.t("page.order.detail.information.paymentMethod." + this.props.billObj.paymentMethod)}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    {/*TABLET*/}
                                    <table className="d-tablet-block d-desktop-exclude-tablet-none">

                                        <tbody>
                                        <tr>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.orderId"/>
                                            </td>
                                            <td className="value">
                                                {this.props.billObj.orderId}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.duration"/>
                                            </td>
                                            <td className="gsa-width-100 value">
                                                <GSTrans t="page.setting.plans.step1.planDetail.monthsWValue" values={{
                                                    month: this.props.billObj.plan
                                                }}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.serviceName"/>
                                            </td>
                                            <td className="value">
                                                {this.props.selectedPlan.name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="title">
                                                <GSTrans t="page.setting.plans.step3.paymentMethod"/>
                                            </td>
                                            <td className="gsa-width-100 value">
                                                {i18next.t("page.order.detail.information.paymentMethod." + this.props.billObj.paymentMethod)}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p>
                                    {(this.props.billObj.paymentMethod === 'ATM' || this.props.billObj.paymentMethod === 'VISA' || this.props.billObj.paymentMethod === 'ZALO' || this.props.billObj.paymentMethod === 'MOMO')
                                    && (this.props.contactObj.descriptions ? this.props.contactObj.descriptions : (
                                        <Trans i18nKey="page.setting.plans.step3.descriptions"/>
                                    ))}

                                    {(this.props.billObj.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER) &&
                                    <>
                                        <GSTrans t="page.setting.plans.step3.bankTransferHint"/>
                                        {CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM &&
                                        <div className="bank-transfer__info">
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                                {this.props.paymentObj.bankTransfer.accountOwner}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                                {this.props.paymentObj.bankTransfer.accountNumber}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                                {this.props.paymentObj.bankTransfer.bank}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                                {this.props.paymentObj.bankTransfer.branch}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                                {this.props.paymentObj.bankTransfer.content}
                                            </p>
                                        </div>
                                        }
                                        {CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM &&
                                        <div className="bank-transfer__info">
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.bankName"/>
                                                {this.props.paymentObj.bankTransferNonVn.bankName}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.swiftCode"/>
                                                {this.props.paymentObj.bankTransferNonVn.swiftCode}
                                            </p>
                                            <p>{'• '}
                                                <Trans
                                                    i18nKey="page.setting.plans.step2.bankTransfer.accountHolderName"/>
                                                {this.props.paymentObj.bankTransferNonVn.accountHolderName}
                                            </p>
                                            <p>{'• '}
                                                <Trans
                                                    i18nKey="page.setting.plans.step2.bankTransfer.accountNumberNonVn"/>
                                                {this.props.paymentObj.bankTransferNonVn.accountNumber}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                                {this.props.paymentObj.bankTransfer.content}
                                            </p>
                                        </div>
                                        }
                                    </>
                                    }

                                    <Trans i18nKey="page.setting.plans.step3.bankTransferFooter"
                                           values={{
                                               email: this.props.contactObj.email,
                                               hotLine: this.props.contactObj.hotLine
                                           }}>
                                        Email: <a href={`mailto:${this.props.contactObj.email}`}>email</a> - Hotline: <a
                                        href={`tel:${this.props.contactObj.hotLine}`}>hotLine</a>
                                    </Trans>
                                </p>
                            </div>}
                            {/*FAILED CASE*/}
                            {!this.props.billObj.success &&
                            <div className="contact-info__description">
                                <h3>
                                    <Trans i18nKey="page.setting.plans.step3.paymentFailure"/>
                                </h3>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step3.failedDescriptions"/>
                                    <br/>
                                    <Trans i18nKey="page.setting.plans.step3.contact"
                                           values={{
                                               email: this.props.contactObj.email,
                                               hotLine: this.props.contactObj.hotLine
                                           }}>
                                        Email: <a href={`mailto:${this.props.contactObj.email}`}>email</a> - Hotline: <a
                                        href={`tel:${this.props.contactObj.hotLine}`}>hotLine</a>
                                    </Trans>
                                    <br/>
                                    <GSButton className="btn-pay-again" success marginTop
                                              onClick={() => this.props.onPayAgain(this.props.billObj.plan)}>
                                        <Trans i18nKey="page.setting.plans.step3.btn.repay"/>
                                    </GSButton>
                                </p>
                            </div>}

                            {this.props.billObj.success &&
                            <div className="payment-info">
                                <div
                                    className="payment-info__total-price gs-atm__flex-row--flex-start gs-atm__flex-align-items--center">
                                <span className="payment-info__total gs-frm-input__label">
                                <Trans i18nKey="page.setting.plans.step3.total"/>
                                </span>
                                    <span className="payment-info__price">
                                {CurrencyUtils.formatMoneyByCurrency(this.props.billObj.total, this.props.billObj.currency)}
                                </span>
                                </div>

                                <div className="gsa-text--non-underline">
                                    <GSButton onClick={e => this.handleCheckRefreshToken(e)} marginRight
                                              className="btn-back-home" success>
                                        <Trans i18nKey="page.setting.plans.step3.btn.backHome"/>
                                    </GSButton>
                                </div>
                            </div>}
                        </div>
                        <div className="plan-info__plan-image gs-atm__border--radius d-mobile-none d-desktop-block">
                            <div className="plan-card__title-block">
                                {this.renderPlanImage()}
                                <h6 className="plan-card__title">{this.props.selectedPlan.name}</h6>
                            </div>
                        </div>
                    </div>
                    {/*MOBILE*/}
                    <div className="mobile-plan-info d-mobile-flex d-desktop-none">
                        <div className="contact-info gs-atm__border--radius">
                            {/*SUCCESSFUL CASE*/}
                            {this.props.billObj.success &&
                            <div className="contact-info__description">
                                {this.props.billObj.paymentMethod !== Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                                <h3>
                                    <GSTrans i18nKey="page.setting.plans.step3.thanksForUsing" values={
                                        {
                                            provider: AgencyService.getDashboardName()
                                        }
                                    }/>
                                    <br/>
                                    <Trans i18nKey="page.setting.plans.step3.paymentSuccessful"/>
                                </h3>}

                                {this.props.billObj.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                                <h3>
                                    <GSTrans t="page.setting.plans.step3.bankTransfer" values={
                                        {
                                            planName: this.props.selectedPlan.name,
                                            provider: AgencyService.getDashboardName()
                                        }
                                    }/>
                                </h3>}
                                {/*/ DETAILS*/}
                                <div className="details-container">
                                    {/*ORDERID*/}
                                    <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.orderId"/>
                                        </span>
                                        <span className="value">
                                            {this.props.billObj.orderId}
                                        </span>
                                    </div>
                                    {/*SERVICE NAME*/}
                                    <div className="details-short-row">
                                        <span className="title">
                                             <GSTrans t="page.setting.plans.step3.serviceName"/>
                                        </span>
                                        <span className="value">
                                            {this.props.selectedPlan.name}
                                        </span>
                                    </div>
                                    {/*DURATION*/}
                                    <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.duration"/>
                                        </span>
                                        <span className="value">
                                            <GSTrans t="page.setting.plans.step1.planDetail.monthsWValue" values={{
                                                month: this.props.billObj.plan
                                            }}/>
                                        </span>
                                    </div>
                                    {/*PAYMENT METHOD*/}
                                    <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.paymentMethod"/>
                                        </span>
                                        <span className="value">
                                             {i18next.t("page.order.detail.information.paymentMethod." + this.props.billObj.paymentMethod)}
                                        </span>
                                    </div>


                                </div>
                                <p>
                                    {(this.props.billObj.paymentMethod === 'ATM' || this.props.billObj.paymentMethod === 'VISA' || this.props.billObj.paymentMethod === 'ZALO' || this.props.billObj.paymentMethod === 'MOMO')
                                    && (this.props.contactObj.descriptions ? this.props.contactObj.descriptions : (
                                        <Trans i18nKey="page.setting.plans.step3.descriptions"/>
                                    ))}

                                    {(this.props.billObj.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER) &&
                                    <>
                                        <GSTrans t="page.setting.plans.step3.bankTransferHint"/>
                                        {CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM &&
                                        <div className="bank-transfer__info">
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                                {this.props.paymentObj.bankTransfer.accountOwner}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                                {this.props.paymentObj.bankTransfer.accountNumber}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                                {this.props.paymentObj.bankTransfer.bank}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                                {this.props.paymentObj.bankTransfer.branch}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                                {this.props.paymentObj.bankTransfer.content}
                                            </p>
                                        </div>
                                        }

                                        {CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM &&
                                        <div className="bank-transfer__info">
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.bankName"/>
                                                {this.props.paymentObj.bankTransferNonVn.bankName}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.swiftCode"/>
                                                {this.props.paymentObj.bankTransferNonVn.swiftCode}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountHolderName"/>
                                                {this.props.paymentObj.bankTransferNonVn.accountHolderName}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumberNonVn"/>
                                                {this.props.paymentObj.bankTransferNonVn.accountNumber}
                                            </p>
                                            <p>{'• '}
                                                <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                                {this.props.paymentObj.bankTransfer.content}
                                            </p>
                                        </div>
                                        }
                                    </>
                                    }

                                    <Trans i18nKey="page.setting.plans.step3.bankTransferFooter"
                                           values={{
                                               email: this.props.contactObj.email,
                                               hotLine: this.props.contactObj.hotLine
                                           }}>
                                        Email: <a href={`mailto:${this.props.contactObj.email}`}>email</a> - Hotline: <a
                                        href={`tel:${this.props.contactObj.hotLine}`}>hotLine</a>
                                    </Trans>
                                </p>
                            </div>}
                            {/*FAILED CASE*/}
                            {!this.props.billObj.success &&
                            <div className="contact-info__description">
                                <h3>
                                    <Trans i18nKey="page.setting.plans.step3.paymentFailure"/>
                                </h3>
                                <p>
                                    <Trans i18nKey="page.setting.plans.step3.failedDescriptions"/>
                                    <br/>
                                    <Trans i18nKey="page.setting.plans.step3.contact"
                                           values={{
                                               email: this.props.contactObj.email,
                                               hotLine: this.props.contactObj.hotLine
                                           }}>
                                        Email: <a href={`mailto:${this.props.contactObj.email}`}>email</a> - Hotline: <a
                                        href={`tel:${this.props.contactObj.hotLine}`}>hotLine</a>
                                    </Trans>
                                    <br/>
                                    <GSButton className="btn-pay-again" success marginTop
                                              onClick={() => this.props.onPayAgain(this.props.billObj.plan)}>
                                        <Trans i18nKey="page.setting.plans.step3.btn.repay"/>
                                    </GSButton>
                                </p>
                            </div>}

                            {this.props.billObj.success &&
                            <div className="mobile-payment-info">
                                <div
                                    className="payment-info__total-price gs-atm__flex-row--flex-start gs-atm__flex-align-items--center">
                                <span className="payment-info__total gs-frm-input__label">
                                <Trans i18nKey="page.setting.plans.step3.total"/>
                                    {' '}
                                </span>
                                    <span className="payment-info__price">
                                {CurrencyUtils.formatMoneyByCurrency(this.props.billObj.total, this.props.billObj.currency)}
                                </span>
                                </div>

                                <div className="gsa-text--non-underline">
                                    <GSButton onClick={e => this.handleCheckRefreshToken(e)} marginRight
                                              className="btn-back-home" success>
                                        <Trans i18nKey="page.setting.plans.step3.btn.backHome"/>
                                    </GSButton>
                                </div>
                            </div>}
                        </div>
                        <div className="plan-info__plan-image gs-atm__border--radius d-mobile-none d-desktop-block">
                            <div className="plan-card__title-block">
                                {this.renderPlanImage()}
                                <h6 className="plan-card__title">{this.props.selectedPlan.name}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

SettingPlansStep3.propTypes = {
    selectedPlan: PropTypes.object,
    billObj: PropTypes.shape({
        total: PropTypes.number,
        currency: PropTypes.string,
        plan: PropTypes.any,
        paymentMethod: PropTypes.string,
        success: PropTypes.bool,
        orderId: PropTypes.any
    }),
    contactObj: PropTypes.object,
    onPayAgain: PropTypes.func
};

export default withRouter(SettingPlansStep3);

