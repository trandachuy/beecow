/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 3/5/2019
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
import './ModalCancelShopeeOrderConfirm.sass'
import {OrderService} from "../../../../services/OrderService";
import Constants from "../../../../config/Constant";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {GSToast} from "../../../../utils/gs-toast";

class ModalCancelShopeeOrderConfirm extends Component {

    state = {
        isOpen: false,
        onRedirect: false,
        isLoading: false,
        reason: null,
        outOfStockItem: null
    };

    constructor(props) {
        super(props);

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.showOkButton = this.showOkButton.bind(this);
    }

    onOpen() {
        this.setState({
            isOpen: true,
            reason: null,
            outOfStockItem: null
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
            reason: this.state.reason
        };
        if (this.state.outOfStockItem) {
            extendedInfos.outOfStockItem = {
                itemId: this.state.outOfStockItem.itemId,
                variationId: this.state.outOfStockItem.variationId
            };
        }
        OrderService.setOrderStatus(this.props.siteCode,
            this.props.order.orderInfo.orderId,
            Constants.ORDER_STATUS_CANCELLED, extendedInfos)
            .then( result => {
                GSToast.success("page.order.detail.cancelOrder.success", true)
                this.setState({
                    isLoading: false
                });

                if (this.props.okCallback) {
                    this.props.okCallback(result)
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

    showOkButton() {
        let isShow = false;
        if (this.state.reason) {
            if (this.state.reason !== Constants.SHOPEE_ORDER_CANCEL_REASON_OUT_OF_STOCK || this.state.outOfStockItem) {
                isShow = true;
            }
        }
        return isShow;
    }

    render() {
        return (
            <>
                {this.state.isLoading ?
                    <LoadingScreen/>
                    :
                    <Modal isOpen={this.state.isOpen} className="modal-sp-cancel-order-confirm model-mw-300px">
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
                                    this.setState({reason: event.value});
                                }}
                                required={true}
                                options={[
                                    {
                                        value: Constants.SHOPEE_ORDER_CANCEL_REASON_OUT_OF_STOCK,
                                        label: <Trans i18nKey='page.order.detail.cancelOrder.shopee.outOfStock'/>
                                    },
                                    {
                                        value: Constants.SHOPEE_ORDER_CANCEL_REASON_CUSTOMER_REQUEST,
                                        label: <Trans i18nKey='page.order.detail.cancelOrder.shopee.customerRequest'/>
                                    },
                                    {
                                        value: Constants.SHOPEE_ORDER_CANCEL_REASON_UNDELIVERABLE_AREA,
                                        label: <Trans i18nKey='page.order.detail.cancelOrder.shopee.undeliverable'/>
                                    },
                                    {
                                        value: Constants.SHOPEE_ORDER_CANCEL_REASON_COD_NOT_SUPPORTED,
                                        label: <Trans i18nKey='page.order.detail.cancelOrder.shopee.codNotSupport'/>
                                    }
                                ]}
                            />
                            {this.state.reason === Constants.SHOPEE_ORDER_CANCEL_REASON_OUT_OF_STOCK &&
                            <UikSelect
                                className='select-reason'
                                placeholder='Select Item'
                                onChange={(event) => {
                                    this.setState({outOfStockItem: event.value});
                                }}
                                required={true}
                                options={ this.props.order.items.map(item => {
                                    return {value: item, label: item.name};
                                })
                                }
                            />
                            }
                        </ModalBody>
                        <ModalFooter className="ready-to-ship-confirm__btn-wrapper gs-modal__footer--no-top-border">
                            <GSButton secondary outline onClick={this.onClose}>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>
                            <GSButton success marginLeft onClick={this.onSubmit} className={this.showOkButton() ? '' : 'gs-atm--disable'}>
                                <Trans i18nKey="common.btn.ok"/>
                            </GSButton>
                        </ModalFooter>
                    </Modal>}
                {/*<AlertModal ref={ el => this.refAlertModal = el } />*/}

            </>
        );
    }
}

ModalCancelShopeeOrderConfirm.propTypes = {
    siteCode: PropTypes.oneOf([Constants.SITE_CODE_LAZADA,
        Constants.SITE_CODE_SHOPEE,
        Constants.SITE_CODE_GOSELL,
        Constants.SITE_CODE_BEECOW]),
    order: PropTypes.object,
    okCallback: PropTypes.func
};

export default ModalCancelShopeeOrderConfirm;
