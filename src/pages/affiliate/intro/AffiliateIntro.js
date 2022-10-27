import React, {useContext, useEffect, useState} from "react";
import "./AffiliateIntro.sass";
import i18next from "i18next";
import GSComponentTooltip, {GSComponentTooltipPlacement,} from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {AffiliateContext} from "../context/AffiliateContext";
import {TokenUtils} from "../../../utils/token";
import {PACKAGE_FEATURE_CODES} from "../../../config/package-features";
import Constants from "../../../config/Constant";
import {CredentialUtils} from "../../../utils/credential";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSImg from "../../../components/shared/GSImg/GSImg";

const AffiliateIntro = (props) => {
    const { state } = useContext(AffiliateContext.context);
    const { isDropShipActive, isResellerActive } = state;
    const hasResellerPermission = TokenUtils.hasAnyPackageFeatures([
        PACKAGE_FEATURE_CODES.WEB_PACKAGE,
        PACKAGE_FEATURE_CODES.APP_PACKAGE,
        PACKAGE_FEATURE_CODES.POS_PACKAGE,
    ]);
    const hasDropshipPermission = TokenUtils.hasAnyPackageFeatures([
        PACKAGE_FEATURE_CODES.WEB_PACKAGE,
    ]);
    const [stImage,setStImage] = useState({
        dropShip: "./assets/images/affiliate/dropship_vi.svg",
        reseller: "./assets/images/affiliate/reseller_en.svg",
    });

    useEffect(() => {
        const langKey = CredentialUtils.getLangKey();
        setStImage({
            dropShip: `./assets/images/affiliate/dropship_${langKey}.svg`,
            reseller: `./assets/images/affiliate/reseller_${langKey}.svg`,
        })
    }, [])

    useEffect(() => {
        if (_.isUndefined(isDropShipActive) || _.isUndefined(isResellerActive)) {
            return
        }

        if (isDropShipActive || isResellerActive) {
            //RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateInfo)
            return;
        }
    }, [isDropShipActive, isResellerActive]);

    const handlePaymentPackage = (serviceType) => {
        const hasPermission = (Constants.AFFILIATE_SERVICE_TYPE.RESELLER === serviceType)? hasResellerPermission: hasDropshipPermission;
        if(!hasPermission) {
            return;
            //return RouteUtils.redirectWithReload(NAV_PATH.settingsPlans);
        }
        return RouteUtils.redirectWithReload(NAV_PATH.settingsAffiliatePlans, {
            serviceType,
        });
    };

    return (
        <GSContentContainer>
            <GSContentBody size={GSContentBody.size.MAX}>
                <section className="row col-12 affiliate-intro">
                    <div className="col-12">
                        <h3>{i18next.t("page.affiliate.intro.affiliateProgram")}</h3>
                        <p>
                            {i18next.t("page.affiliate.intro.affiliateProgram.text1")}
                        </p>
                        <p>
                            {i18next.t("page.affiliate.intro.affiliateProgram.text2")}
                        </p>
                        <p>
                            {i18next.t("page.affiliate.intro.affiliateProgram.text3",{xxx:CredentialUtils.textStoreXxxOrGoSell()})}
                        </p>
                        <p>
                            {i18next.t("page.affiliate.intro.affiliateProgram.text4")}
                        </p>
                    </div>
                    <div className="col-sm-6">
                        <div className="intro-title">
                            <GSImg
                                className="mt-4 mb-4"
                                style={{marginBottom: "35px", maxHeight: "400px"}}
                                src={stImage.reseller}
                                alt="reseller"
                            />
                            <h3>{i18next.t("page.affiliate.intro.reseller")}</h3>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text1")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text2")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text3",{xxx:CredentialUtils.textStoreXxxOrGo()})}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text4",{xxx:CredentialUtils.textStoreXxxOrGo(),xxx2:CredentialUtils.textStoreXxxOrGoSell()})}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text5")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text6")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text7")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.reseller.text8")}</p>
                        </div>

                        <div className="mt-5">
                            <GSComponentTooltip
                                placement={GSComponentTooltipPlacement.BOTTOM}
                                interactive
                                style={{
                                    width: "fit-content",
                                    display: "inline"
                                }}
                                disabled={hasResellerPermission}
                                html={
                                    <GSTrans t="page.affiliate.intro.activateNow.reseller"></GSTrans>
                                }
                            >
                                <span
                                    className={[
                                        "tooltip-text",
                                        hasResellerPermission ? "active" : "",
                                    ].join(" ")}
                                    onClick={() => {
                                        handlePaymentPackage(
                                            Constants.AFFILIATE_SERVICE_TYPE.RESELLER
                                        )
                                    }}
                                >
                                    {i18next.t("page.affiliate.intro.activateNow")}
                                </span>
                            </GSComponentTooltip>
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="intro-title">
                            <GSImg
                                className="mt-4 mb-4"
                                style={{marginBottom: "35px", maxHeight: "400px"}}
                                src={stImage.dropShip}
                                alt="dropship"
                            />
                            <h3>{i18next.t("page.affiliate.intro.dropship")}</h3>
                        </div>
                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.dropship.text1")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.dropship.text2")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.dropship.text3")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.dropship.text4")}</p>
                        </div>

                        <div className="text">
                            <div className="icon-circle"></div>
                            <p>{i18next.t("page.affiliate.intro.dropship.text5")}</p>
                        </div>

                        <div className="mt-5">
                            <GSComponentTooltip
                                placement={GSComponentTooltipPlacement.BOTTOM}
                                interactive
                                style={{
                                    width: "fit-content",
                                    display: "inline"
                                }}
                                disabled={hasDropshipPermission}
                                html={
                                    <GSTrans t="page.affiliate.intro.activateNow.dropship"></GSTrans>
                                }
                            >
                                <span
                                    className={[
                                        "tooltip-text",
                                        hasDropshipPermission ? "active" : "",
                                    ].join(" ")}
                                    onClick={() => {
                                        handlePaymentPackage(
                                            Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP
                                        )
                                    }}
                                >
                                    {i18next.t("page.affiliate.intro.activateNow")}
                                </span>
                            </GSComponentTooltip>
                        </div>
                    </div>
                </section>
            </GSContentBody>
            <GSContentFooter>
                <GSLearnMoreFooter
                    text={i18next.t("page.affiliate.intro.affiliate")}
                    linkTo={Constants.UrlRefs.LEARN_MORE_AFFILIATE}/>
            </GSContentFooter>
        </GSContentContainer>
    );
};

export default AffiliateIntro