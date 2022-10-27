/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 02/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import i18next from "i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetHeaderSubtitle from "../../../components/shared/form/GSWidget/GSWidgetHeaderSubtitle";
import {UikButton} from "../../../@uik";
import {Trans} from "react-i18next";
import './CustomerSegmentEditor.sass'
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'
import SegmentConditionRow from "./SegmentConditionRow/SegmentConditionRow";
import {FormValidate} from "../../../config/form-validate";
import beehiveService from "../../../services/BeehiveService";
import catalogService from "../../../services/CatalogService";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {GSToast} from "../../../utils/gs-toast";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import { cancelablePromise } from '../../../utils/promise';


export const CustomerSegmentEditorMode = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}

const SEGMENT_MATCH_CONDITION = {
    ALL: 'ALL',
    ANY: 'ANY'
}

const genKey = (name = undefined, value = undefined, expiredTime = 'ALL') => {
    return {
        rowKey: Math.random().toString(36).substring(7),
        name: name,
        value: value,
        expiredTime: expiredTime
    }
}

export const CustomerSegmentEditorContext = React.createContext({

})
const CustomerSegmentEditorProvider = CustomerSegmentEditorContext.Provider

const MAX_CONDITION = 10
const CustomerSegmentEditor = props => {
    const refBtnSubmit = useRef(null);
    const [stConditions, setStConditions] = useState([genKey()]);

    const [stCustomerTags, setStCustomerTags] = useState([]);
    const [stCities, setStCities] = useState([]);
    const [stOnRedirect, setStOnRedirect] = useState(false);
    const [stIsLoading, setStIsLoading] = useState(props.mode === CustomerSegmentEditorMode.EDIT);
    const [stFrmSegmentName, setStFrmSegmentName] = useState('');
    const [stFrmConditionType, setStFrmConditionType] = useState(SEGMENT_MATCH_CONDITION.ALL);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stIsMembership, setStIsMembership] = useState(false);

    useEffect(() => {
        const DEFAULT_COUNTRY_CODE = 'VN'
        
        const pmGetCustomerSocialTag = cancelablePromise(Promise.all([beehiveService.getAllCustomerTags(), 
            beehiveService.getAllFbSocialTag(),beehiveService.getAllZaloSocialTag()]));
            pmGetCustomerSocialTag.promise.then((resp) => {
                const customerTags = resp[0];
                const fbTags = resp[1]? (resp[1].map(t => t.tagName)): [];
                const zaloTags = resp[2]? (resp[2].map(t => t.tagName)): [];
                setStCustomerTags([...customerTags,...fbTags,...zaloTags]);
            });

        catalogService.getCitesOfCountry(DEFAULT_COUNTRY_CODE).then (cities => {
            setStCities(cities)
        })

        if (props.mode === CustomerSegmentEditorMode.EDIT) {

            beehiveService.getSegment(props.segmentId)
                .then(result => {
                    setStFrmSegmentName(result.name)
                    setStFrmConditionType(result.matchCondition)
                    const conditionList = result.conditions.map(condition => genKey(condition.name, condition.value, condition.expiredTime))
                    setStConditions(conditionList)




                    return beehiveService.checkMembership(props.segmentId)
                })
                .then(isMembership => {
                    setStIsMembership(isMembership)
                    setStIsLoading(false)
                })
                .catch(e => {
                    GSToast.commonError()
                })
        }
    }, []);

    useEffect(() => {
        if (stOnRedirect) {
            RouteUtils.linkTo(props, NAV_PATH.customers.SEGMENT_LIST)
        }
    }, [stOnRedirect]);


    const addNewCondition = () => {
        if (stConditions.length < MAX_CONDITION) {
            setStConditions([...stConditions, genKey()])
        }
    }

    const removeCondition = (key) => {
        setStConditions(stConditions.filter(condition => condition.rowKey !== key))
    }

    const handleValidSubmit = (event, value) => {
        setStIsSaving(true)

        const requestBody = buildRequestBody(value)

        if (props.mode === CustomerSegmentEditorMode.CREATE) {
            beehiveService.saveSegment(requestBody)
                .then(result => {
                    GSToast.success()
                    setStOnRedirect(true)
                    setStIsSaving(false)

                })
                .catch(e => {
                    setStIsSaving(false)
                    if (e.response && e.response.data) {
                        if (e.response.data.errorKey === 'segment.500.limit') {
                            GSToast.error("page.customers.segments.createSegment.500.limited", true);
                        } else {
                            GSToast.commonError()
                        }
                    }
                })
        }
        if (props.mode === CustomerSegmentEditorMode.EDIT) {
            const editRequest = {
                ...requestBody,
                id: props.segmentId
            }
            beehiveService.updateSegment(editRequest, props.segmentId)
                .then(result => {
                    GSToast.success()
                    setStOnRedirect(true)
                    setStIsSaving(false)

                })
                .catch(e => {
                    GSToast.commonError()
                    setStIsSaving(false)
                })
        }
    }

    const buildRequestBody = (frmValue) => {
        const createCondition = (name, value, valueExpiredTime) => {
            return {
                name: name,
                value: value,
                expiredTime: valueExpiredTime
            }
        }
        let request = {
            name:'',
            matchCondition:'',
            conditions:[]
        }
        request.name = frmValue.segmentName
        request.matchCondition = frmValue.conditionType
        for (const condition of stConditions) {
            const rowKey = condition.rowKey
            const selector0 = frmValue[`row_${rowKey}_selector_0`]
            const selector1 = frmValue[`row_${rowKey}_selector_1`]
            const selector2 = frmValue[`row_${rowKey}_selector_2`]
            const value = frmValue[`row_${rowKey}_value`]
            const valueExpiredTime = frmValue[`row_${rowKey}_value_expired_time`]
            const selectorName = [selector0, selector1, selector2].join('_')
            request.conditions.push(
                createCondition(selectorName, String(value), valueExpiredTime)
            )
        }
        return request
    }

    const onClickCancel = () => {
        RouteUtils.linkTo(props, NAV_PATH.customers.SEGMENT_LIST)
    }

    return (
        <CustomerSegmentEditorProvider value={{stCustomerTags, stCities}}>
            <GSContentContainer className="customer-segment-editor"
                                confirmWhenRedirect
                                confirmWhen={!stOnRedirect}
                                isLoading={stIsLoading}
                                isSaving={stIsSaving}
            >
                <GSContentHeader title={i18next.t(props.mode === CustomerSegmentEditorMode.CREATE? "page.customers.segments.createSegment":"page.customers.segments.editSegment")}>
                    <HintPopupVideo title={"Creating segment info7"} category={"CREATE_SEGMENTS"}/>

                    <GSContentHeaderRightEl className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                        <GSButton success className="btn-save"
                                  onClick={() => refBtnSubmit.current.click()}
                        >
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                        <GSButton default className="btn-cancel" marginLeft
                                  onClick={onClickCancel}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className=" mb-5">
                    {stIsMembership &&
                    <div className="membership-warning">
                        <div className="membership-warning__icon">
                            <img src="/assets/images/icon-alert.svg" alt="alert-icon"/>
                        </div>
                        <div className="membership-warning__content-wrapper">
                            <div className="membership-warning__title">
                                <GSTrans t="page.customers.segments.membership"/>
                            </div>
                            <div className="membership-warning__description">
                                <GSTrans t="page.customers.segments.membershipAttention"/>
                            </div>
                        </div>
                    </div>}
                    <AvForm onValidSubmit={handleValidSubmit} autoComplete="off">
                        <button type="submit" ref={refBtnSubmit} hidden>submit</button>
                        <GSWidget>
                            <GSWidgetContent>
                                <AvField
                                    label={i18next.t("page.customers.segments.segmentName")}
                                    name="segmentName"
                                    value={stFrmSegmentName}
                                    validate={{
                                        ...FormValidate.required(),
                                        ...FormValidate.minLength(1),
                                        ...FormValidate.maxLength(100)
                                    }}
                                />
                            </GSWidgetContent>
                        </GSWidget>
                        <GSWidget>
                            <GSWidgetHeader title={i18next.t("page.customers.segments.conditions")}
                                            className="condition-widget__header"
                                            subTitle={i18next.t("page.customers.segments.onlyGosell")}
                                            rightEl={ <UikButton
                                                className={["btn btn-add-condition", stConditions.length === MAX_CONDITION? 'gs-atm--disable':''].join(' ')}
                                                transparent="true"
                                                icon={(
                                                    <i className="icon-add-condition"/>
                                                )}
                                                onClick={addNewCondition}
                                            >
                                                <Trans i18nKey="page.customers.segments.addMoreCondition">
                                                </Trans>
                                            </UikButton>}>
                                <GSWidgetHeaderSubtitle>
                                    <GSTrans t={"page.customers.segments.onlyGosell"}/>
                                </GSWidgetHeaderSubtitle>
                            </GSWidgetHeader>
                            <GSWidgetContent>
                                <div className="gs-atm__flex-row--flex-start condition-type__radio-wrapper">
                                    <span>
                                        <GSTrans t={"page.customers.segments.customersMustMatch"}/>
                                    </span>
                                    <span className="ml-3 condition-type__radio-group">
                                    <AvRadioGroup
                                        name="conditionType"
                                        inline
                                        value={stFrmConditionType}>
                                        <AvRadio
                                            customInput
                                            label={i18next.t("page.collection.automated.allConditions")}
                                            value={SEGMENT_MATCH_CONDITION.ALL}
                                        />
                                        <AvRadio
                                            customInput
                                            label={i18next.t("page.collection.automated.anyConditions")}
                                            value={SEGMENT_MATCH_CONDITION.ANY}
                                        />
                                    </AvRadioGroup>
                            </span>
                                </div>
                                <div>
                                    {stConditions.map((condition, index) => {
                                        return (
                                            <div className="segment-row" key={condition.rowKey}>
                                                <SegmentConditionRow rowKey={condition.rowKey}
                                                                     removable={index !== 0}
                                                                     onRemove={() => removeCondition(condition.rowKey)}
                                                                     value={condition.value}
                                                                     expiredTimeValue={condition.expiredTime}
                                                                     selectorStr={condition.name}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </GSWidgetContent>
                        </GSWidget>
                    </AvForm>

                </GSContentBody>
            </GSContentContainer>
        </CustomerSegmentEditorProvider>
    );
};

CustomerSegmentEditor.propTypes = {
    mode: PropTypes.oneOf(Object.values(CustomerSegmentEditorMode)),
    segmentId: PropTypes.any
};

export default CustomerSegmentEditor;
