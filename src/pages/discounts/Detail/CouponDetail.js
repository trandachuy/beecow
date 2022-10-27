import React, {Component} from 'react';
import {UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../@uik';
import './CouponDetail.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Trans} from "react-i18next";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSButton from "../../../components/shared/GSButton/GSButton";
import i18next from "i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import {BCOrderService} from '../../../services/BCOrderService';
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import Row from "reactstrap/es/Row";
import Col from "reactstrap/es/Col";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {DiscountConditionOptionEnum} from "../../../models/DiscountConditionOptionEnum";
import {CouponTypeEnum} from "../../../models/CouponTypeEnum";
import moment from 'moment';
import {CurrencyUtils} from "../../../utils/number-format";
import {CredentialUtils} from '../../../utils/credential';
import {GSToast} from "../../../utils/gs-toast";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {ImageUtils} from '../../../utils/image';
import StoreService from '../../../services/StoreService';

class CouponDetail extends Component {

    state = {
        isProcessing: false,

        // discount id
        couponId: 0,

        // coupon status
        couponStatus: '',

        couponName: '',
        couponCode: '',

        // date
        noExpiredDate: false,
        couponDateRange: '',
        couponStartDate: null,
        couponEndDate: null,

        // type
        couponType: '',
        couponValue: 0,

        // usage
        couponUsageLimitNumber: false,
        couponUsageLimitNumberValue: 0,
        couponUsageLimitOnePerson: false,

        // condition
        couponConditionCustomerSegment: '',
        couponConditionCustomerSegmentValue: [],

        couponConditionApply: '',
        couponConditionApplyValue: [],

        couponConditionMinReq: '',
        couponConditionMinReqValue: 0,

        couponConditionBranch: '',
        couponConditionBranchValue: [],

        couponConditionPlatform: '',

        lstOfBranches:[]

    };

    DATE_RANGE_LOCATE_CONFIG = {
        format: "DD-MM-YYYY"
    };

    constructor(props) {
        super(props);

        this.endDiscount = this.endDiscount.bind(this);
    }

    Divider() {
        return (
            <Row>
                <Col sm={12} lg={12} md={12} xl={12} xs={12}>
                    <hr/>
                </Col>
            </Row>
        );
    }

    componentDidMount() {
        this.setState({
            isProcessing: true
        });

        const {itemId} = this.props.match.params;

        let promises = [];
        promises.push(BCOrderService.getCouponDetailFull(itemId));// for coupon detail
        promises.push(StoreService.getFullStoreBranches());

        // get detail when edit
        Promise.all(promises).then(res => {

            const data = res[0];
            const discount = data.discounts[0];
            const conditions = discount.conditions;

            if (data.storeId != CredentialUtils.getStoreId()) {
                RouteUtils.linkTo(this.props, NAV_PATH.discounts);
                GSToast.commonError();
            }

            const conditionCustomerSegment = conditions.filter(co => co.conditionType === "CUSTOMER_SEGMENT")[0];
            const conditionAppliesTo = conditions.filter(co => co.conditionType === "APPLIES_TO")[0];
            const conditionMinReq = conditions.filter(co => co.conditionType === "MINIMUM_REQUIREMENTS")[0];
            const conditionBranch = conditions.filter(co => co.conditionType === "APPLIES_TO_BRANCH")[0];
            const conditionPlatform = conditions.filter(co => co.conditionType === "PLATFORMS")[0];

            let lstDataOfValueSegments = [];
            if (conditionCustomerSegment && conditionCustomerSegment.conditionOption === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT) {
                conditionCustomerSegment.values.forEach(value => {
                    lstDataOfValueSegments.push(value.conditionMetadata);
                });
            }

            let lstDataOfValues = [];
            if (conditionAppliesTo && (conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS
                || conditionAppliesTo.conditionOption === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS)) {
                conditionAppliesTo.values.forEach(value => {
                    lstDataOfValues.push(value.conditionMetadata);
                });
            }

            let freeShippingProviders = [];
            if (discount.freeShippingProviders) {
                freeShippingProviders = _.filter(discount.freeShippingProviders.split(","), x => {
                    return x !== 'ahamove_truck';
                });
            }

            let lstOfValueBranches = []
            if(conditionBranch && conditionBranch.conditionOption === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_SPECIFIC_BRANCH){
                // all branch
                conditionBranch.values.forEach(value => {
                    lstOfValueBranches.push(value.conditionValue);
                });
            }
            const startYear = moment(discount.activeDate).year()
            const endYear = moment(discount.expiredDate).year()
            const compare = endYear - startYear

            this.setState({

                //id
                couponId: discount.id,

                // status
                couponStatus: discount.status,

                couponName: data.name,
                couponCode: discount.couponCode,

                // date
                noExpiredDate: compare === 1000?true:false,
                couponDateRange:
                    moment(discount.activeDate).format(this.DATE_RANGE_LOCATE_CONFIG.format)
                    + ' - '
                    + moment(discount.expiredDate).format(this.DATE_RANGE_LOCATE_CONFIG.format),
                couponStartDate: moment(discount.activeDate),
                couponEndDate: (compare === 1000)? i18next.t('component.coupon.edit.no.expired.date'):moment(discount.expiredDate),

                // type
                couponType: discount.couponType,
                couponValue: discount.couponValue,

                // usage
                couponUsageLimitNumber: discount.couponLimitedUsage,
                couponUsageLimitNumberValue: discount.couponLimitedUsage ? discount.couponTotal : 0,
                couponUsageLimitOnePerson: discount.couponLimitToOne,

                // condition
                couponConditionCustomerSegment: conditionCustomerSegment ? conditionCustomerSegment.conditionOption : DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS,
                couponConditionCustomerSegmentValue: lstDataOfValueSegments,

                couponConditionApply: conditionAppliesTo ? conditionAppliesTo.conditionOption : DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER,
                couponConditionApplyValue: lstDataOfValues,

                couponConditionMinReq: conditionMinReq ? conditionMinReq.conditionOption : DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_NONE,
                couponConditionMinReqValue: (conditionMinReq && (conditionMinReq.conditionOption === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT
                    || conditionMinReq.conditionOption === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS))
                    ?
                    conditionMinReq.values[0].conditionValue
                    :
                    0,

                couponConditionBranch: conditionBranch ? conditionBranch.conditionOption : undefined,
                couponConditionBranchValue: lstOfValueBranches,

                couponConditionPlatform: conditionPlatform.conditionOption,
                freeShippingProviders: freeShippingProviders,
                enabledRewards: discount.enabledRewards,

                lstOfBranches: res[1].data
            });

            this.setState({
                isProcessing: false
            });

        }).catch(e => {
            GSToast.commonError();

            this.setState({
                isProcessing: false
            });
        });
    }

    endDiscount() {
        this.refConfirmModal.openModal({
            messages: <GSTrans t={"component.discount.modal.end.early.hint"}>a<b>a</b></GSTrans>,
            okCallback: () => {
                this.setState({
                    isProcessing: true
                });

                BCOrderService.endEarly(this.state.couponId, CredentialUtils.getStoreId()).then(res => {
                    this.setState({
                        isProcessing: false
                    });

                    RouteUtils.linkTo(this.props, NAV_PATH.discounts);
                }).catch(e => {
                    this.setState({
                        isProcessing: false
                    });

                    GSToast.commonError();
                });
            }
        });
    }

    renderHeader() {
        return (
            <GSContentHeader className="page-toolbar"
                             title={this.state.couponName}
                             subTitle={i18next.t("page.marketing.discounts.breadkum")}>
                {/*BTN EARLY*/}
                <GSButton success
                          disabled={this.state.couponStatus !== 'IN_PROGRESS'}
                          className={"btn-save"}
                          style={{marginLeft: 'auto'}}
                          onClick={this.endDiscount}>
                    <Trans i18nKey={'component.discount.btn.end'} className="sr-only">
                        End Early
                    </Trans>
                </GSButton>
            </GSContentHeader>
        );
    }

    render() {
        return (
            <GSContentContainer className="discount-campaign__detail">
                {this.state.isProcessing && <LoadingScreen/>}
                {this.renderHeader()}
                <GSContentBody size={GSContentBody.size.LARGE}>
                    {/*GENERAL INFORMATION*/}
                    <UikWidget className={"gs-widget "}>
                        <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                            <Trans i18nKey="page.marketing.discounts.coupons.create.generalInformation">
                                General Information
                            </Trans>
                        </UikWidgetHeader>
                        <UikWidgetContent className={'widget__content '}>
                            {/* NAME */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.name"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {this.state.couponName} {this.state.enabledRewards && <b>(<GSTrans t={"page.marketing.discounts.coupons.create.rewards"}/>)</b>}
                                </Col>
                            </Row>

                            {/* COUPON CODE */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.couponCode"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                        <span className="field-bold">
                                            {this.state.couponCode}
                                        </span>
                                </Col>
                            </Row>

                            {/* ACTIVE DATE */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.activeDate"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponStartDate && this.state.couponEndDate
                                            ? this.state.couponStartDate.format('ll') + " - " + (!this.state.noExpiredDate?this.state.couponEndDate.format('ll'):this.state.couponEndDate)
                                            : ""
                                    }
                                </Col>
                            </Row>

                            {/* -------- */}
                            {this.Divider()}

                            {/* TYPE OF COUPON */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.typeOfDiscount"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponType === CouponTypeEnum.PERCENTAGE
                                            ?
                                            <>
                                                {i18next.t('page.marketing.discounts.coupons.create.percentage') + ': '}
                                                <span className="field-bold">{this.state.couponValue}%</span>
                                            </>
                                            : this.state.couponType === CouponTypeEnum.FIXED_AMOUNT
                                            ?
                                            <>
                                                {i18next.t('page.marketing.discounts.coupons.create.fixedAmount') + ': '}
                                                <span
                                                    className="field-bold">{CurrencyUtils.formatMoneyByCurrency(this.state.couponValue, this.props.currency)}</span>
                                            </>

                                            : <>
                                                {i18next.t('page.marketing.discounts.coupons.create.freeShipping')}
                                                {this.state.couponValue !== 0 &&
                                                <span
                                                    className="field-bold">(
                                                    {this.state.freeShippingProviders.map((x, index) => {
                                                        return i18next.t("page.marketing.discounts.coupons.create." + x) + (index < (this.state.freeShippingProviders.length - 1) ? ", " : "");
                                                    })})
                                                    {this.state.couponValue &&
                                                    <> <br />
                                                        <GSTrans
                                                            t={"page.marketing.discounts.coupons.create.feeShippingAmount"}/>: {CurrencyUtils.formatMoneyByCurrency(this.state.couponValue,  this.props.currency)}
                                                    </>
                                                    }
                                                </span>
                                                }
                                            </>
                                    }
                                </Col>
                            </Row>

                            {/* -------- */}
                            {this.Divider()}

                            {/* USAGE LIMIT */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    <div>
                                        {
                                            this.state.couponUsageLimitNumber &&

                                            <Trans
                                                i18nKey={"page.marketing.discounts.coupons.detail.usageLimits.numberOfTime"}
                                                values={{x: this.state.couponUsageLimitNumberValue}}
                                            >
                                                Limit <span className="field-bold">x times </span> this coupon can be
                                                used
                                            </Trans>
                                            // i18next.t('page.marketing.discounts.coupons.detail.usageLimits.numberOfTime', {x : this.state.couponUsageLimitNumberValue})

                                        }
                                    </div>
                                    <div>
                                        {
                                            this.state.couponUsageLimitOnePerson
                                                ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.usePerCustomer')
                                                : <></>
                                        }
                                    </div>
                                </Col>
                            </Row>

                        </UikWidgetContent>
                    </UikWidget>

                    {/*COUPON CODITION*/}
                    <UikWidget className={"gs-widget "}>
                        <UikWidgetHeader className={'widget__header widget__header--text-align-right'}>
                            <Trans i18nKey="page.marketing.discounts.coupons.create.usageLimits.couponConditions">
                                Coupon Conditions
                            </Trans>
                        </UikWidgetHeader>
                        <UikWidgetContent className={'widget__content '}>
                            {/* CUSTOMER SEGMENT */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans
                                            t={"page.marketing.discounts.coupons.create.usageLimits.customerSegment"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponConditionCustomerSegment === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_ALL_CUSTOMERS
                                            ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.allCustomer')
                                            : this.state.couponConditionCustomerSegment === DiscountConditionOptionEnum.CUSTOMER_SEGMENT.CUSTOMER_SEGMENT_SPECIFIC_SEGMENT
                                            ?
                                            <>
                                                <div>
                                                    {/*list segment here */}
                                                    {this.state.couponConditionCustomerSegmentValue &&
                                                    this.state.couponConditionCustomerSegmentValue.map(data => {
                                                        return (
                                                            data.segmentName &&
                                                            <div className="page-row__collection">
                                                                <span
                                                                    className="collection-name field-bold">{data.segmentName}</span>
                                                                <span
                                                                    className="product-number">{i18next.t('page.marketing.discounts.coupons.customer_segment_modal.countUser', {total: CurrencyUtils.formatThousand(data.segmentNumCustomers)})}</span>
                                                            </div>
                                                        );
                                                    })
                                                    }
                                                </div>
                                            </>
                                            :
                                            <></>
                                    }
                                </Col>
                            </Row>
                            {/* -------- */}
                            {this.Divider()}

                            {/* APPLY TO */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.appliesTo"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponConditionApply === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_ENTIRE_ORDER
                                            ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.entireOrder')
                                            : this.state.couponConditionApply === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_COLLECTIONS
                                            ?
                                            <>
                                                {/* <div className="field-bold">
                                                        <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.specificCollections"}/>
                                                    </div>
                                                    <br/> */}
                                                <div>
                                                    {/*list collection here */}
                                                    {this.state.couponConditionApplyValue &&
                                                    this.state.couponConditionApplyValue.map(data => {
                                                        return (

                                                            data.collectionName &&
                                                            <div className="page-row__collection">
                                                                <span
                                                                    className="collection-name field-bold">{data.collectionName}</span>
                                                                <span
                                                                    className="product-number">{i18next.t('productList.countProduct', {total: CurrencyUtils.formatThousand(data.collectionNumItems)})}</span>
                                                            </div>


                                                        );
                                                    })
                                                    }
                                                </div>
                                            </>
                                            : this.state.couponConditionApply === DiscountConditionOptionEnum.APPLIES_TO.APPLIES_TO_SPECIFIC_PRODUCTS
                                                ?
                                                <>
                                                    {/* <div>
                                                        <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.specificProducts"}/>
                                                    </div> */}
                                                    <div>
                                                        {/*list product here */}
                                                        {this.state.couponConditionApplyValue &&
                                                        this.state.couponConditionApplyValue.map(data => {
                                                            return (
                                                                <div className="page-row__product">
                                                                    <img className="product-image"
                                                                         src={ImageUtils.getImageFromImageModel(data.productImage, 100)}
                                                                         alt=""/>
                                                                    <span
                                                                        className="product-name">{data.productName}</span>
                                                                </div>
                                                            );
                                                        })
                                                        }
                                                    </div>
                                                </>
                                                : <></>
                                    }
                                </Col>
                            </Row>

                            {/* -------- */}
                            {this.Divider()}

                            {/* MINIMUM REQUIREDMENT */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans
                                            t={"page.marketing.discounts.coupons.create.usageLimits.minimumRequirements"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponConditionMinReq === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_NONE
                                            ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.none')
                                            : this.state.couponConditionMinReq === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_PURCHASE_AMOUNT
                                            ?
                                            <>
                                                {i18next.t('page.marketing.discounts.coupons.create.usageLimits.minimumPurchaseAmount.all') + ": "}
                                                <span
                                                    className="field-bold">{CurrencyUtils.formatMoneyByCurrency(this.state.couponConditionMinReqValue,  this.props.currency)}</span>
                                            </>
                                            : this.state.couponConditionMinReq === DiscountConditionOptionEnum.MIN_REQUIREMENTS.MIN_REQUIREMENTS_QUANTITY_OF_ITEMS
                                                ?
                                                <>
                                                    {i18next.t('page.marketing.discounts.coupons.create.usageLimits.minimumQuantityOfItems.all') + ": "}
                                                    <span
                                                        className="field-bold">{CurrencyUtils.formatThousand(this.state.couponConditionMinReqValue)}</span>
                                                </>
                                                : <></>
                                    }
                                </Col>
                            </Row>

                            {/* -------- */}
                            {this.state.couponConditionBranch && this.props.match.params.discountsType === "COUPON" && this.Divider()}

                            {/* Applicable branch */}
                            {this.state.couponConditionBranch && this.props.match.params.discountsType === "COUPON" &&
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans
                                            t={"page.marketing.discounts.coupons.create.applicableBranch"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponConditionBranch === DiscountConditionOptionEnum.APPLIES_TO_BRANCH.APPLIES_TO_BRANCH_ALL_BRANCHES
                                            ? i18next.t('page.marketing.discounts.coupons.create.applicableBranch.all')
                                            : <div>
                                                {this.state.couponConditionBranchValue && this.state.lstOfBranches.length > 0 &&
                                                this.state.couponConditionBranchValue.map(data => {
                                                    return (
                                                        <div>
                                                            {this.state.lstOfBranches.filter(branch => branch.id == data)[0]?.name}
                                                        </div>
                                                    );
                                                })
                                                }
                                            </div> 
                                    }
                                </Col>
                            </Row>
                            }

                            {/* -------- */}
                            {this.Divider()}

                            {/* PLATFORM */}
                            <Row>
                                <Col sm={12} xs={12} md={12} xl={4} lg={4} className="left-col">
                                    <label className="gs-frm-input__label">
                                        <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.platforms"}/>
                                    </label>
                                </Col>
                                <Col sm={12} xs={12} md={12} xl={8} lg={8} className="right-col">
                                    {
                                        this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_WEB
                                            ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.webAndApp')
                                            : this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_WEB_ONLY
                                            ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.webOnly')
                                            : this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_ONLY
                                                ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.appOnly')
                                                : this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_INSTORE_ONLY
                                                    ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.instoreOnly')
                                                    : this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_WEB_INSTORE
                                                        ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.webAndAppAndInstore')
                                                        : this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_APP_INSTORE
                                                            ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.appAndInstore')
                                                            : this.state.couponConditionPlatform === DiscountConditionOptionEnum.PLATFORMS.PLATFORMS_WEB_INSTORE
                                                                ? i18next.t('page.marketing.discounts.coupons.create.usageLimits.webAndInstore')
                                                                : <></>
                                    }
                                </Col>
                            </Row>

                        </UikWidgetContent>
                    </UikWidget>

                    <ConfirmModal ref={(el) => {
                        this.refConfirmModal = el;
                    }}/>
                </GSContentBody>
            </GSContentContainer>

        );


    }
}

export default CouponDetail;
