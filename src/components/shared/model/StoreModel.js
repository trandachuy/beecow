/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";
import ImageModel from "./ImageModel";
import DeliveryProviderModel from "./DeliveryProviderModel";

export default class StoreModel {
    id;
    name;
    url;
    ownerId;
    city;
    storeImage;
    coverImage;
    categoryIds;
    contactNumber;
    email;
    ward; // is true district (because wrong naming)
    district; // is true ward (because wrong naming)
    address;
    address2;
    deliveryProviders;
    externalLink;
    description;
    file;
    fileName;
    colorPrimary;
    colorSecondary;
    addressId;
    orgURL;
    countryCode;
    currencyCode;
    phoneCode;
    cityName;
    zipCode;
}
StoreModel.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    url: PropTypes.string,
    ownerId: PropTypes.number,
    city: PropTypes.string,
    storeImage: ImageModel,
    coverImage: ImageModel,
    categoryIds: PropTypes.arrayOf(PropTypes.number),
    contactNumber: PropTypes.string,
    email: PropTypes.string,
    ward: PropTypes.string,
    district: PropTypes.string,
    address: PropTypes.string,
    address2: PropTypes.string,
    deliveryProviders: DeliveryProviderModel,
    externalLink: PropTypes.string,
    description: PropTypes.string,
    file: PropTypes.any,
    fileName: PropTypes.string,
    colorPrimary: PropTypes.string,
    colorSecondary: PropTypes.string,
    addressId: PropTypes.string,
    orgURL: PropTypes.string,
    countryCode: PropTypes.string,
    currencyCode: PropTypes.string,
    phoneCode: PropTypes.string,
    cityName: PropTypes.string,
    zipCode: PropTypes.string
};
