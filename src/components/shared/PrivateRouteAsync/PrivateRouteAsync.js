import React, {useEffect} from 'react';
import {Redirect, Route, withRouter} from 'react-router-dom';
import {NAV_PATH} from '../../layout/navigation/Navigation';
import storage from '../../../services/storage';
import Constants from '../../../config/Constant';
import beehiveService from '../../../services/BeehiveService';
import PropTypes from 'prop-types';
import wrapperLayout from '../../layout/Layout';
import UpgradeChannelPanel from '../../../pages/upgrade/UpgradeChannelPanel';
import BlankContent from '../../../pages/blank-content/BlankContent';
import UpgradeExpired from '../../../pages/upgrade/UpgradeExpired';
import moment from 'moment';
import {connect, useDispatch, useSelector} from 'react-redux';
import {setPageTitle, toggleCallHistoryReload} from '../../../config/redux/Reducers';
import i18next from 'i18next';
import {CredentialUtils} from '../../../utils/credential';
import storeService from '../../../services/StoreService';
import {ImageUtils} from '../../../utils/image';
import {TokenUtils} from '../../../utils/token';
import {RouteUtils} from '../../../utils/route';
import {AgencyService} from '../../../services/AgencyService';
import {ROLES} from '../../../config/user-roles';
import GSSalePitchMedia from '../GSSalePitchMedia/GSSalePitchMedia';
import callCenterService from '../../../services/CallCenterService';
import tikiService from '../../../services/TikiService';
import CallCenterListener from '../CallCenterModal/CallCenterListener/CallCenterListener';
import CrispChat from '../../../pages/crisp/CrispChat';
import IntercomChatBubble from '../../../pages/intercom/IntercomChatBubble';
import {NavigationPath} from '../../../config/NavigationPath';
import facebookService from '../../../services/FacebookService'

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 30/05/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

class PrivateRoute extends React.Component {
    // UPGRADE_IN_CHANNEL = (
    //     <Redirect to={{
    //         pathname: NAV_PATH.upgradeInChannel,
    //         state: {
    //             from: window.location.pathname
    //         }
    //     }}/>
    // )


    UPGRADE_IN_CHANNEL
    UPGRADE_EXPIRED
    BLANK_CMP = wrapperLayout(BlankContent, this.props.nav)
    IS_STAFF = TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF)
    T_PATH = ''

    constructor(props) {
        super(props);

        this.T_PATH = this.props.path.split(':').join('')
        localStorage.setItem("nav", this.props.nav)
    }


    state = {
        isAllow: false,
        fallBackCmp: null,
        isShowBlank: !CredentialUtils.getIsWizard(),
        isServerError: false,
        packageId: 5,
    }

    async componentDidMount() {
        if (this.props.redirectTo) {
            RouteUtils.redirectWithoutReloadHasPathParams(this.props, this.props.redirectTo)
            return
        }

        const UICCmp = wrapperLayout(UpgradeChannelPanel, this.props.nav)
        const UPCmp = wrapperLayout(UpgradeExpired, this.props.nav)
        // this.BLANK_CMP =
        this.UPGRADE_IN_CHANNEL = (
            <Route path={this.props.path} render={(props) => {
                return (
                    <UICCmp {...props}/>
                )
            }}/>)

        this.UPGRADE_EXPIRED = (
            <Route path={this.props.path} render={(props) => {
                return (
                    <UPCmp {...props}/>
                )
            }}/>)

        const token = storage.get(Constants.STORAGE_KEY_ACCESS_TOKEN);
        const store = storage.get(Constants.STORAGE_KEY_STORE_FULL);
        const refreshToken = storage.get(Constants.STORAGE_KEY_REFRESH_TOKEN);
        if (token && store && refreshToken) {   // logged in -> next check permission
            // check fb chat login

            facebookService.getStoreConfig()
                .then(storeConfig => {
                    CredentialUtils.setFbChatLogin(storeConfig)
                })

            // call center check
            process.env.ENABLE_INTERCOM == 'true' && IntercomChatBubble()
            callCenterService.getInfoCallCenterByStore()
                .then((result) => {
                    CredentialUtils.setOmiCallData(result)
                })
                .catch(() => {
                    CredentialUtils.setOmiCallData(null)
                })

            // tiki check
            if (this.props.getTikiInfo) {
                try {
                    let shopAccounts = await tikiService.getShopAccounts();

                    CredentialUtils.setTikiShopAccount(shopAccounts.length ? shopAccounts[0] : null)
                } catch (e) {
                    if (e.response.status === Constants.HTTP_STATUS_NOT_FOUND) {
                        // clear data shop
                        CredentialUtils.setTikiShopAccount(null)
                    }
                }
            }

            // update storage
            let role, permission;

            beehiveService.checkExistPackage(10)
                .then(isExistPlanSocial => {
                    CredentialUtils.setIsOldGoSocialMenu(isExistPlanSocial ? false : !CredentialUtils.getUseNewGoSocial())
                    CredentialUtils.setIsExistGoSocial(isExistPlanSocial)
                })
            storeService.getLogos()
                .then(storeLogoRes => {
                    CredentialUtils.setStoreImage(ImageUtils.getImageFromImageModel(storeLogoRes.shopLogo))
                })


            // check staff
            if (this.props.checkStaff && this.IS_STAFF && !TokenUtils.isAllowForRoute(this.T_PATH)) {
                RouteUtils.redirectWithoutReload(this.props, NAV_PATH.notFound)
            }

            // check re-seller
            if (CredentialUtils.ROLE.RESELLER.isReSeller()) { // check force logout
                if (!CredentialUtils.ROLE.RESELLER.isActive()) {    // show popup
                    storage.setToSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT, true)
                    storage.setToSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT_REASON_RESELLER_EXPIRED, true)
                    storage.setToSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT_MSG,
                            ["modal.reseller.forceLogout.l1","modal.reseller.forceLogout.l2"].join("|")
                        )
                } else { // clear popup if refresh new token
                    if (!storage.getFromSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT_REASON_PASSWORD_CHANGED)) {
                        storage.removeSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT)
                        storage.removeSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT_REASON_RESELLER_EXPIRED)
                        storage.removeSessionStorage(Constants.STORAGE_KEY_FORCE_LOGOUT_MSG)
                    }
                }
            }

            // check package permission
            if (this.props.checkPackageFeature) {
                if (this.props.hasAnyPackageFeature.length > 0) {
                    if (!TokenUtils.hasAnyPackageFeatures(this.props.hasAnyPackageFeature)) {
                        RouteUtils.redirectCurrentWithoutReload(this.props, this.props.fallbackRedirectTo || NavigationPath.notFound)
                        return
                    }
                } else {

                    const permissionRequired = TokenUtils.getAllPackagePermissionByRoute(this.props.path);
                    if (permissionRequired) {
                        // for special route => require all permission (collection service require both collection and service permission)
                        if (!TokenUtils.hasAllPackageFeatures(permissionRequired)) {
                            if (this.props.fallbackRedirectTo) {
                                RouteUtils.redirectCurrentWithoutReload(this.props, this.props.fallbackRedirectTo)
                                return
                            }
                        }
                    } else {
                        // auto mode, if not define feature, it'll base on route

                        const permissionList = TokenUtils.getPackagePermissionByRoute(this.props.path)

                        if (permissionList && !TokenUtils.hasAnyPackageFeatures(permissionList)) {
                            if (this.props.fallbackRedirectTo) {
                                RouteUtils.redirectCurrentWithoutReload(this.props, this.props.fallbackRedirectTo)
                                return
                            }
                        }
                    }

                }

            }

            // check expired
            try {
                if (this.props.checkExpired) {
                    role = await beehiveService.getCurrentPlan()
                    CredentialUtils.setPackageName(role.packageName)
                    CredentialUtils.setExpiredTimeInMS(role.userFeature.expiredPackageDate)
                    CredentialUtils.setRegTime(role.userFeature.registerPackageDate)
                    CredentialUtils.setPackageType(role.userFeature.packagePay)
                    CredentialUtils.setPackageId(role.userFeature.packageId)

                    const expiredDate = moment(role.userFeature.expiredPackageDate * 1000)
                    // console.log(expiredDate.format('DD/MM/YYYY hh:mm:ss'))
                    const now = moment(new Date())
                    // console.log(now.format('DD/MM/YYYY hh:mm:ss'))
                    // const dLeft = expiredDate.diff(now, 'days')
                    const mLeft = expiredDate.diff(now, 'minutes')
                    // console.log(mLeft)

                    if (mLeft < 0) { // => expired
                        switch (role.userFeature.packagePay) {
                            case Constants.PackageType.PAID:
                                // => if expired but current packages is BASIC || ADVANCED (PAID === true)
                                // => show upgrade panel for all page
                                CredentialUtils.setIsWizard(false)
                                this.setState({
                                    isAllow: false,
                                    isShowBlank: true,
                                    fallBackCmp: this.UPGRADE_EXPIRED
                                })
                                return
                            case Constants.PackageType.TRIAL:
                                // => if expired but current packages is TRIAL (PAID === false)
                                if (role.hasOpenOrderRequest) { // => waiting for bank transfer
                                    // => redirect to wizard step 6 waiting for approve
                                    CredentialUtils.setIsWizard(true)
                                    this.setState({
                                        isAllow: false,
                                        isShowBlank: false,
                                        fallBackCmp: (
                                            <Redirect to={{
                                                pathname: NAV_PATH.wizard + '/waiting-for-approve',
                                                state: {
                                                    from: window.location.pathname
                                                }
                                            }}/>
                                        )
                                    })
                                    return
                                } else { // =>
                                    // => redirect to wizard payment step
                                    CredentialUtils.setIsWizard(true)
                                    this.setState({
                                        isAllow: false,
                                        isShowBlank: false,
                                        fallBackCmp: (
                                            <Redirect to={{
                                                pathname: NAV_PATH.wizard + '/payment',
                                                state: {
                                                    from: window.location.pathname
                                                }
                                            }}/>
                                        )
                                    })
                                    return
                                }
                        }

                    } else {
                        CredentialUtils.setIsWizard(false)
                    }
                }

                // Check package plan
                if (this.props.checkPackage) {
                    let nState = {}

                    permission = await beehiveService.getPermission();
                    let check = [];
                    this.props.checkPackage.forEach(value => {
                        switch (value) {
                            case 'shopee-lazada':
                                check.push('feature.0021');
                                break;
                        }
                    });
                    permission = permission.filter(value => {
                        return value.use;
                    });
                    //distinct packageId value
                    const distinctPackages = permission.map(item => item.packageId).filter((value, index, self) => self.indexOf(value) === index);
                    const packageNumber = (distinctPackages.length === 1) ? distinctPackages[0] : -1;
                    permission = permission.map(value => {
                        return value.featureCode;
                    });
                    const havePermit = check.every(value => {
                        return permission.includes(value);
                    });
                    if (!havePermit) {
                        nState = {
                            isAllow: false,
                            isShowBlank: true,
                            fallBackCmp: this.UPGRADE_IN_CHANNEL,
                            packageId: packageNumber
                        }
                    } else {
                        nState = {
                            isAllow: true,
                            isShowBlank: true,
                            packageId: packageNumber
                        }
                    }
                    this.setState(nState)
                    return
                } // => dont package plan
            } catch (e) {
                this.setState({
                    isServerError: true
                })
            }

            this.setState({
                isAllow: true,
                isShowBlank: true
            })
        } else { // need login
            this.setState({
                isAllow: false,
                fallBackCmp: (
                    <Redirect to={{
                        pathname: NAV_PATH.login,
                        state: {
                            from: window.location.pathname
                        }
                    }}/>
                )
            }, () => {
                storage.removeLocalStorage(Constants.STORAGE_KEY_REFRESH_TOKEN);
                storage.removeLocalStorage(Constants.STORAGE_KEY_ACCESS_TOKEN);
                storage.removeLocalStorage(Constants.STORAGE_KEY_USER_ID);
                storage.removeLocalStorage(Constants.STORAGE_KEY_STORE_OWNER_ID)
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let appName = AgencyService.getDashboardName();
        this.props.dispatch(setPageTitle(appName + ' - ' + i18next.t(`title.[${this.T_PATH}]`)))
    }

    render() {
        const {component: Component, ...rest} = this.props

        if (!this.props.checkPackageFeature &&
            !this.props.checkStaff &&
            !this.props.checkExpired &&
            this.props.checkLogin
        ) {
            // console.log('legacy')
            return (
                <PrivateRouteLegacy component={Component} {...rest}/>
            )
        } else {
            let FinalComponent;
            let saleOtp;

            if (CredentialUtils.getAccessToken()) {
                if (TokenUtils.onlyFreePackage()) {
                    // user only has the package free
                    saleOtp = TokenUtils.getSalePitchByRouteOnlyFreePackage(this.props.path);
                } else {
                    // have more than free package
                    saleOtp = TokenUtils.getSalePitchByRouteMoreThanFreePackage(this.props.path);
                }
            }

            if (saleOtp && saleOtp.isShow) {
                FinalComponent = wrapperLayout(Component, this.props.nav, <GSSalePitchMedia path={this.props.path}
                                                                                            code={saleOtp}/>);
            } else {
                FinalComponent = wrapperLayout(Component, this.props.nav);
            }

            if (!this.state.isServerError) {
                return (
                    <>
                        {this.state.isAllow &&
                        <>
                            <Route {...rest} render={(props) => (
                                this.props.wrapLayout ? <FinalComponent {...props}/> : <Component {...props}/>
                            )}/>
                            <CallCenterListener onCallAssigned={() => {
                                this.props.dispatch(toggleCallHistoryReload());
                            }}/>
                            {!window.$crisp && process.env.ENABLE_CRISP == 'true' && <CrispChat></CrispChat>}
                        </>
                        }
                        {!this.state.isAllow && this.state.fallBackCmp &&
                        <>
                            {this.state.fallBackCmp}
                        </>
                        }
                        {!this.state.isAllow && !this.state.fallBackCmp && this.state.isShowBlank && this.props.wrapLayout &&
                        <this.BLANK_CMP/>
                        }
                    </>
                )
            } else {
                return (
                    <this.BLANK_CMP isRetry={true}/>
                )
            }
        }
    }
}

PrivateRoute.defaultProps = {
    checkExpired: false, // deleted
    hasAnyPackageFeature: [],
    checkStaff: true,
    checkPackageFeature: true,
    checkLogin: true,
    wrapLayout: true,
    checkPackage: [],
}

PrivateRoute.propTypes = {
    checkPackage: PropTypes.arrayOf(PropTypes.string),
    nav: PropTypes.string, // using for show active menu
    checkExpired: PropTypes.bool,
    path: PropTypes.string, // using for route,
    hasAnyPackageFeature: PropTypes.array,
    checkPackageFeature: PropTypes.bool,
    checkStaff: PropTypes.bool,
    checkLogin: PropTypes.bool,
    wrapLayout: PropTypes.bool,
    getTikiInfo: PropTypes.bool,
    fallbackRedirectTo: PropTypes.string,
    redirectTo: PropTypes.string
}


const LoginRoute = (props) => {
    return <Route {...props} render={(props) => (
        <Redirect to={{
            pathname: NAV_PATH.login,
            state: {
                from: window.location.pathname
            }
        }}/>
    )}/>
}

const ComponentRoute = (props) => {
    const {component: Component, ...rest} = props
    return (<Route {...rest} render={(props) => (
        <Component {...rest} />
    )}/>);
}


const PrivateRouteLegacy = ({component: Component, ...rest}) => {
    const dispatch = useDispatch()
    const selector = useSelector(state => state.agencyName)

    // get token
    const token = storage.get(Constants.STORAGE_KEY_ACCESS_TOKEN);
    const store = storage.get(Constants.STORAGE_KEY_STORE_FULL);

    if (token && store) {
        const tPath = rest.path.split(':').join('')
        // rest.dispatch(setPageTitle(process.env.APP_NAME + ' - ' + i18next.t(`title.[${tPath}]`)))

        useEffect(() => {
            dispatch(setPageTitle(AgencyService.getDashboardName() + ' - ' + i18next.t(`title.[${tPath}]`)))
        }, [selector]);

        // incase user has full store => dashboard and others page
        return <ComponentRoute component={Component} {...rest}/>;
    }

    // remove all storage here
    storage.removeAll();

    // return to login
    return <LoginRoute {...rest}/>;

}

const areEqual = (prevProps, nextProps) =>  _.isEqual(prevProps, nextProps)

export default connect()(withRouter(React.memo(PrivateRoute, areEqual)))
