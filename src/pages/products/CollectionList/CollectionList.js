/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 25/06/2019
 * Author: Kun <tien.dao@mediastep.com>
 *******************************************************************************/

import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import {UikInput} from '../../../@uik'
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";
import './CollectionList.sass'
import React, {Component} from 'react';
import {Trans} from "react-i18next";
import {CollectionService} from "../../../services/CollectionService";
import i18next from "i18next";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import {CurrencyUtils} from "../../../utils/number-format";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {RouteUtils} from "../../../utils/route";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import Constants from "../../../config/Constant";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSImg from "../../../components/shared/GSImg/GSImg";
import PropTypes from "prop-types";

class ProductList extends Component{
    SIZE_PER_PAGE = 100

    constructor(props) {
        super(props);
        this.state = {
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            redirectTo: '',
            isRedirect: false,
            isFetching: false
        }

        this.filterConfig = {
            search: '',
            itemType: this.props.itemType ? this.props.itemType : Constants.ITEM_TYPE.BUSINESS_PRODUCT
        }
        // this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - collection List'));

        this.tableConfig = {
            headerList: [
                i18next.t("component.collection.list.table.thumbnail"),
                i18next.t("component.collection.list.table.name"),
                i18next.t("component.collection.list.table.condition"),
                i18next.t("component.collection.list.table.mode"),
                i18next.t("component.collection.list.table.product"),
                i18next.t("component.collection.list.table.action"),
            ]
        }

        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.redirectTo = this.redirectTo.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
        this.onChangeItemType = this.onChangeItemType.bind(this)
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

    // delete button
    onClickRemove(e, collectionId) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.collection.edit.remove.hint'),
            okCallback: () => {
                CollectionService.removeCollection(collectionId)
                    .then(result => {
                        
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_SUCCESS,
                            messages: i18next.t('component.collection.edit.remove.success'),
                            closeCallback: () =>{
                                if(this.state.itemList.length === 1){
                                    if(this.state.currentPage === 1){
                                        this.fetchData( 0, this.SIZE_PER_PAGE, this.filterConfig)
                                    }else{
                                        this.fetchData( this.state.currentPage - 2, this.SIZE_PER_PAGE, this.filterConfig)
                                    }
                                }else{
                                    this.fetchData( this.state.currentPage - 1, this.SIZE_PER_PAGE, this.filterConfig)
                                }
                            }
                        })

                    }, e => {
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_DANGER,
                            messages: i18next.t('component.collection.edit.remove.failed')
                        })
                    })
            }
        })
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

    onChangeItemType(itemType){
        this.filterConfig.itemType = itemType
        this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
    }

    fetchData(page, size, filterConfig) {

        this.setState({
            isFetching: true
        })

        CollectionService.getListCollection({page: page, size: size, itemType: filterConfig.itemType, search: filterConfig.search})
            .then(result => {
                if (this._isMounted) {
                    this.setState({
                        itemList: result.lstCollection,
                        totalPage: Math.ceil(result.totalItem / this.SIZE_PER_PAGE),
                        isFetching: false,
                        totalItem: result.totalItem,
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
    }

    render(){
        return( 
            <GSContentContainer minWidthFitContent className="collection-list-page">
                { this.state.isRedirect &&
                    <Redirect to={this.state.redirectTo}/>
                }
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag title={i18next.t(this.filterConfig.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT ? "component.collection.list.product.management" : "component.collection.list.service.management")}
                                                      extra={this.state.totalItem}
                    />
                }

                >
                    <GSContentHeaderRightEl>
                        {this.filterConfig.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT && <GSButton success onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.collectionCreate + '/' + Constants.COLLECTION_ITEM_TYPE.PRODUCT)}>
                            <GSTrans t={"component.collection.list.create.product"}/>
                        </GSButton>}
                        {this.filterConfig.itemType === Constants.ITEM_TYPE.SERVICE && <GSButton success onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.collectionServiceCreate + '/' + Constants.COLLECTION_ITEM_TYPE.SERVICE)}>
                            <GSTrans t={"component.collection.list.create.service"}/>
                        </GSButton>}
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className="collection-list__body">
                {/*COLLECTION LIST*/}
                <GSWidget>
                    <GSWidgetContent className="collection-list-widget">

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
                                    placeholder={i18next.t("component.collection.list.search_name")}
                                />
                            </span>
                        </div>

                        {!this.state.isFetching &&
                            <>
                        {/*DESKTOP*/}
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
                                    <section key={index + "_" + dataRow.id} className="gs-table-body-items">
                                        <div className="gs-table-body-item collection-table__td-thumbnail" id={'thumbnal-'+dataRow.id}>
                                            {
                                                <GSImg src={dataRow.url}
                                                       style={{
                                                           width: '4em',
                                                           height: '4em'
                                                       }}
                                                       showDefault={false}
                                                />
                                            }
                                                
                                        </div>
                                        <div className="gs-table-body-item collection-name">
                                            <b>
                                                {dataRow.name}
                                            </b>
                                        </div>
                                        <div className="gs-table-body-item collection-type">
                                            {dataRow.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT
                                                ? i18next.t('component.collection.list.table.productCollection') 
                                                : i18next.t('component.collection.list.table.serviceCollection')
                                            }
                                        </div>
                                        <div className="gs-table-body-item collection-type">
                                            {dataRow.collectionType === 'MANUAL' ? i18next.t('component.collection.list.table.type.manually') : i18next.t('component.collection.list.table.type.automated')}
                                        </div>
                                        <div className="gs-table-body-item products">
                                            {dataRow.productNumber}
                                        </div>
                                        <div className="gs-table-body-item actions btn-group__action">
                                            <i className="action-button first-button" 
                                                onClick={() => RouteUtils.linkTo(this.props, (dataRow.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT ? NAV_PATH.collectionEdit: NAV_PATH.collectionServiceEdit) + '/' + (dataRow.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT ? 'product': 'service') + '/' + dataRow.id)}>
                                            </i>

                                            <i className="action-button lastest-button" 
                                                onClick={(e) => this.onClickRemove(e,dataRow.id)}>
                                            </i>
                                        </div>
                                    </section>
                                    )
                                })
                            }
                        </PagingTable>
                       
                        {/*MOBILE*/}
                         <div className="mobile-collection-list-container d-mobile-flex d-desktop-none">
                            {
                                this.state.itemList.map((dataRow, index) => {
                                    return (
                                        <div key={"m-"+dataRow.id} className="m-collection-row">
                                            <div className="m-collection__image">
                                                {
                                                    dataRow.url &&
                                                    <img src={dataRow.url}
                                                    className="collection-table__thumbnail"/>
                                                }
                                            </div>
                                            <div className="m-collection__info">
                                                <div className="m-collection__info-name">
                                                    {dataRow.name}
                                                </div>
                                                <div className="m-collection__info-product">
                                                    {dataRow.collectionType === 'MANUAL' ? i18next.t('component.collection.list.table.type.manually') : i18next.t('component.collection.list.table.type.automated')}
                                                    {' | ' }
                                                    {dataRow.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT && <GSTrans t="productList.countProduct" values={{total: CurrencyUtils.formatThousand(dataRow.productNumber)}}/>}
                                                    {dataRow.itemType === Constants.ITEM_TYPE.SERVICE && <GSTrans t="serviceList.countService" values={{total: CurrencyUtils.formatThousand(dataRow.productNumber)}}/>}
                                                </div>
                                            </div>
                                            <div className="btn-group__action m-collection__action">
                                                <i className="action-button first-button" 
                                                    onClick={() => RouteUtils.linkTo(this.props, (dataRow.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT ? NAV_PATH.collectionEdit: NAV_PATH.collectionServiceEdit) + '/' + (dataRow.itemType === Constants.ITEM_TYPE.BUSINESS_PRODUCT ? 'product': 'service') + '/' + dataRow.id)}>
                                                </i>
                                                <i className="action-button lastest-button" 
                                                    onClick={(e) => this.onClickRemove(e,dataRow.id)}>
                                                </i>
                                            </div>
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
                                        <Trans i18nKey="component.collection.list.table.empty"/>
                                    </span>
                                </div>
                            </div>}
                        </>
                        }
                    </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.collection.title")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_COLLECTION} />
                </GSContentFooter>

                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
            </GSContentContainer>
        
        )
    }
}




export default connect()(ProductList);

ProductList.propTypes = {
  itemType: PropTypes.oneOf(Object.values(Constants.ITEM_TYPE))
};
