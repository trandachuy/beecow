/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
/** @typedef {Object} UpdateInventoryStockRequestModel
 * @property {Number} itemId
 * @property {UpdateInventoryStockRequestLstInventoryModel[]} lstInventory
 * @property {Number} modelId
 */


/** @typedef {Object} UpdateInventoryStockRequestLstInventoryModel
 * @property {Number} branchId
 * @property {String} inventoryActionType
 * @property {Number} inventoryCurrent
 * @property {Number} inventoryStock
 * @property {String} inventoryType
 */
