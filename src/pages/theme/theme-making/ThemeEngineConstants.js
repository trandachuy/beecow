const ValidateRegex = {
    getValidTagRegex: (tag) => new RegExp(`&lt;${tag}(?!&gt;.)?([\\s\\S]*?)&lt;\\/${tag}&gt;`, 'gi'),
    getAnyTagRegex: () => new RegExp('&lt;([\\w ]*)&gt;', 'gi')
}

//return true for valid and false for invalid
const ThemeEngineConstants = {
    CODE_TYPE: {
        MAP: {
            id: 'MAP',
            validate: (value) => {
                const regex = ValidateRegex.getAnyTagRegex()
                let entries
                let valid = true
                const escapeValue = escape(value)

                while ((entries = regex.exec(escapeValue)) !== null) {
                    let [, p1] = entries
                    const clean = p1.trim().toLowerCase()

                    if (clean !== 'iframe') {
                        valid = false
                    }
                }

                const match = escapeValue.match(ValidateRegex.getValidTagRegex('iframe'))

                if (!match || match.length !== 1) {
                    valid = false
                }

                return valid
            }
        },
        FREE_HTML: {
            id: 'FREE_HTML',
            validate: (value) => {
                return !ValidateRegex.getValidTagRegex('script').test(value)
            }
        }
    },

    ELEMENT_TYPE: {
        BREADCRUMB: 'BREADCRUMB',
        MAIN_BANNER: 'MAIN_BANNER',
        MAIN_MENU: 'MAIN_MENU',
        SLIDER: 'SLIDER',
        HEADER: 'HEADER',
        FOOTER: 'FOOTER',
        FREE_HTML: 'FREE_HTML',
        PRODUCT_BUYING: 'PRODUCT_BUYING',
        SERVICE_BOOKING: 'SERVICE_BOOKING',
        CUSTOM_PAGE: 'custom_page_element',
        PRODUCT_COLLECTION_LIST:'PRODUCT_COLLECTION_LIST',
        SERVICE_COLLECTION_LIST:'SERVICE_COLLECTION_LIST'
    },

    PAGE_TYPE: {
        DEFAULT: 'DEFAULT',
        CUSTOM: 'CUSTOM_PAGE'
    },

    SUB_ELEMENT_TYPE: {
        MENU: 'MENU',
        TEXT: 'TEXT',
        COLLECTION: 'COLLECTION',
        IMAGE: 'IMAGE',
        BANNER: 'BANNER',
        BUTTON: 'BUTTON',
        COLOR_PICKER: 'COLOR_PICKER',
        PRODUCT: 'PRODUCT'
    },

    PLATFORM_TYPE: {
        DESKTOP: 'DESKTOP',
        RESPONSIVE: 'RESPONSIVE',
        MOBILE: 'MOBILE'
    },

    THEME_TYPE: {
        MASTER: 'master',
        STORE: 'store'
    },

    SETTING_TAB: {
        GENERAL_SETTING: 'GENERAL_SETTING',
        ELEMENT_LIST: 'ELEMENT_LIST',
        ELEMENT_SETTING: 'ELEMENT_SETTING',
        SUB_ELEMENT_SETTING: 'SUB_ELEMENT_SETTING',
        HELP: 'HELP',
        TRANSLATE_HINT: 'TRANSLATE_HINT'
    },

    EDITOR_CONSTANT: {
        COMP_UNIQUE_KEY: 'data-gs-component-local-key',
        ATTR_COMP_NEW_SECTION_KEY: 'gs-component-add-local-section',
        ATTR_COMP_NEW_SECTION_VALUE: 'new-section',
        COMMENT_START_VALUE: '/* editor-comments-for-edit',
        COMMENT_END_VALUE: '*/',
        IFRAME_KEY: {
            DISABLED_EVENTS_CLASS: 'gs-html-editor-disabled-events',
            ACTIVE_COMPONENT_CLASS: 'gs-html-editor-active',
            ADD_NEW_COMPONENT_CLASS: 'gs-html-editor-new-section',
            SLIDER_KEY_ATTR_NAME: 'data-slider-ui-key',
            SLIDER_CONTAINER_CLASS: 'GosellSlideContainer'
        },
        SSR_KEY: {
            FRAGMENT_KEY: 'layout',
            NEW_LOCAL_COMPONENT_VALUE: 'new_element',
            COMPONENT_KEY: 'cp',
            COMPONENT_TYPE: 'cptype',
            COMPONENT_DATA_TYPE: 'cpdatatype',
            COMPONENT_STYLE: 'cpstyle',
            COMPONENT_SCHEMA_KEY: 'cpschema',
            COMPONENT_HASH: 'cphash',
            COMPONENT_DATA_MOCK_VALUE_KEY: 'cpdefaultvalue',
            COMPONENT_DATA_VALUE_KEY: 'cpvalue',
            COMPONENT_MOCK_VALUE_KEY: 'cpmockvalue',
            COMPONENT_ELEMENT_TYPE: 'eltype',
            COMPONENT_ELEMENT_VALUE: 'elvalue',
            COMPONENT_ELEMENT: 'el',
            COMPONENT_IF_IN_MOCK: 'dmock',
            SHOW_ON_LOCATIONS: 'dlocs',
            REMOVE_ON_LOCATIONS: 'hlocs',
            LOCATION_MODE: 'locmode',
            LOCATION_PLATFORM: 'locplatform',
            PLATFORM_VISIBLE: 'platformvisible',
            COMPONENT_ACTIONS: 'cpactions'
        }
    },
    LOCALES: 'L0c@l3s',
    VALUE_KEY: 'value',
    HREF_KEY: 'href',
    PRE_REMOVABLE_LINKS: [
        'https://ssr.gosell.vn',
        'https://ssr.unisell.vn',
        'https://ssr-resource-staging.unisell.vn',
        'https://ssr-resource-dev.gosell.vn',
        'https://ssr-resource-prod.gosell.vn',
        'https://ssr-pub.unisell.vn',
        'https://ssr-pub.gosell.vn',
        'https://ssr.mediastep.ca',
        'https://ssr.mediastep.com'
    ],
    VOID_ELEMENTS: ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']
}

export default ThemeEngineConstants