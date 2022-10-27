/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 14/08/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {UikCheckbox, UikFormInputGroup, UikInput} from '../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './CollectionModal.sass'
import {Trans} from "react-i18next";
// import {cancelablePromise} from "../../../utils/promise";
// import {ItemService} from "../../../services/ItemService";
// import Constants from "../../../config/Constant";
// import ProductRow from "./ProductRow/ProductRow";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../Loading/Loading";
import AlertModal, {AlertModalType} from "../AlertModal/AlertModal";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../utils/gs-toast";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {CollectionService} from "../../../services/CollectionService";
import CollectionRow from './CollectionRow/CollectionRow';
import GSTrans from "../GSTrans/GSTrans";
import {NAV_PATH} from "../../layout/navigation/Navigation";
import Constants from '../../../config/Constant';

class CollectionModal extends Component {
    SIZE_PER_PAGE = 10
    ON_INPUT_DELAY = 500


    state = {
        // list for every page
        collectionList: [],

        isFetching: false,
        isFetchingSuccessful: true,

        // selected product for every open model
        selectedItems: [...this.props.collectionSelectedList],

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
        let selectedItems = this.state.selectedItems;

        if(checked){
            // in case checked
            this.state.collectionList.forEach(item =>{
                // add all product to list
                if(selectedItems.filter( item2 => item.id === item2.id).length === 0 ){
                    selectedItems.push(item);
                }
            })

        }else{
            // in case unchecked
            this.state.collectionList.forEach(item =>{
                // remove all product of this page from selected list
                selectedItems = selectedItems.filter( item2 => item.id !== item2.id);
            })
        }

        // set state
        this.setState({
            selectedItems : selectedItems,
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
                this.props.onClose(this.state.selectedItems)
            }
        }
    }

    onSelect(product, checked) {
        let lstProduct = this.state.selectedItems;

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
            selectedItems: lstProduct
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

        CollectionService.getListCollectionWithKeyword(
            page,
            this.SIZE_PER_PAGE,
            this.state.searchKeyword,
            this.props.itemType
            )
            .then(result => {
            const totalItem = parseInt(result.headers['x-total-count'])

            if (page === 0 && result.data.length === 0 && !this.state.isSearching) {
                this.setState({
                    isHasProduct: false,
                    isLoadingOnFirstTime: false,
                    loadingWhenPaging: false
                })
                this.refAlert.openModal({
                    messages: <GSTrans t={"component.product.addNew.productInformation.collection.noContent"}>
                        a<a href={NAV_PATH.collectionCreate + '/PRODUCT'}>a</a></GSTrans>,
                    type: AlertModalType.ALERT_TYPE_SUCCESS,
                    closeCallback: this.props.onClose
                })
            }else{
                this.setState({
                    isHasProduct: true,
                    collectionList: result.data,
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
                <Modal isOpen={this.state.isHasProduct && !this.state.isSearch} className="select-collection-modal">
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
                        <Trans i18nKey="page.marketing.discounts.coupons.collection_modal.title"/>
                        <i
                            className="btn-close__icon d-mobile-none d-desktop-inline"
                            onClick={() => this.onClose('cancel')}
                        />

                    </ModalHeader>
                    <ModalBody>
                        <div className="search-group">
                                <span className="check-all_apage">
                                        <UikCheckbox
                                            name="check_all"
                                            className="select-collection-row__discount"
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
                                        placeholder={i18next.t("page.marketing.discounts.coupons.create.usageLimits.searchCollectionByName")}
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
                                    {this.state.loadingWhenPaging === false && this.state.collectionList.map((product, index) => {
                                       let isExist = this.state.selectedItems.filter(p => p.id === product.id).length > 0 ? true : false;
                                        return (
                                            <section key={product.id + '_' + index + isExist} className="gs-table-body-items">
                                               <div className="gs-table-body-item"><CollectionRow itemType={this.props.itemType} data={product} onSelect={this.onSelect} isExist={isExist}/></div>
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

CollectionModal.defaultProps = {
    itemType: Constants.ITEM_TYPE.BUSINESS_PRODUCT
}

CollectionModal.propTypes = {
  collectionSelectedList: PropTypes.any,
  itemType: PropTypes.oneOf([Constants.ITEM_TYPE.SERVICE, Constants.ITEM_TYPE.BUSINESS_PRODUCT]),
  onClose: PropTypes.func
}

export default CollectionModal;

