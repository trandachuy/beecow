/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './URLItem.sass'
import {ThemeValidationUtils} from "../../../../../utils/theme-validation";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import {AvField, AvGroup} from 'availity-reactstrap-validation'


export default class URLItem extends React.Component {

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
        value: '',
        error: null
    }

    HTTP_URL_FORMAT = "http://"
    HTTPS_URL_FORMAT = "https://"

    constructor(props) {
        super(props)
        this.isValid = this.isValid.bind(this)
        this.updateValue = this.updateValue.bind(this)
        this.addPrefix = this.addPrefix.bind(this)
        this.removePrefix = this.removePrefix.bind(this)
    }

    componentDidMount(){
        if(this.props.value){
            this.setState({value: this.removePrefix(this.props.value)})
        }
    }

    addPrefix(url){
        if(url && !url.startsWith(this.HTTP_URL_FORMAT) && !url.startsWith(this.HTTPS_URL_FORMAT)){
            return this.HTTP_URL_FORMAT + url
        }
        return url
    }

    removePrefix(url){
        if(url && url.startsWith(this.HTTP_URL_FORMAT)){
            return url.replace(this.HTTP_URL_FORMAT, "")
        }else if(url && url.startsWith(this.HTTPS_URL_FORMAT)){
            return url.replace(this.HTTPS_URL_FORMAT, "")
        }
        return url
    }

    updateValue(e, value){
        this.setState({value : value})
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.addPrefix(value))

        // validate
        let error = ThemeValidationUtils.themeValidation(this.props.validateRule, value)
        this.setState({error: error})
    }

    // external rule
    isValid(){
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.addPrefix(this.state.value))
        
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
            <div className="url__type">
                <span className="url-prefix">{this.HTTP_URL_FORMAT}</span>
                <AvGroup>
                    <AvField 
                        style={{paddingLeft : '4em'}}
                        value={this.state.value}
                        name={this.props.name}
                        onBlur={this.updateValue}
                        maxLength={this.props.validateRule.isMaxLength ? this.props.validateRule.isMaxLength : 500}
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



