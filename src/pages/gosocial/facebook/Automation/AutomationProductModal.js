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
import {UikCheckbox, UikFormInputGroup, UikInput, UikSelect} from '../../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './AutomationProductModal.sass'
import {Trans} from "react-i18next";
import ProductRow from "./ProductRow/ProductRow";
import i18next from "i18next";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import {GSToast} from "../../../../utils/gs-toast";
import Constants from "../../../../config/Constant";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import {SEARCH_BY_ENUM} from "../../../customers/List/BarcodePrinter/CustomerListBarcodePrinter";
import storeService from "../../../../services/StoreService";
import {ItemService} from "../../../../services/ItemService";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import DropdownBox from "../../../../components/shared/GSCallHistoryTable/SearchDropdown/DropdownBox";

class AutomationProductModal extends Component {
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
        loadingWhenPaging: false,
        searchBy: SEARCH_BY_ENUM.PRODUCT,
        branches:[],
        selectedBranch:null
    }

    constructor(props) {
        super(props);
        this.texts = {
            ...{
                title: "component.collection.form.button.add_product.product",
                cancelButton: "common.btn.cancel",
                okButton: "common.btn.ok",
            },
            ...this.props.texts,
        }
        this.onClose = this.onClose.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
        this.fetchDataOfDashboard = this.fetchDataOfDashboard.bind(this);
        this.onChangeListPage = this.onChangeListPage.bind(this);
        this.selectAllItemForAPage = this.selectAllItemForAPage.bind(this);
        this.unCheckAllPage = this.unCheckAllPage.bind(this);
        this.onChangeSearchBy = this.onChangeSearchBy.bind(this);
        this.fetchBranchList = this.fetchBranchList.bind(this);
        this.onChangeBranch = this.onChangeBranch.bind(this);
    }

    selectAllItemForAPage(e) {
        let checked = e.target.checked;
        let selectedProduct = this.state.selectedProduct;

        if (checked) {
            // in case checked
            for (const item of this.state.productList) {
                // add all product to list
                if (selectedProduct.filter(item2 => item.id === item2.id).length === 0) {

                    if (this.props.max && selectedProduct.length === this.props.max) { // exceed max
                        GSToast.warning(
                            i18next.t('page.customer.segment.maxProduct', {
                                max: this.props.max
                            })
                        )
                        break
                    } else {
                        selectedProduct.push(item);
                    }
                }
            }

        } else {
            // in case unchecked
            this.state.productList.forEach(item => {
                // remove all product of this page from selected list
                selectedProduct = selectedProduct.filter(item2 => item.id !== item2.id);
            })
        }

        // set state
        this.setState({
            selectedProduct: selectedProduct,
            checkAllValue: checked
        });
    }

    onInputSearch(event) {
        const keyword = event.currentTarget.value
        if (this.stoSearch) clearTimeout(this.stoSearch)
        this.stoSearch = setTimeout(() => {
            this.setState({
                isSearching: true,
                searchKeyword: (keyword || '').trim()
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
        
        if (selectType === 'cancel') {
            if (this.props.onClose) {
                if(this.state.selectedProduct.length === 0){
                    this.props.onClose(false,[])
                    return
                }
                this.props.onClose(false,this.state.selectedProduct)
            }
        } else {
            if(this.state.selectedProduct.length > 10){
                GSToast.error(i18next.t('page.gochat.facebook.automation.replyInMessenger.error.max.product'))
                return;
            }
            
            if (this.props.onClose) {
                this.props.onClose(true,this.state.selectedProduct)
            }
        }
    }

    onSelect(product, checked) {
        let lstProduct = this.state.selectedProduct;
        
        if (checked === true) {
            // if checked
            // only push if not exist
            if (lstProduct.filter(p => p.id === product.id).length === 0) {
                // check maximum select
                if (this.props.max && lstProduct.length === this.props.max) { // exceed max
                    GSToast.warning(
                        i18next.t('page.customer.segment.maxProduct', {
                            max: this.props.max
                        })
                    )
                } else {
                    lstProduct.push(product);
                }

            }

        } else {
            // uncheck => remove from list
            lstProduct = lstProduct.filter(p => p.id !== product.id);
        }

        this.setState({
            selectedProduct: lstProduct
        })
    }

    componentDidMount() {
        this.fetchDataOfDashboard(0);
        this.fetchBranchList()
    }

    fetchBranchList() {
        storeService.getFullStoreBranches()
            .then(pageRes => {
                const branches = pageRes.data.filter(r=>r.branchStatus === 'ACTIVE')
                    .map(b => ({ label: b.name, value: b.id, isDefault: b.isDefault }))
                this.setState({
                    branches
                })
            })
    }

    fetchDataOfDashboard(page) {
        this.setState({
            isFetchingSuccessful: true,
            isLoadingOnFirstTime: true,
            checkAllValue: false,
            loadingWhenPaging: true
        })
        storeService.getActiveStoreBranches()
            .then(branch => {

                return ItemService.getProductSuggestionByName(page, this.SIZE_PER_PAGE, this.state.searchBy, this.state.searchKeyword, false, '', {
                    branchId:this.state.selectedBranch?.value || this.state.branches[0].value
                })
            })
            .then(result => {
                const totalItem = parseInt(result.headers['x-total-count'])

                if (page === 0 && result.data.length === 0 && !this.state.isSearching) {
                    this.setState({
                        isHasProduct: false,
                        isLoadingOnFirstTime: false,
                        loadingWhenPaging: false
                    })
                    this.refAlert.openModal({
                        messages: i18next.t("component.collection.modal.no_product.product"),
                        type: AlertModalType.ALERT_TYPE_SUCCESS,
                        closeCallback: this.props.onClose
                    })
                } else {
                    let listProduct = result.data
                    if(this.props.isAddItem && page === 0){
                        listProduct = []
                        result.data.map((product, index)=>{
                            const indexProduct = this.props.productSelectedList.filter(p => !_.isEmpty(p)).findIndex(p => p.id === product.id)
                            if(indexProduct === -1){
                                listProduct.push(product)
                            }
                        })
                        listProduct = [...this.props.productSelectedList,...listProduct]
                    }
                    if (this.props.isAddItem && page > 0){
                        listProduct = []
                        result.data.map((product, index)=>{
                            const indexProduct = this.props.productSelectedList.filter(p => !_.isEmpty(p)).findIndex(p => p.id === product.id)
                            if(indexProduct === -1){
                                listProduct.push(product)
                            }
                        })
                        listProduct = [...listProduct]
                    }
                    
                    this.setState({
                        isHasProduct: true,
                        productList: listProduct,
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

    unCheckAllPage() {
        this.setState({
            selectedProduct: [],
            checkAllValue: false,
        })
    }

    onChangeSearchBy(e) {
        const {value} = e;
        this.setState({
            searchBy: value,
            isSearching: true
        }, () => {
            this.fetchDataOfDashboard(0);
        });
    }

    onChangeBranch(item) {
        this.setState({
            selectedBranch : item
        },() => {
            this.fetchDataOfDashboard(0);
        })
    }

    render() {
        return (
            <>
                {this.state.isLoadingOnFirstTime && !this.state.isHasProduct && <LoadingScreen/>}

                {!this.state.isHasProduct && <AlertModal ref={el => this.refAlert = el}/>}

                {this.state.isHasProduct &&
                <Modal isOpen={this.state.isHasProduct && !this.state.isSearch} className="select-product-modal"
                       size='lg'>
                    <ModalHeader>
                        {
                            this.texts && this.texts.title?
                            <Trans i18nKey={this.props.texts.title}/>:
                            (this.props.type === Constants.ITEM_TYPE.BUSINESS_PRODUCT ?
                                <Trans i18nKey="component.collection.form.button.add_product.product"/>
                                :
                                <Trans i18nKey="component.collection.form.button.add_product.service"/>
                            )
                        }
                        <div className='uncheck-group'>
                            {
                                this.state.selectedProduct.length > 0 && <>
                                    <span className={this.state.selectedProduct.length > 10 ? "quantity-error" : ""}>
                                        <GSTrans t="page.product.list.printBarCode.selected2"
                                                 values={{quantity: this.state.selectedProduct.length}}>
                                            0<b>1</b>
                                        </GSTrans>
                                    </span>
                                    {' | '}
                                    <GSFakeLink className="font-weight-bold" onClick={this.unCheckAllPage}>
                                        <GSTrans t="page.product.list.printBarCode.unCheckAll"/>
                                    </GSFakeLink>
                                </>
                            }
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <UikSelect
                            onChange={this.onChangeBranch}
                            defaultValue={this.state.selectedBranch?.value || this.state.branches.find(b=>b.isDefault === true)?.value}
                            position="bottomRight"
                            options={this.state.branches}
                        />
                        
                        <div className="search-group">
                            <span className="search">
                                <UikInput
                                    className="search-input"
                                    icon={(
                                        <FontAwesomeIcon icon={"search"}/>
                                    )}
                                    iconPosition="left"
                                    placeholder={i18next.t("component.collection.form.search." + (this.props.type === Constants.ITEM_TYPE.BUSINESS_PRODUCT ? 'product' : 'service'))}
                                    onChange={this.onInputSearch}
                                />
                                {this.props.showSearchOption && 
                                    <UikSelect
                                        onChange={this.onChangeSearchBy}
                                        position={'bottomRight'}
                                        value={[{value: this.state.searchBy}]}
                                        style={{
                                            width: '100px'
                                        }}
                                        className=''
                                        options={[
                                            {
                                                value: SEARCH_BY_ENUM.PRODUCT,
                                                label: i18next.t('page.product.list.printBarCode.product'),
                                            },
                                            {
                                                value: SEARCH_BY_ENUM.BARCODE,
                                                label: i18next.t('page.product.list.printBarCode.barcode'),
                                            }
                                        ]}
                                    />
                                }
                            </span>
                        </div>
                        <span className="check-all_apage d-flex justify-content-between">
                               <div className="d-flex">
                                    <UikCheckbox
                                        name="check_all"
                                        className="select-collection-row"
                                        checked={this.state.checkAllValue}
                                        onChange={(e) => this.selectAllItemForAPage(e)}
                                    />
                                <p>PRODUCT NAME</p>
                               </div>
                                <p>PRICE</p>
                                

                            </span>
                        <div className="product-list">
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
                                        let isExist = this.state.selectedProduct.filter(p => !_.isEmpty(p)).filter(p => p.id === product.id).length > 0 ? true : false;
                                       
                                        return (
                                            <section key={product.id + '_' + index + isExist}
                                                     className="gs-table-body-items">
                                                <div className="gs-table-body-item">
                                                    <ProductRow data={product}
                                                                onSelect={this.onSelect}
                                                                isExist={isExist}/>
                                                </div>
                                            </section>
                                        )
                                    })
                                    }
                                </PagingTable>
                            </UikFormInputGroup>

                        </div>
                        <div
                            className="gs-atm__flex-row--flex-end footer-btn d-flex justify-content-center">

                            <GSButton secondary outline
                                      onClick={() => this.onClose('cancel')}>
                                <Trans i18nKey={this.texts.cancelButton}/>
                            </GSButton>

                            <GSButton success marginLeft
                                      onClick={() => this.onClose('select')}
                            >
                                <Trans i18nKey={this.texts.okButton}/>

                            </GSButton>
                        </div>
                    </ModalBody>
                </Modal>}
            </>
        );
    }
}

AutomationProductModal.defaultProps = {
    type: 'BUSINESS_PRODUCT',
    showSearchOption: false,
    texts: {
        title: "component.collection.form.button.add_product.product",
        cancelButton: "common.btn.cancel",
        okButton: "common.btn.ok",
    },
}


AutomationProductModal.propTypes = {
    onClose: PropTypes.func,
    productSelectedList: PropTypes.any,
    type: PropTypes.oneOf(['BUSINESS_PRODUCT', 'SERVICE']),
    max: PropTypes.number,
    showSearchOption: PropTypes.bool,
    texts: {
        title: PropTypes.string,
        cancelButton: PropTypes.string,
        okButton: PropTypes.string,
    },
}

export default AutomationProductModal;
