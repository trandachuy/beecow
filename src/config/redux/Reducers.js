import {createAction, createReducer} from "redux-starter-kit";
import {combineReducers} from "redux";

/**
 * Declare each reducer
 */
export const setPageTitle = createAction('PAGE_TssITLE');
const pageTitleReducer = createReducer([], {
    [setPageTitle] : (state, action) => {
        return action.payload;
    }
});

export const setRegisterInfo = createAction('REGISTER_INFO');
const registerInfoReducer = createReducer([], {
    [setRegisterInfo] : (state, action) => {
        return action.payload;
    }
});

export const setRequireMoreFields = createAction('REQUIRE_MORE_FIELDS');
const requireMoreFieldsReducer = createReducer([], {
    [setRequireMoreFields] : (state, action) => {
        return action.payload;
    }
});

export const destroySetRegisterInfo = createAction('DESTROY_REGISTER_INFO');
const destroySetRegisterInfoReducer = createReducer([], {
    [destroySetRegisterInfo] : (state, action) => {
        state = [];
        return state;
    }
});

export const setStoreInfo = createAction('SET_STORE_INFO');
const setStoreInfoReducer = createReducer([], {
    [setStoreInfo] : (state, action) => {
        return action.payload
    }
});

export const setCollapsedMenu = createAction('SET_COLLAPSED_MENU');
const setCollapsedMenuReducer = createReducer(false, {
    [setCollapsedMenu]: (state, action) => {
        return action.payload
    }
});

export const setLogo = createAction('SET_LOGO');
const setLogoReducer = createReducer('', {
    [setLogo]: (state, action) => {
        return action.payload
    }
});

export const setWhiteLogo = createAction('SET_WHITE_LOGO');
const setWhiteLogoReducer = createReducer('', {
    [setWhiteLogo]: (state, action) => {
        return action.payload
    }
});

export const setAgencyName = createAction('SET_AGENCY_NAME');
const setAgencyNameReducer = createReducer(null, {
    [setAgencyName]: (state, action) => {
        return action.payload;
    }
});

export const setAgencyDomain = createAction('SET_AGENCY_DOMAIN');
const setAgencyDomainReducer = createReducer(null, {
    [setAgencyDomain]: (state, action) => {
        return action.payload;
    }
});

export const setAgencyZaloApp = createAction('SET_AGENCY_ZALO_APP');
const setAgencyZaloAppReducer = createReducer(null, {
    [setAgencyZaloApp]: (state, action) => {
        return action.payload;
    }
});

export const toggleCallHistoryReload = createAction('TOGGLE_CALL_HISTORY_RELOAD');
const toggleCallHistoryReloadReducer = createReducer({callHistoryReload: false}, {
    [toggleCallHistoryReload]: (state) => {
        return !state.callHistoryReload;
    }
});

export const setRefCode = createAction('REF_CODE');
const setRefCodeReducer = createReducer('', {
    [setRefCode]: (state, action) => {
        return action.payload
    }
});

/**
 * Combine to root reducer
 */
const rootReducer = combineReducers({
    pageTitle: pageTitleReducer,
    registerInfo : registerInfoReducer,
    destroyRegisterInfo : destroySetRegisterInfoReducer,
    storeInfo: setStoreInfoReducer,
    collapsedMenu: setCollapsedMenuReducer,
    logo: setLogoReducer,
    whiteLogo: setWhiteLogoReducer,
    agencyName: setAgencyNameReducer,
    agencyDomain: setAgencyDomainReducer,
    agencyZaloApp: setAgencyZaloAppReducer,
    requireMoreFields: requireMoreFieldsReducer,
    callHistoryReload: toggleCallHistoryReloadReducer,
    refCode: setRefCodeReducer,
});

export default rootReducer;
