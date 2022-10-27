import React, {useEffect, useRef, useState} from 'react'
import './AffiliateTransferWizard.sass'
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
import affiliateService from '../../../../services/AffiliateService'
import {NavigationPath} from '../../../../config/NavigationPath'
import {ItemUtils} from '../../../../utils/item-utils'
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format'
import GSDiscountLabel from '../../../../components/shared/GSDiscountLabel/GSDiscountLabel'
import ViewIMEISerialLabel
    from '../../../../components/shared/managedInventoryModal/IMEISerialLabel/ViewIMEISerialLabel'
import GSComponentTooltip from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";

const HEADER = {
    SKU: 'SKU',
    PRODUCT_NAME: i18next.t('page.transferFormEditor.table.productName'),
    PRICE: i18next.t('page.affiliateTransferFormEditor.table.price'),
    INVENTORY: i18next.t('page.transferFormEditor.table.inventory'),
    QUANTITY: i18next.t('page.affiliateTransferFormEditor.table.quantity'),
    TOTAL_PRICE: i18next.t('page.affiliateTransferFormEditor.table.totalPrice'),
    COMMISSION_AMOUNT: i18next.t('page.affiliateTransferFormEditor.table.commissionAmount')
}

const HISTORY_HEADERS = {
    date: i18next.t('page.transfer.stock.history.column.date'),
    staff: i18next.t('page.transfer.stock.history.column.staff'),
    action: i18next.t('page.transfer.stock.history.column.action'),
    note: i18next.t('page.transfer.stock.history.column.note')
}
const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const AffiliateTransferWizard = props => {
    const transferId = props.match.params.transferId

    const initialState = {
        isLoading: true,
        onRedirect: false,
        isSaving: false,
        actionToggle: false,
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
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    const refConfirmModal = useRef(null)

    let reasonNote = ''

    useEffect(() => {
        if (!transferId) {
            return
        }

        fetchTransfer(transferId)
    }, [transferId])

    useEffect(() => {
        if(STORE_CURRENCY_SYMBOL !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    },[])

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

    const fetchTransfer = (transferId) => {
        return ItemService.getTransferById(transferId)
            .then(data => {
                if (!data) {
                    return
                }

                data.stage = Constants.TRANSFER_STAGE[data.status]
                checkTransferPermission(data.originBranchId, data.destinationBranchId)

                //Transfer to partner
                const resellerStoreId = data.resellerStoreId

                return Promise.all([
                    affiliateService.getActiveOrderPackageByStoreId(Constants.AFFILIATE_SERVICE_TYPE.RESELLER),
                    affiliateService.getPartnerByResellerStoreIdAndType(resellerStoreId, Constants.AFFILIATE_PARTNER_TYPE.RESELLER),
                    storeService.getStoreBranches(),
                    storeService.getStoreBranches(resellerStoreId),
                    data
                ])
            })
            .then(([activeOrder, partner, sellerStoreBranches, resellerStoreBranches, transfer]) => {
                if (!activeOrder) {
                    RouteUtils.redirectWithoutReload(props, NavigationPath.transferStock)
                    return
                }

                const originBranch = sellerStoreBranches?.find(b => b.id === transfer.originBranchId) || {}
                const destinationBranch = resellerStoreBranches?.find(b => b.id === transfer.destinationBranchId) || {}
                transfer.originBranchName = originBranch?.name
                transfer.destinationName = partner?.name
                transfer.partnerBranchName = destinationBranch?.name
                transfer.items.forEach(i => {
                    // fix representation error or roundoff error
                    i.totalPrice = (i.quantity * i.price * 10) / 10
                    i.commissionAmount = i.totalPrice * i.commissionRate / 100
                })
                updateState({ transfer: transfer, items: transfer.items })
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

    const processHandleError = (e) => {
        const itemIds = []
        const itemList = e.response?.data?.itemList

        switch (e.response?.data?.title) {
            case 'codeListSizeNotEqualsQuantity':
                itemIds.push(...itemList)

                setState(st => ({
                    ...st,
                    items: st.items.map(p => {
                        if (_.includes(itemIds, p.id)) {
                            p.error = true
                        }

                        return p
                    })
                }))

                return Promise.reject(i18next.t('component.managedInventoryModal.error.exceed'))
            case 'codeListDuplicate':
                itemIds.push(...itemList.map(i => parseInt(Object.keys(i)[0])))

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
            ItemService.transferAffiliateShipGoods(transferId)
                .then(() => {
                    GSToast.commonUpdate()
                    return fetchTransfer(transferId)
                })
                .catch((e) => {
                    GSToast.commonError()
                })
                .finally(() => setState(value => ({ ...value, isLoading: false })))
            return
        }

        if (state.transfer.stage === Constants.TRANSFER_STAGE.DELIVERING) {
            ItemService.transferAffiliateReceivedGoods(transferId)
                .then(() => {
                    GSToast.commonUpdate()
                    return fetchTransfer(transferId)
                })
                .catch(e => {
                    return processHandleError(e)
                })
                .catch(e => {
                    if (_.isString(e)) {
                        GSToast.error(e)
                    } else {
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
        RouteUtils.redirectWithoutReload(props, NAV_PATH.partnerTransferStockEdit + '/' + transferId)
    }

    const onChangeNote = (e) => {
        const { value } = e.target
        reasonNote = value
    }

    const getTransferHistory = async () => {
        try {
            const data = await ItemService.getTransferHistory(transferId)
            updateState({ histories: data })
        } catch (error) {
            console.log('error to get transfer history by id ' + transferId)
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
                    ItemService.cancelAffiliateTransferById(transferId, reasonNote)
                        .then(() => {
                            GSToast.commonUpdate()
                            RouteUtils.redirectWithoutReload(props, NAV_PATH.partnerTransferStock)
                        })
                        .catch(() => GSToast.commonError())
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
        console.log('on click show transfer history')
        const isShowModal = !isOpenHistory
        if (isShowModal) {
            getTransferHistory()
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
                            <span className="pl-2">
                                <GSTrans t="page.transfer.stock.partner.progressing">
                                    <a href={ NAV_PATH.partnerTransferStockWizard + '/' + transferId }></a>
                                </GSTrans>
                            </span>
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
            if (hasDestPermission === false) {
                return [{
                    label: i18next.t('page.transfer.stock.action.edit'),
                    hidden: state.transfer.stage > Constants.TRANSFER_STAGE.READY_FOR_TRANSPORT,
                    disabled: state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM,
                    onAction: actionEdit
                }]
            }

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
                    <GSComponentTooltip
                        message={item.sku}
                        placement={ GSTooltip.PLACEMENT.BOTTOM }
                    >
                        <div className="text-uppercase col-link-data"
                             onClick={ () => onClickOpenProduct(item.itemId) }>
                            { _.isEmpty(item.sku) ? <span className="empty-value"/> : item.sku }
                        </div>
                    </GSComponentTooltip>
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
                <td>
                    {
                        state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM
                            ? <i className="fa fa-spinner fa-spin "></i>
                            : <>
                                <span>{ CurrencyUtils.formatDigitMoneyByCustom(item.price, STORE_CURRENCY_SYMBOL, stDefaultPrecision) }</span>
                                <GSDiscountLabel 
                                    color={
                                        item.commissionRate > 0
                                            ? GSDiscountLabel.COLOR.BLUE
                                            : GSDiscountLabel.COLOR.YELLOW
                                    }
                                    precision = {stDefaultPrecision}
                                >
                                    { item.commissionRate }
                                </GSDiscountLabel>
                            </>
                    }

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
                    </div>
                </td>
                <td>
                    {
                        state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM
                            ? <i className="fa fa-spinner fa-spin "></i>
                            : CurrencyUtils.formatDigitMoneyByCustom(item.totalPrice, STORE_CURRENCY_SYMBOL, stDefaultPrecision)
                    }
                </td>
                <td>
                    { state.transfer.handlingDataStatus === Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM
                    ? <i className="fa fa-spinner fa-spin "></i>
                    : CurrencyUtils.formatDigitMoneyByCustom(item.commissionAmount, STORE_CURRENCY_SYMBOL, stDefaultPrecision)
                }</td>
            </tr>
        )
    }

    const renderTotalRow = () => {
        if (!state.items.length) {
            return
        }

        return (
            <>
                <div className="custom-row">
                    <td />
                    <td />
                    <td />
                    <td className="font-weight-bold">
                        <div className="text-right">
                            <GSTrans t="page.transfer.stock.table.column.total" />
                            :
                        </div>
                    </td>
                    <td>
                        <div className="d-flex h-100 align-items-center">
                            {NumberUtils.formatThousand(
                                state.items.reduce(
                                    (acc, curr) =>
                                        acc + parseInt(curr.quantity || 1),
                                    0
                                )
                            )}
                            &nbsp;
                            <GSTrans t="page.transferFormEditor.table.total.product" />
                        </div>
                    </td>
                </div>
                <div className="custom-row">
                    <td />
                    <td />
                    <td />
                    <td className="font-weight-bold">
                        <div className="text-right">
                            <GSTrans t="page.transfer.stock.table.column.totalAmount" />
                            {':'}
                        </div>
                    </td>
                    <td>
                        {state.transfer.handlingDataStatus ===
                        Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM ? (
                            <i className="fa fa-spinner fa-spin "></i>
                        ) : (
                            CurrencyUtils.formatDigitMoneyByCustom(
                                state.items.reduce(
                                    (acc, curr) =>
                                        (acc*10 + parseFloat(curr.totalPrice || 0)*10)/10,
                                    0
                                ),
                                STORE_CURRENCY_SYMBOL,
                                stDefaultPrecision
                            )
                        )}
                    </td>
                </div>
                <div className="custom-row">
                    <td />
                    <td />
                    <td />
                    <td className="font-weight-bold">
                        <div className="text-right">
                            <GSTrans t="page.transfer.stock.table.column.totalCommission" />
                            :
                        </div>
                    </td>
                    <td>
                        {state.transfer.handlingDataStatus ===
                        Constants.TRANSFER_HANDLING_STATUS.CREATING_ITEM ? (
                            <i className="fa fa-spinner fa-spin "></i>
                        ) : (
                            CurrencyUtils.formatDigitMoneyByCustom(
                                state.items.reduce((acc, curr) => acc + parseFloat(curr.commissionAmount || 0), 0), STORE_CURRENCY_SYMBOL, stDefaultPrecision
                            )
                        )}
                    </td>
                </div>
            </>
        );
    }

    return (
        <div className="d-flex justify-content-between w-100">
            <GSContentContainer confirmWhenRedirect={ false } className="affiliate-transfer-wizard-form__container"
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
                                            <th>{ HEADER.SKU }</th>
                                            <th>{ HEADER.PRODUCT_NAME }</th>
                                            <th>{ HEADER.PRICE }</th>
                                            <th>{ HEADER.INVENTORY }</th>
                                            <th>{ HEADER.QUANTITY }</th>
                                            <th>{ HEADER.TOTAL_PRICE }</th>
                                            <th>{ HEADER.COMMISSION_AMOUNT }</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            state.items.map(item => {
                                                return renderData(item)
                                            })
                                        }
                                        </tbody>
                                    </GSTable>
                                </div>
                                {
                                    renderTotalRow()
                                }
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

AffiliateTransferWizard.propTypes = {}

export default AffiliateTransferWizard
