/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React from "react";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import {UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../@uik';
import {Trans} from "react-i18next";
import './ReservationDetail.sass';
import {OrderService} from "../../../services/OrderService";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../utils/gs-toast";
import GSButton from "../../../components/shared/GSButton/GSButton";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import ModalEditReservation from "./ModalEditReservation/ModalEditReservation";
import moment from 'moment';
import {CurrencyUtils, NumberUtils} from "../../../utils/number-format";
import Constants from "../../../config/Constant";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {TokenUtils} from "../../../utils/token";
import {RouteUtils} from "../../../utils/route";
import {STAFF_PERMISSIONS} from "../../../config/staff-permissions";
import {ImageUtils} from "../../../utils/image";
import beehiveService from "../../../services/BeehiveService";
import {DateTimeUtils} from "../../../utils/date-time";
import paymentService from "../../../services/PaymentService";

export default class ReservationDetail extends React.Component {
    _isMounted = false;
    state = {
        orderObj: null,
        isFetching: true,
        isLoadingScreen: false,
        isSaving: false,

        openEditModal: false,
        earnPoint: undefined,
        user: undefined,
        transactionId:""
    };
    reservationId = null;

    constructor(props) {
        super(props);


        this.renderOrderStatus = this.renderOrderStatus.bind(this);
        this.refetchOrder = this.refetchOrder.bind(this);

        // edit button
        this.onClickEdit = this.onClickEdit.bind(this);

        // cancel button
        this.onClickCancelOrder = this.onClickCancelOrder.bind(this);

        // main button
        this.onClickMainButton = this.onClickMainButton.bind(this);

        // not allow user reject
        this.onClickRejectBuyerCancel = this.onClickRejectBuyerCancel.bind(this);

        // allow user reject
        this.onClickAcceptBuyerCancel = this.onClickAcceptBuyerCancel.bind(this);

        this.returnFromEditModal = this.returnFromEditModal.bind(this);

        this.renderEarnPoint = this.renderEarnPoint.bind(this)
    }

    async componentDidMount() {
        if (TokenUtils.isStaff() && !TokenUtils.isHasStaffPermission(STAFF_PERMISSIONS.RESERVATIONS)) {
            RouteUtils.toNotFound(this.props);
        }
        this._isMounted = true;
        let { reservationId } = this.props.match.params;
        this.reservationId = reservationId;

        const orderResult = await OrderService.getReservationDetail(reservationId)


        if (orderResult.data.serviceInfo.loyaltyPoint) { // has point -> get point info
            const { value, expiredDay } = await OrderService.getEarningPoint(reservationId, 'ORDER')
            orderResult.data.reservationInfo.earnPoint = value
            if (expiredDay) {
                orderResult.data.reservationInfo.expiredDay = DateTimeUtils.formatDDMMYYY(expiredDay)
            }
        }

        let user = {}
        if (orderResult.data.customerInfo.userId) {
            user = await beehiveService.getCustomerProfileByGosellUserId(orderResult.data.customerInfo.userId)
        }

        paymentService.getPaymentPayPal(reservationId).then(transactionId=>{
            this.setState({
                transactionId:transactionId?.transactionId
            })
        })

        this.setState({
            orderObj: orderResult.data,
            isFetching: false, user
        })
    }

    renderEarnPoint() {
        const reservartionStatus = this.state.orderObj.reservationInfo.status.toUpperCase()
        if (reservartionStatus == Constants.RESERVATION_STATUS_COMPLETED) {
            if (this.state.orderObj.reservationInfo.expiredDay) {
                return <Trans values={{
                    expired: this.state.orderObj.reservationInfo.expiredDay,
                    point: NumberUtils.formatThousand(this.state.orderObj.reservationInfo.earnPoint)
                }} i18nKey={'page.order.detail.pointAndExpired'} />
            } else {
                if (!this.state.orderObj.reservationInfo.earnPoint) {
                    return 0
                }
                return NumberUtils.formatThousand(this.state.orderObj.reservationInfo.earnPoint)
            }

        }
        if (reservartionStatus == Constants.RESERVATION_STATUS_CANCELLED) {
            return 0
        } else {
            if (!this.state.orderObj.reservationInfo.earnPoint) {
                return 0
            }
            return NumberUtils.formatThousand(this.state.orderObj.reservationInfo.earnPoint)
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    refetchOrder() {
        this.componentDidMount()
    }

    onClickEdit() {
        this.setState({
            openEditModal: true
        }, () => {
            this.refModalEditReservation.onOpen()
        })
    }

    onClickCancelOrder() {
        // show popup to cancel
        this.refModalCancelOrder.openModal({
            messages: i18next.t("page.reservation.detail.popup.cancel.title"),
            okCallback: () => {
                this.setState({
                    isSaving: true
                })

                OrderService.cancelReservation(this.reservationId)
                    .then(order => {
                        this.setState({
                            isSaving: false
                        })
                        this.refetchOrder()
                    }).catch(e => {
                        this.setState({
                            isSaving: false
                        })
                        GSToast.commonError()
                    })
            }
        })
    }

    onClickMainButton(action) {
        // do confirm or complete
        if (action === 'confirm') {
            this.setState({
                isSaving: true
            })

            // call api
            OrderService.confirmReservation(this.reservationId).then(result => {
                this.setState({
                    isSaving: false
                })
                GSToast.success("page.reservation.detail.seller_confirmed", true)
                this.refetchOrder()
            }).catch(e => {
                this.setState({
                    isSaving: false
                })
                try {
                    const errMsg = e.response.data.message;
                    if (errMsg === 'error.item.bookingTime.after') {
                        GSToast.error('page.reservation.detail.fail.expired', true);
                    }
                    else {
                        GSToast.commonError();
                    }
                }
                catch (ex) {
                    GSToast.commonError();
                }
            })

        } else if (action === 'complete') {
            this.setState({
                isSaving: true
            })

            // call api
            OrderService.setDeliveredForSelfDelivery(this.reservationId).then(order => {
                this.setState({
                    isSaving: false
                })
                GSToast.success("page.reservation.detail.seller_completed", true)
                this.refetchOrder()
            }).catch(e => {
                this.setState({
                    isSaving: false
                })
                GSToast.commonError()
            })
        }
    }

    onClickRejectBuyerCancel() {
        this.setState({
            isLoadingScreen: true
        })
        OrderService.rejectBuyerCancel(this.reservationId)
            .then(result => {
                this.setState({
                    isLoadingScreen: false
                })
                this.refetchOrder()
            })
            .catch(e => {
                GSToast.commonError()
                this.setState({
                    isLoadingScreen: false
                })
            })
    }

    onClickAcceptBuyerCancel() {
        this.setState({
            isLoadingScreen: true
        })
        OrderService.acceptBuyerCancel(this.reservationId)
            .then(result => {
                this.setState({
                    isLoadingScreen: false
                })
                this.refetchOrder()
            })
            .catch(e => {
                GSToast.commonError()
                this.setState({
                    isLoadingScreen: false
                })
            })
    }

    returnFromEditModal() {
        this.refetchOrder()
    }

    renderOrderStatus(status) {
        let text;
        let applyClass;

        if (status === 'waiting') {
            text = i18next.t('page.reservation.detail.to_confirm')
            applyClass = "to_confirm"
        } else if (status === 'confirmed') {
            text = i18next.t('page.reservation.detail.confirmed')
            applyClass = "confirmed"
        } else if (status === 'completed') {
            text = i18next.t('page.reservation.detail.completed')
            applyClass = "completed"
        } else if (status === 'cancelled') {
            text = i18next.t('page.reservation.detail.cancelled')
            applyClass = "cancelled"
        }

        return (
            <span className={"status-box " + applyClass}>
                {text}
            </span>
        )
    }

    renderPaidStatus(paid) {
        if (paid) {
            return (
                <div className="order-items__paid order-items__paid-status-paid">
                    <Trans i18nKey="page.order.detail.items.paid" />
                </div>
            )
        } else {
            return (
                <div className="order-items__paid order-items__paid-status-unpaid">
                    <Trans i18nKey="page.order.detail.items.unpaid" />
                </div>
            )
        }
    }

    render() {
        return (
            <>
                {this.state.isLoadingScreen && <LoadingScreen />}
                {
                    this.state.openEditModal &&
                    <ModalEditReservation
                        ref={(el) => this.refModalEditReservation = el}
                        orderObj={this.state.orderObj}
                        orderId={this.reservationId}
                        okCallback={this.returnFromEditModal}
                        user={this.state.user}
                    />
                }

                <ConfirmModal
                    ref={(el) => this.refModalCancelOrder = el}
                />
                <GSContentContainer className="reservation-detail-page" isLoading={this.state.isFetching} isSaving={this.state.isSaving}>
                    {this.state.orderObj !== null &&
                        <GSContentHeader title={i18next.t('page.reservation.detail.title') + ' #' + this.state.orderObj.reservationInfo.bookingId}>
                            <div className='gss-content-header--action-btn'>
                                <div className='gss-content-header--action-btn--group'>
                                    {
                                        (this.state.orderObj.reservationInfo.status === 'waiting') &&
                                        <GSButton success marginLeft onClick={() => this.onClickMainButton('confirm')} id='btn-main'>
                                            <Trans i18nKey="page.reservation.detail.confirm" />
                                        </GSButton>
                                    }
                                    {
                                        (this.state.orderObj.reservationInfo.status === 'confirmed') &&
                                        <GSButton success marginLeft onClick={() => this.onClickMainButton('complete')} id='btn-main'>
                                            <Trans i18nKey="page.reservation.detail.completed" />
                                        </GSButton>
                                    }
                                    {
                                        (this.state.orderObj.reservationInfo.status === 'waiting' || this.state.orderObj.reservationInfo.status === 'confirmed') &&
                                        <GSButton secondary outline marginLeft onClick={this.onClickCancelOrder} id='btn-cancelOrder'>
                                            <Trans i18nKey="page.reservation.detail.button.cancel_reservation" />
                                        </GSButton>
                                    }
                                </div>
                            </div>
                        </GSContentHeader>}
                    {this.state.orderObj !== null &&
                        <GSContentBody size={GSContentBody.size.MAX}>
                            <div className="row">
                                <div className="col-md-8 col-sm-12">
                                    {/*BUYER CANCEL*/}
                                    {/* {   this.state.orderObj.reservationInfo.status === 'IN_CANCEL' &&
                                    <UikWidget className="gs-widget buyer-cancel">
                                        <UikWidgetContent className="gs-widget__content">
                                            <span>
                                                <Trans i18nKey="page.reservation.detail.buyer_request_cancel"/>
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
                                    </UikWidget>
                                } */}

                                    {/*ORDER INFORMATION*/}
                                    <UikWidget className="gs-widget payment-detail">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.reservation.detail.payment_information" />
                                        </UikWidgetHeader>
                                        <UikWidgetContent className="gs-widget__content row">
                                            <div className="col-md-12 order-info-sm">
                                                <div className="order-info-sm--group">
                                                    {/*PAYMENT METHOD*/}
                                                    <div className="order-information__left-label">
                                                        <Trans i18nKey="page.order.detail.information.paymentMethod" />
                                                    </div>
                                                    <div className="order-information__right-value">
                                                        <Trans i18nKey={"page.order.detail.information.paymentMethod." + this.state.orderObj.serviceInfo.paymentMethod} />
                                                    </div>
                                                </div>
                                            </div>
                                            {this.state.orderObj.serviceInfo.paymentMethod == "PAYPAL" &&
                                            <div className="col-md-12 order-info-sm">
                                                <div className="order-info-sm--group">
                                                    <div className="order-information__left-label">
                                                        <Trans i18nKey="page.order.detail.information.paymentMethod.TransactionId" />
                                                    </div>
                                                    <div className="order-information__right-value">
                                                        {this.state.transactionId}
                                                    </div>
                                                </div>
                                            </div>
                                            }

                                            {
                                                <div className="col-md-12 order-info-sm">
                                                    <div className="order-info-sm--group">
                                                        {/*POINTS*/}
                                                        <div className="order-information__left-label">
                                                            <Trans i18nKey="page.loyaltyPoint.setting.earningPoint.title" />
                                                        </div>
                                                        <div className="order-information__right-value">
                                                            {
                                                                this.renderEarnPoint()
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            {this.state.orderObj.serviceInfo.paymentMethod === Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER &&
                                                <>
                                                    <hr />
                                                    <div className="col-md-12 order-info-sm">
                                                        <div className="order-info-sm--group">
                                                            <div className="order-information__left-label"><Trans i18nKey="page.reservation.detail.bank_transfer.message" /></div>
                                                            <div className="order-information__right-value">
                                                                {this.state.orderObj.serviceInfo.bcGroupId + '-' + this.state.orderObj.customerInfo.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="col-12 d-flex align-items-center">
                                                            <img src="/assets/images/icon-alert.svg" alt="" className="mr-3" />
                                                            <span className="gsa__color--gray">
                                                                <GSTrans t={"page.order.detail.information.bankTransferHint"} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                        </UikWidgetContent>
                                    </UikWidget>

                                    {/*ORDER INFORMATION*/}
                                    <UikWidget className="gs-widget reservation-detail">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.reservation.detail.service_information" />
                                        </UikWidgetHeader>
                                        <UikWidgetContent className="gs-widget__content row">
                                            <div className="col-md-2 col-sm-12 detail-left">
                                                <img src={ImageUtils.getImageFromImageModel(this.state.orderObj.serviceInfo.imageUrl, 200)} alt="" />
                                            </div>
                                            <div className="col-md-8 col-sm-12 detail-center">
                                                <div className="name">
                                                    {this.state.orderObj.serviceInfo.name}
                                                </div>
                                                <div className="location">
                                                    <span className="left-font"><Trans i18nKey="page.reservation.detail.location" />: </span>
                                                    {this.state.orderObj.serviceInfo.location}
                                                </div>
                                                <div className="time">
                                                    <span className="left-font"><Trans i18nKey="page.reservation.list.arrival" />: </span>
                                                    {moment(this.state.orderObj.serviceInfo.arrivalDateTime).format('DD-MM-YYYY HH:mm')}
                                                </div>
                                                <div className="quantity">
                                                    <span className="left-font"><Trans i18nKey="page.reservation.detail.quantity" />: </span>
                                                    {this.state.orderObj.serviceInfo.quantity} <Trans i18nKey="page.reservation.detail.guest" />
                                                </div>
                                                {
                                                    (this.state.orderObj.reservationInfo.status === 'waiting' || this.state.orderObj.reservationInfo.status === 'confirmed') &&
                                                    <div className="action">
                                                        <span onClick={this.onClickEdit}>
                                                            <Trans i18nKey="common.btn.edit" />
                                                        </span>
                                                    </div>
                                                }

                                            </div>
                                            <div className="col-md-2 col-sm-12 detail-right">
                                                {CurrencyUtils.formatMoneyByCurrency((this.state.orderObj.serviceInfo.totalPrice / this.state.orderObj.serviceInfo.quantity), this.state.orderObj.serviceInfo.currency) + ' x ' + this.state.orderObj.serviceInfo.quantity}
                                            </div>
                                        </UikWidgetContent>
                                        <UikWidgetContent>
                                            <div className={'total-payment-container'}>
                                                <div>{this.renderPaidStatus(this.state.orderObj.serviceInfo.paid)}</div>
                                                <div>
                                                    <div className="payment-amount">
                                                        <span className="left-font"><Trans i18nKey="page.order.detail.items.subTotal" /></span>
                                                        <span className="right-font">{CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.serviceInfo.subTotal, this.state.orderObj.serviceInfo.currency)}</span>
                                                    </div>
                                                    <div className="payment-amount mt-2">
                                                        <span className="left-font"><Trans i18nKey="page.order.detail.items.discount" />
                                                            {' ('}<GSTrans t={"component.discount.label.wholesale"} />{' )'}</span>
                                                        <span className="right-font">{CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.serviceInfo.discountAmount ? this.state.orderObj.serviceInfo.discountAmount : 0, this.state.orderObj.serviceInfo.currency)}</span>
                                                    </div>

                                                    <div className="payment-amount mt-2">
                                                        <span className="left-font"><Trans i18nKey="page.reservation.detail.point" /></span>
                                                        <span className="right-font">- {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.serviceInfo.pointAmount ? this.state.orderObj.serviceInfo.pointAmount : 0, this.state.orderObj.serviceInfo.currency)}</span>
                                                    </div>
                                                    <div className="payment-amount mt-2">
                                                        <span className="left-font total"><Trans i18nKey="page.reservation.detail.total" /></span>
                                                        <span className="right-font total">{CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.serviceInfo.totalPrice, this.state.orderObj.serviceInfo.currency)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                </div>
                                <div className="col-md-4 col-sm-12">
                                    {/* Reservation information */}
                                    <UikWidget className="gs-widget">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.reservation.detail.reservation_information" />
                                        </UikWidgetHeader>
                                        <UikWidgetContent className="gs-widget__content order-info-sm">
                                            <div className='order-info-sm--group'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.reservation.detail.booking_id" />
                                                </div>
                                                <div className='order-information__right-value'>
                                                    {'#' + this.state.orderObj.reservationInfo.bookingId}
                                                </div>
                                            </div>
                                            <div className='order-info-sm--group'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.reservation.detail.status" />
                                                </div>
                                                <div className='order-information__right-value status'>
                                                    {this.renderOrderStatus(this.state.orderObj.reservationInfo.status)}
                                                </div>
                                            </div>
                                            <div className='order-info-sm--group'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.reservation.detail.booking_date" />
                                                </div>
                                                <div className='order-information__right-value'>
                                                    {moment(this.state.orderObj.reservationInfo.bookingDate).format('DD-MM-YYYY')}
                                                </div>
                                            </div>
                                            <div className='order-info-sm--group' style={{ borderBottom: '1px solid #EAEDF3' }}></div>
                                            <div className='order-info-sm--group'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.reservation.detail.note" />
                                                </div>
                                                <div className='order-information__right-value bounder'>
                                                    <div className="note">{this.state.orderObj.reservationInfo.note}</div>
                                                </div>
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>

                                    {/*CUSTOMER INFORMATION*/}
                                    <UikWidget className="gs-widget">
                                        <UikWidgetHeader className="gs-widget__header">
                                            <Trans i18nKey="page.reservation.detail.customer_information" />
                                        </UikWidgetHeader>
                                        <UikWidgetContent className="gs-widget__content order-info-sm">
                                            <div className='order-info-sm--group'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.reservation.detail.name" />
                                                </div>
                                                <div className='order-information__right-value bounder'>
                                                    {this.state.orderObj.customerInfo.name}
                                                </div>
                                            </div>
                                            <div className='order-info-sm--group'>
                                                <div className='order-information__left-label'>
                                                    <Trans i18nKey="page.reservation.detail.phone_number" />
                                                </div>
                                                <div className='order-information__right-value'>
                                                    {this.state.orderObj.customerInfo.phone}
                                                </div>
                                            </div>
                                        </UikWidgetContent>
                                    </UikWidget>
                                </div>
                            </div>
                        </GSContentBody>}
                </GSContentContainer>
            </>
        )
    }
}
