import React from "react";
import { ContextUtils } from "../../../utils/context";

const initState = {
    isDropShipActive: undefined,
    isResellerActive: undefined,
    isDropShipExpired: undefined,
    isResellerExpired: undefined,
    dropShipPackage: undefined,
    resellerPackage: undefined,
};

const context = React.createContext(initState)

const actions = {
    setDropShipExpired: isExpired => ContextUtils.createAction('SET_DROP_SHIP_EXPIRED', isExpired),
    setResellerExpired: isExpired => ContextUtils.createAction('SET_RESELLER_EXPIRED', isExpired),
    setDropShipActive: isActive => ContextUtils.createAction('SET_DROP_SHIP_ACTIVE', isActive),
    setResellerActive: isActive => ContextUtils.createAction('SET_RESELLER_ACTIVE', isActive),
    setDropShipPackage: dropShipPackage => ContextUtils.createAction('SET_DROP_SHIP_PACKAGE', dropShipPackage),
    setResellerPackage: resellerPackage => ContextUtils.createAction('SET_RESELLER_PACKAGE', resellerPackage)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_DROP_SHIP_EXPIRED': {
            return {
                ...state,
                isDropShipExpired: action.payload
            }
        }
        case 'SET_RESELLER_EXPIRED': {
            return {
                ...state,
                isResellerExpired: action.payload
            }
        }
        case 'SET_DROP_SHIP_ACTIVE': {
            return {
                ...state,
                isDropShipActive: action.payload
            }
        }
        case 'SET_RESELLER_ACTIVE': {
            return {
                ...state,
                isResellerActive: action.payload
            }
        }
        case 'SET_DROP_SHIP_PACKAGE': {
            return {
                ...state,
                dropShipPackage: action.payload
            }
        }
        case 'SET_RESELLER_PACKAGE': {
            return {
                ...state,
                resellerPackage: action.payload
            }
        }
        default:
            return state;
    }
}

export const AffiliateContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
}
