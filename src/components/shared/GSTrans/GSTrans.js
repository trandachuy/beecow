/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 31/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";

class GSTrans extends Component {
    render() {
        const {t, values, ...other} = this.props
        return (
            <Trans i18nKey={t} values={values} {...other}>
                {this.props.children}
            </Trans>
        );
    }
}

GSTrans.propTypes = {
  t: PropTypes.string.isRequired,
  values: PropTypes.any
}

export default GSTrans;
