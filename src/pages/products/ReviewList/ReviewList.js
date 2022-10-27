/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2019
 * Author: Kun <tien.dao@mediastep.com>
 *******************************************************************************/

import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import {UikInput, UikSelect, UikToggle} from '../../../@uik'
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";
import './ReviewList.sass'
import React, {Component} from 'react';
import {Trans} from "react-i18next";
import {ItemService} from "../../../services/ItemService";
import i18next from "i18next";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSImg from "../../../components/shared/GSImg/GSImg";
import moment from 'moment';
import {CredentialUtils} from "../../../utils/credential";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import storeService from "../../../services/StoreService";
import {GSToast} from "../../../utils/gs-toast";
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";

class ReviewList extends Component{
    SIZE_PER_PAGE = 10

    constructor(props) {
        super(props);
        this.state = {
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            redirectTo: '',
            isRedirect: false,
            isFetching: false,
            currentExpand: 0,
            storeReviewStatus: undefined
        }

        this.filterConfig = {
            search: '',
            sort: 'reviewDate,DESC'
        }
        // this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - collection List'));

        this.tableConfig = {
            headerList: [
                '',
                i18next.t("component.review_product.list.table.thumbnail"),
                i18next.t("component.review_product.list.table.name"),
                i18next.t("component.review_product.list.table.rating"),
                i18next.t("component.review_product.list.table.review"),
                i18next.t("component.review_product.list.table.customer_name"),
                i18next.t("component.review_product.list.table.created_date"),
                i18next.t("component.review_product.list.table.action"),
            ]
        }

        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.redirectTo = this.redirectTo.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.onInputSearch = this.onInputSearch.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this)
        this.renderRating = this.renderRating.bind(this)

        this.filterItemTypeValues = [
            {
                value:'reviewDate,DESC',
                label: i18next.t("component.review_product.list.filter.new_to_old"),
            },
            {
                value:'reviewDate,ASC',
                label: i18next.t("component.review_product.list.filter.old_to_new"),
            },
            {
                value: 'rate,DESC',
                label: i18next.t("component.review_product.list.filter.high_to_low"),
            },
            {
                value: 'rate,ASC',
                label: i18next.t("component.review_product.list.filter.low_to_high"),
            }

        ]
    }

    onInputSearch(e) {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            this.filterConfig.search = value
            this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
            e.preventDefault()
        }, 1000)
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        })

        this.fetchData(pageIndex - 1, this.SIZE_PER_PAGE, this.filterConfig)
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    redirectTo(path) {
        this.setState({
            redirectTo: path,
            isRedirect: true
        })
    }

    onChangeFilter(sort){
        this.filterConfig.sort = sort
        this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
    }

    onCollapseOrExpand(reviewId){
        this.setState({currentExpand: reviewId})
    }

    fetchData(page, size, filterConfig) {
        this.setState({
            isFetching: true,
            currentExpand:0
        })

        ItemService.fetchDashboardReview({
            page: page,
            size: size,
            sort: filterConfig.sort,
            'itemName.contains' : filterConfig.search
        })
            .then(result => {
                if (this._isMounted) {
                    const totalItem = parseInt(result.headers['x-total-count'])
                    this.setState({
                        itemList: result.data,
                        totalPage: Math.ceil(totalItem/ this.SIZE_PER_PAGE),
                        isFetching: false,
                        totalItem: totalItem,
                        currentPage: page + 1
                    })
                }

            }, (e) => {
                if (this._isMounted) {
                    this.setState({
                        isFetching: false
                    })
                }
            })
        ItemService.fetchStoreReviewEnableStatus().then(storeReviewStatusResult => {
            this.setState({
                storeReviewStatus: storeReviewStatusResult.data.isEnableReview
            })
        })
    }

    onClickEnableItemReview = async (event, id) => {
        const checked = event.currentTarget.checked;
        const request = {
            id: id,
            enableReview: checked
        };
        await ItemService.setItemReviewEnableStatusForItem(request)
            .then(() => {
                let message = "component.review_product.list.management.enable.item.review"
                if(!request.enableReview) {
                    message = "component.review_product.list.management.disable.item.review"
                }
                GSToast.success(message, true);
            })
            .catch((e) => {
                GSToast.commonError();
            });
        this.componentDidMount()
    }

    onClickEnableItemReviewForStore = async (event) => {
        const checked = event.currentTarget.checked;
        const storeId = storageService.getFromLocalStorage(Constants.STORAGE_KEY_STORE_ID);
        const request = {
            storeId: storeId,
            isEnableReview: checked
        }
        await ItemService.setReviewEnableStatusForStore(request)
            .then(() => {
                let message = "component.review_product.list.management.enable.store.review"
                if(!request.isEnableReview) {
                    message = "component.review_product.list.management.disable.store.review"
                }
                GSToast.success(message, true);
            })
            .catch((e) => {
                GSToast.commonError();
            });
        this.componentDidMount()
    }

    renderRating(rate) {
        if(rate && rate > 0) {
            return (
                <div className="gs-table-body-item product-rating m-review-rating">

                    <b>
                        {rate}
                    </b>
                    <a>
                        <i className="fa fa-star" aria-hidden="true"></i>
                    </a>
                </div>
            )
        }
        else {
            return (
                <div className="gs-table-body-item product-rating">
                </div>
            )
        }

    }

    render(){
        return(
            <GSContentContainer minWidthFitContent className="product-review-list-page">
                { this.state.isRedirect &&
                <Redirect to={this.state.redirectTo}/>
                }
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t("component.review_product.list.management")}
                        extra={this.state.totalItem}
                    />
                }

                >
                    <GSContentHeaderRightEl>
                        <GSComponentTooltip
                            placement={GSComponentTooltipPlacement.BOTTOM}
                            interactive
                            html={
                                this.state.storeReviewStatus ?
                                    <GSTrans i18nKey={'component.review_product.list.management.enable.store.review'}/> :
                                    <GSTrans i18nKey={'component.review_product.list.management.disable.store.review'}/>
                            }>
                            <div style={{'display': 'flex'}}>
                                <div style={{'color': 'color: #000000'}}><GSTrans
                                    t="component.review_product.list.management.toggle.enable.product.review"/></div>
                                <div>
                                    <UikToggle
                                        defaultChecked={this.state.storeReviewStatus}
                                        onClick={(e) => this.onClickEnableItemReviewForStore(e)}
                                    ></UikToggle>
                                </div>
                            </div>
                        </GSComponentTooltip>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className="review-product-list__body">
                    {/*REVIEW LIST*/}
                    <GSWidget>

                        <GSWidgetContent className="product-review-list-widget">

                            { this.state.isFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                            }

                            {/*DESKTOP VERSION*/}
                            <div className={"n-filter-container d-mobile-none d-desktop-flex " + (this.state.isFetching? 'gs-atm--disable':'')}>
                                {/*SEARCH*/}
                                <span style={{
                                    marginRight: 'auto'
                                }} className="gs-search-box__wrapper">
                                <UikInput
                                    key={this.filterConfig.search}
                                    defaultValue={this.filterConfig.search}
                                    autoFocus={this.filterConfig.search.length > 0 ? true : false}
                                    onChange={this.onInputSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("component.review_product.list.search_name")}
                                />
                            </span>

                                {/* TIME SEARCH */}
                                <UikSelect
                                    defaultValue={this.filterItemTypeValues[0].value}
                                    options={ this.filterItemTypeValues }
                                    onChange={ (item) => this.onChangeFilter(item.value)}
                                    position="bottomRight"
                                />
                            </div>

                            {/*mobile VERSION*/}
                            <div className={"n-filter-container--mobile d-mobile-flex d-desktop-none " + (this.state.isFetching? 'gs-atm--disable':'')}>
                                {/*SEARCH*/}
                                <div className="row">
                                    <div className="col-12 col-sm-12">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                    <UikInput
                                        key={this.filterConfig.search}
                                        defaultValue={this.filterConfig.search}
                                        autoFocus={this.filterConfig.search.length > 0 ? true : false}
                                        onChange={this.onInputSearch}
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        placeholder={i18next.t("component.review_product.list.search_name")}
                                    />
                                </span>
                                    </div>
                                </div>


                                {/* TIME SEARCH */}
                                <div className="row">
                                    <div className="col-12 col-sm-12">
                                        <UikSelect
                                            defaultValue={this.filterItemTypeValues[0].value}
                                            options={ this.filterItemTypeValues }
                                            onChange={ (item) => this.onChangeFilter(item.value)}
                                            position="bottomRight"
                                        />
                                    </div>
                                </div>

                            </div>



                            {!this.state.isFetching &&
                            <>
                                {/*DESKTOP TABLE*/}
                                <PagingTable
                                    headers={this.tableConfig.headerList}
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={10}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.totalItem}
                                    hidePagingEmpty
                                    className="d-mobile-none d-desktop-block"
                                >
                                    {this.state.itemList.map((dataRow, index) => {
                                        return (
                                            <>
                                                <section
                                                    key={index + "_" + dataRow.id}
                                                    className="gs-table-body-items gsa-hover--gray"
                                                    onClick={() => this.onCollapseOrExpand(dataRow.id)}
                                                >
                                                    <div className="shortest-row">
                                                        <div className="gs-table-body-item expand-col">
                                                            <i className={this.state.currentExpand === dataRow.id ? 'expanding' : 'collapsing'}></i>
                                                        </div>
                                                        <div className="gs-table-body-item review-table__td-thumbnail" id={'thumbnal-'+dataRow.id}>
                                                            {
                                                                <GSImg src={dataRow.itemThumbnail} style={{width: '4em',height: '4em'}} showDefault={false}/>
                                                            }
                                                        </div>
                                                        <div className="gs-table-body-item product-name">
                                                            <b>
                                                                {dataRow.itemName}
                                                            </b>
                                                        </div>
                                                        {this.renderRating(dataRow.rate)}

                                                        <div className="gs-table-body-item product-review">
                                                            <span className="title">{dataRow.title}</span>
                                                            <span className="description line-clamp-2">{dataRow.description}</span>
                                                        </div>
                                                        <div className="gs-table-body-item customer-name">
                                                            {dataRow.userName}
                                                        </div>
                                                        <div className="gs-table-body-item created-date">
                                                            {moment(dataRow.reviewDate).format('DD/MM/YYYY')}
                                                        </div>
                                                        <div className="gs-table-body-item actions btn-group__action">
                                                            <div>
                                                                <a className="action-button first-button" href={`https://${CredentialUtils.getStoreUrl()}.${process.env.STOREFRONT_DOMAIN}/product/${dataRow.itemId}?tab=review`} target="_blank"></a>
                                                            </div>
                                                            <div style={{'marginLeft': '-60px'}}>
                                                                <UikToggle className="action-button lastest-button toggle-btn"
                                                                           defaultChecked={dataRow.enableReview}
                                                                           key={dataRow.enableReview}
                                                                           onClick={(e) => this.onClickEnableItemReview(e, dataRow.id)}
                                                                           disabled={!this.state.storeReviewStatus}>
                                                                </UikToggle>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {
                                                        this.state.currentExpand === dataRow.id &&
                                                        <div className="detail-row">
                                                            <div className="gs-table-body-item expand-col">
                                                            </div>
                                                            <div className="gs-table-body-item review-table__td-thumbnail">
                                                            </div>
                                                            <div className="gs-table-body-item full-review">
                                                                <span className="title">{dataRow.title}</span>
                                                                <pre className="description">{dataRow.description}</pre>
                                                            </div>
                                                        </div>
                                                    }


                                                </section>
                                            </>
                                        )
                                    })
                                    }
                                </PagingTable>

                                {/*MOBILE TABLE*/}
                                <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">
                                    {
                                        this.state.itemList.map((dataRow, index) => {
                                            return (
                                                <div key={"m-"+dataRow.id} className="m-review-row gsa-hover--gray" onClick={() => this.onCollapseOrExpand(dataRow.id)} >
                                                    <div className="m-review-row__short">
                                                        <div className="gs-table-body-item m-expand-col">
                                                            <i className='collapsing'></i>
                                                        </div>
                                                        <div className="m-product__image">
                                                            <img src={dataRow.itemThumbnail}  className="review-table__thumbnail"/>
                                                        </div>
                                                        <div className="m-review__info mt-2">
                                                            <div className="m-review-name line-clamp-2">
                                                                <b>
                                                                    {dataRow.itemName}
                                                                </b>
                                                            </div>
                                                            {this.renderRating(dataRow.rate)}
                                                            <div className="m-review-name">
                                                                {dataRow.userName}
                                                            </div>
                                                            <div className="m-review-created__date">
                                                                {moment(dataRow.reviewDate).format('hh:mm DD/MM/YYYY')}
                                                            </div>
                                                            <div className="m-review-title">
                                                                <span className="title">{dataRow.title}</span>
                                                                <span className="description">{dataRow.description}</span>
                                                            </div>
                                                        </div>
                                                        <div className='m-review__action mt-2'>
                                                            <a className="action-button first-button" href={`https://${CredentialUtils.getStoreUrl()}.${process.env.STOREFRONT_DOMAIN}/product/${dataRow.itemId}?tab=review`} target="_blank"></a>
                                                            <div>
                                                                <UikToggle className="action-button lastest-button toggle-btn"
                                                                           defaultChecked={dataRow.enableReview}
                                                                           key={dataRow.enableReview}
                                                                           onClick={(e) => this.onClickEnableItemReview(e, dataRow.id)}
                                                                           disabled={!this.state.storeReviewStatus}>
                                                                </UikToggle>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/*{*/}
                                                    {/*    this.state.currentExpand === dataRow.id &&*/}
                                                    {/*    <div className="m-review-row__detail">*/}
                                                    {/*        <div className="gs-table-body-item m-expand-col">*/}

                                                    {/*        </div>*/}
                                                    {/*        <div className="m-review-detail__body">*/}
                                                    {/*            <span className="title">{dataRow.title}</span>*/}
                                                    {/*            <pre className="">{dataRow.description}</pre>*/}
                                                    {/*            <span className="customer-name">{dataRow.userName}</span>*/}
                                                    {/*        </div>*/}

                                                    {/*    </div>*/}
                                                    {/*}*/}

                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <PagingTable
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={1}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.itemList.length}
                                    className="m-paging d-mobile-flex d-desktop-none"
                                />

                                {this.state.itemList.length === 0 &&
                                <div className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                    <div>
                                        <img src="/assets/images/icon-Empty.svg"/>
                                        {' '}
                                        <span>
                                        <Trans i18nKey="component.review_product.list.table.empty"/>
                                    </span>
                                    </div>
                                </div>}
                            </>
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>

                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
            </GSContentContainer>

        )
    }
}




export default connect()(ReviewList);



