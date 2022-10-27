import "./ThemeMaking.sass";
import React, { useEffect, useReducer } from "react";
import { ThemeMakingContext } from "./context/ThemeMakingContext";
import GeneralSetting from "./general-setting/GeneralSetting";
import ToolbarView from "./toolbarview/ToolbarView";
import HtmlEditor from "./editor/HtmlEditor";
import ThemePageList from "./page-list/ThemePageList";
import ElementSetting from "./element-setting/ElementSetting";
import SettingBar from "./setting-bar/SettingBar";
import ElementList from "./element-list/ElementList";
import { TokenUtils } from "../../../utils/token";
import { RouteUtils } from "../../../utils/route";
import { ThemeEngineService } from "../../../services/ThemeEngineService";
import ThemeEngineConstants from "./ThemeEngineConstants";
import storeService from "../../../services/StoreService";
import TranslateHint from "./translate-hint/TranslateHint";
import {connect, useDispatch as useReduxDispatch} from 'react-redux'
import store from "../../../config/redux/ReduxStore";
import {setPageTitle} from '../../../config/redux/Reducers'
import {AgencyService} from '../../../services/AgencyService'
import i18next from 'i18next'

const ThemeMaking = (props) => {
    const [state, dispatch] = useReducer(
        ThemeMakingContext.reducer,
        ThemeMakingContext.initState
    );

    const reduxDispatch = useReduxDispatch();

    useEffect(() => {
        const themeId = props.match.params.themeId;
        const themeType = props.match.params.themeType;

        if (themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
            if (!TokenUtils.hasThemeEnginePermission(themeId)) {
                RouteUtils.toNotFound(props);
            }
        } else {
            ThemeEngineService.getStoreThemesById(themeId).then(
                (storeTheme) => {
                    if (
                        !storeTheme ||
                        !TokenUtils.hasThemeEnginePermission(
                            storeTheme.masterThemeId
                        )
                    ) {
                        RouteUtils.toNotFound(props);
                    }
                }
            );
        }

        storeService.getLanguages().then((languages) => {
            if (!languages.length) {
                return;
            }

            const initialLang = languages.find((lang) => lang.isInitial);

            if (!initialLang) {
                console.error("Initial store language not found");
                return;
            }

            dispatch(
                ThemeMakingContext.actions.setSelectedStoreLanguage(initialLang)
            );
            dispatch(ThemeMakingContext.actions.setStoreLanguages(languages));
        });

        dispatch(ThemeMakingContext.actions.setThemeId(parseInt(themeId)));
        dispatch(ThemeMakingContext.actions.setThemeType(themeType));

        window.addEventListener("resize", switchDesktopView);

        return () => {
            window.removeEventListener("resize", switchDesktopView);
        };
    }, []);

    useEffect(() => {
        reduxDispatch(setPageTitle(AgencyService.getDashboardName() + ' - ' + i18next.t(`title.[/theme/theme-making]`)))
    })

    useEffect(() => {
        if (state.controller.isTranslate) {
            dispatch(
                ThemeMakingContext.actions.setSettingTab(
                    ThemeEngineConstants.SETTING_TAB.TRANSLATE_HINT
                )
            );
        } else {
            dispatch(
                ThemeMakingContext.actions.setSettingTab(
                    ThemeEngineConstants.SETTING_TAB.GENERAL_SETTING
                )
            );
        }
    }, [state.selectedStoreLang]);

    const switchDesktopView = () => {
        const w = window.innerWidth;
        if (w <= 670) {
            dispatch(
                ThemeMakingContext.actions.setPlatform(
                    ThemeEngineConstants.PLATFORM_TYPE.DESKTOP
                )
            );
        }
    };

    return (
        <div className="theme-theme-making" style={{ fontSize: "16px" }}>
            <ThemeMakingContext.provider value={{ state, dispatch }}>
                <div className="theme-making-grid">
                    <a
                        href="/"
                        className="logo-setting-bar"
                        style={{
                            backgroundImage: `url(${
                                store.getState().whiteLogo ||
                                store.getState().logo ||
                                "/assets/images/logo_gosell_theme.png"
                            })`,
                        }}
                    >
                        &nbsp;
                    </a>
                    <div className="page-and-setting">
                        <ThemePageList></ThemePageList>
                    </div>
                    <div className="platform-head-toolbar">
                        <ToolbarView></ToolbarView>
                    </div>
                    <div className="setting-bar-body">
                        <SettingBar></SettingBar>
                    </div>
                    <div className="page-content-body">
                        {state.settingTab ===
                            ThemeEngineConstants.SETTING_TAB
                                .GENERAL_SETTING && (
                            <GeneralSetting></GeneralSetting>
                        )}

                        {state.settingTab ===
                            ThemeEngineConstants.SETTING_TAB.ELEMENT_LIST && (
                            <ElementList
                                currentComponent={state.currentComponent}
                                currentPage={state.page}
                            ></ElementList>
                        )}

                        {state.settingTab ===
                            ThemeEngineConstants.SETTING_TAB
                                .ELEMENT_SETTING && (
                            <ElementSetting></ElementSetting>
                        )}

                        {state.settingTab ===
                            ThemeEngineConstants.SETTING_TAB.TRANSLATE_HINT && (
                            <TranslateHint></TranslateHint>
                        )}
                    </div>
                    <div className="theme-editor-body">
                        <div
                            className={
                                "d-flex h-100 w-100 m-0 p-0 justify-content-start align-items-stretch"
                            }
                        >
                            <HtmlEditor></HtmlEditor>
                        </div>
                    </div>
                </div>
            </ThemeMakingContext.provider>
        </div>
    );
};

export default connect()(React.forwardRef(ThemeMaking));
