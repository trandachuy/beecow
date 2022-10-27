import React from 'react'
import ThemeEngineUtils from './ThemeEngineUtils'
import ThemeEngineConstants from './ThemeEngineConstants'

import SubElementEditorWrapper from './sub-element-editor/SubElementEditorWrapper'
import SubElementEditorText from './sub-element-editor/SubElementEditorText'
import SubElementEditorImage from './sub-element-editor/SubElementEditorImage'
import SubElementEditorLink from './sub-element-editor/SubElementEditorLink'
import SubElementEditorItemCollection from './sub-element-editor/SubElementEditorItemCollection'
import SubElementEditorMenuCollection from './sub-element-editor/SubElementEditorMenuCollection'
import SubElementEditorEmbeddedCode from './sub-element-editor/SubElementEditorEmbeddedCode'
import SubElementEditorMenu from './sub-element-editor/SubElementEditorMenu'
import SubElementBlogCategorySelect from './sub-element-editor/SubElementBlogCategorySelect'
import SubElementFlashSaleDates from './sub-element-editor/SubElementFlashSaleDates'
import SubElementEditorArray from './sub-element-editor/SubElementEditorArray'
import SubElementEditorObject from './sub-element-editor/SubElementEditorObject'
import SubElementEditorMultiItemCollections from './sub-element-editor/SubElementEditorMultiItemCollections'
import SubElementEditorPagination from './sub-element-editor/SubElementEditorPagination'
import SubElementEditorDynamicMenu from './sub-element-editor/SubElementEditorDynamicMenu'
import SubElementEditorMenuTitle from './sub-element-editor/SubElementEditorMenuTitle'
import SubElementEditorMenuItems from './sub-element-editor/SubElementEditorMenuItems'
import SubElementEditorSubMenu from './sub-element-editor/SubElementEditorSubMenu'
import SubElementEditorSliderBanner from './sub-element-editor/SubElementEditorSliderBanner'

//validate return true for valid and false for invalid
const ThemeEngineElements = {
    text: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorText { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            const defaultValue = {
                [key]: {
                    value: value.value || '',
                    style: value.style || '',
                    type
                }
            }

            if (value.hasOwnProperty(ThemeEngineConstants.LOCALES)) {
                defaultValue[key][ThemeEngineConstants.LOCALES] = value[ThemeEngineConstants.LOCALES]
            }

            return defaultValue
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isString(value.value) && !_.isEmpty(value.value.trim())
        }
    },
    img: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorImage { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            const defaultValue = {
                [key]: {
                    src: value.src || '',
                    href: value.href || '',
                    alt: value.alt || '',
                    type
                }
            }

            if (value.hasOwnProperty(ThemeEngineConstants.LOCALES)) {
                defaultValue[key][ThemeEngineConstants.LOCALES] = value[ThemeEngineConstants.LOCALES]
            }

            return defaultValue
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.src && _.isString(value.src) && !_.isEmpty(value.src.trim())
        }
    },
    link: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorLink { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            const defaultValue = {
                [key]: {
                    value: value.value || '',
                    style: value.style || '',
                    href: value.href || '',
                    type
                }
            }

            if (value.hasOwnProperty(ThemeEngineConstants.LOCALES)) {
                defaultValue[key][ThemeEngineConstants.LOCALES] = value[ThemeEngineConstants.LOCALES]
            }

            return defaultValue
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isString(value.value) && !_.isEmpty(value.value.trim())
        }
    },
    collection: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorItemCollection { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    value: value.value || '',
                    collectionType: value.collectionType || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && (_.isNumber(value.value) || (_.isString(value.value) && !_.isEmpty(value.value.trim())))
        }
    },
    menu_collection: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorMenuCollection key={ options.hash + options.index } { ...props } { ...options }/>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    value: value.value || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isNumber(value.value)
        }
    },
    item_collections: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorMultiItemCollections value={ props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = [{}], { key, type }) {
            return {
                [key]: value.map(({ collection }) => ({
                    collection: {
                        value: collection?.value || '',
                        collectionType: collection?.collectionType || '',
                        type: collection?.type
                    }
                }))
            }
        },
        validate: function (value = [{}], { required }) {
            if (!required) {
                return true
            }

            return value.every(v => v.value && (_.isNumber(v.value) || (_.isString(v.value) && !_.isEmpty(v.value.trim()))))
        }
    },
    embedded_code: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorEmbeddedCode { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            const defaultValue = {
                [key]: {
                    value: value.value || '',
                    codeType: value.codeType || '',
                    type
                }
            }

            if (value.hasOwnProperty(ThemeEngineConstants.LOCALES)) {
                defaultValue[key][ThemeEngineConstants.LOCALES] = value[ThemeEngineConstants.LOCALES]
            }

            return defaultValue
        },
        validate: function (value = {}, { required }) {
            const escapeValue = escape(value.value)

            if (ThemeEngineConstants.CODE_TYPE.hasOwnProperty(value.codeType) && !ThemeEngineConstants.CODE_TYPE[value.codeType].validate(value.value)) {
                return false
            }

            if (!required) {
                return true
            }

            return escapeValue && _.isString(escapeValue) && !_.isEmpty(escapeValue.trim())
        }
    },
    main_menu: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorMenu { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    title: value.title || '',
                    value: value.value || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value
        }
    },
    blog_category: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementBlogCategorySelect { ...props } { ...options } />
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    value: value.value || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && (_.isNumber(value.value) || (_.isString(value.value) && !_.isEmpty(value.value.trim())))
        }
    },
    flash_sale_dates: {
        renderComponent: (props, options) => {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementFlashSaleDates { ...props } { ...options } />
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: (value = {}, { key, type }) => {
            return {
                [key]: {
                    value: value.value || '',
                    type,
                    itemsPerSlide: value.itemsPerSlide || 6,
                    dates: value.dates || [],
                    labelColor: value.labelColor || '#000000',
                    soldBarColor: value.soldBarColor || '#00000050',
                    isDisplaySold: value.isDisplaySold || true
                }
            }
        },
        validate: (value = {}, { required }) => {
            if (!required) {
                return true
            }
            return value.value && (_.isNumber(value.value) || (_.isString(value.value) && !_.isEmpty(value.value.trim())))
        }
    },
    pagination: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorPagination { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    value: value.value || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isNumber(value.value)
        }
    },
    dynamic_menu: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorDynamicMenu { ...props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = {}, { key, properties }) {
            return {
                [key]: {
                    value: value.value,
                    ...ThemeEngineUtils.mergeValueFromSchema({ properties }, value)
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isNumber(value.value)
        }
    },
    menu_title: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorMenuTitle key={ options.hash + options.index } { ...props } { ...options }/>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    isDisplay: !!value.isDisplay,
                    style: value.style || '',
                    value: value.value || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isNumber(value.value)
        }
    },
    menu_items: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorMenuItems key={ options.hash + options.index } { ...props } { ...options }/>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    style: value.style || '',
                    hoverColor: value.hoverColor || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isNumber(value.value)
        }
    },
    sub_menu: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorSubMenu key={ options.hash + options.index } { ...props } { ...options }/>
            )
        },
        getDefaultValue: function (value = {}, { key, type }) {
            return {
                [key]: {
                    style: value.style || '',
                    hoverColor: value.hoverColor || '',
                    type
                }
            }
        },
        validate: function (value = {}, { required }) {
            if (!required) {
                return true
            }

            return value.value && _.isNumber(value.value)
        }
    },
    slider_banner: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorWrapper key={ options.hash + options.index } { ...options }>
                    <SubElementEditorSliderBanner value={ props } { ...options }/>
                </SubElementEditorWrapper>
            )
        },
        getDefaultValue: function (value = [{}], { key, items }) {
            const { properties } = items

            return {
                [key]: value.map(item => ({
                    ...ThemeEngineUtils.mergeValueFromSchema({ properties }, item)
                }))
            }
        },
        validate: function (value = [{}], { items }) {
            const { properties } = items

            return value.every(item => {
                return ThemeEngineUtils.validateValueFromSchema({ properties }, item)
            })
        }
    },
    array: {
        renderComponent: function (props, options) {
            return (
                <SubElementEditorArray key={ options.hash + options.index } value={ props } { ...options }/>
            )
        },
        getDefaultValue: function (value = [{}], { key, items }) {
            const { properties } = items

            return {
                [key]: value.map(item => ({
                    ...ThemeEngineUtils.mergeValueFromSchema({ properties }, item)
                }))
            }
        },
        validate: function (value = [{}], { items }) {
            const { properties } = items

            return value.every(item => {
                return ThemeEngineUtils.validateValueFromSchema({ properties }, item)
            })
        }
    },
    object: {
        renderComponent: function (props, options) {
            if (options.total === 1) {
                const { properties, path } = options

                return ThemeEngineUtils.parseValuesToEditor(props, { properties }, path, options.hash + options.index)
            }

            return (
                <SubElementEditorObject key={ options.hash + options.index } value={ props } { ...options }/>
            )
        },
        getDefaultValue: function (value = {}, { key, properties }) {
            return {
                [key]: { ...ThemeEngineUtils.mergeValueFromSchema({ properties }, value) }
            }
        },
        validate: function (value = {}, { properties }) {
            return ThemeEngineUtils.validateValueFromSchema({ properties }, value)
        }
    }
}

export default ThemeEngineElements