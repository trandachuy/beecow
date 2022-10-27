/** @typedef {Object} InventoryMultipleItemResponse
 * @property {InventoryData[]} lstData
 */


/** @typedef {Object} InventoryData
 * @property {InventoryDetail[]} inventories
 * @property {Number} itemId
 */


/** @typedef {Object} InventoryDetail
 * @property {String} action
 * @property {Number} branchId
 * @property {Number} itemId
 * @property {Number} modelId
 * @property {Number} remainingItem
 * @property {Number} stock
 */
