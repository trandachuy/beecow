import React, {Component, useState} from 'react';
import {connect} from "react-redux";
import {Label} from 'reactstrap';
import './StoreInfo.sass'
import {Trans} from "react-i18next";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18next from "../../../config/i18n";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import _ from "lodash";
import Constants from "../../../config/Constant";
import update from "immutability-helper";
import {faFacebookSquare, faInstagram, faYoutubeSquare} from '@fortawesome/free-brands-svg-icons'
import SocialRow from "./SocialRow/SocialRow";
import "./SocialRow/SocialRow.sass"
import storeService from "../../../services/StoreService";
import authenticate from "../../../services/authenticate";
import {cancelablePromise} from "../../../utils/promise";
import beehiveService from "../../../services/BeehiveService";
import {GSToast} from "../../../utils/gs-toast";
import {CredentialUtils} from "../../../utils/credential";
import GSTooltip, {GSTooltipIcon} from "../../../components/shared/GSTooltip/GSTooltip";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSEditor from "../../../components/shared/GSEditor/GSEditor";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import SEOEditor from "../../seo/SEOEditor";
import {AgencyService} from "../../../services/AgencyService";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {FormValidate} from "../../../config/form-validate";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import AvFieldToggle from "../../../components/shared/AvFieldToggle/AvFieldToggle";
import '../ListingWebsite/ListingWebsite.sass'
import TranslateModal from "../../../components/shared/productsModal/TranslateModal";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import SEOTranslateElement from "../../../components/shared/productsModal/shared/SEOTranslateElement";

class StoreInfo extends Component {
    constructor(props) {
        super(props);

        this.storeId = authenticate.getStoreId();

        this.state = {
            disableSaveBtn: true,
            isFetching: false,
            navigation: [
                {title: i18next.t('component.storefront.customization'), link: '/channel/storefront/customization'},
                {title: i18next.t('component.storefront.customization.info.title'), link: undefined}
            ],
            detail: {
                urls: {
                    facebook: {
                        id: null,
                        urlType: Constants.URL_TYPE_FACEBOOK,
                        url: '',
                        storeId: this.storeId
                    },
                    instagram: {
                        id: null,
                        urlType: Constants.URL_TYPE_INSTAGRAM,
                        url: '',
                        storeId: this.storeId
                    },
                    youtube: {
                        id: null,
                        urlType: Constants.URL_TYPE_YOUTUBE_VIDEO,
                        url: '',
                        storeId: this.storeId
                    },
                    policy_page: {
                        id: null,
                        urlType: Constants.StoreUrlType.POLICY_PAGE,
                        url: '',
                        storeId: this.storeId
                    }
                },
                shopName: '',
                email: '',
                contactNumber: '',
                description: '',
                addressList: '',
                openingHours: '',
            },
            mobileConfig: {
                id: null,
                shopName: null,
                colorPrimary: null,
                colorSecondary: null,
                shopId: this.storeId,
                bundleId: null
            },
            isSaving: false,
            oldAppName: null,
            seo: {
                seoTitle: '',
                seoDescription: '',
                seoKeywords: '',
                seoUrl: ''
            },
            ministry: {
                id: undefined,
                noticeEnabled: false,
                noticeUrl: "",
                registeredEnabled: false,
                registeredUrl: "",
                banned: false
            },
            selectedStoreInfoLang: {
                description: '',
                seoTitle: '',
                seoDescription: '',
                seoKeywords: '',
            }
        };

        this.onInputUrlBlur = this.onInputUrlBlur.bind(this);
        this.onEnableSaveBtn = this.onEnableSaveBtn.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.initPage = this.initPage.bind(this);
        this.renderTranslateInformationModal = this.renderTranslateInformationModal.bind(this);
        this.handleLanguageChanged = this.handleLanguageChanged.bind(this);
        this.handleLanguageSubmitted = this.handleLanguageSubmitted.bind(this);
        this.fetchStoreInfoLanguages = this.fetchStoreInfoLanguages.bind(this);
    }

    componentDidMount() {
        this.initPage();
    }

    initPage() {
        const storeInfoAPI = storeService.getStorefrontInfo(this.storeId);
        const mobileConfigAPI = beehiveService.getMobileConfig(this.storeId);
        const ministryConfigAPI = storeService.getStoreMinistry();
        const storeInfoLanguagesAPI = this.fetchStoreInfoLanguages();

        this.getAllInfomation = cancelablePromise(Promise.all([storeInfoAPI, mobileConfigAPI, storeInfoLanguagesAPI]));
        this.setState({
            isFetching: true
        });
        this.getAllInfomation.promise.then(async ([storeInfo, mobileConfig]) => {
                this.setStorefrontInfo(storeInfo);
                if (_.isEmpty(mobileConfig.shopName) || mobileConfig.shopName === 'not use') {
                    mobileConfig.shopName = '';
                }
                const newState = {
                    mobileConfig: mobileConfig,
                    oldAppName: mobileConfig.shopName,
                }

                try {
                    newState.ministry = await ministryConfigAPI
                } catch (e) {

                }
                this.setState(newState);
            },
            () => {
            }).finally(() => {
            this.setState({
                isFetching: false
            });
        });
    }

    fetchStoreInfoLanguages() {
        return storeService.getStoreInfoLanguagesByStoreId()
            .then(storeInfoLanguages => {
                this.setState({storeInfoLanguages: storeInfoLanguages})
            })
    }

    setStorefrontInfo(result) {
        this.setState({detail: update(this.state.detail, {addressList: {$set: result.addressList}})});
        this.setState({detail: update(this.state.detail, {shopName: {$set: result.shopName}})});
        this.setState({detail: update(this.state.detail, {email: {$set: result.email}})});
        this.setState({detail: update(this.state.detail, {contactNumber: {$set: result.contactNumber}})});
        this.setState({detail: update(this.state.detail, {description: {$set: result.description}})});
        this.setState({detail: update(this.state.detail, {openingHours: {$set: result.openingHours}})});
        const seoObject = {
            ...this.state.seo
        }
        if (result.seoTitle !== undefined) {
            seoObject.seoTitle = result.seoTitle
        }
        if (result.seoDescription !== undefined) {
            seoObject.seoDescription = result.seoDescription
        }
        if (result.seoKeywords !== undefined) {
            seoObject.seoKeywords = result.seoKeywords
        }
        if (result.seoUrl !== undefined) {
            seoObject.seoUrl = result.seoUrl
        }
        this.setState({seo: update(this.state.seo, {$set: seoObject})});

        this.setUrlFromResult(result);
    }

    setUrlFromResult(result) {
        if (result.urls.length > 0) {

            let hasPolicyPage = _.findIndex(result.urls, x => x.urlType === Constants.StoreUrlType.POLICY_PAGE);
            if (hasPolicyPage > -1) {
                let policy_page = result.urls[hasPolicyPage];
                policy_page.url = policy_page.urlValue;

                this.setState({detail: update(this.state.detail, {urls: {policy_page: {$set: policy_page}}})});
            }


            let hasFacebook = _.findIndex(result.urls, x => x.urlType === Constants.URL_TYPE_FACEBOOK);
            if (hasFacebook > -1) {
                let facebook = result.urls[hasFacebook];
                facebook.url = facebook.urlValue;
                this.setState({detail: update(this.state.detail, {urls: {facebook: {$set: facebook}}})});
            }

            let hasInstagram = _.findIndex(result.urls, x => x.urlType === Constants.URL_TYPE_INSTAGRAM);
            if (hasInstagram > -1) {
                let instagram = result.urls[hasInstagram];
                instagram.url = instagram.urlValue;
                this.setState({detail: update(this.state.detail, {urls: {instagram: {$set: instagram}}})});
            }

            let hasYoutube = result.urls.length > 0 ? _.findIndex(result.urls, x => x.urlType === Constants.URL_TYPE_YOUTUBE_VIDEO) : -1;
            if (hasYoutube > -1) {
                let youtube = result.urls[hasYoutube];
                youtube.url = youtube.urlValue;
                this.setState({detail: update(this.state.detail, {urls: {youtube: {$set: youtube}}})});
            } else {
                this.setState({
                    detail: update(this.state.detail, {
                        urls: {
                            youtube: {
                                $set: {
                                    id: null,
                                    urlType: Constants.URL_TYPE_YOUTUBE_VIDEO,
                                    url: '',
                                    storeId: this.storeId
                                }
                            }
                        }
                    })
                });
            }
        }
    }

    componentWillUnmount() {
        if (this.getAllInfomation) this.getAllInfomation.cancel();
    }

    onInputUrlBlur(name, value){
        if (_.isEmpty(value)){ // all url is not required
            return;
        }
        if (!Constants.HTTP_PREFIX_PATTERN.test(value) && !Constants.HTTPS_PREFIX_PATTERN.test(value)) {
            value = Constants.HTTP_PREFIX + value;
        }
        switch (name) {
            case Constants.URL_TYPE_FACEBOOK:
                this.setState({detail: update(this.state.detail, {urls: {facebook: {url: {$set: value}}}})});
                break;
            case Constants.URL_TYPE_INSTAGRAM:
                this.setState({detail: update(this.state.detail, {urls: {instagram: {url: {$set: value}}}})});
                break;
            case Constants.URL_TYPE_YOUTUBE_VIDEO:
                this.setState({detail: update(this.state.detail, {urls: {youtube: {url: {$set: value}}}})});
                break;
            default:
        }
    }

    onEnableSaveBtn() {
        if (this.state.disableSaveBtn === false) return
        this.setState({
            disableSaveBtn: false
        });
    }

    submitForm() {
        this.form.submit();
    }

    handleSubmit(event, errors, values) {
        if (errors.length <= 0) {
            this.setState({
                isSaving: true
            });

            this.sanitize(values);
        }
    }
    sanitize(values){
        // console.log(values.POLICY_PAGE)
        // console.log(validURL(values.POLICY_PAGE))
        const seo = {
            seoTitle: values.seoTitle? values.seoTitle: '',
            seoDescription: values.seoDescription? values.seoDescription: '',
            seoKeywords: values.seoKeywords? values.seoKeywords: '',
        }

        let data = {
            id: this.storeId,
            name: values.shopName,
            description: values.description,
            contactNumber: values.contactNumber,
            email: values.email,
            addressList: values.addressList,
            openingHours: values.openingHours,
            ...seo,
        };
        data.ministry = {
            id: this.state.ministry.id,
            noticeEnabled: values.noticeEnabled || false,
            noticeUrl: values.noticeUrl,
            registeredEnabled: values.registeredEnabled || false,
            registeredUrl: values.registeredUrl,
        }
        data.deleteUrls = [];
        data.urls = [];
        if (!_.isEmpty(values.POLICY_PAGE)) {
            data.urls.push(this.state.detail.urls.policy_page);
        } else if (this.state.detail.urls.policy_page.id != null) {
            data.deleteUrls.push(this.state.detail.urls.policy_page.id);
            this.setState({detail: update(this.state.detail, {urls: {policy_page: {id: {$set: null}}}})});
        }
        if (!_.isEmpty(values.FACEBOOK)) {
            data.urls.push(this.state.detail.urls.facebook);
        } else if (this.state.detail.urls.facebook.id != null) {
            data.deleteUrls.push(this.state.detail.urls.facebook.id);
            this.setState({detail: update(this.state.detail, {urls: {facebook: {id: {$set: null}}}})});
        }
        if (!_.isEmpty(values.INSTAGRAM)) {
            data.urls.push(this.state.detail.urls.instagram);
        } else if (this.state.detail.urls.instagram.id != null) {
            data.deleteUrls.push(this.state.detail.urls.instagram.id);
            this.setState({detail: update(this.state.detail, {urls: {instagram: {id: {$set: null}}}})});
        }
        if (!_.isEmpty(values.YOUTUBE_VIDEO)) {
            data.urls.push(this.state.detail.urls.youtube);
        } else if (this.state.detail.urls.youtube.id != null) {
            data.deleteUrls.push(this.state.detail.urls.youtube.id);
            this.setState({detail: update(this.state.detail, {urls: {youtube: {id: {$set: null}}}})});
        }

        if (values.appName !== this.state.oldAppName) {
            let oldMobileConfig = this.state.mobileConfig;
            oldMobileConfig.shopName = values.appName;
            oldMobileConfig.shopLogo = null;
            let mobileAPI;
            if (this.state.mobileConfig.id != null) {
                mobileAPI = beehiveService.updateMobileConfig(oldMobileConfig);
            } else {
                mobileAPI = beehiveService.createMobileConfig(oldMobileConfig);
            }
            mobileAPI.then(() => {
                this.updateStorefront(data);
            }, () => {
                this.setState({
                    isSaving: false
                });
                GSToast.commonError();
            });
        } else {
            this.updateStorefront(data);
        }
    }

    validURL(str) {
        const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    updateStorefront(data){
        const {ministry: ministryRequestBody, ...storefrontInfoRequestBody} = data
        storeService.updateStorefrontInfo(storefrontInfoRequestBody).then(async result => {
            // update ministry
            if (!this.state.ministry.banned) {
                try {
                    const ministryUpdateResponse = await storeService.updateStoreMinistry(ministryRequestBody);
                } catch (e) {
                    console.error(e)
                }
            }

            CredentialUtils.setStoreName(result.name);
            GSToast.success('common.message.update.successfully', true);
            this.setState({
                disableSaveBtn: true
            });
            this.initPage();
        }, () => {
            GSToast.commonError();
        }).finally(() => {
            this.setState({
                isSaving: false
            });
        });
    }

    handleLanguageChanged(lang) {
        const selectedLang = this.state.storeInfoLanguages.find(l => l.language === lang.langCode) || {
            storeId: this.storeId,
            language: lang.langCode,
            description: this.state.detail.description,
            seoTitle: this.state.seo.seoTitle,
            seoDescription: this.state.seo.seoDescription,
            seoKeywords: this.state.seo.seoKeywords
        }

        this.setState({
            selectedStoreInfoLang: selectedLang
        })
    }

    handleLanguageSubmitted(values) {
        const {informationDescription, seoTitle, seoDescription, seoKeywords} = values
        const request = {
            storeId: CredentialUtils.getStoreId(),
            language: this.state.selectedStoreInfoLang.language,
            description: informationDescription,
            seoTitle: seoTitle,
            seoDescription: seoDescription,
            seoKeywords: seoKeywords,
        }

        return storeService.upsertStoreInfoLanguage(request)
            .then(() => {
                GSToast.commonUpdate()

                return this.fetchStoreInfoLanguages()
            })
            .catch(() => {
                GSToast.commonError()
            })
    }

    renderTranslateInformationModal() {
        const {language, description, seoTitle, seoDescription, seoKeywords} = this.state.selectedStoreInfoLang

        return (
            <TranslateModal buttonTranslateStyle={{marginRight: '7px'}} onDataFormSubmit={this.handleLanguageSubmitted}
                            onDataLanguageChange={this.handleLanguageChanged}>
                <TranslateModal.Information
                    description={description}
                    controller={{
                        hasName: false
                    }}
                />
                <TranslateModal.SEO
                    key={language}
                    seoTitle={seoTitle}
                    seoDescription={seoDescription}
                    seoKeywords={seoKeywords}
                    langKey={language}
                    isShowUrl={false}
                    onBlur={data => this.setState({
                        selectedStoreInfoLang: {
                            ...this.state.selectedStoreInfoLang,
                            seoTitle: data.seoTitle,
                            seoDescription: data.seoDescription,
                            seoKeywords: data.seoKeywords,
                        }
                    })}
                />
            </TranslateModal>
        )
    }

    render() {
        return (
            <GSContentContainer className="info-container" isSaving={this.state.isSaving} isLoading={this.state.isFetching}>
                <GSContentHeaderRightEl className='d-flex'>
                    {this.renderTranslateInformationModal()}
                    <GSButton primary buttonType="button" className="gs-button  gs-button__blue setting_btn_save"
                              onClick={this.submitForm}>
                        <Trans i18nKey="common.btn.save"/>
                    </GSButton>
                </GSContentHeaderRightEl>
                <GSContentBody size={GSContentBody.size.LARGE}>
                    <AvForm onSubmit={this.handleSubmit} ref={(el) => { this.form = el }} autoComplete="off">
                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                <Trans i18nKey="component.storefront.general.info">General info</Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className={'widget__content'}>
                                <Label for={'shopName'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.storefront.customization.design.shop.name">Shop Name</Trans>
                                </Label>
                                <PrivateComponent wrapperDisplay={"block"}
                                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0325]}>
                                <AvField name={'shopName'} value={this.state.detail.shopName} onChange={this.onEnableSaveBtn}
                                         validate={{
                                             required: {
                                                 value: true,
                                                 errorMessage: i18next.t('common.validation.required')
                                             },
                                             maxLength: {
                                                 value: 100,
                                                 errorMessage: i18next.t('common.validation.char.max.length', {x: 100})
                                             },
                                             minLength: {
                                                 value: 3,
                                                 errorMessage: i18next.t('common.validation.char.min.length', {x: 3})
                                             }
                                         }}
                                />
                                </PrivateComponent>

                                <Label for={'appName'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.storefront.customization.info.app.name">App Name</Trans>
                                    <GSTooltip message={i18next.t("component.storefront.customization.info.app.name.tooltip")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                                </Label>
                                <PrivateComponent wrapperDisplay={"block"}
                                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0289]}
                                                  childrenProps={{
                                                      validate: {
                                                          required: {
                                                              value: false,
                                                          },
                                                      }
                                                  }}
                                >
                                    <AvField name={'appName'}  value={this.state.mobileConfig.shopName} onChange={this.onEnableSaveBtn}
                                             disabled={Constants.Package.TRIAL === parseInt(CredentialUtils.getPackageId())}
                                             validate={{
                                                 required: {
                                                     value: true,
                                                     errorMessage: i18next.t('common.validation.required')
                                                 },
                                                 maxLength: {
                                                     value: 30,
                                                     errorMessage: i18next.t('component.storefront.customization.info.app.name.validation')
                                                 },
                                                 minLength: {
                                                     value: 3,
                                                     errorMessage: i18next.t('component.storefront.customization.info.app.name.validation')
                                                 }
                                             }}
                                    />
                                </PrivateComponent>


                                <Label for={'description'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.storefront.customization.info.shop.desc">
                                        Shop Description
                                    </Trans>
                                </Label>
                                <GSEditor
                                    name={'description'}
                                    value={this.state.detail.description}
                                    isRequired={true}
                                    minLength={0}
                                    maxLength={100_000}
                                    onChange={this.onEnableSaveBtn}
                                />
                                {/*<AvFieldCountable*/}
                                {/*    name={'description'}*/}
                                {/*    value={this.state.detail.description}*/}
                                {/*    type={'textarea'}*/}
                                {/*    isRequired={false}*/}
                                {/*    maxLength={200}*/}
                                {/*    minLength={1}*/}
                                {/*    onChange={this.onEnableSaveBtn}*/}
                                {/*    counterPosition={CounterPosition.BOTTOM_RIGHT}*/}
                                {/*    rows={3}*/}
                                {/*    />*/}
                            </UikWidgetContent>
                        </UikWidget>

                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                <Trans i18nKey="component.storefront.customization.info.contact">Contact info</Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className={'widget__content '}>
                                <Label for={'hotline'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.storefront.hotline">Hotline</Trans>
                                </Label>
                                <PrivateComponent wrapperDisplay={"block"}
                                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0326]}>
                                <AvField name={'contactNumber'} value={this.state.detail.contactNumber} onChange={this.onEnableSaveBtn}
                                         validate={{
                                             required: {
                                                 value: true,
                                                 errorMessage: i18next.t('common.validation.required')
                                             },
                                             pattern: {
                                                 value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                                                 errorMessage: i18next.t('common.validation.invalid.phone')
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
                                />
                                </PrivateComponent>

                                <Label for={'email'} className="gs-frm-control__title">
                                    <Trans i18nKey="common.txt.email">Email</Trans>
                                </Label>
                                <PrivateComponent wrapperDisplay={"block"}
                                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0326]}>
                                <AvField name={'email'} value={this.state.detail.email} onChange={this.onEnableSaveBtn}
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
                                />
                                </PrivateComponent>
                                <Label for={'addressList'} className="gs-frm-control__title">
                                    <Trans i18nKey="component.storefront.customization.info.address.list">
                                        Address List
                                    </Trans>
                                </Label>
                                <PrivateComponent wrapperDisplay={"block"} hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0290]}>
                                    <AvField
                                        name={'addressList'}
                                        type={'textarea'}
                                        value={this.state.detail.addressList}
                                        rows={3}
                                        placeholder={i18next.t('component.storefront.customization.info.address.placeholder')}
                                        onChange={this.onEnableSaveBtn}
                                    />
                                </PrivateComponent>
                                <Label for={'addressList'} className="gs-frm-control__title">
                                    <GSTrans t={'page.setting.storeInformation.openingHours'}/>
                                    <GSTooltip message={i18next.t('page.setting.storeInformation.openingHours.hint')}/>
                                </Label>
                                <PrivateComponent wrapperDisplay={"block"} hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0290]}>
                                    <AvField
                                        name={'openingHours'}
                                        type={'textarea'}
                                        value={this.state.detail.openingHours}
                                        rows={3}
                                        onChange={this.onEnableSaveBtn}
                                        validate={{
                                            ...FormValidate.maxLength(500)
                                        }}
                                    />
                                </PrivateComponent>
                            </UikWidgetContent>
                        </UikWidget>
                        {/*Term policy*/}
                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                <Trans >Term of use and Privacy policy</Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className={'widget__content '}>
                                <AvField
                                    name={Constants.StoreUrlType.POLICY_PAGE}
                                    type={'textarea'}
                                    defaultValue={this.state.detail.urls.policy_page.url}
                                    rows={1}
                                    onChange={(event)=>this.setState({
                                        detail: update(this.state.detail, {urls: {policy_page: {url: {
                                            $set: event.currentTarget.value}}}})
                                    })}
                                    validate={{
                                        pattern: {
                                            value: '/(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)/g',
                                            errorMessage: i18next.t('common.validation.invalid.url')
                                        },
                                        required: {
                                            value: false,
                                            errorMessage: i18next.t('common.validation.required')
                                        }
                                    }}
                                />
                            </UikWidgetContent>
                        </UikWidget>
                        <UikWidget className={"gs-widget "}>
                            <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                                <Trans i18nKey="component.storefront.customization.info.social.channel">Social Channels</Trans>
                            </UikWidgetHeader>
                            <PrivateComponent wrapperDisplay={"block"}
                                              hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0291]}
                            >
                                <UikWidgetContent className={'widget__content '}>

                                    <SocialRow faIcon={faFacebookSquare}  faColor={'blue'} faSize={'3x'}
                                               name={Constants.URL_TYPE_FACEBOOK} value={this.state.detail.urls.facebook.url}
                                               onBlur={this.onInputUrlBlur}
                                               onChange={this.onEnableSaveBtn}
                                               title={i18next.t('component.storefront.customization.info.facebook.link')}
                                    />
                                    <SocialRow faIcon={faInstagram}  faColor={'#C13584'} faSize={'3x'}
                                               name={Constants.URL_TYPE_INSTAGRAM} value={this.state.detail.urls.instagram.url}
                                               onBlur={this.onInputUrlBlur}
                                               onChange={this.onEnableSaveBtn}
                                               title={i18next.t('component.storefront.customization.info.instagram.link')}/>
                                    <SocialRow faIcon={faYoutubeSquare}  faColor={'red'} faSize={'3x'}
                                               name={Constants.URL_TYPE_YOUTUBE_VIDEO} value={this.state.detail.urls.youtube.url}
                                               onBlur={this.onInputUrlBlur}
                                               onChange={this.onEnableSaveBtn}
                                               extendPattern={Constants.YOUTUBE_URL_PATTERN}
                                               title={i18next.t('component.storefront.customization.info.youtube.link')}/>


                                </UikWidgetContent>
                            </PrivateComponent>

                        </UikWidget>
                        {/*SEO*/}
                        <SEOEditor isShowUrl={false} defaultValue={{
                            seoUrl: CredentialUtils.getStoreUrl() + '.' + AgencyService.getStorefrontDomain(),
                            seoKeywords: this.state.seo.seoKeywords,
                            seoDescription: this.state.seo.seoDescription,
                            seoTitle: this.state.seo.seoTitle
                        }}
                                   assignDefaultValue={false}
                        />

                        {/*MINISTRY*/}
                        <GSWidget className={this.state.ministry.banned? 'gs-atm--disable':''}>
                            <PrivateComponent
                                wrapperDisplay={"block"}
                                hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                            >
                                <GSWidgetHeader>
                                    <GSTrans t="page.setting.storeInformation.ministry.title"/>
                                </GSWidgetHeader>
                                <GSWidgetContent className="listing__website p-3 ">
                                    <MinistrySetting title={i18next.t('page.setting.storeInformation.ministry.noticeLogo')}
                                                     subTitle={i18next.t('page.setting.storeInformation.ministry.noticeLogoTitle')}
                                                     description={i18next.t('page.setting.storeInformation.ministry.noticeLogoDescription')}
                                                     logoSrc={'/assets/images/logo-sale-noti.png'}
                                                     defaultEnable={this.state.ministry.noticeEnabled}
                                                     defaultUrl={this.state.ministry.noticeUrl}
                                                     namePrefix="notice"
                                    />
                                    <MinistrySetting title={i18next.t('page.setting.storeInformation.ministry.registeredLogo')}
                                                     subTitle={i18next.t('page.setting.storeInformation.ministry.registeredLogoTitle')}
                                                     description={i18next.t('page.setting.storeInformation.ministry.registeredLogoDescription')}
                                                     logoSrc={'/assets/images/logo-ccdv.png'}
                                                     defaultEnable={this.state.ministry.registeredEnabled}
                                                     defaultUrl={this.state.ministry.registeredUrl}
                                                     namePrefix="registered"
                                    />
                                </GSWidgetContent>
                            </PrivateComponent>
                        </GSWidget>
                    </AvForm>
                </GSContentBody>
            </GSContentContainer>
        );
    }
}

const MinistrySetting = props => {
    const [stChecked, setStChecked] = useState(props.defaultEnable);

    const checkedChange = (checked) => {
        setStChecked(checked)
    }

    return (
        <>
            <div className="listing__website-wrapper mb-3">
                <div className="listing__website-header d-flex flex-column justify-content-center">
                    <div className="d-flex justify-content-md-between align-items-center">
                        <div className="d-flex align-items-center">
                            {props.title && <h3 className="mb-0 ml-2">{props.title}</h3>}
                            <h3 className="color-gray mb-0 ml-3 font-size-_8rem" >{props.subTitle}</h3>
                        </div>
                        <AvFieldToggle name={`${props.namePrefix}Enabled`} className="mb-0"
                                       checked={stChecked}
                                       onChange={checkedChange}
                        />
                    </div>
                    {
                    <div hidden={!stChecked}>
                        <hr/>
                        <div className="row">
                            <div className="col-12 col-md-3 d-flex justify-content-center align-items-center">
                                <img src={props.logoSrc} className="w-100 pb-3" alt="logo"/>
                            </div>
                            <div className="col-12 col-md-9">
                                <p>
                                    {props.description}
                                </p>
                            </div>
                        </div>
                        <div className="px-0 px-md-3">
                            <AvField name={`${props.namePrefix}Url`}
                                     validate={{
                                         ...FormValidate.withCondition(stChecked, FormValidate.required()),
                                         ...FormValidate.maxLength(300),
                                         ...FormValidate.withCondition(stChecked, FormValidate.pattern.custom(/^(http:\/\/online.gov.vn\/Home\/WebDetails\/)([^ \/]*?)+$/, 'page.setting.storeInformation.ministry.invalidUrl'))
                                     }}
                                     defaultValue={props.defaultUrl}
                                     placeholder="http://online.gov.vn/Home/WebDetails/xxxx"
                            />
                        </div>

                    </div>
                    }
                </div>
            </div>
        </>
    )
}

export default connect()(StoreInfo);
