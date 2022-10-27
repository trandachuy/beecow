/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/



export const InventoryEnum = {
    SEARCH_BY: {
        PRODUCT_NAME: 'name',
        BARCODE: 'barcode'
    },
    ACTIONS: {
        CHANGE_STOCK: 'CHANGE',
        SET_STOCK: 'SET',
        RETURN: 'UNLOCK',
        GOODS_IN_TRANSACTION: 'LOCK',
        GOODS_IN_TRANSACTION_MG: 'LOCK_MIGRATE',
        GOODS_DELIVERED: 'SOLD',
        GOODS_DELIVERED_MG: 'SOLD_MIGRATE',
        TRANSFER_IN: 'TRANSFER_IN',
        TRANSFER_OUT: 'TRANSFER_OUT',
        TRANSFER_IN_GOING: 'TRANSFER_IN_GOING',
        TRANSFER_OUT_GOING: 'TRANSFER_OUT_GOING',
        TRANSFER_IN_RECEIVED: 'TRANSFER_IN_RECEIVED',
        TRANSFER_OUT_DELIVERED: 'TRANSFER_OUT_DELIVERED',
        TRANSFER_IN_CANCELED: 'TRANSFER_IN_CANCELED',
        TRANSFER_OUT_CANCELED: 'TRANSFER_OUT_CANCELED',
        PURCHASE_ORDER_CANCELED: 'PURCHASE_ORDER_CANCELED',
        PURCHASE_ORDER_RECEIVED: 'PURCHASE_ORDER_RECEIVED',
        PURCHASE_ORDER: 'PURCHASE_ORDER',
        RETURN_ORDER_RECEIVED: 'RETURN_ORDER_RECEIVED',
        EDIT_ORDER: 'EDIT_ORDER',
    },
    ACTION_TYPES: {
        FROM_CREATE_AT_ITEM_SCREEN: 'FROM_CREATE_AT_ITEM_SCREEN',
        FROM_UPDATE_AT_VARIATION_DETAIL: 'FROM_UPDATE_AT_VARIATION_DETAIL'
    },
    STAFFS: {
        SYSTEM: 'system'
    }
}
