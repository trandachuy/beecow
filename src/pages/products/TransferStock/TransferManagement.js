import React, {useEffect, useMemo, useRef, useState} from 'react'
import './TransferManagement.sass'
import GSContentHeader from '../../../components/layout/contentHeader/GSContentHeader'
import i18next from 'i18next'
import {NAV_PATH} from '../../../components/layout/navigation/Navigation'
import GSContentHeaderTitleWithExtraTag
  from '../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag'
import GSContentBody from '../../../components/layout/contentBody/GSContentBody'
import GSWidget from '../../../components/shared/form/GSWidget/GSWidget'
import GSWidgetContent from '../../../components/shared/form/GSWidget/GSWidgetContent'
import {cn} from '../../../utils/class-name'
import GSSearchInput from '../../../components/shared/GSSearchInput/GSSearchInput'
import GSTable from '../../../components/shared/GSTable/GSTable'
import GSTrans from '../../../components/shared/GSTrans/GSTrans'
import GSPagination from '../../../components/shared/GSPagination/GSPagination'
import GSWidgetEmptyContent from '../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent'
import GSWidgetLoadingContent from '../../../components/shared/GSWidgetLoadingContent/GSWidgetLoadingContent'
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer'
import GSButton from '../../../components/shared/GSButton/GSButton'
import GSContentHeaderRightEl
  from '../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl'
import GSMegaFilter from '../../../components/shared/GSMegaFilter/GSMegaFilter'
import GSMegaFilterRowSelect from '../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowSelect'
import GSMegaFilterRowTag from '../../../components/shared/GSMegaFilter/FilterRow/GSMegaFilterRowTag'
import storeService from '../../../services/StoreService'
import {TransferConstants} from './TransferConstants'
import {ItemService} from '../../../services/ItemService'
import moment from 'moment'
import {CredentialUtils} from '../../../utils/credential'
import GSDateRangePicker from '../../../components/shared/GSDateRangePicker/GSDateRangePicker'
import {RouteUtils} from '../../../utils/route'
import {Link, withRouter} from 'react-router-dom'
import Constants from '../../../config/Constant'

const SIZE_PER_PAGE = 20

const TransferManagement = props => {
  const refSearchInput = useRef(null);
  const STATUS_OPTIONS = useMemo(() => [
    {
      label: i18next.t`component.custom.page.filter.status.all`,
      value: 'ALL'
    },
    {
      label: i18next.t`page.transfer.stock.list.status.READY_FOR_TRANSPORT`,
      value: TransferConstants.STATUS.READY_FOR_TRANSPORT
    },
    {
      label: i18next.t`page.transfer.stock.list.status.DELIVERING`,
      value: TransferConstants.STATUS.DELIVERING
    },
    {
      label: i18next.t`page.transfer.stock.list.status.RECEIVED`,
      value: TransferConstants.STATUS.RECEIVED
    },
    {
      label: i18next.t`page.transfer.stock.list.status.CANCELLED`,
      value: TransferConstants.STATUS.CANCELLED
    }
  ], [])


  /**
   * @type {[Paging, Function]} StatePaging
   */
  const [stPaging, setStPaging] = useState({
    totalItem: 0,
    page: 0
  });

  /**
   * @type {[TransferQueryParams, Function]} StateSearchParam
   */
  const [stSearchParams, setStSearchParams] = useState({
    searchBy: 'id',
    searchKeywords: undefined,
    originBranchId: 'ALL',
    destinationBranchId: 'ALL',
    createdByStaffId: 'ALL',
    status: 'ALL',
    fromDate: undefined,
    toDate: undefined,
    transferType: Constants.TRANSFER_TYPE.BRANCH
  })

  /**
   * @type {[TransferDTO[], Function]} StateItemList
   */
  const [stItemList, setStItemList] = useState([]);

  const [stIsFetching, setStIsFetching] = useState(false);

  const [stBranchList, setStBranchList] = useState([{
    label: i18next.t`component.product.edit.toolbar.branch.all`,
    value: 'ALL'
  }]);

  const [stStaffList, setStStaffList] = useState([
    {label: i18next.t('page.order.list.filter.allStaff'), value: 'ALL'},
  ]);

  const [stTransferBranchPair, setStTransferBranchPair] = useState({
    origin: undefined,
    destination: undefined
  });

  const [stBranchLabelList, setStBranchLabelList] = useState([]);

  useEffect(() => {
    fetchBranchLabelList()
    fetchBranchList()
    fetchStaffList()
  }, []);


  useEffect(() => {
    fetchData()
  }, [stPaging.page]);

  useEffect(() => {
    fetchData(0)
  }, [stSearchParams])

  /**
   * @param {number} branchId
   * @param {'origin'|'destination'} target
   */
  const updateTransferBranch = (branchId, target) => {
    setStTransferBranchPair(state => ({
      ...state,
      [target]: branchId
    }))
  }

  const fetchBranchList = () => {
    storeService.getFullStoreBranches()
        .then(pageRes => {
          setStBranchList(prevState => [...prevState, ...pageRes.data.map(b => ({label: b.name, value: b.id}))])
        })
  }

  const fetchBranchLabelList = () => {
    storeService.getStoreBranches(0, 9999)
        .then(branches => {
          setStBranchLabelList(prevState => [...prevState, ...branches.map(b => ({label: b.name, value: b.id}))])
        })
  }

  const fetchStaffList =() => {
    ItemService.getTransferAvailableStaff()
        .then(staffList => {
          // append storeOwner
          const storeOwnerUserId = parseInt(CredentialUtils.getStoreOwnerId());
          const storeOwner = staffList.find(staff => staff.userId === storeOwnerUserId)
          if (storeOwner) {
            storeOwner.name = i18next.t('page.order.detail.information.shopOwner')
            storeOwner.priority = 1
          }

          // add name for removed staff
          staffList = staffList.map(staff => staff.name? staff: {...staff, name: '-'});

          const staffListSorted = staffList.sort((a,b) => a.priority? -1: a.name.toLocaleUpperCase() < b.name.toLocaleUpperCase() ? -1 : 1) || [];

          let lstAccessStaff = [...stStaffList];
          staffListSorted.forEach(staff => {
            lstAccessStaff.push({value: staff.userId, label: staff.name});
          });
          setStStaffList(lstAccessStaff)
        })
  }

  const updateSearchParams = (param, value) => {
    setStSearchParams(state => ({
      ...state,
      [param]: value
    }))
  }

  const fetchData = _.debounce((page) => {
    setStIsFetching(true)
    const requestParams = buildRequest()
    ItemService.getTransferList(requestParams, page || stPaging.page, SIZE_PER_PAGE)
        .then(transferResponse => {
          setStItemList(transferResponse.data)
          setStPaging({
            page: page === undefined? stPaging.page:page,
            totalItem: transferResponse.total
          })
        })
        .finally(() => {
          setStIsFetching(false)
        })
  }, 100, {
    leading: true,
    trailing: false
  })

  const buildRequest = () => {
    /**
     * @type {TransferQueryParams}
     */
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
  }

  const onMegaFilterChange = (values) => {
    setStSearchParams({
      ...stSearchParams,
      ...values
    })
  }

  const getBranchName = (branchId) => {
    const branchObj = stBranchLabelList.find(branch => branch.value === branchId)
    if (branchObj) return branchObj.label
    return '-'
  }

  const getStaffName = (staffUserId) => {
    const staffObj = stStaffList.find(staff => staff.value === staffUserId)
    if (staffObj) return staffObj.label
    return '-'
  }

  const filterByDate = (event, picker) => {
    const fromDate = picker.startDate;
    const toDate = picker.endDate;
    setStSearchParams(state => ({
      ...state,
      fromDate: fromDate,
      toDate: toDate
    }))
  }


  const clearDate = (event, picker) => {
    setStSearchParams(state => ({
      ...state,
      fromDate: undefined,
      toDate: undefined
    }))
  }

  /**
   * @return {{label: string, value: string}[]}
   * @param excludedBranchId
   */
  const getBranchExclude = (excludedBranchId) => {
    if (excludedBranchId && excludedBranchId !== 'ALL') {
      return stBranchList.filter(branchObj => branchObj.value !== excludedBranchId)
    }
    return stBranchList
  }

  const onClickRow = (e, itemId) => {
    const url  = NAV_PATH.transferStockWizard + "/" + itemId
    switch (e.button) {
      case 0: // primary
        RouteUtils.redirectWithoutReload(props, url)
        return
      default:
        return;
    }
  }


  return (
      <GSContentContainer className="transfer-management" minWidthFitContent>
        <GSContentHeader
            title={
              <GSContentHeaderTitleWithExtraTag title={i18next.t("component.navigation.product.transfer")}
                                                extra={stPaging.totalItem}
              />
            }
        >
          <GSContentHeaderRightEl>
            <GSButton success linkTo={NAV_PATH.transferStockCreate}>
              <GSTrans t="page.transfer.stock.list.btn.createNew"/>
            </GSButton>
          </GSContentHeaderRightEl>
        </GSContentHeader>
        <GSContentBody size={GSContentBody.size.MAX} className="d-flex flex-column" style={{height: stItemList.length === 0 || stIsFetching? '100%':'unset'}}>

          <GSWidget className="h-100 flex-grow-1">
            <GSWidgetContent className=" d-flex  flex-column h-100" >
              <section className={cn("d-flex justify-content-between align-items-center", {
                'user-disabled': stIsFetching
              })}>
                <div className="d-flex align-items-center">
                  <GSSearchInput
                      liveSearchOnMS={500}
                      ref={refSearchInput}
                      placeholder={i18next.t(
                          "page.transfer.stock.list.searchByTransferId"
                      )}
                      style={{
                        width: "235",
                        height: '38px'
                      }}
                      onSearch={(value) => updateSearchParams('searchKeywords', value)}
                      type="number"
                  />

                </div>
                <div className="ml-auto d-flex">
                  {/*DATE TIME*/}
                  <GSDateRangePicker minimumNights={0}
                                     onApply={filterByDate}
                                     onCancel={clearDate}
                                     containerStyles={{
                                       width: '220px',
                                       marginRight: '.5rem'
                                     }}
                                     fromDate={stSearchParams.fromDate}
                                     toDate={stSearchParams.toDate}
                                     resultToString
                                     opens={"left"}
                                     readOnly
                  />
                  {/*MEGA FILTER*/}
                  <GSMegaFilter onSubmit={onMegaFilterChange} size="small">
                    <GSMegaFilterRowSelect name="originBranchId"
                                           i18Key="page.transfer.stock.list.origin"
                                           defaultValue={stSearchParams.originBranchId}
                                           options={getBranchExclude(stTransferBranchPair.destination)}
                                           ignoreCountValue={'ALL'}
                                           onChange={(branchId) => updateTransferBranch(branchId, "origin")}
                    />
                    <GSMegaFilterRowSelect name="destinationBranchId"
                                           i18Key="page.transfer.stock.list.destination"
                                           defaultValue={stSearchParams.destinationBranchId}
                                           options={getBranchExclude(stTransferBranchPair.origin)}
                                           ignoreCountValue={'ALL'}
                                           onChange={(branchId) => updateTransferBranch(branchId, "destination")}
                    />
                    <GSMegaFilterRowSelect name="createdByStaffId"
                                           i18Key="page.transfer.stock.list.createdBy"
                                           defaultValue={stSearchParams.createdByStaffId}
                                           options={stStaffList.filter(staff => staff.label !== '-')}
                                           ignoreCountValue={'ALL'}
                    />
                    <GSMegaFilterRowTag name="status"
                                        i18Key="component.custom.page.table.header.status"
                                        options={STATUS_OPTIONS}
                                        defaultValue={stSearchParams.status}
                                        ignoreCountValue={'ALL'}
                    />
                  </GSMegaFilter>
                </div>
              </section>
              {!stIsFetching &&
              <section className="mt-3">
                <GSTable>
                  <thead>
                  <tr className="white-space-nowrap text-center">
                    <th>
                      <GSTrans t={"page.transfer.stock.list.transferId"}/>
                    </th>
                    <th >
                      <GSTrans t={"component.custom.page.table.header.status"}/>
                    </th>
                    <th>
                      <GSTrans t={"page.transfer.stock.list.origin"}/>
                    </th>
                    <th >
                      <GSTrans t={"page.transfer.stock.list.destination"}/>
                    </th>
                    {/*<th>*/}
                    {/*    <GSTrans t={ 'page.transfer.stock.list.totalAmount' }/>*/}
                    {/*</th>*/}
                    {/*<th>*/}
                    {/*    <GSTrans t={ 'page.transfer.stock.list.commission' }/>*/}
                    {/*</th>*/}
                    <th>
                      <GSTrans t={"page.transfer.stock.list.createdDate"}/>
                    </th>
                    <th>
                      <GSTrans t={"page.transfer.stock.list.createdBy"}/>
                    </th>
                    <th>
                      <GSTrans t={"page.transfer.stock.list.note"}/>
                    </th>

                  </tr>
                  </thead>
                  <tbody>
                  {stItemList.map(item => {
                    return (
                        <tr key={item.id} className="gsa-hover--gray cursor--pointer"  onMouseDown={(e) => onClickRow(e, item.id)}>
                          <td>
                            <Link to={NAV_PATH.transferStockWizard + "/" + item.id}>
                              <strong>{item.id}</strong>
                            </Link>
                          </td>
                          <td className="white-space-nowrap">
                            <GSTrans t={`page.transfer.stock.list.status.${item.status}`} />
                          </td>
                          <td>
                            {getBranchName(item.originBranchId)}
                          </td>
                          <td>
                            {getBranchName(item.destinationBranchId)}
                          </td>
                          {/*<td></td>*/}
                          {/*<td></td>*/}
                          <td className="white-space-nowrap">
                            {moment(item.createdDate).format('HH:mm')}
                            <br />
                            {moment(item.createdDate).format('DD-MM-YYYY')}
                          </td>
                          <td className="white-space-nowrap">
                            {getStaffName(item.createdByStaffId)}
                          </td>
                          <td>
                            <div className="width-7rem line-clamp-3">
                              {item.note}
                            </div>
                          </td>
                        </tr>
                    )
                  })}
                  </tbody>
                </GSTable>
                <GSPagination totalItem={stPaging.totalItem}
                              currentPage={stPaging.page + 1}
                              onChangePage={onChangePage}
                              pageSize={SIZE_PER_PAGE}
                />
              </section>}



              {stItemList.length === 0 && !stIsFetching &&
              <GSWidgetEmptyContent className="flex-grow-1"
                                    iconSrc="/assets/images/transfer-empty.png"
                                    text={i18next.t("page.transfer.stock.list.haveNoTransferYet")}
                                    mode="vertical"
              />}

              {stIsFetching &&
              <GSWidgetLoadingContent/>
              }

            </GSWidgetContent>
          </GSWidget>
        </GSContentBody>
      </GSContentContainer>
  )
}

TransferManagement.propTypes = {

}

export default withRouter(TransferManagement)
