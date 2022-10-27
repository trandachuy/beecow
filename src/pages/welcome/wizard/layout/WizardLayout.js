/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 13/06/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import './WizardLayout.sass'
import i18next from "i18next";
import Logo from "../../../../components/shared/Logo";
import {useDispatch, useSelector} from "react-redux";
import {setPageTitle} from "../../../../config/redux/Reducers";
import {AgencyService} from "../../../../services/AgencyService";

const WizardLayout = props => {

    const dispatch = useDispatch();
    const selector = useSelector(state => state.agencyName);

    useEffect(() => {
        dispatch(setPageTitle(AgencyService.getDashboardName() + ' - Wizard'));
    }, [selector]);

    return (
        <div className="wizard-layout">
            <div className="wizard-layout__header">
                <Logo height={55}/>
                {!props.hideTitle &&
                <span className="wizard-layout__title">
                    {props.title? props.title:i18next.t("welcome.wizard.gosell.subTitle")}
                </span>}
            </div>
            <div  className="wizard-layout__content-wrapper">
                <div className="wizard-layout__content">
                {props.children}
                </div>
            </div>
            <div  className="wizard-layout__footer">
                <span>
                    © 2019 MEDIASTEP
                </span>
            </div>
        </div>
    );
};

WizardLayout.propTypes = {
    title: PropTypes.string,
    hideTitle: PropTypes.bool
};

export default WizardLayout;
