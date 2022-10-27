/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */


import PropTypes from "prop-types";

export default class AddressModel {
    id;
    address;
    cityCode;
    districtCode;
    wardCode;
    storeId;
    address2;
    countryCode;
    currencyCode;
    cityName;
    zipCode;

    constructor(id, address, cityCode, districtCode, wardCode, storeId, address2, countryCode, currencyCode, cityName, zipCode) {
        this.id = id;
        this.address = address;
        this.cityCode = cityCode;
        this.districtCode = districtCode;
        this.wardCode = wardCode;
        this.storeId = storeId;
        this.address2 = address2;
        this.countryCode = countryCode;
        this.currencyCode = currencyCode;
        this.cityName = cityName;
        this.zipCode = zipCode;
    }
}
AddressModel.propTypes = {
    id: PropTypes.number,
    address: PropTypes.string,
    cityCode: PropTypes.string,
    districtCode: PropTypes.string,
    wardCode: PropTypes.string,
    storeId: PropTypes.number,
    address2: PropTypes.string,
    countryCode: PropTypes.string,
    currencyCode: PropTypes.string,
    cityName: PropTypes.string,
    zipCode: PropTypes.string
};
