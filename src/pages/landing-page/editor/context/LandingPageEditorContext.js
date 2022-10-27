import React from 'react'
import {ContextUtils} from "../../../../utils/context";
import {LANDING_PAGE_ENUM} from "../../enum/LandingPageEnum";

const initState = {
    setting: {
        domainType: 'FREE',
        subDomainType: 'GOSELL',
        domainValue: '',
        customDomain: '',
        currentTemplate: '',
        currentTemplateHtmlId: '',
        title: '',
        description: '',
        customerTag: '',
        ggId: '',
        fbId: '',
        fbChatId: '',
        zlChatId: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        seoThumbnail:''
    },
    id: null,
    status: 'DRAFT',
    contentHtml: '',
    previewMode: LANDING_PAGE_ENUM.PREVIEW_MODE.WEB,
    selectedElement: null,
    primaryColor: '',
    imagePool: [],
    isSaving: false,
    isConfirmWhenRedirect: true,
    isShowSetting: true,
    popupSettingTime: 3,
    popupSettingShow: true,
    popupHasSetting: false,
}

const actions = {
    toggleSetting: () => ContextUtils.createAction('TOGGLE_SETTING'),
    setConfirmWhenRedirect: status => ContextUtils.createAction('SET_CONFIRM_WHEN_REDIRECT', status),
    setState: (type) => ContextUtils.createAction('SET_STATE', type),
    setDomainType: (type) => ContextUtils.createAction('SET_DOMAIN_TYPE', type),
    setSubDomainType: type => ContextUtils.createAction('SET_SUB_DOMAIN_TYPE', type),
    setDomainValue: value => ContextUtils.createAction('SET_DOMAIN_VALUE', value),
    setCustomDomain: value => ContextUtils.createAction('SET_CUSTOM_DOMAIN', value),
    setCurrentTemplate: value => ContextUtils.createAction('SET_CURRENT_TEMPLATE', value),
    setCurrentTemplateHtmlId: value => ContextUtils.createAction('SET_CURRENT_TEMPLATE_HTML_ID', value),
    setContentHtml: value => ContextUtils.createAction('SET_CONTENT_HTML', value),
    setPreviewMode: mode => ContextUtils.createAction('SET_PREVIEW_MODE', mode),
    setSelectedElement: element => ContextUtils.createAction('SET_SELECTED_ELEMENT', element),
    setPrimaryColor: color => ContextUtils.createAction('SET_PRIMARY_COLOR', color),
    setTitle: title => ContextUtils.createAction('SET_TITLE', title),
    setDescription: description => ContextUtils.createAction('SET_DESCRIPTION', description),
    setCustomerTag: customerTag => ContextUtils.createAction('SET_CUSTOMER_TAG', customerTag),
    addImageToPool: urlObj => ContextUtils.createAction('ADD_IMAGE_TO_POOL', urlObj),
    setSaving: isSaving => ContextUtils.createAction('SET_SAVING', isSaving),
    setStatus: status => ContextUtils.createAction('SET_STATUS', status),
    setId: id => ContextUtils.createAction('SET_ID', id),
    setSettingField: (fieldName, value) => ContextUtils.createAction('SET_SETTING_FIELD', {
        fieldName, value
    }),
    setPopupSettingTime: time => ContextUtils.createAction('SET_POPUP_SETTING_TIME', time),
    setPopupSettingShow: isShow => ContextUtils.createAction('SET_POPUP_SETTING_SHOW', isShow),
    setPopupHasSetting: isHasSetting => ContextUtils.createAction('SET_POPUP_HAS_SETTING', isHasSetting),
    setSeoThumbnail: seoThumbnail=>ContextUtils.createAction('SET_SEO_THUMBNAIL',seoThumbnail)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_SETTING_FIELD':
            const {fieldName, value} = action.payload
            return {
                ...state,
                setting: {
                    ...state.setting,
                    [fieldName]: value
                }
            }
        case 'TOGGLE_SETTING':
            return {
                ...state,
                isShowSetting: !state.isShowSetting
            }
        case 'SET_ID':
            return {
                ...state,
                id: action.payload
            }
        case 'SET_STATUS':
            return {
                ...state,
                status: action.payload
            }
        case 'SET_STATE':
            return {
                ...state,
                ...action.payload
            }
        case 'SET_CONFIRM_WHEN_REDIRECT':
            return {
                ...state,
                isConfirmWhenRedirect: action.payload
            }
        case 'SET_SAVING':
            return {
                ...state,
                isSaving: action.payload
            }
        case 'ADD_IMAGE_TO_POOL':
            return {
                ...state,
                imagePool: [...state.imagePool, action.payload]
            }
        case 'SET_CUSTOMER_TAG':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    customerTag: action.payload
                }
            }
        case 'SET_TITLE':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    title: action.payload
                }
            }
        case 'SET_DESCRIPTION':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    description: action.payload
                }
            }
        case 'SET_DOMAIN_TYPE':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    domainType: action.payload
                }
            }
        case 'SET_SUB_DOMAIN_TYPE':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    subDomainType: action.payload
                }
            }
        case 'SET_DOMAIN_VALUE':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    domainValue: action.payload
                }
            }
        case 'SET_CUSTOM_DOMAIN':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    customDomain: action.payload
                }
            }
        case 'SET_CURRENT_TEMPLATE':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    currentTemplate: action.payload
                }
            }
        case 'SET_CURRENT_TEMPLATE_HTML_ID':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    currentTemplateHtmlId: action.payload
                }
            }
        case 'SET_CONTENT_HTML':
            return {
                ...state,
                contentHtml: action.payload
            }
        case 'SET_PREVIEW_MODE':
            return {
                ...state,
                previewMode: action.payload
            }
        case 'SET_SELECTED_ELEMENT':
            return {
                ...state,
                selectedElement: action.payload
            }
        case 'SET_PRIMARY_COLOR':
            return {
                ...state,
                primaryColor: action.payload
            }
        case 'SET_POPUP_SETTING_TIME':
            return {
                ...state,
                popupSettingTime: action.payload
            }
        case 'SET_POPUP_SETTING_SHOW':
            return {
                ...state,
                popupSettingShow: action.payload
            }
        case 'SET_POPUP_HAS_SETTING':
            return {
                ...state,
                popupHasSetting: action.payload
            }
        case 'SET_SEO_THUMBNAIL':
            return {
                ...state,
                setting: {
                    ...state.setting,
                    seoThumbnail: action.payload
                }
            }
    }
}

const context = React.createContext(initState)



export const LandingPageEditorContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions
}
