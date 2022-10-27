import React, {useContext} from 'react'
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {bool, string} from "prop-types";
import EmbeddedCodeInput from "./shared/EmbeddedCodeInput";
import ThemeEngineConstants from "../ThemeEngineConstants";
import ThemeEngineUtils from "../ThemeEngineUtils";

const SubElementEditorEmbeddedCode = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {value, codeType, required, _key, path, [ThemeEngineConstants.LOCALES]: locales} = props

    const getPreValidation = () => {
        if (!ThemeEngineConstants.CODE_TYPE.hasOwnProperty(codeType)) {
            return
        }

        return ThemeEngineConstants.CODE_TYPE[codeType].validate
    }

    const handleEmbeddedCode = (input) => {
        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: {
                ...ThemeEngineUtils.parseLocaleForTranslate({
                    valueKey: ThemeEngineConstants.VALUE_KEY,
                    oldValue: value,
                    newValue: input,
                    locales: locales,
                    translateLangCode: state.selectedStoreLang.langCode,
                    isTranslate: state.controller.isTranslate
                }),
                codeType,
            },
        }));
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
        <EmbeddedCodeInput title={_key}
                           defaultValue={getDefaultText()}
                           required={required}
                           preValidate={getPreValidation()}
                           codeType={codeType}
                           onChange={handleEmbeddedCode}/>
    )
}

SubElementEditorEmbeddedCode.defaultProps = {
    value: '',
    codeType: '',
    required: false,
    name: '',
}

SubElementEditorEmbeddedCode.propTypes = {
    value: string,
    codeType: string,
    required: bool,
    name: string,
    path: string,
}

export default SubElementEditorEmbeddedCode
