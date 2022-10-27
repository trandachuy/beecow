import '../../../../sass/ui/_gswidget.sass'
import '../../../../sass/ui/_gsfrm.sass'
import {UikInput} from '../../../@uik'
import {Link, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import './SupplierList.sass'
import React, {Component} from 'react';
import {Trans} from "react-i18next";
import {ItemService} from "../../../services/ItemService";
import i18next from "i18next";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import Loading, {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";

class SupplierList extends Component {
    SIZE_PER_PAGE = 20

    constructor(props) {
        super(props);
        this.state = {
            itemList: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            redirectTo: '',
            isRedirect: false,
            isFetching: false,
        }

        this.filterConfig = {
            search: '',
            sort: 'id,desc'
        }
        // this.props.dispatch(setPageTitle(process.env.APP_NAME + ' - collection List'));

        this.tableConfig = {
            headerList: [
                i18next.t("component.supplier.list.table.code"),
                i18next.t("component.supplier.list.table.name"),
                i18next.t("component.supplier.list.table.mail"),
                i18next.t("component.supplier.list.table.phone")
            ],
            mobileHeaderList: [
                i18next.t("component.supplier.list.table.code"),
                i18next.t("component.supplier.list.table.name")
            ]
        }

        this.onChangeListPage = this.onChangeListPage.bind(this)
        this.redirectTo = this.redirectTo.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.onInputSearch = this.onInputSearch.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this)
    }

    onInputSearch(e) {
        const value = e.target.value
        if (this.stoSearch) clearTimeout(this.stoSearch)

        this.stoSearch = setTimeout( () => {
            this.filterConfig.search = value
            this.searchSupplier(0, this.SIZE_PER_PAGE, this.filterConfig.sort, this.filterConfig.search)
            e.preventDefault()
        }, 500)
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        })

        this.fetchData(pageIndex - 1, this.SIZE_PER_PAGE, this.filterConfig)
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    redirectTo(path) {
        this.setState({
            redirectTo: path,
            isRedirect: true
        })
    }

    onChangeFilter(sort) {
        this.filterConfig.sort = sort
        this.fetchData(0, this.SIZE_PER_PAGE, this.filterConfig)
    }

    fetchData(page, size, filterConfig) {
        this.setState({
            isFetching: true,
        })

        ItemService.fetchDashboardSupplier({
            page: page,
            size: size,
            sort: filterConfig.sort,
            'itemNameOrCode': filterConfig.search
        })
            .then(result => {
                if (this._isMounted) {
                    const totalItem = parseInt(result.headers['x-total-count'])
                    this.setState({
                        itemList: result.data,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                        isFetching: false,
                        totalItem: totalItem,
                        currentPage: page + 1
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

    searchSupplier(page, size, sort, keyword) {
        this.setState({
            isFetching: true,
        })

        ItemService.searchSupplier(page, size, sort, keyword)
            .then(result => {
                if (this._isMounted) {
                    const totalItem = parseInt(result.headers['x-total-count'])
                    this.setState({
                        itemList: result.data,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                        isFetching: false,
                        totalItem: totalItem,
                        currentPage: page + 1
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

    render() {
        return (
            <GSContentContainer minWidthFitContent className="supplier-list-page">
                {this.state.isRedirect &&
                <Redirect to={this.state.redirectTo}/>
                }
                <GSContentHeader title={
                    <GSContentHeaderTitleWithExtraTag
                        title={i18next.t("component.supplier.list.management")}
                        extra={this.state.totalItem}
                    />
                }
                >
                    <GSContentHeaderRightEl>
                        <GSButton success linkTo={NAV_PATH.supplierCreate}>
                            <GSTrans t="component.supplier.list.btn.createNew"/>
                        </GSButton>
                    </GSContentHeaderRightEl>
                </GSContentHeader>
                <GSContentBody size={GSContentBody.size.MAX}
                               className="supplier-list__body-desktop d-mobile-none d-desktop-flex">
                    {/*SUPPLIER LIST*/}
                    <GSWidget>
                        <GSWidgetContent className="supplier-list-widget">
                            {this.state.isFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY} className="d-flex justify-content-center align-items-center" cssStyle={{
                                height: '50vh',
                            }}/>
                            }
                            <div
                                className={"n-filter-container d-mobile-none d-desktop-flex " + (this.state.isFetching ? 'gs-atm--disable' : '')}>
                                {/*SEARCH*/}
                                <span style={{
                                    marginRight: 'auto'
                                }} className="gs-search-box__wrapper">
                                <UikInput
                                    key={this.filterConfig.search}
                                    defaultValue={this.filterConfig.search}
                                    autoFocus={this.filterConfig.search.length > 0 ? true : false}
                                    onChange={this.onInputSearch}
                                    icon={(
                                        <FontAwesomeIcon icon="search"/>
                                    )}
                                    placeholder={i18next.t("component.supplier.list.search_code_or_name")}
                                />
                            </span>
                            </div>
                            {!this.state.isFetching &&
                            <>
                                <PagingTable
                                    headers={this.tableConfig.headerList}
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={10}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.totalItem}
                                    className="d-mobile-none d-desktop-flex"
                                >
                                    {this.state.itemList.map((dataRow, index) => {
                                        return (
                                            <>
                                                <section
                                                    key={index + "_" + dataRow.id}
                                                    className="gs-table-body-items gsa-hover--gray"
                                                >
                                                    <div className="shortest-row">
                                                        <div className="gs-table-body-item">
                                                            <Link to={NAV_PATH.supplierEdit + "/" + dataRow.id}>
                                                                <strong>{dataRow.code}</strong>
                                                            </Link>
                                                        </div>
                                                        <div className="gs-table-body-item">
                                                            {dataRow.name}
                                                        </div>
                                                        <div className="gs-table-body-item">
                                                            {dataRow.email}
                                                        </div>
                                                        <div className="gs-table-body-item">
                                                            {dataRow.phoneNumber}
                                                        </div>
                                                    </div>
                                                </section>
                                            </>
                                        )
                                    })
                                    }
                                </PagingTable>

                                {this.state.itemList.length === 0 &&
                                <div
                                    className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                    <div style={{textAlign: "center"}}>
                                        <img src="/assets/images/icon_supplier_empty.svg"/>
                                        {' '}
                                        <span style={{display: "block", paddingTop: "12px"}}>
                                        <Trans i18nKey="component.supplier.list.table.empty"/>
                                    </span>
                                    </div>
                                </div>}
                            </>
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
                <GSContentBody size={GSContentBody.size.MAX}
                               className="supplier-list__body-mobile d-mobile-flex d-desktop-none">
                    {/*SUPPLIER LIST*/}
                    <GSWidget>
                        <GSWidgetContent className="supplier-list-widget">
                            {this.state.isFetching &&
                            <Loading style={LoadingStyle.DUAL_RING_GREY}/>
                            }
                            <div
                                className={"n-filter-container--mobile d-mobile-flex d-desktop-none " + (this.state.isFetching ? 'gs-atm--disable' : '')}>
                                {/*SEARCH*/}
                                <div className="row">
                                    <div className="col-12 col-sm-12">
                                    <span style={{
                                        marginRight: 'auto'
                                    }} className="gs-search-box__wrapper">
                                    <UikInput
                                        key={this.filterConfig.search}
                                        defaultValue={this.filterConfig.search}
                                        autoFocus={this.filterConfig.search.length > 0 ? true : false}
                                        onChange={this.onInputSearch}
                                        icon={(
                                            <FontAwesomeIcon icon="search"/>
                                        )}
                                        placeholder={i18next.t("component.supplier.list.search_code_or_name")}
                                    />
                                </span>
                                    </div>
                                </div>
                            </div>

                            {!this.state.isFetching &&
                            <>
                                <PagingTable
                                    headers={this.tableConfig.headerList}
                                    totalPage={this.state.totalPage}
                                    maxShowedPage={1}
                                    currentPage={this.state.currentPage}
                                    onChangePage={this.onChangeListPage}
                                    totalItems={this.state.itemList.length}
                                    className="m-paging d-mobile-flex d-desktop-none">
                                    <div className="mobile-review-list-list-container d-mobile-flex d-desktop-none">
                                        {
                                            this.state.itemList.map((dataRow, index) => {
                                                return (
                                                    <div key={"m-" + dataRow.id}
                                                         className="m-review-row gsa-hover--gray">
                                                        <div className="m-review-row__short">
                                                            <div className="m-review__info">
                                                                <Link to={NAV_PATH.supplierEdit + "/" + dataRow.id}>
                                                                    <strong>{dataRow.code}</strong>
                                                                </Link>
                                                            </div>
                                                            <div className="m-review__info">
                                                                {dataRow.name}
                                                            </div>
                                                            <div className="m-review__info">
                                                                {dataRow.email}
                                                            </div>
                                                            <div className="m-review__info">
                                                                {dataRow.phoneNumber}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </PagingTable>

                                {this.state.itemList.length === 0 &&
                                <div
                                    className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                                    <div style={{textAlign: "center"}}>
                                        <img src="/assets/images/icon_supplier_empty.svg"/>
                                        {' '}
                                        <span style={{display: "block", paddingTop: "12px"}}>
                                        <Trans i18nKey="component.supplier.list.table.empty"/>
                                    </span>
                                    </div>
                                </div>}
                            </>
                            }
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
                <ConfirmModal ref={(el) => {
                    this.refConfirmModal = el
                }}/>
            </GSContentContainer>
        )
    }
}

export default connect()(SupplierList);
