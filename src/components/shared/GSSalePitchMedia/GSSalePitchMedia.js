/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/02/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {NAV_PATH} from "../../layout/navigation/Navigation";
import {useHistory} from "react-router-dom";
import ReactDOM from 'react-dom';
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import './GSSalePitchMedia.sass';
import {CredentialUtils} from '../../../utils/credential'

const GSSalePitchMedia = props => {
    const history = useHistory();
    const [isClose, setIsClose] = React.useState(false);

    const openActivationPlans = () => {
        history.push(NAV_PATH.settingsPlans)
    }

    const handleCloseModal = (e) => {
        setIsClose(true);
        destroyOverlay();
    }

    const destroyOverlay = () => {
        let parent = document.getElementsByClassName('layout__overlay');
        if(parent && parent.length > 0) {
            let reactNode = ReactDOM.findDOMNode(parent[0]);
            ReactDOM.unmountComponentAtNode(reactNode);
            reactNode.remove();
        }
    }

    const generateIframeId = (videUrl) => {
        var hash = 0, i, chr, len;
        if (this.length === 0) return hash;
        for (i = 0, len = this.length; i < len; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    const mediaContent = ({title, videoUrl, description}) => {
        let hasCloseButton = props.code.hasClose;
        let srcVideo = `${videoUrl}?controls=0&autoplay=1&loop=1`;
        const iFrameId = generateIframeId(videoUrl);
        //create content layout for sale pitch
        return (
            <div className="gs-sale-pitch_content">
                { hasCloseButton === true?
                    (<span onClick={(e) => handleCloseModal(e)} className="gs-sale-pitch_closed"></span>):<span/>
                }
                <div className="gs-sale-pitch_media-header">
                    <h4 class="modal-title">
                        { title }
                    </h4>
                </div>
                <div className="gs-sale-pitch_media-content">
                    <iframe id={iFrameId} src={srcVideo} frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen className="gs-sale-pitch_video">
                    </iframe>
                </div>
                <div className="gs-sale-pitch_media-description">
                    <p>
                    { description }
                    </p>
                </div>
                <div className="gs-sale-pitch_activate-button">
                    <button onClick={(e) => openActivationPlans(e)}>
                        {<Trans i18nKey="component.marketing.sales.pitch.activate.button.text"></Trans>}
                    </button>
                </div>
            </div>
        );
    }

    const getParams = () => {
        let params = {
            title: "",
            videoUrl: "",
            description: ""
        };
        switch (props.path) {
            // HOME
            case NAV_PATH.home:
                return params;
            // LIVE CHAT
            case NAV_PATH.liveChat.ROOT:
            case NAV_PATH.liveChat.PATH_LIVE_CHAT_INTRO:
            case NAV_PATH.goSocial.ROOT:
            case NAV_PATH.goSocial.PATH_GOSOCIAL_INTRO:
            case NAV_PATH.goSocial.PATH_GOSOCIAL_CONVERSATION:
            case NAV_PATH.goSocial.PATH_GOSOCIAL_CONFIGURATION:
            case NAV_PATH.goSocial.PATH_GOSOCIAL_AUTOMATION:
                return {
                    title: i18next.t("component.marketing.sales.pitch.gochat.FACEBOOK.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.gochat.FACEBOOK.link"),
                    description: i18next.t("component.marketing.sales.pitch.gochat.FACEBOOK.desc")
                };
            case NAV_PATH.liveChat.PATH_ZALO_CHAT_INTRO:
            case NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_INTRO:
            case NAV_PATH.goSocial.PATH_GOSOCIAL_ZALO_CHAT_CONVERSATION:
                return {
                    title: i18next.t("component.marketing.sales.pitch.gochat.ZALO.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.gochat.ZALO.link"),
                    description: i18next.t("component.marketing.sales.pitch.gochat.ZALO.desc")
                };
            case NAV_PATH.liveChat.PATH_LIVE_CHAT_CONFIGURATION:
                return {
                    title: i18next.t("component.marketing.sales.pitch.CHAT_CONFIGURATION.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.CHAT_CONFIGURATION.link"),
                    description: i18next.t("component.marketing.sales.pitch.CHAT_CONFIGURATION.desc")
                };
            // PRODUCTS
            case NAV_PATH.products:
            case NAV_PATH.productCreate:
            case NAV_PATH.productEdit + "/:itemId":
                return params;
            // SERVICES
            case NAV_PATH.services:
            case NAV_PATH.serviceCreate:
            case NAV_PATH.serviceEdit + "/:itemId":
                return {
                    title: i18next.t("component.marketing.sales.pitch.CREATE_SERVICE.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.CREATE_SERVICE.link"),
                    description: i18next.t("component.marketing.sales.pitch.CREATE_SERVICE.desc")
                };
            // COLLECTIONS
            case NAV_PATH.collections:
            case NAV_PATH.collectionCreate + '/:itemType':
            case NAV_PATH.collectionEdit + "/:itemType/:itemId":
                return {
                    title: i18next.t("component.marketing.sales.pitch.PRODUCT_COLLECTION.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.PRODUCT_COLLECTION.link"),
                    description: i18next.t("component.marketing.sales.pitch.PRODUCT_COLLECTION.desc")
                };
            case NAV_PATH.collectionsService:
                return {
                    title: i18next.t("component.marketing.sales.pitch.SERVICE_COLLECTION.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.SERVICE_COLLECTION.link"),
                    description: i18next.t("component.marketing.sales.pitch.SERVICE_COLLECTION.desc")
                };
            case NAV_PATH.collectionServiceCreate + '/:itemType':
            case NAV_PATH.collectionServiceEdit + "/:itemType/:itemId":
                return params;
            // PRODUCT REVIEW
            case NAV_PATH.reviewProduct:
                return {
                    title: i18next.t("component.marketing.sales.pitch.PRODUCT_REVIEW.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.PRODUCT_REVIEW.link"),
                    description: i18next.t("component.marketing.sales.pitch.PRODUCT_REVIEW.desc")
                };
            // ORDER
            case NAV_PATH.orders:
                return {
                    title: i18next.t("component.marketing.sales.pitch.CREATE_ORDERS.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.CREATE_ORDERS.link"),
                    description: i18next.t("component.marketing.sales.pitch.CREATE_ORDERS.desc")
                };
            case NAV_PATH.orderDetail + '/:siteCode/:orderId':
            case NAV_PATH.orderPrint + '/:siteCode/:orderId':
            case NAV_PATH.orderPrintReceipt + '/:siteCode/:orderId':
                return params;
            case NAV_PATH.orderInStorePurchase:
                return params;
            // RESERVATION
            case NAV_PATH.reservations:
            case NAV_PATH.reservationDetail + '/:reservationId':
                return {
                    title: i18next.t("component.marketing.sales.pitch.RESERVATION_MANAGEMENT.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.RESERVATION_MANAGEMENT.link"),
                    description: i18next.t("component.marketing.sales.pitch.RESERVATION_MANAGEMENT.desc")
                };
            // DISCOUNT
            case NAV_PATH.discounts:
            case NAV_PATH.discounts.DISCOUNTS_CREATE + '/:discountsType':
                return {
                    title: i18next.t("component.marketing.sales.pitch.PROMOTION_LIST.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.PROMOTION_LIST.link"),
                    description: i18next.t("component.marketing.sales.pitch.PROMOTION_LIST.desc")
                };
            // FLASH SALE
            case NAV_PATH.discounts.FLASHSALE_INTRO:
                return {
                    title: i18next.t("component.marketing.sales.pitch.FLASH_SALE.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.FLASH_SALE.link"),
                    description: i18next.t("component.marketing.sales.pitch.FLASH_SALE.desc")
                };
            case NAV_PATH.discounts.DISCOUNTS_DETAIL + "/:discountsType/:itemId":
            case NAV_PATH.discounts.DISCOUNTS_EDIT + "/:discountsType/:itemId":
                return params;
            // CUSTOMER
            case NAV_PATH.customers.ROOT:
            case NAV_PATH.customers.CUSTOMERS_LIST:
                return {
                    title: i18next.t("component.marketing.sales.pitch.CUSTOMER.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.CUSTOMER.link"),
                    description: i18next.t("component.marketing.sales.pitch.CUSTOMER.desc")
                };
            case NAV_PATH.customers.CUSTOMERS_EDIT + '/:customerId/:userId/:saleChannel':
                return params;
            case NAV_PATH.customers.SEGMENT_LIST:
                return {
                    title: i18next.t("component.marketing.sales.pitch.CREATE_SEGMENTS.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.CREATE_SEGMENTS.link"),
                    description: i18next.t("component.marketing.sales.pitch.CREATE_SEGMENTS.desc")
                };
            case NAV_PATH.customers.SEGMENT_CREATE:
            case NAV_PATH.customers.SEGMENT_EDIT + '/:segmentId':
                //should clairify  allow created or not
                return {
                    title: i18next.t("component.marketing.sales.pitch.CREATE_SEGMENTS.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.CREATE_SEGMENTS.link"),
                    description: i18next.t("component.marketing.sales.pitch.CREATE_SEGMENTS.desc")
                };
            // ANALYTICS
            case NAV_PATH.analytics.ROOT:
            case NAV_PATH.analytics.ORDERS:
                return {
                    title: i18next.t("component.marketing.sales.pitch.ANALYTICS_ORDER.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.ANALYTICS_ORDER.link"),
                    description: i18next.t("component.marketing.sales.pitch.ANALYTICS_ORDER.desc")
                };
            case NAV_PATH.analytics.RESERVATIONS:
                return {
                    title: i18next.t("component.marketing.sales.pitch.ANALYTICS_RESERVATION.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.ANALYTICS_RESERVATION.link"),
                    description: i18next.t("component.marketing.sales.pitch.ANALYTICS_RESERVATION.desc")
                };
            // MARKETING
            case NAV_PATH.marketing.ROOT:
            case NAV_PATH.marketing.LANDING_PAGE:
                return {
                    title: i18next.t("component.marketing.sales.pitch.LANDING_PAGE.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.LANDING_PAGE.link"),
                    description: i18next.t("component.marketing.sales.pitch.LANDING_PAGE.desc")
                };
            case NAV_PATH.marketing.LANDING_PAGE_CREATE:
            case NAV_PATH.marketing.BUY_LINK_INTRO:
                return {
                    title: i18next.t("component.marketing.sales.pitch.BUY_LINK.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.BUY_LINK.link"),
                    description: i18next.t("component.marketing.sales.pitch.BUY_LINK.desc")
                }
            case NAV_PATH.marketing.AUTOMATED_ADS:
                return params;
            case NAV_PATH.marketing.NOTIFICATION:
            case NAV_PATH.marketing.NOTIFICATION_INTRO:
                return {
                    title: i18next.t("component.marketing.sales.pitch.NOTIFICATION.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.NOTIFICATION.link"),
                    description: i18next.t("component.marketing.sales.pitch.NOTIFICATION.desc")
                };
            case NAV_PATH.marketing.NOTIFICATION_DETAIL + '/:notificationId':
            case NAV_PATH.marketing.NOTIFICATION_EMAIL_CREATE:
            case NAV_PATH.marketing.NOTIFICATION_PUSH_CREATE:
                return params;
            case NAV_PATH.marketing.LOYALTY_LIST:
                return {
                    title: i18next.t("component.marketing.sales.pitch.LOYALTY.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.LOYALTY.link"),
                    description: i18next.t("component.marketing.sales.pitch.LOYALTY.desc")
                };
            case NAV_PATH.marketing.LOYALTY_EDIT + "/:itemId":
            case NAV_PATH.marketing.LOYALTY_CREATE:
                return params;
            case NAV_PATH.marketing.EMAIL:
                return {
                    title: i18next.t("component.marketing.sales.pitch.EMAIL.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.EMAIL.link"),
                    description: i18next.t("component.marketing.sales.pitch.EMAIL.desc")
                };
            case NAV_PATH.marketing.GOOGLE_ANALYTICS:
                return {
                    title: i18next.t("component.marketing.sales.pitch.GOOGLE_ANALYTICS.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.GOOGLE_ANALYTICS.link"),
                    description: i18next.t("component.marketing.sales.pitch.GOOGLE_ANALYTICS.desc")
                };
            case NAV_PATH.marketing.GOOGLE_SHOPPING:
                return {
                    title: i18next.t("component.marketing.sales.pitch.PREFERENCES.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.PREFERENCES.link"),
                    description: i18next.t("component.marketing.sales.pitch.PREFERENCES.desc")
                };
            case NAV_PATH.marketing.FACEBOOK_PIXEL:
                return {
                    title: i18next.t("component.marketing.sales.pitch.FACEBOOK_PIXEL.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.FACEBOOK_PIXEL.link"),
                    description: i18next.t("component.marketing.sales.pitch.FACEBOOK_PIXEL.desc")
                };
            // SALE CHANNEL - STOREFRONT
            case NAV_PATH.customization:
            case NAV_PATH.customizationDesign:
                return params;
            case NAV_PATH.pages:
            case NAV_PATH.pagesCreate:
            case NAV_PATH.pagesEdit + "/:itemId":
                return {
                    title: i18next.t("component.marketing.sales.pitch.PAGES.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.PAGES.link"),
                    description: i18next.t("component.marketing.sales.pitch.PAGES.desc")
                };
            case NAV_PATH.customPages:
            case NAV_PATH.createCustomPage:
            case NAV_PATH.editCustomPage + "/:itemId":
                return {
                    title: i18next.t("component.marketing.sales.pitch.PAGES.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.PAGES.link"),
                    description: i18next.t("component.marketing.sales.pitch.PAGES.desc")
                };
            case NAV_PATH.blog:
                return {
                    title: i18next.t("component.marketing.sales.pitch.BLOG.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.BLOG.link"),
                    description: i18next.t("component.marketing.sales.pitch.BLOG.desc")
                };
            case NAV_PATH.menu:
            case NAV_PATH.menuAdd:
            case NAV_PATH.menuEdit:
                return {
                    title: i18next.t("component.marketing.sales.pitch.MENU.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.MENU.link"),
                    description: i18next.t("component.marketing.sales.pitch.MENU.desc")
                };
            case NAV_PATH.domains:
                return {
                    title: i18next.t("component.marketing.sales.pitch.SUBDOMAIN.title"),
                    videoUrl: i18next.t("component.marketing.sales.pitch.SUBDOMAIN.link"),
                    description: i18next.t("component.marketing.sales.pitch.SUBDOMAIN.desc")
                };
            // SHOPEE - LAZADA - BEECOW
            case NAV_PATH.shopeeAccount:
            case NAV_PATH.shopeeProduct:
            case NAV_PATH.shopeeProduct + "/:itemId":
            case NAV_PATH.shopeeEditProduct + "/:itemId":
            case NAV_PATH.lazadaAccount:
            case NAV_PATH.lazadaProduct:
            case NAV_PATH.beecowAccount:
                return params;
            // SETTING & UPGRADE
            case NAV_PATH.settings:
            case NAV_PATH.settingsPlans:
            case NAV_PATH.paymentCallback:
            case NAV_PATH.upgradeInChannel:
                return params;
            default:
                return params;
        }
    }

    if(props.code.isShow === true && !CredentialUtils.isStoreXxxOrGoSell()) {
        const oParams = getParams();
        return (
            (<div className="w-100 h-100 justify-content-center gs-sale-pitch w-auto">
                {mediaContent(oParams)}
            </div>)
        )
    }
    return null;
};

GSSalePitchMedia.propTypes = {
    path: PropTypes.string,
    code: PropTypes.object,
};

export default GSSalePitchMedia;
