/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import PropTypes from "prop-types";

export default class LogoModel {
    applogoImageId;
    applogoUrlPrefix;
    appLogo;
    faviconImageId;
    faviconUrlPrefix;
    faviconLogo;
    shoplogoImageId;
    shoplogoUrlPrefix;
    shopLogo;
    splashImageId;
    splashUrlPrefix;
    splashImage;
    storeId;
    shoplogoImageExtension;
    faviconImageExtension;
    applogoImageExtension;
    splashImageExtension;

    constructor(applogoImageId, applogoUrlPrefix, appLogo, faviconImageId, faviconUrlPrefix, faviconLogo, shoplogoImageId, shoplogoUrlPrefix, shopLogo,
                splashImageId, splashUrlPrefix, splashImage, storeId, shoplogoImageExtension, faviconImageExtension, applogoImageExtension, splashImageExtension) {
        this.applogoImageId = applogoImageId;
        this.applogoUrlPrefix = applogoUrlPrefix;
        this.appLogo = appLogo;
        this.faviconImageId = faviconImageId;
        this.faviconUrlPrefix = faviconUrlPrefix;
        this.faviconLogo = faviconLogo;
        this.shoplogoImageId = shoplogoImageId;
        this.shoplogoUrlPrefix = shoplogoUrlPrefix;
        this.shopLogo = shopLogo;
        this.splashImageId = splashImageId;
        this.splashUrlPrefix = splashUrlPrefix;
        this.splashImage = splashImage;
        this.storeId = storeId;
        this.shoplogoImageExtension = shoplogoImageExtension;
        this.faviconImageExtension = faviconImageExtension;
        this.applogoImageExtension = applogoImageExtension;
        this.splashImageExtension = splashImageExtension;

    }
}

LogoModel.propTypes = {
    applogoImageId: PropTypes.number,
    applogoUrlPrefix: PropTypes.string,
    appLogo: PropTypes.string,
    faviconImageId: PropTypes.number,
    faviconUrlPrefix: PropTypes.string,
    faviconLogo: PropTypes.string,
    shoplogoImageId: PropTypes.number,
    shoplogoUrlPrefix: PropTypes.string,
    shopLogo: PropTypes.string,
    splashImageId: PropTypes.number,
    splashUrlPrefix: PropTypes.string,
    splashImage: PropTypes.string,
    storeId: PropTypes.number
};
