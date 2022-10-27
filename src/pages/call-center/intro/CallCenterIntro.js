import React, {useEffect, useState} from 'react';
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import './CallCenterIntro.sass';
import GSButton from "../../../components/shared/GSButton/GSButton";
import i18next from "i18next";
import AlertModal from "../../../components/shared/AlertModal/AlertModal";
import {CredentialUtils} from "../../../utils/credential";
import {RouteUtils} from "../../../utils/route";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {TokenUtils} from "../../../utils/token";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import GSComponentTooltip from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import callCenterService from "../../../services/CallCenterService";
import Constants from "../../../config/Constant";
import {AgencyService} from "../../../services/AgencyService";

const CallCenterIntro = props => {
    const [awaitApprove, setAwaitApprove] = useState(false);

    useEffect(() => {
        const isOmiCallActive = CredentialUtils.getOmiCallEnabled()

        if (isOmiCallActive) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST)
        } else {
            callCenterService.getInfoCallCenterByStore()
                .then(res => {
                    CredentialUtils.setOmiCallData(res)

                    if (!res) {
                        return
                    }

                    switch (res.status) {
                        case Constants.OMI_CALL.STATUS.AWAIT_APPROVE:
                            setAwaitApprove(true)
                            callCenterService.recheckTenantActive()

                            break
                        default:
                            RouteUtils.redirectWithoutReload(props, NAV_PATH.callCenter.PATH_CALL_CENTER_HISTORY_LIST)

                            break
                    }
                })
                .catch(() => {
                    CredentialUtils.setOmiCallData(null)
                });
        }
    }, [])

    const onClickBtnEnable = () => {
        if (!TokenUtils.onlyFreePackage() && !CredentialUtils.getOmiCallEnabled()) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.settingsCallCenterPlans)
        }
    }

    const getOmiToastMessage = () => {
        if (!TokenUtils.onlyFreePackage()) {
            return 'page.callcenter.intro.connect.expiredHint'
        }

        return 'page.callcenter.intro.connect.goFreeHint'
    }

    return (
        <>
            <GSContentContainer className="call-center-intro">
                <GSContentBody className="notification-intro__body" size={GSContentBody.size.LARGE}>
                    {
                        <div className="row mb-4">
                            <div className="col-12 col-md-6 notification-intro__left-col">
                                <div className="notification-intro__title">
                                    <GSTrans
                                        t={!awaitApprove ? "page.callcenter.intro.title" : 'page.callcenter.intro.title.configuring'}/>
                                </div>
                                {
                                    !awaitApprove
                                        ? <>
                                            <div className="notification-intro__description">
                                                <GSTrans t="page.callcenter.intro.description"
                                                         values={{provider: AgencyService.getDashboardName()}}/>
                                            </div>
                                            <GSComponentTooltip message={i18next.t(getOmiToastMessage())}
                                                                theme={GSTooltip.THEME.DARK}>
                                                <GSButton success className='notification-intro__left-col__activate'
                                                          onClick={onClickBtnEnable}
                                                          disabled={TokenUtils.onlyFreePackage()}>
                                                    <GSTrans t={"page.callcenter.intro.connect"}/>
                                                </GSButton>
                                            </GSComponentTooltip>
                                        </>
                                        : <div className="notification-intro__description">
                                            <GSTrans t="page.callcenter.intro.modal.confirm"/>
                                        </div>
                                }
                            </div>
                            <div className="d-none d-sm-block col-12 col-md-6 notification-intro__right-col">
                                <div className="notification-intro__background">
                                </div>
                            </div>
                        </div>
                    }
                </GSContentBody>
            </GSContentContainer>
            <AlertModal ref={(el) => {
                this.alertModal = el
            }}/>
        </>
    );
};

export default CallCenterIntro;
