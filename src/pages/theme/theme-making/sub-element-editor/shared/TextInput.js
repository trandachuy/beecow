import './TextInput.sass'

import React, {useEffect, useState} from 'react'
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import SharedContainer from "./SharedContainer";
import SharedHeader from "./SharedHeader";
import SharedBody from "./SharedBody";
import {bool, func, number, shape, string} from "prop-types";

const TextInput = (props) => {
    const {defaultValue, rows, required, options, onChange} = props

    const [stError, setStError] = useState(false)

    const validate = (value) => {
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

    useEffect(() => {
        required && validate(defaultValue)
    }, [defaultValue])

    const handleText = (e) => {
        const value = e.target.value

        if (required && validate(value)) {
            return
        }

        onChange(value)
    }

    return (
        <SharedContainer>
            {
                options.showTitle && <SharedHeader><GSTrans t='component.themeEditor.textInput.title'/></SharedHeader>
            }
            <SharedBody>
                <textarea
                    key={defaultValue}
                    className={['text-input__input', stError ? 'text-input__error' : ''].join(' ')}
                    rows={rows}
                    defaultValue={defaultValue}
                    onBlur={handleText}
                />
            </SharedBody>
        </SharedContainer>
    )
}

TextInput.defaultProps = {
    rows: 3,
    required: false,
    defaultValue: '',
    options: {
        showTitle: true
    },
    onChange: () => {
    }
}

TextInput.propTypes = {
    rows: number,
    required: bool,
    defaultValue: string,
    options: shape({
        showTitle: bool
    }),
    onChange: func
}

export default TextInput