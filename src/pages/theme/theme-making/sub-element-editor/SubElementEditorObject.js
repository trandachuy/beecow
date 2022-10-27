import './SubElementEditorObject.sass'

import React from 'react'
import ThemeEngineUtils from "../ThemeEngineUtils";
import {array, object, string} from "prop-types";
import {v4 as uuidv4} from 'uuid';
import $ from 'jquery'

const SubElementEditorObject = (props) => {
    const id = uuidv4()
    const {value, properties, _key, path, hash, index} = props

    const handleToggle = () => {
        const collapseDropdownEls = $(`.sub-element-editor-object__dropdown:not([data-index=${id}])`)
        const expandDropdownEls = $(`.sub-element-editor-object__dropdown[data-index=${id}]`)

        collapseDropdownEls.each(function () {
            if ($(this).css('display') != 'none') {
                $(this).slideToggle('fast')
            }
        })

        expandDropdownEls.slideToggle('fast')
        setTimeout(() => expandDropdownEls[0].scrollIntoView(true), 200)
    }

    return (
        <div className='sub-element-editor-object'>
            <div className='sub-element-editor-object__item mb-3'>
                <div className='sub-element-editor-object__item__name'
                     onClick={handleToggle}
                >{_key}</div>
            </div>
            <div className='sub-element-editor-object__dropdown' data-index={id}>
                {ThemeEngineUtils.parseValuesToEditor(value, {properties}, path, hash + index)}
            </div>
        </div>
    )
}

SubElementEditorObject.propTypes = {
    value: object,
    properties: array,
    name: string,
}

export default SubElementEditorObject
