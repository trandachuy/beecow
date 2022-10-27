/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/06/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import PackageSteps from "./PackageSteps/PackageSteps";

const PackageRegister = props => {
    return (
        <PackageSteps atPage={props.atPage} defaultPkg={props.defaultPkg} defaultExp={props.defaultExp}/>
    );
};

PackageRegister.PAGE = {
    WIZARD: 'WIZARD',
    SETTING: 'SETTING'
}

PackageRegister.propTypes = {
    atPage: PropTypes.oneOf(Object.values(PackageRegister.PAGE)).isRequired,
    defaultPkg: PropTypes.any,
    defaultExp: PropTypes.any
};

export default PackageRegister;
