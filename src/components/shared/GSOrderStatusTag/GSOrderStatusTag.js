/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 01/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import Constants from "../../../config/Constant";
import GSStatusTag from "../GSStatusTag/GSStatusTag";
import './GSOrderStatusTag.sass'

const GSOrderStatusTag = props => {

    const buildDotStyle = () => {
        switch (props.status) {
            case Constants.ORDER_STATUS_PENDING:
            case Constants.ORDER_STATUS_TO_SHIP: // to confirm
                return 'gs-order-status__dot--info'
            case Constants.ORDER_STATUS_WAITING_FOR_PICKUP: // pickup pending
            case Constants.ORDER_STATUS_IN_CANCEL: // process pending
                return 'gs-order-status__dot--warning'
            case Constants.ORDER_STATUS_SHIPPED:
            case Constants.ORDER_STATUS_DELIVERED:
                return 'gs-order-status__dot--success'
            case Constants.ORDER_STATUS_CANCELLED:
                return 'gs-order-status__dot--danger'
            case Constants.ORDER_STATUS_RETURNED:
                return 'gs-order-status__dot--secondary'
            default:
                return GSStatusTag.STYLE.LIGHT
        }
    }

    const buildTagStyle = () => {
        switch (props.status) {
            case Constants.ORDER_STATUS_PENDING:
            case Constants.ORDER_STATUS_TO_SHIP: // to confirm
                return GSStatusTag.STYLE.INFO
            case Constants.ORDER_STATUS_WAITING_FOR_PICKUP: // pickup pending
            case Constants.ORDER_STATUS_IN_CANCEL: // process pending
                return GSStatusTag.STYLE.WARNING
            case Constants.ORDER_STATUS_SHIPPED:
            case Constants.ORDER_STATUS_DELIVERED:
                return GSStatusTag.STYLE.SUCCESS
            case Constants.ORDER_STATUS_CANCELLED:
                return GSStatusTag.STYLE.DANGER
            case Constants.ORDER_STATUS_RETURNED:
                return GSStatusTag.STYLE.SECONDARY
            default:
                return GSStatusTag.STYLE.LIGHT
        }
    }

    return (
        <>
            <GSStatusTag tagStyle={buildTagStyle()} text={props.text} className="d-mobile-none d-desktop-flex">
            </GSStatusTag>
            <div className={"gs-order-status__dot d-mobile-block d-desktop-none " + buildDotStyle()}>

            </div>
        </>
    );
};

GSOrderStatusTag.propTypes = {
    status: PropTypes.oneOf(Object.values(Constants.ORDER_STATUS_LIST)),
    text: PropTypes.string,
};

export default GSOrderStatusTag;
