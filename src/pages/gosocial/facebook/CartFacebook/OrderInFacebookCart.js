/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext} from 'react';
import './OrderInFacebookCart.sass';
import {useRecoilValue} from "recoil";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import ProductSearch from "../OrderInFacebook/ProductSearch/ProductSearch";
import OrderInFacebookProductList from "./list/OrderInFacebookProductList";
import {FbMessengerContext} from "../context/FbMessengerContext";
import {OrderInFacebookRecoil} from "../recoil/OrderInFacebookRecoil";


const OrderInFacebookCart = props => {
    const {state} = useContext(FbMessengerContext.context);

    const loyaltySetting = useRecoilValue(OrderInFacebookRecoil.loyaltySettingState)

    const isShowFooter = () => {
        // SHOW WHEN HAS NO WHOLE SALE PRODUCT
        return (state.productList.filter(p => !!p.wholeSale).length === 0) || (loyaltySetting.enabledPoint && state.user.userId)
    }

    return (
        <GSWidget className="order-in-facebook-cart d-flex flex-column">
            <GSWidgetHeader>
                <ProductSearch />
            </GSWidgetHeader>
            <GSWidgetContent className="pt-0 order-in-store-purchase-cart__content" >
                <OrderInFacebookProductList/>
            </GSWidgetContent>
            {/*ONLY SHOW PROMOTION WHEN HAS NO WHOLE SALE PRODUCT*/}
        </GSWidget>
    );
};

OrderInFacebookCart.propTypes = {

};

export default OrderInFacebookCart;
