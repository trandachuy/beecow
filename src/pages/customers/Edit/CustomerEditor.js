/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 04/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useImperativeHandle, useRef, useState} from 'react';
import style from './CustomerEditor.module.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSImg from "../../../components/shared/GSImg/GSImg";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import Constants from "../../../config/Constant";
import {CurrencyUtils} from "../../../utils/number-format";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {FormValidate} from "../../../config/form-validate";
import GSTags from "../../../components/shared/form/GSTags/GSTags";
import {RouteUtils} from "../../../utils/route";
import GSTab, {createItem} from "../../../components/shared/form/GSTab/GSTab";
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag";
import {DateTimeUtils} from "../../../utils/date-time";
import GSButtonUpload from "../../../components/shared/GSButtonUpload/GSButtonUpload";
import beehiveService from "../../../services/BeehiveService";
import {cancelablePromise} from "../../../utils/promise";
import {GSToast} from "../../../utils/gs-toast";
import CustomerOrderList from "./OrderList/CustomerOrderList";
import CustomerRelatedOrderList from "./RelatedOrderList/CustomerRelatedOrderList";
import './CustomerEditor.sass';
import {BCOrderService} from "../../../services/BCOrderService";
import {ImageUtils} from "../../../utils/image";
import {TokenUtils} from "../../../utils/token";
import PropTypes from "prop-types";
import {LiveChatConversationContext} from "../../live-chat/conversation/context/LiveChatConversationContext";
import {ValidateUtils} from "../../../utils/validate";
import {STAFF_PERMISSIONS} from "../../../config/staff-permissions";
import {ROLES} from "../../../config/user-roles";
import BarCode from "react-barcode";
import GSModal, {GSModalTheme} from "../../../components/shared/GSModal/GSModal";
import {ZaloChatConversationContext} from "../../live-chat/zalo/conversation/context/ZaloChatConversationContext";
import {cn} from "../../../utils/class-name";
import {CredentialUtils} from "../../../utils/credential";
import GSCallHistoryTable from "../../../components/shared/GSCallHistoryTable/GSCallHistoryTable";
import CallButton from "../../../components/shared/CallCenterModal/CallButton/CallButton";
import CustomerEditorActivityList from "./ActivityList/CustomerEditorActivityList";
import storeService from "../../../services/StoreService";
import qs from 'qs';
import accountService from "../../../services/AccountService";
import GSDropdownForm from "../../../components/shared/GSDropdownForm/GSDropdownForm";
import {AgencyService} from "../../../services/AgencyService";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import GSComponentTooltip from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {StringUtils} from "../../../utils/string.js";
import catalogService from "../../../services/CatalogService";
import moment from "moment";
import DatePicker from "react-datepicker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import CustomerDebtList from "./DebtList/CustomerDebtList";
import {Trans} from 'react-i18next'
import ConfirmPaymentModal from '../../../components/shared/ConfirmPaymentModal/ConfirmPaymentModal'
import {OrderService} from '../../../services/OrderService'
import useDebounceEffect from '../../../utils/hooks/useDebounceEffect'
import affiliateService from "../../../services/AffiliateService";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";

const isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)
const isShowOrder = !isStaff || (isStaff && TokenUtils.isHasAllStaffPermission([STAFF_PERMISSIONS.ORDERS, STAFF_PERMISSIONS.RESERVATIONS]))
const BREAD_CRUMB = [
    {
        title: i18next.t("component.navigation.customers.allCustomers"),
        link: NAV_PATH.customers.CUSTOMERS_LIST
    },
    {
        title: i18next.t("component.navigation.customers"),
        link: null
    }
]

const TAB = {
    ORDERS: 'orders',
    DEBT: 'debt',
    RELATED_ORDERS: 'related_orders',
    NOTIFICATION: 'notification',
    CALL_CENTER: 'call_center'
}

const ORDER_TABLE_HEADERS = [
    i18next.t("page.customers.edit.orderNumber"),
    i18next.t("page.customers.edit.saleChannel"),
    i18next.t("page.customers.edit.orderDate"),
    i18next.t("page.customers.edit.status"),
    i18next.t("page.customers.edit.quantity"),
    i18next.t("page.customers.edit.subtotal"),
    i18next.t("page.customers.edit.total"),
]
const ON_INPUT_DELAY = 500;

const CUSTOMER_TAB = {
    GENERAL: 'general',
    ACTIVITIES: 'activities'
}

const GENDER_OPTIONS = [
    {
        value: 'ALL',
        label: i18next.t('page.customers.selectGender')
    },
    {
        value: Constants.Gender.MALE,
        label: i18next.t('page.customers.male')
    },
    {
        value: Constants.Gender.FEMALE,
        label: i18next.t('page.customers.female')
    },
]

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()
const MAX_STAFF_PAGE_SIZE = 50;

const CustomerEditor = (props, ref) => {
    const {state, dispatch} = useContext(LiveChatConversationContext.context);

    const TABS = [
        createItem(i18next.t("page.customers.edit.orders"), TAB.ORDERS, null, !isShowOrder),
        createItem(i18next.t("page.customers.edit.debt.title"), TAB.DEBT, null, false),
        createItem(i18next.t("page.customers.edit.related_orders"), TAB.RELATED_ORDERS, null, !isShowOrder),
        createItem(i18next.t("page.customers.edit.notification"), TAB.NOTIFICATION, null, true),
        createItem(i18next.t("component.navigation.callCenter.history"), TAB.CALL_CENTER, null, !CredentialUtils.getOmiCallEnabled() && !CredentialUtils.getOmiCallExpired()),
    ]

    let tab
    if (props.location && props.location.search) {
        tab = qs.parse(props.location.search, {ignoreQueryPrefix: true}).tab
    }

    const refOutsideClick = useRef();
    const openBirthday = useRef(null);
    const refModal = useRef();
    const refModalCall = useRef();
    const refEditCustomerForm = useRef(null);

    const {state: zlState, dispatch: zlDispatch} = useContext(ZaloChatConversationContext.context);
    const [stIsLoading, setStIsLoading] = useState(true);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stOnRedirect, setStOnRedirect] = useState(true);
    const [stTags, setStTags] = useState([]);
    const [stSocialTags, setStSocialTags] = useState([]);
    const [stPhones, setStPhones] = useState([]);
    const [stCurrentTab, setStCurrentTab] = useState(TAB.ORDERS);
    /**
     * @type {[{CustomerInfoModel}]}
     */
    const [stCustomer, setStCustomer] = useState(null);
    const [stMemberShip, setStMemberShip] = useState("N/A");
    const [stSegments, setStSegments] = useState([]);
    const [stSummary, setStSummary] = useState(null);
    const [stAvatarObj, setStAvatarObj] = useState(null);
    const refSubmit = useRef(null);
    const {customerId, userId, saleChannel} = props.match.params
    const [stOptions, setStOptions] = useState([]);
    const [stStyleMenu, setStStyleMenu] = useState({width: '300px !important',})
    const [stStartKeyBlock, setStStartKeyBlock] = useState(null)
    const [stCurrentCustomerTab, setStCurrentCustomerTab] = useState(tab || CUSTOMER_TAB.GENERAL);
    const [stStaffList, setStStaffList] = useState([]);
    const [stUserDefineStatus, setStUserDefineStatus] = useState({
        "id": null,
        "status": "[]",
        "userStatus": [],
        "storeId": null
    });

    const [loyaltyPointEnabled, setLoyaltyPointEnabled] = useState(false);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [stCountries, setStCountries] = useState([])
    const [stProvince, setStProvince] = useState([])
    const [stDistrict, setStDistrict] = useState([])
    const [stWard, setStWard] = useState([])
    const [stAddressCustomer, setStAddressCustomer] = useState(null)
    const [stSendTime, setStSendTime] = useState(undefined);
    const [startDate, setStartDate] = useState(null);
    const [stConfirmPaymentModal, setStConfirmPaymentModal] = useState({
        toggle: false,
        data: {}
    })
    const [stRequiredEditAddress, setStRequiredEditAddress] = useState(false);
    const [stCustomerEditCountry, setStCustomerEditCountry] = useState(Constants.CountryCode.VIETNAM);
    const [stCustomerEditAddress, setStCustomerEditAddress] = useState('');
    const [stCustomerEditAddress2, setStCustomerEditAddress2] = useState('');
    const [stCustomerEditLocation, setStCustomerEditLocation] = useState('');
    const [stCustomerEditDistrict, setStCustomerEditDistrict] = useState('');
    const [stCustomerEditWard, setStCustomerEditWard] = useState('');
    const [stCustomerEditCity, setStCustomerEditCity] = useState('');
    const [stCustomerEditZipCode, setStCustomerEditZipCode] = useState('');
    
    const [stPartnerList,setStPartnerList] = useState(  [{
        id: null,
        name: i18next.t("social.zalo.filter.tags.unassigned"),
    }])
    const [stCurrentPartner,setStCurrentPartner] = useState(  {
        id: null,
        name: i18next.t("page.customers.edit.staff.unassigned"),
    })
    const [stPartnerPaging, setStPartnerPaging] = useState({
        currentPage: 0,
        totalPage: 0,
        isLoading: false
    }); 
    
    const [stDropShipActive, setStDropShipActive] = useState(false);
    

    useImperativeHandle(ref, () => ({
        onClickBtnSave() {
            onClickBtnSave();
        }
    }));

    useEffect(() => {
        fetchData()
        fetchDataPartner()
        fetchDropShipActive()
    }, []);

    useDebounceEffect(() => {
        let isRequired;
        
        if (stCustomerEditCountry === Constants.CountryCode.VIETNAM) {
            isRequired = stCustomerEditAddress !== '' || stCustomerEditLocation !== '' || stCustomerEditDistrict !== ''
                || stCustomerEditWard !== '';
        } else {
            isRequired = stCustomerEditAddress !== '' || stCustomerEditAddress2 !== '' || stCustomerEditLocation !== ''
            || stCustomerEditCity !== '' || stCustomerEditZipCode !== '';
        }
        
        setStRequiredEditAddress(isRequired);
        
        if (refEditCustomerForm.current) {
            refEditCustomerForm.current.setTouched('country');
            refEditCustomerForm.current.setTouched('address');
            refEditCustomerForm.current.setTouched('province');
            refEditCustomerForm.current.setTouched('districtCode');
            refEditCustomerForm.current.setTouched('wardCode');
            refEditCustomerForm.current.setTouched('city');
            refEditCustomerForm.current.setTouched('zipCode');
            if (!isRequired) {
                refEditCustomerForm.current.validateAll();
            }
        }
    }, 100, [stCustomerEditAddress, stCustomerEditAddress2, stCustomerEditLocation, stCustomerEditDistrict, 
        stCustomerEditWard, stCustomerEditCountry, stCustomerEditCity, stCustomerEditZipCode]);

    useEffect(() => {
        if (stUserDefineStatus.storeId) {
            beehiveService.getShowLoyaltyPointFlag(stUserDefineStatus.storeId)
                .then(flag => setLoyaltyPointEnabled(flag))
                .catch(GSToast.commonError);
        }
    }, [stUserDefineStatus]);

    useEffect(() => {
        if (loyaltyPointEnabled === true && userId && StringUtils.isNotUndefinedString(userId) && stUserDefineStatus.storeId) {
            BCOrderService.getAllCalculatedLoyaltyPointTypes(stUserDefineStatus.storeId, userId)
                .then(data => {
                    const availablePoint = data.find(item => item.event === "EARN");
                    if (availablePoint && availablePoint.value) {
                        setLoyaltyPoints(availablePoint.value);
                    }
                })
                .catch(GSToast.commonError);
        }
    }, [userId, loyaltyPointEnabled, stUserDefineStatus]);

    useEffect(() => {
        if (!stCustomerEditCountry) {
            setStProvince([])
            setStDistrict([])
            setStWard([])
        } else {
            catalogService.getCitesOfCountry(stCustomerEditCountry).then(res => setStProvince(res))
            setStDistrict([])
            setStWard([])
        }
    }, [stCustomerEditCountry])

    useEffect(() => {
        if (!stCustomerEditLocation) {
            setStDistrict([])
            setStWard([])
        } else {
            catalogService.getDistrictsOfCity(stCustomerEditLocation).then(res => setStDistrict(res))
            setStWard([])
        }
    }, [stCustomerEditLocation])

    useEffect(() => {
        if (!stCustomerEditDistrict) {
            setStWard([])
        } else {
            catalogService.getWardsOfDistrict(stCustomerEditDistrict).then(ward => setStWard(ward))
        }
    }, [stCustomerEditDistrict])

    const isDisplayConfirmPaymentBtn = debtAmount =>
        STORE_CURRENCY_SYMBOL === Constants.CURRENCY.VND.SYMBOL
            ? debtAmount >= 0.5
            :  debtAmount > 0;

    const onUserDefineStatusFormChange = (evt) => {
        setStOnRedirect(false);
        if (evt.name && evt.name === "userStatus") {
            const value = (String(evt.value).toUpperCase() === "BTNCHANGE" || String(evt.value).toUpperCase() === "BTNACTION") ? "" : evt.value;
            stCustomer.userStatus = value;
        }
    }

    const onFormChange = () => {
        setStOnRedirect(false);
    }

    const lazyLoadStaffList = (totalPage, firstStaffs) => {
        let requests = [];
        for (let i = 1; i < totalPage; i++) {
            let req = storeService.getStaffs(false, i, MAX_STAFF_PAGE_SIZE);
            requests.push(req);
        }
        return setTimeout(async () => {
            const result = await Promise.all(requests);
            let staffs = result.map(value => {
                return value.data
            }).flat();
            setStStaffList([...firstStaffs, ...staffs]);
        }, 500);
    }

    const fetchDataPartner = (page) => {
        setStPartnerPaging(state=>({...state,isLoading:true}))
        affiliateService.getListPartnerByStore({partnerStatus:'ACTIVATED',partnerType:'DROP_SHIP'}, page || stPartnerPaging.page, 50)
            .then(res => {
                setStPartnerList(state=> ([...state,...res.data]))
                setStPartnerPaging( state =>({
                    ...state,
                    currentPage: page === undefined ? state.currentPage : page,
                    totalPage: Math.ceil(res.totalCount / 50)
                }))
            }).finally(()=>{
            setStPartnerPaging(state=>({...state,isLoading:false}))
            })
    }

    const fetchDropShipActive = () => {
        affiliateService.getLastOrderOfStoreAffiliate(Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP)
            .then(dropShipLastPackage => {
                setStDropShipActive(!!dropShipLastPackage)
            })
    }
    
    const fetchData = () => {
        catalogService.getCountries()
            .then(countries => {
                setStCountries(countries)
            })

        beehiveService.getCustomerAddress(customerId)
            .then(res => {
                setStAddressCustomer(res)

                if (res.countryCode != null) {
                    setStCustomerEditCountry(res.countryCode)
                }
                if (res.address != null) {
                    setStCustomerEditAddress(res.address)
                }
                if (res.address2 != null) {
                    setStCustomerEditAddress2(res.address2)
                }
                if (res.locationCode != null) {
                    setStCustomerEditLocation(res.locationCode)
                }
                if (res.districtCode) {
                    setStCustomerEditDistrict(res.districtCode)
                }
                if (res.wardCode != null) {
                    setStCustomerEditWard(res.wardCode)
                }
                if (res.city != null) {
                    setStCustomerEditCity(res.city)
                }
                if (res.zipCode != null) {
                    setStCustomerEditZipCode(res.zipCode)
                }
            })
        const pmGetCustomer = cancelablePromise(beehiveService.getCustomerDetail(customerId))
        pmGetCustomer.promise
            .then(async result => {
                if(result.partnerId){
                    affiliateService.getPartnerById(result.partnerId)
                        .then(partner => {
                            setStCurrentPartner(partner.data)
                        })   
                }
                // get staff list
                let staffList = [];
                let defUserStatus = {
                    "id": null,
                    "status": "[]",
                    "userStatus": [],
                    "storeId": null
                }
                let totalPageStaff = 0;

                try {
                    defUserStatus = await beehiveService.getCustomerDefineStatus();
                    defUserStatus.userStatus = JSON.parse(defUserStatus.status);
                    setStStaffList(staffList);
                    setStUserDefineStatus(defUserStatus);
                } catch (e) {
                    console.log('can not get customer status');
                }

                try {
                    const memberShip = await beehiveService.getMembershipOfCustomer(result.id);
                    if (memberShip) {
                        setStMemberShip(memberShip.name)
                    }
                } catch (e) {
                    console.log('can not get customer membership');
                }

                try {
                    const segments = await beehiveService.getSegmentByCustomerId(result.id);
                    if (segments) {
                        setStSegments(segments)
                    }
                } catch (e) {
                    console.log('can not get customer segments');
                }

                try {
                    let reqStaffList = storeService.getStaffs(false, 0, MAX_STAFF_PAGE_SIZE);
                    let reqOwnerInfo = accountService.getUserById(CredentialUtils.getStoreOwnerId());
                    let data = await Promise.all([reqStaffList, reqOwnerInfo]);
                    const totalItem = parseInt(data[0].headers["x-total-count"]);
                    totalPageStaff = Math.ceil(totalItem / MAX_STAFF_PAGE_SIZE);

                    staffList = [...data[0].data];

                } catch (e) {
                    console.error("Cannot get list staff");
                }


                if (result.birthday != null) {
                    setStartDate(new Date(result.birthday))
                }

                setStCustomer(result)
                setStTags(result.tags ? result.tags.map(tag => {
                    return {
                        label: tag,
                        value: tag
                    }
                }) : []);
          
                beehiveService.getCustomerSummary(result.userName, result.saleChannel, result.id)
                    .then(result => {
                        setStSummary(result)
                        setStIsLoading(false)
                    })
                    .catch(()=>{
                        setStSummary({
                            averagePurchase: 0,
                            totalOrder: 0,
                            totalPurchase: 0,
                            totalPurchaseLast3Month: 0
                        });
                        setStIsLoading(false);
                    });
              
                if (userId && ([Constants.SaleChannels.BEECOW, Constants.SaleChannels.GOSELL, Constants.SaleChannels.GOMUA].includes(result.saleChannel))) {
                    if (userId != 'undefined') {
                        BCOrderService.getCustomerAvatar(userId)
                            .then(result => {
                                setStAvatarObj(result)
                            })
                    }

                }
                //continuous request staff list
                lazyLoadStaffList(totalPageStaff, staffList);
            })

        const pmGetCustomerSocialTag = cancelablePromise(Promise.all([beehiveService.getAssignedFbTagByCustomerId(customerId),
            beehiveService.getAssignedZaloTagByCustomerId(customerId)]));
        pmGetCustomerSocialTag.promise.then((resp) => {
            const fbTags = (resp && resp[0]) ? resp[0] : [];
            const zaloTags = (resp && resp[1]) ? resp[1] : [];

            const fbTagValues = fbTags.map(tag => {
                const tagInfo = tag.fbUserTagInfo;
                return {
                    label: tagInfo.tagName,
                    value: tag.id,
                    type: "fb"
                };
            });

            const zaloTagValues = zaloTags.map(tag => {
                const tagInfo = tag.zaloUserTagInfo;
                return {
                    label: tagInfo.tagName,
                    value: tag.id,
                    type: "zalo"
                };
            });
            setStSocialTags([...fbTagValues, ...zaloTagValues])
        });

        return () => {
            pmGetCustomer.cancel()
        }
    }

    const onSearchOptionFilter = (search, isEmpty) => {
        if (isEmpty) {
            setStOptions([])
        } else {
            if (this.stoSearch) clearTimeout(this.stoSearch)
            if (!search.startsWith(stStartKeyBlock)) {
                this.stoSearch = setTimeout(() => {
                    beehiveService.filterTagsByContext(search)
                        .then(result => {
                            if (result && result.length == 0) {
                                setStStartKeyBlock(search)
                            }
                            setStOptions(result)
                        }).catch(() => {
                        GSToast.commonError();
                    });
                }, ON_INPUT_DELAY)
            }
        }
    }

    const onClickBtnCancel = () => {
        RouteUtils.linkTo(props, NAV_PATH.customers.CUSTOMERS_LIST)
    }

    const onClickBtnSave = () => {
        refSubmit.current.click()
    }

    const onChangeTags = (value) => {
        onFormChange()
        setStTags(value)
        changeCustomerProfileInfo();
    }

    const onRemoveSocialTags = (item) => {
        const type = (item && item.type) ? (item.type) : "";
        if (type === "fb") {
            beehiveService.revokeFbTagByCustomerId(customerId, item.value);
        }
        if (type === "zalo") {
            beehiveService.revokeZaloTagByCustomerId(customerId, item.value);
        }
    }

    const renderAvatarName = (name) => {
        const namePaths = name.split(' ')
        if (namePaths.length === 1) {
            return namePaths[0].substring(0, 2).toUpperCase()
        } else {
            const lastName = namePaths[0].substring(1, 0)
            const firstName = namePaths[namePaths.length - 1].substring(1, 0)
            return lastName + firstName
        }

    }

    const onChangeTab = (tabValue) => {
        setStCurrentTab(tabValue)
    }

    const handleSubmit = (event, err, values) => {
        if (err.length > 0 && stCurrentCustomerTab === CUSTOMER_TAB.ACTIVITIES) {
            setStCurrentCustomerTab(CUSTOMER_TAB.GENERAL)
        }
    }

    const handleValidSubmit = (event, value) => {
        setStIsSaving(true)
        let birthday = stSendTime == undefined ? startDate ? startDate : null : stSendTime;
        if (birthday) {
            birthday = moment(birthday).format('YYYY-MM-DDT00:00:00Z')
        }
        ;

        const requestBody = {
            id: customerId,
            fullName: value.fullName,
            backupPhone: value.phone.split(/\n/),
            email: value.email,
            note: value.note,
            tags: stTags && stTags.length > 0 ? stTags.map(tagObj => tagObj.value ? tagObj.value : tagObj) : [],
            responsibleStaffUserId: value.responsibleStaffUserId === 'unassigned' ? undefined : value.responsibleStaffUserId,
            status: value.status,
            userStatus: stCustomer.userStatus,
            countryCode: value.country,
            address: value.address,
            address2: value.address2,
            locationCode: value.province,
            districtCode: value.district,
            wardCode: value.ward,
            city: value.city,
            zipCode: value.zipCode,
            gender: (value.gender === "ALL" || value.gender == "") ? null : value.gender,
            birthday: birthday,
            partnerId: stCurrentPartner.id,
            companyName:value.companyName,
            taxCode:value.taxCode
        }
        beehiveService.updateCustomerDetail(requestBody)
            .then(result => {
                setStIsSaving(false)
                setStOnRedirect(true)
                GSToast.success("toast.update.success", true);
                if (props.noRedirectAfterSave) {
                    if (props.embeddedFrom === 'ZL') {
                        zlDispatch(ZaloChatConversationContext.actions.changeCustomerProfileInfo(false));
                    } else {
                        dispatch(LiveChatConversationContext.actions.changeCustomerProfileInfo(false));
                    }
                } else {
                    RouteUtils.redirectWithoutReload(props, window.location.pathname + `?tab=${stCurrentCustomerTab}`);
                }
            })
            .catch(e => {
                setStIsSaving(false);
                if (e.response && e.response.data) {
                    if (e.response.data.errorKey === 'customer.exist') {
                        GSToast.error("page.livechat.customer.details.add.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.email.exist') {
                        GSToast.error("page.livechat.customer.details.add.email.exist.msg", true);
                    } else if (e.response.data.errorKey === 'customer.phone.exist') {
                        GSToast.error("page.livechat.customer.details.add.phone.exist.msg", true);
                    } else {
                        GSToast.commonError();
                    }
                } else {
                    GSToast.commonError();
                }
            })
    }

    const renderOrderStatus = (status) => {
        let tagStyle = GSStatusTag.STYLE.LIGHT
        switch (status.toUpperCase()) {
            case Constants.ORDER_STATUS_PENDING:
            case Constants.ORDER_STATUS_TO_SHIP:
                tagStyle = GSStatusTag.STYLE.INFO
                break
            case Constants.ORDER_STATUS_WAITING_FOR_PICKUP:
            case Constants.ORDER_STATUS_IN_CANCEL:
                tagStyle = GSStatusTag.STYLE.WARNING
                break
            case Constants.ORDER_STATUS_SHIPPED:
            case Constants.ORDER_STATUS_DELIVERED:
                tagStyle = GSStatusTag.STYLE.SUCCESS
                break
            case Constants.ORDER_STATUS_CANCELLED:
                tagStyle = GSStatusTag.STYLE.DANGER
                break
            case Constants.ORDER_STATUS_RETURNED:
                tagStyle = GSStatusTag.STYLE.SECONDARY
                break
            default:
                tagStyle = GSStatusTag.STYLE.LIGHT

        }
        return (
            <GSStatusTag tagStyle={tagStyle}
                         text={i18next.t(`page.order.detail.information.orderStatus.${status.toUpperCase()}`)}
                         className={style.orderStatusTag}
            />
        )
    }

    const buildPhoneValue = (backupPhone) => {
        let phoneList = []
        if (backupPhone) {
            phoneList = [...backupPhone]
        }
        return phoneList.join('\n')
    }

    const phoneValidate = (value, ctx, input, cb) => {
        ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
    };

    const phoneOrEmail = (value, ctx, input, cb) => {
        ValidateUtils.phoneOrEmail(i18next, value, ctx, input, cb);
    };

    const onStyleMenuChange = (point) => {
        setStStyleMenu({
            top: point.top,
            left: point.left,
            width: '300px !important',
        })
    }

    const onModelShow = (e) => {
        refModal.current.open()
    }

    const updateCustomerStatus = async () => {
        let status = JSON.stringify(stUserDefineStatus.userStatus);
        stUserDefineStatus.status = status;
        const pmGetCustomer = cancelablePromise(beehiveService.updateCustomerDefineStatus(stUserDefineStatus));
        const defStatus = await beehiveService.getCustomerDefineStatus();
        pmGetCustomer.promise.then(async result => {
            try {
                let defUserStatus = result;
                defUserStatus.userStatus = JSON.parse(defUserStatus.status);
                setStUserDefineStatus(defUserStatus);
            } catch (e) {
                console.error("Cannot update customer status");
            }
        }).catch((e) => {
            //revert data
            stUserDefineStatus.userStatus = JSON.parse(defStatus.status);
            setStUserDefineStatus(stUserDefineStatus);
            setStOnRedirect(true);
        })
    }

    const getUserStatusLasted = async () => {
        const defStatus = await beehiveService.getCustomerDefineStatus();
        stUserDefineStatus.userStatus = JSON.parse(defStatus.status);
        setStUserDefineStatus(stUserDefineStatus);
        setStOnRedirect(true);
    }

    const addNewStatusItem = (evt, item) => {
        setStOnRedirect(false);
        stUserDefineStatus.userStatus.push(item);
        setStUserDefineStatus(stUserDefineStatus);
        //updateCustomerStatus();
    }

    const removeStatusItem = (evt, index, item) => {
        setStOnRedirect(false);
        stUserDefineStatus.userStatus.splice(index, 1);
        setStUserDefineStatus(stUserDefineStatus);
        //updateCustomerStatus();
    }

    const changeStatusItem = (evt, index, item) => {
        setStOnRedirect(false);
        stUserDefineStatus.userStatus.splice(index, 1, item);
        setStUserDefineStatus(stUserDefineStatus);
        //updateCustomerStatus();
    }

    const onFinishChangeStatusItem = (evt, item) => {
        setStOnRedirect(false);
        //get update data from backend
        getUserStatusLasted();
    }

    const onSaveChangeStatusItem = (evt, items) => {
        setStOnRedirect(false);
        stUserDefineStatus.userStatus = items;
        setStUserDefineStatus(stUserDefineStatus);
        updateCustomerStatus();
    }

    const renderMemberFrom = (source) => {
        let className = ''
        switch (source.toUpperCase()) {
            case Constants.SaleChannels.BEECOW:
                className = style.tagBeecow
                break;
            case Constants.SaleChannels.GOSELL:
                className = style.tagGosell
                source = AgencyService.getDashboardName(i18next.t("component.button.selector.saleChannel.gosell"));
                break;
            case Constants.SaleChannels.LAZADA:
                className = style.tagLazada
                break;
            case Constants.SaleChannels.SHOPEE:
                className = style.tagShopee
                break;
        }

        const withAdapter = (source) => {
            if (source === Constants.SaleChannels.BEECOW) {
                return 'GOMUA'
            }
            if (source === Constants.SaleChannels.CONTACT_FORM) {
                return i18next.t('page.customers.list.contactForm').toUpperCase();
            }
            if (source === Constants.SaleChannels.IMPORTED) {
                return i18next.t('page.customers.list.imported').toUpperCase();
            }
            return source
        }

        return (
            <GSTrans t={"page.customers.edit.memberFrom"}
                     values={{channel: withAdapter(source.toUpperCase())}}
            >
                0<b className={className}>1</b>
            </GSTrans>
        )
    };

    const changeCustomerProfileInfo = () => {
        if (props.noRedirectAfterSave) {
            if (props.embeddedFrom === 'ZL') {
                zlDispatch(ZaloChatConversationContext.actions.changeCustomerProfileInfo(true));

            } else {
                dispatch(LiveChatConversationContext.actions.changeCustomerProfileInfo(true));

            }
        }
    };

    const changeCustomerTab = (tab) => {
        if (!CredentialUtils.getOmiCallEnabled() && !CredentialUtils.getOmiCallExpired()) {
            return
        }

        setStCurrentCustomerTab(tab)
    }

    const openCallDialogNumber = (e) => {
        if (!CredentialUtils.getOmiCallEnabled() && !CredentialUtils.getOmiCallRenewing()) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.callCenter.PATH_CALL_CENTER_INTRO)
        }

        const phoneList = [...stCustomer.backupPhone];
        setStPhones(phoneList);
        refModalCall.current.open();
    }

    const getOmiToastMessage = () => {
        if (CredentialUtils.getOmiCallRenewing()) {
            return
        }
        if (CredentialUtils.getOmiCallExpired()) {
            return 'page.callcenter.intro.connect.expiredCCHint'
        }
        if (!TokenUtils.onlyFreePackage()) {
            return 'page.callcenter.intro.connect.expiredHint'
        }

        return 'page.callcenter.intro.connect.goFreeHint'
    }

    const isDisableCallButton = () => {
        return (CredentialUtils.getOmiCallEnabled() && TokenUtils.onlyFreePackage() && !TokenUtils.isStaff())
            || CredentialUtils.getOmiCallExpired()
            || !CredentialUtils.getOmiCallData()
            || !CredentialUtils.getOmiCallData().sipUser
    }

    const handleChangeBirthday = (date) =>{
        setStartDate(date)
        setStSendTime(DateTimeUtils.flatTo(moment(date), DateTimeUtils.UNIT.MINUTE))
    }

    const useOutsideClick = (ref, callback) => {
        const handleClick = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                callback();
            }
        };

        useEffect(() => {
            document.addEventListener("click", handleClick);

            return () => {
                document.removeEventListener("click", handleClick);
            };
        });
    };

    useOutsideClick(refOutsideClick, () => {
        onFormChange()
    });

    const handleCountry = (countryCode) => {
        if (!countryCode) {
            return
        }

        setStCustomerEditLocation('')
        setStCustomerEditDistrict('')
        setStCustomerEditWard('')
        setStCustomerEditCountry(countryCode)
        changeCustomerProfileInfo()
    }

    const togglePaymentConfirmation = (e) => {
        e.preventDefault()
        setStConfirmPaymentModal(modal => ({
            ...modal,
            toggle: !modal.toggle
        }))
    }

    const handleConfirmPayment = (data) => {
        if (!stIsSaving) {
            const paymentHistory = {
                ...data,
                createDate: data.createdDate,
                customerId :stCustomer.id
            }
            beehiveService.confirmPaymentForUser(paymentHistory)
                .then(() => beehiveService.getCustomerSummary(stCustomer.userName, stCustomer.saleChannel, stCustomer.id))
                .then(result => setStSummary(result))
                .then(() => GSToast.commonCreate())
                .catch(() => GSToast.commonError())
                .finally(() => setStIsSaving(false))
        }

        setStIsSaving(true)
        setStConfirmPaymentModal(modal => ({
            ...modal,
            toggle: false
        }))
    }

    const onSelectPartner = (partner) => {
        setStCurrentPartner(partner)
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const onScrollPartnerList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPartnerPaging.currentPage < stPartnerPaging.totalPage) {
            fetchDataPartner(stPartnerPaging.currentPage + 1)
        }
    }
    

    const renderInsideAddressForm = () => {
        return <>
            {/*ADDRESS*/}
            <AvField
                disabled={props.disabled}
                label={i18next.t('page.customers.edit.address')}
                name={'address'}
                validate={{
                    ...FormValidate.withCondition(
                        stRequiredEditAddress,
                        FormValidate.required()
                    ),
                    ...FormValidate.maxLength(255)
                }}
                placeHolder={i18next.t('page.customer.addAddress.enterAddress')}
                onChange={e => {
                    setStCustomerEditAddress(e.target.value)
                    changeCustomerProfileInfo()
                }}
                onBlur={onFormChange}
                value={stCustomerEditAddress}
            />
            <div className='row customer-location'>
                <AvField
                    type="select"
                    name="province"
                    label={<div className="label-required">{i18next.t('page.products.supplierPage.province')}</div>}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        )
                    } }
                    onChange={ e => {
                        setStCustomerEditDistrict('')
                        setStCustomerEditWard('')
                        setStCustomerEditLocation(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    disabled={props.disabled}
                    onBlur={onFormChange}
                    value={stCustomerEditLocation}
                >
                    <option value={''}>{i18next.t('page.customer.addAddress.selectCity')}</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
                <AvField
                    type="select"
                    name="district"
                    label={ <div className="label-required">{ i18next.t('page.products.supplierPage.district') }</div> }
                    defaultValue={ stAddressCustomer ? stAddressCustomer.districtCode : '' }
                    disabled={ props.disabled }
                    onChange={ e => {
                        setStCustomerEditWard('')
                        setStCustomerEditDistrict(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        )
                    }}
                    value={stCustomerEditDistrict}
                >
                    <option value={''}>{i18next.t('page.customer.addAddress.selectDistrict')}</option>
                    {
                        stDistrict && stDistrict.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
                <AvField
                    type="select"
                    name="ward"
                    label={ <div className="label-required">{ i18next.t('page.products.supplierPage.ward') }</div> }
                    disabled={ props.disabled }
                    onChange={ e => {
                        setStCustomerEditWard(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        )
                    }}
                    value={stCustomerEditWard}
                >
                    <option value={''}>{i18next.t('page.customer.addAddress.selectWard')}</option>
                    {
                        stWard && stWard.map((x, index) =>
                            <option value={x.code} key={index}>{x.inCountry}</option>
                        )
                    }
                </AvField>
            </div>
        </>
    }

    const renderOutsideAddressForm = () => {
        return <>
            <div className="row outside-address">
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.streetAddress')}
                    name={'address'}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(255)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterAddress')}
                    onChange={e => {
                        setStCustomerEditAddress(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    onBlur={onFormChange}
                    value={stCustomerEditAddress}
                />
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.address2')}
                    name={'address2'}
                    validate={{
                        ...FormValidate.maxLength(255)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterAddress2')}
                    onChange={e => {
                        setStCustomerEditAddress2(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    onBlur={onFormChange}
                    value={stCustomerEditAddress2}
                />
            </div>
            <div className='row outside-location'>
                <AvField
                    type="select"
                    name="province"
                    label={i18next.t('page.customers.edit.state')}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        )
                    } }
                    onChange={ e => {
                        setStCustomerEditLocation(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    disabled={props.disabled}
                    onBlur={onFormChange}
                    value={stCustomerEditLocation}
                >
                    <option value={''}>{i18next.t('page.customer.addAddress.selectState')}</option>
                    {
                        stProvince && stProvince.map((x, index) =>
                            <option value={x.code} key={index}>{x.outCountry}</option>
                        )
                    }
                </AvField>
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.city')}
                    name={'city'}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(65)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterCity')}
                    onChange={e => {
                        setStCustomerEditCity(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    onBlur={onFormChange}
                    value={stCustomerEditCity}
                />
                <AvField
                    disabled={props.disabled}
                    label={i18next.t('page.customers.edit.zipCode')}
                    name={'zipCode'}
                    validate={{
                        ...FormValidate.withCondition(
                            stRequiredEditAddress,
                            FormValidate.required()
                        ),
                        ...FormValidate.maxLength(25)
                    }}
                    placeHolder={i18next.t('page.customer.addAddress.enterZipCode')}
                    onChange={e => {
                        setStCustomerEditZipCode(e.target.value)
                        changeCustomerProfileInfo()
                    }}
                    onBlur={onFormChange}
                    value={stCustomerEditZipCode}
                />
            </div>
        </>
    }

    return (
        <>
            <ConfirmPaymentModal
                toggle={stConfirmPaymentModal.toggle}
                showPS={true}
                debtAmount={stSummary?.debtAmount}
                onConfirm={handleConfirmPayment}
                onClose={togglePaymentConfirmation}
                currency={STORE_CURRENCY_SYMBOL}
            />
            <GSContentContainer isLoading={stIsLoading}
                                confirmWhenRedirect={props.disabledConfirmWhenRedirect ? false : true}
                                confirmWhen={!stOnRedirect}
                                isSaving={stIsSaving}
                                className="customer-editor"
            >
                {stCustomer &&
                <GSContentHeader navigation={BREAD_CRUMB} title={stCustomer.fullName}>
                    <GSContentHeaderRightEl className={style.headerRightElWrapper}>
                        {stCustomer.backupPhone && stCustomer.backupPhone.length === 1
                            ? <CallButton
                                isAutoCall
                                toID={stCustomer.id}
                                toNumber={stCustomer.backupPhone[0]}
                                toName={stCustomer.fullName}
                                style={{"box-shadow": "none", "padding": "0 3.5em"}}
                            />
                            :
                            <GSComponentTooltip message={i18next.t(getOmiToastMessage())}
                                                theme={GSTooltip.THEME.DARK}
                                                disabled={!isDisableCallButton()}>
                                <GSButton
                                    success
                                    onClick={openCallDialogNumber}
                                    marginLeft
                                    className="btn-save"
                                    disabled={isDisableCallButton()}>
                                    <GSImg
                                        src={"/assets/images/call_center/phone.svg"}
                                        width={20}
                                        height={20}/>
                                </GSButton>
                            </GSComponentTooltip>}
                        <GSButton secondary outline onClick={onClickBtnCancel} marginLeft className="btn-cancel">
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success onClick={onClickBtnSave} marginLeft className="btn-save"
                                  disabled={stOnRedirect}>
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>}


                {stCustomer &&
                <GSContentBody size={GSContentBody.size.EXTRA}>
                    {/*CUSTOMER INFO*/}
                    {!props.embeddedFrom &&
                    <div className="customer-editor__tab-header">
                            <span className={cn("d-inline-block customer-editor__tab-item",
                                {'customer-editor__tab-item--active': stCurrentCustomerTab === CUSTOMER_TAB.GENERAL})}
                                  onClick={() => changeCustomerTab(CUSTOMER_TAB.GENERAL)}
                            >
                                <img src="/assets/images/ico-general.svg"/>
                                <GSTrans t="page.customers.edit.tab.general"/>
                            </span>
                        <span className={cn(
                            "d-inline-block customer-editor__tab-item",
                            {'customer-editor__tab-item--active': stCurrentCustomerTab === CUSTOMER_TAB.ACTIVITIES},
                            {'customer-editor__tab-item--disable': !CredentialUtils.getOmiCallEnabled() && !CredentialUtils.getOmiCallExpired()}
                        )}
                              onClick={() => changeCustomerTab(CUSTOMER_TAB.ACTIVITIES)}
                        >
                                <img src="/assets/images/ico-chat-box.svg"/>
                                <GSTrans t="page.customers.edit.tab.activities"/>
                            </span>
                    </div>}
                    <AvForm onValidSubmit={handleValidSubmit} autoComplete="off" onSubmit={handleSubmit}
                            ref={refEditCustomerForm}>
                        <button ref={refSubmit} hidden/>
                        <GSWidget className='mt-0'>

                            <GSWidgetContent
                                className={[style.basicInfoWidget, 'basic-info-widget', (stCurrentCustomerTab === CUSTOMER_TAB.ACTIVITIES ? 'pr-0' : '')].join(" ")}>
                                {/*LEFT COL*/}
                                <div className={[style.basicInfoColLeft, 'basic-info-col-left'].join(" ")}>
                                    <div
                                        className={[style.basicInfoContentWrapper, 'basic-info-content-wrapper'].join(" ")}>
                                        <div className={style.basicInfoAvatar}>
                                            <div className={style.basicInfoAvatar}>
                                                <div className={style.textAvatar}
                                                     style={{
                                                         backgroundImage: `url(${ImageUtils.getImageFromImageModel(stAvatarObj, 100)})`
                                                     }}>
                                                    {!stAvatarObj && renderAvatarName(stCustomer.fullName)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={style.basicInfoMemberSinceFromWrapper}>
                                            {/*MEMBER SINCE*/}
                                            <span>
                                                {
                                                    !stCustomer.guest &&
                                                    <>
                                                        <GSTrans
                                                            t={"page.livechat.customer.details.search.user_type.member"}/> {" "}
                                                        <GSTrans
                                                            t={"page.livechat.customer.details.search.user_type.membersince"}/> {" "}
                                                        {DateTimeUtils.formatDDMMYYY(stCustomer.memberSince)}
                                                    </>
                                                }

                                                {
                                                    stCustomer.guest &&
                                                    <GSTrans
                                                        t={"page.livechat.customer.details.search.user_type.contact"}/>
                                                }

                                            </span>
                                            {/* LOYALTY POINT */}
                                            {loyaltyPointEnabled &&
                                            <span className={style.memberFrom}>
                                                    <GSTrans t={"page.customers.loyaltyPoint.member.available"}/>
                                                    <b className={style.tagGosell}>{loyaltyPoints}</b>
                                                </span>
                                            }
                                            {/* MEMBERSHIP */}
                                            {loyaltyPointEnabled &&
                                            <span className={style.memberFrom}>
                                                    <GSTrans t={"page.customers.membership.label"}/>
                                                    <b className={style.tagGosell}>{stMemberShip}</b>
                                                </span>
                                            }
                                            {/*MEMBER FROM*/}
                                            <span className={style.memberFrom}>
                                                {renderMemberFrom(stCustomer.saleChannel)}
                                            </span>
                                        </div>
                                        {/*BAR CODE*/}
                                        {!stCustomer.guest &&
                                        <div className="customer-editor__bar-code-wrapper">
                                            <BarCode value={customerId}
                                                     fontSize={14}
                                                     height={64}
                                            />
                                        </div>
                                        }


                                        <hr style={{width: '100%'}}/>
                                        {/*GENERAL*/}
                                        {stSummary && stCurrentCustomerTab === CUSTOMER_TAB.GENERAL &&
                                        <div className={style.statisticWrapper}>
                                            {/*TOTAL ORDERS*/}
                                            <div className={style.statisticItem}>
                                                <div className={[style.statisticLeftCol].join(' ')}>
                                                    <GSTrans t={"page.customers.edit.totalOrders"}/>
                                                </div>
                                                <div className={[style.statisticRightCol, style.totalOrder].join(' ')}>
                                                    {CurrencyUtils.formatThousand(stSummary.totalOrder)}
                                                </div>
                                            </div>
                                            {/*TOTAL PURCHASED*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.totalPurchase"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {CurrencyUtils.formatMoneyByCurrency(stSummary.totalPurchase, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                            {/*LAST 3 MONTHS*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.last3Months"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {CurrencyUtils.formatMoneyByCurrency(stSummary.totalPurchaseLast3Month, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                            {/*AVG ORDER*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.averageOrderValue"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {CurrencyUtils.formatMoneyByCurrency(stSummary.averangePurchase, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                            {/*DEBT*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customerList.table.customerInfo.debt"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {stSummary.debtAmount === undefined ? CurrencyUtils.formatMoneyByCurrency(0, STORE_CURRENCY_SYMBOL) : CurrencyUtils.formatMoneyByCurrency(stSummary.debtAmount, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </div>
                                            {
                                                isDisplayConfirmPaymentBtn(stSummary?.debtAmount) && <div className={style.confirmPayment}>
                                                    <GSButton success outline className="btn-print" marginLeft
                                                              onClick={togglePaymentConfirmation}
                                                              id='btn-print'
                                                    >
                                                                <span>
                                                                    <Trans
                                                                        i18nKey="page.orderList.orderDetail.btn.confirmPayment"/>
                                                                </span>
                                                    </GSButton>
                                                </div>
                                            }
                                        </div>}

                                        {/*ACTIVITIES*/}
                                        <div
                                            className={cn(style.statisticWrapper, 'customer-editor__activities-left-col')}
                                            hidden={!(stSummary && stCurrentCustomerTab === CUSTOMER_TAB.ACTIVITIES)}>
                                            {/*FULL NAME*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.fullName"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {stCustomer.fullName}
                                                </div>
                                            </div>
                                            {/*Email*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    Email
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {stCustomer.email}
                                                </div>
                                            </div>
                                            {/*Main phone*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.phone"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {stCustomer.primaryPhone}
                                                </div>
                                            </div>
                                            {/*Tag*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.tags"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    <div className="d-flex pl-3" style={{
                                                        overflowY: 'auto',
                                                        maxHeight: '62px',
                                                        maxWidth: '100%',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'flex-end',
                                                    }}>
                                                        {stCustomer.tags && stCustomer.tags.map(tag => <span
                                                            className="customer-tags">{tag}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                            {/*Note*/}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.note"}/>
                                                </div>
                                                <div className={style.statisticRightCol}>
                                                    {stCustomer.note}
                                                </div>
                                            </div>

                                            {/*<hr/>*/}
                                            {/*Responsible staff */}
                                            {/*<div className={style.statisticItem}>*/}
                                            {/*    <div className={style.statisticLeftCol}>*/}
                                            {/*        <GSTrans t={"page.customers.edit.responsibleStaff"}/>*/}
                                            {/*    </div>*/}
                                            {/*    <div className={cn(style.statisticRightCol, 'customer-editor__full-right-col')}>*/}
                                            {/*        <AvField type='select'*/}
                                            {/*                 onChange={onFormChange}*/}
                                            {/*                 name='responsibleStaffUserId'*/}
                                            {/*                 className="mb-0"*/}
                                            {/*                 defaultValue={stCustomer.responsibleStaffUserId? stCustomer.responsibleStaffUserId:'unassigned'}*/}
                                            {/*        >*/}
                                            {/*            <option value="unassigned">*/}
                                            {/*                {i18next.t("page.customers.edit.staff.unassigned")}*/}
                                            {/*            </option>*/}
                                            {/*            {stStaffList.map(staff => (*/}
                                            {/*                <option value={staff.userId} key={staff.id}>*/}
                                            {/*                    {staff.name}*/}
                                            {/*                </option>*/}
                                            {/*            ))}*/}
                                            {/*        </AvField>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                            {/*Status */}
                                            {/*<div className={style.statisticItem}>*/}
                                            {/*    <div className={style.statisticLeftCol}>*/}
                                            {/*        <GSTrans t={"page.customers.edit.status"}/>*/}
                                            {/*    </div>*/}
                                            {/*    <div className={cn(style.statisticRightCol, 'customer-editor__full-right-col')}>*/}
                                            {/*        <GSDropdownForm*/}
                                            {/*            name={"userStatus"}*/}
                                            {/*            value={stCustomer.userStatus}*/}
                                            {/*            add={addNewStatusItem}*/}
                                            {/*            remove={removeStatusItem}*/}
                                            {/*            updateValue={changeStatusItem}*/}
                                            {/*            onFinish={onFinishChangeStatusItem}*/}
                                            {/*            onChange={onUserDefineStatusFormChange}*/}
                                            {/*            options={stUserDefineStatus.userStatus}>*/}
                                            {/*        </GSDropdownForm>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                        </div>

                                        <div
                                            className={cn(style.statisticWrapper, 'customer-editor__activities-left-col')}
                                            hidden={!(stSummary && stCurrentCustomerTab === CUSTOMER_TAB.GENERAL)}>
                                            <hr/>
                                            {/*Responsible staff */}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.responsibleStaff"}/>
                                                </div>
                                                <div
                                                    className={cn(style.statisticRightCol, 'customer-editor__full-right-col')}>
                                                    <AvField type='select'
                                                             onChange={onFormChange}
                                                             name='responsibleStaffUserId'
                                                             className="mb-0"
                                                             defaultValue={stCustomer.responsibleStaffUserId ? stCustomer.responsibleStaffUserId : 'unassigned'}
                                                    >
                                                        <option value="unassigned">
                                                            {i18next.t("page.customers.edit.staff.unassigned")}
                                                        </option>
                                                        {stStaffList.map(staff => (
                                                            <option value={staff.userId} key={staff.id}>
                                                                {staff.name}
                                                            </option>
                                                        ))}
                                                    </AvField>
                                                </div>
                                            </div>
                                            {/*Status */}
                                            <div className={style.statisticItem}>
                                                <div className={style.statisticLeftCol}>
                                                    <GSTrans t={"page.customers.edit.status"}/>
                                                </div>
                                                <div
                                                    className={cn(style.statisticRightCol, 'customer-editor__full-right-col')}>
                                                    <GSDropdownForm
                                                        name={"userStatus"}
                                                        value={stCustomer.userStatus}
                                                        add={addNewStatusItem}
                                                        remove={removeStatusItem}
                                                        updateValue={changeStatusItem}
                                                        onFinish={onFinishChangeStatusItem}
                                                        onChange={onUserDefineStatusFormChange}
                                                        onUpdate={onSaveChangeStatusItem}
                                                        options={stUserDefineStatus.userStatus}>
                                                    </GSDropdownForm>
                                                </div>
                                            </div>

                                            {/*Partner*/}
                                            {stDropShipActive &&
                                            <div className="assign-partner">
                                                <div className="title">
                                                    <GSTrans t={"page.customers.allCustomer.assignPartner"}/>
                                                </div>
                                                <div className="dropdown partner-dropdown-wrapper" key={stCurrentPartner}>
                                                    <div className="uik-select__wrapper"
                                                         onClick={e => {
                                                             e.preventDefault()
                                                         }}
                                                         id="dropdownPartnerButton"
                                                         data-toggle="dropdown"
                                                         aria-haspopup="true"
                                                         aria-expanded="false">
                                                        <button
                                                            className="btn-segments uik-btn__base uik-select__valueRendered">
                                                        <span className="uik-btn__content">
                                                            <div className="uik-select__valueRenderedWrapper">
                                                                <div className="uik-select__valueWrapper">
                                                                    {stPartnerList.length === 0 && <GSTrans t={"page.customers.allCustomer.noPartnerFound"}/>}
                                                                    {!stCurrentPartner && stPartnerList.length !== 0 &&
                                                                    <GSTrans t={"social.zalo.filter.tags.unassigned"}/>}
                                                                    {stCurrentPartner && stCurrentPartner.name}
                                                                </div>
                                                                <div className="uik-select__arrowWrapper"/>
                                                            </div>
                                                        </span>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu dropdown-menu-right partner-dropdown"
                                                         aria-labelledby="dropdownPartnerButton">
                                                        <div className="partner-item-list" onScroll={onScrollPartnerList}>

                                                            {/*CURRENT SEGMENT*/}
                                                            {stCurrentPartner &&
                                                            <div
                                                                className="partner-item-row"
                                                                onClick={() => onSelectPartner(stCurrentPartner)}
                                                            >
                                                                {stCurrentPartner.name}
                                                                <div className="select__check"/>
                                                            </div>
                                                            }

                                                            {/*LIST*/}
                                                            {stPartnerList.map(segment => {
                                                                if (stCurrentPartner && stCurrentPartner.id === segment.id) return null
                                                                return (
                                                                    <div key={segment.id}
                                                                         className="partner-item-row"
                                                                         onClick={() => onSelectPartner(segment)}
                                                                    >
                                                                        {segment.name}
                                                                    </div>
                                                                )
                                                            })}
                                                            {stPartnerPaging.isLoading &&
                                                            <div className="partner-item-row loading-row">
                                                                <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                                                            </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            }

                                        </div>
                                    </div>
                                </div>

                                {/*GENERAL TAB*/}
                                <div className={style.basicInfoColRight}
                                     hidden={stCurrentCustomerTab !== CUSTOMER_TAB.GENERAL}>
                                    <hr className="d-mobile-block d-desktop-none"/>
                                    <div className={style.basicInfoContentWrapper}>
                                        <div className={style.form}>
                                            {/*FULL NAME*/}
                                            <AvField
                                                disabled={props.disabled}
                                                label={i18next.t("page.customers.edit.fullName")}
                                                name={"fullName"}
                                                validate={{
                                                    ...FormValidate.maxLength(100, true)
                                                }}
                                                defaultValue={stCustomer.fullName}
                                                onChange={changeCustomerProfileInfo}
                                                onBlur={onFormChange}
                                            />

                                            <div className={'row gender-birthday'}>

                                                {/*COMPANY NAME*/}
                                                <AvField
                                                    disabled={props.disabled}
                                                    label={i18next.t("page.customers.edit.CompanyName")}
                                                    name={"companyName"}
                                                    placeholder={i18next.t('page.customer.detail.input.enterCompanyName')}
                                                    validate={{
                                                        ...FormValidate.maxLength(255, true)
                                                    }}
                                                    defaultValue={stCustomer.companyName}
                                                    onChange={changeCustomerProfileInfo}
                                                    onBlur={onFormChange}
                                                />

                                                {/*TAX CODE*/}
                                                <AvField
                                                    disabled={props.disabled}
                                                    label={i18next.t("page.customers.edit.taxCode")}
                                                    name={"taxCode"}
                                                    placeholder={i18next.t('page.customer.detail.input.enterTaxCode')}
                                                    validate={{
                                                        ...FormValidate.maxLength(150, true)
                                                    }}
                                                    defaultValue={stCustomer.taxCode}
                                                    onChange={changeCustomerProfileInfo}
                                                    onBlur={onFormChange}
                                                />

                                            </div>
                                            {/*EMAIL*/}
                                            <AvField
                                                disabled={props.disabled}
                                                label={i18next.t("page.customers.edit.email")}
                                                name={"email"}
                                                type={"email"}
                                                validate={{
                                                    ...FormValidate.email(),
                                                    ...FormValidate.maxLength(100),
                                                    myValidation: phoneOrEmail
                                                }}
                                                defaultValue={stCustomer.email}
                                                onChange={changeCustomerProfileInfo}
                                                onBlur={onFormChange}
                                            />
                                            {/*PHONE*/}
                                            <AvField
                                                disabled={props.disabled}
                                                type={"textarea"}
                                                label={i18next.t("page.customers.edit.phone")}
                                                name={"phone"}
                                                validate={{
                                                    ...FormValidate.maxLength(1_000_000, false),
                                                    ...FormValidate.pattern.numberOrEnter(),
                                                    async: phoneValidate,
                                                    myValidation: phoneOrEmail
                                                }}
                                                defaultValue={buildPhoneValue(stCustomer.backupPhone)}
                                                onChange={changeCustomerProfileInfo}
                                                onBlur={onFormChange}
                                            />
                                            <div className={'row gender-birthday'}>

                                                {/*GENDER*/}
                                                <AvField
                                                    type="select"
                                                    name="gender"
                                                    label={`${i18next.t("page.customers.edit.gender")}`}
                                                    className='dropdown-box w-100'
                                                    value={stCustomer?.gender}
                                                    onBlur={onFormChange}


                                                >
                                                    {GENDER_OPTIONS.map(gender => {
                                                        return (
                                                            <option key={gender.value} value={gender.value}>
                                                                {gender.label}
                                                            </option>
                                                        )
                                                    })}
                                                </AvField>

                                                {/*BIRTHDAY*/}
                                                <div className='birthday-date'
                                                     ref={refOutsideClick}
                                                >
                                                    <p>
                                                        {i18next.t("page.notification.editor.eventBirthday")}
                                                    </p>

                                                    <div className="position-relative">
                                                        <DatePicker
                                                            selected={startDate}
                                                            onChange={(date) => handleChangeBirthday(date)}
                                                            placeholderText="dd/mm/yyyy"
                                                            dateFormat="dd/MM/yyyy"
                                                            dropdownMode="select"
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            adjustDateOnChange
                                                            maxDate={new Date()}
                                                            ref={openBirthday}
                                                        />
                                                        <FontAwesomeIcon onClick={() => {
                                                            openBirthday.current.deferFocusInput()
                                                        }} icon={['far', 'calendar-alt']} color="#939393" style={{
                                                            position: 'absolute',
                                                            right: '1rem',
                                                            top: '12px',
                                                            cursor: "text"
                                                        }}/>
                                                    </div>
                                                </div>

                                            </div>

                                            {/*COUNTRY*/}
                                            <AvField
                                                type="select"
                                                name="country"
                                                label={`${i18next.t("page.customers.edit.country")}`}
                                                className='dropdown-box country'
                                                value={stAddressCustomer?.countryCode || 'VN'}
                                                onBlur={onFormChange}
                                                onChange={e => handleCountry(e.target.value)}
                                            >
                                                {stCountries.map(country => {
                                                    return (
                                                        <option key={country.code} value={country.code}>
                                                            {country.outCountry}
                                                        </option>
                                                    )
                                                })}
                                            </AvField>

                                            {stCustomerEditCountry === Constants.CountryCode.VIETNAM && renderInsideAddressForm()}
                                            {stCustomerEditCountry !== Constants.CountryCode.VIETNAM && renderOutsideAddressForm()}

                                            {/*TAGS*/}
                                            <div className={'form-group form-group-tags'}
                                                 style={{position: 'relative'}}>
                                                <label className="gs-frm-input__label">
                                                    <GSTrans t={"page.customers.edit.tags"}/>
                                                </label>
                                                <div className={style.groupInputTags}>
                                                    <GSTags
                                                        placeholer={''}
                                                        className={style.gsTag}
                                                        onChange={onChangeTags}
                                                        onFilter={onSearchOptionFilter}
                                                        onStyleMenuChange={onStyleMenuChange}
                                                        defaultValue={stTags}
                                                        extensionValue={stSocialTags}
                                                        removeExtension={onRemoveSocialTags}
                                                        limit={false}
                                                        isClearable={false}
                                                        isSearch={true}
                                                        styles={{
                                                            valueContainer: base => ({
                                                                ...base,
                                                                "max-height": '100px',
                                                                'overflow-y': 'auto'
                                                            }),
                                                            menu: base => ({
                                                                ...base,
                                                                ...stStyleMenu,
                                                            })
                                                        }}
                                                        components={Option}
                                                        options={stOptions}
                                                    />
                                                    <i
                                                        className={style.tagsPopup}
                                                        onClick={(e) => onModelShow(e)}
                                                    />
                                                </div>
                                            </div>
                                            {/*NOTE*/}
                                            <AvField
                                                disabled={props.disabled}
                                                label={i18next.t("page.customers.edit.note")}
                                                name={"note"}
                                                type={"textarea"}
                                                validate={{
                                                    ...FormValidate.maxLength(1_000, true)
                                                }}
                                                defaultValue={stCustomer.note}
                                                onChange={changeCustomerProfileInfo}
                                                onBlur={onFormChange}
                                            />
                                            {/*SEGMENT*/}
                                            <div className={style.statisticItem}>
                                                <label className="gs-frm-input__label">
                                                    <GSTrans t={"page.customers.edit.segment.label"}/>
                                                </label>
                                                <div className={style.groupInputTags}>
                                                    <div className="d-flex pl-0" style={{
                                                        overflowY: 'auto',
                                                        maxWidth: 'fit-content',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'flex-start',
                                                        fontSize: '1.1em'
                                                    }}>
                                                        {stSegments && stSegments.map(segment => <span
                                                            className="customer-segments">{segment.name}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                {/*ACTIVITIES*/}
                                <div className={style.basicInfoColRight}
                                     hidden={stCurrentCustomerTab !== CUSTOMER_TAB.ACTIVITIES}>
                                    <CustomerEditorActivityList customerId={stCustomer.id}/>
                                </div>
                            </GSWidgetContent>

                        </GSWidget>
                    </AvForm>

                    {stCurrentCustomerTab === CUSTOMER_TAB.GENERAL && !props.disablePage &&
                    <GSWidget className="mb-3">
                        <GSTab items={TABS}
                               active={!isShowOrder && stCurrentTab === TAB.ORDERS ? null : stCurrentTab}
                               onChangeTab={onChangeTab}
                        />
                        <GSWidgetContent className={style.orderNotificationWrapper}>
                            {/*ORDERS*/}
                            {stCurrentTab === TAB.ORDERS && isShowOrder &&
                            <CustomerOrderList
                                customerId={customerId}
                                userId={userId}
                                saleChannel={saleChannel}
                                history={props.history}
                                openOrderNewTab={true}
                                currency={STORE_CURRENCY_SYMBOL}
                            />
                            }
                            {/*DEBT*/}
                            {stCurrentTab === TAB.DEBT &&
                            <CustomerDebtList
                                customerId={customerId}
                                userId={userId}
                                currency={STORE_CURRENCY_SYMBOL}
                            />
                            }
                            {/*RELATED_ORDERS*/}
                            {stCurrentTab === TAB.RELATED_ORDERS && isShowOrder &&
                            <CustomerRelatedOrderList
                                customerId={customerId}
                                userId={userId}
                                saleChannel={saleChannel}
                                history={props.history}
                                openOrderNewTab={true}
                                currency={STORE_CURRENCY_SYMBOL}
                            />
                            }
                            {/*NOTIFICATION*/}
                            {stCurrentTab === TAB.NOTIFICATION &&
                            <>
                                <div style={{
                                    display: 'flex',
                                    justifyContents: 'space-between'
                                }}>
                                    <GSButtonUpload onUploaded={(files) => {
                                    }}/>
                                </div>
                            </>
                            }
                            {/*CALL CENTER*/}
                            {
                                (CredentialUtils.getOmiCallEnabled() || CredentialUtils.getOmiCallExpired()) && stCurrentTab === TAB.CALL_CENTER &&
                                <div
                                    className={'call-center-page'}
                                >
                                    <GSCallHistoryTable
                                        defaultFilterSearch={
                                            {
                                                "customerId.equals": customerId,
                                            }
                                        }
                                        filterSearch={true}
                                        optionSearch={false}
                                    />
                                </div>
                            }
                        </GSWidgetContent>
                    </GSWidget>}
                    <GSModal title={i18next.t("component.tags.modal.title")}
                             isCustom={true}
                             ref={refModal}
                             theme={GSModalTheme.CUSTOM}
                             content={
                                 <>
                                     <ViewAllTags
                                         tags={[...stTags, ...stSocialTags]}
                                         /* changeTagsList={onChangeTags}*/
                                     />
                                 </>
                             }
                    />
                    <GSModal
                        title={stCustomer.fullName}
                        isCustom={true}
                        ref={refModalCall}
                        theme={GSModalTheme.CUSTOM}
                        content={
                            <>
                                <ViewListPhone
                                    phoneList={stPhones}
                                    customerName={stCustomer.fullName}
                                    customerId={stCustomer.id}
                                />
                            </>
                        }
                    />
                </GSContentBody>}
            </GSContentContainer>
        </>
    );
};

CustomerEditor.propTypes = {
    disabled: PropTypes.bool,
    disabledConfirmWhenRedirect: PropTypes.bool,
    history: PropTypes.any,
    match: PropTypes.any,
    openOrderNewTab: PropTypes.bool,
    noRedirectAfterSave: PropTypes.bool,
    embeddedFrom: PropTypes.oneOf(['FB', 'ZL']),
};
export default React.forwardRef(CustomerEditor);

const Option = props => {
    const {data, innerRef, innerProps} = props;
    return (
        <div key={`${data.value}-${data.number}`}
             className={style.optionItemSelect} {...innerRef} {...innerProps} {...props}>
            <i className={style.optionIconPlus}></i>
            <h6><b>{data.value}</b> <span>{data.number}</span></h6>
        </div>
    );
};

const ViewAllTags = props => {
    /*const onClickRemoveTag = (value) =>{
        _.remove(props.tags, (e, index) => e.value === value)
        props.changeTagsList(props.tags)
    }*/
    return (
        <section className={style.tagsListView}>
            {
                props.tags.map((tag, index) => {
                    return (
                        <ItemTags
                            key={`tags-key-${index}`}
                            tag={tag}
                            /*onClickRemoveTag={onClickRemoveTag}*/
                        />
                    );
                })
            }
        </section>
    );
}

const ViewListPhone = props => {
    return (
        <section className={"phone-list-view"}>
            {
                props.phoneList.map((phone, index) => {
                    return (
                        <PhoneNumberList
                            key={phone}
                            phone={phone}
                            customerName={props.customerName}
                            customerId={props.customerId}
                        />
                    )
                })
            }
        </section>
    );
}

const ItemTags = props => {
    /* const onClickRemoveTag = (value) =>{
         props.onClickRemoveTag(value)
     }*/
    return (
        <div className={style.tagsItem}>
            <div className={style.tagsItemText}>{props.tag.label}</div>
            <div className={style.tagsItemIconDelete}
                /*onClick={()=> onClickRemoveTag(props.tag.value)}*/
            >x
            </div>
        </div>
    );
}

const PhoneNumberList = props => {

    return (
        <div>
            <div className={"phone-item"}>
                <div className={"phone-item-text"}>{props.phone}</div>
                <div className={"phone-item-icon-call"}>
                    <CallButton
                        toID={props.customerId}
                        toNumber={props.phone}
                        toName={props.customerName}
                        isAutoCall
                    />
                </div>
            </div>
        </div>
    );
}

