/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './TextItem.sass'
import {ThemeValidationUtils} from "../../../../../utils/theme-validation";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import {AvField, AvGroup} from 'availity-reactstrap-validation'


export default class TextItem extends React.Component {

    /*
    * PROPS
    *
    * 1. value : value of text
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       value : output text for parent component
    *    )
    * 3. validateRule: object to validation
    * 4. name
    *     
    */


    state = {
        value: this.props.value,
        error: null
    }

    constructor(props) {
        super(props)
        this.isValid = this.isValid.bind(this)
        this.updateValue = this.updateValue.bind(this)
    }

    updateValue(e, value){
        this.setState({value : value})
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, value)

        // validate
        let error = ThemeValidationUtils.themeValidation(this.props.validateRule, value)
        this.setState({error: error})
    }

    // external rule
    isValid(){
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.state.value)
        
        // validate
        let error = ThemeValidationUtils.themeValidation(this.props.validateRule, this.state.value)
        if(error){
            this.setState({error: error})
            return false
        }

        return true
    }

    render() {
        return (
            <div className="text__type">
                <AvGroup>
                    <AvField 
                        value={this.state.value}
                        name={this.props.name}
                        onBlur={this.updateValue}
                        maxLength={this.props.validateRule.isMaxLength ? this.props.validateRule.isMaxLength : 100}
                    />
                    {
                        (this.state.error && this.state.error.isError) &&
                        <AlertInline 
                            className="link-to__item-error"
                            type={AlertInlineType.ERROR}
                            nonIcon
                            text={this.state.error.message}/>
                    }
                </AvGroup>
            </div>
            
        )
    }

}



