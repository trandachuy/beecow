import React from "react";
import {ContextUtils} from "../../../utils/context";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const initState = {

}



const context = React.createContext(initState)

const actions = {
    setFilterValue: (name, value, ignoreCount) => ContextUtils.createAction('SET_FILTER_VALUE', {name, value, ignoreCount})
}

const reducer = (state, action) => {


    switch (action.type) {
        case 'SET_FILTER_VALUE': {
            const {name, value, ignoreCount} = action.payload
            return ({
                ...state,
                [name]: {value, ignoreCount}
            })
        }
        default:
            return state
    }
}

export const GSMegaFilterContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
}