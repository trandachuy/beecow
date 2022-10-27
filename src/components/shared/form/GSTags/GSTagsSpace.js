/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 04/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useImperativeHandle, useState} from 'react';
import CreatableSelect from 'react-select';
import PropTypes from 'prop-types';
import './GSTag.sass';
import {cn} from "../../../../utils/class-name";
import AlertInline, {AlertInlineType} from "../../AlertInline/AlertInline";
import i18next from "i18next";

const createOption = (label) => ({
    label,
    value: label,
});

const createExtOption = ({label, value, type}) => ({
    label,
    value,
    type,
});

const GSTags = React.forwardRef((props, ref) => {
    const [stError, setStError] = useState('');
    const [stInputValue, setStInputValue] = useState('');
    const [stBlurred, setStBlurred] = useState(false);
    const [stValue, setStValue] = useState(props.defaultValue? props.defaultValue.map(value =>{
        if(!value.label) {
            return createOption(value)
        }
        return value
    } ):[]);

    const [stExtValue, setStExtValue] = useState(props.extensionValue? props.extensionValue.map(value =>{
        if(!value.label) {
            return createExtOption(value)
        }
        return value
    } ):[]);


    useImperativeHandle(
        ref,
        () => ({
            isValid
        }),
    );


    useEffect(() => {
        if (props.isRequired && stValue.length === 0) {
            setStError('common.validation.required')
        } else {
            setStError('')
        }
    }, [stValue]);

    const components = {
        DropdownIndicator: null,
        Option: props.components
    };


    const isValid = () => {
        if (props.isRequired && stValue.length === 0) {
            setStBlurred(true)
            setStError('common.validation.required')
            return false
        } else {
            setStError('')
            return true
        }
    }

    const handleChange = (value, actionMeta) => {
        if(props.isSearch) {
            if (props.onFilter) props.onFilter(value, true)
        }
        const type = (actionMeta.removedValue && actionMeta.removedValue.type)? (actionMeta.removedValue.type):"";
        if (actionMeta.action === 'remove-value' && (type === "fb" || type === "zalo")) {
            const item = actionMeta.removedValue;
            if (props.removeExtension) props.removeExtension(item);
            const values = stExtValue.filter(opt => opt.value === item.value);
            setStExtValue(values);
        }
        value = value.filter(opt => (!opt.type || (opt.type !== "fb" && opt.type !== "zalo")));
        if (props.onChange && (type !== "fb" || type !== "zalo")) props.onChange(value)
        setStValue(value)
    };

    const handleOnblur = (event) => {
        setStBlurred(true)
        let inputValue = stInputValue
        const value = stValue
        if (!inputValue) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
            return;
        }
        event.preventDefault();

        if (!inputValue) {
            setStInputValue('')
            return;
        }

        if (value.filter(v => v.value === inputValue).length === 1) { // remove duplicate
            setStInputValue('')
            return
        }
        if ( props.limit && stValue.length >= props.maxLength) { // remove if max length
            setStInputValue('')
            return
        }

        setStInputValue('')
        if (inputValue.trim() != ''){
            setStValue([...value, createOption(inputValue.trim())])
            if (props.onChange) props.onChange([...value, createOption(inputValue.trim())])
        }
    }

    const handleInputChange = (inputValue) => {
        const value = inputValue.substr(0, props.maxItemTextLength)
        setStInputValue(value)
        if(props.isSearch && value) {
           if (props.onFilter) props.onFilter(value, false)
        } else if (!value) {
            if (props.onFilter) props.onFilter(value, true)
        }
    };
    const handleOnStyleMenuChange = (event) => {
        if (props.onStyleMenuChange) {
            props.onStyleMenuChange({
                top : event.target.offsetInlineEnd,
                left: event.target.offsetLeft
            })
        }
    }
    const handleKeyDown = (event) => {
        let inputValue = stInputValue
        const value = stValue
        if(props.isSearch && !props.confirmKeys.includes(event.key)) {
            handleOnStyleMenuChange(event)
            // props.onFilter(inputValue, false)
        }

        if (inputValue && event.key === ' ') {
            return;
        }

        if (!inputValue) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
            return;
        }
        if (props.confirmKeys.filter(key => key === event.key).length === 1 || (props.limit && inputValue.length >= props.maxItemTextLength)) { // match delimiter key or max length
            event.preventDefault();

            if (!inputValue) {
                if (props.onFilter) props.onFilter(inputValue, true)
                setStInputValue('')
                return;
            }

            if (value.filter(v => v.value === inputValue).length === 1) { // remove duplicate
                if (props.onFilter) props.onFilter(inputValue, true)
                setStInputValue('')
                return
            }
            if (props.limit && stValue.length >= props.maxLength) { // remove if max length
                if (props.onFilter) props.onFilter(inputValue, true)
                setStInputValue('')
                return
            }
            setStInputValue('')
            if (inputValue.trim() != ''){
                setStValue([...value, createOption(inputValue.trim())])
                if (props.onChange) props.onChange([...value, createOption(inputValue.trim())])
                if(props.confirmKeys.includes(event.key)) {
                    if (props.onFilter) props.onFilter(inputValue.trim(), true)
                }
            }
        }
    };

    const {placeholder, defaultValue, confirmKeys, isClearable, onChange, style,maxItemTextLength,maxLength, className, ...other} = props
    return (
            <>
                <CreatableSelect
                    {...other}
                    className={cn('gs-tags', {'gs-tags--error': stError && stBlurred}, className)}
                    isDisabled={props.disabled}
                    components={components}
                    inputValue={stInputValue}
                    isClearable={isClearable}
                    isMulti
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleOnStyleMenuChange}
                    onBlur={handleOnblur}
                    placeholder={placeholder}
                    noOptionsMessage={() => null}
                    value={[...stValue,...stExtValue]}
                    style={{
                        ...style,
                        cursor: 'text'
                    }}
                    options={props.options}
                    styles={{
                        clearIndicator: (base, state) => ({
                            ...base,
                            cursor: 'pointer !important'
                        }),
                        multiValueRemove: (base, state) => ({
                            ...base,
                            cursor: 'pointer !important'
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            'white-space': 'pre-line',
                            'word-break': 'break-word'
                        })
                    }}
                />
                {stError && stBlurred &&
                    <AlertInline text={i18next.t(stError)}
                                 nonIcon
                                 textAlign={"left"}
                                 type={AlertInlineType.ERROR}
                                 padding={false}
                                 style={{
                                     marginTop: '4px',
                                     marginBottom: '16px'
                                 }}
                    />
                }
            </>
    );
})

GSTags.displayName = 'GSTags'

GSTags.defaultProps = {
    placeholder: "",
    isClearable: true,
    confirmKeys: ['Enter','Tab',' ','Space'],
    maxLength: 20,
    maxItemTextLength: 250,
    limit: true,
    components: CreatableSelect.Option,
    isSearch: false,
    extensionValue: [],
}

GSTags.propTypes = {
    placeholder: PropTypes.string,
    isClearable: PropTypes.bool,
    onChange: PropTypes.func,
    confirmKeys: PropTypes.array,
    style: PropTypes.any,
    defaultValue: PropTypes.array,
    extensionValue: PropTypes.array,
    maxLength: PropTypes.number,
    maxItemTextLength: PropTypes.number,
    limit: PropTypes.bool,
    components: PropTypes.any,
    options: PropTypes.any,
    menuIsOpen: PropTypes.bool,
    onFilter: PropTypes.func,
    onStyleMenuChange: PropTypes.func,
    isSearch: PropTypes.bool,
    className: PropTypes.string,
    isRequired: PropTypes.bool,
    removeExtension: PropTypes.func,
};

export default GSTags;
