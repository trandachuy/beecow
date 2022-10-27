/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 07/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import NotificationEmailCampaignEditor, {NotificationPushCampaignEditorMode} from "../Editor/NotificationEmailCampaignEditor";

const NotificationEmailCampaignCreate = props => {
    return (
        <NotificationEmailCampaignEditor mode={NotificationPushCampaignEditorMode.CREATE} {...props}>

        </NotificationEmailCampaignEditor>
    );
};

NotificationEmailCampaignCreate.propTypes = {

};

export default NotificationEmailCampaignCreate;
