/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 07/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSContentContainer from "../../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import GSContentHeaderRightEl
    from "../../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {AvField, AvForm} from 'availity-reactstrap-validation'
import GSWidget from "../../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../../components/shared/form/GSWidget/GSWidgetContent";
import {FormValidate} from "../../../../../config/form-validate";
import GSFakeLink from "../../../../../components/shared/GSFakeLink/GSFakeLink";
import {NumberUtils} from "../../../../../utils/number-format";
import './NotificationPushCampaignEditor.sass'
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import GSButtonUpload from "../../../../../components/shared/GSButtonUpload/GSButtonUpload";
import {ImageUtils} from "../../../../../utils/image";
import GSButtonUploadFeedBack from "../../../../../components/shared/GSButtonUploadFeedBack/GSButtonUploadFeedBack";
import LinkToItem, {LINK_TO_ITEM_LINK_TYPE} from "../../../../../components/shared/ThemeComponent/shared/LinkToItem/LinkToItem";
import CustomerSegmentModal from "../../../../../components/shared/CustomerSegmentModal/CustomerSegmentModal";
import {RouteUtils} from "../../../../../utils/route";
import {NAV_PATH} from "../../../../../components/layout/navigation/Navigation";
import AlertInline, {AlertInlineType} from "../../../../../components/shared/AlertInline/AlertInline";
import {CredentialUtils} from "../../../../../utils/credential";
import mediaService, {MediaServiceDomain} from "../../../../../services/MediaService";
import beehiveService from "../../../../../services/BeehiveService";
import {GSToast} from "../../../../../utils/gs-toast";
import {UikFormInputGroup, UikRadio, UikSelect} from "../../../../../@uik";
import GSDateRangePicker from "../../../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import moment from "moment";
import {DateTimeUtils} from "../../../../../utils/date-time";
import {NotificationPushStatus} from "../../Notification";
import ConfirmModal, {ConfirmModalUtils} from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import {Prompt} from "react-router-dom";
import GSTooltip from "../../../../../components/shared/GSTooltip/GSTooltip";

export const NotificationPushCampaignEditorMode = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}

export const eventOption={
    BIRTHDAY:"BIRTHDAY",
    ACCOUNT_CREATED:"ACCOUNT_CREATED",
    ORDER_COMPLETED:"ORDER_COMPLETED",
    ABANDONED_CHECKOUT:"ABANDONED_CHECKOUT"

}

export const events=[
    {
        value:eventOption.BIRTHDAY,
        label:<span>{i18next.t("page.notification.editor.eventBirthday")}</span>
    },
    {
        value:eventOption.ACCOUNT_CREATED,
        label:<span>{i18next.t("page.notification.editor.eventAccountCreated")}</span>
    },
    {
        value:eventOption.ORDER_COMPLETED,
        label:<span> {i18next.t("page.notification.editor.eventOrderCompleted")}</span>
    },
    {
        value:eventOption.ABANDONED_CHECKOUT,
        label: <span>{i18next.t("page.notification.editor.eventAbandonedCheckout")}</span>
    }
]

export const SendMode = {
    IMMEDIATELY: 'IMMEDIATELY',
    SCHEDULE: 'SCHEDULE',
    EVENT: 'EVENT'
}

export const TimeEventMode={
    DATE:364,
    HOUR:8760
}

const MinScheduleMinutes = 0


const NotificationPushCampaignEditor = props => {
    const refBtnSubmit = useRef(null);
    const refLinkTo = useRef(null);
    const [stSelectedSegmentList, setStSelectedSegmentList] = useState([]);
    const [stFile, setStFile] = useState(null);
    const [stIsShowSegmentModal, setStIsShowSegmentModal] = useState(false);
    const [stShowInvalidSegment, setStShowInvalidSegment] = useState(false);
    const [stOnRedirectBypassConfirm, setStOnRedirectBypassConfirm] = useState(false);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stLinkTo, setStLinkTo] = useState({
        linkTo: '',
        linkToValue: ''
    });
    const [stSendMode, setStSendMode] = useState(SendMode.IMMEDIATELY);
    const [stSendTime, setStSendTime] = useState(DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE));
    const [stSendTimeInvalid, setStSendTimeInvalid] = useState('');
    const [stSendEvent,setStSendEvent]=useState(eventOption.BIRTHDAY)
    const [stSendEventOption,setStSendEventOption]=useState(0)
    const [stModelChange, setStModelChange] = useState(false);
    const refConfirmCancel = useRef(null);
    const [stIsDisableSegment, setStIsDisableSegment] = useState(false);

    // INIT MODEL
    useEffect(() => {

        if (props.model && props.mode === NotificationPushCampaignEditorMode.EDIT) {
            // INIT SEND MODE
            let sendMode
            const status = props.model.status
            switch (status) {
                case NotificationPushStatus.ACTIVE:
                    sendMode= SendMode.EVENT
                    setStSendEvent(props.model.event)
                    setStSendEventOption(props.model.eventOption)
                    break
                case NotificationPushStatus.SCHEDULED:
                case NotificationPushStatus.SCHEDULE_FAILED:
                    sendMode =  SendMode.SCHEDULE
                    break
                default:
                    sendMode =  SendMode.IMMEDIATELY

            }
            setStSendMode(sendMode)

            // INIT SENDING TIME
            const sendingTime = props.model.sendingTime? moment(props.model.sendingTime):DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)
            setStSendTime(sendingTime)

            // INIT IMAGE
            const imageSrc = props.model.image
            setStFile(imageSrc)

            // INIT SEGMENT
            const segments = props.model.segments
            setStSelectedSegmentList(segments || [])
        }
    }, [props.model]);

    const setFormChange = () => {
        setStModelChange(true)
    }

    useEffect(() => {
        if (stOnRedirectBypassConfirm && !stModelChange) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION)
        }
    }, [stOnRedirectBypassConfirm, stModelChange]);




    const onUploaded = (files) => {
        setStFile(files[0])
        setFormChange()
    }

    const onRemoveImage = () => {
        setStFile(null)
        setFormChange()
    }

    const onSelectLinkTo = (indexGroup, indexSchema, value) => {
        const linkToPart = value.split('|')
        setStLinkTo({
            linkTo: linkToPart[0],
            linkToValue: linkToPart[1]
        })
        setFormChange()
    }

    const handleOnValidForm = async (e, value) => {
        let valid = true
        if (
            !refLinkTo.current.isValid() ||
            !isValidSegment() || !isValidDateTime()) valid = false


        if (!valid) return

        setStIsSaving(true)
        let imageUrl
        if (stFile) {
            if (typeof stFile === 'string') {
                imageUrl = stFile
            } else {
                const imageObj = await mediaService.uploadFileWithDomain(stFile, MediaServiceDomain.GENERAL)
                imageUrl = ImageUtils.getImageFromImageModel(imageObj)
            }
        }

        const requestBody = buildRequest(value, imageUrl)
        setStIsSaving(false)

        if (props.mode === NotificationPushCampaignEditorMode.CREATE) {
            beehiveService.createMarketingNotification(requestBody)
                .then(result => {
                    GSToast.commonCreate()
                    setStIsSaving(false)
                    setStModelChange(false)
                    setStOnRedirectBypassConfirm(true)
                })
                .catch(e => {
                    GSToast.commonError()
                    setStIsSaving(false)
                })
        }

        if (props.mode === NotificationPushCampaignEditorMode.EDIT) {
            beehiveService.updateMarketingNotification(requestBody)
                .then(result => {
                    GSToast.commonUpdate()
                    setStIsSaving(false)
                    setStModelChange(false)
                    setStOnRedirectBypassConfirm(true)
                })
                .catch(e => {
                    GSToast.commonError()
                    setStIsSaving(false)
                })
        }

    }

    const buildRequest = (value, imageUrl) => {
        let request = {
            content: "string",
            image: "string",
            linkTo: "PAGE",
            linkToValue: "string",
            name: "string",
            storeId: 0,
            title: "string",
            type: "EMAIL|PUSH",
            segmentIds: [],
        }

        request.content = value.message
        request.image = imageUrl
        request.linkTo = stLinkTo.linkTo? stLinkTo.linkTo:undefined
        request.linkToValue = stLinkTo.linkToValue
        request.name = value.campaignName
        request.storeId = CredentialUtils.getStoreId()
        request.title = value.title
        request.type = 'PUSH'
        request.segmentIds = stSelectedSegmentList.map(segment => segment.id)
        if (stSendMode === SendMode.SCHEDULE) {
            request.sendingTime = moment.utc(stSendTime).toISOString()
        }

        if(stSendMode === SendMode.EVENT){
            request.event = stSendEvent
            request.eventOption =Number (stSendEventOption)
        }

        // EDIT MODE
        if (props.mode === NotificationPushCampaignEditorMode.EDIT) {
            request.id = props.model.id
        }

        return request
    }

    const onClickSubmit = () => {
        refLinkTo.current.isValid()
        isValidSegment()
        isValidDateTime()
        refBtnSubmit.current.click()
    }

    const onCloseCustomerSegmentModal = (selectedItems) => {
        if (selectedItems) {
            setStSelectedSegmentList(selectedItems)
            setStIsShowSegmentModal(false)
            const isValid = selectedItems.length > 0
            setStShowInvalidSegment(!isValid)
            setFormChange()
        } else { //=> cancel
            setStIsShowSegmentModal(false)
        }
    }

    const onClickAddSegment = () => {
        setStIsShowSegmentModal(true)
    }

    const isValidSegment = () => {
        if (stSendEvent === 'ACCOUNT_CREATED') {
            setStShowInvalidSegment(false);
            return true;
        } else {
            const isValid = stSelectedSegmentList.length > 0
            setStShowInvalidSegment(!isValid)
            return isValid
        }
    }

    const isValidDateTime = (startTime) => {
        let isValid = true
        if (startTime && !startTime.isValid()) {
            setStSendTimeInvalid("page.notification.editor.invalidDate")
            isValid = false
        }

        if (stSendMode === SendMode.SCHEDULE && isValid) {
            const min = DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)
            const targetTime = DateTimeUtils.flatTo((startTime || stSendTime), DateTimeUtils.UNIT.MINUTE)
            const isTargetTimeGreaterOrSameNow =  min.isSameOrBefore(targetTime)
            isValid = isTargetTimeGreaterOrSameNow
        }

        setStSendTimeInvalid(isValid? '':"page.notification.editor.invalidDate")
        return isValid
    }

    const onClickCancel =  async () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION)
    }

    const onChangeSendMode = (mode) => {
        setStSendMode(mode)
        setFormChange()
    }

    const onApplyDateTimePicker = (event, picker) => {
        const dateTime = picker.startDate
        if (dateTime) {
            setStSendTime(DateTimeUtils.flatTo(dateTime, DateTimeUtils.UNIT.MINUTE))
            isValidDateTime(dateTime)
        }
        setFormChange()
    }

    const getDefaultValue = (fieldName) => {
        if (props.mode === NotificationPushCampaignEditorMode.EDIT) {
            // if (fieldName.toUpperCase() === 'LINKTO' && !props.model[fieldName]) {
            //     return LINK_TO_ITEM_LINK_TYPE.PAGE
            // }
            return props.model[fieldName]
        }
        return undefined
    }

    const resolveLinkToItemValue = () => {
        if (props.mode === NotificationPushCampaignEditorMode.EDIT) {
            if (getDefaultValue('linkTo')) {
                return getDefaultValue('linkTo') + "|" + getDefaultValue('linkToValue')
            }
        }
        return undefined
    }

    const confirmWhenLeave = () => {
        return new Promise( async (resolve, reject) => {
            // Check valid sendingTime
            if (props.mode === NotificationPushCampaignEditorMode.EDIT) {
                try {
                    const {status, sendingTime, id} = props.model
                    if ([NotificationPushStatus.SCHEDULED, NotificationPushStatus.SCHEDULE_FAILED, NotificationPushStatus.ACTIVE].includes(status)) {
                        const now = DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)
                        const orgSendingTime = DateTimeUtils.flatTo(moment(sendingTime), DateTimeUtils.UNIT.MINUTE)
                        const sendingTimeHasPassed = now.isAfter(orgSendingTime)
                        //show
                        if (sendingTimeHasPassed) {
                            ConfirmModalUtils.openModal(refConfirmCancel, {
                                messages: i18next.t`page.notification.editor.push.cancelWarning`,
                                okCallback: async () => {
                                    await beehiveService.updateMarketingNotificationStatus(id, NotificationPushStatus.SCHEDULE_FAILED)
                                    RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION)
                                }
                            })
                        } else {
                            // revert notification status
                            await beehiveService.updateMarketingNotificationStatus(id, NotificationPushStatus.SCHEDULED)
                            RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION)
                        }
                    }
                } catch (e) {
                    GSToast.commonError()
                    console.error(e)
                }
            }
        })
    }

    const onChangeEvent=(value)=>{
        setStSendEvent(value)
        setStSendEventOption(0)
        if (value === 'ACCOUNT_CREATED') {
            setStIsDisableSegment(true)
            setStShowInvalidSegment(false)
            if (stSelectedSegmentList.length > 0){
                GSToast.error("page.notification.editor.push.disabledSegment.msg", true);
            }
        } else {
            setStIsDisableSegment(false)
        }
    }

    return (
        <GSContentContainer className="notification-push-campaign-editor"
                            confirmWhen={stModelChange}
                            isSaving={stIsSaving}
                            isLoading={props.fetching}
        >
            {
            <Prompt
                message={(location, action) => {
                    if (props.mode === NotificationPushCampaignEditorMode.EDIT) {
                        try {
                            const {status, sendingTime, id} = props.model
                            if ([NotificationPushStatus.SCHEDULED, NotificationPushStatus.SCHEDULE_FAILED].includes(status)) {
                                const now = DateTimeUtils.flatTo(moment(moment.now()), DateTimeUtils.UNIT.MINUTE)
                                const orgSendingTime = DateTimeUtils.flatTo(moment(sendingTime), DateTimeUtils.UNIT.MINUTE)
                                const sendingTimeHasPassed = now.isAfter(orgSendingTime)
                                if (sendingTimeHasPassed) {
                                    return i18next.t`page.notification.editor.push.cancelWarning`
                                } else {
                                    if (stModelChange) {
                                        sessionStorage.setItem('confirmUpdateNotificationStatus', id + '|' + NotificationPushStatus.SCHEDULED)
                                        let message = i18next.t('component.product.addNew.cancelHint')
                                        return message
                                    } else {
                                        if(stSendMode!==SendMode.EVENT){
                                            console.log('time not has passed but model not change')
                                            beehiveService.updateMarketingNotificationStatus(id, NotificationPushStatus.SCHEDULED).then()
                                        }
                                        return true
                                    }
                                }
                            }
                        } catch (e) {

                        }
                    } else {
                        if (stModelChange) {
                            console.log('add new mode and model change')
                            let message = props.confirmMessage ? props.confirmMessage : i18next.t('component.product.addNew.cancelHint')
                            return message
                        }
                    }
                    return true
                }}
            />
            }
            <ConfirmModal ref={refConfirmCancel}/>
            {stIsShowSegmentModal &&
                <CustomerSegmentModal
                    selectedItems={stSelectedSegmentList}
                    onClose={onCloseCustomerSegmentModal}
                />

            }
            <GSContentHeader title={getDefaultValue("name") || i18next.t("page.notification.editor.push.notification")}>
                <GSContentHeaderRightEl className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center mt-3">
                    <GSButton success className="btn-send-now" onClick={onClickSubmit}>
                        <GSTrans t={props.mode === NotificationPushCampaignEditorMode.EDIT? "common.btn.save":"page.notification.editor.btn.create"}/>
                    </GSButton>
                    <GSButton default marginLeft className="btn-cancel" onClick={onClickCancel}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.LARGE}>
                <AvForm onValidSubmit={handleOnValidForm} autoComplete="off">
                    <button type="submit" ref={refBtnSubmit} hidden/>
                    <GSWidget>
                        <GSWidgetContent>
                            <AvField label={i18next.t("page.notification.editor.push.campaignName")}
                                     name="campaignName"
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.minLength(1),
                                         ...FormValidate.maxLength(100)
                                     }}
                                     onChange={setFormChange}
                                     value={getDefaultValue('name')}
                            />
                            <div className="add-segment-wrapper">
                                <div className="gs-frm-input__label mb-1">
                                    <GSTrans t={"page.notification.editor.push.customerSegment"}/>
                                </div>
                                <span className="add-segment__btn-add">
                                    {(stSelectedSegmentList.length === 0 && !stIsDisableSegment) &&
                                        <>
                                            <GSFakeLink className="btn-add-segment" onClick={onClickAddSegment}>
                                                <GSTrans t={"page.notification.editor.push.addSegment"}/>
                                            </GSFakeLink>
                                            {' '}
                                            <GSTrans t={"page.notification.editor.push.noneSegment"}/>
                                        </>
                                    }
                                    {(stSelectedSegmentList.length > 0 && !stIsDisableSegment) &&
                                        <>
                                            <GSFakeLink className="btn-add-segment" onClick={onClickAddSegment}>
                                                <GSTrans t={"page.notification.editor.push.editSegment"}/>
                                            </GSFakeLink>
                                            {' '}
                                            <GSTrans t={"page.notification.editor.push.countSegment"} values={{
                                                segments: NumberUtils.formatThousand(stSelectedSegmentList.length),
                                                users: NumberUtils.formatThousand(stSelectedSegmentList.map(segment => segment.userCount).reduce((sum,current) => {
                                                    return sum + current
                                                })),
                                            }}/>
                                        </>
                                    }

                                    {(stSelectedSegmentList.length === 0 && stIsDisableSegment) &&
                                    <>
                                        <GSFakeLink className="disabled" onClick={onClickAddSegment}>
                                            <GSTrans t={"page.notification.editor.push.addSegment"}/>
                                        </GSFakeLink>
                                        {' '}
                                        <GSTrans t={"page.notification.editor.push.noneSegment"}/>
                                        <GSTooltip message={i18next.t("page.notification.editor.push.disabledSegment.tooltip")} placement={GSTooltip.PLACEMENT.BOTTOM}/>
                                    </>
                                    }
                                    {(stSelectedSegmentList.length > 0 && stIsDisableSegment) &&
                                    <>
                                        <GSFakeLink className="disabled" onClick={onClickAddSegment}>
                                            <GSTrans t={"page.notification.editor.push.editSegment"}/>
                                        </GSFakeLink>
                                        {' '}
                                        <GSTrans t={"page.notification.editor.push.countSegment"} values={{
                                            segments: NumberUtils.formatThousand(stSelectedSegmentList.length),
                                            users: NumberUtils.formatThousand(stSelectedSegmentList.map(segment => segment.userCount).reduce((sum,current) => {
                                                return sum + current
                                            })),
                                        }}/>
                                        <GSTooltip message={i18next.t("page.notification.editor.push.disabledSegment.tooltip")} placement={GSTooltip.PLACEMENT.BOTTOM}/>
                                    </>
                                    }
                                </span>
                                {(stShowInvalidSegment) &&
                                <AlertInline type={AlertInlineType.ERROR}
                                             text={i18next.t("common.validation.select.segment")}
                                             nonIcon
                                             textAlign="left"
                                             padding={false}
                                             className="mt-2"
                                />}
                            </div>

                            {/*SEND SCHEDULE*/}
                            <div className="gs-frm-input__label mb-3 mt-3">
                                <GSTrans t="page.notification.editor.sendNotification"/>
                            </div>
                            <div>
                                <UikFormInputGroup>
                                    <UikRadio
                                        key={'IMMEDIATELY'}
                                        label={i18next.t`page.notification.editor.sendNow`}
                                        name="send-mode"
                                        defaultChecked={stSendMode === SendMode.IMMEDIATELY}
                                        onClick={() => onChangeSendMode(SendMode.IMMEDIATELY)}
                                    />
                                    <UikRadio
                                        key={'SCHEDULE'}
                                        label={
                                            <div className="d-flex align-items-center">
                                                <span className="d-inline-block mr-5 width-85">
                                                    <GSTrans t="page.notification.editor.schedule"/>
                                                </span>
                                                <div>
                                                    <GSDateRangePicker
                                                        readOnly
                                                        disabled={stSendMode !== SendMode.SCHEDULE}
                                                        singleDatePicker
                                                        fromDate={stSendTime}
                                                        timePicker
                                                        onApply={onApplyDateTimePicker}
                                                        minDate={moment(moment.now()).set({h: 0, m: 0, ms: 0})}
                                                        timePicker24Hour
                                                    >
                                                    </GSDateRangePicker>
                                                    {stSendTimeInvalid &&
                                                    <AlertInline type={AlertInlineType.ERROR}
                                                                 text={i18next.t(stSendTimeInvalid)}
                                                                 nonIcon
                                                                 padding={false}
                                                                 className="mt-2"
                                                                 textAlign="left"
                                                    />
                                                    }
                                                </div>

                                            </div>

                                        }
                                        name="send-mode"
                                        defaultChecked={stSendMode === SendMode.SCHEDULE}
                                        onClick={() => onChangeSendMode(SendMode.SCHEDULE)}
                                    />
                                    <UikRadio
                                        key={'EVENT'}
                                        label={<div className="d-flex align-items-center event">
                                                <span className="d-inline-block mr-5 width-85">
                                                    {i18next.t("page.notification.editor.event")}
                                                </span>
                                            <div >
                                                <UikSelect
                                                    className={"width-265"}
                                                    disabled={stSendMode !== SendMode.EVENT}
                                                    options={events}
                                                    value={[{value: stSendEvent!==""?stSendEvent:events[0].value}]}
                                                    onChange={(item)=>onChangeEvent(item.value)}
                                                    position="bottomRight"
                                                    style={{
                                                        width: "400px",
                                                    }}
                                                />


                                            </div>

                                        </div>}
                                        name="send-mode"
                                        checked={stSendMode === SendMode.EVENT}
                                        onClick={() => onChangeSendMode(SendMode.EVENT)}
                                    />
                                    {stSendMode === SendMode.EVENT&&<div className="d-flex align-items-center event">
                                                <span className="d-inline-block mr-5" style={{width:'108px'}}>

                                                </span>
                                    <span style={{display: 'inline-flex',alignItems:'center'}}>{
                                        stSendEvent!==events[0].value?i18next.t("page.notification.editor.eventOptionOccurred"):
                                            i18next.t("page.notification.editor.eventOptionBirthday")
                                    }
                                        <input
                                            className="form-control"
                                            name={'activeDay'}
                                            type="number"
                                            defaultValue={stSendEventOption}
                                            value={
                                                stSendEventOption && Math.max(0, stSendEventOption)
                                                && Math.min(stSendEventOption,stSendEvent!==events[0].value?
                                                TimeEventMode.HOUR:TimeEventMode.DATE)
                                            }
                                            onChange={(e) => setStSendEventOption(
                                                Math.max(0, e.currentTarget.value)
                                                && Math.min(e.currentTarget.value, stSendEvent !== events[0].value ?
                                                TimeEventMode.HOUR : TimeEventMode.DATE))
                                            }
                                            onKeyPress={e => e.key === '.' && e.preventDefault()}
                                            min={"0"}
                                            max={stSendEvent!==events[0].value?TimeEventMode.HOUR:TimeEventMode.DATE}
                                            style={{width:'100px',margin:'0 5px'}}
                                        />
                                          {stSendEvent!==events[0].value?
                                            i18next.t("page.notification.editor.eventOptionOccurred2"):
                                            i18next.t("page.notification.editor.eventOptionBirthday2")
                                        }
                                                    </span>
                                    </div>

                                    }
                                </UikFormInputGroup>
                                <br/>

                            </div>
                            <hr/>
                            <AvField label={i18next.t("page.notification.editor.push.title")}
                                     name="title"
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.minLength(0),
                                         ...FormValidate.maxLength(50)
                                     }}
                                     onChange={setFormChange}
                                     value={getDefaultValue('title')}
                            />
                            <AvField label={i18next.t("page.notification.editor.push.message")}
                                     name="message"
                                     type="textarea"
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.minLength(0),
                                         ...FormValidate.maxLength(178)
                                     }}
                                     onChange={setFormChange}
                                     value={getDefaultValue('content')}
                            />
                            <div>
                                <div className="gs-frm-input__label mb-2">
                                    <GSTrans t={"page.notification.editor.push.image"}/>
                                </div>
                                <GSImg
                                        src={stFile}
                                       width={80}
                                       height={80}/>
                                <GSButtonUpload
                                    onUploaded={onUploaded}
                                    maxImageSizeByMB={2}
                                    className="mb-2 mt-2"
                                />
                                {!stFile &&
                                    <div>
                                        2048 x 1024 px (PNG/JPG file)
                                    </div>
                                }
                                {stFile &&
                                    <GSButtonUploadFeedBack file={stFile}
                                        onRemove={onRemoveImage}
                                    />
                                }
                            </div>
                            <div className="mt-3 link-to__wrapper">
                                <div className="gs-frm-input__label mb-2">
                                    <GSTrans t={ "page.notification.editor.push.linkTo"}/>
                                </div>
                                <LinkToItem itemKey="linkTo"
                                            validateRule={{isRequired: true }}
                                            callBackFunction={onSelectLinkTo}
                                            ref={refLinkTo}
                                            lstLinkType={[
                                                LINK_TO_ITEM_LINK_TYPE.NONE,
                                                LINK_TO_ITEM_LINK_TYPE.PAGE,
                                                LINK_TO_ITEM_LINK_TYPE.COLLECTION,
                                                LINK_TO_ITEM_LINK_TYPE.PRODUCT,
                                                LINK_TO_ITEM_LINK_TYPE.SERVICE
                                            ]}
                                            key={resolveLinkToItemValue()}
                                            value={resolveLinkToItemValue()}
                                />
                            </div>
                        </GSWidgetContent>
                    </GSWidget>

                </AvForm>
            </GSContentBody>
        </GSContentContainer>
    );
};

NotificationPushCampaignEditor.propTypes = {
    mode: PropTypes.oneOf(Object.values(NotificationPushCampaignEditorMode))
};

export default NotificationPushCampaignEditor;
