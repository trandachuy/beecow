/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext} from 'react';
import './OrderInZaloCart.sass';
import {useRecoilValue} from "recoil";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import OrderInZaloProductList from "./list/OrderInZaloProductList";
import {OrderInZaloContext} from "../context/OrderInZaloContext";
import ProductSearch from "../OrderInZalo/ProductSearch/ProductSearch";
import {OrderInZaloRecoil} from "../recoil/OrderInZaloRecoil";


const OrderInZaloCart = props => {
    const {state} = useContext(OrderInZaloContext.context);

    const loyaltySetting = useRecoilValue(OrderInZaloRecoil.loyaltySettingState)

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
                <OrderInZaloProductList/>
            </GSWidgetContent>
            {/*ONLY SHOW PROMOTION WHEN HAS NO WHOLE SALE PRODUCT*/}
        </GSWidget>
    );
};

OrderInZaloCart.propTypes = {

};

export default OrderInZaloCart;
