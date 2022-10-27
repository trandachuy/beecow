import React from 'react'
import Constants from '../../../../config/Constant'
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format'
import moment from 'moment'
import {CredentialUtils} from '../../../../utils/credential'
import {TokenUtils} from '../../../../utils/token'
import {PACKAGE_FEATURE_CODES} from '../../../../config/package-features'
import storageService from '../../../../services/storage'
import i18next from 'i18next'
import {arrayOf, bool, number, oneOf, oneOfType, shape, string} from 'prop-types'
import './OrderA4Template.sass'
import {METHOD} from '../../instorePurchase/context/OrderInStorePurchaseContext'
import OrderKPosTemplate from './OrderKPosTemplate'

const OrderA4Template = React.forwardRef((props, ref) => {
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
        <div ref={ ref }>
            <div className="d-flex flex-column w-100 order-a4-template">
                {/*HEADER*/ }
                <div className="page-header">
                    <div className="page-header-wrapper">
                        <div className="page-header-content">
                            <div style={ { width: '30%' } }>
                                <img
                                    src={ storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE) }
                                    alt={ `logo-${ storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME) }` }
                                    width="auto"
                                    height="50px"
                                />
                            </div>
                            <h4 className="text-uppercase font-size-2rem font-weight-bold m-auto text-nowrap">
                                { i18next.t('page.order.create.print.receipt', getTranslateOption()) }
                            </h4>
                            <div style={ { width: '30%' } } className="text-right">
                                <b>
                                    { i18next.t('page.order.create.print.orderId', getTranslateOption()) }:
                                </b>
                                &nbsp;#{ orderId }
                            </div>
                        </div>
                        {
                            customContent.storeInformation &&
                            <>
                                <div className="page-info-store">
                                    <span className='font-size-1_2rem'>{ storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME) }</span>
                                </div>
                                <div className="page-header-info d-flex justify-content-between align-items-center">
                                    <span className="address">{
                                        storeInfo.storeAddress
                                            ? storeInfo.storeAddress.split('\n').map((text, key) =>
                                                <React.Fragment key={ `${ text }-${ key }` }>
                                                    { text }
                                                    <br/>
                                                </React.Fragment>
                                            )
                                            : ''
                                    }</span>
                                    <div className="store-info-right">
                                        <div className="d-flex align-items-center">
                                            <span
                                                className="title icon-dash">{ i18next.t('page.order.create.print.receiptInfo.tel', getTranslateOption()) }:</span>
                                            <span className="ml-1">{ storeInfo.storePhone }</span>
                                        </div>
                                        { TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE]) &&
                                            <div className="d-flex align-items-center">
                                                <span
                                                    className="title icon-dash">{ i18next.t('page.order.create.print.receiptInfo.website', getTranslateOption()) }:</span>
                                                <span className="ml-1">{
                                                    !storeInfo.customDomain ?
                                                        `https://${ storeInfo.storeUrl }.${ storeInfo.storeDomain }`
                                                        :
                                                        `https://${ storeInfo.customDomain }`
                                                }</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="indicator"></div>
                            </>
                        }
                    </div>
                </div>

                {/*RECEIPT INFORMATION*/ }
                <div className="table-information">
                    {/*<tbody>*/ }
                    <div className="info-left">
                        { (customContent.customerInformation && !user.customerName?.includes('guest_')) &&
                            <>
                                {user.customerName &&
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="title font-weight-bold">
                                            { i18next.t('page.order.create.print.receiptInfo.customer', getTranslateOption()) }:
                                        </span>
                                        <span className="font-weight-bold font-size-1_2rem">{ user.customerName }</span>
                                    </div>
                                }

                                { user.customerPhone &&
                                    <div className="d-flex justify-content-between pb-2 border-dashed">
                                        <span
                                            className="title">{ i18next.t('page.order.create.print.receiptInfo.phone', getTranslateOption()) }:
                                        </span>
                                        <span>{ user.customerPhone }</span>
                                    </div>
                                }
                            </>
                        }
                        { (customContent.deliveryInformation && customContent.receiveAmount && isUsedDelivery && shippingInfo.contactName) &&
                            <>
                                <div className="d-flex justify-content-between mb-1 mt-2">
                            <span className="title font-weight-bold">
                                { i18next.t('page.order.create.print.receiptInfo.recipient', getTranslateOption()) }:
                            </span>
                                    <span className="font-weight-bold font-size-1_2rem">{ shippingInfo.contactName }</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                { i18next.t('page.order.create.print.receiptInfo.phone', getTranslateOption()) }:
                            </span>
                                    <span>{ shippingInfo.phone }</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1">
                            <span className="title" style={ {
                                width: '30%'
                            } }>
                                { i18next.t('page.order.create.print.receiptInfo.address', getTranslateOption()) }:
                            </span>
                                    <span className="text-right">{
                                        (shippingInfo.address || '') + (shippingInfo.wardName || '') + (shippingInfo.districtName || '') + (shippingInfo.cityName || '')
                                    }</span>
                                </div>
                            </>
                        }

                        { (customContent.deliveryInformation && !customContent.receiveAmount && !isUsedDelivery && shippingInfo.contactName) &&
                        <>
                            <div className="d-flex justify-content-between mb-1 mt-2">
                            <span className="title font-weight-bold">
                                { i18next.t('page.order.create.print.receiptInfo.recipient', getTranslateOption()) }:
                            </span>
                                <span className="font-weight-bold font-size-1_2rem">{ shippingInfo.contactName }</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                { i18next.t('page.order.create.print.receiptInfo.phone', getTranslateOption()) }:
                            </span>
                                <span>{ shippingInfo.phone }</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                            <span className="title" style={ {
                                width: '30%'
                            } }>
                                { i18next.t('page.order.create.print.receiptInfo.address', getTranslateOption()) }:
                            </span>
                                <span className="text-right">{
                                    (shippingInfo.address || '') + (shippingInfo.wardName || '') + (shippingInfo.districtName || '') + (shippingInfo.cityName || '')
                                }</span>
                            </div>
                        </>
                        }
                    </div>
                    <div className="info-right">
                        { customContent.orderInformation &&
                            <>
                                <div className="d-flex justify-content-between mb-1">
                            <span className="title font-weight-bold">
                                { i18next.t('page.order.create.print.receiptInfo.staff', getTranslateOption()) }:
                            </span>
                                    <span className="line-clamp-3 font-weight-bold font-size-1_2rem">{
                                        staffName === '[shop0wner]' ? i18next.t('page.order.detail.information.shopOwner', getTranslateOption()) : staffName
                                    }</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                { i18next.t('page.order.create.print.receiptInfo.orderDate', getTranslateOption()) }:
                            </span>
                                    <span>{ moment(orderDate || moment.now()).format('HH:mm DD/MM/YYYY') }</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                { i18next.t('page.order.create.print.receiptInfo.shippingMethod', getTranslateOption()) }:
                            </span>
                                    <span>
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
                                <div className="d-flex justify-content-between mb-1">
                            <span className="title">
                                    { i18next.t('page.order.create.print.receiptInfo.paymentMethod', getTranslateOption()) }:
                                </span>
                                    <span>{ i18next.t(`page.order.create.print.paymentMethod.${ paymentMethod }`, getTranslateOption()) }</span>
                                </div>
                            </>
                        }
                        { customContent.orderNote &&
                            <div className="d-flex justify-content-between mb-1">
                                <span className="title">
                                    { i18next.t('page.order.create.print.receiptInfo.note', getTranslateOption()) }:
                                </span>
                                <span className="line-clamp-5" style={ {
                                    width: '80%'
                                } }>{ note }</span>
                            </div>
                        }
                    </div>
                </div>

                {/*PRODUCT LIST*/ }
                {
                    customContent.orderSummary &&
                    <div className="w-100 mt-4 mb-2 product-list">
                        <table className="w-100">
                            <colgroup>
                                <col width="5%"/>
                                <col width="45%"/>
                                <col width="20%"/>
                                <col width="10%"/>
                                <col width="20%"/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>
                                    { i18next.t('productList.tbheader.no', getTranslateOption()) }
                                </th>
                                <th>
                                    { i18next.t('productList.tbheader.productName', getTranslateOption()) }
                                </th>
                                <th>
                                    { i18next.t('productList.tbheader.unitPrice', getTranslateOption()) }
                                </th>
                                <th>
                                    { i18next.t('component.product.addNew.unit.title') }
                                </th>
                                <th className="text-right">
                                    { i18next.t('page.order.create.cart.table.priceTotal', getTranslateOption()) }
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                productList.slice().sort((pervious, current) => {
                                    let compa = 0
                                    if (removeAccents(pervious.name.trim().toLowerCase()) > removeAccents(current.name.trim().toLowerCase()))
                                        compa = 1
                                    else if (removeAccents(pervious.name.trim().toLowerCase()) < removeAccents(current.name.trim().toLowerCase()))
                                        compa = -1
                                    return compa
                                }).filter(p => p.checked).map((product, index) => {
                                    return (
                                        <tr key={ product.id }>
                                            <td>{ index + 1 }</td>
                                            <td>
                                                <span className="text-overflow-ellipsis">{ product.name }</span>
                                                <span>{
                                                    product.variationName && (
                                                        ' (' + (product.variationName || '').split('|')
                                                            .filter(v => v !== Constants.DEPOSIT_CODE.FULL).join('/') + ')'
                                                    )
                                                }</span>
                                                { product.modelName && <span>{ product.modelName }</span> }
                                            </td>
                                            <td>
                                                { NumberUtils.formatThousand(product.quantity) } x { CurrencyUtils.formatMoneyByCurrency(product.price, CurrencyUtils.getLocalStorageSymbol()) }
                                            </td>
                                            <td>{ product.conversionUnitName || '-' }</td>
                                            <td className="text-right">
                                                { CurrencyUtils.formatMoneyByCurrency(product.totalPrice, CurrencyUtils.getLocalStorageSymbol()) }
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            {/*PRICE INFORMATION*/ }
                            <tr className="border-0">
                                <td colSpan={ 2 }></td>
                                <td className="text-uppercase">
                                    { i18next.t('page.order.instorePurchase.print.kpos.product.subTotal', getTranslateOption()) }:
                                </td>
                                <td></td>
                                <td className="text-right">{ CurrencyUtils.formatMoneyByCurrency(subTotal, CurrencyUtils.getLocalStorageSymbol()) }</td>
                            </tr>
                            {
                                (taxAmount != null && !isNaN(taxAmount)) &&
                                <tr className="border-0">
                                    <td colSpan={ 2 }></td>
                                    <td className="text-uppercase">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.VAT', getTranslateOption()) }:
                                    </td>
                                    <td></td>
                                    <td className="text-right">{
                                        CurrencyUtils.formatMoneyByCurrency(taxAmount, CurrencyUtils.getLocalStorageSymbol())
                                    }</td>
                                </tr>
                            }
                            {/*REDEEM POINTS*/ }
                            { spendingPoint > 0 &&
                                <tr className="border-0">
                                    <td colSpan={ 2 }></td>
                                    <td colSpan={ 2 } className="text-uppercase">
                                        <span>{ i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints', getTranslateOption()) }</span>
                                        <span
                                            className="text-used-point">(
                                            {
                                                i18next.t('page.order.instorePurchase.print.kpos.product.redeemPoints.used', {
                                                    ...getTranslateOption(),
                                                    point: spendingPoint ? CurrencyUtils.formatThousand(spendingPoint) : 0
                                                })
                                            }
                                            ):
                                    </span>
                                    </td>
                                    <td className="vertical-align-baseline text-right">-{ CurrencyUtils.formatMoneyByCurrency(pointAmount || 0, CurrencyUtils.getLocalStorageSymbol()) }</td>
                                </tr>
                            }
                            {
                                discountAmount > 0 &&
                                <tr className="border-0">
                                    <td colSpan={ 2 }></td>
                                    <td className="text-uppercase">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.discount', getTranslateOption()) }:
                                    </td>
                                    <td></td>
                                    <td className="text-right">- { CurrencyUtils.formatMoneyByCurrency(discountAmount, CurrencyUtils.getLocalStorageSymbol()) }</td>
                                </tr>
                            }
                            {
                                shippingInfo.method !== METHOD.IN_STORE &&
                                <tr className="border-0">
                                    <td colSpan={ 2 }></td>
                                    <td className="text-uppercase text-nowrap">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.shippingFee', getTranslateOption()) }:
                                    </td>
                                    <td></td>
                                    <td className="vertical-align-baseline text-right">
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
                                            CurrencyUtils.formatMoneyByCurrency(shippingInfo ? shippingInfo.amount : 0, CurrencyUtils.getLocalStorageSymbol())
                                        }
                                    </td>
                                </tr>
                            }
                            <tr className="border-0">
                                <td colSpan={ 2 }></td>
                                <td className="font-weight-bold font-size-1_2rem text-nowrap">
                                    { i18next.t('page.order.instorePurchase.print.kpos.product.total', getTranslateOption()) }:
                                </td>
                                <td></td>
                                <td className="vertical-align-baseline text-right font-weight-bold font-size-1_2rem">{
                                    CurrencyUtils.formatMoneyByCurrency(totalPrice, CurrencyUtils.getLocalStorageSymbol())
                                }</td>
                            </tr>
                            {
                                customContent.receiveAmount &&
                                <>
                                    <tr className="border-0">
                                        <td colSpan={ 2 }></td>
                                        <td className="text-uppercase">
                                            { i18next.t('page.order.instorePurchase.print.kpos.product.receivedAmount', getTranslateOption()) }:
                                        </td>
                                        <td></td>
                                        <td className="vertical-align-baseline text-right">{
                                            CurrencyUtils.formatMoneyByCurrency(paidAmount, CurrencyUtils.getLocalStorageSymbol())
                                        }</td>
                                    </tr>
                                    <tr className="border-0">
                                        <td colSpan={ 2 }></td>
                                        <td className="text-uppercase">
                                            { i18next.t('page.order.instorePurchase.print.kpos.product.changeAmount', getTranslateOption()) }:
                                        </td>
                                        <td></td>
                                        <td className="vertical-align-baseline text-right">
                                            { CurrencyUtils.formatMoneyByCurrency(changeAmount, CurrencyUtils.getLocalStorageSymbol()) }
                                        </td>
                                    </tr>
                                </>
                            }
                            {
                                (!customContent.receiveAmount && paidAmount < subTotal) &&
                                    <tr className="border-0">
                                        <td colSpan={ 2 }></td>
                                        <td className="text-uppercase">
                                            { i18next.t('page.order.instorePurchase.print.kpos.product.paidAmount', getTranslateOption()) }:
                                        </td>
                                        <td></td>
                                        <td className="vertical-align-baseline text-right">{
                                            CurrencyUtils.formatMoneyByCurrency(paidAmount, CurrencyUtils.getLocalStorageSymbol())
                                        }</td>
                                    </tr>
                            }
                            {
                                debt.isShow &&
                                <>
                                    {
                                        (!!debt.debtAmount && debt.debtAmount !== 0) &&
                                        <tr className="border-0">
                                            <td colSpan={ 2 }></td>
                                            <td className="text-uppercase point-indicator">
                                                { i18next.t('page.order.instorePurchase.print.kpos.product.orderRemainingDebt', getTranslateOption()) }:
                                            </td>
                                            <td className="point-indicator"></td>
                                            <td className="vertical-align-baseline point-indicator text-right">{
                                                CurrencyUtils.formatMoneyByCurrency(debt.debtAmount, CurrencyUtils.getLocalStorageSymbol())
                                            }</td>
                                        </tr>
                                    }
                                    {
                                        (!!debt.debtAmount && debt.debtAmount !== 0 || debt.customerDebtAmount !== 0) &&
                                        <tr className="border-0">
                                            <td colSpan={ 2 }></td>
                                            <td className="text-uppercase">
                                                { i18next.t('page.order.instorePurchase.print.kpos.product.customerDebt', getTranslateOption()) }:
                                            </td>
                                            <td></td>
                                            <td className="vertical-align-baseline text-right">{
                                                CurrencyUtils.formatMoneyByCurrency(debt.customerDebtAmount, CurrencyUtils.getLocalStorageSymbol())
                                            }</td>
                                        </tr>
                                    }
                                </>
                            }

                            {/*PAYABLE AMOUNT*/ }
                            <tr className="border-0" style={ { backgroundColor: 'rgba(0, 0, 0, 0.05)' } }>
                                <td colSpan={ 2 }></td>
                                <td className="font-weight-bold text-uppercase text-nowrap font-size-1_4rem">
                                    { i18next.t('page.order.instorePurchase.print.kpos.payableAmount', getTranslateOption()) }:
                                </td>
                                <td></td>
                                <td className="font-weight-bold vertical-align-baseline text-right font-size-1_4rem">
                                    { CurrencyUtils.formatMoneyByCurrency(payableAmount > 0 ? payableAmount : 0, CurrencyUtils.getLocalStorageSymbol()) }
                                </td>
                            </tr>


                            {/*EARNED POINTS*/ }
                            { earningPoint > 0 &&
                                <tr className="border-0">
                                    <td colSpan={ 2 }></td>
                                    <td className="text-uppercase point-indicator text-nowrap">
                                        { i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints', getTranslateOption()) }:
                                    </td>
                                    <td className="point-indicator"></td>
                                    <td className="vertical-align-baseline point-indicator text-right">{
                                        i18next.t('page.order.instorePurchase.print.kpos.product.earnedPoints.point', {
                                            ...getTranslateOption(),
                                            point: CurrencyUtils.formatThousand(earningPoint)
                                        })
                                    }</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                    </div>
                }

                {
                    !customContent.orderSummary &&
                    <div className="total-order d-flex justify-content-end"
                         style={ { backgroundColor: 'rgba(0, 0, 0, 0.05)', padding: '5px 0' } }>
                        <span className="font-weight-bold font-size-1_4rem text-nowrap">
                            { i18next.t('page.order.instorePurchase.print.kpos.product.total', getTranslateOption()) }:
                        </span>
                        <span className="vertical-align-baseline text-right font-weight-bold font-size-1_4rem ml-5">{
                            CurrencyUtils.formatMoneyByCurrency(totalPrice, CurrencyUtils.getLocalStorageSymbol())
                        }</span>
                    </div>
                }

                <div className="infomation">
                    { information }
                </div>

                {/*FOOTER*/ }
                <div className="footer">
                    <div
                        className="d-flex p-0 justify-content-center align-items-center text-center font-weight-bold">
                        { i18next.t('page.order.instorePurchase.print.kpos.product.thankyou', getTranslateOption()) }
                    </div>
                    {
                        customContent.serviceProviderName &&
                        <div
                            className="d-flex p-0 align-items-center justify-content-center font-size-_8rem text-wrap">
                            { i18next.t('page.order.instorePurchase.print.kpos.product.powered', getTranslateOption()) }
                        </div>
                    }
                </div>
            </div>
            <p style={ { pageBreakBefore: 'always' } }/>
        </div>
    )
})

OrderA4Template.defaultProps = {
    storeInfo: {},
    user: {},
    shippingInfo: {},
    productList: [],
    debt: {},
    customContent: {}
}

OrderA4Template.propTypes = {
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

export default OrderA4Template
