import i18next from 'i18next'
import moment from 'moment'
import {CredentialUtils} from '../../../utils/credential'

export const PAGE_MAX_SIZE = 20
export const UI_DATE_FORMAT = 'DD-MM-YYYY'
export const MIN_FILTER_DATE = moment('2021-10-01')
export const BRANCH = {
    ALL: 'ALL'
}
export const ACCOUNTING = {
    ALL: 'ALL',
    TRUE: 'TRUE',
    FALSE: 'FALSE'
}
export const TRANSACTION = {
    ALL: 'ALL',
    ALL_EXPENSES: 'PAYMENT',
    ALL_REVENUE: 'RECEIPT'
}
export const EXPENSE_TYPE = {
    ALL: 'ALL',
    PAYMENT_TO_SHIPPING_PARTNER: 'PAYMENT_TO_SHIPPING_PARTNER',
    PAYMENT_FOR_GOODS: 'PAYMENT_FOR_GOODS',
    PRODUCTION_COST: 'PRODUCTION_COST',
    COST_OF_RAW_MATERIALS: 'COST_OF_RAW_MATERIALS',
    RENTAL_FEE: 'RENTAL_FEE',
    UTILITIES: 'UTILITIES',
    SALARIES: 'SALARIES',
    SELLING_EXPENSES: 'SELLING_EXPENSES',
    OTHER_COSTS: 'OTHER_COSTS',
    REFUND: 'REFUND'

}
export const REVENUE_TYPE = {
    ALL: 'ALL',
    DEBT_COLLECTION_FROM_SUPPLIER: 'DEBT_COLLECTION_FROM_SUPPLIER',
    DEBT_COLLECTION_FROM_CUSTOMER: 'DEBT_COLLECTION_FROM_CUSTOMER',
    PAYMENT_FOR_ORDER: 'PAYMENT_FOR_ORDER',
    SALE_OF_ASSETS: 'SALE_OF_ASSETS',
    OTHER_INCOME: 'OTHER_INCOME'
}
export const CREATED_BY = {
    ALL: 'ALL',
    SYSTEM: 'SYSTEM',
    SHOP_OWNER: '[shop0wner]'
}
export const SENDER_RECIPIENT_GROUP = {
    ALL: 'ALL',
    CUSTOMER: 'CUSTOMER',
    SUPPLIER: 'SUPPLIER',
    STAFF: 'STAFF',
    OTHERS: 'OTHERS'
}
export const SENDER_RECIPIENT_NAME = {
    ALL: 'ALL'
}
export const PAYMENT_METHOD = {
    ALL: 'ALL',
    VISA: 'VISA',
    ATM: 'ATM',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CASH: 'CASH',
    ZALOPAY: 'ZALO',
    MOMO: 'MOMO'
}

export const FULL_PAYMENT_METHOD = {
    ...PAYMENT_METHOD,
    COD: 'COD',
    COIN: 'COIN',
    INSTALLMENT: 'INSTALLMENT',
    POS: 'POS',
    PAYPAL: 'PAYPAL'
}

export const FILTER_BRANCH_OPTIONS = [
    ...Object.values(BRANCH).map(branch => ({
        label: i18next.t(`page.cashbook.filter.branch.${branch.toLowerCase()}`),
        value: branch.toUpperCase()
    }))
]
export const FILTER_ACCOUNTING_OPTIONS = [
    ...Object.values(ACCOUNTING).map(branch => ({
        label: i18next.t(`page.cashbook.filter.accounting.${branch.toLowerCase()}`),
        value: branch.toUpperCase()
    }))
]
export const FILTER_TRANSACTIONS_OPTIONS = [
    ...Object.values(TRANSACTION).map(transaction => ({
        label: i18next.t(`page.cashbook.filter.transaction.${transaction.toLowerCase()}`),
        value: transaction.toUpperCase()
    }))
]
export const FILTER_EXPENSE_TYPE_OPTIONS = [
    ...Object.values(EXPENSE_TYPE).map(type => ({
        label: i18next.t(`page.cashbook.filter.expenseType.${type.toLowerCase()}`),
        value: type.toUpperCase()
    }))
]
export const FILTER_REVENUE_TYPE_OPTIONS = [
    ...Object.values(REVENUE_TYPE).map(type => ({
        label: i18next.t(`page.cashbook.filter.revenueType.${type.toLowerCase()}`),
        value: type.toUpperCase()
    }))
]
export const FILTER_CREATED_BY_OPTIONS = [
    ...Object.values(CREATED_BY).map(type => ({
        label: i18next.t(`page.cashbook.filter.createdBy.${type.toLowerCase()}`),
        value: type.toUpperCase()
    }))
]
export const FILTER_SENDER_RECIPIENT_GROUP_OPTIONS = [
    ...Object.values(SENDER_RECIPIENT_GROUP).map(type => ({
        label: i18next.t(`page.cashbook.filter.senderRecipientGroup.${type.toLowerCase()}`),
        value: type.toUpperCase()
    }))
]
export const FILTER_SENDER_RECIPIENT_NAME_OPTIONS = [
    ...Object.values(SENDER_RECIPIENT_NAME).map(type => ({
        label: i18next.t(`page.cashbook.filter.senderRecipientName.${type.toLowerCase()}`),
        value: type.toUpperCase()
    }))
]
export const FILTER_PAYMENT_METHOD_OPTIONS = [
    ...Object.values(PAYMENT_METHOD).map(method => ({
        label: i18next.t(`page.cashbook.filter.paymentMethod.${method.toLowerCase()}`),
        value: method.toUpperCase()
    }))
]

export const FILTER_FULL_PAYMENT_METHOD_OPTIONS = [
    ...Object.values(FULL_PAYMENT_METHOD).map(method => ({
        label: i18next.t(`page.cashbook.filter.paymentMethod.${method.toLowerCase()}`),
        value: method.toUpperCase()
    }))
]

export const CASHBOOK_TYPE = {
    RECEIPT: 'RECEIPT',
    PAYMENT: 'PAYMENT'
}
