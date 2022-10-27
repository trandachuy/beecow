import './SubElementEditorSubMenu.sass';

import React, {useContext, useEffect, useRef, useState} from 'react'
import {bool, string} from "prop-types"
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import ThemeEngineUtils from "../ThemeEngineUtils";
import InlineColorPicker from "./shared/InlineColorPicker";

const SubElementEditorSubMenu = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {hoverColor, style, path, hash, index} = props

    const [stChange, setStChange] = useState()

    const refFirstChange = useRef(true)

    useEffect(() => {
        if (refFirstChange.current) {
            refFirstChange.current = false

            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: stChange,
        }));
    }, [stChange])

    const handleHoverColor = (hoverColor) => {
        if (state.controller.isTranslate) {
            return
        }

        setStChange(change => ({
            ...change,
            hoverColor: hoverColor,
        }))
    }

    const handleStyle = (_style) => {
        if (state.controller.isTranslate) {
            return
        }

        setStChange(change => ({
            ...change,
            style: ThemeEngineUtils.upsertStyleByValues(style, _style)
        }))
    }

    return (
        <>
            <div key={hash + index}>
                <div className='sub-element-editor-sub-menu'>
                    <div className='sub-element-editor-sub-menu__name'>
                        <GSTrans t='component.themeEditor.subMenu.title'/>
                    </div>
                </div>
                <div className={[
                    'sub-element-editor-menu-items__body',
                    state.controller.isTranslate ? 'disabled' : ''
                ].join(' ')} data-index={index}>
                    <InlineColorPicker
                        title={i18next.t('component.themeEditor.subMenu.backgroundColor')}
                        defaultValue={style}
                        styleType='background-color'
                        onChange={handleStyle}
                    />
                    <InlineColorPicker
                        title={i18next.t('component.themeEditor.subMenu.textColor')}
                        defaultValue={style}
                        styleType='color'
                        onChange={handleStyle}
                    />
                    <InlineColorPicker
                        title={i18next.t('component.themeEditor.subMenu.textHoverColor')}
                        defaultValue={hoverColor}
                        styleType='color'
                        onChange={handleHoverColor}
                    />
                </div>
            </div>
        </>
    )
}

SubElementEditorSubMenu.defaultProps = {
    hoverColor: '',
    required: false,
}

SubElementEditorSubMenu.propTypes = {
    hoverColor: string,
    required: bool,
    path: string,
}

export default SubElementEditorSubMenu