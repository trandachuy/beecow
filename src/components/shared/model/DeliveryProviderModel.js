/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";

export default class DeliveryProvider {
    allowedLocations;
    providerName;
    storeId;

    constructor(allowedLocations, providerName, storeId) {
        this.allowedLocations = allowedLocations;
        this.providerName = providerName;
        this.storeId = storeId;
    }
}
DeliveryProvider.propTypes = {
    allowedLocations: PropTypes.arrayOf(PropTypes.string),
    providerName: PropTypes.string,
    storeId: PropTypes.number
};