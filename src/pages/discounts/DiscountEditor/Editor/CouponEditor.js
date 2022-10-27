/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
 import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
 import style from "./CouponEditor.module.sass";
 import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
 import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
 import i18next from "i18next";
 import GSContentHeaderRightEl
     from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
 import GSButton from "../../../../components/shared/GSButton/GSButton";
 import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
 import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
 import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
 import GSWidgetHeader from "../../../../components/shared/form/GSWidget/GSWidgetHeader";
 import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
 import Row from "reactstrap/es/Row";
 import Col from "reactstrap/es/Col";
 import {AvCheckbox, AvCheckboxGroup, AvField, AvForm, AvRadio, AvRadioGroup,} from "availity-reactstrap-validation";
 import Constants from "../../../../config/Constant";
 import DateRangePicker from "react-bootstrap-daterangepicker";
 import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
 import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
 import {CouponTypeEnum, FeeShippingTypeEnum,} from "../../../../models/CouponTypeEnum";
 import {FormValidate} from "../../../../config/form-validate";
 import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
 import {NumericSymbol,} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
 import AvCustomCheckbox from "../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
 import {DiscountConditionOptionEnum} from "../../../../models/DiscountConditionOptionEnum";
 import CollectionModal from "../../../../components/shared/CollectionModal/CollectionModal";
 import {BCOrderService} from "../../../../services/BCOrderService";
 import {GSToast} from "../../../../utils/gs-toast";
 import storageService from "../../../../services/storage";
 import {RouteUtils} from "../../../../utils/route";
 import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
 import moment from "moment";
 import AlertInline, {AlertInlineType,} from "../../../../components/shared/AlertInline/AlertInline";
 import {DiscountStatusEnum} from "../../../../models/DiscountStatusEnum";
 import {CredentialUtils} from "../../../../utils/credential";
 import CustomerSegmentModal from "../../../../components/shared/CustomerSegmentModal/CustomerSegmentModal";
 import {DISCOUNT_TYPES, DiscountEditorMode} from "../Editor/DiscountEditor";
 import PrivateComponent from "../../../../components/shared/PrivateComponent/PrivateComponent";
 import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";
 import _ from "lodash";
 import PropTypes from "prop-types";
 import {cn} from "../../../../utils/class-name";
 import storeService from "../../../../services/StoreService";
 import {TokenUtils} from "../../../../utils/token";
 import GSEditor from "../../../../components/shared/GSEditor/GSEditor";
 import {Trans} from "react-i18next";
 import {Label} from "reactstrap";
 import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";
 import PromotionAddBranchModal, {BUTTON_TYPE_SELECT,} from "../../../../components/shared/PromotionAddBranchModal/PromotionAddBranchModal";
 import ProductNoVariationModal from "../../../products/CollectionSelectProductModal/ProductNoVariationModal";
 import HintPopupVideo from "../../../../components/shared/HintPopupVideo/HintPopupVideo";
 import {CurrencyUtils} from "../../../../utils/number-format";
 
 const DATE_RANGE_LOCATE_CONFIG = {
     format: "DD-MM-YYYY",
     formatYMD: "YYYY-MM-DD",
     applyLabel: i18next.t("component.order.date.range.apply"),
     cancelLabel: i18next.t("component.order.date.range.cancel"),
 };
 
 const FormName = {
     ID: 'id',
     NAME: 'name',
     COUPON_CODE: 'couponCode',
     COUPON_DATE_RANGE: 'couponDateRange',
     COUPON_DATE_RANGE_START: 'couponDateRangeStart',
     COUPON_DATE_RANGE_END: 'couponDateRangeEnd',
     COUPON_LIMIT_TO_ONE: 'couponLimitToOne',
     COUPON_LIMITED_USAGE: 'couponLimitedUsage',
     COUPON_LIMITED_USAGE_VALUE: 'couponLimitedUsageValue',
     COUPON_TYPE: 'couponType',
     COUPON_PERCENTAGE_VALUE: 'couponPercentageValue',
     COUPON_USED: 'couponUsed',
     COUPON_FIXED_AMOUNT_VALUE: 'couponFixedAmountValue',
     COUPON_FEE_SHIPPING_AMOUNT_VALUE: 'couponFeeShippingAmountValue',
     COUPON_FEE_SHIPPING_TYPE: 'couponFeeShippingType',
     TYPE: 'type',
     COUPON_LIMIT_CONFIG: 'couponLimitConfig',
     CONDITION_CUSTOMER_SEGMENT: 'conditionCustomerSegment',
     CONDITION_CUSTOMER_SEGMENT_VALUE: 'conditionCustomerSegmentValue',
     CONDITION_APPLIES_TO: 'conditionAppliesTo',
     CONDITION_APPLIES_TO_VALUE: 'conditionAppliesToValue',
     CONDITION_MIN_REQ: 'conditionMinReq',
     CONDITION_MIN_REQ_VALUE: 'conditionMinReqValue',
     CONDITION_PLATFORM: 'conditionPlatform',
     CONDITION_PLATFORM_VALUE: 'conditionPlatformValue',
     COUPON_ENABLED_REWARDS: 'enabledRewards',
     COUPON_REWARDS_DESCRIPTION: 'rewardsDescription',
     CONDITION_APPLIES_TO_BRANCH: 'conditionAppliesToBranch',
};

const selectDefaultPlatformValue = (platform) => {
     switch (platform) {
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_WEB_INSTORE:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.WEB,
                 DiscountConditionOptionEnum.PLATFORMS.APP,
                 DiscountConditionOptionEnum.PLATFORMS.IN_STORE
             ];
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_WEB:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.APP,
                 DiscountConditionOptionEnum.PLATFORMS.WEB
             ];
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_INSTORE:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.APP,
                 DiscountConditionOptionEnum.PLATFORMS.IN_STORE
             ];
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_WEB_INSTORE:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.WEB,
                 DiscountConditionOptionEnum.PLATFORMS.IN_STORE
             ];
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_WEB_ONLY:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.WEB
             ];
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_ONLY:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.APP
             ];
         case DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_INSTORE_ONLY:
             return [
                 DiscountConditionOptionEnum.PLATFORMS.IN_STORE
             ];
     }
 };
 
 const VALIDATE_INPUT = {
    MIN: 1,
    MIN_NON_VND: 0.01,
    MIN_REQ_NON_VND: 0,
    MAX_QUANTITY: 1000000
 }
 
 const CouponEditor = props => {
     const {currency, ...others} = props
     const refSaveBtn = useRef(null);
     const [stCheckMinInput, setStCheckMinInput] = useState(VALIDATE_INPUT.MIN);
     const [stCheckMinReq, setStCheckMinReq] = useState(VALIDATE_INPUT.MIN);
     const [stIsShowProductModal, setStIsShowProductModal] = useState(false);
     const [stIsShowCollectionModal, setStIsShowCollectionModal] = useState(false);
     const [stIsShowCustomerSegmentModal, setStIsShowCustomerSegmentModal] = useState(false);
     const [stIsShowAddBranchModal, setStIsShowAddBranchModal] = useState(false);
 
     const [stSpecificProducts, setstSpecificProducts] = useState([]);
     const [stSpecificCollections, setstSpecificCollections] = useState([]);
     const [stSpecificSegments, setStSpecificSegments] = useState([]);
     const [stSpecificSegmentUsers, setStSpecificSegmentUsers] = useState(0);
 
     const [stSpecificBranches, setStSpecificBranches] = useState([]);
     const [stStaffAllBranches, setStStaffAllBranches] = useState([]);
     const [stIsNotOwnerId, setIsNotOwnerId] = useState(null);
 
     const [isProcessing, setIsProcessing] = useState(false);
     const [isRedirect, setIsRedirect] = useState(false);
     const [stIsLoading, setStIsLoading] = useState(true);
     const [stIsShowPlatformError, setStIsShowPlatformError] = useState(false);
     const [stIsShowShippingProviderError, setStIsShowShippingProviderError] = useState(false);
     const [stIsShowSegmentError, setStIsShowSegmentError] = useState(false);
     const [stIsShowCollectionError, setStIsShowCollectionError] = useState(false);
     const [stIsShowProductError, setStIsShowProductError] = useState(false);
     const [stIsShowBranchError, setStIsShowBranchError] = useState(false);
     const [stTimeCopy, setStTimeCopy] = useState(0);
     const [stModel, setStModel] = useState({
         [FormName.ID]: 0,
         [FormName.TYPE]: props.type,
         [FormName.NAME]: '',
         [FormName.COUPON_CODE]: '',
         [FormName.COUPON_DATE_RANGE]: '',
         [FormName.COUPON_DATE_RANGE_START]: null,
         [FormName.COUPON_DATE_RANGE_END]: null,
         [FormName.COUPON_LIMIT_TO_ONE]: false,
         [FormName.COUPON_LIMITED_USAGE]: false,
         [FormName.COUPON_LIMITED_USAGE_VALUE]: 1,
         [FormName.COUPON_TYPE]: CouponTypeEnum.PERCENTAGE,
         [FormName.COUPON_PERCENTAGE_VALUE]: 1,
         [FormName.COUPON_FIXED_AMOUNT_VALUE]: currency !== Constants.CURRENCY.VND.SYMBOL? VALIDATE_INPUT.MIN_NON_VND : VALIDATE_INPUT.MIN,
         [FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE]: null,
         [FormName.COUPON_FEE_SHIPPING_TYPE]: FeeShippingTypeEnum.FIXED_AMOUNT,
         [FormName.COUPON_USED]: 0,
         [FormName.CONDITION_CUSTOMER_SEGMENT]: DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS,
         [FormName.CONDITION_APPLIES_TO]: DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER,
         [FormName.CONDITION_MIN_REQ]: DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_NONE,
         [FormName.CONDITION_MIN_REQ_VALUE]: currency !== Constants.CURRENCY.VND.SYMBOL ? VALIDATE_INPUT.MIN_REQ_NON_VND : VALIDATE_INPUT.MIN,
         [FormName.CONDITION_PLATFORM]: [],
         [FormName.COUPON_ENABLED_REWARDS]: false,
         [FormName.COUPON_REWARDS_DESCRIPTION]: '',
         [FormName.CONDITION_APPLIES_TO_BRANCH]: DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_ALL_BRANCHES,
     });
     
     const [stShippingProviders, setStShippingProviders] = useState([
         {
             name: Constants.LogisticCode.Common.GIAO_HANG_NHANH,
             disabled: false,
             isChecked: false
         },
         {
             name: Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM,
             disabled: false,
             isChecked: false
         },
         // {
         //     name: Constants.LogisticCode.Common.VNPOST,
         //     disabled: false,
         //     isChecked: false
         // },
         {
             name: Constants.LogisticCode.Common.AHAMOVE,
             disabled: false,
             isChecked: false
         },
         {
             name: Constants.LogisticCode.Common.SELF_DELIVERY,
             disabled: false,
             isChecked: false
         }
     ]);
     const [isSettingNoExpiredDate, setIsSettingNoExpiredDate] = useState(false);
 
     useEffect(() => {
         if(currency !== Constants.CURRENCY.VND.SYMBOL){
             setStCheckMinInput(VALIDATE_INPUT.MIN_NON_VND)
             setStCheckMinReq(VALIDATE_INPUT.MIN_REQ_NON_VND)
         }
     }, []);
 
     useEffect(() => {
 
         if (props.mode === DiscountEditorMode.EDIT) {
             // get detail when edit
             storeService.getDeliveryProvider()
                 .then(result => {
                     result = result.filter(p => p.providerName !== Constants.LogisticCode.Common.SELF_DELIVERY || (
                         p.providerName === Constants.LogisticCode.Common.SELF_DELIVERY && p.enabled
                     ) )
 
                     BCOrderService.getCouponDetail(props.couponId).then(res => {
                         const data = res;
                         const discount = data.discounts[0];
                         const conditions = discount.conditions;
 
                         if(data.timeCopy){
                             setStTimeCopy(data.timeCopy)
                         }
 
                         // check edit expired coupon or wrong store
                         if (discount.status === DiscountStatusEnum.EXPIRED) {
                             RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST);
                             GSToast.commonError();
                         }
 
                         if (data.storeId != CredentialUtils.getStoreId()) {
                             RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST);
                             GSToast.commonError();
                         }
 
 
                         const conditionCustomerSegment = conditions.filter(co => co.conditionType === "CUSTOMER_SEGMENT")[0];
                         const conditionAppliesTo = conditions.filter(co => co.conditionType === "APPLIES_TO")[0];
                         const conditionMinReq = conditions.filter(co => co.conditionType === "MINIMUM_REQUIREMENTS")[0];
                         const conditionPlatform = conditions.filter(co => co.conditionType === "PLATFORMS")[0];
                         const conditionAppliesToBranch = conditions.filter(co => co.conditionType === "APPLIES_TO_BRANCH")[0];
 
                         if (conditionCustomerSegment.conditionOption === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT) {
                             let segments = [];
                             conditionCustomerSegment.values.forEach(value => {
                                 segments.push({
                                     id: Number(value.conditionValue),
                                     userCount: Number(value.conditionMetadata.segmentNumCustomers)
                                 });
                             });
                             setStSpecificSegmentUsers(segments.length > 0 ? segments.map(x => x.userCount).reduce((a, b) => a + b) : 0);
                             setStSpecificSegments(segments);
                         }
 
                         if (conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS) {
                             let collections = [];
                             conditionAppliesTo.values.forEach(value => {
                                 collections.push({
                                     id: Number(value.conditionValue)
                                 });
                             });
                             setstSpecificCollections(collections);
 
                         } else if (conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS) {
                             let products = [];
                             conditionAppliesTo.values.forEach(value => {
                                 products.push({
                                     id: Number(value.conditionValue)
                                 });
                             });
                             setstSpecificProducts(products);
                         }
 
                         if (conditionAppliesToBranch.conditionOption === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH) {
                             setStSpecificBranches(conditionAppliesToBranch.values.map(branch => {
                                 return {
                                     id:parseInt(branch.conditionValue),
                                     name:""
                                 }
                             }));
                         }
                         const startYear = moment(discount.activeDate).year()
                         const endYear = moment(discount.expiredDate).year()
                         const compare = endYear - startYear
                         if(compare === 1000) setIsSettingNoExpiredDate(true)
 
                         setStModel({
                             ...stModel,
                             [FormName.ID]: data.id,
                             [FormName.TYPE]: props.type,
                             [FormName.NAME]: data.name,
                             [FormName.COUPON_CODE]: discount.couponCode,
                             [FormName.COUPON_DATE_RANGE]:
                                 moment(discount.activeDate).format(DATE_RANGE_LOCATE_CONFIG.format)
                                 + ' - '
                                 + moment(discount.expiredDate).format(DATE_RANGE_LOCATE_CONFIG.format),
                             [FormName.COUPON_DATE_RANGE_START]: moment(discount.activeDate),
                             [FormName.COUPON_DATE_RANGE_END]: moment(discount.expiredDate),
                             [FormName.COUPON_LIMIT_TO_ONE]: discount.couponLimitToOne,
                             [FormName.COUPON_LIMITED_USAGE]: discount.couponLimitedUsage,
                             [FormName.COUPON_LIMITED_USAGE_VALUE]: discount.couponLimitedUsage ? discount.couponTotal : 1,
                             [FormName.COUPON_TYPE]: discount.couponType,
                             [FormName.COUPON_PERCENTAGE_VALUE]: discount.couponType === CouponTypeEnum.PERCENTAGE ? discount.couponValue : 0,
                             [FormName.COUPON_FIXED_AMOUNT_VALUE]: discount.couponType === CouponTypeEnum.FIXED_AMOUNT ? discount.couponValue : 0,
                             [FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE]: discount.couponType === CouponTypeEnum.FREE_SHIPPING && !_.isEmpty(discount.couponValue) ? discount.couponValue : null,
                             [FormName.COUPON_FEE_SHIPPING_TYPE]: discount.feeShippingType ? discount.feeShippingType : FeeShippingTypeEnum.FIXED_AMOUNT,
                             [FormName.COUPON_USED]: discount.couponUsed,
                             [FormName.CONDITION_CUSTOMER_SEGMENT]: conditionCustomerSegment.conditionOption,
                             [FormName.CONDITION_APPLIES_TO]: conditionAppliesTo.conditionOption,
                             [FormName.CONDITION_MIN_REQ]: conditionMinReq.conditionOption,
                             [FormName.CONDITION_MIN_REQ_VALUE]:
                                 (conditionMinReq.conditionOption === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT
                                     || conditionMinReq.conditionOption === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS)
                                     ?
                                     conditionMinReq.values[0].conditionValue
                                     :
                                     0,
                             [FormName.CONDITION_PLATFORM]: selectDefaultPlatformValue(conditionPlatform.conditionOption),
                             [FormName.COUPON_ENABLED_REWARDS]: discount.enabledRewards,
                             [FormName.COUPON_REWARDS_DESCRIPTION]: discount.rewardsDescription,
                             [FormName.CONDITION_APPLIES_TO_BRANCH]: conditionAppliesToBranch.conditionOption
                         });
 
                         if (discount.couponType === CouponTypeEnum.FREE_SHIPPING) {
 
                             if (result.length > 0) {
                                 stShippingProviders.map(x => {
                                     const exist = result.filter(p => p.providerName === x.name)[0];
                                     x.disabled = !exist;
                                     return x;
                                 });
                             } else {
                                 // if has one shipping provider -> enable all exclude self-delivery
                                 let defaultEnable = TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0292, PACKAGE_FEATURE_CODES.FEATURE_0275, PACKAGE_FEATURE_CODES.FEATURE_0277]);
                                 stShippingProviders.map(x => {
                                     if (x.name !== Constants.LogisticCode.Common.SELF_DELIVERY) {
                                         x.disabled = !defaultEnable;
                                     } else {
                                         x.disabled = true;
                                     }
                                     return x;
                                 });
                             }
                             let shippingProviders = discount.freeShippingProviders.split(",");
                             stShippingProviders.map(x => {
                                 if (!x.disabled && shippingProviders.includes(x.name)) {
                                     x.isChecked = true;
                                 }
                                 return x;
                             });
                             setStShippingProviders(stShippingProviders);
 
                         }
                         setStIsLoading(false);
                     }).catch(e => {
                         GSToast.commonError();
                     });
                 }).catch(() => {
                     GSToast.commonError();
                 });
         } else {
             storeService.getDeliveryProvider()
                 .then(result => {
                     result = result.filter(p => p.providerName !== Constants.LogisticCode.Common.SELF_DELIVERY || (
                         p.providerName === Constants.LogisticCode.Common.SELF_DELIVERY && p.enabled
                     ) )
 
                     if (result.length > 0) {
                         stShippingProviders.map(x => {
                             const exist = result.filter(p => p.providerName === x.name)[0];
                             x.disabled = !exist;
                             return x;
                         });
                     } else {
                         // if has one shipping provider -> enable all exclude self-delivery
                         let defaultEnable = TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0292, PACKAGE_FEATURE_CODES.FEATURE_0275, PACKAGE_FEATURE_CODES.FEATURE_0277]);
                         stShippingProviders.map(x => {
                             if (x.name !== Constants.LogisticCode.Common.SELF_DELIVERY) {
                                 x.disabled = !defaultEnable;
                             } else {
                                 x.disabled = true;
                             }
                             return x;
                         });
                         setStShippingProviders(stShippingProviders);
                     }
                     setStIsLoading(false);
                 }).catch(() => {
                     GSToast.commonError();
                 });
         }
     }, []);
 
     useEffect(() => {
         const userId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_USER_ID);
         const ownerId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_OWNER_ID);
         setIsNotOwnerId(userId !== ownerId);
     }, [stIsNotOwnerId]);
 
     useEffect(() => {
         if (stIsNotOwnerId) {
             storeService.getFullStoreBranches()
                 .then(result => {
                     const branches = result.data.map(branch => ({ id: branch.id, name: branch.name }));
                     setStStaffAllBranches(branches);
                 })
                 .catch(() => {
                     GSToast.commonError();
                 });
         }
     }, [stIsNotOwnerId]);
 
     useLayoutEffect(() => {
 
         setTimeout(() => {
             const container = document.getElementsByClassName('layout-body');
             container[0].scrollTop = 1000;
             setTimeout(() => {
                 container[0].scrollTop = 0;
             }, 10);
         }, 10);
 
     }, []);
     useEffect(() => {


     }, [stShippingProviders]);
 
     const typeSwitch = (prefix, productText, serviceText) => {
         const discountType = props.type
         switch (discountType) {
             case DISCOUNT_TYPES.PROMOTION_SERVICE:
                 return i18next.t((prefix ? prefix + '.' : '') + serviceText);
             case DISCOUNT_TYPES.PROMOTION_PRODUCT:
                 return i18next.t((prefix ? prefix + '.' : '') + productText);
             default:
                 return '';
         }
     };
 
 
     const onRadioSelect = (e, name) => {
         e.persist();
         const value = e.currentTarget.value;
         onFormChange({
             currentTarget: {
                 name: name,
                 value: value
             }
         });
 
         if (name === FormName.CONDITION_CUSTOMER_SEGMENT) {
             if (value === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS) {
                 setStIsShowSegmentError(false);
             }
         }
 
         if (name === FormName.CONDITION_APPLIES_TO) {
             if (value === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ALL_PRODUCTS) {
                 setStIsShowCollectionError(false);
                 setStIsShowProductError(false);
             }
         }
         if (name === FormName.CONDITION_APPLIES_TO_BRANCH) {
             if (value === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_ALL_BRANCHES) {
                 // reset error
                 setStIsShowBranchError(false);
 
                 if(stIsNotOwnerId){
                     // switch to specific branches for staff
                     setStSpecificBranches(stStaffAllBranches);
                 }
 
                 
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
             if(value === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS){
                 setStCheckMinReq(1)
                 setStModel({
                     ...stModel,
                     [frmName]: value,
                     [FormName.CONDITION_MIN_REQ_VALUE]: '1'
                 });
             }else if (value === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT) {
                 setStCheckMinReq(0)
                 setStModel({
                     ...stModel,
                     [frmName]: value,
                     [FormName.CONDITION_MIN_REQ_VALUE]: stCheckMinInput
                 });
             }else{
                 setStModel({
                     ...stModel,
                     [frmName]: value,
 
                 });
             }
         }
     };
 
     const onEditorChange = (value) => {
         setStModel({
             ...stModel,
             [FormName.COUPON_REWARDS_DESCRIPTION]: value
         });
     };
 
     const onPlatformChange = (e) => {
         const { checked, value, name } = e.currentTarget;
         // console.log(checked, value)
         const checkedList = _.clone(stModel[name]);
         // console.log('org', checkedList)
         if (checked) {
             // checkedList.push(value)
         } else {
             const index = checkedList.findIndex(p => p === value);
             checkedList.splice(index, 1);
         }
         if (checkedList.length === 0) {
             setStIsShowPlatformError(true);
         } else {
             setStIsShowPlatformError(false);
         }
         setStModel({
             ...stModel,
             [name]: checkedList
         });
     };
 
     const Divider = () => {
         return (
             <Row>
                 <Col sm={12} lg={12} md={12} xl={12} xs={12}>
                     <hr />
                 </Col>
             </Row>
         );
     };
 
     const LeftCol = (props) => {
         return (
             <Col sm={12} xs={12} md={12} xl={4} lg={4} className={style.leftCol}>
                 {props.children}
             </Col>
         );
     };
 
     const RightCol = (props) => {
         return (
             <Col sm={12} xs={12} md={12} xl={8} lg={8}>
                 {props.children}
             </Col>
         );
     };
 
     const selectRangeDate = (event, picker) => {
         let startDate = picker.startDate
         let timeClone = picker.startDate.clone()
         if(isSettingNoExpiredDate){
             // let noExpiredDate = moment().set({'year': startDate.year() + 1000, 'month': startDate.month(), 'date': startDate.date()});
             timeClone.year(startDate.year() + 1000)
         }
         setStModel({
             ...stModel,
             [FormName.COUPON_DATE_RANGE_START]: picker.startDate,
             [FormName.COUPON_DATE_RANGE_END]: isSettingNoExpiredDate?timeClone:picker.endDate
         });
     };
 
     const toggleProductModal = () => {
         setStIsShowProductModal(!stIsShowProductModal);
     };
 
     const toggleCollectionModal = () => {
         setStIsShowCollectionModal(!stIsShowCollectionModal);
     };
 
     const toggleCustomerSegmentModal = () => {
         setStIsShowCustomerSegmentModal(!stIsShowCustomerSegmentModal);
     };
 
     const onCloseSpecificProductSelector = (productIds) => {
         if (productIds) {
             setstSpecificProducts(productIds);
             if (productIds.length > 0) {
                 setStIsShowProductError(false);
             }
         }
         setStIsShowProductModal(false);
     };
 
     const onCloseSpecificCollectionSelector = (collectionIds) => {
         if (collectionIds) {
             setstSpecificCollections(collectionIds);
             if (collectionIds.length > 0) {
                 setStIsShowCollectionError(false);
             }
         }
         setStIsShowCollectionModal(false);
     };
 
     const onCloseSpecificSegment = (segmentIds) => {
         if (segmentIds) {
             setStSpecificSegmentUsers(segmentIds.length > 0 ? segmentIds.map(x => x.userCount).reduce((a, b) => a + b) : 0);
             setStSpecificSegments(segmentIds);
             if (segmentIds.length > 0) {
                 setStIsShowSegmentError(false);
             }
         }
         setStIsShowCustomerSegmentModal(false);
     };
 
     const onCloseAddBranchModal = (selectedBranches, mode) => {
         if (mode === BUTTON_TYPE_SELECT) {
             setStSpecificBranches(selectedBranches);
 
             if(selectedBranches && selectedBranches.length > 0){
                 setStIsShowBranchError(false);
             }
         }
         setStIsShowAddBranchModal(false);
     }
 
     const isSubFormValid = () => {
 
         let hasError = false;
 
         const percent = stModel[FormName.COUPON_PERCENTAGE_VALUE];
         const fixedAmount = stModel[FormName.COUPON_FIXED_AMOUNT_VALUE];
         const limit = stModel[FormName.COUPON_LIMITED_USAGE_VALUE];
         const minReq = stModel[FormName.CONDITION_MIN_REQ_VALUE];
 
 
         if (stModel[FormName.COUPON_TYPE] === CouponTypeEnum.PERCENTAGE && (!percent || percent < 1 || percent > 100)) hasError = true;
         if (stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FIXED_AMOUNT && (!fixedAmount || fixedAmount < stCheckMinInput || fixedAmount > 1_000_000_000)) hasError = true;
         if (stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FREE_SHIPPING) {
             let selectedShippingProviders = stShippingProviders.filter(x => x.isChecked);
             if (selectedShippingProviders.length <= 0) {
                 hasError = true;
                 setStIsShowShippingProviderError(true);
             }
         }
         if (stModel[FormName.COUPON_LIMITED_USAGE] === true && (limit < 1 || limit > 1_000_000_000)) hasError = true;
         if (stModel[FormName.CONDITION_MIN_REQ] === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT) {
             if (isNaN(minReq) || minReq < stCheckMinReq || minReq > 1_000_000_000) hasError = true;
         } else {
             if (stModel[FormName.CONDITION_MIN_REQ] === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS) {
                 if (isNaN(minReq) || minReq < 1 || minReq > VALIDATE_INPUT.MAX_QUANTITY) hasError = true;
             }
         }
 
         if (stModel[FormName.CONDITION_CUSTOMER_SEGMENT] === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT
             && stSpecificSegments.length <= 0) {
             setStIsShowSegmentError(true);
             hasError = true;
         }
 
         if (stModel[FormName.COUPON_TYPE] !== CouponTypeEnum.FREE_SHIPPING) {
             if (stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS
                 && stSpecificCollections.length <= 0) {
                 setStIsShowCollectionError(true);
                 setStIsShowProductError(false);
 
                 hasError = true;
             }
 
             if (stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS
                 && stSpecificProducts.length <= 0) {
                 setStIsShowProductError(true);
                 setStIsShowCollectionError(false);
 
                 hasError = true;
             }
         }
 
         if (stModel[FormName.CONDITION_PLATFORM].length === 0) {
             setStIsShowPlatformError(true);
             hasError = true;
         }
 
         // validate branch -> only check if product
         if(props.type === DISCOUNT_TYPES.PROMOTION_PRODUCT){
             if (stModel[FormName.CONDITION_APPLIES_TO_BRANCH] === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH
                 && stSpecificBranches.length <= 0) {
                 setStIsShowBranchError(true);
                 hasError = true;
             } 
         }
         
 
 
         return !hasError;
     };
 
     const getGenCode = (e) => {
         e.preventDefault();
         BCOrderService.getGenCode().then(res => {
             setStModel({
                 ...stModel,
                 [FormName.COUPON_CODE]: res.code
             });
         }).catch(e => {
             GSToast.commonError();
         });
     };
 
     const mappingPlatformEnum = () => {
         // APP WEB INSTORE
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.WEB) &&
             stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.APP) &&
             stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.IN_STORE)
         ) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_WEB_INSTORE;
         }
 
         // APP WEB
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.WEB) &&
             stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.APP)) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_WEB;
         }
 
         // APP INSTORE
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.IN_STORE) &&
             stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.APP)) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_INSTORE;
         }
 
         // WEB INSTORE
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.IN_STORE) &&
             stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.WEB)) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_WEB_INSTORE;
         }
 
         // WEB
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.WEB)) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_WEB_ONLY;
         }
 
         // APP
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.APP)) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_ONLY;
         }
 
         // IN STORE
         if (stModel[FormName.CONDITION_PLATFORM].includes(DiscountConditionOptionEnum.PLATFORMS.IN_STORE)) {
             return DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_INSTORE_ONLY;
         }
     };
 
     const submitForm = (e, values) => {
         
         if (!isSubFormValid()) return false;
 
         setIsProcessing(true);
 
         // check data for customer_segment
         let lstConditionValueOfSegment = [];
         if (stModel[FormName.CONDITION_CUSTOMER_SEGMENT] === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT) {
             stSpecificSegments.forEach(segment => {
                 lstConditionValueOfSegment.push({
                     conditionValue: segment.id
                 });
             });
         }
 
         // check data for branch apply
         let branchesSelected = [];
         if (stModel[FormName.CONDITION_APPLIES_TO_BRANCH] === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH) {
             stSpecificBranches.forEach(branch => {
                 branchesSelected.push({ conditionValue: branch.id });
             });
         }
         else if (stModel[FormName.CONDITION_APPLIES_TO_BRANCH] === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_ALL_BRANCHES &&
             stIsNotOwnerId) {
             stStaffAllBranches.forEach(branch => {
                 branchesSelected.push({ conditionValue: branch.id });
             });
         }
 
         //-----------------------------//
         // check data for apply_to
         //-----------------------------//
         let lstConditionValueOfApply = [];
 
         if (stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FREE_SHIPPING) {
             stModel[FormName.CONDITION_APPLIES_TO] = DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER;
         } else {
             if (stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS) {
                 stSpecificCollections.forEach(collection => {
                     lstConditionValueOfApply.push({
                         conditionValue: collection.id
                     });
                 });
             } else if (stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS) {
                 stSpecificProducts.forEach(product => {
                     lstConditionValueOfApply.push({
                         conditionValue: product.id
                     });
                 });
             }
         }
 
         let shippingProviders = stShippingProviders.filter(x => x.isChecked).map(x => x.name).join(",");
         if (shippingProviders.indexOf(Constants.LogisticCode.Common.AHAMOVE) > -1) {
             shippingProviders += "," + Constants.LogisticCode.Common.AHAMOVE_TRUCK;
         }
 
         //-----------------------------//
         // data for request
         //-----------------------------//
         let endDate = stModel[FormName.COUPON_DATE_RANGE_END]
         if(isSettingNoExpiredDate){
                let startDate = _.cloneDeep(stModel[FormName.COUPON_DATE_RANGE_START])
                if(!startDate) {
                    setIsProcessing(false);
                    return
                }
                endDate = startDate.year(startDate.year() + 1000)
         }
         let discount = {
             activeDate: stModel[FormName.COUPON_DATE_RANGE_START],
             conditions: [
                 {
                     conditionOption: stModel[FormName.CONDITION_CUSTOMER_SEGMENT],
                     conditionType: "CUSTOMER_SEGMENT",
                     values: lstConditionValueOfSegment
                 },
                 {
                     conditionOption: stModel[FormName.CONDITION_APPLIES_TO],
                     conditionType: "APPLIES_TO",
                     values: lstConditionValueOfApply
                 },
                 {
                     conditionOption: stModel[FormName.CONDITION_MIN_REQ],
                     conditionType: "MINIMUM_REQUIREMENTS",
                     values: [{
                         conditionValue: stModel[FormName.CONDITION_MIN_REQ_VALUE]
                     }]
                 },
                 {
                     conditionOption: mappingPlatformEnum(),
                     conditionType: "PLATFORMS",
                     values: []
                 },
                 {
                     conditionOption: stModel[FormName.CONDITION_APPLIES_TO_BRANCH],
                     conditionType: "APPLIES_TO_BRANCH",
                     values: branchesSelected
                 }
             ],
             couponCode: stModel[FormName.COUPON_CODE],
             couponLimitToOne: stModel[FormName.COUPON_LIMIT_TO_ONE],
             couponLimitedUsage: stModel[FormName.COUPON_LIMITED_USAGE],
             couponTotal: stModel[FormName.COUPON_LIMITED_USAGE] ? stModel[FormName.COUPON_LIMITED_USAGE_VALUE] : null,
             couponType: stModel[FormName.COUPON_TYPE],
             couponValue:
                 stModel[FormName.COUPON_TYPE] === CouponTypeEnum.PERCENTAGE
                     ? stModel[FormName.COUPON_PERCENTAGE_VALUE] + ''
                     : stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FIXED_AMOUNT
                         ? stModel[FormName.COUPON_FIXED_AMOUNT_VALUE] + ''
                         : stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE] != null ? stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE] + '' : '',
             expiredDate: endDate,
             storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
             type: props.type,
             freeShippingProviders: shippingProviders,
             feeShippingType: stModel[FormName.COUPON_FEE_SHIPPING_TYPE],
             enabledRewards: stModel[FormName.COUPON_ENABLED_REWARDS],
             rewardsDescription: stModel[FormName.COUPON_REWARDS_DESCRIPTION]
         };
         let request = {
             description: "",
             discounts: [discount],
             name: stModel[FormName.NAME],
             storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
             timeCopy:stTimeCopy
             //useCap: 0
         };
 
         let pro;
         if (props.mode === DiscountEditorMode.CREATE) {
             pro = BCOrderService.createCoupon(request);
         } else {
             request.id = stModel[FormName.ID];
             pro = BCOrderService.updateCoupon(request);
         }
         pro.then(res => {
             // success here
             setIsProcessing(false);
 
             // redirect page
             setIsRedirect(true);
 
             RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST);
 
         }).catch(e => {
             setIsProcessing(false);
 
             if (e.response.status === 400) {
                 if (e.response.data.description === "duplicatedCouponCode") {
                     GSToast.error(i18next.t('page.marketing.discounts.coupons.form.error.duplicated_couponcode'));
                 } else {
                     GSToast.commonError();
                 }
             } else {
                 GSToast.commonError();
             }
 
         });
     };
 
     const onChangeShippingProvider = (providerName, e) => {
         stShippingProviders.map(x => {
             if (x.name === providerName) {
                 x.isChecked = e.target.checked;
             }
             return x;
         });
         let filter = stShippingProviders.filter(x => x.isChecked);
         setStIsShowShippingProviderError(filter.length <= 0);
         setStShippingProviders(stShippingProviders);
     };
 
     const enabledNoExpiredDate = (e) =>{
         const {value} = e.currentTarget
         if(value){
             setIsSettingNoExpiredDate(true)
         }else{
             setIsSettingNoExpiredDate(false)
         }
     }
 
     return (
         <GSContentContainer confirmWhenRedirect confirmWhen={!isRedirect} isLoading={stIsLoading}
             isSaving={isProcessing}>
             {/*{isProcessing && <LoadingScreen />}*/}
             <GSContentHeader title={
                 i18next.t("page.marketing.discounts.coupons.create.createCouponCode", {
                     types: typeSwitch('page.discount.create.coupon.types', 'productCapAll', 'serviceCapAll')
                 })
             }>
                 {
                     props.type===DISCOUNT_TYPES.PROMOTION_PRODUCT && <HintPopupVideo title={'general info creating promo \ free ship \ conditions'}
                                                                                   category={'PROMOTION_PRODUCT'}/>
 
 
                 }
                 {
                     props.type===DISCOUNT_TYPES.PROMOTION_SERVICE &&<HintPopupVideo title={"general info creating promo \\ conditions"}
                     category={'PROMOTION_SERVICE'}/>
                 }
 
                 <GSContentHeaderRightEl className={style.headerButtonGroup}>
                     <GSButton
                         secondary
                         outline
                         onClick={() => {
                             RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST);
                         }}
                     >
                         <GSTrans t={"page.marketing.discounts.coupons.create.cancel"} />
                     </GSButton>
                     <GSButton
                         success
                         marginLeft
                         onClick={() => refSaveBtn.current.click()}>
                         <GSTrans t={"page.marketing.discounts.coupons.create.save"} />
                     </GSButton>
                 </GSContentHeaderRightEl>
             </GSContentHeader>
             <GSContentBody size={GSContentBody.size.LARGE}>
                 <AvForm onValidSubmit={submitForm} autoComplete="off">
                     <button type="submit" ref={refSaveBtn} hidden />
                     <GSWidget>
                         <GSWidgetHeader
                             title={i18next.t("page.marketing.discounts.coupons.create.generalInformation")}>
                         </GSWidgetHeader>
                         <GSWidgetContent className={style.generalInfo}>
                             {/*NAME_CODE_TIME_TO_RUN*/}
                             <Row>
                                 <Col sm={12} lg={12} md={12} xl={12} xs={12}>
                                     <AvField
                                         label={i18next.t("page.marketing.discounts.coupons.create.name")}
                                         name={FormName.NAME}
                                         value={stModel[FormName.NAME]}
                                         onBlur={onFormChange}
                                         validate={{
                                             ...FormValidate.required(),
                                             ...FormValidate.maxLength(255),
                                             ...FormValidate.minLength(1)
                                         }}
                                     />
 
                                 </Col>
                             </Row>
                             <Row>
                                 <Col sm={12} lg={12} md={12} xl={12} xs={12} style={{ display: 'flex' }}>
                                     <AvCustomCheckbox
                                         name={FormName.COUPON_ENABLED_REWARDS}
                                         color="blue"
                                         label={i18next.t("page.marketing.discounts.coupons.create.enabledRewards")}
                                         value={stModel[FormName.COUPON_ENABLED_REWARDS]}
                                         onChange={onFormChange}
                                     />
                                     <GSTooltip message={i18next.t('page.marketing.discounts.coupons.create.rewardsHint')} />
                                     <HintPopupVideo title={'Promotion \\ rewards'} category={'REWARD_SECTION'}/>
                                 </Col>
                             </Row>
                             {stModel[FormName.COUPON_ENABLED_REWARDS] === true &&
                                 <Row>
                                     <Col sm={12} lg={12} md={12} xl={12} xs={12}>
                                         <div class="form-group">
                                             <Label>
                                                 <Trans
                                                     i18nKey="page.marketing.discounts.coupons.create.rewardsDescription">Description</Trans>
                                             </Label>
                                             <GSEditor
                                                 name={FormName.COUPON_REWARDS_DESCRIPTION}
                                                 isRequired={stModel[FormName.COUPON_ENABLED_REWARDS] === true}
                                                 minLength={1}
                                                 maxLength={100000}
                                                 value={stModel[FormName.COUPON_REWARDS_DESCRIPTION]}
                                                 tabIndex={2}
                                                 onChange={onEditorChange}
                                             />
                                         </div>
                                     </Col>
                                 </Row>
                             }
                             <Row>
                                 <Col xs={12} xl={6} md={12} lg={6} sm={12}>
                                     <div className={style.frmCouponCode}>
                                         <span className={style.buttonGenCode}>
                                             <GSFakeLink
                                                 onClick={e => getGenCode(e)}
                                             >
                                                 <GSTrans t={"page.marketing.discounts.coupons.create.genCode"} />
                                             </GSFakeLink>
                                         </span>
                                         <AvField
                                             label={i18next.t("page.marketing.discounts.coupons.create.couponCode")}
                                             name={FormName.COUPON_CODE}
                                             value={stModel[FormName.COUPON_CODE]}
                                             validate={{
                                                 ...FormValidate.required(),
                                                 ...FormValidate.maxLength(20),
                                                 ...FormValidate.minLength(3),
                                                 ...FormValidate.pattern.letterOrNumber()
                                             }}
                                             onBlur={onFormChange}
                                         />
                                     </div>
                                 </Col>
                                 <Col xs={12} xl={6} md={12} lg={6} sm={12}>
                                     <div className="expired-date d-flex justify-content-between align-items-center">
                                         <div className="text-uppercase font-weight-bold text-muted">
                                             <GSTrans t={"page.marketing.discounts.coupons.create.activeDate"} />
                                         </div>
                                         <div>
                                             <AvCustomCheckbox
                                                 key="1"
                                                 name='enabledNoExpiredDate'
                                                 onChange={(e) => enabledNoExpiredDate(e)}
                                                 label={i18next.t('component.coupon.edit.no.expired.date')}
                                                 value={isSettingNoExpiredDate}
                                             />
                                         </div>
                                     </div>
                                     {isSettingNoExpiredDate?(
                                         <div className="setting-unlimited-date">
                                             <DateRangePicker
                                                 minimumNights={0}
                                                 minDate={moment().format(DATE_RANGE_LOCATE_CONFIG.format)}
                                                 locale={DATE_RANGE_LOCATE_CONFIG}
                                                 containerClass={style.frmDatePicker}
                                                 onApply={selectRangeDate}
                                                 startDate={stModel[FormName.COUPON_DATE_RANGE_START] ? stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format) : moment()}
                                                 endDate={stModel[FormName.COUPON_DATE_RANGE_START] ? stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format) : moment()}
                                                 singleDatePicker={isSettingNoExpiredDate}
                                             >
                                                 <AvField
                                                     name={FormName.COUPON_DATE_RANGE}
                                                     // label={i18next.t("page.marketing.discounts.coupons.create.activeDate")}
                                                     label=""
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         async: (value, ctx, input, cb) => {
                                                             // console.log(value);
                                                             if (value === '') cb(true);
                                                             let [startDate, endDate] = value.split(' - ');
                                                             const [sdDD, sdMM, sdYY] = startDate.split('-');
                                                             if(isSettingNoExpiredDate) endDate = startDate
                                                             const [edDD, edMM, edYY] = endDate.split('-');
                                                             const startDateObj = new Date(sdYY, sdMM, sdDD);
                                                             const endDateObj = new Date(edYY, edMM, edDD);
                                                             if(isSettingNoExpiredDate) endDateObj.setFullYear(parseInt(edYY) + 1000);
                                                             cb(endDateObj >= startDateObj);
                                                         }
                                                     }}
                                                     onChange={e => {
                                                         const value = e.currentTarget.value;
                                                         const [startDate, endDate] = value.split(' - ');
                                                         const [sdDD, sdMM, sdYY] = startDate.split('-');
                                                         const [edDD, edMM, edYY] = endDate.split('-');
                                                         const startDateObj = new Date(sdYY, sdMM, sdDD);
                                                         const endDateObj = new Date(edYY, edMM, edDD);
                                                         if (startDateObj - endDateObj === 0) {
                                                             endDateObj.setHours(endDateObj.getHours() + 24);
                                                         }
                                                         if(isSettingNoExpiredDate) endDateObj.setFullYear(parseInt(edYY) + 1000);
 
                                                         setStModel({
                                                             ...stModel,
                                                             [FormName.COUPON_DATE_RANGE_START]: moment(startDate, DATE_RANGE_LOCATE_CONFIG.format),
                                                             [FormName.COUPON_DATE_RANGE_END]: moment(endDateObj)
                                                         });
                                                     }}
                                                     value={
                                                         (isSettingNoExpiredDate?(
                                                             stModel[FormName.COUPON_DATE_RANGE_START] && stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format)?stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format):''
                                                         ):
                                                             (stModel[FormName.COUPON_DATE_RANGE_START] && stModel[FormName.COUPON_DATE_RANGE_END])
                                                             ?
                                                             stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format) + ' - ' + stModel[FormName.COUPON_DATE_RANGE_END].format(DATE_RANGE_LOCATE_CONFIG.format)
                                                             :''
                                                         )
                                                         
                                                             
                                                     }
                                                     onKeyPress={e => e.preventDefault()}
                                                 />
                                                 <span className={style.calendarIcon}>
                                                     <FontAwesomeIcon icon={['far', 'calendar-alt']} />
                                                 </span>
                                             </DateRangePicker>
                                         </div>
                                     ):(
                                         <DateRangePicker
                                             minimumNights={0}
                                             minDate={moment().format(DATE_RANGE_LOCATE_CONFIG.format)}
                                             locale={DATE_RANGE_LOCATE_CONFIG}
                                             containerClass={style.frmDatePicker}
                                             onApply={selectRangeDate}
                                             startDate={stModel[FormName.COUPON_DATE_RANGE_START] ? stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format) : moment()}
                                             endDate={stModel[FormName.COUPON_DATE_RANGE_END] ? stModel[FormName.COUPON_DATE_RANGE_END].format(DATE_RANGE_LOCATE_CONFIG.format) : moment().add(7, 'days')}
                                         >
                                             <AvField
                                                 name={FormName.COUPON_DATE_RANGE}
                                                 label=""
                                                 //label={i18next.t("page.marketing.discounts.coupons.create.activeDate")}
                                                 validate={{
                                                     ...FormValidate.required(),
                                                     async: (value, ctx, input, cb) => {
                                                         // console.log(value);
                                                         if (value === '') cb(true);
                                                         const date = value.split(' - ');

                                                         if (date.length < 2) {
                                                             return cb(false)
                                                         }

                                                         const [startDate, endDate] = date

                                                         const [sdDD, sdMM, sdYY] = startDate.split('-');
                                                         const [edDD, edMM, edYY] = endDate.split('-');
                                                         const startDateObj = new Date(sdYY, sdMM, sdDD);
                                                         const endDateObj = new Date(edYY, edMM, edDD);
                                                         cb(endDateObj >= startDateObj);
                                                     }
                                                 }}
                                                 onChange={e => {
                                                     const value = e.currentTarget.value;

                                                     const date = value.split(' - ');

                                                     if (date.length < 2) {
                                                         return
                                                     }

                                                     const [startDate, endDate] = date
                                                     const [sdDD, sdMM, sdYY] = startDate.split('-');
                                                     const [edDD, edMM, edYY] = endDate.split('-');
                                                     const startDateObj = new Date(sdYY, sdMM, sdDD);
                                                     const endDateObj = new Date(edYY, edMM, edDD);
                                                     if (startDateObj - endDateObj === 0) {
                                                         endDateObj.setHours(endDateObj.getHours() + 24);
                                                     }
 
                                                     setStModel({
                                                         ...stModel,
                                                         [FormName.COUPON_DATE_RANGE_START]: moment(startDate, DATE_RANGE_LOCATE_CONFIG.format),
                                                         [FormName.COUPON_DATE_RANGE_END]: moment(endDateObj)
                                                     });
                                                 }}
                                                 value={
                                                     (isSettingNoExpiredDate?(
                                                         stModel[FormName.COUPON_DATE_RANGE_START] && stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format)?stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format):''
                                                     ):
                                                         (stModel[FormName.COUPON_DATE_RANGE_START] && stModel[FormName.COUPON_DATE_RANGE_END])
                                                         ?
                                                         stModel[FormName.COUPON_DATE_RANGE_START].format(DATE_RANGE_LOCATE_CONFIG.format) + ' - ' + stModel[FormName.COUPON_DATE_RANGE_END].format(DATE_RANGE_LOCATE_CONFIG.format)
                                                         :''
                                                     )
                                                 }
                                                 onKeyPress={e => e.preventDefault()}
                                             />
                                             <span className={style.calendarIcon}>
                                                 <FontAwesomeIcon icon={['far', 'calendar-alt']} />
                                             </span>
                                         </DateRangePicker>
                                     )}
                                 </Col>
                             </Row>
                             <Divider />
                             {/*COUPON_TYPE*/}
                             <Row>
                                 <LeftCol>
                                     <label className="gs-frm-input__label">
                                         <GSTrans t={"page.marketing.discounts.coupons.create.typeOfDiscount"} />
                                     </label>
                                 </LeftCol>
                                 <RightCol>
                                     <AvRadioGroup
                                         name={FormName.COUPON_TYPE}
                                         className={["gs-frm-radio"].join(' ')}
                                         defaultValue={stModel[FormName.COUPON_TYPE]}
                                     >
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.percentage")}
                                             value={CouponTypeEnum.PERCENTAGE}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.COUPON_TYPE)
                                             }
                                         />
                                         {stModel[FormName.COUPON_TYPE] === CouponTypeEnum.PERCENTAGE &&
                                             <div className={style.frmOptionValue}>
                                                 {/*<AvForm>*/}
                                                 <AvFieldCurrency
                                                     className={style.frmOptionValueInput}
                                                     name={FormName.COUPON_PERCENTAGE_VALUE}
                                                     unit={NumericSymbol.PERCENTAGE}
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         ...FormValidate.minValue(VALIDATE_INPUT.MIN, true),
                                                         ...FormValidate.maxValue(100, true)
                                                     }}
                                                     onChange={onFormChange}
                                                     value={stModel[FormName.COUPON_PERCENTAGE_VALUE]}
                                                 />
 
 
                                                 {
                                                     stModel[FormName.COUPON_PERCENTAGE_VALUE] < 1 &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.minValue(1, false).min.errorMessage} />
 
                                                 }
                                                 {
                                                     stModel[FormName.COUPON_PERCENTAGE_VALUE] > 100 &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.maxValue(100, true).max.errorMessage} />
 
                                                 }
                                                 {/*</AvForm>*/}
                                             </div>
                                         }
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.fixedAmount")}
                                             value={CouponTypeEnum.FIXED_AMOUNT}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.COUPON_TYPE)
                                             }
                                         />
                                         {stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FIXED_AMOUNT &&
                                             <div className={style.frmOptionValue}>
                                                 {/*<AvForm>*/}
                                                 <AvFieldCurrency
                                                     className={style.frmOptionValueInput}
                                                     name={FormName.COUPON_FIXED_AMOUNT_VALUE}
                                                     unit={currency}
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         ...FormValidate.minValue(stCheckMinInput, true),
                                                         ...FormValidate.maxValue(1_000_000_000, true)
                                                     }}
                                                     onChange={onFormChange}
                                                     value={stModel[FormName.COUPON_FIXED_AMOUNT_VALUE]}
                                                     position={CurrencyUtils.isPosition(currency)}
                                                     precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                                     decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                                 />
                                                 {/*</AvForm>*/}
 
                                                 {
                                                     (stModel[FormName.COUPON_FIXED_AMOUNT_VALUE] < stCheckMinInput || isNaN(stModel[FormName.COUPON_FIXED_AMOUNT_VALUE])) &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.minValue(stCheckMinInput, false,).min.errorMessage} />
 
                                                 }
                                                 {
                                                     stModel[FormName.COUPON_FIXED_AMOUNT_VALUE] > 1_000_000_000 &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.maxValue(1_000_000_000, true).max.errorMessage} />
 
                                                 }
                                             </div>
                                         }
                                         {props.type === DISCOUNT_TYPES.PROMOTION_PRODUCT &&
                                             <>
                                                 <AvRadio customInput
                                                     className={style.customRadio}
                                                     label={i18next.t("page.marketing.discounts.coupons.create.freeShipping")}
                                                     value={CouponTypeEnum.FREE_SHIPPING}
                                                     onClick={
                                                         (e) => onRadioSelect(e, FormName.COUPON_TYPE)
                                                     }
                                                 />
                                                 {stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FREE_SHIPPING &&
                                                     <>
                                                         {
                                                             stShippingProviders.map(x => {
                                                                 if(CurrencyUtils.getLocalStorageCountry() !== Constants.CURRENCY.VND.COUNTRY
                                                                     && x.name != Constants.LogisticCode.Common.SELF_DELIVERY){
                                                                     return
                                                                 }
                                                                 return <FreeShippingProvider key={x.name} name={x.name}
                                                                     disabled={x.disabled}
                                                                     isChecked={x.isChecked}
                                                                     onChangeShippingProvider={onChangeShippingProvider} />;
                                                             })
                                                         }
                                                         {stIsShowShippingProviderError &&
                                                             <AlertInline
                                                                 text={i18next.t('page.discount.create.coupon.validate.shippingProviderAtLeast1')}
                                                                 textAlign={"left"}
                                                                 nonIcon
                                                                 type={AlertInlineType.ERROR}
                                                                 padding={false}
                                                             />}
                                                         <div>
                                                             <div className={style.shippingMaxAmount}>
                                                                 <label className="gs-frm-input__label">
                                                                     <GSTrans
                                                                         t={"page.marketing.discounts.coupons.create.feeShippingAmount"} />
                                                                 </label>
                                                                 {/*<AvForm>*/}
                                                                 <AvFieldCurrency
                                                                     className={style.valueInput}
                                                                     name={FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE}
                                                                     unit={currency}
                                                                     validate={{
                                                                         ...FormValidate.minValue(stCheckMinInput, true),
                                                                         ...FormValidate.maxValue(1_000_000_000, true)
                                                                     }}
                                                                     onChange={onFormChange}
                                                                     value={stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE]}
                                                                     position={CurrencyUtils.isPosition(currency)}
                                                                     precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                                                     decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                                                 />
                                                                 {/*</AvForm>*/}
                                                             </div>
 
                                                             {
                                                                 (!_.isEmpty(stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE]) && stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE] < stCheckMinInput) &&
                                                                 <AlertInline type={AlertInlineType.ERROR}
                                                                     className={style.inputValidate}
                                                                     nonIcon
                                                                     text={FormValidate.minValue(stCheckMinInput, false).min.errorMessage} />
 
                                                             }
                                                             {
                                                                 (!_.isEmpty(stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE]) && stModel[FormName.COUPON_FEE_SHIPPING_AMOUNT_VALUE] > 1_000_000_000) &&
                                                                 <AlertInline type={AlertInlineType.ERROR}
                                                                     className={style.inputValidate}
                                                                     nonIcon
                                                                     text={FormValidate.maxValue(1_000_000_000, true).max.errorMessage} />
 
                                                             }
                                                         </div>
                                                     </>
                                                 }
                                             </>
                                         }
                                     </AvRadioGroup>
                                 </RightCol>
                             </Row>
                             <Divider />
                             {/*USAGE_LIMITS*/}
                             <Row>
                                 <LeftCol>
                                     <label className="gs-frm-input__label">
                                         <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits"} />
                                     </label>
                                 </LeftCol>
                                 <RightCol>
 
                                     <AvCustomCheckbox
                                         name={FormName.COUPON_LIMITED_USAGE}
                                         color="blue"
                                         label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.numberOfTime")}
                                         value={stModel[FormName.COUPON_LIMITED_USAGE]}
                                         onChange={onFormChange}
                                     />
 
                                     {stModel[FormName.COUPON_LIMITED_USAGE] &&
                                         <div className={style.frmOptionValue}>
                                             <AvForm>
                                                 <AvFieldCurrency
                                                     className={style.frmOptionValueInput}
                                                     name={FormName.COUPON_LIMITED_USAGE_VALUE}
                                                     onChange={onFormChange}
                                                     value={stModel[FormName.COUPON_LIMITED_USAGE_VALUE]}
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         ...FormValidate.minValue(0, true),
                                                         ...FormValidate.maxValue(1_000_000_000, true)
                                                     }}
                                                 />
                                             </AvForm>
                                             {
                                                 stModel[FormName.COUPON_LIMITED_USAGE_VALUE] < 1 &&
                                                 <AlertInline type={AlertInlineType.ERROR}
                                                     className={style.frmOptionValueInputValidate}
                                                     nonIcon
                                                     text={FormValidate.minValue(1, true).min.errorMessage} />
 
                                             }
                                             {
                                                 stModel[FormName.COUPON_LIMITED_USAGE_VALUE] > 1_000_000_000 &&
                                                 <AlertInline type={AlertInlineType.ERROR}
                                                     className={style.frmOptionValueInputValidate}
                                                     nonIcon
                                                     text={FormValidate.maxValue(1_000_000_000, true).max.errorMessage} />
 
                                             }
                                         </div>
                                     }
 
                                     <AvCustomCheckbox
                                         name={FormName.COUPON_LIMIT_TO_ONE}
                                         color="blue"
                                         label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.usePerCustomer")}
                                         value={stModel[FormName.COUPON_LIMIT_TO_ONE]}
                                         onChange={onFormChange}
                                     />
 
                                 </RightCol>
                             </Row>
                         </GSWidgetContent>
                     </GSWidget>
 
                     <GSWidget>
                         <GSWidgetHeader
                             title={i18next.t("page.marketing.discounts.coupons.create.usageLimits.couponConditions")} />
                         <GSWidgetContent>
                             {/*CUSTOMER_SEGMENT*/}
                             <Row>
                                 <LeftCol>
                                     <label className="gs-frm-input__label">
                                         <GSTrans
                                             t={'page.marketing.discounts.coupons.create.usageLimits.customerSegment'} />
                                     </label>
                                     {stIsShowSegmentError &&
                                         <AlertInline
                                             text={i18next.t('page.discount.create.coupon.validate.segmentAtLeast1')}
                                             textAlign={"left"}
                                             nonIcon
                                             type={AlertInlineType.ERROR}
                                             padding={false}
                                         />}
                                 </LeftCol>
                                 <RightCol>
                                     <AvRadioGroup
                                         name={FormName.CONDITION_CUSTOMER_SEGMENT}
                                         className={["gs-frm-radio"].join(' ')}
                                         validate={{
                                             ...FormValidate.required()
                                         }}
                                         defaultValue={stModel[FormName.CONDITION_CUSTOMER_SEGMENT]}>
 
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.allCustomer")}
                                             value={DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_CUSTOMER_SEGMENT)
                                             } />
 
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.specificSegment")}
                                             value={DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_CUSTOMER_SEGMENT)
                                             } />
                                         {stModel[FormName.CONDITION_CUSTOMER_SEGMENT]
                                             === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT &&
                                             <div className={style.frmOptionValue}>
                                                 <div className={style.linkSelector}>
                                                     <GSFakeLink onClick={toggleCustomerSegmentModal}>
                                                         <GSTrans
                                                             t={"page.marketing.discounts.coupons.create.usageLimits.addSegment"} />
                                                     </GSFakeLink>
                                                 &nbsp;
                                                 <span className={style.totalItem}>
                                                         <GSTrans
                                                             t={"page.marketing.discounts.coupons.create.usageLimits.selectedSegment"}
                                                             values={{
                                                                 x: stSpecificSegments.length,
                                                                 y: stSpecificSegmentUsers
                                                             }} />
                                                     </span>
                                                 </div>
                                             </div>
                                         }
                                     </AvRadioGroup>
                                 </RightCol>
                             </Row>
                             <Divider />
                             {/*APPLIES_TO*/}
 
                             {stModel[FormName.COUPON_TYPE] !== CouponTypeEnum.FREE_SHIPPING &&
                                 <>
                                     <Row>
                                         <LeftCol>
                                             <label className="gs-frm-input__label">
                                                 <GSTrans
                                                     t={'page.marketing.discounts.coupons.create.usageLimits.appliesTo'} />
                                             </label>
 
                                             {stIsShowCollectionError &&
                                                 <AlertInline
                                                     text={i18next.t('page.discount.create.coupon.validate.collectionAtLeast1')}
                                                     textAlign={"left"}
                                                     nonIcon
                                                     type={AlertInlineType.ERROR}
                                                     padding={false}
                                                 />}
                                             {stIsShowProductError &&
                                                 <AlertInline
                                                     text={i18next.t('page.discount.create.coupon.validate.productAtLeast1',
                                                         { types: typeSwitch('page.discount.create.coupon.types', 'product', 'service') })
                                                     }
                                                     textAlign={"left"}
                                                     nonIcon
                                                     type={AlertInlineType.ERROR}
                                                     padding={false}
                                                 />}
                                         </LeftCol>
 
                                         <RightCol>
 
                                             <AvRadioGroup
                                                 name={FormName.CONDITION_APPLIES_TO}
                                                 className={["gs-frm-radio"].join(' ')}
                                                 validate={{
                                                     ...FormValidate.required()
                                                 }}
                                                 defaultValue={stModel[FormName.CONDITION_APPLIES_TO]}
                                             // onChange={onFormChange}
                                             >
 
                                                 <AvRadio customInput
                                                     className={style.customRadio}
                                                     label={typeSwitch('', "page.marketing.discounts.coupons.create.usageLimits.entireOrder", 'page.marketing.discounts.coupons.create.usageLimits.entireReservation')}
                                                     value={DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER}
                                                     onClick={
                                                         (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO)
                                                     }
                                                 />
 
                                                 <PrivateComponent
                                                     hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0127]}
                                                     disabledStyle={"hidden"}
                                                 >
                                                     <AvRadio customInput
                                                         className={style.customRadio}
                                                         label={
                                                             <GSTrans
                                                                 t={"page.marketing.discounts.coupons.create.usageLimits.specificCollections"}
                                                                 values={{
                                                                     types: typeSwitch('page.discount.create.coupon.types', 'product', 'service')
                                                                 }}
                                                             />
                                                         }
                                                         value={DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS}
                                                         onClick={
                                                             (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO)
                                                         }
                                                     />
                                                 </PrivateComponent>
 
 
                                                 {stModel[FormName.CONDITION_APPLIES_TO]
                                                     === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS &&
                                                     <div className={style.frmOptionValue}>
                                                         <div className={style.linkSelector}>
                                                             <GSFakeLink onClick={toggleCollectionModal}>
                                                                 <GSTrans
                                                                     t={"page.marketing.discounts.coupons.create.usageLimits.addCollections"} />
                                                             </GSFakeLink>
                                                     &nbsp;
                                                     <span className={style.totalItem}>
                                                                 <GSTrans
                                                                     t={"page.marketing.discounts.coupons.create.usageLimits.selectedCollection"}
                                                                     values={{ x: stSpecificCollections.length }} />
                                                             </span>
                                                         </div>
                                                     </div>
                                                 }
 
 
                                                 <AvRadio customInput
                                                     className={style.customRadio}
                                                     label={
                                                         <GSTrans
                                                             t="page.marketing.discounts.coupons.create.usageLimits.specificProducts"
                                                             values={{
                                                                 types: typeSwitch('page.discount.create.coupon.types', 'productCap', 'serviceCap')
                                                             }}
                                                         />
                                                     }
                                                     value={DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS}
                                                     onClick={
                                                         (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO)
                                                     }
                                                 />
 
                                                 {stModel[FormName.CONDITION_APPLIES_TO]
                                                     === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS &&
                                                     <div className={style.frmOptionValue}>
                                                         <div className={style.linkSelector}>
 
                                                             <GSFakeLink onClick={toggleProductModal}>
                                                                 <GSTrans
                                                                     t={"page.marketing.discounts.coupons.create.usageLimits.addProducts"}
                                                                     values={{
                                                                         types: typeSwitch('page.discount.create.coupon.types', 'products', 'services')
                                                                     }}
                                                                 />
                                                             </GSFakeLink>
                                                     &nbsp;
                                                     <span>
                                                                 <GSTrans
                                                                     t={"page.marketing.discounts.coupons.create.usageLimits.selectedProduct"}
                                                                     values={{
                                                                         x: stSpecificProducts.length,
                                                                         types: typeSwitch('page.discount.create.coupon.types', 'products', 'services')
                                                                     }} />
                                                             </span>
                                                         </div>
                                                     </div>
                                                 }
 
                                             </AvRadioGroup>
                                         </RightCol>
                                     </Row>
                                     <Divider />
                                 </>
                             }
                             {/*MINIMUM REQUIREMENTS*/}
                             <Row>
                                 <LeftCol>
                                     <label className="gs-frm-input__label">
                                         <GSTrans
                                             t={'page.marketing.discounts.coupons.create.usageLimits.minimumRequirements'} />
                                     </label>
                                 </LeftCol>
                                 <RightCol>
 
                                     <AvRadioGroup
                                         name={FormName.CONDITION_MIN_REQ}
                                         className={["gs-frm-radio"].join(' ')}
                                         validate={{
                                             ...FormValidate.required()
                                         }}
                                         defaultValue={stModel[FormName.CONDITION_MIN_REQ]}
                                     >
                                         {/*NONE*/}
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.none")}
                                             value={DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_NONE}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_MIN_REQ)
                                             }
                                         />
                                         {/*MINIMUM PURCHASE AMOUNT*/}
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={
                                                 <GSTrans
                                                     t={`page.marketing.discounts.coupons.create.usageLimits.minimumPurchaseAmount${stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER ? '.all' : ''
                                                         }`}
                                                     values={{
                                                         types: typeSwitch('page.discount.create.coupon.types', 'products', 'services')
                                                     }}
                                                 />
                                             }
                                             value={DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_MIN_REQ)
                                             }
                                         />
                                         {stModel[FormName.CONDITION_MIN_REQ]
                                             === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT
                                             &&
                                             <div className={style.frmOptionValue}>
                                                 {/*<AvForm>*/}
                                                 <AvFieldCurrency
                                                     className={style.frmOptionValueInput}
                                                     name={FormName.CONDITION_MIN_REQ_VALUE}
                                                     onChange={onFormChange}
                                                     value={stModel[FormName.CONDITION_MIN_REQ_VALUE]}
                                                     unit={currency}
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         ...FormValidate.minValue(stCheckMinReq, true),
                                                         ...FormValidate.maxValue(1_000_000_000, true)
                                                     }}
                                                     position={CurrencyUtils.isPosition(currency)}
                                                     precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                                     decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                                     
                                                 />
                                                 {/*</AvForm>*/}
                                                 {console.log('stModel[FormName.CONDITION_MIN_REQ_VALUE]:', stModel[FormName.CONDITION_MIN_REQ_VALUE], 'stCheckMinReq:', stCheckMinReq)}
 
                                                 {
                                                     (stModel[FormName.CONDITION_MIN_REQ_VALUE] < stCheckMinReq || stModel[FormName.CONDITION_MIN_REQ_VALUE] === '' || isNaN(stModel[FormName.CONDITION_MIN_REQ_VALUE])) &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.minValue(stCheckMinReq, false).min.errorMessage} />
 
                                                 }
                                                 {
                                                     stModel[FormName.CONDITION_MIN_REQ_VALUE] > 1_000_000_000 &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.maxValue(1_000_000_000, true).max.errorMessage} />
 
                                                 }
 
                                             </div>
                                         }
                                         {/*MINIMUM QUANTITY*/}
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={
                                                 <>
                                                     {stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER ? (
                                                         typeSwitch('page.marketing.discounts.coupons.create.usageLimits.minimumQuantityOfItems.all', 'product', 'service')
                                                     ) : (
                                                             <GSTrans
                                                                 t={`page.marketing.discounts.coupons.create.usageLimits.minimumQuantityOfItems`}
                                                                 values={{
                                                                     types: typeSwitch('page.discount.create.coupon.types', 'products', 'services')
                                                                 }}
                                                             />
                                                         )
 
                                                     }
 
                                                 </>
                                             }
                                             value={DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_MIN_REQ)
                                             }
                                         />
                                         {stModel[FormName.CONDITION_MIN_REQ]
                                             === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS
                                             &&
                                             <div className={style.frmOptionValue}>
                                                 {/*<AvForm>*/}
                                                 <AvFieldCurrency
                                                     className={style.frmOptionValueInput}
                                                     name={FormName.CONDITION_MIN_REQ_VALUE}
                                                     onChange={onFormChange}
                                                     value={stModel[FormName.CONDITION_MIN_REQ_VALUE]}
                                                     validate={{
                                                         ...FormValidate.required(),
                                                         ...FormValidate.minValue(1, true),
                                                         ...FormValidate.maxValue(VALIDATE_INPUT.MAX_QUANTITY, true)
                                                     }}
                                                 />
                                                 {/*</AvForm>*/}
 
                                                 {
                                                     (stModel[FormName.CONDITION_MIN_REQ_VALUE] < 1 || stModel[FormName.CONDITION_MIN_REQ_VALUE] === '') &&
                                                     <AlertInline type={AlertInlineType.ERROR}
                                                         className={style.frmOptionValueInputValidate}
                                                         nonIcon
                                                         text={FormValidate.minValue(1, false).min.errorMessage} />
 
                                                 }
                                                 {
                                                    stModel[FormName.CONDITION_MIN_REQ_VALUE] > VALIDATE_INPUT.MAX_QUANTITY &&
                                                    <AlertInline type={AlertInlineType.ERROR}
                                                        className={style.frmOptionValueInputValidate}
                                                        nonIcon
                                                        text={FormValidate.maxValue(VALIDATE_INPUT.MAX_QUANTITY, true).max.errorMessage} />
 
                                                 }
                                             </div>
                                         }
                                     </AvRadioGroup>
                                 </RightCol>
                             </Row>
                             {props.type === DISCOUNT_TYPES.PROMOTION_PRODUCT &&
                             <Divider />
                             }
 
                             {/* Applicable branch */}
                             {props.type === DISCOUNT_TYPES.PROMOTION_PRODUCT &&
                             <Row>
                                 <LeftCol>
                                     <label className="gs-frm-input__label">
                                         <GSTrans t={'page.marketing.discounts.coupons.create.applicableBranch'} />
                                     </label>
                                     {stIsShowBranchError &&
                                                 <AlertInline
                                                     text={i18next.t('page.discount.create.coupon.validate.branchAtLeast1',
                                                         { types: typeSwitch('page.discount.create.coupon.types', 'product', 'service') })
                                                     }
                                                     textAlign={"left"}
                                                     nonIcon
                                                     type={AlertInlineType.ERROR}
                                                     padding={false}
                                                 />}
                                 </LeftCol>
                                 <RightCol>
                                     <AvRadioGroup
                                         name={FormName.CONDITION_APPLIES_TO_BRANCH}
                                         className={["gs-frm-radio"].join(' ')}
                                         defaultValue={stModel[FormName.CONDITION_APPLIES_TO_BRANCH]}
                                         validate={{
                                             ...FormValidate.required()
                                         }}
                                     >
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.applicableBranch.all")}
                                             value={DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_ALL_BRANCHES}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO_BRANCH)
                                             }
                                         />
 
                                         <AvRadio customInput
                                             className={style.customRadio}
                                             label={i18next.t("page.marketing.discounts.coupons.create.applicableBranch.specific")}
                                             value={DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH}
                                             onClick={
                                                 (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO_BRANCH)
                                             }
                                         />
                                         {stModel[FormName.CONDITION_APPLIES_TO_BRANCH] === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH &&
                                             <div className={style.frmOptionValue}>
                                                 <div className={style.linkSelector}>
                                                     <GSFakeLink onClick={_ => setStIsShowAddBranchModal(true)}>
                                                         <GSTrans t={"page.marketing.discounts.coupons.create.applicableBranch.select"} />
                                                     </GSFakeLink>
                                                 &nbsp;
                                                 <span className={style.totalItem}>
                                                         <GSTrans t={"page.marketing.discounts.coupons.create.applicableBranch.selected"}
                                                             values={{ x: stSpecificBranches.length }} />
                                                     </span>
                                                 </div>
                                             </div>
                                         }
                                     </AvRadioGroup>
                                 </RightCol>
                             </Row>
                             }
                             <Divider />
                             {/*PLATFORM*/}
                             <Row>
                                 <LeftCol>
                                     <label className="gs-frm-input__label">
                                         <GSTrans t={'page.marketing.discounts.coupons.create.usageLimits.platforms'} />
                                     </label>
                                     {stIsShowPlatformError &&
                                         <AlertInline
                                             text={i18next.t('page.discount.create.coupon.validate.platformAtLeast1')}
                                             textAlign={"left"}
                                             nonIcon
                                             type={AlertInlineType.ERROR}
                                             padding={false}
                                         />}
                                 </LeftCol>
                                 <RightCol>
 
                                     <AvCheckboxGroup
                                         name={FormName.CONDITION_PLATFORM}
                                         defaultValue={stModel[FormName.CONDITION_PLATFORM]}
                                     >
 
                                         {/*WEB*/}
                                         <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0121]}
                                             wrapperDisplay={"block"}
                                         >
                                             <AvCheckbox customInput
                                                 className={style.customRadio}
                                                 label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.webOnly")}
                                                 value={DiscountConditionOptionEnum.PLATFORMS.WEB}
                                                 onChange={onPlatformChange}
                                             />
 
                                         </PrivateComponent>
 
                                         {/*APP*/}
                                         <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0122]}
                                             wrapperDisplay={"block"}
                                         >
                                             <AvCheckbox customInput
                                                 className={style.customRadio}
                                                 label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.appOnly")}
                                                 value={DiscountConditionOptionEnum.PLATFORMS.APP}
                                                 onChange={onPlatformChange}
                                             />
 
                                         </PrivateComponent>
 
                                         {/*IN STORE*/}
                                         <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0123]}
                                             wrapperDisplay={"block"}
 
                                         >
                                             <AvCheckbox customInput
                                                 className={cn(style.customRadio, { 'gs-atm--disable': props.type === DISCOUNT_TYPES.PROMOTION_SERVICE })}
                                                 label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.instoreOnly")}
                                                 value={DiscountConditionOptionEnum.PLATFORMS.IN_STORE}
                                                 onChange={onPlatformChange}
                                             />
                                         </PrivateComponent>
                                     </AvCheckboxGroup>
 
                                 </RightCol>
                             </Row>
                         </GSWidgetContent>
                     </GSWidget>
                 </AvForm>
             </GSContentBody>
 
             {stIsShowProductModal &&
                 <ProductNoVariationModal
                     productSelectedList={stSpecificProducts}
                     onClose={onCloseSpecificProductSelector}
                     type={props.type === DISCOUNT_TYPES.PROMOTION_PRODUCT ? Constants.ITEM_TYPE.BUSINESS_PRODUCT : Constants.ITEM_TYPE.SERVICE}
                     includeConversion={true}
                 />
             }
             {stIsShowCollectionModal &&
                 <CollectionModal
                     collectionSelectedList={stSpecificCollections}
                     onClose={onCloseSpecificCollectionSelector}
                     itemType={props.type === DISCOUNT_TYPES.PROMOTION_PRODUCT ? Constants.ITEM_TYPE.BUSINESS_PRODUCT : Constants.ITEM_TYPE.SERVICE}
                 />
             }
             {stIsShowCustomerSegmentModal &&
                 <CustomerSegmentModal
                     selectedItems={stSpecificSegments}
                     onClose={onCloseSpecificSegment}
                 />
             }
 
             {stIsShowAddBranchModal &&
                 <PromotionAddBranchModal
                     selectedItems={stSpecificBranches}
                     onClose={onCloseAddBranchModal} />
             }
 
         </GSContentContainer>
     );
 };
 
 CouponEditor.propTypes = {
     children: PropTypes.any,
     couponId: PropTypes.any,
     mode: PropTypes.any,
     type: PropTypes.string,
     currency: PropTypes.string
 };
 
 export default CouponEditor
 
 const FreeShippingProvider = props => {
     const onChangeShippingProvider = (e) => {
         if (props.onChangeShippingProvider) {
             props.onChangeShippingProvider(props.name, e);
         }
     };
 
     return (
         <AvCustomCheckbox
             value={props.isChecked}
             key={props.name}
             disabled={props.disabled}
             customInput
             label={i18next.t("page.marketing.discounts.coupons.create." + props.name)}
             onChange={(e) => onChangeShippingProvider(e)}
             name={props.name}
             classWrapper={style.shippingProviderCheckbox}
         />
     );
 };
 
 FreeShippingProvider.propTypes = {
     disabled: PropTypes.bool,
     isChecked: PropTypes.bool,
     name: PropTypes.string,
     onChangeShippingProvider: PropTypes.func
 };
 