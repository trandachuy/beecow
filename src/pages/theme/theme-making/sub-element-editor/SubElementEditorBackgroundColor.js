import React, {useContext} from 'react'
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {string} from "prop-types";
import ColorPicker from "./shared/ColorPicker";

const SubElementEditorBackgroundColor = (props) => {
    const {dispatch} = useContext(ThemeMakingContext.context)
    const {value, required, path, title} = props

    const handleStyle = (color) => {
        
        dispatch(ThemeMakingContext.actions.editSubElementReturn({
            path,
            changes: {value : color, title: title} 
        }));
    }

    return (
        <>
            <ColorPicker value={value} chooseColorCallback={handleStyle} title={title} colorType="colorType"/>
        </>
    )
}

SubElementEditorBackgroundColor.defaultProps = {
    value: ''
}

SubElementEditorBackgroundColor.propTypes = {
    value: string
}

export default SubElementEditorBackgroundColor
