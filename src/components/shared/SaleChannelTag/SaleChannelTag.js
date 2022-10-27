/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 17/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import Constants from "../../../config/Constant";
import PropTypes from "prop-types";
import './SaleChannelTag.sass'
import i18next from "i18next";
import beehiveService from "../../../services/BeehiveService";
import {AgencyService} from "../../../services/AgencyService";

export class SaleChannelTag extends React.Component {
    mappingCode = {
        [Constants.SITE_CODE_BEECOW]: 'gomua',
        [Constants.SITE_CODE_LAZADA]: 'lazada',
        [Constants.SITE_CODE_SHOPEE]: 'shopee',
        [Constants.SITE_CODE_GOSELL]: 'gosell'
    }

    constructor(props) {
        super(props)

        this.mapSiteCodeToChannelName = this.mapSiteCodeToChannelName.bind(this)
        this.renderChannelName = this.renderChannelName.bind(this)
    }

    mapSiteCodeToChannelName( siteCode ) {
        return this.mappingCode[siteCode]
    }

    renderChannelName(siteCode) {
        if (siteCode !== Constants.SITE_CODE_GOSELL) {
            let name = this.mapSiteCodeToChannelName(siteCode)
            return name.charAt(0).toUpperCase() + name.slice(1)
        } else {
            return beehiveService.getAgencyCode() ? AgencyService.getDashboardName() : i18next.t("component.button.selector.saleChannel.gosell")
        }
    }

    renderChanelLogo(siteCode) {
        if (beehiveService.getAgencyCode()) {
            return AgencyService.getWhiteLogo();
        } else {
            return "/assets/images/sale_channels/" + this.mapSiteCodeToChannelName(siteCode) + ".png";
        }
    }

    render() {
        return(
            <div className="sale-channel-tag">
                <span className={"brand brand--" + this.mapSiteCodeToChannelName(this.props.channel)}>
                { this.props.isShowIcon &&
                <img src={this.renderChanelLogo(this.props.channel)}
                style={{height: '1em'}}/>
                }
                    <b>
                    { this.renderChannelName(this.props.channel) }
                </b>
            </span>

            </div>
        )
    }
}

export const SaleChannel = {
    SHOPEE: Constants.SITE_CODE_SHOPEE,
    LAZADA: Constants.SITE_CODE_LAZADA,
    BEECOW: Constants.SITE_CODE_BEECOW,
    GOSELL: Constants.SITE_CODE_GOSELL
}

SaleChannelTag.propTypes = {
  channel: PropTypes.oneOf( Object.values(SaleChannel) ),
  isShowIcon: PropTypes.any
}
