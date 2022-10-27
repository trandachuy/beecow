/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import {AddressModel, BannerModel, LogoModel} from "./index";
import PropTypes from "prop-types";

export default class ShopInfoModel {
    banners;
    categoryIds;
    logos;
    name;
    url;
    storeType;
    contactNumber;
    pageAddress;
    email;
    ownerId;
    id;
    referralCode;
    agencyCode;
    domain;
    defaultLanguage;

    constructor(banners, categoryIds, logos, name, url, storeType, contactNumber, pageAddress, email, ownerId, id, referralCode, agencyCode, domain, defaultLanguage) {
        this.banners = banners;
        this.categoryIds = categoryIds;
        this.logos = logos;
        this.name = name;
        this.url = url;
        this.storeType = storeType;
        this.contactNumber = contactNumber;
        this.pageAddress = pageAddress;
        this.email = email;
        this.ownerId = ownerId;
        this.id = id;
        this.referralCode = referralCode;
        this.agencyCode = agencyCode;
        this.domain = domain;
        this.defaultLanguage = defaultLanguage;
    }
}

ShopInfoModel.propTypes = {
    banners:       PropTypes.arrayOf(BannerModel),
    categoryIds:   PropTypes.arrayOf(PropTypes.number),
    logos:         PropTypes.instanceOf(LogoModel),
    name:          PropTypes.string,
    url:           PropTypes.string,
    storeType:     PropTypes.string,
    contactNumber: PropTypes.string,
    pageAddress:   PropTypes.instanceOf(AddressModel),
    email:         PropTypes.string,
    ownerId:       PropTypes.number,
    id:            PropTypes.number,
    referralCode:  PropTypes.string,
    agencyCode:    PropTypes.string,
    domain:        PropTypes.string,
    defaultLanguage:        PropTypes.string
};

