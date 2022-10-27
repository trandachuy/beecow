import './ZaloOrderSummaryMessage.sass'
import React, {useState} from 'react'
import GSImg from "../../../../../components/shared/GSImg/GSImg";
import {CurrencyUtils} from "../../../../../utils/number-format";
import GoSocialOrderSummaryModal from "../OrderSummaryModal/ZaloOrderSummaryModal";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import {arrayOf, number, oneOfType, shape, string} from 'prop-types'
import i18next from 'i18next'

const GoSocialOrderSummaryMessage = props => {
    const {data} = props
    const {productList, buyerName, buyerPhone, shippingAddress, paymentMethod, total} = data

    const [stZaloOrderSummaryModal, setStZaloOrderSummaryModal] = useState(false)

    return (
        <>
            <GoSocialOrderSummaryModal
                modal={stZaloOrderSummaryModal}
                toggle={() => setStZaloOrderSummaryModal(modal => !modal)}
                data={data}
            />
            <div className='zalo-order-summary-message' onClick={() => setStZaloOrderSummaryModal(modal => !modal)}>
                <div className='summary'>
                    <span className='title'>
                        <GSTrans t='component.zaloOrderSummaryMessage.title'/>
                    </span>
                    <div className='indicator'/>
                    <div className='bill'>
                        {
                            productList.map((p, i) => (
                                <div className='item' key={i}>
                                    <GSImg src={p.image} width={61} height={61} alt='product'/>
                                    <div className='info'>
                                        <span className='name line-clamp-2'>{p.name}</span>
                                        <span className='model'>{p.modelName}</span>
                                        <span className='quantity'><GSTrans t='component.zaloOrderSummaryMessage.quantity' values={{n: p.quantity}}/></span>
                                    </div>
                                </div>
                            ))
                        }
                        <span className='shipping-address'>
                            <GSTrans t='component.zaloOrderSummaryMessage.shippingAddress'/>
                        </span>
                        <span className='buyer-name'>{buyerName} - {buyerPhone}</span>
                        <span className='buyer-address'>{shippingAddress}</span>
                        <span className='payment-method'><GSTrans t='component.zaloOrderSummaryMessage.paymentMethod'/></span>
                        <span className='payment-method-value'>{i18next.t(`page.order.detail.information.paymentMethod.${paymentMethod}`)}</span>
                    </div>
                </div>
                <div className='total'>
                    <span><GSTrans t='component.zaloOrderSummaryMessage.total'/></span>
                    <span>{CurrencyUtils.formatMoneyByCurrency(total,CurrencyUtils.getLocalStorageSymbol())}</span>
                </div>
            </div>
        </>
    )
}

GoSocialOrderSummaryMessage.defaultProps = {
    data: {
        productList: []
    },
}

GoSocialOrderSummaryMessage.propTypes = {
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

export default GoSocialOrderSummaryMessage