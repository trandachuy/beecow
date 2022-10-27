/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/4/2019
 * Author: Long Phan <email: long.phan@mediastep.com>
 */

export default class CountryUserInfoModel {
    
    constructor(country, user_id, seller_id, short_code) {
        this.country = country;
        this.user_id = user_id;
        this.seller_id = seller_id;
        this.short_code = short_code;
    }
}
