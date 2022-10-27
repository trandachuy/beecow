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

class UpgradeChannelPanel extends Component {
    render() {
        return (
            <GSContentContainer>
                <GSContentBody size={GSContentBody.size.LARGE} centerChildren>
                    <GSWidget className="upgrade-channel-panel">
                        <GSWidgetContent className="upgrade-channel-container">
                            <span className="title">
                                <Trans i18nKey="upgrade.channel.title" />
                            </span>
                            <span className="subTitle">
                                <Trans i18nKey="upgrade.channel.subTitle" >
                                   a <span style={{color: 'rgb(36, 66, 228)'}}>advanced</span> a
                                </Trans>
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.channel.f1" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.channel.f2" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.channel.f3" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.channel.f4" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.channel.f5" />
                            </span>
                            <span className="ft">
                                <Trans i18nKey="upgrade.channel.f6" />
                            </span>
                            <span className="footer">
                                <Trans i18nKey="upgrade.channel.footer" />
                            </span>
                            <GSButton primary className="btn-upgrade" onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.settingsPlans)}>
                                <Trans i18nKey="upgrade.channel.btn.upgrade"/>
                            </GSButton>
                        </GSWidgetContent>
                    </GSWidget>
                </GSContentBody>
            </GSContentContainer>

        );
    }
}

UpgradeChannelPanel.propTypes = {};

export default UpgradeChannelPanel;
