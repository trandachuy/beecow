import React from 'react'
import Constants from '../../../../config/Constant'
import {array} from 'prop-types'
import OrderA4Template from './OrderA4Template'

const OrderListTemplate = React.forwardRef((props, ref) => {
    const { orders, children, ...rest } = props

    return (
        <div ref={ ref }>
            {
                orders.map(order => React.cloneElement(children, {
                    key: order.orderId,
                    ...order,
                    ...rest
                }))
            }
        </div>
    )
})

OrderListTemplate.defaultProps = {
    orders: []
}

OrderListTemplate.propTypes = {
    orders: array
}

export default OrderListTemplate
