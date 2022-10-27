import React, {useContext, useEffect, useRef, useState} from 'react'
import BackgroundPicker from "./shared/BackgroundPicker";
import URLSelector from "./shared/URLSelector";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {arrayOf, bool, number, oneOfType, shape, string} from "prop-types";
import ThemeEngineUtils from "../ThemeEngineUtils";
import ThemeEngineConstants from "../ThemeEngineConstants";

const SubElementEditorImage = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {src, href, required, path, isStatic, sizes, [ThemeEngineConstants.LOCALES]: locales} = props

    const [stBanner, setStBanner] = useState({
        src,
        href
    })

    const refFirstChange = useRef(true)

    useEffect(() => {
        if (refFirstChange.current) {
            refFirstChange.current = false

            return
        }

        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: stBanner
        }));
    }, [stBanner])

    const handleBackground = (src) => {
        if (state.controller.isTranslate) {
            return
        }

        setStBanner(banner => ({
            ...banner,
            src,
        }))
    }

    const handleUrl = (input) => {
        setStBanner(banner => ({
            ...banner,
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
            <div className={state.controller.isTranslate ? 'disabled' : ''}>
                <BackgroundPicker required={required}
                                  defaultValue={src}
                                  sizes={sizes}
                                  onChange={handleBackground}/>
            </div>
            {!isStatic && <URLSelector defaultValue={getDefaultHref()} onChange={handleUrl}/>}
        </>
    )
}

SubElementEditorImage.defaultProps = {
    src: '',
    href: '',
    required: false,
    sizes: [],
    path: '',
}

SubElementEditorImage.propTypes = {
    src: string,
    href: string,
    required: bool,
    sizes: arrayOf(shape({
        width: oneOfType([number, string]),
        height: oneOfType([number, string]),
    })),
    path: string,
}

export default SubElementEditorImage