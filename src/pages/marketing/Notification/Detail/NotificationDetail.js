/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {DateTimeUtils} from "../../../../utils/date-time";
import './NotificationDetail.sass'
import beehiveService from "../../../../services/BeehiveService";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {cancelablePromise} from "../../../../utils/promise";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import {StoreFrontUtils} from "../../../../utils/storefront";
import renderHTML from 'react-render-html';
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {NotificationPushStatus} from "../Notification";
import {GSToast} from "../../../../utils/gs-toast";
import ConfirmModal, {ConfirmModalUtils} from "../../../../components/shared/ConfirmModal/ConfirmModal";
import i18next from "i18next";
import {NumberUtils} from "../../../../utils/number-format";

const NotificationModel = {
    "content": "string",
    "createdBy": "string",
    "createdDate": "2019-10-14T07:04:29.116Z",
    "id": 0,
    "image": "string",
    "lastModifiedBy": "string",
    "lastModifiedDate": "2019-10-14T07:04:29.116Z",
    "linkTo": "PAGE",
    "linkToValue": "string",
    "name": "string",
    "segmentIds": [
        0
    ],
    "segments": [
        {
            "id": 0,
            "levelId": 0,
            "matchCondition": "ALL",
            "name": "string",
            "storeId": 0,
            "userCount": 0
        }
    ],
    "status": "INIT",
    "storeId": 0,
    "title": "string",
    "type": "EMAIL",
    "sendingTime": undefined
}

const NotificationDetail = props => {
    const {notificationId} = props.match.params
    const [stNotification, setStNotification] = useState(NotificationModel);
    const [stIsFetching, setStIsFetching] = useState(true);
    const refConfirmDeleteModal = useRef(null);
    const [stProgress, setStProgress] = useState(null);
    const refRefreshProgressInterval = useRef(null);
    const [stNotificationStatus, setStNotificationStatus] = useState(null);

    useEffect(() => {
        if (!notificationId) RouteUtils.linkTo(props, NAV_PATH.marketing.NOTIFICATION)
        const pmDetail = cancelablePromise(beehiveService.getMKNotificationDetail(notificationId))
        pmDetail.promise.then(result => {
            setStNotification(result)
            setStNotificationStatus(result.status)
            setStIsFetching(false)
            if ([NotificationPushStatus.SENDING, NotificationPushStatus.INIT].includes(result.status)) {
                beehiveService.getMKNotificationProgress(notificationId)
                    .then(setStProgress)

                refRefreshProgressInterval.current = setInterval(() => {
                    beehiveService.getMKNotificationProgress(notificationId)
                        .then(progress => {
                            setStProgress(progress)
                            if (progress.status === NotificationPushStatus.DONE || progress.status === NotificationPushStatus.FAILED) {
                                setStNotificationStatus(progress.status)
                                clearInterval(refRefreshProgressInterval.current)
                            }
                        })
                }, 2000)
            }
        })
            .catch(e => {
                setStIsFetching(false)
            })
        return () => {
            if (refRefreshProgressInterval.current) {
                clearInterval(refRefreshProgressInterval.current)
            }
        }
    }, []);


    const onClickEdit = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION_PUSH_EDIT + '/' + stNotification.id)
    }

    const onClickDelete = () => {
        ConfirmModalUtils.openModal(refConfirmDeleteModal, {
            messages: i18next.t`page.notification.list.deleteConfirmText`,
            modalTitle: i18next.t`page.notification.list.deleteConfirmTitle`,
            okCallback: () => {
                beehiveService.deleteMarketingNotification(notificationId)
                    .then(() => {
                        GSToast.commonDelete()
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION)
                    })
                    .catch(() => {
                        GSToast.commonError()
                    })
            }
        })
    }

    const resolveStatus = () => {
        switch (stNotificationStatus) {
            case NotificationPushStatus.DONE:
                return i18next.t('component.marketing.notification.dropdown.status.done')
            case NotificationPushStatus.SCHEDULED:
                return i18next.t('component.marketing.notification.dropdown.status.scheduled')
            case NotificationPushStatus.SCHEDULE_FAILED:
                return i18next.t('component.marketing.notification.dropdown.status.scheduleFailed')
            case NotificationPushStatus.SENDING:
            case NotificationPushStatus.INIT:
                return i18next.t('component.marketing.notification.dropdown.status.sending')
            case NotificationPushStatus.FAILED:
                return i18next.t('component.marketing.notification.dropdown.status.failed')
            case NotificationPushStatus.ACTIVE:
                return i18next.t("page.notification.editor.statusActive")
            default:
                return null
        }
    }

    return (
        <GSContentContainer isLoading={stIsFetching} className="notification-detail">
            <GSContentHeader title={stNotification.name} rightEl={
                [NotificationPushStatus.SCHEDULED, NotificationPushStatus.SCHEDULE_FAILED,NotificationPushStatus.ACTIVE].includes(stNotification.status) &&
                <div className="d-flex align-items-center">
                    <GSButton success onClick={onClickEdit}>
                        <GSTrans t="common.btn.edit"/>
                    </GSButton>
                    <GSButton danger outline marginLeft onClick={onClickDelete}>
                        <GSTrans t="common.btn.delete"/>
                    </GSButton>
                </div>
            }/>
            <ConfirmModal ref={refConfirmDeleteModal}/>
            <GSContentBody size={GSContentBody.size.LARGE}>
                <GSWidget>
                    <GSWidgetContent>
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                <GSTrans t="page.notification.editor.push.campaignName"/>
                            </div>
                            <div className="col-12 col-sm-12 col-md-9">
                                {stNotification.name}
                            </div>
                        </div>
                        {/*SEND NOW TIME*/}
                        {!stNotification.sendingTime &&
                            <div className="row">
                                <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                    <GSTrans t="page.notification.detail.sendDate"/>
                                </div>
                                <div className="col-12 col-sm-12 col-md-9">
                                    {DateTimeUtils.formatDDMMYYYY_HHMM(stNotification.lastModifiedDate, '/')}
                                </div>
                            </div>
                        }
                        {/*SCHEDULE TIME*/}
                        {stNotification.sendingTime &&
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                <GSTrans t="page.notification.list.table.scheduleTime"/>
                            </div>
                            <div className="col-12 col-sm-12 col-md-9">
                                {DateTimeUtils.formatDDMMYYYY_HHMM(stNotification.sendingTime, '/')}
                            </div>
                        </div>
                        }

                        {/*Status*/}
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                <GSTrans t="component.custom.page.table.header.status"/>
                            </div>
                            <div className="col-12 col-sm-12 col-md-9">
                                {resolveStatus()}
                            </div>
                        </div>

                        {/*SEGMENT*/}
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                <GSTrans t="page.notification.editor.push.customerSegment"/>
                            </div>
                            <div className="col-12 col-sm-12 col-md-9">
                                {stNotification.segments.map(segment => {
                                    return (
                                        <div key={segment.id} className="mb-2">
                                            <b>
                                                {segment.name}
                                            </b>
                                            <span className="user-count">
                                                {' ('}
                                                <GSTrans t={"page.customers.segments.list.userCount"} values={{
                                                    users: NumberUtils.formatThousand(segment.userCount)
                                                }}/>
                                                {')'}
                                            </span>
                                        </div>
                                    )
                                })}
                                {stProgress && stNotificationStatus === NotificationPushStatus.SENDING &&
                                <>
                                    <hr/>
                                    <GSTrans t={"page.notification.detail.received"} values={{
                                        completed: NumberUtils.formatThousand(stProgress.completeProgress),
                                        total: NumberUtils.formatThousand(stNotification.segments.map(segment => segment.userCount).reduce((a,b) => a + b, 0))
                                    }}/>
                                </>
                                }
                            </div>
                        </div>
                        <hr/>
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                <GSTrans t="page.notification.editor.push.title"/>
                            </div>
                            <div className="col-12 col-sm-12 col-md-9">
                                {stNotification.title}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                <GSTrans t="page.notification.editor.push.message"/>
                            </div>
                            {stNotification.type === 'PUSH' &&
                            <div className="col-12 col-sm-12 col-md-9">
                                {stNotification.content}
                            </div>}
                            {stNotification.type === 'EMAIL' &&
                            <div className="col-12 col-sm-12 col-md-9 email-content">
                                {renderHTML(stNotification.content)}
                            </div>}
                        </div>
                       {stNotification.type === 'PUSH' &&
                           <div className="row">
                                <div className="col-12 col-sm-12 col-md-3 left-col__title">
                                    <GSTrans t="page.notification.detail.image"/>
                                </div>
                                <div className="col-12 col-sm-12 col-md-9">
                                    <GSImg src={stNotification.image} height={150}/>
                                    <div className="mt-4">
                                        <a href={StoreFrontUtils.buildBannerLink(stNotification.linkTo, stNotification.linkToValue)}>
                                            {StoreFrontUtils.buildBannerLink(stNotification.linkTo, stNotification.linkToValue)}
                                        </a>
                                    </div>
                                </div>
                            </div>
                       }
                    </GSWidgetContent>
                </GSWidget>

            </GSContentBody>
        </GSContentContainer>
    );
};

NotificationDetail.propTypes = {

};

export default NotificationDetail;
