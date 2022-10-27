import React, {useEffect, useRef, useState} from 'react';
import './PaymentMethod.sass';
import {UikCheckbox, UikToggle, UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import {Trans} from "react-i18next";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import {Col, Row} from "reactstrap";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import storeService from "../../../services/StoreService";
import {GSToast} from "../../../utils/gs-toast";
import {BCOrderService} from "../../../services/BCOrderService";
import Constants from "../../../config/Constant";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import * as _ from 'lodash';
import $ from 'jquery';
import {SettingContext} from "../Setting";
import i18next from "i18next";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import GSTooltip, {GSTooltipPlacement} from "../../../components/shared/GSTooltip/GSTooltip";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import i18n from '../../../config/i18n';
import {FormValidate} from '../../../config/form-validate';
import {Tooltip} from 'react-tippy';
import PaypalConnector from './PaypalConnector';
import paymentService from '../../../services/PaymentService';
import storageService from '../../../services/storage';
import AvFieldCurrency from "../../../components/shared/AvFieldCurrency/AvFieldCurrency";
import DropdownSearchCheckbox from "../../theme/theme-making/sub-element-editor/shared/Dropdown-search-checkbox";
import beehiveService from "../../../services/BeehiveService";
import {OrderService} from "../../../services/OrderService";
import PaymentService from "../../../services/PaymentService";
import GSImg from "../../../components/shared/GSImg/GSImg";
import {CurrencyUtils} from "../../../utils/number-format";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {CredentialUtils} from "../../../utils/credential";
import PropTypes from "prop-types";
import {SHIPPING_AND_PAYMENT_PAGE} from "../ShippingAndPayment/ShippingAndPayment";

const VALIDATE_CURRENCY_PAYPAL = {
    MAX:99999999999,
    MIN:0
}

const SIZE_PER_PAGE = 30

const PaymentMethod = props => {
    const enableZaloPay = process.env.ENABLE_ZALOPAY === 'true'

    const refConfirmModal = useRef(null);
    const refAlertModal = useRef(null);
    const refSubmitConfigMomo = useRef(null);
    const refPaypalConnector = useRef(null)

    const [stIsFetching, setStIsFetching] = useState(true);
    const [stEnabledBankTransfer, setStEnabledBankTransfer] = useState(false);
    const [stEnabledSelfDelivery, setStEnabledSelfDelivery] = useState(false);
    const [stEnabledBankInfo, setStEnabledBankInfo] = useState(false);
    const [stEnabledCOD, setStEnabledCOD] = useState(false);
    const [stEnabledATM, setStEnabledATM] = useState(false);
    const [stEnabledVISA, setStEnabledVISA] = useState(false);
    const [stPaymentMethods, setStPaymentMethods] = useState([]);
    const [stEnabledCASH, setStEnabledCASH] = useState(false);
    const [stEnabledZALO, setStEnabledZALO] = useState(false);
    const [stEnabledMOMO, setStEnabledMOMO] = useState(false);
    const [stEnabledPRODUCT, setStEnabledPRODUCT] = useState(false);
    const [stEnabledSERVICE, setStEnabledSERVICE] = useState(false);
    const [stEnabledPAYPAL, setStEnabledPAYPAL] = useState(false);
    const [stUnconfirmPaypal, setStUnconfirmPaypal] = useState(null);
    const [stEnabledDEBT, setStEnabledDEBT] = useState(false);
    const [stOptionMethods, setStOptionMethods] = useState([]);
    const [stPaypalExchangeRate, setStPaypalExchangeRate] = useState(0);
    const [stClonePaypalExchangeRate, setStClonePaypalExchangeRate] = useState(0);
    const [stIsSelfRateUSD, setStIsSelfRateUSD] = useState(false);
    const [stIsErrorSelfRateUSD, setStIsErrorSelfRateUSD] = useState(false);

    const [stListSegment, setStListSegment] = useState([{id:"ALL", name: i18next.t('component.settings.payment.debt.allCustomers')}]);
    const [stSegmentPage, setStSegmentPage] = useState(0);
    const [stSegmentTotalPage, setStSegmentTotalPage] = useState(1);
    const [stListSegmentChecked, setStListSegmentChecked] = useState([]);
    const [stCheckSelfDelivery, setStCheckSelfDelivery] = useState(true);
    const [stDataConfigMomo, setStDataConfigMomo] = useState({
        id: null,
        partnerCode: '',
        accessKey: '',
        secretKey: ''
    })
    const [stIsValidConfigMomo, setStIsValidConfigMomo] = useState(false);
    const [stEnabledDisplayPaypalButton, setStEnabledDisplayPaypalButton] = useState(false);
    const [stIsSaving, setStIsSaving] = useState(false);

    useEffect(()=>{
        if(stCheckSelfDelivery) {
            setStCheckSelfDelivery(false)
            return;
        }
        if(stEnabledSelfDelivery) {
            return;
        }

        if (stEnabledDEBT) {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_DEBT)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_DEBT);
        }

        if (stEnabledBankTransfer) {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER);
        }

        setStPaymentMethods(stPaymentMethods);
        savePaymentSetting({
            paymentCode: stPaymentMethods.join(",")
        });

    },[stEnabledSelfDelivery])
    
    

    useEffect(()=>{
        const params = {
            page: stSegmentPage,
            size: SIZE_PER_PAGE,
        };
        beehiveService.getListSegmentWithKeyword(params).then(result=>{
            const totalListSegment = parseInt(result.headers["x-total-count"]);
            setStSegmentTotalPage(Math.ceil(totalListSegment / SIZE_PER_PAGE));
            setStListSegment(ls=>{
                return [...ls,...result.data.map(dt=>{
                    return {
                        id:dt.id,
                        name:dt.name
                    }
                })]
            })
        })
    },[stSegmentPage])

    useEffect( ()=>{
        OrderService.getListDebtSegment()
            .then(result=>{
                setStListSegmentChecked(result.segmentIds.split(','))
            })
            .catch(error=>{
                if(error.response.status == 404){
                    OrderService.updateListDebtSegment("ALL").then(()=>{
                        setStListSegmentChecked(['ALL'])
                })
                }
            })
    },[])


    useEffect(() => {
        props.value.setResetPaymentMethods(false);
        initPaymentSetting();
    }, [props.value.resetPaymentMethods]);

    useEffect(() => {
        fetchPaypalExchangeRate();
        fetchMultipleCurrencyWithRateFalse();

    }, [stEnabledPAYPAL])

    const getDataConfigMomo = (paymentMethods, enableMomo, enableSelf) => {
        PaymentService.getDataConfigPaymentMomo()
            .then(data => {
                if (enableMomo && !enableSelf){
                    _.remove(paymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_MOMO);
                    setStPaymentMethods(paymentMethods);
                    savePaymentSetting({
                        paymentCode: paymentMethods.join(",")
                    });
                }
                if (_.isEmpty(data)) {
                    if (enableMomo){
                        if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_MOMO)) {
                            return;
                        } else {
                            _.remove(paymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_MOMO);
                            setStPaymentMethods(paymentMethods);
                            savePaymentSetting({
                                paymentCode: paymentMethods.join(",")
                            });
                        }
                    } else {
                        setStDataConfigMomo({
                            ...stDataConfigMomo,
                            id: null,
                            partnerCode: '',
                            accessKey: '',
                            secretKey: '',
                        });
                    }
                }
                else {
                    setStDataConfigMomo(data)
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    const initPaymentSetting = () => {
        fetchSelfDelivery();
        fetchBankInformation();
    };

    const fetchGetListDebtSegment = async () => {
        const ListDebtSegment = await OrderService.getListDebtSegment();
        setStListSegmentChecked(ListDebtSegment.segmentIds.split(','))
    };

    const  fetchPaymentSetting = async (enableSelf) => {
        BCOrderService.getPaymentSetting()
            .then(paymentMethods => {
                if (paymentMethods && !_.isEmpty(paymentMethods.optionsCode)) {
                    setStOptionMethods(_.compact(paymentMethods.optionsCode.split(",")))
                    setStEnabledPRODUCT(paymentMethods.optionsCode.indexOf(Constants.ORDER_PAYMENT_OPTION_PRODUCT) > -1);
                    setStEnabledSERVICE(paymentMethods.optionsCode.indexOf(Constants.ORDER_PAYMENT_OPTION_SERVICE) > -1);
                    setStEnabledDisplayPaypalButton(paymentMethods.optionsCode.indexOf(Constants.ORDER_PAYMENT_OPTION_DISPLAY_BUTTON_PAYPAL) > -1);
                }else {
                    setStOptionMethods([])
                    setStEnabledPRODUCT(false);
                    setStEnabledSERVICE(false);
                    setStEnabledDisplayPaypalButton(false);
                }

                if (paymentMethods && !_.isEmpty(paymentMethods.paymentCode)) {
                    const checkEnabledMomo = paymentMethods.paymentCode.includes(Constants.ORDER_PAYMENT_METHOD_MOMO)
                    const checkPaymentMethods = _.compact(paymentMethods.paymentCode.split(","))
                    setStPaymentMethods(checkPaymentMethods);
                    setStEnabledBankTransfer(paymentMethods.paymentCode.indexOf(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER) > -1);
                    setStEnabledCOD(paymentMethods.paymentCode.indexOf(Constants.ORDER_PAYMENT_METHOD_COD) > -1);
                    setStEnabledATM(paymentMethods.paymentCode.indexOf(Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING) > -1);
                    setStEnabledVISA(paymentMethods.paymentCode.indexOf(Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD) > -1);
                    setStEnabledCASH(paymentMethods.paymentCode.includes(Constants.ORDER_PAYMENT_METHOD_CASH));
                    setStEnabledDEBT(paymentMethods.paymentCode.indexOf(Constants.ORDER_PAYMENT_METHOD_DEBT) > -1);
                    enableZaloPay && setStEnabledZALO(paymentMethods.paymentCode.includes(Constants.ORDER_PAYMENT_METHOD_ZALO));
                    setStEnabledMOMO(checkEnabledMomo);
                    getDataConfigMomo(checkPaymentMethods, checkEnabledMomo, enableSelf)

                    if (paymentMethods.paymentCode.indexOf(Constants.ORDER_PAYMENT_METHOD_PAYPAL) === -1) {
                        setStEnabledPAYPAL(false);
                    }
                    else {
                        PaymentService.getShopConnect().then(
                            result => {
                                setStUnconfirmPaypal(null);
                                switch (result.accountStatus) {
                                    case 'UNCONFIRMED':
                                        setStUnconfirmPaypal(result.merchantEmail);
                                    case 'DISABLED':
                                    case 'OFF':
                                        _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_PAYPAL);
                                        setStPaymentMethods(stPaymentMethods);
                                        setStEnabledPAYPAL(false);
                                        break;
                                    case 'ENABLED':
                                        setStEnabledPAYPAL(true);
                                        break;
                                }
                            },
                            error => console.debug(error)
                        );
                    }
                }
                else {
                    setStPaymentMethods([]);
                    setStEnabledCOD(false);
                    setStEnabledATM(false);
                    setStEnabledVISA(false);
                    setStEnabledCASH(false);
                    setStEnabledPAYPAL(false);
                    setStEnabledDEBT(false);
                    enableZaloPay && setStEnabledZALO(false);
                    setStEnabledMOMO(false);
                    setStEnabledBankTransfer(false)
                }
                setStIsFetching(false);
            })
            .catch(() => {
                setStIsFetching(false);
                GSToast.commonError();
            })
    };

    const fetchBankInformation = () => {
        storeService.getBankInfo()
            .then(bankInfos => {
                setStEnabledBankInfo(bankInfos && bankInfos.length > 0);
                setStIsFetching(false);
            })
            .catch(() => {
                setStIsFetching(false);
                GSToast.commonError();
            })
    };

    const fetchSelfDelivery = () => {
        storeService.getSelfDeliverySetting()
            .then(setting => {
                setStEnabledSelfDelivery(setting.enabled);
                setStIsFetching(false);
                fetchPaymentSetting(setting.enabled);
            })
            .catch(() => {
                setStIsFetching(false);
                GSToast.commonError();
            })
    };

    const fetchPaypalExchangeRate = () => {
        storeService.getCurrencyUSD(true)
            .then((result) => {
                setStPaypalExchangeRate(result);
            })
            .catch(() => {})
    }

    const fetchMultipleCurrencyWithRateFalse = () => {
        storeService.getMultipleCurrencyWithRateFalse()
            .then((result) => {
                if(result.selfRateUsd){
                    setStIsSelfRateUSD(true)
                }else {
                    setStIsSelfRateUSD(false)
                }

            })
            .catch(() => {})
    }

    const checkRequiredMinimumEnabledMethod = (newMethodEnabled) => {
        const productMethods = [Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
            Constants.ORDER_PAYMENT_METHOD_COD,
            Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
            Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
            Constants.ORDER_PAYMENT_METHOD_MOMO
        ]

        enableZaloPay && productMethods.push(Constants.ORDER_PAYMENT_METHOD_ZALO)

        const serviceMethods = [Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
            Constants.ORDER_PAYMENT_METHOD_CASH,
            Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
            Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
            Constants.ORDER_PAYMENT_METHOD_MOMO
        ]

        enableZaloPay && serviceMethods.push(Constants.ORDER_PAYMENT_METHOD_ZALO)

        return false
    }

    const onChangeEventDisplayPaypalButton = () => {

        if(!stEnabledDisplayPaypalButton){
            stOptionMethods.push(Constants.ORDER_PAYMENT_OPTION_DISPLAY_BUTTON_PAYPAL);
        }else {
            _.remove(stOptionMethods, x => x === Constants.ORDER_PAYMENT_OPTION_DISPLAY_BUTTON_PAYPAL);
        }
        let paymentCode = new Set()
        stPaymentMethods.forEach(c => {
            paymentCode.add(c)
        })
        saveDeliverySetting({
            paymentCode: [...paymentCode].join(","),
            optionsCode: stOptionMethods.join(",")
        });
    }

    const onChangeEnableBankTransfer = () => {
        if (!stEnabledBankTransfer) {
            if (!stEnabledSelfDelivery) {
                refAlertModal.current.openModal({
                    messages: <GSTrans t={'page.setting.shippingAndPayment.bankTransfer.selfDeliveryDisabled'}>
                        a<b>a</b>
                    </GSTrans>,
                    closeCallback: () => {
                        $('#provider-' + Constants.LogisticCode.Common.SELF_DELIVERY).get(0).scrollIntoView({
                            behavior: 'auto',
                            block: 'center',
                            inline: 'center'
                        });
                    }
                });
            } else if (!stEnabledBankInfo) {
                refConfirmModal.current.openModal({
                    messages: <GSTrans t={'page.setting.shippingAndPayment.bankTransfer.bankInfoEmpty'}>
                        a<b>a</b>
                    </GSTrans>,
                    okCallback: () => {
                        props.value.openBankInfoForBankTransfer(true);
                    },
                    cancelCallback: () => {

                    }
                });
            } else {
                stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER);
                setStPaymentMethods(stPaymentMethods);
                savePaymentSettingBankTransfer({
                    paymentCode: stPaymentMethods.join(",")
                });
            }
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)) {
                return;
            }
            refConfirmModal.current.openModal({
                messages: <GSTrans t={'page.setting.shippingAndPayment.bankTransfer.confirmDisabled'}>
                    a<b>a</b>
                </GSTrans>,
                okCallback: () => {
                    _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER);
                    setStPaymentMethods(stPaymentMethods);
                    savePaymentSettingBankTransfer({
                        paymentCode: stPaymentMethods.join(",")
                    });
                },
                cancelCallback: () => {

                }
            });
        }
    };

    const onChangeEnableZALO = () => {
        if (!stEnabledZALO) {
            stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_ZALO);
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_ZALO)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_ZALO);
        }
        setStPaymentMethods(stPaymentMethods);
        savePaymentSetting({
            paymentCode: stPaymentMethods.join(",")
        });
    };

    const onChangeEnableMOMO = () => {
        if (stDataConfigMomo.partnerCode == '' || stDataConfigMomo.accessKey == '' || stDataConfigMomo.secretKey == ''){
            setStIsValidConfigMomo(true)
            return;
        }

        if (!stEnabledMOMO) {
            if(stEnabledSelfDelivery){
                stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_MOMO);
                setStPaymentMethods(stPaymentMethods);
                savePaymentSetting({
                    paymentCode: stPaymentMethods.join(",")
                });
                GSToast.success('page.setting.paymentMethod.momo.enableSuccessful', true)
            }
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_MOMO)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_MOMO);
            setStPaymentMethods(stPaymentMethods);
            savePaymentSetting({
                paymentCode: stPaymentMethods.join(",")
            });
        }
    };

    const onChangeEnableCOD = () => {
        if (!stEnabledCOD) {
            stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_COD);
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_COD)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_COD);
        }
        setStPaymentMethods(stPaymentMethods);
        savePaymentSetting({
            paymentCode: stPaymentMethods.join(",")
        });
    };

    const onChangeEnableCash = () => {
        if (!stEnabledCASH) {
            stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_CASH);
        } else {
            if ( checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_CASH)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_CASH);
        }
        setStPaymentMethods(stPaymentMethods);
        savePaymentSetting({
            paymentCode: stPaymentMethods.join(",")
        });
    }

    const onChangeEnableATM = () => {
        if (!stEnabledATM) {
            stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING);
            setStPaymentMethods(stPaymentMethods);
            savePaymentSetting({
                paymentCode: stPaymentMethods.join(",")
            });
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING)) {
                return;
            }
            refConfirmModal.current.openModal({
                messages: <GSTrans t={'page.setting.shippingAndPayment.turn.off.atm'}>
                    a<b>a</b>
                </GSTrans>,
                okCallback: () => {
                    _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING);
                    setStPaymentMethods(stPaymentMethods);
                    savePaymentSetting({
                        paymentCode: stPaymentMethods.join(",")
                    });
                },
                cancelCallback: () => {

                }
            });
        }
    };

    const onChangeEnableVISA = () => {
        if (!stEnabledVISA) {
            stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD);
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD);
        }
        setStPaymentMethods(stPaymentMethods);
        savePaymentSetting({
            paymentCode: stPaymentMethods.join(",")
        });
    };

    const onChangeEnablePaypal = () => {
        if (stUnconfirmPaypal) {
            return;
        }
        const hasEnabledPaypal = !stEnabledPAYPAL;
        //user turn off paypal method
        if (!hasEnabledPaypal) {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_PAYPAL)) {
                return;
            }

            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_PAYPAL);
            //removed paypal method
            savePaymentSetting({
                paymentCode: stPaymentMethods.join(",")
            });
            setStEnabledPAYPAL(hasEnabledPaypal);
            setStPaymentMethods(stPaymentMethods);
            return;
        }
        if(!stEnabledSelfDelivery && hasEnabledPaypal) {
            return;
        }
        if(stIsSelfRateUSD && (stPaypalExchangeRate != null && (stPaypalExchangeRate <= VALIDATE_CURRENCY_PAYPAL.MIN) || (stPaypalExchangeRate >= VALIDATE_CURRENCY_PAYPAL.MAX))) {
            setStIsErrorSelfRateUSD(true)
            return;
        }
        if(!stIsSelfRateUSD && ((stClonePaypalExchangeRate <= VALIDATE_CURRENCY_PAYPAL.MIN) || (stClonePaypalExchangeRate >= VALIDATE_CURRENCY_PAYPAL.MAX))) {
            setStIsErrorSelfRateUSD(true)
            return;
        }
        if (hasEnabledPaypal) {
            let reconnect = false;
            paymentService.getShopConnect()
                .then(
                    result => {
                        if (!result.accountStatus || result.accountStatus === 'OFF') {
                            reconnect = true;
                        }
                    },
                    error => reconnect = true
                )
                .finally(() => {
                    paymentService.updateExchangeRatePaypal(stPaypalExchangeRate);
                    if (reconnect) {
                        //first updated exchanged rate
                        props.onChangePagePayPal(SHIPPING_AND_PAYMENT_PAGE.BENEFITS_PAYPAL)
                    }
                    else {
                        stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_PAYPAL);
                        let paymentCode = new Set()
                        stPaymentMethods.forEach(c => {
                            paymentCode.add(c)
                        })
                        //Add paypal method
                        savePaymentSetting({
                            paymentCode: [...paymentCode].join(",")
                        });
                        setStPaymentMethods(stPaymentMethods);
                        setStEnabledPAYPAL(true);
                    }
                });
        }
    };

    const onChangeEnableDebt = () => {
        if(!stEnabledSelfDelivery) {
            return;
        }

        if (!stEnabledDEBT) {
            stPaymentMethods.push(Constants.ORDER_PAYMENT_METHOD_DEBT);
        } else {
            if (checkRequiredMinimumEnabledMethod(Constants.ORDER_PAYMENT_METHOD_DEBT)) {
                return;
            }
            _.remove(stPaymentMethods, x => x === Constants.ORDER_PAYMENT_METHOD_DEBT);
        }
        setStPaymentMethods(stPaymentMethods);
        savePaymentSetting({
            paymentCode: stPaymentMethods.join(",")
        });


    };

    const showModalTurnOffAllProductMethods = () => {
        refAlertModal.current.openModal({
            messages: <GSTrans t={'page.setting.shippingAndPayment.turn.off.allMethods.product'}>
                a<b>a</b>
            </GSTrans>,
            type: AlertModalType.ALERT_TYPE_WARNING
        });
    }

    const showModalTurnOffAllServiceMethods = () => {
        refAlertModal.current.openModal({
            messages: <GSTrans t={'page.setting.shippingAndPayment.turn.off.allMethods.service'}>
                a<b>a</b>
            </GSTrans>,
            type: AlertModalType.ALERT_TYPE_WARNING
        });
    }

    const onChangeEnableProduct =()=>{
        if(!stEnabledPRODUCT){
            stOptionMethods.push(Constants.ORDER_PAYMENT_OPTION_PRODUCT);
            savePaymentSetting({
                paymentCode: stPaymentMethods.join(","),
                optionsCode: stOptionMethods.join(",")
            });
        }else {

            refConfirmModal.current.openModal({
                messages: <GSTrans t={'page.setting.shippingAndPayment.turn.off.product'}>
                    a<b>a</b>
                </GSTrans>,
                okCallback: () => {
                    _.remove(stOptionMethods, x => x === Constants.ORDER_PAYMENT_OPTION_PRODUCT);
                    savePaymentSetting({
                        paymentCode: stPaymentMethods.join(","),
                        optionsCode: stOptionMethods.join(",")
                    });

                },
                cancelCallback: () => {

                }
            });

        }

    }
    const onChangeEnableService =()=>{
        if(!stEnabledSERVICE){
            stOptionMethods.push(Constants.ORDER_PAYMENT_OPTION_SERVICE);
        }else {
            _.remove(stOptionMethods, x => x === Constants.ORDER_PAYMENT_OPTION_SERVICE);
        }

        savePaymentSetting({
            paymentCode: stPaymentMethods.join(","),
            optionsCode: stOptionMethods.join(",")
        });
    }

    const saveDeliverySetting = (data) => {
        BCOrderService.savePaymentSetting(data)
            .then(() => {
                fetchSelfDelivery();
                GSToast.success("common.message.update.successfully", true);
            })
            .catch((e) => {
                setStIsFetching(false);
                if (e.response.data.message === 'error.accessDenied'){
                    GSToast.error('page.setting.error.youDontPermissionFeature',true)
                    return
                }
                GSToast.error(i18next.t("common.api.failed"));
            })
    }

    const savePaymentSetting = (data) => {
        BCOrderService.savePaymentSetting(data)
            .then(() => {
                initPaymentSetting();
            })
            .catch((e) => {
                setStIsFetching(false);
                if (e.response.data.message === 'error.accessDenied'){
                    GSToast.error('page.setting.error.youDontPermissionFeature',true)
                    return
                }
                GSToast.error(i18next.t("common.api.failed"));
            })
    };

    const savePaymentSettingBankTransfer = (data) => {
        BCOrderService.savePaymentSetting(data)
            .then(() => {
                if (!stEnabledBankTransfer) {
                    GSToast.success('page.setting.paymentMethod.bankTransfer.enableSuccessful', true)
                }
                setStEnabledBankTransfer(!stEnabledBankTransfer);
                initPaymentSetting();
            })
            .catch((e) => {
                setStIsFetching(false);
                if (e.response.data.message === 'error.accessDenied'){
                    GSToast.error('page.setting.error.youDontPermissionFeature',true)
                    return
                }
                GSToast.error('page.setting.paymentMethod.bankTransfer.enableFail', true);
            })
    };

    const handleSubmitPaypalRate = (event, value)  => {
        console.assert("handle valid submit %o", value);
        event.preventDefault();
        paymentService.updateExchangeRatePaypal(stPaypalExchangeRate);
    }

    const onChangePaypalExchangeRate = (e) => {
        console.assert("change paypal exchange rate");
        setStIsErrorSelfRateUSD(false)
        const value = CurrencyUtils.getLocalStorageCountry() === Constants.CURRENCY.VND.COUNTRY ?
            parseInt(e.currentTarget.value) : parseFloat(e.currentTarget.value).toFixed(5)
        setStClonePaypalExchangeRate(value)
        setStPaypalExchangeRate(value);
        if(value > VALIDATE_CURRENCY_PAYPAL.MIN && value < VALIDATE_CURRENCY_PAYPAL.MAX){
            storeService.updateCurrencyUSD(value)
                .then((result) => {
                    setStClonePaypalExchangeRate(+(value))
                    fetchPaypalExchangeRate()
                    if(!stIsSelfRateUSD){
                        fetchMultipleCurrencyWithRateFalse()
                    }
                    GSToast.commonUpdate()
                })
                .catch(() => {})
        }
    }

    const hanleGetPage = (page) =>{
        if(page < stSegmentTotalPage){
            setStSegmentPage(page)
        }
    }

    const hanleGetData = (data) =>{
        OrderService.updateListDebtSegment(data.join(",")).then(()=>{
            fetchGetListDebtSegment()
            GSToast.commonUpdate();
        })
            .catch(()=>{
                GSToast.commonError()
            })
    }

    const hanleGetValueSearch = (value) =>{
        const params = {
            page: 0,
            size: SIZE_PER_PAGE,
            'name.contains' : value

        };
        beehiveService.getListSegmentWithKeyword(params).then(result=>{
            const totalListSegment = parseInt(result.headers["x-total-count"]);
            setStSegmentTotalPage(Math.ceil(totalListSegment / SIZE_PER_PAGE));
            setStListSegment([{id:"ALL", name: i18next.t('component.settings.payment.debt.allCustomers')},...result.data.map(dt=>{
                return {
                    id:dt.id,
                    name:dt.name
                }
            })])
        })
    }

    const handleValidConfigMomo = () => {
        const data = {
            id: stDataConfigMomo.id,
            storeId: CredentialUtils.getStoreId(),
            partnerCode: stDataConfigMomo.partnerCode,
            accessKey: stDataConfigMomo.accessKey,
            secretKey: stDataConfigMomo.secretKey
        }
        if (stDataConfigMomo.partnerCode == '' || stDataConfigMomo.accessKey == '' || stDataConfigMomo.secretKey == ''){
            setStIsValidConfigMomo(true)
        } else {
            setStIsSaving(true)

            if(!(stDataConfigMomo.id)){
                PaymentService.createDataConfigPaymentMomo(data)
                    .then(e =>{
                        getDataConfigMomo()
                        setStIsSaving(false)
                        GSToast.commonCreate()
                    } )
                    .catch(err => {
                        setStIsFetching(false);
                        GSToast.commonError()
                    })
            } else {
                PaymentService.updateDataConfigPaymentMomo(data)
                    .then(e => {
                        GSToast.commonCreate()
                        setStIsSaving(false)
                    })
                    .catch(err => GSToast.commonError())
            }
        }
    }

    const renderInsidePaymentForm = () => {
        return (
            <>
                {/*ATM*/}
                <div className="setting__payment-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/payment_method/icon-local-ATM.svg"}
                                 alt={'Local ATM'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"page.setting.shippingAndPayment.localATM"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                        <GSTrans t="page.setting.shippingAndPayment.ForProductAndService"/>
                                                    </span>
                            </div>
                        </div>
                        <div onClick={() => {
                            onChangeEnableATM()
                        }}>
                            <UikToggle
                                defaultChecked={stEnabledATM}
                                className="m-0 p-0"
                                key={stEnabledATM}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            />
                        </div>
                    </div>
                </div>
                {/*CREDIT CARD*/}
                <div className="setting__payment-wrapper">
                    <div className="d-flex credit-container">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex align-items-center">
                                <div className="d-flex align-items-center">
                                    <img className="payment__method-image"
                                         src={"/assets/images/payment_method/icon-credit-card.svg"}
                                         alt={'Credit card'}
                                         height={'20'}
                                    />
                                    <div className=" ml-2">
                                        <h6 className="mb-0">
                                            <GSTrans t={"page.setting.shippingAndPayment.creditCard"}/>
                                        </h6>
                                        <span className="color-gray font-size-_8em">
                                                        <GSTrans t="page.setting.shippingAndPayment.ForProductAndService"/>
                                                    </span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center logo-container">
                                    <div className={"logo jcb"}>
                                        <img className="payment__method-image"
                                             src={"/assets/images/payment_method/logo-JCB.png"}
                                             alt={'Credit card'}
                                             height={'20'}
                                        />
                                    </div>
                                    <div className={"logo visa"}>
                                        <img className="payment__method-image"
                                             src={"/assets/images/payment_method/logo-VISA.png"}
                                             alt={'Credit card'}
                                             height={'20'}
                                        />
                                    </div>
                                    <div className={"logo mastercard"}>
                                        <img className="payment__method-image"
                                             src={"/assets/images/payment_method/logo-mastercard.png"}
                                             alt={'Credit card'}
                                             height={'20'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div onClick={() => {
                                onChangeEnableVISA()
                            }}>
                                <UikToggle
                                    defaultChecked={stEnabledVISA}
                                    className="m-0 p-0"
                                    key={stEnabledVISA}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/*COD*/}
                <div className="setting__payment-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/payment_method/icon-COD.svg"}
                                 alt={'COD'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"page.setting.shippingAndPayment.cod"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                <GSTrans t="page.setting.paymentMethod.cod.subTitle"/>
                                            </span>
                            </div>

                        </div>
                        {/*<PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>*/}
                        <div onClick={() => {
                            onChangeEnableCOD()
                        }}>
                            <UikToggle
                                defaultChecked={stEnabledCOD}
                                className="m-0 p-0"
                                key={stEnabledCOD}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            />
                        </div>
                        {/*</PrivateComponent>*/}
                    </div>
                </div>
                {/*CASH ON THE SPOT*/}
                <div className="setting__payment-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/cash.svg"}
                                 alt={'CASH ON THE SPOT'}
                                 height={'20'}
                            />
                            <div className="ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"page.setting.paymentMethod.cashPayOnTheSpot"}/>
                                    <GSTooltip message={i18next.t('page.setting.paymentMethod.cashPayOnTheSpot.hint')}/>
                                </h6>
                                <span className="color-gray  font-size-_8em">
                                                <GSTrans t="page.setting.paymentMethod.cashPayOnTheSpot.subTitle"/>
                                            </span>
                            </div>
                        </div>
                        {/*<PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0217]}>*/}
                        <div onClick={() => {
                            onChangeEnableCash()
                        }}>
                            <UikToggle
                                defaultChecked={stEnabledCASH}
                                className="m-0 p-0"
                                key={stEnabledCASH}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            />
                        </div>
                        {/*</PrivateComponent>*/}
                    </div>
                </div>
                {/*MOMO*/}
                <div className={["setting__payment-wrapper"].join(' ')}>
                    <div className="d-flex justify-content-between align-items-center pb-3">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/payment_method/momo_gray.png"}
                                 alt={'COD'}
                                 height={'25'}
                            />
                            <div className=" ml-2">
                                <div className='tittle-momo d-flex align-items-center'>
                                    <h6 className="mb-0">
                                        <GSTrans t={"page.setting.shippingAndPayment.momo"}/>
                                    </h6>
                                    <GSTooltip placement={GSTooltipPlacement.BOTTOM}
                                               message={i18next.t('page.setting.shippingAndPayment.momo.tooltip')}/>
                                </div>
                                <span className="color-gray font-size-_8em">
                                                <GSTrans t="page.setting.shippingAndPayment.ForProductAndService"/>
                                            </span>
                            </div>

                        </div>
                        {!stEnabledSelfDelivery ?
                            <Tooltip arrow
                                     position={"top-end"}
                                     title={i18next.t("page.setting.shippingAndPayment.momo.tooltipToggle")}>
                                <div onClick={() => {
                                    onChangeEnableMOMO()
                                }}>
                                    <UikToggle
                                        defaultChecked={stEnabledMOMO}
                                        className="m-0 p-0"
                                        key={stEnabledMOMO}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                    />
                                </div>
                            </Tooltip>
                            :
                            <div onClick={() => {
                                onChangeEnableMOMO()
                            }}>
                                <UikToggle
                                    defaultChecked={stEnabledMOMO}
                                    className="m-0 p-0"
                                    key={stEnabledMOMO}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                />
                            </div>
                        }
                    </div>
                    <UikWidgetContent className="momo__wrapper">
                        <AvForm onValidSubmit={handleValidConfigMomo}>
                            <button ref={refSubmitConfigMomo} hidden/>
                            <div className='row'>
                                <div className='col-md-6 col-12'>
                                    <AvField
                                        type="text"
                                        name="partnerCode"
                                        className={stIsValidConfigMomo ? 'border-error' : ''}
                                        label={i18next.t("page.setting.shippingAndPayment.momo.partnerCode")}
                                        placeholder={i18next.t("page.setting.shippingAndPayment.momo.placeholder.partnerCode")}
                                        onChange={(e) => {
                                            setStIsValidConfigMomo(false)
                                            setStDataConfigMomo({
                                                ...stDataConfigMomo,
                                                partnerCode: e.currentTarget.value,
                                            });
                                        }}
                                        value={stDataConfigMomo.partnerCode}
                                    />
                                    {stIsValidConfigMomo &&
                                    <div className='invalid-feedback-error'>{i18next.t("common.validation.required")}</div>
                                    }
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-md-6 col-12'>
                                    <AvField
                                        type="text"
                                        name="accessKey"
                                        className={stIsValidConfigMomo ? 'border-error' : ''}
                                        label={i18next.t("page.setting.shippingAndPayment.momo.accessKey")}
                                        placeholder={i18next.t("page.setting.shippingAndPayment.momo.placeholder.accessKey")}
                                        onChange={(e) => {
                                            setStDataConfigMomo({
                                                ...stDataConfigMomo,
                                                accessKey: e.currentTarget.value,
                                            });
                                        }}
                                        value={stDataConfigMomo.accessKey}
                                    />
                                    {stIsValidConfigMomo &&
                                    <div className='invalid-feedback-error'>{i18next.t("common.validation.required")}</div>
                                    }
                                </div>
                                <div className='col-md-6 col-12'>
                                    <AvField
                                        type="text"
                                        name="secretKey"
                                        className={stIsValidConfigMomo ? 'border-error' : ''}
                                        label={i18next.t("page.setting.shippingAndPayment.momo.secretKey")}
                                        placeholder={i18next.t("page.setting.shippingAndPayment.momo.placeholder.secretKey")}
                                        onChange={(e) => {
                                            setStDataConfigMomo({
                                                ...stDataConfigMomo,
                                                secretKey: e.currentTarget.value,
                                            });
                                        }}
                                        value={stDataConfigMomo.secretKey}
                                    />
                                    {stIsValidConfigMomo &&
                                    <div className='invalid-feedback-error'>{i18next.t("common.validation.required")}</div>
                                    }
                                </div>
                            </div>
                        </AvForm>
                        <UikWidgetContent className="gs-widget__content">
                            <GSButton primary className=" setting_btn_save"
                                      onClick={() => refSubmitConfigMomo.current.click()}>
                                <Trans i18nKey="common.btn.save"/>
                            </GSButton>
                        </UikWidgetContent>
                    </UikWidgetContent>
                </div>
                {/*DEBT*/}
                <div className="setting__payment-wrapper">

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={stEnabledDEBT?
                                     "/assets/images/logo-payment-debt.png"
                                     :"/assets/images/logo-payment-debt-grey.png"}
                                 alt={'debt'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"component.settings.payment.debt"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                        <GSTrans t="component.settings.payment.debt.content"/>
                                                    </span>
                            </div>
                        </div>

                        {!stEnabledSelfDelivery ?
                            <Tooltip arrow
                                     position={"top-end"}
                                     title={i18next.t("component.settings.payment.debt.selfDelivery")}>
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                                    <div onClick={() => {
                                        onChangeEnableDebt()
                                    }}>
                                        <UikToggle
                                            defaultChecked={stEnabledDEBT}
                                            className="m-0 p-0"
                                            key={stEnabledDEBT}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                        />

                                    </div>
                                </PrivateComponent>
                            </Tooltip>
                            :
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                                <div onClick={() => {
                                    onChangeEnableDebt()
                                }}>
                                    <UikToggle
                                        defaultChecked={stEnabledDEBT}
                                        className="m-0 p-0"
                                        key={stEnabledDEBT}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                    />

                                </div>
                            </PrivateComponent>
                        }

                    </div>
                    {stEnabledDEBT &&
                    <div>
                        <div>
                            <Row>
                                <Col md={12} className="mt-2 d-flex align-items-center pl-4">
                                    <div className="d-flex">
                                        <strong className="m-0">
                                            <GSTrans t={"component.settings.payment.debt.selectCustomers"}></GSTrans>
                                        </strong>
                                        <GSTooltip message={i18next.t('component.settings.payment.debt.tooltip')}/>
                                    </div>

                                    <DropdownSearchCheckbox
                                        listDataCheckbox = {stListSegment}
                                        listDataChecked = {stListSegmentChecked}
                                        setPage = {hanleGetPage}
                                        setData = {hanleGetData}
                                        setValueSearch = {hanleGetValueSearch}
                                        page = {stSegmentPage}
                                    />

                                </Col>
                            </Row>
                        </div>
                    </div>
                    }
                </div>
                {/*PAYPAL*/}
                <div className="setting__payment-wrapper">

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={stEnabledPAYPAL?
                                     "/assets/images/payment_method/paypal.png"
                                     :"/assets/images/payment_method/paypal-gray.png"}
                                 alt={'paypal'}
                                 height={'25'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans
                                        t={"page.setting.shippingAndPayment.paypal"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                <GSTrans t="page.setting.shippingAndPayment.paypal.desc"/>
                                            </span>
                            </div>
                        </div>

                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                            {!stEnabledSelfDelivery ?
                                <Tooltip arrow
                                         position={"top-end"}
                                         title={i18next.t("page.setting.shippingAndPayment.paypal.tooltip")}>
                                    <div onClick={() => {
                                        onChangeEnablePaypal()
                                    }}>
                                        <UikToggle
                                            defaultChecked={stEnabledPAYPAL}
                                            className="m-0 p-0"
                                            key={stEnabledPAYPAL}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            disabled={stUnconfirmPaypal}
                                        />
                                    </div>
                                </Tooltip>
                                :
                                <div onClick={() => {
                                    onChangeEnablePaypal()
                                }}>
                                    <UikToggle
                                        defaultChecked={stEnabledPAYPAL}
                                        className="m-0 p-0"
                                        key={stEnabledPAYPAL}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                        disabled={stUnconfirmPaypal}
                                    />
                                </div>
                            }

                        </PrivateComponent>
                    </div>
                    { CurrencyUtils.getLocalStorageCurrency() !== 'USD' &&
                    <div>
                        <Row className="pl-3">
                            <Col md={11} className={"bank-condition paypal"}>
                                <div className={"mb-2"} style={{
                                    display: "flex",
                                    flexFlow: "row nowrap",
                                    justifyContent: "flex-start",
                                    alignItems: "baseline"
                                }}>
                                    <strong><GSTrans t={"page.setting.shippingAndPayment.paypal.exchangeRate"}>
                                    </GSTrans>
                                    </strong>
                                    <GSTooltip message={i18next.t('page.setting.shippingAndPayment.paypal.exchangeRate.tooltip')}/>
                                    <span className="ml-2 mr-2"> 1 USD = </span>
                                    <div>
                                        <AvForm onValidSubmit={handleSubmitPaypalRate} autoComplete="off">
                                            <AvFieldCurrency
                                                className={stEnabledPAYPAL? "user-event-disabled":""}
                                                name={"paypalExchangeRate"}
                                                placeHolder={i18n.t("page.setting.shippingAndPayment.paypal.exchangeRate.hint")}
                                                value={stIsSelfRateUSD ? stPaypalExchangeRate : stClonePaypalExchangeRate}
                                                onChange={(e) => {
                                                    onChangePaypalExchangeRate(e)
                                                }}
                                                validate={{
                                                    ...FormValidate.required(),
                                                    ...FormValidate.maxValue(99999999999)
                                                }}
                                                precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '2'}
                                                decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 2}
                                            />
                                        </AvForm>
                                        {!stIsSelfRateUSD && stIsErrorSelfRateUSD &&
                                        <p className="mb-0 mt-1"
                                           style={{fontSize: "12px",color: "#dc3545", width: "200px"}}>
                                            {i18next.t('page.setting.shippingAndPayment.paypal.exchangeRate.input.enable')}
                                        </p>}
                                    </div>
                                    <span className="ml-2 mr-2">{CurrencyUtils.getLocalStorageCurrency()}</span>
                                </div>
                            </Col>
                        </Row>
                        {stUnconfirmPaypal &&
                        <Row className="pl-3">
                            <Col md={11} className={"paypal-error"}>
                                <GSImg
                                    className=''
                                    src='/assets/images/icon-mail-error.svg'
                                    alt='mail-error'
                                    width={26}
                                    height={26}
                                />
                                <span>
                                                    <GSTrans t='page.setting.shippingAndPayment.paypal.error'
                                                             values={{
                                                                 x: stUnconfirmPaypal
                                                             }}
                                                    />
                                                </span>
                            </Col>
                        </Row>
                        }
                    </div>
                    }
                    <div className={"mb-2"} style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "flex-start",
                        alignItems: "baseline"
                    }}>
                        <div className="d-flex align-items-center">
                            <UikCheckbox
                                checked={stEnabledDisplayPaypalButton}
                                onClick={() => onChangeEventDisplayPaypalButton()}
                                className="custom-check-box m-0"
                                disabled={!stEnabledPAYPAL}
                            />
                            <span className="color-gray font-size-_8em">
                                            <GSTrans t="page.setting.display.paypal.button"/>
                                        </span>
                        </div>
                    </div>
                </div>
                {/*BANK TRANSFER*/}
                <div className="setting__payment-wrapper">

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/payment_method/icon-bank-transfer.svg"}
                                 alt={'bank transfer'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans
                                        t={"page.setting.shippingAndPayment.bankTransfer"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                        <GSTrans t="page.setting.shippingAndPayment.ForProductAndService"/>
                                                    </span>
                            </div>
                        </div>
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                            <div onClick={() => {
                                onChangeEnableBankTransfer()
                            }}>
                                <UikToggle
                                    defaultChecked={stEnabledBankTransfer}
                                    className="m-0 p-0"
                                    key={stEnabledBankTransfer}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                />

                            </div>
                        </PrivateComponent>

                    </div>
                    <div>
                        <div>
                            <Row>
                                <Col md={6} className={"bank-desc"}>
                                    <GSTrans t={"page.setting.shippingAndPayment.bankTransfer.desc"}/>
                                </Col>
                                <Col md={6} className={"bank-condition"}>
                                    <div className={"mb-2"}>
                                        {stEnabledSelfDelivery && <img className="payment__method-image"
                                                                       src={"/assets/images/payment_method/icon-success-active.svg"}
                                                                       alt={'bank transfer'}
                                                                       height={'22'}
                                        />}
                                        {!stEnabledSelfDelivery && <img className="payment__method-image"
                                                                        src={"/assets/images/payment_method/icon-success-inactive.svg"}
                                                                        alt={'bank transfer'}
                                                                        height={'22'}
                                        />}
                                        <GSTrans
                                            t={"page.setting.shippingAndPayment.bankTransfer.selfDelivery"}>a<span className="blue">a</span></GSTrans>
                                    </div>
                                    <div>
                                        {stEnabledBankInfo && <img className="payment__method-image"
                                                                   src={"/assets/images/payment_method/icon-success-active.svg"}
                                                                   alt={'bank transfer'}
                                                                   height={'22'}
                                        />}
                                        {!stEnabledBankInfo && <img className="payment__method-image"
                                                                    src={"/assets/images/payment_method/icon-success-inactive.svg"}
                                                                    alt={'bank transfer'}
                                                                    height={'22'}
                                        />}
                                        <GSTrans
                                            t={"page.setting.shippingAndPayment.bankTransfer.bankInfo"}>a<span className="blue">a</span></GSTrans>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const renderOutsidePaymentForm = () => {
        return (
            <>
                {/*COD*/}
                <div className="setting__payment-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/payment_method/icon-COD.svg"}
                                 alt={'COD'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"page.setting.shippingAndPayment.cod"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                <GSTrans t="page.setting.paymentMethod.cod.subTitle"/>
                                            </span>
                            </div>

                        </div>
                        {/*<PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>*/}
                        <div onClick={() => {
                            onChangeEnableCOD()
                        }}>
                            <UikToggle
                                defaultChecked={stEnabledCOD}
                                className="m-0 p-0"
                                key={stEnabledCOD}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            />
                        </div>
                        {/*</PrivateComponent>*/}
                    </div>
                </div>
                {/*CASH ON THE SPOT*/}
                <div className="setting__payment-wrapper">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/cash.svg"}
                                 alt={'CASH ON THE SPOT'}
                                 height={'20'}
                            />
                            <div className="ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"page.setting.paymentMethod.cashPayOnTheSpot"}/>
                                    <GSTooltip message={i18next.t('page.setting.paymentMethod.cashPayOnTheSpot.hint')}/>
                                </h6>
                                <span className="color-gray  font-size-_8em">
                                                <GSTrans t="page.setting.paymentMethod.cashPayOnTheSpot.subTitle"/>
                                            </span>
                            </div>
                        </div>
                        {/*<PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0217]}>*/}
                        <div onClick={() => {
                            onChangeEnableCash()
                        }}>
                            <UikToggle
                                defaultChecked={stEnabledCASH}
                                className="m-0 p-0"
                                key={stEnabledCASH}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            />
                        </div>
                        {/*</PrivateComponent>*/}
                    </div>
                </div>
                {/*DEBT*/}
                <div className="setting__payment-wrapper">

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={stEnabledDEBT?
                                     "/assets/images/logo-payment-debt.png"
                                     :"/assets/images/logo-payment-debt-grey.png"}
                                 alt={'debt'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans t={"component.settings.payment.debt"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                        <GSTrans t="component.settings.payment.debt.content"/>
                                                    </span>
                            </div>
                        </div>

                        {!stEnabledSelfDelivery ?
                            <Tooltip arrow
                                     position={"top-end"}
                                     title={i18next.t("component.settings.payment.debt.selfDelivery")}>
                                <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                                    <div onClick={() => {
                                        onChangeEnableDebt()
                                    }}>
                                        <UikToggle
                                            defaultChecked={stEnabledDEBT}
                                            className="m-0 p-0"
                                            key={stEnabledDEBT}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                        />

                                    </div>
                                </PrivateComponent>
                            </Tooltip>
                            :
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                                <div onClick={() => {
                                    onChangeEnableDebt()
                                }}>
                                    <UikToggle
                                        defaultChecked={stEnabledDEBT}
                                        className="m-0 p-0"
                                        key={stEnabledDEBT}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                    />

                                </div>
                            </PrivateComponent>
                        }

                    </div>
                    {stEnabledDEBT &&
                    <div>
                        <div>
                            <Row>
                                <Col md={12} className="mt-2 d-flex align-items-center pl-4">
                                    <div className="d-flex">
                                        <strong className="m-0">
                                            <GSTrans t={"component.settings.payment.debt.selectCustomers"}></GSTrans>
                                        </strong>
                                        <GSTooltip message={i18next.t('component.settings.payment.debt.tooltip')}/>
                                    </div>

                                    <DropdownSearchCheckbox
                                        listDataCheckbox = {stListSegment}
                                        listDataChecked = {stListSegmentChecked}
                                        setPage = {hanleGetPage}
                                        setData = {hanleGetData}
                                        setValueSearch = {hanleGetValueSearch}
                                        page = {stSegmentPage}
                                    />

                                </Col>
                            </Row>
                        </div>
                    </div>
                    }
                </div>
                {/*PAYPAL*/}
                <div className="setting__payment-wrapper">

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={stEnabledPAYPAL?
                                     "/assets/images/payment_method/paypal.png"
                                     :"/assets/images/payment_method/paypal-gray.png"}
                                 alt={'paypal'}
                                 height={'25'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans
                                        t={"page.setting.shippingAndPayment.paypal"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                <GSTrans t="page.setting.shippingAndPayment.paypal.desc"/>
                                            </span>
                            </div>
                        </div>

                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                            {!stEnabledSelfDelivery ?
                                <Tooltip arrow
                                         position={"top-end"}
                                         title={i18next.t("page.setting.shippingAndPayment.paypal.tooltip")}>
                                    <div onClick={() => {
                                        onChangeEnablePaypal()
                                    }}>
                                        <UikToggle
                                            defaultChecked={stEnabledPAYPAL}
                                            className="m-0 p-0"
                                            key={stEnabledPAYPAL}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            disabled={stUnconfirmPaypal}
                                        />
                                    </div>
                                </Tooltip>
                                :
                                <div onClick={() => {
                                    onChangeEnablePaypal()
                                }}>
                                    <UikToggle
                                        defaultChecked={stEnabledPAYPAL}
                                        className="m-0 p-0"
                                        key={stEnabledPAYPAL}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                        disabled={stUnconfirmPaypal}
                                    />
                                </div>
                            }

                        </PrivateComponent>
                    </div>
                    {CurrencyUtils.getLocalStorageCurrency() !== 'USD' &&
                    <div>
                        <Row className="pl-3">
                            <Col md={11} className={"bank-condition paypal"}>
                                <div className={"mb-2"} style={{
                                    display: "flex",
                                    flexFlow: "row nowrap",
                                    justifyContent: "flex-start",
                                    alignItems: "baseline"
                                }}>
                                    <strong><GSTrans t={"page.setting.shippingAndPayment.paypal.exchangeRate"}>
                                    </GSTrans>
                                    </strong>
                                    <GSTooltip
                                        message={i18next.t('page.setting.shippingAndPayment.paypal.exchangeRate.tooltip')}/>
                                    <span className="ml-2 mr-2"> 1 USD = </span>
                                    <div>
                                        <AvForm onValidSubmit={handleSubmitPaypalRate} autoComplete="off">
                                            <AvFieldCurrency
                                                className={stEnabledPAYPAL ? "user-event-disabled" : ""}
                                                name={"paypalExchangeRate"}
                                                placeHolder={i18n.t("page.setting.shippingAndPayment.paypal.exchangeRate.hint")}
                                                value={stIsSelfRateUSD ? stPaypalExchangeRate : stClonePaypalExchangeRate}
                                                onChange={(e) => {
                                                    onChangePaypalExchangeRate(e)
                                                }}
                                                validate={{
                                                    ...FormValidate.required(),
                                                    ...FormValidate.maxValue(99999999999)
                                                }}
                                                precision={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && '5'}
                                                decimalScale={CurrencyUtils.isCurrencyInput(CurrencyUtils.getLocalStorageSymbol()) && 5}
                                            />
                                        </AvForm>
                                        {!stIsSelfRateUSD && stIsErrorSelfRateUSD &&
                                        <p className="mb-0 mt-1"
                                           style={{fontSize: "12px", color: "#dc3545", width: "200px"}}>
                                            {i18next.t('page.setting.shippingAndPayment.paypal.exchangeRate.input.enable')}
                                        </p>}
                                    </div>
                                    <span className="ml-2 mr-2">{CurrencyUtils.getLocalStorageCurrency()}</span>
                                </div>
                            </Col>
                        </Row>
                        {stUnconfirmPaypal &&
                        <Row className="pl-3">
                            <Col md={11} className={"paypal-error"}>
                                <GSImg
                                    className=''
                                    src='/assets/images/icon-mail-error.svg'
                                    alt='mail-error'
                                    width={26}
                                    height={26}
                                />
                                <span>
                                                    <GSTrans t='page.setting.shippingAndPayment.paypal.error'
                                                             values={{
                                                                 x: stUnconfirmPaypal
                                                             }}
                                                    />
                                                </span>
                            </Col>
                        </Row>
                        }
                    </div>
                    }
                    <div className={"mb-2"} style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "flex-start",
                        alignItems: "baseline"
                    }}>
                        <div className="d-flex align-items-center">
                            <UikCheckbox
                                checked={stEnabledDisplayPaypalButton}
                                onClick={() => onChangeEventDisplayPaypalButton()}
                                className="custom-check-box m-0"
                                disabled={!stEnabledPAYPAL}
                            />
                            <span className="color-gray font-size-_8em">
                                            <GSTrans t="page.setting.display.paypal.button"/>
                                        </span>
                        </div>
                    </div>
                </div>
                {/*BANK TRANSFER*/}
                <div className="setting__payment-wrapper">

                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img className="payment__method-image"
                                 src={"/assets/images/payment_method/icon-bank-transfer.svg"}
                                 alt={'bank transfer'}
                                 height={'20'}
                            />
                            <div className=" ml-2">
                                <h6 className="mb-0">
                                    <GSTrans
                                        t={"page.setting.shippingAndPayment.bankTransfer"}/>
                                </h6>
                                <span className="color-gray font-size-_8em">
                                                        <GSTrans t="page.setting.shippingAndPayment.ForProductAndService"/>
                                                    </span>
                            </div>
                        </div>
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}>
                            <div onClick={() => {
                                onChangeEnableBankTransfer()
                            }}>
                                <UikToggle
                                    defaultChecked={stEnabledBankTransfer}
                                    className="m-0 p-0"
                                    key={stEnabledBankTransfer}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                />

                            </div>
                        </PrivateComponent>

                    </div>
                    <div>
                        <div>
                            <Row>
                                <Col md={6} className={"bank-desc"}>
                                    <GSTrans t={"page.setting.shippingAndPayment.bankTransfer.desc"}/>
                                </Col>
                                <Col md={6} className={"bank-condition"}>
                                    <div className={"mb-2"}>
                                        {stEnabledSelfDelivery && <img className="payment__method-image"
                                                                       src={"/assets/images/payment_method/icon-success-active.svg"}
                                                                       alt={'bank transfer'}
                                                                       height={'22'}
                                        />}
                                        {!stEnabledSelfDelivery && <img className="payment__method-image"
                                                                        src={"/assets/images/payment_method/icon-success-inactive.svg"}
                                                                        alt={'bank transfer'}
                                                                        height={'22'}
                                        />}
                                        <GSTrans
                                            t={"page.setting.shippingAndPayment.bankTransfer.selfDelivery"}>a<span className="blue">a</span></GSTrans>
                                    </div>
                                    <div>
                                        {stEnabledBankInfo && <img className="payment__method-image"
                                                                   src={"/assets/images/payment_method/icon-success-active.svg"}
                                                                   alt={'bank transfer'}
                                                                   height={'22'}
                                        />}
                                        {!stEnabledBankInfo && <img className="payment__method-image"
                                                                    src={"/assets/images/payment_method/icon-success-inactive.svg"}
                                                                    alt={'bank transfer'}
                                                                    height={'22'}
                                        />}
                                        <GSTrans
                                            t={"page.setting.shippingAndPayment.bankTransfer.bankInfo"}>a<span className="blue">a</span></GSTrans>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>

            </>
        )
    }

    return (
        <>
            <AlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmModal}/>
            <GSContentContainer className="payment__method" isLoading={stIsFetching} loadingZIndex={1051} isSaving={stIsSaving}>
                <UikWidget className="gs-widget">
                    <UikWidgetHeader className="gs-widget__header">
                        <div>
                            <Trans i18nKey="page.setting.shippingAndPayment.payment">
                                Payment Method
                            </Trans>
                        </div>
                        <div className="d-flex align-items-center">
                            <UikCheckbox
                                checked={stEnabledPRODUCT}
                                onClick={() => onChangeEnableProduct()}
                                className="custom-check-box m-0"
                            />
                            <Trans i18nKey="component.themeEditor.subElement.collectionType.BUSINESS_PRODUCT">
                                Product
                            </Trans>
                        </div>
                        <div className="d-flex align-items-center">
                            <UikCheckbox
                                checked={stEnabledSERVICE}
                                onClick={() => onChangeEnableService()}
                                className="custom-check-box m-0"
                            />
                            <Trans i18nKey="component.themeEditor.subElement.collectionType.SERVICE">
                                Service
                            </Trans>
                        </div>
                        <div>

                        </div>
                        <div>
                        </div>

                    </UikWidgetHeader>

                    <UikWidgetContent className="gs-widget__content">
                        <div className="setting__payment_method">
                            { CurrencyUtils.getLocalStorageSymbol() === 'đ' && renderInsidePaymentForm()}
                            { CurrencyUtils.getLocalStorageSymbol() !== 'đ' && renderOutsidePaymentForm()}
                        </div>
                    </UikWidgetContent>
                </UikWidget>
            </GSContentContainer>
            <PaypalConnector ref={refPaypalConnector}/>
        </>
    )
}

PaymentMethod.prototype = {
    onChangePagePaypal: PropTypes.func,
    defaultEnabledBenefitsPayPal: PropTypes.bool,
}

const WithContext = (Component) => {
    return (props) => (
        <SettingContext.Consumer>
            {value =>  <Component {...props} value={value} />}
        </SettingContext.Consumer>
    )
}


export default WithContext(PaymentMethod);

