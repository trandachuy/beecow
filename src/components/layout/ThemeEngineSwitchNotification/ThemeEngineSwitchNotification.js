import moment from "moment";
import React, { Component } from "react";
import imgShouldSwitchThemeNotification from "../../../../public/assets/images/switch-theme-engine-notification/should_switch_theme_notification.jpg";
import i18next from "../../../config/i18n";
import storageService from "../../../services/storage";
import { TokenUtils } from "../../../utils/token";
import GSTrans from "../../shared/GSTrans/GSTrans";
import "./ThemeEngineSwitchNotification.sass";

const NotificationContent = props => {
  const { lastDate } = props;
  return (
    <>
      <img src={imgShouldSwitchThemeNotification} alt="should switch theme notification img" />
      <div className="custom-carousel-caption">
        <strong>{i18next.t("common.txt.alert.modal.title")}</strong>
        <div className="caption-details">
          {i18next.t("notification.themeEngine.switch.force.notification.text.part1",
            { lastSupportOldThemeDate: lastDate })}
          &nbsp;
          <a href="https://www.gosell.vn/giao-dien.html" className="capitalize-bold-txt" target="_blank">
            {i18next.t("component.product.addNew.here")}
          </a>
          &nbsp;
          {i18next.t("notification.themeEngine.switch.force.notification.text.part2")}
        </div>
      </div>
    </>
  );
}

const NotificationButtons = props => {
  const { lastDate, onSwitchNow, onSwitchLater } = props;
  const isAfterLastSupportDate = moment(new Date()).isAfter(moment(lastDate, "DD/MM/YYYY"));
  return (
    <div className="notification-btn-container">
      {!isAfterLastSupportDate &&
        < button className="btn-unfilled" onClick={onSwitchLater}>
          {i18next.t("notification.themeEngine.switch.later")}
        </button>
      }
      <button className="btn-filled" onClick={onSwitchNow}>
        {i18next.t("notification.themeEngine.switch.now")}
      </button>
    </div>
  );
}

export class ThemeEngineSwitchNotification extends Component {

  constructor(props) {
    super(props);
    this.state = {
      switchNow: false
    };
    this.onSwitchLater = this.onSwitchLater.bind(this);
    this.onSwitchNow = this.onSwitchNow.bind(this);
  }

  onSwitchNow = () => {
    this.setState({ switchNow: true });
    this.props.closeNotification(true);
  }

  onSwitchLater = () => {
    this.props.closeNotification(false);
  }

  render() {
    const lastDate = `${process.env.LAST_SUPPORT_OLD_ENGINE_DATE || storageService.getFromLocalStorage("lastSupportOldEngineDate")}`;
    return (
      <>
        { TokenUtils.hasThemeEnginePermission() && false &&
          <div className="backdrop">
            <div className="notification-modal">
              <div className="notification-slider-container">
                <div className="force-notification-container">
                  <NotificationContent lastDate={lastDate} />
                  <NotificationButtons lastDate={lastDate} onSwitchNow={this.onSwitchNow} onSwitchLater={this.onSwitchLater} />
                  <div className="force-notification-footer">
                    <GSTrans t='component.expiredPlanModal.information'>
                      Hotline: <a className='expired-plan-modal__wrapper__body__information--item'
                        href='tel:+02873030800'>02873030800</a> -
                                  Email: <a className='expired-plan-modal__wrapper__body__information--item'
                        href='mailto:hotro@gosell.vn'>hotro@gosell.vn</a>
                    </GSTrans>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </>
    );
  }

}
