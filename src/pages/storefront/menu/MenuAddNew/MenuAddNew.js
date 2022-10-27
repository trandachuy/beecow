/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Long Phan<email: long.phan@mediastep.com>
 */

import React, {Component} from 'react';
import "./../MenuEdit/MenuEdit.sass";
import {UikButton} from '../../../../@uik';
import Label from "reactstrap/es/Label";
import {Trans} from 'react-i18next';
import i18next from "../../../../config/i18n";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentHeader from "../../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderRightEl
    from "../../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSContentFooter from "../../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import Constants from "../../../../config/Constant";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import MenuAddModal from "../../../../components/shared/MenuModal/MenuAddModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {CredentialUtils} from "../../../../utils/credential";
import menuService from "../../../../services/MenuService";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {RouteUtils} from "../../../../utils/route";
import {FormValidate} from "../../../../config/form-validate";

class MenuAddNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storeId: CredentialUtils.getStoreId(),
            menu: {},
            menuItems: [],
            menuItemAsTree: [],
            onRedirect: true
        }

        this.dropId = 0;
        this.clientXDrag = 0;
        this.tableConfig = {
            headerList: [
                i18next.t("tbl.th.menu.title"),
                i18next.t("tbl.th.menu.items"),
                i18next.t("tbl.th.menu.action")
            ]
        };
        this.addMenuItemModal = this.addMenuItemModal.bind(this);

        this.editMenuItem = this.editMenuItem.bind(this);
        this.deleteMenuItem = this.deleteMenuItem.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.getDataId = this.getDataId.bind(this);
        this.countTotalLvl = this.countTotalLvl.bind(this);
        this.countLvlToRoot = this.countLvlToRoot.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderMenuItems = this.renderMenuItems.bind(this);
        this.reduceArray = this.reduceArray.bind(this);
        this.findMenu = this.findMenu.bind(this);
        this.renderClassLevel = this.renderClassLevel.bind(this);
        this.moveTop = this.moveTop.bind(this);
        this.moveDown = this.moveDown.bind(this);
        this.openAlertModal = this.openAlertModal.bind(this);
        this.setMenuItems = this.setMenuItems.bind(this);
    }
    componentDidMount() {
        let menu = this.reduceArray(this.state.menuItems, 0);
        this.setState({ menuItemAsTree: menu })
    }

    setMenuItems(menuItems) {
        this.setState({
            menuItems: menuItems,
            menuItemAsTree: this.reduceArray(menuItems, 0),
            onRedirect: false
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

    canAdd(dragEle, dropEle) {
        let dragLvl = this.countTotalLvl(dragEle, []);
        let dropLvl = this.countLvlToRoot(dropEle, 0);
        if (dragLvl >= 3 || dropLvl >= 3) return false;
        else if (dragLvl + dropLvl >= 3) return false;
        else return true;

    }
    countTotalLvl(ele, ids) {
        let nodes = [ele];
        let size = nodes.length;
        let lvl = 0;
        while (nodes.length > 0) {
            const node = nodes.shift();
            const childNodes = node.childNodes;
            for (let i = 0; i < node.childNodes.length; i++) {
                let childNode = childNodes[i];
                if (childNode.className.includes('drag-item')) {
                    ids.add(parseInt(childNode.attributes['data-id'].value));
                    nodes.push(childNode);
                }
            }
            if (size === 0) {
                lvl++;
                size = nodes.length;
            }
            size--;
        }
        return lvl;
    }
    countLvlToRoot(ele, lvl) {
        let parentNode = ele.parentElement;
        if (parentNode.className.includes('menu-item-body')) {
            return lvl;
        } else {
            lvl++;
            return this.countLvlToRoot(ele.parentElement, lvl);
        }
    }

    editMenuItem(menuItem) {
        this.refMenuAddModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            storeId: this.state.storeId,
            currentMenuItem: menuItem,
            modeEdit: true,
            menuItems: this.state.menuItemAsTree,
            parentMenuItem: this.findMenu(this.state.menuItemAsTree, menuItem.parentId),
            okCallback: (res) => {
                let ids = new Set(res.map(ite => ite.id));
                let menuItems = [...this.state.menuItems.filter(ite => !ids.has(ite.id)), ...res];
                this.setMenuItems(menuItems);
            }
        })
    }
    addMenuItemModal() {
        this.refMenuAddModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            storeId: this.state.storeId,
            modeEdit: false,
            menuItems: this.state.menuItemAsTree,
            okCallback: (res) => {
                let ids = new Set(res.map(ite => ite.id));
                let menuItems = [...this.state.menuItems.filter(ite => !ids.has(ite.id)), ...res];
                this.setMenuItems(menuItems);
            }
        })
    }
    openAlertModal(type, message) {
        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                if(type === AlertModalType.ALERT_TYPE_SUCCESS){
                    RouteUtils.linkTo(this.props, `/channel/storefront/menu`)
                }
            }
        });
    }
    findMenu(menuItems, id) {
        let menuItem;
        menuItems.some(item => {
            if (item.id == id) {
                menuItem = item;
                return true;
            } else {
                if (item.menuItems.length > 0) {
                    menuItem = this.findMenu(item.menuItems, id);
                    if (menuItem) {
                        return true;
                    }
                }
            }
        })
        return menuItem;
    }
    deleteMenuItem(menuItem) {
        let self = this;
        let ids = new Set();
        let menuItems = [menuItem];
        let currentTarget = document.querySelectorAll(`[data-id="${menuItem.id}"]`)[0];
        ids.add(menuItem.id)
        this.countTotalLvl(currentTarget, ids);
        let parentNode = currentTarget.parentElement;
        if (parentNode.className.includes('drag-item')) {
            let parentId = parseInt(parentNode.attributes['data-id'].value);
            let parentMenuItem = this.findMenu(this.state.menuItemAsTree, parentId);
            if (parentMenuItem.menuItems.length < 2) {
                parentMenuItem.hasChildren = false;
                menuItems.push(parentMenuItem);
            } else {
                let order = 0;
                menuItems = parentMenuItem.menuItems.filter((ite) => {
                    if (ite.id !== menuItem.id) {
                        ite.order = order;
                        order++;
                        return ite;
                    }
                });
            }
        }

        this.refConfirmModal.openModal({
            messages: i18next.t('component.menu.item.remove.hint', { menuItem: menuItem.name, total: ids.size - 1 }),
            okCallback: () => {
                menuItems = this.state.menuItems.filter(ite => {
                    let idx = menuItems.indexOf(ite);
                    if (idx > 0) {//Update other items
                        return menuItems[idx];
                    }
                    if (!ids.has(ite.id)) { //delete items
                        return ite;
                    }
                });
                self.setMenuItems(menuItems);
            }
        })
    }
    onSubmit(event, values) {
        if (this.state.menuItems.length <= 0) {
            return this.openAlertModal(AlertModalType.ALERT_TYPE_WARNING, i18next.t('component.menu.item.empty.warn'));
        }
        let childNodes = document.getElementsByClassName('menu-item-body')[0].childNodes;
        let menuItem = [];
        this.getDataId(childNodes, 0, 0, 0, menuItem);
        let menuItems = this.state.menuItems.slice();
        menuItems = menuItem.map(ite => {
            let item = menuItems.find(item => ite.id === item.id);
            item.parentId = ite.parentId;
            item.level = ite.level;
            item.order = ite.order;
            return item;
        })
        let menuVm = {
            "menuDto": {
                "name": values['name'],
                "sellerId": this.state.storeId,
                "actionList": "EDIT,REMOVE"
            },
            "menuItemDto": menuItems
        }
        menuService.createMenu(menuVm).then(res => {
            this.setState({ onRedirect: true }, 
                () => this.openAlertModal(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t('component.menu.item.edit.success')));
        })
    }

    getDataId(nodes, order, level, parentId, menuItems) {
        const size = nodes.length;
        let innerOrder = Object.freeze(order);
        if (nodes.length > 0) {
            for (let index = 0; index < size; index++) {
                const element = nodes[index];
                if (element.className.includes('drag-item')) {
                    let item = {
                        id: parseInt(element.attributes['data-id'].value),
                        order: innerOrder,
                        level: level,
                        parentId: parseInt(parentId),
                        name: element.attributes['data-name'].value
                    }
                    menuItems.push(item);
                    const childNodes = element.childNodes;
                    this.getDataId(childNodes, 0, level + 1, item.id, menuItems);
                    innerOrder = innerOrder + 1;
                }
            }
        }
    }
    moveDown(menuItem) {
        let ele = document.querySelectorAll(`[data-id="${menuItem.id}"]`)[0];
        let nextSibling = ele.nextElementSibling;
        if (nextSibling) {
            nextSibling.insertAdjacentElement('afterend', ele);
            this.setState({ onRedirect: false });
        }
    }
    moveTop(menuItem) {
        let ele = document.querySelectorAll(`[data-id="${menuItem.id}"]`)[0];
        let previousElement = ele.previousElementSibling;
        if (previousElement && previousElement.className.includes('drag-item')) {
            previousElement.insertAdjacentElement('beforebegin', ele);
            this.setState({ onRedirect: false });
        }
    }
    renderClassLevel(level) {
        return "item-detail level-" + level;
    }

    renderMenuItems(menuItem) {
        menuItem.sort((pervious, current) => {
            let compa = 0;
            if (pervious.order > current.order)
                compa = 1;
            else if (pervious.order < current.order)
                compa = -1;
            return compa;
        });
        return (
            menuItem.length > 0 && (menuItem.map((item, index) => {
                return (
                    <GSWidget data-name={item.name} data-id={item.id} key={item.id} className="item drag-item">
                        <div className={this.renderClassLevel(item.level)}>
                            <div className="item-info">
                                <div className="icon-expand-wrapper add-menu">
                                    {
                                        item.menuItems.length > 0 ? <i className="icon-expand"></i> : <i className="icon-close"></i>
                                    }
                                </div>
                                <div className="dragdrop">
                                    <i className="icon-dragdrop"></i>
                                    <span className="uik-content-title__wrapper">{item.name}</span>
                                </div>
                            </div>
                            <div className="switch-button">
                                <div>
                                    <i className="icon-up" onClick={() => this.moveTop(item)}></i>
                                    <i className="icon-down" onClick={() => this.moveDown(item)}></i>
                                </div>
                                <i className="icon-edit" onClick={() => this.editMenuItem(item)}></i>
                                <i className="icon-delete" onClick={() => this.deleteMenuItem(item)}></i>
                            </div>
                        </div>
                        {item.menuItems ?
                            this.renderMenuItems(item.menuItems)
                            : null
                        }
                    </GSWidget>
                )
            }))
        )
    }
    render() {
        return (
            <GSContentContainer confirmWhenRedirect confirmWhen={!this.state.onRedirect} className="custom-container">
                <AvForm onValidSubmit={this.onSubmit}>
                    <GSContentHeader className="menu-items-header"
                        title={i18next.t("component.storefront.menu.subTitle")}
                        subTitle={i18next.t("component.storefront.menu.add.menu")}>
                        <GSContentHeaderRightEl>
                            <UikButton type="submit" success className="btn-save">
                                <Trans i18nKey="common.btn.save" className="sr-only">
                                    Save Button
                             </Trans>
                            </UikButton>
                            <UikButton className="btn-cancel" onClick={() => RouteUtils.linkTo(this.props, `/channel/storefront/menu`)}>
                                <Trans i18nKey="common.btn.cancel" className="sr-only">
                                    Cancel Button
                                </Trans>
                            </UikButton>
                        </GSContentHeaderRightEl>
                    </GSContentHeader>
                    <GSContentBody size={GSContentBody.size.LARGE}>
                        <GSWidgetContent className="menu-title">
                            <GSWidget>
                                <span className="uik-content-title__wrapper"><Trans i18nKey="tbl.th.menu.title"></Trans></span>
                                <AvField name="name" value={this.state.menuName} validate={{
                                    ...this.props.validate,
                                    ...FormValidate.required(),
                                    maxLength: { value: 150, errorMessage: i18next.t("common.validation.char.max.length", { x: 150 }) }
                                }}>
                                </AvField>
                            </GSWidget>
                        </GSWidgetContent>

                        <GSWidgetContent className="menu-item">
                            <GSWidget>
                                <h5><Trans i18nKey="tbl.th.menu.items"></Trans></h5>
                                <div className="add-menu-item widget-item cursor--pointer" onClick={() => this.addMenuItemModal()}>
                                    <i className="icon-add-circle"></i>
                                    <Label><Trans i18nKey="component.storefront.menu.add.menu.item"></Trans></Label>
                                </div>
                            </GSWidget>
                            <GSWidget className="menu-item-title">
                                <span className="uik-content-title__wrapper"><Trans i18nKey="component.storefront.menu.item.title"></Trans></span>
                                <span className="uik-content-title__wrapper widget-item"><Trans i18nKey="tbl.th.menu.action"></Trans></span>
                            </GSWidget>
                            <GSWidget className={this.state.menuItemAsTree.length > 0 ? "menu-item-body" : "menu-item-body empty"}>
                                {
                                    this.state.menuItemAsTree.length > 0
                                        ? this.renderMenuItems(this.state.menuItemAsTree)
                                        :
                                        <GSWidget className="item drag-item">
                                            <div className="item-empty">
                                                <i className="icon-empty"></i><span>{i18next.t("component.menu.item.empty")}</span>
                                            </div>
                                        </GSWidget>
                                }

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
                </AvForm>
                <MenuAddModal ref={(el) => { this.refMenuAddModal = el }} />
            </GSContentContainer>
        );
    }
}

export default MenuAddNew;
