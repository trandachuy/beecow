import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import "./AffiliateOrder.sass";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import i18next from "i18next";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import {CurrencyUtils, NumberUtils} from "../../../utils/number-format";
import {animated, useSpring} from "react-spring";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import PropTypes from "prop-types";
import Constants from "../../../config/Constant";
import {UikCheckbox, UikSelect} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import moment from "moment";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import GSDateRangePicker from "../../../components/shared/GSDateRangePicker/GSDateRangePicker";
import GSMegaFilter from "../../../components/shared/GSMegaFilter/GSMegaFilter";
import GSMegaFilterRowTag from "../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowTag";
import {RouteUtils} from "../../../utils/route";
import {NavigationPath} from "../../../config/NavigationPath";
import {Link} from "react-router-dom";
import {AffiliateConstant} from "../context/AffiliateConstant";
import {AffiliateContext} from "../context/AffiliateContext";
import GSComponentTooltip from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {GSToast} from "../../../utils/gs-toast";
import GSDropdownAction from "../../../components/shared/GSDropdownAction/GSDropdownAction";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import AvFieldCountable from "../../../components/shared/form/CountableAvField/AvFieldCountable";
import {AvForm} from "availity-reactstrap-validation";
import affiliateService from "../../../services/AffiliateService";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import _ from "lodash";
import GSWidgetLoadingContent from "../../../components/shared/GSWidgetLoadingContent/GSWidgetLoadingContent";
import GSSearchInput from "../../../components/shared/GSSearchInput/GSSearchInput";
import AnimatedNumber from '../../../components/shared/AnimatedNumber/AnimatedNumber';
import i18n from "../../../config/i18n";
import GSImg from "../../../components/shared/GSImg/GSImg";
import { ImageUtils } from "../../../utils/image";
import { ItemUtils } from "../../../utils/item-utils";

const SEARCH_BY = {
    ORDER_ID: "orderId",
    PARTNER: "partner",
};

const MULTI_ACTION_TYPE = {
    REJECT_ORDER: "REJECT_ORDER",
    APPROVE_ORDER: "APPROVE_ORDER",
};

const SIZE_PER_PAGE = 100;

const AffiliateOrder = (props) => {

    const { state } = useContext(AffiliateContext.context);
    const FILTER_ORDER_STATUS_OPTIONS = useMemo(
        () => [
            {
                label: i18next.t`component.custom.page.filter.status.all`,
                value: "ALL",
            },
            ...Object.values(AffiliateConstant.ORDER.PAYMENT).map((status) => ({
                label: i18next.t(
                    `page.affiliate.order.paymentStatus.${status}`
                ),
                value: status,
            })),
        ],
        []
    );

    const FILTER_DELIVERY_STATUS_OPTIONS = useMemo(
        () => [
            {
                label: i18next.t`component.custom.page.filter.status.all`,
                value: "ALL",
            },
            ...Constants.ORDER_STATUS_LIST.map((status) => ({
                label: i18next.t(
                    `page.order.detail.information.orderStatus.${status}`
                ),
                value: status,
            })),
        ],
        []
    );

    const FILTER_APPROVE_STATUS_OPTIONS = useMemo(
        () => [
            {
                label: i18next.t`component.custom.page.filter.status.all`,
                value: "ALL",
            },
            ...Object.values(AffiliateConstant.ORDER.APPROVE_STATUS).map(
                (status) => ({
                    label: i18next.t(
                        `page.affiliate.order.approveStatus.${status}`
                    ),
                    value: status,
                })
            ),
        ],
        []
    );

    const FILTER_PARTNER_STATUS_OPTIONS = useMemo(
        () => [
            {
                label: i18next.t`component.custom.page.filter.status.all`,
                value: "ALL",
            },
            ...Object.values(AffiliateConstant.ORDER.PARTNER_STATUS).map(
                (status) => ({
                    label: i18next.t(
                        `page.affiliate.order.partnerStatus.${status}`
                    ),
                    value: status,
                })
            ),
        ],
        []
    );

    const [stIsFetching, setStIsFetching] = useState(false);
    const [stSearch, setStSearch] = useState({
        keyword: "",
        by: SEARCH_BY.ORDER_ID,
    });
    const [stOrderList, setStOrderList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0,
        fromDate: undefined,
        toDate: undefined,
        bcOrderPayType: FILTER_ORDER_STATUS_OPTIONS[0].value,
        gosellOrderStatus: FILTER_DELIVERY_STATUS_OPTIONS[0].value,
        approveStatus: FILTER_APPROVE_STATUS_OPTIONS[0].value,
        partnerStatus: FILTER_PARTNER_STATUS_OPTIONS[0].value,
    });


    const [getIsprocessing, setIsprocessing] = useState(false); 
    const [getSelectedOrders, setSelectedOrders] = useState([]); 
    const [getIsCheckAll, setIsCheckAll] = useState(false); 
    const [getIsActionToggle, setIsActionToggle] = useState(false); 
    const [getMessageActionBefore, setMessageActionBefore] = useState(''); 
    

    const [getIsShowRejectModal, setIsShowRejectModal] = useState(false);
    const [getRejectReason, setRejectReason] = useState('');
    const refRejectModal = useRef(null);

    const [getIsShowApproveModal, setIsShowApproveModal] = useState(false);
    const [stRevenue, setStRevenue] = useState(0);

    const [stIsShowTooltipAtOrderId, setStIsShowTooltipAtOrderId] =
        useState(null);

    const [stOverTotalSold, setStOverTotalSold] = useState([])
    const [stOpenModalOverTotalSold, setStOpenModalOverTotalSold] = useState(false)
    const [stDefaultPrecision, setStDefaultPrecision] = useState()

    useEffect(() => {
        fetchData(0);
        fetchAndRemoveMultipleAction();
        if(props.currency !== Constants.CURRENCY.VND.SYMBOL){
            setStDefaultPrecision(2)
        }else{
            setStDefaultPrecision(0)
        }
    }, []);

    useEffect(() => {
        fetchData()
    }, [stPaging.page])

    useEffect(() => {
        fetchData()
    }, [stPaging.fromDate, stPaging.toDate, stPaging.gosellOrderStatus, stPaging.bcOrderPayType, stPaging.approveStatus, stPaging.partnerStatus
    , stSearch.keyword, stSearch.by])

    const buildRequestParams = (page) => {
        let request = {
            page: page || stPaging.page,
            size: SIZE_PER_PAGE,
            ['bcOrderPayType.equals']: stPaging.bcOrderPayType,
            ['gosellOrderStatus.equals']: stPaging.gosellOrderStatus,
            ['approveStatus.equals']: stPaging.approveStatus,
            ['createdDate.greaterThan']: stPaging.fromDate,
            ['createdDate.lessThan']: stPaging.toDate,
            ['bcOrderId.equals']: stSearch.by === SEARCH_BY.ORDER_ID? stSearch.keyword?.trim(): undefined,
            ['partner.contains']: stSearch.by === SEARCH_BY.PARTNER? stSearch.keyword?.trim(): undefined,
            ['partnerStatus.equals']: stPaging.partnerStatus
        }

        return _.pickBy(request, value => _.identity(value) && value !== 'ALL')
    }

    const fetchData = (page) => {
        setStIsFetching(true)
        let requestParams = buildRequestParams(page)
        affiliateService.getOrder(requestParams)
            .then(({data, total}) => {
                setStOrderList(data)
                setStPaging((state) => ({
                    ...state,
                    page: page === undefined? stPaging.page:page,
                    totalItem: total
                }));
            })
            .finally(() => {
                setStIsFetching(false)
            })

        const revenueRequest = _.pickBy({...requestParams, page: undefined, size: undefined}, _.identity)
        affiliateService.getTotalRevenueByOrders(revenueRequest)
            .then(revenue => {
                setStRevenue(revenue)
            })
    };

    const fetchAndRemoveMultipleAction = () => {
        // remove the expired multi action
        affiliateService.removeExpiredMultipleActionList().then(res => {

            // after remove the select
            affiliateService.getMultipleActionList().then(res1 => {
                if(res1.data && res1.data.length > 0){
                    // has progress is running
                    const existprogress = res1.data[0];
                    handleMessageMultiAction(existprogress.actionType, JSON.parse(existprogress.actionData).orderNumber);
                }

            }).catch(error => {})
        }).catch(error1 => {})
    }

    const onChangeSearchBy = (option) => {
        setStSearch({
            keyword: "",
            by: option.value,
        });
    };

    const onChangePage = (page) => {
        setStPaging((state) => ({
            ...state,
            page: page - 1,
        }));
    };

    const onFilterByDateChange = (event, picker) => {
        if (event.type === "cancel") {
            setStPaging((state) => ({
                ...state,
                fromDate: undefined,
                toDate: undefined,
            }));
        } else {
            const fromDate = picker.startDate;
            const toDate = picker.endDate;
            setStPaging((state) => ({
                ...state,
                fromDate: fromDate,
                toDate: toDate,
            }));
        }
    };

    const onFilterMegaChange = (values) => {
        setStPaging((state) => ({
            ...state,
            ...values,
        }));
    };

    const resolveOrderDetailUrl = (orderId) => {
        return NavigationPath.orderDetail + "/gosell/" + orderId;
    };

    const isActive = (partnerType) => {
        switch (partnerType) {
            case AffiliateConstant.PARTNER_TYPE.DROP_SHIP:
                if (state.isDropShipActive && !state.isDropShipExpired) {
                    return true;
                }
                break;
            case AffiliateConstant.PARTNER_TYPE.RESELLER:
                if (state.isResellerActive && !state.isResellerExpired) {
                    return true;
                }
                break;
        }
        return false;
    };

    const isShowToolTip = (orderId, partnerType) => {
        const isPartnerActive = isActive(partnerType);
        if (isPartnerActive) {
            return false;
        }
        return !!(
            stIsShowTooltipAtOrderId && stIsShowTooltipAtOrderId === orderId
        );
    };

    const onCheckAll = (e) => {
        const checked = e.target.checked;
        let selectedOrders = getSelectedOrders;

        if (checked) {
            // in case checked
            for (const order of stOrderList) {
                // add all order to list
                if (selectedOrders.filter(orderSelect => order.bcOrderId === orderSelect.bcOrderId).length === 0) {

                    // exceed max
                    if (selectedOrders.length === 200) {
                        GSToast.warning(
                            i18next.t('page.customer.segment.maxProduct', {
                                max: 200
                            })
                        )
                        break
                    } else {
                        selectedOrders.push(order);
                    }
                }
            }

        } else {
            // in case unchecked
            stOrderList.forEach(order => {
                // remove all order of this page from selected list
                selectedOrders = selectedOrders.filter(orderSelect => order.bcOrderId !== orderSelect.bcOrderId);
            })
        }

        // set state
        setIsCheckAll(checked);
        setSelectedOrders(selectedOrders);
    };

    const onCheckRow = (e, order) => {
        let checked = e.target.checked;
        let selectedOrders = getSelectedOrders;

        if (checked === true) {
            // if checked
            // only push if not exist
            if (selectedOrders.filter(orderSelected => orderSelected.bcOrderId === order.bcOrderId).length === 0) {
                // check maximum select
                if (selectedOrders.length === 200) { // exceed max
                    GSToast.warning(
                        i18next.t('page.customer.segment.maxProduct', {
                            max: 200
                        })
                    )
                } else {
                    selectedOrders.push(order);
                }

            }

        } else {
            // uncheck => remove from list
            selectedOrders = selectedOrders.filter(orderSelected => orderSelected.bcOrderId !== order.bcOrderId);
        }

        setSelectedOrders(selectedOrders);
    };

    const onSearch = (keyword) => {
        setStSearch(state => ({
            ...state,
            keyword: keyword
        }))
    }

    const handleMessageMultiAction = (type, numberOrder) => {
        if(MULTI_ACTION_TYPE.APPROVE_ORDER === type){
            setMessageActionBefore(i18next.t('page.affiliate.order.list.message.approving', {number : numberOrder}));
        }else{
            setMessageActionBefore(i18next.t('page.affiliate.order.list.message.rejecting', {number : numberOrder}));
        }
    }

    const resetSelectedAfterTheAction = () => {
        setSelectedOrders([]);

        // refresh to the first page
        fetchData(0);

        // remove the check all
        setIsCheckAll(false);

    }

    const selectActionToggle = (value) => {
        setIsActionToggle(value);
    }

    const showPopupApprove = () => {
        setIsShowApproveModal(true);
        setIsActionToggle(false);
    }

    const closePopupApprove = () => {
        setIsShowApproveModal(false);
    }

    const openDialogApprove = () => {
        setStOpenModalOverTotalSold(true);
    }

    const closeDialogApprove = () => {
        setStOpenModalOverTotalSold(false);
    }

    const doApprove = () => {
        setIsprocessing(true);
        affiliateService.approveOrRejectOrder({
            action : "APPROVE",
            orderIds : getSelectedOrders.map(selectOrder => selectOrder.id)
        }).then(res => {
            // sucess
            closePopupApprove();

            if(res.lstOver && res.lstOver.overTransfers && res.lstOver.overTransfers.length > 0) {
                setStOverTotalSold(res.lstOver.overTransfers);
                openDialogApprove();
                return;
            }

            if(res.existProgress){
                const existprogress = res.lstProgress[0];
                handleMessageMultiAction(existprogress.actionType, JSON.parse(existprogress.actionData).orderNumber);
            } else {
                if(res.success){
                    // now success message
                    GSToast.commonUpdate();
                }
            }

            // reset data of selected
            resetSelectedAfterTheAction();
            
        }).catch(error => {
            GSToast.commonError();
        }).finally(() => {
            setIsprocessing(false);
        })
    }

    const forceOrderApprove = () => {
        affiliateService.approveOrRejectOrder({
            action : "APPROVE",
            forceApprove: true,
            orderIds : getSelectedOrders.map(selectOrder => selectOrder.id)
        }).then(res => {
            GSToast.commonUpdate();
            // reset data of selected
            resetSelectedAfterTheAction();
        })
        .catch(() => GSToast.commonError())
        .finally(() => {
            closeDialogApprove();
        });
    }

    const showPopupReject = () => {
        setIsShowRejectModal(true);
        setIsActionToggle(false);
    }

    const closePopupReject = () => {
        setIsShowRejectModal(false);
    }

    const doReject = () => {
        setIsprocessing(true);
        affiliateService.approveOrRejectOrder({
            action : "REJECT",
            orderIds : getSelectedOrders.map(selectOrder => selectOrder.id),
            rejectReason: getRejectReason
        }).then(res => {
            // sucess
            closePopupReject();
            setIsprocessing(false);

            if(res.success){
                // now show message
                handleMessageMultiAction(MULTI_ACTION_TYPE.REJECT_ORDER, getSelectedOrders.length);
            }else{
               if(res.existProgress){
                   const existprogress = res.lstProgress[0];
                   handleMessageMultiAction(existprogress.actionType, JSON.parse(existprogress.actionData).orderNumber);
               }
            }

            // reset data of selected
            resetSelectedAfterTheAction();

        }).catch(error => {
            GSToast.commonError();
            setIsprocessing(false);
        })
    }

    const renderApproveModal = () => {
        return (
            <Modal isOpen={getIsShowApproveModal} toggle={closePopupApprove} className={`modalApproveOrder`}>
                <ModalHeader className={`text-success`} toggle={closePopupApprove}>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <div style={{fontWeight: "bold"}}><Trans i18nKey="page.affiliate.order.list.popup.approve.subtile"></Trans></div>
                    <div style={{fontStyle: "italic", color: "red", fontSize: "0.8em"}}><Trans i18nKey="page.affiliate.order.list.popup.approve.explaination"></Trans></div>
                </ModalBody>
                <ModalFooter>
                    <GSButton danger onClick={closePopupApprove}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton success marginLeft onClick={doApprove}>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    const renderRejectModal = () => {
        return (
            <Modal isOpen={getIsShowRejectModal} toggle={closePopupReject} className={`modalRejectOrder`}>
                <ModalHeader className={`text-success`} toggle={closePopupReject}>
                    <Trans i18nKey="common.txt.confirm.modal.title"></Trans>
                </ModalHeader>
                <ModalBody>
                    <div style={{fontWeight: "bold"}}><Trans i18nKey="page.affiliate.order.list.popup.reject.subtile"></Trans></div>
                    <div style={{fontStyle: "italic", color: "red", fontSize: "0.8em"}}><Trans i18nKey="page.affiliate.order.list.popup.reject.explaination"></Trans></div>
                    <div style={{marginTop: "30px"}}>
                        <AvForm onSubmit={doReject} autoComplete="off" ref={ref => refRejectModal.current = ref}>
                            <AvFieldCountable
                                name={'reject_reason'}
                                type={'text'}
                                minLength={0}
                                maxLength={250}
                                value={''}
                                tabIndex={1}
                                onChange={(e) => {
                                    setRejectReason(e.currentTarget.value);
                                }}
                                data-sherpherd="reject-reason"
                            />
                        </AvForm>
                    </div>

                </ModalBody>
                <ModalFooter>
                    <GSButton danger onClick={closePopupReject}>
                        <GSTrans t={"common.btn.cancel"}/>
                    </GSButton>
                    <GSButton success marginLeft onClick={() => refRejectModal.current.submit()}>
                        <GSTrans t={"common.txt.alert.modal.btn"}/>
                    </GSButton>
                </ModalFooter>
            </Modal>
        )
    }

    return (
        <>
        {getIsprocessing && <LoadingScreen zIndex={9999}/>}
         {renderApproveModal()} 
        {renderRejectModal()}
        <GSContentContainer className="affiliate-order">
            <GSContentHeader
                title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t(
                            "page.affiliate.order.list.partnerOrders"
                        )}
                        extra={stPaging.totalItem}
                    />
                }
            />
            <GSContentBody
                size={GSContentBody.size.MAX}
                className="d-flex flex-column flex-grow-1"
            >
                <GSWidget className="flex-grow-1 d-flex flex-column mb-0">
                    <GSWidgetHeader
                        className="affiliate-order__widget-header"
                        title={
                            <div className="affiliate-order__widget-header-title">
                                <span className="font-size-1rem affiliate-order__widget-header-order-count">
                                    <img
                                        src="/assets/images/affiliate/order-count.svg"
                                        alt="order-count"
                                        width={28}
                                        height={28}
                                    />
                                    <span className="font-weight-500 color-gray pl-2 pr-3 affiliate-order__widget-header-count-title">
                                        <GSTrans t="page.affiliate.order.list.totalOrders" />
                                        :&nbsp;
                                    </span>
                                        <AnimatedNumber className="font-weight-bold">
                                            { stPaging.totalItem }
                                        </AnimatedNumber>
                                </span>
                                <span className="font-size-1rem affiliate-order__widget-header-revenue-count">
                                    <img
                                        src="/assets/images/affiliate/revenue-count.svg"
                                        alt="order-count"
                                        width={28}
                                        height={28}
                                    />
                                    <span
                                        className="font-weight-500 color-gray pl-2  pr-3 affiliate-order__widget-header-count-title">
                                        <GSTrans t="page.affiliate.order.list.totalRevenue"/>
                                        :&nbsp;
                                    </span>
                                    <AnimatedNumber
                                        className="font-weight-bold" 
                                        currency = { props.currency }
                                        precision = { stDefaultPrecision }
                                    >
                                        { stRevenue }
                                    </AnimatedNumber>
                                </span>
                            </div>
                        }
                    />
                    <GSWidgetContent className="d-flex flex-column flex-grow-1">
                        {/*FILTER*/}
                        <div
                            className={
                                "affiliate-order__filter-container " +
                                (stIsFetching ? "gs-atm--disable" : "")
                            }
                        >
                            {/*SEARCH*/}
                            <div className="d-flex mb-2 mb-md-0">
                                <div className="search">
                                    <GSSearchInput
                                        className="search-input clear-up-down-btn"
                                        icon={
                                            <FontAwesomeIcon icon={"search"} />
                                        }
                                        // defaultValue={this.filterConfig.searchKeyword}
                                        type={stSearch.by === 'orderId'? 'number':'text'}
                                        iconPosition="left"
                                        placeholder={i18next.t(
                                            "common.input.searchBy",
                                            {
                                                by: i18next.t(
                                                    `page.affiliate.order.list.${stSearch.by}`
                                                ),
                                            }
                                        )}
                                        onSearch={onSearch}
                                        liveSearchOnMS={500}
                                        style={{
                                            height: "38px",
                                        }}
                                        defaultValue={stSearch.keyword}
                                        key={stSearch.keyword + '-' + stSearch.by}
                                        maxLength={25}
                                    />
                                </div>
                                <UikSelect
                                    value={[{ value: stSearch.by }]}
                                    options={[
                                        {
                                            value: "orderId",
                                            label: i18next.t(
                                                "page.affiliate.order.list.orderId"
                                            ),
                                        },
                                        {
                                            value: "partner",
                                            label: i18next.t(
                                                "page.affiliate.order.list.partner"
                                            ),
                                        },
                                    ]}
                                    onChange={onChangeSearchBy}
                                    className="affiliate-order__search-option"
                                />
                            </div>

                            <div className="ml-auto d-flex">
                                {/*DATE TIME*/}
                                <GSDateRangePicker
                                    minimumNights={0}
                                    onApply={onFilterByDateChange}
                                    onCancel={onFilterByDateChange}
                                    containerStyles={{
                                        width: "220px",
                                        marginRight: ".5rem",
                                    }}
                                    fromDate={stPaging.fromDate}
                                    toDate={stPaging.toDate}
                                    resultToString
                                    opens={"left"}
                                    readOnly
                                />
                                {/*MEGA FILTER*/}
                                <GSMegaFilter
                                    onSubmit={onFilterMegaChange}
                                    size="medium"
                                >
                                    <GSMegaFilterRowTag
                                        name="bcOrderPayType"
                                        i18Key="page.affiliate.order.list.paymentStatus"
                                        options={FILTER_ORDER_STATUS_OPTIONS}
                                        defaultValue={stPaging.bcOrderPayType}
                                        ignoreCountValue={"ALL"}
                                    />
                                    <GSMegaFilterRowTag
                                        name="gosellOrderStatus"
                                        i18Key="page.affiliate.order.list.deliveryStatus"
                                        options={FILTER_DELIVERY_STATUS_OPTIONS}
                                        defaultValue={stPaging.gosellOrderStatus}
                                        ignoreCountValue={"ALL"}
                                    />
                                    <GSMegaFilterRowTag
                                        name="approveStatus"
                                        i18Key="page.affiliate.order.list.approveStatus"
                                        options={FILTER_APPROVE_STATUS_OPTIONS}
                                        defaultValue={stPaging.approveStatus}
                                        ignoreCountValue={"ALL"}
                                    />
                                    <GSMegaFilterRowTag
                                        name="partnerStatus"
                                        i18Key="page.affiliate.order.list.partnerStatus"
                                        options={FILTER_PARTNER_STATUS_OPTIONS}
                                        defaultValue={stPaging.partnerStatus}
                                        ignoreCountValue={"ALL"}
                                    />
                                </GSMegaFilter>
                            </div>
                        </div>



                        {
                            (getSelectedOrders.length > 0  && !getMessageActionBefore) &&
                            <div className='selected-product d-flex mt-3 font-weight-500 gsa__uppercase font-size-_9em'>
                                <span>
                                    <GSTrans t='page.affiliate.order.list.number.selected' values={{number: getSelectedOrders.length}}/>
                                </span>
                                <GSDropdownAction
                                    className='ml-4'
                                    toggle={getIsActionToggle}
                                    onToggle={selectActionToggle}
                                    actions={[{
                                        label: i18next.t('page.affiliate.order.list.action.approve'),
                                        onAction: showPopupApprove
                                    }, {
                                        label: i18next.t('page.affiliate.order.list.action.reject'),
                                        onAction: showPopupReject
                                    }]}
                                />
                            </div>
                        }

                        {/*TASK LOG*/}
                        {getMessageActionBefore &&
                            <div className="d-flex align-items-center mt-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{
                                    color: '#1665D8'
                                    }}
                                         fill="currentColor" className="bi bi-arrow-repeat gs-ani__rotate" viewBox="0 0 16 16">
                                        <path
                                            d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                        <path fill-rule="evenodd"
                                              d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                                </svg>
                                <span className="pl-2" dangerouslySetInnerHTML={{__html: getMessageActionBefore}}/>
                            </div>
                        }


                        {/*DATA TABLE*/}
                        <div className="d-flex flex-column flex-grow-1 mt-3 affiliate-order__table">
                            <GSTable>
                                <thead>
                                    <tr>
                                        <th className="py-0">
                                            <UikCheckbox
                                                name="check_all"
                                                onChange={onCheckAll}
                                                style={{
                                                    marginRight: 0,
                                                }}
                                                key={'check_all' + getIsCheckAll}
                                                defaultChecked={getIsCheckAll}
                                            />
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.order.list.orderId" />
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.order.list.partnerCode" />
                                        </th>
                                        <th className="text-right">
                                            <GSTrans t="page.affiliate.order.list.totalAmount" />
                                        </th>
                                        <th className="text-right">
                                            <GSTrans t="page.affiliate.order.list.commission" />
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.order.list.paymentStatus" />
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.order.list.deliveryStatus" />
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.order.list.approveStatus" />
                                        </th>
                                        <th>
                                            <GSTrans t="page.affiliate.order.list.orderDate" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!stIsFetching && stOrderList.map((order, index) => {
                                    const isCheck = getSelectedOrders.filter(orderSelect => order.bcOrderId === orderSelect.bcOrderId).length > 0 ? true : false;
                                    return (
                                        <tr
                                            className={
                                                "cursor--pointer " +
                                                (isActive(order.partnerType)
                                                    ? "gsa-hover--gray"
                                                    : "opacity-5")
                                            }
                                            key={order.bcOrderId}
                                            onClick={() => {
                                                if (isActive(order.partnerType) && order.partnerType === AffiliateConstant.PARTNER_TYPE.DROP_SHIP) {
                                                    RouteUtils.redirectWithReload(
                                                        resolveOrderDetailUrl(
                                                            order.bcOrderId
                                                        )
                                                    );
                                                }
                                            }}
                                            onMouseEnter={() => {
                                                setStIsShowTooltipAtOrderId(
                                                    order.bcOrderId
                                                );
                                            }}
                                            onMouseLeave={() =>
                                                setStIsShowTooltipAtOrderId(
                                                    null
                                                )
                                            }
                                        >
                                            <td onClick={(e) => {e.stopPropagation();}}>
                                                <UikCheckbox
                                                    key={order.bcOrderId + '_' + index + isCheck}
                                                    onChange={(e) => onCheckRow(e, order)}
                                                    defaultChecked={isCheck}
                                                />
                                            </td>
                                            <td>
                                                <Link
                                                    to={resolveOrderDetailUrl(
                                                        order.bcOrderId
                                                    )}
                                                    className={!isActive(order.partnerType) || order.partnerType === AffiliateConstant.PARTNER_TYPE.RESELLER? "user-event-disabled":''}
                                                    target={"_blank"}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    {order.bcOrderId}
                                                </Link>
                                            </td>
                                            <td>
                                                <GSComponentTooltip
                                                    message={i18next.t(
                                                        "page.affiliate.order.expiredText"
                                                    )}
                                                    placement={
                                                        GSTooltip.PLACEMENT
                                                            .BOTTOM
                                                    }
                                                    open={isShowToolTip(
                                                        order.bcOrderId,
                                                        order.partnerType
                                                    )}
                                                >
                                                    {order.partnerCode}
                                                </GSComponentTooltip>
                                            </td>
                                            <td className="text-right">
                                                {CurrencyUtils.formatMoneyByCurrency(
                                                    order.bcOrderTotal,
                                                    props.currency
                                                )}
                                            </td>
                                            <td className="text-right">
                                                {CurrencyUtils.formatMoneyByCurrency(
                                                    order.commissionAmount,
                                                    props.currency
                                                )}
                                            </td>
                                            <td>
                                                {order.bcOrderPayType && i18next.t(
                                                    `page.affiliate.order.paymentStatus.${order.bcOrderPayType}`
                                                )}
                                                {!order.bcOrderPayType && '- '}
                                            </td>
                                            <td>
                                                {i18next.t(
                                                    `page.order.detail.information.orderStatus.${order.gosellOrderStatus}`
                                                )}
                                            </td>
                                            <td>
                                                {i18next.t(
                                                    `page.affiliate.order.approveStatus.${order.approveStatus}`
                                                )}
                                            </td>
                                            <td>
                                                {moment(
                                                    order.createdDate
                                                ).format("DD/MM/YYYY")}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </GSTable>

                            {stOrderList.length === 0 && !stIsFetching && (
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/affiliate/icon_orders.svg"
                                    text={i18next.t(
                                        "page.affiliate.order.list.empty"
                                    )}
                                    className="flex-grow-1"
                                />
                            )}

                            {stIsFetching &&
                                <GSWidgetLoadingContent/>
                            }

                            <GSPagination
                                totalItem={stPaging.totalItem}
                                currentPage={stPaging.page + 1}
                                onChangePage={onChangePage}
                                pageSize={SIZE_PER_PAGE}
                            />
                        </div>
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
        <Modal isOpen={stOpenModalOverTotalSold}
            className="modal-confirm-over-total-sold">
            <ModalHeader>{<GSTrans t={"common.txt.confirm.modal.title"}></GSTrans>}</ModalHeader>
            <ModalBody>
                <div className="body-over-total-sold">
                    <div className="table-desc">{i18n.t("page.affiliate.order.modal.overTotalSold.bodyDesc")}</div>
                    <div className="table-content">
                        <table className="table table-sm">
                            <tr className="thead">
                                <th colSpan={2}>{i18n.t("page.affiliate.order.modal.overTotalSold.column.productName")}</th>
                                <th>{i18n.t("page.affiliate.order.modal.overTotalSold.column.totalTransfer")}</th>
                                <th>{i18n.t("page.affiliate.order.modal.overTotalSold.column.partnerSold")}</th>
                                <th>{i18n.t("page.affiliate.order.modal.overTotalSold.column.partnerCode")}</th>
                            </tr>
                            {stOverTotalSold && stOverTotalSold.map(row => {
                                return (
                                    <tr className="tbody">
                                        <td colSpan={2}>
                                            <div class="d-flex  product-thumbnail">
                                                {<GSImg src={ImageUtils.getImageFromImageModel(row.image, 100)}>
                                                </GSImg>}
                                                <div class="d-flex justify-content-center flex-column">
                                                    <h6 class="product-item-row__product-name mb-0">{row.itemName}</h6>
                                                    <span class="product-item-row__variation-name white-space-pre">{ItemUtils.buildFullModelName(row.modelLabel, row.modelValue)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{row.totalTransfered}</td>
                                        <td>{row.totalSold}</td>
                                        <td>{row.partnerCode}</td>
                                    </tr>
                                )
                            })}
                        </table>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <div className="modal-footer-over-total-sold">
                    <div className="modal-footer-over-total-sold-desc">{i18n.t("page.affiliate.order.modal.overTotalSold.footerDesc")}</div>
                    <div className="modal-footer-over-total-sold-action">
                        <GSButton secondary outline onClick={closeDialogApprove}>
                            <GSTrans t={"common.btn.cancel"}/>
                        </GSButton>
                        <GSButton success marginLeft onClick={forceOrderApprove}>
                            <GSTrans t={"common.btn.confirm"}/>
                        </GSButton>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    </>
    );
};

AffiliateOrder.defaultProps = {
    currency: CurrencyUtils.getLocalStorageSymbol(),
};

AffiliateOrder.propTypes = {
    currency: PropTypes.string,
};

export default AffiliateOrder;
