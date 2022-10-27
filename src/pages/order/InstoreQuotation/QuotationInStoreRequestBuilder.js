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
        branchId: p.branchId
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
    }
}

export const QuotationInStoreRequestBuilder = {
    createPromotionItems,
    createWholeSaleItems,
    createVATItems
}
