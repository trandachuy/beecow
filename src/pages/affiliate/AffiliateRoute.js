import "./Affiliate.sass";
import React, {
    Suspense,
    useEffect,
    useReducer,
    useRef,
    useState,
} from "react";
import { AffiliateContext } from "./context/AffiliateContext";
import { UikContainerHorizontal, UikContainerVertical } from "../../@uik";
import AlertModal from "../../components/shared/AlertModal/AlertModal";
import NavigationLeft from "../../components/layout/navigation/navigationLeft/AffiliateNavigationLeft";
import AffiliateNavigation from "../../components/layout/navigation/AffiliateNavigation";
import { NAV, NAV_PATH } from "../../components/layout/navigation/Navigation";
import { Redirect, Route, Switch } from "react-router-dom";
import Loading, { LoadingStyle } from "../../components/shared/Loading/Loading";
import { CredentialUtils } from "../../utils/credential";
import BlankContent from "../blank-content/BlankContent";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import AffiliateOrder from "./order/AffiliateOrder";
import AffiliateCommission from "./commission/AffiliateCommission";
import AffiliateInventory from "./inventory/AffiliateInventory";
import AffiliatePartner from "./partner/AffiliatePartner";
import AffiliatePayout from "./payout/AffiliatePayout";
import AffiliateIntro from "./intro/AffiliateIntro";
import AffiliateInfo from "./info/AffiliateInfo";
import AffiliatePartnerFormEditor from "./partner/AffiliatePartnerFormEditor";
import AffiliateCommissionFormEditor from "./commission/AffiliateCommissionFormEditor";
import affiliateService from "../../services/AffiliateService";
import Constants from "../../config/Constant";
import { useSelector, useDispatch as useReduxDispatch } from "react-redux";
import { GSToast } from "../../utils/gs-toast";
import { RouteUtils } from "../../utils/route";
import { ErrorBoundary } from "react-error-boundary";
import {default as AffiliateHeader} from "../../components/layout/header/Header";
import Logout from "../logout/Logout";
import storage from "../../services/storage";
import { setPageTitle } from "../../config/redux/Reducers";
import { AgencyService } from "../../services/AgencyService";
import i18next from "i18next";
import AffiliateTransferWizard from './TransferGood/TransferWizard/AffiliateTransferWizard'
import PartnerTransferFormEditor from './TransferGood/PartnerTransferFormEditor/AffiliateTransferFormEditor'
import PartnerTransferManagement from './TransferGood/AffiliateTransferManagement'
import AffiliateSetting from './setting/AffiliateSetting'
import {TokenUtils} from '../../utils/token'
import {ROLES} from '../../config/user-roles'
import NotFound from '../error/NotFound'
import {PACKAGE_FEATURE_CODES} from '../../config/package-features'

export const Affiliate = ({ children, ...rest }) => {
    const [state, dispatch] = useReducer(
        AffiliateContext.reducer,
        AffiliateContext.initState
    );

    const reduxDispatch = useReduxDispatch();

    const agencyName = useSelector((state) => state.agencyName)
    const isCollapsedMenu = useSelector((state) => state.collapsedMenu);

    const { props } = children || {};
    const [stNav] = useState(props.nav);
    const [stLocationPath] = useState(props.location.pathname);
    const [isShowLeftMenu, setIsShowLeftMenu] = useState(false);
    const refAlertModal = useRef(null);

    useEffect(() => {
        // get token
        const token = storage.get(Constants.STORAGE_KEY_ACCESS_TOKEN);
        const store = storage.get(Constants.STORAGE_KEY_STORE_FULL);

        if(token && store){
            const currentPath = stLocationPath || "";
            const foundAffiliatePath = currentPath.search(/^\/affiliate/gi);
            let stPath = currentPath;
            if(foundAffiliatePath > -1) {
                stPath = NAV_PATH.affiliate;
            }
            reduxDispatch(setPageTitle(AgencyService.getDashboardName() + ' - ' + i18next.t(`title.[${stPath}]`)))
        }
    }, [agencyName]);

    useEffect(() => {
        if(!CredentialUtils.getAccessToken()) {
            return RouteUtils.redirectWithReload(NAV_PATH.login);
        }
        const storeId = CredentialUtils.getStoreId();
        if(!storeId) return;
        const currentPath = stLocationPath || "";
        const foundPath = currentPath.search(/^\/affiliate/gi);
        
        if(foundPath < 0) {
            return;
        }

        Promise.all([
            affiliateService.getActiveOrderPackageByStoreId(
                Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP
            ),
            affiliateService.getLastOrderOfStoreAffiliate(
                Constants.AFFILIATE_SERVICE_TYPE.DROP_SHIP
            ),
            affiliateService.getActiveOrderPackageByStoreId(
                Constants.AFFILIATE_SERVICE_TYPE.RESELLER
            ),
            affiliateService.getLastOrderOfStoreAffiliate(
                Constants.AFFILIATE_SERVICE_TYPE.RESELLER
            ),
        ])
            .then(
                ([
                    dropShipActivePackage,
                    dropShipLastPackage,
                    resellerActivePackage,
                    resellerLastPackage,
                ]) => {

                    dispatch(AffiliateContext.actions.setDropShipPackage(dropShipLastPackage));
                    dispatch(AffiliateContext.actions.setDropShipActive(!!dropShipLastPackage));
                    dispatch(AffiliateContext.actions.setDropShipExpired(!!dropShipLastPackage && !dropShipActivePackage));

                    dispatch(AffiliateContext.actions.setResellerPackage(resellerLastPackage));
                    dispatch(AffiliateContext.actions.setResellerActive(!!resellerLastPackage));
                    dispatch(AffiliateContext.actions.setResellerExpired(!!resellerLastPackage && !resellerActivePackage));

                    if(foundPath > -1 && !!dropShipLastPackage && !dropShipActivePackage && !!resellerLastPackage && !resellerActivePackage) {
                        RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateIntro);
                    }
                }
            )
            .catch(() => {
                GSToast.commonError();
            });
    }, []);

    useEffect(() => {
        const currentPath = stLocationPath || "";
        const foundPath = currentPath.search(/^\/affiliate/gi);

        if(foundPath < 0) {
            return;
        }
        
        if (TokenUtils.isHasRole(ROLES.ROLE_GOSELL_STAFF) && !TokenUtils.isAllowForRoute(stLocationPath)) {
            RouteUtils.toNotFound(props)
        } else if (!TokenUtils.hasAnyPackageFeatures([PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE])) {
            RouteUtils.redirectWithoutReload(props, NAV_PATH.affiliateIntro)
        }
    }, [stLocationPath])

    const onClickLeftMenu = () => {
        setIsShowLeftMenu(true);
    };

    const onCloseLeftMenu = () => {
        setIsShowLeftMenu(false);
    };

    return (
        <div className="vh-98 vw-100" style={{ fontSize: "14px" }}>
            <AffiliateContext.provider value={{ state, dispatch }}>
                <UikContainerVertical className="layout-main">
                    <AffiliateHeader onClickLeftMenu={onClickLeftMenu} />
                    <UikContainerHorizontal>
                        {/*DESKTOP*/}
                        <div
                            className={[
                                "layout__navigation-panel d-mobile-none  d-tablet-none d-desktop-exclude-tablet-flex",
                                isCollapsedMenu
                                    ? "layout__navigation-panel--closed"
                                    : "layout__navigation-panel--opened",
                            ].join(" ")}
                        >
                            <AffiliateNavigation active={stNav} hasDropShip={state.dropShipPackage} hasReseller={state.resellerPackage}/>
                        </div>
                        {/*MOBILE*/}
                        {isShowLeftMenu && (
                            <NavigationLeft
                                active={stNav}
                                className="d-mobile-block d-tablet-block d-desktop-exclude-tablet-none nav-left-mobile"
                                onClose={onCloseLeftMenu}
                            />
                        )}

                        <UikContainerVertical
                            className="layout-body"
                            Component={"div"}
                            id={"app-body"}
                            onScroll={this.handleScroll}
                            style={{
                                overflow: "auto",
                            }}
                        >
                            <UikContainerHorizontal>
                                {/* Content Layout in here */}
                                {children}
                            </UikContainerHorizontal>
                        </UikContainerVertical>
                    </UikContainerHorizontal>
                </UikContainerVertical>
                <AlertModal ref={refAlertModal} />
            </AffiliateContext.provider>
        </div>
    );
};


export const AffiliateDashboard = ({component: Component, ...rest}) => {

    return (
        <Route
            {...rest}
            render={(props) => (
                <Affiliate>
                    <Component {...props} {...rest}/>
                </Affiliate>
            )}
        />
    );

};

const LoadingPage = () => {
    return <div className="vh-100 vw-100 d-flex justify-content-center align-items-center">
        <Loading style={LoadingStyle.DUAL_RING_GREY}/>
    </div>
}

const blankLoadingPathList = [
    NAV_PATH.home, NAV_PATH.login, NAV_PATH.staffLogin,
    NAV_PATH.forgot, NAV_PATH.reset,
    NAV_PATH.wizard, NAV_PATH.affiliateNotFound, NAV_PATH.error
]

const ErrorFallback = ({error}) => {
    // Handle failed lazy loading of a JS/CSS chunk.
    useEffect(() => {
        const chunkFailedMessage = /Loading [\w]+ chunk [\d]+ failed/;
        if (error?.message && chunkFailedMessage.test(error.message)) {
            window.location.reload();
        }
        if (error?.message && error.message.includes('Uncaught SyntaxError:') && process.env.NODE_ENV === 'production') {
            window.location.reload();
        }
    }, [error]);

    return (
        <div></div>
    );
}

const AffiliateRoute = (props) => {
    const renderSuspenseFallback = () => {
        const pathName = props.location.pathname || "";
        for (const blankLoadingPath of blankLoadingPathList) {
            if (blankLoadingPath.includes(pathName)) {
                return <LoadingPage/>
            }
        }

        if (CredentialUtils.getAccessToken()) {
            const BlankLoggedIn = Affiliate({children: <BlankContent {...props} nav={localStorage.getItem("nav")}/>})
            return <BlankLoggedIn/>
        }
        return <LoadingPage/>
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={renderSuspenseFallback()}>
                <Switch>
                    <Route path={ NAV_PATH.affiliateNotFound } component={ NotFound }/>
                    <AffiliateDashboard key={NAV_PATH.affiliate}
                                        nav={NAV.affiliate}
                                        exact
                                        path={NAV_PATH.affiliate}
                                        component={AffiliateInfo}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateInfo}
                                        nav={NAV.affiliate.affiliateInfo}
                                        exact
                                        path={NAV_PATH.affiliateInfo}
                                        component={AffiliateInfo}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateIntro}
                                        nav={NAV.affiliate.affiliateIntro}
                                        exact
                                        path={NAV_PATH.affiliateIntro}
                                        component={AffiliateIntro}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliatePartner}
                                        nav={NAV.affiliatePartner}
                                        exact
                                        path={NAV_PATH.affiliatePartner}
                                        component={AffiliatePartner}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliatePartnerCreate}
                                        nav={NAV.affiliatePartner.affiliatePartnerCreate}
                                        exact
                                        path={NAV_PATH.affiliatePartnerCreate}
                                        component={AffiliatePartnerFormEditor}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliatePartnerEdit}
                                        nav={NAV.affiliatePartner.affiliatePartnerEdit}
                                        exact
                                        path={NAV_PATH.affiliatePartnerEdit + "/:partnerId"}
                                        component={AffiliatePartnerFormEditor}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateCommission}
                                        nav={NAV.affiliateCommission}
                                        exact
                                        path={NAV_PATH.affiliateCommission}
                                        component={AffiliateCommission}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateCommissionCreate}
                                        nav={NAV.affiliateCommission.affiliateCommissionCreate}
                                        exact
                                        path={NAV_PATH.affiliateCommissionCreate}
                                        component={AffiliateCommissionFormEditor}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateCommissionEdit}
                                        nav={NAV.affiliateCommission.affiliateCommissionEdit}
                                        exact
                                        path={NAV_PATH.affiliateCommissionEdit + "/:itemId"}
                                        component={AffiliateCommissionFormEditor}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateOrder}
                                        nav={NAV.affiliateOrder}
                                        exact
                                        path={NAV_PATH.affiliateOrder}
                                        component={AffiliateOrder}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateInventory}
                                        nav={NAV.affiliateInventory.affiliateInventory}
                                        exact
                                        path={NAV_PATH.affiliateInventory}
                                        component={AffiliateInventory}
                                        wrapLayout={false}
                    />

                    <AffiliateDashboard key={NAV_PATH.partnerTransferStock}
                                        nav={ NAV.affiliateInventory.affiliateTransferGoods }
                                        exact
                                        path={ NAV_PATH.partnerTransferStock }
                                        component={ PartnerTransferManagement }
                                        // hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.WEB_PACKAGE, PACKAGE_FEATURE_CODES.APP_PACKAGE, PACKAGE_FEATURE_CODES.POS_PACKAGE] }
                    />

                    <AffiliateDashboard key={ NAV_PATH.partnerTransferStockWizard }
                                        nav={ NAV.affiliateInventory.affiliateTransferGoods }
                                        exact
                                        path={ NAV_PATH.partnerTransferStockWizard + '/:transferId' }
                                        component={ AffiliateTransferWizard }
                                        // hasAnyPackageFeature={ [PACKAGE_FEATURE_CODES.POS_PACKAGE] }
                    />

                    <AffiliateDashboard key={ NAV_PATH.partnerTransferStockCreate }
                                        nav={ NAV.affiliateInventory.affiliateTransferGoods }
                                        exact
                                        path={ NAV_PATH.partnerTransferStockCreate }
                                        component={ PartnerTransferFormEditor }
                    />

                    <AffiliateDashboard key={ NAV_PATH.partnerTransferStockEdit }
                                        nav={ NAV.affiliateInventory.affiliateTransferGoods }
                                        exact
                                        path={ NAV_PATH.partnerTransferStockEdit + '/:transferId' }
                                        component={ PartnerTransferFormEditor }
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliatePayout}
                                        nav={NAV.affiliatePayout}
                                        exact
                                        path={NAV_PATH.affiliatePayout}
                                        component={AffiliatePayout}
                    />

                    <AffiliateDashboard key={NAV_PATH.affiliateSetting}
                                        nav={NAV.affiliateSetting}
                                        exact
                                        path={NAV_PATH.affiliateSetting}
                                        component={AffiliateSetting}
                    />

                    <AffiliateDashboard key={NAV_PATH.logout}
                                        nav={NAV.logout}
                                        exact
                                        path={NAV_PATH.logout}
                                        component={Logout}
                    />
                    <Route path={NAV_PATH.affiliate} render={() => (<Redirect to={NAV_PATH.notFound}/>)}/>
                </Switch>
            </Suspense>
        </ErrorBoundary>
    );
};

export default withRouter(AffiliateRoute);

