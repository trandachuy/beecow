

import './LanguagesPlansStep2.sass';
import React, {useEffect, useState} from 'react';
import i18next from "i18next";
import Constants from "../../../../config/Constant";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {AgencyService} from "../../../../services/AgencyService";
import {Trans} from "react-i18next";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {CurrencyUtils} from "../../../../utils/number-format";
import {Link} from "react-router-dom";
const storeSymbolCode = CurrencyUtils.getLocalStorageSymbol();
const LanguagesPlansStep2 = props => {
    const [stDefaultSymbol, setStDefaultSymbol] = useState(storeSymbolCode)
    useEffect(() => {
        if(CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM){
            setStDefaultSymbol(Constants.CURRENCY.USD.SYMBOL)
        }
    }, [])
    return (
        <>
            <div className="multi-language-plans-step2">
                {/*DESKTOP*/}
                <div className="plan-info">
                    <div className="contact-info gs-atm__border--radius">
                        {/*SUCCESSFUL CASE*/}
                        <div className="contact-info__description">
                            {props.billObj.paymentMethod !== Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                            <h3>
                                <GSTrans i18nKey="page.setting.plans.step3.thanksForUsing" values={
                                    {
                                        provider: AgencyService.getDashboardName()
                                    }
                                }/>
                                <br/>
                                <GSTrans i18nKey="page.setting.plans.step3.paymentSuccessful" />
                            </h3>}

                            {props.billObj.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                            <h3>
                                <GSTrans t="page.setting.plans.step3.bankTransfer" values={
                                    {
                                        provider: i18next.t("page.call.center.plans.step2.multiLanguage")
                                    }
                                }/>
                            </h3>}
                            {/*/ DETAILS*/}
                            <div className="details-container d-mobile-none d-desktop-flex">
                                {/*DESKTOP*/}
                                <table>
                                    <tbody>
                                    <tr>
                                        <td className="title">
                                            <GSTrans t="page.setting.plans.step3.orderId"/>
                                        </td>
                                        <td className="value">
                                            {props.billObj.orderId}
                                        </td>
                                        <td className="title">
                                            <GSTrans t="page.setting.plans.step3.paymentMethod"/>
                                        </td>
                                        <td className="gsa-width-100 value">
                                            {i18next.t("page.order.detail.information.paymentMethod."+props.billObj.paymentMethod)}
                                        </td>
                                    </tr>
                                    {props.billObj.expiredDate &&
                                    <tr>
                                        <td className="title">
                                            <GSTrans t="page.setting.plans.step3.serviceName"/>
                                        </td>
                                        <td className="value">
                                            <Trans i18nKey="page.call.center.plans.step2.multiLanguage"/>
                                        </td>
                                        <td className="title">
                                            <GSTrans t="page.setting.plans.step3.duration"/>
                                        </td>
                                        <td className="gsa-width-100 value">
                                            {props.billObj.expiredDate}
                                        </td>
                                    </tr>
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <div className="details-container d-mobile-flex d-desktop-none">
                                {/*MOBILE*/}
                                <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.orderId"/>
                                        </span>
                                    <span className="value">
                                            {props.billObj.orderId}
                                        </span>
                                </div>
                                {/*PAYMENT METHOD*/}
                                <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.paymentMethod"/>
                                        </span>
                                    <span className="value">
                                             {i18next.t("page.order.detail.information.paymentMethod." + props.billObj.paymentMethod)}
                                        </span>
                                </div>
                                {/*DURATION*/}
                                {props.billObj.voicePrice &&
                                <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.duration"/>
                                        </span>
                                    <span className="value">
                                            -
                                        </span>
                                </div>
                                }
                                {props.billObj.expiredDate &&<div className="details-short-row">
                                        <span className="title">
                                             <GSTrans t="page.setting.plans.step3.serviceName"/>
                                        </span>
                                    <span className="value">
                                            <Trans i18nKey="page.call.center.plans.step2.multiLanguage"/>
                                        </span>
                                </div>}
                                {props.billObj.expiredDate &&
                                <div className="details-short-row">
                                        <span className="title">
                                            <GSTrans t="page.setting.plans.step3.duration"/>
                                        </span>
                                    <span className="value">
                                            {props.billObj.expiredDate}
                                        </span>
                                </div>
                                }
                            </div>
                            <p>
                                {(props.billObj.paymentMethod === 'ATM' || props.billObj.paymentMethod === 'VISA' || props.billObj.paymentMethod === 'ZALO')
                                && (props.contactObj.descriptions? props.contactObj.descriptions:(
                                    <Trans i18nKey="page.setting.plans.step3.descriptions"/>
                                ))}

                                {(props.billObj.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER) &&
                                <>
                                    <GSTrans t="page.setting.plans.step3.bankTransferHint"/>
                                    {CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM &&
                                    <div className="bank-transfer__info">
                                        <p>{'• '}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountOwner"/>
                                            {props.paymentObj.bankTransfer.accountOwner}
                                        </p>
                                        <p>{'• '}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumber"/>
                                            {props.paymentObj.bankTransfer.accountNumber}
                                        </p>
                                        <p>{'• '}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.bank"/>
                                            {props.paymentObj.bankTransfer.bank}
                                        </p>
                                        <p>{'• '}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.branch"/>
                                            {props.paymentObj.bankTransfer.branch}
                                        </p>
                                        <p>{'• '}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                            {props.paymentObj.bankTransfer.content}
                                        </p>
                                    </div>}
                                    {CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM &&
                                    <div className="bank-transfer__info">
                                        <p>
                                            {"• "}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.bankName"/>
                                            {props.paymentObj.bankTransferNonVn.bankName}
                                        </p>
                                        <p>
                                            {"• "}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.swiftCode"/>
                                            {props.paymentObj.bankTransferNonVn.swiftCode}
                                        </p>
                                        <p>
                                            {"• "}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountHolderName"/>
                                            {props.paymentObj.bankTransferNonVn.accountHolderName}
                                        </p>
                                        <p>
                                            {"• "}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.accountNumberNonVn"/>
                                            {props.paymentObj.bankTransferNonVn.accountNumber}
                                        </p>
                                        <p>
                                            {"• "}
                                            <Trans i18nKey="page.setting.plans.step2.bankTransfer.content"/>
                                            {
                                                props.paymentObj
                                                    .bankTransfer
                                                    .content
                                            }
                                        </p>
                                    </div>}
                                    
                                    
                                </>
                                }

                                <Trans i18nKey="page.setting.plans.step3.bankTransferFooter"
                                       values={{
                                           email: props.contactObj.email,
                                           hotLine: props.contactObj.hotLine
                                       }}>
                                    Email: <a href={`mailto:${props.contactObj.email}`}>email</a> - Hotline: <a href={`tel:${props.contactObj.hotLine}`}>hotLine</a>
                                </Trans>
                            </p>
                        </div>

                        <div className="payment-info">
                            <div className="payment-info__total-price gs-atm__flex-row--flex-start gs-atm__flex-align-items--center">
                                <span className="payment-info__total gs-frm-input__label">
                                <Trans i18nKey="page.setting.plans.step3.total"/>
                                </span>
                                <span className="payment-info__price">
                                {CurrencyUtils.formatMoneyByCurrency(props.billObj.total, stDefaultSymbol)}
                                </span>
                            </div>

                            <Link to={'/'} className="gsa-text--non-underline">
                                <GSButton marginRight className="btn-back-home" success>
                                    <Trans i18nKey="page.setting.plans.step3.btn.backHome"/>
                                </GSButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default LanguagesPlansStep2;
