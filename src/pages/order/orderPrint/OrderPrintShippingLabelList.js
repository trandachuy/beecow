/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React, { createRef, useImperativeHandle, useRef } from "react";
import "./OrderPrintShippingLabelList.sass";
import i18next from "i18next";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import moment from "moment";
import { CurrencyUtils } from "../../../utils/number-format";
import BarCode from "react-barcode";
import GSButton from "../../../components/shared/GSButton/GSButton";
import ReactToPrint from "react-to-print";
import {
  KEY_PRINT_K57,
  KEY_PRINT_K80,
} from "../instorePurchase/complete/OrderInStorePurchaseComplete";
import { any, oneOf, string } from "prop-types";
import { Trans } from "react-i18next";
import _ from "lodash";
import Constants from "../../../config/Constant";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {OrderDetailUtils} from '../../../utils/order-detail-utils'

const PrintListShippingLabel = React.forwardRef((props, ref) => {
  const refTemplate = useRef(null);
  const refPrint = useRef(null);

  useImperativeHandle(ref, () => ({
    firePrintOrder,
  }));

  const firePrintOrder = () => {
    refPrint.current.handleClick();
  };

  return (
    <div {...props}>
      <ReactToPrint
        removeAfterPrint
        trigger={() => <GSButton style={{ display: "none" }}></GSButton>}
        pageStyle={`@media print { @page { size: ${props.printPageSize.replace(
          "K",
          ""
        )}mm auto;} html, body { -webkit-print-color-adjust: exact;} }`}
        content={() => refTemplate.current}
        ref={refPrint}
      />
      <div style={{ visibility: 'hidden', width: 0 }}>
        <OrderPrintShippingLabelList ref={refTemplate} {...props} />
      </div>
    </div>
  );
});

class OrderPrintShippingLabelList extends React.Component {

  constructor(props) {
    super(props)
  }

  renderDeliveryName(deliveryName, trans) {
    if (deliveryName === "selfdelivery") {
      return trans("page.order.detail.information.shippingMethod.self");
    } else if (deliveryName === "ahamove_truck") {
      return trans(
        "page.order.detail.information.shippingMethod.AHAMOVE_TRUCK"
      );
    } else if (deliveryName === "ahamove_bike") {
      return trans(
        "page.order.detail.information.shippingMethod.AHAMOVE_BIKE"
      );
    }
    return deliveryName;
  }

  buildOrderObject(orderItems) {
    let items = orderItems.length > 10 ? orderItems.slice(0, 10) : orderItems;
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
    return {
      halfLength: list,
      leftItems: leftItems,
      rightItems: rightItems,
      showMore: orderItems.length > 20
    };
  }

  render() {
    const { storeInfo, orderList, langCode } = this.props;

    return (
      <span>
        {orderList.map(({ customerInfo, shippingInfo, storeBranch, items, orderInfo, sellerAddress, buyerAddress }) => {
          const { halfLength, leftItems, rightItems, showMore } = this.buildOrderObject(items.slice(0));

          return (
            <GSContentContainer className="order-print-page">
              {orderInfo!== null &&
                <GSContentBody size={GSContentBody.size.MEDIUM}>
                  <div className="row">
                    <div className="col-12">
                      {/*BILLING ADDRESS*/}
                      <table className="order__table">
                        <colgroup>
                          <col style={{ width: '50%' }} />
                          <col style={{ width: '50%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th className="border__none">
                              {`${i18next.t("page.order.print.seller")} ${storeInfo.storeName}`}
                            </th>
                            <th className="border__none">
                              {`${i18next.t("page.order.print.buyer")} ${customerInfo.name}`}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className='vertical-align-baseline'>
                              <div className="td-row">
                                <span className="cell-title">
                                  <span className="cell-title__content">
                                    <Trans i18nKey="page.order.print.phone" />
                                  </span>
                                  {storeBranch.phoneNumberFirst || storeInfo.storePhone || ''}
                                </span>
                              </div>
                              <div className="td-row">
                                <span className="cell-title">
                                  <span className="cell-title__content">
                                    <Trans i18nKey="page.order.print.address" />
                                  </span>
                                  { sellerAddress }
                                </span>
                              </div>
                            </td>
                            <td className="border__none vertical-align-baseline">
                              <div className="td-row">
                                <span className="cell-title">
                                  <span className="cell-title__content">
                                    <Trans i18nKey="page.order.print.phone" />
                                  </span>
                                  {shippingInfo && shippingInfo.phone}
                                </span>
                              </div>
                              <div className="td-row">
                                <span className="cell-title">
                                  <span className="cell-title__content">
                                    <Trans i18nKey="page.order.print.address" />
                                  </span>
                                  { buyerAddress }
                                </span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            {orderInfo.deliveryOrder &&
                              <td>
                                <div className="td-row">
                                  <span className="cell-title">
                                    <span className="cell-title__content">
                                      <Trans
                                        i18nKey="page.order.print.providerName" />
                                    </span>
                                    {
                                      orderInfo.deliveryName &&
                                      this.renderDeliveryName(orderInfo.deliveryName, i18next.t)
                                    }
                                    {
                                      (!orderInfo.deliveryName && orderInfo.channel !== Constants.SITE_CODE_SHOPEE) &&
                                      i18next.t('page.order.create.print.shippingMethod.inStore')
                                    }
                                    {
                                      (!orderInfo.deliveryName && orderInfo.channel === Constants.SITE_CODE_SHOPEE) && "-"
                                    }
                                  </span>
                                </div>
                                <div className="td-row">
                                  <span className="cell-title">
                                    <span className="cell-title__content">
                                      <Trans
                                        i18nKey="page.order.print.deliveryCode" />
                                    </span>
                                    {orderInfo.trackingCode}
                                  </span>
                                </div>
                                <div className="td-row">
                                  <span className="cell-title">
                                    <span className="cell-title__content">
                                      <Trans i18nKey="page.order.print.createdDate" />
                                    </span>
                                    {moment(orderInfo.createdDate).format(
                                      "DD-MM-YYYY"
                                    )}
                                  </span>
                                </div>
                                <div className="td-row">
                                  <span className="cell-title">
                                    <span className="cell-title__content">
                                      <Trans i18nKey="page.order.print.note" />
                                    </span>
                                    {orderInfo.note}
                                  </span>
                                </div>
                              </td>
                            }
                            <td className="text-center border__none"
                              colSpan={orderInfo.deliveryOrder ? 1 : 2}>
                              <div className="td-row">
                                <span className="cell-title">
                                  <span className="cell-title__content">
                                    <Trans
                                      i18nKey="page.order.print.orderCode" />
                                  </span>
                                  {orderInfo.orderId}
                                </span>
                              </div>
                              <div className="td-row">
                                <BarCode
                                  value={orderInfo.orderId}
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
                          {_.isEmpty(rightItems[0])
                              ? <>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '90%' }} />
                              </>
                              : <>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '40%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '40%' }} />
                              </>
                          }
                        </colgroup>
                        <thead>
                          <tr>
                            <th className="text-uppercase text-center border__none">
                              <Trans i18nKey="page.order.print.stt" /></th>
                            <th className="text-uppercase text-center border__none">
                              <Trans i18nKey="page.order.print.product" /></th>
                            {
                              !_.isEmpty(rightItems[0]) && <>
                                <th className="text-uppercase text-center border__none"><Trans
                                  i18nKey="page.order.print.stt" /></th>
                                <th className="text-uppercase text-center border__none"><Trans
                                  i18nKey="page.order.print.product" /></th>
                              </>
                            }
                          </tr>
                        </thead>
                        <tbody>
                          {
                            halfLength.map((item, index) => (
                              <tr key={index}>
                                <td className="text-center border__none vertical-align-baseline">
                                  <span className="cell-title__content">{index + 1}</span>
                                </td>
                                <td className="text-center border__none d-flex">
                                  <span className="cell-title__content">
                                    {
                                      leftItems[index].name
                                    }
                                    {
                                      _.isString(leftItems[index].modelName) && ' (' + leftItems[index].modelName.split('|').filter(name => name !== Constants.DEPOSIT.PERCENT_100).join(', ') + ')'
                                    }
                                  </span>
                                  <span className="cell-title__quantity">{' x ' + CurrencyUtils.formatThousand(leftItems[index].quantity)}</span>
                                </td>
                                {
                                  !_.isEmpty(rightItems[index])
                                    ? <>
                                      <td className="text-center border__none vertical-align-baseline">
                                        <span className="cell-title__content">{halfLength.length + index + 1}</span>
                                      </td>
                                      <td className="text-center border__none d-flex">
                                        <span className="cell-title__content">
                                          {
                                            rightItems[index].name
                                          }
                                          {
                                            _.isString(rightItems[index].modelName) && ' (' + rightItems[index].modelName.split('|').filter(name => name !== Constants.DEPOSIT.PERCENT_100).join(', ') + ')'
                                          }
                                        </span>
                                        <span
                                          className="cell-title__quantity">{' x ' + CurrencyUtils.formatThousand(rightItems[index].quantity)}</span>
                                      </td>
                                    </>
                                    : !_.isEmpty(rightItems[0]) && <>
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
                        showMore && <div className='background-color-white w-100 pl-2'>
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
                  <div className="row" style={{ backgroundColor: "#FFFFFF", margin: "0 15px" }}>
                    <div className="col-12 row-sum">
                      <span className="total"><Trans
                        i18nKey="page.order.print.totalAmount" /> {CurrencyUtils.formatMoneyByCurrency(orderInfo.totalPrice, CurrencyUtils.getLocalStorageSymbol())}</span>
                    </div>
                  </div>
                </GSContentBody>}
            </GSContentContainer>
          );
        })}
      </span>
    );
  }
}

PrintListShippingLabel.defaultProps = {
  printPageSize: KEY_PRINT_K57,
  storeInfo: {},
  orderList: [],
  catalog: [],
  langCode: "vi",
};

PrintListShippingLabel.propTypes = {
  printPageSize: oneOf([KEY_PRINT_K57, KEY_PRINT_K80]),
  storeInfo: any,
  orderList: any,
  catalog: any,
  langCode: string,
};

export default PrintListShippingLabel;
