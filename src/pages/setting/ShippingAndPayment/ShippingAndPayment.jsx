/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useState} from 'react';
import ShippingProvider from "../ShippingProvider/ShippingProvider";
import PaymentMethod from "../PaymentMethod/PaymentMethod";
import SelfDeliveryConfiguration from "../ShippingProvider/SelfDeliveryConfiguration/SelfDeliveryConfiguration";
import PageBenefitsPaypal from "../PaymentMethod/PageBenefitsPaypal";

export const SHIPPING_AND_PAYMENT_PAGE = {
    ROOT: 'ROOT',
    SELF_DELIVERY_CONFIG: 'SELF_DELIVERY_CONFIG',
    BENEFITS_PAYPAL: 'BENEFITS_PAYPAL'
}

const ShippingAndPayment = props => {
    const [stPage, setStPage] = useState(SHIPPING_AND_PAYMENT_PAGE.ROOT);
    const [stIsFromConfigToRoot, setStIsFromConfigToRoot] = useState(false);
    const [stIsFromBenefitsPayPal, setStIsFromBenefitsPayPal] = useState(false);

    const onChangePage = (page) => {
        if (stPage === SHIPPING_AND_PAYMENT_PAGE.SELF_DELIVERY_CONFIG && page === SHIPPING_AND_PAYMENT_PAGE.ROOT) {
            setStIsFromConfigToRoot(true)
        } else {
            setStIsFromConfigToRoot(false)
        }
        setStPage(page)
    }

    const onChangePagePayPal = (page) => {
        if (stPage === SHIPPING_AND_PAYMENT_PAGE.BENEFITS_PAYPAL && page === SHIPPING_AND_PAYMENT_PAGE.ROOT) {
            setStIsFromBenefitsPayPal(true)
        } else {
            setStIsFromBenefitsPayPal(false)
        }
        setStPage(page)
    }

    return (
        <>
            { stPage === SHIPPING_AND_PAYMENT_PAGE.ROOT &&
                <>
                    <ShippingProvider onChangePage={onChangePage}
                                      defaultEnabledSelfDelivery={stIsFromConfigToRoot}
                    />
                    <PaymentMethod onChangePagePayPal={onChangePagePayPal}
                                   defaultEnabledBenefitsPayPal={stIsFromBenefitsPayPal}
                    />
                </>
            }

            { stPage === SHIPPING_AND_PAYMENT_PAGE.SELF_DELIVERY_CONFIG &&
                <>
                    <SelfDeliveryConfiguration onChangePage={onChangePage}
                    />
                </>
            }

            { stPage === SHIPPING_AND_PAYMENT_PAGE.BENEFITS_PAYPAL &&
            <>
                <PageBenefitsPaypal onChangePagePayPal={onChangePagePayPal}
                />
            </>
            }
        </>
    );
};

ShippingAndPayment.propTypes = {

};

export default ShippingAndPayment;
