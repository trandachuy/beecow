import i18next from 'i18next';
import React from 'react';
import { Tooltip } from 'react-tippy';
import flashSaleImg from "../../../../public/assets/images/flash-sale/flashsale_introduction.png";
import GSContentBody from '../../../components/layout/contentBody/GSContentBody';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import { NAV_PATH } from '../../../components/layout/navigation/Navigation';
import GSButton from '../../../components/shared/GSButton/GSButton';
import GSLearnMoreFooter from '../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter';
import GSTrans from '../../../components/shared/GSTrans/GSTrans';
import { CredentialUtils } from '../../../utils/credential';
import { RouteUtils } from '../../../utils/route';
import { TokenUtils } from '../../../utils/token';
import './FlashSaleIntro.sass';

const FlashSaleIntro = props => {
  const LEARN_MORE_LINK = "https://huongdan.gosell.vn/faq/huong-dan-tao-chien-dich-flash-sale/";

  const permissionToExplore = TokenUtils.hasThemeEnginePermission();

  const onClickExplore = _ => {
    CredentialUtils.setIsExploredFlashSale(true);
    RouteUtils.linkTo(props, NAV_PATH.flashSale);
  }

  return (
    <GSContentContainer className={"gs-flash-sale-intro"}>
      <GSContentBody size={GSContentBody.size.MAX} className={"gs-flash-sale-intro__display-flex-col"}>
        <div className="row">
          <div className="col-12 col-lg-6 gs-flash-sale-intro__left-col gs-flash-sale-intro__margin-top">
            <div className="gs-flash-sale-intro__title">
              {i18next.t("page.flashSale.intro.title")}
            </div>
            <div className="gs-flash-sale-intro__description">
              {i18next.t("page.flashSale.intro.description")}
            </div>
            <div className="gs-flash-sale-intro__description font-weight-bold">
              {i18next.t("page.flashSale.intro.benefits")}
            </div>
            <div className="gs-flash-sale-intro__description gs-flash-sale-intro__benefit-list">
              <ul>
                <li>{i18next.t("page.flashSale.intro.benefits.1")}</li>
                <li>{i18next.t("page.flashSale.intro.benefits.2")}</li>
                <li>{i18next.t("page.flashSale.intro.benefits.3")}</li>
                <li>{i18next.t("page.flashSale.intro.benefits.4")}</li>
                <li>{i18next.t("page.flashSale.intro.benefits.5")}</li>
                <li>{i18next.t("page.flashSale.intro.benefits.6")}</li>
              </ul>
            </div>
            {permissionToExplore
              ?
              <GSButton success onClick={onClickExplore} className="gs-flash-sale-intro__btn-explore">
                <GSTrans t={"common.btn.explore"} />
              </GSButton>
              :
              <Tooltip arrow followCursor position={"bottom"} title={i18next.t("freeTier.explore.tooltip")}>
                <GSButton disabled={true} className="gs-flash-sale-intro__btn-explore" success>
                  <GSTrans t={"common.btn.explore"} />
                </GSButton>
              </Tooltip>
            }
          </div>
          <div className="col-12 col-lg-6 gs-flash-sale-intro__right-col">
            <img src={flashSaleImg} />
          </div>
        </div>
        <GSLearnMoreFooter className="gs-flash-sale-intro__learn-more"
          text={i18next.t("page.flashSale.intro.title")} linkTo={LEARN_MORE_LINK} />
      </GSContentBody>
    </GSContentContainer>
  );
}

export default FlashSaleIntro;
