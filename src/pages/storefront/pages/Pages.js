/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Tien Dao <email: tien.dao@mediastep.com>
 */

import React, {Component} from 'react';
import "./Pages.sass";
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
import pageService from "../../../services/PageService";
import {Trans} from "react-i18next";
import {NAV_PATH} from '../../../components/layout/navigation/Navigation';
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import moment from 'moment';

class Pages extends Component {

    SIZE_PER_PAGE = 100

    constructor(props){
        super(props);
        this.isL = false;
        this.state = {
            isLoading: false,
            itemList: [],

            currentPage: 1,
            totalItem : 0,
            totalPage : 0
            
        }

        this.tableConfig = {
            headerList: [
                i18next.t("component.page.table.header.title"),
                i18next.t("component.page.table.header.last_modified"),
                i18next.t("component.page.table.header.action")
            ]
        };

        this.getPagesByBcStoreId = this.getPagesByBcStoreId.bind(this);
        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.onClickRemove = this.onClickRemove.bind(this);
    }
    
    componentDidUpdate(){
        if(this.state.isLoading){
            this.getPagesByBcStoreId(0);
            this.setState({isLoading: false});
        }
    }
    componentDidMount(){
        if(!this.state.isLoading){
            this.setState({isLoading: true});
        }
    }
  
    getPagesByBcStoreId(page){
        pageService.getPagesByBcStoreId({
            size : this.SIZE_PER_PAGE,
            page: page
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

        this.getPagesByBcStoreId(pageIndex - 1, this.SIZE_PER_PAGE)
    }

    // delete button
    onClickRemove(e, pageId) {
        e.preventDefault()
        this.refConfirmModal.openModal({
            messages: i18next.t('component.page.edit.remove.hint'),
            okCallback: () => {
                pageService.deletePage(pageId)
                    .then(result => {
                        
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_SUCCESS,
                            messages: i18next.t('component.page.edit.remove.success'),
                            closeCallback: () =>{
                                if(this.state.itemList.length === 1){
                                    if(this.state.currentPage === 1){
                                        this.getPagesByBcStoreId( 0, this.SIZE_PER_PAGE, this.filterConfig)
                                    }else{
                                        this.getPagesByBcStoreId( this.state.currentPage - 2, this.SIZE_PER_PAGE, this.filterConfig)
                                    }
                                }else{
                                    this.getPagesByBcStoreId( this.state.currentPage - 1, this.SIZE_PER_PAGE, this.filterConfig)
                                }
                            }
                        })

                    }, e => {
                        this.alertModal.openModal({
                            type: AlertModalType.ALERT_TYPE_DANGER,
                            messages: i18next.t('component.page.edit.remove.failed')
                        })
                    })
            }
        })
    }

    render() {
        return (
            <GSContentContainer className="page-container" minWidthFitContent>
                <GSContentHeader className="custom-container__title gs-page-title"
                                 title={i18next.t("component.page.title")}>
                    <GSContentHeaderRightEl>
                        <GSButton success
                                  className="btn-save"
                                  onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.pagesCreate)}>
                            <Trans i18nKey="component.page.addNew.title" className="sr-only">
                                Add Page
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>            
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.LARGE}>
                    <GSWidgetContent>
                        <GSWidget>
                        <PagingTable
                            headers={this.tableConfig.headerList} 
                            totalPage={this.state.totalPage}
                            maxShowedPage={10}
                            currentPage={this.state.currentPage}
                            onChangePage={this.onChangeListPage}
                            totalItems={this.state.totalItem} 
                            hidePagingEmpty>
                            {this.state.itemList.map((dataRow, index) => {
                                return (
                                    <section key={index + "_" + dataRow.id} className="gs-table-body-items">
                                        <div className="gs-table-body-item">
                                            <span className='page-name'>
                                                {dataRow.name}
                                            </span> 
                                            <span className="page-name short-content">
                                                {dataRow.shortContent}
                                            </span>
                                        </div>
                                        <div className="gs-table-body-item flex-basis-20"><span>{moment(dataRow.createdDate).format('DD-MM-YYYY')}</span></div>

                                        <div className="gs-table-body-item flex-basis-20">
                                            <i className="icon-edit"onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.pagesEdit + '/' + dataRow.id)}></i>
                                            <i className="icon-delete" onClick={(e) => this.onClickRemove(e,dataRow.id)}></i>
                                        </div>
                                    </section>
                                    )
                                })
                            }
                        </PagingTable>
                        {this.state.itemList.length === 0 &&
                            <div className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center no-data__warning">
                                <div>
                                    <img src="/assets/images/icon-Empty.svg"/>
                                    {' '}
                                    <span>
                                        <Trans i18nKey="component.page.list.table.empty"/>
                                    </span>
                                </div>
                            </div>
                        }
                            
                        </GSWidget>
                    </GSWidgetContent>
                </GSContentBody>

                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.page.learn_more")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_PAGE}/>
                </GSContentFooter>

                <AlertModal ref={(el) => { this.alertModal = el }} />
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />

            </GSContentContainer>
        );
    }
}

export default Pages;
