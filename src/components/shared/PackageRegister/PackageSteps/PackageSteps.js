/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, { Component } from "react";
import PropTypes from "prop-types";
import i18next from "i18next";
import { UikWidget, UikWidgetContent, UikWidgetHeader } from "../../../../@uik";
import { Trans } from "react-i18next";
import jquery from "jquery";
import "../../../../pages/setting/SettingPlans/SettingPlans.sass";
import SettingPlansStep1 from "../../../../pages/setting/SettingPlans/Step1/SettingPlansStep1";
import SettingPlansStep2 from "../../../../pages/setting/SettingPlans/Step2/SettingPlansStep2";
import SettingPlansStep3 from "../../../../pages/setting/SettingPlans/Step3/SettingPlansStep3";
import GSContentContainer from "../../../layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../layout/contentBody/GSContentBody";
import Constants from "../../../../config/Constant";
import { cancelablePromise } from "../../../../utils/promise";
import beehiveService from "../../../../services/BeehiveService";
import PackageRegister from "../PackageRegister";
import "./PackageSteps.sass";
import { AgencyService } from "../../../../services/AgencyService";
import { PackagePlanService } from "./package-plan";
import { CredentialUtils } from "../../../../utils/credential";
import _ from "lodash";
import GSPackagePlanProgressBar from "../../GSPackagePlanProgressBar/GSPackagePlanProgressBar";
import {NAV_PATH} from '../../../layout/navigation/Navigation'
import {withRouter} from 'react-router-dom'

class PackageSteps extends Component {
    step = new URLSearchParams(this.props.location.search).get("step");
    _isMounted = false;
    /*
    Flow:
    + Step1: After choose plan, step1 will call back onChoosePlan()
    + Parent: Get selected plan and change to step2
    + Step2: After payment is completed, step2 will call back onPaymentCompleted()
    + Parent: Get payment information and change to step3
     */
    /*
    selectedPricingPlan:
        1. 24 months
        2. 12 months
        3. 1 month
    */
    state = {
        isFetching: true,
        dataObj: null,
        selectedPlan: null,
        selectedPricingPlan: 2,
        paymentObj: null,
        billObj: null,
        contactObj: null,
        ...this.props.location.state,
        currentStep: this.step ? parseInt(this.step) : 1,
    };

    constructor(props) {
        super(props);

        this.renderStep = this.renderStep.bind(this);
        this.changeStep = this.changeStep.bind(this);
        this.onStep1Completed = this.onStep1Completed.bind(this);
        this.onChangeStep = this.onChangeStep.bind(this);
        this.onStep2Completed = this.onStep2Completed.bind(this);
        this.onStep3PayAgain = this.onStep3PayAgain.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const prevStep = new URLSearchParams(prevProps.location.search).get("step") || 1
        const currentStep = new URLSearchParams(this.props.location.search).get("step") || 1
        const currentLocState = this.props.location.state

        if (prevStep !== currentStep) {
            this.setState({
                ...currentLocState,
                currentStep: parseInt(currentStep)
            });
        }
    }

    renderStep(step) {
        switch (step) {
            case 1:
                return (
                    <SettingPlansStep1
                        dataObj={this.state.dataObj}
                        onChoosePlan={this.onStep1Completed}
                    />
                );
            case 2:
                return (
                    <SettingPlansStep2
                        dataObj={this.state.dataObj}
                        selectedPlan={this.state.selectedPlan}
                        selectedPricingPlan={this.state.selectedPricingPlan}
                        paymentObj={this.state.paymentObj}
                        onPaymentCompleted={this.onStep2Completed}
                        onBack={() =>
                            this.props.history.push(NAV_PATH.wizard + '/' + 'payment')
                        }
                    />
                );
            case 3:
                /*
                    if billObj is null: FAILED
                    billObj is ready: SUCCESS
                */
                return (
                    <SettingPlansStep3
                        selectedPlan={this.state.selectedPlan}
                        paymentObj={this.state.paymentObj}
                        billObj={this.state.billObj}
                        contactObj={this.state.contactObj}
                        onPayAgain={this.onStep3PayAgain}
                    />
                );
        }
    }

    onStep1Completed(plan, pricingPlan) {
        jquery("#app-body").scrollTop(0);

        this.props.history.push(NAV_PATH.wizard + '/' + 'payment' + '?step=2', {
            selectedPlan: plan,
            selectedPricingPlan: pricingPlan
        });
    }

    /* BILL OBJ
     {
        total:
        currency:
        plan: 1 (24M)|2 (12M)|3 (1M)
        paymentMethod: 'ONLINE_BANKING'|'CREDIT_DEBIT_CARD'|'BANK_TRANSFER'
    */
    onStep2Completed(bill) {
        this.props.history.push(NAV_PATH.wizard + '/' + 'payment' + '?step=3', {
            billObj: bill,
            selectedPlan: this.state.selectedPlan,
            selectedPricingPlan: this.state.selectedPricingPlan
        });
    }

    onStep3PayAgain(pricingPlan) {
        this.props.history.push(NAV_PATH.wizard + '/' + 'payment' + '?step=2', {
            selectedPlan: this.state.selectedPlan,
            selectedPricingPlan: pricingPlan,
        });
    }

    changeStep(step) {
        if (step == 1) {
            this.props.history.push(`${NAV_PATH.wizard}/payment`)
        } else {
            this.props.history.push(`${NAV_PATH.wizard}/payment?step=${step}`, {
                ...this.state
            });
        }
    }

    render() {
        return (
            <GSContentContainer
                isLoading={this.state.isFetching}
                className="package-steps"
            >
                {this.props.atPage === PackageRegister.PAGE.SETTING && (
                    <GSContentHeader
                        title={i18next.t("page.setting.plans.title")}
                    ></GSContentHeader>
                )}
                {this.state.dataObj &&
                    this.state.paymentObj &&
                    this.state.contactObj && (
                        <GSContentBody
                            size={GSContentBody.size.EXTRA}
                            className="package-steps__page"
                        >
                            <UikWidget className="gs-widget package-steps__widget">
                                <UikWidgetHeader className="gs-widget__header d-mobile-none d-desktop-block">
                                    <Trans i18nKey="page.setting.plans.pickPlansTitle"></Trans>
                                </UikWidgetHeader>
                                <h5 className="package-steps__title d-mobile-block d-desktop-none">
                                    <Trans i18nKey="page.setting.plans.pickPlansTitle"></Trans>
                                </h5>
                                <UikWidgetContent className="gs-widget__content">
                                    <GSPackagePlanProgressBar
                                        steps={
                                            Constants.PACKAGE_PLAN_STEP.GOSELL
                                        }
                                        currentStep={this.state.currentStep}
                                        disabledChangeStep={3}
                                        onChangeStep={this.onChangeStep}
                                    />
                                    {this.renderStep(this.state.currentStep)}
                                </UikWidgetContent>
                            </UikWidget>
                        </GSContentBody>
                    )}
            </GSContentContainer>
        );
    }

    onChangeStep(step) {
        this.props.history.push(`${NAV_PATH.wizard}/payment?step=${step}`);
        this.setState({
            currentStep: step,
        });
    }

    componentDidMount() {
        this._isMounted = true;
        const contactObj = {
            descriptions: "",
            email: "cskh@gosell.vn",
            hotLine: "02873030800",
        };

        let bankTransferContent = `${i18next.t('page.order.list.group.orderId')} - ${
            i18next.language === "vi"
                ? "Số điện thoại của bạn"
                : "Your phone number"
        }`;

        const paymentObj = {
            bankTransfer: {
                accountOwner: "CÔNG TY TNHH MEDIASTEP SOFWARE VIỆT NAM",
                accountNumber: "04201015009138",
                bank: "Maritime Bank",
                branch: "Đô Thành",
                content: bankTransferContent,
            },
            bankTransferNonVn: {
                bankName: 'Joint Stock Commercial Bank for Foreign Trade of Vietnam',
                swiftCode: 'BFTVVNVX',
                accountHolderName: 'CTY TNHH MEDIASTEP SOFTWARE VIET NAM',
                accountNumber: '0331370480531',
                content: bankTransferContent
            },
            online: {
                methods: CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM
                    ? [
                        Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
                        Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
                        Constants.ORDER_PAYMENT_METHOD_PAYPAL
                    ]
                    : [
                        Constants.ORDER_PAYMENT_METHOD_PAYPAL
                    ]
            },
        };

        this.pmGetAllPlans = cancelablePromise(beehiveService.getAllPlans());
        this.pmGetAllPlans.promise
            .then((result) => {
                let dataObj = mapResponseToPlanDTO(result);

                if (this._isMounted) {
                    this.setState({
                        dataObj: dataObj,
                        paymentObj: paymentObj,
                        contactObj: contactObj,
                        isFetching: false,
                    });
                }

                // if have default value
                if (this.props.defaultPkg && this.props.defaultExp) {
                    const planObj = dataObj.plans.filter(
                        (plan) => plan.id == this.props.defaultPkg
                    )[0];
                    this.onStep1Completed(planObj, this.props.defaultExp);
                }
            })
            .catch((e) => {});
    }

    componentWillUnmount() {
        if (this.pmGetAllPlans) this.pmGetAllPlans.cancel();
    }
}

export const mapResponseToPlanDTO = (res) => {
    let planDTO = {};
    const lang = res.multiLanguage
    // // current plan
    // planDTO.currentPlan = {
    //     planId: 0, // -> trial
    //     daysLeft: 0
    // }

    // sale mapping
    planDTO.sales = {}

    const basicPrice = res.packagePrice.filter( pkg => {
        return pkg.packageId === res.packageInfo[0].packageId
    } )
    let monthPrice = []
    for (const pkgExp of res.packageExpired) {
        monthPrice.push(basicPrice.find (price => price.expiredId === pkgExp.expiredId))
    }

    // pricingPlans mapping
    planDTO.pricingPlans = res.packageExpired.map( (packageExp, index) => {

        // console.log(monthPrice[index], monthPrice[0])
        return {
            month: packageExp.time,
            saving: 100 - Math.round((monthPrice[index].price / monthPrice[0].price) * 100),
            expiredId: packageExp.expiredId
        }
    })

    planDTO.pricingPlans = planDTO.pricingPlans.sort( (a,b) => b.month - a.month)

    res.packageInfo = res.packageInfo.filter(pInfo => pInfo.packageId > 5);

    //plan mapping
    planDTO.plans = res.packageInfo.map( (pInfo, index) => {
        const currency = res.packagePrice[0].moneyUnit
        const currentPackage = res.packagePrice.filter(price => price.packageId === pInfo.packageId )

        let plans = {
            id: pInfo.packageId,
            level: index+1,
            name: lang[pInfo.packageTypeCode],
            images: {},
            currency: currency,
        }

        for (const pkg of currentPackage) {
            plans[`p${pkg.expiredId}`] = pkg.price
            plans[`tp${pkg.expiredId}`] = pkg.totalAmount
            plans[`sub${pkg.expiredId}`] = pkg.subTotal;
            let vat = _.find(pkg.taxes, (tax) => 'vat' === tax.name);
            plans[`vat${pkg.expiredId}`] = !!vat ? vat.amount : 0;
            plans[`vatrate${pkg.expiredId}`] = !!vat ? vat.rate : 0;
        }

        return plans
    })

    // console.log(planDTO.plans)


    planDTO.details = PackagePlanService.convertToLanguagePackage(CredentialUtils.getLangKey(), AgencyService.getDashboardName())

    return planDTO
}

PackageSteps.propTypes = {
    atPage: PropTypes.oneOf(['WIZARD', 'SETTING']).isRequired,
    defaultPkg: PropTypes.any,
    defaultExp: PropTypes.any
};

export default withRouter(PackageSteps);
