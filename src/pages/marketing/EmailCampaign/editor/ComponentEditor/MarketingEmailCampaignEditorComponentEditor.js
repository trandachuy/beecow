/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext} from "react";
import "./MarketingEmailCampaignEditorComponentEditor.sass";
import {ElementEditorPrimaryColor} from "../../../../landing-page/editor/element-editor/elements/ElementsEditor";
import HTMLElementEditorFactory from "../../../../landing-page/editor/element-editor/elements/HTMLElementEditorFactory";
import {MarketingEmailCampaignEditorContext} from "../context/MarketingEmailCampaignEditorContext";

const MarketingEmailCampaignEditorComponentEditor = (props) => {
  const { state, dispatch } = useContext(
    MarketingEmailCampaignEditorContext.context
  );
  return (
    <div className="marketing_email_campaign_editor_component_editor d-flex flex-column p-2">
      {state.currentMailTemplate && state.currentMailTemplate.content && (
        <>
          <ElementEditorPrimaryColor context={{ state, dispatch }} />
          <hr />
        </>
      )}
      {state.selectedElement && (
        <HTMLElementEditorFactory
          context={{ state, dispatch }}
          element={state.selectedElement}
        />
      )}
    </div>
  );
};

MarketingEmailCampaignEditorComponentEditor.propTypes = {};

export default MarketingEmailCampaignEditorComponentEditor;
