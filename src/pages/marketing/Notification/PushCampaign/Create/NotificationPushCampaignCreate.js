/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 07/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import NotificationPushCampaignEditor, {NotificationPushCampaignEditorMode} from "../Editor/NotificationPushCampaignEditor";

const NotificationPushCampaignCreate = props => {
    return (
        <NotificationPushCampaignEditor mode={NotificationPushCampaignEditorMode.CREATE} {...props}>

        </NotificationPushCampaignEditor>
    );
};

NotificationPushCampaignCreate.propTypes = {

};

export default NotificationPushCampaignCreate;
