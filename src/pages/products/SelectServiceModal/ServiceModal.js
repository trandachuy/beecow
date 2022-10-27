/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {UikCheckbox, UikFormInputGroup, UikInput} from '../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './ServiceModal.sass'
import {Trans} from "react-i18next";
import {ItemService} from "../../../services/ItemService";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../utils/gs-toast";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import GSButton from "../../../components/shared/GSButton/GSButton";
import SelectServiceRow from "./ProductRow/SelectServiceRow";

class ServiceModal extends Component {
    SIZE_PER_PAGE = 10
    ON_INPUT_DELAY = 500


    state = {
        // list for every page
        productList: [],

        isFetching: false,
        isFetchingSuccessful: true,

        // selected product for every open model
        selectedProduct: [...this.props.productSelectedList],

        currentPage: 1,
        isHasProduct: false,
        isLoadingOnFirstTime: true,
        isSearching: false,
        isSearch: false,
        searchKeyword: '',
        totalItem: 0,
        totalPage: 0,

        checkAllValue: true,
        loadingWhenPaging: false
    }

    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
        this.fetchDataOfDashboard = this.fetchDataOfDashboard.bind(this);
        this.onChangeListPage = this.onChangeListPage.bind(this);
        this.selectAllItemForAPage = this.selectAllItemForAPage.bind(this);
    }

    selectAllItemForAPage(e){
        let checked = e.target.checked;
        let selectedProduct = this.state.selectedProduct;

        if(checked){
            // in case checked
            this.state.productList.forEach(item =>{
                // add all product to list
                if(selectedProduct.filter( item2 => item.id === item2.id).length === 0 ){
                    selectedProduct.push(item);
                }
            })

        }else{
            // in case unchecked
            this.state.productList.forEach(item =>{
                // remove all product of this page from selected list
                selectedProduct = selectedProduct.filter( item2 => item.id !== item2.id); 
            })
        }

        // set state
        this.setState({
            selectedProduct : selectedProduct,
            checkAllValue : checked
        });
    }

    onInputSearch(event) {
        const keyword = event.currentTarget.value
        if (this.stoSearch) clearTimeout(this.stoSearch)
        this.stoSearch = setTimeout( () => {
            this.setState({
                isSearching: true,
                searchKeyword: keyword
            }, () => {
                this.fetchDataOfDashboard(0);
            })
        }, this.ON_INPUT_DELAY)
    }

    onChangeListPage(pageIndex) {
        this.setState({currentPage: pageIndex})
        this.fetchDataOfDashboard(pageIndex - 1);
    }

    onClose(selectType) {
        if(selectType === 'cancel'){
            if (this.props.onClose) {
                this.props.onClose(null)
            }
        }else{
            if (this.props.onClose) {
                this.props.onClose(this.state.selectedProduct)
            }
        }
    }

    onSelect(product, checked) {
        let lstProduct = this.state.selectedProduct;

        if(checked === true){
            // if checked
            // only push if not exist
            if(lstProduct.filter(p => p.id === product.id).length === 0){
                lstProduct.push(product);
            }

        }else{
            // uncheck => remove from list
            lstProduct = lstProduct.filter(p => p.id !== product.id);
        }

        this.setState({
            selectedProduct: lstProduct
        })
    }

    componentDidMount() {
        this.fetchDataOfDashboard(0);
    }

    fetchDataOfDashboard(page) {
        this.setState({
            isFetchingSuccessful: true,
            isLoadingOnFirstTime: true,
            checkAllValue: false,
            loadingWhenPaging: true
        })

        ItemService.fetchDashboardServices({
            page: page,
            size: this.SIZE_PER_PAGE,
            search: this.state.searchKeyword,
        }).then(result => {
                const totalItem = parseInt(result.headers['x-total-count'])
                if (page === 0 && result.data.length === 0 && !this.state.isSearching) {
                    this.setState({
                        isHasProduct: false,
                        isLoadingOnFirstTime: false,
                        loadingWhenPaging: false
                    })
                    this.refAlert.openModal({
                        messages: i18next.t("component.collection.modal.no_product.service"),
                        type: AlertModalType.ALERT_TYPE_SUCCESS,
                        closeCallback: this.props.onClose
                    })
                } else {
                    this.setState({
                        isHasProduct: true,
                        productList: result.data,
                        isFetchingSuccessful: true,
                        totalItem: totalItem,
                        currentPage: page + 1,
                        isLoadingOnFirstTime: false,
                        isSearching: false,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                        loadingWhenPaging: false
                    })
                } 
            }, (e) => {
                this.setState({
                    isFetchingSuccessful: false,
                    isLoadingOnFirstTime: false,
                    isSearching: false,
                    loadingWhenPaging: false
                })
                GSToast.error(i18next.t("common.api.failed"))
                this.props.onClose()
            })
    }

    componentWillUnmount() {
    }

    render() {
        return (
           <>
               {this.state.isLoadingOnFirstTime && !this.state.isHasProduct && <LoadingScreen/>}

               {!this.state.isHasProduct && <AlertModal ref={el => this.refAlert = el}/>}

               {this.state.isHasProduct &&
               <Modal isOpen={this.state.isHasProduct && !this.state.isSearch} className="select-service-modal">
                    <ModalHeader close={
                        <div className="mobile-header-btn d-mobile-flex d-desktop-none">
                            <i
                                className="btn-close__icon  d-mobile-none d-desktop-inline"
                                onClick={() => this.onClose('cancel')}
                            />
                            <GSButton success marginRight
                                      onClick={() => this.onClose('select')}
                            >
                                <Trans i18nKey="common.btn.ok"/>

                            </GSButton>
                            <GSButton secondary outline
                                      onClick={() => this.onClose('cancel')}>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>
                        </div>
                    }>
                        <Trans i18nKey="component.collection.form.button.add_product.service"/>

                    </ModalHeader>
                    <ModalBody>
                        <div className="search-group">
                            <span className="check-all_apage">
                                <UikCheckbox 
                                    name="check_all"
                                    className="select-collection-row"
                                    checked={this.state.checkAllValue}
                                    onChange={(e) => this.selectAllItemForAPage(e)}
                                />

                            </span>
                            <span className="search">
                                <UikInput
                                    className="search-input"
                                    icon={ (
                                        <FontAwesomeIcon icon={"search"}/>
                                    ) }
                                    iconPosition="left"
                                    placeholder={i18next.t("component.collection.form.search.service")}
                                    onChange={this.onInputSearch}
                                />
                                {/* { this.state.isSearching && 
                                <div className="spinner-border text-secondary" role="status">
                                </div>} */}
                            </span>
                        </div>
                        <div className="product-list" >
                            <UikFormInputGroup>
                                <PagingTable
                                    headers={[]}
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={10}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.totalItem}
                                    scrollableBodyWhenHeightOver={"50vh"}
                                    hidePagingEmpty
                                    >
                                        {
                                            this.state.loadingWhenPaging &&
                                            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                                        }
                                        {this.state.loadingWhenPaging === false && this.state.productList.map((product, index) => {
                                            let isExist = this.state.selectedProduct.filter(p => p.id === product.id).length > 0 ? true : false;
                                            return (
                                                <section key={product.id + '_' + index + isExist} className="gs-table-body-items">
                                                    <div className="gs-table-body-item">
                                                        <SelectServiceRow data={product} onSelect={this.onSelect} isExist={isExist}/>
                                                    </div>
                                                </section>
                                                )
                                            })
                                        }
                                </PagingTable>
                            </UikFormInputGroup>
                            
                        </div>
                        <div className="gs-atm__flex-row--flex-end footer-btn d-mobile-none d-desktop-flex">
                            {/*<button */}
                            {/*    className="btn btn-outline-secondary" */}
                            {/*    onClick={() => this.onClose('cancel')}>*/}
                            {/*    <Trans i18nKey="common.btn.cancel"/>*/}
                            {/*</button>*/}
                            {/*<UikButton */}
                            {/*    success */}
                            {/*    className={"ml-3"}*/}
                            {/*    onClick={() => this.onClose('select')}*/}
                            {/*>*/}
                            {/*</UikButton>*/}

                            <GSButton secondary outline
                                      onClick={() => this.onClose('cancel')}>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>

                            <GSButton success marginLeft
                                      onClick={() => this.onClose('select')}
                                        >
                                <Trans i18nKey="common.btn.ok"/>

                            </GSButton>
                        </div>
                    </ModalBody>
            </Modal>}
           </>
        );
    }
}


ServiceModal.propTypes = {
  onClose: PropTypes.func,
  productSelectedList: PropTypes.any
}

export default ServiceModal;
