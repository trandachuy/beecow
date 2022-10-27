import React from "react";
import {ContextUtils} from "../../../../utils/context";

const initState = {
    currentVariationSelection: null,
    isChange: false
};
const context = React.createContext({})

const actions = {
    changeCurrentVariationSelecton: (selector) => {
        return ContextUtils.createAction('CHANGE_CURRENT_VARIATION_SELECTION', selector)
    },
    comfirModalChangeForm: (edit) =>{
        return ContextUtils.createAction('CHANGE_CURRENT_FORM', edit)
    }
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'CHANGE_CURRENT_VARIATION_SELECTION':
            return {
                ...state,
                currentVariationSelection: action.payload
            };
        case 'CHANGE_CURRENT_FORM':
            return {
                ...state,
                isChange: action.payload
            };
    }
}

export const VariationSelectionContext = {
    context,
    provider: context.Provider,
    reducer,
    actions,
    initState
}
