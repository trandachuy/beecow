import {
    OrderInStorePurchaseContextService
} from '../pages/order/instorePurchase/context/OrderInStorePurchaseContextService'
import Constants from '../config/Constant'

const calcOrderDiscount = (order) => {
    if (!order || !order.orderInfo) {
        return 0
    }

    if (order.orderInfo.discountAmount > 0) {
        return order.orderInfo.discountAmount
    }

    const directDiscount = calcDirectDiscount(order)

    if (directDiscount > 0) {
        return directDiscount
    }

    if (order.orderInfo.membershipInfo) {
        return order.orderInfo.membershipInfo.promoAmount
    } else {
        if (order.orderInfo.discount && order.orderInfo.discount.couponType === 'FREE_SHIPPING') {
            return 0
        }
        if (order.orderInfo.discount && (order.orderInfo.discount.discountId || order.orderInfo.discount.discountType === 'WHOLE_SALE')) { // => use gosell discount code
            return order.orderInfo.discount.totalDiscount
        } else {
            if (order.orderInfo.discount?.totalDiscount) { // has no discount id but has total discount -> direct discount
                return order.orderInfo.discount.totalDiscount
            }
            if (order.orderInfo.totalDiscount) { // has no discount id but has total discount -> shopee
                return order.orderInfo.totalDiscount
            }
            return calcTotalItemDiscount(order)
        }
    }
}

const calcTotalItemDiscount = (order) => {
    let sumOrg = 0, sumDiscount = 0
    for (let items of order.items) {
        sumOrg += items.orgPrice
        sumDiscount += items.price
    }
    return sumOrg - sumDiscount
}

const calcDirectDiscount = (order) => {
    if (!order || !order.orderInfo) {
        return 0
    }

    if (order.orderInfo.discountOption > 0) {
        return order.orderInfo.discountOption > order.orderInfo.subTotal ? order.orderInfo.subTotal : order.orderInfo.discountOption
    }

    return 0
}

const getProductListForPrint = order => {
    const { items, orderInfo } = order

    return items.map(item => {
        item.totalPrice = item.price * item.quantity

        if (!orderInfo.discount || !orderInfo.discount.wholeSaleList) {
            return {
                ...item,
                checked: true
            }
        }

        const itemWholeSale = orderInfo.discount.wholeSaleList.find(wholeSale => wholeSale.itemId === item.itemId && wholeSale.modelId === item.variationId)

        if (!itemWholeSale) {
            return {
                ...item,
                checked: true
            }
        }

        return {
            ...item,
            checked: true,
            wholeSale: {
                discountAmount: itemWholeSale.promoAmount
            }
        }
    })
}

const getMembershipInfoForPrint = order => {
    return order.orderInfo.membershipInfo
        ? {
            ...order.orderInfo.membershipInfo,
            enabledBenefit: true
        } : null
}

const getTotalPriceForPrint = order => {
    const { shippingInfo, orderInfo } = order

    return OrderInStorePurchaseContextService.calculateTotalPrice(
        getProductListForPrint(order),
        shippingInfo,
        orderInfo.discount,
        getMembershipInfoForPrint(order),
        orderInfo.totalTaxAmount,
        orderInfo.pointAmount
    )
}

const getChangeAmountForPrint = (order) => {
    const { shippingInfo, orderInfo } = order
    const paidAmount = order.orderInfo.receivedAmount

    return OrderInStorePurchaseContextService.calculateChangeAmount(
        OrderDetailUtils.getProductListForPrint(order),
        shippingInfo,
        orderInfo.discount,
        OrderDetailUtils.getMembershipInfoForPrint(order),
        orderInfo.totalTaxAmount,
        orderInfo.pointAmount,
        paidAmount
    )
}

const getPayableAmountForPrint = (order, customerDebtAmount) => {
    const { orderInfo } = order
    const totalPrice = getTotalPriceForPrint(order)
    const orderStatus = orderInfo.status
    const orderPlatform = orderInfo.inStore
    const receivedAmount = orderInfo.receivedAmount ? orderInfo.receivedAmount : 0
    const paymentMethod = orderInfo.paymentMethod

    if (!customerDebtAmount) customerDebtAmount = 0

    if (!orderPlatform && paymentMethod !== 'DEBT') {
        return customerDebtAmount + totalPrice - receivedAmount
    } else {
        if (orderStatus === Constants.ORDER_STATUS_DELIVERED ||
            orderStatus === Constants.ORDER_STATUS_RETURNED ||
            orderStatus === Constants.ORDER_STATUS_CANCELLED) {
            return customerDebtAmount
        }

        return customerDebtAmount + totalPrice
    }
}

export const OrderDetailUtils = {
    calcOrderDiscount,
    calcDirectDiscount,
    getProductListForPrint,
    getMembershipInfoForPrint,
    getTotalPriceForPrint,
    getChangeAmountForPrint,
    getPayableAmountForPrint
}
