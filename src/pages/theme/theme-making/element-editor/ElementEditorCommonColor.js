import React, {useContext, useEffect, useRef} from 'react';
import './ElementEditorCommonColor.sass'
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import ThemeEngineUtils from "../ThemeEngineUtils";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {bool, object} from "prop-types";

const ElementEditorCommonColor = (props) => {
    const {dispatch} = useContext(ThemeMakingContext.context)

    const {currentComponent, disabled} = props

    const refColorInput = useRef()

    useEffect(() => {
        if (!getDefaultColor() && refColorInput.current) {
            refColorInput.current.value = ''
        }
    }, [currentComponent])

    const getDefaultColor = () => {
        const componentStyle = currentComponent && currentComponent.componentStyle
        const style = ThemeEngineUtils.getStylesByKeys(componentStyle, ['color'])
        const color = style['color'] || ''

        return color.replace('!important', '').trim()
    }

    const handleColor = _.debounce((e) => {
        if (!refColorInput.current || disabled) {
            return
        }

        const componentStyle = currentComponent && currentComponent.componentStyle

        dispatch(ThemeMakingContext.actions.setReturnComponent({
            ...props.currentComponent,
            componentStyle: ThemeEngineUtils.upsertStyleByValues(
                componentStyle, `color: ${refColorInput.current.value} !important;`
            )
        }))
    }, 300)

    const handleReset = (e) => {
        e.preventDefault()

        if (disabled) {
            return
        }

        const componentStyle = currentComponent && currentComponent.componentStyle

        dispatch(ThemeMakingContext.actions.setReturnComponent({
            ...currentComponent,
            componentStyle: ThemeEngineUtils.upsertStyleByValues(
                componentStyle, 'color:;'
            )
        }))
    }

    return (
        <div className={[
            "element-editor-common-color",
            disabled ? "disabled" : ''
        ].join(' ')}>
            <div className="element-editor-common-color__label">
                <GSTrans t='component.themeEditor.subElement.textColor.title'/>
            </div>
            <div className="element-editor-common-color__wrapper">
                <input
                    ref={refColorInput}
                    type='color'
                    key={currentComponent.componentHash}
                    className='element-editor-common-color__wrapper__input'
                    defaultValue={getDefaultColor()}
                    onChange={handleColor}/>
                <a className='ml-3' href='#' onClick={handleReset}><GSTrans t='component.themeEditor.textColorPicker.reset'/></a>
            </div>
        </div>
    );
};

ElementEditorCommonColor.defaultProps = {
    disabled: false,
    currentComponent: {}
}

ElementEditorCommonColor.propTypes = {
    disabled: bool,
    currentComponent: object
}

export default React.forwardRef(ElementEditorCommonColor);
