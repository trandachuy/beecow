import React, {useEffect, useRef} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import Constants from "../../../config/Constant";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import './ShopeeIntro.sass';
import {Trans} from "react-i18next";
import i18next from "../../../config/i18n";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import ShopeeConnector from '../account/ShopeeConnector';
import shopeeService from "../../../services/ShopeeService";
import _ from "lodash";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {GSToast} from "../../../utils/gs-toast";
import storageService from "../../../services/storage";
import {AgencyService} from "../../../services/AgencyService";
import {CredentialUtils} from '../../../utils/credential'

const ShopeeIntro = (props) => {

    const refConnector = useRef(null);

    const openConnector = () => {
        storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_ID);
        storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_SHOP_NAME);
        storageService.removeSessionStorage(Constants.STORAGE_KEY_RECONNECT_SHOPEE_BRANCH_ID);
        refConnector.current.openShopee();
    }

    useEffect(() => {
        getManageAccounts();
    }, [])


    const getManageAccounts = () => {
        shopeeService.getManageAccountsByBcStoreId()
            .then(response => {
                if(!_.isEmpty(response)) {
                    RouteUtils.redirectWithoutReload(props, NAV_PATH.shopeeAccountManagement);
                }
            })
            .catch(e =>{
                GSToast.commonError();
            })
            .finally(() => {
            })
    }

    return (
        <GSContentContainer className='sp-account'>
            <GSContentBody className='sp-account__body' size={GSContentBody.size.MAX}>
                <div className="row">
                    <div className="col-12 col-md-6 shopee-intro__left-col">
                        <div className="shopee-intro__title">
                            <GSTrans t="shopee.account.author.title"/>
                        </div>
                        <div className="shopee-intro__description">
                            {i18next.t("shopee.account.author.notconnect", {provider: AgencyService.getDashboardName()})}
                        </div>
                        <div className="shopee-intro__description">
                            {i18next.t("shopee.account.author.process", {provider: AgencyService.getDashboardName()})}
                        </div>
                        <div className="shopee-intro__description font-weight-bold">
                            {i18next.t("shopee.account.author.benefit", {provider: AgencyService.getDashboardName()})}
                        </div>
                        <div className="shopee-intro__description shopee-intro__list">
                            <ul>
                                <li>{i18next.t("shopee.account.author.benefit1")}</li>
                                <li>{i18next.t("shopee.account.author.benefit2", {provider: AgencyService.getDashboardName()})}</li>
                                <li>{i18next.t("shopee.account.author.benefit3", {provider: AgencyService.getDashboardName()})}</li>
                                <li>{i18next.t("shopee.account.author.benefit4")}</li>
                            </ul>
                        </div>
                        <div>
                            <GSButton success onClick={openConnector}>
                                <Trans i18nKey='shopee.account.author.connect'>Enabled Shopee</Trans>
                            </GSButton>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 shopee-intro__right-col">
                        <img className="shopee-intro__background"
                             src={CredentialUtils.isStoreXxxOrGoSell() ? "/assets/images/shopee/shopee_intro_tera.png"  : "/assets/images/shopee/shopee_intro.png" }
                             alt="shopee-intro" />
                    </div>
                </div>
                <ShopeeConnector ref={refConnector} />
            </GSContentBody>

            <GSContentFooter>
                <GSLearnMoreFooter
                    text={i18next.t("shopee.account.author.title")}
                    linkTo={Constants.UrlRefs.LEARN_MORE_AUTHENTICATE_SHOPEE}/>
            </GSContentFooter>

        </GSContentContainer>
    );
}

ShopeeIntro.propTypes = {
};

export default ShopeeIntro;
