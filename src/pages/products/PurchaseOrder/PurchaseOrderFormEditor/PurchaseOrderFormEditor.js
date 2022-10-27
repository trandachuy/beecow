import './PurchaseOrderFormEditor.sass'
import React, {useEffect, useReducer, useRef, useState} from 'react'
import ConfirmModal from '../../../../components/shared/ConfirmModal/ConfirmModal'
import GSContentContainer from '../../../../components/layout/contentContainer/GSContentContainer'
import GSContentHeader from '../../../../components/layout/contentHeader/GSContentHeader'
import i18next from 'i18next'
import GSProgressBar from '../../../../components/shared/GSProgressBar/GSProgressBar'
import Constants from '../../../../config/Constant'
import GSContentHeaderRightEl
    from '../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../../components/shared/GSButton/GSButton'
import {Trans} from 'react-i18next'
import GSContentBody from '../../../../components/layout/contentBody/GSContentBody'
import {AvField, AvForm} from 'availity-reactstrap-validation'
import AlertModal from '../../../../components/shared/AlertModal/AlertModal'
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetHeader from '../../../../components/shared/form/GSWidget/GSWidgetHeader'
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent'
import GSTrans from '../../../../components/shared/GSTrans/GSTrans'
import {UikSelect} from '../../../../@uik'
import storeService from '../../../../services/StoreService'
import StoreService from '../../../../services/StoreService'
import {TokenUtils} from '../../../../utils/token'
import {ItemService} from '../../../../services/ItemService'
import _ from 'lodash'
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation'
import {Link} from 'react-router-dom'
import GSTable from '../../../../components/shared/GSTable/GSTable'
import GSSearchInput from '../../../../components/shared/GSSearchInput/GSSearchInput'
import GSImg from '../../../../components/shared/GSImg/GSImg'
import Loading from '../../../../components/shared/Loading/Loading'
import {SEARCH_BY_ENUM} from '../../ProductList/BarcodePrinter/ProductListBarcodePrinter'
import GSFakeLink from '../../../../components/shared/GSFakeLink/GSFakeLink'
import {RouteUtils} from '../../../../utils/route'
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format'
import AvFieldCurrency from '../../../../components/shared/AvFieldCurrency/AvFieldCurrency'
import {Currency} from '../../../../components/shared/form/CryStrapInput/CryStrapInput'
import {FormValidate} from '../../../../config/form-validate'
import useDebounceEffect from '../../../../utils/hooks/useDebounceEffect'
import {GSToast} from '../../../../utils/gs-toast'
import {GSDropdownItem} from '../../../../components/shared/GSButton/DropDown/GSDropdownButton'
import GSDropDownCombo from '../../../../components/shared/GSDropDownCombo/GSDropDownCombo'
import GSDropdownAction from '../../../../components/shared/GSDropdownAction/GSDropdownAction'
import PurchaseOrderHistory from '../PurchaseOrderHistory/PurchaseOrderHistory'
import PurchaseOrderDiscountModal from '../PurchaseOrderModal/PurchaseOrderDiscountModal'
import PriceAndVATEditor from '../PriceAndVATEditor/PriceAndVATEditor'
import PurchaseOrderSelectSupplier from '../SelectSupplier/PurchaseOrderSelectSupplier'
import {CredentialUtils} from '../../../../utils/credential'
import LoadingScreen from '../../../../components/shared/LoadingScreen/LoadingScreen'
import PrintTeamplatePurchaseOrder from './PrintTeamplatePurchaseOrder/PrintTeamplatePurchaseOrder'
import {ProductContext} from '../../Context/ProductContext'
import PurchaseOrderCostModal from '../PurchaseOrderModal/PurchaseOrderCostModal'
import moment from 'moment'
import {ImageUtils} from '../../../../utils/image'
import IMEISerialLabel from '../../../../components/shared/managedInventoryModal/IMEISerialLabel/IMEISerialLabel'
import IMEISerialModal from '../../../../components/shared/managedInventoryModal/IMEISerialModal/IMEISerialModal'
import {ItemUtils} from '../../../../utils/item-utils'



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
const HEADER = {
    SKU: 'SKU',
    PRODUCT_NAME: i18next.t('page.purchaseOrderFormEditor.table.productName'),
    QUANTITY: i18next.t('page.purchaseOrderFormEditor.table.quantity'),
    IMPORT_PRICE: i18next.t('page.purchaseOrderFormEditor.table.importPrice'),
    TOTAL: i18next.t('page.purchaseOrderFormEditor.table.total')
}
const SEARCH_PAGE_SIZE = 20
const PRODUCT_PROP = {
    QUANTITY: 'quantity',
    IMPORT_PRICE: 'importPrice'
}
const ACTION = {
    CREATE: 'CREATE',
    CREATE_AND_APPROVE: 'CREATE_AND_APPROVE'
}
const PURCHASE_ORDER_DISCOUNT_TYPE = {
    VALUE: 'VALUE', PERCENTAGE: 'PERCENTAGE'
}
const BE_STATUS = {
    CREATED: 'CREATED',
    APPROVED: 'APPROVED',
    IMPORTED: 'IMPORTED',
    CANCELLED: 'CANCELLED'
}

const PurchaseOrderFormEditor = props => {
    const currency = CurrencyUtils.getLocalStorageSymbol()
    const defaultPrecision = CurrencyUtils.getLocalStorageSymbol() !== Constants.CURRENCY.VND.SYMBOL ? 2: 0
    const [state, dispatch] = useReducer(ProductContext.reducer, ProductContext.initState)

    const purchaseOrderId = props.match?.params?.purchaseOrderId
    
    const [stIsSaving, setStIsSaving] = useState(false)
    const [stIsEdited, setStIsEdited] = useState(false)
    const [stEditorMode, setStEditorMode] = useState(Constants.PURCHASE_ORDER_MODE.CREATE)
    const [stPurchaseOrder, setStPurchaseOrder] = useState()
    const [stNote, setStNote] = useState('')
    const [stSelectedDestination, setStSelectedDestination] = useState({value: undefined})
    const [stDestinationBranches, setStDestinationBranches] = useState([])
    const [stStoreBranches, setStStoreBranches] = useState([])
    const [stFilter, setStFilter] = useState({
        searchType: SEARCH_TYPE.PRODUCT,
        page: 0,
        size: SEARCH_PAGE_SIZE,
        total: 0,
        isScroll: false
    })
    const [stSearchResult, setStSearchResult] = useState()
    const [stSelectedProducts, setStSelectedProducts] = useState([])
    const [stProductListError, setStProductListError] = useState()
    const [stSupplierListError, setStSupplierListError] = useState()
    const [stIsSearching, setStIsSearching] = useState(false)
    const [stRerenderDestination, seStRerenderDestination] = useState(false)
    const [stComboActionToggle, setStComboActionToggle] = useState(false)
    const [stCurrentComboAction, setStCurrentComboAction] = useState(ACTION.CREATE)
    const [stDropdownActionToggle, setStDropdownActionToggle] = useState(false)
    const [stModalPrice, setStModalPrice] = useState(false)
    const [stTotalCost, setStTotalCost] = useState(0)
    const [stDiscount, setStDiscount] = useState({value: 0, type: PURCHASE_ORDER_DISCOUNT_TYPE.VALUE})
    const [stListCostName, setStListCostName] = useState([])
    const [stSelectedSupplier, setStSelectedSupplier] = useState()
    const [stPurchaseIdError, setStPurchaseIdError] = useState()
    const [stShowLoading, setStShowLoading] = useState(false)
    const [stController, setStController] = useState({})
    const [stTimelines, setStTimelines] = useState([])
    const [getListTax, setLstTax] = useState([])
    const [stInsufficientStock, setStInsufficientStock] = useState([])


    const refConfirmModal = useRef()
    const refAlertModal = useRef()
    const refForm = useRef()
    const refSearchInput = useRef()
    const refIsScrolled = useRef(false)
    const refPrintReceiptRef = useRef()
    const refCancelText = useRef('')

    const mapBEStatusToFEStatus = (status) => {
        switch (status) {
            case BE_STATUS.CREATED:
                return Constants.PURCHASE_ORDER_STATUS.ORDER
            case BE_STATUS.APPROVED:
                return Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
            case BE_STATUS.IMPORTED:
                return Constants.PURCHASE_ORDER_STATUS.COMPLETED
            case BE_STATUS.CANCELLED:
                return Constants.PURCHASE_ORDER_STATUS.CANCELLED
            default:
                return status
        }
    }

    useEffect(() => {
        const promises = []
        const purchaseOrderId = props.match?.params?.purchaseOrderId
        const path = props.match?.path

        if (TokenUtils.isStaff()) {
            promises.push(storeService.getListActiveBranchOfStaff())
        } else {
            promises.push(storeService.getStoreBranches())
        }

        if (path.includes(NAV_PATH.purchaseOrderWizard) || path.includes(NAV_PATH.purchaseOrderEdit)) {
            promises.push(ItemService.getPurchaseOrderById(purchaseOrderId))

            if (path.includes(NAV_PATH.purchaseOrderWizard)) {
                setStEditorMode(Constants.PURCHASE_ORDER_MODE.WIZARD)
            } else if (path.includes(NAV_PATH.purchaseOrderEdit)) {
                setStEditorMode(Constants.PURCHASE_ORDER_MODE.EDIT)
            }
        }

        Promise.all(promises)
            .then(([branches, purchaseOrder]) => {
                if (!branches.length) {
                    console.error('Store branch is empty')
                    return
                }

                const formattedBranches = branches
                    .filter(b => b.branchStatus === Constants.BRANCH_STATUS.ACTIVE)
                    .map(branch => ({
                        id: branch.id,
                        label: branch.name,
                        value: branch.id,
                        isDefault: branch.isDefault
                    }))
                let destinationBranch = formattedBranches.find(b => {
                    if (purchaseOrder) {
                        return b.id === purchaseOrder?.branchId
                    }

                    return b.isDefault
                })

                if (!destinationBranch) {
                    //Staff don't be assigned a default branch, need to choose first branch
                    destinationBranch = formattedBranches[0]
                }

                if (purchaseOrder) {
                    //Map stock to modelStock
                    purchaseOrder.purchaseOrderItems.forEach(item => {
                        item.id = item.itemId + (item.modelId ? '-' + item.modelId : '')
                        item.modelStock = item.stock || 0
                        item.modelName = item.itemVariationName
                        item.itemImage = ImageUtils.getImageFromImageModel(item.itemImageDto, 70)
                        item.savingCodeList = item.codeList
                    })
                    setStPurchaseOrder(purchaseOrder)
                    refCancelText.current = purchaseOrder.note


                    //Map status of timelines to PO status
                    const timelines = purchaseOrder.timelines.map(timeline => ({
                        ...timeline,
                        status: mapBEStatusToFEStatus(timeline.status)
                    }))

                    setStTimelines(timelines)
                }

                setStStoreBranches(branches)
                setStDestinationBranches(formattedBranches)
                setStSelectedDestination(destinationBranch)
            })
    }, [])

    useEffect(() => {
        if (!stPurchaseOrder) {
            return
        }

        setStNote(stPurchaseOrder.note)
        setStSelectedProducts(stPurchaseOrder.purchaseOrderItems)
        setStDiscount(stPurchaseOrder.discount)
        setStSelectedSupplier(stPurchaseOrder.supplier)
        setStController({
            hiddenDeleteProduct: stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                || (
                    stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER
                    && stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                ),
            hiddenSearchProduct: stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                || (
                    stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER
                    && stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                ),
            hiddenCancelOrder: stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER && stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS,
            preventChangeBranch: stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD || stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER,
            preventChangeProductQuantity: stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                || (
                    stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER
                    && stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                ),
            preventChangeProductPrice: stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                || (
                    stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER
                    && stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                ),
            preventChangeSupplier: stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                || (
                    stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.ORDER
                    && stPurchaseOrder?.status !== Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                ),
            preventChangePurchaseId: stEditorMode !== Constants.PURCHASE_ORDER_MODE.CREATE
        })
    }, [stPurchaseOrder])

    useEffect(() => {
        // now get the list tax
        StoreService.getListVAT()
            .then(res => {
                let lstTax = res.filter(data => data.taxType === 'IMPORT_GOODS').map(data => {
                    return {value: data.id, label: data.name, rate: data.rate}
                })
                lstTax.unshift({value: 0, label: i18next.t('page.purchaseOrderFormEditor.select.tax')})
                setLstTax(lstTax)
            })
            .catch(e => {
                console.error(e)
                GSToast.commonError()
            })
    }, [])

    useDebounceEffect(() => {
        if (stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD) {
            return
        }

        if (!stSelectedDestination.value) {
            return
        }

        setStIsSearching(true)

        const {page, size, searchType, keyword, isScroll} = stFilter

        if (!isScroll) {
            setStSearchResult()
        }

        ItemService.getProductSuggestionByName(page, size, searchType.value, keyword, true, stSelectedDestination.value,
            {includeConversion: true})
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
    }, 500, [stFilter.searchType, stFilter.keyword, stFilter.page, stSelectedDestination.value])

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

    const getProductTotalRow = (productId) => {
        const product = stSelectedProducts.find(p => p.id === productId)
        return CurrencyUtils.formatDigitMoneyByCustom(product.quantity * product.importPrice, currency, defaultPrecision)
    }

    const getSubTotal = (isRaw = false) => {
        const subTotal = stSelectedProducts.reduce((acc, curr) => acc + (curr.quantity * curr.importPrice), 0)
        return isRaw ? subTotal : CurrencyUtils.formatDigitMoneyByCustom(subTotal, currency, defaultPrecision)
    }

    const getTotalTax = (isRaw = false) => {
        const totalTax = stSelectedProducts
            .filter(prod => prod.taxSettingId !== undefined && prod.taxSettingId !== null)
            .reduce((acc, curr) => {
                const tax = getListTax.find(tax => tax.value === curr.taxSettingId)
                if (tax) {
                    return acc + (curr.quantity * curr.importPrice * tax.rate / 100)
                }
                return 0
            }, 0)
        return isRaw ? totalTax : CurrencyUtils.formatDigitMoneyByCustom(totalTax, currency, defaultPrecision)
    }

    const getPriceDiscount = (isRaw) => {
        const subTotal = getSubTotal(true)
        let discount = 0

        if (!_.isEmpty(stDiscount)) {
            if (stDiscount.type == PURCHASE_ORDER_DISCOUNT_TYPE.PERCENTAGE) {
                discount = subTotal * +(stDiscount.value) / 100
            } else {
                discount = +(stDiscount.value)
            }
        }

        return isRaw ? discount : CurrencyUtils.formatDigitMoneyByCustom(discount, currency, defaultPrecision)
    }

    const getTotal = () => {
        const subTotal = getSubTotal(true)
        const discount = getPriceDiscount(true)
        const cost = +(stTotalCost)
        const tax = getTotalTax(true)
        return subTotal - discount + cost + tax
    }

    const getDiscount = (value, type) => {
        setStDiscount({value, type})
        setStIsEdited(true)
    }

    const getListCost = (total, listCostName) => {
        setStTotalCost(total)
        setStListCostName(listCostName)
        setStIsEdited(true)
    }

    const subTotalToDiscount = () => {
        const subTotal = stSelectedProducts.reduce((acc, curr) => acc + (curr.quantity * curr.importPrice), 0)

        return subTotal
    }

    const closeModalPrice = (isBolean) => {
        setStModalPrice(isBolean)
    }

    const getCreatedDate = () => {
        if (!stTimelines.length) {
            return
        }

        const timeline = stTimelines.find(timeline => timeline.status === Constants.PURCHASE_ORDER_STATUS.ORDER)

        if (!timeline) {
            return
        }

        return moment(timeline.createdDate).format('HH:mm DD/MM/YYYY')
    }

    const isValid = () => {
        setStProductListError()
        setStSupplierListError()

        if (!stSelectedSupplier) {
            setStSupplierListError(i18next.t('page.purchaseOrderFormEditor.table.error.supplierEmpty'))
            return false
        }

        if (!stSelectedProducts.length) {
            setStProductListError(i18next.t('page.purchaseOrderFormEditor.table.error.productEmpty'))
            return false

        }

        if (stPurchaseIdError) {
            return false
        }

        return true
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop)

        return afterCal <= (el.clientHeight + 1)
    }

    const handleSave = () => {
        if (!stIsEdited) {
            return
        }

        refForm.current.submit()
    }

    const handleCancel = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrder)
    }

    const handleCancelEdit = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + purchaseOrderId)
    }

    const handleOnValidSubmit = (e, data) => {
        if (!isValid()) {
            return
        }

        setStIsSaving(true)

        /**
         * @type {PurchaseOrderDTO}
         */
        const request = {
            ...(stPurchaseOrder || {}),
            note: data.note,
            status: stPurchaseOrder ? stPurchaseOrder.status
                : stCurrentComboAction == ACTION.CREATE_AND_APPROVE
                    ? Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                    : Constants.PURCHASE_ORDER_STATUS.ORDER,
            purchaseId: data.purchaseId,
            supplier: {
                id: stSelectedSupplier.id
            },
            storeId: CredentialUtils.getStoreId(),
            createdByStaffId: CredentialUtils.getUserId(),
            branchId: stSelectedDestination.value,
            discount: stDiscount,
            purchaseCosts: stListCostName,
            amount: getTotal(),
            purchaseOrderItems: stSelectedProducts.map(product => ({
                itemId: product.itemId,
                modelId: product.modelId,
                quantity: product.quantity,
                importPrice: product.importPrice,
                taxSettingId: product.taxSettingId,
                codeList: product.savingCodeList,
                inventoryManageType: product.inventoryManageType
            }))
        }

        let promise

        if (stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE) {
            promise = ItemService.createPurchaseOrder(request)
                .then(({id}) => {
                    GSToast.commonCreate()

                    return id
                })
        } else {
            promise = ItemService.updatePurchaseOrder(request)
                .then(({id}) => {
                    GSToast.commonUpdate()

                    return id
                })
        }

        promise
            .then(id => {
                setStIsEdited(false)
                RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + id)
            })
            .catch(e => {
                return processHandleError(e)
            })
            .catch(e => {
                if (e.response.data.message === "Total quantity of product after imported and converted to smallest unit must not be higher than 1.000.000") {
                    setStInsufficientStock(e.response.data.params)
                    GSToast.error(i18next.t("page.purchaseOrderFormEditor.insufficientStock.content"))
                    return
                }
                if (_.isString(e)) {
                    GSToast.error(e)
                } else {
                    GSToast.commonError(e)
                }
            })
            .finally(() => setStIsSaving(false))
    }

    const handleSelectDestinationBranch = (branch, isConfirmed) => {
        if (stController.preventChangeBranch) {
            return
        }

        if (stSelectedDestination.value === branch.value) {
            return
        }

        if (!isConfirmed && stSelectedProducts.length) {
            return refConfirmModal.current.openModal({
                messages: <GSTrans t="page.purchaseOrderFormEditor.orderInformation.confirm"/>,
                okCallback: () => {
                    handleSelectDestinationBranch(branch, true)
                },
                cancelCallback: () => {
                    seStRerenderDestination(render => !render)
                }
            })
        }

        setStSelectedDestination(branch)
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

    const handleSelectProduct = (product) => {
        const index = stSelectedProducts.findIndex(p => p.id == product.id)

        //WHY? To collapse search result list
        $('.purchase-order-form-editor .search-result').blur()

        if (index !== -1) {
            return
        }

        product.quantity = 1
        product.importPrice = product.costPrice || 0
        product.savingCodeList = []
        product.codeList = []
        setStSelectedProducts(products => [...products, product])
        setStProductListError()
        setStIsEdited(true)
    }

    const handleDeleteProduct = (e, productId) => {
        e.preventDefault()

        const products = stSelectedProducts.filter(prod => prod.id !== productId)

        setStSelectedProducts(products)
        setStIsEdited(true)
        setStInsufficientStock([])
    }

    const handleSelectComboAction = (action) => {
        setStCurrentComboAction(action)
        setStComboActionToggle(toggle => !toggle)
    }

    const handleComboAction = () => {
        switch (stCurrentComboAction) {
            case ACTION.CREATE:
            case ACTION.CREATE_AND_APPROVE:
                handleSave()
                break
        }
    }

    const handleDropdownActionChange = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderEdit + '/' + purchaseOrderId)
    }

    const handleDropdownActionCancel = () => {
        refConfirmModal.current.openModal({
            modalClass: 'cancel-modal',
            modalTitle: i18next.t('page.transfer.stock.confirm.cancel.title'),
            messageHtml: true,
            classNameHeader: 'modal-danger',
            typeBtnOk: {
                danger: true
            },
            messages: renderCancelModalContent(),
            okCallback: function () {
                ItemService.cancelPurchaseOrder(purchaseOrderId, refCancelText.current)
                    .then(({id}) => {
                        GSToast.commonUpdate()
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + id)
                    })
                    .catch(e => {
                        console.error(e)
                        GSToast.commonError()
                    })
            },
            cancelCallback: () => refCancelText.current = ''
        })
    }

    const handleDropdownActionPrint = () => {
        refPrintReceiptRef.current.onPrint()
    }

    const handleSelectTax = (itemModelId, tax) => {
        const {value: taxSettingId, label} = tax
        let selectedProducts = stSelectedProducts
        selectedProducts = selectedProducts.map(data => {
            if (data.id === itemModelId) {
                data.taxSettingId = (!taxSettingId || taxSettingId === 0) ? undefined : taxSettingId
                data.taxName = label
            }
            return data
        })

        setStSelectedProducts(selectedProducts)
        setStIsEdited(true)
    }

    const handleApprove = () => {
        setStShowLoading(true)

        ItemService.approvePurchaseOrder(purchaseOrderId)
            .then(({id}) => {
                GSToast.commonUpdate()
                RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + id)
            })
            .catch(e => {
                console.error(e)
                GSToast.commonError()
            })
            .finally(() => setStShowLoading(false))
    }

    const processValidate = () => {
        return Promise.resolve()
            .then(() => {
                let error = false

                const selectedProducts = stSelectedProducts.map(p => {
                    if (Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER === p.inventoryManageType) {
                        if (p.codeList.length != p.quantity) {
                            p.error = true
                            error = true
                        }
                    }

                    return p
                })

                if (error) {
                    setStSelectedProducts(selectedProducts)
                    return Promise.reject(i18next.t('component.managedInventoryModal.error.exceed'))
                }
            })
    }

    const processHandleError = (e) => {
        const itemIds = []
        const itemList = e.response?.data?.itemList

        switch (e.response?.data?.title) {
            case 'codeListSizeNotEqualsQuantity':
            case 'codeListSizeExceedsQuantity':
                itemIds.push(...itemList)

                setStSelectedProducts(products => products.map(p => {
                        if (_.includes(itemIds, p.id)) {
                            p.error = true
                        }

                        return p
                    })
                )

                return Promise.reject(i18next.t('component.managedInventoryModal.error.exceed'))
            case 'codeListDuplicate':
                itemIds.push(...itemList.map(i => parseInt(Object.keys(i)[0])))

                setStSelectedProducts(products => products.map(p => {
                        if (_.includes(itemIds, p.itemId)) {
                            p.error = true
                        }

                        return p
                    })
                )

                return Promise.reject(i18next.t('component.managedInventoryModal.error.exist.text', {value: `{${Object.values(itemList[0])[0]}}`}))
            default:
                return Promise.reject(e)
        }
    }

    const handleImportGoods = () => {
        setStShowLoading(true)

        processValidate()
            .then(() => ItemService.completePurchaseOrder(purchaseOrderId))
            .then(({id}) => {
                GSToast.commonUpdate()
                RouteUtils.redirectWithoutReload(props, NAV_PATH.purchaseOrderWizard + '/' + id)
            })
            .catch(e => {
                return processHandleError(e)
            })
            .catch(e => {
                if (_.isString(e)) {
                    GSToast.error(e)
                } else {
                    if(e.response.data.message === 'Total quantity of product after imported and converted to smallest unit must not be higher than 1.000.000'){
                        GSToast.error(i18next.t('page.purchaseOrderFormEditor.error.max.quantity'));
                        return
                    }
                    GSToast.commonError(e)
                }
            })
            .finally(() => setStShowLoading(false))
    }

    const handleBlurPurchaseId = (e, value) => {
        if (stController.preventChangePurchaseId) {
            return
        }

        setStPurchaseIdError()

        if (!value) {
            return
        }
        setStShowLoading(true)

        ItemService.checkExistPurchaseOrderId(value)
            .then(isExist => {
                if (isExist) {
                    setStPurchaseIdError(i18next.t('page.purchaseOrderFormEditor.orderInformation.purchaseId.error'))
                }
            })
            .catch(() => GSToast.commonError())
            .finally(() => setStShowLoading(false))
    }

    const handleSelectSupplier = supplier => {
        setStSelectedSupplier(supplier)
        setStSupplierListError()
        setStIsEdited(true)
    }

    const handleCancelIMEISerial = (id) => {
        setStIsEdited(true)
        setStSelectedProducts(prods => {
            const updateProd = prods.find(p => p.id === id)
            updateProd.savingCodeList = updateProd.codeList

            return [...prods]
        })
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

    const renderCancelModalContent = () => {
        return (
            <div className="d-flex flex-column mt-2 mb-2 align-items-center">
                <div style={{paddingBottom: '0.5rem'}}>
                    <GSTrans t="page.purchaseOrderFormEditor.confirm.cancel.body"></GSTrans>
                </div>
                <textarea
                    spellCheck={false}
                    placeholder={i18next.t('page.transfer.stock.confirm.cancel.hint')}
                    name="cancelNote"
                    rows={5}
                    cols={40}
                    maxlength="500"
                    defaultValue={refCancelText.current}
                    onBlur={e => refCancelText.current = e.target.value}
                ></textarea>
            </div>
        )
    }

    const renderTitle = () => {
        switch (stEditorMode) {
            case Constants.PURCHASE_ORDER_MODE.CREATE:
                return <h5 className="gs-page-title">
                    {
                        i18next.t('page.purchaseOrderFormEditor.create.header')
                    }
                </h5>

            case Constants.PURCHASE_ORDER_MODE.EDIT:
                return <h5 className="gs-page-title">
                    {
                        `${i18next.t('page.purchaseOrderFormEditor.edit.header')} ${purchaseOrderId || ''}`
                    }
                </h5>

            case Constants.PURCHASE_ORDER_MODE.WIZARD:
                return <>
                    <h5 className="gs-page-title">
                        {
                            stPurchaseOrder && stPurchaseOrder.purchaseId
                        }
                    </h5>
                    <GSDropdownAction
                        className="w-fit-content"
                        toggle={stDropdownActionToggle}
                        onToggle={toggle => setStDropdownActionToggle(toggle)}
                        actions={[{
                            label: i18next.t('common.btn.change'),
                            onAction: handleDropdownActionChange
                        }, {
                            label: i18next.t('page.purchaseOrderFormEditor.header.action.cancel'),
                            hidden: stController.hiddenCancelOrder,
                            onAction: handleDropdownActionCancel
                        }, {
                            label: i18next.t('common.btn.print'),
                            onAction: handleDropdownActionPrint
                        }]}
                    />
                </>
        }
    }

    const renderButtonAddMode = () => {
        return (
            <>
                <GSDropDownCombo
                    key={stComboActionToggle}
                    icon={<i className="fa fa-caret-down" aria-hidden="true"></i>}
                    title={i18next.t(`page.purchaseOrderFormEditor.action.${stCurrentComboAction}`)}
                    theme={GSButton.THEME.SUCCESS}
                    disabled={!stIsEdited}
                    onClick={handleComboAction}
                >
                    <GSDropdownItem
                        className="pl-4 pr-4"
                        onClick={() => handleSelectComboAction(ACTION.CREATE)}
                    >
                        <GSTrans t={`page.purchaseOrderFormEditor.action.${ACTION.CREATE}`}/>
                    </GSDropdownItem>
                    <GSDropdownItem
                        className="pl-4 pr-4"
                        onClick={() => handleSelectComboAction(ACTION.CREATE_AND_APPROVE)}
                    >
                        <GSTrans t={`page.purchaseOrderFormEditor.action.${ACTION.CREATE_AND_APPROVE}`}/>
                    </GSDropdownItem>
                </GSDropDownCombo>
                <GSButton success outline marginLeft
                          onClick={handleCancel}>
                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                        Cancel
                    </Trans>
                </GSButton>
            </>
        )
    }

    const renderButtonWizardMode = () => {
        return !!stPurchaseOrder && (
            <>
                {
                    stPurchaseOrder.status === Constants.PURCHASE_ORDER_STATUS.ORDER
                    && <GSButton success onClick={handleApprove}>
                        <Trans i18nKey="common.btn.approve" className="sr-only">
                            Approve
                        </Trans>
                    </GSButton>
                }
                {
                    stPurchaseOrder.status === Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS
                    && <GSButton success onClick={handleImportGoods}>
                        <Trans i18nKey="common.btn.importGoods" className="sr-only">
                            Import Goods
                        </Trans>
                    </GSButton>
                }
            </>
        )
    }

    const renderButtonEditMode = () => {
        return (
            <>
                <GSButton
                    success
                    disabled={!stIsEdited}
                    onClick={handleSave}
                >
                    <Trans i18nKey="common.btn.save" className="sr-only">
                        Save
                    </Trans>
                </GSButton>
                <GSButton
                    success outline marginLeft
                    onClick={handleCancelEdit}
                >
                    <Trans i18nKey="common.btn.cancel" className="sr-only">
                        Cancel
                    </Trans>
                </GSButton>
            </>
        )
    }

    const renderHeader = () => {
        return (
            <div className="purchase-order-form-header">
                <div className="title">
                    <Link to={NAV_PATH.purchaseOrder} className="color-gray mb-2 d-block text-capitalize">
                        &#8592; <GSTrans t="page.purchaseOrderFormEditor.header.back"/>
                    </Link>
                    {renderTitle()}
                </div>
                <GSProgressBar
                    key={stPurchaseOrder?.status}
                    currentStep={
                        stPurchaseOrder
                            ? stPurchaseOrder.status === Constants.PURCHASE_ORDER_STATUS.CANCELLED
                            ? Constants.PURCHASE_ORDER_STAGE[stPurchaseOrder.statusAtCancel]
                            : Constants.PURCHASE_ORDER_STAGE[stPurchaseOrder.status]
                            : 1
                    }
                    isCancelledStage={stPurchaseOrder?.status === Constants.PURCHASE_ORDER_STATUS.CANCELLED}
                    cancelledRemovableStage={Constants.PURCHASE_ORDER_STAGE.COMPLETED}
                    steps={Constants.PURCHASE_ORDER_STEP}
                    timelines={stTimelines}
                    replacers={[{
                        step: Constants.PURCHASE_ORDER_STATUS.ORDER,
                        label: i18next.t('progress.bar.step.newOrder'),
                        isReplace: !stPurchaseOrder
                    }, {
                        step: Constants.PURCHASE_ORDER_STATUS.IN_PROGRESS,
                        label: i18next.t('progress.bar.purchase.order.step.approved'),
                        isReplace: true
                    }, {
                        step: Constants.PURCHASE_ORDER_STATUS.COMPLETED,
                        label: i18next.t('progress.bar.purchase.order.step.completed'),
                        isReplace: true
                    }]}
                />
                <GSContentHeaderRightEl className="d-flex">
                    {stEditorMode === Constants.PURCHASE_ORDER_MODE.CREATE && renderButtonAddMode()}
                    {stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD && renderButtonWizardMode()}
                    {stEditorMode === Constants.PURCHASE_ORDER_MODE.EDIT && renderButtonEditMode()}
                </GSContentHeaderRightEl>
            </div>
        )
    }

    const renderOrderInformation = () => {
        return (
            <GSWidget className="order-information">
                <GSWidgetHeader title={i18next.t('page.purchaseOrderFormEditor.orderInformation.header')}/>
                <GSWidgetContent className="d-flex flex-column">
                    <div className="d-flex align-items-baseline">
                        <span className="title">
                            <GSTrans t="page.purchaseOrderFormEditor.orderInformation.purchaseId"/>
                        </span>
                    </div>
                    <AvField
                        key={stPurchaseOrder?.purchaseId}
                        className={stController.preventChangePurchaseId ? 'disabled' : ''}
                        name="purchaseId"
                        validate={{
                            ...FormValidate.maxLength(12, true)
                        }}
                        onKeyDown={(e) => {
                            e.key === 'Enter' && e.preventDefault()
                        }}
                        onChange={() => setStIsEdited(true)}
                        onBlur={handleBlurPurchaseId}
                        defaultValue={stPurchaseOrder?.purchaseId}
                    />
                    <div className="error mb-2 text-left">{stPurchaseIdError}</div>
                    <div className="d-flex align-items-baseline">
                        <span className="title">
                            <GSTrans t="page.purchaseOrderFormEditor.information.destination"/>
                        </span>
                    </div>
                    <UikSelect
                        key={stSelectedDestination.value + '_' + stRerenderDestination}
                        className={stController.preventChangeBranch ? 'disabled' : ''}
                        defaultValue={stSelectedDestination.value}
                        options={stDestinationBranches}
                        placeholder={i18next.t('page.marketing.discounts.coupons.create.applicableBranch.select')}
                        onChange={handleSelectDestinationBranch}
                    />
                </GSWidgetContent>
            </GSWidget>
        )
    }

    const renderOrderInformationInWizardMode = () => {
        return (
            <GSWidget className="order-information wizard">
                <GSWidgetHeader title={i18next.t('page.purchaseOrderFormEditor.orderInformation.header')}/>
                <GSWidgetContent className="d-flex flex-column">
                    <table>
                        <tbody>
                        <tr>
                            <td className="vertical-align-baseline">
                                <span className="title">
                                    <GSTrans t="page.purchaseOrderFormEditor.information.status"/>:
                                </span>
                            </td>
                            <td>
                                <span className="status">
                                    <GSTrans
                                        t={`progress.bar.purchase.order.step.${(stPurchaseOrder?.status || '').toLowerCase()}`}/>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="vertical-align-baseline">
                                <span className="title">
                                    <GSTrans t="page.purchaseOrderFormEditor.information.destination"/>:
                                </span>
                            </td>
                            <td>
                                {stSelectedDestination.label}
                            </td>
                        </tr>
                        <tr>
                            <td className="vertical-align-baseline">
                                <span className="title">
                                    <GSTrans t="page.purchaseOrderFormEditor.information.createdDate"/>:
                                </span>
                            </td>
                            <td>
                                {getCreatedDate()}
                            </td>
                        </tr>
                        <tr>
                            <td className="vertical-align-baseline">
                                <span className="title">
                                    <GSTrans t="page.purchaseOrderFormEditor.information.createdBy"/>:
                                </span>
                            </td>
                            <td>
                                {stPurchaseOrder?.createdBy || ''}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </GSWidgetContent>
            </GSWidget>
        )
    }

    const renderNote = () => {
        return (
            <GSWidget className="note">
                <GSWidgetHeader title={i18next.t('page.purchaseOrderFormEditor.note.header')}/>
                <GSWidgetContent className="d-flex flex-column">
                    {
                        stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                            ? <span className="p-2">{stNote}</span>
                            : <AvField
                                name="note"
                                type="textarea"
                                rows={3}
                                wrap="hard"
                                maxlength="500"
                                value={stNote}
                                onChange={() => setStIsEdited(true)}
                            />
                    }
                </GSWidgetContent>
                {/*END NOTE*/}
            </GSWidget>
        )
    }

    const renderSupplierInformation = () => {
        return (
            <PurchaseOrderSelectSupplier
                error={stSupplierListError}
                disabled={stController.preventChangeSupplier}
                supplier={stSelectedSupplier}
                onSelect={handleSelectSupplier}
            />
        )
    }

    const renderSearchBox = () => {
        return (
            <div className="search-box-wrapper">
                <span className="search-box">
                    <GSSearchInput
                        ref={refSearchInput}
                        liveSearchOnMS={500}
                        className="flex-grow-1"
                        style={{
                            height: '38px'
                        }}
                        wrapperProps={{
                            style: {
                                height: '38px',
                                width: '100%'
                            }
                        }}
                        defaultValue={stFilter.keyword}
                        placeholder={getPlaceHolderSearch()}
                        onSearch={(keyword, e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setStFilter(filter => ({
                                ...filter,
                                isScroll: false,
                                page: 0,
                                keyword
                            }))
                        }}
                    />
                    {
                        stSearchResult
                            ? <div className="search-result"
                                   style={{zIndex: 5}}
                                   tabIndex="0"
                                   onScroll={handleScroll}>
                                {
                                    stSearchResult.map(r => {
                                        return (
                                            <div className={r.parentId ? "product-item unit" : "product-item"}>
                                                <div
                                                    className={r.parentId ? "d-flex align-items-center container-item" : "d-flex align-items-center"}>
                                                    <div key={r.id}
                                                         className={r.parentId ? "d-flex search-item gsa-hover--gray cursor--pointer unit" : "d-flex search-item gsa-hover--gray cursor--pointer"}
                                                         onClick={() => handleSelectProduct(r)}
                                                    >
                                                        <GSImg src={r.itemImage} width={70} height={70}/>
                                                        <div className="d-flex flex-column ml-3">
                                                            <span>{r.itemName}</span>
                                                            {r.barcode && <span
                                                                className="color-gray font-size-_8rem">{r.barcode.split('-').join(' - ')}</span>}
                                                            {r.modelName && <span
                                                                className="font-size-_8rem">{r.modelName.split('|').filter(n => n !== Constants.DEPOSIT_CODE.FULL).join(' | ')}</span>}
                                                        </div>
                                                        <span
                                                            className="ml-auto mb-auto font-weight-normal font-size-_8em text-right">
                                                        <p className="mb-2">
                                                            <GSTrans
                                                                t="page.purchaseOrderFormEditor.search.inventory"/>:&nbsp;
                                                            <strong>{r.modelStock}</strong>
                                                        </p>
                                                            {r.conversionUnitName &&
                                                            <p style={{color: "#556CE7"}}>
                                                                <span>{i18next.t('page.transfer.stock.table.column.unit')}: </span> {r.conversionUnitName}
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
                                        <GSTrans t={'common.noResultFound'}/>
                                    </p>
                                }
                                {
                                    stIsSearching && <Loading className="mt-3"/>
                                }
                            </div>
                            : stIsSearching &&
                            <div className="search-result" style={{zIndex: 5}}><Loading/></div>
                    }
                </span>
                <UikSelect
                    onChange={searchType => setStFilter(filter => ({
                        ...filter,
                        isScroll: false,
                        page: 0,
                        searchType
                    }))}
                    position={'bottomRight'}
                    value={[stFilter.searchType]}
                    style={{
                        width: '100px'
                    }}
                    className="ml-0 ml-sm-2 mt-2 mt-sm-0"
                    options={Object.values(SEARCH_TYPE)}
                />
            </div>
        )
    }
    
    const findInsufficientStock = (prod) =>{
        if (stInsufficientStock.length === 0){
            return ''
        }
        if(prod.modelId){
            const insufficientStock = stInsufficientStock.find(item=> prod.parentId ? `${item.itemId}-${item.modelId}` === prod.parentId :
                item.modelId ? item.modelId === +(prod.modelId) : item.itemId === +(prod.itemId))
            if (prod.parentId){
                return `${insufficientStock.itemId}-${insufficientStock.modelId}`
            }
            return String(insufficientStock.itemId)
        }else {
            return String(stInsufficientStock.find(item=> prod.parentId ? item.itemId === +(prod.parentId) : item.itemId === +(prod.itemId))?.itemId)
        }
    }

    const renderProductRow = (prod) => {
        const selectedTax = getListTax.find(tax => tax.value === prod.taxSettingId)
        return (
            <tr key={prod.id} className="background-color-white">
                <td className="gs-table-body-item vertical-align-baseline">
                    <div className="col-data">
                        <GSFakeLink
                            onClick={() => RouteUtils.openNewTab(NAV_PATH.productEdit + '/' + prod.itemId)}>{prod.sku || '_'}</GSFakeLink>
                    </div>
                </td>
                <td className="gs-table-body-item">
                    <div className="d-flex align-items-center">
                        <div className="product-image">
                            <GSImg src={prod.itemImage} width={70} height={70}/>
                        </div>
                        <div className="d-flex flex-column ml-3">
                            <span className="product-name">{prod.itemName}</span>
                            {prod.modelName && <span
                                className="font-size-_8rem white-space-pre">{ItemUtils.buildFullModelName(prod.modelLabel, prod.modelName)}</span>}
                        </div>
                    </div>
                </td>
                <td className="gs-table-body-item vertical-align-baseline">
                    <div className="col-data input flex-column">
                        {
                            stController.preventChangeProductQuantity
                                ? <span>{prod.quantity}</span>
                                : <>
                                    <AvFieldCurrency
                                        className={(prod.parentId === findInsufficientStock(prod) || prod.itemId === findInsufficientStock(prod)) ? "error-insufficient-stock" : ""}
                                        name={PRODUCT_PROP.QUANTITY + '_' + prod.id}
                                        unit={Currency.NONE}
                                        value={prod.quantity || 1}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.minValue(1, true),
                                            maxValue: value => {
                                                if (isNaN(parseInt(prod.modelStock))) {
                                                    console.error(`Cannot validate quantity of item ${prod.id} with model stock ${prod.modelStock}`)
                                                }
                                                if (parseInt(value) > 1000000 - parseInt(prod.modelStock)) {
                                                    return i18next.t('page.purchaseOrderFormEditor.table.error.quantity', {x: prod.modelStock})
                                                }

                                                return true
                                            }
                                        }}
                                        onChange={() => {
                                            setStIsEdited(true)
                                            setStInsufficientStock([])
                                            GSToast.error()
                                        }}
                                        onBlur={e => {
                                            setStSelectedProducts(prods => {
                                                const updateProd = prods.find(p => p.id === prod.id)
                                                updateProd.quantity = e.currentTarget.value
                                                return [...prods]
                                            })
                                        }}
                                    />
                                    {
                                        (prod.parentId === findInsufficientStock(prod) || prod.itemId === findInsufficientStock(prod)) &&
                                        <span
                                            className="error">{i18next.t('page.orders.POS.InstorePurchase.error.insufficientStock')}</span>
                                    }
                                </>
                        }
                        {(prod.hasConversion || prod.parentId) &&
                        <p style={{fontSize: "12px"}} className="mt-1">
                            <span>{i18next.t('page.transfer.stock.table.column.unit')}: </span> {prod.conversionUnitName || ' -'}
                        </p>
                        }
                        <IMEISerialLabel
                            itemId={prod.itemId}
                            editorMode={stEditorMode}
                            disabled={stController.preventChangeProductPrice}
                            invalid={prod.error}
                            hidden={prod.inventoryManageType !== Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER || (stPurchaseOrder?.status === Constants.PURCHASE_ORDER_STATUS.CANCELLED && !prod.codeList?.length)}
                            branchList={stStoreBranches}
                            selectedBranchIds={[stSelectedDestination.value]}
                            productName={prod.itemName}
                            modelName={prod.modelName?.split('|').filter(n => n !== Constants.DEPOSIT_CODE.FULL).join(' | ')}
                            maxQuantity={prod.quantity}
                            itemModelCodes={prod.savingCodeList}
                            currentScreen={IMEISerialModal.SHOW_AT_SCREEN.PURCHASE_ORDER_FORM_EDITOR}
                            onCancel={() => handleCancelIMEISerial(prod.id)}
                            onSave={data => handleSaveIMEISerial(prod.id, prod.itemId, prod.modelId, prod.codeList, data)}
                        />
                    </div>
                </td>
                <td className="gs-table-body-item vertical-align-baseline">
                    <div className="col-data input">
                        <div className="number m-auto">
                            <div>{
                                stController.preventChangeProductPrice
                                    ? <span>{CurrencyUtils.formatMoneyByCurrency(prod.importPrice, currency)}</span>
                                    : 
                                    <AvFieldCurrency
                                        name={PRODUCT_PROP.IMPORT_PRICE + '_' + prod.id}
                                        unit={Currency.NONE}
                                        precision={CurrencyUtils.isCurrencyInput(currency) && '2'}
                                        decimalScale={CurrencyUtils.isCurrencyInput(currency) && 2}
                                        value={prod.importPrice || prod.costPrice || 0}
                                        validate={{
                                            ...FormValidate.required(),
                                            ...FormValidate.minValue(0, true),
                                            ...FormValidate.maxValue(99_999_999_999, true)
                                        }}
                                        onChange={() => {
                                            setStIsEdited(true)
                                        }}
                                        onBlur={e => {
                                            setStSelectedProducts(prods => {
                                                const updateProd = prods.find(p => p.id === prod.id)
                                                updateProd.importPrice = e.currentTarget.value

                                                return [...prods]
                                            })
                                        }}
                                    />
                            }
                            </div>
                            <PriceAndVATEditor
                                disabled={stController.preventChangeProductPrice}
                                taxId={prod.taxSettingId}
                                itemModelId={prod.id}
                                selectedTax={selectedTax?.label}
                                onSelected={handleSelectTax}
                                lstTax={getListTax}
                            />
                        </div>
                    </div>
                </td>
                <td className="gs-table-body-item vertical-align-baseline">
                    <div className="col-data justify-content-end">
                        <span>{getProductTotalRow(prod.id)}</span>
                        {
                            !stController.hiddenDeleteProduct
                            && <GSButton className="delete" onClick={(e) => handleDeleteProduct(e, prod.id)}>
                                <img src="/assets/images/icon-delete.png" alt="remove product"/>
                            </GSButton>
                        }
                    </div>
                </td>
            </tr>
        )
    }

    const renderSummaryRows = () => {
        if (!stSelectedProducts.length) {
            return
        }

        return (
            <>
                <PurchaseOrderCostModal
                    editorMode={stEditorMode}
                    purchaseCosts={stPurchaseOrder?.purchaseCosts}
                    getListCost={getListCost}
                    closeModalPrice={closeModalPrice}
                    openModalPrice={stModalPrice}
                    currency={currency}
                />
                <div className="custom-row">
                    <td colSpan={3}/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-500">
                        <div className="d-flex h-100 align-items-center ml-xl-4">
                            <GSTrans t="page.purchaseOrderFormEditor.table.summary.quantity"/>
                        </div>
                    </td>
                    <td>
                        <div className="text-right">
                            <span
                                className="font-weight-bold">{
                                NumberUtils.formatThousand(stSelectedProducts.reduce((acc, curr) => acc + parseInt(curr.quantity || 1), 0))
                            }</span>
                            &nbsp;
                            <GSTrans t="page.purchaseOrderFormEditor.table.total.summary.product"/>
                        </div>
                    </td>
                </div>
                <div className="custom-row">
                    <td colSpan={3}/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-500">
                        <div className="d-flex h-100 align-items-center ml-xl-4">
                            <GSTrans t="page.purchaseOrderFormEditor.table.summary.subTotal"/>
                        </div>
                    </td>
                    <td>
                        <div className="text-right">
                            {getSubTotal()}
                        </div>
                    </td>
                </div>
                <div className="custom-row">
                    <td colSpan={3}/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-500">
                        <div className="d-flex h-100 align-items-center ml-xl-4">
                            <GSTrans t="page.setting.VAT.table.tax"/>
                        </div>
                    </td>
                    <td>
                        <div className="text-right">
                            {getTotalTax()}
                        </div>
                    </td>
                </div>
                <div className="custom-row">
                    <td colSpan={3}/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-500">
                        <div className="d-flex h-100 align-items-center">
                            <PurchaseOrderDiscountModal
                                value={stPurchaseOrder?.discount?.value}
                                type={stPurchaseOrder?.discount?.type}
                                editorMode={stEditorMode}
                                getDiscount={getDiscount}
                                getSubTotal={subTotalToDiscount()}
                                currency={currency}
                            />
                        </div>
                    </td>
                    <td>
                        <div className="text-right">
                            {getPriceDiscount()}
                        </div>
                    </td>
                </div>
                <div className="custom-row">
                    <td colSpan={3}/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-500">
                        <div className="d-flex h-100 align-items-center ml-xl-4 color-blue purchase-cost">
                            <p className="mb-0" onClick={() => {
                                setStModalPrice(true)
                            }}><GSTrans t="page.purchaseOrderFormEditor.table.summary.cost"/></p>
                        </div>
                    </td>
                    <td>
                        <div className="text-right">
                            {CurrencyUtils.formatMoneyByCurrency(stTotalCost, currency)}
                        </div>
                    </td>
                </div>
                <div className="custom-row">
                    <td colSpan={3}/>
                    <td className="gs-table-body-item vertical-align-baseline font-weight-bold">
                        <div
                            className="d-flex h-100 align-items-center ml-xl-4 font-size-1_5rem">
                            <GSTrans t="page.purchaseOrderFormEditor.table.summary.total"/>
                        </div>
                    </td>
                    <td>
                        <div className="text-right font-size-1_2rem">
                            {CurrencyUtils.formatDigitMoneyByCustom(getTotal(), currency, defaultPrecision)}
                        </div>
                    </td>
                </div>
            </>
        )
    }

    const renderProductList = () => {
        return (
            <GSWidget className="product-list">
                <GSWidgetHeader className="title"
                                title={i18next.t('page.purchaseOrderFormEditor.productInformation.header')}/>

                {/*PRODUCT LIST*/}
                <GSWidgetContent className="d-flex flex-column">
                    {!stController.hiddenSearchProduct && renderSearchBox()}
                    {
                        stInsufficientStock.length > 0 &&
                        <div className="insufficient-stock d-flex mt-3">
                            <img className="mr-2" src="/assets/images/et-o-et.png" alt=""/>
                            <p className="error mb-0 text-left">{i18next.t('page.purchaseOrderFormEditor.insufficientStock.content')}</p>
                        </div>
                    }
                    {
                        <div className="table">
                            <GSTable>
                                <colgroup>
                                    <col style={{width: '13%'}}/>
                                    <col style={{width: '47%'}}/>
                                    <col style={{width: '14%'}}/>
                                    <col style={{width: '26%'}}/>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>{HEADER.SKU}</th>
                                    <th>{HEADER.PRODUCT_NAME}</th>
                                    <th>{HEADER.QUANTITY}</th>
                                    <th className="text-center">{HEADER.IMPORT_PRICE}</th>
                                    <th>{HEADER.TOTAL}</th>
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
                        renderSummaryRows()
                    }
                    <div className="error">{stProductListError}</div>
                </GSWidgetContent>
                {/*END PRODUCT LIST*/}
            </GSWidget>
        )
    }

    const renderHistory = () => {
        return (
            <PurchaseOrderHistory purchaseOrderId={purchaseOrderId}/>
        )
    }

    return (
        <>
            <PrintTeamplatePurchaseOrder
                hidden
                ref={refPrintReceiptRef}
                orderId={stPurchaseOrder && stPurchaseOrder.purchaseId}
                orderDate={stTimelines}
                storeInfo={state.storeInfo}
                user={[stSelectedSupplier]}
                productList={[stSelectedProducts]}
                discount={stDiscount}
                totalTax={getTotalTax()}
                listTax={[getListTax]}
                cost={stTotalCost}
                note={stNote}
                langCode={CredentialUtils.getLangKey()}
            />
            <ConfirmModal ref={refConfirmModal}/>
            <AlertModal ref={refAlertModal}/>
            {stShowLoading && <LoadingScreen zIndex={9999}/>}
            <GSContentContainer confirmWhenRedirect
                                confirmWhen={stIsEdited && stEditorMode !== Constants.PURCHASE_ORDER_MODE.WIZARD}
                                isSaving={stIsSaving}
                                className="purchase-order-form-editor">
                <GSContentHeader>
                    {renderHeader()}
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX}>
                    <AvForm ref={refForm} onValidSubmit={handleOnValidSubmit} autoComplete="off"
                            className="content-wrapper">
                        <div className="order-information-wrapper">
                            {
                                stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD
                                    ? renderOrderInformationInWizardMode()
                                    : renderOrderInformation()
                            }
                        </div>
                        <div className="product-list-wrapper">
                            {renderSupplierInformation()}
                        </div>
                        <div className="clearfix">
                            <div className="product-list-wrapper">
                                {renderProductList()}
                            </div>
                            <div className="note-wrapper">
                                {renderNote()}
                                {stEditorMode === Constants.PURCHASE_ORDER_MODE.WIZARD && purchaseOrderId && renderHistory()}
                            </div>
                        </div>
                    </AvForm>
                </GSContentBody>
            </GSContentContainer>
        </>
    )
}

export default PurchaseOrderFormEditor
