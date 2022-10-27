/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import MarketingEmailCampaignEditor from "../editor/MarketingEmailCampaignEditor";
import {MarketingEmailCampaignEnum} from "../MarketingEmailCampaignEnum";

const MarketingEmailCampaignCreate = (props) => {
  return (
    <>
      <MarketingEmailCampaignEditor
        mode={MarketingEmailCampaignEnum.PAGE_MODE.CREATE}
      />
    </>
  );
};

MarketingEmailCampaignCreate.propTypes = {};

export default MarketingEmailCampaignCreate;
