/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {ContextUtils} from "../../../utils/context";
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import {AgencyService} from "../../../services/AgencyService";


const initState = {
    barcodeSet: [1,2,3],
    storeInfo: {
        storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
        storeDomain: AgencyService.getStorefrontDomain(),
        storeUrl: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_URL),
        storeImage: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE),
        storeName: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
        storePhone: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_PHONE),
        storeAddress: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS),
    },
}

const context = React.createContext(initState)

const actions = {
    addNewBarcode: (barcode) => ContextUtils.createAction('ADD_NEW_BARCODE', barcode)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_NEW_BARCODE':
            return {
                ...state,
                barcodeSet: [...new Set([...state.barcodeSet, action.payload])]
            }
        case 'REMOVE_BARCODE':
            return {
                ...state,
                barcodeSet: [...new Set([...state.barcodeSet.filter(bc => bc !== action.payload)])]
            }
    }
}


export const ProductContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
}