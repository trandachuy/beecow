import React, {useContext, useEffect, useRef, useState} from 'react'
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {bool, string} from "prop-types";
import TextInput from "./shared/TextInput";
import FontSelector from "./shared/FontSelector";
import FontStyleCollection1 from "./shared/FontStyleCollection1";
import ThemeEngineUtils from "../ThemeEngineUtils";
import TextColorPicker from "./shared/TextColorPicker";
import BackgroundColorPicker from "./shared/BackgroundColorPicker";
import ThemeEngineConstants from "../ThemeEngineConstants";

const SubElementEditorText = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, style, required, path, [ThemeEngineConstants.LOCALES]: locales} = props

    const [stText, setStText] = useState({
        value: value,
        style: style,
    })

    const refFirstChange = useRef(true)

    useEffect(() => {
        if (refFirstChange.current) {
            refFirstChange.current = false

            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: stText
        }))
    }, [stText])

    const handleText = (input) => {
        setStText(text => ({
            ...text,
            ...ThemeEngineUtils.parseLocaleForTranslate({
                valueKey: ThemeEngineConstants.VALUE_KEY,
                oldValue: value,
                newValue: input,
                locales: locales,
                translateLangCode: state.selectedStoreLang.langCode,
                isTranslate: state.controller.isTranslate
            }),
        }))
    }

    const handleStyle = (changes) => {
        if (state.controller.isTranslate) {
            return
        }

        setStText(text => ({
            ...text,
            style: ThemeEngineUtils.upsertStyleByValues(text.style, changes)
        }))
    }

    const getDefaultText = () => {
        return ThemeEngineUtils.getDefaultLocaleByLanguage({
            value,
            valueKey: ThemeEngineConstants.VALUE_KEY,
            locales: locales,
            langCode: state.selectedStoreLang.langCode,
            isTranslate: state.controller.isTranslate
        })
    }

    return (
        <>
            <TextInput required={required} defaultValue={getDefaultText()} onChange={handleText}/>
            <div className={state.controller.isTranslate ? 'disabled' : ''}>
                <FontSelector disabled={state.controller.isTranslate} defaultValue={style} onChange={handleStyle}/>
                <FontStyleCollection1 disabled={state.controller.isTranslate} defaultValue={style}
                                      onChange={handleStyle}/>
                <TextColorPicker disabled={state.controller.isTranslate} defaultValue={style} onChange={handleStyle}/>
                <div className='sub-element-editor__indicator'/>
                <BackgroundColorPicker disabled={state.controller.isTranslate} defaultValue={style}
                                       onChange={handleStyle}/>
            </div>
        </>
    )
}

SubElementEditorText.defaultProps = {
    value: '',
    style: '',
    required: false,
    path: '',
}

SubElementEditorText.propTypes = {
    value: string,
    style: string,
    required: bool,
    path: string,
}

export default SubElementEditorText