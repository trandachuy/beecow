/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 19/05/2020
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */

import './SubElementEditorMultiItemCollections.sass'
import React, {useContext, useEffect, useState} from 'react';
import {bool, number, oneOfType, string} from "prop-types";
import {ItemService} from "../../../../services/ItemService";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {t} from "i18next";
import ItemCollectionSelector from "./shared/ItemCollectionSelector";
import {TokenUtils} from "../../../../utils/token";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import ThemeEngineUtils from "../ThemeEngineUtils";

const COLLECTION_TYPE = {
    BUSINESS_PRODUCT: 'BUSINESS_PRODUCT',
    SERVICE: 'SERVICE',
}
const PRODUCT_COLLECTION_DEFAULT_VALUE = {
    NEWEST: 'NEWEST',
    DISCOUNT: 'DISCOUNT'
}
const SERVICE_COLLECTION_DEFAULT_VALUE = {
    NEWEST: 'NEWEST'
}
const COLLECTION_MODE = {
    EXACT: 'EXACT'
}

const chooseDefaultCollection = (collectionType) => {
    return collectionType === COLLECTION_TYPE.SERVICE
        ? SERVICE_COLLECTION_DEFAULT_VALUE
        : PRODUCT_COLLECTION_DEFAULT_VALUE
}

const SubElementEditorMultiItemCollections = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value = [], required, path, collectionList, hash, _key, colMode, colType} = props

    const getDefaultCollection = (collectionType) => {
        const defaultCollection = []

        if (collectionType !== colType || colMode !== COLLECTION_MODE.EXACT) {
            defaultCollection.push(...Object.keys(chooseDefaultCollection(collectionType)))
        }

        return defaultCollection.map(key => ({
            label: t(`component.themeEditor.subElement.collection.${key}.all`),
            value: key
        }))
    }

    const [stCollections, setStCollections] = useState({
        [COLLECTION_TYPE.BUSINESS_PRODUCT]: getDefaultCollection(COLLECTION_TYPE.BUSINESS_PRODUCT),
        [COLLECTION_TYPE.SERVICE]: getDefaultCollection(COLLECTION_TYPE.SERVICE)
    })

    useEffect(() => {
        if (!TokenUtils.hasThemeEnginePermission()) {
            return
        }

        Promise.all([
            ItemService.getCollectionsList(COLLECTION_TYPE.BUSINESS_PRODUCT),
            ItemService.getCollectionsList(COLLECTION_TYPE.SERVICE),
        ])
            .then(([productCollections, serviceCollections]) => {
                const filterProductCollection = productCollections.data.map(item => ({
                    label: item.name,
                    value: item.id,
                }))
                const filterServiceCollection = serviceCollections.data.map(item => ({
                    label: item.name,
                    value: item.id,
                }))

                setStCollections({
                    [COLLECTION_TYPE.BUSINESS_PRODUCT]: [
                        ...getDefaultCollection(COLLECTION_TYPE.BUSINESS_PRODUCT),
                        ...filterProductCollection
                    ],
                    [COLLECTION_TYPE.SERVICE]: [
                        ...getDefaultCollection(COLLECTION_TYPE.SERVICE),
                        ...filterServiceCollection
                    ]
                })
            })
    }, [])

    const handleTypeChange = (changes, path) => {
        if (state.controller.isTranslate) {
            return
        }

        const filterCollection = getFilterDuplicateCollection(stCollections[changes.collectionType], changes.collectionType)

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: {
                ...changes,
                value: filterCollection.length && filterCollection[0].value
            },
        }));
    }

    const handleValueChange = (changes, path) => {
        if (state.controller.isTranslate) {
            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: changes,
        }));
    }

    const handleAdd = () => {
        if (!TokenUtils.hasThemeEnginePermission() || state.controller.isTranslate) {
            return
        }

        const currentComponent = state.currentComponent
        const {componentSchema, componentValue = {}} = currentComponent

        if (!componentValue.hasOwnProperty(_key)) {
            componentValue[_key] = []
        }

        const filterCollection = getFilterDuplicateCollection(stCollections[COLLECTION_TYPE.BUSINESS_PRODUCT], COLLECTION_TYPE.BUSINESS_PRODUCT)

        componentValue[_key].push({
            collection: {
                collectionType: "BUSINESS_PRODUCT",
                type: "collection",
                value: !!filterCollection.length && filterCollection[0].value
            }
        })

        const newComponent = {
            ...currentComponent,
            componentValue: ThemeEngineUtils.mergeValueFromSchema(componentSchema, componentValue)
        }

        dispatch(ThemeMakingContext.actions.setReturnComponent(newComponent))
    }

    const handleDelete = (id) => {
        const currentComponent = state.currentComponent

        let componentValue = currentComponent.componentValue

        componentValue[_key].splice(id, 1)

        const newComponent = {
            ...currentComponent,
            componentValue: componentValue
        }

        dispatch(ThemeMakingContext.actions.setReturnComponent(newComponent))
    }

    const getCollectionTypes = () => {
        const collectionTypes = collectionList ? collectionList : Object.keys(COLLECTION_TYPE)

        return collectionTypes.map(key => ({
            label: t(`component.themeEditor.subElement.collectionType.${COLLECTION_TYPE[key]}`),
            value: COLLECTION_TYPE[key],
        }))
    }

    const getFilterDuplicateCollection = (collection, collectionType, defaultValue) => {
        const selectedCollection = value.filter(v => v.collection.collectionType === collectionType).map(v => v.collection.value)

        return collection.filter(c => !selectedCollection.includes(c.value) || c.value === defaultValue)
    }

    return (
        <div className={[
            'sub-element-editor-multi-item-collection',
            state.controller.isTranslate ? 'disabled' : ''
        ].join(' ')}>
            <div>
                {
                    value.map(({collection}, index) => (
                        <div className='d-flex'
                             key={hash + index}>
                            <ItemCollectionSelector
                                required={required}
                                defaultValue={{
                                    collectionType: collection.collectionType,
                                    value: collection.value
                                }}
                                collectionTypes={getCollectionTypes()}
                                collection={getFilterDuplicateCollection(stCollections[collection.collectionType], collection.collectionType, collection.value)}
                                options={{
                                    showTitle: !index,
                                    wrapperClassname: 'pb-0 w-100'
                                }}
                                onTypeChange={changes => handleTypeChange(changes, `${path}[${index}].collection`)}
                                onValueChange={changes => handleValueChange(changes, `${path}[${index}].collection`)}
                            />
                            {
                                value.length > 2 && <i className="fa fa-trash-o pr-2 delete" aria-hidden="true"
                                                       onClick={() => handleDelete(index)}></i>
                            }
                        </div>
                    ))
                }
            </div>
            <div className='p-3 d-flex justify-content-center'>
                <GSButton
                    outline
                    disabled={value.length >= 20 || !TokenUtils.hasThemeEnginePermission() || state.controller.isTranslate}
                    theme={GSButton.THEME.PRIMARY}
                    onClick={handleAdd}
                >
                    <GSTrans t='page.themeEngine.editor.button.addCollection'/>
                </GSButton>
            </div>
        </div>
    )
}

SubElementEditorMultiItemCollections.defaultProps = {
    value: [],
    required: false,
}

SubElementEditorMultiItemCollections.propTypes = {
    value: oneOfType([number, string]),
    required: bool,
    path: string,
}

export default SubElementEditorMultiItemCollections
