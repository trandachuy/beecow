import React, {useContext, useEffect, useRef, useState} from 'react'
import {bool, number, oneOfType, string} from "prop-types"
import CollectionSelector from "./shared/CollectionSelector";
import {ItemService} from "../../../../services/ItemService";
import {ThemeMakingContext} from "../context/ThemeMakingContext";

const SubElementEditorPagination = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, required, sizes, path} = props

    const [stChange, setStChange] = useState(value)
    const refFirstChange = useRef(true)

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

    const getCollection = () => {
        return sizes.split('|').map(size => ({
            label: size,
            value: size
        }))
    }

    const handleValue = (value) => {
        setStChange(change => ({
            ...change,
            value
        }))
    }

    return (
        <div className={state.controller.isTranslate ? 'disabled' : ''}>
            <CollectionSelector defaultValue={value}
                                collection={getCollection()}
                                required={required}
                                options={{showTitle: false}}
                                onChange={handleValue}/>
        </div>
    )
}

SubElementEditorPagination.defaultProps = {
    value: null,
    required: false,
}

SubElementEditorPagination.propTypes = {
    value: oneOfType([number, string]),
    required: bool,
    path: string,
}

export default SubElementEditorPagination