/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import apiClient from '../config/api';
import Constants from "../config/Constant";
import ShopeeAuthorizationModel from "../components/shared/model/ShopeeAuthorizationModel";
import storageService from "./storage";
import i18next from "i18next";
import {CredentialUtils} from '../utils/credential';
import {TokenUtils} from '../utils/token';
import {ModalPortal} from "../utils/modal";
import {AlertModalType} from "../components/shared/AlertModal/AlertModal";
import {NavigationPath} from "../config/NavigationPath";
import {RouteUtils} from "../utils/route";
import i18n from "../config/i18n";
import {NAV_PATH} from "../components/layout/navigation/Navigation";
import {PaymentUtils} from "../utils/payment-utils";


/** @typedef {Object} ShopeeAttributeModel
 * @property {Number} attribute_id
 * @property {String} original_attribute_name
 * @property {String} display_attribute_name
 * @property {Boolean} is_mandatory
 * @property {(INT_TYPE|STRING_TYPE|ENUM_TYPE|FLOAT_TYPE|DATE_TYPE|TIMESTAMP_TYPE)} input_validation_type
 * @property {(NORMAL|QUANTITATIVE)} format_type
 * @property {(YEAR_MONTH_DATE|YEAR_MONTH)} date_format_type
 * @property {(DROP_DOWN|MULTIPLE_SELECT|TEXT_FILED|COMBO_BOX|MULTIPLE_SELECT_COMBO_BOX)} input_type
 * @property {String[]} attribute_unit
 * @property {{
 *     value_id: Number,
 *     original_value_name: String,
 *     display_value_name: String,
 *     value_unit: String,
 *     parent_attribute_list: {
 *        parent_attribute_id: Number,
 *        parent_value_id: Number
 *     }[],
 *     parent_brand_list: {
 *        parent_brand_id: Number
 *     }[]
 * }[]} attribute_value_list
 * @property {ShopeeRequestAttributeValueModel[]} defaultValue
 */

/** @typedef {{
    attribute_id: Number,
    attribute_value_list: ShopeeRequestAttributeValueModel[]
}} ShopeeRequestAttributeModel
 * */

/**
 * @typedef {{
 *     value_id: Number,
        original_value_name: String,
        value_unit: String
 * }} ShopeeRequestAttributeValueModel
 */

/**
 * @typedef {{
 *     brand_id: Number,
 *     display_brand_name: String,
 *     original_brand_name: String
 * }} ShopeeBrandModel
 */

/**
 * @typedef {{
 *     brand_list: ShopeeBrandModel[],
 *     error: String,
 *     has_next_page: Boolean,
 *     input_type: String,
 *     is_mandatory: Boolean,
 *     mandatory: Boolean,
 *     message: String,
 *     next_offset: Number,
 *     request_id: String,
 * }} ShopeeBrandListResponseModel
 */

class ShopeeService {
    getAuhorizationUrl(reAuth = false) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/shops/authorization`, {
                params: {
                    reAuth
                }
            })
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    findExistedShopeeId(shopeeId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/shops/findShopee/${shopeeId}`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    postAuthorization(shopeeId, authCode, reAuth = false) {
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            const body = new ShopeeAuthorizationModel(bcStoreId, shopeeId, 123, authCode, undefined, reAuth);
            console.log('call API author');
            apiClient.post(`${Constants.SHOPEE_SERVICE}/api/shops/authorization`, body)
                .then(response => resolve(response.data))
                .catch(e => {
                    //reject(e)
                    console.log(e);
                    const msg = e.response.data?.message;
                         ModalPortal.alert({
                            type: AlertModalType.ALERT_TYPE_OK,
                            modalTitle: i18next.t('common.txt.alert.modal.title'),
                            messages:  i18n.t(msg),
                            modalBtn: i18n.t("common.btn.ok"),
                            closeCallback: function () {
                                RouteUtils.redirectWithReload(NavigationPath.shopeeAccountManagement);
                            }
                        });
                    reject(e);

                })
        });
    }

    putAuthorization(shopeeId, branchId) {
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            const body = new ShopeeAuthorizationModel(bcStoreId, shopeeId, branchId);
            apiClient.put(`${Constants.SHOPEE_SERVICE}/api/shops/authorization`, body)
                .then(response => resolve(response.data))
                .catch(e => {
                    //reject(e)
                    console.log(e);
                    const msg = e.response.data.message;
                        ModalPortal.alert({
                            type: AlertModalType.ALERT_TYPE_OK,
                            modalTitle: i18next.t('common.txt.alert.modal.title'),
                            messages:  i18n.t(msg),
                            modalBtn: i18n.t("common.btn.ok"),
                            closeCallback: function () {
                                RouteUtils.redirectWithReload(NavigationPath.shopeeAccountManagement);
                            }
                        });

                    reject(e);
                })
        });
    }

    disconnectShopeeAccount(id, shopeeId, branchId) {
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            const body = new ShopeeAuthorizationModel(bcStoreId, shopeeId, branchId, null, id);
            apiClient.put(`${Constants.SHOPEE_SERVICE}/api/shops/disconnect`, body)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    reconnectShopeeAccount(id, shopeeId, branchId) {
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            const body = new ShopeeAuthorizationModel(bcStoreId, shopeeId, branchId, null, id);
            apiClient.put(`${Constants.SHOPEE_SERVICE}/api/shops/reconnect`, body)
                .then(
                    response => resolve(response.data),
                    error => this.errorHandle(error, reject)
                )
        });
    }

    getShopeeAccountById(id) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/shops/${id}`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    getShopeeAccount(bcStoreId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/bc-stores/${bcStoreId}/shops`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    getAllShopeeAccount() {
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise((resolve, reject) => {
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/bc-stores/${bcStoreId}/all/shops`)
                .then(response => resolve(response.data))
                .catch(e => reject(e))
        });
    }

    getOrderDetail(orderId) {
        const storeId = storageService.get(Constants.STORAGE_KEY_STORE_ID);
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/orders/${storeId}/details/${orderId}`)
                .then(
                    result => {
                        resolve(result.data)
                    },
                    error => this.errorHandle(error, reject)
                )
        })
    }

    cancelOrder(bcStoreId, orderId, reason, outOfStockItem) {
        return new Promise((resolve, reject) => {
            let request = `${Constants.SHOPEE_SERVICE}/api/orders/${bcStoreId}/cancel/${orderId}/${reason}`;
            if (outOfStockItem) {
                request += `?itemId=${outOfStockItem.itemId}&variationId=${outOfStockItem.variationId}`;
            }
            apiClient.post(request)
                .then(response => resolve(response.data))
                .catch(e => this.errorHandle(e, reject))
        });
    }

    getCategories(){
        let language = storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/categories?lang=${language ? language : 'vi'}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch(e => reject(e))
        })
    }
    getProducts(shopId, params){
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/items/shop/${shopId}`, {params: params})
                .then( result => {
                    resolve(result);
                })
                .catch(e => reject(e))
        })
    }

    rejectBuyerCancel(bcStoreId, orderId) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/orders/${bcStoreId}/reject_cancel/${orderId}`)
                .then( result => {
                    resolve(result);
                })
                .catch(e => this.errorHandle(e, reject))
        })
    }

    acceptBuyerCancel(bcStoreId, orderId) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/orders/${bcStoreId}/accept_cancel/${orderId}`)
                .then( result => {
                    resolve(result);
                })
                .catch(e => this.errorHandle(e, reject))
        })
    }

    confirmOrder(bcStoreId, orderId) {
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.SHOPEE_SERVICE}/api/orders/${bcStoreId}/confirm/${orderId}`)
                .then(response => resolve(response.data))
                .catch(e => this.errorHandle(e, reject))
        });
    }

    /**
     * Get logistics list
     * @param shopId id's "shop" table, not shopee_shop_id
     * @return {Promise<{logistics: ShopeeLogisticModel[]}>}
     */
    getLogistics(shopId) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/logistic/list/${storeId}`, {
                params: {
                    shopId
                }
            })
                .then( res => {
                    if (res.data.logistics) {
                        resolve(res.data)
                    } else {
                        resolve({
                            logistics: []
                        })
                    }
                })
                .catch(() => resolve({
                    logistics: []
                }))
        })
    }

    getProductDownloadInformation(bcStoreId, shopeeShopId){
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/item-download-informations/product/get_info/${bcStoreId}/${shopeeShopId}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( reject )
        })
    }

    checkStoreIsDownloadingProduct(){
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/item-download-informations/product/${bcStoreId}/is-downloading`)
                .then( result => {
                    resolve(result.data);
                })
                .catch( reject )
        })
    }

    downloadAProduct(shopeeShopId, shopeeItemId){
        const bcStoreId = CredentialUtils.getStoreId();
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/item-download-informations/product/${bcStoreId}/${shopeeShopId}/${shopeeItemId}`)
                .then(
                    () => {
                        resolve()
                    },
                    error => this.errorHandle(error, reject)
                )
        })
    }

    downloadProduct(bcStoreId, shopeeShopId){
        return new Promise( (resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/item-download-informations/product/${bcStoreId}/${shopeeShopId}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( error => this.errorHandle(error, reject) )
        })
    }

    /**
     * Get shopee attributes by categoryId
     * @param categoryId
     * @param shopId
     * @return {Promise<ShopeeAttributeModel[]>}
     */
    getAttributes(categoryId, shopId) {
        return new Promise( (resolve, reject) => {
            apiClient.post(`${Constants.SHOPEE_SERVICE}/api/items/shop/attributes`, {
                category_id: categoryId,
                language: i18next.language,
                shop_id: shopId
            })
                .then( res => resolve(res.data))
                .catch(reject)
        })
    }

    syncNewProduct(body, shopId){
        const storeId = storageService.get('storeId')
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/items/shop/${shopId}/sync-new-item`, body)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( e => this.errorHandle(e, reject) )
        })
    }

    getItemImage(itemId){
        const storeId = storageService.get('storeId')
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/orders/${storeId}/details_image/${itemId}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( reject )
        })
    }

    /**
     *
     * @param itemId
     * @param shopId is shopeeShopId in "shop" table, is shopId in "item" table
     * @return {Promise<unknown>}
     */
    getSyncProductDetail(itemId, shopId){
        const storeId = storageService.get('storeId')
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/items/get_detail/${storeId}/${shopId}/${itemId}/`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( reject )
        })
    }

    syncEditProduct(body, shopeeShopId) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/items/shop/${shopeeShopId}/sync-update-item`, body)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( e => this.errorHandle(e, reject) )
        })
    }

    syncEditProductShopeeOnly(body, shopeeShopId) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/items/shop/${shopeeShopId}/sync-update-shopee-item`, body)
                .then(result => {
                    if (result.data) {
                        return resolve(result.data);
                    }
                    return reject(new Error("no data returned!"));
                }, reject);
        })
    }

    getOrderFromShopee(shopeeShopId){
        const storeId = storageService.get('storeId')
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/orders/refresh/${storeId}/${shopeeShopId}`)
                .then(
                    result => {
                        if (result.data) {
                            resolve(result.data)
                        }
                    },
                    error => this.errorHandle(error, reject)
                )
        })
    }

    getOrderFetchStatus(shopeeShopId){
        const storeId = storageService.get('storeId')
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/orders/get_status/${storeId}/${shopeeShopId}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( reject )
        })
    }

    downloadShippingDocument(body){
        const storeId = storageService.get('storeId');
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/logistic/download-shipping-document/${storeId}`, body,
                {
                    headers:
                        {
                            'Content-Type': 'application/json;charset=UTF-8',
                            'Content-Disposition': "attachment; filename=" + body.fileName + "." + body.fileType,
                            'Response-Type': 'application/' + body.fileType,
                        },
                    responseType: 'arraybuffer'
                })
                .then( result => {
                    resolve(result)
                })
                .catch( reject )
        })
    }

    getAirwayBill(orderSn){
        const storeId = storageService.get('storeId');
        return new Promise( (resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/logistic/airway-bill/${storeId}/${orderSn}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( reject )
        })
    }

    getCustomerSummary(customerId) {
        return new Promise( (resolve, reject) => {
            const storeId = storageService.get('storeId');
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/customer_order/${storeId}/summary?username=${customerId}`)
                .then( result => {
                    if (result.data) {
                        resolve(result.data)
                    }
                })
                .catch( reject )
        })
    }

    unlinkShopeeItems(shopeeId, shopeeItemIds) {
        const req = `?ids=${shopeeItemIds}`;
        return new Promise( (resolve, reject) => {
            const storeId = storageService.get('storeId');
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/items/${storeId}/unlink/${shopeeId}${req}`)
                .then(
                    result => {
                        if (result.data) {
                            resolve(result.data)
                        }
                    },
                    error => this.errorHandle(error, reject)
                )
        })
    }

    getCustomerOrderList(userId, page, size, orderId = undefined, sort = undefined) {
        return new Promise( (resolve, reject) => {
            const storeId = storageService.get('storeId');
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/customer_order/${storeId}/search`, {
                params: {
                    username: userId,
                    page: page,
                    size: size,
                    orderId: orderId,
                    sort: sort
                }
            })
                .then( result => {
                    resolve({
                        data: result.data,
                        total: parseInt(result.headers['x-total-count'])
                    })
                })
                .catch( reject )
        })
    }

    getDashboardOrder(storeId, options){
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/orders/${storeId}/paging`, {params: options})
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }


    getActiveOrderPackageByStoreId() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/order-packages/active-order/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)

        })
    }

    getManageAccountsByBcStoreId() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/shops/${storeId}/management`)
                .then(result => {
                    resolve(result.data)
                }, reject)

        })
    }

    getItemOfBcStore(page, size, options = {
        keyword: undefined,
        gosellStatus: undefined,
        shopeeShopIds: undefined,
        getBcItemName: undefined,
        sort: undefined,
    }) {
        const storeId = CredentialUtils.getStoreId()

        return new Promise((resolve, reject) => {
            if (!storeId) {
                reject('storeIdNotFound')
            }
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/items/bc-store/${storeId}`, {
                params: {
                    page: page,
                    size: size,
                    getBcItemName: options.getBcItemName || false,
                    sort: options.sort || 'last_sync_date,DESC',
                    ...options
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

    getConnectedShops() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/bc-stores/${storeId}/connected`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    if(TokenUtils.isStaff()){
                        resolve([]);
                    } else {
                        reject(e);
                    }
                })
        })
    }

    getAllConnectShops() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/bc-stores/${storeId}/all/shops`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    if(TokenUtils.isStaff()){
                        resolve([]);
                    } else {
                        reject(e);
                    }
                })
        })
    }

    getNoExpiredShops() {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/bc-stores/${storeId}/no-expired`)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    /**
     * Get all shopee items have been synced to gosell item
     * @param bcItemId
     * @return Promise<ShopeeItemDTOModel[]>
     */
    getLinkedItems(bcItemId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/items/linked-to-bc-item/${bcItemId}`)
                .then(result => {
                    resolve(result.data)
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    addOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/order-packages/add/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    upgradeOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/order-packages/upgrade/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    renewOrderPackage(data) {
        return new Promise((resolve, reject) => {
            const paymentProvider = PaymentUtils.getPaymentProvider(data.paymentMethod);
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/order-packages/renew/${paymentProvider}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    getPackagePrice(currencyCode) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/package-prices/prices?currencyCode=${currencyCode}`,)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getLastOrderByStoreId() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/order-packages/order/latest/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getRemainingAmountByStoreId() {
        const storeId = CredentialUtils.getStoreId()

        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/order-packages/remaining-amount/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    deleteProductShopee(shopeeId, shopeeItemIds, isOnShopee, isOnGS) {
        const params = `?onShopee=${isOnShopee}&onGS=${isOnGS}`;
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.SHOPEE_SERVICE}/api/items/delete/shopee/${shopeeId}${params}`,shopeeItemIds)
                .then(
                    result => {
                        resolve(result.data)
                    },
                    error => this.errorHandle(error, reject)
                )
        })
    }

    deleteShopeeAccount(shopId, isOnGS) {
        const storeId = CredentialUtils.getStoreId()
        const params = `?onGoSell=${isOnGS}`;
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/shop/${storeId}/shopee/${shopId}${params}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    /**
     *
     * @param {MapSPItemToGSItem} LinkShopeeItemVM
     * @returns {Promise<unknown>}
     */
    linkShopeeItemWithBcItem(linkShopeeItemVM) {
        return new Promise( (resolve, reject) => {
            apiClient.put(`/${Constants.SHOPEE_SERVICE}/api/items/link`, linkShopeeItemVM)
                .then(
                    result => {
                        const headerErrorKey = result.headers["x-error-key"];
                        if (headerErrorKey) {
                            return reject(headerErrorKey);
                        }
                        resolve(result.data)
                    },
                    error => this.errorHandle(error, reject)
                )
        })
    }

    getProductSettingsSyncByStoreId() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/product-settings-syncs/store/${storeId}`)
                .then(result => resolve(result), reject)
        })
    }

    createDefaultProductSettingsSync() {
        const storeId = CredentialUtils.getStoreId();
        const body = { storeId, name: false, price: false, stock: false, description: false };
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/product-settings-syncs`, body)
                .then(result => resolve(result.data))
                .catch(e => this.errorHandle(e, reject));
        });
    }

    editProductSettingsSyncs(data) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.SHOPEE_SERVICE}/api/product-settings-syncs`, data)
                .then(result => {
                    resolve(result.data);
                })
                .catch(e => this.errorHandle(e, reject));

        })
    }


    addSynToGosell(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/items/syn_to_gosell/${storeId}`, data)
                .then(result => {
                    resolve(result.data);
                }, (e) => this.errorHandle(e, reject));
        })
    }

    loadShopeeSetting() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/shopee-settings/${storeId}`)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    saveShopeeSetting(data) {
        const storeId = CredentialUtils.getStoreId();
        const requestData = {...data, bcStoreId: storeId}
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/shopee-settings`, requestData)
                .then(result => {
                    resolve(result.data);
                }, (e) => reject(e));
        })
    }

    compareBcItemVariationsWithShopeeItemVariations(requestBody) {
        return new Promise((resolve, reject) => {
            apiClient.put(`/${Constants.SHOPEE_SERVICE}/api/items/variations/compare`, requestBody)
                .then(result => resolve(result.data))
                .catch(e => reject(e));
        });
    }

    markItemLinkError(requestBody) {
        return new Promise((resolve, reject) => {
            apiClient.post(`/${Constants.SHOPEE_SERVICE}/api/items/mark-link-error`, requestBody)
                .then(result => resolve(result.data))
                .catch(e => reject(e));
        });
    }

    getProductDownloadingOrSynchronizing() {
        const storeId = CredentialUtils.getStoreId()
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/item-synch-informations/get-status/${storeId}`)
                .then(result => {
                    resolve(result.data)
                }, reject)
        })
    }

    getItemById(shopeeItemId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/items/${shopeeItemId}`)
                .then(result => resolve(result.data), reject);
        });
    }

    getCategoryByShopeeCategoryId(shopeeCategoryId) {
        return new Promise((resolve, reject) => {
            apiClient.get(`/${Constants.SHOPEE_SERVICE}/api/categories/shopee-category-id/${shopeeCategoryId}`)
                .then(result => resolve(result.data), reject);
        });
    }

    confirmOrderMulti(orderList) {
        const storeId = CredentialUtils.getStoreId()
        return new Promise((resolve, reject) => {
            apiClient.post(`${Constants.SHOPEE_SERVICE}/api/orders/${storeId}/confirm-multi`, {orderIds : orderList})
                .then(response => resolve(response.data))
                .catch(e => this.errorHandle(e, reject))
        });
    }

    /**
     * get Shopee Brand list
     * @param shopeeShopId
     * @param categoryId
     * @return {Promise<ShopeeBrandListResponseModel>}
     */
    getBrandList(categoryId, shopeeShopId) {
        return new Promise( (resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${Constants.SHOPEE_SERVICE}/api/brand/get-all/${storeId}/${shopeeShopId}`, {
                params: {
                    categoryId
                }
            })
                .then(result => {
                    resolve(result.data)
                })
                .catch(reject)
        })
    }

    errorHandle(errResponse, reject) {
        const response = errResponse.response;
        const status = response.status;
        if (Constants.HTTP_STATUS_BAD_REQUEST === status && response?.data?.message === 'err.param.auth.refresh') {
            if (response?.data?.action === 'reconnect') {
                ModalPortal.alert(
                    {
                        type: AlertModalType.ALERT_TYPE_OK,
                        modalTitle: i18next.t('common.txt.alert.modal.title'),
                        messages: i18next.t('shopee.alert.reconnect'),
                        closeCallback: () => {
                            RouteUtils.redirectWithReload(NavigationPath.shopeeAccountManagement)
                        },
                        modalBtn: i18next.t('common.btn.alert.modal.ok')
                    }
                )
            }
            else if (response?.data?.action === 'reauthenticate') {
                shopeeService.getAuhorizationUrl(true)
                    .then(response => {
                        window.location.replace(response.url);
                    })
            }
        }
        else {
            reject(errResponse)
        }
    }
}

const shopeeService = new ShopeeService();
export default shopeeService;
