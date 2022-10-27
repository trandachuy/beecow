/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/3/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */


import PropTypes from "prop-types";

export default class UserDomainModel {
    id;
    name;
    userId;

    constructor(id, name, userId) {
        this.id = id;
        this.name = name;
        this.userId = userId;
    }

}

UserDomainModel.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string,
    userId: PropTypes.number
};