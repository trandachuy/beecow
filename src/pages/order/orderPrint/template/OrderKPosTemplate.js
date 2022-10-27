import React from 'react'
import storageService from '../../../../services/storage'
import Constants from '../../../../config/Constant'
import i18next from '../../../../config/i18n'
import {TokenUtils} from '../../../../utils/token'
import {PACKAGE_FEATURE_CODES} from '../../../../config/package-features'
import * as _ from 'lodash'
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format'
import moment from 'moment'
import {CredentialUtils} from '../../../../utils/credential'
import {arrayOf, bool, number, oneOf, oneOfType, shape, string} from 'prop-types'
import './OrderKPosTemplate.sass'
import {METHOD} from '../../instorePurchase/context/OrderInStorePurchaseContext'

const OrderKPosTemplate = React.forwardRef((props, ref) => {
    const {
        orderId,
        orderDate,
        storeInfo,
        user,
        staffName,
        spendingPoint,
        pointAmount,
        earningPoint,
        shippingInfo,
        channel,
        productList,
        paymentMethod,
        taxAmount,
        note,
        paidAmount,
        debt,
        discountedShippingFee,
        subTotal,
        discountAmount,
        totalPrice,
        changeAmount,
        payableAmount,
        printSize,
        langCode,
        customContent,
        information,
        isUsedDelivery
    } = props

    const getTranslateOption = () => {
        return {
            lng: langCode,
            fallbackLng: ['vi']
        }
    }

    const removeAccents = str => {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    }

    const renderDeliveryName = deliveryName => {
        if (deliveryName === 'selfdelivery') {
            return i18next.t('page.order.detail.information.shippingMethod.self', getTranslateOption())
        } else if (deliveryName === 'ahamove_truck') {
            return i18next.t('page.order.detail.information.shippingMethod.AHAMOVE_TRUCK', getTranslateOption())
        } else if (deliveryName === 'ahamove_bike') {
            return i18next.t('page.order.detail.information.shippingMethod.AHAMOVE_BIKE', getTranslateOption())
        }
        return deliveryName
    }

    return (
        <div className={ `order-print-page-size_ order-print-page-size_${ printSize }` } ref={ ref }>
            <div className="d-flex flex-column align-top order-kpos-template">
                {/*HEADER STORE INFO*/ }
                <div className="d-flex p-0 flex-column align-items-center">
                    <img
                        className="mt-3"
                        src={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE) }
                        alt={ `logo-${ storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME) }` }
                        width="auto"
                        height="30px"
                    />
                    { customContent.storeInformation &&
                        <h1 className="text-uppercase text-center mt-2">
                            { storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME) || '' }
                        </h1>
                    }
                </div>
                {
                    customContent.storeInformation &&
                    <div className="text-center store-info font-size">
                        {
                            storeInfo.storePhone && <div>
                                { i18next.t('page.order.create.print.receiptInfo.tel', getTranslateOption()) }: { storeInfo.storePhone || '' }
                            </div>
                        }
                        {
                            storeInfo.storeAddress && <div className="text-break">
                                {
                                    storeInfo.storeAddress.split('\n').map((text, key) =>
                                        <React.Fragment key={ `${ text }-${ key }` }>
                                            { text }
                                            <br/>
                                        </React.Fragment>
                                    )
                                }
                            </div>
                        }
                        {
                            TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE]) &&
                            <div className="text-break">
                                { i18next.t('page.order.create.print.receiptInfo.website', getTranslateOption()) }:
                                {
                                    !storeInfo.customDomain ?
                                        `https://${ storeInfo.storeUrl }.${ storeInfo.storeDomain }`
                                        :
                                        `https://${ storeInfo.customDomain }`
                                }
                            </div>
                        }
                    </div>
                }
                {
                    !_.isEmpty(user) &&
                    <>
                        <div className="d-flex p-0 justify-content-center align-items-center">
                            <hr style={ {
                                'borderTop': '1px dashed #DADADA',
                                'width': '100%',
                                'textAlign': 'center',
                                'margin': '5px 0'
                            } }/>
                        </div>

                        {/*CUSTOMER INFO*/ }
                        <div className="d-flex p-0 w-100 align-items-start font-size">
                            <div className="col-12 p-0">
                                { (customContent.customerInformation && !user.customerName?.includes('guest_')) &&
                                    <>
                                        { user.customerName &&
                                            <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">
                                                { i18next.t('page.order.create.print.receiptInfo.customer', getTranslateOption()) }:
                                            </span>
                                                <span className="font-weight-bold">{ user.customerName }</span>
                                            </div>
                                        }

                                        { user.customerPhone &&
                                            <div className="d-flex justify-content-between">
                                                <span>
                                                    { i18next.t('page.order.create.print.receiptInfo.phone', getTranslateOption()) }:
                                                </span>
                                                <span>{ user.customerPhone }</span>
                                            </div>
                                        }
                                        <hr style={ {
                                            'border-top': '1px dashed #DADADA',
                                            'width': '100%',
                                            'textAlign': 'center',
                                            'margin': '5px 0'
                                        } }/>
                                    </>
                                }
                                { (customContent.deliveryInformation && customContent.receiveAmount && isUsedDelivery && shippingInfo.contactName) &&
                                    <>
                                        <div className="d-flex justify-content-between">
                                    <span
                                        className="font-weight-bold">{ i18next.t('page.order.create.print.receiptInfo.recipient', getTranslateOption()) }:</span>
                                            <span
                                                className="ml-1 customer-info font-weight-bold">{ shippingInfo.contactName || '' }</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span>{ i18next.t('page.order.instorePurchase.print.kpos.customer.phone', getTranslateOption()) }:</span>
                                            <span className="ml-1 customer-info">{ shippingInfo.phone || '' }</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                    <span
                                        style={ { width: '28%' } }>{ i18next.t('page.order.instorePurchase.print.kpos.customer.address', getTranslateOption()) }:</span>
                                            <span className="ml-1 customer-info">{
                                                (shippingInfo.address || '') + (shippingInfo.wardName || '') + (shippingInfo.districtName || '') + (shippingInfo.cityName || '')
                                            }</span>
                                        </div>

                                    </>
                                }

                                { (customContent.deliveryInformation && !customContent.receiveAmount && !isUsedDelivery && shippingInfo.contactName) &&
                                <>
                                    <div className="d-flex justify-content-between">
                                    <span
                                        className="font-weight-bold">{ i18next.t('page.order.create.print.receiptInfo.recipient', getTranslateOption()) }:</span>
                                        <span
                                            className="ml-1 customer-info font-weight-bold">{ shippingInfo.contactName || '' }</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>{ i18next.t('page.order.instorePurchase.print.kpos.customer.phone', getTranslateOption()) }:</span>
                                        <span className="ml-1 customer-info">{ shippingInfo.phone || '' }</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                    <span
                                        style={ { width: '28%' } }>{ i18next.t('page.order.instorePurchase.print.kpos.customer.address', getTranslateOption()) }:</span>
                                        <span className="ml-1 customer-info">{
                                            (shippingInfo.address || '') + (shippingInfo.wardName || '') + (shippingInfo.districtName || '') + (shippingInfo.cityName || '')
                                        }</span>
                                    </div>

                                </>
                                }

                                { (customContent.orderNote && note) &&
                                    <div className="d-flex justify-content-between">
                                            <span
                                                style={ { width: '28%' } }>{ i18next.t('page.order.instorePurchase.print.kpos.customer.note', getTranslateOption()) }:</span>
                                        <span className="ml-1 customer-info">{ note || '' }</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </>
                }
                <div
                    className="d-flex flex-column ml-auto mr-auto font-weight-bold text-uppercase w-fit-content text-center">
                    <hr style={ {
                        'borderTop': '1px solid rgba(0, 0, 0, 0.3)',
                        'borderBottom': '3px solid rgba(0, 0, 0, 1)',
                        'width': '100%',
                        'height': '2px',
                        'margin': '5px 0'
                    } }/>
                    <h1>{ i18next.t('page.order.instorePurchase.print.kpos.receipt.title', getTranslateOption()) }</h1>
                </div>

                {/*ORDER INFO*/ }
                {
                    customContent.orderInformation &&
                    <div className="d-flex p-0 w-100 align-items-start font-size mt-1">
                        <div className="col-12 p-0">
                            <div className="d-flex justify-content-between">
                            <span
                                className="font-weight-bold">{ i18next.t('page.order.instorePurchase.print.kpos.product.staff', getTranslateOption()) }:</span>
                                <span className="ml-1 customer-info font-weight-bold">{
                                    staffName === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner', getTranslateOption()) : staffName
                                }</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{ i18next.t('page.order.instorePurchase.print.kpos.product.orderId', getTranslateOption()) }:</span>
                                <span className="ml-1 customer-info">#{ orderId }</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{ i18next.t('page.order.instorePurchase.print.kpos.product.date', getTranslateOption()) }:</span>
                                <span
                                    className="ml-1 customer-info">{ moment(orderDate || moment.now()).format(' DD/MM/YYYY | HH:mm') }</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{ i18next.t('page.order.instorePurchase.print.kpos.product.shippingMethod', getTranslateOption()) }:</span>
                                <span className="ml-1 customer-info">
                                        {
                                            shippingInfo.deliveryName && renderDeliveryName(shippingInfo.deliveryName)
                                        }
                                    {
                                        !shippingInfo.deliveryName && channel !== Constants.SITE_CODE_SHOPEE &&
                                        i18next.t('page.order.create.print.shippingMethod.inStore', getTranslateOption())
                                    }
                                    {
                                        !shippingInfo.deliveryName && channel === Constants.SITE_CODE_SHOPEE && '-'
                                    }
                                </span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>{ i18next.t('page.order.instorePurchase.print.kpos.product.paymentMethod', getTranslateOption()) }:</span>
                                <span className="ml-1 customer-info">{
                                    i18next.t(`page.order.create.print.paymentMethod.${ paymentMethod }`, getTranslateOption())
                                }</span>
                            </div>
                        </div>
                    </div>
                }
                {
                    customContent.orderSummary &&
                    <>
                        {/*PRODUCT LIST*/ }
                        <div className="mt-2 w-100">
                            <table className="w-100 font-size" style={ { color: '#000000' } }>
                                <thead>
                                <tr>
                                    <th className="text-left text-uppercase" style={ { 'width': '53%' } }>
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.name', getTranslateOption()) }
                                    </th>
                                    <th className="text-left text-uppercase">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.quantity', getTranslateOption()) }
                                    </th>
                                    <th className="text-right text-uppercase" style={ { 'width': '35%' } }>
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.priceTotal', getTranslateOption()) }
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                { productList.sort((pervious, current) => {
                                    let compa = 0
                                    if (removeAccents(pervious.name.trim().toLowerCase()) > removeAccents(current.name.trim().toLowerCase()))
                                        compa = 1
                                    else if (removeAccents(pervious.name.trim().toLowerCase()) < removeAccents(current.name.trim().toLowerCase()))
                                        compa = -1
                                    return compa
                                }).map((product, index) => {
                                    return (
                                        <>
                                            <tr key={ product.id }>
                                                <td colSpan={ 3 } className="pl-0 text-left font-size">
                                                    <div className="pt-1">
                                                        { index + 1 }.{ product.name }
                                                        {
                                                            _.isString(product.variationName) && ' - ' + product.variationName.split('|').filter(name => name !== Constants.DEPOSIT.PERCENT_100).join('/ ') + ''
                                                        }
                                                        { product.conversionUnitName &&
                                                            ' - ' + product.conversionUnitName + ''
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className={ ['border-dashed font-size', product.price > 9999999999 ? 'font-size_-65rem' : ''].join(' ') }>{ CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol()) }</td>
                                                <td className="border-dashed font-size">{ NumberUtils.formatThousand(product.quantity) }</td>
                                                <td className={ ['text-right pt-1 pr-0 pb-1 vertical-align-baseline border-dashed font-size', product.totalPrice > 9999999999 ? 'font-size_-65rem' : ''].join(' ') }>
                                                    { CurrencyUtils.formatMoneyByCurrency(product.totalPrice, CurrencyUtils.getLocalStorageSymbol()) }
                                                </td>
                                            </tr>
                                        </>
                                    )
                                }) }
                                </tbody>
                            </table>
                        </div>

                        {/*SUBTOTAL PRICE*/ }
                        <div className="d-flex p-0 justify-content-between mt-2 font-size">
                            <div className="pl-0 text-left text-uppercase">
                                { i18next.t('page.order.instorePurchase.print.kpos.product.subTotal', getTranslateOption()) }:
                            </div>
                            <div className="pr-0 text-right">
                                { CurrencyUtils.formatMoneyByCurrency(subTotal, CurrencyUtils.getLocalStorageSymbol()) }
                            </div>
                        </div>

                        {/*VAT*/ }
                        {
                            (taxAmount != null && !isNaN(taxAmount)) &&
                            <div className="d-flex p-0 justify-content-between align-items-start font-size">
                                <div className="col-3 pl-0 text-left text-uppercase">
                                    { i18next.t('page.order.instorePurchase.print.kpos.product.VAT', getTranslateOption()) }:
                                </div>
                                <div className=" pr-0 text-right">
                                    { CurrencyUtils.formatMoneyByCurrency(taxAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                </div>
                            </div>
                        }

                        {/*REDEEM POINTS*/ }
                        {
                            spendingPoint > 0 &&
                            <div className="d-flex p-0 justify-content-between font-size">
                                <div className="pl-0 text-left text-uppercase">
                                    <div>{ i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints', getTranslateOption()) }:</div>
                                    <div
                                        className="text-normal text-used-point information">({
                                        i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints.used', {
                                            ...getTranslateOption(),
                                            point: spendingPoint ? CurrencyUtils.formatThousand(spendingPoint) : 0
                                        })
                                    })
                                    </div>
                                </div>
                                <div className="pr-0 text-right">
                                    -{ CurrencyUtils.formatMoneyByCurrency(pointAmount || 0, CurrencyUtils.getLocalStorageSymbol()) }
                                </div>
                            </div>
                        }
                        {/*DISCOUNT*/ }
                        {
                            discountAmount > 0 &&
                            <div className="d-flex p-0 justify-content-between align-items-center font-size">
                                <div className="pl-0 text-left text-uppercase">
                                    { i18next.t('page.order.detail.items.discount', getTranslateOption()) }:
                                </div>
                                <div className="pr-0 text-right">
                                    - { CurrencyUtils.formatMoneyByCurrency(discountAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                </div>
                            </div>
                        }

                        {/*SHIPPING FEE*/ }
                        {
                            shippingInfo.method !== METHOD.IN_STORE &&
                            <div className="d-flex p-0 justify-content-between align-items-start font-size">
                                <div className="pl-0 text-left text-uppercase">
                                    { i18next.t('page.order.instorePurchase.print.kpos.product.shippingFee', getTranslateOption()) }:
                                </div>
                                <div className=" pr-0 text-right">
                                    {
                                        !isNaN(discountedShippingFee) &&
                                        <>
                                            {/*show base fee*/ }
                                            {
                                                (shippingInfo && shippingInfo.amount !== discountedShippingFee) &&
                                                <>
                                                    <del>{
                                                        CurrencyUtils.formatMoneyByCurrency(shippingInfo.amount, CurrencyUtils.getLocalStorageSymbol())
                                                    }</del>
                                                    <br/>
                                                </>
                                            }
                                            { CurrencyUtils.formatMoneyByCurrency(discountedShippingFee, CurrencyUtils.getLocalStorageSymbol()) }
                                        </>
                                    }
                                    {
                                        isNaN(discountedShippingFee) &&
                                        CurrencyUtils.formatMoneyByCurrency(shippingInfo ? shippingInfo.amount : 0,
                                            CurrencyUtils.getLocalStorageSymbol())
                                    }
                                </div>
                            </div>
                        }
                        {/*TOTAL PRICE*/ }
                        <div className="d-flex justify-content-between font-size">
                            <div className="pl-0 text-left text-uppercase font-weight-bold">
                                { i18next.t('page.order.instorePurchase.print.kpos.product.total', getTranslateOption()) }:
                            </div>
                            <div className="pr-0 text-right font-weight-bold">
                                { CurrencyUtils.formatMoneyByCurrency(totalPrice, CurrencyUtils.getLocalStorageSymbol()) }
                            </div>
                        </div>
                        {
                            customContent.receiveAmount &&
                            <>
                                <div className="point-indicator"/>

                                <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                                    <div className="pl-0 text-left text-uppercase">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.receivedAmount', getTranslateOption()) }:
                                    </div>
                                    <div className="pr-0 text-right">
                                        { CurrencyUtils.formatMoneyByCurrency(paidAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                    </div>
                                </div>

                                <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                                    <div className="pl-0 text-left text-uppercase">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.changeAmount', getTranslateOption()) }:
                                    </div>
                                    <div className="pr-0 text-right">
                                        { CurrencyUtils.formatMoneyByCurrency(changeAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                    </div>
                                </div>
                            </>
                        }

                        {/*PAID AMOUNT*/}
                        {
                            (!customContent.receiveAmount && paidAmount < subTotal) &&
                                <>
                                <div className="point-indicator"/>

                                <div className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                                    <div className="pl-0 text-left text-uppercase">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.paidAmount', getTranslateOption()) }:
                                    </div>
                                    <div className="pr-0 text-right">
                                        { CurrencyUtils.formatMoneyByCurrency(paidAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                    </div>
                                </div>
                                </>
                        }

                        {/*CUSTOMER DEBT AMOUNT*/ }
                        {
                            debt.isShow &&
                            <>
                                <div className="point-indicator"/>
                                {
                                    ( !!debt.debtAmount && debt.debtAmount !== 0 ) &&
                                    <div
                                        className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                                        <div className="pl-0 text-left text-uppercase">
                                            { i18next.t('page.order.instorePurchase.print.kpos.product.orderRemainingDebt', getTranslateOption()) }:
                                        </div>
                                        <div className="pr-0 text-right">
                                            { CurrencyUtils.formatMoneyByCurrency(debt.debtAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                        </div>
                                    </div>
                                }
                                {
                                    ( !!debt.debtAmount && debt.debtAmount !== 0 || debt.customerDebtAmount !== 0 ) &&
                                    <div
                                        className="d-flex p-0 mt-2 justify-content-between align-items-center font-size">
                                        <div className="pl-0 text-left text-uppercase">
                                            { i18next.t('page.order.instorePurchase.print.kpos.product.customerDebt', getTranslateOption()) }:
                                        </div>
                                        <div className="pr-0 text-right">
                                            { CurrencyUtils.formatMoneyByCurrency(debt.customerDebtAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                        </div>
                                    </div>
                                }
                            </>
                        }

                        {/*PAYABLE AMOUNT*/ }
                        <div className="d-flex mt-2 justify-content-between background-total font-size">
                            <div className="pl-0 text-left text-uppercase font-weight-bold font-size_total">
                                { i18next.t('page.order.instorePurchase.print.kpos.payableAmount', getTranslateOption()) }:
                            </div>
                            <div className="pr-0 text-right font-weight-bold font-size_total">
                                { CurrencyUtils.formatMoneyByCurrency(payableAmount > 0 ? payableAmount : 0, CurrencyUtils.getLocalStorageSymbol()) }
                            </div>
                        </div>

                        {/*EARNED POINTS*/ }
                        {
                            earningPoint > 0 &&
                            <>
                                <div className="point-indicator"/>
                                <div
                                    className="earned-points d-flex p-0 mt-2 justify-content-between align-items-center">
                                    <div className="pl-0 text-left text-uppercase font-weight-bold">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints', getTranslateOption()) }:
                                    </div>
                                    <div className="pr-0 text-right">
                                        {
                                            i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints.point', {
                                                ...getTranslateOption(),
                                                point: earningPoint ? CurrencyUtils.formatThousand(earningPoint) : 0
                                            })
                                        }
                                    </div>
                                </div>
                            </>
                        }
                    </>
                }
                {
                    !customContent.orderSummary &&
                    <div className="d-flex justify-content-between background-total font-size">
                        <div className="pl-0 text-left text-uppercase font-weight-bold">
                            { i18next.t('page.order.instorePurchase.print.kpos.product.total', getTranslateOption()) }:
                        </div>
                        <div className="pr-0 text-right font-weight-bold">
                            { CurrencyUtils.formatMoneyByCurrency(totalPrice, CurrencyUtils.getLocalStorageSymbol()) }
                        </div>
                    </div>
                }
                {/*INFORMATION*/ }
                <div
                    className="information mt-2 font-weight-normal font-style-italic text-center color-gray">
                    { information }
                </div>
                {/*FOOTER THANK YOU*/ }
                <div
                    className="d-flex p-0 mt-2 justify-content-center align-items-center text-center font-weight-bold font-size">
                    { i18next.t('page.order.instorePurchase.print.kpos.product.thankyou', getTranslateOption()) }
                </div>
                {
                    customContent.serviceProviderName &&
                    <div className="d-flex p-0 align-items-center justify-content-center information">
                        { i18next.t('page.order.instorePurchase.print.kpos.product.powered', getTranslateOption()) }
                    </div>
                }
            </div>
        </div>
    )
})

OrderKPosTemplate.defaultProps = {
    storeInfo: {},
    user: {},
    shippingInfo: {},
    productList: [],
    debt: {},
    customContent: {}
}

OrderKPosTemplate.propTypes = {
    orderId: oneOfType([string, number]),
    orderDate: string,
    storeInfo: shape({
        storeAddress: string,
        storePhone: string,
        customDomain: string,
        storeUrl: string,
        storeDomain: string
    }),
    user: shape({
        name: string,
        phone: string
    }),
    staffName: string,
    spendingPoint: number,
    pointAmount: number,
    earningPoint: number,
    shippingInfo: shape({
        contactName: string,
        phone: string,
        address: string,
        wardName: string,
        districtName: string,
        cityName: string,
        deliveryName: string,
        method: string,
        amount: number
    }),
    channel: oneOf([Constants.SITE_CODE_SHOPEE, Constants.SITE_CODE_LAZADA, Constants.SITE_CODE_BEECOW, Constants.SITE_CODE_GOSELL, Constants.SITE_CODE_GOMUA]),
    productList: arrayOf(shape({
        id: number,
        name: string,
        variationName: string,
        modelName: string,
        quantity: number,
        price: number,
        conversionUnitName: string,
        totalPrice: number
    })),
    paymentMethod: string,
    taxAmount: number,
    note: string,
    debt: shape({
        debtAmount: number,
        customerDebtAmount: number,
        isShow: bool
    }),
    paidAmount: number,
    discountedShippingFee: number,
    subTotal: number,
    discountAmount: number,
    totalPrice: number,
    changeAmount: number,
    payableAmount: number,
    langCode: string,
    customContent: shape({
        storeInformation: bool,
        orderInformation: bool,
        customerInformation: bool,
        orderSummary: bool,
        deliveryInformation: bool,
        serviceProviderName: bool,
        orderNote: bool,
        receiveAmount: bool
    }),
    information: string,
    isUsedDelivery: bool
}

export default OrderKPosTemplate
