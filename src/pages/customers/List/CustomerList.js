/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import './CustomerList.sass';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader';
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';
import i18next from 'i18next';
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget';
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent';
import {UikCheckbox, UikFormInputGroup, UikInput, UikRadio, UikSelect, UikWidgetTable} from '../../../@uik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Constants from '../../../config/Constant';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import PagingTable from '../../../components/shared/table/PagingTable/PagingTable';
import Loading, {LoadingStyle} from '../../../components/shared/Loading/Loading';
import GSWidgetEmptyContent from '../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent';
import GSModalFullBodyMobile from '../../../components/shared/GSModalFullBodyMobile/GSModalFullBodyMobile';
import GSLearnMoreFooter from '../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter';
import GSButton from '../../../components/shared/GSButton/GSButton';
import beehiveService from '../../../services/BeehiveService';
import accountService from '../../../services/AccountService';
import {cancelablePromise} from '../../../utils/promise';
import {DateTimeUtils} from '../../../utils/date-time';
import {CurrencyUtils, NumberUtils} from '../../../utils/number-format';
import GSSaleChannelIcon, {GSSaleChannelIconSize} from '../../../components/shared/GSSaleChannelIcon/GSSaleChannelIcon';
import {RouteUtils} from '../../../utils/route';
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import GSContentHeaderTitleWithExtraTag
    from '../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag';
import GSContentHeaderRightEl
    from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl';
import ConfirmModal from '../../../components/shared/ConfirmModal/ConfirmModal';
import LoadingScreen from '../../../components/shared/LoadingScreen/LoadingScreen';
import CustomerListImportModal from './ImportModal/CustomerListImportModal';
import GSComponentTooltip from '../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from '../../../components/shared/GSTooltip/GSTooltip';
import {useSelector} from 'react-redux';
import PrivateComponent from '../../../components/shared/PrivateComponent/PrivateComponent';
import {PACKAGE_FEATURE_CODES} from '../../../config/package-features';
import CallButton from '../../../components/shared/CallCenterModal/CallButton/CallButton';
import CustomerListBarcodePrinter from './BarcodePrinter/CustomerListBarcodePrinter';
import {AgencyService} from '../../../services/AgencyService';
import GSAlertModal, {GSAlertModalType} from '../../../components/shared/GSAlertModal/GSAlertModal';
import {GSToast} from '../../../utils/gs-toast';
import storeService from '../../../services/StoreService';
import {OrderService} from '../../../services/OrderService';
import {TokenUtils} from '../../../utils/token';
import HintPopupVideo from '../../../components/shared/HintPopupVideo/HintPopupVideo';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import storage from '../../../services/storage';
import {useRecoilValue} from 'recoil';
import {OrderInStorePurchaseRecoil} from '../../order/instorePurchase/recoil/OrderInStorePurchaseRecoil';
import PropTypes from 'prop-types';
import PartnerModal from './PartnerModal/PartnerModal';
import GSMegaFilterRowTag from '../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowTag';
import GSMegaFilterRowSelect from '../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelect';
import GSMegaFilter from '../../../components/shared/GSMegaFilter/GSMegaFilter';
import FilterRowSelectSegment
    from '../../../components/shared/GSMegaFilter/FilterRow/FilterRowSelectSegment/FilterRowSelectSegment';
import GSMegaFilterRowSelectScroll from '../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelectScroll';
import affiliateService from '../../../services/AffiliateService';
import {AddressUtils} from '../../../utils/address-utils';
import $ from 'jquery';
import _, { truncate } from 'lodash';
import GSDropdownAction from '../../../components/shared/GSDropdownAction/GSDropdownAction';
import AssignStaffModal from './AsignStaffModal/AsignStaffModal'
import {CredentialUtils} from '../../../utils/credential'
import useDebounceEffect from '../../../utils/hooks/useDebounceEffect'
import {icoSetting} from '../../../components/shared/gsIconsPack/gssvgico';
import CreateCustomerModal from './CreateCustomerModal/CreateCustomerModal'
import SelectSettingColumn from './SelectSettingColumn/SelectSettingColumn'
import SearchByShippingAddress from '../../../components/shared/searchByShippingAddress/SearchByShippingAddress'
import Constant from '../../../config/Constant'

const SEGMENTS_FILTER_OPTIONS = [
    {
        value: "ALL",
        label: i18next.t("page.customers.allSegments"),
    },
];

const CHANNEL_FILTER_OPTIONS = [
    {
        value: 'ALL',
        label: i18next.t('page.customers.allChannels')
    },
    {
        value: Constants.SaleChannels.GOSELL,
        label: 'GoSell'
    },
    {
        value: Constants.SaleChannels.BEECOW,
        label: 'GoMua'
    },
    {
        value: Constants.SaleChannels.SHOPEE,
        label: 'Shopee',
    },
    {
        value: Constants.SaleChannels.LAZADA,
        label: 'Lazada'
    },
    {
        value: Constants.SaleChannels.LANDING_PAGE,
        label:'Landing page'
    },
    {
        value: Constants.SaleChannels.CONTACT_FORM,
        label: i18next.t('page.customers.list.contactForm')
    },
    {
        value: Constants.SaleChannels.IMPORTED,
        label: i18next.t('page.customers.list.imported')
    }
]

const SEARCH_TYPE_LIST = [
    {
        value: "NAME",
        label: i18next.t("page.order.list.filter.searchType.CUSTOMER_NAME"),
    },
    {
        value: "PHONE",
        label: i18next.t("page.customer.list.customerPhone"),
    },
    {
        value: "EMAIL",
        label: i18next.t("page.customer.list.customerEmail"),
    },
    {
        value: "BARCODE",
        label: i18next.t("page.order.list.filter.searchType.CUSTOMER_BARCODE"),
    },
    {
        value: "ADDRESS",
        label: i18next.t("page.customer.list.customerAddress"),
    },
    {
        value: "COMPANY",
        label: i18next.t("page.customers.edit.CompanyName"),
    },
    {
        value: "TAX_CODE",
        label: i18next.t("page.customers.edit.taxCode"),
    }
];

const SEARCH_TYPE = {
    NAME: 'NAME',
    ADDRESS: 'ADDRESS'
}

const COLUMN_LIST_DEFAUL = [
    {name : 'id', show : false, colSize : 1},
    {name : 'full_name', show : true, colSize : 1},
    {name : 'phone', show : true, colSize : 1},
    {name : 'last_order', show : true, colSize : 1},
    {name : 'total_order', show : true, colSize : 1},
    {name : 'total_purchase', show : true, colSize : 1},
    {name : 'debt', show : true, colSize : 1},
    {name : 'sale_channel', show : true, colSize : 1},
    {name : 'created_by', show : true, colSize : 1},
    {name : 'address', show : false, colSize : 1},
    {name : 'gender', show : false, colSize : 1},
    {name : 'birthday', show : false, colSize : 1},
    {name : 'member_point', show : false, colSize : 1},
    {name : 'membership_tier', show : false, colSize : 1},
    {name : 'email', show : false, colSize : 1},
    {name : 'assigned_staff', show : false, colSize : 1},
    {name : 'assigned_partner', show : false, colSize : 1},
    {name : 'company_name', show : false, colSize : 1},
    {name : 'tax_code', show : false, colSize : 1}
]

const SIZE_PER_PAGE = 100
const SEGMENT_SIZE_PER_PAGE = 20

const COUNTRY_CODE_DEFAULT = CurrencyUtils.getLocalStorageCountry()

const CustomerList = props => {
    const {currency, ...others} = props
    const CUSTOMER_BRANCH_LIST = (() => {
        if(TokenUtils.isStaff()) {
            return [{
                value: 'ALL',
                label: i18next.t('page.customers.filter.branch.all')
            }];
        }
        return [{
            value: 'ALL',
            label: i18next.t('page.customers.filter.branch.all')
        },
        {
            value: -1,
            label: i18next.t('page.customers.filter.branch.none')
        }];
    })();
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stItemList, setStItemList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [stSegmentList, setStSegmentList] = useState([]);
    const [stCurrentSegment, setStCurrentSegment] = useState(null);
    const [stIsShowSegmentModal, setStIsShowSegmentModal] = useState(false);
    const [stFilterConfig, setStFilterConfig] = useState({
        segmentId: 'ALL',
        saleChannel: 'ALL',
        keyword: '',
        branchIds: 'ALL',
        partnerIds:'ALL', 
        responsibleStaffUserIds:'ALL',
        searchField :SEARCH_TYPE.NAME
    });
    const [stSegmentFilter, setStSegmentFilter] = useState({
        keyword: ''
    });
    const [stSegmentMobileTemp, setStSegmentMobileTemp] = useState(null);
    const [stSegmentPaging, setStSegmentPaging] = useState({
        currentPage: 0,
        totalPage: 0,
        isLoading: false
    });
    const refExportConfirmModal = useRef(null);
    const [stIsReporting, setStIsReporting] = useState(false);
    const [stIsImportModalOpen, setStIsImportModalOpen] = useState(false);
    const [stToggleAddCustomerModal, setStToggleAddCustomerModal] = useState(false);

    const [isShowPrintModal, setIsShowPrintModal] = useState(false);

    const [getCheckAllValue, setCheckAllValue] = useState(false);
    const [getSelectedCustomer, setSelectedCustomer] = useState([]);
    const [getHasSelected, setHasSelected] = useState(0);
    const [stBranchList, setStBranchList] = useState(CUSTOMER_BRANCH_LIST);
    const [stShowPartnerModal, setStShowPartnerModal] = useState(false)
    const [stWaitingCustomerToPartner, setStWaitingCustomerToPartner] = useState(false)
    const [stCountFilter, setStCountFilter] = useState(0)
    const [stAllBranch, setStAllBranch] = useState('')
    const [stPartnerPaging, setStPartnerPaging] = useState({
        page: 0,
        total: 0,
        isScroll: false,
        size:50,
        default: true
    });
    const [stPartnerList,setStPartnerList] = useState(  [
        {
            id: 'ALL',
            name: i18next.t("page.customers.allCustomer.partner.all")
        },
        {
            id: '-1',
            name: i18next.t("page.customers.allCustomer.partner.unassigned")
        }
    ])

    const [stStaffList, setStStaffList] = useState(  [
        {
            userId: 'ALL',
            name: i18next.t("page.customers.allCustomer.partner.all")
        },
        {
            userId: '-1',
            name: i18next.t("page.customers.allCustomer.partner.unassigned")
        }
    ])
    const [stListDataStaff, setStListDataStaff] = useState([])
    const [stActionToggle, setStActionToggle] = useState(false)
    const [stToggleModalStaff, setStToggleModalStaff] = useState(false)
    const [isProgressAssign, setIsProgressAssign] = useState(false)

    let selectedBefore = JSON.parse(localStorage.getItem(Constant.STORAGE_KEY_CUSTOMER_COLUMN_SETTING)) || COLUMN_LIST_DEFAUL;
    // if(!selectedBefore){
    //     selectedBefore = COLUMN_LIST_DEFAUL;
    // }

    const [getLstColumn, setLstColumn] = useState([]);
    const [getIsOpenSelectColumnModal, setIsOpenSelectColumnModal] = useState(false);

    const onSearch = useRef(false);
    const refDeleteModal = useRef(null);

    const stAgencyName = useSelector(state => state.agencyName);
    const history = useHistory();
    const storeBranch = useRecoilValue(OrderInStorePurchaseRecoil.storeBranchState)

    // const queryParams = queryString.parse(props.location.search);
    // const branchIds = queryParams['branchIds'];
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setStFilterConfig(state =>({
            ...state,
            saleChannel: queryParams.get('saleChannel') ? queryParams.get('saleChannel') : CHANNEL_FILTER_OPTIONS[0].value.toUpperCase(),
            keyword: queryParams.get('keyword') ? queryParams.get('keyword') : '',
            branchIds: _.isEmpty(queryParams.get('branchIds')) || queryParams.get('branchIds') === 'ALL' ? 'ALL' : parseInt(queryParams.get('branchIds')),
            partnerIds: queryParams.get('partnerIds') ? queryParams.get('partnerIds') : 'ALL',
            responsibleStaffUserIds: queryParams.get('responsibleStaffUserIds') ? queryParams.get('responsibleStaffUserIds') : 'ALL',
            searchField: queryParams.get('searchField') ? queryParams.get('searchField') : SEARCH_TYPE.NAME,
        }))
        if(queryParams.get('page')){
            setStPaging(state=>({
                ...state,
                currentPage: +(queryParams.get('page'))
            }))
        }

        let countFilter = 0

        if(queryParams.get('branchIds')){
            if(queryParams.get('branchIds') !== 'ALL'){
                countFilter = countFilter + 1
            }
        }
        if(queryParams.get('segmentId')){
            if(queryParams.get('segmentId') !== 'ALL'){
                countFilter = countFilter + 1
            }
        }
        if(queryParams.get('partnerIds')){
            if(queryParams.get('partnerIds') !== 'ALL'){
                countFilter = countFilter + 1
            }
        }
        if(queryParams.get('responsibleStaffUserIds')){
            if(queryParams.get('responsibleStaffUserIds') !== 'ALL'){
                countFilter = countFilter + 1
            }
        }
        if(queryParams.get('saleChannel')){
            if(queryParams.get('saleChannel') !== 'ALL'){
                countFilter = countFilter + 1
            }
        }
        setStCountFilter(countFilter)
        setLstColumn(selectedBefore)

        // set again to local

        localStorage.setItem(Constant.STORAGE_KEY_CUSTOMER_COLUMN_SETTING, JSON.stringify(selectedBefore));
    },[])

    useEffect(() => {
        CHANNEL_FILTER_OPTIONS[1] = {
            value: Constants.SaleChannels.GOSELL,
            label: AgencyService.getDashboardName(i18next.t("component.button.selector.saleChannel.gosell"))
        }
    }, [stAgencyName]);

    useEffect(  () => {
        const queryParams = new URLSearchParams(window.location.search);
        const segmentId = queryParams.get('segmentId')
        if (segmentId) {
            beehiveService.getSegment(segmentId)
                .then( segmentDetail => {
                    setStFilterConfig(state =>({
                        ...state,
                        segmentId: segmentId?{value:segmentId,label:segmentDetail.name}:SEGMENTS_FILTER_OPTIONS[0].value.toUpperCase(),
                    }))
                    onSelectSegment({
                        ...segmentDetail,
                        id: parseInt(segmentId)
                    })
                })
        } else {
        }

        fetchDataPartner(0)
        fetchStaffList()
        fetchBranch()
    }, [])

    useEffect( () => {
        const params = {
            page: stSegmentPaging.currentPage,
            size: SEGMENT_SIZE_PER_PAGE,
            ['name.contains']: stSegmentFilter.keyword,
        }
        beehiveService.getListSegmentWithKeyword(params)
            .then(result => {
                if (onSearch.current) {
                    if (stSegmentFilter.keyword  === '') {
                        onSearch.current = false
                    }
                    if (stSegmentPaging.currentPage === 0) { // => if this is first page -> clear all previous list
                        setStSegmentList(result.data)
                    } else { // => if this is not first page -> append to previous list
                        setStSegmentList([...stSegmentList, ...result.data])
                    }
                } else {
                    setStSegmentList([...stSegmentList, ...result.data])
                }

                setStSegmentPaging({
                    ...stSegmentPaging,
                    isLoading: false,
                    totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SEGMENT_SIZE_PER_PAGE)
                })
            })
    }, [stSegmentPaging.currentPage, stSegmentFilter])

    useDebounceEffect(() => {
        if (stPaging.currentPage > 0) {
            fetchData(undefined)
        } else {
            fetchData()
        }
    }, 200, [stPaging.currentPage, stFilterConfig, stCurrentSegment])

    // Show tooltip when full address text overflowed
    useDebounceEffect(() => {
        let fullAddresses = $('.customer-list .address');
        if (fullAddresses.length) {
            let itemList = [...stItemList];
            fullAddresses.each(function(index, element) {
                if (element.offsetHeight < element.scrollHeight)
                    itemList[index] = {...itemList[index], isFullAddressOverflowed: true}
            })
            if (!_.isEqual(itemList, stItemList))
                setStItemList(itemList);
        }
    }, 200, [stItemList]);

    const fetchData = (page) => {
        setStIsFetching(true)
        const pmGetCustomerList = cancelablePromise(
            beehiveService.getCustomerList(page !== undefined? page : stPaging.currentPage-1,
                SIZE_PER_PAGE,
                stFilterConfig.keyword,
                stFilterConfig.saleChannel === 'ALL'? undefined:stFilterConfig.saleChannel,
                '',
                {
                    segmentId: stCurrentSegment? stCurrentSegment.id:undefined,
                },
                _.isNil(stFilterConfig.branchIds) || stFilterConfig.branchIds === 'ALL' ? stAllBranch : stFilterConfig.branchIds,
                !!stBranchList.length && stFilterConfig.branchIds === stBranchList[0].value,
                stFilterConfig.partnerIds === 'ALL'? undefined:stFilterConfig.partnerIds,
                  stFilterConfig.responsibleStaffUserIds === 'ALL'? undefined:stFilterConfig.responsibleStaffUserIds,
                stFilterConfig.searchField
            )
        )
        pmGetCustomerList.promise
            .then(itemList => {
                setStItemList(itemList.data)
                setStPaging({
                    ...stPaging,
                    currentPage: page !== undefined? page + 1 : stPaging.currentPage,
                    totalPage: Math.ceil(itemList.total / SIZE_PER_PAGE),
                    totalItem: itemList.total
                })
                setStIsFetching(false)

                fetchRelationBySelectedColumn(itemList.data)
            })
            .catch(e => [
                setStIsFetching(false)
            ])

    }

    const fetchBranch = () => {
        storeService.getFullStoreBranches()
            .then(resp => {
                const result = resp.data || [];
                let allBranchValue = [];
                let branches = result.map(b => {
                    allBranchValue.push(b.id);
                    return { value: b.id, label: b.name };
                });
                branches = CUSTOMER_BRANCH_LIST.concat(branches);
                setStAllBranch(allBranchValue.join(","))
                setStBranchList(branches);
                let getBranchFilter = branches.find(r => r.value == stFilterConfig.branchIds)
                if (getBranchFilter) {
                    stFilterConfig.branchIds = getBranchFilter.value
                } else {
                    // stFilterConfig.branchIds = allBranch.value
                }
            })
    }

    const fetchDataPartner = (page) => {
        affiliateService.getListPartnerByStore({partnerType:'DROP_SHIP'}, page, stPartnerPaging.size)
            .then(res => {
                setStPartnerList(state=> ([...state,...res.data]))
                setStPartnerPaging( state =>({
                    ...state,
                    page: page === undefined ? state.currentPage : page,
                    total: res.totalCount,
                }))
        })
    }

    const fetchStaffList = () => {
        storeService.getStaffs(false, 0, 99999999)
            .then(res => {
                const data = res.data.sort((a, b) => a.name.toLocaleUpperCase() < b.name.toLocaleUpperCase() ? -1 : 1) || [];
                setStListDataStaff(data)
                setStStaffList(state=>{
                    const staffList = [...state,...data]
                    return staffList.map(s => ({value:String(s.userId), label:s.name}))
                })
            })
    }

    const onSearchChange = (e) => {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            renderByFilter('keyword', value)
            renderByFilter('page',1)
            e.preventDefault();
        }, 500)
    }

    const onInputSearch = (e) => {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            renderByFilter('keyword', value)
            renderByFilter('page',1)
            e.preventDefault();
        }, 500)
    }
    
    const renderByFilter = (key, value) => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set(key, value);

        history.push(NAV_PATH.customers.CUSTOMERS_LIST + '?' + queryParams.toString())
    }

    const onChangePage = (pageNumber) => {
        if(pageNumber > 0) {
            renderByFilter('page', pageNumber)
        }
    }

    const onClickCustomerRow = (id, userId, saleChannel) => {
        if (saleChannel.toLowerCase() === 'beecow') {
            saleChannel = 'GOMUA'
        }
        RouteUtils.linkTo(props, NAV_PATH.customers.CUSTOMERS_EDIT + `/${id}/${userId}/${saleChannel}`)
    }

    const onSelectSegment = (segment) => {

        setStCurrentSegment(segment)
        setStIsShowSegmentModal(false)
        onSearch.current = true
        setStSegmentPaging({
            ...stSegmentPaging,
            currentPage: 0
        })
        setStSegmentFilter({
            keyword: ''
        })
        // renderByFilter('segmentId', segment.id)

    }

    const onSelectSegmentMobile = (segment) => {
        setStSegmentMobileTemp(segment)
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const onScrollSegmentList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stSegmentPaging.currentPage < stSegmentPaging.totalPage) {
                setStSegmentPaging({
                    ...stSegmentPaging,
                    isLoading: true,
                    currentPage: stSegmentPaging.currentPage + 1
                })
        }
    }

    const onClickExport = (e) => {
        refExportConfirmModal.current.openModal({
            messages: i18next.t('page.customers.list.exportConfirm'),
            okCallback: () => {
                setStIsReporting(true)
                beehiveService.exportCustomerList(stFilterConfig.keyword,
                    stFilterConfig.saleChannel === 'ALL'? undefined:stFilterConfig.saleChannel,
                    '',
                    {
                        segmentId: stCurrentSegment? stCurrentSegment.id:undefined,
                        branchIds: (!!stBranchList.length && stFilterConfig.branchIds === stBranchList[0].value) ? null : stFilterConfig.branchIds
                    })
                    .then( result => {
                        GSToast.success(i18next.t('productList.export.data.success'))
                        setStIsReporting(false);
                    })
                    .catch( e => {
                        GSToast.commonError()
                        setStIsReporting(false)
                    })
            }
        })
    }

    const onClickImport = () => {
        setStIsImportModalOpen(true)
    }

    const onImportCallback = (isSuccess) => {
        if (isSuccess) {
            //always reload data after import success
            fetchData();
        }
    }

    const togglePrintModal = () => {
        setIsShowPrintModal((modal) => !modal);
    }

    const selectAllCustomer = (e) =>{
        let checked = e.target.checked;
        let selectedCustomer = getSelectedCustomer;

        if(checked){
            // in case checked
            stItemList.forEach(item =>{
                // add all product to list
                if(selectedCustomer.filter( item2 => item.id === item2.id).length === 0 ){
                    selectedCustomer.push({id : item.id});
                }
            })

        }else{
            // in case unchecked
            stItemList.forEach(item =>{
                // remove all product of this page from selected list
                selectedCustomer = selectedCustomer.filter( item2 => item.id !== item2.id);
            })
        }

        // set state
        setCheckAllValue(checked);
        setSelectedCustomer(selectedCustomer);
        setHasSelected(selectedCustomer.length);
    }

    const selectACustomer = (customer, e) =>{
        let checked = e.target.checked;
        let selectedCustomer = getSelectedCustomer;

        if(checked){
            // in case checked

            // only push if not exist
            if(selectedCustomer.filter(p => p.id === customer.id).length === 0){
                selectedCustomer.push({id : customer.id});
            }
        }else{
            // in case unchecked
            // uncheck => remove from list
            selectedCustomer = selectedCustomer.filter(p => p.id !== customer.id);
        }
        setSelectedCustomer(selectedCustomer);
        setHasSelected(selectedCustomer.length);
    }

    const toggleActionDropdown = (toggle) => {
        setStActionToggle(toggle)
    }
    
    const toggleAssignPartner = () => {
        setStShowPartnerModal(true)
    }

    const toggleDeleteCustomer = () => {
        // delete customer
        if(getSelectedCustomer.length <= 0){
            return;
        }

        // show popup delete
        refDeleteModal.current.openModal({
            messages: i18next.t('page.customers.action.modal.delete.message', {x: getSelectedCustomer.length}),
            modalTitle: i18next.t('page.customers.action.modal.delete.confirm'),
            modalAcceptBtn: i18next.t('common.btn.delete'),
            modalCloseBtn: i18next.t('common.btn.cancel'),
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            acceptCallback: () => {
                //setStIsFetching(true);
                const ids = getSelectedCustomer.map(selected => selected.id).join(',');
                // call api to delete
                beehiveService.deleteCustomerProfileList(ids).then(res =>{
                    GSToast.commonDelete();

                    // remove all selected customer
                    setSelectedCustomer([]);
                    setHasSelected(0);

                    // move to the first page
                    fetchData();
                    //setStIsFetching(false);


                }).catch(error => {
                    //setStIsFetching(false);
                    GSToast.commonError();
                });
            },
            closeCallback: () => {}
        })
    }

    const handleCreateCustomer = (data) => {
        const requestBody = {
            ...data,
            storeName: storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
            langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
            branchId: storeBranch.value,
        };

        beehiveService.createUserPOSProfile(requestBody)
            .then(result => {
                toggleModalCustomer()
                fetchData()
                GSToast.success("page.livechat.customer.details.add.success.msg", true);
            })
            .catch(e => {
                if (e.response && e.response.data) {
                    if (e.response.status === 403) {
                        GSToast.error("page.livechat.customer.details.not.permission.msg", true);
                    } else if (e.response.data.errorKey === 'customer.exist') {
                        GSToast.error("page.livechat.customer.details.add.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.phone.exist') {
                        GSToast.error("page.livechat.customer.details.add.phone.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.email.exist') {
                        GSToast.error("page.livechat.customer.details.add.email.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.userid.exist') {
                        GSToast.error("page.livechat.customer.details.add.user.exist.msg", true);
                    } else if (e.response.data.errorKey === 'Phonenumber.exist') {
                        GSToast.error("common.validation.check.phone", true);
                    } else {
                        GSToast.commonError();
                    }
                } else {
                    GSToast.commonError();
                }
            })
    };

    const toggleModalCustomer = (e) => {
        if (e) e.stopPropagation()
        setStToggleAddCustomerModal(toggle => !toggle)
    };

    const toggleModalSelectColumn = (event) => {
        setIsOpenSelectColumnModal(!getIsOpenSelectColumnModal)
    };

    const onMegaFilterChange = (values) =>{
        renderByFilter('branchIds',values.branchIds)
        if(values.segmentId?.value){
            renderByFilter('segmentId',values.segmentId.value)
        }else {
            renderByFilter('segmentId','')
        }
        renderByFilter('saleChannel',values.saleChannel)
        renderByFilter('page',1)
        renderByFilter('partnerIds',values.partnerIds === 'ALL' ? '' : values.partnerIds)
        renderByFilter('responsibleStaffUserIds',values.responsibleStaffUserIds === 'ALL' ? '' : values.responsibleStaffUserIds)
        setStFilterConfig({
            ...stFilterConfig,
            ...values
        })
    }

    const handleSearch = paging => {
        fetchDataPartner(paging.page)
    }

    const handlePartnerModalClose = (type, partner) => {
        const data = {
            customerIds: getSelectedCustomer.map(c => c.id).join(),
            partnerId: partner[0]?.id
        }
        if (type && partner[0]?.id){
            setStWaitingCustomerToPartner(true)
            beehiveService.assignCustomerToPartner(data)
                .then(()=>{
                    GSToast.success()

                    let selectedCustomer = getSelectedCustomer;
                    // in case unchecked
                    stItemList.forEach(item =>{
                        // remove all product of this page from selected list
                        selectedCustomer = selectedCustomer.filter( item2 => item.id !== item2.id);
                    })
                    setSelectedCustomer(selectedCustomer);
                    setHasSelected(selectedCustomer.length);
                })
                .catch(()=>{
                    GSToast.error(i18next.t("common.api.failed"));
                })
                .finally(()=>{
                    setCheckAllValue(false);
                    setStWaitingCustomerToPartner(false)
                })
        }
        setStShowPartnerModal(false)
    }

    const handleAssignStaff = (userId) => {
        toggleAssignStaff()
        setIsProgressAssign(true)
        const request = {
            userId: userId,
            storeId: CredentialUtils.getStoreId(),
            customerIds: getSelectedCustomer.map(c => c.id)
        }

        if (userId) {
            beehiveService.assignCustomerToStaff(request)
                .then(data => {
                    setSelectedCustomer([])
                    setHasSelected(0)
                    setIsProgressAssign(false)
                    setCheckAllValue(false);
                })
                .catch(e => {
                    GSToast.error()
                    setIsProgressAssign(false)
                })
        }

    }

    const toggleAssignStaff = () => {
        setStToggleModalStaff(!stToggleModalStaff)
    }

    const onFinishSelectColumn = (action, columnSelected) => {
        setIsOpenSelectColumnModal(false);

        if(action === 'SELECTED'){
            setLstColumn(columnSelected);
            localStorage.setItem(Constant.STORAGE_KEY_CUSTOMER_COLUMN_SETTING, JSON.stringify(columnSelected));
            fetchRelationBySelectedColumn();
        }else {
            setLstColumn(JSON.parse(localStorage.getItem(Constant.STORAGE_KEY_CUSTOMER_COLUMN_SETTING)) || COLUMN_LIST_DEFAUL)
        }
    }

    const filterBySearchType = (searchType) => {
        renderByFilter('searchField', searchType)
        renderByFilter('keyword', '')
        renderByFilter('page',1)
    }

    const handleSearchByAddressCallBack = (value) => {
        renderByFilter('keyword', value)
        renderByFilter('page',1)
    }

    const findEnableColumn = (colName) => {
        return getLstColumn.findIndex(col => col.name === colName && col.show === true) > -1;
    }

    const fetchRelationBySelectedColumn = (lstCustomerInit) => {

        // filter columns that enable
        let selectedColumns = [];

        // list customer
        let lstCustomer = lstCustomerInit ? lstCustomerInit : [...stItemList];
        let lstCustomerNew = [];

        // request data
        const userIds = lstCustomer.filter(data => data.saleChannel === 'GOSELL' && data.userId).map(data => data.userId);
        const partnerIds = lstCustomer.filter(data => data.saleChannel === 'GOSELL' && data.partnerId).map(data => data.partnerId);
        const responsibilityStaffUserIds = lstCustomer.filter(data => data.saleChannel === 'GOSELL' && data.responsibleStaffUserId).map(data => data.responsibleStaffUserId);
        const createdStaffUserIds = lstCustomer.filter(data => data.saleChannel === 'GOSELL' && data.createdStaffUserId).map(data => data.createdStaffUserId);
        const customerIds = lstCustomer.map(data => data.id);

        // all promise
        let promiseArr = []

        if(findEnableColumn('membership_tier') && customerIds.length > 0){
            // membership name
            selectedColumns.push('membership_tier');
            promiseArr.push(beehiveService.getMembershipNameByCustomerids(JSON.stringify(customerIds)));
        }

        if(findEnableColumn('assigned_partner') && partnerIds.length > 0){
            // partner
            selectedColumns.push('assigned_partner');
            promiseArr.push(affiliateService.getPartnerNameByListId(JSON.stringify(partnerIds)));
        }

        if(findEnableColumn('member_point') && userIds.length > 0){
            // point
            selectedColumns.push('member_point');
            promiseArr.push(OrderService.getPointByUserList(JSON.stringify(userIds)));
        }

        if(findEnableColumn('assigned_staff') && responsibilityStaffUserIds.length > 0){
            // staff user name
            selectedColumns.push('assigned_staff');
            promiseArr.push(accountService.getUserNameByIds(JSON.stringify(responsibilityStaffUserIds)))
        }

        if(findEnableColumn('created_by') && createdStaffUserIds.length > 0){
            // created staff user name
            selectedColumns.push('created_by');
            promiseArr.push(accountService.getUserNameByIds(JSON.stringify(createdStaffUserIds)))
        }
        
        if(promiseArr.length == 0){
            return;
        }

        Promise.all(promiseArr).then(res => {

            const membershipNamePos = selectedColumns.findIndex(data => data === 'membership_tier');
            const partnerNamePos = selectedColumns.findIndex(data => data === 'assigned_partner');
            const memberpointPos = selectedColumns.findIndex(data => data === 'member_point');
            const responsibilityStaffNamPos = selectedColumns.findIndex(data => data === 'assigned_staff');
            const createdStaffNamPos = selectedColumns.findIndex(data => data === 'created_by');


            const membershipNameRes = membershipNamePos > -1 ?  res[membershipNamePos] : [];
            const partnerNameRes = partnerNamePos > -1 ? res[partnerNamePos] : [];
            const memberpointRes = memberpointPos > -1 ? res[memberpointPos] : [];
            const responsibilityStaffNameRes = responsibilityStaffNamPos > -1 ? res[responsibilityStaffNamPos] : [];
            const createdStaffNameRes = createdStaffNamPos > -1 ? res[createdStaffNamPos] : [];

            const storeOwnerId = CredentialUtils.getStoreOwnerId();

            lstCustomer.forEach(customer => {
                // check if have from database

                const memberPoint = memberpointRes.filter(database => database.userId == customer.userId);
                const membership = membershipNameRes.filter(database => database.customerId === customer.id);
                const partner = partnerNameRes.filter(database => database.partnerId === customer.partnerId);
                const responsibilityStaffName = responsibilityStaffNameRes.filter(database => database.partnerId === customer.responsibleStaffUserId);
                const createdStaffName = createdStaffNameRes.filter(database => database.partnerId === customer.createdStaffUserId);

                let newCustomer = {...customer};
                        
                if(memberPoint && memberPoint.length > 0){
                    newCustomer.memberPoint = memberPoint[0].point;
                }

                if(membership && membership.length > 0){
                    newCustomer.membershipName = membership[0].membershipName;
                }

                if(partner && partner.length > 0){
                    newCustomer.partnerFullName = partner[0].partnerName;
                }

                if(responsibilityStaffName && responsibilityStaffName.length > 0){
                    if(storeOwnerId == newCustomer.responsibleStaffUserId){
                        newCustomer.responsibleStaffUserName = i18next.t('page.order.detail.information.shopOwner');
                    }else{
                        newCustomer.responsibleStaffUserName = responsibilityStaffName[0].userName;
                    }
                }

                if(createdStaffName && createdStaffName.length > 0){
                    if(storeOwnerId == newCustomer.createdStaffUserId){
                        newCustomer.createdStaffUserName = i18next.t('page.order.detail.information.shopOwner');
                    }else{
                        newCustomer.createdStaffUserName = createdStaffName[0].userName;
                    }
                }

                lstCustomerNew.push(newCustomer);
            });

            setStItemList(lstCustomerNew);

        }).catch(error => {});
    }

    return (
        <>
            <GSAlertModal ref={refDeleteModal}/>
            <CustomerListBarcodePrinter isOpen={isShowPrintModal} onClose={togglePrintModal}/>
            {stShowPartnerModal &&
            <PartnerModal
                productSelectedList={[]}
                onClose={handlePartnerModalClose}
                type={Constants.ITEM_TYPE.BUSINESS_PRODUCT}
                showSearchOption={true}
            />
            }

            {/*IMPORT MODAL*/}
            <CustomerListImportModal isOpen={stIsImportModalOpen}
                                     cancelCallback={() => setStIsImportModalOpen(false)}
                                     importCallback={onImportCallback}
            />

            {/*ASSIGN STAFF MODAL*/}
            <AssignStaffModal
                isToggle={stToggleModalStaff}
                listStaff={stListDataStaff}
                onClose={toggleAssignStaff}
                onAssign={handleAssignStaff}
            />
            {/*MODAL ADD CUSTOMER*/}
            <CreateCustomerModal
                toggle={ stToggleAddCustomerModal }
                onToggle={ toggleModalCustomer }
                onValidSubmit={ handleCreateCustomer }
            />

            {/*MODAL SELECT COLUMN*/}
            {
                getIsOpenSelectColumnModal && 
                <SelectSettingColumn
                    isOpen={ true }
                    onFinishSelect={ onFinishSelectColumn }
                    lstSelected={getLstColumn}
                />
            }
            


            {stIsReporting && <LoadingScreen/>}
            <ConfirmModal ref={refExportConfirmModal}/>
            {/*MOBILE SEGMENT MODAL*/}
            {stIsShowSegmentModal &&
                <GSModalFullBodyMobile title={i18next.t("page.customers.allSegments")}
                                       className="mobile-segment-modal"
                                        rightEl={
                                            <GSButton success onClick={() => {
                                                renderByFilter('segmentId', stSegmentMobileTemp?.id ? stSegmentMobileTemp.id : '')
                                            }}>
                                                <GSTrans t={"common.btn.done"}/>
                                            </GSButton>
                                        }
                >
                    <div className="mobile-search-box">
                        <UikInput
                            key={stSegmentFilter.keyword}
                            defaultValue={stSegmentFilter.keyword}
                            autoFocus={stSegmentFilter.keyword.length > 0 ? true : false}
                            icon={(
                                <FontAwesomeIcon icon="search"/>
                            )}
                            placeholder={i18next.t("page.customers.segments.list.searchByName")}
                            onChange={onInputSearch}
                        />
                    </div>
                    <div className="mobile-segment-list" onScroll={onScrollSegmentList}>
                        {stSegmentList.length === 0 &&
                            <GSWidgetEmptyContent text={
                                stSegmentFilter.keyword ? i18next.t("common.noResultFound"):i18next.t("page.customer.segment.haveNoSegment")
                            }
                                                  iconSrc="/assets/images/icon-emptysegment.svg"
                            />
                        }
                        <UikFormInputGroup>
                            {/*CURRENT*/}
                            {stCurrentSegment &&
                                <UikRadio
                                    key={'m'+stCurrentSegment.id}
                                    label={stCurrentSegment.name}
                                    name="m-segment"
                                    defaultChecked={true}
                                    onClick={() => onSelectSegmentMobile(stCurrentSegment)}
                                />
                            }

                            {/* ALL*/}
                            {stSegmentList.length > 0 &&
                                <UikRadio
                                    label={<GSTrans t={"page.customer.segment.allSegments"}/>}
                                    name="m-segment"
                                    defaultChecked={stCurrentSegment === null}
                                    onClick={() => onSelectSegmentMobile(null)}
                                />
                            }

                            {/*LIST*/}
                            {stSegmentList.length > 0 &&
                                    stSegmentList.map(segment => {
                                        if (stCurrentSegment && stCurrentSegment.id === segment.id) {
                                            return null
                                        }
                                        return (
                                            <UikRadio
                                                key={'m' + segment.id}
                                                label={segment.name}
                                                name="m-segment"
                                                onClick={() => onSelectSegmentMobile(segment)}
                                            />
                                        )
                                    })
                            }
                        </UikFormInputGroup>
                    </div>
                </GSModalFullBodyMobile>
            }
            <GSContentContainer className="customer-list"
                            minWidthFitContent>


                
                <GSContentHeader title={
                        <GSContentHeaderTitleWithExtraTag
                            title={i18next.t('page.customers.allCustomers')}
                            extra= {stPaging.totalItem}
                            
                            settingIcon={
                                <div className="setting-column-icon d-mobile-block d-desktop-block"
                                    style={{
                                        backgroundImage: `url(${icoSetting})`,
                                        width : '25px',
                                        height : '25px',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize : 'cover',
                                        marginLeft: '10px'
                                    }}
                                    onClick={toggleModalSelectColumn}
                                />
                            }
                            />

                }>

                




                <HintPopupVideo title={"[general info \ export import\ print label]"} category={'CUSTOMER_MANAGERMENT'}/>
                <GSContentHeaderRightEl className="d-flex flex-wrap buttons-row">
                    <GSButton success onClick={toggleModalCustomer} marginRight>
                        <GSTrans t={"component.AddContactModal.title"}/>
                    </GSButton>
                    <GSComponentTooltip message={i18next.t('page.customers.list.exportHint')}
                                        placement={GSTooltipPlacement.BOTTOM}
                                        style={{
                                            display: "block"
                                        }}
                    >
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0132]}>
                            <GSButton success onClick={onClickExport} marginRight>
                                <GSTrans t={"page.customers.list.export"}/>
                            </GSButton>
                        </PrivateComponent>

                    </GSComponentTooltip>
                    <GSComponentTooltip message={i18next.t('page.customers.list.importHint')}
                        placement={GSTooltipPlacement.BOTTOM}
                                        style={{
                                            display: "block"
                                        }}
                    >
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0131]}>
                            <GSButton success onClick={onClickImport} marginRight>
                                <GSTrans t="page.customers.list.import"/>
                            </GSButton>
                        </PrivateComponent>

                    </GSComponentTooltip>

                    <div>
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.POS_PACKAGE]}>
                            <GSButton success outline marginRight onClick={togglePrintModal}>
                                <GSTrans t="page.customer.list.printBarCode.btn.print"/>
                            </GSButton>
                        </PrivateComponent>
                    </div>

                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX} className="customer-list__body">
                <GSWidget>
                    <GSWidgetContent>
                        {/*DESKTOP*/}
                        <section className={"customer-list__filter-container d-mobile-none d-desktop-flex " + (stIsFetching? 'gs-atm--disable':'')}>
                            {/*SEARCH*/}
                            <span
                                style={{marginRight: 'auto'}}
                                className="gs-search-box__wrapper">
                                {stFilterConfig.searchField === SEARCH_TYPE.ADDRESS &&
                                    <SearchByShippingAddress
                                        callback={handleSearchByAddressCallBack}
                                        optionApiUrl={Constant.OPTION_API_URL_ADDRESS.getAddressCustomer}
                                        defaultValue={stFilterConfig.keyword}
                                        makeBoldWordsFromString={false}
                                    />
                                }
                                
                                {stFilterConfig.searchField !== SEARCH_TYPE.ADDRESS &&
                                    <UikInput
                                        key={stFilterConfig.keyword}
                                        defaultValue={stFilterConfig.keyword}
                                        autoFocus={stFilterConfig.keyword.length > 0 ? true : false}
                                        onChange={onSearchChange}
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        placeholder={i18next.t("common.txt.searchKeyword")}
                                    />
                                }
                                
                                <UikSelect
                                    value={[{value: stFilterConfig.searchField}]}
                                    options={SEARCH_TYPE_LIST}
                                    onChange={(item) => filterBySearchType(item.value)}
                                />
                            </span>
                            <GSMegaFilter  size="medium" isCountNumber={true} countNumber={stCountFilter} onSubmit={onMegaFilterChange}>
                                <GSMegaFilterRowSelect name="branchIds"
                                                       i18Key="page.home.card.branchFilter.title"
                                                       options={stBranchList}
                                                       defaultValue={stFilterConfig.branchIds}
                                                       ignoreCountValue={'ALL'}
                                />

                                <FilterRowSelectSegment name="segmentId"
                                                        i18Key="page.facebook.broadcast.detail.segment"
                                                        defaultValue={stFilterConfig.segmentId}
                                                        ignoreCountValue={'ALL'}
                                />

                                <GSMegaFilterRowSelectScroll
                                    key={ stPartnerList }
                                    name="partnerIds"
                                    i18Key="page.customers.allCustomer.partner.assignedPartner"
                                    options={ stPartnerList.map(p=>({value:String(p.id),label:p.name,code:p.partnerCode})) }
                                    defaultValue={ stFilterConfig.partnerIds }
                                    ignoreCountValue={ 'ALL' }
                                    paging={ stPartnerPaging }
                                    onSearch={ handleSearch }
                                />

                                <GSMegaFilterRowSelect name="responsibleStaffUserIds"
                                                       i18Key="page.livechat.filter.staff.assigned"
                                                       options={stStaffList}
                                                       defaultValue={stFilterConfig.responsibleStaffUserIds}
                                                       ignoreCountValue={'ALL'}
                                />

                                <GSMegaFilterRowTag name="saleChannel"
                                                    i18Key="component.product.addNew.saleChannels.title"
                                                    options={CHANNEL_FILTER_OPTIONS}
                                                    defaultValue={stFilterConfig.saleChannel}
                                                    ignoreCountValue={'ALL'}

                                />
                            </GSMegaFilter>

                        </section>
                        {/*MOBILE*/}
                        <section className={"customer-list__filter-container--mobile d-mobile-flex d-desktop-none " + (stIsFetching? 'gs-atm--disable':'')}>
                            {/*SEARCH*/}
                                <div className="row w-100">
                                <div className="col-12 col-sm-12 d-flex justify-content-between">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                        {stFilterConfig.searchField === SEARCH_TYPE.ADDRESS &&
                                            <SearchByShippingAddress
                                                callback={handleSearchByAddressCallBack}
                                                optionApiUrl={Constant.OPTION_API_URL_ADDRESS.getAddressCustomer}
                                                defaultValue={stFilterConfig.keyword}
                                                makeBoldWordsFromString={false}
                                            />
                                        }

                                        {stFilterConfig.searchField !== SEARCH_TYPE.ADDRESS && 
                                            <UikInput
                                                key={stFilterConfig.keyword}
                                                defaultValue={stFilterConfig.keyword}
                                                autoFocus={stFilterConfig.keyword.length > 0 ? true : false}
                                                onChange={onSearchChange}
                                                icon={(
                                                    <FontAwesomeIcon icon="search"/>
                                                )}
                                                placeholder={i18next.t("common.txt.searchKeyword")}
                                            />
                                        }
                                    </span>
                                    <UikSelect
                                        value={[{value: stFilterConfig.searchField}]}
                                        options={SEARCH_TYPE_LIST}
                                        onChange={(item) => filterBySearchType(item.value)}
                                    />
                                </div>
                                </div>
                            {
                                getHasSelected > 0 &&
                                <div
                                    className='row selected-customer d-flex mb-3 font-weight-500 gsa__uppercase font-size-_9em'>
                                        <span className="col-12 col-sm-12">
                                            <GSTrans t='page.customers.action.selected.numberselect'
                                                     values={{x: getSelectedCustomer.length}}/>
                                        </span>
                                    <GSDropdownAction
                                        className='ml-4 col-12 col-sm-12'
                                        toggle={stActionToggle}
                                        onToggle={toggleActionDropdown}
                                        actions={[{
                                            label: i18next.t('page.customers.action.list.delete'),
                                            onAction: toggleDeleteCustomer
                                        }, {
                                            label: i18next.t('page.customers.allCustomer.assignPartner'),
                                            onAction: toggleAssignPartner
                                        }]}
                                    />
                                </div>
                            }
                            <div className="row">
                                <GSMegaFilter isCountNumber={true} countNumber={stCountFilter} size="medium" onSubmit={onMegaFilterChange}>
                                    <GSMegaFilterRowSelect name="branchIds"
                                                           i18Key="page.home.card.branchFilter.title"
                                                           options={stBranchList}
                                                           defaultValue={stFilterConfig.branchIds}
                                                           ignoreCountValue={'ALL'}
                                    />

                                    <FilterRowSelectSegment name="segmentId"
                                                            i18Key="page.facebook.broadcast.detail.segment"
                                                            defaultValue={stFilterConfig.segmentId}
                                                            ignoreCountValue={'ALL'}
                                    />

                                    <GSMegaFilterRowSelectScroll
                                        key={ stPartnerList }
                                        name="partnerIds"
                                        i18Key="page.customers.allCustomer.partner.assignedPartner"
                                        options={ stPartnerList.map(p=>({value:String(p.id),label:p.name,code:p.partnerCode})) }
                                        defaultValue={ stFilterConfig.partnerIds }
                                        ignoreCountValue={ 'ALL' }
                                        paging={ stPartnerPaging }
                                        onSearch={ handleSearch }
                                    />

                                    <GSMegaFilterRowSelect name="responsibleStaffUserIds"
                                                           i18Key="page.livechat.filter.staff.assigned"
                                                           options={stStaffList}
                                                           defaultValue={stFilterConfig.responsibleStaffUserIds}
                                                           ignoreCountValue={'ALL'}
                                    />

                                    <GSMegaFilterRowTag name="saleChannel"
                                                        i18Key="component.product.addNew.saleChannels.title"
                                                        options={CHANNEL_FILTER_OPTIONS}
                                                        defaultValue={stFilterConfig.saleChannel}
                                                        ignoreCountValue={'ALL'}

                                    />
                                </GSMegaFilter>
                            </div>
                        </section>
                        {/*TASK LOG*/}
                        {isProgressAssign &&
                        <div className="d-flex align-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{
                                color: '#1665D8'
                            }}
                                 fill="currentColor" className="bi bi-arrow-repeat gs-ani__rotate" viewBox="0 0 16 16">
                                <path
                                    d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                <path fill-rule="evenodd"
                                      d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                            </svg>
                            <span className="pl-2 text-progress-assign" dangerouslySetInnerHTML={{__html: i18next.t('page.customers.progress.assign.staff')}}/>
                        </div>
                        }
                        {
                            getHasSelected > 0 &&
                            <div
                                className='selected-customer d-flex font-weight-500 gsa__uppercase font-size-_9em'>
                                        <span>
                                            <GSTrans t='page.customers.action.selected.numberselect'
                                                     values={{x: getSelectedCustomer.length}}/>
                                        </span>
                                <GSDropdownAction
                                    className='ml-4'
                                    toggle={stActionToggle}
                                    onToggle={toggleActionDropdown}
                                    actions={[{
                                        label: i18next.t('page.customers.action.list.delete'),
                                        onAction: toggleDeleteCustomer
                                    }, {
                                        label: i18next.t('page.customers.allCustomer.assignPartner'),
                                        onAction: toggleAssignPartner
                                    },{
                                        label: i18next.t('page.customers.allCustomer.assignStaff'),
                                        onAction: toggleAssignStaff
                                    }
                                    ]}
                                />
                            </div>
                        }
                        {stWaitingCustomerToPartner &&
                            <div className="d-flex align-items-center mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{
                                    color: '#1665D8'
                                }}
                                     fill="currentColor" className="bi bi-arrow-repeat gs-ani__rotate" viewBox="0 0 16 16">
                                    <path
                                        d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                    <path fill-rule="evenodd"
                                          d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                                </svg>
                                <span className="pl-2 text-primary"><span className="font-weight-bold">{i18next.t('page.customers.allCustomer.assigningCustomer')}</span>{i18next.t('page.customers.allCustomer.assigningCustomer2')}</span>
                            </div>
                        }
                        <section className="customer-list__list-container d-table">
                            <div className='customer-table-custom-fake'>
                                {/* FAKE TABBLE */}
                                <div>

                                </div>
                            </div>

                            <div className='customer-table-custom'>
                            <UikWidgetTable>
                                <thead>
                                <tr className='customer-table-header'>
                                    <th style={{paddingLeft : '10px', minWidth : "30px"}}>
                                    <UikCheckbox
                                        name="check_all"
                                        className="select-collection-row"
                                        checked={getCheckAllValue}
                                        onChange={(e) => selectAllCustomer(e)}
                                    />
                                    </th>


                                    {
                                        findEnableColumn('id') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.id"}/>
                                        </th>
                                    }
                                    
                                    {
                                        findEnableColumn('full_name') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.full_name"}/>
                                        </th>
                                    }

                                    {   findEnableColumn('phone') &&
                                        <th style={{minWidth : "80px"}}></th>
                                    }

                                    {
                                        findEnableColumn('phone') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.phone"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('last_order') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.last_order"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('total_order') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.total_order"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('total_purchase') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.total_purchase"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('debt') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.debt"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('sale_channel') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.sale_channel"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('created_by') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.created_by"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('address') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.address"}/>
                                        </th>
                                    }
                                  
                                    {
                                        findEnableColumn('gender') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.gender"}/>
                                        </th>
                                    }
                                    
                                    {
                                        findEnableColumn('birthday') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.birthday"}/>
                                        </th>
                                    }
                                    
                                    {
                                        findEnableColumn('member_point') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.member_point"}/>
                                        </th>
                                    }
                                    
                                    {
                                        findEnableColumn('membership_tier') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.membership_tier"}/>
                                        </th>
                                    }
                                    
                                    {
                                        findEnableColumn('email') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.email"}/>
                                        </th>
                                    }
                                    
                                    {
                                        findEnableColumn('assigned_staff') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.assigned_staff"}/>
                                        </th>
                                    }
                                 
                                    {
                                        findEnableColumn('assigned_partner') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.assigned_partner"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('company_name') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.company_name"}/>
                                        </th>
                                    }

                                    {
                                        findEnableColumn('tax_code') &&
                                        <th>
                                            <GSTrans t={"page.customers.setting.column.tax_code"}/>
                                        </th>
                                    }
                                     
                                </tr>
                                </thead>
                                {!stIsFetching &&
                                    <tbody>
                                    {stItemList.map((item,index) => {
                                        const isExist = getSelectedCustomer.filter(p => p.id === item.id).length > 0 ? true : false;
                                        return (
                                            <tr key={item.id}
                                                className="cursor--pointer gsa-hover--gray">
                                                <td className="action" style={{paddingLeft : '10px'}}>
                                                    <UikCheckbox
                                                        key={`customer_at_${item.id}_${isExist}`}
                                                        name={`customer_at_${item.id}`}
                                                        className="select-collection-row"
                                                        defaultChecked={isExist}
                                                        onChange={(e) => selectACustomer(item, e)}
                                                    />
                                                </td>

                                                

                                                {
                                                    findEnableColumn('id') &&
                                                    <td>
                                                        {item.id}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('full_name') &&
                                                    <td>
                                                            <Link
                                                                className="text-dark gsa-text--non-underline"
                                                                to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                            >
                                                                <div className="full-name">
                                                                    {item.fullName}
                                                                </div>
                                                                <div className={["user-type ", item.guest ? "guest-type" : "mem-type"].join('')}>
                                                                    {item.guest ? i18next.t('page.livechat.customer.details.search.user_type.contact') : i18next.t('page.livechat.customer.details.search.user_type.member')}
                                                                </div>
                                                            </Link>
                                                    </td>
                                                }
                                                {
                                                    findEnableColumn('phone') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            <CallButton
                                                                isAutoCall
                                                                revertColor
                                                                toID={item.id}
                                                                toName={item.fullName}
                                                                toNumber={item.phoneBackup && item.phoneBackup.split(',')[0]}
                                                                disabled={!(item.phoneBackup && item.phoneBackup.split(',')[0])}
                                                            />
                                                        </Link>
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('phone') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            {item.phoneBackup && item.phoneBackup.split(',')[0]}
                                                        </Link>
                                                    </td >
                                                }
                                                
                                                {
                                                    findEnableColumn('last_order') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            {item.lastOrder && DateTimeUtils.formatDDMMYYY(item.lastOrder)}
                                                        </Link>
                                                    </td>
                                                }
                                                
                                                {
                                                    findEnableColumn('total_order') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            {item.totalOrder ? NumberUtils.formatThousand(item.totalOrder) : 0}
                                                        </Link>
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('total_purchase') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            {item.totalPurchase ? CurrencyUtils.formatMoneyByCurrency(item.totalPurchase, currency) : 0}
                                                        </Link>
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('debt') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            {item.orderDebtSummary && CurrencyUtils.formatMoneyByCurrency(item.orderDebtSummary, currency)}
                                                        </Link>
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('sale_channel') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT }/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow'?'GOMUA':item.saleChannel}`}
                                                        >
                                                            <GSSaleChannelIcon channel={item.saleChannel}
                                                                            size={GSSaleChannelIconSize.sm}
                                                            />
                                                        </Link>
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('created_by') &&
                                                    <td>
                                                        {item.createdStaffUserName}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('address') &&
                                                    <td>
                                                        <Link
                                                            className="text-dark gsa-text--non-underline"
                                                            to={`${NAV_PATH.customers.CUSTOMERS_EDIT}/${item.id}/${item.userId}/${item.saleChannel?.toLowerCase() === 'beecow' ? 'GOMUA' : item.saleChannel}`}
                                                        >
                                                            {item.isFullAddressOverflowed
                                                                ? <GSComponentTooltip
                                                                    message={item.customerAddress}
                                                                    placement={GSTooltip.PLACEMENT.BOTTOM}>
                                                                    <div className="address">
                                                                        {item.customerAddress}
                                                                    </div>
                                                                </GSComponentTooltip>
                                                                : <div className="address">
                                                                    {item.customerAddress}
                                                                </div>
                                                            }
                                                        </Link>
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('gender') &&
                                                    <td>
                                                        {item.gender ? item.gender === 'MALE' ? 
                                                            i18next.t("page.customers.male") : 
                                                            i18next.t("page.customers.female") : ''}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('birthday') &&
                                                    <td>
                                                        {item.birthday && DateTimeUtils.formatDDMMYYY(item.birthday)}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('member_point') &&
                                                    <td>
                                                        {item.memberPoint}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('membership_tier') &&
                                                    <td>
                                                        {item.membershipName}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('email') &&
                                                    <td>
                                                        {item.email}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('assigned_staff') &&
                                                    <td>
                                                        {item.responsibleStaffUserName}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('assigned_partner') &&
                                                    <td>
                                                        {item.partnerFullName}
                                                    </td>
                                                }  

                                                {
                                                    findEnableColumn('company_name') &&
                                                    <td>
                                                        {item.companyName}
                                                    </td>
                                                }

                                                {
                                                    findEnableColumn('tax_code') &&
                                                    <td>
                                                        {item.taxCode}
                                                    </td>
                                                }
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                }
                            </UikWidgetTable>
                            </div>

                            {!stIsFetching &&
                            <PagingTable
                                currentPage={stPaging.currentPage}
                                totalPage={stPaging.totalPage}
                                maxShowedPage={10}
                                totalItems={stPaging.totalItem}
                                onChangePage={(e) => onChangePage(e)}
                                hidePagingEmpty
                            >
                            </PagingTable>}
                        </section>
                        
                        {stIsFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}
                                className="loading-list"
                            />
                        }


                        {stItemList.length === 0 && !stIsFetching &&
                        <GSWidgetEmptyContent
                            iconSrc="/assets/images/customers/icon-emptycustomer.svg"
                            text={stFilterConfig.keyword? i18next.t("common.noResultFound"):i18next.t("page.customers.haveNoCustomer")}/>
                        }
                    </GSWidgetContent>
                </GSWidget>
                <GSLearnMoreFooter text={i18next.t("title.[/customers]")}
                                   linkTo={'https://huongdan.gosell.vn/faq_category/quan-ly-khach-hang-gopos/'}
                                   marginTop marginBottom/>
            </GSContentBody>
        </GSContentContainer>
        </>
    );
};

CustomerList.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol()
};

CustomerList.propTypes = {
    currency: PropTypes.string
};

export default CustomerList;
