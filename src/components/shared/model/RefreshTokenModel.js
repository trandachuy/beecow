/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import PropTypes from "prop-types";

export default class RefreshTokenModel {
    refreshToken;
    forceGosellStore = true;

    constructor(refreshToken) {
        this.refreshToken = refreshToken;
    }
}

RefreshTokenModel.propTypes = {
    refreshToken    : PropTypes.string,
    forceGosellStore: PropTypes.bool
};
