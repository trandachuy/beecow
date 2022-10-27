/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import GSWidget from "../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../components/shared/form/GSWidget/GSWidgetContent";
import './UpgradePanel.sass'
import GSContentContainer from "../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../components/layout/contentBody/GSContentBody";
import {Trans} from "react-i18next";
import {UikButton} from '../../@uik'
import {RouteUtils} from "../../utils/route";
import {NAV_PATH} from "../../components/layout/navigation/Navigation";
import GSButton from "../../components/shared/GSButton/GSButton";

class UpgradeExpired extends Component {
    render() {
        return (
            <GSContentContainer>
                <GSContentBody size={GSContentBody.size.LARGE} centerChildren>
                    <GSWidget className="upgrade-expired-panel">
                        <GSWidgetContent className="upgrade-expired-container">
                            <span className="title">
                                <Trans i18nKey="upgrade.expired.title" />
                            </span>
                            <span className="subTitle">
                                <Trans i18nKey="upgrade.expired.subTitle" >
                                   a <span style={{color: 'rgb(36, 66, 228)'}}>advanced</span> a
                                </Trans>
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.expired.f1" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.expired.f2" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.expired.f3" />
                            </span>
                            <span className="footer">
                                <Trans i18nKey="upgrade.expired.footer" />
                            </span>
                            <GSButton primary className="btn-upgrade" onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.settingsPlans)}>
                                <Trans i18nKey="layout.header.expiredPlanBar.btn.renew"/>
                            </GSButton>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>

        );
    }
}

UpgradeExpired.propTypes = {};

export default UpgradeExpired;
