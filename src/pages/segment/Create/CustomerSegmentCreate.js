/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 02/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import CustomerSegmentEditor, {CustomerSegmentEditorMode} from "../Editor/CustomerSegmentEditor";


const CustomerSegmentCreate = props => {
    const {mode, ...other} = props
    return (
        <CustomerSegmentEditor mode={CustomerSegmentEditorMode.CREATE} {...other}>

        </CustomerSegmentEditor>
    );
};

CustomerSegmentCreate.propTypes = {

};

export default CustomerSegmentCreate;
