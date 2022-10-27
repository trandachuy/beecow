import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import "./PaymentMethod.sass"
import {SHIPPING_AND_PAYMENT_PAGE} from "../ShippingAndPayment/ShippingAndPayment";
import i18next from "i18next";
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";

const PageBenefitsPaypal = props => {

    const onChangePagePayPal = () => {
        props.onChangePagePayPal(SHIPPING_AND_PAYMENT_PAGE.ROOT)
    }

    const onClickActive = () => {
        const connectUrl = storageService.getFromSessionStorage(Constants.STORAGE_KEY_PAYPAL_LINK);
        window.open(connectUrl, "_parent");
    }

    return (
        <>
            <GSWidget className="gs-ani__fade-in page-benefits-paypal">
                <GSWidgetHeader className="flex-column flex-md-row align-items-start align-items-md-center">
                    <GSFakeLink onClick={onChangePagePayPal} className="color-gray d-block gsa-hover--fadeOut cursor--pointer font-weight-normal font-size-14px">
                        &#8592; <GSTrans t="page.setting.shippingAndPayment.backToPaymentSetting"/>
                    </GSFakeLink>
                </GSWidgetHeader>
                <GSWidgetContent style={{minHeight: '50vh'}} className="d-flex flex-column">
                    <div className='box-content-benefits'>
                        <div className='header-benefits-paypal'>
                            <img src="/assets/images/icon_paypal_benefits.svg"/>

                            <p className='title-first' >{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.title1")}</p>
                            <p className='title-secondary'>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.title2")}</p>
                        </div>
                        <div className='content-benefits-paypal'>
                            <p className='content-title'>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.contentTitle")}</p>
                            <ul>
                                <li>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.content1")}</li>
                                <li>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.content2")}</li>
                                <li>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.content3")}</li>
                                <li>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.content4")}</li>
                            </ul>
                        </div>
                        <div className='footer-benefits-paypal'>
                            <a onClick={onClickActive} className='button-active'>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.active")}</a>
                            <a href='https://paypal.com' target='_blank' className='button-learMore'>{i18next.t("page.setting.shippingAndPayment.benefitsPaypal.learMore")}</a>
                        </div>
                    </div>

                </GSWidgetContent>
            </GSWidget>
        </>
    );
};

PageBenefitsPaypal.propTypes = {
    onChangePagePayPal: PropTypes.func
};


export default PageBenefitsPaypal;
