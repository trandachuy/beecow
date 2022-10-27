/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 15/06/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useRef, useState} from "react";
import "./MarketingEmailCampaignList.sass";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSContentHeaderRightEl
    from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSSearchInput from "../../../../components/shared/GSSearchInput/GSSearchInput";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTable from "../../../../components/shared/GSTable/GSTable";
import i18next from "i18next";
import GSWidgetEmptyContent from "../../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import {UikSelect} from "../../../../@uik";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {Link, withRouter} from "react-router-dom";
import {MailService} from "../../../../services/MailService";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSActionButton, {GSActionButtonIcons} from "../../../../components/shared/GSActionButton/GSActionButton";
import moment from 'moment'
import {MarketingEmailCampaignEnum} from "../MarketingEmailCampaignEnum";
import {RouteUtils} from "../../../../utils/route";
import GSPagination from "../../../../components/shared/GSPagination/GSPagination";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {GSToast} from "../../../../utils/gs-toast";
import HintPopupVideo from "../../../../components/shared/HintPopupVideo/HintPopupVideo";

const SIZE_PER_PAGE = 20
const MarketingEmailCampaignList = (props) => {
    const refSearchInput = useRef(null);

    const refConfirm = useRef(null);
    const [stCampaignListPaging, setStCampaignListPaging] = useState({
        totalItem: 0,
        page: 0
    });
    const [stSearchParams, setStSearchParams] = useState({
        search: undefined,
        filter: undefined
    });
    const [stCampaignList, setStCampaignList] = useState([]);
    const [stIsFetching, setStIsFetching] = useState(false);

    useEffect(() => {
        fetchData()
    }, [stCampaignListPaging.page]);


    useEffect(() => {
        if (!stSearchParams.search || !stSearchParams.filter) {
            return
        }

        fetchData(0)
    }, [stSearchParams.search, stSearchParams.filter])


    const fetchData = (page) => {
        setStIsFetching(true)
        MailService.getStoreMailByStore(page || stCampaignListPaging.page, SIZE_PER_PAGE, true, stSearchParams)
            .then(result => {
                setStCampaignListPaging(state => ({
                    ...state,
                    totalItem: result.totalItem,
                    page: page !== undefined? page : state.page
                }))
                setStCampaignList(result.data)
                setStIsFetching(false)
            })
    }


    const onEdit = (campaign) => {
        RouteUtils.redirectWithoutReload(props, NAV_PATH.marketing.EMAIL_EDIT + '/' + campaign.id)
    }

    const onClone = (campaign) => {
        MailService.cloneStoreMail(campaign.id)
            .then(() => {
                fetchData(0)
            })
    }

    const onDelete = (campaign) => {
        refConfirm.current.openModal({
            messages: i18next.t('page.marketing.email.editor.deleteConfirm'),
            okCallback: () => {
                refSearchInput.current.clearInput()
                MailService.deleteStoreMail(campaign.id)
                    .then(() => {
                        GSToast.commonDelete()
                        setStSearchParams(state => ({
                            search: undefined,
                            filter: undefined
                        }))
                        fetchData(0)
                    })
            }
        })
    }

    const updateSearchParams = (param, value) => {
        setStSearchParams(state => ({
            ...state,
            [param]: value
        }))
    }


    const onChangeFilter = ({value, label}) => {
        updateSearchParams('filter', value === 'all'? undefined:value)
    }

    const onChangePage = (page) => {
        setStCampaignListPaging(state => ({
            ...state,
            page: page - 1
        }))
    }

  return (
    <GSContentContainer className="marketing-email-campaign-list">
        <ConfirmModal ref={refConfirm}/>
      <GSContentHeader
        title={<GSTrans t={"page.marketing.email.list.title"} />}
      >
          <HintPopupVideo title={"Email management"} category={"EMAIL_CAMPAIGN"}/>
        <GSContentHeaderRightEl>
          <Link
            to={NAV_PATH.marketing.EMAIL_CREATE}
            style={{
              textDecoration: "none",
            }}
          >
            <GSButton success>
              <GSTrans t="page.marketing.email.btn.createNewCampaign" />
            </GSButton>
          </Link>
        </GSContentHeaderRightEl>
      </GSContentHeader>
      <GSContentBody
        size={GSContentBody.size.MAX}
        className="h-100 d-flex flex-column"
      >
        <GSWidget className="flex-grow-1">
          <GSWidgetContent className="d-flex flex-column h-100">
            <section className="d-flex justify-content-between align-items-center">
              <GSSearchInput
                liveSearchOnMS={500}
                ref={refSearchInput}
                placeholder={i18next.t(
                  "page.marketing.email.searchByCampaignName"
                )}
                style={{
                  maxWidth: "300px",
                }}
                onSearch={(value) => updateSearchParams('search', value)}
              />
              <UikSelect
                  style={{
                      width: '150px'
                  }}
                  position="top-right"
                defaultValue={stSearchParams.filter || 'all'}
                key={stSearchParams.filter || 'all'}
                onChange={onChangeFilter}
                options={[
                  {
                    value: "all",
                    label: i18next.t("component.product.edit.toolbar.status.all"),
                  },
                  {
                    value: MarketingEmailCampaignEnum.CAMPAIGN_STATUS.DRAFT,
                    label: i18next.t("page.marketing.email.status.draft"),
                  },
                  {
                    value: MarketingEmailCampaignEnum.CAMPAIGN_STATUS.SEND,
                    label: i18next.t("page.marketing.email.status.sent"),
                  },
                ]}
              />
            </section>
              {!stIsFetching &&
              <section className="mt-3">
                  <GSTable>
                      <thead>
                      <tr>
                          <th>
                              <GSTrans t="page.marketing.email.table.campaignName"/>
                          </th>
                          <th className="gsa-white-space--nowrap">
                              <GSTrans t="page.marketing.email.table.status"/>
                          </th>
                          <th className="gsa-white-space--nowrap">
                              <GSTrans t="page.marketing.email.table.lastModified"/>
                          </th>

                          <th style={{
                              width: '10rem'
                          }}>
                              <GSTrans t="page.marketing.email.table.action"/>
                          </th>
                      </tr>
                      </thead>
                      <tbody>
                      {stCampaignList.map(campaign => (
                          <CampaignRow campaign={campaign}
                                       key={campaign.id}
                                       onClickClone={onClone}
                                       onClickDelete={onDelete}
                                       onClickEdit={onEdit}
                          />
                      ))}
                      </tbody>
                  </GSTable>
                  <GSPagination totalItem={stCampaignListPaging.totalItem}
                                currentPage={stCampaignListPaging.page + 1}
                                onChangePage={onChangePage}
                                pageSize={SIZE_PER_PAGE}
                                />
              </section>
              }

              {stIsFetching &&
                <section className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                </section>
              }

              {stCampaignList.length === 0 && !stIsFetching &&
                  <GSWidgetEmptyContent
                      text={i18next.t("page.marketing.email.emptyList")}
                      iconSrc={"/assets/images/icon_email_empty.png"}
                      className="h-100 flex-grow-1"
                  />
              }
          </GSWidgetContent>
        </GSWidget>
      </GSContentBody>
    </GSContentContainer>
  );
};

const CampaignRow = ({campaign, onClickEdit, onClickClone, onClickDelete}) => {
    return (
        <tr>
            <td >
                <div style={{
                    height: '50px',
                    overflowY: 'hidden'
                }} className="d-flex align-items-center">
                    {campaign.campaignName}
                </div>
            </td>
            <td>
                {i18next.t(`page.marketing.email.status.${campaign.status.toLowerCase()}`)}
            </td>
            <td>
                <div className="d-flex flex-column">
                    <span>
                        {moment(campaign.lastModifiedDate).format('HH:mm')}
                    </span>
                    <span className="gsa-white-space--nowrap">
                        {moment(campaign.lastModifiedDate).format('DD-MM-YYYY')}
                    </span>
                </div>
            </td>
            <td>
                <div >
                    <GSActionButton icon={GSActionButtonIcons.EDIT}
                                    title={i18next.t("component.product.addNew.imageView.Edit")}
                                    disabled={campaign.status === MarketingEmailCampaignEnum.CAMPAIGN_STATUS.SEND}
                                    onClick={() => onClickEdit(campaign)}
                    />
                    <GSActionButton icon={GSActionButtonIcons.CLONE}
                                    className="ml-2"
                                    title={i18next.t("component.marketing.landing.dropdown.action.clone")}
                                    onClick={() => onClickClone(campaign)}
                    />
                    <GSActionButton icon={GSActionButtonIcons.DELETE}
                                    className="ml-2"
                                    title={i18next.t("component.marketing.landing.dropdown.action.delete")}
                                    onClick={() => onClickDelete(campaign)}
                    />
                </div>
            </td>
        </tr>
    )
}

MarketingEmailCampaignList.propTypes = {};

export default withRouter(MarketingEmailCampaignList);
