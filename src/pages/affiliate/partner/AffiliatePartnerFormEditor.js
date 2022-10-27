import React, {useEffect, useRef, useState} from "react";
import "./AffiliatePartnerFormEditor.sass";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import {NAV_PATH} from "../../../components/layout/navigation/AffiliateNavigation";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Link} from "react-router-dom";
import Constants from "../../../config/Constant";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import {UikCheckbox, UikWidget, UikWidgetContent, UikWidgetHeader,} from "../../../@uik";
import {AvField, AvForm} from "availity-reactstrap-validation";
import i18next from "i18next";
import {FormValidate} from "../../../config/form-validate";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import catalogService from "../../../services/CatalogService";
import affiliateService from "../../../services/AffiliateService";
import {CredentialUtils} from "../../../utils/credential";
import {GSToast} from "../../../utils/gs-toast";
import ConfirmModal, {ConfirmModalUtils} from "../../../components/shared/ConfirmModal/ConfirmModal";
import {RouteUtils} from "../../../utils/route";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import Loading from "../../../components/shared/Loading/Loading";
import {CurrencyUtils} from "../../../utils/number-format";

const PARTNER_TYPE = {
    RESELLER: "RESELLER",
    DROP_SHIP: "DROP_SHIP",
};
const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()
const STORE_COUNTRY_CODE = CredentialUtils.getStoreCountryCode()
const COUNTRY_CODE_DEFAULT = CurrencyUtils.getLocalStorageCountry()

const AffiliatePartnerFormEditor = props => {

    const refSaveForm = useRef()
    const refExistPhoneNumber = useRef()
    const refPhoneDuplicateStoreModal = useRef()
    const refPhoneDuplicateBuyerModal = useRef()
    const refCheckPackageModal = useRef()
    const refOutsideClick = useRef();
    const refCancelModal = useRef();
    const [stEditorMode, setStEditorMode] = useState(null)
    const [expanded, setExpanded] = useState(false);
    const [selectionsCommissionRate, setSelectionsCommissionRate] = useState([]);
    const [stBankCity, setStBankCity] = useState([]);
    const [stRequiredAddAddress, setStRequiredAddAddress] = useState(false);
    const [stCustomerAddAddress, setStCustomerAddAddress] = useState('');
    const [stCustomerAddLocation, setStCustomerAddLocation] = useState('');
    const [stCustomerAddDistrict, setStCustomerAddDistrict] = useState('');
    const [stCustomerAddWard, setStCustomerAddWard] = useState('');
    const [stProvince, setStProvince] = useState([])
    const [stDistrict, setStDistrict] = useState([])
    const [stWard, setStWard] = useState([])
    const [stBankList, setStBankList] = useState([])
    const [stStoreAffiliatesOfStore, setStStoreAffiliatesOfStore] = useState()
    const [stPartnerType, setStPartnerType] = useState([])
    const [stAllowUpdatePrice, setStAllowUpdatePrice] = useState(false)
    const [stAllCommissions, setStAllCommissions] = useState([])
    const [stUncheckAll, setStUncheckAll] = useState(
        {
            RESELLER: false,
            DROP_SHIP: false
        }
    )
    const [stRegexPartnerCode, setStRegexPartnerCode] = useState(false)
    const [stPartner, setStPartner] = useState();
    const [stCheckPartnerCode, setStCheckPartnerCode] = useState(false);
    const [stCustomerEditLocation, setStCustomerEditLocation] = useState('');
    const [stCustomerEditDistrict, setStCustomerEditDistrict] = useState('');
    const [stCustomerEditWard, setStCustomerEditWard] = useState('');
    const [stRequiredEditAddress, setStRequiredEditAddress] = useState(false);
    const [stCustomerEditAddress, setStCustomerEditAddress] = useState('');
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stLoadingCommission, setStLoadingCommission] = useState(false);
    const [stConflictCommission, setStConflictCommission] = useState(
        {
            commission1: '',
            commission2: '',
            isChecked: false
        }
    );
    const [stErrorDeleteCommission, setStErrorDeleteCommission] = useState(false);
    const [stCurrentBankCountry, setStCurrentBankCountry] = useState(STORE_COUNTRY_CODE);
    const [stBankCountries, setStBankCountries] = useState([]);

    const [stCountryList, setStCountryList] = useState('');
    const [stCountryCode, setStCountryCode] = useState(COUNTRY_CODE_DEFAULT);
    const [stPhoneCode, setPhoneCode] = useState('0');
    const [stCustomerAddAddress2, setStCustomerAddAddress2] = useState('');
    const [stCustomerAddCityName, setStCustomerAddCityName] = useState('');
    const [stCustomerAddZipCode, setStCustomerAddZipCode] = useState('');
    const [stCustomerEditAddress2, setStCustomerEditAddress2] = useState('');
    const [stCustomerEditCityName, setStCustomerEditCityName] = useState('');
    const [stCustomerEditZipCode, setStCustomerEditZipCode] = useState('');
    const [stIsDisableCountryCode, setStIsDisableCountryCode] = useState(false);

    useEffect(() => {
        if(stCountryCode === 'VN'){
            let isRequired = stCustomerAddAddress !== '' || stCustomerAddLocation !== ''
                || stCustomerAddDistrict !== '' || stCustomerAddWard !== '';
            setStRequiredAddAddress(isRequired);
            if (refSaveForm.current) {
                refSaveForm.current.setTouched('address');
                refSaveForm.current.setTouched('cityCode');
                refSaveForm.current.setTouched('districtCode');
                refSaveForm.current.setTouched('wardCode');
                if (!isRequired) {
                    refSaveForm.current.validateAll();
                }
            }
        }
    }, [stCustomerAddAddress, stCustomerAddLocation, stCustomerAddDistrict, stCustomerAddWard]);

    useEffect(() => {
        if(stCountryCode === 'VN') {
            let isRequired = stCustomerEditAddress !== '' || stCustomerEditLocation !== ''
                || stCustomerEditDistrict !== '' || stCustomerEditWard !== '';
            setStRequiredEditAddress(isRequired);
            if (refSaveForm.current) {
                refSaveForm.current.setTouched('address');
                refSaveForm.current.setTouched('cityCode');
                refSaveForm.current.setTouched('districtCode');
                refSaveForm.current.setTouched('wardCode');
                if (!isRequired) {
                    refSaveForm.current.validateAll();
                }
            }
        }
    }, [stCustomerEditAddress, stCustomerEditLocation, stCustomerEditDistrict, stCustomerEditWard]);

    useEffect(() => {
        //setStBankList(bankData); //removed get list bank on local

        catalogService.getListBankInfo()
            .then((result) => {
                setStBankList(result);
            })

        affiliateService.getAllStoreAffiliatesOfStore()
            .then(storeAffiliatesOfStore => {
                setStStoreAffiliatesOfStore(storeAffiliatesOfStore)
                setStUncheckAll({
                    RESELLER: storeAffiliatesOfStore?.find(type => type.type == PARTNER_TYPE.RESELLER)?.isTurnOn,
                    DROP_SHIP: storeAffiliatesOfStore?.find(type => type.type == PARTNER_TYPE.DROP_SHIP)?.isTurnOn
                })
                let partnerType = []

                storeAffiliatesOfStore.forEach(type => {
                    if (type.isTurnOn) {
                        partnerType.push(type.type)
                    }
                })
                setStPartnerType(partnerType)
            })
    }, [])


    useEffect(() => {
        catalogService.getCitesOfCountry(Constants.CountryCode.VIETNAM)
        .then(citesOfCountry => {
            const cities = citesOfCountry.map(x => {
                return {value: x.code, label: x.inCountry};
            })
            setStBankCity(cities);
        })
    },[])

    useEffect(() => {
        const path = props.match?.path
        const partnerId = props.match?.params?.partnerId
        if (path.includes(NAV_PATH.affiliatePartnerEdit)) {
            setStEditorMode(Constants.PURCHASE_ORDER_MODE.EDIT)

            affiliateService.getPartnerById(partnerId).then(result => {
                affiliateService.activatePartner(result.data.partnerType)
                    .then(activatePartner => {
                        if (!activatePartner.data.hasPackagePlan) {
                            props.history.push(NAV_PATH.affiliatePartner);
                        }
                    })

                affiliateService.getAllCommissionsByStore()
                    .then(allCommissionsByStore => {
                        let commissionIDs = []
                        result.data.commissions.forEach(commission => {
                            if (allCommissionsByStore.data.find(id => id.id === commission.id)) {
                                commissionIDs = [...commissionIDs, commission.id]
                            } else {
                                setStErrorDeleteCommission(true)
                            }
                        })
                        setSelectionsCommissionRate(commissionIDs)
                        setStAllCommissions(allCommissionsByStore.data)
                    })
                setStCurrentBankCountry(result.data.payment.countryCode)
                setStPartner(result.data)
                setStAllowUpdatePrice(result.data.allowUpdatePrice)
                if (result.data.address != null) {
                    setStCustomerEditAddress(result.data.address);
                }
                if (result.data.address != null) {
                    setStCustomerEditAddress2(result.data.address2);
                }
                if (result.data.address != null) {
                    setStCustomerEditCityName(result.data.city);
                }
                if (result.data.address != null) {
                    setStCustomerEditZipCode(result.data.zipCode);
                }
                if (result.data.cityCode != null) {
                    setStCustomerEditLocation(result.data.cityCode);
                    catalogService.getDistrictsOfCity(result.data.cityCode).then(district => setStDistrict(district))
                }
                if (result.data.districtCode != null) {
                    setStCustomerEditDistrict(result.data.districtCode);
                    catalogService.getWardsOfDistrict(result.data.districtCode).then(ward => setStWard(ward))
                }
                if (result.data.wardCode != null) {
                    setStCustomerEditWard(result.data.wardCode);
                }
                //Set country code default store
                const countryCode = result.data.countryCode
                setStCountryCode(countryCode)

                //Set provine
                catalogService.getCitesOfCountry(countryCode)
                    .then(citesOfCountry=>{
                        setStProvince(citesOfCountry)
                    })

                //Get list country
                catalogService.getCountries()
                    .then(countryList => {
                        setStBankCountries(countryList)
                        setStCountryList(countryList)
                        //Set phone code
                        const countrySelect = countryList.find(r => countryCode.includes(r.code));
                        setPhoneCode(countrySelect.phoneCode)
                    })
            })
        } else {
            setStEditorMode(Constants.PURCHASE_ORDER_MODE.CREATE)
            affiliateService.getAllCommissionsByStore()
                .then(allCommissionsByStore => {
                    setStAllCommissions(allCommissionsByStore.data)
                })

            //Set provine
            catalogService.getCitesOfCountry(COUNTRY_CODE_DEFAULT)
                .then(citesOfCountry=>{
                    setStProvince(citesOfCountry)
                })

            //Get list country
            catalogService.getCountries()
                .then(countryList => {
                    setStBankCountries(countryList)
                    setStCountryList(countryList)
                    const countrySelect = countryList.find(r => COUNTRY_CODE_DEFAULT.includes(r.code));
                    setPhoneCode(countrySelect.phoneCode)
                })
        }
    }, [])

    useEffect(() => {
        //Check disable country Code
        if (stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT){
            if (stPartner?.partnerType === PARTNER_TYPE.RESELLER){
                setStIsDisableCountryCode(true)

                //set Country Code Default
                setStCountryCode(COUNTRY_CODE_DEFAULT)

                //set Phone Code Default Country
                setPhoneCodeByCountry(COUNTRY_CODE_DEFAULT)
            } else {
                setStIsDisableCountryCode(false)
            }
        } else {
            if ((stUncheckAll.DROP_SHIP && stUncheckAll.RESELLER) || stUncheckAll.RESELLER){
                setStIsDisableCountryCode(true)

                //set Country Code Default
                setStCountryCode(COUNTRY_CODE_DEFAULT)

                //set Phone Code Default Country
                setPhoneCodeByCountry(COUNTRY_CODE_DEFAULT)
            } else {
                setStIsDisableCountryCode(false)
            }
        }
    }, [])

    const setPhoneCodeByCountry = async (countryCode) => {
        const countrySelect = await stCountryList.find(r => countryCode.includes(r.code));
        setPhoneCode(countrySelect.phoneCode)
    }

    const handleSubmitSave = (event, value) => {
        const partnerTypes = _.uniq(stPartnerType);
        const request = {
            storeId: +(CredentialUtils.getStoreId()),
            name: value.name,
            email: value.email,
            phoneNumber: value.phoneNumber,
            partnerTypes: stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT ? stPartner.partnerType : partnerTypes,
            address: value.address,
            cityCode: value.cityCode,
            districtCode: value.districtCode,
            wardCode: value.wardCode,
            payment: {
                bankName: value.bankName,
                bankBranchName: value.bankBranchName,
                bankCity: value.bankCity,
                accountHolder: value.accountHolder,
                accountNumber: String(value.accountNumber),
                swiftCode: value.swiftCode,
                countryCode: value.bankCountryCode,
                routingNumber: stCurrentBankCountry === Constants.CountryCode.US? value.routingNumber : null,
               
            },
            partnerCode: value.partnerCode,
            allowUpdatePrice: stAllowUpdatePrice,
            commissionIds: selectionsCommissionRate,
            address2: value.address2,
            city: value.cityName,
            zipCode: value.zipCode,
            countryCode:value.countryCode
        }

        if (selectionsCommissionRate.length > 0) {
            setStIsLoading(true)
            if (stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT) {
                request["id"] = stPartner.id
                affiliateService.updatePartnerByStore(request)
                    .then(result => {
                        setStIsLoading(false)
                        GSToast.commonUpdate()
                    })

                return
            }
            let checkDuplicate = 0;
            partnerTypes.forEach(type => {
                affiliateService.activatePartner(type).then(active => {
                    if (!active.data.hasApproval) {
                        setStIsLoading(false)
                        ConfirmModalUtils.openModal(refCheckPackageModal, {
                            messages: <>
                                <p className="reject-description">{i18next.t("page.affiliate.partner.modal.active", {x: active.data.numberOfPartner})}</p>
                            </>,
                            modalTitle: i18next.t`common.txt.confirm.modal.title`,
                            modalBtnOk: i18next.t`productList.btn.updateNow`,
                            okCallback: () => {
                                RouteUtils.redirectWithReload(NAV_PATH.settingsAffiliatePlans, {
                                    serviceType: type
                                })

                            },
                        })
                        return
                    }

                    if (partnerTypes.length === 1) {
                        affiliateService.createPartnerByStore(request).then(result => {
                            setStIsLoading(false)
                            GSToast.commonCreate()
                            props.history.push(NAV_PATH.affiliatePartner)
                        }).catch(error => {
                            setStIsLoading(false)
                            if (error.response.data.errorKey == "partner.already.has.store") {
                                ConfirmModalUtils.openModal(refPhoneDuplicateStoreModal, {
                                    messages: <>
                                        <p className="reject-description">{i18next.t("page.affiliate.partner.create.storeModal")}</p>
                                    </>,
                                    modalTitle: i18next.t`common.txt.confirm.modal.title`,
                                    okCallback: () => {

                                    },
                                })
                                return
                            }
                            if (error.response.data.errorKey == "partner.already.exist") {
                                ConfirmModalUtils.openModal(refPhoneDuplicateBuyerModal, {
                                    messages: <>
                                        <p className="reject-description">{i18next.t("page.affiliate.partner.create.buyerModal")}</p>
                                    </>,
                                    modalTitle: i18next.t`common.txt.confirm.modal.title`,
                                    okCallback: () => {

                                    },
                                })
                            }
                        }).finally(() => {
                            setStIsLoading(false)
                        })
                    }

                    if (checkDuplicate++ === 1 && partnerTypes.length === 2) {
                        affiliateService.createPartnerByStore(request).then(result => {
                            setStIsLoading(false)
                            if (result.userAlreadyExist) {
                                ConfirmModalUtils.openModal(refPhoneDuplicateBuyerModal, {
                                    messages: <>
                                        <p className="reject-description">{i18next.t("page.affiliate.partner.create.buyerModal")}</p>
                                    </>,
                                    modalTitle: i18next.t`common.txt.confirm.modal.title`,
                                    okCallback: () => {
                                        GSToast.commonCreate()
                                        props.history.push(NAV_PATH.affiliatePartner)
                                    },
                                })
                                return
                            }
                            GSToast.commonCreate()
                            props.history.push(NAV_PATH.affiliatePartner)
                        }).catch(error => {
                            setStIsLoading(false)
                            if (error.response.data.errorKey == "partner.already.has.store") {
                                ConfirmModalUtils.openModal(refPhoneDuplicateStoreModal, {
                                    messages: <>
                                        <p className="reject-description">{i18next.t("page.affiliate.partner.create.storeModal")}</p>
                                    </>,
                                    modalTitle: i18next.t`common.txt.confirm.modal.title`,
                                    okCallback: () => {
                                    },
                                })
                                return
                            }

                            if (error.response.data.errorKey == "partner.already.exist") {
                                ConfirmModalUtils.openModal(refPhoneDuplicateBuyerModal, {
                                    messages: <>
                                        <p className="reject-description">{i18next.t("page.affiliate.partner.exist")}</p>
                                    </>,
                                    modalTitle: i18next.t`common.txt.confirm.modal.title`,
                                    okCallback: () => {

                                    },
                                })
                            }

                        }).finally(() => {
                            setStIsLoading(false)
                        })
                    }
                })
            })
        }
    }

    const changeCommissionRate = event => {
        if (event.target.checked) {
            setStLoadingCommission(true)
            let commissions = [...selectionsCommissionRate, +(event.target.name)]
            let commissionEvent = event.target.name
            affiliateService.checkCommissionsConflict(commissions).then(result => {
                setStLoadingCommission(false)
                if (Object.keys(result).length > 0) {
                    const filtered = selectionsCommissionRate.filter(name => name !== +(commissionEvent));
                    setSelectionsCommissionRate(filtered);
                    document.getElementById(commissionEvent).checked = false
                    setStConflictCommission(
                        {
                            commission1: result[Object.keys(result)[0]][0],
                            commission2: Object.keys(result)[0],
                            isChecked: true
                        }
                    )
                } else {
                    setSelectionsCommissionRate([...selectionsCommissionRate, +(commissionEvent)]);
                    setStConflictCommission(
                        {
                            commission1: "",
                            commission2: "",
                            isChecked: false
                        }
                    )
                }
            }).catch(() => {
                setStLoadingCommission(false)
                const filtered = selectionsCommissionRate.filter(name => name !== +(commissionEvent));
                setSelectionsCommissionRate(filtered);
                document.getElementById(commissionEvent).checked = false
                GSToast.commonError()
            })
            return
        }
        setStConflictCommission(
            {
                commission1: "",
                commission2: "",
                isChecked: false
            }
        )
        const filtered = selectionsCommissionRate.filter(name => name !== +(event.target.name));
        return setSelectionsCommissionRate(filtered);
    };

    const handlePartnerType = (e) => {
        if (e.target.checked) {
            setStUncheckAll((prevState) => ({
                ...prevState,
                [e.target.name]: true
            }));
            return setStPartnerType([...stPartnerType, e.target.name]);
        }
        const filtered = stPartnerType.filter(type => type !== e.target.name);
        if (filtered.length === 0) {
            return
        }
        setStUncheckAll((prevState) => ({
            ...prevState,
            [e.target.name]: false
        }));
        return setStPartnerType(filtered);
    }

    const handlePartnerCode = (e) => {
        let regexPartnerCode = new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
        setStRegexPartnerCode(!regexPartnerCode.test(e.target.value.toUpperCase()))
        if (e.target.value != "") {
            affiliateService.checkPartnerCode(e.target.value.toUpperCase()).then(checkCode => {
                setStCheckPartnerCode(!checkCode.data)
            })
        }
    }

    const buildUrlLink = () => {
        const prefix = window.location.origin
        let url = prefix + NAV_PATH.affiliateCommissionCreate
        return url
    }

    const useOutsideClick = (ref, callback) => {
        const handleClick = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                callback();
            }
        };
        useEffect(() => {
            document.addEventListener("click", handleClick);
            return () => {
                document.removeEventListener("click", handleClick);
            };
        });
    };

    useOutsideClick(refOutsideClick, () => {
        setExpanded(false)
        setStConflictCommission(
            {
                commission1: "",
                commission2: "",
                isChecked: false
            }
        )
    });

    const handleCancel = () => {
        ConfirmModalUtils.openModal(refCancelModal, {
            messages: <>
                <p className="reject-description">{i18next.t("component.product.addNew.cancelHint")}</p>
            </>,
            modalTitle: i18next.t`common.txt.confirm.modal.title`,
            okCallback: () => {
                props.history.push(NAV_PATH.affiliatePartner)
            },
        })
    }

    const onChangeCountryCode = async (e) => {
        let value = e.target.value
        setStCountryCode(value)

        const countrySelect = await stCountryList.find(r => value.includes(r.code));
        setPhoneCode(countrySelect.phoneCode)

        const proviceList =
            await catalogService.getCitesOfCountry(value);
        setStProvince(proviceList);
    }

    const renderInsideAddressForm = () => {
        return (
            <>
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE &&
                <div className="col-sm-9 p-0">
                    <AvField
                        label={i18next.t("page.customers.edit.address")}
                        placeHolder={i18next.t("page.customer.addAddress.enterAddress")}
                        name={"address"}
                        validate={{
                            ...FormValidate.withCondition(
                                stPartnerType.find(type=>type === PARTNER_TYPE.RESELLER) ? true : false,
                                FormValidate.required()
                            ),
                            ...FormValidate.maxLength(100)
                        }}
                        onChange={e => {
                            setStCustomerAddAddress(e.target.value)
                        }}
                        value={Constants.PURCHASE_ORDER_MODE.CREATE ?
                            stCustomerAddAddress : stPartner?.address}
                    />
                </div>
                }

                {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE &&
                <div className="row col-sm-9 p-0">
                    <div className="col-sm-4 pl-sm-0">
                        <AvField
                            type="select"
                            name="cityCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.province")}</div>}
                            onChange={async e => {
                                setStCustomerAddLocation(e.target.value);
                                if (e.target.value !== '') {
                                    const districtList = await catalogService.getDistrictsOfCity(e.target.value)
                                    setStDistrict(districtList);
                                    setStWard([]);
                                } else {
                                    setStDistrict([]);
                                    setStWard([]);
                                }
                            }}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartnerType.find(type=>type === PARTNER_TYPE.RESELLER) ? true : false,
                                    FormValidate.required()
                                ),
                            }}
                            value={stCustomerAddLocation}
                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectCity")}</option>
                            {
                                stProvince && stProvince.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </div>

                    <div className="col-sm-4">
                        <AvField
                            type="select"
                            name="districtCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.district")}</div>}
                            onChange={async e => {
                                setStCustomerAddDistrict(e.target.value);
                                if (e.target.value !== '') {
                                    const wardList = await catalogService.getWardsOfDistrict(e.target.value)
                                    setStWard(wardList);
                                } else {
                                    setStWard([]);
                                }
                            }}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartnerType.find(type=>type === PARTNER_TYPE.RESELLER) ? true : false,
                                    FormValidate.required()
                                ),
                            }}
                            value={stCustomerAddDistrict}
                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectDistrict")}</option>
                            {
                                stDistrict && stDistrict.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>

                    </div>

                    <div className="col-sm-4 pr-sm-0">
                        <AvField
                            type="select"
                            name="wardCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.ward")}</div>}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartnerType.find(type=>type === PARTNER_TYPE.RESELLER) ? true : false,
                                    FormValidate.required()
                                ),
                            }}
                            onChange={e => {
                                setStCustomerAddWard(e.target.value)
                            }}
                            value={stCustomerAddWard}>
                            <option value={""}>{i18next.t("page.customer.addAddress.selectWard")}</option>
                            {
                                stWard && stWard.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </div>
                </div>
                }

                {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                <div className="col-sm-9 p-0">
                    <AvField
                        label={i18next.t("page.customers.edit.address")}
                        name={"address"}
                        placeHolder={i18next.t("page.customer.addAddress.enterAddress")}
                        validate={{
                            ...FormValidate.withCondition(
                                stPartner?.partnerType === PARTNER_TYPE.RESELLER && stRequiredEditAddress,
                                FormValidate.required()
                            ),
                            ...FormValidate.maxLength(255)
                        }}
                        onChange={e => {
                            setStCustomerEditAddress(e.target.value)
                        }}
                        value={stCustomerEditAddress}
                    />
                </div>
                }

                {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                <div className="row col-sm-9 p-0">
                    <div className="col-sm-4 pl-sm-0">
                        <AvField
                            type="select"
                            name="cityCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.province")}</div>}
                            onChange={async e => {
                                setStCustomerEditLocation(e.target.value);
                                if (e.target.value !== '') {
                                    const districtList = await catalogService.getDistrictsOfCity(e.target.value)
                                    setStDistrict(districtList);
                                    setStWard([]);
                                } else {
                                    setStDistrict([]);
                                    setStWard([]);
                                }
                                setStCustomerEditDistrict('');
                                setStCustomerEditWard('');
                            }}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartner?.partnerType === PARTNER_TYPE.RESELLER && stRequiredEditAddress,
                                    FormValidate.required()
                                ),
                            }}
                            value={stCustomerEditLocation}

                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectCity")}</option>
                            {
                                stProvince && stProvince.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </div>

                    <div className="col-sm-4">
                        <AvField
                            type="select"
                            name="districtCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.district")}</div>}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartner?.partnerType === PARTNER_TYPE.RESELLER && stRequiredEditAddress,
                                    FormValidate.required()
                                ),
                            }}
                            onChange={async e => {
                                if (e.target.value !== '') {
                                    const wardList = await catalogService.getWardsOfDistrict(e.target.value)
                                    setStWard(wardList);
                                } else {
                                    setStWard([]);
                                }
                                setStCustomerEditWard('');
                            }}
                            value={stCustomerEditDistrict}
                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectDistrict")}</option>
                            {
                                stDistrict && stDistrict.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>

                    </div>

                    <div className="col-sm-4 pr-sm-0">
                        <AvField
                            type="select"
                            name="wardCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.ward")}</div>}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartner?.partnerType === PARTNER_TYPE.RESELLER && stRequiredEditAddress,
                                    FormValidate.required()
                                ),
                            }}
                            onChange={e => {
                                setStCustomerEditWard(e.target.value)
                            }}
                            value={stCustomerEditWard}
                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectWard")}</option>
                            {
                                stWard && stWard.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </div>
                </div>
                }
            </>
        )
    }

    const renderOutsideAddressForm = () => {
        return (
            <>
                {/*Input address outside*/}
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE &&
                <div className="col-sm-9 p-0">
                    <AvField
                        label={i18next.t("page.products.supplierPage.streetAddress")}
                        placeHolder={i18next.t("page.customer.addAddress.enterAddress")}
                        name={"address"}
                        validate={{
                            ...FormValidate.withCondition(
                                stPartnerType.find(type => type === PARTNER_TYPE.RESELLER) ? true : false,
                                FormValidate.required()
                            ),
                            ...FormValidate.maxLength(100)
                        }}
                        onChange={e => {
                            setStCustomerAddAddress(e.target.value)
                        }}
                        value={stCustomerAddAddress}
                    />
                </div>
                }
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                <div className="col-sm-9 p-0">
                    <AvField
                        label={i18next.t("page.customers.edit.address")}
                        name={"address"}
                        placeHolder={i18next.t("page.customer.addAddress.enterAddress")}
                        validate={{
                            ...FormValidate.withCondition(
                                stPartner?.partnerType === PARTNER_TYPE.RESELLER && stRequiredEditAddress,
                                FormValidate.required()
                            ),
                            ...FormValidate.maxLength(255)
                        }}
                        onChange={e => {
                            setStCustomerEditAddress(e.target.value)
                        }}
                        value={stCustomerEditAddress}
                    />
                </div>
                }

                {/*Input address2 outside*/}
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE &&
                <div className="col-sm-9 p-0">
                    <AvField
                        type={'text'}
                        disabled={props.disabled}
                        label={i18next.t('page.customers.edit.address2')}
                        name={'address2'}
                        value={stCustomerAddAddress2}
                        validate={{
                            ...FormValidate.maxLength(255)
                        }}
                        onChange={e => {
                            setStCustomerAddAddress2(e.target.value)
                        }}
                        placeHolder={i18next.t('page.customer.addAddress.enterAddress2')}
                    />
                </div>
                }
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                <div className="col-sm-9 p-0">
                    <AvField
                        type={'text'}
                        disabled={props.disabled}
                        label={i18next.t('page.customers.edit.address2')}
                        name={'address2'}
                        value={stCustomerEditAddress2}
                        validate={{
                            ...FormValidate.maxLength(255)
                        }}
                        onChange={e => {
                            setStCustomerAddAddress2(e.target.value)
                        }}
                        placeHolder={i18next.t('page.customer.addAddress.enterAddress2')}
                    />
                </div>
                }

                {/*Input City Name & City / Province & Zip Code*/}
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE &&
                <div className="row col-sm-9 p-0">
                    <div className="col-sm-4 pl-sm-0">
                        <AvField
                            type={'text'}
                            label={i18next.t("page.customers.edit.city")}
                            name={'cityName'}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartnerType.find(type => type === PARTNER_TYPE.RESELLER) ? true : false,
                                    FormValidate.required()
                                ),
                                ...FormValidate.maxLength(65)
                            }}
                            placeHolder={i18next.t('page.customer.addAddress.enterCity')}
                            onChange={async e => {
                                setStCustomerAddCityName(e.target.value);
                            }}
                            value={stCustomerAddCityName}
                        />
                    </div>
                    <div className="col-sm-4">
                        <AvField
                            type="select"
                            name="cityCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.province")}</div>}
                            onChange={async e => {
                                setStCustomerAddLocation(e.target.value);
                            }}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartnerType.find(type => type === PARTNER_TYPE.RESELLER) ? true : false,
                                    FormValidate.required()
                                ),
                            }}
                            value={stCustomerAddLocation}
                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectState")}</option>
                            {
                                stProvince && stProvince.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </div>
                    <div className="col-sm-4 pr-sm-0">
                        <AvField
                            type={'text'}
                            label={i18next.t("page.customers.edit.zipCode")}
                            name={'zipCode'}
                            validate={{
                                ...FormValidate.maxLength(25),
                                ...FormValidate.withCondition(
                                    stPartnerType.find(type => type === PARTNER_TYPE.RESELLER) ? true : false,
                                    FormValidate.required()
                                ),
                            }}
                            placeHolder={i18next.t('page.customer.addAddress.enterZipCode')}
                            onChange={async e => {
                                setStCustomerAddZipCode(e.target.value);
                            }}
                            value={stCustomerAddZipCode}
                        />
                    </div>
                </div>
                }
                {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                <div className="row col-sm-9 p-0">
                    <div className="col-sm-4 pl-sm-0">
                        <AvField
                            type={'text'}
                            label={i18next.t("page.customers.edit.city")}
                            name={'cityName'}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartner?.partnerType === PARTNER_TYPE.RESELLER,
                                    FormValidate.required()
                                ),
                                ...FormValidate.maxLength(65)
                            }}
                            placeHolder={i18next.t('page.customer.addAddress.enterCity')}
                            onChange={async e => {
                                setStCustomerEditCityName(e.target.value);
                            }}
                            value={stCustomerEditCityName}
                        />
                    </div>
                    <div className="col-sm-4">
                        <AvField
                            type="select"
                            name="cityCode"
                            label={<div
                                className="label-required">{i18next.t("page.products.supplierPage.province")}</div>}
                            onChange={async e => {
                                setStCustomerEditLocation(e.target.value);
                            }}
                            validate={{
                                ...FormValidate.withCondition(
                                    stPartner?.partnerType === PARTNER_TYPE.RESELLER,
                                    FormValidate.required()
                                ),
                            }}
                            value={stCustomerEditLocation}
                        >
                            <option value={""}>{i18next.t("page.customer.addAddress.selectState")}</option>
                            {
                                stProvince && stProvince.map((x, index) =>
                                    <option value={x.code} key={index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </div>
                    <div className="col-sm-4 pr-sm-0">
                        <AvField
                            type={'text'}
                            label={i18next.t("page.customers.edit.zipCode")}
                            name={'zipCode'}
                            validate={{
                                ...FormValidate.maxLength(25),
                                ...FormValidate.withCondition(
                                    stPartner?.partnerType === PARTNER_TYPE.RESELLER,
                                    FormValidate.required()
                                ),
                            }}
                            placeHolder={i18next.t('page.customer.addAddress.enterZipCode')}
                            onChange={async e => {
                                setStCustomerEditZipCode(e.target.value);
                            }}
                            value={stCustomerEditZipCode}
                        />
                    </div>
                </div>
                }
            </>
        )
    }

    const renderHeader = () => {
        switch (stEditorMode) {
            case Constants.PURCHASE_ORDER_MODE.CREATE:
                return (
                    <>
                        <div className="purchase-order-form-header">
                            <div className='title'>
                                <Link to={NAV_PATH.affiliatePartner}
                                      className="color-gray mb-2 d-block text-capitalize">
                                    &#8592; <GSTrans t="page.affiliate.commission.partners.partnerManagement"/>
                                </Link>
                                <h5 className="gs-page-title">
                                    {
                                        <GSTrans t="page.affiliate.commission.partners.create"/>
                                    }
                                </h5>
                            </div>
                        </div>
                        <GSContentHeaderRightEl>
                            <div className='gss-content-header--action-btn'>
                                <div className='gss-content-header--action-btn--group'>
                                    {/*BTN SAVE*/}
                                    <GSButton onClick={(e) => {
                                        e.preventDefault()
                                        refSaveForm.current.submit()
                                    }} success className="btn-save" marginRight style={{marginLeft: 'auto'}}>
                                        <Trans i18nKey={'common.btn.save'} className="sr-only">
                                            Save
                                        </Trans>
                                    </GSButton>
                                    {/*BTN CANCEL*/}
                                    <Link to={NAV_PATH.affiliatePartner}
                                          className="color-gray mb-2 d-block text-capitalize text-decoration-none">
                                        <GSButton secondary outline marginLeft>
                                            <Trans i18nKey="common.btn.cancel">
                                                Cancel
                                            </Trans>
                                        </GSButton>
                                    </Link>
                                </div>
                            </div>
                        </GSContentHeaderRightEl>
                    </>
                )

            case Constants.PURCHASE_ORDER_MODE.EDIT:
                return (
                    <>
                        <>
                            <div className="purchase-order-form-header">
                                <div className='title'>
                                    <Link to={NAV_PATH.affiliatePartner}
                                          className="color-gray mb-2 d-block text-capitalize">
                                        &#8592; <GSTrans t="page.affiliate.commission.partners.partnerManagement"/>
                                    </Link>
                                    <h5 className="gs-page-title">
                                        {
                                            <GSTrans>{stPartner && stPartner.name}</GSTrans>
                                        }
                                    </h5>
                                </div>
                            </div>
                            <GSContentHeaderRightEl>
                                <div className='gss-content-header--action-btn'>
                                    <div className='gss-content-header--action-btn--group'>
                                        {/*BTN SAVE*/}
                                        <GSButton onClick={(e) => {
                                            e.preventDefault()
                                            refSaveForm.current.submit()
                                        }} success className="btn-save" marginRight style={{marginLeft: 'auto'}}>
                                            <Trans i18nKey={'common.btn.save'} className="sr-only">
                                                Save
                                            </Trans>
                                        </GSButton>
                                        {/*BTN CANCEL*/}
                                        <GSButton onClick={handleCancel} secondary outline marginLeft>
                                            <Trans i18nKey="common.btn.cancel">
                                                Cancel
                                            </Trans>
                                        </GSButton>
                                    </div>
                                </div>
                            </GSContentHeaderRightEl>
                        </>
                    </>
                )
            default:
                return (<></>)
        }
    }

    const handleChangeBankCountry = (countryCode) => {
        if (!countryCode) return
        setStCurrentBankCountry(countryCode)
    }

    const renderInsidePaymentForm = () => {
        return (
            <div className="row col-sm-9 p-0">
                <div className="col-sm-6 pl-sm-0">
                    <AvField
                        label={`${i18next.t("page.affiliate.commission.partners.bankAccountName")}`}
                        name="accountHolder"
                        type={'text'}
                        className='input-field__hint'
                        placeholder={`${i18next.t("page.affiliate.commission.partners.accountHolderName")}`}
                        validate={{
                            ...FormValidate.maxLength(65)
                        }}
                        value={stPartner?.payment.accountHolder}
                    />
                </div>
                <div className="col-sm-6 pr-sm-0">
                    <AvField
                        type="select"
                        name="bankName"
                        label={`${i18next.t("page.affiliate.commission.partners.bankName")}`}
                        className='dropdown-box w-100'
                        value={stPartner ? stPartner?.payment.bankName : stBankList[0]?.id}
                    >
                        {stBankList.map(bank => {
                            return (
                                <option key={bank.id} value={bank.id}>
                                    {bank.bankName}
                                </option>
                            )
                        })}
                    </AvField>
                </div>
                <div className="col-sm-6 pl-sm-0">
                    <AvField
                        label={`${i18next.t("page.affiliate.commission.partners.accountNumber")}`}
                        name="accountNumber"
                        type={'text'}
                        className='input-field__hint'
                        placeholder={`${i18next.t("page.affiliate.commission.partners.bankNumber")}`}
                        validate={{}}
                        value={stPartner?.payment.accountNumber}
                    />
                </div>
                <div className="col-sm-6 pr-sm-0">
                    <AvField
                        label={`${i18next.t("page.affiliate.commission.partners.branchName")}`}
                        name="bankBranchName"
                        type={'text'}
                        className='input-field__hint'
                        placeholder={`${i18next.t("page.affiliate.commission.partners.branchName")}`}
                        validate={{
                            ...FormValidate.maxLength(150)
                        }}
                        value={stPartner?.payment.bankBranchName}
                    />
                </div>
                <div className="col-sm-6"/>
                <div className="col-sm-6 pr-sm-0">
                    <AvField
                        type="select"
                        name="bankCity"
                        label={`${i18next.t("common.txt.street.cityProvince")}`}
                        className='dropdown-box w-100'
                        value={stPartner ? stPartner?.payment.bankCity : stBankCity[0]?.value}
                    >
                        {stBankCity.map(bank => {
                            return (
                                <option key={bank.value} value={bank.value}>
                                    {bank.label}
                                </option>
                            )
                        })}
                    </AvField>
                </div>
            </div>
        );
    }

    const renderOutsidePaymentForm = () => {
        return (
            <div className="row col-sm-9 p-0">
                <div className="col-sm-6 pl-sm-0">
                    <AvField
                        className='input-field__hint'
                        label={`${i18next.t("page.affiliate.commission.partners.accountHolderName")}`}
                        name="accountHolder"
                        placeholder={`${i18next.t("page.affiliate.commission.partners.accountHolderName")}`}
                        type={'text'}
                        validate={{
                            ...FormValidate.maxLength(150)
                        }}
                        value={stPartner?.payment.accountHolder}
                    />
                </div>
                <div className="col-sm-6 pr-sm-0">
                    <AvField
                        className='input-field__hint'
                        name="bankName"
                        label={`${i18next.t("page.affiliate.commission.partners.bankName")}`}
                        placeholder={`${i18next.t("page.affiliate.commission.partners.bankName")}`}
                        type="text"
                        value={stPartner ? stPartner?.payment.bankName : ''}
                        validate={{
                            ...FormValidate.maxLength(250)
                        }}
                    />
                </div>
                <div className="col-sm-6 pl-sm-0">
                    <AvField
                        className='input-field__hint'
                        label={`${i18next.t("page.affiliate.commission.partners.accountNumber")}`}
                        name="accountNumber"
                        placeholder={`${i18next.t("page.affiliate.commission.partners.bankNumber")}`}
                        type={'text'}
                        validate={{
                            ...FormValidate.maxLength(100),
                            ...FormValidate.integerNumber()
                        }}
                        value={stPartner?.payment.accountNumber}
                    />
                </div>
                <div className="col-sm-6 pr-sm-0">
                    <AvField
                        className='input-field__hint'
                        label={`${i18next.t("page.affiliate.commission.partners.swiftCode")}`}
                        name="swiftCode"
                        placeholder={`${i18next.t("page.affiliate.commission.partners.swiftCode")}`}
                        type={'text'}
                        validate={{
                            ...FormValidate.maxLength(65),
                        }}
                        value={stPartner?.payment.swiftCode ? stPartner?.payment.swiftCode : ''}
                    />
                </div>
                <div className="col-sm-6"/>
                {stCurrentBankCountry === Constants.CountryCode.US && (
                    <div className="col-sm-6 pr-sm-0">
                        <AvField
                            className='input-field__hint'
                            label={`${i18next.t("page.affiliate.commission.partners.routingNumber")}`}
                            name="routingNumber"
                            placeholder={`${i18next.t("page.affiliate.commission.partners.routingNumber")}`}
                            type="text"
                            validate={{
                                ...FormValidate.maxLength(100),
                                ...FormValidate.integerNumber()
                            }}
                            value={stPartner ? stPartner?.payment.routingNumber : ''}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <GSContentContainer minWidthFitContent className="affiliate-partner-form-editor">
            {stIsLoading && <LoadingScreen zIndex={9999}/>}
            <ConfirmModal ref={refPhoneDuplicateStoreModal} modalClass={"phone-duplicate-modal"}/>
            <ConfirmModal ref={refPhoneDuplicateBuyerModal} modalClass={"phone-duplicate-modal"}/>
            <ConfirmModal ref={refCheckPackageModal} modalClass={"phone-duplicate-modal"}/>
            <ConfirmModal ref={refExistPhoneNumber} modalClass={""}/>
            <ConfirmModal ref={refCancelModal} modalClass={"partner-cancel-modal"}/>
            <GSContentHeader>
                {renderHeader()}
            </GSContentHeader>
            <AvForm ref={refSaveForm} onValidSubmit={handleSubmitSave} autoComplete="off" className="w-100">
                <GSContentBody size={GSContentBody.size.MAX}
                               className="affiliate-partner-form-editor__body-desktop d-desktop-flex">
                    <div className="row w-100 ">
                        {/*revenue information*/}
                        {
                            stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                            <UikWidget className="gs-widget">
                                <UikWidgetHeader className="gs-widget__header">
                                    <Trans i18nKey="page.affiliate.partner.edit.revenueInformation"/>
                                </UikWidgetHeader>
                                <UikWidgetContent className="gs-widget__content order-info-sm d-flex">
                                    <div className="row col-12 p-0">
                                        <div className="col-sm-3 col-6 revenue-information">
                                            <div className="content">
                                                <div className="img-descriptions">
                                                    <div className="img1"></div>
                                                    <p>{i18next.t("page.dashboard.chart.totalOrder")}</p>
                                                </div>
                                                <div className="total">{stPartner ? stPartner?.summaryInfo?.totalOrder : 0}</div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-6 revenue-information">
                                            <div className="content">
                                                <div className="img-descriptions">
                                                    <div className="img2"></div>
                                                    <p>{i18next.t("page.dashboard.chart.totalRevenue")}</p>
                                                </div>
                                                <div className="total">
                                                    {CurrencyUtils.formatMoneyByCurrency(stPartner ? stPartner?.summaryInfo?.totalRevenue : 0, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-6 revenue-information">
                                            <div className="content">
                                                <div className="img-descriptions">
                                                    <div className="img3"></div>
                                                    <p>{i18next.t("page.affiliate.partner.edit.totalCommission")}</p>
                                                </div>
                                                <div className="total">
                                                    {CurrencyUtils.formatMoneyByCurrency(stPartner ? stPartner?.summaryInfo?.totalCommission : 0, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-6 revenue-information">
                                            <div className="content">
                                                <div className="img-descriptions">
                                                    <div className="img4"></div>
                                                    <p>{i18next.t("page.affiliate.partner.edit.approvedCommission")}</p>
                                                </div>
                                                <div className="total">
                                                    {CurrencyUtils.formatMoneyByCurrency(stPartner ? stPartner?.summaryInfo?.approvedAmount : 0, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-6 revenue-information">
                                            <div className="content">
                                                <div className="img-descriptions">
                                                    <div className="img5"></div>
                                                    <p>{i18next.t("page.affiliate.partner.edit.paidAmount")}</p>
                                                </div>
                                                <div className="total">
                                                    {CurrencyUtils.formatMoneyByCurrency(stPartner ? stPartner?.summaryInfo?.paidAmount : 0, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-6 revenue-information">
                                            <div className="content">
                                                <div className="img-descriptions">
                                                    <div className="img6"></div>
                                                    <p>{i18next.t("page.affiliate.partner.edit.unpaidAmount")}</p>
                                                </div>
                                                <div className="total">
                                                    {CurrencyUtils.formatMoneyByCurrency(stPartner ? stPartner?.summaryInfo?.unpaidAmount : 0, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </UikWidgetContent>
                            </UikWidget>
                        }
                        {/*partner type*/}
                        <UikWidget className="gs-widget">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.affiliate.commission.partners.type"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm d-flex">
                                {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT &&
                                    <div className="d-flex align-items-center checkbox">
                                        <Trans i18nKey={`page.affiliate.partner.filter.partnerType.${stPartner && stPartner.partnerType}`} />
                                    </div>
                                }
                                {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE &&
                                    <>
                                        <div className="d-flex align-items-center checkbox">
                                            <UikCheckbox
                                                className="custom-check-box m-0"
                                                disabled={stStoreAffiliatesOfStore?.find(type => type.type == PARTNER_TYPE.RESELLER)?.isTurnOn ? false : true}
                                                checked={stUncheckAll.RESELLER}
                                                name={PARTNER_TYPE.RESELLER}
                                                onChange={(e) => handlePartnerType(e)}
                                            />
                                            <Trans i18nKey="page.affiliate.partner.filter.partnerType.RESELLER" />
                                        </div>
                                        <div className="d-flex align-items-center ml-5 checkbox">
                                            <UikCheckbox
                                                className="custom-check-box m-0"
                                                disabled={stStoreAffiliatesOfStore?.find(type => type.type == PARTNER_TYPE.DROP_SHIP)?.isTurnOn ? false : true}
                                                checked={stUncheckAll.DROP_SHIP}
                                                name={PARTNER_TYPE.DROP_SHIP}
                                                onChange={(e) => handlePartnerType(e)}
                                            />
                                            <Trans i18nKey="page.affiliate.partner.filter.partnerType.DROP_SHIP" />
                                        </div>
                                    </>
                                }
                            </UikWidgetContent>
                        </UikWidget>
                        <UikWidget className="gs-widget">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.affiliate.commission.partners.accountInformation"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">
                                <div className="row col-sm-10 p-0">
                                    <div className="row col-sm-9 p-0">
                                        <div className="col-sm-6 pl-sm-0">
                                            <AvField
                                                type="select"
                                                name="countryCode"
                                                label={i18next.t("page.customers.edit.country")}
                                                value={
                                                    stCountryCode
                                                        ? stCountryCode
                                                        : i18next.t(
                                                        "page.products.supplierPage.selectCountry"
                                                        )
                                                }
                                                onChange={(e) => onChangeCountryCode(e)}
                                                disabled={stIsDisableCountryCode}
                                            >
                                                <option value={""}>
                                                    {i18next.t(
                                                        "page.products.supplierPage.selectCountry"
                                                    )}
                                                </option>
                                                {stCountryList &&
                                                stCountryList.map((x, index) => (
                                                    <option value={x.code} key={index}>
                                                        {x.outCountry}
                                                    </option>
                                                ))}
                                            </AvField>
                                        </div>
                                    </div>

                                    <div className="col-sm-9 p-0">
                                        <AvField
                                            label={`${i18next.t("page.order.detail.billingAddress.name") + "*"}`}
                                            name={'name'}
                                            type={'text'}
                                            validate={{
                                                ...FormValidate.required(),
                                                ...FormValidate.minLength(3),
                                                ...FormValidate.maxLength(65)
                                            }}
                                            value={stPartner?.name}
                                        />
                                    </div>
                                    <div className="row col-sm-9 p-0">
                                        <div className="col-sm-6 pl-sm-0">
                                            <AvField
                                                label={`${i18next.t("common.txt.email") + "*"}`}
                                                name="email"
                                                type={'text'}

                                                validate={{
                                                    ...FormValidate.withCondition(
                                                        stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE
                                                        , FormValidate.required()),
                                                    ...FormValidate.email(),
                                                    ...FormValidate.maxLength(65)
                                                }}
                                                value={stPartner?.email}
                                            />
                                        </div>

                                        <div className={String(stPhoneCode).length > 3 ? 'col-md-6 phone-supplier maxPhoneCode' : 'col-md-6 phone-supplier'}>
                                            <span className='phone-country'>(+{stPhoneCode})</span>
                                            <AvField
                                                label={`${i18next.t("page.order.list.filter.searchType.PHONE_NUMBER") + "*"}`}
                                                name="phoneNumber"
                                                type={'text'}
                                                validate={{
                                                    ...FormValidate.required(),
                                                    ...FormValidate.pattern.phoneNumber(),
                                                    ...FormValidate.minLength(10),
                                                    ...FormValidate.maxLength(15)
                                                }}
                                                value={stPartner?.phoneNumber}
                                            />
                                        </div>
                                    </div>

                                    {stCountryCode === 'VN' && renderInsideAddressForm()}
                                    {stCountryCode !== 'VN' && renderOutsideAddressForm()}
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        {/*commission information*/}
                        <UikWidget className="gs-widget commission-information">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.affiliate.commission.partners.commissionInformation"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">
                                <div className="row col-sm-10 p-0">
                                    <div className="row col-sm-9 p-0">
                                        <div className="col-sm-6 pl-sm-0">
                                            <AvField
                                                label={`${i18next.t("page.affiliate.commission.partners.partnerCode")}`}
                                                name="partnerCode"
                                                type={'text'}
                                                validate={{
                                                    ...FormValidate.minLength(8, true, 'page.affiliate.partner.partnerCode.error'),
                                                    ...FormValidate.maxLength(8),
                                                    ...FormValidate.withCondition(
                                                        stRegexPartnerCode,
                                                        FormValidate.pattern.custom(/^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})+$/, 'page.affiliate.partner.validation.partnerCode')
                                                    ),
                                                    ...FormValidate.withCondition(
                                                        stCheckPartnerCode,
                                                        FormValidate.step(true, 'page.affiliate.partner.validation.exists.partnerCode')
                                                    ),
                                                }}
                                                onBlur={handlePartnerCode}
                                                className="text-uppercase"
                                                value={stPartner?.partnerCode}
                                                disabled={stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE ? false : true}
                                            />
                                        </div>
                                        <div className="col-sm-6 pr-sm-0 commission-rate"
                                             style={{marginBottom: stErrorDeleteCommission ? "30px" : "0px"}}>
                                            <p className="commission-title">{i18next.t("page.affiliate.commission.partners.commissionRate")}</p>
                                            <div
                                                className={selectionsCommissionRate.length == 0 ? "commission-options validation" : "commission-options"}>
                                                <div onClick={() => {
                                                    setExpanded(true)
                                                    setStErrorDeleteCommission(false)
                                                    affiliateService.getAllCommissionsByStore()
                                                        .then(allCommissionsByStore => {
                                                            setStAllCommissions(allCommissionsByStore.data)
                                                        })
                                                }}>
                                                    <div className="options-checked">
                                                        {selectionsCommissionRate.length
                                                            ?
                                                            <span>
                                                                {selectionsCommissionRate.length} {i18next.t("page.affiliate.commission.partners.commission")}
                                                            </span>
                                                            : i18next.t("page.affiliate.commission.partners.selectCommission")}
                                                    </div>
                                                </div>
                                                {expanded && (
                                                    <div className="options-rate border-gray-200 border border-solid"
                                                        ref={refOutsideClick}
                                                    >
                                                        {stLoadingCommission && <Loading/>}
                                                        {stAllCommissions.length === 0 &&
                                                            <div className="label">
                                                                {i18next.t("page.affiliate.partner.commission.create")}
                                                                <a className="font-weight-bold font-italic ml-1"
                                                                   href={`${buildUrlLink()}`}
                                                                   target="_blank"
                                                                   rel="noopener noreferrer"> {i18next.t("page.affiliate.partner.commission.create2")}</a>
                                                            </div>
                                                        }
                                                        {
                                                            stAllCommissions.length > 0 &&
                                                            <>
                                                                <div className={'label-list'}>
                                                                    {stAllCommissions.map(commissionRate => (
                                                                        <div className="label" key={commissionRate.id}>
                                                                            <input
                                                                                checked={selectionsCommissionRate.find(checked => checked == commissionRate.id)}
                                                                                id={commissionRate.id}
                                                                                type="checkbox"
                                                                                name={commissionRate.id}
                                                                                value={commissionRate.id}
                                                                                onChange={changeCommissionRate}
                                                                                className="m-2 cursor-pointer"
                                                                            />
                                                                            <label htmlFor={commissionRate.id} className="block m-0">
                                                                                {commissionRate.name}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="modal-footer-commission">
                                                                    {stConflictCommission.isChecked &&
                                                                        <p>
                                                                            {i18next.t("page.affiliate.partner.modal.error", {
                                                                                x1: stConflictCommission.commission1,
                                                                                x2: stConflictCommission.commission2
                                                                            })}
                                                                        </p>
                                                                    }
                                                                    <GSButton onClick={() => {
                                                                        setExpanded(false)
                                                                        setStConflictCommission(
                                                                            {
                                                                                commission1: "",
                                                                                commission2: "",
                                                                                isChecked: false
                                                                            }
                                                                        )
                                                                    }} success
                                                                              className="btn-save"
                                                                              marginRight style={{marginLeft: 'auto'}}>
                                                                        <Trans i18nKey={'common.btn.done'}
                                                                               className="sr-only">
                                                                            Save
                                                                        </Trans>
                                                                    </GSButton>
                                                                </div>
                                                            </>
                                                        }
                                                    </div>
                                                )}
                                                {
                                                    selectionsCommissionRate.length === 0 && !stErrorDeleteCommission &&
                                                    <div className={'validation-commission'}>
                                                        <span>{i18next.t('page.affiliate.partner.create.nullCommission')}</span>
                                                        <br/>
                                                    </div>
                                                }
                                                {
                                                    stErrorDeleteCommission &&
                                                    <div className={'validation-delete-commission'}>
                                                        <span>{i18next.t('page.affiliate.partner.create.errorDeleteCommission')}</span>
                                                        <br/>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="note">
                                    <p>
                                        <GSTrans t="page.affiliate.commission.partners.note" values={{x: "partner code"}} />
                                    </p>
                                    {(stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE && (stPartnerType.find(type => type === PARTNER_TYPE.RESELLER) ? true : false))
                                        &&
                                        <div className="d-flex align-items-center">
                                            <UikCheckbox
                                                className="custom-check-box m-0"
                                                onChange={(e) => setStAllowUpdatePrice(e.target.checked)}
                                                checked={stAllowUpdatePrice}
                                            />
                                            <Trans i18nKey="page.affiliate.commission.partners.allowPartner" />
                                        </div>
                                    }
                                    {stPartner?.partnerType == PARTNER_TYPE.RESELLER
                                        &&
                                        <div className="d-flex align-items-center">
                                            <UikCheckbox
                                                className="custom-check-box m-0"
                                                onChange={(e) => setStAllowUpdatePrice(e.target.checked)}
                                                checked={stAllowUpdatePrice}
                                            />
                                            <Trans i18nKey="page.affiliate.commission.partners.allowPartner" />
                                        </div>
                                    }
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <UikWidget className="gs-widget payment-information">
                            <UikWidgetHeader className="gs-widget__header">
                                <Trans i18nKey="page.affiliate.commission.partners.paymentInformation"/>
                            </UikWidgetHeader>
                            <UikWidgetContent className="gs-widget__content order-info-sm">
                                <div className="row col-sm-10 p-0">
                                    <div className="row col-sm-10 p-0">
                                        <AvField
                                            type="select"
                                            name="bankCountryCode"
                                            label={`${i18next.t("page.customers.edit.country")}`}
                                            className='dropdown-box country'
                                            value={stCurrentBankCountry ? stCurrentBankCountry : STORE_COUNTRY_CODE}
                                            onChange={e => handleChangeBankCountry(e.target.value)}
                                        >
                                            {stBankCountries.map(country => {
                                                return (
                                                    <option key={country.code} value={country.code}>
                                                        {country.outCountry}
                                                    </option>
                                                );
                                            })}
                                        </AvField>
                                    </div>
                                    {stCurrentBankCountry === Constants.CountryCode.VIETNAM ? renderInsidePaymentForm() : renderOutsidePaymentForm()}
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                    </div>
                </GSContentBody>
            </AvForm>
        </GSContentContainer>
    );
};

AffiliatePartnerFormEditor.defaultProps = {}

AffiliatePartnerFormEditor.propTypes = {};

export default AffiliatePartnerFormEditor;
