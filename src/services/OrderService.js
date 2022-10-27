/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import Constants from "../config/Constant";
import {BCOrderService} from "./BCOrderService";
import storageService from "./storage";
import storeService from "./StoreService";
import {lazadaService} from "./LazadaService";
import shopeeService from "./ShopeeService";
import i18next from "i18next";
import {CredentialUtils} from "../utils/credential";
import apiClient from "../config/api";

const getOrderDetail = (site, id) => {
    return new Promise( (resolve, reject) => {
        switch (site) {
            case Constants.SITE_CODE_GOSELL:
            case Constants.SITE_CODE_BEECOW:
                BCOrderService.getOrderDetail(id)
                    .then(resolve, reject);
                break;
            case Constants.SITE_CODE_LAZADA:
                lazadaService.getOrderDetailWithUpdate(id).then( res => {
                    lazadaService.getOrderDetail(id).then(resolve, reject);
                }).catch(reject);
                break;
            case Constants.SITE_CODE_SHOPEE:
                shopeeService.getOrderDetail(id)
                    .then(resolve, reject);
                break;
            default:
                reject('wrongSite')
        }
    })

};

const setOrderStatus = (site, id, status, extendedInfos) => {
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get('storeId');
        if (!storeId) {
            reject('storeIdNotFound')
        }
        else {
            switch (status) {
                case Constants.ORDER_STATUS_TO_SHIP:
                    switch (site) {
                        case Constants.SITE_CODE_GOSELL:
                        case Constants.SITE_CODE_BEECOW:
                            storeService.getStoreInfo(storeId)
                                .then(storeInfo => {
                                    let requestBody = {
                                        "orderId": id,
                                        "note": "",
                                        // "contactName": storeInfo.contactName,
                                        // "phoneNumber": storeInfo.contactNumber,
                                        // "email": storeInfo.email,
                                        "length": extendedInfos.length,
                                        "width": extendedInfos.width,
                                        "height": extendedInfos.height,
                                        itemIMEISerials: extendedInfos.itemIMEISerials,
                                        hamlet: extendedInfos.hamlet,
                                    };

                                    BCOrderService.confirmOrder(requestBody)
                                        .then(resolve, reject)
                                });
                            break;
                        case Constants.SITE_CODE_LAZADA:
                            lazadaService.confirmOrder(storeId, id).then(resolve, reject);
                            break;
                        case Constants.SITE_CODE_SHOPEE:
                            shopeeService.confirmOrder(storeId, id).then(resolve, reject);
                            break;
                        default:
                            reject('wrongSite')
                    }
                    break;
                case Constants.ORDER_STATUS_CANCELLED:
                    switch (site) {
                        case Constants.SITE_CODE_GOSELL:
                        case Constants.SITE_CODE_BEECOW:
                            BCOrderService.rejectOrder({
                                orderId: id,
                                reason: extendedInfos.reason? extendedInfos.reason:i18next.t("page.order.detail.cancelOrder.reason")
                            })
                                .then(resolve, reject);
                            break;
                        case Constants.SITE_CODE_LAZADA:
                            lazadaService.cancelOrder(storeId, id, extendedInfos.reasonId, extendedInfos.reasonDetail).then(resolve, reject);
                            break;
                        case Constants.SITE_CODE_SHOPEE:
                            shopeeService.cancelOrder(storeId, id, extendedInfos.reason, extendedInfos.outOfStockItem).then(resolve, reject);
                            break;
                        default:
                            reject('wrongSite')
                    }
                    break
            }
        }
    })
};

const rejectBuyerCancel = (orderId) => {
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get('storeId');
        if (!storeId) {
            reject('storeIdNotFound')
        }
        shopeeService.rejectBuyerCancel(storeId, orderId)
            .then(resolve, reject)
    })
}

const acceptBuyerCancel = (orderId) => {
    return new Promise( (resolve, reject) => {
        const storeId = storageService.get('storeId');
        if (!storeId) {
            reject('storeIdNotFound')
        }
        shopeeService.acceptBuyerCancel(storeId, orderId)
            .then(resolve, reject)
    })
}

const setDeliveredForSelfDelivery = (orderId) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.deliveredOder(orderId)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
}

const getListReservation = (params) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.getListReservation(params)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })

};

const getReservationDetail = (id) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.getReservationDetail(id)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })

};

const editReservationDetail = (id, params) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.editReservationDetail(id, params)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
};

const cancelReservation = (id) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.rejectOrder({
            orderId: id,
            reason: i18next.t("page.order.detail.cancelOrder.reason")
        }).then( res => {
            resolve(res)
        })
        .catch(reject)
    })
};

const confirmReservation = (id) => {
    const storeId = storageService.get('storeId');
    return new Promise( (resolve, reject) => {
        storeService.getStoreInfo(storeId).then(storeInfo => {
            let requestBody = {
                "orderId": id,
                "note": "",
                "contactName": storeInfo.contactName,
                "phoneNumber": storeInfo.contactNumber,
                "email": storeInfo.email,
                "length": 0,
                "width": 0,
                "height": 0
            };
            BCOrderService.confirmOrder(requestBody).then(resolve, reject)
        });
    })
};

const getStatisticOfDashboard = () => {
    return new Promise( (resolve, reject) => {
        BCOrderService.getStatisticOfDashboard()
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })

};

const checkShippingFee = (params) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.checkShippingFee(params)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
};

const checkShippingFeeSelfDelivery = (params) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.checkShippingFeeSelfDelivery(params)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
};

const createOrder = (params) => {
    return new Promise( (resolve, reject) => {
        BCOrderService.createOrder(params)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
};

const getEarningPoint=(orderId,orderType)=>{
    return new Promise((resolve,reject)=>{
        BCOrderService.getEarningPoint(orderId,orderType)
            .then(res=>{
                resolve(res.data)
            })
            .catch(reject)
    })
}

/**
 * Get order progress list of store
 * @param
 * @returns {Promise<OrderProgressHandling[]>}
 */
const getListProgressOrder = () => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/order-progress-handling/store/${storeId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const exportOrderByProduct = (storeId, items, options) => {
    return new Promise((resolve, reject) => {
        apiClient.post(`/${Constants.ORDER_BC_SERVICE}/api/bc-orders/export/order-by-product/${storeId}`, items, {
            headers:
            {
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Disposition': "attachment; filename=order-by-product.xlsx",
                'Response-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            responseType: 'arraybuffer',
            params: options
        })
        .then(result => {
            resolve(result);
        })
        .catch(e => {
            reject(e);
        });
    });
}


const checkoutGoSocial = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/gs/checkout/go-social/v2`, data)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}
const checkWholesaleCampaignByProduct = (itemId) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/gs-discount/store/${storeId}/isValid?productId=${itemId}`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getListDebtSegment = () => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/debt-segments/${storeId}`)
            .then(result => {
                resolve(result.data)
            }, reject)
    })
}

const updateListDebtSegment = (segments) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise( (resolve, reject) => {
        apiClient.put(`${Constants.ORDER_BC_SERVICE}/api/debt-segments/exchange/${storeId}?segments=${segments}`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const confirmPaymentForUser = (userId, paymentHistory) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/payment-histories/store/${storeId}/user/${userId}`, paymentHistory)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getCustomerOrderSummary = (username, saleChannel, hasDebtOrder) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise((resolve, reject) => {
        apiClient.get(`/${Constants.ORDER_BC_SERVICE}/api/customer-orders/${storeId}/summary`, {
            params: {
                username,
                saleChannel,
                hasDebtOrder
            }
        })
            .then(result => {
                resolve({
                    ...result.data,
                    userId: username
                })
            }, reject)
    })
}

const getReturnOrderDetailByIds = (orderId, siteCode) => {
    const allowSiteCode = [Constants.SITE_CODE_GOMUA, Constants.SITE_CODE_BEECOW, Constants.SITE_CODE_GOSELL]

    if (siteCode && !allowSiteCode.includes(siteCode)) {
        return
    }

    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/return-orders/find-by-bc-order/${orderId}`)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}

const getListReturnOrder = (params) => {
    const storeId = CredentialUtils.getStoreId()
    return new Promise( (resolve, reject) => {
        apiClient.get(`${Constants.ORDER_BC_SERVICE}/api/return-order/${storeId}`, {params: params})
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
};


const getAddressLevel4 = (data) => {
    return new Promise( (resolve, reject) => {
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/bc-orders/ghtk-get-address-level-4`, data)
            .then( res => {
                resolve(res)
            })
            .catch(reject)
    })
};

const getPointByUserList = (buyerIds) => {
    return new Promise( (resolve, reject) => {
        const storeId = CredentialUtils.getStoreId()
        apiClient.post(`${Constants.ORDER_BC_SERVICE}/api/loyalty-point/get-point-by-user-list/${storeId}`, buyerIds)
            .then( res => {
                resolve(res.data)
            })
            .catch(reject)
    })
}



/**
 * Use BCOrderService.js instead
 * @deprecated
 */
export const OrderService = {
    getOrderDetail,
    setOrderStatus,
    rejectBuyerCancel,
    acceptBuyerCancel,
    setDeliveredForSelfDelivery,
    getListReservation,
    getReservationDetail,
    editReservationDetail,
    cancelReservation,
    confirmReservation,
    getStatisticOfDashboard,
    checkShippingFee,
    createOrder,
    checkShippingFeeSelfDelivery,
    getEarningPoint,
    getListProgressOrder,
    exportOrderByProduct,
    checkoutGoSocial,
    getListDebtSegment,
    updateListDebtSegment,
    confirmPaymentForUser,
    checkWholesaleCampaignByProduct,
    getReturnOrderDetailByIds,
    getCustomerOrderSummary,
    getListReturnOrder,
    getAddressLevel4,
    getPointByUserList
};
