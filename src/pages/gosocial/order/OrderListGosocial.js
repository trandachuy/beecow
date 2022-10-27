import React, {useContext, useEffect, useRef, useState} from 'react';
import './OrderListGosocial.sass';
import {Trans} from "react-i18next";
import PropTypes from 'prop-types';
import moment from "moment";
import Loading from "../../../components/shared/Loading/Loading";
import i18next from "i18next";
import {BCOrderService} from "../../../services/BCOrderService";
import {CurrencyUtils} from "../../../utils/number-format";
import {CurrencySymbol} from "../../../components/shared/form/CryStrapInput/CryStrapInput";
import GSOrderStatusTag from "../../../components/shared/GSOrderStatusTag/GSOrderStatusTag";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";

const SIZE_PER_PAGE = 20

const OrderListGosocial = (props) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [stLoadingOrderList, setStLoadingOrderList] = useState(false);
    const [stOrderList, setStOrderList] = useState([]);

    useEffect(() => {
        fetchOrderList(props.userId, currentPage, SIZE_PER_PAGE)
    }, [])

    const fetchOrderList = (buyerId, page, size) => {
        BCOrderService.getCustomerOrderList(buyerId,
            page,
            size,
            undefined,
            "gosell",
            'lastModifiedDate,desc'
        )
            .then(result => {
                setStLoadingOrderList(false)
                setItemCount(+(result.total))
                setTotalPage(Math.ceil(parseInt(result.total) / SIZE_PER_PAGE))
                setStOrderList([...stOrderList, ...result.data])
            })
    }


    const backToPrevious = (callback) => {
        if (props.callback) {
            props.callback(callback);
        }
    }


    const isBottom = (el) => {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    const scrollNoteList = (e) => {
        const bottom = isBottom(e.currentTarget)
        if (bottom && currentPage <= totalPage && !stLoadingOrderList) {
            setStLoadingOrderList(true)
            setCurrentPage(currentPage => currentPage + 1)
            fetchOrderList(props.userId,currentPage+1 ,SIZE_PER_PAGE)
        }
    }

    const onClickOrderRow = (orderId, orderType, channel) => {
        let url = NAV_PATH.orderDetail + `/${channel}/` + orderId
        let win = window.open(url, '_blank');
        win.focus();
    }


    return (
        <div className={'fb-chat-order'}>
            <div className='page-header d-flex pl-2 mb-3'>
                <img src="/assets/images/icon-arrow-back.png" onClick={() => backToPrevious(true)}
                     className={'cursor--pointer'}/>
                <span className="section-title">
                    <Trans i18nKey="progress.bar.step.newOrder"/>{itemCount > 0 && `(${itemCount})`}
                </span>
            </div>


            <div onScroll={scrollNoteList} className='box_card facebook-info-order'>
                {
                    stOrderList?.map(order => {
                        return (
                            <div className="facebook-info-order-content d-flex justify-content-between align-items-center">
                                <div className="id-time">
                                    <p className="cursor--pointer" onClick={() => onClickOrderRow(order.id, order.orderType, order.channel)}>{order.id}</p>
                                    <span>{moment(order.createdDate).startOf('hour').fromNow()}</span>
                                </div>
                                <div className="total-status">
                                    <p>
                                        {CurrencyUtils.formatMoneyByCurrency(
                                            order.total,
                                            CurrencyUtils.getLocalStorageSymbol()
                                        )}
                                    </p>
                                    <span>
                                          {
                                              order.orderType === 'PRODUCT' &&
                                              <GSOrderStatusTag status={order.status}
                                                                text={i18next.t(`page.order.detail.information.orderStatus.${order.status}`)}/>
                                          }

                                        {
                                            order.orderType === 'BOOKING' &&
                                            <GSOrderStatusTag status={order.status}
                                                              text={i18next.t(`page.order.detail.information.reservationStatus.${order.status}`)}/>
                                        }
                                    </span>
                                </div>
                            </div>
                        )
                    })
                }

                {stLoadingOrderList &&
                <Loading/>
                }

            </div>

        </div>
    )
}

export default OrderListGosocial;

OrderListGosocial.propTypes = {
    callback: PropTypes.func,
    userId: PropTypes.number
}
