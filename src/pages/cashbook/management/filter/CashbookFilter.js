import './CashbookFilter.sass'
import React, {useContext, useEffect, useMemo, useState} from 'react'
import GSDateRangePicker from '../../../../components/shared/GSDateRangePicker/GSDateRangePicker'
import GSMegaFilter from '../../../../components/shared/GSMegaFilter/GSMegaFilter'
import {CashbookContext} from '../../context/CashbookContext'
import {
    FILTER_ACCOUNTING_OPTIONS,
    FILTER_EXPENSE_TYPE_OPTIONS,
    FILTER_PAYMENT_METHOD_OPTIONS,
    FILTER_REVENUE_TYPE_OPTIONS,
    FILTER_SENDER_RECIPIENT_GROUP_OPTIONS,
    FILTER_SENDER_RECIPIENT_NAME_OPTIONS,
    FILTER_TRANSACTIONS_OPTIONS,
    MIN_FILTER_DATE,
    SENDER_RECIPIENT_GROUP,
    SENDER_RECIPIENT_NAME
} from '../../context/CashbookConstants'
import {CashbookContextService} from '../../context/CashbookContextService'
import GSMegaFilterRowSelect from '../../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelect'
import GSMegaFilterRowSelectScroll
    from '../../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelectScroll'
import moment from 'moment'

const CashbookFilter = props => {
    const { state, dispatch } = useContext(CashbookContext.context)
    const { filterCustomers, filterSuppliers, filterStaffs, filterOtherGroups, filterPaging } = state.megaFilter

    const [stSenderRecipientNames, setStSenderRecipientNames] = useState([])
    const [stSenderRecipientGroup, setStSenderRecipientGroup] = useState(state.filter.senderRecipientGroup)

    const MEMO_FILTER_ACCOUNTING_OPTIONS = useMemo(() => FILTER_ACCOUNTING_OPTIONS, [])
    const MEMO_FILTER_TRANSACTIONS_OPTIONS = useMemo(() => FILTER_TRANSACTIONS_OPTIONS, [])
    const MEMO_FILTER_EXPENSE_TYPE_OPTIONS = useMemo(() => FILTER_EXPENSE_TYPE_OPTIONS, [])
    const MEMO_FILTER_REVENUE_TYPE_OPTIONS = useMemo(() => FILTER_REVENUE_TYPE_OPTIONS, [])
    const MEMO_FILTER_SENDER_RECIPIENT_GROUP_OPTIONS = useMemo(() => FILTER_SENDER_RECIPIENT_GROUP_OPTIONS, [])
    const MEMO_FILTER_SENDER_RECIPIENT_NAME_OPTIONS = useMemo(() => FILTER_SENDER_RECIPIENT_NAME_OPTIONS, [])
    const MEMO_FILTER_PAYMENT_METHOD_OPTIONS = useMemo(() => FILTER_PAYMENT_METHOD_OPTIONS, [])

    useEffect(() => {
        dispatch(CashbookContext.actions.resetMegaFilterPaging({
            senderRecipientGroup: stSenderRecipientGroup
        }))
        if (state.filter.senderRecipientName !== SENDER_RECIPIENT_NAME.ALL) {
            dispatch(CashbookContext.actions.setFilter({
                senderRecipientName: SENDER_RECIPIENT_NAME.ALL
            }))
        }
    }, [stSenderRecipientGroup])

    useEffect(() => {
        switch (filterPaging.senderRecipientGroup) {
            case SENDER_RECIPIENT_GROUP.CUSTOMER:
                CashbookContextService.updateMegaFilterCustomers(state, dispatch)
                break

            case SENDER_RECIPIENT_GROUP.SUPPLIER:
                CashbookContextService.updateMegaFilterSuppliers(state, dispatch)
                break

            case SENDER_RECIPIENT_GROUP.STAFF:
                CashbookContextService.updateMegaFilterStaffs(state, dispatch)
                break

            case SENDER_RECIPIENT_GROUP.OTHERS:
                CashbookContextService.updateMegaFilterOtherGroups(state, dispatch)
                break
        }
    }, [filterPaging.senderRecipientGroup, filterPaging.page, filterPaging.keyword])

    useEffect(() => {
        let senderRecipientNames = []

        switch (filterPaging.senderRecipientGroup) {
            case SENDER_RECIPIENT_GROUP.CUSTOMER:
                senderRecipientNames = filterCustomers
                break

            case SENDER_RECIPIENT_GROUP.SUPPLIER:
                senderRecipientNames = filterSuppliers
                break

            case SENDER_RECIPIENT_GROUP.STAFF:
                senderRecipientNames = filterStaffs
                break

            case SENDER_RECIPIENT_GROUP.OTHERS:
                senderRecipientNames = filterOtherGroups
                break
        }

        setStSenderRecipientNames([
            ...MEMO_FILTER_SENDER_RECIPIENT_NAME_OPTIONS,
            ...senderRecipientNames
        ])
    }, [filterPaging.senderRecipientGroup, filterCustomers, filterSuppliers, filterStaffs, filterOtherGroups])

    const FULL_DATETIME_WITH_ZONE_FORMAT = 'YYYY-MM-DDThh:mm:ssSSSZ';

    const handleFilterByDateChange = (event, picker) => {
        // const d = moment(new Date(), FULL_DATETIME_WITH_ZONE_FORMAT).startOf("day");
        // const tz = moment.utc(d);
        // console.log(`Current zone: ${tz}`);
        if (event.type === 'cancel') {
            const fromDate = moment.utc(moment(new Date(), FULL_DATETIME_WITH_ZONE_FORMAT).startOf("day")).toISOString();
            const toDate = moment.utc(moment(new Date(), FULL_DATETIME_WITH_ZONE_FORMAT).endOf("day")).toISOString();
            dispatch(CashbookContext.actions.setCustomTimeFrame(fromDate, toDate))
        } else {
            const fromDate = picker.startDate
            const toDate = picker.endDate

            dispatch(CashbookContext.actions.setCustomTimeFrame(fromDate, toDate))
        }
    }

    const handleFilterMegaChange = (values) => {
        dispatch(CashbookContext.actions.setFilter(values))
        dispatch(CashbookContext.actions.setPaging({
            page: 0
        }))
    }

    const handleSearch = paging => {
        dispatch(CashbookContext.actions.setMegaFilterPaging(paging))
    }

    return (
        <div className="d-flex justify-content-between w-100 mt-2">
            <GSDateRangePicker
                minimumNights={ 0 }
                onApply={ handleFilterByDateChange }
                onCancel={ handleFilterByDateChange }
                containerStyles={ {
                    width: '220px',
                    marginRight: '.5rem'
                } }
                minDate={ MIN_FILTER_DATE }
                fromDate={ moment(state.customStartDate) }
                toDate={ moment(state.customEndDate) }
                resultToString
                opens={ 'left' }
                readOnly
            />
            <GSMegaFilter
                size="medium"
                onSubmit={ handleFilterMegaChange }
            >
                <GSMegaFilterRowSelect
                    name="branch"
                    i18Key="page.cashbook.filter.branch"
                    options={ state.filterBranches }
                    defaultValue={ state.filter.branch }
                    ignoreCountValue={ 'ALL' }
                />
                <GSMegaFilterRowSelect
                    name="accounting"
                    i18Key="page.cashbook.filter.accounting"
                    options={ MEMO_FILTER_ACCOUNTING_OPTIONS }
                    defaultValue={ state.filter.accounting }
                    ignoreCountValue={ 'ALL' }
                />
                <GSMegaFilterRowSelect
                    name="transaction"
                    i18Key="page.cashbook.filter.transaction"
                    options={ MEMO_FILTER_TRANSACTIONS_OPTIONS }
                    defaultValue={ state.filter.transaction }
                    ignoreCountValue={ 'ALL' }
                />
                <GSMegaFilterRowSelect
                    name="expenseType"
                    i18Key="page.cashbook.filter.expenseType"
                    options={ MEMO_FILTER_EXPENSE_TYPE_OPTIONS }
                    defaultValue={ state.filter.expenseType }
                    ignoreCountValue={ 'ALL' }
                />
                <GSMegaFilterRowSelect
                    name="revenueType"
                    i18Key="page.cashbook.filter.revenueType"
                    options={ MEMO_FILTER_REVENUE_TYPE_OPTIONS }
                    defaultValue={ state.filter.revenueType }
                    ignoreCountValue={ 'ALL' }
                />
                <GSMegaFilterRowSelect
                    name="createdBy"
                    i18Key="page.cashbook.filter.createdBy"
                    options={ state.filterStaffs }
                    defaultValue={ state.filter.createdBy }
                    ignoreCountValue={ 'ALL' }
                />
                <GSMegaFilterRowSelect
                    name="senderRecipientGroup"
                    i18Key="page.cashbook.filter.senderRecipientGroup"
                    options={ MEMO_FILTER_SENDER_RECIPIENT_GROUP_OPTIONS }
                    defaultValue={ state.filter.senderRecipientGroup }
                    ignoreCountValue={ 'ALL' }
                    onChange={ value => setStSenderRecipientGroup(value) }
                />
                <GSMegaFilterRowSelectScroll
                    key={ stSenderRecipientGroup + state.filter.senderRecipientName }
                    name="senderRecipientName"
                    i18Key="page.cashbook.filter.senderRecipientName"
                    options={ stSenderRecipientNames }
                    defaultValue={ state.filter.senderRecipientName }
                    ignoreCountValue={ 'ALL' }
                    paging={ state.megaFilter.filterPaging }
                    onSearch={ handleSearch }
                />
                <GSMegaFilterRowSelect
                    name="paymentMethod"
                    i18Key="page.cashbook.filter.paymentMethod"
                    options={ MEMO_FILTER_PAYMENT_METHOD_OPTIONS }
                    defaultValue={ state.filter.paymentMethod }
                    ignoreCountValue={ 'ALL' }
                />
            </GSMegaFilter>
        </div>
    )
}

CashbookFilter.defaultProps = {}

CashbookFilter.propTypes = {}

export default CashbookFilter
