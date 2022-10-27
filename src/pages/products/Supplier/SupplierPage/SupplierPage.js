import React, {useEffect, useRef, useState} from "react";
import Constants from "../../../../config/Constant";
import i18next from "../../../../config/i18n";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import GSContentHeaderRightEl
    from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {Link, Redirect} from "react-router-dom";
import catalogService from "../../../../services/CatalogService";
import storeService from "../../../../services/StoreService";
import {ItemService} from "../../../../services/ItemService";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import "./SupplierPage.sass";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../../utils/gs-toast";
import storageService from "../../../../services/storage";
import {RouteUtils} from "../../../../utils/route";
import {connect} from "react-redux";
import GSAlertModal, {
    GSAlertModalType,
} from "../../../../components/shared/GSAlertModal/GSAlertModal";
import AvFieldCountable from "../../../../components/shared/form/CountableAvField/AvFieldCountable";
import SupplierPurchaseOrder from "./SupplierPurchaseOrder";
import {TokenUtils} from "../../../../utils/token";
import {ROLES} from "../../../../config/user-roles";
import {CredentialUtils} from "../../../../utils/credential";
import {STAFF_PERMISSIONS} from "../../../../config/staff-permissions";

const SupplierPage = (props) => {
    const
        [dataSupplier, setDataSupplier] = useState({
            name: "",
            code: "",
            phoneNumber: "",
            email: "",
            countryCode: "VN",
            address: "",
            address2: "",
            cityName: "",
            province: "",
            district: "",
            ward: "",
            zipCode: ""
        });
    const [country, setCountry] = useState();
    const [province, setProvince] = useState();
    const [district, setDistrict] = useState();
    const [ward, setWard] = useState();
    const [responsibleStaffList, setResponsibleStaffList] = useState();
    const [loadingScreen, setLoadingScreen] = useState(true);
    const [supplierDefault, setSupplierDefault] = useState();
    const [disabledInput, setDisabledInput] = useState(false);
    const [onRedirect, setOnRedirect] = useState(false);
    const refAlertModal = useRef();
    const [stPhoneCode, setPhoneCode] = useState(84);

    const refSubmit = useRef(null);

    useEffect(() => {
        Promise.all([
            catalogService.getCountries(),
            catalogService.getCitesOfCountry(Constants.CountryCode.VIETNAM),
            storeService.getAllStoreStaffs(
                0,
                Number.MAX_SAFE_INTEGER,
                true,
                "id,desc"
            ),
        ]).then((res) => {
            setCountry(res[0]);
            setProvince(res[1]);

            let staffs = res[2].data.filter((staff) => staff.enabled);
            staffs.unshift({
                id: parseInt(CredentialUtils.getStoreOwnerId()),
                name: i18next.t("page.order.detail.information.shopOwner"),
            });

            setResponsibleStaffList(staffs);
        });
        setLoadingScreen(false);
        switch (props.match.path) {
            case NAV_PATH.supplierEdit + "/:itemId":
                ItemService.getSupplier(props.match.params.itemId).then(
                    (res) => {
                        setDataSupplier(res);
                        setSupplierDefault(res);
                        fetchLocation(res.countryCode, res.province, res.district);
                        getPhoneCode(res.countryCode);
                    }
                );
                renderTitle();
                break;
        }
    }, []);

    const fetchLocation = async (countryCode, province, district) => {
        if (countryCode) {
            const lstProvince = await catalogService.getCitesOfCountry(countryCode)
            setProvince(lstProvince)
        }
        if (province) {
            const disctricts = await catalogService.getDistrictsOfCity(province);
            setDistrict(disctricts);
        }
        if (district) {
            const wards = await catalogService.getWardsOfDistrict(district);
            setWard(wards);
        }
    }

    const getPhoneCode = (countryCode) => {
        catalogService.getCountries()
            .then((result) => {
                const countrySelect = result.find(r => countryCode.includes(r.code));
                setPhoneCode(countrySelect.phoneCode)
            })
    }

    const onChangeStaff = (e) => {
        responsibleStaffList.forEach((x) => {
            if (x.id == e.target.value) {
                const name =
                    x.id === parseInt(CredentialUtils.getStoreOwnerId())
                        ? "[shop0wner]"
                        : x.name;
                setDataSupplier({
                    ...dataSupplier,
                    responsibleStaffName: name,
                    responsibleStaff: e.target.value,
                });
            }
        });
    };

    const renderStaffResponsibleName = (name) => {
        return name === "[shop0wner]"
            ? i18next.t("page.order.detail.information.shopOwner")
            : name;
    };

    const isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF);

    const checkNameExist = async (value, ctx, input, cb) => {
        const resName = await ItemService.getSupplierByNameOrCode(
            storeId,
            "NAME",
            value
        );
        if (
            resName &&
            NAV_PATH.supplierEdit + "/:itemId" == props.match.path &&
            resName.name !== supplierDefault?.name
        ) {
            cb(i18next.t("page.products.supplierPage.nameExist"));
            return;
        }
        if (resName && NAV_PATH.supplierCreate == props.match.path) {
            cb(i18next.t("page.products.supplierPage.nameExist"));
            return;
        }
        return cb(true);
    };

    const checkCodeExist = async (value, ctx, input, cb) => {
        const res = await ItemService.getSupplierByNameOrCode(
            storeId,
            "CODE",
            value
        );
        if (res && NAV_PATH.supplierEdit + "/:itemId" == props.match.path) {
            if (res.code !== supplierDefault?.code) {
                cb(i18next.t("page.products.supplierPage.codeExist"));
                return;
            }
        }
        if (res && NAV_PATH.supplierCreate == props.match.path) {
            cb(i18next.t("page.products.supplierPage.codeExist"));
            return;
        }
        return cb(true);
    };

    const onChangeCountryCode = async (e) => {
        let value = e.target.value
        if (value === 'VN'){
            setDataSupplier({
                ...dataSupplier,
                countryCode: value,
                address2: '',
                province: '',
                cityName: '',
                zipCode: ''
            });
        } else {
            setDataSupplier({
                ...dataSupplier,
                countryCode: value,
                province: '',
                district: '',
                ward: ''
            });
        }

        const countrySelect = await country.find(r => value.includes(r.code));
        setPhoneCode(countrySelect.phoneCode)

        const proviceList =
            await catalogService.getCitesOfCountry(value);
        setProvince(proviceList);
    }

    const FormInfo = () => {
        return (
            <div className={"supplier-page__info"}>
                    <div className={"row"}>
                        <div className={"col-md-12"}>
                            <AvField
                                type={"text"}
                                name={"name"}
                                label={
                                    <div className="label-required">
                                        {i18next.t(
                                            "page.products.supplierPage.supplierName"
                                        )}
                                        <span style={{color: "red"}}> *</span>
                                    </div>
                                }
                                defaultValue={dataSupplier.name}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(100, true),
                                    async: checkNameExist,
                                }}
                                onBlur={(e) => {
                                    setDataSupplier({
                                        ...dataSupplier,
                                        name: e.currentTarget.value,
                                    });
                                }}
                                // style={{border:fieldEmpty||checkNameSupplier?'1px solid red':''}}
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                            />
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"col-md-6"}>
                            <AvField
                                type={"text"}
                                name={"code"}
                                label={i18next.t("page.products.supplierPage.supplierCode")}
                                value={dataSupplier.code}
                                onBlur={(e) => {
                                    setDataSupplier({
                                        ...dataSupplier,
                                        code: e.currentTarget.value,
                                    });
                                }}
                                validate={{
                                    ...FormValidate.maxLength(12, true),
                                    pattern: {
                                        value: "^[A-Za-z0-9-]+$",
                                        errorMessage: i18next.t(
                                            "common.validation.number.and.character.and.hyphen"
                                        ),
                                    },
                                    async: checkCodeExist,
                                }}
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                            />
                        </div>
                        <div className={String(stPhoneCode).length > 3 ? 'col-md-6 phone-supplier maxPhoneCode' : 'col-md-6 phone-supplier'}>
                            <span className='phone-country'>(+{stPhoneCode})</span>
                            <AvField
                                type="text"
                                name={"phone-number"}
                                label={i18next.t("page.products.supplierPage.phoneNumber")}
                                placeholder={i18next.t("page.customers.placeholder.phone")}
                                value={dataSupplier.phoneNumber}
                                onBlur={(e) =>
                                    setDataSupplier({
                                        ...dataSupplier,
                                        phoneNumber: e.currentTarget.value,
                                    })
                                }
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                                validate={{
                                    ...FormValidate.pattern.phoneNumber()
                                }}
                            />
                        </div>
                    </div>
                    <div className={"row"}>
                        <div className={"col-md-6"}>
                            <AvField
                                type={"email"}
                                name={"email"}
                                label={i18next.t(
                                    "page.products.supplierPage.email"
                                )}
                                defaultValue={dataSupplier.email}
                                onBlur={(e) =>
                                    setDataSupplier({
                                        ...dataSupplier,
                                        email: e.currentTarget.value,
                                    })
                                }
                                validate={{
                                    ...FormValidate.email(),
                                    ...FormValidate.maxLength(100),
                                }}
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                            />
                        </div>
                    </div>
            </div>
        );
    };

    const FormAddress = () => {
        return (
            <div className={"supplier-page__address"}>
                <div className={"row"}>
                    <div className={"col-md-12"}>
                        <h5>
                            {i18next.t(
                                "page.products.supplierPage.addressInfo"
                            )}
                        </h5>
                    </div>
                </div>
                    <div className={"row"}>
                        <div className={"col-md-6"}>
                            <AvField
                                type="select"
                                name="countryCode"
                                label={i18next.t("page.customers.edit.country")}
                                value={
                                    dataSupplier.countryCode
                                        ? dataSupplier.countryCode
                                        : i18next.t(
                                        "page.products.supplierPage.selectCountry"
                                        )
                                }
                                onChange={(e) => onChangeCountryCode(e)}
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                            >
                                >
                                <option value={""}>
                                    {i18next.t(
                                        "page.products.supplierPage.selectCountry"
                                    )}
                                </option>
                                {country &&
                                country.map((x, index) => (
                                    <option value={x.code} key={index}>
                                        {x.outCountry}
                                    </option>
                                ))}
                            </AvField>
                        </div>
                    </div>
                    {dataSupplier.countryCode === 'VN' && renderInsideAddressForm()}
                    {dataSupplier.countryCode !== 'VN' && renderOutsideAddressForm()}
            </div>
        );
    };

    const renderInsideAddressForm = () => {
        return <>
            <div className={"row"}>
                <div className={"col-md-12"}>
                    <div className="label-required-count">
                        {i18next.t(
                            "page.products.supplierPage.address"
                        )}
                    </div>
                    <AvFieldCountable
                        name="address"
                        isRequired={false}
                        minLength={1}
                        maxLength={150}
                        tabIndex={1}
                        value={dataSupplier.address}
                        placeHolder={i18next.t('page.customer.addAddress.enterAddress')}
                        onBlur={(e) =>
                            setDataSupplier({
                                ...dataSupplier,
                                address: e.target.value,
                            })
                        }
                        disabled={
                            !supplierDefault &&
                            props.match.path ===
                            NAV_PATH.supplierEdit + "/:itemId" &&
                            true
                        }
                    />
                </div>
            </div>
            <div className={"row"}>
                <div className={"col-md-4"}>
                    <AvField
                        type="select"
                        name="province"
                        label={i18next.t("page.products.supplierPage.province")}
                        value={
                            dataSupplier.province
                                ? dataSupplier.province
                                : i18next.t(
                                "page.products.supplierPage.selectProvince"
                                )
                        }
                        onChange={async (e) => {
                            setDataSupplier({
                                ...dataSupplier,
                                province: e.target.value,
                                district: '',
                                ward: ''
                            });
                            const districtList =
                                await catalogService.getDistrictsOfCity(
                                    e.target.value
                                );
                            setDistrict(districtList);
                        }}
                        disabled={
                            !supplierDefault &&
                            props.match.path ===
                            NAV_PATH.supplierEdit + "/:itemId" &&
                            true
                        }
                    >
                        >
                        <option value={""}>
                            {i18next.t(
                                "page.products.supplierPage.selectProvince"
                            )}
                        </option>
                        {province &&
                        province.map((x, index) => (
                            <option value={x.code} key={index}>
                                {x.inCountry}
                            </option>
                        ))}
                    </AvField>
                </div>
                <div className={"col-md-4"}>
                    <AvField
                        type="select"
                        name="district"
                        label={i18next.t("page.products.supplierPage.district")}
                        onChange={async (e) => {
                            setDataSupplier({
                                ...dataSupplier,
                                district: e.target.value,
                                ward: ''
                            });
                            const wardList =
                                await catalogService.getWardsOfDistrict(
                                    e.target.value
                                );
                            setWard(wardList);
                        }}
                        value={
                            dataSupplier.district
                                ? dataSupplier.district
                                : i18next.t(
                                "page.products.supplierPage.selectDistrict"
                                )
                        }
                        disabled={
                            !supplierDefault &&
                            props.match.path ===
                            NAV_PATH.supplierEdit + "/:itemId" &&
                            true
                        }
                    >
                        <option value={""}>
                            {i18next.t(
                                "page.products.supplierPage.selectDistrict"
                            )}
                        </option>
                        {district &&
                        district.map((x, index) => (
                            <option value={x.code} key={index}>
                                {x.inCountry}
                            </option>
                        ))}
                    </AvField>
                </div>
                <div className={"col-md-4"}>
                    <AvField
                        type="select"
                        name="ward"
                        label={i18next.t("page.products.supplierPage.ward")}
                        onChange={(e) =>
                            setDataSupplier({
                                ...dataSupplier,
                                ward: e.target.value,
                            })
                        }
                        value={
                            dataSupplier.ward
                                ? dataSupplier.ward
                                : i18next.t(
                                "page.products.supplierPage.selectWard"
                                )
                        }
                        disabled={
                            !supplierDefault &&
                            props.match.path ===
                            NAV_PATH.supplierEdit + "/:itemId" &&
                            true
                        }
                    >
                        <option value={""}>
                            {i18next.t(
                                "page.products.supplierPage.selectWard"
                            )}
                        </option>
                        {ward &&
                        ward.map((x, index) => (
                            <option value={x.code} key={index}>
                                {x.inCountry}
                            </option>
                        ))}
                    </AvField>
                </div>
            </div>
        </>
    }

    const renderOutsideAddressForm = () => {
        return <>
            <div className={"row"}>
                <div className={"col-md-12"}>
                    <div className="label-required-count">
                        {i18next.t(
                            "page.products.supplierPage.streetAddress"
                        )}
                    </div>
                    <AvFieldCountable
                        type={'text'}
                        name="address"
                        minLength={1}
                        maxLength={255}
                        tabIndex={1}
                        data-sherpherd="tour-product-step-4"
                        value={dataSupplier.address}
                        placeHolder={i18next.t('page.customer.addAddress.enterAddress')}
                        onBlur={(e) =>
                            setDataSupplier({
                                ...dataSupplier,
                                address: e.target.value,
                            })
                        }
                        disabled={
                            !supplierDefault &&
                            props.match.path ===
                            NAV_PATH.supplierEdit + "/:itemId" &&
                            true
                        }
                    />
                </div>
                <div className={"col-md-12"}>
                    <AvField
                        type={'text'}
                        disabled={props.disabled}
                        label={i18next.t('page.customers.edit.address2')}
                        name={'address2'}
                        value={dataSupplier.address2}
                        validate={{
                            ...FormValidate.maxLength(255)
                        }}
                        onBlur={(e) =>
                            setDataSupplier({
                                ...dataSupplier,
                                address2: e.target.value,
                            })
                        }
                        placeHolder={i18next.t('page.customer.addAddress.enterAddress2')}
                    />
                </div>
            </div>
            <div className={"row"}>
                <div className={"col-md-4"}>
                    <AvField
                        type={'text'}
                        disabled={props.disabled}
                        label={i18next.t("page.customers.edit.city")}
                        name={'cityName'}
                        validate={{
                            ...FormValidate.maxLength(65)
                        }}
                        placeHolder={i18next.t('page.customer.addAddress.enterCity')}
                        onBlur={e => {
                            setDataSupplier({
                                ...dataSupplier,
                                cityName: e.target.value,
                            })
                        }}
                        value={dataSupplier.cityName}
                    />
                </div>
                <div className={"col-md-4"}>
                    <AvField
                        type="select"
                        name="province"
                        label={i18next.t("page.products.supplierPage.province")}
                        value={
                            dataSupplier.province
                                ? dataSupplier.province
                                : i18next.t(
                                "page.customer.addAddress.selectState"
                                )
                        }
                        onChange={async (e) => {
                            setDataSupplier({
                                ...dataSupplier,
                                province: e.target.value,
                            });
                            const districtList =
                                await catalogService.getDistrictsOfCity(
                                    e.target.value
                                );
                            setDistrict(districtList);
                        }}
                        disabled={
                            !supplierDefault &&
                            props.match.path ===
                            NAV_PATH.supplierEdit + "/:itemId" &&
                            true
                        }
                    >
                        >
                        <option value={""}>
                            {i18next.t(
                                "page.customer.addAddress.selectState"
                            )}
                        </option>
                        {province &&
                        province.map((x, index) => (
                            <option value={x.code} key={index}>
                                {x.inCountry}
                            </option>
                        ))}
                    </AvField>
                </div>
                <div className={"col-md-4"}>
                    <AvField
                        disabled={props.disabled}
                        type={'text'}
                        label={i18next.t("page.customers.edit.zipCode")}
                        name={'zipCode'}
                        validate={{
                            ...FormValidate.maxLength(25)
                        }}
                        placeHolder={i18next.t('page.customer.addAddress.enterZipCode')}
                        onBlur={e => {
                            setDataSupplier({
                                ...dataSupplier,
                                zipCode: e.target.value,
                            });
                        }}
                        value={dataSupplier.zipCode}
                    />
                </div>
            </div>
        </>
    }

    const FormOtherInfo = () => {
        return (
            <div className={"supplier-page__other-info"}>
                <div className={"row"}>
                    <div className={"col-md-12 border-bottom"}>
                        <h5>
                            {i18next.t("page.products.supplierPage.otherInfo")}
                        </h5>
                    </div>
                </div>
                <AvForm>
                    <div className={"row"} style={{paddingTop: "10px"}}>
                        <div className={"col-12"}>
                            <AvField
                                type="select"
                                name="staff"
                                label={i18next.t(
                                    "page.products.supplierPage.responsibleStaff"
                                )}
                                defaultValue={dataSupplier.responsibleStaff}
                                onChange={onChangeStaff}
                                value={
                                    dataSupplier.responsibleStaff
                                        ? dataSupplier.responsibleStaff
                                        : "select sresponsible staff"
                                }
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                            >
                                {isStaff && dataSupplier.responsibleStaff ? (
                                    <option
                                        value={dataSupplier.responsibleStaff}
                                    >
                                        {renderStaffResponsibleName(
                                            dataSupplier.responsibleStaffName
                                        )}
                                    </option>
                                ) : (
                                    <option value={""}>
                                        {i18next.t(
                                            "page.products.supplierPage.selectStaff"
                                        )}
                                    </option>
                                )}
                                {!isStaff &&
                                responsibleStaffList &&
                                responsibleStaffList.map((x, index) => (
                                    <option value={x.id} key={index}>
                                        {x.name}
                                    </option>
                                ))}
                            </AvField>
                            <div className="label-required-count">
                                {i18next.t(
                                    "page.products.supplierPage.description"
                                )}
                            </div>
                            <AvFieldCountable
                                name={"description"}
                                type={"textarea"}
                                isRequired={true}
                                minLength={1}
                                maxLength={500}
                                onBlur={(e) =>
                                    setDataSupplier({
                                        ...dataSupplier,
                                        description: e.target.value,
                                    })
                                }
                                value={dataSupplier.description}
                                disabled={
                                    !supplierDefault &&
                                    props.match.path ===
                                    NAV_PATH.supplierEdit + "/:itemId" &&
                                    true
                                }
                                rows={3}
                            ></AvFieldCountable>
                        </div>
                    </div>
                </AvForm>
            </div>
        );
    };
    const storeId = storageService.getFromLocalStorage(
        Constants.STORAGE_KEY_STORE_ID
    );
    const submitHandler = async (event, value) => {
        event.preventDefault();
        setLoadingScreen(true);

        const data = {
            id: dataSupplier.id,
            address: dataSupplier.address,
            code: dataSupplier.code,
            description: dataSupplier.description,
            district: dataSupplier.district,
            email: dataSupplier.email,
            name: dataSupplier.name,
            phoneNumber: dataSupplier.phoneNumber,
            province: dataSupplier.province,
            responsibleStaff: dataSupplier.responsibleStaff,
            ward: dataSupplier.ward,
            storeId: storeId,
            responsibleStaffName: dataSupplier.responsibleStaffName,
            address2: dataSupplier.address2,
            countryCode: dataSupplier.countryCode,
            zipCode: dataSupplier.zipCode,
            cityName: dataSupplier.cityName
        };
        switch (props.match.path) {
            case NAV_PATH.supplierEdit + "/:itemId":
                ItemService.updateSupplier(data)
                    .then((res) => {
                        GSToast.success(
                            "component.call.history.status.successful",
                            true
                        );
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.supplier);
                    })
                    .catch((err) =>
                        GSToast.error(
                            "page.products.supplierPage.errorSupplier",
                            true
                        )
                    );
                setLoadingScreen(false);
                break;
            case NAV_PATH.supplierCreate:
                ItemService.createSupplier(data)
                    .then((res) => {
                        GSToast.success(
                            "component.call.history.status.successful",
                            true
                        );
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.supplier);
                    })
                    .catch((err) =>
                        GSToast.error(
                            "page.products.supplierPage.errorSupplier",
                            true
                        )
                    );
                setLoadingScreen(false);
                break;
        }
    };

    const removeSupplier = async () => {
        refAlertModal.current.openModal({
            messages: i18next.t("component.supplier.btn.remove.hint"),
            modalTitle: i18next.t("common.txt.confirm.modal.title"),
            modalAcceptBtn: i18next.t("common.btn.delete"),
            modalCloseBtn: i18next.t("common.btn.cancel"),
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            acceptCallback: async () => {
                ItemService.deleteSupplier(dataSupplier.id)
                    .then((res) => {
                        GSToast.success(
                            "component.call.history.status.successful",
                            true
                        );
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.supplier);
                    })
                    .catch((err) =>
                        GSToast.error(
                            "page.products.supplierPage.errorSupplier",
                            true
                        )
                    );
                setDisabledInput(true);
            },
        });
    };

    const handleCancel = (e) => {
        e.preventDefault();
        this.refConfirmModal.openModal({
            messages: i18next.t("component.product.addNew.cancelHint"),
            okCallback: () => {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.supplier);
            },
        });
    };

    const renderTitle = () => {
        switch (props.match.path) {
            case NAV_PATH.supplierCreate:
                return (
                    <h5
                        style={{
                            marginBottom:
                                window.innerWidth >= 768 ? "15px" : "",
                        }}
                    >
                        {i18next.t("page.products.supplierPage.addSupplier")}
                    </h5>
                );
                break;
            case NAV_PATH.supplierEdit + "/:itemId":
                return (
                    <h5
                        style={{
                            marginBottom:
                                window.innerWidth >= 768 ? "15px" : "",
                        }}
                    >
                        {i18next.t("page.products.supplierPage.editSupplier")}
                    </h5>
                );
                break;
        }
    };

    const renderRedirect = () => {
        if (onRedirect) return <Redirect to={NAV_PATH.supplier}/>;
    };

    const renderStatusSupplier = (status) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <label className={"label-status"}>
                        {i18next.t("page.products.supplierPage.supplierActive")}
                    </label>
                );
            case "DELETED":
                return (
                    <label className={"label-status deleted"}>
                        {i18next.t("page.products.supplierPage.supplierInactive")}
                    </label>
                );
        }
    };
    const FormStatus = () => {
        return (
            <div className={"suplier-page__supplier-status"}>
                <div className={"row"}>
                    <div className={"col-md-12 border-bottom"}>
                        <h5>
                            {i18next.t(
                                "page.products.supplierPage.supplierSummary"
                            )}
                        </h5>
                    </div>
                </div>
                <div className={"row"}>
                    <div className={"col-md-12 status-row"}>
                        <h6 className={"title-label"}>
                            {i18next.t(
                                "page.products.supplierPage.supplierStatus"
                            )}
                        </h6>
                        {renderStatusSupplier(dataSupplier.status)}
                    </div>
                </div>
            </div>
        );
    };
    return (
        <>
            {renderRedirect()}
            {loadingScreen && <LoadingScreen/>}
            <GSContentContainer className="supplier-page supplier-purchase-order-list-page">
                <GSContentHeader>
                    <ConfirmModal
                        ref={(el) => {
                            this.refConfirmModal = el;
                        }}
                    />
                    <GSAlertModal ref={refAlertModal}/>
                    <div>
                        <Link
                            to={NAV_PATH.supplier}
                            className="color-gray mb-2 d-block"
                        >
                            &#8592;{" "}
                            {i18next.t(
                                `page.products.supplierPage.${STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT}`
                            )}
                        </Link>
                        {renderTitle()}
                    </div>
                    <GSContentHeaderRightEl className={"d-flex"}>
                        <GSButton
                            success
                            marginLeft
                            className="btn-save"
                            onClick={() => refSubmit.current.click()}
                            disabled={
                                (!supplierDefault && props.match.path === NAV_PATH.supplierEdit + "/:itemId") || supplierDefault?.status === 'DELETED'
                            }
                        >
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                        <GSButton
                            secondary
                            outline
                            marginLeft
                            className="btn-cancel"
                            onClick={(e) => handleCancel(e)}
                            disabled={
                                !supplierDefault &&
                                props.match.path ===
                                NAV_PATH.supplierEdit + "/:itemId" &&
                                true
                            }
                        >
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        {
                            props.match.path == NAV_PATH.supplierEdit + '/:itemId' &&
                            <GSButton danger outline marginLeft
                                      onClick={() => removeSupplier()}
                                      disabled={!supplierDefault && props.match.path === NAV_PATH.supplierEdit + '/:itemId' || supplierDefault?.status === 'DELETED'}
                            >
                                <GSTrans t="common.btn.delete"/>
                            </GSButton>
                        }
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody className="supplier-page__body">
                    <div className={disabledInput ? "disabled-element" : ""}>
                        <div className={"row"}>
                            <div
                                className={"col-md-8 supplier-page__body--form"}
                            >
                            <AvForm autoComplete="off" onValidSubmit={submitHandler}>
                                <button ref={refSubmit} hidden/>
                                <FormInfo/>
                                <br/>
                                <FormAddress/>
                            </AvForm>
                            </div>
                            <div className={"col-md-4"}>
                                {props.match.path ==
                                NAV_PATH.supplierEdit + "/:itemId" && (
                                    <FormStatus/>
                                )}
                                <FormOtherInfo/>
                            </div>
                        </div>
                    </div>
                </GSContentBody>
                {props.match.path == NAV_PATH.supplierEdit + "/:itemId" && (
                    <SupplierPurchaseOrder
                        supplierId={props.match.params.itemId}
                    />
                )}
            </GSContentContainer>
        </>
    );
};
export default connect()(SupplierPage)
