import React, { useEffect, useRef, useState } from "react";
import "./AffiliateCommission.sass";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import i18next from "i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import { Trans } from "react-i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSActionButton, {
    GSActionButtonIcons,
} from "../../../components/shared/GSActionButton/GSActionButton";
import { NAV_PATH } from "../../../components/layout/navigation/Navigation";
import ConfirmModal, {
    ConfirmModalUtils,
} from "../../../components/shared/ConfirmModal/ConfirmModal";
import { GSToast } from "../../../utils/gs-toast";
import affiliateService from "../../../services/AffiliateService";
import GSContentHeaderTitleWithExtraTag from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import { RouteUtils } from "../../../utils/route";
import { CommissionTypeEnum } from "../../../models/CommissionTypeEnum";
import GSTable from "../../../components/shared/GSTable/GSTable";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSWidgetEmptyContent from "../../../components/shared/GSWidgetEmptyContent/GSWidgetEmptyContent";
import GSPagination from "../../../components/shared/GSPagination/GSPagination";
import GSComponentTooltip from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import {NavigationPath} from "../../../config/NavigationPath";

const AffiliateCommission = (props) => {
    const SIZE_PER_PAGE = 50;
    const [itemList, setItemList] = useState([]);
    const [stPaging, setStPaging] = useState({
        totalItem: 0,
        page: 0,
    });
    useEffect(() => {
        getCommission(0, SIZE_PER_PAGE)
    }, [])

    useEffect(() => {
        getCommission(stPaging.page, SIZE_PER_PAGE)
    }, [stPaging.page])

    const refConfirmDeleteModal = useRef(null);

    const renderLongString = (s, maxLength) => {
        const string = new String(s || '')

        if (!string || string.length <= maxLength) {
            return string
        }

        return (
            <GSComponentTooltip
                message={string}
                placement={GSTooltip.PLACEMENT.BOTTOM}
            >
                {string.substring(0, 29)}...
            </GSComponentTooltip>
        )
    }

    const renderCommissionType = (type) => {
        let commissionType;

        if(type === CommissionTypeEnum.TYPE.APPLIES_TO_ALL_PRODUCTS){
            commissionType = i18next.t('page.affiliate.partner.filter.commissionType.All_PRODUCTS')

        } else if(type === CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_PRODUCTS){
            commissionType = i18next.t('page.affiliate.partner.filter.commissionType.SPECIFIC_PRODUCTS')

        } else if(type === CommissionTypeEnum.TYPE.APPLIES_TO_SPECIFIC_COLLECTIONS){
            commissionType = i18next.t('page.affiliate.partner.filter.commissionType.SPECIFIC_COLLECTION')

        }

        return (
            <span>{commissionType}</span>
        )
    }

    const getCommission = (page, size) => {
        affiliateService.getAllCommissionsByStore(page, size).then(res => {
            setItemList(res.data)
            const totalItem = parseInt(res.headers['x-total-count'])
            setStPaging({
                page: page === undefined ? stPaging.page : page,
                totalItem: totalItem
            })
        })
    }

    const onChangePage = (page) => {
        setStPaging(state => ({
            ...state,
            page: page - 1
        }))
    }

    const deleteCommission = (id) => {
        ConfirmModalUtils.openModal(refConfirmDeleteModal, {
            messages: <><p>{i18next.t(`page.affiliate.list.deleteConfirmTitle`)}</p>
                <p>{i18next.t("page.affiliate.list.deleteConfirmNotice")}</p></>,
            modalTitle: i18next.t`page.affiliate.list.deleteConfirmText`,
            okCallback: () => {
                affiliateService.deleteCommission(id)
                    .then(() => {
                        GSToast.commonDelete()
                        RouteUtils.redirectWithReload(NAV_PATH.affiliateCommission)
                    })
                    .catch(() => {
                        GSToast.commonError()
                    })
            }
        })
    }

    return (
        <GSContentContainer className="commission gsa-min-width--fit-content">
            <ConfirmModal ref={refConfirmDeleteModal} modalClass={"delete-commission"}/>
            <GSContentHeader className="commission-header" title={
                <GSContentHeaderTitleWithExtraTag
                    title={i18next.t("page.affiliate.commission.management")}
                    extra={stPaging.totalItem}
                />
            }
            >
                <GSButton success linkTo={NavigationPath.affiliateCommissionCreate} className="btn-save" linkToClassName="ml-auto mt-2 mt-md-0 d-inline-block">
                    <i className="icon-plus"/>
                    <Trans i18nKey="page.affiliate.commission.addCommission" className="sr-only">
                        Add Commission
                    </Trans>
                </GSButton>
            </GSContentHeader>
            <GSContentBody
                size={GSContentBody.size.MAX}
                className="d-flex flex-column flex-grow-1"
            >
                <GSWidget className="flex-grow-1 d-flex flex-column mb-0">
                    <GSWidgetContent className="d-flex flex-column flex-grow-1">
                        {/*DATA TABLE*/}
                        <div className="d-flex flex-column flex-grow-1 mt-3 affiliate-commission__table">
                            <GSTable>
                                <colgroup>
                                    <col style={{width: '30%'}}/>
                                    <col style={{width: '15%'}}/>
                                    <col style={{width: '15%'}}/>
                                    <col style={{width: '15%'}}/>
                                    <col style={{width: '15%'}}/>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>
                                        <GSTrans t="page.affiliate.commission.name"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.commission.type"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.commission.rate"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.commission.partners"/>
                                    </th>
                                    <th>
                                        <GSTrans t="page.affiliate.commission.action"/>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {itemList && itemList.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="white-space-pre"
                                    >
                                        <td>
                                            {renderLongString(item.name, 30)}
                                        </td>
                                        <td>
                                            {renderCommissionType(item.type)}
                                        </td>
                                        <td>
                                            {item.rate}%
                                        </td>
                                        <td>
                                            {item.totalPartner}
                                        </td>
                                        <td>
                                            <div className="d-flex">
                                                <GSActionButton icon={GSActionButtonIcons.EDIT}
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateCommissionEdit + '/' + item.id)
                                                                }}
                                                />
                                                <GSActionButton icon={GSActionButtonIcons.DELETE} marginLeft
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    deleteCommission(item.id)
                                                                }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </GSTable>

                            {itemList && itemList.length === 0 && (
                                <GSWidgetEmptyContent
                                    iconSrc="/assets/images/affiliate/empty_commission.svg"
                                    text={i18next.t(
                                        "page.affiliate.commission.empty"
                                    )}
                                    className="flex-grow-1"
                                />
                            )}

                            <GSPagination
                                totalItem={stPaging.totalItem}
                                currentPage={stPaging.page + 1}
                                onChangePage={onChangePage}
                                pageSize={SIZE_PER_PAGE}
                            />
                        </div>
                    </GSWidgetContent>
                </GSWidget>
            </GSContentBody>
        </GSContentContainer>
    )
}

export default AffiliateCommission