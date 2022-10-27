import {PACKAGE_FEATURE_CODES} from "./package-features";
import {NavigationPath} from "./NavigationPath";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/07/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

export const RouterPermissions = (route) => {
    switch (route) {
        // HOME
        case NavigationPath.home:
            return [PACKAGE_FEATURE_CODES.FEATURE_0100];
        // LIVE CHAT
        case NavigationPath.liveChat.ROOT:
        case NavigationPath.liveChat.PATH_LIVE_CHAT_INTRO:
        case NavigationPath.liveChat.PATH_LIVE_CHAT_CONVERSATION:
        case NavigationPath.liveChat.PATH_ZALO_CHAT_CONVERSATION:
        case NavigationPath.liveChat.PATH_ZALO_CHAT_INTRO:
        case NavigationPath.liveChat.PATH_LIVE_CHAT_CONFIGURATION:
            return [PACKAGE_FEATURE_CODES.FEATURE_0106];
        // PRODUCTS
        case NavigationPath.products:
        case NavigationPath.productCreate:
        case NavigationPath.productEdit + "/:itemId":
        case NavigationPath.variationDetailEdit:
            return [PACKAGE_FEATURE_CODES.FEATURE_0108];
        case NavigationPath.transferStock:
        case NavigationPath.transferStockCreate:
        case NavigationPath.transferStockEdit:
        case NavigationPath.transferStockWizard:
            return [PACKAGE_FEATURE_CODES.FEATURE_0108, PACKAGE_FEATURE_CODES.POS_PACKAGE]
        case NavigationPath.supplier:
            return [PACKAGE_FEATURE_CODES.POS_PACKAGE]
        case NavigationPath.purchaseOrder:
            return [PACKAGE_FEATURE_CODES.POS_PACKAGE]
        // SERVICES
        case NavigationPath.services:
        case NavigationPath.serviceCreate:
        case NavigationPath.serviceEdit + "/:itemId":
            return [PACKAGE_FEATURE_CODES.FEATURE_0110];
        // COLLECTIONS
        case NavigationPath.collections:
        case NavigationPath.collectionCreate + '/:itemType':
        case NavigationPath.collectionEdit + "/:itemType/:itemId":
            return [PACKAGE_FEATURE_CODES.FEATURE_0111];
        // PRODUCT REVIEW
        case NavigationPath.reviewProduct:
            return [PACKAGE_FEATURE_CODES.FEATURE_0112];
        // ORDER
        case NavigationPath.orders:
        case NavigationPath.orderDetail + '/:siteCode/:orderId':
        case NavigationPath.orderPrint + '/:siteCode/:orderId':
        case NavigationPath.orderPrintReceipt + '/:siteCode/:orderId':
            return [PACKAGE_FEATURE_CODES.FEATURE_0113];
        case NavigationPath.orderInStorePurchase:
            return [PACKAGE_FEATURE_CODES.FEATURE_0114, PACKAGE_FEATURE_CODES.POS_PACKAGE];
        case NavigationPath.quotation:
            return [PACKAGE_FEATURE_CODES.WEB_PACKAGE,PACKAGE_FEATURE_CODES.APP_PACKAGE,PACKAGE_FEATURE_CODES.POS_PACKAGE];
        // RESERVATION
        case NavigationPath.reservations:
        case NavigationPath.reservationDetail + '/:reservationId':
            return [PACKAGE_FEATURE_CODES.FEATURE_0116];
        // DISCOUNT
        case NavigationPath.discounts:
        case NavigationPath.discounts.DISCOUNTS_DETAIL + "/:discountsType/:itemId":
        case NavigationPath.discounts.DISCOUNTS_CREATE + '/:discountsType':
        case NavigationPath.discounts.DISCOUNTS_EDIT + "/:discountsType/:itemId":
            return [PACKAGE_FEATURE_CODES.FEATURE_0117];
        // FLASH SALE
        case NavigationPath.discounts.FLASHSALE_INTRO:
            return [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE];
        // CUSTOMER
        case NavigationPath.customers.ROOT:
        case NavigationPath.customers.CUSTOMERS_LIST:
        case NavigationPath.customers.CUSTOMERS_EDIT + '/:customerId/:userId/:saleChannel':
            return [PACKAGE_FEATURE_CODES.FEATURE_0130];
        case NavigationPath.customers.SEGMENT_LIST:
        case NavigationPath.customers.SEGMENT_CREATE:
        case NavigationPath.customers.SEGMENT_EDIT + '/:segmentId':
            return [PACKAGE_FEATURE_CODES.FEATURE_0133];
        // ANALYTICS
        case NavigationPath.analytics.ROOT:
        case NavigationPath.analytics.ORDERS:
            return [PACKAGE_FEATURE_CODES.FEATURE_0160];
        case NavigationPath.analytics.RESERVATIONS:
            return [PACKAGE_FEATURE_CODES.FEATURE_0161];
        // MARKETING
        case NavigationPath.marketing.ROOT:
        case NavigationPath.marketing.LANDING_PAGE:
        case NavigationPath.marketing.LANDING_PAGE_CREATE:
        case NavigationPath.marketing.LANDING_PAGE_EDIT + '/:landingPageId':
            return [PACKAGE_FEATURE_CODES.FEATURE_0100];
        //BUY LINK
        case NavigationPath.marketing.BUY_LINK_INTRO:
            return [PACKAGE_FEATURE_CODES.FEATURE_0162];
        case NavigationPath.marketing.AUTOMATED_ADS:
        case NavigationPath.marketing.NOTIFICATION:
        case NavigationPath.marketing.NOTIFICATION_INTRO:
        case NavigationPath.marketing.NOTIFICATION_DETAIL + '/:notificationId':
            return [PACKAGE_FEATURE_CODES.FEATURE_0163];
        case NavigationPath.marketing.NOTIFICATION_EMAIL_CREATE:
        case NavigationPath.marketing.EMAIL:
        case NavigationPath.marketing.EMAIL_EDIT + '/:id':
        case NavigationPath.marketing.EMAIL_CREATE:
            return [PACKAGE_FEATURE_CODES.FEATURE_0165];
        case NavigationPath.marketing.NOTIFICATION_PUSH_CREATE:
            return [PACKAGE_FEATURE_CODES.FEATURE_0166];
        case NavigationPath.marketing.LOYALTY_LIST:
        case NavigationPath.marketing.LOYALTY_EDIT + "/:itemId":
        case NavigationPath.marketing.LOYALTY_CREATE:
            return [PACKAGE_FEATURE_CODES.FEATURE_0167];
        case NavigationPath.marketing.GOOGLE_ANALYTICS:
            return [PACKAGE_FEATURE_CODES.FEATURE_0255];
        case NavigationPath.marketing.GOOGLE_SHOPPING:
            return [PACKAGE_FEATURE_CODES.FEATURE_0353];
        case NavigationPath.marketing.FACEBOOK_PIXEL:
            return [PACKAGE_FEATURE_CODES.FEATURE_0253, PACKAGE_FEATURE_CODES.FEATURE_0254];
        // SALE CHANNEL - STOREFRONT
        case NavigationPath.customization:
        case NavigationPath.customizationDesign:
            return [PACKAGE_FEATURE_CODES.FEATURE_0183];
        case NavigationPath.blog:
            return [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]
        case NavigationPath.articleEdit:
        case NavigationPath.articleCreate:
            return [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE]
        case NavigationPath.pages:
        case NavigationPath.pagesCreate:
        case NavigationPath.pagesEdit + "/:itemId":
            return [PACKAGE_FEATURE_CODES.FEATURE_0247];
        case NavigationPath.menu:
        case NavigationPath.menuAdd:
        case NavigationPath.menuEdit:
            return [PACKAGE_FEATURE_CODES.FEATURE_0249];
        case NavigationPath.domains:
            return [PACKAGE_FEATURE_CODES.FEATURE_0250];
        case NavigationPath.saleChannel.storefront.preferences:
            return [PACKAGE_FEATURE_CODES.FEATURE_0106];
        // SHOPEE - LAZADA - BEECOW
        case NavigationPath.shopeeAccount:
        case NavigationPath.shopeeProduct:
        case NavigationPath.shopeeProduct + "/:itemId":
        case NavigationPath.shopeeEditProduct + "/:itemId":
            return [PACKAGE_FEATURE_CODES.FEATURE_0256];
        case NavigationPath.lazadaAccount:
        case NavigationPath.lazadaProduct:
            return [PACKAGE_FEATURE_CODES.FEATURE_0260];
        case NavigationPath.beecowAccount:
            return [PACKAGE_FEATURE_CODES.FEATURE_0264];
        // SETTING & UPGRADE
        case NavigationPath.settings:
        case NavigationPath.settingsPlans:
        case NavigationPath.paymentCallback:
        case NavigationPath.upgradeInChannel:
            return [PACKAGE_FEATURE_CODES.FEATURE_0268];
        case NavigationPath.callCenter.ROOT:
        case NavigationPath.callCenter.PATH_CALL_CENTER_HISTORY_LIST:
        case NavigationPath.callCenter.PATH_CALL_CENTER_INTRO:
            return [PACKAGE_FEATURE_CODES.FEATURE_0130];
        default:
            return undefined;
    }
}