import React, {Component} from 'react';
import i18next from 'i18next';
import './CurrentPlanInfo.sass'
import {Trans} from 'react-i18next';
import {UikWidget, UikWidgetContent} from '../../../@uik';
import {CredentialUtils} from '../../../utils/credential';
import Constants from '../../../config/Constant';
import {Link} from 'react-router-dom';
import beehiveService from '../../../services/BeehiveService';
import {cancelablePromise} from '../../../utils/promise';
import moment from 'moment';
import GSContentContainer from '../../../components/layout/contentContainer/GSContentContainer';
import GSButton from '../../../components/shared/GSButton/GSButton';

class CurrentPlanInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isFetching: true,
            currentPlanInfos: []
        };

        this.checkPlanExpired = this.checkPlanExpired.bind(this);

    }

    componentDidMount() {

        // Check expire time
        this.pmCurrentPlan = cancelablePromise(beehiveService.getCurrentPlanList());

        this.pmCurrentPlan.promise
            .then(result => {
                const currentPlans = result;
                let currentPlanInfos = []

                currentPlans.forEach(currentPlan => {
                    let accountStatus = this.checkPlanExpired(currentPlan);

                    currentPlanInfos.push({
                        accountStatus: accountStatus,
                        regTime: currentPlan.userFeature.registerPackageDate,
                        expTime: currentPlan.userFeature.expiredPackageDate,
                        current: currentPlan.packageName,
                        pkgType: currentPlan.userFeature.packagePay,
                        packageId: currentPlan.userFeature.packageId,
                        expiredId: currentPlan.userFeature.expiredId
                    })
                })


                this.setState({
                    isFetching: false,
                    currentPlanInfos: currentPlanInfos
                });

                // CredentialUtils.setRegTime(currentPlan.userFeature.registerPackageDate);
                // CredentialUtils.setExpiredTimeInMS(currentPlan.userFeature.expiredPackageDate);
                // CredentialUtils.setPackageName(currentPlan.packageName);
                // CredentialUtils.setPackageType(currentPlan.userFeature.packagePay);
                // CredentialUtils.setPackageId(currentPlan.userFeature.packageId);
            })
            .catch(() => {
            });

    }

    checkPlanExpired(currentPlan) {
        // if account is TRIAL => always show ACTIVATED
        if (CredentialUtils.getPackageType() === Constants.PackageType.TRIAL) {
            return Constants.AccountStatus.ACTIVATED;
        }

        // Check account status: Expired or Activated
        const expiredDate = moment(currentPlan.userFeature.expiredPackageDate * 1000);
        const now = moment(new Date())
        const mLeft = expiredDate.diff(now, 'minutes');

        if (mLeft < 0) {
            // Expired
            return Constants.AccountStatus.EXPIRED
        } else {
            // Activated
            return Constants.AccountStatus.ACTIVATED
        }
    }

    componentWillUnmount() {
        if (this.pmCurrentPlan) this.pmCurrentPlan.cancel();
    }

    render() {
        return (
            <GSContentContainer className="current__plan_information"
                                isLoading={ this.state.isFetching }
                                loadingClassName="my-5"
            >
                <div className="see-plan">
                    <Link to="setting/plans" className=" gsa-text--non-underline">
                        <GSButton primary>
                            <Trans i18nKey="page.setting.account.see_plan">
                                See Plans
                            </Trans>
                        </GSButton>
                    </Link>
                </div>

                {
                    this.state.currentPlanInfos &&
                    this.state.currentPlanInfos.map(currentPlanInfo => {
                        if (currentPlanInfo.packageId < 6) {
                            return null
                        }
                        return (
                            <UikWidget className="gs-widget" key={ currentPlanInfo.packageId }>
                                <UikWidgetContent className="gs-widget__content">
                                    <div className="setting__account">
                                        <div className="account__block">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.setting.account.memberSince">
                                                    memberSince
                                                </Trans>
                                            </span>
                                            <b className="account__line2">
                                                { moment(currentPlanInfo.regTime * 1000).locale(CredentialUtils.getLangKey()).format('DD-MM-YYYY') }
                                            </b>
                                        </div>

                                        { CredentialUtils.getPackageType() !== Constants.PackageType.TRIAL &&
                                        <>

                                            <div className="account__block">
                                                <span className="gs-frm-input__label">
                                                    <Trans i18nKey="page.setting.account.expiryDate">
                                                        Current plan
                                                    </Trans>
                                                </span>
                                                <b className="account__line2">
                                                    { moment(currentPlanInfo.expTime * 1000).locale(CredentialUtils.getLangKey()).format('DD-MM-YYYY') }
                                                </b>
                                            </div>

                                            <div className="account__block">
                                                <span className="gs-frm-input__label">
                                                    <Trans i18nKey="page.setting.account.currentPlan">
                                                        Current plan
                                                    </Trans>
                                                </span>
                                                <b className="account__line2">
                                                    { currentPlanInfo.pkgType === 'TRIAL' ?
                                                        i18next.t('page.setting.account.trial')
                                                        : CredentialUtils.textStoreReplaceGoToXXX(currentPlanInfo.current)
                                                    }
                                                </b>
                                            </div>

                                        </> }

                                        <div className="account__block">
                                            <span className="gs-frm-input__label">
                                                <Trans i18nKey="page.setting.account.accountStatus">
                                                    Account status
                                                </Trans>
                                            </span>
                                            <b className={ 'account__line2 text-uppercase ' + (currentPlanInfo.accountStatus === Constants.AccountStatus.ACTIVATED ? ' text-green'
                                                : 'text-red') }>
                                                { currentPlanInfo.accountStatus === Constants.AccountStatus.ACTIVATED ? i18next.t('page.setting.account.active')
                                                    : i18next.t('page.setting.account.expired') }
                                            </b>
                                        </div>
                                        <div className="account__block">
                                            <Link
                                                to={ `setting/plans?currentStep=2&packageId=${ currentPlanInfo.packageId }&expiredId=${ currentPlanInfo.expiredId }` }
                                                // to={{pathname: "setting/plans", state: {
                                                // packageId: currentPlanInfo.packageId, 
                                                // expiredId: currentPlanInfo.expiredId, 
                                                // currentStep : 2}}}  
                                                className=" gsa-text--non-underline">
                                                <GSButton success>
                                                    <Trans i18nKey="layout.header.expiredPlanBar.btn.renew">
                                                        Renew
                                                    </Trans>
                                                </GSButton>
                                            </Link>
                                        </div>
                                    </div>
                                </UikWidgetContent>
                            </UikWidget>
                        )

                    })

                }
            </GSContentContainer>

        )
    }
}

export default CurrentPlanInfo;
