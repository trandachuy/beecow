/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/10/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from 'react';
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import './BuyLinkIntro.sass'
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSLearnMoreFooter from "../../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import i18next from "i18next";
import {CredentialUtils} from "../../../../utils/credential";
import {RouteUtils} from "../../../../utils/route";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {TokenUtils} from '../../../../utils/token';
import {Tooltip} from 'react-tippy';

const GUIDE_LINK = 'https://www.gosell.vn/link-mua-hang.html'
const BuyLinkIntro = props => {

    const hasPermission = TokenUtils.onlyWebOrAppPackage();

    const onClickExplore = () => {
        CredentialUtils.setIsExploredBuyLink(true);
        RouteUtils.linkTo(props, NAV_PATH.marketing.BUY_LINK)
    }

    return (
        <GSContentContainer className="buylink-intro">
            <GSContentBody size={GSContentBody.size.LARGE}  className="buylink-intro__body">
                <div className="row">
                    <div className="col-12 col-md-7 buylink-intro__left-col">
                        <div className="buylink-intro__title">
                            <GSTrans t="page.buylink.intro.title"/>
                        </div>
                        <div className="buylink-intro__description">
                            {i18next.t("page.buylink.intro.description1")}
                        </div>
                        <div className="buylink-intro__description">
                            {i18next.t("page.buylink.intro.description2")}
                        </div>
                        <div className="buylink-intro__description font-weight-bold">
                            {i18next.t("page.buylink.intro.benefit")}:
                        </div>
                        <div className="buylink-intro__description buylink-intro__list">
                            <ul>
                                <li>{i18next.t("page.buylink.intro.benefit1")}</li>
                                <li>{i18next.t("page.buylink.intro.benefit2")}</li>
                                <li>{i18next.t("page.buylink.intro.benefit3")}</li>
                                <li>{i18next.t("page.buylink.intro.benefit4")}</li>
                            </ul>
                        </div>
                        <div>
                            {hasPermission?
                            <GSButton className="buylink-intro__explore" success onClick={onClickExplore}>
                                <GSTrans t={"common.btn.explore"}/>
                            </GSButton>
                            :<Tooltip arrow position={"bottom"} title={i18next.t("freeTier.explore.tooltip")}>
                                <GSButton disabled={true} className="buylink-intro__explore" success>
                                    <GSTrans t={"common.btn.explore"}/>
                                </GSButton>
                            </Tooltip>}
                        </div>
                    </div>
                    <div className="col-12 col-md-5 buylink-intro__right-col">
                        <div className={CredentialUtils.isStoreXxxOrGoSell() ? "buylink-intro__background icon-tera" : "buylink-intro__background"}>
                        </div>
                    </div>
                </div>
                <GSLearnMoreFooter text={i18next.t("page.buylink.intro.title")} linkTo={GUIDE_LINK}/>
            </GSContentBody>
        </GSContentContainer>
    );
};

BuyLinkIntro.propTypes = {

};

export default BuyLinkIntro;
