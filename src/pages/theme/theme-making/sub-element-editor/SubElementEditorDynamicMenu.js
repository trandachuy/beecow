import React, {useContext, useEffect, useRef, useState} from 'react'
import {bool, number, oneOfType, string} from "prop-types"
import CollectionSelector from "./shared/CollectionSelector";
import {ItemService} from "../../../../services/ItemService";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import ThemeEngineUtils from "../ThemeEngineUtils";
import menuService from "../../../../services/MenuService";
import authenticate from "../../../../services/authenticate";
import {CredentialUtils} from "../../../../utils/credential";
import {GSToast} from "../../../../utils/gs-toast";

const DEFAULT_MENU_NAME = 'Default Menu'

const SubElementEditorDynamicMenu = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, properties, required, path, hash, index} = props

    const [stChange, setStChange] = useState()
    const [stMenus, setStMenus] = useState([])
    const [stDefaultMenuId, setStDefaultMenuId] = useState()

    const refFirstChange = useRef(true)

    useEffect(() => {
        const sellerId = CredentialUtils.getStoreId()

        menuService.getMenuByBcStoreIdByPage({
            sellerId,
            page: 0,
            size: 1000
        })
            .then(({data}) => {
                if (!data.length) {
                    return
                }

                let defaultMenuId = data[0].id
                const menus = data.map(menu => {
                    if (menu.name === DEFAULT_MENU_NAME) {
                        defaultMenuId = menu.id
                    }

                    return {
                        label: menu.name,
                        value: menu.id
                    }
                })

                setStDefaultMenuId(defaultMenuId)
                setStMenus(menus)
            })
            .catch(e => {
                console.error(e)
                GSToast.commonError()
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
        <>
            <div className={state.controller.isTranslate ? 'disabled' : ''}>
                <CollectionSelector defaultValue={value || stDefaultMenuId}
                                    collection={stMenus}
                                    required={required}
                                    options={{showTitle: false}}
                                    onChange={handleValue}/>
            </div>
            {ThemeEngineUtils.parseValuesToEditor(props, {properties}, path, hash + index)}
        </>
    )
}

SubElementEditorDynamicMenu.defaultProps = {
    required: false,
}

SubElementEditorDynamicMenu.propTypes = {
    value: number,
    required: bool,
    path: string,
}

export default SubElementEditorDynamicMenu