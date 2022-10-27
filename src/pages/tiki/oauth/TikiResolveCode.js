import React from 'react';
import {withRouter} from "react-router-dom";
import {RouteUtils} from "../../../utils/route";
import tikiService from "../../../services/TikiService";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";

const TikiResolveCode = props => {

    const {code, scope, state} = RouteUtils.getSearchParams(window.location.search),
        redirectURI = process.env.TIKI_REDIRECT_URI,
        clientID = process.env.TIKI_CLIENT_ID

    if (code) {
        tikiService.storeAuthorization(clientID, code, scope, state, redirectURI)
            .finally(() => {
                window.location.href = `https://${process.env.DASHBOARD_DOMAIN}${NAV_PATH.tikiAccount}`
            })
    } else {
        window.location.href = `https://${process.env.DASHBOARD_DOMAIN}${NAV_PATH.tikiAccount}`
    }

    return null
};

export default withRouter(TikiResolveCode);
