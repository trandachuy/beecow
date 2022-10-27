import React, {Component} from 'react';
import {connect} from "react-redux";
import {
    Card,
    CardBody,
    CardGroup,
    CardHeader,
    CardImg,
    CardText,
    Col,
    FormGroup,
    Label,
    Row,
    UncontrolledTooltip
} from 'reactstrap';
import './CustomizationDesignDefault.sass'
import ColorPicker from "../../../components/shared/ColorPicker/ColorPicker"
import "../../../components/shared/ColorPicker/ColorPicker.sass"
import 'react-tippy/dist/tippy.css'
import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import ButtonUpload from "../../../components/shared/ButtonUpload/ButtonUpload";
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import storeService from "../../../services/StoreService";
import authenticate from "../../../services/authenticate";
import colorService from "../../../services/ColorService";
import _ from 'lodash';
import Constants from "../../../config/Constant";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import update from 'immutability-helper';
import beehiveService from "../../../services/BeehiveService";
import mediaService, {MediaServiceDomain} from "../../../services/MediaService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import {CredentialUtils} from "../../../utils/credential";
import {ImageUtils} from "../../../utils/image";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {ThemeService} from "../../../services/ThemeService";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";

class CustomizationDesignDefault extends Component {

    constructor(props) {
        super(props);

        this._isMounted = false;
        this.storeId = authenticate.getStoreId();

        this.const = {
            QUESTION_MARK_URL: '/assets/images/icon_question.png',
            DEFAULT_IMAGE_URL: '/assets/images/default_image2.png',
            DEFAULT_BANNER_PREFIX: 'https://s3-ap-southeast-1.amazonaws.com/beehive-banner',
            DEFAULT_COVER_IMAGE_ID: 1001,
            DEFAULT_BANNER2_IMAGE_ID: 1002,
            DEFAULT_BANNER3_IMAGE_ID: 1003,
            DEFAULT_BANNER4_IMAGE_ID: 1004,
            FILE_LOGO: 'LOGO',
            FILE_MOBILE_LOGO: 'MOBILE_LOGO',
            FILE_FAVICON: 'FILE_FAVICON',
            FILE_SLASH_IMAGE: 'FILE_SLASH_IMAGE',
            FILE_COVER: 'FILE_COVER',
            FILE_BANNER2: 'FILE_BANNER2',
            FILE_BANNER3: 'FILE_BANNER3',
            FILE_BANNER4: 'FILE_BANNER4',
            CATALOG_TYPE_PRODUCT: 'PRODUCT',
            CATALOG_TYPE_DEAL: 'DEAL',
            LANGUAGE_VI: 'vi'
        };

        this.handleSelectColor = this.handleSelectColor.bind(this);
        this.onImageUploaded = this.onImageUploaded.bind(this);
        this.onInputUrlBlur = this.onInputUrlBlur.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.moveToCustomization = this.moveToCustomization.bind(this);
        this.onEnableSaveBtn = this.onEnableSaveBtn.bind(this);
        this.checkColorValue = this.checkColorValue.bind(this);

        this.state = {
            validColor: false,
            disableSaveBtn: true,
            oldColorPrimary: null,
            colors: [],
            newLogoFile: {
                shop: null,
                app: null,
                favicon: null,
                splashImage: null
            },
            newBannerFile: {
                cover: null,
                banner2: null,
                banner3: null,
                banner4: null
            },
            detail: {
                url: null,
                name: null,
                mobileConfig: {
                    id: null,
                    shopName: null,
                    colorPrimary: null,
                    colorSecondary: null,
                    shopId: this.storeId,
                    bundleId: 'com.beehive.bundle' + this.storeId // temporary hardcode
                },
                logo: {
                    id: null,
                    shopLogo: this.const.DEFAULT_IMAGE_URL,
                    shoplogoImageId: null,
                    shoplogoUrlPrefix: null,
                    appLogo: this.const.DEFAULT_IMAGE_URL,
                    applogoImageId: null,
                    applogoUrlPrefix: null,
                    faviconLogo: this.const.DEFAULT_IMAGE_URL,
                    faviconImageId: null,
                    faviconUrlPrefix: null,
                    splashImage: this.const.DEFAULT_IMAGE_URL,
                    splashImageId: null,
                    splashUrlPrefix: null,
                    storeId: this.storeId
                },
                banners: {
                    cover: {
                        id: null,
                        coverLogo: this.const.DEFAULT_IMAGE_URL,
                        imageUrlPrefix: this.const.DEFAULT_BANNER_PREFIX,
                        imageId: this.const.DEFAULT_COVER_IMAGE_ID,
                        url: '',
                        position: 0,
                        showed: true,
                        storeId: this.storeId
                    },
                    banner2: {
                        id: null,
                        banner2Logo: this.const.DEFAULT_IMAGE_URL,
                        imageUrlPrefix: this.const.DEFAULT_BANNER_PREFIX,
                        imageId: this.const.DEFAULT_BANNER2_IMAGE_ID,
                        url: '',
                        position: 1,
                        showed: true,
                        storeId: this.storeId
                    },
                    banner3: {
                        id: null,
                        banner3Logo: this.const.DEFAULT_IMAGE_URL,
                        imageUrlPrefix: this.const.DEFAULT_BANNER_PREFIX,
                        imageId: this.const.DEFAULT_BANNER3_IMAGE_ID,
                        url: '',
                        position: 2,
                        showed: true,
                        storeId: this.storeId
                    },
                    banner4: {
                        id: null,
                        banner4Logo: this.const.DEFAULT_IMAGE_URL,
                        imageUrlPrefix: this.const.DEFAULT_BANNER_PREFIX,
                        imageId: this.const.DEFAULT_BANNER4_IMAGE_ID,
                        url: '',
                        position: 3,
                        showed: true,
                        storeId: this.storeId
                    }
                }
            },
            themeDetail: {
                color: [],
                logo: [],
                favicon: [],
                appLogo: [],
                loading: [],
                cover: [],
                banner2: [],
                banner3: [],
                banner4: []
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.props.setLoading();

        let colorsAPI = colorService.getColors({});
        let mobileConfigAPI = beehiveService.getMobileConfig(this.storeId);
        let themeDefault = ThemeService.getThemeDefault();

        ThemeService.getActiveThemeOfStore(CredentialUtils.getStoreId())
            .then(result => {
                if (result && result !== "") { // has active theme -> redirect to edit active theme
                    RouteUtils.linkTo(this.props, NAV_PATH.customizationDesign + '?id=' + result.themeId)
                } else {
                    Promise.all([colorsAPI, mobileConfigAPI, themeDefault]).then(values => {
                        storeService.getStorefrontInfo(this.storeId).then((result) => {
                                if (this._isMounted) {
                                    let colors = values[0];
                                    this.setState({colors: colors});

                                    let mobileConfig = values[1];
                                    if (!_.isEmpty(mobileConfig)) {
                                        this.setState({detail: update(this.state.detail, {mobileConfig: {$set: mobileConfig}})});
                                        this.setState({oldColorPrimary: mobileConfig.colorPrimary});
                                        this.colorPicker.setDefaultColor(mobileConfig.colorPrimary);
                                    } else {
                                        let firstColor = colors[0];
                                        this.setState({detail: update(this.state.detail, {mobileConfig: {bundleId: {$set: 'com.mediastep.' + result.url}}})});
                                        this.setState({detail: update(this.state.detail, {mobileConfig: {colorPrimary: {$set: firstColor.primary}}})});
                                        this.setState({detail: update(this.state.detail, {mobileConfig: {colorSecondary: {$set: firstColor.secondary}}})});
                                        this.colorPicker.setDefaultColor(firstColor.primary);
                                    }

                                    this.checkColorValue();
                                    _.each(result.banners, x => {
                                        x.imageUrlPrefix = x.urlPrefix;
                                        return x;
                                    });
                                    this.setState({detail: update(this.state.detail, {name: {$set: result.shopName}})});
                                    this.setLogoFromGet(result);
                                    this.setStorefrontInfo(result);
                                    this.props.cancelLoading();

                                    this.setState({themeDetail: JSON.parse(values[2].commonFeature)})
                                }
                            },
                            () => {
                                if (this._isMounted) {
                                    this.props.cancelLoading();
                                    this.props.showServerError();
                                }
                            });
                    }, () => {
                        if (this._isMounted) {
                            this.props.cancelLoading();
                            this.props.showServerError();
                        }
                    });
                }
            })

    }

    setStorefrontInfo(result) {
        this.setState({detail: update(this.state.detail, {url: {$set: result.url}})});
        this.setBannerFromResult(result);
    }

    setLogoFromGet(result) {
        if (result.logos) {
            this.setState({detail: update(this.state.detail, {logo: {id: {$set: result.logos.id}}})});
            
            if (result.logos.shopLogo && (result.logos.shopLogo.imageId || result.logos.shopLogo.imageUUID)) {
                let shopLogo = ImageUtils.getImageFromImageModel(result.logos.shopLogo);
                this.setState({detail: update(this.state.detail, {logo: {shopLogo: {$set: shopLogo}}})});
                this.setState({detail: update(this.state.detail, {logo: {shoplogoImageId: {$set: result.logos.shopLogo.imageId ? result.logos.shopLogo.imageId : result.logos.shopLogo.imageUUID}}})});
                this.setState({detail: update(this.state.detail, {logo: {shoplogoUrlPrefix: {$set: result.logos.shopLogo.urlPrefix}}})});
                this.setState({detail: update(this.state.detail, {logo: {shoplogoImageExtension: {$set: result.logos.shopLogo.extension}}})});
            }

            if(result.logos.appLogo && (result.logos.appLogo.imageId || result.logos.appLogo.imageUUID)){
                let appLogo = ImageUtils.getImageFromImageModel(result.logos.appLogo);
                this.setState({detail: update(this.state.detail, {logo: {appLogo: {$set: appLogo}}})});
                this.setState({detail: update(this.state.detail, {logo: {applogoImageId: {$set: result.logos.appLogo.imageId ? result.logos.appLogo.imageId : result.logos.appLogo.imageUUID}}})});
                this.setState({detail: update(this.state.detail, {logo: {applogoUrlPrefix: {$set: result.logos.appLogo.urlPrefix}}})});
                this.setState({detail: update(this.state.detail, {logo: {applogoImageExtension: {$set: result.logos.appLogo.extension}}})});
            }
            
            if (result.logos.favicon.imageId) {
                let faviconLogo = result.logos.favicon.urlPrefix + Constants.SLASHES + result.logos.favicon.imageId + Constants.IMAGE_JPG_EXT;
                this.setState({detail: update(this.state.detail, {logo: {faviconLogo: {$set: faviconLogo}}})});
                this.setState({detail: update(this.state.detail, {logo: {faviconImageId: {$set: result.logos.favicon.imageId}}})});
                this.setState({detail: update(this.state.detail, {logo: {faviconUrlPrefix: {$set: result.logos.favicon.urlPrefix}}})});
            }
            if (result.logos.splashImage != null && result.logos.splashImage.imageId) {
                let splashImage = result.logos.splashImage.urlPrefix + Constants.SLASHES + result.logos.splashImage.imageId + Constants.IMAGE_JPG_EXT;
                this.setState({detail: update(this.state.detail, {logo: {splashImage: {$set: splashImage}}})});
                this.setState({detail: update(this.state.detail, {logo: {splashImageId: {$set: result.logos.splashImage.imageId}}})});
                this.setState({detail: update(this.state.detail, {logo: {splashUrlPrefix: {$set: result.logos.splashImage.urlPrefix}}})});
            }
        }
    }

    setLogoFromResult(result) {
        if (result.logos) {
            this.setState({detail: update(this.state.detail, {logo: {id: {$set: result.logos.id}}})});

            if (result.logos.shoplogoImageId) {
                let extension = result.logos.shoplogoImageExtension ?  ('.' + result.logos.shoplogoImageExtension) : Constants.IMAGE_JPG_EXT
                let shopLogo = result.logos.shoplogoUrlPrefix + Constants.SLASHES + result.logos.shoplogoImageId + extension;
                CredentialUtils.setStoreImage(shopLogo)
                this.setState({detail: update(this.state.detail, {logo: {shopLogo: {$set: shopLogo}}})});
                this.setState({detail: update(this.state.detail, {logo: {shoplogoImageId: {$set: result.logos.shoplogoImageId}}})});
                this.setState({detail: update(this.state.detail, {logo: {shoplogoUrlPrefix: {$set: result.logos.shoplogoUrlPrefix}}})});
            } else { // => remove image
                CredentialUtils.setStoreImage('')
            }

            if (result.logos.applogoImageId) {
                let extension = result.logos.applogoImageExtension ?  ('.' + result.logos.applogoImageExtension) : Constants.IMAGE_JPG_EXT
                let appLogo = result.logos.applogoUrlPrefix + Constants.SLASHES + result.logos.applogoImageId + extension;
                this.setState({detail: update(this.state.detail, {logo: {appLogo: {$set: appLogo}}})});
                this.setState({detail: update(this.state.detail, {logo: {applogoImageId: {$set: result.logos.applogoImageId}}})});
                this.setState({detail: update(this.state.detail, {logo: {applogoUrlPrefix: {$set: result.logos.applogoUrlPrefix}}})});
            }
            if (result.logos.faviconImageId) {
                let extension = result.logos.faviconImageExtension ?  ('.' + result.logos.faviconImageExtension) : Constants.IMAGE_JPG_EXT
                let faviconLogo = result.logos.faviconUrlPrefix + Constants.SLASHES + result.logos.faviconImageId + extension;
                this.setState({detail: update(this.state.detail, {logo: {faviconLogo: {$set: faviconLogo}}})});
                this.setState({detail: update(this.state.detail, {logo: {faviconImageId: {$set: result.logos.faviconImageId}}})});
                this.setState({detail: update(this.state.detail, {logo: {faviconUrlPrefix: {$set: result.logos.faviconUrlPrefix}}})});
            }
            if (result.logos.splashImageId) {
                let extension = result.logos.splashImageExtension ?  ('.' + result.logos.splashImageExtension) : Constants.IMAGE_JPG_EXT
                let splashImage = result.logos.splashUrlPrefix + Constants.SLASHES + result.logos.splashImageId + extension;
                this.setState({detail: update(this.state.detail, {logo: {splashImage: {$set: splashImage}}})});
                this.setState({detail: update(this.state.detail, {logo: {splashImageId: {$set: result.logos.splashImageId}}})});
                this.setState({detail: update(this.state.detail, {logo: {splashUrlPrefix: {$set: result.logos.splashUrlPrefix}}})});
            }
        }
    }

    setBannerFromResult(result) {
        if (result.banners.length > 0) {
            let hasCover = _.findIndex(result.banners, x => x.position === 0);
            if (hasCover > -1) {
                let cover = result.banners[hasCover];
                cover.coverLogo = cover.imageId === this.const.DEFAULT_COVER_IMAGE_ID ? this.const.DEFAULT_IMAGE_URL
                    : cover.imageUrlPrefix + Constants.SLASHES + cover.imageId + Constants.IMAGE_JPG_EXT;
                this.setState({detail: update(this.state.detail, {banners: {cover: {$set: cover}}})});
            }

            let hasBanner2 = _.findIndex(result.banners, x => x.position === 1);
            if (hasBanner2 > -1) {
                let banner2 = result.banners[hasBanner2];
                banner2.banner2Logo = banner2.imageId === this.const.DEFAULT_BANNER2_IMAGE_ID ? this.const.DEFAULT_IMAGE_URL
                    : banner2.imageUrlPrefix + Constants.SLASHES + banner2.imageId + Constants.IMAGE_JPG_EXT;
                this.setState({detail: update(this.state.detail, {banners: {banner2: {$set: banner2}}})});
            }

            let hasBanner3 = _.findIndex(result.banners, x => x.position === 2);
            if (hasBanner3 > -1) {
                let banner3 = result.banners[hasBanner3];
                banner3.banner3Logo = banner3.imageId === this.const.DEFAULT_BANNER3_IMAGE_ID ? this.const.DEFAULT_IMAGE_URL
                    : banner3.imageUrlPrefix + Constants.SLASHES + banner3.imageId + Constants.IMAGE_JPG_EXT;
                this.setState({detail: update(this.state.detail, {banners: {banner3: {$set: banner3}}})});
            }

            let hasBanner4 = _.findIndex(result.banners, x => x.position === 3);
            if (hasBanner4 > -1) {
                let banner4 = result.banners[hasBanner4];
                banner4.banner4Logo = banner4.imageId === this.const.DEFAULT_BANNER4_IMAGE_ID ? this.const.DEFAULT_IMAGE_URL
                    : banner4.imageUrlPrefix + Constants.SLASHES + banner4.imageId + Constants.IMAGE_JPG_EXT;
                this.setState({detail: update(this.state.detail, {banners: {banner4: {$set: banner4}}})});
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onInputUrlBlur(name, value) {
        if (_.isEmpty(value)) { // all url is not required
            return;
        }
        if (!Constants.HTTP_PREFIX_PATTERN.test(value) && !Constants.HTTPS_PREFIX_PATTERN.test(value)) {
            value = Constants.HTTP_PREFIX + value;
        }
        switch (name) {
            case this.const.FILE_COVER:
                this.setState({detail: update(this.state.detail, {banners: {cover: {url: {$set: value}}}})});
                break;
            case this.const.FILE_BANNER2:
                this.setState({detail: update(this.state.detail, {banners: {banner2: {url: {$set: value}}}})});
                break;
            case this.const.FILE_BANNER3:
                this.setState({detail: update(this.state.detail, {banners: {banner3: {url: {$set: value}}}})});
                break;
            case this.const.FILE_BANNER4:
                this.setState({detail: update(this.state.detail, {banners: {banner4: {url: {$set: value}}}})});
                break;
            default:
        }
    }

    handleSelectColor(selectedColor) {
        this.onEnableSaveBtn();
        let mobileConfig = this.state.detail.mobileConfig;
        mobileConfig.colorPrimary = selectedColor.primary;
        mobileConfig.colorSecondary = selectedColor.secondary;
        this.setState({detail: update(this.state.detail, {mobileConfig: {$set: mobileConfig}})});
        this.checkColorValue();
    }

    onImageUploaded(files, fieldName) {
        this.onEnableSaveBtn();
        let file = files[0];
        if (file.type !== Constants.IMAGE_TYPE_JPEG && file.type !== Constants.IMAGE_TYPE_PNG) {
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_DANGER,
                messages: i18next.t('common.validation.invalid.images.format')
            });
            return;
        }
        if (file.size > (1024 * 1024 * process.env.IMAGE_MAX_SIZE)) {
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_DANGER,
                messages: i18next.t('common.validation.editor.image.size', {x: process.env.IMAGE_MAX_SIZE})
            });
            return;
        }
        file.description = fieldName;
        let src = URL.createObjectURL(file);
        switch (fieldName) {
            case this.const.FILE_LOGO:
                this.setState({detail: update(this.state.detail, {logo: {shopLogo: {$set: src}}})});
                this.setState({newLogoFile: update(this.state.newLogoFile, {shop: {$set: file}})});
                break;
            case this.const.FILE_MOBILE_LOGO:
                this.setState({detail: update(this.state.detail, {logo: {appLogo: {$set: src}}})});
                this.setState({newLogoFile: update(this.state.newLogoFile, {app: {$set: file}})});
                break;
            case this.const.FILE_FAVICON:
                this.setState({detail: update(this.state.detail, {logo: {faviconLogo: {$set: src}}})});
                this.setState({newLogoFile: update(this.state.newLogoFile, {favicon: {$set: file}})});
                break;
            case this.const.FILE_SLASH_IMAGE:
                this.setState({detail: update(this.state.detail, {logo: {splashImage: {$set: src}}})});
                this.setState({newLogoFile: update(this.state.newLogoFile, {splashImage: {$set: file}})});
                break;
            case this.const.FILE_COVER:
                this.setState({detail: update(this.state.detail, {banners: {cover: {coverLogo: {$set: src}}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {cover: {$set: file}})});
                break;
            case this.const.FILE_BANNER2:
                this.setState({detail: update(this.state.detail, {banners: {banner2: {banner2Logo: {$set: src}}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {banner2: {$set: file}})});
                break;
            case this.const.FILE_BANNER3:
                this.setState({detail: update(this.state.detail, {banners: {banner3: {banner3Logo: {$set: src}}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {banner3: {$set: file}})});
                break;
            case this.const.FILE_BANNER4:
                this.setState({detail: update(this.state.detail, {banners: {banner4: {banner4Logo: {$set: src}}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {banner4: {$set: file}})});
                break;
            default:
        }
    }

    removeImage(fieldName) {
        this.onEnableSaveBtn();
        switch (fieldName) {
            case this.const.FILE_LOGO:
                this.setState({newLogoFile: update(this.state.newLogoFile, {shop: {$set: null}})});
                let shopLogo = this.state.detail.logo;
                shopLogo.shopLogo = this.const.DEFAULT_IMAGE_URL;
                shopLogo.shoplogoImageId = null;
                shopLogo.shoplogoUrlPrefix = null;
                this.setState({detail: update(this.state.detail, {logo: {$set: shopLogo}})});
                break;
            case this.const.FILE_MOBILE_LOGO:
                this.setState({newLogoFile: update(this.state.newLogoFile, {app: {$set: null}})});
                let appLogo = this.state.detail.logo;
                appLogo.appLogo = this.const.DEFAULT_IMAGE_URL;
                appLogo.applogoImageId = null;
                appLogo.applogoUrlPrefix = null;
                this.setState({detail: update(this.state.detail, {logo: {$set: appLogo}})});
                break;
            case this.const.FILE_FAVICON:
                this.setState({newLogoFile: update(this.state.newLogoFile, {favicon: {$set: null}})});
                let faviconLogo = this.state.detail.logo;
                faviconLogo.faviconLogo = this.const.DEFAULT_IMAGE_URL;
                faviconLogo.faviconImageId = null;
                faviconLogo.faviconUrlPrefix = null;
                this.setState({detail: update(this.state.detail, {logo: {$set: faviconLogo}})});
                break;
            case this.const.FILE_SLASH_IMAGE:
                this.setState({newLogoFile: update(this.state.newLogoFile, {splashImage: {$set: null}})});
                let splashImage = this.state.detail.logo;
                splashImage.splashImage = this.const.DEFAULT_IMAGE_URL;
                splashImage.splashImageId = null;
                splashImage.splashUrlPrefix = null;
                this.setState({detail: update(this.state.detail, {splashImage: {$set: splashImage}})});
                break;
            case this.const.FILE_COVER:
                let cover = this.state.detail.banners.cover;
                cover.coverLogo = this.const.DEFAULT_IMAGE_URL;
                cover.imageUrlPrefix = this.const.DEFAULT_BANNER_PREFIX;
                cover.imageId = this.const.DEFAULT_COVER_IMAGE_ID;
                this.setState({detail: update(this.state.detail, {banners: {cover: {$set: cover}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {cover: {$set: null}})});
                break;
            case this.const.FILE_BANNER2:
                let banner2 = this.state.detail.banners.banner2;
                banner2.banner2Logo = this.const.DEFAULT_IMAGE_URL;
                banner2.imageUrlPrefix = this.const.DEFAULT_BANNER_PREFIX;
                banner2.imageId = this.const.DEFAULT_BANNER2_IMAGE_ID;
                this.setState({detail: update(this.state.detail, {banners: {banner2: {$set: banner2}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {banner2: {$set: null}})});
                break;
            case this.const.FILE_BANNER3:
                let banner3 = this.state.detail.banners.banner3;
                banner3.banner3Logo = this.const.DEFAULT_IMAGE_URL;
                banner3.imageUrlPrefix = this.const.DEFAULT_BANNER_PREFIX;
                banner3.imageId = this.const.DEFAULT_BANNER3_IMAGE_ID;
                this.setState({detail: update(this.state.detail, {banners: {banner3: {$set: banner3}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {banner3: {$set: null}})});
                break;
            case this.const.FILE_BANNER4:
                let banner4 = this.state.detail.banners.banner4;
                banner4.banner4Logo = this.const.DEFAULT_IMAGE_URL;
                banner4.imageUrlPrefix = this.const.DEFAULT_BANNER_PREFIX;
                banner4.imageId = this.const.DEFAULT_BANNER4_IMAGE_ID;
                this.setState({detail: update(this.state.detail, {banners: {banner4: {$set: banner4}}})});
                this.setState({newBannerFile: update(this.state.newBannerFile, {banner4: {$set: null}})});
                break;
            default:
        }
    }

    submitForm() {
        this.form.submit();
    }

    handleSubmit(event, errors, values) {
        if (errors.length <= 0) {
            this.sanitize(values);
        }
    }

    sanitize(values) {
        this.props.setLoading();
        let data = {};
        data.id = this.storeId;
        data.categoryIds = _.map(this.state.selectedCategories, x => x.value);
        data.name = values.name;

        this.setState({detail: update(this.state.detail, {banners: {cover: {url: {$set: values.cover}}}})});
        this.setState({detail: update(this.state.detail, {banners: {banner2: {url: {$set: values.banner2}}}})});
        this.setState({detail: update(this.state.detail, {banners: {banner3: {url: {$set: values.banner3}}}})});
        this.setState({detail: update(this.state.detail, {banners: {banner4: {url: {$set: values.banner4}}}})});

        this.getBanners(data);
    }

    async uploadImageToServer(images) {
        let promiseArr = [];

        for (let image of images) {
            let domain;
            if (image.description === this.const.FILE_LOGO) {
                domain = MediaServiceDomain.STORE_LOGO;
            } else if (image.description === this.const.FILE_MOBILE_LOGO) {
                domain = MediaServiceDomain.APP_ICON;
            } else {
                domain = MediaServiceDomain.BANNER;
            }
            let uploadHandle = await mediaService.uploadFileWithDomain(image, domain);
            // let uploadHandle = await mediaService.uploadFile([image]);
            promiseArr.push(uploadHandle)
        }
        return promiseArr
    }

    getBanners(data) {
        data.logos = this.state.detail.logo;
        data.logos.storeId = this.storeId;

        data.banners = [];
        let hasNewCover = false, hasNewBanner2 = false, hasNewBanner3 = false, hasNewBanner4 = false;
        let apis = [];
        let types = [];
        if (this.state.newLogoFile.shop != null) {
            apis.push(this.state.newLogoFile.shop);
            types.push(this.const.FILE_LOGO);
        }
        if (this.state.newLogoFile.app != null) {
            apis.push(this.state.newLogoFile.app);
            types.push(this.const.FILE_MOBILE_LOGO);
        }
        if (this.state.newLogoFile.favicon != null) {
            apis.push(this.state.newLogoFile.favicon);
            types.push(this.const.FILE_FAVICON);
        }
        if (this.state.newLogoFile.splashImage != null) {
            apis.push(this.state.newLogoFile.splashImage);
            types.push(this.const.FILE_SLASH_IMAGE);
        }
        if (this.state.newBannerFile.cover != null) {
            apis.push(this.state.newBannerFile.cover);
            types.push(this.const.FILE_COVER);
            hasNewCover = true;
        }
        if (this.state.newBannerFile.banner2 != null) {
            apis.push(this.state.newBannerFile.banner2);
            types.push(this.const.FILE_BANNER2);
            hasNewBanner2 = true;
        }
        if (this.state.newBannerFile.banner3 != null) {
            apis.push(this.state.newBannerFile.banner3);
            types.push(this.const.FILE_BANNER3);
            hasNewBanner3 = true;
        }
        if (this.state.newBannerFile.banner4 != null) {
            apis.push(this.state.newBannerFile.banner4);
            types.push(this.const.FILE_BANNER4);
            hasNewBanner4 = true;
        }

        if (hasNewCover === false && this.state.detail.banners.cover.id != null) {
            data.banners.push(this.state.detail.banners.cover);
        }
        if (hasNewBanner2 === false && this.state.detail.banners.banner2.id != null) {
            data.banners.push(this.state.detail.banners.banner2);
        }
        if (hasNewBanner3 === false && this.state.detail.banners.banner3.id != null) {
            data.banners.push(this.state.detail.banners.banner3);
        }
        if (hasNewBanner4 === false && this.state.detail.banners.banner4.id != null) {
            data.banners.push(this.state.detail.banners.banner4);
        }

        if (apis.length > 0) {
            let that = this;
            this.uploadImageToServer(apis).then(files => {
                _.each(types, function (x, i) {
                    let item = files[i];
                    // let item = file[0];
                    switch (x) {
                        case that.const.FILE_LOGO:
                            data.logos.shoplogoImageId = item.imageId ? item.imageId : item.name;
                            data.logos.shoplogoUrlPrefix = item.urlPrefix;
                            data.logos.shoplogoImageExtension = item.extension;
                            break;
                        case that.const.FILE_MOBILE_LOGO:
                            data.logos.applogoImageId = item.imageId ? item.imageId : item.name;
                            data.logos.applogoUrlPrefix = item.urlPrefix;
                            data.logos.applogoImageExtension = item.extension;
                            break;
                        case that.const.FILE_FAVICON:
                            data.logos.faviconImageId = item.imageId;
                            data.logos.faviconUrlPrefix = item.urlPrefix;
                            break;
                        case that.const.FILE_SLASH_IMAGE:
                            data.logos.splashImageId = item.imageId;
                            data.logos.splashUrlPrefix = item.urlPrefix;
                            break;
                        case that.const.FILE_COVER:
                            let cover = that.state.detail.banners.cover;
                            cover.imageId = item.imageId;
                            cover.imageUrlPrefix = item.urlPrefix;
                            data.banners.push(cover);
                            break;
                        case that.const.FILE_BANNER2:
                            let banner2 = that.state.detail.banners.banner2;
                            banner2.imageId = item.imageId;
                            banner2.imageUrlPrefix = item.urlPrefix;
                            data.banners.push(banner2);
                            break;
                        case that.const.FILE_BANNER3:
                            let banner3 = that.state.detail.banners.banner3;
                            banner3.imageId = item.imageId;
                            banner3.imageUrlPrefix = item.urlPrefix;
                            data.banners.push(banner3);
                            break;
                        case that.const.FILE_BANNER4:
                            let banner4 = that.state.detail.banners.banner4;
                            banner4.imageId = item.imageId;
                            banner4.imageUrlPrefix = item.urlPrefix;
                            data.banners.push(banner4);
                            break;
                        default:
                    }
                });

                that.updateMobileConfig(data);
            }, () => {
            })
        } else {
            this.updateMobileConfig(data);
        }
    }

    updateMobileConfig(data) {
        if (this.state.oldColorPrimary !== this.state.detail.mobileConfig.colorPrimary) {
            let oldMobileConfig = this.state.detail.mobileConfig;
            oldMobileConfig.shopName = _.isEmpty(oldMobileConfig.shopName) ? this.state.detail.name : oldMobileConfig.shopName;
            oldMobileConfig.shopLogo = null;
            this.setState({detail: update(this.state.detail, {mobileConfig: {$set: oldMobileConfig}})});
            let mobileAPI;
            if (this.state.detail.mobileConfig.id != null) {
                mobileAPI = beehiveService.updateMobileConfig(this.state.detail.mobileConfig);
            } else {
                mobileAPI = beehiveService.createMobileConfig(this.state.detail.mobileConfig);
            }
            mobileAPI.then((mobileConfig) => {
                this.setState({oldColorPrimary: mobileConfig.colorPrimary});
                this.setState({detail: update(this.state.detail, {mobileConfig: {$set: mobileConfig}})});
                this.updateStorefront(data);
            }, () => {
                this.props.cancelLoading();
                this.props.showServerError();
            });
        } else {
            this.updateStorefront(data);
        }
    }

    updateStorefront(data) {
        storeService.updateStorefrontInfo(data).then(result => {
            _.each(result.urls, x => {
                x.urlValue = x.url;
            });

            CredentialUtils.setStoreName(result.name)
            CredentialUtils.setStoreImage(ImageUtils.getImageFromImageModel(result.logos.shopLogo))

            this.setState({detail: update(this.state.detail, {name: {$set: result.name}})});
            this.setLogoFromResult(result);
            this.setStorefrontInfo(result);

            // reset upload image
            this.setState({
                newLogoFile: {
                    shop: null,
                    app: null,
                    favicon: null,
                    splashImage: null
                },
                newBannerFile: {
                    cover: null,
                    banner2: null,
                    banner3: null,
                    banner4: null
                }
            });
            this.props.cancelLoading();
            this.alertModal.openModal({
                type: AlertModalType.ALERT_TYPE_SUCCESS,
                messages: i18next.t('common.message.update.successfully'),
                closeCallback: this.moveToCustomization
            });
        }, () => {
            this.props.cancelLoading();
            this.props.showServerError();
        });
    }

    moveToCustomization() {
        RouteUtils.linkTo(this.props, NAV_PATH.customization);
    }

    onEnableSaveBtn() {
        this.setState({
            disableSaveBtn: false
        });
    }

    checkColorValue() {
        this.setState({
            validColor: _.includes(Constants.DEFAULT_COLOR, this.state.detail.mobileConfig.colorPrimary)
        });
    }

    render() {
        return (
            <GSContentContainer className="design-container">
                <GSContentHeader className="design-container__title"
                                 title={i18next.t("component.storefront.customization.design.title")}>
                    {/*<Col md={8}>*/}
                    {/*    <label><Trans i18nKey="component.storefront.customization.design.title">Customization / Design</Trans></label>*/}
                    {/*</Col>*/}
                    <GSContentHeaderRightEl>
                        <GSButton success className="btn-save-design" onClick={this.submitForm}
                                  disabled={this.state.disableSaveBtn}><Trans
                            i18nKey="common.btn.save">Save</Trans></GSButton>
                    </GSContentHeaderRightEl>
                    {/*<Col md={4} className="text-right">*/}
                    {/*   */}
                    {/*</Col>*/}
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.LARGE} className="design-container__box">
                    <AvForm onSubmit={this.handleSubmit} ref={(el) => {
                        this.form = el
                    }}>
                        <Row>
                            <Col md={12}>
                                <label className="design-container__box__title gs-frm-control__title">
                                    <Trans i18nKey="component.storefront.customization.design.color">Shop color</Trans>
                                </label>
                                <Col md={12}
                                     className="design-container__box__content design-container__box__content-color">
                                    <p><Trans i18nKey="component.storefront.customization.design.header.color">Header
                                        background color</Trans></p>
                                    
                   
                                        <PrivateComponent 
                                            wrapperDisplay={"block"} 
                                            hasAnyPackageFeature={this.state.themeDetail.color}
                                        >
                                        <Col md={12} className="design-container__box__picker">
                                            <ColorPicker ref={(el) => {
                                                this.colorPicker = el
                                            }}
                                                        colors={this.state.colors} size={3}
                                                        onChange={this.handleSelectColor}
                                                        value={this.state.detail.mobileConfig.colorPrimary}/>
                                            <div className="design-container__box__picker-present">
                                                <img className="present" src="/assets/images/own_design.png"/>

                                                {this.state.validColor &&
                                                <span>
                                                        <img className="header-web"
                                                            src={'/assets/images/color_picker/' + this.state.detail.mobileConfig.colorPrimary.replace('#', '').toUpperCase() + '.jpg'}/>
                                                        <img className="header-mobile"
                                                            src={'/assets/images/color_picker/' + this.state.detail.mobileConfig.colorPrimary.replace('#', '').toUpperCase() + '.jpg'}/>
                                                    </span>
                                                }
                                            </div>
                                        </Col>
                                        </PrivateComponent>
                                    
                                    
                                </Col>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <label className="design-container__box__title gs-frm-control__title">
                                    Logo & favicon
                                </label>
                                <Col md={12}
                                     className="design-container__box__content design-container__box__content-logo">
                                    <CardGroup>
                                        <Col md={4}>
                                            <PrivateComponent 
                                                wrapperDisplay={"block"} 
                                                hasAnyPackageFeature={this.state.themeDetail.logo}
                                            >
                                            <Card>
                                                <CardHeader><Trans
                                                    i18nKey="component.storefront.customization.logo.shop.title">LOGO</Trans>
                                                    <span className="mgl10" href="#" id="TooltipLogo">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                    <UncontrolledTooltip placement="right" target="TooltipLogo">
                                                        <Trans
                                                            i18nKey="component.storefront.customization.logo.shop.tooltipDesc">Your
                                                            logo is your brand.<br/>It will appear on every page of your
                                                            shop.<br/></Trans>
                                                    </UncontrolledTooltip>
                                                </CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%" src={this.state.detail.logo.shopLogo}
                                                             alt="Card image cap" className="fix-width"/>
                                                    {this.state.detail.logo.shoplogoImageId !== null &&
                                                    <a className="image-remove"
                                                       onClick={() => this.removeImage(this.const.FILE_LOGO)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_LOGO}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                    <CardText>
                                                        <Trans
                                                            i18nKey="component.storefront.customization.logo.shop.desc"></Trans>
                                                    </CardText>
                                                </CardBody>
                                            </Card>
                                            </PrivateComponent>
                                        </Col>
                                        <Col md={4}>
                                            <PrivateComponent 
                                                wrapperDisplay={"block"} 
                                                hasAnyPackageFeature={this.state.themeDetail.appLogo}
                                            >
                                            <Card>
                                                <CardHeader><Trans
                                                    i18nKey="component.storefront.customization.logo.mobile.title">APP
                                                    LOGO</Trans>
                                                    <span className="mgl10" href="#" id="TooltipAppLogo">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                    <UncontrolledTooltip placement="right" target="TooltipAppLogo">
                                                        <Trans
                                                            i18nKey="component.storefront.customization.logo.mobile.tooltipDesc">It
                                                            will appear on every page in mobile of your
                                                            shop.<br/></Trans>
                                                    </UncontrolledTooltip>
                                                </CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%" src={this.state.detail.logo.appLogo}
                                                             alt="Card image cap" className="fix-width"/>
                                                    {this.state.detail.logo.applogoImageId !== null &&
                                                    <a className="image-remove"
                                                       onClick={() => this.removeImage(this.const.FILE_MOBILE_LOGO)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>

                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_MOBILE_LOGO}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                    <CardText>
                                                        <Trans
                                                            i18nKey="component.storefront.customization.logo.mobile.desc"></Trans>
                                                    </CardText>
                                                </CardBody>
                                            </Card>
                                            </PrivateComponent>
                                        </Col>
                                        <Col md={4}>
                                            <PrivateComponent 
                                                wrapperDisplay={"block"} 
                                                hasAnyPackageFeature={this.state.themeDetail.favicon}
                                            >
                                            <Card>
                                                <CardHeader>FAVICON
                                                    <span className="mgl10" href="#" id="TooltipFavicon">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                    <UncontrolledTooltip placement="right" target="TooltipFavicon">
                                                        <Trans
                                                            i18nKey="component.storefront.customization.favicon.tooltipDesc">Your
                                                            favicon will be shown next to the site's name in the
                                                            browser's address bar.<br/></Trans>
                                                    </UncontrolledTooltip>
                                                </CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%" src={this.state.detail.logo.faviconLogo}
                                                             alt="Card image cap" className="fix-width"/>
                                                    {this.state.detail.logo.faviconImageId !== null &&
                                                    <a className="image-remove"
                                                       onClick={() => this.removeImage(this.const.FILE_FAVICON)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_FAVICON}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                    <CardText>
                                                        <Trans
                                                            i18nKey="component.storefront.customization.favicon.desc"></Trans>
                                                    </CardText>
                                                </CardBody>
                                            </Card>
                                            </PrivateComponent>
                                        </Col>

                                        <Col md={4}>
                                            <PrivateComponent 
                                                wrapperDisplay={"block"} 
                                                hasAnyPackageFeature={this.state.themeDetail.loading}
                                            >
                                            <Card>
                                                <CardHeader>LOADING SCREEN
                                                    <span className="mgl10" href="#" id="TooltipSplashImage">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                    <UncontrolledTooltip placement="right" target="TooltipSplashImage">
                                                        {/*<Trans i18nKey="component.storefront.customization.favicon.tooltipDesc">Your favicon will be shown next to the site's name in the browser's address bar.<br/></Trans>*/}
                                                    </UncontrolledTooltip>
                                                </CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%" src={this.state.detail.logo.splashImage}
                                                             alt="Card image cap" className="fix-width"/>
                                                    {this.state.detail.logo.splashImageId !== null &&
                                                    <a className="image-remove"
                                                       onClick={() => this.removeImage(this.const.FILE_SLASH_IMAGE)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_SLASH_IMAGE}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                    <CardText>
                                                        <Trans
                                                            i18nKey="component.storefront.customization.splashImage.desc"></Trans>
                                                    </CardText>
                                                </CardBody>
                                            </Card>
                                            </PrivateComponent>
                                        </Col>
                                    </CardGroup>
                                </Col>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <label className="design-container__box__title gs-frm-control__title">
                                    Banners & Cover
                                </label>
                                <Col md={12}
                                     className="design-container__box__content design-container__box__content-banner">
                                    <Row>
                                        <PrivateComponent 
                                            wrapperDisplay={"block"} 
                                            hasAnyPackageFeature={this.state.themeDetail.cover}
                                        >
                                        <FormGroup className="design-container__box__content-banner--left">
                                            
                                            <Card>
                                                <CardHeader><Trans
                                                    i18nKey="component.storefront.customization.cover.label">Cover
                                                    (Web/Apps)</Trans></CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%"
                                                             src={this.state.detail.banners.cover.coverLogo}
                                                             alt="Card image cap"/>
                                                    {this.state.detail.banners.cover.imageId !== this.const.DEFAULT_COVER_IMAGE_ID &&
                                                    <a className="image-remove banner"
                                                       onClick={() => this.removeImage(this.const.FILE_COVER)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardText>
                                                    <Trans
                                                        i18nKey="component.storefront.customization.coverWebApps.desc"></Trans>
                                                </CardText>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_COVER}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                </CardBody>
                                            </Card>
                                        </FormGroup>
                                        <FormGroup className="design-container__box__content-banner--right">
                                            <Label><Trans i18nKey="component.storefront.customization.link.label">URL/LINK
                                                TO</Trans>
                                                <span href="#" id="TooltipCover">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                <UncontrolledTooltip placement="right" target="TooltipCover">
                                                    <Trans
                                                        i18nKey="component.storefront.customization.categories.title">Categories/
                                                        Product Detail/ other link</Trans>
                                                </UncontrolledTooltip>
                                            </Label>
                                            <AvField name='cover' value={this.state.detail.banners.cover.url || ''}
                                                     onChange={this.onEnableSaveBtn}
                                                     onBlur={e => this.onInputUrlBlur(this.const.FILE_COVER, e.target.value)}
                                                     validate={{
                                                         url: {
                                                             value: true,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         pattern: {
                                                             value: Constants.EXTEND_URL_PATTERN,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         maxLength: {
                                                             value: 255,
                                                             errorMessage: i18next.t('common.validation.char.max.length', {x: 255})
                                                         }
                                                     }}/>
                                        </FormGroup>
                                        </PrivateComponent>
                                    </Row>
                                    <Row>
                                        <PrivateComponent 
                                            wrapperDisplay={"block"} 
                                            hasAnyPackageFeature={this.state.themeDetail.banner2}
                                        >
                                        <FormGroup className="design-container__box__content-banner--left">
                                            <Card>
                                                <CardHeader>Banner 2</CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%"
                                                             src={this.state.detail.banners.banner2.banner2Logo}
                                                             alt="Card image cap"/>
                                                    {this.state.detail.banners.banner2.imageId !== this.const.DEFAULT_BANNER2_IMAGE_ID &&
                                                    <a className="image-remove banner"
                                                       onClick={() => this.removeImage(this.const.FILE_BANNER2)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardText>
                                                    <Trans
                                                        i18nKey="component.storefront.customization.banner2WebApps.desc"></Trans>
                                                </CardText>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_BANNER2}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                </CardBody>
                                            </Card>
                                        </FormGroup>
                                        <FormGroup className="design-container__box__content-banner--right">
                                            <Label><Trans i18nKey="component.storefront.customization.link.label">URL/LINK
                                                TO</Trans>
                                                <span href="#" id="TooltipBanner2">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                <UncontrolledTooltip placement="right" target="TooltipBanner2">
                                                    <Trans
                                                        i18nKey="component.storefront.customization.categories.title">Categories/
                                                        Product Detail/ other link</Trans>
                                                </UncontrolledTooltip>
                                            </Label>
                                            <AvField name='banner2' value={this.state.detail.banners.banner2.url || ''}
                                                     onChange={this.onEnableSaveBtn}
                                                     onBlur={e => this.onInputUrlBlur(this.const.FILE_BANNER2, e.target.value)}
                                                     validate={{
                                                         url: {
                                                             value: true,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         pattern: {
                                                             value: Constants.EXTEND_URL_PATTERN,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         maxLength: {
                                                             value: 255,
                                                             errorMessage: i18next.t('common.validation.char.max.length', {x: 255})
                                                         }
                                                     }}/>
                                        </FormGroup>
                                        </PrivateComponent>
                                    </Row>
                                    <Row>
                                        <PrivateComponent 
                                            wrapperDisplay={"block"} 
                                            hasAnyPackageFeature={this.state.themeDetail.banner3}
                                        >
                                        <FormGroup className="design-container__box__content-banner--left">
                                            <Card>
                                                <CardHeader>Banner 3</CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%"
                                                             src={this.state.detail.banners.banner3.banner3Logo}
                                                             alt="Card image cap"/>
                                                    {this.state.detail.banners.banner3.imageId !== this.const.DEFAULT_BANNER3_IMAGE_ID &&
                                                    <a className="image-remove banner"
                                                       onClick={() => this.removeImage(this.const.FILE_BANNER3)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardText>
                                                    <Trans
                                                        i18nKey="component.storefront.customization.banner3WebApps.desc"></Trans>
                                                </CardText>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_BANNER3}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                </CardBody>
                                            </Card>
                                        </FormGroup>
                                        <FormGroup className="design-container__box__content-banner--right">
                                            <Label><Trans i18nKey="component.storefront.customization.link.label">URL/LINK
                                                TO</Trans>
                                                <span href="#" id="TooltipBanner3">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                <UncontrolledTooltip placement="right" target="TooltipBanner3">
                                                    <Trans
                                                        i18nKey="component.storefront.customization.categories.title">Categories/
                                                        Product Detail/ other link</Trans>
                                                </UncontrolledTooltip>
                                            </Label>
                                            <AvField name='banner3' value={this.state.detail.banners.banner3.url || ''}
                                                     onChange={this.onEnableSaveBtn}
                                                     onBlur={e => this.onInputUrlBlur(this.const.FILE_BANNER3, e.target.value)}
                                                     validate={{
                                                         url: {
                                                             value: true,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         pattern: {
                                                             value: Constants.EXTEND_URL_PATTERN,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         maxLength: {
                                                             value: 255,
                                                             errorMessage: i18next.t('common.validation.char.max.length', {x: 255})
                                                         }
                                                     }}/>
                                        </FormGroup>
                                        </PrivateComponent>
                                    </Row>
                                    <Row>
                                        <PrivateComponent 
                                            wrapperDisplay={"block"} 
                                            hasAnyPackageFeature={this.state.themeDetail.banner4}
                                        >
                                        <FormGroup className="design-container__box__content-banner--left">
                                            <Card>
                                                <CardHeader>Banner 4</CardHeader>
                                                <div className={"card-image"}>
                                                    <CardImg top width="100%"
                                                             src={this.state.detail.banners.banner4.banner4Logo}
                                                             alt="Card image cap"/>
                                                    {this.state.detail.banners.banner4.imageId !== this.const.DEFAULT_BANNER4_IMAGE_ID &&
                                                    <a className="image-remove banner"
                                                       onClick={() => this.removeImage(this.const.FILE_BANNER4)}>
                                                        <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
                                                    </a>
                                                    }
                                                </div>
                                                <CardText>
                                                    <Trans
                                                        i18nKey="component.storefront.customization.banner4WebApps.desc"></Trans>
                                                </CardText>
                                                <CardBody>
                                                    <ButtonUpload multiple={false}
                                                                  fieldName={this.const.FILE_BANNER4}
                                                                  accept={[Constants.IMAGE_TYPE_PNG, Constants.IMAGE_TYPE_JPEG]}
                                                                  onChangeCallback={this.onImageUploaded}/>
                                                </CardBody>
                                            </Card>
                                        </FormGroup>
                                        <FormGroup className="design-container__box__content-banner--right">
                                            <Label><Trans i18nKey="component.storefront.customization.link.label">URL/LINK
                                                TO</Trans>
                                                <span href="#" id="TooltipBanner4">
                                                        <img className="icon-question"
                                                             src={this.const.QUESTION_MARK_URL}/>
                                                    </span>
                                                <UncontrolledTooltip placement="right" target="TooltipBanner4">
                                                    <Trans
                                                        i18nKey="component.storefront.customization.categories.title">Categories/
                                                        Product Detail/ other link</Trans>
                                                </UncontrolledTooltip>
                                            </Label>
                                            <AvField name='banner4' value={this.state.detail.banners.banner4.url || ''}
                                                     onChange={this.onEnableSaveBtn}
                                                     onBlur={e => this.onInputUrlBlur(this.const.FILE_BANNER4, e.target.value)}
                                                     validate={{
                                                         url: {
                                                             value: true,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         pattern: {
                                                             value: Constants.EXTEND_URL_PATTERN,
                                                             errorMessage: i18next.t('common.validation.invalid.url.format')
                                                         },
                                                         maxLength: {
                                                             value: 255,
                                                             errorMessage: i18next.t('common.validation.char.max.length', {x: 255})
                                                         }
                                                     }}/>
                                        </FormGroup>
                                        </PrivateComponent>
                                    </Row>
                                </Col>
                            </Col>
                        </Row>
                    </AvForm>
                </GSContentBody>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
            </GSContentContainer>
        );
    }
}

export default connect()(CustomizationDesignDefault);
