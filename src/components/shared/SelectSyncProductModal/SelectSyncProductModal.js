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
import GSWidgetHeaderSubtitle from "../form/GSWidget/GSWidgetHeaderSubtitle";
import {UikFormInputGroup, UikInput} from '../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './SelectSyncProductModal.sass'
import {Trans} from "react-i18next";
import {cancelablePromise} from "../../../utils/promise";
import {ItemService} from "../../../services/ItemService";
import Constants from "../../../config/Constant";
import SelectSyncProductRow from "./SelectSyncProductRow/SelectSyncProductRow";
import i18next from "i18next";
import Loading, {LoadingStyle} from "../Loading/Loading";
import AlertModal, {AlertModalType} from "../AlertModal/AlertModal";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import {GSToast} from "../../../utils/gs-toast";
import {Link} from "react-router-dom";
import {NAV_PATH} from "../../layout/navigation/Navigation";
import GSButton from "../GSButton/GSButton";

class  SelectSyncProductModal extends Component {
    SIZE_PER_PAGE = 20
    totalItem = 0
    ON_INPUT_DELAY = 500


    state = {
        productList: [],
        isFetching: false,
        isFetchingSuccessful: true,
        selectedProduct: null,
        currentPage: 0,
        isFetchingMore: false,
        isHasProduct: false,
        isLoadingOnFirstTime: true,
        isSearching: false,
        isSearch: false,
        searchKeyword: ''
    }

    constructor(props) {
        super(props);
        this.fetchProduct = this.fetchProduct.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.fetchMoreProduct = this.fetchMoreProduct.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
        this.buildRedirectLinkToProduct = this.buildRedirectLinkToProduct.bind(this);
    }


    render() {
        return (
           <>
               {this.state.isLoadingOnFirstTime && !this.state.isHasProduct && <LoadingScreen/>}
               {!this.state.isHasProduct && <AlertModal ref={el => this.refAlert = el}/>}
               {this.state.isHasProduct &&
               <Modal isOpen={this.state.isHasProduct && !this.state.isSearch} className="shopee-select-sync-product-modal">
                    <ModalHeader>
                        <Trans i18nKey="page.shopee.product.selectProduct.title"/>
                        <GSWidgetHeaderSubtitle>
                            <Trans i18nKey="page.shopee.product.selectProduct.subTitle"/>
                        </GSWidgetHeaderSubtitle>
                    </ModalHeader>
                    <ModalBody>
                        <div className="gsa__relative">
                            <UikInput
                                icon={ (
                                    <FontAwesomeIcon icon={"search"}/>
                                ) }
                                iconPosition="left"
                                placeholder={i18next.t("page.shopee.product.selectProduct.search")}
                                onChange={this.onInputSearch}
                            />
                            {this.state.isSearching &&
                            <div className="spinner-border text-secondary" role="status">
                            </div>}
                        </div>
                        <div className="product-list gs-atm__scrollbar-1" onScroll={this.onScroll} ref={el => this.refProdList = el}>
                            {this.state.productList.length > 0?
                            <UikFormInputGroup>
                                {this.state.productList.map( (product, pIndex) => {
                                    return (
                                        <SelectSyncProductRow key={product.id} data={product} onSelect={this.onSelect}/>
                                    )
                                })}
                            </UikFormInputGroup>
                            :
                                <div className="loading-product">
                                    {/*<Loading style={LoadingStyle.DUAL_RING_GREY}*/}
                                    {/*         retry={!this.state.isFetchingSuccessful}*/}
                                    {/*         onRetry={() => this.fetchProduct(0)}*/}
                                    {/*/>*/}
                                </div>}

                                {this.state.isFetchingMore &&
                                    <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                                }
                        </div>
                        <div className="gs-atm__flex-row--flex-end">
                            <GSButton secondary outline onClick={this.props.onClose}>
                                <Trans i18nKey="common.btn.cancel"/>
                            </GSButton>
                            <Link to={this.buildRedirectLinkToProduct(this.state.selectedProduct? this.state.selectedProduct.id:null)} className="gsa-text--non-underline">
                            <GSButton success
                                      disabled={!this.state.selectedProduct}
                                      marginLeft>
                                <Trans i18nKey="page.shopee.product.selectProduct.btn.select"/>
                            </GSButton>
                            </Link>
                        </div>
                    </ModalBody>
            </Modal>}
           </>
        );
    }

    onInputSearch(event) {
        const keyword = event.currentTarget.value
        if (this.stoSearch) clearTimeout(this.stoSearch)
        this.stoSearch = setTimeout( () => {
            this.setState({
                isSearching: true,
                searchKeyword: keyword
            }, () => {
                this.fetchProduct(0, keyword)
            })
        }, this.ON_INPUT_DELAY)
    }

    onScroll(event) {
        const obj = event.currentTarget
        // => scroll to bottom and is not fetching
        if (!this.state.isFetchingMore && (obj.scrollTop === (obj.scrollHeight - obj.offsetHeight))) {
            this.fetchMoreProduct(this.state.searchKeyword)
        }
    }

    onClose() {
        if (this.props.onClose) {
            this.props.onClose()
        }
    }

    onSelect(product) {
        this.setState({
            selectedProduct: product
        })
    }

    componentDidMount() {
        this.fetchProduct(0, '')
    }

    buildRedirectLinkToProduct(productId) {
        switch (this.props.channel) {
            case Constants.SaleChannelId.SHOPEE:
                return NAV_PATH.shopeeProduct + `/${productId}`
            case Constants.SaleChannelId.LAZADA:
                return NAV_PATH.lazadaProductEdit + `/${productId}&channel=lazada`
            case Constants.SaleChannelId.TIKI:
                return NAV_PATH.tikiProduct + `/${productId}`
        }
    }

    fetchMoreProduct(keyword) {
        const maxPage = Math.ceil(this.state.totalItem/this.SIZE_PER_PAGE)
        const nextPage = this.state.currentPage + 1
        if (nextPage >= maxPage) return

        this.setState({
            isFetchingMore: true
        })


        this.pmFetchMoreProduct = cancelablePromise(ItemService.getUnSyncProduct(this.props.channel, nextPage, this.SIZE_PER_PAGE, keyword))
        this.pmFetchMoreProduct.promise
            .then( result => {
                this.setState( state => {
                    return {
                        productList: [...state.productList, ...result.data],
                        totalItem: result.total,
                        currentPage: nextPage,
                        isFetchingMore: false,
                        isSearching: false
                }})
            })
            .catch(e => {

            })
    }

    fetchProduct(page, keyword) {
        this.setState({
            isFetchingSuccessful: true,
            isLoadingOnFirstTime: true
        })


        this.pmFetchProduct = cancelablePromise(ItemService.getUnSyncProduct(this.props.channel, page, this.SIZE_PER_PAGE, keyword))
        this.pmFetchProduct.promise
            .then( result => {
                // if have no product
                if (page === 0 && result.data.length === 0 && !this.state.isSearching) {
                    this.setState({
                        isHasProduct: false,
                        isLoadingOnFirstTime: false
                    })
                    this.refAlert.openModal({
                        messages: i18next.t("page.shopee.product.selectProduct.noProduct"),
                        type: AlertModalType.ALERT_TYPE_SUCCESS,
                        closeCallback: this.props.onClose
                    })
                } else {
                    // this.refProdList.current.scrollTop = 0
                    this.setState({
                        isHasProduct: true,
                        productList: result.data,
                        isFetchingSuccessful: true,
                        totalItem: result.total,
                        currentPage: page,
                        isLoadingOnFirstTime: false,
                        isSearching: false
                    })
                }
            })
            .catch(e => {
                this.setState({
                    isFetchingSuccessful: false,
                    isLoadingOnFirstTime: false,
                    isSearching: false
                })
                GSToast.error(i18next.t("common.api.failed"))
                this.props.onClose()
            })
    }

    componentWillUnmount() {
        if (this.pmFetchProduct) this.pmFetchProduct.cancel()
    }
}


/**
 * onClose: callback function when modal is closed
 * channel: one of Constants.SaleChannelId
 * editLinkPrefix: redirect link to edit page when choose product
 */
SelectSyncProductModal.propTypes = {
    onClose: PropTypes.func,
    channel: PropTypes.oneOf(Object.values(Constants.SaleChannelId)).isRequired,
};

export default SelectSyncProductModal;
