import React, {useContext, useEffect, useRef, useState} from 'react';
import './OrderInStorePurchaseCustomer.sass';
import GSWidgetContent from '../../../../components/shared/form/GSWidget/GSWidgetContent';
import GSWidget from '../../../../components/shared/form/GSWidget/GSWidget';
import {UikInput} from '../../../../@uik';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {cancelablePromise} from '../../../../utils/promise';
import beehiveService from '../../../../services/BeehiveService';
import i18next from 'i18next';
import Loading, {LoadingStyle} from '../../../../components/shared/Loading/Loading';
import {GSToast} from '../../../../utils/gs-toast';
import {OrderInStorePurchaseContext} from '../context/OrderInStorePurchaseContext';
import {OrderInStorePurchaseContextService} from '../context/OrderInStorePurchaseContextService';
import useDebounceEffect from '../../../../utils/hooks/useDebounceEffect';
import {BCOrderService} from '../../../../services/BCOrderService';
import {CredentialUtils} from '../../../../utils/credential';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import storage from '../../../../services/storage';
import Constants from '../../../../config/Constant';
import {CurrencyUtils, NumberUtils} from '../../../../utils/number-format';
import {Tooltip} from 'react-tippy';
import {CustomerBarCodeScanButton} from './CustomerBarCodeScanButton';
import GSTooltip from '../../../../components/shared/GSTooltip/GSTooltip';
import {useRecoilState, useRecoilValue} from 'recoil';
import {OrderInStorePurchaseRecoil} from '../recoil/OrderInStorePurchaseRecoil';
import {GSAlertModalType} from '../../../../components/shared/GSAlertModal/GSAlertModal';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import {AddressUtils} from '../../../../utils/address-utils';
import GSComponentTooltip from '../../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import $ from 'jquery';
import _ from 'lodash';
import CreateCustomerModal from '../../../customers/List/CreateCustomerModal/CreateCustomerModal'

const SIZE_PER_PAGE = 10;

const COUNTRY_CODE_DEFAULT = CurrencyUtils.getLocalStorageCountry()

const OrderInStorePurchaseCustomer = props => {
    const {state, dispatch} = useContext(OrderInStorePurchaseContext.context);
    const refInputSearch = useRef(null);
    const [stAllCustomerList, setStAllCustomerList] = useState([]);
    const [stCustomerList, setStCustomerList] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 0
    });
    const [stToggleAddCustomerModal, setStToggleAddCustomerModal] = useState(false);
    const [stDisplayCustomerName, setStDisplayCustomerName] = useState("");
    const [customerSummary, setCustomerSummary] = useState({})

    const refAlertModal = useRef();

    const loyaltySetting = useRecoilValue(OrderInStorePurchaseRecoil.loyaltySettingState)
    const storeBranch = useRecoilValue(OrderInStorePurchaseRecoil.storeBranchState)

    const [, setPosScannerState] = useRecoilState(OrderInStorePurchaseRecoil.posScannerState);

    const toggleModalCustomer = (e) => {
        if (e) e.stopPropagation()
        setStToggleAddCustomerModal(toggle => !toggle)
    };

    const onSearchChange = (e) => {
        const keyword = e.currentTarget.value
        dispatch(OrderInStorePurchaseContext.actions.setSearchUserText(keyword))
        setStPaging({
            ...stPaging,
            currentPage: 0
        });
    };

    useDebounceEffect(() => {
        if (stAllCustomerList.length > 0) {
            setStCustomerList([...stCustomerList,
                ...stAllCustomerList.slice(stPaging.currentPage * SIZE_PER_PAGE, (stPaging.currentPage + 1) * SIZE_PER_PAGE)]);
        }
    }, 500, [stPaging.currentPage]);

    useDebounceEffect(() => {
        setStAllCustomerList([]);
        setStCustomerList([]);
        setStPaging(stPaging => ({
            ...stPaging,
            totalPage: 0,
            itemCount: 0,
            currentPage: 0
        }))
        state.searchUserText && fetchData();
    }, 500, [state.searchUserText]);

    useEffect(() => {
        OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, state.productList, storeBranch)
    }, [state.user.userId])

    useEffect(() => {
        if (state.isCustomerNotFound !== undefined) {
            notFoundCustomerPopup()
        }
    }, [state.isCustomerNotFound])

    useEffect(() => {
        if (!state.user.customerName) {
            return
        }

        setStDisplayCustomerName(state.user.customerName + (state.user.customerPhone ? ' - ' + state.user.customerPhone : ''));
    }, [state.user.customerName, state.user.customerPhone])

    useEffect(() => {
        setCustomerSummary(state.customerSummary);
    }, [state.customerSummary])

    // Show tooltip when full address text overflowed
    useEffect(() => {
        console.log({stCustomerList})
        let fullAddresses = $('.card .card-body .full-address');
        if (fullAddresses.length) {
            let customers = [...stCustomerList];
            fullAddresses.each(function(_, element) {
                if (element.offsetHeight < element.scrollHeight) {
                    let id = ~~element.id.split('-').pop();
                    let index = customers.findIndex(x => x.id === id)
                    if (index !== -1)
                        customers[index] = {...customers[index], isFullAddressOverflowed: true}
                }
            })
            if (!_.isEqual(customers, stCustomerList))
                setStCustomerList(customers);
        }
    }, [stCustomerList]);

    const notFoundCustomerPopup = () => {
        refAlertModal.current.openModal({
            type: GSAlertModalType.ALERT_TYPE_INFO,
            messages: (<GSTrans t="customer.scan.by.barcode.notfound"
                                values={{x: state.customerBarcodeScanned}}>
            </GSTrans>),
            modalTitle: i18next.t('common.txt.alert.modal.title'),
            modalBtn: i18next.t('common.btn.alert.modal.close')
        });
    }

    const fetchData = (pageNumber = stPaging.currentPage) => {
        setIsSearching(true);
        const pmGetCustomerList = cancelablePromise(
            beehiveService.getCustomersForPOS(state.searchUserText, pageNumber, SIZE_PER_PAGE)
        );
        pmGetCustomerList.promise
            .then(page => {
                setStCustomerList(pageNumber === 0 ? page.content : [...stCustomerList, ...page.content]);
                setStPaging({
                    ...stPaging,
                    currentPage: pageNumber,
                    totalPage: page.totalPages,
                    totalItem: page.totalElements
                });
                setIsSearching(false);
            })
            .catch(() => {
                setIsSearching(false);
                GSToast.commonError();
            })
    };

    const scrollCustomerList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && stPaging.currentPage + 1 < stPaging.totalPage) {
            fetchData(stPaging.currentPage + 1)
        }
    }

    const closeCustomerList = (e) => {
        setPosScannerState(state => ({
            ...state,
            scannerState: true,
        }))
        setTimeout(() => setShowSearch(e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('gs-mobile-list__row')), 400);
    }

    const openCustomerList = () => {
        setShowSearch(true);
        refInputSearch.current.input.focus();
        setPosScannerState(state => ({
            ...state,
            customerScannerState: false,
            scannerState: false
        }))
    }

    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const selectCustomer = (result) => {
        beehiveService.getCustomerAddress(result.id).then(res => {
                dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({
                    address: res.address || '',
                    address2: res.address2 || '',
                    ward: res.wardCode || '',
                    district: res.districtCode || '',
                    city: res.locationCode || '',
                    countryCode: res.countryCode || COUNTRY_CODE_DEFAULT,
                    outsideCity: res.city || '',
                    zipCode: res.zipCode || '',
                }));
            }
        )

        if (result.userId) {
            BCOrderService.getCustomerSummary(result.userId, result.saleChannel).then(res => {
                dispatch(OrderInStorePurchaseContext.actions.setCustomerSummary({...res, saleChannel: result.saleChannel}));
                }, () => {
                dispatch(OrderInStorePurchaseContext.actions.setCustomerSummary({ saleChannel: result.saleChannel }));
                }
            )
        } else {
            dispatch(OrderInStorePurchaseContext.actions.setCustomerSummary(null));
        }

        setPosScannerState(state => ({
            ...state,
            shouldCustomerScannerActivated: false,
            scannerState: true
        }))
        let getValueTags = [];
        if (result.tags) {
            result.tags.map((item) => {
                getValueTags.push({
                    value: item.value,
                    label: item.value
                })
            })
        }
        dispatch(OrderInStorePurchaseContext.actions.setBuyerId(result.userId));
        dispatch(OrderInStorePurchaseContext.actions.setProfileId(result.id));
        dispatch(OrderInStorePurchaseContext.actions.setUser({
            userId: result.userId,
            name: result.fullName,
            customerName: result.fullName,
            email: result.email,
            phone: result.primaryPhone ? result.primaryPhone : result.phoneBackup,
            customerPhone: result.primaryPhone ? result.primaryPhone : result.phoneBackup,
            guest: result.guest,
            tags: result.tags,
            note: result.note,
            gender:result.gender,
            birthday:result.birthday,
            availablePoint: 0
        }));

        const phone = result.primaryPhone ? result.primaryPhone : result.phoneBackup;
        setStDisplayCustomerName(result.fullName + (phone ? ' - ' + phone : ''));

        // clear error message in the delivery info
        dispatch(OrderInStorePurchaseContext.actions.setErrors({name: false, phone: ''}))

        if (loyaltySetting.isUsePointEnabled && result.userId && !(result.guest > 0)) {
            BCOrderService.getAvailablePointOfUser(CredentialUtils.getStoreId(), result.userId).then(result => {
                dispatch(OrderInStorePurchaseContext.actions.setUser({
                    availablePoint: result.value
                }));
            }).catch(() => {
                GSToast.commonError();
            })
        }

        OrderInStorePurchaseContextService.dispatchUpdateProductList(state, dispatch, state.productList, storeBranch);
    };

    const returnSearch = () => {
        setPosScannerState(state => ({
            ...state,
            shouldCustomerScannerActivated: true
        }))
        dispatch(OrderInStorePurchaseContext.actions.setBuyerId(null));
        dispatch(OrderInStorePurchaseContext.actions.setProfileId(null));
        dispatch(OrderInStorePurchaseContext.actions.setUser({
            userId: undefined,
            name: undefined,
            email: undefined,
            phone: undefined,
            tags: undefined,
            note: undefined,
            gender:undefined,
            birthday:undefined,
            availablePoint: 0
        }));
        dispatch(OrderInStorePurchaseContext.actions.setPointAmount(0));
        dispatch(OrderInStorePurchaseContext.actions.setMaxUsePoint(0));
        dispatch(OrderInStorePurchaseContext.actions.setUsePoint(0));
        dispatch(OrderInStorePurchaseContext.actions.setErrorPointMessage(""));

        dispatch(OrderInStorePurchaseContext.actions.setShippingInfo({
            address: '',
            ward: '',
            district: '',
            city: '',
            countryCode: COUNTRY_CODE_DEFAULT,
            address2: '',
            zipCode: '',
            province: '',
            addressCountry: '',
            cityCountry: '',
            selfDeliveryFee: 0,
            amount: 0,
        }));
        dispatch(OrderInStorePurchaseContext.actions.setUsedDelivery(false))
        
    };

    const handleCreateCustomer = (data) => {
        const requestBody = {
            ...data,
            storeName: storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
            langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
        }
        
        beehiveService.createUserPOSProfile(requestBody)
            .then(result => {
                selectCustomer(result);
                toggleModalCustomer()
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
                    } else {
                        GSToast.commonError();
                    }
                } else {
                    GSToast.commonError();
                }
            })
    };

    function handleScan(data) {
        beehiveService.getCustomerDetail(data).then(result => {
            if (result) {
                selectCustomer(result)
            } else {
                dispatch(OrderInStorePurchaseContext.actions.customerBarcodeNotFound(new Date().getTime()))
                dispatch(OrderInStorePurchaseContext.actions.customerBarcodeScanned(data))
            }
        }).catch(e => {
            GSToast.commonError()
        })
    }

    function loadCustomer(id) {
        beehiveService.getCustomerDetail(id).then(result => {
            selectCustomer(result);
        }).catch(e => {
            GSToast.commonError()
        })
    }

    const handleOpenDetailCustomer = () => {
        if (state.profileId && customerSummary && customerSummary.saleChannel) {
            window.open(NAV_PATH.customers.CUSTOMERS_EDIT + `/${state.profileId}/${state.user.userId}/${customerSummary.saleChannel}`)
        }
    }

    const getAddressByLangKey = customer => {
        const langKey = storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY);
        return langKey === Constants.LanguageKey.VIETNAMESE
            ? customer.fullCustomerAddressInCountry
            : customer.fullCustomerAddressOutCountry;
    };

    return (
        <>
            {/*MODAL ADD CUSTOMER*/}
            <CreateCustomerModal
                toggle={ stToggleAddCustomerModal }
                onToggle={ toggleModalCustomer }
                onValidSubmit={ handleCreateCustomer }
            />
            
            <GSWidget className="order-in-store-purchase-customer mb-2 customer-search-bar">
                {!state.profileId &&
                <GSWidgetContent className="customer-search d-flex flex-column w-100">
                    <div className="search-box__wrapper"
                         onClick={openCustomerList}
                         onBlur={closeCustomerList}
                         id="dropdownSuggestionCustomer"
                    >
                        <UikInput
                            ref={refInputSearch}
                            onChange={onSearchChange}
                            icon={(
                                <FontAwesomeIcon icon="search"/>
                            )}
                            placeholder={i18next.t("page.customers.searchCustomer")}
                            value={state.searchUserText}
                        />
                        <Tooltip arrow followCursor position={"bottom"}
                                 title={i18next.t("page.livechat.customer.details.search.addNewCustomer")}>
                            <a className={'button-add-new'} onClick={toggleModalCustomer}><img
                                src={"/assets/images/icon-plus.svg"} alt="gosellApp" style={{width: '17px'}}/></a>
                        </Tooltip>
                    </div>
                    <div
                        hidden={!showSearch}
                        style={{display: 'flex', top: '12px'}}
                        className="dropdown-menu dropdown-menu-right search-list__result font-weight-normal"
                        onScroll={scrollCustomerList}
                        onBlur={closeCustomerList}>

                        {
                            (!isSearching && (!stCustomerList || stCustomerList.length === 0)) &&
                            <div className="gs-mobile-list__row gs-mobile-list__row-add-customer justify-content-start"
                                 onClick={toggleModalCustomer}>
                                <i className={'icon-add-new'}/>
                                <span>{i18next.t('page.livechat.customer.details.search.addNewCustomer')}</span>
                            </div>
                        }

                        {stCustomerList.map(item => {
                            let fullAddressDiv = () => (
                                <div id={`full-address-${item.id}`} className="full-address line-clamp-2" style={{textOverflow: 'ellipsis', whiteSpace: 'normal'}}>
                                    {getAddressByLangKey(item) || ''}
                                </div>
                            )

                            return (
                                <div className="gs-mobile-list__row"
                                     key={'m' + item.id}
                                     onClick={() => loadCustomer(item.id)
                                     }>
                                    <div className="d-flex flex-column w-100">
                                        <div className="d-flex flex-row justify-content-between">
                                            <div className="mobile-customer-profile-row__info">
                                                <div className="mobile-customer-profile-row__left">
                                                    <div className="full-name">{item.fullName}</div>

                                                </div>
                                                <div className="mobile-customer-profile-row__right">
                                                    ID: {item.id}
                                                </div>
                                            </div>
                                            <div
                                                className="mobile-customer-profile-row__info gs-atm__flex-align-items--end">
                                                <div className="customer-guest">
                                                    {item.guest ?
                                                        <div
                                                            className="customer-type-guest">{i18next.t("page.livechat.customer.details.search.user_type.contact")}</div> :
                                                        <div
                                                            className="customer-type-mem">{i18next.t("page.livechat.customer.details.search.user_type.member")}</div>}

                                                </div>
                                            </div>
                                        </div>
                                        {
                                            (item.primaryPhone || item.email || getAddressByLangKey(item))
                                            &&
                                            <div className="d-flex flex-row">
                                                <div className="card bg-light text-dark my-2 w-100">
                                                    <div className="card-body p-2">
                                                        <div>
                                                            {item.phone || ''}
                                                        </div>
                                                        <div style={{color: '#9EA0A5'}}>
                                                            {item.email || ''}
                                                        </div>
                                                        {
                                                            item.isFullAddressOverflowed
                                                            ? <GSComponentTooltip
                                                                message={getAddressByLangKey(item)}
                                                                placement={GSTooltip.PLACEMENT.BOTTOM}>
                                                                    { fullAddressDiv() }
                                                            </GSComponentTooltip>
                                                            : fullAddressDiv()
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            )
                        })}


                        <div className="gs-mobile-list__row gs-mobile-list__row__lastchild justify-content-center"
                             style={{
                                 height: isSearching ? '100px' : '50px',
                                 display: stCustomerList.length === 0 ? 'flex' : 'none'
                             }}
                        >
                            {isSearching && <Loading style={LoadingStyle.ELLIPSIS_GREY}/>}
                            {
                                (!isSearching && (!stCustomerList || stCustomerList.length === 0) && state.searchUserText) &&
                                i18next.t('page.livechat.customer.details.search.no.result')
                            }
                            {
                                (!isSearching && (!stCustomerList || stCustomerList.length === 0) && !state.searchUserText) &&
                                i18next.t('page.livechat.customer.details.search.no.input')
                            }
                        </div>
                    </div>
                </GSWidgetContent>
                }

                {!state.profileId && <CustomerBarCodeScanButton handleScan={handleScan}/>}

                {state.profileId &&
                <GSWidgetContent className="customer-details-editor d-flex flex-column w-100">
                    <div className={'editor-body d-flex flex-row justify-content-between'}>
                        <div>
                            <div className="show-profile color-blue" onClick={handleOpenDetailCustomer}>
                                {stDisplayCustomerName}
                            </div>
                            { customerSummary && customerSummary.debtAmount !== null && (
                                <div>
                                    <b>{i18next.t('page.customers.edit.debt.title')}: &nbsp; </b>
                                    <span className="color-blue">{CurrencyUtils.formatMoneyByCurrency(customerSummary.debtAmount, CurrencyUtils.getLocalStorageSymbol())}</span>
                                </div>
                            )}
                            {loyaltySetting.enabledPoint && state.user.userId && !(state.user.guest > 0) && <div>
                                {i18next.t('page.livechat.customer.details.search.point')}: &nbsp;
                                {(state.user.availablePoint !== undefined && state.user.availablePoint > 0) ? NumberUtils.formatThousand(state.user.availablePoint) : 0}
                            </div>
                            }
                        </div>
                        <a href="javascript:void(0)" onClick={returnSearch}><img
                            src="/assets/images/icon-closepop-up.png" alt="gosellApp" style={{width: '17px'}}/></a>
                    </div>
                </GSWidgetContent>
                }
            </GSWidget>
        </>
    )
}


OrderInStorePurchaseCustomer.propTypes = {};

export default OrderInStorePurchaseCustomer;
