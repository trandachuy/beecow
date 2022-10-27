/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on :
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
/** @typedef {object} EarnPointItemRequestModel
 * @property {number} branchId
 * @property {string} date
 * @property {number} itemId
 * @property {number} modelId
 * @property {number} price
 * @property {number} quantity
 */

/** @typedef {object} CalculateEarnPointRequestModel
 * @property {string} coupon
 * @property {EarnPointItemRequestModel[]} earnPointItems
 * @property {'DETAIL'|'CART_PRODUCT'|'CART_SERVICE'|'IN_STORE'} earnPointType
 * @property {string} langKey
 * @property {'WEB'|'IOS'|'ANDROID'|'IN_STORE'} platform
 * @property {number} storeId
 * @property {number} userId
 */