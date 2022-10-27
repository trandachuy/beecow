import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";
import storage from "../../../services/storage";
import Constants from "../../../config/Constant";
import {setPageTitle} from "../../../config/redux/Reducers";
import i18next from 'i18next';
import {Redirect, Route} from "react-router-dom";
import {NAV_PATH} from "../../layout/navigation/Navigation";
import {AgencyService} from "../../../services/AgencyService";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const LoginRoute = (props) => {
    return <Route {...props} render={(props) => (
        <Redirect to={{
            pathname: NAV_PATH.login,
            state: {
                from: window.location.pathname
            }
        }}/>
    )} />
}

const ComponentRoute = (props) => {
    const {component: Component, ...rest} = props
    return (<Route {...rest} render={(props) => (
                <Component {...rest} />
            )} />);
}

/**
 * 
 * @deprecated
 */
const PrivateRoute = ({ component: Component, ...rest }) => {
    const dispatch = useDispatch()
    const selector = useSelector(state => state.agencyName)

    // get token
    const token = storage.get(Constants.STORAGE_KEY_ACCESS_TOKEN);
    const store = storage.get(Constants.STORAGE_KEY_STORE_FULL);

    if(token && store){
        const tPath = rest.path.split(':').join('')
        // rest.dispatch(setPageTitle(process.env.APP_NAME + ' - ' + i18next.t(`title.[${tPath}]`)))

        useEffect(() => {
            dispatch(setPageTitle(AgencyService.getDashboardName() + ' - ' + i18next.t(`title.[${tPath}]`)))
        }, [selector]);

        // incase user has full store => dashboard and others page
        return <ComponentRoute component={Component} {...rest}/>;
    }

    // remove all storage here
    storage.removeAll();

    // return to login
    return <LoginRoute {...rest}/>;

}
