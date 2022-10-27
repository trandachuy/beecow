/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import {ContextUtils} from "../../../../../utils/context";
import {MarketingEmailCampaignEnum} from "../../MarketingEmailCampaignEnum";

const initState = {
  currentMailTemplate: null,
  previewMode: MarketingEmailCampaignEnum.PREVIEW_MODE.WEB,
  primaryColor: "#000000",
  selectedElement: null,
  imagePool: [],
  loading: false,
  submitMode: null,
};

const actions = {
  setCurrentMailTemplate: (template) =>
    ContextUtils.createAction("SET_CURRENT_MAIL_TEMPLATE", template),
  setPreviewMode: (mode) => ContextUtils.createAction("SET_PREVIEW_MODE", mode),
  setPrimaryColor: (color) =>
    ContextUtils.createAction("SET_PRIMARY_COLOR", color),
  setSelectedElement: (ele) =>
    ContextUtils.createAction("SET_SELECTED_ELEMENT", ele),
  setLoading: (state) => ContextUtils.createAction("SET_LOADING", state),
  setSubmitMode: (mode) => ContextUtils.createAction("SET_SUBMIT_MODE", mode),
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SUBMIT_MODE':
      return {
        ...state,
        submitMode: action.payload
      }
    case "SET_CURRENT_MAIL_TEMPLATE":
      return {
        ...state,
        currentMailTemplate: action.payload,
      };
    case "SET_PREVIEW_MODE":
      return {
        ...state,
        previewMode: action.payload,
      };
    case "SET_PRIMARY_COLOR":
      return {
        ...state,
        primaryColor: action.payload,
      };
    case "SET_SELECTED_ELEMENT":
      return {
        ...state,
        selectedElement: action.payload,
      };
    case "ADD_IMAGE_TO_POOL":
      return {
        ...state,
        imagePool: [...state.imagePool, action.payload],
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload
      }
  }
};

const context = React.createContext(initState);

export const MarketingEmailCampaignEditorContext = {
  context,
  provider: context.Provider,
  initState,
  reducer,
  actions,
};
