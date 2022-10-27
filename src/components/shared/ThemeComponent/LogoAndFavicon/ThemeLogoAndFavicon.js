/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import GSWidget from "../../form/GSWidget/GSWidget";
import GSWidgetHeader from "../../form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../form/GSWidget/GSWidgetContent";
import './../CollapsedWidget.sass'
import PagingTable, {PagingTableAlign} from "../../table/PagingTable/PagingTable";
import storeService from "../../../../services/StoreService";
import {cancelablePromise} from "../../../../utils/promise";
import ThemeLogoUploaderItem from "../shared/ThemeLogoUploaderItem/ThemeLogoUploaderItem";
import {StoreLogoModel} from "../../model/StoreLogoModel";
import i18next from "i18next";
import PrivateComponent from "../../../shared/PrivateComponent/PrivateComponent";
import {TokenUtils} from "../../../../utils/token";

/*
* PROPS
*
* 2. callBackFunction(
*       type : name of image - from props
*       file : return file for parent
*       logo : StoreLogoModel return object for parent
*    )
*
*/
export default class ThemeLogoAndFavicon extends React.Component {

    ImageType = {
        APP_LOGO: "APP_LOGO",
        FAVICON: "FAVICON",
        SHOP_LOGO: "SHOP_LOGO",
        LOADING_SCREEN: "LOADING_SCREEN"
    }

    state = {
        isShowMore: false,
        title: 'Logo & Favicon',
        storeInfo: undefined,
        logos: {
            appLogo: undefined,
            favicon: undefined,
            shopLogo: undefined,
            splashImage: undefined
        },
        appLogo: undefined,
        favicon: undefined,
        shopLogo: undefined,
        splashImage: undefined
    }

    constructor(props) {
        super(props);

        this.lstRef = []

        this.toggleShowMore = this.toggleShowMore.bind(this);
        this.receiveDataFromChild = this.receiveDataFromChild.bind(this);
        this.componentValidation = this.componentValidation.bind(this)
        this.componentReturnData = this.componentReturnData.bind(this)
    }


    componentDidMount() {
        this.pmGetStoreLogo = cancelablePromise(storeService.getLogos())

        this.pmGetStoreLogo.promise.then(result => {
            const {appLogo, favicon, shopLogo, splashImage} = result

            this.setState({
                storeInfo: result,
                logos: {
                    appLogo: appLogo.urlPrefix ? new StoreLogoModel(appLogo) : undefined,
                    favicon: favicon.urlPrefix ? new StoreLogoModel(favicon) : undefined,
                    shopLogo: shopLogo.urlPrefix ? new StoreLogoModel(shopLogo) : undefined,
                    splashImage: splashImage.urlPrefix ? new StoreLogoModel(splashImage) : undefined
                }
            })
        })
    }

    componentWillUnmount() {
        this.pmGetStoreLogo.cancel()
    }

    toggleShowMore() {
        this.setState(pre => ({
            isShowMore: !pre.isShowMore
        }))
    }

    receiveDataFromChild(type, file) {
        if (type === this.ImageType.SHOP_LOGO) {
            this.setState({shopLogo: file})

        } else if (type === this.ImageType.APP_LOGO) {
            if (!file) {
                // app logo is not requred
                let storeInfo = this.state.storeInfo
                storeInfo.appLogo = {}
                this.setState({storeInfo: storeInfo})
            }
            this.setState({appLogo: file})

        } else if (type === this.ImageType.FAVICON) {
            if (!file) {
                // favicon is not required
                let storeInfo = this.state.storeInfo
                storeInfo.favicon = {}
                this.setState({storeInfo: storeInfo})
            }
            this.setState({favicon: file})
        } else if (type === this.ImageType.LOADING_SCREEN) {
            if (!file) {
                // favicon is not required
                let storeInfo = this.state.storeInfo
                storeInfo.splashImage = {}
                this.setState({storeInfo: storeInfo})
            }
            this.setState({splashImage: file})
        }
    }

    componentValidation() {
        let hasError = false
        let newRef

        // shop logo
        if(this.props.features.logo && this.props.features.logo.length){
            // only check required if the user has feature
            if(TokenUtils.hasAnyPackageFeatures(this.props.features.logo)){
                newRef = this.lstRef[0].current ? this.lstRef[0].current : this.lstRef[0]
                if (newRef.isValid() === false) {
                    hasError = true
                }
            }
        }

        if (hasError) {
            // show componet
            if (!this.state.isShowMore) {
                this.toggleShowMore()
            }
            return false
        }

        return !hasError
    }


    componentReturnData() {
        let lstFile = []

        // upload shop logo
        if (this.state.shopLogo) {
            lstFile.push({
                logoId: this.ImageType.SHOP_LOGO,
                file: this.state.shopLogo
            })
        }

        // upload favicon
        if (this.state.favicon) {
            lstFile.push({
                logoId: this.ImageType.FAVICON,
                file: this.state.favicon
            })
        }

        // app logo
        if (this.state.appLogo) {
            lstFile.push({
                logoId: this.ImageType.APP_LOGO,
                file: this.state.appLogo
            })
        }

        // upload loading screen
        if (this.state.splashImage) {
            lstFile.push({
                logoId: this.ImageType.LOADING_SCREEN,
                file: this.state.splashImage
            })
        }

        return {
            lstFile: lstFile,
            storeInfo: this.state.storeInfo
        }
    }


    renderSupportedDevices() {
        return (
            <div className="device-wrapper">
                <img alt="desktop" className="device-icon" src="/assets/images/theme/icon-website.svg"/>
                <img alt="mobile" className="device-icon" src="/assets/images/theme/icon-mobile.svg"/>
            </div>
        )
    }

    render() {
        return (
            <GSWidget className="collapsed-widget">
                <GSWidgetHeader showCollapsedButton defaultOpen={this.state.isShowMore}
                                onChangeCollapsedState={this.toggleShowMore}>
                    <div className="com-header">
                        <span className="com-name">{this.state.title}</span>
                        {/*{this.renderSupportedDevices()}*/}
                    </div>
                </GSWidgetHeader>
                <GSWidgetContent>
                    <div className="com-content" hidden={!this.state.isShowMore}>
                        {/*<hr/>*/}
                        {/*DESKTOP*/}
                        <div className="">
                            <PagingTable isShowPagination={false}
                                         headers={[
                                             i18next.t("component.storefront.customization.logo.name"),
                                             i18next.t("page.shopee.product.tbheader.thumbnail"),
                                             i18next.t("component.storefront.customization.logo.preview")]}
                                         headersAlign={[PagingTableAlign.LEFT, PagingTableAlign.LEFT, PagingTableAlign.RIGHT]}
                                         rowHoverEffect={false}
                                         pointerCursor={false}
                                         totalItems={3}
                            >
                                <PrivateComponent 
                                    wrapperDisplay={"block"} 
                                    hasAnyPackageFeature={this.props.features.logo}
                                >
                                    <ThemeLogoUploaderItem
                                        key={this.state.logos.shopLogo ? this.state.logos.shopLogo.imageId + '' : '0_shopLogo'}
                                        ref={(el) => this.lstRef[0] = el}
                                        type={this.ImageType.SHOP_LOGO}
                                        name={'Logo'}
                                        model={this.state.logos.shopLogo}
                                        callBackFunction={this.receiveDataFromChild}/>
                                </PrivateComponent>

                                <PrivateComponent 
                                    wrapperDisplay={"block"} 
                                    hasAnyPackageFeature={this.props.features.favicon}
                                >
                                    <ThemeLogoUploaderItem
                                        key={this.state.logos.favicon ? this.state.logos.favicon.imageId + '' : '1_favicon'}
                                        ref={(el) => this.lstRef[1] = el}
                                        type={this.ImageType.FAVICON}
                                        name={'Favicon'}
                                        model={this.state.logos.favicon}
                                        callBackFunction={this.receiveDataFromChild}
                                        isRequired={false}/>
                                </PrivateComponent>

                                <PrivateComponent 
                                    wrapperDisplay={"block"} 
                                    hasAnyPackageFeature={this.props.features.appLogo}
                                >
                                    <ThemeLogoUploaderItem
                                        key={this.state.logos.appLogo ? this.state.logos.appLogo.imageId + '' : '2_appLogo'}
                                        ref={(el) => this.lstRef[2] = el}
                                        type={this.ImageType.APP_LOGO}
                                        name={'App logo'}
                                        model={this.state.logos.appLogo}
                                        callBackFunction={this.receiveDataFromChild}
                                        isRequired={false}
                                    />
                                </PrivateComponent>

                                <PrivateComponent 
                                    wrapperDisplay={"block"} 
                                    hasAnyPackageFeature={this.props.features.loading}
                                >
                                    <ThemeLogoUploaderItem
                                        key={this.state.logos.splashImage ? this.state.logos.splashImage.imageId + '' : '3_splashImage'}
                                        ref={(el) => this.lstRef[2] = el}
                                        type={this.ImageType.LOADING_SCREEN}
                                        name={'Loading Screen'}
                                        model={this.state.logos.splashImage}
                                        callBackFunction={this.receiveDataFromChild}
                                        isRequired={false}
                                    />
                                </PrivateComponent>
                            </PagingTable>
                        </div>
                        {/*MOBILE*/}
                        {/* <div className="d-desktop-none d-mobile-block">
                            <hr/>
                            <ThemeLogoUploaderItem
                                key={'m' + (this.state.logos.shopLogo ? this.state.logos.shopLogo.imageId + '' : '0_shopLogo')}
                                ref={(el) => this.lstRef[0] = el}
                                type={this.ImageType.SHOP_LOGO}
                                name={'Logo'}
                                model={this.state.logos.shopLogo}
                                callBackFunction={this.receiveDataFromChild}/>
                            <hr/>
                            <ThemeLogoUploaderItem
                                key={'m' + (this.state.logos.favicon ? this.state.logos.favicon.imageId + '' : '1_favicon')}
                                ref={(el) => this.lstRef[1] = el}
                                type={this.ImageType.FAVICON}
                                name={'Favicon'}
                                model={this.state.logos.favicon}
                                callBackFunction={this.receiveDataFromChild}/>
                            <hr/>
                            <ThemeLogoUploaderItem
                                key={'m' + (this.state.logos.appLogo ? this.state.logos.appLogo.imageId + '' : '2_appLogo')}
                                ref={(el) => this.lstRef[2] = el}
                                type={this.ImageType.APP_LOGO}
                                name={'App logo'}
                                model={this.state.logos.appLogo}
                                callBackFunction={this.receiveDataFromChild}
                                isRequired={false}
                            />
                        </div> */}
                    </div>
                </GSWidgetContent>
            </GSWidget>
        );
    }
};

ThemeLogoAndFavicon.propTypes = {};
