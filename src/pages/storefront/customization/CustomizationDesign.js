/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/09/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import CustomizationDesignDefault from "../customization/CustomizationDesignDefault";
import CustomizationDesignTheme from "../customization/CustomizationDesignTheme";
import * as queryString from 'query-string';

export default class CustomizationDesign extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const param = queryString.parse(this.props.location.search)
        
        const {...other} = this.props

        if(!param.id){
            return(
                <CustomizationDesignDefault {...other}/>
            )

        }else{
            return(
                <CustomizationDesignTheme themeId={param.id} {...other}/>
            )
        }
        
    }
}
