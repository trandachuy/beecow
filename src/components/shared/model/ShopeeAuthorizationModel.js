/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 22/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";

export default class ShopeeAuthorizationModel {
    id;
    bcStoreId;
    shopeeId;
    branchId;
    authCode;
    reAuth;

    constructor(bcStoreId, shopeeId, branchId, authCode, id, reAuth = false) {
        this.id = id;
        this.bcStoreId = bcStoreId;
        this.shopeeId = shopeeId;
        this.branchId = branchId;
        this.authCode = authCode;
        this.reAuth = reAuth;
    }
}
ShopeeAuthorizationModel.propTypes = {
    id: PropTypes.number,
    bcStoreId: PropTypes.number,
    shopeeId: PropTypes.number,
    branchId: PropTypes.number,
    authCode: PropTypes.string
};
