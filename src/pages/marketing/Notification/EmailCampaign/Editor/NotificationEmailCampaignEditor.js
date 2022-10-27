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
import './NotificationEmailCampaignEditor.sass'
import CustomerSegmentModal from "../../../../../components/shared/CustomerSegmentModal/CustomerSegmentModal";
import {RouteUtils} from "../../../../../utils/route";
import {NAV_PATH} from "../../../../../components/layout/navigation/Navigation";
import AlertInline, {AlertInlineType} from "../../../../../components/shared/AlertInline/AlertInline";
import {CredentialUtils} from "../../../../../utils/credential";
import beehiveService from "../../../../../services/BeehiveService";
import {GSToast} from "../../../../../utils/gs-toast";
import GSEditor from "../../../../../components/shared/GSEditor/GSEditor";

export const NotificationPushCampaignEditorMode = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}
const NotificationEmailCampaignEditor = props => {
    const refBtnSubmit = useRef(null);
    const [stSelectedSegmentList, setStSelectedSegmentList] = useState([]);
    const [stIsShowSegmentModal, setStIsShowSegmentModal] = useState(false);
    const [stShowInvalidSegment, setStShowInvalidSegment] = useState(false);
    const [stOnRedirectBypassConfirm, setStOnRedirectBypassConfirm] = useState(false);
    const [stIsSaving, setStIsSaving] = useState(false);

    useEffect(() => {
        if (stOnRedirectBypassConfirm) {
            RouteUtils.linkTo(props, NAV_PATH.marketing.NOTIFICATION)
        }
    }, [stOnRedirectBypassConfirm]);



    const handleOnValidForm = async (e, value) => {
        if (!isValidSegment()) return

        setStIsSaving(true)
        const requestBody = buildRequest(value)

        beehiveService.createMarketingNotification(requestBody)
            .then(result => {
                GSToast.commonCreate()
                setStIsSaving(false)
                setStOnRedirectBypassConfirm(true)
            })
            .catch(e => {
                GSToast.commonError()
                setStIsSaving(false)
            })
    }

    const buildRequest = (value) => {

        let request = {
            content: "string",
            name: "string",
            storeId: 0,
            type: "EMAIL|PUSH",
            segmentIds: [],
            title: "string"
        }

        request.content = value.content
        request.name = value.campaignName
        request.storeId = CredentialUtils.getStoreId()
        request.type = 'EMAIL'
        request.segmentIds = stSelectedSegmentList.map(segment => segment.id)
        request.title = value.title
        return request
    }

    const onClickSendNow = () => {
        isValidSegment()
        refBtnSubmit.current.click()
    }

    const onCloseCustomerSegmentModal = (selectedItems) => {
        if (selectedItems) {
            setStSelectedSegmentList(selectedItems)
            setStIsShowSegmentModal(false)
            const isValid = selectedItems.length > 0
            setStShowInvalidSegment(!isValid)
        } else { //=> cancel
            setStIsShowSegmentModal(false)
        }
    }

    const onClickAddSegment = () => {
        setStIsShowSegmentModal(true)
    }

    const isValidSegment = () => {
        const isValid = stSelectedSegmentList.length > 0
        setStShowInvalidSegment(!isValid)
        return isValid
    }

    const onClickCancel = () => {
        RouteUtils.linkTo(props, NAV_PATH.marketing.NOTIFICATION)
    }


    return (
        <GSContentContainer className="notification-email-campaign-editor"
                            confirmWhenRedirect
                            confirmWhen={!stOnRedirectBypassConfirm}
                            isSaving={stIsSaving}
        >
            {stIsShowSegmentModal &&
                <CustomerSegmentModal
                    selectedItems={stSelectedSegmentList}
                    onClose={onCloseCustomerSegmentModal}
                />

            }
            <GSContentHeader title={i18next.t("page.notification.editor.push.notification")}>
                <GSContentHeaderRightEl className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center mt-3">
                    <GSButton success className="btn-send-now" onClick={onClickSendNow}>
                        <GSTrans t={"page.notification.editor.push.btn.sendNow"}/>
                    </GSButton>
                    <GSButton default marginLeft className="btn-cancel" onClick={onClickCancel}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.LARGE}>
                <AvForm onValidSubmit={handleOnValidForm}>
                    <button ref={refBtnSubmit} hidden/>
                    <GSWidget>
                        <GSWidgetContent>
                            <AvField label={i18next.t("page.notification.editor.push.campaignName")}
                                     name="campaignName"
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.minLength(1),
                                         ...FormValidate.maxLength(100)
                                     }}
                            />
                            <div className="add-segment-wrapper">
                                <div className="gs-frm-input__label mb-1">
                                    <GSTrans t={"page.notification.editor.push.customerSegment"}/>
                                </div>
                                <span className="add-segment__btn-add">
                                    {stSelectedSegmentList.length === 0 &&
                                        <>
                                            <GSFakeLink className="btn-add-segment" onClick={onClickAddSegment}>
                                                <GSTrans t={"page.notification.editor.push.addSegment"}/>
                                            </GSFakeLink>
                                            {' '}
                                            <GSTrans t={"page.notification.editor.push.noneSegment"}/>
                                        </>
                                    }
                                    {stSelectedSegmentList.length > 0 &&
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
                                </span>
                                {stShowInvalidSegment &&
                                <AlertInline type={AlertInlineType.ERROR}
                                             text={i18next.t("common.validation.select.segment")}
                                             nonIcon
                                             textAlign="left"
                                             padding={false}
                                />}
                            </div>
                            <hr/>
                            <AvField label={i18next.t("page.notification.editor.push.title")}
                                     name="title"
                                     validate={{
                                         ...FormValidate.required(),
                                         ...FormValidate.minLength(0),
                                         ...FormValidate.maxLength(50)
                                     }}
                            />
                            <div className="gs-frm-input__label mb-1 mt-3">
                                <GSTrans t={"page.notification.editor.email.content"}/>
                            </div>
                            <GSEditor
                                name={'content'}
                                isRequired={true}
                                minLength={100}
                                maxLength={100_000}
                            />
                        </GSWidgetContent>
                    </GSWidget>

                </AvForm>
            </GSContentBody>
        </GSContentContainer>
    );
};

NotificationEmailCampaignEditor.propTypes = {
    mode: PropTypes.oneOf(Object.values(NotificationPushCampaignEditorMode))
};

export default NotificationEmailCampaignEditor;
