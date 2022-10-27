import React, {useEffect, useRef, useState} from "react";
import "./AffiliateCommissionFormEditor.sass";
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
import {UikWidget} from "../../../@uik";
import {
    AvField,
    AvForm,
    AvRadio,
    AvRadioGroup,
} from "availity-reactstrap-validation";
import i18next from "i18next";
import {FormValidate} from "../../../config/form-validate";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import style from "./CouponEditor.module.sass";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import CollectionModal from "../../../components/shared/CollectionModal/CollectionModal";
import {CommissionTypeEnum} from "../../../models/CommissionTypeEnum";
import storageService from "../../../services/storage";
import affiliateService from "../../../services/AffiliateService";
import {GSToast} from "../../../utils/gs-toast";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {RouteUtils} from "../../../utils/route";
import ProductModal from "../../products/CollectionSelectProductModal/ProductModal";
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {NumericSymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertInline, {AlertInlineType} from "../../../components/shared/AlertInline/AlertInline";
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";

const AffiliateCommissionFormEditor = (props) => {
    const [stEditorMode, setStEditorMode] = useState(
        Constants.AFFILIATE_MODE.CREATE
    );
    const [stIsShowCollectionError, setStIsShowCollectionError] = useState(false);
    const [stIsShowProductError, setStIsShowProductError] = useState(false);
    const [stIsShowCollectionModal, setStIsShowCollectionModal] = useState(false);
    const [stIsShowProductModal, setStIsShowProductModal] = useState(false);
    const [stSpecificCollections, setStSpecificCollections] = useState([]);
    const [stSpecificProducts, setStSpecificProducts] = useState([]);
    const refSubmit = useRef(null);
    const [loadingScreen, setLoadingScreen] = useState(false);
    const [stCommissionDefault, setStCommissionDefault] = useState();
    const [stWarning, setStWarning] = useState({
        commissionName: undefined,
        partnerName: undefined,
    });
    const [stWarningFlag, setStWarningFlag] = useState();
    let refConfirmModal = useRef();
    const [stCommissionData, setStCommissionData] = useState({
        name: undefined,
        type: CommissionTypeEnum.TYPE.APPLIES_TO_ALL_PRODUCTS,
        items: [],
        rate: undefined,
        storeId: storageService.getFromLocalStorage(
            Constants.STORAGE_KEY_STORE_ID
        ),
    });
    const FormName = {
        CONDITION_APPLIES_TO: "type",
    };
    const [stModel, setStModel] = useState({
        [FormName.CONDITION_APPLIES_TO]:
        CommissionTypeEnum.TYPE.APPLIES_TO_ALL_PRODUCTS,
    });
    useEffect(() => {
        setLoadingScreen(false);
        if (
            props.match.path ===
            NAV_PATH.affiliateCommissionEdit + "/:itemId"
        ) {
            affiliateService
                .getCommissionById(props.match.params.itemId)
                .then((result) => {
                    setStCommissionDefault(result);
                    setStCommissionData(result);
                    if (
                        result.type ===
                        CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_PRODUCTS
                    ) {
                        let products = [];
                        result.items.forEach((e) => {
                            products.push({
                                itemId: e.itemId,
                                modelId: e.modelId,
                                id: e.modelId
                                    ? e.itemId + "-" + e.modelId
                                    : e.itemId.toString(),
                            });
                        });
                        setStSpecificProducts(products);
                    }
                    if (
                        result.type ===
                        CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_COLLECTIONS
                    ) {
                        let collections = [];
                        result.items.forEach((e) => {
                            collections.push({
                                id: e.collectionId,
                            });
                        });
                        setStSpecificCollections(collections);
                    }
                    setStModel({
                        ...stModel,
                        [FormName.CONDITION_APPLIES_TO]: result.type,
                    });
                });
        }
    }, []);

    const isSubmitFormValid = () => {
        let hasError = false
        if (stCommissionData.type === CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_COLLECTIONS && stCommissionData.items.length == 0) {
            setStIsShowCollectionError(true)
            hasError = true
        }
        if (stCommissionData.type === CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_PRODUCTS && stCommissionData.items.length == 0) {
            setStIsShowProductError(true)
            hasError = true
        }
        return !hasError
    }

    const submitHandler = async (event, value) => {
        if (!isSubmitFormValid()) return false
        event.preventDefault();
        if (props.match.path === NAV_PATH.affiliateCommissionCreate) {
            affiliateService
                .createCommission(stCommissionData)
                .then((res) => {
                    GSToast.success(
                        "component.call.history.status.successful",
                        true
                    );
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateCommission);
                })
                .catch((error) => GSToast.commonError());
        } else {
            affiliateService
                .updateCommission(stCommissionData)
                .then((res) => {
                    const warning = !res.agreeableToUpdateDTO.agreeableToUpdate;
                    const warningContent = res.agreeableToUpdateDTO.result;
                    if (warning) {
                        setStWarningFlag({
                            ...stWarning,
                            warningContent,
                        });
                        setStWarning(warningContent[0]);
                    } else {
                        GSToast.success(
                            "component.call.history.status.successful",
                            true
                        );
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateCommission);
                    }
                })
                .catch((e) => {
                    //GSToast.commonError();
                });
        }
    };
    const onRadioSelect = (e, name) => {
        e.persist();
        const value = e.currentTarget.value;
        onFormChange({
            currentTarget: {
                name: name,
                value: value,
            },
        });
        if (name === FormName.CONDITION_APPLIES_TO) {
            if (value === CommissionTypeEnum.TYPE.APPLIES_TO_ALL_PRODUCTS) {
                setStIsShowCollectionError(false);
                setStIsShowProductError(false);
            }
            if (value === CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_PRODUCTS) {
                setStIsShowCollectionError(false);
            }
            if (value === CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_COLLECTIONS) {
                setStIsShowProductError(false);
            }
        }
    };
    const onFormChange = (e) => {
        let value, frmName;
        // primitive dom
        if (e.currentTarget) {
            // if (e.persist) e.persist()
            value = e.currentTarget.value;
            frmName = e.currentTarget.name;
        } else {
            // if (e.persist) e.persist()
            value = e.target.value;
            frmName = e.target.name;
        }
        if (value !== undefined && frmName !== undefined) {
            setStModel({
                ...stModel,
                [frmName]: value,
            });
            setStCommissionData({
                ...stCommissionData,
                type: value,
            });
        }
    };
    const toggleCollectionModal = () => {
        setStIsShowCollectionModal(!stIsShowCollectionModal);
    };
    const toggleProductModal = () => {
        setStIsShowProductModal(!stIsShowProductModal);
    };
    const onCloseSpecificProductSelector = (products) => {
        if (products) {
            setStSpecificProducts(products);
            let items = [];
            products.forEach((e) => {
                items.push({
                    itemId: e.itemId,
                    modelId: e.modelId,
                });
            });
            setStCommissionData({
                ...stCommissionData,
                items: items,
            });
            if (products.length == 0) {
                setStIsShowProductError(true);
            } else {
                setStIsShowProductError(false);
            }

        }
        setStIsShowProductModal(false);
    };
    const onCloseSpecificCollectionSelector = (collectionIds) => {
        if (collectionIds) {
            setStSpecificCollections(collectionIds);
            let collections = [];
            collectionIds.map((value) => {
                collections.push({collectionId: value.id});
            });
            setStCommissionData({
                ...stCommissionData,
                items: collections,
            });
            if (collectionIds.length == 0) {
                setStIsShowCollectionError(true);
            } else {
                setStIsShowCollectionError(false);
            }
        }
        setStIsShowCollectionModal(false);
    };


    const handleCancel = (e) => {
        e.preventDefault();
        refConfirmModal.openModal({
            messages: i18next.t("component.product.addNew.cancelHint"),
            okCallback: () => {
                RouteUtils.redirectWithReload(NAV_PATH.affiliateCommission);
            },
        });
    };

    const renderWarning = (className) => {
        const defaultClassName = className || "warning";
        return (
            <div className={defaultClassName}>
                {i18next.t("page.update.commission.warning.message", {
                    commission: stWarning.commissionName,
                    partner: stWarning.partnerName,
                })}
            </div>
        );
    };
    const renderHeader = () => {
        return (
            <>
                <div className="purchase-order-form-header">
                    <div className="title" onClick={(e) => handleCancel(e)}>
                        <Link
                            className="color-gray mb-2 d-block text-capitalize"
                        >
                            &#8592;{" "}
                            <GSTrans t="page.affiliate.commission.management"/>
                        </Link>
                        <h5 className="gs-page-title">
                            {props.match.path ===
                            NAV_PATH.affiliateCommissionCreate ? (
                                <GSTrans t="page.affiliate.commission.commission.create"/>
                            ) : (
                                <GSTrans t="page.affiliate.commission.commission.edit"/>
                            )}
                        </h5>
                    </div>
                </div>
                <GSContentHeaderRightEl>
                    <div className="gss-content-header--action-btn">
                        <div className="gss-content-header--action-btn--group">
                            {/*BTN SAVE*/}
                            <GSButton
                                success
                                className="btn-save"
                                onClick={() => refSubmit.current.click()}
                            >
                                <Trans
                                    i18nKey={"common.btn.save"}
                                    className="sr-only"
                                >
                                    Save
                                </Trans>
                            </GSButton>
                            {/*BTN CANCEL*/}
                            <GSButton secondary outline marginLeft onClick={(e) => handleCancel(e)}>
                                <Trans i18nKey="common.btn.cancel">
                                    Cancel
                                </Trans>
                            </GSButton>
                        </div>
                    </div>
                </GSContentHeaderRightEl>
            </>
        );
    };
    return (
        <>
            <ConfirmModal ref={(el) => {
                refConfirmModal = el
            }}/>

            {loadingScreen && <LoadingScreen/>}
            <GSContentContainer
                minWidthFitContent
                className="affiliate-commission-form-editor"
            >
                <GSContentHeader>{renderHeader()}</GSContentHeader>
                {stWarningFlag && renderWarning("warning")}
                <AvForm className="w-100" onValidSubmit={submitHandler} autoComplete="off">
                    <button ref={refSubmit} hidden/>
                    <GSContentBody
                        size={GSContentBody.size.MAX}
                        className="affiliate-commission-form-editor__body-desktop d-desktop-flex"
                    >
                        <div className="row w-100 ">
                            {/*Partner Type*/}
                            <UikWidget className="gs-widget">
                                <GSWidgetContent className="gs-widget__content">
                                    <label className="gs-frm-input__label" style={{
                                        color: 'black'
                                    }}>
                                        {i18next.t("page.affiliate.commission.commission.name")}
                                    </label>
                                    <div className="affiliate-commission-form-editor__input-name-wrapper">
                                        <AvFieldCountable
                                            maxLength={65}
                                            minLength={3}
                                            isRequired
                                            name={"commissionName"}
                                            value={stCommissionData.name}
                                            onBlur={(e) => {
                                                setStCommissionData({
                                                    ...stCommissionData,
                                                    name: e.currentTarget.value,
                                                });
                                            }}
                                            defaultvalue={stCommissionData.name}
                                        />
                                    </div>
                                    <div className="label mb-3 mt-3">
                                        <GSTrans t="page.affiliate.commission.commission.type2"/>
                                    </div>
                                    <AvRadioGroup
                                        name={FormName.CONDITION_APPLIES_TO}
                                        className={["gs-frm-radio"].join(" ")}
                                        inline
                                        validate={{
                                            ...FormValidate.required(),
                                        }}
                                        value={stCommissionData.type}
                                        defaultValue={
                                            stModel[
                                                FormName.CONDITION_APPLIES_TO
                                                ]
                                        }
                                        // onChange={onFormChange}
                                    >
                                        <AvRadio
                                            customInput
                                            className={style.customRadio}
                                            label={i18next.t(
                                                "page.affiliate.commission.commission.type.allProducts"
                                            )}
                                            value={
                                                CommissionTypeEnum.TYPE
                                                    .APPLIES_TO_ALL_PRODUCTS
                                            }
                                            onClick={(e) =>
                                                onRadioSelect(
                                                    e,
                                                    FormName.CONDITION_APPLIES_TO
                                                )
                                            }
                                        />
                                        <PrivateComponent
                                            hasAnyPackageFeature={[
                                                PACKAGE_FEATURE_CODES.FEATURE_0127,
                                            ]}
                                            disabledStyle={"hidden"}
                                        >
                                            <AvRadio
                                                customInput
                                                className={style.customRadio}
                                                label={
                                                    <div>
                                                        <GSTrans
                                                            t="page.affiliate.commission.commission.type.specificProducts"
                                                            values={{
                                                                types: "page.discount.create.coupon.types.productCap",
                                                            }}
                                                        />
                                                        {stModel[
                                                            FormName
                                                                .CONDITION_APPLIES_TO
                                                            ] ===
                                                        CommissionTypeEnum
                                                            .TYPE
                                                            .APPLIES_TO_SPECIFIC_PRODUCTS && (
                                                            <div
                                                                className={
                                                                    style.frmOptionValue
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        style.linkSelector
                                                                    }
                                                                >
                                                                    <GSFakeLink
                                                                        onClick={
                                                                            toggleProductModal
                                                                        }
                                                                    >
                                                                        <GSTrans
                                                                            t={
                                                                                "page.marketing.discounts.coupons.create.usageLimits.addProducts"
                                                                            }
                                                                            values={{
                                                                                types: i18next.t(
                                                                                    "page.discount.create.coupon.types.products"
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </GSFakeLink>
                                                                    &nbsp;
                                                                    <span>
                                                                        <GSTrans
                                                                            t={
                                                                                "page.marketing.discounts.coupons.create.usageLimits.selectedProduct"
                                                                            }
                                                                            values={{
                                                                                x: stSpecificProducts.length,
                                                                                types: i18next.t(
                                                                                    "page.discount.create.coupon.types.products"
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </span>
                                                                    {stIsShowProductError &&
                                                                    <AlertInline
                                                                        text={i18next.t('page.discount.create.coupon.validate.productAtLeast1')}
                                                                        textAlign={"left"}
                                                                        nonIcon
                                                                        style={{'font-size': '1em'}}
                                                                        type={AlertInlineType.ERROR}
                                                                        padding={false}
                                                                    />}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                                value={
                                                    CommissionTypeEnum.TYPE
                                                        .APPLIES_TO_SPECIFIC_PRODUCTS
                                                }
                                                onClick={(e) =>
                                                    onRadioSelect(
                                                        e,
                                                        FormName.CONDITION_APPLIES_TO
                                                    )
                                                }
                                            />
                                        </PrivateComponent>
                                        <AvRadio
                                            customInput
                                            className={style.customRadio}
                                            label={
                                                <div>
                                                    <GSTrans
                                                        t={
                                                            "page.affiliate.commission.commission.type.specificCollections"
                                                        }
                                                        values={{
                                                            types: i18next.t(
                                                                "page.discount.create.coupon.types.product"
                                                            ),
                                                        }}
                                                    />
                                                    {stModel[
                                                        FormName
                                                            .CONDITION_APPLIES_TO
                                                        ] ===
                                                    CommissionTypeEnum.TYPE
                                                        .APPLIES_TO_SPECIFIC_COLLECTIONS && (
                                                        <div
                                                            className={
                                                                style.frmOptionValue
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    style.linkSelector
                                                                }
                                                            >
                                                                <GSFakeLink
                                                                    onClick={
                                                                        toggleCollectionModal
                                                                    }
                                                                >
                                                                    <GSTrans
                                                                        t={
                                                                            "page.marketing.discounts.coupons.create.usageLimits.addCollections"
                                                                        }
                                                                    />
                                                                </GSFakeLink>
                                                                &nbsp;
                                                                <span
                                                                    className={
                                                                        style.totalItem
                                                                    }
                                                                >
                                                                    <GSTrans
                                                                        t={
                                                                            "page.marketing.discounts.coupons.create.usageLimits.selectedCollection"
                                                                        }
                                                                        values={{
                                                                            x: stSpecificCollections.length,
                                                                        }}
                                                                    />
                                                                </span>
                                                                {stIsShowCollectionError &&
                                                                <AlertInline
                                                                    text={i18next.t('page.discount.create.coupon.validate.collectionAtLeast1')}
                                                                    textAlign={"left"}
                                                                    nonIcon
                                                                    type={AlertInlineType.ERROR}
                                                                    style={{'font-size': '1em'}}
                                                                    padding={false}
                                                                />
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                            value={
                                                CommissionTypeEnum.TYPE
                                                    .APPLIES_TO_SPECIFIC_COLLECTIONS
                                            }
                                            onClick={(e) =>
                                                onRadioSelect(
                                                    e,
                                                    FormName.CONDITION_APPLIES_TO
                                                )
                                            }
                                        />
                                    </AvRadioGroup>
                                    <AvFieldCurrency
                                        style={{
                                            width: "20%",
                                        }}
                                        label={i18next.t(
                                            "page.affiliate.commission.commission.rate"
                                        )}
                                        name={"commissionRate"}
                                        unit={NumericSymbol.PERCENTAGE}
                                        onBlur={(e) => {
                                            setStCommissionData({
                                                ...stCommissionData,
                                                rate: e.currentTarget.value
                                            });
                                        }}
                                        precision={'2'}
                                        decimalScale={2}
                                        value={stCommissionData.rate}
                                        defaultValue={stCommissionData.rate}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.minValue(0.01, true, "page.affiliate.validation.commission.rate.min"),
                                            ...FormValidate.maxValue(100, true, "page.affiliate.validation.commission.rate.max"),
                                        }}
                                    />
                                </GSWidgetContent>
                            </UikWidget>
                        </div>
                    </GSContentBody>
                </AvForm>
                {stIsShowProductModal && (
                    <ProductModal
                        productSelectedList={stSpecificProducts}
                        onClose={onCloseSpecificProductSelector}
                        type={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                    />
                )}
                {stIsShowCollectionModal && (
                    <CollectionModal
                        collectionSelectedList={stSpecificCollections}
                        onClose={onCloseSpecificCollectionSelector}
                        itemType={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                    />
                )}
            </GSContentContainer>
        </>
    );
};
AffiliateCommissionFormEditor.defaultProps = {}
AffiliateCommissionFormEditor.propTypes = {};
export default AffiliateCommissionFormEditor;
