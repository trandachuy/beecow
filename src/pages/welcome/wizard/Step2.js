import React, {Component} from 'react';
import {destroySetRegisterInfo, setRegisterInfo} from "../../../config/redux/Reducers";
import {connect} from "react-redux";
import update from "immutability-helper";
import _ from "lodash";
import {Trans} from "react-i18next";
import {FormGroup, Label} from 'reactstrap';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import i18next from "../../../config/i18n";
import {UikButton} from '../../../@uik';
import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";

import catalogService from "../../../services/CatalogService";
import storage from "../../../services/storage";
import storageService from "../../../services/storage";
import './Step2.sass'
import StoreModel from "../../../components/shared/model/StoreModel";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {CategoryService} from "../../../services/category";
import storeService from '../../../services/StoreService';
import Constants from '../../../config/Constant';
import WizardLayout from "./layout/WizardLayout";
import {ImageUtils} from "../../../utils/image";
import {AgencyService} from "../../../services/AgencyService";
import AlertInline from "../../../components/shared/AlertInline/AlertInline";
import beehiveService from "../../../services/BeehiveService";
import {FormValidate} from "../../../config/form-validate";
import {StoreUtils} from "../../../utils/store";
import * as axios from "axios";
import mediaService, {MediaServiceDomain} from "../../../services/MediaService";
import authenticate from "../../../services/authenticate";
import {ItemService} from "../../../services/ItemService";
import {CredentialUtils} from "../../../utils/credential";
import {RouteUtils} from "../../../utils/route";
import {AddressModel, BannerModel, LogoModel, ShopInfoModel} from "../../../components/shared/model";
import {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";

class Step2 extends Component {

    currentStep = 2;
    warnings;

    constructor(props) {
        super(props);
        this.refGetWidthPhoneCode = React.createRef()
        let orgScreen = '';
        if (this.props.location.state && this.props.location.state.warnings) {
            //--------------------------//
            // Incase move from login page
            // or step1 page
            //--------------------------//

            // get warning : no-store / no-config / no-domain
            this.warnings = this.props.location.state.warnings;

            if (!this.props.location.state.storeId) {
                // incase no-store
                this.store = new StoreModel();

                // get category
                CategoryService.getCategoryByLevel0productOnly()
                    .then(response => {
                        this.store.categoryIds = response.map((cate) => cate.id)
                    }).catch(e => {
                    console.error(e)
                });

            } else {
                // has store but no-config / no-domain
                this.store = new StoreModel();

                this.store.id = this.props.location.state.storeId;

            }

            // get userId from storage and save to store then remove storage
            let userId = storage.get(Constants.STORAGE_KEY_USER_ID);

            // set to store
            this.store.ownerId = userId;

            // Set email & phone from Step 1
            this.store.email = this.props.location.state.email;
            this.store.contactNumber = this.props.location.state.phone;
            this.store.phoneCode = this.props.location.state.phoneCode?.replace('+', '') || '84';
            this.store.countryCode = this.props.location.state.countryCode || 'VN';
            // remove storage????
            // storage.setToLocalStorage(Constants.STORAGE_KEY_USER_ID, '');

        } else {
            this.requireMoreFields = this.props.requireMoreFields;
            if (this.props.store) {
                //--------------------------//
                // Back from step3
                //--------------------------//
                this.store = this.props.store;
                this.warnings = this.props.warnings;
                orgScreen = '3';
            } else if (storage.get(Constants.STORAGE_KEY_SIGNUP_STORE)) {
                //--------------------------//
                // Reload at step 3-5
                //--------------------------//
                this.store = JSON.parse(storage.getFromSessionStorage(Constants.STORAGE_KEY_SIGNUP_STORE));
                this.warnings = storage.getFromSessionStorage(Constants.STORAGE_KEY_SIGNUP_WARNING_FLAG);
                orgScreen = '3';
            } else {
                //--------------------------//
                // user type link directly
                //--------------------------//
                window.location.href = NAV_PATH.wizard + '/1';
            }
        }

        // set default language if no language
        if (!storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY)) {
            storage.setToLocalStorage(Constants.STORAGE_KEY_LANG_KEY, 'vi');
        }

        this._isMounted = false;
        this.const = {
            DEFAULT_COUNTRY_CODE: "VN",
            PROTOCOL: "https://",
            DOMAIN_POST_FIX: ".gosell.vn",
            COLOR_PRIMARY: '880000',
            COLOR_SECONDARY: '40721C'
        };

        this.back = this.back.bind(this);
        this.done = this.done.bind(this);
        this.changeCity = this.changeCity.bind(this);
        this.changeDistrict = this.changeDistrict.bind(this);
        this.changeWard = this.changeWard.bind(this);
        this.onFormChange = this.onFormChange.bind(this);
        this.copyUrl = this.copyUrl.bind(this);
        this.renderInsideAddress = this.renderInsideAddress.bind(this);
        this.changeCountry = this.changeCountry.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
        this.changeCurrency = this.changeCurrency.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
        this.handleCreateStorefrontInfo = this.handleCreateStorefrontInfo.bind(this);
        this.initGoSellConfig = this.initGoSellConfig.bind(this);
        this.initShopInfoData = this.initShopInfoData.bind(this);
        this.initDefaultLogo = this.initDefaultLogo.bind(this);
        this.initDefaultBanners = this.initDefaultBanners.bind(this);
        this.handleError = this.handleError.bind(this);

        this.state = {
            cities: [],
            districts: [],
            wards: [],
            nameStore: '',
            contactNumber: this.store.contactNumber,
            email: this.store.email,
            pickupAddress: '',
            pickupAddress2: '',
            setting: {
                cityCode: '',
                districtCode: '',
                wardCode: '',
            },
            nextStep: this.currentStep,

            // go to sign out if back
            goSignOut: false,

            // orginal screen
            orgScreen: orgScreen,
            url: this.store.url,
            isURLValid: true,
            countries: [],
            countryCode: this.store.countryCode,
            supportLanguages: [],
            selectedLang: this.store.phoneCode === "84" ? 'vi' : 'en',
            currencyCode: this.store.currencyCode,
            phoneCode: this.store.phoneCode,
            provinces: [],
            cityName: this.store.cityName,
            zipCode: this.store.zipCode,
            isLoading: false,
            getWidthPhoneCode: 0,
            isChangeURL: false,
            messageAPIResponse: ""
        }

    }

    componentDidMount() {
        this._isMounted = true;

        //--------------------------//
        // Get districts of a country
        //--------------------------//
        catalogService.getCitesOfCountry(this.store.countryCode).then(cities => {
            this.setState({cities: cities}, () => {
                //--------------------------//
                // Get the store info
                //--------------------------//
                if (this.state.orgScreen === '3') {
                    // set state
                    this.setState({
                        nameStore: this.store.name ? this.store.name : '',
                        pickupAddress: this.store.address ? this.store.address : '',
                        pickupAddress2: this.store.address2 ? this.store.address2 : '',
                        contactNumber: this.store.contactNumber,
                        phoneCode: this.store.phoneCode ? this.store.phoneCode : '',
                        email: this.store.email,
                        setting: {
                            cityCode: this.store.city ? this.store.city : '',
                            districtCode: this.store.district ? this.store.district : '',
                            wardCode: this.store.ward ? this.store.ward : '',
                        }
                    }, () => {
                        const existCity = cities.findIndex(value => value.code === this.state.setting.cityCode) > -1;
                        if (existCity) {
                            this.changeCity(this.state.setting.cityCode);
                        }
                    });
                } else if (this.store.id) {
                    storeService.getStoreInfo(this.store.id).then(result => {
                        this.store = result;

                        this.store.orgURL = result.url;

                        // set logo image
                        let storeImage = result.storeImage;
                        if (storeImage && storeImage.imageUUID) {
                            this.store.file = ImageUtils.getImageFromImageModel(storeImage);
                            this.store.fileName = ImageUtils.getImageNameFromImageModel(storeImage);
                        }

                        // get pageaddress
                        storeService.getPageAddressByStoreId(this.store.id).then(pageAddress => {
                            // set addressId
                            this.store.addressId = pageAddress.id;

                            // address
                            this.store.address = pageAddress.address;

                            // get city
                            this.store.city = pageAddress.cityCode;

                            // get district
                            this.store.district = pageAddress.wardCode;

                            // get ward
                            this.store.ward = pageAddress.districtCode;

                            // set state
                            this.setState({
                                nameStore: this.store.name ? this.store.name : '',
                                pickupAddress: this.store.address ? this.store.address : '',
                                pickupAddress2: this.store.address2 ? this.store.address2 : '',
                                contactNumber: this.store.contactNumber,
                                phoneCode: this.store.phoneCode ? this.store.phoneCode : '',
                                email: this.store.email,
                                setting: {
                                    cityCode: this.store.city ? this.store.city : '',
                                    districtCode: this.store.district ? this.store.district : '',
                                    wardCode: this.store.ward ? this.store.ward : '',
                                }
                            }, () => {
                                const existCity = cities.findIndex(value => value.code === this.state.setting.cityCode) > -1;
                                if (existCity) {
                                    this.changeCity(this.state.setting.cityCode);
                                }
                            });
                        }).catch(e => {

                            // can not fine page address
                            if (e.response.status === 404) {
                                this.store.district = this.store.ward
                                this.store.ward = '';

                                // set state
                                this.setState({
                                    nameStore: this.store.name ? this.store.name : '',
                                    pickupAddress: this.store.address ? this.store.address : '',
                                    pickupAddress2: this.store.address2 ? this.store.address2 : '',
                                    contactNumber: this.store.contactNumber,
                                    phoneCode: this.store.phoneCode ? this.store.phoneCode : '',
                                    email: this.store.email,
                                    setting: {
                                        cityCode: this.store.city ? this.store.city : '',
                                        districtCode: this.store.district ? this.store.district : '',
                                        wardCode: this.store.ward ? this.store.ward : '',
                                    }
                                }, () => {
                                    const existCity = cities.findIndex(value => value.code === this.state.setting.cityCode) > -1;
                                    if (existCity) {
                                        this.changeCity(this.state.setting.cityCode);
                                    }
                                });
                            }
                        });
                    }).catch(e => {
                        console.log(e);
                    });
                }
            });
        }, () => {/*handling error here when getting cities*/
        });

        catalogService.getCountries()
            .then(countries => {
                catalogService.getCitesOfCountry(countries.find(code => code.phoneCode === parseInt(this.store.phoneCode))?.code)
                    .then(res => {
                        this.setState({
                            provinces: res
                        })
                    })

                this.setState({
                    countries: countries,
                    currencyCode: this.store.currencyCode || countries.find(code => code.code === this.store.countryCode)?.currencyCode,
                    countryCode: this.store.countryCode || countries.find(code => code.code === this.store.countryCode)?.code
                })
            })

        beehiveService.getSystemSettingByName(Constants.SYSTEM_SETTING_NAME.SUPPORT_LANGUAGE)
            .then(languageJSON => {
                const languages = languageJSON.value

                this.setState({
                    supportLanguages: languages.map(lang => ({
                        label: i18next.t(`page.setting.languages.${lang}`) || lang,
                        value: lang,
                    }))
                })
            })
        this.setState({
            getWidthPhoneCode: this.refGetWidthPhoneCode?.current?.offsetWidth
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.getWidthPhoneCode !== this.refGetWidthPhoneCode?.current?.offsetWidth) {
            this.setState({
                getWidthPhoneCode: this.refGetWidthPhoneCode?.current?.offsetWidth
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onFormChange(event) {
        if (event.target.name === 'nameStore') {
            if (this.state.isChangeURL) {
                this.setState({
                    [event.target.name]: event.target.value,
                });
                return;
            }
            this.setState({
                [event.target.name]: event.target.value,
                url: event.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
            });
        } else {
            if (event.target.name === 'url') {
                this.setState({
                    isURLValid: true,
                    [event.target.name]: event.target.value.toLowerCase()
                })
                return;
            }
            this.setState({
                [event.target.name]: event.target.value
            });
        }
    }

    changeCity(cityCode) {
        if (_.isEmpty(cityCode)) {
            this.setState({districts: []});
            this.setState({setting: update(this.state.setting, {districtCode: {$set: ''}})});

            this.setState({wards: []});
            this.setState({setting: update(this.state.setting, {wardCode: {$set: ''}})});
            return;
        }

        this.setState({setting: update(this.state.setting, {cityCode: {$set: cityCode}})});
        catalogService.getDistrictsOfCity(cityCode).then(districts => {
            this.setState({districts: districts});
            this.setState({wards: []});
            // this.setState({setting: update(this.state.setting, {districtCode: {$set: ''}})});
            // this.setState({setting: update(this.state.setting, {wardCode: {$set: ''}})});

            const district = this.state.setting.districtCode;
            const existDistrict = districts.findIndex(value => value.code === district) > -1;
            if (existDistrict) {
                this.changeDistrict(this.state.setting.districtCode);
            } else {
                this.setState({setting: update(this.state.setting, {districtCode: {$set: ''}})});
                this.setState({setting: update(this.state.setting, {wardCode: {$set: ''}})});
            }
        }, () => {
        });
    }

    changeDistrict(districtCode) {
        if (_.isEmpty(districtCode)) {
            this.setState({wards: []});
            this.setState({detail: update(this.state.setting, {wardCode: {$set: ''}})});
            return;
        }

        this.setState({setting: update(this.state.setting, {districtCode: {$set: districtCode}})});
        catalogService.getWardsOfDistrict(districtCode).then(wards => {
            this.setState({wards: wards});
            // this.setState({setting: update(this.state.setting, {wardCode: {$set: ''}})});

            const ward = this.state.setting.wardCode;
            const existWard = wards.findIndex(value => value.code === ward) > -1;
            if (existWard) {
                this.changeWard(this.state.setting.wardCode);
            } else {
                this.setState({setting: update(this.state.setting, {wardCode: {$set: ''}})});
            }
        }, () => {
        });
    }

    changeWard(wardCode) {
        this.setState({setting: update(this.state.setting, {wardCode: {$set: wardCode}})});
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

    changeCountry(countryCode) {
        catalogService.getCitesOfCountry(countryCode).then(cities => {
            this.setState({
                cities: cities,
                districts: []
            })
        })
        this.setState({
            countryCode,
            phoneCode: this.state.countries.find(code => code.code === countryCode).phoneCode,
            currencyCode: this.state.countries.find(code => code.code === countryCode).currencyCode,
        })
    }

    changeCurrency(currencyCode) {
        this.setState({
            currencyCode
        })
    }

    changeLanguage(selectedLang) {
        this.setState({
            selectedLang
        })
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

    onSubmitForm(event) {
        this.done();
    }

    isUserRoleFromToken(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let object = JSON.parse(atob(base64));
        return object.auth.toLowerCase() === "ROLE_USER".toLowerCase();
    }

    initGoSellConfig(shopInfo) {
        // create menu default here
        ItemService.createMenuDefault(shopInfo.id).then(res => {
        }).catch(error => {
        });

        let requests = [ItemService.migrateMappingItem(shopInfo.id)]; // Default request migrate mapping item
        let warnings = this.props.warnings;
        if (warnings.indexOf('no-config') >= 0) {
            let defaultMobileConfig = {
                // bundleId: 'com.mediastep.' + this.store.url,
                shopId: shopInfo.id,
                shopName: "not use", colorPrimary: this.store.colorPrimary,
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
                        }).catch(() => {
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
                if (this.isUserRoleFromToken(storageService.get(Constants.STORAGE_KEY_ACCESS_TOKEN))) {
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
        const defaultImage = 'https://dm4fv4ltmsvz0.cloudfront.net/product_default_image.png';
        const logoImageId = "product_default_image";
        const logoUrlPrefix = "https://dm4fv4ltmsvz0.cloudfront.net";
        const logoImageExtension = "png";
        return new LogoModel(logoImageId, logoUrlPrefix, defaultImage, logoImageId, logoUrlPrefix, defaultImage, logoImageId, logoUrlPrefix, defaultImage, logoImageId,
            logoUrlPrefix, defaultImage, storeId, logoImageExtension,logoImageExtension,logoImageExtension,logoImageExtension);
    }

    initShopInfoData(store) {
        let banners = this.initDefaultBanners(store.id);
        let logo = this.initDefaultLogo(store.id);
        let address = new AddressModel(store.addressId, store.address, store.city, store.ward, store.district, store.id,
            store.address2, store.countryCode, store.currencyCode, store.cityName, store.zipCode);
        const refCode = storageService.getFromSessionStorage(Constants.STORAGE_KEY_REF_CODE);
        const agencyCode = beehiveService.getAgencyCode();
        const domain = storageService.getFromSessionStorage(Constants.STORAGE_KEY_DOMAIN);
        return new ShopInfoModel(banners, store.categoryIds, logo, store.name, store.url.toLowerCase(), 'PRODUCT', store.contactNumber,
            address, store.email, store.ownerId, store.id, refCode, agencyCode, domain, this.state.selectedLang);
    }

    done() {

        // set data to store
        this.store.name = this.state.nameStore;
        this.store.url = this.state.url;
        this.store.countryCode = this.state.countryCode
        this.store.currencyCode = this.state.currencyCode
        this.store.address = this.state.pickupAddress;
        this.store.address2 = this.state.pickupAddress2;
        this.store.city = this.state.setting.cityCode;
        this.store.district = this.state.setting.districtCode;
        this.store.ward = this.state.setting.wardCode;
        this.store.cityName = this.state.cityName;
        this.store.zipCode = this.state.zipCode;
        this.store.contactNumber = this.state.contactNumber;
        this.store.email = this.state.email;
        this.store.colorPrimary = this.const.COLOR_PRIMARY;
        this.store.colorSecondary = this.const.COLOR_SECONDARY;

        // store throw all step
        this.props.dispatch(setRegisterInfo({
            store: this.store,
            warnings: this.warnings,
            expId: this.props.expId,
            pkgId: this.props.pkgId
        }));


        // Backup store signup info ??
        storage.setToSessionStorage(Constants.STORAGE_KEY_SIGNUP_STORE, JSON.stringify(this.store));
        storage.setToSessionStorage(Constants.STORAGE_KEY_SIGNUP_WARNING_FLAG, this.warnings)


        // start loading
        this.setState({isLoading: true});

        // check URL format first
        StoreUtils.checkDuplicateURL(this.state.url, this.store.orgURL).then(result => {

            if (result.isValidLink) {

                this.setState({isURLValid: true, messageAPIResponse: result.message});

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
                        if (this.store.file.startsWith("blob")) {
                            instance.get(this.store.file, {responseType: 'blob'})
                                .then(response => {
                                    const blob = new Blob([response.data]);
                                    const file = new File([blob], this.store.fileName, {type: blob.type})

                                    mediaService.uploadFileWithDomain(file, MediaServiceDomain.BANNER)
                                        .then(response => resolve(response))
                                        .catch(e => reject(e));
                                })
                                .catch(e => reject(e));
                        } else {
                            let existImage = ImageUtils.mapImageUrlToImageModel(this.store.file);
                            resolve(existImage);
                        }
                    })
                    :
                    new Promise(resolve => {
                        if (!this.store.storeImage) {
                            resolve({});
                        } else {
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
                            // shopInfoData.logos.shoplogoImageId = response.imageId ? response.imageId : response.imageUUID;
                            // shopInfoData.logos.shoplogoUrlPrefix = response.urlPrefix;
                            // shopInfoData.logos.shoplogoImageExtension = response.extension;
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
            } else {
                // show error
                this.setState({isURLValid: false, messageAPIResponse: result.message});
                this.setState({isLoading: false});
            }
        })
            .catch(reason => {
                this.handleError(reason, 'Check url');
            });

    }


    back() {

        // destroy redux
        this.props.dispatch(destroySetRegisterInfo());

        // log out then go to the login page
        this.setState({goSignOut: true});
    }

    renderStoreName() {
        return (
            <FormGroup className="input-field">
                <Label className={"gs-frm-control__title"}>
                    <Trans i18nKey="welcome.wizard.step2.storename">
                        STORE NAME
                    </Trans>
                </Label>
                <AvField
                    className="input-field__hint"
                    name="nameStore"
                    value={this.state.nameStore}
                    validate={{
                        required: {value: true, errorMessage: i18next.t('common.validation.required')},
                        maxLength: {value: 100, errorMessage: i18next.t("common.validation.char.max.length", {x: 100})},
                        minLength: {value: 3, errorMessage: i18next.t('common.validation.char.min.length', {x: 3})}
                    }}
                    placeholder={i18next.t('welcome.wizard.step2.storename.hint')}
                    onChange={this.onFormChange}
                />
            </FormGroup>
        )
    }

    renderUrl() {
        return (
            <div className="shop-url">
                <FormGroup>
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="welcome.wizard.step5.url">
                            URL shop
                        </Trans>
                    </Label>
                    <FormGroup className="icon-input__wrap">
                        <FontAwesomeIcon
                            className="shop-url__icon cursor--pointer"
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
                            ref={(el) => {
                                this.hasError = el
                            }}
                            className="shop-url__input"
                            name="url"
                            value={this.state.url}
                            validate={{
                                required: {value: true, errorMessage: i18next.t('common.validation.required')},
                                pattern: {
                                    value: '^[A-Za-z0-9]+$',
                                    errorMessage: i18next.t('common.validation.number.and.character')
                                },
                                maxLength: {
                                    value: 50,
                                    errorMessage: i18next.t('common.validation.char.max.length', {x: 50})
                                },
                                minLength: {
                                    value: 3,
                                    errorMessage: i18next.t('common.validation.char.min.length', {x: 3})
                                }
                            }}
                            onChange={(e) => {
                                this.onFormChange(e)
                                this.setState({
                                    isChangeURL: true
                                })
                            }}
                        />
                    </FormGroup>
                </FormGroup>
                <AlertInline
                    text={i18next.t("component.storefront.customization."+ `${this.state.messageAPIResponse}`)}
                    type="error"
                    nonIcon
                    hidden={this.state.isURLValid}
                />

            </div>
        )
    }

    renderCountryCurrenryLanguage() {
        return (
            <FormGroup className="shop-store__detail">
                <FormGroup className="shop-country">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="page.customers.edit.country">
                            country
                        </Trans>
                    </Label>
                    <AvField
                        type="select"
                        name="countryCode"
                        className='dropdown-box country'
                        value={this.state.countryCode}
                        onChange={e => this.changeCountry(e.target.value)}
                    >
                        {this.state.countries.map(country => {
                            return (
                                <option key={country.code} value={country.code}>
                                    {country.outCountry}
                                </option>
                            )
                        })}
                    </AvField>
                </FormGroup>
                <FormGroup className="shop-country">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="welcome.wizard.step2.address.currency">
                            currency
                        </Trans>
                    </Label>
                    <AvField
                        type="select"
                        name="currencyCode"
                        className='dropdown-box country'
                        value={this.state.currencyCode}
                        onChange={e => this.changeCurrency(e.target.value)}
                    >
                        {this.state.countries.filter((checkDuplicateCurrencyCode, index, self) => index === self.findIndex(s =>
                            s.currencyCode === checkDuplicateCurrencyCode.currencyCode)).map(country => {
                            return (
                                <option key={country.code} value={country.currencyCode}>
                                    {country.currencyName} - {country.currencyCode}({country.currencySymbol})
                                </option>
                            )
                        })}
                    </AvField>
                </FormGroup>

                <FormGroup className="shop-language">
                    {!!this.state.supportLanguages.length &&
                    <>
                        <Label className={"gs-frm-control__title"}>
                            <Trans i18nKey="page.setting.languages.title">
                                Store language
                            </Trans>
                        </Label>
                        <AvField
                            type="select"
                            name="country"
                            className='dropdown-box country'
                            value={this.state.selectedLang}
                            onChange={e => this.changeLanguage(e.target.value)}
                        >
                            {this.state.supportLanguages.map(language => {
                                return (
                                    <option key={language.value} value={language.value}>
                                        {language.label}
                                    </option>
                                )
                            })}
                        </AvField>
                    </>
                    }
                </FormGroup>
            </FormGroup>
        )
    }

    renderPhone() {
        if (!this.store.contactNumber || (_.findIndex(this.props.requireMoreFields, (el) => el === 'contactNumber') > -1)) {
            return (
                <FormGroup className="input-field shop-phone">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="welcome.wizard.step1.phone">
                            PHONE
                        </Trans>
                    </Label>

                    <span ref={this.refGetWidthPhoneCode} className="shop-phone__code">
                        +{this.state.phoneCode}
                    </span>
                    <AvField
                        className={`input-field__hint shop-phone__input padding-left__${this.state.getWidthPhoneCode}`}
                        name="contactNumber"
                        value={this.state.contactNumber}
                        validate={{
                            required: {
                                value: true,
                                errorMessage: i18next.t('common.validation.required')
                            },
                            pattern: {
                                value: /^[+]?[(]?[0-9]{0}[)]?[-s.]?[0-9]{0}[-s.]?[0-9]{0,15}$/,
                                errorMessage: i18next.t('common.validation.number.format')
                            },
                            maxLength: {
                                value: 15,
                                errorMessage: i18next.t("common.validation.char.max.length", {x: 15})
                            },
                            minLength: {
                                value: 8,
                                errorMessage: i18next.t("common.validation.char.min.length", {x: 8})
                            }
                        }}
                        placeholder={i18next.t('welcome.wizard.step1.phone.hint')}
                        onChange={this.onFormChange}
                    />
                </FormGroup>
            )
        }
    }

    renderEmail() {
        if (!this.store.email || (_.findIndex(this.props.requireMoreFields, (el) => el === 'email') > -1)) {
            return (
                <FormGroup className="input-field">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="welcome.wizard.step1.email">
                            EMAIL
                        </Trans>
                    </Label>
                    <AvField
                        type="email"
                        className={"input-field__hint"}
                        name="email"
                        value={this.state.email}
                        validate={{
                            required: {
                                value: true,
                                errorMessage: i18next.t('common.validation.required')
                            },
                            email: {
                                value: true,
                                errorMessage: i18next.t('common.validation.invalid.email')
                            },
                            maxLength: {
                                value: 150,
                                errorMessage: i18next.t("common.validation.char.max.length", {x: 150})
                            }
                        }}
                        placeholder={i18next.t('welcome.wizard.step1.email.hint')}
                        onChange={this.onFormChange}
                    />
                </FormGroup>
            )
        }
    }

    renderAddress() {
        return (
            <FormGroup className="input-field">
                <Label className={"gs-frm-control__title"}>
                    <Trans i18nKey="welcome.wizard.step2.address">
                        Pickup Address
                    </Trans>
                </Label>
                <AvField
                    className="input-field__hint"
                    name="pickupAddress"
                    value={this.state.pickupAddress}
                    validate={{
                        required: {value: true, errorMessage: i18next.t('common.validation.required')},
                        maxLength: {value: 255, errorMessage: i18next.t("common.validation.char.max.length", {x: 255})},
                    }}
                    placeholder={i18next.t('welcome.wizard.step2.address.hint')}
                    onChange={this.onFormChange}
                />
            </FormGroup>
        )
    }

    renderAddress2() {
        return (
            <FormGroup className="input-field">
                <Label className={"gs-frm-control__title"}>
                    <Trans i18nKey="page.customers.edit.address2">
                        Pickup Address2
                    </Trans>
                </Label>
                <AvField
                    className="input-field__hint"
                    name="pickupAddress2"
                    value={this.state.pickupAddress2}
                    validate={{
                        maxLength: {value: 255, errorMessage: i18next.t("common.validation.char.max.length", {x: 255})},
                    }}
                    placeholder={i18next.t('page.customer.addAddress.enterAddress2')}
                    onChange={this.onFormChange}
                />
            </FormGroup>
        )
    }

    renderInsideAddress() {
        return (
            <FormGroup className="shop-address__detail">
                <FormGroup className="shop-province">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="common.txt.street.province">
                            Province
                        </Trans>
                    </Label>
                    <AvField
                        type="select"
                        name="cityCode"
                        validate={{
                            required: {value: true, errorMessage: i18next.t('common.validation.required')}
                        }}
                        value={this.state.setting.cityCode}
                        onChange={e => this.changeCity(e.target.value)}>
                        <option value="">{i18next.t('common.text.select')}</option>
                        {
                            this.state.cities.map((x, index) => {
                                // skip other
                                if (x.code === 'VN-OTHER') {
                                    return null;
                                }
                                if (storage.getFromLocalStorage('langKey')?.toLowerCase() === "vi") {
                                    return (<option value={x.code} key={index}
                                                    defaultValue={this.state.setting.cityCode}>{x.inCountry}</option>);
                                } else {
                                    return (<option value={x.code} key={index}
                                                    defaultValue={this.state.setting.cityCode}>{x.outCountry}</option>);
                                }
                            })
                        }
                    </AvField>
                </FormGroup>
                <FormGroup className="shop-district">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="common.txt.street.district">
                            District
                        </Trans>
                    </Label>
                    <AvField
                        type="select"
                        name="districtCode"
                        validate={{
                            required: {value: true, errorMessage: i18next.t('common.validation.required')}
                        }}
                        value={this.state.setting.districtCode}
                        onChange={e => this.changeDistrict(e.target.value)}>
                        <option value="">{i18next.t('common.text.select')}</option>
                        {
                            this.state.districts.map((x, index) => {
                                if (storage.getFromLocalStorage('langKey').toLowerCase() === "vi") {
                                    return (<option value={x.code} key={index}
                                                    defaultValue={this.state.setting.districtCode}>{x.inCountry}</option>)
                                } else {
                                    return (<option value={x.code} key={index}
                                                    defaultValue={this.state.setting.districtCode}>{x.outCountry}</option>)
                                }
                            })
                        }
                    </AvField>
                </FormGroup>
                <FormGroup className="shop-ward">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="common.txt.street.ward">
                            Ward
                        </Trans>
                    </Label>
                    <AvField
                        type="select"
                        name="wardCode"
                        value={this.state.setting.wardCode}
                        onChange={e => this.changeWard(e.target.value)}>
                        <option value="">{i18next.t('common.text.select')}</option>
                        {
                            this.state.wards.map((x, index) => {
                                if (storage.getFromLocalStorage('langKey').toLowerCase() === "vi") {
                                    return (<option value={x.code} key={index}>{x.inCountry}</option>);
                                } else {
                                    return (<option value={x.code} key={index}>{x.outCountry}</option>);
                                }
                            })
                        }
                    </AvField>
                </FormGroup>
            </FormGroup>
        )
    }

    renderOutsideAddress() {
        return (
            <FormGroup className="shop-address__detail">
                <FormGroup className="shop-district">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="page.customers.edit.city">
                            city
                        </Trans>
                    </Label>
                    <AvField
                        name={'cityName'}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.maxLength(65)
                        }}
                        placeHolder={i18next.t('page.customer.addAddress.enterCity')}
                        onChange={this.onFormChange}
                        value={this.state.cityName}
                    />
                </FormGroup>

                <FormGroup className="shop-province">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="welcome.wizard.step2.address.province">
                            Province
                        </Trans>
                    </Label>
                    <AvField
                        type="select"
                        name="cityCode"
                        validate={{
                            required: {value: true, errorMessage: i18next.t('common.validation.required')}
                        }}
                        value={this.state.setting.cityCode}
                        onChange={e => this.changeCity(e.target.value)}>
                        <option value="">{i18next.t('page.customer.addAddress.selectState')}</option>
                        {
                            this.state.cities.map((x, index) => {
                                // skip other
                                if (x.code === 'VN-OTHER') {
                                    return null;
                                }
                                if (storage.getFromLocalStorage('langKey').toLowerCase() === "vi") {
                                    return (<option value={x.code} key={index}
                                                    defaultValue={this.state.setting.cityCode}>{x.inCountry}</option>);
                                } else {
                                    return (<option value={x.code} key={index}
                                                    defaultValue={this.state.setting.cityCode}>{x.outCountry}</option>);
                                }
                            })
                        }
                    </AvField>
                </FormGroup>

                <FormGroup className="shop-ward">
                    <Label className={"gs-frm-control__title"}>
                        <Trans i18nKey="page.customers.edit.zipCode">
                            zipCode
                        </Trans>
                    </Label>
                    <AvField
                        name={'zipCode'}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.maxLength(25)
                        }}
                        placeHolder={i18next.t('page.customer.addAddress.enterZipCode')}
                        onChange={this.onFormChange}
                        value={this.state.zipCode}
                    />
                </FormGroup>
            </FormGroup>
        )
    }

    render() {
        if (this.state.goSignOut) {
            let path = NAV_PATH.logout;
            return <Redirect to={{
                pathname: path
            }}/>
        }
        if (this.state.nextStep !== this.currentStep) {
            let path = NAV_PATH.wizard + '/' + this.state.nextStep;
            return <Redirect to={{
                pathname: path
            }}/>
        }
        return (
            <WizardLayout title={i18next.t("welcome.wizard.gosell.subTitle.setUp")}>
                <div className="step2-page__wrapper">
                    <div className="step-page__container">
                        <div className="step-page__content">
                            <Loading hidden={!this.state.isLoading} style={LoadingStyle.DUAL_RING_GREY}
                                     className="m-5"/>
                            {!this.state.isLoading && <AvForm onValidSubmit={this.onSubmitForm}>
                                {this.renderStoreName()}

                                {this.renderUrl()}

                                {this.renderCountryCurrenryLanguage()}

                                {this.renderPhone()}

                                {this.renderEmail()}

                                {this.renderAddress()}

                                {this.state.countryCode !== this.const.DEFAULT_COUNTRY_CODE && this.renderAddress2()}

                                {this.state.countryCode === this.const.DEFAULT_COUNTRY_CODE && this.renderInsideAddress()}

                                {this.state.countryCode !== this.const.DEFAULT_COUNTRY_CODE && this.renderOutsideAddress()}

                                <div className="button-group">
                                    <UikButton
                                        className="btn btn-back"
                                        transparent="true"
                                        icon={(
                                            <FontAwesomeIcon
                                                className="btn-back__icon"
                                                icon="arrow-alt-circle-left"
                                            />
                                        )}
                                        onClick={() => this.back()}
                                    >
                                        <Trans i18nKey="common.btn.back">
                                            Back
                                        </Trans>
                                    </UikButton>
                                    <UikButton
                                        type="submit"
                                        className="btn btn-next"
                                        iconRight
                                        transparent="true"
                                        icon={(
                                            <FontAwesomeIcon
                                                className="btn-next__icon"
                                                icon="arrow-alt-circle-right"
                                            />
                                        )}
                                        primary
                                    >
                                        <Trans i18nKey="common.btn.done">
                                            done
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

const mapStateToProps = (state) => {
    return {
        store: state.registerInfo.store,
        warnings: state.registerInfo.warnings,
        pkgId: state.registerInfo.pkgId,
        expId: state.registerInfo.expId,
        requireMoreFields: state.requireMoreFields
    }
};

export default connect(mapStateToProps)(Step2);

Step2.propTypes = {
    store: PropTypes.instanceOf(StoreModel)
}
