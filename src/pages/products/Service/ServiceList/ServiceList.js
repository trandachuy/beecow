/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 17/10/2019
 * Author: Kun <tien.dao@mediastep.com>
 *******************************************************************************/

import '../../../../../sass/ui/_gswidget.sass'
import '../../../../../sass/ui/_gsfrm.sass'
import {UikInput, UikSelect} from '../../../../@uik'

import {Redirect} from "react-router-dom";
import {connect} from "react-redux";
import './ServiceList.sass'
import React, {Component} from 'react';
import {Trans} from "react-i18next";
import {ItemService} from "../../../../services/ItemService";
import i18next from "i18next";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import {ImageUtils} from "../../../../utils/image";
import {RouteUtils} from "../../../../utils/route";
import GSStatusTag from "../../../../components/shared/GSStatusTag/GSStatusTag";
import GSContentHeaderRightEl
    from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import GSContentHeaderTitleWithExtraTag
    from "../../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import Constants from "../../../../config/Constant";
import {CollectionService} from "../../../../services/CollectionService";
import GSContextMenu from '../../../../components/shared/GSContextMenu/GSContextMenu';
import i18n from '../../../../config/i18n';

const PRODUCT_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ERROR: 'ERROR'
}

class ProductList extends Component{
    SIZE_PER_PAGE = 100
    SIZE_COLLECTION_PER_PAGE = 10

    constructor(props) {
        super(props);
        this.state = {
            // 
            redirectTo: '',
            isRedirect: false,
            isFetching: false,
            filterCount: 0,
            isFilterMobileShow: false,

            // service
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            
            // collection
            lstCollection: [],
            currentCollection: null,
            keywordCollection: '',
            currentPageCollection: 0,
            totalPageCollection: 0,
            isLoadingCollection: false

        }

        this.tableConfig = {
            headerList: [
                i18next.t("serviceList.tbheader.serviceThumbnail"),
                i18next.t("serviceList.tbheader.serviceName"),
                i18next.t("serviceList.tbheader.serviceStatus"),
                i18next.t("serviceList.tbheader.serviceAction")
            ]
        }

        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.redirectTo = this.redirectTo.bind(this)
        this.filter = this.filter.bind(this)
        this.searchService = this.searchService.bind(this)
        this.onSearchKeyPress = this.onSearchKeyPress.bind(this);
        this.toggleFilterMobileModal = this.toggleFilterMobileModal.bind(this);
        this.onSubmitFilter = this.onSubmitFilter.bind(this);
        this.onKeyPressCollectionSearch = this.onKeyPressCollectionSearch.bind(this)
        this.onScrollCollectionList = this.onScrollCollectionList.bind(this);
        this.onSelectCollection = this.onSelectCollection.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this);
        this.filterByStatus = this.filterByStatus.bind(this)

        this.filterStatusValues = [
            {
                value: 'all',
                label: i18next.t("component.product.edit.toolbar.status.all"),
            },
            {
                value: 'active',
                label: i18next.t("component.product.edit.toolbar.status.active"),
            },
            {
                value: 'inactive',
                label: i18next.t("component.product.edit.toolbar.status.inactive"),
            },
            {
                value: 'error',
                label: i18next.t("component.product.edit.toolbar.status.error"),
            }
        ]

        this.filterConfig = {
            search: '',
            status: this.filterStatusValues[0].value.toUpperCase(),
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.searchService(1, this.SIZE_PER_PAGE, this.filterConfig)
        this.searchCollection(0, this.SIZE_COLLECTION_PER_PAGE, this.state.keywordCollection)
    } 

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    ///////////////////////////////////////////////////////////SERVICE SEARCH //////////////////////////////////////////////////////////
    searchService(page, size, filterConfig) {
        this.setState({
            isFetching: true
        })

        const convertAllToNull = (text) => {
            if (text && text.toUpperCase() === 'ALL') {
                return null
            }
            return text
        }

        ItemService.fetchDashboardServices({
            collectionId: this.state.currentCollection ? this.state.currentCollection.id : null,
            search: filterConfig.search,
            page: page - 1,
            size: size,
            sort: 'lastModifiedDate,desc',
            bhStatus: convertAllToNull(filterConfig.status)
        }).then(result => {
                const totalItem = parseInt(result.headers['x-total-count'])
                if (this._isMounted) {
                    this.setState({
                        itemList: result.data,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                        isFetching: false,
                        totalItem: totalItem
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

    // search service name
    onSearchKeyPress(e) {
        if (e.key === 'Enter') {
            this.filterConfig.search = e.currentTarget.value
            this.searchService(1, this.SIZE_PER_PAGE, this.filterConfig)
            e.preventDefault()
        }
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        })
        this.searchService(pageIndex, this.SIZE_PER_PAGE, this.filterConfig)
    }

    ///////////////////////////////////////////////////////////COLLECTION SEARCH //////////////////////////////////////////////////////////
    searchCollection(page, size, search){
        this.setState({
            isLoadingCollection: true
        })

        CollectionService.getListCollectionWithKeyword(page, size, search, Constants.ITEM_TYPE.SERVICE)
            .then(result => {
                if (this._isMounted) {

                    if(page == 0 && result.data){
                        this.setState({lstCollection: result.data})
                    }if(page > 0 && result.data){
                        this.setState({lstCollection: [...this.state.lstCollection, ...result.data]})
                    }

                    const totalItem = parseInt(result.headers['x-total-count'])

                    this.setState({
                        totalPageCollection: Math.ceil(totalItem/ this.SIZE_COLLECTION_PER_PAGE),
                        currentPageCollection: page,
                        isLoadingCollection: false,
                    })
                }

            }, (e) => {
                if (this._isMounted) {
                    this.setState({
                        isLoadingCollection: false
                    })
                }
            })
    }

    // search collection name
    onKeyPressCollectionSearch(e) {
        if (e.key === 'Enter') {
            this.setState({
                keywordCollection: e.currentTarget.value,
                currentPageCollection: 0,
                lstCollection: []
            })
            this.searchCollection(0 , this.SIZE_COLLECTION_PER_PAGE, e.currentTarget.value)
            e.preventDefault()
        }
    }

    onScrollCollectionList(e){
        const bottom = this.isBottom(e.currentTarget)
        const currentPage = this.state.currentPageCollection

        if (bottom && currentPage < this.state.totalPageCollection && !this.state.isLoadingCollection) {
            this.setState({
                isLoadingCollection: true
            })
            this.searchCollection(currentPage + 1 , this.SIZE_COLLECTION_PER_PAGE, this.state.keywordCollection)
        }
    }

    onSelectCollection(collection){
        this.setState({
            currentCollection: collection,
            keywordCollection: '',
        }, () => {
            this.searchService(1, this.SIZE_PER_PAGE, this.filterConfig)
        })
    }

    isBottom(el){
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    //////////////////////////////////////////// FOR MOBILE ////////////////////////////////////////////////
    toggleFilterMobileModal() {
        this.setState(state => ({
            isFilterMobileShow: !state.isFilterMobileShow
            })
        )
    }

    filter(){
        // count filter
        let filterCount = 0

        this.setState({
            currentPage: 1,
            filterCount: filterCount
        });

        this.searchService(1, this.SIZE_PER_PAGE, this.filterConfig)
    }

    onSubmitFilter() {
        this.filter()
        this.toggleFilterMobileModal();
    }

    redirectTo(path) {
        this.setState({
            redirectTo: path,
            isRedirect: true
        })
    }

    filterByStatus(status){
        this.filterConfig.status = status.toUpperCase()
        this.filter()
    }

    renderStatus(status) {
        let className = 'gs-status-tag '
        let text =  'component.product.edit.toolbar.status.'
        let toolTips,tagStyle
        switch (status) {
            case "ACTIVE":
                className += 'gs-status-tag--active'
                text += 'active'
                toolTips = 'active'
                tagStyle = GSStatusTag.STYLE.SUCCESS
                break
            case "INACTIVE":
                className += 'gs-status-tag--inactive'
                text += 'inactive2'
                toolTips = 'inactive'
                tagStyle = GSStatusTag.STYLE.WARNING
                break
            case "ERROR":
                className += 'gs-status-tag--error'
                text += 'error'
                toolTips = 'error'
                tagStyle = GSStatusTag.STYLE.DANGER
                break
        }
        return (
            // <GSComponentTooltip message={i18next.t(`productList.toolTips.status.${toolTips}`)} placement={GSComponentTooltipPlacement.LEFT}>
            <GSStatusTag tagStyle={tagStyle} text={i18next.t(text)}/>
            // </GSComponentTooltip>
        )
    }

    renderSaleChannels(channelList) {
        let channelItems = []
        for (let channel of channelList) {
            let channelName = channel.name.toLowerCase()
            if (channelName === 'beecow') continue
            channelItems.push(
                <div className="channels-wraper">
                    <img src={`/assets/images/sale_channels/${channelName}.png`} className={`brands--${channelName}`}/>
                </div>
            )
        }
        return channelItems
    }

    renderStatusDot(status) {
        let className = 'status-dot--green'
        switch (status) {
            case PRODUCT_STATUS.ACTIVE:
                className = 'status-dot--active'
                break
            case PRODUCT_STATUS.ERROR:
                className = 'status-dot--error'
                break
            case PRODUCT_STATUS.INACTIVE:
                className = 'status-dot--inactive'
                break
        }
        return (
            <span className={'status-dot ' + className}>

            </span>
        )
    }
    onClickRemove(e, id){
        e.stopPropagation()
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.service.delete.remove.hint'),
            okCallback: () => {
                ItemService.remove(id)
                    .then(result => {
                        
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_SUCCESS,
                            messages: i18next.t('component.service.delete.remove.success'),
                            closeCallback: () =>{
                                if(this.state.itemList.length === 1){
                                    if(this.state.currentPage === 1){
                                        this.searchService( 1, this.SIZE_PER_PAGE, this.filterConfig)
                                    }else{
                                        this.searchService( this.state.currentPage - 1, this.SIZE_PER_PAGE, this.filterConfig)
                                    }
                                }else{
                                    this.searchService( this.state.currentPage, this.SIZE_PER_PAGE, this.filterConfig)
                                }
                            }
                        })

                    }, e => {
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_DANGER,
                            messages: i18next.t('component.service.delete.remove.failed')
                        })
                    })
            }
        })
    }
    render(){
        return(
            <>
                <GSContentContainer className="service-list-page gsa-min-width--fit-content">
                { this.state.isRedirect &&
                    <Redirect to={this.state.redirectTo}/>
                }
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag title={i18next.t("serviceList.page.title")}
                                                      extra={this.state.totalItem}/>
                }>
                    <GSContentHeaderRightEl>
                        <GSButton success onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.serviceCreate)}>
                            <Trans i18nKey="serviceList.page.button.create" className="sr-only">
                                Create Service
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} className="service-list__body">
                {/*PRODUCT LIST*/}
                <GSWidget className ="gs-widget">
                    {/*<UikWidgetHeader className="gs-widget__header"*/}
                    {/*                 rightEl={*/}
                    {/*                     !this.state.isFetching &&*/}
                    {/*                     <UikTag className="service-list__counter">*/}
                    {/*                         <GSTrans t="serviceList.countService" values={{*/}
                    {/*                             total: CurrencyUtils.formatThousand(this.state.totalItem)*/}
                    {/*                         }}/>*/}
                    {/*                     </UikTag>*/}
                    {/*                 }>*/}
                    {/*    <Trans i18nKey="serviceList.page.list.title"/>*/}

                    {/*</UikWidgetHeader>*/}

                    <GSWidgetContent className="service-list-widget">
                        {/*DESKTOP VERSION*/}
                        {/* <div className={"n-filter-container d-mobile-none d-desktop-flex " + (this.state.isFetching? 'gs-atm--disable':'')}> */}
                        <div className={"n-filter-container " + (this.state.isFetching? 'gs-atm--disable':'')}>
                            {/*SEARCH*/}
                            <span style={{
                                marginRight: 'auto'
                            }} className="gs-search-box__wrapper">
                                <UikInput
                                    onKeyPress={this.onSearchKeyPress}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("serviceList.page.search.name")}
                                />
                            </span>

                            {/*STATUS*/}
                            <UikSelect
                                className="status-filter"
                                defaultValue={this.filterStatusValues[0].value}
                                options={ this.filterStatusValues }
                                onChange={ (item) => this.filterByStatus(item.value)}
                            />

                            {/*COLLECTION*/}
                            <div className="dropdown segments-dropdown-wrapper">
                                <div className="uik-select__wrapper"
                                     onClick={e => {
                                         e.preventDefault()
                                     }}
                                     id="dropdownSegmentsButton"
                                     data-toggle="dropdown"
                                     aria-haspopup="true"
                                     aria-expanded="false">
                                    <button className="btn-segments uik-btn__base uik-select__valueRendered">
                                        <span className="uik-btn__content">
                                            <div className="uik-select__valueRenderedWrapper">
                                                <div className="uik-select__valueWrapper">
                                                {this.state.lstCollection.length === 0 && <GSTrans t={"page.service.noCollection"}/>}
                                                {!this.state.currentCollection && this.state.lstCollection.length !== 0 && <GSTrans t={"page.service.allCollections"}/>}
                                                {this.state.currentCollection && this.state.currentCollection.name}
                                                </div>
                                                <div className="uik-select__arrowWrapper"/>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                <div className="dropdown-menu dropdown-menu-right segments-dropdown" aria-labelledby="dropdownSegmentsButton">
                                    <div className="segments-search">
                                        <UikInput
                                            onKeyPress={ e => this.onKeyPressCollectionSearch(e)}
                                            icon={(
                                                <FontAwesomeIcon icon="search"/>
                                            )}
                                            placeholder={i18next.t("serviceList.page.search.name")}
                                        />
                                    </div>
                                    <hr/>
                                    <div className="segments-item-list" onScroll={e => this.onScrollCollectionList(e)}>
                                        {this.state.lstCollection.length === 0 &&
                                        <div className="found-result">
                                            {this.state.keywordCollection ? i18next.t("common.noResultFound"):i18next.t("page.service.haveNoCollection")}
                                        </div>
                                        }
                                        {/*CURRENT COLLECTION*/}
                                        {this.state.currentCollection &&
                                        <div
                                            className="segments-item-row"
                                            onClick={() => this.onSelectCollection(this.state.currentCollection)}
                                        >
                                            {this.state.currentCollection.name}
                                            <div className="select__check"/>
                                        </div>
                                        }


                                        {/*ALL SEGMENT*/}
                                        {this.state.lstCollection.length > 0 &&
                                            <div
                                                 className="segments-item-row"
                                                 onClick={() => this.onSelectCollection(null)}
                                            >
                                                <GSTrans t={"page.service.allCollections"} />
                                                {this.state.currentCollection === null && <div className="select__check"/>}
                                            </div>
                                        }

                                        {/*LIST*/}
                                        {this.state.lstCollection.map(collection => {
                                            if (this.state.currentCollection && this.state.currentCollection.id === collection.id) return null
                                            return (
                                                <div key={collection.id}
                                                     className="segments-item-row"
                                                    onClick={() => this.onSelectCollection(collection)}
                                                >
                                                    {collection.name}
                                                </div>
                                            )
                                        })}
                                        {this.state.isLoadingCollection &&
                                        <div className="segments-item-row loading-row">
                                            <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                     
                        { this.state.isFetching &&
                        <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                        }

                        {!this.state.isFetching &&
                            <>
                            <PagingTable
                                headers={this.tableConfig.headerList}
                                totalPage={this.state.totalPage}
                                maxShowedPage={10}
                                currentPage={this.state.currentPage}
                                onChangePage={this.onChangeListPage}
                                totalItems={this.state.itemList.length}
                                className="d-desktop-block"
                           
                                hidePagingEmpty
                                >
                                {this.state.itemList.map((dataRow, index) => {
                                    return (
                                        <GSContextMenu 
                                        items={[{ 
                                            key: dataRow.id,
                                            type: "option",
                                            label: i18n.t("page.service.context.menu.text"), 
                                            onClick: () => {window.open(NAV_PATH.serviceEdit + "/" + dataRow.id, '_blank')}
                                            }]}>
                                            <section key={index + "_" + dataRow.id} className="gs-table-body-items cursor--pointer gsa-hover--gray" onClick={() => RouteUtils.linkTo(this.props, '/service/edit/' + dataRow.id)}>
                                                <div className="gs-table-body-item product-thumbnail">
                                                    <img src={ImageUtils.getImageFromImageModel(dataRow.images[0], 100)}/>
                                                </div>
                                                <div className="gs-table-body-item product-table__name">
                                                    <b>{dataRow.name}</b>
                                                </div>
                                                <div className="gs-table-body-item status">
                                                    {this.renderStatus(dataRow.bhStatus)}
                                                </div>
                                                <div className="gs-table-body-item btn-group__action  gs-atm__flex-row--center gs-atm__flex-align-items--center">
                                                    <i className="action-button first-button" 
                                                        onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.collectionEdit + '/' + dataRow.id)}>
                                                    </i>

                                                    <i className="action-button lastest-button" 
                                                        onClick={(e) => this.onClickRemove(e,dataRow.id)}>
                                                    </i>
                                                </div>
                                            </section>
                                        </GSContextMenu>
                                        )
                                    })
                                }
                                </PagingTable>
                                
                                {/*MOBILE*/}
                                {/* <div className="mobile-service-list-container d-mobile-flex d-desktop-none">
                                    {this.state.itemList.map((dataRow, index) => {
                                            return (
                                                <div key={"m-"+dataRow.id} className="m-service-row" onClick={() => RouteUtils.linkTo(this.props, '/product/edit/' + dataRow.id)}>
                                                    <div className="m-service-basic-info">
                                                        <img src={ImageUtils.getImageFromImageModel(dataRow.images[0], 100)}
                                                             className="product-table__thumbnail"/>
                                                         <div className="m-service-basic-info__name">
                                                             <div>
                                                                 {dataRow.name}
                                                             </div>
                                                             <div>
                                                                 {dataRow.descriptions}
                                                             </div>
                                                         </div>
                                                    </div>
                                                    <div className="gs-atm__flex-row--flex-end gs-atm__flex-align-items--center">
                                                        <div className="m-service-detail">
                                                            <div className="m-product-detail__status">
                                                                {this.renderStatusDot(dataRow.bhStatus)}
                                                                {CurrencyUtils.formatThousand(dataRow.totalItem - dataRow.soldItem)}
                                                            </div>
                                                            <div className="m-product-detail__price">
                                                                {CurrencyUtils.formatMoneyVND(dataRow.newPrice)}
                                                            </div>
                                                        </div>
                                                        <FontAwesomeIcon icon="chevron-right" style={{marginLeft: '1em'}} color="gray"/>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div> */}
                                {/* <PagingTable
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={1}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.itemList.length}
                                    className="m-paging d-mobile-flex d-desktop-none"
                                /> */}

                                {this.state.itemList.length === 0 &&
                                    <div className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                        <div>
                                            <img src="/assets/images/icon-Empty.svg"/>
                                            {' '}
                                            <span>
                                                <Trans i18nKey="common.noResultFound"/>
                                            </span>
                                        </div>
                                    </div>
                                }
                        </>
                        }
                    </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
            </GSContentContainer>
            </>
        )
    }
}




export default connect()(ProductList);
