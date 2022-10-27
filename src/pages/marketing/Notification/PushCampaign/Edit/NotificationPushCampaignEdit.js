/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 07/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom'
import PropTypes from 'prop-types';
import NotificationPushCampaignEditor, {NotificationPushCampaignEditorMode} from "../Editor/NotificationPushCampaignEditor";
import {cancelablePromise} from "../../../../../utils/promise";
import beehiveService from "../../../../../services/BeehiveService";
import {NotificationPushStatus} from "../../Notification";
import {GSToast} from "../../../../../utils/gs-toast";
import {RouteUtils} from "../../../../../utils/route";
import {NAV_PATH} from "../../../../../components/layout/navigation/Navigation";

const NotificationPushCampaignCreate = props => {
    const {notificationId} = useParams();
    const [stNotification, setStNotification] = useState({});
    const [stIsFetching, setStIsFetching] = useState(true);

    useEffect(() => {
        const pmDetail = cancelablePromise(beehiveService.getMKNotificationDetail(notificationId))
        pmDetail.promise.then(result => {

            // check status, if status is not schedule -> send back to detail page
            if (![NotificationPushStatus.SCHEDULED, NotificationPushStatus.SCHEDULE_FAILED,NotificationPushStatus.ACTIVE].includes(result.status)) {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION_DETAIL + '/' + notificationId)
                return
            }
           if(![NotificationPushStatus.ACTIVE].includes(result.status)){
               beehiveService.updateMarketingNotificationStatus(notificationId, NotificationPushStatus.SCHEDULE_FAILED)
                   .then(async () => {
                       setStNotification({
                           ...result,
                           status: NotificationPushStatus.SCHEDULE_FAILED
                       })
                   })
                   .finally(() => {
                       setStIsFetching(false)

                   })
           }
           if([NotificationPushStatus.ACTIVE].includes(result.status)){
               setStIsFetching(false)
               setStNotification({
                   ...result,
                   status: NotificationPushStatus.ACTIVE
               })
           }
            })
            .catch(e => {
                GSToast.commonError()
            })
    }, []);


    
    return (
        <NotificationPushCampaignEditor fetching={stIsFetching}
                                        model={stNotification}
                                        mode={NotificationPushCampaignEditorMode.EDIT} {...props}>

        </NotificationPushCampaignEditor>
    );
};

NotificationPushCampaignCreate.propTypes = {

};

export default NotificationPushCampaignCreate;
