/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 19/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react';
import {UikNavLink, UikNavLinkSecondary, UikNavPanel, UikNavSection, UikNavSectionTitle, UikTag} from '../../../@uik';
import './Navigation.sass';
import {Trans} from "react-i18next";
import authenticate from "../../../services/authenticate";
import i18next from "i18next";
import {CredentialUtils} from "../../../utils/credential";
import icoHome from '../../../../public/assets/images/navigation/ico-home.svg';
import {
    icoAnalytis,
    icoBeecow,
    icoCallCenter,
    icoCustomers,
    icoDiscount,
    icoLazada,
    icoLiveChat,
    icoMarketing,
    icoOnlineShop,
    icoOrder,
    icoProduct,
    icoReservation,
    icoService,
    icoSetting,
    icoShopee,
    icoCashbook,
} from "../../shared/gsIconsPack/gssvgico";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {TokenUtils} from "../../../utils/token";
import PrivateComponent from "../../shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import {STAFF_PERMISSIONS} from "../../../config/staff-permissions";
import {ROLES} from "../../../config/user-roles";
import storageService from "../../../services/storage";
import Constants from '../../../config/Constant';
import AlertModal from "../../shared/AlertModal/AlertModal";
import GSTooltip, {GSTooltipIcon} from "../../shared/GSTooltip/GSTooltip";
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../shared/GSComponentTooltip/GSComponentTooltip";
import {
    NavigationKey,
    NavigationLevel1Path,
    NavigationLevel2Path,
    NavigationPath
} from '../../../config/NavigationPath';
import {CurrencyUtils} from "../../../utils/number-format";


/**
 * @deprecated
 * @type {{shopeeLinkProducts: string, lazada: string, productPrintBarCode: string, shopeeAccount: string, upgradeInChannel: string, articleCreate: string, productCreate: string, createFlashSaleCampaign: string, setting: {ROOT: string, SHIPPING_PAYMENT: string, BANK_INFO: string}, tikiProductSync: string, logout: string, collections: string, lazadaProductSync: string, staffLogin: string, supplier: string, shopeeProduct: string, liveChat: {ROOT: string, PATH_LIVE_CHAT_CONVERSATION: string, PATH_ZALO_CHAT_RESOLVE_TOKEN: string, PATH_LIVE_CHAT_INTRO: string, PATH_ZALO_CHAT_CONVERSATION: string, PATH_ZALO_CHAT_INTRO: string, PATH_LIVE_CHAT_CONFIGURATION: string}, reviewProduct: string, flashSaleTime: string, dashboard: string, shopeeSettings: string, settingsPlans: string, orderCreate: string, beecow: string, settingPaypal: String, shopeeProductSync: string, previewLandingPage, shopeeProductList: string, shopeeEditProduct: string, reset: string, orders: string, createCustomPage: string, loyaltyPointIntro: string, shopee: string, settingsCallCenterPlans: string, customizationDesign: string, themeEngine: {preview: string, making: string, library: string, management: string}, customization: string, collectionEdit: string, login: string, blogCategoryManagement: string, products: string, blogCategoryCreate: string, serviceEdit: string, theme: {PATH_THEME_MAKING: string, ROOT: string}, customers: {SEGMENT_CREATE: string, ROOT: string, SEGMENT_LIST: string, CUSTOMERS_LIST: string, CUSTOMERS_EDIT: string, SEGMENT_EDIT: string}, pagesEdit: string, beecowAccount: string, redirect: string, product: string, navigations: string, supplierEdit: string, transferStockEdit: string, menuAdd: string, automaticads: string, services: string, menu: string, marketing: {NOTIFICATION_PUSH_CREATE: string, LOYALTY_POINT_INTRO: string, LOYALTY_POINT_SETTING: string, ROOT: string, LANDING_PAGE_DETAIL: string, EMAIL_CREATE: string, AUTOMATED_ADS: string, LOYALTY: string, LOYALTY_LIST: string, EMAIL: string, BUY_LINK: string, LOYALTY_POINT: string, EMAIL_EDIT: string, LOYALTY_EDIT: string, LANDING_PAGE: string, NOTIFICATION_INTRO: string, LANDING_PAGE_EDIT: string, LANDING_PAGE_CREATE: string, GOOGLE_SHOPPING: string, FACEBOOK_PIXEL: string, GOOGLE_TAG_MANAGER: string, GOOGLE_ANALYTICS: string, NOTIFICATION_DETAIL: string, COMMUNICATION_INTRO: string, NOTIFICATION: string, BUY_LINK_INTRO: string, LOYALTY_CREATE: string, NOTIFICATION_PUSH_EDIT: string, NOTIFICATION_EMAIL_CREATE: string}, shopeeAccountInformation: string, serviceCreate: string, wizard: string, forgot: string, shopeePlans: string, lazadaProductEdit: string, variationDetail: string, loyaltyPointSetting: string, productEdit: string, customizationInfo: string, blog: string, analytics: {ROOT: string, RESERVATIONS: string, ORDERS: string}, paymentCallback: string, linkProducts: string, pages: string, variationDetailEdit: string, discounts: {ROOT: string, DISCOUNTS_DETAIL: string, DISCOUNTS_EDIT: string, FLASHSALE_INTRO: string, DISCOUNTS_CREATE: string, DISCOUNTS_LIST: string}, lazadaAccount: string, supplierCreate: string, pagesCreate: string, blogCategoryEdit: string, articleEdit: string, tikiProduct: string, settings: string, collectionCreate: string, tiki: string, transferStock: string, purchaseOrderCreate: string, domains: string, settingsBranchPlans: string, shopeeAccountManagement: string, tikiResolveCode: string, inventoryHistory: string, settingsLanguagesPlans: string, storefront: string, purchaseOrderEdit: string, purchaseOrderWizard: string, orderPrint: string, collectionServiceEdit: string, flashSale: string, tikiEditProduct: string, error: string, inventory: string, orderInStorePurchase: string, editFlashSaleCampaign: string, tikiAccount: string, callCenter: {ROOT: string, PATH_CALL_CENTER_INTRO: string, PATH_CALL_CENTER_HISTORY_LIST: string}, reservationDetail: string, customPages: string, transferStockCreate: string, transferStockWizard: string, collectionsService: string, orderPrintReceipt: string, printLazadaShippingLabel: string, lazadaProduct: string, shopeeAccountIntro: string, home: string, collectionServiceCreate: string, reservations: string, menuEdit: string, paymentCallbackEpay: string, paymentCallbackChaiPay: string, purchaseOrder: string, orderDetail: string, notFound: string, editCustomPage: string, quotation: string}}
 */
export const NAV_PATH = NavigationPath

/**
 * @deprecated
 */
export const NAV = NavigationKey

/**
 * @deprecated
 */
export const Level1Path = NavigationLevel1Path

export const Level2Path = NavigationLevel2Path

function setActiveMenu(expected, navName) {
    return expected === navName || !!Object.values(expected).find(v => v === navName || Object.values(v).indexOf(navName) > -1)  ? 'active' : '';
}

class Navigation extends Component {
    isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)

    constructor(props) {
        super(props);

        this._isMounted = false;
        this.storeId = authenticate.getStoreId();
        this.state = {
            active: this.props.active,
            currentPackage: CredentialUtils.getPackageId(),
            onFirstLoad: false
        };
        this.onClickCollapsibleMenu = this.onClickCollapsibleMenu.bind(this);
        this.renderCollapsibleIcon = this.renderCollapsibleIcon.bind(this);
        this.renderStaffNav = this.renderStaffNav.bind(this);
    }

    componentDidMount() {
        this.setState({
            onFirstLoad: true
        })
        this._isMounted = true;

    }

    componentWillUnmount() {
        this._isMounted = false;

    }

    onClickCollapsibleMenu(nav) {
        this.setState({
            onFirstLoad: false,
            active: nav
        })
    }

    renderCollapsibleIcon(nav) {
        if (setActiveMenu(nav, this.state.active) === 'active') {
            return <FontAwesomeIcon icon="angle-right"
                                    className="collapsible-icon--open"
                                    key="collapsible-icon--open"/>
        } else {
            return <FontAwesomeIcon icon="angle-right"
                                    className="collapsible-icon--close"
                                    key="collapsible-icon--close"/>
        }
    }

    renderStaffNav(permission, navComponent) {

        if (TokenUtils.isHasStaffPermission(permission)) {
            return navComponent
        }
        return null
    }

    render() {
        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        const useNewThemeMenu = storageService.getFromLocalStorage("useNewThemeMenu") === "true";
        const isOldGoSocialMenu = CredentialUtils.getIsOldGoSocialMenu()
        const isFbChatLogin = CredentialUtils.getFbChatLogin()?.isLogged
        const getCurrencyCode = storageService.getFromLocalStorage(Constants.STORE_CURRENCY_CODE)

        return (
            <UikNavPanel className={["nav-panel", "gs-atm__scrollbar-1", this.props.className].join(' ')}>
                <UikNavSection className="nav-section-dashboard">
                    {/*<NavLevelOne active={setActiveMenu(NAV.dashboard, this.state.active)} name="component.navigation.dashboard" url={NAV_PATH.dashboard}/>*/}
                    {/*HOME*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]}
                    >
                        <NavLevelOne active={setActiveMenu(NAV.home, this.state.active)}
                                     name="component.navigation.home" url={NAV_PATH.home}
                                     iconComp={icoHome}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>

                    {/*LIVE CHAT*/}
                    {
                        //MENU FOR OLD CHAT
                        isOldGoSocialMenu && <PrivateComponent wrapperDisplay={"block"}
                                                               hasStaffPermission={STAFF_PERMISSIONS.LIVE_CHAT}
                                                               hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0106]}
                                                               allowUserEvents
                        >
                            <NavLevelOne active={setActiveMenu(NAV.liveChat, this.state.active)}
                                         name="component.navigation.liveChat"
                                         url={NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO}
                                         collapsible={this.props.collapsible}
                                         onClick={() => this.onClickCollapsibleMenu(NAV.liveChat)}
                                         iconComp={icoLiveChat}
                                         hiddenName={this.props.collapsedMenu}
                                         rightEl={this.renderCollapsibleIcon(NAV.liveChat)}
                            />
                            {
                                setActiveMenu(NAV.liveChat, this.state.active) === 'active' ?
                                    <UikNavSection
                                        className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                        <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0106]}
                                        >
                                            <NavLevelTwo
                                                active={setActiveMenu(NAV.liveChat.facebook, this.state.active)}
                                                name="component.navigation.liveChat.facebook"
                                                url={NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO}/>
                                        </PrivateComponent>
                                        <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0106]}
                                        >
                                            <NavLevelTwo
                                                active={setActiveMenu(NAV.liveChat.zalo, this.state.active)}
                                                name="component.navigation.liveChat.zalo"
                                                url={NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO}/>
                                        </PrivateComponent>

                                    </UikNavSection>
                                    : null
                            }
                        </PrivateComponent>
                    }
                    {
                        //MENU FOR GOSOCIAL
                        !isOldGoSocialMenu && <PrivateComponent wrapperDisplay={"block"}
                                                                hasStaffPermission={STAFF_PERMISSIONS.LIVE_CHAT}
                                                                hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                                allowUserEvents
                        >
                            <NavLevelOne active={setActiveMenu(NAV.goSocial, this.state.active)}
                                         name={CredentialUtils.isStoreXxxOrGoSell() ? "component.navigation.teraLiveChat" : "component.navigation.liveChat"}
                                         url={NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO}
                                         collapsible={this.props.collapsible}
                                         onClick={() => this.onClickCollapsibleMenu(NAV.goSocial.facebook)}
                                         iconComp={icoLiveChat}
                                         hiddenName={this.props.collapsedMenu}
                                         rightEl={this.renderCollapsibleIcon(NAV.goSocial)}
                            />
                            {
                                setActiveMenu(NAV.goSocial, this.state.active) === 'active' ?
                                    <UikNavSection
                                        className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                        <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                          hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                        >
                                            <NavLevelTwo active={setActiveMenu(NAV.goSocial.facebook, this.state.active)}
                                                         name="component.navigation.liveChat.facebook"
                                                         url={NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO}
                                                         rightEl={isFbChatLogin && this.renderCollapsibleIcon(NAV.goSocial.facebook)}
                                            />
                                            {
                                                isFbChatLogin && setActiveMenu(NAV.goSocial.facebook, this.state.active) === 'active' ?
                                                <>
                                                    <UikNavSection
                                                        className={["nav-third-section", this.props.collapsedMenu ? 'nav-third-section--closed' : 'nav-third-section--opened', this.state.onFirstLoad ? "" : "nav-third-section--ani"].join(' ')}>
                                                        <PrivateComponent wrapperDisplay={"block"}
                                                                          allowUserEvents
                                                                          hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                        >
                                                            <NavLevelTwo
                                                                active={setActiveMenu(NAV.goSocial.facebook.conversation, this.state.active)}
                                                                name="component.navigation.liveChat.conversation"
                                                                url={NAV_PATH.goSocial.PATH_GOSOCIAL_CONVERSATION}/>
                                                        </PrivateComponent>
                                                        <PrivateComponent wrapperDisplay={"block"}
                                                                          allowUserEvents
                                                                          hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                        >
                                                            <NavLevelTwo
                                                                active={setActiveMenu(NAV.goSocial.facebook.configuration, this.state.active)}
                                                                name="component.navigation.liveChat.configuration"
                                                                url={NAV_PATH.goSocial.PATH_GOSOCIAL_CONFIGURATION}/>
                                                        </PrivateComponent>

                                                        <PrivateComponent wrapperDisplay={"block"}
                                                                          allowUserEvents
                                                                          hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                        >
                                                            <NavLevelTwo
                                                                active={setActiveMenu(NAV.goSocial.facebook.automation, this.state.active)}
                                                                name="component.navigation.liveChat.automation"
                                                                url={NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION}/>
                                                        </PrivateComponent>

                                                        <PrivateComponent wrapperDisplay={"block"}
                                                                          allowUserEvents
                                                                          hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                        >
                                                            <NavLevelTwo
                                                                active={setActiveMenu(NAV.goSocial.facebook.broadcast, this.state.active)}
                                                                name="component.navigation.liveChat.broadcast"
                                                                url={NAV_PATH.goSocial.PATH_GOSOCIAL_BROADCAST}/>
                                                        </PrivateComponent>
                                                    </UikNavSection>
                                                </>
                                                : null
                                            }
                                        </PrivateComponent>

                                        <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                          hasAllPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                        >
                                            <NavLevelTwo
                                                active={setActiveMenu(NAV.goSocial.zalo, this.state.active)}
                                                name="component.navigation.liveChat.zalo"
                                                url={NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO}/>
                                        </PrivateComponent>

                                    </UikNavSection>
                                    : null
                            }
                        </PrivateComponent>
                    }

                    {/*PRODUCT*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.PRODUCTS}
                                      allowUserEvents
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0107]}
                    >
                        <NavLevelOne active={setActiveMenu(NAV.products, this.state.active)}
                                     name="component.navigation.products" url={NAV_PATH.products}
                                     data-sherpherd="tour-product-step-1"
                                     iconComp={icoProduct}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.products)}
                                     rightEl={this.renderCollapsibleIcon(NAV.products)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.products, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0108]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.productProduct, this.state.active)}
                                                     data-sherpherd="tour-product-step-2"
                                                     name="component.navigation.all_products" url={NAV_PATH.products}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0108]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.inventory, this.state.active)}
                                                     name="component.navigation.product.inventory"
                                                     url={NAV_PATH.inventory}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                    wrapperClass="gs-atm-must-disabled"
                                                    hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.transferStock, this.state.active)}
                                                     name="component.navigation.product.transfer"
                                                     url={NAV_PATH.transferStock}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0111]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.productCollection, this.state.active)}
                                                     name="component.navigation.collections_products"
                                                     url={NAV_PATH.collections}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0112]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.reviewProduct, this.state.active)}
                                                     name="component.navigation.reviews" url={NAV_PATH.reviewProduct}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                      hasStaffPermission={STAFF_PERMISSIONS.SUPPLIER_MANAGEMENT}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.supplier, this.state.active)}
                                                     name="component.navigation.supplier" url={NAV_PATH.supplier}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                      hasStaffPermission={STAFF_PERMISSIONS.PURCHASE_ORDER}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.purchaseOrder, this.state.active)}
                                                     name="component.navigation.product.purchaseOrder"
                                                     url={NAV_PATH.purchaseOrder}/>
                                    </PrivateComponent>
                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>

                    {/*SERVICE*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.SERVICES}
                                      allowUserEvents
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0110]}
                    >
                        <NavLevelOne active={setActiveMenu(NAV.services, this.state.active)}
                                     name="component.navigation.services" url={NAV_PATH.services}
                                     iconComp={icoService}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.services)}
                                     rightEl={this.renderCollapsibleIcon(NAV.services)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.services, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0110]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.services.service, this.state.active)}
                                                     name="component.navigation.all_services" url={NAV_PATH.services}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAllPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0111, PACKAGE_FEATURE_CODES.FEATURE_0110]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.serviceCollection, this.state.active)}
                                                     name="component.navigation.collections_services"
                                                     url={NAV_PATH.collectionsService}/>
                                    </PrivateComponent>
                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>

                    {/*ORDER*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.ORDERS}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0113]}
                                      allowUserEvents
                    >
                        <NavLevelOne active={setActiveMenu(NAV.orders, this.state.active)}
                                     name="component.navigation.orders"
                                     url={NAV_PATH.orders}
                                     iconComp={icoOrder}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.orders)}
                                     rightEl={this.renderCollapsibleIcon(NAV.orders)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.orders, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0113]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.orders.order, this.state.active)}
                                                     name="component.navigation.orderList" url={NAV_PATH.orders}/>
                                    </PrivateComponent>

                                    <PrivateComponent 
                                        wrapperDisplay={"block"} 
                                        allowUserEvents
                                        hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE] }
                                        wrapperClass="gs-atm-must-disabled"
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.orders.returnOrder, this.state.active)}
                                                     name="component.navigation.returnOrder" url={NAV_PATH.returnOderList}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.orders.quotation, this.state.active)}
                                                     name="page.order.list.createQuotation" url={NAV_PATH.quotation}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.POS_PACKAGE]}
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.orders.inStorePurchase, this.state.active)}
                                                     name="page.order.list.create" newTabs url={NAV_PATH.orderInStorePurchase}/>
                                    </PrivateComponent>
                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>

                    {/*RESERVATIONS*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.RESERVATIONS}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0116]}
                                      allowUserEvents>
                        <NavLevelOne active={setActiveMenu(NAV.reservations, this.state.active)}
                                     name="page.reservation.menu.name"
                                     url={NAV_PATH.reservations}
                                     iconComp={icoReservation}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>

                    {/* DISCOUNTS */}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.DISCOUNT}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0117]}
                                      allowUserEvents>
                        <NavLevelOne active={setActiveMenu(NAV.promotion, this.state.active)}
                                     name="component.navigation.promotion"
                                     url={NAV_PATH.discounts.ROOT}
                                     iconComp={icoDiscount}
                                     hiddenName={this.props.collapsedMenu}
                                     collapsible={this.props.collapsible}
                                     onClick={_ => this.onClickCollapsibleMenu(NAV.promotion)}
                                     rightEl={this.renderCollapsibleIcon(NAV.promotion)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.promotion, this.state.active) === 'active' &&
                            <UikNavSection>
                                <PrivateComponent wrapperDisplay={"block"} allowUserEvents>
                                    <NavLevelTwo active={setActiveMenu(NAV.promotion.discounts, this.state.active)}
                                                 name="component.navigation.promotion.discount"
                                                 url={NAV_PATH.discounts.DISCOUNTS_LIST}/>
                                </PrivateComponent>
                                <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]}>
                                    <NavLevelTwo active={setActiveMenu(NAV.promotion.flashSale, this.state.active)}
                                                 name="component.navigation.promotion.flashsale"
                                                 url={NAV_PATH.flashSale}/>
                                </PrivateComponent>
                            </UikNavSection>
                        }
                    </PrivateComponent>

                    {/*CUSTOMER*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.CUSTOMERS}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0129]}
                                      allowUserEvents
                    >
                        <NavLevelOne active={setActiveMenu(NAV.customers, this.state.active)}
                                     name="component.navigation.customers"
                                     url={NAV_PATH.customers.ROOT}
                                     iconComp={icoCustomers}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.customers)}
                                     rightEl={this.renderCollapsibleIcon(NAV.customers)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.customers, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0130]}
                                                      allowUserEvents
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.customers.customers, this.state.active)}
                                                     name="component.navigation.customers.allCustomers"
                                                     url={NAV_PATH.customers.CUSTOMERS_LIST}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0133]}
                                                      allowUserEvents>
                                        <NavLevelTwo active={setActiveMenu(NAV.customers.segments, this.state.active)}
                                                     name="component.navigation.customers.segments"
                                                     url={NAV_PATH.customers.SEGMENT_LIST}/>
                                    </PrivateComponent>

                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>

                    {/*CALl CENTER*/}
                    {<PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.CALL_CENTER}
                                       hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0130]}

                    >
                        <NavLevelOne active={setActiveMenu(NAV.callCenter, this.state.active)}
                                     name="component.navigation.callCenter"
                                     url={NAV_PATH.callCenter.ROOT}
                                     iconComp={icoCallCenter}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.callCenter)}
                                     rightEl={this.renderCollapsibleIcon(NAV.callCenter)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.callCenter, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0130]}

                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.callCenter.callHistory, this.state.active)}
                                            name="component.navigation.callCenter.history"
                                            url={NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST}/>
                                    </PrivateComponent>
                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>}

                    {/*CASHBOOK*/}
                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents
                                      wrapperClass="gs-atm-must-disabled"
                                      hasStaffPermission={STAFF_PERMISSIONS.CASHBOOK_SERVICE}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.POS_PACKAGE]}
                    >

                        <NavLevelOne active={setActiveMenu(NAV.cashbook, this.state.active)}
                                     name="page.cashbook.menu.name"
                                     url={NAV_PATH.cashbook.management}
                                     iconComp={icoCashbook}
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </PrivateComponent>

                    {/*ANALYTIC*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.ANALYTICS}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0159]}
                                      allowUserEvents
                    >
                        <NavLevelOne active={setActiveMenu(NAV.analytics, this.state.active)}
                                     name="component.navigation.analytics"
                                     url={NAV_PATH.analytics.ROOT}
                                     iconComp={icoAnalytis}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.analytics)}
                                     rightEl={this.renderCollapsibleIcon(NAV.analytics)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.analytics, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0160]}
                                                      allowUserEvents
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.analytics.orders, this.state.active)}
                                                     name="component.navigation.analytics.orders"
                                                     url={NAV_PATH.analytics.ORDERS}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0161]}
                                                      allowUserEvents
                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.analytics.reservations, this.state.active)}
                                            name="component.navigation.analytics.reservations"
                                            url={NAV_PATH.analytics.RESERVATIONS}/>
                                    </PrivateComponent>

                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>

                    {/*MARKETING*/}
                    <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.MARKETING}
                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0100]}
                                      allowUserEvents
                    >
                        <NavLevelOne active={setActiveMenu(NAV.marketing, this.state.active)}
                                     name="component.navigation.marketing"
                                     url={NAV_PATH.marketing.ROOT}
                                     iconComp={icoMarketing}
                                     tips={i18next.t("nav.comingSoon")}
                                     collapsible={this.props.collapsible}
                                     onClick={() => this.onClickCollapsibleMenu(NAV.marketing)}
                                     rightEl={this.renderCollapsibleIcon(NAV.marketing)}
                                     hiddenName={this.props.collapsedMenu}
                        />
                        {
                            setActiveMenu(NAV.marketing, this.state.active) === 'active' ?
                                <UikNavSection
                                    className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>

                                    <NavLevelTwo active={setActiveMenu(NAV.marketing.landingPage, this.state.active)}
                                                 name="component.navigation.landing"
                                                 url={NAV_PATH.marketing.LANDING_PAGE}/>

                                    <PrivateComponent wrapperDisplay={"block"} allowUserEvents>
                                        <NavLevelTwo active={setActiveMenu(NAV.marketing.buyLink, this.state.active)}
                                                     name="component.navigation.buylink"
                                                     url={NAV_PATH.marketing.BUY_LINK}/>
                                    </PrivateComponent>

                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE, PACKAGE_FEATURE_CODES.SOCIAL_PACKAGE]}
                                                      allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                    >
                                        <NavLevelTwo active={setActiveMenu(NAV.marketing.email, this.state.active)}
                                                     name="component.navigation.emailMarketing"
                                                     url={NAV_PATH.marketing.EMAIL}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.APP_PACKAGE]}
                                                      allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.marketing.notification, this.state.active)}
                                            name="component.navigation.notification"
                                            url={NAV_PATH.marketing.NOTIFICATION}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0167]}
                                                      allowUserEvents
                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.marketing.loyaltyProgram, this.state.active)}
                                            name="component.navigation.loyalty"
                                            url={NAV_PATH.marketing.LOYALTY_LIST}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0255]}
                                                      allowUserEvents
                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.marketing.googleAnalytics, this.state.active)}
                                            name="component.navigation.googleAnalytics"
                                            url={NAV_PATH.marketing.GOOGLE_ANALYTICS}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0353]}
                                                      allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.marketing.googleShopping, this.state.active)}
                                            name="component.navigation.googleShopping"
                                            url={NAV_PATH.marketing.GOOGLE_SHOPPING}/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={ 'block' }
                                                      hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE] }
                                                      allowUserEvents
                                                      wrapperClass="gs-atm-must-disabled"
                                    >
                                        <NavLevelTwo
                                            active={ setActiveMenu(NAV.marketing.googleTagManager, this.state.active) }
                                            name="component.navigation.googleTagManager"
                                            url={ NAV_PATH.marketing.GOOGLE_TAG_MANAGER }/>
                                    </PrivateComponent>
                                    <PrivateComponent wrapperDisplay={"block"}
                                                      hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0253, PACKAGE_FEATURE_CODES.FEATURE_0254]}
                                                      allowUserEvents
                                    >
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.marketing.facebookPixel, this.state.active)}
                                            name="component.navigation.facebookPixel"
                                            url={NAV_PATH.marketing.FACEBOOK_PIXEL}/>
                                    </PrivateComponent>

                                    <NavLevelTwo
                                        active={setActiveMenu(NAV.marketing.loyaltyPoint, this.state.active)}
                                        name="component.navigation.loyaltyPoint"
                                        url={NAV_PATH.marketing.LOYALTY_POINT}/>

                                    <NavLevelTwo
                                        active={setActiveMenu(NAV.affiliate, this.state.active)}
                                        name="component.navigation.affiliate"
                                        newTabs
                                        url={NAV_PATH.affiliate}/>

                                </UikNavSection>
                                :
                                null
                        }
                    </PrivateComponent>
                </UikNavSection>

                {/*SALE CHANNELS*/}
                <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.SALES_CHANNELS}
                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0181]}
                                  allowUserEvents
                >

                    {/*SEPARATE*/}
                    {!this.props.collapsedMenu &&
                    <UikNavSection className="nav-section-seperate"/>
                    }
                    {this.props.collapsedMenu &&
                    <div className="nav-section-separate__dot">
                        • • •
                    </div>
                    }

                    <UikNavSection className="nav-section-sale-channel">
                        {!this.props.collapsedMenu &&
                        <UikNavSectionTitle>
                            <Trans i18nKey="component.navigation.salesChannel"/>
                        </UikNavSectionTitle>
                        }
                        <PrivateComponent wrapperDisplay={"block"}
                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0182]}
                                          allowUserEvents
                        >
                            {/*STOREFRONT*/}
                            <NavLevelOne active={setActiveMenu(NAV.storefront, this.state.active)}
                                         name="component.navigation.storefront"
                                         url={NAV_PATH.themeEngine.management}
                                         noneHover
                                         iconComp={icoOnlineShop}
                                         collapsible={this.props.collapsible}
                                         onClick={() => this.onClickCollapsibleMenu(NAV.storefront)}
                                         rightEl={this.renderCollapsibleIcon(NAV.storefront)}
                                         hiddenName={this.props.collapsedMenu}
                            />
                            {
                                setActiveMenu(NavigationKey.storefront, this.state.active) === 'active' ?
                                    <UikNavSection
                                        className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                        <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0183]}
                                                          allowUserEvents
                                        >
                                            <NavLevelTwo
                                                active={setActiveMenu(NAV.customization, this.state.active)}
                                                name="page.themeEngine.management.title"
                                                url={NAV_PATH.themeEngine.management}/>
                                        </PrivateComponent>
                                        <PrivateComponent wrapperDisplay="block">
                                            <NavLevelTwo active={setActiveMenu(NAV.storefront.blog, this.state.active)}
                                                         name="page.storeFront.blog.nav"
                                                         url={NAV_PATH.blog}
                                            />
                                        </PrivateComponent>
                                        <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0247]}
                                                          allowUserEvents
                                        >
                                            <NavLevelTwo
                                                active={setActiveMenu(NAV.storefront.customPages, this.state.active)}
                                                name="component.navigation.pages" url={NAV_PATH.customPages}/>
                                        </PrivateComponent>

                                        <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0249]}
                                                          allowUserEvents
                                        >
                                            <NavLevelTwo active={setActiveMenu(NAV.menu, this.state.active)}
                                                         name="component.navigation.menus" url={NAV_PATH.menu}/>
                                        </PrivateComponent>
                                        <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0250]}
                                                          allowUserEvents
                                        >
                                            <NavLevelTwo active={setActiveMenu(NAV.domains, this.state.active)}
                                                         name="component.navigation.domains" url={NAV_PATH.domains}/>
                                        </PrivateComponent>

                                        <PrivateComponent wrapperDisplay={"block"}
                                                          hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE] }
                                                          allowUserEvents
                                                          wrapperClass="gs-atm-must-disabled"
                                        >
                                            <NavLevelTwo active={setActiveMenu(NavigationKey.storefront.preferences, this.state.active)}
                                                         name="component.navigation.preferences"
                                                         url={NavigationPath.saleChannel.storefront.preferences}/>
                                        </PrivateComponent>
                                    </UikNavSection>
                                    :
                                    null
                            }
                        </PrivateComponent>


                        {/*SHOPEE*/}
                        <PrivateComponent wrapperDisplay={"block"}
                                          hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0256]}
                                          allowUserEvents>
                            <NavLevelOne active={setActiveMenu(NAV.shopee, this.state.active)}
                                         name="component.button.selector.saleChannel.shopee"
                                         url={NAV_PATH.shopeeAccountManagement}
                                         noneHover
                                         iconComp={icoShopee}
                                         collapsible={this.props.collapsible}
                                         onClick={() => this.onClickCollapsibleMenu(NAV.shopee)}
                                         rightEl={this.renderCollapsibleIcon(NAV.shopee)}
                                         hiddenName={this.props.collapsedMenu}
                            />
                            {
                                setActiveMenu(NAV.shopee, this.state.active) === 'active' ?
                                    <UikNavSection
                                        className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.shopeeAccountInformation, this.state.active)}
                                            name="component.navigation.account" url={NAV_PATH.shopeeAccountInformation}
                                            // disable={this.state.currentPackage == Constants.Package.BASIC}
                                            // premium={this.state.currentPackage == Constants.Package.BASIC}
                                            tips={i18next.t("nav.premium.toolTips")}/>
                                        <NavLevelTwo active={setActiveMenu(NAV.shopeeProduct, this.state.active)}
                                                     name="component.navigation.products"
                                                     url={NAV_PATH.shopeeProductList}
                                            // disable={this.state.currentPackage == Constants.Package.BASIC}
                                            // premium={this.state.currentPackage == Constants.Package.BASIC}
                                                     tips={i18next.t("nav.premium.toolTips")}/>
                                        <NavLevelTwo active={setActiveMenu(NAV.shopeeLinkProducts, this.state.active)}
                                                     name="component.navigation.linkProducts"
                                                     url={NAV_PATH.shopeeLinkProducts}
                                            // disable={this.state.currentPackage == Constants.Package.BASIC}
                                            // premium={this.state.currentPackage == Constants.Package.BASIC}
                                                     tips={i18next.t("nav.premium.toolTips")}/>
                                        <NavLevelTwo
                                            active={setActiveMenu(NAV.shopeeAccountManagement, this.state.active)}
                                            name="component.navigation.account.management"
                                            url={NAV_PATH.shopeeAccountManagement}
                                            // disable={this.state.currentPackage == Constants.Package.BASIC}
                                            // premium={this.state.currentPackage == Constants.Package.BASIC}
                                            tips={i18next.t("nav.premium.toolTips")}/>
                                        <NavLevelTwo active={setActiveMenu(NAV.shopeeSettings, this.state.active)}
                                                     name="component.navigation.account.settings"
                                                     url={NAV_PATH.shopeeSettings}
                                            // disable={this.state.currentPackage == Constants.Package.BASIC}
                                            // premium={this.state.currentPackage == Constants.Package.BASIC}
                                                     tips={i18next.t("nav.premium.toolTips")}/>
                                    </UikNavSection>
                                    :
                                    null
                            }
                        </PrivateComponent>

                        {/*LAZADA*/}
                        { CredentialUtils.checkStoreVND() &&
                            <PrivateComponent wrapperDisplay={"block"}
                                              hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0260]}
                                              allowUserEvents
                            >
                                <NavLevelOne active={setActiveMenu(NAV.lazada, this.state.active)}
                                             name="component.button.selector.saleChannel.lazada" url={NAV_PATH.lazada}
                                             noneHover
                                             iconComp={icoLazada}
                                             collapsible={this.props.collapsible}
                                             onClick={() => this.onClickCollapsibleMenu(NAV.lazada)}
                                             rightEl={this.renderCollapsibleIcon(NAV.lazada)}
                                             hiddenName={this.props.collapsedMenu}
                                />
                                {
                                    setActiveMenu(NAV.lazada, this.state.active) === 'active' ?
                                        <UikNavSection
                                            className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                            <NavLevelTwo active={setActiveMenu(NAV.lazadaAccount, this.state.active)}
                                                         name="component.navigation.account" url={NAV_PATH.lazadaAccount}
                                                // disable={this.state.currentPackage == Constants.Package.BASIC}
                                                // premium={this.state.currentPackage == Constants.Package.BASIC}
                                                         tips={i18next.t("nav.premium.toolTips")}
                                            />
                                            <NavLevelTwo hidden active={setActiveMenu(NAV.lazadaProduct, this.state.active)}
                                                         name="component.navigation.products" url={NAV_PATH.lazadaProduct}
                                                         beta
                                                // disable={this.state.currentPackage == Constants.Package.BASIC}
                                                // premium={this.state.currentPackage == Constants.Package.BASIC}
                                                         tips={i18next.t("nav.premium.toolTips")}
                                            />
                                        </UikNavSection>
                                        :
                                        null
                                }
                            </PrivateComponent>
                        }


                        {/*TIKI*/}


                        {/*<PrivateComponent wrapperDisplay={"block"} hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0340]}*/}
                        {/*                  allowUserEvents*/}
                        {/*>*/}
                        {/*    <NavLevelOne active={setActiveMenu(NAV.tiki, this.state.active)}*/}
                        {/*                 name="component.button.selector.saleChannel.tiki" url={NAV_PATH.tiki}*/}
                        {/*                 noneHover*/}
                        {/*                 iconComp={icoTiki}*/}
                        {/*                 collapsible={this.props.collapsible}*/}
                        {/*                 onClick={() => this.onClickCollapsibleMenu(NAV.tiki)}*/}
                        {/*                 rightEl={this.renderCollapsibleIcon(NAV.tiki)}*/}
                        {/*                 hiddenName={this.props.collapsedMenu}*/}
                        {/*    />*/}
                        {/*    {*/}
                        {/*        setActiveMenu(NAV.tiki, this.state.active) === 'active' ?*/}
                        {/*            <UikNavSection className={["nav-secondary-section", this.props.collapsedMenu? 'nav-secondary-section--closed':'nav-secondary-section--opened', this.state.onFirstLoad? "":"nav-secondary-section--ani"].join(' ')}>*/}
                        {/*                <NavLevelTwo active={setActiveMenu(NAV.tikiAccount, this.state.active)}*/}
                        {/*                             name="component.navigation.account" url={NAV_PATH.tikiAccount}*/}
                        {/*                             tips={i18next.t("nav.premium.toolTips")}*/}
                        {/*                />*/}
                        {/*                <NavLevelTwo active={setActiveMenu(NAV.tikiProduct, this.state.active)}*/}
                        {/*                             name="component.navigation.products" url={NAV_PATH.tikiProduct}*/}
                        {/*                             tips={i18next.t("nav.premium.toolTips")}*/}
                        {/*                />*/}
                        {/*            </UikNavSection>*/}
                        {/*            :*/}
                        {/*            null*/}
                        {/*    }*/}
                        {/*</PrivateComponent>*/}


                        {/*BEECOW/GOMUA*/}
                        { CredentialUtils.checkStoreVND() && (
                            <PrivateComponent wrapperDisplay={"block"}
                                              hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0264]}
                                              allowUserEvents
                            >
                                <NavLevelOne active={setActiveMenu(NAV.beecow, this.state.active)}
                                             name="component.button.selector.saleChannel.beecow"
                                             url={NAV_PATH.beecow}
                                             noneHover
                                             iconComp={icoBeecow}
                                             collapsible={this.props.collapsible}
                                             onClick={() => this.onClickCollapsibleMenu(NAV.beecow)}
                                             rightEl={CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM ?
                                                 this.renderCollapsibleIcon(NAV.beecow) : null}
                                             hiddenName={this.props.collapsedMenu}
                                             disable={CurrencyUtils.getLocalStorageCountry() !== Constants.CountryCode.VIETNAM}
                                />
                                {CurrencyUtils.getLocalStorageCountry() === Constants.CountryCode.VIETNAM &&
                                setActiveMenu(NAV.beecow, this.state.active) === 'active' ?
                                    <UikNavSection
                                        className={["nav-secondary-section", this.props.collapsedMenu ? 'nav-secondary-section--closed' : 'nav-secondary-section--opened', this.state.onFirstLoad ? "" : "nav-secondary-section--ani"].join(' ')}>
                                        <NavLevelTwo active={setActiveMenu(NAV.beecowAccount, this.state.active)}
                                                     name="component.navigation.account"
                                                     url={NAV_PATH.beecowAccount}/>
                                    </UikNavSection>
                                    :
                                    null
                                }
                            </PrivateComponent>
                        ) }

                    </UikNavSection>

                </PrivateComponent>

                <PrivateComponent wrapperDisplay={"block"} hasStaffPermission={STAFF_PERMISSIONS.SETTING}
                                  hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0268]}
                                  className="nav-section-setting"
                                  allowUserEvents
                >
                    <UikNavSection className="nav-section-setting">
                        {!this.props.collapsedMenu && <UikNavSection className="nav-section-seperate"/>}
                        <NavLevelOne active={setActiveMenu(NAV.settings, this.state.active)}
                                     name="component.navigation.settings"
                                     url={NAV_PATH.settings}
                                     iconComp={icoSetting}
                                     className=" mb-5 mb-md-0"
                                     hiddenName={this.props.collapsedMenu}
                        />
                    </UikNavSection>

                </PrivateComponent>
                <AlertModal ref={(el) => {
                    this.alertModal = el
                }}/>
            </UikNavPanel>
        );
    }
}

Navigation.defaultProps = {
    collapsible: false
}

export class NavLevelOne extends Component {

    constructor(props) {
        super(props);
        this.state = {
            active: this.props.active,
            name: this.props.name,
            url: this.props.url,
            rightEl: this.props.rightEl,
            icon: this.props.iconComp
        };

        this.onEnter = this.onEnter.bind(this);
        this.onLeave = this.onLeave.bind(this);
    }

    onEnter() {
        // if (!this.props.iconComp) return
        // if (this.state.active === '') {
        //     this.setState({
        //         icon: this.props.iconComp + '-act'
        //     })
        // }
    }

    onLeave() {
        // if (!this.props.iconComp) return
        // if (this.state.active === '') {
        //     this.setState({
        //         icon: this.props.iconComp
        //     })
        // }
    }

    render() {
        const {collapsible, iconComp, noneHover, hiddenName, ...other} = this.props
        if (this.props.disable) {
            return (
                <UikNavLink
                    {...other}
                    className={this.state.active + (this.props.premium ? ' nav-premium ' : ' ') + (this.props.className ? this.props.className : '')}>
                    <div className="nav-icon--none-hover"
                         style={{
                             backgroundImage: `url(${this.props.iconComp})`
                         }}
                    />
                    <span className="nav-level-1--disable">
                        <Trans className="uik-nav-link__nav-1-text" i18nKey={this.state.name}/>
                    </span>
                    {this.props.tips && <GSTooltip icon={GSTooltipIcon.INFO_CIRCLE} message={this.props.tips}
                                                   className="nav-level-tips nav-level-1--disable"/>}
                    {this.props.premium &&
                    <UikTag>
                        <Trans i18nKey="nav.premium"/>
                    </UikTag>}
                </UikNavLink>
            );
        }

        if (this.state.url && !this.props.collapsible) {
            return (
                <div className="nav-level-1"
                     title={this.props.hiddenName ? i18next.t(this.state.name) : ''}
                >
                    <UikNavLink
                        {...other}
                        className={this.state.active}
                        Component={Link} to={this.state.url}
                        rightEl={this.state.rightEl ? this.state.rightEl : null}
                    >
                        {this.props.iconComp &&
                        <div
                            className={[this.props.noneHover ? "nav-icon--none-hover" : "nav-icon", this.state.active ? 'nav-icon--active' : '', this.props.iconClassName].join(' ')}
                            style={{
                                backgroundImage: `url(${this.props.iconComp})`
                            }}
                        />
                        }
                        <span
                            className={["uik-nav-link__nav-1-text", this.props.hiddenName ? 'uik-nav-link__nav-1-text--closed' : 'uik-nav-link__nav-1-text--opened'].join(' ')}>
                                <Trans i18nKey={this.state.name}/>
                            </span>
                    </UikNavLink>
                </div>
            );
        } else {
            return (
                <div className="nav-level-1"
                     title={this.props.hiddenName && i18next.t(this.state.name)}
                     {...other}>
                    <UikNavLink className={[this.state.active, 'collapsible-menu']}
                                rightEl={this.state.rightEl ? this.state.rightEl : null}
                    >
                        {this.props.iconComp &&
                        <div
                            className={[this.props.noneHover ? "nav-icon--none-hover" : "nav-icon", this.state.active ? 'nav-icon--active' : '', this.props.iconClassName].join(' ')}
                            style={{
                                backgroundImage: `url(${this.props.iconComp})`
                            }}
                        />
                        }
                        <span
                            className={["uik-nav-link__nav-1-text", this.props.hiddenName ? 'uik-nav-link__nav-1-text--closed' : 'uik-nav-link__nav-1-text--opened'].join(' ')}>
                                <Trans i18nKey={this.state.name}/>
                            </span>
                    </UikNavLink>
                </div>
            );
        }
    }

}


NavLevelOne.propTypes = {
    active: PropTypes.any,
    disable: PropTypes.bool,
    iconClassName: PropTypes.string,
    iconComp: PropTypes.string,
    name: PropTypes.any,
    noneHover: PropTypes.bool,
    premium: PropTypes.any,
    rightEl: PropTypes.any,
    tips: PropTypes.string,
    url: PropTypes.any,
    collapsible: PropTypes.bool,
    hiddenName: PropTypes.bool,
}


export class NavLevelTwo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            active: this.props.active,
            name: this.props.name,
            url: this.props.url
        };

        // console.log(props.disable, props.premium)
        this.renderLink = this.renderLink.bind(this);
    }

    renderLink(innerProps){
        if(this.props.newTabs){
            return <Link to={this.state.url} target={'_blank'} {...innerProps}></Link>
        }else {
            return <Link to={this.state.url} {...innerProps}></Link>
        }
    }

    render() {
        const {...other} = this.props;
        if (this.props.disable) {
            return (
                <UikNavLinkSecondary
                    className={this.state.active + (this.props.premium ? ' nav-premium' : '')}
                    {...other}>
                    <span className="nav-level-1--disable">
                        <Trans i18nKey={this.state.name}/>
                    </span>
                    {this.props.premium &&
                    <GSComponentTooltip message={this.props.tips} placement={GSComponentTooltipPlacement.TOP}>
                        <UikTag>
                            <Trans i18nKey="nav.premium"/>
                        </UikTag>
                    </GSComponentTooltip>}
                </UikNavLinkSecondary>
            );
        }

        if (this.state.url) {
            return (
                <UikNavLinkSecondary
                    className={this.state.active + (this.props.beta ? ' nav-beta' : '')}
                    Component={this.renderLink}
                    {...other} >
                    <span>
                        <Trans i18nKey={this.state.name}/>
                    </span>
                    {this.props.beta &&
                    <UikTag>
                        <Trans i18nKey="nav.beta"/>
                    </UikTag>}
                </UikNavLinkSecondary>
            );
        } else {
            return (
                <UikNavLinkSecondary
                    className={this.state.active}
                >
                    <Trans i18nKey={this.state.name}/>

                </UikNavLinkSecondary>
            );
        }
    }

}

NavLevelTwo.propTypes = {
    active: PropTypes.any,
    name: PropTypes.any,
    url: PropTypes.any,
    disable: PropTypes.bool,
    beta: PropTypes.bool,
    premium: PropTypes.bool,
    tips: PropTypes.string,
    newTabs: PropTypes.bool
};


function mapStateToProps(state) {
    return {
        collapsedMenu: state.collapsedMenu
    }
}


export default connect(mapStateToProps)(Navigation);
