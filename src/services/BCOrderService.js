import apiClient from "../config/api";
import Constants from "../config/Constant";
import {CredentialUtils} from "../utils/credential";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const getOrderDetail = (id) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs/order-details/ids/${id}`)
            .then( (response) => {
                resolve(response.data)
            })
            .catch( reject )
    })

}

const getBcOrderDetail = (id) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/shop/bc-orders/${id}/details`)
            .then( (response) => {
                resolve(response.data)
            })
            .catch( reject )
    })

}

const getListBcOrderDetail = (langCode = "vi",ids = []) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/gs/order-details?langKey=${langCode}`, ids)
            .then( (response) => {
                resolve(response.data)
            })
            .catch( reject )
    })

}

const confirmOrder = (requestBody) => {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            reject('timeOut')
        }, 10000)
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/shop/bc-orders/confirm`, requestBody)
            .then( (response) => {
                resolve(response.data)
            })
            .catch(reject)
    })
}

const rejectOrder = (requestBody) => {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            reject('timeOut')
        }, 10000)
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/shop/bc-orders/reject`, requestBody)
            .then( response => {
                resolve(response.data)
            })
            .catch(reject)
    })
}

const deliveredOder = (orderId) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/shop/bc-orders/${orderId}/status/delivered`, {})
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const deliveredOrderSelfDelivery = (orderIds) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/shop/bc-orders/self-delivery/status/delivered`, {orderIds: orderIds})
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getDiscounts = (params) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns`, {params: params})
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}

const endEarly = (id, storeId) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`${Constants.ORDER_BC_SERVICE}/api/gs-discount?id=${id}&storeId=${storeId}`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getGenCode = () => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/generate-coupon-code`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const createCoupon = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/coupons`, data)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getCouponDetail = (couponId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/${couponId}`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getCouponDetailFull = (couponId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/${couponId}/full-condition`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const updateCoupon = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/coupons`, data)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const removeDiscount = (id) => {
    return new Promise( (resolve, reject) => {
        apiClient.delete(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/${id}`)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}


const getCustomerSummary = (customerId, saleChannel) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/customer-orders/${storeId}/summary`, {
            params: {
                username: customerId,
                saleChannel: saleChannel
            }

        })
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getCustomerAvatar = (userId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/bc-users/avatars/${userId}`)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getUserDeliveryInfo = (userId) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/instore/bc-users/${userId}`)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
};

const getCustomerOrderList = (userId, page, size, orderId, channel, sort = undefined) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/orders`, {
            params: {
                page: page,
                size: size,
                buyerId: userId,
                sellerId: storeId,
                orderId: orderId,
                channel: channel.toLowerCase(),
                sort: sort
            }
        })
            .then(result => {
                resolve({
                    data: result.data,
                    total: parseInt(result.headers['x-total-count'])
                })
            })
            .catch(reject)
    })
}


const getListReservation = (params) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/order-bookings/${storeId}/search`, {params: params})
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}

const getReservationDetail = (id) => {
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs/booking-details/ids/${id}`)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}

const editReservationDetail = (id, params) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/gs/booking-details/ids/${id}`, params)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}

const getShippingProvider = () => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/bc-store-delivery-settings/storeId/${storeId}`)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getPaymentSetting = () => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/bc-store-payment-settings/store/${storeId}`)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
};

const savePaymentSetting = (data) => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-store-payment-settings/store/${storeId}`, data)
            .then(res => {
                resolve(res.data)
            })
            .catch(reject)
    })
};

const getStatisticOfDashboard = () => {
    const storeId = CredentialUtils.getStoreId();
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/order_reservation/statistic/${storeId}`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

/*
items: [{
    itemId:  number,
    price: number,
    modelId: number,
    quantity: number
}]
 */
const checkPromotionCode = (items, coupon, userId) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/instore/check-coupon`, {
            items: items,
            coupon: coupon,
            userId: userId,
            storeId: CredentialUtils.getStoreId(),
            langKey: CredentialUtils.getLangKey(),
        })
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

/**
 * Check VAT
 * @param {ItemVATVMModel[]} items
 * @return {Promise<CheckGSVATVMResponseModel>}
 */
const checkVAT = (items) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/instore/check-vat`, {
            items: items,
            storeId: CredentialUtils.getStoreId(),
        })
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

/*
items: [{
    itemId:  number,
    price: number,
    modelId: number,
    quantity: number
}]
 */
const checkMembership = (items, userId, branchId) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/instore/check-membership`, {
            items: items,
            userId: userId,
            branchId,
            storeId: CredentialUtils.getStoreId(),
        })
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

/*
listItemChecked: [{
    itemId
    modelId
    price
    quantity
}]
 */
const checkWholeSale = (listItemChecked, userId) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/instore/check-wholesale/${storeId}`, {
            listItemChecked: listItemChecked,
            userId: userId
        })
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const checkShippingFee = (params) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        params.storeId = storeId
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/calc-shipping-fee`, params)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const checkShippingFeeSelfDelivery = (params) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        params.storeId = storeId
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/calc-shipping-fee/self-delivery`, params)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const createOrder = (params) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/gs/checkout/instore/v2`, params)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getDashboardOrder = (storeId, options) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/bc-orders/gosell-store/${storeId}/paging`, {params: options})
            .then(result => {
                resolve(result);
            })
            .catch(e => {
                reject(e);
            });
    });
};

const getEarningPoint =(orderId,orderType)=>{
    return new Promise((resolve,reject)=>{
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/loyalty-earning-points/sources/${orderId}/type/${orderType}`)
            .then(result=>{
                resolve(result)
            })
            .catch(e=>{
                reject(e)
            })
    })
}

const getAllCalculatedLoyaltyPointTypes = (storeId, buyerId) => {
    return new Promise ((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/loyalty-earning-points/all-point-types/summary?storeId=${storeId}&buyerId=${buyerId}`)
            .then(result => resolve(result.data), reject);
    })
}

/**
 * calculateLoyaltyEarnPoint
 * @param {CalculateEarnPointRequestModel} requestBody
 * @returns {Promise<{earnPoint: number}>}
 */
const calculateLoyaltyEarnPoint = (requestBody) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ORDER_BC_SERVICE}/api/shop-carts/gosell/earn-point/calculate`, requestBody)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

/**
 * getAvailablePointOfUser
 * @param storeId
 * @param buyerId
 * @returns {Promise<AvailablePointUserModel>}
 */
const getAvailablePointOfUser = (storeId, buyerId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/loyalty-earning-points/all-point-types/earn?storeId=${storeId}&buyerId=${buyerId}`)
            .then(result => resolve(result.data), reject);
    });
}

/**
 * addPaymentHistiory
 * @returns {Promise<addPaymentHistiory>}
 */
const addPaymentHistiory = (requestBody) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ORDER_BC_SERVICE}/api/payment-histories`, requestBody)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

/**
 * getPaymentHistiory
 * @returns {Promise<getPaymentHistiory>}
 */
const getPaymentHistiory = (bcOrderId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/payment-histories/bc-order/${bcOrderId}`)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const getReturnedOrder = (roId) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/return-orders/store/${storeId}/return-order/${roId}`)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const getReturnItemsMaxQuantityByOrderId = (bcOrderId, params) => {
    return new Promise((resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/return-order-item/return-items-max-quantity/store/${storeId}/${bcOrderId}`, {
            params
        })
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const createReturnOrders = (requestBody) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ORDER_BC_SERVICE}/api/return-orders`, requestBody)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const editReturnOrders = (requestBody) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ORDER_BC_SERVICE}/api/return-orders`, requestBody)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const checkWholesaleOnProduct = (userId,itemId) => {
    if (!userId){
        userId = -1;
    }
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/check-product-wholesale/${storeId}/${userId}?lstProduct=${itemId}`)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const getOrderHistoriesByBcOrderId = (bcOrderId) => {
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/order-histories/order/${bcOrderId}`)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}


const createReturnPaymentHistories = (requestBody) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ORDER_BC_SERVICE}/api/return-payment-histories`, requestBody)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const getReturnPaymentHistories = (returnOrderId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/return-payment-histories/${storeId}/${returnOrderId}`)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const getReturnOrderProcessingHistory = (returnOrderId) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise ((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/return-order/return-order-history/${storeId}/${returnOrderId}`)
        .then((result) => {
            resolve(result.data);
        })
        .catch(e => {
            reject(e);
        });
    })
}

const getImeiReturnOrder = (returnOrderId) => {

    return new Promise ((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/return-order-item/return-item-imei/${returnOrderId}`)
            .then((result) => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    })
}
const editOrder = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.put(`${Constants.ORDER_BC_SERVICE}/api/edit-orders`, data)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const validateOrderItemDeleted = (requestBody) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ORDER_BC_SERVICE}/api/edit-orders/validate/deleted`, requestBody)
            .then(result => {
                resolve(result.data);
            })
            .catch(e => {
                reject(e);
            });
    });
}

const duplicateDiscountCode = (id) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/gs-discount-campaigns/${storeId}/${id}/copy`, {})
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}
const calcShippingPlanFree = (request) => {
    return new Promise ((resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/calc-shipping-plan-fee`, request)
        .then( res => {
            resolve(res.data)
        })
        .catch(reject)
    })
}

const refundOrderPaypal = (request) => {
    return new Promise ((resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/shop/bc-orders/refund`, request)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const updateTrackingCode = (request) => {
    return new Promise((resolve, reject) => {
        apiClient.put(`/${Constants.ORDER_BC_SERVICE}/api/tracking-code`, request)
            .then(
                result => resolve(result.data),
            )
            .catch( e => reject(e))
    });
}


export const BCOrderService = {
    getOrderDetail,
    getBcOrderDetail,
    confirmOrder,
    rejectOrder,
    deliveredOder,
    getDiscounts,
    endEarly,
    getGenCode,
    createCoupon,
    getCouponDetail,
    getCouponDetailFull,
    updateCoupon,
    removeDiscount,
    getCustomerSummary,
    getCustomerAvatar,
    getCustomerOrderList,
    getListReservation,
    getReservationDetail,
    editReservationDetail,
    getShippingProvider,
    getPaymentSetting,
    savePaymentSetting,
    getStatisticOfDashboard,
    checkPromotionCode,
    checkWholeSale,
    checkShippingFee,
    createOrder,
    getUserDeliveryInfo,
    checkShippingFeeSelfDelivery,
    getDashboardOrder,
    checkMembership,
    checkVAT,
    getListBcOrderDetail,
    deliveredOrderSelfDelivery,
    getEarningPoint,
    getAllCalculatedLoyaltyPointTypes,
    calculateLoyaltyEarnPoint,
    getAvailablePointOfUser,
    addPaymentHistiory,
    getPaymentHistiory,
    getReturnedOrder,
    getReturnItemsMaxQuantityByOrderId,
    createReturnOrder: createReturnOrders,
    checkWholesaleOnProduct,
    getOrderHistoriesByBcOrderId,
    getReturnOrderProcessingHistory,
    editReturnOrders,
    createReturnPaymentHistories,
    getReturnPaymentHistories,
    getImeiReturnOrder,
    editOrder,
    validateOrderItemDeleted,
    duplicateDiscountCode,
    calcShippingPlanFree,
    refundOrderPaypal,
    updateTrackingCode
}
