/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 12/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {Trans} from "react-i18next";
import GSTrans from "../GSTrans/GSTrans";

const GSAlertEmpty = props => {
    const {className, text, ...other} = props
    return (
        <div className={["gs-alert-empty", className].join(' ')}>
            <div className="gsa-flex-grow--1 gs-atm__flex-col--flex-center gs-atm__flex-align-items--center">
                <div>
                    <img src="/assets/images/icon-Empty.svg"/>
                    {' '}
                    <span>
                        {text && text}
                        {!text && <GSTrans t={"component.gsAlertEmpty.commonText"}/>}
                    </span>
                </div>
            </div>
        </div>
    );
};

GSAlertEmpty.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string
};

export default GSAlertEmpty;
