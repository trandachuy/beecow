import React, { useContext, useEffect, useRef, useState } from "react";
import "./PinCustomer.sass";
import { AvField, AvForm } from "availity-reactstrap-validation";
import i18next from "i18next";
import { FormValidate } from "../../../config/form-validate";
import moment from "moment";
import catalogService from "../../../services/CatalogService";
import Constants from "../../../config/Constant";
import { DateTimeUtils } from "../../../utils/date-time";
import beehiveService from "../../../services/BeehiveService";
import { GSToast } from "../../../utils/gs-toast";
import { UikInput } from "../../../@uik";
import Loading, { LoadingStyle } from "../../../components/shared/Loading/Loading";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import useDebounceEffect from "../../../utils/hooks/useDebounceEffect";
import { cancelablePromise } from "../../../utils/promise";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import { ValidateUtils } from "../../../utils/validate";
import { Trans } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { FbMessengerContext } from "../facebook/context/FbMessengerContext";
import { CurrencyUtils } from "../../../utils/number-format";
import GSComponentTooltip from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import $ from "jquery";
import _ from "lodash";

const GENDER_OPTIONS = [
    {
        value: '',
        label: i18next.t('page.customers.selectGender')
    },
    {
        value: Constants.Gender.MALE,
        label: i18next.t('page.customers.male')
    },
    {
        value: Constants.Gender.FEMALE,
        label: i18next.t('page.customers.female')
    },
]
const SIZE_PER_PAGE = 10;
const COUNTRY_CODE_DEFAULT = CurrencyUtils.getLocalStorageCountry()

const PinCustomer = (props) => {
    const { state, dispatch } = useContext(FbMessengerContext.context)
    const refAddCustomerForm = useRef(null);
    const refInputSearch = useRef(null);
    const refBirthday = useRef(null)
    const [stProvince, setStProvince] = useState([])
    const [stDistrict, setStDistrict] = useState([])
    const [stWard, setStWard] = useState([])
    const [stRequiredAddress, setStRequiredAddress] = useState(false);
    const [stCustomerAddress, setStCustomerAddress] = useState('');
    const [stCustomerLocation, setStCustomerLocation] = useState('');
    const [stCustomerDistrict, setStCustomerDistrict] = useState('');
    const [stCustomerAddress2, setStCustomerAddress2] = useState('');
    const [stCustomerProvince, setStCustomerProvince] = useState('');
    const [stCustomerCity, setStCustomerCity] = useState('');
    const [stCustomerZipCode, setStCustomerZipCode] = useState('');
    const [stCustomerWard, setStCustomerWard] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [stSendTime, setStSendTime] = useState(undefined);
    const [stCustomerList, setStCustomerList] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [stSearchUserText, setStSearchUserText] = useState('');
    const [stPreviousPhone, setStPreviousPhone] = useState('');
    const [stCheckedNumberPhone, setStCheckedNumberPhone] = useState(false);
    const [stIsAnyChange, setStIsAnyChange] = useState(false);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [stCustomerProfile, setStCustomerProfile] = useState({
        id: undefined,
        fullName: '',
        phone: '',
        email: '',
        gender: '',
        addressId: undefined
    });
    const [stCustomerEditCountry, setStCustomerEditCountry] = useState(COUNTRY_CODE_DEFAULT);
    const [stCountries, setStCountries] = useState([])
    const [stPhoneCode, setPhoneCode] = useState(0);
    const [stNumberPhone, setStNumberPhone] = useState("")

    useEffect(() => {
        catalogService.getCitesOfCountry(COUNTRY_CODE_DEFAULT).then(res => setStProvince(res))
        catalogService.getCountries()
            .then(countries => {
                setStCountries(countries)
                //Set Phone Code
                const countrySelect = countries.find(r => r.code === COUNTRY_CODE_DEFAULT);
                setPhoneCode(countrySelect.phoneCode)
            })
    }, []);

    useEffect(() => {
        if (props.customerProfileId) {
            selectCustomer(props.customerProfileId, false)
        } else {
            if (props.preFillData && stProvince) {
                if (props.type === Constants.GO_CHAT_TYPE.ZALO) {
                    /**
                     * @type {ZaloUserProfileDTO}
                     */
                    const zaloUserProfile = props.preFillData

                    setStCustomerProfile( state => ({
                        ...state,
                        fullName: zaloUserProfile.name || zaloUserProfile.displayName,
                        gender: zaloUserProfile.userGender === 1? Constants.Gender.MALE:Constants.Gender.FEMALE
                    }))
                    if (zaloUserProfile.address && zaloUserProfile.address !== '') {
                        setStCustomerAddress(zaloUserProfile.address)
                    }

                    if (zaloUserProfile.city) {
                        const sProvince = stProvince.find(province => zaloUserProfile.city.includes(province.inCountry))
                        if (sProvince) {
                            setStCustomerLocation(sProvince.code)
                            catalogService.getDistrictsOfCity(sProvince.code).then(district => {
                                setStDistrict(district)

                                if (zaloUserProfile.district) {
                                    const sDistrict = district.find(d => zaloUserProfile.district.includes(d.inCountry))
                                    if (sDistrict) {
                                        setStCustomerDistrict(sDistrict.code)
                                    }
                                }
                            })
                        }
                    }

                } else {
                    const fbUserProfile = props.preFillData
                    setStCustomerProfile( state => ({
                        ...state,
                        fullName:state.fullName || fbUserProfile.name,
                        gender: fbUserProfile.gender === 'male' ? Constants.Gender.MALE:Constants.Gender.FEMALE
                    }))
                }
            }
        }

    }, [props.customerProfileId, stProvince]);

    useEffect(() => {
        if (props.customerProfileId) {
            fetchDataCustomerAddress(props.customerProfileId)
        }
    }, [props.customerProfileId]);

    useEffect(() => {
        let isRequired = stCustomerAddress !== '' || stCustomerLocation !== ''
            || stCustomerDistrict !== '' || stCustomerWard !== ''|| stCustomerCity !== ''
            || stCustomerZipCode !== ''|| stCustomerProvince !== ''
            || stCustomerEditCountry !== 'VN';
        setStRequiredAddress(isRequired);
        if (refAddCustomerForm.current) {
            refAddCustomerForm.current.setTouched('address');
            refAddCustomerForm.current.setTouched('cityCode');
            refAddCustomerForm.current.setTouched('districtCode');
            refAddCustomerForm.current.setTouched('wardCode');
            refAddCustomerForm.current.setTouched('city');
            refAddCustomerForm.current.setTouched('zipCode');
            if (!isRequired) {
                refAddCustomerForm.current.validateAll();
            }
        }
    }, [stCustomerAddress, stCustomerLocation, stCustomerDistrict, stCustomerWard, stCustomerCity, stCustomerZipCode, stCustomerProvince, stCustomerEditCountry]);

    // Show tooltip when full address text overflowed
    useEffect(() => {
        let fullAddresses = $('.card .card-body .full-address');
        if (fullAddresses.length) {
            let customers = [...stCustomerList];
            fullAddresses.each(function(_, element) {
                if (element.offsetHeight < element.scrollHeight) {
                    let id = ~~element.id.split('-').pop();
                    let index = customers.findIndex(x => x.id === id)
                    if (index !== -1)
                        customers[index] = {...customers[index], isFullAddressOverflowed: true}
                }
            })
            if (!_.isEqual(customers, stCustomerList))
                setStCustomerList(customers);
        }
    }, [stCustomerList]);

    const fetchDataCustomerAddress = (customerProfileId) =>{
        beehiveService.getCustomerAddress(customerProfileId)
            .then(res => {
                if (res.countryCode != null) {
                    setStCustomerEditCountry(res.countryCode)
                    catalogService.getCitesOfCountry(res.countryCode).then(res => setStProvince(res))
                    fetchDataPhoneCode(res.countryCode)
                }
                if (res.address != null) {
                    setStCustomerAddress(res.address)
                }
                if (res.address2 != null) {
                    setStCustomerAddress2(res.address2)
                }
                if (res.locationCode != null) {
                    setStCustomerProvince(res.locationCode)
                }
                if (res.city != null) {
                    setStCustomerCity(res.city)
                }
                if (res.zipCode != null) {
                    setStCustomerZipCode(res.zipCode)
                }
            })
    }

    const fetchDataPhoneCode = (countryCode) => {
        catalogService.getCountries()
            .then(countries => {
                setStCountries(countries)

                //Set Phone Code
                const countrySelect = countries.find(r => r.code === countryCode);
                setPhoneCode(countrySelect.phoneCode)
            })
    }

    const handleChangeBirthday = (date) =>{
        setStartDate(date)
        setStSendTime(DateTimeUtils.flatTo(moment(date), DateTimeUtils.UNIT.MINUTE))
    }

    const handleValidSubmit = (event, value) => {
        const requestBody = {
            id: stCustomerProfile.id,
            fullName: value.fullName,
            phone: value.phone,
            email: value.email,
            addressId: stCustomerProfile.addressId,
            address: value.address,
            locationCode: value.cityCode,
            districtCode: value.districtCode,
            wardCode: value.wardCode,
            gender: value.gender === "" ? null : value.gender,
            birthday: stSendTime ? moment.utc(stSendTime).toISOString() : null,
            socialUserId: props.socialUserId,
            countryCode: value.country,
            address2:value.address2,
            city: value.city,
            zipCode: value.zipCode,
            fbPageId: state.fbUserDetail.pageId
        };
        beehiveService.createCustomerProfileSocialChat(props.type, requestBody)
            .then(result => {
                GSToast.success("page.livechat.customer.details.add.success.msg", true);
                backToPrevious();
            })
            .catch(e => {
                GSToast.commonError();
            })
    };

    const scrollCustomerList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPaging.currentPage < stPaging.totalPage) {
            setStPaging({
                ...stPaging,
                currentPage: stPaging.currentPage + 1
            })
        }
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const closeCustomerList = (e) => {
        setTimeout(() => setShowSearch(e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('gs-mobile-list__row')), 400);
    }

    const openCustomerList = () => {
        setShowSearch(true);
        refInputSearch.current.input.focus();
    }

    useDebounceEffect(() => {
        if (!stSearchUserText) {
            setStPaging(stPaging => ({
                ...stPaging,
                totalPage: 0,
                itemCount: 0,
                currentPage: 1
            }))
            setStCustomerList([])
            return;
        }
        fetchData();
    }, 500, [stSearchUserText, stPaging.currentPage]);

    const fetchData = () => {
        setIsSearching(true);
        const pmGetCustomerList = cancelablePromise(
            beehiveService.getCustomerList(stPaging.currentPage - 1,
                SIZE_PER_PAGE,
                stSearchUserText,
                undefined,
                '',
                {
                    segmentId: undefined
                },
                "",
                true
            )
        );
        pmGetCustomerList.promise
            .then(response => {
                let customerList = response.data;
                setStCustomerList(stPaging.currentPage > 1 ? [...stCustomerList, ...customerList] : customerList);
                setStPaging({
                    ...stPaging,
                    totalPage: Math.ceil(response.total / SIZE_PER_PAGE),
                    totalItem: response.total
                });
                setIsSearching(false);
            })
            .catch(() => [
                setIsSearching(false)
            ])
    };

    const onSearchChange = (e) => {
        const keyword = e.currentTarget.value
        setStSearchUserText(keyword);
        setStPaging({
            ...stPaging,
            currentPage: 1
        });
    };
    const removeCustomer = () => {
        beehiveService.unPinSocialUserWithCustomerProfile(props.type, props.socialUserId).then(full => {
            setStPreviousPhone(null);
            setStCustomerProfile({
                id: undefined,
                fullName: '',
                phone: '',
                email: '',
                gender: '',
                addressId: undefined
            });
            setStSendTime(undefined);
            setStCustomerAddress('');
            setStCustomerLocation('');
            setStDistrict([]);
            setStCustomerDistrict('');
            setStWard([]);
            setStCustomerWard('');
            setStCustomerAddress('');
            setStCustomerAddress2('');
            setStCustomerProvince('')
            setStCustomerCity('')
            setStCustomerZipCode('')
            props.removeProfileId()
        });
    }

    const selectCustomer = (id, isAnyChange) => {
        beehiveService.getCustomerProfileSocialChat(id).then(full => {
            let res = full.customerAddress ? full.customerAddress : {};
            let customer = {
                id: full.id,
                fullName: full.fullName,
                phone: full.phone,
                email: full.email,
                gender: full.gender,
                addressId: res.id
            }

            setStPreviousPhone(full.phone != null ? full.phone : null);
            setStCustomerProfile(customer);

            setStSendTime(full.birthday != null ?
                DateTimeUtils.flatTo(moment(full.birthday), DateTimeUtils.UNIT.MINUTE) : undefined);
            setStartDate(full.birthday != null ? new Date(full.birthday) : null);

            setStCustomerAddress(res.address != null ? res.address : '');

            if (res.locationCode != null) {
                setStCustomerLocation(res.locationCode);
                catalogService.getDistrictsOfCity(res.locationCode).then(district => setStDistrict(district))
            } else {
                setStCustomerLocation('');
                setStDistrict([]);
            }
            if (res.districtCode != null) {
                setStCustomerDistrict(res.districtCode);
                if(stCustomerEditCountry === "VN"){
                    catalogService.getWardsOfDistrict(res.districtCode).then(ward => setStWard(ward))
                }
            } else {
                setStCustomerDistrict('');
                setStWard([]);
            }
            setStCustomerWard(res.wardCode != null ? res.wardCode : '');
            setStIsAnyChange(isAnyChange);
        })
    };

    const phoneValidate = (value, ctx, input, cb) => {
        ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
    };

    const onChangePhoneNumber = (event) => {
        const numberPhone = event.target.value
        setStNumberPhone(numberPhone)
        checkPhoneNumber(numberPhone, stCustomerEditCountry)
    }

    const checkPhoneNumber = (numberPhone, countryCode) => {
        if (numberPhone === stPreviousPhone) {
            setStCheckedNumberPhone(false)
        } else {
            setStIsAnyChange(true);
            if (numberPhone.split('').length >= 8) {
                beehiveService.checkPhoneNumber(numberPhone, countryCode)
                    .then(result => {
                        setStCheckedNumberPhone(result)
                    })
            } else {
                setStCheckedNumberPhone(false)
            }
        }
    }

    const formChanged = () => {
        setStIsAnyChange(true);
    }

    const backToPrevious = () => {
        if (props.callback) {
            props.callback();
        }
    }


    const handleCountry = (countryCode) => {
        if (!countryCode) {
            return
        }
        catalogService.getCitesOfCountry(countryCode).then(res => setStProvince(res))
        setStCustomerEditCountry(countryCode)

        //Set Phone Code
        const countrySelect = stCountries.find(r => r.code === countryCode);
        setPhoneCode(countrySelect.phoneCode)

        //Check phone number
        checkPhoneNumber(stNumberPhone, countryCode)
        formChanged();
    }

    const renderInsideAddressForm = () =>{
        return(
            <>
                {/*ADDRESS*/}
                <AvField
                    label={i18next.t("page.customers.edit.address")}
                    placeHolder={i18next.t("page.customer.addAddress.enterAddress")}
                    name={"address"}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    }}
                    onChange={e => {
                        setStCustomerAddress(e.target.value);
                        formChanged();
                    }}
                    value={stCustomerAddress}
                />
                <AvField
                    type="select"
                    name="cityCode"
                    label={<div
                        className="label-required">{i18next.t("page.products.supplierPage.province")}</div>}
                    onChange={async e => {
                        formChanged();
                        setStCustomerLocation(e.target.value);
                        if (e.target.value !== '') {
                            const districtList = await catalogService.getDistrictsOfCity(e.target.value)
                            setStDistrict(districtList);
                            setStWard([]);
                        } else {
                            setStDistrict([]);
                            setStWard([]);
                        }
                        setStCustomerDistrict('');
                        setStCustomerWard('');
                    }}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                    }}
                    value={stCustomerLocation}
                >
                    <option value={""}>{i18next.t("page.customer.addAddress.selectCity")}</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
                <div className="district-ward col-12 row p-0">
                    <AvField
                        type="select"
                        name="districtCode"
                        label={<div
                            className="label-required">{i18next.t("page.products.supplierPage.district")}</div>}
                        onChange={async e => {
                            formChanged();
                            setStCustomerDistrict(e.target.value);
                            if (e.target.value !== '' && stCustomerEditCountry === "VN") {
                                const wardList = await catalogService.getWardsOfDistrict(e.target.value)
                                setStWard(wardList);
                            } else {
                                setStWard([]);
                            }
                            setStCustomerWard('');
                        }}
                        validate={{
                            ...FormValidate.withCondition(
                                stRequiredAddress,
                                FormValidate.required()
                            ),
                        }}
                        value={stCustomerDistrict}
                    >
                        <option value={""}>{i18next.t("page.customer.addAddress.selectDistrict")}</option>
                        {
                            stDistrict && stDistrict.map((x, index) =>
                                <option value={x.code} key={index}>{x.inCountry}</option>
                            )
                        }
                    </AvField>
                    <AvField
                        type="select"
                        name="wardCode"
                        label={<div className="label-required">{i18next.t("page.products.supplierPage.ward")}</div>}
                        validate={{
                            ...FormValidate.withCondition(
                                stRequiredAddress,
                                FormValidate.required()
                            ),
                        }}
                        onChange={e => {
                            setStCustomerWard(e.target.value);
                            formChanged();
                        }}
                        value={stCustomerWard}>
                        <option value={""}>{i18next.t("page.customer.addAddress.selectWard")}</option>
                        {
                            stWard && stWard.map((x, index) =>
                                <option value={x.code} key={index}>{x.inCountry}</option>
                            )
                        }
                    </AvField>
                </div>
            </>
        )
    }

    const renderOutsideAddressForm = () =>{
        return(
            <>
                {/*ADDRESS*/}
                <AvField
                    disabled={ props.disabled }
                    label={ i18next.t('page.customers.edit.streetAddress') }
                    name={ 'address' }
                    validate={ {
                        ...FormValidate.withCondition(
                            stRequiredAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress') }
                    onChange={ e => {
                        setStCustomerAddress(e.target.value)
                        formChanged();
                    } }
                    value={ stCustomerAddress }
                />
                <AvField
                    disabled={ props.disabled }
                    label={ i18next.t('page.customers.edit.address2') }
                    name={ 'address2' }
                    validate={ {
                        ...FormValidate.maxLength(65)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress2') }
                    onChange={ e => {
                        setStCustomerAddress2(e.target.value)
                        formChanged();
                    } }
                    value={ stCustomerAddress2 }
                />
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
                    onChange={ async e => {
                        setStCustomerProvince(e.target.value)
                        formChanged();
                    } }
                    value={ stCustomerProvince }
                >
                    <option value={ '' }>{ i18next.t('page.customer.addAddress.selectState') }</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={ x.code } key={ index }>{ x.outCountry }</option>
                        )
                    }
                </AvField>
                <div className="district-ward col-12 row p-0">
                    <AvField
                        disabled={ props.disabled }
                        label={ i18next.t('page.customers.edit.city') }
                        name={ 'city' }
                        validate={ {
                            ...FormValidate.withCondition(
                                stRequiredAddress,
                                FormValidate.required()
                            ),
                            ...FormValidate.maxLength(65)
                        } }
                        placeHolder={ i18next.t('page.customer.addAddress.enterCity') }
                        onChange={ e => {
                            setStCustomerCity(e.target.value)
                            formChanged();
                        } }
                        value={ stCustomerCity }
                    />
                    <AvField
                        disabled={ props.disabled }
                        label={ i18next.t('page.customers.edit.zipCode') }
                        name={ 'zipCode' }
                        validate={ {
                            ...FormValidate.withCondition(
                                stRequiredAddress,
                                FormValidate.required()
                            ),
                            ...FormValidate.maxLength(25)
                        } }
                        placeHolder={ i18next.t('page.customer.addAddress.enterZipCode') }
                        onChange={ e => {
                            setStCustomerZipCode(e.target.value)
                            formChanged();
                        } }
                        value={ stCustomerZipCode }
                    />
                </div>
            </>
        )
    }

    return (
        <div className={'fb-chat-customer-profile'}>
            <div className='page-header d-flex pl-2 mb-3'>
                <img src="/assets/images/icon-arrow-back.png" onClick={backToPrevious} className={'cursor--pointer'}/>
                <span className="section-title">
                    <Trans i18nKey="page.facebook.chat.customer.details.customer.information"/>
                </span>
            </div>

            {stCustomerProfile.id === undefined &&
            <div className={'search-bar d-flex flex-column w-100 pl-2 pr-2'}>
                <div className="search-box__wrapper"
                     onClick={openCustomerList}
                     onBlur={closeCustomerList}
                     id="dropdownSuggestionCustomer"
                >
                    <UikInput
                        ref={refInputSearch}
                        onChange={onSearchChange}
                        icon={(
                            <FontAwesomeIcon icon="search"/>
                        )}
                        placeholder={i18next.t("page.customers.searchCustomer")}
                        value={stSearchUserText}
                    />
                </div>
                <div
                    hidden={!showSearch}
                    style={{display: 'flex', top: '12px'}}
                    className="dropdown-menu dropdown-menu-right search-list__result font-weight-normal"
                    onScroll={scrollCustomerList}
                    onBlur={closeCustomerList}>
                    {stCustomerList.map(item => {
                        let fullAddressDiv = () => (
                            <div id={`full-address-${item.id}`} className="full-address line-clamp-2" style={{textOverflow: 'ellipsis', whiteSpace: 'normal'}}>
                                {item.customerAddress || ''}
                            </div>
                        )

                        return (
                            <div className="gs-mobile-list__row"
                                 key={'m' + item.id}
                                 onClick={() =>
                                 {
                                     selectCustomer(item.id, true)
                                     fetchDataCustomerAddress(item.id)
                                 }
                                 }>
                                <div className="d-flex flex-column w-100">
                                    <div className="d-flex flex-row justify-content-between">
                                        <div className="mobile-customer-profile-row__info">
                                            <div className="mobile-customer-profile-row__left">
                                                <div className="full-name font-weight-bold">{item.fullName}</div>
                                            </div>
                                        </div>
                                        <div
                                            className="mobile-customer-profile-row__info gs-atm__flex-align-items--end">
                                            <div className="mobile-customer-profile-row__right">
                                                ID: {item.id}
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        (item.primaryPhone || item.email || item.customerAddress)
                                        &&
                                        <div className="d-flex flex-row">
                                            <div className="card bg-light text-dark my-2 w-100">
                                                <div className="card-body p-2">
                                                    <div>
                                                        {item.phone || ''}
                                                    </div>
                                                    <div style={{color: '#9EA0A5'}}>
                                                        {item.email || ''}
                                                    </div>
                                                    {
                                                        item.isFullAddressOverflowed
                                                            ? <GSComponentTooltip
                                                                message={item.customerAddress}
                                                                placement={GSTooltip.PLACEMENT.BOTTOM}>
                                                                { fullAddressDiv() }
                                                            </GSComponentTooltip>
                                                            : fullAddressDiv()
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        )
                    })}

                    <div className="gs-mobile-list__row gs-mobile-list__row__lastchild justify-content-center"
                         style={{
                             height: isSearching ? '100px' : ((!stCustomerList || stCustomerList.length === 0) && !stSearchUserText ? '50px' : '150px'),
                             display: stCustomerList.length === 0 ? 'flex' : 'none'
                         }}>
                        {isSearching && <Loading style={LoadingStyle.ELLIPSIS_GREY}/>}
                        {
                            (!isSearching && (!stCustomerList || stCustomerList.length === 0) && stSearchUserText) &&
                            <GSWidgetEmptyContent
                                iconSrc="/assets/images/search-not-found.png"
                                text={i18next.t("page.livechat.customer.details.search.no.result")}/>
                        }
                        {
                            (!isSearching && (!stCustomerList || stCustomerList.length === 0) && !stSearchUserText) &&
                            i18next.t('page.livechat.customer.details.search.no.input')
                        }
                    </div>
                </div>
            </div>
            }

            {stCustomerProfile.id !== undefined &&
            <div className={'d-flex pl-2 pr-2 justify-content-between'}>
                <span className={'selected-customer-name'}>{stCustomerProfile.fullName}</span>
                <span className={'cursor--pointer'} onClick={removeCustomer}><img src="/assets/images/icon-close.png"/></span>
            </div>
            }
            <AvForm onValidSubmit={handleValidSubmit} autoComplete="off" ref={refAddCustomerForm}>
                <div className={'d-flex'}>
                    <div className="pl-2 pr-2 w-100">
                        <div className='section-header d-flex'>
                            <img className={'icon-customer'} src="/assets/images/icon_customer.png"/>
                            <span className="section-title">
                                <Trans i18nKey="page.facebook.chat.customer.details.personal.information"/>
                            </span>
                        </div>
                        {/*FULL NAME*/}
                        <AvField
                            label={i18next.t("page.customers.edit.fullName")}
                            name={"fullName"}
                            validate={{
                                ...FormValidate.required(),
                                ...FormValidate.maxLength(100, true)
                            }}
                            placeholder={i18next.t("page.customers.placeholder.fullName")}
                            value={stCustomerProfile.fullName}
                            onChange={formChanged}
                        />
                        {/*PHONE*/}
                        <div className={String(stPhoneCode).length > 3 ? 'phone maxPhoneCode' : 'phone'}>
                            <span className='phone-country'>(+{stPhoneCode})</span>
                            <AvField
                                key={stCustomerProfile.phone}
                                label={i18next.t("page.customers.edit.phone")}
                                name={"phone"}
                                className={stCheckedNumberPhone ? "isBorderCheck" : ""}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(1_000_000, false),
                                    ...FormValidate.pattern.numberOrEnter(),
                                    async: phoneValidate
                                }}
                                placeholder={i18next.t("page.customers.placeholder.phone")}
                                value={stCustomerProfile.phone}
                                onBlur={onChangePhoneNumber}
                                type={"number"}
                            />
                        </div>
                        {stCheckedNumberPhone &&
                        <div className="invalid-check">{i18next.t("common.validation.check.phone")}</div>}
                        {/*EMAIL*/}
                        <AvField
                            label={i18next.t("page.customers.edit.email")}
                            name={"email"}
                            type={"email"}
                            validate={{
                                ...FormValidate.email(),
                                ...FormValidate.maxLength(100)
                            }}
                            placeholder={i18next.t("page.customers.placeholder.email")}
                            value={stCustomerProfile.email}
                            onChange={formChanged}
                        />
                        {/*GENDER*/}
                        <AvField
                            type="select"
                            name="gender"
                            label={`${i18next.t("page.customers.edit.gender")}`}
                            className='dropdown-box w-100'
                            value={stCustomerProfile.gender}
                            onChange={formChanged}>
                            {GENDER_OPTIONS.map(gender => {
                                return (
                                    <option key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </option>
                                )
                            })}
                        </AvField>

                        <div className='form-group birth-date'>
                            <label>
                                {i18next.t("page.notification.editor.eventBirthday")}
                            </label>
                            <div className="position-relative">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => handleChangeBirthday(date)}
                                    placeholderText="dd/mm/yyyy"
                                    dateFormat="dd/MM/yyyy"
                                    dropdownMode="select"
                                    showMonthDropdown
                                    showYearDropdown
                                    adjustDateOnChange
                                    maxDate={new Date()}
                                    ref={refBirthday}
                                />
                                <FontAwesomeIcon onClick={()=>{refBirthday.current.deferFocusInput()}} icon={['far', 'calendar-alt']} color="#939393" style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '0.8rem',
                                    cursor: "text"
                                }}/>
                            </div>
                        </div>

                        <div className='section-header d-flex'>
                            <img src="/assets/images/icon_location_fb.png"/>
                            <span className="section-title">
                                <Trans i18nKey="page.customers.edit.address"/>
                            </span>
                        </div>

                        {/*COUNTRY*/}
                        <AvField
                            type="select"
                            name="country"
                            label={`${i18next.t("page.customers.edit.country")}`}
                            className='dropdown-box country'
                            value={stCustomerEditCountry || COUNTRY_CODE_DEFAULT}
                            onChange={e => handleCountry(e.target.value)}
                        >
                            {stCountries.map(country => {
                                return (
                                    <option key={country.code} value={country.code}>
                                        {country.outCountry}
                                    </option>
                                )
                            })}
                        </AvField>

                        {stCustomerEditCountry === 'VN' && renderInsideAddressForm()}
                        {stCustomerEditCountry !== 'VN' && renderOutsideAddressForm()}
                    </div>
                </div>

                <div className={'d-flex justify-content-end mb-2'}>
                    <GSButton default buttonType="button" onClick={backToPrevious}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton marginLeft success disabled={stCheckedNumberPhone || !stIsAnyChange}>
                        <GSTrans t={"common.btn.save"}/>
                    </GSButton>
                </div>
            </AvForm>
        </div>
    )
}

export default PinCustomer;

PinCustomer.propTypes = {
    customerProfileId: PropTypes.number,
    socialUserId: PropTypes.string.isRequired,
    callback: PropTypes.func,
    type: PropTypes.oneOf([Constants.GO_CHAT_TYPE.FACEBOOK, Constants.GO_CHAT_TYPE.ZALO]),
    sellerPageId: PropTypes.string,
    removeProfileId: PropTypes.func
}
