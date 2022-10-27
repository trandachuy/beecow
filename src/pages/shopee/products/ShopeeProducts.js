import React, {Component} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {UikWidget, UikWidgetContent} from '../../../@uik'
import {Trans} from "react-i18next";
import Loading from "../../../components/shared/Loading/Loading";
import './ShopeeProducts.sass'
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import {CurrencyUtils} from "../../../utils/number-format";
import i18next from "i18next";
import shopeeService from "../../../services/ShopeeService";
import storageService from "../../../services/storage";
import Constants from "../../../config/Constant";
import {connect} from "react-redux";
import moment from 'moment';
import SelectSyncProductModal from "../../../components/shared/SelectSyncProductModal/SelectSyncProductModal";
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import {CredentialUtils} from "../../../utils/credential";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSButton from "../../../components/shared/GSButton/GSButton";
import _ from 'lodash';

class ShopeeProduct extends Component {

    SIZE_PER_PAGE = 100;

    constructor(props) {
        super(props);
        this.state = {
            shopeeShopId: storageService.getFromLocalStorage(Constants.STORAGE_KEY_SHOPEE_SHOP_ID),
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            isFetching: false,
            isShowSelectedProduct: false
        };
        // this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - Shopee Product List'));

        this.tableConfig = {
            headerList: [
                i18next.t("page.shopee.product.tbheader.id"),
                i18next.t("page.shopee.product.tbheader.thumbnail"),
                i18next.t("page.shopee.product.tbheader.productName"),
                i18next.t("page.shopee.product.tbheader.price"),
                i18next.t("page.shopee.product.tbheader.status"),
                i18next.t("page.shopee.product.tbheader.lastSynDate")
            ]
        };

        this.onChangeListPage = this.onChangeListPage.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.onClickCreateProduct = this.onClickCreateProduct.bind(this);
        this.onCloseCreateProduct = this.onCloseCreateProduct.bind(this);
    }

    onClickCreateProduct() {
        this.setState({
            isShowSelectedProduct: true
        })
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        });

        this.fetchData(pageIndex, this.SIZE_PER_PAGE);
    }

    componentDidMount() {
        // check connect
        const shopeeStoreId = CredentialUtils.getShopeeStoreId()
        if (!shopeeStoreId) { // => if not connect -> redirect to shopee account
            RouteUtils.linkTo(this.props, NAV_PATH.shopeeAccount)
        }


        this._isMounted = true;
        if (this.state.shopeeShopId) {
            this.fetchData(1, this.SIZE_PER_PAGE)
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    fetchData(page, size) {

        this.setState({
            isFetching: true
        });

        shopeeService.getProducts(this.state.shopeeShopId, {
            page: page - 1,
            size: size
        }).then(result => {
                const totalItem = parseInt(result.headers['x-total-count']);
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

    renderStatus(status) {
        const channel = 'Shopee'
        if (status) {
            let className = 'gs-status-tag ';
            let text = 'page.shopee.product.status.';
            let tagStyle, tips
            switch (status) {
                case "SYNC":
                    className += 'gs-status-tag--sync';
                    text += 'sync';
                    tagStyle = GSStatusTag.STYLE.SUCCESS
                    tips = i18next.t('page.3thParty.product.inSync', {saleChannel: channel})
                    break;
                case "DRAFT":
                    className += 'gs-status-tag--draft';
                    text += 'draft';
                    tagStyle = GSStatusTag.STYLE.SECONDARY
                    tips = i18next.t('page.3thParty.product.draft')
                    break;
                case "ERROR":
                    className += 'gs-status-tag--error';
                    text += 'error';
                    tagStyle = GSStatusTag.STYLE.DANGER
                    tips = i18next.t('page.3thParty.product.error', {saleChannel: channel})
                    break
            }
            return (
                <GSComponentTooltip placement={GSComponentTooltipPlacement.LEFT} message={tips}>
                    <GSStatusTag tagStyle={tagStyle} text={i18next.t(text)}/>
                </GSComponentTooltip>
            )
        } else {
            return   <GSStatusTag tagStyle={GSStatusTag.STYLE.LIGHT} text={i18next.t('page.shopee.product.syn.status.never')}/>
        }
    }

    renderLastSyncDate(date) {
        if (date == null) {
            return i18next.t("page.shopee.product.syn.status.never");
        } else {
            return moment(date).format('DD-MM-YYYY');
        }
    }

    render() {
        return (
            <GSContentContainer className="shopee-product" minWidthFitContent>

                {this.state.isShowSelectedProduct &&
                <SelectSyncProductModal onClose={this.onCloseCreateProduct}
                                        channel={Constants.SaleChannelId.SHOPEE}/>}

                <GSContentHeader
                    title={i18next.t("page.shopee.product.title")}
                    titleExpand={'('+i18next.t("page.shopee.product.total.item", {
                        totalItem: this.state.totalItem
                    })+')'}
                    subTitle={i18next.t("page.shopee.product.list.subTitle", {
                        saleChannel: 'Shopee',
                    })}

                >
                    <GSContentHeaderRightEl>
                        <GSButton success className="btn-save" onClick={this.onClickCreateProduct}>
                            <Trans i18nKey="page.shopee.product.addProduct" className="sr-only" values={{
                                saleChannel: 'Shopee'
                            }}>
                                Create Product
                            </Trans>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} >
                    <UikWidget className ="gs-widget">
                        <UikWidgetContent>
                            { this.state.isFetching &&
                            <Loading/>
                            }
                            {!this.state.isFetching && (
                                <PagingTable
                                    headers={this.tableConfig.headerList}
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={10}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.totalItem}
                                >
                                {this.state.itemList.map((dataRow, index) => {
                                    return (
                                        <section key={index + "_" + dataRow.id}
                                                 className="gs-table-body-items"
                                                 // onClick={() => RouteUtils.linkTo(this.props, '/product/edit/' + dataRow.id)}
                                        >
                                            <div className="gs-table-body-item">
                                                <span><b>{dataRow.id}</b></span>
                                            </div>
                                            <div id={'thumbnal-' + dataRow.id}>
                                            {
                                                dataRow.firstImageUrl ?
                                                    <img src={dataRow.firstImageUrl} className="thumbnail"/>
                                                : "No Image"}
                                            </div>
                                            <div className="gs-table-body-item product-table__name">
                                                <span><b>{dataRow.name}</b></span>
                                            </div>
                                            <div>{CurrencyUtils.formatMoneyByCurrency(dataRow.price, dataRow.currency)}</div>
                                            <div>{this.renderStatus(dataRow.gosellStatus)}</div>
                                            <div>{this.renderLastSyncDate(dataRow.lastSyncDate)}</div>

                                        </section>
                                        )
                                    })
                                }
                                </PagingTable>)}
                        </UikWidgetContent>
                    </UikWidget>
                </GSContentBody>
            </GSContentContainer>
        );
    }

    onCloseCreateProduct() {
        this.setState({
            isShowSelectedProduct: false
        })
    }
}

export default connect()(ShopeeProduct);
