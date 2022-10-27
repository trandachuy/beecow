/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 8/5/2020
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import React, {useEffect} from 'react';
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {withRouter} from "react-router-dom";
import {RouteUtils} from "../../../utils/route";

const Redirect = (props) => {
    useEffect(() => {
        const {action} = props.match.params;
        if (action === 'signup') {
            storageService.setToSessionStorage(Constants.STORAGE_KEY_FORCE_ACTIVATE, true);
            RouteUtils.linkTo(props, NAV_PATH.wizard + '/1' + window.location.search)
        }
        else if (action === 'login') {
            storageService.setToSessionStorage(Constants.STORAGE_KEY_FORCE_ACTIVATE, true);
            RouteUtils.linkTo(props, NAV_PATH.login + window.location.search)
        }
        else {
            RouteUtils.linkTo(props,NAV_PATH.login)
        }
    }, []);

    return (
        <></>
    );
};

export default withRouter(Redirect);
