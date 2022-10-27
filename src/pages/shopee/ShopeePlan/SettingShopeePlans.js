import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import { UikWidget, UikWidgetContent, UikWidgetHeader } from "../../../@uik";
import { Trans } from "react-i18next";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import React, { useState } from "react";
import i18next from "i18next";
import Constants from "../../../config/Constant";
import * as queryString from "query-string";
import { GSToast } from "../../../utils/gs-toast";
import { withRouter } from "react-router-dom";
import ShopeePlansStep1 from "./Step1/ShopeePlansStep1";
import ShopeePlansStep2 from "./Step2/ShopeePlansStep2";
import { PaymentUtils } from "../../../utils/payment-utils";
import GSPackagePlanProgressBar from "../../../components/shared/GSPackagePlanProgressBar/GSPackagePlanProgressBar";

const SettingShopeePlans = (props) => {
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stCurrentStep, setStCurrentStep] = useState(1);
    const [stContactObj, setStContactObj] = useState({
        descriptions: "",
        email: "cskh@gosell.vn",
        hotLine: "02873030800",
    });

    const [stBillObj, setStBillObj] = useState({});

    const [stPaymentObj, setStPaymentObj] = useState(
        PaymentUtils.getPaymentObj()
    );

    const queryParams = queryString.parse(props.location.search);
    const renewId = queryParams["renewId"] ? queryParams["renewId"] : undefined;
    const [stRenewId, setStRenewId] = useState(renewId);

    const onChangeStep = (step) => {
        setStCurrentStep(step);
    };

    const onStep1Completed = (bill) => {
        setStBillObj(bill);
        setStCurrentStep(2);
    };

    const onStep1InCompleted = () => {
        GSToast.commonError();
    };

    const renderStep = (step) => {
        switch (step) {
            case 1:
                return (
                    <ShopeePlansStep1
                        paymentObj={stPaymentObj}
                        onPaymentCompleted={onStep1Completed}
                        onPaymentInCompleted={onStep1InCompleted}
                        renewId={stRenewId}
                    />
                );
            case 2:
                return (
                    <ShopeePlansStep2
                        contactObj={stContactObj}
                        billObj={stBillObj}
                        paymentObj={stPaymentObj}
                    />
                );
        }
    };

    return (
        <GSContentContainer isLoading={stIsFetching}>
            <GSContentHeader
                title={i18next.t("shopee.page.plans.title")}
            ></GSContentHeader>
            <GSContentBody size={GSContentBody.size.EXTRA}>
                <UikWidget className="gs-widget">
                    <UikWidgetHeader className="gs-widget__header">
                        <Trans i18nKey="shopee.page.plans.pricingTitle"></Trans>
                    </UikWidgetHeader>
                    <UikWidgetContent className="gs-widget__content">
                        <GSPackagePlanProgressBar
                            steps={Constants.PACKAGE_PLAN_STEP.SHOPEE}
                            currentStep={stCurrentStep}
                            disabledChangeStep={2}
                            onChangeStep={onChangeStep}
                        />
                        {renderStep(stCurrentStep)}
                    </UikWidgetContent>
                </UikWidget>
            </GSContentBody>
        </GSContentContainer>
    );
};

export default withRouter(SettingShopeePlans);
