/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/03/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import GSWidget from "../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../components/shared/GSTrans/GSTrans";
import './SEOEditor.sass'
import GSTooltip from "../../components/shared/GSTooltip/GSTooltip";
import i18next from "i18next";
import AvFieldCountable from "../../components/shared/form/CountableAvField/AvFieldCountable";
import {FormValidate} from "../../config/form-validate";
import {AvField} from 'availity-reactstrap-validation'
import GSFakeLink from "../../components/shared/GSFakeLink/GSFakeLink";
import {AgencyService} from "../../services/AgencyService";
import {CredentialUtils} from "../../utils/credential";
import AlertInline, {AlertInlineType} from "../../components/shared/AlertInline/AlertInline";
import PropTypes from 'prop-types'
import {cn} from "../../utils/class-name";
import PrivateComponent from "../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../config/package-features";
import {ItemUtils} from '../../utils/item-utils'

let timeoutId

const SEOEditor = props => {
    const [stSEO, setStSEO] = useState({
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        seoUrl: '',
        isShowMore: false,
        ...props.defaultValue
    });

    const [stShowPanel, setStShowPanel] = useState(false);

    useEffect(() => {
        if(assignDefaultValue==true){
            setStSEO({
                ...stSEO,
                ...props.defaultValue
            })
        }

    }, [props.defaultValue]);

    const handleFormBlur = (name, value) => {
        const newStSEO = {
            ...stSEO,
            [name]: value
        }
        setStSEO(newStSEO)
        if (props.onHocBlur) {
            props.onHocBlur(newStSEO)
        } else if (props.onBlur) {
            props.onBlur(newStSEO)
        }
    }

    const onFormChange = (e) => {
        if (e.currentTarget) {
            const { name, value } = e.currentTarget
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => handleFormBlur(name, value), 500)
        }
    }

    const buildUrlLink = () => {
        if (!props.isShowUrl) {
            return null
        }

        const prefix = `${CredentialUtils.getStoreUrl()}.${AgencyService.getStorefrontDomain()}`

        if (stSEO.seoUrl) {
            return prefix + '/' + ItemUtils.changeNameToLink(stSEO.seoUrl)
        }

        return prefix + '/' + props.prefix + props.middleSlug + props.postfix
    }

    const toggleShow = () => {
        const stShowMore = !stShowPanel;
        setStShowPanel(stShowMore);
    }

    const {postfix, isShowUrl, defaultValue, className, isShowCollapse, withWidget,assignDefaultValue, ...rest} = props

    const renderContent = () => {
        return (
            <>
                {/*LIVE PREVIEW*/}
                <div className="mb-2">
                    <span className="gs-frm-control__title">
                        <GSTrans t="component.seoEditor.livePreview"/>
                    </span>
                    <GSTooltip message={i18next.t('component.seoEditor.livePreviewHint')}/>
                </div>

                <div className="seo-editor__live-preview-wrapper mb-3">
                    <div>
                        <cite className="seo-editor__live-preview-url">
                            <a href={`https://${buildUrlLink()}`} target="_blank">{buildUrlLink()}</a>
                        </cite>
                    </div>
                    <GSFakeLink>
                        <h3 className="seo-editor__live-preview-title m-0">
                            {stSEO.seoTitle}
                        </h3>
                    </GSFakeLink>
                    <div>
                        <span className="seo-editor__live-preview-description">
                            {stSEO.seoDescription}
                        </span>
                    </div>
                </div>
                {/*SEO TITLE*/}
                <div className="mb-2">
                    <span className="gs-frm-control__title">
                        <GSTrans t="component.seoEditor.seoTitle"/>
                    </span>
                    <GSTooltip message={i18next.t('component.seoEditor.seoTitleHint')}/>
                </div>
                <AvFieldCountable
                    validate={{
                        ...FormValidate.maxLength(props.maxLength.seoTitle)
                    }}
                    name="seoTitle"
                    maxLength={props.maxLength.seoTitle}
                    onChange={onFormChange}
                    minLength={0}
                    isRequired={false}
                    defaultValue={stSEO.seoTitle}
                    style={{
                        paddingRight: '4rem'
                    }}
                />
                {(stSEO.seoTitle.length > 60 || (stSEO.seoTitle.length < 50 && stSEO.seoTitle.length > 0)) &&
                <AlertInline text={i18next.t('component.seoEditor.exceededRecommendedNotification', {
                    fieldName: i18next.t('component.seoEditor.exceededRecommendedNotificationTitle')
                })}
                             textAlign={"left"}
                             padding={false}
                             type={AlertInlineType.WARN}
                             className="mb-3"
                />}
                {/*SEO DESCRIPTION*/}
                <div className="mb-2">
                    <span className="gs-frm-control__title">
                        <GSTrans t="component.seoEditor.seoDescription"/>
                    </span>
                    <GSTooltip message={i18next.t('component.seoEditor.seoDescriptionHint')}/>
                </div>
                <AvFieldCountable
                    validate={{
                        ...FormValidate.maxLength(props.maxLength.seoDescription)
                    }}
                    name="seoDescription"
                    maxLength={props.maxLength.seoDescription}
                    onChange={onFormChange}
                    minLength={0}
                    isRequired={false}
                    defaultValue={stSEO.seoDescription}
                    style={{
                        paddingRight: '4rem'
                    }}
                />
                {((stSEO.seoDescription.length < 290 && stSEO.seoDescription.length > 0)) &&
                <AlertInline text={i18next.t('component.seoEditor.exceededRecommendedNotification', {
                    fieldName: i18next.t('component.seoEditor.exceededRecommendedNotificationDescription')
                })}
                             textAlign={"left"}
                             padding={false}
                             type={AlertInlineType.WARN}
                             className="mb-3"
                />}
                {/*SEO KEYWORDS*/}
                <div className="mb-2">
                    <span className="gs-frm-control__title">
                        <GSTrans t="component.seoEditor.seoKeywords"/>
                    </span>
                    <GSTooltip message={i18next.t('component.seoEditor.seoKeywordsHint')}/>
                </div>
                <AvField
                    validate={{
                        ...FormValidate.maxLength(props.maxLength.seoKeywords)
                    }}
                    name="seoKeywords"
                    maxLength={props.maxLength.seoKeywords}
                    onChange={onFormChange}
                    defaultValue={stSEO.seoKeywords}
                />
                {/*URL LINK*/}
                {
                    props.isShowUrl &&
                    <>
                        <div className="mb-2">
                        <span className="gs-frm-control__title">
                            <GSTrans t="component.seoEditor.urlLink"/>
                        </span>
                        </div>
                        <AvField
                            className={ props.error ? 'error-input' : '' }
                            validate={ {
                                ...FormValidate.maxLength(props.maxLength.seoUrl),
                                ...FormValidate.withCondition(
                                    props.enableLetterOrNumberOrHyphen,
                                    FormValidate.pattern.letterOrNumberOrHyphen()
                                )
                            } }
                            name="seoUrl"
                            maxLength={ props.maxLength.seoUrl }
                            onChange={ onFormChange }
                            defaultValue={ stSEO.seoUrl }
                        />

                        {
                            props.error && <span className="error">
                            <GSTrans t={ `component.seoEditor.error.${ props.error.errorKey }` }
                                     values={ { params: props.error.params } }/>
                            </span>
                        }
                    </>
                }
            </>
        )
    }

    return (
        <>
            {withWidget?
                <GSWidget className={cn("seo-editor", className)} {...rest}>
                    <PrivateComponent
                        wrapperDisplay={"block"}
                        hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0310]}
                    >
                        {isShowCollapse?
                            <GSWidgetHeader showCollapsedButton defaultOpen={stShowPanel} onChangeCollapsedState={toggleShow}>
                                <GSTrans t="component.seoEditor.title"/>
                            </GSWidgetHeader>
                            :<GSWidgetHeader>
                                <GSTrans t="component.seoEditor.title"/>
                            </GSWidgetHeader>}
                        <GSWidgetContent hidden={isShowCollapse? !stShowPanel: false}>
                            {renderContent()}
                        </GSWidgetContent>
                    </PrivateComponent>
                </GSWidget>
                :
                <div className={cn("seo-editor", className)}>
                    {renderContent()}
                </div>
            }
        </>

    );
};

SEOEditor.defaultProps = {
    isShowUrl: true,
    isShowCollapse: false,
    defaultValue: PropTypes.shape({
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        seoUrl: ''
    }),
    middleSlug: '',
    postfix: '',
    prefix: '',
    maxLength: {
        seoTitle: 200,
        seoDescription: 325,
        seoKeywords: 325,
        seoUrl: 200,
    },
    withWidget: true,
    assignDefaultValue:true,
    enableLetterOrNumberOrHyphen: true
}

SEOEditor.propTypes = {
    onBlur: PropTypes.func,
    isShowUrl: PropTypes.bool,
    isShowCollapse: PropTypes.bool,
    defaultValue: PropTypes.shape({
        seoTitle: PropTypes.string,
        seoDescription: PropTypes.string,
        seoKeywords: PropTypes.string,
        seoUrl: PropTypes.string
    }),
    middleSlug: PropTypes.string,
    postfix: PropTypes.string,
    prefix: PropTypes.string,
    className: PropTypes.string,
    maxLength: {
        seoTitle: PropTypes.number,
        seoDescription: PropTypes.number,
        seoKeywords: PropTypes.number,
        seoUrl: PropTypes.number,
    },
    withWidget: PropTypes.bool,
    assignDefaultValue: PropTypes.bool,
    enableLetterOrNumberOrHyphen: PropTypes.bool
};

export default SEOEditor;
