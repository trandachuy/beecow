import React, {useEffect, useState} from 'react';
import './CallCenter.sass'
import {UikWidget, UikWidgetContent, UikWidgetHeader} from "../../../@uik";
import {Trans} from "react-i18next";
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import callCenterService from "../../../services/CallCenterService";
import {GSToast} from "../../../utils/gs-toast";
import i18next from "i18next";
import Constants from "../../../config/Constant";
import {NAV_PATH} from "../../../components/layout/navigation/Navigation";
import {Link} from "react-router-dom";
import moment from "moment";
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import GSTooltip from "../../../components/shared/GSTooltip/GSTooltip";
import {TokenUtils} from "../../../utils/token";
import GSComponentTooltip from "../../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {RouteUtils} from "../../../utils/route";
import {CredentialUtils} from "../../../utils/credential";
import { withRouter } from "react-router-dom";

const CallCenter = (props) => {
    const [stFetching, setStFetching] = useState(true);
    const [stPackageDetail, setStPackageDetail] = useState();
    const [stCallCenterStatus, setStCallCenterStatus] = useState(false)

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        callCenterService.getDetailOmiAccountPackage()
            .then(result => {
                if (result.packageId) {
                    setStCallCenterStatus(result.status)
                    setStPackageDetail(result)
                }
            })
            .catch(() => {
                GSToast.commonError();
            })
            .finally(() => {
                setStFetching(false);
            })
    };

    const getToastMessage = () => {
        if (!TokenUtils.onlyFreePackage()) {
            return 'page.callcenter.intro.connect.expiredHint'
        }

        return 'page.callcenter.intro.connect.goFreeHint'
    }

    return (
        <>
            {stPackageDetail && stPackageDetail.status !== Constants.OMI_CALL.STATUS.AWAIT_APPROVE &&
            <GSContentContainer className="call__center"
                                isLoading={stFetching}
                                loadingClassName="my-5"
            >
                <UikWidget className="gs-widget">
                    <UikWidgetHeader className="gs-widget__header">
                        <Trans i18nKey="page.setting.callCenter.title">
                            Call Center
                        </Trans>
                    </UikWidgetHeader>

                    <UikWidgetContent className="gs-widget__content">
                        <div className="setting__activation">
                            <div className="activation__block first">
                            <span className="gs-frm-input__label">
                                <Trans i18nKey="page.setting.callCenter.name">
                                    Name
                                </Trans>
                            </span>
                                <b className="account__line2">
                                    <Trans i18nKey="page.setting.callCenter.productLicenceDescription">
                                        Setup license
                                    </Trans>
                                </b>
                            </div>

                            <div className="activation__block">
                            <span className="gs-frm-input__label">
                                <Trans i18nKey="page.setting.callCenter.licenseStatus">
                                    Status
                                </Trans>
                            </span>
                                {!stPackageDetail &&
                                <b className='account__line2 text-uppercase text-gray'>
                                    <Trans i18nKey="page.setting.callCenter.notActivated">
                                        Not Activated
                                    </Trans>
                                </b>
                                }
                                {stPackageDetail &&
                                <b className='account__line2 text-uppercase text-green'>
                                    <Trans i18nKey="page.setting.callCenter.activated">
                                        Activated
                                    </Trans>
                                </b>
                                }
                            </div>
                            <div className="activation__block">
                                {!stPackageDetail &&
                                <GSComponentTooltip message={i18next.t(getToastMessage())}
                                                    theme={GSTooltip.THEME.DARK}
                                                    disabled={!TokenUtils.onlyFreePackage() && CredentialUtils.getOmiCallEnabled()}>
                                    <GSButton success className='notification-intro__left-col__activate'
                                              onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.settingsCallCenterPlans)}
                                              disabled={TokenUtils.onlyFreePackage() || stCallCenterStatus === Constants.OMI_CALL.STATUS.RENEWING}>
                                        <Trans i18nKey="page.setting.callCenter.activate">
                                            Activate
                                        </Trans>
                                    </GSButton>
                                </GSComponentTooltip>}
                            </div>
                        </div>
                        {stPackageDetail && stPackageDetail.packageId && <>
                            <div className={'setting__extensions d-mobile-none d-desktop-flex'}>
                                <table className={'table'}>
                                    <colgroup>
                                        <col style={{width: '22%'}}/>
                                        <col style={{width: '20%'}}/>
                                        <col style={{width: '22%'}}/>
                                        <col style={{width: '22%'}}/>
                                        <col style={{width: '14%'}}/>
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th><Trans i18nKey="page.setting.callCenter.head.plans"/></th>
                                        <th><Trans i18nKey="page.setting.callCenter.head.expiryDate"/></th>
                                        <th><Trans i18nKey="page.setting.callCenter.head.extensionNumber"/></th>
                                        <th><Trans i18nKey="page.setting.callCenter.head.extensionStatus"/></th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>{stPackageDetail.packageName}</td>
                                        <td>{stPackageDetail.expiredTime ? moment(stPackageDetail.expiredTime).format('DD-MM-YYYY') : ''}</td>
                                        <td>{stPackageDetail.extension.length}</td>
                                        <td className={[
                                            'text-uppercase',
                                            stCallCenterStatus === Constants.OMI_CALL.STATUS.EXPIRED ? 'text-red' : 'text-green'
                                        ].join(' ')}>
                                            <GSTrans
                                                t={`page.setting.callCenter.status.${stCallCenterStatus}`}/>
                                        </td>
                                        <td>
                                            <Link
                                                to={NAV_PATH.settingsCallCenterPlans + '?renewId=' + stPackageDetail.packageId}
                                                className="gsa-text--non-underline"
                                                onClick={(e) => {
                                                    stCallCenterStatus === Constants.OMI_CALL.STATUS.RENEWING && e.preventDefault()
                                                }}
                                            >
                                                <GSButton
                                                    success
                                                    onClick={() => {
                                                    }}
                                                    disabled={stCallCenterStatus === Constants.OMI_CALL.STATUS.RENEWING}
                                                >
                                                    <Trans i18nKey={`page.setting.callCenter.btn.${
                                                        stCallCenterStatus === Constants.OMI_CALL.STATUS.EXPIRED ? 'renew' : 'upgrade'
                                                    }`}/>
                                                </GSButton>
                                            </Link>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={'setting__extensions-mobile d-mobile-flex d-desktop-none'}>
                                <UikWidget className="gs-widget">
                                    <UikWidgetContent className="gs-widget__content">
                                        <div className="setting__account">
                                            <div className="account__block">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.setting.callCenter.head.extension"/>
                                            </span>
                                                <b className="account__line2">
                                                    {stPackageDetail.packageName}
                                                </b>
                                            </div>
                                            <div className="account__block">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.setting.callCenter.head.expiryDate"/>
                                            </span>
                                                <b className={'account__line2 text-uppercase'}>
                                                    {stPackageDetail.expiredTime ? moment(stPackageDetail.expiredTime).format('DD-MM-YYYY') : ''}
                                                </b>
                                            </div>
                                            <div className="account__block">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.setting.callCenter.head.extensionNumber"/>
                                            </span>
                                                <b className={'account__line2 text-uppercase'}>
                                                    {stPackageDetail.extension.length}
                                                </b>
                                            </div>
                                            <div className="account__block">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.setting.callCenter.head.extensionStatus"/>
                                            </span>
                                                <b className={[
                                                    'account__line2 text-uppercase',
                                                    stCallCenterStatus === Constants.OMI_CALL.STATUS.EXPIRED ? 'text-red' : 'text-green'
                                                ].join(' ')}>
                                                    <GSTrans
                                                        t={`page.setting.callCenter.status.${stCallCenterStatus}`}/>
                                                </b>
                                            </div>
                                            <div className="account__block">
                                                <Link
                                                    to={NAV_PATH.settingsCallCenterPlans + '?renewId=' + stPackageDetail.packageId}
                                                    onClick={(e) => {
                                                        stCallCenterStatus === Constants.OMI_CALL.STATUS.RENEWING && e.preventDefault()
                                                    }}
                                                    className="gsa-text--non-underline">
                                                    <GSButton
                                                        success
                                                        onClick={() => {
                                                        }}
                                                        disabled={stCallCenterStatus === Constants.OMI_CALL.STATUS.RENEWING}
                                                    >
                                                        <Trans i18nKey={`page.setting.callCenter.btn.${
                                                            stCallCenterStatus === Constants.OMI_CALL.STATUS.EXPIRED ? 'renew' : 'upgrade'
                                                        }`}/>
                                                    </GSButton>
                                                </Link>
                                            </div>
                                        </div>
                                    </UikWidgetContent>
                                </UikWidget>
                            </div>
                        </>}
                    </UikWidgetContent>
                    <UikWidgetContent className="gs-widget__content" hidden={true}>
                        <GSComponentTooltip message={i18next.t(getToastMessage())}
                                            theme={GSTooltip.THEME.DARK}
                                            disabled={!TokenUtils.onlyFreePackage() && CredentialUtils.getOmiCallEnabled()}>
                            <GSButton success className='notification-intro__left-col__activate'
                                      onClick={() => RouteUtils.redirectWithoutReload(props, NAV_PATH.settingsCallCenterPlans)}
                                      disabled={TokenUtils.onlyFreePackage() || stCallCenterStatus === Constants.OMI_CALL.STATUS.RENEWING}>
                                <Trans i18nKey="page.setting.callCenter.addExtension">
                                    Add extension
                                </Trans>
                            </GSButton>
                        </GSComponentTooltip>
                    </UikWidgetContent>
                </UikWidget>
            </GSContentContainer>}
        </>
    )
}


export default withRouter(CallCenter);
