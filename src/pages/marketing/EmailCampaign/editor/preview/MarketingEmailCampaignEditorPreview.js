/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef} from "react";
import "./MarketingEmailCampaignEditorPreview.sass";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import {cn} from "../../../../../utils/class-name";
import {MarketingEmailCampaignEditorContext} from "../context/MarketingEmailCampaignEditorContext";
import {MarketingEmailCampaignEnum} from "../../MarketingEmailCampaignEnum";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import MarketingEmailCampaignEditorLivePreviewHtmlParser
    from "./livepreview/MarketingEmailCampaignEditorLivePreviewHtmlParser";
import GSWidgetEmptyContent from "../../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import i18next from "i18next";
import ConfirmModal from "../../../../../components/shared/ConfirmModal/ConfirmModal";

const MarketingEmailCampaignEditorPreview = (props) => {
  const { state, dispatch } = useContext(
    MarketingEmailCampaignEditorContext.context
  );
  const refConfirm = useRef(null);
  const refSubmitBtn = useRef(null);

  useEffect(() => {
    if (state.submitMode !== null) {
      refSubmitBtn.current.click()
    }
  }, [state.submitMode]);


  const onClickSaveBtn = (e) => {
    e.preventDefault()
    dispatch(MarketingEmailCampaignEditorContext.actions.setSubmitMode(MarketingEmailCampaignEnum.CAMPAIGN_STATUS.DRAFT))
  }

  const onClickSendBtn = (e) => {
    e.preventDefault()
    dispatch(MarketingEmailCampaignEditorContext.actions.setSubmitMode(MarketingEmailCampaignEnum.CAMPAIGN_STATUS.SEND))

  }

  const onClickPreviewMode = (e, mode) => {
    e.preventDefault();
    dispatch(MarketingEmailCampaignEditorContext.actions.setPreviewMode(mode));
  };

  return (
    <div className="marketing_email_campaign_editor_preview px-2">
      <ConfirmModal ref={refConfirm}/>
      <button type="submit" ref={refSubmitBtn} hidden/>
      <div className="marketing_email_campaign_editor_preview__container p-2 d-flex flex-column">
        <div className="d-flex justify-content-between">
          <div className="d-flex">
            <GSButton
              className={cn(
                "marketing_email_campaign_editor_preview__btn-mode",
                {
                  selected:
                    state.previewMode ===
                    MarketingEmailCampaignEnum.PREVIEW_MODE.WEB,
                }
              )}
              marginLeft
              size="small"
              onClick={(e) =>
                onClickPreviewMode(
                  e,
                  MarketingEmailCampaignEnum.PREVIEW_MODE.WEB
                )
              }
            >
              <img src="/assets/images/theme/icon-website.svg" alt="desktop" />
            </GSButton>
            <GSButton
              className={cn(
                "marketing_email_campaign_editor_preview__btn-mode",
                {
                  selected:
                    state.previewMode ===
                    MarketingEmailCampaignEnum.PREVIEW_MODE.MOBILE,
                }
              )}
              size="small"
              marginLeft
              onClick={(e) =>
                onClickPreviewMode(
                  e,
                  MarketingEmailCampaignEnum.PREVIEW_MODE.MOBILE
                )
              }
            >
              <img src="/assets/images/theme/icon-mobile.svg" alt="mobile" />
            </GSButton>
          </div>

          <div className="d-flex">
            <GSButton default size="small" name="saveBtn" onClick={onClickSaveBtn}>
              <GSTrans t="common.btn.save" />
            </GSButton>
            <GSButton success size="small" marginLeft name="sendBtn" onClick={onClickSendBtn}>
              <GSTrans t="common.btn.send" />
            </GSButton>
          </div>
        </div>
        <hr className="mt-2" />
        {state.currentMailTemplate && state.currentMailTemplate.content && (
          <MarketingEmailCampaignEditorLivePreviewHtmlParser
            html={state.currentMailTemplate.content}
            previewMode={state.previewMode}
            mode={props.mode}
          />
        )}
        {!state.currentMailTemplate && (
          <GSWidgetEmptyContent
            text={i18next.t("page.marketing.email.editor.chooseEmailTemplate")}
            iconSrc="/assets/images/empty_mail.png"
            style={{
              backgroundColor: "white",
              margin: "0",
            }}
          />
        )}
      </div>
    </div>
  );
};

MarketingEmailCampaignEditorPreview.propTypes = {};

export default MarketingEmailCampaignEditorPreview;
