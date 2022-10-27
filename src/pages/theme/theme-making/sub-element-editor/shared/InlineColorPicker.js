import './InlineColorPicker.sass'

import React, {useEffect, useRef} from 'react'
import SharedContainer from "./SharedContainer";
import SharedBody from "./SharedBody";
import {bool, func, shape, string} from "prop-types";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import ThemeEngineUtils from "../../ThemeEngineUtils";

const InlineColorPicker = (props) => {
    const {defaultValue, title, styleType, onChange} = props

    const refColorInput = useRef()

    const getDefaultColor = () => {
        const style = ThemeEngineUtils.getStylesByKeys(defaultValue, [styleType])
        const color = style[styleType] || ''

        return color.replace('!important', '').trim()
    }

    useEffect(() => {
        if (!getDefaultColor() && refColorInput.current) {
            refColorInput.current.value = ''
        }
    }, [defaultValue])

    const handleColor = _.debounce((e) => {
        if (!refColorInput.current) {
            return
        }

        onChange(`${styleType}: ${refColorInput.current.value} !important;`)
    }, 300)

    const handleReset = (e) => {
        e.preventDefault()

        onChange(`${styleType}:;`)
    }

    return (
        <SharedContainer>
            <SharedBody>
                <Row className='w-100 align-items-center justify-content-start'>
                    <Col md={6}>
                        <span className='inline-color-picker__label'>
                            {title}
                        </span>
                    </Col>
                    <Col className='d-flex align-items-center'>
                        <input
                            ref={refColorInput}
                            type='color'
                            className='inline-color-picker__input'
                            defaultValue={getDefaultColor()}
                            onChange={handleColor}/>
                        <a className='ml-3' href='#' onClick={handleReset}><GSTrans
                            t='component.themeEditor.textColorPicker.reset'/></a>
                    </Col>
                </Row>
            </SharedBody>
        </SharedContainer>
    )
}

InlineColorPicker.defaultProps = {
    defaultValue: '',
    title: '',
    styleType: '',
    onChange: () => {
    }
}

InlineColorPicker.propTypes = {
    defaultValue: string,
    title: string,
    styleType: string.isRequired,
    onChange: func,
}

export default InlineColorPicker
