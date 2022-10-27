/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/04/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

/** @typedef {Object} TransferDTO
 * @property {number} id
 * @property {string} originBranchId
 * @property {string} destinationBranchId
 * @property {string} status
 * @property {string} note
 * @property {number} storeId
 * @property {number} createdByStaffId
 * @property {ItemTransferDTO[]} itemTransfers
 * @property {string} handlingDataStatus
 **/

/** @typedef {Object} ItemTransferDTO
 * @property {number} id
 * @property {number} itemId
 * @property {number} modelId
 * @property {number} quantity
 **/

/** @typedef {Object} TransferQueryParams
 * @property {string} searchBy
 * @property {string} searchKeywords
 * @property {number} originBranchId
 * @property {number} destinationBranchId
 * @property {string} status
 * @property {string} fromDate
 * @property {string} toDate
 * @property {string} createdBy
 * @property {number} createdByStaffId
 **/
