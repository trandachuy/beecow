/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import i18next from 'i18next';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';
import {UikCheckbox, UikFormInputGroup, UikInput, UikRadio, UikSelect, UikTag} from '../../../@uik';
import {Trans} from 'react-i18next';
import Loading, {LoadingStyle} from '../../../components/shared/Loading/Loading';
import PagingTable from '../../../components/shared/table/PagingTable/PagingTable';
import './OrderList.sass';
import {connect} from 'react-redux';
import {CurrencyUtils} from '../../../utils/number-format';
import moment from 'moment';
import beehiveService from '../../../services/BeehiveService';
import authenticate from '../../../services/authenticate';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {RouteUtils} from '../../../utils/route';
import Constants from '../../../config/Constant';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import storageService from '../../../services/storage';
import GSModalFullBodyMobile from '../../../components/shared/GSModalFullBodyMobile/GSModalFullBodyMobile';
import GSButton from '../../../components/shared/GSButton/GSButton';
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent';
import * as queryString from 'query-string';
import GSComponentTooltip, {
    GSComponentTooltipPlacement
} from '../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import {CredentialUtils} from '../../../utils/credential';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal';
import GSSaleChannelIcon from '../../../components/shared/GSSaleChannelIcon/GSSaleChannelIcon';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import {BCOrderService} from '../../../services/BCOrderService';
import shopeeService from '../../../services/ShopeeService';
import PrivateComponent from '../../../components/shared/PrivateComponent/PrivateComponent';
import {PACKAGE_FEATURE_CODES} from '../../../config/package-features';
import {AgencyService} from '../../../services/AgencyService';
import storeService from '../../../services/StoreService';
import {GSToast} from '../../../utils/gs-toast';
import {cn} from '../../../utils/class-name';
import {KEY_PRINT_K57} from '../instorePurchase/complete/OrderInStorePurchaseComplete';
import catalogService from '../../../services/CatalogService';
import {TokenUtils} from '../../../utils/token';
import GSSelectPrintSizeModal from '../../../components/shared/GSSelectPrintSizeModal/GSSelectPrintSizeModal';
import HintPopupVideo from '../../../components/shared/HintPopupVideo/HintPopupVideo';
import GSDropdownAction from '../../../components/shared/GSDropdownAction/GSDropdownAction';
import GSDropDownButton, {GSDropdownItem} from '../../../components/shared/GSButton/DropDown/GSDropdownButton';
import ProductModal from '../../products/CollectionSelectProductModal/ProductModal';
import ShippingLabelModal from '../orderPrint/ShippingLabelModal';
import {OrderService} from '../../../services/OrderService';
import _ from 'lodash';
import affiliateService from '../../../services/AffiliateService';
import {DownloadUtils} from '../../../utils/download';
import {Link} from 'react-router-dom';
import AnimatedNumber from '../../../components/shared/AnimatedNumber/AnimatedNumber';
import Printer from '../orderPrint/template/Printer'
import OrderA4HTML from '../orderPrint/template/OrderA4HTML'
import {OrderInStorePurchaseContextService} from '../instorePurchase/context/OrderInStorePurchaseContextService'
import OrderKPosHTML from '../orderPrint/template/OrderKPosHTML'
import OrderListTemplate from '../orderPrint/template/OrderListTemplate'
import {OrderDetailUtils} from '../../../utils/order-detail-utils'
import {AddressUtils} from '../../../utils/address-utils'
import OrderA4Template from '../orderPrint/template/OrderA4Template'
import OrderKPosTemplate from '../orderPrint/template/OrderKPosTemplate'
import GSTooltip from '../../../components/shared/GSTooltip/GSTooltip'
import $ from "jquery";
import SearchByShippingAddress from '../../../components/shared/searchByShippingAddress/SearchByShippingAddress'
import Constant from '../../../config/Constant'
import SettingIcon from '../../../components/shared/GSSvgIcon/SettingIcon';
import OrderSettingColumnModal from './OrderSettingColumn/OrderSettingColumn';
import GSPagination from '../../../components/shared/GSPagination/GSPagination';
import GSTable from '../../../components/shared/GSTable/GSTable';

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol();

export const LIST_COLUMN_KEY = [
    {key:'ORDER_NUMBER', code:'id', checked: true, col:'left'},
    {key:'ORDER_CHANNEL', code:'channel', checked: true, col:'left'},
    {key:'ORDER_STATUS', code:'status', checked: true, col:'left'},
    {key:'CUSTOMER_NAME', code:'customerFullName', checked: true, col:'left'},
    {key:'CUSTOMER_BARCODE', code:'customerId', checked: true, col:'left'},
    {key:'TOTAL', code:'total', checked: true, col:'left'},
    {key:'PAYMENT_METHOD', code:'paymentMethod', checked: true, col:'left'},
    {key:'ORDER_DATE', code:'createdDate', checked: true, col:'left'},
    {key:'STAFF', code:'staffName', checked: true, col:'right'},
    {key:'SHIPPING_ADDRESS', code:'shippingAddress', checked: false, col:'right'},
    {key:'SHIPPING_METHOD', code:'shippingMethod', checked: false, col:'right'},
    {key:'SHIPPING_FEE', code:'shippingFee', checked: false, col:'right'},
    {key:'EARNING_POINT', code:'earningPoint', checked: false, col:'right'},
    {key:'REDEEM_POINT', code:'redeemPoint', checked: false, col:'right'},
    {key:'DISCOUNT_AMOUNT', code:'discountAmount', checked: false, col:'right'},
    
];

const LIST_COLUMN_ENUM = {
    ORDER_NUMBER: 'id',
    STAFF_NAME:'staffName',
    ORDER_CHANNEL:'channel',
    ORDER_STATUS:'status',
    SHIPPING_METHOD:'shippingMethod',
    SHIPPING_ADDRESS:'shippingAddress',
    CUSTOMER_NAME:'customerFullName',
    SHIPPING_FEE:'shippingFee',
    CUSTOMER_BARCODE:'customerId',
    EARNING_POINT:'earningPoint',
    TOTAL:'total',
    REDEEM_POINT:'redeemPoint',
    PAYMENT_METHOD:'paymentMethod',
    DISCOUNT_AMOUNT:'discountAmount',
    ORDER_DATE:'createdDate',
}

const PAYMENT_METHODS = [
    {
        value: 'ALL',
        label: i18next.t('page.order.list.filter.paymentMethod')
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_CREDIT_DEBIT_CARD_SERVICE)
    },
    {  
        value: Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_ONLINE_BANKING)
    },
    {  
        value: Constants.ORDER_PAYMENT_METHOD_COD,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_COD)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_CASH,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_CASH)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_BANK_TRANSFER)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_DEBT,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_DEBT)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_PAYPAL,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_PAYPAL)
    },
    {
        value: Constants.ORDER_PAYMENT_METHOD_MOMO,
        label: i18next.t('page.order.detail.information.paymentMethod.' + Constants.ORDER_PAYMENT_METHOD_MOMO)
    }
]

const SEARCH_TYPE = {
    SHIPPING_ADDRESS: 'SHIPPING_ADDRESS',
    CUSTOMER_NAME: 'CUSTOMER_NAME'
}

class OrderList extends Component {
    SIZE_PER_PAGE_100 = 100;
    SIZE_PER_PAGE_20 = 20;
    ON_INPUT_DELAY = 500;
    CHANEL = {
        GOSELL: "GOSELL",
        GOMUA: "BEECOW",
        LAZADA: "LAZADA",
        SHOPEE: "SHOPEE"
    }
    PROGRESS_TYPE = {
        SELF_DELIVERED: 'SELF_DELIVERED',
        SHOPEE_CONFIRM_ORDER: 'SHOPEE_CONFIRM_ORDER',
        PRINT_ORDER: 'PRINT_ORDER'
    }

    constructor(props) {
        super(props);
        const param = queryString.parse(this.props.location.search)

        this.refPrintReceiptModal = React.createRef(null);
        this.refShippingLabelModal = React.createRef(null);
        this.refPrintReceiptRef = React.createRef(null);

        this.const = {
            UI_DATE_FORMAT: "DD-MM-YYYY",
            SERVER_DATE_FORMAT: "YYYY-MM-DD",
            VIEW_DETAIL: 'DETAIL',
            VIEW_COMPACT: 'COMPACT',
            SEARCH_TYPE: ['CUSTOMER_NAME', 'ORDER_NUMBER', 'PHONE_NUMBER', 'CUSTOMER_BARCODE', SEARCH_TYPE.SHIPPING_ADDRESS]
        };

        this.state = {
            showProductModal: false,
            openShippingModal: false,
            selectedProductModal: [],
            isStaffSetting: true,
            defaultFilter: true,
            defaultParams: false,
            navigate: false,
            orderList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            isFetching: false,
            isLoading: false,
            locale: {
                format: this.const.UI_DATE_FORMAT,
                applyLabel: i18next.t("component.order.date.range.apply"),
                cancelLabel: i18next.t("component.order.date.range.cancel")
            },

            // for mobile
            isFilterMobileShow: false,
            isFilterDesktopShow: false,
            filterCount: 0,
            isShowLoading: false,
            channel: 'ALL',
            platform: 'ALL',
            payment: 'ALL',
            view: this.const.VIEW_COMPACT,
            pageSize: this.SIZE_PER_PAGE_100,
            branchList: [{label: i18next.t('page.order.list.filter.branch'), value: 'ALL'}],
            staffList:
                [
                    {label: i18next.t('page.order.list.filter.allStaff'), value: 'ALL'},
                    {label: i18next.t('page.order.detail.information.shopOwner'), value: 'Shop Owner'}
                ],
            status: 'ALL',
            branchIds: 'ALL',
            paymentMethodDefault: 'ALL',
            shopeeAccount: 'ALL',
            shopeeAccountList: [{label: i18next.t('page.order.list.filter.shopeeAccountAll'), value: 'ALL'}],
            discountDefaut: 'ALL',
            staffDefaut: 'ALL',
            discountList: [{label: i18next.t('page.order.list.filter.searchType.ALL'), value: 'ALL'}],
            filterPaneCache: {
                channel: 'ALL',
                discount: 'ALL',
                platform: 'ALL',
                status: (param && param.status) ? param.status : 'ALL',
                branchIds: 'ALL',
                shopeeAccount: 'ALL',
                payment: 'ALL'
            },
            selectedOrderIds: [],
            selectedOrder:[],
            actionToggle: false,
            modalPrintReceipt: false,
            modalShippingLabel: false,
            selectedLanguage: 'vi',
            printReceiptList: {
                langCode: 'vi',
                printSize: KEY_PRINT_K57,
                orderList: [],
                printOrderList: [],
                storeInfo: {
                    storeId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID),
                    storeDomain: AgencyService.getStorefrontDomain(),
                    storeUrl: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_URL),
                    storeImage: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_IMAGE),
                    storeName: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
                    storePhone: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_PHONE),
                    storeAddress: storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ADDRESS)
                },
                catalog: []
            },
            customDomain: '',
            isOpenOrderColumnSetting: false,
            headerConfig: []
        };

        this.tableConfig = {
            headerList: [
                'check_box_all',
                i18next.t("page.order.list.table.th.orderNumber"),
                i18next.t("page.order.list.table.th.channel"),
                i18next.t("page.order.list.table.th.status"),
                i18next.t("page.order.list.table.th.customer"),
                i18next.t("page.order.list.table.th.customerBarcode"),
                i18next.t("page.order.list.table.th.total"),
                i18next.t("page.order.list.table.th.pMethod"),
                i18next.t("page.order.list.table.th.orderDate"),
                i18next.t("login.as.staff"),
                i18next.t("page.order.list.table.th.shippingAddress"),
            ]
        };

        // check query param
        this.defaultStartDate = () => moment().subtract(30, 'days');
        this.defaultEndDate = () => moment();
        let that = this;
        this.filterConfig = {
            payment: 'ALL',
            channel: 'ALL',
            platform: 'ALL',
            discountType: 'ALL',
            discountCode: 'ALL',
            status: (param && param.status) ? param.status : 'ALL',
            fromDate: that.defaultStartDate().format(this.const.UI_DATE_FORMAT),
            toDate: that.defaultEndDate().format(this.const.UI_DATE_FORMAT),
            view: this.const.VIEW_COMPACT,
            searchType: SEARCH_TYPE.CUSTOMER_NAME,
            searchKeyword: '',
            branchIds: 'ALL',
            shopeeAccount: 'ALL',
            staffName: 'ALL',
            paymentMethod: 'ALL'
        };


        this.filterSaleChannelValues = [
            {
                value: 'ALL',
                label: i18next.t("inventoryList.toolTips.status.all"),
            },
            {
                value: 'GOSELL',
                label: AgencyService.getDashboardName(i18next.t("component.button.selector.saleChannel.gosell")),
            },
            {
                value: 'BEECOW',
                label: i18next.t("component.button.selector.saleChannel.beecow"),
            },
            {
                value: 'SHOPEE',
                label: i18next.t("component.button.selector.saleChannel.shopee"),
            },
            {
                value: 'LAZADA',
                label: i18next.t("component.button.selector.saleChannel.lazada"),
            }
        ]

        this.filterSalePlatformValues = [
            {
                value: 'ALL',
                label: i18next.t("inventoryList.toolTips.status.all"),
            },
            {
                value: 'WEB',
                label: i18next.t("component.button.selector.salePlatform.web"),
            },
            {
                value: 'APP',
                label: i18next.t("component.button.selector.salePlatform.app"),
            },
            {
                value: 'INSTORE',
                label: i18next.t("component.button.selector.salePlatform.instore"),
            },
            {
                value: 'GOSOCIAL',
                label: i18next.t("component.button.selector.salePlatform.gosocial"),
            }
        ]


        this.filterSaleDiscountValues = [
            {
                value: 'ALL',
                label: i18next.t("inventoryList.toolTips.status.all"),
            },
            {
                value: 'COUPON',
                label: i18next.t("page.discount.list.btn.productDiscountCode"),
            },
            {
                value: 'WHOLE_SALE',
                label: i18next.t("page.discount.list.btn.productWholesalePricing"),
            }
        ]

        this.filterPayment = [
            {
                value: 'ALL',
                label: i18next.t("page.button.list.btn.allPayment"),
            },
            {
                value: 'PAID',
                label: i18next.t("page.button.list.btn.paidPayment"),
            },
            {
                value: 'PARTIAL_PAYMENT',
                label: i18next.t("page.button.list.btn.partitalPayment"),
            },
            {
                value: 'UNPAID',
                label: i18next.t("page.button.list.btn.unpaidPayment"),
            }

        ]

        this.filterPrintList = ["SHOPEE", "LAZADA"];

        this.filterStatusValues = this.createSelectList(['ALL', ...Constants.ORDER_STATUS_LIST], 'page.order.detail.information.orderStatus');

        this.filterSearchTypeValues = this.createSelectList(this.const.SEARCH_TYPE, 'page.order.list.filter.searchType');

        this.optionsView = this.createSelectList([this.const.VIEW_COMPACT, this.const.VIEW_DETAIL], 'page.order.list.filter.view');

        this.onChangeListPage = this.onChangeListPage.bind(this);
        this.filterByChannel = this.filterByChannel.bind(this);
        this.filterByDate = this.filterByDate.bind(this);
        this.clearDate = this.clearDate.bind(this);
        this.filterByStatus = this.filterByStatus.bind(this);
        this.filterBySearchType = this.filterBySearchType.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
        this.changeView = this.changeView.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.moveToDetail = this.moveToDetail.bind(this);
        this.createSelectList = this.createSelectList.bind(this);
        moment.locale(storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY));
        //this.renderStatusDot = this.renderStatusDot.bind(this)
        this.toggleFilterMobileModal = this.toggleFilterMobileModal.bind(this)
        this.onChangeFilterChannel = this.onChangeFilterChannel.bind(this)
        this.onChangeFilterStatus = this.onChangeFilterStatus.bind(this)
        this.onSubmitFilter = this.onSubmitFilter.bind(this)
        this.filterDateForMobile = this.filterDateForMobile.bind(this)
        this.getInputTextDateForMobile = this.getInputTextDateForMobile.bind(this)
        this.onExportOrder = this.onExportOrder.bind(this);
        this.openProductModal = this.openProductModal.bind(this);
        this.closeProductModal = this.closeProductModal.bind(this);
        this.handleExportByProduct = this.handleExportByProduct.bind(this);
        this.createNewOrder = this.createNewOrder.bind(this);
        this.createNewQuotation = this.createNewQuotation.bind(this)
        this.toggleFilterDesktopModal = this.toggleFilterDesktopModal.bind(this);
        this.loadDefaultFilter = this.loadDefaultFilter.bind(this);
        this.fetchShopeeAccountList = this.fetchShopeeAccountList.bind(this);
        this.fetchBranchList = this.fetchBranchList.bind(this);
        this.fetchStaffList = this.fetchStaffList.bind(this);
        this.isSelectedOrder = this.isSelectedOrder.bind(this);
        this.handleSelectOrder = this.handleSelectOrder.bind(this);
        this.toggleActionDropdown = this.toggleActionDropdown.bind(this);
        this.togglePrintReceiptModal = this.togglePrintReceiptModal.bind(this);
        this.toggleShippingLabelModal = this.toggleShippingLabelModal.bind(this);
        this.toggleConfirmDeliveredModal = this.toggleConfirmDeliveredModal.bind(this);
        this.toggleConfirmShopee = this.toggleConfirmShopee.bind(this);
        this.updateConfirmShopee = this.updateConfirmShopee.bind(this);
        this.onPrintReceiptValidSubmit = this.onPrintReceiptValidSubmit.bind(this);
        this.updateOrderDelivered = this.updateOrderDelivered.bind(this);
        this.onShippingLabelValidSubmit = this.onShippingLabelValidSubmit.bind(this);
        this.handleSelectAllProduct = this.handleSelectAllProduct.bind(this);
        this.fecthCommonDataForPrint = this.fecthCommonDataForPrint.bind(this);
        this.fetchOrderProgress = this.fetchOrderProgress.bind(this);
        this.resolveInProgressTaskText = this.resolveInProgressTaskText.bind(this);
        this.resolveInProgressTaskWarningText = this.resolveInProgressTaskWarningText.bind(this);
        this.closeShippingLabelModal = this.closeShippingLabelModal.bind(this);
        this.onExportCommissionOrder = this.onExportCommissionOrder.bind(this);
        this.convertDateToISO = this.convertDateToISO.bind(this);
        this.loadDataCustomDomain = this.loadDataCustomDomain.bind(this);
        this.handleSearchByAddressCallBack = this.handleSearchByAddressCallBack.bind(this);
        this.handleOrderColumnDisplay = this.handleOrderColumnDisplay.bind(this);
        this.closeSettingColumnOrder = this.closeSettingColumnOrder.bind(this);
    }

    closeShippingLabelModal() {
        this.setState({
            openShippingModal: false
        })
    }

    createSelectList(arr, i18Next) {
        return arr.map(item => {
            return {
                value: item,
                label: i18next.t(`${i18Next}.${item}`)
            }
        })
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        });

        this.fetchData(pageIndex, this.state.pageSize, this.filterConfig);
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchBranchList();
        this.loadDefaultFilter();
        this.fetchStaffList()
        this.fetchOrderProgress();
        this.loadDataCustomDomain();
        this.handleOrderColumnDisplay();
    }

    componentDidUpdate(_, prevState) {
        if (prevState.orderList !== this.state.orderList)
            this.checkIfShippingAddressOrBuyerNamesOverflowed();
    }

    checkIfShippingAddressOrBuyerNamesOverflowed() {
        let shppingAddresses = $('.shipping-address .shipping-address-text');
        let buyerNames = $('.buyer-name-text');
        if (shppingAddresses.length || buyerNames.length) {
            let orderList = [...this.state.orderList];
            shppingAddresses.each(function(index, element) {
                if (element.offsetHeight < element.scrollHeight)
                    orderList[index] = {...orderList[index], isFullAddressOverflowed: true}
            });
            buyerNames.each(function(index, element) {
                if (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth)
                    orderList[index] = {...orderList[index], isBuyerNameOverflowed: true}
            });
            if (!_.isEqual(orderList, this.state.orderList))
                this.setState({
                    orderList
                });
        }
    }

    loadDataCustomDomain() {
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        Promise.all([
            storeService.getStorefrontInfo(storeId)
        ])
            .then(([storeInfo]) => {
                this.setState({
                    customDomain: storeInfo.webFullUrl
                })
            })
    }

    loadDefaultFilter() {
        const query = new URLSearchParams(this.props.location.search)
        if (query && query.get('searchType')) {
            this.filterConfig = {
                channel: query.get('channel'),
                platform: query.get('platform'),
                status: query.get('status'),
                fromDate: query.get('fromDate'),
                toDate: query.get('toDate'),
                view: query.get('view'),
                searchType: query.get('searchType'),
                searchKeyword: query.get('searchKeyword'),
                branchIds: query.get('branchIds') && query.get('branchIds').split(",").length === 1 ? query.get('branchIds') : 'ALL',
                shopeeAccount: query.get('shopeeAccount'),
                discountType: query.get('discountType'),
                discountCode: query.get('discountCode'),
                staffName: query.get('staffName'),
                payment: query.get('payment'),
                paymentMethod: query.get('paymentMethod')
            }
            let filterCount = 0
            if (this.filterConfig.channel && this.filterConfig.channel !== 'ALL') {
                filterCount++
            }
            if (this.filterConfig.status && this.filterConfig.status !== 'ALL') {
                filterCount++
            }

            if (this.filterConfig.platform && this.filterConfig.platform !== 'ALL') {
                filterCount++
            }

            if (this.filterConfig.branchIds && this.filterConfig.branchIds !== 'ALL') {
                filterCount++
            }
            if (this.filterConfig.discountType && this.filterConfig.discountType !== 'ALL') {
                filterCount++
            }
            if (this.filterConfig.staffName && this.filterConfig.staffName !== 'ALL') {
                filterCount++
            }
            if (this.filterConfig.paymentMethod && this.filterConfig.paymentMethod !== 'ALL') {
                filterCount++
            }
            if (this.filterConfig.payment!=='null' && this.filterConfig.payment && this.filterConfig.payment !== 'ALL') {
                filterCount++
            }
            if (this.filterConfig.discountType !== 'ALL') {
                this.fetchDiscountList(this.filterConfig.discountType)
                if (this.filterConfig.discountType === 'WHOLE_SALE') {
                    if (this.filterConfig.discountCode === 'ALL') {
                        this.onChangeFilterByDiscount(this.filterConfig.discountCode)
                    } else {
                        this.onChangeFilterByDiscount(+(this.filterConfig.discountCode))
                    }
                } else {
                    this.onChangeFilterByDiscount(this.filterConfig.discountCode)
                }
            }

            this.setState({
                defaultFilter: false,
                branchIds: query.get('branchIds') && query.get('branchIds').split(",").length === 1 ? query.get('branchIds') : 'ALL',
                platform: query.get('platform'),
                channel: query.get('channel'),
                status: query.get('status'),
                view: query.get('view'),
                shopeeAccount: query.get('shopeeAccount'),
                filterCount: filterCount,
                staffDefaut: query.get('staffName'),
                payment: query.get('payment'),
                paymentMethodDefault: query.get('paymentMethod')
            })
        }

        if (query && !query.get('searchType') && query.get('status')){
            let filterCount = 0
            if (query.get('status') && query.get('status') !== 'ALL') {
                filterCount++
            }

            this.setState({
                status: query.get('status'),
                filterCount: filterCount
            })
        }

        //this.fetchBranchList();
        this.fetchShopeeAccountList();
        this.fecthCommonDataForPrint()
    }

    fetchShopeeAccountList() {
        const allAccount = {label: i18next.t('page.order.list.filter.shopeeAccountAll'), value: 'ALL'}
        shopeeService.getConnectedShops()
            .then(accountList => {
                this.setState({
                    shopeeAccountList: [allAccount, ...accountList.map(acc => ({value: acc.id, label: acc.shopName}))]
                })
            })
            .catch(() => {
                GSToast.commonError()
            })
    }


    fetchDiscountList(data) {
        BCOrderService.getDiscounts({
            storeId: CredentialUtils.getStoreId(),
            type: data,
            sort: "lastModifiedDate,desc",
            page: 0,
            size: 99999999
        })
            .then(res => {
                let lstAccountList = [{label: i18next.t('page.order.list.filter.searchType.ALL'), value: 'ALL'}]
                if (data === 'COUPON') {
                    const uniqueDiscounts = []
                    const couponSet = new Set()

                    res.data.forEach(discountObj => {
                        if (couponSet.has(discountObj.discounts[0].couponCode)) {
                            return
                        }
                        couponSet.add(discountObj.discounts[0].couponCode)
                        uniqueDiscounts.push(discountObj)
                    })

                    uniqueDiscounts.forEach(acc => {
                        lstAccountList.push({value: acc.discounts[0].couponCode, label: acc.discounts[0].couponCode})
                    })
                } else {
                    res.data.forEach(acc => {
                        lstAccountList.push({value: acc.id, label: acc.name})
                    })
                }

                this.setState({
                    discountList: lstAccountList
                })
            })
    }

    handleOrderColumnDisplay() {
        let defaultColumnSetting = LIST_COLUMN_KEY.filter(r => r.checked).map(item => item.code)
        if(CredentialUtils.getOrderColumnSetting()){
            defaultColumnSetting = CredentialUtils.getOrderColumnSetting()
        }else{
            CredentialUtils.setOrderColumnSetting(defaultColumnSetting)
        }
        let getHeaderConfig = []
        defaultColumnSetting.forEach(key => {
            getHeaderConfig.push(i18next.t(`page.order.column.${key}`))
        })
        this.setState(state => ({
            defaultColumnSetting: defaultColumnSetting,
            headerConfig: getHeaderConfig //state.headerConfig.concat(getHeaderConfig)
        }))

    }

    fetchBranchList() {
        const query = new URLSearchParams(this.props.location.search)

        // get list branch of this user (owner or staff)
        storeService.getFullStoreBranches(0, 9999).then(res => {
            const data = res.data || [];
            let lstAccessBranch = this.state.branchList;
            let lstAll = [];
            data.forEach(branch => {
                lstAccessBranch.push({value: branch.id, label: branch.name});
                lstAll.push(branch.id);
            });

            this.setState({branchList: lstAccessBranch});

            if (this.filterConfig.branchIds === 'ALL') {
                this.filterConfig.branchIds = lstAll.join(',')
            }

            this.setState({
                currentPage: query && query.get('page') ? +(query.get('page')) : 1
            });

            this.fetchData(this.state.currentPage, this.state.pageSize, this.filterConfig);
        }).catch(e => {
            GSToast.commonError();
        })
    }

    fetchStaffList() {
        storeService.getStaffs(false, 0, 9999999999)
            .then(res => {
                const data = res.data.sort((a, b) => a.name.toLocaleUpperCase() < b.name.toLocaleUpperCase() ? -1 : 1) || [];
                let lstAccessStaff = this.state.staffList;
                data.map(staff => {
                    lstAccessStaff.push({value: staff.name, label: staff.name});
                });

                this.setState({staffList: lstAccessStaff});
            })
            .catch(e => {
                if (TokenUtils.isStaff() && e.response.status === 403) {
                    this.setState({
                        isStaffSetting: false
                    })
                    return
                }
                GSToast.commonError();
            })
    }

    resolveInProgressTaskText(progressType) {
        switch (progressType) {
            case this.PROGRESS_TYPE.SELF_DELIVERED:
            case this.PROGRESS_TYPE.SHOPEE_CONFIRM_ORDER:
                return i18next.t("page.product.list.inProgressTask", {
                    taskName: i18next.t("page.product.list.taskName." + progressType)
                })
            case this.PROGRESS_TYPE.PRINT_ORDER:
                return i18next.t("page.orderList.progress.printOrder")
        }

        return ''
    }

    resolveInProgressTaskWarningText(progressType) {
        switch (progressType) {
            case this.PROGRESS_TYPE.SELF_DELIVERED:
            case this.PROGRESS_TYPE.SHOPEE_CONFIRM_ORDER:
                return i18next.t("page.product.list.inProgressTaskWarning", {
                    taskName: i18next.t("page.product.list.taskName." + progressType)
                })
        }

        return ''
    }

    fetchOrderProgress() {
        return OrderService.getListProgressOrder()
            .then(res => {
                if (res?.length) {
                    const progress = res[0];

                    this.setState({
                        itemProgressText: this.resolveInProgressTaskText(progress.progressType),
                        itemProgressWarningText: this.resolveInProgressTaskWarningText(progress.progressType)
                    })

                    return true
                }

                this.setState({itemProgressText: "", itemProgressWarningText: ""})
            })
            .catch(error => {
                console.log(error)
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // for mobile filter
    toggleFilterMobileModal() {
        this.setState(state => ({
                isFilterMobileShow: !state.isFilterMobileShow
            })
        )
    }

    toggleFilterDesktopModal(reset = true) {


        if (!this.state.isFilterDesktopShow) { // preparing for open
            this.setState(state => ({
                filterPaneCache: {
                    channel: this.state.channel,
                    platform: this.state.platform,
                    status: this.state.status,
                    branchIds: this.state.branchIds,
                    shopeeAccount: this.state.shopeeAccount,
                    payment: this.state.payment
                },
                isFilterDesktopShow: true
            }))
        } else { // => close
            this.setState(state => ({
                isFilterDesktopShow: false
            }))
            if (reset) {
                this.onChangeFilterChannel(this.state.filterPaneCache.channel)
                this.onChangeFilterPlatform(this.state.filterPaneCache.platform)
                this.onChangeFilterStatus(this.state.filterPaneCache.status)
                this.onChangeFilterByBranch(this.state.filterPaneCache.branchIds)
                this.onChangeFilterByShopeeAccount(this.state.filterPaneCache.shopeeAccount)
                this.onChangeFilterPayment(this.state.filterPaneCache.payment)
            }
        }
    }

    // for mobile filter
    onChangeFilterChannel(channel) {
        this.filterConfig.channel = channel.toUpperCase();
        if (channel === 'ALL') {
            this.setState({
                view: this.const.VIEW_COMPACT
            });

        }
        if (this.state.channel !== 'GOSELL' || this.state.channel !== 'ALL') {
            this.filterConfig.staffName = 'ALL'
        }
        this.setState({
            channel: channel
        });
    }

    // for mobile filter
    onChangeFilterPlatform(platform) {
        this.filterConfig.platform = platform.toUpperCase();
        if (platform === 'ALL') {
            this.setState({
                view: this.const.VIEW_COMPACT
            });
        }
        this.setState({
            platform: platform
        });
        if (platform !== 'IN_STORE') {
            this.setState({
                payment: null
            })
            this.filterConfig.payment = null
        }
    }

    onChangeFilterPayment(payment) {
        this.filterConfig.payment = payment.toUpperCase();
        this.setState({
            payment: payment
        });
    }

    // for mobile filter
    onChangeFilterStatus(status) {
        this.setState({
            status: status
        })
        this.filterConfig.status = status.toUpperCase()
    }

    // for mobile filter
    onChangeFilterView(view) {
        // this.setState({
        //     view: view
        // })
        this.filterConfig.view = view.toUpperCase()
    }

    // for mobile filter
    onChangeFilterDiscount(discount) {
        if (discount !== 'ALL') {
            this.fetchDiscountList(discount)
        }
        this.filterConfig.discountType = discount.toUpperCase();
        this.filterConfig.discountCode = 'ALL'
        if (discount === 'ALL') {
            this.setState({
                view: this.const.VIEW_COMPACT
            });

        }
        this.setState({
            discountDefaut: 'ALL',
        });
    }

    // for mobile filter
    onSubmitFilter() {
        if (this.state.defaultParams) {
            this.fetchData(1, this.SIZE_PER_PAGE, this.filterConfig)
        } else {
            this.filter();
        }
        if (this.state.isFilterMobileShow) {
            this.toggleFilterMobileModal();
        } else {
            this.toggleFilterDesktopModal(false);

        }
    }

    // filter date for mobile
    filterDateForMobile(e, picker, action) {
        if (action === 'from') {
            this.filterConfig.fromDate = picker.startDate.format(this.const.UI_DATE_FORMAT);
        } else if (action === 'to') {
            this.filterConfig.toDate = picker.endDate.format(this.const.UI_DATE_FORMAT);
        }
        this.filter()
    }

    // load value date for mobile
    getInputTextDateForMobile(action) {
        if (action === 'from') {
            return this.filterConfig.fromDate ? this.filterConfig.fromDate : i18next.t('component.order.time.from')
        } else if (action === 'to') {
            return this.filterConfig.toDate ? this.filterConfig.toDate : i18next.t('component.order.time.to')
        }
    }

    changeView(view) {
        this.filterConfig.view = view;
        const pageSize = view === this.const.VIEW_COMPACT ? this.SIZE_PER_PAGE_100 : this.SIZE_PER_PAGE_20;
        this.setState({
            view: view,
            currentPage: 1,
            pageSize: pageSize
        });
        this.fetchData(1, pageSize, this.filterConfig);
    }

    filter(page) {
        const query = new URLSearchParams(this.props.location.search)
        // count filter for mobile
        let filterCount = 0
        if (this.filterConfig.channel && this.filterConfig.channel !== 'ALL') {
            filterCount++
        }
        if (this.filterConfig.status && this.filterConfig.status !== 'ALL') {
            filterCount++
        }

        if (this.filterConfig.platform && this.filterConfig.platform !== 'ALL') {
            filterCount++
        }

        if (this.state.branchIds && this.state.branchIds !== 'ALL') {
            filterCount++
        }
        if (this.state.discount && this.state.discount !== 'ALL') {
            filterCount++
        }
        if (this.state.payment && this.state.payment !== 'ALL') {
            filterCount++
        }
        this.setState({
            currentPage: page || (query?.get('page') ? +(query.get('page')) : 1),
            filterCount: filterCount
        }, () => this.fetchData(this.state.currentPage, this.state.pageSize, this.filterConfig));
        
    }

    filterByChannel(channelName) {
        this.setState({
            channel: channelName
        });
        this.filterConfig.channel = channelName.toUpperCase();
        if (channelName === 'ALL') {
            this.setState({
                view: this.const.VIEW_COMPACT
            });
        }
        this.filter()
    }

    onChangeFilterByBranch(value) {

        if (value === 'ALL') {
            const lstAll = this.state.branchList.map(branch => {
                return branch.value
            }).join(',').replace('ALL,', '');
            this.filterConfig.branchIds = lstAll;
        } else {
            this.filterConfig.branchIds = value;
        }
        this.setState({
            branchIds: value
        })

    }

    onChangeFilterByShopeeAccount(value) {
        this.filterConfig.shopeeAccount = value
        this.setState({
            shopeeAccount: value
        })
    }

    onChangeFilterByDiscount(value) {
        this.filterConfig.discountCode = value
        this.setState({
            discountDefaut: value
        })
    }

    onChangeFilterByPaymentMethod(value) {
        this.filterConfig.paymentMethod = value
        this.setState({
            paymentMethodDefault: value
        })
    }

    onChangeFilterByStaff(value) {
        this.filterConfig.staffName = value
        this.setState({
            staffDefaut: value
        })
    }

    filterByPlatform(platform) {
        this.setState({
            platform: platform
        });
        this.filterConfig.platform = platform.toUpperCase();
        this.filter()
    }

    filterByStatus(status) {
        this.filterConfig.status = status.toUpperCase();
        this.filter();
    }

    filterBySearchType(searchType) {
        this.filterConfig.searchKeyword = ''
        this.filterConfig.searchType = searchType.toUpperCase();
        this.filter();
    }
    
    handleSearchByAddressCallBack = (value) => {
        this.filterConfig.searchKeyword = value;
        this.filter();
    }

    onInputSearch(event) {
        const value = event.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            this.filterConfig.searchKeyword = value;
            this.filter(1);
            event.preventDefault()
        }, 1000)
    }

    filterByDate(event, picker) {
        this.filterConfig.fromDate = picker.startDate.format(this.const.UI_DATE_FORMAT);
        this.filterConfig.toDate = picker.endDate.format(this.const.UI_DATE_FORMAT);
        this.filter();
    }

    clearDate(event, picker) {
        this.filterConfig.fromDate = null;
        this.filterConfig.toDate = null;
        this.filter();
    }

    getInputTextDate() {
        if (this.filterConfig.fromDate != null) {
            return this.filterConfig.fromDate + ' - ' + this.filterConfig.toDate;
        } else {
            return i18next.t("component.order.all.time");
        }
    }

    convertDateToISO(text, suffix) {
        if (text) {
            return moment(text, this.const.UI_DATE_FORMAT).format(this.const.SERVER_DATE_FORMAT) + suffix;
        }
    }

    convertAllToNull(text) {
        if (text && text.toUpperCase() === 'ALL') {
            return null
        }
        if(text === 'null'){
            return null
        }
        return text
    };

    fetchData(page, size, filterConfig) {
        if (this.state.defaultParams) {
            this.props.history.push(`/order/list?channel=${filterConfig.channel}&page=${page}&platform=${filterConfig.platform}&status=${filterConfig.status}&fromDate=${filterConfig.fromDate}&toDate=${filterConfig.toDate}&view=${filterConfig.view}&searchType=${filterConfig.searchType}&searchKeyword=${filterConfig.searchKeyword}&branchIds=${filterConfig.branchIds}&shopeeAccount=${filterConfig.shopeeAccount}&discountType=${filterConfig.discountType}&discountCode=${filterConfig.discountCode}&staffName=${filterConfig.staffName}&payment=${filterConfig.payment}&paymentMethod=${filterConfig.paymentMethod}`)
            return
        }

        this.setState({
            isFetching: true,
            defaultParams: true
        });

        const convertDateToISO = (text, suffix) => {
            if (text) {
                return moment(text, this.const.UI_DATE_FORMAT).format(this.const.SERVER_DATE_FORMAT) + suffix;
            }
        };

        const getDashboardOrder = (storeId, options) => {
            if (options.channel === 'GOSELL' || options.channel === 'BEECOW') {
                return beehiveService.getDashboardOrder(storeId, options);
            } else if (options.channel === null && filterConfig.discountType !== 'ALL') {
                return beehiveService.getDashboardOrder(storeId, options);
            } else if (options.channel === 'SHOPEE') {
                return beehiveService.getDashboardOrder(storeId, options);
            } else if (options.channel === 'LAZADA') {
                return beehiveService.getDashboardOrder(storeId, options);
            } else {
                return beehiveService.getDashboardOrder(storeId, options);
            }
        };

        let dateFrom;
        let dateTo;

        if (filterConfig.fromDate === 'null' || filterConfig.fromDate === null || !filterConfig.fromDate) {
            dateFrom = null;
        } else {
            const from = convertDateToISO(filterConfig.fromDate, "T00:00:00.000");
            dateFrom = from + moment(from).format('Z') + '';
        }

        if (filterConfig.toDate === 'null' || filterConfig.toDate === null || !filterConfig.toDate) {
            dateTo = null;
        } else {
            const to = convertDateToISO(filterConfig.toDate, "T23:59:59.000");
            dateTo = to + moment(to).format('Z') + '';
        }
        getDashboardOrder(authenticate.getStoreId(), {
            page: +(page) - 1,
            size: size,
            channel: this.convertAllToNull(filterConfig.channel),
            platform: this.convertAllToNull(filterConfig.platform),
            status: this.convertAllToNull(filterConfig.status),
            payment: this.convertAllToNull(filterConfig.payment),
            fromDate: dateFrom,
            toDate: dateTo,
            view: filterConfig.view,
            searchType: filterConfig.searchType,
            searchKeyword: filterConfig.searchKeyword,
            branchIds: filterConfig.branchIds === 'ALL' ? '' : filterConfig.branchIds,
            shopId: filterConfig.shopeeAccount === 'ALL' ? undefined : filterConfig.shopeeAccount,
            discountType: filterConfig.discountType === 'ALL' ? undefined : filterConfig.discountType,
            discountCode: filterConfig.discountType === 'COUPON' ? filterConfig.discountCode === 'ALL' ? undefined : filterConfig.discountCode : undefined,
            wholeSaleId: filterConfig.discountType === 'WHOLE_SALE' ? filterConfig.discountCode === 'ALL' ? undefined : filterConfig.discountCode : undefined,
            staffName: filterConfig.staffName === 'ALL' ? undefined : filterConfig.staffName,
            paymentMethod: filterConfig.paymentMethod === 'ALL' ? undefined : filterConfig.paymentMethod,
        }).then(async result => {

            const totalItem = parseInt(result.headers['x-total-count']);
            const totalRevenue = parseFloat(result.headers['x-total-revenue']);
            if (this._isMounted) {
                let orders = await this.fetchAddresses(result.data);
                this.setState({
                    orderList: orders,
                    totalPage: Math.ceil(totalItem / size),
                    isFetching: false,
                    totalItem: totalItem,
                    totalRevenue: totalRevenue ? totalRevenue : 0,
                    page: page - 1
                });
            }

        }, () => {
            if (this._isMounted) {
                this.setState({
                    orderList: [],
                    isFetching: false
                });
            }
        });
    }

    renderChannel(channel) {
        let className = 'gs-status-tag ';
        switch (channel) {
            case "GOSELL":
                className += 'gs-status-tag--gosell';
                channel = i18next.t("component.button.selector.saleChannel.gosell");
                break;
            case "BEECOW":
                className += 'gs-status-tag--beecow';
                break;
            case "LAZADA":
                className += 'gs-status-tag--lazada';
                break;
            case "SHOPEE":
                className += 'gs-status-tag--shopee';
                break;
            default:
        }
        return (
            <UikTag fill className={className}>
                <b>{channel}</b>
            </UikTag>
        )
    }

    getIndex(index) {
        return this.state.totalItem - (this.state.page * this.state.pageSize) - index;
    }

    moveToDetail(detail, e) {
        if (e.target.classList.contains('uik-checkbox__label') || e.target.classList.contains('uik-checkbox__checkbox')) {
            return
        }

        // rebranding beecow -> gomua
        let channel = detail.channel.toLowerCase();
        if (channel === 'beecow') channel = 'gomua';
        RouteUtils.linkTo(this.props, `/order/detail/${channel}/${detail.id}`)
    }

    onExportOrder() {
        const onDownload = () => {
            this.setState({
                isShowLoading: true
            })

            const convertDateToISO = (text, suffix) => {
                text = (text) ? text.replace(/null/gi, '') : '';
                if (text) {
                    return moment(text, this.const.UI_DATE_FORMAT).format(this.const.SERVER_DATE_FORMAT) + suffix;
                }
                return '';
            };

            const from = convertDateToISO(this.filterConfig.fromDate, "T00:00:00.000");
            const to = convertDateToISO(this.filterConfig.toDate, "T23:59:59.000");

            let dateFrom = '';
            let dateTo = '';

            if (from) {
                dateFrom = from + moment(from).format('Z') + '';
            }

            if (to) {
                dateTo = to + moment(to).format('Z') + '';
            }

            const params = {
                channel: this.convertAllToNull(this.filterConfig.channel),
                platform: this.convertAllToNull(this.filterConfig.platform),
                status: this.convertAllToNull(this.filterConfig.status),
                payment: this.convertAllToNull(this.filterConfig.payment),
                fromDate: dateFrom,
                toDate: dateTo,
                searchType: this.filterConfig.searchType,
                searchKeyword: this.filterConfig.searchKeyword,
                branchIds: this.filterConfig.branchIds,
                discountType: this.convertAllToNull(this.filterConfig.discountType),
                discountCode: this.convertAllToNull(this.filterConfig.discountCode.toString()),
                staffName: this.convertAllToNull(this.filterConfig.staffName),
                paymentMethod: this.convertAllToNull(this.filterConfig.paymentMethod)
            };

            /* if(!params.toDate) {
                delete params['toDate']
            } */
            if(this.state.selectedOrderIds.length === 0){
                beehiveService.exportDashboardOrder(CredentialUtils.getStoreId(), params)
                    .then(result => {
                        GSToast.success(i18next.t('productList.export.data.success'))
                    })
                    .catch(e => {
                        GSToast.commonError();
                    })
                    .finally(() => {
                        this.setState({
                            isShowLoading: false
                        })
                    })   
            }else {
                const dataExportOrder = this.state.selectedOrder.map(p=>{
                    return {
                        id:p.id,
                        saleChannel : p.channel === 'SHOPEE' || p.channel === 'LAZADA' ? p.channel : 'GOSELL'
                    }
                })
                beehiveService.exportDashboardOrder2(dataExportOrder)
                    .then(result => {
                        GSToast.success(i18next.t('productList.export.data.success'))
                    })
                    .catch(e => {
                        GSToast.commonError();
                    })
                    .finally(() => {
                        this.setState({
                            isShowLoading: false
                        })
                    })
            }
            
            
        }

        
        this.refConfirmExport.openModal({
            messages: i18next.t('page.order.list.exportConfirm'),
            okCallback: onDownload
        })

    }

    createNewOrder() {
        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.orderInStorePurchase)
    }

    createNewQuotation() {
        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.quotation)
    }

    handleSelectAllProduct(event) {
        const checked = event.currentTarget.checked
        if (checked) {
            const selectedProductIds = this.state.orderList
                //.filter(dataRow => this.filterPrintList.indexOf(String(dataRow.channel).toUpperCase()) === -1)
                .map(dataRow => dataRow.id)
            this.setState({
                selectedOrderIds: selectedProductIds,
                selectedOrder:this.state.orderList
            })
        } else {
            this.setState({
                selectedOrderIds: [],
                selectedOrder: []
            })
        }
    }

    toggleActionDropdown(toggle) {
        this.setState({
            actionToggle: toggle
        })
    }

    isSelectedOrder(orderId) {
        return this.state.selectedOrderIds.includes(orderId)
    }

    handleSelectOrder(e, orderId, data) {
        const checked = e.target.checked

        if (checked) {
            this.setState(state => ({
                selectedOrderIds: [...state.selectedOrderIds, orderId],
                selectedOrder: [...state.selectedOrder, data]
            }))
            return
        }

        const index = this.state.selectedOrderIds.indexOf(orderId)
        if (index < 0) {
            return
        }
        this.setState(state => {
            state.selectedOrderIds.splice(index, 1)
            state.selectedOrder.splice(index, 1)

            return {
                selectedOrderIds: [...state.selectedOrderIds],
                selectedOrder: [...state.selectedOrder]
            }
        })
    }

    async isMultiTaskInProgress() {
        return this.fetchOrderProgress()
            .then(isProgress => {
                if (!isProgress) {
                    return false
                }

                this.state.itemProgressWarningText && GSToast.warning(
                    <div dangerouslySetInnerHTML={{__html: this.state.itemProgressWarningText}}/>
                )

                return true
            })
    }

    togglePrintReceiptModal() {
        if (this.state.modalPrintReceipt) {
            this.setState(state => ({
                modalPrintReceipt: !state.modalPrintReceipt
            }))

            return
        }

        storeService.getLanguages()
            .then(languages => {
                this.setState(state => ({
                    modalPrintReceipt: !state.modalPrintReceipt,
                    selectedLanguage: languages.find(lang => lang.isInitial).langCode
                }))
            })
    }

    toggleShippingLabelModal() {
        this.setState(state => ({
            modalShippingLabel: !state.modalShippingLabel,
        }))
    }

    async toggleConfirmDeliveredModal() {
        if (await this.isMultiTaskInProgress()) return

        this.refConfirmExport.openModal({
            messages:
                (<GSTrans t="page.order.list.actions.confirmDelivered.message"
                          values={{x: this.state.selectedOrderIds.length}}>
                    0<span style={{color: '#9EA0A5'}}>1</span>2<strong>3</strong>
                </GSTrans>),
            okCallback: this.updateOrderDelivered
        })
    }

    async updateOrderDelivered() {
        if (await this.isMultiTaskInProgress()) return;
        const listOrder = this.filterSelectedOrderByChannel([this.CHANEL.GOSELL, this.CHANEL.GOMUA]);
        this.setState({
            isShowLoading: true
        });
        BCOrderService.deliveredOrderSelfDelivery(listOrder).then(() => {
            this.fetchData(this.state.currentPage, this.state.pageSize, this.filterConfig);
            this.fetchOrderProgress()
        }).catch(() => {
            GSToast.commonError()
        }).finally(() => {
            this.setState({
                isShowLoading: false
            });
        })
    }

    filterSelectedOrderByChannel(channels = []) {
        const lstOrderByChannel = this.state.orderList.filter(or => {
            return channels.indexOf(or.channel) > -1;
        }).map(or => or.id);
        const result = this.state.selectedOrderIds.filter(id => {
            return lstOrderByChannel.indexOf(id) !== -1;
        });
        return result;
    }

    async toggleConfirmShopee() {
        if (await this.isMultiTaskInProgress()) return

        const listOrder = this.filterSelectedOrderByChannel([this.CHANEL.SHOPEE]);
        if (this.refConfirmExport) {
            this.refConfirmExport.openModal({
                messages: (<GSTrans t="page.order.list.actions.confirmShopee.message"
                                    values={{quatity: listOrder.length}}>
                    <span style={{color: '#9EA0A5'}}></span>
                </GSTrans>),
                okCallback: () => {
                    this.updateConfirmShopee(listOrder)
                }
            })
        }
    }

    async updateConfirmShopee(listOrder = []) {
        if (await this.isMultiTaskInProgress()) return

        this.setState({
            isShowLoading: true
        });

        shopeeService.confirmOrderMulti(listOrder).then(res => {
            this.fetchData(this.state.currentPage, this.state.pageSize, this.filterConfig);
            this.fetchOrderProgress()
        }).catch(e => {
            console.log("multiple confirm shopee order error", e);
            GSToast.commonError();
        }).finally(() => {
            this.setState({
                isShowLoading: false
            });
        });
    }

    togglePrintSizeModal = toggle => {
        this.setState(state => ({
            modalPrintReceipt: _.isBoolean(toggle) ? toggle : !state.modalPrintReceipt
        }))
    }

    async onPrintReceiptValidSubmit(data) {
        try {
            const listOrder = this.filterSelectedOrderByChannel([this.CHANEL.GOSELL, this.CHANEL.GOMUA]);

            if (!listOrder || listOrder.length === 0) {
                const error = i18next.t('modal.print.receipt.error.no.order', { channel: 'Gosell' });
                GSToast.error(error, false);
                this.setState({ modalPrintReceipt: false });
                return;
            }

            this.togglePrintSizeModal(false)

            this.setState({
                itemProgressText: this.resolveInProgressTaskText(this.PROGRESS_TYPE.PRINT_ORDER),
            })
            const orderDetails = await BCOrderService.getListBcOrderDetail(this.state.selectedLanguage, listOrder);

            if (!orderDetails) {
                return;
            }

            const printOrderList = await this.getOrdersForPrint(orderDetails, data.languageSelect, data)

            this.setState((state) => ({
                printReceiptList: {
                    ...state.printReceiptList,
                    langCode: data.languageSelect,
                    printSize: data.printSizeRadioGroup,
                    orderList: orderDetails,
                    printOrderList
                }
            }), () => this.refPrintReceiptRef.current.print())
        } catch (error) {
            GSToast.commonError()
            console.log(error);
            this.setState({
                itemProgressText: this.resolveInProgressTaskText(),
            })
        } finally {
            this.setState({
                isShowLoading: false,
            });
        }
    }

    async fecthCommonDataForPrint() {
        const catalog = await catalogService.getCitiesTreeByCountryCode(Constants.CountryCode.VIETNAM);
        const printReceipt = {...this.state.printReceiptList};
        printReceipt.catalog = catalog;
        this.setState({
            printReceiptList: printReceipt
        })
    }

    onShippingLabelValidSubmit() {
        this.setState({
            openShippingModal: true
        })
    }

    openProductModal() {
        this.setState({
            showProductModal: true
        })
    }

    onExportCommissionOrder() {

        this.setState({
            isLoading: true
        })
        const fromDate = this.convertDateToISO(this.filterConfig.fromDate, "T00:00:00.000Z");
        const toDate = this.convertDateToISO(this.filterConfig.toDate, "T23:59:59.000Z");


        affiliateService.exportResellerOrderReport(fromDate, toDate)
            .then(arrayBuffer => {
                const filename = 'partner-order-payout-' + (new Date()).getTime() + '.xlsx'
                DownloadUtils.saveDataToFile(arrayBuffer, filename)
            }).finally(() => {
            this.setState({
                isLoading: false
            })
        })
    }

    closeProductModal(products) {
        const that = this;
        let items = products || [];
        let selectedItemIds = items.filter(i => !!i && !!i.id).map(i => {return i.id});
        this.setState({
            showProductModal: false,
            selectedProductModal: selectedItemIds
        }, () => {
            if(selectedItemIds.length > 0) {
                that.handleExportByProduct()
            }
        });
    }

    async handleExportByProduct() {
        const items = this.state.selectedProductModal.filter(v => v != null);

        const convertDateToISO = (text, suffix) => {
            text = (text) ? text.replace(/null/gi, '') : '';
            if (text) {
                return moment(text, this.const.UI_DATE_FORMAT).format(this.const.SERVER_DATE_FORMAT) + suffix;
            }
            return '';
        };

        const fromDate = convertDateToISO(this.filterConfig.fromDate, "T00:00:00.000Z");
        const toDate = convertDateToISO(this.filterConfig.toDate, "T23:59:59.000Z");

        const storeId = CredentialUtils.getStoreId();
        const langKey = CredentialUtils.getLangKey();

        // TODO: Temporary fix: sendMail(false) param will be removed after release 3.6
        const params = {
            fromDate: fromDate,
            toDate: toDate,
            langKey: langKey
        };

        this.setState({
            isShowLoading: true
        });

        OrderService.exportOrderByProduct(storeId, items, params).then(result => {
            GSToast.success(i18next.t('productList.export.data.success'))
        })
        .catch((e) => GSToast.commonError())
        .finally(() => {
            this.setState({
                isShowLoading: false,
                selectedProductModal: []
            })
        })
    }

    buildAddressForOrder = (order, langCode) => {
        const { orderInfo, shippingInfo, billingInfo } = order

        return AddressUtils.buildAddressWithCountry(
            shippingInfo['address1'],
            shippingInfo['district'],
            shippingInfo['ward'],
            shippingInfo['country'],
            billingInfo['countryCode'],
            {
                langCode
            },
            {
                address2: billingInfo['address2'],
                city: billingInfo['outSideCity'],
                zipCode: billingInfo['zipCode']
            }
        )
            .then(address => ({
                orderId: orderInfo.orderId,
                address
            }))
    }

    buildAddressForBranch = (branch, langCode) => {
        const { address, ward, district, city, countryCode, address2, cityName, zipCode } = branch

        return AddressUtils.buildAddressWithCountry(address, district, ward, city, countryCode, { langCode: langCode }, {
            address2,
            cityName,
            zipCode
        })
            .then(address => ({
                branchId: branch.id,
                address
            }))
    }

    processPrepareData = (orders, langCode) => {
        const userIds = _.uniq(orders.map(({ customerInfo }) => customerInfo.userId))
        const storeBranches = _.uniqBy(orders.map(({ storeBranch }) => storeBranch), b => b.id)

        return Promise.allSettled([
            Promise.allSettled(userIds.map(id => OrderService.getCustomerOrderSummary(id, Constants.SaleChannels.GOSELL, true))),
            Promise.allSettled(orders.map(order => this.buildAddressForOrder(order, langCode))),
            Promise.allSettled(orders.map(order => OrderService.getEarningPoint(order.orderInfo.orderId, 'ORDER'))),
            Promise.allSettled(storeBranches.map(branch => this.buildAddressForBranch(branch, langCode)))
        ])
    }

    getOrdersForPrint = async (orders, langCode, customContent) => {
        const { storePhone, storeUrl } = this.state.printReceiptList.storeInfo

        return await this.processPrepareData(orders, langCode)
            .then(([orderSummaries, shippingAddresses, earningPoints, storeBranches]) =>
                orders.map(order => {
                    const shippingAddress = shippingAddresses.value?.find(a => a.value?.orderId == order.orderInfo.orderId)

                    order.shippingInfo = !order.orderInfo.deliveryName && !order.shippingInfo.address1
                        ? {
                            ...order.shippingInfo,
                            method: 'IN_STORE',
                            address: order.shippingAddress?.address
                        }
                        : {
                            ...order.shippingInfo,
                            method: 'DELIVERY',
                            amount: order.orderInfo.shippingFee,
                            deliveryName: order.orderInfo.deliveryName,
                            address: shippingAddress?.value?.address
                        }

                    order.orderInfo.totalTaxAmount ||= 0

                    const { customerInfo, orderInfo, storeBranch, billingInfo, shippingInfo } = order

                    const summary = orderSummaries.value?.find(s => s.value?.userId == customerInfo.userId)
                    const earningPoint = earningPoints.value?.find(p => p.value?.sourceId == orderInfo.orderId)
                    const branchAddress = storeBranches.value?.find(a => a.value?.branchId == storeBranch.id)

                    return {
                        orderId: orderInfo.orderId,
                        orderDate: orderInfo.createDate,
                        storeInfo: {
                            storePhone: storeBranch.phoneNumberFirst || storePhone,
                            storeAddress: branchAddress?.value?.address,
                            storeDomain: AgencyService.getStorefrontDomain(),
                            storeUrl,
                            customDomain: this.state.customDomain
                        },
                        user: {
                            customerName: customerInfo.name, // customerInfo.name,
                            email: customerInfo.email,
                            customerPhone: customerInfo.phone // customerInfo.phone
                        },
                        staffName: orderInfo.inStoreCreatedBy,
                        spendingPoint: orderInfo.usePoint,
                        pointAmount: orderInfo.pointAmount,
                        earningPoint: earningPoint?.value,
                        shippingInfo,
                        productList: OrderDetailUtils.getProductListForPrint(order),
                        paymentMethod: orderInfo.paymentMethod,
                        taxAmount: orderInfo.totalTaxAmount,
                        note: orderInfo.note,
                        debt: {
                            debtAmount: orderInfo.debtAmount,
                            customerDebtAmount: summary?.value?.debtAmount,
                            isShow: !isNaN(summary?.value?.debtAmount)
                        },
                        paidAmount: orderInfo.receivedAmount,
                        subTotal: OrderInStorePurchaseContextService.calculateSubTotalPrice(OrderDetailUtils.getProductListForPrint(order)),
                        discountAmount: OrderInStorePurchaseContextService.calculateDiscountAmount(
                            OrderDetailUtils.getProductListForPrint(order),
                            orderInfo.discount,
                            OrderDetailUtils.getMembershipInfoForPrint(order)
                        ),
                        totalPrice: OrderDetailUtils.getTotalPriceForPrint(order),
                        changeAmount: OrderDetailUtils.getChangeAmountForPrint(order),
                        payableAmount: OrderDetailUtils.getPayableAmountForPrint(order, summary?.value?.debtAmount),
                        customContent,
                        langCode,
                        information: customContent.additionalInformation,
                        isUsedDelivery: false
                    }
                })
            )
    }

    handlePrintOrderDownloaded = () => {
        this.setState({
            itemProgressText: this.resolveInProgressTaskText(),
        })
    }

    getFilterStartDate = () => this.filterConfig.fromDate && this.filterConfig.fromDate !== "null"
            ? this.filterConfig.fromDate
            : moment().format(this.const.UI_DATE_FORMAT)

    getFilterEndDate = () => this.filterConfig.toDate && this.filterConfig.toDate !== "null"
            ? this.filterConfig.toDate
            : moment().format(this.const.UI_DATE_FORMAT)

    getFullShippingAddressByLangKey = order =>
        CredentialUtils.getLangKey() === Constants.LanguageKey.VIETNAMESE && order.customerCountry === Constants.CountryCode.VIETNAM
            ? order.fullShippingAddress
            : order.fullShippingAddressEn;

    fetchAddresses = async orders => {
        for (let order of orders)
            if ([this.CHANEL.SHOPEE, this.CHANEL.LAZADA].includes(order.channel)) {
                let address = await this.fetchShopeeAndLazadaAddress(order).catch(_ => Promise.resolve(''));
                CredentialUtils.getLangKey() === Constants.LanguageKey.VIETNAMESE && order.customerCountry === Constants.CountryCode.VIETNAM
                    ? order.fullShippingAddress = address
                    : order.fullShippingAddressEn = address
            }
        return orders;
    }

    fetchShopeeAndLazadaAddress = order => AddressUtils.buildAddressWithCountry(
        order.customerAddress,
        order.customerDistrict,
        order.customerWard,
        order.customerCity,
        order.customerCountry,
        {fullAddress: true, isOrderShippingAddress: true});

    settingDisplayColumnInfo(){
        this.setState({
            isOpenOrderColumnSetting: true
        })
    }

    closeSettingColumnOrder(type, columnList) {
        if(columnList){
            let getHeaderConfig = []
            columnList.forEach(key => {
                getHeaderConfig.push(i18next.t(`page.order.column.${key}`))
            })
            this.setState({
                defaultColumnSetting: columnList,
                headerConfig: getHeaderConfig
                
            })
            CredentialUtils.setOrderColumnSetting(columnList)
            GSToast.commonCreate()
        }
        this.setState({
            isOpenOrderColumnSetting: false
        })
    }
    
    handleRenderByKeyData (data) {
        const defaultColumnSetting = this.state.defaultColumnSetting
        const result = []
        for (const item of defaultColumnSetting){
            if(this.renderColumnByKey(data, item)){
                result.push(<td>{this.renderColumnByKey(data, item)}</td>)
            }
        }
        return result
    }

    renderColumnByKey(data, key){
        switch(key){
            case LIST_COLUMN_ENUM.ORDER_NUMBER :
                return this.renderColumnOrderNumber(data);
            case LIST_COLUMN_ENUM.ORDER_CHANNEL :
                return this.renderColumnOrderChannel(data);
            case LIST_COLUMN_ENUM.ORDER_STATUS:
                return this.renderColumnOrderStatus(data)
            case LIST_COLUMN_ENUM.CUSTOMER_BARCODE:
                return this.renderColumnCustomerBarCode(data)
            case LIST_COLUMN_ENUM.CUSTOMER_NAME :
                return this.renderColumnCustomerName(data);
            case LIST_COLUMN_ENUM.TOTAL:
                return this.renderColumnTotal(data)
            case LIST_COLUMN_ENUM.PAYMENT_METHOD:
                return this.renderColumnPaymentMethod(data)
            case LIST_COLUMN_ENUM.ORDER_DATE :
                return this.renderColumnCreatedDate(data);
            case LIST_COLUMN_ENUM.STAFF_NAME:
                return this.renderColumnStaffName(data)
            case LIST_COLUMN_ENUM.SHIPPING_ADDRESS:
                return this.renderColumnShippingAddress(data)
            case LIST_COLUMN_ENUM.SHIPPING_METHOD :
                return this.renderColumnShippingMethod(data);
            case LIST_COLUMN_ENUM.EARNING_POINT:
                return this.renderColumnEarningPoint(data)
            case LIST_COLUMN_ENUM.REDEEM_POINT:
                return this.renderColumnRedeemPoint(data)
            case LIST_COLUMN_ENUM.SHIPPING_FEE:
                return this.renderColumnShippingFee(data)
            case LIST_COLUMN_ENUM.DISCOUNT_AMOUNT:
                return this.renderColumnDiscountAmount(data)
            default:
                return 
        }
    }

    renderColumnOrderNumber(dataRow){
        return (
            <div>
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <b>{dataRow.id}</b>
                </Link>
            </div>
        )
    }

    renderColumnOrderChannel(dataRow){
        return(
            <div className="order-channel">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <GSSaleChannelIcon channel={dataRow.channel || "GOSELL"} width="30"/>
                </Link>
            </div>
        );
    }

    renderColumnOrderStatus(dataRow){
        return(
            <div className="order-status">
                <Link
                    className="text-dark gsa-text--non-underline order-status"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <span>{i18next.t('page.order.detail.information.orderStatus.' + dataRow.status)}</span>
                </Link>
            </div>
        );
    }

    renderColumnCustomerName(dataRow){
        return(
            <div className="customer-name">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    {
                        dataRow.isBuyerNameOverflowed
                            ? <GSComponentTooltip
                                message={dataRow.customerFullName}
                                placement={GSTooltip.PLACEMENT.BOTTOM}>
                                {this.buyerNameDiv(dataRow) }
                            </GSComponentTooltip>
                            : this.buyerNameDiv(dataRow)
                    }
                </Link>
            </div>
        );
    }

    renderColumnCustomerBarCode(dataRow){
        return(
            <div className="customer-barcode">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <span>{dataRow.customerId ? dataRow.customerId : ''}</span>
                </Link>
            </div>
        );
    }

    renderColumnTotal(dataRow){
        return(
            <div className="total">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    {dataRow.channel === "LAZADA"
                        ? CurrencyUtils.formatMoneyByCurrency(dataRow.total - dataRow.discountAmount, dataRow.currency)
                        : CurrencyUtils.formatMoneyByCurrency(dataRow.total, dataRow.currency)
                    }
                </Link>
            </div>
        );
    }
    
    renderColumnPaymentMethod(dataRow){
        return(
            <div className="payment-method">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    {dataRow.paymentMethod != null ? i18next.t('page.order.detail.information.paymentMethod.' + dataRow.paymentMethod) : ''}
                </Link>
            </div>
        );
    }

    renderColumnCreatedDate(dataRow){
        return(
            <div className="created-date">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    {moment(dataRow.createdDate).format('DD-MM-YYYY')}
                </Link>
            </div>
        );
    }

    renderColumnStaffName(dataRow){
        return(
            <div className="staff-name">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <span>{dataRow.userName || ''}</span>
                </Link>
            </div>
        );
    }

    renderColumnShippingAddress(dataRow){
        return(
            <div className="shipping-address">
                    <Link
                        className="text-dark gsa-text--non-underline"
                        to={`/order/detail/${dataRow.channel ? dataRow.channel : 'GOSELL'}/${dataRow.id}`}
                    >
                        {
                            dataRow.isFullAddressOverflowed
                            ? <GSComponentTooltip
                                message={this.getFullShippingAddressByLangKey(dataRow)}
                                placement={GSTooltip.PLACEMENT.BOTTOM}>
                                    {this.shippingAddressDiv(dataRow) }
                            </GSComponentTooltip>
                            : this.shippingAddressDiv(dataRow)
                        }
                    </Link>
                </div>
        );
    }

    renderColumnShippingMethod(dataRow){
        return(
            <div className="shipping-method">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <span>{dataRow.shippingMethod ? i18next.t(`page.marketing.discounts.coupons.create.${dataRow.shippingMethod}`) : ''}</span>
                </Link>
            </div>
        );
    }

    renderColumnEarningPoint(dataRow){
        return(
            <div className="earning-point">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <span>{typeof dataRow.earningPoint !== 'undefined' ? dataRow.earningPoint: '' }</span>
                </Link>
            </div>
        );
    }

    renderColumnRedeemPoint(dataRow){
        return(
            <div className="redeem-point">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    <span>{ typeof dataRow.redeemPoint !== 'undefined' ? dataRow.redeemPoint: ''}</span>
                </Link>
            </div>
        );
    }

    renderColumnShippingFee(dataRow){
        return(
            <div className="shipping-fee">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    
                    <span>{CurrencyUtils.formatMoneyByCurrency(dataRow.shippingFee, dataRow.currency)}</span>
                </Link>
            </div>
        );
    }

    renderColumnDiscountAmount(dataRow){
        return(
            <div className="discount-amount">
                <Link
                    className="text-dark gsa-text--non-underline"
                    to={`/order/detail/${dataRow.channel?dataRow.channel:'GOSELL'}/${dataRow.id}`}
                >
                    {CurrencyUtils.formatMoneyByCurrency(dataRow.discountAmount ? dataRow.discountAmount : 0, dataRow.currency)}
                </Link>
            </div>
        );
    }

    buyerNameDiv(dataRow){
        return (
            <div className="buyer-name-text line-clamp-2"
                    style={{padding: "0", textOverflow: "ellipsis", whiteSpace: "normal"}}
                >
                {dataRow.customerFullName ? dataRow.customerFullName: ''}
            </div>
        );
    }

    shippingAddressDiv(dataRow) {
        return (
            <div className="shipping-address-text line-clamp-2">
                {this.getFullShippingAddressByLangKey(dataRow) || ''}
            </div>
            )
    };

    render() {
        return (
            <>
                {this.state.isShowLoading && <LoadingScreen/>}
                <ConfirmModal ref={el => this.refConfirmExport = el}/>
                <GSSelectPrintSizeModal
                    printA4Template
                    isToggle={this.state.modalPrintReceipt}
                    selectedLanguage={this.state.selectedLanguage}
                    config={{
                        showCustomContent: true,
                        saveLocalStorage: true,
                        localStorageKey: GSSelectPrintSizeModal.LOCAL_STORAGE_KEY.ORDER_LIST
                    }}
                    onClose={this.togglePrintReceiptModal}
                    onPrint={this.onPrintReceiptValidSubmit}
                />
                <Printer
                    ref={ this.refPrintReceiptRef }
                    printType={ Printer.PRINT_TYPE.DOWNLOADED_URL }
                    printSize={ this.state.printReceiptList.printSize }
                    onDownloadedUrl={ this.handlePrintOrderDownloaded }
                >
                    <OrderA4HTML>
                        <OrderListTemplate
                            orders={ this.state.printReceiptList.printOrderList }
                        >
                            <OrderA4Template/>
                        </OrderListTemplate>
                    </OrderA4HTML>
                    <OrderKPosHTML>
                        <OrderListTemplate
                            orders={ this.state.printReceiptList.printOrderList }
                        >
                            <OrderKPosTemplate/>
                        </OrderListTemplate>
                    </OrderKPosHTML>
                </Printer>
                <ShippingLabelModal openModal={this.state.openShippingModal}
                                    orderList={this.state.orderList}
                                    selectedOrderIds={this.state.selectedOrderIds}
                                    closeCallback={this.closeShippingLabelModal}
                />
                {/* MODAL FILTER FOR MOBILE */}
                {this.state.isFilterMobileShow &&
                <GSModalFullBodyMobile className="order-mobile-modal__filter-wrapper"
                                       title={i18next.t("productList.filter.header.title")}
                                       rightEl={
                                           <GSButton success onClick={this.onSubmitFilter}>
                                               <GSTrans t={"common.btn.done"}/>
                                           </GSButton>
                                       }
                >
                    <div className="filter-modal-wrapper">
                        {/*BRANCH*/}
                        <div className="filter-session">
                            <b className="filter-modal__title">
                                <GSTrans t={"page.home.card.branchFilter.title"}/>
                            </b>
                            <div>
                                <select className="form-control"
                                        value={this.state.branchIds}
                                        onChange={(e) => this.onChangeFilterByBranch(e.currentTarget.value)}
                                >

                                    {this.state.branchList.map(branch => (
                                        <option value={branch.value}>{branch.label}</option>
                                    ))
                                    }
                                </select>
                            </div>
                        </div>

                        {/*PLATFORM FILTER*/}
                        <div className="filter-session">
                            <b className="filter-modal__title">
                                <GSTrans t={"page.marketing.discounts.coupons.create.usageLimits.platforms"}/>
                            </b>
                            <UikFormInputGroup>
                                {this.filterSalePlatformValues.map(platform => {
                                    return (
                                        <UikRadio
                                            defaultChecked={this.filterConfig.platform === platform.value.toUpperCase()}
                                            key={platform.value}
                                            value={platform.value}
                                            label={platform.label}
                                            name="platformFilterGr"
                                            onClick={() => this.onChangeFilterPlatform(platform.value)}
                                        />
                                    )
                                })}
                            </UikFormInputGroup>
                        </div>
                        {/*CHANNEL FILTER*/}
                        <div className="filter-session">
                            <b className="filter-modal__title">
                                <GSTrans t={"page.home.card.saleChannels.title"}/>
                            </b>
                            <UikFormInputGroup>
                                {this.filterSaleChannelValues.map(saleChannel => {
                                    return (
                                        <>
                                            <UikRadio
                                                defaultChecked={this.filterConfig.channel === saleChannel.value.toUpperCase()}
                                                key={saleChannel.value}
                                                value={saleChannel.value}
                                                label={saleChannel.label}
                                                name="saleChannelFilterGr"
                                                onClick={() => this.onChangeFilterChannel(saleChannel.value)}
                                            />
                                            {this.filterConfig.channel === 'SHOPEE' && this.filterConfig.channel === saleChannel.value.toUpperCase() &&
                                            <select className="form-control" value={this.state.shopeeAccount}
                                                    onChange={(e) => this.onChangeFilterByShopeeAccount(e.currentTarget.value)}
                                            >
                                                {this.state.shopeeAccountList.map(v => (
                                                    <option value={v.value}>{v.label}</option>
                                                ))
                                                }
                                            </select>
                                            }
                                        </>
                                    )
                                })}
                            </UikFormInputGroup>
                        </div>
                        {/*STATUS FILTER*/}
                        <div className="filter-session">
                            <b className="filter-modal__title">
                                <GSTrans t={"component.discount.tbl.status"}/>
                            </b>
                            <UikFormInputGroup>
                                {this.filterStatusValues.map(status => {
                                    return (
                                        <UikRadio
                                            defaultChecked={this.filterConfig.status === status.value.toUpperCase()}
                                            key={status.value}
                                            value={status.value}
                                            label={status.label}
                                            name="statusFilterGr"
                                            onClick={() => this.onChangeFilterStatus(status.value)}
                                        />
                                    )
                                })}
                            </UikFormInputGroup>
                        </div>
                        {/*VIEW FILTER*/}
                        <div className="filter-session">
                            <b className="filter-modal__title">
                                <GSTrans t={"page.order.list.filter.view.title"}/>
                            </b>
                            <UikFormInputGroup>
                                {this.optionsView.map(view => {
                                    return (
                                        <UikRadio
                                            disabled={this.state.channel === 'ALL'}
                                            defaultChecked={this.state.view === view.value}
                                            key={view.value}
                                            value={view.value}
                                            label={view.label}
                                            name="viewFilterGr"
                                            onClick={() => this.changeView(view.value)}
                                        />
                                    )
                                })}
                            </UikFormInputGroup>
                        </div>

                        {/*DISCOUNT FILTER*/}
                        <div className="filter-session">
                            <b className="filter-modal__title">
                                <GSTrans t={"component.discount.label.coupon.code"}/>
                            </b>
                            <UikFormInputGroup>
                                {this.filterSaleDiscountValues.map(saleChannel => {
                                    return (
                                        <>
                                            <UikRadio
                                                defaultChecked={this.filterConfig.discountType === saleChannel.value.toUpperCase()}
                                                key={saleChannel.value}
                                                value={saleChannel.value}
                                                label={saleChannel.label}
                                                name="saleChannelFilterGr"
                                                onClick={() => this.onChangeFilterDiscount(saleChannel.value)}
                                            />
                                            {this.filterConfig.discountType !== 'ALL' && this.filterConfig.discountType === saleChannel.value.toUpperCase() &&
                                            <select className="form-control"
                                                    value={this.state.discountDefaut}
                                                    onChange={(e) => this.onChangeFilterByDiscount(e.currentTarget.value)}
                                            >
                                                {this.state.discountList.map(v => (
                                                    <option value={v.value}>{v.label}</option>
                                                ))
                                                }
                                            </select>
                                            }
                                        </>
                                    )
                                })}
                            </UikFormInputGroup>
                        </div>


                        {/*STAFF*/}
                        {
                            <PrivateComponent
                                hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0268]}
                                disabledStyle={"hidden"}
                            >
                                {
                                    (this.state.channel === 'GOSELL' || this.state.channel === 'ALL') && this.state.isStaffSetting &&
                                    <div className="filter-session">
                                        <b className="filter-modal__title">
                                            <GSTrans t={"login.as.staff"}/>
                                        </b>
                                        <div>
                                            <select className="form-control"
                                                    value={this.state.staffDefaut === 'ALL' ? 'ALL' : this.state.staffDefaut}
                                                    onChange={(e) => this.onChangeFilterByStaff(e.currentTarget.value)}
                                            >
                                                {this.state.staffList.map(staff => (
                                                    <option value={staff.value}>{staff.label}</option>
                                                ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                }
                            </PrivateComponent>
                        }
                    </div>
                </GSModalFullBodyMobile>
                }

                {/* MAIN SCREEN */}
                <GSContentContainer className="order-page" minWidthFitContent isSaving={this.state.isLoading}>
                    <GSContentHeader title={
                            <div className='d-flex align-items-center'>
                                <div className="mr-2"><GSTrans t="page.order.list.title" /></div>
                                <div className='icon-setting ml-1' onClick={() => this.settingDisplayColumnInfo()}>
                                    <SettingIcon color={'gray'}/>
                                </div>
                                <HintPopupVideo title={"Order management"} category={"ORDERS"}/>
                            </div>
                        }
                        classSubTitle={'custom-wrapper p-2'}
                        subTitle={
                            <div className="row">
                                <div className="col-lg-4 col-md-6 col-sm-12 col-12 p-0 mt-1">
                                    <div className='d-flex align-items-center row'>
                                        <div className='col-lg-6 col-md-7 col-sm-7 col-7 p-0'>
                                            <img
                                                src="/assets/images/affiliate/order-count.svg"
                                                alt="order-count"
                                                width={28}
                                                height={28}
                                            />
                                            <span className="font-weight-500 color-gray pl-2">
                                                <GSTrans t="page.affiliate.order.list.totalOrders" />
                                                :&nbsp;
                                            </span>
                                        </div>
                                        <div className='col-lg-6 col-md-5 col-sm-5 col-5 p-0'>
                                             <AnimatedNumber className="font-weight-bold text-dark">
                                                { this.state.totalItem }
                                            </AnimatedNumber>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-12 col-12 p-0 mt-1">
                                    <div className='d-flex align-items-center row'>
                                        <div className='col-lg-6 col-md-7 col-sm-7 col-7 p-0'>
                                            <img
                                                src="/assets/images/affiliate/revenue-count.svg"
                                                alt="order-count"
                                                width={28}
                                                height={28}
                                            />
                                            <span
                                                className="font-weight-500 color-gray pl-2">
                                                <GSTrans t="page.affiliate.order.list.totalRevenue"/>
                                                :&nbsp;
                                            </span>
                                        </div>
                                        <div className='col-lg-6 col-md-5 col-sm-5 col-5 p-0'>
                                            <AnimatedNumber
                                                className="font-weight-bold text-dark line-clamp-1"
                                                currency = { STORE_CURRENCY_SYMBOL }
                                                precision = { STORE_CURRENCY_SYMBOL !== Constants.CURRENCY.VND.SYMBOL ? 2 : 0 }
                                            >
                                                {this.state.totalRevenue}
                                            </AnimatedNumber>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        }
                    >
                        <GSContentHeaderRightEl className="d-flex">
                            {/* <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0115]}>
                                <GSComponentTooltip message={i18next.t('page.order.list.exportHint')}
                                                    placement={GSTooltipPlacement.BOTTOM}
                                > */}
                                    <GSDropDownButton button={
                                        ({onClick}) => (
                                            <GSButton success
                                                    dropdownIcon
                                                    onClick={onClick}>
                                                <GSTrans t="page.order.list.export"/>
                                            </GSButton>)}>
                                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0115]}>
                                            <GSDropdownItem onClick={() => this.onExportOrder()}>
                                                <GSTrans t={'page.order.list.export.order'}/>
                                            </GSDropdownItem>
                                        </PrivateComponent>
                                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0115]}>
                                            <GSDropdownItem onClick={() => this.openProductModal()}>
                                                <GSTrans t={'page.order.list.export.order.by.product'}/>
                                            </GSDropdownItem>
                                        </PrivateComponent>
                                        {CredentialUtils.ROLE.RESELLER.isReSeller() &&
                                            <GSDropdownItem onClick={() => this.onExportCommissionOrder()}>
                                                <GSTrans t={'page.order.list.export.partnerOrder'}/>
                                            </GSDropdownItem>
                                        }
                                    </GSDropDownButton>
                                {/* </GSComponentTooltip>
                            </PrivateComponent> */}

                        </GSContentHeaderRightEl>
                    </GSContentHeader>
                    <GSContentBody size={GSContentBody.size.MAX} className="order-page__body">
                        {/*ORDER LIST*/}
                        <GSWidget className="gs-widget mt-0">
                            <GSWidgetContent className="order-list-widget">
                                {/*FILTER*/}
                                <div
                                    className={"n-filter-container search-input-box d-mobile-none d-desktop-flex " + (this.state.isFetching ? 'gs-atm--disable' : '')}>
                                    <div className={'gs-search-box__wrapper'}>
                                        {this.filterConfig.searchType === SEARCH_TYPE.SHIPPING_ADDRESS &&
                                            <SearchByShippingAddress
                                                callback={this.handleSearchByAddressCallBack}
                                                optionApiUrl={Constant.OPTION_API_URL_ADDRESS.getShippingAddress}
                                                defaultValue={this.filterConfig.searchKeyword}
                                            />
                                        }
                                        { this.filterConfig.searchType !== SEARCH_TYPE.SHIPPING_ADDRESS &&
                                        <div className="search">
                                                <UikInput
                                                    key={ this.filterConfig.searchKeyword }
                                                    className="search-input"
                                                    autoFocus={ this.filterConfig.searchKeyword.length > 0 ? true : false }
                                                    icon={ (
                                                        <FontAwesomeIcon icon={ "search" }/>
                                                    ) }
                                                    defaultValue={ this.filterConfig.searchKeyword }
                                                    iconPosition="left"
                                                    placeholder={ i18next.t("common.txt.searchKeyword") }
                                                    onChange={ this.onInputSearch }
                                                />
                                            </div>
                                        }
                                        <UikSelect
                                            value={[{value: this.filterConfig.searchType}]}
                                            options={this.filterSearchTypeValues}
                                            onChange={(item) => this.filterBySearchType(item.value)}
                                        />
                                    </div>
                                    <div className={'gs-search-select__wrapper'}>
                                        {/*DATE RANGE*/}
                                        <DateRangePicker minimumNights={0}
                                                         startDate={this.getFilterStartDate()}
                                                         endDate={this.getFilterEndDate()}
                                                         onApply={this.filterByDate} locale={this.state.locale}
                                                         onCancel={this.clearDate}>
                                            <input type="text" onChange={() => {
                                            }}
                                                   value={this.getInputTextDate() === 'null - null' ? 'All-time' : this.getInputTextDate()}
                                                   className="form-control"/>
                                            <FontAwesomeIcon icon="calendar" color="#939393" size="lg"/>
                                        </DateRangePicker>

                                        {/*VIEW*/}
                                        <GSComponentTooltip
                                            // disabled={this.state.cardStatus.saleChannel.isLZActive}
                                            interactive
                                            html={
                                                <>
                                                    <GSTrans t="page.order.list.view.tooltip"
                                                             values={{provider: AgencyService.getDashboardName()}}>
                                                        Switch channel to online shop in order to change compact view to
                                                        detail view.
                                                    </GSTrans>
                                                </>
                                            }
                                        >
                                            <UikSelect disabled={this.state.channel === 'ALL'}
                                                       placeholder={i18next.t('page.order.list.filter.view.title')}
                                                       value={[{value: this.filterConfig.view}]}
                                                       options={this.optionsView}
                                                       onChange={(item) => this.changeView(item.value)}
                                                       className="ml-2"
                                            />
                                        </GSComponentTooltip>

                                        {/*FILTER PANE*/}
                                        <div className="position-relative  ml-2">
                                            <div className="btn-filter-desk" onClick={this.toggleFilterDesktopModal}>
                                            <span>
                                            <GSTrans t="productList.filter.header.title"/>
                                                {' '}
                                                (
                                                {this.state.filterCount}
                                                )
                                            </span>
                                                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                                                 icon="filter"/>
                                            </div>

                                            {this.state.isFilterDesktopShow &&
                                            <div className="dropdown-menu dropdown-menu-right order-page__filter-pane"
                                                 style={{display: 'block', top: '40px'}}
                                                // onBlur={this.toggleFilterDesktopModal}
                                            >
                                                {/*BRANCH*/}
                                                <div className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans t={"page.home.card.branchFilter.title"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9">
                                                        <UikSelect
                                                            defaultValue={this.state.branchIds === 'ALL' ? 'ALL' : +(this.state.branchIds)}
                                                            options={this.state.branchList}
                                                            onChange={(item) => this.onChangeFilterByBranch(item.value)}
                                                            position={"bottomRight"}
                                                        />
                                                    </div>

                                                </div>

                                                {/*SALE PLATFORM*/}
                                                <div className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans
                                                            t={"page.marketing.discounts.coupons.create.usageLimits.platforms"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9 d-flex flex-wrap">
                                                        {this.filterSalePlatformValues.map(v => {
                                                            return (
                                                                <div key={v.value}
                                                                     className={cn("order-page__filter-option",
                                                                         {"selected": this.state.platform === v.value})}
                                                                     style={{pointerEvents:`${(this.state.channel==='LAZADA'||this.state.channel==='SHOPEE')&&v.value==='INSTORE'?'none':'all'}`,
                                                                         opacity:`${(this.state.channel==='LAZADA'||this.state.channel==='SHOPEE')&&v.value==='INSTORE'?'0.3':'1'}`
                                                                     }}
                                                                     onClick={() => this.onChangeFilterPlatform(v.value)}>
                                                                    {v.label}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                {/*PAYMENT*/}

                                                {this.state.platform !== 'ALL' && <div
                                                    className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans t={"page.home.card.paymentFilter.title"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9 ">
                                                            <GSComponentTooltip
                                                                placement={GSComponentTooltipPlacement.TOP}
                                                                interactive
                                                                disabled={this.state.platform==='INSTORE'}

                                                                html={
                                                                    <GSTrans t="page.order.filterPayment.hoverDisableFilter">
                                                                    </GSTrans>

                                                                } >
                                                            <div className={"d-flex flex-wrap"}>{this.filterPayment.map(payment => {
                                                                return (
                                                                    <div
                                                                        style={this.state.platform!=='INSTORE'?
                                                                            {opacity:'0.3',pointerEvents:'none'}:
                                                                            {opacity:'1',pointerEvents:'auto'}}

                                                                        key={payment.value}
                                                                         className={cn("order-page__filter-option",
                                                                             {"selected": this.state.payment === payment.value})}
                                                                         onClick={() => {
                                                                             this.onChangeFilterPayment(payment.value)

                                                                         }}
                                                                    >
                                                                        {payment.label}
                                                                    </div>
                                                                )
                                                            })}
                                                            </div>
                                                            </GSComponentTooltip>
                                                    </div>
                                                </div>}
                                                {/*SALE CHANNEL*/}
                                                <div className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans t={"page.home.card.saleChannels.title"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9 ">
                                                        <div className="d-flex flex-wrap">
                                                            {this.filterSaleChannelValues.map(saleChannel => {
                                                                return (
                                                                    <div key={saleChannel.value}
                                                                         className={cn("order-page__filter-option",
                                                                             {"selected": this.state.channel === saleChannel.value})}
                                                                         style={{pointerEvents:`${this.state.platform==='INSTORE'&&(saleChannel.value==='LAZADA'||saleChannel.value==='SHOPEE')?'none':'all'}`,
                                                                         opacity:`${this.state.platform==='INSTORE'&&(saleChannel.value==='LAZADA'||saleChannel.value==='SHOPEE')?'0.3':'1'}`
                                                                         }}
                                                                         onClick={() => this.onChangeFilterChannel(saleChannel.value)}>
                                                                        {saleChannel.label}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        {this.state.channel === 'SHOPEE' &&
                                                        <div>
                                                        <span className="color-gray pr-2">
                                                           <GSTrans t={"page.order.list.filter.shopeeAccount"}/>
                                                        </span>
                                                            <UikSelect
                                                                value={[{value: this.state.shopeeAccount === 'ALL' ? 'ALL' : +(this.state.shopeeAccount)}]}
                                                                options={this.state.shopeeAccountList}
                                                                onChange={(item) => this.onChangeFilterByShopeeAccount(item.value)}
                                                                position={"bottomRight"}
                                                            />
                                                        </div>
                                                        }
                                                    </div>
                                                </div>

                                                {/*STATUS*/}
                                                <div className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans t={"component.marketing.notification.tbl.status"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9 d-flex flex-wrap">
                                                        {this.filterStatusValues.map(v => {
                                                            return (
                                                                <div key={v.value}
                                                                     className={cn("order-page__filter-option",
                                                                         {"selected": this.state.status === v.value})}
                                                                     onClick={() => this.onChangeFilterStatus(v.value)}>
                                                                    {v.label}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/*SALE DISCOUNT*/}
                                                <div className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans t={"component.discount.label.coupon.code"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9 ">
                                                        <div className="d-flex flex-wrap">
                                                            {this.filterSaleDiscountValues.map(saleDiscount => {
                                                                return (
                                                                    <div key={saleDiscount.value}
                                                                         className={cn("order-page__filter-option",
                                                                             {"selected": this.filterConfig.discountType === saleDiscount.value})}
                                                                         onClick={() => this.onChangeFilterDiscount(saleDiscount.value)}>
                                                                        {saleDiscount.label}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        {this.filterConfig.discountType !== 'ALL' &&
                                                        <div>
                                                            <UikSelect
                                                                value={[{value: this.state.discountDefaut}]}
                                                                options={this.state.discountList}
                                                                onChange={(item) => this.onChangeFilterByDiscount(item.value)}
                                                                position={"bottomRight"}
                                                            />
                                                        </div>
                                                        }
                                                    </div>
                                                </div>

                                                {/*STAFF*/}
                                                {
                                                    <PrivateComponent
                                                        hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0268]}
                                                        disabledStyle={"hidden"}
                                                    >
                                                        {
                                                            (this.state.channel === 'GOSELL' || this.state.channel === 'ALL') && this.state.isStaffSetting &&
                                                            <div className="row order-page__filter-section">
                                                                <div
                                                                    className="col-12 col-md-3 order-page__filter-title">
                                                                    <GSTrans t={"login.as.staff"}/>
                                                                </div>
                                                                <div className="col-12 col-md-9">
                                                                    <UikSelect
                                                                        defaultValue={this.state.staffDefaut === 'ALL' ? 'ALL' : this.state.staffDefaut}
                                                                        options={this.state.staffList}
                                                                        onChange={(item) => this.onChangeFilterByStaff(item.value)}
                                                                        position={"bottomRight"}
                                                                    />
                                                                </div>

                                                            </div>
                                                        }
                                                    </PrivateComponent>
                                                }

                                                {/*PAYMENt METHOD*/}
                                                <div className="row order-page__filter-section">
                                                    <div className="col-12 col-md-3 order-page__filter-title">
                                                        <GSTrans t={"page.cashbook.receiptPaymentModal.paymentMethod"}/>
                                                    </div>
                                                    <div className="col-12 col-md-9">
                                                        <UikSelect
                                                            defaultValue={this.state.paymentMethodDefault === 'ALL' ? 'ALL' : this.state.paymentMethodDefault}
                                                            options={ PAYMENT_METHODS }
                                                            onChange={(item) => this.onChangeFilterByPaymentMethod(item.value)}
                                                            position={"bottomRight"}
                                                        />
                                                    </div>

                                                </div>


                                                {/*BUTTONS*/}
                                                <div className="row">
                                                    <div className="col-12">
                                                        <GSButton success size={"small"} onClick={this.onSubmitFilter}>
                                                            <GSTrans t={"common.btn.done"}/>
                                                        </GSButton>
                                                    </div>
                                                </div>
                                            </div>}
                                        </div>

                                    </div>
                                </div>

                                {/*MOBILE*/}
                                <div
                                    className={"n-filter-container search-input-box-mobile d-mobile-flex d-desktop-none " + (this.state.isFetching ? 'gs-atm--disable' : '')}>
                                    {/* DATE RANGE */}
                                    <div className={'row gs-search-box__wrapper'}>
                                        {this.filterConfig.searchType === SEARCH_TYPE.SHIPPING_ADDRESS &&
                                            <SearchByShippingAddress
                                                callback={this.handleSearchByAddressCallBack}
                                                optionApiUrl={Constant.OPTION_API_URL_ADDRESS.getShippingAddress}
                                                defaultValue={this.filterConfig.searchKeyword}
                                            />
                                        }
                                        { this.filterConfig.searchType !== SEARCH_TYPE.SHIPPING_ADDRESS &&
                                            <div className="search">
                                                <UikInput
                                                    key={ this.filterConfig.searchKeyword }
                                                    className="search-input"
                                                    defaultValue={ this.filterConfig.searchKeyword }
                                                    autoFocus={ this.filterConfig.searchKeyword.length > 0 ? true : false }
                                                    icon={ (
                                                        <FontAwesomeIcon icon={ "search" }/>
                                                    ) }
                                                    iconPosition="left"
                                                    placeholder={ i18next.t("common.txt.searchKeyword") }
                                                    onChange={ this.onInputSearch }
                                                />
                                            </div>
                                        }
                                        <UikSelect
                                            position={'bottomRight'}
                                            value={[{value: this.filterConfig.searchType}]}
                                            options={this.filterSearchTypeValues}
                                            onChange={(item) => this.filterBySearchType(item.value)}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-6 col-sm-6 left">
                                            <DateRangePicker
                                                startDate={this.getFilterStartDate()}
                                                endDate={this.getFilterEndDate()}
                                                minimumNights={0}
                                                onApply={(e, pickup) => this.filterDateForMobile(e, pickup, 'from')}
                                                locale={this.state.locale}
                                                onCancel={this.clearDate}
                                                singleDatePicker
                                            >
                                                <input type="text"
                                                       onChange={() => {
                                                       }}
                                                       value={this.getInputTextDateForMobile('from') === 'null' ? 'Từ ngày' : this.getInputTextDateForMobile('from')}
                                                       className="form-control"
                                                />
                                                <FontAwesomeIcon icon="calendar" color="#939393" size="lg"/>
                                            </DateRangePicker>
                                        </div>
                                        <div className="col-6 col-sm-6 right">
                                            <DateRangePicker
                                                startDate={this.getFilterStartDate()}
                                                endDate={this.getFilterEndDate()}
                                                minimumNights={0}
                                                onApply={(e, pickup) => this.filterDateForMobile(e, pickup, 'to')}
                                                locale={this.state.locale}
                                                onCancel={this.clearDate}
                                                singleDatePicker
                                            >
                                                <input type="text"
                                                       onChange={() => {
                                                       }}
                                                       value={this.getInputTextDateForMobile('to') === 'null' ? 'Đến ngày' : this.getInputTextDateForMobile('to')}
                                                       className="form-control"
                                                />
                                                <FontAwesomeIcon icon="calendar" color="#939393" size="lg"/>
                                            </DateRangePicker>
                                        </div>
                                    </div>

                                    {/* FILTER */}
                                    <div className="row">
                                        <div className="col-6 col-sm-6 left">
                                            <div className="btn-filter" onClick={this.toggleFilterMobileModal}>
                                            <span>
                                            <GSTrans t="productList.filter.header.title"/>
                                                {' '}
                                                (
                                                {this.state.filterCount}
                                                )
                                            </span>
                                                <FontAwesomeIcon size="xs" color="gray" className="icon-filter"
                                                                 icon="filter"/>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/*TASK LOG*/}
                                {this.state.itemProgressText &&
                                <div className="d-flex align-items-center mt-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{
                                        color: '#1665D8'
                                    }}
                                         fill="currentColor" className="bi bi-arrow-repeat gs-ani__rotate" viewBox="0 0 16 16">
                                        <path
                                            d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                        <path fillRule="evenodd"
                                              d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                                    </svg>
                                    <span className="pl-2" dangerouslySetInnerHTML={{__html: this.state.itemProgressText}}/>
                                </div>
                                }

                                {
                                    !!this.state.selectedOrderIds.length && !this.state.isFetching &&
                                    <div
                                        className='selected-product d-flex mt-3 font-weight-500 gsa__uppercase font-size-_9em'>
                                        <span>
                                            <GSTrans t='page.affiliate.order.list.number.selected'
                                                     values={{number: this.state.selectedOrderIds.length}}/>
                                        </span>
                                        <GSDropdownAction
                                            className='ml-4'
                                            toggle={this.state.actionToggle}
                                            onToggle={this.toggleActionDropdown}
                                            actions={[{
                                                label: i18next.t('page.order.list.actions.printReceipt'),
                                                onAction: this.togglePrintReceiptModal
                                            }, {
                                                label: i18next.t('page.order.list.actions.shippingLabel'),
                                                onAction: this.onShippingLabelValidSubmit
                                            }, {
                                                label: i18next.t('page.order.list.actions.confirmDelivered'),
                                                onAction: this.toggleConfirmDeliveredModal
                                            }, {
                                                label: i18next.t('page.order.list.actions.confirmShopee'),
                                                onAction: this.toggleConfirmShopee
                                            }]}
                                        />
                                    </div>
                                }

                                {this.state.isFetching &&
                                <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                                }

                                {!this.state.isFetching &&
                                <>
                                    {this.state.view === this.const.VIEW_COMPACT &&
                                    <>
                                        {/* DESKTOP */}
                                        <div className='table-responsive gs-atm__scrollbar-1'>
                                            <GSTable className='table mt-2 order-list-table-custom'>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <UikCheckbox
                                                                className="d-mobile-none d-desktop-block mb-0 h-100"
                                                                onChange={this.handleSelectAllProduct}
                                                            /> 
                                                        </th>
                                                        {this.state.headerConfig.map((name, index) => {
                                                            return (
                                                                <th className='order-header-title' key={index}>{name}</th>
                                                            )
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.orderList.map((dataRow, index) => {
                                                        return (
                                                            <tr key={index + "_" + dataRow.id}
                                                                    className="cursor--pointer gsa-hover--gray"
                                                                    onClick={(e) => this.moveToDetail(dataRow, e)}>
                                                                <td className="id">
                                                                    <UikCheckbox
                                                                        className="mb-0 d-mobile-none d-desktop-block"
                                                                        //disabled={this.filterPrintList.indexOf(String(dataRow.channel || "GOSELL").toUpperCase()) > -1}
                                                                        checked={this.isSelectedOrder(dataRow.id)}
                                                                        onChange={e => this.handleSelectOrder(e, dataRow.id, dataRow)}
                                                                    />
                                                                </td>
                                                                {this.handleRenderByKeyData(dataRow)}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </GSTable>
                                        </div>
                                        <GSPagination
                                            totalItem={this.state.totalItem}
                                            currentPage={this.state.currentPage}
                                            pageSize={100}
                                            onChangePage={this.onChangeListPage}
                                        >
                                        </GSPagination>
                                    </>}

                                    {this.state.view === this.const.VIEW_DETAIL &&
                                    <div className={'view-detail-container'}>
                                        {this.state.orderList.map((dataRow, i) => {
                                            return (
                                                <div className={'group-order'} key={i + "_" + dataRow.id}>
                                                    <div className={'group-order__header'}>
                                                        <div className={'group-order__header__order'}>
                                                            <GSSaleChannelIcon channel={dataRow.channel || "GOSELL"}
                                                                               width="30"/>
                                                            <span className={'order-id'}><Trans
                                                                i18nKey="page.order.list.group.orderId"/>: #{dataRow.id}</span>
                                                        </div>
                                                        <div
                                                            className={'group-order__header__status ' + dataRow.status}>
                                                            <span>{i18next.t('page.order.detail.information.orderStatus.' + dataRow.status)}</span>
                                                        </div>
                                                    </div>
                                                    <div className={'group-order__body'}>
                                                        {dataRow.items && dataRow.items.map((item, j) => {
                                                            return (
                                                                <div className={'order-item'} key={j + "_" + item.id}>
                                                                    <div className={'order-item__img'}>
                                                                        <img className={'order-item__image-url'}
                                                                             src={item.imageUrl != null ? item.imageUrl : "/assets/images/default_image2.png"}
                                                                             alt={'item image'}/>
                                                                    </div>
                                                                    <div className={'order-item__info'}>
                                                                        <div className={'order-item__info-name'}>
                                                                            {item.name}
                                                                        </div>
                                                                        <div className={'order-item__info-quantity'}>
                                                                            <Trans
                                                                                i18nKey="page.order.list.group.quantity"/>: {item.quantity}
                                                                        </div>
                                                                        <div className={'order-item__info-price'}>
                                                                            <Trans
                                                                                i18nKey="page.order.list.group.price"/>: <span
                                                                            className={'bold'}>{CurrencyUtils.formatMoneyByCurrency(item.price * item.quantity, dataRow.currency)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>)
                                                        })}
                                                    </div>
                                                    <div className={'group-order__footer'}>
                                                        <div className={'group-order__footer__info'}>
                                                            <div>
                                                                <Trans i18nKey="page.order.list.table.th.total"/>: <span
                                                                className={'bold'}>{CurrencyUtils.formatMoneyByCurrency(dataRow.total, dataRow.currency)}</span>
                                                            </div>
                                                            <div>
                                                                <Trans
                                                                    i18nKey="page.order.list.table.th.pMethod"/>: {dataRow.paymentMethod != null ? i18next.t('page.order.detail.information.paymentMethod.' + dataRow.paymentMethod) : ""}
                                                            </div>
                                                        </div>
                                                        <div className={'group-order__footer__btn'}>
                                                            <GSButton success outline className="btn-print" marginLeft
                                                                      onClick={(e) =>
                                                                          this.moveToDetail(dataRow, e)
                                                                      }>
                                                                <span><Trans i18nKey="common.btn.view.details"/></span>
                                                            </GSButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                        }

                                        <PagingTable
                                            totalPage={this.state.totalPage}
                                            maxShowedPage={1}
                                            currentPage={this.state.currentPage}
                                            onChangePage={this.onChangeListPage}
                                            totalItems={this.state.orderList.length}
                                            className="m-paging"
                                        />
                                    </div>
                                    }

                                    {this.state.orderList.length === 0 &&
                                    <div
                                        className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                        <div>
                                            <img src="/assets/images/icon-Empty.svg" alt=''/>
                                            {' '}
                                            <span>
                                        <Trans i18nKey="page.order.list.table.empty.text"/>
                                    </span>
                                        </div>
                                    </div>}
                                </>
                                }
                            </GSWidgetContent>
                        </GSWidget>
                    </GSContentBody>
                </GSContentContainer>
                {
                    this.state.showProductModal && <ProductModal
                        texts={{
                            title: "page.order.modal.product.title",
                            okButton: "page.order.modal.product.button.ok"
                        }}
                        showSearchOption={false}
                        productSelectedList={this.state.selectedProductModal}
                        onClose={this.closeProductModal}
                        type={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                    />
                }

                <OrderSettingColumnModal modalHandle={ this.closeSettingColumnOrder }
                                        isOpen={ this.state.isOpenOrderColumnSetting }
                                        defaultSetting={this.state.defaultColumnSetting}
                                        />
            </>
        )
    }
}

export default connect()(OrderList);
