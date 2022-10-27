/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import {atom, selector} from "recoil";
import _ from "lodash"
import {CredentialUtils} from "../../../../utils/credential";
import {FbMessengerContext} from "../context/FbMessengerContext";

const posScannerState = atom({
    key: 'scannerStateFb',
    default: {
        scannerState: true,
        shouldScannerActivated: true,
        shouldCustomerScannerActivated: true,
        customerScannerState: false
    }
})


const orderListState = atom({
    key: 'orderListStateFb',
    default: [{
        index: 0,
        state: FbMessengerContext.initState
    }]
})

const currentOrderIndexState = atom({
    key: 'currentOrderIndexStateFb',
    default: 0
})

const storeBranchState = atom({
    key: 'storeBranchStateFb',
    default: {}
})

const loyaltySettingState = atom({
    key: 'loyaltySettingStateFb',
    default: {
        enabledPoint: false,
        isUsePointEnabled: false,
        exchangeAmount: 0
    }
})

const printerState = atom({
    key: 'printerStateFb',
    default: {
        printEnabled: CredentialUtils.getCheckedOrder(),
        printPageSize: CredentialUtils.getSelectOrder() || 'A4'
    }
})

const currentOrderSelector = selector({
    key: 'currentOrderSelectorFb',
    get: ({get}) => {
        const orderList = get(orderListState)
        const currentOrderIndex = get(currentOrderIndexState)
        return orderList.find(order => order.index === currentOrderIndex)
    }
})

const updateCurrentOrderSelector = selector({
    key: 'updateCurrentOrderSelectorFb',
    set: ({set, get}, newState) => {
        const orderList = _.cloneDeep(get(orderListState))
        const currentOrderIndex = get(currentOrderIndexState)
        let currentOrder = orderList.find(order => order.index === currentOrderIndex)
        currentOrder.state = newState
        set(orderListState, orderList)
    }
})

const createNewOrderSelector = selector({
    key: 'createNewOrderSelectorFb',
    set: ({set, get}) => {
        const orderList = get(orderListState)
        const lastOrder = orderList[orderList.length-1]
        const {index, state} = lastOrder
        set(orderListState, [...orderList, {
            index: index+1,
            state: FbMessengerContext.initState
        }])
        set(currentOrderIndexState, index+1)
    }
})

const resetCurrentOrderSelector = selector({
    key: 'resetCurrentOrderSelectorFb',
    set: ({set, get}) => {
        const orderList = _.cloneDeep(get(orderListState))
        const currentOrderIndex = get(currentOrderIndexState)
        let currentOrder = orderList.find(order => order.index === currentOrderIndex)
        currentOrder.state = FbMessengerContext.initState
        set(orderListState, orderList)
    }
})

const deleteOrderSelector = selector({
    key: 'deleteOrderSelectorFb',
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
                    state: FbMessengerContext.initState
                }]
            }
        } else { // delete another tab
            orderList = orderList.filter(({index}) => index !== removedIndex)
        }
        set(orderListState, orderList)
    }
})


const resetSelector = selector({
    key: 'resetSelectorFb',
    set: ({set}) => {
        set(orderListState, [{
            index: 0,
            state: FbMessengerContext.initState
        }])
        set(currentOrderIndexState, 0)
    }
})


export const OrderInFacebookRecoil = {
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
