/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";
import {ShopeeShopImageModel} from "./index";

export default class ShopeeShopModel {
    bcStoreId;
    id;
    images;
    shopId;
    shopName;
    status;

    constructor(bcStoreId, id, images, shopId, shopName, status) {
        this.bcStoreId = bcStoreId;
        this.id = id;
        this.images = images;
        this.shopId = shopId;
        this.shopName = shopName;
        this.status = status;
    }
}
ShopeeShopModel.propTypes = {
    bcStoreId: PropTypes.number,
    id:        PropTypes.number,
    images:    PropTypes.arrayOf(PropTypes.instanceOf(ShopeeShopImageModel)),
    shopId:    PropTypes.number,
    shopName:  PropTypes.string,
    status:    PropTypes.string
};
