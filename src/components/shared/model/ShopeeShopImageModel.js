/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";

export default class ShopeeShopImageModel {
    id;
    shopId;
    url;

    constructor(id, shopId, url) {
        this.id = id;
        this.shopId = shopId;
        this.url = url;
    }
}
ShopeeShopImageModel.propTypes = {
    id:     PropTypes.number,
    shopId: PropTypes.number,
    url:    PropTypes.string
};
