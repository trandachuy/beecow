import React from 'react';
import moment from 'moment';
import {TokenUtils} from "../../utils/token";
import {CredentialUtils} from "../../utils/credential";
import {AgencyService} from "../../services/AgencyService";
import beehiveService from "../../services/BeehiveService";
import $ from 'jquery'
import {attemptToFindElement} from '../../utils/class-name'

const APP_ID = "u1mmehn0";

(function () {
    var w = window;
    var ic = w.Intercom;
    if (typeof ic === "function") {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
    } else {
        var d = document;
        var i = function () {
            i.c(arguments);
        };
        i.q = [];
        i.c = function (args) {
            i.q.push(args);
        };
        w.Intercom = i;
        var l = function () {
            var s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://widget.intercom.io/widget/' + APP_ID;
            var x = d.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
        };
        if (document.readyState === 'complete') {
            l();
        } else if (w.attachEvent) {
            w.attachEvent('onload', l);
        } else {
            w.addEventListener('load', l, false);
        }
    }
})();

const formatPackageTypes = (currentPlans) => {
    let packageTypes = '';

    currentPlans.forEach((plan) => {
        packageTypes = packageTypes.concat(plan.packageName === 'GoOMNI' ? 'GoFREE' : plan.packageName)
            .concat(`, sd: ${moment.unix(plan.userFeature.registerPackageDate).format('DD/MM/YYYY')}`)
            .concat(`, ed: ${moment.unix(plan.userFeature.expiredPackageDate).format('DD/MM/YYYY')}\n`);
    });

    return packageTypes;
}

const IntercomChatBubble = () => {
    const supportBtnId = '#supportBtn-' + (window.innerWidth < 576 ? 'mobile' : 'desktop')

    attemptToFindElement(supportBtnId, (supportBtn) => {
        const supportBtnPos = supportBtn.offset().left - (supportBtn.width() / 2),
            currentPlans = CredentialUtils.getCurrentPlans(),
            bootIntercom = (plans) => {
                window.Intercom('boot', {
                    app_id: APP_ID,
                    email: TokenUtils.getValue("sub"),
                    user_id: CredentialUtils.getStoreId(),
                    name: TokenUtils.getDisplayName(),
                    phone: CredentialUtils.getStorePhone(),
                    address: CredentialUtils.getStoreAddress(),
                    package_type: formatPackageTypes(plans),
                    store_name: CredentialUtils.getStoreName(),
                    domain: `${CredentialUtils.getStoreUrl()}.${AgencyService.getStorefrontDomain()}`
                });
            };

        window.intercomSettings = {
            app_id: APP_ID,
            custom_launcher_selector: supportBtnId,
            horizontal_padding: supportBtn.length && (window.innerWidth - supportBtnPos - 208),
            hide_default_launcher: true,
            language_override: CredentialUtils.getLangKey(),
        };

        if (currentPlans) {
            bootIntercom(currentPlans);
        }  else {
            beehiveService.getCurrentPlanList()
                .then((plans) => {
                    CredentialUtils.setCurrentPlans(plans)

                    bootIntercom(plans);
                });
        }

        $('body').append($('<div />', {
            'id': 'supportBtnArrow',
            'css': {
                'display': 'none',
                'width': '0',
                'height': '0',
                'border-left': '15px solid transparent',
                'border-right': '15px solid transparent',
                'border-bottom': '15px solid rgba(77,166,240,1)',
                'transform': 'translate(50%, 0)',
                'position': 'fixed',
                'top': '69px',
                'left': supportBtnPos,
            }
        }));
    });

    window.Intercom('onShow', () => {
        attemptToFindElement('.intercom-messenger-frame', (intercomUI) => {
            intercomUI.css('height', 'calc(100% - 90px)');
            intercomUI.animate({
                top: '84px',
            }, 200);
            $('#supportBtnArrow').fadeIn();
        });
    });
    window.Intercom('onHide', () => {
        $('#supportBtnArrow').fadeOut();
    });
}

export default IntercomChatBubble;
