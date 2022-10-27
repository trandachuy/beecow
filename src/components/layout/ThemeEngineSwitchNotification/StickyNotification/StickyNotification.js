import moment from "moment";
import React, { Component } from "react";
import i18next from "../../../../config/i18n";
import storageService from "../../../../services/storage";
import { TokenUtils } from "../../../../utils/token";
import "./StickyNotification.sass";

export class StickyNotification extends Component {

    constructor(props) {
        super(props);

        this.handleSwitchNow = this.handleSwitchNow.bind(this);
    }

    handleSwitchNow() {
        this.props.closeNotification();
    }

    render() {
        const lastDate = `${process.env.LAST_SUPPORT_OLD_ENGINE_DATE || storageService.getFromLocalStorage("lastSupportOldEngineDate")}`;
        const isBeforeLastSupportDate = moment(new Date()).isBefore(moment(lastDate, "DD/MM/YYYY"));
        if (isBeforeLastSupportDate && TokenUtils.hasThemeEnginePermission()) {
            return (
                <div className="sticky-notification">
                    {i18next.t("notification.themeEngine.switch.stickyNotification", {
                        lastSupportOldThemeDate: lastDate
                    })}
                &nbsp;
                    <a href="#" onClick={this.handleSwitchNow}>
                        {i18next.t("notification.themeEngine.switch.stickyNotification.now")}!
                </a>
                </div>
            );
        }
        return null;
    }
}
