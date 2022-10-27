import './ItemCollectionSelector.sass'

import React, {useEffect, useState} from 'react'
import SharedHeader from "./SharedHeader";
import SharedBody from "./SharedBody";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import SharedContainer from "./SharedContainer";
import {any, arrayOf, bool, func, number, object, oneOfType, shape, string} from "prop-types";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";

const ItemCollectionSelector = (props) => {
    const {collectionTypes, collection, defaultValue, required, onTypeChange, onValueChange, options} = props

    const [stTypeToggle, setStTypeToggle] = useState(false)
    const [stValueToggle, setStValueToggle] = useState(false)
    const [stActiveType, setStActiveType] = useState(!!collectionTypes.length && collectionTypes[0])
    const [stActiveValue, setStActiveValue] = useState({
        label: '',
        value: '',
    })
    const [stError, setStError] = useState(false)

    useEffect(() => {
        if (!defaultValue || !collection || !collection.length) {
            return
        }

        const {collectionType, value} = defaultValue
        const defaultActiveType = _.find(collectionTypes, item => item.value === collectionType)
        const defaultActiveValue = _.find(collection, item => item.value === value)

        if (defaultActiveType) {
            setStActiveType(defaultActiveType)
        }
        if (defaultActiveValue) {
            setStActiveValue(defaultActiveValue)
        }
    }, [collection])

    useEffect(() => {
        required && validate(defaultValue.value)
    }, [defaultValue])

    const validate = (value) => {
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

    const handleTypeToggle = () => {
        setStTypeToggle(toggle => !toggle)
    }
    const handleValueToggle = () => {
        setStValueToggle(toggle => !toggle)
    }

    const handleTypeChange = (type) => {
        setStActiveType(type)

        if (required && validate(type.value)) {
            return
        }

        onTypeChange({
            collectionType: type.value,
            value: collection.length ? collection[0].value : stActiveValue.value
        })
    }

    const handleValueChange = (item) => {
        setStActiveValue(item)

        if (required && validate(item.value)) {
            return
        }

        onValueChange({
            collectionType: stActiveType.value,
            value: item.value
        })
    }

    return (
        <SharedContainer className={options.wrapperClassname}>
            {options.showTitle && <SharedHeader><GSTrans t={'component.themeEditor.collectionSelector.title'}/></SharedHeader>}
            <SharedBody>
                <Dropdown className="col-sm-4 item-collection-selector" isOpen={stTypeToggle} toggle={handleTypeToggle}>
                    <DropdownToggle
                        className='item-collection-selector__button left'
                        caret>
                        <span className='item-collection-selector__button__label'>{stActiveType.label}</span>
                    </DropdownToggle>
                    <DropdownMenu className='item-collection-selector__dropdown'>
                        {
                            collectionTypes.map((item, index) => (
                                <DropdownItem
                                    className='item-collection-selector__dropdown__item'
                                    key={index}
                                    onClick={() => handleTypeChange(item)}
                                    active={item.value === stActiveType.value}
                                >
                                    {item.label}
                                </DropdownItem>
                            ))
                        }
                    </DropdownMenu>
                </Dropdown>
                <Dropdown className="col-sm-8 item-collection-selector" isOpen={stValueToggle}
                          toggle={handleValueToggle}>
                    <DropdownToggle
                        className={["item-collection-selector__button right", stError ? 'item-collection-selector__button--error' : ''].join(' ')}
                        caret>
                        <span className='item-collection-selector__button__label'>{stActiveValue.label}</span>
                    </DropdownToggle>
                    <DropdownMenu className='item-collection-selector__dropdown'>
                        {
                            options.allowDeSelected && <DropdownItem
                                onClick={() => handleValueChange({label: '', value: null})}
                                active={stActiveValue.value === null}
                            >&nbsp;</DropdownItem>
                        }
                        {
                            collection.map((item, index) => (
                                <DropdownItem
                                    className='item-collection-selector__dropdown__item'
                                    key={index}
                                    onClick={() => handleValueChange(item)}
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

ItemCollectionSelector.defaultProps = {
    defaultValue: {
        collectionType: '',
        value: ''
    },
    collectionTypes: [],
    collection: [],
    required: false,
    options: {
        showTitle: true
    },
    onValueChange: () => {
    }
}

ItemCollectionSelector.propTypes = {
    defaultValue: shape({
        collectionType: string,
        value: oneOfType([string, number])
    }),
    collectionTypes: arrayOf(shape({
        label: string,
        value: any,
    })).isRequired,
    collection: arrayOf(shape({
        label: string,
        value: any,
    })),
    required: bool,
    options: shape({
        allowDeSelected: bool,
        showTitle: bool,
        wrapperClassname: string
    }),
    onValueChange: func,
    onTypeChange: func,
}

export default ItemCollectionSelector