/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React from 'react';
import './orderPrint.sass'
import i18next from 'i18next';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';
import {Trans} from 'react-i18next';
import moment from 'moment';
import {CurrencyUtils} from '../../../utils/number-format';
import authenticate from '../../../services/authenticate';
import {BCOrderService} from '../../../services/BCOrderService';
import BarCode from 'react-barcode';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import * as _ from 'lodash';
import Constants from '../../../config/Constant';
import {AddressUtils} from '../../../utils/address-utils'

export default class OrderPrint extends React.Component {
    _isMounted = false;
    state = {
        orderObj: null,
        leftItems: [],
        rightItems: [],
        halfLength: []
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._isMounted = true;
        this.storeId = authenticate.getStoreId();

        let {siteCode, orderId} = this.props.match.params;

        siteCode = siteCode.toUpperCase();

        this.siteCode = siteCode;
        this.orderId = orderId;

        BCOrderService.getBcOrderDetail(this.orderId)
            .then(result => {
                if (this._isMounted) {
                    this.buildAddress('shippingAddress',
                        result.deliveryInfo["address"],
                        result.deliveryInfo["districtCode"],
                        result.deliveryInfo["wardCode"],
                        result.deliveryInfo["locationCode"],
                        result.deliveryInfo["countryCode"],
                        {
                            address2: result.deliveryInfo["address2"],
                            city: result.deliveryInfo["city"],
                            zipCode: result.deliveryInfo["zipCode"]
                        }
                    );

                    this.buildAddress('pickupAddress',
                        result.pickUpAddress["address"],
                        result.pickUpAddress["districtCode"],
                        result.pickUpAddress["wardCode"],
                        result.pickUpAddress["locationCode"],
                        result.pickUpAddress["countryCode"],
                        {
                            address2: result.pickUpAddress["address2"],
                            city: result.pickUpAddress["city"],
                            zipCode: result.pickUpAddress["zipCode"]
                        }
                    );

                    this.currency = result.currency;
                    this.setState({
                        orderObj: result,
                        isFetching: false,
                        siteCode: siteCode
                    });

                    let items = result.orderItems.length > 20 ? result.orderItems.slice(0, 20) : result.orderItems;
                    let halfLength = Math.ceil(items.length / 2);
                    let leftItems = items.splice(0, halfLength);
                    let rightItems = items;
                    if (rightItems.length < leftItems.length) {
                        rightItems.push({});
                    }
                    let list = [];
                    for (let i = 0; i < halfLength; i++) {
                        list.push(i);
                    }
                    this.setState({
                        halfLength: list,
                        leftItems: leftItems,
                        rightItems: rightItems,
                        showMore: result.orderItems.length > 20
                    });

                    setTimeout(function () {
                        window.print();
                    }, 1000);
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    renderDeliveryName(deliveryName) {
        if (deliveryName === 'selfdelivery') {
            return i18next.t("page.order.detail.information.shippingMethod.self")
        } else if (deliveryName === 'ahamove_truck') {
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_TRUCK")
        } else if (deliveryName === 'ahamove_bike') {
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_BIKE")
        }
        return deliveryName
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

    render() {
        return (
            <>
                {this.state.isLoadingScreen &&
                <LoadingScreen/>}
                <GSContentContainer className="order-print-page" isLoading={this.state.isFetching}>
                    {this.state.orderObj !== null &&
                    <GSContentBody size={GSContentBody.size.MEDIUM}>
                        <div className="row">
                            <div className="col-12">
                                {/*BILLING ADDRESS*/}
                                <table className="order__table">
                                    <colgroup>
                                        <col style={{width: '50%'}}/>
                                        <col style={{width: '50%'}}/>
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th className="border__none"><Trans
                                            i18nKey="page.order.print.seller"/> {this.state.orderObj.seller.displayName}
                                        </th>
                                        <th className="border__none"><Trans
                                            i18nKey="page.order.print.buyer"/> {this.state.orderObj.deliveryInfo.contactName}
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className='vertical-align-baseline'>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                               <span className="cell-title__content">
                                                        <Trans i18nKey="page.order.print.phone"/>
                                                              </span>
                                                        {this.state.orderObj.pickUpAddress.phoneNumber}
                                                    </span>
                                            </div>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">

                                                        <Trans i18nKey="page.order.print.address"/>
                                                              </span>
                                                        {this.state.pickupAddress}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="border__none vertical-align-baseline">
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                        <Trans i18nKey="page.order.print.phone"/>
                                                              </span>
                                                        {this.state.orderObj.deliveryInfo.phoneNumber}
                                                    </span>
                                            </div>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                        <Trans i18nKey="page.order.print.address"/>
                                                              </span>
                                                        {this.state.shippingAddress}
                                                    </span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        {this.state.orderObj.deliveryOrder &&
                                        <td>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                        <Trans
                                                            i18nKey="page.order.print.providerName"/>
                                                                  </span>
                                                        {this.renderDeliveryName(this.state.orderObj.deliveryOrder.providerName)}
                                                    </span>
                                            </div>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                        <Trans
                                                            i18nKey="page.order.print.deliveryCode"/>
                                                                  </span>
                                                        {this.state.orderObj.deliveryOrder.trackingCode}
                                                    </span>
                                            </div>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                        <Trans i18nKey="page.order.print.createdDate"/>
                                                              </span>
                                                        {moment(this.state.orderObj.createdDate).format('DD-MM-YYYY')}
                                                    </span>
                                            </div>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                        <Trans i18nKey="page.order.print.note"/>
                                                              </span>
                                                        {this.state.orderObj.note}
                                                    </span>
                                            </div>
                                        </td>
                                        }
                                        <td className="text-center border__none"
                                            colSpan={this.state.orderObj.deliveryOrder ? 1 : 2}>
                                            <div className="td-row">
                                                    <span className="cell-title">
                                                          <span className="cell-title__content">
                                                          <Trans
                                                              i18nKey="page.order.print.orderCode"/>
                                                          </span>
                                                        {this.state.orderObj.id}
                                                    </span>

                                            </div>
                                            <div className="td-row">
                                                <BarCode value={this.state.orderObj.id}
                                                         fontSize={14}
                                                         height={64}
                                                />
                                            </div>

                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <table className="order-items__table">
                                    <colgroup>
                                        {
                                            _.isEmpty(this.state.rightItems[0])
                                                ? <>
                                                    <col style={{width: '10%'}}/>
                                                    <col style={{width: '90%'}}/>
                                                </>
                                                : <>
                                                    <col style={{width: '10%'}}/>
                                                    <col style={{width: '40%'}}/>
                                                    <col style={{width: '10%'}}/>
                                                    <col style={{width: '40%'}}/>
                                                </>
                                        }
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th className="text-uppercase text-center border__none"><Trans
                                            i18nKey="page.order.print.stt"/></th>
                                        <th className="text-uppercase text-center border__none"><Trans
                                            i18nKey="page.order.print.product"/></th>
                                        {
                                            !_.isEmpty(this.state.rightItems[0]) && <>
                                                <th className="text-uppercase text-center border__none"><Trans
                                                    i18nKey="page.order.print.stt"/></th>
                                                <th className="text-uppercase text-center border__none"><Trans
                                                    i18nKey="page.order.print.product"/></th>
                                            </>
                                        }
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.halfLength.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-center border__none vertical-align-baseline">
                                                    <span className="cell-title__content">{index + 1}</span>
                                                </td>
                                                <td className="text-center border__none d-flex">
                                                    <span className="cell-title__content">
                                                        {
                                                            this.state.leftItems[index].name
                                                        }
                                                        {
                                                            _.isString(this.state.leftItems[index].modelName) && ' (' + this.state.leftItems[index].modelName.split('|').filter(name => name !== Constants.DEPOSIT.PERCENT_100).join(', ') + ')'
                                                        }
                                                    </span>
                                                    <span
                                                        className="cell-title__quantity">{' x ' + CurrencyUtils.formatThousand(this.state.leftItems[index].quantity)}</span>
                                                </td>
                                                {
                                                    !_.isEmpty(this.state.rightItems[index])
                                                        ? <>
                                                            <td className="text-center border__none vertical-align-baseline">
                                                                <span
                                                                    className="cell-title__content">{this.state.halfLength.length + index + 1}</span>
                                                            </td>
                                                            <td className="text-center border__none d-flex">
                                                                <span className="cell-title__content">
                                                                    {
                                                                        this.state.rightItems[index].name
                                                                    }
                                                                    {
                                                                        _.isString(this.state.rightItems[index].modelName) && ' (' + this.state.rightItems[index].modelName.split('|').filter(name => name !== Constants.DEPOSIT.PERCENT_100).join(', ') + ')'
                                                                    }
                                                                </span>
                                                                <span
                                                                    className="cell-title__quantity">{' x ' + CurrencyUtils.formatThousand(this.state.rightItems[index].quantity)}</span>
                                                            </td>
                                                        </>
                                                        : !_.isEmpty(this.state.rightItems[0]) && <>
                                                            <td className="text-center border__none"></td>
                                                            <td className="text-center border__none"></td>
                                                        </>
                                                }
                                            </tr>
                                        ))
                                    }
                                    </tbody>
                                </table>
                                {
                                    this.state.showMore && <div className='background-color-white w-100 pl-2'>
                                            <GSTrans t='page.order.print.showMore.note'>
                                                <strong>Note:</strong>
                                            </GSTrans>
                                        &nbsp;
                                        <GSTrans t='page.order.print.showMore.note.description'>
                                                <i>Some products are not shown here because the list is too long.</i>
                                            </GSTrans>
                                        </div>
                                }
                            </div>
                        </div>
                        <div className="row" style={{backgroundColor: "#FFFFFF", margin: "0 15px"}}>
                            <div className="col-12 row-sum">
                                <span className="total"><Trans
                                    i18nKey="page.order.print.totalAmount"/> {CurrencyUtils.formatMoneyByCurrency(this.state.orderObj.totalPrice, CurrencyUtils.getLocalStorageSymbol())}</span>
                            </div>
                        </div>
                    </GSContentBody>}
                </GSContentContainer>
            </>
        )
    }

}
