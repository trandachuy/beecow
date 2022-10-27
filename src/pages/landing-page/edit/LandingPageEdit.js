import React from 'react';
import LandingPageEditor, {LANDING_PAGE_EDITOR_MODE} from "../editor/LandingPageEditor";
import {withRouter} from "react-router-dom";

const LandingPageEdit = props => {


    const {landingPageId} = props.match.params

    return (
        <LandingPageEditor mode={LANDING_PAGE_EDITOR_MODE.EDIT}
                            pageId={landingPageId}
        />
    );
};


export default withRouter(LandingPageEdit);
