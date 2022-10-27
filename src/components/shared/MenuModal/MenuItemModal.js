import React, {Component} from 'react';
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';
import i18next from "../../../config/i18n";
import _ from 'lodash';
import {AvField, AvForm} from 'availity-reactstrap-validation';
import GSWidget from "../form/GSWidget/GSWidget";
import "./MenuItemModal.sass";
import menuItemService from "../../../services/MenuItemService";
import {CollectionService} from "../../../services/CollectionService";
import pageService from "../../../services/PageService";
import GSFakeLink from "../GSFakeLink/GSFakeLink";
import GSTrans from "../GSTrans/GSTrans";
import {RouteUtils} from "../../../utils/route";
import AlertModal, {AlertModalType} from "../AlertModal/AlertModal";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import {LoadingStyle} from "../Loading/Loading";
import GSButton from "../GSButton/GSButton";
import {NAV_PATH} from '../../layout/navigation/Navigation';
import {FormValidate} from "../../../config/form-validate";
import storageService from "../../../services/storage";
import customPageService from "../../../services/CustomPageService";
import Constants from '../../../config/Constant';
import beehiveService from "../../../services/BeehiveService";
import {CredentialUtils} from "../../../utils/credential";

const MENU_ITEM_TYPE = {
    COLLECTION_PRODUCT : "COLLECTION_PRODUCT",
    COLLECTION_SERVICE : "COLLECTION_SERVICE",
    PAGE : "PAGE",
    LINK_EXTERNAL : "LINK_EXTERNAL",
    LINK_SYSTEM : "LINK_SYSTEM",
    ARTICLE : "ARTICLE",
    BLOG : "BLOG"
}

export default class MenuItemModal extends Component {

    constructor(props) {
        super(props);

        let lstLink = [
            {name: i18next.t("component.marketing.sales.pitch.PRODUCT_COLLECTION.title"), type: MENU_ITEM_TYPE.COLLECTION_PRODUCT},
            {name: i18next.t("component.marketing.sales.pitch.SERVICE_COLLECTION.title"), type: MENU_ITEM_TYPE.COLLECTION_SERVICE},
            {name: i18next.t("component.page.title"), type: MENU_ITEM_TYPE.PAGE}
        ]

        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        if(useNewThemeEngine){
            lstLink.push({name: i18next.t("component.storefront.link"), type: MENU_ITEM_TYPE.LINK_EXTERNAL});
            lstLink.push({name: i18next.t("page.storeFront.blog.nav"), type: MENU_ITEM_TYPE.BLOG});
            lstLink.push({name: i18next.t("page.storeFront.blog.article"), type: MENU_ITEM_TYPE.ARTICLE});
        }

        this.state = {
            modal: false,
            modalTitle: i18next.t('common.txt.confirm.modal.menu.item.title'),
            modalBtnOk: i18next.t('common.btn.save'),
            modalBtnCancel: i18next.t('common.btn.cancel'),
            classNameBtnOk: 'btn-success',
            classNameBtnCancel: 'btn btn-outline-secondary',
            data: [],
            urlLinksTypeDropDownOpen: false,
            urlLinksDropDownOpen: false,
            parentMenuItemDropDownOpen: false,
            urlLinks: lstLink,
            urlLinkSelected: {name: i18next.t("component.marketing.sales.pitch.PRODUCT_COLLECTION.title"), type : MENU_ITEM_TYPE.COLLECTION_PRODUCT},
            urlLinkTypeSelected: {},
            parentMenuItemSelected: {},
            selectedPageItem: {},
            menuName: undefined,
            menuId: 0,
            currentMenuItem: undefined,
            modeEdit: false,
            storeId: 0,
            urlLinkTypeError: undefined,
            menuItemError: undefined,
            order: -1,
            menuItems: [],
            isLoading: false,
            emptyDataError: ""
        };
        this.currentPage = 0;
        this.totalPage = 0;
        this.SIZE_PER_PAGE = 20;
        this.defaultParentMenuItem = {id: -1, name: i18next.t("component.storefront.menu.item.parent.link"), level: 0, order: -1 , menuItems:[]};
        this.cancelModal = this.cancelModal.bind(this);
        this.okModal = this.okModal.bind(this);
        this.collectionToggle = this.collectionToggle.bind(this);
        this.urlLinkToggle = this.urlLinkToggle.bind(this);
        this.onValidSubmit = this.onValidSubmit.bind(this);
        this.isBottom = this.isBottom.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.scrolled = false;
        this.getCollectionById = this.getCollectionById.bind(this);
        this.openAlertModal = this.openAlertModal.bind(this);
        this.renderMenuItems = this.renderMenuItems.bind(this);
        this.parentMenuItemToogle = this.parentMenuItemToogle.bind(this);
        this.selectParentMenuItem = this.selectParentMenuItem.bind(this);
        this.getMaxOrder = this.getMaxOrder.bind(this);
        this.findMenu = this.findMenu.bind(this);
        this.canAdd = this.canAdd.bind(this);
        this.countLvlToRoot = this.countLvlToRoot.bind(this);
        this.countTotalLvl = this.countTotalLvl.bind(this);
        this.findParentNode = this.findParentNode.bind(this);
        this.updateChildrenLvl = this.updateChildrenLvl.bind(this);
        this.editMenuItem = this.editMenuItem.bind(this);
        this.addMenuItem = this.addMenuItem.bind(this);
        this.getLinkValue = this.getLinkValue.bind(this);
        this.isPage = this.isPage.bind(this);
        this.isCollection = this.isCollection.bind(this);
        this.selectUrlLinkType = this.selectUrlLinkType.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
    }

    openModal(options) {
        options.parentMenuItemSelected = options.parentMenuItem ? options.parentMenuItem : this.defaultParentMenuItem;
        options.menuItems = [...[this.defaultParentMenuItem], ...options.menuItems]
        this.setState(_.extend({
            modal: true,
            menuName: options.currentMenuItem ? options.currentMenuItem.name : undefined,
            modalTitle: options.modeEdit ? i18next.t('common.txt.confirm.modal.menu.item.title.edit') : i18next.t('common.txt.confirm.modal.menu.item.title'),
            storeId: options.storeId,
        }, options));
        if(options.currentMenuItem){
            this.loadUrlLinksType(options.currentMenuItem);
        }else{
            this.getCollectionsByBcStoreId(options.storeId, this.currentPage, this.SIZE_PER_PAGE);
            this.setState({urlLinkSelected: this.state.urlLinks[0]})
        }
    }

    loadUrlLinksType(menuItem){
        let urlLinkDefault = {};

        if(menuItem.dataType === MENU_ITEM_TYPE.COLLECTION_SERVICE || menuItem.dataType === MENU_ITEM_TYPE.COLLECTION_PRODUCT){
            
            if(menuItem.dataType === MENU_ITEM_TYPE.COLLECTION_PRODUCT){
                urlLinkDefault = this.state.urlLinks[0];

            }else if(menuItem.dataType === MENU_ITEM_TYPE.COLLECTION_SERVICE){
                urlLinkDefault = this.state.urlLinks[1];
            }

            this.setState({urlLinkSelected: urlLinkDefault}, () => {
                // collection
                this.getCollectionsByBcStoreId(menuItem.sellerId, this.currentPage, this.SIZE_PER_PAGE);
                this.getCollectionById(menuItem.dataValue);
            });

            

        }else if(menuItem.dataType === MENU_ITEM_TYPE.PAGE){
            // page
            this.getPagesByBcStoreId(this.currentPage, this.SIZE_PER_PAGE);
            this.getPageById(menuItem.dataValue);
            urlLinkDefault = this.state.urlLinks[2];

        }else if(menuItem.dataType === MENU_ITEM_TYPE.LINK_EXTERNAL || menuItem.dataType === MENU_ITEM_TYPE.LINK_SYSTEM){
            // link
            this.getLinkValue(menuItem.dataValue);      
            urlLinkDefault = this.state.urlLinks[3];

        }else if(menuItem.dataType === MENU_ITEM_TYPE.BLOG){
            // blog
            this.getBlogByStore(this.currentPage, this.SIZE_PER_PAGE, menuItem);
            urlLinkDefault = this.state.urlLinks[4];

        }else if(menuItem.dataType === MENU_ITEM_TYPE.ARTICLE){
            // article
            this.getArticleByStore(this.currentPage, this.SIZE_PER_PAGE);
            this.getArticleDetail(menuItem.dataValue);      
            urlLinkDefault = this.state.urlLinks[5];
        }

        this.setState({urlLinkSelected: urlLinkDefault})
    }
    cancelModal() {
        this.resetStateProps(
            () => {
                if (this.state.cancelCallback) {
                    this.state.cancelCallback()
                }
            }
        )
    }

    okModal() {
        this.resetStateProps(
            () => {
                if (this.state.okCallback) {
                    this.state.okCallback()
                }
            }
        )
    }
    resetStateProps(callBack){
        this.currentPage = 0;
        this.totalPage = 0;
        this.setState({
            modal: false,
            urlLinkTypeSelected: {},
            urlLinkTypeError: undefined,
            menuItemError: undefined,
            parentMenuItemSelected: {},
            selectedPageItem: {},
            urlLinkSelected: {},
            data: [],
            menuItem: undefined
        }, callBack)
    }
    collectionToggle() {
        this.setState(prevState => ({
            urlLinksTypeDropDownOpen: !prevState.urlLinksTypeDropDownOpen
        }));
    }
    urlLinkToggle(){
        this.setState(prevState => ({
            urlLinksDropDownOpen: !prevState.urlLinksDropDownOpen
        }));
    }
    parentMenuItemToogle(){
        this.setState({parentMenuItemDropDownOpen: !this.state.parentMenuItemDropDownOpen});
    }

    selectUrlLinkType(data){
        this.setState({urlLinkTypeSelected : {name : data.name, value : data.id}, urlLinkTypeError: undefined});
    }

    onInputChange(event, value) {
        // for link input
        if(this.isLink()){
            // page
            this.setState({urlLinkTypeSelected : {name : value, value : value}, urlLinkTypeError: undefined});
        }
    }

    // select data type for menu item
    selectUrlLink(urlLink){
        // for collection and page select
        this.currentPage = 0;
        if(urlLink.type === MENU_ITEM_TYPE.COLLECTION_SERVICE || urlLink.type === MENU_ITEM_TYPE.COLLECTION_PRODUCT){
            // collection
            this.setState({urlLinkSelected : urlLink, urlLinkTypeSelected: {}, urlLinkTypeError: undefined}, 
                () => {this.getCollectionsByBcStoreId(this.state.storeId, this.currentPage, this.SIZE_PER_PAGE)});

        }else if(urlLink.type === MENU_ITEM_TYPE.PAGE){
            // page
            this.setState({urlLinkSelected : urlLink, urlLinkTypeSelected: {}, urlLinkTypeError: undefined}, 
                () => {this.getPagesByBcStoreId(this.currentPage, this.SIZE_PER_PAGE)});

        }else if(urlLink.type === MENU_ITEM_TYPE.LINK_EXTERNAL){
            // link
            this.setState({urlLinkSelected : urlLink, urlLinkTypeSelected: {}, urlLinkTypeError: undefined});

        }else if(urlLink.type === MENU_ITEM_TYPE.BLOG){
            // blog
            this.setState({urlLinkSelected : urlLink, urlLinkTypeSelected: {}, urlLinkTypeError: undefined},
                () => {this.getBlogByStore()});

        }else if(urlLink.type === MENU_ITEM_TYPE.ARTICLE){
            // artical
            this.setState({urlLinkSelected : urlLink, urlLinkTypeSelected: {}, urlLinkTypeError: undefined}, 
                () => {this.getArticleByStore(this.currentPage, this.SIZE_PER_PAGE)});
        }
    }

    selectParentMenuItem(menuItem){
        this.setState({parentMenuItemSelected : menuItem});
        this.parentMenuItemToogle();
    }

    getMaxOrder(menuItems){
        if(menuItems && menuItems.length > 0){
            return Math.max(...menuItems.map(item => item.order))
        }
        return -1;
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

    onValidSubmit(event, values){
        event.preventDefault();
        event.stopPropagation();
        event.persist();

        if((Object.keys(this.state.urlLinkTypeSelected).length === 0 && this.state.urlLinkTypeSelected.constructor === Object)){
            this.setState({urlLinkTypeError : i18next.t('component.storefront.menu.item.url.link.value')})
            return false;
        }

        let items = [];
        let order = this.getMaxOrder(this.state.parentMenuItemSelected.menuItems);
        if(this.state.modeEdit)
            this.editMenuItem(values, items, order);
        else
            this.addMenuItem(values, items, order);
        
    }

    addMenuItem(values, items, order){
        let data={
            "hasChildren": false,
            "isDeleted": false,
            "menuId": this.state.menuId,
            "name": values['name'],
            "level": 0,
            "parentId": 0,
            "order": order + 1,
            "actionList": "EDIT,REMOVE",
            "dataType": this.state.urlLinkSelected.type,
            "dataValue": this.state.urlLinkTypeSelected.value
        };
        if(Object.keys(this.state.parentMenuItemSelected).length === 0 || this.state.parentMenuItemSelected.id === -1){
            order = this.getMaxOrder(this.state.menuItems);
            data.order = order + 1;
        }else{
            let drop = document.querySelectorAll(`[data-columns="${this.state.parentMenuItemSelected.id}"]`)[0];
            if(!this.canAdd(undefined, drop)){
                return false;
            }
            data.level= this.state.parentMenuItemSelected.level + 1;
            data.parentId = this.state.parentMenuItemSelected.id === -1 ? 0 : this.state.parentMenuItemSelected.id;
            this.state.parentMenuItemSelected.hasChildren = true;
            items.push(this.state.parentMenuItemSelected);
        }
        this.bindingWithColIdOrPageId(data);
        items.push(data);
        menuItemService.updateMenuItems(items).then(res => {
            this.openAlertModal(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t('component.menu.item.add.success'), res)
        })
    }
    editMenuItem(values, items, order){
        if(this.state.currentMenuItem.id !== this.state.parentMenuItemSelected.id){
            let drag = document.querySelectorAll(`[data-columns="${this.state.currentMenuItem.id}"]`)[0];
            let drop = document.querySelectorAll(`[data-columns="${this.state.parentMenuItemSelected.id}"]`)[0];
            if(this.state.currentMenuItem.parentId > 0){
                let parentMenu = this.findMenu(this.state.menuItems, this.state.currentMenuItem.parentId);
                if(parentMenu.menuItems.length < 2){
                    parentMenu.hasChildren = false;
                }
                items.push(parentMenu);
            }

            if(this.state.parentMenuItemSelected.id === -1){
                order = this.getMaxOrder(this.state.menuItems);
                this.state.currentMenuItem.parentId = 0;
                this.state.currentMenuItem.order = this.state.currentMenuItem.parentId === 0 ? this.state.currentMenuItem.order : order + 1;
                this.state.currentMenuItem.level = 0;
            }else{
                if(!this.canAdd(drag, drop)){
                    return false;
                }
                order = this.state.currentMenuItem.parentId === this.state.parentMenuItemSelected.id ? this.state.currentMenuItem.order : order + 1

                this.state.currentMenuItem.parentId = this.state.parentMenuItemSelected.id;
                this.state.currentMenuItem.order = order;
                this.state.currentMenuItem.level = this.state.parentMenuItemSelected.level + 1;
                this.state.parentMenuItemSelected.hasChildren = true;
                let result = this.updateChildrenLvl(this.state.currentMenuItem);
                items = [...items, ...result];
                items.push(this.state.parentMenuItemSelected);
            }
        }
        this.bindingWithColIdOrPageId(this.state.currentMenuItem);    
        this.state.currentMenuItem.name = values['name'];
        items.push(this.state.currentMenuItem);
        menuItemService.updateMenuItems(items).then(res => {
            this.openAlertModal(AlertModalType.ALERT_TYPE_SUCCESS, i18next.t('component.menu.item.edit.success'), res)
        })
    }
    canAdd(dragEle, dropEle){
        let ids = [];
        let dropId = parseInt(dropEle.attributes['data-columns'].value);
        let dragLvl = dragEle ? this.countTotalLvl(dragEle, ids) : 0;
        let dropLvl =  this.countLvlToRoot(dropEle, 0);
        if(ids.some(id => id === dropId)){
            this.setState({menuItemError : i18next.t("component.menu.item.warn")})
            return false;
        }
        if(dropLvl >=3){
            this.setState({menuItemError : i18next.t("component.menu.item.level.warn")})
            return false;
        } 
        else if(dragLvl + dropLvl >= 4){
            this.setState({menuItemError : i18next.t("component.menu.item.level.warn")})
            return false;
        }
        else
            return true;
    }
    findParentNode(dragEle){
        let parentNode = dragEle.parentElement;
        if(parentNode.className.includes('dropdown-menu')){
            return dragEle;
        }
        return false;
    }
    updateChildrenLvl(menuItem){
        let menuItems = menuItem.menuItems.slice();
        let level = menuItem.level + 0;
        let size = menuItems.length;
        let result = [];
        while(menuItems.length > 0){
            const item = menuItems.shift();
            const childMenuItems= item.menuItems;
            for(let i = 0 ; i < childMenuItems.length; i++){
                let child = childMenuItems[i];
                menuItems.push(child);
            }
            size --;
            item.level = level + 1;
            result.push(item);
            if(size === 0){
                level++;
                size = menuItems.length;
            }
        }
        return result;
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
               if(childNode.className.includes('dropdown-item')){
                   ids.push(parseInt(childNode.attributes['data-columns'].value));
                   nodes.push(childNode);
               }
           }
           size --;
           if(size === 0){
                lvl++;
                size = nodes.length;
           }
       }
       return lvl;
    }
    countLvlToRoot(ele, lvl){
        let parentNode = ele.parentElement;
        if(parentNode.className.includes('dropdown-menu')){
            return lvl;
        }else{
            lvl++;
            return this.countLvlToRoot(ele.parentElement, lvl);
        }
    }
    openAlertModal(type, message, res){

        this.alertModal.openModal({
            type: type,
            messages: message,
            closeCallback: () => {
                this.okModal();
            }
        });
    }
    // for collection
    getCollectionById(collectionId){
        CollectionService.getCollectionDetail(collectionId).then(res => {
          this.setState({ urlLinkTypeSelected : {name : res.collectionName, value : res.id}});
        })
    }
    getCollectionsByBcStoreId(storeId, page, size) {
        const itemType = this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_SERVICE ? 'SERVICE' : 'BUSINESS_PRODUCT'
        CollectionService.getCollectionsByBcStoreId({sellerId: storeId, page: page, size: size, itemType : itemType}).then(res => {
            clearTimeout(this.timeOut);
            let data = this.state.data.slice();
            if(page === 0){
                data = [];
            }

            // map response to list with name and id
            const resData = res.content.map(x => {
                return {name : x.collectionName, id : x.id}
            });

            data = [...data, ...resData];

            let emptyErr = data.length < 1 ? "component.product.addNew.productInformation.collection.noContent": "";
            this.setState({ data: data, isLoading: false, emptyDataError: emptyErr})
            this.setState({ data: data, isLoading: false})
            this.totalPage = res.totalPages;
            this.currentPage++;
        })
    }

    // for page
    getPagesByBcStoreId(page, size){
        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        if(useNewThemeEngine) {
            customPageService.getCustomPagesForMenu({page: page, size: size}).then(res => {
                clearTimeout(this.timeOut);
                let data = this.state.data.slice();
                if(page === 0){
                    data = [];
                }

                // map response to list with name and id
                const resData = res.data.map(x => {
                    return {name : x.name, id : x.id}
                });
            
                data = [...data, ...resData];
                let emptyErr = data.length < 1 ? "component.product.addNew.productInformation.page.noContent": "";
                this.setState({ data: data, isLoading: false, emptyDataError: emptyErr})
                this.totalPage = Math.ceil(parseInt(res.headers['x-total-count']) / this.SIZE_PER_PAGE);
                this.currentPage ++;
            })
        } else {
            pageService.getPagesByBcStoreId({page: page, size: size}).then(res => {
                clearTimeout(this.timeOut);
                let data = this.state.data.slice();
                if(page === 0){
                    data = [];
                }

                // map response to list with name and id
                const resData = res.data.map(x => {
                    return {name : x.name, id : x.id}
                });

                data = [...data, ...resData];
                let emptyErr = data.length < 1 ? "component.product.addNew.productInformation.page.noContent": "";
                this.setState({ data: data, isLoading: false, emptyDataError: emptyErr})
                this.totalPage = Math.ceil(parseInt(res.headers['x-total-count']) / this.SIZE_PER_PAGE);
                this.currentPage ++;
            })
       }
    }
    getPageById(pageId){
        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        if(useNewThemeEngine) {
            customPageService.getCustomPageForMenuById(pageId).then(res => {
                this.setState({ urlLinkTypeSelected : {name : res.data.name, value : res.data.id}});
            })
        } else {
            pageService.getPageById(pageId).then(res => {
                this.setState({ urlLinkTypeSelected : {name : res.data.name, value : res.data.id}});
            })
        }
    }

    // for link
    getLinkValue(value){
        this.setState({ urlLinkTypeSelected : {name : value, value : value}});
    }

    // for blog
    getBlogByStore(page, size, menuItem){
        clearTimeout(this.timeOut);
        const data = [{id : 0, name : i18next.t('page.storeFront.menu.edit.allArticle')}]
        beehiveService.getBlogCategories()
            .then(cateRes => {
                cateRes.forEach(ct => ct.name = ct.title)
                data.push(...cateRes)
                // let emptyErr = data.length < 1 ? "component.product.addNew.productInformation.page.noContent": "";
                this.setState({ data: data, isLoading: false, emptyDataError: ''})
                this.totalPage = 1;
                this.currentPage ++;

                if (menuItem) {
                    const cateId = menuItem.dataValue
                    const defaultCate = data.find(cate => cate.id == cateId)
                    if (defaultCate) {
                        this.setState({ 
                            urlLinkTypeSelected : {
                                name : defaultCate.name, 
                                value : defaultCate.id
                            }
                        });
                    }
                }
            })
            .catch(e => {
                this.setState({ data: data, isLoading: false, emptyDataError: ''})
            })

    }

    setBlogDefaultCategory(){
        this.setState({ urlLinkTypeSelected : {name : i18next.t('page.storeFront.menu.edit.allArticle'), value : 0}});
    }

    // for artical
    getArticleByStore(page, size){
        beehiveService.getBlogArticleList (undefined , page, size).then(res => {
            clearTimeout(this.timeOut);
            let data = this.state.data.slice();
            if(page === 0){
                data = [];
            }

            // map response to list with name and id
            const resData = res.data.map(x => {
                return {name : x.title, id : x.id}
            });

            data = [...data, ...resData];
            let emptyErr = data.length < 1 ? "component.product.addNew.productInformation.article.noContent": "";
            this.setState({ data: data, isLoading: false, emptyDataError: emptyErr})
            this.totalPage = Math.ceil(parseInt(res.totalItem) / this.SIZE_PER_PAGE);
            this.currentPage ++;
        })
    }

    getArticleDetail(value){
        beehiveService.getBlogArticle(value).then(res => {
            this.setState({ urlLinkTypeSelected : {name : res.title, value : res.id}});
        }).catch(error => {
            // do nothing here
        });
        
    }

    // function support
    isBottom(el) {
        let afterCal = Math.floor(el.scrollHeight - el.scrollTop);
        return afterCal <= el.clientHeight;
    }
      
    onScroll(event){
        if (this.isBlog()) return


        event.preventDefault();
        event.stopPropagation();
        if(!this.scrolled){
            this.scrolled = true;
            if(this.isBottom(event.currentTarget) && this.currentPage <= this.totalPage){
                event.currentTarget.classList.add('scroll-y-invisible');
                this.setState({isLoading: true})
                this.timeOut = setTimeout( () => {
                    if(this.isCollection()){
                        this.getCollectionsByBcStoreId(this.state.storeId, this.currentPage, this.SIZE_PER_PAGE);
                    }else if(this.isPage()){
                        this.getPagesByBcStoreId(this.currentPage, this.SIZE_PER_PAGE);
                    }else if(this.isArtical()){
                        this.getArticleByStore(this.currentPage, this.SIZE_PER_PAGE);
                    }
                    
                }, 1500)   
            }
            this.scrolled = false;
        }
    }
    bindingWithColIdOrPageId(data){
        if(this.isCollection()){
            data.collectionId = this.state.urlLinkTypeSelected.value;
            data.pageId = null;
        }else if(this.isPage()){
            data.pageId = this.state.urlLinkTypeSelected.value;
            data.collectionId = null;
        }

        // add data for others cases
        data.dataValue = this.state.urlLinkTypeSelected.value;
        data.dataType = this.state.urlLinkSelected.type
    }

    isCollection(){
        return this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_SERVICE 
        || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_PRODUCT;
    }

    isPage(){
        return this.state.urlLinkSelected.type === MENU_ITEM_TYPE.PAGE;
    }

    isBlog(){
        return this.state.urlLinkSelected.type === MENU_ITEM_TYPE.BLOG;
    }

    isArtical(){
        return this.state.urlLinkSelected.type === MENU_ITEM_TYPE.ARTICLE;
    }

    isLink(){
        return this.state.urlLinkSelected.type === MENU_ITEM_TYPE.LINK_EXTERNAL;
    }
    
    linkTo(){
        if(this.isCollection()){
            RouteUtils.redirectTo(NAV_PATH.collections)
        }else if(this.isPage()){
            RouteUtils.redirectTo(NAV_PATH.pages)
        }
    }
   renderMenuItems(menuItems){
        menuItems.sort((pervious, current) => {
            let compa = 0;
            if(pervious.order > current.order)
                compa = 1;
            else if(pervious.order < current.order)
                compa = -1;
            return compa;
        });
        return (
            menuItems.length > 0 && (menuItems.map((item, index) => {
                return (
                    <DropdownItem key={item.id + "-" + index} data-columns={item.id} data-name={item.name}>                     
                        <div className="item-name" onClick={() => this.selectParentMenuItem(item)}>
                            <span>{item.name}</span></div>
                        {item.menuItems.length > 0 &&( this.renderMenuItems(item.menuItems))}
                    </DropdownItem>
                )
            }))
        )
   }
    render() {
        return (
            <Modal isOpen={this.state.modal} className={'menu-item-modal'}>
                 {this.state.isLoading && <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}/>}
                <AvForm onValidSubmit={this.onValidSubmit}>
                    <ModalHeader toggle={this.closeModal}>{this.state.modalTitle}</ModalHeader>
                    <ModalBody>
                        <GSWidget>
                            <span className="uik-content-title__wrapper">{i18next.t("component.storefront.menu.item.name")}</span>
                            <AvField name="name" value={this.state.menuName} validate={{
                                ...this.props.validate,
                                ...FormValidate.required(),
                                maxLength: { value: 50, errorMessage: i18next.t("common.validation.char.max.length", { x: 50 }) }
                                }}>
                            </AvField>
                        </GSWidget>
                        <GSWidget className="url-link">
                            <span className="uik-content-title__wrapper">{i18next.t("component.storefront.menu.item.url.link")}</span>
                            <div className="url-link-item">
                                <Dropdown className="links" isOpen={this.state.urlLinksDropDownOpen} toggle={this.urlLinkToggle}>
                                    <DropdownToggle className="var-values__pool" caret>
                                    {this.state.urlLinkSelected.name}
                                    </DropdownToggle>
                                        <DropdownMenu className="multiple-select">
                                       
                                            {
                                                this.state.urlLinks && (this.state.urlLinks.map((links, index) =>{
                                                    return (
                                                        <DropdownItem key={links.type + " link " + index} onClick={() => this.selectUrlLink(links)}>
                                                            <span>{links.name}</span>                                                    
                                                        </DropdownItem>
                                                    )
                                                }))
                                            }         
                                        </DropdownMenu>
                                </Dropdown>

                                {
                                    // this is link
                                    this.state.urlLinkSelected.type  === MENU_ITEM_TYPE.LINK_EXTERNAL &&
                                    <AvField 
                                        name="link" 
                                        value={this.state.urlLinkTypeSelected.value} 
                                        onChange={(event, values) => this.onInputChange(event, values)}
                                        validate={{
                                            pattern: {
                                                value: '^(http|https|ftp)://.*$',
                                                errorMessage: i18next.t('common.validation.invalid.start_url')
                                            },
                                            required:{
                                                 value: true,
                                                 errorMessage: i18next.t('common.validation.required')
                                            }
                                        }}
                                    ></AvField>
                                }
                                
                                
                                { (this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_SERVICE 
                                || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_PRODUCT
                                || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.PAGE
                                || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.BLOG
                                || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.ARTICLE ) &&
                                
                                    <Dropdown className= {this.state.urlLinkTypeError ? "collections error" : "collections"} isOpen={this.state.urlLinksTypeDropDownOpen} toggle={this.collectionToggle}>
                                        <DropdownToggle className="var-values__pool">
                                            <span>{this.state.urlLinkTypeSelected.name}</span>
                                        </DropdownToggle>
                                            <DropdownMenu className="multiple-select" onScroll={this.onScroll}>
                                                {
                                                    this.state.data.length > 0 && (this.state.data.map((data, index) =>{
                                                        return (
                                                            <DropdownItem key={data.id + ' collection  ' + index} onClick={ () => this.selectUrlLinkType(data)}>
                                                                <span>{data.name}</span>                                          
                                                            </DropdownItem>
                                                        )
                                                    }))
                                                } 
                                            </DropdownMenu>
                                    </Dropdown>
                                }
                            </div>
                        </GSWidget>
                        <GSWidget className="menu-items">
                            <span className="uik-content-title__wrapper">{i18next.t("component.storefront.menu.item.parent.link")}</span>
                            <Dropdown  isOpen={this.state.parentMenuItemDropDownOpen} toggle={this.parentMenuItemToogle}>
                                    <DropdownToggle className="var-values__pool">
                                        {this.state.parentMenuItemSelected.name}
                                    </DropdownToggle>
                                        <DropdownMenu className="multiple-select">
                                            {
                                                this.state.menuItems && (this.renderMenuItems(this.state.menuItems, false))
                                            }         
                                        </DropdownMenu>
                                </Dropdown>
                        </GSWidget>
                       <GSWidget className="error">
                            <span className="error-message">{this.state.urlLinkTypeError}</span>
                            <span className="error-message">{this.state.menuItemError}</span>
                            {
                                (
                                    (!this.state.data || this.state.data.length === 0) && 
                                    (this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_PRODUCT
                                    || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.COLLECTION_SERVICE
                                    || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.PAGE
                                    || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.BLOG
                                    || this.state.urlLinkSelected.type === MENU_ITEM_TYPE.ARTICLE
                                    )
                                )&&
                                <span>
                                <GSTrans t={this.state.emptyDataError}>
                                    You haven't created any collections yet. 
                                    <GSFakeLink onClick={()=> this.linkTo()}>Create collection</GSFakeLink>.
                                </GSTrans>
                                </span>
                            }
                       </GSWidget>
                    </ModalBody>
                    <ModalFooter>
                        <GSButton buttonType="button" secondary outline onClick={this.cancelModal}>{this.state.modalBtnCancel}</GSButton>
                        <GSButton success marginLeft>{this.state.modalBtnOk}</GSButton>
                    </ModalFooter>
                </AvForm>
                <AlertModal ref={(el) => { this.alertModal = el }} />
            </Modal>
        );
    }
}
