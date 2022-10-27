/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 8/5/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Trans} from "react-i18next";
import {UikSelect} from '../../../../@uik'
import './ModalCancelLazadaOrderConfirm.sass'
import {OrderService} from "../../../../services/OrderService";
import Constants from "../../../../config/Constant";
import i18next from "i18next";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";

class ModalCancelLadazaOrderConfirm extends Component {

    state = {
        isOpen: false,
        onRedirect: false,
        isLoading: false,
        reasonId: null,
        reasonDetail: null
    };

    constructor(props) {
        super(props);

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onOpen() {
        this.setState({
            isOpen: true
        })
    }

    onClose() {
        this.setState({
            isOpen: false
        })
    }

    onSubmit() {
        this.setState({
            isOpen: false,
            isLoading: true
        });
        let extendedInfos = {
            reasonId: this.state.reasonId,
            reasonDetail: this.state.reasonDetail
        };
        OrderService.setOrderStatus(this.props.siteCode,
            this.props.order.orderInfo.orderId,
            Constants.ORDER_STATUS_CANCELLED, extendedInfos)
            .then( result => {
                GSToast.success("page.order.detail.cancelOrder.success", true)
                this.setState({
                    isLoading: false
                });

                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                this.onClose()
            })
            .catch( e => {
                GSToast.error("page.order.detail.cancelOrder.failed", true)
                this.setState({
                    isLoading: false
                });
                if (this.props.okCallback) {
                    this.props.okCallback()
                }
                this.onClose()
            })
    }

    render() {
        return (
            <>
                {this.state.isLoading ?
                    <LoadingScreen/>
                    :
                    <Modal isOpen={this.state.isOpen} className="modal-lzd-cancel-order-confirm model-mw-300px">
                        <ModalHeader className="modal-success">
                            <Trans i18nKey="page.order.detail.cancelOrder.confirmation"/>
                        </ModalHeader>
                        <ModalBody>
                            <div className="ready-to-ship-confirm__message">
                                <Trans i18nKey="page.order.detail.cancelOrder.shopee.message"/>
                            </div>
                            <UikSelect
                                className='select-reason'
                                placeholder={<Trans i18nKey='common.text.select'/>}
                                onChange={(event) => {
                                    this.setState({
                                        reasonId: event.value,
                                        reasonDetail: event.value === Constants.LAZADA_ORDER_CANCEL_REASON_OUT_OF_STOCK ? i18next.t(Constants.LAZADA_ORDER_CANCEL_REASON_OUT_OF_STOCK_TEXT) :
                                            event.value === Constants.LAZADA_ORDER_CANCEL_REASON_WRONG_PRICE ? i18next.t(Constants.LAZADA_ORDER_CANCEL_REASON_WRONG_PRICE_TEXT) :
                                            ''
                                    });
                                }}
                                options={[
                                    {
                                        value: Constants.LAZADA_ORDER_CANCEL_REASON_OUT_OF_STOCK,
                                        label: <Trans i18nKey={Constants.LAZADA_ORDER_CANCEL_REASON_OUT_OF_STOCK_TEXT}/>
                                    },
                                    {
                                        value: Constants.LAZADA_ORDER_CANCEL_REASON_WRONG_PRICE,
                                        label: <Trans i18nKey={Constants.LAZADA_ORDER_CANCEL_REASON_WRONG_PRICE_TEXT}/>
                                    }
                                ]}
                            />
                        </ModalBody>
                        <ModalFooter className="ready-to-ship-confirm__btn-wrapper gs-modal__footer--no-top-border">
                            <GSButton secondary outline onClick={this.onClose}>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>
                            <GSButton success marginLeft onClick={this.onSubmit}>
                                <Trans i18nKey="common.btn.ok"/>
                            </GSButton>
                        </ModalFooter>
                    </Modal>}
                {/*<AlertModal ref={ el => this.refAlertModal = el } />*/}

            </>
        );
    }
}

ModalCancelLadazaOrderConfirm.propTypes = {
    siteCode: PropTypes.oneOf([Constants.SITE_CODE_LAZADA,
        Constants.SITE_CODE_SHOPEE,
        Constants.SITE_CODE_GOSELL,
        Constants.SITE_CODE_BEECOW]),
    order: PropTypes.object,
    okCallback: PropTypes.func
};

export default ModalCancelLadazaOrderConfirm;
