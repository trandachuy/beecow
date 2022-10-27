import React, {useEffect, useRef, useState} from 'react';
import './CreateModal.sass';
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import i18next from "i18next";
import {bool, func} from "prop-types";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import {UikInput, UikSelect} from "../../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {GSToast} from "../../../../utils/gs-toast";
import {BCOrderService} from "../../../../services/BCOrderService";
import authenticate from "../../../../services/authenticate";
import {CurrencyUtils} from "../../../../utils/number-format";
import moment from "moment";
import Constant from "../../../../config/Constant";
import Constants from "../../../../config/Constant";
import {Trans} from "react-i18next";
import Loading from "../../../../components/shared/Loading/Loading";
import beehiveService from "../../../../services/BeehiveService";

const tableConfig = {
    headerList: [
        // 'check_box_all',
        i18next.t("page.orders.returnOrder.list.modal.orderID"),
        i18next.t("page.orders.returnOrder.list.modal.createdDate"),
        i18next.t("page.orders.returnOrder.list.modal.status"),
        i18next.t("page.orders.returnOrder.list.modal.customer"),
        i18next.t("page.orders.returnOrder.list.modal.deliveryMethod"),
        i18next.t("page.orders.returnOrder.list.modal.total"),
    ],
};
const SEARCH_TYPE = [
    {
    value: 'ORDER_NUMBER',
    label: i18next.t("page.order.list.filter.searchType.ORDER_NUMBER")
    },
    {
        value: 'CUSTOMER_NAME',
        label: i18next.t("page.order.list.filter.searchType.CUSTOMER_NAME")
    }
]


const SIZE_PER_PAGE = 100



const CreateModal = props => {
    const [modal, setModal] = useState(false);

    const toggle = () => {
        props.callback(!modal)
        setModal(modal => !modal)
    };

    const [stSearchParams, setStSearchParams] = useState({
        searchName: '',
        searchType: SEARCH_TYPE[1].value,
    })

    const [stAutomationList, setStAutomationList] = useState([]);
    const [totalPage, setTotalPage] = useState(1);
    const [stTotalCount, setStTotalCount] = useState(0);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stLoadPageFist, setStLoadPageFist] = useState(false);

    const refTimeout = useRef(null);

    useEffect(()=>{
        setModal(props.isModal)
        if(!props.isModal){
            setTimeout(()=>{
                setStSearchParams({
                    ...stSearchParams,
                    searchName: ''
                })
                setStLoadPageFist(true)
            },500)
        }
        if (!stLoadPageFist){
            fetchData(0)
        }
        
    },[props.isModal])

    useEffect(() => {
        if(stLoadPageFist){
            fetchData(0)   
        }
    }, [stSearchParams])

    useEffect(() => {
        if(stLoadPageFist){
            fetchData()
        }
    }, [stPaging.page]);


    const fetchData = (page) => {
        setStIsFetching(true)
        beehiveService.getDashboardOrder(authenticate.getStoreId(), {
            page: page || stPaging.page,
            size: SIZE_PER_PAGE,
            searchType:stSearchParams.searchType,
            searchKeyword: stSearchParams.searchName,
            lstChannel: 'GOSELL,BEECOW',
            orderType:'PRODUCT'

        }).then(result=>{
            const totalItem = parseInt(result.headers['x-total-count']);

            setStAutomationList(result.data)
            setStPaging({
                page: page === undefined ? stPaging.page : page,
                totalItem: result.data.length
            })
            setStTotalCount(totalItem)
            setTotalPage(Math.ceil(totalItem / SIZE_PER_PAGE))

        }).finally(()=>{
            setStIsFetching(false)
        })
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
        setCurrentPage(page)
    }

    const onInputSearch = (e) => {
        clearTimeout(refTimeout.current)
        const data = e.target.value;
        refTimeout.current = setTimeout( () => {
            setStSearchParams({
                ...stSearchParams,
                searchName: data
            })
            setTotalPage(0)
            e.preventDefault()
        }, 500)
    }

    const handleChangeSearchType = (searchType) => {
        setStSearchParams({
            ...stSearchParams,
            searchType: searchType
        })
    }

    const renderDeliveryName = (deliveryName) => {
        if (deliveryName === 'selfdelivery') {
            return i18next.t("page.order.create.print.shippingMethod.selfDelivery")
        } else if (deliveryName === 'ahamove_bike') {
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_BIKE")
        } else if (deliveryName === 'ahamove_truck') {
            return i18next.t("page.order.detail.information.shippingMethod.AHAMOVE_TRUCK")
        }
        return deliveryName
    }

    return (
        <Modal isOpen={modal} toggle={toggle} className={`create-return-order-modal`}>
            <ModalHeader toggle={toggle}>{i18next.t("page.orders.returnOrder.modal.title")}</ModalHeader>
            <ModalBody>
                <>
                    <GSContentContainer minWidthFitContent className="create-modal-list-page">
                        <GSContentBody size={GSContentBody.size.MAX}
                                       className="create-order-list__body-desktop d-desktop-flex">
                            {/*SUPPLIER LIST*/}
                            <GSWidget>
                                <GSWidgetContent className="automation-order-list-widget">
                                    <div
                                        className="n-filter-container d-desktop-flex">
                                        {/*SEARCH*/}
                                        <span style={{
                                            marginRight: 'auto'
                                        }} className="gs-search-box__wrapper d-flex align-items-center">
                                            <UikInput
                                                onChange={onInputSearch}
                                                icon={(
                                                    <FontAwesomeIcon icon="search"/>
                                                )}
                                                placeholder={i18next.t(
                                                    "common.input.searchBy",
                                                    {
                                                        by: i18next.t(
                                                            `page.order.list.filter.searchType.${stSearchParams.searchType}`
                                                        ),
                                                    }
                                                )}
                                                maxLength={50}
                                            />

                                             <UikSelect
                                                 defaultValue={stSearchParams.searchType}
                                                 options={SEARCH_TYPE}
                                                 onChange={(item) => handleChangeSearchType(item.value)}
                                             />

                                        </span>
                                    </div>
                                    <>
                                        <PagingTable
                                            headers={tableConfig.headerList}
                                            totalPage={totalPage}
                                            maxShowedPage={10}
                                            currentPage={currentPage}
                                            onChangePage={onChangePage}
                                            totalItems={stAutomationList.length}
                                            hidePagingEmpty
                                            className="d-desktop-flex"
                                        >
                                            {!stIsFetching && stAutomationList.map((item, index) => {
                                                return (
                                                    <>
                                                        <section
                                                            key={index}
                                                            className="gs-table-body-items gsa-hover--gray cursor--pointer"
                                                            onClick={()=>{
                                                                if (item.status == Constant.ORDER_STATUS_DELIVERED 
                                                                    && (item.shippingMethod == Constant.DeliveryNames.SELF_DELIVERY ||
                                                                        item.inStore == 'INSTORE_PURCHASE')){
                                                                    props.toPageCreateReturnOrder(item.id)
                                                                }else {
                                                                    GSToast.error('page.orders.returnOrder.table.error',true)
                                                                }
                                                            }}
                                                        >

                                                            <div className="shortest-row">
                                                                <div className={`gs-table-body-item`}>
                                                                    {item.id}
                                                                </div>
                                                                <div className={`gs-table-body-item`}>
                                                                    {moment(item.createdDate).format('DD/MM/YYYY')}
                                                                </div>
                                                                <div className={`gs-table-body-item`}>
                                                                    <Trans i18nKey={"page.order.detail.information.orderStatus." + item.status}/>
                                                                </div>
                                                                <div className={`gs-table-body-item`}>
                                                                    {item.customerFullName}
                                                                </div>
                                                                <div className={`gs-table-body-item`}>
                                                                    {
                                                                        item.shippingMethod &&
                                                                        renderDeliveryName(item.shippingMethod)
                                                                    }
                                                                    {
                                                                        (!item.shippingMethod && item.channel !== Constants.SITE_CODE_SHOPEE) &&
                                                                        i18next.t('page.order.create.print.shippingMethod.inStore')
                                                                    }
                                                                    {
                                                                        (!item.shippingMethod && item.channel === Constants.SITE_CODE_SHOPEE) && "-"
                                                                    }
                                                                </div>
                                                                <div className={`gs-table-body-item`}>
                                                                    {CurrencyUtils.formatMoneyByCurrency(item.total, item.currency)}
                                                                </div>

                                                            </div>

                                                        </section>
                                                    </>
                                                )
                                            })
                                            }
                                        </PagingTable>
                                        {
                                            stIsFetching &&
                                            <div  className="flex-grow-1">
                                                <Loading />
                                            </div>
                                        }

                                        {
                                            !stIsFetching && stAutomationList.length === 0 &&
                                            <GSWidgetEmptyContent
                                                iconSrc="/assets/images/icon-Empty.svg"
                                                text={i18next.t('common.noResultFound')}
                                                className="flex-grow-1"
                                                style={{height: "60vh"}}
                                            />
                                        }
                                    </>

                                </GSWidgetContent>
                            </GSWidget>
                        </GSContentBody>
                    </GSContentContainer>
                </>
            </ModalBody>

        </Modal>
    );
};

CreateModal.propTypes = {
    callback:func,
    isModal:bool,
    toPageCreateReturnOrder: func
};

export default CreateModal;
