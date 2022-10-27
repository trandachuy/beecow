import React, {Component} from 'react';
import AlertModal, {AlertModalType} from "./AlertModal/AlertModal";
import i18next from "../../config/i18n";

export default class NoInternet extends Component {
    constructor(props) {
        super(props);

        this.ping = this.ping.bind(this);
        this.check = this.check.bind(this);
    }

    check() {
        let that = this;
        this.ping({ url: 'https://ipv4.icanhazip.com/', timeout: 5000 }).then(function (online) {
            if (!online) {
                that.alertModal.openModal({
                    type: AlertModalType.ALERT_TYPE_DANGER,
                    messages: i18next.t('common.message.no.internet')
                })
            }
        });
    }

    ping(_ref) {
        let url = _ref.url,
            timeout = _ref.timeout;

        return new Promise(function (resolve) {
            let isOnline = function isOnline() {
                return resolve(true);
            };
            let isOffline = function isOffline() {
                return resolve(false);
            };

            let xhr = new XMLHttpRequest();

            xhr.onerror = isOffline;
            xhr.ontimeout = isOffline;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === xhr.HEADERS_RECEIVED) {
                    if (xhr.status) {
                        isOnline();
                    } else {
                        isOffline();
                    }
                }
            };

            xhr.open("HEAD", url);
            xhr.timeout = timeout;
            xhr.send();
        });
    };

    render() {
        return (
            <div>
                {this.check()}
                <AlertModal ref={(el) => { this.alertModal = el }} />
            </div>
        )
    }
}
