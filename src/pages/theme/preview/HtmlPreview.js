import './HtmlPreview.sass';

import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import {ThemeMakingContext} from '../theme-making/context/ThemeMakingContext';
import GSImg from '../../../components/shared/GSImg/GSImg';
import ThemeEngineConstants from '../theme-making/ThemeEngineConstants';
import {ThemeEngineService} from '@services/ThemeEngineService'

const HtmlPreview = (props) => {
    const {state} = useContext(ThemeMakingContext.context);
    const [stSourceUrl, setStSourceUrl] = useState()
    
    useEffect(() => {
        if (!state.page?.viewName || !state.themeId) {
            return
        }
        
        ThemeEngineService.getPreviewMasterPage(state.page.viewName, state.themeId)
            .then(url => {
                setStSourceUrl(url) 
            })
        
    }, [state.page, state.themeId])

    useEffect(() => {
        const iframe = $("iframe#gs_iframe_editor");
        const iframeWrapper = $("div.iframe_container_wrapper");
        const iframeContainer = $("div#gs_iframe_container");
        iframe.contents().find("body").find('[platformvisible]').css("display", "");
        iframe.contents().find("body").css("overflow-x","hidden");
        iframe.contents().find("body").removeClass("smartphone");
        const viewMode = state.platform;
    
        switch (viewMode) {
          case ThemeEngineConstants.PLATFORM_TYPE.DESKTOP:
            iframe.css({
              'width': '100%',
              'height': '100%',
              'left': '',
              'margin-top': '',
              'margin-bottom': '',
              'transform': '',
              'position': ''
            });
            iframe.contents().find("body").find('[platformvisible="mobile"]').css("display", "none");
            iframeContainer.removeClass("iframe_container_responsive");
            iframeWrapper.removeClass("smartphone web-responsive");
            break;
          case ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE:
            iframe.contents().find("body").find('[platformvisible="mobile"]').css("display", "none");
            iframe.css({
              'width': '412px',
              'height': '813px',
              'left': '50%',
              'margin-top': '0px',
              'margin-bottom': '20px',
              'transform': 'translate(-50%, 0)',
              'position': 'absolute'
            });
            iframeContainer.addClass("iframe_container_responsive");
            iframeWrapper.addClass("web-responsive");
            iframeWrapper.removeClass("smartphone");
            break;
          case ThemeEngineConstants.PLATFORM_TYPE.MOBILE:
            iframe.contents().find("body").find('[platformvisible="web"]').css("display", "none");
            iframe.css({
              'width': '384px',
              'height': '613px',
              'left': '50%',
              'margin-top': '0px',
              'margin-bottom': '20px',
              'transform': 'translate(-50%, 0)',
              'position': 'absolute'
            });
            iframeContainer.addClass("iframe_container_responsive");
            iframeWrapper.addClass("smartphone");
            iframeWrapper.removeClass("web-responsive");
            break;
          default: break;
        }
    }, [state.platform])

    useEffect(() => {
        const iframe = $("iframe#gs_iframe_editor");
        iframe.contents().find("body").css("overflow-x","hidden");
    },[state.platform])

    const renderUI = () => {
        if (state.platform === ThemeEngineConstants.PLATFORM_TYPE.DESKTOP
            || state.platform === ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE
            || (state.platform === ThemeEngineConstants.PLATFORM_TYPE.MOBILE && !state.page.appPreview)) {
            return <iframe id="gs_iframe_editor" className="embed-responsive-item" src={stSourceUrl} scrolling='yes'></iframe>
        }

        return <GSImg width={600} src={state.page.appPreview} className='html-preview__img'></GSImg>
    }

    return (
        <>
            <div className={"d-flex h-100 w-100 m-0 p-0 justify-content-start align-items-stretch"}>
              <div className="html-preview">
                  <div id={"gs_iframe_container"} className={"iframecontainer embed-responsive embed-responsive-16by9"}>
                      <div className="iframe_container_wrapper">
                          {/* iframe load in here */}
                          {state.page && renderUI()}
                      </div>
                  </div>
                </div>
            </div>
        </>
    )
}

HtmlPreview.propTypes = {
    changeView: PropTypes.func,
    editMode: PropTypes.string
};

export default HtmlPreview;
