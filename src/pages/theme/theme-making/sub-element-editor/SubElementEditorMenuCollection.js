import React, {useContext, useEffect, useRef, useState} from 'react'
import {bool, number, oneOfType, string} from "prop-types"
import CollectionSelector from "./shared/CollectionSelector";
import {ItemService} from "../../../../services/ItemService";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import i18next from "i18next";

const SubElementEditorMenuCollection = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, _key, required, path} = props

    const [stChange, setStChange] = useState(value)
    const [stCollection, setStCollection] = useState([])

    const refFirstChange = useRef(true)

    useEffect(() => {
        ItemService.getAllMenus()
            .then(menus => {
                let collection = menus.map(menu => ({
                    label: menu.name,
                    value: menu.id,
                }))

                setStCollection(collection)
            })
    }, [])

    useEffect(() => {
        if (refFirstChange.current) {
            refFirstChange.current = false

            return
        }

        if (state.controller.isTranslate) {
            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: stChange,
        }));
    }, [stChange])

    const handleValue = (value) => {
        setStChange(change => ({
            ...change,
            value
        }))
    }

    return (
        <div className={state.controller.isTranslate ? 'disabled' : ''}>
            <CollectionSelector defaultValue={value}
                                title={i18next.t([`component.subElementEditorMenuCollection.title.${_key}`, _key])}
                                collection={stCollection}
                                required={required}
                                options={{
                                    showTitle: true,
                                    allowDeSelected: true
                                }}
                                onChange={handleValue}/>
        </div>
    )
}

SubElementEditorMenuCollection.defaultProps = {
    value: null,
    required: false,
}

SubElementEditorMenuCollection.propTypes = {
    value: oneOfType([number, string]),
    required: bool,
    path: string,
}

export default SubElementEditorMenuCollection