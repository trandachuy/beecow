/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/06/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import beehiveService from "../../../services/BeehiveService";
import {cPromise} from "../../../utils/promise";
import i18next, {mapResponseToPlanDTO} from "../../setting/SettingPlans/SettingPlans";
import SettingPlansStep2 from "../../setting/SettingPlans/Step2/SettingPlansStep2";
import Constants from "../../../config/Constant";
import SettingPlansStep3 from "../../setting/SettingPlans/Step3/SettingPlansStep3";
import WizardLayout from "./layout/WizardLayout";

const bankTransferContent = `${i18next.t('page.order.list.group.orderId')} - ${
        i18next.language === "vi"
            ? "Số điện thoại của bạn"
            : "Your phone number"
      }`
const paymentObj = {
    bankTransfer: {
        accountOwner: 'CÔNG TY TNHH MEDIASTEP SOFWARE VIỆT NAM',
        accountNumber: '04201015009138',
        bank: 'Maritime Bank',
        branch: 'Đô Thành',
        content: bankTransferContent
    },
    bankTransferNonVn: {
        bankName: 'Joint Stock Commercial Bank for Foreign Trade of Vietnam',
        swiftCode: 'BFTVVNVX',
        accountHolderName: 'CTY TNHH MEDIASTEP SOFTWARE VIET NAM',
        accountNumber: '0331370480531',
        content: bankTransferContent
    },
    online: {
        methods: [Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING, Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD
            // , Constants.ORDER_PAYMENT_METHOD_ZALO
        ]
    }
}
const contactObj = {
    descriptions: '',
    email: 'cskh@gosell.vn',
    hotLine: '02873030800'
}
const STEP = {
    CHOOSE_PACKAGE_PRICE: 2,
    COMPLETED: 3
}


const StepPayment = props => {
    // Get from redux store
    // const {store, warnings, pkgId, expId} = useSelector( state => state.registerInfo)

    const pkgId = 1
    const expId = 2
    const [stPackages, setPackages] = useState(null);
    const [stSelectedPackages, setSelectedPackages] = useState(null);
    const [stSelectedExpired, setSelectedExpired] = useState(expId);
    const [stCurrentStep, setCurrentStep] = useState(2);
    const [stBillObj, setBillObj] = useState(null);


    useEffect(() => {
        const pmGetPackages = cPromise(beehiveService.getAllPlans())
        pmGetPackages.promise
            .then(result => {
                const planDTO = mapResponseToPlanDTO(result)
                setPackages(planDTO)
                setSelectedPackages(planDTO.plans[pkgId])
                setCurrentStep(STEP.CHOOSE_PACKAGE_PRICE)
            })
            .catch(e => {
            })

        return () => {
            pmGetPackages.cancel()
        };
    }, []);

    const onPaymentCompleted = (billObj) => {
        setBillObj(billObj)
    }

    const onPayAgain = (expId) => {
        setSelectedExpired(expId)
        setCurrentStep(STEP.CHOOSE_PACKAGE_PRICE)
    }

    const renderStep = (step) => {
        switch (step) {
            case STEP.CHOOSE_PACKAGE_PRICE:
                return (<SettingPlansStep2
                    dataObj={stPackages}
                    selectedPlan={stSelectedPackages}
                    selectedPricingPlan={stSelectedExpired}
                    paymentObj={paymentObj}
                    onPaymentCompleted={onPaymentCompleted}
                />)
            case STEP.COMPLETED:
                return(
                    <SettingPlansStep3
                        billObj={stBillObj}
                        selectedPlan={stSelectedPackages}
                        onPayAgain={onPayAgain}
                        contactObj={contactObj}
                    />
                )
            default:
                return null
        }
    }

    return (
        <WizardLayout>
            {stPackages && stSelectedPackages &&
                renderStep(stCurrentStep)
            }
        </WizardLayout>
    );
};


StepPayment.propTypes = {

};

export default StepPayment;
