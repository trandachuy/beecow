/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import i18next from "../../../../config/i18n";
import {AvField} from 'availity-reactstrap-validation';
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import './ServiceVariationSelector.sass'

export const ServiceVariationSelector = (props) => {
    const [variations, setVariations] = useState(props.data || []);
    const [label] = useState(props.label);
    const [placeHolder] = useState(props.placeHolder);
    const [maxLength] = useState(props.maxLength);
    const [name] = useState(props.name)
    const [value, setValue] = useState()
    const [errorMessage, setErrormessage] = useState();

    useEffect(()=>{
        //dataMaxLength
        setVariations(props.data)
        
        if(!props.data || props.data.length === 0){
            setValue('')
        }

    }, [props.data])
    const onChange = (event) =>{
        setValue(event.target.value);
        setErrormessage(null)
    }
    const onKeyPress = (event) => {
        if (event.which == 13 || event.keyCode == 13) {
            if(event.target.value.includes("|") && name === 'locations'){
                setErrormessage(i18next.t(`component.service.input.keypress.error`));
                return;
            }
            if(!event.target.validity.valid){
                let ele = event.currentTarget.nextSibling;
                if(ele)
                    setErrormessage(null);
                else setErrormessage(props.validate.pattern.errorMessage);
                return;
            }
            const currentValue = event.target.value;
            let vars = variations.slice();
            if(vars.length >= props.dataMaxLength){
                setErrormessage(i18next.t(`component.service.` + name + `.allowable.limit`, {number: props.dataMaxLength}))
                return;
            }
            if (!vars.find(variation => currentValue === variation)) {
                vars.push(currentValue)
                setVariations(vars);
                props.onChange(vars)
                setValue('')
                setErrormessage(null)
            }
        }else{

        }
    }

    const onClickRemoveVariationValue = (item) => {
        let vars = variations.filter(variation => variation !== item);
        setVariations(vars);
        props.onChange(vars)
    }
    const onBlur = (event) =>{
        let ele = document.getElementById(name);
        if(!event.target.validity.valid){
            if(errorMessage){
                setErrormessage(null)
            }
            return
        }
        
    }
    return (
        <div className="variation-item">
            <AvField
                id={name}
                label={i18next.t(label)}
                name={name}
                validate={{
                    ...props.validate,
                    required: {
                        value: variations.length === 0,
                        errorMessage: i18next.t('common.validation.required')
                    },
                    maxLength: {
                        value: maxLength,
                        errorMessage: i18next.t("common.validation.char.max.length", { x: maxLength })
                    }
                }}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                onKeyPress={onKeyPress}
                placeholder={i18next.t(placeHolder)}
            />
            {errorMessage && <AlertInline text={errorMessage} type={AlertInlineType.ERROR} nonIcon/>}
            <div className={["var-values__pool", props.className].join(' ')}>
                {variations.map((item, index) => {
                    return (
                        <div key={item + "-" + index} className="var-values__varItem">
                            <span className="varItem-value">{item}</span>
                            <a className="var-values__btn-remove" onClick={() => { onClickRemoveVariationValue(item) }}>
                                <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                            </a>
                        </div>
                    )
                })}
            </div>
            
        </div>
    )
} 
