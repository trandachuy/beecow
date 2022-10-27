/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 20/05/2020
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import CustomerEditorActivityItem from "../ActivityItem/CustomerEditorActivityItem";
import './CustomerEditorActivityGroup.sass'
import moment from "moment";
import i18next from "i18next";
import {CredentialUtils} from "../../../../../utils/credential";
import {cn} from "../../../../../utils/class-name";

const CustomerEditorActivityGroup = props => {
    const [date, histories] = props.group


    const isToday = () => {
        const nowDate = moment(moment.now()).format('YYYY-MM-DD')
        return nowDate === date
    }

    const resolveHeaderDate = () => {
        if (isToday()) { // => today
            return i18next.t('page.customers.edit.activity.today')
        }
        return moment(date).locale(CredentialUtils.getLangKey()).format('ll')
    }

    return (
        <div className="customer-editor-activity-group">
            <div className="customer-editor-activity-group__header">
                <hr/>
                    <span className={cn("customer-editor-activity-group__header-tag", {
                        "customer-editor-activity-group__header-tag--today": isToday()
                    })}>
                        {resolveHeaderDate()}
                    </span>
                <hr/>
            </div>
            <div className="customer-editor-activity-group__item-container">
                {histories.map(h => <CustomerEditorActivityItem history={h} key={h.id}/>)}
            </div>

        </div>
    );
};


CustomerEditorActivityGroup.propTypes = {
    group: PropTypes.array, // first item is time
};

export default CustomerEditorActivityGroup;
