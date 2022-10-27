import './CollectionSelector.sass'

import React, {useEffect, useState} from 'react'
import SharedContainer from "./SharedContainer";
import SharedHeader from "./SharedHeader";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import SharedBody from "./SharedBody";
import {any, arrayOf, bool, func, shape, string} from "prop-types";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";

const CollectionSelector = (props) => {
    const {title, collection, defaultValue, required, onChange, options} = props

    const [stToggle, setStToggle] = useState(false)
    const [stActiveValue, setStActiveValue] = useState({
        label: '',
        value: '',
    })
    const [stError, setStError] = useState(false)

    useEffect(() => {
        if (required && validate(defaultValue)) {
            return
        }

        const defaultActiveValue = _.find(collection, item => item.value == defaultValue)

        if (!defaultActiveValue) {
            return
        }

        setStActiveValue(defaultActiveValue)
    }, [collection])

    const validate = (value = stActiveValue.value) => {
        setStError(false)

        if (_.isString(value)) {
            const clean = value.trim()

            if (!_.isEmpty(clean)) {
                return false
            }
        } else if (_.isNumber(value)) {
            return false
        }

        setStError(true)

        return true
    }

    const handleToggle = () => {
        setStToggle(toggle => !toggle)
    }

    const handleChange = (item) => {
        setStActiveValue(item)

        if (required && validate(item.value)) {
            return
        }

        onChange(item.value)
    }

    return (
        <SharedContainer>
            {options.showTitle && <SharedHeader>
                {title || <GSTrans t='component.themeEditor.collectionSelector.title'/>}
            </SharedHeader>}
            <SharedBody>
                <Dropdown className="collection-selector" isOpen={stToggle} toggle={handleToggle}>
                    <DropdownToggle
                        className={["collection-selector__button", stError ? 'collection-selector__button--error' : ''].join(' ')}
                        caret>
                        <span className='collection-selector__button__label'>{stActiveValue.label}</span>
                    </DropdownToggle>
                    <DropdownMenu className='collection-selector__dropdown'>
                        {
                            options.allowDeSelected && <DropdownItem
                                onClick={() => handleChange({label: '', value: null})}
                                active={stActiveValue.value === null}
                            >&nbsp;</DropdownItem>
                        }
                        {
                            collection.map((item, index) => (
                                <DropdownItem
                                    className='collection-selector__dropdown__item'
                                    key={index}
                                    onClick={() => handleChange(item)}
                                    active={item.value === stActiveValue.value}
                                >
                                    {item.label}
                                </DropdownItem>
                            ))
                        }
                    </DropdownMenu>
                </Dropdown>
            </SharedBody>
        </SharedContainer>
    )
}

CollectionSelector.defaultProps = {
    title: '',
    defaultValue: '',
    collection: [],
    required: false,
    options: {
        showTitle: true
    },
    onChange: () => {
    }
}

CollectionSelector.propTypes = {
    title: string,
    defaultValue: any,
    collection: arrayOf(shape({
        label: string,
        value: any,
    })),
    required: bool,
    options: shape({
        allowDeSelected: bool,
        showTitle: bool,
    }),
    onChange: func,
}

export default CollectionSelector