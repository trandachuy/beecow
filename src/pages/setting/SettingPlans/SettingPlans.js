/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, { Component } from "react";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import { UikWidget, UikWidgetContent, UikWidgetHeader } from "../../../@uik";
import { Trans } from "react-i18next";
import SettingPlansStep1 from "./Step1/SettingPlansStep1";
import SettingPlansStep2 from "./Step2/SettingPlansStep2";
import SettingPlansStep3 from "./Step3/SettingPlansStep3";
import jquery from "jquery";
import "./SettingPlans.sass";
import beehiveService from "../../../services/BeehiveService";
import Constants from "../../../config/Constant";
import { cancelablePromise } from "../../../utils/promise";
import { CredentialUtils } from "../../../utils/credential";
import { AgencyService } from "../../../services/AgencyService";
import { PackagePlanService } from "../../../components/shared/PackageRegister/PackageSteps/package-plan";
import * as queryString from "query-string";
import _ from "lodash";
import { PaymentUtils } from "../../../utils/payment-utils";
import GSPackagePlanProgressBar from "../../../components/shared/GSPackagePlanProgressBar/GSPackagePlanProgressBar";

class SettingPlans extends Component {
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

    constructor(props) {
        super(props);

        this.renderStep = this.renderStep.bind(this);
        this.changeStep = this.changeStep.bind(this);
        this.onStep1Completed = this.onStep1Completed.bind(this);
        this.onChangeStep = this.onChangeStep.bind(this);
        this.onStep2Completed = this.onStep2Completed.bind(this);
        this.onStep3PayAgain = this.onStep3PayAgain.bind(this);

        //let { packageId } = useParams();
        //console.log(packageId)

        // do not change the parameter name, it effect to the mail paramter
        const queryParams = queryString.parse(this.props.location.search);
        const currentStep = queryParams["currentStep"]
            ? queryParams["currentStep"]
            : undefined;
        const packageId = queryParams["packageId"]
            ? queryParams["packageId"]
            : undefined;
        const expiredId = queryParams["expiredId"]
            ? queryParams["expiredId"]
            : undefined;

        this.state = {
            withParam: currentStep ? true : false,
            currentStep: currentStep ? currentStep : 1,
            isFetching: true,
            dataObj: null,
            selectedPlan: null,
            selectedPricingPlan: 2,
            paymentObj: null,
            billObj: null,
            contactObj: null,
            currentPlan: null,
        };
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
                        currentPlan={this.state.currentPlan}
                        onPaymentCompleted={this.onStep2Completed}
                        onBack={() => this.changeStep(1)}
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

        this.setState({
            selectedPlan: plan,
            selectedPricingPlan: pricingPlan,
            currentStep: 2,
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
        this.setState({
            billObj: bill,
            currentStep: 3,
        });
    }

    onStep3PayAgain(pricingPlan) {
        this.setState({
            currentStep: 2,
            selectedPricingPlan: pricingPlan,
        });
    }

    changeStep(step) {
        this.setState({
            currentStep: step,
        });
    }

    render() {
        return (
            <GSContentContainer isLoading={this.state.isFetching} className='setting-plans'>
                <GSContentHeader
                    title={i18next.t("page.setting.plans.title")}
                ></GSContentHeader>
                {this.state.dataObj &&
                    this.state.paymentObj &&
                    this.state.contactObj && (
                        <GSContentBody size={GSContentBody.size.EXTRA}>
                            <UikWidget className="gs-widget">
                                <UikWidgetHeader className="gs-widget__header">
                                    <Trans i18nKey="page.setting.plans.pickPlansTitle"></Trans>
                                </UikWidgetHeader>
                                <UikWidgetContent className="gs-widget__content">
                                    <GSPackagePlanProgressBar
                                        steps={
                                            Constants.PACKAGE_PLAN_STEP.GOSELL
                                        }
                                        currentStep={this.state.currentStep}
                                        disabledChangeStep={3}
                                        onChangeStep={this.changeStep}
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
        this.setState({
            currentStep: step,
        });
    }

    componentDidMount() {
        this._isMounted = true;
        this.pmCurrentPlan = cancelablePromise(beehiveService.getCurrentPlan());

        this.pmCurrentPlan.promise
            .then((result) => {
                const currentPlan = result;
                // this.setState({
                //     isFetching: false,
                //     // Account status
                //     accountStatus: accountStatus,
                //     // Current plan
                //     currentPlanInfo: {
                //         regTime: currentPlan.userFeature.registerPackageDate,
                //         expTime: currentPlan.userFeature.expiredPackageDate,
                //         current: currentPlan.packageName,
                //         pkgType: currentPlan.userFeature.packagePay
                //     }
                // });
                CredentialUtils.setRegTime(
                    currentPlan.userFeature.registerPackageDate
                );
                CredentialUtils.setExpiredTimeInMS(
                    currentPlan.userFeature.expiredPackageDate
                );
                CredentialUtils.setPackageName(currentPlan.packageName);
                CredentialUtils.setPackageType(
                    currentPlan.userFeature.packagePay
                );
                CredentialUtils.setPackageId(currentPlan.userFeature.packageId);
            })
            .catch(() => {});

        const contactObj = {
            descriptions: "",
            email: "cskh@gosell.vn",
            hotLine: "02873030800",
        };

        const paymentObj = PaymentUtils.getPaymentObj();

        this.pmGetAllPlans = cancelablePromise(beehiveService.getAllPlans());
        this.pmGetAllPlans.promise
            .then((result) => {
                let dataObj = mapResponseToPlanDTO(result);

                if (this._isMounted) {
                    if (this.state.withParam) {
                        const queryParams = queryString.parse(
                            this.props.location.search
                        );
                        const packageId = queryParams["packageId"]
                            ? Number(queryParams["packageId"])
                            : undefined;
                        const expiredId = queryParams["expiredId"]
                            ? Number(queryParams["expiredId"])
                            : undefined;
                        const planObj = dataObj.plans.filter(
                            (p) => p.id === packageId
                        )[0];
                        this.setState({
                            selectedPlan: planObj,
                            selectedPricingPlan: expiredId,
                            currentStep: 2,
                            currentPlan: planObj,
                        });
                    }

                    this.setState({
                        dataObj: dataObj,
                        paymentObj: paymentObj,
                        contactObj: contactObj,
                        isFetching: false,
                    });
                }

                // // using for test
                // this.setState({
                //     selectedPlan: dataObj.plans[1]
                // })
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

    const basicPrice = res.packagePrice.filter(pkg => {
        return pkg.packageId === res.packageInfo[0].packageId
    })
    let monthPrice = []
    for (const pkgExp of res.packageExpired) {
        monthPrice.push(basicPrice.find(price => price.expiredId === pkgExp.expiredId))
    }

    // pricingPlans mapping
    planDTO.pricingPlans = res.packageExpired.map((packageExp, index) => {

        // console.log(monthPrice[index], monthPrice[0])
        return {
            month: packageExp.time,
            saving: 100 - Math.round((monthPrice[index].price / monthPrice[0].price) * 100),
            expiredId: packageExp.expiredId
        }
    })

    planDTO.pricingPlans = planDTO.pricingPlans.sort((a, b) => b.month - a.month)

    res.packageInfo = res.packageInfo.filter(pInfo => pInfo.packageId > 5);

    //plan mapping
    planDTO.plans = res.packageInfo.map((pInfo, index) => {
        const currency = res.packagePrice[0].moneyUnit
        const currentPackage = res.packagePrice.filter(price => price.packageId === pInfo.packageId)

        let plans = {
            id: pInfo.packageId,
            level: index + 1,
            name: lang[pInfo.packageTypeCode],
            images: {},
            currency: currency,
        }

        for (const pkg of currentPackage) {
            plans[`p${pkg.expiredId}`] = pkg.price
            plans[`tp${pkg.expiredId}`] = pkg.totalAmount;
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

SettingPlans.propTypes = {};

export default SettingPlans;
