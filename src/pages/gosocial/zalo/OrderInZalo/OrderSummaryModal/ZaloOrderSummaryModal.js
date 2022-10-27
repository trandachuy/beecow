import './ZaloOrderSummaryModal.sass'
import React from 'react'
import ModalBody from "reactstrap/es/ModalBody";
import Modal from "reactstrap/es/Modal";
import {arrayOf, bool, func, number, oneOfType, shape, string} from 'prop-types'
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import {CurrencyUtils, NumberUtils} from "../../../../../utils/number-format";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import i18next from 'i18next'

const ZaloOrderSummaryModal = props => {
    const {modal, toggle, data} = props
    const {
        orderId,
        sellerName,
        sellerImage,
        buyerName,
        buyerPhone,
        shippingAddress,
        paymentMethod,
        note,
        productList,
        subTotal,
        vat,
        discount,
        shipping,
        total
    } = data

    return (
        <Modal isOpen={modal} toggle={toggle} className='zalo-order-summary-modal' size='xl'>
            <div className='modal-close' onClick={toggle}><GSImg src='/assets/images/icon-close.svg'/></div>
            <ModalBody className='info'>
                <div className='product-info'>
                    <div className='user'>
                        <GSImg src={sellerImage} width={62} height={62} alt='avatar' className='avatar'/>
                        <div className='username'>{sellerName}</div>
                    </div>
                    <div className='order-number'>
                        <GSTrans t='component.zaloOrderSummary.orderNumber' values={{n: orderId}}/>
                    </div>
                    <div className='table'>
                        <table>
                            <colgroup>
                                <col style={{width: '40%'}}/>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '20%'}}/>
                            </colgroup>
                            <thead>
                            <tr>
                                <th><GSTrans t='component.zaloOrderSummary.table.productName'/></th>
                                <th><GSTrans t='component.zaloOrderSummary.table.price'/></th>
                                <th><GSTrans t='component.zaloOrderSummary.table.quantity'/></th>
                                <th><GSTrans t='component.zaloOrderSummary.table.total'/></th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                productList.map((p, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className='product'>
                                                <GSImg src={p.image} width={53} height={53} alt='product'/>
                                                <div className='name'>
                                                    <span className='line-clamp-2'>{p.name}</span>
                                                    <div className='model'>
                                                        <span>{p.modelName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {CurrencyUtils.formatMoneyByCurrency(p.newPrice,CurrencyUtils.getLocalStorageSymbol())}
                                        </td>
                                        <td>
                                            {NumberUtils.formatThousand(p.quantity)}
                                        </td>
                                        <td>
                                            {CurrencyUtils.formatMoneyByCurrency((p.newPrice * p.quantity),CurrencyUtils.getLocalStorageSymbol())}
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='order-summary'>
                    <div className='shipping-info'>
                        <span className='title'><GSTrans t='component.zaloOrderSummary.shippingAddress'/></span>
                        <div className='indicator'/>
                        <span className='buyer-name'>{buyerName}</span>
                        <span className='buyer-phone'>{buyerPhone}</span>
                        <span className='buyer-address'>{shippingAddress}</span>
                        <span className='title'><GSTrans t='component.zaloOrderSummary.paymentMethod'/></span>
                        <div className='indicator'/>
                        <span className='payment-method'>{i18next.t(`page.order.detail.information.paymentMethod.${paymentMethod}`)}</span>
                    </div>
                    <div className='shipping-info'>
                        <span className='title m-0'><GSTrans t='component.zaloOrderSummary.note'/></span>
                        <div className='indicator'/>
                        <span className='note'>{note}</span>
                    </div>
                    <div className='shipping-info'>
                        <div className='total-row font-weight-500'>
                            <span><GSTrans t='component.zaloOrderSummary.subtotal' values={{n: productList.length}}/></span>
                            <span>{CurrencyUtils.formatMoneyByCurrency(subTotal,CurrencyUtils.getLocalStorageSymbol())}</span>
                        </div>
                        <div className='total-row'>
                            <span>VAT</span>
                            <span>{CurrencyUtils.formatMoneyByCurrency(vat,CurrencyUtils.getLocalStorageSymbol())}</span>
                        </div>
                        <div className='total-row'>
                            <span><GSTrans t='component.zaloOrderSummary.discount'/></span>
                            <span>{CurrencyUtils.formatMoneyByCurrency(discount,CurrencyUtils.getLocalStorageSymbol())}</span>
                        </div>
                        <div className='total-row'>
                            <span><GSTrans t='component.zaloOrderSummary.shipping'/></span>
                            <span>{CurrencyUtils.formatMoneyByCurrency(shipping,CurrencyUtils.getLocalStorageSymbol())}</span>
                        </div>
                        <div className='total-row total'>
                            <span><GSTrans t='component.zaloOrderSummary.total'/></span>
                            <span>{CurrencyUtils.formatMoneyByCurrency(total,CurrencyUtils.getLocalStorageSymbol())}</span>
                        </div>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

ZaloOrderSummaryModal.defaultProps = {
    toggle: function () {
    },
    data: {
        productList: []
    },
}

ZaloOrderSummaryModal.propTypes = {
    modal: bool,
    toggle: func,
    data: shape({
        orderId: oneOfType([number, string]),
        sellerName: string,
        sellerImage: string,
        buyerName: string,
        buyerPhone: string,
        shippingAddress: string,
        paymentMethod: string,
        note: string,
        productList: arrayOf(shape({
            name: string,
            modelName: string,
            image: string,
            newPrice: number,
            quantity: number
        })),
        subTotal: number,
        vat: number,
        discount: number,
        shipping: number,
        total: number
    }),
}

export default ZaloOrderSummaryModal