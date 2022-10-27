/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useReducer} from "react";
import "./MarketingEmailCampaignEditor.sass";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import MarketingEmailCampaignEditorSetting from "./setting/MarketingEmailCampaignEditorSetting";
import MarketingEmailCampaignEditorPreview from "./preview/MarketingEmailCampaignEditorPreview";
import MarketingEmailCampaignEditorComponentEditor from "./ComponentEditor/MarketingEmailCampaignEditorComponentEditor";
import {MarketingEmailCampaignEditorContext} from "./context/MarketingEmailCampaignEditorContext";
import {AvForm} from "availity-reactstrap-validation";
import $ from "jquery";
import cheerio from "cheerio";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {ImageUtils} from "../../../../utils/image";
import {ColorUtils} from "../../../../utils/color";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import {MarketingEmailCampaignEnum} from "../MarketingEmailCampaignEnum";
import {CredentialUtils} from "../../../../utils/credential";
import {MailService} from "../../../../services/MailService";
import {GSToast} from "../../../../utils/gs-toast";
import PropTypes from "prop-types"
import {withRouter} from "react-router-dom";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";

const MarketingEmailCampaignEditor = (props) => {
  const [state, dispatch] = useReducer(
    MarketingEmailCampaignEditorContext.reducer,
    MarketingEmailCampaignEditorContext.initState
  );


    useEffect(() => {
        if (props.currentMailTemplate) {
            dispatch(MarketingEmailCampaignEditorContext.actions.setCurrentMailTemplate(props.currentMailTemplate))
        }
    }, [props.currentMailTemplate]);


  const getHtmlContent = async () => {
      const html = $("#mail-live-preview__iframe").contents().find('html')
      // console.log(body.html())
      // xmlMode will remove wrapper
      let cQuery = cheerio.load(html.html());
      // console.log(cQuery.html())

      // remove editor style
      const primaryColor = state.primaryColor
      const filter = ColorUtils.hexToFilter(primaryColor).replace(";", "");
      cQuery('head style').html(
          `
            .gs-background-color{background-color: ${primaryColor} !important;}
            .gs-border-color{border-color: ${primaryColor} !important;}
            .gs-font-color{color: ${primaryColor} !important;}
            .gs-filter-color{filter: ${filter} !important;}
          `
      );
      cQuery('body style').remove()
      cQuery('.gs-selected').each( (index, cp) => {
          cQuery(cp).removeClass('gs-selected')
      })

      // convert head style to inline style
      cQuery('.gs-background-color').each( (index, cp) => {
          cQuery(cp).css('background-color', primaryColor + ' !important;')
      })
      cQuery('.gs-border-color').each( (index, cp) => {
          cQuery(cp).css('gs-border-color', primaryColor + ' !important;')
      })
      cQuery('.gs-font-color').each( (index, cp) => {
          cQuery(cp).css('gs-font-color', primaryColor + ' !important;')
      })
      cQuery('.gs-filter-color').each( (index, cp) => {
          cQuery(cp).css('gs-filter-color', filter + ' !important;')
      })

      let contentHtml = cQuery('html').html()

      // upload image to s3
      const imagePool = state.imagePool
      for (const {file, tUrl} of imagePool) {
          // ignore removed file
          if (!contentHtml.includes(tUrl)) continue
          // upload to s3

          const imgRes = await mediaService.uploadFileWithDomain(file, MediaServiceDomain.GENERAL)
          const imageUrl = ImageUtils.getImageFromImageModel(imgRes)

          contentHtml = contentHtml.replace(tUrl, imageUrl)
      }

      // wrap to html5
      contentHtml = `<!DOCTYPE html><html>${contentHtml}</html>`

      return contentHtml
  }

    /**
     * build body request
     * @return {StoreMailRequestModel}
     */
  const buildRequest = async (frmValues) => {
      const htmlContent = await getHtmlContent()

        /**
         * @type {StoreMailRequestModel}
         */
        const requestBody = {
            id: props.mode === MarketingEmailCampaignEnum.PAGE_MODE.EDIT? props.model.id:undefined,
            storeId: CredentialUtils.getStoreId(),
            campaignName: frmValues.campaignName,
            campaignDescription: frmValues.campaignDescription,
            campaignEmailTo: frmValues.campaignEmailTo,
            receiver: frmValues.receiver,
            segmentIds: frmValues.segmentIds,
            title: frmValues.title,
            mailId: frmValues.mailId,
            content: htmlContent,
            contentType: 'HTML'
        }

        return  requestBody
  }

  const onInvalidSubmit = (e) => {
      // reset mode
      dispatch(MarketingEmailCampaignEditorContext.actions.setSubmitMode(null))

  }

  const onValidSubmit = async (event, values) => {
      dispatch(MarketingEmailCampaignEditorContext.actions.setLoading(true))

      const requestBody = await buildRequest(values)

      try {
          let createdMail;
          if (state.submitMode === MarketingEmailCampaignEnum.CAMPAIGN_STATUS.DRAFT) {
              createdMail = await MailService.saveMailService(requestBody)
          } else {
              createdMail = await MailService.saveAndSendMailService(requestBody)
          }
          if (props.mode === MarketingEmailCampaignEnum.PAGE_MODE.CREATE) {
              GSToast.commonCreate()
          } else {
              GSToast.commonUpdate()
          }

          if (state.submitMode === MarketingEmailCampaignEnum.CAMPAIGN_STATUS.DRAFT) {
            if (props.mode === MarketingEmailCampaignEnum.PAGE_MODE.CREATE) { // if save in create mode -> redirect to edit page
                RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.EMAIL_EDIT + '/' + createdMail.id)
            }
          } else { // SEND
              RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.EMAIL)
          }

      } catch (e) {
          GSToast.commonError()
      } finally {
          dispatch(MarketingEmailCampaignEditorContext.actions.setLoading(false))
      }
  }
  return (
    <MarketingEmailCampaignEditorContext.provider value={{ state, dispatch }}>
        {state.loading && <LoadingScreen loadingStyle={LoadingStyle.ELLIPSIS}/>}
        <AvForm
            autoComplete="off"
            style={{
            width: "100%",
            }}
            onValidSubmit={onValidSubmit}
            onInvalidSubmit={onInvalidSubmit}
            model={props.model}
            key={'email-campaign-editor'}
        >
            <GSContentContainer isLoading={props.isFetching} loadingClassName="h-100" className="p-0">
                <GSContentBody
                    size={GSContentBody.size.MAX}
                    className="marketing-email-campaign-editor"
                >
                    <MarketingEmailCampaignEditorSetting 
                        mode={props.mode}
                        model={props.model}
                        totalCustomer={props.model? props.model.totalCustomer:0}
                    />
                    <MarketingEmailCampaignEditorPreview mode={props.mode} />
                    <MarketingEmailCampaignEditorComponentEditor />
                </GSContentBody>
            </GSContentContainer>
        </AvForm>
    </MarketingEmailCampaignEditorContext.provider>
  );
};

MarketingEmailCampaignEditor.propTypes = {
    mode: PropTypes.oneOf(Object.values(MarketingEmailCampaignEnum.PAGE_MODE)),
    model: PropTypes.shape({
        campaignDescription: PropTypes.string,
        campaignEmailTo: PropTypes.string,
        campaignName: PropTypes.string,
        content: PropTypes.string,
        contentType: PropTypes.string,
        createdBy: PropTypes.string,
        createdDate: PropTypes.string,
        id: PropTypes.number,
        lastModifiedBy: PropTypes.string,
        lastModifiedDate: PropTypes.string,
        mailId: PropTypes.number,
        receiver: PropTypes.string,
        segmentIds: PropTypes.string,
        sender: PropTypes.string,
        sentDate: PropTypes.string,
        shortView: PropTypes.string,
        status: PropTypes.string,
        storeId: PropTypes.number,
        title: PropTypes.string
    }),
    currentMailTemplate: PropTypes.object,
    isFetching: PropTypes.bool,
};

export default withRouter(MarketingEmailCampaignEditor);
