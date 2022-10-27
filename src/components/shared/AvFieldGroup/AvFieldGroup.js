/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/08/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import './AvFieldGroup.sass'

const AvFieldGroup = props => {
    return (
        <div className="av-field-group">
            {props.children}
        </div>
    );
};

AvFieldGroup.propTypes = {

};

export default AvFieldGroup;
