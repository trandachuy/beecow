/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 28/03/2019
 * Author: Kun <hai.hoang.nguyen@mediastep.com>
 *******************************************************************************/
import {UikInput, UikSelect} from '../../../@uik'

import {connect} from 'react-redux'
import './InventoryList.sass'
import React, {Component} from 'react'
import {Trans} from 'react-i18next'
import {ItemService} from '../../../services/ItemService'
import i18next from 'i18next'
import PagingTable from '../../../components/shared/table/PagingTable/PagingTable'
import Loading, {LoadingStyle} from '../../../components/shared/Loading/Loading'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import GSComponentTooltip, {GSComponentTooltipPlacement} from '../../../components/shared/GSComponentTooltip/GSComponentTooltip'
import GSStatusTag from '../../../components/shared/GSStatusTag/GSStatusTag'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {ImageUtils} from '../../../utils/image'
import {NumberUtils} from '../../../utils/number-format'
import GSContentHeaderTitleWithExtraTag
    from '../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag'
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent'
import GSTable from '../../../components/shared/GSTable/GSTable'
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSButton from '../../../components/shared/GSButton/GSButton'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import {NAV_PATH} from '../../../components/layout/navigation/Navigation'
import {RouteUtils} from '../../../utils/route'
import storeService from '../../../services/StoreService'
import GSFakeLink from '../../../components/shared/GSFakeLink/GSFakeLink'
import ProductMultipleBranchStockEditorModal
    from '../ProductFormEditor/MultipleBranchStockEditorModal/ProductMultipleBranchStockEditorModal'
import {InventoryEnum} from './InventoryEnum'
import Constants from '../../../config/Constant'
import {GSToast} from '../../../utils/gs-toast'
import HintPopupVideo from '../../../components/shared/HintPopupVideo/HintPopupVideo'
import {ItemUtils} from '../../../utils/item-utils'
import IMEISerialModal from '../../../components/shared/managedInventoryModal/IMEISerialModal/IMEISerialModal'
import {array, bool, func, number, string} from 'prop-types'
import {NavigationPath} from '../../../config/NavigationPath'
import ConversionHoverButton from "../../../components/shared/ConversionHoverButton/ConversionHoverButton";


const INVENTORY_TYPE = {
    IMEI_SERIAL_NUMBER: 'IMEI_SERIAL_NUMBER'
}

class InventoryList extends Component {
    SIZE_PER_PAGE = 100

    constructor(props) {
        super(props)
        this.state = {
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            isFetching: false,
            filterCount: 0,
            isShowPrintModal: false,
            branchListFilter: [{
                label: i18next.t`component.product.edit.toolbar.branch.all`,
                value: 'ALL'
            }],
            branchInfoList: [],
            isShowUpdateStockModal: false,
            selectedItem: undefined,
            isSaving: false,
            managedInventoryModal: {
                toggle: false,
                selectedBranchIds: [],
                branchList: [],
                productName: '',
                modelName: ''
            },
            stConversions: []
        }

        this.tableConfig = {
            headerList: [
                i18next.t('inventoryList.tbheader.thumbnail'),
                i18next.t('inventoryList.tbheader.variationName'),
                i18next.t('inventoryList.tbheader.barcode'),
                i18next.t('inventoryList.tbheader.price'),
                i18next.t('inventoryList.tbheader.remainStock'),
                i18next.t('inventoryList.tbheader.goodDelivered'),
                i18next.t('inventoryList.tbheader.goodInTransaction'),
                i18next.t('inventoryList.tbheader.status')
            ]
        }

        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.filterByStatus = this.filterByStatus.bind(this)
        this.filter = this.filter.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.onInputSearch = this.onInputSearch.bind(this)
        this.sort = this.sort.bind(this)
        this.onClickUpdateStock = this.onClickUpdateStock.bind(this)
        this.getDataTableForUpdateStock = this.getDataTableForUpdateStock.bind(this)
        this.onClickCancelUpdateStock = this.onClickCancelUpdateStock.bind(this)
        this.onSaveStock = this.onSaveStock.bind(this)
        this.buildUpdateStockRequestBody = this.buildUpdateStockRequestBody.bind(this)
        this.handleToggleInventoryModal = this.handleToggleInventoryModal.bind(this)
        this.handleSaveInventoryModal = this.handleSaveInventoryModal.bind(this)
        this.handleUpdateProductStock = this.handleUpdateProductStock.bind(this)
        this.handleShowIMEISerialStockModal = this.handleShowIMEISerialStockModal.bind(this)
        this.onClickInventoryRow = this.onClickInventoryRow.bind(this)

        this.filterStatusValues = [
            {
                value: 'ALL',
                label: i18next.t('component.inventory.edit.toolbar.status.all')
            },
            {
                value: 'ACTIVE',
                label: i18next.t('component.inventory.edit.toolbar.status.active')
            },
            {
                value: 'INACTIVE',
                label: i18next.t('component.inventory.edit.toolbar.status.inactive')
            },
            {
                value: 'ERROR',
                label: i18next.t('component.inventory.edit.toolbar.status.error')
            }
        ]

        this.sorterValues = [
            {
                value: 'priority,asc',
                label: i18next.t('inventoryList.sort.priority.highToLow')
            },
            {
                value: 'priority,desc',
                label: i18next.t('inventoryList.sort.priority.lowToHigh')
            },
            {
                value: 'remainingItem,asc',
                label: i18next.t('inventoryList.sort.remainStock.highToLow')
            },
            {
                value: 'remainingItem,desc',
                label: i18next.t('inventoryList.sort.remainStock.lowToHigh')
            }
        ]

        this.filterConfig = {
            status: this.filterStatusValues[0].value.toUpperCase(),
            sort: 'priority,asc',
            search: '',
            branch: 'ALL'
        }
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        })

        this.fetchData(pageIndex, this.SIZE_PER_PAGE, this.filterConfig)
    }

    componentDidMount() {
        this._isMounted = true
        this.fetchData(1, this.SIZE_PER_PAGE, this.filterConfig)

        storeService.getFullStoreBranches(0, 9999)
            .then(res => {
                const branchList = res.data
                const branchListFilter = []

                branchListFilter.push(...branchList.map(b => ({
                    label: b.name,
                    value: b.id
                })))

                storeService.getActiveStoreBranches(0, 9999)
                    .then(actBranchList => {
                        this.setState(state => ({
                            branchInfoList: actBranchList,
                            branchListFilter: [...state.branchListFilter, ...branchListFilter]
                        }), () => {
                            this.filter()
                        })
                    })


            })
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    filter() {
        // count filter
        let filterCount = 0
        if (this.filterConfig.status !== this.filterStatusValues[0].value.toUpperCase()) filterCount++
        this.setState({
            currentPage: 1,
            filterCount: filterCount
        })

        this.fetchData(1, this.SIZE_PER_PAGE, this.filterConfig)
    }

    sort(sortValue) {
        this.filterConfig.sort = sortValue
        this.filter()
    }

    filterByStatus(status) {
        this.filterConfig.status = status.toUpperCase()
        this.filter()
    }

    filterByBranch(branchId) {
        this.filterConfig.branch = branchId
        this.filter()
    }

    fetchData(page, size, filterConfig) {
        if (this.state.branchListFilter.length === 1) return

        this.setState({
            isFetching: true
        })

        const sortQuery = filterConfig.sort.split('|')

        ItemService.fetchInventoryItems({
            page: page - 1,
            size: size,
            filter: filterConfig.status === 'ALL' ? null : filterConfig.status,
            sort: sortQuery,
            search: filterConfig.search,
            branchIds: filterConfig.branch === 'ALL' ? this.state.branchListFilter.map(b => b.value).join(',').replace(/ALL(,|)/g, '') : filterConfig.branch
        }).then(result => {
            const totalItem = parseInt(result.headers['x-total-count'])
            if (this._isMounted) {
                this.setState({
                    itemList: result.data,
                    totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                    isFetching: false,
                    totalItem: totalItem
                })
            }
        }, () => {
            if (this._isMounted) {
                this.setState({
                    isFetching: false
                })
            }
        })
    }

    onInputSearch(e) {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            this.filterConfig.search = value
            this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
            e.preventDefault()
        }, 1000)
    }

    renderStatus(status) {
        let text = 'component.inventory.edit.toolbar.status.'
        let toolTips, tagStyle
        switch (status) {
            case 'ACTIVE':
                text += 'active'
                toolTips = 'active'
                tagStyle = GSStatusTag.STYLE.SUCCESS
                break
            case 'INACTIVE':
                text += 'inactive'
                toolTips = 'inactive'
                tagStyle = GSStatusTag.STYLE.WARNING
                break
            case 'ERROR':
                text += 'error'
                toolTips = 'error'
                tagStyle = GSStatusTag.STYLE.DANGER
                break
        }
        return (
            <GSComponentTooltip message={ i18next.t(`inventoryList.toolTips.status.${ toolTips }`) }
                                placement={ GSComponentTooltipPlacement.LEFT }>
                <GSStatusTag tagStyle={ tagStyle } text={ i18next.t(text) }/>
            </GSComponentTooltip>
        )
    }

    /**
     * @return {
     *     {
     *        id: PropTypes.number,
        name: PropTypes.string,
        index: PropTypes.number,
        label: PropTypes.array,
        lstInventory: PropTypes.arrayOf(PropTypes.shape({
            branchId: PropTypes.number,
            stock: PropTypes.number,
            newStock: PropTypes.number,
            updateType: PropTypes.string,
     *     }[]
     * }
     */
    getDataTableForUpdateStock() {
        /**
         * @type {InventorySummaryBranchModel} ivtSummary
         */
        const ivtSummary = this.state.selectedItem.ivtSummary
        const { variationLength, item } = this.state.selectedItem

        // add new branch into request
        const branches = ivtSummary.branches
        this.state.branchInfoList.forEach(b => {
            const foundBranch = branches.find(nBranch => nBranch.branchId === b.id)
            if (!foundBranch) {
                branches.push({
                    branchId: b.id,
                    remainingItem: 0
                })
            }
        })

        const buildDataTableForProductHasNoVariation = () => {
            const result = [{
                id: item.id,
                index: 0,
                lstInventory: branches.map(b => {
                    return {
                        branchId: b.branchId,
                        stock: b.remainingItem,
                        newStock: b.remainingItem,
                        orgStock: b.remainingItem
                    }
                })
            }]
            return result
        }

        const buildDataTableForProductHasVariation = () => {
            // append new branches
            const getVariationNames = (vName) => {

                const refineModelName = vName.split('|').filter(eachName => eachName !== Constants.DEPOSIT.PERCENT_100)
                return refineModelName
            }

            const getLabels = (labelStr) => {
                if (!labelStr) { // => product from gomua.vn
                    return [i18next.t`component.product.addNew.variations.title`]
                }
                const refineLabel = labelStr.split('|').filter(eachName => eachName !== Constants.DEPOSIT.DEPOSIT_CODE)
                return refineLabel
            }

            const result = [{
                id: item.id,
                name: getVariationNames(ivtSummary.modelValue),
                index: 0,
                label: getLabels(ivtSummary.label),
                lstInventory: branches.map(b => {
                    return {
                        branchId: b.branchId,
                        stock: b.remainingItem,
                        newStock: b.remainingItem,
                        orgStock: b.remainingItem
                    }
                })
            }]
            return result
        }


        if (ivtSummary.modelId) { // has model
            return buildDataTableForProductHasVariation()
        } else { // has no model
            return buildDataTableForProductHasNoVariation()
        }

        return []
    }

    async handleUpdateProductStock(item) {
        this.setState({
            isSaving: true
        })
        const [itemId, modelId] = item.id.split('-')
        /**
         * @type {InventorySummaryBranchModel}
         */
        const inventorySummaryBranch = await ItemService.getInventorySummaryBranchesDetail({ itemId, modelId })
        this.setState({
            selectedItem: {
                ivtSummary: inventorySummaryBranch,
                variationLength: inventorySummaryBranch.modelId ? 1 : 0,
                item: item
            },
            isShowUpdateStockModal: true,
            isSaving: false
        })
    }

    handleShowIMEISerialStockModal(item) {
        this.setState({
            isSaving: true
        })
        Promise.all([
            ItemService.getInventorySummaryBranchesDetail({
                itemId: item.productId,
                modelId: item.variationId
            }),
            ItemService.getCodeByItemModelIds([item.id], Constants.ITEM_MODE_CODE_STATUS.AVAILABLE)
        ])
            .then(([inventorySummaryBranch, itemModelCodes]) => {
                const filterBranches = this.filterConfig.branch === 'ALL'
                    ? this.state.branchInfoList.map(b => b.id)
                    : [this.filterConfig.branch]

                this.setState({
                    isSaving: false,
                    managedInventoryModal: {
                        toggle: true,
                        itemId: item.productId,
                        selectedBranchIds: filterBranches,
                        branchList: this.state.branchInfoList,
                        modelId: item.variationId,
                        productName: item.itemName,
                        modelLabel: inventorySummaryBranch.label,
                        modelName: inventorySummaryBranch.modelValue,
                        itemModelCodes
                    }
                })
            })
    }

    onClickUpdateStock(item) {
        switch (item.inventoryType) {
            case Constants.INVENTORY_MANAGE_TYPE.IMEI_SERIAL_NUMBER:
                this.handleShowIMEISerialStockModal(item)
                break
            default:
                this.handleUpdateProductStock(item)
        }
    }

    onClickCancelUpdateStock() {
        this.setState({
            isShowUpdateStockModal: false
        }, () => {
            this.setState({
                selectedItem: undefined
            })
        })
    }

    /**
     * @param {Number} stStockChange
     * @param {"CHANGE"|"SET"} stUpdateStockType
     * @param {UpdateStockDataRowModel[]} stDataTable
     */
    onSaveStock(stStockChange, stUpdateStockType, stDataTable) {
        this.setState({
            isShowUpdateStockModal: false,
            isSaving: true
        })
        const request = this.buildUpdateStockRequestBody(stDataTable)
        ItemService.updateInventoryStock(request)
            .then(() => {
                GSToast.commonUpdate()
                // re-load
                this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                this.setState({
                    isSaving: false

                }, () => {
                    this.setState({
                        selectedItem: undefined
                    })
                })
            })
    }

    /**
     * @param {UpdateStockDataRowModel[]} stDataTable
     * @return {UpdateInventoryStockRequestModel}
     */
    buildUpdateStockRequestBody(stDataTable) {
        const fRow = stDataTable[0]

        const [itemId, modelId] = fRow.id.split('-')

        /**
         * @type {UpdateInventoryStockRequestLstInventoryModel[]}
         */
        const lstInventory = fRow.lstInventory.map(orgIvt => {
            let inventoryStock = orgIvt.newStock
            if (orgIvt.updateType === InventoryEnum.ACTIONS.CHANGE_STOCK) {
                inventoryStock = orgIvt.newStock - orgIvt.orgStock
            }

            return {
                branchId: orgIvt.branchId,
                inventoryCurrent: orgIvt.orgStock,
                inventoryStock: inventoryStock,
                inventoryType: orgIvt.updateType
            }
        })

        /**
         * @type {UpdateInventoryStockRequestModel}
         */
        const result = {
            itemId, modelId, lstInventory
        }


        return result
    }

    handleToggleInventoryModal() {
        this.setState(state => ({
            managedInventoryModal: {
                ...state.managedInventoryModal,
                toggle: false
            }
        }))
    }

    handleSaveInventoryModal(data) {
        const { itemId, modelId, itemModelCodes } = this.state.managedInventoryModal
        const lstInventory = IMEISerialModal.mapSaveDataToInventoryList(itemId, modelId, itemModelCodes, data)
        const saveData = IMEISerialModal.mapSaveDataToItemModelCodes(itemId, modelId, itemModelCodes, data)

        const request = {
            itemId,
            modelId,
            lstInventory,
            itemModelCodeDTOS: saveData
        }

        this.setState(current=> ({
            managedInventoryModal: {
                ...current.managedInventoryModal,
                toggle: false
            },
            isSaving: true
        }))

        ItemService.updateInventoryStock(request)
            .then(() => {
                GSToast.commonUpdate()
                this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)
            })
            .catch(() => {
                GSToast.commonError()
            })
            .finally(() => {
                this.setState({
                    isSaving: false
                })
            })
    }

    onClickInventoryRow(e, itemRow) {
        if (e.target.id === 'remaining-item-number') {
            return
        }

        if (itemRow.inventoryType === INVENTORY_TYPE.IMEI_SERIAL_NUMBER) {
            const id = itemRow.id
            const itemName = itemRow.itemName
            const modelName = itemRow.modelName
            RouteUtils.redirectWithoutReload(this.props,
                NavigationPath.inventoryTracking + `/${ id }?itemName=${ itemName }${ modelName ? '&modelName=' + modelName : '' }`
            )
        }
    }

    handleConversionHover(itemModelId, quantity) {
        this.setState({stConversions: []})
        ItemService.getConversionUnitItemByItemModelId(itemModelId, quantity)
            .then(conversions => {
                this.setState({ stConversions: conversions?.conversionItemList })
            })
    }

    render() {
        return (
            <>
                { this.state.selectedItem &&
                <ProductMultipleBranchStockEditorModal
                    branchList={ this.state.branchInfoList }
                    isOpen={ this.state.isShowUpdateStockModal }
                    selected={ this.state.branchInfoList.map(b => b.id) }
                    variationLength={ this.state.selectedItem.variationLength }
                    dataTable={ this.getDataTableForUpdateStock() }
                    prodName={ this.state.selectedItem.item.productName }
                    onCancel={ this.onClickCancelUpdateStock }
                    updateLabel={ i18next.t`common.btn.save` }
                    onSave={ this.onSaveStock }
                    branchId={ this.filterConfig.branch }
                /> }
                <IMEISerialModal
                    currentScreen={IMEISerialModal.SHOW_AT_SCREEN.INVENTORY_LIST}
                    onToggle={ this.handleToggleInventoryModal }
                    onSave={ this.handleSaveInventoryModal }
                    { ...this.state.managedInventoryModal }
                />
                <GSContentContainer className="inventory-list-page"
                                    minWidthFitContent
                                    isSaving={ this.state.isSaving }
                >
                    <GSContentHeader className="gs-page-title" title={
                        <GSContentHeaderTitleWithExtraTag title={ i18next.t('inventoryList.pageTitle') }
                                                          extra={ this.state.totalItem }
                        />
                    }>
                        <HintPopupVideo title={ 'Inventory' }
                                        category={ 'INVENTORY_LIST' }/>
                        <GSContentHeaderRightEl>
                            <GSButton success outline
                                      onClick={ () => RouteUtils.redirectWithoutReload(this.props, NAV_PATH.inventoryHistory) }>
                                <GSTrans t={ 'page.inventory.btn.inventoryHistory' }/>
                            </GSButton>
                        </GSContentHeaderRightEl>
                    </GSContentHeader>

                    <GSContentBody size={ GSContentBody.size.MAX } className="inventory-list__body">
                        {/*PRODUCT LIST*/ }
                        <GSWidget>

                            <GSWidgetContent className="inventory-list-widget">
                                {/*DESKTOP VERSION*/ }
                                <div
                                    className={ 'n-filter-container d-mobile-none d-desktop-flex ' + (this.state.isFetching ? 'gs-atm--disable' : '') }>
                                    {/*SEARCH*/ }
                                    <span style={ {
                                        marginRight: 'auto'
                                    } } className="search-box__wrapper">
                                <UikInput
                                    key={this.filterConfig.search}
                                    defaultValue={this.filterConfig.search}
                                    autoFocus={this.filterConfig.search.length > 0 ? true : false}
                                    onChange={this.onInputSearch}
                                    icon={ (
                                        <FontAwesomeIcon icon="search"/>
                                    ) }
                                    placeholder={ i18next.t('inventoryList.search.placeholder') }
                                />
                            </span>

                                    {/*BRANCH*/ }
                                    <UikSelect
                                        defaultValue={ 'ALL' }
                                        options={ this.state.branchListFilter }
                                        onChange={ (item) => this.filterByBranch(item.value) }
                                    />
                                    {/*STATUS*/ }
                                    <UikSelect
                                        defaultValue={ this.filterStatusValues[0].value }
                                        options={ this.filterStatusValues }
                                        onChange={ (item) => this.filterByStatus(item.value) }
                                    />
                                    {/*SORTER*/ }
                                    <UikSelect
                                        defaultValue={ this.filterConfig.sort }
                                        options={ this.sorterValues }
                                        onChange={ (item) => {
                                            this.sort(item.value)
                                        } }
                                    />
                                </div>
                                { this.state.isFetching &&
                                <Loading style={ LoadingStyle.DUAL_RING_GREY }/>
                                }

                                { !this.state.isFetching &&
                                <>
                                    <GSTable style={ {
                                        marginTop: '14px'
                                    } }>
                                        <thead>
                                        <tr>
                                            <th>
                                                { i18next.t('inventoryList.tbheader.thumbnail') }
                                            </th>
                                            <th style={ {
                                                minWidth: '15rem'
                                            } }>
                                                { i18next.t('inventoryList.tbheader.variationName') }
                                            </th>
                                            <th className="text-center">
                                                { i18next.t('inventoryList.tbheader.remainStock') }
                                            </th>
                                            <th>
                                                { i18next.t('inventoryList.tbheader.goodDelivered') }
                                            </th>
                                            <th>
                                                { i18next.t('inventoryList.tbheader.goodInTransaction') }
                                            </th>
                                            <th>
                                                { i18next.t('inventoryList.tbheader.status') }
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        { this.state.itemList.map((item, index) => (
                                            <tr key={ item.id }
                                                className={ item.inventoryType === INVENTORY_TYPE.IMEI_SERIAL_NUMBER ? 'gsa-hover--gray cursor--pointer' : '' }
                                                onClick={ e => this.onClickInventoryRow(e, item) }
                                            >
                                                <td>
                                                    {
                                                        item.urlPrefix &&
                                                        <img src={ ImageUtils.getImageFromImageModel(item, 100) }
                                                             style={ {
                                                                 width: '4em',
                                                                 height: '4em'
                                                             } }
                                                        />
                                                    }

                                                    {
                                                        !item.urlPrefix &&
                                                        <img src={ '/assets/images/default_image.png' }
                                                             style={ {
                                                                 width: '4em',
                                                                 height: '4em'
                                                             } }/>
                                                    }

                                                </td>
                                                <td style={ {
                                                    minWidth: '10rem',
                                                    whiteSpace: 'nowrap'
                                                } }>
                                                    <b style={ {
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '20rem',
                                                        overflowX: 'hidden',
                                                        display: 'block'
                                                    } }>{ ItemUtils.escape100Percent(item.productName) }</b>
                                                </td>
                                                <td className="gs-table-body-item remainingItem text-center">
                                                    <GSFakeLink id="remaining-item-number"
                                                                onClick={ () => this.onClickUpdateStock(item) }>
                                                        { NumberUtils.formatThousand(item.remainingItem) }
                                                    </GSFakeLink>
                                                    <ConversionHoverButton
                                                        hidden={ !item.hasConversion }
                                                        conversions={ this.state.stConversions }
                                                        onHover={ () => this.handleConversionHover(item.id, item.remainingItem) }
                                                    >
                                                        <tbody>
                                                        {
                                                            this.state.stConversions.map(({ unitName, quantity }, index) => (
                                                                <tr key={ index }>
                                                                    <td>{ unitName }</td>
                                                                    <td>{ NumberUtils.formatThousandFixed(quantity, 2) }</td>
                                                                </tr>
                                                            ))
                                                        }
                                                        </tbody>
                                                    </ConversionHoverButton>
                                                    <p className="mb-0">
                                                        { this.filterConfig.branch === 'ALL' && !!item.totalBranches &&
                                                        <GSTrans t="component.product.table.branch.number" values={ {
                                                            branch: item.totalBranches
                                                        } }
                                                        />
                                                        }
                                                    </p>

                                                </td>
                                                <td className="gs-table-body-item soldItem">
                                                    <span className="text-center">
                                                        {item.soldItem}
                                                        <ConversionHoverButton
                                                            hidden={!item.hasConversion}
                                                            conversions={this.state.stConversions}
                                                            onHover={() => this.handleConversionHover(item.id, item.soldItem)}
                                                        >
                                                        <tbody>
                                                        {
                                                            this.state.stConversions.map(({
                                                                                              unitName,
                                                                                              quantity
                                                                                          }, index) => (
                                                                <tr key={index}>
                                                                    <td>{unitName}</td>
                                                                    <td>{NumberUtils.formatThousandFixed(quantity, 2)}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                        </tbody>
                                                    </ConversionHoverButton>
                                                    </span>
                                                </td>
                                                <td className="gs-table-body-item transactionItem">
                                                    <span className="text-center">
                                                    {item.transactionItem}
                                                        <ConversionHoverButton
                                                            hidden={!item.hasConversion}
                                                            conversions={this.state.stConversions}
                                                            onHover={() => this.handleConversionHover(item.id, item.transactionItem)}
                                                        >
                                                        <tbody>
                                                        {
                                                            this.state.stConversions.map(({
                                                                                              unitName,
                                                                                              quantity
                                                                                          }, index) => (
                                                                <tr key={index}>
                                                                    <td>{unitName}</td>
                                                                    <td>{NumberUtils.formatThousandFixed(quantity, 2)}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                        </tbody>
                                                    </ConversionHoverButton>
                                                    </span>
                                                </td>
                                                <td className="gs-table-body-item status">
                                                    { this.renderStatus(item.status) }
                                                </td>
                                            </tr>
                                        )) }
                                        </tbody>
                                    </GSTable>
                                    <PagingTable
                                        totalPage={ this.state.totalPage }
                                        maxShowedPage={ 10 }
                                        currentPage={ this.state.currentPage }
                                        onChangePage={ this.onChangeListPage }
                                        totalItems={ this.state.itemList.length }
                                        className="d-mobile-none d-desktop-block"
                                        hidePagingEmpty
                                    >
                                    </PagingTable>
                                    <PagingTable
                                        totalPage={ this.state.totalPage }
                                        maxShowedPage={ 1 }
                                        currentPage={ this.state.currentPage }
                                        onChangePage={ this.onChangeListPage }
                                        totalItems={ this.state.itemList.length }
                                        className="m-paging d-mobile-flex d-desktop-none"
                                    />

                                    { this.state.itemList.length === 0 &&
                                    <div
                                        className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                        <div>
                                            <img src="../assets/images/icon-Empty.svg"/>
                                            { ' ' }
                                            <span>
                                                <Trans i18nKey="page.product.list.table.empty.text"/>
                                            </span>
                                        </div>
                                    </div>
                                    }
                                </>
                                }
                            </GSWidgetContent>
                        </GSWidget>
                    </GSContentBody>
                </GSContentContainer>
            </>
        )
    }
}


export default connect()(InventoryList)
