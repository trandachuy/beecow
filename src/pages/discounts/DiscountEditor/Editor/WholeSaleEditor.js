/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 09/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import style from './WholeSaleEditor.module.sass'
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
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation'
import Constants from "../../../../config/Constant";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import {CouponTypeEnum} from "../../../../models/CouponTypeEnum";
import {FormValidate} from "../../../../config/form-validate";
import AvFieldCurrency from "../../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import {NumericSymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import {DiscountConditionOptionEnum} from "../../../../models/DiscountConditionOptionEnum";
import CollectionModal from "../../../../components/shared/CollectionModal/CollectionModal";
import {BCOrderService} from "../../../../services/BCOrderService";
import {GSToast} from '../../../../utils/gs-toast';
import storageService from "../../../../services/storage";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import moment from 'moment';
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import {DiscountStatusEnum} from "../../../../models/DiscountStatusEnum";
import {CredentialUtils} from "../../../../utils/credential";
import CustomerSegmentModal from "../../../../components/shared/CustomerSegmentModal/CustomerSegmentModal";
import {DISCOUNT_TYPES, DiscountEditorMode} from "./DiscountEditor";
import PrivateComponent from "../../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../../config/package-features";
import PropTypes from 'prop-types'
import PromotionAddBranchModal, {BUTTON_TYPE_SELECT} from '../../../../components/shared/PromotionAddBranchModal/PromotionAddBranchModal';
import storeService from '../../../../services/StoreService';
import ProductNoVariationModal, { editorMode } from "../../../products/CollectionSelectProductModal/ProductNoVariationModal";
import HintPopupVideo from "../../../../components/shared/HintPopupVideo/HintPopupVideo";
import AvCustomCheckbox from "../../../../components/shared/AvCustomCheckbox/AvCustomCheckbox";
import {CurrencyUtils} from "../../../../utils/number-format";

const DATE_RANGE_LOCATE_CONFIG = {
    format: "DD-MM-YYYY",
    formatYMD: "YYYY-MM-DD",
    applyLabel: i18next.t("component.order.date.range.apply"),
    cancelLabel: i18next.t("component.order.date.range.cancel")
}

const FormName = {
    ID: 'id',
    NAME: 'name',
    COUPON_DATE_RANGE: 'couponDateRange',
    COUPON_DATE_RANGE_START: 'couponDateRangeStart',
    COUPON_DATE_RANGE_END: 'couponDateRangeEnd',
    COUPON_TYPE: 'couponType',
    COUPON_PERCENTAGE_VALUE: 'couponPercentageValue',
    COUPON_USED: 'couponUsed',
    COUPON_FIXED_AMOUNT_VALUE: 'couponFixedAmountValue',
    TYPE: 'type',
    COUPON_LIMIT_CONFIG: 'couponLimitConfig',
    CONDITION_CUSTOMER_SEGMENT: 'conditionCustomerSegment',
    CONDITION_CUSTOMER_SEGMENT_VALUE: 'conditionCustomerSegmentValue',
    CONDITION_APPLIES_TO: 'conditionAppliesTo',
    CONDITION_APPLIES_TO_VALUE: 'conditionAppliesToValue',
    CONDITION_MIN_REQ_VALUE: 'conditionMinReqValue',
    CONDITION_APPLIES_TO_BRANCH: 'conditionAppliesToBranch',
}

const VALIDATE_INPUT = {
    MIN: 1,
    MIN_NON_VND: 0.01,
    MIN_REQ_NON_VND: 0,
    MAX_QUANTITY: 1000000
}

const WholeSaleEditor = props => {
    const {currency, ...others} = props
    const refSaveBtn = useRef(null);

    const [stIsShowProductModal, setStIsShowProductModal] = useState(false);
    const [stIsShowCollectionModal, setStIsShowCollectionModal] = useState(false);
    const [stIsShowCustomerSegmentModal, setStIsShowCustomerSegmentModal] = useState(false);
    const [stIsShowAddBranchModal, setStIsShowAddBranchModal] = useState(false);

    const [stSpecificProducts, setStSpecificProducts] = useState([]);
    const [stSpecificServices, setStSpecificServices] = useState([]);
    const [stSpecificCollections, setStSpecificCollections] = useState([]);
    const [stSpecificSegments, setStSpecificSegments] = useState([]);
    const [stSpecificSegmentUsers, setStSpecificSegmentUsers] = useState(0);

    const [stSpecificBranches, setStSpecificBranches] = useState([]);
    const [stStaffAllBranches, setStStaffAllBranches] = useState([]);
    const [stIsNotOwnerId, setIsNotOwnerId] = useState(null);

    const [stSpecificProductsEmpty, setStSpecificProductsEmpty] = useState(false);
    const [stSpecificCollectionsEmpty, setStSpecificCollectionsEmpty] = useState(false);
    const [stSpecificSegmentsEmpty, setStSpecificSegmentsEmpty] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirect, setIsRedirect] = useState(false);
    const [stIsLoading, setStIsLoading] = useState(true);

    const [stIsShowSegmentError, setStIsShowSegmentError] = useState(false);
    const [stIsShowCollectionError, setStIsShowCollectionError] = useState(false);
    const [stIsShowProductError, setStIsShowProductError] = useState(false);
    const [stIsShowBranchError, setStIsShowBranchError] = useState(false);
    const [isSettingNoExpiredDate, setIsSettingNoExpiredDate] = useState(false);
    const [stTimeCopy, setStTimeCopy] = useState(0);

    const [stModel, setStModel] = useState({
        [FormName.ID]: 0,
        [FormName.TYPE]: props.type,
        [FormName.NAME]: '',
        [FormName.COUPON_DATE_RANGE]: '',
        [FormName.COUPON_DATE_RANGE_START]: null,
        [FormName.COUPON_DATE_RANGE_END]: null,
        [FormName.COUPON_TYPE]: CouponTypeEnum.PERCENTAGE,
        [FormName.COUPON_PERCENTAGE_VALUE]: 1,
        [FormName.COUPON_FIXED_AMOUNT_VALUE]: currency !== Constants.CURRENCY.VND.SYMBOL? VALIDATE_INPUT.MIN_NON_VND : VALIDATE_INPUT.MIN,
        [FormName.COUPON_USED]: 0,
        [FormName.CONDITION_CUSTOMER_SEGMENT]: DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS,
        [FormName.CONDITION_APPLIES_TO]:
                                    props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT
                                    ? DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ALL_PRODUCTS
                                    : DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ALL_SERVICES,
        [FormName.CONDITION_MIN_REQ_VALUE]: VALIDATE_INPUT.MIN,
        [FormName.CONDITION_APPLIES_TO_BRANCH]: DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_ALL_BRANCHES
    });
    const [stCheckMinInput, setStCheckMinInput] = useState(VALIDATE_INPUT.MIN);

    useEffect(() => {

        if(props.mode === DiscountEditorMode.EDIT){
            // get detail when edit
            BCOrderService.getCouponDetail(props.couponId).then(res =>{
                const data = res
                const discount = data.discounts[0]
                const conditions = discount.conditions
                const branchIdsApply = discount.branchIdApply
                
                if(data.timeCopy){
                    setStTimeCopy(data.timeCopy)
                }

                // check edit expired coupon or wrong store
                if (discount.status === DiscountStatusEnum.EXPIRED) {
                    RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST)
                    GSToast.commonError()
                }

                if (data.storeId != CredentialUtils.getStoreId()) {
                    RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST)
                    GSToast.commonError()
                }


                const conditionCustomerSegment = conditions.filter(co => co.conditionType === "CUSTOMER_SEGMENT")[0];
                const conditionAppliesTo = conditions.filter(co => co.conditionType === "APPLIES_TO")[0]
                const conditionMinReq = conditions.filter(co => co.conditionType === "MINIMUM_REQUIREMENTS")[0] // only minimu items
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

                if(conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS){
                    let collections = [];
                    conditionAppliesTo.values.forEach(value =>{
                        collections.push({
                            id: Number(value.conditionValue)
                        })
                    })
                    setStSpecificCollections(collections)

                }else if(conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS){
                    let products = [];
                    conditionAppliesTo.values.forEach(value =>{
                        products.push({
                            id: Number(value.conditionValue)
                        })
                    })
                    setStSpecificProducts(products)

                }else if(conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_SERVICES){
                    let services = [];
                    conditionAppliesTo.values.forEach(value =>{
                        services.push({
                            id: Number(value.conditionValue)
                        })
                    })
                    setStSpecificServices(services)
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
                    [FormName.TYPE]: DISCOUNT_TYPES.WHOLESALE,
                    [FormName.NAME]: data.name,
                    [FormName.COUPON_DATE_RANGE]:
                        moment(discount.activeDate).format(DATE_RANGE_LOCATE_CONFIG.format)
                        + ' - '
                        + moment(discount.expiredDate).format(DATE_RANGE_LOCATE_CONFIG.format),
                    [FormName.COUPON_DATE_RANGE_START]: moment(discount.activeDate),
                    [FormName.COUPON_DATE_RANGE_END]: moment(discount.expiredDate),
                    [FormName.COUPON_TYPE]: discount.couponType,
                    [FormName.COUPON_PERCENTAGE_VALUE]: discount.couponType === CouponTypeEnum.PERCENTAGE ? discount.couponValue : 0,
                    [FormName.COUPON_FIXED_AMOUNT_VALUE]: discount.couponType === CouponTypeEnum.FIXED_AMOUNT ? discount.couponValue : 0,
                    [FormName.COUPON_USED]: discount.couponUsed,
                    [FormName.CONDITION_CUSTOMER_SEGMENT]: conditionCustomerSegment.conditionOption,
                    [FormName.CONDITION_APPLIES_TO]: conditionAppliesTo.conditionOption,
                    [FormName.CONDITION_MIN_REQ_VALUE]: conditionMinReq.values[0].conditionValue,
                    [FormName.CONDITION_APPLIES_TO_BRANCH]: conditionAppliesToBranch.conditionOption
                })

                setStIsLoading(false)
            }).catch(e =>{
                GSToast.commonError()
            })
        } else {
            setStIsLoading(false)
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

    useLayoutEffect( () => {

        setTimeout(() => {
            const container = document.getElementsByClassName('layout-body');
            container[0].scrollTop = 1000
            setTimeout(() => {
                container[0].scrollTop = 0
            }, 10)
        }, 10)

    }, [])

    useEffect(() => {
        if(currency !== Constants.CURRENCY.VND.SYMBOL){
            setStCheckMinInput(VALIDATE_INPUT.MIN_NON_VND)
        }
    }, []);

    const onRadioSelect = (e, name) => {
        e.persist()
        const value = e.currentTarget.value
        onFormChange({
            currentTarget: {
                name: name,
                value: value
            }
        })

        if (name === FormName.CONDITION_CUSTOMER_SEGMENT) {
            if (value === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS) {
                setStIsShowSegmentError(false)
            }
        }

        if (name === FormName.CONDITION_APPLIES_TO) {
            if (value === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ALL_PRODUCTS) {
                setStIsShowCollectionError(false)
                setStIsShowProductError(false)
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
    }


    const typeSwitch = (prefix, productText, serviceText) => {
        const discountType = props.type
        switch (discountType) {
            case DISCOUNT_TYPES.WHOLESALE_SERVICE:
                return i18next.t(prefix + '.' + serviceText)
            case DISCOUNT_TYPES.WHOLESALE_PRODUCT:
                return i18next.t(prefix + '.' + productText)
            default:
                return ''
        }
    }

    const onFormChange = (e) => {
        let value, frmName
        // primitive dom
        if (e.currentTarget) {
            // if (e.persist) e.persist()

            value = e.currentTarget.value
            frmName = e.currentTarget.name
        } else {
            // if (e.persist) e.persist()

            value = e.target.value
            frmName = e.target.name
        }
        if (value !== undefined && frmName !== undefined) {
            setStModel({
                ...stModel,
                [frmName]: value
            })
        }
    }

    const Divider = () => {
        return (
            <Row>
                <Col sm={12} lg={12} md={12} xl={12} xs={12}>
                    <hr/>
                </Col>
            </Row>
        )
    }

    const LeftCol = (props) => {
        return (
            <Col sm={12} xs={12} md={12} xl={4} lg={4} className={style.leftCol}>
                {props.children}
            </Col>
        )
    }

    const RightCol = (props) => {
        return (
            <Col sm={12} xs={12} md={12} xl={8} lg={8}>
                {props.children}
            </Col>
        )
    }

    const selectRangeDate = (event, picker) =>{
        let startDate = picker.startDate
        let timeClone = picker.startDate.clone()
        
        if(isSettingNoExpiredDate){
            // let noExpiredDate = moment().set({'year': startDate.year() + 1000, 'month': startDate.month(), 'date': startDate.date()});
            timeClone.year(startDate.year() + 1000)
        }
        setStModel({
            ...stModel,
            [FormName.COUPON_DATE_RANGE_START] : picker.startDate,
            [FormName.COUPON_DATE_RANGE_END] : isSettingNoExpiredDate?timeClone:picker.endDate
        })
    }

    const toggleProductModal = () => {
        setStIsShowProductModal(!stIsShowProductModal)
    }

    const toggleCollectionModal = () => {
        setStIsShowCollectionModal(!stIsShowCollectionModal)
    }

    const toggleCustomerSegmentModal = () => {
        setStIsShowCustomerSegmentModal(!stIsShowCustomerSegmentModal);
    }

    const onCloseSpecificItemSelector = (itemIds) => {
        if (itemIds) {

            if(props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT){
                setStSpecificProducts(itemIds)
            }if(props.type === DISCOUNT_TYPES.WHOLESALE_SERVICE){
                setStSpecificServices(itemIds)
            }


            setStSpecificProductsEmpty(false)
            if (itemIds.length > 0) {
                setStIsShowProductError(false)
            }
        }

        if(!itemIds || itemIds.length === 0){
            if(!itemIds){
                if((props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT && stSpecificProducts.length > 0) || 
                    (props.type === DISCOUNT_TYPES.WHOLESALE_SERVICE && stSpecificServices.length > 0)){
                    setStSpecificProductsEmpty(false)
                }else {
                    setStSpecificProductsEmpty(true)
                }
            }else {
                setStSpecificProductsEmpty(true)
            }
        }

        setStIsShowProductModal(false)
    }

    const onCloseSpecificCollectionSelector = (collectionIds) => {
        if (collectionIds) {
            setStSpecificCollections(collectionIds)
            setStSpecificCollectionsEmpty(false)
            if (collectionIds.length > 0) {
                setStIsShowCollectionError(false)
            }
        }

        if(!collectionIds || collectionIds.length === 0){
            setStSpecificCollectionsEmpty(true)
        }

        setStIsShowCollectionModal(false)
    };

    const onCloseSpecificSegment = (segmentIds) => {
        if (segmentIds) {
            setStSpecificSegmentUsers(segmentIds.length > 0 ? segmentIds.map(x => x.userCount).reduce((a, b) => a + b) : 0);
            setStSpecificSegments(segmentIds);
            setStSpecificSegmentsEmpty(false)

            if (segmentIds.length > 0) {
                setStIsShowSegmentError(false)
            }
        }

        if(!segmentIds || segmentIds.length === 0){
            setStSpecificSegmentsEmpty(true)
        }

        setStIsShowCustomerSegmentModal(false)
    };

    const isSubFormValid = () => {

        let hasError = false

        const percent = stModel[FormName.COUPON_PERCENTAGE_VALUE]
        const fixedAmount = stModel[FormName.COUPON_FIXED_AMOUNT_VALUE]
        const minReq = stModel[FormName.CONDITION_MIN_REQ_VALUE]

        if (stModel[FormName.COUPON_TYPE] === CouponTypeEnum.PERCENTAGE && (percent <1 || percent > 100)) hasError = true
        if (stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FIXED_AMOUNT && (!fixedAmount || fixedAmount < stCheckMinInput || fixedAmount > 1000000000)) hasError = true
        if (isNaN(minReq) || minReq < VALIDATE_INPUT.MIN || minReq > VALIDATE_INPUT.MAX_QUANTITY) hasError = true

        if (stModel[FormName.CONDITION_CUSTOMER_SEGMENT] === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT
            && stSpecificSegments.length <= 0) {
            setStIsShowSegmentError(true)
            hasError = true
        }

        if (stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS
            && stSpecificCollections.length <= 0) {
            setStIsShowCollectionError(true)
            setStIsShowProductError(false)
            hasError = true
        }

        if (props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT &&
            stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS
            && stSpecificProducts.length <= 0) {
            setStIsShowProductError(true)
            setStIsShowCollectionError(false)
            hasError = true
        }

        if (props.type === DISCOUNT_TYPES.WHOLESALE_SERVICE &&
            stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_SERVICES
            && stSpecificServices.length <= 0) {
            setStIsShowProductError(true)
            setStIsShowCollectionError(false)
            hasError = true
        }

        // validate branch -> only check if product
        if(props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT){
            if (stModel[FormName.CONDITION_APPLIES_TO_BRANCH] === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH
                && stSpecificBranches.length <= 0) {
                setStIsShowBranchError(true);
                hasError = true;
            } 
        }

        return !hasError
    }

    const submitForm = (e, values) => {

        if (!isSubFormValid()) return false

        setIsProcessing(true);

        // check data for customer_segment
        let lstConditionValueOfSegment = []
        if (stModel[FormName.CONDITION_CUSTOMER_SEGMENT] === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT) {
            stSpecificSegments.forEach(segment => {
                lstConditionValueOfSegment.push({
                    conditionValue: segment.id
                })
            })
        }

        //-----------------------------//
        // check data for apply_to
        //-----------------------------//
        let lstConditionValueOfApply = []

        if(stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS){
            stSpecificCollections.forEach(collection =>{
                lstConditionValueOfApply.push({
                    conditionValue: collection.id
                })
            })
        }else if(stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS){
            stSpecificProducts.forEach(product => {
                lstConditionValueOfApply.push({
                    conditionValue: product.id
                })
            })
        }else if(stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_SERVICES){
            stSpecificServices.forEach(service => {
                lstConditionValueOfApply.push({
                    conditionValue: service.id
                })
            })
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
        // data for request
        //-----------------------------//
        let endDate = stModel[FormName.COUPON_DATE_RANGE_END]
        if(isSettingNoExpiredDate){
            let startDate = _.cloneDeep(stModel[FormName.COUPON_DATE_RANGE_START])
            endDate = startDate.year(startDate.year() + 1000)
        }
        let discount = {
            couponCode: "unused_code",
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
                    conditionOption: DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS, // only minimum items
                    conditionType: "MINIMUM_REQUIREMENTS",
                    values: [{
                        conditionValue: stModel[FormName.CONDITION_MIN_REQ_VALUE]
                    }]
                },
                {
                    conditionOption: stModel[FormName.CONDITION_APPLIES_TO_BRANCH],
                    conditionType: "APPLIES_TO_BRANCH",
                    values: branchesSelected
                }
            ],
            couponType: stModel[FormName.COUPON_TYPE],
            couponValue:
                        stModel[FormName.COUPON_TYPE] === CouponTypeEnum.PERCENTAGE
                        ? stModel[FormName.COUPON_PERCENTAGE_VALUE] + ''
                        : stModel[FormName.COUPON_TYPE] === CouponTypeEnum.FIXED_AMOUNT
                        ? stModel[FormName.COUPON_FIXED_AMOUNT_VALUE] + ''
                        : null,
            expiredDate: endDate,
            storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
            type : props.type
          }
        let request = {
            description: "",
            discounts: [discount],
            name: stModel[FormName.NAME],
            storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
            timeCopy:stTimeCopy
            //useCap: 0
        }

        let pro;
        if(props.mode === DiscountEditorMode.CREATE){
            pro = BCOrderService.createCoupon(request)
        }else{
            request.id = stModel[FormName.ID]
            pro = BCOrderService.updateCoupon(request)
        }

        pro.then(res => {
            // success here
            setIsProcessing(false)

            // redirect page
            setIsRedirect(true)

            RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST);

        }).catch(e => {
            setIsProcessing(false)

            if(e.response.status === 400){
                if(e.response.data.description === "duplicatedCouponCode"){
                    GSToast.error(i18next.t('page.marketing.discounts.coupons.form.error.duplicated_couponcode'));
                }else{
                    GSToast.commonError();
                }
            }else{
                GSToast.commonError();
            }

        })
    }

    const onCloseAddBranchModal = (selectedBranches, mode) => {
        if (mode === BUTTON_TYPE_SELECT) {
            setStSpecificBranches(selectedBranches);

            if(selectedBranches && selectedBranches.length > 0){
                setStIsShowBranchError(false);
            }
        }
        setStIsShowAddBranchModal(false);
    }
    const enabledNoExpiredDate = (e) =>{
        const {value} = e.currentTarget
        
        if(value){
            setIsSettingNoExpiredDate(true)
        }else{
            setIsSettingNoExpiredDate(false)
        }
    }

    return (
        <GSContentContainer confirmWhenRedirect confirmWhen={!isRedirect} isLoading={stIsLoading} isSaving={isProcessing}>
            {/*{isProcessing && <LoadingScreen />}*/}
            <GSContentHeader title={
                i18next.t("page.marketing.discounts.coupons.create.createwholeSale", {
                    types: typeSwitch('page.discount.create.coupon.types', 'productCapAll', 'serviceCapAll')
                })
            } >
                {
                    props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT && <HintPopupVideo category={'WHOLE_SALE_PRODUCT'} title={'wholesale pricing product'}/>
                }
                {
                    props.type === DISCOUNT_TYPES.WHOLESALE_SERVICE && <HintPopupVideo category={'WHOLE_SALE_SERVICE'} title={'wholesale pricing service'}/>

                }
                <GSContentHeaderRightEl className={style.headerButtonGroup}>
                    <GSButton
                        secondary
                        outline
                        onClick={() => {RouteUtils.linkTo(props, NAV_PATH.discounts.DISCOUNTS_LIST)}}
                    >
                        <GSTrans t={"page.marketing.discounts.coupons.create.cancel"}/>
                    </GSButton>
                    <GSButton
                        success
                        marginLeft
                        onClick={() => refSaveBtn.current.click()}>
                        <GSTrans t={"page.marketing.discounts.coupons.create.save"}/>
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
                                                    // checked={isSettingNoExpiredDate}
                                                    value={isSettingNoExpiredDate}
                                                />
                                        </div>
                                    </div>
                                    {isSettingNoExpiredDate?(
                                        <div className="expired-wholesale-date">
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
                                                    label=""
                                                    // label={i18next.t("page.marketing.discounts.coupons.create.activeDate")}
                                                    validate={{
                                                        ...FormValidate.required(),
                                                        async: (value, ctx, input, cb) => {
                                                            if (value === '') cb(true);
                                                                let [startDate, endDate] = value.split(' - ');
                                                                const [sdDD, sdMM, sdYY] = startDate.split('-');
                                                                if(isSettingNoExpiredDate) {
                                                                    endDate = startDate
                                                                }
                                                                const [edDD, edMM, edYY] = endDate.split('-');
                                                                const startDateObj = new Date(sdYY, sdMM, sdDD);
                                                                const endDateObj = new Date(edYY, edMM, edDD);
                                                                if(isSettingNoExpiredDate) endDateObj.setFullYear(parseInt(sdYY) + 1000);
                                                                cb(endDateObj >= startDateObj);
                                                        }
                                                    }}
                                                    onChange={e => {
                                                        const value = e.currentTarget.value
                                                        const [startDate, endDate] = value.split(' - ')
                                                        const [sdDD,sdMM,sdYY] = startDate.split('-')
                                                        const [edDD,edMM,edYY] = endDate.split('-')
                                                        const startDateObj = new Date(sdYY, sdMM, sdDD)
                                                        const endDateObj = new Date(edYY, edMM, edDD)
                                                        if (startDateObj - endDateObj === 0) {
                                                            endDateObj.setHours( endDateObj.getHours()  + 24)
                                                        }
                                                        if(isSettingNoExpiredDate) endDateObj.setFullYear(parseInt(edYY) + 1000);

                                                        setStModel({
                                                            ...stModel,
                                                            [FormName.COUPON_DATE_RANGE_START] : moment(startDate, DATE_RANGE_LOCATE_CONFIG.format),
                                                            [FormName.COUPON_DATE_RANGE_END] : moment(endDateObj)
                                                        })
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
                                                    onKeyPress={ e => e.preventDefault()}
                                                />
                                                <span className={style.calendarIcon}>
                                                    <FontAwesomeIcon  icon={['far', 'calendar-alt']}/>
                                                </span>
                                            </DateRangePicker>
                                        </div>
                                    ):(
                                        <>
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
                                                    // label={i18next.t("page.marketing.discounts.coupons.create.activeDate")}
                                                    validate={{
                                                        ...FormValidate.required(),
                                                        async: (value, ctx, input, cb) => {
                                                            // console.log(value);
                                                            if (value === '') cb(true)
                                                            const [startDate, endDate] = value.split(' - ')
                                                            const [sdDD,sdMM,sdYY] = startDate.split('-')
                                                            const [edDD,edMM,edYY] = endDate.split('-')
                                                            const startDateObj = new Date(sdYY, sdMM, sdDD)
                                                            const endDateObj = new Date(edYY, edMM, edDD)
                                                            cb(endDateObj >= startDateObj)
                                                        }
                                                    }}
                                                    onChange={e => {
                                                        const value = e.currentTarget.value
                                                        const [startDate, endDate] = value.split(' - ')
                                                        const [sdDD,sdMM,sdYY] = startDate.split('-')
                                                        const [edDD,edMM,edYY] = endDate.split('-')
                                                        const startDateObj = new Date(sdYY, sdMM, sdDD)
                                                        const endDateObj = new Date(edYY, edMM, edDD)
                                                        if (startDateObj - endDateObj === 0) {
                                                            endDateObj.setHours( endDateObj.getHours()  + 24)
                                                        }

                                                        setStModel({
                                                            ...stModel,
                                                            [FormName.COUPON_DATE_RANGE_START] : moment(startDate, DATE_RANGE_LOCATE_CONFIG.format),
                                                            [FormName.COUPON_DATE_RANGE_END] : moment(endDateObj)
                                                        })
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
                                                    onKeyPress={ e => e.preventDefault()}
                                                />
                                                <span className={style.calendarIcon}>
                                                    <FontAwesomeIcon  icon={['far', 'calendar-alt']}/>
                                                </span>
                                            </DateRangePicker>
                                        </>
                                    )}
                                    
                                </Col>
                            </Row>
                            <Divider/>
                            {/*COUPON_TYPE*/}
                            <Row>
                                <LeftCol>
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.typeOfDiscount"}/>
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
                                                 onClick = {
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
                                                        stModel[FormName.COUPON_PERCENTAGE_VALUE] < VALIDATE_INPUT.MIN &&
                                                        <AlertInline type={AlertInlineType.ERROR}
                                                                     className={style.frmOptionValueInputValidate}
                                                                     nonIcon
                                                                     text={FormValidate.minValue(VALIDATE_INPUT.MIN, false).min.errorMessage}/>

                                                    }
                                                    {
                                                        stModel[FormName.COUPON_PERCENTAGE_VALUE] > 100 &&
                                                        <AlertInline type={AlertInlineType.ERROR}
                                                                     className={style.frmOptionValueInputValidate}
                                                                     nonIcon
                                                                     text={FormValidate.maxValue(100, true).max.errorMessage}/>

                                                    }
                                                {/*</AvForm>*/}
                                            </div>
                                        }
                                        <AvRadio customInput
                                                 className={style.customRadio}
                                                 label={i18next.t("page.marketing.discounts.coupons.create.fixedAmount")}
                                                 value={CouponTypeEnum.FIXED_AMOUNT}
                                                 onClick = {
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
                                                        ...FormValidate.maxValue(100000000, true)
                                                    }}
                                                    onChange={onFormChange}
                                                    value={stModel[FormName.COUPON_FIXED_AMOUNT_VALUE]}
                                                    position={CurrencyUtils.isPosition(currency)}
                                                    precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                                    decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                                />
                                            {/*</AvForm>*/}

                                            {
                                                stModel[FormName.COUPON_FIXED_AMOUNT_VALUE] < stCheckMinInput &&
                                                <AlertInline type={AlertInlineType.ERROR}
                                                             className={style.frmOptionValueInputValidate}
                                                             nonIcon
                                                             text={FormValidate.minValue(stCheckMinInput, false).min.errorMessage}/>

                                            }
                                            {
                                                stModel[FormName.COUPON_FIXED_AMOUNT_VALUE] > 1_000_000_000 &&
                                                <AlertInline type={AlertInlineType.ERROR}
                                                             className={style.frmOptionValueInputValidate}
                                                             nonIcon
                                                             text={FormValidate.maxValue(1_000_000_000, true).max.errorMessage}/>

                                            }
                                        </div>
                                        }
                                        {/*<AvRadio customInput*/}
                                        {/*         className={style.customRadio}*/}
                                        {/*         label={i18next.t("page.marketing.discounts.coupons.create.freeShipping")}*/}
                                        {/*         value={CouponTypeEnum.FREE_SHIPPING}*/}
                                        {/*         onClick = {*/}
                                        {/*             (e) => onRadioSelect(e, FormName.COUPON_TYPE)*/}
                                        {/*         }*/}
                                        {/*/>*/}
                                    </AvRadioGroup>
                                </RightCol>
                            </Row>
                        </GSWidgetContent>
                    </GSWidget>

                    <GSWidget>
                        <GSWidgetHeader title={i18next.t("page.marketing.discounts.coupons.create.usageLimits.wholesaleConditions")}/>
                        <GSWidgetContent>
                            {/*CUSTOMER_SEGMENT*/}
                            <Row>
                                <LeftCol>
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={'page.marketing.discounts.coupons.create.usageLimits.customerSegment'}/>
                                    </label>
                                    {stIsShowSegmentError &&
                                    <AlertInline text={i18next.t('page.discount.create.coupon.validate.segmentAtLeast1')}
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
                                                 onClick = {
                                                     (e) => onRadioSelect(e, FormName.CONDITION_CUSTOMER_SEGMENT)
                                                 } />

                                        <AvRadio customInput
                                                 className={style.customRadio}
                                                 label={i18next.t("page.marketing.discounts.coupons.create.usageLimits.specificSegment")}
                                                 value={DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT}
                                                 onClick = {
                                                     (e) => onRadioSelect(e, FormName.CONDITION_CUSTOMER_SEGMENT)
                                                 }/>
                                        {stModel[FormName.CONDITION_CUSTOMER_SEGMENT]
                                        === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT &&
                                        <div className={style.frmOptionValue}>
                                            <div className={style.linkSelector}>
                                                <GSFakeLink onClick={toggleCustomerSegmentModal}>
                                                    <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.addSegment"}/>
                                                </GSFakeLink>
                                                &nbsp;
                                                <span className={style.totalItem}>
                                                    <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.selectedSegment"}
                                                             values={{x: stSpecificSegments.length, y: stSpecificSegmentUsers}}/>
                                                </span>
                                                {stSpecificSegmentsEmpty && <AlertInline type={AlertInlineType.ERROR}
                                                        className={style.errorEmpty}
                                                        nonIcon
                                                        text={i18next.t('common.validation.required')}/>}
                                            </div>
                                        </div>
                                        }
                                    </AvRadioGroup>
                                </RightCol>
                            </Row>
                            <Divider/>
                            {/*APPLIES_TO*/}
                            <Row>
                               <LeftCol>
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={'page.marketing.discounts.coupons.create.usageLimits.appliesTo'}/>
                                    </label>

                                   {stIsShowCollectionError &&
                                   <AlertInline text={i18next.t('page.discount.create.coupon.validate.collectionAtLeast1')}
                                                textAlign={"left"}
                                                nonIcon
                                                type={AlertInlineType.ERROR}
                                                padding={false}
                                   />}
                                   {stIsShowProductError &&
                                   <AlertInline text={i18next.t('page.discount.create.coupon.validate.productAtLeast1',
                                       {types: typeSwitch('page.discount.create.coupon.types', 'product', 'service')})
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
                                                 label={ props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT ?
                                                     i18next.t("page.marketing.discounts.coupons.create.usageLimits.allProducts")
                                                     : i18next.t("page.discount.create.whole_sale.types.allServices")
                                                    }
                                                 value={
                                                     props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT
                                                     ? DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ALL_PRODUCTS
                                                     : DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ALL_SERVICES }
                                                 onClick = {
                                                     (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO)
                                                 }
                                        />

                                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0127]}
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
                                                     onClick = {
                                                         (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO)
                                                     }
                                            />
                                        </PrivateComponent>


                                        {stModel[FormName.CONDITION_APPLIES_TO]
                                        === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS &&
                                        <div className={style.frmOptionValue}>
                                            <div className={style.linkSelector}>
                                                <GSFakeLink onClick={toggleCollectionModal}>
                                                    <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.addCollections"}/>
                                                </GSFakeLink>
                                                &nbsp;
                                                <span className={style.totalItem}>
                                                    <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.selectedCollection"}
                                                             values={{x: stSpecificCollections.length}}/>
                                                </span>
                                                {stSpecificCollectionsEmpty && <AlertInline type={AlertInlineType.ERROR}
                                                        className={style.errorEmpty}
                                                        nonIcon
                                                        text={i18next.t('common.validation.required')}/>}
                                            </div>
                                        </div>
                                        }

                                        <AvRadio customInput
                                                 className={style.customRadio}
                                                 label={
                                                     <GSTrans t="page.marketing.discounts.coupons.create.usageLimits.specificProducts"
                                                              values={{
                                                                  types: typeSwitch('page.discount.create.coupon.types', 'productCap', 'serviceCap')
                                                              }}
                                                     />
                                                 }
                                                 value={props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT
                                                    ? DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS
                                                    : DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_SERVICES}
                                                 onClick = {
                                                     (e) => onRadioSelect(e, FormName.CONDITION_APPLIES_TO)
                                                 }
                                        />

                                        {
                                        ((props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT && stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS)
                                        || (props.type === DISCOUNT_TYPES.WHOLESALE_SERVICE && stModel[FormName.CONDITION_APPLIES_TO] === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_SERVICES))
                                        &&
                                        <div className={style.frmOptionValue}>
                                            <div className={style.linkSelector}>

                                                <GSFakeLink onClick={toggleProductModal}>
                                                    <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.addProducts"}
                                                             values={{
                                                                 types: typeSwitch('page.discount.create.coupon.types', 'products','services')
                                                             }}
                                                    />
                                                </GSFakeLink>
                                                &nbsp;
                                                <span>
                                                    <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.selectedProduct"}
                                                             values={{
                                                                 x: (props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT ? stSpecificProducts.length : stSpecificServices.length),
                                                                 types: typeSwitch('page.discount.create.coupon.types', 'products','services')
                                                             }}/>
                                                </span>
                                                {stSpecificProductsEmpty && <AlertInline type={AlertInlineType.ERROR}
                                                        className={style.errorEmpty}
                                                        nonIcon
                                                        text={i18next.t('common.validation.required')}/>}
                                            </div>
                                        </div>
                                        }

                                    </AvRadioGroup>
                                </RightCol>
                            </Row>
                            <Divider/>
                            {/*MINIMUM REQUIREMENTS*/}
                            <Row>
                                <LeftCol>
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={'page.marketing.discounts.coupons.create.usageLimits.minimumRequirements'}/>
                                    </label>
                                </LeftCol>
                                <RightCol>
                                    <label>
                                        <GSTrans t={`page.marketing.discounts.coupons.create.usageLimits.minimumQuantityOfItems.all`}
                                                 values={{
                                                     types: typeSwitch('page.discount.create.coupon.types', 'products', 'services')
                                                 }}
                                        />
                                    </label>
                                    <AvFieldCurrency
                                        className={style.frmOptionValueInput}
                                        name={FormName.CONDITION_MIN_REQ_VALUE}
                                        onChange={onFormChange}
                                        value={stModel[FormName.CONDITION_MIN_REQ_VALUE]}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.minValue(VALIDATE_INPUT.MIN, true),
                                            ...FormValidate.maxValue(VALIDATE_INPUT.MAX_QUANTITY, true)
                                        }}
                                    />
                                    {
                                        (stModel[FormName.CONDITION_MIN_REQ_VALUE] < VALIDATE_INPUT.MIN || stModel[FormName.CONDITION_MIN_REQ_VALUE] === '') &&
                                        <AlertInline type={AlertInlineType.ERROR}
                                            className={style.frmOptionValueInputValidate}
                                            nonIcon
                                            textAlign={'left'}
                                            padding={false}
                                            text={FormValidate.minValue(VALIDATE_INPUT.MIN, false).min.errorMessage}/>
                                    }
                                    {
                                        stModel[FormName.CONDITION_MIN_REQ_VALUE] > VALIDATE_INPUT.MAX_QUANTITY &&
                                        <AlertInline type={AlertInlineType.ERROR}
                                            className={style.frmOptionValueInputValidate}
                                            nonIcon
                                            textAlign={'left'}
                                            padding={false}
                                            text={FormValidate.maxValue(VALIDATE_INPUT.MAX_QUANTITY, true).max.errorMessage} />

                                    }
                                </RightCol>
                            </Row>
                            {props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT &&
                                <Divider />
                            }

                            {/* Applicable branch */}
                            {props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT &&
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
                        </GSWidgetContent>
                    </GSWidget>
                </AvForm>
            </GSContentBody>

            {stIsShowProductModal &&
                <ProductNoVariationModal
                    productSelectedList={props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT ? stSpecificProducts : stSpecificServices}
                    onClose={onCloseSpecificItemSelector}
                    type={props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT ? 'BUSINESS_PRODUCT' : 'SERVICE'}
                    includeConversion={true}
                    mode={editorMode.WHOLESALE}
                />
            }
            {stIsShowCollectionModal &&
                <CollectionModal
                    collectionSelectedList={stSpecificCollections}
                    onClose={onCloseSpecificCollectionSelector}
                    itemType={props.type === DISCOUNT_TYPES.WHOLESALE_PRODUCT ? 'BUSINESS_PRODUCT' : 'SERVICE'}
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

WholeSaleEditor.propTypes = {
    type: PropTypes.string,
    currency: PropTypes.string,
}

export default WholeSaleEditor;
