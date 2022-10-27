import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from "../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderRightEl from "../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import GSContentBody from "../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../components/shared/form/GSWidget/GSWidgetContent";
import Loading, {LoadingStyle} from "../../components/shared/Loading/Loading";
import GSTooltip from "../../components/shared/GSTooltip/GSTooltip";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSImg from "../../components/shared/GSImg/GSImg";

import './FlashSaleCampaignManagement.sass'
import {UikSelect} from "../../@uik";
import i18next from "i18next";
import {RouteUtils} from "../../utils/route";
import {NAV_PATH} from "../../components/layout/navigation/Navigation";
import GSTable from "../../components/shared/GSTable/GSTable";
import GSPagination from "../../components/shared/GSPagination/GSPagination";
import {ItemService} from "../../services/ItemService";
import {GSToast} from "../../utils/gs-toast";
import moment from 'moment';
import GSDateRangePicker from "../../components/shared/GSDateRangePicker/GSDateRangePicker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSWidgetEmptyContent from "../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import {CredentialUtils} from "../../utils/credential";
import GSAlertModal, {GSAlertModalType} from "../../components/shared/GSAlertModal/GSAlertModal";
import useDebounceEffect from "../../utils/hooks/useDebounceEffect";

const HEADERS = {
    campaignName: i18next.t('page.flashSale.management.table.header.campaignName'),
    startTime: i18next.t('page.flashSale.management.table.header.startTime'),
    endTime: i18next.t('page.flashSale.management.table.header.endTime'),
    date: i18next.t('page.flashSale.management.table.header.date'),
    numOfProduct: i18next.t('page.flashSale.management.table.header.numOfProduct'),
    status: i18next.t('page.flashSale.management.table.header.status'),
    action: i18next.t('page.flashSale.management.table.header.action'),
}

const DEFAULT_ACTION_LIST = {
    TIME: {value: '', label: i18next.t('page.flashSale.management.defaultActions.allTime')},
    STATUS: {value: '', label: i18next.t('page.flashSale.management.defaultActions.allStatus')},
}

const CAMPAIGN_STATUS = {
    ALL_STATUS: DEFAULT_ACTION_LIST.STATUS,
    SCHEDULED: {
        value: 'SCHEDULED',
        label: i18next.t('page.flashSale.management.defaultActions.SCHEDULED')
    },
    IN_PROGRESS: {
        value: 'IN_PROGRESS',
        label: i18next.t('page.flashSale.management.defaultActions.IN_PROGRESS')
    },
    ENDED: {
        value: 'ENDED',
        label: i18next.t('page.flashSale.management.defaultActions.ENDED')
    }
}

const FlashSaleCampaignManagement = props => {
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stPaging, setStPaging] = useState({
        total: 0,
        page: 1,
        size: 20,
    })
    const [stCampaigns, setStCampaigns] = useState([])
    const [stFilters, setStFilters] = useState({})

    const refAlertModal = useRef()
    const refConfirmModal = useRef()

    useEffect(() => {
        if (!CredentialUtils.getIsExploredFlashSale()) {
            RouteUtils.linkTo(props, NAV_PATH.discounts.FLASHSALE_INTRO);
        }
    }, []);

    useDebounceEffect(() => {
        fetchData()
    }, 250, [stPaging.page, stFilters])

    const getStatusOfCampaign = (startDate, endDate) => {
        if (moment().isBefore(startDate)) {
            return CAMPAIGN_STATUS.SCHEDULED
        }
        if (moment().isAfter(endDate)) {
            return CAMPAIGN_STATUS.ENDED
        }

        return CAMPAIGN_STATUS.IN_PROGRESS
    }

    const fetchData = () => {
        setStIsFetching(true)

        ItemService.getFlashSaleCampaigns(stPaging.page - 1, stPaging.size, stFilters)
            .then(({data, total}) => {
                const campaigns = data.map(camp => ({
                    id: camp.id,
                    name: camp.name,
                    startTime: moment(camp.startDate).format('HH:mm'),
                    endTime: moment(camp.endDate).format('HH:mm'),
                    date: moment(camp.startDate).format('DD-MM-YYYY'),
                    numOfProduct: camp.items.length,
                    status: getStatusOfCampaign(camp.startDate, camp.endDate).label
                }))

                setStCampaigns(campaigns)
                setStPaging(paging => ({
                    ...paging,
                    total,
                }))
            })
            .catch(() => GSToast.error())
            .finally(() => setStIsFetching(false))
    }

    const handleManageTime = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.flashSaleTime)
    }

    const handleCreateCampaign = () => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.createFlashSaleCampaign)
    }

    const handleFilterByDate = (event, picker) => {
        const fromTime = picker.startDate.toISOString();
        const toTime = picker.endDate.toISOString();

        setStFilters(filters => ({
            ...filters,
            fromTime,
            toTime
        }))
        setStPaging(paging => ({
            ...paging,
            page: 1
        }))
    }

    const handleClearFilterByDate = () => {
        setStFilters(filters => ({
            ...filters,
            fromTime: null,
            toTime: null
        }))
        setStPaging(paging => ({
            ...paging,
            page: 1
        }))
    }

    const renderTimePickerText = () => {
        if (stFilters.fromTime && stFilters.toTime) {
            return moment(stFilters.fromTime).format('DD-MM-YYYY') + ' - ' + moment(stFilters.toTime).format('DD-MM-YYYY');
        }

        return DEFAULT_ACTION_LIST.TIME.label;
    }

    const handlePaging = (page) => {
        setStPaging(paging => ({
            ...paging,
            page
        }))
    }

    const handleEdit = (campaignId) => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.editFlashSaleCampaign.replace(':campaignId', campaignId))
    }

    const handleDelete = (id, isConfirmed) => {
        if (isConfirmed) {
            ItemService.deleteCampaign(id)
                .then(() => {
                    fetchData()
                    GSToast.commonUpdate()
                })
                .catch(() => GSToast.commonError())
            return
        }

        refAlertModal.current.openModal({
            type: GSAlertModalType.ALERT_TYPE_DANGER,
            messages: i18next.t('page.flashSale.management.actions.delete.confirm'),
            acceptCallback: () => handleDelete(id, true)
        })
    }

    const handleClose = (id, isConfirmed) => {
        if (isConfirmed) {
            ItemService.endCampaign(id)
                .then(() => {
                    fetchData()
                    GSToast.commonUpdate()
                })
                .catch(() => GSToast.commonError())
            return
        }

        refConfirmModal.current.openModal({
            messages: i18next.t('page.flashSale.management.actions.close.confirm'),
            okCallback: () => handleClose(id, true)
        })
    }

    const handleView = (startDate) => {
        const date = encodeURIComponent(startDate.format('YYYY-MM-DDT00:00:00Z'))

        window.open(`https://${CredentialUtils.getStoreUrl()}.${process.env.STOREFRONT_DOMAIN}/flash-sale?date=${date}`, '_blank', 'noopener,noreferrer')
    }

    const renderActionsOfCampaign = (campaign) => {
        const {date, startTime, endTime} = campaign
        const startDate = moment(date + ' ' + startTime, "DD-MM-YYYY HH:mm")
        const endDate = moment(date + ' ' + endTime, "DD-MM-YYYY HH:mm")
        const status = getStatusOfCampaign(startDate, endDate).value

        return (
            <>
                {status === CAMPAIGN_STATUS.SCHEDULED.value && <GSComponentTooltip
                    message={i18next.t('page.flashSale.management.actions.edit.hint')}
                    theme={GSTooltip.THEME.DARK}
                    placement={GSComponentTooltipPlacement.BOTTOM}>
                    <GSImg
                        className='cursor--pointer'
                        src='/assets/images/icon-edit.png'
                        alt='edit'
                        width={22}
                        onClick={() => handleEdit(campaign.id)}
                    />
                </GSComponentTooltip>}
                {status === CAMPAIGN_STATUS.SCHEDULED.value && <GSComponentTooltip
                    message={i18next.t('page.flashSale.management.actions.delete.hint')}
                    theme={GSTooltip.THEME.DARK}
                    placement={GSComponentTooltipPlacement.BOTTOM}>
                    <GSImg
                        className='ml-3 cursor--pointer'
                        src='/assets/images/icon-delete.png'
                        alt='close'
                        width={22}
                        onClick={() => handleDelete(campaign.id)}
                    />
                </GSComponentTooltip>}
                {status === CAMPAIGN_STATUS.IN_PROGRESS.value && <GSComponentTooltip
                    message={i18next.t('page.flashSale.management.actions.close.hint')}
                    theme={GSTooltip.THEME.DARK}
                    placement={GSComponentTooltipPlacement.BOTTOM}>
                    <GSImg
                        className='ml-3 cursor--pointer'
                        src='/assets/images/icon-deleteproduct.png'
                        alt='close'
                        width={22}
                        onClick={() => handleClose(campaign.id)}
                    />
                </GSComponentTooltip>}
                <GSComponentTooltip
                    message={i18next.t('page.flashSale.management.actions.view.hint')}
                    theme={GSTooltip.THEME.DARK}
                    placement={GSComponentTooltipPlacement.BOTTOM}>
                    <GSImg
                        className='ml-3 cursor--pointer'
                        src='/assets/images/icon-preview.png'
                        alt='view'
                        width={22}
                        onClick={() => handleView(startDate)}
                    />
                </GSComponentTooltip>
            </>
        )
    }

    return (
        <>
            <GSAlertModal ref={refAlertModal}/>
            <ConfirmModal ref={refConfirmModal}/>
            <GSContentContainer className='flash-sale-campaign-management'>
                <GSContentHeader title={i18next.t('page.flashSale.management.header')}>
                    <GSContentHeaderRightEl className="d-flex">
                        <GSButton success onClick={handleManageTime}>
                            <Trans i18nKey="page.flashSale.management.button.manageTime" className="sr-only">
                                Manage Flash Sale Time
                            </Trans>
                        </GSButton>
                        <GSButton success outline marginLeft onClick={handleCreateCampaign}>
                            <Trans i18nKey="page.flashSale.management.button.createCampaign" className="sr-only">
                                Create Campaign
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className='h-100'>
                    <GSWidget className='flash-sale-campaign-management__widget'>
                        <GSWidgetContent className='d-flex flex-column h-100'>
                            <div className='align-self-start align-self-sm-end flex-column flex-sm-row actions'>
                                <GSDateRangePicker
                                    minimumNights={0}
                                    onApply={handleFilterByDate}
                                    onCancel={handleClearFilterByDate}
                                    containerClass="position-relative pr-0 pr-sm-2 "
                                    containerStyles={{
                                        display: 'inline-block',
                                        width: '240px',
                                    }}
                                >
                                    <input type="text"
                                           value={renderTimePickerText()}
                                           className="form-control"
                                    />
                                    <FontAwesomeIcon icon={['far', 'calendar-alt']} color="#939393" style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '.6rem'
                                    }}/>
                                </GSDateRangePicker>
                                <UikSelect
                                    className='mt-2 mt-sm-0'
                                    defaultValue={DEFAULT_ACTION_LIST.STATUS.value}
                                    options={Object.values(CAMPAIGN_STATUS)}
                                    onChange={({value}) => {
                                        setStFilters(filter => ({
                                            ...filter,
                                            status: value
                                        }))
                                        setStPaging(paging => ({
                                            ...paging,
                                            page: 1
                                        }))
                                    }}
                                />
                            </div>
                            <div className='overflow-x-auto mt-3'>
                                {
                                    stIsFetching
                                        ? <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                                        : <>
                                            <GSTable className='table'>
                                                <thead>
                                                <tr>
                                                    <th>{HEADERS.campaignName}</th>
                                                    <th>{HEADERS.startTime}</th>
                                                    <th>{HEADERS.endTime}</th>
                                                    <th>{HEADERS.date}</th>
                                                    <th>{HEADERS.numOfProduct}</th>
                                                    <th>{HEADERS.status}</th>
                                                    <th className='text-right pr-5'>{HEADERS.action}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {
                                                    stCampaigns.map((campaign, index) => (
                                                        <tr key={campaign.id}>
                                                            <td className="gs-table-body-item">
                                                                <span>{campaign.name}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{campaign.startTime}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{campaign.endTime}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{campaign.date}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{campaign.numOfProduct}</span>
                                                            </td>
                                                            <td className="gs-table-body-item">
                                                                <span>{campaign.status}</span>
                                                            </td>
                                                            <td className="gs-table-body-item text-right d-flex justify-content-center">
                                                                {renderActionsOfCampaign(campaign)}
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
                            {
                                !stIsFetching && !stCampaigns.length && <GSWidgetEmptyContent
                                    className="m-auto flex-grow-1 background-color-white"
                                    text={i18next.t("page.flashSale.management.table.empty")}
                                    iconSrc={"/assets/images/flashsale_empty.png"}
                                />
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>
        </>
    );
};

FlashSaleCampaignManagement.propTypes =
    {}
;

export default FlashSaleCampaignManagement;
