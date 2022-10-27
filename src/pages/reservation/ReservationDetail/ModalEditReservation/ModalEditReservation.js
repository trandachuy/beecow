/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 18/04/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Trans} from "react-i18next";
import './ModalEditReservation.sass';
import {OrderService} from "../../../../services/OrderService";
import i18next from "i18next";
import {AvField, AvForm} from "availity-reactstrap-validation";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";
import Label from "reactstrap/es/Label";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ItemService} from "../../../../services/ItemService";
import moment from 'moment';
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import AlertInline, {AlertInlineType} from "../../../../components/shared/AlertInline/AlertInline";
import Constants from "../../../../config/Constant";

class ModalEditReservation extends Component {

    DATE_FORMAT = {
        UI_DATE_FORMAT: "DD-MM-YYYY",
        SERVER_DATE_FORMAT: "YYYY-MM-DD"
    };

    state = {
        isOpen: false,
        onRedirect: false,
        isLoading: false,

        locationList: [],
        arrivalTimeList: [],

        currentLocation: null,
        arrivalDate: null,
        arrivalTime: null,
        quantity: 0,
        disabledQuantity: false,
        errMsg: ''
    }

    constructor(props) {
        super(props)

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.changeDateValue = this.changeDateValue.bind(this)
        this.onFormChange = this.onFormChange.bind(this)
        this.isDisabledTimeslot = this.isDisabledTimeslot.bind(this);
    }

    componentDidMount(){
        const arrivalDate = moment(this.props.orderObj.serviceInfo.arrivalDateTime)
        const arrivalTime = moment(this.props.orderObj.serviceInfo.arrivalDateTime).format("HH:mm")

        this.setState({
            isLoading: true,
            arrivalDate: arrivalDate,
            arrivalTime: arrivalTime,
            quantity: this.props.orderObj.serviceInfo.quantity,
            disabledQuantity: this.props.orderObj.serviceInfo.paid
                || (this.props.orderObj.serviceInfo.discountAmount && this.props.orderObj.serviceInfo.discountAmount > 0)
                || (this.props.orderObj.serviceInfo.pointAmount && this.props.orderObj.serviceInfo.pointAmount > 0)
        })
        
        ItemService.fetch(this.props.orderObj.serviceInfo.itemId).then((result) => {
            let hasLocation = false
            let locations = [];
            let timeSlots = [];
            result.models.forEach(model => {
                let nameSplit = model.orgName.split("|");
                const location = nameSplit[0];
                const timeSlot = nameSplit[1];
            
                if(!locations.includes(location)){
                    locations.push(location);
                }
                if(!timeSlots.includes(timeSlot)){
                    timeSlots.push(timeSlot);
                }

                if(location === this.props.orderObj.serviceInfo.location){
                    hasLocation = true
                }
            });

            this.setState({
                isLoading: false,
                locationList: locations,
                arrivalTimeList: timeSlots,
                currentLocation: hasLocation === true ? this.props.orderObj.serviceInfo.location : ''
            })

        }).catch(e => {
            GSToast.commonError()
            this.setState({
                isLoading: false
            })
        });
    }


    onOpen() {
        this.setState({
            isOpen: true,
            errMsg: ''
        })
    }

    onClose() {
        this.setState({
            isOpen: false,
            errMsg: ''
        })
    }

    onSubmit() {
        this.refSubmit.click()
    }

    handleValidSubmit(e, v) {
        // check time
        const selectedTime = moment(this.state.arrivalDate.format('YYYY-MM-DD ') + this.state.arrivalTime)
        const current = moment()
        const diff = selectedTime.diff(current, 'seconds')
        if (diff < 0) {

            this.setState({
                errMsg: i18next.t('page.reservation.detail.updateTimeSlotInvalid')
            })
            return
        } else {
            this.setState({
                errMsg: ''
            })
        }


        this.setState({
            isLoading: true
        })

        // const convertDateToISO = (text, suffix) => {
        //     if (text) {
        //         return moment(text, this.DATE_FORMAT.UI_DATE_FORMAT).format(this.DATE_FORMAT.SERVER_DATE_FORMAT) + suffix;
        //     }
        // };

        const request = {
            orderId: this.props.orderId,
            location: this.state.currentLocation,
            arrivalDateTime: this.state.arrivalDate.format(this.DATE_FORMAT.SERVER_DATE_FORMAT) + ' ' + this.state.arrivalTime,
            quantity: this.state.quantity,
            userId: this.props.orderObj.customerInfo.userId,
            guest: this.props.user.guest
        }

        OrderService.editReservationDetail(this.props.orderId, request).then(result => {
            this.setState({
                isLoading: false
            })

            if (this.props.okCallback) {
                this.props.okCallback()
            }
            
            this.onClose()

        }).catch(e => {
            this.setState({
                isLoading: false
            })

            GSToast.commonError()
        })
    }

    changeDateValue(e, picker){
        this.setState({arrivalDate: picker.startDate})
    }

    onFormChange(event, value){
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    isDisabledTimeslot(time) {

        const selected = moment(this.state.arrivalDate.format('YYYY-MM-DD ') + time)
        const current = moment()
        const diff = selected.diff(current, 'seconds')
        return diff < 0
    }


    render() {
        return (
            <>
                {this.state.isLoading && <LoadingScreen zIndex={Constants.Z_INDEX_SYSTEM.TOP}/>}
                
                    <Modal isOpen={this.state.isOpen} className="modal-cancel-reservation-confirm">
                        <ModalHeader>
                            <div className="header-custom">
                                <i
                                    className="btn-close__icon d-mobile-none d-desktop-inline"
                                    onClick={() => this.onClose('cancel')}
                                />
                                <Trans i18nKey="page.reservation.detail.popup.edit.title"/>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <AvForm onValidSubmit={this.handleValidSubmit} autoComplete="off">
                                <button hidden ref={el => this.refSubmit = el}/>
                                <div className="row reservation-warning p-2">
                                    <div className="col-md-12 mb-2">
                                        <img src="/assets/images/icon-alert.svg" alt="" className="mr-3"/>
                                        <span className="gsa__color--gray">
                                             <GSTrans t={"page.reservation.detail.editModal.message1"}/>
                                        </span>
                                    </div>
                                    <div className="col-md-12">
                                        <img src="/assets/images/icon-alert.svg" alt="" className="mr-3"/>
                                        <span className="gsa__color--gray">
                                             <GSTrans t={"page.reservation.detail.editModal.message2"}/>
                                        </span>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <Label for={'currentLocation'} className="gs-frm-control__title">
                                            <Trans i18nKey="page.reservation.detail.location"/>
                                        </Label>
                                        <AvField
                                            type="select"
                                            name="currentLocation"
                                            value={this.state.currentLocation}
                                            onChange={ (event, value) => this.onFormChange(event, value)}
                                            validate={{
                                            required: {value: true, errorMessage: i18next.t("common.validation.required")}
                                        }}>
                                            <option value=''></option>
                                            {
                                                this.state.locationList &&
                                                this.state.locationList.map(location => {
                                                    return (
                                                        <option value={location}>{location}</option>
                                                    );
                                                })
                                            }
                                        </AvField>
                                    </div> 
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Label for={'arrival_date'} className="gs-frm-control__title">
                                            <Trans i18nKey="page.reservation.detail.popup.edit.arrival_date"/>
                                        </Label>
                                        <DateRangePicker
                                            minDate={moment().format(this.DATE_FORMAT.UI_DATE_FORMAT)}
                                            minDateFormat
                                            containerClass="reservation-date"
                                            minimumNights={0}
                                            onApply={(e, pickup) => this.changeDateValue(e, pickup)} 
                                            singleDatePicker
                                            locale={{format: this.DATE_FORMAT.UI_DATE_FORMAT}}
                                            startDate={this.state.arrivalDate ? this.state.arrivalDate.format(this.DATE_FORMAT.UI_DATE_FORMAT) : moment()}
                                        >
                                            <AvField
                                                name="arrival_date"
                                                onChange={() => {}} 
                                                value={this.state.arrivalDate ? this.state.arrivalDate.format(this.DATE_FORMAT.UI_DATE_FORMAT) : ''} 
                                                className="form-control"
                                                validate={{
                                                    required: {value: true, errorMessage: i18next.t("common.validation.required")}
                                                }}
                                                onKeyPress={ e => e.preventDefault()}
                                            />
                                            <FontAwesomeIcon className="reservation-date__icon" icon="calendar" color="#939393" size="lg"/>
                                        </DateRangePicker>
                                    </div>
                                    <div className="col-md-6">
                                        <Label for={'arrivalTime'} className="gs-frm-control__title">
                                            <Trans i18nKey="page.reservation.detail.popup.edit.arrival_time"/>
                                        </Label>
                                        <AvField
                                            type="select"
                                            name="arrivalTime"
                                            value={this.state.arrivalTime}
                                            onChange={ (event, value) => this.onFormChange(event, value)}
                                            validate={{
                                            maxLength: {value: 200, errorMessage: i18next.t("common.validation.char.max.length", {x: 200})}
                                        }}>
                                            {
                                                this.state.arrivalTimeList &&
                                                this.state.arrivalTimeList.map(time => {
                                                    return (
                                                        <option value={time} disabled={
                                                            this.isDisabledTimeslot(time)
                                                        }>{time}</option>
                                                    );
                                                })
                                            }
                                        </AvField>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Label for={'quantity'} className="gs-frm-control__title">
                                            <Trans i18nKey="page.reservation.detail.quantity"/>
                                        </Label>
                                        <div className="reservation-quantity">
                                            <AvField
                                                disabled={this.state.disabledQuantity}
                                                className="value"
                                                name="quantity"
                                                value={this.state.quantity}
                                                onChange={ (event, value) => this.onFormChange(event, value)}
                                                validate={{
                                                required: {value: true, errorMessage: i18next.t("common.validation.required")},
                                                    number: {value: true, errorMessage: i18next.t('common.validation.number.format')},
                                                    min: {value: 1, errorMessage: i18next.t("common.validation.number.min.value", {x : 1})},
                                                    max: {value: 999, errorMessage: i18next.t("common.validation.number.max.value", {x: 999})}
                                                }}
                                            />
                                            <span className="unit"><Trans i18nKey="page.reservation.detail.guest"/></span>
                                        </div>
                                        
                                    </div>
                                </div>
                                
                            </AvForm>
                            {this.state.errMsg && <AlertInline type={AlertInlineType.ERROR} nonIcon text={this.state.errMsg}/>}
                        </ModalBody>
                        <ModalFooter className="ready-to-ship-confirm__btn-wrapper gs-modal__footer--no-top-border">
                            <div className="footer-custom row">
                                <div className="col-md-12 footer-col__custom">
                                    <GSButton secondary outline onClick={this.onClose} className={this.state.isLoading ? "gs-atm--disable" : ""}>
                                        <Trans i18nKey="common.btn.cancel"/>
                                    </GSButton>
                                    <GSButton success marginLeft onClick={this.onSubmit} className={this.state.isLoading ? "gs-atm--disable" : ""}>
                                        <Trans i18nKey="common.btn.ok"/>
                                    </GSButton>
                                </div>
                            </div>
                        </ModalFooter>
                    </Modal>
                {/*<AlertModal ref={ el => this.refAlertModal = el } />*/}

            </>
        );
    }
}

export default ModalEditReservation;
