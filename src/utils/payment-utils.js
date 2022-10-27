import Constants from "../config/Constant";
import i18next from "i18next";
import {CredentialUtils} from "./credential";

const getPaymentObj = () => {
    const enableZaloPay = process.env.ENABLE_ZALOPAY === "true";
    const enableMomo = process.env.ENABLE_MOMO === "true";
    const bankTransferContent = `${i18next.t('page.order.list.group.orderId')} - ${
        i18next.language === "vi"
            ? "Số điện thoại của bạn"
            : "Your phone number"
    }`;
    const paymentObj = {
        bankTransfer: {
            accountOwner: "CÔNG TY TNHH MEDIASTEP SOFTWARE VIỆT NAM",
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
            currentOnlineMethod: CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM ?
                Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD : Constants.ORDER_PAYMENT_METHOD_PAYPAL,
            methods: CredentialUtils.getStoreCountryCode() === Constants.CountryCode.VIETNAM
                ? [
                    Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
                    Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
                    Constants.ORDER_PAYMENT_METHOD_PAYPAL
                ]
                : [
                    Constants.ORDER_PAYMENT_METHOD_PAYPAL
                ],
            paymentProvider: {
                VNPAY: [
                    Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
                    Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD
                ],
                PAYPAL: [
                    Constants.ORDER_PAYMENT_METHOD_PAYPAL
                ]
            }
        },
    };

    enableZaloPay &&
    paymentObj.online.methods.push(Constants.ORDER_PAYMENT_METHOD_ZALO);
    enableMomo &&
    paymentObj.online.methods.push(Constants.ORDER_PAYMENT_METHOD_MOMO);

    return paymentObj;
};

const getPaymentProvider = (paymentMethod) => {
    let paymentProvider = '';
    if (PaymentUtils.getPaymentObj().online.paymentProvider.VNPAY.includes(paymentMethod)){
        paymentProvider = process.env.PAYMENT_PROVIDER
    }else  if (PaymentUtils.getPaymentObj().online.paymentProvider.PAYPAL.includes(paymentMethod)){
        paymentProvider = paymentMethod;
    }
    return paymentProvider;
}

export const PaymentUtils = {
    getPaymentObj,
    getPaymentProvider
}
