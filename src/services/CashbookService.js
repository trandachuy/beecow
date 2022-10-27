import apiClient from '../config/api'
import Constants from '../config/Constant'
import {CredentialUtils} from '../utils/credential'

class CashbookService {
    getAllCashBooks(filter, page) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${ Constants.CASHBOOK_SERVICE }/api/cash-books/store/${ storeId }`, {
                params: {
                    ...filter,
                    ...page
                }
            })
                .then(resolve)
                .catch(reject)
        })
    }

    getCashBookSummary(filter) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.get(`${ Constants.CASHBOOK_SERVICE }/api/cash-books/summary/${ storeId }`, {
                params: filter
            })
                .then(result => resolve(result.data))
                .catch(reject)
        })
    }

    getAllOtherGroup(filter, page) {
        return new Promise((resolve, reject) => {
            apiClient.get(`${ Constants.CASHBOOK_SERVICE }/api/other-groups`, {
                params: {
                    'storeId.equals': CredentialUtils.getStoreId(),
                    ...filter,
                    ...page
                }
            })
                .then(resolve)
                .catch(reject)
        })
    }

    createCashBookForStore(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.post(`/${ Constants.CASHBOOK_SERVICE }/api/cash-books/store/${ storeId }`, data)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    updateCashBookForStore(data) {
        return new Promise((resolve, reject) => {
            const storeId = CredentialUtils.getStoreId()
            apiClient.put(`/${ Constants.CASHBOOK_SERVICE }/api/cash-books/store/${ storeId }`, data)
                .then(result => {
                    resolve(result.data)
                }, (e) => reject(e))
        })
    }

    /** @typedef {object} CashBookDTO
     * @property {number} amount
     * @property {number} amountChange
     * @property {number} branchId
     * @property {string} branchName
     * @property {string} createdBy
     * @property {string} createdByName
     * @property {string} createdDate
     * @property {number} customerId
     * @property {string} customerName
     * @property {number} debt
     * @property {boolean} forAccounting
     * @property {string} groupType
     * @property {number} id
     * @property {boolean} isAuto
     * @property {boolean} isOrderDebt
     * @property {string} lastModifiedBy
     * @property {string} lastModifiedDate
     * @property {string} note
     * @property {number} orderId
     * @property {number} otherGroupId
     * @property {string} otherGroupName
     * @property {number} paymentHistoryId
     * @property {string} paymentMethod
     * @property {string} sourceType
     * @property {number} staffId
     * @property {string} staffName
     * @property {number} storeId
     * @property {number} supplierId
     * @property {string} supplierName
     * @property {string} transactionCode
     * @property {string} type
     */
    /**
     * getCustomerCashbookList
     * @param customerId
     * @param page
     * @param size
     * @param searchTransactionCode
     * @return {Promise<{
     *     data: CashBookDTO[],
     *     totalItem: Number
     * }>}
     */
    getCustomerCashbookList(customerId, page, size, searchTransactionCode) {
        return new Promise( (resolve, reject) => {
            apiClient.get(`/${ Constants.CASHBOOK_SERVICE }/api/cash-books/debt/customer/${customerId}`, {
                params: {
                    storeId: CredentialUtils.getStoreId(),
                    page, size, searchTransactionCode,
                    sort: 'created_date,desc'
                }
            })
                .then(result => {
                    const totalItem = parseInt(result.headers['x-total-count'])
                    resolve({
                        data: result.data,
                        totalItem
                    })
                }, (e) => reject(e))
        })
    }
}

const cashbookService = new CashbookService()
export default cashbookService
