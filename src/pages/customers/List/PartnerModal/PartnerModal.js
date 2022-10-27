import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "reactstrap/es/Modal";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import {UikFormInputGroup, UikInput} from '../../../../@uik'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import './ParnerModal.sass'
import {Trans} from "react-i18next";
import ProductRow from "./ProductRow/ProductRow";
import i18next from "i18next";
import LoadingScreen from "../../../../components/shared/LoadingScreen/LoadingScreen";
import Loading, {LoadingStyle} from "../../../../components/shared/Loading/Loading";
import {GSToast} from "../../../../utils/gs-toast";
import Constants from "../../../../config/Constant";
import PagingTable from "../../../../components/shared/table/PagingTable/PagingTable";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSFakeLink from "../../../../components/shared/GSFakeLink/GSFakeLink";
import affiliateService from "../../../../services/AffiliateService";

class PartnerModal extends Component {
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
        isLoadingOnFirstTime: true,
        isSearching: false,
        isSearch: false,
        searchKeyword: '',
        totalItem: 0,
        totalPage: 0,
        checkAllValue: true,
        loadingWhenPaging: false,
    }

    constructor(props) {
        super(props);
        this.texts = {
            ...{
                title: "page.customers.allCustomer.assignPartner",
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
        this.unCheckAllPage = this.unCheckAllPage.bind(this);
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
                if (this.state.selectedProduct.length === 0) {
                    this.props.onClose(false, [])
                    return
                }
                this.props.onClose(false, this.state.selectedProduct)
            }
        } else {
            if (this.state.selectedProduct.length > this.props.max) {
                GSToast.warning(
                    i18next.t('page.customer.segment.maxPartner', {
                        max: this.props.max
                    })
                )
                return;
            }

            if (this.props.onClose) {
                this.props.onClose(true, this.state.selectedProduct)
            }
        }
    }

    onSelect(product, checked) {

        this.setState({
            selectedProduct: [product]
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
        
        affiliateService.getListPartnerByStore({partnerStatus:'ACTIVATED',partnerType:'DROP_SHIP',keyword: this.state.searchKeyword}, page, this.SIZE_PER_PAGE)
            .then(result => {
                    this.setState({
                        productList: result.data,
                        isFetchingSuccessful: true,
                        totalItem: +(result.totalCount),
                        currentPage: page + 1,
                        isLoadingOnFirstTime: false,
                        isSearching: false,
                        totalPage: Math.ceil(result.totalCount / this.SIZE_PER_PAGE),
                        loadingWhenPaging: false
                    })
                })
    }

    unCheckAllPage() {
        this.setState({
            selectedProduct: [],
            checkAllValue: false,
        })
    }


    render() {
        return (
            <>
                {this.state.isLoadingOnFirstTime && <LoadingScreen/>}
                
                <Modal isOpen={!this.state.isSearch} className="select-partner-modal"
                       size='lg'>
                    <ModalHeader>
                        {
                            this.texts && this.texts.title ?
                                <Trans i18nKey={this.props.texts.title}/> :
                                (this.props.type === Constants.ITEM_TYPE.BUSINESS_PRODUCT ?
                                        <Trans i18nKey="component.collection.form.button.add_product.product"/>
                                        :
                                        <Trans i18nKey="component.collection.form.button.add_product.service"/>
                                )
                        }
                      
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
                                    placeholder={i18next.t("page.customers.allCustomer.partner.search")}
                                    onChange={this.onInputSearch}
                                />
                            </span>
                        </div>
                        <div className={this.state.productList.length === 0 ? "product-list empty" : "product-list"}>
                            {this.state.productList.length === 0 &&
                            <div className="empty-partner-list">
                                <img alt="empty-partner-list" src="/assets/images/empty-partner-list.png"/>
                                {i18next.t('page.customers.allCustomer.noPartnerFound')}
                            </div>
                            }
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

                                    {this.state.loadingWhenPaging === false && this.state.productList.length > 0 && this.state.productList.map((product, index) => {
                                        return (
                                            <section key={product.id + '_' + index}
                                                     className="gs-table-body-items">
                                                <div className="gs-table-body-item">
                                                    <ProductRow data={product}
                                                                onSelect={this.onSelect}
                                                    />
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

                            <GSButton success marginLeft disabled={this.state.selectedProduct.length === 0}
                                      onClick={() => this.onClose('select')}
                            >
                                <Trans i18nKey={this.texts.okButton}/>

                            </GSButton>
                        </div>
                    </ModalBody>
                </Modal>
            </>
        );
    }
}

PartnerModal.defaultProps = {
    type: 'BUSINESS_PRODUCT',
    texts: {
        title: "page.customers.allCustomer.assignPartner",
        cancelButton: "common.btn.cancel",
        okButton: "common.btn.ok",
    },
    max: 1
}


PartnerModal.propTypes = {
    onClose: PropTypes.func,
    productSelectedList: PropTypes.any,
    type: PropTypes.oneOf(['BUSINESS_PRODUCT', 'SERVICE']),
    max: PropTypes.number,
    texts: {
        title: PropTypes.string,
        cancelButton: PropTypes.string,
        okButton: PropTypes.string,
    },
}

export default PartnerModal;
