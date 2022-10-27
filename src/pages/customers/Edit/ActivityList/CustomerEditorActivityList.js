/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import callCenterService from "../../../../services/CallCenterService";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import i18next from "i18next";
import './CustomerEditorActivityList.sass'
import {CredentialUtils} from "../../../../utils/credential";
import moment from 'moment'
import CustomerEditorActivityGroup from "./ActivityGroup/CustomerEditorActivityGroup";
import useOnScrollDown from "../../../../utils/hooks/useOnScrollDown";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";

const SIZE_PER_PAGE = 10
const CustomerEditorActivityList = props => {
    const [stPaging, setStPaging] = useState({
        currentPage: 0,
        totalPage: 0
    });
    const [stIsLoadMore, setStIsLoadMore] = useState(false);


    const onScrollDown = useOnScrollDown((e) => {
        if (!stIsLoadMore && stPaging.currentPage < stPaging.totalPage - 1) {
            setStIsLoadMore(true)
            fetchHistory(stPaging.currentPage + 1)
        }
    })

    /**
     * @type {[[CallHistoryModel], Function]}
     */
    const [stHistory, setStHistory] = useState([]);

    useEffect(() => {
        fetchHistory()
    }, [props.customerId]);


    const appendToHistoryGroup = (group, histories) => {
        const groupList = group

        histories.forEach(history => {
            const date = moment(history.timeStarted).format('YYYY-MM-DD')
            const day = groupList.find(g => g[0] === date)
            if (day) {
                day[1].push(history)
            } else {
                groupList.push([date, [history]])
            }
        })

        return groupList
    }

    const groupHistoryByDay = (histories) => {

        let groupList = {}

        histories.forEach(history => {
            const date = moment(history.timeStarted).format('YYYY-MM-DD')
            if (!groupList[date]) groupList[date] = []
            groupList[date].push(history)
        })

        return Object.entries(groupList)
    }

    const fetchHistory =  (page = 0) => {
        /**
         * @type {CallCenterHistoriesRequestBodyModel}
         */
        let requestBody = {
            page: page,
            size: SIZE_PER_PAGE,
            "storeId.equals": CredentialUtils.getStoreId(),
            "customerId.equals": props.customerId,
            sort: 'timeStarted,desc'
        }

        callCenterService.getCallCenterHistoriesWithNote(requestBody)
            .then(result => {

                const totalItem = parseInt(result.headers['x-total-count'])
                setStPaging({
                    currentPage: page,
                    totalPage: Math.ceil(totalItem / SIZE_PER_PAGE)
                })

                if (stHistory.length === 0) {
                    setStHistory(groupHistoryByDay(result.data))
                } else {
                    setStHistory(stHistory => appendToHistoryGroup(stHistory, result.data))
                }

                setStIsLoadMore(false)
            })
            .catch(console.error)
    }



    return (
        <div  className="customer-editor-activity-list py-3">
            {stHistory.length === 0 &&
                <GSWidgetEmptyContent iconSrc="/assets/images/blank-activity.svg"
                                      text={i18next.t('page.customers.edit.emptyActivity')}
                                      className="customer-editor-activity-list__blank"
                />
            }
            <div className="customer-editor-activity-list__item-container gs-atm__scrollbar-1" onScroll={onScrollDown}>
                {stHistory.map( (group, index) => {
                    return (
                        <CustomerEditorActivityGroup group={group} key={group[0]}/>
                    )
                })}
                <div>
                    {stIsLoadMore && <Loading style={LoadingStyle.DUAL_RING_GREY}/>}
                </div>
            </div>
        </div>
    );
};

CustomerEditorActivityList.propTypes = {
    customerId: PropTypes.number,
};

export default CustomerEditorActivityList;
