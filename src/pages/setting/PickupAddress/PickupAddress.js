import React, {Component} from 'react';
import './PickupAddress.sass'
import {UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import {Trans} from "react-i18next";
import {cancelablePromise} from "../../../utils/promise";
import storeService from "../../../services/StoreService";
import authenticate from "../../../services/authenticate";
import catalogService from "../../../services/CatalogService";
import * as _ from 'lodash';
import {Col, FormGroup, Label, Row} from "reactstrap";
import {AvField, AvForm} from "availity-reactstrap-validation";
import i18next from "../../../config/i18n";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {GSToast} from "../../../utils/gs-toast";
import update from "immutability-helper";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {SettingContext} from "../Setting";

class PickupAddress extends Component {

    constructor(props) {
        super(props);

        this.const = {
            DEFAULT_COUNTRY_CODE: "VN"
        };

        this.state = {
            cities: [],
            districts: [],
            wards: [],
            pageAddress: {
                id: null,
                address: '',
                cityCode: '',
                wardCode: '',
                districtCode: '',
                storeId: authenticate.getStoreId()
            },
            isFetching: true
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.initPickupAddress = this.initPickupAddress.bind(this);
        this.changeCity = this.changeCity.bind(this);
        this.changeDistrict = this.changeDistrict.bind(this);
        this.changeWard = this.changeWard.bind(this);
    }

    componentDidMount() {
        this.initPickupAddress();
    }

    initPickupAddress() {
        let getCities = catalogService.getCitesOfCountry(this.const.DEFAULT_COUNTRY_CODE);
        let getStoreInfo = storeService.getStorefrontInfo(authenticate.getStoreId());
        this.pmStoreInfo = cancelablePromise(Promise.all([getCities, getStoreInfo]));
        this.pmStoreInfo.promise.then((result) => {
            this.setState({
                cities: result[0],
                isFetching: false
            });

            let pageAddress = result[1].pageAddress.length > 0 ? result[1].pageAddress[0] : {
                address: result[1].address,
                cityCode: result[1].city,
                districtCode: "",
                wardCode: result[1].ward, // district
                storeId: result[1].id
            };
            let exactPageAddress = {
                id: pageAddress.id,
                address: pageAddress.address,
                cityCode: pageAddress.cityCode,
                districtCode: pageAddress.wardCode,
                wardCode: pageAddress.districtCode,
                storeId: pageAddress.storeId
            };
            this.setState({
                pageAddress: exactPageAddress
            });
            this.props.value.setStorePickUpAddressProvince(pageAddress.cityCode);

            if (!_.isEmpty(exactPageAddress.cityCode)) {
                this.pmDistricts = cancelablePromise(catalogService.getDistrictsOfCity(exactPageAddress.cityCode));
                this.pmDistricts.promise.then(districts => {
                    this.setState({districts: districts});
                    if (!_.isEmpty(exactPageAddress.districtCode)) {
                        this.pmWards = cancelablePromise(catalogService.getWardsOfDistrict(exactPageAddress.districtCode));
                        this.pmWards.promise.then(wards => {
                            this.setState({wards: wards});
                        }, () => {
                        });
                    }
                }, () => {
                });
            }
        })
    }

    handleSubmit(event, errors, values) {
        if (errors.length <= 0) {
            this.setState({
                isSaving: true
            });

            let data = {};
            data.id = authenticate.getStoreId();

            let pageAddress = _.cloneDeep(this.state.pageAddress);
            pageAddress.address = values.address;
            let districtCode = pageAddress.districtCode;
            let wardCode = pageAddress.wardCode;
            pageAddress.wardCode = districtCode;
            pageAddress.districtCode = wardCode;
            data.pageAddress = pageAddress;

            this.pmUpdateStore = cancelablePromise(storeService.updateStorefrontInfo(data));
            this.pmUpdateStore.promise.then(() => {
                this.setState({
                    isSaving: false
                });
                GSToast.success('common.message.update.successfully', true);
                this.initPickupAddress();
                this.props.value.setStorePickUpAddressProvince(pageAddress.cityCode);
            }, () => {
            });

        }
    }

    componentWillUnmount() {
        if (this.pmStoreInfo) this.pmStoreInfo.cancel();
        if (this.pmDistricts) this.pmDistricts.cancel();
        if (this.pmWards) this.pmWards.cancel();
        if (this.pmUpdateStore) this.pmUpdateStore.cancel();
    }

    changeCity(cityCode) {
        if (_.isEmpty(cityCode)) {
            this.setState({districts: []});
            this.setState({pageAddress: update(this.state.pageAddress, {districtCode: {$set: ''}})});

            this.setState({wards: []});
            this.setState({pageAddress: update(this.state.pageAddress, {wardCode: {$set: ''}})});
            return;
        }
        this.setState({pageAddress: update(this.state.pageAddress, {cityCode: {$set: cityCode}})});
        catalogService.getDistrictsOfCity(cityCode).then(districts => {
            this.setState({districts: districts});
            this.setState({pageAddress: update(this.state.pageAddress, {districtCode: {$set: ''}})});
            this.setState({pageAddress: update(this.state.pageAddress, {wardCode: {$set: ''}})});
            this.setState({wards: []});
        }, () => {
        });
    }

    changeDistrict(districtCode) {
        if (_.isEmpty(districtCode)) {
            this.setState({wards: []});
            this.setState({pageAddress: update(this.state.pageAddress, {wardCode: {$set: ''}})});
            return;
        }
        this.setState({pageAddress: update(this.state.pageAddress, {districtCode: {$set: districtCode}})});
        catalogService.getWardsOfDistrict(districtCode).then(wards => {
            this.setState({pageAddress: update(this.state.pageAddress, {wardCode: {$set: ''}})});
            this.setState({wards: wards});
        }, () => {
        });
    }

    changeWard(wardCode) {
        this.setState({pageAddress: update(this.state.pageAddress, {wardCode: {$set: wardCode}})});
    }

    render() {
        return (
            <GSContentContainer className="pickup__address" isLoading={this.state.isFetching} isSaving={this.state.isSaving}>
            <UikWidget className="gs-widget">
                <UikWidgetHeader className="gs-widget__header">
                    <Trans i18nKey="page.setting.shippingAndPayment.pickupAddress">
                        Pickup Address
                    </Trans>
                </UikWidgetHeader>
                <UikWidgetContent className="gs-widget__content body">
                    <div className="setting__payment_method">
                        <AvForm onSubmit={this.handleSubmit} ref={(el) => {
                            this.form = el
                        }}>
                            <Col md={12} className="info-container__box__content">
                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <Label className={"gs-frm-control__title"}><Trans
                                                i18nKey="common.txt.street.name">Street Name</Trans>
                                            </Label>
                                            <AvField name='address' value={this.state.pageAddress.address}
                                                        onChange={this.onEnableSaveBtn}
                                                        validate={{
                                                            required: {
                                                                value: true,
                                                                errorMessage: i18next.t('common.validation.required')
                                                            },
                                                            maxLength: {
                                                                value: 100,
                                                                errorMessage: i18next.t('common.validation.char.max.length', {x: 100})
                                                            }
                                                        }}/>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label className={"gs-frm-control__title"}><Trans
                                                i18nKey="common.txt.street.province">Province</Trans>
                                            </Label>
                                            <AvField type="select" name="cityCode"
                                                        validate={{
                                                            required: {
                                                                value: true,
                                                                errorMessage: i18next.t('common.validation.required')
                                                            }
                                                        }}
                                                        value={this.state.pageAddress.cityCode}
                                                        onChange={e => this.changeCity(e.target.value, e)}>
                                                <option value="">{i18next.t('common.text.select')}</option>
                                                {
                                                    this.state.cities.map((x, index) =>
                                                        <option value={x.code} key={index}>{x.inCountry}</option>
                                                    )
                                                }
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label className={"gs-frm-control__title"}><Trans
                                                i18nKey="common.txt.street.district">District</Trans>
                                            </Label>
                                            <AvField type="select" name="districtCode"
                                                        validate={{
                                                            required: {
                                                                value: true,
                                                                errorMessage: i18next.t('common.validation.required')
                                                            }
                                                        }}
                                                        value={this.state.pageAddress.districtCode}
                                                        onChange={e => this.changeDistrict(e.target.value)}>
                                                <option value="">{i18next.t('common.text.select')}</option>
                                                {
                                                    this.state.districts.map((x, index) =>
                                                        <option value={x.code} key={index}>{x.inCountry}</option>
                                                    )
                                                }
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label className={"gs-frm-control__title"}><Trans
                                                i18nKey="common.txt.street.ward">Ward</Trans>
                                            </Label>
                                            <AvField type="select" name="wardCode"
                                                        validate={{}}
                                                        value={this.state.pageAddress.wardCode}
                                                        onChange={e => this.changeWard(e.target.value)}>
                                                <option value="">{i18next.t('common.text.select')}</option>
                                                {
                                                    this.state.wards.map((x, index) =>
                                                        <option value={x.code} key={index}>{x.inCountry}</option>
                                                    )
                                                }
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </AvForm>
                    </div>
                </UikWidgetContent>
                <UikWidgetContent className="gs-widget__content">
                    <GSButton primary className=" setting_btn_save"
                    onClick={() => this.form.submit()}>
                        <Trans i18nKey="common.btn.save"/>
                    </GSButton>
                </UikWidgetContent>
            </UikWidget>
            </GSContentContainer>
        )
    }
}

const WithContext = (Component) => {
    return (props) => (
        <SettingContext.Consumer>
            {value =>  <Component {...props} value={value} />}
        </SettingContext.Consumer>
    )
}


export default WithContext(PickupAddress);
