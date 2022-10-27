/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import i18next from "i18next";
import {NavigationPath} from "../../../config/NavigationPath";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeader from "../../../components/shared/form/GSWidget/GSWidgetHeader";
import * as Styled from './InventoryIMEISerialTracking.styled'
import GSDropdownMultipleSelect from "../../../components/shared/GSDropdownMultipleSelect/GSDropdownMultipleSelect";
import {useLoading} from "../../../utils/hooks/useLoading";
import storeService from "../../../services/StoreService";
import {UikSelect} from "../../../@uik";
import GSTable from "../../../components/shared/GSTable/GSTable";
import {TableWrapper} from "./InventoryIMEISerialTracking.styled";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {UikWidgetTable} from '../../../@uik'
import {ItemService} from "../../../services/ItemService";
import { useParams } from "react-router-dom";
import '../../../@uik/styles.css'
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import qs from "qs";
import GSWidgetLoadingContent from "../../../components/shared/GSWidgetLoadingContent/GSWidgetLoadingContent";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";


const STATUS_OPTIONS = {
    ALL_STATUS: {
        value: 'ALL',
        label: i18next.t('component.product.edit.toolbar.status.all')
    },
    SOLD: {
        value: 'SOLD',
        label: i18next.t('page.inventory.tracking.status.sold')
    },
    AVAILABLE: {
        value: 'AVAILABLE',
        label: i18next.t('page.inventory.tracking.status.available')
    },
    TRANSFERRING: {
        value: 'TRANSFERRING',
        label: i18next.t('page.inventory.tracking.status.transferring')
    }
}

const SIZE_PER_PAGE = 100;
const InventoryIMEISerialTracking = props => {


    const [isLoading, startLoading, stopLoading] = useLoading(true);
    const [stBranchList, setStBranchList] = useState([]);
    const [stSelectedBranches, setStSelectedBranches] = useState([]);
    const [stStatus, setStStatus] = useState(STATUS_OPTIONS.ALL_STATUS);
    const [stIsFetching, setStIsFetching] = useState(false);
    const [stCodeList, setStCodeList] = useState([]);


    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const {id} = useParams()
    const {itemName, modelName} = qs.parse(window.location.search, { ignoreQueryPrefix: true })

    useEffect(() => {

        storeService.getActiveStoreBranches(0, 9999)
            .then(actBranchList => {
                setStBranchList(actBranchList)
                setStSelectedBranches(actBranchList.map(branch =>  branch.id))
            })
            .finally(() => {
                stopLoading()
            })


    }, []);

    useEffect(() => {
        if (id) {
            fetchData(0)
        }
    }, [id, stStatus, stSelectedBranches]);

    useEffect(() => {
        fetchData()
    }, [stPaging.page])

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
    }

    const fetchData = (page) => {
        setStIsFetching(true)
        const [itemId, modelId] = id.split('-')

        if (stSelectedBranches.length === 0) {
            setStCodeList([])
            setStPaging({
                page: 0,
                totalItem: 0
            })
            setStIsFetching(false)
            return
        }

        /**
         * @type {ItemModelCodeQueryParams}
         */
        const requestParams = {
            itemId: itemId,
            modelId: modelId,
            branchIds: stSelectedBranches.length === stBranchList.length? []: stSelectedBranches,
            status: stStatus.value === 'ALL'? undefined:stStatus.value
        }


        ItemService.getInventoryTrackingIMEIList(requestParams, page || stPaging.page, SIZE_PER_PAGE)
            .then(res => {
                setStPaging({
                    page: page === undefined? stPaging.page:page,
                    totalItem: res.total
                })
                setStCodeList(res.data)
            })
            .finally(() => [
                setStIsFetching(false)
            ])
    }


    const getBranchListOptions = useCallback(() => {
        return stBranchList.map(branch => (
            {label: branch.name, value: branch.id}
        ))
    }, [stBranchList])

    const onChangeBranches = (branches) => {
        setStSelectedBranches(branches.sort((a, b) => a - b));
    }

    const onChangeStatus = (status) => {
        setStStatus(status)
    }

    const resolveBranchName = (branchId) => {
        const branchObj = stBranchList.find(branch => branch.id === branchId)
        if (branchObj) return branchObj.name
        return '-'
    }

    return (
        <GSContentContainer isLoading={isLoading}>
            
            <GSContentHeader title={i18next.t('title.[/inventory/tracking/id]')}
                             backLinkText={i18next.t('page.inventory.tracking.goBack')}
                             backLinkTo={NavigationPath.inventory}
            >
                
            </GSContentHeader>
            
            <GSContentBody size={GSContentBody.size.MAX} className="flex-grow-1 d-flex flex-column">
                <GSWidget className="flex-grow-1">
                    <GSWidgetContent className="h-100 d-flex flex-column">
                        <Styled.Header>
                            <Styled.TitleWrapper>
                                <h3>
                                    {itemName}
                                </h3>
                                {modelName && <span className="font-size-1_1rem">
                                    {modelName}
                                </span>}
                            </Styled.TitleWrapper>

                            <Styled.FilterWrapper>
                                <GSDropdownMultipleSelect
                                    items={getBranchListOptions()}
                                    name="branches"
                                    selected={stSelectedBranches}
                                    headerSelectedI18Text={"page.product.create.updateStockModal.selectedBranches"}
                                    headerSelectedAllText={"page.product.create.updateStockModal.selectedBranches"}
                                    className="inventory-tracking-branch-selector"
                                    onChange={onChangeBranches}
                                    position="bottomLeft"
                                />
                                <UikSelect
                                    className='inventory-tracking-status-selector'
                                    options={Object.values(STATUS_OPTIONS)}
                                    value={[stStatus]}
                                    onChange={onChangeStatus}
                                />
                            </Styled.FilterWrapper>
                        </Styled.Header>
                        <Styled.TrackingList>
                            <Styled.TableWrapper>
                                <div className="overflow-x-auto">
                                    <GSTable>
                                        <thead>
                                        <tr>
                                            <th>
                                                <GSTrans t="page.inventory.tracking.table.imeiNum"/>
                                            </th>
                                            <th>
                                                <GSTrans t="page.inventory.tracking.table.branch"/>
                                            </th>
                                            <th>
                                                <GSTrans t="page.inventory.tracking.table.status"/>
                                            </th>
                                        </tr>

                                        </thead>
                                        <tbody>
                                        {!stIsFetching && stCodeList.map(code => {
                                            return (
                                                <tr key={code.id}>
                                                    <td>
                                                        {code.code}
                                                    </td>
                                                    <td>
                                                        {resolveBranchName(code.branchId)}
                                                    </td>
                                                    <td>
                                                        <GSTrans t={`page.inventory.tracking.status.${code.status.toLowerCase()}`}/>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>

                                    </GSTable>
                                </div>


                                {!stIsFetching && stCodeList.length === 0 &&

                                    <GSWidgetEmptyContent iconSrc="/assets/images/empty-imei.svg"
                                                          text={i18next.t('page.inventory.tracking.table.empty')}
                                                          style={{
                                                            backgroundColor: 'white'
                                                          }}
                                    />
                                }

                                {stIsFetching &&
                                    <GSWidgetLoadingContent/>
                                }

                                {(!stIsFetching && stCodeList.length > 0) &&
                                    <GSPagination totalItem={stPaging.totalItem}
                                               currentPage={stPaging.page + 1}
                                               onChangePage={onChangePage}
                                               pageSize={SIZE_PER_PAGE}
                                                className="mt-auto"
                                />}

                            </Styled.TableWrapper>


                        </Styled.TrackingList>
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>

        </GSContentContainer>
    );
};

InventoryIMEISerialTracking.propTypes = {
    
};

export default InventoryIMEISerialTracking;
