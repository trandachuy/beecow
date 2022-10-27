import './SubElementEditorArray.sass'

import React, {useContext} from 'react'
import GSDropDownButton, {GSDropdownItem} from "../../../../components/shared/GSButton/DropDown/GSDropdownButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import ThemeEngineUtils from "../ThemeEngineUtils";
import {array, shape, string} from "prop-types";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {TokenUtils} from "../../../../utils/token";
import $ from 'jquery'

const SubElementEditorArray = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context)
    const {value = [], items, _key, path, hash} = props

    const handleAdd = () => {
        if (!TokenUtils.hasThemeEnginePermission() || state.controller.isTranslate) {
            return
        }

        const currentComponent = state.currentComponent
        const {componentSchema, componentValue = {}} = currentComponent

        if (!componentValue.hasOwnProperty(_key)) {
            componentValue[_key] = []
        }
        componentValue[_key].push({})

        const newComponent = {
            ...currentComponent,
            componentValue: ThemeEngineUtils.mergeValueFromSchema(componentSchema, componentValue)
        }

        dispatch(ThemeMakingContext.actions.setReturnComponent(newComponent))
    }

    const handleToggle = (id) => {
        const collapseDropdownEls = $(`.sub-element-editor-array__dropdown:not([data-index=${id}])`)
        const expandDropdownEls = $(`.sub-element-editor-array__dropdown[data-index=${id}]`)

        collapseDropdownEls.each(function () {
            if ($(this).css('display') != 'none') {
                $(this).slideToggle('fast')
            }
        })

        expandDropdownEls.slideToggle('fast')
        setTimeout(() => expandDropdownEls[0].scrollIntoView(true), 200)
        dispatch(ThemeMakingContext.actions.setShowSlide(id))
    }

    const handleDelete = (id) => {
        const currentComponent = state.currentComponent

        let componentValue = currentComponent.componentValue

        componentValue[_key].splice(id, 1)

        const newComponent = {
            ...currentComponent,
            componentValue: componentValue
        }

        dispatch(ThemeMakingContext.actions.setReturnComponent(newComponent))
    }

    const getNameByIndex = (name, index) => {
        return name + ' ' + (index + 1)
    }

    return (
        <div className='sub-element-editor-array'>
            {value.map((val, index) => (
                <div key={hash + index}>
                    <div className='sub-element-editor-array__item mb-3'>
                        <div
                            className='sub-element-editor-array__item__name'
                            onClick={() => handleToggle(index)}
                        >
                            {
                                getNameByIndex(_key, index)
                            }
                        </div>
                        <GSDropDownButton button={
                            ({onClick}) => (
                                <i className="fa fa-ellipsis-h sub-element-editor-array__item__actions"
                                   aria-hidden="true" onClick={onClick}></i>
                            )
                        }>
                            <GSDropdownItem
                                className='pl-4 pr-4'
                                disabled={value.length <= 2}
                                onClick={() => handleDelete(index)}
                            >
                                <i className="fa fa-trash-o pr-2" aria-hidden="true"></i>
                                <GSTrans t={"page.themeEngine.editor.button.delete"}/>
                            </GSDropdownItem>
                        </GSDropDownButton>
                    </div>
                    <div className='sub-element-editor-array__dropdown' data-index={index}>
                        {ThemeEngineUtils.parseValuesToEditor(val, items, `${path}[${index}]`, hash + index)}
                    </div>
                </div>
            ))}
            <div className='p-3 d-flex justify-content-center'>
                <GSButton
                    outline
                    disabled={value.length >= 10 || !TokenUtils.hasThemeEnginePermission() || state.controller.isTranslate}
                    theme={GSButton.THEME.PRIMARY}
                    onClick={handleAdd}
                ><GSTrans t='page.themeEngine.editor.button.addBanner'/>
                </GSButton>
            </div>
        </div>
    )
}

SubElementEditorArray.defaultProps = {
    value: [],
    items: {}
}

SubElementEditorArray.propTypes = {
    value: array,
    items: shape({
        type: string,
        properties: array
    })
}

export default SubElementEditorArray
