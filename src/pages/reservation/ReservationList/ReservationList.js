/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 24/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import './ReservationList.sass'
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {UikFormInputGroup, UikInput, UikRadio, UikSelect} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSModalFullBodyMobile from "../../../components/shared/GSModalFullBodyMobile/GSModalFullBodyMobile";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {cancelablePromise} from "../../../utils/promise";
import {CurrencyUtils, NumberUtils} from "../../../utils/number-format";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import {OrderService} from "../../../services/OrderService";
import {AvField, AvForm} from 'availity-reactstrap-validation'
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import * as queryString from 'query-string';
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag";
import {TokenUtils} from '../../../utils/token';
import {STAFF_PERMISSIONS} from '../../../config/staff-permissions';
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import useDebounceEffect from '../../../utils/hooks/useDebounceEffect'


const STATUS = {
    TO_CONFIRM : 'ORDERED',
    CONFIRMED : 'IN_DELIVERY',
    COMPLETED : 'DELIVERED',
    CANCELLED : 'CANCELLED',
}


const SIZE_PER_PAGE = 100

const STORE_CURRENCY_SYMBOL = CurrencyUtils.getLocalStorageSymbol()

const ReservationList = props => {
    const currentDate = moment();
    const following90DaysDate = moment().add(90, 'days');

    const DATE_RANGE_LOCATE_CONFIG = {
        UI_DATE_FORMAT: "DD-MM-YYYY",
        SERVER_DATE_FORMAT: "YYYY-MM-DD",
        format: "DD-MM-YYYY",
        applyLabel: i18next.t("component.order.date.range.apply"),
        cancelLabel: i18next.t("component.order.date.range.cancel")
    }

    const STATUS_FILTER_OPTIONS = [
        {
            value: 'ALL',
            label: i18next.t('page.reservation.list.status.all')
        },
        {
            value: STATUS.TO_CONFIRM,
            label: i18next.t('page.reservation.list.status.to_confirm')
        },
        {
            value: STATUS.CONFIRMED,
            label: i18next.t('page.reservation.list.status.confirmed')
        },
        {
            value: STATUS.COMPLETED,
            label: i18next.t('page.reservation.list.status.completed')
        },
        {
            value: STATUS.CANCELLED,
            label: i18next.t('page.reservation.list.status.cancelled')
        }
    ]


    // IN CASE FROM HONE PAGE
    const param = queryString.parse(props.location.search)

    const [stIsFetching, setStIsFetching] = useState(true);
    const [stItemList, setStItemList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalPage: 0,
        totalItem: 0,
        currentPage: 1
    });
    const [searchType, setSearchType] = useState([
        {value : 'ALL', label : i18next.t('page.reservation.list.search_type.ALL')},
        {value : 'BOOKING_ID', label : i18next.t('page.reservation.list.search_type.BOOKING_ID')},
        {value : 'CUSTOMER_NAME', label : i18next.t('page.reservation.list.search_type.CUSTOMER_NAME')},
        {value : 'PHONE_NUMBER', label : i18next.t('page.reservation.list.search_type.PHONE_NUMBER')},
        {value : 'CUSTOMER_BARCODE', label : i18next.t('page.reservation.list.search_type.CUSTOMER_BARCODE')}
    ]);
    const [stFilterConfig, setStFilterConfig] = useState({
        status: (param && param.status) ? param.status : 'ALL',
        keyword: '',
        startTime: currentDate,
        endTime: following90DaysDate,
        searchType: 'ALL'
    });
    const [stIsFilterMobileShow, setStIsFilterMobileShow] = useState(false);
    const [stFilterCount, setStFilterCount] = useState(0);
    const refTimeout = useRef(null);
    

    useDebounceEffect(() => {
        if(TokenUtils.isStaff() && !TokenUtils.isHasStaffPermission(STAFF_PERMISSIONS.RESERVATIONS)) {
            RouteUtils.toNotFound(this.props);
        }
        fetchData()
    }, 100, [stFilterConfig, stPaging.currentPage]);

    /////////////////////////////////////////////////////////COMMON//////////////////////////////////////////////////////////
    const fetchData = () => {
        setStIsFetching(true)

        const convertDateToISO = (text, suffix) => {
            if (text) {
                return moment(text, DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT).format(DATE_RANGE_LOCATE_CONFIG.SERVER_DATE_FORMAT) + suffix;
            }
        };

        const pmGetReservationList = cancelablePromise(
            OrderService.getListReservation({
                page: stPaging.currentPage - 1,
                size: SIZE_PER_PAGE,
                search: stFilterConfig.keyword,
                searchType: stFilterConfig.searchType === 'ALL' ? null : stFilterConfig.searchType,
                statusList: stFilterConfig.status === 'ALL' ? null : stFilterConfig.status,
                startTime: convertDateToISO(stFilterConfig.startTime, "T00:00:00.000Z"),
                endTime: convertDateToISO(stFilterConfig.endTime, "T23:59:59.000Z")
            })
        )

        pmGetReservationList.promise
            .then(result => {
                const totalItem = parseInt(result.headers['x-total-count'])
                setStItemList(result.data)
                setStPaging({
                    ...stPaging,
                    totalPage: Math.ceil(totalItem / SIZE_PER_PAGE),
                    totalItem: totalItem
                })
                setStIsFetching(false)
            })
            .catch(e => {
                setStIsFetching(false)
            })
    }

    const clearDate = (event, picker) => {
        setStFilterConfig({
            ...stFilterConfig,
            startTime : null,
            endTime : null
        })
    }

    const onChangePage = (pageNumber) => {
        setStPaging({
            ...stPaging,
            currentPage: pageNumber
        })
    }

    const onClickReservationRow = (id) => {
        RouteUtils.linkTo(props, NAV_PATH.reservationDetail + `/${id}`)
    }

    const changeSearchTypeValue = (value) => {
        setStFilterConfig({
            ...stFilterConfig,
            searchType : value
        })
    }

    /////////////////////////////////////////////////////////DESKTOP//////////////////////////////////////////////////////////
    const onKeyPressSearch = (e) => {
        clearTimeout(refTimeout.current)
        const data = e.currentTarget.value;
        refTimeout.current = setTimeout( () => {
            setStFilterConfig({
                ...stFilterConfig,
                keyword: data
            })
            setStPaging({
                ...stPaging,
                currentPage: 1
            })
        }, 500) 
    }

    const onChangeStatusChannel = (e) => {
        setStFilterConfig({
            ...stFilterConfig,
            status: e.value
        })
    }

    const selectRangeDate = (event, picker) =>{
        setStFilterConfig({
            ...stFilterConfig,
            startTime : picker.startDate,
            endTime : picker.endDate
        })
    }

    const getInputTextDate = () => {
        if (stFilterConfig.startTime && stFilterConfig.endTime) {
            return stFilterConfig.startTime.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT) + ' - ' + stFilterConfig.endTime.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT);
        } else {
            return i18next.t("page.reservation.list.search.allTime");
        }
    }

    const renderOrderStatus = (status) => {
        let text;
        let applyClass;

        if(status === 'ORDERED'){
            text = i18next.t('page.reservation.detail.to_confirm')
            applyClass = "to_confirm"
            return <GSStatusTag tagStyle={GSStatusTag.STYLE.PRIMARY} text={text}/>
        } else if(status === 'IN_DELIVERY'){
            text = i18next.t('page.reservation.detail.confirmed')
            applyClass = "confirmed"
            return <GSStatusTag tagStyle={GSStatusTag.STYLE.SUCCESS} text={text}/>
        } else if(status === 'DELIVERED'){
            text = i18next.t('page.reservation.detail.completed')
            applyClass = "completed"
            return <GSStatusTag tagStyle={GSStatusTag.STYLE.SECONDARY} text={text}/>
        } else if(status === 'CANCELLED'){
            text = i18next.t('page.reservation.detail.cancelled')
            applyClass = "cancelled"
            return <GSStatusTag tagStyle={GSStatusTag.STYLE.DANGER} text={text}/>
        } else if(status === 'REJECTED'){
            text = i18next.t('page.reservation.detail.cancelled')
            applyClass = "cancelled"
            return <GSStatusTag tagStyle={GSStatusTag.STYLE.DANGER} text={text}/>
        }

        return (
            <span className={"status-box " + applyClass}>
                {text}
            </span>
        )
    }

    ////////////////////////////////////////////////// MOBILE /////////////////////////////////////////////////
    const mobileRenderStatus = (status) => {
        let text;
        let applyClass;

        if(status === 'ORDERED'){
            text = i18next.t('page.reservation.detail.to_confirm')
            applyClass = "to_confirm"
        } else if(status === 'IN_DELIVERY'){
            text = i18next.t('page.reservation.detail.confirmed')
            applyClass = "confirmed"
        } else if(status === 'DELIVERED'){
            text = i18next.t('page.reservation.detail.completed')
            applyClass = "completed"
        } else if(status === 'CANCELLED'){
            text = i18next.t('page.reservation.detail.cancelled')
            applyClass = "cancelled"
        } else if(status === 'REJECTED'){
            text = i18next.t('page.reservation.detail.cancelled')
            applyClass = "cancelled"
        }

        return (
            <span className={"status-box " + applyClass}></span>
        )
    }

    const filterDateForMobile = (e, picker, action) =>{
        if(action === 'from'){
            setStFilterConfig({
                ...stFilterConfig,
                startTime : picker.startDate
            })
        }else if(action === 'to'){
            setStFilterConfig({
                ...stFilterConfig,
                endTime : picker.endDate
            })
        }
    }

     // load value date for mobile
    const getInputTextDateForMobile = (action) => {
        if(action === 'from'){
            return stFilterConfig.startTime ? stFilterConfig.startTime.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT) : i18next.t('component.order.time.from')
        }else if(action === 'to'){
            return stFilterConfig.endTime ? stFilterConfig.endTime.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT) : i18next.t('component.order.time.to')
        }
    }

    // for mobile filter
    const onChangeFilterStatus = (status) => {
        setStFilterConfig({
            ...stFilterConfig,
            status: status.toUpperCase()
        })
    }

    // for mobile filter
    const toggleFilterMobileModal = () => {
        if(stIsFilterMobileShow){
            setStIsFilterMobileShow(false)
        }else{
            setStIsFilterMobileShow(true)
        }
    }

    // for mobile filter
    const onSubmitFilter = () => {
        toggleFilterMobileModal();

        // count filter for mobile
        let filterCount = 0
        if (stFilterConfig.status && stFilterConfig.status !== 'ALL'){
            filterCount++
        }
        setStFilterCount(filterCount)
    }

    return (
        <>
            {/* MODAL FILTER FOR MOBILE */}
            {stIsFilterMobileShow &&
                    <GSModalFullBodyMobile className="order-mobile-modal__filter-wrapper" title={i18next.t("productList.filter.header.title")}
                                            rightEl={
                                                <GSButton success onClick={onSubmitFilter}>
                                                    <GSTrans t={"common.btn.done"}/>
                                                </GSButton>
                                            }
                    >
                        <div className="filter-modal-wrapper">
                            {/*STATUS FILTER*/}
                            <div className="filter-session">
                                <b className="filter-modal__title">
                                    <GSTrans t={"component.discount.tbl.status"}/>
                                </b>
                                <UikFormInputGroup>
                                    {STATUS_FILTER_OPTIONS.map(status => {
                                        return (
                                            <UikRadio
                                                defaultChecked={stFilterConfig.status === status.value.toUpperCase()}
                                                key={status.value}
                                                value={status.value}
                                                label={status.label}
                                                name="statusFilterGr"
                                                onClick={() => onChangeFilterStatus(status.value)}
                                            />
                                        )
                                    })}
                                </UikFormInputGroup>
                            </div>
                        </div>
                    </GSModalFullBodyMobile>
            }

            {/* MAIN CONTAINER */}
            <GSContentContainer className="reservation-list" minWidthFitContent>
            <GSContentHeader title={
                <GSContentHeaderTitleWithExtraTag
                    title={i18next.t('page.reservation.title')}
                    extra= {stPaging.totalItem}/>
            }>
            <HintPopupVideo title={"Reservation status , edit service"}
            category={"RESERVATION_MANAGEMENT"}
            />
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX} className="reservation-list__body">
                <GSWidget>
                    <GSWidgetContent>


                        {/*DESKTOP*/}
                        <section className={"reservation-list__filter-container d-mobile-none d-desktop-flex " + (stIsFetching? 'gs-atm--disable':'')}>
                            {/*SEARCH*/}

                      

                            <span style={{marginRight: 'auto'}}>
                                <UikInput
                                    onChange={onKeyPressSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={
                                        i18next.t(`page.reservation.list.search_type.${stFilterConfig.searchType}_hint`)
                                    }
                                />
                            </span>

                                
                            <span style={{marginRight: 'auto'}} className="gs-search-box__wrapper">
                            <UikSelect
                                    defaultValue={stFilterConfig.searchType}
                                    options={ searchType }
                                    onChange={ (item) => changeSearchTypeValue(item.value)}
                                />
                            </span>
                            

                            




                            <AvForm className="date-time__range">
                            <DateRangePicker 
                                        minimumNights={0}
                                        locale={DATE_RANGE_LOCATE_CONFIG}
                                        containerClass={"frm-date-picker"}
                                        onApply={selectRangeDate}
                                        onCancel={clearDate}
                                        startDate={stFilterConfig.startTime ? stFilterConfig.startTime.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT) : moment()}
                                        endDate={stFilterConfig.endTime ? stFilterConfig.endTime.format(DATE_RANGE_LOCATE_CONFIG.UI_DATE_FORMAT) : moment()}
                                    >
                                        <AvField
                                            placeholder={i18next.t('page.reservation.list.search.allTime')}
                                            name={'searchDate'}
                                            value={getInputTextDate()}
                                            onKeyPress={ e => e.preventDefault()}
                                        />
                                        <span className="calendar-icon">
                                            <FontAwesomeIcon  icon={['far', 'calendar-alt']}/>
                                        </span>
                            </DateRangePicker>
                            </AvForm>
                            {/*CHANNEL*/}
                            <UikSelect
                                defaultValue={stFilterConfig.status}
                                options={ STATUS_FILTER_OPTIONS }
                                onChange={onChangeStatusChannel}
                            />
                        </section>
                        <section className="customer-list__list-container d-mobile-none d-desktop-table">
                            {!stIsFetching &&
                            <PagingTable
                                headers={[
                                    i18next.t('page.reservation.list.id'),
                                    i18next.t('page.reservation.list.name'),
                                    i18next.t('page.reservation.list.status'),
                                    i18next.t('page.reservation.list.arrival'),
                                    i18next.t('page.reservation.list.customer'),
                                    i18next.t('page.reservation.list.customer_barcode'),
                                    i18next.t('page.reservation.list.qty'),
                                    i18next.t('page.reservation.list.total'),
                                ]}
                                currentPage={stPaging.currentPage}
                                totalPage={stPaging.totalPage}
                                maxShowedPage={10}
                                totalItems={stPaging.totalItem}
                                onChangePage={onChangePage}
                                hidePagingEmpty
                                className="d-mobile-none d-desktop-block"
                            >
                                {stItemList.map(item => {
                                        return (
                                            <section key={item.bookingId} onClick={() => onClickReservationRow(item.bookingId)} className="gs-table-body-items cursor--pointer gsa-hover--gray">
                                                <div className="gs-table-body-item booking-id">
                                                    <span>{'#' + item.bookingId}</span>
                                                </div>
                                                <div className="gs-table-body-item service-name">
                                                    <div className="full-name">{item.serviceName}</div>
                                                </div>
                                                <div className="gs-table-body-item status">
                                                    {renderOrderStatus(item.status)}
                                                </div>
                                                <div className="gs-table-body-item arrival-date">
                                                    {moment(item.arrivalDateTime).utc().format("DD-MM-YYYY")}
                                                    <br/>
                                                    <span className="grey-font">
                                                        {moment(item.arrivalDateTime).utc().format("HH:mm")}
                                                    </span>
                                                </div>
                                                <div className="gs-table-body-item customer-name">
                                                    <div className="full-name">{item.customerName}</div>
                                                    <span className="grey-font">{item.phone}</span>
                                                </div>
                                                <div className="gs-table-body-item customer-barcode">
                                                    <div className="full-name">{item.customerId}</div>
                                                </div>
                                                <div className="gs-table-body-item quantity">
                                                    {NumberUtils.formatThousand(item.quantity)}
                                                </div>
                                                <div className="gs-table-body-item total">
                                                    {CurrencyUtils.formatMoneyByCurrency(item.price, STORE_CURRENCY_SYMBOL)}
                                                </div>
                                            </section>
                                        )
                                    })}
                            </PagingTable>}
                        </section>


                        {/*MOBILE*/}
                        <section className={"reservation-list__filter-container--mobile d-mobile-flex d-desktop-none " + (stIsFetching? 'gs-atm--disable':'')}>
                            {/*SEARCH*/}
                            <div className="row">
                                <div className="col-12 col-sm-12">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                        <UikInput
                                            onKeyPress={onKeyPressSearch}
                                            icon={(
                                                <FontAwesomeIcon icon="search"/>
                                            )}
                                            placeholder={i18next.t(`page.reservation.list.search_type.${stFilterConfig.searchType}_hint`)}
                                        />
                                    </span>
                                    <div className="empty-line" style={{height: '15px'}}></div>
                                    <span style={{marginRight: 'auto'}} className="gs-search-box__wrapper">
                                        <UikSelect
                                                defaultValue={stFilterConfig.searchType}
                                                options={ searchType }
                                                onChange={ (item) => changeSearchTypeValue(item.value)}
                                            />
                                    </span>
                                </div>
                            </div>
                            {/* TIME FILTER */}
                            <div className="row">
                                <div className="col-6 col-sm-6">
                                    <DateRangePicker 
                                        minimumNights={0}
                                        onApply={(e, pickup) => filterDateForMobile(e, pickup, 'from')} 
                                        locale={DATE_RANGE_LOCATE_CONFIG}
                                        onCancel={clearDate}
                                        singleDatePicker
                                    >
                                        <input type="text" 
                                            onChange={() => {}} 
                                            value={getInputTextDateForMobile('from')} 
                                            className="form-control"
                                            onKeyPress={ e => e.preventDefault()}
                                        />
                                        <FontAwesomeIcon icon="calendar" color="#939393" size="lg"/>
                                    </DateRangePicker>
                                </div>
                                <div className="col-6 col-sm-6">
                                    <DateRangePicker 
                                        minimumNights={0}
                                        onApply={(e, pickup) => filterDateForMobile(e, pickup, 'to')}  
                                        locale={DATE_RANGE_LOCATE_CONFIG}
                                        onCancel={clearDate}
                                        singleDatePicker
                                    >
                                        <input type="text" 
                                            onChange={() => {}} 
                                            value={getInputTextDateForMobile('to')} 
                                            className="form-control"
                                            onKeyPress={ e => e.preventDefault()}
                                        />
                                        <FontAwesomeIcon icon="calendar" color="#939393" size="lg"/>
                                    </DateRangePicker>
                                </div>
                            </div>
                            {/* STATUS FILTER */}
                            {/* FILTER */}
                            <div className="row">
                                <div className="col-6 col-sm-6">
                                    <div className="btn-filter" onClick={toggleFilterMobileModal}>
                                        <span>
                                            <GSTrans t="productList.filter.header.title"/>
                                            {' '}
                                            (
                                            {stFilterCount}
                                            )
                                        </span>
                                        <FontAwesomeIcon size="xs" color="gray" className="icon-filter" icon="filter"/>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {stItemList.length > 0 && !stIsFetching &&
                        <section className="gs-mobile-list-container d-mobile-flex d-desktop-none">
                            {stItemList.map(item => {
                                return (
                                    <div className="gs-mobile-list__row" key={'m'+item.bookingId} onClick={() => onClickReservationRow(item.bookingId)}>
                                        <div className="mobile-customer-profile-row__info_left">
                                            <span className="grey-font">
                                                {'#' + item.bookingId}
                                            </span>
                                            <span className="mobile-customer-profile-row__full-name">
                                                {item.serviceName}
                                            </span>
                                        </div>
                                        <div className="mobile-customer-profile-row__info_right">
                                            <div className="status-group">
                                                {mobileRenderStatus(item.status)}
                                                <span className="mobile-customer-profile-row__full-name">{item.customerName}</span>
                                            </div>
                                            <div className="grey-font">{item.phone}</div>
                                        </div>
                                        <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                                            <FontAwesomeIcon icon="chevron-right" style={{marginLeft: '1em'}} color="gray"/>
                                        </div>
                                    </div>
                                )
                            })}
                        </section>}
                        {stIsFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}
                                className="loading-list"
                            />
                        }

                        <PagingTable
                            totalPage={stPaging.totalPage}
                            maxShowedPage={1}
                            currentPage={stPaging.currentPage}
                            onChangePage={onChangePage}
                            totalItems={stItemList.length}
                            className="m-paging d-mobile-flex d-desktop-none"
                        />

                        {stItemList.length === 0 && !stIsFetching &&
                        <GSWidgetEmptyContent
                            iconSrc="/assets/images/icon-reservation-empty.svg"
                            text={stFilterConfig.keyword? i18next.t("common.noResultFound"):i18next.t("page.reservation.list.no_data")}/>
                        }
                    </GSWidgetContent>
                </GSWidget>
                <GSLearnMoreFooter text={i18next.t("title.[/reservation/list]")}
                                   linkTo={'https://huongdan.gosell.vn/faq_category/dat-cho-goweb/'}
                                   marginTop marginBottom/>
            </GSContentBody>
        </GSContentContainer>
        </>
    );
};

ReservationList.propTypes = {

};

export default ReservationList;
