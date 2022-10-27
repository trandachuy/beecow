/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/11/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from "react";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import "./StaffManagement.sass";
import {UikSelect, UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader,} from "../../../@uik";
import {Trans} from "react-i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import i18next from "i18next";
import {Modal} from "reactstrap";
import ModalBody from "reactstrap/es/ModalBody";
import {AvCheckbox, AvCheckboxGroup, AvField, AvForm,} from "availity-reactstrap-validation";
import {FormValidate} from "../../../config/form-validate";
import GSActionButton, {GSActionButtonIcons,} from "../../../components/shared/GSActionButton/GSActionButton";
import {GSToast} from "../../../utils/gs-toast";
import AlertModal, {AlertModalType,} from "../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import storeService from "../../../services/StoreService";
import {CredentialUtils} from "../../../utils/credential";
import {STAFF_PERMISSIONS} from "../../../config/staff-permissions";
import {TokenUtils} from "../../../utils/token";
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import accountService from "../../../services/AccountService";
import callCenterService from "../../../services/CallCenterService";
import _ from "lodash";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import GSTable from "../../../components/shared/GSTable/GSTable";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";

const StaffManagement = (props) => {
    let MAXIMUM_STAFF = 4;
    const SIZE_PER_PAGE = 10;
    const refDeleteConfirmModal = useRef(null);
    const refAlertModal = useRef(null);
    const [stIsShowModal, setStIsShowModal] = useState(false);
    const [stPermissionList, setStPermissionList] = useState([]);
    const [stBranchList, setStBranchList] = useState([]);
    const [stCurrentStaffFormModel, setStCurrentStaffFormModel] = useState({
        id: "",
        userId: "",
        name: "",
        email: "",
        permissionCode: [],
        branchId: []
    });
    const [stStaffList, setStStaffList] = useState([]);
    const [stFetchVhtExtension, setStFetchVhtExtension] = useState(false);
    const [totalPage, setTotalPage] = useState(1);
    const [totalItem, setTotalItem] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stIsEnabledCC, setStIsEnabledCC] = useState(CredentialUtils.getOmiCallEnabled());
    const [stPhoneExtensions, setStPhoneExtensions] = useState([
        {
            value: "",
            label: i18next.t("page.setting.staff.unassigned"),
        },
    ]);
    const [stShopOwner, setStShopOwner] = useState({
        userId: "",
        name: "",
        email: "",
        permissionCode: "",
        enabled: true,
        hideAction: true,
        disabledStatus: true,
        vhtExtensionId: "",
        vhtExtensionOptions: [],
    });

    const [isProduct,setIsProduct]=useState(false)
    const [stCheckedFeatures, setStCheckedFeatures] = useState([])
    const [stEmptyFeaturesError, setStEmptyFeaturesError] = useState(false)

    const tableConfig = {
        headerList: [
            i18next.t("page.setting.staff.nameTable"),
            i18next.t("page.setting.staff.permissions"),
            i18next.t("page.setting.staff.phoneExtension"),
            i18next.t("page.setting.staff.status"),
            i18next.t("page.setting.staff.actions"),
        ],
    };

    useEffect(() => {
        fetchData();

        return () => {
        };
    }, []);

    useEffect(() => {
        if(stFetchVhtExtension === true && stStaffList && stStaffList.length > 0) {
            fetchStaffExtenssion()
        }
    }, [stFetchVhtExtension, stStaffList])
    
    const handleCheckFeature = (code, e) => {
        const { checked } = e.target;
        
        if (code === STAFF_PERMISSIONS.PRODUCTS) {
            setIsProduct(checked)
        }
        
        setStCheckedFeatures(features => {
            let updated = features.filter(f => !!f && f !== code)
            
            if (checked) {
                updated.push(code)
            } else if (code === STAFF_PERMISSIONS.PRODUCTS) {
                updated = updated.filter(c => c !== STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT
                    && c !== STAFF_PERMISSIONS.PURCHASE_ORDER)
            }
            
            setStEmptyFeaturesError(!updated.length)
            
            return updated
        })
    }

    const fetchData = (page = 0, size = SIZE_PER_PAGE) => {
        Promise.all([
            storeService.getStaffPermissions(),
            storeService.getStaffs(stIsEnabledCC, page, size),
            accountService.getUserById(CredentialUtils.getStoreOwnerId()),
            storeService.getActiveStoreBranches()
        ])
            .then((responses) => {
                // due to orders and reservations is the same so we hide reservations
                // -> when send request we will add 'reservation' code if selected 'orders'
                const permissions = responses[0];
                const staffs = responses[1].data;
                const ownerDetail = responses[2];
                const branchList = responses[3];

                setStPermissionList(permissions);
                const numTotalItem = parseInt(responses[1].headers["x-total-count"]);
                const numTotalPage = Math.ceil(numTotalItem / SIZE_PER_PAGE);
                setTotalPage(numTotalPage);
                setTotalItem(numTotalItem);
                if (page === 0) {
                    setCurrentPage(1);
                }

                let shopOwner = {
                    ...stShopOwner,
                    userId: ownerDetail.id,
                    name: ownerDetail.displayName,
                    email: ownerDetail.email,
                    permissionCode: permissions.map((x) => x.code).join(","),
                };
                const list = [...[shopOwner], ...staffs];
                setStShopOwner(shopOwner);
                setStStaffList(list);
                setStBranchList(branchList);
            })
            .catch((e) => {
                console.log(e);
            })
            .finally(() => {
                setStFetchVhtExtension(true);
                setStIsFetching(false);
            });
    };

    const fetchStaffExtenssion = () => {
        setStIsFetching(true);
        Promise.all([
            callCenterService.getVhtExtensions(),
            callCenterService.getVhtExtensionShopOwner(),
        ])
            .then((responses) => {
                let phoneExtensions = responses[0];
                //MAPPING EXTENSION FOR OWNER
                let list = [...stStaffList];
                _.each(list, (x) => {
                    let extensions = phoneExtensions.filter(
                        (y) => y.userId === x.userId
                    );
                    if (extensions.length) {
                        x.vhtExtensionNumber = extensions[0].sipPhone;
                    } else {
                        x.vhtExtensionNumber = ''
                    }
                });
                _.remove(phoneExtensions, (x) => {
                    return list.filter((y) => y.userId === x.userId).length;
                });
                let remainExtension = _.map(phoneExtensions, (x) => {
                    return {value: x.sipPhone, label: x.sipPhone};
                });
                _.each(list, (x) => {
                    x.vhtExtensionId = x.vhtExtensionId || "";
                    x.vhtExtensionOptions = x.vhtExtensionNumber
                        ? [
                            ...stPhoneExtensions,
                            ...[
                                {
                                    value: x.vhtExtensionNumber,
                                    label: x.vhtExtensionNumber,
                                },
                            ],
                            ...remainExtension,
                        ]
                        : [...stPhoneExtensions, ...remainExtension];
                });

                setStStaffList(list);
            })
            .catch((e) => {
                console.log(e);
            })
            .finally(() => {
                setStFetchVhtExtension(false);
                setStIsFetching(false);
            });
    }

    const onChangeListPage = (pageIndex) => {
        setCurrentPage(pageIndex);
        fetchData(pageIndex - 1, SIZE_PER_PAGE);
    };

    const onClickRemoveStaff = (staff) => {
        refDeleteConfirmModal.current.openModal({
            type: AlertModalType.ALERT_TYPE_SUCCESS,
            messages: (
                <GSTrans
                    t="page.setting.staff.deleteConfirm"
                    values={{email: staff.email}}
                >
                    Do you want to delete this staff <strong>email?</strong>
                </GSTrans>
            ),
            okCallback: () => {
                storeService
                    .deleteStaff(staff.id)
                    .then((result) => {
                        GSToast.commonDelete();

                        // reset the omcall line
                        callCenterService.removeExtensionForUser({
                            storeId: CredentialUtils.getStoreId(),
                            userId: staff.userId
                        }).then(res => {}).catch(error => {})

                        //reset starting page
                        fetchData(0, SIZE_PER_PAGE);
                    })
                    .catch((e) => {
                        GSToast.commonError();
                    });
            },
        });
    };

    const onClickAddStaff = () => {
        if (TokenUtils.onlyFreeOrLeadPackage()) {
            //support gofree or golead user
            setStCurrentStaffFormModel({
                id: null,
                userId: null,
                name: null,
                email: null,
                phoneExtension: null,
                permissionCode: stPermissionList
                    .filter((permission) => {
                        return (
                            //permission.code !== STAFF_PERMISSIONS.RESERVATIONS &&
                            permission.code !== STAFF_PERMISSIONS.SETTING
                        );
                    })
                    .map((permission) => permission.code),
            });
        } else {
            setStCurrentStaffFormModel(null);
        }
        setIsProduct(false)
        setStCheckedFeatures([])
        setStEmptyFeaturesError(false)
        setStIsShowModal(true);
    };

    const closeStaffModal = () => {
        setStIsShowModal(false);
    };

    const onClickCancelAddStaff = (e) => {
        e.preventDefault(); // avoid fire submit action
        closeStaffModal();
    };

    const handleValidSubmit = (event, values) => {
        setStEmptyFeaturesError(false)
        
        if (!stCheckedFeatures.length) {
            setStEmptyFeaturesError(true)
            return
        }
        
        setStIsSaving(true);

        values.permissionCode = [
            ...stCheckedFeatures
        ]

        if (values.id) {
            // => UPDATE
            const request = buildUpdatedRequest(values);
            storeService
                .updateStaff(request)
                .then((result) => {
                    setStIsSaving(false);
                    closeStaffModal();
                    GSToast.commonUpdate();
                    fetchData(currentPage - 1, SIZE_PER_PAGE);
                })
                .catch((e) => {
                    setStIsSaving(false);
                    const {status, title, errorKey} = e.response.data;
                    switch (status) {
                        case 400:
                            if (title === "inactive.branches") {
                                GSToast.error(i18next.t("page.setting.staff.branch.inactive", {x: errorKey}))
                            }
                            break;
                        case 500:
                            GSToast.commonError();
                            break;
                        default:
                            GSToast.commonError();
                    }
                });
        } else {
            // => CREATE
            const request = buildCreatedRequest(values);

            storeService
                .createStaff(request)
                .then((result) => {
                    setStIsSaving(false);
                    closeStaffModal();
                    GSToast.commonCreate();
                    fetchData(0, SIZE_PER_PAGE);
                })
                .catch((e) => {
                    setStIsSaving(false);
                    const _errorKey = e.response.headers['x-storeserviceapp-error']

                    switch (_errorKey) {
                        case 'email.exist':
                        case 'email.owner':
                            refAlertModal.current.openModal({
                                messages: (
                                    <GSTrans
                                        t={"page.setting.staff.duplicatedEmail"}
                                        values={{email: values.email}}
                                    >
                                        <strong>email</strong> is already exists!
                                    </GSTrans>
                                ),
                                type: AlertModalType.ALERT_TYPE_DANGER,
                            });

                            return
                    }

                    const {status, title, errorKey} = e.response.data;
                    switch (status) {
                        case 400:
                            if (title === "inactive.branches") {
                                GSToast.error(i18next.t("page.setting.staff.branch.inactive", {x: errorKey}))
                            }

                            break;
                        case 500:
                            GSToast.commonError();
                            break;
                        default:
                            GSToast.commonError();
                    }
                });
        }
    };

    const mapDTOToFormModel = (staffDTO) => {
        return {
            id: staffDTO.id,
            userId: staffDTO.userId,
            name: staffDTO.name,
            email: staffDTO.email,
            phoneExtension: "",
            branchId: staffDTO.branches.map(x => x.id)
        };
    };

    const onClickEditStaff = (staffDTO) => {
        let checkProduct=staffDTO.permissionCode.search(STAFF_PERMISSIONS.PRODUCTS)
        if(checkProduct!==-1){
            setIsProduct(true)
        }

        setStCurrentStaffFormModel(mapDTOToFormModel(staffDTO));
        setStCheckedFeatures(staffDTO.permissionCode.split(",").filter(c => !!c))
        setStIsShowModal(true);
    };

    const renderPermission = (permissionStr) => {
        if(!permissionStr) {
            return "";
        }
        let permissionList = permissionStr.split(",");
        permissionList = permissionList.map((p) =>
            i18next.t(`page.setting.staff.${p}`)
        );
        return permissionList.join(", ");
    };

    const onClickEnableStaff = (event, staff) => {
        const checked = event.currentTarget.checked;
        event.preventDefault();
        setStIsSaving(true);
        setTimeout(() => {
            const request = {
                enabled: checked,
                id: staff.id,
            };

            storeService
                .updateStaff(request)
                .then((result) => {
                    GSToast.commonUpdate();
                    setStIsSaving(false);
                    fetchData(currentPage - 1, SIZE_PER_PAGE);
                })
                .catch((e) => {
                    GSToast.commonError();
                    setStIsSaving(false);
                });
        }, 1000);
    };

    const buildCreatedRequest = (frmData) => {
        const storeId = CredentialUtils.getStoreId();
        let request = {
            email: "string",
            name: "string",
            permissionCode: "string",
            enabled: true,
            storeId: storeId,
            branchIds: "",
            langKey: CredentialUtils.getLangKey()
        };

        const checkProduct=frmData.permissionCode.find(permission => permission === STAFF_PERMISSIONS.PRODUCTS)
        let permissionCode=frmData.permissionCode
        if(!checkProduct){
            permissionCode=permissionCode.filter(permission => permission !== STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT)
            permissionCode=permissionCode.filter(permission => permission !== STAFF_PERMISSIONS.PURCHASE_ORDER)
        }
        // add reservation code if selected order
        const permissionCodeList = permissionCode;
        /* if (permissionCodeList.includes(STAFF_PERMISSIONS.ORDERS)) {
            permissionCodeList.push(STAFF_PERMISSIONS.RESERVATIONS);
        } */

        request.email = frmData.email;
        request.name = frmData.name;
        request.permissionCode = permissionCodeList.join(",");
        request.branchIds = frmData.branchId.join(",");

        return request;
    };

    const buildUpdatedRequest = (frmData) => {
        let request = {
            id: 0,
            name: "string",
            permissionCode: "string",
            branchIds: ""
        };
        const checkProduct=frmData.permissionCode.find(permission => permission === STAFF_PERMISSIONS.PRODUCTS)
        let permissionCode=frmData.permissionCode
        if(!checkProduct){
            permissionCode=permissionCode.filter(permission => permission !== STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT)
            permissionCode=permissionCode.filter(permission => permission !== STAFF_PERMISSIONS.PURCHASE_ORDER)
        }
        // add reservation code if selected order
        const permissionCodeList = permissionCode;
        /* if (permissionCodeList.includes(STAFF_PERMISSIONS.ORDERS)) {
            permissionCodeList.push(STAFF_PERMISSIONS.RESERVATIONS);
        } */

        request.id = frmData.id;
        request.name = frmData.name;
        request.permissionCode = permissionCodeList.join(",");
        request.branchIds = frmData.branchId.join(",");
        return request;
    };

    const changeVhtExtension = (value, staff) => {
        setStIsSaving(true);
        callCenterService
            .updateVhtExtensionForUser({
                sipPhone: value || null,
                storeId: parseInt(storageService.get(Constants.STORAGE_KEY_STORE_ID)),
                userId: staff.userId,
            })
            .then((result) => {
                GSToast.commonUpdate();
                setStIsSaving(false);
                fetchData(currentPage - 1, SIZE_PER_PAGE);
            })
            .catch((e) => {
                GSToast.commonError();
                setStIsSaving(false);
            });
    };

    const isLimitStaffList = () => {
        if (TokenUtils.onlyFreeOrLeadPackage()) {
            return (
                stStaffList.length >= MAXIMUM_STAFF
            );
        }
        return false;
    };

    return (
        <>
            <AlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refDeleteConfirmModal}/>
            <GSContentContainer
                className="staff-management"
                isSaving={stIsSaving}
                isLoading={stIsFetching}
                loadingZIndex={1051}
            >
                <UikWidget className="gs-widget">
                    <UikWidgetHeader
                        className="gs-widget__header"
                        rightEl={
                            <GSButton
                                success
                                disabled={isLimitStaffList()}
                                onClick={onClickAddStaff}
                            >
                                <GSTrans t={"page.setting.staff.addStaff"}/>
                            </GSButton>
                        }
                    >
                        <Trans i18nKey="page.setting.staff.staffManagement">
                            Staff management
                        </Trans>
                    </UikWidgetHeader>
                    <UikWidgetContent
                        key={"staff-on-desktop"}
                        className="gs-widget__content body"
                    >
                        <div className={"staff-list-desktop d-mobile-none d-desktop-flex"}>
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t={"page.setting.staff.nameTable"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.staff.permissions"}/>
                                    </th>
                                    {stIsEnabledCC && (
                                        <th>
                                            <GSTrans t={"page.setting.staff.phoneExtension"}/>
                                        </th>
                                    )}
                                    <th>
                                        <GSTrans t={"page.setting.staff.status"}/>
                                    </th>
                                    <th>
                                        <GSTrans t={"page.setting.staff.actions"}/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {stStaffList.map((staff) => {
                                    return (
                                        <tr key={staff.id + "-" + staff.enabled}>
                                            <td>
                                                <div className="d-flex flex-column align-items-start">
                                                    {staff.name && (
                                                        <div className="staff__name">{staff.name}</div>
                                                    )}
                                                    <div className="staff__email gsa__color--gray">
                                                        {staff.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{renderPermission(staff.permissionCode)}</td>
                                            {stIsEnabledCC && (
                                                <td>
                                                    <UikSelect
                                                        defaultValue={staff.vhtExtensionNumber}
                                                        options={staff.vhtExtensionOptions || []}
                                                        onChange={(item) =>
                                                            changeVhtExtension(item.value, staff)
                                                        }
                                                    />
                                                </td>
                                            )}
                                            <td>
                                                <div className="d-flex flex-column align-items-start btn-enable-staff">
                                                    <UikToggle
                                                        defaultChecked={staff.enabled}
                                                        disabled={staff.disabledStatus}
                                                        style={{
                                                            marginBottom: "0",
                                                        }}
                                                        onClick={(e) => onClickEnableStaff(e, staff)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="gsa-white-space--nowrap">
                                                {!staff.hideAction && (
                                                    <div>
                                                        <GSActionButton
                                                            icon={GSActionButtonIcons.EDIT}
                                                            onClick={() => onClickEditStaff(staff)}
                                                        />
                                                        <GSActionButton
                                                            icon={GSActionButtonIcons.DELETE}
                                                            className="ml-2"
                                                            onClick={() => onClickRemoveStaff(staff)}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </GSTable>
                        </div>
                        <div className={"staff-list-desktop d-mobile-none d-desktop-flex"}>
                            <PagingTable
                                totalPage={totalPage}
                                maxShowedPage={10}
                                currentPage={currentPage}
                                onChangePage={onChangeListPage}
                                totalItems={totalItem}
                                hidePagingEmpty
                            ></PagingTable>
                        </div>
                        <div className={"staff-list-mobile d-mobile-flex d-desktop-none"}>
                            <UikWidget className="gs-widget">
                                <UikWidgetContent
                                    key={"staff-on-mobile"}
                                    className="gs-widget__content"
                                >
                                    <PagingTable
                                        headers={tableConfig.headerList.filter((e, index) => {
                                            if (!stIsEnabledCC && index === 2) {
                                                return false;
                                            }
                                            return true;
                                        })}
                                        totalPage={totalPage}
                                        maxShowedPage={10}
                                        currentPage={currentPage}
                                        onChangePage={onChangeListPage}
                                        totalItems={totalItem}
                                        hidePagingEmpty
                                    >
                                        {stStaffList.map((staff, index) => {
                                            return (
                                                <div key={staff.name + '-' + index} className="setting__account">
                                                    <div className="account__block">
                            <span className="account__line2">
                              <div className="d-flex flex-column align-items-start">
                                {staff.name && (
                                    <div className="staff__name">
                                        {staff.name}
                                    </div>
                                )}
                                  <div className="staff__email gsa__color--gray">
                                  {staff.email}
                                </div>
                              </div>
                            </span>
                                                    </div>
                                                    <div className="account__block">
                            <span className={"account__line2 "}>
                              {renderPermission(staff.permissionCode)}
                            </span>
                                                    </div>
                                                    {stIsEnabledCC && (
                                                        <div className="account__block">
                              <span className={"account__line2 "}>
                                <UikSelect
                                    defaultValue={staff.vhtExtensionNumber}
                                    options={staff.vhtExtensionOptions || []}
                                    onChange={(item) =>
                                        changeVhtExtension(item.value, staff)
                                    }
                                />
                              </span>
                                                        </div>
                                                    )}
                                                    <div className="account__block">
                            <span className={"account__line2 "}>
                              <div className="d-flex flex-column align-items-start btn-enable-staff">
                                <UikToggle
                                    defaultChecked={staff.enabled}
                                    disabled={staff.disabledStatus}
                                    style={{
                                        marginBottom: "0",
                                    }}
                                    onClick={(e) => onClickEnableStaff(e, staff)}
                                />
                              </div>
                            </span>
                                                    </div>
                                                    {!staff.hideAction && (
                                                        <div className="account__block">
                              <span className={"account__line2 "}>
                                <div>
                                  <GSActionButton
                                      icon={GSActionButtonIcons.EDIT}
                                      onClick={() => onClickEditStaff(staff)}
                                  />
                                  <GSActionButton
                                      icon={GSActionButtonIcons.DELETE}
                                      className="ml-2"
                                      onClick={() => onClickRemoveStaff(staff)}
                                  />
                                </div>
                              </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        )
                                    </PagingTable>
                                </UikWidgetContent>
                            </UikWidget>
                        </div>
                        {stStaffList.length === 0 && (
                            <div>
                                <GSWidgetEmptyContent
                                    text={i18next.t("page.setting.staff.noStaff")}
                                    iconSrc={"/assets/images/staff/icon-empty-staff.png"}
                                    className="m-0"
                                />
                            </div>
                        )}
                    </UikWidgetContent>
                </UikWidget>
                {/*MODAL*/}
                <Modal isOpen={stIsShowModal} className="add-staff-modal" wrapClassName={'staff-modal-wrapper'}>
                    <AvForm
                        onValidSubmit={ handleValidSubmit }
                        model={ stCurrentStaffFormModel }
                    >
                        <div className="staff-modal__header">
                            <GSTrans
                                t={
                                    stCurrentStaffFormModel && stCurrentStaffFormModel.id
                                        ? "page.setting.staff.editStaff"
                                        : "page.setting.staff.addStaff"
                                }
                            />
                            <GSActionButton
                                icon={GSActionButtonIcons.CLOSE}
                                width=".8rem"
                                onClick={closeStaffModal}
                            />
                        </div>
                        <ModalBody className="p-0">
                            <div className="pl-4 pr-4">
                                <AvField name="id" hidden/>
                                <AvField
                                    label={i18next.t("page.setting.staff.name")}
                                    name="name"
                                    validate={{
                                        ...FormValidate.maxLength(100),
                                    }}
                                />
                                <AvField
                                    label={i18next.t("page.setting.staff.email")}
                                    name="email"
                                    type="email"
                                    validate={{
                                        ...FormValidate.required(),
                                    }}
                                    disabled={
                                        !stCurrentStaffFormModel
                                            ? false
                                            : !stCurrentStaffFormModel.email
                                            ? false
                                            : true
                                    }
                                />
                            </div>
                            <div className="permission__container pl-4 pr-4 pt-3">
                                <div className="permission__header">
                                    <div className="permission__title">
                                        <GSTrans t={"page.setting.staff.permissions"}/>
                                    </div>
                                    <div className="permission__description">
                                        <GSTrans t={"page.setting.staff.selectPermissions"}/>
                                    </div>
                                </div>
                                <hr/>
                                <div className="permission__body">
                                    <AvCheckboxGroup name="permissionCode"
                                                     className={ stEmptyFeaturesError ? 'was-validated' : '' }>
                                        <div className="row" style={ { backgroundColor: "#F9F9F9"}}>
                                            {stPermissionList.map((permission) => {
                                                const isFreeOrLeadPackage = TokenUtils.onlyFreeOrLeadPackage();
                                                const isCheckPosPackage = TokenUtils.isCheckPosPackage();
                                                return (
                                                    <div className="col-6 col-md-4 pl-0" key={permission.code}>
                                                        <AvCheckbox
                                                            key={ permission.code }
                                                            id={ permission.code }
                                                            name={ permission.code }
                                                            disabled={ isFreeOrLeadPackage || (permission.code === STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT && !isProduct) ||
                                                                (permission.code === STAFF_PERMISSIONS.PURCHASE_ORDER && !isProduct) || (permission.code === STAFF_PERMISSIONS.CASHBOOK_SERVICE && isCheckPosPackage) }
                                                            customInput
                                                            label={ i18next.t(
                                                                `page.setting.staff.${ permission.code }`
                                                            ) }
                                                            onChange={ e => handleCheckFeature(permission.code, e) }
                                                            checked={ stCheckedFeatures.includes(permission.code) }
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AvCheckboxGroup>
                                    {
                                        stEmptyFeaturesError && <span className="error">
                                            <GSTrans t="common.validation.required"/>
                                        </span>
                                    }
                                </div>
                            </div>
                            <div className="branch__container pl-4 pr-4 pt-3">
                                <div className="branch__header">
                                    <div className="branch__title">
                                        <GSTrans t={"page.branch.plans.step1.branch"}/>
                                    </div>
                                </div>
                                <hr/>
                                <div className="branch__body">
                                    <AvCheckboxGroup
                                        name="branchId"
                                        validate={{
                                            ...FormValidate.required("page.setting.staff.branch.validate"),
                                        }}
                                    >
                                        <div className="row" style={{backgroundColor: "#F9F9F9"}}>
                                            {stBranchList.map((branch) => {
                                                const isFreeOrLeadPackage = TokenUtils.onlyFreeOrLeadPackage();
                                                return (
                                                    <div className="col-6 col-md-6 pl-0" key={branch.id}>
                                                        <AvCheckbox
                                                            key={branch.id}
                                                            disabled={isFreeOrLeadPackage}
                                                            customInput
                                                            label={branch.name}
                                                            value={branch.id}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AvCheckboxGroup>
                                </div>
                            </div>
                        </ModalBody>
                        <div className="staff-modal__footer">
                            <GSButton default onClick={onClickCancelAddStaff}>
                                <GSTrans t={"common.btn.cancel"}/>
                            </GSButton>
                            <GSButton success marginLeft>
                                <GSTrans t={"common.btn.done"}/>
                            </GSButton>
                        </div>
                    </AvForm>
                </Modal>
            </GSContentContainer>
        </>
    );
};

StaffManagement.propTypes = {};

export default StaffManagement;
