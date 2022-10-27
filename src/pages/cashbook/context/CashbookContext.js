import React from 'react'
import {ContextUtils} from '../../../utils/context'
import {
    ACCOUNTING,
    BRANCH,
    CREATED_BY,
    EXPENSE_TYPE,
    FILTER_BRANCH_OPTIONS,
    FILTER_CREATED_BY_OPTIONS,
    PAGE_MAX_SIZE,
    PAYMENT_METHOD,
    REVENUE_TYPE,
    SENDER_RECIPIENT_GROUP,
    SENDER_RECIPIENT_NAME,
    TRANSACTION
} from './CashbookConstants'
import moment from 'moment'
import {CurrencyUtils} from "../../../utils/number-format";

let dayMinusOne = new Date();
dayMinusOne.setDate(dayMinusOne.getDate()-1);

const initFilterPaging = {
    page: 0,
    size: PAGE_MAX_SIZE,
    total: 0,
    keyword: undefined,
    isLoading: false,
    isNoResult: false,
    isAdd: false,
    isScroll: false,
    senderRecipientGroup: undefined
}

const initState = {
    currency: CurrencyUtils.getLocalStorageSymbol(),
    filter: {
        branch: BRANCH.ALL,
        accounting: ACCOUNTING.ALL,
        transaction: TRANSACTION.ALL,
        expenseType: EXPENSE_TYPE.ALL,
        revenueType: REVENUE_TYPE.ALL,
        createdBy: CREATED_BY.ALL,
        senderRecipientGroup: SENDER_RECIPIENT_GROUP.ALL,
        senderRecipientName: SENDER_RECIPIENT_NAME.ALL,
        paymentMethod: PAYMENT_METHOD.ALL
    },
    revenueSummary: {
        openingBalance: 0,
        totalRevenue: 0,
        totalExpenditure: 0,
        endingBalance: 0
    },
    paging: {
        page: 0,
        size: PAGE_MAX_SIZE,
        total: 0,
        keyword: undefined
    },
    customStartDate: moment(dayMinusOne).format('YYYY-MM-DD') + 'T17:00:00.000Z',
    customEndDate: moment().format('YYYY-MM-DD') + 'T16:59:59.000Z',
    cashbookList: [],
    filterBranches: FILTER_BRANCH_OPTIONS,
    filterStaffs: FILTER_CREATED_BY_OPTIONS,
    receiptPaymentModal: {
        filterCustomers: [],
        filterSuppliers: [],
        filterStaffs: [],
        filterOtherGroups: [],
        filterPaging: initFilterPaging
    },
    megaFilter: {
        filterCustomers: [],
        filterSuppliers: [],
        filterStaffs: [],
        filterOtherGroups: [],
        filterPaging: initFilterPaging
    }
}

const context = React.createContext(initState)

const actions = {
    setCustomTimeFrame: (customStartDate, customEndDate) => ContextUtils.createAction('SET_CUSTOM_TIME_FRAME', {
        customStartDate, customEndDate
    }),
    setRevenueSummary: (data) => ContextUtils.createAction('SET_REVENUE_SUMMARY', data),
    setPaging: paging => ContextUtils.createAction('SET_PAGING', paging),
    setFilter: filter => ContextUtils.createAction('SET_FILTER', filter),
    setCashbookList: data => ContextUtils.createAction('SET_CASHBOOK_LIST', data),
    setFilterBranches: data => ContextUtils.createAction('SET_FILTER_BRANCHES', data),
    setFilterStaffs: data => ContextUtils.createAction('SET_FILTER_STAFFS', data),
    setModalFilterCustomers: data => ContextUtils.createAction('SET_MODAL_FILTER_CUSTOMER', data),
    setModalFilterSuppliers: data => ContextUtils.createAction('SET_MODAL_FILTER_SUPPLIER', data),
    setModalFilterStaffs: data => ContextUtils.createAction('SET_MODAL_FILTER_STAFF', data),
    setModalFilterOtherGroups: data => ContextUtils.createAction('SET_MODAL_FILTER_OTHER_GROUP', data),
    setModalFilterPaging: paging => ContextUtils.createAction('SET_MODAL_FILTER_PAGING', paging),
    resetModalFilterPaging: options => ContextUtils.createAction('RESET_MODAL_FILTER_PAGING', options),
    setMegaFilterCustomers: data => ContextUtils.createAction('SET_MEGA_FILTER_CUSTOMER', data),
    setMegaFilterSuppliers: data => ContextUtils.createAction('SET_MEGA_FILTER_SUPPLIER', data),
    setMegaFilterStaffs: data => ContextUtils.createAction('SET_MEGA_FILTER_STAFF', data),
    setMegaFilterOtherGroups: data => ContextUtils.createAction('SET_MEGA_FILTER_OTHER_GROUP', data),
    setMegaFilterPaging: paging => ContextUtils.createAction('SET_MEGA_FILTER_PAGING', paging),
    resetMegaFilterPaging: options => ContextUtils.createAction('RESET_MEGA_FILTER_PAGING', options)
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_CUSTOM_TIME_FRAME': {
            const { customStartDate, customEndDate } = action.payload
            return {
                ...state,
                customStartDate: customStartDate,
                customEndDate: customEndDate
            }
        }
        case 'SET_REVENUE_SUMMARY': {
            return {
                ...state,
                revenueSummary: action.payload
            }
        }
        case 'SET_PAGING': {
            return {
                ...state,
                paging: {
                    ...state.paging,
                    ...action.payload
                }
            }
        }
        case 'SET_FILTER': {
            return {
                ...state,
                filter: {
                    ...state.filter,
                    ...action.payload
                }
            }
        }
        case 'SET_CASHBOOK_LIST': {
            return {
                ...state,
                cashbookList: action.payload
            }
        }
        case 'SET_FILTER_BRANCHES': {
            return {
                ...state,
                filterBranches: action.payload
            }
        }
        case 'SET_FILTER_STAFFS': {
            return {
                ...state,
                filterStaffs: action.payload
            }
        }
        case 'SET_MODAL_FILTER_CUSTOMER': {
            return {
                ...state,
                receiptPaymentModal: {
                    ...state.receiptPaymentModal,
                    filterCustomers: action.payload
                }
            }
        }
        case 'SET_MODAL_FILTER_SUPPLIER': {
            return {
                ...state,
                receiptPaymentModal: {
                    ...state.receiptPaymentModal,
                    filterSuppliers: action.payload
                }
            }
        }
        case 'SET_MODAL_FILTER_STAFF': {
            return {
                ...state,
                receiptPaymentModal: {
                    ...state.receiptPaymentModal,
                    filterStaffs: action.payload
                }
            }
        }
        case 'SET_MODAL_FILTER_OTHER_GROUP': {
            return {
                ...state,
                receiptPaymentModal: {
                    ...state.receiptPaymentModal,
                    filterOtherGroups: action.payload
                }
            }
        }
        case 'SET_MODAL_FILTER_PAGING': {
            return {
                ...state,
                receiptPaymentModal: {
                    ...state.receiptPaymentModal,
                    filterPaging: {
                        ...state.receiptPaymentModal.filterPaging,
                        ...action.payload
                    }
                }
            }
        }
        case 'RESET_MODAL_FILTER_PAGING': {
            return {
                ...state,
                receiptPaymentModal: {
                    ...state.receiptPaymentModal,
                    filterPaging: {
                        ...initFilterPaging,
                        ...action.payload
                    }
                }
            }
        }
        case 'SET_MEGA_FILTER_CUSTOMER': {
            return {
                ...state,
                megaFilter: {
                    ...state.megaFilter,
                    filterCustomers: action.payload
                }
            }
        }
        case 'SET_MEGA_FILTER_SUPPLIER': {
            return {
                ...state,
                megaFilter: {
                    ...state.megaFilter,
                    filterSuppliers: action.payload
                }
            }
        }
        case 'SET_MEGA_FILTER_STAFF': {
            return {
                ...state,
                megaFilter: {
                    ...state.megaFilter,
                    filterStaffs: action.payload
                }
            }
        }
        case 'SET_MEGA_FILTER_OTHER_GROUP': {
            return {
                ...state,
                megaFilter: {
                    ...state.megaFilter,
                    filterOtherGroups: action.payload
                }
            }
        }
        case 'SET_MEGA_FILTER_PAGING': {
            return {
                ...state,
                megaFilter: {
                    ...state.megaFilter,
                    filterPaging: {
                        ...state.megaFilter.filterPaging,
                        ...action.payload
                    }
                }
            }
        }
        case 'RESET_MEGA_FILTER_PAGING': {
            return {
                ...state,
                megaFilter: {
                    ...state.receiptPaymentModal,
                    filterPaging: {
                        ...initFilterPaging,
                        ...action.payload
                    }
                }
            }
        }
    }
}

export const CashbookContext = {
    context,
    provider: context.Provider,
    initState,
    reducer,
    actions
}


