import './ElementEditor.sass'

import React, {useContext, useEffect} from 'react';
import {object, oneOfType, string} from "prop-types";
import ElementEditorCommonBackground from "./ElementEditorCommonBackground";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import ElementEditorCommonColor from "./ElementEditorCommonColor";
import ThemeEngineUtils from '../ThemeEngineUtils'

const ElementEditor = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)

    const {componentType, componentValue, componentSchema, componentHash} = props.currentComponent

    useEffect(() => {
        if (!state.editSubElementReturn) {
            return
        }

        const {path, changes} = state.editSubElementReturn
        const mergedComponentValue = ThemeEngineUtils.mergeValueFromSchema(componentSchema, componentValue)
        const updatedValue = _.update(mergedComponentValue, path, current => ({
            ...current,
            ...changes
        }))

        dispatch(ThemeMakingContext.actions.setReturnComponent({
            componentType,
            componentSchema,
            componentValue: updatedValue,
        }))
    }, [state.editSubElementReturn])

    return (
        <div className="element-editor">
            <ElementEditorCommonBackground disabled={state.controller.isTranslate}
                                           currentComponent={props.currentComponent}/>
            <ElementEditorCommonColor disabled={state.controller.isTranslate}
                                      currentComponent={props.currentComponent}/>
            {
                ThemeEngineUtils.parseValuesToEditor(
                    componentValue,
                    componentSchema,
                    null,
                    componentHash)
            }
        </div>
    )
}

ElementEditor.propTypes = {
    componentValue: oneOfType([string, object]),
    componentSchema: oneOfType([string, object]),
}

export default ElementEditor
