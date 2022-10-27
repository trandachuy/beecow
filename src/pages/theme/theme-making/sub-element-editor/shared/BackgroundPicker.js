import './BackgroundPicker.sass'

import {arrayOf, bool, func, number, oneOfType, shape, string} from "prop-types"
import React, {useEffect, useRef, useState} from 'react'
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans"
import GSButton from "../../../../../components/shared/GSButton/GSButton"
import $ from 'jquery'
import i18next from "i18next";

const BACKGROUND_TYPE = {
    IMAGE: 'IMAGE',
    COLOR: 'COLOR',
}

const BackgroundPicker = (props) => {
    const {defaultValue, required, sizes, onChange} = props

    const [stBackground, setStBackground] = useState(defaultValue)
    const [stError, setStError] = useState(false)

    const refImagePicker = useRef()
    const refColorPicker = useRef()

    useEffect(() => {
        required && validate(defaultValue)
    }, [defaultValue])

    const validate = (value = stBackground) => {
        setStError(false)

        if (_.isString(value)) {
            const clean = value.trim()

            if (!_.isEmpty(clean)) {
                return false
            }
        }

        setStError(true)

        return true
    }

    const handleImage = () => {
        refImagePicker && refImagePicker.current.click()
    }

    const handleColor = () => {
        refColorPicker && refColorPicker.current.click()
    }

    const handleImageChange = (e) => {
        const URL = window.webkitURL || window.URL
        const src = URL.createObjectURL(e.target.files[0])

        if (!src || (required && validate(src))) {
            return
        }

        $('#color-picker').val('')
        setStBackground(src)
        onChange(src)
    }

    const handleColorChange = _.debounce((e) => {
        if (!refColorPicker.current) {
            return
        }

        const value = refColorPicker.current.value

        if (!value || (required && validate(value))) {
            return
        }

        $('#image-picker').val('')
        setStBackground(value)
        onChange(value)
    }, 300)

    const getBackgroundType = () => {
        const colorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

        if (colorRegex.test(stBackground)) {
            return BACKGROUND_TYPE.COLOR
        }

        return BACKGROUND_TYPE.IMAGE
    }

    const getImageSizeHint = () => {
        if (sizes.length) {
            let hint = `(${i18next.t('component.themeEditor.imagePicker.hint.size')} `

            hint += sizes.map(size => size.width + ' x ' + size.height + ' px').join(', ')

            hint += ')'

            return hint
        }

        return i18next.t('component.themeEditor.imagePicker.hint')
    }

    return (
        <div className='background-picker'>
            <input hidden
                   ref={refImagePicker}
                   type='file'
                   accept="image/*"
                   onChange={handleImageChange}/>
            <input
                hidden
                ref={refColorPicker}
                type="color"
                onChange={handleColorChange}/>
            <div className='w-100 d-flex justify-content-center background-picker__img'>
                <div
                    style={{
                        backgroundImage: `url(${stBackground})`,
                        backgroundColor: getBackgroundType() === BACKGROUND_TYPE.COLOR && stBackground,
                        backgroundSize: 'auto 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '250px'
                    }}
                    className={stError ? 'background-picker__img--error' : ''}
                />
                {/*{getBackgroundType() === BACKGROUND_TYPE.IMAGE*/}
                <div className='background-picker__img__changeWrapper' onClick={handleImage}>
                        <span className='background-picker__img__changeWrapper__label'>
                            <GSTrans t='component.themeEditor.imagePicker.button.changeImage'/>
                        </span>
                </div>
                {/*: <div className='background-picker__img__changeWrapper' onClick={handleColor}>*/}
                {/*    <span className='background-picker__img__changeWrapper__label'>*/}
                {/*        <GSTrans t='component.themeEditor.imagePicker.button.changeColor'/>*/}
                {/*    </span>*/}
                {/*</div>}*/}
            </div>
            <span className='background-picker__hint'>
                {
                    getImageSizeHint()
                }
            </span>
            <div className='d-flex justify-content-center'>
                <GSButton outline theme={GSButton.THEME.SECONDARY}
                          onClick={handleImage}>
                    <GSTrans t='component.themeEditor.imagePicker.button.image'/>
                </GSButton>
                <GSButton hidden={true} outline theme={GSButton.THEME.SECONDARY}
                          onClick={handleColor}
                          className='ml-3'>
                    <GSTrans t='component.themeEditor.imagePicker.button.color'/>
                </GSButton>
            </div>
        </div>
    )
}

BackgroundPicker.defaultProps = {
    required: false,
    defaultValue: '',
    sizes: [],
    onChange: () => {
    }
}

BackgroundPicker.propTypes = {
    required: bool,
    defaultValue: string,
    sizes: arrayOf(shape({
        width: oneOfType([number, string]),
        height: oneOfType([number, string]),
    })),
    onChange: func,
}

export default BackgroundPicker
