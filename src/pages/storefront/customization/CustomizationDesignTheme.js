/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import {Trans} from "react-i18next";
import './CustomizationDesignTheme.sass'
import i18next from "../../../config/i18n";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSButton from "../../../components/shared/GSButton/GSButton";
import ColorBackground from "../../../components/shared/ThemeComponent/ColorBackground/ColorBackground";
import ThemeLogoAndFavicon from "../../../components/shared/ThemeComponent/LogoAndFavicon/ThemeLogoAndFavicon";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import beehiveService from "../../../services/BeehiveService";
import ThemeComponent from "../../../components/shared/ThemeComponent/ThemeComponent";
import {ThemeService} from "../../../services/ThemeService";
import {GSToast} from "../../../utils/gs-toast";
import {AvForm} from 'availity-reactstrap-validation'
import storeService from "../../../services/StoreService";
import {CredentialUtils} from "../../../utils/credential";
import mediaService, {MediaServiceDomain} from "../../../services/MediaService";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../../../components/shared/Loading/Loading";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {cancelablePromise} from "../../../utils/promise";
import CustomizationThemeReview from "./ThemePreview/CustomizationThemeReview";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {TokenUtils} from "../../../utils/token";
import {ImageUtils} from "../../../utils/image";

export default class CustomizationDesignTheme extends React.Component {

    state = {
        isProcessing: false,
        navigation: [
            {title: i18next.t('component.storefront.customization'), link: NAV_PATH.customization},
            {title: i18next.t('component.storefront.customization.theme.title'), link: undefined}
        ],
        mobileConfig: null,
        lstComponent: [],
        themeId: 0,
        isValid: true,
        themeDetail: null,
        previewFocusOn: {
            order: null,
            platform: null,
            scroll: true
        }
    }

    constructor(props) {
        super(props);

        this.lstRef = []

        this.handleSelectColor = this.handleSelectColor.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.updateMobileConfig = this.updateMobileConfig.bind(this);
        this.uploadImageToServer = this.uploadImageToServer.bind(this);
        this.handleOnCancel = this.handleOnCancel.bind(this)
        this.onFocusPreview = this.onFocusPreview.bind(this);
        this.onClickComponentReview = this.onClickComponentReview.bind(this);
    }

    componentDidMount() {
        const themeId = this.props.themeId
        this.setState({themeId: themeId, isProcessing: true})

        // get theme detail
        this.componentList = ThemeService.getThemeDetailForEdit(themeId);
        this.themeDetail = ThemeService.getThemeDetail(themeId);

        this.pmFetch = cancelablePromise(Promise.all([this.componentList, this.themeDetail]));
        this.pmFetch.promise.then(res => {
            let themeDetail = res[1]
            themeDetail.commonFeature = JSON.parse(res[1].commonFeature)

            this.setState({lstComponent: res[0], isProcessing: false, themeDetail: themeDetail});
        }).catch(e => {
            this.setState({isProcessing: false})
            GSToast.commonError()
        })
    }

    componentWillUnmount() {
        if (this.pmFetch) this.pmFetch.cancel();
    }

    handleSelectColor(mobileConfig) {
        this.setState({
            mobileConfig: mobileConfig
        });
    }

    updateMobileConfig() {
        if (this.state.mobileConfig != null) {
            if (this.state.mobileConfig.id != null) {
                return beehiveService.updateMobileConfig(this.state.mobileConfig);
            } else {
                return beehiveService.createMobileConfig(this.state.mobileConfig);
            }
        }

        return undefined
    }

    async uploadImageToServer(lstImage) {
        let promiseArr = []

        for (let image of lstImage) {
            let domain;
            if (image.logoId === 'SHOP_LOGO') {
                domain = MediaServiceDomain.STORE_LOGO;
            } else if (image.logoId === 'APP_LOGO') {
                domain = MediaServiceDomain.APP_ICON;
            } else {
                domain = MediaServiceDomain.BANNER;
            }
            let uploadHandle = await mediaService.uploadFileWithDomain(image.file, domain)
            promiseArr.push(uploadHandle)
        }
        return promiseArr
    }

    handleOnCancel() {
        // cancel
        RouteUtils.linkTo(this.props, NAV_PATH.customization);
    }

    submitForm(e, value, f3) {

        // isprocessing
        this.setState({isProcessing: true, isValid: true})

        let newRef
        let hasError = false

        // validate logo component first
        newRef = this.refLogo.current ? this.refLogo.current : this.refLogo
        if (newRef.componentValidation() === false) {
            hasError = true
        }

        // validate theme component
        this.lstRef.forEach(ref => {
            newRef = ref.current ? ref.current : ref
            if (newRef.componentValidation() === false) {
                hasError = true
            }
        })

        // in case has error
        if (hasError === true) {
            this.setState({isProcessing: false, isValid: false}, () => {
                // to do scroll here
                document.getElementsByClassName('alert__wrapper')[0].scrollIntoView()
            })
            return
        }

        this.setState({isValid: true})

        //------------------------//
        // start to save theme
        //------------------------//

        // list of total data
        // [
        //    {logoId: "APP_LOGO", file}, // logo info
        //    {comId: , order: , indexGroup: , indexSchema: , file: } // image theme info
        // ]
        let lstTotalImage = []

        //------------------------//
        // get data of logo
        //------------------------//
        newRef = this.refLogo.current ? this.refLogo.current : this.refLogo
        let logoReturn = newRef.componentReturnData()
        let storeInfo = logoReturn.storeInfo
        let isUpdateLogo = logoReturn.lstFile.length > 0

        if (!isUpdateLogo) {
            // in case favicon, user can delete it
            if (!storeInfo.favicon || !storeInfo.favicon.imageId
                || !storeInfo.splashImage || !storeInfo.splashImage.imageId) {
                isUpdateLogo = true
            }
        }

        lstTotalImage = [...logoReturn.lstFile]

        //------------------------//
        // get data of theme component
        //------------------------//
        let lstComponent = [] // [{id: schema.id, value: schema.value}] // theme only
        this.lstRef.forEach(ref => {
            newRef = ref.current ? ref.current : ref
            let themeReturn = newRef.componentReturnData()

            if (themeReturn.lstFile) {
                lstTotalImage = [...lstTotalImage, ...themeReturn.lstFile]
            }
            lstComponent.push(themeReturn.data)
        })

        //------------------------//
        // processing
        //------------------------//
        this.uploadImageToServer(lstTotalImage).then(images => {
            images.forEach((image, index) => {

                // handle data
                let imageInfo = lstTotalImage[index]

                if (imageInfo.logoId && imageInfo.logoId === "APP_LOGO") {
                    // app logo
                    storeInfo.appLogo = {
                        imageId: image.imageId ? image.imageId : image.name,
                        urlPrefix: image.urlPrefix,
                        extension: image.extension
                    }

                } else if (imageInfo.logoId && imageInfo.logoId === "FAVICON") {
                    // favicon
                    storeInfo.favicon = {
                        imageId: image.imageId,
                        urlPrefix: image.urlPrefix
                    }

                } else if (imageInfo.logoId && imageInfo.logoId === "SHOP_LOGO") {
                    // shop logo
                    storeInfo.shopLogo = {
                        imageId: image.imageId ? image.imageId : image.name,
                        urlPrefix: image.urlPrefix,
                        extension: image.extension
                    }

                } else if (imageInfo.logoId && imageInfo.logoId === "LOADING_SCREEN") {
                    // loading screen
                    storeInfo.splashImage = {
                        imageId: image.imageId,
                        urlPrefix: image.urlPrefix
                    }
                } else {
                    let url = ImageUtils.getImageFromImageModel(image);
                    let comId = imageInfo.comId
                    let order = imageInfo.order
                    let indexGroup = imageInfo.indexGroup
                    let indexSchema = imageInfo.indexSchema

                    // theme component
                    let componentIndex = lstComponent.findIndex(com => com.id === comId && com.order === order)
                    let component = lstComponent[componentIndex]

                    // in case image for component
                    if (indexGroup === -1 && indexSchema === -1) {
                        component.component_image = url
                    } else {
                        component.schema[indexGroup][indexSchema].value = url
                    }
                    lstComponent[componentIndex] = component
                }
            })

            // promise all
            let allPromise = []

            // update theme
            let request = {
                id: this.state.themeId,
                gsComponents: lstComponent,
                status: "ACTIVE"
            }
            allPromise.push(ThemeService.saveTheme(request))

            // update logo
            if (isUpdateLogo) {
                allPromise.push(storeService.updateStorefrontInfo(
                    {
                        logos: {
                            id: storeInfo.id,
                            shoplogoImageId: storeInfo.shopLogo.imageId ? storeInfo.shopLogo.imageId : storeInfo.shopLogo.imageUUID,
                            shoplogoImageName: storeInfo.shopLogo.imageId ? storeInfo.shopLogo.imageId : storeInfo.shopLogo.imageUUID,
                            shoplogoImageExtension: storeInfo.shopLogo.extension,
                            shoplogoUrlPrefix: storeInfo.shopLogo.urlPrefix,
                            faviconImageId: storeInfo.favicon.imageId,
                            faviconUrlPrefix: storeInfo.favicon.urlPrefix,
                            applogoImageId: storeInfo.appLogo.imageId ? storeInfo.appLogo.imageId : storeInfo.appLogo.imageUUID,
                            applogoImageName: storeInfo.appLogo.imageId ? storeInfo.appLogo.imageId : storeInfo.appLogo.imageUUID,
                            applogoImageExtension: storeInfo.appLogo.extension,
                            applogoUrlPrefix: storeInfo.appLogo.urlPrefix,
                            splashImageId: storeInfo.splashImage.imageId,
                            splashUrlPrefix: storeInfo.splashImage.urlPrefix,
                            storeId: CredentialUtils.getStoreId()
                        },
                        id: CredentialUtils.getStoreId()
                    }
                ))
            }

            // update config mobile
            let updateConfig = this.updateMobileConfig()
            if (updateConfig) {
                allPromise.push(updateConfig)
            }

            // request to server
            Promise.all(allPromise).then(values => {
                // sucess
                this.setState({onRedirect: true, isProcessing: false}, () => {
                    RouteUtils.linkTo(this.props, NAV_PATH.customization);
                });

            }).catch(e => {
                this.setState({isProcessing: false})
                GSToast.commonError()
            })

        }).catch(e => {
            this.setState({isProcessing: false})
            GSToast.commonError()
        })
    }

    onFocusPreview(componentOrder, componentPlatform, scroll = true) {
        this.setState({
            previewFocusOn: {
                order: componentOrder,
                platform: componentPlatform,
                scroll: scroll
            }
        })
    }

    onClickComponentReview(componentOrder, componentPlatform) {
        const focusedComponent = document.getElementById('cpn_' + componentOrder)
        if (focusedComponent) {
            focusedComponent.scrollIntoView({block: "center", behavior: "smooth"})
        }
        this.onFocusPreview(componentOrder, componentPlatform, false)
    }


    render() {
        return (
            <div className="theme-component__editor">
                {
                this.state.themeDetail &&
                <GSContentContainer
                    confirmWhenRedirect
                    confirmWhen={!this.state.onRedirect}
                    className="theme-component__left-wrapper gs-atm__scrollbar-1">
                    {
                        this.state.isProcessing &&
                        <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}/>
                    }

                    <GSContentHeader className="info-container__title"
                                     title={i18next.t("component.storefront.customization.theme.title.with.name", {x: this.state.themeDetail.name})}
                                     navigation={this.state.navigation}
                                     size={GSContentBody.size.LARGE}>
                        <GSContentHeaderRightEl className="right-group__button">
                            {/*BTN SAVE*/}
                            <GSButton
                                success
                                className="btn-save-design"
                                onClick={() => this.refBtnSubmitForm.click()}
                                disabled={this.state.disableSaveBtn}
                            >
                                <Trans i18nKey="component.theme.form.button.publish">Publish</Trans>
                            </GSButton>
                            {/*BTN CANCEL*/}
                            <GSButton secondary outline marginLeft
                                      onClick={this.handleOnCancel}>
                                <Trans i18nKey="common.btn.cancel">
                                    Cancel
                                </Trans>
                            </GSButton>
                        </GSContentHeaderRightEl>
                    </GSContentHeader>

                    <GSContentBody size={GSContentBody.size.LARGE}>
                        <AvForm onSubmit={this.submitForm}>

                            <button type="submit" ref={(el) => this.refBtnSubmitForm = el} hidden/>

                            {!this.state.isValid &&
                            <div className="alert alert-danger product-form__alert product-form__alert--error"
                                 role="alert">
                                <Trans i18nKey="component.product.edit.invalidate"/>
                            </div>
                            }

         
                            <PrivateComponent 
                                wrapperDisplay={"block"} 
                                hasAnyPackageFeature={this.state.themeDetail.commonFeature.color}
                            >
                                <ColorBackground 
                                    onChange={this.handleSelectColor} 
                                    isShowMore={true}/>
                            </PrivateComponent>
                       
                            
                            <PrivateComponent 
                                wrapperDisplay={"block"} 
                                hasAnyPackageFeature={this.state.themeDetail.commonFeature.logoFavicon}
                            >
                                <ThemeLogoAndFavicon 
                                    ref={(el) => this.refLogo = el} 
                                    features={this.state.themeDetail.commonFeature}/>
                            </PrivateComponent>
                            {
                                this.state.lstComponent.map((com, index) => {
                                    return (
                                        <div key={index + ' ' + com.order}
                                             id={"cpn_" + com.order}
                                             className={["theme-cpn", this.state.previewFocusOn.order === com.order ? 'active' : ''].join(' ')}

                                        >
                                            <PrivateComponent 
                                                wrapperDisplay={"block"} 
                                                hasAnyPackageFeature={com.feature_code_list}
                                            >
                                                <ThemeComponent
                                                    ref={(el) => this.lstRef[index] = el}
                                                    data={com}
                                                    componentIndex={index}
                                                    // onWebClick={() => this.onFocusPreview(com.order, 'WEB')}
                                                    // onAppClick={() => this.onFocusPreview(com.order, 'APP')}
                                                    onClick={() => this.onFocusPreview(com.order, com.platForm)}
                                                    itemType={this.state.themeDetail.itemType}
                                                    hasFeature={
                                                        (com.feature_code_list && com.feature_code_list.length > 0)
                                                        ? TokenUtils.hasAnyPackageFeatures(com.feature_code_list)
                                                        : false
                                                    }
                                                />
                                            </PrivateComponent>
                                        </div>

                                    );
                                })
                            }
                        </AvForm>


                    </GSContentBody>

                </GSContentContainer>}
                <CustomizationThemeReview className="theme-component__right-wrapper d-desktop-flex d-mobile-none"
                                          lstComponent={this.state.lstComponent}
                                          focusOn={this.state.previewFocusOn}
                                          onClickComponent={this.onClickComponentReview}
                />
                
            </div>
        )
    }

}

