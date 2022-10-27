/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import './ItemRow.sass';
import PropTypes from "prop-types";
import {CurrencyUtils} from "../../../../utils/number-format";
import shopeeService from "../../../../services/ShopeeService";
import Constants from "../../../../config/Constant";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import i18next from "i18next";


export default class ItemRow extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            imageURL : this.props.item.imageUrl ? this.props.item.imageUrl : '',
            isModaIMEI : false
        }

        this.selectOrderItemCallback = this.selectOrderItemCallback.bind(this);
        this.renderModalIMEI = this.renderModalIMEI.bind(this);
        this.handleIsModalIMEI = this.handleIsModalIMEI.bind(this);
    }

    componentDidMount(){
        this._isMounted = true;

        // in case shopee item
        if(this.props.siteCode === Constants.SITE_CODE_SHOPEE){
            // lazy load image
            shopeeService.getItemImage(this.props.item.itemId).then(res =>{
                let Url = res;
                if(Url){
                    this.setState({imageURL : Url});
                }

            }).catch(e => {
                console.log(e);
            });
        }
    }

    selectOrderItemCallback() {
        this.props.selectOrderItemCallback(this.props.item);
    }

    renderModalIMEI() {
        return (
            <Modal isOpen={this.state.isModaIMEI} toggle={this.handleIsModalIMEI} className="modaIMEI-order-detail">
                <ModalHeader toggle={this.handleIsModalIMEI}>{i18next.t("page.affiliate.partner.sold")}</ModalHeader>
                <ModalBody>
                    {this.props.item.orderItemIMEIs?.map(itemIMEI=>{
                        return(
                            <>
                                <div className="itemIMEI">
                                    {itemIMEI.imeiSerial}
                                </div>
                            </>
                        )
                    })}
                </ModalBody>
            </Modal>
        )
    }

    handleIsModalIMEI() {
        this.setState(state=>({
            ...state,
            isModaIMEI: !state.isModaIMEI
        }))
    }


    render() {
        return (
            <>
                {this.props.index === 0 &&
                    <div className="item-row header">
                        <div className="item-row__info">
                            <b>
                                {i18next.t('productList.tbheader.productName')}
                            </b>
                        </div>
                        <div className="item-row__quantity">
                            <p>
                                {i18next.t('page.order.detail.priceQuantity')}
                            </p>

                        </div>
                        <div className="item-row__unit d-desktop-flex">
                            <b>
                                {i18next.t('component.product.addNew.unit.title')}
                            </b>
                        </div>
                        <div className="item-row__total-price d-desktop-flex">
                            <b>
                                {i18next.t('page.order.list.table.th.total')}
                            </b>
                        </div>
                    </div>
                }
                <div className="item-row">
                    {this.renderModalIMEI()}
                    <img className={"item-row__thumbnail " + (this.state.imageURL ? '' : 'item-row__thumbnail--empty')}
                         src={this.state.imageURL ? this.state.imageURL : '/assets/images/page_order/empty_item.svg'}/>
                    <div className="item-row__info">
                        <b className="item-row__item-name">
                            {this.props.item.name}
                        </b>
                        {this.props.item.variationName &&
                        <p>
                            {this.props.item.variationName.replace('|' + Constants.DEPOSIT_CODE.FULL, '')}
                        </p>
                        }
                        {this.props.item.flashSale &&
                        <p>
                            Flash Sale
                        </p>
                        }
                        <p>
                            {this.props.item.variationSku}
                        </p>
                        <p className="d-mobile-flex d-desktop-none">
                            {this.props.orderStatus === Constants.ORDER_STATUS_TO_SHIP &&
                            this.props.item.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER &&
                            <a href="javascript:void(0)" onClick={this.selectOrderItemCallback}><img className="mr-1"
                                                                                                     src="/assets/images/Vector.png"/>
                                {this.props.item.imeiSerial.length === 0 ?
                                    <GSTrans t='page.order.detail.confirm.imei.not.select'/> :
                                    <GSTrans t='page.order.detail.confirm.imei.selected' values={{
                                        curr: this.props.item.imeiSerial.length,
                                        max: this.props.item.quantity
                                    }}/>}
                            </a>
                            }
                        </p>

                        <p className="d-mobile-flex d-desktop-none">
                            {this.props.orderStatus !== Constants.ORDER_STATUS_TO_SHIP && this.props.orderStatus !== Constants.ORDER_STATUS_CANCELLED &&
                            this.props.item.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER &&
                            <a href="javascript:void(0)" onClick={this.handleIsModalIMEI}><img className="mr-1"
                                                                                               src="/assets/images/Vector.png"/>
                                {this.props.item.orderItemIMEIs.length > 0 &&
                                <GSTrans t='page.order.detail.confirm.modal.imei.selected' values={{
                                    curr: this.props.item.orderItemIMEIs.length
                                }}/>}
                            </a>
                            }
                        </p>
                    </div>
                    <div className="item-row__quantity">
                        <p>
                            <b>
                                {CurrencyUtils.formatMoneyByCurrency(this.props.item.price, CurrencyUtils.getLocalStorageSymbol()) + ' x ' + CurrencyUtils.formatThousand(this.props.item.quantity)}
                            </b>
                        </p>
                        <p className="d-desktop-none mb-4">
                            {this.props.item.conversionUnitName || '-'}
                        </p>
                        <p className='d-desktop-none m-0'>
                            {CurrencyUtils.formatMoneyByCurrency(this.props.item.price * this.props.item.quantity, CurrencyUtils.getLocalStorageSymbol())}
                        </p>
                        <p className="d-mobile-none d-desktop-flex m-0">
                            {this.props.orderStatus === Constants.ORDER_STATUS_TO_SHIP &&
                            this.props.item.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER &&
                            <a href="javascript:void(0)" onClick={this.selectOrderItemCallback}><img className="mr-1"
                                                                                                     src="/assets/images/Vector.png"/>
                                {this.props.item.imeiSerial.length === 0 ?
                                    <GSTrans t='page.order.detail.confirm.imei.not.select'/> :
                                    <GSTrans t='page.order.detail.confirm.imei.selected' values={{
                                        curr: this.props.item.imeiSerial.length,
                                        max: this.props.item.quantity
                                    }}/>}
                            </a>
                            }
                        </p>

                        <p className="d-mobile-none d-desktop-flex m-0">
                            {this.props.orderStatus !== Constants.ORDER_STATUS_TO_SHIP && this.props.orderStatus !== Constants.ORDER_STATUS_CANCELLED &&
                            this.props.item.inventoryManageType === Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER &&
                            <a href="javascript:void(0)" onClick={this.handleIsModalIMEI}><img className="mr-1"
                                                                                               src="/assets/images/Vector.png"/>
                                {this.props.item.orderItemIMEIs.length > 0 &&
                                <GSTrans t='page.order.detail.confirm.modal.imei.selected' values={{
                                    curr: this.props.item.orderItemIMEIs.length
                                }}/>}
                            </a>
                            }
                        </p>
                    </div>
                    <div className="item-row__unit d-mobile-none d-desktop-flex">
                        <b className="font-weight-bold">
                            {this.props.item.conversionUnitName || '-'}
                        </b>
                    </div>
                    <div className="item-row__total-price d-mobile-none d-desktop-flex">
                        <b>
                            {CurrencyUtils.formatMoneyByCurrency(this.props.item.price * this.props.item.quantity, CurrencyUtils.getLocalStorageSymbol())}
                        </b>
                    </div>
                </div>
            </>
        )
    }
}

ItemRow.propTypes = {
    item: PropTypes.any,
    selectOrderItemCallback: PropTypes.func,
    index: PropTypes.number
}
