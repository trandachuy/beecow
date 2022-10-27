/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import './NotificationIntro.sass'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSLearnMoreFooter from "../../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import i18next from "i18next";
import {CredentialUtils} from "../../../../utils/credential";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";

const GUIDE_LINK = 'https://huongdan.gosell.vn/faq/thong-bao-khach-hang-bo-suu-tap-moi-uu-dai-2/'
const NotificationIntro = props => {

    const onClickExplore = () => {
        CredentialUtils.setIsExploredNotification(true)
        RouteUtils.linkTo(props, NAV_PATH.marketing.NOTIFICATION)
    }

    return (
        <GSContentContainer className="notification-intro">
            <GSContentBody size={GSContentBody.size.LARGE}  className="notification-intro__body">
                <div className="row mb-4">
                    <div className="col-12 col-md-6 notification-intro__left-col">
                        <div className="notification-intro__title">
                            <GSTrans t="page.notification.intro.title"/>
                        </div>
                        <div className="notification-intro__description">
                            <GSTrans t="page.notification.intro.description"/>
                        </div>
                        <div>
                            <GSButton success onClick={onClickExplore}>
                                <GSTrans t={"page.notification.intro.btn.explore"}/>
                            </GSButton>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 notification-intro__right-col">
                        <div className="notification-intro__background">

                        </div>
                    </div>
                </div>
                <GSLearnMoreFooter text={i18next.t("page.notification.intro.title")} linkTo={GUIDE_LINK}/>
            </GSContentBody>
        </GSContentContainer>
    );
};

NotificationIntro.propTypes = {

};

export default NotificationIntro;
