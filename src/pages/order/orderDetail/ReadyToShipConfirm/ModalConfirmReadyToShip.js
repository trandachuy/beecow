/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 18/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes, {any} from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Trans} from "react-i18next";
import './ReadyToShipConfirm.sass'
import CryStrapInput, {CurrencySymbol} from "../../../../components/shared/form/CryStrapInput/CryStrapInput";
import Loading from "../../../../components/shared/Loading/Loading";
import {OrderService} from "../../../../services/OrderService";
import Constants from "../../../../config/Constant";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {ORDER_TYPE} from "../OrderDetail";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import i18next from "../../../../config/i18n";
import {UikSelect} from '../../../../@uik'
import {AddressUtils} from "../../../../utils/address-utils";
import GSTooltip, {GSTooltipIcon} from "../../../../components/shared/GSTooltip/GSTooltip";

class ModalConfirmReadyToShip extends Component {


    state = {
        isOpen: false,
        isFetching: false,
        onRedirect: false,
    }

    constructor(props) {
        super(props)
        this.state = {
            viewDetail:false,
            selectedAddressLevel4: null,
            addressLevel4s: [],
            stError: ''
        }

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.removeInvalidImeiItemCallback = this.removeInvalidImeiItemCallback.bind(this);
        this.onChangeAddressLevel4 = this.onChangeAddressLevel4.bind(this);
        this.fetchDataOfAddressLevel4 = this.fetchDataOfAddressLevel4.bind(this);
        this.inputs = {};

    }

    isShowSelectAddressLevel4(){
        if (this.props.order.orderInfo?.deliveryName === Constants.LogisticCode.Common.GIAO_HANG_TIET_KIEM
        && Constants.LogisticCode.Province.LIST_SHOW_ADDRESS_LEVEL_4.includes(this.props.order.shippingInfo.insideCityCode)
        ) {
            return true
        }else{
            return false
        }
    }


    onOpen() {
        if (this.props.order.orderInfo?.paymentMethod === Constants.ORDER_PAYMENT_METHOD_PAYPAL) {
            this.onSubmit()
        } else {
            this.setState({
                isOpen: true
            })
            if (this.isShowSelectAddressLevel4()) {
                this.fetchDataOfAddressLevel4();
            }
        }

    }

    onClose() {
        this.setState({
            isOpen: false
        })
    }

    handleViewDetail(e) {
        e.preventDefault();
        e.target.style.display = "none";
    }

    copyToClipboard = (e,data) => {
        let textArea = document.createElement("textarea");
        textArea.value = data
        document.body.appendChild(textArea);
        //select textarea
        textArea.select();
        //working on mobile
        textArea.setSelectionRange(0, 99999);
        document.execCommand("Copy");
        textArea.remove();
        this.copyError.click()
        
    };

    handleCopyError = (e) => {
        e.target.innerHTML = i18next.t('component.copy.success')
    }

    removeInvalidImeiItemCallback(invalidImeiSerials) {
        this.props.removeInvalidImeiItemCallback(invalidImeiSerials);
    }

    onChangeAddressLevel4(item) {
        let error = ''
        if(item.value === ''){
                error = i18next.t('page.order.detail.readyToShip.delivery.area.isrequired')
        }

        this.setState({
            selectedAddressLevel4 : item,
            stError : error,
        },() => {
            console.log(" get data new")
            //this.fetchDataOfAddressLevel4();
        })
    }
    fetchDataOfAddressLevel4() {
        const shippingInfo = this.props.order.shippingInfo;
       AddressUtils.getAddressInsiteName( shippingInfo.ward,shippingInfo.district, shippingInfo.insideCityCode).then(values => {
           const addressNames = values.map(item => item.inCountry)

           const [wardName, districtName, cityName] = addressNames
           const ghtkGetAddressLevel4VM = {
               address: shippingInfo.address1,
               province: cityName,
               district: districtName,
               wardStreet: wardName }
           OrderService.getAddressLevel4(ghtkGetAddressLevel4VM)
               .then((res) => {
                   const listData = res.data?.map(x => {
                       return { value: x, label: x }
                   });
                //   console.log(listData)
                   const selected = {value: '', label:  i18next.t('page.order.detail.readyToShip.delivery.area.default')}
                   listData.unshift(selected);
                   this.setState({
                       addressLevel4s : listData,
                       selectedAddressLevel4 : listData[0],
                   })

               })
               .catch((e) => {
                   GSToast.commonError();
               });

       })



    }

    onSubmit() {

        if(this.isShowSelectAddressLevel4() && this.state.selectedAddressLevel4?.value === ''){
            this.setState({
                stError :  i18next.t('page.order.detail.readyToShip.delivery.area.isrequired'),
            })
            return;
        }
        this.setState({
            isFetching: true,
            isOpen: false,
        })

        let length = this.inputs.ipLength ? this.inputs.ipLength.getValue() : 0
        let width = this.inputs.ipLength ? this.inputs.ipWidth.getValue() : 0
        let height = this.inputs.ipLength ? this.inputs.ipHeight.getValue() : 0


       console.log('address lv4',this.state.selectedAddressLevel4?.value)
        OrderService.setOrderStatus(this.props.siteCode,
            this.props.order.orderInfo.orderId,
            Constants.ORDER_STATUS_TO_SHIP,
            {
                length: length,
                width: width,
                height: height,
                itemIMEISerials: this.props.itemIMEISerials,
                hamlet: this.state.selectedAddressLevel4?.value,
            })
            .then(result => {
                GSToast.success("page.order.detail.readyToShip.success", true)
            })
            .catch(e => {
                if (e.response.status === 400 && e.response.data.message === 'error.order.invalid.imei') {
                    GSToast.error("page.order.detail.confirm.imei.not.available.error", true);
                    this.removeInvalidImeiItemCallback(e.response.data.params.invalidImei);
                    return;
                }
                this.confirmOrderFailed.openModal({
                    messages: <>
                        <h3>{i18next.t('page.order.detail.readyToShip.failed.unsuccessfully')}</h3>
                        {
                            !this.state.viewDetail &&
                            <h4 onClick={this.handleViewDetail} className="cursor--pointer" data-toggle="collapse"
                                data-target="#Detail">
                                    {i18next.t('page.order.detail.readyToShip.failed.viewDetail')}
                            </h4>
                        }

                        
                        <p className="m-0" id="Detail" className="collapse cursor--pointer" onClick={event=>this.copyToClipboard(event,JSON.stringify(e.response.data, null, 2))} ref={(textarea) => this.textArea = textarea}>
                            {
                                JSON.stringify(e.response.data, null, 2)
                            }
                            <p onClick={this.handleCopyError} ref={el => this.copyError = el} className="copy">{i18next.t('page.landingPage.editor.modal.btn.copy')}</p>
                        </p>
                        
                    </>,
                    modalTitle: i18next.t('common.txt.alert.modal.title'),
                    modalBtnOk: i18next.t('common.btn.alert.modal.close'),
                    okCallback: () => {

                    }
                })

                if (e.response.status !== 500 && !e.response.data.message) {
                    GSToast.error("page.order.detail.readyToShip.failed", true)
                    return;
                }
                const errMsg = e.response.data.message;
                if (errMsg.includes("description")) {
                    try {
                        const matches = errMsg.match(/("description": ")(.*?)"/);
                        if (matches && matches.length > 1) {
                            GSToast.error(matches[matches.length - 1]);
                        } else {
                            GSToast.error("page.order.detail.readyToShip.failed", true)
                        }
                    } catch (e) {
                        GSToast.error("page.order.detail.readyToShip.failed", true)
                    }
                } else if (errMsg.includes("title")) {
                    try {
                        const matches = errMsg.match(/("title": ")(.*?)"/);
                        if (matches && matches.length > 1) {
                            GSToast.error(matches[matches.length - 1]);
                        } else {
                            GSToast.error("page.order.detail.readyToShip.failed", true)
                        }
                    } catch (e) {
                        GSToast.error("page.order.detail.readyToShip.failed", true)
                    }
                } else if (errMsg === 'error.deliveryServiceProvider.sendDeliveryRequest') {
                    if (!e.response.data.params) {
                        GSToast.error("page.order.detail.readyToShip.failed", true)
                        return
                    }
                    if (e.response.data.params.providerName === 'giaohangnhanh') {
                        if (!e.response.data.params.response) {
                            GSToast.error("page.order.detail.readyToShip.failed", true)
                            return;
                        }
                        const ghnErrMsg = JSON.parse(e.response.data.params.response);
                        if (!ghnErrMsg.code_message) {
                            GSToast.error("page.order.detail.readyToShip.failed", true)
                            return;
                        }
                        if (ghnErrMsg.code_message === 'PHONE_INVALID') {
                            GSToast.error('page.order.detail.readyToShip.failed.ghn.phoneInvalid', true);
                        } else {
                            GSToast.error("page.order.detail.readyToShip.failed", true)
                            return;
                        }
                    } else {
                        GSToast.error("page.order.detail.readyToShip.failed", true)
                        return;
                    }
                } else {
                    GSToast.error("page.order.detail.readyToShip.failed", true)
                    return;
                }
            })
            .finally(() => {
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                this.setState({
                    isFetching: false
                })
                this.onClose()
            })
    }


    render() {
        return (
            <><ConfirmModal ref={(el) => {
                this.confirmOrderFailed = el
            }} modalClass={'confirm-order-failed'}/>
                {this.state.isFetching ?
                    <LoadingScreen/>
                    :
                    <Modal isOpen={this.state.isOpen} className="ready-to-ship-confirm">
                        <ModalHeader className="modal-success">
                            <Trans i18nKey="page.order.detail.readyToShip.orderConfirmation"/>
                        </ModalHeader>
                        {this.props.order &&
                        this.props.order.orderInfo.deliveryName === Constants.LogisticCode.Common.SELF_DELIVERY &&
                        this.props.orderType !== ORDER_TYPE.DEPOSIT &&
                        <div className="mt-5">

                        </div>
                        }
                        {this.props.order &&
                        <ModalBody
                            hidden={this.props.order.orderInfo.deliveryName === Constants.LogisticCode.Common.SELF_DELIVERY && this.props.orderType !== ORDER_TYPE.DEPOSIT}>
                            {this.state.isFetching &&
                            <Loading/>
                            }

                            {!this.state.isFetching &&
                            <>
                                {/*MESSAGE FOR DEPOSIT*/}
                                {this.props.orderType === ORDER_TYPE.DEPOSIT &&
                                <div className="ready-to-ship-confirm__deposit">
                                    <img src="/assets/images/icon-error.svg" alt="err-icon"/>
                                    <GSTrans t="page.order.detail.confirmShipping.depositWarning"/>
                                </div>
                                }
                                <div
                                    hidden={this.props.order.orderInfo.deliveryName === Constants.LogisticCode.Common.SELF_DELIVERY}>

                                        {this.isShowSelectAddressLevel4() ?
                                            <div className="ready-to-ship-confirm__message_ghtk">
                                                <Trans i18nKey="page.order.detail.readyToShip.message.ghtk"/> </div> :
                                            <div className="ready-to-ship-confirm__message">
                                            <Trans i18nKey="page.order.detail.readyToShip.message"/>
                                           </div>


                                        }

                                    {/*Address level 4 for GHTK*/}
                                    { this.isShowSelectAddressLevel4() &&

                                   <div className="row" style={{textAlign: 'left'}}>
                                       <div className="col-md-12 col-sm-12">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.order.detail.readyToShip.delivery.area"/>
                                                <GSTooltip message={i18next.t("page.order.detail.readyToShip.delivery.area.tooltip")} icon={GSTooltipIcon.INFO_CIRCLE}/>

                                            </span>
                                           {/*value={[{ value: stSearch.by }]}
                                                defaultValue={this.state.selectedAddressLevel4?.value }
                                              */}
                                            <UikSelect
                                                onChange={this.onChangeAddressLevel4}
                                                position={"bottomRight"}
                                                className={"col-md-12 col-sm-12 p-0 custom-filter"}
                                                options={this.state.addressLevel4s}
                                                value={[{ value: this.state.selectedAddressLevel4?.value }]}
                                            />
                                           <div className='description'>
                                               <div className='error'>{this.state.stError}</div>
                                           </div>

                                       </div>
                                   </div>}
                                    <div className="ready-to-ship-confirm__message_ghtk">
                                        <Trans i18nKey="page.order.detail.readyToShip.package.dimension"/>
                                    </div>
                                    <div className="row" style={{textAlign: 'left'}}>
                                        <div className="col-md-4 col-sm-12">
                                                    <span className="gs-frm-input__label">
                                                            <Trans i18nKey="page.order.detail.readyToShip.length"/>
                                                        </span>
                                            <CryStrapInput
                                                unit={CurrencySymbol.CM}
                                                default_value={this.props.length < 50 ? this.props.length : 50}
                                                precision={0}
                                                thousandSeparator=","
                                                max_value={50}
                                                min_value={1}
                                                ref={(el) => this.inputs.ipLength = el}
                                            />
                                        </div>
                                        <div className="col-md-4 col-sm-12">
                                                     <span className="gs-frm-input__label">
                                                            <Trans i18nKey="page.order.detail.readyToShip.width"/>
                                                        </span>
                                            <CryStrapInput
                                                unit={CurrencySymbol.CM}
                                                default_value={this.props.width < 50 ? this.props.width : 50}
                                                precision={0}
                                                thousandSeparator=","
                                                max_value={50}
                                                min_value={1}
                                                ref={(el) => this.inputs.ipWidth = el}
                                            />
                                        </div>
                                        <div className="col-md-4 col-sm-12">
                                                    <span className="gs-frm-input__label">
                                                            <Trans i18nKey="page.order.detail.readyToShip.height"/>
                                                        </span>
                                            <CryStrapInput
                                                unit={CurrencySymbol.CM}
                                                default_value={this.props.height < 50 ? this.props.height : 50}
                                                precision={0}
                                                thousandSeparator=","
                                                max_value={50}
                                                min_value={1}
                                                ref={(el) => this.inputs.ipHeight = el}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                            }
                        </ModalBody>}
                        {!this.state.isFetching &&
                        <ModalFooter className="ready-to-ship-confirm__btn-wrapper gs-modal__footer--no-top-border">
                            <GSButton secondary outline onClick={this.onClose}>
                                <Trans i18nKey="page.order.detail.readyToShip.btn.cancel"/>
                            </GSButton>
                            <GSButton success marginLeft onClick={this.onSubmit}>
                                <Trans i18nKey="page.order.detail.readyToShip.btn.confirm"/>
                            </GSButton>
                        </ModalFooter>}
                    </Modal>
                }
                {/*<AlertModal ref={ el => this.refAlertModal = el } />*/}

            </>
        );
    }


}

ModalConfirmReadyToShip.propTypes = {
    length: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    siteCode: PropTypes.oneOf([Constants.SITE_CODE_LAZADA,
        Constants.SITE_CODE_SHOPEE,
        Constants.SITE_CODE_GOSELL,
        Constants.SITE_CODE_BEECOW]),
    order: PropTypes.object,
    okCallback: PropTypes.func,
    orderType: PropTypes.oneOf(['normal', 'deposit']),
    removeInvalidImeiItemCallback: PropTypes.func,
    selectedAddressLevel4: PropTypes.object,
};

export default ModalConfirmReadyToShip;
