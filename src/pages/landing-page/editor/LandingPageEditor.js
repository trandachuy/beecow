import React, {useEffect, useReducer, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import './LandingPageEditor.sass'
import LandingPageEditorSetting from "./setting/LandingPageEditorSetting";
import {LandingPageEditorContext} from "./context/LandingPageEditorContext";
import LandingPageEditorLivePreview from "./live-preview/LandingPageEditorLivePreview";
import {ThemeService} from "../../../services/ThemeService";
import LandingPageElementEditor from "./element-editor/LandingPageElementEditor";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {ColorUtils} from "../../../utils/color";
import {withRouter} from "react-router-dom";

export const LANDING_PAGE_EDITOR_MODE = {
    EDIT: 'EDIT',
    CREATE: 'CREATE'
}

export const LANDING_PAGE_DOMAIN_OPTIONS = {
    FREE: 'FREE',
    CUSTOM: 'CUSTOM',
    INSTRUCTION: 'instruction'
}

export const LANDING_PAGE_SUB_DOMAIN_OPTIONS = {
    LANDING_GOSELL: 'GOSELL',
    SF_WEB: 'STORE_FRONT'
}

const LandingPageEditor = props => {
    const [state, dispatch] = useReducer(LandingPageEditorContext.reducer, LandingPageEditorContext.initState);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stTemplateList, setStTemplateList] = useState([]);

    const refDomainValue = useRef()

    useEffect(() => {
        ThemeService.getAllLandingPage()
            .then(result => {
                const templateList = result.map(r => {
                    r.thumbnail = JSON.parse(r.thumbnail)
                    return r;
                })
                setStIsFetching(false)
                setStTemplateList(templateList)

                // if it is create mode -> select the first template
                if (props.mode === LANDING_PAGE_EDITOR_MODE.CREATE && templateList.length > 0) {
                    const selectedTemplate = templateList[0]
                    dispatch(LandingPageEditorContext.actions.setCurrentTemplate(selectedTemplate))
                    // set the first part
                    dispatch(LandingPageEditorContext.actions.setCurrentTemplateHtmlId(selectedTemplate.thumbnail[0].htmlId))
                    // set content
                    dispatch(LandingPageEditorContext.actions.setContentHtml(selectedTemplate.content))
                }

                // edit mode
                if (props.mode === LANDING_PAGE_EDITOR_MODE.EDIT) {
                    ThemeService.getLandingPageById(props.pageId)
                        .then(lp => {
                            const selectedTemplate = templateList.find(template => template.id === lp.templateId)

                            // add style from template to body
                            let contentHtml = selectedTemplate.content.replace(/<body(.*?)>(.*?)<\/body>/s, `<body>${lp.contentHtml}</body>`)
                            // apply new color
                            const primaryColor = lp.primaryColor;
                            const filter = ColorUtils.hexToFilter(primaryColor)
                            contentHtml = contentHtml.replace(/\.gs-background-color(.*?);}/s, `.gs-background-color{background-color: ${primaryColor};}`)
                             contentHtml = contentHtml.replace(/\.gs-border-color(.*?);}/s, `.gs-border-color{border-color: ${primaryColor};}`)
                             contentHtml = contentHtml.replace(/\.gs-font-color(.*?);}/s, `.gs-font-color{color: ${primaryColor};}`)
                             contentHtml = contentHtml.replace(/\.gs-filter-color\{filter: (.*?);}/s, `.gs-filter-color{filter: ${filter};}`)


                            dispatch(LandingPageEditorContext.actions.setState({
                                setting: {
                                    domainType: lp.domainType,
                                    subDomainType: lp.freeDomainType,
                                    domainValue: lp.slug,
                                    customDomain: lp.domain,
                                    currentTemplate: selectedTemplate,
                                    currentTemplateHtmlId: selectedTemplate.thumbnail[0].htmlId,
                                    title: lp.title,
                                    description: lp.description,
                                    customerTag: lp.customerTag,
                                    fbId: lp.fbPixelId,
                                    ggId: lp.ggAnalyticsId,
                                    seoTitle: lp.seoTitle,
                                    seoDescription: lp.seoDescription,
                                    seoKeywords: lp.seoKeywords,
                                    seoThumbnail: lp.seoThumbnail,
                                    fbChatId: lp.fbChatId,
                                    zlChatId: lp.zlChatId
                                },
                                id: lp.id,
                                status: lp.status,
                                contentHtml: contentHtml,
                                primaryColor: lp.primaryColor,
                                popupSettingShow: lp.popupMainShow ? lp.popupMainShow : false,
                                popupSettingTime: lp.popupMainTime ? lp.popupMainTime : 3
                            }))
                        }).catch(e => {
                            dispatch(LandingPageEditorContext.actions.setConfirmWhenRedirect(false))
                            RouteUtils.redirectWithoutReload(props, NAV_PATH.notFound)
                    })
                }
            })
    }, []);

    const isValid = () => {
        return refDomainValue.current.isValid()
    }

    return (
        <>
            <LandingPageEditorContext.provider value={{state, dispatch}}>
                <GSContentContainer className="landing-page-editor gsa-reset"
                                    isLoading={stIsFetching}
                                    isSaving={state.isSaving}
                                    confirmWhenRedirect={state.isConfirmWhenRedirect}
                >
                    <GSContentBody size={GSContentBody.size.MAX} className="landing-page-editor__body">
                        <section className={"landing-page-editor__pane--left gsa-border-color--gray gs-atm__scrollbar-1 landing-page-editor__pane--" + (state.isShowSetting? 'open':'close')}>
                            <LandingPageEditorSetting ref={refDomainValue} templateList={stTemplateList} />
                        </section>
                        <section className="landing-page-editor__pane--middle">
                            <LandingPageEditorLivePreview mode={props.mode} isValid={isValid}/>
                        </section>
                        <section className="landing-page-editor__pane--right">
                            <LandingPageElementEditor/>
                        </section>
                    </GSContentBody>
                </GSContentContainer>
            </LandingPageEditorContext.provider>
        </>
    );
};

LandingPageEditor.propTypes = {
    mode: PropTypes.oneOf([LANDING_PAGE_EDITOR_MODE.CREATE, LANDING_PAGE_EDITOR_MODE.EDIT]).isRequired,
    pageId: PropTypes.number,
};

export default withRouter(LandingPageEditor);
