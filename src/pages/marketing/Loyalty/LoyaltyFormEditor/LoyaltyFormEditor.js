/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from "react";
import {UikWidget, UikWidgetContent} from '../../../../@uik';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {Label} from 'reactstrap';
import '../../../../../sass/ui/_gswidget.sass';
import '../../../../../sass/ui/_gsfrm.sass';
import './LoyaltyFormEditor.sass';
import {Trans} from "react-i18next";
import i18next from "../../../../config/i18n";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {Redirect} from "react-router-dom";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSEditor from "../../../../components/shared/GSEditor/GSEditor";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import GSButtonUpload from "../../../../components/shared/GSButtonUpload/GSButtonUpload";
import {ImageUtils} from "../../../../utils/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    IMAGE_RECOMMEND,
    MAX_FILE_NAME_LENGTH
} from "../../../../components/shared/ThemeComponent/shared/ThemeLogoUploaderItem/ThemeLogoUploaderItem";
import GSImg from "../../../../components/shared/GSImg/GSImg";
import SegmentModal from '../../../../components/shared/SegmentModal/SegmentModal';
import beehiveService from "../../../../services/BeehiveService";
import {CredentialUtils} from '../../../../utils/credential';
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format';
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import AvCustomCheckbox from "../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import Col from "reactstrap/es/Col";
import {FormValidate} from "../../../../config/form-validate";
import Row from "reactstrap/es/Row";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {NumericSymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import jquery from "jquery";

export const LoyaltyFormEditorMode = {
    ADD_NEW: 'addNew',
    EDIT: 'edit'
}

const LoyaltyFormEditor = (props) => {

    const [isEditMode] = useState(props.mode === LoyaltyFormEditorMode.EDIT)
    const defaultLoyalty = { id: null, name: undefined, iconId: undefined, iconUrlPrefix: undefined, description: undefined, segmentId: undefined, enabledBenefit: false, discountPercent: undefined, discountMaxAmount: undefined };
    const [loyalty, setLoyalty] = useState(defaultLoyalty)
    const [isSaving, setIsSaving] = useState(false)
    const [onRedirect, setOnRedirect] = useState(false)
    const [isValid, setIsValid] = useState(true)

    const [file, setFile] = useState(undefined);
    const [urlName, setUrlName] = useState('');
    const [urlPrefix, setUrlPrefix] = useState('');
    const [iconExtension, setIconExtension] = useState('');
    const [selectedSegment, setSelectedSegment] = useState(undefined)
    const [openSegmentModal, setOpenSegmentModal] = useState(undefined);
    const [selectedSegments, setSelectedSegments] = useState([]);
    const [loyalties, setLoyalties] = useState();
    const [errorSegment, setErrorSegment] = useState();
    const [stIsEnabledBenefit, setStIsEnabledBenefit] = useState(isEditMode ? props.loyalty.enabledBenefit : false);

    useEffect(() => {
        // check edit
        if (isEditMode) {
            setLoyalty(props.loyalty);

            if (props.loyalty.image) {
                setUrlName(props.loyalty.imageUUID)
                setUrlPrefix(props.loyalty.image.urlPrefix)
                setIconExtension(props.loyalty.image.extension)
            }

            setStIsEnabledBenefit(props.loyalty.enabledBenefit);
            setSelectedSegment(props.selectedSegment);
        }
        if (!props.location.state) {
            fetchData(-1, 100)
        } else {
            let data = props.location.state.data.loyalties;
            setLoyalties(data);
            setSelectedSegments(filterSegments(data));
        }
    }, [])

    const fetchData = (page, size) => {
        beehiveService.getMemberships({
            sellerId: CredentialUtils.getStoreId(),
            sort: "priority,asc",
            page: page - 1,
            size: size
        }).then(res => {
            setLoyalties(res.data);
            setSelectedSegments(filterSegments(res.data));
        });
    }

    const filterSegments = (data) => {
        return data.map(item => item.segmentId);
    }

    // redirect to Memberships collection if OK on confirm modal
    const renderRedirect = () => {
        if (onRedirect) return <Redirect to={NAV_PATH.marketing.LOYALTY_LIST} />
    }

    // cancel button
    const handleOnCancel = (e) => {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            okCallback: () => {
                setOnRedirect(true);
            }
        })
    }

    // save button
    const handleOnSaveSubmit = (event, values, error) => {
        if (isSaving)
            return
        if(!selectedSegment){
            setErrorSegment(i18next.t("component.loyalty.segment.required"))
            return
        }
            
        setIsValid(true);
        setIsSaving(true);

        //----------------------------------------//
        // data submit
        //----------------------------------------//
        const storeId = parseInt(CredentialUtils.getStoreId());
    
        let submitData = {
            name: values.name,
            description: values.membershipDescription,
            segmentId: selectedSegment.id,
            sellerId: storeId,
            priority: 1,
            enabledBenefit: stIsEnabledBenefit,
            discountPercent: values.discountPercent,
            discountMaxAmount: values.discountMaxAmount
        }
       
        if(file){
            uploadImageToServer(file).then(res => {
                submitData.image = res

                if (!isEditMode) {
                    saveMemberShip(submitData);
                } else if (isEditMode) {
                    submitData.id = loyalty.id;
                    updateMemberShip(submitData)
                }
            });
        }else{
            submitData.image = {
                urlPrefix: urlPrefix,
                imageUUID: urlName,
                extension: iconExtension
            }
            if (!isEditMode) {
                saveMemberShip(submitData);
            } else if (isEditMode) {
                submitData.id = loyalty.id;
                updateMemberShip(submitData)
            }
        }
    }

    const saveMemberShip = (data) => {
        if(loyalties.length > 0){
            const priority = Math.max(...loyalties.map(loyalty => loyalty.priority));
            data.priority = priority + 1;
        }
        beehiveService.saveMemberShip(data)
            .then(result => {
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    messages: i18next.t("component.loyalty.add.success.title"),
                    closeCallback: () => {
                        setOnRedirect(true);
                    }
                })

            }).catch(e => {
                let message = "component.loyalty." + e.response.data.message;
                if(e.response.data.status === 400){
                    message = "common.api.failed"
                }
                // has error when creating data
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t(message),
                    closeCallback: () => {
                        setIsSaving(false)
                    }
                })
            });
    }

    const updateMemberShip = (data) => {
        data.priority = loyalty.priority;
        data.iconId = urlName ? data.iconId || loyalty.iconId : data.iconId;
        data.iconUrlPrefix = urlPrefix ? data.iconUrlPrefix || loyalty.iconUrlPrefix : data.iconUrlPrefix;
        data.iconExtension = iconExtension ? data.iconExtension || loyalty.iconExtension : data.iconExtension;
        
        setIconExtension(data.iconExtension)
        
        beehiveService.updateMemberShip(data).then(result => {
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_SUCCESS,
                messages: i18next.t("component.loyalty.edit.success.title"),
                closeCallback: () => {
                    setOnRedirect(true)
                }
            })
        }).catch(e => {
            let message = "component.loyalty." + e.response.data.message;
            // has error when creating data
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_DANGER,
                messages: i18next.t(message),
                closeCallback: () => {
                    setIsSaving(false)
                }
            })
        });
    }

    const onRemoveImage = () => {
        setFile(undefined);
        setUrlName(undefined)
        setUrlPrefix(undefined)
        setIconExtension(undefined)
    }

    const onFileUploaded = (files) => {

        let fileName = files[0].name;
        let file = files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            let img = document.createElement("img");
            img.onload = () => {
                let canvas = document.createElement('canvas');
                let MAX_WIDTH = 64;
                let MAX_HEIGHT = 64;

                canvas.width = MAX_WIDTH;
                canvas.height = MAX_HEIGHT;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, MAX_WIDTH, MAX_HEIGHT);
                canvas.toBlob((blob) => { setFile(new File([blob], fileName)) });
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);

    }
    const renderHeader = () => {
        return (
            <GSContentHeader className="page-toolbar"
                title={isEditMode ? i18next.t("component.loyalty.edit.title") : i18next.t("component.loyalty.addNew.title")}>
                {/*BTN SAVE*/}
                <div className="group-btn">
                    <GSButton success
                        // disabled={name.length === 0}
                        className={"btn-save"}
                        style={{ marginLeft: 'auto' }}
                        onClick={() => this.refBtnSubmitForm.click()}>
                        <span className="spinner-border spinner-border-sm" role="status" hidden={!isSaving}></span>
                        <Trans i18nKey={isSaving ? 'common.btn.saving' : 'common.btn.save'} className="sr-only">
                            Save
                        </Trans>
                    </GSButton>
                    {/*BTN CANCEL*/}
                    <GSButton secondary outline marginLeft hidden={isSaving} onClick={handleOnCancel}>
                        <Trans i18nKey="common.btn.cancel">
                            Cancel
                        </Trans>
                    </GSButton>
                </div>

            </GSContentHeader>
        )
    }
    const uploadImageToServer = (file) => {
        return mediaService.uploadFileWithDomain(file, MediaServiceDomain.GENERAL);
    }
    const onClose = () => {
        if(selectedSegment){
            setErrorSegment(null)
        }
        setOpenSegmentModal(false);
    }
    const onSubmit = (selectedSegment) => {
        setOpenSegmentModal(false);
        setSelectedSegment(selectedSegment)
        if(selectedSegment){
            setErrorSegment(null);
        }
        
    }
    const renderUserCount = (selectedSegment) => {
        if(selectedSegment)
            return '(' + selectedSegment.name + ' / ' 
                + NumberUtils.formatThousand(selectedSegment.userCount) 
                + (selectedSegment.userCount > 1 ? ' users ' : ' user ') 
                + i18next.t('page.marketing.loyalty.txt.selected') + ')';
    };

    const onChangeBenefit = (e) => {
        setStIsEnabledBenefit(e.currentTarget.value);
        if (!e.currentTarget.value) {
            setLoyalty({
                ...loyalty,
                discountPercent: '',
                discountMaxAmount: ''
            })
        }
    };

    const handleInvalidSubmit = (event, errors, values) => {
        let scrollTo = jquery('.' + errors[0] + 'ScrollTo');
        if (scrollTo && scrollTo[0]) {
            scrollTo[0].scrollIntoView({block: "center", behavior: "smooth"});
        }
    };

    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect} className="loyalty-form">
            {(isSaving) && <LoadingScreen />}
            {renderRedirect()}
            {renderHeader()}
            <GSContentBody size={GSContentBody.size.MAX}>
                <AvForm onValidSubmit={handleOnSaveSubmit} onInvalidSubmit={handleInvalidSubmit}>
                    <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden />
                    {!isValid &&
                        <div className="alert alert-danger product-form__alert product-form__alert--error" role="alert">
                            <Trans i18nKey="component.product.edit.invalidate" />
                        </div>
                    }
                    <UikWidget className={"gs-widget "}>
                        <UikWidgetContent className={isSaving ? 'gs-atm--disable widget__content' : 'widget__content'}>
                            <section className="group-input">
                                <section className="tier-name">
                                    <AvField name={'name'} value={loyalty.name}
                                        label={<Trans i18nKey="component.loyalty.form.name">Tier Name</Trans>}
                                        validate={{
                                            ...props.validate,
                                            required: { value: true, errorMessage: i18next.t("common.validation.required") },
                                            maxLength: { value: 150, errorMessage: i18next.t("common.validation.char.max.length", { x: 150 }) }
                                        }}>
                                    </AvField>
                                    <div className="form-group">
                                        <Label>{<Trans i18nKey="component.loyalty.form.auto.segment">Auto Segment</Trans>}</Label>
                                        <span className="segment-add">
                                            <GSFakeLink onClick={() => setOpenSegmentModal(true)}>{selectedSegment ? i18next.t("component.loyalty.form.auto.edit.segment") : i18next.t("component.loyalty.form.auto.add.segment")}</GSFakeLink>
                                            <span>{renderUserCount(selectedSegment)}</span>
                                        </span>
                                        <span className='error-segment'>{errorSegment}</span>
                                    </div>
                                </section>
                                <section className="image">
                                    <label>{i18next.t("component.loyalty.form.icon")}
                                        <span>{i18next.t("component.loyalty.form.optional")}</span>
                                    </label>
                                    <GSImg src={(!file && !urlName) ? undefined :
                                        file ? URL.createObjectURL(file) :
                                            ImageUtils.getImageFromImageModel({
                                                urlPrefix: urlPrefix,
                                                imageUUID: urlName,
                                                extension: iconExtension
                                            })}
                                    />
                                    <div className="image-upload">
                                        <GSButtonUpload onUploaded={onFileUploaded} accept={IMAGE_RECOMMEND.ACCEPT.map(item => item.enum)} />
                                        {(file || urlName) &&
                                            <div className="image-thumnail">
                                                {ImageUtils.ellipsisFileName(file ? file.name : urlName, MAX_FILE_NAME_LENGTH)}
                                                <span onClick={onRemoveImage}>
                                                    <FontAwesomeIcon icon={"times"} />
                                                </span>
                                            </div>
                                        }
                                    </div>
                                    <span>{`${64} x ${64}px (${IMAGE_RECOMMEND.ACCEPT.map(item => item.name).join('/')} file)`}</span>
                                </section>
                                <section className="description">
                                    <Label for={'membershipDescription'} >
                                        <Trans i18nKey="component.loyalty.form.description">Description</Trans>
                                    </Label>
                                    <GSEditor
                                        name={'membershipDescription'}
                                        isRequired={true}
                                        minLength={100}
                                        maxLength={100000}
                                        value={loyalty.description}
                                    />
                                </section>
                            </section>
                        </UikWidgetContent>
                    </UikWidget>
                    <UikWidget className={"gs-widget "}>
                        <UikWidgetContent className={isSaving ? 'gs-atm--disable widget__content' : 'widget__content'}>
                            <section className="benefit">
                                <section>
                                    <AvCustomCheckbox
                                        value={stIsEnabledBenefit}
                                        label={i18next.t("component.loyalty.form.enabledBenefit")}
                                        name={'enabledBenefit'}
                                        onChange={(e) => onChangeBenefit(e)}
                                        description={i18next.t('component.loyalty.form.benefitDescription')}
                                    />
                                </section>
                                <section>
                                    <Row>
                                        <Col xs={12} xl={3} md={6} lg={3} sm={6} className={'discountPercentScrollTo'}>
                                            <AvFieldCurrency
                                                disabled={!stIsEnabledBenefit}
                                                unit={NumericSymbol.PERCENTAGE}
                                                label={i18next.t("component.loyalty.form.discountPercent")}
                                                name={'discountPercent'}
                                                value={loyalty.discountPercent}
                                                validate={{
                                                    ...FormValidate.withCondition(stIsEnabledBenefit, FormValidate.required()),
                                                    ...FormValidate.minValue(1, true),
                                                    ...FormValidate.maxValue(100, true)
                                                }}
                                                precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2'}
                                                decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2}
                                            />
                                        </Col>
                                        <Col xs={12} xl={3} md={6} lg={3} sm={6} className={'discountMaxAmountScrollTo'}>
                                            <AvFieldCurrency
                                                disabled={!stIsEnabledBenefit}
                                                unit={CurrencyUtils.getLocalStorageSymbol()}
                                                label={i18next.t("component.loyalty.form.discountMaxAmount")}
                                                name={'discountMaxAmount'}
                                                value={loyalty.discountMaxAmount}
                                                validate={{
                                                    ...FormValidate.minValue(0.01, false),
                                                    ...FormValidate.maxValue(1_000_000_000, true)
                                                }}
                                                position={CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol())}
                                                precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2'}
                                                decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2}
                                            />
                                            <Label className={'max-amount-description'}>
                                                <Trans i18nKey="component.loyalty.form.maxAmountDescription">(If blank, the % discount will not be limited to maximum amount)</Trans>
                                            </Label>
                                        </Col>
                                    </Row>
                                </section>
                            </section>
                        </UikWidgetContent>
                    </UikWidget>
                </AvForm>
            </GSContentBody>
            <AlertModal ref={(el) => { this.alertModal = el }} />
            <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
            {openSegmentModal && <SegmentModal onClose={onClose} onSubmit={onSubmit}
                selectedSegments={selectedSegments}
                selectedSegment={selectedSegment} />}
        </GSContentContainer>
    )
};

export default LoyaltyFormEditor;
