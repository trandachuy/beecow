import React, {Component, useRef} from 'react';
import './ShippingProvider.sass'
import {UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import {Trans} from "react-i18next";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import storeService from "../../../services/StoreService";
import catalogService from "../../../services/CatalogService";
import GSSelect from "../../../components/shared/form/GSSelect/GSSelect";
import i18next from "i18next";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import Constants from "../../../config/Constant";
import PropTypes from 'prop-types';
import {AvForm} from 'availity-reactstrap-validation';
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {CurrencySymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import GSButton from "../../../components/shared/GSButton/GSButton";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {SettingContext} from "../Setting";
import {GSToast} from "../../../utils/gs-toast";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import {CredentialUtils} from "../../../utils/credential";
import {BCOrderService} from "../../../services/BCOrderService";
import {FormValidate} from "../../../config/form-validate";
import * as _ from "lodash";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {TokenUtils} from "../../../utils/token";
import SelfDeliveryProviderSetting from "./SelfDeliveryConfiguration/SelfDeliveryProviderSetting";
import {SHIPPING_AND_PAYMENT_PAGE} from "../ShippingAndPayment/ShippingAndPayment";
import {CurrencyUtils} from "../../../utils/number-format";


const initSProviderSetting = {
    [Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM]: {
        cities: [],
        isEnabled: false,
        id: undefined,
        valid: true
    },
    [Constants.LogisticCode.Common.GIAO_HANG_NHANH]: {
        cities: [],
        isEnabled: false,
        id: undefined,
        valid: true
    },
    // [Constants.LogisticCode.Common.VNPOST]: {
    //     cities: [],
    //     isEnabled: false,
    //     id: undefined,
    //     valid: true
    // },
    [Constants.LogisticCode.Common.AHAMOVE]: {
        cities: [],
        isEnabled: false,
        id: undefined,
        valid: true
    }
}

const COUNTRY_CODE = 'VN'
class ShippingProvider extends Component {
    state = {
        cities: [],
        isFetching: true,
        isSaving: false,
        isShowShipping :true,
        providerSetting: initSProviderSetting,
        selfDeliverySetting: null
    }

    constructor(props) {
        super(props);
        this.fetchThirdPartyProvider = this.fetchThirdPartyProvider.bind(this);
        this.fetchSelfDeliverySetting = this.fetchSelfDeliverySetting.bind(this);
        this.onChangeSupportedProvinces = this.onChangeSupportedProvinces.bind(this);
        this.onChangeEnabled = this.onChangeEnabled.bind(this);
        this.onSave = this.onSave.bind(this);
        this.resetState = this.resetState.bind(this);
        this.createRequest = this.createRequest.bind(this);
        this.onChangeShippingFeeInsideCity = this.onChangeShippingFeeInsideCity.bind(this);
        this.onChangeShippingFeeOutsideCity = this.onChangeShippingFeeOutsideCity.bind(this);
        this.onChangeSelfDeliveryEnabled = this.onChangeSelfDeliveryEnabled.bind(this);
        this.onClickConfiguration = this.onClickConfiguration.bind(this);
        this.fetchFullStoreBranches = this.fetchFullStoreBranches.bind(this);
    }

    componentDidMount() {
        this.fetchThirdPartyProvider()
        this.fetchSelfDeliverySetting()
        this.fetchFullStoreBranches()
    }

    componentWillUnmount() {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }



    resetState(callback) {
        this.setState(state => ({
                providerSetting: initSProviderSetting
        }), () => {
            callback()
        })
    }

    fetchSelfDeliverySetting() {
        storeService.getSelfDeliverySetting()
            .then(setting => {
                this.setState(state => ({
                    selfDeliverySetting: {
                        ...setting,
                        enabled: this.props.defaultEnabledSelfDelivery || setting.enabled
                    }
                }))
            })
    }
    
    fetchFullStoreBranches() {
        storeService.getFullStoreBranches(0, 9999)
            .then(storeBranche => {
                if(CredentialUtils.getStoreCurrencySymbol() === Constants.CURRENCY.VND.SYMBOL){
                    if(storeBranche.data.filter(b=> b.countryCode === Constants.CountryCode.VIETNAM).length > 0){
                        this.setState({
                            isShowShipping: true
                        })
                    }else {
                        this.setState({
                            isShowShipping: false
                        })
                    }
                }else {
                    this.setState({
                        isShowShipping: false
                    })
                }
            })
    }

    fetchThirdPartyProvider() {
        const createCityOptions = (cities, cityCodeList, cityExcludeCode) => {
            if (cityExcludeCode && cityExcludeCode.length > 0) {
                return cities.filter(city => !cityExcludeCode.includes(city.value))
            }
            if (cityCodeList && cityCodeList.length > 0) {
                return cities.filter(city => cityCodeList.includes(city.value))
            }
            return cities
        }

        catalogService.getCitesOfCountry(COUNTRY_CODE)
            .then( cities => {
                storeService.getDeliveryProvider(false)
                    .then(result => {
                        this.setState(state => ({
                            ...state,
                            selfDeliveryList: result.filter(r => r.providerName === Constants.LogisticCode.Common.SELF_DELIVERY)
                        }))
                        const currentLang = i18next.language
                        const cityOptions = cities.map(city => {
                            return {
                                value: city.code,
                                label: currentLang === 'vi'? city.inCountry:city.outCountry
                            }
                        })

                        BCOrderService.getShippingProvider()
                            .then(orderShippingProviders => {

                                if (result.length > 0) {
                                    // for legacy provider
                                    for (const provider of result.filter(p => p.providerName !== Constants.LogisticCode.Common.SELF_DELIVERY)) {
                                        const orderShippingSetting = orderShippingProviders.filter(p => p.providerName === provider.providerName)[0];
                                        this.setState(state => ({
                                            providerSetting: {
                                                ...state.providerSetting,
                                                [provider.providerName]: {
                                                    cities: createCityOptions(cityOptions, provider.allowedLocations, orderShippingSetting? orderShippingSetting.excludedLocationCodes:undefined),
                                                    isEnabled: true,
                                                    id: provider.id,
                                                    valid: true,
                                                    shippingFeeInsideCity: provider.shippingFeeInsideCity,
                                                    shippingFeeOutsideCity: provider.shippingFeeOutsideCity,
                                                    allowedLocations: provider.allowedLocations,
                                                    allowedCountryCodeList: orderShippingProviders.allowedCountryCodeList
                                                },
                                            }
                                        }));
                                    }

                                }

                                this.setState({
                                    providers: result,
                                    isFetching: false,
                                    cities: cityOptions
                                })
                            })
                    })
            })
    }


    async onSave() {

        // remove all the validation first
        this.setState(state => ({
            providerSetting: {
                ...state.providerSetting,
                [Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM]: {...state.providerSetting[Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM], valid: true},
                [Constants.LogisticCode.Common.GIAO_HANG_NHANH]: {...state.providerSetting[Constants.LogisticCode.Common.GIAO_HANG_NHANH], valid: true},
                // [Constants.LogisticCode.Common.VNPOST]: {...state.providerSetting[Constants.LogisticCode.Common.VNPOST], valid: true},
                [Constants.LogisticCode.Common.AHAMOVE]: {...state.providerSetting[Constants.LogisticCode.Common.AHAMOVE], valid: true},
            }
        }))

        // validate
        const providerNameList = Object.keys(this.state.providerSetting);
        const enableProviderList = providerNameList.filter(providerName => {
            return this.state.providerSetting[providerName].isEnabled
        })

        const removedAhamoveTruck = enableProviderList.filter(p => p !== Constants.LogisticCode.Common.AHAMOVE_TRUCK)


        if (removedAhamoveTruck.length === 0 && !this.state.selfDeliverySetting.enabled) {
            this.alertModalRef.openModal({
                type: AlertModalType.ALERT_TYPE_WARNING,
                messages: i18next.t('page.setting.shippingAndPayment.enableAtLeastOneShippingProvider')
            })
            return;
        }
        // check cities list of all providers but ignore disabled providers
        let valid = true;
        for (const providerName of providerNameList.filter(p => !p.includes(Constants.LogisticCode.Common.SELF_DELIVERY))) {
            const providerSettingValue = this.state.providerSetting[providerName]
            if (!providerSettingValue.isEnabled) continue
            if (providerSettingValue.cities.length === 0) {
                valid &= false
                this.setState(state => ({
                        providerSetting: {
                            ...state.providerSetting,
                            [providerName]: {
                                ...state.providerSetting[providerName],
                                valid: false
                            }
                        }
                    })
                )
            }
        }

        if (!valid) return;

        BCOrderService.getPaymentSetting().then(result => {
            let paymentMethods = [...Constants.DEFAULT_PAYMENT_METHOD];
            if (result && !_.isEmpty(result.paymentCode)) {
                paymentMethods = result.paymentCode.split(",");
            }
            const request = this.createRequest(providerNameList);
            if (request.deliveryDTOList.filter(x => x.enabled && x.providerName.includes(Constants.LogisticCode.Common.SELF_DELIVERY)).length <= 0
                && paymentMethods.length === 1
                && paymentMethods[0] === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER) {
                this.alertModalRef.openModal({
                    type: AlertModalType.ALERT_TYPE_WARNING,
                    messages: i18next.t('page.setting.shippingAndPayment.turn.off.selfDelivery.bankTransfer')
                });
                return;
            }

            // save
            this.setState({
                isSaving: true
            })


            const saveThirdPartyProviderPromise = TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0192])?
                storeService.updateDeliveryProviderList(request): Promise.resolve();
            const saveSelfDeliveryProviderPromise = storeService.updateSelfDeliverySetting(this.state.selfDeliverySetting)

            Promise.all([saveThirdPartyProviderPromise, saveSelfDeliveryProviderPromise])
                .then(([thirdPartyResponse, selfDeliveryResponse]) => {
                        this.fetchThirdPartyProvider()
                        GSToast.commonUpdate();
                        BCOrderService.savePaymentSetting({paymentCode: paymentMethods.join(",")})
                            .then(() => {
                                this.props.value.setResetPaymentMethods(true);
                            })
                            .catch((e) => {
                                if (e.response.data.message === 'error.accessDenied'){
                                    GSToast.error('page.setting.error.youDontPermissionFeature',true)
                                    return
                                }
                                GSToast.commonError();
                            })
                })
                .catch((e) => {
                    GSToast.commonError(e)
                })
                .finally(() => {
                    this.setState({
                        isSaving: false
                    })
                })
        })
    }

    createRequest(providerNameList) {
        // use ahamove_bike for bike and truck
        const ahamove = this.state.providerSetting[Constants.LogisticCode.Common.AHAMOVE];
        const ahamoveLocation = ahamove.cities.length === this.state.cities.length? undefined:ahamove.cities.map(city => city.value ).join(',')

        let deliveryDTOList = []
        for (const providerName of providerNameList) {
            const providerSettingValue = this.state.providerSetting[providerName]
            const location = providerSettingValue.cities.length === this.state.cities.length? undefined:providerSettingValue.cities.map(city => city.value ).join(',')
            
            // ahamove_bike
            if(providerName === Constants.LogisticCode.Common.AHAMOVE || providerName === Constants.LogisticCode.Common.AHAMOVE_TRUCK){
                
                if(providerName === Constants.LogisticCode.Common.AHAMOVE && !providerSettingValue.id){
                    // in case new -> add the ahamove truck and bike
                    deliveryDTOList.push({
                        allowedLocationCodes: ahamoveLocation,
                        providerName: Constants.LogisticCode.Common.AHAMOVE,
                        enabled: providerSettingValue.isEnabled,
                        shippingFeeInsideCity: providerSettingValue.shippingFeeInsideCity,
                        shippingFeeOutsideCity: providerSettingValue.shippingFeeOutsideCity
                    });

                    deliveryDTOList.push({
                        allowedLocationCodes: ahamoveLocation,
                        providerName: Constants.LogisticCode.Common.AHAMOVE_TRUCK,
                        enabled: providerSettingValue.isEnabled,
                        shippingFeeInsideCity: providerSettingValue.shippingFeeInsideCity,
                        shippingFeeOutsideCity: providerSettingValue.shippingFeeOutsideCity
                    });
                }else if(providerSettingValue.id){
                    // in case edit --> normal case but ahamove location
                    deliveryDTOList.push({
                        allowedLocationCodes: ahamoveLocation,
                        providerName: providerName,
                        id: providerSettingValue.id,
                        enabled: providerSettingValue.isEnabled,
                        shippingFeeInsideCity: providerSettingValue.shippingFeeInsideCity,
                        shippingFeeOutsideCity: providerSettingValue.shippingFeeOutsideCity
                    })
                }

            }else{
                deliveryDTOList.push({
                    allowedLocationCodes: location,
                    providerName: providerName,
                    id: providerSettingValue.id,
                    enabled: providerSettingValue.isEnabled,
                    shippingFeeInsideCity: providerSettingValue.shippingFeeInsideCity,
                    shippingFeeOutsideCity: providerSettingValue.shippingFeeOutsideCity
                })
            }
            
            

            if(providerName === Constants.LogisticCode.Common.AHAMOVE && !providerSettingValue.id){
                // in case new
                deliveryDTOList.push({
                    allowedLocationCodes: ahamoveLocation,
                    providerName: Constants.LogisticCode.Common.AHAMOVE_TRUCK,
                    enabled: providerSettingValue.isEnabled,
                    shippingFeeInsideCity: providerSettingValue.shippingFeeInsideCity,
                    shippingFeeOutsideCity: providerSettingValue.shippingFeeOutsideCity
                });
            }

            this.setState(state => ({
                    providerSetting: {
                        ...state.providerSetting,
                        [providerName]: {
                            ...state.providerSetting[providerName],
                            valid: true,
                            id: undefined
                        }
                    }
                })
            )
        }

        deliveryDTOList = deliveryDTOList.filter((provider) => {
            if(provider.providerName === Constants.LogisticCode.Common.AHAMOVE_TRUCK && !provider.allowedLocationCodes){
                return false;
            }
            return true;
        });

        // filter ahave-move list again
        const ahaList = deliveryDTOList.filter(provider => provider.providerName === Constants.LogisticCode.Common.AHAMOVE)

        if(ahaList && ahaList.length > 0){
            const ahaveBikeState = ahaList[0].enabled;

            deliveryDTOList.forEach(provider => {
                if(provider.providerName === Constants.LogisticCode.Common.AHAMOVE_TRUCK){
                    provider.enabled = ahaveBikeState;
                }
            });
        }

        // result
        return {
            deliveryDTOList: deliveryDTOList,
            storeId: CredentialUtils.getStoreId()
        }
    }


    onChangeSupportedProvinces(provinces, provider) {
        this.setState(state => ({
            providerSetting: {
                ...state.providerSetting,
                [provider]: {
                    ...state.providerSetting[provider],
                    cities: provinces
                }
            }
        }))
    }

    onChangeEnabled(checked, provider) {
        this.setState(state => ({
            providerSetting: {
                ...state.providerSetting,
                [provider]: {
                    ...state.providerSetting[provider],
                    isEnabled: checked
                }
            }
        }))
    }


    onChangeSelfDeliveryEnabled(checked) {
        this.setState(state => ({
            selfDeliverySetting: {
                ...state.selfDeliverySetting,
                enabled: checked
            }
        }))
    }

    onChangeShippingFeeInsideCity(fee, provider) {
        this.setState(state => ({
            providerSetting: {
                ...state.providerSetting,
                [provider]: {
                    ...state.providerSetting[provider],
                    shippingFeeInsideCity: fee
                }
            }
        }))
    }

    onChangeShippingFeeOutsideCity(fee, provider) {
        this.setState(state => ({
            providerSetting: {
                ...state.providerSetting,
                [provider]: {
                    ...state.providerSetting[provider],
                    shippingFeeOutsideCity: fee
                }
            }
        }))
    }

    onClickConfiguration() {
        this.props.onChangePage(SHIPPING_AND_PAYMENT_PAGE.SELF_DELIVERY_CONFIG)
    }


    render() {
        return (
            <>
                <AlertModal ref={el => this.alertModalRef = el} />
                <GSContentContainer className="shipping__provider" isSaving={this.state.isSaving}>
                    <AvForm style={{
                        width: '100%'
                    }}>

                    <UikWidget className="gs-widget">
                        <UikWidgetHeader className="gs-widget__header">
                            <Trans i18nKey="page.setting.shippingAndPayment.shipping">
                                Shipping Provider
                            </Trans>
                        </UikWidgetHeader>
                        <UikWidgetContent className="gs-widget__content">
                            <div className="setting__shipping_provider">
                                {this.state.isShowShipping && <>
                                    {/*GIAO HANG TIET KIEM*/}
                                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0192]} wrapperDisplay={"block"}>
                                        <ProviderSetting
                                            img={"/assets/images/delivery/giaohangtietkiem.png"}
                                            name={Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM}
                                            cities={this.state.cities}
                                            dataTemplate={{
                                                showCities: true
                                            }}
                                            data={this.state.providerSetting[Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM]}
                                            onChangeCities={this.onChangeSupportedProvinces}
                                            onChangeEnable={this.onChangeEnabled}
                                        />
                                    </PrivateComponent>

                                    {/*GIAO HANG NHANH*/}
                                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0192]} wrapperDisplay={"block"}>
                                        <ProviderSetting
                                            img={"/assets/images/delivery/giaohangnhanh.png"}
                                            name={Constants.LogisticCode.Common.GIAO_HANG_NHANH}
                                            cities={this.state.cities}
                                            dataTemplate={{
                                                showCities: true
                                            }}
                                            data={this.state.providerSetting[Constants.LogisticCode.Common.GIAO_HANG_NHANH]}
                                            onChangeCities={this.onChangeSupportedProvinces}
                                            onChangeEnable={this.onChangeEnabled}
                                        />
                                    </PrivateComponent>

                                    {/*AHAMOVE*/}
                                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0192]} wrapperDisplay={"block"}>
                                        <ProviderSetting
                                            img={"/assets/images/delivery/ahamove.png"}
                                            name={Constants.LogisticCode.Common.AHAMOVE}
                                            cities={this.state.cities}
                                            dataTemplate={{
                                                showCities: true
                                            }}
                                            allowedCities={[Constants.PROVINCE_CODES.HO_CHI_MINH, Constants.PROVINCE_CODES.HA_NOI]}
                                            data={this.state.providerSetting[Constants.LogisticCode.Common.AHAMOVE]}
                                            onChangeCities={this.onChangeSupportedProvinces}
                                            onChangeEnable={this.onChangeEnabled}
                                        />
                                    </PrivateComponent>
                                </>}

                                {/*VNPOST*/}
                                {/*<PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0192]} wrapperDisplay={"block"}>*/}
                                {/*    <ProviderSetting*/}
                                {/*        img={"/assets/images/delivery/vnpost.png"}*/}
                                {/*        name={Constants.LogisticCode.Common.VNPOST}*/}
                                {/*        cities={this.state.cities}*/}
                                {/*        dataTemplate={{*/}
                                {/*            showCities: true*/}
                                {/*        }}*/}
                                {/*        data={this.state.providerSetting[Constants.LogisticCode.Common.VNPOST]}*/}
                                {/*        onChangeCities={this.onChangeSupportedProvinces}*/}
                                {/*        onChangeEnable={this.onChangeEnabled}*/}
                                {/*    />*/}
                                {/*</PrivateComponent>*/}

                                {/*SELF DELIVERY*/}
                                {this.state.selfDeliverySetting &&
                                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0278]}
                                                   wrapperDisplay={"block"}>
                                    <SelfDeliveryProviderSetting
                                        img={"/assets/images/delivery/icon-self-delivery.svg"}
                                        title={i18next.t("page.setting.shippingAndPayment.selfDelivery")}
                                        name={Constants.LogisticCode.Common.SELF_DELIVERY}
                                        setting={this.state.selfDeliverySetting}
                                        onChangeEnable={this.onChangeSelfDeliveryEnabled}
                                        onConfiguration={this.onClickConfiguration}
                                    />
                                </PrivateComponent>}
                            </div>
                        </UikWidgetContent>
                        <PrivateComponent disabledStyle={"hidden"} hasAnyPackageFeature={[
                            PACKAGE_FEATURE_CODES.FEATURE_0192,
                            PACKAGE_FEATURE_CODES.FEATURE_0278,
                            PACKAGE_FEATURE_CODES.FEATURE_0277,
                        ]}>
                            <div className="uik-widget-content__wrapper gs-widget__content">
                                    <GSButton primary onClick={this.onSave}>
                                        <GSTrans t="common.btn.save"/>
                                    </GSButton>
                            </div>
                        </PrivateComponent>
                    </UikWidget>
                </AvForm>
            </GSContentContainer>
            </>
        )
    }
}

const ProviderSetting = props => {
    const refConfirmModal = useRef(null);

    const onChange = (provinces) => {
        props.onChangeCities(provinces, props.name)
    }

    const onSelectAll = () => {
        props.onChangeCities(getCityOptions(), props.name)
    }

    const onChangeEnable = (checked) => {
        if (!checked) {
            refConfirmModal.current.openModal({
                messages: i18next.t('page.setting.shippingAndPayment.disableProviderConfirm'),
                okCallback: () => {
                    props.onChangeEnable(checked, props.name)
                },
                cancelCallback: () => {

                }
            })
        } else {
            props.onChangeEnable(checked, props.name)
        }
    }

    const onChangeShippingFeeInsideCity = (event) => {
        const fee = event.currentTarget.value
        if (props.onChangeShippingFeeInsideCity) {
            props.onChangeShippingFeeInsideCity(fee, props.name)
        }
    }

    const onChangeShippingFeeOutsideCity = (event) => {
        const fee = event.currentTarget.value
        if (props.onChangeShippingFeeOutsideCity) {
            props.onChangeShippingFeeOutsideCity(fee, props.name)
        }
    }

    const getCityOptions = () => {
        if (props.allowedCities && props.allowedCities.length > 0) {
            return props.cities.filter(ct => props.allowedCities.includes(ct.value))
        }
        return props.cities
    }

    return (
        <>
            <ConfirmModal ref={refConfirmModal}/>
                <div className="shipping__provider-wrapper mb-3" id={'provider-' + props.name}>
                    <div className="shipping__provider-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="shipping__provider-image"
                                 src={props.img}
                                 alt={props.name}
                                 height={props.title? '20':'50'}
                            />
                            {props.title && <h3 className="mb-0 ml-2">{props.title}</h3>}
                        </div>
                        <div onClick={() => onChangeEnable(!props.data.isEnabled)}>
                            <UikToggle
                                defaultChecked={props.data.isEnabled}
                                className="m-0 p-0"
                                key={props.data.isEnabled}
                                onClick={(e) => e.preventDefault()}
                            />
                        </div>

                    </div>
                    <div className="shipping__provider-body" hidden={!props.data.isEnabled}>
                        {/*CITIES SELECTOR*/}
                        {props.dataTemplate.showCities &&
                        <>
                        <span className="gs-frm-control__title">
                             <GSTrans t={'page.setting.shippingAndPayment.supportedProvinces'}/>
                        </span>
                            <GSSelect options={getCityOptions()}
                                      isMulti
                                      isSearchable
                                      className="mt-2 province-selector"
                                      onChange={onChange}
                                      placeholder={i18next.t("page.setting.shippingAndPayment.selectProvincesPlaceholder")}
                                      value={props.data.cities}
                            />
                            <div className="gsa__color--gray mt-2 d-flex justify-content-between">
                                <GSFakeLink onClick={onSelectAll}>
                                    <GSTrans t={'page.setting.shippingAndPayment.selectProvinces.selectAll'}/>
                                </GSFakeLink>
                                <GSTrans t={'page.setting.shippingAndPayment.selectedProvince'} values={{
                                    x: props.data.cities.length,
                                    total: getCityOptions().length
                                }}/>
                            </div>
                            {!props.data.valid &&
                            <div>
                                <AlertInline text={i18next.t('page.setting.shippingAndPayment.selectAtLeast1Province')}
                                             nonIcon
                                             textAlign={"center"}
                                             type={AlertInlineType.ERROR}
                                             className="p-0 mt-2"
                                />
                            </div>}
                        </>
                        }
                        {/*SHOW SHIPPING FEE*/}
                        {props.dataTemplate.showShippingFee &&
                            <>
                                <div className="row mt-3 shipping-fee-wrapper">
                                    <div className="col-12 col-md-6 p-0 pl-md-0 pr-md-4">
                                        <div className="mb-2">
                                        <span className="gs-frm-control__title">
                                            <GSTrans t={'page.setting.shippingAndPayment.shippingFee'}/>
                                        </span>
                                            {' '}
                                            <span className="gs-frm-control__title-extra">
                                            (
                                            <GSTrans t={"page.setting.shippingAndPayment.shippingFee.insideCity"}/>
                                            )
                                        </span>
                                        </div>
                                        <AvFieldCurrency name={props.name + '_shipping-fee-in'}
                                                         unit={CurrencySymbol.VND}
                                                         value={props.data.shippingFeeInsideCity? props.data.shippingFeeInsideCity:0}
                                                         validate={{
                                                             ...FormValidate.maxValue(Constants.VALIDATIONS.SHIPPING.MAX_FEE, true),
                                                             ...FormValidate.minValue(0)
                                                         }}
                                                         onChange={onChangeShippingFeeInsideCity}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 p-0 pr-md-0 pl-md-4">
                                        <div className="mb-2">
                                        <span className="gs-frm-control__title">
                                            <GSTrans t={'page.setting.shippingAndPayment.shippingFee'}/>
                                        </span>
                                            {' '}
                                            <span className="gs-frm-control__title-extra">
                                            (
                                            <GSTrans t={"page.setting.shippingAndPayment.shippingFee.outsideCity"}/>
                                            )
                                        </span>
                                        </div>
                                        <AvFieldCurrency name={props.name + '_shipping-fee-out'}
                                                         unit={CurrencySymbol.VND}
                                                         value={props.data.shippingFeeOutsideCity? props.data.shippingFeeOutsideCity:0}
                                                         validate={{
                                                             ...FormValidate.maxValue(Constants.VALIDATIONS.SHIPPING.MAX_FEE, true),
                                                             ...FormValidate.minValue(0)
                                                         }}
                                                         onChange={onChangeShippingFeeOutsideCity}
                                        />
                                    </div>
                                </div>
                            </>
                        }
                        {/*SHOW CONFIGURATION PAGE*/}
                        {props.dataTemplate.showShippingFee &&
                            <>
                            </>
                        }
                    </div>
                </div>
        </>
    )
}

ProviderSetting.propTypes = {
    img: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.oneOf(Object.values(Constants.LogisticCode.Common)),
    cities: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.any
        }),
    ),
    allowedCities: PropTypes.array,
    dataTemplate: PropTypes.shape({
        showCities: PropTypes.bool,
        showShippingFee: PropTypes.bool,
        showConfigurationModal: PropTypes.bool,
    }),
    data: PropTypes.shape({
        cities: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string,
                value: PropTypes.any
            })
        ),
        isEnabled: PropTypes.bool,
        shippingFeeInsideCity: PropTypes.any,
        shippingFeeOutsideCity: PropTypes.any,
        valid: PropTypes.bool,
    }),
    onChangeCities: PropTypes.func,
    onChangeEnable: PropTypes.func,
    onChangeShippingFeeInsideCity: PropTypes.func,
    onChangeShippingFeeOutsideCity: PropTypes.func,
    onChangePage: PropTypes.func,
    defaultEnabledSelfDelivery: PropTypes.bool,
}

const WithContext = (Component) => {
    return (props) => (
        <SettingContext.Consumer>
            {value =>  <Component {...props} value={value} />}
        </SettingContext.Consumer>
    )
}

export default WithContext(ShippingProvider);

