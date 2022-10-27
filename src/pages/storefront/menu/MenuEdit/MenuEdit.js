/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/07/2019
 * Author: Long Phan<email: long.phan@mediastep.com>
 */

import React, {Component} from 'react';
import "./MenuEdit.sass";
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
import MenuItemModal from "../../../../components/shared/MenuModal/MenuItemModal";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import {CredentialUtils} from "../../../../utils/credential";
import menuService from "../../../../services/MenuService";
import menuItemService from "../../../../services/MenuItemService";
import AlertModal, {AlertModalType} from "../../../../components/shared/AlertModal/AlertModal";
import {AvField, AvForm} from 'availity-reactstrap-validation';
import {RouteUtils} from "../../../../utils/route";
import {FormValidate} from "../../../../config/form-validate";
import MenuTranslateModal from "../MenuTranslateModal/MenuTranslateModal";
import GSButton from "../../../../components/shared/GSButton/GSButton";

const TOP_MENU = "Top Menu";

class MenuEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storeId: CredentialUtils.getStoreId(),
            menuId: props.match.params.itemId,
            menu: props.location.state ? props.location.state : {},
            menuItems: props.location.state ? props.location.state.menuItems : [],
            menuItemAsTree: props.location.state ? this.reduceArray(props.location.state.menuItems, 0): [],
            onRedirect: true,
            languagePack: {},
            isSaving: false
        }
        this.menuName = props.location.state.name || undefined;
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
        this.getMenuById = this.getMenuById.bind(this);
        this.getMenuItemsByMenuId = this.getMenuItemsByMenuId.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this)
        this.onDragOver = this.onDragOver.bind(this)
        this.onDrop = this.onDrop.bind(this)
        this.onDragStart = this.onDragStart.bind(this)
        this.isSelf = this.isSelf.bind(this);
        this.isSibling = this.isSibling.bind(this);
        this.direction = this.direction.bind(this);
        this.expandHeight = this.expandHeight.bind(this);
        this.editMenuItem = this.editMenuItem.bind(this);
        this.deleteMenuItem = this.deleteMenuItem.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.hasThirdLevel = this.hasThirdLevel.bind(this);
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
        this.isReadOnly = this.isReadOnly.bind(this);
        this.moveState = this.moveState.bind(this);
        this.onLanguageModalSubmit = this.onLanguageModalSubmit.bind(this);
    }
    componentDidMount() {
        if (this.props.history.action === "POP") {
            this.getMenuById();
            this.getMenuItemsByMenuId();
        }
    }

    getMenuById() {
        menuService.getMenuById(this.state.menuId).then(res => {
            this.menuName = res.name;
            this.setState({ menu: res });
        })
    }

    getMenuItemsByMenuId() {
        menuItemService.getMenuItemsByMenuId(this.state.menuId).then(res => {
            let menu = this.reduceArray(res, 0);
            this.setState({ 
                menuItems: res,
                menuItemAsTree:  menu,
                onRedirect: true});
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
  
    onDragStart (event){
        this.dragEle = event.currentTarget;
        this.clientXDrag = event.pageX;
        console.log(" --- onDrag Start ---- ", event.currentTarget.offsetLeft, event.currentTarget);
    }
    onDragEnd (event){
        console.log(" --- onDrag END ---- ", event.currentTarget.offsetLeft, event.currentTarget);
    }

    onDragOver(event){
        event.preventDefault();
    }

    onDrop (event){
        event.preventDefault();
        event.stopPropagation();
        let dropEle = event.currentTarget;
        if(this.isSelf(this.dragEle, dropEle)){
            let parentNode = this.dragEle.parentElement;
            if(parentNode.className.includes('drag-item')){
                let direction = this.direction(event.pageX, dropEle);
                if("FORWARD" === direction){
                    parentNode.insertAdjacentElement("beforeend", this.dragEle)
                }else{
                    parentNode.insertAdjacentElement("afterend", this.dragEle)
                }
            }
            if(parentNode.className.includes('menu-item-body')){
                let direction = this.direction(event.pageX, dropEle);
                if("FORWARD" === direction){
                    dropEle.insertAdjacentElement("beforeend", this.dragEle)
                }else{
                    dropEle.insertAdjacentElement("afterend", this.dragEle)
                }
            }
        }else{
            if(!this.canAdd(this.dragEle, dropEle)){
                return;
            }
            if(this.isSameXCooridate(this.dragEle, dropEle)){
                if(this.isSibling(this.dragEle, dropEle)){
                    let direction = this.direction(event.pageX, dropEle);
                    if("FORWARD" === direction){
                        dropEle.insertAdjacentElement("beforeend", this.dragEle)
                    }else{
                        dropEle.insertAdjacentElement("afterend", this.dragEle)
                    }
                }else{
                    dropEle.insertAdjacentElement("afterend", this.dragEle)
                }
            }else{
                dropEle.insertAdjacentElement("afterend", this.dragEle)
            }
        }
    }

    hasThirdLevel(elements){
        let size = elements.length;
        for (let index = 0; index < size; index++) {
            const element = elements[index];
            if(element.getElementsByClassName('drag-item')){
                return this.hasThirdLevel(element.childNodes);
            }else{
                return false;
            }
        }
    }
    canAdd(dragEle, dropEle){
        let dragLvl = this.countTotalLvl(dragEle, []);
        let dropLvl =  this.countLvlToRoot(dropEle, 0);
        if(dragLvl >= 3 || dropLvl >= 3){
            return false;
        }else if(dragLvl + dropLvl >= 3){
            return false;
        }
        else{
            return true;
        }
    }
    countTotalLvl(ele, ids){
       let nodes = [ele];
       let size = nodes.length;
        let lvl = 0;
       while(nodes.length > 0){
           const node = nodes.shift();
           const childNodes= node.childNodes;
           for(let i = 0 ; i < node.childNodes.length; i++){
               let childNode = childNodes[i];
               if(childNode.className.includes('drag-item')){
                   ids.push(parseInt(childNode.attributes['data-id'].value));
                   nodes.push(childNode);
               }
           }
           if(size === 0){
                lvl++;
                size = nodes.length;
           }
           size --;
       }
       return lvl;
    }
    countLvlToRoot(ele, lvl){
        let parentNode = ele.parentElement;
        if(parentNode.className.includes('menu-item-body')){
            return lvl;
        }else{
            lvl++;
            return this.countLvlToRoot(ele.parentElement, lvl);
        }
    }
    expandHeight(dropEle, dragEle){
        dropEle.style.height = dropEle.offsetHeight + dragEle.offsetHeight + "px";
    }
    isSameXCooridate(dragEle, dropEle){
        return dragEle.offsetLeft === dropEle.offsetLeft;
    }
    isSibling(dragEle, dropEle){
        let dragParent = dragEle.parentElement;
        let dropParent = dropEle.parentElement;
        if(dragParent.className.includes('menu-item-body')){
            return true;
        }
        if(dragParent.attributes['data-id'].value === dropParent.attributes['data-id'].value){
            return true;
        }else{
            return false;
        }
    }
    isSelf(dragEle, dropEle){
        if(dragEle.attributes['data-id'].value === dropEle.attributes['data-id'].value){
            return true;
        }else{
            return false;
        }
    }
    direction(dropClientX, dropEle){
        if(dropClientX - (dropEle.getBoundingClientRect().left + window.scrollX) > 50){
            return "FORWARD";
        }else{
            return "BACKWARD";
        }
    }

    hasParent(dragEle){
        let parentNode = dragEle.parentElement;
        if(parentNode.className.includes('menu-item-body')){
            return dragEle;
        }
        return false;
    }
   
    editMenuItem(menuItem){
        this.refMenuItemModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            storeId: this.state.storeId,
            currentMenuItem: menuItem,
            modeEdit: true,
            menuItems: this.state.menuItemAsTree,
            parentMenuItem: this.findMenu(this.state.menuItemAsTree, menuItem.parentId),
            okCallback: () => {
                this.getMenuItemsByMenuId(this.state.menuId);
            }
        })
    }
    addMenuItemModal() {
        this.refMenuItemModal.openModal({
            messages: i18next.t('component.product.addNew.cancelHint'),
            storeId: this.state.storeId,
            menuId: this.state.menuId,
            modeEdit: false,
            menuItems: this.state.menuItemAsTree,
            okCallback: () => {
                this.getMenuItemsByMenuId(this.state.menuId);
            }
        })
    }
    openAlertModal(type, message){
        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                this.getMenuItemsByMenuId(this.state.menuId);  
            }
        });
    }
    findMenu(menuItems, id){
        let menuItem;
        menuItems.some(item =>{
            if(item.id == id){
                menuItem = item;
                return true;
            }else{
                if(item.menuItems.length > 0){
                    menuItem = this.findMenu(item.menuItems, id);
                    if(menuItem){
                        return true;
                    }
                }
            }
        })
        return menuItem;
    }
    deleteMenuItem(menuItem){
        let ids = [];
        let currentTarget = document.querySelectorAll(`[data-id="${menuItem.id}"]`)[0];
        ids.push(menuItem.id)
        this.countTotalLvl(currentTarget, ids);
        let parentNode = currentTarget.parentElement;
        if(parentNode.className.includes('drag-item')){
          
            let parentId = parseInt(parentNode.attributes['data-id'].value);
            let parentMenuItem = this.findMenu(this.state.menuItemAsTree, parentId);
            if(parentMenuItem.menuItems.length < 2){
                parentMenuItem.hasChildren = false;
                menuItemService.updateMenuItem(parentMenuItem);
            }
        }
        this.refConfirmModal.openModal({
            messages: i18next.t('component.menu.item.remove.hint', {menuItem: menuItem.name, total: ids.length - 1}),
            okCallback: () => {
                menuItemService.deleteMenuItems({"sellerId": this.state.storeId, "ids": ids.join(',')}).then(res =>{
                    this.getMenuItemsByMenuId(menuItem.menuId);
                })
            }
        })
    }
    onSubmit(event, values){
        let menuItems = this.state.menuItems.slice();
        if(menuItems.length === 0){
            return;
        }
        this.setState({
            isSaving: true
        })
        let childNodes = document.getElementsByClassName('menu-item-body')[0].childNodes;
        let menuItem = [];
        this.getDataId(childNodes, 0, 0, 0, menuItem);
        
        menuItems = menuItem.map(ite => {
            let item = menuItems.find(item => ite.id === item.id);
            item.parentId = ite.parentId;
            item.level = ite.level;
            item.order = ite.order;
            return item;
        })
        if(values['name'] !== this.menuName){
            this.state.menu.name = values['name'];
            menuService.updateMenu(this.state.menu).then(res =>{
                this.menuName = res.name
            })
        }
        menuItemService.updateMenuItems(menuItems).then(async res => {



            this.setState({
                isSaving: false,
                languagePack: {}
            }, () => {
                this.openAlertModal(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t('component.menu.item.edit.success'));
            })
        })
    }
    
    getDataId(nodes, order, level, parentId, menuItems){
        const size = nodes.length;
        let innerOrder = Object.freeze(order);
        if(nodes.length > 0){
            for (let index = 0; index < size; index++) {
                const element = nodes[index];
                if(element.className.includes('drag-item')){
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

    moveState(offset, menuItem) {
        const tempTree = this.state.menuItemAsTree
        let parentId = menuItem.parentId
        let parentIdList = [];
        while (parentId !== 0) {
            parentIdList = [parentId, ...parentIdList]
            // find new parent
            const parent = this.state.menuItems.find(mItem => mItem.id === parentId)
            if (parent) {
                parentId = parent.parentId
            } else {
                break
            }
        }
        let menuList = tempTree
        let parent = tempTree
        for (const pId of parentIdList) {
            const fMenu = menuList.find(menu => menu.id === pId)
            if (fMenu) {
                parent = fMenu
                menuList = fMenu.menuItems
            }
        }

        // swap order
        const targetOrder = menuItem.order + offset
        if (targetOrder >= 0 && targetOrder < menuList.length) {
            let target = menuList.find(menuItem => menuItem.order === targetOrder)
            target.order = menuItem.order
            let current = menuList.find(menuItm => menuItm.id === menuItem.id)
            current.order = targetOrder
        }
        parent.menuItems = menuList

        this.setState({
            menuItemAsTree: tempTree
        })
    }

    moveDown(menuItem){
        this.moveState(1, menuItem)
        let ele = document.querySelectorAll(`[data-id="${menuItem.id}"]`)[0];
        let nextSibling = ele.nextElementSibling;
        if(nextSibling){
            nextSibling.insertAdjacentElement('afterend', ele);
            this.setState({onRedirect: false});
        }
    }
    moveTop(menuItem){
        this.moveState(-1, menuItem)
        let ele = document.querySelectorAll(`[data-id="${menuItem.id}"]`)[0];
        let previousElement = ele.previousElementSibling;
        if(previousElement && previousElement.className.includes('drag-item')){
            previousElement.insertAdjacentElement('beforebegin', ele);
            this.setState({onRedirect: false});
        }
    }

    onLanguageModalSubmit(languageData) {
        this.setState(state => ({
                languagePack: {
                    ...state.languagePack,
                    ...languageData
                }
            })
        )
    }

    renderClassLevel(level){
        return "item-detail level-" + level;
    }
 
    renderMenuItems(menuItem){
        menuItem.sort((pervious, current) => {
            let compa = 0;
            if(pervious.order > current.order)
                compa = 1;
            else if(pervious.order < current.order)
                compa = -1;
            return compa;
        });
        return (
            menuItem.length > 0 && (menuItem.map((item, index) => {
                return (
                <GSWidget data-name={item.name} data-id={item.id} key={item.id} className="item drag-item">
                    <div className={this.renderClassLevel(item.level)}>
                        <div className="item-info">
                            <div className="icon-expand-wrapper">
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
                            {
                                item.actionList && item.actionList.includes('EDIT') &&
                                <i className="icon-edit" onClick={() => this.editMenuItem(item)}></i>
                            }
                            {
                                item.actionList && item.actionList.includes('REMOVE') &&
                                <i className="icon-delete" onClick={() => this.deleteMenuItem(item)}></i>
                            }
                        </div>
                    </div>
                    {item.menuItems ?
                        this.renderMenuItems(item.menuItems)
                        : null
                    }
                    {/* <div className="switch-button">
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div> */}
                </GSWidget>
                )
            }))
        )
    }
    isReadOnly(menuName){
        return menuName === TOP_MENU;
    }
    render() {
        return (
            <GSContentContainer confirmWhenRedirect confirmWhen={!this.state.onRedirect} className="custom-container"
            isSaving={this.state.isSaving}>
                <AvForm onValidSubmit={this.onSubmit}>
                    <GSContentHeader className="menu-items-header"
                        title={i18next.t("component.storefront.menu.subTitle")}
                        subTitle={i18next.t("component.storefront.menu.add.menu")}>
                        <GSContentHeaderRightEl className="d-flex justify-content-end">
                            <MenuTranslateModal menuItemAsTree={this.state.menuItemAsTree}
                                                menuId={this.state.menuId}
                                                onSubmit={this.onLanguageModalSubmit}
                            />
                            <GSButton type="submit" success disabled={this.state.menuItemAsTree.length === 0}>
                                <Trans i18nKey="common.btn.save" className="sr-only">
                                    Save Button
                                </Trans>
                            </GSButton>
                            <GSButton marginLeft outline secondary onClick={() => RouteUtils.redirectWithoutReload(this.props, `/channel/storefront/menu`)}>
                                <Trans i18nKey="common.btn.cancel" className="sr-only">
                                    Cancel Button
                                </Trans>
                            </GSButton>
                        </GSContentHeaderRightEl>
                    </GSContentHeader>
                    <GSContentBody size={GSContentBody.size.LARGE}>
                        <GSWidgetContent className="menu-title">
                            <GSWidget>
                                <span className="uik-content-title__wrapper"><Trans i18nKey="tbl.th.menu.title"></Trans></span>
                                <AvField name="name" value={this.state.menu.name}
                                    readOnly={this.isReadOnly(this.state.menu.name)}
                                    validate={{
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
                                <GSWidget className="item">
                                        {
                                            this.state.menu.name === TOP_MENU && (
                                                <div className="item-detail">
                                                    <div className="item-info">
                                                        <div className="icon-expand-wrapper">
                                                            <i className="icon-expand"></i>
                                                        </div>
                                                        <div className="dragdrop">
                                                            <i className="icon-dragdrop"></i>
                                                            <span className="uik-content-title__wrapper">Home</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </GSWidget>
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
                <MenuItemModal ref={(el) => { this.refMenuItemModal = el }} />
            </GSContentContainer>
        );
    }
}

export default MenuEdit;
