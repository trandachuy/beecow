import './TransferFormEditor.sass'

import React, {useEffect, useRef, useState} from 'react'
import Loading from '../../../../components/shared/Loading/Loading'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader'
import i18next from 'i18next'
import GSContentHeaderRightEl
    from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import {Trans} from 'react-i18next'
import {RouteUtils} from '../../../../utils/route'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader'
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent'
import {UikSelect} from '../../../../@uik'
import GSTable from '../../../../components/shared/GSTable/GSTable'
import GSSearchInput from '../../../../components/shared/GSSearchInput/GSSearchInput'
import {SEARCH_BY_ENUM} from '../../ProductList/BarcodePrinter/ProductListBarcodePrinter'
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency'
import {FormValidate} from '../../../../config/form-validate'
import {Currency} from '../../../../components/shared/form/CryStrapInput/CryStrapInput'
import storeService from '../../../../services/StoreService'
import GSTooltip from '../../../../components/shared/GSTooltip/GSTooltip'
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal'
import {ItemService} from '../../../../services/ItemService'
import {GSToast} from '../../../../utils/gs-toast'
import useDebounceEffect from '../../../../utils/hooks/useDebounceEffect'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import Constants from '../../../../config/Constant'
import {NumberUtils} from '../../../../utils/number-format'
import GSFakeLink from '../../../../components/shared/GSFakeLink/GSFakeLink'
import {CredentialUtils} from '../../../../utils/credential'
import {withRouter} from 'react-router-dom'
import _ from 'lodash'
import {ImageUtils} from '../../../../utils/image'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import moment from 'moment'
import GSProgressBar from '../../../../components/shared/GSProgressBar/GSProgressBar'
import {TokenUtils} from '../../../../utils/token'
import AlertModal, {AlertModalType} from '../../../../components/shared/AlertModal/AlertModal'
import {ItemUtils} from '../../../../utils/item-utils'
import IMEISerialModal from '../../../../components/shared/managedInventoryModal/IMEISerialModal/IMEISerialModal'
import IMEISerialLabel from '../../../../components/shared/managedInventoryModal/IMEISerialLabel/IMEISerialLabel'

const HEADER = {
    SKU: 'SKU',
    PRODUCT_NAME: i18next.t('page.transferFormEditor.table.productName'),
    INVENTORY: i18next.t('page.transferFormEditor.table.inventory'),
    TRANSFERRED_QUANTITY: i18next.t('page.transferFormEditor.table.transferredQuantity'),
    UNIT: i18next.t('page.transfer.stock.table.column.unit')
}
const PRODUCT_PROP = {
    TRANSFERRED_STOCK: 'transferredStock'
}
const SEARCH_TYPE = {
    PRODUCT: {
        value: SEARCH_BY_ENUM.PRODUCT,
        label: i18next.t('inventoryList.tbheader.variationName')
    },
    BARCODE: {
        value: SEARCH_BY_ENUM.BARCODE,
        label: i18next.t('page.product.list.printBarCode.barcode')
    },
    SKU: {
        value: SEARCH_BY_ENUM.SKU,
        label: 'SKU'
    }
}
const TRANSFER_MODE = {
    CREATE: 'CREATE',
    EDIT: 'EDIT'
}
const SEARCH_PAGE_SIZE = 20

const HISTORY_HEADERS = {
    date: i18next.t('page.transfer.stock.history.column.date'),
    staff: i18next.t('page.transfer.stock.history.column.staff'),
    action: i18next.t('page.transfer.stock.history.column.action'),
    note: i18next.t('page.transfer.stock.history.column.note')
}
const TransferFormEditor = props => {

    const [stEditorMode, setStEditorMode] = useState(TRANSFER_MODE.CREATE)
    const [stAllowModify, setStAllowModify] = useState(true)
    const [stIsSearching, setStIsSearching] = useState(false)
    const [stIsSaving, setStIsSaving] = useState(false)
    const [stIsEdited, setStIsEdited] = useState(false)
    const [stSelectedOrigin, setStSelectedOrigin] = useState()
    const [stSelectedDestination, setStSelectedDestination] = useState()
    const [stOriginBranches, setStOriginBranches] = useState([])
    const [stBranches, setStBranches] = useState([])
    const [stStoreBranches, setStStoreBranches] = useState([])
    const [stDestinationBranches, setStDestinationBranches] = useState([])
    const [stHistories, setStHistories] = useState([])
    const [stOpenHistory, setStOpenHistory] = useState(false)
    const [stFilter, setStFilter] = useState({
        searchType: SEARCH_TYPE.PRODUCT,
        page: 0,
        size: SEARCH_PAGE_SIZE,
        total: 0,
        isScroll: false
    })
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stRerenderOrigin, setStRerenderOrigin] = useState(false)
    const [stRerenderDestination, setStRerenderDestination] = useState(false)
    const [stDestinationError, setStDestinationError] = useState()
    const [stEmptyError, setStEmptyError] = useState()
    const [stSearchResult, setStSearchResult] = useState()
    const [stNote, setStNote] = useState('')
    const [stTransfer, setStTransfer] = useState()
    const [stHasEditPermission, setStHasEditPermission] = useState(true)

    const refForm = useRef()
    const refConfirmModal = useRef()
    const refIsScrolled = useRef(false)
    const refSearchInput = useRef()
    const refAlertModal = useRef()

    useEffect(() => {
        const transferId = props.match?.params?.transferId
        const promises = [storeService.getStoreBranches()]

        if (transferId) {
            setStEditorMode(TRANSFER_MODE.EDIT)
            promises.push(ItemService.getTransferById(transferId))
        } else {
            promises.push(new Promise((resolve, reject) => {
                return resolve(null)
            }))
        }

        if (TokenUtils.isStaff()) {
            promises.push(storeService.getListActiveBranchOfStaff())
        }

        Promise.all(promises)
            .then(([storeBranch, transfer, staffBranch]) => {
                if (!storeBranch.length) {
                    return
                }

                const allBranchInStore = storeBranch.map(branch => ({
                    label: branch.name,
                    value: branch.id
                }))
                setStStoreBranches(allBranchInStore)

                let originBranches = []

                const destinationBranches = storeBranch
                    .filter(b => b.branchStatus === Constants.BRANCH_STATUS.ACTIVE)
                    .map(branch => ({
                        label: branch.name,
                        value: branch.id
                    }))

                if (TokenUtils.isStaff() && staffBranch) {
                    originBranches = staffBranch
                        .filter(b => b.branchStatus === Constants.BRANCH_STATUS.ACTIVE)
                        .map(branch => ({
                            label: branch.name,
                            value: branch.id
                        }))
                } else {
                    originBranches = storeBranch
                        .filter(b => b.branchStatus === Constants.BRANCH_STATUS.ACTIVE)
                        .map(branch => ({
                            label: branch.name,
                            value: branch.id
                        }))
                }

                setStBranches(allBranchInStore)
                setStOriginBranches(originBranches)
                setStSelectedOrigin(transfer?.originBranchId || originBranches[0].value)
                setStDestinationBranches(destinationBranches)

                if (transfer) {
                    let isAllowEdit = true
                    if ((stEditorMode === TRANSFER_MODE.EDIT) &&
                        (transfer.status > Constants.TRANSFER_STATUS.READY_FOR_TRANSPORT)) {
                        //not allow to edit transfer
                        isAllowEdit = false
                    }
                    const prodItems = !_.isEmpty(transfer.items) ? transfer.items.map(i => {
                        i.itemImage = ImageUtils.getImageFromImageModel(i.image)
                        if (isAllowEdit === true) {
                            //reapply transfer stock + remaining stock of
                            i.modelStock = i.remaining + i.quantity
                        } else {
                            //the transfer status have been done
                            i.modelStock = i.remaining
                        }
                        i.id = i.modelId ? (i.itemId + '-' + i.modelId) : i.itemId
                        i.savingCodeList = i.codeList

                        return i
                    }) : []
                    setStSelectedDestination(transfer.destinationBranchId)
                    setStNote(transfer.note)
                    setStSelectedProducts(prodItems)
                    setStTransfer(transfer)
                    setStAllowModify(isAllowEdit)
                    if (TokenUtils.isStaff()) {
                        storeService.checkStaffPermissionOnBranch(transfer.destinationBranchId).then((resp) => {
                            if (_.isEmpty(resp)) {
                                setStHasEditPermission(false)
                            }
                        })
                    }
                }
            })
            .catch(e => {
                if (e.response && e.response.status === 404) {
                    RouteUtils.toNotFound(props)
                } else {
                    GSToast.commonError()
                }
            })
    }, [])

    useDebounceEffect(() => {
        if (!stSelectedOrigin) {
            return
        }

        setStIsSearching(true)

        const { page, size, searchType, keyword, isScroll } = stFilter

        if (!isScroll) {
            setStSearchResult()
        }

        ItemService.getProductSuggestionByName(page, size, searchType.value, keyword, false, stSelectedOrigin, {
            ignoreOutOfStock: true,
            includeConversion: true,
            ignoreDeposit: true
        })
            .then(result => {
                const total = parseInt(result.headers['x-total-count'])
                const products = ItemUtils.sortByParentId(result.data)

                setStSearchResult(current => isScroll ? [...(current || []), ...products] : products)
                setStFilter(filter => ({
                    ...filter,
                    total
                }))
            })
            .catch(() => GSToast.commonError())
            .finally(() => {
                setStIsSearching(false)
                refIsScrolled.current = false
            })
    }, 500, [stFilter.searchType, stFilter.keyword, stFilter.page, stSelectedOrigin])

    const isValid = () => {
        setStDestinationError()
        setStEmptyError()

        if (!stSelectedDestination) {
            setStDestinationError(i18next.t('page.transferFormEditor.information.destination.error'))
            return false
        }
        if (!stSelectedProducts.length) {
            setStEmptyError(i18next.t('page.transferFormEditor.table.error.empty'))
            return false
        }

        return true
    }

    const getItemTransfers = (data) => {
        const transferredStockRegex = new RegExp(`(?:${PRODUCT_PROP.TRANSFERRED_STOCK})_([0-9]+)-?([0-9]*)`)

        return Object.keys(data)
            .filter(key => transferredStockRegex.test(key))
            .map(key => {
                const [, itemId, modelId] = key.match(transferredStockRegex)
                const quantity = data[key]
                const id = modelId ? itemId + '-' + modelId : itemId
                const item = stSelectedProducts.find(p => p.id == id)

                return {
                    itemId,
                    modelId: modelId,
                    quantity,
                    codeList: item?.savingCodeList,
                    inventoryManageType: item?.inventoryManageType
                }
            })
    }

    const processValidate = () => {
        return Promise.resolve()
            .then(() => {
                if (!isValid()) {
                    return Promise.reject()
                }
                if (stHasEditPermission === false) {
                    return Promise.reject(i18next.t('page.transferFormEditor.alert.no.permission'))
                }

                const { value } = stOriginBranches.find(i => +stSelectedOrigin === i.value) || {}

                if (TokenUtils.isStaff() && !_.isInteger(value)) {
                    refAlertModal.current.openModal({
                        messages: (
                            <GSTrans t={ 'page.transferFormEditor.alert.no.permission' }>
                                Your account doesn’t have permission to perform this action
                            </GSTrans>
                        ),
                        type: AlertModalType.ALERT_TYPE_DANGER
                    })

                    return Promise.reject()
                }

                let error = false
                const selectedProducts = stSelectedProducts.map(p => {
                    if (Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER === p.inventoryManageType) {
                        if (p.savingCodeList.length != p.quantity) {
                            p.error = true
                            error = true
                        }
                    }

                    return p
                })

                if (error) {
                    setStSelectedProducts(selectedProducts)
                    return Promise.reject(i18next.t('component.selectIMEISerialModal.error.less'))
                }
            })
    }

    const processHandleError = (e) => {
        const title = e?.response?.data?.title
        const itemList = e?.response?.data?.itemList

        switch (title) {
            case 'invalidCodeStatus':
                setStSelectedProducts(products => products.map(p => {
                        if (_.includes(itemList, p.id)) {
                            p.error = true
                        }

                        return p
                    })
                )

                return Promise.reject(i18next.t('page.transferFormEditor.error.invalid'))
            case 'invalidQuantity':
                setStSelectedProducts(products => products.map(p => {
                        if (_.includes(itemList, p.id)) {
                            p.inlineError = i18next.t('page.transferFormEditor.error.invalidQuantity')
                        }

                        return p
                    })
                )
                return Promise.reject()
            default:
                return Promise.reject(e)
        }
    }

    const handleOnValidSubmit = (e, data) => {
        processValidate(data)
            .then(() => {
                setStIsSaving(true)

                const requestBody = {
                    ...(stTransfer || {}),
                    originBranchId: stSelectedOrigin,
                    destinationBranchId: stSelectedDestination,
                    status: Constants.TRANSFER_STATUS.READY_FOR_TRANSPORT,
                    note: data['text-note'],
                    storeId: CredentialUtils.getStoreId(),
                    createdByStaffId: CredentialUtils.getUserId(),
                    itemTransfers: getItemTransfers(data)
                }

                if (requestBody.hasOwnProperty('items')) {
                    delete requestBody.items
                }

                if (stEditorMode === TRANSFER_MODE.CREATE) {
                    //CREATE
                    return ItemService.createTransfer(requestBody)
                        .then(data => {
                            GSToast.commonCreate()

                            return data.id
                        })

                }

                //UPDATE
                return ItemService.updateTransfer(requestBody)
                    .then(() => {
                        GSToast.commonUpdate()

                        return stTransfer.id
                    })
            })
            .then(id => {
                setStIsEdited(false)
                RouteUtils.redirectWithoutReload(props, NAV_PATH.transferStockWizard + '/' + id)
            })
            .catch(processHandleError)
            .catch(e => {
                if (_.isString(e)) {
                    GSToast.error(e)
                } else if (e) {
                    GSToast.commonError(e)
                }
            })
            .finally(() => setStIsSaving(false))
    }

    const handleSelectOriginBranch = ({ value }, isConfirmed) => {
        if (stSelectedOrigin === value) {
            return
        }

        if (!isConfirmed && stSelectedProducts.length) {
            return refConfirmModal.current.openModal({
                messages: <GSTrans t="page.transferFormEditor.information.confirm"/>,
                okCallback: () => {
                    handleSelectOriginBranch({ value }, true)
                },
                cancelCallback: () => {
                    setStRerenderOrigin(render => !render)
                }
            })
        }

        if (value === stSelectedDestination) {
            setStRerenderOrigin(render => !render)
            return refAlertModal.current.openModal({
                messages: (
                    <GSTrans t={ 'page.transferFormEditor.information.duplicate.branch' }>
                        Please select a different branch
                    </GSTrans>
                ),
                type: AlertModalType.ALERT_TYPE_DANGER
            })
        }

        //const destinationBranches = stDestinationBranches.filter(branch => branch.value !== value)

        //setStDestinationBranches(destinationBranches)
        setStSelectedOrigin(value)
        setStSelectedProducts([])
        // reset search input
        refSearchInput.current.clearInput()
        setStFilter(filter => ({
            ...filter,
            isScroll: false,
            page: 0,
            keyword: undefined
        }))
        setStIsEdited(true)
    }

    const handleSelectDestinationBranch = ({ value }) => {

        if (value === stSelectedOrigin) {
            setStRerenderDestination(render => !render)
            return refAlertModal.current.openModal({
                messages: (
                    <GSTrans t={ 'page.transferFormEditor.information.duplicate.branch' }>
                        Please select different branch
                    </GSTrans>
                ),
                type: AlertModalType.ALERT_TYPE_DANGER
            })
        }
        //const originBranches = stOriginBranches.filter(branch => branch.value !== value)

        //setStOriginBranches(stOriginBranches)
        setStSelectedDestination(value)
        setStDestinationError()
        setStIsEdited(true)
    }

    const getPlaceHolderSearch = () => {
        let translatedText = ''
        switch (stFilter.searchType.value) {
            case SEARCH_BY_ENUM.PRODUCT:
                translatedText = 'page.product.list.printBarCode.searchByProduct'
                break
            case SEARCH_BY_ENUM.BARCODE:
                translatedText = 'page.product.list.printBarCode.searchByBarcode'
                break
            case SEARCH_BY_ENUM.SKU:
                translatedText = 'page.product.list.printBarCode.searchBySKU'
                break
            default:
                break
        }
        return i18next.t(translatedText)
    }

    const handleDeleteProduct = (e, productId) => {
        e.preventDefault()

        const products = stSelectedProducts.filter(prod => prod.id !== productId)

        setStSelectedProducts(products)
        setStIsEdited(true)
    }

    const handleCancel = () => {
        return RouteUtils.redirectWithoutReload(props, NAV_PATH.transferStock)
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop)

        return afterCal <= (el.clientHeight + 1)
    }

    const handleScroll = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!refIsScrolled.current) {
            const totalPage = parseInt(stFilter.total / stFilter.size)

            if (isBottom(e.currentTarget) && stFilter.page < totalPage) {
                refIsScrolled.current = true

                setStFilter(filter => ({
                    ...filter,
                    isScroll: true,
                    page: filter.page + 1
                }))
            }
        }
    }

    const handleSelect = (product) => {
        if (product.parentId) {
            GSToast.error(i18next.t('page.product.transfer.notAllowUnit'))
            return;
        }


        const index = stSelectedProducts.findIndex(p => p.id == product.id)

        //WHY? To collapse search result list
        $('.transfer-form-editor .search-result').blur()

        if (index !== -1) {
            return
        }

        product.savingCodeList = []
        product.codeList = []
        product.quantity = 1
        product.modelValue = product.modelName
        setStSelectedProducts(products => [...products, product])
        setStEmptyError()
        setStIsEdited(true)
    }

    const getTransferHistory = async () => {
        try {
            const data = await ItemService.getTransferHistory(stTransfer.id)
            setStHistories(data)
        } catch (error) {
            console.log('error to get transfer history by id ' + stTransfer.i)
            GSToast.commonError()
        }
    }

    const onClickHistory = () => {
        const isOpen = !stOpenHistory
        if (isOpen) {
            getTransferHistory()
        }
        setStOpenHistory(isOpen)
    }

    const handleClickSaveButton = () => {
        if (!stIsEdited) {
            return
        }

        refForm.current.submit()
    }

    const handleSaveIMEISerial = (id, itemId, modelId, oldItemModelCodes, data) => {
        const itemModelCodes = IMEISerialModal.mapSaveDataToItemModelCodes(itemId, modelId, oldItemModelCodes, data)

        setStIsEdited(true)
        setStSelectedProducts(prods => {
            const updateProd = prods.find(p => p.id === id)
            updateProd.savingCodeList = itemModelCodes

            return [...prods]
        })
    }

    const handleCancelIMEISerial = (id) => {
        setStIsEdited(true)
        setStSelectedProducts(prods => {
            const updateProd = prods.find(p => p.id === id)
            updateProd.savingCodeList = updateProd.codeList

            return [...prods]
        })
    }

    const renderSearchBox = () => {
        if (stAllowModify === false) {
            return (<span></span>)
        }
        return (
            <GSWidgetHeader>
                <span className="search-box">
                    <GSSearchInput
                        ref={ refSearchInput }
                        liveSearchOnMS={ 500 }
                        className="flex-grow-1"
                        style={ {
                            height: '38px'
                        } }
                        wrapperProps={ {
                            style: {
                                height: '38px',
                                width: '100%'
                            }
                        } }
                        defaultValue={ stFilter.keyword }
                        placeholder={ getPlaceHolderSearch() }
                        onSearch={ (keyword, e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setStFilter(filter => ({
                                ...filter,
                                isScroll: false,
                                page: 0,
                                keyword
                            }))
                        } }
                    />
                    {
                        stSearchResult
                            ? <div className="search-result"
                                   style={ { zIndex: 5 } }
                                   tabIndex="0"
                                   onScroll={ handleScroll }>
                                {
                                    stSearchResult.map(r => {
                                        return (
                                            <div className={ r.parentId ? 'product-item unit' : 'product-item' }>
                                                <div
                                                    className={ r.parentId ? 'd-flex align-items-center container-item' : 'd-flex align-items-center' }>
                                                    <div key={ r.id }
                                                         className={ r.parentId ? 'd-flex search-item gsa-hover--gray cursor--pointer unit' : 'd-flex search-item gsa-hover--gray cursor--pointer' }
                                                         onClick={ () => handleSelect(r) }
                                                    >
                                                        <GSImg src={ r.itemImage } width={ 70 } height={ 70 }/>
                                                        <div className="d-flex flex-column ml-3">
                                                            <span>{ r.itemName }</span>
                                                            { r.barcode && <span
                                                                className="color-gray font-size-_8rem">{ r.barcode.split('-').join(' - ') }</span> }
                                                            { r.modelName && <span
                                                                className="font-size-_8rem">{ ItemUtils.buildModelName(r.modelName) }</span> }
                                                        </div>
                                                        <span
                                                            className="ml-auto mb-auto font-weight-normal font-size-_8em text-right">
                                                        <p className="mb-0">
                                                            <GSTrans
                                                                t="page.transferFormEditor.search.inventory"/>:&nbsp;
                                                            <strong>{ r.modelStock }</strong>
                                                        </p>
                                                            { r.conversionUnitName &&
                                                                <p style={ { color: '#556CE7' } }>
                                                                    <span>{ i18next.t('page.transfer.stock.table.column.unit') }: </span> { r.conversionUnitName }
                                                                </p>
                                                            }
                                                </span>
                                                    </div>
                                                </div>
                                                <div className="product-item-row-border"></div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    stSearchResult.length === 0 &&
                                    <p className="text-center mb-0">
                                        <GSTrans t={ 'common.noResultFound' }/>
                                    </p>
                                }
                                {
                                    stIsSearching && <Loading className="mt-3"/>
                                }
                            </div>
                            : stIsSearching &&
                            <div className="search-result" style={ { zIndex: 5 } }><Loading/></div>
                    }
                </span>
                <UikSelect
                    onChange={ searchType => setStFilter(filter => ({
                        ...filter,
                        isScroll: false,
                        page: 0,
                        searchType
                    })) }
                    position={ 'bottomRight' }
                    value={ [stFilter.searchType] }
                    style={ {
                        width: '100px'
                    } }
                    className="ml-2"
                    options={ Object.values(SEARCH_TYPE) }
                />
            </GSWidgetHeader>
        )
    }

    const renderProductRow = (prod) => {
        return (
            <tr key={ prod.id } className="background-color-white">
                <td className="vertical-align-baseline">
                    <div className="col-data">
                        <GSFakeLink
                            onClick={ () => RouteUtils.openNewTab(NAV_PATH.productEdit + '/' + prod.itemId) }>{ prod.sku || '_' }</GSFakeLink>
                    </div>
                </td>
                <td>
                    <div className="col-data">
                        <div className="product-image">
                            <GSImg src={ prod.itemImage } width={ 70 } height={ 70 }/>
                        </div>
                        <div className="d-flex flex-column ml-3">
                            <span className="product-name">{ prod.itemName }</span>
                            { prod.modelId && <span
                                className="font-size-_8rem white-space-pre">{ ItemUtils.buildFullModelName(prod.modelLabel, prod.modelValue) }</span> }
                        </div>
                    </div>
                </td>
                <td className="vertical-align-baseline">
                    <div className="col-data">
                        { NumberUtils.formatThousand(prod.modelStock) }
                    </div>
                </td>

                <td className="vertical-align-baseline">
                    <div className="col-data input">
                        <div className="d-flex flex-column">
                            {
                                stAllowModify === false
                                    ? <span>{ prod.quantity }</span>
                                    : <>
                                        <div className="number">
                                            <AvFieldCurrency
                                                name={ PRODUCT_PROP.TRANSFERRED_STOCK + '_' + prod.id }
                                                unit={ Currency.NONE }
                                                value={ prod.quantity }
                                                validate={ {
                                                    ...FormValidate.required(),
                                                    ...FormValidate.minValue(1, true),
                                                    ...FormValidate.maxValue(prod.modelStock, true, 'page.transferFormEditor.table.error.transferredStock')
                                                } }
                                                onKeyDown={ (e) => {
                                                    e.key === 'Enter' && e.preventDefault()
                                                } }
                                                onChange={ () => {
                                                    setStIsEdited(true)
                                                } }
                                                onBlur={ e => {
                                                    setStSelectedProducts(prods => {
                                                        const updateProd = prods.find(p => p.id === prod.id)
                                                        updateProd.quantity = e.currentTarget.value
                                                        updateProd.inlineError = ''

                                                        return [...prods]
                                                    })
                                                } }
                                            />
                                            {
                                                prod.inlineError && <span className="error">{ prod.inlineError }</span>
                                            }
                                        </div>
                                    </>
                            }
                            <IMEISerialLabel
                                itemId={ prod.itemId }
                                modelId={ prod.modelId }
                                editorMode={ stEditorMode }
                                disabled={ stAllowModify === false }
                                invalid={ prod.error }
                                hidden={ prod.inventoryManageType !== Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER || (stTransfer?.status === Constants.PURCHASE_ORDER_STATUS.CANCELLED && !prod.codeList?.length) }
                                branchList={ stStoreBranches }
                                selectedBranchIds={ [stSelectedOrigin] }
                                productName={ prod.itemName }
                                modelName={ prod.modelName?.split('|').filter(n => n !== Constants.DEPOSIT_CODE.FULL).join(' | ') }
                                maxQuantity={ prod.quantity }
                                itemModelCodes={ prod.savingCodeList }
                                currentScreen={ IMEISerialModal.SHOW_AT_SCREEN.TRANSFER_TO_BRANCH }
                                onCancel={ () => handleCancelIMEISerial(prod.id) }
                                onSave={ data => handleSaveIMEISerial(prod.id, prod.itemId, prod.modelId, prod.codeList, data) }
                            />
                        </div>
                    </div>
                </td>

                <td className="vertical-align-baseline">
                    <div className="col-data input justify-content-between">
                        <div className="d-flex">
                            { prod.conversionUnitName || ' -' }
                        </div>
                        <GSButton hidden={ !stAllowModify } className="delete"
                                  onClick={ (e) => handleDeleteProduct(e, prod.id) }>
                            <img src="/assets/images/icon-delete.png" alt="remove product"/>
                        </GSButton>
                    </div>
                </td>
            </tr>
        )
    }

    const renderTotalRow = () => {
        if (!stSelectedProducts.length) {
            return
        }

        return (
            <div className="custom-row">
                <td/>
                <td/>
                <td className="gs-table-body-item vertical-align-baseline font-weight-bold">
                    <div className="h-100">
                        <GSTrans t="page.transfer.stock.table.column.total"/>
                    </div>
                </td>
                <td>
                    <div className="d-flex h-100 align-items-center">
                        <span className="font-weight-bold">{
                            NumberUtils.formatThousand(stSelectedProducts.reduce((acc, curr) => acc + parseInt(curr.quantity), 0))
                        }</span>
                        &nbsp;
                        <GSTrans t="page.transferFormEditor.table.total.product"/>
                    </div>
                </td>
            </div>
        )
    }

    const renderInformation = () => {
        return (
            <GSWidget className="information">
                {/*TRANSFER INFORMATION*/ }
                <GSWidgetHeader title={ i18next.t('page.transferFormEditor.information.header') }>
                </GSWidgetHeader>
                <GSWidgetContent className="d-flex flex-column">
                    <div className="d-flex align-items-baseline">
                        <span className="title">
                            <GSTrans t="page.transferFormEditor.information.origin"/>
                        </span>
                        <GSTooltip message={ i18next.t('page.transferFormEditor.information.origin.hint') }/>
                    </div>
                    { stEditorMode === TRANSFER_MODE.EDIT || stAllowModify === false ?
                        <span
                            className="pt-2 pb-2">{ stStoreBranches.find(branch => branch.value === stSelectedOrigin) ? stStoreBranches.find(branch => branch.value === stSelectedOrigin).label : '' }</span>
                        : <UikSelect
                            key={ stSelectedOrigin + '_' + stRerenderOrigin }
                            defaultValue={ stSelectedOrigin }
                            options={ stOriginBranches }
                            onChange={ handleSelectOriginBranch }
                        /> }
                    <div className="d-flex align-items-baseline">
                        <span className="title mt-2"><GSTrans
                            t="page.transferFormEditor.information.destination"/>
                        </span>
                        <GSTooltip message={ i18next.t('page.transferFormEditor.information.destination.hint') }/>
                    </div>
                    { stEditorMode === TRANSFER_MODE.EDIT || stAllowModify === false ?
                        <span
                            className="pt-2 pb-2">{ stStoreBranches.find(branch => branch.value === stSelectedDestination) ? stStoreBranches.find(branch => branch.value === stSelectedDestination).label : '' }</span>
                        : <UikSelect
                            className={ stDestinationError ? 'input-error' : '' }
                            key={ stSelectedDestination + '-' + stRerenderDestination }
                            defaultValue={ stSelectedDestination }
                            options={ stDestinationBranches }
                            placeholder={ i18next.t('page.marketing.discounts.coupons.create.applicableBranch.select') }
                            onChange={ handleSelectDestinationBranch }
                        /> }
                    <span className="error">{ stDestinationError }</span>
                </GSWidgetContent>
            </GSWidget>
        )
    }

    const renderNote = () => {
        return (
            <GSWidget className="history">
                {/*NOTE*/ }
                <GSWidgetHeader title={ i18next.t('page.transferFormEditor.note.header') }>
                </GSWidgetHeader>
                <GSWidgetContent className="d-flex flex-column">
                    { stAllowModify === false ?
                        <span className="p-2">{ stNote }</span>
                        : <AvField
                            name="text-note"
                            type="textarea"
                            rows={ 3 }
                            wrap="hard"
                            maxlength="120"
                            value={ stNote }
                            onChange={ () => setStIsEdited(true) }
                        /> }
                </GSWidgetContent>
                {/*END NOTE*/ }
            </GSWidget>
        )
    }

    const renderHistory = () => {
        return (<GSWidget className={ 'history' }>
            <GSWidgetHeader className={ 'widget__header widget__header--text-align-right text-capitalize' }>
                <div className="transfer_history" onClick={ onClickHistory }>
                    { i18next.t('page.transfer.stock.wizard.history') }
                </div>
            </GSWidgetHeader>
            <Modal wrapClassName="transfer-history-modal" isOpen={ stOpenHistory }>
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
                                stHistories.map(history => {
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
        </GSWidget>)
    }

    const renderProductList = () => {
        return (
            <GSWidget className="product" style={ stSelectedProducts.length ? {} : { minHeight: '414px' } }>
                {/*SELECT PRODUCT*/ }
                { renderSearchBox() }
                {/*END SELECT PRODUCT*/ }

                {/*PRODUCT LIST*/ }
                <GSWidgetContent className="d-flex flex-column p-0">
                    {
                        <div className="table">
                            <GSTable>
                                <thead>
                                <tr>
                                    <th>{ HEADER.SKU }</th>
                                    <th>{ HEADER.PRODUCT_NAME }</th>
                                    <th>{ HEADER.INVENTORY }</th>
                                    <th>{ HEADER.TRANSFERRED_QUANTITY }</th>
                                    <th>{ HEADER.UNIT }</th>
                                </tr>
                                </thead>
                                <tbody>
                                {

                                    stSelectedProducts.map(prod => (
                                        renderProductRow(prod)
                                    ))
                                }
                                </tbody>
                            </GSTable>
                        </div>
                    }
                    {
                        renderTotalRow()
                    }
                    {
                        stEmptyError && <div className="error">{ stEmptyError }</div>
                    }
                </GSWidgetContent>
                {/*END PRODUCT LIST*/ }
            </GSWidget>
        )
    }

    return (
        <>
            <ConfirmModal ref={ ref => refConfirmModal.current = ref }/>
            <GSContentContainer confirmWhenRedirect
                                confirmWhen={ stIsEdited }
                                isSaving={ stIsSaving }
                                className="transfer-form-editor">
                <GSContentHeader>
                    { stAllowModify === false ?
                        <div style={ {
                            width: '100%'
                        } }>
                            <h5 className="gs-page-title">
                                { i18next.t('component.navigation.product.transfer') }
                            </h5>
                        </div>
                        : <div className="transfer-form-header">
                            <div style={ {
                                width: '20%'
                            } }>
                                <h5 className="gs-page-title white-space-pre">
                                    {
                                        stEditorMode === TRANSFER_MODE.EDIT ?
                                            `${ i18next.t('page.transferFormEditor.edit.header') } ${ stTransfer ? stTransfer.id : '' }`
                                            : i18next.t('page.transferFormEditor.create.header')
                                    }
                                </h5>
                            </div>
                            <div className="header-progress-bar">
                                {
                                    <GSProgressBar
                                        currentStep={
                                            stTransfer
                                                ? stTransfer.status === Constants.TRANSFER_STATUS.CANCELLED
                                                    ? Constants.TRANSFER_STAGE[stTransfer.statusAtCancel]
                                                    : Constants.TRANSFER_STAGE[stTransfer.status]
                                                : 1
                                        }
                                        steps={ Constants.TRANSFER_STEP }/>
                                }
                            </div>
                            <GSContentHeaderRightEl className="d-flex">
                                <GSButton success disabled={ !stIsEdited } onClick={ handleClickSaveButton }>
                                    <Trans i18nKey="common.btn.save" className="sr-only">
                                        Save
                                    </Trans>
                                </GSButton>
                                <GSButton success outline marginLeft
                                          onClick={ handleCancel }>
                                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                                        Cancel
                                    </Trans>
                                </GSButton>
                            </GSContentHeaderRightEl>
                        </div> }
                </GSContentHeader>
                <GSContentBody size={ GSContentBody.size.MAX }>
                    <AvForm ref={ refForm } onValidSubmit={ handleOnValidSubmit } autoComplete="off"
                            className="content-wrapper">
                        { renderProductList() }
                        <div className="float-right">
                            { renderInformation() }
                            { renderNote() }
                            { stEditorMode === TRANSFER_MODE.EDIT && renderHistory() }
                        </div>
                    </AvForm>
                </GSContentBody>
            </GSContentContainer>
            <AlertModal ref={ refAlertModal }/>
        </>
    )
}

export default withRouter(TransferFormEditor)
