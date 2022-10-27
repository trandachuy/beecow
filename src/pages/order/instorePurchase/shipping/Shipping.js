/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './Shipping.sass';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {OrderInStorePurchaseContext} from '../context/OrderInStorePurchaseContext';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import storage from '../../../../services/storage';
import catalogService from '../../../../services/CatalogService';
import {OrderService} from '../../../../services/OrderService';
import {GSToast} from '../../../../utils/gs-toast';
import i18next from '../../../../config/i18n';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import {CurrencyUtils} from '../../../../utils/number-format';
import {Trans} from 'react-i18next';
import {CouponTypeEnum} from '../../../../models/CouponTypeEnum';
import {Label, Modal} from 'reactstrap';
import ModalHeader from 'reactstrap/es/ModalHeader';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import PropTypes from 'prop-types';
import {FormValidate} from '../../../../config/form-validate';
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency';
import {OrderInStorePurchaseContextService} from '../context/OrderInStorePurchaseContextService'
import Constants from '../../../../config/Constant'

const Shipping = (props) => {
    const { state, dispatch } = useContext(OrderInStorePurchaseContext.context);

    const [wards, setWards] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [stCountries, setStCountries] = useState([])
    const [stCities, setStCities] = useState([])
    const [stPhoneCode, setPhoneCode] = useState(0);
    const [stAddress, setStAddress] = useState(state.shippingInfo.address);
    const [stAddress2, setStAddress2] = useState(state.shippingInfo.address2);
    const [stOutsideCity, setStOutsideCity] = useState(state.shippingInfo.outsideCity);
    const [stZipCode, setStZipCode] = useState(state.shippingInfo.zipCode);

    const refBtnSubmit = useRef(null);
    const refForm = useRef();

    useEffect(() => {
        catalogService.getCountries()
            .then(countries => {
                setStCountries(countries)
            })
    }, [])

    useEffect(() => {
        if (!stCountries.length || !state.shippingInfo.countryCode) {
            return
        }

        const countrySelect = stCountries.find(r => r.code === state.shippingInfo.countryCode);

        setPhoneCode(countrySelect?.phoneCode)
    }, [stCountries, state.shippingInfo.countryCode])

    useEffect(() => {
        if (!state.shippingInfo.countryCode) {
            return
        }

        catalogService.getCitesOfCountry(state.shippingInfo.countryCode)
            .then(cities => setStCities(cities))
    }, [state.shippingInfo.countryCode])

    useEffect(() => {
        if (!state.shippingInfo.city) {
            return
        }

        catalogService.getDistrictsOfCity(state.shippingInfo.city)
            .then(districts => setDistricts(districts))
        checkShippingFeeSelfDelivery(state.shippingInfo.city);
    }, [state.shippingInfo.city])

    useEffect(() => {
        if (!state.shippingInfo.district) {
            return
        }

        catalogService.getWardsOfDistrict(state.shippingInfo.district)
            .then(wards => setWards(wards))
    }, [state.shippingInfo.district])

    const handleChangeWard = (ward) => {
        dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({
            ward
        }));
    };

    const handleChangeDistrict = (district) => {
        dispatch(
            OrderInStorePurchaseContext.actions.setShippingInfo({
                ward: '',
                district: district
            })
        );
    };

    const handleChangeCity = (city) => {
        dispatch(
            OrderInStorePurchaseContext.actions.setShippingInfo({
                city: city,
                district: '',
                ward: ''
            })
        );
    };

    const checkShippingFeeSelfDelivery = (city) => {
        if (!city) {
            return;
        }

        dispatch(OrderInStorePurchaseContext.actions.setProcessing(true));

        let request = {
            deliveryAddress: {
                locationCode: city,
                districtCode: 10,
                wardCode: 10
            },
            packageInfo: {
                length: 10, // set a unknow value -> no need on server
                width: 10, // set a unknow value -> no need on server
                height: 10, // set a unknow value -> no need on server
                weight: 10, // set a unknow value -> no need on server
                totalPrice: OrderInStorePurchaseContextService.getTotalPrice(state)
            }
        };

        dispatch(
            OrderInStorePurchaseContext.actions.setShippingInfo({
                selfDeliveryFee: 0,
                amount: 0
            })
        );

        OrderService.checkShippingFeeSelfDelivery(request)
            .then((res) => {
                if (res && res.length > 0) {
                    const data = res[0];

                    dispatch(
                        OrderInStorePurchaseContext.actions.setShippingInfo({
                            selfDeliveryFee: data.fee,
                            amount: data.fee
                        })
                    );
                }

                dispatch(OrderInStorePurchaseContext.actions.setProcessing(false));
            })
            .catch((e) => {
                dispatch(OrderInStorePurchaseContext.actions.setProcessing(false));
                GSToast.commonError();
            });
    };

    const handleShippingModal = (e, type) => {
        if ('CANCEL' === type) {
            props.modalHandle(type);
        } else {
            refBtnSubmit.current.click();
        }
    };

    const handleValidSubmit = (event, values) => {
        dispatch(
            OrderInStorePurchaseContext.actions.setUser({
                name: values['customer_name']
            })
        );
        dispatch(
            OrderInStorePurchaseContext.actions.setUser({
                phone: values['customer_phone']
            })
        );

        const selfDeliveryFee = values['selfDeliveryFee'] ? parseFloat(values['selfDeliveryFee']) : 0

        dispatch(
            OrderInStorePurchaseContext.actions.setShippingInfo({
                address: values.address,
                address2: values.address2,
                outsideCity: values.outsideCity,
                zipCode: values.zipCode,
                selfDeliveryFee: selfDeliveryFee,
                amount: selfDeliveryFee
            })
        );

        props.modalHandle('OK');
    };

    const handleChangeCountry = (countryCode) => {
        if (!countryCode) {
            return
        }

        dispatch(OrderInStorePurchaseContext.actions.resetShippingInfo());
        dispatch(
            OrderInStorePurchaseContext.actions.setShippingInfo({
                countryCode: countryCode,
                method: OrderInStorePurchaseContext.METHOD.DELIVERY,
                serviceId: 14,
                selfDeliveryFee: 0,
                amount: 0
            })
        );
    }

    const renderInsideAddressForm = () => {
        return (
            <>
                <div className="shipping-address">
                    <AvField
                        className="input-field__hint"
                        label={ i18next.t(
                            'page.order.create.shipping.address.address'
                        ) }
                        name="address"
                        defaultValue={ state.shippingInfo.address }
                        value={ stAddress }
                        placeholder={ i18next.t(
                            'page.order.create.shipping.address.address'
                        ) }
                        validate={ {
                            ...FormValidate.required(),
                            ...FormValidate.maxLength(150)
                        } }
                        onChange={ e => setStAddress(e.target.value) }
                        autoComplete="autoComplete"
                    />
                </div>

                <div className="shipping-select-address">
                    <div className="form-group-customize">
                        <AvField
                            key={ state.shippingInfo.city }
                            label={ i18next.t(
                                'page.order.create.shipping.address.city'
                            ) }
                            name="city"
                            type="select"
                            validate={ {
                                ...FormValidate.required()
                            } }
                            value={ state.shippingInfo.city }
                            onChange={ e => handleChangeCity(e.target.value) }
                        >
                            <option value="">
                                { i18next.t(
                                    'page.order.create.shipping.address.city'
                                ) }
                            </option>
                            {
                                stCities.map((x, index) =>
                                    <option
                                        value={ x.code }
                                        key={ index }
                                        defaultValue={ state.shippingInfo.city }
                                    >
                                        {
                                            storage
                                                .getFromLocalStorage('langKey')
                                                .toLowerCase() === 'vi' ? x.inCountry : x.outCountry
                                        }
                                    </option>
                                )
                            }
                        </AvField>
                    </div>

                    <div className="form-group-customize">
                        <AvField
                            key={ state.shippingInfo.district }
                            label={ i18next.t(
                                'page.order.create.shipping.address.district'
                            ) }
                            type="select"
                            name="district"
                            value={ state.shippingInfo.district }
                            validate={ {
                                ...FormValidate.required()
                            } }
                            onChange={ (e) => handleChangeDistrict(e.target.value) }
                        >
                            <option value="">
                                { i18next.t(
                                    'page.order.create.shipping.address.district'
                                ) }
                            </option>
                            {
                                districts.map((x, index) =>
                                    <option
                                        value={ x.code }
                                        key={ index }
                                        defaultValue={ state.shippingInfo.district }
                                    >
                                        {
                                            storage
                                                .getFromLocalStorage('langKey')
                                                .toLowerCase() === 'vi' ? x.inCountry : x.outCountry
                                        }
                                    </option>
                                )
                            }
                        </AvField>
                    </div>

                    <div className="form-group-customize">
                        <AvField
                            key={ state.shippingInfo.ward }
                            label={ i18next.t(
                                'page.order.create.shipping.address.ward'
                            ) }
                            type="select"
                            name="ward"
                            value={ state.shippingInfo.ward }
                            validate={ {
                                ...FormValidate.required()
                            } }
                            onChange={ (e) => handleChangeWard(e.target.value) }
                        >
                            <option value="">
                                { i18next.t(
                                    'page.order.create.shipping.address.ward'
                                ) }
                            </option>
                            {
                                wards.map((x, index) =>
                                    <option
                                        value={ x.code }
                                        key={ index }
                                        defaultValue={ state.shippingInfo.ward }
                                    >
                                        {
                                            storage
                                                .getFromLocalStorage('langKey')
                                                .toLowerCase() === 'vi' ? x.inCountry : x.outCountry
                                        }
                                    </option>
                                )
                            }
                        </AvField>
                    </div>
                </div>
            </>
        )
    }

    const renderOutsideAddressForm = () => {
        return (
            <>
                <div className="info-group">
                    <div className="name">
                        <AvField
                            disabled={ props.disabled }
                            label={ i18next.t('page.customers.edit.streetAddress') }
                            name="address"
                            defaultValue={ state.shippingInfo.address }
                            value={ stAddress }
                            validate={ {
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(255)
                            } }
                            placeHolder={ i18next.t('page.order.create.shipping.address.address') }
                            onChange={ e => setStAddress(e.target.value) }
                            autoComplete="autoComplete"
                        />
                    </div>

                    <div className="address2">
                        <AvField
                            disabled={ props.disabled }
                            label={ i18next.t('page.customers.edit.address2') }
                            name="address2"
                            defaultValue={ state.shippingInfo.address2 }
                            value={ stAddress2 }
                            validate={ {
                                ...FormValidate.maxLength(65)
                            } }
                            placeHolder={ i18next.t('page.customer.addAddress.enterAddress2') }
                            onChange={ e => setStAddress2(e.target.value) }
                            autoComplete="autoComplete"
                        />
                    </div>
                </div>

                <div className="shipping-select-address">
                    <div className="form-group-customize">
                        <AvField
                            key={ state.shippingInfo.city }
                            type="select"
                            name="city"
                            label={ i18next.t('page.customers.edit.state') }
                            validate={ {
                                ...FormValidate.required()
                            } }
                            onChange={ e => handleChangeCity(e.target.value) }
                            defaultValue={ state.shippingInfo.city }
                        >
                            <option value={ '' }>{ i18next.t('page.customer.addAddress.selectState') }</option>
                            {
                                stCities.map((x, index) =>
                                    <option key={ index } value={ x.code }>{ x.outCountry }</option>
                                )
                            }
                        </AvField>
                    </div>

                    <div className="form-group-customize">
                        <AvField
                            disabled={ props.disabled }
                            label={ i18next.t('page.customers.edit.city') }
                            name="outsideCity"
                            defaultValue={ state.shippingInfo.outsideCity }
                            value={ stOutsideCity }
                            validate={ {
                                ...FormValidate.maxLength(65),
                                ...FormValidate.required()
                            } }
                            placeHolder={ i18next.t('page.customer.addAddress.enterCity') }
                            onChange={ e => setStOutsideCity(e.target.value) }
                            autoComplete="autoComplete"
                        />
                    </div>

                    <div className="form-group-customize">
                        <AvField
                            disabled={ props.disabled }
                            label={ i18next.t('page.customers.edit.zipCode') }
                            name="zipCode"
                            defaultValue={ state.shippingInfo.zipCode }
                            value={ stZipCode }
                            validate={ {
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(25)
                            } }
                            placeHolder={ i18next.t('page.customer.addAddress.enterZipCode') }
                            onChange={ e => setStZipCode(e.target.value) }
                            autoComplete="autoComplete"
                        />
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Modal
                className="order-in-store-shipping-method-modal"
                isOpen={ props.isOpen }
                size="lg"
                key={ 'shipping-model-' + props.isOpen }
            >
                <ModalHeader className="color-green">
                    <GSTrans t="page.order.create.shipping.way.delivery"/>
                </ModalHeader>
                <ModalBody>
                    <GSWidget className={ 'order-in-store-shipping-method' }>
                        <GSWidgetContent>
                            <div className="row">
                                <div className="col-12 order-in-store-shipping-method__options-container p-0">
                                    <div className="order-in-store-shipping-method__radio-group">
                                        <AvForm
                                            className="form-shipping"
                                            ref={ refForm }
                                            autocomplete="new-password"
                                            onValidSubmit={ handleValidSubmit }
                                        >
                                            <button ref={ refBtnSubmit } hidden>
                                                submit
                                            </button>

                                            <div className="shipping-address info-group">
                                                <div className="countryCode">
                                                    {/*COUNTRY*/ }
                                                    <AvField
                                                        key={ state.shippingInfo.countryCode }
                                                        type="select"
                                                        name="countryCode"
                                                        label={ `${ i18next.t('page.customers.edit.country') }` }
                                                        className="dropdown-box country"
                                                        defaultValue={ state.shippingInfo.countryCode }
                                                        onChange={ e => handleChangeCountry(e.target.value) }
                                                    >
                                                        {
                                                            stCountries.map(country =>
                                                                <option key={ country.code } value={ country.code }>
                                                                    { country.outCountry }
                                                                </option>
                                                            )
                                                        }
                                                    </AvField>
                                                </div>
                                            </div>

                                            <div className="shipping-address info-group">
                                                <div className="name">
                                                    <AvField
                                                        key={ state.user.name }
                                                        className="input-field__hint"
                                                        label={ i18next.t(
                                                            'page.order.create.shipping.address.customer_name'
                                                        ) }
                                                        name="customer_name"
                                                        defaultValue={ state.user.name }
                                                        placeholder={ i18next.t(
                                                            'page.order.create.shipping.address.customer_name'
                                                        ) }
                                                        validate={ {
                                                            ...FormValidate.required(),
                                                            ...FormValidate.maxLength(150)
                                                        } }
                                                        autoComplete="autoComplete"
                                                    />
                                                </div>

                                                <div
                                                    className={ String(stPhoneCode).length > 3 ? 'phone maxPhoneCode' : 'phone' }>
                                                    <span className="phone-country">(+{ stPhoneCode })</span>
                                                    <AvField
                                                        key={ state.user.phone }
                                                        className="input-field__hint"
                                                        label={ i18next.t(
                                                            'page.order.create.shipping.address.customer_phone'
                                                        ) }
                                                        name="customer_phone"
                                                        defaultValue={ state.user.phone }
                                                        placeholder={ i18next.t(
                                                            'page.order.create.shipping.address.customer_phone'
                                                        ) }
                                                        validate={ {
                                                            ...FormValidate.required(),
                                                            ...FormValidate.pattern.phoneNumber()
                                                        } }
                                                        autoComplete="autoComplete"
                                                    />
                                                </div>
                                            </div>

                                            { state.shippingInfo.countryCode === Constants.CountryCode.VIETNAM && renderInsideAddressForm() }
                                            { state.shippingInfo.countryCode !== Constants.CountryCode.VIETNAM && renderOutsideAddressForm() }

                                            <div className="shipping-address info-group">
                                                <div className="name">
                                                    <Label
                                                        for={ 'shipping_option' }
                                                        className="gs-frm-control__title"
                                                    >
                                                        <Trans i18nKey="page.order.create.shipping.option.option"/>
                                                    </Label>
                                                    <AvField
                                                        type="select"
                                                        name="shipping_option"
                                                        value={ '' }
                                                    >
                                                        <option value="">
                                                            { i18next.t(
                                                                'page.order.create.shipping.option.by.self_delivery'
                                                            ) }
                                                        </option>
                                                    </AvField>
                                                </div>

                                                <div className="phone">
                                                    <Label
                                                        for={ 'selfDeliveryFee' }
                                                        className="gs-frm-control__title"
                                                    >
                                                        <Trans
                                                            i18nKey="page.order.create.shipping.option.self_delivery"/>
                                                    </Label>
                                                    <div className="right">
                                                        <AvFieldCurrency
                                                            name="selfDeliveryFee"
                                                            unit={ CurrencyUtils.getLocalStorageSymbol() }
                                                            value={ state.shippingInfo.selfDeliveryFee }
                                                            validate={ {
                                                                ...FormValidate.minValue(0)
                                                            } }
                                                            parentClassName="order-in-store-shipping-fee"
                                                            position={ CurrencyUtils.isPosition(CurrencyUtils.getLocalStorageSymbol()) }
                                                            precision={ CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2' }
                                                            decimalScale={ CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2 }
                                                        />

                                                        {
                                                            state.promotion?.couponType === CouponTypeEnum.FREE_SHIPPING &&
                                                            <div className="text-right">
                                                                <Label className="text-green font-weight-bold">
                                                                    { state.promotion.couponCode }&nbsp;&nbsp;
                                                                </Label>
                                                                {
                                                                    state.promotion.feeShippingValue &&
                                                                    <Label className="font-weight-bold">
                                                                        <Trans
                                                                            i18nKey="page.order.create.shipping.free.shipping.maximum"/>
                                                                        : -{ ' ' }
                                                                        { CurrencyUtils.formatMoneyByCurrency(
                                                                            state.promotion.feeShippingValue,
                                                                            CurrencyUtils.getLocalStorageSymbol()
                                                                        ) }
                                                                    </Label>
                                                                }
                                                                {
                                                                    !state.promotion.feeShippingValue &&
                                                                    <Label className="font-weight-bold">
                                                                        -{ ' ' }
                                                                        { CurrencyUtils.formatMoneyByCurrency(
                                                                            state.shippingInfo.selfDeliveryFee,
                                                                            CurrencyUtils.getLocalStorageSymbol()
                                                                        ) }
                                                                    </Label>
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </AvForm>
                                    </div>
                                </div>
                            </div>
                        </GSWidgetContent>
                    </GSWidget>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ (e) => handleShippingModal(e, 'CANCEL') }>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton
                        success
                        marginLeft
                        onClick={ (e) => handleShippingModal(e, 'OK') }
                    >
                        <GSTrans t="common.btn.save"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        </>
    );
};

Shipping.propTypes = {
    isOpen: PropTypes.bool
};

export default Shipping;
