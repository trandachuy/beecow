import React, {useEffect, useState, useRef} from 'react'
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer"
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader"
import GSContentBody from "../../../components/layout/contentBody/GSContentBody"
import {UikWidget, UikWidgetContent} from '../../../@uik'
import {Trans} from "react-i18next"
import Loading from "../../../components/shared/Loading/Loading"
import './TikiProducts.sass'
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable"
import {CurrencyUtils} from "../../../utils/number-format"
import i18next from "i18next"
import tikiService from "../../../services/TikiService"
import Constants from "../../../config/Constant"
import {connect} from "react-redux"
import moment from 'moment'
import SelectSyncProductModal from "../../../components/shared/SelectSyncProductModal/SelectSyncProductModal"
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag"
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip"
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl"
import {RouteUtils} from "../../../utils/route"
import {NAV_PATH} from "../../../components/layout/navigation/Navigation"
import GSButton from "../../../components/shared/GSButton/GSButton"
import {CredentialUtils} from "../../../utils/credential"

const LABEL = {
    TABLE: {
        HEADER: [
            i18next.t("page.tiki.product.tbheader.id"),
            i18next.t("page.tiki.product.tbheader.thumbnail"),
            i18next.t("page.tiki.product.tbheader.productName"),
            i18next.t("page.tiki.product.tbheader.price"),
            i18next.t("page.tiki.product.tbheader.status"),
            i18next.t("page.tiki.product.tbheader.lastSynDate")
        ]
    },
    STATUS: {
        NEVER_SYNC: i18next.t('page.tiki.product.syn.status.never')
    },
    TITLE: i18next.t("page.tiki.product.title"),
}

const SIZE_PER_PAGE = 100

const TikiProduct = (props) => {
    const [stShop, setStShop] = useState(CredentialUtils.getTikiShopAccount())
    const [stPaging, setStPaging] = useState({
        currentPage: 1,
        totalPage: 1,
        totalItem: 0,
    })
    const [stItemList, setStItemList] = useState([])
    const [stIsFetching, setStIsFetching] = useState(false)
    const [stIsShowSelectedProduct, setStIsShowSelectedProduct] = useState(false)

    useEffect(() => {
        if (!stShop) {
            RouteUtils.linkTo(props, NAV_PATH.tikiAccount)
        } else {
            setStIsFetching(true)
            tikiService.updateProductStatus()
                .then(() => {
                    fetchData(1)
                })
        }
    }, [stShop])

    useEffect(() => {
        fetchData(stPaging.currentPage)
    }, [stPaging.currentPage])

    const onCloseCreateProduct = () => {
        setStIsShowSelectedProduct(false)
    }

    const onClickCreateProduct = () => {
        setStIsShowSelectedProduct(true)
    }

    const onChangeListPage = (pageIndex) => {
        updatePaging({currentPage: pageIndex})
    }

    const updatePaging = (obj) => {
        setStPaging((paging) => Object.assign({}, paging, obj))
    }

    const fetchData = (page) => {
        setStIsFetching(true)

        tikiService.getProducts({
            page: page - 1,
            size: SIZE_PER_PAGE
        })
            .then(({data, total}) => {
                setStItemList(data)
                updatePaging({
                    totalPage: Math.ceil(total / SIZE_PER_PAGE),
                    totalItem: total
                })
            })
            .finally(() => {
                setStIsFetching(false)
            })
    }

    const renderStatus = (status) => {
        const channel = 'Tiki'

        if (status) {
            let className = 'gs-status-tag '
            let text = 'page.tiki.product.status.'
            let tagStyle, tips
            switch (status) {
                case "SYNC":
                    className += 'gs-status-tag--sync'
                    text += 'sync'
                    tagStyle = GSStatusTag.STYLE.SUCCESS
                    tips = i18next.t('page.3thParty.product.inSync', {saleChannel: channel})
                    break
                case "DRAFT":
                    className += 'gs-status-tag--draft'
                    text += 'draft'
                    tagStyle = GSStatusTag.STYLE.SECONDARY
                    tips = i18next.t('page.3thParty.product.draft')
                    break
                case "ERROR":
                    className += 'gs-status-tag--error'
                    text += 'error'
                    tagStyle = GSStatusTag.STYLE.DANGER
                    tips = i18next.t('page.3thParty.product.error', {saleChannel: channel})
                    break
            }
            return (
                <GSComponentTooltip placement={GSComponentTooltipPlacement.LEFT} message={tips}>
                    <GSStatusTag tagStyle={tagStyle} text={i18next.t(text)}/>
                </GSComponentTooltip>
            )
        } else {
            return <GSStatusTag tagStyle={GSStatusTag.STYLE.LIGHT}
                                text={LABEL.STATUS.NEVER_SYNC}/>
        }
    }

    const renderLastSyncDate = (date) => {
        if (date == null) {
            return LABEL.STATUS.NEVER_SYNC
        } else {
            return moment(date).format('DD-MM-YYYY')
        }
    }

    return (
        <GSContentContainer className="tiki-product" minWidthFitContent>

            {stIsShowSelectedProduct &&
            <SelectSyncProductModal onClose={onCloseCreateProduct}
                                    channel={Constants.SaleChannelId.TIKI}/>}

            <GSContentHeader
                title={LABEL.TITLE}
                titleExpand={'(' + i18next.t("page.tiki.product.total.item", {
                    totalItem: stPaging.totalItem
                }) + ')'}
                subTitle={i18next.t("page.tiki.product.list.subTitle", {
                    saleChannel: 'Tiki',
                })}
            >
                <GSContentHeaderRightEl>
                    <GSButton success className="btn-save" onClick={onClickCreateProduct}>
                        <Trans i18nKey='page.tiki.product.addProduct' className="sr-only">
                            Create Product
                        </Trans>
                    </GSButton>
                </GSContentHeaderRightEl>
            </GSContentHeader>
            <GSContentBody size={GSContentBody.size.MAX}>
                <UikWidget className="gs-widget">
                    <UikWidgetContent>
                        {stIsFetching && <Loading/>}
                        {!stIsFetching && (
                            <PagingTable
                                headers={LABEL.TABLE.HEADER}
                                totalPage={stPaging.totalPage}
                                maxShowedPage={10}
                                currentPage={stPaging.currentPage}
                                onChangePage={onChangeListPage}
                                totalItems={stPaging.totalItem}
                            >
                                {stItemList.map((dataRow, index) => {
                                    return (
                                        <section key={index + "_" + dataRow.id} className="gs-table-body-items">
                                            <div className="gs-table-body-item">
                                                <span><b>{dataRow.id}</b></span>
                                            </div>
                                            <div id={'thumbnal-' + dataRow.id}>
                                                {dataRow.firstImageUrl
                                                    ? <img src={dataRow.firstImageUrl} className="thumbnail"/>
                                                    : "No Image"}
                                            </div>
                                            <div className="gs-table-body-item product-table__name">
                                                <span><b>{dataRow.name}</b></span>
                                            </div>
                                            <div>{CurrencyUtils.formatMoneyByCurrency(dataRow.price, dataRow.currency)}</div>
                                            <div>{renderStatus(dataRow.gosellStatus)}</div>
                                            <div>{renderLastSyncDate(dataRow.lastSyncDate)}</div>
                                        </section>
                                    )
                                })}
                            </PagingTable>
                        )}
                    </UikWidgetContent>
                </UikWidget>
            </GSContentBody>
        </GSContentContainer>
    )
}

export default connect()(TikiProduct)
