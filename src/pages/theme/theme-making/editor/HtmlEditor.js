import "./HtmlEditor.sass";

import React, {useContext, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import $ from 'jquery';
import cheerio from 'cheerio';
import {ThemeEngineService} from "../../../../services/ThemeEngineService";
import i18n from "../../../../config/i18n";
import ThemeEngineUtils from "../ThemeEngineUtils";
import {GSToast} from "../../../../utils/gs-toast";
import {styleIframeEditMode, styleIframeEditor, styleMobilePlatform, toolbar, toolbarScript} from './EditToolbarArea';
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {generatePath} from "react-router-dom";
import GSAlertModal, {GSAlertModalType} from "../../../../components/shared/GSAlertModal/GSAlertModal";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import ThemeEngineConstants from "../ThemeEngineConstants";
import storageService from "../../../../services/storage.js";
import Constants from "../../../../config/Constant.js";
import i18next from "i18next";
import {attemptToFindElement} from '../../../../utils/class-name'

export const iframeScrollTo = (top = 0, left = 0) => {
  const frame = $("iframe#gs_iframe_editor");
  const frameWindow = (frame.length > 0 )? frame[0].contentWindow: window;
  frameWindow.scrollTo({
    top,
    left,
    behavior: 'smooth'
  });
}

const HtmlEditor = () => {

  let refDeleteModal = useRef();
  let refAlertModal = useRef();
  const { state, dispatch } = useContext(ThemeMakingContext.context);
  const [comp, setComp] = useState({ "id": "", "title": "", "content": null });
  const [stLoading, setStLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    $(document).ready(onChangeView)
  }, [state.platform])

  useEffect(() => {
    $(document).ready(changePage)
  }, [state.page, state.themeType, state.selectedStoreLang])

  useEffect(() => {
    if (!state.returnComponent) {
      return
    }

    $(document).ready(updateComponent)
  }, [state.returnComponent])

  useEffect(() => {
    if (!state.changeLogo) {
      return
    }

    $(document).ready(changeLogoFunction)
  }, [state.changeLogo])

  useEffect(() => {
    if (!state.changeFont) {
      return
    }

    $(document).ready(changeFontFunction)
  }, [state.changeFont])

  useEffect(() => {
    if (!state.changeColorPrimary) {
      return
    }

    $(document).ready(changeColorPrimaryFunction)
  }, [state.changeColorPrimary])

  useEffect(() => {
    if (!state.changeColorSecondary) {
      return
    }

    $(document).ready(changeColorSecondaryFunction)
  }, [state.changeColorSecondary])

  useEffect(() => {
    $(document).ready(setTimeout(injectLoadIframe,0))
  }, [state.pageContent])

  useEffect(() => {
    $(document).ready(showSlideAtPosition)
  }, [state.showSlide])

  useEffect(() => {
    $(document).ready(updateFrameState)
  }, [state])

  const getGUID = () => {
    return 'gs_' + Math.random().toString(36).substr(2, 9);
  }

  const changeLogoFunction = () => {
    let $logoFind = $("iframe#gs_iframe_editor").contents().find("body");
    if(state.changeLogo && $logoFind.length > 0) {
      $logoFind.find('.gs-shop-logo').each(function(index, ele){
        $(ele).attr("src", state.changeLogo);
        $(ele).attr("srcset", state.changeLogo);
      });
    }
  }

  const changeFontFunction = () => {
    let $fontColor = $("iframe#gs_iframe_editor").contents().find('head');
    if(state.changeFont != undefined && $fontColor.length > 0){

      const font = state.changeFont === '' ? 'Roboto' : state.changeFont + ', Roboto';

      if($fontColor.find('#gs-font-style').length > 0){
        // has exist before, just replace the style
        $fontColor.find('#gs-font-style').replaceWith(`<style id="gs-font-style">* {font-family: ${font}}</style>`);
      }else{
        $fontColor.append(`<style id="gs-font-style">* {font-family: ${font}}</style>`)
      }
    }
  }

  const changeColorPrimaryFunction = () => {
    let $colorPrimary = $("iframe#gs_iframe_editor").contents().find('body');
    if(state.changeColorPrimary && $colorPrimary.length > 0){
      $colorPrimary.find('.gst-p-background-color').css("background-color", "#" + state.changeColorPrimary);
      $colorPrimary.find('.gst-p-background-color--hover').css("background-color", "#" + state.changeColorPrimary);
      $colorPrimary.find('.gst-p-color').css("color", "#" + state.changeColorPrimary);
      $colorPrimary.find('.gst-p-border-color').css("border-color", "#" + state.changeColorPrimary);
      $colorPrimary.find('.gst-p-svg-fill').css("fill", "#" + state.changeColorPrimary);
    }
  }

  const changeColorSecondaryFunction = () => {
    let $colorSecondary = $("iframe#gs_iframe_editor").contents().find('body');
    if(state.changeColorSecondary && $colorSecondary.length > 0){
      $colorSecondary.find('.gst-s-background-color').css("background-color", "#" + state.changeColorSecondary);
      $colorSecondary.find('.gst-s-background-color--hover').css("background-color", "#" + state.changeColorSecondary);
      $colorSecondary.find('.gst-s-color').css("color", "#" + state.changeColorSecondary);
      $colorSecondary.find('.gst-s-border-color').css("border-color", "#" + state.changeColorSecondary);
      $colorSecondary.find('.gst-s-svg-fill').css("fill", "#" + state.changeColorSecondary);
    }
  }

  /**
   * get current change and push request server to get new changes
   */
  const updateComponent = () => {
    const {componentValue, componentStyle, componentType, componentSchema, componentDefaultValue = '', componentContent} = state.returnComponent || {};
    //keep origin component selected for next step
    const currentComponent = $(comp.content).clone();
    const currentCompType = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE);
    const newComponentType = componentContent ? componentContent.cpType : componentType;
    const isNewElement = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY) === ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.NEW_LOCAL_COMPONENT_VALUE;

    //not allow more than one header or footer
    if ((isNewElement || (currentCompType !== newComponentType))
        && (
            newComponentType === ThemeEngineConstants.ELEMENT_TYPE.HEADER
            || newComponentType === ThemeEngineConstants.ELEMENT_TYPE.FOOTER
            || newComponentType === ThemeEngineConstants.ELEMENT_TYPE.PRODUCT_BUYING
            || newComponentType === ThemeEngineConstants.ELEMENT_TYPE.SERVICE_BOOKING
            || newComponentType === ThemeEngineConstants.ELEMENT_TYPE.PRODUCT_COLLECTION_LIST
            || newComponentType === ThemeEngineConstants.ELEMENT_TYPE.SERVICE_COLLECTION_LIST
            
        )
    ) {
      if (!refAlertModal.isOpen()) {
        refAlertModal.openModal({
            type: AlertModalType.ALERT_TYPE_DANGER,
            messages: i18next.t(`page.themeEngine.modal.alert.component.text.${newComponentType}`)
        });
      }
      return provideDataForEditor(currentComponent);
    }

    let content;
    const superElement = $('<section/>')

    if(componentContent) {
      //Change to new element style
      let dataValue = "";

      if (componentContent.defaultValue) {
        dataValue = JSON.parse(componentContent.defaultValue);
        dataValue = JSON.stringify(dataValue).replace(/'/g, '&apos;');
      } else {
        dataValue = componentDefaultValue
      }

      newComponentType === ThemeEngineConstants.ELEMENT_TYPE.FREE_HTML && superElement.addClass('section-min-height')
      superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY, componentContent.nameId)
      superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE, componentContent.cpType)
      superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY, 'schema')
      superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY, 'dataValue')
      componentContent.async && superElement.attr('cpasync', 'true')
      componentContent.cacheable && superElement.attr('cpcacheable', 'true')

      if (currentComponent && !isNewElement && currentCompType === newComponentType) {
        const platformVisible = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.PLATFORM_VISIBLE);
        const showOnLocations = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.SHOW_ON_LOCATIONS);
        const removeOnLocations = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.REMOVE_ON_LOCATIONS);
        const locationMode = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.LOCATION_MODE);
        const locationPlatform = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.LOCATION_PLATFORM);

        platformVisible && superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.PLATFORM_VISIBLE, platformVisible)
        showOnLocations && superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.SHOW_ON_LOCATIONS, showOnLocations)
        removeOnLocations && superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.REMOVE_ON_LOCATIONS, removeOnLocations)
        locationMode && superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.LOCATION_MODE, locationMode)
        locationPlatform && superElement.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.LOCATION_PLATFORM, locationPlatform)
      }

      content = superElement.get(0).outerHTML

      content = content.replace(`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY}="schema"`,`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY}='${componentContent.schema || ''}'`)
      content = content.replace(`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY}="dataValue"`,`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY}='${dataValue || ''}'`)
    } else {
      //Update current component
      currentComponent.empty();
      //apply new attr value
      currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY, "data");
      currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_STYLE, componentStyle);
      currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE, componentType);
      currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY, "schema");
      currentComponent.removeAttr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_MOCK_VALUE_KEY)
      currentComponent.removeAttr("style");
      //composing new content
      const dataValue = componentValue ? JSON.stringify(componentValue).replace(/'/g, '&apos;') : '';
      const schemaValue = componentSchema ? JSON.stringify(componentSchema) : '';

      //replace double quote to single quote of cpmockvalue
      let mockValueAttr = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_MOCK_VALUE_KEY)

      if (mockValueAttr) {
        mockValueAttr =  mockValueAttr.replace(/'/g, '&apos;')
        currentComponent.attr(`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_MOCK_VALUE_KEY}`, "mockvalue")
      }

      content = currentComponent.get(0).outerHTML;

      content = content.replace(`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_MOCK_VALUE_KEY}="mockvalue"`,`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_MOCK_VALUE_KEY}='${mockValueAttr}'`)
      content = content.replace(`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY}="schema"`,`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY}='${schemaValue}'`)
      content = content.replace(`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY}="data"`,`${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY}='${dataValue}'`)
    }

    setStLoading(true)

    const data = { content: content, storeId: "" };
    const langKey = storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);

    ThemeEngineService.getUIComponent(data, langKey)
        .then((resp) => {
          let newData = $(resp);
          let oldComp = $(comp.content);
          const newKey = getGUID();
          const compName = newData.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY);
          newData.attr(ThemeEngineConstants.EDITOR_CONSTANT.COMP_UNIQUE_KEY, newKey);
          newData.addClass(`${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.DISABLED_EVENTS_CLASS} ${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS}`);
          //get new component type
          const newCompType = newData.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE);
          //get component actions
          const newCompActions = newData.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_ACTIONS) || '';
          //updated reference comp selected before manipulation on dom element
          setComp({id: newKey, content: newData, title: compName});
          //final step
          provideDataForEditor(newData);
          //apply new component to page
          appendNewComponent(oldComp, newData);
          newData.prepend(toolbar(compName, newCompType, newCompActions, {hiddenActions: state.controller.isTranslate}));
          actionSlider(newData);
          checkMovingAction(newData);
        })
        .catch((e) => {
          console.log(e)
          GSToast.commonError()
        })
        .finally(() => setStLoading(false))
  }

  const actionSlider = (ele) => {
    const {frameWindow} = getFrameState();
    const sliderContainer = (frameWindow.$().GosellSliderRegister)? frameWindow.$().GosellSliderRegister(ele): null;
    if(sliderContainer) {
      const pos = state.showSlide < 0? 0: state.showSlide;
      sliderContainer.pause();
      sliderContainer.show(pos);
    }
  }

  /**
   * replace old html section to new section
   */
  const appendNewComponent = (currentComponent, newComponent) => {
    const newCompType = newComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE);
    const currentCompType = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE);
    const isNewComponent = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY) === ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.NEW_LOCAL_COMPONENT_VALUE;
    const compId = currentComponent.attr(ThemeEngineConstants.EDITOR_CONSTANT.COMP_UNIQUE_KEY);
    componentPlatformVisible(newComponent);

    if(newCompType === currentCompType || isNewComponent) {
      $("iframe#gs_iframe_editor").contents().find("body").find(`[${ThemeEngineConstants.EDITOR_CONSTANT.COMP_UNIQUE_KEY}=${compId}]`).replaceWith(newComponent);
    } else if(currentCompType !== newCompType) {
      removeCurrentSelected(currentComponent);
      let html = $("iframe#gs_iframe_editor").contents().find("body").find(`section[${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}="body"]`);
      let htmlWrapper = html.find(`section.tm-wrapper`);
      if(htmlWrapper && htmlWrapper.length > 0) {
        html = htmlWrapper;
      }
      if(!currentCompType || currentCompType === ThemeEngineConstants.ELEMENT_TYPE.HEADER) {
        html.prepend(newComponent);
      } else if(currentCompType === ThemeEngineConstants.ELEMENT_TYPE.FOOTER) {
        html.append(newComponent);
      } else {
        currentComponent.after(newComponent);
      }
    }
  }

  /**
   * deleted selected component
   */
  const removeCurrentSelected = (currentComp) => {
    if(currentComp && currentComp.length >0) {
      currentComp.removeClass(`${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.DISABLED_EVENTS_CLASS} ${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS}`);
      currentComp.find("div#iframe-toolbar-editor").remove();
    }
  }

  /**
   * hide if component doesn't display in current view mode
   */
  const componentPlatformVisible = (componentContent) => {
    if(!componentContent) return;
    const viewMode = state.platform;
    switch (viewMode) {
      case ThemeEngineConstants.PLATFORM_TYPE.DESKTOP:
        componentContent.find('[platformvisible="mobile"]').css("display", "none");
        break;
      case ThemeEngineConstants.PLATFORM_TYPE.RESPONSIVE:
        componentContent.find('[platformvisible="mobile"]').css("display", "none");
        break;
      case ThemeEngineConstants.PLATFORM_TYPE.MOBILE:
        componentContent.find('[platformvisible="web"]').css("display", "none");
        break;
      default: break;
    }
  }

  /**
   * switch between view mode
   */
  const onChangeView = () => {
    const iframe = $("iframe#gs_iframe_editor");
    const iframeWrapper = $("div.iframe_container_wrapper");
    const iframeContainer = $("div#gs_iframe_container");
    iframe.contents().find("body").find('[platformvisible]').css("display", "");
    iframe.contents().find("body").css("overflow-x","hidden");
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
        iframe.contents().find("head").find("style#iframe-editor-style-platform-mobile").remove();
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
        iframe.contents().find("head").find("style#iframe-editor-style-platform-mobile").remove();
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
        iframe.contents().find("head").append(styleMobilePlatform());
        break;
      default: break;
    }
  }

  /**
   * trigger action get selected page 
   */
  const changePage = () => {
    const objPage = state.page;
    const themeType = state.themeType;
    //build request api to load page
    if (objPage) {
      setComp({id: "", title: "", content: null});
      const url = new URL(window.location);
      const pageType = objPage.type;
      const storeThemeId = objPage.storeThemeId;

      const langKey = storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
      if (themeType === ThemeEngineConstants.THEME_TYPE.STORE) {
        if(pageType === ThemeEngineConstants.PAGE_TYPE.CUSTOM) {
          const pageId = objPage.id;
          pageResult(ThemeEngineService.getCustomPageInThemeEngine(storeThemeId, pageType, pageId, langKey), pageType);
        } else {
          pageResult(ThemeEngineService.modifiedPageByStoreId(storeThemeId, pageType, langKey), pageType);
        }
      } else if(themeType === ThemeEngineConstants.THEME_TYPE.MASTER) {
        const storeThemeId = (url.searchParams)? url.searchParams.get('switchStoreThemeId'): null;
        const masterThemeId = objPage.masterThemeId;

        if(storeThemeId && storeThemeId.length > 0) {
          pageResult(ThemeEngineService.modifiedClonePageByStoreIdAndThemeId(masterThemeId, storeThemeId, langKey), pageType);
        } else {
          pageResult(ThemeEngineService.modifiedPageByThemeId(masterThemeId, langKey), pageType);
        }
      }
    }
  }

  const pageResult = (oPromise, pageType) => {
    $("div#loading-iframe-content").css({"visibility": "visible"});
    $("div#iframe-error-loading-content").css({"visibility": "hidden"});
    $("div#gs_iframe_container").css({"visibility": "hidden"});

    oPromise.then((data) => {
      dispatch(ThemeMakingContext.actions.setListEditPages(data));
      const pages = (data && data.pages) ? data.pages : null;
      const oFilters = (pages && pages.length > 0) ? (pages.filter(e => { return e.type === pageType })) : [];
      const { content, rawContent } = (oFilters.length > 0) ? oFilters[0] : { content: "", rawContent: "" };
      createIFramePreview(content, rawContent);
    }).catch((e) => {
      console.log(e)
      GSToast.commonError();
      $("div#iframe-error-loading-content").css({"visibility": "visible"});
    }).finally(() => {
      $("div#loading-iframe-content").css({"visibility": "hidden"});
      $("div#gs_iframe_container").css({"visibility": "visible"});
    });
  }

  const updateFrameState = ({ name , value} = {}) => {
    const frame = $("iframe#gs_iframe_editor");
    const frameWindow = (frame.length > 0 )? frame[0].contentWindow: {};
    frameWindow.$$state = (name && value)? ({...frameWindow.$$state}): state;
    frameWindow.$$addition = frameWindow.$$addition || {};
    if(name && value) {
      frameWindow.$$addition[name] = value;
    }
  }

  const getFrameState = () => {
    const frame = $("iframe#gs_iframe_editor");
    const frameWindow = (frame.length > 0 )? frame[0].contentWindow: {state: {}, $$addition: {}};
    return {"state": frameWindow.$$state, "GosselSmartSlider": frameWindow.$$$GosselSmartSlider, frameWindow: frameWindow, ...frameWindow.$$addition};
  }

  const showSlideAtPosition = () => {
    const pos = state.showSlide < 0? 0: state.showSlide;
    const {GosselSmartSlider} = getFrameState();
    const ele = $(comp.content).find(`[${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.SLIDER_KEY_ATTR_NAME}]`);
    if(ele && ele.length > 0) {
      const sliderKey = $(ele).attr(ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.SLIDER_KEY_ATTR_NAME);
      if(sliderKey) {
        GosselSmartSlider[sliderKey].show(pos);
      }
    }
  }

  const parseValue = (value) => {
    let result  = null;
    try {
      result = ThemeEngineUtils.parseString(value);
    } catch(error) {
      console.log(error);
    }
    return result;
  }

  const provideDataForEditor = (component) => {
    try {
      const mockValue = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_MOCK_VALUE_KEY) || null;
      const dataMock = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_MOCK_VALUE_KEY) || null;
      const dataStore = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_DATA_VALUE_KEY) || null;
      const compType = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE) || '';
      const dataStyle = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_STYLE) || '';
      const compSchema = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_SCHEMA_KEY) || null;
      const compId = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY);
      const compHash = component.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_HASH);

      let commonElementModel = {
        componentType: compType,
        componentValue: parseValue(dataStore) || parseValue(mockValue) || parseValue(dataMock),
        componentStyle: dataStyle,
        componentSchema: parseValue(compSchema),
        componentId: compId,
        componentHash: compHash,
      };

      //transfer data to editor
      dispatch(ThemeMakingContext.actions.editSubElementReturn(null));
      dispatch(ThemeMakingContext.actions.setCurrentComponent(commonElementModel));
    } catch (error) {
      console.log(error);
    }
  }

  const openNavigation = (e) => {
    if(state.page.type === "CUSTOM_PAGE") {
      window.open( generatePath(NAV_PATH.editCustomPage +"/"+ state.page.id), "_blank");
    }
  }

  /**
   * detect action while click on component
   */
  const onClickComponent = (e) => {
    e.preventDefault();
    const currentComp = $(e.currentTarget);
    const {state, GosselSmartSlider} = getFrameState();
    const eleId = $(e.target).attr("id");
    if(eleId) {
      switch (eleId) {
        case "edit-toolbar-plus-above":
          addSectionAbove(currentComp);
          return;
        case "edit-toolbar-arrow-up":
          moveComponentUp(currentComp);
          return;
        case "edit-toolbar-arrow-down":
          moveComponentDown(currentComp);
          return;
        case "edit-toolbar-trash":
          deleteComponent(currentComp);
          return;
        case "edit-toolbar-plus-below":
          addSectionBelow(currentComp);
          return;
        case "edit-toolbar-navigation":
          openNavigation(currentComp);
          return;
        default:
          break;
      }
    }
    let html = $("iframe#gs_iframe_editor").contents().find("body");
    if(!state || state.editMode === false) return;
    let compName = "", compType = "", compActions = "";
    const key = getGUID();

    try {
      html.find("section["+ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY+"]").removeClass(`${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.DISABLED_EVENTS_CLASS} ${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS}`);
      html.find("section["+ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY+"]").find("div#iframe-toolbar-editor").remove();
      //get component name
      compName = currentComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY);
      //get component type
      compType = currentComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE) || '';
       //get component actions
      compActions = currentComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_ACTIONS) || '';
      //set identifier for component
      currentComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.COMP_UNIQUE_KEY, key);
      stopEmbbedVideo(currentComp);
      currentComp.addClass(`${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.DISABLED_EVENTS_CLASS} ${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS}`);
      //make  toolbar edit visible in component
      if(compName === ThemeEngineConstants.ELEMENT_TYPE.CUSTOM_PAGE) {
        currentComp.removeClass("container-fluid");
      }
      currentComp.prepend( toolbar(compName, compType, compActions, {hiddenActions: state.controller.isTranslate}) );
    } catch(e) {
      console.log(e);
    }

    try {
      const compKey = currentComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY) || '';
      //detect new element creation
      //const newComp = currentComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.ATTR_COMP_NEW_SECTION_KEY);

      provideDataForEditor(currentComp);

      //pause slider
      const sliderComp = currentComp.find(`[${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.SLIDER_KEY_ATTR_NAME}]`);
      if(sliderComp && sliderComp.length > 0) {
        const attrKey = sliderComp.attr(ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.SLIDER_KEY_ATTR_NAME);
        GosselSmartSlider[attrKey].pause();
      }

      if(compKey === ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.NEW_LOCAL_COMPONENT_VALUE) {
        dispatch(ThemeMakingContext.actions.setSettingTab(ThemeEngineConstants.SETTING_TAB.ELEMENT_LIST));
      }
    } catch (e) {
      console.log(e);
    }
    setComp({ title: compName, content: currentComp, id: key });
    //updateFrameState({name: "prevComp", value: currentComp.clone()});
    checkMovingAction(currentComp);
  }

  const iframeContentLoaded = () => {
    dispatch(ThemeMakingContext.actions.setLockChangePage(false));
  }

  /**
   * load html to frame from editor content changes
   */
  const injectLoadIframe = () => {
    $("iframe#gs_iframe_editor").remove();
    const iContent = state.pageContent || '<html></html>';
    $("div.iframe_container_wrapper").prepend($("<iframe>").attr({ "srcdoc": iContent, "id": "gs_iframe_editor", 'scrolling': 'yes' }));

    const iframe = $("iframe#gs_iframe_editor").contents().find("body");
    const ifrContent = iframe && iframe.length > 0? iframe.get(0): null;

    $("iframe#gs_iframe_editor").on('load', function (evt) {
      let windowFrame = $("iframe#gs_iframe_editor").contents().find("html")

      //binding event on each component
      $(windowFrame).on("click", `section[${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY}]:not([${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}])`, onClickComponent);
      attemptToFindElement($("iframe#gs_iframe_editor").contents().find("body").children(), iframeContentLoaded)
    })

    if(ifrContent) {
      // var mutationObserver = new MutationObserver(function(mutations) {
      //   mutations.forEach(function(mutation) {
      //     console.log(mutation);
      //   });
      // });

      // Starts listening for changes in the root HTML element of the page.
      // mutationObserver.observe(ifrContent, {
      //   attributes: true,
      //   characterData: true,
      //   childList: true,
      //   subtree: true,
      //   attributeOldValue: true,
      //   characterDataOldValue: true
      // });

      // refresh the data of general setting
      let interval = setInterval(function(){

        let $content = $("iframe#gs_iframe_editor").contents();

        let $colorPrimary = $content.find(':root');
        if(state.changeColorPrimary && $colorPrimary.length > 0){
          $colorPrimary.find('.gst-p-background-color').css("background-color", "#" + state.changeColorPrimary);
          $colorPrimary.find('.gst-p-background-color--hover').css("background-color", "#" + state.changeColorPrimary);
          $colorPrimary.find('.gst-p-color').css("color", "#" + state.changeColorPrimary);
          $colorPrimary.find('.gst-p-border-color').css("border-color", "#" + state.changeColorPrimary);
          $colorPrimary.find('.gst-p-svg-fill').css("fill", "#" + state.changeColorPrimary);
        }

        let $colorSecondary = $content.find(':root');
        if(state.changeColorSecondary && $colorSecondary.length > 0){
          $colorSecondary.find('.gst-s-background-color').css("background-color", "#" + state.changeColorSecondary);
          $colorSecondary.find('.gst-s-background-color--hover').css("background-color", "#" + state.changeColorSecondary);
          $colorSecondary.find('.gst-s-color').css("color", "#" + state.changeColorSecondary);
          $colorSecondary.find('.gst-s-border-color').css("border-color", "#" + state.changeColorSecondary);
          $colorSecondary.find('.gst-s-svg-fill').css("fill", "#" + state.changeColorSecondary);
        }

        let $logo = $content.find('.gs-shop-logo');
        if(state.changeLogo && $logo.length > 0) {
          $logo.each(function(index, ele){
            $(ele).attr("src", state.changeLogo);
            $(ele).attr("srcset", state.changeLogo);
          });
        }

        let $fontColor = $content.find('head');
        if(state.changeFont != undefined && $fontColor.length > 0){
          const font = state.changeFont === '' ? 'Roboto' : state.changeFont + ', Roboto';

          if($fontColor.find('#gs-font-style').length > 0){
            // has exist before, just replace the style
            $fontColor.find('#gs-font-style').replaceWith(`<style id="gs-font-style">* {font-family: ${font}}</style>`);
          }else{
            $fontColor.append(`<style id="gs-font-style">* {font-family: ${font}}</style>`)
          }
        }

        $content.find("head").find("style#iframe-editor-style-platform-mobile").remove();

        clearInterval(interval);
      }, 500);
    }
  }

  /**
   * prevent auto action from video and frame in html source
   */
  const stopEmbbedVideo = ( element ) => {
    if(element && element.length > 0) {
      var iframe = element.get(0).querySelector("iframe");
      var video = element.get(0).querySelector("video");
      if ( iframe !== null ) {
          var iframeSrc = iframe.src;
          iframe.src = iframeSrc;
      }
      if ( video !== null ) {
          video.pause();
      }
    }
  };

  /**
   * check page return and firing editor content changed
   */
  const createIFramePreview = (content) => {
    let html = cheerio.load(content);
    html("head").append(toolbarScript());
    html("head").append(styleIframeEditor());
    html("head").append(styleIframeEditMode(ThemeEngineConstants.EDITOR_CONSTANT));
    const countChild = html("body").children().length;
    if(countChild === 0) {
      html("body").append(`<div class="d-flex w-100 h-100 justify-content-center align-items-center page-load-error">
        <h1 class="error-title">${i18n.t("page.themeEngine.view.page.empty")}</h1>
      </div>`);
    }
    dispatch(ThemeMakingContext.actions.setEditorContent(html.html()));
  }

  /**
   * create empty component 
   */
  const htmlNewSection = () => {
    return `
    <section class="${ThemeEngineConstants.EDITOR_CONSTANT.IFRAME_KEY.ADD_NEW_COMPONENT_CLASS}"
      ${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY}="${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.NEW_LOCAL_COMPONENT_VALUE}"
      ${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE}=""
      ${ThemeEngineConstants.EDITOR_CONSTANT.ATTR_COMP_NEW_SECTION_KEY}="${ThemeEngineConstants.EDITOR_CONSTANT.ATTR_COMP_NEW_SECTION_VALUE}"
      ${ThemeEngineConstants.EDITOR_CONSTANT.COMP_UNIQUE_KEY}="${getGUID()}">
      <h1 class="title"><p>${i18n.t("page.themeEngine.view.element.new.title")}</p></h1>
    </section>`;
  }

  /**
   * check action toolbar area while select on component
   */
  const checkMovingAction = (currentComp) => {
    if(currentComp && currentComp.length > 0) {
      //const cpType = currentComp.attr("cptype");
      const cpActions = currentComp.find("div#iframe-toolbar-editor").attr("component-actions") || '{}';
      const actions = JSON.parse(cpActions);
      /* if(cpType === "HEADER" || cpType === "FOOTER") {
        currentComp.find("img#edit-toolbar-arrow-down").attr("disabled",true);
        currentComp.find("img#edit-toolbar-arrow-up").attr("disabled",true);
        currentComp.find("img#edit-toolbar-trash").attr("disabled",true);
        return;
      } */
      currentComp.find("img#edit-toolbar-arrow-down").attr("disabled", actions.move? false: true);
      currentComp.find("img#edit-toolbar-arrow-up").attr("disabled", actions.move? false: true);
      currentComp.find("img#edit-toolbar-trash").attr("disabled", actions.remove? false: true);
      const prevComp = currentComp.prev();
      const nextComp = currentComp.next();
      //not allow moving from component action
      if(actions.move === false) return;
      if(!prevComp || prevComp.length === 0) {
        currentComp.find("img#edit-toolbar-arrow-up").attr("disabled", true);
      }
      if(!nextComp || nextComp.length === 0) {
        currentComp.find("img#edit-toolbar-arrow-down").attr("disabled",true);
      }
      setTimeout(function() {
        const {top} = currentComp.offset();
        iframeScrollTo(top);
      }, 100)
    }
  }

  /**
   * action delete component
   */
  const deleteComponent = (e) => {
    const compContent = e;
    if(compContent) {
      refDeleteModal.current.openModal({
          modalTitle: i18n.t('common.txt.confirm.modal.title'),
          messages: i18n.t("page.themeEngine.modal.delete.body.text"),
          modalAcceptBtn: i18n.t('common.btn.delete'),
          modalCloseBtn: i18n.t('common.btn.cancel'),
          type: GSAlertModalType.ALERT_TYPE_DANGER,
          acceptCallback: () => {
            setComp({title: "", content: null, id: ""});
            compContent.remove();
            dispatch(ThemeMakingContext.actions.setCurrentComponent(null));
          }
      })
    }
  }

  /**
   * action move component up
   */
  const addSectionAbove = (e) => {
    const compContent = e;
    if(compContent) {
      //get component type
      const compType = compContent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE) || '';
      const htmlSection = $(htmlNewSection());
      if(compType === ThemeEngineConstants.ELEMENT_TYPE.FOOTER) {
        let html = $("iframe#gs_iframe_editor").contents().find("body").find(`section[${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}="body"]`);
        let htmlWrapper = html.find(`section.tm-wrapper`);
        if(htmlWrapper && htmlWrapper.length > 0) {
          html = htmlWrapper;
        }
        html.append(htmlSection);
      } else {
        compContent.before(htmlSection);
      }
    }
  }

  /**
   * action move component down
   */
  const addSectionBelow = (e) => {
    const compContent = e;
    if(compContent) {
      //get component type
      const compType = compContent.attr(ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.COMPONENT_TYPE) || '';
      const htmlSection = $(htmlNewSection());
      if(compType === ThemeEngineConstants.ELEMENT_TYPE.HEADER) {
        let html = $("iframe#gs_iframe_editor").contents().find("body").find(`section[${ThemeEngineConstants.EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}="body"]`);
        let htmlWrapper = html.find(`section.tm-wrapper`);
        if(htmlWrapper && htmlWrapper.length > 0) {
          html = htmlWrapper;
        }
        html.prepend(htmlSection);
      } else {
        compContent.after(htmlSection);
      }
    }
  }

  const moveComponentUp = (e) => {
    setTimeout(() => {
      const compContent = e;
      if(compContent) {
        const prevComp = compContent.prev();
        prevComp.insertAfter(compContent);
        checkMovingAction(compContent);
      }
    }, 0)
  }

  const moveComponentDown = (e) => {
    setTimeout(() => {
      const compContent = e;
      if(compContent) {
        const nextComp = compContent.next();
        nextComp.insertBefore(compContent);
        checkMovingAction(compContent);
      }
    }, 0)
  }

  return (
    <>
      {stLoading && <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}/>}
      <GSAlertModal ref={refDeleteModal} />
      <div className="editing-area">
        <div id="iframe-error-loading-content" className="d-flex w-100 h-100 justify-content-center align-items-center" style={{"visibility": "hidden", "position": "absolute"}}>
          <h1 className="page-load-error">{i18n.t("page.themeEngine.view.page.crash")}</h1>
        </div>
        {/* the busy box waiting loading page */}
        <div id="loading-iframe-content" className="d-flex w-100 h-100 justify-content-center align-items-center" style={{"visibility": "hidden", "position": "absolute"}}>
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
        <div id={"gs_iframe_container"} className={"iframecontainer embed-responsive embed-responsive-16by9"}>
          <div className="iframe_container_wrapper">
            {/* iframe load in here */}
          </div>
        </div>
      </div>
      <AlertModal ref={(el) => { refAlertModal = el }} />
    </>
  )
}

HtmlEditor.propTypes = {
  changeView: PropTypes.func,
  editMode: PropTypes.string
};

export default HtmlEditor;
