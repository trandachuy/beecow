/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 18/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
/**
 * @typedef {Object} UpdateStockDataRowModel
 * @property {Number} id
 * @property {Number} index
 * @property {String} name
 * @property {UpdateStockDataRowInventoryModel[]} lstInventory
 */


/**
 * @typedef {Object} UpdateStockDataRowInventoryModel
 * @property {Number} branchId
 * @property {Number} stock
 * @property {Number} newStock
 * @property {Number} orgStock
 * @property {String} updateType
 */

