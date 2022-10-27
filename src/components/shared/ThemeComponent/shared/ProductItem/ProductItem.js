/*******************************************************************************
 * Copyright 2019 (C) Mediastep Software Inc.
 *
 * Created on : 26/08/2019
 * Author: Tien Dao <tien.dao@mediastep.com>
 *******************************************************************************/
import React from "react";
import './ProductItem.sass'
import LoadingScreen from "../../../LoadingScreen/LoadingScreen";
import Loading, {LoadingStyle} from "../../../Loading/Loading";
import {GSToast} from "../../../../../utils/gs-toast";
import AlertInline, {AlertInlineType} from "../../../AlertInline/AlertInline";
import i18next from "i18next";
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import GSWidgetHeaderSubtitle from "../../../form/GSWidget/GSWidgetHeaderSubtitle";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import {Trans} from "react-i18next";
import {cancelablePromise} from "../../../../../utils/promise";
import {ItemService} from "../../../../../services/ItemService";
import SelectSyncProductRow from "../../../SelectSyncProductModal/SelectSyncProductRow/SelectSyncProductRow";
import GSButton from "../../..//GSButton/GSButton";
import {UikFormInputGroup, UikInput} from '../../../../../@uik'
import AlertModal, {AlertModalType} from "../../../AlertModal/AlertModal";
import GSFakeLink from "../../../GSFakeLink/GSFakeLink";
import {ThemeValidationUtils} from "../../../../../utils/theme-validation";


export default class ProductItem extends React.Component {

    /*
    * PROPS
    *
    * 1. productId : product id
    * 2. callBackFunction(
    *       indexGroup : group position from props,
    *       indexSchema : schema position from props,
    *       productId : output product id for parent component
    *    )
    *     
    */

    SIZE_PER_PAGE = 20
    totalItem = 0
    ON_INPUT_DELAY = 500

    state = {
        productId: '',
        productName: '',
        error: null,
        isShowSelectedProduct: false,

        // for modal product
        productList: [],
        isFetching: false,
        isFetchingSuccessful: true,
        currentPage: 0,
        isFetchingMore: false,
        isHasProduct: false,
        isLoadingOnFirstTime: true,
        isSearching: false,
        isSearch: false,
        searchKeyword: '',
        totalPage: 0,

        lang: 'product',
    }

    constructor(props) {
        super(props)

        this.ref = React.createRef()

        // validate
        this.isValid = this.isValid.bind(this)

        // for modal product
        this.openProductModal = this.openProductModal.bind(this)
        this.fetchProduct = this.fetchProduct.bind(this);
        this.cancelOrChoose = this.cancelOrChoose.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.fetchMoreProduct = this.fetchMoreProduct.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
    }

    componentDidMount() {
        if(this.props.productId){
            this.setState({productId : this.props.productId})

            // get product detail
            ItemService.fetch(this.props.productId).then(res => {
                this.setState({productName : res.name})
            }).catch(e => {
                this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, '')
                this.setState({productId: '', productName : ''})
            })
        }
    }

    componentWillUnmount() {
        if (this.pmFetchProduct) this.pmFetchProduct.cancel()
    }

    openProductModal(){
        this.setState({isShowSelectedProduct : true})
        this.fetchProduct(0, '')
    }

    fetchProduct(page, keyword) {
        this.setState({
            isFetchingSuccessful: true,
            isLoadingOnFirstTime: true,
            currentPage: page
        })

        this.pmFetchProduct = cancelablePromise(ItemService.fetchDashboardItems({
            page: page,
            size: this.SIZE_PER_PAGE,
            searchItemName : keyword,
            bhStatus: 'ACTIVE',
            itemType: 'BUSINESS_PRODUCT'
        }))
        this.pmFetchProduct.promise
            .then( result => {
                const totalItem = parseInt(result.headers['x-total-count'])
                
                // if have no product
                if (page === 0 && result.data.length === 0 && !this.state.isSearching) {
                    this.setState({
                        isHasProduct: false,
                        isLoadingOnFirstTime: false
                    })
                    this.refAlert.openModal({
                        messages: i18next.t("page." + this.state.lang + ".list.table.empty.text"),
                        type: AlertModalType.ALERT_TYPE_SUCCESS
                    })
                } else {
                    // this.refProdList.current.scrollTop = 0
                    this.setState({
                        isHasProduct: true,
                        productList: result.data,
                        isFetchingSuccessful: true,
                        totalItem: totalItem,
                        isLoadingOnFirstTime: false,
                        isSearching: false,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
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
            })
    }

    fetchMoreProduct(keyword) {
        const maxPage = Math.ceil(this.state.totalItem/this.SIZE_PER_PAGE)
        const nextPage = this.state.currentPage + 1
        if (nextPage > maxPage) return

        this.setState({
            isFetchingMore: true
        })

        this.pmFetchMoreProduct = cancelablePromise(ItemService.fetchDashboardItems({
            page: nextPage,
            size: this.SIZE_PER_PAGE,
            searchItemName : keyword,
            bhStatus: 'ACTIVE',
            itemType: 'BUSINESS_PRODUCT'
        }))
        this.pmFetchMoreProduct.promise
            .then( result => {
                const totalItem = parseInt(result.headers['x-total-count'])

                this.setState( state => {
                    return {
                        productList: [...state.productList, ...result.data],
                        totalItem: totalItem,
                        currentPage: nextPage,
                        isFetchingMore: false,
                        isSearching: false,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                }})
            })
            .catch(e => {
                this.setState({
                    isFetchingMore: false
                })
            })
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

    onScroll(e) {
        const bottom = this.isBottom(e.currentTarget)
        const currentPage = this.state.currentPage

        if (bottom && currentPage < this.state.totalPage && !this.state.isFetchingMore) {
            this.setState({
                isFetchingMore: true
            })
            this.fetchMoreProduct(this.state.searchKeyword)
        }
    }

    cancelOrChoose(action) {
        this.setState({isShowSelectedProduct: false})
    }

    onSelect(product) {
        this.setState({
            productId: product.id,
            productName: product.name,
            error: {isError: false, message: ''}
        })
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, product.id)
    }

    isValid(){
        this.props.callBackFunction(this.props.indexGroup, this.props.indexSchema, this.state.productId)

        let error = ThemeValidationUtils.themeValidationId(this.props.validateRule, this.state.productId)
        this.setState({error: error})

        return !error
    }

    isBottom(el){
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }

    render() {
        return (
            <>
            <div className="product-item__type">
                <div className="title-click">
                    <div className="title-hover">
                        <GSFakeLink onClick={this.openProductModal}>
                            {this.state.productName ? this.state.productName : i18next.t('component.theme.item.linkto.choose.' + this.state.lang)}
                        </GSFakeLink>
                        
                    </div>
                    {
                        (this.state.error && this.state.error.isError) &&
                        <AlertInline 
                            className="product-item__type-error"
                            type={AlertInlineType.ERROR}
                            nonIcon
                            text={this.state.error.message}/>
                    }
                    
                </div>
                {
                    this.state.isShowSelectedProduct &&
                    <div>
                        {this.state.isLoadingOnFirstTime && !this.state.isHasProduct && <LoadingScreen/>}
                        {!this.state.isHasProduct && <AlertModal ref={el => this.refAlert = el}/>}
                        {this.state.isHasProduct &&
                            <Modal isOpen={this.state.isHasProduct && !this.state.isSearch} className="shopee-select-sync-product-modal theme-select-product__item-modal">
                                <ModalHeader close={
                                    <i
                                    className="btn-close__icon"
                                    onClick={() => this.cancelOrChoose('cancel')}
                                    />
                                }>
                                    <Trans i18nKey={"component.theme.item.linkto.select." + this.state.lang}/>
                                    <GSWidgetHeaderSubtitle>
                                        <Trans i18nKey={"component.theme.item.linkto.pick." + this.state.lang}/>
                                    </GSWidgetHeaderSubtitle>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="gsa__relative">
                                        <UikInput
                                            icon={ (
                                                <FontAwesomeIcon icon={"search"}/>
                                            ) }
                                            iconPosition="left"
                                            placeholder={i18next.t("component.theme.item.linkto.search." + this.state.lang)}
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
                                                if(product.models && product.models.length > 0){
                                                    product.hasModel = true
                                                }
                                                return (
                                                    <SelectSyncProductRow isExist={product.id === this.state.productId} key={product.id} data={product} onSelect={this.onSelect}/>
                                                )
                                            })}
                                        </UikFormInputGroup>
                                        :
                                            <div className="loading-product">
                                            </div>}

                                            {this.state.isFetchingMore &&
                                                <Loading style={LoadingStyle.ELLIPSIS_GREY}/>
                                            }
                                    </div>
                                    <div className="gs-atm__flex-row--flex-end">
                                        <GSButton 
                                            success
                                            disabled={!this.state.productId}
                                            onClick={(e) => this.cancelOrChoose('choose')}
                                            marginLeft
                                        >
                                            <Trans i18nKey="common.btn.ok"/>
                                        </GSButton>
                                    </div>
                                </ModalBody>
                            </Modal>
                        }
                    </div>
                }
                
            </div>
            
            </>
            
        )
    }

}



