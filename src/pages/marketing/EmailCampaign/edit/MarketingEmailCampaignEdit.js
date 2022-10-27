/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import MarketingEmailCampaignEditor from "../editor/MarketingEmailCampaignEditor";
import {MarketingEmailCampaignEnum} from "../MarketingEmailCampaignEnum";
import {withRouter} from "react-router-dom";
import {RouteUtils} from "../../../../utils/route";
import {MailService} from "../../../../services/MailService";

const MarketingEmailCampaignEdit = (props) => {
  const [stIsFetching, setStIsFetching] = useState(true);
  const [stModel, setStModel] = useState(null);
  const [stCurrentMailTemplate, setStCurrentMailTemplate] = useState(null);

  const fetchData = async () => {
    const {id} = props.match.params
    if (!id) {
      RouteUtils.toNotFound(props)
    } else {
      setStIsFetching(true)
      try {
        const storeMailModel = await MailService.getStoreMail(id)
        if (storeMailModel.segmentIds) {
          storeMailModel.receiver = ''
        }
        setStModel(storeMailModel)
        const mailTemplateModel = await MailService.getMailTemplate(storeMailModel.mailId)
        mailTemplateModel.content = storeMailModel.content
        setStCurrentMailTemplate(mailTemplateModel)
      } catch (e) {
        RouteUtils.toNotFound(props)
      } finally {
        setStIsFetching(false)
      }
    }
  }

  useEffect(() => {
    fetchData().then(()=>{})
  }, []);


  return (
    <MarketingEmailCampaignEditor
      mode={MarketingEmailCampaignEnum.PAGE_MODE.EDIT}
      isFetching={stIsFetching}
      model={stModel}
      currentMailTemplate={stCurrentMailTemplate}
    />
  );
};

MarketingEmailCampaignEdit.propTypes = {};

export default withRouter(MarketingEmailCampaignEdit);
