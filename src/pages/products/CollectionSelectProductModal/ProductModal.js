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
import {UikCheckbox, UikFormInputGroup, UikInput, UikSelect} from '../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './ProductModal.sass'
import {Trans} from "react-i18next";
import {ItemService} from "../../../services/ItemService";
import ProductRow from "./ProductRow/ProductRow";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {GSToast} from "../../../utils/gs-toast";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import GSButton from "../../../components/shared/GSButton/GSButton";
import Constants from "../../../config/Constant";
import {SEARCH_BY_ENUM} from "../ProductList/BarcodePrinter/ProductListBarcodePrinter";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../components/shared/GSFakeLink/GSFakeLink";
import storeService from "../../../services/StoreService";

class ProductModal extends Component {
    SIZE_PER_PAGE = 20
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
        searchBy: SEARCH_BY_ENUM.PRODUCT
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
        this.notAllowConversion = this.notAllowConversion.bind(this);
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
                this.props.onClose(null)
            }
        } else {
            if (this.props.onClose) {
                if (this.notAllowConversion(this.state.selectedProduct)){
                    return
                }
                this.props.onClose(this.state.selectedProduct)
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

            this.notAllowConversion(lstProduct)

        } else {
            // uncheck => remove from list
            lstProduct = lstProduct.filter(p => p.id !== product.id);
        }

        this.setState({
            selectedProduct: lstProduct
        })
    }

    notAllowConversion(productList) {
        const productConversiton = productList.filter(prod=> prod.parentId)
        if(productConversiton.length > 0 && this.props.typeModal === Constants.TYPE_PRODUCT_MODAL.FLASH_SALE){
            GSToast.error(i18next.t("page.promotion.flashSale.errorNotAllow"))
            return true
        }
        return false
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
        storeService.getActiveStoreBranches()
            .then(branch => {
                const branchIds = branch.map(branch => branch.id)

                return ItemService.getProductSuggestionByName(page, this.SIZE_PER_PAGE, this.state.searchBy, this.state.searchKeyword, false, '', {
                    branchIds,
                    includeConversion: true
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

    unCheckAllPage() {
        this.setState({
            selectedProduct: [],
            checkAllValue: false,
        })
    }

    onChangeSearchBy(e) {
        const {value} = e;
        this.setState({
            searchBy: value
        }, () => {
            this.fetchDataOfDashboard(0);
        });
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
                                    <GSTrans t="page.product.list.printBarCode.selected"
                                             values={{quantity: this.state.selectedProduct.length}}>
                                        0<b>1</b>
                                    </GSTrans>
                                    {' | '}
                                    <GSFakeLink className="font-weight-bold" onClick={this.unCheckAllPage}>
                                        <GSTrans t="page.product.list.printBarCode.unCheckAll"/>
                                    </GSFakeLink>
                                </>
                            }
                        </div>
                    </ModalHeader>
                    <ModalBody>
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
                                {/* { this.state.isSearching && 
                                <div className="spinner-border text-secondary" role="status">
                                </div>} */}
                            </span>
                        </div>
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
                                                     className={product.parentId ? "gs-table-body-items unit" : "gs-table-body-items"}>
                                                <div className={product.parentId ? "gs-table-body-item unit" : "gs-table-body-item"}>
                                                    <ProductRow data={product}
                                                                index={index}
                                                                onSelect={this.onSelect}
                                                                selectAllItemForAPage={(e)=>this.selectAllItemForAPage(e)}
                                                                isExist={isExist}/>
                                                    <div className="product-item-row-border"></div>
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
                                      onClick={() => {
                                          this.onClose('select')
                                      }}
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

ProductModal.defaultProps = {
    type: 'BUSINESS_PRODUCT',
    showSearchOption: false,
    texts: {
        title: "component.collection.form.button.add_product.product",
        cancelButton: "common.btn.cancel",
        okButton: "common.btn.ok",
    },
}


ProductModal.propTypes = {
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
    typeModal: PropTypes.string
}

export default ProductModal;
