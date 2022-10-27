import React from 'react';
import ThemeEngineElements from './ThemeEngineElements';
import ThemeEngineConstants from './ThemeEngineConstants';

const ThemeEngineUtils = {
    parseValuesToEditor: (valueObject, schemaObject, path, componentHash) => {
        if (!schemaObject || !_.isObject(schemaObject)) {
            return
        }

        const { properties } = schemaObject

        return properties.map(({ key, type, ...others }, index) => {
            if (!ThemeEngineElements.hasOwnProperty(type)) {
                return
            }

            let valueProp
            let newPath = ''

            if (valueObject && valueObject.hasOwnProperty(key)) {
                valueProp = valueObject[key]
            }
            if (path) {
                newPath = path + '.' + key
            } else {
                newPath = key
            }

            return ThemeEngineElements[type].renderComponent(valueProp, {
                ...others,
                index,
                type,
                _key: key,
                path: newPath,
                total: properties.length,
                hash: componentHash
            })
        })
    },
    parseLocaleForTranslate: ({ valueKey, oldValue, newValue, locales, translateLangCode, isTranslate }) => {
        if (!isTranslate) {
            return locales
                ? {
                    [valueKey]: newValue,
                    [ThemeEngineConstants.LOCALES]: locales
                }
                : {
                    [valueKey]: newValue
                }
        }

        return {
            [valueKey]: oldValue,
            [ThemeEngineConstants.LOCALES]: {
                ...locales,
                [translateLangCode + '-' + valueKey]: newValue
            }
        }
    },
    mergeValueFromSchema: (schema, value) => {
        if (!schema || !_.isObject(schema)) {
            return
        }

        const { properties } = schema
        let emptyValue = {}

        properties.forEach(({ key, type, ...others }) => {
            if (!ThemeEngineElements.hasOwnProperty(type)) {
                return
            }

            let valueProp

            if (value && value.hasOwnProperty(key)) {
                valueProp = value[key]
            }

            emptyValue = {
                ...emptyValue,
                ...ThemeEngineElements[type].getDefaultValue(valueProp, {
                    ...others,
                    type,
                    key
                })
            }
        })

        return emptyValue
    },
    validateValueFromSchema: (schema, value) => {
        if (!schema || !_.isObject(schema)) {
            return
        }

        const { properties } = schema

        return properties.every(({ key, type, ...others }) => {
            if (!ThemeEngineElements.hasOwnProperty(type)) {
                return
            }

            let valueProp

            if (value && value.hasOwnProperty(key)) {
                valueProp = value[key]
            }

            return ThemeEngineElements[type].validate(valueProp, others)
        })
    },
    getDefaultLocaleByLanguage: ({ value, valueKey, locales, langCode, isTranslate }) => {
        const localeKey = langCode + '-' + valueKey

        if (!locales || !isTranslate || !locales.hasOwnProperty(localeKey)) {
            return value
        }

        return locales[localeKey]
    },
    /**
     * Get properties of string css
     * @param style, ex: 'font-weight: bold; color: #000000;'
     * @param styleKeys, ex: ['font-weight']
     * @returns {*}, ex: {'font-weight': 'bold'}
     */
    getStylesByKeys: (style, styleKeys) => {
        const regex = /([A-Za-z\-]+)[ \r\n\t:]+([#\w .\/()\-!':]+)?[;]?/gi
        let entries
        let result = {}

        while ((entries = regex.exec(style)) !== null) {
            let [, p1, p2 = ''] = entries

            if (_.includes(styleKeys, p1)) {
                result[p1] = p2
            }
        }

        return result
    },
    /**
     * Insert or update string css value
     * @param style, ex: 'font-weight: bold; color: #000000; background-color: #FFFFFF'
     * @param values, ex: 'font-weight: normal; text-align: center; background-color:;'
     * @returns '*', ex: 'font-weight: normal; text-align: center; color: #000000;'
     */
    upsertStyleByValues: (style = '', values) => {
        const regex = /([A-Za-z\-]+)[ \r\n\t:]+([#\w .\/()\-!':%]+)?[;]?/gi
        let value = {}
        let entries

        while ((entries = regex.exec(values)) !== null) {
            let [, p1, p2 = ''] = entries

            value[p1] = p2
        }

        if (_.isEmpty(value)) {
            return style
        }

        let result = style.replace(regex, (match, p1, p2 = '') => {
            if (value.hasOwnProperty(p1)) {
                const newValue = value[p1] ? `${ p1 }:${ value[p1] };` : ''

                delete value[p1]

                return newValue
            }

            return `${ p1 }:${ p2 };`
        })

        const newStyle = Object.keys(value)
            .filter(key => !!value[key])
            .map(key => `${ key }:${ value[key] };`)
            .join('')

        return result + newStyle
    },
    parseString: (value) => {
        if (value && _.isString(value)) {
            //try to parse value from string to object
            try {
                return JSON.parse(value)
            } catch (e) {
                console.log(e)

                return value
            }
        }

        return value
    },
    checkHTML: (html) => {
        if (!html) {
            return ''
        }

        // const parser = new DOMParser()
        // const doc = parser.parseFromString(html, 'application/xml');
        // let errorNode = doc.querySelector('parsererror');
        //
        // return errorNode?.innerText

        return ''
    },
    closingHtmlTag: (html) => {
        if (!html) {
            return ''
        }

        const regex = new RegExp(`(<(?:${ThemeEngineConstants.VOID_ELEMENTS.join('|')})[^>]*)(?<!\\/)>`, 'gmi')

        return html.replace(regex, '$1/>')
    },
    escape: (value) => {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    unescape: (value) => {
        return value
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, '\'');
    }
}

export default ThemeEngineUtils


