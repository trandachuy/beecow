/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import {atom, selector} from "recoil";
import {OrderInStorePurchaseContext} from "../context/OrderInStorePurchaseContext";
import _ from "lodash"
import {CredentialUtils} from "../../../../utils/credential";

const posScannerState = atom({
    key: 'scannerStateInStore',
    default: {
        scannerState: true,
        shouldScannerActivated: true,
        shouldCustomerScannerActivated: true,
        customerScannerState: false
    }
})


const orderListState = atom({
    key: 'orderListStateInStore',
    default: [{
        index: 0,
        state: OrderInStorePurchaseContext.initState
    }]
})

const currentOrderIndexState = atom({
    key: 'currentOrderIndexStateInStore',
    default: 0
})

const storeBranchState = atom({
    key: 'storeBranchStateInStore',
    default: {}
})

const loyaltySettingState = atom({
    key: 'loyaltySettingStateInStore',
    default: {
        enabledPoint: false,
        isUsePointEnabled: false,
        exchangeAmount: 0
    }
})

const printerState = atom({
    key: 'printerStateInStore',
    default: {
        printEnabled: CredentialUtils.getCheckedOrder(),
        printPageSize: CredentialUtils.getSelectOrder()
    }
})

const currentOrderSelector = selector({
    key: 'currentOrderSelectorInStore',
    get: ({get}) => {
        const orderList = get(orderListState)
        const currentOrderIndex = get(currentOrderIndexState)
        return orderList.find(order => order.index === currentOrderIndex)
    }
})

const updateCurrentOrderSelector = selector({
    key: 'updateCurrentOrderSelectorInStore',
    set: ({set, get}, newState) => {
        const orderList = _.cloneDeep(get(orderListState))
        const currentOrderIndex = get(currentOrderIndexState)
        let currentOrder = orderList.find(order => order.index === currentOrderIndex)
        currentOrder.state = newState
        set(orderListState, orderList)
    }
})

const createNewOrderSelector = selector({
    key: 'createNewOrderSelectorInStore',
    set: ({set, get}) => {
        const orderList = get(orderListState)
        const lastOrder = orderList[orderList.length-1]
        const {index, state} = lastOrder
        set(orderListState, [...orderList, {
            index: index+1,
            state: OrderInStorePurchaseContext.initState
        }])
        set(currentOrderIndexState, index+1)
    }
})

const resetCurrentOrderSelector = selector({
    key: 'resetCurrentOrderSelectorInStore',
    set: ({set, get}) => {
        const orderList = _.cloneDeep(get(orderListState))
        const currentOrderIndex = get(currentOrderIndexState)
        let currentOrder = orderList.find(order => order.index === currentOrderIndex)
        currentOrder.state = OrderInStorePurchaseContext.initState
        set(orderListState, orderList)
    }
})

const deleteOrderSelector = selector({
    key: 'deleteOrderSelectorInStore',
    set: ({set, get}, removedIndex) => {
        let orderList = _.cloneDeep(get(orderListState))
        const currentOrderIndex = get(currentOrderIndexState)
        if (currentOrderIndex === removedIndex) { // delete current tab
            // switch to next tab first
            const currentArrayIndex = orderList.findIndex(({index}) => index === currentOrderIndex)
            const nextOrder = orderList[currentArrayIndex + 1]
            const prevOrder = orderList[currentArrayIndex - 1]
            if (nextOrder) { // found next -> switch to next tab
                set(currentOrderIndexState, nextOrder.index)
                orderList = orderList.filter(({index}) => index !== removedIndex)

            }
            if (prevOrder && !nextOrder) { // not found next -> switch to prev tab
                set(currentOrderIndexState, prevOrder.index)
                orderList = orderList.filter(({index}) => index !== removedIndex)
            }
            if (!nextOrder && !prevOrder) { // has no remain tab -> create new
                set(currentOrderIndexState, 0)
                orderList = [{
                    index: 0,
                    state: OrderInStorePurchaseContext.initState
                }]
            }
        } else { // delete another tab
            orderList = orderList.filter(({index}) => index !== removedIndex)
        }
        set(orderListState, orderList)
    }
})


const resetSelector = selector({
    key: 'resetSelectorInStore',
    set: ({set}) => {
        set(orderListState, [{
            index: 0,
            state: OrderInStorePurchaseContext.initState
        }])
        set(currentOrderIndexState, 0)
    }
})


export const OrderInStorePurchaseRecoil = {
    orderListState,
    currentOrderIndexState,
    currentOrderSelector,
    createNewOrderSelector,
    updateCurrentOrderSelector,
    deleteOrderSelector,
    storeBranchState,
    resetCurrentOrderSelector,
    resetSelector,
    loyaltySettingState,
    posScannerState,
    printerState
}
