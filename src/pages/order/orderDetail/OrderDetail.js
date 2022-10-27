/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React from 'react'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import i18next from 'i18next'
import {UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../@uik'
import {Trans} from 'react-i18next'
import './OrderDetail.sass'
import {OrderService} from '../../../services/OrderService'
import {SaleChannelTag} from '../../../components/shared/SaleChannelTag/SaleChannelTag'
import ItemRow from './ItemRow/ItemRow'
import {CurrencyUtils, NumberUtils} from '../../../utils/number-format'
import {ItemService} from '../../../services/ItemService'
import ModalConfirmReadyToShip from './ReadyToShipConfirm/ModalConfirmReadyToShip'
import Constants from '../../../config/Constant'
import ModalCancelOrderConfirm from './ModalCancelOrderConfirm/ModalCancelOrderConfirm'
import ModalCancelShopeeOrderConfirm from './ModalCancelShopeeOrderConfirm/ModalCancelShopeeOrderConfirm'
import ModalReadyToShipShopeeConfirm from './ModelReadyToShipShopeeConfirm/ModalReadyToShipShopeeConfirm'
import ModalCancelLadazaOrderConfirm from './ModalCancelLazadaOrderConfirm/ModalCancelLadazaOrderConfirm'
import ModalReadyToShipLazadaConfirm from './ModelReadyToShipLazadaConfirm/ModalReadyToShipLazadaConfirm'
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen'
import {GSToast} from '../../../utils/gs-toast'
import {RouteUtils} from '../../../utils/route'
import shopeeService from '../../../services/ShopeeService'
import * as _ from 'lodash'
import GSButton from '../../../components/shared/GSButton/GSButton'
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import {OrderDetailUtils} from '../../../utils/order-detail-utils'
import GSSelectPrintSizeModal from '../../../components/shared/GSSelectPrintSizeModal/GSSelectPrintSizeModal'
import {KEY_PRINT_K80} from '../instorePurchase/complete/OrderInStorePurchaseComplete'
import storeService from '../../../services/StoreService'
import storageService from '../../../services/storage'
import {TokenUtils} from '../../../utils/token'
import {AgencyService} from '../../../services/AgencyService'
import {DateTimeUtils} from '../../../utils/date-time'
import moment from 'moment'
import {BCOrderService} from '../../../services/BCOrderService'
import beehiveService from '../../../services/BeehiveService'
import {Link} from 'react-router-dom'
import {NAV_PATH} from '../../../components/layout/navigation/Navigation'
import {lazadaService} from '../../../services/LazadaService'
import SelectImeiModal from './SelectImeiModal/SelectImeiModal'
import paymentService from '../../../services/PaymentService'
import OrderHistory from './OrderHistory/OrderHistory'
import ConfirmPaymentModal from '../../../components/shared/ConfirmPaymentModal/ConfirmPaymentModal'
import GSTable from '../../../components/shared/GSTable/GSTable'
import GSFakeLink from '../../../components/shared/GSFakeLink/GSFakeLink'
import {AddressUtils} from '../../../utils/address-utils'
import ModalRefund from './ModalRefund/ModalRefund';
import ModalTrackingCode from './ModalTrackingCode/ModalTrackingCode';
import Printer from '../orderPrint/template/Printer'
import OrderA4HTML from '../orderPrint/template/OrderA4HTML'
import OrderA4Template from '../orderPrint/template/OrderA4Template'
import {OrderInStorePurchaseContextService} from '../instorePurchase/context/OrderInStorePurchaseContextService'
import OrderKPosHTML from '../orderPrint/template/OrderKPosHTML'
import OrderKPosTemplate from '../orderPrint/template/OrderKPosTemplate'
import {bool} from "prop-types";

const PRINT_TYPE = {
    SHIPPING_LABEL: 'SHIPPING_LABEL',
    ORDER_RECEIPT: 'ORDER_RECEIPT'
}

const PAY_TYPE = {
    PAID: 'PAID',
    UNPAID: 'UNPAID',
    PARTIAL: 'PARTIAL',
    REFUNDED: 'REFUNDED',
    PARTIAL_REFUNDED: 'PARTIAL_REFUNDED',
}

export const ORDER_TYPE = {
    NORMAL: 'normal',
    DEPOSIT: 'deposit'
}

const STATUS_TYPE = {
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
}

const lzd_client_id = process.env.LAZADA_CLIENT_ID;
export default class OrderDetail extends React.Component {
    _isMounted = false;
    state = {
        orderObj: null,
        isFetching: true,
        billingAddress: '',
        shippingAddress: '',
        items: [],
        dimensions: {
            length: 1,
            width: 1,
            height: 1
        },
        siteCode: null,
        isLoadingScreen: false,
        isSaving: false,
        orderType: ORDER_TYPE.DEPOSIT, // default hide paid status on init
        isTogglePrintSizeModal: false,
        printType: PRINT_TYPE.SHIPPING_LABEL,
        printSize: KEY_PRINT_K80,
        shippingInfo: null,
        storeInfo: {},
        user: {
            customerName: undefined,
            email: undefined,
            customerPhone: undefined
        },
        branches: [],
        selectedLanguage: 'vi',
        customContent: {},
        information: '',
        branch: [],
        checkDownUp: null,
        modalPaymentConfirmation: false,
        paymentHistioryList: [],
        customerProfile: {},
        debt: null,
        isOpenModalSelectImei: false,
        currentOrderItem: null,
        transactionId: "",
        getDebtAmount: 0,
        exchangeRate: 0,
        refundStatus: "",
        isPaid: false,
        paymentMethod: '',
        trackingCode: '',
        selfShippingProviderName: '',
        carrierCode:'',
        isConfirm: '',
        returnOrderDetailList: []
    };
    siteCode = null;
    orderId = null;
    currency = '';


    constructor(props) {
        super(props);

        this.const = {
            UI_DATE_FORMAT: "DD-MM-YYYY",
            SERVER_DATE_FORMAT: "YYYY-MM-DD",
        };

        this.buildAddress = this.buildAddress.bind(this);
        this.renderOrderStatus = this.renderOrderStatus.bind(this);
        this.onClickReadyToShip = this.onClickReadyToShip.bind(this);
        this.loadPackageDimensions = this.loadPackageDimensions.bind(this);
        this.onClickCancelOrder = this.onClickCancelOrder.bind(this);
        this.refetchOrder = this.refetchOrder.bind(this);
        this.renderCancelButton = this.renderCancelButton.bind(this);
        this.onClickCancelShopeeOrder = this.onClickCancelShopeeOrder.bind(this);
        this.onClickCancelLazadaOrder = this.onClickCancelLazadaOrder.bind(this);
        this.renderReadyToShipButton = this.renderReadyToShipButton.bind(this);
        this.renderPrintButton = this.renderPrintButton.bind(this);
        this.renderEditButton = this.renderEditButton.bind(this);
        this.renderRefundPayPal = this.renderRefundPayPal.bind(this);
        this.onClickPrintShopee = this.onClickPrintShopee.bind(this);
        this.onClickPrint = this.onClickPrint.bind(this);
        this.onClickReadyToShipShopee = this.onClickReadyToShipShopee.bind(this);
        this.onClickReadyToShipLazada = this.onClickReadyToShipLazada.bind(this);
        this.onClickRejectBuyerCancel = this.onClickRejectBuyerCancel.bind(this);
        this.onClickAcceptBuyerCancel = this.onClickAcceptBuyerCancel.bind(this);
        this.handleOrderCallback = this.handleOrderCallback.bind(this);
        this.renderDeliveredButton = this.renderDeliveredButton.bind(this);
        this.onClickPrintReceipt = this.onClickPrintReceipt.bind(this)
        this.getStoreInfoForPrinter = this.getStoreInfoForPrinter.bind(this);
        this.renderEarnPoint = this.renderEarnPoint.bind(this);
        this.togglePrintReceiptModal = this.togglePrintReceiptModal.bind(this);
        this.handlePrintReceipt = this.handlePrintReceipt.bind(this);
        this.checkLzdConnectivity = this.checkLzdConnectivity.bind(this);
        this.validateQuantityImeiItem = this.validateQuantityImeiItem.bind(this);
        this.selectImeiCallback = this.selectImeiCallback.bind(this);
        this.selectOrderItemCallback = this.selectOrderItemCallback.bind(this);
        this.removeInvalidImeiItemCallback = this.removeInvalidImeiItemCallback.bind(this);
        this.selectImeiModalCancel = this.selectImeiModalCancel.bind(this);
        this.selectImeiModalSave = this.selectImeiModalSave.bind(this);
        this.togglePaymentConfirmation = this.togglePaymentConfirmation.bind(this)
        this.handleConfirmPayment = this.handleConfirmPayment.bind(this)
        this.renderReadyToShip = this.renderReadyToShip.bind(this)
        this.refPrintReceiptRef = React.createRef()
        this.refLzdConfirmModal = React.createRef()
    }

    componentDidMount() {
        this._isMounted = true;
        let {siteCode, orderId} = this.props.match.params;

        siteCode = siteCode.toUpperCase();
        // if site is GOMUA -> change to BEECOW to match previous logic
        if (siteCode === Constants.SITE_CODE_GOMUA) {
            siteCode = Constants.SITE_CODE_BEECOW
        }

        this.siteCode = siteCode;
        this.orderId = orderId;

        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);

        Promise.all([
            OrderService.getOrderDetail(siteCode, orderId),
            storeService.getStorefrontInfo(storeId),
            storeService.getFullStoreBranches(0, 9999),
            paymentService.getPaymentPayPal(orderId, siteCode),
            OrderService.getReturnOrderDetailByIds(orderId, siteCode)
        ])
            .then(([orderDetail, storeInfo, lsBranches, transactionId, returnOrderDetail]) => {


                const {data} = lsBranches;
                const {billingInfo, customerInfo, items, orderInfo, shippingInfo, storeBranch} = orderDetail;

                if (customerInfo.userId) {
                    let channel = Constants.SaleChannels.GOSELL
                        this.fetchCustomerProfile(customerInfo.userId)
                            .then(({saleChannel}) => {
                                this.fetchCustomerOrderSummary(customerInfo.userId, saleChannel)
                            })
                            .catch(() => {
                                this.fetchCustomerOrderSummary(customerInfo.userId, channel)
                            })
                }

                if (orderDetail.orderInfo.isInStore || orderDetail.orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_DEBT) {
                    BCOrderService.getPaymentHistiory(orderId)
                        .then((paymentHistiory) => {
                            this.setState({
                                paymentHistioryList: paymentHistiory
                            })
                        })
                }

                if (orderInfo.loyaltyPoint && siteCode == Constants.SITE_CODE_GOSELL) {
                    const getPoint = async () => {
                        const {value, expiredDay} = await OrderService.getEarningPoint(orderId, 'ORDER')
                        orderInfo.earnPoint = value
                        if (expiredDay) {
                            orderInfo.expiredDay = DateTimeUtils.formatDDMMYYY(expiredDay)
                        }
                    }
                    getPoint()
                }
                this.setState({
                    branches: data,
                });
                const orderBranchId = storeBranch ? storeBranch.id : null;
                const branch = data.filter(x => x.id === orderBranchId);
                if (TokenUtils.isStaff() && _.isEmpty(branch)) {
                    return RouteUtils.toNotFound(this.props);
                }
                if (this._isMounted) {

                    switch (siteCode) {
                        case Constants.SITE_CODE_GOSELL:
                        case Constants.SITE_CODE_BEECOW:
                            if (billingInfo["address1"]) {
                                this.buildAddress('billingAddress',
                                    billingInfo["address1"],
                                    billingInfo["district"],
                                    billingInfo["ward"],
                                    billingInfo["country"],
                                    billingInfo["countryCode"],
                                    {
                                        address2: billingInfo["address2"],
                                        city: billingInfo["outSideCity"],
                                        zipCode: billingInfo["zipCode"]
                                    }
                                );
                            }

                            if (shippingInfo["address1"]) {
                                this.buildAddress('shippingAddress',
                                    shippingInfo["address1"],
                                    shippingInfo["district"],
                                    shippingInfo["ward"],
                                    shippingInfo["country"],
                                    billingInfo["countryCode"],
                                    {
                                        address2: billingInfo["address2"],
                                        city: billingInfo["outSideCity"],
                                        zipCode: billingInfo["zipCode"]
                                    }
                                );
                            }

                            this.loadPackageDimensions(orderDetail);
                            // check deposit item
                            let depositItems = items.filter(item => {
                                const {deposit} = item
                                return deposit
                            })
                            this.setState({
                                orderType: depositItems.length === 0 ? ORDER_TYPE.NORMAL : ORDER_TYPE.DEPOSIT
                            })
                            break;
                        case Constants.SITE_CODE_LAZADA:
                            this.setState((state) => ({
                                billingAddress: billingInfo.address1,
                                shippingAddress: shippingInfo.address1,

                            }));
                            this.setState({
                                orderType: ORDER_TYPE.NORMAL
                            })
                            this.checkLzdConnectivity();
                            break;
                        case Constants.SITE_CODE_SHOPEE:
                            this.setState((state) => ({
                                billingAddress: billingInfo.address1,
                                shippingAddress: shippingInfo.address1,

                            }));
                            this.setState({
                                orderType: ORDER_TYPE.NORMAL
                            })
                            break
                    }

                    this.currency = CurrencyUtils.getLocalStorageSymbol();
                    orderDetail.items.forEach(x => {
                        x.orderItemId = x.id;
                        x.imeiSerial = x?.orderItemIMEIs?.length > 0 ? x.orderItemIMEIs.map(imei => imei.imeiSerial) : [];
                    })
                    orderDetail.orderInfo.receivedAmount ||= 0
                    orderDetail.shippingInfo = !orderInfo.deliveryName && !shippingInfo.address1
                        ? {
                            ...shippingInfo,
                            method: 'IN_STORE'
                        }
                        : {
                            ...shippingInfo,
                            method: 'DELIVERY',
                            amount: orderInfo.shippingFee,
                            deliveryName: orderInfo.deliveryName
                        }

                    this.setState({
                        transactionId: transactionId?.transactionId,
                        exchangeRate: transactionId?.exchangeRate,
                        orderObj: orderDetail,
                        refundStatus: orderDetail.orderInfo?.refundStatus,
                        trackingCode: orderDetail.orderInfo?.trackingCode,
                        selfShippingProviderName: orderDetail.orderInfo?.selfShippingProviderName,
                        carrierCode: orderDetail.orderInfo?.carrierCode,
                        isPaid: orderDetail.orderInfo?.paid,
                        paymentMethod: orderDetail.orderInfo?.paymentMethod,
                        dept: orderDetail.orderInfo.debtAmount,
                        isFetching: false,
                        siteCode: siteCode,
                        shippingInfo: orderDetail.shippingInfo,
                        storeInfo: storeInfo,
                        user: {
                            customerName: customerInfo.name, // customerInfo.name,
                            email: customerInfo.email,
                            customerPhone: customerInfo.phone // customerInfo.phone
                        },
                        branch,
                    })
                }
                if (returnOrderDetail) {
                    this.setState({
                        returnOrderDetailList: returnOrderDetail
                    })
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    fetchCustomerProfile(userId) {
        const saleChannels = [...Constants.SALE_CHANNEL_LIST]
        const onFetch = () => Promise.resolve()
            .then(() => {
                if (!saleChannels.length) {
                    return Promise.reject(false)
                }
                const saleChannel = saleChannels.shift()
                return Promise.all([
                    beehiveService.getCustomerProfile(userId, saleChannel),
                    saleChannel
                ])
            })
            .then(([customerProfile, saleChannel]) => {
                this.setState({
                    customerProfile: customerProfile,
                })
                return {
                    customerProfile: customerProfile,
                    saleChannel: saleChannel
                }
            })
            .catch(isFetch => {
                if (isFetch) {
                    return onFetch()
                }
                return Promise.reject()
            })
        return onFetch()
    }

    fetchCustomerOrderSummary(userId, saleChannel) {
        const hasDebtOrder = true;
        OrderService.getCustomerOrderSummary(userId, saleChannel, hasDebtOrder)
            .then(customerOrderSummary => {
                this.setState({
                    customerOrderSummary: customerOrderSummary,
                    getDebtAmount: customerOrderSummary?.debtAmount
                })
            })
    }

    buildAddress(field, address, districtCode, wardCode, cityCode, countryCode, optionalFields) {
        return AddressUtils.buildAddressWithCountry(address, districtCode, wardCode, cityCode, countryCode, {}, optionalFields)
            .then(address => {
                const newState = {
                    [field]: address
                }

                this.setState(newState)

                return newState
            })
    }

    renderDeliveredButton() {
        if (![Constants.SITE_CODE_GOSELL, Constants.SITE_CODE_BEECOW].includes(this.siteCode)) return
        if (this.state.orderObj.orderInfo.status === Constants.ORDER_STATUS_SHIPPED &&
            this.state.orderObj.orderInfo.deliveryName === Constants.DeliveryNames.SELF_DELIVERY) {
            return (
                <GSButton success marginLeft
                          onClick={() => {


                              this.refModalDelivered.openModal({
                                  messages: i18next.t("page.order.detail.setDelivered.message"),
                                  okCallback: () => {
                                      this.setState({
                                          isSaving: true
                                      })
                                      OrderService.setDeliveredForSelfDelivery(this.orderId)
                                          .then(order => {
                                              this.setState({
                                                  isSaving: false
                                              })
                                              GSToast.success("page.order.detail.deliveredOrder.success", true)
                                              this.refetchOrder()
                                          })
                                          .catch(e => {
                                              this.setState({
                                                  isSaving: false
                                              })
                                              GSToast.commonError()
                                          })
                                  }
                              })
                          }}
                >
                    <Trans i18nKey="page.order.detail.btn.delivered"/>
                </GSButton>
            );
        }
    }

    renderPaidStatus() {
        if (this.state.orderObj.orderInfo.refundStatus) {
            if(this.state.orderObj.orderInfo.refundStatus === PAY_TYPE.REFUNDED) {
                return (
                    <div className="order-items__paid order-items__paid-status-unpaid">
                        <Trans i18nKey="page.affiliate.order.paymentStatus.REFUNDED"/>
                    </div>
                )
            } else if(this.state.orderObj.orderInfo.refundStatus === PAY_TYPE.PARTIAL_REFUNDED) {
                return (
                    <div className="order-items__paid order-items__paid-status-unpaid">
                        <Trans i18nKey="page.affiliate.order.paymentStatus.PARTIAL_REFUNDED"/>
                    </div>
                )
            }

        } else {
            if ((this.state.orderObj.orderInfo.paid && !this.state.orderObj.orderInfo.isInStore) ||
                (this.state.orderObj.orderInfo.paid && this.state.orderObj.orderInfo.isInStore
                    && this.state.orderObj.orderInfo.payType === PAY_TYPE.PAID)) {
                return (
                    <div className="order-items__paid order-items__paid-status-paid">
                        <Trans i18nKey="page.order.detail.items.paid"/>
                    </div>
                )
            } else if (this.state.orderObj.orderInfo.payType === PAY_TYPE.PARTIAL) {
                return (
                    <div className="order-items__paid order-items__paid-status-unpaid">
                        <Trans i18nKey="page.affiliate.order.paymentStatus.PARTIAL"/>
                    </div>
                )
            } else {
                return (
                    <div className="order-items__paid order-items__paid-status-unpaid">
                        <Trans i18nKey="page.order.detail.items.unpaid"/>
                    </div>
                )
            }
        }

    }

    renderDeposit() {
        return (
            <div className="order-items__paid order-items__paid-status-unpaid">
                <Trans i18nKey="page.product.create.variation.deposit"/>
            </div>
        )
    }

    renderOrderStatus(status) {
        return (
            <Trans i18nKey={"page.order.detail.information.orderStatus." + status}/>
        )
    }

    onClickReadyToShip() {
        if (this.validateQuantityImeiItem()) {
            this.refModalReadyToShip.onOpen();
        }
    }

    validateQuantityImeiItem() {
        let isValid = true;
        for (let x of this.state.orderObj.items) {
            if (x.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER
                && x.quantity !== x.imeiSerial.length) {
                isValid = false;
                break;
            }
        }

        if (!isValid) GSToast.error("page.order.detail.confirm.imei.quantity.error", true);
        return isValid;
    }

    selectImeiCallback(orderItemId, imeiSerial) {
        let result = [];
        for (let x of this.state.orderObj.items) {
            if (x.id === orderItemId) x.imeiSerial = imeiSerial;
            result.push(x);
        }
        this.setState({
            orderObj: {
                ...this.state.orderObj,
                items: result
            }
        });
    }

    selectOrderItemCallback(orderItem) {
        this.setState({
            currentOrderItem: orderItem,
            isOpenModalSelectImei: true
        });
    }

    selectImeiModalCancel() {
        this.setState({
            currentOrderItem: null,
            isOpenModalSelectImei: false
        });
    }

    selectImeiModalSave(codes) {
        let result = [];
        for (let x of this.state.orderObj.items) {
            if (x.id === this.state.currentOrderItem.id) {
                x.imeiSerial = codes;
            }
            result.push(x);
        }
        this.setState({
            orderObj: {
                ...this.state.orderObj,
                items: result
            },
            currentOrderItem: null,
            isOpenModalSelectImei: false
        });
    }

    removeInvalidImeiItemCallback(invalidImeiSerials) {
        let result = [];
        for (let x of this.state.orderObj.items) {
            let a = invalidImeiSerials.filter(y => x.id === y.orderItemId);
            x.imeiSerial = x.imeiSerial.filter(y => !a[0].imeiSerial.includes(y));
            result.push(x);
        }
        this.setState({
            orderObj: {
                ...this.state.orderObj,
                items: result
            }
        });
    }

    onClickReadyToShipShopee() {
        this.refModalReadyToShipShopee.onOpen();
    }

    onClickPrintShopee() {
        this.setState({
            isLoadingScreen: true
        });
        shopeeService.downloadShippingDocument({
            orderSns: [this.state.orderObj.orderInfo.orderNumber],
            fileName: this.state.orderObj.orderInfo.orderNumber,
            fileType: 'pdf'
        }).then(result => {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.state.orderObj.orderInfo.orderNumber + '.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function () {
                URL.revokeObjectURL(link.href);
            }, 1500);
        }).catch(() => {
            GSToast.warning(i18next.t('page.order.detail.print.error.reason', {channel: _.upperFirst(_.lowerCase(Constants.SITE_CODE_SHOPEE))}));
        }).finally(() => {
            this.setState({
                isLoadingScreen: false
            });
        })
    }

    onClickPrint() {
        //Redirect to component OrderPrint.js
        RouteUtils.openNewTab(`/order/print/${this.siteCode.toLowerCase()}/${this.orderId}`)
    }

    onClickPrintReceipt() {
        this.togglePrintReceiptModal()
    }

    onClickReadyToShipLazada() {
        this.refModalReadyToShipLazada.onOpen();
    }

    onClickCancelOrder() {
        this.refModalCancel.onOpen();
    }

    onClickCancelShopeeOrder() {
        this.refModalShopeeCancel.onOpen();
    }

    onClickCancelLazadaOrder() {
        this.refModalLazadaCancel.onOpen();
    }

    loadPackageDimensions(result) {
        // let sumL = 0, sumW = 0, sumH = 0;
        // let promiseHandles = [];
        // for (let item of result.items) {
        //     promiseHandles.push(ItemService.fetch(item.itemId))
        // }

        // Promise.all(promiseHandles)
        //     .then(itemsDetail => {
        //         // console.log(itemsDetail)
        //         for (let itemDetail of itemsDetail) {
        //             sumL += itemDetail.shippingInfo.length;
        //             sumW += itemDetail.shippingInfo.width;
        //             sumH += itemDetail.shippingInfo.height;
        //         }
        //         // console.log(sumL, sumW, sumH)
        //         if (this._isMounted) {
        //             this.setState({
        //                 dimensions: {
        //                     length: sumL,
        //                     width: sumW,
        //                     height: sumH
        //                 }
        //             })
        //         }
        //     })
        //     .catch(console.log)
    }


    refetchOrder() {
        this.componentDidMount()
    }

    onClickRejectBuyerCancel() {
        this.setState({
            isLoadingScreen: true
        })
        OrderService.rejectBuyerCancel(this.orderId)
            .then(result => {
                this.setState({
                    isLoadingScreen: false,
                    orderObj: result.data
                })
            })
            .catch(e => {
                GSToast.error(i18next.t("page.order.detail.buyerCancel.orderOutOfSync"))
                this.setState({
                    isLoadingScreen: false
                })
            })
    }

    onClickAcceptBuyerCancel() {
        this.setState({
            isLoadingScreen: true
        })
        OrderService.acceptBuyerCancel(this.orderId)
            .then(result => {
                this.setState({
                    isLoadingScreen: false,
                    orderObj: result.data
                })
            })
            .catch(e => {
                GSToast.error(i18next.t("page.order.detail.buyerCancel.orderOutOfSync"))
                this.setState({
                    isLoadingScreen: false
                })
            })
    }

    handleNotAllowEditOrder(e, orderInfo) {
        e.preventDefault()
        if (orderInfo.pointAmount > 0 ||
            (orderInfo.discount.totalDiscount > 0
                && (orderInfo.discount.discountType !== 'WHOLE_SALE' ||
                    (orderInfo.membershipInfo && !(typeof orderInfo.membershipInfo === "object")))) ||
            (orderInfo?.originalShippingFee && (orderInfo.shippingFee - orderInfo.originalShippingFee) < 0)
        ) {
            GSToast.error('page.orders.orderList.detail.editOrder.notAllow', true)
        } else if ((
            orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD_SERVICE ||
            orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD ||
            orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING ||
            orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING_SERVICE) &&
            orderInfo.paid) {
            GSToast.error('page.orders.orderList.detail.editOrder.notAllowATM', true)
        } else {
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.orderEdit + '/' + this.orderId)
        }

    }

    renderReadyToShipButton() {
        if (this.state.orderObj.orderInfo.status === Constants.ORDER_STATUS_TO_SHIP) {
            return (
                <GSButton success
                          onClick={this.renderReadyToShip}
                          id='btn-readyToShip'
                >
                    <Trans i18nKey="page.order.detail.btn.readyToShip"/>
                </GSButton>
            );
        }
    }

    renderReadyToShip() {
        if (this.siteCode === Constants.SITE_CODE_SHOPEE) {
            this.onClickReadyToShipShopee()
        } else if (this.siteCode === Constants.SITE_CODE_LAZADA){
            this.onClickReadyToShipLazada()
        } else if (this.state.orderObj.orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_PAYPAL && this.state.transactionId?.length > 0) {
            this.handleOpenModalTrackingCode(true)
        } else {
            this.onClickReadyToShip()
        }
    }

    renderPrintButton() {
        if (this.siteCode === Constants.SITE_CODE_SHOPEE) {
            if (this.state.orderObj.orderInfo.status === Constants.ORDER_STATUS_WAITING_FOR_PICKUP) {
                return (
                    <GSButton success outline className="btn-print" marginLeft
                              onClick={
                                  this.onClickPrintShopee
                              }
                              id='btn-print'
                    >
                        <span><Trans i18nKey="page.order.detail.btn.print"/></span>
                    </GSButton>
                );
            }
        } else if (this.siteCode === Constants.SITE_CODE_LAZADA) {
        } else {
            return (
                <div>
                    <GSButton success outline className="btn-print" marginLeft
                              onClick={e => {
                                  e.preventDefault()
                              }}
                              id="dropdownPrintButton"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                    >
                        <span className='d-desktop-inline d-mobile-none'><Trans i18nKey="page.order.detail.btn.print"/></span>
                        <span className='d-mobile-inline d-desktop-none'><img src='/assets/images/printer.svg'/></span>
                    </GSButton>
                    <div className="dropdown-menu dropdown-menu-right dropdown-print__button"
                         aria-labelledby="dropdownPrintButton">
                        <div className="dropdown-print__button-group">
                            <span className="shipping-label" onClick={this.onClickPrint}><Trans
                                i18nKey="page.order.detail.btn.print.shipping_label"/></span>
                            <span className="order-receipt" onClick={this.onClickPrintReceipt}><Trans
                                i18nKey="page.order.detail.btn.print.order_receipt"/></span>
                        </div>
                    </div>
                </div>
            )
        }
    }

    renderRefundPayPal() {
        const orderInfo = this.state.orderObj.orderInfo
        if (orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_PAYPAL && orderInfo.refundStatus !== 'REFUNDED' && this.state.transactionId?.length > 0) {
            return (
                <GSButton success outline className="btn-refund" marginLeft
                          id='btn-refund'
                          onClick={(e) => this.handleOpenModalRefund()}
                >
                    <span><Trans i18nKey="page.orders.orderList.detail.refund"/></span>
                </GSButton>
            );
        }
    }

    renderEditButton() {
        const orderInfo = this.state.orderObj.orderInfo
        if (orderInfo.status === Constants.ORDER_STATUS_TO_SHIP
            && orderInfo.deliveryName === Constants.DeliveryNames.SELF_DELIVERY) {
            return (
                <GSButton success outline className="btn-edit" marginLeft
                          id='btn-edit'
                          onClick={(e) => this.handleNotAllowEditOrder(e, orderInfo)}
                >
                    <span><Trans i18nKey="page.orders.orderList.detail.editOrder"/></span>
                </GSButton>
            );
        }
    }

    handleOpenModalRefund() {
        this.refModalRefund.onOpen();
    }

    handleOpenModalTrackingCode(isConfirm) {
        this.refModalTrackingCode.onOpen();
        this.setState({
            isConfirm: isConfirm
        })
    }

    renderCancelButton() {
        const orderStatus = this.state.orderObj.orderInfo.status
        const deliveryName = this.state.orderObj.orderInfo.deliveryName
        if (orderStatus === Constants.ORDER_STATUS_TO_SHIP ||
            (orderStatus === Constants.ORDER_STATUS_SHIPPED
                && deliveryName === Constants.DeliveryNames.SELF_DELIVERY)
            && [Constants.SITE_CODE_GOSELL, Constants.SITE_CODE_BEECOW].includes(this.siteCode)) {
            return (
                <GSButton secondary outline marginLeft
                          onClick={
                              this.siteCode === Constants.SITE_CODE_SHOPEE ? this.onClickCancelShopeeOrder :
                                  this.siteCode === Constants.SITE_CODE_LAZADA ? this.onClickCancelLazadaOrder :
                                      this.onClickCancelOrder
                          }
                          id='btn-cancelOrder'
                >
                    <Trans i18nKey="page.order.detail.btn.cancelOrder"/>
                </GSButton>
            );
        }
    }

    handleOrderCallback(order) {
        this.setState({
            isFetching: false
        });
        this.refetchOrder();
    }


    renderDeliveryName(deliveryName) {
        if (deliveryName === 'selfdelivery') {
            return i18next.t("page.order.create.print.shippingMethod.selfDelivery")
        } else if (deliveryName === 'ahamove_bike') {
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_BIKE")
        } else if (deliveryName === 'ahamove_truck') {
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_TRUCK")
        }
        return deliveryName
    }

    renderOrderCreatedBy(inStoreCreatedBy) {
        if (inStoreCreatedBy === '[shop0wner]') {
            return i18next.t('page.order.detail.information.shopOwner')
        } else {
            return inStoreCreatedBy;
        }
    }

    getStoreInfoForPrinter() {
        const {contactNumber, webFullUrl, url} = this.state.storeInfo

        return {
            storePhone: this.state.storeBranchPhone || contactNumber,
            storeAddress: this.state.storeBranchAddress,
            storeDomain: AgencyService.getStorefrontDomain(),
            storeUrl: url,
            customDomain: webFullUrl,
        }
    }

    renderEarnPoint() {

        if (this.state.orderObj.orderInfo.status == STATUS_TYPE.DELIVERED) {
            if (this.state.orderObj.orderInfo.expiredDay) {
                return <Trans values={{
                    expired: this.state.orderObj.orderInfo.expiredDay,
                    point: NumberUtils.formatThousand(this.state.orderObj.orderInfo.earnPoint)
                }} i18nKey={'page.order.detail.pointAndExpired'}/>
            } else {
                if (!this.state.orderObj.orderInfo.earnPoint) {
                    return 0
                }
                return NumberUtils.formatThousand(this.state.orderObj.orderInfo.earnPoint)
            }

        }
        if (this.state.orderObj.orderInfo.status == STATUS_TYPE.CANCELLED) {
            return 0
        } else {
            if (!this.state.orderObj.orderInfo.earnPoint) {
                return 0
            }
            return NumberUtils.formatThousand(this.state.orderObj.orderInfo.earnPoint)
        }
    }

    togglePrintReceiptModal() {
        if (this.state.isTogglePrintSizeModal) {
            this.setState(state => ({
                isTogglePrintSizeModal: !state.isTogglePrintSizeModal
            }))

            return
        }

        storeService.getLanguages()
            .then(languages => {
                this.setState(state => ({
                    isTogglePrintSizeModal: !state.isTogglePrintSizeModal,
                    selectedLanguage: languages.find(lang => lang.isInitial).langCode,
                    printType: PRINT_TYPE.ORDER_RECEIPT,
                }))
            })
    }

    handlePrintReceipt(data) {
        const {address, ward, district, city, countryCode, address2, cityName, zipCode, phoneNumberFirst} = this.state.orderObj.storeBranch

        Promise.all([
            AddressUtils.buildAddressWithCountry(
                address, 
                district, 
                ward,
                city,
                countryCode,
                {langCode: data.languageSelect},
                {
                    address2,
                    city: cityName,
                    zipCode: zipCode
                }),
            AddressUtils.buildAddressWithCountry(
                this.state.shippingInfo.address1,
                this.state.shippingInfo.district,
                this.state.shippingInfo.ward,
                this.state.shippingInfo.country,
                this.state.shippingInfo.countryCode,
                {langCode: data.languageSelect},
                {
                    address2: this.state.shippingInfo.address2,
                    city: this.state.shippingInfo.outSideCity,
                    zipCode: this.state.shippingInfo.zipCode
                })
        ])
            .then(([storeBranchAddress, buyerBranchAddress]) => {
                this.setState({
                    isTogglePrintSizeModal: false,
                    printSize: data.printSizeRadioGroup,
                    selectedLanguage: data.languageSelect,
                    storeBranchPhone: phoneNumberFirst,
                    customContent: {
                        ...data,
                        receiveAmount: false
                    },
                    information: data.additionalInformation,
                    storeBranchAddress,
                    buyerBranchAddress
                }, () => {
                    this.refPrintReceiptRef.current.print()
                })
            })
    }


    handleConfirmPayment = (data) => {
        if (!this.state.isLoadingScreen) {
            const dataPaymentHistory = {
                ...data,
                bcOrderId: this.state.orderObj.orderInfo.orderNumber,
                createDate: data.createdDate
            }

            BCOrderService.addPaymentHistiory(dataPaymentHistory)
                .then(result => {
                    this.componentDidMount()
                    GSToast.commonCreate()
                })
                .catch(err => GSToast.commonError())
                .finally(() => {
                    this.setState({
                        isLoadingScreen: false
                    })
                })
        }

        this.setState({
            modalPaymentConfirmation: false,
            isLoadingScreen: true
        })
    }

    convertDateToISO = (text, suffix) => {
        if (text) {
            return moment(text, this.const.UI_DATE_FORMAT).format(this.const.SERVER_DATE_FORMAT) + suffix;
        }
    };

    togglePaymentConfirmation = () => {
        this.setState({
            modalPaymentConfirmation: !this.state.modalPaymentConfirmation,
        })
    }

    checkDownUp = (check) => {
        if (this.state.checkDownUp === check) {
            this.setState({
                checkDownUp: ''
            })
            return
        }
        this.setState({
            checkDownUp: check
        })
    }

    async checkLzdConnectivity() {
        const lzdToken = localStorage.getItem(Constants.STORAGE_KEY_LAZADA_TOKEN);
        if (!lzdToken) return;

        const disconnect = () => {
            lazadaService.disconnectLazada();
            localStorage.removeItem(Constants.STORAGE_KEY_LAZADA_ID);
            localStorage.removeItem(Constants.STORAGE_KEY_LAZADA_TOKEN);
        }

        const reconnect = () => {
            window.location.href = `https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&client_id=${lzd_client_id}`;
        }

        lazadaService.getSellerInfo({'accessToken': lzdToken}).then((res) => {
            //lazada connecting state
        }, error => {
            const message = error.response.data ? error.response.data.message : "";
            let tokenProblem = /token|invalid|expired/i.test(message);
            if (tokenProblem) {
                this.refLzdConfirmModal.openModal({
                    modalTitle: i18next.t('lazada.alert.modal.title'),
                    modalBtnOk: i18next.t('lazada.alert.modal.reconnect'),
                    messages: <div><GSTrans t={'lazada.alert.modal.message'}/></div>,
                    messageHtml: true,
                    cancelCallback: () => {
                        disconnect();
                        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.orders);
                    },
                    okCallback: () => {
                        disconnect();
                        reconnect();
                    }
                })
            }
        })
    }

    getStatusOfReturnOrder(status) {
        switch (status) {
            case Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS:
                return status = i18next.t('progress.bar.purchase.order.step.in_progress')
            case Constants.PURCHASE_ORDER_STATUS.COMPLETED:
                return status = i18next.t('progress.bar.purchase.order.step.completed')
            case Constants.PURCHASE_ORDER_STATUS.CANCELLED:
                return status = i18next.t('progress.bar.transfer.status.cancel')
            default:
                return status
        }
    }

    renderToReturnOrderDetail = (id) => {
        const returnOrderWizard = NAV_PATH.returnOrderWizard + `/${id}`
        RouteUtils.openNewTab(returnOrderWizard)
    }

    render() {
        return (
            <>
                {this.state.isLoadingScreen &&
                <LoadingScreen/>}
                <ConfirmPaymentModal
                    toggle={this.state.modalPaymentConfirmation}
                    orderId={this.state.orderObj?.orderInfo?.orderNumber}
                    orderCreatedDate={this.state.orderObj?.orderInfo?.createDate}
                    debtAmount={this.state.orderObj?.orderInfo?.totalPrice - this.state.orderObj?.orderInfo?.receivedAmount}
                    onConfirm={this.handleConfirmPayment}
                    onClose={this.togglePaymentConfirmation}
                    currency={this.currency}
                />
                <ModalConfirmReadyToShip
                    ref={(el) => this.refModalReadyToShip = el}
                    length={this.state.dimensions.length}
                    width={this.state.dimensions.width}
                    height={this.state.dimensions.height}
                    siteCode={this.state.siteCode}
                    order={this.state.orderObj}
                    okCallback={this.refetchOrder}
                    orderType={this.state.orderType}
                    itemIMEISerials={this.state.orderObj?.items?.filter(x => x.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER)}
                    removeInvalidImeiItemCallback={this.removeInvalidImeiItemCallback}
                />
                <ModalReadyToShipShopeeConfirm
                    ref={(el) => this.refModalReadyToShipShopee = el}
                    length={this.state.dimensions.length}
                    width={this.state.dimensions.width}
                    height={this.state.dimensions.height}
                    siteCode={this.state.siteCode}
                    order={this.state.orderObj}
                    okCallback={this.handleOrderCallback}
                />
                <ModalReadyToShipLazadaConfirm
                    ref={(el) => this.refModalReadyToShipLazada = el}
                    length={this.state.dimensions.length}
                    width={this.state.dimensions.width}
                    height={this.state.dimensions.height}
                    siteCode={this.state.siteCode}
                    order={this.state.orderObj}
                    okCallback={this.handleOrderCallback}
                />
                <ModalCancelOrderConfirm
                    ref={(el) => this.refModalCancel = el}
                    siteCode={this.state.siteCode}
                    order={this.state.orderObj}
                    paymentMethod={this.state.paymentMethod}
                    refundStatus={this.state.refundStatus}
                    transactionId={this.state.transactionId}
                    isPaid={this.state.isPaid}
                    exchangeRate={this.state.exchangeRate}
                    okCallback={this.refetchOrder}
                />
                <ModalCancelShopeeOrderConfirm
                    ref={(el) => this.refModalShopeeCancel = el}
                    siteCode={this.state.siteCode}
                    order={this.state.orderObj}
                    okCallback={this.handleOrderCallback}
                />
                <ModalCancelLadazaOrderConfirm
                    ref={(el) => this.refModalLazadaCancel = el}
                    siteCode={this.state.siteCode}
                    order={this.state.orderObj}
                    okCallback={this.handleOrderCallback}
                />
                <GSSelectPrintSizeModal
                    printA4Template
                    isToggle={this.state.isTogglePrintSizeModal}
                    selectedPrintSize={this.state.printSize}
                    selectedLanguage={this.state.selectedLanguage}
                    config={{
                        showCustomContent: true,
                        saveLocalStorage: true,
                        localStorageKey: GSSelectPrintSizeModal.LOCAL_STORAGE_KEY.ORDER_DETAIL
                    }}
                    onClose={this.togglePrintReceiptModal}
                    onPrint={this.handlePrintReceipt}/>
                <ModalRefund
                    ref={(el) => this.refModalRefund = el}
                    order={this.state.orderObj}
                    exchangeRate={this.state.exchangeRate}
                    okCallback={this.refetchOrder}
                />
                <ModalTrackingCode
                    ref={(el) => this.refModalTrackingCode = el}
                    order={this.state.orderObj}
                    trackingCode={this.state.trackingCode}
                    selfShippingProviderName={this.state.selfShippingProviderName}
                    carrierCode={this.state.carrierCode}
                    isConfirm={this.state.isConfirm}
                    transactionId={this.state.transactionId}
                    callBackComfirmOrder={this.onClickReadyToShip}
                    okCallback={this.refetchOrder}
                />
                {
                    this.state.orderObj &&
                    <Printer
                        ref={ this.refPrintReceiptRef }
                        printType={ Printer.PRINT_TYPE.NEW_TAB }
                        printSize={ this.state.printSize }
                    >
                        <OrderA4HTML>
                            <OrderA4Template
                                orderId={ this.orderId }
                                orderDate={ this.state.orderObj.orderInfo.createDate }
                                storeInfo={ this.getStoreInfoForPrinter() }
                                user={ this.state.user }
                                staffName={ this.state.orderObj.orderInfo.inStoreCreatedBy }
                                spendingPoint={ this.state.orderObj.orderInfo.usePoint }
                                pointAmount={ this.state.orderObj.orderInfo.pointAmount }
                                earningPoint={ this.state.orderObj.orderInfo.earnPoint }
                                shippingInfo={ {
                                    ...this.state.shippingInfo,
                                    address: this.state.shippingAddress
                                } }
                                channel={ this.state.orderObj.orderInfo.channel }
                                productList={ OrderDetailUtils.getProductListForPrint(this.state.orderObj) }
                                paymentMethod={ this.state.orderObj.orderInfo.paymentMethod }
                                taxAmount={ this.state.orderObj.orderInfo.totalTaxAmount }
                                note={ this.state.orderObj.orderInfo.note }
                                debt={ {
                                    debtAmount: this.state.orderObj.orderInfo.debtAmount,
                                    customerDebtAmount: this.state.customerOrderSummary?.debtAmount,
                                    isShow: !isNaN(this.state.getDebtAmount)
                                } }
                                paidAmount={ this.state.orderObj.orderInfo.receivedAmount }
                                subTotal={ OrderInStorePurchaseContextService.calculateSubTotalPrice(OrderDetailUtils.getProductListForPrint(this.state.orderObj)) }
                                discountAmount={ OrderInStorePurchaseContextService.calculateDiscountAmount(
                                    OrderDetailUtils.getProductListForPrint(this.state.orderObj),
                                    this.state.orderObj.orderInfo.discount,
                                    OrderDetailUtils.getMembershipInfoForPrint(this.state.orderObj)
                                ) }
                                totalPrice={ OrderDetailUtils.getTotalPriceForPrint(this.state.orderObj) }
                                changeAmount={ OrderDetailUtils.getChangeAmountForPrint(this.state.orderObj) }
                                payableAmount={ OrderDetailUtils.getPayableAmountForPrint(this.state.orderObj, this.state.customerOrderSummary?.debtAmount) }
                                langCode={ this.state.selectedLanguage }
                                customContent={ this.state.customContent }
                                information={ this.state.information }
                                isUsedDelivery={ false }
                            />
                        </OrderA4HTML>
                        <OrderKPosHTML>
                            <OrderKPosTemplate
                                orderId={ this.orderId }
                                orderDate={ this.state.orderObj.orderInfo.createDate }
                                storeInfo={ this.getStoreInfoForPrinter() }
                                user={ this.state.user }
                                staffName={ this.state.orderObj.orderInfo.inStoreCreatedBy }
                                spendingPoint={ this.state.orderObj.orderInfo.usePoint }
                                pointAmount={ this.state.orderObj.orderInfo.pointAmount }
                                earningPoint={ this.state.orderObj.orderInfo.earnPoint }
                                shippingInfo={ {
                                    ...this.state.shippingInfo,
                                    address: this.state.shippingAddress
                                } }
                                channel={ this.state.orderObj.orderInfo.channel }
                                productList={ OrderDetailUtils.getProductListForPrint(this.state.orderObj) }
                                paymentMethod={ this.state.orderObj.orderInfo.paymentMethod }
                                taxAmount={ this.state.orderObj.orderInfo.totalTaxAmount }
                                note={ this.state.orderObj.orderInfo.note }
                                debt={ {
                                    debtAmount: this.state.orderObj.orderInfo.debtAmount,
                                    customerDebtAmount: this.state.customerOrderSummary?.debtAmount,
                                    isShow: !isNaN(this.state.getDebtAmount)
                                } }
                                paidAmount={ this.state.orderObj.orderInfo.receivedAmount }
                                subTotal={ OrderInStorePurchaseContextService.calculateSubTotalPrice(OrderDetailUtils.getProductListForPrint(this.state.orderObj)) }
                                discountAmount={ OrderInStorePurchaseContextService.calculateDiscountAmount(
                                    OrderDetailUtils.getProductListForPrint(this.state.orderObj),
                                    this.state.orderObj.orderInfo.discount,
                                    OrderDetailUtils.getMembershipInfoForPrint(this.state.orderObj)
                                ) }
                                totalPrice={ OrderDetailUtils.getTotalPriceForPrint(this.state.orderObj) }
                                changeAmount={ OrderDetailUtils.getChangeAmountForPrint(this.state.orderObj) }
                                payableAmount={ OrderDetailUtils.getPayableAmountForPrint(this.state.orderObj, this.state.customerOrderSummary?.debtAmount) }
                                langCode={ this.state.selectedLanguage }
                                customContent={ this.state.customContent }
                                information={ this.state.information }
                                isUsedDelivery={ false }
                            />
                        </OrderKPosHTML>
                    </Printer>
                }
                <ConfirmModal
                    ref={(el) => this.refModalDelivered = el}
                />
                {this.state.currentOrderItem &&
                <SelectImeiModal isOpenModal={this.state.isOpenModalSelectImei}
                                 itemName={this.state.currentOrderItem.name}
                                 modelName={this.state.currentOrderItem.variationName}
                                 itemId={this.state.currentOrderItem.itemId}
                                 modelId={this.state.currentOrderItem.modelId || this.state.currentOrderItem.variationId}
                                 branchId={this.state.orderObj?.storeBranch?.id}
                                 quantity={this.state.currentOrderItem.quantity}
                                 defaultCodes={this.state.currentOrderItem.imeiSerial || []}
                                 cancelCallback={this.selectImeiModalCancel}
                                 saveCallback={this.selectImeiModalSave}/>
                }
                <GSContentContainer className="order-detail-page" isLoading={this.state.isFetching}
                                    isSaving={this.state.isSaving}>
                    {this.state.orderObj !== null &&
                    <GSContentHeader
                        title={i18next.t('page.order.detail.title') + this.state.orderObj.orderInfo.orderNumber}>
                        <div className='gss-content-header--action-btn'>
                            <div className='gss-content-header--action-btn--group'>
                                {this.renderReadyToShipButton()}
                                {this.renderDeliveredButton()}
                                {this.renderEditButton()}
                                {this.renderRefundPayPal()}
                                {this.renderPrintButton()}
                                {this.renderCancelButton()}
                            </div>
                        </div>
                    </GSContentHeader>}
                    {this.state.orderObj !== null &&
                    <GSContentBody size={GSContentBody.size.MAX}>
                        <div className="row">
                            <div className="col-lg-9 col-md-12">
                                {/*BUYER CANCEL*/}
                                {this.state.orderObj.orderInfo.status === Constants.ORDER_STATUS_IN_CANCEL &&
                                <UikWidget className="gs-widget buyer-cancel">
                                    <UikWidgetContent className="gs-widget__content">
                                                <span>
                                                    <Trans i18nKey="page.order.detail.buyerCancel.message"/>
                                                </span>
                                        <div className="buyer-cancel__btn-container">
                                            <GSButton success onClick={this.onClickAcceptBuyerCancel}>
                                                <Trans i18nKey="page.order.detail.buyerCancel.btn.accept"/>
                                            </GSButton>
                                            <GSButton secondary outline marginLeft
                                                      onClick={this.onClickRejectBuyerCancel}>
                                                <Trans i18nKey="page.order.detail.buyerCancel.btn.reject"/>
                                            </GSButton>
                                        </div>
                                    </UikWidgetContent>
                                </UikWidget>}
                                {/*ORDER INFORMATION*/}
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader className="gs-widget__header" rightEl={
                                        (
                                            <SaleChannelTag channel={this.siteCode} isShowIcon/>
                                        )
                                    }>
                                        <Trans i18nKey="page.order.detail.information.title"/>
                                    </UikWidgetHeader>
                                    <UikWidgetContent className="gs-widget__content">


                                        {(this.state.orderObj.orderInfo.isInStore || this.state.orderObj.orderInfo.inStore === 'GO_SOCIAL') &&
                                        <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.information.orderCreatedBy"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.renderOrderCreatedBy(this.state.orderObj.orderInfo.inStoreCreatedBy)}
                                            </div>
                                        </div>}
                                        <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.information.orderStatus"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.renderOrderStatus(this.state.orderObj.orderInfo.status)}
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.information.paymentMethod"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                <Trans
                                                    i18nKey={"page.order.detail.information.paymentMethod." + this.state.orderObj.orderInfo.paymentMethod}/>
                                            </div>
                                        </div>
                                        {this.state.orderObj.orderInfo.paymentMethod == "PAYPAL" &&
                                        <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans
                                                    i18nKey="page.order.detail.information.paymentMethod.TransactionId"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.transactionId}
                                            </div>
                                        </div>
                                        }
                                        {this.state.orderObj.orderInfo.paymentMethod == "PAYPAL" &&
                                        <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans
                                                    i18nKey="page.order.detail.information.paymentMethod.trackingCode"/>
                                            </div>
                                            <div className='order-information__right-value d-flex align-items-center'>
                                                {this.state.trackingCode ? this.state.trackingCode : '-'}
                                                {this.state.orderObj.orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_PAYPAL && this.state.transactionId?.length > 0 &&
                                                    <img src="/assets/images/icon-edit trackingCode.png" alt=""
                                                         className="ml-4 cursor--pointer" onClick={(e) => this.handleOpenModalTrackingCode(false)}/>
                                                }
                                            </div>
                                        </div>
                                        }
                                        <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.information.shippingMethod"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {/*{*/}
                                                {/*    this.state.orderObj.orderInfo.deliveryName &&*/}
                                                {/*    this.renderDeliveryName(this.state.orderObj.orderInfo.deliveryName)*/}
                                                {/*}*/}
                                                {/*{*/}
                                                {/*    (!this.state.orderObj.orderInfo.deliveryName && !this.state.orderObj.shippingInfo.address1)*/}
                                                {/*    && i18next.t('page.order.create.print.shippingMethod.IN_STORE')*/}
                                                {/*}*/}
                                                {
                                                    this.state.orderObj.orderInfo.deliveryName &&
                                                    this.renderDeliveryName(this.state.orderObj.orderInfo.deliveryName)
                                                }
                                                {
                                                    (!this.state.orderObj.orderInfo.deliveryName && this.siteCode !== Constants.SITE_CODE_SHOPEE) &&
                                                    i18next.t('page.order.create.print.shippingMethod.inStore')
                                                }
                                                {
                                                    (!this.state.orderObj.orderInfo.deliveryName && this.siteCode === Constants.SITE_CODE_SHOPEE) && "-"
                                                }
                                            </div>
                                        </div>
                                        {this.state.orderObj.storeBranch && <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.information.branchName"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.storeBranch.name}
                                            </div>
                                        </div>}
                                        {this.state.orderObj.orderInfo.trackingCode && <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.information.trackingNumber"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.orderInfo.trackingCode}
                                            </div>
                                        </div>}
                                        {this.state.orderObj.orderInfo.transactionNumber && <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.transactionId"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.orderInfo.transactionNumber}
                                            </div>
                                        </div>}
                                        {this.state.orderObj.orderInfo.note && <div className='row'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.noteFromBuyer"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.orderInfo.note}
                                            </div>
                                        </div>}


                                        {
                                            // this.state.orderObj.orderInfo.earnPoint &&
                                            <div className='row'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.order.detail.point"/>
                                                </div>
                                                <div className='order-information__right-value'>
                                                    {(this.renderEarnPoint())}
                                                </div>
                                            </div>
                                        }
                                        {this.state.orderObj.orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                                        <>
                                            <hr/>
                                            <div className="row">
                                                <div className="col-12 d-flex align-items-center">
                                                    <img src="/assets/images/icon-alert.svg" alt=""
                                                         className="mr-3"/>
                                                    <span className="gsa__color--gray">
                                                                <GSTrans
                                                                    t={"page.order.detail.information.bankTransferHint"}/>
                                                            </span>
                                                </div>
                                            </div>
                                        </>
                                        }
                                    </UikWidgetContent>
                                </UikWidget>

                                {/*ORDER ITEMS*/}
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader className="gs-widget__header" rightEl={
                                        (
                                            <>
                                                <div
                                                    className='order-items__detail order-items__detail-header d-desktop-none'>
                                                    {/*ONLY SHOW PAID STATUS WITH NORMAL ORDER*/}
                                                    {this.state.orderType === ORDER_TYPE.NORMAL && this.renderPaidStatus()}
                                                </div>
                                                {this.state.orderType === ORDER_TYPE.DEPOSIT &&
                                                <div className="order-items__detail order-items__detail-header">
                                                    {this.renderDeposit()}
                                                </div>
                                                }
                                            </>
                                        )
                                    }>
                                        <Trans i18nKey="page.order.detail.items.title"/>
                                    </UikWidgetHeader>
                                    <UikWidgetContent className="gs-widget__content item-row-content">
                                        <div>
                                            {this.state.orderObj.items.map((item, index) =>
                                                <ItemRow index={index} item={item} key={item.id}
                                                         siteCode={this.state.siteCode}
                                                         orderStatus={this.state.orderObj.orderInfo.status}
                                                         selectOrderItemCallback={this.selectOrderItemCallback}/>
                                            )}
                                        </div>
                                        <div className="order-items__detail">
                                            <div className='d-desktop-flex d-mobile-none'>
                                                {this.renderPaidStatus()}
                                            </div>
                                            {/*PRICING*/}
                                            <table className="order-items__table">
                                                <tbody>
                                                {/*SUBTOTAL*/}
                                                <tr>
                                                    <td>
                                                        <Trans i18nKey="page.order.detail.items.subTotal"/>
                                                    </td>
                                                    <td>
                                                        {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.subTotal, this.currency)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <Trans i18nKey="page.order.detail.items.discount"/>
                                                        {this.state.orderObj.orderInfo.discount && this.state.orderObj.orderInfo.discount.discountType === 'WHOLE_SALE' && ` (${i18next.t("component.discount.label.wholesale")})`}
                                                    </td>
                                                    <td>
                                                        {`- ${CurrencyUtils.formatMoneyByCurrency(OrderDetailUtils.calcOrderDiscount(this.state.orderObj), this.currency)}`}
                                                    </td>
                                                </tr>

                                                {!!this.state.orderObj.orderInfo.totalTaxAmount &&
                                                <tr>
                                                    <td>
                                                        VAT
                                                    </td>
                                                    <td>
                                                        {CurrencyUtils.formatDigitMoneyByCustom(this.state.orderObj.orderInfo.totalTaxAmount, this.currency, this.currency !== Constants.CURRENCY.VND.SYMBOL ? 2 : 0)}
                                                    </td>
                                                </tr>}

                                                {/*POINT*/}
                                                <tr>
                                                    <td>
                                                        <Trans i18nKey="page.reservation.detail.point"/>
                                                    </td>
                                                    <td>
                                                        {`- `}{CurrencyUtils.formatDigitMoneyByCustom(this.state.orderObj.orderInfo.pointAmount ? this.state.orderObj.orderInfo.pointAmount : 0, this.currency, this.currency !== Constants.CURRENCY.VND.SYMBOL ? 2 : 0)}
                                                    </td>
                                                </tr>

                                                {/*MEMBERSHIP*/}
                                                {this.state.orderObj.orderInfo.membershipInfo &&
                                                <tr>
                                                    <td>
                                                        <Trans i18nKey="page.order.detail.membership"/>
                                                    </td>
                                                    <td>
                                                        {this.state.orderObj.orderInfo.membershipInfo.discountPercent}{'% '}
                                                        {this.state.orderObj.orderInfo.membershipInfo.discountMaxAmount &&
                                                        <GSTrans
                                                            t={"page.order.instorePurchase.membershipDiscountMax"}
                                                            values={{
                                                                maxAmount: CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.membershipInfo.discountMaxAmount, this.currency)
                                                            }}
                                                        />
                                                        }
                                                    </td>
                                                </tr>
                                                }
                                                {/*SHOW COUPON CODE*/}
                                                {this.state.orderObj.orderInfo.discount
                                                && this.state.orderObj.orderInfo.discount.discountId
                                                && this.state.orderObj.orderInfo.discount.discountType === "COUPON" &&
                                                <tr>
                                                    <td>
                                                        <Trans i18nKey="component.discount.label.coupon"/>
                                                    </td>
                                                    <td>
                                                        {this.state.orderObj.orderInfo.discount.discountCode}
                                                    </td>
                                                </tr>
                                                }

                                                {
                                                    <tr>
                                                        <td>
                                                            <Trans i18nKey="page.order.detail.items.shippingFee"/>
                                                        </td>
                                                        <td>
                                                            {this.state.orderObj.orderInfo.shippingFee < this.state.orderObj.orderInfo.originalShippingFee &&
                                                            <span
                                                                className={'shipping-fee-original'}>{CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.originalShippingFee, this.currency)}</span>
                                                            }
                                                            {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.shippingFee, this.currency)}
                                                        </td>
                                                    </tr>}


                                                <tr>
                                                    <td>
                                                        <b>
                                                            <Trans i18nKey="page.order.detail.items.total"/>
                                                        </b>
                                                    </td>
                                                    <td>
                                                        {CurrencyUtils.formatMoneyByCurrency((this.state.orderObj.orderInfo.totalPrice), this.currency)}
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                    </UikWidgetContent>
                                </UikWidget>

                                {/*Payment Summary*/}
                                {(this.state.orderObj.orderInfo.isInStore || this.state.orderObj.orderInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_DEBT
                                        || this.state.orderObj.orderInfo.payType === PAY_TYPE.PARTIAL || this.state.orderObj.orderInfo.inStore === 'PARTNER_DROP_SHIP') &&
                                (this.state.paymentHistioryList.length >= 1 || !(this.state.orderObj.orderInfo.receivedAmount >= this.state.orderObj.orderInfo.totalPrice)) &&
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader className="gs-widget__header paymentSummary"

                                    >
                                        {
                                            (this.state.orderObj.orderInfo.status !== 'CANCELLED' && (this.state.orderObj.orderInfo.payType === PAY_TYPE.UNPAID ||
                                                this.state.orderObj.orderInfo.payType === PAY_TYPE.PARTIAL)) &&
                                            <>
                                                {i18next.t('page.orderList.orderDetail.paymentSummary')}
                                                <GSButton success outline className="btn-print" marginLeft
                                                          onClick={
                                                              this.togglePaymentConfirmation
                                                          }
                                                          id='btn-print'
                                                >
                                                    <span>
                                                        <Trans
                                                            i18nKey="page.orderList.orderDetail.btn.confirmPayment"/>
                                                    </span>
                                                </GSButton>
                                            </>
                                        }
                                        {
                                            (this.state.orderObj.orderInfo.status === 'CANCELLED' || this.state.orderObj.orderInfo.payType === PAY_TYPE.PAID) &&
                                            <>
                                                <div className="d-flex align-items-center">
                                                    <img src="/assets/images/icon-checkmark-circle-outline.png"
                                                        style={{width: '13px', marginRight: '5px'}} alt=""
                                                    />
                                                    {i18next.t('page.orderList.orderDetail.paymentSummary')}
                                                </div>
                                            </>
                                        }


                                    </UikWidgetHeader>
                                    <UikWidgetContent className="gs-widget__content">


                                        <div className='row justify-content-between payment-summary'>
                                            <div className='row d-flex'>
                                                <p>
                                                    {i18next.t('page.orderList.orderDetail.amountReceived')}
                                                </p>
                                                <p className='font-weight-500 ml-5'>
                                                    {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.orderInfo.receivedAmount, this.currency)}
                                                </p>
                                            </div>

                                            <div className='row d-flex'>
                                                <p>
                                                    {i18next.t('page.orderList.orderDetail.payableAmount')}
                                                </p>
                                                <p className='font-weight-500 ml-5'>
                                                    {this.state.orderObj.orderInfo.totalPrice - this.state.orderObj.orderInfo.receivedAmount > 0 ? CurrencyUtils.formatMoneyByCurrency((this.state.orderObj.orderInfo.totalPrice - this.state.orderObj.orderInfo.receivedAmount), this.currency) : CurrencyUtils.formatMoneyByCurrency((0), this.currency)}
                                                </p>
                                            </div>


                                        </div>


                                        <div className='payment-history'>


                                            <h3 className='title mt-2'>{i18next.t('page.orderList.orderDetail.paymentHistory')}</h3>


                                            <div id="accordion">

                                                {
                                                    this.state.paymentHistioryList.map((item, index) => {
                                                        if (item.paymentAmount === 0) {
                                                            return;
                                                        }
                                                        return (
                                                            <div>
                                                                <div className=" row justify-content-between">
                                                                    <p className="font-weight-500 cursor--pointer align-items-center d-flex"
                                                                       data-toggle="collapse"
                                                                       href={`#paymentHistory-${index}`}
                                                                       onClick={() => this.checkDownUp(`paymentHistory-${index}`)}>
                                                                        <div
                                                                            className={this.state.paymentHistioryList.length === index + 1 ? '' : 'img-check-payment'}>
                                                                            <img src="/assets/images/icon-check.png"
                                                                                 style={{
                                                                                     width: '13px',
                                                                                     marginRight: '5px'
                                                                                 }}
                                                                            />
                                                                            <div></div>
                                                                        </div>
                                                                        <p className="m-0 payable-successfully">{i18next.t('page.orderList.orderDetail.payableSuccessfully',
                                                                            {
                                                                                x: CurrencyUtils.formatMoneyByCurrency(item.paymentAmount, this.currency)
                                                                            })}
                                                                        </p>
                                                                        {this.state.checkDownUp !== `paymentHistory-${index}` &&
                                                                        <i className="fa fa-caret-down ml-1"></i>}
                                                                        {this.state.checkDownUp === `paymentHistory-${index}` &&
                                                                        <i className="fa fa-caret-up ml-1"></i>}
                                                                    </p>


                                                                    <p className='payment-history-date'>
                                                                        {moment(item.createDate).format('DD-MM-YYYY HH:mm')}
                                                                    </p>
                                                                </div>


                                                                <div id={`paymentHistory-${index}`}
                                                                     className={this.state.paymentHistioryList.length === index + 1 ? 'collapse payment-history-column' : 'collapse payment-history-column payment-history-line'}
                                                                     data-parent="#accordion">
                                                                    <div>
                                                                        <div className='row d-flex'>
                                                                            <p>
                                                                                {i18next.t('page.orderList.orderDetail.amountReceived')}:
                                                                            </p>
                                                                            <p className='ml-5'>
                                                                                {CurrencyUtils.formatMoneyByCurrency(item.paymentAmount, this.currency)}
                                                                            </p>
                                                                        </div>

                                                                        <div className='row d-flex'>
                                                                            <p>
                                                                                {i18next.t('page.orderList.orderDetail.paymentMethod')}:
                                                                            </p>
                                                                            <p className='ml-5'>
                                                                                <Trans
                                                                                    i18nKey={"page.order.detail.information.paymentMethod." + item.paymentMethod}/>
                                                                            </p>
                                                                        </div>

                                                                        <div className='row d-flex'>
                                                                            <p>
                                                                                {i18next.t('page.orderList.orderDetail.paymentReceived')}:
                                                                            </p>
                                                                            <p className='ml-5'>
                                                                                {this.renderOrderCreatedBy(item.paymentReceivedBy)}
                                                                            </p>
                                                                        </div>

                                                                        <div className='payment-history-note'>
                                                                            <p className="title">
                                                                                {i18next.t('page.orderList.orderDetail.modalPayment.note')}:
                                                                            </p>
                                                                            <p className="description">
                                                                                {item.note}
                                                                            </p>
                                                                        </div>


                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }


                                            </div>


                                        </div>


                                    </UikWidgetContent>
                                </UikWidget>
                                }
                                {/* RETURN ORDERS */}
                                {this.state.returnOrderDetailList && this.state.returnOrderDetailList.length > 0 && (
                                    <UikWidget className="gs-widget">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="component.navigation.returnOrder"/>
                                        </UikWidgetHeader>
                                        <UikWidgetContent className="gs-widget__content p-0">
                                            <div
                                                className={this.state.returnOrderDetailList.length > 5 ? "gs-atm__scrollbar-1 return-order-list" : "w-100"}>
                                                <GSTable>
                                                    <thead>
                                                    <tr className="white-space-nowrap text-center bg-light-white">
                                                        <th>
                                                            <GSTrans
                                                                t={'page.orders.returnOrder.list.search_type.RETURN_ORDER_ID'}/>
                                                        </th>
                                                        <th>
                                                            <GSTrans t={'component.buylink.tbl.createdDate'}/>
                                                        </th>
                                                        <th>
                                                            <GSTrans t={'component.gsMegaFilter.filterLabel.status'}/>
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {this.state.returnOrderDetailList.map((item, index) => {
                                                        return (
                                                            <tr key={item.id}
                                                                className={[
                                                                    'gsa-hover--gray cursor--pointer'
                                                                ].join(' ')}
                                                                // onMouseDown={ (e) => onClickRow(e, item) }
                                                            >
                                                                <td>
                                                                    <GSFakeLink
                                                                        onClick={() => this.renderToReturnOrderDetail(item.id)}
                                                                        className="d-block gsa-hover--fadeOut cursor--pointer">
                                                                        {item.returnOrderId}
                                                                    </GSFakeLink>
                                                                </td>
                                                                <td>{item.createdDate ? moment(item.createdDate).format('hh:mm DD/MM/YYYY') : ''}</td>
                                                                <td>{this.getStatusOfReturnOrder(item.status)}</td>
                                                            </tr>
                                                        )
                                                    })
                                                    }
                                                    </tbody>
                                                </GSTable>
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                )}
                                {/* END RETURN ORDERS */}


                            </div>
                            <div className="col-lg-3 col-sm-12">
                                {/*CUSTOMER INFORMATION*/}
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader className="gs-widget__header">
                                        <Trans i18nKey="page.order.detail.customer.title"/>
                                    </UikWidgetHeader>
                                    <UikWidgetContent className="gs-widget__content order-info-sm">
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.customer.name"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.customerProfile.id &&
                                                <Link
                                                    to={`${NAV_PATH.customers.CUSTOMERS_EDIT}/${this.state.customerProfile.id}/${this.state.customerProfile.userId}/${this.state.customerProfile.saleChannel}`}>
                                                    {this.state.orderObj.customerInfo.name}
                                                </Link>
                                                }
                                                {!this.state.customerProfile.id &&
                                                <span>
                                                        {this.state.orderObj.customerInfo.name}
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.customer.email"/>
                                            </div>
                                            <div className='order-information__right-value order-information_email'>
                                                {this.state.orderObj.customerInfo.email}
                                            </div>
                                        </div>
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.customer.phone"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.customerInfo.phone}
                                            </div>
                                        </div>

                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                {i18next.t('page.orderList.orderDetail.Debt')}
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.getDebtAmount < 0 &&'-'}{this.state.getDebtAmount ? CurrencyUtils.formatMoneyByCurrency(CurrencyUtils.formatNegativeToInteger(this.state.getDebtAmount), this.currency) : CurrencyUtils.formatMoneyByCurrency((0), this.currency)}
                                            </div>
                                        </div>
                                    </UikWidgetContent>
                                </UikWidget>

                                {/*BILLING ADDRESS*/}
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader className="gs-widget__header">
                                        <Trans i18nKey="page.order.detail.billingAddress.title"/>
                                    </UikWidgetHeader>
                                    <UikWidgetContent className="gs-widget__content order-info-sm">
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.billingAddress.name"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.billingInfo.contactName}
                                            </div>
                                        </div>
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.billingAddress.address"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.billingAddress}
                                            </div>
                                        </div>
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.billingAddress.phone"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.billingInfo.phone}
                                            </div>
                                        </div>
                                    </UikWidgetContent>
                                </UikWidget>

                                {/*SHIPPING ADDRESS*/}
                                <UikWidget className="gs-widget">
                                    <UikWidgetHeader className="gs-widget__header">
                                        <Trans i18nKey="page.order.detail.shippingAddress.title"/>
                                    </UikWidgetHeader>
                                    <UikWidgetContent className="gs-widget__content order-info-sm">
                                        <div className='d-desktop-flex d-mobile-block d-md-block'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.shippingAddress.name"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.shippingInfo.contactName}
                                            </div>
                                        </div>
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.shippingAddress.address"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.shippingAddress}
                                            </div>
                                        </div>
                                        <div className='order-info-sm--group'>
                                            <div className='order-information__left-label'>
                                                <Trans i18nKey="page.order.detail.shippingAddress.phone"/>
                                            </div>
                                            <div className='order-information__right-value'>
                                                {this.state.orderObj.shippingInfo.phone}
                                            </div>
                                        </div>
                                    </UikWidgetContent>
                                </UikWidget>

                                <OrderHistory bcOrderId={this.orderId}/>

                            </div>
                        </div>
                    </GSContentBody>}
                </GSContentContainer>
                <ConfirmModal ref={(el) => this.refLzdConfirmModal = el}/>
            </>
        )
    }
}
