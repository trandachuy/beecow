/* eslint-disable default-case */
/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 31/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {Component} from "react";
import GSContentContainer from "../../components/layout/contentContainer/GSContentContainer";
import GSContentBody from "../../components/layout/contentBody/GSContentBody";
import "./Home.sass";
import GSTrans from "../../components/shared/GSTrans/GSTrans";
import {CredentialUtils} from "../../utils/credential";
import GSWidget from "../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../components/shared/form/GSWidget/GSWidgetContent";
import GSWidgetHeader from "../../components/shared/form/GSWidget/GSWidgetHeader";
import {Link} from "react-router-dom";
import {RouteUtils} from "../../utils/route";
import {NAV_PATH} from "../../components/layout/navigation/Navigation";
import storageService from "../../services/storage";
import Constants from "../../config/Constant";
import GSContentHeader from "../../components/layout/contentHeader/GSContentHeader";
import {cancelablePromise} from "../../utils/promise";
import beehiveService from "../../services/BeehiveService";
import {BCOrderService} from "../../services/BCOrderService";
import GSComponentTooltip, {GSComponentTooltipPlacement} from "../../components/shared/GSComponentTooltip/GSComponentTooltip";
import {lazadaService} from "../../services/LazadaService";
import GSButton from "../../components/shared/GSButton/GSButton";
import {TokenUtils} from "../../utils/token";
import {AgencyService} from "../../services/AgencyService";
import ModalHeader from "reactstrap/es/ModalHeader";
import ModalBody from "reactstrap/es/ModalBody";
import ModalFooter from "reactstrap/es/ModalFooter";
import {Modal} from "reactstrap";
import PrivateComponent from "../../components/shared/PrivateComponent/PrivateComponent";
import {PACKAGE_FEATURE_CODES} from "../../config/package-features";
import {STAFF_PERMISSIONS} from "../../config/staff-permissions";
import {ROLES} from "../../config/user-roles";
import {ImageUtils} from "../../utils/image";
import _ from "lodash";
import moment from "moment";
import userThemeEngineService from "../../services/UserThemeEngineService";
import AlertModal, {AlertModalType} from "../../components/shared/AlertModal/AlertModal";
import i18n from "../../config/i18n";
import storeService from "../../services/StoreService";
import shopeeService from "../../services/ShopeeService";

class Home extends Component {
    state = {
        isLoading: true,
        isShowOTAModal: false,
        cardStatus: {
            gopos: false,
            goapp: false,
            goweb: false,
            onlineShop: {
                status: 'BUILDING'
            },
            mobileApp: {
                arStatus: 'NOT_BUILD',
                ioStatus: 'NOT_BUILD',
                arLink: '#',
                ioLink: '#',
                otaUrl: undefined
            },
            saleChannel: {
                isSPActive: !!CredentialUtils.getShopeeStoreId(),
                isLZActive: !!CredentialUtils.getLazadaStoreId()
            }
        },

        orderConfirm: 0,
        orderConfirmLoading: false,
        orderCompleted: 0,
        orderCompletedLoading: false,
        reservationConfirm: 0,
        reservationCompleted: 0,
    }

    isStaff = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)

    refStaffConfirm = React.createRef(null)

    constructor(props) {
        super(props);

        this.renderBuilding = this.renderBuilding.bind(this);
        this.renderMobileApp = this.renderMobileApp.bind(this);
        this.closeOTAModal = this.closeOTAModal.bind(this);
        this.renderIconDownload = this.renderIconDownload.bind(this);
        this.checkPlanInUse = this.checkPlanInUse.bind(this);
    }

    closeOTAModal() {
        this.setState({
            isShowOTAModal: false
        });
        storageService.setToLocalStorage(Constants.STORAGE_KEY_OTA, true);
    }

    isShopeeSync() {
        shopeeService.getManageAccountsByBcStoreId()
            .then(response => {
                const hasConnected = response.find(s => s.connectStatus === 'CONNECTED')
                this.state.cardStatus.saleChannel.isSPActive = !!hasConnected;
                this.setState({cardStatus: this.state.cardStatus})
            })
            .catch(e => {
                this.state.cardStatus.saleChannel.isSPActive = false;
                this.setState({cardStatus: this.state.cardStatus})
            })
    }

    isLazadaSync() {
        let self = this;
        if (!CredentialUtils.getLazadaStoreId()) {
            this.pmlazadaService = cancelablePromise(lazadaService.getAccountByBcStoreId(storageService.get(Constants.STORAGE_KEY_STORE_ID)))
            this.pmlazadaService.promise
                .then(response => {
                    if (response.sellerId) {
                        self.state.cardStatus.saleChannel.isLZActive = true;
                        self.setState({cardStatus: this.state.cardStatus});
                    }
                })
                .catch(e => {
                    if (e.response && e.response.status !== Constants.HTTP_STATUS_NOT_FOUND) {
                        self.state.cardStatus.saleChannel.isLZActive = false;
                        self.setState({cardStatus: this.state.cardStatus});
                    }

                })
        }
    }

    handleShowIntercom() {
        if (!CredentialUtils.getShowSupportChat() && process.env.ENABLE_INTERCOM == 'true') {
            window.Intercom('show');
        }
    }

    renderLoading() {
        return (
            <div className={["mobile-loading"].join(' ')}>
                <span className="ol-loading ol-loading--sm"/>
            </div>
        )
    }

    componentWillUnmount() {
        if (this.pmFetch) this.pmFetch.cancel()
        if (this.pmlazadaService) this.pmlazadaService.cancel()
        if (this.pmshopeeService) this.pmshopeeService.cancel()
        if (this.statisticReservationFetch) this.statisticReservationFetch.cancel()
    }

    componentDidMount() {
        this.handleShowIntercom()
        this.isShopeeSync();
        this.isLazadaSync();

        const lstPromise = [
            beehiveService.getSFAndMBBuildStatus(),
            beehiveService.getCurrentPlanList(),
        ]
        this.pmFetch = cancelablePromise(Promise.all(lstPromise))
        this.pmFetch.promise
            .then(([status, plans]) => {
                // check data for the gopos feature
                const currentPlanPos = plans.find(ele => ele.userFeature.packageId === 8)
                const currentPlanApp = plans.find(ele => ele.userFeature.packageId === 7)
                const currentPlanWeb = plans.find(ele => ele.userFeature.packageId === 6)

                // set data for mobile config
                this.setState({
                    isLoading: false,
                    cardStatus: {
                        gopos: this.checkPlanInUse(currentPlanPos),
                        goapp: this.checkPlanInUse(currentPlanApp),
                        goweb: this.checkPlanInUse(currentPlanWeb),
                        onlineShop: {
                            status: status.sfWebsite ? status.sfWebsite : 'BUILDING'
                        },
                        mobileApp: {
                            arStatus: status.sfAndroid ? status.sfAndroid : 'NOT_BUILD',
                            ioStatus: status.sfIos ? status.sfIos : 'NOT_BUILD',
                            arLink: status.bundleId ? `https://play.google.com/store/apps/details?id=${status.bundleId}` : '#',
                            ioLink: status.appstoreUrl ? `${status.appstoreUrl}` : '#',
                            otaUrl: status.otaUrl ? status.otaUrl : undefined
                        },
                        saleChannel: {
                            ...this.state.cardStatus.saleChannel
                        }
                    }
                });

                if (status.otaUrl && storageService.getFromLocalStorage(Constants.STORAGE_KEY_OTA) !== 'true') {
                    this.setState({
                        isShowOTAModal: true
                    });
                }
            })
            .catch(e => {
                this.setState({
                    isLoading: false
                })
            })

        // get statistic of reservation the dashboard
        this.statisticReservationFetch = cancelablePromise(BCOrderService.getStatisticOfDashboard())
        this.statisticReservationFetch.promise
            .then(result => {
                const data = result
                this.setState({
                    reservationConfirm: data.reservationConfirm,
                    reservationCompleted: data.reservationCompleted
                })
            }).catch(e => {
        })

        // get statistic of the order with status to confirm
        this.setState({
            orderConfirmLoading: true
        })
        beehiveService.getDashboardOrder(CredentialUtils.getStoreId(), {
            status: 'TO_SHIP'
        }).then(result => {
            const totalItem = parseInt(result.headers['x-total-count']);
            this.setState({
                orderConfirm: totalItem,
                orderConfirmLoading: false
            })
        }).catch(e => {
            this.setState({
                orderConfirmLoading: false
            })
        });

        // get statistic of the order with status completed
        this.setState({
            orderCompletedLoading: true
        })
        beehiveService.getDashboardOrder(CredentialUtils.getStoreId(), {
            status: 'DELIVERED'
        }).then(result => {
            const totalItem = parseInt(result.headers['x-total-count']);
            this.setState({
                orderCompleted: totalItem,
                orderCompletedLoading: false
            })
        }).catch(e => {
            this.setState({
                orderCompletedLoading: false
            })
        });

        this.fetchActiveBranch();
    }

    fetchActiveBranch() {
        const that = this;
        if (this.isStaff) {
            storeService.getListActiveBranchOfStaff().then(data => {
                if (_.isEmpty(data)) {
                    that.openStaffAccess();
                }
            })
        }
    }

    openStaffAccess() {
        if (this.refStaffConfirm && this.refStaffConfirm.current) {
            this.refStaffConfirm.current.openModal({
                type: AlertModalType.ALERT_TYPE_SUCCESS,
                title: i18n.t("page.product.modal.branch.staff.permission.title"),
                messages: i18n.t("page.product.modal.branch.staff.permission.notallow"),
                modalBtn: i18n.t("page.product.modal.branch.staff.permission.logout"),
                closeCallback: () => {
                    RouteUtils.redirectTo(NAV_PATH.logout);
                }
            });
        }
    }

    checkPlanInUse(currentPlan) {

        if (!currentPlan || !currentPlan.userFeature.packageId) {
            return false
        }

        // Check account status: Expired or Activated
        const expiredDate = moment(currentPlan.userFeature.expiredPackageDate * 1000);
        const now = moment(new Date())
        const mLeft = expiredDate.diff(now, 'minutes');

        if (mLeft < 0) {
            // Expired
            return false
        } else {
            // Activated
            return true
        }
    }

    renderBuilding(imgSrc, className) {
        return (
            <div className={["mobile-loading", className].join(' ')}>
                <span className="ol-loading"/>
                <img className="ol-logo" src={imgSrc}/>
            </div>
        )
    }

    renderIconDownload() {
        if (_.isEmpty(this.state.cardStatus.mobileApp.otaUrl)) {
            return (
                <></>
            )
        }

        return (
            <div className="card-bottom">
                <a href={this.state.cardStatus.mobileApp.otaUrl}>
                    <img alt="gp" src={"/assets/images/icon-download.svg"} className="ico-download-ota"/>
                </a>
            </div>
        )

    }

    renderMobileApp(type) {
        if (type === 'GP') { // => Google play
            switch (this.state.cardStatus.mobileApp.arStatus) {
                case 'NOT_BUILD':
                    return (
                        <GSComponentTooltip
                            placement={GSComponentTooltipPlacement.TOP}
                            interactive
                            html={
                                <GSTrans t="page.home.card.mobileApps.toolTips.androidBuild">
                                    iOS app is only available for <b>Advance</b> package. <a href="/setting/plans">Upgrade
                                    now!</a>
                                </GSTrans>
                            }>
                            <div className="mobile-loading">
                                <img alt="gp" className="btn-upgrade" src="/assets/images/home/rocket.png"/>
                                <img alt="gp" className="gsa-width-100"
                                     src={"/assets/images/home/ico-google-play.svg"}/>
                            </div>
                        </GSComponentTooltip>
                    )
                case 'BUILDING':
                    return (
                        <GSComponentTooltip
                            placement={GSComponentTooltipPlacement.TOP}
                            interactive
                            html={
                                <GSTrans t="page.home.card.mobileApps.toolTips.androidBuilding">
                                </GSTrans>
                            }>
                            {this.renderBuilding("/assets/images/home/ico-google-play.svg", 'ico-building-gp')}
                        </GSComponentTooltip>

                    )
                case 'BUILT':
                    return (
                        <GSComponentTooltip
                            placement={GSComponentTooltipPlacement.TOP}
                            interactive
                            html={
                                <GSTrans t="page.home.card.mobileApps.toolTips.androidBuilt">
                                    iOS app is only available for <b>Advance</b> package. <a href="/setting/plans">Upgrade
                                    now!</a>
                                </GSTrans>
                            }>
                            <a href={this.state.cardStatus.mobileApp.arLink}>
                                <img alt="gp" src={"/assets/images/home/google-play.svg"} className="mobile-loading"/>
                            </a>
                        </GSComponentTooltip>
                    )
                case 'INV_BUILD' :
                    return (
                        <GSComponentTooltip
                            placement={GSComponentTooltipPlacement.TOP}
                            interactive
                            html={
                                <div className="home-mobile__tooltip--status">
                                    <div><GSTrans t="page.home.card.mobileApps.toolTips.invalid_build_condition1"/>
                                    </div>
                                    <span><GSTrans
                                        t="page.home.card.mobileApps.toolTips.invalid_build_condition2"/></span>
                                    <span><GSTrans
                                        t="page.home.card.mobileApps.toolTips.invalid_build_condition3"/></span>
                                    <span><GSTrans
                                        t="page.home.card.mobileApps.toolTips.invalid_build_condition4"/></span>
                                </div>
                            }>
                            <div className="mobile-loading">
                                <img alt="gp" className="btn-upgrade" src="/assets/images/home/rocket.png"/>
                                <img alt="gp" className="gsa-width-100"
                                     src={"/assets/images/home/ico-google-play.svg"}/>
                            </div>
                        </GSComponentTooltip>
                    )
            }
        }
        if (type === 'AS') { // => Apple store
            switch (this.state.cardStatus.mobileApp.ioStatus) {
                case 'NOT_BUILD':
                    return (
                        <div className="d-flex align-items-center">
                            <GSComponentTooltip
                                placement={GSComponentTooltipPlacement.TOP}
                                interactive
                                html={
                                    <GSTrans t="page.home.card.mobileApps.toolTips.iOSBuild">
                                        iOS app is only available for <b>Advance</b> package. <a href="/setting/plans">Upgrade
                                        now!</a>
                                    </GSTrans>
                                }>
                                <div className="mobile-loading">
                                    <img alt="gp" className="btn-upgrade" src="/assets/images/home/rocket.png"/>
                                    <img alt="gp" className="gsa-width-100"
                                         src={"/assets/images/home/ico-app-store-not-build.svg"}/>
                                </div>
                            </GSComponentTooltip>
                            {this.renderIconDownload()}
                        </div>

                    )
                case 'BUILDING':
                    return (
                        <div className="d-flex align-items-center">
                            <GSComponentTooltip
                                placement={GSComponentTooltipPlacement.TOP}
                                interactive
                                html={
                                    <GSTrans t="page.home.card.mobileApps.toolTips.iOSBuilding">
                                    </GSTrans>
                                }>
                                {this.renderBuilding("/assets/images/home/ico-app-store.svg", 'ico-building-as')}
                            </GSComponentTooltip>
                            {this.renderIconDownload()}
                        </div>
                    )
                case 'BUILT':
                    return (
                        <div className="d-flex align-items-center">
                            <GSComponentTooltip
                                placement={GSComponentTooltipPlacement.TOP}
                                interactive
                                html={
                                    <GSTrans t="page.home.card.mobileApps.toolTips.iOSBuilt">
                                        iOS app is only available for <b>Advance</b> package. <a href="/setting/plans">Upgrade
                                        now!</a>
                                    </GSTrans>
                                }>
                                <a href={this.state.cardStatus.mobileApp.ioLink}>
                                    <img alt="gp" src={"/assets/images/home/app-store.svg"} className="mobile-loading"/>
                                </a>
                            </GSComponentTooltip>
                            {this.renderIconDownload()}
                        </div>
                    )
                case 'INV_BUILD':
                    return (
                        <div className="d-flex align-items-center">
                            <GSComponentTooltip
                                placement={GSComponentTooltipPlacement.TOP}
                                interactive
                                html={
                                    <div className="home-mobile__tooltip--status">
                                        <div><GSTrans t="page.home.card.mobileApps.toolTips.invalid_build_condition1"/>
                                        </div>
                                        <span><GSTrans t="page.home.card.mobileApps.toolTips.invalid_build_condition2"/></span>
                                        <span><GSTrans t="page.home.card.mobileApps.toolTips.invalid_build_condition3"/></span>
                                        <span><GSTrans t="page.home.card.mobileApps.toolTips.invalid_build_condition4"/></span>
                                    </div>
                                }>
                                <div className="mobile-loading">
                                    <img alt="gp" className="btn-upgrade" src="/assets/images/home/rocket.png"/>
                                    <img alt="gp" className="gsa-width-100"
                                         src={"/assets/images/home/ico-app-store-not-build.svg"}/>
                                </div>
                            </GSComponentTooltip>
                            {this.renderIconDownload()}
                        </div>
                    )
            }
        }
    }

    render() {

        const storeImage = CredentialUtils.getStoreImage() !== 'undefined' && CredentialUtils.getStoreImage() !== '' ? CredentialUtils.getStoreImage() : '/assets/images/home.svg'
        const useNewThemeEngine = CredentialUtils.getThemeEngine();
        const useNewThemeMenu = storageService.getFromLocalStorage("useNewThemeMenu") === "true";

        return (
            <>
                <GSContentContainer isLoading={this.state.isLoading} className="home">
                    <GSContentHeader>
                    </GSContentHeader>
                    <GSContentBody size={GSContentBody.size.LARGE}>
                        {/*TITLE*/}
                        <div className="title">
                            <GSTrans t="page.home.welcome" values={{
                                provider: AgencyService.getDashboardName(),
                                userName: CredentialUtils.getStoreName()
                            }}/>
                        </div>

                        {/*CARDS*/}
                        <div className="card-row">
                            {/* GOPOS */}
                            <GSWidget
                                className={`home__card home__card--${this.state.cardStatus.gopos ? 'active' : 'inactive'}`}>
                                <GSWidgetContent className="card__content">
                                    <span className="capitalize-none">
                                         <GSTrans t="page.home.card.package.go_pos" values={{x:CredentialUtils.textStoreXxxOrGo()}}/>
                                    </span>
                                    <div className="card__right-content">
                                        <img className="store-logo"
                                             alt="logo"
                                             src={CredentialUtils.isStoreXxxOrGoSell() ?
                                                 AgencyService.getBlueLogo() : 
                                                 '/assets/images/home/' + (this.state.cardStatus.gopos ? 'icon-gopos-active.svg' : 'icon-gopos-disable.svg')}/>
                                    </div>
                                </GSWidgetContent>
                            </GSWidget>
                            {/*ONLINE SHOP*/}
                            <GSWidget
                                className={`home__card home__card--${(this.state.cardStatus.onlineShop.status === 'BUILDING' || !this.state.cardStatus.goweb) ? 'inactive' : 'active'}`}>
                                <GSWidgetContent className="card__content">
                                    <span>
                                    <span className="capitalize-none">
                                            <GSTrans className="capitalize-none"
                                                     t="page.home.card.package.go_web" values={{x:CredentialUtils.textStoreXxxOrGo()}}/>
                                    </span>

                                        {this.state.cardStatus.onlineShop.status === 'BUILDING' &&
                                        <span className="building-status">
                                                <GSTrans t="page.home.card.status.building"/>
                                            </span>}
                                    </span>
                                    <div className="card__right-content">
                                        {this.state.cardStatus.onlineShop.status === 'BUILDING' ?
                                            this.renderLoading()
                                            :
                                            <a href={`https://${CredentialUtils.getStoreUrl()}.${AgencyService.getStorefrontDomain()}`}
                                               target="_blank">
                                                {/* default image */}

                                                {
                                                    storeImage.indexOf('home.svg') >= 0 &&
                                                    <img className="store-logo store-logo--none" alt="logo"
                                                         src={ImageUtils.resizeImage(storeImage)}/>
                                                }


                                                {
                                                    storeImage.indexOf('home.svg') < 0 &&
                                                    <img className="store-logo" alt="logo"
                                                         src={ImageUtils.resizeImage(storeImage, 50)}/>
                                                }

                                            </a>
                                        }
                                    </div>
                                </GSWidgetContent>
                            </GSWidget>
                            {/*MOBILE APP*/}
                            <GSWidget className={`home__card home__card--${
                                (this.state.cardStatus.goapp && (this.state.cardStatus.mobileApp.arStatus === 'BUILT' || this.state.cardStatus.mobileApp.ioStatus === 'BUILT'))
                                    ? 'active' : 'inactive'}`}>
                                <GSWidgetContent className="card__content card-mobile">
                                    <div className="card-top">
                                       <span>
                                       <span className="capitalize-none">
                                               <GSTrans className="capitalize-none"
                                                        t="page.home.card.package.go_app" values={{x:CredentialUtils.textStoreXxxOrGo()}}/>
                                       </span>
                                           {(this.state.cardStatus.mobileApp.arStatus === 'BUILDING' || this.state.cardStatus.mobileApp.ioStatus === 'BUILDING') &&
                                           <span className="building-status">
                                                    <GSTrans t="page.home.card.status.building"/>
                                                </span>}
                                       </span>
                                        <div className="card__right-content">

                                            {this.renderMobileApp('GP')}
                                            {this.renderMobileApp('AS')}

                                            {/*<div>*/}
                                            {/* <span className="demo-loading">*/}

                                            {/* </span>*/}
                                            {/*</div>*/}
                                            {/* RENDER GG PLAY*/}
                                            {/* {this.state.cardStatus.mobileApp.arStatus  === 'BUILT' &&*/}
                                            {/*     <img className="mobile-app-logo" alt="mobile-app" src="/assets/images/home/google-play.svg"/>}*/}
                                            {/* {this.state.cardStatus.mobileApp.ioStatus === 'BUILT' &&*/}
                                            {/*     <img className="mobile-app-logo" alt="mobile-app" src="/assets/images/home/app-store.svg"/>}*/}
                                            {/*{this.state.cardStatus.mobileApp.arStatus === 'BUILDING' && this.state.cardStatus.mobileApp.ioStatus  === 'BUILDING' && this.renderLoading()}*/}
                                        </div>
                                    </div>

                                </GSWidgetContent>
                            </GSWidget>
                            {/*SALE CHANNELS*/}
                            <GSWidget
                                className={`home__card home__card--${!this.state.cardStatus.saleChannel.isSPActive || !this.state.cardStatus.saleChannel.isLZActive ? 'inactive' : 'active'}`}>
                                <GSWidgetContent className="card__content">
                                   <span>
                                    <GSTrans t="page.home.card.saleChannels.title"/>
                                   </span>
                                    <div className="card__right-content">
                                        { CredentialUtils.checkStoreVND() && (
                                            <a href={`https://${process.env.BEECOW_DOMAIN}/${CredentialUtils.getStoreUrl()}`}
                                               target="_blank">
                                                <img className="sale-channel-logo" alt="sale-channel-logo"
                                                     src="/assets/images/home/icon-beecow.svg"/>
                                            </a>
                                        )}
                                        <GSComponentTooltip
                                            // disabled={this.state.cardStatus.saleChannel.isSPActive}
                                            interactive
                                            html={
                                                <>
                                                    {this.state.cardStatus.saleChannel.isSPActive ?
                                                        <span>Shopee</span>
                                                        :
                                                        <GSTrans t="page.home.card.saleChannels.toolTips" values={
                                                            {
                                                                saleChannel: 'Shopee'
                                                            }
                                                        }>
                                                            Connect your saleChannel shop to sync products and boost
                                                            revenue.<a href={NAV_PATH.shopeeAccount}>Enable</a>",
                                                        </GSTrans>}
                                                </>
                                            }
                                        >
                                            <Link to={NAV_PATH.shopeeAccount}>
                                                <img className="sale-channel-logo" alt="sale-channel-logo"
                                                     src={`/assets/images/home/sp_${this.state.cardStatus.saleChannel.isSPActive ? 'active' : 'inactive'}.jpeg`}/>
                                            </Link>
                                        </GSComponentTooltip>
                                        { CredentialUtils.checkStoreVND() && (
                                            <GSComponentTooltip
                                                // disabled={this.state.cardStatus.saleChannel.isLZActive}
                                                interactive
                                                html={
                                                    <>
                                                        {this.state.cardStatus.saleChannel.isLZActive ?
                                                            <span>Lazada</span>
                                                            :
                                                            <GSTrans t="page.home.card.saleChannels.toolTips" values={
                                                                {
                                                                    saleChannel: 'Lazada'
                                                                }
                                                            }>
                                                                Connect your saleChannel shop to sync products and boost
                                                                revenue.<a href={NAV_PATH.lazadaAccount}>Enable</a>",
                                                            </GSTrans>}
                                                    </>
                                                }
                                            >
                                                <Link to={NAV_PATH.lazadaAccount}>
                                                    <img className="sale-channel-logo" alt="sale-channel-logo"
                                                         src={`/assets/images/home/lz_${this.state.cardStatus.saleChannel.isLZActive ? 'active' : 'inactive'}.jpeg`}/>
                                                </Link>
                                            </GSComponentTooltip>
                                        )}
                                    </div>
                                </GSWidgetContent>
                            </GSWidget>
                        </div>

                        {/*STATISTIC ORDER / RESERVATION*/}
                        {/* <div className="what-to-do-next">
                       <h3 className="title">
                           <GSTrans t="page.home.statistic_order_reservation"/>
                       </h3>
                   </div> */}
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0101]}
                                          wrapperDisplay={"block"}
                                          disabledStyle={"hidden"}
                        >
                            <div className="statistic">
                                <div className="statistic-order__reservation">
                                    <GSWidget
                                        onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.orders + `?status=TO_SHIP`)}>
                                        <GSWidgetContent>
                                            <div className="statistic-title">
                                                <GSTrans t="page.home.statistic_order_confirm"/>
                                            </div>
                                            <div className="statistic-detail">
                                                <i className="confirm-order"></i>
                                                <span className="number">
                                            {this.state.orderConfirmLoading && this.renderLoading()}
                                                    {!this.state.orderConfirmLoading && this.state.orderConfirm}
                                        </span>
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>
                                </div>
                                <div className="statistic-order__reservation">
                                    <GSWidget
                                        onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.orders + `?status=DELIVERED`)}>
                                        <GSWidgetContent>
                                            <div className="statistic-title">
                                                <GSTrans t="page.home.statistic_order_completed"/>
                                            </div>
                                            <div className="statistic-detail">
                                                <i className="delivered-order"></i>
                                                <span className="number">
                                            {this.state.orderCompletedLoading && this.renderLoading()}
                                                    {!this.state.orderCompletedLoading && this.state.orderCompleted}
                                        </span>
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>
                                </div>
                                <div className="statistic-order__reservation">
                                    <GSWidget
                                        onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.reservations + `?status=ORDERED`)}>
                                        <GSWidgetContent>
                                            <div className="statistic-title">
                                                <GSTrans t="page.home.statistic_reservation_confirm"/>
                                            </div>
                                            <div className="statistic-detail">
                                                <i className="confirm-resercation"></i>
                                                <span className="number"

                                                >
                                            {this.state.reservationConfirm}
                                        </span>
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>
                                </div>
                                <div className="statistic-order__reservation">
                                    <GSWidget
                                        onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.reservations + `?status=DELIVERED`)}>
                                        <GSWidgetContent>
                                            <div className="statistic-title">
                                                <GSTrans t="page.home.statistic_reservation_completed"/>
                                            </div>
                                            <div className="statistic-detail">
                                                <i className="delivered-reservation"></i>
                                                <span className="number"

                                                >
                                            {this.state.reservationCompleted}
                                        </span>
                                            </div>
                                        </GSWidgetContent>
                                    </GSWidget>
                                </div>

                            </div>
                        </PrivateComponent>


                        {/*WHAT TO DO NEXT*/}
                        <div className="what-to-do-next">
                            <h3 className="title">
                                <GSTrans t="page.home.whatToDoNext"/>
                            </h3>
                            <span className="subTitle">
                           <GSTrans t="page.home.whatToDoNext.subTitle"/>
                       </span>
                        </div>
                        {/*SHORTCUT CARD*/}
                        {/*CREATE AND IMPORT PRODUCT*/}
                        {((this.isStaff && TokenUtils.isHasAnyStaffPermission(STAFF_PERMISSIONS.PRODUCTS)) || !this.isStaff) &&
                        <GSWidget className="shortcut-card">
                            <GSWidgetHeader onClick={() => {
                                this.refProductContent.collapseToggle()
                            }}>
                                <img alt="shortcut-card-icon" className="shortcut-card-icon"
                                     src="/assets/images/home/icon-AddProduct.svg"/>
                                <GSTrans t="page.home.wg.product"/>
                            </GSWidgetHeader>
                            <GSWidgetContent ref={el => this.refProductContent = el}>
                            <span className="descriptions">
                                <GSTrans t="page.home.wg.product.descriptions"/>
                            </span>
                                <span className="step-hint">
                                <GSTrans t="page.home.wg.product.stepHint"/>
                            </span>
                                <div
                                    className="gs-atm__flex-row--flex-start gs-atm__flex-align-items--center card-btn-group">
                                    {/*BTN CREATE PRODUCT*/}
                                    <GSButton success outline marginRight
                                              onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.products)}>
                                        <GSTrans t="page.home.wg.product.btnCreate"/>
                                    </GSButton>
                                    {/*BTN IMPORT FROM SP*/}
                                    <GSButton success outline marginRight
                                              onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.shopeeAccount)}>
                                        <GSTrans t="page.home.wg.product.btnActiveShopee"/>
                                    </GSButton>
                                    {/*BTN IMPORT FROM LZ*/}
                                    { CredentialUtils.checkStoreVND() && (
                                        <GSButton success outline marginRight
                                                  onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.lazadaAccount)}>
                                            <GSTrans t="page.home.wg.product.btnActiveLazada"/>
                                        </GSButton>
                                    )}
                                    {/* <Link to={'/'}>
                                    <GSTrans t="page.home.wg.btnLearnMore"/>
                                </Link> */}
                                </div>
                            </GSWidgetContent>
                        </GSWidget>}

                        {/*CUSTOMIZE THEME*/}
                        {((this.isStaff && TokenUtils.isHasAnyStaffPermission(STAFF_PERMISSIONS.SALES_CHANNELS)) || !this.isStaff) &&
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0105]}
                                          wrapperDisplay={"block"}
                        >
                            <GSWidget className="shortcut-card">
                                <GSWidgetHeader onClick={() => {
                                    this.refThemeContent.collapseToggle()
                                }}>
                                    <img alt="shortcut-card-icon" className="shortcut-card-icon"
                                         src="/assets/images/home/icon-CustomizeTheme.svg"/>
                                    <GSTrans t="page.home.wg.theme"/>
                                </GSWidgetHeader>
                                <GSWidgetContent ref={el => this.refThemeContent = el} isCollapsed>
                            <span className="descriptions">
                                <GSTrans t="page.home.wg.theme.descriptions"/>
                            </span>
                                    <div
                                        className="gs-atm__flex-row--flex-start gs-atm__flex-align-items--center card-btn-group">
                                        {/*CHANGE THEME*/}
                                        <GSButton success outline marginRight
                                                  onClick={() => RouteUtils.linkTo(this.props,
                                                      (useNewThemeEngine || (!useNewThemeEngine && useNewThemeMenu))
                                                          ? NAV_PATH.themeEngine.management
                                                          : NAV_PATH.customization)}>
                                            <GSTrans t="page.home.wg.theme.btnChange"/>
                                        </GSButton>
                                        {/* <Link to={'/'}>
                                   <GSTrans t="page.home.wg.btnLearnMore"/>
                               </Link> */}
                                    </div>
                                </GSWidgetContent>
                            </GSWidget>
                        </PrivateComponent>
                        }

                        {/*CUSTOMIZE WEBSITE URL*/}
                        {((this.isStaff && TokenUtils.isHasAnyStaffPermission(STAFF_PERMISSIONS.SALES_CHANNELS)) || !this.isStaff) &&
                        <PrivateComponent hasAnyPackageFeature={[PACKAGE_FEATURE_CODES.FEATURE_0250]}
                                          wrapperDisplay={"block"}
                        >
                            <GSWidget className="shortcut-card">
                                <GSWidgetHeader onClick={() => {
                                    this.refDomainContent.collapseToggle()
                                }}>
                                    <img alt="shortcut-card-icon" className="shortcut-card-icon"
                                         src="/assets/images/home/icon-CustomizeURL.svg"/>
                                    <GSTrans t="page.home.wg.domain"/>
                                </GSWidgetHeader>
                                <GSWidgetContent ref={el => this.refDomainContent = el} isCollapsed>
                            <span className="descriptions">
                                <GSTrans t="page.home.wg.domain.descriptions"/>
                            </span>
                                    <div
                                        className="gs-atm__flex-row--flex-start gs-atm__flex-align-items--center card-btn-group">
                                        {/*BTN ADD DOMAIN*/}
                                        <GSButton success outline marginRight
                                                  onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.domains)}>
                                            <GSTrans t="page.home.wg.domain.addDomain"/>
                                        </GSButton>
                                        {/* <Link to={'/'}>
                                   <GSTrans t="page.home.wg.btnLearnMore"/>
                               </Link> */}
                                    </div>
                                </GSWidgetContent>
                            </GSWidget>
                        </PrivateComponent>
                        }

                        {/*ADD BANK ACCOUNT*/}
                        {((this.isStaff && TokenUtils.isHasAnyStaffPermission(STAFF_PERMISSIONS.SETTING)) || !this.isStaff) &&
                        <GSWidget className="shortcut-card">
                            <GSWidgetHeader onClick={() => {
                                this.refBankContent.collapseToggle()
                            }}>
                                <img alt="shortcut-card-icon" className="shortcut-card-icon"
                                     src="/assets/images/home/icon-AddBank.svg"/>
                                <GSTrans t="page.home.wg.bankAccount"/>
                            </GSWidgetHeader>
                            <GSWidgetContent ref={el => this.refBankContent = el} isCollapsed>
                            <span className="descriptions">
                                <GSTrans t="page.home.wg.bankAccount.descriptions"
                                         values={{provider: AgencyService.getDashboardName()}}/>
                            </span>
                                <div
                                    className="gs-atm__flex-row--flex-start gs-atm__flex-align-items--center card-btn-group">
                                    {/*BTN Bank information*/}
                                    <GSButton success outline marginRight
                                              onClick={() => RouteUtils.linkTo(this.props, NAV_PATH.setting.BANK_INFO)}>
                                        <GSTrans t="page.home.wg.bankAccount.btnBankInfo"/>
                                    </GSButton>
                                </div>
                            </GSWidgetContent>
                        </GSWidget>}
                    </GSContentBody>

                    <Modal isOpen={this.state.isShowOTAModal}>
                        <ModalHeader className="color-green">
                            <GSTrans t="page.home.ota.modal.title"/>
                        </ModalHeader>
                        <ModalBody>
                            <GSTrans t="page.home.ota.modal.description"/>
                        </ModalBody>
                        <ModalFooter>
                            <GSButton default onClick={this.closeOTAModal}>
                                <GSTrans t="common.btn.cancel"/>
                            </GSButton>
                            <a href={this.state.cardStatus.mobileApp.otaUrl} onClick={this.closeOTAModal}
                               className={'a-hover'}>
                                <GSButton success marginLeft>
                                    <GSTrans t="page.home.ota.modal.downloadNow"/>
                                </GSButton>
                            </a>
                        </ModalFooter>
                    </Modal>
                </GSContentContainer>
                <AlertModal ref={this.refStaffConfirm}/>
            </>
        );
    }
}

Home.propTypes = {};

export default Home;
