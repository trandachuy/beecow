import './FontSelector.sass'

import React, {useState} from 'react'
import SharedContainer from "./SharedContainer";
import SharedHeader from "./SharedHeader";
import SharedBody from "./SharedBody";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {func, string} from "prop-types";
import ThemeEngineUtils from "../../ThemeEngineUtils";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import Constants from '../../../../../config/Constant'

const FontSelector = (props) => {
    const {defaultValue, onChange} = props

    const [stToggle, setStToggle] = useState(false)

    const getDefaultValue = () => {
        const style = ThemeEngineUtils.getStylesByKeys(defaultValue, ['font-family'])
        const font = style['font-family']
        const index = _.findIndex(Constants.FONTS, f => f.value === font);

        if (index !== -1) {
            return Constants.FONTS[index]
        } else {
            return Constants.FONTS[1]
        }
    }

    const [stActiveFont, setStActiveFont] = useState(getDefaultValue())

    const handleToggle = () => {
        setStToggle(toggle => !toggle)
    }

    const handleChange = (font) => {
        setStActiveFont(font)
        onChange(`font-family: ${font.value}`)
    }

    return (
        <SharedContainer>
            <SharedHeader><GSTrans t='component.themeEditor.fontSelector.title'/></SharedHeader>
            <SharedBody>
                <Dropdown className="font-selector" isOpen={stToggle} toggle={handleToggle}>
                    <DropdownToggle className="font-selector__button" caret>
                        <span style={{fontFamily: stActiveFont.value}}
                              className='font-selector__button__label'>{stActiveFont.label}</span>
                    </DropdownToggle>
                    <DropdownMenu className="font-selector__dropdown">
                        {
                            Constants.FONTS.map((font, index) => (
                                <DropdownItem
                                    key={index}
                                    onClick={() => handleChange(font)}
                                    active={font.value === stActiveFont.value}
                                >
                                    <span style={{fontFamily: font.value}}>{font.label}&nbsp;</span>
                                </DropdownItem>
                            ))
                        }
                    </DropdownMenu>
                </Dropdown>
            </SharedBody>
        </SharedContainer>
    )
}

FontSelector.defaultProps = {
    defaultValue: '',
    onChange: () => {
    },
}

FontSelector.propTypes = {
    defaultValue: string,
    onChange: func,
}

export default FontSelector
