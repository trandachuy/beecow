/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const createPromotionItems = (p) => {
    return {
        itemId:  p.itemId,
        price: p.price,
        modelId: p.modelId,
        quantity: p.quantity,
        branchId: p.branchId,
        wholesalePricingId: p.wholesalePricingId
    }
}

const createWholeSaleItems = (p) => {
    return {
        itemId:  p.itemId,
        price: p.price,
        modelId: p.modelId,
        quantity: p.quantity,
        branchId: p.branchId
    }
}

/**
 *
 * @param p
 * @return {ItemVATVMModel}
 */
const createVATItems = (p) => {
    return {
        itemId:  p.itemId,
        price: p.price,
        modelId: p.modelId,
        quantity: p.quantity,
        wholesalePricingId: p.wholesalePricingId
    }
}

export const OrderInStorePurchaseRequestBuilder = {
    createPromotionItems,
    createWholeSaleItems,
    createVATItems
}
