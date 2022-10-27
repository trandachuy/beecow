import React, {useContext, useEffect, useState} from 'react';
import './GeneralSetting.sass'
import {UikToggle} from "../../../../@uik";
import {ThemeMakingContext} from "../context/ThemeMakingContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Trans} from "react-i18next";
import ImageUploader, {ImageUploadType} from "../../../../components/shared/form/ImageUploader/ImageUploader";
import {ImageUtils} from "../../../../utils/image";
import storeService from "../../../../services/StoreService";
import beehiveService from "../../../../services/BeehiveService";
import colorService from "../../../../services/ColorService";
import _ from 'lodash';
import {StoreLogoModel} from "../../../../components/shared/model/StoreLogoModel";
import authenticate from "../../../../services/authenticate";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import i18next from "../../../../../src/config/i18n";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {FormGroup} from 'reactstrap';
import {CredentialUtils} from "../../../../utils/credential";
import mediaService, {MediaServiceDomain} from "../../../../services/MediaService";
import {GSToast} from '../../../../utils/gs-toast';
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import PrivateComponent from "../../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";
import GSTooltip from '../../../../components/shared/GSTooltip/GSTooltip';
import AvCustomCheckbox from '../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox'
import Constants from '../../../../config/Constant'

const BUNDLE_ID_PREFIX = "com.mediastep."
const IMAGE_MAX_SIZE_BY_MB = 10
const IMAGE_TYPE = {
    LOGO : "logo",
    FAVICON : "favicon",
    APP_LOGO : "app_logo",
    SPLASH : "splash"
}
const COLOR_TYPE = {
    PRIMARY_COLOR: "primary_color",
    SECONDARY_COLOR: "secondary_color"
}
const GeneralSetting = (props, ref) => {
    const { state, dispatch } = useContext(ThemeMakingContext.context);

    // image of logo - favicon - app logo - splash image
    const [getLogoModel, setLogoModel] = useState({data: undefined, file: undefined, isExist : false, required : true, hasChange: false});
    const [getFaviconModel, setFaviconModel] = useState({data: undefined, file: undefined, isExist : false, required : false, hasChange: false});
    const [getAppLogoModel, setAppLogoModel] = useState({data: undefined, file: undefined, isExist : false, required : false, hasChange: false});
    const [getSplashModel, setSplashModel] = useState({data: undefined, file: undefined, isExist : false, required : false, hasChange: false});
    // font list default
    const [getListFontModel, setListFontModel] = useState(Constants.FONTS);
    // store info
    const [getStoreModel, setStoreModel] = useState(undefined);
    // mobile config info
    const [getMobileConfigModel, setMobileConfigModel] = useState({
        id: null,
        shopName: null,
        colorPrimary: null,
        colorSecondary: null,
        fontFamily: null,
        shopId: CredentialUtils.getStoreId(),
        bundleId: "com.mediastep." + CredentialUtils.getStoreId(),
        phoneNumber: "",
        enableCallIcon: false,
        stickyHeaderWebsite: false,
        stickyHeaderApplication: false,
    });
    // loading
    const [getLoading, setLoading] = useState(false);

    //-----------------------------------//
    useEffect(() => {
        setLoading(true);
        //-----------------------------------//
        // image of logo - favicon - app logo - splash image
        //-----------------------------------//
        storeService.getLogos().then(storeInfo => {
            // image setting
            const {appLogo, favicon, shopLogo, splashImage} = storeInfo;
            // for logo
            setLogoModel({
                ...getLogoModel,
                data: shopLogo.urlPrefix ? new StoreLogoModel(shopLogo) : {},
                isExist: shopLogo.urlPrefix ? true : false
            });
            if(shopLogo.urlPrefix){
                const url = ImageUtils.getImageFromImageModel(shopLogo);
                dispatch(ThemeMakingContext.actions.changeShopLogo(url));
            }
            // for favicon
            setFaviconModel({
                ...getFaviconModel,
                data: favicon.urlPrefix ? new StoreLogoModel(favicon) : {},
                isExist: favicon.urlPrefix ? true : false
            });
            // for app logo
            setAppLogoModel({
                ...getAppLogoModel,
                data: appLogo.urlPrefix ? new StoreLogoModel(appLogo) : {},
                isExist: appLogo.urlPrefix ? true : false
            });
            // for splash image
            setSplashModel({
                ...getSplashModel,
                data: splashImage.urlPrefix ? new StoreLogoModel(splashImage) : {},
                isExist: splashImage.urlPrefix ? true : false
            });
            // store mode
            setStoreModel(storeInfo);
        }).catch(error => {});
        //-----------------------------------//
        // color and font
        //-----------------------------------//
        beehiveService.getMobileConfig(authenticate.getStoreId()).then(mobileConfigRes => {
            if (!_.isEmpty(mobileConfigRes)) {
                // set up the mobile config color before
                setMobileConfigModel(mobileConfigRes);
                dispatch(ThemeMakingContext.actions.changeShopColorPrimary(mobileConfigRes.colorPrimary));
                dispatch(ThemeMakingContext.actions.changeShopColorSecondary(mobileConfigRes.colorSecondary));
                dispatch(ThemeMakingContext.actions.changeShopFont(mobileConfigRes.fontFamily));
                dispatch(ThemeMakingContext.actions.toggleCallIcon(mobileConfigRes.enableCallIcon));
                dispatch(ThemeMakingContext.actions.setPhoneNumber(mobileConfigRes.phoneNumber));
                dispatch(ThemeMakingContext.actions.toggleStickyHeaderWebsite(mobileConfigRes.stickyHeaderWebsite));
                dispatch(ThemeMakingContext.actions.toggleStickyHeaderApplication(mobileConfigRes.stickyHeaderApplication));
            } else {
                // not set up the mobile config color before
                colorService.getColors({}).then(colors => {
                    const defaultColor = colors[0];
                    let mobileConfigDefault = {
                        id: null,
                        shopName: null,
                        colorPrimary: defaultColor.primary,
                        colorSecondary: defaultColor.secondary,
                        shopId: authenticate.getStoreId(),
                        bundleId: BUNDLE_ID_PREFIX + authenticate.getStoreId(),
                        fontFamily: "",
                        phoneNumber: "",
                        enableCallIcon: false,
                        stickyHeaderWebsite: false,
                        stickyHeaderApplication: false,
                    };
                    setMobileConfigModel(mobileConfigDefault);
                    dispatch(ThemeMakingContext.actions.changeShopColorPrimary(mobileConfigDefault.colorPrimary));
                    dispatch(ThemeMakingContext.actions.changeShopColorSecondary(mobileConfigDefault.colorSecondary));
                    dispatch(ThemeMakingContext.actions.changeShopFont(mobileConfigDefault.fontFamily));
                    dispatch(ThemeMakingContext.actions.toggleCallIcon(mobileConfigDefault.enableCallIcon));
                    dispatch(ThemeMakingContext.actions.setPhoneNumber(mobileConfigDefault.phoneNumber));
                    dispatch(ThemeMakingContext.actions.toggleStickyHeaderWebsite(mobileConfigRes.stickyHeaderWebsite));
                    dispatch(ThemeMakingContext.actions.toggleStickyHeaderApplication(mobileConfigRes.stickyHeaderApplication));
                }).catch(error => {setLoading(false);});
            }
            setLoading(false);
        }).catch(error => {setLoading(false);});
    }, []);
    const onImageUploaded = (files, imageType) => {
        switch (imageType) {
            case IMAGE_TYPE.LOGO:
                setLogoModel({...getLogoModel, data: {}, file: files[0], isExist: true, hasChange: true})
                const url = URL.createObjectURL(files[0]);
                dispatch(ThemeMakingContext.actions.changeShopLogo(url));
                break;

            case IMAGE_TYPE.FAVICON:
                setFaviconModel({...getFaviconModel, data: {}, file: files[0], isExist: true, hasChange: true})
                break;
            case IMAGE_TYPE.APP_LOGO:
                setAppLogoModel({...getAppLogoModel, data: {}, file: files[0], isExist: true, hasChange: true})
                break;
            case IMAGE_TYPE.SPLASH:
                setSplashModel({...getSplashModel, data: {}, file: files[0], isExist: true, hasChange: true})
                break;
            default:
                break;
        }
    }
    const onRemoveImage = (imageType) => {
        switch (imageType) {
            case IMAGE_TYPE.LOGO:
                setLogoModel({...getLogoModel, data: {}, file: undefined, isExist: false, hasChange: true})
                // change the image of header and footer
                break;

            case IMAGE_TYPE.FAVICON:
                setFaviconModel({...getFaviconModel, data: {}, file: undefined, isExist: false, hasChange: true})
                break;
            case IMAGE_TYPE.APP_LOGO:
                setAppLogoModel({...getAppLogoModel, data: {}, file: undefined, isExist: false, hasChange: true})
                break;
            case IMAGE_TYPE.SPLASH:
                setSplashModel({...getSplashModel, data: {}, file: undefined, isExist: false, hasChange: true})
                break;
            default:
                break;
        }
    }
    const onFontChange = (value) => {
        setMobileConfigModel({
            ...getMobileConfigModel,
            fontFamily: value
        });
        dispatch(ThemeMakingContext.actions.changeShopFont(value));
    }
    const onColorChange = (e, colorType) => {
        const { value } = e.currentTarget;
        const color = value.replace('#', '');
        if(colorType === COLOR_TYPE.PRIMARY_COLOR){
            setMobileConfigModel({...getMobileConfigModel, colorPrimary: color});
            dispatch(ThemeMakingContext.actions.changeShopColorPrimary(color));
        }else{
            setMobileConfigModel({...getMobileConfigModel, colorSecondary: color});
            dispatch(ThemeMakingContext.actions.changeShopColorSecondary(color));
        }
    }
    const onChangeCallButton = () => {
        const isShowIcon = !getMobileConfigModel.enableCallIcon;
        setMobileConfigModel({
            ...getMobileConfigModel,
            enableCallIcon: isShowIcon
        });
        dispatch(ThemeMakingContext.actions.toggleCallIcon(isShowIcon));
    }
    const onChangePhoneNumber = (value) => {
        setMobileConfigModel({
            ...getMobileConfigModel,
            phoneNumber: value
        });
        dispatch(ThemeMakingContext.actions.setPhoneNumber(value));
    }
    const handleToggleStickyHeaderWebsite = (toggle) => {
        setMobileConfigModel({
            ...getMobileConfigModel,
            stickyHeaderWebsite: toggle
        });
        dispatch(ThemeMakingContext.actions.toggleStickyHeaderWebsite(toggle));
    }
    const handleToggleStickyHeaderApplication = (toggle) => {
        setMobileConfigModel({
            ...getMobileConfigModel,
            stickyHeaderApplication: toggle
        });
        dispatch(ThemeMakingContext.actions.toggleStickyHeaderApplication(toggle));
    }
    const uploadImageToServer = async (lstImage) => {
        let promiseArr = []
        for (let image of lstImage) {
            let domain;
            if (image.name === IMAGE_TYPE.LOGO) {
                domain = MediaServiceDomain.STORE_LOGO;
            } else if (image.name === IMAGE_TYPE.APP_LOGO) {
                domain = MediaServiceDomain.APP_ICON;
            } else {
                domain = MediaServiceDomain.BANNER;
            }
            let uploadHandle = await mediaService.uploadFileWithDomain(image.file, domain)
            promiseArr.push(uploadHandle)
        }
        return promiseArr
    }
    const updateMobileConfig = () => {
        if (getMobileConfigModel != null) {
            if (getMobileConfigModel.id != null) {
                return beehiveService.updateMobileConfig(getMobileConfigModel);
            } else {
                return beehiveService.createMobileConfig(getMobileConfigModel);
            }
        }
        return undefined
    }
    const validateSetting = () => {
        if(getMobileConfigModel.enableCallIcon === true &&
            _.isEmpty(getMobileConfigModel.phoneNumber)) {
            //i18next.t("widget.phonenumber.validate.invalid",{phone: getMobileConfigModel.phoneNumber, min: 9, max: 20});
            GSToast.error("widget.phonenumber.validate.invalid", true);
            return false;
        }
        return true;
    }
    const saveGeneralSetting = (e) => {
        const isValid = validateSetting();
        if(isValid === false) return;
        setLoading(true);
        // validate requrid of the shop logo
        if(!getLogoModel.isExist){
            setLoading(false);
            return;
        }
        // only update store info if has changge
        let lstTotalImage = [];
        let hasUpdateImage = false;
        if(getLogoModel.hasChange){
            hasUpdateImage = true;
            if(getLogoModel.isExist && getLogoModel.file){
                lstTotalImage.push({file: getLogoModel.file, name: IMAGE_TYPE.LOGO});
            }
        }

        if(getFaviconModel.hasChange){
            hasUpdateImage = true;
            if(getFaviconModel.isExist && getFaviconModel.file){
                lstTotalImage.push({file: getFaviconModel.file, name: IMAGE_TYPE.FAVICON});
            }
        }
        if(getAppLogoModel.hasChange){
            hasUpdateImage = true;
            if(getAppLogoModel.isExist && getAppLogoModel.file){
                lstTotalImage.push({file: getAppLogoModel.file, name: IMAGE_TYPE.APP_LOGO});
            }
        }
        if(getSplashModel.hasChange){
            hasUpdateImage = true;
            if(getSplashModel.isExist && getSplashModel.file){
                lstTotalImage.push({file: getSplashModel.file, name: IMAGE_TYPE.SPLASH});
            }
        }
        let logoObject = getLogoModel.data;
        let faviconObject = getFaviconModel.data;
        let applogoObject = getAppLogoModel.data;
        let splashObject = getSplashModel.data;
        uploadImageToServer(lstTotalImage).then(images => {
            images.forEach((image, index) => {
                let imageInfo = lstTotalImage[index];
                if(imageInfo.name === IMAGE_TYPE.LOGO){
                    const data = {
                        imageId: image.imageId ? image.imageId : image.name,
                        urlPrefix: image.urlPrefix,
                        extension: image.extension
                    };
                    setLogoModel({
                        ...getLogoModel,
                        data: data
                    });
                    logoObject = data;
                }else if(imageInfo.name === IMAGE_TYPE.APP_LOGO){
                    const data = {
                        imageId: image.imageId ? image.imageId : image.name,
                        urlPrefix: image.urlPrefix,
                        extension: image.extension
                    };
                    setAppLogoModel({
                        ...getAppLogoModel,
                        data: data
                    });
                    applogoObject = data;
                }else if(imageInfo.name === IMAGE_TYPE.FAVICON){

                    const data = {
                        imageId: image.imageId ? image.imageId : image.imageUUID,
                        urlPrefix: image.urlPrefix,
                        extension: image.extension
                    };
                    setFaviconModel({
                        ...getFaviconModel,
                        data: data
                    });
                    faviconObject = data;
                }else if(imageInfo.name === IMAGE_TYPE.SPLASH){
                    const data = {
                        imageId: image.imageId ? image.imageId : image.imageUUID,
                        urlPrefix: image.urlPrefix,
                        extension: image.extension
                    };
                    setSplashModel({
                        ...getSplashModel,
                        data: data
                    });
                    splashObject = data;
                }
            });
            // promise all
            let allPromise = [];
            // update logo
            if(hasUpdateImage){
                let storeUpdate = {
                    logos: {
                        id: getStoreModel.id,
                        shoplogoImageId: logoObject.imageId ? logoObject.imageId : logoObject.imageUUID,
                        shoplogoImageName: logoObject.imageId ? logoObject.imageId : logoObject.imageUUID,
                        shoplogoImageExtension: logoObject.extension,
                        shoplogoUrlPrefix: logoObject.urlPrefix,
                        faviconImageId: faviconObject.imageId ? faviconObject.imageId : faviconObject.imageUUID,
                        faviconImageName: faviconObject.imageId ? faviconObject.imageId : faviconObject.imageUUID,
                        faviconImageExtension: faviconObject.extension,
                        faviconUrlPrefix: faviconObject.urlPrefix,
                        applogoImageId: applogoObject.imageId ? applogoObject.imageId : applogoObject.imageUUID,
                        applogoImageName: applogoObject.imageId ? applogoObject.imageId : applogoObject.imageUUID,
                        applogoImageExtension: applogoObject.extension,
                        applogoUrlPrefix: applogoObject.urlPrefix,
                        splashImageId: splashObject.imageId? splashObject.imageId:splashObject.imageUUID,
                        splashImageName: splashObject.imageId? splashObject.imageId:splashObject.imageUUID,
                        splashImageExtension: splashObject.extension,
                        splashUrlPrefix: splashObject.urlPrefix,
                        storeId: CredentialUtils.getStoreId()
                    },
                    id: CredentialUtils.getStoreId()
                }
                allPromise.push(storeService.updateStorefrontInfo(storeUpdate));
            }

            // update config mobile
            let updateConfig = updateMobileConfig();
            if (updateConfig) {
                allPromise.push(updateConfig);
            }
            // request to server
            Promise.all(allPromise).then(values => {
                setLoading(false);
                GSToast.commonUpdate();
            }).catch(e => {
                setLoading(false);
                GSToast.commonError()
            })
        }).catch(error => {
            setLoading(false);
            GSToast.commonError();
        });
    }
    return (
        <div className="general-setting">
            <section className="all-setting">
                <div className="title-element label-pdl">
                    <GSTrans t='page.themeEngine.generalSetting.title'>GENERAL SETTINGS</GSTrans>
                </div>
                <div className='general-setting__scroll gs-atm__scrollbar-1'>
                    {
                        getLoading &&
                        <LoadingScreen/>
                    }
                    {/* LOGO SETTING */}
                    <div className="setting-element">
                        <div className="element-header label-pdl">
                            <span><GSTrans t='page.themeEngine.generalSetting.logo.title'></GSTrans></span>
                        </div>
                        <div className="image-setting">
                            <div className="image-widget__container">
                                {
                                    getLogoModel.isExist &&
                                    <ImageView
                                        key={IMAGE_TYPE.LOGO}
                                        src={getLogoModel}
                                        onRemoveCallback={(imageType) => onRemoveImage(imageType)}
                                        imageType={IMAGE_TYPE.LOGO}/>
                                }

                                <span className="image-widget__image-item image-widget__image-item--no-border" hidden={getLogoModel.isExist}>
                                <ImageUploader
                                    accept={[ImageUploadType.JPEG, ImageUploadType.PNG, ImageUploadType.GIF]}
                                    multiple={false}
                                    text="Add photo"
                                    maximumFileSizeByMB={IMAGE_MAX_SIZE_BY_MB}
                                    onChangeCallback={(files) => onImageUploaded(files, IMAGE_TYPE.LOGO)} />
                            </span>
                                <FontAwesomeIcon icon={"upload"}/>
                                <span className="image-upload-description"><GSTrans t='page.themeEngine.generalSetting.logo.upload'></GSTrans></span>
                                <span className="image-description"><GSTrans t='page.themeEngine.generalSetting.logo.suggestion'></GSTrans></span>
                                {
                                    !getLogoModel.isExist &&
                                    <AlertInline
                                        type={AlertInlineType.ERROR}
                                        nonIcon
                                        text={i18next.t('common.validation.required')}/>
                                }
                            </div>
                        </div>
                    </div>
                    {/* FAVICON SETTING */}
                    <div className="setting-element">
                        <div className="element-header label-pdl">
                            <span><GSTrans t='page.themeEngine.generalSetting.favicon.title'></GSTrans></span>
                        </div>
                        <div className="image-setting">
                            <div className="image-widget__container">
                                {
                                    getFaviconModel.isExist &&
                                    <ImageView
                                        key={IMAGE_TYPE.FAVICON}
                                        src={getFaviconModel}
                                        onRemoveCallback={(imageType) => onRemoveImage(imageType)}
                                        imageType={IMAGE_TYPE.FAVICON}/>
                                }

                                <span className="image-widget__image-item image-widget__image-item--no-border" hidden={getFaviconModel.isExist}>
                                <ImageUploader
                                    accept={[ImageUploadType.JPEG, ImageUploadType.PNG,ImageUploadType.GIF]}
                                    multiple={false}
                                    text="Add photo"
                                    maximumFileSizeByMB={IMAGE_MAX_SIZE_BY_MB}
                                    onChangeCallback={(files) => onImageUploaded(files, IMAGE_TYPE.FAVICON)} />
                            </span>
                                <FontAwesomeIcon icon={"upload"}/>
                                <span className="image-upload-description"><GSTrans t='page.themeEngine.generalSetting.favicon.upload'></GSTrans></span>
                                <span className="image-description"><GSTrans t='page.themeEngine.generalSetting.favicon.suggestion'></GSTrans></span>
                            </div>
                        </div>
                    </div>
                    {/* APP LOGO SETTING */}
                    <div className="setting-element">
                        <div className="element-header label-pdl">
                            <span><GSTrans t='page.themeEngine.generalSetting.applogo.title'></GSTrans></span>
                        </div>
                        <PrivateComponent wrapperDisplay={"block"} hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}>
                            <div className="image-setting">
                                <div className="image-widget__container">
                                    {
                                        getAppLogoModel.isExist &&
                                        <ImageView
                                            key={IMAGE_TYPE.APP_LOGO}
                                            src={getAppLogoModel}
                                            onRemoveCallback={(imageType) => onRemoveImage(imageType)}
                                            imageType={IMAGE_TYPE.APP_LOGO}/>
                                    }

                                    <span className="image-widget__image-item image-widget__image-item--no-border" hidden={getAppLogoModel.isExist}>
                                <ImageUploader
                                    accept={[ImageUploadType.JPEG, ImageUploadType.PNG, ImageUploadType.GIF]}
                                    multiple={false}
                                    text="Add photo"
                                    maximumFileSizeByMB={IMAGE_MAX_SIZE_BY_MB}
                                    onChangeCallback={(files) => onImageUploaded(files, IMAGE_TYPE.APP_LOGO)} />
                            </span>
                                    <FontAwesomeIcon icon={"upload"}/>
                                    <span className="image-upload-description"><GSTrans t='page.themeEngine.generalSetting.applogo.upload'></GSTrans></span>
                                    <span className="image-description"><GSTrans t='page.themeEngine.generalSetting.applogo.suggestion'></GSTrans></span>
                                </div>
                            </div>
                        </PrivateComponent>
                    </div>

                    {/* SPLASH SETTING */}
                    <div className="setting-element">
                        <div className="element-header label-pdl">
                            <span><GSTrans t='page.themeEngine.generalSetting.splash.title'></GSTrans></span>
                        </div>
                        <div className="image-setting">
                            <div className="image-widget__container">
                                {
                                    getSplashModel.isExist &&
                                    <ImageView
                                        key={IMAGE_TYPE.SPLASH}
                                        src={getSplashModel}
                                        onRemoveCallback={(imageType) => onRemoveImage(imageType)}
                                        imageType={IMAGE_TYPE.SPLASH}/>
                                }

                                <span className="image-widget__image-item image-widget__image-item--no-border" hidden={getSplashModel.isExist}>
                                <ImageUploader
                                    accept={[ImageUploadType.JPEG, ImageUploadType.PNG, ImageUploadType.GIF]}
                                    multiple={false}
                                    text="Add photo"
                                    maximumFileSizeByMB={IMAGE_MAX_SIZE_BY_MB}
                                    onChangeCallback={(files) => onImageUploaded(files, IMAGE_TYPE.SPLASH)} />
                            </span>
                                <FontAwesomeIcon icon={"upload"}/>
                                <span className="image-upload-description"><GSTrans t='page.themeEngine.generalSetting.splash.upload'></GSTrans></span>
                                <span className="image-description"><GSTrans t='page.themeEngine.generalSetting.splash.suggestion'></GSTrans></span>
                            </div>
                        </div>
                    </div>
                    {/* FONT SETTING */}
                    <div className="setting-element">
                        <div className="element-header label-pdl">
                            <span><GSTrans t='page.themeEngine.generalSetting.font.title'></GSTrans></span>
                        </div>
                        <div className="font-setting">
                            <div>
                                <AvForm>
                                    <FormGroup>
                                        <AvField
                                            className="input-field__hint"
                                            type="select"
                                            name="pickupMenu"
                                            value={getMobileConfigModel.fontFamily || 'Roboto'}
                                            onChange={(e) => onFontChange(e.target.value)}
                                        >
                                            {
                                                getListFontModel.map((x, index) => {
                                                    return (<option
                                                        style={{fontFamily: x.value}}
                                                        value={x.value}
                                                        key={'menu' + x.value}
                                                        defaultValue={getMobileConfigModel.fontFamily}>
                                                        {x.label}
                                                    </option>);
                                                })
                                            }
                                        </AvField>
                                    </FormGroup>
                                </AvForm>
                            </div>
                        </div>
                    </div>
                    {/* COLOR SETTING */}
                    <div className="setting-element">
                        <div className="element-header label-pdl">
                            <span><GSTrans t='page.themeEngine.generalSetting.color.title'></GSTrans></span>
                        </div>
                        <div className="color-setting">
                            <div className="color-setting-el">
                                <div className="title"><GSTrans t='page.themeEngine.generalSetting.color.primary'></GSTrans></div>
                                <div className="color">
                                    <input
                                        type="color"
                                        value={'#' + getMobileConfigModel.colorPrimary}
                                        name="primary-color"
                                        onChange={(value) => onColorChange(value, COLOR_TYPE.PRIMARY_COLOR)} />
                                </div>
                            </div>
                            <div className="color-setting-el">
                                <div className="title"><GSTrans t='page.themeEngine.generalSetting.color.secondary'></GSTrans></div>
                                <div className="color">
                                    <input
                                        type="color"
                                        name="secondary-color"
                                        value={'#' + getMobileConfigModel.colorSecondary}
                                        onChange={(value) => onColorChange(value, COLOR_TYPE.SECONDARY_COLOR)} />
                                </div>
                            </div>
                        </div>
                        {/* WIDGET SETTING */}
                        <div className="setting-element">
                            <div className="element-header label-pdl">
                                <span>
                                    <GSTrans t='page.themeEngine.generalSetting.widget.title'></GSTrans>
                                    <GSTooltip message={i18next.t('page.themeEngine.generalSetting.widget.tooltip')}/>
                                </span>
                            </div>
                            <div className="widget-setting">
                                <div className="widget-setting-el">
                                    <div className="title"><GSTrans t='page.themeEngine.generalSetting.widget.callbutton'></GSTrans></div>
                                    <div className="widget">
                                        <PrivateComponent>
                                            <div onClick={() => {
                                                onChangeCallButton()
                                            }}>
                                                <UikToggle
                                                    defaultChecked={state.enableCallIcon}
                                                    className="m-0 p-0"
                                                    key={state.enableCallIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                />
                                            </div>
                                        </PrivateComponent>
                                    </div>
                                </div>
                                <div className="widget-setting-el">
                                    <div className="title"><GSTrans t='page.themeEngine.generalSetting.widget.phonenumber'></GSTrans></div>
                                    <div className="widget">
                                    <AvForm>
                                        <FormGroup>
                                            <AvField
                                                name="setting-phoneNumber"
                                                value={state.phoneNumber}
                                                validate={{
                                                    maxLength: {
                                                        value: 20,
                                                        errorMessage: i18next.t('common.validation.char.max.length', {x: 20})
                                                    }
                                                }}
                                                onChange={(e) => onChangePhoneNumber(e.target.value)}
                                            />
                                        </FormGroup>
                                    </AvForm>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="setting-element">
                            <div className="element-header label-pdl">
                                <span>
                                    <GSTrans t='page.themeEngine.generalSetting.widget.stickyHeader'></GSTrans>
                                    <GSTooltip message={i18next.t('page.themeEngine.generalSetting.widget.stickyHeader.tooltip')}/>
                                </span>
                            </div>
                            <div className="widget-setting">
                                <AvForm>
                                    <div className="widget-setting-el">
                                        <AvCustomCheckbox
                                            key={ state.stickyHeaderWebsite }
                                            name="stickyHeaderWebsite"
                                            value={ state.stickyHeaderWebsite }
                                            label="Website"
                                            onChange={ e => handleToggleStickyHeaderWebsite(e.currentTarget.value) }
                                        />
                                    </div>
                                    <div className="widget-setting-el">
                                        <AvCustomCheckbox
                                            key={ state.stickyHeaderApplication }
                                            name="stickyHeaderApplication"
                                            value={ state.stickyHeaderApplication }
                                            label={ i18next.t('page.themeEngine.generalSetting.widget.stickyHeader.application') }
                                            onChange={ e => handleToggleStickyHeaderApplication(e.currentTarget.value) }
                                        />
                                    </div>
                                </AvForm>
                            </div>
                        </div>
                        {/*BTN SAVE*/}
                        <div style={{display: "flex", justifyContent: "flex-end", paddingRight: "15px", paddingBottom: "20px"}}>
                            <GSButton success className="btn-save"
                                      onClick={(e) => saveGeneralSetting(e)}>

                                <Trans i18nKey='common.btn.save' className="sr-only">
                                    Save
                                </Trans>
                            </GSButton>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
};
class ImageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            o9n: 1,
            imageObj: null
        }
        this.createImageObject = this.createImageObject.bind(this)
        this.onRemoveCallback = this.props.onRemoveCallback
    }
    componentDidMount() {
        this.createImageObject()
    }
    createImageObject() {
        let src = this.props.src
        if(src.isExist){
            if (src.data && src.data.urlPrefix) {
                this.setState({
                    imageObj : ImageUtils.getImageFromImageModel(src.data)
                })
            } else {
                ImageUtils.getOrientation(src.file, (o9n => {
                    this.setState({
                        o9n: o9n,
                        imageObj: URL.createObjectURL(src.file)
                    })
                }))
            }
        }
    }
    render() {
        return (
            <div className={'image-view image-widget__image-item'}>
                <a className="image-widget__btn-remove" onClick={() => { this.onRemoveCallback(this.props.imageType) }}>
                    <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                </a>
                <img className={"photo " + 'photo--o9n-' + this.state.o9n}
                     width="137px"
                     height="137px"
                     src={this.state.imageObj} />
            </div>
        )
    }
}
export default React.forwardRef(GeneralSetting);
