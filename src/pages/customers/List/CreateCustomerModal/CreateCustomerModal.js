import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import './CreateCustomerModal.sass'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import {FormValidate} from '../../../../config/form-validate'
import DatePicker from 'react-datepicker'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import GSTags from '../../../../components/shared/form/GSTags/GSTags'
import style from '../../Edit/CustomerEditor.module.sass'
import {UikCheckbox} from '../../../../@uik'
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from '../../../../components/shared/GSTooltip/GSTooltip'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import {bool, func} from 'prop-types'
import {CurrencyUtils} from '../../../../utils/number-format'
import catalogService from '../../../../services/CatalogService'
import beehiveService from '../../../../services/BeehiveService'
import Constants from '../../../../config/Constant'
import {ValidateUtils} from '../../../../utils/validate'
import {DateTimeUtils} from '../../../../utils/date-time'
import moment from 'moment'
import useDebounceEffect from '../../../../utils/hooks/useDebounceEffect'

const GENDER_OPTIONS = [
    {
        value: 'ALL',
        label: i18next.t('page.customers.selectGender')
    },
    {
        value: Constants.Gender.MALE,
        label: i18next.t('page.customers.male')
    },
    {
        value: Constants.Gender.FEMALE,
        label: i18next.t('page.customers.female')
    }
]

const CreateCustomerModal = props => {
    const { toggle, onToggle, onValidSubmit } = props

    const [stPhoneCode, setPhoneCode] = useState(0);
    const [stInvalidNumberPhone, setStInvalidNumberPhone] = useState(false);
    const [stTags, setStTags] = useState([]);
    const [stIsCreateAccount, setStIsCreateAccount] = useState(true);
    const [stCountries, setStCountries] = useState([])
    const [stCities, setStCities] = useState([])
    const [stDistricts, setStDistricts] = useState([])
    const [stWards, setStWards] = useState([])
    const [stCustomerPhone, setStCustomerPhone] = useState('')
    const [stCustomerBirthday, setStCustomerBirthday] = useState(null);
    const [stCustomerAddress, setStCustomerAddress] = useState('');
    const [stCustomerAddress2, setStCustomerAddress2] = useState('');
    const [stCustomerLocation, setStCustomerLocation] = useState('');
    const [stCustomerDistrict, setStCustomerDistrict] = useState('');
    const [stCustomerWard, setStCustomerWard] = useState('');
    const [stCustomerCityOutside, setStCustomerCityOutside] = useState('');
    const [stCustomerZipCodeOutside, setStCustomerZipCodeOutside] = useState('');
    const [stCustomerCountry, setStCustomerCountry] = useState(CurrencyUtils.getLocalStorageCountry());
    const [stRequiredAddress, setStRequiredAddress] = useState(false);

    const refForm = useRef(null)
    const refBirthday = useRef(null)

    useEffect(() => {
        catalogService.getCountries()
            .then(countryList => {
                setStCountries(countryList)
            })
    }, [])

    useEffect(() => {
        if (!toggle) {
            return
        }
        setStInvalidNumberPhone(false)
        setStTags([])
        setStIsCreateAccount(true)
        setStCustomerPhone('')
        setStCustomerBirthday(null)
        setStCustomerAddress('')
        setStCustomerAddress2('')
        setStCustomerLocation('')
        setStCustomerDistrict('')
        setStCustomerWard('')
        setStCustomerCityOutside('')
        setStCustomerZipCodeOutside('')
        setStCustomerCountry(CurrencyUtils.getLocalStorageCountry())
        setStRequiredAddress(false)
    }, [toggle])

    useEffect(() => {
        if (!stCustomerCountry) {
            return
        }

        catalogService.getCitesOfCountry(stCustomerCountry).then(res => setStCities(res))
        setStCustomerLocation('')
    }, [stCustomerCountry])

    useEffect(() => {
        if (!stCustomerCountry || !stCountries.length) {
            return
        }

        updatePhoneCodeByCountry(stCustomerCountry, stCountries)
    }, [stCustomerCountry, stCountries])

    useEffect(() => {
        if (!stCustomerLocation) {
            setStDistricts([]);
        } else {
            catalogService.getDistrictsOfCity(stCustomerLocation).then(res => setStDistricts(res))
        }
        setStCustomerDistrict('')
    }, [stCustomerLocation])

    useEffect(() => {
        if (!stCustomerDistrict) {
            setStWards([]);
        } else {
            catalogService.getWardsOfDistrict(stCustomerDistrict).then(res => setStWards(res))
        }
        setStCustomerWard('');
    }, [stCustomerDistrict])

    useEffect(() => {
        if (!stCustomerCountry || !stCustomerPhone) {
            return
        }

        //Check phone number
        checkPhoneNumber(stCustomerPhone, stCustomerCountry)
    }, [stCustomerPhone, stCustomerCountry])

    useDebounceEffect(() => {
        let isRequired;

        if (stCustomerCountry === Constants.CountryCode.VIETNAM) {
            isRequired = stCustomerAddress !== '' || stCustomerLocation !== '' || stCustomerDistrict !== ''
                || stCustomerWard !== '';
        } else {
            isRequired = stCustomerAddress !== '' || stCustomerAddress2 !== '' || stCustomerLocation !== ''
                || stCustomerCityOutside !== '' || stCustomerZipCodeOutside !== '';
        }

        setStRequiredAddress(isRequired);

        if (refForm.current) {
            refForm.current.setTouched('address');
            refForm.current.setTouched('cityCode');
            refForm.current.setTouched('districtCode');
            refForm.current.setTouched('wardCode');
            refForm.current.setTouched('country');
            refForm.current.setTouched('province');
            refForm.current.setTouched('city');
            refForm.current.setTouched('zipCode');
            if (!isRequired) {
                refForm.current.validateAll();
            }
        }
    }, 100, [stCustomerAddress, stCustomerAddress2, stCustomerLocation, stCustomerDistrict, stCustomerWard,
        stCustomerCountry, stCustomerCityOutside, stCustomerZipCodeOutside]);

    const updatePhoneCodeByCountry = (countryCode, countries) => {
        const countrySelect = countries.find(r => countryCode.includes(r.code));
        setPhoneCode(countrySelect?.phoneCode)
    }

    const checkPhoneNumber = (numberPhone, countryCode) => {
        if (numberPhone.split('').length >= 8) {
            beehiveService.checkPhoneNumber(numberPhone, countryCode)
                .then(result => {
                    setStInvalidNumberPhone(result)
                })
        } else {
            setStInvalidNumberPhone(false)
        }
    }

    const handleChangeCountry = (countryCode) => {
        if (!countryCode) {
            return
        }

        setStCustomerCountry(countryCode)
    }

    const handleChangePhoneNumber = (event) => {
        const numberPhone = event.target.value
        setStCustomerPhone(numberPhone)
    }

    const handleChangeBirthday = (date) => {
        setStCustomerBirthday(date)
    }

    const handleCheckedCreateAccount = (event) => {
        const checkedCreate = event.target.checked;
        setStIsCreateAccount(checkedCreate)
    }

    const handleValidSubmit = (event, value) => {
        const data = {
            name: value.fullName,
            phone: value.phone,
            email: value.email,
            note: value.note,
            tags: stTags?.length ? stTags.map(tagObj => tagObj.value || tagObj) : [],
            address: value.address,
            locationCode: value.cityCode,
            districtCode: value.districtCode,
            wardCode: value.wardCode,
            isCreateUser: stIsCreateAccount,
            gender: value.gender == 'ALL' ? null : value.gender,
            birthday: !stCustomerBirthday ? null : moment(DateTimeUtils.flatTo(moment(stCustomerBirthday), DateTimeUtils.UNIT.MINUTE)).format('YYYY-MM-DDT00:00:00Z'),
            countryCode: value.country,
            address2: value.address2,
            city: value.city,
            zipCode: value.zipCode
        }

        onValidSubmit(data)
    }

    const renderInsideAddressForm = () => {
        return <>
            <div className="address">
                {/*ADDRESS*/ }
                <AvField
                    label={ i18next.t('page.customers.edit.address') }
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress') }
                    name="address"
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    } }
                    onBlur={ e => {
                        setStCustomerAddress(e.target.value)
                    } }
                    value={ stCustomerAddress }
                />
            </div>
            <div className="d-flex box-city">
                <AvField
                    type="select"
                    name="cityCode"
                    label={ <div className="label-required">{ i18next.t('page.products.supplierPage.province') }</div> }
                    onChange={ e => setStCustomerLocation(e.target.value) }
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        )
                    } }
                    value={ stCustomerLocation }
                >
                    <option value="">{ i18next.t('page.customer.addAddress.selectCity') }</option>
                    {
                        stCities.map(({ code, inCountry }, index) =>
                            <option value={ code } key={ index }>{ inCountry }</option>
                        )
                    }
                </AvField>
                <AvField
                    type="select"
                    name="districtCode"
                    label={ <div className="label-required">{ i18next.t('page.products.supplierPage.district') }</div> }
                    onChange={ e => setStCustomerDistrict(e.target.value) }
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        )
                    } }
                    value={ stCustomerDistrict }
                >
                    <option value="">{ i18next.t('page.customer.addAddress.selectDistrict') }</option>
                    {
                        stDistricts.map(({ code, inCountry }, index) =>
                            <option value={ code } key={ index }>{ inCountry }</option>
                        )
                    }
                </AvField>
                <AvField
                    type="select"
                    name="wardCode"
                    label={ <div className="label-required">{ i18next.t('page.products.supplierPage.ward') }</div> }
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        )
                    } }
                    onChange={ e => setStCustomerWard(e.target.value) }
                    value={ stCustomerWard }>
                    <option value="">{ i18next.t('page.customer.addAddress.selectWard') }</option>
                    {
                        stWards.map(({ code, inCountry }, index) =>
                            <option value={ code } key={ index }>{ inCountry }</option>
                        )
                    }
                </AvField>
            </div>
        </>
    }

    const renderOutsideAddressForm = () => {
        return <>
            <div className="d-flex address2">
                {/*ADDRESS*/ }
                <AvField
                    label={ i18next.t('page.customers.edit.streetAddress') }
                    name="address"
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress') }
                    onBlur={ e => setStCustomerAddress(e.target.value) }
                    value={ stCustomerAddress }
                />
                <AvField
                    disabled={ props.disabled }
                    label={ i18next.t('page.customers.edit.address2') }
                    name="address2"
                    validate={ {
                        ...FormValidate.maxLength(65)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress2') }
                    onBlur={ e => setStCustomerAddress2(e.target.value) }
                    value={ stCustomerAddress2 }
                />
            </div>
            <div className="d-flex box-city">
                <AvField
                    type="select"
                    name="cityCode"
                    label={ i18next.t('page.customers.edit.state') }
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        )
                    } }
                    onChange={ e => setStCustomerLocation(e.target.value) }
                    value={ stCustomerLocation }
                >
                    <option value="">{ i18next.t('page.customer.addAddress.selectState') }</option>
                    {
                        stCities.map((x, index) =>
                            <option value={ x.code } key={ index }>{ x.outCountry }</option>
                        )
                    }
                </AvField>
                <AvField
                    label={ i18next.t('page.customers.edit.city') }
                    name="city"
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(65)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterCity') }
                    onBlur={ e => setStCustomerCityOutside(e.target.value) }
                    value={ stCustomerCityOutside }
                />
                <AvField
                    label={ i18next.t('page.customers.edit.zipCode') }
                    name="zipCode"
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(25)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterZipCode') }
                    onBlur={ e => setStCustomerZipCodeOutside(e.target.value) }
                    value={ stCustomerZipCodeOutside }
                />
            </div>
        </>
    }

    return (
        <Modal isOpen={ toggle } toggle={ onToggle } className="create-customer-modal">
            <ModalHeader
                toggle={ onToggle }>
                <GSTrans t="page.order.instorePurchase.addCustomer.title"/>
            </ModalHeader>
            <ModalBody className="d-flex">
                <div>
                    <GSImg
                        className="image"
                        src="/assets/images/MicrosoftTeams-image.png"
                        alt="Product"
                        width={ 120 }
                        height={ 120 }
                        style={ {
                            margin: '30px'
                        } }
                    />
                </div>
                <AvForm onValidSubmit={ handleValidSubmit } autoComplete="off" ref={ refForm }>
                    <div className="content" style={ { width: '700px' } }>
                        {/*COUNTRY*/ }
                        <AvField
                            type="select"
                            name="country"
                            label={ `${ i18next.t('page.customers.edit.country') }` }
                            className="dropdown-box country"
                            value={ stCustomerCountry }
                            onChange={ e => handleChangeCountry(e.target.value) }
                        >
                            {
                                stCountries.map(({ code, outCountry }) =>
                                    <option key={ code } value={ code }>
                                        { outCountry }
                                    </option>
                                )
                            }
                        </AvField>

                        <div className="box-form-group d-flex">
                            {/*FULL NAME*/ }
                            <AvField
                                label={ i18next.t('page.customers.edit.fullName') }
                                name="fullName"
                                validate={ {
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(100, true)
                                } }
                                placeholder={ i18next.t('page.customers.placeholder.fullName') }
                            />
                            {/*GENDER*/ }
                            <AvField
                                type="select"
                                name="gender"
                                label={ `${ i18next.t('page.customers.edit.gender') }` }
                                className="dropdown-box w-100"
                                value={ GENDER_OPTIONS[0].value }
                            >
                                {
                                    GENDER_OPTIONS.map(gender =>
                                        <option key={ gender.value } value={ gender.value }>
                                            { gender.label }
                                        </option>
                                    )
                                }
                            </AvField>
                        </div>
                        <div className="d-flex">
                            <div className={ String(stPhoneCode).length > 3 ? 'phone maxPhoneCode' : 'phone' }
                                 style={ { width: '47%' } }>
                                {/*PHONE*/ }
                                <span className="phone-country">(+{ stPhoneCode })</span>
                                <AvField
                                    label={ i18next.t('page.customers.edit.phone') }
                                    name="phone"
                                    className={ stInvalidNumberPhone ? 'invalid' : '' }
                                    validate={ {
                                        ...FormValidate.required(),
                                        ...FormValidate.pattern.numberOrEnter(),
                                        async: (value, ctx, input, cb) => {
                                            ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
                                        }
                                    } }
                                    onBlur={ handleChangePhoneNumber }
                                    placeholder={ i18next.t('page.customers.placeholder.phone') }
                                />
                                {
                                    stInvalidNumberPhone && <div
                                        className="invalid-check">{ i18next.t('common.validation.check.phone') }</div>
                                }
                            </div>
                            <div className="birthday-date">
                                <p>
                                    { i18next.t('page.notification.editor.eventBirthday') }
                                </p>

                                <div className="position-relative">
                                    <DatePicker
                                        selected={ stCustomerBirthday }
                                        onChange={ (date) => handleChangeBirthday(date) }
                                        placeholderText="dd/mm/yyyy"
                                        dateFormat="dd/MM/yyyy"
                                        dropdownMode="select"
                                        showMonthDropdown
                                        showYearDropdown
                                        adjustDateOnChange
                                        maxDate={ new Date() }
                                        ref={ refBirthday }
                                    />
                                    <FontAwesomeIcon
                                        onClick={ () => {
                                            refBirthday.current.deferFocusInput()
                                        } }
                                        icon={ ['far', 'calendar-alt'] }
                                        color="#939393"
                                        style={ {
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '2.4rem',
                                            cursor: 'text'
                                        } }/>
                                </div>
                            </div>
                        </div>
                        {/*EMAIL*/ }
                        <AvField
                            label={ i18next.t('page.customers.edit.email') }
                            name="email"
                            type="email"
                            validate={ {
                                ...FormValidate.email(),
                                ...FormValidate.maxLength(100)
                            } }
                            placeholder={ i18next.t('page.customers.placeholder.email') }
                        />

                        { stCustomerCountry === 'VN' && renderInsideAddressForm() }
                        { stCustomerCountry !== 'VN' && renderOutsideAddressForm() }
                        {/*TAGS*/ }
                        <div className="form-group tags">
                            <label className="gs-frm-input__label">
                                <GSTrans t={ 'page.customers.edit.tags' }/>
                            </label>
                            <GSTags
                                key={ stTags }
                                placeholer=""
                                className={ style.gsTag }
                                onChange={ value => setStTags(value) }
                                defaultValue={ stTags }
                            />
                        </div>
                        <div className="note">
                            {/*NOTE*/ }
                            <AvField
                                label={ i18next.t('page.customers.edit.note') }
                                name="note"
                                type="textarea"
                                validate={ {
                                    ...FormValidate.maxLength(1_000, true)
                                } }
                            />
                        </div>

                        {/*CHECK BOX*/ }
                        <div className="form-group align-items-center check-box">
                            <UikCheckbox
                                checked={ stIsCreateAccount }
                                onChange={ e => handleCheckedCreateAccount(e) }
                                className="custom-check-box"
                            />

                            <span
                                className="check-box-wrapper__label">{ i18next.t('page.customers.edit.titleCheckbox') }</span>
                            <GSTooltip message={ i18next.t('page.customers.edit.textTooltip') }
                                       icon={ GSTooltipIcon.INFO_CIRCLE } placement={ GSTooltipPlacement.BOTTOM }/>
                        </div>
                    </div>

                    <ModalFooter>
                        <GSButton default buttonType="button" onClick={ onToggle }>
                            <GSTrans t={ 'common.btn.cancel' }/>
                        </GSButton>
                        <GSButton marginLeft success disabled={ stInvalidNumberPhone }>
                            <GSTrans t={ 'common.btn.add' }/>
                        </GSButton>
                    </ModalFooter>
                </AvForm>
            </ModalBody>
        </Modal>
    )
}

CreateCustomerModal.defaultProps = {
    toggle: false,
    onToggle: function () {
    },
    onValidSubmit: function () {
    }
}

CreateCustomerModal.propTypes = {
    toggle: bool,
    onToggle: func,
    onValidSubmit: func
}

export default CreateCustomerModal