import './ThemePreview.sass'
import React, {useReducer, useEffect} from 'react'
import {ThemeMakingContext} from "../theme-making/context/ThemeMakingContext"
import ToolbarView from '../theme-making/toolbarview/ToolbarView'
import ThemePageList from "../theme-making/page-list/ThemePageList";
import HtmlPreview from "./HtmlPreview";
import ThemeEngineConstants from "../theme-making/ThemeEngineConstants";
import store from "../../../config/redux/ReduxStore";
import {connect} from "react-redux";

const ThemePreview = (props) => {
    const [state, dispatch] = useReducer(ThemeMakingContext.reducer, ThemeMakingContext.initState);

    useEffect(() => {
        const themeId = props.match.params.themeId;

        dispatch(ThemeMakingContext.actions.setThemeId(parseInt(themeId)))
        dispatch(ThemeMakingContext.actions.setThemeType(ThemeEngineConstants.THEME_TYPE.MASTER))
        dispatch(ThemeMakingContext.actions.setIsPreview(true))
    }, [])

    return (
        <div className="theme-preview" style={{fontSize: "16px"}}>
            <ThemeMakingContext.provider value={{state, dispatch}}>
                <div className="theme-preview-grid">
                    <div className="logo-setting-bar" style={{
                        backgroundImage: `url(${store.getState().whiteLogo || store.getState().logo || '/assets/images/logo_gosell_theme.png'})`}}>
                        &nbsp;
                    </div>
                    <div className="page-and-setting">
                        <ThemePageList></ThemePageList>
                    </div>
                    <div className="platform-head-toolbar">
                        <ToolbarView></ToolbarView>
                    </div>
                    <div className="theme-editor-body">
                        <HtmlPreview></HtmlPreview>
                    </div>
                </div>
            </ThemeMakingContext.provider>
        </div>
    );
};

export default connect()(ThemePreview)
