import {TokenUtils} from "../../../../utils/token";
import React from "react";
import ThemeEngineConstants from "../ThemeEngineConstants";

export const toolbar = (compName = "", compType, sAction, options = {hiddenActions: false}) => {
  
  const hasPermissions = TokenUtils.hasThemeEnginePermission() && !options.hiddenActions;
  //default true for all action
  const isAllow = (sAction || String(sAction).toLowerCase() === "none")? false: true;
  let showNavButton = false;

  let action = {
    "edit": isAllow,
    "remove": isAllow,
    "move": isAllow,
    "add": isAllow
  };

  let inVisibled = {
    plusup: hasPermissions,
    plusdown: hasPermissions,
    moveup: hasPermissions,
    movedown: hasPermissions,
    remove: hasPermissions,
    edit: hasPermissions
  }

  //sAction = "edit, remove, move, add";
  if(sAction && String(sAction).toLowerCase() !== "none") {
    sAction = sAction.toLowerCase();
    sAction.split(",").forEach(a => {
      const name = String(a).trim();
      action[name] = true;
    });
  }

  if(compType === ThemeEngineConstants.ELEMENT_TYPE.HEADER) {
    inVisibled.plusup = false;
    action.move = false;
    action.remove = false;
  }

  if(compType === ThemeEngineConstants.ELEMENT_TYPE.FOOTER) {
    inVisibled.plusdown = false;
    action.move = false;
    action.remove = false;
  }

  if(compName === ThemeEngineConstants.ELEMENT_TYPE.CUSTOM_PAGE) {
    action.remove = false;
    action.edit = false;
    showNavButton = hasPermissions? true:false;
    inVisibled.remove = false;
  }

  const dataActions = JSON.stringify(action);

  return `
  <div id="iframe-toolbar-editor" component-actions='${dataActions}'>
  
    <div style="position: absolute;display: grid;grid-template-columns: repeat(3, 1fr);width: 100%;z-index: 999999">
      
      <!--
        <span style="float: left;background-color: #3899ec;height: 21px;width: fit-content;padding: 0 10px;text-align: center;">
          <span style="color: #ffffff;text-transform: uppercase;font-weight: 500;">${compName}</span>
        </span>
      -->

      <span ${inVisibled.plusup? '':'hidden'} ${action.add? '': 'disabled'} style="position: absolute;left: 50%;top: -12px;transform: translateX(-50%);">
        <span class="edit-toolbar-action-icon">
          <img id="edit-toolbar-plus-above" src="/assets/images/icon-editor-theme-add.svg">
        </span>
      </span>
      
      <span style="position: absolute;right: 0;top: 0;background-color: #3899ec;padding: 5px 5px;">
        
        <span ${showNavButton? '':'hidden'} class="edit-toolbar-action-text">
          <span id="edit-toolbar-navigation">Edit</span>
        </span>

        <span ${inVisibled.moveup? '':'hidden'} ${action.move? '': 'disabled'} class="edit-toolbar-action-icon2">
          <img id="edit-toolbar-arrow-up" src="/assets/images/icon-editor-theme-move-up.svg">
        </span>

        <span ${!inVisibled.movedown? 'hidden':''} ${action.move? '': 'disabled'} class="edit-toolbar-action-icon2">
          <img id="edit-toolbar-arrow-down" src="/assets/images/icon-editor-theme-move-down.svg">
        </span>

        <span ${inVisibled.remove? '':'hidden'} ${action.remove? '': 'disabled'} class="edit-toolbar-action-icon2">
            <img id="edit-toolbar-trash" src="/assets/images/icon-editor-theme-delete.svg">
        </span>

      </span>

    </div>

    <div ${inVisibled.plusdown? '':'hidden'} ${action.add? '': 'disabled'} style="position: absolute;bottom: -16px;left: 50%;transform: translateX(-50%);z-index: 999999">
      <span class="edit-toolbar-action-icon">
        <img id="edit-toolbar-plus-below" src="/assets/images/icon-editor-theme-add.svg">
      </span>
    </div>
  </div>
`}

export const toolbarScript = () => {
  return `
  <script id="iframe-toolbar-editor-script" type="text/javascript">
    
  </script>
  `
}

export const styleMobilePlatform = () => {
  return `
    <style id="iframe-editor-style-platform-mobile">
      section[cptype="HEADER"]{
        position: sticky !important;
        top: 0;
        z-index: 1000
      }
    </style>
  `;
}

export const styleIframeEditor = () => {
  return `
    <style id="iframe-editor-style-responsive" type='text/css'>

      :root { 
        --scroll-bar: visible;
      }

      /* width */
      ::-webkit-scrollbar {
        width: 10px;
        visibility: var(--sroll-bar);
      }
      
      /* Track */
      ::-webkit-scrollbar-track {
        background: #ffffff; 
        visibility: var(--sroll-bar);
      }
        
      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: #cccbcb;
        border-radius: 5px;
        visibility: var(--sroll-bar);
      }
      
      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #9c9c9c;
        border-radius: 5px;
      }

      span.edit-toolbar-action-text {
        color: #ffffff;
        padding: 0px 10px;
        font-weight: bold;
        font-size: 1rem;
        display: inline-flex;
      }

      span.edit-toolbar-action-text > span {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
      }

      span.edit-toolbar-action-text > span:hover {
        color: #000;
        cursor: pointer;
      }

      span.edit-toolbar-action-icon {
        height: 20px;
        width: 22px;
        background-position: center center;
        border-radius: 50%;
        background-repeat: no-repeat;
        display: inline-flex;
        color: #3899ec;
      }
      
      span.edit-toolbar-action-icon2 {
        height: 20px;
        width: 20px;
        background-position: center center;
        border-radius: 50%;
        background-repeat: no-repeat;
        display: inline-flex;
        color: #3899ec;
        padding: 3px;
      }
      
      span.edit-toolbar-action-icon2 img {
        width: 100%;
      }      
      
      span.edit-toolbar-action-icon2:hover img {
        cursor: pointer;
        opacity: .8;
      }
      
      span.edit-toolbar-action-icon2 img[disabled=disabled] {
        cursor: default;
        pointer-events: none;
        filter: opacity(0.2);
      }

      span.edit-toolbar-action-icon img:hover {
        color: #ffee10;
        box-shadow: 0 0 5px #ffee10;
        text-shadow: 0 0 5px #ffee10;
        cursor: pointer;
      }

      span.edit-toolbar-action-icon img[disabled=disabled] {
        color: #bbb;
        box-shadow: none;
        text-shadow: none;
        filter: invert(50%);
        cursor: default;
        pointer-events: none;
      }

      span.edit-toolbar-action-icon img:hover::before {
        transform: scale(1.1);
        box-shadow: 0 0 15px #ffee10;
      }

      span.edit-toolbar-action-icon img::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #ffee10;
        transition: .5s;
        transform: scale(.9);
        z-index: -1;
      }

      .page-load-error h1.error-title {
        opacity: 0.6;
        height: 200px;
        line-height: 1.5;
        display: flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        text-transform: uppercase;
      }
      
      .validate-error {
        border: 2px solid red
      }

      .section-min-height {
        min-height: 100px;
      }

      @media only screen and (max-width: 600px) {
        /* width */
        ::-webkit-scrollbar {
          width: 0px;
        }
      }

    </style>`
}

export const styleIframeEditMode = (EDITOR_CONSTANT) => {
  return `
  <style id="iframe-editor-style" type='text/css'>

    a,area,link,base,iframe,video {
      pointer-events: none;
      cursor: not-allowed;
    }

    [rv-on-click] {
      pointer-events: none;
    }

    section[${EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY}]:not([${EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}]) {
      position: relative;
    }

    section[${EDITOR_CONSTANT.SSR_KEY.COMPONENT_KEY}]:not([${EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}]):not(.${EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS}):hover {
      box-shadow: 0 0 0 4px #a1c2de;
      transition: .5s ease;
      -webkit-transform: scale(0.98);
      -ms-transform: scale(0.98);
      transform: scale(0.98);
      z-index: 100;
    }
    
    section.${EDITOR_CONSTANT.IFRAME_KEY.DISABLED_EVENTS_CLASS} a,area,link,base,iframe,video {
      pointer-events: none; 
      cursor: not-allowed;
    }
    
    section.${EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS} {
      box-sizing: border-box;
      background-color: transparent;
      border: 4px solid #3899ec;
      border-radius: 1px;
      display: relative;
      z-index: 99999;
    }

    section.${EDITOR_CONSTANT.IFRAME_KEY.ADD_NEW_COMPONENT_CLASS}[${EDITOR_CONSTANT.ATTR_COMP_NEW_SECTION_KEY}]:not([${EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}]) {
      background-color: #bce0ff;
      border: 4px dashed #4499e0;
      outline: 4px dashed #9bc9ef;
      outline-offset: -20px;
      height: 200px;
      display: flex;
      color: #2992ea;
    }

    section.${EDITOR_CONSTANT.IFRAME_KEY.ADD_NEW_COMPONENT_CLASS}[${EDITOR_CONSTANT.ATTR_COMP_NEW_SECTION_KEY}]:not([${EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}]) > h1.title {
      display: flex;
      align-items: center;
      color: #2992ea;
      position: relative;
      float: left;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      width: 70%;
      text-align: center;
      font-weight: unset;
      line-height: unset;
    }

    @media only screen and (max-width: 600px) {
      section.${EDITOR_CONSTANT.IFRAME_KEY.ADD_NEW_COMPONENT_CLASS}[${EDITOR_CONSTANT.ATTR_COMP_NEW_SECTION_KEY}]:not([${EDITOR_CONSTANT.SSR_KEY.FRAGMENT_KEY}]) > h1.title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    section.${EDITOR_CONSTANT.IFRAME_KEY.ADD_NEW_COMPONENT_CLASS}:not(.${EDITOR_CONSTANT.IFRAME_KEY.ACTIVE_COMPONENT_CLASS}):hover {
      transition: .5s ease;
      -webkit-transform: scale(0.98);
      -ms-transform: scale(0.98);
      transform: scale(0.98);
      z-index: 99999;
    }

  <style>
  `
}
