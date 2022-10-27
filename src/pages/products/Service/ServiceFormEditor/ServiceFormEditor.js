/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 22/10/2019
 * Author: Long Phan <long.phan@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import {UikButton, UikTag, UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../../@uik';
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import {AvForm} from 'availity-reactstrap-validation';
import '../../../../../sass/ui/_gswidget.sass';
import '../../../../../sass/ui/_gsfrm.sass';
import './ImageView.sass';
import Label from "reactstrap/es/Label";
import ImageUploader, {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import './ServiceFormEditor.sass';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import Dropzone from "react-dropzone";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {ItemService} from "../../../../services/ItemService";
import {Trans} from "react-i18next";
import i18next from "../../../../config/i18n";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {Redirect} from "react-router-dom";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {ImageUtils} from "../../../../utils/image";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import {ServiceVariationSelector} from "./ServiceVariationSelector";
import {PricingUtils} from "../../../../utils/pricing";
import {RouteUtils} from "../../../../utils/route";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {GSToast} from "../../../../utils/gs-toast";
import ServiceFormCollectionSelector from "./CollectionSelector/ServiceFormCollectionSelector";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import GSEditor from "../../../../components/shared/GSEditor/GSEditor";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {CredentialUtils} from "../../../../utils/credential";
import storeService from "../../../../services/StoreService";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import {FormValidate} from "../../../../config/form-validate";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import SEOEditor from "../../../seo/SEOEditor";
import ServiceTranslateModal from "../ServiceModals/ServiceTranslateModal";
import HintPopupVideo from "../../../../components/shared/HintPopupVideo/HintPopupVideo";
import AvCustomCheckbox from "../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import Constants from "../../../../config/Constant";
import {InventoryEnum} from '../../InventoryList/InventoryEnum'
import {CurrencyUtils} from "../../../../utils/number-format";
import storageService from '../../../../services/storage'
import HocSEOEditor from '../../../seo/hoc/HocSEOEditor'
import {ItemUtils} from '../../../../utils/item-utils'

export const ServiceFormEditorMode = {
    ADD_NEW: 'addNew',
    EDIT: 'edit'
}
const ServiceModelKey = {
    ID: "id",
    NAME: "name",
    CATE_ID: "cateId",
    ITEM_TYPE: "itemType",
    CURRENCY: "currency",
    DESCRIPTION: "description",
    DISCOUNT: "discount",
    ORG_PRICE: "orgPrice",
    NEW_PRICE: "newPrice",
    TOTAL_COMMENT: "totalComment",
    TOTAL_LIKE: "totalLike",
    IMAGES: "images",
    TOTAL_ITEM: "totalItem",
    SHIPPING_INFO: "shippingInfo",
    CATEGORIES: "categories",
    PARENT_SKU: "parentSku",
    MODELS: "models",
    QUANTITY_CHANGED: "quantityChanged",
    BCOIN: "bcoin",
    IS_SELF_DELIVERY: "isSelfDelivery",
    SOLD_ITEMS: "soldItem",
    SEO_TITLE: 'seoTitle',
    SEO_DESCRIPTION: 'seoDescription',
    SEO_KEYWORDS: 'seoKeywords',
    SEO_URL: 'seoUrl'
}
const ServiceFormEditor = (props) => {

    const defaultValue = (key, defaultV) => {
        if (!props.item) return defaultV
        return props.item[key]? props.item[key]: defaultV
    }

    const [OTHER_CATEGORY_ID_LVL1] = useState(1014)
    const [OTHER_CATEGORY_ID_LVL2] = useState(1680)
    const [IMAGE_MAX_LENGTH] = useState(20)
    const [IMAGE_MIN_LENGTH] = useState(1)
    const [IMAGE_MAX_SIZE_BY_MB] = useState(10)
    const [DEPLAY_TIME] = useState(500)
    const [timeSlotPattern] = useState({
        value: "^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$",
        errorMessage: i18next.t("component.service.addNew.variations.time.validation.pattern.messages")
    })
    const [tableConfig] = useState({
        headerList: [
            i18next.t("component.service.addNew.variations.title.location"),
            i18next.t("component.service.addNew.variations.title.timeslot")
        ]
    });
    const [isCheckValidOnly, setIsCheckValidOnly] = useState(false);
    const [prodImageList, setProdImageList] = useState([]);
    const [prodImageMain, setProdImageMain] = useState(-1);
    const [isValidImageAmount, setIsValidImageAmount] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [onRedirect, setOnRedirect] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [orgPrice, setOrgPrice] = useState();
    const [newPrice, setNewPrice] = useState();
    const [isDirectToCollection, setIsDirectToCollection] = useState(false);
    const [collectionList, setCollectionList] = useState({addList: [], removeList: []});
    const [locations, setLocations] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [stIsLocationValid, setStIsLocationValid] = useState(true);
    const [stIsTimeSlotValid, setStIsTimeSlotValid] = useState(true);
    const [stIsRedirectToService, setStIsRedirectToService] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [itemModels, setItemModels] = useState([]);
    const [data, setData] = useState({})
    const [seoUrl, setSeoUrl] = useState('');
    const [stStoreListing, setStStoreListing] = useState();
    const [stEnabledListing, setStEnableListing] = useState(false);
    const [stSymbol, setStSymbol] = useState(CurrencyUtils.getLocalStorageSymbol);
    const [stServiceName, setStServiceName] = useState(defaultValue(ServiceModelKey.NAME, ''));

    const refSEOUrl = useRef()

    useEffect(() => {
          // check edit     
        if (props.mode === ServiceFormEditorMode.EDIT) {
            setProdImageList(props.item.images);
            setProdImageMain(0);
            setIsActive(props.item.bhStatus === 'ACTIVE');
            setOrgPrice(props.item[ServiceModelKey.ORG_PRICE]);
            setNewPrice(props.item[ServiceModelKey.NEW_PRICE]);
            initVariation(props.item.models)
            setItemModels(props.item.models);
            setIsCheckValidOnly(true);
            setStSymbol(props.item[ServiceModelKey.CURRENCY])
            ItemService.getLanguagesByItemId(props.item.id)
                .then(result => {
                    // const languageDefault=languages.find(item=>item.isDefault==true)
                    // const item= result.find(data=>data.language==languageDefault.langCode)
                    setData(result)

                })

                .catch(() => GSToast.commonError())
            if (props.item.seoUrl) {
                setSeoUrl(props.item.seoUrl + '-p' + props.item.id)
            }
        }
    },[props.collectionList]);

    useEffect(()=>{
        Promise.all([
            storeService.getListLanguages(),
            storeService.getStoreListingWebsite()
        ])
            .then(([resp, storeListing]) => {
                setLanguages(resp);
                setStStoreListing(storeListing)
                setStEnableListing(props.item ? props.item.enabledListing : storeListing.enabledService)
            })
            .catch(() => GSToast.commonError())
    },[])
    const initVariation = (models) =>{
        let locations = [];
        let timeSlots = [];
        models.forEach(model => {
            let nameSplit = model.orgName.split("|");
            const location = nameSplit[0];
            const timeSlot = nameSplit[1];

            if(!locations.includes(location)){
                locations.push(location);
            }
            if(!timeSlots.includes(timeSlot)){
                timeSlots.push(timeSlot);
            }
        });
        setLocations(locations);
        setTimeSlots(timeSlots);
    }
    const onImageUploaded = (files) => {
        let images = prodImageList;
        if (!Array.isArray(files)) {
            files = [...files]
        }
        //filter wrong extension
        files = files.filter(file => {
            if ([ImageUploadType.JPEG, ImageUploadType.PNG,ImageUploadType.GIF].includes(file.type)) { // => correct
                return true
            } else {
                GSToast.error(i18next.t("component.service.addNew.images.wrongFileType", {
                    fileName: file.name
                }))
                return false
            }
        })
        // check if has image over limited size
        const overSizeFiles = files.filter((file) => file.size / 1024 / 1024 > IMAGE_MAX_SIZE_BY_MB)
        if (overSizeFiles.length > 0) {
            for (const f of overSizeFiles) {
                GSToast.error(i18next.t("component.service.addNew.images.maximumSize", {
                    fileName: f.name,
                    size: IMAGE_MAX_SIZE_BY_MB
                }))
            }
        }
        // filter size
        files = files.filter((file) => file.size / 1024 / 1024 <= IMAGE_MAX_SIZE_BY_MB)
        // filter length
        let tArr = [...images, ...files].slice(0, IMAGE_MAX_LENGTH)
        setProdImageList([...tArr]);
        setIsValidImageAmount(tArr.length >= IMAGE_MIN_LENGTH && tArr.length <= IMAGE_MAX_LENGTH);
    }
    const onRemoveImage = (index) => {
        let images = prodImageList.slice();
        images.splice(index, 1)
        let mainImage = prodImageMain
        if (images.length === 0) {
            mainImage = -1
        } else {
            mainImage = prodImageMain === index ? 0 : (prodImageMain < index) ? prodImageMain : prodImageMain - 1 ;
        }
        setProdImageList(images);
        setProdImageMain(mainImage);
        setIsValidImageAmount(images.length >= IMAGE_MIN_LENGTH && images.length <= IMAGE_MAX_LENGTH)
    }
    const isMainImage = (index) => {
        if (prodImageMain === -1 && index === 0) {
            setProdImageMain(0);
            return true;
        } else {
            return prodImageMain === index
        }
    }
    const handleOnSaveSubmit = async (event, errors, values) => {
        const isSEOUrlValidRes = refSEOUrl.current && await refSEOUrl.current.isValid()

        if (!isSEOUrlValidRes) {
            return
        }

        if (values.locations || values.timeSlots) {
            if (values.locations) {
                setStIsLocationValid(false)
            }
            if (values.timeSlots) {
                setStIsTimeSlotValid(false)
            }
            return
        } else {
            setStIsLocationValid(true)
            setStIsTimeSlotValid(true)
        }
        if (isSaving) return
        let productModel = {
            "name": "",
            "cateId": OTHER_CATEGORY_ID_LVL2,
            "currency": stSymbol,
            "description": "",
            "itemType": "SERVICE",
            "orgPrice": 0,
            "newPrice": 1000,
            "discount": "0",
            "totalComment": 0,
            "totalLike": 0,
            "totalItem": 0,
            "images": [],
            "categories": [{ id: null, level: 1, cateId: OTHER_CATEGORY_ID_LVL1 }, { id: null, level: 2, cateId: OTHER_CATEGORY_ID_LVL2 }],
            "models": [],
            "quantityChanged": false,
            "bcoin": 0,
            "isSelfDelivery": true,
            seoTitle: values.seoTitle? values.seoTitle: undefined,
            seoDescription: values.seoDescription? values.seoDescription: undefined,
            seoUrl: values.seoUrl? ItemUtils.changeNameToLink(values.seoUrl): undefined,
            seoKeywords: values.seoKeywords? values.seoKeywords: undefined,
        }
        // check valid
        if (!isAllFieldValid() | errors.length > 0) {
            setIsValid(false);
            setIsCheckValidOnly(false);
            return
        }
        setIsValid(true);
        setIsSaving(true);
        // if update case
        if (props.mode === ServiceFormEditorMode.EDIT) {
            productModel = {
                ...props.item,
                seoTitle: values.seoTitle? values.seoTitle: undefined,
                seoDescription: values.seoDescription? values.seoDescription: undefined,
                seoUrl: values.seoUrl? ItemUtils.changeNameToLink(values.seoUrl): undefined,
                seoKeywords: values.seoKeywords? values.seoKeywords: undefined,
            }
        }
        // upload image
        let prodBasicInfo = values
        let saveSub = uploadImageToServer().then(values => {
            // swap with main image
            let mainIndex = prodImageMain
            //let orgImageArr = props.item ? props.item.images : []
            let orgImageArr = [...prodImageList]
            if(orgImageArr && orgImageArr.length > 0){
                orgImageArr = orgImageArr.filter( e => e.id ).map( e => ({
                    imageId: e.imageId,
                    imageUUID: e.imageUUID,
                    urlPrefix: e.urlPrefix,
                    extension: e.extension
                }))
            }

            // get new image just uploaded
            let imageArr = []
            if (values.length > 0) {
                for (let i = 0; i < values.length; i++) {
                    imageArr.push(formatImageData(values[i]));
                }
            }
            // merge image already exists to new image
            let finalImageArr = [...orgImageArr, ...imageArr]
            // swap main image to [0]
            let tempImage0 = finalImageArr[0]
            let tempImage3 = finalImageArr[mainIndex]
            finalImageArr[0] = tempImage3
            finalImageArr[mainIndex] = tempImage0
            // fill data
            let models = [];
            let orgPrice = prodBasicInfo.orgPrice;
            let newPrice = prodBasicInfo.newPrice;
            if(locations.length !== 0){
                locations.forEach((location, locationIndex) =>{
                    timeSlots.forEach((time, timeIndex) => {
                        let model  = {
                            name: location + "|" + time,
                            orgPrice: orgPrice,
                            costPrice: 0,
                            position: locationIndex + timeIndex,
                            newPrice: newPrice,
                            discount: PricingUtils.calculateDiscount(orgPrice, newPrice),
                            totalItem: 1000000,
                            soldItem: 0,
                            label: "location|timeslot"
                        }
                        models.push(model);
                    })
                })
                productModel.quantityChanged = true
                delete productModel.orgPrice
                delete productModel.newPrice
                delete productModel.discount
                delete productModel.totalItem
                delete productModel.costPrice
            } else {
                productModel.orgPrice = orgPrice;
                productModel.newPrice = newPrice;
            }
            productModel.name = prodBasicInfo.serviceName
            productModel.description = prodBasicInfo.serviceDescription
            productModel.images = finalImageArr
            productModel.enabledListing = stEnabledListing
            // map id to model
            if (props.mode === ServiceFormEditorMode.EDIT && props.item.models && props.item.models.length > 0) {
                models = models.map(model => {
                    // find previous model
                    const oModel = props.item.models.find(m => m.orgName === model.name)
                    if (oModel) {
                        return {
                            ...model,
                            id: oModel.id
                        }
                    }
                    return model
                })
            }

            models = models.map(model => {
                if(model.id){
                    model.inventoryType = 'CHANGE';
                    model.inventoryStock = 0;
                    model.inventoryActionType = 'FROM_UPDATE_AT_ITEM_SCREEN';
                }else{
                    model.inventoryType = 'SET';
                    model.inventoryStock = 1000000;
                    model.inventoryCurrent = 0;
                    model.inventoryActionType = 'FROM_CREATE_AT_ITEM_SCREEN';
                }
                return model
            })
            productModel.models = models;
            if (props.mode === ServiceFormEditorMode.EDIT) {
                delete productModel.commissionPercent
                delete productModel.commissionAmount
                delete productModel.hasCommission
                delete productModel.hasModel
                delete productModel.createdDate
                delete productModel.deleted
                delete productModel.lastModifiedDate
                delete productModel.quantityChangedDate
                delete productModel.remainTime
                delete productModel.reviewStatus
                delete productModel.itemScore
                delete productModel.typeScore
                delete productModel.soldItem
                delete productModel.totalSoldItem
                if (productModel.bhStatus === 'ERROR') {
                    productModel.bhStatus = 'ACTIVE'
                } else {
                    if (isActive) {
                        productModel.bhStatus = 'ACTIVE'
                    } else {
                        productModel.bhStatus = 'INACTIVE'
                    }
                }
            }
            // CHECK CATEGORY
            return storeService.getStoreInfo(CredentialUtils.getStoreId())
        })
            .then(storeResult => {
                if (storeResult.categoryIds.includes(OTHER_CATEGORY_ID_LVL1)) {
                    return new Promise(resolve => resolve('alreadyHasOtherCategory'))
                } else {
                    return storeService.updateStorefrontInfo({
                        id: storeResult.id,
                        categoryIds: [...storeResult.categoryIds, OTHER_CATEGORY_ID_LVL1]
                    })
                }
            })
            .then(cateResult => {
                // ADD NEW PRODUCT
                if (props.mode === ServiceFormEditorMode.ADD_NEW) {
                    productModel.inventoryType = InventoryEnum.ACTIONS.SET_STOCK;
                    productModel.inventoryStock = 1000000;
                    productModel.inventoryCurrent = 0;
                    productModel.inventoryActionType = InventoryEnum.ACTION_TYPES.FROM_CREATE_AT_ITEM_SCREEN;
                    let itemId
                    ItemService.createService(productModel)
                        .then(createRes => {
                            // save collection
                            itemId = createRes.id
                            return ItemService.createCollectionForItemId(createRes.id,
                                collectionList
                            )
                        })
                        .then(result => {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                messages: i18next.t("component.service.addNew.success.title"),
                                closeCallback: () => {
                                    if (isDirectToCollection) {
                                        return redirectToCollection()
                                    }
                                    redirectToServiceList()
                                }
                            })
                        })
                        .catch((e) => {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_DANGER,
                                messages: i18next.t("component.service.addNew.failed.title"),
                                closeCallback: () => {
                                    setIsSaving(false)
                                }
                            })
                        })
                } else { // UPDATE PRODUCT
                    // set inventory
                    productModel.inventoryType = 'CHANGE';
                    productModel.inventoryStock = 0;
                    productModel.inventoryActionType = 'FROM_UPDATE_AT_ITEM_SCREEN';
                    productModel.cateId = props.item.cateId
                    delete productModel.shippingInfo;
                    productModel.categories = props.item.categories.map(cate => {
                        return {
                            id: cate.id,
                            cateId: cate.cateId,
                            level: cate.level
                        }
                    })
                    ItemService.updateService(productModel).then(createRes => {
                        // save collection
                        return ItemService.createCollectionForItemId(createRes.id,collectionList)
                    })
                        .then(r => {
                            this.alertModal.openModal({
                                type: AlertModalType.OK,
                                messages: i18next.t("component.service.edit.success.title"),
                                closeCallback: () => {
                                    if (isDirectToCollection)
                                        return redirectToCollection()
                                    redirectToService(props.item.id)
                                }
                            })
                        })
                        .catch((e) => {
                            this.alertModal.openModal({
                                type: AlertModalType.ALERT_TYPE_DANGER,
                                messages: i18next.t("component.service.edit.failed.title"),
                                closeCallback: () => {
                                    setIsSaving(false);
                                }
                            })
                        })
                }
            })
            .catch((e) => {
                this.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t("component.service.edit.failed.title"),
                    closeCallback: () => {
                        setIsSaving(false);
                    }
                })
            })
    }
    const isAllFieldValid = () =>{
        const isImageValid = () => {
            if (prodImageList.length < IMAGE_MIN_LENGTH || prodImageList.length > IMAGE_MAX_LENGTH) {
                setIsValidImageAmount(false);
                return false
            }
            return true
        }
        // isImageValid
        if (!isImageValid()) {
            return false
        }
        return true
    }
    const uploadImageToServer = async () =>{
        let promiseArr = []
        for (let image of prodImageList) {
            if (image.id) continue
            let uploadHandle = await mediaService.uploadFileWithDomain(
                image, MediaServiceDomain.ITEM
            )
            promiseArr.push(uploadHandle)
        }
        return promiseArr
    }
    const formatImageData = (rawImageResponse) =>{
        return {
            imageId: rawImageResponse.imageId,
            imageUUID: rawImageResponse.imageUUID,
            height: rawImageResponse.height,
            width: rawImageResponse.width,
            urlPrefix: rawImageResponse.urlPrefix,
            extension: rawImageResponse.extension
        }
    }
    const handleOnCancel = (e) =>{
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.service.addNew.cancelHint'),
            okCallback: () => {
                setOnRedirect(true);
            }
        })
    }
    const onToggleActive = (e) => {
        e.preventDefault()
        setIsActive(!isActive)
    }
    const redirectToServiceList = () =>{
        setOnRedirect(true);
    }
    const redirectToService = (id) => {
        setStIsRedirectToService(true);
        setTimeout(() => {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.serviceEdit + '/' + id)
        }, 500)
    }
    const onClickRemove = (e) => {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.service.edit.remove.hint'),
            okCallback: () => {
                ItemService.remove(props.item.id)
                    .then(result => {
                        this.alertModal.openModal({
                            type: AlertInlineType.SUCCESS,
                            messages: i18next.t('component.service.edit.remove.success'),
                            closeCallback: redirectToServiceList
                        })
                    }, e => {
                        this.alertModal.openModal({
                            type: AlertInlineType.ERROR,
                            messages: i18next.t('component.service.edit.remove.failed'),
                            closeCallback: redirectToServiceList
                        })
                    })
            }
        })
    }
    const redirectToCollection = () => {
        setOnRedirect(true);
        RouteUtils.linkTo(props, NAV_PATH.collectionCreate + '/SERVICE')
    }
    const redirectToCollectionWithSave = () => {
        setIsDirectToCollection(true);
        this.refBtnSubmitForm.click();
    }
    const renderHeader = () => {
        const renderTag = () => {
            if (props.item.bhStatus.toUpperCase() !== 'ERROR') {
                if (isActive) {
                    return (
                        <UikTag fill className="toolbar__product-status toolbar__product-status--active">
                            <Trans i18nKey="component.service.edit.toolbar.status.active" />
                        </UikTag>
                    )
                } else {
                    return (
                        <UikTag fill className="toolbar__product-status toolbar__product-status--inactive">
                            <Trans i18nKey="component.service.edit.toolbar.status.inactive" />
                        </UikTag>
                    )
                }
            } else {
                return (
                    <UikTag fill className="gs-status-tag gs-status-tag--error" style={{ marginRight: '1em' }}>
                        <Trans i18nKey="component.service.edit.toolbar.status.error" />
                    </UikTag>
                )
            }
        }
        switch (props.mode) {
            case ServiceFormEditorMode.ADD_NEW:
                return (
                    <GSContentHeader className="page-toolbar">
                        <h5 className="gs-page-title">
                            <Trans i18nKey="component.service.addNew.toolBar.createNewService">
                                Create new Service
                            </Trans>
                        </h5>
                        <HintPopupVideo title={"Create service"} category={"CREATE_SERVICE"}/>
                        {renderHeaderBtnNew()}
                    </GSContentHeader>
                )
            case ServiceFormEditorMode.EDIT:
                return (
                    <GSContentHeader className="page-toolbar">
                        {props.mode === ServiceFormEditorMode.EDIT &&
                        renderTag()
                        }
                        <h5 className="gs-page-title product-name">
                            {defaultValue(ServiceModelKey.NAME, '')}
                        </h5>
                        {renderHeaderBtnEdit()}
                    </GSContentHeader>
                )
        }
    }
    const renderHeaderMobile = () => {
        switch (props.mode) {
            case ServiceFormEditorMode.ADD_NEW:
                return (renderHeaderBtnNew());
            case ServiceFormEditorMode.EDIT:
                return (renderHeaderBtnEdit());
        }
    }
    const renderHeaderBtnNew = () => {
        return (<div className='gss-content-header--action-btn sticky'>
            <div className='gss-content-header--action-btn--group'>
                {/*BTN SAVE*/}
                <GSButton success className="btn-save" marginRight style={{ marginLeft: 'auto' }}
                          onClick={() => this.refBtnSubmitForm.click()}>
                    <span className="spinner-border spinner-border-sm" role="status" hidden={!isSaving}>
                    </span>
                    <Trans i18nKey={isSaving ? 'common.btn.saving' : 'common.btn.save'} className="sr-only">
                        Save
                    </Trans>
                </GSButton>
                {/*BTN CANCEL*/}
                <GSButton secondary outline marginLeft hidden={isSaving}
                          onClick={handleOnCancel}>
                    <Trans i18nKey="common.btn.cancel">
                        Cancel
                    </Trans>
                </GSButton>
            </div>
        </div>);
    }
    const renderHeaderBtnEdit = () => {
        const renderActivateBtnText = () => {
            if (isActive) {
                return (
                    <Trans i18nKey="component.service.edit.toolbar.status.deactivate">
                        DEACTIVATE
                    </Trans>
                )
            } else {
                return (
                    <Trans i18nKey="component.service.edit.toolbar.status.activate">
                        ACTIVATE
                    </Trans>
                )
            }
        }
        return (
            <div className='gss-content-header--action-btn sticky'>
                <div className='gss-content-header--action-btn--group'>
                    <ServiceTranslateModal
                        dataLanguages = {languages}
                        dataModels = {itemModels}
                        dataService={data}
                        dataSeoUrl={seoUrl}
                        // onSuccess={state.handleTranslateSuccess}
                    />
                    {/*BTN SAVE*/}
                    <GSButton success className="btn-save" style={{ marginLeft: 'auto' }} onClick={() => this.refBtnSubmitForm.click()}>
                        <span className="spinner-border spinner-border-sm" role="status" hidden={!isSaving}></span>
                        <Trans i18nKey={isSaving ? 'common.btn.saving' : 'common.btn.save'} className="sr-only">
                            Save
                        </Trans>
                    </GSButton>
                    {/*BTN CANCEL*/}
                    <GSButton secondary outline marginLeft hidden={isSaving} onClick={(e) => handleOnCancel(e)}>
                        <Trans i18nKey="common.btn.cancel">Cancel</Trans>
                    </GSButton>
                    {/*BTN DEACTIVATE*/}
                    <GSButton warning outline marginLeft hidden={isSaving} className={'btn-none-pdlr'}
                              disabled={props.item.bhStatus.toUpperCase() === 'ERROR'} onClick={onToggleActive}>
                        {renderActivateBtnText()}
                    </GSButton>
                    {/*BTN DELETE*/}
                    <GSButton danger outline marginLeft hidden={isSaving} onClick={onClickRemove}>
                        <Trans i18nKey="common.btn.delete">DELETE</Trans>
                    </GSButton>
                </div>
            </div>
        )
    }
    const renderRedirect = () => {
        if (onRedirect) return <Redirect to='/service/list' />
    }
    const setMainImage = (index) => {
        setProdImageMain(index);
    }

    const onOrgPriceChange = (e) => {
        let {value} = e.currentTarget
        setOrgPrice(checkSymbolInput(stSymbol,value));
    }

    const onNewPriceChange = (e) => {
        let {value} = e.currentTarget
        setNewPrice(checkSymbolInput(stSymbol,value));
    }

    const checkSymbolInput = (symbol, value) => {
        if (symbol === Constants.CURRENCY.VND.SYMBOL) {
            return parseInt(value)
        } else {
            return parseFloat(value).toFixed(2)
        }
    }

    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!onRedirect && !stIsRedirectToService} className="service-form-page"
                            isSaving={isSaving}>
            {renderRedirect()}
            {renderHeader()}
            <GSContentBody size={GSContentBody.size.LARGE}>
                {renderHeaderMobile()}
                <AvForm onSubmit={(event, errors, values) => handleOnSaveSubmit(event, errors, values)} onKeyPress={(e) => e.key === 'Enter' ? e.preventDefault() : null} autoComplete="off">
                    <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden />
                    {/*Service INFO*/}
                    <UikWidget className={"gs-widget "}>
                        <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                            <Trans i18nKey="component.service.addNew.serivceInformation.title">
                                Service information
                            </Trans>
                        </UikWidgetHeader>
                        <UikWidgetContent className={isSaving ? 'gs-atm--disable widget__content-little-pdl' : 'widget__content-little-pdl'}>
                            <section>
                                <AvFieldCountable
                                    label={i18next.t("component.service.addNew.serivceInformation.name")}
                                    name={'serviceName'}
                                    type={'text'}
                                    isRequired={true}
                                    minLength={0}
                                    maxLength={100}
                                    value={defaultValue(ServiceModelKey.NAME, '')}
                                    onChange={e => setStServiceName(e.currentTarget.value)}
                                />
                            </section>
                            <section className="service-basic-info">
                                <AvFieldCurrency
                                    name={'orgPrice'}
                                    label={i18next.t("component.product.addNew.pricingAndInventory.price")}
                                    type="number"
                                    unit={stSymbol}
                                    value={defaultValue(ServiceModelKey.ORG_PRICE, 0)}
                                    validate={{
                                        ...FormValidate.number(),
                                        ...FormValidate.required(),
                                        ...FormValidate.maxValue(Constants.VALIDATIONS.SERVICE.MAX_PRICE, true),
                                        ...FormValidate.minValue(0, true)
                                    }}
                                    onValueKeyPressChange={onOrgPriceChange}
                                    position={CurrencyUtils.isPosition(stSymbol)}
                                    precision={CurrencyUtils.isCurrencyInput(stSymbol) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(stSymbol) && 2}
                                />
                                <AvFieldCurrency
                                    name={'newPrice'}
                                    label={i18next.t("component.product.addNew.pricingAndInventory.discountPrice")}
                                    type="number"
                                    unit={stSymbol}
                                    value={defaultValue(ServiceModelKey.NEW_PRICE, 0)}
                                    validate={{
                                        ...FormValidate.number(),
                                        ...FormValidate.required(),
                                        ...FormValidate.maxValue(orgPrice, true, 
                                            "common.validation.number.max.value", CurrencyUtils.getLocalStorageSymbol()),
                                        ...FormValidate.minValue(0, true)
                                    }}
                                    onValueKeyPressChange={onNewPriceChange}
                                    position={CurrencyUtils.isPosition(stSymbol)}
                                    precision={CurrencyUtils.isCurrencyInput(stSymbol) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(stSymbol) && 2}
                                />
                            </section>
                            {
                                stStoreListing && <section>
                                    <AvCustomCheckbox
                                        key={stEnabledListing}
                                        name='enabledListing'
                                        value={stEnabledListing}
                                        disabled={!stStoreListing.enabledService}
                                        label={i18next.t('component.service.addNew.listingWeb')}
                                        onChange={e => setStEnableListing(e.currentTarget.value)}
                                    />
                                </section>
                            }
                            <section>
                                <Label for={'serviceDescription'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.service.addNew.serivceInformation.description">Service Description</Trans>
                                </Label>
                                <GSEditor
                                    name={'serviceDescription'}
                                    isRequired={true}
                                    minLength={100}
                                    maxLength={100000}
                                    value={defaultValue(ServiceModelKey.DESCRIPTION, '')}
                                />
                            </section>
                            <section>
                                <Label for={'productCollection'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.service.addNew.serivceInformation.collection.title">
                                        Collection
                                    </Trans>
                                </Label>
                                <ServiceFormCollectionSelector
                                    redirectWithoutSave={redirectToCollection}
                                    redirectWithSave={redirectToCollectionWithSave}
                                    itemId={defaultValue(ServiceModelKey.ID, null)}
                                    onChange={setCollectionList}
                                    collectionList={props.collectionList ? props.collectionList :  []}
                                    collectionDefaultList={props.collectionDefaultList ? props.collectionDefaultList : []}
                                />
                            </section>
                        </UikWidgetContent>
                    </UikWidget>
                    {/*IMAGE*/}
                    <UikWidget className="gs-widget">
                        <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                            <Trans i18nKey="component.service.addNew.images.title">Images</Trans>
                        </UikWidgetHeader>
                        <UikWidgetContent className={isSaving ? 'gs-atm--disable widget__content-little-pdl' : 'widget__content-little-pdl'}>
                            <div className="image-drop-zone" hidden={prodImageList.length > 0}>
                                <Dropzone onDrop={onImageUploaded} >
                                    {({ getRootProps, getInputProps }) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} accept={ImageUploadType.JPEG + ',' + ImageUploadType.PNG+','+ImageUploadType.GIF} />
                                                <p><FontAwesomeIcon icon={'upload'} className="image-drop-zone__icon" /></p>
                                                <p><GSTrans t="component.service.addNew.images.dragAndDrop" values={{ maxSize: IMAGE_MAX_SIZE_BY_MB }}>
                                                    dragAndDrop
                                                </GSTrans>
                                                </p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            <div className="image-widget__container" hidden={prodImageList.length === 0}>
                                {prodImageList.map((item, index) => {
                                    return (<ImageView
                                        key={(item.id ? item.id : item.name) + index}
                                        src={item}
                                        arrIndex={index}
                                        isMain={isMainImage(index)}
                                        onRemoveCallback={() => onRemoveImage(index)}
                                        onSelectCallback={()=> setMainImage(index)} />)
                                })}
                                <span className="image-widget__image-item image-widget__image-item--no-border">
                                    <ImageUploader
                                        hidden={prodImageList.length >= IMAGE_MAX_LENGTH}
                                        accept={[ImageUploadType.JPEG, ImageUploadType.PNG,ImageUploadType.GIF]}
                                        multiple={true}
                                        text="Add more photo"
                                        maximumFileSizeByMB={IMAGE_MAX_SIZE_BY_MB}
                                        onChangeCallback={onImageUploaded} />
                                </span>
                            </div>
                            <div className="image-widget__error-wrapper">
                                <AlertInline
                                    text={i18next.t("component.service.addNew.images.errAmountMessage")}
                                    type="error"
                                    nonIcon
                                    hidden={isValidImageAmount}/>
                            </div>
                        </UikWidgetContent>
                    </UikWidget>
                    {/*Locations & Times*/}
                    <UikWidget className="gs-widget sub-title">
                        <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                            <Trans i18nKey="component.service.addNew.variations.title">
                                Locations & Times
                            </Trans>
                            <span> <Trans i18nKey="component.service.addNew.variations.subtitle">
                                It will be set-up daily
                            </Trans></span>
                        </UikWidgetHeader>
                        <UikWidgetContent className={isSaving ? 'gs-atm--disable widget__content widget__content-little-pdl location-time-setup'
                            : 'widget__content widget__content-little-pdl location-time-setup'}>
                            <Label>
                                <Trans i18nKey="component.service.addNew.variations.title.locations">Locations</Trans>
                            </Label>
                            <ServiceVariationSelector key="location"
                                                      className={'locations'}
                                                      name={"locations"}
                                                      data={locations}
                                                      dataMaxLength={10}
                                                      maxLength={250}
                                                      onChange={(locations) => {
                                                          setLocations(locations)
                                                          setStIsLocationValid(true)
                                                      }}
                                                      placeHolder="component.service.addNew.variations.title.locations.hint">
                            </ServiceVariationSelector>
                            {!stIsLocationValid && <AlertInline className="pt-0" nonIcon textAlign={"left"} text={i18next.t('page.service.pressEnterToSave')} type={AlertInlineType.ERROR}/>}
                            <Label className="has-tooltip">
                                <Trans i18nKey="component.service.addNew.variations.title.timeslots">Time Slots</Trans>
                                <GSComponentTooltip message={i18next.t(`component.service.addNew.variations.title.timeslots.tooltip`)} placement={GSComponentTooltipPlacement.RIGHT}>
                                    <div className="empty">
                                        <i className="icon-empty"></i>
                                    </div>
                                </GSComponentTooltip>
                            </Label>

                            <ServiceVariationSelector key="timeSlots"
                                                      className={'timeSlots'}
                                                      name={"timeSlots"}
                                                      data={timeSlots}
                                                      dataMaxLength={48}
                                                      validate={{ pattern: timeSlotPattern }}
                                                      maxLength={5}
                                                      onChange={(timeSlots) => {
                                                          setTimeSlots(timeSlots)
                                                          setStIsTimeSlotValid(true)
                                                      }}
                                                      placeHolder="component.service.addNew.variations.title.timeslots.hint">
                            </ServiceVariationSelector>
                            {!stIsTimeSlotValid && <AlertInline className="pt-0" nonIcon textAlign={"left"} text={i18next.t('page.service.pressEnterToSave')} type={AlertInlineType.ERROR}/>}
                        </UikWidgetContent>
                        {/*List of Locations & Times*/}
                        <section className="location-timeslots">
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                <Trans i18nKey="component.service.addNew.locations.times.list.tile">
                                    List of Locations & Times
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className={isSaving ? 'gs-atm--disable widget__content widget__content-little-pdl'
                                : 'widget__content widget__content-little-pdl'}>
                                <PagingTable
                                    headers={tableConfig.headerList}
                                    totalItems={locations.length}
                                    isShowPagination={false}>
                                    { locations.map((location, index) => {
                                        return (
                                            <section key={index + "_" + location} className="gs-table-body-items">
                                                <div className="gs-table-body-item"><span className="location-name">{location}</span></div>
                                                <div className="gs-table-body-item">
                                                    {timeSlots.map((time, index) => {
                                                        return (<span className="var-values__varItem time-slot" key={time + "_" + index}>{time}</span>)})}
                                                </div>
                                            </section>
                                        )
                                    })}
                                </PagingTable>
                                { locations.length === 0 &&
                                <div className="empty">
                                    <i className="icon-empty"></i><span>{i18next.t("component.service.empty")}</span>
                                </div>
                                }
                            </UikWidgetContent>
                        </section>
                    </UikWidget>
                    {/*SEO*/}
                    <HocSEOEditor ref={ refSEOUrl }
                                  langKey={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_INITIAL_LANGUAGE) }
                                  type={ Constants.SEO_DATA_TYPE.SERVICE }
                                  data={ defaultValue(ServiceModelKey.ID, '') }>
                        <SEOEditor defaultValue={ {
                            seoTitle: defaultValue(ServiceModelKey.SEO_TITLE, ''),
                            seoDescription: defaultValue(ServiceModelKey.SEO_DESCRIPTION, ''),
                            seoKeywords: defaultValue(ServiceModelKey.SEO_KEYWORDS, ''),
                            seoUrl: defaultValue(ServiceModelKey.SEO_URL, '')
                        } }
                                   prefix={ 'service/' }
                                   middleSlug={ ItemUtils.changeNameToLink(stServiceName || '') }
                                   postfix={ props.item ? `-p${ props.item.id }` : '' }
                                   enableLetterOrNumberOrHyphen={ false }
                                   assignDefaultValue={false}
                        />
                    </HocSEOEditor>
                </AvForm>
            </GSContentBody>
            <AlertModal ref={(el) => { this.alertModal = el }} />
            <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
        </GSContentContainer>
    )
}
const ImageView = (props) => {
    const [isSetMainCoverShow, setIsSetMainCoverShow] = useState(false);
    const [o9n, setO9n] = useState(false);
    const [imageObj, setImageObj] = useState({});
    useEffect(() => {
        createImageObject();
    },[])

    const createImageObject = () =>{
        let src = props.src
        if (!!src.imageId || !!src.imageUUID) {
            setImageObj(ImageUtils.getImageFromImageModel(src)); //src.urlPrefix + '/' + src.imageId + '.jpg');
        } else {
            ImageUtils.getOrientation(props.src, (o9n => {
                setO9n(o9n);
                setImageObj(URL.createObjectURL(props.src))
            }))
        }
    }
    const onMouseEnterImageView = () => {
        if (props.isMain) return
        setIsSetMainCoverShow(true)
    }
    const onMouseLeaveImageView = () => {
        setIsSetMainCoverShow(false)
    }
    return (
        <div className={'image-view image-widget__image-item ' + (props.isMain ? 'image-widget__image-item--main' : '')}
             onMouseEnter={onMouseEnterImageView}
             onMouseLeave={onMouseLeaveImageView}>
            <a className="image-widget__btn-remove" onClick={() => { props.onRemoveCallback(props.arrIndex) }}>
                <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
            </a>
            <img className={"photo " + 'photo--o9n-' + o9n} width="137px" height="137px" src={imageObj ? imageObj : undefined} />
            <div hidden={!props.isMain} className="image-widget__main-cover">
                <Trans i18nKey="component.service.addNew.imageView.mainPhoto">Main photo</Trans>
            </div>
            <div className="image-widget__set-main-cover" hidden={!isSetMainCoverShow}>
                <UikButton transparent className="image-widget__btn-set-main" onClick={() => props.onSelectCallback(props.arrIndex)}>
                    <Trans i18nKey="component.service.addNew.imageView.setMain">Set Main</Trans>
                </UikButton>
            </div>
        </div>
    )
}
export default ServiceFormEditor;
