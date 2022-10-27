import * as ReactDOM from "react-dom";
import ConfirmModal from "../../shared/ConfirmModal/ConfirmModal";
import React from "react";
import beehiveService from "../../../services/BeehiveService";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 10/04/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
export const handleGetUserConfirmation = (mess, callback) => {
    const modal = document.createElement('div')
    document.body.appendChild(modal)

    const answer = (answer) => {
        ReactDOM.unmountComponentAtNode(modal)
        document.body.removeChild(modal)
        callback(answer)
    }

    let refConfirm;

    ReactDOM.render(
        <ConfirmModal ref={(el) => refConfirm =el}/>
        ,
        modal
        , () => {
            refConfirm.openModal({
                messages: mess,
                messageHtml: true,
                okCallback: async () => {
                    // revert status for notification
                    const confirmUpdateNotificationStatus = sessionStorage.getItem('confirmUpdateNotificationStatus')
                    if (confirmUpdateNotificationStatus) {
                        const [id, status] = confirmUpdateNotificationStatus.split('|')
                        await beehiveService.updateMarketingNotificationStatus(id, status)
                        sessionStorage.removeItem('confirmUpdateNotificationStatus')
                    }

                    answer(true)
                },
                cancelCallback: () => answer(false)
            })
        }
    )
}
