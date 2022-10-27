/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import i18next from "i18next";
import beehiveService from "../../../services/BeehiveService";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import {UikInput, UikWidgetTable} from "../../../@uik";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {NumberUtils} from "../../../utils/number-format";
import GSActionButton, {GSActionButtonIcons} from "../../../components/shared/GSActionButton/GSActionButton";
import {Link} from "react-router-dom";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {GSToast} from "../../../utils/gs-toast";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import './SegmentList.sass'
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {RouteUtils} from "../../../utils/route";

const SIZE_PER_PAGE = 100
const MAX_SEGMENT = 500
const CustomerSegmentList = props => {
    const [stSegmentPaging, setStSegmentPaging] = useState({
        currentPage: 1,
        totalPage: 0,
        itemCount: 0,
        isLoading: false
    });
    const [stSegmentFilter, setStSegmentFilter] = useState({
        keyword: ''
    });
    const [stSegmentList, setStSegmentList] = useState([]);
    const refAlert = useRef(null);
    const refDeleteConfirm = useRef(null);
    const [stIsSaving, setStIsSaving] = useState(false);
    const [stIsFetching, setStIsFetching] = useState(false);

    const refTimeout = useRef(null);

    useEffect( () => {
        setStIsFetching(true)
        const params = {
            page: stSegmentPaging.currentPage - 1,
            size: SIZE_PER_PAGE,
            ['name.contains']: stSegmentFilter.keyword,
            sort: 'id,desc'
        }
        beehiveService.getListSegmentWithKeyword(params)
            .then(result => {
                setStSegmentList(result.data)
                setStSegmentPaging({
                    ...stSegmentPaging,
                    isLoading: false,
                    totalPage: Math.ceil(parseInt(result.headers['x-total-count']) / SIZE_PER_PAGE),
                    itemCount: parseInt(result.headers['x-total-count'])
                })
                // setStIsFetching(false)
            })
            .catch(e => {
                // setStIsFetching(false)
                // GSToast.commonError()
            })
            .finally(() => {
                setStIsFetching(false)

            })
    }, [stSegmentPaging.currentPage, stSegmentFilter])


    const onInputSearch = (e) => {
        clearTimeout(refTimeout.current)
        const data = e.target.value;
        refTimeout.current = setTimeout( () => {
            setStSegmentFilter({
                ...stSegmentFilter,
                keyword: data
            })
            setStSegmentPaging({
                ...stSegmentPaging,
                currentPage: 1
            })
            e.preventDefault()
        }, 500)
    }

    const onChangePage = (pageNumber) => {
        setStSegmentPaging({
            ...stSegmentPaging,
            currentPage: pageNumber
        })
    }

    const onClickDelete = (segmentId) => {
        // check membership
        beehiveService.checkMembership(segmentId)
            .then(isMembership => {
                if (isMembership) { // prevent from delete
                    refAlert.current.openModal({
                        type: AlertModalType.ALERT_TYPE_INFO,
                        messages: i18next.t("page.customers.segments.list.cantRemove")
                    })
                } else {
                    refDeleteConfirm.current.openModal({
                        type: AlertModalType.ALERT_TYPE_DANGER,
                        messages: i18next.t("page.customers.segments.list.deleteHint"),
                        okCallback: () => {
                            setStIsSaving(true)
                            beehiveService.deleteSegment(segmentId)
                                .then(result => {
                                    setStIsSaving(false)
                                    setStSegmentFilter({
                                        ...stSegmentFilter,
                                        keyword: ''
                                    })
                                    setStSegmentPaging({
                                        ...stSegmentPaging,
                                        currentPage: 1
                                    })
                                    setStSegmentList(stSegmentList.filter(segment => segment.id !== segmentId))
                                    GSToast.commonDelete()

                                })
                                .catch(e => {
                                    setStIsSaving(false)
                                    GSToast.commonError()
                                })
                        }
                    })
                }
            })
    }

    const onClickCreateButton = () => {
        if (stSegmentList.length >= MAX_SEGMENT) {
            refAlert.current.openModal({
                type: AlertModalType.ALERT_TYPE_INFO,
                messages: i18next.t("page.customers.segments.list.maximum", {max: 500})
            })
        } else {
            RouteUtils.linkTo(props, NAV_PATH.customers.SEGMENT_CREATE)
        }
    }

    return (
        <GSContentContainer minWidthFitContent isSaving={stIsSaving} className="segment-list">
            <AlertModal ref={refAlert}/>
            <ConfirmModal ref={refDeleteConfirm}/>
            <GSContentHeader title={
                <GSContentHeaderTitleWithExtraTag
                    title={i18next.t("page.customers.segments.list.segments")}
                    extra={stSegmentPaging.itemCount}/>
                }
            >
               <GSContentHeaderRightEl>
                        <GSButton className="btn-create" success onClick={onClickCreateButton}>
                            <GSTrans t={"page.customers.segments.createSegment"}/>
                        </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX} className="segment-list__body" >
                <GSWidget className="segment-list__widget">
                    <GSWidgetContent className="segment-list__widget-body">
                        <section className={"gsa-mb--1e" + (stIsFetching? ' gs-atm--disable':'')}>
                            <span style={{
                                marginRight: 'auto'
                            }} className="gs-search-box__wrapper">
                                <UikInput
                                    onChange={onInputSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("page.customers.segments.list.searchByName")}
                                />
                            </span>
                        </section>
                        {/*DESKTOP*/}
                        {!stIsFetching && stSegmentList.length > 0 &&
                        <section  className="d-mobile-none d-desktop-table">
                            <UikWidgetTable>
                                <thead>
                                    <tr>
                                        <th>
                                            <GSTrans t={"page.customers.segments.list.segmentId"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.customers.segments.list.segmentName"}/>
                                        </th>
                                        <th>
                                            <GSTrans t={"page.customers.segments.list.customerCount"}/>
                                        </th>
                                        <th className="text-center">
                                            <GSTrans t={"page.customers.segments.list.actions"}/>
                                        </th>
                                    </tr>
                                </thead>
                                {!stSegmentPaging.isLoading &&
                                    <tbody>
                                    {stSegmentList.map(segment => {
                                        return (
                                            <tr key={segment.id}>
                                                <td>
                                                    {segment.id}
                                                </td>
                                                <td>
                                                    {segment.name}
                                                </td>
                                                <td>
                                                    {NumberUtils.formatThousand(segment.userCount)}
                                                </td>
                                                <td>
                                                    <div className="gs-atm__flex-row--center">
                                                        <Link to={NAV_PATH.customers.CUSTOMERS_LIST + `?segmentId=${segment.id}`}>
                                                            <GSActionButton icon={GSActionButtonIcons.VIEW} marginLeft/>
                                                        </Link>
                                                        <Link to={NAV_PATH.customers.SEGMENT_EDIT + '/' + segment.id}>
                                                            <GSActionButton icon={GSActionButtonIcons.EDIT} marginLeft/>
                                                        </Link>
                                                        <GSActionButton icon={GSActionButtonIcons.DELETE} marginLeft
                                                            onClick={() => onClickDelete(segment.id)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                }
                            </UikWidgetTable>

                        </section>}
                        {/*MOBILE*/}
                        {!stIsFetching  && stSegmentList.length > 0 &&
                        <section className="gs-mobile-list-container d-mobile-flex d-desktop-none">
                            {stSegmentList.map(segment => {
                                return (
                                    <div className="gs-mobile-list__row"
                                         key={'m'+segment.id}>
                                        <div className="gs-mobile-list__left-col">
                                            <span className="gs-mobile-list__left-title segment-id">
                                                {segment.id}
                                            </span>
                                            <span className="gs-mobile-list__left-title">
                                                {segment.name}
                                            </span>
                                            <span className="gs-mobile-list__left-sub-title">
                                                <GSTrans t={"page.customers.segments.list.userCount"} values={{
                                                    users: NumberUtils.formatThousand(segment.userCount)
                                                }}/>
                                            </span>
                                        </div>
                                        <div className="m-segment__right">
                                            <div className="gs-atm__flex-row--center">
                                                <Link to={NAV_PATH.customers.CUSTOMERS_LIST + `?segment=${segment.id}`}>
                                                    <GSActionButton icon={GSActionButtonIcons.VIEW} marginLeft/>
                                                </Link>
                                                <Link to={NAV_PATH.customers.SEGMENT_EDIT + '/' + segment.id}>
                                                    <GSActionButton icon={GSActionButtonIcons.EDIT} marginLeft/>
                                                </Link>
                                                <GSActionButton icon={GSActionButtonIcons.DELETE} marginLeft
                                                                onClick={() => onClickDelete(segment.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </section>}


                        {stSegmentList.length === 0 && !stIsFetching &&
                        <GSWidgetEmptyContent
                            iconSrc="/assets/images/icon-emptysegment.svg"
                            text={i18next.t(stSegmentFilter.keyword? "common.noResultFound":"page.customer.segment.haveNoSegment")}/>
                        }

                        {stIsFetching &&
                        <Loading style={LoadingStyle.DUAL_RING_GREY}
                                 className="loading-list"
                        />
                        }
                        {!stIsFetching &&
                        <PagingTable
                            currentPage={stSegmentPaging.currentPage}
                            totalPage={stSegmentPaging.totalPage}
                            maxShowedPage={10}
                            totalItems={stSegmentPaging.itemCount}
                            onChangePage={onChangePage}
                            hidePagingEmpty
                            className="d-mobile-none d-desktop-block"
                        >
                        </PagingTable>
                        }
                        {!stIsFetching &&
                        <PagingTable
                            currentPage={stSegmentPaging.currentPage}
                            totalPage={stSegmentPaging.totalPage}
                            maxShowedPage={1}
                            totalItems={stSegmentPaging.itemCount}
                            onChangePage={onChangePage}
                            hidePagingEmpty
                            className="d-mobile-inline d-desktop-none"
                        >
                        </PagingTable>
                        }
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
    );
};

CustomerSegmentList.propTypes = {

};

export default CustomerSegmentList;
