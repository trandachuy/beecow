import React, {Component} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {UikWidget, UikWidgetContent} from '../../../@uik'
import Loading from "../../../components/shared/Loading/Loading";
import './LazadaProducts.sass'
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import {CurrencyUtils} from "../../../utils/number-format";
import i18next from "i18next";
import {lazadaService} from "../../../services/LazadaService";
import Constants from "../../../config/Constant";
import moment from 'moment';
import {connect} from "react-redux";
import {RouteUtils} from "../../../utils/route";
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag";
import {CredentialUtils} from "../../../utils/credential";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import SelectSyncProductModal from "../../../components/shared/SelectSyncProductModal/SelectSyncProductModal";

class LazadaProducts extends Component {

    SIZE_PER_PAGE = 20;

    constructor(props) {
        super(props);
        this.state = {
            lzAccessToken: CredentialUtils.getLazadaToken(),
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            isFetching: false,
            storeId: CredentialUtils.getStoreId(),
            sellerId: CredentialUtils.getLazadaStoreId(),
        };
        // this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - Lazada Product List'));
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
    }

    isLazadaAuthorized = () => {
        if (!this.state.lzAccessToken && !this.state.sellerId) {
            lazadaService.getAccountByBcStoreId(this.state.storeId).then(res => {
                if (!res.sellerId) {
                    return RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount);
                }
                this.setState({ lzAccessToken: res.accessToken });
                this.setState({ sellerId: res.sellerId });
            }, error => RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount));
        } else if (this.state.lzAccessToken && !this.state.sellerId) {
            return RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount);
        }
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        });

        this.fetchData(pageIndex, this.SIZE_PER_PAGE);
    }
    UNSAFE_componentWillMount() {
        this.isLazadaAuthorized();

        this._isMounted = true;
        if (this.state.lzAccessToken) {
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

        lazadaService.getProducts({ "accessToken": this.state.lzAccessToken, page: page - 1, size: size, sort: "itemId,desc" })
            .then(result => {
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
        switch (status) {
            case "SYNC":
                return <GSStatusTag tagStyle={GSStatusTag.STYLE.SUCCESS} text={i18next.t('page.shopee.product.status.synced')} />;
            case "":
            case undefined:
                return <GSStatusTag tagStyle={GSStatusTag.STYLE.LIGHT} text={i18next.t('page.shopee.product.syn.status.never')} />;
        }
    }

    renderLastSyncDate(date) {
        if (date == null)
            return i18next.t("page.shopee.product.syn.status.never");
        return moment(date).format('DD-MM-YYYY');
    }

    render() {
        let prop = this.props;
        return (
            <GSContentContainer className="shopee-product" minWidthFitContent>

                {this.state.isShowSelectedProduct &&
                    <SelectSyncProductModal onClose={() => {
                        this.setState({
                            isShowSelectedProduct: false
                        })
                    }}
                        channel={Constants.SaleChannelId.LAZADA} />}

                <GSContentHeader
                    title={i18next.t("page.lazada.product.title")}
                    titleExpand={'(' + i18next.t("page.shopee.product.total.item", {
                        totalItem: this.state.totalItem
                    }) + ')'}
                    subTitle={i18next.t("page.shopee.product.list.subTitle", {
                        saleChannel: 'Lazada',
                    })}>
                    {/* <GSContentHeaderRightEl>
                        <UikButton success className="btn-save" onClick={() => {
                            this.setState({
                                isShowSelectedProduct: true
                            })
                        }}>
                            <Trans i18nKey="page.shopee.product.addProduct" className="sr-only" values={{
                                saleChannel: 'Lazada'
                            }}>
                                Create Product
                             </Trans>
                        </UikButton>
                    </GSContentHeaderRightEl> */}
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX} >
                    <UikWidget className="gs-widget">
                        <UikWidgetContent>
                            {this.state.isFetching &&
                                <Loading />
                            }
                            {!this.state.isFetching &&
                                // this.state.itemList.length > 0 &&
                                <PagingTable
                                    headers={this.tableConfig.headerList}
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={10}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.itemList}
                                    hidePagingEmpty>
                                    {this.state.itemList.map((dataRow, index) => {
                                            return (
                                                <section key={index + "_" + dataRow.id}
                                                         className="gs-table-body-items"
                                                // onClick={() => {const product = {product: dataRow}; RouteUtils.linkToWithObject(this.props, '/channel/lazada/product/edit/' + dataRow.id + '&channel=' + 'lazada', product)}}
                                                >
                                                    <div>
                                                        <b>{dataRow.id}</b>
                                                    </div>
                                                    <div id={'thumbnal-' + dataRow.id}>
                                                        {dataRow.models[0].Images[0] ?
                                                            <img src={dataRow.models[0].Images[0]} className="thumbnail" />
                                                            : "No Image"
                                                        }
                                                    </div>
                                                    <div className="gs-table-body-item"><b>{dataRow.name}</b>
                                                    </div>
                                                    <div>{CurrencyUtils.formatMoneyVND(dataRow.models[0].price)}</div>
                                                    <div>{this.renderStatus(dataRow.gosellStatus)}</div>
                                                    <div>{this.renderLastSyncDate(dataRow.models[0].lastModifiedDate)}</div>
                                                </section>

                                                )
                                            })
                                    }   
                                </PagingTable>
                            }
                        </UikWidgetContent>
                    </UikWidget>
                </GSContentBody>
            </GSContentContainer>
        );
    }
}
export default connect()(LazadaProducts);
