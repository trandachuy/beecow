import './FlashSaleTimeManagement.sass'
import React, {useEffect, useRef, useState} from "react";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import i18next from "i18next";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import GSImg from "../../../components/shared/GSImg/GSImg";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import GSAlertModal, {GSAlertModalType} from "../../../components/shared/GSAlertModal/GSAlertModal";
import AddFlashSaleTimeModal from "./AddFlashSaleTimeModal";
import {ItemService} from "../../../services/ItemService";
import {GSToast} from "../../../utils/gs-toast";
import {FlashSaleTimeModel} from "../../../models/FlashSaleTime.model";
import {CredentialUtils} from "../../../utils/credential";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";

const HEADERS = {
    startTime: i18next.t('page.flashSale.time.management.table.header.startTime'),
    endTime: i18next.t('page.flashSale.time.management.table.header.endTime'),
    action: i18next.t('page.flashSale.time.management.table.header.action'),
}

const FlashSaleTimeManagement = (props) => {
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stPaging, setStPaging] = useState({
        total: 0,
        page: 1,
        size: 50,
    })
    const [stTimes, setStTimes] = useState([])
    const [stToggleAddTime, setStToggleAddTime] = useState(false)

    const refAlertModal = useRef()
    const refNotiModal = useRef()

    useEffect(() => {
        fetchData()
    }, [stPaging.page])

    const formatTime = (hour, minute) => {
        return ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2)
    }

    const fetchData = () => {
        setStIsFetching(true)

        return ItemService.getFlashSaleTimeOfStore(stPaging.page - 1, stPaging.size)
            .then(({data, total}) => {
                const times = data.map(time => ({
                    id: time.id,
                    startTime: formatTime(time.startHour, time.startMinute),
                    endTime: formatTime(time.endHour, time.endMinute),
                }))

                setStTimes(times)
                setStPaging(paging => ({...paging, total}))
            })
            .catch(() => GSToast.commonError())
            .finally(() => {
                setStIsFetching(false)
            })
    }

    const handleDelete = (time, isConfirmed) => {
        const {id, startTime, endTime} = time

        if (isConfirmed) {
            return ItemService.deleteFlashSaleTime(id)
                .then(() => fetchData())
                .then(() => GSToast.commonDelete())
                .catch(() => GSToast.commonError())
        }

        refAlertModal.current.openModal({
            messages: i18next.t('page.flashSale.time.management.actions.delete.confirm', {time: startTime + '-' + endTime}),
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            acceptCallback: () => handleDelete(time, true)
        })
    }

    const handleSaveTime = ({startHour, startMinute, endHour, endMinute}) => {
        const flashSaleTimeModel = {
            storeId: CredentialUtils.getStoreId(),
            startHour: startHour,
            startMinute: startMinute,
            endHour: endHour,
            endMinute: endMinute,
        }

        ItemService.addFlashSaleTime(flashSaleTimeModel)
            .then(() => setStToggleAddTime(false))
            .then(() => {
                refNotiModal.current.openModal({
                    messages: i18next.t('page.flashSale.time.management.create.successful'),
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    closeCallback: fetchData
                })
            })
            .catch(() => GSToast.commonError())
    }

    const handlePaging = (page) => {
        setStPaging(paging => ({
            ...paging,
            page
        }))
    }

    return (
        <>
            <GSAlertModal ref={el => refAlertModal.current = el}/>
            <AlertModal ref={el => {refNotiModal.current = el}}/>
            <AddFlashSaleTimeModal key={stToggleAddTime} isToggle={stToggleAddTime} onSave={handleSaveTime}
                                   onClose={() => setStToggleAddTime(false)}/>
            <GSContentContainer className='flash-sale-time-management'>
                <GSContentHeader title={i18next.t('page.flashSale.time.management.header')}>
                    <GSContentHeaderRightEl className="d-flex">
                        <GSButton success onClick={() => {
                            setStToggleAddTime(true)
                        }}>
                            <Trans i18nKey="page.flashSale.time.management.button.addTime" className="sr-only">
                                Add Time
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className='d-flex flex-grow-1 flex-shrink-0'>
                    <GSWidget className='d-flex flex-column'>
                        <GSWidgetContent className='d-flex flex-column'>
                            <div className='overflow-x-auto mt-3'>
                                {
                                    stIsFetching
                                        ? <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                                        : <>
                                            <GSTable>
                                                <colgroup>
                                                    <col style={{width: '45%'}}/>
                                                    <col style={{width: '45%'}}/>
                                                    <col style={{width: '10%'}}/>
                                                </colgroup>
                                                <thead>
                                                <tr>
                                                    <th>{HEADERS.startTime}</th>
                                                    <th>{HEADERS.endTime}</th>
                                                    <th>{HEADERS.action}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {
                                                    stTimes.map((time, index) => (
                                                        <tr key={time.id}>
                                                            <td className="gs-table-body-item">
                                                                <span>{time.startTime}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{time.endTime}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <GSComponentTooltip
                                                                    message={i18next.t('page.flashSale.time.management.actions.delete.hint')}
                                                                    theme={GSTooltip.THEME.DARK}
                                                                    placement={GSComponentTooltipPlacement.BOTTOM}>
                                                                    <GSImg
                                                                        className='cursor--pointer'
                                                                        src='/assets/images/icon-delete.png'
                                                                        alt='remove'
                                                                        width={22}
                                                                        onClick={() => handleDelete(time)}
                                                                    />
                                                                </GSComponentTooltip>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                                </tbody>
                                            </GSTable>
                                            <GSPagination
                                                totalItem={stPaging.total}
                                                currentPage={stPaging.page}
                                                pageSize={stPaging.size}
                                                onChangePage={handlePaging}
                                            >
                                            </GSPagination>
                                        </>
                                }
                            </div>
                        </GSWidgetContent>
                        {
                            !stTimes.length && <div
                                className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                <div>
                                    <img src="/assets/images/icon-Empty.svg"/>
                                    {' '}
                                    <span><Trans
                                        i18nKey="page.flashSale.time.management.table.empty"/></span>
                                </div>
                            </div>
                        }
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
        </>
    );
}

FlashSaleTimeManagement.defaultProps = {}

FlashSaleTimeManagement.propTypes = {}

export default FlashSaleTimeManagement