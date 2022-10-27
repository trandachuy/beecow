import React, {useContext, useEffect, useRef, useState} from 'react'
import TextInput from "./shared/TextInput";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import FontStyleCollection1 from "./shared/FontStyleCollection1";
import TextColorPicker from "./shared/TextColorPicker";
import BackgroundColorPicker from "./shared/BackgroundColorPicker";
import URLSelector from "./shared/URLSelector";
import {bool, string} from "prop-types";
import ThemeEngineUtils from "../ThemeEngineUtils";
import ThemeEngineConstants from "../ThemeEngineConstants";

const SubElementEditorLink = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {
        value, style, href, required, path,
        [ThemeEngineConstants.LOCALES]: locales,
    } = props

    const [stText, setStText] = useState({
        value,
        style,
        href,
    })

    const refFirstChange = useRef(true)

    useEffect(() => {
        if (refFirstChange.current) {
            refFirstChange.current = false

            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: stText,
        }));
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

    const handleLink = (input) => {
        setStText(text => ({
            ...text,
            ...ThemeEngineUtils.parseLocaleForTranslate({
                valueKey: ThemeEngineConstants.HREF_KEY,
                oldValue: href,
                newValue: input,
                locales: locales,
                translateLangCode: state.selectedStoreLang.langCode,
                isTranslate: state.controller.isTranslate
            }),
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

    const getDefaultHref = () => {
        return ThemeEngineUtils.getDefaultLocaleByLanguage({
            value: href,
            valueKey: ThemeEngineConstants.HREF_KEY,
            locales: locales,
            langCode: state.selectedStoreLang.langCode,
            isTranslate: state.controller.isTranslate
        })
    }

    return (
        <>
            <TextInput required={required} defaultValue={getDefaultText()} rows={1} onChange={handleText}/>
            <div className={state.controller.isTranslate ? 'disabled' : ''}>
                <FontStyleCollection1 defaultValue={style} onChange={handleStyle}/>
                <TextColorPicker defaultValue={style} onChange={handleStyle}/>
                <div className='sub-element-editor__indicator'/>
                <BackgroundColorPicker defaultValue={style} onChange={handleStyle}/>
            </div>
            <URLSelector defaultValue={getDefaultHref()} onChange={handleLink}/>
        </>
    )
}

SubElementEditorLink.defaultProps = {
    value: '',
    style: '',
    href: '',
    required: false,
}

SubElementEditorLink.propTypes = {
    value: string,
    style: string,
    href: string,
    required: bool,
    path: string,
}

export default SubElementEditorLink