import './LoyaltyPointIntro.sass'

import React, {useEffect, useState} from 'react'
import GSContentBody from "../../../../components/layout/contentBody/GSContentBody";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import GSComponentTooltip from "../../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import i18next from "i18next";
import GSTooltip from "../../../../components/shared/GSTooltip/GSTooltip";
import GSButton from "../../../../components/shared/GSButton/GSButton";
import GSContentContainer from "../../../../components/layout/contentContainer/GSContentContainer";
import {TokenUtils} from "../../../../utils/token";
import {CredentialUtils} from "../../../../utils/credential";
import {RouteUtils} from "../../../../utils/route";
import {withRouter} from "react-router-dom";
import {NAV_PATH} from "../../../../components/layout/navigation/Navigation";
import {GSToast} from "../../../../utils/gs-toast";
import beehiveService from "../../../../services/BeehiveService";

const LoyaltyPointIntro = (props) => {
    const [stLoading, setStLoading] = useState(true)

    useEffect(() => {
        beehiveService.getLoyaltyPointSettingByStore()
            .then(setting => {
                if (!setting) {
                    return
                }

                RouteUtils.redirectWithoutReloadWithData(props, NAV_PATH.loyaltyPointSetting, {
                    loyaltyPointSetting: setting
                })
            })
            .finally(() => {
                setStLoading(false)
            })
    }, [])

    const handleActivateLoyaltyPoint = () => {
        beehiveService.activeLoyaltyPointOfStore()
            .then(() => {
                RouteUtils.redirectWithoutReload(props, NAV_PATH.loyaltyPointSetting)
            })
            .catch(() => GSToast.commonError())
    }

    return (
        <>
            <GSContentContainer className="loyalty-point-intro" isLoading={stLoading}>
                <GSContentBody className="loyalty-point-intro__body" size={GSContentBody.size.LARGE}>
                    {
                        <div className="d-flex flex-column flex-md-row align-items-md-center p-4 w-100 h-100">
                            <div className="loyalty-point-intro__left-col">
                                <div className="loyalty-point-intro__title">
                                    <GSTrans t={"page.loyaltyPoint.intro.title"}/>
                                </div>
                                <div className="loyalty-point-intro__description">
                                    <GSTrans t="page.loyaltyPoint.intro.description"/>
                                </div>
                                <div className="loyalty-point-intro__description font-weight-bold">
                                    {i18next.t("page.loyaltyPoint.intro.benefit")}:
                                </div>
                                <div className="loyalty-point-intro__description loyalty-point-intro__list">
                                    <ul>
                                        <li>{i18next.t("page.loyaltyPoint.intro.benefit1")}</li>
                                        <li>{i18next.t("page.loyaltyPoint.intro.benefit2")}</li>
                                        <li className='white-space-nowrap'>{i18next.t("page.loyaltyPoint.intro.benefit3")}</li>
                                    </ul>
                                </div>
                                <GSComponentTooltip message={i18next.t('page.loyaltyPoint.intro.hint')}
                                                    theme={GSTooltip.THEME.DARK}
                                                    disabled={!TokenUtils.onlyFreeOrLeadOrSocialPackage()}>
                                    <GSButton success className='loyalty-point-intro__left-col__activate'
                                              onClick={handleActivateLoyaltyPoint}
                                              disabled={TokenUtils.onlyFreeOrLeadOrSocialPackage()}>
                                        <GSTrans t={"page.loyaltyPoint.intro.active"}/>
                                    </GSButton>
                                </GSComponentTooltip>
                            </div>
                            <div className="loyalty-point-intro__background">
                            </div>
                        </div>
                    }
                </GSContentBody>
            </GSContentContainer>
        </>
    )
}

export default withRouter(LoyaltyPointIntro)