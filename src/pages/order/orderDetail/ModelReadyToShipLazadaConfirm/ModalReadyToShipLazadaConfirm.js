/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 9/5/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Trans} from "react-i18next";
import './ModelReadyToShipLazadaConfirm.sass'
import Loading from "../../../../components/shared/Loading/Loading";
import {OrderService} from "../../../../services/OrderService";
import Constants from "../../../../config/Constant";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";

class ModalReadyToShipLazadaConfirm extends Component {

    state = {
        isOpen: false,
        isFetching: false,
        onRedirect: false
    };

    constructor(props) {
        super(props);

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.inputs = {}
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
            isFetching: true,
            isOpen: false
        });

        OrderService.setOrderStatus(this.props.siteCode,
            this.props.order.orderInfo.orderId,
            Constants.ORDER_STATUS_TO_SHIP)
            .then( result => {
                    GSToast.success("page.order.detail.readyToShip.success", true)
                    if (this.props.okCallback) {
                        this.props.okCallback()
                    }
                    this.setState({
                        isFetching: false
                    })
                    this.onClose()
                }
            )
            .catch( e => {
                GSToast.error("page.order.detail.readyToShip.failed", true)
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
            <>
                {this.state.isFetching ?
                    <LoadingScreen/>
                    :
                    <Modal isOpen={this.state.isOpen} className="ready-to-ship-confirm-lazada">
                        <ModalHeader className="modal-success">
                            <Trans i18nKey="page.order.detail.readyToShip.orderConfirmation"/>
                        </ModalHeader>
                        <ModalBody>
                            { this.state.isFetching &&
                            <Loading/>
                            }

                            { !this.state.isFetching &&
                            <>
                                <div className="ready-to-ship-confirm__message">
                                    <Trans i18nKey="page.order.detail.readyToShip.message.lazada"/>
                                </div>
                            </>
                            }
                        </ModalBody>
                        { !this.state.isFetching &&
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

ModalReadyToShipLazadaConfirm.propTypes = {
    siteCode: PropTypes.oneOf([Constants.SITE_CODE_LAZADA,
        Constants.SITE_CODE_SHOPEE,
        Constants.SITE_CODE_GOSELL,
        Constants.SITE_CODE_BEECOW]),
    order: PropTypes.object,
    okCallback: PropTypes.func
};

export default ModalReadyToShipLazadaConfirm;
