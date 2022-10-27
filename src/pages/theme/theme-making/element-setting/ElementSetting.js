import './ElementSetting.sass'

import React, {useContext, useEffect, useState} from 'react'
import {ThemeMakingContext} from "../context/ThemeMakingContext"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import ElementStyle from "./../element-style/ElementStyle"
import ElementEditor from "./../element-editor/ElementEditor"
import i18n from '../../../../config/i18n'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import ThemeEngineConstants from "../ThemeEngineConstants";

const TAB = {
    STYLE: "STYLE",
    EDITOR: "EDITOR"
}

const ElementSetting = (props) => {
    const {state, dispatch} = useContext(ThemeMakingContext.context);
    const {currentComponent, controller, page} = state
    const [stTabModel, setStTabModel] = useState();

    useEffect(() => {
        if (!currentComponent) {
            return
        }

        if (controller.isTranslate) {
            setStTabModel(TAB.EDITOR)
        }

        setStTabModel(currentComponent.isChooseStyle ? TAB.STYLE : TAB.EDITOR)
    }, [currentComponent])

    const onTabClick = (tabName) => {
        if (controller.isTranslate) {
            return
        }

        setStTabModel(tabName);
    }

    const onBackClick = () => {
        if (controller.isTranslate) {
            dispatch(ThemeMakingContext.actions.setSettingTab(ThemeEngineConstants.SETTING_TAB.TRANSLATE_HINT));

            return
        }

        dispatch(ThemeMakingContext.actions.setSettingTab(ThemeEngineConstants.SETTING_TAB.ELEMENT_LIST));
        if (currentComponent && currentComponent.componentId === ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.NEW_LOCAL_COMPONENT_VALUE) {
            dispatch(ThemeMakingContext.actions.setCurrentComponent({
                componentType: null
            }))
        }
    }

    return (
        <div className="element-setting">
            {
                currentComponent &&
                <section className="all-setting">
                    <div className="title-element label-pdl">
                        <span className="back-arrow" onClick={onBackClick}><FontAwesomeIcon
                            icon={"long-arrow-alt-left"}/></span>
                        <span className="title"><GSTrans
                            t={`component.themeEditor.element.${currentComponent.componentType}.title`}>{currentComponent.componentType}</GSTrans></span>
                        <span className="empty"></span>
                    </div>

                    {/* FOR THE SETTING */}
                    <div className="tab-setting">
                        <div className={[
                            "tabt", stTabModel === TAB.STYLE ? "active" : "",
                            controller.isTranslate ? 'disabled' : ''
                        ].join(" ")}
                             onClick={() => onTabClick(TAB.STYLE)}>{i18n.t("page.themeEngine.editor.tab.style")}
                        </div>
                        <div className={["tabt", stTabModel === TAB.EDITOR ? "active" : ""].join(" ")}
                             onClick={() => onTabClick(TAB.EDITOR)}>{i18n.t("page.themeEngine.editor.tab.editor")}
                        </div>
                    </div>
                    <div className="content-setting">
                        {/* STYLE TAB */}
                        {
                            stTabModel === TAB.STYLE &&
                            <ElementStyle disabled={controller.isTranslate} currentComponent={currentComponent} currentPage={page}/>
                        }

                        {/* EDITOR TAB */}
                        {
                            stTabModel === TAB.EDITOR &&
                            <ElementEditor currentComponent={currentComponent}/>
                        }
                    </div>
                </section>
            }
        </div>
    );
};

export default ElementSetting
