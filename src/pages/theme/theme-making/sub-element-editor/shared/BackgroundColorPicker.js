import React, {useEffect, useRef} from 'react'
import {func, string} from "prop-types";
import SharedContainer from "./SharedContainer";
import SharedHeader from "./SharedHeader";
import SharedBody from "./SharedBody";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ThemeEngineUtils from "../../ThemeEngineUtils";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";

const BackgroundColorPicker = (props) => {
    const {defaultValue, onChange} = props

    const refBackgroundColor = useRef()
    const refBorderColor = useRef()

    const getDefaultColor = () => {
        const style = ThemeEngineUtils.getStylesByKeys(defaultValue, ['background-color', 'border-color'])
        const backgroundColor = style['background-color'] || ''
        const borderColor = style['border-color'] || ''
        const activeStyle = {
            backgroundColor: backgroundColor.replace('!important', '').trim(),
            borderColor: borderColor.replace('!important', '').trim()
        }

        return activeStyle
    }

    useEffect(() => {
        const {backgroundColor, borderColor} = getDefaultColor()

        if (!backgroundColor && refBackgroundColor.current) {
            refBackgroundColor.current.value = ''
        }
        if (!borderColor && refBorderColor.current) {
            refBorderColor.current.value = ''
        }
    }, [defaultValue])

    const handleFillColor = _.debounce((e) => {
        if (!refBackgroundColor.current) {
            return
        }

        onChange(`background-color: ${refBackgroundColor.current.value} !important;`)
    }, 300)

    const handleBorderColor = _.debounce((e) => {
        if (!refBorderColor.current) {
            return
        }

        onChange(`border: 1px solid; border-color: ${refBorderColor.current.value} !important;`)
    }, 300)

    const handleFillReset = (e) => {
        e.preventDefault()

        onChange(`background-color:;`)
    }

    const handleBorderReset = (e) => {
        e.preventDefault()

        onChange(`border:; border-color:;`)
    }

    return (
        <SharedContainer>
            <SharedHeader><GSTrans t='component.themeEditor.backgroundColorPicker.title'/></SharedHeader>
            <SharedBody className='flex-column'>
                <Row className='w-100 align-items-center justify-content-start'>
                    <Col md={6}>
                        <span className='text-color-picker__label'>
                            <GSTrans t='component.themeEditor.backgroundColorPicker.fill'/>
                        </span>
                    </Col>
                    <Col>
                        <input
                            ref={refBackgroundColor}
                            type='color'
                            className='text-color-picker__input'
                            defaultValue={getDefaultColor().backgroundColor}
                            onChange={handleFillColor}/>
                        <a className='ml-3' href='#' onClick={handleFillReset}><GSTrans t='component.themeEditor.textColorPicker.reset'/></a>
                    </Col>
                </Row>
                <Row className='w-100 align-items-center justify-content-start mt-3'>
                    <Col md={6}>
                        <span className='text-color-picker__label'>
                            <GSTrans t='component.themeEditor.backgroundColorPicker.border'/>
                        </span>
                    </Col>
                    <Col>
                        <input
                            ref={refBorderColor}
                            type='color'
                            className='text-color-picker__input'
                            defaultValue={getDefaultColor().borderColor}
                            onChange={handleBorderColor}/>
                        <a className='ml-3' href='#' onClick={handleBorderReset}><GSTrans t='component.themeEditor.textColorPicker.reset'/></a>
                    </Col>
                </Row>
            </SharedBody>
        </SharedContainer>
    )
}

BackgroundColorPicker.defaultProps = {
    defaultValue: '',
    onChange: () => {
    }
}

BackgroundColorPicker.propTypes = {
    defaultValue: string,
    onChange: func
}

export default BackgroundColorPicker
