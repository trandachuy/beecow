import React, {useEffect, useRef, useState} from 'react'
import './TransferWizard.sass'
import {Trans} from 'react-i18next'
import {UikWidget, UikWidgetContent, UikWidgetHeader} from '../../../../@uik'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import AvForm from 'availity-reactstrap-validation/lib/AvForm'
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import {Label, Modal, ModalBody, ModalHeader} from 'reactstrap'
import i18next from 'i18next'
import moment from 'moment'
import GSTable from '../../../../components/shared/GSTable/GSTable'
import GSProgressBar from '../../../../components/shared/GSProgressBar/GSProgressBar'
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal'
import {RouteUtils} from '../../../../utils/route'
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import {ItemService} from '../../../../services/ItemService'
import {GSToast} from '../../../../utils/gs-toast'
import storeService from '../../../../services/StoreService'
import _ from 'lodash'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import {ImageUtils} from '../../../../utils/image'
import Constants from '../../../../config/Constant'
import {TokenUtils} from '../../../../utils/token'
import GSDropdownAction from '../../../../components/shared/GSDropdownAction/GSDropdownAction'
import {ItemUtils} from '../../../../utils/item-utils'
import {NumberUtils} from '../../../../utils/number-format'
import ViewIMEISerialLabel
    from '../../../../components/shared/managedInventoryModal/IMEISerialLabel/ViewIMEISerialLabel'

const TransferWizard = props => {

    const HEADERS = {
        sku: i18next.t('page.transfer.stock.table.column.sku'),
        name: i18next.t('page.transfer.stock.table.column.name'),
        inventory: i18next.t('page.transfer.stock.table.column.inventory'),
        transferStock: i18next.t('page.transfer.stock.table.column.transferQuality')
    }

    const HISTORY_HEADERS = {
        date: i18next.t('page.transfer.stock.history.column.date'),
        staff: i18next.t('page.transfer.stock.history.column.staff'),
        action: i18next.t('page.transfer.stock.history.column.action'),
        note: i18next.t('page.transfer.stock.history.column.note')
    }

    const initialState = {
        isLoading: true,
        onRedirect: false,
        isSaving: false,
        actionToggle: false,
        transferId: null,
        branches: [],
        transfer: {
            id: '',
            originBranchId: 0,
            originBranchName: '',
            destinationBranchId: 0,
            destinationName: '',
            status: 'CANCELLED',
            stage: Constants.TRANSFER_STAGE.CANCELLED,
            note: '',
            storeId: 0,
            createdByStaffId: 0,
            createdBy: '',
            createdDate: new Date(),
            lastModifiedBy: '',
            lastModifiedDate: new Date()
        },
        items: [],
        histories: []
    }

    const [state, setState] = useState(initialState)

    const [isOpenHistory, setOpenHistory] = useState(false)
    const [hasOriginPermission, setHasOriginPermission] = useState(true)
    const [hasDestPermission, setHasDestPermission] = useState(true)

    const refConfirmModal = useRef(null)

    let reasonNote = ''

    useEffect(() => {
        fetchBranch()
        return () => {
        }
    }, [])

    useEffect(() => {
        if (!state.transferId) {
            return
        }

        fetchTransfer(state.transferId)
    }, [state.transferId])

    const updateState = (objState) => {
        setState({
            ...state,
            ...objState
        })
    }

    const checkTransferPermission = async (originBranchId, destBranchId) => {
        try {
            if (!TokenUtils.isStaff()) return
            const hasOriginBranch = await storeService.checkStaffPermissionOnBranch(originBranchId)
            const hasDestBranch = await storeService.checkStaffPermissionOnBranch(destBranchId)
            if (_.isEmpty(hasOriginBranch)) {
                setHasOriginPermission(false)
            }
            if (_.isEmpty(hasDestBranch)) {
                setHasDestPermission(false)
            }
        } catch (error) {
            console.log('check branch permission is fail ', error)
            setHasOriginPermission(false)
        }
    }

    const fetchBranch = async () => {
        let branches = []
        try {
            branches = await storeService.getStoreBranches()
        } catch (e) {
            console.log('error to load branch in transfer wizard ', e)
            GSToast.commonError()
        } finally {
            const { transferId } = props.match.params
            updateState({ transferId: transferId, branches: branches })
        }
    }

    const fetchTransfer = (transferId) => {
        return ItemService.getTransferById(transferId)
            .then(data => {
                if (!data) {
                    return
                }

                data.stage = Constants.TRANSFER_STAGE[data.status]
                checkTransferPermission(data.originBranchId, data.destinationBranchId)

                if (state.branches.length) {
                    //Transfer to branch
                    const originBranch = state.branches.find(b => b.id === data.originBranchId) || {}
                    const destinationBranch = state.branches.find(b => b.id === data.destinationBranchId) || {}
                    data.originBranchName = originBranch.name
                    data.destinationName = destinationBranch.name
                    data.handlingDataStatus = Constants.TRANSFER_HANDLING_STATUS.DONE

                    updateState({ transfer: data, items: data.items || [] })
                }
            })
            .catch(e => {
                if (e.response && e.response.status === 404) {
                    RouteUtils.toNotFound(props)
                } else {
                    GSToast.commonError()
                }
            })
            .finally(() => setState(value => ({ ...value, isLoading: false })))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
    }

    const processValidate = () => {
        return Promise.resolve()
            .then(() => {
                let error = false

                const selectedProducts = state.items.map(p => {
                    if (Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER === p.inventoryManageType) {
                        if (p.codeList.length < p.quantity) {
                            p.error = true
                            error = true
                        }
                    }

                    return p
                })

                if (error) {
                    setState(st => ({ ...st, items: selectedProducts }))
                    return Promise.reject(i18next.t('component.managedInventoryModal.error.exceed'))
                }
            })
    }

    const processHandleError = (e) => {
        const itemList = e.response?.data?.itemList

        switch (e.response?.data?.title) {
            case 'codeListSizeNotEqualsQuantity':
                setState(st => ({
                    ...st,
                    items: st.items.map(p => {
                        if (_.includes(itemList, p.id)) {
                            p.error = true
                        }

                        return p
                    })
                }))

                return Promise.reject(i18next.t('component.managedInventoryModal.error.exceed'))
            case 'codeListDuplicate':
                const itemIds = [...itemList.map(i => parseInt(Object.keys(i)[0]))]

                setState(st => ({
                    ...st,
                    items: st.items.map(p => {
                        if (_.includes(itemIds, p.itemId)) {
                            p.error = true
                        }

                        return p
                    })
                }))

                return Promise.reject(i18next.t('component.managedInventoryModal.error.exist.text', { value: `{${ Object.values(itemList[0])[0] }}` }))
            case 'invalidQuantity':
                setState(st => ({
                    ...st,
                    items: st.items.map(p => {
                        if (_.includes(itemList, String(p.itemId))) {
                            p.inlineError = i18next.t('page.transferFormEditor.error.invalidQuantity')
                        }

                        return p
                    })
                }))

                return Promise.reject()
            default:
                return Promise.reject(e)
        }
    }

    const processHandleCancelError = (e) => {
        const itemList = e.response?.data?.itemList

        switch (e.response?.data?.title) {
            case 'invalidQuantity':
                setState(st => ({
                    ...st,
                    items: st.items.map(p => {
                        if (_.includes(itemList, String(p.itemId))) {
                            p.inlineError = i18next.t('page.transferFormEditor.error.cancel.invalidQuantity')
                        }

                        return p
                    })
                }))

                return Promise.reject()
            default:
                return Promise.reject(e)
        }
    }

    const onClickNext = () => {
        if (state.transfer.handlingDataStatus !== Constants.TRANSFER_HANDLING_STATUS.DONE) {
            return
        }

        setState(value => ({ ...value, isLoading: true }))

        if (state.transfer.stage === Constants.TRANSFER_STAGE.READY_FOR_TRANSPORT) {
            ItemService.transferShipGoods(state.transferId)
                .then(() => {
                    GSToast.commonUpdate()
                    return fetchTransfer(state.transferId)
                })
                .catch((e) => {
                    GSToast.commonError()
                })
                .finally(() => setState(value => ({ ...value, isLoading: false })))
            return
        }

        if (state.transfer.stage === Constants.TRANSFER_STAGE.DELIVERING) {
            processValidate()
                .then(() => ItemService.transferReceivedGoods(state.transferId))
                .then(() => {
                    GSToast.commonUpdate()
                    return fetchTransfer(state.transferId)
                })
                .catch(processHandleError)
                .catch(e => {
                    if (_.isString(e)) {
                        GSToast.error(e)
                    } else if (e) {
                        GSToast.commonError(e)
                    }
                })
                .finally(() => setState(value => ({ ...value, isLoading: false })))

            return
        }
    }

    const toggleAction = (toggle) => {
        updateState({
            actionToggle: toggle
        })
    }

    const actionEdit = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.transferStockEdit + '/' + state.transferId)
    }

    const onChangeNote = (e) => {
        const { value } = e.target
        reasonNote = value
    }

    const getTranferHistory = async () => {
        try {
            const data = await ItemService.getTransferHistory(state.transferId)
            updateState({ histories: data })
        } catch (error) {
            console.log('error to get transfer history by id ' + state.transferId)
            GSToast.commonError()
        }
    }

    const renderConfirmBody = () => {
        return (
            <div className="d-flex flex-column mt-2 mb-2 align-items-center">
                <div style={ { paddingBottom: '0.5rem' } }>
                    <GSTrans t="page.transfer.stock.confirm.cancel.body"></GSTrans>
                </div>
                <textarea
                    autofocus={ true }
                    spellcheck={ false }
                    placeholder={ i18next.t('page.transfer.stock.confirm.cancel.hint') }
                    className={ 'transfer-wizard-cancel-note' }
                    name={ 'reasonNote' }
                    rows={ 5 }
                    cols={ 40 }
                    maxLength={ 120 }
                    defaultValue={ reasonNote }
                    onKeyUp={ onChangeNote }
                ></textarea>
            </div>
        )
    }

    const actionCancel = () => {
        if (refConfirmModal.current && state.transfer.stage < Constants.TRANSFER_STAGE.RECEIVED) {
            refConfirmModal.current.openModal({
                modalClass: 'transfer-wizard-cancel-modal',
                modalTitle: i18next.t('page.transfer.stock.confirm.cancel.title'),
                messageHtml: true,
                classNameHeader: 'modal-danger',
                typeBtnOk: {
                    danger: true
                },
                messages: renderConfirmBody(),
                okCallback: function () {
                    const transferId = state.transferId

                    ItemService.cancelTransferById(transferId, reasonNote)
                        .then(() => {
                            GSToast.commonUpdate()
                            RouteUtils.redirectWithoutReload(props, NAV_PATH.transferStock)
                        })
                        .catch(processHandleCancelError)
                        .catch(e => {
                            if (_.isString(e)) {
                                GSToast.error(e)
                            } else if (e) {
                                GSToast.commonError(e)
                            }
                        })
                },
                cancelCallback: () => {
                    reasonNote = ''
                }
            })
        }
    }

    const getTextNextButton = () => {
        if (state.transfer.stage === 3) {
            return 'page.transfer.stock.button.received'
        }
        return 'page.transfer.stock.button.ready'
    }

    const onClickHistory = () => {
        const isShowModal = !isOpenHistory
        if (isShowModal) {
            getTranferHistory()
        }
        setOpenHistory(isShowModal)
    }

    const onClickOpenProduct = (itemId) => {
        const openProductUrl = NAV_PATH.productEdit + `/${ itemId }`
        RouteUtils.openNewTab(openProductUrl)
    }

    const renderHeader = () => {
        return (
            <GSContentHeader>
                <div className="d-flex flex-column w-100">
                    <div className="transfer-toolbar">
                        <div
                            className={ ['group-action', state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM ? 'disabled' : ''].join(' ') }>
                            <h5 class="gs-page-title">{ state.transfer.id }</h5>
                            { renderAction() }
                        </div>
                        <div className="custom-progress-bar">
                            <GSProgressBar
                                currentStep={
                                    state.transfer.stage === Constants.TRANSFER_STAGE.CANCELLED
                                        ? Constants.TRANSFER_STAGE[state.transfer.statusAtCancel]
                                        : state.transfer.stage
                                }
                                isCancelledStage={ state.transfer.stage === Constants.TRANSFER_STAGE.CANCELLED }
                                cancelledRemovableStage={ Constants.TRANSFER_STAGE.RECEIVED }
                                steps={ Constants.TRANSFER_STEP }
                            />
                        </div>
                        <div className={ [
                            'group-button',
                            state.transfer.handlingDataStatus !== Constants.TRANSFER_HANDLING_STATUS.DONE ? 'disabled' : ''
                        ].join(' ') }>
                            {/* BUTTON SAVE */ }
                            <GSButton success
                                      hidden={ state.transfer.stage === Constants.TRANSFER_STAGE.RECEIVED ||
                                      state.transfer.stage === Constants.TRANSFER_STAGE.CANCELLED ||
                                      state.items.length === 0 || hasOriginPermission === false }
                                      marginLeft
                                      className={ 'btn-save' }
                                      onClick={ onClickNext }>
                                <Trans i18nKey={ getTextNextButton() } className="sr-only">
                                    Ship Goods
                                </Trans>
                            </GSButton>
                        </div>
                    </div>
                    {
                        state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM &&
                        <div className="progressing">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                 fill="currentColor" className="bi bi-arrow-repeat gs-ani__rotate"
                                 viewBox="0 0 16 16">
                                <path
                                    d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                <path fill-rule="evenodd"
                                      d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                            </svg>
                            <span className="pl-2"
                                  dangerouslySetInnerHTML={ { __html: i18next.t('page.transfer.stock.partner.progressing') } }/>
                        </div>
                    }
                    {
                        state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.ERROR &&
                        <div className="error">
                            <GSImg src="/assets/images/icon_error.svg"/>
                            <span className="pl-2"
                                  dangerouslySetInnerHTML={ { __html: i18next.t('page.transfer.stock.partner.error') } }/>
                        </div>
                    }
                </div>
            </GSContentHeader>
        )
    }

    const renderAction = () => {
        if (state.transfer.stage === Constants.TRANSFER_STAGE.RECEIVED ||
            state.transfer.stage === Constants.TRANSFER_STAGE.CANCELLED ||
            state.items.length === 0 || hasOriginPermission === false) {
            return (<></>)
        }

        const renderActions = () => {
            // if (hasDestPermission === false) {
            //     return [{
            //         label: i18next.t('page.transfer.stock.action.edit'),
            //         hidden: state.transfer.stage > Constants.TRANSFER_STAGE.READY_FOR_TRANSPORT,
            //         disabled: state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM,
            //         onAction: actionEdit
            //     }]
            // }
            return [{
                label: i18next.t('page.transfer.stock.action.edit'),
                hidden: state.transfer.stage > Constants.TRANSFER_STAGE.READY_FOR_TRANSPORT,
                disabled: state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM,
                onAction: actionEdit
            }, {
                label: i18next.t('page.transfer.stock.action.cancel'),
                hidden: state.transfer.stage > Constants.TRANSFER_STAGE.RECEIVED,
                disabled: state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM,
                onAction: actionCancel
            }]
        }

        return (
            <div className="selected-product d-flex mt-3 font-weight-500 gsa__uppercase font-size-_9em">
                <GSDropdownAction
                    toggle={ state.actionToggle }
                    onToggle={ toggleAction }
                    actions={ renderActions() }
                />
            </div>
        )
    }

    const renderData = (item) => {
        return (
            <tr key={ item.id } className="row-align-item">
                <td className="vertical-align-baseline">
                    <div className="col-data text-uppercase col-link-data"
                         onClick={ () => onClickOpenProduct(item.itemId) }>
                        { _.isEmpty(item.sku) ? <span className="empty-value"/> : item.sku }
                    </div>
                </td>
                <td>
                    <div className="col-data">
                        <div className="product-image">
                            <GSImg src={ ImageUtils.getImageFromImageModel(item.image) }
                                   width={ 70 } height={ 70 }/>
                        </div>
                        <div className="d-flex flex-column ml-3">
                            <span className="product-name line-clamp-2">
                              { item.itemName }
                            </span>
                            {
                                item.modelId && <span className="font-size-_8rem white-space-pre">{
                                    ItemUtils.buildFullModelName(item.modelLabel, item.modelValue)
                                }</span>
                            }
                        </div>
                    </div>
                </td>
                <td className="vertical-align-baseline">
                    <div className="col-data">
                        { NumberUtils.formatThousand(item.remaining) }
                    </div>
                </td>
                <td className="vertical-align-baseline">
                    <div className="d-flex flex-column">
                        { NumberUtils.formatThousand(item.quantity) }
                        <ViewIMEISerialLabel
                            hidden={ item.inventoryManageType !== Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER }
                            itemModelCodes={ item.codeList }
                        />
                        {
                            item.inlineError && <span className="error">{ item.inlineError }</span>
                        }
                    </div>
                </td>
            </tr>
        )
    }

    return (
        <div className="d-flex justify-content-between w-100">
            <GSContentContainer confirmWhenRedirect={ false } className="transfer-wizard-form__container"
                                isLoading={ state.isLoading }>
                { renderHeader() }
                <GSContentBody className="transfer-wizard-container">
                    <AvForm onValidSubmit={ handleSubmit } autoComplete="off" className="transfer-wizard-editor">
                        {/*TRANSFER ITEM*/ }
                        <UikWidget className={ 'gs-widget' }>
                            <UikWidgetContent className="d-flex flex-column">
                                <div className="table table-header-fix">
                                    <GSTable>
                                        <thead>
                                        <tr>
                                            <th>{ HEADERS.sku }</th>
                                            <th>{ HEADERS.name }</th>
                                            <th>{ HEADERS.inventory }</th>
                                            <th>{ HEADERS.transferStock }</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            state.items.map(item => {
                                                return renderData(item)
                                            })
                                        }
                                        </tbody>
                                        <tfoot hidden={ state.items.length === 0 }>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th>
                                                { i18next.t('page.transfer.stock.table.column.total') }
                                            </th>
                                            <th
                                                className="text-lowercase font-weight-normal"
                                                style={ {
                                                    fontSize: '0.9rem'
                                                } }>
                                                <GSTrans
                                                    i18nKey={ 'page.transfer.stock.table.column.sumTotal' }
                                                    values={ {
                                                        total: NumberUtils.formatThousand(
                                                            state.items.map(i => i.quantity).reduce((t, v) => t + v, 0)
                                                        )
                                                    } }/>
                                            </th>
                                        </tr>
                                        </tfoot>
                                    </GSTable>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                    </AvForm>

                    {/*TRANSFER INFO*/ }
                    <div className="transfer-wizard-form__information">
                        <UikWidget className={ 'gs-widget' }>
                            <UikWidgetHeader
                                className={ 'widget__header widget__header--text-align-right text-uppercase' }>
                                <Trans i18nKey="page.transfer.stock.wizard.slip.info">
                                    Transfer Slip Information
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className="widget-content-baseline-header d-flex flex-md-column">
                                <div className="row mb-1">
                                    <div className="col-md-4 pl-0">
                                        <Label>
                                            { i18next.t('page.transfer.stock.info.status') }
                                        </Label>
                                    </div>
                                    <div className="col-md-7 pl-0">
                                        <Label className={ [
                                            'transfer-wizard_status',
                                            state.transfer.stage === Constants.TRANSFER_STAGE.CANCELLED ? 'cancelled' : ''
                                        ].join(' ') }>
                                            { (state.transfer.stage === Constants.TRANSFER_STAGE.CANCELLED) ?
                                                i18next.t(`progress.bar.transfer.status.cancel`)
                                                : i18next.t(`progress.bar.step.${ Constants.TRANSFER_STEP[state.transfer.stage - 1] }`) }
                                        </Label>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-md-4 pl-0">
                                        <Label>
                                            { i18next.t('page.transfer.stock.info.origin') }
                                        </Label>
                                    </div>
                                    <div className="col-md-7 pl-0">
                                        <Label
                                            className={ 'transfer-wizard-form_max-width line-clamp-2' }
                                            title={ state.transfer.originBranchName }>
                                            { state.transfer.originBranchName }
                                        </Label>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-md-4 pl-0">
                                        <Label>
                                            { i18next.t('page.transfer.stock.info.destination') }
                                        </Label>
                                    </div>
                                    <div className="col-md-7 pl-0">
                                        <Label
                                            className={ 'transfer-wizard-form_max-width line-clamp-2' }
                                            title={ state.transfer.destinationName }>
                                            { state.transfer.destinationName }
                                        </Label>
                                    </div>
                                </div>
                                {
                                    state.transfer.partnerBranchName && <div className="row mb-1">
                                        <div className="col-md-4 pl-0">
                                            <Label>
                                                { i18next.t('page.transfer.stock.info.branch') }
                                            </Label>
                                        </div>
                                        <div className="col-md-7 pl-0">
                                            <Label
                                                className={ 'transfer-wizard-form_max-width line-clamp-2' }
                                                title={ state.transfer.partnerBranchName }>
                                                { state.transfer.partnerBranchName }
                                            </Label>
                                        </div>
                                    </div>
                                }
                                <div className="row mb-1">
                                    <div className="col-md-4 pl-0">
                                        <Label>
                                            { i18next.t('page.transfer.stock.info.createdDate') }
                                        </Label>
                                    </div>
                                    <div className="col-md-7 pl-0">
                                        <Label>
                                            { moment(state.transfer.createdDate).format('HH:mm:ss') }
                                            &nbsp; &nbsp;
                                            { moment(state.transfer.createdDate).format('YYYY-MM-DD') }
                                        </Label>
                                    </div>
                                </div>
                                <div className="row mb-1">
                                    <div className="col-md-4 pl-0">
                                        <Label>
                                            { i18next.t('page.transfer.stock.info.createdBy') }
                                        </Label>
                                    </div>
                                    <div className="col-md-7 pl-0">
                                        <Label className={ 'transfer-wizard-form_max-width line-clamp-2' }>
                                            { state.transfer.staffName }
                                        </Label>
                                    </div>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <UikWidget className={ 'gs-widget' }>
                            <UikWidgetHeader
                                className={ 'widget__header widget__header--text-align-right text-uppercase' }>
                                <Trans i18nKey="page.transfer.stock.wizard.note">
                                    Note
                                </Trans>
                            </UikWidgetHeader>
                            <UikWidgetContent className="widget-content-baseline-header d-flex flex-md-column">
                                <div className="row p-0 m-0">
                                    <Label
                                        className={ 'transfer-wizard-form_max-width' }
                                        title={ state.transfer.note }>
                                        { state.transfer.note }
                                    </Label>
                                </div>
                            </UikWidgetContent>
                        </UikWidget>
                        <UikWidget className={ 'gs-widget' }>
                            <UikWidgetHeader
                                className={ 'widget__header widget__header--text-align-right text-capitalize' }>
                                <div className="transfer-wizard_history" onClick={ onClickHistory }>
                                    { i18next.t('page.transfer.stock.wizard.history') }
                                </div>
                            </UikWidgetHeader>
                        </UikWidget>
                    </div>
                </GSContentBody>
            </GSContentContainer>
            <Modal wrapClassName="transfer-history-modal" isOpen={ isOpenHistory }>
                <ModalHeader toggle={ onClickHistory }>
                    <Trans i18nKey="page.transfer.stock.wizard.history">
                        Transfer History
                    </Trans>
                </ModalHeader>
                <ModalBody>
                    <div>
                        <GSTable>
                            <thead>
                            <tr>
                                <th>{ HISTORY_HEADERS.date }</th>
                                <th>{ HISTORY_HEADERS.staff }</th>
                                <th>{ HISTORY_HEADERS.action }</th>
                                <th>{ HISTORY_HEADERS.note }</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                state.histories.map(history => {
                                    return (
                                        <tr key={ history.id } className="row-align-item">
                                            <td className="vertical-align-baseline">
                                                <div>
                                                    { moment(history.createdDate).format('HH:mm:ss') }
                                                </div>
                                                <div>
                                                    { moment(history.createdDate).format('YYYY-MM-DD') }
                                                </div>
                                            </td>
                                            <td className="vertical-align-baseline">
                                                <div>
                                                    { history.staffName }
                                                </div>
                                            </td>
                                            <td className="vertical-align-baseline">
                                                <div>
                                                    { i18next.t(`page.transfer.stock.history.status.${ history.status.toLowerCase() }`) }
                                                </div>
                                            </td>
                                            <td className="vertical-align-baseline">
                                                <div>
                                                    { history.note }
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </GSTable>
                    </div>
                </ModalBody>
            </Modal>
            <ConfirmModal ref={ (el) => {
                refConfirmModal.current = el
            } }/>
        </div>
    )
}

TransferWizard.propTypes = {}

export default TransferWizard
