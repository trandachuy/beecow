import React, {Component} from 'react';
import Loading from '../../../../components/shared/Loading/Loading';
import PropTypes from 'prop-types'
import './SettingPlansStep1.sass'
import {Trans} from 'react-i18next';
import {UikFormInputGroup, UikRadio, UikTabContainer, UikTabItem} from '../../../../@uik'
import {CurrencyUtils} from '../../../../utils/number-format';
import GSTooltip, {GSTooltipIcon, GSTooltipPlacement} from '../../../../components/shared/GSTooltip/GSTooltip';
import {CredentialUtils} from '../../../../utils/credential';
import GSButton from '../../../../components/shared/GSButton/GSButton';
import GSTrans from '../../../../components/shared/GSTrans/GSTrans';
import {withRouter} from 'react-router-dom';
import {RouteUtils} from '../../../../utils/route';
import {NAV_PATH} from '../../../../components/layout/navigation/Navigation';
import beehiveService from '../../../../services/BeehiveService'
import {GSToast} from '../../../../utils/gs-toast';
import i18next from 'i18next';
import {TokenUtils} from '../../../../utils/token';
import GSComponentTooltip from '../../../../components/shared/GSComponentTooltip/GSComponentTooltip';
import Constants from '../../../../config/Constant';

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

const TABS = {
    PLAN_1: 0,
    PLAN_2: 1,
    PLAN_3: 2
}

class SettingPlansStep1 extends Component {

    /*
    selectedPricingPlan:
        1. 24 months
        2. 12 months
        3. 1 month
    */
    PLAN_24M = 3
    PLAN_12M = 2
    PLAN_1M = 1

    state = {
        selectedPricingPlan: this.PLAN_12M,
        currentTab: TABS.PLAN_1,
        currentPlan: this.props.dataObj.plans[0],
        userPackage: -1
    }

    fromRegister


    constructor(props) {
        super(props);


        this.renderSale = this.renderSale.bind(this);
        this.showDetail = this.showDetail.bind(this);
        this.renderPricingSelector = this.renderPricingSelector.bind(this);
        this.onChangePricingPlan = this.onChangePricingPlan.bind(this);
        this.renderDetails = this.renderDetails.bind(this);
        this.mapPlanToMonth = this.mapPlanToMonth.bind(this);
        this.renderBottomButtons = this.renderBottomButtons.bind(this);
        this.renderPricingTextButton = this.renderPricingTextButton.bind(this);
        this.mapMonthToPlan = this.mapMonthToPlan.bind(this);
        this.findMonthByExpiredId = this.findMonthByExpiredId.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.renderMobilePlanDetails = this.renderMobilePlanDetails.bind(this);
        this.onClickBtnActivate = this.onClickBtnActivate.bind(this);
        this.getCallCenterPlanStatus = this.getCallCenterPlanStatus.bind(this)
        this.getOmiToastMessage = this.getOmiToastMessage.bind(this)
        this.isGoFreeNotPurchaseCallCenter = this.isGoFreeNotPurchaseCallCenter.bind(this)
        this.handleActivateGoCall = this.handleActivateGoCall.bind(this)
        this.fromRegister = this.props.location.pathname === '/wizard/payment'
    }

    componentDidMount() {
        const packageId = CredentialUtils.getPackageId()
        this.setState({
            userPackage: packageId
        })
    }

    getOmiToastMessage() {
        if (CredentialUtils.getOmiCallRenewing()) {
            return
        }
        if (CredentialUtils.getOmiCallExpired()) {
            return 'page.callcenter.intro.connect.expiredCCHint'
        }
        if (!TokenUtils.onlyFreePackage()) {
            return 'page.callcenter.intro.connect.expiredHint'
        }

        return 'page.callcenter.intro.connect.goFreeHint'
    }

    handleActivateGoCall() {
        if (
            TokenUtils.getPackageFeatures()
            && !TokenUtils.onlyFreePackage()
            && !CredentialUtils.getOmiCallEnabled()
            && !CredentialUtils.getOmiCallAwaitApprove()
            && !CredentialUtils.getOmiCallRenewing()
        ) {
            RouteUtils.redirectWithoutReload(this.props, NAV_PATH.settingsCallCenterPlans)
        }
    }

    //not apply for goFree
    getCallCenterPlanStatus() {
        if (CredentialUtils.getOmiCallEnabled()) {
            return 'page.setting.plans.step1.planDetail.goCall.activated'
        }

        return 'page.setting.plans.step1.planDetail.goCall.activate'
    }

    isGoFreeNotPurchaseCallCenter() {
        return (TokenUtils.onlyFreePackage() && !CredentialUtils.getOmiCallEnabled()) || CredentialUtils.getOmiCallAwaitApprove()
    }

    changeTab(index, planId) {
        this.setState({
            currentTab: index,
            currentPlan: planId
        })
    }

    mapPlanToMonth(plan) {
        switch (plan) {
            case this.PLAN_12M:
                return 12
            case this.PLAN_24M:
                return 24
            case this.PLAN_1M:
                return 1
        }
    }

    mapMonthToPlan(month) {
        switch (month) {
            case 1:
                return this.PLAN_1M
            case 12:
                return this.PLAN_12M
            case 24:
                return this.PLAN_24M
        }
    }


    renderSale() {
        if (this.props.dataObj.sales && this.props.dataObj.sales.title) {
            return (
                <div className="sale-info">
                    <div className="sale-info__title">
                        {this.props.dataObj.sales.title}
                    </div>
                    <div className="sale-info__descriptions">
                        <pre> {this.props.dataObj.sales.descriptions} </pre>
                    </div>
                </div>
            )
        }
    }

    renderPricingSelector(platform) {
        let options = []
        const pricingPlans = this.props.dataObj.pricingPlans.sort((a, b) => b.month - a.month).entries()
        for (const [index, option] of pricingPlans) {
            if (option.month !== 1) {
                options.push(
                    <UikRadio
                        key={index}
                        defaultChecked={this.state.selectedPricingPlan === option.expiredId}
                        label={(
                            <>
                                {option.saving > 0 ?
                                    <Trans i18nKey="page.setting.plans.step1.planDetail.table.saving"
                                           values={{
                                               month: option.month,
                                               percent: option.saving
                                           }}>
                                        month months <span>(Saving percent%)</span>
                                    </Trans>
                                    :
                                    <>
                                        {option.month + ' '}
                                        <Trans i18nKey="page.setting.plans.step1.planDetail.months"/>
                                    </>
                                }
                            </>
                        )}
                        name={platform + "_pricingOtp"}
                        onClick={() => this.onChangePricingPlan(option.expiredId)}
                    />
                )
            } else {
                options.push(
                    <UikRadio
                        key={index}
                        defaultChecked={this.state.selectedPricingPlan === option.expiredId}
                        label={(
                            <>
                                {'1 '}
                                <Trans i18nKey="page.setting.plans.step1.planDetail.month"/>
                            </>
                        )}
                        name={platform + "_pricingOtp"}
                        onClick={() => this.onChangePricingPlan(option.expiredId)}
                    />
                )
            }
        }

        return (
            <UikFormInputGroup className="gs-atm__flex-col--flex-center
            gs-atm__flex-align-items--start
            plan-pricing__selector">
                {options}
            </UikFormInputGroup>
        )
    }

    onClickBtnActivate(planObj) {
        // send email here
        beehiveService.activeTheTierPackage({
            redirectURL: window.location.origin + "/login"
        }).then(res => {
            RouteUtils.redirectWithoutReloadWithData(this.props, NAV_PATH.wizard + '/waiting-for-approve', {
                planObj: planObj
            })
        }).catch(e => {
            GSToast.commonError()
        })


    }

    findMonthByExpiredId(expiredId) {
        const pricingPlans = this.props.dataObj.pricingPlans
        return pricingPlans.filter(plan => plan.expiredId === expiredId).map(plan2 => plan2.month)
    }

    renderPlanPricing(planId) {
        const planObj = this.props.dataObj.plans.filter(plan => plan.id === planId)[0]
        let pricings = []

        const pricingPlans = this.props.dataObj.pricingPlans.sort((a, b) => b.month - a.month)
        // check free
        if (pricingPlans.filter(plan => planObj[`p${plan.expiredId}`] === 0).length === pricingPlans.length) { // => FREE
            pricings.push(
                <>
                    <GSButton primary className="plan-info__price-btn--disable text-uppercase font-weight-bold">
                        <GSTrans t={"page.order.detail.information.paymentMethod.FREE"}/>
                    </GSButton>
                    <GSButton primary className="plan-info__price-btn--disable">
                        {!this.fromRegister &&
                        <span className="color-gray text-uppercase">
                                <GSTrans t="page.setting.plans.activated"/>
                            </span>

                        }
                    </GSButton>
                    {this.fromRegister &&
                    <GSButton primary onClick={() => this.onClickBtnActivate(planObj)}>
                        <GSTrans t="common.btn.activate"/>
                    </GSButton>
                    }
                </>
            )
        } else {
            for (const [index, plan] of Object.entries(pricingPlans)) {
                pricings.push(
                    <GSButton primary
                              key={plan.expiredId}
                              onClick={() => this.onChoosePlan(planObj, this.state.selectedPricingPlan)}
                              className={this.state.selectedPricingPlan === plan.expiredId ? '' : 'plan-info__price-btn--disable'}>
                        <Trans i18nKey="page.setting.plans.step1.planDetail.table.pricePerMonth"
                               values={{
                                   price: CurrencyUtils.formatMoneyByCurrency(planObj[`p${plan.expiredId}`], planObj.currency)
                               }}
                        />
                    </GSButton>
                )
            }
        }


        return (
            <div className="gs-atm__flex-col--flex-center plan-info__price-btn-container">
                {pricings}
            </div>
        )
    }

    renderPricingTextButton(expiredId, planIndex) {
        const planObj = this.props.dataObj.plans.filter(plan => plan.id === planIndex)[0]
        return (
            <span className="bottom-button__text">
                        <Trans i18nKey="page.setting.plans.step1.planDetail.table.pricePerMonth"
                               values={{
                                   price: CurrencyUtils.formatMoneyByCurrency(planObj[`p${expiredId}`], planObj.currency)
                               }}
                        />
                    </span>

        )
    }

    renderMobilePlanDetails(plan) {
        const planId = plan.id
        let details = []
        for (const [gIndex, detail] of this.props.dataObj.details.entries()) {
            details.push(
                <div key={'g' + gIndex} className="mobile-details__row-group">
                    {detail.groupName}
                </div>
            )
            for (const [index, feature] of detail.features.entries()) {
                details.push(
                    <div key={'g' + gIndex + 'f' + index} className="mobile-details__row-feature">
                        <div>
                            <div className="gs-atm__flex-row--space-between">
                                <div>
                                    {feature.content}
                                    {feature.tips && <GSTooltip message={feature.tips} icon={GSTooltipIcon.INFO_CIRCLE}
                                                                placement={GSTooltipPlacement.BOTTOM}/>}
                                </div>
                                <img
                                    src={`/assets/images/setting_plans/${feature.plans.includes(planId) ? 'yes' : 'no'}.svg`}/>
                                {/*{feature.tips && <GSTooltip message={feature.tips} icon={GSTooltipIcon.INFO_CIRCLE} placement={GSTooltipPlacement.BOTTOM}/>}*/}
                            </div>
                        </div>

                    </div>
                )
            }
        }

        return details
    }

    renderDetails() {
        let details = []
        for (const [gIndex, detail] of this.props.dataObj.details.entries()) {
            details.push(
                <tr key={'g' + gIndex} className="details__row-group">
                    <td colSpan={this.props.dataObj.plans.length + 2}>
                        {detail.groupName}
                    </td>
                </tr>
            )
            for (const [index, feature] of detail.features.entries()) {
                details.push(
                    <tr key={'g' + gIndex + 'f' + index} className="details__row-feature">
                        <td>
                            <div className="gs-atm__flex-row--space-between">
                                {feature.content}
                                {feature.tips && <GSTooltip message={feature.tips} icon={GSTooltipIcon.INFO_CIRCLE}
                                                            placement={GSTooltipPlacement.BOTTOM}/>}
                            </div>
                        </td>
                        {this.props.dataObj.plans.map((plan, index) => {
                            return (
                                <td key={index}>
                                    <img
                                        src={`/assets/images/setting_plans/${feature.plans.includes(plan.id) ? 'yes' : 'no'}.svg`}/>
                                </td>
                            )
                        })}
                        <td key={index}>
                            <img
                                src={`/assets/images/setting_plans/${feature.plans.includes(Constants.CALL_CENTER_PLAN_ID) ? 'yes' : 'no'}.svg`}/>
                        </td>
                    </tr>
                )
            }
        }

        return details
    }

    renderMobileButton(plan) {
        const planObj = this.props.dataObj.plans.filter(p => p.id === plan.id)[0]

        if (!planObj) {
            return
        }

        return (
            <>
                {planObj[`p${this.state.selectedPricingPlan}`] !== 0 ?
                    <div className="mobile-details__row-bottom-btn">
                        <GSButton primary
                                  style={{width: '100%'}}
                                  onClick={() => this.onChoosePlan(plan, this.state.selectedPricingPlan)}>
                            {this.renderPricingTextButton(this.state.selectedPricingPlan, plan.id)}
                        </GSButton>
                    </div>
                    : this.fromRegister &&
                    <div className="mobile-details__row-bottom-btn">
                        <GSButton primary className="w-100" onClick={() => this.onClickBtnActivate(planObj)}>
                            <GSTrans t="common.btn.activate"/>
                        </GSButton>
                    </div>
                }
            </>
        )
    }

    renderBottomButtons() {


        return (
            <tr className="details__row-bottom-btn">
                <td>

                </td>

                {this.props.dataObj.plans.map((plan, index) => {
                    const planObj = this.props.dataObj.plans.filter(p => p.id === plan.id)[0]
                    return (
                        <td key={index}>
                            {planObj[`p${this.state.selectedPricingPlan}`] !== 0 &&
                            <>
                                <div className="details__row-bottom-months">
                                    <span className="bottom-button__text">
                                        {this.findMonthByExpiredId(this.state.selectedPricingPlan) + ' '}
                                        <Trans i18nKey="page.setting.plans.step1.planDetail.months"/>
                                    </span>
                                </div>
                                <GSButton primary
                                          style={{width: '100%'}}
                                          onClick={() => this.onChoosePlan(plan, this.state.selectedPricingPlan)}>
                                    {this.renderPricingTextButton(this.state.selectedPricingPlan, plan.id)}
                                </GSButton>
                            </>}
                            {this.fromRegister && planObj[`p${this.state.selectedPricingPlan}`] === 0 &&
                            <>
                                <div style={{
                                    height: '49px'
                                }}>
                                    {/*<span className="bottom-button__text">*/}
                                    {/*    {this.findMonthByExpiredId(this.state.selectedPricingPlan) + ' '}*/}
                                    {/*    <Trans i18nKey="page.setting.plans.step1.planDetail.months"/>*/}
                                    {/*</span>*/}
                                </div>
                                <GSButton primary className="w-100" onClick={() => this.onClickBtnActivate(planObj)}>
                                    <GSTrans t="common.btn.activate"/>
                                </GSButton>
                            </>
                            }

                            {!this.fromRegister && planObj[`p${this.state.selectedPricingPlan}`] === 0 &&
                            <span className="color-gray text-uppercase">
                                    <GSTrans t="page.setting.plans.activated"/>
                                </span>
                            }
                        </td>
                    )
                })}
                <td
                    className={[
                        'setting-plans-step1__go-call__status',
                        this.isGoFreeNotPurchaseCallCenter() && 'setting-plans-step1__go-call__status--disabled',
                        CredentialUtils.getOmiCallEnabled() && 'setting-plans-step1__go-call__status--activated'
                    ].join(' ')}
                    onClick={this.handleActivateGoCall}>
                    <GSComponentTooltip message={i18next.t(this.getOmiToastMessage())}
                                        theme={GSTooltip.THEME.DARK}
                                        disabled={CredentialUtils.getOmiCallEnabled() || CredentialUtils.getOmiCallRenewing()}>
                        <Trans i18nKey={this.getCallCenterPlanStatus()}/>
                    </GSComponentTooltip>
                </td>
            </tr>
        )
    }

    render() {
        return (
            <>
                {this.props.dataObj === null ?
                    <Loading/>
                    :
                    <div className="setting-plans-step1 gs-ani__fade-in">
                        {this.renderSale()}

                        {/*DESKTOP*/}
                        <table className="plans-table d-desktop-table d-mobile-none">
                            <tbody>
                            {/*HEADER*/}
                            <tr className="plans-table__plan-info plans-table__row-plan-name">
                                <th>
                                    <Trans i18nKey="page.setting.plans.step1.planDetail.table.features"/>
                                </th>

                                {this.props.dataObj.plans.map((plan, index) => {

                                    return (
                                        <th className="plans-table__cell-plan-name plans-table__cell-plan-name--withArrow"
                                            key={index}>

                                            <div className="gs-atm__flex-col--flex-start gs-atm__flex-col--ai-center">

                                                <div>
                                                    {CredentialUtils.textStoreReplaceGoToXXX(plan.name)}
                                                </div>
                                            </div>
                                        </th>
                                    )
                                })
                                }
                                <th className="plans-table__cell-plan-name plans-table__cell-plan-name--withArrow">

                                    <div className="gs-atm__flex-col--flex-start gs-atm__flex-col--ai-center">

                                        <div>
                                            {CredentialUtils.textStoreReplaceGoToXXX('GOCALL')}
                                        </div>
                                    </div>
                                </th>
                            </tr>
                            <tr className="plans-table__plan-info plans-table__plan-price">
                                <td>
                                    {this.renderPricingSelector("d")}
                                </td>
                                {this.props.dataObj.plans.map((plan, index) => {
                                    return (
                                        <td key={index}>
                                            {this.renderPlanPricing(plan.id)}
                                        </td>
                                    )
                                })}
                                <td
                                    className={[
                                        'setting-plans-step1__go-call__status',
                                        this.isGoFreeNotPurchaseCallCenter() && 'setting-plans-step1__go-call__status--disabled',
                                        CredentialUtils.getOmiCallEnabled() && 'setting-plans-step1__go-call__status--activated'
                                    ].join(' ')}
                                    onClick={this.handleActivateGoCall}>
                                    <GSComponentTooltip message={i18next.t(this.getOmiToastMessage())}
                                                        theme={GSTooltip.THEME.DARK}
                                                        disabled={CredentialUtils.getOmiCallEnabled() || CredentialUtils.getOmiCallRenewing()}>
                                        <Trans i18nKey={this.getCallCenterPlanStatus()}/>
                                    </GSComponentTooltip>
                                </td>
                            </tr>

                            <tr className='no-border'>
                                <td className='text-right' colSpan='6'>* <Trans
                                    i18nKey='page.setting.plans.step1.vatexclude'>Giá trên chưa bao gồm 10% VAT</Trans>
                                </td>
                            </tr>

                            {this.renderDetails()}

                            {this.renderBottomButtons()}

                            <tr className='no-border'>
                                <td className='text-right' colSpan='6'>* <Trans
                                    i18nKey='page.setting.plans.step1.vatexclude'>Giá trên chưa bao gồm 10% VAT</Trans>
                                </td>
                            </tr>

                            </tbody>
                        </table>

                        {/*MOBILE*/}
                        <div className="mobile-detail d-mobile-block d-desktop-none">
                            <UikTabContainer>
                                {this.props.dataObj.plans.map((plan, index) => {
                                    return (
                                        <UikTabItem key={plan.id} active={this.state.currentTab === index}
                                                    onClick={() => this.changeTab(index, plan)}>
                                            {/*<img src={`/assets/images/setting_plans/pkg_${plan.id}_icon.svg`}/>*/}
                                            {CredentialUtils.textStoreReplaceGoToXXX(plan.name)}
                                        </UikTabItem>
                                    )
                                })}
                                <UikTabItem key={Constants.CALL_CENTER_PLAN_ID} active={this.state.currentTab === Constants.CALL_CENTER_PLAN_ID}
                                            onClick={() => this.changeTab(Constants.CALL_CENTER_PLAN_ID, {id: Constants.CALL_CENTER_PLAN_ID})}>
                                    {CredentialUtils.textStoreReplaceGoToXXX('GoCALL')}
                                </UikTabItem>
                            </UikTabContainer>
                            <div className="plan-tab-pricing-selector">
                                {this.state.currentPlan.id !== Constants.CALL_CENTER_PLAN_ID
                                    ? this.renderPricingSelector("m")
                                    : <div
                                        className={[
                                            'setting-plans-step1__go-call__status',
                                            this.isGoFreeNotPurchaseCallCenter() && 'setting-plans-step1__go-call__status--disabled',
                                            CredentialUtils.getOmiCallEnabled() && 'setting-plans-step1__go-call__status--activated'
                                        ].join(' ')}
                                        onClick={this.handleActivateGoCall}>
                                        <GSComponentTooltip
                                            message={i18next.t(this.getOmiToastMessage())}
                                            theme={GSTooltip.THEME.DARK}
                                            disabled={CredentialUtils.getOmiCallEnabled() || CredentialUtils.getOmiCallRenewing()}>
                                            <Trans i18nKey={this.getCallCenterPlanStatus()}/>
                                        </GSComponentTooltip>
                                    </div>}
                            </div>
                            <div>
                                {this.renderMobileButton(this.state.currentPlan)}
                            </div>
                            <div className='mb-3 text-right' hidden={this.state.currentPlan.id === Constants.CALL_CENTER_PLAN_ID}>
                                * <Trans i18nKey='page.setting.plans.step1.vatexclude'>Giá trên chưa bao gồm 10%
                                VAT</Trans>
                            </div>
                            <div className="plan-tab-content">
                                {this.renderMobilePlanDetails(this.state.currentPlan)}
                            </div>
                            <div className="details__row-bottom-months">
                                {this.state.currentPlan.id !== Constants.CALL_CENTER_PLAN_ID ? <span className="bottom-button__text">
                                    {this.findMonthByExpiredId(this.state.selectedPricingPlan) + ' '}
                                        <Trans i18nKey="page.setting.plans.step1.planDetail.months"/>
                                </span>
                                    : <div
                                        className={[
                                            'setting-plans-step1__go-call__status',
                                            this.isGoFreeNotPurchaseCallCenter() && 'setting-plans-step1__go-call__status--disabled',
                                            CredentialUtils.getOmiCallEnabled() && 'setting-plans-step1__go-call__status--activated'
                                        ].join(' ')}
                                        onClick={this.handleActivateGoCall}>
                                        <GSComponentTooltip
                                            message={i18next.t(this.getOmiToastMessage())}
                                            theme={GSTooltip.THEME.DARK}
                                            disabled={CredentialUtils.getOmiCallEnabled() || CredentialUtils.getOmiCallRenewing()}>
                                            <Trans i18nKey={this.getCallCenterPlanStatus()}/>
                                        </GSComponentTooltip>
                                    </div>}
                            </div>
                            <div>
                                {this.renderMobileButton(this.state.currentPlan)}
                            </div>
                            <div className='mb-3 text-right' hidden={this.state.currentPlan.id === Constants.CALL_CENTER_PLAN_ID}>
                                * <Trans i18nKey='page.setting.plans.step1.vatexclude'>Giá trên chưa bao gồm 10%
                                VAT</Trans>
                            </div>
                        </div>
                    </div>
                }
            </>
        );
    }

    onChangePricingPlan(index) {
        this.setState({
            selectedPricingPlan: index
        })
    }

    onChoosePlan(plan, pricingPlan) {
        this.props.onChoosePlan(plan, pricingPlan)
    }

    showDetail() {
        // this.refCard1.showDetailWithoutCallback()
        // this.refCard2.showDetailWithoutCallback()
        // this.refCard3.showDetailWithoutCallback()
    }
}

SettingPlansStep1.propTypes = {
    dataObj: PropTypes.shape({
        plans: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        })),
        details: PropTypes.arrayOf(PropTypes.shape({
            features: PropTypes.arrayOf(PropTypes.shape({
                content: PropTypes.string,
                plans: PropTypes.arrayOf(PropTypes.number),
                tips: PropTypes.string,
            }),),
            groupName: PropTypes.string,
        }),),
        pricingPlans: PropTypes.arrayOf(PropTypes.shape({
            month: PropTypes.number,
            saving: PropTypes.number,
            expiredId: PropTypes.number,
        }),),
    }),
    onChoosePlan: PropTypes.func.isRequired
}

export default withRouter(SettingPlansStep1)
