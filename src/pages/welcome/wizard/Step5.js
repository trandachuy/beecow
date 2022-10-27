import React, {Component} from 'react';
import {setRegisterInfo} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import {UikButton, UikSelect} from '../../../@uik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import {FormGroup, Label} from 'reactstrap';
import {AvField, AvForm} from 'availity-reactstrap-validation';

import StepBar from "./StepBar";
import './Step5.sass'
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {Redirect} from "react-router-dom";
import StoreModel from "../../../components/shared/model/StoreModel";
import storeService from "../../../services/StoreService";
import mediaService, {MediaServiceDomain} from "../../../services/MediaService";
import PropTypes from "prop-types";
import {AddressModel, BannerModel, LogoModel, ShopInfoModel} from "../../../components/shared/model";
import authenticate from "../../../services/authenticate";
import Constants from "../../../config/Constant";
import storageService from "../../../services/storage";
import * as axios from "axios";
import {ItemService} from "../../../services/ItemService";
import beehiveService from "../../../services/BeehiveService";
import AlertInline from "../../../components/shared/AlertInline/AlertInline";
import {StoreUtils} from "../../../utils/store";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import {ImageUtils} from "../../../utils/image";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import WizardLayout from "./layout/WizardLayout";
import {CredentialUtils} from "../../../utils/credential";
import {AgencyService} from "../../../services/AgencyService";
import {RouteUtils} from "../../../utils/route";
import Constant from "../../../config/Constant";

class Step5 extends Component {

    currentStep = 5;

    constructor(props) {
        super(props);
        if (!this.props.store) {
            // Not have store (load from redux context), mean navigate direct to this page
            // So redirect back to step 1
            window.location.href = NAV_PATH.wizard + '/2';
        }

        this.store = this.props.store;

        this.back = this.back.bind(this);
        this.done = this.done.bind(this);
        this.initShopInfoData = this.initShopInfoData.bind(this);
        this.initDefaultLogo = this.initDefaultLogo.bind(this);
        this.initDefaultBanners = this.initDefaultBanners.bind(this);
        this.handleCreateStorefrontInfo = this.handleCreateStorefrontInfo.bind(this);
        this.onURLChange = this.onURLChange.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
        this.initGoSellConfig = this.initGoSellConfig.bind(this);
        this.handleError = this.handleError.bind(this);
        this.copyUrl = this.copyUrl.bind(this);
        this.handleLanguage = this.handleLanguage.bind(this);

        this.const = {
            PROTOCOL: "https://",
            DOMAIN_POST_FIX: ".gosell.vn"
        };

        this.state = {
            isURLValid : true,
            url: this.store.url ? this.store.url.toLowerCase() : this.store.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
            nextStep: this.currentStep,

            isLoading: false,
            isCopied: false,
            supportLanguages: []
        }
    }

    componentDidMount() {
        beehiveService.getSystemSettingByName(Constants.SYSTEM_SETTING_NAME.SUPPORT_LANGUAGE)
            .then(languageJSON => {
                const languages = languageJSON.value

                this.setState({
                    selectedLang: {
                        label: i18next.t(`page.setting.languages.vi`),
                        value: 'vi',
                    },
                    supportLanguages: languages.map(lang => ({
                        label: i18next.t(`page.setting.languages.${lang}`) || lang,
                        value: lang,
                    }))
                })
            })
    }

    onURLChange(event){
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onSubmitForm(event){
        this.done();
    }

    back(){
        // store the url
        this.store.url = this.state.url;

        // Change back step
        this.setState({nextStep: 4});

        // store throw all step
        this.props.dispatch(setRegisterInfo({
            store: this.store,
            warnings: this.props.warnings,
            expId: this.props.expId,
            pkgId: this.props.pkgId
        }));
    }

    done(){

        // store the url
        this.store.url = this.state.url;

        // start loading
        this.setState({isLoading : true});

        // check URL format first
        StoreUtils.checkDuplicateURL(this.state.url, this.store.orgURL).then(result =>{

            if (result.isValidLink) {

                this.setState({isURLValid: true});

                // continue to register data
                const instance = axios.create({
                    baseURL: ''
                });

                //--------------------------//
                // Save or update setting here
                //--------------------------//
                // update image first
                let uploadShopLogo = this.store.file ?
                    new Promise((resolve, reject) => {
                        if(this.store.file.startsWith("blob")){
                            instance.get(this.store.file, {responseType: 'blob'})
                                .then(response => {
                                    const blob = new Blob([response.data]);
                                    const file = new File([blob], this.store.fileName, {type: blob.type})

                                    mediaService.uploadFileWithDomain(file, MediaServiceDomain.BANNER)
                                        .then(response => resolve(response))
                                        .catch(e => reject(e));
                                })
                                .catch(e => reject(e));
                        }else{
                            let existImage = ImageUtils.mapImageUrlToImageModel(this.store.file);
                            resolve(existImage);
                        }
                    })
                    :
                    new Promise(resolve => {
                        if (!this.store.storeImage) {
                            resolve({});
                        }
                        else {
                            resolve(this.store.storeImage);
                        }
                    });

                uploadShopLogo
                    .then(response => {

                        // Then create or update shop info
                        let shopInfoData = this.initShopInfoData(this.store);

                        if (!!response) {
                            // update shop info logo data if available
                            let storeImage = ImageUtils.getImageFromImageModel(response);
                            shopInfoData.logos.shoplogoImageId = response.imageId ? response.imageId : response.imageUUID;
                            shopInfoData.logos.shoplogoUrlPrefix = response.urlPrefix;
                            shopInfoData.logos.shoplogoImageExtension = response.extension;
                            shopInfoData.logos.shopLogo = storeImage;
                            shopInfoData.logos.storeId = this.store.id;
                        }

                        if (this.store.id) {
                            // Update shop info, must do switch profile to get store access token
                            authenticate.switchProfile(this.store.id, Constants.AUTHOR_TYPE_STORE)
                                .then(response => {
                                    const storeJwt = response.accessToken;
                                    const refreshToken = response.refreshToken;

                                    storageService.setToLocalStorage(Constants.STORAGE_KEY_ACCESS_TOKEN, storeJwt);
                                    storageService.setToLocalStorage(Constants.STORAGE_KEY_REFRESH_TOKEN, refreshToken);
                                    this.handleCreateStorefrontInfo(storeService.updateStorefrontInfo(shopInfoData));
                                })
                                .catch(reason => {
                                    this.handleError(reason, 'Switch profile');
                                });
                        } else {
                            // Create shop info
                            this.handleCreateStorefrontInfo(storeService.createStorefrontInfo(shopInfoData));
                        }
                    })
                    .catch(reason => {
                        this.handleError(reason, 'Upload logo');
                    });
            }else{
                // show error
                this.setState({isURLValid: false});
                this.setState({isLoading : false});
            }
        })
            .catch(reason => {
                this.handleError(reason, 'Check url');
            });

    }

    initShopInfoData(store) {
        let banners = this.initDefaultBanners(store.id);
        let logo = this.initDefaultLogo(store.id);
        let address = new AddressModel(store.addressId, store.address, store.city, store.ward, store.district, store.id);
        const refCode = storageService.getFromSessionStorage(Constants.STORAGE_KEY_REF_CODE);
        const agencyCode = beehiveService.getAgencyCode();
        const domain = storageService.getFromSessionStorage(Constants.STORAGE_KEY_DOMAIN);
        return new ShopInfoModel(banners, store.categoryIds, logo, store.name, store.url.toLowerCase(), 'PRODUCT', store.contactNumber,
            address, store.email, store.ownerId, store.id, refCode, agencyCode, domain, this.state.selectedLang.value);
    }

    initDefaultBanners(storeId) {
        // let banners = [];
        // for (let i = 0; i < 4; i++) {
        //     let id = i + 1001;
        //     let banner = new BannerModel(id, 'https://s3-ap-southeast-1.amazonaws.com/beehive-banner', i, true, null, storeId);
        //     banners.push(banner);
        // }
        // return banners;
        return [new BannerModel(1006, 'https://s3-ap-southeast-1.amazonaws.com/beehive-banner', 0, true, null, storeId)];
    }

    initDefaultLogo(storeId) {
        const defaultImage = '/assets/images/default_image.png';
        return new LogoModel(null, null, defaultImage, null, null, defaultImage, null, null, defaultImage, storeId);
    }

    isUserRoleFromToken(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let object = JSON.parse(atob(base64));
        return object.auth.toLowerCase() === "ROLE_USER".toLowerCase();
    }

    handleCreateStorefrontInfo(promiseCreateStorefrontInfo) {
        promiseCreateStorefrontInfo
            .then((shopInfo) => {
                // store throw all step
                if (!this.store.id) {
                    this.store.id = shopInfo.id;
                }
                if (!this.store.addressId) {
                    this.store.addressId = shopInfo.pageAddress.id;
                }

                delete this.props.warnings['no-store'];
                this.props.dispatch(setRegisterInfo({
                    store: this.store,
                    warnings: this.props.warnings,
                    pkgId: this.props.pkgId,
                    expId: this.props.expId
                }));

                // switch user role after create store
                if(this.isUserRoleFromToken(storageService.get(Constants.STORAGE_KEY_ACCESS_TOKEN))){
                    authenticate.switchProfile(shopInfo.id, Constants.AUTHOR_TYPE_STORE)
                        .then(response => {
                            const storeJwt = response.accessToken;
                            const refreshToken = response.refreshToken;

                            storageService.setToLocalStorage(Constants.STORAGE_KEY_ACCESS_TOKEN, storeJwt);
                            storageService.setToLocalStorage(Constants.STORAGE_KEY_REFRESH_TOKEN, refreshToken);

                            // Init mobile config, mapping item and user domain
                            this.initGoSellConfig(shopInfo);
                        })
                        .catch(reason => this.handleError(reason, 'Switch profile'));

                } else {
                    // Init mobile config, mapping item and user domain WITHOUT switch profile
                    this.initGoSellConfig(shopInfo);
                }
            })
            .catch(reason => this.handleError(reason, 'Create Storefront'));
    }

    handleError(error, errorFrom) {
        console.error(errorFrom ? errorFrom + ': ' : '' + error);
        this.setState({isLoading: false});
        if (error.response && error.response.status) {
            const errorStatus = error.response.status;
            if (!this.alertModal.isOpen()) {
                this.alertModal.openModal({
                    type: errorStatus === Constants.HTTP_STATUS_SERVER_ERROR ? AlertModalType.ALERT_TYPE_DANGER : AlertModalType.ALERT_TYPE_WARNING,
                    messages: i18next.t('common.message.server.response'),
                    closeCallback: () => {
                        this.setState({nextStep: 2});
                    }
                });
            }
        }
    }

    initGoSellConfig(shopInfo) {
        // create menu default here
        ItemService.createMenuDefault(shopInfo.id).then(res => {}).catch(error => {});

        let requests = [ItemService.migrateMappingItem(shopInfo.id)]; // Default request migrate mapping item
        let warnings = this.props.warnings;
        if (warnings.indexOf('no-config') >= 0) {
            let defaultMobileConfig = {
                // bundleId: 'com.mediastep.' + this.store.url,
                shopId: shopInfo.id,
                shopName: "not use",                colorPrimary: this.store.colorPrimary,
                colorSecondary: this.store.colorSecondary,
            };
            let createMobileConfigReq = new Promise((resolve, reject) => {
                beehiveService.createMobileConfig(defaultMobileConfig)
                    .then(value => {
                        delete this.props.warnings['no-config'];
                        resolve(value);
                    })
                    .catch(reason => reject(reason));
            });
            requests.push(createMobileConfigReq);
        }
        if (warnings.indexOf('no-domain') >= 0) {
            let addBeehiveDomainReq = new Promise((resolve, reject) => {
                authenticate.addBeehiveDomain(this.store.ownerId)
                    .then(value => {
                        delete this.props.warnings['no-domain'];
                        resolve(value);
                    })
                    .catch(reason => reject(reason));
            });
            requests.push(addBeehiveDomainReq);
        }
        Promise.all(requests)
            .then(() => {
                console.info('Init mobile config & mapping item success');
                CredentialUtils.setUserId(this.props.store.ownerId)
                CredentialUtils.setStoreOwnerId(this.props.store.ownerId)
                CredentialUtils.setStoreId(this.props.store.id)
                CredentialUtils.setInitialLanguage(this.state.selectedLang)
                storageService.setToLocalStorage(Constants.STORAGE_KEY_STORE_FULL, Constants.STORAGE_KEY_STORE_FULL);
                storageService.removeSessionStorage(Constants.STORAGE_KEY_REF_CODE);
                storageService.removeSessionStorage(Constants.STORAGE_KEY_DOMAIN);
                let forceActivate = storageService.getFromSessionStorage(Constants.STORAGE_KEY_FORCE_ACTIVATE);
                // check param have domain then redirect to home
                if (forceActivate) {
                    authenticate.refreshJwt(storageService.get(Constants.STORAGE_KEY_REFRESH_TOKEN))
                        .then(() => {
                             RouteUtils.redirectTo(NAV_PATH.home)
                        }).catch(()=>{
                        RouteUtils.redirectTo(NAV_PATH.login)
                    });
                } else if (this.props.pkgId && this.props.expId) { // => redirect to payment
                    this.setState({nextStep: 'payment'});
                } else {
                    this.setState({nextStep: 'payment'});
                }
            })
            .catch(reason => {
                this.props.dispatch(setRegisterInfo({
                    store: this.store,
                    warnings: this.props.warnings,
                    pkgId: this.props.pkgId,
                    expId: this.props.expId
                }));
                this.handleError(reason, 'Init config');
            });
    }

    copyUrl() {
        // Create a new textarea element and give it id='temp_element'
        let textarea = document.createElement('textarea');
        textarea.id = 'temp_element';
        // Optional step to make less noise on the page, if any!
        textarea.style.height = 0;
        // Now append it to your page somewhere, I chose <body>
        document.body.appendChild(textarea);
        // Give our textarea a value of whatever inside the div of id=containerid
        textarea.value = `${this.const.PROTOCOL}${this.state.url}.${AgencyService.getStorefrontDomain()}`;
        // Now copy whatever inside the textarea to clipboard
        let selector = document.querySelector('#temp_element');
        selector.select();
        document.execCommand('copy');
        // Remove the textarea
        document.body.removeChild(textarea)

        this.setState({isCopied: true});
    }

    handleLanguage(lang) {
        this.setState({
            selectedLang: lang
        })
    }

    render() {
        if (this.state.nextStep !== this.currentStep) {
            let path = NAV_PATH.wizard + '/' + this.state.nextStep;
            return <Redirect to={{
                pathname: path,
                state: {
                    storeId: this.store.id,
                    warnings: this.props.warnings
                }
            }}/>
        }
        return (
            <WizardLayout title={i18next.t('welcome.wizard.step5.title')}>
            <div className="step5-page__wrapper">
                <AlertModal ref={(el) => { this.alertModal = el }} />
                <div className="step-page__container">
                    <StepBar
                        step="5"
                        title={i18next.t('welcome.wizard.step5.title')}
                    />
                    <div className="step-page__content">
                        <Loading hidden={!this.state.isLoading} style={LoadingStyle.DUAL_RING_GREY} className="m-5"/>
                        {!this.state.isLoading &&
                        <AvForm onValidSubmit={this.onSubmitForm}>
                            <div className="method-setting">
                                <div className='form-group'>
                                    <span className="display-header">
                                        <Trans i18nKey="welcome.wizard.step5.logistic">
                                            Logistics
                                        </Trans>
                                    </span>
                                    <ul className="display-list">
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.logistic_ghn"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.logistic_ghtk"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.logistic_vnpost"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.logistic_self_delivery"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.logistic_ahamove"/>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className='form-group right'>
                                    <span className="display-header">
                                        <Trans i18nKey="welcome.wizard.step5.payment">
                                            Payment
                                        </Trans>
                                    </span>
                                    <ul className="display-list">
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.payment_visa"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.payment_internet_banking"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.payment_COD"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.payment_bank_stranfer"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.payment_zalopay"/>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#">
                                                <Trans i18nKey="welcome.wizard.step5.payment_momo"/>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            {!!this.state.supportLanguages.length && <div className='d-flex flex-column w-fit-content'>
                                <span className="language">
                                    <Trans i18nKey="welcome.wizard.step5.language">
                                        Store’s Default language
                                    </Trans>
                                </span>
                                <UikSelect
                                    key={this.state.supportLanguages}
                                    value={[this.state.selectedLang]}
                                    defaultValue={this.state.selectedLang}
                                    options={this.state.supportLanguages}
                                    onChange={lang => this.handleLanguage(lang)}
                                />
                            </div>}
                            <div className="shop-url">
                                <FormGroup>
                                    <Label className={"gs-frm-control__title"}>
                                        <Trans i18nKey="welcome.wizard.step5.url">
                                            URL shop
                                        </Trans>
                                    </Label>
                                    <FormGroup className="icon-input__wrap">
                                        <FontAwesomeIcon
                                            className="shop-url__icon"
                                            icon="copy"
                                            onClick={() => this.copyUrl()}>
                                        </FontAwesomeIcon>
                                        <span className="shop-url__protocol">
                                            {this.const.PROTOCOL}
                                        </span>
                                        <span className="shop-url__domain">
                                            {`.${AgencyService.getStorefrontDomain()}`}
                                        </span>
                                        <AvField
                                            ref={(el) => { this.hasError = el }}
                                            className="shop-url__input"
                                            name="url"
                                            value={this.state.url}
                                            validate={{
                                                required: {value: true, errorMessage: i18next.t('common.validation.required')},                                                pattern: {
                                                    value: '^[A-Za-z0-9]+$', errorMessage: i18next.t('common.validation.number.and.character')},
                                                maxLength: {
                                                    value: 50,
                                                    errorMessage: i18next.t('common.validation.char.max.length', {x: 50})
                                                },
                                                minLength: {
                                                    value: 3,
                                                    errorMessage: i18next.t('common.validation.char.min.length', {x: 3})
                                                }
                                            }}
                                            onChange= {this.onURLChange}
                                        />
                                    </FormGroup>
                                </FormGroup>
                                <AlertInline
                                    text={i18next.t("component.storefront.customization.invalid.url")}
                                    type="error"
                                    nonIcon
                                    hidden={this.state.isURLValid}
                                />

                            </div>
                            <div className="button-group">
                                <UikButton
                                    className={["btn btn-back", this.state.isLoading? 'gs-atm--disable':'']}
                                    transparent="true"
                                    icon={(
                                        <FontAwesomeIcon
                                            className="btn-back__icon"
                                            icon="arrow-alt-circle-left"
                                        />
                                    )}
                                    onClick={()=>this.back()}
                                >
                                    <Trans i18nKey="common.btn.back">
                                        Back
                                    </Trans>
                                </UikButton>
                                <UikButton
                                    type="submit"
                                    className={["btn btn-done", this.state.isLoading? 'gs-atm--disable':'']}
                                    transparent="true"
                                    iconRight
                                    icon={(
                                        <FontAwesomeIcon
                                            className="btn-next__icon"
                                            icon="arrow-alt-circle-right"
                                        />
                                    )}
                                    primary
                                >
                                    <Trans i18nKey="common.btn.next">
                                        Next
                                    </Trans>
                                </UikButton>
                            </div>
                        </AvForm>}
                    </div>
                </div>
            </div>
            </WizardLayout>
        );
    }
}

const mapRegisterInfo = (state) => {
    return {
        store: state.registerInfo.store,
        warnings: state.registerInfo.warnings,
        pkgId: state.registerInfo.pkgId,
        expId: state.registerInfo.expId
    }
};

export default connect(mapRegisterInfo)(Step5);

Step5.propTypes = {
    store: PropTypes.instanceOf(StoreModel)
};
