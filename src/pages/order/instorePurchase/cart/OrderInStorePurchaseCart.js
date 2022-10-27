/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext} from 'react';
import './OrderInStorePurchaseCart.sass';
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import OrderInStorePurchaseCartProductList from "./list/OrderInStorePurchaseCartProductList";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import ProductSearch from "../ProductSearch/ProductSearch";
import {OrderInStorePurchaseContext} from "../context/OrderInStorePurchaseContext";
import {useRecoilValue} from "recoil";
import {OrderInStorePurchaseRecoil} from "../recoil/OrderInStorePurchaseRecoil";

const OrderInStorePurchaseCart = props => {
    const {state} = useContext(OrderInStorePurchaseContext.context);

    const loyaltySetting = useRecoilValue(OrderInStorePurchaseRecoil.loyaltySettingState)

    const isShowFooter = () => {
        // SHOW WHEN HAS NO WHOLE SALE PRODUCT
        return (state.productList.filter(p => !!p.wholeSale).length === 0) || (loyaltySetting.enabledPoint && state.user.userId)
    }

    return (
        <GSWidget className="order-in-store-purchase-cart d-flex flex-column">
            <GSWidgetHeader>
                <ProductSearch />
            </GSWidgetHeader>
            <GSWidgetContent className="pt-0 order-in-store-purchase-cart__content" >
                <OrderInStorePurchaseCartProductList/>
            </GSWidgetContent>
            {/*ONLY SHOW PROMOTION WHEN HAS NO WHOLE SALE PRODUCT*/}
        </GSWidget>
    );
};

OrderInStorePurchaseCart.propTypes = {

};

export default OrderInStorePurchaseCart;
