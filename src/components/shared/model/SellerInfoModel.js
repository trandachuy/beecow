/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/4/2019
 * Author: Long Phan <email: long.phan@mediastep.com>
 */


import PropTypes from 'prop-types';

export default class SellerInfoModel {

    constructor(sellerId, nameCompany, name, shortCode, logoUrl, email, cb) {
        this.sellerId = sellerId;
        this.nameCompany = nameCompany;
        this.name = name;
        this.shortCode = shortCode;
        this.logoUrl = logoUrl;
        this.email = email;
        this.cb = cb;
    }
}
