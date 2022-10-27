/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";

export default class ImageModel {
    imageId;
    imageUUID;
    urlPrefix;
    extension;

    constructor(imageId, imageUUID, urlPrefix, extension) {
        this.imageId = imageId;
        this.imageUUID = imageUUID;
        this.urlPrefix = urlPrefix;
        this.extension = extension;
    }

}
ImageModel.propTypes = {
    imageId: PropTypes.number,
    imageUUID: PropTypes.string,
    urlPrefix: PropTypes.string,
    extension: PropTypes.string
};
