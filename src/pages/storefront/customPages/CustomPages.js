/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <email: tien.dao@mediastep.com>
 */

import React, {Component} from 'react';
import "./CustomPages.sass";
import {UikInput, UikSelect} from '../../../@uik'
import {RouteUtils} from "../../../utils/route";
import i18next from "../../../config/i18n";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import Constants from "../../../config/Constant";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import GSTable from "../../../components/shared/GSTable/GSTable";
import customPageService from "../../../services/CustomPageService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Trans} from "react-i18next";
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import {cancelablePromise} from '../../../utils/promise';
import moment from 'moment';
import {TokenUtils} from '../../../utils/token';
import HintPopupVideo from "../../../components/shared/HintPopupVideo/HintPopupVideo";

class CustomPages extends Component {

    SIZE_PER_PAGE = 10

    constructor(props){
        super(props);
        this.isL = false;
        this.state = {
            isLoading: false,
            itemList: [],

            currentPage: 1,
            totalItem : 0,
            totalPage : 0,
            isFetching: false,
        }

        this.filterStatusValues = [
            {
                value: '',
                label: i18next.t("component.custom.page.filter.status.all"),
            },
            {
                value: 'PUBLISH',
                label: i18next.t("component.custom.page.filter.status.publish"),
            }
        ]

        this.filterAuthorValues = [
            {
                value: '',
                label: i18next.t("component.custom.page.filter.author.all"),
            }
        ]

        this.sorterValues = [
            {
                value: 'lastModifiedDate,desc',
                label: i18next.t("component.custom.page.sort.date.newest"),
            },
            {
                value: 'lastModifiedDate,asc',
                label: i18next.t("component.custom.page.sort.date.lasted"),
            }
        ]

        this.filterConfig = {
            sort: this.sorterValues[0].value,
            search: '',
            author: this.filterAuthorValues[0].value.toUpperCase(),
            status: this.filterStatusValues[0].value.toUpperCase()
        }

        this.getAllCustomPages = this.getAllCustomPages.bind(this);
        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this);
    }
    
    componentDidUpdate(){
        
    }

    componentDidMount(){
        if(!this.state.isLoading){
            this.setState({isLoading: true});
            this.fetchCustomPage();
        }
    }

    fetchCustomPage() {
        if(this.pmCustomPage) {
            this.pmCustomPage.cancel();
        }

        this.pmCustomPage = cancelablePromise(Promise.all([
            customPageService.getCustomPagesByStoreId({
            size : this.SIZE_PER_PAGE,
            page: 0,
            sort: this.filterConfig.sort
        }), customPageService.getAuthors()]));

        this.pmCustomPage.promise.then(async (resp) => {
            const totalItem = parseInt(resp[0].headers['x-total-count'])
            
            this.setState({
                itemList: resp[0].data,
                currentPage: 1,
                totalItem: totalItem,
                totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
            });
            this.filterAuthorValues = [...this.filterAuthorValues,...resp[1].data];
        }).finally(() => {
            this.setState({isLoading: false});
        })
    }
  
    getAllCustomPages(page){
        customPageService.getCustomPagesByStoreId({
            size : this.SIZE_PER_PAGE,
            page: page,
            ...this.filterConfig
        }).then(res =>{
            const totalItem = parseInt(res.headers['x-total-count'])
            
            this.setState({
                itemList : res.data,
                currentPage : page + 1,
                totalItem : totalItem,
                totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
            });

        }).catch(e =>{

        });
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        })

        this.getAllCustomPages(pageIndex - 1)
    }

    // delete button
    onClickRemove(e, pageId) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.custom.page.edit.remove.hint'),
            okCallback: () => {
                customPageService.deletePage(pageId)
                    .then(result => {
                        
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_SUCCESS,
                            messages: i18next.t('component.custom.page.edit.remove.success'),
                            closeCallback: () =>{
                                if(this.state.itemList.length === 1){
                                    if(this.state.currentPage === 1){
                                        this.getAllCustomPages( 0)
                                    }else{
                                        this.getAllCustomPages( this.state.currentPage - 2)
                                    }
                                }else{
                                    this.getAllCustomPages( this.state.currentPage - 1)
                                }
                            }
                        })

                    }, e => {
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_DANGER,
                            messages: i18next.t('component.custom.page.edit.remove.failed')
                        })
                    })
            }
        })
    }

    onSearch(value) {
        this.filterConfig.search = value;
        this.getAllCustomPages(0);
    }

    filterByAuthor(value) {
        this.filterConfig.author = value;
        this.getAllCustomPages(0);
    }

    filterByStatus(value) {
        this.filterConfig.status = value;
        this.getAllCustomPages(0);
    }

    sort(value) {
        this.filterConfig.sort = value;
        this.getAllCustomPages(0);
    }

    render() {
        return (
            <GSContentContainer className="custom-page-container">
                <GSContentHeader className="custom-container__title gs-page-title"
                                 title={i18next.t("component.custom.page.title")}>
                    <HintPopupVideo title={'page management'} category={'PAGE_MANAGERMENT'}/>
                    <GSContentHeaderRightEl>
                        <GSButton success
                                disabled={!TokenUtils.hasThemeEnginePermission()}
                                className="btn-save"
                                onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.createCustomPage)}>
                            <Trans i18nKey="component.custom.page.addNew.title" className="sr-only">
                                Add Page
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody>
                    <GSWidgetContent>
                        <GSWidget>
                        {/*DESKTOP VERSION*/}
                        <div className={"n-filter-container d-mobile-none d-desktop-flex " + (this.state.isFetching? 'gs-atm--disable':'')}>
                            {/*SEARCH*/}
                            <span style={{
                                marginRight: 'auto',                
                                marginLeft: '10px',
                                marginTop: '5px'
                            }} className="search-box__wrapper">
                                <UikInput
                                    onChange={(e) => {const v = e.target.value; this.onSearch(v);}}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("component.custom.page.search.hint")}
                                />
                            </span>

                            {/*AUTHOR*/}
                            <UikSelect
                                defaultValue={this.filterAuthorValues[0].value}
                                options={ this.filterAuthorValues }
                                onChange={ (item) => this.filterByAuthor(item.value)}
                            />
                            {/*STATUS*/}
                           {/*  <UikSelect
                                defaultValue={this.filterStatusValues[0].value}
                                options={ this.filterStatusValues }
                                onChange={ (item) => this.filterByStatus(item.value)}
                            /> */}
                            {/*SORTER DATE*/}
                            <UikSelect
                                defaultValue={this.filterConfig.sort}
                                options={ this.sorterValues }
                                onChange={ (item) => {this.sort(item.value)}}
                            />
                        </div>
                        {!this.state.isFetching &&
                            <>
                                <GSTable className={"uik-widget-table-custom-page"} style={{
                                    marginTop: '14px'
                                }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            minWidth: '15rem'
                                        }}>
                                            {i18next.t("component.custom.page.table.header.title")}
                                        </th>
                                        {/* <th>
                                            {i18next.t("component.custom.page.table.header.status")}
                                        </th> */}
                                        <th>
                                            {i18next.t("component.custom.page.table.header.author")}
                                        </th>
                                        <th>
                                            {i18next.t("component.custom.page.table.header.last_modified")}
                                        </th>
                                        <th style={{textAlign: "center"}}>
                                            {i18next.t("component.custom.page.table.header.action")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.itemList.map( (item, index) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="title-item">
                                                <span className='page-name'>
                                                    {item.title}
                                                </span> 
                                                <span className="page-name short-content">
                                                    {item.shortContent}
                                                </span>
                                            </div>
                                        </td>
                                        {/* <td style={{
                                            width: "20%"
                                        }}>
                                            <span>
                                                {(item.status)? i18next.t(`component.custom.page.filter.status.${(item.status).toLowerCase()}`):``}
                                            </span> 
                                        </td> */}
                                        <td style={{
                                            width: "20%"
                                        }}>
                                            <span>
                                                {item.authorName}
                                            </span> 
                                        </td>
                                        <td style={{
                                            width: "20%"
                                        }}>
                                            <span>{moment(item.lastModifiedDate).format('DD-MM-YYYY')}</span>
                                        </td>
                                        <td>
                                            <span className="action-item">
                                                <i className="icon-edit"onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.editCustomPage + '/' + item.id)}></i>
                                                <i className="icon-delete" onClick={(e) => this.onClickRemove(e,item.id)}></i>
                                            </span>
                                        </td>
                                    </tr>
                                    ))}
                                    </tbody>
                                </GSTable>
                                <PagingTable
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={this.SIZE_PER_PAGE}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.totalItem}
                                    className="d-mobile-none d-desktop-block"
                                    hidePagingEmpty
                                />
                                {this.state.itemList.length === 0 &&
                                    <div className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center gs-no-data">
                                        <div>
                                            <img src="/assets/images/icon-Empty.svg"/>
                                            {' '}
                                            <span>
                                                <Trans i18nKey="component.custom.page.no.data"/>
                                            </span>
                                        </div>
                                    </div>
                                }
                        </>
                        }
                        </GSWidget>
                    </GSWidgetContent>
                </GSContentBody>

                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.custom.page.learn_more")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_PAGE}/>
                </GSContentFooter>

                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />

            </GSContentContainer>
        );
    }
}

export default CustomPages;
