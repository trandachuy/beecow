/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {Redirect} from "react-router-dom";
import authenticate from "../../services/authenticate";

export default class Logout extends React.Component{
    constructor(props) {
        super(props);
        authenticate.signOut()
    }

    render() {
        return(
            <Redirect to='/login'>
            </Redirect>
        )
    }
}