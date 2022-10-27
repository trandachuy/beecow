import './SettingBar.sass'
import React, {useContext} from 'react';
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import ThemeEngineConstants from "../ThemeEngineConstants";

const SettingBar = (props, ref) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context);

    const onSettingTabClick = (tab) => {
        const oldTab = state.settingTab;

        if (state.controller.isTranslate) {
            return
        }

        if (tab === oldTab) {
            // close the tab
            dispatch(ThemeMakingContext.actions.setSettingTab(ThemeEngineConstants.SETTING_TAB.HELP));
            return;
        }

        dispatch(ThemeMakingContext.actions.setSettingTab(tab));
    }

    return (
        <div className="setting-bar">
            <hr></hr>
            <div
                className={[
                    "setting-bar-general",
                    state.settingTab === ThemeEngineConstants.SETTING_TAB.GENERAL_SETTING ? "active" : "",
                    state.controller.isTranslate ? 'disabled' : ''
                ].join(' ')}
                onClick={e => onSettingTabClick(ThemeEngineConstants.SETTING_TAB.GENERAL_SETTING)}></div>

            <hr></hr>

            <div className={[
                "setting-bar-editor",
                state.settingTab === ThemeEngineConstants.SETTING_TAB.ELEMENT_LIST ? "active" : "",
                state.controller.isTranslate ? 'disabled' : ''
            ].join(' ')}
                 onClick={e => onSettingTabClick(ThemeEngineConstants.SETTING_TAB.ELEMENT_LIST)}></div>

            <hr></hr>

            <div className={["setting-bar-help", ""].join("")}
                 onClick={e => {
                     window.open("https://huongdan.gosell.vn/faq_category/thiet-ke-giao-dien-goweb/", '_blank');
                 }}></div>

            <hr></hr>
        </div>
    );
};


export default React.forwardRef(SettingBar);
//  ElementList.propTypes = {
//     themeId: any
// };
