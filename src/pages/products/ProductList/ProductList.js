/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 28/03/2019
 * Author: Kun <hai.hoang.nguyen@mediastep.com>
 *******************************************************************************/

import '@sass/ui/_gswidget.sass';
import '@sass/ui/_gsfrm.sass';
import {UikCheckbox, UikInput, UikSelect} from '../../../@uik';

import moment from 'moment';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import './ProductList.sass';
import React, {Component} from 'react';
import {Trans} from 'react-i18next';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {ItemService} from '@services/ItemService';
import i18next from 'i18next';
import PagingTable from '@shared/table/PagingTable/PagingTable';
import {CurrencyUtils, NumberUtils} from '@utils/number-format';
import Loading, {LoadingStyle} from '@shared/Loading/Loading';
import GSContentContainer from '@layout/contentContainer/GSContentContainer';
import GSContentHeader from '@layout/contentHeader/GSContentHeader';
import GSContentBody from '@layout/contentBody/GSContentBody'
import {ImageUtils} from '@utils/image';
import {RouteUtils} from '@utils/route';
import GSComponentTooltip, {GSComponentTooltipPlacement} from '@shared/GSComponentTooltip/GSComponentTooltip';
import GSStatusTag from '@shared/GSStatusTag/GSStatusTag';
import GSContentHeaderRightEl from '@layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import GSTrans from '@shared/GSTrans/GSTrans';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import GSButton from '@shared/GSButton/GSButton';
import {NAV_PATH} from '@layout/navigation/Navigation';
import GSContentHeaderTitleWithExtraTag from '@layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag';
import GSWidget from '@shared/form/GSWidget/GSWidget';
import GSWidgetContent from '@shared/form/GSWidget/GSWidgetContent';
import ProductListBarcodePrinter from './BarcodePrinter/ProductListBarcodePrinter';
import {AvField, AvForm, AvRadio, AvRadioGroup} from 'availity-reactstrap-validation';
import GSModalBootstrap from '@shared/GSModalBootstrap/GSModalBootstrap';
import {DownloadUtils} from '@utils/download';
import ProductImport from '../ProductList/ProductImportModal/ProductImport';
import i18n from '@config/i18n';
import storeService from '@services/StoreService';
import GSTable from '@shared/GSTable/GSTable';
import GSPagination from '@shared/GSPagination/GSPagination';
import GSImg from '@shared/GSImg/GSImg';
import _ from 'lodash';

import {GSToast} from '@utils/gs-toast';
import GSProductMegaFilter from '@shared/GSProductMegaFilter/GSProductMegaFilter';
import LoadingScreen from '@shared/LoadingScreen/LoadingScreen';
import HintPopupVideo from '@shared/HintPopupVideo/HintPopupVideo';
import {AgencyService} from '@services/AgencyService';
import ProductMultipleStockUpdaterModal from './MultipleStockUpdaterModal/ProductMultipleStockUpdaterModal';
import GSDropdownAction from '@shared/GSDropdownAction/GSDropdownAction';
import {PACKAGE_FEATURE_CODES} from '@config/package-features';
import PrivateComponent from '@shared/PrivateComponent/PrivateComponent';
import {TokenUtils} from '@utils/token';
import UpdateProductPrice from './UpdateProductPriceModal/UpdateProductPrice';
import GSDropDownButton, {GSDropdownItem} from '@shared/GSButton/DropDown/GSDropdownButton';
import WholesalePriceImportModal from './WholesalePriceImportModal/WholesalePriceImportModal';
import ConversionHoverButton from '@shared/ConversionHoverButton/ConversionHoverButton';

const PRODUCT_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ERROR: 'ERROR'
}

const FormatType = {
    ALL: 1,
    GOOGLE: 2,
    EXCEL: 3,
    CSV: 4
};

const PROGRESS_TYPE = {
    DELETE: 'DELETE',
    UPDATE_INVENTORY: 'UPDATE_INVENTORY',
    UPDATE_TAX: 'UPDATE_TAX',
    IMPORT: 'IMPORT',
    CLEAR_STOCK: 'CLEAR_STOCK',
    DEACTIVATE: 'DEACTIVATE',
    ACTIVE: 'ACTIVE',
    DISPLAY_OUT_OF_STOCK: 'DISPLAY_OUT_OF_STOCK',
    UPDATE_PLATFORM: 'UPDATE_PLATFORM',
    UPDATE_PRICE: 'UPDATE_PRICE',
    IMPORT_WHOLESALE: 'IMPORT_WHOLESALE'
}

class ProductList extends Component {
    SIZE_PER_PAGE = 100

    constructor(props) {
        super(props);
        this.refModalExport = React.createRef(null);
        this.refFilterModal = React.createRef(null);
        this.refUpdateTax = React.createRef(null);
        this.refUpdateDisplayOutOfStock = React.createRef(null);
        this.refUpdatePlatform = React.createRef(null);
        this.state = {
            defaultDataFilter: null,
            defaultFilter: true,
            defaultParams: false,
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            redirectTo: '',
            isRedirect: false,
            isFetching: true,
            filterCount: 0,
            isFilterShow: false,
            isShowPrintModal: false,
            importModelOpen: false,
            wholesalePriceImportModalOpen: false,
            exportType: FormatType.EXCEL,
            selectedBranch: null,
            branches: [{
                value: 'ALL',
                label: i18next.t('component.product.edit.toolbar.branch.all')
            }],
            selectedProductIds: [],
            actionToggle: false,
            modalDelete: false,
            modalStock: false,
            modal: false,
            modalPlaform: false,
            modalActivate: false,
            modalDeactivate: false,
            modalUpdateTax: false,
            modalUpdateStock: false,
            checkClear: true,
            isResettingStock: false,
            searchHint: i18n.t('productList.search.placeholder'),
            taxList: [],
            itemProgressText: '',
            itemProgressWarningText: '',
            onWeb: true,
            onApp: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.APP_PACKAGE]),
            inStore: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE]),
            inGosocial: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]),
            modalUpdatePrice: false,
            isHiddenClearStockInfo: false,
            stConversions: []
        }

        this.HEADERS = {

            ID: i18next.t('productList.tbheader.id'),
            THUMBNAIL: i18next.t('productList.tbheader.thumbnail'),
            NAME: i18next.t('productList.tbheader.productName'),
            /* i18next.t("productList.tbheader.price"), */
            STOCK: i18next.t('component.product.addNew.pricingAndInventory.remainingStock'),
            STATUS: i18next.t('productList.tbheader.status'),
            SELLING: i18next.t('productList.tbheader.sellingOn'),
            VARIATION: i18next.t('productList.tbheader.variations'),
            DATE: i18next.t('productList.tbheader.createdDate'),
            PRIORITY: i18next.t('productList.tbheader.priority')
        }

        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.redirectTo = this.redirectTo.bind(this)
        this.onFilterSearchType = this.onFilterSearchType.bind(this)
        this.filter = this.filter.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.onInputSearch = this.onInputSearch.bind(this);
        this.sort = this.sort.bind(this);
        this.renderPrice = this.renderPrice.bind(this);
        this.toggleFilterModal = this.toggleFilterModal.bind(this);
        this.onSubmitFilter = this.onSubmitFilter.bind(this);
        this.togglePrintModal = this.togglePrintModal.bind(this);
        this.onImportCallback = this.onImportCallback.bind(this);
        this.setSelectedBranch = this.setSelectedBranch.bind(this);
        this.isSelectAllProducts = this.isSelectAllProducts.bind(this)
        this.handleSelectAllProduct = this.handleSelectAllProduct.bind(this)
        this.isSelectedProduct = this.isSelectedProduct.bind(this)
        this.handleSelectProduct = this.handleSelectProduct.bind(this)
        this.handleViewDetail = this.handleViewDetail.bind(this)
        this.clickActionToggle = this.clickActionToggle.bind(this)
        this.showModalDelete = this.showModalDelete.bind(this);
        this.cancelModal = this.cancelModal.bind(this);
        this.renderDeleteModal = this.renderDeleteModal.bind(this);
        this.renderClearStockModal = this.renderClearStockModal.bind(this);
        this.showModalClearStock = this.showModalClearStock.bind(this);
        this.cancelModalClearStock = this.cancelModalClearStock.bind(this);
        this.acceptDeleteShop = this.acceptDeleteShop.bind(this);
        this.acceptClearStockProduct = this.acceptClearStockProduct.bind(this);
        this.handleCheckClear = this.handleCheckClear.bind(this);
        this.renderActivateModal = this.renderActivateModal.bind(this);
        this.showModalActivate = this.showModalActivate.bind(this);
        this.cancelModalActivate = this.cancelModalActivate.bind(this);
        this.acceptActivateProduct = this.acceptActivateProduct.bind(this);
        this.showModalDeactivate = this.showModalDeactivate.bind(this);
        this.renderDeactivateModal = this.renderDeactivateModal.bind(this);
        this.cancelModalDeactivate = this.cancelModalDeactivate.bind(this);
        this.acceptDeactivateProduct = this.acceptDeactivateProduct.bind(this);
        this.renderUpdateTaxModal = this.renderUpdateTaxModal.bind(this);
        this.showModalUpdateTax = this.showModalUpdateTax.bind(this);
        this.showModalDisplayOutOfStock = this.showModalDisplayOutOfStock.bind(this);
        this.cancelDisplayOutOfStock = this.cancelDisplayOutOfStock.bind(this);
        this.hiddenModalUpdateTax = this.hiddenModalUpdateTax.bind(this);
        this.onUpdateTaxValidSubmit = this.onUpdateTaxValidSubmit.bind(this);
        this.onUpdateDisplayOutOfStockSubmit = this.onUpdateDisplayOutOfStockSubmit.bind(this);
        this.toggleModalUpdateStock = this.toggleModalUpdateStock.bind(this);
        this.isMultiTaskInProgress = this.isMultiTaskInProgress.bind(this);
        this.resolveInProgressTaskWarningText = this.resolveInProgressTaskWarningText.bind(this);
        this.resolveInProgressTaskText = this.resolveInProgressTaskText.bind(this);
        this.showModalPlatform = this.showModalPlatform.bind(this);
        this.cancelModalPlatform = this.cancelModalPlatform.bind(this);
        this.onUpdatePlatformSubmit = this.onUpdatePlatformSubmit.bind(this);
        this.onClickPlatform = this.onClickPlatform.bind(this);


        this.filterSearchType = [
            {
                value: 'PRODUCT_NAME',
                label: i18next.t('component.button.selector.searchType.productName')
            },
            {
                value: 'SKU',
                label: i18next.t('component.button.selector.searchType.sku')
            },
            {
                value: 'BARCODE',
                label: i18next.t('component.button.selector.searchType.barcode')
            }
        ]

        this.filterSaleChannelValues = [
            {
                value: 'all',
                label: i18next.t('component.button.selector.saleChannel.all')
            },
            {
                value: 'shopee',
                label: i18next.t('component.button.selector.saleChannel.shopee')
            },
            {
                value: 'lazada',
                label: i18next.t('component.button.selector.saleChannel.lazada')
            }
        ]

        this.filterStatusValues = [
            {
                value: 'all',
                label: i18next.t('component.product.edit.toolbar.status.all')
            },
            {
                value: 'active',
                label: i18next.t('component.product.edit.toolbar.status.active')
            },
            {
                value: 'inactive',
                label: i18next.t('component.product.edit.toolbar.status.inactive')
            },
            {
                value: 'error',
                label: i18next.t('component.product.edit.toolbar.status.error')
            }
        ]

        this.sorterValues = [
            {
                value: 'lastModifiedDate,desc',
                label: i18next.t('productList.sort.lastUpdate')
            },
            {
                value: 'stock,desc',
                label: i18next.t('productList.sort.stock.highToLow')
            },
            {
                value: 'stock,asc',
                label: i18next.t('productList.sort.stock.lowToHigh')
            },
            /* {
                value: 'newPrice,desc',
                label: i18next.t("productList.sort.price.highToLow"),
            },
            {
                value: 'newPrice',
                label: i18next.t("productList.sort.price.lowToHigh"),
            },
            {
                value: 'discount,desc',
                label: i18next.t("productList.sort.discount.highToLow"),
            },
            {
                value: 'discount',
                label: i18next.t("productList.sort.discount.lowToHigh"),
            },*/
            {
                value: 'priority,desc|lastModifiedDate,desc',
                label: i18next.t('productList.sort.priority.highToLow')
            },
            {
                value: 'priority,asc|lastModifiedDate,desc',
                label: i18next.t('productList.sort.priority.lowToHigh')
            }
        ]

        this.displayOutOfStockList = [

            { name: 'productList.btn.DisplayWhenOutOfStock', radioProduct: 'true' },
            { name: 'productList.btn.NotDisplayOutOfStock', radioProduct: 'false' }
        ]

        this.filterConfig = {
            searchType: this.filterSearchType[0].value,
            channel: this.filterSaleChannelValues[0].value.toUpperCase(),
            status: this.filterStatusValues[0].value.toUpperCase(),
            branch: this.state.branches[0].value,
            shopeeAccount: 'ALL',
            collection: 'ALL',
            sort: 'priority,desc|lastModifiedDate,desc',
            inStock: false,
            searchSortItemEnum: null,
            search: '',
            page: 1,
            platform: 'ALL'
        }
    }

    async toggleModalUpdateStock() {
        if (await this.isMultiTaskInProgress()) return

        if (!this.state.modalUpdateStock) {
            // pause interval
            clearInterval(this.getProgresInterval)
        } else {
            this.getProgresInterval = setInterval(() => {
                this.getItemProgress();
            }, 5000);
        }

        this.setState(state => ({ modalUpdateStock: !state.modalUpdateStock }))

    }

    setSelectedBranch(branchId) {
        this.setState({
            selectedBranch: branchId
        });
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        })

        this.fetchData(pageIndex, this.SIZE_PER_PAGE, this.filterConfig)
    }

    componentDidMount() {
        this._isMounted = true;
        const query = new URLSearchParams(this.props.location.search)
        if (query && query.get('searchType') && this.state.defaultFilter && (query.get('branch') !== 'ALL' || query.get('channel') !== 'ALL' || query.get('status') !== 'ALL' || query.get('collection') !== 'ALL' || query.get('shopeeAccount') !== 'ALL')) {
            const defaultDataFilter = {
                channel: query.get('channel'),
                status: query.get('status'),
                collection: query.get('collection'),
                branch: query.get('branch'),
                shopeeAccount: query.get('shopeeAccount'),
                platform: query.get('platform')
            }
            this.setState({
                defaultDataFilter
            })

        }
        this.setState({
            currentPage: query.get('page')
        })

        this.fetchBranch();
        this.getItemProgress();
    }


    resolveInProgressTaskWarningText(progressType) {
        let text = ''
        switch (progressType) {
            case PROGRESS_TYPE.IMPORT:
            case PROGRESS_TYPE.IMPORT_WHOLESALE:
            case PROGRESS_TYPE.CLEAR_STOCK:
            case PROGRESS_TYPE.DELETE:
            case PROGRESS_TYPE.DEACTIVATE:
            case PROGRESS_TYPE.ACTIVE:
            case PROGRESS_TYPE.UPDATE_INVENTORY:
            case PROGRESS_TYPE.UPDATE_PRICE:
            case PROGRESS_TYPE.UPDATE_TAX:
            case PROGRESS_TYPE.DISPLAY_OUT_OF_STOCK:
            case PROGRESS_TYPE.PLATFORM:
                text = i18next.t('page.product.list.inProgressTaskWarning', {
                    taskName: i18next.t('page.product.list.taskName.' + progressType)
                })
                break
            default:
                text = ''
        }

        return text
    }

    resolveInProgressTaskText(progressType, progressData) {
        let text = ''
        let data = '{}'
        switch (progressType) {
            case PROGRESS_TYPE.IMPORT:
                data = JSON.parse(progressData);
                text = i18next.t('page.product.list.progress.import', {
                    imported: data.totalImported,
                    import: data.totalImport
                })
                break
            case PROGRESS_TYPE.IMPORT_WHOLESALE:
                data = JSON.parse(progressData);
                text = i18next.t('page.product.list.progress.importWholesale', {
                    imported: data.totalImported,
                    import: data.totalImport
                })
                break
            case PROGRESS_TYPE.CLEAR_STOCK:
            case PROGRESS_TYPE.DELETE:
            case PROGRESS_TYPE.DEACTIVATE:
            case PROGRESS_TYPE.ACTIVE:
            case PROGRESS_TYPE.UPDATE_INVENTORY:
            case PROGRESS_TYPE.UPDATE_PRICE:
            case PROGRESS_TYPE.UPDATE_TAX:
            case PROGRESS_TYPE.DISPLAY_OUT_OF_STOCK:
            case PROGRESS_TYPE.UPDATE_PLATFORM:
                text = i18next.t('page.product.list.inProgressTask', {
                    taskName: i18next.t('page.product.list.taskName.' + progressType)
                })
                break
            default:
                text = ''
        }

        return text
    }

    getItemProgress(cb) {
        // get progress here
        ItemService.getListProgressItem().then(res => {
            if (res && res.length > 0) {
                const progress = res[0];
                this.setState({
                    itemProgressText: this.resolveInProgressTaskText(progress.progressType, progress.data),
                    itemProgressWarningText: this.resolveInProgressTaskWarningText(progress.progressType)
                })
                if (cb) cb(true)
            } else {
                if (cb) cb(false)
                this.setState({ itemProgressText: '', itemProgressWarningText: '' })
            }
        }).catch(error => {
            console.log(error)
            if (cb) cb(false)
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.getProgresInterval);
    }

    togglePrintModal() {
        this.setState(state => {
            return {
                isShowPrintModal: !state.isShowPrintModal
            }
        })
    }

    filter() {
        // count filter
        const query = new URLSearchParams(this.props.location.search)
        if (query && query.get('searchType') && this.state.defaultFilter) {
            this.filterConfig = {
                branch: query.get('branch'),
                channel: query.get('channel'),
                collection: query.get('collection'),
                inStock: query.get('inStock'),
                search: query.get('search'),
                searchSortItemEnum: query.get('searchSortItemEnum'),
                searchType: query.get('searchType'),
                shopeeAccount: query.get('shopeeAccount'),
                sort: query.get('sort'),
                status: query.get('status'),
                page: query.get('page'),
                platform: query.get('platform')
            }
            this.setState({
                defaultFilter: false
            })
        }

        const currentPage = query && query.get('page') ? +(query.get('page')) : 1

        this.setState({
            currentPage: currentPage
        });

        this.fetchData(currentPage, this.SIZE_PER_PAGE, this.filterConfig)
    }

    sort(sortValue) {
        if (sortValue.indexOf('stock') > -1) {
            this.filterConfig.sort = sortValue
            this.filterConfig.searchSortItemEnum = sortValue
        } else {
            this.filterConfig.searchSortItemEnum = null
            this.filterConfig.sort = sortValue
        }
        this.filter()
    }

    fetchBranch() {
        try {
            let branches = this.state.branches;
            storeService.getFullStoreBranches()
                .then((resp) => {
                    let allBranchValue = [];
                    const result = resp.data.filter(r => r.branchStatus === PRODUCT_STATUS.ACTIVE) || [];
                    const branch = result.map(b => {
                        allBranchValue.push(b.id);
                        return { value: b.id, label: b.name };
                    })
                    branches = this.state.branches.concat(branch);
                    let allBranch = branches[0];
                    allBranch.value = allBranchValue.join(',');
                    branches.splice(0, 1, allBranch)
                    this.setState({
                        branches: branches
                    })
                });
        } catch (e) {
            console.log(e)
        }
    }

    onFilterSearchType(type) {
        let hint = i18n.t('productList.search.placeholder');

        if (type === 'BARCODE') {
            hint = i18n.t('productList.search.barcode.placeholder');
        }

        this.setState({
            searchHint: hint
        })
        this.filterConfig.searchType = type;
        this.filter();
    }

    redirectTo(path) {
        this.setState({
            redirectTo: path,
            isRedirect: true
        })
    }

    fetchData(page, size, filterConfig) {
        if (this.state.defaultParams) {
            const urlSearchParams = new URLSearchParams()
            urlSearchParams.append('branch', filterConfig.branch)
            urlSearchParams.append('page', page)
            urlSearchParams.append('channel', filterConfig.channel)
            urlSearchParams.append('collection', filterConfig.collection)
            urlSearchParams.append('inStock', filterConfig.inStock)
            urlSearchParams.append('search', filterConfig.search)
            urlSearchParams.append('searchSortItemEnum', filterConfig.searchSortItemEnum)
            urlSearchParams.append('searchType', filterConfig.searchType)
            urlSearchParams.append('shopeeAccount', filterConfig.shopeeAccount)
            urlSearchParams.append('sort', filterConfig.sort)
            urlSearchParams.append('status', filterConfig.status)
            urlSearchParams.append('platform', filterConfig.platform)
            urlSearchParams.append('itemType', 'BUSINESS_PRODUCT')

            this.props.history.push(NAV_PATH.products + '?' + urlSearchParams.toString())
            return
        }

        this.setState({
            isFetching: true,
            defaultParams: true
        })

        const sortQuery = filterConfig.sort.split('|')

        ItemService.fetchDashboardItems({
            searchType: filterConfig.searchType,
            searchSortItemEnum: filterConfig.searchSortItemEnum,
            searchItemName: filterConfig.search,
            sort: sortQuery,
            page: +(page) - 1,
            size: size,
            inStock: filterConfig.inStock,
            saleChannel: this.convertAllToNull(filterConfig.channel),
            bhStatus: this.convertAllToNull(filterConfig.status),
            branchIds: this.convertAllToNull(filterConfig.branch),
            shopeeId: this.convertAllToNull(filterConfig.shopeeAccount),
            collectionId: this.convertAllToNull(filterConfig.collection),
            platform: this.convertAllToNull(filterConfig.platform),
            itemType: 'BUSINESS_PRODUCT'
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

        }, (e) => {
            console.log(e)
            if (this._isMounted) {
                this.setState({
                    isFetching: false
                })
            }
        })
    }

    convertAllToNull(text) {
        if (typeof text === 'string' && text.toUpperCase() === 'ALL') {
            return null
        }
        return text
    }

    onInputSearch(e) {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout(() => {
            this.filterConfig.search = value
            this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
            e.preventDefault()
        }, 1000)
    }

    handleConversionHover(itemId) {
        this.setState({ stConversions: [] })
        let branchId = this.convertAllToNull(this.filterConfig.branch)
        if (this.state.branches[0].value === branchId) {
            branchId = null
        }
        ItemService.getConversionUnitItemByItemId(itemId, branchId)
            .then(conversions => {
                if (conversions?.conversionItemList.length === 0) {
                    this.setState({ stConversions: [{}] })
                } else {
                    this.setState({ stConversions: conversions?.conversionItemList })
                }
            })
    }

    renderConversion(variationNumber) {
        if (this.state.stConversions[0] && Object.keys(this.state.stConversions[0]).length === 0) {
            return;
        }
        if (variationNumber === 0) {
            return (
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
            )
        } else if (variationNumber > 0) {
            const itemModelSet = new Set()
            const unitSet = new Set()
            const conversionMap = new Map();
            this.state.stConversions.forEach(conversion => {
                itemModelSet.add(conversion.id)
                unitSet.add(conversion.unitId)
                conversionMap.set(`${ conversion.id }_${ conversion.unitId }`, NumberUtils.formatThousandFixed(conversion.quantity, 2))
                conversionMap.set(conversion.id, conversion.variationName)
                conversionMap.set(`Unit_${ conversion.unitId }`, conversion.unitName)
            })
            const itemModelArray = Array.from(itemModelSet)
            const unitArray = Array.from(unitSet)

            return (
                <>
                    <thead>
                    <tr>
                        <th>{ i18next.t(`component.variationDetail.selection.title`) }</th>
                        { unitArray.map((unit, index) => (
                            <th key={ index }> { conversionMap.get(`Unit_${ unit }`) } </th>
                        )) }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        itemModelArray.map((itemModel, index) => (
                            <>
                                <tr key={ index }>
                                    <td>{ conversionMap.get(itemModel) }</td>
                                    {
                                        unitArray.map((unit, index) => (
                                            <td key={ index }> { conversionMap.get(`${ itemModel }_${ unit }`) } </td>
                                        ))
                                    }
                                </tr>
                            </>
                        )) }
                    </tbody>
                </>
            )
        }
    }

    renderStatus(status) {
        let text = 'component.product.edit.toolbar.status.'
        let toolTips, tagStyle
        switch (status) {
            case 'ACTIVE':
                text += 'active'
                toolTips = 'active'
                tagStyle = GSStatusTag.STYLE.SUCCESS
                break
            case 'INACTIVE':
                text += 'inactive2'
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
            <GSComponentTooltip message={ i18next.t(`productList.toolTips.status.${ toolTips }`) }
                                placement={ GSComponentTooltipPlacement.LEFT }>
                <GSStatusTag tagStyle={ tagStyle } text={ i18next.t(text) }/>
            </GSComponentTooltip>
        )
    }

    // have shopee icon
    renderSaleChannels(channelList) {
        // let channelItems = []
        // for (let channel of channelList) {
        //     let channelName = channel.name.toLowerCase()
        //     let channelStatus = channel.status ? channel.status.toLowerCase() : "";
        //     if (channelName === 'beecow') continue;
        //     if (channelName === "shopee" && channelStatus === "not_sell") continue;
        //     channelItems.push(
        //         <div className="channels-wraper" key={channelName}>
        //             <img src={`/assets/images/sale_channels/${channelName}.png`} className={`brands--${channelName}`}/>
        //         </div>
        //     )
        // }
        // return channelItems

        let channelItems = []
        for (let channel of channelList) {
            let channelName = channel.toLowerCase()
            if (channelName === 'beecow' || channelName === 'gomua' || channelName === 'gosell') continue;
            channelItems.push(
                <div className="channels-wraper" key={ channelName }>
                    <img src={ `/assets/images/sale_channels/${ channelName }.png` }
                         className={ `brands--${ channelName }` }
                         alt=""
                    />
                </div>
            )
        }
        return channelItems
    }

    renderPrice(orgPrice, newPrice, discount) {

    }

    toggleFilterModal(e) {
        if (this.state.isFilterShow) {
            this.refFilterModal.current.close(e);
        } else {
            this.refFilterModal.current.open(e);
        }
        this.setState(state => ({
                isFilterShow: !state.isFilterShow
            })
        )
    }

    onSubmitFilter(filterConfig) {
        this.filterConfig = { ...this.filterConfig, ...filterConfig };

        if (this.state.defaultParams) {
            this.fetchData(1, this.SIZE_PER_PAGE, this.filterConfig)
        } else {
            this.filter();
        }
    }

    renderStatusDot(status) {
        let className = 'status-dot--green'
        switch (status) {
            case PRODUCT_STATUS.ACTIVE:
                className = 'status-dot--active'
                break
            case PRODUCT_STATUS.ERROR:
                className = 'status-dot--error'
                break
            case PRODUCT_STATUS.INACTIVE:
                className = 'status-dot--inactive'
                break
            default:
                className = 'status-dot--green'
        }
        return (
            <span className={ 'status-dot ' + className }>

             </span>
        )
    }

    setShowExport() {
        this.refModalExport.current.open();
    }

    setHideExport() {
        this.refModalExport.current.close();
    }

    doExportData() {
        this.setState({
            isFetching: true
        })
        this.setHideExport();

        const sortQuery = this.filterConfig.sort.split('|');
        let params = {
            searchType: this.filterConfig.searchType,
            searchSortItemEnum: this.filterConfig.searchSortItemEnum,
            searchItemName: this.filterConfig.search,
            sort: sortQuery,
            page: +(this.state.currentPage) - 1,
            size: this.state.totalItem,
            inStock: this.filterConfig.inStock,
            saleChannel: this.convertAllToNull(this.filterConfig.channel),
            bhStatus: this.convertAllToNull(this.filterConfig.status),
            branchIds: this.convertAllToNull(this.filterConfig.branch),
            shopeeId: this.convertAllToNull(this.filterConfig.shopeeAccount),
            collectionId: this.convertAllToNull(this.filterConfig.collection),
            platform: this.convertAllToNull(this.filterConfig.platform),
            itemType: 'BUSINESS_PRODUCT'
        };
        if (this.state.exportType === FormatType.EXCEL) {
            ItemService.exportProductsAllExcel(params).then(() => {
                this.setState({
                    isFetching: false
                })
                GSToast.success(i18next.t('productList.export.data.success'))
            }).catch((error) => {
                this.setState({
                    isFetching: false
                })
                GSToast.commonError();
                console.log(error)
            });
        }
        if (this.state.exportType === FormatType.CSV) {
            ItemService.exportProductsAllCSV(params).then((result) => {
                this.setState({
                    isFetching: false
                })
                DownloadUtils.saveDataToFile(result.data, 'item-export.csv')
            }).catch((error) => {
                this.setState({
                    isFetching: false
                })
                console.log(error)
            });
        }

    }

    doExportWholesaleData() {
        this.setState({
            isFetching: true
        })

        const sortQuery = this.filterConfig.sort.split('|');
        let params = {
            searchType: this.filterConfig.searchType,
            searchSortItemEnum: this.filterConfig.searchSortItemEnum,
            searchItemName: this.filterConfig.search,
            sort: sortQuery,
            page: +(this.state.currentPage) - 1,
            size: this.state.totalItem,
            inStock: this.filterConfig.inStock,
            saleChannel: this.convertAllToNull(this.filterConfig.channel),
            bhStatus: this.convertAllToNull(this.filterConfig.status),
            branchIds: this.convertAllToNull(this.filterConfig.branch),
            shopeeId: this.convertAllToNull(this.filterConfig.shopeeAccount),
            collectionId: this.convertAllToNull(this.filterConfig.collection),
            platform: this.convertAllToNull(this.filterConfig.platform),
            itemType: 'BUSINESS_PRODUCT'
        };

        ItemService.exportWholesalePrice(params).then((result) => {
            this.setState({
                isFetching: false
            })
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'wholesale-price-export.xlsx');
            document.body.appendChild(link);
            link.click();
        }).catch((error) => {
            this.setState({
                isFetching: false
            })
            console.log(error)
        });
    }

    onImportCallback(isSuccess, lstExistProgress) {
        this.setState({
            wholesalePriceImportModalOpen: false,
            importModelOpen: false
        })
        // if (isSuccess && lstExistProgress && lstExistProgress.length > 0) {
        //     // has progress -> active the inteval now


        // }else {
        //     // filter again
        //     this.filter();
        // }

        this.getItemProgress();

        // get progress of store
        this.getProgresInterval = setInterval(() => {
            this.getItemProgress();
        }, 15000);

        //this.setState({importModelOpen: true})
    }

    isSelectAllProducts() {
        if (!this.state.selectedProductIds.length || this.state.selectedProductIds.length < this.state.itemList.length) {
            return
        }

        const productProdIds = this.state.itemList.map(dataRow => dataRow.id)
        const without = _.without(productProdIds, ...this.state.selectedProductIds)

        return !without.length
    }

    handleSelectAllProduct(e) {
        const checked = e.target.checked
        if (checked) {
            const selectedProductIds = this.state.itemList.map(dataRow => dataRow.id)
            this.setState({
                selectedProductIds: selectedProductIds
            })
        } else {
            this.setState({ selectedProductIds: [], actionToggle: false })
        }
    }

    isSelectedProduct(prodId) {
        return this.state.selectedProductIds.includes(prodId)
    }

    handleSelectProduct(e, prodId) {
        const checked = e.target.checked
        if (checked) {
            this.setState(state => ({
                selectedProductIds: [...state.selectedProductIds, prodId]
            }))
            return
        }

        const index = this.state.selectedProductIds.indexOf(prodId)
        if (index < 0) {
            return
        }
        this.setState(state => {
            state.selectedProductIds.splice(index, 1)

            return {
                selectedProductIds: [...state.selectedProductIds],
                actionToggle: state.actionToggle && state.selectedProductIds.length === 0 ? false : state.actionToggle
            }
        })
    }

    handleViewDetail(id) {
        RouteUtils.openNewTab(NAV_PATH.productEdit + '/' + id)
    }


    clickActionToggle(toggle) {
        this.setState({
            actionToggle: toggle
        })
    }

    async showModalDelete() {
        if (await this.isMultiTaskInProgress()) return
        this.setState(state => ({
            modalDelete: !state.modalDelete
        }))
    }

    cancelModal() {
        this.setState({
                modalDelete: false
            },
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback()
                }
            });

    }

    acceptDeleteShop() {
        this.setState(state => ({
            isFetching: true,
            actionToggle: !state.actionToggle
        }))
        this.cancelModal()

        const deletedProductIds = this.state.selectedProductIds
        ItemService.deletedProductItemId(deletedProductIds).then(() => {

            // GSToast.commonDelete()

            this.setState(() => ({
                selectedProductIds: []
            }))

            this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)

            this.getItemProgress()
        }).catch(() => {
            this.setState({ isFetching: false })
            GSToast.commonError()
        })
    }

    async isMultiTaskInProgress() {
        return new Promise((resolve, reject) => {
            this.getItemProgress((isProgressRunning) => {
                if (isProgressRunning) {
                    resolve(1)
                    GSToast.warning(
                        <div dangerouslySetInnerHTML={ { __html: this.state.itemProgressWarningText } }/>
                    )
                    return true
                } else {
                    resolve(0)
                }
            })
        })

    }


    async showModalClearStock() {
        if (await this.isMultiTaskInProgress()) return
        this.setState(state => ({
            modalStock: !state.modalStock
        }))

        this.setState({
            checkClear: true
        })
        const data = this.state.itemList.filter(item => this.state.selectedProductIds.includes(item.id))

        if (!data) return
        let checkShopeeChannel = false
        for (let item of data) {
            if (item.saleChannels && item.saleChannels.find(idx => idx === 'SHOPEE')) {
                checkShopeeChannel = true
            }
        }
        this.setState({
            isHiddenClearStockInfo: checkShopeeChannel
        })

    }

    cancelModalClearStock() {
        this.setState({
                modalStock: false
            },
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback()
                }
            });

    }

    handleCheckClear(e) {
        const checked = e.target.checked
        this.setState({
            checkClear: checked
        })
    }

    acceptClearStockProduct() {

        if (this.state.isResettingStock) {
            GSToast.warning(i18next.t('productList.status.resetting.stock'));
            this.setState(state => ({
                actionToggle: !state.actionToggle
            }))
            this.cancelModalClearStock()
            return;
        }

        this.setState(state => ({
            isFetching: true,
            actionToggle: !state.actionToggle
        }))
        this.cancelModalClearStock()

        const clearStockId = this.state.selectedProductIds
        const checkId = this.state.checkClear

        ItemService.deletedClearStockId(clearStockId, checkId).then(() => {

            // GSToast.success(i18next.t('productList.status.resetting.stock'))

            this.setState(() => ({
                selectedProductIds: [],
                isResettingStock: true
            }))

            this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)

            this.getItemProgress()
        }).catch(() => {
            this.setState({ isFetching: false })
            GSToast.commonError()
        })

    }

    async showModalActivate() {
        if (await this.isMultiTaskInProgress()) return

        this.setState(state => ({
            modalActivate: !state.modalActivate
        }))

        this.setState({
            checkClear: true
        })
    }

    cancelModalActivate() {
        this.setState({
                modalActivate: false
            },
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback()
                }
            });
    }

    acceptActivateProduct() {
        this.setState(state => ({
            isFetching: true,
            actionToggle: !state.actionToggle
        }))
        this.cancelModalActivate()
        const ActivateProductIds = this.state.selectedProductIds
        ItemService.changeStatusBulkOfItems(ActivateProductIds, 'ACTIVE').then(() => {
            // GSToast.success()
            this.setState(() => ({
                selectedProductIds: []
            }))
            this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)
            this.getItemProgress()

        }).catch(() => {
            GSToast.commonError()
        }).finally(() => {
            this.setState({ isFetching: false })
        })
    }

    async showModalDeactivate() {
        if (await this.isMultiTaskInProgress()) return
        this.setState(state => ({
            modalDeactivate: !state.modalDeactivate
        }))

        this.setState({
            checkClear: true
        })
    }

    cancelModalDeactivate() {
        this.setState({
                modalDeactivate: false
            },
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback()
                }
            });
    }

    acceptDeactivateProduct() {
        this.setState(state => ({
            isFetching: true,
            actionToggle: !state.actionToggle
        }))
        this.cancelModalDeactivate()
        const DeactivateProductIds = this.state.selectedProductIds
        ItemService.changeStatusBulkOfItems(DeactivateProductIds, 'INACTIVE').then(() => {
            // GSToast.success()
            this.setState(state => ({
                selectedProductIds: []
            }))
            this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)
            this.getItemProgress()

        }).catch(() => {
            GSToast.commonError()
        }).finally(() => {
            this.setState({ isFetching: false })
        })
    }

    renderClearStockModal() {
        return (
            <Modal isOpen={ this.state.modalStock } toggle={ this.cancelModalClearStock }
                   className={ `modalClearStock` }>
                <ModalHeader className={ `text-success` } toggle={ this.cancelModalClearStock }>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <p><Trans i18nKey="page.shopee.account.ClearStock.title"
                              values={ { number: this.state.selectedProductIds.length } }></Trans></p>
                    { this.state.isHiddenClearStockInfo &&
                        <div className={ `action` }>
                            <UikCheckbox
                                defaultChecked={ this.state.checkClear }
                                onChange={ e => this.handleCheckClear(e) }
                                className="custom-check-box"
                            />

                            <span
                                className="check-box-wrapper__label">{ i18next.t('page.shopee.account.ClearStock.title2', { provider: AgencyService.getDashboardName() }) }</span>
                        </div>
                    }

                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ this.cancelModalClearStock }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ this.acceptClearStockProduct }>
                        <GSTrans t={ 'common.txt.alert.modal.btn' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    renderDeleteModal() {
        return (
            <Modal isOpen={ this.state.modalDelete } toggle={ this.cancelModal } className={ `modalDeleteProduct` }>
                <ModalHeader className={ `text-danger` } toggle={ this.cancelModal }>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <p><Trans i18nKey="page.shopee.account.DeleteProduct.title2"
                              values={ { quantity: this.state.selectedProductIds.length } }></Trans></p>
                    <div className={ 'common-note mt-1 font-size-_9rem' }>
                        { i18next.t('common.txt.notice') }: { i18next.t('product.delete.notice.incomplete.transfer') }
                    </div>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ this.cancelModal }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton danger marginLeft onClick={ this.acceptDeleteShop }>
                        <GSTrans t={ 'page.shopee.account.DeleteAccount.delete' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    renderActivateModal() {
        return (
            <Modal isOpen={ this.state.modalActivate } toggle={ this.cancelModalActivate }
                   className={ `modalActivateProduct` }>
                <ModalHeader className={ `text-success` } toggle={ this.cancelModalActivate }>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <p><Trans i18nKey="page.shopee.account.Activate.title"
                              values={ { x: this.state.selectedProductIds.length } }></Trans></p>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ this.cancelModalActivate }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ this.acceptActivateProduct }>
                        <GSTrans t={ 'page.order.detail.cancelOrder.btn.yes' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    renderDeactivateModal() {
        return (
            <Modal isOpen={ this.state.modalDeactivate } toggle={ this.cancelModalDeactivate }
                   className={ `modalActivateProduct` }>
                <ModalHeader className={ `text-success` } toggle={ this.cancelModalDeactivate }>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <p><Trans i18nKey="page.shopee.account.Deactivate.title"
                              values={ { x: this.state.selectedProductIds.length } }></Trans></p>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ this.cancelModalDeactivate }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ this.acceptDeactivateProduct }>
                        <GSTrans t={ 'page.order.detail.cancelOrder.btn.yes' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    async showModalUpdateTax() {
        if (await this.isMultiTaskInProgress()) return

        storeService.getListVAT()
            .then(data => {
                const taxSell = data.filter(tax => tax.taxType === 'SELL')
                this.setState(state => ({
                    modalUpdateTax: !state.modalUpdateTax,
                    taxList: taxSell
                }))
            })
    }

    hiddenModalUpdateTax() {
        this.setState(state => ({
            modalUpdateTax: !state.modalUpdateTax
        }))
    }

    onUpdateTaxValidSubmit(event, { taxRadioGroup }) {
        if (!taxRadioGroup) {
            return
        }
        this.setState({ taxUpdating: true })
        ItemService.updateTaxBulkOfItems(this.state.selectedProductIds, taxRadioGroup)
            .then(() => {
                // GSToast.commonUpdate()
                this.setState(state => ({
                    modalUpdateTax: !state.modalUpdateTax,
                    selectedProductIds: []
                }))
                this.getItemProgress()

            })
            .catch(() => GSToast.commonError())
            .finally(() => this.setState({ taxUpdating: false }))
    }

    renderUpdateTaxModal() {
        return (
            <>
                { this.state.taxUpdating && <LoadingScreen zIndex={ 1051 }/> }
                <Modal isOpen={ this.state.modalUpdateTax } toggle={ this.hiddenModalUpdateTax }
                       className={ `modalActivateProduct` }>
                    <ModalHeader className={ `text-success` } toggle={ this.hiddenModalUpdateTax }>
                        <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                    </ModalHeader>
                    <ModalBody>
                         <span className="font-weight-500">
                             <Trans i18nKey="productList.modal.updateTax.title"/>
                         </span>
                        <AvForm autoComplete="off" className="d-flex text-left mt-3"
                                onValidSubmit={ this.onUpdateTaxValidSubmit } ref={ ref => this.refUpdateTax = ref }>
                            {
                                !!this.state.taxList.length && <AvRadioGroup
                                    name="taxRadioGroup"
                                    className="m-auto w-fit-content"
                                    defaultValue={ this.state.taxList.find(tax => tax.useDefault)?.id }>
                                    {
                                        this.state.taxList.map(tax => (
                                            <AvRadio customInput key={ tax.id }
                                                     className="font-weight-500"
                                                     label={ i18next.t(tax.name) }
                                                     value={ tax.id }/>
                                        ))
                                    }
                                </AvRadioGroup>
                            }
                        </AvForm>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton default onClick={ this.hiddenModalUpdateTax }>
                            <GSTrans t={ 'common.btn.cancel' }/>
                        </GSButton>
                        <GSButton success marginLeft onClick={ () => this.refUpdateTax.submit() }>
                            <GSTrans t={ 'common.btn.ok' }/>
                        </GSButton>
                    </ModalFooter>
                </Modal>
            </>
        )
    }


    renderDisplayOutOfStockModal() {
        return (
            <Modal isOpen={ this.state.modal } toggle={ this.cancelDisplayOutOfStock }
                   className={ `modalActivateProduct` }>
                <ModalHeader className={ `text-success` } toggle={ this.cancelDisplayOutOfStock }>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <AvForm autoComplete="off" className="d-flex text-left mt-3"
                            onValidSubmit={ this.onUpdateDisplayOutOfStockSubmit }
                            ref={ ref => this.refUpdateDisplayOutOfStock = ref }>
                        {
                            <AvRadioGroup
                                name="productRadioGroup"
                                className="m-auto w-fit-content"
                                defaultValue={ this.displayOutOfStockList[0].radioProduct }
                            >
                                {
                                    this.displayOutOfStockList.map(item => (
                                        <AvRadio customInput key={ item.name }
                                                 className="font-weight-500"
                                                 label={ i18next.t(item.name) }
                                                 value={ item.radioProduct }/>
                                    ))
                                }
                            </AvRadioGroup>
                        }
                    </AvForm>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ this.cancelDisplayOutOfStock }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ () => this.refUpdateDisplayOutOfStock.submit() }>
                        <GSTrans t={ 'page.order.detail.cancelOrder.btn.yes' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    renderPlatformModal() {
        return (
            <Modal isOpen={ this.state.modalPlaform } toggle={ this.cancelModalPlatform }
                   className={ `modalPlatformProduct` }>
                <ModalHeader className={ `text-success` } toggle={ this.cancelModalPlatform }>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <AvForm autoComplete="off"
                            onValidSubmit={ this.onUpdatePlatformSubmit }
                            ref={ ref => this.refUpdatePlatform = ref }>
                        <h4 className="title">
                            { i18next.t('page.products.allproduct.platform.modal.content') }
                        </h4>
                        <div className="content">
                            <AvField
                                label={ <Trans
                                    i18nKey="page.marketing.discounts.coupons.create.usageLimits.appOnly"></Trans> }
                                name={ 'onApp' }
                                type={ 'checkbox' }
                                disabled={ !TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.APP_PACKAGE]) }
                                value={ this.state.onApp }
                                onChange={ this.onClickPlatform }
                            />
                            <AvField
                                label={ <Trans
                                    i18nKey="page.marketing.discounts.coupons.create.usageLimits.webOnly"></Trans> }
                                name={ 'onWeb' }
                                type={ 'checkbox' }
                                value={ this.state.onWeb }
                                onChange={ this.onClickPlatform }
                            />
                            <AvField
                                label={ <Trans i18nKey="page.analytics.order.filter.platform.instore"></Trans> }
                                name={ 'inStore' }
                                type={ 'checkbox' }
                                disabled={ !TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE]) }
                                value={ this.state.inStore }
                                onChange={ this.onClickPlatform }
                            />
                            <AvField
                                label={ <Trans i18nKey="component.product.addNew.platform.gosocial"></Trans> }
                                name={ 'inGosocial' }
                                type={ 'checkbox' }
                                disabled={ !TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]) }
                                value={ this.state.inGosocial }
                                onChange={ this.onClickPlatform }
                            />
                        </div>
                    </AvForm>
                </ModalBody>
                <ModalFooter>
                    <GSButton default onClick={ this.cancelModalPlatform }>
                        <GSTrans t={ 'common.btn.cancel' }/>
                    </GSButton>
                    <GSButton success marginLeft onClick={ () => this.refUpdatePlatform.submit() }>
                        <GSTrans t={ 'login.forgetPassword.confirm' }/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    onUpdateDisplayOutOfStockSubmit(event, { productRadioGroup }) {
        if (!productRadioGroup) {
            return
        }

        ItemService.updateShowOutOfStock(this.state.selectedProductIds, productRadioGroup)
            .then(() => {
                // GSToast.commonUpdate()
                this.setState(state => ({
                    modal: false,
                    selectedProductIds: []
                }))
                this.getItemProgress()

            })
            .catch(() => GSToast.commonError())

    }

    onUpdatePlatformSubmit(event, platform) {
        this.setState(state => ({
            isFetching: true,
            actionToggle: !state.actionToggle
        }))

        ItemService.updateMultiplePlatformProduct(this.state.selectedProductIds, platform)
            .then(() => {

                this.setState(state => ({
                    modalPlaform: false,
                    selectedProductIds: [],
                    onWeb: true,
                    onApp: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.APP_PACKAGE]),
                    inStore: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.POS_PACKAGE]),
                    inGosocial: TokenUtils.hasAllPackageFeatures([PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE])
                }))
                this.getItemProgress()

            })
            .catch(() => GSToast.commonError())
            .finally(() => this.setState({ isFetching: false }))

    }

    onClickPlatform(e) {
        const { name, checked } = e.currentTarget;
        this.setState({
            [name]: checked
        });
    }

    showModalDisplayOutOfStock = async () => {
        if (await this.isMultiTaskInProgress()) return

        this.setState({ modal: !this.state.modal })
    };

    cancelDisplayOutOfStock = () => {
        this.setState({ modal: false })
    };

    showModalPlatform = async () => {
        if (await this.isMultiTaskInProgress()) return

        this.setState(state => ({ modalPlaform: !state.modalPlaform }))
    };

    cancelModalPlatform = () => {
        this.setState({ modalPlaform: false })
    };
    toggleModalUpdatePrice = async () => {
        if (await this.isMultiTaskInProgress()) return
        this.setState(state => ({ modalUpdatePrice: !state.modalUpdatePrice }))
    }

    render() {
        const { searchHint, filterCount } = this.state;
        return (
            <>
                { this.renderDeleteModal() }
                { this.renderClearStockModal() }
                { this.renderActivateModal() }
                { this.renderDeactivateModal() }
                { this.renderUpdateTaxModal() }
                { this.renderDisplayOutOfStockModal() }
                { this.renderPlatformModal() }
                <UpdateProductPrice
                    items={ this.state.itemList.filter(item => this.state.selectedProductIds.includes(item.id)) }
                    key={ 'update-price' + this.state.modalUpdatePrice.toString() }
                    isOpen={ this.state.modalUpdatePrice }
                    onCancel={ this.toggleModalUpdatePrice }
                    onSave={ () => {
                        this.getItemProgress()
                        this.setState(state => ({ modalUpdatePrice: !state.modalUpdatePrice }))
                    } }
                />

                <ProductMultipleStockUpdaterModal
                    key={ 'update-stock' + this.state.modalUpdateStock.toString() }
                    isOpen={ this.state.modalUpdateStock }
                    branchList={ this.state.branches.filter((b, idx) => idx > 0) }
                    items={ this.state.itemList.filter(item => this.state.selectedProductIds.includes(item.id)) }
                    onCancel={ this.toggleModalUpdateStock }
                    onSave={ () => {
                        this.getItemProgress()
                        this.setState(state => ({ modalUpdateStock: !state.modalUpdateStock }))
                    } }
                />


                <ProductListBarcodePrinter isOpen={ this.state.isShowPrintModal }
                                           onClose={ this.togglePrintModal }
                                           branchIds={ this.state.branches.map(branch => branch.value).filter((b, idx) => idx > 0) }
                />

                {/*IMPORT MODAL*/ }
                <ProductImport isOpen={ this.state.importModelOpen }
                               cancelCallback={ () => this.setState({ importModelOpen: false }) }
                               importCallback={ this.onImportCallback }
                />
                <WholesalePriceImportModal isOpen={ this.state.wholesalePriceImportModalOpen }
                                           cancelCallback={ () => this.setState({ wholesalePriceImportModalOpen: false }) }
                                           importCallback={ this.onImportCallback }
                />

                <GSContentContainer className="product-list-page gsa-min-width--fit-content">
                    { this.state.isRedirect &&
                        <Redirect to={ this.state.redirectTo }/>
                    }
                    <GSContentHeader title={
                        <GSContentHeaderTitleWithExtraTag title={ i18next.t('productList.pageTitle') }
                                                          extra={ this.state.totalItem }
                        />
                    }>
                        <HintPopupVideo
                            category={ 'PRODUCT_MANAGER' }
                            title={ 'Product management' }
                        />


                        <GSContentHeaderRightEl className="d-flex">
                            <GSButton success onClick={ () => RouteUtils.linkTo(this.props, NAV_PATH.productCreate) }
                                      data-sherpherd="tour-product-step-3">
                                <Trans i18nKey="common.btn.createProduct" className="sr-only">
                                    Create Product
                                </Trans>
                            </GSButton>
                            {/*EXPORT BUTTON*/ }
                            <GSDropDownButton
                                button={
                                    ({ onClick }) => (
                                        <GSButton success
                                                  marginLeft
                                                  dropdownIcon
                                                  onClick={ onClick }
                                        >
                                            <GSTrans t="productList.btn.exportProduct"/>
                                        </GSButton>)
                                }>
                                <GSDropdownItem className="text-nowrap" onClick={ () => this.setShowExport() }>
                                    <img width={ 20 } className="mr-2" src="/assets/images/carbon_product.svg"
                                         alt="product"/>
                                    <GSTrans t={ 'productList.btn.title.exportProducts' }/>
                                </GSDropdownItem>
                                <GSDropdownItem className="text-nowrap" onClick={ () => this.doExportWholesaleData() }>
                                    <img width={ 20 } className="mr-2" src="/assets/images/icon_coupons.svg"
                                         alt="service"/>
                                    <GSTrans t={ 'productList.btn.title.exportWholesalePrice' }/>
                                </GSDropdownItem>
                            </GSDropDownButton>
                            {/*IMPORT BUTTON*/ }
                            <GSDropDownButton
                                button={
                                    ({ onClick }) => (
                                        <GSButton success
                                                  marginLeft
                                                  dropdownIcon
                                                  onClick={ onClick }
                                                  className={ this.state.itemProgressText ? 'disabled' : '' }
                                        >
                                            <GSTrans t="productList.btn.importProduct"/>
                                        </GSButton>)
                                }>
                                <GSDropdownItem className="text-nowrap"
                                                onClick={ () => this.setState({ importModelOpen: true }) }>
                                    <img width={ 20 } className="mr-2" src="/assets/images/carbon_product.svg"
                                         alt="product"/>
                                    <GSTrans t={ 'productList.btn.title.importProducts' }/>
                                </GSDropdownItem>
                                <GSDropdownItem className="text-nowrap"
                                                onClick={ () => this.setState({ wholesalePriceImportModalOpen: true }) }>
                                    <img width={ 20 } className="mr-2" src="/assets/images/icon_coupons.svg"
                                         alt="service"/>
                                    <GSTrans t={ 'productList.btn.title.importWholesalePrice' }/>
                                </GSDropdownItem>
                            </GSDropDownButton>
                            <PrivateComponent hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE] }
                                              wrapperDisplay={ 'block' }
                            >
                                <GSButton success outline marginLeft onClick={ this.togglePrintModal }>
                                    <GSTrans t="page.product.list.printBarCode.btn.print"/>
                                </GSButton>
                            </PrivateComponent>
                        </GSContentHeaderRightEl>
                    </GSContentHeader>
                    <GSContentBody size={ GSContentBody.size.MAX } className="product-list__body">
                        {/*PRODUCT LIST*/ }
                        <GSWidget>

                            <GSWidgetContent className="product-list-widget">
                                {/*DESKTOP VERSION*/ }
                                <div
                                    className={ 'n-filter-container d-mobile-none d-desktop-flex ' + (this.state.isFetching ? 'gs-atm--disable' : '') }>

                                    {/*SEARCH*/ }
                                    <div style={ {
                                        marginRight: 'auto',
                                        display: 'flex'
                                    } }>
                                        <div className="search-box__wrapper col-7 col-md-7 pr-0 pl-0">
                                            <UikInput
                                                key={ this.filterConfig.search }
                                                defaultValue={ this.filterConfig.search }
                                                autoFocus={ this.filterConfig.search.length > 0 ? true : false }
                                                onChange={ this.onInputSearch }
                                                icon={ (
                                                    <FontAwesomeIcon icon="search"/>
                                                ) }
                                                placeholder={ searchHint }
                                            />
                                        </div>

                                        {/* FILTER SEARCH TYPE */ }
                                        <UikSelect
                                            className="col-6 col-md-6 pr-0 pl-0"
                                            value={ [{ value: this.filterConfig.searchType }] }
                                            options={ this.filterSearchType }
                                            onChange={ (item) => this.onFilterSearchType(item.value) }
                                        />
                                    </div>

                                    <div className="col-2 col-md-2 pr-0 pl-0">
                                        <div className="btn-filter" onClick={ this.toggleFilterModal }>
                                            <span>
                                                <GSTrans t="productList.filter.header.title"/>
                                                { ' ' }
                                                (
                                                { filterCount }
                                                )
                                            </span>
                                            <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                                             icon="filter"/>
                                        </div>
                                    </div>

                                    { this.state.isResettingStock &&
                                        <div className="resetting-status">
                                            <FontAwesomeIcon className="image-status__grey image-rotate"
                                                             icon="sync-alt"/>
                                            <span
                                                className="synchronize-status-text">{ i18next.t('productList.status.resetting.label') }</span>
                                        </div>
                                    }

                                    {/*SORTER*/ }
                                    <UikSelect
                                        value={ [{ value: this.filterConfig.sort }] }
                                        options={ this.sorterValues }
                                        onChange={ (item) => {
                                            this.sort(item.value)
                                        } }
                                    />
                                </div>
                                {/*MOBILE*/ }
                                <div
                                    className={ 'n-filter-container--mobile d-mobile-flex d-desktop-none ' + (this.state.isFetching ? 'gs-atm--disable' : '') }>
                                    {/*SEARCH*/ }
                                    <div className="row">
                                        <div className="col-12 col-sm-12" style={ {
                                            marginRight: 'auto',
                                            display: 'flex'
                                        } }>

                                            <div className="col-6 col-sm-6 pl-0 search-box__wrapper">
                                                <UikInput
                                                    key={ this.filterConfig.search }
                                                    defaultValue={ this.filterConfig.search }
                                                    autoFocus={ this.filterConfig.search.length > 0 ? true : false }
                                                    onChange={ this.onInputSearch }
                                                    icon={ (
                                                        <FontAwesomeIcon icon="search"/>
                                                    ) }
                                                    placeholder={ searchHint }
                                                />
                                            </div>

                                            {/* FILTER SEARCH TYPE */ }
                                            <UikSelect
                                                className="col-6 col-sm-6 pr-0"
                                                value={ [{ value: this.filterConfig.searchType }] }
                                                options={ this.filterSearchType }
                                                onChange={ (item) => this.onFilterSearchType(item.value) }
                                            />
                                        </div>
                                    </div>

                                    <div className="row">

                                        <div className="col-6 col-sm-6">
                                            <div className="btn-filter" onClick={ this.toggleFilterModal }>
                                                <span>
                                                <GSTrans t="productList.filter.header.title"/>
                                                    { ' ' }
                                                    (
                                                    { filterCount }
                                                    )
                                                </span>
                                                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                                                 icon="filter"/>
                                            </div>
                                        </div>

                                        <div className="col-6 col-sm-6">

                                            <UikSelect
                                                value={ [{ value: this.filterConfig.sort }] }
                                                options={ this.sorterValues }
                                                onChange={ (item) => {
                                                    this.sort(item.value)
                                                } }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/*TASK LOG*/ }
                                { this.state.itemProgressText &&
                                    <div className="d-flex align-items-center mt-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={ {
                                            color: '#1665D8'
                                        } }
                                             fill="currentColor" className="bi bi-arrow-repeat gs-ani__rotate"
                                             viewBox="0 0 16 16">
                                            <path
                                                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                            <path fill-rule="evenodd"
                                                  d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                                        </svg>
                                        <span className="pl-2 text-primary"
                                              dangerouslySetInnerHTML={ { __html: this.state.itemProgressText } }/>
                                    </div>
                                }

                                {
                                    !!this.state.selectedProductIds.length && !this.state.isFetching &&
                                    <div
                                        className="selected-product d-flex mt-3 font-weight-500 gsa__uppercase font-size-_9em">
                                        <span>
                                            <GSTrans t="page.shopeeProduct.management.selected"
                                                     values={ { number: this.state.selectedProductIds.length } }/>
                                        </span>
                                        <GSDropdownAction
                                            className="ml-4"
                                            toggle={ this.state.actionToggle }
                                            onToggle={ this.clickActionToggle }
                                            actions={ [{
                                                label: i18next.t('page.shopeeProduct.management.actions.clearstock'),
                                                onAction: this.showModalClearStock
                                            }, {
                                                label: i18next.t('page.shopeeProduct.management.actions.delete'),
                                                onAction: this.showModalDelete
                                            }, {
                                                label: i18next.t('page.shopee.account.Deactivate.content'),
                                                onAction: this.showModalDeactivate
                                            }, {
                                                label: i18next.t('page.shopee.account.Activate.content'),
                                                onAction: this.showModalActivate
                                            }, {
                                                label: i18next.t('page.product.create.updateStockModal.title'),
                                                onAction: this.toggleModalUpdateStock
                                            }, {
                                                label: i18next.t('productList.btn.updateTax'),
                                                onAction: this.showModalUpdateTax
                                            }, {
                                                label: i18next.t('productList.btn.DisplayOutOfStock'),
                                                disabled: !TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.FEATURE_0309]),
                                                onAction: this.showModalDisplayOutOfStock
                                            }, {
                                                label: i18next.t('page.product.list.taskName.PLATFORM'),
                                                onAction: this.showModalPlatform
                                            }, {
                                                label: i18next.t('page.product.updatePriceModal.title'),
                                                onAction: this.toggleModalUpdatePrice
                                            }
                                            ] }
                                        />
                                    </div>
                                }
                                { this.state.isFetching &&
                                    <Loading style={ LoadingStyle.DUAL_RING_GREY }/>
                                }

                                { !this.state.isFetching &&
                                    <>


                                        <GSTable className="table d-mobile-none d-desktop-block">
                                            <colgroup>
                                                <col style={ { width: '0%' } }/>
                                                <col style={ { width: '12%' } }/>
                                                <col style={ { width: '0%' } }/>
                                                <col style={ { width: '19%' } }/>
                                                <col style={ { width: '10%' } }/>
                                                <col style={ { width: '17%' } }/>
                                                <col style={ { width: '10%' } }/>
                                                <col style={ { width: '15%' } }/>
                                                <col style={ { width: '10%' } }/>
                                            </colgroup>
                                            <thead>
                                            <tr>
                                                <th>
                                                    <UikCheckbox
                                                        className="m-0"
                                                        checked={ this.isSelectAllProducts() }
                                                        onChange={ this.handleSelectAllProduct }
                                                    />
                                                    { this.HEADERS.ID }
                                                </th>
                                                <th>{ this.HEADERS.THUMBNAIL }</th>
                                                <th>{ this.HEADERS.NAME }</th>
                                                <th>{ this.HEADERS.STOCK }</th>
                                                <th>{ this.HEADERS.STATUS }</th>
                                                <th>{ this.HEADERS.SELLING }</th>
                                                <th>{ this.HEADERS.VARIATION }</th>
                                                <th>{ this.HEADERS.DATE }</th>
                                                <th>{ this.HEADERS.PRIORITY }</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            { this.state.itemList.map((dataRow, index) => {
                                                return (
                                                    <tr key={ index + '_' + dataRow.id + '_' + dataRow.bhStatus }
                                                        className="gs-table-body-items cursor--pointer gsa-hover--gray">

                                                        <td className="gs-table-body-item">
                                                            <UikCheckbox
                                                                className="m-0"
                                                                name={ 'checkbox_' + dataRow.id }
                                                                checked={ this.isSelectedProduct(dataRow.id) }
                                                                onChange={ (e) => {
                                                                    this.handleSelectProduct(e, dataRow.id);
                                                                } }
                                                            />
                                                            <span><b>{ dataRow.id }</b></span>
                                                        </td>
                                                        <td className="gs-table-body-item product-thumbnail"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            <GSImg
                                                                src={ ImageUtils.getImageFromImageModel(dataRow.image, 100) }>

                                                            </GSImg>
                                                        </td>
                                                        <td className="gs-table-body-item product-table__name"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            <b>{ dataRow.name }</b>
                                                        </td>
                                                        <td className="gs-table-body-item stock text-right"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                        <span>
                                                            { dataRow.remainingStock ? CurrencyUtils.formatThousand(dataRow.remainingStock) : 0 }
                                                        </span>
                                                            <ConversionHoverButton
                                                                hidden={ !dataRow.hasConversion }
                                                                conversions={ this.state.stConversions }
                                                                onHover={ () => this.handleConversionHover(dataRow.id) }
                                                            >
                                                                { this.renderConversion(dataRow.variationNumber) }
                                                            </ConversionHoverButton>
                                                            { this.filterConfig.branch === '' && dataRow.numberOfBranch > 0 &&
                                                                <span>
                                                            &nbsp;{ i18n.t('component.product.table.branch.number') }
                                                        </span> }
                                                        </td>
                                                        <td className="gs-table-body-item status"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            { this.renderStatus(dataRow.bhStatus) }
                                                        </td>
                                                        <td className="gs-table-body-item channels"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            { this.renderSaleChannels(dataRow.saleChannels) }
                                                        </td>
                                                        <td className="gs-table-body-item variations text-center"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            { CurrencyUtils.formatThousand(dataRow.variationNumber) }
                                                        </td>
                                                        <td className="gs-table-body-item created-date text-center"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            { moment(dataRow.createdDate).format('DD-MM-YYYY') }
                                                        </td>
                                                        <td className="gs-table-body-item priority text-center"
                                                            onClick={ () => this.handleViewDetail(dataRow.id) }>
                                                            { dataRow.priority }
                                                        </td>

                                                    </tr>
                                                )
                                            })
                                            }


                                            </tbody>
                                        </GSTable>
                                        <GSPagination
                                            totalItem={ this.state.totalItem }
                                            pageSize={ this.SIZE_PER_PAGE }
                                            maxShowedPage={ 10 }
                                            currentPage={ this.state.currentPage }
                                            onChangePage={ this.onChangeListPage }
                                        >
                                        </GSPagination>

                                        {/*MOBILE*/ }
                                        <div className="mobile-product-list-container d-mobile-flex d-desktop-none">
                                            { this.state.itemList.map((dataRow, index) => {
                                                return (
                                                    <div key={ 'm-' + dataRow.id } className="m-product-row"
                                                         onClick={ () => RouteUtils.linkTo(this.props, '/product/edit/' + dataRow.id) }>
                                                        <div className="m-product-basic-info">
                                                            <img
                                                                src={ ImageUtils.getImageFromImageModel(dataRow.image, 100) }
                                                                className="product-table__thumbnail"/>
                                                            <div className="m-product-basic-info__name">
                                                                <div>
                                                                    { dataRow.name }
                                                                </div>
                                                                <div>
                                                                    { dataRow.descriptions }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                                                            <div className="m-product-detail">
                                                                <div className="m-product-detail__status">
                                                                    { this.renderStatusDot(dataRow.bhStatus) }
                                                                    { CurrencyUtils.formatThousand(dataRow.remainingStock) }
                                                                </div>
                                                                {/* <div className="m-product-detail__price">
                                                                 {CurrencyUtils.formatMoneyVND(dataRow.newPrice)}
                                                             </div> */ }
                                                            </div>
                                                            <FontAwesomeIcon icon="chevron-right"
                                                                             style={ { marginLeft: '1em' } }
                                                                             color="gray"/>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                            }
                                        </div>
                                        <PagingTable
                                            totalPage={ this.state.totalPage }
                                            maxShowedPage={ 1 }
                                            currentPage={ this.state.currentPage }
                                            onChangePage={ this.onChangeListPage }
                                            totalItems={ this.state.itemList.length }
                                            className="m-paging d-mobile-flex d-desktop-none"
                                        />

                                        { this.state.itemList.length === 0 && !this.state.isFetching &&
                                            <div
                                                className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                                <div>
                                                    <img src="/assets/images/icon-Empty.svg" alt="" />
                                                    { ' ' }
                                                    <span>
                                                 { this.filterConfig.search ?
                                                     <Trans i18nKey="page.product.list.table.empty.search.text"/> :
                                                     <Trans i18nKey="page.product.list.table.empty.text"/>
                                                 }

                                             </span>
                                                </div>
                                            </div>
                                        }
                                    </>
                                }
                            </GSWidgetContent>
                        </GSWidget>
                    </GSContentBody>
                    <GSModalBootstrap
                        ref={ ref => this.refModalExport.current = ref }
                        header={ i18next.t('productList.modal.export.title') }
                        footer={ <div className="container">
                            <div className="row justify-content-end">
                                <div className="col-4">
                                    <GSButton success outline
                                              onClick={ e => this.setHideExport() }>
                                        <GSTrans t={ 'productList.modal.export.button.cancel' }/>
                                    </GSButton>
                                </div>
                                <div className="col-4">
                                    <GSButton success marginLeft
                                              onClick={ e => {
                                                  this.doExportData();
                                              } }>
                                        <GSTrans t={ 'productList.modal.export.button.export' }/>
                                    </GSButton>
                                </div>
                            </div>
                        </div> }>

                        <div className="container">
                            {/*<BranchContext.Provider value={[this.state.selectedBranch, this.setSelectedBranch]}>*/ }
                            {/*    <BranchesSelector mode={BRANCH_SELECT_MODE_EXPORT}/>*/ }
                            {/*</BranchContext.Provider>*/ }
                            <div className="row justify-content-start p-0 m-0">
                                <div className="col-4">
                                    <h6 className="text-capitalize font-weight-bold text-nowrap">
                                        <Trans i18nKey="productList.modal.export.chooseFormat"/>
                                    </h6>
                                </div>
                            </div>
                            <AvForm>
                                <AvRadioGroup
                                    name={ 'exportType' } defaultValue={ this.state.exportType }>
                                    <div className="row justify-content-start p-0 m-0 pt-2">
                                        <div className="col-md text-nowrap">
                                            <AvRadio customInput
                                                     label={ i18next.t('productList.modal.export.format.excel') }
                                                     value={ FormatType.EXCEL }
                                                     onClick={
                                                         (e) => {
                                                             this.setState({ exportType: FormatType.EXCEL })
                                                         }
                                                     }
                                            />
                                        </div>
                                        <div className="col-md text-nowrap">
                                            {/*<AvRadio customInput*/ }
                                            {/*         label={i18next.t("productList.modal.export.format.csv")}*/ }
                                            {/*         value={FormatType.CSV}*/ }
                                            {/*         onClick={*/ }
                                            {/*             (e) => {*/ }
                                            {/*                 this.setState({exportType: FormatType.CSV})*/ }
                                            {/*             }*/ }
                                            {/*         }*/ }
                                            {/*/>*/ }
                                        </div>
                                    </div>
                                </AvRadioGroup>
                            </AvForm>
                        </div>
                    </GSModalBootstrap>
                </GSContentContainer>
                <GSProductMegaFilter
                    // key={this.filterConfig.toString()}
                    ref={ this.refFilterModal }
                    displayFilterAction={ false }
                    location={ this.filterConfig }
                    defaultDataFilter={ this.state.defaultDataFilter }
                    runFirstTime={ true }
                    filterCount={ filterCount }
                    storeBranch={ this.state.branches }
                    onFilter={ ({ count, filter }) => {
                        this.setState({
                            filterCount: count
                        });
                    } }
                    onFilterEvery={ ({ name, value }) => {
                        this.filterConfig[name] = value;
                    } }
                    onAccepted={ ({ count, filter }) => {
                        /* this.setState({
                            filterCount: count
                        }) */
                        this.onSubmitFilter(filter);
                    } }>
                </GSProductMegaFilter>
            </>
        )
    }
}


export default connect()(ProductList);
