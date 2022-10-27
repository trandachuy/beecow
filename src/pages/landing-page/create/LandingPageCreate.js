import React from 'react';
import LandingPageEditor, {LANDING_PAGE_EDITOR_MODE} from "../editor/LandingPageEditor";
import {ThemeService} from "../../../services/ThemeService";

const LandingPageCreate = props => {
    return (
        <LandingPageEditor mode={LANDING_PAGE_EDITOR_MODE.CREATE}/>
    );
};


export default LandingPageCreate;
