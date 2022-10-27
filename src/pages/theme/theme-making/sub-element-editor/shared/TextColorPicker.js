import './TextColorPicker.sass'

import React, {useEffect, useRef} from 'react'
import SharedContainer from "./SharedContainer";
import SharedHeader from "./SharedHeader";
import SharedBody from "./SharedBody";
import {func, string} from "prop-types";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import ThemeEngineUtils from "../../ThemeEngineUtils";

const TextColorPicker = (props) => {
    const {defaultValue, title, onChange} = props

    const refColorInput = useRef()

    const getDefaultColor = () => {
        const style = ThemeEngineUtils.getStylesByKeys(defaultValue, ['color'])
        const color = style['color'] || ''

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

        onChange(`color: ${refColorInput.current.value} !important;`)
    }, 300)

    const handleReset = (e) => {
        e.preventDefault()

        onChange(`color:;`)
    }

    return (
        <SharedContainer>
            <SharedHeader>
                {
                    title || <GSTrans t='component.themeEditor.textColorPicker.title'/>
                }
            </SharedHeader>

            <SharedBody>
                <Row className='w-100 align-items-center justify-content-start'>
                    <Col md={6}>
                        <span className='text-color-picker__label'>
                            <GSTrans t='component.themeEditor.textColorPicker.fill'/>
                        </span>
                    </Col>
                    <Col>
                        <input
                            ref={refColorInput}
                            type='color'
                            className='text-color-picker__input'
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

TextColorPicker.defaultProps = {
    defaultValue: '',
    title: '',
    onChange: () => {
    }
}

TextColorPicker.propTypes = {
    defaultValue: string,
    title: string,
    onChange: func,
}

export default TextColorPicker
