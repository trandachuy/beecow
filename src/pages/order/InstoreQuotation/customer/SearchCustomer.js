/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/12/2020
 * Author: Dinh Vo <dinh.vo@mediastep.com>
 *******************************************************************************/
import React, {useContext, useEffect, useRef, useState} from 'react';
import './SearchCustomer.sass';
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import {UikInput} from "../../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {cancelablePromise} from "../../../../utils/promise";
import beehiveService from "../../../../services/BeehiveService";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import CustomerEditor from "../../../customers/Edit/CustomerEditor";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {AvField, AvForm} from "availity-reactstrap-validation";
import {FormValidate} from "../../../../config/form-validate";
import GSTags from "../../../../components/shared/form/GSTags/GSTags";
import style from "../../../customers/Edit/CustomerEditor.module.sass";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {ValidateUtils} from "../../../../utils/validate";
import {GSToast} from "../../../../utils/gs-toast";
import * as _ from "lodash";
import catalogService from "../../../../services/CatalogService";
import storage from "../../../../services/storage";
import Constants from "../../../../config/Constant";
import {ContextQuotation} from "../context/ContextQuotation";
import {ContextQuotationService} from "../context/ContextQuotationService";
import useDebounceEffect from "../../../../utils/hooks/useDebounceEffect";

const SIZE_PER_PAGE = 100;
const PAGE_TYPE_SEARCH = 'search';
const PAGE_TYPE_CUSTOMER_EDITOR = 'customerEditor';
const PAGE_TYPE_ADD_CUSTOMER = 'addCustomer';
const PAGE_TYPE_ADD_GUEST = 'addGuest';
const DEFAULT_COUNTRY_CODE = 'VN';
const SearchCustomer=props=>{
    const {state, dispatch} = useContext(ContextQuotation.context);
    const [stCurrentPage, setStCurrentPage] = useState(PAGE_TYPE_SEARCH);
    const [stItemList, setStItemList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(true);
    const [stMatch, setStMatch] = useState({
        params: {}
    });
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    // const [stKeyword, setStKeyword] = useState('');
    const onSearchChange = (e) => {
        // setStKeyword(e.currentTarget.value);
        const keyword = e.currentTarget.value
        dispatch(ContextQuotation.actions.setSearchUserText(keyword))
        setStPaging({
            ...stPaging,
            currentPage: 1
        });
    };
    const [stTags, setStTags] = useState([]);
    const refSubmit = useRef(null);
    const refSubmitGuest = useRef(null);
    const [stCities, setStCities] = useState([]);
    const [stCityCode, setStCityCode] = useState('');
    const [stDistricts, setStDistricts] = useState([]);
    const [stDistrictCode, setStDistrictCode] = useState('');
    const [stWards, setStWards] = useState([]);
    const [stWardCode, setStWardCode] = useState('');


    useDebounceEffect(() => {
        fetchData();
    }, 500, [state.searchUserText]);

    useEffect(() => {
        let getCities = catalogService.getCitesOfCountry(DEFAULT_COUNTRY_CODE);
        this.pmCities = cancelablePromise(getCities);
        this.pmCities.promise.then((result) => {
            setStCities(result);
        });
    }, []);

    useEffect(() => {
        if (!state.user.userId && stCurrentPage !== PAGE_TYPE_SEARCH) {
            returnSearch()
        }
        ContextQuotationService.dispatchUpdateProductList(state, dispatch, state.productList)
    }, [state.user.userId])

    const fetchData = () => {
        setStIsFetching(true);
        const pmGetCustomerList = cancelablePromise(
            beehiveService.getCustomerList(stPaging.currentPage - 1,
                SIZE_PER_PAGE,
                state.searchUserText,
                undefined,
                '',
                {
                    segmentId: undefined,
                    isOnlyAccount: true
                },
                "",
                true
            )
        );
        pmGetCustomerList.promise
            .then(itemList => {
                setStItemList(itemList.data);
                setStPaging({
                    ...stPaging,
                    totalPage: Math.ceil(itemList.total / SIZE_PER_PAGE),
                    totalItem: itemList.total
                });
                setStIsFetching(false);

            })
            .catch(() => [
                setStIsFetching(false)
            ])

    };

    const selectCustomer = (result) => {
        onClickCustomerRow(result.id, result.userId, result.saleChannel);
        dispatch(ContextQuotation.actions.setUser({
            userId: result.userId,
            name: result.fullName,
            email: result.email,
            phone: result.phoneBackup ? result.phoneBackup.split(',')[0] : ''
        }));

        ContextQuotationService.dispatchUpdateProductList(state, dispatch, state.productList)

        dispatch(ContextQuotation.actions.setErrors({
            name: result.fullName ? false: true,
            phone: result.phoneBackup ? false: true
        }));
    };

    const onClickCustomerRow = (id, userId, saleChannel) => {
        dispatch(ContextQuotation.actions.setBuyerId(userId));
        dispatch(ContextQuotation.actions.setProfileId(id));
        setStMatch({
            ...stMatch,
            params: {
                ...stMatch.params,
                customerId: id,
                userId: userId,
                saleChannel: saleChannel
            }
        });
        setStCurrentPage(PAGE_TYPE_CUSTOMER_EDITOR);
    };

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            currentPage: pageNumber
        });
    };

    const returnSearch = () => {
        setStMatch({
            ...stMatch,
            params: {
                ...stMatch.params,
                customerId: undefined,
                userId: undefined,
                saleChannel: undefined
            }
        });
        dispatch(ContextQuotation.actions.setBuyerId(null));
        dispatch(ContextQuotation.actions.setProfileId(null));
        dispatch(ContextQuotation.actions.setUser({
            userId: undefined,
            name: undefined,
            email: undefined,
            phone: undefined
        }));
        setStCurrentPage(PAGE_TYPE_SEARCH);
    };

    const onClickAddNewCustomer = () => {
        setStCurrentPage(PAGE_TYPE_ADD_CUSTOMER);
    };

    const onClickAddNewGuest = () => {
        setStCurrentPage(PAGE_TYPE_ADD_GUEST);
    };

    const onChangeTags = (value) => {
        setStTags(value);
    };

    const phoneValidate = (value, ctx, input, cb) => {
        ValidateUtils.phoneValidate(i18next, value, ctx, input, cb);
    };

    const handleValidSubmit = (event, value) => {
        const requestBody = {
            storeName: storage.getFromLocalStorage(Constants.STORAGE_KEY_STORE_NAME),
            name: value.fullName,
            phone: value.phone,
            email: value.email,
            note: value.note,
            tags: stTags && stTags.length > 0 ? stTags.map(tagObj => tagObj.value ? tagObj.value : tagObj) : [],
            langKey: storage.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY),
            address: value.address !== '' ? value.address : undefined,
            locationCode: value.cityCode !== '' ? value.cityCode : undefined,
            districtCode: value.districtCode !== '' ? value.districtCode : undefined,
            wardCode: value.wardCode !== '' ? value.wardCode : undefined
        };

        beehiveService.createUserAndCustomerDetail(requestBody)
            .then(result => {
                setStTags([]);
                onClickCustomerRow(result.id, result.userId, result.saleChannel);
                dispatch(ContextQuotation.actions.setUser({
                    userId: result.userId,
                    name: result.fullName,
                    email: result.email,
                    phone: result.phoneBackup
                }));
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

    const handleValidSubmitGuest = (event, value) => {
        const requestBody = {
            fullName: value.fullName,
            phone: value.phone,
            email: value.email
        };

        beehiveService.createCustomerDetailInStore(requestBody)
            .then(result => {
                result.userId = -1 //fakeID -> it's using for detect complete order
                onClickCustomerRow(result.id, result.userId, result.saleChannel);
                dispatch(ContextQuotation.actions.setUser({
                    userId: result.userId,
                    name: result.fullName,
                    email: result.email,
                    phone: result.phoneBackup
                }));
                GSToast.success("page.livechat.customer.details.add.success.msg", true);
            })
            .catch(e => {
                if (e && e.response && e.response.status === 403) {
                    GSToast.error("page.livechat.customer.details.not.permission.msg", true);
                } else {
                    GSToast.commonError();
                }
            })
    };

    const changeCity = (cityCode) => {
        if (_.isEmpty(cityCode)) {
            setStDistricts([]);
            setStDistrictCode('');
            setStWards([]);
            setStWardCode('');
            return;
        }
        setStCityCode(cityCode);
        catalogService.getDistrictsOfCity(cityCode).then(districts => {
            setStDistricts(districts);
            setStDistrictCode('');
            setStWards([]);
            setStWardCode('');
        }, () => {
        });
    };

    const changeDistrict = (districtCode) => {
        if (_.isEmpty(districtCode)) {
            setStWards([]);
            setStWardCode('');
            return;
        }
        setStDistrictCode(districtCode);
        catalogService.getWardsOfDistrict(districtCode).then(wards => {
            setStWards(wards);
            setStWardCode('');
        }, () => {
        });
    };

    const changeWard = (wardCode) => {
        setStWardCode(wardCode);
    };

    return (
        <>
            <GSWidget className="order-in-store-purchase-customer">
                {stCurrentPage === PAGE_TYPE_SEARCH &&
                <GSWidgetContent className="customer-search d-flex flex-column w-100">
                    <div className="search-header">
                        <div className='input-search'>
                            <UikInput
                                value={state.searchUserText}
                                onChange={onSearchChange}
                                iconPosition="left"
                                icon={(
                                    <FontAwesomeIcon icon="search"/>
                                )}
                                placeholder={i18next.t("page.customers.searchByName")}
                            />
                        </div>
                        <div className='btn-add' onClick={onClickAddNewCustomer}>
                            <i className="icon"></i>
                        </div>
                    </div>
                    <div className="search-result gs-atm__scrollbar-1 mt-2">
                        {!_.isEmpty(state.searchUserText) && stItemList.length > 0 && !stIsFetching &&
                        <section className="gs-mobile-list-container pr-2">
                            {stItemList.map(item => {
                                return (
                                    <div className="gs-mobile-list__row"
                                         key={'m' + item.id}
                                         onClick={() => selectCustomer(item)}>
                                        <div className="mobile-customer-profile-row__info">
                                                <div className="full-name">{item.fullName}</div>
                                            <div>
                                                        {item.email}
                                                    </div>
                                            <div>
                                                ID: {item.id}
                                            </div>
                                        </div>
                                        <div
                                            className="mobile-customer-profile-row__info gs-atm__flex-align-items--end">
                                                    <span className="mobile-customer-profile-row__left">
                                                        {item.phoneBackup && item.phoneBackup.split(',')[0]}
                                                    </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </section>}
                        {stIsFetching && !_.isEmpty(state.searchUserText) &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}
                                     className="loading-list"
                            />
                        }

                        {!_.isEmpty(state.searchUserText) &&
                        <PagingTable
                            totalPage={stPaging.totalPage}
                            maxShowedPage={1}
                            currentPage={stPaging.currentPage}
                            onChangePage={onChangePage}
                            totalItems={stItemList.length}
                            className="m-paging"
                        /> }

                        {!_.isEmpty(state.searchUserText) && stItemList.length === 0 && !stIsFetching &&
                        <GSWidgetEmptyContent
                            iconSrc="/assets/images/icom-empty-customerdetails.svg"
                            text={i18next.t("page.livechat.customer.details.search.no.result")}/>
                        }


                        {_.isEmpty(state.searchUserText) &&
                        <div
                            className={["gs-widget-empty-content gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center"].join(' ')}>
                            <div className="gs-widget-empty-content__content-wrapper">
                                <img src="/assets/images/icon-user-check.svg" onClick={onClickAddNewGuest}
                                     className="gs-widget-empty-content__icon mb-3 pointer"
                                     width="48px"
                                     height="48px"
                                />
                                <GSButton default onClick={onClickAddNewGuest}>
                                    <GSTrans t={"page.order.instorePurchase.guestCheckout"}/>
                                </GSButton>
                            </div>
                        </div>
                        }
                    </div>
                </GSWidgetContent>
                }

                {stCurrentPage === PAGE_TYPE_CUSTOMER_EDITOR &&
                <GSWidgetContent className="customer-details-editor d-flex flex-column w-100">
                    <div className={'editor-header'}>
                        <span className={'btn-close__icon'} onClick={returnSearch}>
                            <i className="icon-close"/>
                        </span>
                    </div>
                    <div className={'editor-body'}>
                        <CustomerEditor
                            match={stMatch}
                            history={props.history}
                            disabled={true}
                            disabledConfirmWhenRedirect={true}
                            openOrderNewTab={true}
                            noRedirectAfterSave={true}
                            embeddedFrom="INSTORE_PURCHASE"
                            disablePage="INSTORE_QUOTATION"
                        />
                    </div>
                </GSWidgetContent>
                }

                {stCurrentPage === PAGE_TYPE_ADD_CUSTOMER &&
                <div className={'add-customer-container'}>
                    <div className={'add-customer-header'}>
                        <span>
                            <GSTrans t="page.order.instorePurchase.addCustomer.title">
                              Create new customer
                            </GSTrans>
                        </span>
                    </div>
                    <div className={'add-customer-body customer'}>
                        <AvForm onValidSubmit={handleValidSubmit}>
                            <button ref={refSubmit} hidden/>
                            {/*FULL NAME*/}
                            <AvField
                                label={i18next.t("page.customers.edit.fullName")}
                                name={"fullName"}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(100, true)
                                }}
                            />
                            {/*EMAIL*/}
                            <AvField
                                label={i18next.t("page.customers.edit.email")}
                                name={"email"}
                                type={"email"}
                                validate={{
                                    ...FormValidate.email(),
                                    ...FormValidate.maxLength(100)
                                }}
                            />
                            {/*PHONE*/}
                            <AvField
                                label={i18next.t("page.customers.edit.phone")}
                                name={"phone"}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(1_000_000, false),
                                    ...FormValidate.pattern.numberOrEnter(),
                                    async: phoneValidate
                                }}
                            />
                            {/*TAGS*/}
                            <div className='form-group'>
                                <label className="gs-frm-input__label">
                                    <GSTrans t={"page.customers.edit.tags"}/>
                                </label>
                                <GSTags
                                    placeholer={''}
                                    className={style.gsTag}
                                    onChange={onChangeTags}
                                    defaultValue={stTags}
                                />
                            </div>
                            {/*NOTE*/}

                            <AvField
                                label={i18next.t("page.customers.edit.note")}
                                name={"note"}
                                type={"textarea"}
                                validate={{
                                    ...FormValidate.maxLength(1_000, true)
                                }}
                            />
                            <div hidden={true}>
                                <AvField
                                    label={i18next.t("page.order.create.shipping.address.address")}
                                    name='address'
                                    validate={{
                                        ...FormValidate.maxLength(100)
                                    }}/>
                                <AvField label={i18next.t("common.txt.street.province")}
                                         type="select"
                                         name="cityCode"
                                         value={stCityCode}
                                         onChange={e => changeCity(e.target.value)}>
                                    <option value="">{i18next.t('common.text.select')}</option>
                                    {
                                        stCities.map((x, index) =>
                                            <option value={x.code} key={index}>{x.inCountry}</option>
                                        )
                                    }
                                </AvField>
                                <AvField label={i18next.t("common.txt.street.district")}
                                         type="select"
                                         name="districtCode"
                                         value={stDistrictCode}
                                         onChange={e => changeDistrict(e.target.value)}>
                                    <option value="">{i18next.t('common.text.select')}</option>
                                    {
                                        stDistricts.map((x, index) =>
                                            <option value={x.code} key={index}>{x.inCountry}</option>
                                        )
                                    }
                                </AvField>
                                <AvField label={i18next.t("common.txt.street.ward")}
                                         type="select"
                                         name="wardCode"
                                         validate={{}}
                                         value={stWardCode}
                                         onChange={e => changeWard(e.target.value)}>
                                    <option value="">{i18next.t('common.text.select')}</option>
                                    {
                                        stWards.map((x, index) =>
                                            <option value={x.code} key={index}>{x.inCountry}</option>
                                        )
                                    }
                                </AvField>
                            </div>
                        </AvForm>
                    </div>
                    <div className={'add-customer-footer'}>
                        <GSButton default onClick={returnSearch}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success onClick={() => {
                            refSubmit.current.click()
                        }} className="btn-save">
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                    </div>
                </div>
                }

                {stCurrentPage === PAGE_TYPE_ADD_GUEST &&
                <div className={'add-customer-container quotation'}>
                    <div className={'add-customer-header'}>
                        <span>
                            <GSTrans t="page.order.instorePurchase.addGuest.title">
                              Input customer information
                            </GSTrans>
                        </span>
                    </div>
                    <div className={'add-customer-body guest'}>
                        <AvForm onValidSubmit={handleValidSubmitGuest}>
                            <button ref={refSubmitGuest} hidden/>
                            {/*FULL NAME*/}
                            <AvField
                                label={i18next.t("page.customers.edit.fullName")}
                                name={"fullName"}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(100, true)
                                }}
                            />
                            {/*EMAIL*/}
                            <AvField
                                label={i18next.t("page.customers.edit.email")}
                                name={"email"}
                                type={"email"}
                                validate={{
                                    ...FormValidate.email(),
                                    ...FormValidate.maxLength(100)
                                }}
                            />
                            {/*PHONE*/}
                            <AvField
                                label={i18next.t("page.customers.edit.phone")}
                                name={"phone"}
                                validate={{
                                    ...FormValidate.required(),
                                    ...FormValidate.maxLength(1_000_000, false),
                                    ...FormValidate.pattern.numberOrEnter(),
                                    async: phoneValidate
                                }}
                            />
                        </AvForm>
                    </div>
                    <div className={'add-customer-footer'}>
                        <GSButton default onClick={returnSearch}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success onClick={() => {
                            refSubmitGuest.current.click()
                        }} className="btn-save">
                            <GSTrans t={"common.btn.save"}/>
                        </GSButton>
                    </div>
                </div>
                }
            </GSWidget>
        </>
    );
}
SearchCustomer.propTypes = {};
export default SearchCustomer;
