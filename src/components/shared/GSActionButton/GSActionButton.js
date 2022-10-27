/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import './GSActionButton.sass'
import {Link} from "react-router-dom";

const GSActionButton = props => {
    const {className, icon,marginLeft, style, linkTo, linkToTarget, ...other} = props

    if (linkTo) {
        return (
            <Link to={linkTo} target={linkToTarget} className="gsa-text--non-underline">
                <i className={["gs-action-button", props.className, props.disabled? 'gs-atm--disable':''].join(' ')}
                    style={{
                        backgroundImage: props.icon,
                        marginLeft: props.marginLeft? '1em':0,
                        width: props.width,
                        ...props.style
                    }}
                {...other}
                >
                </i>
            </Link>
        );
    }
    return (
        <i className={["gs-action-button", props.className, props.disabled? 'gs-atm--disable':''].join(' ')}
            style={{
                backgroundImage: props.icon,
                marginLeft: props.marginLeft? '1em':0,
                width: props.width,
                ...props.style
            }}
           {...other}
        >
        </i>
    );
};

export const GSActionButtonIcons = {
    EDIT: 'url(/assets/images/icon-edit.png)',
    DELETE: 'url(/assets/images/icon-delete.png)',
    VIEW: 'url(/assets/images/icon-view.png)',
    CLOSE: 'url(/assets/images/icon-closepop-up.png)',
    CLONE: 'url(/assets/images/icon-clone.png)',
    DOTS: 'url(/assets/images/icon-dots.png)',
    DROPDOWN: 'url(/assets/images/icon-expand.png)',
    COPY_LINK: 'url(/assets/images/buylink/icon_copy.svg)',
    BROKEN_LINK: 'url(/assets/images/broken-link.svg)',
    BROKEN_UNLINK: 'url(/assets/images/broken-unLink.svg)',
    PRODUCT_SCAN_BTN_ON: 'url(/assets/images/product-barcode-scanner-on.svg)',
    PRODUCT_SCAN_BTN_OFF: 'url(/assets/images/product-barcode-scanner-off.svg)',
}

GSActionButton.defaultProps = {
    width: '20px'
}

GSActionButton.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.oneOf(Object.values(GSActionButtonIcons)),
    onClick: PropTypes.func,
    marginLeft: PropTypes.bool,
    width: PropTypes.string,
    disabled: PropTypes.bool,
    linkTo: PropTypes.string,
    linkToTarget: PropTypes.string,
};

export default GSActionButton;
