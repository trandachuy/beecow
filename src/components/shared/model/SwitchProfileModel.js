/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import PropTypes from "prop-types";

export default class SwitchProfileModel {
    pageId;
    authorTypeEnum;

    constructor(pageId, authorTypeEnum) {
        this.pageId = pageId;
        this.authorTypeEnum = authorTypeEnum;
    }
}

SwitchProfileModel.propTypes = {
    pageId: PropTypes.number,
    authorTypeEnum: PropTypes.string
};
