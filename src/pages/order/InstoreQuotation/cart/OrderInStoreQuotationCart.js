/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React, {useContext} from 'react';
import './OrderInStoreQuotationCart.sass'
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
// import OrderInStorePurchaseCartProductList from "./list/OrderInStorePurchaseCartProductList";
import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetFooter from "../../../../components/shared/form/GSWidget/GSWidgetFooter";
import QuotationPromotion from "./promotion/QuotationPromotion";
// import ProductSearch from "../ProductSearch/ProductSearch";
import {ContextQuotation} from "../context/ContextQuotation";
import ProductSearchInCart from '../ProductSearchInCart/ProductSearchInCart'
import QuotationInStorePurchaseCartProductList from './list/QuotationInStorePurchaseCartProductList'
const OrderInStoreQuotationCart = props => {
    const {state} = useContext(ContextQuotation.context);
    return (
        <GSWidget className="quotation-in-store-purchase-cart ">
            <GSWidgetHeader className="bg-gray">
                <ProductSearchInCart />
            </GSWidgetHeader>
            <GSWidgetContent className="pt-0">
                <QuotationInStorePurchaseCartProductList/>
               
            </GSWidgetContent>
            {/*ONLY SHOW PROMOTION WHEN HAS NO WHOLE SALE PRODUCT*/}
            {/* {state.productList.filter(p => !!p.wholeSale).length === 0 &&
                <GSWidgetFooter>
                    <QuotationPromotion/>
                </GSWidgetFooter>
            } */}
        </GSWidget>
    );
};

OrderInStoreQuotationCart.propTypes = {

};

export default OrderInStoreQuotationCart;
