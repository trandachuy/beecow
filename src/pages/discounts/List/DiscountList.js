import React, {Component} from 'react';
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import PagingTable from "../../../components/shared/table/PagingTable/PagingTable";
import './DiscountList.sass';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index";
import {UikInput} from '../../../@uik';
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import i18next from "i18next";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {BCOrderService} from '../../../services/BCOrderService';
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {CredentialUtils} from '../../../utils/credential';
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import moment from 'moment';
import GSContentHeaderTitleWithExtraTag
    from "../../../components/layout/contentHeader/HeaderExtraTag/GSContentHeaderTitleWithExtraTag";
import GSStatusTag from "../../../components/shared/GSStatusTag/GSStatusTag";
import GSDropDownButton, {GSDropdownItem} from "../../../components/shared/GSButton/DropDown/GSDropdownButton";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {DISCOUNT_TYPES} from "../DiscountEditor/Editor/DiscountEditor";
import PrivateComponent from "../../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {GSToast} from "../../../utils/gs-toast";

const DISCOUNT_STATUS = {
    IN_PROGRESS: "IN_PROGRESS",
    EXPIRED: "EXPIRED",
    SCHEDULED: "SCHEDULED"

}

class Discount extends Component {

    SIZE_PER_PAGE = 20;
    ON_INPUT_DELAY = 500
    state = {
        isFetching: false,
        discountDropDownOpen: false,
        typeDropDownOpen: false,
        statusDropDownOpen: false,
        currentPage: 1,
        totalPage: 1,
        totalItem: 0,
        discounts: [
            {id: 0, name: i18next.t("component.discount.label.coupon.code")},
            {id: 1, name: i18next.t("component.discount.label.wholesale_pricing")}
        ],
        status: [
            {id: 0, name: i18next.t("component.discount.tbl.status.all"), value: undefined},
            {id: 1, name: i18next.t("component.discount.tbl.status.scheduled"), value: "SCHEDULED"},
            {id: 2, name: i18next.t("component.discount.tbl.status.expired"), value: "EXPIRED"},
            {id: 3, name: i18next.t("component.discount.tbl.status.inprogress"), value: "IN_PROGRESS"}
        ],
        types: [
            {id: 0, name: i18next.t("component.discount.tbl.type.all"), value: undefined},
            {id: 1, name: i18next.t("page.discount.list.type.coupon"), value: DISCOUNT_TYPES.PROMOTION_PRODUCT},
            {id: 2, name: i18next.t("page.discount.list.type.coupon_service"), value: DISCOUNT_TYPES.PROMOTION_SERVICE},
            {id: 3, name: i18next.t("page.discount.list.type.whole_sale"), value: DISCOUNT_TYPES.WHOLESALE_PRODUCT},
            {
                id: 4,
                name: i18next.t("page.discount.list.type.whole_sale_service"),
                value: DISCOUNT_TYPES.WHOLESALE_SERVICE
            },
        ],
        statusSelect: {id: 0, name: i18next.t("component.discount.tbl.status.all")},
        typeSelect: {id: 0, name: i18next.t("component.discount.tbl.type.all")},
        data: [],
        showToolTip: false,
        isSearching: false,
        searchKeyword: undefined
    }

    constructor(props) {
        super(props);
        this.createDiscount = this.createDiscount.bind(this);
        this.discountToggle = this.discountToggle.bind(this);
        this.tableConfig = {
            headerList: [
                i18next.t("component.discount.tbl.name"),
                i18next.t("component.discount.tbl.type"),
                i18next.t("component.discount.tbl.active.date"),
                i18next.t("component.discount.tbl.status"),
                i18next.t("component.discount.tbl.actions")
            ]
        };
        this.onChangeListPage = this.onChangeListPage.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.renderStatus = this.renderStatus.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.openConfirm = this.openConfirm.bind(this);
        this.handleDuplicate = this.handleDuplicate.bind(this);
        this.endEarly = this.endEarly.bind(this);
        this.renderLastSyncDate = this.renderLastSyncDate.bind(this);
        this.redirectToviewDetail = this.redirectToviewDetail.bind(this);
        this.redirectToEdit = this.redirectToEdit.bind(this);
        this.onInputSearch = this.onInputSearch.bind(this);
        this.typeToggle = this.typeToggle.bind(this);
        this.statusToggle = this.statusToggle.bind(this);
        this.selectStatus = this.selectStatus.bind(this)
        this.selectType = this.selectType.bind(this);
        this.removeDiscount = this.removeDiscount.bind(this);
    }

    componentDidMount() {
        this.fetchData(1, this.SIZE_PER_PAGE);
    }

    discountToggle() {
        this.setState(previous => ({
            discountDropDownOpen: !previous.discountDropDownOpen
        }))
    }

    typeToggle() {
        this.setState(previous => ({
            typeDropDownOpen: !previous.typeDropDownOpen
        }))
    }

    statusToggle() {
        this.setState(previous => ({
            statusDropDownOpen: !previous.statusDropDownOpen
        }))
    }

    createDiscount(discountType) {
        RouteUtils.redirectWithoutReload(this.props, NAV_PATH.discounts.DISCOUNTS_CREATE + '/' + discountType);
    }

    selectStatus(status) {
        this.setState({statusSelect: status, currentPage: 1}, () => {
            this.fetchData(1, this.SIZE_PER_PAGE)
        })
    }

    selectType(type) {
        this.setState({typeSelect: type, currentPage: 1}, () => {
            this.fetchData(1, this.SIZE_PER_PAGE)
        })
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        });
        this.fetchData(pageIndex, this.SIZE_PER_PAGE);
    }

    fetchData(page, size) {
        BCOrderService.getDiscounts({
            storeId: CredentialUtils.getStoreId(),
            discountName: this.state.searchKeyword,
            type: this.state.typeSelect.value,
            status: this.state.statusSelect.value,
            sort: "lastModifiedDate,desc",
            page: page - 1, size: size
        }).then(res => {
            const totalItem = parseInt(res.headers['x-total-count']);
            this.setState({
                data: res.data,
                totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                isFetching: false,
                totalItem: totalItem
            })
        })
    }

    openConfirm(e, data) {
        e.stopPropagation();
        e.preventDefault()
        let item = data;
        this.refConfirmModalChildren.openModal({
            messages: <GSTrans t={"component.discount.modal.end.early.hint"}>a<b>a</b></GSTrans>,
            okCallback: () => {
                this.endEarly(item);
            }
        })
    }

    handleDuplicate(e, data) {
        e.stopPropagation();
        e.preventDefault()
        BCOrderService.duplicateDiscountCode(data.id)
            .then(() => {
                this.fetchData(this.state.currentPage, this.SIZE_PER_PAGE);
                GSToast.success("page.promotion.discount.clone.success",true)
            })
            .catch(e => {
                GSToast.commonError()
            })

    }

    openDeleteModal(e, data) {
        e.stopPropagation();
        e.preventDefault();
        let item = data;
        this.refConfirmModalChildren.openModal({
            messages: i18next.t("component.discount.modal.remove.hint"),
            okCallback: () => {
                this.removeDiscount(item.discountCampaignId);
            }
        })
    }

    endEarly(data) {
        let discount = data;
        BCOrderService.endEarly(data.id, CredentialUtils.getStoreId()).then(res => {
            if (res === "Success") {
                let data = this.state.data.map(ite => {
                    if (ite.discounts[0].id === discount.id) {
                        ite.discounts[0].status = DISCOUNT_STATUS.EXPIRED;
                    }
                    return ite;
                });
                this.setState({data: data});
            } else {

            }
        })
    }

    removeDiscount(discountCampaignId) {
        BCOrderService.removeDiscount(discountCampaignId).then(res => {
            if (res.status === 200) {
                this.setState({currentPage: 1}, () => this.fetchData(1, this.SIZE_PER_PAGE))
            }
        })
    }

    renderStatus(data) {
        let status = data.status;
        switch (status) {
            case DISCOUNT_STATUS.IN_PROGRESS:
                return <GSStatusTag
                    tagStyle={GSStatusTag.STYLE.SUCCESS}>{i18next.t("component.discount.tbl.status.inprogress")}</GSStatusTag>
            case DISCOUNT_STATUS.EXPIRED:
                return <GSStatusTag
                    tagStyle={GSStatusTag.STYLE.SECONDARY}>{i18next.t("component.discount.tbl.status.expired")}</GSStatusTag>
            case DISCOUNT_STATUS.SCHEDULED:
                return <GSStatusTag
                    tagStyle={GSStatusTag.STYLE.WARNING}>{i18next.t("component.discount.tbl.status.scheduled")}</GSStatusTag>
        }
    }

    renderActions(data) {
        let status = data.discounts[0].status;
        switch (status) {
            case DISCOUNT_STATUS.IN_PROGRESS:
                return (
                    <div className="gs-table-body-item action">
                        <div className='content'>
                            <GSComponentTooltip onClick={(e) => this.openConfirm(e, data.discounts[0])}
                                                html={<GSTrans t="component.discount.btn.end"/>}
                                                placement={GSComponentTooltipPlacement.TOP}>
                                <i className="icon-stop mr-2"></i>
                            </GSComponentTooltip>

                            <GSComponentTooltip onClick={(e) => this.handleDuplicate(e, data)}
                                                html={<GSTrans t="page.promotion.discount.clone"/>}
                                                placement={GSComponentTooltipPlacement.TOP}>
                                <i className="gs-action-button" title="Clone" width="20px" style={{
                                    backgroundImage: "url(/assets/images/icon-duplicate.svg)",
                                    marginLeft: "0px",
                                    width: "20px"
                                }}/>
                            </GSComponentTooltip>
                        </div>

                    </div>
                );
            case DISCOUNT_STATUS.EXPIRED:
                return (
                    <div className="gs-table-body-item action">
                        <div className='content'>
                            <GSComponentTooltip onClick={(e) => this.handleDuplicate(e, data)}
                                                html={<GSTrans t="page.promotion.discount.clone"/>}
                                                placement={GSComponentTooltipPlacement.TOP}>
                                <i className="gs-action-button" title="Clone" width="20px" style={{
                                    backgroundImage: "url(/assets/images/icon-duplicate.svg)",
                                    marginLeft: "0px",
                                    width: "20px"
                                }}/>
                            </GSComponentTooltip>
                        </div>
                    </div>
                );
            case DISCOUNT_STATUS.SCHEDULED:
                return (
                    <div className="gs-table-body-item action">
                        <div className='content'>
                            <i className="icon-edit" onClick={(e) => this.redirectToEdit(e, data.discounts[0])}></i>
                            <i className="icon-delete mr-2" onClick={(e) => this.openDeleteModal(e, data.discounts[0])}></i>
                            <GSComponentTooltip onClick={(e) => this.handleDuplicate(e, data)}
                                                html={<GSTrans t="page.promotion.discount.clone"/>}
                                                placement={GSComponentTooltipPlacement.TOP}>
                                <i className="gs-action-button" title="Clone" width="20px" style={{
                                    backgroundImage: "url(/assets/images/icon-duplicate.svg)",
                                    marginLeft: "0px",
                                    width: "20px"
                                }}/>
                            </GSComponentTooltip>
                        </div>
                    </div>
                );
        }
    }

    onInputSearch(event) {
        const keyword = event.currentTarget.value
        if (this.stoSearch) clearTimeout(this.stoSearch)
        this.stoSearch = setTimeout(() => {
            this.setState({
                isSearching: true,
                searchKeyword: keyword.trim()
            }, () => {
                this.fetchData(1, this.SIZE_PER_PAGE);
            })
        }, this.ON_INPUT_DELAY)
    }

    redirectToviewDetail(e, dataRow) {
        e.preventDefault();
        e.stopPropagation();
        const data = {data: dataRow};
        RouteUtils.linkToWithObject(this.props, NAV_PATH.discounts.DISCOUNTS_DETAIL + `/${dataRow.type}/` + dataRow.discountCampaignId, data);
    }

    redirectToEdit(e, data) {
        e.preventDefault();
        e.stopPropagation();
        RouteUtils.linkTo(this.props, NAV_PATH.discounts.DISCOUNTS_EDIT + `/${data.type}/` + data.discountCampaignId);
    }

    renderLastSyncDate(date) {
        return moment(date).format('DD-MM-YYYY');
    }

    render() {
        return (
            <GSContentContainer className="discount">
                <GSContentHeader className="discount-header"
                                 title={
                                     <GSContentHeaderTitleWithExtraTag
                                         title={i18next.t("component.navigation.promotion")}
                                         // extra={this.state.totalItem}
                                     />
                                 }
                >

                    <div className="d-flex">
                        {/*PROMOTION*/}
                        <GSDropDownButton button={
                            ({onClick}) => (
                                <GSButton success
                                          dropdownIcon
                                          onClick={onClick}
                                >
                                    <GSTrans t="page.discount.list.btn.createPromotion"/>
                                </GSButton>)
                        }>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0314]}>

                                <GSDropdownItem onClick={() => this.createDiscount(DISCOUNT_TYPES.PROMOTION_PRODUCT)}>
                                    <img width={20} className="mr-2" src="/assets/images/icon-coupons.svg"
                                         alt="product"/>
                                    <GSTrans t={'page.discount.list.btn.productDiscountCode'}/>
                                </GSDropdownItem>
                            </PrivateComponent>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0315]}>

                                <GSDropdownItem onClick={() => this.createDiscount(DISCOUNT_TYPES.PROMOTION_SERVICE)}>
                                    <img width={20} className="mr-2" src="/assets/images/icons8-service-50.svg"
                                         alt="service"/>
                                    <GSTrans t={'page.discount.list.btn.serviceDiscountCode'}/>
                                </GSDropdownItem>
                            </PrivateComponent>
                        </GSDropDownButton>

                        {/*WHOLESALE*/}
                        <GSDropDownButton
                            className="second-button-group"
                            button={
                                ({onClick}) => (
                                    <GSButton success
                                              dropdownIcon
                                              onClick={onClick}
                                    >
                                        <GSTrans t="page.discount.list.btn.wholeSalePricing"/>
                                    </GSButton>)
                            }>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0334]}>
                                <GSDropdownItem onClick={() => this.createDiscount(DISCOUNT_TYPES.WHOLESALE_PRODUCT)}>
                                    <img width={20} className="mr-2" src="/assets/images/icon-coupons.svg"
                                         alt="product"/>
                                    <GSTrans t={'page.discount.list.btn.productWholesalePricing'}/>
                                </GSDropdownItem>
                            </PrivateComponent>
                            <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0323]}>
                                <GSDropdownItem onClick={() => this.createDiscount(DISCOUNT_TYPES.WHOLESALE_SERVICE)}>
                                    <img width={20} className="mr-2" src="/assets/images/icons8-service-50.svg"
                                         alt="service"/>
                                    <GSTrans t={'page.discount.list.btn.serviceWholesalePricing'}/>
                                </GSDropdownItem>
                            </PrivateComponent>

                        </GSDropDownButton>
                    </div>


                </GSContentHeader>

                <GSContentBody className="discount-content-body" size={GSContentBody.size.MAX} centerChildren>
                    <GSWidget>
                        <GSWidgetContent>
                            {this.state.isFetching && <LoadingScreen/>}
                            <section className="top-search">
                            <span className="search gs-search-box__wrapper">
                                        <UikInput
                                            className="search-input"
                                            icon={(
                                                <FontAwesomeIcon icon={"search"}/>
                                            )}
                                            iconPosition="left"
                                            placeholder={i18next.t("component.discount.input.placeholder.search")}
                                            onChange={this.onInputSearch}
                                        />
                                {/* { this.state.isSearching &&
                                        <div className="spinner-border text-secondary" role="status">
                                        </div>} */}
                            </span>
                                <section className="group-combobox">
                                    <Dropdown isOpen={this.state.typeDropDownOpen} toggle={this.typeToggle}>
                                        <DropdownToggle className="gs-button" caret>
                                            <span>{this.state.typeSelect.name}</span>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {
                                                this.state.types.map((item, index) => {
                                                    return (
                                                        <DropdownItem key={item.id}
                                                                      onClick={() => this.selectType(item)}>
                                                            <span>{item.name}</span>
                                                        </DropdownItem>
                                                    )
                                                })
                                            }
                                        </DropdownMenu>
                                    </Dropdown>
                                    <Dropdown isOpen={this.state.statusDropDownOpen} toggle={this.statusToggle}>
                                        <DropdownToggle className="gs-button" caret>
                                            <span>{this.state.statusSelect.name}</span>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {
                                                this.state.status.map((item, index) => {
                                                    return (
                                                        <DropdownItem key={item.id}
                                                                      onClick={() => this.selectStatus(item)}>
                                                            <span>{item.name}</span>
                                                        </DropdownItem>
                                                    )
                                                })
                                            }
                                        </DropdownMenu>
                                    </Dropdown>
                                </section>
                            </section>
                            <PagingTable
                                headers={this.tableConfig.headerList}
                                totalPage={this.state.totalPage}
                                maxShowedPage={10}
                                currentPage={this.state.currentPage}
                                onChangePage={this.onChangeListPage}
                                totalItems={this.state.data.length}
                                hidePagingEmpty>
                                {this.state.data.map((dataRow, index) => {
                                    return (
                                        <section key={index + "_" + dataRow.id}
                                                 className="gs-table-body-items cursor--pointer gsa-hover--gray"
                                                 onClick={(e, data) => {
                                                     this.redirectToviewDetail(e, dataRow.discounts[0])
                                                 }}>
                                            <div
                                                className={`gs-table-body-item` + ` icon ` + dataRow.discounts[0].status.toLowerCase()}>
                                                <span className="discount-name">{dataRow.name}</span>
                                            </div>
                                            <div className="gs-table-body-item type">
                                            <span>
                                                <GSTrans
                                                    t={`page.discount.list.type.${dataRow.discounts[0].type.toLowerCase()}${dataRow.discounts[0].enabledRewards === true ? '.rewards' : ''}`}/>
                                            </span>
                                            </div>
                                            <div className="gs-table-body-item active-date">
                                                <span>{this.renderLastSyncDate(dataRow.discounts[0].activeDate)}</span>
                                                <span>{` - ` + this.renderLastSyncDate(dataRow.discounts[0].expiredDate)}</span>
                                            </div>
                                            <div className="gs-table-body-item status">
                                                {this.renderStatus(dataRow.discounts[0])}
                                            </div>
                                            {this.renderActions(dataRow)}
                                        </section>
                                    )
                                })
                                }
                            </PagingTable>
                        </GSWidgetContent>
                        {this.state.data.length === 0 && (
                            <div className="empty">
                                <i className="icon-empty"></i><span>{i18next.t("component.discount.empty")}</span>
                            </div>
                        )}
                    </GSWidget>
                    <ConfirmModal ref={(el) => {
                        this.refConfirmModalChildren = el
                    }}></ConfirmModal>
                </GSContentBody>
            </GSContentContainer>
        )
    }
}

export default Discount;
