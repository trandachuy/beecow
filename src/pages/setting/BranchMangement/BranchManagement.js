/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/11/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import './BranchManagement.sass';
import {UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../@uik';
import {Trans} from 'react-i18next';
import GSButton from '../../../components/shared/GSButton/GSButton';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import GSWidgetEmptyContent from '../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent';
import i18next from 'i18next';
import {Col, FormGroup, Label, Modal, Row} from 'reactstrap';
import ModalBody from 'reactstrap/es/ModalBody';
import {AvCheckbox, AvCheckboxGroup, AvField, AvForm} from 'availity-reactstrap-validation';
import {FormValidate} from '../../../config/form-validate';
import GSActionButton, {GSActionButtonIcons} from '../../../components/shared/GSActionButton/GSActionButton';
import storeService from '../../../services/StoreService';
import Constants from '../../../config/Constant';
import PagingTable from '../../../components/shared/table/PagingTable/PagingTable';
import GSTable from '../../../components/shared/GSTable/GSTable';
import authenticate from '../../../services/authenticate';
import catalogService from '../../../services/CatalogService';
import moment from 'moment';
import {GSToast} from '../../../utils/gs-toast';
import i18n from '../../../config/i18n';
import {Tooltip} from 'react-tippy';
import {TokenUtils} from '../../../utils/token';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal';
import {withRouter} from 'react-router-dom/cjs/react-router-dom.min';
import AlertModal, {AlertModalType} from '../../../components/shared/AlertModal/AlertModal';
import Loading, {LoadingStyle} from '../../../components/shared/Loading/Loading';
import {CredentialUtils} from '../../../utils/credential';
import storageService from '../../../services/storage';
import AvFieldPhone from '../../../components/shared/AvFieldPhone/AvFieldPhone';
import {AddressUtils} from '../../../utils/address-utils'

let defaultPhoneCode = 84

const STORE_COUNTRY_CODE = CredentialUtils.getStoreCountryCode()

const BranchManagement = (props) => {

    const SIZE_PER_PAGE = 20;
    const hasFreeOrLeadPackage = () => {
        if(!TokenUtils.getPackageFeatures()) {
            return true;
        }
        return TokenUtils.onlyFreeOrLeadPackage();
    };
    const BRANCH_TYPE = {
        "FREE": "FREE",
        "PAID": "PAID"
    };
    const BRANCH_STATUS = {
        "ACTIVE": true,
        "INACTIVE": false,
        true: "ACTIVE",
        false: "INACTIVE"
    };
    const refConfirmChangeStatus = useRef();
    const refAlertChangeStatus = useRef();
    const [totalPage, setTotalPage] = useState(1);
    const [totalItem, setTotalItem] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [stLoadingPage, setStLoadingPage] = useState(false);
    const [stFreeLoading, setStFreeLoading] = useState(false);
    const [stPaidLoading, setStPaidLoading] = useState(false);
    const [stOrderPackage, setStOrderPackage] = useState(null);
    const [freeBranch, setFreeBranch] = useState([]);
    const [paidBranch, setPaidBranch] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);
    const [addressInfo, setAddressInfo] = useState({
        cities: [],
        districts: [],
        wards: []
    });
    const [stCountries, setStCountries] = useState([]);
    const [stProvince, setStProvince] = useState([]);
    const [stCustomerCountryOutside, setStCustomerCountryOutside] = useState(STORE_COUNTRY_CODE);
    const [stCustomerLocationOutside, setStCustomerLocationOutside] = useState('');
    const [stCustomerCityOutside, setStCustomerCityOutside] = useState('');
    const [stCustomerZipCodeOutside, setStCustomerZipCodeOutside] = useState('');
    const [stPhoneCode, setPhoneCode] = useState(defaultPhoneCode);   

    useEffect(() => {
        fetchCommonData();
        return () => {
        };
    }, []);

    useEffect(  () => {
        catalogService.getCitesOfCountry(STORE_COUNTRY_CODE)
        .then(res => {
            setStProvince(res)
        })
        
        catalogService.getCountries()
            .then(countries => {
                setStCountries(countries)
                const countrySelect = countries.find(r => r.code === STORE_COUNTRY_CODE);
                setPhoneCode(countrySelect.phoneCode)
                defaultPhoneCode = countrySelect.phoneCode
            })
            .catch(err => console.log(err))
    }, [])

    const fetchCommonData = async () => {
        try {
            setStLoadingPage(true);
            fetchFreeBranch();
            fetchPaidBranch();
            const catalog = await catalogService.getCitiesTreeByCountryCode(STORE_COUNTRY_CODE);
            let orderPackage = await storeService.getLastOrderOfStoreBranch();
            setAddressInfo({...addressInfo, ...{cities: catalog}});
            if(orderPackage && Object.keys(orderPackage).length === 0) {
                orderPackage = null;
            }
            setStOrderPackage(orderPackage);
        } catch(e) {
            console.log(e);
            GSToast.commonError();
        } finally {
            setStLoadingPage(false);
        }
    }

    const buildAddress = (address, wardCode, districtCode, cityCode, countryCode, optionalFields = {
        address2: '',
        city: '',
        zipCode: ''
    }) => {
        return AddressUtils.buildAddressWithCountry(address, districtCode, wardCode, cityCode, countryCode, {
            fullAddress: true
        }, optionalFields)
    }

    const fetchAddressList = branch => {
        const fetchAddressPromise = []

        branch.forEach(branch => {
            fetchAddressPromise.push(
                buildAddress(branch.address, branch.ward, branch.district, branch.city, branch.countryCode, {
                    address2: branch.address2,
                    city: branch.cityName,
                    zipCode: branch.zipCode
                })
                    .then(fullAddress => branch.fullAddress = fullAddress)
            )
        })

        return Promise.all(fetchAddressPromise)
    }

    const fetchFreeBranch = async (page = currentPage - 1, size = SIZE_PER_PAGE) => {
        try {
            setStFreeLoading(true);
            const resFreeBranch = await storeService.getAllStoreBranch(page, SIZE_PER_PAGE, BRANCH_TYPE.FREE);

            fetchAddressList(resFreeBranch.data)
                .then(() => setFreeBranch(resFreeBranch.data))

        } catch (error) {
            console.log(error);
            GSToast.commonError();
        } finally {
            setStFreeLoading(false);
        }
    }

    const fetchPaidBranch = async (page = currentPage - 1, size = SIZE_PER_PAGE) => {
        setStPaidLoading(true);
        try {
            const resPaidBranch = await storeService.getAllStoreBranch(page, size, BRANCH_TYPE.PAID);
            const totalCount = parseInt(resPaidBranch.headers['x-total-count']);
            const iTotalPage = Math.ceil(totalCount / size);

            fetchAddressList(resPaidBranch.data)
                .then(() => setPaidBranch(resPaidBranch.data))

            setTotalPage(iTotalPage);
            setTotalItem(totalCount);
        } catch (error) {
            console.log(error);
            GSToast.commonError();
        } finally {
            setStPaidLoading(false);
        }
    }

    const isExpired = () => {
        if(stOrderPackage) {
            const now = moment(new Date()).format("YYYY-MM-DD");
            const expiryDate = moment(stOrderPackage.expiryDate).format("YYYY-MM-DD");
            if(expiryDate > now) {
                return false;
            }
        }
        return true;
    }

    const isExceedLimitBranch = () => {
        if(stOrderPackage && totalItem < stOrderPackage.numberPackage) {
            return false;
        }
        return true;
    }

    const onChangeListPage = (pageIndex) => {
        setCurrentPage(pageIndex);
        fetchPaidBranch(pageIndex - 1, SIZE_PER_PAGE);
    };

    const onClickOpenPlan = () => {
        RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.settingsBranchPlans);
    }

    const onClickCancelAddBranch = () => {
        if(refConfirmChangeStatus) {
            refConfirmChangeStatus.current.openModal({
                messages: i18next.t(`component.product.addNew.cancelHint`),
                modalBtnOk: i18next.t("common.btn.ok"),
                okCallback: () => {
                    setCurrentBranch(null);
                    setStCustomerCountryOutside(STORE_COUNTRY_CODE)
                    setPhoneCode(defaultPhoneCode)
                    setShowModal(false);
                },
                cancelCallback: (e) => {
                }
            })
        }
    }

    const onOpenModalAddBranch = () => {

        //open buy branch package plan for first time
        if(!stOrderPackage || isExceedLimitBranch()) {
            const totalPackage = (stOrderPackage && stOrderPackage.numberPackage)? (stOrderPackage.numberPackage + 1): 1;
            refConfirmChangeStatus.current.openModal({
                messages: <GSTrans t={"page.setting.branch.modal.upgrade.message"} values={{x: totalPackage}}></GSTrans>,
                modalBtnOk: i18next.t("common.btn.buynow"),
                okCallback: () => {
                    onClickOpenPlan();
                },
                cancelCallback: (e) => {
                }
            });
            return;
        }

        //not allow add branch while expired package
        if(isExpired()) {
            return onClickOpenPlan();
        }

        setCurrentBranch({
            id: null,
            name: "",
            code: "",
            address: "",
            city: "",
            district: "",
            ward: "",
            phoneNumberFirst: "",
            email: "",
            hasDefault: false,
            isDefault: false,
            status: true,
            index: -1,
            branchStatus: BRANCH_STATUS.true,
            branchType: BRANCH_TYPE.PAID,
            storeId: authenticate.getStoreId()
        });
        setShowModal(true);
    }

    const fetchAddressInfoByCountryCode = (branch) => {
        let districts = [];
        let wards = [];
        const isDefault = (branch && branch.isDefault === true)? true: false;
        const hasDefault = isDefault;
        catalogService.getCitiesTreeByCountryCode(branch.countryCode)
            .then(res => {
                if(branch.countryCode === Constants.CountryCode.VIETNAM){
                    res.some((city) => {
                        if(branch.city === city.code) {
                            districts = city.districts.slice(0);
                            districts.some((district) => {
                                if(branch.district === district.code) {
                                    wards = district.wards.slice(0);
                                    return wards;
                                }
                            });
                            return districts;
                        }
                    })
                    setAddressInfo({...addressInfo, cities: res, districts: districts, wards: wards});
                }else{
                    setStProvince(res)
                }
                const oBranch = {...branch, isDefault, hasDefault};
                setCurrentBranch(oBranch);
                const countrySelect = stCountries.find(r => r.code === branch.countryCode);
                setPhoneCode(countrySelect.phoneCode)
                setShowModal(true);
                setStCustomerCountryOutside(branch.countryCode)
            })
            .catch(err => {
                console.log(err)
            })
    }

    const openModalEditBranch = (branch) => {
        let districts = [];
        let wards = [];
        const isDefault = (branch && branch.isDefault === true)? true: false;
        const hasDefault = isDefault;
        if(branch.countryCode !== STORE_COUNTRY_CODE){
            fetchAddressInfoByCountryCode(branch)
        }else{
            addressInfo.cities.some((city) => {
                if(branch.city === city.code) {
                    districts = city.districts.slice(0);
                    districts.some((district) => {
                        if(branch.district === district.code) {
                            wards = district.wards.slice(0);
                            return wards;
                        }
                    });
                    return districts;
                }
        
            })
            const oBranch = {...branch, isDefault, hasDefault};
            setAddressInfo({...addressInfo, districts: districts, wards: wards});
            setCurrentBranch(oBranch);
            setShowModal(true);
            setStCustomerCountryOutside(branch.countryCode)
        }
    }

    const changeCity = (value, index) => {
        //update district
        let districts = [];
        addressInfo.cities.some((city) => {
            if(city.code === value) {
                districts = city.districts?.slice(0);
                return districts;
            }
        })
        const selectedAddress = {...addressInfo, districts: districts, wards: []};
        setAddressInfo(selectedAddress);
        setCurrentBranch({
            ...currentBranch,
            city: value,
            district: "",
            ward: "",
        });
    }

    const changeDistrict = (value, index) => {
        //update district
        let wards = [];
        addressInfo.districts.some((district) => {
            if(district.code === value) {
                wards = district.wards.slice(0);
                return wards;
            }
        })
        const selectedAddress = {...addressInfo, wards: wards};
        setAddressInfo(selectedAddress);
        setCurrentBranch({
            ...currentBranch,
            district: value,
            ward: ""
        });
    }

    const changeWard = (value) => {
        //updated change value
        setCurrentBranch({
            ...currentBranch,
            ward: value
        });
    }

    const updateBranch = (newData, oldData) => {
        const isNew = oldData.id > 0? false: true;
        if(newData.branchType === BRANCH_TYPE.FREE) {
            const branches = [...freeBranch];
            if(isNew) {
                branches.splice(0, 0, newData);
            } else {
                branches.splice(oldData.index, 1, newData);
            }
            setFreeBranch(branches);
        } else if(newData.branchType === BRANCH_TYPE.PAID) {
            const branches = [...paidBranch];
            if(isNew) {
                branches.splice(0, 0, newData);
            } else {
                branches.splice(oldData.index, 1, newData);
            }
            setPaidBranch(branches);
        }
    }

    const handleSubmit = (event, errors, values) => {
        if(errors && errors.length > 0) {
            return;
        }
        let data = {...currentBranch, ...values};
        if(data.id > 0) {
            storeService.updateStoreBranch(data)
            .then((resp) => {
                if(resp.isDefault === true) {
                    CredentialUtils.setStoreDefaultBranch(resp.id)
                    onResetDefaultBranch();
                }
                updateBranch(resp, data);
                fetchFreeBranch();
                fetchPaidBranch();
                GSToast.commonUpdate();
            }).catch((e) => {
                const code = (e && e.response && e.response.data && e.response.data.errorKey)? e.response.data.errorKey: "";
                if(code === "branch.code.duplicated") {
                    GSToast.error("page.setting.branch.form.field.code.duplicated", true);
                } else {
                    GSToast.commonError();
                }
            }).finally(() => {
                setShowModal(false);
            })
        } else {
            storeService.createStoreBranch(data)
            .then((resp) => {
                if(resp.isDefault === true) {
                    CredentialUtils.setStoreDefaultBranch(resp.id)
                    onResetDefaultBranch();
                }
                fetchPaidBranch(0);
                GSToast.commonUpdate();
            }).catch((e) => {
                const code = (e && e.response && e.response.data && e.response.data.errorKey)? e.response.data.errorKey: "";
                if(code === "branch.code.duplicated") {
                    GSToast.error("page.setting.branch.form.field.code.duplicated", true);
                } else {
                    GSToast.commonError();
                }
            }).finally(() => {
                setShowModal(false);
            })
        }
    }

    const onUpdateStatus = (branch) => {
        if(branch.branchType === BRANCH_TYPE.FREE) {
            const branches = [...freeBranch];
            branches.splice(branch.index, 1, branch);
            setFreeBranch(branches);
        } else if(branch.branchType === BRANCH_TYPE.PAID) {
            const branches = [...paidBranch];
            branches.splice(branch.index, 1, branch);
            setPaidBranch(branches);
        }
    }

    const onResetDefaultBranch = () => {
        const fBranch = freeBranch.map((branch) => {
            branch.isDefault = false;
            return branch;
        })
        setFreeBranch(fBranch);
        const pBranch = paidBranch.map((branch) => {
            branch.isDefault = false;
            return branch;
        })
        setPaidBranch(pBranch);
    }

    const onResetOriginBranch = (branch, index) => {
        const branchType = branch.branchType;
        storeService.getStoreBranchById(branch.id)
        .then((result) => {
            if(branchType === BRANCH_TYPE.FREE) {
                const branches = [...freeBranch];
                const oBranch = {...branch, ...result, timestamp: (new Date())};
                branches.splice(index, 1, oBranch);
                setFreeBranch(branches);
            } else if(branchType === BRANCH_TYPE.PAID) {
                const branches = [...paidBranch];
                const oBranch = {...branch, ...result, timestamp: (new Date())};
                branches.splice(index, 1, oBranch);
                setPaidBranch(branches);
            }
        });
    }

    const handleChangeStatus = (branch, event) => {
        const oBranch = {...branch};
        if(refConfirmChangeStatus) {
            refConfirmChangeStatus.current.openModal({
                messages: i18next.t(`page.setting.branch.changeStatus.${oBranch.branchStatus}`),
                modalBtnOk: i18next.t("common.btn.ok"),
                okCallback: () => {
                    storeService.changeStatusStoreBranch(oBranch.id, oBranch.branchStatus)
                    .then((resp) => {
                        onUpdateStatus(oBranch);
                        GSToast.commonUpdate();
                    })
                    .catch((e) => {
                        onResetOriginBranch(oBranch, oBranch.index);
                        GSToast.commonError();
                    })
                },
                cancelCallback: (e) => {
                    onResetOriginBranch(oBranch, oBranch.index);
                }
            })
        }
    }

    const isHideUpgradePlan = () => {
        if(isExpired()) {
            return false;
        }
        if(isExceedLimitBranch()) {
            return false;
        }
        return true;
    }

    const onFormChange = (e, f) => {
    }

    const fetchCitiesTreeByCountryCode = (countryCode) => {
        catalogService.getCitiesTreeByCountryCode(countryCode)
        .then(res => {
            setAddressInfo({...addressInfo, ...{cities: res}});
            return res
        })
        .catch(err => console.log(err))
           
    }

    const handleCountry = (countryCode) => {
        if (!countryCode) return
        catalogService.getCitesOfCountry(countryCode).then(res => {
            setStProvince(res)
            if(countryCode === Constants.CountryCode.VIETNAM){
                fetchCitiesTreeByCountryCode(countryCode)
            }
            
        })
        const countrySelect = stCountries.find(r => r.code === countryCode);
        setPhoneCode(countrySelect.phoneCode)
        setStCustomerCountryOutside(countryCode)
    }

    const renderInsideAddressForm = () => {
        return (
            <Row>
                <Col md={12}>
                    <AvField
                        label={<div className="label-required">{i18next.t("page.setting.branch.table.column.address")}</div>}
                        name="address"
                        value={currentBranch && currentBranch.address}
                        validate={{
                            ...FormValidate.required(),
                            ...FormValidate.minLength(1),
                            ...FormValidate.maxLength(100),
                    }}
                    />
                </Col>
                <Col md={4} className="custom-col">
                    <FormGroup>
                        <Label className={"gs-frm-control__title"}>
                            <div className="label-required">
                                <Trans i18nKey="common.txt.street.cityProvince">City/Province</Trans>
                            </div>
                        </Label>
                        <AvField
                            type="select"
                            name="city"
                            validate={{
                                required: {
                                    value: true,
                                    errorMessage: i18next.t('common.validation.required')
                                }
                            }}
                            value={currentBranch && currentBranch.city}
                            onChange={e => changeCity(e.target.value, e.target.selectedIndex -1)}>
                            <option value="">{i18next.t('common.text.select')}</option>
                            {
                                addressInfo.cities.map((x, index) =>
                                    <option value={x.code} key={'cities-'+index}>{x.inCountry}</option>
                                )
                            }
                        </AvField>
                    </FormGroup>
                </Col>
                <Col md={4} className="custom-col">
                    <FormGroup>
                        <Label className={"gs-frm-control__title"}>
                            <div className="label-required">
                                <Trans i18nKey="common.txt.street.district">District</Trans>
                            </div>
                        </Label>
                        <AvField
                            type="select"
                            name="district"
                            validate={{
                                required: {
                                    value: true,
                                    errorMessage: i18next.t('common.validation.required')
                                }
                            }}
                            value={currentBranch && currentBranch.district}
                            onChange={e => changeDistrict(e.target.value, e.target.selectedIndex -1)}>
                                <option value="">{i18next.t('common.text.select')}</option>
                                {
                                    addressInfo.districts?.map((x, index) =>
                                        <option value={x.code} key={'district-'+index}>{x.inCountry}</option>
                                    )
                                }
                        </AvField>
                    </FormGroup>
                </Col>
                <Col md={4}>
                    <FormGroup>
                        <Label className={"gs-frm-control__title"}>
                            <div className="label-required">
                                <Trans i18nKey="common.txt.street.ward">Ward</Trans>
                            </div>
                        </Label>
                        <AvField
                            type="select"
                            name="ward"
                            validate={{
                                required: {
                                    value: true,
                                    errorMessage: i18next.t('common.validation.required')
                                }
                            }}
                            value={currentBranch && currentBranch.ward}
                            onChange={e => changeWard(e.target.value)}>
                                <option value="">{i18next.t('common.text.select')}</option>
                                {
                                    addressInfo.wards.map((x, index) =>
                                        <option value={x.code} key={'ward-'+index}>{x.inCountry}</option>
                                    )
                                }
                        </AvField>
                    </FormGroup>
                </Col>
            </Row>
        );
    }

    const renderOutsideAddressForm = () =>{
        return <Row>
            <Col md={12}>
                {/*ADDRESS*/}
                <AvField
                    disabled={ props.disabled }

                    label={<div className="label-required">{i18next.t('page.customers.edit.streetAddress')}</div>}
                    name="address"
                    validate={{
                        ...FormValidate.required(),
                        ...FormValidate.maxLength(255),
                    }}
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress') }
                    value={currentBranch && currentBranch.address}
                />
            </Col>
            <Col md={12}>
                <AvField
                    disabled={ props.disabled }
                    label={ i18next.t('page.customers.edit.address2') }
                    name="address2"
                    validate={ {
                        ...FormValidate.maxLength(255)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterAddress2') }
                    value={currentBranch && currentBranch.address2}
                />
            </Col>
            <Col md={4} className="custom-col">
                {/* cityName": "{City}" */}
                <AvField
                    disabled={ props.disabled }
                    label={<div className="label-required">{i18next.t('page.customers.edit.city')}</div> }
                    name="cityName"
                    validate={ {
                        // ...FormValidate.withCondition(
                        //     stRequiredAddress,
                        //     FormValidate.required()
                        // ),
                        ...FormValidate.required(),
                        ...FormValidate.maxLength(65)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterCity') }
                    onChange={ e => {
                        setStCustomerCityOutside(e.target.value)
                    } }
                    value={ stCustomerCityOutside }
                />
            </Col>
            <Col md={4} className="custom-col">
                {/* name="city": “{State/Region/Province}“ */}
                <AvField
                    type="select"
                    name="city"
                    label={<div className="label-required">{i18next.t('page.customers.edit.state')}</div> }
                    validate={ {
                        // ...FormValidate.withCondition(
                        //     stRequiredAddress,
                        //     FormValidate.required()
                        // ),
                        ...FormValidate.required(),
                    } }
                    onChange={ async e => {
                        setStCustomerLocationOutside(e.target.value)
                    } }
                    disabled={ props.disabled }
                    value={ stCustomerLocationOutside }
                >
                    <option value={ '' }>{ i18next.t('page.customer.addAddress.selectState') }</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={ x.code } key={ index }>{ x.outCountry }</option>
                        )
                    }
                </AvField>
            </Col>
            <Col md={4}>
                <AvField
                    disabled={ props.disabled }
                    label={<div className="label-required">{i18next.t('page.customers.edit.zipCode')}</div>}
                    name={ 'zipCode' }
                    validate={ {
                        // ...FormValidate.withCondition(
                        //     stRequiredAddress,
                        //     FormValidate.required()
                        // ),
                        ...FormValidate.required(),
                        ...FormValidate.maxLength(25)
                    } }
                    placeHolder={ i18next.t('page.customer.addAddress.enterZipCode') }
                    onChange={ e => {
                        setStCustomerZipCodeOutside(e.target.value)
                    } }
                    value={ stCustomerZipCodeOutside }
                />
            </Col>
        </Row>
    }

    return (
        <>
            {
            stLoadingPage?
            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
            :<><GSContentContainer
                className="branch-management">
                {/* FREE BRANCH */}
                <UikWidget className="gs-widget">
                    <UikWidgetHeader
                        className="gs-widget__header"
                        rightEl={
                            hasFreeOrLeadPackage()?
                            <Tooltip  arrow position={"bottom"} title={i18next.t("page.setting.branch.addBranch.tooltip")}>
                                <GSButton
                                    disabled={true}
                                    success>
                                    <GSTrans t={"page.setting.branch.addBranch"}/>
                                </GSButton>
                            </Tooltip>
                            :<GSButton
                                success
                                onClick={onOpenModalAddBranch}>
                                <GSTrans t={"page.setting.branch.addBranch"}/>
                            </GSButton>
                        }>
                            <Trans i18nKey="page.setting.branch.table.freeBranch">
                                Free Branch
                            </Trans>
                    </UikWidgetHeader>
                    <UikWidgetContent
                        key={"branch-on-desktop"}
                        className="gs-widget__content body">
                        <div className={"branch-list-desktop d-desktop-flex"}>
                            <GSTable>
                                <thead>
                                    <tr>
                                        <th>
                                            <GSTrans t={"page.setting.branch.table.column.name"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.setting.branch.table.column.code"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.setting.branch.table.column.address"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.setting.branch.table.column.expireDate"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.setting.branch.table.column.status"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.setting.branch.table.column.action"}/>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {freeBranch.map((branch, index) => {
                                        const hasExpired = isExpired();
                                        return (<tr key={branch.code}>
                                            <td className="text-truncate" style={{maxWidth: "140px"}}>{branch.name}</td>
                                            <td>{branch.code}</td>
                                            <td style={{maxWidth: "300px"}}>{branch.fullAddress}</td>
                                            <td>{i18n.t("page.setting.branch.expiryDate.unlimit")}</td>
                                            <td>
                                                <UikToggle
                                                    defaultChecked={branch.status}
                                                    checked={branch.status}
                                                    className="m-0 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        if(branch.branchType === BRANCH_TYPE.FREE) {
                                                            refAlertChangeStatus.current.openModal({
                                                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                                                modalTitle: i18n.t("common.txt.confirm.modal.title"),
                                                                messages: i18n.t("page.setting.branch.changeStatus.WARNING.FREE"),
                                                                closeCallback: () => {
                                                                }
                                                            });
                                                        }
                                                        return;
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <div>
                                                    <GSActionButton
                                                        icon={GSActionButtonIcons.EDIT}
                                                        onClick={() => {
                                                            const oBranch =  {...branch, index};
                                                            openModalEditBranch(oBranch);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>)
                                    })}
                                </tbody>
                            </GSTable>
                        </div>
                        {stFreeLoading && <Loading className={"d-flex justify-content-center"} style={LoadingStyle.ELLIPSIS_GREY}/>}
                        {!stFreeLoading && freeBranch.length === 0 && (
                            <div>
                                <GSWidgetEmptyContent
                                    text={i18next.t("page.setting.branch.noBranch")}
                                    iconSrc={"/assets/images/branch/icon_empty_branch.svg"}
                                    className="m-0"
                                />
                            </div>
                        )}
                    </UikWidgetContent>
                </UikWidget>

                {/* PAID BRANCH */}
                <UikWidget className="gs-widget" hidden={stOrderPackage == null}>
                    <UikWidgetHeader
                        className="gs-widget__header"
                        rightEl={
                            <GSButton
                                hidden={!stOrderPackage || paidBranch.length === 0}
                                success
                                onClick={onClickOpenPlan}>
                                <GSTrans t={
                                    isExpired()?
                                    "page.setting.branch.renewBranch"
                                    :"page.setting.branch.upgradeBranch"
                                }/>
                            </GSButton>}>
                            <Trans i18nKey="page.setting.branch.table.paidBranch">
                                Paid Branch
                            </Trans>
                    </UikWidgetHeader>
                    <UikWidgetContent
                        key={"branch-on-desktop"}
                        className="gs-widget__content body">
                        <div className={"branch-list-desktop d-desktop-flex"}>
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t={"page.setting.branch.table.column.name"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.branch.table.column.code"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.branch.table.column.address"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.branch.table.column.expireDate"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.branch.table.column.status"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.branch.table.column.action"}/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                    {paidBranch.map((branch, index) => {
                                        const hasExpired = isExpired();
                                        return (<tr className={hasExpired? "bg-expired-branch":""} key={'m-'+branch.code}>
                                            <td className="text-truncate" style={{maxWidth: "140px"}}>
                                                {hasExpired?
                                                <Tooltip  arrow position={"bottom"} title={i18next.t("page.setting.branch.expired")}>
                                                    {branch.name}
                                                </Tooltip>
                                                :branch.name}
                                            </td>
                                            <td>
                                                {hasExpired?
                                                <Tooltip  arrow position={"bottom"} title={i18next.t("page.setting.branch.expired")}>
                                                    {branch.code}
                                                </Tooltip>
                                                :branch.code}
                                            </td>
                                            <td style={{maxWidth: "300px"}}>{branch.fullAddress}</td>
                                            <td>
                                                {hasExpired?
                                                    i18next.t("page.setting.branch.expired.date")
                                                    :moment(branch.expiryDate).format("YYYY-MM-DD")
                                                }</td>
                                            <td>
                                                <UikToggle
                                                    defaultChecked={branch.status}
                                                    checked={branch.status}
                                                    className="m-0 p-0"
                                                    onClick={(e) => {
                                                        if(isExpired()) {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        const status = e.target.checked;
                                                        if(branch.isDefault === true && status === false) {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            refAlertChangeStatus.current.openModal({
                                                                type: AlertModalType.ALERT_TYPE_SUCCESS,
                                                                modalTitle: i18n.t("common.txt.confirm.modal.title"),
                                                                messages: i18n.t("page.setting.branch.changeStatus.WARNING"),
                                                                closeCallback: () => {
                                                                }
                                                            });
                                                            return;
                                                        }
                                                        const branchStatus = BRANCH_STATUS[status];
                                                        const oBranch =  {...branch, branchStatus, status, index};
                                                        handleChangeStatus(oBranch, e);
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <div>
                                                    <GSActionButton
                                                        hidden={isExpired()}
                                                        icon={GSActionButtonIcons.EDIT}
                                                        onClick={(e) => {
                                                            //not allow edit expired package
                                                            if(isExpired()) {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                return;
                                                            }
                                                            const oBranch =  {...branch, index};
                                                            openModalEditBranch(oBranch);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>)
                                    })}
                                </tbody>
                            </GSTable>
                        </div>
                        <div className={"branch-list-desktop d-desktop-flex"}>
                            <PagingTable
                                totalPage={totalPage}
                                maxShowedPage={5}
                                currentPage={currentPage}
                                onChangePage={onChangeListPage}
                                totalItems={totalItem}
                                hidePagingEmpty
                            ></PagingTable>
                        </div>
                        {stPaidLoading && <Loading className={"d-flex justify-content-center"} style={LoadingStyle.ELLIPSIS_GREY}/>}
                        {!stPaidLoading && paidBranch.length === 0 && (
                            <div>
                                <GSWidgetEmptyContent
                                    text={i18next.t("page.setting.branch.noBranch")}
                                    iconSrc={"/assets/images/branch/icon_empty_branch.svg"}
                                    className="m-0"
                                />
                            </div>
                        )}
                    </UikWidgetContent>
                </UikWidget>
            </GSContentContainer>

            {/*MODAL*/}
            <Modal isOpen={showModal} wrapClassName="add-branch-modal">
                <AvForm
                    onSubmit={handleSubmit}
                    onKeyPress={(e) => e.key === 'Enter' ? e.preventDefault() : null}
                    onChange={onFormChange}
                    model={currentBranch}
                    autoComplete="off">
                    <div className="branch-modal__header">
                        <GSTrans
                            t={
                                currentBranch && currentBranch.id
                                ? "page.setting.branch.editBranch.title"
                                : "page.setting.branch.addBranch.title"
                            }
                        />
                        <GSActionButton
                            icon={GSActionButtonIcons.CLOSE}
                            width=".8rem"
                            onClick={() => {
                                onClickCancelAddBranch();
                            }}
                        />
                    </div>
                    <ModalBody className="gs-atm__scrollbar-1 custom-content">
                        <div className="contact__container">
                            <Row>
                                <Col md={12}>
                                    <AvField
                                        label={<div className="label-required">{i18next.t("page.setting.branch.table.column.name")}</div>}
                                        name="name"
                                        defaultValue={currentBranch && currentBranch.name}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.minLength(3),
                                            ...FormValidate.maxLength(100),
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <AvField
                                        label={<div className="label-required">{i18next.t("page.setting.branch.table.column.code")}</div>}
                                        name="code"
                                        value={currentBranch && currentBranch.code}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.minLength(2),
                                            ...FormValidate.maxLength(20),
                                            async: (value, ctx, input, cb) => {
                                                if (!value) value = "";
                                                value = value.trim();
                                                if(!currentBranch) return
                                                const id = currentBranch.id? currentBranch.id: "";
                                                storeService.checkBranchCode(value, id)
                                                .then(() => {
                                                    cb(true);
                                                })
                                                .catch((e) => {
                                                    cb(i18next.t("page.setting.branch.form.field.code.duplicated"));
                                                });
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <AvField
                                        type="select"
                                        name="countryCode"
                                        label={`${i18next.t("page.customers.edit.country")}`}
                                        className='dropdown-box country'
                                        value={currentBranch?.countryCode ? currentBranch?.countryCode : STORE_COUNTRY_CODE}
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
                                </Col>
                            </Row>
                            <Row>
                                {stCustomerCountryOutside === Constants.CountryCode.VIETNAM ? renderInsideAddressForm():renderOutsideAddressForm()}
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Label for={'phoneNumberFirst'} className="gs-frm-control__title">
                                        <div className="label-required">{i18next.t("page.setting.branch.form.field.phoneNumber")}</div>
                                    </Label>
                                    <AvFieldPhone
                                        name={'phoneNumberFirst'}
                                        unit={<span className="phone-code">(+{stPhoneCode})</span>}
                                        validate={{
                                            pattern: {
                                                value: '^[0-9]+$',
                                                errorMessage: i18next.t('page.setting.branch.form.field.phone')
                                            },
                                            required: {
                                                value: true,
                                                errorMessage: i18next.t('page.setting.branch.form.field.mandatory')
                                            },
                                            ...FormValidate.minLength(8),
                                            ...FormValidate.maxLength(15),
                                        }}
                                        value={currentBranch && currentBranch.phoneNumberFirst}
                                        parentClassName=""
                                    />
                                </Col>
                                <Col md={6}>
                                    <AvField
                                        type="email"
                                        name="email"
                                        value={currentBranch && currentBranch.email}
                                        label={i18next.t("page.setting.branch.form.field.email")}
                                        validate={{
                                            ...FormValidate.email(i18n.t("page.setting.branch.form.field.email.invalid")),
                                            maxLength: {
                                                value: 65,
                                                errorMessage: i18next.t('page.setting.branch.form.field.email.max')
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                            {/*DEFAULT*/}
                            <Row>
                                <Col md={12}>
                                    <AvCheckboxGroup name={"defaultGroup"}>
                                        <AvCheckbox
                                            customInput
                                            name={"isDefault"}
                                            label={i18next.t("page.setting.branch.form.field.setDefault")}
                                            checked={currentBranch && currentBranch.isDefault}
                                            disabled={currentBranch && currentBranch.hasDefault === true}
                                            onChange={(e) => {
                                                const isDefault = e.target.checked;
                                                const branch = {...currentBranch, isDefault};
                                                setCurrentBranch(branch);
                                            }}
                                        />
                                    </AvCheckboxGroup>
                                </Col>
                            </Row>
                            {/*HIDE ON STOREFRONT*/}
                            <Row>
                                <Col md={12}>
                                    <AvCheckboxGroup name={"hideOnStoreFrontGroup"}>
                                        <AvCheckbox
                                            customInput
                                            name={"hideOnStoreFront"}
                                            label={i18next.t("page.setting.branch.hideOnStoreFront")}
                                            checked={currentBranch && currentBranch.hideOnStoreFront}
                                            onChange={(e) => {
                                                const hideOnStoreFront = e.target.checked;
                                                const branch = {...currentBranch, hideOnStoreFront};
                                                setCurrentBranch(branch);
                                            }}
                                        />
                                    </AvCheckboxGroup>
                                </Col>
                            </Row>
                        </div>
                    </ModalBody>
                    <div className="branch-modal__footer">
                        <GSButton default onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClickCancelAddBranch();
                            }}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton type={"submit"} success marginLeft>
                            <GSTrans t={
                                currentBranch && currentBranch.id
                                    ? "common.btn.update"
                                    : "common.btn.add"
                            }/>
                        </GSButton>
                    </div>
                </AvForm>
            </Modal>
            <ConfirmModal ref={refConfirmChangeStatus}/>
            <AlertModal ref={refAlertChangeStatus}/>
        </>}
    </>
    );
};

export default withRouter(BranchManagement);
