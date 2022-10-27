import './SubElementEditorMenuTitle.sass';

import React, {useContext, useEffect, useRef, useState} from 'react'
import {bool, string} from "prop-types"
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import TextInput from "./shared/TextInput";
import CheckboxInput from "./shared/CheckboxInput";
import i18next from "i18next";
import ThemeEngineUtils from "../ThemeEngineUtils";
import InlineColorPicker from "./shared/InlineColorPicker";

const SubElementEditorMenuTitle = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, isDisplay, style, path, hash, index} = props

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

    const handleValue = (value) => {
        setStChange(change => ({
            ...change,
            value,
        }))
    }

    const handleDisplay = (isDisplay) => {
        if (state.controller.isTranslate) {
            return
        }

        setStChange(change => ({
            ...change,
            isDisplay
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
                <div className='sub-element-editor-menu-title'>
                    <div className='sub-element-editor-menu-title__name'>
                        <GSTrans t='component.themeEditor.menuTitle.title'/>
                    </div>
                </div>
                <div className='sub-element-editor-menu-title__body' data-index={index}>
                    <TextInput
                        rows={1}
                        options={{
                            showTitle: false
                        }}
                        defaultValue={value}
                        onChange={handleValue}
                    />
                    <div className={state.controller.isTranslate ? 'disabled' : ''}>
                        <CheckboxInput
                            title={i18next.t('component.themeEditor.menuTitle.display')}
                            defaultValue={isDisplay}
                            onChange={handleDisplay}
                        />
                        <InlineColorPicker
                            title={i18next.t('component.themeEditor.menuTitle.titleColor')}
                            defaultValue={style}
                            styleType='color'
                            onChange={handleStyle}
                        />
                        <InlineColorPicker
                            title={i18next.t('component.themeEditor.menuTitle.backgroundColor')}
                            defaultValue={style}
                            styleType='background-color'
                            onChange={handleStyle}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

SubElementEditorMenuTitle.defaultProps = {
    value: '',
    style: '',
    required: false,
    isDisplay: true,
}

SubElementEditorMenuTitle.propTypes = {
    value: string,
    required: bool,
    isDisplay: bool,
    style: string,
    path: string,
}

export default SubElementEditorMenuTitle