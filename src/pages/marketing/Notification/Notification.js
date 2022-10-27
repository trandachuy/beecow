/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 3/10/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {useEffect, useRef, useState} from 'react';
import './Notification.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import i18next from "i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {Trans} from "react-i18next";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {UikInput} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import beehiveService from "../../../services/BeehiveService";
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag";
import {CredentialUtils} from "../../../utils/credential";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {NumberUtils} from "../../../utils/number-format";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import GSButton from "../../../components/shared/GSButton/GSButton";
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";
import GSActionButton, { GSActionButtonIcons } from '../../../components/shared/GSActionButton/GSActionButton';
import moment from "moment";
import ConfirmModal, {ConfirmModalUtils} from "../../../components/shared/ConfirmModal/ConfirmModal";
import {GSToast} from "../../../utils/gs-toast";

export const NotificationPushStatus = {
    SENDING: 'SENDING',
    DONE: 'DONE',
    SCHEDULED: 'SCHEDULED',
    SCHEDULE_FAILED: 'SCHEDULE_FAILED',
    FAILED: 'FAILED',
    INIT: 'INIT',
    ACTIVE:'ACTIVE'
}


const MKNotification = props => {
    // check intro
    if (!CredentialUtils.getIsExploredNotification()) {
        // => redirect to intro page
        RouteUtils.linkTo(props,NAV_PATH.marketing.NOTIFICATION_INTRO)
    }

    // State
    const [stateNewNotification, setStateNewNotification] = useState(false);
    const [stateNotificationType, setStateNotificationType] = useState([
        {key: '', name: i18next.t('component.marketing.notification.dropdown.type.all')},
        {key: 'SCHEDULED', name: i18next.t('page.notification.list.filter.type.SCHEDULED')},
        {key: 'SEND_NOW', name: i18next.t('page.notification.list.filter.type.SEND_NOW')},
        {key: 'EVENT', name: i18next.t('page.notification.editor.event')}
    ]);
    const [stateNotificationStatus, setStateNotificationStatus] = useState([
        {key: '', name: i18next.t('component.marketing.notification.dropdown.status.all')},
        {key: NotificationPushStatus.SENDING, name: i18next.t('component.marketing.notification.dropdown.status.sending')},
        {key: NotificationPushStatus.DONE, name: i18next.t('component.marketing.notification.dropdown.status.done')},
        {key: NotificationPushStatus.SCHEDULED, name: i18next.t('component.marketing.notification.dropdown.status.scheduled')},
        {key: NotificationPushStatus.SCHEDULE_FAILED, name: i18next.t('component.marketing.notification.dropdown.status.scheduleFailed')},
        {key: NotificationPushStatus.ACTIVE, name: i18next.t('page.notification.editor.statusActive')}

    ]);
    const refConfirmDeleteModal = useRef(null);
    const [stateFetching, setStateFetching] = useState(false);
    const [stateTypeDropDownOpen, setStateTypeDropDownOpen] = useState(false);
    const [stateSelectType, setStateSelectType] = useState(stateNotificationType[0]);
    const [stateStatusDropDownOpen, setStateStatusDropDownOpen] = useState(false);
    const [stateSelectStatus, setStateSelectStatus] = useState(stateNotificationStatus[0]);
    const [stateKeyword, setStateKeyword] = useState('');
    const [stateData, setStateData] = useState({
        data: []
    });
    const [stateTable, setStateTable] = useState({
        totalPage: 0,
        totalItem: 0
    });
    const [stateCurrentPage, setStateCurrentPage] = useState(0);

    // Props
    const tableConfig = {
        headerList: [
            i18next.t("component.marketing.notification.tbl.name"),
            i18next.t("component.marketing.notification.tbl.type"),
            i18next.t("component.marketing.notification.tbl.status"),
            i18next.t("page.notification.list.table.scheduleTime"),
            i18next.t("component.page.table.header.action")
        ]
    };
    const SIZE_PER_PAGE = 50;
    const ON_INPUT_DELAY = 500;
    let timeOutCaptureKeywordSearch;

    // Fetch data
    useEffect(() => {
        fetchData()
    }, [stateKeyword, stateSelectStatus, stateSelectType, stateCurrentPage]);

    const fetchData = () => {
        setStateFetching(true);
        beehiveService.getListMkNotificationCampaigns(stateKeyword, stateSelectStatus.key, stateSelectType.key, stateCurrentPage - 1, SIZE_PER_PAGE)
            .then(response => {
                setStateFetching(false);
                const totalItem = parseInt(response.headers['x-total-count']);
                setStateData({
                    data: response.data
                });
                setStateTable({
                    totalItem: totalItem,
                    totalPage: Math.ceil(totalItem / SIZE_PER_PAGE)
                });
            })
            .catch((reject) => {
                setStateFetching(false);
                console.error(reject);
            });
    }

    // Event function
    const onToggleNewNotification = () => {
        setStateNewNotification(!stateNewNotification);
    };
    const onInputSearch = ($event) => {
        const keyword = $event.currentTarget.value;
        // if (timeOutCaptureKeywordSearch) clearTimeout(timeOutCaptureKeywordSearch);
        // timeOutCaptureKeywordSearch = setTimeout( () => {
        //     setStateKeyword(keyword);
        // }, ON_INPUT_DELAY)

        if ($event.charCode === 13) {
            // Press enter
            setStateKeyword(keyword);
        }
    };
    const onToggleType = () => {
        setStateTypeDropDownOpen(!stateTypeDropDownOpen);
    };
    const onSelectType = (type) => {
        setStateSelectType(type);
    };
    const onToggleStatus = () => {
        setStateStatusDropDownOpen(!stateStatusDropDownOpen);
    };
    const onSelectStatus = (status) => {
        setStateSelectStatus(status);
    };
    const onChangePage = (page) => {
        setStateCurrentPage(page);
    };
    const onClickCreate = (mode) => {
        switch (mode) {
            case 'EMAIL':
                RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION_EMAIL_CREATE);
                break;
            case 'PUSH':
                RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION_PUSH_CREATE);
                break
        }
    };

    const onClickItemRow = (notificationId) => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION_DETAIL + '/' + notificationId);
    }

    // Render
    const MKNotiHeader = () => {
        return <GSContentHeader className='notification-header'
                                title={
                                    <GSContentHeaderTitleWithExtraTag title={i18next.t("component.navigation.notification")}
                                            // extra={stateTable.totalItem}
                                    />
                                }
        >
            <HintPopupVideo category={'PUSH_NOTIFICATIONS'} title={"Notification management"}/>
            <GSContentHeaderRightEl className='gss-content-header--action-btn gss-content-header--action-btn--mobile-left'>
                <div className='gss-content-header--action-btn--group'>
                    <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0166]}
                    >
                        <GSButton success onClick={() => onClickCreate('PUSH')}>
                            <Trans i18nKey="component.marketing.notification.btn.create" className="sr-only">Create campaign</Trans>
                        </GSButton>
                    </PrivateComponent>
                </div>
            </GSContentHeaderRightEl>
        </GSContentHeader>
    };
    const MKNotiBody = () => {
        return (
            <GSContentBody className='notification-content-body' size={GSContentBody.size.MAX} centerChildren>
                <GSWidget>
                    <GSWidgetContent>
                        {stateFetching && <LoadingScreen />}
                        <section className='top-search'>
                            <SearchKeyword/>
                            <section className='group-combobox'>
                                <FilterType/>
                                <FilterStatus/>
                            </section>
                        </section>
                        <DataTable/>
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
        )
    };
    const SearchKeyword = () => {
        return (
            <span className='search gs-search-box__wrapper'>
                <UikInput
                    className="search-input"
                    icon={ (
                        <FontAwesomeIcon icon={"search"}/>
                    ) }
                    iconPosition="left"
                    placeholder={i18next.t("component.marketing.notification.input.placeholder.search")}
                    onKeyPress={onInputSearch}
                    defaultValue={stateKeyword}
                />
            </span>
        )
    };
    const FilterType = () => {
        return (
            <Dropdown className='dropdown-box' isOpen={stateTypeDropDownOpen} toggle={onToggleType}>
                <DropdownToggle className='gs-button' caret>
                    <span>{stateSelectType.name}</span>
                </DropdownToggle>
                <DropdownMenu>
                    {
                        stateNotificationType.map((item) =>{
                            return (
                                <DropdownItem className='btn' key={'filter-type-' + item.key} onClick={() => onSelectType(item)}>
                                    <span>{item.name}</span>
                                </DropdownItem>
                            )
                        })
                    }
                </DropdownMenu>
            </Dropdown>
        )
    };
    const FilterStatus = () => {
        return (
            <Dropdown className='dropdown-box' isOpen={stateStatusDropDownOpen} toggle={onToggleStatus}>
                <DropdownToggle className="gs-button" caret>
                    <span>{stateSelectStatus.name}</span>
                </DropdownToggle>
                <DropdownMenu>
                    {
                        stateNotificationStatus.map((item) =>{
                            return (
                                <DropdownItem className='btn' key={'filter-status-' + item.key} onClick={() => onSelectStatus(item)}>
                                    <span>{item.name}</span>
                                </DropdownItem>
                            )
                        })
                    }
                </DropdownMenu>
            </Dropdown>
        )
    };

    const renderNotificationType = (notification) => {
        const {sendingTime, status,type} = notification
        if (sendingTime) {
            return i18next.t('page.notification.list.filter.type.SCHEDULED')
        }
        if(status === 'ACTIVE'){
            return i18next.t('page.notification.list.filter.type.ACTIVE')
        }
        return 'Push'
    }

    const onClickDelete = (dataRow) => {
        const notificationId = dataRow.id
        ConfirmModalUtils.openModal(refConfirmDeleteModal, {
            messages: i18next.t`page.notification.list.deleteConfirmText`,
            modalTitle: i18next.t`page.notification.list.deleteConfirmTitle`,
            okCallback: () => {
                beehiveService.deleteMarketingNotification(notificationId)
                    .then(() => {
                        GSToast.commonDelete()
                        fetchData()
                    })
                    .catch(() => {
                        GSToast.commonError()
                    })
            }
        })
    }

    const DataTable = () => {
        if (stateData.data.length === 0) {
            return (
                <div className="empty">
                    <i className="icon-empty"/><span>{i18next.t("component.discount.empty")}</span>
                </div>
            )
        }
        else {
            return (
                <PagingTable
                    headers={tableConfig.headerList}
                    totalPage={stateTable.totalPage}
                    maxShowedPage={10}
                    currentPage={stateCurrentPage}
                    onChangePage={onChangePage}
                    totalItems={stateTable.totalItem}
                    hidePagingEmpty
                >
                    {
                        stateData.data.map((dataRow) => {
                            return (
                                <section key={'data-' + dataRow.id}  className="gs-table-body-items cursor--pointer gsa-hover--gray"
                                         onClick={() => onClickItemRow(dataRow.id)}
                                >
                                    <div className={`gs-table-body-item icon ` + dataRow.status.toLowerCase()}>
                                        <span className="discount-name">{dataRow.name}</span>
                                    </div>
                                    <div className="gs-table-body-item type">
                                        {renderNotificationType(dataRow)}
                                    </div>
                                    <div className="gs-table-body-item status">
                                        <Status data={dataRow}/>
                                    </div>

                                    <div className="gs-table-body-item status white-space-nowrap">
                                        {[NotificationPushStatus.SCHEDULED, NotificationPushStatus.SCHEDULE_FAILED].includes(dataRow.status) && dataRow.sendingTime ?
                                         <>
                                            {moment(dataRow.sendingTime).format('HH:mm')}
                                            <br/>
                                            {moment(dataRow.sendingTime).format('DD-MM-YYYY')}
                                        </>
                                        :
                                        ' -'
                                    }
                                    </div>

                                    <div className="gs-table-body-item status">
                                        {[NotificationPushStatus.SCHEDULED, NotificationPushStatus.SCHEDULE_FAILED,NotificationPushStatus.ACTIVE].includes(dataRow.status) && <>
                                            <GSActionButton icon={GSActionButtonIcons.EDIT}
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.NOTIFICATION_PUSH_EDIT + '/' + dataRow.id)
                                                }}
                                            />
                                            <GSActionButton icon={GSActionButtonIcons.DELETE} marginLeft
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onClickDelete(dataRow)
                                                            }}
                                            />
                                        </>}
                                    </div>
                                </section>
                            )
                        })
                    }
                </PagingTable>
            )
        }
    };
    const Status = props => {
        const [stateStatus, setStateStatus] = useState({
            id: props.data.id,
            status: props.data.status,
            completeProgress: props.data.completeProgress,
            totalProgress: props.data.totalProgress
        });
        switch (stateStatus.status) {
            case NotificationPushStatus.DONE:
                return (
                    <GSStatusTag  tagStyle={GSStatusTag.STYLE.SUCCESS} text={i18next.t('component.marketing.notification.dropdown.status.done')}/>
                )
            case NotificationPushStatus.SCHEDULED:
                return (
                    <GSStatusTag tagStyle={GSStatusTag.STYLE.INFO} text={i18next.t('component.marketing.notification.dropdown.status.scheduled')}/>
                )
            case NotificationPushStatus.SCHEDULE_FAILED:
                return (
                    <GSStatusTag tagStyle={GSStatusTag.STYLE.DANGER} text={i18next.t('component.marketing.notification.dropdown.status.scheduleFailed')}/>
                )
            case NotificationPushStatus.SENDING:
            case NotificationPushStatus.INIT:
                return (
                    <GSStatusTag tagStyle={GSStatusTag.STYLE.WARNING} text={i18next.t('component.marketing.notification.dropdown.status.sending')}/>
                )
            case NotificationPushStatus.FAILED:
                return (
                    <GSStatusTag tagStyle={GSStatusTag.STYLE.DANGER} text={i18next.t('component.marketing.notification.dropdown.status.failed')}/>
                )
            case NotificationPushStatus.ACTIVE:
                return (
                    <GSStatusTag tagStyle={GSStatusTag.STYLE.ACTIVE} text={i18next.t("page.notification.editor.statusActive")}/>
                )
            default:
                return null
        }
    };

    return (
        <GSContentContainer className='notification'>
            <ConfirmModal ref={refConfirmDeleteModal}/>
            <MKNotiHeader/>
            <MKNotiBody/>
        </GSContentContainer>
    );
};

MKNotification.propTypes = {

};

export default MKNotification;

