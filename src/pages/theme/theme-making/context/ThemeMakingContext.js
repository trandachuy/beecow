import React from "react";
import {ContextUtils} from "../../../../utils/context";
import _ from 'lodash'
import ThemeEngineConstants from "../ThemeEngineConstants";

const initState = {
    themeId: undefined,
    platform: ThemeEngineConstants.PLATFORM_TYPE.DESKTOP,
    editorContent: undefined,
    currentComponent: undefined,
    returnComponent: undefined,
    componentList: [],
    themeType: undefined,
    settingTab: ThemeEngineConstants.SETTING_TAB.GENERAL_SETTING,
    page: undefined,
    pageContent: undefined,
    storePageContent: undefined,
    sectionContent: undefined,
    listEditPages: undefined,
    showSlide: -1,
    currentSubComponent: undefined,
    editElementReturn: undefined,
    editSubElementReturn: undefined,
    changeLogo: undefined,
    changeFont: undefined,
    changeColorPrimary: undefined,
    changeColorSecondary: undefined,
    requestActivePage: undefined,
    selectedStoreLang: undefined,
    storeLanguages: [],
    isPreview: false,
    controller: {
        isTranslate: false
    },
    phoneNumber: null,
    enableCallIcon: false,
    lockChangePage: true,
}

const context = React.createContext(initState)

const actions = {
    addNewComponent: (component) => ContextUtils.createAction('ADD_NEW_COMPONENT', component),
    setThemeId: (themeId) => ContextUtils.createAction('SET_THEME_ID', themeId),
    setPlatform: (platform) => ContextUtils.createAction('SET_PLATFORM', platform),
    setThemeType: (themeType) => ContextUtils.createAction('SET_THEME_TYPE', themeType),
    setCurrentComponent: (component) => ContextUtils.createAction('SET_CURRENT_COMPONENT', component),
    setReturnComponent: (component) => ContextUtils.createAction('RETURN_CURRENT_COMPONENT', component),
    setCurrentSubComponent: (component) => ContextUtils.createAction('SET_CURRENT_SUB_COMPONENT', component),
    editElementReturn: (component) => ContextUtils.createAction('EDIT_ELEMENT_RETURN', component),
    editSubElementReturn: (component) => ContextUtils.createAction('EDIT_SUB_ELEMENT_RETURN', component),
    setSettingTab: (tab) => ContextUtils.createAction('SET_SETTING_TAB', tab),
    publishPage: (content) => ContextUtils.createAction('PUBLISH_PAGE', content),
    savePage: (content) => ContextUtils.createAction('SAVE_PAGE', content),
    setPage: (page) => ContextUtils.createAction('SET_PAGE', page),
    setIsPreview: (isPreview) => ContextUtils.createAction('SET_IS_PREVIEW', isPreview),
    setEditorContent: (content) => ContextUtils.createAction('SET_EDITOR_CONTENT', content),
    setShowSlide: (position) => ContextUtils.createAction('SET_SHOW_SLIDE_IN_POSITION', position),
    setListEditPages: (listEditPages) => ContextUtils.createAction('SET_LIST_EDIT_PAGE', listEditPages),
    setStorePageContent: (storePageContent) => ContextUtils.createAction('SET_STORE_PAGE_CONTENT', storePageContent),
    changeShopLogo: (url) => ContextUtils.createAction('CHANGE_SHOP_LOGO', url),
    changeShopFont: (font) => ContextUtils.createAction('CHANGE_SHOP_FONT', font),
    changeShopColorPrimary: (colorPrimary) => ContextUtils.createAction('CHANGE_SHOP_COLOR_PRIMARY', colorPrimary),
    changeShopColorSecondary: (colorSecondary) => ContextUtils.createAction('CHANGE_SHOP_COLOR_SECONDARY', colorSecondary),
    setRequestActivePage: (page) => ContextUtils.createAction('SET_REQUEST_ACTIVE_PAGE', page),
    setSelectedStoreLanguage: (lang) => ContextUtils.createAction('SET_SELECTED_STORE_LANGUAGE', lang),
    setStoreLanguages: (languages) => ContextUtils.createAction('SET_STORE_LANGUAGES', languages),
    toggleTranslateMode: (toggle) => ContextUtils.createAction('TOGGLE_TRANSLATE_MODE', toggle),
    toggleCallIcon: (toggle) => ContextUtils.createAction('TOGGLE_SHOW_CALL_ICON', toggle),
    setPhoneNumber: (value) => ContextUtils.createAction('SET_PHONE_NUMBER', value),
    toggleStickyHeaderWebsite: (value) => ContextUtils.createAction('TOGGLE_STICKY_HEADER_WEBSITE', value),
    toggleStickyHeaderApplication: (value) => ContextUtils.createAction('TOGGLE_STICKY_HEADER_APPLICATION', value),
    setLockChangePage: (value) => ContextUtils.createAction('SET_LOCK_CHANGE_PAGE', value),
}

const reducer = (state, action) => {
    switch (action.type) {

        case 'ADD_NEW_COMPONENT': {
            let componentNewList = _.cloneDeep(state.componentList);
            componentNewList.push(action.payload);

            return {
                ...state,
                componentList: componentNewList
            }
        }
        case 'SET_THEME_ID': {
            return {
                ...state,
                themeId: action.payload
            }
        }
        case 'SET_PLATFORM': {
            return {
                ...state,
                platform: action.payload
            }
        }
        case 'SET_THEME_TYPE': {
            return {
                ...state,
                themeType: action.payload
            }
        }
        case 'SET_CURRENT_COMPONENT': {
            return {
                ...state,
                currentComponent: action.payload,
                settingTab: action.payload && action.payload.componentType ? ThemeEngineConstants.SETTING_TAB.ELEMENT_SETTING : ThemeEngineConstants.SETTING_TAB.ELEMENT_LIST
            }
        }
        case 'RETURN_CURRENT_COMPONENT': {
            return {
                ...state,
                returnComponent: action.payload,
                settingTab: ThemeEngineConstants.SETTING_TAB.ELEMENT_SETTING
            }
        }
        case 'SET_CURRENT_SUB_COMPONENT': {
            return {
                ...state,
                currentSubComponent: action.payload,
                settingTab: ThemeEngineConstants.SETTING_TAB.SUB_ELEMENT_SETTING
            }
        }
        case 'SET_SETTING_TAB': {
            return {
                ...state,
                settingTab: action.payload
            }
        }
        case 'SAVE_PAGE': {
            return {
                ...state,
                pageContent: action.payload
            }
        }
        case 'PUBLISH_PAGE': {
            return {
                ...state,
                pageContent: action.payload
            }
        }
        case 'SWITCH_EDIT_MODE': {
            return {
                ...state,
                editMode: action.payload
            }
        }
        case 'SET_PAGE': {
            return {
                ...state,
                currentComponent: null,
                returnComponent: null,
                page: action.payload
            }
        }
        case 'SET_IS_PREVIEW': {
            return {
                ...state,
                isPreview: action.payload
            }
        }
        case 'SET_EDITOR_CONTENT': {
            return {
                ...state,
                pageContent: action.payload
            }
        }
        case 'EDIT_ELEMENT_RETURN': {
            return {
                ...state,
                editElementReturn: action.payload
            }
        }
        case 'EDIT_SUB_ELEMENT_RETURN': {
            return {
                ...state,
                editSubElementReturn: action.payload
            }
        }
        case 'SET_SHOW_SLIDE_IN_POSITION': {
            return {
                ...state,
                showSlide: action.payload
            }
        }
        case 'SET_LIST_EDIT_PAGE': {
            return {
                ...state,
                listEditPages: action.payload
            }
        }
        case 'SET_STORE_PAGE_CONTENT': {
            return {
                ...state,
                storePageContent: action.payload
            }
        }
        case 'CHANGE_SHOP_LOGO': {
            return {
                ...state,
                changeLogo: action.payload
            }
        }
        case 'CHANGE_SHOP_FONT': {
            return {
                ...state,
                changeFont: action.payload
            }
        }
        case 'CHANGE_SHOP_COLOR_PRIMARY': {
            return {
                ...state,
                changeColorPrimary: action.payload
            }
        }
        case 'CHANGE_SHOP_COLOR_SECONDARY': {
            return {
                ...state,
                changeColorSecondary: action.payload
            }
        }
        case 'SET_REQUEST_ACTIVE_PAGE': {
            return {
                ...state,
                requestActivePage: action.payload
            }
        }
        case 'SET_SELECTED_STORE_LANGUAGE': {
            return {
                ...state,
                currentComponent: null,
                returnComponent: null,
                selectedStoreLang: action.payload
            }
        }
        case 'SET_STORE_LANGUAGES': {
            return {
                ...state,
                storeLanguages: action.payload
            }
        }
        case 'TOGGLE_TRANSLATE_MODE': {
            const updatedState = {
                ...state,
                controller: {
                    ...state.controller,
                    isTranslate: action.payload
                }
            }

            if (!state.storeLanguages.length) {
                return updatedState
            }

            if (!action.payload) {
                const initialLang = state.storeLanguages.find(lang => lang.isInitial)

                if (!initialLang) {
                    console.error('Initial store language not found')
                    return
                }

                updatedState.selectedStoreLang = initialLang
            } else {
                updatedState.selectedStoreLang = state.storeLanguages.filter(lang => !lang.isInitial)[0]
            }

            updatedState.currentComponent = null
            updatedState.returnComponent = null
            updatedState.platform = ThemeEngineConstants.PLATFORM_TYPE.DESKTOP

            return updatedState
        }
        case 'TOGGLE_SHOW_CALL_ICON': {
            return {
                ...state,
                enableCallIcon: action.payload
            }
        }
        case 'SET_PHONE_NUMBER': {
            return {
                ...state,
                phoneNumber: action.payload
            }
        }
        case 'TOGGLE_STICKY_HEADER_WEBSITE': {
            return {
                ...state,
                stickyHeaderWebsite: action.payload
            }
        }case 'TOGGLE_STICKY_HEADER_APPLICATION': {
            return {
                ...state,
                stickyHeaderApplication: action.payload
            }
        }
        case 'SET_LOCK_CHANGE_PAGE': {
            return {
                ...state,
                lockChangePage: action.payload
            }
        }
        default:
            return state;
    }
}

export const ThemeMakingContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions,
}
