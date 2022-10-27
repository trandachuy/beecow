import React, {Component, useRef} from 'react';
import './ListingWebsite.sass'
import {UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader, UikCheckbox} from "../../../@uik";
import {Trans} from "react-i18next";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import storeService from "../../../services/StoreService";
import i18next from "i18next";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import Constants from "../../../config/Constant";
import {AvForm, AvField} from 'availity-reactstrap-validation';
import {Col, Row} from "reactstrap";
import GSButton from "../../../components/shared/GSButton/GSButton";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {SettingContext} from "../Setting";
import {GSToast} from "../../../utils/gs-toast";
import {FormValidate} from "../../../config/form-validate";
import {ValidateUtils} from "../../../utils/validate";
import GSTooltip, {GSTooltipIcon} from "../../../components/shared/GSTooltip/GSTooltip";
import {TokenUtils} from "../../../utils/token";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";

class ListingWebsite extends Component {
    state = {
        contactSetting: {
            [Constants.ListingWebsite.PRODUCT]: {
                zalo: '',
                zaloEnabled: false,
                mail: '',
                mailEnabled: false,
                phone: '',
                phoneEnabled: false,
                isEnabled: false,
                valid: true
            },
            [Constants.ListingWebsite.SERVICE]: {
                zalo: '',
                zaloEnabled: false,
                mail: '',
                mailEnabled: false,
                phone: '',
                phoneEnabled: false,
                isEnabled: false,
                valid: true
            }
        },
        oldContactSetting: {},
        isSaving : false
    }
    constructor(props) {
        super(props);
        this.onChangeEnabled = this.onChangeEnabled.bind(this);
        this.onChangeAvInput = this.onChangeAvInput.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onChangeAvFieldEnabled = this.onChangeAvFieldEnabled.bind(this);
        this.transfersParamReq = this.transfersParamReq.bind(this);
        this.initFetch = this.initFetch.bind(this);
        this.checkEnableListingWithContact = this.checkEnableListingWithContact.bind(this);
        this.checkFieldAllEmptyWithEnableListing = this.checkFieldAllEmptyWithEnableListing.bind(this);
        this.setOldContactSetting = this.setOldContactSetting.bind(this);

        this.refForm = React.createRef()
    }

    componentDidMount() {
        this.initFetch();
    }

    componentWillUnmount() {

    }

    initFetch(){
        storeService.getStoreListingWebsite()
        .then(result => {
            this.setState(state => ({
                contactSetting: {
                    ...state.contactSetting,
                    [Constants.ListingWebsite.PRODUCT]: {
                        zalo: result.zaloProduct,
                        zaloEnabled: result.enabledZaloProduct,
                        mail: result.emailProduct,
                        mailEnabled: result.enabledEmailProduct,
                        phone: result.phoneProduct,
                        phoneEnabled:result.enabledPhoneProduct,
                        isEnabled: result.enabledProduct,
                        valid: true,
                    },
                    [Constants.ListingWebsite.SERVICE]: {
                        zalo: result.zaloService,
                        zaloEnabled: result.enabledZaloService,
                        mail: result.emailService,
                        mailEnabled: result.enabledEmailService,
                        phone: result.phoneService,
                        phoneEnabled:result.enabledPhoneService,
                        isEnabled: result.enabledService,
                        valid: true,
                    }
                }
            }), () => {
                this.setOldContactSetting()
            });
        })
        .catch(()=>{
            GSToast.commonError()
        })
    }

    setOldContactSetting () {
        this.setState(state => ({
            ...state,
            oldContactSetting: state.contactSetting
        }));
    }

    async onSave() {
        if (this.checkEnableListingWithContact()) {
            this.setState({
                isSaving: true
             });
             let data = this.transfersParamReq(this.state.contactSetting)
             storeService.updateStoreListingWebsite(data).then(() => {
                    this.setState({
                        isSaving: false
                    });
                    GSToast.success('common.message.update.successfully', true);
                }, () => {
                }).catch(() => {
                    this.setState({
                        isSaving: false
                    })
                    GSToast.commonError()
                });
        }
    }

    checkEnableListingWithContact(){
        let valid = true;
        if(!this.checkFieldAllEmptyWithEnableListing(Constants.ListingWebsite.PRODUCT)) {
            valid = false;
        }
        if (!this.checkFieldAllEmptyWithEnableListing(Constants.ListingWebsite.SERVICE)) {
            valid = false;
        }
        return valid;
    }

    checkFieldAllEmptyWithEnableListing(provider) {
        let listing = this.state.contactSetting[provider];
        if (listing.isEnabled) {
            if ((listing.phoneEnabled && listing.phone != '') || (listing.zaloEnabled && listing.zalo != '')
            || (listing.mailEnabled && listing.mail != '')) {
                return true;
            } else {
                this.setState(state => ({
                    contactSetting: {
                        ...state.contactSetting,
                        [provider]: {
                            ...state.contactSetting[provider],
                            valid: false
                        }
                    }
                }))
                return false;
            }
        }
        return true;
    }

    onChangeEnabled(checked, provider) {
        if (!checked) {
            this.setState(state => ({
                contactSetting: {
                    ...state.contactSetting,
                    [provider]: {
                        ...state.oldContactSetting[provider],
                        valid: true,
                        isEnabled: checked
                    }
                }
            }))
        } else {
            this.setState(state => ({
                contactSetting: {
                    ...state.contactSetting,
                    [provider]: {
                        ...state.contactSetting[provider],
                        valid: true,
                        isEnabled: checked
                    }
                }
            }))
        }
    }

    onChangeAvFieldEnabled(checked, provider, field) {
        this.setState(state => ({
            contactSetting: {
                ...state.contactSetting,
                [provider]: {
                    ...state.contactSetting[provider],
                    valid: true,
                    [field]: checked
                }
            }
        }))
    }

    onChangeAvInput(value, provider, field) {
        this.setState(state => ({
            contactSetting: {
                ...state.contactSetting,
                [provider]: {
                    ...state.contactSetting[provider],
                    valid: true,
                    [field]: value
                }
            }
        }))
    }

    transfersParamReq(contactSetting) {
        let data = {};

        let product = contactSetting[Constants.ListingWebsite.PRODUCT];
        let service = contactSetting[Constants.ListingWebsite.SERVICE];
        data.enabledProduct= product.isEnabled;
        data.enabledService= service.isEnabled;

        data.enabledEmailProduct = product.mailEnabled;
        data.emailProduct = product.mail;
        data.enabledPhoneProduct = product.phoneEnabled;
        data.phoneProduct= product.phone;
        data.enabledZaloProduct = product.zaloEnabled;
        data.zaloProduct = product.zalo;

        data.emailService = service.mail;
        data.enabledEmailService = service.mailEnabled;
        data.phoneService = service.phone;
        data.enabledPhoneService = service.phoneEnabled;
        data.zaloService = service.zalo;
        data.enabledZaloService = service.zaloEnabled;
        return data;
    }

    render() {
        const isAllowEdit = TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0312]);
        return (
            <>
                <GSContentContainer className="listing__website" isSaving={this.state.isSaving}>
                    <AvForm style={{
                        width: '100%'
                    }} onValidSubmit= {this.onSave} ref={ref => this.refForm = ref}>
                    <UikWidget className="gs-widget">
                        <UikWidgetHeader className="gs-widget__header">
                            <Trans i18nKey="page.setting.shippingAndPayment.listingwebsite">
                                Listing Website
                            </Trans>
                        </UikWidgetHeader>
                        <UikWidgetContent className="gs-widget__content">
                            <div className="setting__listing_website">
                                    <ContactSetting
                                        title = {i18next.t('page.setting.listingwebsite.title.product')}
                                        data={this.state.contactSetting[Constants.ListingWebsite.PRODUCT]}
                                        isAllowEdit={isAllowEdit}
                                        name = {Constants.ListingWebsite.PRODUCT}
                                        onChangeEnable={this.onChangeEnabled}
                                        onChangeAvInput= {this.onChangeAvInput}
                                        onChangeAvFieldEnabled = {this.onChangeAvFieldEnabled}
                                        errorMessage={i18next.t('page.setting.listingwebsite.message.error')}
                                        hintText={i18next.t('page.setting.listingwebsite.hinttext.product')}
                                    />
                                    <ContactSetting
                                      title = {i18next.t('page.setting.listingwebsite.title.service')}
                                      data={this.state.contactSetting[Constants.ListingWebsite.SERVICE]}
                                      isAllowEdit={isAllowEdit}
                                      name = {Constants.ListingWebsite.SERVICE}
                                      onChangeEnable={this.onChangeEnabled}
                                      onChangeAvInput={this.onChangeAvInput}
                                      onChangeAvFieldEnabled = {this.onChangeAvFieldEnabled}
                                      errorMessage={i18next.t('page.setting.listingwebsite.message.error')}
                                      hintText={i18next.t('page.setting.listingwebsite.hinttext.service')}
                                    />
                            </div>
                        </UikWidgetContent>
                            <div className="uik-widget-content__wrapper gs-widget__content">
                                    <GSButton primary disabled={!isAllowEdit} onClick={e => {
                                        e.preventDefault()
                                        this.refForm.submit()
                                    }}>
                                        <GSTrans t="common.btn.save"/>
                                    </GSButton>
                            </div>
                    </UikWidget>
                </AvForm>
            </GSContentContainer>
            </>
        )
    }
}
const ContactSetting = props => {
    const onChangeEnable = (checked) => {
            props.onChangeEnable(checked, props.name)
    }

    const onChangeAvInput = (value, field) => {
        props.onChangeAvInput(value, props.name, field)
    }

    const onChangeAvFieldEnabled = (checked, field) => {
        props.onChangeAvFieldEnabled(checked, props.name, field)
    }
    const phoneValidate = (value, ctx, input, cb) => {
        ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
    }

    return (
        <>
                <div className="listing__website-wrapper mb-3">
                    <div className="listing__website-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            {props.title && <h3 className="mb-0 ml-2">{props.title}</h3>}
                            <GSTooltip message={props.hintText} icon={GSTooltipIcon.INFO_CIRCLE}/>
                        </div>
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0312]}>
                            <div onClick={() => onChangeEnable(!props.data.isEnabled)}>
                                <UikToggle
                                    defaultChecked={props.data.isEnabled}
                                    className="m-0 p-0"
                                    key={props.data.isEnabled}
                                    onClick={(e) => e.preventDefault()}
                                    disabled={!props.isAllowEdit}
                                    />
                            </div>
                        </PrivateComponent>
                    </div>
                    <div className="listing__website-body" hidden={!props.data.isEnabled}>
                        <Col md={12}>
                            <Row>
                                <Col md={5}>
                                <UikCheckbox
                                    defaultChecked = {props.data.phoneEnabled}
                                    id={'phone-number-'+props.name}
                                    className="uik-checkbox__label green"
                                    onChange = {e => onChangeAvFieldEnabled(e.target.checked,'phoneEnabled')}
                                    label={
                                        <>
                                        <span className="check-box-wrapper__label">{i18next.t('page.setting.listingwebsite.phone')}</span>
                                        </>
                                    }
                                    key={'phone-number-'+props.data.phoneEnabled}
                                    name={'phone-number-'+props.name}
                                />
                                </Col>
                                <Col md={7}>
                                 <AvField
                                 placeholder={i18next.t('page.setting.listingwebsite.placeholder.phone')}
                                 validate={{
                                    ...FormValidate.maxLength(1_000_000, false),
                                    ...FormValidate.pattern.numberOrEnter(),
                                    async: phoneValidate,
                                    required: {value: props.data.phoneEnabled,
                                        errorMessage: i18next.t("common.validation.required")},

                                }}
                                 disabled = {!props.data.phoneEnabled}
                                 name={props.name + 'phone'}
                                 value={props.data.phone}
                                 onChange={e => onChangeAvInput(e.target.value, 'phone')}/>

                                </Col>
                            </Row>
                            <Row>
                                <Col md={5}>
                                <UikCheckbox
                                    defaultChecked = {props.data.zaloEnabled}
                                    id={'zalo-'+props.name}
                                    className="uik-checkbox__label green"
                                    onChange = {e => onChangeAvFieldEnabled(e.target.checked,'zaloEnabled')}
                                    label={
                                        <>
                                         <span className="check-box-wrapper__label">{i18next.t('page.setting.listingwebsite.zalo')}</span>
                                        </>
                                    }
                                    key={'zalo-'+props.data.zaloEnabled}
                                    name={'zalo-'+props.name}
                                />
                                </Col>
                                <Col md={7}>
                                 <AvField
                                 placeholder={i18next.t('page.setting.listingwebsite.placeholder.zalo')}
                                 validate={{
                                    ...FormValidate.maxLength(1_000_000, false),
                                    ...FormValidate.pattern.numberOrEnter(),
                                    async: phoneValidate,
                                    required: {value: props.data.zaloEnabled,
                                        errorMessage: i18next.t("common.validation.required")},
                                }}
                                  disabled = {!props.data.zaloEnabled}
                                 name={props.name + 'zalo'}
                                 value={props.data.zalo}
                                 onChange={e => onChangeAvInput(e.target.value, 'zalo')}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={5}>
                                <UikCheckbox
                                     defaultChecked = {props.data.mailEnabled}
                                    id={'mail-'+props.name}
                                    className="uik-checkbox__label green"
                                    onChange = {e => onChangeAvFieldEnabled(e.target.checked,'mailEnabled')}
                                    label={
                                        <>
                                          <span className="check-box-wrapper__label">{i18next.t('page.setting.listingwebsite.email')}</span>
                                        </>
                                    }
                                    key = {'mail-'+props.data.mailEnabled}
                                    name = {'mail-'+props.name}
                                />
                                </Col>
                                <Col md={7}>
                                 <AvField
                                 placeholder={i18next.t('page.setting.listingwebsite.placeholder.mail')}
                                 validate={{
                                    ...FormValidate.email(),
                                    ...FormValidate.maxLength(100),
                                    required: {value: props.data.mailEnabled,
                                        errorMessage: i18next.t("common.validation.required")},
                                 }}
                                 disabled = {!props.data.mailEnabled}
                                  name={props.name + 'mail'} value={props.data.mail}
                                 onChange={e => onChangeAvInput(e.target.value, 'mail')}/>
                                </Col>
                            </Row>

                        </Col>

                    </div>
                    <div className="text-danger center" hidden={props.data.valid}>{props.errorMessage}</div>
                </div>
        </>
    )
}

const WithContext = (Component) => {
    return (props) => (
        <SettingContext.Consumer>
            {value =>  <Component {...props} value={value} />}
        </SettingContext.Consumer>
    )
}

export default WithContext(ListingWebsite);

