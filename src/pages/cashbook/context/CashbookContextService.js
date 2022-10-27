import {CashbookContext} from './CashbookContext'
import {
    ACCOUNTING,
    BRANCH,
    CREATED_BY,
    EXPENSE_TYPE,
    FILTER_BRANCH_OPTIONS,
    FILTER_CREATED_BY_OPTIONS,
    PAYMENT_METHOD,
    REVENUE_TYPE,
    SENDER_RECIPIENT_GROUP,
    SENDER_RECIPIENT_NAME,
    TRANSACTION
} from './CashbookConstants'
import {TokenUtils} from '../../../utils/token'
import storeService from '../../../services/StoreService'
import {GSToast} from '../../../utils/gs-toast'
import {ItemService} from '../../../services/ItemService'
import beehiveService from '../../../services/BeehiveService'
import cashbookService from '../../../services/CashbookService'

const updateCashbookList = (state, dispatch) => {
    const { page, size } = state.paging
    cashbookService.getAllCashBooks(getOptions(state), {
        page,
        size,
        sort: 'createdDate,desc'
    })
        .then(result => {
            dispatch(CashbookContext.actions.setCashbookList(result.data))
            dispatch(CashbookContext.actions.setPaging({
                total: parseInt(result.headers['x-total-count'])
            }))
        })
        .catch(e => GSToast.commonError())
}

const updateCashbookSummary = (state, dispatch) => {
    cashbookService.getCashBookSummary(getOptions(state))
        .then(result => {
            dispatch(CashbookContext.actions.setRevenueSummary(result))
        })
        .catch(e => GSToast.commonError())
}

const updateFilterBranches = (state, dispatch) => {
    let promise

    if (TokenUtils.isStaff()) {
        promise = storeService.getListActiveBranchOfStaff()
            .then(branches => _.orderBy(branches, b => b.name?.toLowerCase()))
    } else {
        promise = storeService.getStoreBranches(null, {
            sort: 'name,asc'
        })
    }

    promise
        .then(branches => {
            if (!branches.length) {
                return
            }

            const filterBranches = [
                ...FILTER_BRANCH_OPTIONS,
                ...branches.map(b => ({
                    label: b.name,
                    value: b.id,
                    isDefault: b.isDefault,
                    status: b.branchStatus
                }))
            ]

            dispatch(CashbookContext.actions.setFilterBranches(filterBranches))
        })
        .catch(() => GSToast.commonError())
}

const updateFilterStaffs = (state, dispatch) => {
    storeService.getStaffs(false, 0, Number.MAX_SAFE_INTEGER, 'name,asc')
        .then(({ data }) => {
            if (!data.length) {
                return
            }

            const filterStaffs = [
                ...FILTER_CREATED_BY_OPTIONS,
                ...data.map(b => ({
                    label: b.name,
                    value: b.name
                }))
            ]

            dispatch(CashbookContext.actions.setFilterStaffs(filterStaffs))
        })
        .catch(() => GSToast.commonError())
}

const updateModalFilterCustomers = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.receiptPaymentModal.filterPaging

    dispatch(CashbookContext.actions.setModalFilterPaging({
        isLoading: true
    }))

    beehiveService.searchCustomerByName(page, size, keyword, { sort: 'fullName,asc' })
        .then(({ data, headers }) => {
            const filterCustomers = data.map(s => ({
                label: s.fullName,
                value: s.id
            }))
            const modalFilterCustomers = isScroll
                ? [...state.receiptPaymentModal.filterCustomers, ...filterCustomers]
                : filterCustomers

            dispatch(CashbookContext.actions.setModalFilterCustomers(modalFilterCustomers))
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !modalFilterCustomers.length
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setModalFilterPaging({
                isLoading: false
            }))
        })
}

const updateMegaFilterCustomers = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.megaFilter.filterPaging

    dispatch(CashbookContext.actions.setMegaFilterPaging({
        isLoading: true
    }))

    beehiveService.searchCustomerByName(page, size, keyword, { sort: 'fullName,asc' })
        .then(({ data, headers }) => {
            const filterCustomers = data.map(s => ({
                label: s.fullName,
                value: s.fullName
            }))
            const megaFilterCustomers = isScroll
                ? [...state.megaFilter.filterCustomers, ...filterCustomers]
                : filterCustomers

            dispatch(CashbookContext.actions.setMegaFilterCustomers(megaFilterCustomers))
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !megaFilterCustomers.length
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                isLoading: false
            }))
        })
}

const updateModalFilterSuppliers = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.receiptPaymentModal.filterPaging

    dispatch(CashbookContext.actions.setModalFilterPaging({
        isLoading: true
    }))

    ItemService.searchSupplierByName(page, size, 'name,asc', keyword)
        .then(({ data, headers }) => {
            const filterSuppliers = data.map(s => ({
                label: s.name,
                value: s.id
            }))
            const modalFilterSuppliers = isScroll
                ? [...state.receiptPaymentModal.filterSuppliers, ...filterSuppliers]
                : filterSuppliers

            dispatch(CashbookContext.actions.setModalFilterSuppliers(modalFilterSuppliers))
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !modalFilterSuppliers.length
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setModalFilterPaging({
                isLoading: false
            }))
        })
}

const updateMegaFilterSuppliers = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.megaFilter.filterPaging

    dispatch(CashbookContext.actions.setMegaFilterPaging({
        isLoading: true
    }))

    ItemService.searchSupplierByName(page, size, 'name,asc', keyword)
        .then(({ data, headers }) => {
            const filterSuppliers = data.map(s => ({
                label: s.name,
                value: s.name
            }))
            const megaFilterSuppliers = isScroll
                ? [...state.megaFilter.filterSuppliers, ...filterSuppliers]
                : filterSuppliers

            dispatch(CashbookContext.actions.setMegaFilterSuppliers(megaFilterSuppliers))
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !megaFilterSuppliers.length
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                isLoading: false
            }))
        })
}

const updateModalFilterStaffs = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.receiptPaymentModal.filterPaging

    dispatch(CashbookContext.actions.setModalFilterPaging({
        isLoading: true
    }))

    storeService.getStaffsForGoChat({ page, size, sort: 'name,asc', keyword, enabled: true })
        .then(({ data, headers }) => {
            const filterStaffs = data.map(s => ({
                label: s.name,
                value: s.id
            }))
            const modalFilterStaffs = isScroll
                ? [...state.receiptPaymentModal.filterStaffs, ...filterStaffs]
                : filterStaffs

            dispatch(CashbookContext.actions.setModalFilterStaffs(modalFilterStaffs))
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !modalFilterStaffs.length
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setModalFilterPaging({
                isLoading: false
            }))
        })
}

const updateMegaFilterStaffs = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.megaFilter.filterPaging

    dispatch(CashbookContext.actions.setMegaFilterPaging({
        isLoading: true
    }))

    storeService.getStaffsForGoChat({ page, size, sort: 'name,asc', keyword, enabled: true })
        .then(({ data, headers }) => {
            const filterStaffs = data.map(s => ({
                label: s.name,
                value: s.name
            }))
            const megaFilterStaffs = isScroll
                ? [...state.megaFilter.filterStaffs, ...filterStaffs]
                : filterStaffs

            dispatch(CashbookContext.actions.setMegaFilterStaffs(megaFilterStaffs))
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !megaFilterStaffs.length
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                isLoading: false
            }))
        })
}

const updateModalFilterOtherGroups = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.receiptPaymentModal.filterPaging

    dispatch(CashbookContext.actions.setModalFilterPaging({
        isLoading: true
    }))

    cashbookService.getAllOtherGroup({
        'name.contains': keyword
    }, {
        page: page,
        size: size
    })
        .then(({ data, headers }) => {
            const filterOtherGroups = data.map(s => ({
                label: s.name,
                value: s.id
            }))
            const modalFilterOtherGroups = isScroll
                ? [...state.receiptPaymentModal.filterOtherGroups, ...filterOtherGroups]
                : filterOtherGroups

            dispatch(CashbookContext.actions.setModalFilterOtherGroups(modalFilterOtherGroups))
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: parseInt(headers['x-total-count']),
                isAdd: !modalFilterOtherGroups.length && !!keyword,
                isNoResult: !modalFilterOtherGroups.length && !keyword
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setModalFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setModalFilterPaging({
                isLoading: false
            }))
        })
}

const updateMegaFilterOtherGroups = (state, dispatch) => {
    const { page, size, keyword, isScroll } = state.megaFilter.filterPaging

    dispatch(CashbookContext.actions.setMegaFilterPaging({
        isLoading: true
    }))

    cashbookService.getAllOtherGroup({
        'name.contains': keyword
    }, {
        page: page,
        size: size
    })
        .then(({ data, headers }) => {
            const filterOtherGroups = data.map(s => ({
                label: s.name,
                value: s.name
            }))
            const megaFilterOtherGroups = isScroll
                ? [...state.megaFilter.filterOtherGroups, ...filterOtherGroups]
                : filterOtherGroups

            dispatch(CashbookContext.actions.setMegaFilterOtherGroups(megaFilterOtherGroups))
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: parseInt(headers['x-total-count']),
                isNoResult: !megaFilterOtherGroups.length && !keyword
            }))
        })
        .catch(() => {
            GSToast.commonError()

            //Prevent load more call forever
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                total: 0
            }))
        })
        .finally(() => {
            dispatch(CashbookContext.actions.setMegaFilterPaging({
                isLoading: false
            }))
        })
}

const getOptions = (state) => {
    const { keyword } = state.paging
    const { customStartDate, customEndDate } = state
    const {
        branch,
        accounting,
        transaction,
        expenseType,
        revenueType,
        createdBy,
        senderRecipientGroup,
        senderRecipientName,
        paymentMethod
    } = state.filter

    const sourceTypeIn = []

    if (expenseType !== EXPENSE_TYPE.ALL) {
        sourceTypeIn.push(expenseType)
    }
    if (revenueType !== REVENUE_TYPE.ALL) {
        sourceTypeIn.push(revenueType)
    }

    let senderRecipientKey

    switch (senderRecipientGroup) {
        case SENDER_RECIPIENT_GROUP.CUSTOMER:
            senderRecipientKey = 'customerName.equals'
            break

        case SENDER_RECIPIENT_GROUP.SUPPLIER:
            senderRecipientKey = 'supplierName.equals'
            break

        case SENDER_RECIPIENT_GROUP.STAFF:
            senderRecipientKey = 'staffName.equals'
            break

        case SENDER_RECIPIENT_GROUP.OTHERS:
            senderRecipientKey = 'otherGroupName.equals'
            break
    }

    return _.pickBy({
        'createdDateFrom.greaterThanOrEqual': customStartDate,
        'createdDateTo.lessThanOrEqual': customEndDate,
        'transactionCode.equals': keyword,
        'branchId.equals': branch !== BRANCH.ALL ? branch : null,
        'forAccounting.specified': accounting !== ACCOUNTING.ALL ? accounting.toLowerCase() : null,
        'type.equals': transaction !== TRANSACTION.ALL ? transaction : null,
        'sourceType.in': sourceTypeIn.length ? sourceTypeIn : null,
        'createdBy.equals': createdBy !== CREATED_BY.ALL ? createdBy : null,
        'groupType.equals': senderRecipientGroup !== SENDER_RECIPIENT_GROUP.ALL ? senderRecipientGroup : null,
        [senderRecipientKey]: senderRecipientName !== SENDER_RECIPIENT_NAME.ALL ? senderRecipientName : null,
        'paymentMethod.equals': paymentMethod !== PAYMENT_METHOD.ALL ? paymentMethod : null
    }, _.identity)
}

const getPercentageText = (percentage) => {
    return `(${ percentage > 0.001 ? percentage : '< 0.001' }%)`
}

export const CashbookContextService = {
    updateCashbookList,
    updateCashbookSummary,
    updateFilterBranches,
    updateFilterStaffs,
    updateModalFilterCustomers,
    updateMegaFilterCustomers,
    updateModalFilterSuppliers,
    updateMegaFilterSuppliers,
    updateModalFilterStaffs,
    updateMegaFilterStaffs,
    updateModalFilterOtherGroups,
    updateMegaFilterOtherGroups,
    getPercentageText
}
