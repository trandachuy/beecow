/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './QuotationInStorePurchaseCartProductList.sass';

import PropTypes from 'prop-types';
import {ContextQuotation} from "../../context/ContextQuotation";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {UikCheckbox, UikWidgetTable} from '../../../../../@uik';
import {CurrencyUtils} from "../../../../../utils/number-format";
import GSActionButton, {GSActionButtonIcons} from "../../../../../components/shared/GSActionButton/GSActionButton";
import ConfirmModal from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import {Trans} from "react-i18next";
import _ from 'lodash';

import GSComponentTooltip from "../../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import {CouponTypeEnum} from "../../../../../models/CouponTypeEnum";
import {ContextQuotationService} from "../../context/ContextQuotationService"
import {ItemUtils} from "../../../../../utils/item-utils";

const QuotationInStorePurchaseCartProductList = props => {
    const {state, dispatch} = useContext(ContextQuotation.context);
    const refConfirmRemove = useRef(null);
    
    useEffect(()=>{
        let countTemp=0
        for(const product of state.productList){
           countTemp+=Number (product.quantity)
        }
        dispatch(ContextQuotation.actions.countProduct(countTemp))
    },[state.productList])
    
    const isCheckedAll = state.productList.filter(p => p.checked).length === state.productList.length && state.productList.length > 0

    const onClickCheckAll = () => {
        if (isCheckedAll) {
            dispatch(ContextQuotation.actions.uncheckAllProduct())
        } else {
            dispatch(ContextQuotation.actions.checkAllProduct())
        }
    }

    const openRemoveConfirmModal = (productId) => {

        const handleOkCallback = () => {
            dispatch(ContextQuotation.actions.removeProduct(productId))
            const productListAfterRemove = [...state.productList].filter(p => p.id !== productId)
            ContextQuotationService.dispatchUpdateProductList(state, dispatch, productListAfterRemove)
        }

        refConfirmRemove.current.openModal({
            messages: (<Trans i18nKey={"page.order.create.cart.table.confirmDelete"}/>),
            okCallback: handleOkCallback
        })
    }

    return (
        <>
            <ConfirmModal ref={refConfirmRemove}/>
            <div className="quotation-in-store-purchase-cart-product-list gs-atm__scrollbar-1">
                <UikWidgetTable >
                    <thead className="quotation-in-store-purchase-cart-product-list__table-header">
                    <tr>
                        <th className="p-2" hidden>
                            <UikCheckbox className="mb-0"
                                         checked={isCheckedAll}
                                         onClick={onClickCheckAll}
                            />
                        </th>
                        <th>
                            <GSTrans t={"productList.tbheader.productName"}/>
                        </th>
                        <th className="text-center">
                            <GSTrans t={"productList.tbheader.price"}/>
                        </th>
                        <th>
                            <GSTrans t={"page.dashboard.table.quantity"}/>
                        </th>

                        <th>
                            <GSTrans t={"page.transfer.stock.table.column.unit"}/>
                        </th>

                        <th  className="text-center">
                            <GSTrans t={"page.order.create.cart.table.priceTotal"}/>
                        </th>
                        <th className="p-0">

                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {state.productList.map(product => {
                        return (
                            <ProductRow data={product}
                                        key={product.id}
                                        openRemoveConfirmModal={openRemoveConfirmModal}
                            />
                        )
                    })
                    }
                    </tbody>
                </UikWidgetTable>
            </div>
        </>
    );
}
QuotationInStorePurchaseCartProductList.propTypes = {

};


const ProductRow = (props) => {
    const {state, dispatch} = useContext(ContextQuotation.context);
    const refQuantity = useRef(null);
    const [product,setProduct]=useState(props.data);
    
    useEffect(()=>{
            if(Number (product.modelStock)==0){
                product.quantity=0
            }
    },[])
    useEffect(()=>{
        renderPrice()
    },[product.quantity])
    const renderPrice=()=>{
        return 
    }
    const onClickCheck = () => {
        // dispatch(OrderInStorePurchaseContext.actions.checkToggleProduct(props.data.id))
        onChangeProduct({
            checked: !props.data.checked
        })
    }

    const onClickRemove = () => {
        props.openRemoveConfirmModal(props.data.id)
    }

    const onChangeProduct = (value) => {
        dispatch(ContextQuotation.actions.modifyProduct({
            ...props.data,
            ...value
        }))
    }

    const onBlurStock = (e) => {
        const value = e.currentTarget.value
        props.data.quantity=product.quantity
       

        if (value !== props.data.quantity) {
            // update temp list for response
            const productList = _.cloneDeep(state.productList)
            const currentProduct = productList.find((p) => p.id === props.data.id)
            
            currentProduct.quantity =Number (value)
            onChangeProduct({
                quantity: value
            })


            ContextQuotationService.dispatchUpdateProductList(state, dispatch, productList)
        }


    }


    const renderDiscountLabel = () => {


        if (props.data.wholeSale) {
            return (
                <>
                    <img src="/assets/images/icon-sf-shoppingcart.svg" alt="discount" className="mr-1" width="12" height="12"/>
                    <span className="gs-frm-input__label font-size-12px">
                    <GSTrans t="page.order.instorePurchase.wholeSaleDiscount" values={{
                        discount: props.data.wholeSale.type === 'FIXED_AMOUNT'? CurrencyUtils.formatMoneyByCurrency(props.data.wholeSale.wholesaleValue, props.data.currency):props.data.wholeSale.wholesaleValue + '%'
                    }}/>
                </span>
                </>
            )
        } else {
            if (props.data.promotion && props.data.promotion.couponType != CouponTypeEnum.FREE_SHIPPING) {
                return (
                    <>
                        <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12" height="12"/>
                        <span className="gs-frm-input__label font-size-12px text-uppercase">{props.data.promotion.couponCode}</span>
                    </>
                )
            }

            // have membership
            if (state.membership && state.membership.enabledBenefit  && (!props.data.promotion || (props.data.promotion && props.data.promotion.couponType && CouponTypeEnum.FREE_SHIPPING))) {
                return (
                    <>
                        <img src="/assets/images/icon-discount.png" alt="discount" className="mr-1" width="12" height="12"/>
                        <span className="gs-frm-input__label font-size-12px text-uppercase">
                            <GSTrans t={'page.order.instorePurchase.membershipLabel'}/>
                        </span>
                    </>
                )
            }
        }

        return null
    }

    return (
        <tr className={["quotation-in-store-purchase-cart-product-list__product-row",
            "quotation-in-store-purchase-cart-product-list__product-row--" + (props.data.checked? 'checked':'unchecked')
        ].join(' ')}
            style={{
                backgroundColor: props.data.deleted? '#fff5f5':'unset'
            }}
        >
            <td className="p-2" hidden>
                <UikCheckbox className="mb-0"
                             defaultChecked={props.data.checked}
                             onClick={onClickCheck}
                             key={props.data.checked}
                />
            </td>
            <td style={{maxWidth:'300px'}}>
                <div className="d-flex justify-content-start align-items-center">
                    {props.data.deleted &&
                        <GSComponentTooltip message={i18next.t('page.order.instorePurchase.productHasBeenDeleted')}>
                            <img src={'/assets/images/icon-error.svg'} className="mr-3" alt="" />
                        </GSComponentTooltip>
                    }
                    <img src={props.data.image}
                         alt="product-thumbnail"
                    className="quotation-in-store-purchase-cart-product-list__product-thumbnail"
                    />
                    <div className="ml-3">
                        <h6 className="quotation-in-store-purchase-cart-product-list__product-name">
                            {props.data.name}
                        </h6>
                        {props.data.modelName &&
                            <span>{ItemUtils.escape100Percent(props.data.modelName)}</span>
                        }
                    </div>
                </div>
            </td>
            <td className="text-center">
                {CurrencyUtils.formatMoneyByCurrency(props.data.price, props.data.currency)}
                <br/>
                {renderDiscountLabel()}
            </td>
            <td style={{position:'relative'}}>
                <input type="number"
                       className="form-control quotation-in-store-purchase-cart-product-list__stock-input"
                       onChange={(event)=>product.quantity=Number (event.currentTarget.value)}
                       defaultValue={props.data.quantity}
                       onBlur={onBlurStock}
                       min={0}
                       key={'quantity_' + props.data.quantity}
                       ref={refQuantity}
                />
                {
                    (product.quantity>product.remainItem)?(
                <p style={{color: 'red',position:'absolute',left:'-25%',fontSize:'12px'}}><GSTrans t={"page.order.list.showRemainItem"} values={{x:product.remainItem}}/></p>
                     ):(null)
                } 
            </td>
            <td>
                {props.data.conversionUnitName || ' -'}
            </td>

            <td key={'discount-price '+ props.data.quantity} className="text-center">
                {CurrencyUtils.formatMoneyByCurrency(Number (product.quantity)* (Number (product.price)), props.data.currency)}
            </td>
            <td className="quotation-in-store-purchase-cart-product-list__td-action pr-3">
                <GSActionButton icon={GSActionButtonIcons.DELETE} onClick={onClickRemove}/>
            </td>
        </tr>
    )
}
const ImageShape = PropTypes.shape({
    imageId: PropTypes.number,
    imageUUID: PropTypes.string,
    urlPrefix: PropTypes.string,
})

ProductRow.propTypes = {
    openRemoveConfirmModal: PropTypes.func,
    data: PropTypes.shape({
        deleted: PropTypes.bool,
        wholeSale: PropTypes.shape({
            discountAmount: PropTypes.number,
            itemId: PropTypes.number,
            minQuantity: PropTypes.number,
            modelId: PropTypes.number,
            type: PropTypes.string,
            wholesaleId: PropTypes.number,
            wholesaleValue: PropTypes.number
        }),
        checked: PropTypes.bool,
        currency: PropTypes.string,
        deposit: PropTypes.bool,
        id: PropTypes.any,
        image: ImageShape,
        itemId: PropTypes.number,
        itemType: PropTypes.string,
        modelId: PropTypes.number,
        modelName: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.any,
        weight: PropTypes.number,
        promotion: PropTypes.shape({
            couponCode: PropTypes.string,
            couponId: PropTypes.number,
            couponItem: PropTypes.shape({
                itemId: PropTypes.number,
                modelId: PropTypes.number,
                promoAmount: PropTypes.number
            }),
            couponType: PropTypes.string,
            freeShipping: PropTypes.bool
        }),
    }),
}
export default QuotationInStorePurchaseCartProductList;
