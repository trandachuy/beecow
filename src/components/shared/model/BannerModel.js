/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */
import PropTypes from "prop-types";

export default class BannerModel {
    imageId;
    imageUrlPrefix;
    position;
    showed;
    url;
    storeId;

    constructor(imageId, imageUrlPrefix, position, showed, url, storeId) {
        this.imageId = imageId;
        this.imageUrlPrefix = imageUrlPrefix;
        this.position = position;
        this.showed = showed;
        this.url = url;
        this.storeId = storeId;
    }
}

BannerModel.propTypes = {
    imageId: PropTypes.number,
    imageUrlPrefix: PropTypes.string,
    position: PropTypes.number,
    showed: PropTypes.bool,
    url: PropTypes.string,
    storeId: PropTypes.number
};
