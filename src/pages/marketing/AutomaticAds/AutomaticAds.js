import React, {Component} from 'react';
import GSWidget from "../../../components/shared/form/GSWidget/GSWidget";
import './AutomaticAds.sass'
import GSContentContainer from "../../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../../components/layout/contentBody/GSContentBody";
import {Trans} from "react-i18next";
import {UikToggle} from '../../../@uik'
import GSButton from "../../../components/shared/GSButton/GSButton";
import GSContentFooter from "../../../components/layout/GSContentFooter/GSContentFooter";
import GSLearnMoreFooter from "../../../components/shared/GSLearnMoreFooter/GSLearnMoreFooter";
import i18next from "i18next";
import Constants from "../../../config/Constant";
import GSContentHeader from "../../../components/layout/contentHeader/GSContentHeader";
import GSContentHeaderRightEl
    from "../../../components/layout/contentHeader/ContentHeaderRightEl/GSContentHeaderRightEl";
import AutomaticAdsAnalytic from "./Analytic/AutomaticAdsAnalytic";
import Intro from "./Intro/Intro";
import CreditModal from "./BuyingCreditModal/CreditModal";
import ChangeBudgetModal from "./ChangeBudgetModal/ChangeBudgetModal";
import {Tooltip} from 'react-tippy'
import facebookService from '../../../services/FacebookService';
import {GSToast} from "../../../utils/gs-toast";
import LoadingScreen from "../../../components/shared/LoadingScreen/LoadingScreen";
import {CurrencyUtils} from "../../../utils/number-format";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import GSTrans from "../../../components/shared/GSTrans/GSTrans";
import {CredentialUtils} from "../../../utils/credential";
import {LoadingStyle} from "../../../components/shared/Loading/Loading";
import GSTooltip, {GSTooltipIcon} from "../../../components/shared/GSTooltip/GSTooltip";

const PERMITTED_TASK = {
    ADVERTISE: 'ADVERTISE',
    ANALYZE: 'ANALYZE'
};
const WARNING_MESSAGE = {
    TOP_UP: 'TOP_UP',
    HAS_WAITING_ORDER: 'HAS_WAITING_ORDER',
    AD_IS_APPROVING: 'AD_IS_APPROVING',
    AD_APPROVE_FAIL: 'AD_APPROVE_FAIL',
    PAGE_PERMISSION_IS_WAITING: 'PAGE_PERMISSION_IS_WAITING',
    GRANT_PAGE_PERMISSION_REQUEST: 'GRANT_PAGE_PERMISSION_REQUEST',
    PAGE_PERMISSION_IS_GRANTED: 'PAGE_PERMISSION_IS_GRANTED',
    REQUEST_PERMISSION: 'REQUEST_PERMISSION',
    AD_WAS_CREATED_FAIL: 'AD_WAS_CREATED_FAIL',
    USER_NEED_TO_BE_ASSIGNED: 'USER_NEED_TO_BE_ASSIGNED'
}
const STORE_STATUS = {
    NOT_EXIST: 'NOT_EXIST',
    WAITING_FOR_APPROVE: 'WAITING_FOR_APPROVE',
    NOT_BUDGET_NOT_CAMPAIGN: 'NOT_BUDGET_NOT_CAMPAIGN',
    HAS_BUDGET_NOT_CAMPAIGN: 'HAS_BUDGET_NOT_CAMPAIGN',
    HAS_BUDGET_WITH_CAMPAIGN: 'HAS_BUDGET_WITH_CAMPAIGN'
}
class AutomaticsAds extends Component {


    state = {

        // show screen or modal
        showIntro: false,
        showScreen: false,
        showToolTip1: false,
        showToolTip2: false,
        showCreditModal: false,
        showChangeBudgetModal: false,

        // show chart ?
        hasChart: false,

        // running is on or off
        runningAdStatus: false,

        // allow on / off the running button
        allowRunningAd: false,

        // current balance
        currentBalance: 0,

        // daily budget
        dailyBudget: 0,

        // list warning
        lstWarning: [],

        // is processing
        isProcessing: false,
        fbPages: [],
        dropdownOpen: false,
        selectedPage: {
            id: -1,
            name: i18next.t("component.automatic_ads.facebook.select.page")
        },
        permissionDto: {},
        campaignStatus: {},

        hasCampaign: false,
        campaignId: undefined
       
    }

    constructor(props) {
        super(props);

        this.renderToolTip1 = this.renderToolTip1.bind(this)
        this.renderToolTip2 = this.renderToolTip2.bind(this)
        this.openToolTip1 = this.openToolTip1.bind(this)
        this.openToolTip2 = this.openToolTip2.bind(this)
        this.openToolTip2 = this.openToolTip2.bind(this)
        this.finishGuide = this.finishGuide.bind(this);
        this.openCreditModal = this.openCreditModal.bind(this)
        this.onCloseStoreCreditModal = this.onCloseStoreCreditModal.bind(this)
        this.openChangeBudgetModal = this.openChangeBudgetModal.bind(this)
        this.onCloseChangeBudgetModal = this.onCloseChangeBudgetModal.bind(this)
        this.onOrOffRunningAds = this.onOrOffRunningAds.bind(this)
        this.renderScreen = this.renderScreen.bind(this)
        this.authorizeFaceBook = this.authorizeFaceBook.bind(this);
        this.doRequestPagePermission = this.doRequestPagePermission.bind(this);
        this.getFbPages = this.getFbPages.bind(this);
        this.toggle = this.toggle.bind(this);
        this.selectPage = this.selectPage.bind(this);
        this.renderApprovalPending = this.renderApprovalPending.bind(this);
    }

    componentDidMount() {
        let lstWarning = [];
        this.setState({
            isProcessing: true
        })


        // check the status of buying credit
        facebookService.checkBuyingCredit();

        // get store campaign detail
        facebookService.getStoreCreditInfo().then(res => {
            let data = res

            let hasCampaign = data.showChart ? true : false
            let hasChart = data.showChart ? true : false
            let storeStatus = data.storeCreditStatus
            let currentBalance = data.currentBalance
            let lstWarning = data.warningStatus ? data.warningStatus : [];
            let dailyBudget = data.dailyBudget
            let campaignStatus = data.campaignStatus
            this.state.permissionDto.pageName = data.fbPageName;
            let campaignId = res.campaignId;

            if (storeStatus === STORE_STATUS.NOT_EXIST) {
                this.setState({
                    showIntro: true,
                    showIntroRequest: true,
                })

            } else if (storeStatus === STORE_STATUS.WAITING_FOR_APPROVE) {
                this.setState({
                    showIntro: true,
                    showIntroRequest: false
                })

            } else if (storeStatus === STORE_STATUS.NOT_BUDGET_NOT_CAMPAIGN) {
                this.setState({
                    showScreen: true,
                    allowRunningAd: false,
                    runningAdStatus: false
                })

                // show guide in case first time
                if (lstWarning && lstWarning.indexOf(WARNING_MESSAGE.HAS_WAITING_ORDER) === -1) {
                    this.openToolTip1();
                }

            } else {
                //-----------------------------------//
                // in case has money
                //-----------------------------------//

                // set default
                this.setState({
                    showScreen: true
                })

                if (storeStatus === STORE_STATUS.HAS_BUDGET_NOT_CAMPAIGN) {

                    // set default status for toggle
                    this.setState({
                        allowRunningAd: (lstWarning && lstWarning.indexOf(WARNING_MESSAGE.PAGE_PERMISSION_IS_GRANTED) > -1) ? true : false,
                        runningAdStatus: false
                    })
    
                }else if (storeStatus === STORE_STATUS.HAS_BUDGET_WITH_CAMPAIGN){
                    
                    // set default status for toggle
                    this.setState({
                        allowRunningAd: true,
                        runningAdStatus: campaignStatus === 'VALUE_ACTIVE' ? true : false
                    })
    
                    // check status of ad
                    if (lstWarning && lstWarning.indexOf(WARNING_MESSAGE.AD_IS_APPROVING) > -1) {
                        // in case ad is approving
                        this.setState({
                            allowRunningAd: false,
                            runningAdStatus: false
                        })
    
                    } else if (lstWarning && lstWarning.indexOf(WARNING_MESSAGE.AD_APPROVE_FAIL) > -1) {
                        // in case ad was approved fail
                        this.setState({
                            allowRunningAd: false,
                            runningAdStatus: false
                        })
                    }
                }

                if(lstWarning && lstWarning.indexOf(WARNING_MESSAGE.TOP_UP) > -1 && lstWarning.indexOf(WARNING_MESSAGE.PAGE_PERMISSION_IS_GRANTED) > 1){
                    // not allow all
                    this.setState({
                       allowRunningAd: false,
                       runningAdStatus: false
                   })

               }
                // In case waiting for user approve
                else if(lstWarning && lstWarning.indexOf(WARNING_MESSAGE.PAGE_PERMISSION_IS_WAITING) > -1){
                    // not allow all
                    this.setState({
                        allowRunningAd: false,
                        runningAdStatus: false
                    })

                } 
                else if(lstWarning && lstWarning.indexOf(WARNING_MESSAGE.USER_NEED_TO_BE_ASSIGNED) > -1){

                    // not allow all
                    this.setState({
                        allowRunningAd: false,
                        runningAdStatus: false
                    })

                }else if(lstWarning && lstWarning.indexOf(WARNING_MESSAGE.AD_WAS_CREATED_FAIL) > -1){
                        
                    // not allow all
                    this.setState({
                        allowRunningAd: false,
                        runningAdStatus: false
                    })
                }
            }
            
            this.setState({
                isProcessing: false,
                currentBalance: currentBalance,
                dailyBudget: dailyBudget,
                lstWarning: lstWarning,
                permissionDto: this.state.permissionDto,
                campaignStatus: campaignStatus,
                hasChart : hasChart,
                hasCampaign : hasCampaign,
                campaignId: campaignId
            })

        }).catch(e => {
            this.setState({
                isProcessing: false
            })
            GSToast.commonError();
        });
    }

    openToolTip1() {
        this.setState({
            showToolTip1: true,
            showToolTip2: false
        })
    }

    openToolTip2() {
        this.setState({
            showToolTip1: false,
            showToolTip2: true
        })
    }

    finishGuide() {
        this.setState({
            showToolTip2: false
        })
    }

    onOrOffRunningAds(e) {
        let checked = e.target.checked

        this.setState({isProcessing : true})
        if(this.state.campaignId){
            if(this.state.campaignStatus === 'VALUE_PAUSED'){
                facebookService.switchCampaignStatus({storeId: CredentialUtils.getStoreId(), status: 'VALUE_ACTIVE'}).then(res =>{
                    this.setState({isProcessing : false})
                    this.componentDidMount()
                }).catch(e =>{
                    if(e.response.status === 400 && e.response.data && e.response.data.errorKey === 'ran.out.budget'){
                        GSToast.error(i18next.t('component.automatic_ads.change_budget_screen.not_enough_money'))
                    }
                    this.setState({isProcessing : false})
                    this.componentDidMount()
                })
            }
            else if(this.state.campaignStatus === 'VALUE_ACTIVE'){
                facebookService.switchCampaignStatus({storeId: CredentialUtils.getStoreId(), status: 'VALUE_PAUSED'}).then(res =>{
                    this.setState({isProcessing : false})
                    this.componentDidMount()
                }).catch(e =>{
                    if(e.response.status === 400 && e.response.data && e.response.data.errorKey === 'ran.out.budget'){
                        GSToast.error(i18next.t('component.automatic_ads.change_budget_screen.not_enough_money'))
                    }
                    this.setState({isProcessing : false})
                    this.componentDidMount()
                })
        }
        }else{
            facebookService.enableTargeting({storeId: CredentialUtils.getStoreId()}).then(res =>{
                this.setState({isProcessing : false})
                this.componentDidMount()
            }).catch(e =>{
                if(e.response.status === 400 && e.response.data && e.response.data.errorKey === 'ran.out.budget'){
                    GSToast.error(i18next.t('component.automatic_ads.change_budget_screen.not_enough_money'))
                }
                this.setState({isProcessing : false})
                this.componentDidMount()
            })
        }
        // set state
        this.setState({
            runningAdStatus: checked
        });
       
    }

    openCreditModal() {
        this.setState({
            showCreditModal: true
        })
    }

    onCloseStoreCreditModal(success) {
        this.setState({
            showCreditModal: false
        })

        if (success) {
            this.componentDidMount()
        }
    }

    openChangeBudgetModal(e) {
        e.preventDefault()
        if (this.state.allowRunningAd) {
            this.setState({
                showChangeBudgetModal: true
            })
        }
    }

    onCloseChangeBudgetModal(action) {
        this.setState({
            showChangeBudgetModal: false
        })

        if(action === 'done' && !this.state.hasCampaign){
            this.componentDidMount()
        }
    }

    authorizeFaceBook() {
        FB.login((res) => { this.getFbPages(); }, { "scope": "pages_show_list,email" });
    }

    getFbPages() {
        FB.api("/me?fields=id,name,email,accounts", (res) => {
            let data = {
                fbAccount: res.email,
                permittedTask: [PERMITTED_TASK.ADVERTISE, PERMITTED_TASK.ANALYZE]
            }
            if (res && !res.error) {
                let warnings = this.state.lstWarning.filter(warn => warn !== WARNING_MESSAGE.GRANT_PAGE_PERMISSION_REQUEST);
                warnings.push(WARNING_MESSAGE.REQUEST_PERMISSION);
                this.setState({ fbPages: res.accounts.data, lstWarning: warnings, permissionDto: data })
            }
        });
    }

    doRequestPagePermission() {
        if (this.state.selectedPage.id === -1) {
            return false;
        }
        this.state.permissionDto.pageId = this.state.selectedPage.id;
        this.state.permissionDto.pageName = this.state.selectedPage.name
        facebookService.requestPermission(this.state.permissionDto).then(res => {
            let warnings = this.state.lstWarning.filter(warn => warn !== WARNING_MESSAGE.REQUEST_PERMISSION);
            if (res === "PENDING")
                warnings.push(WARNING_MESSAGE.PAGE_PERMISSION_IS_WAITING);
            this.setState({ lstWarning: warnings, permissionDto: this.state.permissionDto })
        })
    }
    toggle() {
        this.setState(pre => ({ dropdownOpen: !pre.dropdownOpen }));
    }
    selectPage(page) {
        this.setState({ selectedPage: page });
    }
    renderToolTip1() {
        return (
            <Tooltip
                theme="light"
                interactive={true}
                size='small'
                open={this.state.showToolTip1}
                arrow
                html={(
                    <div className="automatic-ads-guide__tooltip">
                        <div className="header">
                            <span className="icon icon-change__budget"></span>
                            <span className="header-title">
                                <Trans i18nKey="component.automatic_ads.tooltip1.1" >
                                    Change Budget
                                </Trans>
                            </span>
                        </div>
                        <div className="tooltip-content">
                            <Trans i18nKey="component.automatic_ads.tooltip1.2" >
                                You can change how much to spend on ads
                            </Trans>
                        </div>
                        <div className="button-group__tooltip">
                            <span>
                                <i className="progress-dot current"></i>
                                <i className="progress-dot blur"></i>
                            </span>
                            <GSButton primary className="gs-button  gs-button__green" onClick={this.openToolTip2}>
                                <Trans i18nKey="common.btn.next" >
                                    Next
                                </Trans>
                            </GSButton>
                        </div>
                    </div>
                )}>
            </Tooltip>
        );
    }

    renderToolTip2() {
        return (
            <Tooltip
                theme="light"
                interactive={true}
                size='small'
                open={this.state.showToolTip2}
                arrow
                html={(
                    <div className="automatic-ads-guide__tooltip">
                        <div className="header">
                            <span className="icon icon-change__power"></span>
                            <span className="header-title">
                                <Trans i18nKey="component.automatic_ads.tooltip2.1" >
                                    Enable/Disable Automatic Ads
                                </Trans>
                            </span>
                        </div>
                        <div className="tooltip-content">
                            <Trans i18nKey="component.automatic_ads.tooltip2.2" >
                                You can toggle Automatic Ads status here
                            </Trans>
                        </div>
                        <div className="button-group__tooltip">
                            <span>
                                <i className="progress-dot current"></i>
                                <i className="progress-dot current"></i>
                            </span>
                            <GSButton primary className="gs-button  gs-button__green" onClick={this.finishGuide}>
                                <Trans i18nKey="common.btn.done" >
                                    Done
                                </Trans>
                            </GSButton>
                        </div>
                    </div>
                )}>
            </Tooltip>
        );
    }

    renderWarning(textHead, text, buttonName, functionName, warning) {
        const isFbPageEmpty = this.state.fbPages.length <= 0;
        return (
            <GSContentHeader>
                <GSContentHeaderRightEl className={isFbPageEmpty ? "automatic-ads__header_2" : "automatic-ads__header_2 request-permision"} >
                    <div className="text-group">
                        <div className="icon-alert"></div>
                        <div className="text-alert">
                            <span className="text-alert__head">{textHead}</span>
                            <span>{text}</span>
                        </div>
                        {
                            !isFbPageEmpty && warning && (
                                <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
                                    <DropdownToggle caret>
                                        <span>{this.state.selectedPage.name}</span>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {
                                            this.state.fbPages.map(page => {
                                                return (<DropdownItem key={page.id} onClick={() => this.selectPage(page)}>
                                                    <span>{page.name}</span>
                                                </DropdownItem>)
                                            })
                                        }

                                    </DropdownMenu>
                                </Dropdown>
                            )
                        }
                    </div>
                    {
                        buttonName &&
                        <div className="btn-group__ads">
                            <GSButton primary className="gs-button  gs-button__green btn-save" onClick={functionName}>
                                {buttonName}
                            </GSButton>
                        </div>
                    }

                </GSContentHeaderRightEl>
            </GSContentHeader>
        );
    }

    renderApprovalPending(textHead, text) {
        return (
            <GSContentHeader>
                <GSWidget className="automatic-ads__header_2 approval-pending">
                    <div className="text-group">
                        <div className="icon-information"></div>
                        <div className="text-alert">
                            <span className="text-alert__head">{textHead}</span>
                            <span>{text}</span>
                        </div>
                    </div>
                </GSWidget>
            </GSContentHeader>
        );
    }
    renderScreen() {
        return (
            <GSContentContainer className="automatic-ads-container__screen">
                {
                    this.state.isProcessing &&
                    <LoadingScreen loadingStyle={LoadingStyle.DUAL_RING_WHITE}/>
                }

                <GSContentHeader title={i18next.t("component.navigation.automatic_ads")} >
                    <GSContentHeaderRightEl className="automatic-ads__header_1">
                        <div className="current-balance">
                            <span className="prefix-title">
                                <Trans i18nKey="component.automatic_ads.main_screen.current_balance" >
                                    Current Balance
                                </Trans>
                            </span>
                            <span>{CurrencyUtils.formatThousand(this.state.currentBalance)}đ</span>
                        </div>
                        <div className="daily-budget">
                            <span>
                                <span className="prefix-title">
                                    <GSTooltip message={i18next.t("component.automatic_ads.daily_budget_tooltip")} icon={GSTooltipIcon.INFO_CIRCLE}/>
                                    &nbsp;&nbsp;
                                    <Trans i18nKey="component.automatic_ads.main_screen.daily_budget" >
                                        Daily Budget
                                    </Trans>:
                                </span>
                                <span> {CurrencyUtils.formatThousand(this.state.dailyBudget)}đ</span>
                            </span>
                            <span>
                                <a className="change-budget" onClick={this.openChangeBudgetModal} >
                                    <Trans i18nKey="component.automatic_ads.main_screen.change_budget" >
                                        Change Budget
                                    </Trans>
                                </a>
                                {this.renderToolTip1()}
                            </span>
                        </div>
                        <div className={["status-campaign",
                                (this.state.lstWarning && this.state.lstWarning.indexOf(WARNING_MESSAGE.AD_IS_APPROVING) > -1) 
                                ? "organge"
                                : (this.state.lstWarning && this.state.lstWarning.indexOf(WARNING_MESSAGE.AD_APPROVE_FAIL) > -1) || (this.state.lstWarning && this.state.lstWarning.indexOf(WARNING_MESSAGE.AD_WAS_CREATED_FAIL) > -1)
                                ? "red"
                                : ""
                            ].join(' ')}>
                            {this.renderToolTip2()}
                            <UikToggle
                                className="status-campaign__toggle"
                                label={this.state.runningAdStatus === true
                                    ?
                                    i18next.t('component.automatic_ads.main_screen.running')
                                    :
                                    i18next.t('component.automatic_ads.main_screen.not_running')
                                }
                                checked={this.state.runningAdStatus}
                                onChange={(e) => this.onOrOffRunningAds(e)}
                                disabled={!this.state.allowRunningAd}
                            />
                        </div>
                    </GSContentHeaderRightEl>
                </GSContentHeader>

                {/* WARNING AREA */}
                {this.state.lstWarning &&
                    this.state.lstWarning.map(warning => {
                        if (warning === WARNING_MESSAGE.TOP_UP) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.buying_credit.insufficient'), // header
                                i18next.t('component.automatic_ads.buying_credit.insufficient_warrning'), // content
                                i18next.t('component.automatic_ads.buying_credit.top_up'), // button name
                                this.openCreditModal // button function
                            );
                        }
                        if (warning === WARNING_MESSAGE.HAS_WAITING_ORDER) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.buying_credit.modal.notice'),
                                i18next.t('component.automatic_ads.buying_credit.modal.notice_content')
                            );
                        }
                        if (warning === WARNING_MESSAGE.GRANT_PAGE_PERMISSION_REQUEST) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.facebook.page.permission'), // header
                                i18next.t('component.automatic_ads.facebook.page.permission.content'), // content
                                i18next.t('common.btn.authorize'), // button name
                                this.authorizeFaceBook // button function
                            );
                        }
                        if (warning === WARNING_MESSAGE.REQUEST_PERMISSION) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.facebook.page.request.permission'),
                                i18next.t('component.automatic_ads.facebook.page.request.permission.content'),
                                i18next.t('common.btn.send.request'), // button name
                                this.doRequestPagePermission,
                                warning
                            );
                        }
                        if (warning === WARNING_MESSAGE.PAGE_PERMISSION_IS_WAITING) {
                            return this.renderApprovalPending(
                                i18next.t('component.automatic_ads.facebook.page.permission.approval.pending'),
                                <GSTrans t={"component.automatic_ads.facebook.page.permission.approval.pending.content"} values={{pageName: this.state.permissionDto.pageName}}>a<b>a</b></GSTrans>
                            );
                        }
                        if (warning === WARNING_MESSAGE.AD_IS_APPROVING) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.ad.ad_is_being_approve_title'),
                                <GSTrans t={"component.automatic_ads.ad.ad_is_being_approve_content"} />
                            );
                        }
                        if (warning === WARNING_MESSAGE.AD_APPROVE_FAIL) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.ad.ad_was_approved_fail_title'),
                                <GSTrans t={"component.automatic_ads.ad.ad_was_approved_fail_content"} />
                            );
                        }
                        if (warning === WARNING_MESSAGE.AD_WAS_CREATED_FAIL) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.ad.ad_was_created_fail_title'),
                                <GSTrans t={"component.automatic_ads.ad.ad_was_created_fail_content"} />
                            );
                        }
                        if (warning === WARNING_MESSAGE.USER_NEED_TO_BE_ASSIGNED) {
                            return this.renderWarning(
                                i18next.t('component.automatic_ads.ad.page_authen_fail_title'),
                                <GSTrans t={"component.automatic_ads.ad.page_authen_fail_content"} />
                            );
                        }
                    })
                }

                {/* CHART AREA */}
                <GSContentBody size={GSContentBody.size.MAX} centerChildren>
                    <GSWidget>
                        <AutomaticAdsAnalytic />
                    </GSWidget>
                </GSContentBody>

                <GSContentFooter>
                    <GSLearnMoreFooter
                        text={i18next.t("component.automatic_ads.intro.learn_more")}
                        linkTo={Constants.UrlRefs.LEARN_MORE_MARKETING_AUTOMATIC_ADS} />
                </GSContentFooter>

                <CreditModal
                    showCreditModal={this.state.showCreditModal}
                    onClose={this.onCloseStoreCreditModal}
                    dailyBudget={this.state.dailyBudget}
                />

                <ChangeBudgetModal
                    showChangeBudgetModal={this.state.showChangeBudgetModal}
                    onClose={this.onCloseChangeBudgetModal}
                    dailyBudget={this.state.dailyBudget}
                    hasCampaign={this.state.hasCampaign}
                />
            </GSContentContainer>
        );
    }

    render() {
        if (this.state.showIntro) {
            return (<Intro isApproved={this.state.showIntroRequest} />);
        } else if (this.state.showScreen) {
            return this.renderScreen();
        } else {
            return (<></>)
        }
    }
}

export default AutomaticsAds;
