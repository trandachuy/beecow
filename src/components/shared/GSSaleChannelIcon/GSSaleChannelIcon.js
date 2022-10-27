/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 05/09/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import Constants from "../../../config/Constant";
import './GSSaleChannelIcon.sass';
import i18next from "i18next";

const GSSaleChannelIcon = props => {
    const {channel, className,  width, height, size,...other} = props
    const resolveTitle = () => {
        switch (channel?.toLowerCase()) {
            case Constants.SaleChannels.GOSELL.toLowerCase():
                return i18next.t("component.button.selector.saleChannel.gosell")
            case Constants.SaleChannels.BEECOW.toLowerCase():
                return 'GoMua'
            case Constants.SaleChannels.LANDING_PAGE.toLowerCase():
                return 'Landing Page'
            case Constants.SaleChannels.CONTACT_FORM.toLowerCase():
                return i18next.t('page.customers.list.contactForm')
            case Constants.SaleChannels.IMPORTED.toLowerCase():
                return i18next.t('page.customers.list.imported');
            default:
                return channel
        }
    }
    return (
        <div className={["gs-channels-wrapper", className].join(' ')} {...other} title={resolveTitle()}
            style={{
                width: size? size:width + 'px',
                height: size? size:width + 'px'
            }}
        >
            <div className={channel?.toLowerCase()}
                style={{
                    width: ((size? size:width)- Math.round((size? size:width) * 0.16)) + 'px',
                    height: ((size? size:width)- Math.round((size? size:width) * 0.16)) + 'px'
                }}
            >
            </div>
        </div>
    );
};

GSSaleChannelIcon.defaultProps = {
    width: 60
}

export const GSSaleChannelIconSize = {
    sm: 31,
    md: 38,
    lg: 48,
    xl: 60
}

GSSaleChannelIcon.propTypes = {
    channel: PropTypes.oneOf(Object.values(Constants.SaleChannels)).isRequired,
    width: PropTypes.any,
    size: PropTypes.oneOf(Object.values(GSSaleChannelIconSize))
};

export default GSSaleChannelIcon;
