/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React from "react";
import LoyaltyFormEditor, {LoyaltyFormEditorMode} from "../LoyaltyFormEditor";

const LoyaltyAddNew = (props) =>{

    const {mode, ...other} = props
    return ( 
        <LoyaltyFormEditor 
            mode={LoyaltyFormEditorMode.ADD_NEW}
            {...other}
        />
        )
}
export default LoyaltyAddNew;
