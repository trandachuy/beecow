import React, {useEffect, useMemo, useRef, useState, useCallback} from "react";
import "./BroadcastList.sass";
import i18next from "i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {NAV_PATH} from "../../../../../components/layout/navigation/AffiliateNavigation";
import GSButton from "../../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../../components/shared/GSTrans/GSTrans";
import LoadingScreen from "../../../../../components/shared/LoadingScreen/LoadingScreen";
import GSContentHeader from "../../../../../components/layout/contentHeader/GSContentHeader";
import GSContentContainer from "../../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeaderTitleWithExtraTag
    from "../../../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSContentHeaderRightEl
    from "../../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSContentBody from "../../../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSMegaFilter from "../../../../../components/shared/GSMegaFilter/GSMegaFilter";
import GSMegaFilterRowTag from "../../../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowTag";
import PagingTable from "../../../../../components/shared/table/PagingTable/PagingTable";
import GSWidgetEmptyContent from "../../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {UikInput} from "../../../../../@uik";
import AlertModal from "../../../../../components/shared/AlertModal/AlertModal";
import {RouteUtils} from "../../../../../utils/route";
import facebookService from "../../../../../services/FacebookService";
import GSMegaFilterImageRowSelect
    from "../../../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterImageRowSelect";
import ConfirmModal, {ConfirmModalUtils} from "../../../../../components/shared/ConfirmModal/ConfirmModal";
import {GSToast} from "../../../../../utils/gs-toast";
import moment from "moment";
import GSDateRangePicker from "../../../../../components/shared/GSDateRangePicker/GSDateRangePicker";

const tableConfig = {
    headerList: [
        // 'check_box_all',
        i18next.t("page.facebook.broadcast.header.campaignName"),
        i18next.t("page.facebook.broadcast.header.Status"),
        i18next.t("page.facebook.broadcast.header.sendingStatus"),
        i18next.t("page.facebook.broadcast.header.sendingTime"),
        i18next.t("page.facebook.broadcast.header.totalSent"),
        i18next.t("page.facebook.broadcast.header.successed"),
        i18next.t("page.facebook.broadcast.header.action"),
    ],
};



const SIZE_PER_PAGE = 100


const BroadcastList = (props) => {

    const refAlert = useRef(null)
    const refConfirmDeleteModal = useRef(null)


    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [stSearchParams, setStSearchParams] = useState({
        campaignName: '',
        status: 'ALL',
        sendingStatus: 'ALL',
        fromDate: undefined,
        toDate: undefined,
    })

    const [stBroadcastList, setStBroadcastList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [stTotalCount, setStTotalCount] = useState(0);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [stIsLoading, setStIsLoading] = useState(false);
    const [stPageFbList, setStPageFbList] = useState([
        {label: i18next.t('page.affiliate.partner.filter.commissionRate.all'), value: 'ALL'},
    ]);

    const FILTER_STATUS_OPTIONS = useMemo(() => [
        {
            label: i18next.t`page.analytics.order.filter.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`page.gochat.facebook.automation.filter.draft`,
            value: 'DRAFT'
        },
        {
            label: i18next.t`page.gochat.facebook.automation.filter.active`,
            value: 'ACTIVE'
        }
    ], [])

    const FILTER_SENT_STATUS_OPTIONS = useMemo(() => [
        {
            label: i18next.t`page.analytics.order.filter.all`,
            value: 'ALL'
        },
        {
            label: i18next.t`page.facebook.broadcast.filter.SENT`,
            value: 'SENT'
        },
        {
            label: i18next.t`page.facebook.broadcast.filter.SCHEDULED`,
            value: 'SCHEDULED'
        },
        {
            label: i18next.t`page.facebook.broadcast.filter.NOT_SEND`,
            value: 'NOT_SEND'
        }
    ], [])



    useEffect(() => {
        fetchData(0)
    }, [stSearchParams])

    useEffect(() => {
        fetchData()
    }, [stPaging.page]);

    useEffect(() => {
        facebookService.getRequestToPageChat().then(pageFbList => {

            setStPageFbList(prevState => [...prevState, ...pageFbList.map(b => ({
                label: b.pageName,
                value: b.pageId,
                avatar: b.avatar
            }))])
        })
    }, [])



    const fetchData = (page) => {
        const requestParams = buildRequest()

        facebookService.getListBroadcastByStore(requestParams, page || stPaging.page, SIZE_PER_PAGE)
            .then(res => {
                setStBroadcastList(res.data.lstBroadcast)
                setStPaging({
                    page: page === undefined ? stPaging.page : page,
                    totalItem: res.length
                })
                setStTotalCount(+(res.data.totalItem))
                setTotalPage(Math.ceil(res.data.totalItem / SIZE_PER_PAGE))
            })
            .finally(() => {
            })
    }

    const buildRequest = () => {
        const request = {
            ...stSearchParams
        }
        for (let requestKey in request) {
            if (request[requestKey] === 'ALL') {
                delete request[requestKey]
            }
        }
        return request
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
        setCurrentPage(page)
    }

    const onMegaFilterChange = (values) => {
        setStSearchParams({
            ...stSearchParams,
            ...values
        })

    }

    const onSearchChange = (e) => {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            setStSearchParams({
                ...stSearchParams,
                campaignName: value
            })
            e.preventDefault();
        }, 500)
    }

    const deleteBroadcast = (id) => {
        ConfirmModalUtils.openModal(refConfirmDeleteModal, {
            messages: <><p>{i18next.t(`page.gochat.facebook.automation.delete`)}</p></>,
            modalTitle: i18next.t`page.affiliate.list.deleteConfirmText`,
            okCallback: () => {
                facebookService.deleteBroadcast(id)
                    .then(() => {
                        fetchData()
                        GSToast.commonDelete()
                    })
                    .catch(() => {
                        GSToast.commonError()
                    })
            }
        })
    }

    const onFilterByDateChange = (event, picker) => {
        if (event.type === "cancel") {
            setStSearchParams((state) => ({
                ...state,
                fromDate: undefined,
                toDate: undefined,
            }));
        } else {
            const fromDate = picker.startDate;
            const toDate = picker.endDate;
            setStSearchParams((state) => ({
                ...state,
                fromDate: fromDate,
                toDate: toDate,
            }));
        }
    };

    return (
        <>
            {stIsLoading &&
            <LoadingScreen zIndex={9999}/>
            }
            <ConfirmModal ref={refConfirmDeleteModal} modalClass={"delete-broadcast"}/>
            <GSContentContainer minWidthFitContent className="broadcast-list-page">
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t("page.facebook.broadcast.list.title")}
                        extra={stTotalCount}
                    />
                }
                >
                    <GSContentHeaderRightEl>
                        <GSButton success
                                  linkTo={NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_CREATE}
                        >
                            <GSTrans t="page.gochat.facebook.automation.createCampaign"/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX}
                               className="broadcast-list__body-desktop d-mobile-none d-desktop-flex">
                    {/*SUPPLIER LIST*/}
                    <GSWidget>
                        <GSWidgetContent className="broadcast-list-widget">

                            <div
                                className="n-filter-container d-mobile-none d-desktop-flex">
                                {/*SEARCH*/}
                                <span style={{
                                    marginRight: 'auto',
                                    paddingRight: '10px'
                                }} className="gs-search-box__wrapper">
                                <UikInput
                                    onChange={onSearchChange}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("page.gochat.facebook.automation.filter.search")}
                                    maxLength={100}
                                />

                            </span>
                                <div className="ml-auto d-flex partner-filter">
                                    {/*DATE TIME*/}
                                    <GSDateRangePicker
                                        minimumNights={0}
                                        onApply={onFilterByDateChange}
                                        onCancel={onFilterByDateChange}
                                        containerStyles={{
                                            width: "220px",
                                            marginRight: ".5rem",
                                        }}
                                        fromDate={stSearchParams.fromDate}
                                        toDate={stSearchParams.toDate}
                                        resultToString
                                        opens={"left"}
                                        readOnly
                                    />

                                    <GSMegaFilter size="medium" onSubmit={onMegaFilterChange}>
                                        <GSMegaFilterRowTag name="status"
                                                            i18Key="page.gochat.facebook.automation.filter.status"
                                                            options={FILTER_STATUS_OPTIONS}
                                                            defaultValue={stSearchParams.status}
                                                            ignoreCountValue={'ALL'}

                                        />

                                        <GSMegaFilterRowTag name="sendingStatus"
                                                            i18Key="page.facebook.broadcast.filter.sentStatus"
                                                            options={FILTER_SENT_STATUS_OPTIONS}
                                                            defaultValue={stSearchParams.sendingStatus}
                                                            ignoreCountValue={'ALL'}

                                        />
                                    </GSMegaFilter>
                                </div>
                            </div>
                            <>
                                <PagingTable
                                    headers={tableConfig.headerList}
                                    totalPage={totalPage}
                                    maxShowedPage={10}
                                    currentPage={currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stBroadcastList.length}
                                    hidePagingEmpty
                                    className="d-mobile-none d-desktop-flex"
                                >
                                    {stBroadcastList.map((item, index) => {
                                        return (
                                            <>
                                                <section
                                                    key={index}
                                                    className="gs-table-body-items gsa-hover--gray"

                                                >

                                                    <div className="shortest-row">
                                                        <div className={`gs-table-body-item`}>
                                                            {item.campaignName}
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <span className={ item.status == 'ACTIVE' ? `active` : `draft`}>
                                                                {i18next.t("page.gochat.facebook.automation.status."+item.status)}</span>
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <span className={item.sendingStatus}>
                                                                {i18next.t("page.facebook.broadcast.filter."+item.sendingStatus)}</span>
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            {item.sendTime === undefined ? ''
                                                                : moment(item.sendTime).format('HH:mm') + ' ' + moment(item.sendTime).format('DD-MM-YYYY')}
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            {item.totalSend}
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            {item.totalSend}
                                                        </div>
                                                        <div className={`gs-table-body-item action`}>
                                                            <i className="icon-edit" onClick={()=>RouteUtils.linkTo(props, NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_EDIT + `/${item.id}`)}></i>
                                                            <i className="icon-delete" onClick={()=>deleteBroadcast(item.id)}></i>
                                                        </div>
                                                    </div>

                                                </section>
                                            </>
                                        )
                                    })
                                    }
                                </PagingTable>

                                {stBroadcastList.length === 0 &&

                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/icon-automation-table.png"
                                    text={i18next.t(
                                        "page.gochat.facebook.automation.empty"
                                    )}
                                    className="flex-grow-1"
                                    style={{height: "60vh"}}
                                />

                                }
                            </>

                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>

                <GSContentBody size={GSContentBody.size.MAX}
                               className="broadcast-list__body-mobile d-mobile-flex d-desktop-none">
                    {/*SUPPLIER LIST*/}
                    <GSWidget>
                        <GSWidgetContent className="broadcast-list-widget">
                            <div
                                className="n-filter-container--mobile d-mobile-flex d-desktop-none ">
                                {/*SEARCH*/}
                                <div className="row w-100">
                                    <div className="col-12 col-sm-12 d-flex justify-content-between align-items-center">
                                    <span style={{
                                        marginRight: 'auto',
                                        paddingRight: '10px'
                                    }} className="gs-search-box__wrapper">
                                    <UikInput
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        onChange={onSearchChange}
                                        placeholder={i18next.t("page.gochat.facebook.automation.filter.search")}
                                        maxLength={100}
                                    />

                                </span>
                                        <div className="ml-auto d-flex">
                                            <GSMegaFilter size="medium" onSubmit={onMegaFilterChange}>

                                                <GSMegaFilterRowTag name="status"
                                                                    i18Key="component.custom.page.table.header.status"
                                                                    options={FILTER_STATUS_OPTIONS}
                                                                    defaultValue={stSearchParams.status}
                                                                    ignoreCountValue={'ALL'}

                                                />

                                                <GSMegaFilterRowTag name="sendingStatus"
                                                                    i18Key="page.facebook.broadcast.filter.sentStatus"
                                                                    options={FILTER_SENT_STATUS_OPTIONS}
                                                                    defaultValue={stSearchParams.sendingStatus}
                                                                    ignoreCountValue={'ALL'}

                                                />

                                            </GSMegaFilter>
                                        </div>
                                    </div>
                                    {/*DATE TIME*/}
                                    <GSDateRangePicker
                                        minimumNights={0}
                                        onApply={onFilterByDateChange}
                                        onCancel={onFilterByDateChange}
                                        containerStyles={{
                                            width: "220px",
                                            marginRight: ".5rem",
                                        }}
                                        fromDate={stSearchParams.fromDate}
                                        toDate={stSearchParams.toDate}
                                        resultToString
                                        opens={"left"}
                                        readOnly
                                    />
                                </div>
                            </div>



                            <>
                                <PagingTable
                                    headers={tableConfig.headerList}
                                    totalPage={totalPage}
                                    maxShowedPage={10}
                                    currentPage={currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stBroadcastList.length}
                                    hidePagingEmpty
                                    className="m-paging d-mobile-flex d-desktop-none">
                                    <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">
                                        {
                                            stBroadcastList.map((item, index) => {
                                                return (
                                                    <div key={index}
                                                         className="m-review-row__short"
                                                    >
                                                        <div className={`gs-table-body-item`}>
                                                            {item.campaignName}
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <span className={ item.status == 'ACTIVE' ? `active` : `draft`}>
                                                                {i18next.t("page.gochat.facebook.automation.status."+item.status)}</span>
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            <span className={item.sendingStatus}>
                                                                {i18next.t("page.facebook.broadcast.filter."+item.sendingStatus)}</span>
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            {item.sendTime === undefined ? ''
                                                                : moment(item.sendTime).format('HH:mm') + ' ' + moment(item.sendTime).format('DD-MM-YYYY')}
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            {item.totalSend}
                                                        </div>
                                                        <div className={`gs-table-body-item`}>
                                                            {item.success}
                                                        </div>
                                                        <div className={`gs-table-body-item action`}>
                                                            <i className="icon-edit" onClick={()=>RouteUtils.redirectWithoutReload(props, NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST_EDIT + `/${item.id}`)}></i>
                                                            <i className="icon-delete" onClick={()=>deleteBroadcast(item.id)}></i>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </PagingTable>

                                {stBroadcastList.length === 0 &&
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/icon-automation-table.png"
                                    text={i18next.t(
                                        "page.gochat.facebook.automation.empty"
                                    )}
                                    className="flex-grow-1"
                                    style={{height: "60vh"}}
                                />
                                }
                            </>



                            <div className="paging__footer">
                                <PagingTable
                                    totalPage={totalPage}
                                    maxShowedPage={10}
                                    currentPage={currentPage}
                                    onChangePage={onChangePage}
                                    totalItems={stBroadcastList.length}
                                    hidePagingEmpty
                                    className="m-paging d-mobile-flex d-desktop-none">
                                    <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">

                                    </div>
                                </PagingTable>
                            </div>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
            <AlertModal ref={refAlert}/>
        </>
    )
}


BroadcastList.defaultProps = {}

BroadcastList.propTypes = {}

export default BroadcastList
