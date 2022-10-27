import './CashbookReceiptPaymentModal.sass'
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import ModalBody from 'reactstrap/es/ModalBody'
import Modal from 'reactstrap/es/Modal'
import {bool, func, number, oneOf, oneOfType, shape, string} from 'prop-types'
import ModalHeader from 'reactstrap/es/ModalHeader'
import Row from 'reactstrap/es/Row'
import Col from 'reactstrap/es/Col'
import {UikCheckbox, UikSelect} from '../../../../@uik'
import AvFieldCountable from '../../../../components/shared/form/CountableAvField/AvFieldCountable'
import {AvForm} from 'availity-reactstrap-validation'
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency'
import {CurrencySymbol} from '../../../../components/shared/form/CryStrapInput/CryStrapInput'
import ModalFooter from 'reactstrap/es/ModalFooter'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import {
    EXPENSE_TYPE,
    FILTER_EXPENSE_TYPE_OPTIONS, FILTER_FULL_PAYMENT_METHOD_OPTIONS,
    FILTER_PAYMENT_METHOD_OPTIONS,
    FILTER_REVENUE_TYPE_OPTIONS,
    FILTER_SENDER_RECIPIENT_GROUP_OPTIONS,
    PAYMENT_METHOD,
    REVENUE_TYPE,
    SENDER_RECIPIENT_GROUP
} from '../../context/CashbookConstants'
import {CashbookContext} from '../../context/CashbookContext'
import GSAlertModal, {GSAlertModalType} from '../../../../components/shared/GSAlertModal/GSAlertModal'
import i18next from 'i18next'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import GSDropdownSearch from '../../../../components/shared/GSDropdownSearch/GSDropdownSearch'
import {CashbookContextService} from '../../context/CashbookContextService'
import GSDropdownSearchAdd from '../../../../components/shared/GSDropdownSearchAdd/GSDropdownSearchAdd'
import Constants from '../../../../config/Constant'
import {CurrencyUtils} from "../../../../utils/number-format";
import {CredentialUtils} from "../../../../utils/credential";

const TYPE = {
    RECEIPT: 'RECEIPT',
    PAYMENT: 'PAYMENT'
}

const MODE = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE'
}

const CashbookReceiptPaymentModal = props => {
    const { state, dispatch } = useContext(CashbookContext.context)
    const {
        filterCustomers,
        filterSuppliers,
        filterStaffs,
        filterOtherGroups,
        filterPaging
    } = state.receiptPaymentModal
    const { modal, toggle, type, mode, defaultValue, onSave } = props
    const isUpdateMode = mode === MODE.UPDATE
    const defaultError = {
        senderRecipientId: '',
        senderRecipientName: '',
        revenueType: '',
        expenseType: '',
        branchId: ''
    }

    const [stData, setStData] = useState(defaultValue)
    const [stSenderRecipientNames, setStSenderRecipientNames] = useState([])
    const [stErrors, setStErrors] = useState(defaultError)
    const [stEditing, setStEditing] = useState(false)
    const [stReRenderAmount, setStReRenderAmount] = useState(false)
    const [stDisabledSaveBtn, setStDisabledSaveBtn] = useState(false)

    const MEMO_FILTER_SENDER_RECIPIENT_GROUP_OPTIONS = useMemo(() => FILTER_SENDER_RECIPIENT_GROUP_OPTIONS.slice(1, FILTER_SENDER_RECIPIENT_GROUP_OPTIONS.length), [])
    const MEMO_FILTER_REVENUE_TYPE_OPTIONS = useMemo(() => (
        stData.revenueType
            ? FILTER_REVENUE_TYPE_OPTIONS.slice(1, FILTER_REVENUE_TYPE_OPTIONS.length)
            : [
                {
                    label: i18next.t('page.cashbook.receiptPaymentModal.select.revenueType')
                },
                ...FILTER_REVENUE_TYPE_OPTIONS.slice(1, FILTER_REVENUE_TYPE_OPTIONS.length)
            ]
    ), [stData.revenueType])
    const MEMO_FILTER_EXPENSE_TYPE_OPTIONS = useMemo(() => (
        stData.expenseType
            ? FILTER_EXPENSE_TYPE_OPTIONS.slice(1, FILTER_EXPENSE_TYPE_OPTIONS.length)
            : [
                {
                    label: i18next.t('page.cashbook.receiptPaymentModal.select.expenseType')
                },
                ...FILTER_EXPENSE_TYPE_OPTIONS.slice(1, FILTER_EXPENSE_TYPE_OPTIONS.length)
            ]
    ), [stData.expenseType])
    const MEMO_FILTER_PAYMENT_METHOD_OPTIONS = useMemo(() => isUpdateMode
        ? FILTER_FULL_PAYMENT_METHOD_OPTIONS.slice(1, FILTER_FULL_PAYMENT_METHOD_OPTIONS.length)
        : FILTER_PAYMENT_METHOD_OPTIONS.slice(1, FILTER_PAYMENT_METHOD_OPTIONS.length), [isUpdateMode])
    const MEMO_FILTER_BRANCH_OPTIONS = useMemo(() => {
        if (isUpdateMode) {
            return state.filterBranches.slice(1, state.filterBranches.length)
        }

        return state.filterBranches.slice(1, state.filterBranches.length).filter(b => b.status === Constants.BRANCH_STATUS.ACTIVE)
    }, [state.filterBranches, isUpdateMode])

    const refAlertModal = useRef()

    useEffect(() => {
        if (!modal) {
            setStData(defaultValue)
            setStErrors(defaultError)
            setStEditing(false)
            setStDisabledSaveBtn(false)
        }
    }, [modal])

    useEffect(() => {
        setStData(defaultValue)
    }, [defaultValue])

    useEffect(() => {
        if (modal && isUpdateMode) {
            if (defaultValue.senderRecipientGroup === SENDER_RECIPIENT_GROUP.OTHERS) {
                dispatch(CashbookContext.actions.setModalFilterPaging({
                    keyword: defaultValue.senderRecipientName
                }))
            }

            return
        }

        if (modal) {
            const defaultBranch = MEMO_FILTER_BRANCH_OPTIONS.find(b => b.isDefault)

            handleChange(defaultBranch?.value, 'branchId', {
                updateState: false
            })
            handleChange(defaultBranch?.label, 'branchName', {
                updateState: false
            })
        }
    }, [modal])

    useEffect(() => {
        if (!modal || !stData.senderRecipientGroup || isUpdateMode) {
            return
        }

        dispatch(CashbookContext.actions.resetModalFilterPaging({
            senderRecipientGroup: stData.senderRecipientGroup
        }))
    }, [modal, stData.senderRecipientGroup])

    useEffect(() => {
        if (!modal || isUpdateMode) {
            return
        }

        switch (filterPaging.senderRecipientGroup) {
            case SENDER_RECIPIENT_GROUP.CUSTOMER:
                CashbookContextService.updateModalFilterCustomers(state, dispatch)
                break

            case SENDER_RECIPIENT_GROUP.SUPPLIER:
                CashbookContextService.updateModalFilterSuppliers(state, dispatch)
                break

            case SENDER_RECIPIENT_GROUP.STAFF:
                CashbookContextService.updateModalFilterStaffs(state, dispatch)
                break

            case SENDER_RECIPIENT_GROUP.OTHERS:
                CashbookContextService.updateModalFilterOtherGroups(state, dispatch)
                break
        }

        handleChange(undefined, 'senderRecipientId', {
            updateState: false
        })
        handleChange(undefined, 'senderRecipientName', {
            updateState: false
        })
    }, [filterPaging.senderRecipientGroup, filterPaging.page, filterPaging.keyword])

    useEffect(() => {
        if (!modal || isUpdateMode) {
            return
        }

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
                !isUpdateMode && (senderRecipientNames = filterOtherGroups)
                break
        }

        setStSenderRecipientNames(senderRecipientNames)
    }, [filterPaging.senderRecipientGroup, filterCustomers, filterSuppliers, filterStaffs, filterOtherGroups])

    const getStateError = (state, options) => {
        let error = ''
        options = {
            updateState: true,
            value: stData[state],
            ...options
        }

        if (state === 'amount' && options.value <= 0) {
            error = i18next.t(`page.cashbook.receiptPaymentModal.error.${ state }`)

            if (error === `page.cashbook.receiptPaymentModal.error.${ state }`) {
                //fallback error translate not found
                error = i18next.t(`page.cashbook.receiptPaymentModal.error.${ state }.${ type.toLowerCase() }`)
            }
        } else if (!options.value) {
            error = i18next.t(`page.cashbook.receiptPaymentModal.error.${ state }`)

            if (error === `page.cashbook.receiptPaymentModal.error.${ state }`) {
                //fallback error translate not found
                error = i18next.t(`page.cashbook.receiptPaymentModal.error.${ state }.${ type.toLowerCase() }`)
            }
        }

        options.updateState && setStErrors(e => ({
            ...e,
            [state]: error
        }))

        return error
    }

    const isValid = () => {
        setStErrors({})
        let error = {}

        if (!stData.senderRecipientId && !stData.senderRecipientName) {
            error.senderRecipientId = getStateError('senderRecipientId', { updateState: false })
            error.senderRecipientName = getStateError('senderRecipientName', { updateState: false })
        }

        if (type === TYPE.RECEIPT) {
            error.revenueType = getStateError('revenueType', { updateState: false })
        } else {
            error.expenseType = getStateError('expenseType', { updateState: false })
        }
        error.branchId = getStateError('branchId', { updateState: false })
        error.amount = getStateError('amount', { updateState: false })

        setStErrors(error)

        return Object.values(error).every(v => !v)
    }

    const handleChange = (value, state, options) => {
        options = {
            updateState: true,
            value,
            ...options
        }
        getStateError(state, options)


        if (state === 'branchId' || state === 'branchName') {
            //old state data is initial, will not mark editing

            if (!_.isEmpty(stData[state])) {
                setStEditing(true)
            }
        } else if (value !== undefined) {
            setStEditing(true)
        }

        setStData(data => ({
            ...data,
            [state]: value
        }))
    }

    const handleCancel = () => {
        if (stEditing) {
            refAlertModal.current.openModal({
                type: GSAlertModalType.ALERT_TYPE_SUCCESS,
                messages: i18next.t('component.product.addNew.cancelHint'),
                acceptCallback: toggle,
                modalCloseBtn: i18next.t('common.btn.cancel'),
                modalAcceptBtn: i18next.t('common.btn.ok')
            })
        } else {
            toggle()
        }
    }

    const handleSave = () => {
        setStDisabledSaveBtn(true)

        if (!isValid()) {
            setStDisabledSaveBtn(false)
            return
        }

        onSave(stData)
    }

    const handleSelectOtherName = ({ label, value }) => {
        handleChange(value, 'senderRecipientId')
        handleChange(label, 'senderRecipientName')
        setStEditing(true)
    }

    const renderSenderName = () => {
        if (stData.senderRecipientGroup !== SENDER_RECIPIENT_GROUP.OTHERS) {
            return (
                <GSDropdownSearch
                    key={ stData.senderRecipientGroup }
                    required
                    disabled={ isUpdateMode }
                    placeholder={ i18next.t(`page.cashbook.receiptPaymentModal.select.${ stData.senderRecipientGroup?.toLowerCase() }`) }
                    placeholderSearch={ i18next.t(`page.cashbook.receiptPaymentModal.search.${ stData.senderRecipientGroup?.toLowerCase() }`) }
                    defaultValue={ { label: stData.senderRecipientName, value: stData.senderRecipientId } }
                    searchResult={ stSenderRecipientNames }
                    onSearch={ paging => dispatch(CashbookContext.actions.setModalFilterPaging(paging)) }
                    filter={ filterPaging }
                    onChange={ ({ label, value }) => {
                        handleChange(value, 'senderRecipientId')
                        handleChange(label, 'senderRecipientName')
                    } }/>
            )
        }

        return (
            <GSDropdownSearchAdd
                key={ stData.senderRecipientGroup }
                required
                disabled={ isUpdateMode }
                placeholder={ i18next.t('page.cashbook.receiptPaymentModal.searchHint') }
                defaultValue={ { label: stData.senderRecipientName, value: stData.senderRecipientId } }
                searchResult={ stSenderRecipientNames }
                onSearch={ paging => {
                    dispatch(CashbookContext.actions.setModalFilterPaging(paging))
                    handleChange(paging.keyword, 'senderRecipientName')
                } }
                filter={ filterPaging }
                onChange={ handleSelectOtherName }/>
        )
    }

    const renderRevenueExpenseType = () => {
        if (type === TYPE.RECEIPT) {
            return (
                <>
                    <span className="label required">
                        <GSTrans t="page.cashbook.receiptPaymentModal.revenueType"/>
                    </span>
                    <UikSelect
                        required
                        className={ isUpdateMode ? 'disabled' : '' }
                        value={ [{ value: stData.revenueType }] }
                        options={ MEMO_FILTER_REVENUE_TYPE_OPTIONS }
                        onChange={ ({ value }) => handleChange(value, 'revenueType') }
                    />
                    {
                        stErrors.revenueType &&
                        <span className="error">{ stErrors.revenueType }</span>
                    }
                </>
            )
        }

        return (
            <>
                <span className="label required">
                    <GSTrans t="page.cashbook.receiptPaymentModal.expenseType"/>
                </span>
                <UikSelect
                    required
                    className={ isUpdateMode ? 'disabled' : '' }
                    value={ [{ value: stData.expenseType }] }
                    options={ MEMO_FILTER_EXPENSE_TYPE_OPTIONS }
                    onChange={ ({ value }) => handleChange(value, 'expenseType') }
                />
                {
                    stErrors.expenseType &&
                    <span className="error">{ stErrors.expenseType }</span>
                }
            </>
        )
    }

    return (
        <>
            <GSAlertModal ref={ refAlertModal }/>
            <Modal isOpen={ modal } toggle={ handleCancel }
                   className="cashbook-receipt-payment-modal" backdrop="static"
                   keyboard={ false }>
                <ModalHeader toggle={ handleCancel } className="header">
                    {
                        mode === MODE.CREATE
                            ? <GSTrans
                                t={ `page.cashbook.receiptPaymentModal.title.${ type.toLowerCase() }.create` }/>
                            : stData.transactionCode
                    }
                </ModalHeader>
                <ModalBody className="body" style={ {
                    maxHeight: document.documentElement.clientHeight - 130,
                    overflowY: 'auto'
                } }>
                    <AvForm>
                        <Row>
                            <Col sm={ 6 }>
                                <span className="label required">
                                    <GSTrans
                                        t={ `page.cashbook.receiptPaymentModal.senderGroup.${ type.toLowerCase() }` }/>
                                </span>
                                <UikSelect
                                    required
                                    className={ isUpdateMode ? 'disabled' : '' }
                                    value={ [{ value: stData.senderRecipientGroup }] }
                                    options={ MEMO_FILTER_SENDER_RECIPIENT_GROUP_OPTIONS }
                                    onChange={ ({ value }) => handleChange(value, 'senderRecipientGroup') }
                                />
                            </Col>
                            <Col sm={ 6 }>
                                <span className="label required">
                                    <GSTrans
                                        t={ `page.cashbook.receiptPaymentModal.senderName.${ type.toLowerCase() }` }/>
                                </span>
                                { renderSenderName() }
                                {
                                    stErrors.senderRecipientId && stErrors.senderRecipientName &&
                                    <span
                                        className="error">{ stErrors.senderRecipientId || stErrors.senderRecipientName }</span>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={ 6 }>
                                { renderRevenueExpenseType() }
                            </Col>
                            <Col sm={ 6 }>
                                <span className="label required">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.branch"/>
                                </span>
                                <UikSelect
                                    required
                                    className={ isUpdateMode ? 'disabled' : '' }
                                    value={ [{ value: stData.branchId }] }
                                    options={ MEMO_FILTER_BRANCH_OPTIONS }
                                    onChange={ ({ label, value }) => {
                                        handleChange(value, 'branchId')
                                        handleChange(label, 'branchName')
                                    } }
                                />
                                {
                                    stErrors.branchId &&
                                    <span className="error">{ stErrors.branchId }</span>
                                }
                            </Col>
                        </Row>
                        <div className="indicator"/>
                        <Row>
                            <Col xs={ 6 }>
                                <span className="label required">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.amount"/>
                                </span>
                                <AvFieldCurrency
                                    key={ stReRenderAmount }
                                    className={ isUpdateMode ? 'disabled' : '' }
                                    parentClassName={ isUpdateMode ? 'disabled' : '' }
                                    name="amount"
                                    unit={ CredentialUtils.getStoreCurrencySymbol() }
                                    value={ CredentialUtils.getStoreCurrencySymbol() === Constants.CURRENCY.VND.SYMBOL ? 
                                        parseInt(stData.amount) : stData.amount }
                                    onBlur={ e => {
                                        let amount = e.currentTarget.value

                                        if (amount > 9999999999999) {
                                            amount = 9999999999999
                                        }

                                        handleChange(amount, 'amount')
                                        setStReRenderAmount(render => !render)
                                    } }
                                    position={CurrencyUtils.isPosition(CredentialUtils.getStoreCurrencySymbol())}
                                    precision={CurrencyUtils.isCurrencyInput(CredentialUtils.getStoreCurrencySymbol()) && '2'}
                                    decimalScale={CurrencyUtils.isCurrencyInput(CredentialUtils.getStoreCurrencySymbol()) && 2}
                                />
                                {
                                    stErrors.amount &&
                                    <span className="error">{ stErrors.amount }</span>
                                }
                            </Col>
                            <Col xs={ 6 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.paymentMethod"/>
                                </span>
                                <UikSelect
                                    className={ isUpdateMode ? 'disabled' : '' }
                                    value={ [{ value: stData.paymentMethod }] }
                                    options={ MEMO_FILTER_PAYMENT_METHOD_OPTIONS }
                                    onChange={ ({ value }) => handleChange(value, 'paymentMethod') }
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={ 12 }>
                                <span className="label">
                                    <GSTrans t="page.cashbook.receiptPaymentModal.note"/>
                                </span>
                                <AvFieldCountable
                                    className={ isUpdateMode ? 'disabled' : '' }
                                    name="note"
                                    type="textarea"
                                    rows={ 3 }
                                    maxLength={ 100 }
                                    defaultValue={ stData.note }
                                    value={stData.note}
                                    placeholder={ i18next.t('page.cashbook.receiptPaymentModal.inputNote') }
                                    onChange={ e => handleChange(e.currentTarget.value, 'note') }
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={ 12 }>
                                <UikCheckbox
                                    name="accounting"
                                    className={ isUpdateMode && !stData.amount ? 'disabled' : '' }
                                    label={ i18next.t('page.cashbook.receiptPaymentModal.accounting') }
                                    onChange={ e => handleChange(e.currentTarget.checked, 'accounting') }
                                    color="blue"
                                    defaultChecked={ stData.accounting }/>
                                {
                                    stData.isAuto && (stData.returnOrderId || stData.orderId) &&
                                    <div className="comment">
                                        {type === TYPE.RECEIPT ?
                                            <GSTrans t="page.cashbook.receiptPaymentModal.comment"/>
                                            :
                                            <GSTrans t="page.cashbook.receiptPaymentModal.commentPayment"/>
                                        }&nbsp;
                                        <a href={ stData.returnOrderId ? `/order/return-order/wizard/${ stData.returnOrderId }`
                                            :
                                            ( stData.orderType === 'BOOKING' ? `/reservation/detail/${ stData.orderId }`:
                                            `/order/detail/gosell/${ stData.orderId }`)}
                                           target="_blank">
                                            <GSTrans t="page.cashbook.receiptPaymentModal.viewOriginal"/>
                                        </a>
                                    </div>
                                }
                            </Col>
                        </Row>
                    </AvForm>
                </ModalBody>
                <ModalFooter className="footer">
                    <GSButton onClick={ handleCancel }>
                        <GSTrans t="common.btn.cancel"/>
                    </GSButton>
                    <GSButton key={stEditing + '-' + stDisabledSaveBtn} disabled={ stDisabledSaveBtn || !stEditing } success onClick={ handleSave }>
                        <GSTrans t="common.btn.save"/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        </>
    )
}

CashbookReceiptPaymentModal.defaultProps = {
    toggle: function () {
    },
    type: TYPE.RECEIPT,
    mode: MODE.CREATE,
    defaultValue: {
        id: undefined,
        senderRecipientGroup: SENDER_RECIPIENT_GROUP.CUSTOMER,
        senderRecipientId: undefined,
        senderRecipientName: undefined,
        revenueType: undefined,
        expenseType: undefined,
        paymentMethod: PAYMENT_METHOD.CASH,
        branchId: undefined,
        branchName: undefined,
        amount: 0,
        note: undefined,
        accounting: true,
        isAuto: false,
        orderType: undefined
    },
    onSave: function () {
    }
}

CashbookReceiptPaymentModal.propTypes = {
    modal: bool,
    toggle: func,
    type: oneOf(Object.values(TYPE)),
    mode: oneOf(Object.values(MODE)),
    defaultValue: shape({
        id: number,
        transactionCode: string,
        senderRecipientGroup: oneOf(Object.values(SENDER_RECIPIENT_GROUP)),
        senderRecipientId: number,
        senderRecipientName: string,
        revenueType: oneOf(Object.values(REVENUE_TYPE)),
        expenseType: oneOf(Object.values(EXPENSE_TYPE)),
        paymentMethod: oneOf(Object.values(PAYMENT_METHOD)),
        branchId: number,
        branchName: string,
        amount: number,
        note: string,
        accounting: bool,
        isAuto: bool,
        orderId: oneOfType([number, string]),
        orderType: string
    }),
    onSave: func
}

CashbookReceiptPaymentModal.TYPE = TYPE
CashbookReceiptPaymentModal.MODE = MODE

export default CashbookReceiptPaymentModal
