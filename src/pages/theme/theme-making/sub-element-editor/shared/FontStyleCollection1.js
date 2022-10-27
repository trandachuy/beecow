import './FontStyleCollection.sass'

import React, {useState} from 'react'
import {func, string} from "prop-types";
import ThemeEngineUtils from "../../ThemeEngineUtils";
import SharedContainer from "./SharedContainer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const FontStyleCollection1 = (props) => {
    const {defaultValue, onChange} = props

    const getDefaultValue = () => {
        const style = ThemeEngineUtils.getStylesByKeys(defaultValue, ['font-weight', 'font-style', 'text-decoration'])
        const fontWeight = style['font-weight']
        const fontStyle = style['font-style']
        const textDecorator = style['text-decoration']
        const activeStyle = {
            isBold: fontWeight === 'bold',
            isItalic: fontStyle === 'italic',
            isUnderline: textDecorator === 'underline'
        }

        return activeStyle
    }

    const [stStyle, setStStyle] = useState(getDefaultValue())

    const toggleBold = () => {
        setStStyle(style => {
            onChange(`font-weight: ${!stStyle.isBold ? 'bold' : ''};`)

            return {
                ...style,
                isBold: !style.isBold
            }
        })
    }

    const toggleItalic = () => {
        setStStyle(style => {
            onChange(`font-style: ${!stStyle.isItalic ? 'italic' : ''};`)

            return {
                ...style,
                isItalic: !style.isItalic
            }
        })
    }

    const toggleUnderline = () => {
        setStStyle(style => {
            onChange(`text-decoration: ${!stStyle.isUnderline ? 'underline' : ''};`)

            return {
                ...style,
                isUnderline: !style.isUnderline
            }
        })
    }

    return (
        <SharedContainer>
            <div className='font-style-collection'>
                <span
                    className={[
                        'font-style-collection__button',
                        stStyle.isBold
                            ? 'font-style-collection__button--active'
                            : 'font-style-collection__button--inactive'
                    ].join(' ')}
                    onClick={toggleBold}
                >
                    <FontAwesomeIcon icon="bold"/>
                </span>
                <span
                    className={[
                        'font-style-collection__button font-italic ml-1',
                        stStyle.isItalic
                            ? 'font-style-collection__button--active'
                            : 'font-style-collection__button--inactive'
                    ].join(' ')}
                    onClick={toggleItalic}
                >
                    <FontAwesomeIcon icon="italic"/>
                </span>
                <span
                    className={[
                        'font-style-collection__button text-decoration-underline ml-1',
                        stStyle.isUnderline
                            ? 'font-style-collection__button--active'
                            : 'font-style-collection__button--inactive'
                    ].join(' ')}
                    onClick={toggleUnderline}
                >
                    <FontAwesomeIcon icon="underline"/>
                </span>
            </div>
        </SharedContainer>
    )
}

FontStyleCollection1.defaultProps = {
    defaultValue: '',
    onChange: () => {
    },
}

FontStyleCollection1.propTypes = {
    defaultValue: string,
    onChange: func,
}

export default FontStyleCollection1
