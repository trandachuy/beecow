import React from 'react';
import {withRouter} from "react-router-dom";
import {RouteUtils} from "../../../../utils/route";
import zaloService from "../../../../services/ZaloService";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import NotFound from "../../../error/NotFound";

const ZaloChatResolveToken = props => {

    const {code, oa_id} = RouteUtils.getSearchParams(window.location.search)

    if (window.opener) {
        window.opener.postMessage({
            type: 'zalo-resolve-token',
            code: code,
            oaId: oa_id
        }, window.location.protocol + '//' + window.location.host)

        setTimeout(  window.close, 500)

        return (
            <>
                <LoadingScreen/>
            </>
        );
    }
    return (
        <>
            <NotFound/>
        </>
    );
};

ZaloChatResolveToken.propTypes = {

};

export default withRouter(ZaloChatResolveToken);
