/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/01/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useImperativeHandle, useRef} from 'react'
import ReactToPrint from 'react-to-print'
import GSButton from '../../../../../components/shared/GSButton/GSButton'
import {OrderInStorePurchaseContext} from '../../context/OrderInStorePurchaseContext'
import GSTrans from '../../../../../components/shared/GSTrans/GSTrans'
import moment from 'moment'
import {CurrencyUtils, NumberUtils} from '../../../../../utils/number-format'
import './PrintTemplateKPOS.sass'
import {CurrencySymbol} from '../../../../../components/shared/form/CryStrapInput/CryStrapInput'
import {OrderInStorePurchaseContextService} from '../../context/OrderInStorePurchaseContextService'
import * as _ from 'lodash'
import i18next from '../../../../../config/i18n'
import storageService from '../../../../../services/storage'
import Constants from '../../../../../config/Constant'
import {any, array, number, oneOf, string} from 'prop-types'
import {KEY_PRINT_A4, KEY_PRINT_K57, KEY_PRINT_K80} from '../OrderInStorePurchaseComplete'
import {CredentialUtils} from '../../../../../utils/credential'
import {TokenUtils} from '../../../../../utils/token'
import {PACKAGE_FEATURE_CODES} from '../../../../../config/package-features'

const PrintTemplateKPOS = React.forwardRef((props, ref) => {
    const refTemplate = useRef(null)
    const refPrint = useRef(null)

    useImperativeHandle(
        ref,
        () => ({
            onPrint
        })
    )

    const onPrint = () => {
        refPrint.current.handleClick()
    }

    return (
        <div {...props}>
            <ReactToPrint
                removeAfterPrint
                trigger={() => (
                    <GSButton>
                        <GSTrans t="page.order.detail.btn.print"/>
                    </GSButton>
                )}
                pageStyle={`@media print { @page { size: ${props.printPageSize.replace('K', '')}mm auto;} html, body { -webkit-print-color-adjust: exact;} }`}
                content={() => refTemplate.current}
                ref={refPrint}
            />
            <div style={{visibility: 'hidden', width: 0}}>
                <Template ref={refTemplate} {...props}/>
            </div>
        </div>
    )
})

class Template extends React.Component {

    constructor(props) {
        super(props)

        this.isPromotion = false
        this.removeAccents = this.removeAccents.bind(this)
        this.calculatePayableAmount = this.calculatePayableAmount.bind(this)
    }

    renderPromotionPrice(product) {
        if (product.wholeSale) {
            return CurrencyUtils.formatMoneyByCurrency(-product.wholeSale.discountAmount, product.currency)
        }
        if (product.promotion) {
            return CurrencyUtils.formatMoneyByCurrency(-product.promotion.couponItem.promoAmount, product.currency)
        }
        return CurrencyUtils.formatMoneyByCurrency(0, product.currency)
    }

    renderTotalPrice(product) {
        const orgPrice = product.price * product.quantity
        return CurrencyUtils.formatMoneyByCurrency(orgPrice, CurrencyUtils.getLocalStorageSymbol())
    }

    getTranslateOption() {
        return {
            lng: this.props.langCode,
            fallbackLng: ['vi']
        }
    }

    renderDeliveryName(deliveryName) {
        if (deliveryName === 'selfdelivery') {
            return i18next.t('page.order.detail.information.shippingMethod.self', this.getTranslateOption())
        } else if (deliveryName === 'ahamove_truck') {
            return i18next.t('page.order.detail.information.shippingMethod.AHAMOVE_TRUCK', this.getTranslateOption())
        } else if (deliveryName === 'ahamove_bike') {
            return i18next.t('page.order.detail.information.shippingMethod.AHAMOVE_BIKE', this.getTranslateOption())
        }
        return deliveryName
    }

    removeAccents(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    }

    calculateChangeAmount(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, paidAmount, discountOption) {
        let changePrice = 0;
        const getTotalPrice = OrderInStorePurchaseContextService.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption)
        if (paidAmount < getTotalPrice) {
            changePrice = 0
        } else {
            changePrice = paidAmount - getTotalPrice
        }
        return CurrencyUtils.formatMoneyByCurrency(changePrice > 0 ? changePrice : 0, CurrencyUtils.getLocalStorageSymbol())
    }

    calculatePayableAmount(customerDebtAmount, totalPrice, orderStatus) {
        if (orderStatus === Constants.ORDER_STATUS_DELIVERED ||
            orderStatus === Constants.ORDER_STATUS_RETURNED ||
            orderStatus === Constants.ORDER_STATUS_CANCELLED
        ) {
            return CurrencyUtils.formatMoneyByCurrency(customerDebtAmount, CurrencyUtils.getLocalStorageSymbol())
        } else {
            return CurrencyUtils.formatMoneyByCurrency((customerDebtAmount + totalPrice), CurrencyUtils.getLocalStorageSymbol())
        }
    }

    render() {
        const {
            printPageSize,
            storeInfo,
            user,
            staffName,
            earningPoint,
            pointAmount,
            spendingPoint,
            shippingInfo,
            note,
            productList,
            promotion,
            membership,
            discountOption,
            paymentMethod,
            orderId,
            taxAmount,
            orderDate,
            debtAmount,
            checkDebtAmount,
            paidAmount,
            customerDebtAmount,
            discountedShippingFee,
            orderStatus
        } = this.props

        return (
            <div className={`order-print-page-size_ order-print-page-size_${printPageSize}`}>
                <div className="d-flex flex-column align-top w-100 vh-100 order-in-store-purchase-printer pl-2 pr-2">
                    {/*HEADER STORE INFO*/}
                    <div className="d-flex p-0 flex-column align-items-center">
                        <img
                            className="mt-3"
                            src={storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE)}
                            alt={`logo-${storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME)}`}
                            width="auto"
                            height="30px"
                        />
                        <h1 className="text-uppercase text-center mt-2">
                            {storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME) || ''}
                        </h1>
                    </div>

                    <div className="text-center store-info font-size">
                        {
                            storeInfo.storePhone && <div>
                                {i18next.t('page.order.create.print.receiptInfo.tel', this.getTranslateOption())}: {storeInfo.storePhone || ''}
                            </div>
                        }
                        {
                            storeInfo.storeAddress && <div className="text-break">
                                {
                                    storeInfo.storeAddress.split('\n').map((text, key) => {
                                        return (<React.Fragment key={`${text}-${key}`}>
                                            {text}
                                            <br/>
                                        </React.Fragment>)
                                    })
                                }
                            </div>
                        }

                            {TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE]) &&
                            <div >
                                {i18next.t('page.order.create.print.receiptInfo.website', this.getTranslateOption())}:
                                {
                                !storeInfo.customDomain ?
                                    `https://${storeInfo.storeUrl}.${storeInfo.storeDomain}`
                                    :
                                    `https://${storeInfo.customDomain}`
                            }</div>
                            }

                    </div>
                    {!_.isEmpty(user) &&
                    <>
                        <div className="d-flex p-0 justify-content-center align-items-center">
                            <hr style={{
                                'border-top': '1px dashed #DADADA',
                                'width': '100%',
                                'text-align': 'center',
                                'margin': '5px 0',
                            }}/>
                        </div>

                        {/*CUSTOMER INFO*/}
                        <div className="d-flex p-0 w-100 align-items-start font-size">
                            <div className="col-12 p-0">
                                <div className="d-flex justify-content-between">
                                    <span className="font-weight-500">
                                        {i18next.t('page.order.create.print.receiptInfo.customer', this.getTranslateOption())}:
                                    </span>
                                    <span className="font-weight-500">{user.name}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>
                                        {i18next.t('page.order.create.print.receiptInfo.phone', this.getTranslateOption())}:
                                    </span>
                                    <span>{user.phone}</span>
                                </div>
                                <hr style={{
                                    'border-top': '1px dashed #DADADA',
                                    'width': '100%',
                                    'text-align': 'center',
                                    'margin': '5px 0'
                                }}/>
                                <div className="d-flex justify-content-between">
                                    <span className="font-weight-500">{i18next.t('page.order.instorePurchase.print.kpos.customer.name', this.getTranslateOption())}:</span>
                                    <span className="ml-1 customer-info font-weight-500">{user.name || ''}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>{i18next.t('page.order.instorePurchase.print.kpos.customer.phone', this.getTranslateOption())}:</span>
                                    <span className="ml-1 customer-info">{user.phone || ''}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span style={{width: '28%'}}>{i18next.t('page.order.instorePurchase.print.kpos.customer.address', this.getTranslateOption())}:</span>
                                    <span className="ml-1 customer-info">{
                                        shippingInfo.translateAddress || ((shippingInfo.address || '') + (shippingInfo.wardName || '') + (shippingInfo.districtName || '') + (shippingInfo.cityName || ''))
                                    }</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span style={{width: '28%'}}>{i18next.t('page.order.instorePurchase.print.kpos.customer.note', this.getTranslateOption())}:</span>
                                    <span className="ml-1 customer-info">{note || ''}</span>
                                </div>
                                {debtAmount > 0 &&
                                <div className="d-flex justify-content-between">
                                    <span>{i18next.t('page.orderList.orderDetail.Debt', this.getTranslateOption())}:</span>
                                    <span
                                        className="ml-1 customer-info">{CurrencyUtils.formatMoneyByCurrency(debtAmount, CurrencyUtils.getLocalStorageSymbol())}</span>
                                </div>
                                }

                            </div>
                        </div>
                    </>
                    }

                    <div
                        className="d-flex flex-column ml-auto mr-auto font-weight-bold text-uppercase w-fit-content text-center">
                        <hr style={{
                            'border-top': '1px solid rgba(0, 0, 0, 0.3)',
                            'border-bottom': '3px solid rgba(0, 0, 0, 1)',
                            'width': '100%',
                            'height': '2px',
                            'margin-top': '5px'
                        }}/>
                        <h1>{
                            i18next.t('page.order.instorePurchase.print.kpos.receipt.title', this.getTranslateOption())
                        }</h1>
                    </div>

                    {/*ORDER INFO*/}
                    <div className="d-flex p-0 w-100 align-items-start font-size mt-1">
                        <div className="col-12 p-0">
                            <div className="d-flex justify-content-between">
                                <span className="font-weight-500">{i18next.t('page.order.instorePurchase.print.kpos.product.staff', this.getTranslateOption())}:</span>
                                <span className="ml-1 customer-info font-weight-500">{
                                    staffName === '[shop0wner]' ? i18next.t(`page.order.detail.information.shopOwner`, this.getTranslateOption()) : staffName
                                }</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{i18next.t('page.order.instorePurchase.print.kpos.product.orderId', this.getTranslateOption())}:</span>
                                <span className="ml-1 customer-info">#{orderId}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{i18next.t('page.order.instorePurchase.print.kpos.product.date', this.getTranslateOption())}:</span>
                                <span
                                    className="ml-1 customer-info">{moment(orderDate || moment.now()).format(' DD/MM/YYYY | HH:mm')}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{i18next.t('page.order.instorePurchase.print.kpos.product.shippingMethod', this.getTranslateOption())}:</span>
                                <span className="ml-1 customer-info">{
                                    shippingInfo.deliveryName
                                        ? this.renderDeliveryName(shippingInfo.deliveryName)
                                        : i18next.t(`page.order.create.print.shippingMethod.${shippingInfo.method}`, this.getTranslateOption())
                                }</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{i18next.t('page.order.instorePurchase.print.kpos.product.paymentMethod', this.getTranslateOption())}:</span>
                                <span className="ml-1 customer-info">{
                                    i18next.t(`page.order.create.print.paymentMethod.${paymentMethod}`, this.getTranslateOption())
                                }</span>
                            </div>
                        </div>
                    </div>

                    {/*PRODUCT LIST*/}
                    <div className="mt-2 w-100">
                        <table className="w-100 font-size" style={{color: '#000000'}}>
                            <thead>
                                <tr>
                                    <th className="text-left text-uppercase" style={{'width': '55%'}}>
                                        {i18next.t('page.order.instorePurchase.print.kpos.product.name', this.getTranslateOption())}
                                    </th>
                                    <th className="text-left text-uppercase">
                                        {i18next.t('page.order.instorePurchase.print.kpos.product.quantity', this.getTranslateOption())}
                                    </th>
                                    <th className="text-right text-uppercase">
                                        {i18next.t('page.order.instorePurchase.print.kpos.product.priceTotal', this.getTranslateOption())}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            {productList.sort((pervious, current) => {
                                let compa = 0
                                if (this.removeAccents(pervious.name.trim().toLowerCase()) > this.removeAccents(current.name.trim().toLowerCase()))
                                    compa = 1
                                else if (this.removeAccents(pervious.name.trim().toLowerCase()) < this.removeAccents(current.name.trim().toLowerCase()))
                                    compa = -1
                                return compa
                            }).map((product, index) => {
                                return (
                                    <>
                                    <tr key={product.id}>
                                        <td colSpan={3} className="col-md-5 pl-0 text-left font-size">
                                            <div className="pt-1">
                                                {index + 1}.{product.name}
                                                {
                                                    _.isString(product.variationName) && ' - ' + product.variationName.split('|').filter(name => name !== Constants.DEPOSIT.PERCENT_100).join('/ ') + ''
                                                }
                                                {product.conversionUnitName &&
                                                ' - ' + product.conversionUnitName + ''
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-dashed font-size">{CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol())}</td>
                                        <td className="border-dashed font-size">{NumberUtils.formatThousand(product.quantity)}</td>
                                        <td className="col-md-3 text-right pt-1 pr-0 pb-1 vertical-align-baseline border-dashed font-size">
                                            {this.renderTotalPrice(product)}
                                        </td>
                                    </tr>
                                </>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/*SUBTOTAL PRICE*/}
                    <div className="d-flex p-0 justify-content-between mt-2 font-size">
                        <div className="pl-0 text-left text-uppercase">
                            {`${i18next.t('page.order.instorePurchase.print.kpos.product.subTotal', this.getTranslateOption())}:`}
                        </div>
                        <div className="pr-0 text-right">
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInStorePurchaseContextService.calculateSubTotalPrice(productList),
                                CurrencyUtils.getLocalStorageSymbol()
                            )}
                        </div>
                    </div>

                    {/*VAT*/}
                    {
                        taxAmount != null && !isNaN(taxAmount) &&
                        <div className="d-flex p-0 justify-content-between align-items-start font-size">
                            <div className="col-3 pl-0 text-left text-uppercase">
                                {`${i18next.t('page.order.instorePurchase.print.kpos.product.VAT', this.getTranslateOption())}:`}
                            </div>
                            <div className=" pr-0 text-right">
                                {CurrencyUtils.formatMoneyByCurrency(taxAmount, CurrencyUtils.getLocalStorageSymbol())}
                            </div>
                        </div>
                    }

                    {/*REDEEM POINTS*/}
                    <div className="d-flex p-0 justify-content-between font-size">
                        <div className="pl-0 text-left text-uppercase">
                            <div>{`${i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints', this.getTranslateOption())}:`}</div>
                            <div
                                className="text-normal text-used-point information">({`${i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints.used', {
                                ...this.getTranslateOption(),
                                point: spendingPoint ? CurrencyUtils.formatThousand(spendingPoint) : 0
                            })}`})
                            </div>
                        </div>
                        <div className="pr-0 text-right">
                            -{CurrencyUtils.formatMoneyByCurrency(pointAmount || 0, CurrencyUtils.getLocalStorageSymbol())}
                        </div>
                    </div>

                    {/*DISCOUNT*/}
                    {OrderInStorePurchaseContextService.calculateDiscountAmount(productList, promotion, membership, discountOption) > 0 &&
                    <div className="d-flex p-0 justify-content-between align-items-center font-size">
                        <div className="pl-0 text-left text-uppercase">
                            {`${i18next.t('page.order.detail.items.discount', this.getTranslateOption())}:`}
                        </div>
                        <div className="pr-0 text-right">
                            {'- '}
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInStorePurchaseContextService.calculateDiscountAmount(productList, promotion, membership, discountOption),
                                CurrencyUtils.getLocalStorageSymbol()
                            )}
                        </div>
                    </div>}

                    {/*SHIPPING FEE*/}
                    <div className="d-flex p-0 justify-content-between align-items-start font-size">
                        <div className="pl-0 text-left text-uppercase">
                            {`${i18next.t('page.order.instorePurchase.print.kpos.product.shippingFee', this.getTranslateOption())}:`}
                        </div>
                        <div className=" pr-0 text-right">
                            {discountedShippingFee !== undefined &&
                            <>
                                {/*show base fee*/}
                                {(shippingInfo && shippingInfo.amount !== discountedShippingFee) &&
                                <>
                                    <del>{
                                        CurrencyUtils.formatMoneyByCurrency(shippingInfo.amount, CurrencyUtils.getLocalStorageSymbol())
                                    }</del>
                                    <br/>
                                </>
                                }
                                {CurrencyUtils.formatMoneyByCurrency(discountedShippingFee, CurrencyUtils.getLocalStorageSymbol())}
                            </>
                            }
                            {discountedShippingFee === undefined &&
                            CurrencyUtils.formatMoneyByCurrency(shippingInfo ? shippingInfo.amount : 0,
                                CurrencyUtils.getLocalStorageSymbol())
                            }
                        </div>
                    </div>
                    {/*TOTAL PRICE*/}
                    <div className="d-flex justify-content-between background-total font-size">
                        <div className="pl-0 text-left text-uppercase font-weight-bold">
                            {`${i18next.t('page.order.instorePurchase.print.kpos.product.total', this.getTranslateOption())}:`}
                        </div>
                        <div className="pr-0 text-right font-weight-bold">
                            {CurrencyUtils.formatMoneyByCurrency(
                                OrderInStorePurchaseContextService.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption),
                                CurrencyUtils.getLocalStorageSymbol())
                            }
                        </div>
                    </div>

                    {/*DISCOUNT COUPON*/}
                    {this.isPromotion ?
                        <div className="d-flex p-0 justify-content-between align-items-center font-size">
                            <div className="pl-0 text-uppercase">
                                {`${i18next.t('page.order.instorePurchase.print.kpos.product.discount', this.getTranslateOption())}:`}
                            </div>
                            <div className="pl-0">
                                {promotion.couponCode}
                            </div>
                        </div>
                        : <></>}
                    {paymentMethod === 'CASH' &&
                    <>
                        <div className="point-indicator"/>

                        <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                            <div className="pl-0 text-left text-uppercase">
                                {`${i18next.t('page.order.instorePurchase.print.kpos.product.receivedAmount', this.getTranslateOption())}:`}
                            </div>
                            <div className="pr-0 text-right">
                                {CurrencyUtils.formatMoneyByCurrency(paidAmount, CurrencyUtils.getLocalStorageSymbol())}
                            </div>
                        </div>

                        <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                            <div className="pl-0 text-left text-uppercase">
                                {`${i18next.t('page.order.instorePurchase.print.kpos.product.changeAmount', this.getTranslateOption())}:`}
                            </div>
                            <div className="pr-0 text-right">
                                {this.calculateChangeAmount(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, paidAmount, discountOption)}
                            </div>
                        </div>
                    </>
                    }

                    {/*CUSTOMER DEBT AMOUNT*/}
                    {!isNaN(checkDebtAmount) &&
                    <>
                        <div className="point-indicator"/>
                        <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                            <div className="pl-0 text-left text-uppercase">
                                {`${i18next.t('page.order.instorePurchase.print.kpos.product.orderRemainingDebt', this.getTranslateOption())}:`}
                            </div>
                            <div className="pr-0 text-right">
                                {CurrencyUtils.formatMoneyByCurrency(debtAmount, CurrencyUtils.getLocalStorageSymbol())}
                            </div>
                        </div>
                        <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                            <div className="pl-0 text-left text-uppercase">
                                {`${i18next.t('page.order.instorePurchase.print.kpos.product.customerDebt', this.getTranslateOption())}:`}
                            </div>
                            <div className="pr-0 text-right">
                                {CurrencyUtils.formatMoneyByCurrency(customerDebtAmount, CurrencyUtils.getLocalStorageSymbol())}
                            </div>
                        </div>
                    </>
                    }

                    {/*PAYABLE AMOUNT*/}
                    <div className="d-flex p-0 mt-2 justify-content-between font-size">
                        <div className="pl-0 text-left text-uppercase">
                            {`${i18next.t('page.order.instorePurchase.print.kpos.payableAmount', this.getTranslateOption())}:`}
                        </div>
                        <div className="pr-0 text-right">
                            {this.calculatePayableAmount(customerDebtAmount,
                                OrderInStorePurchaseContextService.calculateTotalPrice(productList, shippingInfo, promotion, membership, taxAmount, pointAmount, discountOption),
                                orderStatus)}
                        </div>
                    </div>

                    <div className="point-indicator"/>

                    {/*EARNED POINTS*/}
                    <div className="earned-points d-flex p-0 mt-2 justify-content-between align-items-center">
                        <div className="pl-0 text-left text-uppercase font-weight-500">
                            {`${i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints', this.getTranslateOption())}:`}
                        </div>
                        <div className="pr-0 text-right">
                            {`${i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints.point', {
                                ...this.getTranslateOption(),
                                point: earningPoint ? CurrencyUtils.formatThousand(earningPoint) : 0
                            })}`}
                        </div>
                    </div>

                    {/*INFORMATION*/}
                    <div
                        className="information mt-2 font-weight-normal font-style-italic text-center color-gray">
                        {CredentialUtils.getValueInfoOrder()}
                    </div>

                    {/*FOOTER THANK YOU*/}
                    <div
                        className="d-flex p-0 mt-2 justify-content-center align-items-center text-center font-weight-bold font-size">
                        {`${i18next.t('page.order.instorePurchase.print.kpos.product.thankyou', this.getTranslateOption())}`}
                    </div>
                    <div className="d-flex p-0 align-items-center justify-content-center information">
                        {`${i18next.t('page.order.instorePurchase.print.kpos.product.powered', this.getTranslateOption())}`}
                    </div>
                </div>
                <p style={{pageBreakBefore: 'always'}}/>
            </div>
        )
    }
}

Template.contextType = OrderInStorePurchaseContext.context

PrintTemplateKPOS.defaultProps = {
    printPageSize: KEY_PRINT_K80,
    storeInfo: {},
    user: {},
    note: '',
    productList: [],
    langCode: i18next.language,
    debtAmount: 0,
    paidAmount: 0,
    customerDebtAmount: 0
}
PrintTemplateKPOS.propTypes = {
    shippingInfo: any,
    printPageSize: oneOf([KEY_PRINT_K57, KEY_PRINT_K80, KEY_PRINT_A4]),
    storeInfo: any,
    user: any,
    note: string,
    productList: array,
    promotion: any,
    membership: any,
    paymentMethod: string,
    orderId: number,
    taxAmount: number,
    langCode: string,
    debtAmount: number,
    paidAmount: number,
    customerDebtAmount: number,
    orderStatus: string
}

export default PrintTemplateKPOS
