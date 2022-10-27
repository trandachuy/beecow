/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Long Phan<email: long.phan@mediastep.com>
 */

import React, {Component} from 'react';
import "./Menu.sass";
import {RouteUtils} from "../../../utils/route";
import i18next from "../../../config/i18n";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../components/shared/form/GSWidget/GSWidgetContent";
import Constants from "../../../config/Constant";
import menuService from "../../../services/MenuService";
import menuItemService from "../../../services/MenuItemService";
import {CredentialUtils} from "../../../utils/credential";
import GSButton from "../../../components/shared/GSButton/GSButton";
import {Trans} from "react-i18next";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import AlertModal, {AlertModalType} from "../../../components/shared/AlertModal/AlertModal";
import PagingTable from '../../../components/shared/table/PagingTable/PagingTable';

class Menu extends Component {

    SIZE_PER_PAGE = 20;

    constructor(props) {
        super(props);
        this.isLoading = false;
        this.state = {
            isLoading: false,
            storeId: CredentialUtils.getStoreId(),
            menu: [],
            currentPage: 1,
            totalPage: 1,
            totalItem: 0,
            isFetching: false

        }
        this.tableConfig = {
            headerList: [
                i18next.t("tbl.th.menu.title"),
                i18next.t("tbl.th.menu.items"),
                i18next.t("tbl.th.menu.action")
            ]
        };
        this.getMenuByBcStoreId = this.getMenuByBcStoreId.bind(this);
        this.createDefaultMenu = this.createDefaultMenu.bind(this);
        this.reduceArray = this.reduceArray.bind(this);
        this.addNewMenu = this.addNewMenu.bind(this);
        this.openAlertModal = this.openAlertModal.bind(this);
        this.onChangeListPage = this.onChangeListPage.bind(this);
    }

    componentDidUpdate() {
        if (this.state.isLoading) {
            this.getMenuByBcStoreId(1, this.SIZE_PER_PAGE);
            this.setState({ isLoading: false });
        }
    }
    componentDidMount() {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
    }

    getMenuByBcStoreId(page, size) {
        menuService.getMenuByBcStoreId({ sellerId: parseInt(this.state.storeId), sort: "id,asc" , page: page - 1, size: size}).then(res => {
            if (res.data.length > 0) {
                const totalItem = parseInt(res.headers['x-total-count']);
                    this.setState({
                        menu: res.data,
                        totalPage: Math.ceil(totalItem / this.SIZE_PER_PAGE),
                        isFetching: false,
                        totalItem: totalItem
                    }, ()=>{
                        res.data.forEach((val, idx) => {
                        this.getMenuItemsByMenuId(val.id, idx);
                    })
                })
            }
            else {
                this.createDefaultMenu();
            }
        })
    }
    getMenuItemsByMenuId(menuId, idx) {
        let menuIdx = idx;
        menuItemService.getMenuItemsByMenuId(menuId).then(res => {
            const menu = this.state.menu;
            menu[menuIdx].menuItems = res;
            this.setState({ menu: menu });
        })
    }
    createDefaultMenu() {
        let data = {
            "menuDto": {
                "name": "Top Menu",
                "sellerId": this.state.storeId
            },
            "menuItemDto": []
        }
        menuService.createMenu(data).then(res => {
            const menu = this.state.menu.slice();
            menu.push(res.menuDto);
            this.setState({ menu: menu });
            this.getMenuItemsByMenuId(res.menuDto.id, 0);
        })
    }
    reduceArray(menuItems, menuId) {
        return menuItems.reduce((pre, current) => {
            if (current.parentId === menuId) {
                current.menuItems = this.reduceArray(menuItems, current.id);
                pre.push(current);
            }
            return pre;
        }, []);
    }
    joinMenuItemNames(dataRow) {
        let reduce = this.reduceArray(dataRow.menuItems, 0);
        if (dataRow.name === "Top Menu") {
            return "Home" + (reduce.length > 0 ? ", " + reduce.map(data => data.name).join(", ") : "")
        }
        return reduce.map(data => data.name).join(", ");

    }
    addNewMenu() {
        RouteUtils.linkTo(this.props, `/channel/storefront/menu/create`);
    }
    deleteMenuItem(event, menuItem) {
        event.stopPropagation();
        this.refConfirmModal.openModal({
            messages: i18next.t('component.menu.item.remove.hint', { menuItem: menuItem.name, total: menuItem.menuItems.length }),
            okCallback: () => {
                menuService.deleteById(menuItem.id).then(res => {
                    this.openAlertModal(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t('component.menu.item.edit.success'), menuItem.id);
                })
            }
        })
    }
    openAlertModal(type, message, menuId) {
        let self = this;
        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                let menu = this.state.menu.filter(ite => ite.id !== menuId);
                self.setState({ menu: menu });
            }
        });
    }

    onChangeListPage(pageIndex) {
        this.setState({
            currentPage: pageIndex
        });

        this.getMenuByBcStoreId(pageIndex, this.SIZE_PER_PAGE);
    }

    render() {
        return (
            <GSContentContainer className="menu-component" minWidthFitContent>
                <GSContentHeader className="custom-container__title gs-page-title" title={i18next.t("component.storefront.menu")}>
                    <GSButton success onClick={() => this.addNewMenu()}>
                        <Trans i18nKey="component.storefront.menu.btn.create" className="sr-only">
                            Create Menu
                        </Trans>
                    </GSButton>
                </GSContentHeader>
                
                <GSContentBody size={GSContentBody.size.LARGE}>
                    <GSWidgetContent>
                         <GSWidget>
                            <PagingTable
                                headers={this.tableConfig.headerList}
                                totalPage={this.state.totalPage}
                                maxShowedPage={10}
                                currentPage={this.state.currentPage}
                                onChangePage={this.onChangeListPage}
                                totalItems={this.state.menu.length}
                                hidePagingEmpty
                                >
                                {this.state.menu.map((dataRow, index) => {
                                    return (
                                        <section key={index + "_" + dataRow.id} className="gs-table-body-items cursor--pointer gsa-hover--gray" onClick={
                                            () =>
                                            {
                                                if(dataRow.actionList.includes("EDIT")){
                                                    RouteUtils.linkToWithObject(this.props, `/channel/storefront/menu/${dataRow.id}/edit`, dataRow)
                                                }else {
                                                    return;
                                                }
                                                
                                            }
                                            
                                            }>
                                            <div className="gs-table-body-item">
                                                <span class="ellipsis">{dataRow.name}</span>
                                            </div>
                                            <div className="gs-table-body-item">
                                                <span className="ellipsis">{dataRow.menuItems && (this.joinMenuItemNames(dataRow))}</span>
                                            </div>
                                            <div className="gs-table-body-item icon">
                                                {
                                                    dataRow.actionList && dataRow.actionList.includes("EDIT") &&
                                                    <i className="icon-edit"></i>
                                                }
                                                
                                                {
                                                    dataRow.actionList && dataRow.actionList.includes("REMOVE") &&
                                                    <i className="icon-delete" onClick={(e) => this.deleteMenuItem(e, dataRow)}></i>
                                                }
                                            </div>
                                        </section>
                                        )
                                    })
                                }
                                </PagingTable>
                            </GSWidget>
                    </GSWidgetContent>
                </GSContentBody>

                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.navigation.menus")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_CUSTOM_MENU} />
                </GSContentFooter>
                <ConfirmModal ref={(el) => { this.refConfirmModal = el }} />
                <AlertModal ref={(el) => { this.alertModal = el }} />
            </GSContentContainer>
        );
    }
}

export default Menu;
