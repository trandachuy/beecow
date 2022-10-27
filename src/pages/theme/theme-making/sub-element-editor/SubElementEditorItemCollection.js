import React, {useContext, useEffect, useState} from 'react';
import {bool, number, oneOfType, string} from "prop-types";
import {ItemService} from "../../../../services/ItemService";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {t} from "i18next";
import ItemCollectionSelector from "./shared/ItemCollectionSelector";
import {TokenUtils} from "../../../../utils/token";

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
const chooseDefaultCollection = (collectionType) => {
    return collectionType === COLLECTION_TYPE.SERVICE
        ? SERVICE_COLLECTION_DEFAULT_VALUE
        : PRODUCT_COLLECTION_DEFAULT_VALUE;
}

const SubElementEditorItemCollection = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, collectionType, required, path, collectionList} = props

    const getDefaultCollection = (collectionType) => {
        const defaultCollection = chooseDefaultCollection(collectionType);

        return Object.keys(defaultCollection).map(key => ({
            label: t(`component.themeEditor.subElement.collection.${key}.all`),
            value: key
        }))
    }

    const [stCollection, setStCollection] = useState(getDefaultCollection(collectionType))

    useEffect(() => {
        if (!collectionType || !TokenUtils.hasThemeEnginePermission()) {
            return
        }

        ItemService.getCollectionsList(collectionType)
            .then(({data}) => {
                let userCollection = data.map(item => ({
                    label: item.name,
                    value: item.id,
                }))

                setStCollection([
                    ...getDefaultCollection(collectionType),
                    ...userCollection
                ])
            })
    }, [collectionType])

    const handleChange = (changes) => {
        if (state.controller.isTranslate) {
            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes,
        }));
    }

    const getCollectionTypes = () => {
        const collectionTypes = collectionList || Object.keys(COLLECTION_TYPE)

        return collectionTypes.map(key => ({
            label: t(`component.themeEditor.subElement.collectionType.${COLLECTION_TYPE[key]}`),
            value: COLLECTION_TYPE[key],
        }))
    }

    return (
        <div className={state.controller.isTranslate ? 'disabled' : ''}>
            <ItemCollectionSelector
                required={required}
                defaultValue={{collectionType, value}}
                collectionTypes={getCollectionTypes()}
                collection={stCollection}
                onTypeChange={handleChange}
                onValueChange={handleChange}
            />
        </div>
    )
}

SubElementEditorItemCollection.defaultProps = {
    collectionType: COLLECTION_TYPE.BUSINESS_PRODUCT,
    value: '',
    required: false,
}

SubElementEditorItemCollection.propTypes = {
    value: oneOfType([number, string]),
    collectionType: string,
    required: bool,
    path: string,
}

export default SubElementEditorItemCollection
