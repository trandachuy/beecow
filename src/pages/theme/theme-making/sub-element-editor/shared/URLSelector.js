import './URLSelector.sass'

import React, {useState} from 'react'
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {func, string} from "prop-types";
import SharedContainer from "./SharedContainer";
import SharedHeader from "./SharedHeader";
import SharedBody from "./SharedBody";

const URLSelector = (props) => {
    const {defaultValue, onChange} = props

    const [stError, setStError] = useState(false)

    function isValidURL(str) {
        if (!str) {
            return true
        }

        const pattern = new RegExp("^(https?):\\/\\/(-\\.)?([^\\s\\/?\\.#]+\\.?)+(\\/[^\\s]*)?$", 'i');
        return !!pattern.test(str);
    }

    const handleInput = (e) => {
        const value = e.target.value

        setStError(false)
        if (!isValidURL(value)) {
            setStError(true)

            return
        }

        let newValue = value

        if (value && !/^(https?:\/\/)/.test(value)) {
            //insert http:// if not have
            newValue = 'http://' + newValue
        }

        onChange(newValue)
    }

    return (
        <SharedContainer>
            <SharedBody>
                <span className='url-selector__type'><GSTrans t='component.themeEditor.urlSelector.input.title'/></span>
                <div className={['url-selector__input', stError ? 'url-selector__input--error' : ''].join(' ')}>
                    {/*<span className="url-selector__input__prefix">http://</span>*/}
                    <input id="url-selector--input" key={defaultValue} type="text" className="url-selector__input__url"
                           defaultValue={defaultValue}
                           onBlur={handleInput}/>
                </div>
            </SharedBody>
        </SharedContainer>
    )
}

URLSelector.defaultProps = {
    defaultValue: '',
    onChange: () => {
    }
}

URLSelector.propTypes = {
    defaultValue: string,
    onChange: func
}

export default URLSelector